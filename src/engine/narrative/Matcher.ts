/**
 * Valve-style rule matcher (Elan Ruskin, GDC 2012 "Dynamic Dialog").
 * Each year the host assembles one FactContext; candidate storylets are gated by prerequisites, then
 * ranked by (urgency band, specificity, random). Most specific match wins inside the urgency band.
 * Vignettes use the same scoring with text only.
 */
import type { FactContext, Storylet, VignetteRule } from "./types.ts";
import type { Rng } from "../core/Rng.ts";

export interface FiredRecord { id: string; age: number; }

export interface MatchOptions {
  /** Below this urgency a storylet is "soft" and may be suppressed by the storyteller. */
  minUrgency: number;
  /** Ids already fired (for once/cooldown). */
  history: FiredRecord[];
  age: number;
  /** id → group for every storylet that can appear in history (defaults to the pool's own). */
  groups?: Map<string, string>;
}

/** Build the id → group index once per pool. */
export function groupIndex(pool: Storylet[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const s of pool) if (s.group !== undefined) m.set(s.id, s.group);
  return m;
}

export function eligible(pool: Storylet[], ctx: FactContext, opts: MatchOptions): Array<{ s: Storylet; spec: number }> {
  const out: Array<{ s: Storylet; spec: number }> = [];
  const groupOf = opts.groups ?? groupIndex(pool);
  for (const s of pool) {
    if (s.urgency < opts.minUrgency) continue;
    const g = s.group;
    let last: FiredRecord | undefined;
    for (let i = opts.history.length - 1; i >= 0; i--) { const h = opts.history[i]!; if (h.id === s.id || (g !== undefined && groupOf.get(h.id) === g)) { last = h; break; } }
    if (last) {
      if (s.once) continue;
      if (opts.age - last.age < s.cooldownYears) continue;
    }
    if (s.requires_open && s.requires_open.some((d) => ctx.doors.has(d))) continue;
    let ok = false;
    try { ok = s.prerequisites(ctx); } catch { ok = false; }
    if (!ok) continue;
    let spec = 0;
    try { spec = s.specificity(ctx); } catch { spec = 0; }
    out.push({ s, spec });
  }
  return out;
}

/**
 * Pick one. Urgent (≥ 80) always beats non-urgent. Within a band, highest specificity wins; ties break
 * randomly (so two equally specific storylets alternate across lives instead of one always shadowing the other).
 */
export function selectStorylet(pool: Storylet[], ctx: FactContext, opts: MatchOptions, rng: Rng): Storylet | null {
  const cands = eligible(pool, ctx, opts);
  if (!cands.length) return null;
  const band = (u: number) => (u >= 80 ? 2 : u >= 40 ? 1 : 0);
  cands.sort((a, b) => band(b.s.urgency) - band(a.s.urgency) || b.spec - a.spec);
  const top = cands[0]!;
  const ties = cands.filter((c) => band(c.s.urgency) === band(top.s.urgency) && c.spec === top.spec);
  return rng.pick(ties).s;
}

export function selectVignette(rules: VignetteRule[], ctx: FactContext, rng: Rng, recent: string[]): VignetteRule | null {
  let best: VignetteRule[] = [], bestSpec = -1;
  for (const r of rules) {
    if (recent.includes(r.id)) continue;
    let ok = false; try { ok = r.when(ctx); } catch { ok = false; }
    if (!ok) continue;
    if (r.specificity > bestSpec) { bestSpec = r.specificity; best = [r]; }
    else if (r.specificity === bestSpec) best.push(r);
  }
  return best.length ? rng.pick(best) : null;
}

/** Helper for authoring: counts how many of the given predicates hold — the specificity score. */
export function countTrue(...preds: boolean[]): number { return preds.filter(Boolean).length; }
