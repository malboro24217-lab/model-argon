/**
 * Canon event: áp lực 8 trục và thời điểm nổ (spec 2026-10-18-canon-event §3).
 * Thuần dữ liệu, tất định: không rng, không đọc giờ. Host cộng `pressureOf(effect)` vào FactContext.pressure
 * sau mỗi lựa chọn; mỗi năm hỏi `dueAxis(ctx)` xem có trục nào nổ không.
 */
import type { Axis, Effect, FactContext } from "../types.ts";

export const AXES: Axis[] = ["tien", "tinh", "mau", "danh", "luat", "than", "dat", "ky"];
export const AXIS_VN: Record<Axis, string> = { tien: "Tiền", tinh: "Tình", mau: "Máu mủ", danh: "Danh", luat: "Luật", than: "Thân xác", dat: "Đất", ky: "Kỳ" };

/** Một trục nổ khi đạt ngưỡng này (spec §3 ghi 10; Task 20 hạ xuống 8 để mùa phủ ≥ 60% thời gian từ 18 tuổi). */
export const CANON_THRESHOLD = 8;
/** Riêng trục Kỳ (đã nhân Độ điên) vẫn nổ ở mức cũ 10 của spec: hạ ngưỡng chung không được kéo nhánh kỳ dị lên quá 40% số đời. */
export const KY_THRESHOLD = 10;
/** Số năm tối thiểu giữa hai canon event. */
export const CANON_GAP = 8;
/** Tối đa mỗi đời. */
export const CANON_MAX = 4;
/** Khoảng tuổi được nổ, gồm hai đầu. */
export const CANON_AGES: [number, number] = [8, 72];
/** Đến tuổi này mà chưa có canon event nào thì trục cao nhất nổ. */
export const FORCE_FIRST_AT = 25;
/** Đến tuổi này mà mới có đúng 1 thì trục cao nhất nổ. */
export const FORCE_SECOND_AT = 60;
/** Trục đã nổ bị trừ chừng này. */
export const DISCHARGE = 8;
/** Điểm Kỳ (đã nhân hệ số) mà cửa kỳ dị bắt đầu mở. */
export const WEIRD_DOOR_AT = 6;

const zero = (): Record<Axis, number> => ({ tien: 0, tinh: 0, mau: 0, danh: 0, luat: 0, than: 0, dat: 0, ky: 0 });

/**
 * Mức nền từ bối cảnh sinh ra. "Nghèo" và "giàu" theo cùng ngưỡng của host (family_wealth < 0.4 / > 0.75),
 * "nước nghèo" là gdp < 8000 như `poor_country`. `rural` do host quyết (engine chỉ nhận cờ).
 */
export function basePressure(b: { family_wealth: number; gdp: number; sibling: boolean; rural: boolean }): Record<Axis, number> {
  const p = zero();
  if (b.family_wealth < 0.4) p.tien += 3;
  if (b.gdp < 8000) p.dat += 2;
  if (b.family_wealth > 0.75) p.mau += 3;
  if (b.sibling) p.mau += 1;
  if (b.rural) p.ky += 2;   // spec §3 ghi +1; Task 20 nâng lên 2 sau khi hạ Kỳ của thẻ phi lý (ABSURD_KY) để nhánh kỳ dị về 25–40%
  return p;
}

/** Ý kiến (opinion) từ mức này trở xuống thì NPC là kẻ thù truyền kiếp (spec §4, chỗ trống ưu tiên 2). Host đếm "enemies" ở −0.35. */
export const NEMESIS_AT = -0.5;
/**
 * Kẻ thù truyền kiếp: người còn sống (có trong c.cast) có ý kiến thấp nhất, nếu ≤ NEMESIS_AT; hòa thì id nhỏ hơn. Host gọi khi dựng
 * FactContext (Task 20: trước đó nemesis luôn để trống).
 */
export function nemesisOf(c: Pick<FactContext, "cast" | "opinion">): string | undefined {
  const alive = new Set(Object.values(c.cast).filter((v): v is string => !!v));
  let best: string | undefined, low = NEMESIS_AT;
  for (const id of [...alive].sort()) { const o = c.opinion[id]; if (o !== undefined && o <= low && (best === undefined || o < low)) { best = id; low = o; } }
  return best;
}

