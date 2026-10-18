/**
 * Canon event: áp lực 8 trục và thời điểm nổ (spec 2026-10-18-canon-event §3).
 * Thuần dữ liệu, tất định: không rng, không đọc giờ. Host cộng `pressureOf(effect)` vào FactContext.pressure
 * sau mỗi lựa chọn; mỗi năm hỏi `dueAxis(ctx)` xem có trục nào nổ không.
 */
import type { Axis, Effect, FactContext } from "../types.ts";

export const AXES: Axis[] = ["tien", "tinh", "mau", "danh", "luat", "than", "dat", "ky"];
export const AXIS_VN: Record<Axis, string> = { tien: "Tiền", tinh: "Tình", mau: "Máu mủ", danh: "Danh", luat: "Luật", than: "Thân xác", dat: "Đất", ky: "Kỳ" };

/** Một trục nổ khi đạt ngưỡng này. */
export const CANON_THRESHOLD = 10;
/** Số năm tối thiểu giữa hai canon event. */
export const CANON_GAP = 8;
/** Tối đa mỗi đời. */
export const CANON_MAX = 4;
/** Khoảng tuổi được nổ, gồm hai đầu. */
export const CANON_AGES: [number, number] = [8, 72];
/** Đến tuổi này mà chưa có canon event nào thì trục cao nhất nổ. */
export const FORCE_FIRST_AT = 35;
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
  if (b.rural) p.ky += 1;
  return p;
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

/** Điểm so sánh của một trục: Kỳ nhân hệ số Độ điên; Độ điên 0 thì Kỳ không bao giờ nổ. */
function score(c: FactContext, a: Axis): number {
  if (a === "ky") return c.weird === 0 ? -1 : c.pressure.ky * c.weird;
  return c.pressure[a];
}

/**
 * Trục nổ năm nay, hoặc null. Điều kiện chung: tuổi trong CANON_AGES, chưa đủ CANON_MAX, cách lần trước ≥ CANON_GAP.
 * Nổ khi trục cao nhất ≥ CANON_THRESHOLD; hoặc ép nổ (35 tuổi chưa có cái nào, 60 tuổi mới có 1) thì lấy trục cao nhất
 * dù chưa tới ngưỡng. Hòa thì trục đứng trước trong AXES.
 */
export function dueAxis(c: FactContext): Axis | null {
  if (c.age < CANON_AGES[0] || c.age > CANON_AGES[1]) return null;
  if (c.canon_n >= CANON_MAX) return null;
  if (c.age - c.last_canon_age < CANON_GAP) return null;
  let best: Axis | null = null, bestScore = -Infinity;
  for (const a of AXES) { const s = score(c, a); if (s > bestScore) { best = a; bestScore = s; } }
  if (best === null) return null;
  if (bestScore >= CANON_THRESHOLD) return best;
  const forced = (c.age >= FORCE_FIRST_AT && c.canon_n === 0) || (c.age >= FORCE_SECOND_AT && c.canon_n === 1);
  return forced ? best : null;
}
