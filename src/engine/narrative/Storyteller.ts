/**
 * RimWorld-style storyteller (Cassandra pattern): a tension budget with a build → storm → breather rhythm.
 *
 *   tension ∈ [0,100]. Each year: tension += pressure(ctx) − 6 (natural release).
 *   pressure comes from the state: scarcity +6, rat race +5, debt_ratio>1 +3, parent sick +4, enemies +2/each,
 *   hooks +3/each, crisis phase +3, bandwidth lock +3. Quiet, comfortable lives still build +2/yr so no one
 *   gets 20 empty years.
 *   Firing: a major storylet fires when tension ≥ threshold (base 35) OR a storylet of urgency ≥ 80 is eligible.
 *   After it fires: tension −= storylet.tension, and the storyteller enters BREATHER for 1–3 years during which
 *   only urgent storylets (≥ 80) may fire and the year gets a vignette (or a reflection milestone).
 *   Phase MILESTONE: at ages 15/30/50/70 the reflection storylet is forced regardless of tension.
 */
import type { FactContext } from "./types.ts";
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";

export type StoryPhase = "build" | "storm" | "breather";

export interface StorytellerState {
  tension: number;
  phase: StoryPhase;
  breather_until: number;     // player age
  last_major_age: number;
  majors: number;
  /** For deterministic variety: base threshold drawn per life (Cassandra 30 .. Randy 45). */
  threshold: number;
}

export function createStoryteller(rng: Rng): StorytellerState {
  return { tension: 10, phase: "build", breather_until: 0, last_major_age: 0, majors: 0, threshold: 30 + Math.round(rng.next() * 15) };
}

export function pressure(ctx: FactContext): number {
  let p = 2;
  if (ctx.scarcity) p += 6;
  if (ctx.rat_race) p += 5;
  if (ctx.debt_ratio > 1) p += 3;
  if (ctx.parent_sick) p += 4;
  p += 2 * Math.min(3, ctx.enemies);
  p += 3 * Math.min(2, Object.keys(ctx.hooks).length);
  if (ctx.econ_phase === "crisis") p += 3;
  if (ctx.bandwidth_locked) p += 3;
  if (ctx.rich && ctx.allies >= 2) p -= 2;
  return p;
}

export interface StoryDecision {
  /** Minimum urgency a storylet needs this year (0 = anything, 80 = urgent only, 101 = nothing). */
  minUrgency: number;
  /** Whether a quiet-year vignette should be written. */
  vignette: boolean;
  phase: StoryPhase;
}

export const MILESTONES = [15, 30, 50, 70];

export function decide(st: StorytellerState, ctx: FactContext, rng: Rng): StoryDecision {
  st.tension = clamp(st.tension + pressure(ctx) - 6, 0, 100);
  if (ctx.age < st.breather_until) { st.phase = "breather"; return { minUrgency: 80, vignette: true, phase: "breather" }; }
  const yearsQuiet = ctx.age - st.last_major_age;
  // Storm when tension crosses the threshold, with a soft floor so a comfortable life still gets a scene every ~6 years.
  const ready = st.tension >= st.threshold || yearsQuiet >= 6 + Math.floor(rng.next() * 3);
  if (ready) { st.phase = "storm"; return { minUrgency: 0, vignette: false, phase: "storm" }; }
  st.phase = "build";
  // Build phase: urgent storylets still fire (a creditor does not wait for drama); soft ones wait.
  return { minUrgency: 60, vignette: true, phase: "build" };
}

/** Call after a storylet actually fired. */
export function onFired(st: StorytellerState, age: number, tensionCost: number, rng: Rng): void {
  st.tension = clamp(st.tension - tensionCost, 0, 100);
  st.last_major_age = age;
  st.majors += 1;
  if (tensionCost >= 15) st.breather_until = age + 1 + Math.floor(rng.next() * 3);
}
