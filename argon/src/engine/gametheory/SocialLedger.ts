/**
 * Social Ledger Graph: trust & reputation propagation (spec §2 Social Ledger row).
 *
 * When the player cooperates or defects against NPC B, the direct edge B→player moves,
 * and the news ripples to B's neighbours in proportion to how much they trust B:
 *   Δ(N→player) = primary · trust(B→N)⁺ · weight(B) · DAMPING
 * Defection ripples carry 2× the force of cooperation (negativity bias; Baumeister 2001), and the
 * victim's own edge drops by the full primary delta immediately ("đổ vỡ lập tức khi phản bội").
 * Mutual Destruction / Grudger break severs the edge permanently.
 */
import type { SocialGraph, TrustEdge, PropagationEvent, NpcAgent } from "../types/index.ts";
import { edgeKey, PLAYER_NODE_ID } from "../types/index.ts";
import { clamp } from "../core/Rng.ts";

const DAMPING = 0.7;
const NEGATIVITY_BIAS = 2.0;

export function createGraph(): SocialGraph {
  const g: SocialGraph = { nodes: new Map(), edges: new Map() };
  g.nodes.set(PLAYER_NODE_ID, { id: PLAYER_NODE_ID, weight: 0.5 });
  return g;
}

export function addNpcToGraph(g: SocialGraph, npc: NpcAgent, weight: number, tick: number, initialTrust = 0): void {
  g.nodes.set(npc.id, { id: npc.id, weight: clamp(weight, 0, 1) });
  setEdge(g, npc.id, PLAYER_NODE_ID, initialTrust, tick);
  setEdge(g, PLAYER_NODE_ID, npc.id, initialTrust, tick);
}

/** Connects two NPCs (a social circle). Trust is symmetric at creation. */
export function connectNpcs(g: SocialGraph, a: string, b: string, trust: number, tick: number): void {
  setEdge(g, a, b, trust, tick);
  setEdge(g, b, a, trust, tick);
}

export function getEdge(g: SocialGraph, from: string, to: string): TrustEdge | undefined {
  return g.edges.get(edgeKey(from, to));
}

export function setEdge(g: SocialGraph, from: string, to: string, trust: number, tick: number): TrustEdge {
  const k = edgeKey(from, to);
  const existing = g.edges.get(k);
  if (existing) {
    if (!existing.severed) existing.trust = clamp(trust, -1, 1);
    existing.last_interaction_tick = tick;
    return existing;
  }
  const e: TrustEdge = { from, to, trust: clamp(trust, -1, 1), last_interaction_tick: tick, severed: false };
  g.edges.set(k, e);
  return e;
}

export function severEdge(g: SocialGraph, from: string, to: string, tick: number): void {
  const e = setEdge(g, from, to, -1, tick);
  e.trust = -1;
  e.severed = true;
}

/** Neighbours of `id` with positive outgoing trust from `id` (people who would listen to `id`'s gossip). */
function listeners(g: SocialGraph, id: string): Array<{ to: string; trust: number }> {
  const out: Array<{ to: string; trust: number }> = [];
  for (const e of g.edges.values()) {
    if (e.from === id && e.to !== PLAYER_NODE_ID && e.trust > 0) out.push({ to: e.to, trust: e.trust });
  }
  return out;
}

/**
 * Applies a cooperation (+) or defection (−) by the player against `npcId` and propagates.
 * `primary` is the direct trust delta on edge npc→player, e.g. +0.15 for Win-Win, −0.6 for Exploitation.
 */
export function propagate(g: SocialGraph, npcId: string, primary: number, tick: number, sever = false): PropagationEvent {
  const direct = getEdge(g, npcId, PLAYER_NODE_ID) ?? setEdge(g, npcId, PLAYER_NODE_ID, 0, tick);
  if (sever) {
    severEdge(g, npcId, PLAYER_NODE_ID, tick);
    severEdge(g, PLAYER_NODE_ID, npcId, tick);
  } else if (!direct.severed) {
    direct.trust = clamp(direct.trust + primary, -1, 1);
    direct.last_interaction_tick = tick;
    const mine = setEdge(g, PLAYER_NODE_ID, npcId, (getEdge(g, PLAYER_NODE_ID, npcId)?.trust ?? 0), tick);
    mine.last_interaction_tick = tick;
  }
  const srcWeight = g.nodes.get(npcId)?.weight ?? 0.3;
  const force = primary < 0 ? primary * NEGATIVITY_BIAS : primary;
  const ripples: Array<{ npc: string; delta: number }> = [];
  for (const n of listeners(g, npcId)) {
    const e = getEdge(g, n.to, PLAYER_NODE_ID);
    if (!e || e.severed) continue;
    const delta = force * n.trust * srcWeight * DAMPING;
    if (Math.abs(delta) < 1e-4) continue;
    e.trust = clamp(e.trust + delta, -1, 1);
    ripples.push({ npc: n.to, delta });
  }
  return { tick, source_npc: npcId, primary_delta: sever ? -1 : primary, ripples };
}

/**
 * Reputation 0–100 = weighted mean of incoming trust to `id`, mapped from [-1,1].
 * No incoming edges → 50 (unknown). Severed edges count at full negative weight.
 */
export function reputationOf(g: SocialGraph, id: string): number {
  let num = 0, den = 0;
  for (const e of g.edges.values()) {
    if (e.to !== id) continue;
    const w = g.nodes.get(e.from)?.weight ?? 0.3;
    num += e.trust * w;
    den += w;
  }
  if (den === 0) return 50;
  return clamp(50 + 50 * (num / den), 0, 100);
}

export function allianceCount(g: SocialGraph, id: string): number {
  let n = 0;
  for (const e of g.edges.values()) if (e.to === id && !e.severed && e.trust >= 0.5) n++;
  return n;
}

/** Mean trust an NPC currently holds toward the player, used by archetype policies as a prior. */
export function trustToward(g: SocialGraph, npcId: string): number {
  return getEdge(g, npcId, PLAYER_NODE_ID)?.trust ?? 0;
}
