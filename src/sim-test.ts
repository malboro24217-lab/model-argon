/**
 * Headless simulation & verification runner.
 *   node --experimental-strip-types src/sim-test.ts            → one annotated life, 120 ticks
 *   node --experimental-strip-types src/sim-test.ts --montecarlo 400 → distribution over seeds
 *
 * The player is a heuristic agent that can only act on choices the ChoiceFilter makes visible —
 * so an Autopilot character literally cannot do due diligence, and a bandwidth-locked one cannot negotiate.
 */
import {
  createWorld, tick, snapshot, makeNpc, addNpcToGraph, connectNpcs, resolveInteraction,
  dealChoices, tickChoices, tierOf, beliefAbout, predictedCoopProb, expectedCapital, survivalThreshold,
  type SpawnVector, type WorldState, type NpcAgent, type Archetype, type Rng, type TickInput, type Move,
  type ResolvedInteraction, type Choice, ALL_ARCHETYPES, lifeTopology,
} from "./engine/index.ts";

/* ------------------------------------------------------------------ Spawn */

export function referenceSpawn(seed: number): SpawnVector {
  return {
    macro: {
      country_iso: "VN",
      institutional_trust: 0.45,
      social_mobility_idx: 0.5,
      economic_phase: "stagnation",
      inflation_rate: 0.045,
      interest_rate: 0.14,          // informal / consumer credit in a developing economy
      survival_cost_quarterly: 25,
    },
    bloodline: {
      economic_net_worth: 120,      // ≈ 1.2 years of survival cost: a modest family
      cultural_capital: ["literate_household", "religious_network"],
      social_network_nodes: 3,      // moderate family social capital
      debt_inherited: 20,
    },
    biology: {
      baseline_dopamine_sensitivity: 0.8,   // high
      cortisol_threshold: 62,
      chronic_genetics: [],
      base_metabolism: 1.0,
    },
    agency_initial: 0.12,
    age_initial: 18,
    seed,
  };
}

/* ------------------------------------------------------------------ NPC pool */

const NAMES = ["Minh", "Lan", "Hùng", "Thảo", "Khoa", "Ngọc", "Long", "Trang", "Phúc", "Hà", "Tuấn", "Mai", "Đức", "Linh", "Nam"];
const POOL: Archetype[] = [
  "tit_for_tat", "tit_for_tat", "tit_for_tat", "tit_for_tat",
  "generous_tit_for_tat", "generous_tit_for_tat", "generous_tit_for_tat",
  "grudger", "grudger", "grudger",
  "opportunist", "opportunist", "opportunist",
  "always_defect", "always_defect",
];

function seedNpcs(s: WorldState, rng: Rng): void {
  const ids: string[] = [];
  POOL.forEach((arch, i) => {
    const npc = makeNpc(`npc${i}`, NAMES[i] ?? `N${i}`, arch, rng, 150 + rng.next() * 400);
    s.npcs.set(npc.id, npc);
    // Family-referred nodes start with a little trust; influence (weight) is random.
    const referred = i < s.spawn.bloodline.social_network_nodes;
    addNpcToGraph(s.graph, npc, 0.2 + 0.7 * rng.next(), 0, referred ? 0.3 : 0);
    ids.push(npc.id);
  });
  // Social circles: each NPC trusts ~3 random others. Gossip travels along these.
  for (const a of ids) for (let k = 0; k < 3; k++) {
    const b = rng.pick(ids);
    if (a !== b) connectNpcs(s.graph, a, b, 0.3 + 0.5 * rng.next(), 0);
  }
}

/* ------------------------------------------------------------------ Player heuristic */

interface Memory { dd_total: Map<string, number>; }

function chooseWork(s: WorldState): TickInput["work"] {
  const vis = tickChoices(s).map((c) => c.id);
  const bioRatio = s.capitals.bioEnergy.value / s.capitals.bioEnergy.cap;
  if (vis.includes("rest_recover") && (bioRatio < 0.45 || s.stress.value > 75)) return "recover";
  const thr = survivalThreshold(s);
  // Autopilot script: when cash is short, work harder (and burn out). Awakened agents prefer deleveraging.
  if (s.capitals.capitalAssets.liquid < thr && !vis.includes("deleverage")) return "overtime";
  return "standard";
}

