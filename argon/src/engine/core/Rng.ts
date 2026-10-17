/** Deterministic PRNG (mulberry32) so every life is replayable from its seed. */
export interface Rng {
  next(): number;              // uniform [0,1)
  normal(mu?: number, sd?: number): number;
  chance(p: number): boolean;
  pick<T>(arr: readonly T[]): T;
  int(maxExclusive: number): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    normal(mu = 0, sd = 1) {
      let u = 0, v = 0;
      while (u === 0) u = next();
      while (v === 0) v = next();
      return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    chance: (p) => next() < p,
    pick: (arr) => {
      const x = arr[Math.floor(next() * arr.length)];
      if (x === undefined) throw new Error("pick() on empty array");
      return x;
    },
    int: (m) => Math.floor(next() * m),
  };
}

export const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));
