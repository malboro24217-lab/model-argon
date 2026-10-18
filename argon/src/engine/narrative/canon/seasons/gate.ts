/**
 * Lọc lựa chọn chung kết của mùa thường theo tuổi. Host becomePath không kiểm tuổi, nên nội dung tự giữ:
 * landing đổi nghề become:<p> chỉ mở khi PATHS[p].ages[0] ≤ tuổi ≤ ages[1] + 5, và mọi thẻ chung kết luôn còn
 * ít nhất một landing không phải nghề (tiền, nơi ở, hôn nhân). Bộ kiểm canon-content-test bắt cả hai.
 */
import type { Choice } from "../../types.ts";
import { PATHS } from "../../paths/registry.ts";

/** Lựa chọn có become:<p> nằm trong khoảng tuổi cho phép (lựa chọn không đổi nghề luôn đúng). */
export function careerOk(ch: Choice, age: number): boolean {
  return (ch.effects.custom ?? "").split("|").filter((p) => p.startsWith("become:")).every((p) => {
    const d = PATHS[p.slice(7)];
    return !d || (age >= d.ages[0] && age <= d.ages[1] + 5);
  });
}

/**
 * Lựa chọn của một thẻ chung kết: tối đa 2 lựa chọn nghề hợp tuổi đứng trước, rồi các lựa chọn không phải nghề
 * theo thứ tự ưu tiên. `others` phải luôn có ≥ 2 phần tử (người gọi giữ), nên kết quả luôn có 2–`max` lựa chọn và
 * ít nhất một lựa chọn không phải nghề.
 */
export function finale(age: number, careers: Choice[], others: Choice[], max = 3): Choice[] {
  const cap = Math.max(2, Math.min(3, max));
  const ok = careers.filter((ch) => careerOk(ch, age)).slice(0, cap - 1);
  return [...ok, ...others].slice(0, cap);
}
