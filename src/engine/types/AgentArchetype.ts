/**
 * Layer 2 — NPC Behavioral Archetypes (spec §5) and the move/payoff vocabulary (spec §6–7).
 */

export type Archetype =
  | "tit_for_tat"          // Cooperates first, mirrors the opponent's previous move, forgives on renewed goodwill.
  | "grudger"              // Cooperates until betrayed exactly once, then defects forever. No repair.
  | "always_defect"        // Pure defector. Rare in the wild but exists.
  | "generous_tit_for_tat" // TfT with a 15–20 % forgiveness probability to break retaliation spirals.
  | "opportunist";         // Predatory defector: broadcasts fake trust, defects at the round of highest marginal gain.

export const ALL_ARCHETYPES: readonly Archetype[] = [
  "tit_for_tat", "grudger", "always_defect", "generous_tit_for_tat", "opportunist",
];

/** Player moves. "arbitrage" is the Sovereign third option: restructure or exit the zero-sum frame. */
export type Move = "cooperate" | "defect" | "arbitrage";
/** NPCs never arbitrage; they live inside the matrix. */
export type NpcMove = "cooperate" | "defect";

export interface InteractionRecord {
  tick: number;
  playerMove: Move;
  npcMove: NpcMove;
  stake: number;
  breach_detected: boolean;
}

export interface NpcAgent {
  id: string;
  name: string;
  /** Ground truth. Never read by the UI directly; only via Signaling with imperfect accuracy. */
  true_archetype: Archetype;
  /** How convincingly this NPC fakes a cooperative signal. Opportunists are high (0.6–0.9). [0,1] */
  deception_skill: number;
  /** For generous_tit_for_tat: forgiveness probability per isolated defection. Spec: 0.15–0.20. */
  forgiveness_prob: number;
  /** Grudger memory: set permanently on the first player defection. */
  memory_defect: boolean;
  /** Full history with this NPC (both sides). Drives TfT / Grudger / Opportunist policy. */
  history: InteractionRecord[];
  /** NPC's own liquid capital, in CU. Opportunists' marginal benefit of defection scales with the stake / their wealth. */
  liquid: number;
  /** Cumulative payoff this NPC has extracted from the player; used for the "NPC win rate" shown in Meta-View. */
  cumulative_payoff: number;
}

export interface PayoffDelta {
  capital: number;
  bandwidth: number;
  bio: number;
  social: number;
  /** Social Ledger edge severed (Mutual Destruction / Grudger break). */
  severed: boolean;
}

export interface InteractionOutcome {
  playerMove: Move;
  npcMove: NpcMove;
  breach_detected: boolean;
  payoffA: PayoffDelta;
  payoffB: PayoffDelta;
  /** Whether the realised cell is a Nash equilibrium of the stake-scaled matrix. */
  nash_equilibrium: boolean;
  /** Human-readable cell label from spec §6. */
  cell: "win_win" | "sucker" | "exploitation" | "mutual_destruction" | "arbitrage";
}
