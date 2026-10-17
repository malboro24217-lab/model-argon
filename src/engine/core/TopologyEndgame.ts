/**
 * Phase 4 — Life Topology Endgame (spec §8, Giai đoạn 4).
 * The simulation does not end on a lifeless score. It measures the shape the life left in the system:
 *   1. Net Systemic Surplus — positive-sum value created (or destroyed) across the player and every NPC touched.
 *   2. Sovereignty Delta — agency at spawn vs peak vs end; quarters in Autopilot / Rat Race vs Sovereign flow.
 *   3. Ripple Graph Summary — which NPCs changed strategy, went bankrupt or prospered because of the player.
 * Pure: reads WorldState, returns a report. Rendering (Vietnamese or otherwise) is the UI's job.
 */
import type { WorldState, NpcAgent, Archetype } from "../types/index.ts";
import { PLAYER_NODE_ID } from "../types/index.ts";
import { cellPayoff } from "../gametheory/PayoffMatrix.ts";
import { getEdge, reputationOf } from "../gametheory/SocialLedger.ts";
import { GOSSIP_DEFECT_TRUST } from "../gametheory/Archetypes.ts";

export interface SurplusReport {
  /** Σ over all rounds of (player capital + NPC capital). Positive = the life was net positive-sum. */
  net_systemic_surplus: number;
  player_capital_from_deals: number;
  npc_capital_from_deals: number;
  /** Σ of the cooperative surplus that was *available* (win-win on every round) — the ceiling. */
  potential_surplus: number;
  /** net / potential, in [−∞, 1]. 1 = every round was win-win. */
  realisation_ratio: number;
  rounds: number;
  cells: Record<"win_win" | "sucker" | "exploitation" | "mutual_destruction" | "arbitrage", number>;
  /** Capital destroyed in mutual-destruction and lost to friction (sucker + exploitation are transfers, not destruction). */
  capital_destroyed: number;
}

export interface SovereigntyReport {
  agency_start: number;
  agency_peak: number;
  agency_end: number;
  ticks_autopilot: number;
  ticks_awakened: number;
  ticks_sovereign: number;
  ticks_rat_race: number;
  crises_survived: number;
  relapses: number;
  /** Fraction of the simulated life lived in Sovereign flow. */
  sovereign_share: number;
  final_phase: WorldState["perception"]["phase"];
}

export type NpcFate = "prospered" | "bankrupt" | "neutral";
export type NpcShift = "turned_hostile" | "turned_cooperative" | "unchanged";

export interface NpcRippleRow {
  id: string;
  name: string;
  true_archetype: Archetype;
  rounds_with_player: number;
  capital_from_player: number;
  /** Trust this NPC holds toward the player at the end. */
  trust_final: number;
  severed: boolean;
  fate: NpcFate;
  /** Strategy shift caused by the player: a Grudger whose memory flipped, or a reciprocal NPC now opening with defect from gossip. */
  shift: NpcShift;
}

export interface RippleReport {
  reputation_final: number;
  allies: number;
  enemies: number;
  severed_edges: number;
  npcs_shifted_hostile: number;
  npcs_shifted_cooperative: number;
  npcs_bankrupt: number;
  npcs_prospered: number;
  /** NPCs who never dealt with the player directly but whose trust moved through gossip. */
  npcs_reached_only_by_ripple: number;
  rows: NpcRippleRow[];
}

export interface LifeTopologyReport {
  age: number;
  dead: boolean;
  surplus: SurplusReport;
  sovereignty: SovereigntyReport;
  ripple: RippleReport;
  /** One-line verdict key the UI can localise: which quadrant of (surplus, sovereignty) the life landed in. */
  quadrant: "builder" | "extractor" | "sleeper" | "casualty";
}

function npcFate(npc: NpcAgent, startLiquid: number): NpcFate {
  if (npc.liquid <= 0) return "bankrupt";
  if (npc.liquid >= startLiquid * 1.25 && npc.cumulative_payoff > 0) return "prospered";
  return "neutral";
}

function npcShift(npc: NpcAgent, trust: number): NpcShift {
  const reciprocal = npc.true_archetype === "tit_for_tat" || npc.true_archetype === "generous_tit_for_tat" || npc.true_archetype === "grudger";
  if (npc.true_archetype === "grudger" && npc.memory_defect) return "turned_hostile";
  if (reciprocal && trust <= GOSSIP_DEFECT_TRUST) return "turned_hostile";
  if (npc.true_archetype === "opportunist" && npc.history.length >= 3 && npc.history.slice(-3).every((h) => h.npcMove === "cooperate")) return "turned_cooperative";
  return "unchanged";
}

