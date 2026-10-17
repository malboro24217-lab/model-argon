/**
 * Layer 2 — Social Ledger Graph.
 * A weighted directed graph of trust. Trust is in [-1, +1]; weight is how much a node's
 * opinion matters when propagating (its own centrality). Reputation is derived, never stored.
 */

export const PLAYER_NODE_ID = "player";

export interface SocialNode {
  id: string;
  /** Centrality / influence of this node when it gossips. [0,1] */
  weight: number;
}

export interface TrustEdge {
  from: string;
  to: string;
  /** -1 = sworn enemy, 0 = stranger, +1 = full trust. */
  trust: number;
  /** Tick of the last direct interaction. Trust fades toward 0 after prolonged silence. */
  last_interaction_tick: number;
  /** A severed edge is frozen at its negative value and cannot be repaired by decay. */
  severed: boolean;
}

export interface SocialGraph {
  nodes: Map<string, SocialNode>;
  /** Keyed `${from}->${to}`. */
  edges: Map<string, TrustEdge>;
}

export const edgeKey = (from: string, to: string): string => `${from}->${to}`;

export interface PropagationEvent {
  tick: number;
  source_npc: string;
  /** Positive for cooperation, negative for defection. The primary delta applied on the direct edge. */
  primary_delta: number;
  /** Second-order ripples: npc id → delta applied to that node's trust in the player. */
  ripples: Array<{ npc: string; delta: number }>;
}
