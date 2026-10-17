/**
 * NPC Behavioral Archetypes (spec §5). Each policy is a pure function of the NPC's memory,
 * the current stake and the social prior; it returns the NPC's move for this round.
 */
import type { NpcAgent, NpcMove, Archetype } from "../types/index.ts";
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";

export interface PolicyContext {
  stake: number;
  /** Trust the NPC currently holds toward the player, from the Social Ledger. [-1,1] */
  prior_trust: number;
  /** Whether the player broadcast a costly signal this round (spent capital to signal commitment). */
  costly_signal: boolean;
  rng: Rng;
}

/** Reciprocal types read the Social Ledger before a first meeting: a reputation precedes you. */
export const GOSSIP_DEFECT_TRUST = -0.2;

/**
 * The player's last move as seen by this NPC. Arbitrage reads as cooperation to reciprocal types.
 * With no direct history, the ledger stands in: trust ≤ −0.2 is read as "this person defected on my friends".
 */
function lastPlayerMove(npc: NpcAgent, priorTrust: number): NpcMove | null {
  const h = npc.history[npc.history.length - 1];
  if (!h) return priorTrust <= GOSSIP_DEFECT_TRUST ? "defect" : null;
  return h.playerMove === "defect" ? "defect" : "cooperate";
}

const policies: Record<Archetype, (npc: NpcAgent, ctx: PolicyContext) => NpcMove> = {
  /** Cooperate first (unless gossip says otherwise); then copy the opponent's previous move exactly. */
  tit_for_tat: (npc, ctx) => lastPlayerMove(npc, ctx.prior_trust) ?? "cooperate",

  /** Cooperate until the first betrayal, then defect forever. A severed ledger edge counts as a betrayal. */
  grudger: (npc, ctx) => (npc.memory_defect || ctx.prior_trust <= -0.6 ? "defect" : "cooperate"),

  always_defect: () => "defect",

  /** TfT, but forgives an isolated defection with probability forgiveness_prob (0.15–0.20). */
  generous_tit_for_tat: (npc, ctx) => {
    const last = lastPlayerMove(npc, ctx.prior_trust);
    if (last !== "defect") return "cooperate";
    const prev = npc.history[npc.history.length - 2];
    const isolated = !prev || prev.playerMove !== "defect";
    return isolated && ctx.rng.chance(npc.forgiveness_prob) ? "cooperate" : "defect";
  },

  /**
   * Predatory Defector. Defects when the marginal benefit is highest:
   *   p_defect = sigmoid(2.2 · (stake / (liquid·0.25) − 1)) · (0.55 + 0.45·trust_lure)
   * where trust_lure = (prior_trust + 1)/2 — the more the player trusts them, the richer the kill.
   * A costly signal from the player marks prey: p_defect += 0.15.
   * Floor 0.2, cap 0.95 (spec §7 uses a flat 0.8; here it is stake-aware around that mean).
   * On the very first round against a stranger they cooperate 60 % of the time to build the fake signal.
   */
  opportunist: (npc, ctx) => {
    if (npc.history.length === 0 && ctx.rng.chance(0.6)) return "cooperate";
    const relStake = ctx.stake / Math.max(10, npc.liquid * 0.25);
    const sig = 1 / (1 + Math.exp(-2.2 * (relStake - 1)));
    const lure = (ctx.prior_trust + 1) / 2;
    let p = sig * (0.55 + 0.45 * lure) + (ctx.costly_signal ? 0.15 : 0);
    p = clamp(p, 0.2, 0.95);
    return ctx.rng.chance(p) ? "defect" : "cooperate";
  },
};

export function npcDecide(npc: NpcAgent, ctx: PolicyContext): NpcMove {
  return policies[npc.true_archetype](npc, ctx);
}

/**
 * Observable "honesty of signal" per archetype: the probability that, absent due diligence,
 * the NPC *looks* cooperative. Opportunists look as good as TfT; that is the point.
 */
export function surfaceSignal(a: Archetype): number {
  switch (a) {
    case "tit_for_tat": return 0.85;
    case "generous_tit_for_tat": return 0.9;
    case "grudger": return 0.8;
    case "opportunist": return 0.85;
    case "always_defect": return 0.35;
  }
}

/** Population prior used when the player has zero information (spec: incomplete-information game). */
export const ARCHETYPE_PRIOR: Readonly<Record<Archetype, number>> = Object.freeze({
  tit_for_tat: 0.30,
  generous_tit_for_tat: 0.20,
  grudger: 0.20,
  opportunist: 0.22,
  always_defect: 0.08,
});

export function makeNpc(id: string, name: string, archetype: Archetype, rng: Rng, liquid: number): NpcAgent {
  const deception =
    archetype === "opportunist" ? 0.6 + 0.3 * rng.next()
    : archetype === "always_defect" ? 0.2 + 0.3 * rng.next()
    : 0.05 + 0.2 * rng.next();
  return {
    id, name, true_archetype: archetype,
    deception_skill: deception,
    forgiveness_prob: 0.15 + 0.05 * rng.next(),
    memory_defect: false,
    history: [],
    liquid,
    cumulative_payoff: 0,
  };
}
