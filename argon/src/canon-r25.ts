/**
 * Ruling R25 (Task 20d): dò "thay đổi tình thế" của một mùa và 13 mâu thuẫn đã sửa. Dùng chung cho bộ kiểm
 * canon-content-test (khối R25: mâu thuẫn cũ quay lại hay mùa demo tụt khỏi lớp "đạt" thì FAIL) và công cụ
 * argon/tools/season-change-audit.js (bảng phân lớp 105 mùa). Không nhập giá trị nào của engine: mọi thứ đi qua tham số,
 * để công cụ kiểm được cả một bản repo khác (--root).
 *
 * Lớp: (a) đạt = có thay đổi tình thế chắc chắn lúc vào mùa (entryChanges không rỗng) và không còn mâu thuẫn;
 *      (b) chỉ bằng lời kể = không có; (c) mâu thuẫn = một mục CONTRADICTIONS còn mở.
 * Bảng và lý do: argon/docs/canon/season-change-audit.md.
 */
import type { Choice, Effect, FactContext, StoryletView } from "./engine/narrative/types.ts";
import type { BeatCard, SeasonDef } from "./engine/narrative/canon/Season.ts";

export type Kind = "tiền" | "nợ" | "việc" | "nơi ở" | "quan hệ" | "luật mùa" | "quyền tiếp cận";
export interface Change { kind: Kind; what: string; src: string }
/** Dựng một thẻ của mùa ở bối cảnh c; null nếu `when` sai hay lỗi. */
export type View = (def: SeasonDef, card: BeatCard, c: FactContext) => StoryletView | null;

/** 13 mùa người chơi gặp trong lượt chơi demo: phải ở lớp (a). */
export const DEMO_SEASONS = ["tron_chay", "vu_an_gia_toc", "ngoi_sao", "lam_lai", "xu_nguoi", "w_S08", "w_X36", "w_S35", "w_X14", "w_X47", "w_S05", "w_S47", "w_X33"];

const KIND_OF: [RegExp, Kind][] = [
  [/^(borrow|repay|restructure)(:|$)/, "nợ"],
  [/^(job_new|job_lose|job_lose_maybe|job_switch|retire|become|study)(:|$)/, "việc"],
  [/^(move_city|migrate_now|return_home)(:|$)/, "nơi ở"],
  [/^(marry|spouse_leave|have_child)(:|$)/, "quan hệ"],
  [/^(age_skip|longevity)(:|$)/, "luật mùa"],
  // Task 8b (R24): khoản tiền mùa khai báo rõ, tính theo lương trong mùa.
  [/^money_season(:|$)/, "tiền"],
];

/** Các thay đổi tình thế (không gồm cờ) trong effect. moneyMin: ngưỡng |money| (đầu mùa: mọi khoản; mở màn: ≥ 0.3). */
export function situation(e: Effect | undefined, moneyMin: number): { kind: Kind; what: string }[] {
  const out: { kind: Kind; what: string }[] = [];
  if (!e) return out;
  if (e.money !== undefined && e.money !== 0 && Math.abs(e.money) >= moneyMin) out.push({ kind: "tiền", what: `tiền ${e.money > 0 ? "+" : "−"}${Math.abs(e.money)} năm thu nhập` });
  for (const p of (e.custom ?? "").split("|").filter(Boolean)) {
    if (p.startsWith("season_end")) continue;
    const k = KIND_OF.find(([re]) => re.test(p));
    if (k) out.push({ kind: k[1], what: p });
  }
  if (e.buy) out.push({ kind: "quyền tiếp cận", what: `mua ${e.buy.name}` });
  if (e.sell) out.push({ kind: "quyền tiếp cận", what: `bán ${e.sell.name ?? e.sell.kind}` });
  if (e.income_mult !== undefined && (e.income_mult >= 1.2 || e.income_mult <= 0.8)) out.push({ kind: "việc", what: `thu nhập ×${e.income_mult}` });
  return out;
}
const effectsOf = (ch: Choice): Effect[] => [ch.effects, ...(ch.effects.gamble ? [ch.effects.gamble.win, ch.effects.gamble.lose] : [])];