/** Áp lực một Effect đẩy lên. Phần khai báo (`pressure`) thắng hoàn toàn phần tự suy ra. */
export function pressureOf(e: Effect): Partial<Record<Axis, number>> {
  if (e.pressure) return { ...e.pressure };
  const out: Partial<Record<Axis, number>> = {};
  const add = (a: Axis) => { out[a] = (out[a] ?? 0) + 1; };
  const c = e.custom ?? "";
  if ((e.money !== undefined && e.money <= -0.1) || /borrow|gamble/.test(c)) add("tien");
  if ((e.memory !== undefined && e.memory.weight >= 0.2) || /marry|spouse_leave/.test(c)) add("tinh");
  if (e.secret) add("mau");
  if (e.close_doors?.includes("clean_record")) add("luat");
  if (e.health !== undefined && e.health <= -5) add("than");
  if (/migrate|move_city|return_home/.test(c)) add("dat");
  if (e.flags?.some((f) => /viral|fame|noi_tieng/.test(f))) add("danh");
  return out;
}

/**
 * Mỗi lần một trục đã nổ trong đời này, lần sau nó phải vượt ngưỡng cao hơn chừng này (Task 20: trước đó Tiền nổ ~60% số biến cố,
 * Danh/Luật/Thân/Đất không bao giờ nổ, và 3 mầm không bao giờ ra). Áp cho cả so ngưỡng lẫn chọn trục lúc ép nổ.
 */
export const AXIS_FATIGUE = 4;
/** Cờ canonView gắn vào mọi cửa: trục `axis` đã nổ ở tuổi `age` (một cờ mỗi biến cố, nên đếm được số lần). */
export const axisFlag = (axis: Axis, age: number): string => `canon_ax_${axis}@${age}`;
/** Số lần trục `a` đã nổ trong đời này (đếm cờ axisFlag). */
export function axisFired(c: Pick<FactContext, "flags">, a: Axis): number {
  const pre = `canon_ax_${a}@`; let n = 0;
  for (const f of c.flags) if (f.startsWith(pre)) n++;
  return n;
}
/**
 * Độ nhạy của từng trục khi so ngưỡng (Task 20). Lựa chọn trong game đẩy các trục rất lệch nhau: đo 60 đời, mỗi đời trung bình
 * Tiền +18, Tình +9, Kỳ +7, Danh +3, Máu mủ +2.5, Thân +1.6, Luật +1.3, Đất +0.9. Không có hệ số này thì chỉ Tiền/Tình/Kỳ nổ.
 */
export const AXIS_GAIN: Record<Axis, number> = { tien: 1, tinh: 1, mau: 1.5, danh: 2, luat: 3, than: 3, dat: 2.5, ky: 1.2 };
/** Điểm so sánh của một trục: áp lực × AXIS_GAIN (Kỳ nhân thêm hệ số Độ điên; Độ điên 0 thì dueAxis bỏ hẳn Kỳ), trừ độ mỏi AXIS_FATIGUE. */
const score = (c: FactContext, a: Axis): number =>
  (a === "ky" ? c.pressure.ky * c.weird : c.pressure[a]) * AXIS_GAIN[a] - AXIS_FATIGUE * axisFired(c, a);

/**
 * Trục nổ năm nay, hoặc null. Điều kiện chung: tuổi trong CANON_AGES, chưa đủ CANON_MAX, cách lần trước ≥ CANON_GAP,
 * và không có mùa đang chạy (c.season), trừ khi ép nổ.
 * Nổ khi có trục đạt ngưỡng của nó (CANON_THRESHOLD; Kỳ: KY_THRESHOLD) — lấy trục cao nhất trong các trục đạt ngưỡng; hoặc ép nổ
 * (FORCE_FIRST_AT tuổi chưa có cái nào, FORCE_SECOND_AT tuổi mới có 1) thì lấy trục cao nhất dù chưa tới ngưỡng.
 * Hòa thì trục đứng trước trong AXES.
 */
export function dueAxis(c: FactContext): Axis | null {
  if (c.age < CANON_AGES[0] || c.age > CANON_AGES[1]) return null;
  if (c.canon_n >= CANON_MAX) return null;
  if (c.age - c.last_canon_age < CANON_GAP) return null;
  let best: Axis = "tien", bestScore = -Infinity, hot: Axis | null = null, hotScore = -Infinity;
  for (const a of AXES) {
    if (a === "ky" && c.weird === 0) continue;
    const s = score(c, a);
    if (s > bestScore) { best = a; bestScore = s; }
    if (s >= (a === "ky" ? KY_THRESHOLD : CANON_THRESHOLD) && s > hotScore) { hot = a; hotScore = s; }
  }
  const forced = (c.age >= FORCE_FIRST_AT && c.canon_n === 0) || (c.age >= FORCE_SECOND_AT && c.canon_n === 1);
  // Đang trong mùa: chờ chung kết đáp xuống rồi mới nổ (mùa không bị cắt giữa chừng). Chỉ lần ép nổ mới cắt mùa,
  // vì nó là bảo đảm "≥ 2 canon event trước 60 tuổi" (Task 20; ép nổ lần đầu thì chưa có mùa nào).
  if (c.season && !forced) return null;
  if (hot) return hot;
  return forced ? best : null;
}
