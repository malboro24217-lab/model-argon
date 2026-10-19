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
 *       [card("x_ket", "Chung kết", (c, k) => `${cap(noOr(c, k))} vẫn còn đó…`,
 *             [ending(L_THO, "Ở lại sửa xe"), ending(L_DI, "Mua vé đi")])],
 *     ],
 *   };
 *
 * Quy tắc (bộ kiểm bắt hết):
 *  - Mùa thường 13–17 thẻ, 2–3 người mới; mùa kỳ dị 7–10 thẻ, 1–2 người mới. Nhịp nào cũng ≥ 1 thẻ.
 *  - Vết và người mới CHỈ lấy qua k: k.scar("nguoi" | "do" | "no") có thể là "" → luôn viết `k.scar("do") || "chữ dự phòng"`.
 *    Vết "no" dùng noOr(c, k): dự phòng chỉ gọi là nợ khi c.debt > 0 (quy tắc 9; bộ kiểm dò bằng probe sự thật tương phản).
 *    k.npc(key) chỉ với key có trong reset.cast. Không dùng `{...}` trong chữ.
 *  - Nhịp cu_lat dùng ≥ 1 vết.
 *  - Thẻ chung kết: MỌI lựa chọn là ending(landing, nhãn), mỗi lựa chọn một landing khác nhau. land(id, …) tự gắn
 *    custom "season_end:<id>"; landing khai báo trong `landings`, phải bền (isDurable) và được ít nhất một thẻ dùng.
 *    Nhịp khác không được kết mùa. Nhịp chung_ket cần ≥ 1 thẻ không có `when`.
 *  - Chỉ MỘT thẻ chung kết ra mỗi mùa: thẻ chung kết nào cũng phải dùng k.scar("no"); gag ở nhịp này tính tối đa 1 lần.
 *  - Gag: thẻ gọi k.gag() thứ k (theo thứ tự khai báo trong mùa) hiện lines[k % n], nên dòng 0 là lần đầu.
 *  - Câu (sau ". ") không được bắt đầu bằng chữ thường: vết/người mới đứng đầu câu thì bọc cap(...).
 *  - Mỗi thẻ 2–3 lựa chọn, ≥ 1 lựa chọn để lại dấu. Tiêu đề và nhãn ≤ 60 ký tự, hint ≤ 70.
 *
 * ---- Nhánh kỳ dị (Task 10–19) ----
 * Mỗi đợt một file trong canon/weird/, export đúng một mảng tên theo file:
 *   sf_01.ts → `export const SF_01: WeirdBranch[]`, sf_11.ts → SF_11, … abs_41.ts → ABS_41.
 * canon/weird/index.ts nối 10 mảng thành WEIRD_ALL (= WEIRD trong canon/index.ts). Đợt mới chỉ sửa file của mình.
 *
 *   export const SF_01: WeirdBranch[] = [
 *     weird("S05", "sf", ["ky", "mau"],
 *       (c) => c.plants.some((p) => p.kind === "animal"),                          // "Mọc từ": chỉ trường có thật của FactContext
 *       (s) => `Gắn chip phiên dịch cho ${s.what?.label ?? "con vật nhà bạn"}`,    // nhãn cửa ≤ 60 ký tự
 *       (s, c, N) => ({ title: "Con vật biết nói", text: `… "…" …` }),              // 2–4 câu điện ảnh, có một câu thoại trong ngoặc kép
 *       season({ id: "w_S05", vn: "Thú nói được", color: "#6b5bd6", years: [5, 9], weird: "sf",
 *         rules: { flags: ["w_talking_pet"] }, reset: { cast: [ … 1–2 người … ] }, gag: { … ≥ 3 dòng … },
 *         landings: [L_A, L_B], beats: [[…2], […2], […1], […2], […1]] })),
 *   ];
 *
 * Quy tắc thêm cho nhánh kỳ dị (bộ kiểm bắt hết):
 *  - id "S01".."S50" (kind "sf") hoặc "X01".."X50" (kind "abs"), duy nhất; season.id = "w_" + id; season.weird = kind.
 *  - 7–10 thẻ, 1–2 người mới, years trong [5, 12]. Màu: sf thuộc dải xanh–tím (hue 200–290), abs thuộc dải vàng–cam (hue 25–60).
 *  - `when(c, s)` không được ném lỗi; phải đúng ở ít nhất một bối cảnh fuzz. "Kỳ ≥ n" → `c.pressure.ky >= n`.
 *  - `door` (≤ 60 ký tự) và `trigger` (title ≤ 60, text ≤ 600) luôn ra chữ trọn vẹn, kể cả khi s.who / s.what rỗng
 *    và s.noi = "" (viết `s.noi || "nơi này"`). Text của trigger phải có một câu thoại trong ngoặc kép.
 *  - Custom của host dùng được trong nội dung: `age_skip:<n>`, `longevity:<n>`, `remark`, `swap_other` (host làm ở Task 8).
 */
