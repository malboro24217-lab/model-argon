/**
 * Khung Mùa (spec 2026-10-18-canon-event §5). Thuần dữ liệu, tất định: không rng riêng, không đọc giờ.
 *
 * Một mùa = 5 nhịp (mở màn → khởi động → cú lật → đáy → chung kết), mỗi nhịp vài thẻ. `compileSeason` biến mỗi thẻ
 * thành một Storylet ("ss_<mùa>_<nhịp>_<i>") chỉ mở khi đúng mùa, đúng nhịp và đã tới `counters.season_next`.
 * Host (Task 7) giữ `season_beat` / `season_next`: khi hết thẻ khả thi của nhịp thì tăng nhịp và đặt
 * `season_next = tuổi + beatGap(độ dài mùa)`.
 *
 * Hợp đồng tên với host — Storylet.build nhận `names(id)` như mọi thẻ khác; thẻ mùa đọc thêm các khóa:
 *   names("scar:nguoi" | "scar:do" | "scar:no") → chữ của vết, "" nếu không có
 *   names("npc:<key>")                          → tên người mới của mùa (key trong reset.cast), "" nếu chưa có
 *   names("place")                              → nơi đang sống
 * Khóa lạ trả "", chính id, hoặc "ai đó" (castName hiện nay) đều được coi là "không có" và dùng dự phòng.
 */
import type { CastRole, Effect, FactContext, Storylet, StoryletView } from "../types.ts";

export type BeatName = "mo_man" | "khoi_dong" | "cu_lat" | "day" | "chung_ket";
/** Thứ tự nhịp: chỉ số 0..4 chính là `FactContext.season_beat`. */
export const BEATS: BeatName[] = ["mo_man", "khoi_dong", "cu_lat", "day", "chung_ket"];
export const BEAT_VN: Record<BeatName, string> = { mo_man: "Mở màn", khoi_dong: "Biến cố khởi động", cu_lat: "Cú lật", day: "Đáy", chung_ket: "Chung kết" };

/** Những gì một thẻ mùa được đọc ngoài FactContext. Vết và người mới CHỈ lấy qua đây. */
export interface SeasonKit {
  /** Tên NPC theo id (như `names` của thẻ thường). */
  N: (id: string) => string;
  /** Chữ của một trong 3 vết; "" khi đời này không có vết đó — thẻ phải tự có chữ dự phòng (vết "no": `noOr(c, k)` trong kit.ts). */
  scar: (k: "nguoi" | "do" | "no") => string;
  /** Tên người mới của mùa theo `NewCast.key`; chưa có tên thì trả `label`. */
  npc: (key: string) => string;
  /** Nơi đang sống. */
  noi: string;
  /** Dòng gag kế tiếp (gag lặp lại của mùa). */
  gag: () => string;
}
export interface BeatCard { id: string; build: (c: FactContext, k: SeasonKit) => StoryletView; when?: (c: FactContext) => boolean }
/** Người mới của mùa. label: "bà chủ trọ"; tên do host đặt. */
export interface NewCast { key: string; role: CastRole; label: string }
/** Một chung kết: thay đổi bền (xem isDurable). effects luôn có đúng một custom "season_end:<id>" (land() tự thêm), host đọc bằng landingOf. */
export interface Landing { id: string; line: string; effects: Effect }
export interface SeasonDef {
  id: string; vn: string; color: string; years: [number, number]; weird?: "sf" | "abs";
  rules: { income?: number; yearly?: Effect; flags?: string[] };
  reset: { cash?: number; effects?: Effect; cast?: NewCast[] };
  beats: [BeatCard[], BeatCard[], BeatCard[], BeatCard[], BeatCard[]];
  gag: { key: string; lines: string[] };
  landings: Landing[];
}

/** Tuổi tối đa lúc mùa kết thúc. */
export const SEASON_END_MAX = 85;
/** Mùa ngắn nhất (năm). */
export const SEASON_MIN = 5;

/**
 * Độ dài mùa (năm) cho người vào mùa ở `age`. rngNext ∈ [0,1) do host rút. Nằm trong def.years, kết thúc ≤ 85 tuổi,
 * tối thiểu 5 (tối thiểu thắng nếu vào mùa sau 80 tuổi — canon chỉ nổ đến 72 nên thực tế không xảy ra).
 */
export function seasonLength(def: SeasonDef, age: number, rngNext: number): number {
  const [lo, hi] = def.years;
  const r = Math.min(Math.max(rngNext, 0), 0.999999);
  const len = Math.min(hi, lo + Math.floor(r * (hi - lo + 1)), SEASON_END_MAX - age);
  return Math.max(SEASON_MIN, len);
}

/** Khoảng năm giữa hai nhịp. */
export const beatGap = (len: number): number => Math.max(1, Math.round(len / 5));

