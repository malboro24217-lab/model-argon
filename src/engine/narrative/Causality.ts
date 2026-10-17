/**
 * Causality — what makes a choice matter.
 *
 *  Mark      : a permanent record of one decision (age, scene, what was chosen, who witnessed).
 *  Provenance: every durable thing a decision creates (flag, memory token, secret, closed door) is stamped
 *              with the mark id, so when a later storylet is enabled by that thing, the engine can say
 *              "because at 22 you did X" and attach the consequence back to the mark.
 *  Doors     : named futures a decision can close for good. Storylets may require a door to be open.
 *
 * Pure data + pure functions. The host stamps provenance as it applies effects.
 */
import type { FactContext } from "./types.ts";

export interface Consequence { age: number; storylet: string; text: string; }

export interface Mark {
  id: string;
  age: number;
  storylet: string;
  title: string;
  choice: string;
  /** Alternatives that were visible at the time (labels), for counterfactual replay. */
  alternatives: string[];
  /** Index of the chosen alternative among the scene's choices. */
  choice_index: number;
  witnesses: string[];
  doors_closed: DoorId[];
  consequences: Consequence[];
}

export type DoorId = "inheritance" | "partner_circle" | "village_trust" | "family_table" | "clean_record" | "return_home";

export const DOORS: Record<DoorId, { vi: string; desc: string }> = {
  inheritance: { vi: "Thừa kế", desc: "Phần nhà đất của cha mẹ sẽ không còn tên bạn." },
  partner_circle: { vi: "Vòng làm ăn", desc: "Những người từng rủ bạn vào kèo sẽ không rủ nữa, và bạn bè của họ cũng thế." },
  village_trust: { vi: "Tín nhiệm làng", desc: "Những việc chung của xóm sẽ không còn chỗ cho bạn." },
  family_table: { vi: "Mâm cơm gia đình", desc: "Anh chị em sẽ không chia sẻ với bạn phần gánh nặng, và cả phần thừa hưởng." },
  clean_record: { vi: "Quá khứ sạch", desc: "Từ nay có một chuyện người ta có thể dùng để nắm thóp bạn." },
  return_home: { vi: "Đường về", desc: "Quê không còn là nơi bạn có thể quay lại như chưa từng đi." },
};

/** Provenance key for a durable artefact. */
export const prov = {
  flag: (f: string) => `flag:${f}`,
  memory: (npc: string, tag: string) => `memory:${npc}:${tag}`,
  secret: (tag: string) => `secret:${tag}`,
  door: (d: DoorId) => `door:${d}`,
  opinion: (npc: string) => `opinion:${npc}`, // resolved by the host to the strongest memory of that NPC
};

export interface CausalityState {
  marks: Mark[];
  /** provenance key → mark id */
  origin: Map<string, string>;
  doors: Set<DoorId>;
  nextId: number;
}

export function createCausality(): CausalityState { return { marks: [], origin: new Map(), doors: new Set(), nextId: 1 }; }

export function addMark(c: CausalityState, m: Omit<Mark, "id" | "consequences">): Mark {
  const mark: Mark = { ...m, id: `m${c.nextId++}`, consequences: [] };
  c.marks.push(mark);
  return mark;
}

export function stamp(c: CausalityState, key: string, markId: string): void { if (!c.origin.has(key)) c.origin.set(key, markId); }

export function closeDoor(c: CausalityState, d: DoorId, markId: string): boolean {
  if (c.doors.has(d)) return false;
  c.doors.add(d); stamp(c, prov.door(d), markId);
  const m = c.marks.find((x) => x.id === markId); if (m && !m.doors_closed.includes(d)) m.doors_closed.push(d);
  return true;
}

export function markById(c: CausalityState, id: string): Mark | undefined { return c.marks.find((m) => m.id === id); }

/** Resolve provenance keys to the marks that created them (deduplicated, in mark order). */
export function resolveCauses(c: CausalityState, keys: string[]): Mark[] {
  const seen = new Set<string>(); const out: Mark[] = [];
  for (const k of keys) { const id = c.origin.get(k); if (!id || seen.has(id)) continue; seen.add(id); const m = markById(c, id); if (m) out.push(m); }
  return out.sort((a, b) => a.age - b.age);
}

/** Record that `storylet` fired at `age` because of `marks`. */
export function attachConsequence(marks: Mark[], age: number, storylet: string, text: string): void {
  for (const m of marks) if (!m.consequences.some((x) => x.age === age && x.storylet === storylet)) m.consequences.push({ age, storylet, text });
}

/**
 * Pivotal marks for the counterfactual: ranked by (doors closed ×3 + consequences + secrets created),
 * ties broken by earlier age (an early fork diverges more). Only marks with ≥ 2 visible alternatives.
 */
export function pivotalMarks(c: CausalityState, n: number, extraScore: (m: Mark) => number = () => 0): Mark[] {
  return [...c.marks]
    .filter((m) => m.alternatives.length >= 2)
    .map((m) => ({ m, s: m.doors_closed.length * 3 + m.consequences.length + extraScore(m) }))
    .sort((a, b) => b.s - a.s || a.m.age - b.m.age)
    .slice(0, n)
    .map((x) => x.m);
}

/** Host helper: which doors a FactContext says are closed (mirrors CausalityState.doors). */
export function doorOpen(ctx: FactContext, d: DoorId): boolean { return !ctx.doors.has(d); }