function chooseFinance(s: WorldState, bought: { done: boolean }): { borrow: number; repay: number; frugal: boolean; purchase: number } {
  const vis = tickChoices(s).map((c) => c.id);
  const a = s.capitals.capitalAssets, thr = survivalThreshold(s);
  const surv = s.spawn.macro.survival_cost_quarterly;
  // The script: once you have a little cash and are of age, you buy the house. Autopilot does it at 3× the
  // survival threshold in the bank; an awakened agent waits for zero debt and 12× (and sovereign agents buy only
  // when the debt service would stay under 15 % of income).
  let purchase = 0;
  if (!bought.done && vis.includes("buy_status_asset") && s.age >= 22) {
    const price = 8 * surv * (s.age >= 28 ? 1.5 : 1);
    const awakened = vis.includes("deleverage");
    const dsr = (price * 0.5) * (s.spawn.macro.interest_rate / 4 + 0.05) / a.income_quarterly;
    const ok = !awakened ? a.liquid >= 3 * thr : (a.debt === 0 && a.liquid >= 12 * thr && (tierOf(s) !== "sovereign" || dsr < 0.15));
    if (ok) { purchase = price; bought.done = true; }
  }
  // Awakened: live below means while there is debt or thin cash. Autopilot cannot see this choice.
  const frugal = vis.includes("live_below_means") && (a.debt > 0 || a.liquid < thr * 4);
  // Autopilot: borrow to cover scarcity (the trap). Awakened: deleverage when liquid is comfortable.
  if (a.liquid < thr * 0.5 && vis.includes("take_consumer_loan") && !vis.includes("deleverage")) return { borrow: thr, repay: 0, frugal, purchase };
  if (vis.includes("deleverage") && a.debt > 0 && a.liquid > thr * 2) return { borrow: 0, repay: Math.min(a.debt, (a.liquid - thr * 2) * 0.5), frugal, purchase };
  return { borrow: 0, repay: 0, frugal, purchase };
}

/** Expected further rounds with this NPC over the remaining horizon (deal rate × ticks left / pool size). */
function expectedFutureRounds(s: WorldState, ticksLeft: number): number {
  return DEAL_RATE * (0.4 + 0.6 * s.capitals.socialLedger.reputation / 100) * ticksLeft / s.npcs.size;
}
const DEAL_RATE = 0.22;

interface DealDecision { move: Move | null; dd: number; signal: number; stake: number; chosen: Choice["id"]; }

