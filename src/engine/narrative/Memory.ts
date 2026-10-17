/**
 * CK3-style social memory on top of the Social Ledger.
 *   opinion(npc) = trust edge + Σ live memory-token weights        (clamped −1..1)
 *   tokens decay linearly toward 0 each year; betrayals decay 4× slower than favours.
 *   Secrets leak: each year every holder tells each listener with p = 0.12 · trust(holder→listener)⁺ · weight(holder).
 *   Fuse: a secret explodes on its own with p = 0.15/yr once player age ≥ fuse_age; or when a holder
 *   with opinion ≤ −0.3 chooses to use it (that is a storylet's job; this module just exposes hooks()).
 */
import type { WorldState } from "../types/index.ts";
import { PLAYER_NODE_ID } from "../types/index.ts";
import type { MemoryToken, MemoryTag, Secret, SecretTag, Hook } from "./types.ts";
import { getEdge, propagate } from "../gametheory/SocialLedger.ts";
import { clamp } from "../core/Rng.ts";
import type { Rng } from "../core/Rng.ts";

export interface NarrativeMemory {
  tokens: Map<string, MemoryToken[]>;
  secrets: Secret[];
  nextSecretId: number;
}

export function createMemory(): NarrativeMemory { return { tokens: new Map(), secrets: [], nextSecretId: 1 }; }

const DEFAULT_DECAY: Record<"good" | "bad", number> = { good: 0.03, bad: 0.01 };

export function addMemory(m: NarrativeMemory, npcId: string, tag: MemoryTag, age: number, weight: number, note: string, decayPerYear?: number): MemoryToken {
  const t: MemoryToken = { tag, age, weight: clamp(weight, -1, 1), decayPerYear: decayPerYear ?? (weight < 0 ? DEFAULT_DECAY.bad : DEFAULT_DECAY.good), note };
  const arr = m.tokens.get(npcId) ?? [];
  arr.push(t); m.tokens.set(npcId, arr);
  return t;
}

export function memoriesOf(m: NarrativeMemory, npcId: string): MemoryToken[] { return m.tokens.get(npcId) ?? []; }

/** Strongest live grudge or favour this NPC holds, for dialogue ("tao vẫn chưa quên vụ…"). */
export function strongestMemory(m: NarrativeMemory, npcId: string, sign: -1 | 1): MemoryToken | null {
  let best: MemoryToken | null = null;
  for (const t of memoriesOf(m, npcId)) if (Math.sign(t.weight) === sign && (!best || Math.abs(t.weight) > Math.abs(best.weight))) best = t;
  return best;
}

export function opinionOf(s: WorldState, m: NarrativeMemory, npcId: string): number {
  const e = getEdge(s.graph, npcId, PLAYER_NODE_ID);
  let v = e ? e.trust : 0;
  for (const t of memoriesOf(m, npcId)) v += t.weight;
  return clamp(v, -1, 1);
}

/** Yearly decay; drops tokens that reached 0. */
export function decayMemories(m: NarrativeMemory): void {
  for (const [id, arr] of m.tokens) {
    const keep: MemoryToken[] = [];
    for (const t of arr) {
      const w = t.weight > 0 ? Math.max(0, t.weight - t.decayPerYear) : Math.min(0, t.weight + t.decayPerYear);
      if (w !== 0) keep.push({ ...t, weight: w });
    }
    if (keep.length) m.tokens.set(id, keep); else m.tokens.delete(id);
  }
}

export function addSecret(m: NarrativeMemory, tag: SecretTag, age: number, severity: number, fuseYears: [number, number], rng: Rng, note: string, knownBy: string[] = []): Secret {
  const sec: Secret = { id: `sec${m.nextSecretId++}`, tag, age, severity: clamp(severity, 0, 1), holders: [...knownBy], fuse_age: age + fuseYears[0] + Math.floor(rng.next() * (fuseYears[1] - fuseYears[0] + 1)), exploded: false, note };
  m.secrets.push(sec);
  return sec;
}

/** Secrets leak one hop per year along positive edges between NPCs. Returns new (secret, holder) pairs. */
export function leakSecrets(s: WorldState, m: NarrativeMemory, rng: Rng): Array<{ secret: Secret; to: string }> {
  const out: Array<{ secret: Secret; to: string }> = [];
  for (const sec of m.secrets) {
    if (sec.exploded) continue;
    const newHolders: string[] = [];
    for (const h of sec.holders) {
      const w = s.graph.nodes.get(h)?.weight ?? 0.3;
      for (const e of s.graph.edges.values()) {
        if (e.from !== h || e.to === PLAYER_NODE_ID || e.trust <= 0) continue;
        if (sec.holders.includes(e.to) || newHolders.includes(e.to)) continue;
        if (rng.chance(0.12 * e.trust * w)) { newHolders.push(e.to); out.push({ secret: sec, to: e.to }); }
      }
    }
    sec.holders.push(...newHolders);
  }
  return out;
}

/** Hooks: secrets held by someone who dislikes the player enough to use them (opinion ≤ −0.3), or any holder for a severe secret. */
export function hooks(s: WorldState, m: NarrativeMemory): Hook[] {
  const out: Hook[] = [];
  for (const sec of m.secrets) {
    if (sec.exploded) continue;
    for (const h of sec.holders) {
      if (!s.npcs.has(h)) continue;
      const op = opinionOf(s, m, h);
      if (op <= -0.3 || sec.severity >= 0.7) out.push({ secret: sec, holder: h });
    }
  }
  return out;
}

/**
 * Delayed fuse. Once player age ≥ fuse_age, each year the secret explodes with p = 0.15 (p = 0.35 if any holder
 * dislikes the player). Explosion: reputation ripple from every holder, −severity on each holder's edge, and the
 * secret is marked. Returns exploded secrets this year.
 */
export function fuseCheck(s: WorldState, m: NarrativeMemory, age: number, rng: Rng): Secret[] {
  const boom: Secret[] = [];
  for (const sec of m.secrets) {
    if (sec.exploded || age < sec.fuse_age) continue;
    const hostile = sec.holders.some((h) => opinionOf(s, m, h) <= -0.3);
    if (!rng.chance(hostile ? 0.35 : 0.15)) continue;
    sec.exploded = true;
    const sources = sec.holders.length ? sec.holders : [...s.npcs.keys()].slice(0, 1);
    for (const h of sources) if (s.npcs.has(h)) propagate(s.graph, h, -0.5 * sec.severity, s.tick);
    boom.push(sec);
  }
  return boom;
}
