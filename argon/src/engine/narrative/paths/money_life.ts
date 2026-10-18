/**
 * Gói thẻ tiền: MỨC SỐNG. Một người chọn sống thế nào với đồng tiền của mình (10 thẻ, từ 18 tuổi).
 * Lương đầu · tăng lương · vợ chồng mới cưới · con so bì · họ hàng chê keo · về quê khoe mẽ ·
 * nợ ép cắt chi · về hưu · tiền từ trên trời · tằn tiện lâu năm.
 * Bộ đếm riêng: ml_frugal (những lần chọn để dành), ml_face (những lần chi cho thể diện).
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, role, vary, money } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const parent = (c: FactContext): string | undefined => role(c, "mother") ?? role(c, "father");

export const PACK_MONEY_LIFE: Storylet[] = [
  /* ---------- lương đầu ---------- */
  money("ml_first_pay", [18, 27], 99, 0.8, (c) => c.has_job, (c, N) => { const p = parent(c);
    return T("Tháng lương đầu tiên", `Tháng lương đầu tiên vào tài khoản lúc chín giờ sáng.${vn(c) ? " Mẹ nhắn nhớ để một phong bì biếu ông bà." : " Cả nhóm đồng nghiệp rủ đi ăn mừng tối nay."} Căn phòng thuê của bạn vẫn chỉ có một cái quạt và tấm nệm mỏng.`, [
      C("Sắm sửa cho ra dáng người đi làm", { lifestyle: "thoai_mai", money: -0.04, happy: 4 }, "Sống dễ chịu ngay, khó bắt đầu để dành"),
      C("Sống như sinh viên, gửi tiết kiệm đều", { lifestyle: "tan_tien", deposit: 0.05, happy: -2, counters: { ml_frugal: 1 } }, "Có vốn sớm, bỏ qua vài niềm vui tuổi trẻ"),
      ...(p ? [C(`Biếu ${N(p)} trọn tháng lương đầu`, { give: { npc: p, amount: 0.06 }, trust: { npc: p, delta: 0.2 } }, "Bố mẹ nở mày nở mặt, bạn trắng tay tháng này")] : []),
      C("Chưa đổi gì, cứ tiêu dần", { happy: 1 }, "Không phải nghĩ, tiền trôi đi lúc nào không biết")], p ? 3 : 2); }),

  /* ---------- tăng lương ---------- */
  money("ml_raise", [24, 58], 10, 0.6, (c) => c.has_job && !c.broke, (c) => { const up = c.lifestyle === "thoai_mai" || c.lifestyle === "pho_truong" ? "pho_truong" : "thoai_mai";
    return T("Lương tăng một bậc", vary("mlr", c.age, [
      "Bạn được lên trưởng nhóm, lương tăng ba phần mười. Chưa hết tuần, cả phòng đã hỏi bao giờ bạn đổi xe.",
      "Cuối năm bạn được thưởng và tăng lương. Người cùng đợt với bạn đã kịp chuyển sang căn hộ có hồ bơi trên tầng thượng.",
      "Một chỗ làm mới trả bạn cao hơn hẳn. Tháng đầu, bạn thấy trong ví có một khoảng trống đang chờ được lấp."]), [
      C("Nâng mức sống theo lương mới", { lifestyle: up, happy: 4 }, "Sống sướng hơn, từ nay lương phải luôn cao thế"),
      C("Giữ nếp cũ, gửi hết phần tăng", { deposit: 0.15, counters: { ml_frugal: 1 }, rel: -1 }, "Của để dành dày lên, người quanh bạn thấy bạn keo"),
      C("Đổi phần tăng lấy thời gian: xin làm bốn ngày", { income_mult: 0.88, bw: 6, happy: 4, flags: ["four_day_week"] }, "Ít tiền hơn, có lại những buổi chiều", { tier: "awakened" }),
      C("Không đổi gì, để xem đã", {}, "Không quyết, tiền tăng tự tìm chỗ để tiêu")], 3); }),

  /* ---------- vợ chồng mới cưới ---------- */
  money("ml_couple", [20, 50], 99, 0.7, (c) => c.married && !!role(c, "spouse") && (c.counters.married_years ?? 0) <= 3, (c, N) => { const s = role(c, "spouse")!;
    return T("Hai cách tiêu tiền chung một nhà", `Ba tháng sau đám cưới, ${N(s)} mua một bộ nồi đắt bằng nửa tháng lương mà không hỏi bạn. Bạn thì quen ghi từng khoản tiền chợ vào một cuốn sổ nhỏ. Tối nay cả hai ngồi nhìn cuốn sổ, không ai nói trước.`, [
      C(`Chiều theo cách sống của ${N(s)}`, { lifestyle: "thoai_mai", trust: { npc: s, delta: 0.15 } }, "Nhà vui vẻ, tiền để dành mỏng đi"),
      C("Giữ nếp tằn tiện, bắt ghi sổ chung", { lifestyle: "tan_tien", trust: { npc: s, delta: -0.15 }, happy: -2 }, "Tiền chắc, không khí trong nhà căng"),
      C("Chia ba quỹ: quỹ chung và quỹ riêng mỗi người", { lifestyle: "vua_phai", trust: { npc: s, delta: 0.1 }, flags: ["split_budget"], agency: 0.02 }, "Mỗi người tự do một phần, tháng nào cũng phải ngồi tính", { tier: "sovereign" }),
      C("Lờ đi, không nói chuyện tiền", { bw: -3, happy: -1 }, "Yên hôm nay, chuyện tiền dồn lại về sau")], 2, { npc: s }); }),

  /* ---------- con so bì với bạn ---------- */
  money("ml_kid_compare", [32, 62], 8, 0.6, (c) => c.kids_teen > 0 && !!role(c, "child"), (c, N) => { const k = role(c, "child")!;
    return T("Con so với bạn cùng lớp", vary("mlk", c.age, [
      `${N(k)} về nhà, kể cả lớp chỉ còn mình dùng chiếc điện thoại cũ màn hình nứt. Chiếc mới đắt bằng hai tuần lương của bạn.`,
      `${N(k)} xin tiền mua đôi giày giống cả nhóm bạn, giá gấp bốn đôi đang đi. Con bảo không có thì bị trêu là quê mùa.`]), [
      C("Mua ngay cho con", { give: { npc: k, amount: 0.04 }, trust: { npc: k, delta: 0.15 } }, "Con hãnh diện hôm nay, quen đòi là có"),
      C("Bảo con tự để dành, bạn bù một nửa", { give: { npc: k, amount: 0.02 }, trust: { npc: k, delta: 0.05 }, flags: ["kid_saves"], promise: { to: k, what: "bù một nửa khi con để dành đủ", years: 1 } }, "Con phải chờ, học được giá của đồng tiền", { tier: "awakened" }),
      C("Tăng tiền tiêu cho con từ nay", { support: { who: "kids", level: "hau" }, trust: { npc: k, delta: 0.1 } }, "Con không thua bạn, nhà gánh thêm mỗi tháng"),
      C("Không mua, nói thật hoàn cảnh nhà", { trust: { npc: k, delta: -0.1 } }, "Giữ được tiền, con có thể ngại với bạn bè")], 1, { npc: k }); }),

  /* ---------- họ hàng chê sống keo ---------- */
  money("ml_kin_frugal", [22, 75], 8, 0.6, (c) => c.lifestyle === "tan_tien" && c.lifestyle_years >= 3, (c) =>
    T("Bị chê sống như người nghèo", vary("mlj", c.age, vn(c) ? [
      "Đám giỗ ông nội, bà cô nhìn chiếc áo sờn cổ của bạn rồi nói to cho cả mâm nghe: \"Làm ra tiền mà sống như đi xin.\" Mấy đứa em họ cúi xuống cười.",
      "Mồng hai Tết, cả họ khoe xe, khoe nhà. Đến lượt bạn, ai cũng nhìn chiếc xe máy mười hai năm tuổi dựng ngoài cổng."] : [
      "Ở đám cưới một người họ hàng, dì bạn hỏi trước cả bàn sao bạn vẫn mặc bộ vest từ mười năm trước. Không ai cười thành tiếng.",
      "Em họ ghé chơi, mở tủ lạnh nhà bạn ra rồi hỏi nhỏ: \"Anh chị đang khó khăn à?\" Trong tủ có đúng một khay trứng và hũ dưa."]), [
      C("Nới ra một chút cho đỡ điều tiếng", { lifestyle: "vua_phai", rel: 4 }, "Họ hàng vui lòng, tốc độ để dành chậm lại"),
      C("Kệ họ, giữ nếp sống của mình", { counters: { ml_frugal: 1 }, rel: -3, happy: -1 }, "Tiền vẫn dồn lên, tiếng keo kiệt đi theo"),
      C(vn(c) ? "Góp hẳn một khoản lớn cho việc họ" : "Mời cả nhà một bữa thật tươm", { money: -0.05, rel: 5, flags: ["kin_giver"] }, "Mua lại thể diện một lần, rồi sống tiếp như cũ")], 1)),

  /* ---------- về quê / họp lớp khoe mẽ ---------- */
  money("ml_show_off", [24, 60], 8, 0.55, () => true, (c) =>
    T(vn(c) ? "Tết về quê bằng gì" : "Cuộc gặp lại sau nhiều năm", vn(c)
      ? vary("mls", c.age, [
        "Tết này bạn về quê. Thằng bạn cùng xóm năm xưa giờ đi xe mới, phát lì xì cho cả đám trẻ bằng tiền mới cứng. Mẹ bạn khẽ hỏi: \"Năm nay con lại về bằng xe khách à?\"",
        "Cận Tết, nhóm bạn cấp ba hẹn họp mặt ở nhà hàng to nhất huyện. Ai cũng hỏi nhau lương bao nhiêu, nhà mấy tầng. Bạn vẫn còn hai kỳ trả góp chiếc máy tính."])
      : vary("mls", c.age, [
        "Họp lớp mười năm. Nhóm chat bàn nhau thuê nhà hàng sang nhất thành phố, ai cũng đăng ảnh xe, nhà, chuyến đi. Bạn vẫn còn hai kỳ trả góp chiếc máy tính.",
        "Một người bạn cũ cưới ở khu nghỉ dưỡng ven biển, khách mời đi xe riêng và ở ba đêm. Phòng rẻ nhất đắt bằng nửa tháng lương của bạn."]), [
      C("Chơi lớn cho bằng người", { lifestyle: "pho_truong", money: -0.08, rel: 3, counters: { ml_face: 1 } }, "Được nể một mùa, chi tiêu phình ra mãi"),
      C("Thuê đồ, mượn xe cho một dịp", { money: -0.03, gamble: { p: 0.6,
        win: { counters: { ml_face: 1 }, log: "Không ai nhận ra. Bạn trả đồ hôm sau, thấy nhẹ cả người." },
        lose: { rel: -3, flags: ["caught_bluffing"], log: "Chủ xe gọi điện đòi xe ngay giữa tiệc. Cả bàn nghe thấy." } } }, "Rẻ, nhưng có thể vỡ chuyện trước mặt mọi người"),
      C("Đến như mình vốn thế", { happy: 1, counters: { ml_frugal: 1 } }, "Không tốn gì, chịu vài ánh nhìn")], 2)),

  /* ---------- nợ ép cắt chi ---------- */
  money("ml_cutback", [22, 65], 8, 0.75, (c) => c.rat_race || c.loan_burden > 0.3 || c.broke, (c) => { const car = c.owns.has("vehicle") ? c.asset_names.vehicle ?? "chiếc xe" : undefined;
    return T("Mười hai ngày tiền", "Tháng này, trả góp và tiền nhà xong, tài khoản còn đúng đủ cho mười hai ngày. Bạn ngồi dò từng dòng sao kê: cà phê mỗi sáng, ba gói xem phim, một thẻ phòng tập chưa bước chân vào lần nào.", [
      C("Cắt về tằn tiện, bỏ mọi khoản thừa", { lifestyle: "tan_tien", happy: -4, bw: 2 }, "Thở được về tiền, đời bớt màu"),
      ...(car ? [C(`Bán ${car}, đi xe buýt`, { sell: { kind: "vehicle" }, bw: -2 }, "Có tiền mặt ngay, mất tiện lợi mỗi ngày")] : []),
      C("Xin ngân hàng giãn nợ", { custom: "restructure", bw: 3 }, "Góp nhẹ đi, tổng tiền lãi kéo dài thêm"),
      C("Giữ nguyên, vay thêm cho qua tháng", { custom: "borrow:0.1", happy: 1 }, "Không đổi gì hôm nay, nợ dày thêm")], 0); }),

  /* ---------- về hưu ---------- */
  money("ml_retire", [58, 85], 99, 0.7, (c) => c.retired || c.age >= 60, (c) => { const house = c.home_owner && c.owns.has("house");
    return T("Những cái phong bì tuổi hưu", "Tháng đầu tiên không còn phiếu lương. Bạn chia tiền hưu và tiền để dành thành những cái phong bì: tiền chợ, tiền thuốc, tiền đám hiếu hỉ. Còn lại một cái phong bì trống, chưa biết đề chữ gì.", [
      C("Sống tằn tiện cho tiền đủ đến cuối", { lifestyle: "tan_tien", happy: -2, counters: { ml_frugal: 1 } }, "Yên tâm không hết tiền, tuổi già ít niềm vui"),
      C("Sống vừa phải, mỗi năm một chuyến đi xa", { lifestyle: "vua_phai", happy: 4, flags: ["retire_travel"] }, "Tuổi già có chuyện để kể, quỹ hao nhanh hơn"),
      ...(house ? [C("Bán nhà lớn, dọn về chỗ nhỏ hơn", { sell: { kind: "house" }, happy: -3, bw: 3, flags: ["downsized"] }, "Rủng rỉnh tiền, rời căn nhà nhiều kỷ niệm", { tier: "awakened" as const })] : []),
      C("Không tính gì, để đâu hay đó", {}, "Không mất công, có thể hụt tiền lúc ốm đau")], 1); }),

  /* ---------- tiền từ trên trời ---------- */
  money("ml_windfall", [20, 78], 10, 0.4, () => true, (c, N) => { const g = parent(c) ?? role(c, "sibling");
    return T("Một khoản tiền không ngờ", vary("mlw", c.age, [
      "Công ty chia một khoản thưởng bất ngờ, bằng nửa năm thu nhập của cả nhà. Tin nhắn ngân hàng đến lúc bạn đang chờ đèn đỏ.",
      "Một người bà con xa qua đời, để lại cho bạn một khoản tiền trong di chúc. Bạn mới gặp người ấy đúng hai lần.",
      "Tờ vé số mua cho vui ở quán nước trúng giải ba. Người bán vé đòi bạn khao cả dãy phố."]), [
      C("Tiêu cho đã: sửa nhà, đi chơi, sắm đồ", { money: 0.2, happy: 6, lifestyle: "thoai_mai" }, "Vui ngay, mức sống mới ở lại lâu hơn khoản tiền"),
      C("Gửi tiết kiệm gần hết", { money: 0.5, deposit: 0.4, counters: { ml_frugal: 1 } }, "Thêm một lớp đệm, không ai biết bạn vừa có tiền"),
      ...(g ? [C(`Chia một nửa cho ${N(g)}`, { money: 0.5, give: { npc: g, amount: 0.25 }, trust: { npc: g, delta: 0.2 } }, "Nhà ấm lòng, lần sau ai cũng nhớ bạn có tiền")] : []),
      C("Để yên trong tài khoản, chưa động", { money: 0.5 }, "Linh hoạt, dễ tiêu mòn lúc nào không hay")], 1); }),

  /* ---------- tằn tiện lâu năm ---------- */
  money("ml_long_frugal", [25, 78], 99, 0.6, (c) => c.lifestyle === "tan_tien" && c.lifestyle_years >= 5, (c) => { const paid = c.rich || c.deposit > c.income;
    return T(paid ? "Đủ tiền mà vẫn đếm từng đồng" : "Năm năm thắt lưng buộc bụng", paid
      ? `${c.lifestyle_years} năm sống tằn tiện, khoản để dành của bạn đã đủ sống vài năm không cần đi làm. Vậy mà sáng nay bạn vẫn đứng mười phút trước quầy, chọn giữa hai hộp sữa chênh nhau vài đồng.`
      : `${c.lifestyle_years} năm cắt từng khoản chi mà tiền để dành vẫn mỏng. Tuần này bạn cáu với cả người bán rau vì một bó hành, rồi ngồi một mình rất lâu trong bếp.`, [
      C("Nới ra một bậc, sống cho bây giờ", { lifestyle: "vua_phai", happy: 6 }, "Nhẹ người, tốc độ để dành chậm hẳn"),
      C("Giữ nếp, nhưng mỗi năm để riêng một khoản vui", { money: -0.03, happy: 4, flags: ["fun_budget"], counters: { ml_frugal: 1 } }, "Vẫn để dành, có chỗ thở, phải tự giữ kỷ luật", { tier: "awakened" }),
      C("Tiếp tục tằn tiện, nhắm mốc lớn hơn", { deposit: 0.1, happy: -4, health: -1, counters: { ml_frugal: 1 } }, "Mốc mới gần hơn, người mệt thêm")], paid ? 0 : 1); }),
];