/**
 * Thay đổi tình thế chắc chắn xảy ra lúc vào mùa: reset.cash, reset.effects, luật mùa (rules.income ≤ 0.8 hay ≥ 1.2,
 * rules.yearly có tiền / nợ / custom), thẻ mở màn không có `when` mà mọi lựa chọn đều đổi tình thế.
 * weak: những gì có mà không đủ; conditional: thay đổi chỉ có ở một vài lựa chọn của thẻ mở màn.
 */
export function entryChanges(def: SeasonDef, ctxs: FactContext[], view: View): { changes: Change[]; weak: string[]; conditional: string[] } {
  const changes: Change[] = [], weak: string[] = [], conditional: string[] = [];
  if (def.reset.cash !== undefined) changes.push({ kind: "tiền", what: `tiền riêng về ${def.reset.cash}× thu nhập`, src: "reset.cash" });
  for (const s of situation(def.reset.effects, 0)) changes.push({ ...s, src: "reset.effects" });
  const inc = def.rules.income;
  if (inc !== undefined && inc !== 1) {
    if (inc <= 0.8 || inc >= 1.2) changes.push({ kind: "luật mùa", what: `thu nhập từ lương ×${inc}`, src: "rules.income" });
    else weak.push(`thu nhập ×${inc} (nhỏ hơn ngưỡng 0.8/1.2)`);
  }
  const y = def.rules.yearly;
  if (y) {
    const s = situation(y, 0);
    if (s.length) changes.push({ kind: "luật mùa", what: "mỗi năm: " + s.map((x) => x.what).join(", "), src: "rules.yearly" });
    else weak.push(`luật năm chỉ đổi chỉ số (${Object.keys(y).join(", ")})`);
  }
  if ((def.rules.flags ?? []).length) weak.push(`cờ thế giới ${def.rules.flags!.join(", ")} (không ai đọc)`);
  for (const card of def.beats[0]) {
    const kinds = new Map<string, { kind: Kind; what: string }>(); let all = true, seen = 0;
    for (const c of ctxs) {
      const v = view(def, card, { ...c, season: def.id, season_beat: 0 });
      if (!v) continue; seen++;
      for (const ch of v.choices) {
        const s = effectsOf(ch).flatMap((e) => situation(e, 0.3));
        if (!s.length) all = false; else s.forEach((x) => kinds.set(x.kind + ":" + x.what.replace(/:.*/, ""), x));
      }
    }
    if (!seen) continue;
    if (all && !card.when) for (const x of kinds.values()) changes.push({ ...x, src: `mở màn ${card.id} (mọi lựa chọn)` });
    else if (kinds.size) conditional.push(`${card.id}: ${[...kinds.values()].map((x) => x.what).join(", ")}`);
  }
  return { changes, weak, conditional };
}

/* ------------------------------------------------------------------ mâu thuẫn đã sửa ở Task 20d (lớp c) */

/** Công cụ cho hàm dò: thẻ theo id, chữ (tiêu đề, thân, nhãn, gợi ý) và lựa chọn ở bối cảnh base + over. */
export interface Probe { changes: Change[]; text: (id: string, over?: Partial<FactContext>) => string; choices: (id: string, over?: Partial<FactContext>) => Choice[] }
export function probeOf(def: SeasonDef, changes: Change[], base: FactContext, view: View): Probe {
  const card = (id: string) => def.beats.flat().find((c) => c.id === id);
  const v = (id: string, over: Partial<FactContext> = {}) => { const cd = card(id); return cd ? view(def, cd, { ...base, season: def.id, ...over }) : null; };
  return {
    changes,
    text: (id, over) => { const x = v(id, over); return x ? [x.title, x.text, ...x.choices.flatMap((c) => [c.label, c.hint ?? ""])].join(" | ") : ""; },
    choices: (id, over) => v(id, over)?.choices ?? [],
  };
}
const has = (p: Probe, f: (x: Change) => boolean) => p.changes.some(f);
const yearlyMoney = (p: Probe, sign: -1 | 1) => has(p, (x) => x.src === "rules.yearly" && x.what.includes(`tiền ${sign < 0 ? "−" : "+"}`));
/** Không còn nước để đi (hay chưa tự lập): mọi chữ chung kết nói về chuyện ra nước ngoài phải đổi theo (B1, I4 của review 20d). */
const NO_MIGRATE: Partial<FactContext> = { independent: true, can_migrate: false };