function chooseDeal(s: WorldState, npc: NpcAgent, stake: number, mem: Memory, rng: Rng, ticksLeft: number): DealDecision {
  const ddTotal = mem.dd_total.get(npc.id) ?? 0;
  const { choices, info } = dealChoices(s, npc, stake, ddTotal);
  const has = (id: Choice["id"]) => choices.some((c) => c.id === id);
  let dd = 0;
  // Awakened+ : do diligence if we can afford it (keeps ≥ 20 bw after) and this NPC is still foggy.
  if (has("due_diligence")) {
    const bw = s.capitals.cognitiveBandwidth.value;
    const belief = beliefAbout(npc, ddTotal);
    const maxBelief = Math.max(...ALL_ARCHETYPES.map((a) => belief[a]));
    if (bw - 40 >= 20 && maxBelief < 0.7) dd = 40; // > 35 threshold → breach detection possible
  }
  const belief = beliefAbout(npc, ddTotal + dd);
  const pCoop = predictedCoopProb(npc, belief);
  const ctx = { stake: stake * s.capitals.socialLedger.transaction_cost_multiplier, institutional_trust: s.spawn.macro.institutional_trust };

  if (info.tier === "autopilot") {
    // Script: trust by default, unless this exact person already burned us.
    const burned = npc.history.some((h) => h.npcMove === "defect");
    return burned ? { move: null, dd: 0, signal: 0, stake, chosen: "deal_decline" } : { move: "cooperate", dd: 0, signal: 0, stake, chosen: "deal_cooperate_blind" };
  }
  if (has("deal_arbitrage")) {
    // Meta-View sees the repeated game, not the one-shot cell. Defecting on a reciprocal partner
    // forfeits the cooperative surplus on every expected future round with them (shadow of the future)
    // plus a reputation ripple that costs ~10 % of deal flow for the rest of the horizon.
    // Reputation is capital: an exploitation costs ≈ 8 reputation points (direct −0.8 edge + ripples), and each
    // point is worth 0.6 % of all future deal flow; a typical future deal yields 0.25·stake. Gossip also makes
    // reciprocal strangers open with defect, which the agent can only dodge via arbitrage (0 gain).
    const pRecip = belief.tit_for_tat + belief.generous_tit_for_tat + belief.grudger;
    const future = expectedFutureRounds(s, ticksLeft);
    const futureDealsAll = DEAL_RATE * (0.4 + 0.6 * s.capitals.socialLedger.reputation / 100) * ticksLeft;
    const repCost = 8 * 0.006 * futureDealsAll * 0.25 * ctx.stake + 0.3 * futureDealsAll * 0.25 * ctx.stake * pRecip;
    const shadow = pRecip * future * 0.25 * ctx.stake * 0.9 + repCost;
    const evs: Array<[Move, number]> = (["cooperate", "defect", "arbitrage"] as Move[]).map((m) => [m, expectedCapital(m, pCoop, ctx) - (m === "defect" ? shadow : 0)]);
    evs.sort((x, y) => y[1] - x[1]);
    const best = evs[0]!;
    // Sovereign: never take the sucker risk below 55 % confidence; arbitrage dominates there.
    const move: Move = pCoop < 0.55 ? "arbitrage" : best[0];
    if (pCoop < 0.25 && has("walk_away_better_alt")) return { move: null, dd, signal: 0, stake, chosen: "walk_away_better_alt" };
    return { move, dd, signal: 0, stake, chosen: move === "arbitrage" ? "deal_arbitrage" : move === "defect" ? "deal_defect" : "deal_cooperate_blind" };
  }
  // Awakened: negotiate the stake down when unsure, cooperate if P(coop) ≥ 0.6, defect if clearly hostile, else decline.
  let st = stake;
  let chosen: Choice["id"] = "deal_cooperate_blind";
  if (has("negotiate_terms") && pCoop < 0.75) { st = stake * 0.5; chosen = "negotiate_terms"; }
  if (pCoop >= 0.6) return { move: "cooperate", dd, signal: 0, stake: st, chosen };
  if (pCoop < 0.3 && has("deal_defect")) return { move: "defect", dd, signal: 0, stake: st, chosen: "deal_defect" };
  return { move: null, dd, signal: 0, stake: st, chosen: "deal_decline" };
}

/* ------------------------------------------------------------------ One life */

export interface LifeSummary {
  seed: number; ticks: number; died: boolean; final: WorldState;
  deals: number; cells: Record<string, number>; breaches: number; exploited_by_arch: Record<string, number>; suckered_by_arch: Record<string, number>;
  scarcity_ticks: number; rat_race_ticks: number; phase_changes: number; awakened_tick: number | null; sovereign_tick: number | null;
  net_capital: number; peak_debt: number;
}

