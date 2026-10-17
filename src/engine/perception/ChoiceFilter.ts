/**
 * Choice Filter (spec §2 Agency row, §8). Agency is the hidden index that decides how many
 * strategic choices the player can *see*. The engine always knows every choice; the filter
 * decides visibility and what information is attached.
 *
 *   tier "autopilot"  : Low Agency (< 0.3) AND no Phase Change → only societal-script choices.
 *   tier "awakened"   : Phase Change happened or Agency ≥ 0.3 → negotiation & diligence choices.
 *   tier "sovereign"  : Agency ≥ 0.6, or (Phase Change AND Agency ≥ 0.5) → third options that
 *                       exit zero-sum frames; Meta-View exposes the payoff matrix and NPC win rates.
 *   Bandwidth Lock    : bandwidth < 30 hides every negotiation-optimal choice regardless of tier
 *                       (you cannot bargain well while tunnelling on rent).
 */
import type { WorldState, NpcAgent, Move } from "../types/index.ts";
import { BANDWIDTH_LOCK_LEVEL } from "../core/ScarcityTrap.ts";
import { beliefAbout, predictedCoopProb, type Belief } from "../gametheory/Signaling.ts";
import { expectedCapital, cellPayoff, type MatrixContext } from "../gametheory/PayoffMatrix.ts";

export type ChoiceTier = "autopilot" | "awakened" | "sovereign";

export type ChoiceId =
  // societal script
  | "work_standard" | "work_overtime" | "take_consumer_loan" | "buy_status_asset" | "deal_cooperate_blind" | "deal_decline"
  // awakened
  | "due_diligence" | "deal_defect" | "negotiate_terms" | "deleverage" | "rest_recover" | "live_below_means"
  // sovereign
  | "deal_arbitrage" | "walk_away_better_alt" | "rule_maker_escrow" | "coalition";

export interface Choice {
  id: ChoiceId;
  tier: ChoiceTier;
  label: string;
  /** Visible only in Meta-View: expected capital for the player under current belief. */
  expected_capital?: number;
  /** Mapped move for deal choices. */
  move?: Move;
}

export interface VisibleInfo {
  tier: ChoiceTier;
  bandwidth_locked: boolean;
  /** Only in Meta-View: full stake-scaled payoff matrix for the player. */
  payoff_matrix: { cc: number; cd: number; dc: number; dd: number } | null;
  /** Only in Meta-View: NPC win rate (fraction of rounds the NPC's capital payoff ≥ the player's). */
  npc_win_rate: number | null;
  /** Belief over archetypes. Autopilot sees nothing; awakened sees the posterior; sovereign sees it plus P(coop). */
  belief: Belief | null;
  predicted_coop: number | null;
}

export function tierOf(s: WorldState): ChoiceTier {
  const A = s.capitals.agency;
  const pc = s.perception.phase_changed;
  if (A >= 0.6 || (pc && A >= 0.5)) return "sovereign";
  if (A >= 0.3 || pc) return "awakened";
  return "autopilot";
}

export function isBandwidthLocked(s: WorldState): boolean {
  return s.capitals.cognitiveBandwidth.value < BANDWIDTH_LOCK_LEVEL;
}

/** Everyday (non-deal) choices for a tick. */
export function tickChoices(s: WorldState): Choice[] {
  const tier = tierOf(s);
  const locked = isBandwidthLocked(s);
  const out: Choice[] = [
    { id: "work_standard", tier: "autopilot", label: "Work the standard week" },
    { id: "work_overtime", tier: "autopilot", label: "Take overtime (+30 % income, +stress)" },
    { id: "take_consumer_loan", tier: "autopilot", label: "Take a consumer loan" },
    { id: "buy_status_asset", tier: "autopilot", label: "Buy the house / vehicle everyone your age has (50 % financed)" },
  ];
  if (tier !== "autopilot" && !locked) {
    out.push({ id: "deleverage", tier: "awakened", label: "Pay down debt aggressively" });
    out.push({ id: "rest_recover", tier: "awakened", label: "Reduce workload to recover" });
    out.push({ id: "live_below_means", tier: "awakened", label: "Live below your means (cut lifestyle spend to 35 %)" });
  }
  if (tier === "sovereign" && !locked) {
    out.push({ id: "coalition", tier: "sovereign", label: "Form a coalition with allies (pool stakes, share diligence)" });
  }
  return out;
}

/** Choices offered when an NPC proposes a joint venture. */
export function dealChoices(s: WorldState, npc: NpcAgent, stake: number, ddSpentTotal: number): { choices: Choice[]; info: VisibleInfo } {
  const tier = tierOf(s);
  const locked = isBandwidthLocked(s);
  const ctx: MatrixContext = { stake: stake * s.capitals.socialLedger.transaction_cost_multiplier, institutional_trust: s.spawn.macro.institutional_trust };
  const belief = tier === "autopilot" ? null : beliefAbout(npc, ddSpentTotal);
  const pCoop = belief ? predictedCoopProb(npc, belief) : null;

  const choices: Choice[] = [
    { id: "deal_cooperate_blind", tier: "autopilot", label: "Go in on trust", move: "cooperate" },
    { id: "deal_decline", tier: "autopilot", label: "Decline politely" },
  ];
  if (tier !== "autopilot" && !locked) {
    choices.push({ id: "due_diligence", tier: "awakened", label: "Spend bandwidth on due diligence first" });
    choices.push({ id: "deal_defect", tier: "awakened", label: "Take the upside and leave them holding the risk", move: "defect" });
    choices.push({ id: "negotiate_terms", tier: "awakened", label: "Negotiate a smaller stake" });
  }
  if (tier === "sovereign" && !locked) {
    choices.push({ id: "deal_arbitrage", tier: "sovereign", label: "Restructure: escrow + milestones (exit the zero-sum frame)", move: "arbitrage" });
    choices.push({ id: "walk_away_better_alt", tier: "sovereign", label: "Walk away to a better alternative (BATNA)" });
    choices.push({ id: "rule_maker_escrow", tier: "sovereign", label: "Write the rules: propose a repeated-game contract with penalties" });
  }
  const meta = tier === "sovereign";
  if (meta && pCoop !== null) {
    for (const c of choices) if (c.move) c.expected_capital = expectedCapital(c.move, pCoop, ctx);
  }
  const rounds = npc.history.length;
  const npcWins = npc.history.filter((h) => {
    const cell = cellPayoff(h.playerMove, h.npcMove, { stake: h.stake, institutional_trust: ctx.institutional_trust });
    return cell.B.capital >= cell.A.capital;
  }).length;
  const info: VisibleInfo = {
    tier,
    bandwidth_locked: locked,
    payoff_matrix: meta ? {
      cc: cellPayoff("cooperate", "cooperate", ctx).A.capital,
      cd: cellPayoff("cooperate", "defect", ctx).A.capital,
      dc: cellPayoff("defect", "cooperate", ctx).A.capital,
      dd: cellPayoff("defect", "defect", ctx).A.capital,
    } : null,
    npc_win_rate: meta && rounds > 0 ? npcWins / rounds : null,
    belief,
    predicted_coop: tier === "sovereign" ? pCoop : null,
  };
  return { choices, info };
}
