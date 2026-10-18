/**
 * Thẻ tiền: ĐẦU TƯ VÀ PHÒNG THÂN (12 thẻ, tiền tố mi_).
 * Sổ tiết kiệm, vàng lúc khủng hoảng, tin đồn ngân hàng đổ, góp vốn làm ăn, bảo hiểm, mô hình "lãi cao",
 * hụi / nhóm góp tiền xoay vòng, quỹ dưỡng già, bỏ bảo hiểm lúc túng, tiền thưởng bất ngờ, cơn sốt đầu cơ.
 * Lừa đảo và hụi vỡ: chỉ kể hậu quả, không tả cách làm. Chi tiết Việt Nam chỉ khi c.country === "VN".
 */
import type { Storylet, FactContext, Effect, MemoryTag } from "../types.ts";
import { C, T, f, role, vary, money } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
/** Đổi số tiền (CU) sang số năm thu nhập, kẹp vào khung hợp lệ của deposit/withdraw. */
const yrs = (c: FactContext, cu: number): number => Math.min(5, Math.max(0.05, Math.round((cu / Math.max(1, c.income)) * 100) / 100));
const mem = (npc: string | undefined, tag: MemoryTag, weight: number, note: string): Effect => (npc ? { memory: { npc, tag, weight, note } } : {});
const tr = (npc: string | undefined, delta: number): Effect => (npc ? { trust: { npc, delta } } : {});