export function runLife(seed: number, ticks: number, verbose: boolean): LifeSummary {
  const spawn = referenceSpawn(seed);
  const { state: s, rng } = createWorld(spawn);
  seedNpcs(s, rng);
  const mem: Memory = { dd_total: new Map() };
  const bought = { done: false };
  const npcStart = new Map([...s.npcs.values()].map((n) => [n.id, n.liquid]));
  const sum: LifeSummary = { seed, ticks: 0, died: false, final: s, deals: 0, cells: {}, breaches: 0, exploited_by_arch: {}, suckered_by_arch: {}, scarcity_ticks: 0, rat_race_ticks: 0, phase_changes: 0, awakened_tick: null, sovereign_tick: null, net_capital: 0, peak_debt: 0 };
  const say = (m: string) => { if (verbose) console.log(m); };

  say(`\n=== MODEL ARGON · seed ${seed} · ${spawn.macro.country_iso} · net worth ${spawn.bloodline.economic_net_worth} CU · dopamine ${spawn.biology.baseline_dopamine_sensitivity} · agency₀ ${spawn.agency_initial}`);
  say(`t0  ${snapshot(s)}`);

  for (let t = 1; t <= ticks && !s.dead; t++) {
    let betrayed = false;
    // Deal flow: base 22 %/quarter, scaled by reputation (0.4 + 0.6·rep/100) — nobody proposes a venture
    // to a known defector. Stake is proportional to means: U(10 %, 35 %) of max(liquid, 2 quarters' income),
    // so a sucker's payoff can cost up to 20 % of cash and a win-win can build real equity.
    let dealLine = "";
    const repNow = s.capitals.socialLedger.reputation;
    if (rng.chance(DEAL_RATE * (0.4 + 0.6 * repNow / 100))) {
      const npc = rng.pick([...s.npcs.values()]);
      const a0 = s.capitals.capitalAssets;
      const liquidBefore = a0.liquid;
      const stake = Math.max(15, (0.10 + 0.25 * rng.next()) * Math.max(a0.liquid, 2 * a0.income_quarterly));
      const d = chooseDeal(s, npc, stake, mem, rng, ticks - t);
      if (d.dd > 0) mem.dd_total.set(npc.id, (mem.dd_total.get(npc.id) ?? 0) + d.dd);
      if (d.move) {
        const r: ResolvedInteraction = resolveInteraction(s, npc, { npc_id: npc.id, move: d.move, stake: d.stake, due_diligence_spent: d.dd, costly_signal_spent: d.signal }, rng);
        sum.deals++; sum.cells[r.outcome.cell] = (sum.cells[r.outcome.cell] ?? 0) + 1;
        if (r.outcome.breach_detected) sum.breaches++;
        if (r.outcome.cell === "exploitation") sum.exploited_by_arch[npc.true_archetype] = (sum.exploited_by_arch[npc.true_archetype] ?? 0) + 1;
        if (r.outcome.cell === "sucker") sum.suckered_by_arch[npc.true_archetype] = (sum.suckered_by_arch[npc.true_archetype] ?? 0) + 1;
        // A betrayal is a crisis only when it is large relative to the character: ≥ 2 quarters of income or ≥ 30 % of cash.
        const loss = -r.outcome.payoffA.capital;
        if (r.outcome.cell === "sucker" && (loss >= 2 * a0.income_quarterly || loss >= 0.3 * Math.max(1, liquidBefore))) betrayed = true;
        const ripple = r.propagation.ripples.length ? ` ripple→${r.propagation.ripples.map((x) => `${s.npcs.get(x.npc)?.name}${x.delta >= 0 ? "+" : ""}${x.delta.toFixed(2)}`).join(",")}` : "";
        dealLine = ` | DEAL ${npc.name}(${npc.true_archetype}) stake ${r.stake_effective.toFixed(0)} dd ${d.dd} you=${r.outcome.playerMove} npc=${r.outcome.npcMove} → ${r.outcome.cell.toUpperCase()} Δcap ${r.outcome.payoffA.capital >= 0 ? "+" : ""}${r.outcome.payoffA.capital.toFixed(0)}${r.outcome.breach_detected ? " [BREACH DETECTED]" : ""}${r.outcome.nash_equilibrium ? " (Nash)" : ""} rep→${s.capitals.socialLedger.reputation.toFixed(0)}${ripple}`;
      } else {
        dealLine = ` | DEAL ${npc.name}(${npc.true_archetype}) → ${d.chosen}${d.dd ? ` (dd ${d.dd})` : ""}`;
      }
    }
    const work = chooseWork(s);
    const fin = chooseFinance(s, bought);
    const rep = tick(s, { work, borrow: fin.borrow, repay: fin.repay, betrayed, frugal: fin.frugal, purchase: fin.purchase }, rng);
    sum.ticks = t;
    if (rep.scarcity.triggered) sum.scarcity_ticks++;
    if (rep.rat_race.active) sum.rat_race_ticks++;
    if (rep.awakening.phase_change) sum.phase_changes++;
    const tier = tierOf(s);
    if (sum.awakened_tick === null && tier !== "autopilot") sum.awakened_tick = t;
    if (sum.sovereign_tick === null && tier === "sovereign") sum.sovereign_tick = t;
    sum.peak_debt = Math.max(sum.peak_debt, s.capitals.capitalAssets.debt);

    const flags: string[] = [];
    if (rep.scarcity.triggered) flags.push(`SCARCITY(${rep.scarcity.reason}, −${rep.scarcity.bandwidth_tax.toFixed(0)}bw${rep.scarcity.locked ? ", LOCKED" : ""})`);
    if (rep.rat_race.active) flags.push(`RAT RACE(${rep.rat_race.reason}, dsr ${isFinite(rep.rat_race.debt_service_ratio) ? rep.rat_race.debt_service_ratio.toFixed(2) : "∞"})`);
    if (rep.macro_label) flags.push(rep.macro_label.toUpperCase());
    if (rep.shock) flags.push(`SHOCK:${rep.shock.kind} ${rep.shock.liquid >= 0 ? "+" : ""}${rep.shock.liquid.toFixed(0)}`);
    if (rep.awakening.crisis) flags.push(`CRISIS:${rep.awakening.crisis}`);
    if (rep.awakening.relapse) flags.push("↓ RELAPSE → autopilot");
    if (rep.awakening.phase_change) flags.push(`★ PHASE CHANGE +${rep.awakening.agency_jump.toFixed(2)} agency → ${rep.awakening.phase_after}`);
    if (rep.awakening.phase_before !== rep.awakening.phase_after && !rep.awakening.phase_change) flags.push(`→ ${rep.awakening.phase_after}`);
    if (fin.borrow) flags.push(`borrow ${fin.borrow.toFixed(0)}`);
    if (fin.repay) flags.push(`repay ${fin.repay.toFixed(0)}`);
    if (fin.frugal) flags.push("frugal");
    if (fin.purchase) flags.push(`BUY status asset ${fin.purchase.toFixed(0)} (50 % financed)`);
    if (rep.died) flags.push("† DIED");
    const yearly = t % 4 === 0;
    if (yearly || flags.length || dealLine) say(`t${String(t).padStart(3)} ${snapshot(s)} work=${work}${flags.length ? " | " + flags.join(" ") : ""}${dealLine}`);
  }
  sum.died = s.dead;
  const a = s.capitals.capitalAssets;
  sum.net_capital = a.liquid + a.illiquid * 0.8 - a.debt;
  if (verbose) {
    const T = lifeTopology(s, npcStart);
    say(`\n=== LIFE TOPOLOGY · quadrant: ${T.quadrant.toUpperCase()}`);
    say(`  surplus: net ${T.surplus.net_systemic_surplus.toFixed(0)} CU (player ${T.surplus.player_capital_from_deals.toFixed(0)} + others ${T.surplus.npc_capital_from_deals.toFixed(0)}) of ${T.surplus.potential_surplus.toFixed(0)} possible → ${(100 * T.surplus.realisation_ratio).toFixed(0)} % realised; destroyed ${T.surplus.capital_destroyed.toFixed(0)}; cells ${JSON.stringify(T.surplus.cells)}`);
    say(`  sovereignty: agency ${T.sovereignty.agency_start.toFixed(2)} → peak ${T.sovereignty.agency_peak.toFixed(2)} → end ${T.sovereignty.agency_end.toFixed(2)} | autopilot ${T.sovereignty.ticks_autopilot}q · awakened ${T.sovereignty.ticks_awakened}q · sovereign ${T.sovereignty.ticks_sovereign}q (${(100 * T.sovereignty.sovereign_share).toFixed(0)} %) · rat race ${T.sovereignty.ticks_rat_race}q · crises ${T.sovereignty.crises_survived} · relapses ${T.sovereignty.relapses}`);
    say(`  ripple: rep ${T.ripple.reputation_final.toFixed(0)} · allies ${T.ripple.allies} · enemies ${T.ripple.enemies} · severed ${T.ripple.severed_edges} · turned hostile ${T.ripple.npcs_shifted_hostile} · turned cooperative ${T.ripple.npcs_shifted_cooperative} · bankrupt ${T.ripple.npcs_bankrupt} · prospered ${T.ripple.npcs_prospered} · reached only by gossip ${T.ripple.npcs_reached_only_by_ripple}`);
  }
  return sum;
}

