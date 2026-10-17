/**
 * Asymmetric information: Fog of War, Due Diligence and Costly Signaling (spec §4, §7).
 *
 * The player never sees true_archetype. They see a posterior over archetypes computed from:
 *   1. the population prior,
 *   2. the NPC's surface signal (how cooperative they look) attenuated by deception_skill,
 *   3. evidence from history (observed moves, each round a likelihood update),
 *   4. due diligence: bandwidth spent buys signal accuracy  acc = 1 − exp(−bw_spent / 20),
 *      degraded by the target's deception:  acc_eff = acc · (1 − 0.6·deception_skill·(1 − acc)).
 *      35 bw ⇒ acc 0.83 raw; against a 0.8-deception opportunist ⇒ 0.76.
 *
 * Breach detection (spec §7): if due diligence spent > 35 AND the NPC is about to defect,
 * the breach is detected with probability acc_eff, and the player's move is flipped to a
 * protective defect before the cell resolves. Below 35 there is no detection at all —
 * the spec's hard threshold is kept, with accuracy deciding *whether* the signal is read right.
 */
import type { NpcAgent, Archetype, NpcMove } from "../types/index.ts";
import { ALL_ARCHETYPES } from "../types/index.ts";
import { ARCHETYPE_PRIOR, surfaceSignal } from "./Archetypes.ts";
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";

export const BREACH_DD_THRESHOLD = 35;

export type Belief = Record<Archetype, number>;

export function rawAccuracy(bwSpent: number): number {
  return 1 - Math.exp(-Math.max(0, bwSpent) / 20);
}

export function effectiveAccuracy(bwSpent: number, deception: number): number {
  const acc = rawAccuracy(bwSpent);
  return clamp(acc * (1 - 0.6 * deception * (1 - acc)), 0, 1);
}

/** P(observed cooperate | archetype) for the likelihood update from history. */
function coopLikelihood(a: Archetype, prevPlayerDefected: boolean): number {
  switch (a) {
    case "tit_for_tat": return prevPlayerDefected ? 0.05 : 0.95;
    case "generous_tit_for_tat": return prevPlayerDefected ? 0.2 : 0.95;
    case "grudger": return prevPlayerDefected ? 0.02 : 0.95;
    case "opportunist": return 0.45;
    case "always_defect": return 0.03;
  }
}

/**
 * Posterior belief the player holds about `npc`, given bandwidth already invested in due diligence
 * (cumulative across rounds — knowledge persists) and the visible history.
 */
export function beliefAbout(npc: NpcAgent, ddSpentTotal: number): Belief {
  const acc = effectiveAccuracy(ddSpentTotal, npc.deception_skill);
  const post: Belief = { ...ARCHETYPE_PRIOR };
  // 1. Surface impression, attenuated: with zero accuracy the surface signal dominates (fog), with
  //    full accuracy the true archetype is revealed. Mixture: P ∝ prior · [(1−acc)·surface_fit + acc·truth].
  for (const a of ALL_ARCHETYPES) {
    const surfaceFit = 0.5 + 0.5 * surfaceSignal(a); // likeable types look alike in the fog
    const truth = a === npc.true_archetype ? 1 : 0.02;
    post[a] = post[a] * ((1 - acc) * surfaceFit + acc * truth);
  }
  // 2. History evidence (observed NPC moves). Opportunists hide here because their likelihood is flat.
  for (let i = 0; i < npc.history.length; i++) {
    const h = npc.history[i]!;
    const prev = npc.history[i - 1];
    const prevDefect = prev ? prev.playerMove === "defect" : false;
    for (const a of ALL_ARCHETYPES) {
      const pc = coopLikelihood(a, prevDefect);
      post[a] *= h.npcMove === "cooperate" ? pc : 1 - pc;
    }
  }
  let z = 0;
  for (const a of ALL_ARCHETYPES) z += post[a];
  for (const a of ALL_ARCHETYPES) post[a] = post[a] / z;
  return post;
}

/** Player's subjective P(NPC cooperates next round), derived from the belief and the NPC's visible memory. */
export function predictedCoopProb(npc: NpcAgent, belief: Belief): number {
  const last = npc.history[npc.history.length - 1];
  const playerDefectedLast = last ? last.playerMove === "defect" : false;
  const everDefected = npc.history.some((h) => h.playerMove === "defect");
  let p = 0;
  for (const a of ALL_ARCHETYPES) {
    let pa: number;
    switch (a) {
      case "tit_for_tat": pa = playerDefectedLast ? 0.05 : 0.95; break;
      case "generous_tit_for_tat": pa = playerDefectedLast ? 0.25 : 0.95; break;
      case "grudger": pa = everDefected ? 0.02 : 0.95; break;
      case "opportunist": pa = 0.4; break;
      case "always_defect": pa = 0.02; break;
    }
    p += belief[a] * pa;
  }
  return clamp(p, 0, 1);
}

export interface BreachCheck {
  detected: boolean;
  accuracy: number;
}

/** Spec §7 rule with accuracy: detection only possible past the 35-bw threshold. */
export function checkBreach(npc: NpcAgent, intendedNpcMove: NpcMove, ddSpentThisRound: number, rng: Rng): BreachCheck {
  const accuracy = effectiveAccuracy(ddSpentThisRound, npc.deception_skill);
  if (ddSpentThisRound <= BREACH_DD_THRESHOLD || intendedNpcMove !== "defect") return { detected: false, accuracy };
  return { detected: rng.chance(accuracy), accuracy };
}

/**
 * Costly signaling by the player: burning `cost` CU in public (gifts, hospitality, a visible
 * investment) raises reciprocal NPCs' prior trust by  Δtrust = 0.25 · (1 − exp(−cost/30))
 * — but reads as "prey" to opportunists (handled in their policy via costly_signal).
 * Returns the trust delta; the caller pays the cost.
 */
export function costlySignalTrustDelta(cost: number): number {
  return 0.25 * (1 - Math.exp(-Math.max(0, cost) / 30));
}