import type { Axis, Choice, Effect, FactContext, StoryletView } from "../types.ts";
import { C, T } from "../paths/kit.ts";
import { PATHS } from "../paths/registry.ts";
import { addCustom, type BeatCard, type Landing, type SeasonDef, type SeasonKit } from "./Season.ts";
import type { Slots, WeirdBranch } from "./Canon.ts";

export { C, T };

/* ---- Cổng tuổi của chung kết (addendum quy tắc 1; dùng chung cho 5 mùa thường và 100 nhánh kỳ dị) ----
 * Host becomePath không kiểm tuổi, nên nội dung tự giữ: landing đổi nghề become:<p> chỉ mở khi
 * PATHS[p].ages[0] ≤ tuổi ≤ ages[1] + 5, và mọi thẻ chung kết luôn còn ít nhất một landing không phải nghề.
 * Bộ kiểm canon-content-test bắt cả hai (tuổi 8–90, có và chưa có vợ/chồng). */

/** Con đường `p` mở ở tuổi này: PATHS[p].ages[0] ≤ tuổi ≤ ages[1] + 5. Con đường lạ → false. */
export function pathOpen(p: string, age: number): boolean {
  const d = PATHS[p];
  return !!d && age >= d.ages[0] && age <= d.ages[1] + 5;
}

/** Id con đường đầu tiên trong custom "become:<p>" của effects (của lựa chọn hay landing), hoặc undefined. */
export const careerOf = (e: Effect): string | undefined =>
  (e.custom ?? "").split("|").find((p) => p.startsWith("become:"))?.slice("become:".length);

