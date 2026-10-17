/**
 * TickManager — one quarter of life. Pure orchestration over the other core modules.
 *
 * Order of operations per tick (each is a documented formula elsewhere):
 *   1. age += 0.25; economic phase may rotate (Markov chain).
 *   2. Labour: income × phase multiplier × workload − survival cost; shortfall → debt.
 *   3. Entropy: financial (inflation, interest), bio (regen/drain/cap), bandwidth regen, social fade.
 *   4. Stress update (leaky integrator) → Scarcity Trap tax → Rat Race detection.
 *   5. Agency drift; Awakening check (crisis → phase change).
 *   6. Mortality hazard (Gompertz on bio cap) → dead flag.
 */
import type { WorldState, SpawnVector, NpcAgent, EconomicPhase, CapitalDelta } from "../types/index.ts";
import { createRng, type Rng, clamp } from "./Rng.ts";
import { initialCapitals, applyDelta, mergeDeltas, socialSummary } from "./CapitalStore.ts";
import { bioEnergyDelta, bandwidthRegenDelta, financialEntropyDelta, macroShock, socialFadeInPlace, agencyDriftDelta, lifeShock, type LifeShock } from "./EntropyDecay.ts";
import { scarcityTax, ratRace, nextStress, survivalThreshold, type ScarcityReport, type RatRaceReport } from "./ScarcityTrap.ts";
import { awaken, type AwakeningResult } from "../perception/AwakeningMechanic.ts";
import { tierOf } from "../perception/ChoiceFilter.ts";
import { createGraph } from "../gametheory/SocialLedger.ts";

export type WorkPolicy = "standard" | "overtime" | "recover";

export interface TickInput {
  work: WorkPolicy;
  /** CU of new consumer debt taken this tick (0 = none). */
  borrow: number;
  /** CU of debt repaid this tick beyond the mandatory 5 % principal. */
  repay: number;
  /** Set by the runner if a betrayal (sucker's payoff on a meaningful stake) happened this tick. */
  betrayed: boolean;
  /** Awakened-tier choice "live below your means": lifestyle spend ×0.35 this tick. */
  frugal: boolean;
  /** CU price of a leveraged status purchase this tick (house, vehicle, wedding). 0 = none. See purchaseDelta(). */
  purchase: number;
}

/**
 * Leveraged status purchase (the societal script's rat-race entry):
 *   50 % of the price is paid from cash, 50 % is borrowed at the macro interest rate;
 *   the asset books at 85 % of price (transaction costs, immediate depreciation).
 * Debt service on a purchase of 8 quarters' survival at 14 %/yr ≈ (0.035 + 0.05) · 4·survival = 34 % of a
 * subsistence income — one shock away from the 40 % Rat Race line.
 */
export function purchaseDelta(price: number): CapitalDelta {
  if (price <= 0) return {};
  return { liquid: -price * 0.5, debt: price * 0.5, illiquid: price * 0.85 };
}

/**
 * Lifestyle consumption (hedonic creep). The reward system spends a share of every CU above survival:
 *   lifestyle = dopamine · 0.9 · max(0, income − survival)      (×0.35 when frugal)
 * At dopamine 0.8, 72 % of all surplus income is consumed by default — this is the Rat Race treadmill:
 * income rises, savings do not. Only an awakened mind can see the "frugal" choice and switch it off.
 */
export function lifestyleSpend(s: WorldState, income: number, frugal: boolean): number {
  const dop = s.spawn.biology.baseline_dopamine_sensitivity;
  const surplus = Math.max(0, income - s.spawn.macro.survival_cost_quarterly);
  return dop * 0.9 * surplus * (frugal ? 0.35 : 1);
}

export interface TickReport {
  tick: number;
  age: number;
  phase: EconomicPhase;
  macro_label: string | null;
  shock: LifeShock | null;
  income_received: number;
  survival_paid: number;
  scarcity: ScarcityReport;
  rat_race: RatRaceReport;
  awakening: AwakeningResult;
  delta: CapitalDelta;
  died: boolean;
}

export function createWorld(spawn: SpawnVector): { state: WorldState; rng: Rng } {
  const rng = createRng(spawn.seed);
  const graph = createGraph();
  const state: WorldState = {
    spawn,
    tick: 0,
    age: spawn.age_initial,
    capitals: initialCapitals(spawn, graph),
    stress: { value: 25, workload: 1, ticks_in_scarcity: 0 },
    perception: { phase: "autopilot", crises_survived: 0, phase_changed: false, rat_race_ticks: 0, in_rat_race: false, low_agency_streak: 0, relapses: 0, tier_ticks: { autopilot: 0, awakened: 0, sovereign: 0 }, agency_peak: clamp(spawn.agency_initial, 0, 1), agency_start: clamp(spawn.agency_initial, 0, 1) },
    npcs: new Map<string, NpcAgent>(),
    graph,
    economic_phase: spawn.macro.economic_phase,
    dead: false,
  };
  state.perception.phase = state.capitals.agency >= 0.3 ? "phase_change" : "autopilot";
  return { state, rng };
}

/** Quarterly regime transition matrix (rows sum to 1). Mean boom ≈ 6 yrs, stagnation ≈ 4 yrs, crisis ≈ 1.5 yrs. */
const PHASE_TRANSITIONS: Record<EconomicPhase, Array<[EconomicPhase, number]>> = {
  boom:       [["boom", 0.958], ["stagnation", 0.035], ["crisis", 0.007]],
  stagnation: [["stagnation", 0.94], ["boom", 0.04], ["crisis", 0.02]],
  crisis:     [["crisis", 0.83], ["stagnation", 0.15], ["boom", 0.02]],
};

