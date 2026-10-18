/**
 * Bước ngoặt (Fate) — những thẻ rẽ nhánh đời sang một dòng thời gian khác.
 *
 *   Mỗi năm, host hỏi fateSlot(ctx): năm nay có một "chỗ" cho bước ngoặt không. Câu trả lời rút từ
 *   (hạt giống đời, tuổi) — KHÔNG phụ thuộc lựa chọn, nên đổi một lựa chọn không làm xê dịch những năm
 *   có bước ngoặt về sau; chỉ đổi thẻ NÀO nổ (vì điều kiện của thẻ đọc cờ, nghề, người thân, tiền…).
 *   Khi có chỗ, host chọn một thẻ trong FATE bằng Matcher (đặc hiệu cao thắng), thẻ đó thay cho các
 *   thẻ nhỏ của năm ấy (ngân sách chuyện nhỏ bị tiêu hết), nên tổng số quyết định mỗi đời gần như không đổi.
 *
 *   Nút vặn duy nhất: FATE_PER_LIFE — số bước ngoặt nhắm tới trong một đời (chủ game chỉnh con số này).
 *   Số thực tế thấp hơn một chút vì có năm không thẻ nào đủ điều kiện.
 *
 *   Hai hạng: "lon" (đổi nước, con đường, gia đình, tài sản, sức khỏe, cửa đời — viết theo lối điện ảnh:
 *   cược cao, đồng hồ đếm ngược, một hình ảnh, một cú lật) và "vua" (đổi cờ rẽ nhánh, nghề, tài sản nhỏ,
 *   một ván với người quen). Thẻ "echo" là vế sau của một cliffhanger: hẹn bằng `later`, nổ qua hàng đợi
 *   của host, nên phải nằm trong kho major (FATE_ECHO), không nằm trong kho chọn theo chỗ (FATE).
 */
import type { Storylet, FactContext, StoryletView, Choice, Effect } from "./types.ts";
import { prov } from "./Causality.ts";

/** Nút vặn của chủ game: số bước ngoặt nhắm tới trong một đời (6..72 tuổi). */
export let FATE_PER_LIFE = 50;
export function setFatePerLife(n: number): void { FATE_PER_LIFE = Math.max(0, n); }
/** Số năm trong đời có thể gặp bước ngoặt (6..72). */
export const FATE_YEARS: [number, number] = [6, 72];

