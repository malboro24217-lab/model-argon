/**
 * Entropy & depreciation of the five capitals (spec §2, "Quy luật khấu hao").
 * All functions are pure: they return a CapitalDelta; CapitalStore.apply() commits it.
 * Time unit: one tick = one quarter.
 */
import type { WorldState, CapitalDelta } from "../types/index.ts";
import { clamp } from "./Rng.ts";

export const TICKS_PER_YEAR = 4;

/* ------------------------------------------------------------------ Bio-Energy */

/**
 * Permanent Max-Cap loss per quarter from ageing. Zero before 30; then a power law:
 *   capLoss(age) = 0.045 · ((age − 30) / 10)^1.3   [points / quarter]
 * ⇒ cumulative loss ≈ 0.9 pt by 40, 4.4 by 50, 11.6 by 60, 23.5 by 70, 41 by 80.
 */
export function ageingCapLoss(age: number): number {
  if (age <= 30) return 0;
  return 0.045 * Math.pow((age - 30) / 10, 1.3);
}

/**
 * Permanent cap loss from stress above the cortisol threshold (allostatic load).
 *   loss = 0.02 · (stress − threshold) / 10 per quarter, only when stress > threshold.
 * Overwork (workload > 1.25) adds 0.05 per quarter on top, representing sleep debt.
 * Chronic genetics ("cardiometabolic", "autoimmune") multiply the whole term by 1.35.
 */
export function stressCapLoss(stress: number, threshold: number, workload: number, chronic: readonly string[]): number {
  let loss = 0;
  if (stress > threshold) loss += 0.02 * (stress - threshold) / 10;
  if (workload > 1.25) loss += 0.05 * (workload - 1.25) / 0.25;
  const chronicMult = chronic.some((g) => g === "cardiometabolic" || g === "autoimmune") ? 1.35 : 1;
  return loss * chronicMult;
}

/**
 * Bio-Energy value dynamics per quarter:
 *   regen  = metabolism · 0.25 · (0.85·cap − value)          (homeostasis toward 85 % of cap)
 *   drain  = 4·max(0, workload − 1) + 0.06·stress            (overtime and stress burn energy)
 *   plus an age term: −0.15 per quarter after 45.
 */
export function bioEnergyDelta(s: WorldState): CapitalDelta {
  const g = s.capitals.bioEnergy;
  const bio = s.spawn.biology;
  const regen = bio.base_metabolism * 0.25 * (0.85 * g.cap - g.value);
  const drain = 4 * Math.max(0, s.stress.workload - 1) + 0.06 * s.stress.value + (s.age > 45 ? 0.15 : 0);
  const capLoss = ageingCapLoss(s.age) + stressCapLoss(s.stress.value, bio.cortisol_threshold, s.stress.workload, bio.chronic_genetics);
  return { bio: regen - drain, bio_cap: -capLoss };
}

/* ------------------------------------------------------------ Cognitive Bandwidth */

/**
 * Bandwidth regenerates half the gap to its cap each quarter (sleep, routine),
 * but an exhausted body thinks poorly: if Bio < 30 % of cap, regen is halved
 * ("Bio-Energy < 30 % locks heavy-load behaviours").
 * The Scarcity Trap subtracts its tax separately (ScarcityTrap.ts).
 */
export function bandwidthRegenDelta(s: WorldState): CapitalDelta {
  const g = s.capitals.cognitiveBandwidth;
  const bioRatio = s.capitals.bioEnergy.value / Math.max(1, s.capitals.bioEnergy.cap);
  const regen = 0.5 * (g.cap - g.value) * (bioRatio < 0.3 ? 0.5 : 1);
  // Chronic heavy overwork grinds the ceiling itself: burnout is permanent.
  const burnout = s.stress.workload > 1.4 && s.stress.value > 80 ? 0.1 : 0;
  return { bandwidth: regen, bandwidth_cap: -burnout };
}

/* ----------------------------------------------------------------- Capital Assets */

export interface MacroShock {
  /** Multiplier on liquid+illiquid this quarter from the economic cycle (1 = none). */
  asset_multiplier: number;
  /** Multiplier on labour income this quarter. */
  income_multiplier: number;
  label: string | null;
}

/**
 * Quarterly macro: inflation erodes liquid cash, interest compounds debt, and the
 * economic phase moves income and asset prices.
 *   boom:        assets +1.5 %/q, income +0.5 %/q
 *   stagnation:  assets  0 %,     income  0 %
 *   crisis:      assets −4 %/q,   income −3 %/q, and a 6 %/q chance of a job-loss shock (income ×0.4 for the tick)
 */
export function macroShock(s: WorldState, roll: number): MacroShock {
  switch (s.economic_phase) {
    case "boom":       return { asset_multiplier: 1.015, income_multiplier: 1.005, label: null };
    case "stagnation": return { asset_multiplier: 1.0,   income_multiplier: 1.0,   label: null };
    case "crisis": {
      const jobShock = roll < 0.06;
      return { asset_multiplier: 0.96, income_multiplier: jobShock ? 0.4 : 0.97, label: jobShock ? "job_loss_shock" : null };
    }
  }
}

/**
 * Debt interest for one quarter, plus the inflation tax on idle cash.
 * Returns the delta to commit (positive debt = more debt; negative liquid = erosion).
 */