const DURABLE_CUSTOM = new Set(["migrate_now", "migrate", "move_city", "marry", "spouse_leave", "have_child", "swap_other"]);
/** Thay đổi bền, đủ làm chung kết: đổi con đường, đổi nước/thành phố, hôn nhân, con, mua/bán, thu nhập ×k, tiền ≥ 1 năm. */
export function isDurable(e: Effect): boolean {
  if ((e.custom ?? "").split("|").some((p) => p.startsWith("become:") || p.startsWith("marry:") || DURABLE_CUSTOM.has(p))) return true;
  if (e.buy || e.sell) return true;
  if (e.income_mult !== undefined && (e.income_mult >= 1.2 || e.income_mult <= 0.8)) return true;
  return e.money !== undefined && Math.abs(e.money) >= 1;
}

/** Thêm một phần vào custom (nối bằng "|"), không thêm trùng. */
export function addCustom(e: Effect, part: string): Effect {
  const parts = e.custom ? e.custom.split("|") : [];
  return parts.includes(part) ? e : { ...e, custom: [...parts, part].join("|") };
}

/** Id landing trong custom "season_end:<id>" của một lựa chọn chung kết, hoặc null. Host dùng để ghi chung kết của mùa. */
export function landingOf(e: Effect): string | null {
  const p = (e.custom ?? "").split("|").find((x) => x.startsWith("season_end:"));
  return p ? p.slice("season_end:".length) : null;
}

const unknown = (v: string, id: string): boolean => !v || v === id || v === "ai đó";
/**
 * Dựng SeasonKit từ `names` của host (xem hợp đồng tên ở đầu file). `gagFrom` = số lần gag đã hiện trước thẻ này
 * (xem gagStart), để thẻ gọi gag thứ k hiện lines[k % n].
 */
export function seasonKitFromNames(def: SeasonDef, names: (id: string) => string, gagFrom: number): SeasonKit {
  const labels = new Map((def.reset.cast ?? []).map((m) => [m.key, m.label]));
  let g = gagFrom;
  const get = (id: string) => { const v = names(id); return unknown(v, id) ? "" : v; };
  return {
    N: names,
    scar: (k) => get(`scar:${k}`),
    npc: (key) => get(`npc:${key}`) || labels.get(key) || "một người mới quen",
    noi: get("place") || "nơi này",
    gag: () => def.gag.lines[g++ % def.gag.lines.length] ?? "",
  };
}

/** Số lần một thẻ gọi k.gag() với ctx này (0 nếu `when` sai). Build thuần nên dựng thử được. */
function gagCalls(card: BeatCard, c: FactContext): number {
  let n = 0;
  const probe: SeasonKit = { N: () => "", scar: () => "", npc: () => "", noi: "", gag: () => { n++; return ""; } };
  try { if (card.when && !card.when(c)) return 0; card.build(c, probe); } catch { return 0; }
  return n;
}
/**
 * Số dòng gag đã hiện trước thẻ (bi, ci) trong mùa: cộng số lần gọi gag của mọi thẻ đứng trước nó theo thứ tự mùa
 * (dựng thử với cùng ctx, bỏ thẻ có `when` sai). Ở nhịp chung kết chỉ một thẻ ra, nên không cộng các thẻ chung kết khác.
 * Trong một nhịp, host cho mọi thẻ khả thi ra trước khi sang nhịp sau; thứ tự trong nhịp coi như thứ tự khai báo.
 */
export function gagStart(def: SeasonDef, bi: number, ci: number, c: FactContext): number {
  let n = 0;
  def.beats.forEach((beat, b) => beat.forEach((card, i) => {
    if (b < bi || (b === bi && b < 4 && i < ci)) n += gagCalls(card, c);
  }));
  return n;
}

/**
 * Biên dịch một mùa thành Storylet. Cổng: đúng mùa, đúng nhịp, đã tới season_next, cộng `when` của thẻ.
 * Mỗi thẻ ra một lần mỗi đời (once, maxPerLife 1).
 */
export function compileSeason(def: SeasonDef): Storylet[] {
  const out: Storylet[] = [];
  def.beats.forEach((beat, bi) => beat.forEach((card, ci) => {
    out.push({
      id: `ss_${def.id}_${bi}_${ci}`, category: "arc", urgency: 85, cooldownYears: 99, once: true, maxPerLife: 1, tension: 6 + bi,
      prerequisites: (c) => c.season === def.id && c.season_beat === bi && (c.counters.season_next ?? 0) <= c.age && (!card.when || card.when(c)),
      specificity: () => 9,
      build: (c, names) => card.build(c, seasonKitFromNames(def, names, gagStart(def, bi, ci, c))),
      meta: { kind: "season", season: [def.id] },
    });
  }));
  return out;
}