/** Lựa chọn có become:<p> nằm trong khoảng tuổi cho phép (lựa chọn không đổi nghề, hay con đường lạ, luôn đúng). */
export function careerOk(ch: Choice, age: number): boolean {
  return (ch.effects.custom ?? "").split("|").filter((p) => p.startsWith("become:")).every((p) => {
    const id = p.slice("become:".length);
    return !PATHS[id] || pathOpen(id, age);
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

/** Như finale() nhưng giữ nguyên thứ tự khai báo của `all` (nghề và không nghề xen nhau). */
export function finaleInOrder(age: number, all: Choice[], max = 3): Choice[] {
  const isCareer = (ch: Choice) => careerOf(ch.effects) !== undefined;
  const pick = new Set(finale(age, all.filter(isCareer), all.filter((ch) => !isCareer(ch)), max));
  return all.filter((ch) => pick.has(ch));
}

/** Các lựa chọn hợp tuổi theo thứ tự khai báo, tối đa `max` (không giới hạn số nghề). */
export const openInOrder = (age: number, all: Choice[], max = 3): Choice[] => all.filter((ch) => careerOk(ch, age)).slice(0, max);

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

/**
 * Vết "no" (món nợ hay lời hứa mang từ đời cũ) cho chữ của thẻ, hoặc chữ dự phòng ĐÚNG với đời này (addendum quy tắc 9).
 * Vết rỗng nghĩa là lúc vào mùa không có nợ ngân hàng, vật gài nợ hay lời hứa nào: chỉ khi đang nợ (c.debt > 0, nợ phát
 * sinh trong mùa) mới được gọi là nợ; không thì là một món ân tình (đọc trôi với "chưa trả", "khép", "vẫn còn đó").
 * Câu quanh nó phải đọc được với cả ba: nhãn vết thật, `debt`, `other`.
 */
export const noOr = (c: FactContext, k: SeasonKit, debt = "món nợ cũ", other = "món ân tình cũ"): string =>
  k.scar("no") || (c.debt > 0 ? debt : other);

/** Một chung kết. Tự thêm custom "season_end:<id>" (nối bằng "|"); host đọc id bằng landingOf. */
export const land = (id: string, line: string, effects: Effect): Landing => ({ id, line, effects: addCustom(effects, `season_end:${id}`) });

/** Lựa chọn của thẻ chung kết: đáp xuống `l`. effects là nguyên effects của landing (đã có season_end:<id>). */
export const ending = (l: Landing, label: string, hint?: string, extra: Partial<Choice> = {}): Choice =>
  C(label, l.effects, hint, extra);

/**
 * Lựa chọn chung kết cưới một người có tên: thay "marry" bằng "marry:<tên>" (host gắn vai bạn đời cho đúng người trong dàn, R20).
 * Không có tên thì giữ nguyên effects của landing. (Chuyển từ weird/abs_21.ts sang đây ở Task 20 để mùa thường dùng chung.)
 */
export const wed = (l: Landing, label: string, hint: string, name: string | null): Choice => {
  if (!name) return ending(l, label, hint);
  const clean = name.replace(/[|:]/g, "").trim();
  if (!clean) return ending(l, label, hint);
  const custom = (l.effects.custom ?? "").split("|").map((p) => (p === "marry" ? `marry:${clean}` : p)).join("|");
  return C(label, { ...l.effects, custom }, hint);
};

/* ---- Nhánh kỳ dị ---- */

/** Đầu vào của season(): như SeasonDef nhưng `weird` bắt buộc, `rules` và `reset` có thể bỏ (mặc định {}). */
export type WeirdSeasonInput = Omit<SeasonDef, "weird" | "rules" | "reset"> & {
  weird: "sf" | "abs"; rules?: SeasonDef["rules"]; reset?: SeasonDef["reset"];
};
/**
 * Mùa của một nhánh kỳ dị. Thuần: chỉ điền mặc định (rules = {}, reset = {}) và bắt buộc `weird` ở mức kiểu;
 * mọi ràng buộc khác do canon-content-test kiểm (không ném lỗi lúc nạp module để bundle không bao giờ vỡ).
 */
export function season(def: WeirdSeasonInput): SeasonDef {
  return { ...def, rules: def.rules ?? {}, reset: def.reset ?? {} };
}

type Names = (id: string) => string;
/**
 * Một nhánh kỳ dị (spec §7). Thứ tự tham số khớp bảng spec: id, loại, trục, "Mọc từ" (`when`), nhãn cửa, biến cố
 * khi trục Kỳ tự nổ (`trigger`), mùa, gợi ý dưới nhãn cửa (bỏ thì generator sinh "Viễn tưởng|Phi lý: <tên mùa>").
 */
export function weird(id: string, kind: "sf" | "abs", axes: Axis[], when: (c: FactContext, s: Slots) => boolean,
  door: (s: Slots, c: FactContext, N: Names) => string,
  trigger: (s: Slots, c: FactContext, N: Names) => { title: string; text: string },
  seasonDef: SeasonDef, hint?: string): WeirdBranch {
  const b: WeirdBranch = { id, kind, axes, when, door, trigger, season: seasonDef };
  if (hint !== undefined) b.hint = hint;
  return b;
}