function h32(x: number): number { x = x >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0; x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0; x ^= x >>> 16; return x >>> 0; }
function sh(s: string): number { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
/** Số đều [0,1) rút từ (hạt giống năm, khóa). Cùng đời, cùng tuổi, cùng khóa → cùng số, bất kể đã chọn gì. */
export function fateRoll(c: FactContext, key: string): number { return h32(((c.fate_seed ?? 0) ^ sh(key)) >>> 0) / 4294967296; }

/** Năm nay có chỗ cho một bước ngoặt không. */
export function fateSlot(c: FactContext): boolean {
  if (c.age < FATE_YEARS[0] || c.age > FATE_YEARS[1]) return false;
  const p = Math.min(1, FATE_PER_LIFE / (FATE_YEARS[1] - FATE_YEARS[0] + 1));
  return fateRoll(c, "slot") < p;
}

export type FateTier = "lon" | "vua";
export type Build = (c: FactContext, N: (id: string) => string) => StoryletView;
export interface FateOpts {
  /** Đặc hiệu: thẻ nối tiếp một cờ đời (callback, chuỗi) đặt cao hơn để thắng thẻ chung. Mặc định lon 4, vua 3. */
  spec?: number;
  /** Số lần tối đa trong đời (mặc định 1). */
  max?: number;
  cooldown?: number;
  /** Khóa provenance để host in dòng "↩ Vì năm N…" (xem Causality.prov). */
  causes?: (c: FactContext) => string[];
  group?: string;
}

const inAges = (c: FactContext, a: [number, number]) => c.age >= a[0] && c.age <= a[1];

/** Mọi lựa chọn của một bước ngoặt đều đếm fate_n (để thống kê và để thẻ sau đọc "đã qua bao nhiêu khúc quanh"). */
function countAll(v: StoryletView, tier: FateTier): StoryletView {
  return { ...v, choices: v.choices.map((ch): Choice => ({ ...ch, effects: { ...ch.effects, counters: { ...(ch.effects.counters ?? {}), fate_n: 1, [tier === "lon" ? "fate_lon" : "fate_vua"]: 1 } } })) };
}

/** Một bước ngoặt chọn theo chỗ. */
export function fate(id: string, tier: FateTier, ages: [number, number], when: (c: FactContext) => boolean, build: Build, o: FateOpts = {}): Storylet {
  const max = o.max ?? 1;
  return {
    id, category: "social", urgency: 86, cooldownYears: o.cooldown ?? 99, once: max === 1, maxPerLife: max, tension: 5,
    ...(o.group ? { group: o.group } : {}),
    prerequisites: (c) => inAges(c, ages) && when(c),
    specificity: () => o.spec ?? (tier === "lon" ? 4 : 3),
    build: (c, N) => countAll(build(c, N), tier),
    ...(o.causes ? { causes: o.causes } : {}),
    meta: { kind: "fate", tier },
  };
}

/** Vế sau của một cliffhanger: hẹn bằng `later: { years, storylet: id }`, nổ qua hàng đợi của host khi cờ chờ còn đó. */
export function echo(id: string, waitFlag: string, build: Build, when: (c: FactContext) => boolean = () => true, causes?: (c: FactContext) => string[]): Storylet {
  return {
    id, category: "fuse", urgency: 92, cooldownYears: 99, once: true, maxPerLife: 1, tension: 6,
    prerequisites: (c) => c.flags.has(waitFlag) && when(c),
    specificity: () => 9,
    build: (c, N) => { const v = countAll(build(c, N), "lon"); return { ...v, choices: v.choices.map((ch) => ({ ...ch, effects: { ...ch.effects, unflags: [...(ch.effects.unflags ?? []), waitFlag] } })) }; },
    causes: causes ?? (() => [prov.flag(waitFlag)]),
    meta: { kind: "fate", tier: "lon" },
  };
}

/** Hiệu ứng "đặt cliffhanger": cắm cờ chờ và hẹn thẻ echo sau `years` năm. */
export const cliff = (waitFlag: string, echoId: string, years: number): Effect => ({ flags: [waitFlag], later: { years, storylet: echoId } });

/* ------------------------------------------------------------------ Bóng của tương lai, bằng lời */

/** Một câu nói cho người chơi biết còn gặp lại người này bao nhiêu — không dùng số, dùng đời. */
export function shadowLine(c: FactContext, roleName: string, name: string, round: number): string {
  const old = c.age >= 60;
  switch (roleName) {
    case "sibling": return old ? `Anh em ruột, đến lúc này chỉ còn nhau để nhìn mặt.` : `Anh em ruột thì còn phải ngồi chung mâm giỗ đến hết đời.`;
    case "spouse": return `${name} ngủ cạnh bạn mỗi đêm, và sẽ còn ngủ cạnh bạn rất lâu.`;
    case "childhood_friend": return old ? `Bạn từ thuở nhỏ, giờ chẳng còn mấy người như thế.` : `Bạn từ thuở nhỏ. Nhưng người ta cũng có thể dọn đi, hoặc quên.`;
    case "partner": return round >= 3 ? `Đã làm chung mấy mùa. Cả hai đều biết ván này chưa phải ván cuối.` : `Mới làm chung. Chưa ai biết sẽ đi với nhau bao xa.`;
    case "rival": return `Cùng một chợ, cùng một nghề. Còn chạm mặt nhau dài dài.`;
    case "neighbor": return `Hàng rào chung thì không dọn đi được.`;
    default: return old ? `Ở tuổi này, không còn nhiều ván nữa.` : `Đời còn dài, và người ta nhớ lâu.`;
  }
}
