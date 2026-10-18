/**
 * Bộ công cụ viết Mùa. Mọi mùa trong canon/seasons/ (và mùa của nhánh kỳ dị) chỉ dùng các helper ở đây.
 * Kiểm bằng: node --experimental-strip-types src/canon-content-test.ts
 *
 * Viết một mùa:
 *
 *   const L_THO = land("lam_tho", "Bạn mở tiệm sửa xe ở đầu chợ.", { custom: "become:mechanic", happy: 5 });
 *   const L_DI  = land("di_xa", "Bạn bán hết, mua vé đi.", { custom: "migrate_now", money: -1 });
 *
 *   export const MUA_X: SeasonDef = {
 *     id: "mua_x", vn: "Tên mùa", color: "#c0563b", years: [8, 14],
 *     rules: { income: 0.7, flags: ["w_mua_x"] },                       // hệ số thu nhập, cờ thế giới trong mùa
 *     reset: { cash: 0, cast: [{ key: "chu_tro", role: "neighbor", label: "bà chủ trọ" }] },
 *     gag: { key: "con_meo", lines: ["…", "…", "…"] },                  // ≥ 3 dòng, ≥ 3 thẻ gọi k.gag()
 *     landings: [L_THO, L_DI],
 *     beats: [
 *       [card("x_mo_1", "Tiêu đề", (c, k) => `Bạn tới ${k.noi}. ${cap(k.npc("chu_tro"))} đưa chìa khóa. ${k.gag()}`,
 *             [C("Nhận phòng", { flags: ["x_o"] }, "Rẻ, nhưng ồn"), C("Tìm chỗ khác", { money: -0.1 })])],
 *       [ … khoi_dong … ],
 *       [ … cu_lat: ít nhất 1 thẻ dùng k.scar(...) … ],
 *       [ … day … ],
 *       [card("x_ket", "Chung kết", (c, k) => `${cap(k.scar("no") || "món nợ cũ")} vẫn còn đó…`,
 *             [ending(L_THO, "Ở lại sửa xe"), ending(L_DI, "Mua vé đi")])],
 *     ],
 *   };
 *
 * Quy tắc (bộ kiểm bắt hết):
 *  - Mùa thường 13–17 thẻ, 2–3 người mới; mùa kỳ dị 7–10 thẻ, 1–2 người mới. Nhịp nào cũng ≥ 1 thẻ.
 *  - Vết và người mới CHỈ lấy qua k: k.scar("nguoi" | "do" | "no") có thể là "" → luôn viết `k.scar("do") || "chữ dự phòng"`.
 *    k.npc(key) chỉ với key có trong reset.cast. Không dùng `{...}` trong chữ.
 *  - Nhịp cu_lat dùng ≥ 1 vết.
 *  - Thẻ chung kết: MỌI lựa chọn là ending(landing, nhãn), mỗi lựa chọn một landing khác nhau. land(id, …) tự gắn
 *    custom "season_end:<id>"; landing khai báo trong `landings`, phải bền (isDurable) và được ít nhất một thẻ dùng.
 *    Nhịp khác không được kết mùa. Nhịp chung_ket cần ≥ 1 thẻ không có `when`.
 *  - Chỉ MỘT thẻ chung kết ra mỗi mùa: thẻ chung kết nào cũng phải dùng k.scar("no"); gag ở nhịp này tính tối đa 1 lần.
 *  - Gag: thẻ gọi k.gag() thứ k (theo thứ tự khai báo trong mùa) hiện lines[k % n], nên dòng 0 là lần đầu.
 *  - Câu (sau ". ") không được bắt đầu bằng chữ thường: vết/người mới đứng đầu câu thì bọc cap(...).
 *  - Mỗi thẻ 2–3 lựa chọn, ≥ 1 lựa chọn để lại dấu. Tiêu đề và nhãn ≤ 60 ký tự, hint ≤ 70.
 */
import type { Choice, Effect, FactContext, StoryletView } from "../types.ts";
import { C, T } from "../paths/kit.ts";
import { addCustom, type BeatCard, type Landing, type SeasonKit } from "./Season.ts";

export { C, T };

type Txt = string | ((c: FactContext, k: SeasonKit) => string);
const txt = (t: Txt, c: FactContext, k: SeasonKit): string => (typeof t === "string" ? t : t(c, k));

/**
 * Một thẻ của mùa. title và choices có thể là hằng hoặc hàm (c, k). `when` lọc thêm (ngoài cổng mùa/nhịp).
 * Lựa chọn đầu là mặc định.
 */
export function card(id: string, title: Txt, text: (c: FactContext, k: SeasonKit) => string,
  choices: Choice[] | ((c: FactContext, k: SeasonKit) => Choice[]), when?: (c: FactContext) => boolean): BeatCard {
  const build = (c: FactContext, k: SeasonKit): StoryletView =>
    T(txt(title, c, k), text(c, k), typeof choices === "function" ? choices(c, k) : choices);
  return when ? { id, build, when } : { id, build };
}

/** Viết hoa chữ đầu: dùng khi vết hay nhãn người mới đứng đầu câu (`${cap(k.npc("chu_tro"))} đưa chìa khóa.`). */
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Một chung kết. Tự thêm custom "season_end:<id>" (nối bằng "|"); host đọc id bằng landingOf. */
export const land = (id: string, line: string, effects: Effect): Landing => ({ id, line, effects: addCustom(effects, `season_end:${id}`) });

/** Lựa chọn của thẻ chung kết: đáp xuống `l`. effects là nguyên effects của landing (đã có season_end:<id>). */
export const ending = (l: Landing, label: string, hint?: string, extra: Partial<Choice> = {}): Choice =>
  C(label, l.effects, hint, extra);