export const CONTRADICTIONS: Record<string, { claim: string; fix: string; open: (p: Probe) => boolean }> = {
  tron_chay: { claim: "Cả mùa là trốn nợ (gã đòi nợ áo hoa, món nợ bị bán lại), nhưng người không nợ vào mùa vẫn không có khoản nợ nào.",
    fix: "reset.effects thêm borrow:0.5; thẻ mở màn kể tờ giấy vay nóng.", open: (p) => !has(p, (x) => x.kind === "nợ" && /borrow/.test(x.what)) },
  vu_an_gia_toc: { claim: "Bạn được cả họ giao giữ căn nhà cũ (người giữ chìa, nghi phạm), nhưng reset chỉ có dàn mới; hệ số 0.9 gần như không thấy.",
    fix: "rules.yearly money −0.03: người giữ chìa gánh tiền giữ nhà; thẻ va_mo_chia_khoa và va_day_to_cao nhắc khoản đó.", open: (p) => !p.changes.length },
  ngoi_sao: { claim: "Lời kể hứa thu nhập ×3 và nổi tiếng; người chưa có lương (từ 8 tuổi vào được) không đổi gì, cờ no_privacy không ai đọc.",
    fix: "reset.effects money +0.3 (tiền bản quyền đoạn clip, ai cũng nhận); ns_mo_clip kể khoản đó.", open: (p) => !has(p, (x) => x.src !== "rules.income") },
  lam_lai: { claim: "ll_mo_trang_tay: \"Mọi thứ của đời trước đã mất: tiền, chỗ ở\" trong khi người có nhà riêng vẫn giữ căn nhà.",
    fix: "Chữ rẽ theo home_owner: căn nhà cũ vẫn đứng tên bạn, nhưng ở lại phía sau.", open: (p) => /mất: tiền, chỗ ở/.test(p.text("ll_mo_trang_tay", { home_owner: true })) },
  w_S07: { claim: "Ký hợp đồng lên trạm sao Hỏa, \"lương gấp ba\", nhận ca trực; nghề trong host vẫn là nghề cũ, người chưa có việc vẫn không có lương để nhân ba.",
    fix: "s07_mo_buong: ca ngoài trời job_switch:build, ca nhà kính job_switch:farm (cả hai lựa chọn).", open: (p) => !has(p, (x) => x.kind === "việc") },
  w_S18: { claim: "s18_ket: người thuê \"hỏi bạn có muốn đi cùng không\" cả khi lựa chọn lên tàu (migrate_now) bị ẩn.",
    fix: "Câu rẽ theo migrateOk(c): chuyến này không chở thêm được ai.", open: (p) => /đi cùng không/.test(p.text("s18_ket", NO_MIGRATE)) },
  w_S33: { claim: "Nhánh chỉ mở cho người vừa mất việc, rồi kể \"nhận việc, lương gấp ba\"; host không cho việc nào, ×3 của 0 vẫn là 0.",
    fix: "s33_mo_phong: cả hai lựa chọn job_switch:office.", open: (p) => !has(p, (x) => x.kind === "việc") },
  w_S34: { claim: "s34_ket: \"giấy tờ đã sẵn, đi thì đi cho sớm\" cả khi lựa chọn đổi nước bị ẩn.",
    fix: "Câu rẽ theo migrateOk(c): giấy tờ ra nước ngoài không xin được.", open: (p) => /giấy tờ đã sẵn/.test(p.text("s34_ket", { ...NO_MIGRATE, counters: { s34_di: 3 } })) },
  w_S38: { claim: "s38_ket: \"Mỗi cư dân được chọn: nhận giấy tờ ở lại nước đó…\" cả khi lựa chọn đó bị ẩn.",
    fix: "Câu rẽ theo migrateOk(c): tên bạn không có trong danh sách.", open: (p) => /nhận giấy tờ ở lại nước đó/.test(p.text("s38_ket", NO_MIGRATE)) },
  w_S48: { claim: "\"Mỗi lần buồn sẽ bị trừ tiền thẳng vào tài khoản\", \"tin nhắn trừ tiền đầu tiên tới\"; một lựa chọn không mất đồng nào.",
    fix: "rules.yearly money −0.05: tiền phạt buồn mỗi năm.", open: (p) => !yearlyMoney(p, -1) },
  w_S50: { claim: "\"Hệ thống xóa luôn mọi khoản nợ mang tên bạn\" (nhánh chỉ mở khi đang nợ); nợ trong host vẫn còn nguyên.",
    fix: "reset.effects repay:50 (sổ nợ trắng tinh); chung kết lấy lại tên cũ mở một sổ nợ mới (borrow:1) kèm tiền phạt.", open: (p) => !has(p, (x) => /repay/.test(x.what)) },
  w_X07: { claim: "x07_day_bua_com: \"Xin hãng nghỉ một năm không lương\": hợp đồng khuôn mặt không phải một chỗ làm có lương.",
    fix: "Nhãn đổi thành \"Xin hãng tạm ngưng hợp đồng một năm\".", open: (p) => /không lương/.test(p.text("x07_day_bua_com")) },
  w_X12: { claim: "\"Để ông ấy khép sổ: Nhẹ nợ hôm nay\" mà không trả đồng nợ nào; \"quyết định thôi việc\" trong khi host vẫn giữ việc (chỉ ×0.3).",
    fix: "Lựa chọn khép sổ thêm repay:0.5; chữ về chỗ làm đổi thành \"lương chỉ còn trả qua người nhà, bị cắt gần hết\".",
    open: (p) => p.choices("x12_mo_vong_hoa").some((c) => /Nhẹ nợ/.test(c.hint ?? "") && !/repay/.test(c.effects.custom ?? "")) || /thôi việc/.test(p.text("x12_kd_tai_khoan", { has_job: true })) },
  w_X15: { claim: "x15_ket: \"giấy tờ ở lại đã có cửa, chỉ chờ bạn gật đầu\" cả khi lựa chọn ở lại hợp pháp (migrate_now) bị ẩn.",
    fix: "Câu rẽ theo migrateOk(c): giấy tờ chưa có cửa, bến cảng còn cần người làm.", open: (p) => /đã có cửa/.test(p.text("x15_ket", { ...NO_MIGRATE, flags: new Set(["x15_bao_lanh"]) })) },
  w_X25: { claim: "\"Từ nay lương hưu sẽ trả bằng dưa\" (sẽ hỏng sau năm mươi ngày); host vẫn trả đủ bằng tiền.",
    fix: "rules.yearly money −0.05: phần lương hưu về bằng dưa, bán không kịp thì hỏng.", open: (p) => !yearlyMoney(p, -1) },
  w_X33: { claim: "x33_day_quang_cao: \"một khoản tiền bằng ba năm thu nhập\", lựa chọn chỉ cho money 0.6.",
    fix: "Chữ đổi thành \"hơn nửa năm thu nhập\".", open: (p) => /ba năm thu nhập/.test(p.text("x33_day_quang_cao")) },
  w_X40: { claim: "\"Mình mượn tạm ít tiền\", \"kiểm tra ví và thấy thiếu đúng số tiền một đôi giày\"; một lựa chọn không mất đồng nào.",
    fix: "rules.yearly money −0.05: mỗi năm người kia tiêu một ít tiền của bạn.", open: (p) => !yearlyMoney(p, -1) },
};
