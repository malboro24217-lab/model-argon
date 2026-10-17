/**
 * The Awakening Protocol (spec §8).
 *   Phase 1 Autopilot            Agency < 0.3
 *   Phase 2 Phase Change         triggered by a survival crisis; prefrontal restructuring
 *   Phase 3 Strategic Meta-View  Agency > 0.7
 *   Phase 4 Topology Endgame     set by the runner at end of life
 *
 * A crisis is any of: Bio-Energy < 30 % of cap, insolvency (an overdraft this tick larger than half a quarter's
 * survival, or net worth liquid + 0.8·illiquid − debt below −2 quarters of survival — a serviced mortgage is not a crisis),
 * chronic scarcity (every 8th consecutive quarter under the survival threshold — the slow crisis),
 * a betrayal breach (sucker's payoff on a stake ≥ one quarter of income), or a job-loss shock.
 * Each crisis survived gives an Agency jump  (0.08 + 0.16·u) · (bandwidth/100)^1.5 / (1 + 0.5·crises_already_survived),  u ~ U(0,1)
 * — the first crisis teaches most; by the fourth the same blow teaches a third as much (habituation):
 * the same crisis teaches more to a mind with spare bandwidth (this is the cruelty of the trap —
 * the people hit hardest have the least bandwidth to learn from it). At bw 70 the mean jump ≈ 0.076;
 * at bw 25 it is ≈ 0.02, so a scarcity-locked character needs many crises to wake up.
 * A Phase Change (the restructuring that widens the ChoiceFilter) is declared when the jump carries
 * Agency across 0.3, or on the third crisis survived if Agency is at least 0.22 (repeated trauma only
 * restructures a mind that still has some room to move).
 * It is not permanent: if Agency sits below 0.2 for 8 consecutive quarters the script reasserts itself and
 * the character relapses into Autopilot (phase_changed = false, relapses += 1). Awakening must be defended.
 * Only one jump per 4 ticks: trauma needs time to become insight.
 */
import type { WorldState, AwakeningPhase } from "../types/index.ts";
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";

export type CrisisKind = "bio_collapse" | "insolvency" | "betrayal" | "job_loss" | "chronic_scarcity";

export interface AwakeningResult {
  crisis: CrisisKind | null;
  phase_change: boolean;
  relapse: boolean;
  agency_jump: number;
  phase_before: AwakeningPhase;
  phase_after: AwakeningPhase;
}

export function phaseFor(agency: number, phaseChanged: boolean, dead: boolean): AwakeningPhase {
  if (dead) return "topology_endgame";
  if (agency > 0.7) return "strategic_meta_view";
  if (agency >= 0.3 || phaseChanged) return "phase_change";
  return "autopilot";
}

export const RELAPSE_AGENCY = 0.2;
export const RELAPSE_TICKS = 8;

/** Relapse check, run every tick after drift. Returns true when the character slid back into Autopilot. */
export function checkRelapse(s: WorldState): boolean {
  if (!s.perception.phase_changed) { s.perception.low_agency_streak = 0; return false; }
  if (s.capitals.agency < RELAPSE_AGENCY) s.perception.low_agency_streak += 1; else s.perception.low_agency_streak = 0;
  if (s.perception.low_agency_streak >= RELAPSE_TICKS) {
    s.perception.phase_changed = false;
    s.perception.low_agency_streak = 0;
    s.perception.relapses += 1;
    return true;
  }
  return false;
}

export interface CrisisFlags { betrayal: boolean; job_loss: boolean; overdraft: number }

export function detectCrisis(s: WorldState, flags: CrisisFlags): CrisisKind | null {
  const c = s.capitals;
  if (c.bioEnergy.value < 0.3 * c.bioEnergy.cap) return "bio_collapse";
  const a = c.capitalAssets;
  const surv = s.spawn.macro.survival_cost_quarterly;
  if (flags.overdraft > 0.5 * surv || a.liquid + 0.8 * a.illiquid - a.debt < -2 * surv) return "insolvency";
  if (flags.betrayal) return "betrayal";
  if (flags.job_loss) return "job_loss";
  if (s.stress.ticks_in_scarcity > 0 && s.stress.ticks_in_scarcity % 8 === 0) return "chronic_scarcity";
  return null;
}

const lastPhaseChangeTick = new WeakMap<WorldState, number>();

export function awaken(s: WorldState, flags: CrisisFlags, rng: Rng): AwakeningResult {
  const before = s.perception.phase;
  const relapse = checkRelapse(s);
  const crisis = detectCrisis(s, flags);
  let jump = 0, changed = false;
  if (crisis) {
    const last = lastPhaseChangeTick.get(s) ?? -Infinity;
    if (s.tick - last >= 4) {
      const bw = s.capitals.cognitiveBandwidth.value;
      jump = (0.08 + 0.16 * rng.next()) * Math.pow(bw / 100, 1.5) / (1 + 0.5 * s.perception.crises_survived);
      const before = s.capitals.agency;
      s.capitals = { ...s.capitals, agency: clamp(before + jump, 0, 1) };
      s.perception.crises_survived += 1;
      lastPhaseChangeTick.set(s, s.tick);
      const crossed = before < 0.3 && s.capitals.agency >= 0.3;
      if (!s.perception.phase_changed && (crossed || (s.perception.crises_survived >= 3 && s.capitals.agency >= 0.22))) {
        s.perception.phase_changed = true;
        changed = true;
      }
    }
  }
  const after = phaseFor(s.capitals.agency, s.perception.phase_changed, s.dead);
  s.perception.phase = after;
  return { crisis, phase_change: changed, relapse, agency_jump: jump, phase_before: before, phase_after: after };
}
