/**
 * Interaction Resolver (spec §7, roadmap step 2).
 * Resolves one round of a joint venture between the player and an NPC:
 *   1. NPC decides from its archetype and memory.
 *   2. Fog of War: breach detection may flip the player's move to a protective defect.
 *   3. Payoff cell is computed, Nash status evaluated.
 *   4. State is committed: capitals, NPC memory, Social Ledger propagation.
 */
import type { WorldState, NpcAgent, Move, InteractionOutcome, CapitalDelta, PropagationEvent } from "../types/index.ts";
import type { Rng } from "../core/Rng.ts";
import { npcDecide } from "./Archetypes.ts";
import { cellPayoff, isNashCell, type MatrixContext } from "./PayoffMatrix.ts";
import { checkBreach, costlySignalTrustDelta } from "./Signaling.ts";
import { propagate, trustToward, setEdge, getEdge } from "./SocialLedger.ts";
import { PLAYER_NODE_ID } from "../types/index.ts";
import { applyDelta, mergeDeltas } from "../core/CapitalStore.ts";

export interface PlayerAction {
  npc_id: string;
  move: Move;
  /** Raw stake in CU the player puts at risk (before reputation discount). */
  stake: number;
  /** Bandwidth spent on due diligence this round. Deducted whether or not it pays off. */
  due_diligence_spent: number;
  /** CU burned on a costly signal this round (0 = none). */
  costly_signal_spent: number;
}

export interface ResolvedInteraction {
  outcome: InteractionOutcome;
  delta: CapitalDelta;
  propagation: PropagationEvent;
  /** Agency jolt from being betrayed (crisis seed) or from a detected breach (insight). */
  agency_delta: number;
  stake_effective: number;
}

export function resolveInteraction(s: WorldState, npc: NpcAgent, action: PlayerAction, rng: Rng): ResolvedInteraction {
  const stakeEff = action.stake * s.capitals.socialLedger.transaction_cost_multiplier;
  const ctx: MatrixContext = { stake: stakeEff, institutional_trust: s.spawn.macro.institutional_trust };

  // Costly signal: pay, then shift the NPC's prior trust before it decides.
  if (action.costly_signal_spent > 0) {
    const d = costlySignalTrustDelta(action.costly_signal_spent);
    const e = getEdge(s.graph, npc.id, PLAYER_NODE_ID);
    setEdge(s.graph, npc.id, PLAYER_NODE_ID, (e?.trust ?? 0) + d, s.tick);
  }

  // 1. NPC move from archetype + memory + social prior.
  const intended = npcDecide(npc, {
    stake: stakeEff,
    prior_trust: trustToward(s.graph, npc.id),
    costly_signal: action.costly_signal_spent > 0,
    rng,
  });

  // 2. Fog of War / due diligence.
  const breach = checkBreach(npc, intended, action.due_diligence_spent, rng);
  const actualMoveA: Move = breach.detected ? "defect" : action.move;

  // 3. Matrix.
  const cell = cellPayoff(actualMoveA, intended, ctx);
  const nash = isNashCell(actualMoveA, intended, ctx);

  // 4. Commit. Bandwidth for diligence and CU for the signal are sunk regardless of the cell.
  //    Cooperative gains are venture equity: 60 % lands as illiquid, 40 % as cash. Losses and
  //    exploitation hauls are all cash (you lost the money / you walked off with it).
  const gain = cell.A.capital;
  const equityShare = (cell.cell === "win_win" || cell.cell === "arbitrage") && gain > 0 ? 0.6 : 0;
  const base: CapitalDelta = {
    liquid: gain * (1 - equityShare) - action.costly_signal_spent,
    illiquid: gain * equityShare,
    bandwidth: cell.A.bandwidth - action.due_diligence_spent,
    bio: cell.A.bio,
  };
  // Being the sucker is a survival shock that can seed a Phase Change; detecting a breach is an insight.
  let agency_delta = 0;
  if (cell.cell === "sucker") agency_delta = 0.03;
  if (breach.detected) agency_delta += 0.02;
  if (actualMoveA === "arbitrage") agency_delta += 0.01;
  const delta = mergeDeltas(base, { agency: agency_delta });
  s.capitals = applyDelta(s.capitals, delta);

  npc.liquid += cell.B.capital;
  npc.cumulative_payoff += cell.B.capital;
  if (actualMoveA === "defect") npc.memory_defect = true;
  npc.history.push({ tick: s.tick, playerMove: actualMoveA, npcMove: intended, stake: stakeEff, breach_detected: breach.detected });

  // Social Ledger propagation. Direct-edge deltas per cell:
  //   win_win +0.15 · arbitrage(vs C) +0.10 · arbitrage(vs D) +0.05 (others saw you dodge a predator)
  //   sucker −0.05 (you look naive) · exploitation −0.80 · mutual_destruction: sever
  let primary = 0, sever = false;
  switch (cell.cell) {
    case "win_win": primary = 0.15; break;
    case "arbitrage": primary = intended === "cooperate" ? 0.10 : 0.05; break;
    case "sucker": primary = -0.05; break;
    case "exploitation": primary = -0.80; break;
    case "mutual_destruction": sever = true; break;
  }
  const propagation = propagate(s.graph, npc.id, primary, s.tick, sever);

  return {
    outcome: { playerMove: actualMoveA, npcMove: intended, breach_detected: breach.detected, payoffA: cell.A, payoffB: cell.B, nash_equilibrium: nash, cell: cell.cell },
    delta,
    propagation,
    agency_delta,
    stake_effective: stakeEff,
  };
}
