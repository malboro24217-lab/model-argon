/**
 * Bộ công cụ viết gói "con đường đời". Mọi gói trong paths/ chỉ dùng các helper ở đây — xem docs/content-guide.md.
 *
 * Vòng đời một con đường:
 *   talent (8–16 tuổi, cờ talent_<id>)  →  cảnh chọn nghề có thêm lựa chọn con đường
 *   door   (giữa đời, thẻ cơ hội)       →  become:<id>  (host đặt life_<id>, chức danh, thu nhập, p_<id>=0)
 *   beat 1..5 (mạch truyện có cao trào, mỗi nhịp cách nhau gap năm, nối nhau qua bộ đếm p_<id>)
 *   daily (chuyện thường ngày của con đường, lặp tối đa 2 lần nếu có vary)
 *   cross (con đường chạm vào gia đình, bạn đời, con cái)
 */
import type { Storylet, FactContext, StoryletView, Choice, CastRole, Effect } from "../types.ts";
import { repeatCap } from "../Matcher.ts";
import { prov } from "../Causality.ts";
import { PATHS } from "./registry.ts";

export type Build = (c: FactContext, N: (id: string) => string) => StoryletView;

export const C = (label: string, effects: Effect, hint?: string, extra: Partial<Choice> = {}): Choice => ({ label, ...(hint !== undefined ? { hint } : {}), effects, ...extra });
export const T = (title: string, text: string, choices: Choice[], def = 0, more: Partial<StoryletView> = {}): StoryletView => ({ title, text, choices, def, ...more });
export const f = (c: FactContext, flag: string): boolean => c.flags.has(flag);
export const role = (c: FactContext, r: CastRole): string | undefined => c.cast[r];
/** Biến thể văn bản theo (id, tuổi): thẻ gọi vary() được phép lặp 2 lần trong đời, thẻ khác chỉ 1 lần. */
export const vary = (id: string, age: number, arr: string[]): string => { let x = age * 31; for (const ch of id) x = (x * 33 + ch.charCodeAt(0)) >>> 0; return arr[x % arr.length]!; };

export const life = (path: string): string => `life_${path}`;
export const talentFlag = (path: string): string => `talent_${path}`;
/** Bước vào con đường: host đặt cờ life_<id>, chức danh, thu nhập, và bộ đếm nhịp truyện. */
export const become = (path: string): Effect => ({ custom: `become:${path}` });
/** Rời con đường (bỏ nghề, bị đuổi, giải nghệ). */
export const leave = (path: string): Effect => ({ unflags: [life(path)], custom: "job_lose" });

const TEMPERS = ["curious", "bold", "kind", "tough"] as const;
export const temperOf = (c: FactContext): string | null => TEMPERS.find((t) => c.flags.has(`temper_${t}`)) ?? null;

/** Lát cắt cố định theo đời: mỗi đời thấy một tập con khác nhau của các thẻ cùng loại (xác định theo c.luck). */
export function slice(c: FactContext, key: string, p: number): boolean {
  let x = Math.floor((c.luck ?? 0) * 4294967295) >>> 0;
  for (const ch of key) x = Math.imul(x ^ ch.charCodeAt(0), 2654435761) >>> 0;
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296 < p;
}

/** Hiệu ứng bộ đếm phải gắn vào MỌI lựa chọn của một nhịp truyện: tiến một nhịp, ghi tuổi. */
export const step = (c: FactContext, path: string, more: Record<string, number> = {}): Record<string, number> =>
  ({ [`p_${path}`]: 1, [`p_${path}_at`]: c.age - (c.counters[`p_${path}_at`] ?? 0), ...more });

const inAges = (c: FactContext, a: [number, number]) => c.age >= a[0] && c.age <= a[1];
/** Một con đường chỉ có chuyện khi đã đủ tuổi bước vào nó. */
const adult = (c: FactContext, path: string) => c.age >= (PATHS[path]?.ages[0] ?? 0);