/* ------------------------------------------------------------------ Analysis */

function summarize(x: LifeSummary): string {
  const s = x.final, c = s.capitals, a = c.capitalAssets;
  const win = Object.entries(x.cells).map(([k, v]) => `${k}:${v}`).join(" ");
  return [
    `--- SUMMARY seed ${x.seed}: ${x.died ? `died at ${s.age}` : `alive at ${s.age}`} after ${x.ticks} ticks`,
    `  capitals: bio ${c.bioEnergy.value.toFixed(0)}/${c.bioEnergy.cap.toFixed(0)}  bw ${c.cognitiveBandwidth.value.toFixed(0)}/${c.cognitiveBandwidth.cap.toFixed(0)}  liquid ${a.liquid.toFixed(0)}  illiquid ${a.illiquid.toFixed(0)}  debt ${a.debt.toFixed(0)} (peak ${x.peak_debt.toFixed(0)})  net ${x.net_capital.toFixed(0)}  rep ${c.socialLedger.reputation.toFixed(0)}  allies ${c.socialLedger.alliances}  agency ${c.agency.toFixed(2)}`,
    `  deals ${x.deals} [${win}]  breaches detected ${x.breaches}`,
    `  scarcity ticks ${x.scarcity_ticks}  rat-race ticks ${x.rat_race_ticks}  phase changes ${x.phase_changes}  awakened at tick ${x.awakened_tick ?? "never"}  sovereign at tick ${x.sovereign_tick ?? "never"}  final phase ${s.perception.phase}`,
  ].join("\n");
}