function nextPhase(p: EconomicPhase, rng: Rng): EconomicPhase {
  let r = rng.next();
  for (const [q, pr] of PHASE_TRANSITIONS[p]) { r -= pr; if (r <= 0) return q; }
  return p;
}

/**
 * Gompertz mortality on the *effective* ageing state. Biological age is pushed forward by cap loss:
 *   bioAge = age + 0.6 · (100 − bioCap)
 *   q_quarter = 1 − exp(−(1.6e-5 · e^{0.085·bioAge}))
 * giving q≈0.00013/q at 25, 0.0007 at 45, 0.0026 at 60 for an undamaged body (≈5 % cumulative
 * 18→48, matching a developing-country life table); a 30-point cap loss at 60 roughly quadruples it.
 * Bio-Energy value at 0 is immediate death (acute collapse).
 */
export function mortalityQuarter(age: number, bioCap: number): number {
  const bioAge = age + 0.6 * (100 - bioCap);
  return 1 - Math.exp(-(1.6e-5 * Math.exp(0.085 * bioAge)));
}

export function tick(s: WorldState, input: TickInput, rng: Rng): TickReport {
  s.tick += 1;
  s.age = Math.round((s.age + 0.25) * 4) / 4;
  s.economic_phase = nextPhase(s.economic_phase, rng);

  // Workload policy
  s.stress.workload = input.work === "overtime" ? 1.3 : input.work === "recover" ? 0.8 : 1.0;

  // 2. Labour & survival
  const shock = macroShock(s, rng.next());
  const a = s.capitals.capitalAssets;
  const incomeMult = input.work === "overtime" ? 1.3 : input.work === "recover" ? 0.8 : 1.0;
  const income = a.income_quarterly * shock.income_multiplier * incomeMult;
  const survival = s.spawn.macro.survival_cost_quarterly + lifestyleSpend(s, income, input.frugal);
  const mandatoryPrincipal = a.debt * 0.05;
  const labour: CapitalDelta = {
    liquid: income - survival + input.borrow - mandatoryPrincipal - input.repay,
    debt: input.borrow - mandatoryPrincipal - input.repay,
    illiquid: a.illiquid * (shock.asset_multiplier - 1),
  };
  // Income growth: experience +0.4 %/q until 50, then flat; boom +0.5 %/q; crisis shock −5 % permanent on job loss.
  let growth = s.age < 50 ? 1.004 : 1.0;
  if (s.economic_phase === "boom") growth *= 1.005;
  if (shock.label === "job_loss_shock") growth *= 0.95;
  s.capitals.capitalAssets.income_quarterly = a.income_quarterly * growth;

  // 3. Entropy + idiosyncratic shock
  const fin = financialEntropyDelta(s);
  const shk = lifeShock(s, rng.next(), rng.next());
  const shockDelta: CapitalDelta = shk ? { liquid: shk.liquid, bio: shk.bio, bandwidth: shk.bandwidth } : {};
  const bio = bioEnergyDelta(s);
  const bw = bandwidthRegenDelta(s);
  socialFadeInPlace(s);

  // 4. Stress → scarcity → rat race (stress uses pre-commit liquidity; order matters and is intentional:
  //    this quarter's anxiety is about last quarter's bank balance).
  s.stress.value = nextStress(s);
  const scarcity = scarcityTax(s);
  const agency = agencyDriftDelta(s);

  let delta = mergeDeltas(labour, fin, shockDelta, purchaseDelta(input.purchase), bio, bw, { bandwidth: -scarcity.bandwidth_tax }, agency);
  s.capitals = applyDelta(s.capitals, delta);

  // Settle: negative liquid becomes debt (overdraft / informal lending at the macro rate).
  let overdraft = 0;
  if (s.capitals.capitalAssets.liquid < 0) {
    const shortfall = -s.capitals.capitalAssets.liquid;
    overdraft = shortfall;
    s.capitals.capitalAssets.debt += shortfall;
    s.capitals.capitalAssets.liquid = 0;
    delta = mergeDeltas(delta, { debt: shortfall, liquid: shortfall });
  }

  const thr = survivalThreshold(s);
  s.stress.ticks_in_scarcity = s.capitals.capitalAssets.liquid < thr ? s.stress.ticks_in_scarcity + 1 : 0;
  const rr = ratRace(s);
  s.perception.in_rat_race = rr.active;
  if (rr.active) s.perception.rat_race_ticks += 1;

  s.capitals.socialLedger = socialSummary(s.graph);

  // 5. Awakening
  const awakening = awaken(s, { betrayal: input.betrayed, job_loss: shock.label === "job_loss_shock", overdraft }, rng);

  // Tier bookkeeping for the endgame
  s.perception.tier_ticks[tierOf(s)] += 1;
  s.perception.agency_peak = Math.max(s.perception.agency_peak, s.capitals.agency);

  // 6. Mortality
  const q = mortalityQuarter(s.age, s.capitals.bioEnergy.cap);
  if (s.capitals.bioEnergy.value <= 0 || rng.chance(q)) s.dead = true;
  if (s.dead) s.perception.phase = "topology_endgame";

  return {
    tick: s.tick, age: s.age, phase: s.economic_phase, macro_label: shock.label, shock: shk,
    income_received: income, survival_paid: survival,
    scarcity, rat_race: rr, awakening, delta, died: s.dead,
  };
}

export { clamp };