export const PACK_MONEY_INVEST: Storylet[] = [
  /* ---------- 1. sổ tiết kiệm đầu tiên ---------- */
  money("mi_first_account", [18, 35], 99, 0.6, (c) => !c.owns.has("deposit") && !c.broke && c.own_cash >= 0.2 * c.income, (c) => T("Cuốn sổ tiết kiệm đầu tiên",
    `Tiền bạn dành dụm đang nằm trong một ${vn(c) ? "hộp bánh cũ dưới gầm giường" : "phong bì kẹp trong tủ quần áo"}, đếm lại được đúng ${c.poor_country ? "bốn tháng" : "ba tháng"} lương. Nhân viên ngân hàng gần chỗ làm nói gửi kỳ hạn một năm thì có lãi, nhưng rút trước hạn sẽ mất phần lãi.`, [
    C("Mở sổ, gửi gần hết", { deposit: 0.25, counters: { save: 1 }, flags: ["mi_saver"] }, "Có lãi và đỡ tiêu vặt, cần gấp thì mất lãi"),
    C("Gửi một nửa, giữ một nửa ở nhà", { deposit: 0.12, counters: { save: 1 } }, "Vừa có lãi vừa có tiền ngay, lãi ít hơn"),
    C("Cứ để trong nhà cho tiện", { counters: { cash_home: 1 }, gamble: { p: 0.85, win: { log: "Hộp tiền vẫn nằm yên chỗ cũ, chỉ vơi dần qua những lần tiêu vặt." }, lose: { money: -0.1, happy: -4, log: "Một hôm đi làm về, cửa bị cạy. Hộp tiền không còn." } } }, "Tiện lấy, không lãi, có thể mất trộm")], 0)),

  /* ---------- 2. vàng lúc khủng hoảng ---------- */
  money("mi_gold_crisis", [22, 80], 8, 0.4, (c) => c.econ_phase === "crisis" && !c.broke, (c) => T("Hàng người trước tiệm vàng",
    vary("mi_gold", c.age, [
      `Kinh tế lao dốc, người ta xếp hàng trước ${vn(c) ? "tiệm vàng đầu chợ" : "cửa hàng kim loại quý"} từ sáu giờ sáng. Giá vàng tăng ba phiên liền, bảng giá thay số liên tục.`,
      `Đồng tiền mất giá từng tuần. Một người quen khoe vừa đổi hết tiền lương ra vàng, "để đó không bao giờ mất". Giá mua và giá bán đang chênh nhau rộng nhất từ trước tới giờ.`,
    ]), [
    C(vn(c) ? "Mua vàng miếng, cất kỹ" : "Mua vàng thỏi, cất kỹ", { buy: { kind: "gold", name: "vàng miếng", price: 0.5 }, counters: { mi_gold: 1 } }, "Giữ giá qua khủng hoảng, mua đỉnh thì lỗ"),
    C("Mua một chỉ nhẫn vàng cho yên tâm", { buy: { kind: "gold", name: "nhẫn vàng", price: 0.12 }, counters: { mi_gold: 1 } }, "Ít tiền, yên tâm, chẳng giàu thêm"),
    ...(c.owns.has("gold") ? [C("Bán bớt số vàng đang có lúc giá cao", { sell: { kind: "gold" }, flags: ["mi_sold_gold_top"] }, "Chốt lời bây giờ, giá có thể còn lên", { tier: "awakened" as const })] : []),
    C("Đứng ngoài, giữ tiền như cũ", { happy: -1 }, "Không mua đỉnh, cũng không được che chắn")], c.owns.has("gold") ? 3 : 2)),

  /* ---------- 3. tin đồn ngân hàng đổ ---------- */
  money("mi_bank_rumor", [20, 85], 10, 0.3, (c) => c.deposit > 0 && c.econ_phase === "crisis", (c) => { const all = yrs(c, c.deposit); const half = yrs(c, c.deposit / 2); return T("Tin đồn ngân hàng sắp đổ",
    `Sáng nay trước chi nhánh ngân hàng nơi bạn gửi tiền có gần trăm người đứng chờ, ai cũng cầm sổ. Trên mạng lan một tấm ảnh chụp "văn bản nội bộ" không rõ thật giả. Nhân viên nói tiền vẫn an toàn, nhưng chỉ cho rút mỗi người một khoản trong ngày.`, [
    C("Xếp hàng rút hết, mất lãi cũng được", { withdraw: all, counters: { cash_home: 1 }, bw: -3 }, "Chắc tay, mất lãi, lại phải giữ tiền mặt"),
    C("Rút một nửa, để lại một nửa", { withdraw: half, bw: -1 }, "Chia rủi ro làm đôi"),
    C("Hỏi rõ mức bảo hiểm tiền gửi rồi mới quyết", { flags: ["mi_checked_guarantee"], know: 2, gamble: { p: 0.6, win: { happy: 2, log: "Phần tiền của bạn nằm trong mức được bảo đảm. Bạn về nhà, ngủ được." }, lose: { bw: -4, log: "Nơi bạn sống không có quỹ bảo đảm nào đáng kể. Bạn đành chờ xem." } } }, "Tốn một buổi, quyết bằng thông tin thay vì tin đồn", { tier: "awakened" }),
    C("Không làm gì, chờ tin đồn qua", { counters: { mi_held_bank: 1 } }, "Giữ lãi, nếu ngân hàng đổ thật thì mất")], 1); }),

  /* ---------- 4. góp vốn làm ăn ---------- */
  money("mi_joint_venture", [25, 60], 10, 0.45, (c) => !!role(c, "partner") && !c.broke, (c, N) => { const p = role(c, "partner")!; const biz = vary("mi_jv", c.age, [
      c.poor_country ? "một xưởng xay xát nhỏ ở ven thị trấn" : "một tiệm giặt là ở khu chung cư mới",
      c.poor_country ? "hai chiếc xe tải nhỏ chở hàng thuê" : "một quầy cà phê trong tòa văn phòng",
    ]); return T(`${N(p)} rủ góp vốn`,
    `${N(p)} đã xem xong mặt bằng cho ${biz} và cần thêm một người góp vốn. Tính trên giấy, hai năm là hoàn vốn. ${N(p)} chưa nói ai sẽ giữ sổ sách.`, [
    C("Góp phần lớn, tin nhau là chính", { buy: { kind: "stake", name: "phần vốn góp với " + N(p), price: 0.6, with_npc: p }, ...tr(p, 0.1) }, "Lời nhiều nếu suôn sẻ, không giấy tờ thì khó đòi"),
    C("Góp ít hơn, đòi hợp đồng và sổ sách chung", { buy: { kind: "stake", name: "phần vốn có hợp đồng", price: 0.35, with_npc: p }, flags: ["mi_stake_contract"], ...mem(p, "WIN_WIN_DEAL", 0.15, "góp vốn có hợp đồng rõ ràng") }, "Phần lời nhỏ hơn, cãi nhau thì có giấy", { tier: "sovereign" }),
    C("Không góp vốn, chỉ cùng làm thử một chuyến hàng", { game: { npc: p, move: "cooperate", stake_frac: 0.15 } }, "Thử lòng nhau bằng một khoản nhỏ"),
    C("Từ chối, giữ tiền", { ...tr(p, -0.05) }, "Không rủi ro, có thể lỡ một cơ hội")], 1, { npc: p }); }),

  /* ---------- 5. người bán bảo hiểm sức khỏe ---------- */
  money("mi_health_policy", [25, 60], 10, 0.55, (c) => !c.insured.has("health"), (c) => T("Người bán bảo hiểm sức khỏe",
    vary("mi_hp", c.age, [
      "Một người bán bảo hiểm ngồi chờ bạn ở quán nước trước cơ quan, mang theo xấp tài liệu dày hai đốt ngón tay. Phí mỗi năm bằng gần nửa tháng lương.",
      `Một người quen cũ gọi điện mời bạn mua bảo hiểm sức khỏe, kể chuyện ${c.parent_sick ? "một người cùng tuổi bố mẹ bạn" : "một đồng nghiệp"} nằm viện ba tuần mà không phải bán gì.`,
    ]), [
    C("Ký luôn cho xong", { insure: "health" }, "Ốm có người trả một phần, mất phí mỗi năm"),
    C("Xin hợp đồng mang về đọc từng dòng", { know: 2, bw: -2, gamble: { p: 0.6, win: { insure: "health", flags: ["mi_read_fine_print"], log: "Bạn gạch chân ba điều khoản loại trừ, hỏi lại, rồi mới ký." }, lose: { flags: ["mi_read_fine_print"], log: "Đọc đến trang mười, bạn thấy hợp đồng loại trừ đúng những bệnh nhà bạn hay mắc. Bạn không ký." } } }, "Chậm hơn, biết rõ mình được trả gì", { tier: "awakened" }),
    C("Không mua, tự để riêng một khoản phòng ốm", { deposit: 0.08, counters: { save: 1 } }, "Tiền vẫn là của mình, ốm nặng thì không đủ"),
    C("Từ chối", {}, "Không mất phí, ốm thì tự lo")], 3)),

  /* ---------- 6. bảo hiểm tài sản sau đám cháy nhà hàng xóm ---------- */
  money("mi_neighbor_fire", [22, 85], 12, 0.4, (c) => (c.owns.has("house") || c.owns.has("shop")) && !c.insured.has("property"), (c, N) => { const nb = role(c, "neighbor"); const what = c.owns.has("house") ? (c.asset_names.house ?? "căn nhà") : (c.asset_names.shop ?? "cửa hàng"); return T("Đám cháy bên kia tường",
    `${nb ? `Nhà ${N(nb)}` : "Căn nhà sát vách"} cháy lúc hai giờ sáng vì chập điện. Không ai bị thương, nhưng cả tầng dưới thành than và họ không có bảo hiểm. Bạn đứng nhìn bức tường chung còn ám khói, nghĩ đến ${what} của mình.`, [
    C("Mua bảo hiểm tài sản ngay tuần này", { insure: "property" }, "Mất phí hằng năm, cháy thì không trắng tay"),
    C("Tự sửa lại điện trong nhà, không mua bảo hiểm", { money: -0.04, flags: ["mi_rewired"] }, "Giảm nguy cơ, nhưng chẳng ai đền nếu xảy ra"),
    ...(nb ? [C(`Góp tiền giúp ${N(nb)} dựng lại`, { give: { npc: nb, amount: 0.05 }, ...mem(nb, "HELPED_IN_CRISIS", 0.3, "góp tiền sau đám cháy"), rel: 2 }, "Mất tiền, được một người hàng xóm")] : []),
    C("Không làm gì, chuyện xui khó trúng hai lần", {}, "Giữ tiền, gánh trọn rủi ro")], 0); }),

  /* ---------- 7. mô hình "lãi 5% mỗi tháng" ---------- */
  money("mi_scheme", [20, 75], 15, 0.5, (c) => !c.broke || c.owns.has("deposit"), (c, N) => { const fr = role(c, "childhood_friend"); const who = fr ? N(fr) : vn(c) ? "Một chị trong xóm" : "Một đồng nghiệp cũ"; return T("Lời hứa lãi năm phần trăm mỗi tháng",
    `${who} kể đã "đầu tư" vào một quỹ được trả đều năm phần trăm mỗi tháng, tháng nào cũng đúng ngày. Người giới thiệu thêm người còn được thưởng. Không ai giải thích được tiền lãi ấy từ đâu ra.`, [
    C("Bỏ một khoản lớn vào", { gamble: { p: 0.12, win: { money: 0.25, counters: { gamble: 1 }, log: "Bạn rút ra kịp trước khi quỹ đóng cửa. Nhiều người khác thì không." }, lose: { money: -0.6, happy: -8, flags: ["mi_scheme_victim"], ...mem(fr, "CHEATED_ME", -0.2, "rủ vào quỹ lãi cao rồi mất trắng"), log: "Tháng thứ bảy, quỹ ngừng trả lãi. Văn phòng đóng cửa, số điện thoại không ai nghe." } } }, "Có thể lời vài tháng, thường là mất gốc"),
    C("Thử một ít cho biết", { gamble: { p: 0.25, win: { money: 0.03, log: "Bạn nhận lãi hai tháng rồi rút ra, coi như may." }, lose: { money: -0.08, counters: { gamble: 1 }, log: "Khoản nhỏ ấy không bao giờ quay về." } } }, "Mất ít, nhưng đã đặt chân vào"),
    C("Cảnh báo những người đang định góp tiền", { agency: 0.02, rel: -1, flags: ["mi_warned_scheme"], ...tr(fr, -0.15), gamble: { p: 0.5, win: { rel: 4, log: "Một năm sau quỹ sụp. Vài người tìm đến cảm ơn bạn đã can." }, lose: { happy: -2, log: "Người ta bảo bạn ghen ăn tức ở. Khi quỹ sụp, chẳng ai nhắc lại." } } }, "Mất lòng người rủ, có thể giữ tiền cho người khác", { tier: "sovereign" }),
    C("Lắc đầu, không làm gì", {}, "Không lời, không lỗ")], 3, fr ? { npc: fr } : {}); }),

  /* ---------- 8. hụi / nhóm góp tiền xoay vòng ---------- */
  money("mi_rotating_club", [22, 65], 12, 0.5, () => true, (c, N) => { const nb = role(c, "neighbor"); const club = vn(c) ? "dây hụi" : "nhóm góp tiền xoay vòng"; return T(vn(c) ? "Dây hụi mười hai người" : "Nhóm góp tiền mười hai người",
    `${nb ? N(nb) : "Một người quen"} rủ bạn vào ${club}: mười hai người, mỗi tháng mỗi người góp một khoản, mỗi tháng một người nhận cả phần. Ai cần trước thì nhận trước nhưng chịu bớt một phần cho người nhận sau. Người cầm sổ chỉ ghi tay.`, [
    C("Vào và nhận phần sớm, chịu bớt tiền", { custom: "borrow:0.3", flags: ["mi_club_early"], ...tr(nb, 0.05) }, "Có tiền ngay, phải góp đủ các tháng sau"),
    C("Vào và chờ nhận cuối để được trọn phần", { money: -0.3, flags: ["mi_club_late"], gamble: { p: 0.75, win: { money: 0.36, log: `Cuối năm bạn nhận đủ phần, thêm một khoản như tiền lãi.` }, lose: { happy: -6, ...mem(nb, "CHEATED_ME", -0.3, vn(c) ? "dây hụi vỡ" : "nhóm góp tiền tan"), log: `Tháng thứ chín, người cầm sổ bỏ đi. ${vn(c) ? "Dây hụi vỡ" : "Nhóm tan"}, phần của bạn không ai trả.` } } }, "Được phần lãi, nhưng nhóm có thể tan trước"),
    C("Đứng ra giữ sổ, công khai mỗi kỳ", { money: -0.3, agency: 0.02, flags: ["mi_club_keeper"], gamble: { p: 0.85, win: { money: 0.34, rel: 3, log: "Cả nhóm chép sổ mỗi tháng. Năm sau người ta tự tìm đến xin vào." }, lose: { money: -0.15, rel: -3, log: "Một người bỏ trốn giữa chừng. Bạn giữ sổ nên phải bù phần thiếu." } } }, "Tốn công, giữ được tiền và tiếng của cả nhóm", { tier: "sovereign" }),
    C("Không vào", {}, "Không rủi ro, không có khoản xoay lúc cần")], 3, nb ? { npc: nb } : {}); }),

  /* ---------- 9. quỹ dưỡng già ---------- */
  money("mi_nest_egg", [45, 62], 12, 0.55, (c) => !c.broke, (c) => { const biz = c.owns.has("shop") || c.owns.has("stake") || f(c, "own_business"); return T("Khoản tiền cho tuổi già",
    `Bạn ngồi tính: còn khoảng ${Math.max(3, 62 - c.age)} năm nữa là hết sức đi làm. Ở tuổi bạn, ${c.poor_country ? "lương hưu nếu có cũng chỉ đủ tiền chợ" : "lương hưu chỉ bằng chừng một nửa lương bây giờ"}. Trong tài khoản có một khoản chưa biết để làm gì.`, [
    C("Gửi kỳ hạn dài, hứa không động tới", { deposit: 0.8, flags: ["mi_nest_egg"], counters: { save: 1 } }, "Yên lòng về già, kẹt khi cần tiền gấp"),
    C("Chia ra: một phần gửi, một phần mua vàng", { deposit: 0.4, buy: { kind: "gold", name: "vàng để dành", price: 0.25 }, flags: ["mi_nest_egg"] }, "Không bỏ trứng một giỏ, lãi chẳng cao", { tier: "awakened" }),
    ...(biz ? [C("Để tiền quay vòng trong việc làm ăn", { counters: { mi_biz_cash: 1 }, gamble: { p: 0.55, win: { money: 0.3, log: "Năm ấy làm ăn được. Khoản tiền sinh thêm một phần ba." }, lose: { money: -0.3, log: "Hàng tồn, khách nợ. Khoản dưỡng già mỏng đi một nửa." } } }, "Có thể sinh lời nhiều hơn, cũng có thể hao")] : []),
    C("Để sau, giờ vẫn còn khỏe", {}, "Tiền linh hoạt, tuổi già chưa có gì chắc")], 0); }),

  /* ---------- 10. bỏ bảo hiểm lúc túng ---------- */
  money("mi_drop_policy", [25, 80], 8, 0.6, (c) => c.insured.size > 0 && c.broke, (c) => { const both = c.insured.has("health") && c.insured.has("property"); const k = c.insured.has("health") ? "health" as const : "property" as const; return T("Hóa đơn phí bảo hiểm",
    `Thư nhắc đóng phí bảo hiểm ${k === "health" ? "sức khỏe" : "tài sản"} đến cùng tuần với hóa đơn tiền điện và tiền học. Trong ví còn chưa đến nửa tháng chi tiêu. Năm nay bạn chưa dùng đến bảo hiểm lần nào.`, [
    C(both ? "Bỏ bảo hiểm sức khỏe, lấy tiền tiêu trước" : "Bỏ hợp đồng, lấy tiền tiêu trước", { uninsure: k, flags: ["mi_dropped_policy"] }, "Nhẹ chi ngay, có chuyện thì tự gánh"),
    both
      ? C("Bỏ bảo hiểm tài sản, giữ bảo hiểm sức khỏe", { uninsure: "property", flags: ["mi_dropped_policy"] }, "Giữ cái khó gánh nhất, bớt một khoản phí", { tier: "awakened" })
      : C("Vay tạm một khoản để đóng cho kịp", { custom: "borrow:0.05" }, "Giữ bảo hiểm, thêm một khoản nợ"),
    C("Cắt chi tiêu cả nhà để giữ bảo hiểm", { lifestyle: "tan_tien", happy: -3 }, "Giữ được tấm khiên, cả nhà sống chật hơn", { longterm: true }),
    C("Không làm gì, cứ đóng như mọi năm", { money: -0.03, bw: -3 }, "Giữ bảo hiểm, tháng này ăn uống chật vật")], 0); }),

  /* ---------- 11. khoản thưởng bất ngờ ---------- */
  money("mi_windfall", [22, 60], 10, 0.6, (c) => c.has_job, (c) => T("Khoản thưởng bất ngờ",
    vary("mi_wf", c.age, [
      "Cuối năm công ty làm ăn được, bạn nhận một khoản thưởng bằng ba tháng lương, chuyển thẳng vào tài khoản lúc nửa đêm.",
      "Một dự án cũ bạn làm năm trước được trả nốt phần còn lại, nhiều hơn bạn tưởng gần gấp đôi.",
      `Bạn nhận một khoản tiền không ngờ tới. ${c.married ? "Người nhà" : "Bạn bè"} đã kịp gợi ý cả chục cách tiêu.`,
    ]), [
    C("Gửi tiết kiệm hết", { money: 0.25, deposit: 0.25, counters: { save: 1 } }, "Dày thêm sổ, không ai được hưởng gì ngay"),
    C(vn(c) ? "Mua vàng để dành" : "Mua một ít vàng để dành", { money: 0.25, buy: { kind: "gold", name: "nhẫn vàng", price: 0.25 } }, "Cất giá trị, giá vàng lên xuống thất thường"),
    C("Đưa cả nhà đi chơi một chuyến cho đáng", { money: 0.05, happy: 6, rel: 4, counters: { mi_spent_bonus: 1 } }, "Hết tiền, còn kỷ niệm"),
    C("Không làm gì, để nguyên trong tài khoản", { money: 0.25 }, "Linh hoạt, dễ tiêu dần lúc nào không hay")], 0)),

  /* ---------- 12. cơn sốt đầu cơ thời kinh tế lên ---------- */
  money("mi_boom_fever", [20, 75], 8, 0.4, (c) => c.econ_phase === "boom", (c) => { const land = c.owns.has("land"); return T("Cơn sốt làm giàu nhanh",
    vary("mi_bf", c.age, [
      `Kinh tế đang lên. Ở quán nước, ai cũng nói về ${vn(c) ? "đất nền ven đô" : "một loại cổ phiếu mới"} vừa tăng gấp ba trong nửa năm. Người bán hàng rong cũng hỏi bạn đã "vào" chưa.`,
      "Hàng xóm vừa trúng giải xổ số, mua ngay chiếc xe mới. Cả khu phố tuần này đều mua vé, quầy vé số hết hàng trước mười giờ sáng.",
    ]), [
    C("Dồn tiền theo cơn sốt", { counters: { gamble: 1 }, gamble: { p: 0.35, win: { money: 0.5, log: "Bạn bán ra đúng lúc. Ba tháng sau giá rơi một nửa." }, lose: { money: -0.6, happy: -5, flags: ["mi_bubble_burned"], log: "Bạn mua gần đỉnh. Cơn sốt tắt, không ai mua lại với giá ấy." } } }, "Có thể lời nhanh, thường mua đúng đỉnh"),
    C("Mua vài tấm vé số cho vui", { money: -0.01, counters: { gamble: 1 }, gamble: { p: 0.02, win: { money: 1.5, log: "Một tấm trúng. Bạn đọc đi đọc lại dãy số ba lần." }, lose: { log: "Không tấm nào trúng. Tiền vé bằng một bữa ăn." } } }, "Mất ít, mua được một tuần mơ mộng"),
    land
      ? C("Bán mảnh đất đang có lúc giá đang cao", { sell: { kind: "land" }, flags: ["mi_sold_at_peak"] }, "Chốt lời bây giờ, có thể bán hớ nếu còn lên", { tier: "awakened" })
      : C("Đứng ngoài, gửi phần dư vào tiết kiệm", { deposit: 0.15, flags: ["mi_sat_out_boom"] }, "Lãi chậm, ngủ ngon khi cơn sốt tắt", { tier: "awakened" }),
    C("Không làm gì", {}, "Không lời, không lỗ")], 3); }),
];
