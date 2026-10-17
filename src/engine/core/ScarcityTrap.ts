/**
 * Scarcity Trap / Bandwidth Lock (spec §2, Cognitive Bandwidth row) and the Rat Race Loop (Capital row).
 *
 * Empirical anchor: Mullainathan & Shafir (2013) measured a ~13-point IQ-equivalent drop under
 * financial scarcity. We model the tax as up to 25 bandwidth points at zero liquidity,
 * scaling linearly as cash approaches the survival threshold, plus a stress term.
 */
import type { WorldState, CapitalDelta } from "../types/index.ts";
import { clamp } from "./Rng.ts";

/** Two quarters of survival cost: below this the mind starts tunnelling on survival. */
export function survivalThreshold(s: WorldState): number {
  return 2 * s.spawn.macro.survival_cost_quarterly;
}

/** Bandwidth below which negotiation-optimal choices are hidden by the ChoiceFilter. */
export const BANDWIDTH_LOCK_LEVEL = 30;
/** Stress above which the trap also fires regardless of cash. */
export const CRITICAL_STRESS = 70;

export interface ScarcityReport {
  triggered: boolean;
  bandwidth_tax: number;
  reason: "liquidity" | "stress" | "both" | null;
  locked: boolean;
}

/**
 * tax = 25 · max(0, 1 − liquid/threshold)  +  0.5 · max(0, stress − 70)
 * Debt makes it worse: if net liquid (liquid − debt) < 0, add 5.
 */
export function scarcityTax(s: WorldState): ScarcityReport {
  const thr = survivalThreshold(s);
  const a = s.capitals.capitalAssets;
  const liqTerm = 25 * clamp(1 - a.liquid / thr, 0, 1);
  const stressTerm = 0.5 * Math.max(0, s.stress.value - CRITICAL_STRESS);
  const debtTerm = a.liquid - a.debt < 0 ? 5 : 0;
  const tax = liqTerm + stressTerm + debtTerm;
  const byLiq = liqTerm > 0 || debtTerm > 0;
  const byStress = stressTerm > 0;
  const reason = byLiq && byStress ? "both" : byLiq ? "liquidity" : byStress ? "stress" : null;
  const after = s.capitals.cognitiveBandwidth.value - tax;
  return { triggered: tax > 0, bandwidth_tax: tax, reason, locked: after < BANDWIDTH_LOCK_LEVEL };
}

export function scarcityDelta(s: WorldState): CapitalDelta {
  return { bandwidth: -scarcityTax(s).bandwidth_tax };
}

/* ------------------------------------------------------------------ Rat Race Loop */

export interface RatRaceReport {
  active: boolean;
  debt_service_ratio: number;
  reason: "debt_service" | "chronic_scarcity" | null;
}

/**
 * Rat Race = running to stand still. Active when either:
 *   (a) quarterly debt service (interest + 5 % principal) exceeds 40 % of quarterly income, or
 *   (b) the character has been under the survival threshold for ≥ 4 consecutive ticks.
 */
export function ratRace(s: WorldState): RatRaceReport {
  const a = s.capitals.capitalAssets;
  const qRate = s.spawn.macro.interest_rate / 4;
  const service = a.debt * (qRate + 0.05);
  const ratio = a.income_quarterly > 0 ? service / a.income_quarterly : (a.debt > 0 ? Infinity : 0);
  if (ratio > 0.4) return { active: true, debt_service_ratio: ratio, reason: "debt_service" };
  if (s.stress.ticks_in_scarcity >= 4) return { active: true, debt_service_ratio: ratio, reason: "chronic_scarcity" };
  return { active: false, debt_service_ratio: ratio, reason: null };
}

/* ------------------------------------------------------------------------ Stress */

/**
 * Stress is a leaky integrator (first-order low-pass) toward a target set by pressures:
 *   target = 20 + 35·max(0, workload − 1)/0.4 + 30·max(0, 1 − liquid/threshold) + 15·[debt_service_ratio > 0.4] + 10·[bio < 30 % cap]
 *   stress ← stress + 0.4·(target − stress)
 * Low dopamine sensitivity dampens the swing (×0.85), high amplifies (×1.15).
 */
export function nextStress(s: WorldState): number {
  const thr = survivalThreshold(s);
  const a = s.capitals.capitalAssets;
  const rr = ratRace(s);
  const bioRatio = s.capitals.bioEnergy.value / Math.max(1, s.capitals.bioEnergy.cap);
  const target =
    20 +
    35 * clamp((s.stress.workload - 1) / 0.4, 0, 1.5) +
    30 * clamp(1 - a.liquid / thr, 0, 1) +
    (rr.debt_service_ratio > 0.4 ? 15 : 0) +
    (bioRatio < 0.3 ? 10 : 0);
  const gain = 0.85 + 0.3 * s.spawn.biology.baseline_dopamine_sensitivity;
  return clamp(s.stress.value + 0.4 * (target * gain - s.stress.value), 0, 100);
}
