/**
 * Joint Venture Payoff Matrix (spec §6), stake-scaled, plus the Sovereign "arbitrage" row.
 *
 * Base cells at stake = 100 CU (spec numbers verbatim):
 *                     B: cooperate                              B: defect
 *   A: cooperate      Win-Win  +25 cap, +10 social, −5 bio      Sucker   A −40 cap −20 bw | B +60 cap
 *   A: defect         Exploit  A +60 cap | B −40 cap −20 bw     Mutual   both −20 cap, ledger severed
 *   A: arbitrage      see arbitragePayoff(): A exits the frame, keeps optionality
 *
 * Capital terms scale linearly with stake/100; bandwidth and bio are psychological and do not scale.
 * Institutional trust shrinks the defector's haul: exploit gain ×(1 − 0.4·institutional_trust),
 * because courts claw some of it back. Transaction-cost multiplier (reputation) scales the stake.
 */
import type { Move, NpcMove, PayoffDelta } from "../types/index.ts";

export interface MatrixContext {
  stake: number;                 // CU at risk, already multiplied by transaction_cost_multiplier
  institutional_trust: number;   // [0,1]
}

const zero = (): PayoffDelta => ({ capital: 0, bandwidth: 0, bio: 0, social: 0, severed: false });

export function cellPayoff(a: Move, b: NpcMove, ctx: MatrixContext): { A: PayoffDelta; B: PayoffDelta; cell: "win_win" | "sucker" | "exploitation" | "mutual_destruction" | "arbitrage" } {
  const k = ctx.stake / 100;
  const clawback = 1 - 0.4 * ctx.institutional_trust;
  if (a === "arbitrage") {
    const p = arbitragePayoff(b, ctx);
    return { A: p.A, B: p.B, cell: "arbitrage" };
  }
  if (a === "cooperate" && b === "cooperate") {
    return {
      A: { capital: 25 * k, bandwidth: 0, bio: -5, social: 10, severed: false },
      B: { capital: 25 * k, bandwidth: 0, bio: -5, social: 10, severed: false },
      cell: "win_win",
    };
  }
  if (a === "cooperate" && b === "defect") {
    return {
      A: { capital: -40 * k, bandwidth: -20, bio: 0, social: 0, severed: false },
      B: { capital: 60 * k * clawback, bandwidth: 0, bio: 0, social: -10, severed: false },
      cell: "sucker",
    };
  }
  if (a === "defect" && b === "cooperate") {
    return {
      A: { capital: 60 * k * clawback, bandwidth: 0, bio: 0, social: -10, severed: false },
      B: { capital: -40 * k, bandwidth: -20, bio: 0, social: 0, severed: false },
      cell: "exploitation",
    };
  }
  // defect / defect
  return {
    A: { capital: -20 * k, bandwidth: 0, bio: 0, social: -10, severed: true },
    B: { capital: -20 * k, bandwidth: 0, bio: 0, social: -10, severed: true },
    cell: "mutual_destruction",
  };
}

/**
 * Arbitrage (Sovereign third option): the player refuses the binary frame — restructures the deal
 * (escrow, milestone payments, or walks away to a better alternative).
 *   vs cooperate: both gain the escrowed cooperative surplus at 60 % (+15 cap each), A spends 10 bw structuring it
 *   vs defect:    the defector hits the escrow wall: A 0 cap, B −10 cap (wasted setup), A +5 social (seen as shrewd)
 * Arbitrage is never the sucker and never the exploiter; it is dominated by exploitation in a one-shot
 * against a sure cooperator, which is exactly why it only becomes visible once Agency is high.
 */
export function arbitragePayoff(b: NpcMove, ctx: MatrixContext): { A: PayoffDelta; B: PayoffDelta } {
  const k = ctx.stake / 100;
  if (b === "cooperate") {
    return {
      A: { capital: 15 * k, bandwidth: -10, bio: -2, social: 6, severed: false },
      B: { capital: 15 * k, bandwidth: 0, bio: -2, social: 6, severed: false },
    };
  }
  return {
    A: { capital: 0, bandwidth: -10, bio: 0, social: 5, severed: false },
    B: { capital: -10 * k, bandwidth: -5, bio: 0, social: -8, severed: false },
  };
}

/**
 * Nash check on the 2×2 core (cooperate/defect only). With the spec numbers the unique pure
 * equilibrium is (defect, defect): 60 > 25 and −20 > −40 for each player. Arbitrage rows are
 * excluded because NPCs cannot play them. Returns whether the realised cell is that equilibrium.
 */
export function isNashCell(a: Move, b: NpcMove, ctx: MatrixContext): boolean {
  if (a === "arbitrage") return false;
  const moves: NpcMove[] = ["cooperate", "defect"];
  const payA = (x: NpcMove, y: NpcMove) => cellPayoff(x, y, ctx).A.capital;
  const payB = (x: NpcMove, y: NpcMove) => cellPayoff(x, y, ctx).B.capital;
  const aBest = moves.every((alt) => payA(a, b) >= payA(alt, b));
  const bBest = moves.every((alt) => payB(a, b) >= payB(a, alt));
  return aBest && bBest;
}

/** Expected capital for the player given a belief P(B cooperates). Used by the heuristic agent and the Meta-View. */
export function expectedCapital(a: Move, pCoop: number, ctx: MatrixContext): number {
  return pCoop * cellPayoff(a, "cooperate", ctx).A.capital + (1 - pCoop) * cellPayoff(a, "defect", ctx).A.capital;
}