export function financialEntropyDelta(s: WorldState): CapitalDelta {
  const a = s.capitals.capitalAssets;
  const m = s.spawn.macro;
  const qInterest = m.interest_rate / TICKS_PER_YEAR;
  const qInflation = m.inflation_rate / TICKS_PER_YEAR;
  return {
    debt: a.debt * qInterest,
    liquid: -Math.max(0, a.liquid) * qInflation,
  };
}

/* ------------------------------------------------------------------ Life shocks */

export interface LifeShock {
  kind: "health" | "family_obligation" | "windfall";
  liquid: number;   // signed CU
  bio: number;
  bandwidth: number;
}

/**
 * Idiosyncratic shocks per quarter (independent of the macro phase):
 *   health:   p = 0.010 + 0.0006·max(0, age−30) + 0.020·[bio < 40 % cap] + 0.010·|chronic_genetics|
 *             cost = survival · (1 + 2u) · (1.2 − 0.6·institutional_trust)   (out-of-pocket share
 *             falls with institutional quality), bio −10, bandwidth −10.
 *   family:   p = 0.020; cost = survival · (0.5 + u). A relative's wedding, funeral, debt, dowry.
 *   windfall: p = 0.010; gain = survival · (1 + 2u). Bonus, inheritance, a debt repaid.
 * At most one shock per tick (first that fires in the order above).
 */
export function lifeShock(s: WorldState, u1: number, u2: number): LifeShock | null {
  const surv = s.spawn.macro.survival_cost_quarterly;
  const bioRatio = s.capitals.bioEnergy.value / Math.max(1, s.capitals.bioEnergy.cap);
  const pHealth = 0.010 + 0.0006 * Math.max(0, s.age - 30) + (bioRatio < 0.4 ? 0.02 : 0) + 0.01 * s.spawn.biology.chronic_genetics.length;
  if (u1 < pHealth) {
    const oop = 1.2 - 0.6 * s.spawn.macro.institutional_trust;
    return { kind: "health", liquid: -surv * (1 + 2 * u2) * oop, bio: -10, bandwidth: -10 };
  }
  if (u1 < pHealth + 0.02) return { kind: "family_obligation", liquid: -surv * (0.5 + u2), bio: 0, bandwidth: -3 };
  if (u1 < pHealth + 0.03) return { kind: "windfall", liquid: surv * (1 + 2 * u2), bio: 0, bandwidth: 0 };
  return null;
}

/* ------------------------------------------------------------------ Social Ledger */

/**
 * Trust edges fade toward zero when there is no interaction:
 *   trust ← trust · (1 − 0.02)^(quarters since last interaction, capped at 1 per tick)
 * Severed edges never fade (a betrayal is remembered forever). Returns nothing; mutates the graph
 * because edges are a Map and this is the one place that owns their decay.
 */
export function socialFadeInPlace(s: WorldState): void {
  for (const e of s.graph.edges.values()) {
    if (e.severed) continue;
    const idle = s.tick - e.last_interaction_tick;
    if (idle >= 2) e.trust *= 0.98;
    if (Math.abs(e.trust) < 0.005) e.trust = 0;
  }
}

/* ----------------------------------------------------------------------- Agency */

/**
 * Bistable agency dynamics. Normative pressure pulls toward the script; reflection is self-reinforcing
 * but saturates (insight compounds, then plateaus):
 *   pull       = −0.0047 · (1 − A) · (1 + 0.8·dopamine) · (1 + 0.015·max(0, age − 25)), floored at the spawn level A₀
 *                (the script hardens with age: at 48 the pull is ×1.35, at 70 ×1.68 — late awakenings are rarer and harder to hold)
 *   reflection = +0.060 · A · max(0, 0.82 − A) · clamp((bandwidth − 40)/60, 0, 1)   and 0 while in_rat_race
 * For dopamine 0.8 and full bandwidth: A·(0.8−A) = 0.128·(1−A) ⇒ A* ≈ 0.17 (unstable) and A* ≈ 0.76 (stable);
 * at bandwidth 80 (factor 0.67) the basin is 0.30–0.70; at bandwidth 70 it is 0.37–0.63; below ~64 it vanishes.
 * At bandwidth 85 the basin narrows to 0.45–0.64; below ~80 there is no attractor and agency decays.
 * Crisis jumps max out near 0.18, so reaching the basin from 0.12 needs two crises within a few years, or one
 * crisis survived with an unusually free mind. Landing above ~0.35 with free bandwidth climbs toward 0.69
 * (sustained Sovereign);
 * one that lands below it, or into scarcity (no reflection), decays back to the script and relapses.
 * Low dopamine lowers the unstable point and raises the attractor past 0.7 (Meta-View); high dopamine does
 * the reverse. This is where "awakening must be defended" lives.
 */
export function agencyDriftDelta(s: WorldState): CapitalDelta {
  const A = s.capitals.agency;
  const dop = s.spawn.biology.baseline_dopamine_sensitivity;
  const A0 = s.perception.agency_start;
  let d = -0.0047 * (1 - A) * (1 + 0.8 * dop) * (1 + 0.015 * Math.max(0, s.age - 25));
  const bw = s.capitals.cognitiveBandwidth.value;
  if (!s.perception.in_rat_race) d += 0.060 * A * Math.max(0, 0.82 - A) * clamp((bw - 40) / 60, 0, 1);
  d = clamp(d, -0.02, 0.02);
  if (A + d < A0) d = A0 - A;
  return { agency: d };
}