export function lifeTopology(s: WorldState, npcStartLiquid: Map<string, number>): LifeTopologyReport {
  const cells: SurplusReport["cells"] = { win_win: 0, sucker: 0, exploitation: 0, mutual_destruction: 0, arbitrage: 0 };
  let playerCap = 0, npcCap = 0, potential = 0, destroyed = 0, rounds = 0;
  const inst = s.spawn.macro.institutional_trust;
  const rows: NpcRippleRow[] = [];
  let shiftedHostile = 0, shiftedCoop = 0, bankrupt = 0, prospered = 0, severed = 0, allies = 0, enemies = 0, rippleOnly = 0;

  for (const npc of s.npcs.values()) {
    let fromPlayer = 0;
    for (const h of npc.history) {
      const ctx = { stake: h.stake, institutional_trust: inst };
      const c = cellPayoff(h.playerMove, h.npcMove, ctx);
      playerCap += c.A.capital;
      npcCap += c.B.capital;
      fromPlayer += c.B.capital;
      potential += 2 * cellPayoff("cooperate", "cooperate", ctx).A.capital;
      cells[c.cell] += 1;
      rounds += 1;
      if (c.cell === "mutual_destruction") destroyed += -(c.A.capital + c.B.capital);
      // Exploitation in a low-trust institution also leaks value to courts/friction: 60·(1−clawback) of the stake.
      if (c.cell === "exploitation" || c.cell === "sucker") destroyed += 0.6 * h.stake * (0.4 * inst);
    }
    const e = getEdge(s.graph, npc.id, PLAYER_NODE_ID);
    const trust = e?.trust ?? 0;
    const fate = npcFate(npc, npcStartLiquid.get(npc.id) ?? npc.liquid);
    const shift = npcShift(npc, trust);
    if (e?.severed) severed++;
    if (trust >= 0.5) allies++;
    if (trust <= -0.5) enemies++;
    if (shift === "turned_hostile") shiftedHostile++;
    if (shift === "turned_cooperative") shiftedCoop++;
    if (fate === "bankrupt") bankrupt++;
    if (fate === "prospered") prospered++;
    if (npc.history.length === 0 && Math.abs(trust) >= 0.05) rippleOnly++;
    rows.push({ id: npc.id, name: npc.name, true_archetype: npc.true_archetype, rounds_with_player: npc.history.length, capital_from_player: fromPlayer, trust_final: trust, severed: !!e?.severed, fate, shift });
  }
  rows.sort((a, b) => b.rounds_with_player - a.rounds_with_player || Math.abs(b.trust_final) - Math.abs(a.trust_final));

  const net = playerCap + npcCap;
  const p = s.perception;
  const total = Math.max(1, p.tier_ticks.autopilot + p.tier_ticks.awakened + p.tier_ticks.sovereign);
  const sovereignty: SovereigntyReport = {
    agency_start: p.agency_start, agency_peak: p.agency_peak, agency_end: s.capitals.agency,
    ticks_autopilot: p.tier_ticks.autopilot, ticks_awakened: p.tier_ticks.awakened, ticks_sovereign: p.tier_ticks.sovereign,
    ticks_rat_race: p.rat_race_ticks, crises_survived: p.crises_survived, relapses: p.relapses,
    sovereign_share: p.tier_ticks.sovereign / total, final_phase: p.phase,
  };
  const surplus: SurplusReport = {
    net_systemic_surplus: net, player_capital_from_deals: playerCap, npc_capital_from_deals: npcCap,
    potential_surplus: potential, realisation_ratio: potential > 0 ? net / potential : 0, rounds, cells, capital_destroyed: destroyed,
  };
  const ripple: RippleReport = {
    reputation_final: reputationOf(s.graph, PLAYER_NODE_ID), allies, enemies, severed_edges: severed,
    npcs_shifted_hostile: shiftedHostile, npcs_shifted_cooperative: shiftedCoop, npcs_bankrupt: bankrupt, npcs_prospered: prospered,
    npcs_reached_only_by_ripple: rippleOnly, rows,
  };
  const positiveSum = net > 0 && npcCap >= 0;
  const sovereign = sovereignty.sovereign_share >= 0.25 || s.capitals.agency >= 0.6;
  const quadrant: LifeTopologyReport["quadrant"] = positiveSum && sovereign ? "builder" : !positiveSum && sovereign ? "extractor" : positiveSum ? "sleeper" : "casualty";
  return { age: s.age, dead: s.dead, surplus, sovereignty, ripple, quadrant };
}