function pct(arr: number[], p: number): number { const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))] ?? 0; }
const mean = (arr: number[]) => arr.reduce((x, y) => x + y, 0) / Math.max(1, arr.length);

function monteCarlo(n: number, ticks: number): void {
  const runs: LifeSummary[] = [];
  for (let i = 0; i < n; i++) runs.push(runLife(1000 + i * 7919, ticks, false));
  const f = (g: (r: LifeSummary) => number) => runs.map(g);
  const line = (label: string, v: number[], fmt = (x: number) => x.toFixed(1)) => console.log(`  ${label.padEnd(26)} mean ${fmt(mean(v)).padStart(8)}  p10 ${fmt(pct(v, .1)).padStart(8)}  p50 ${fmt(pct(v, .5)).padStart(8)}  p90 ${fmt(pct(v, .9)).padStart(8)}`);
  console.log(`\n=== MONTE CARLO · ${n} lives · ${ticks} ticks (age 18 → ${18 + ticks / 4}) ===`);
  line("net capital (CU)", f((r) => r.net_capital));
  line("liquid (CU)", f((r) => r.final.capitals.capitalAssets.liquid));
  line("debt (CU)", f((r) => r.final.capitals.capitalAssets.debt));
  line("peak debt (CU)", f((r) => r.peak_debt));
  line("income /q (CU)", f((r) => r.final.capitals.capitalAssets.income_quarterly));
  line("bio cap", f((r) => r.final.capitals.bioEnergy.cap));
  line("bio value", f((r) => r.final.capitals.bioEnergy.value));
  line("bandwidth value", f((r) => r.final.capitals.cognitiveBandwidth.value));
  line("reputation", f((r) => r.final.capitals.socialLedger.reputation));
  line("agency", f((r) => r.final.capitals.agency), (x) => x.toFixed(2));
  line("scarcity ticks", f((r) => r.scarcity_ticks));
  line("rat-race ticks", f((r) => r.rat_race_ticks));
  line("phase changes", f((r) => r.phase_changes));
  line("relapses", f((r) => r.final.perception.relapses));
  line("sovereign ticks", f((r) => r.final.perception.tier_ticks.sovereign));
  line("agency peak", f((r) => r.final.perception.agency_peak), (x) => x.toFixed(2));
  line("deals played", f((r) => r.deals));
  const cellTot: Record<string, number> = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.cells)) cellTot[k] = (cellTot[k] ?? 0) + v;
  const totalDeals = Object.values(cellTot).reduce((x, y) => x + y, 0);
  console.log(`  cells: ${Object.entries(cellTot).map(([k, v]) => `${k} ${(100 * v / totalDeals).toFixed(0)}%`).join("  ")}`);
  const agg = (k: "exploited_by_arch" | "suckered_by_arch") => { const t: Record<string, number> = {}; for (const r of runs) for (const [a, v] of Object.entries(r[k])) t[a] = (t[a] ?? 0) + v; return Object.entries(t).map(([a, v]) => `${a} ${v}`).join("  "); };
  console.log(`  player exploited: ${agg("exploited_by_arch")}`);
  console.log(`  player suckered by: ${agg("suckered_by_arch")}`);
  const sustained = (r: LifeSummary) => r.sovereign_tick !== null && tierOf(r.final) === "sovereign" && r.final.perception.tier_ticks.sovereign >= 0.5 * (r.ticks - r.sovereign_tick);
  console.log(`  died: ${(100 * runs.filter((r) => r.died).length / n).toFixed(1)}%   ever awakened: ${(100 * runs.filter((r) => r.awakened_tick !== null).length / n).toFixed(0)}%   touched sovereign: ${(100 * runs.filter((r) => r.sovereign_tick !== null).length / n).toFixed(0)}%   SUSTAINED sovereign (held ≥50 % since first reached & at end): ${(100 * runs.filter(sustained).length / n).toFixed(0)}%   meta-view at end: ${(100 * runs.filter((r) => r.final.perception.phase === "strategic_meta_view").length / n).toFixed(0)}%   relapsed ≥1: ${(100 * runs.filter((r) => r.final.perception.relapses > 0).length / n).toFixed(0)}%`);
  const byTier = (pred: (r: LifeSummary) => boolean, label: string) => { const g = runs.filter(pred); if (g.length) console.log(`  ${label.padEnd(26)} n=${String(g.length).padStart(3)}  net ${mean(g.map((r) => r.net_capital)).toFixed(0).padStart(6)}  debt ${mean(g.map((r) => r.final.capitals.capitalAssets.debt)).toFixed(0).padStart(5)}  bio ${mean(g.map((r) => r.final.capitals.bioEnergy.value)).toFixed(0)}  rep ${mean(g.map((r) => r.final.capitals.socialLedger.reputation)).toFixed(0)}`); };
  byTier((r) => r.sovereign_tick !== null && r.sovereign_tick <= 40, "sovereign by tick 40");
  byTier((r) => r.sovereign_tick !== null && r.sovereign_tick > 40, "sovereign after tick 40");
  byTier((r) => r.sovereign_tick === null && r.awakened_tick !== null, "awakened, never sovereign");
  byTier((r) => r.awakened_tick === null, "never awakened");
}

/* ------------------------------------------------------------------ CLI */

const args = process.argv.slice(2);
const mc = args.indexOf("--montecarlo");
if (mc >= 0) {
  monteCarlo(Number(args[mc + 1] ?? 200), 120);
} else {
  const seed = Number(args[0] ?? 20261017);
  const life = runLife(seed, 120, true);
  console.log(summarize(life));
}
