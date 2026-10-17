export type { EconomicPhase, MacroVector, BloodlineVector, BiologyVector, SpawnVector } from "./SpawnVector.ts";
export type {
  Gauge, CapitalAssets, SocialLedgerSummary, FiveCapitals, StressState,
  AwakeningPhase, PerceptionState, CapitalDelta,
} from "./FiveCapitals.ts";
export { EMPTY_DELTA } from "./FiveCapitals.ts";
export type {
  Archetype, Move, NpcMove, InteractionRecord, NpcAgent, PayoffDelta, InteractionOutcome,
} from "./AgentArchetype.ts";
export { ALL_ARCHETYPES } from "./AgentArchetype.ts";
export type { SocialNode, TrustEdge, SocialGraph, PropagationEvent } from "./SocialGraph.ts";
export { PLAYER_NODE_ID, edgeKey } from "./SocialGraph.ts";

import type { SpawnVector } from "./SpawnVector.ts";
import type { FiveCapitals, StressState, PerceptionState } from "./FiveCapitals.ts";
import type { NpcAgent } from "./AgentArchetype.ts";
import type { SocialGraph } from "./SocialGraph.ts";
import type { EconomicPhase } from "./SpawnVector.ts";

/** The complete simulation state. Pure data; every engine function is `(state, ...) => state | delta`. */
export interface WorldState {
  spawn: SpawnVector;
  tick: number;
  /** Age in years, advances 0.25 per tick. */
  age: number;
  capitals: FiveCapitals;
  stress: StressState;
  perception: PerceptionState;
  npcs: Map<string, NpcAgent>;
  graph: SocialGraph;
  economic_phase: EconomicPhase;
  /** True once Bio-Energy hit 0 or age exceeded the hazard table. The runner stops. */
  dead: boolean;
}