/** Năng khiếu hồi nhỏ. Lựa chọn "nuôi" năng khiếu phải có flags: [talentFlag(path)]; mọi lựa chọn phải có counters: { talents_seen: 1 }. */
export function talent(path: string, id: string, ages: [number, number], when: (c: FactContext) => boolean, build: Build): Storylet {
  const def = PATHS[path]!;
  return {
    id, category: "micro", urgency: 18, cooldownYears: 99, once: true, maxPerLife: 1, tension: 1,
    prerequisites: (c) => inAges(c, ages) && !f(c, talentFlag(path)) && !f(c, life(path)) && (c.counters.talents_seen ?? 0) < 2 &&
      slice(c, "t:" + path, def.talent.includes(temperOf(c) ?? "") ? 0.3 : 0.04) && when(c),
    specificity: () => 5, build, meta: { path, kind: "talent" },
  };
}

/** Thẻ cơ hội bước vào con đường giữa đời. Lựa chọn bước vào phải có ...become(path); mọi lựa chọn có counters: { doors_seen: 1 }. */
export function door(path: string, id: string, ages: [number, number], when: (c: FactContext) => boolean, build: Build, p = 0.12): Storylet {
  const def = PATHS[path]!;
  return {
    id, category: "arc", urgency: 45, cooldownYears: 99, once: true, tension: 6,
    prerequisites: (c) => inAges(c, ages) && inAges(c, def.ages) && !f(c, life(path)) && (c.counters.doors_seen ?? 0) < 3 &&
      (f(c, talentFlag(path)) || slice(c, "d:" + id, p)) && when(c),
    specificity: (c) => (f(c, talentFlag(path)) ? 7 : 6), build, meta: { path, kind: "door" },
  };
}

/** Nhịp truyện thứ n (1..5) của con đường: khởi đầu → bứt lên → khủng hoảng → đỉnh hoặc vực → di sản. Mọi lựa chọn phải có counters: step(c, path). */
export function beat(path: string, n: number, gapYears: number, build: Build, when: (c: FactContext) => boolean = () => true): Storylet {
  return {
    id: `${path}_b${n}`, category: "arc", urgency: 84, cooldownYears: 99, once: true, tension: 6 + n,
    prerequisites: (c) => f(c, life(path)) && adult(c, path) && (c.counters[`p_${path}`] ?? 0) === n - 1 && c.counters[`p_${path}_at`] !== undefined &&
      c.age - c.counters[`p_${path}_at`]! >= gapYears && when(c),
    specificity: () => 7, causes: () => [prov.flag(life(path))], build, meta: { path, kind: "beat" },
  };
}

/** Chuyện thường ngày của con đường (đang đi con đường đó). Dùng vary() nếu muốn thẻ được quay lại lần hai. */
export function daily(path: string, id: string, ages: [number, number], cooldown: number, build: Build, when: (c: FactContext) => boolean = () => true): Storylet {
  return {
    id, category: "micro", urgency: 18, cooldownYears: Math.max(6, cooldown), tension: 1, maxPerLife: repeatCap(build),
    prerequisites: (c) => f(c, life(path)) && adult(c, path) && inAges(c, ages) && when(c),
    specificity: () => 5, causes: () => [prov.flag(life(path))], build, meta: { path, kind: "daily" },
  };
}

/** Con đường chạm vào gia đình / bạn đời / con cái (một lần). */
export function cross(path: string, id: string, ages: [number, number], when: (c: FactContext) => boolean, build: Build): Storylet {
  return {
    id, category: "micro", urgency: 18, cooldownYears: 99, once: true, maxPerLife: 1, tension: 2,
    prerequisites: (c) => f(c, life(path)) && adult(c, path) && inAges(c, ages) && when(c),
    specificity: () => 5, causes: () => [prov.flag(life(path))], build, meta: { path, kind: "cross" },
  };
}

/** Thời sự: chuyện của thời đại chạm vào đời (dịch bệnh, thiên tai, khủng hoảng…). p = tỉ lệ đời gặp. major = chen vào như biến cố lớn. */
export function news(id: string, ages: [number, number], p: number, when: (c: FactContext) => boolean, build: Build, major = false): Storylet {
  return {
    id, category: major ? "social" : "micro", urgency: major ? 60 : 20, cooldownYears: 99, once: true, maxPerLife: 1, tension: major ? 8 : 2,
    prerequisites: (c) => inAges(c, ages) && slice(c, "n:" + id, p) && when(c),
    specificity: () => (major ? 5 : 3), build, meta: { kind: "news" },
  };
}
