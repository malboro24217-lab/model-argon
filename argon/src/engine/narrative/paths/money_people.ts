/**
 * Gói THẺ TIỀN: CHI CHO NGƯỜI (14 thẻ). Tiền giữa bạn và những người trong đời: bạn cũ hỏi vay, anh chị em cưới,
 * con nợ quá hạn, bố mẹ ốm, con muốn đi học xa, người thân ở nước ngoài, chia thừa kế.
 * Cho vay là trò chơi lặp lại (Holdings.repayChance): tính cách người vay, ý kiến của họ về bạn và lòng tin thể chế
 * quyết định họ trả hay quỵt. Ở nơi lòng tin thấp, quỵt một lần là có lời; giữ chữ tín chỉ hợp lý khi còn gặp lại nhau.
 * Cờ đặt ra: mp_paper_loan (cho vay có giấy), mp_forgave_debt, mp_pressed_debt, mp_family_rule, mp_cosigned,
 * mp_lineage_house (nhà chung của dòng họ). Bộ đếm: mp_gave (số lần chi cho người).
 */
import type { Storylet, FactContext, Choice } from "../types.ts";
import { C, T, f, role, vary, money, flagAll } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const parentOf = (c: FactContext): string | undefined => role(c, "mother") ?? role(c, "father");

export const PACK_MONEY_PEOPLE: Storylet[] = [
  /* 1. Bạn cũ hỏi vay làm ăn */
  money("mp_friend_biz", [22, 60], 8, 0.7, (c) => !!role(c, "childhood_friend"), (c, N) => { const fr = role(c, "childhood_friend")!;
    const what = vary("mpfb", c.age, [
      vn(c) ? "mở một quán cơm văn phòng gần khu công nghiệp" : "mở một quán ăn trưa gần khu văn phòng",
      "mua lại một xưởng sửa xe đang ế",
      "nhập một lô hàng bán trên mạng trước mùa lễ",
    ]);
    return T("Bạn cũ hỏi vay làm ăn", `${N(fr)}, bạn chơi từ hồi nhỏ, gọi điện lúc mười giờ đêm. Cậu ấy muốn ${what} và còn thiếu một khoản bằng khoảng bốn tháng thu nhập của bạn. Cậu ấy hứa hai năm trả đủ.`, [
      C("Cho vay đủ, hẹn hai năm", { lend: { npc: fr, amount: 0.35, years: 2 }, memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.3, note: `khoản vay mở quán năm bạn ${c.age} tuổi` } }, "Giữ tình bạn, cược bốn tháng thu nhập"),
      C("Cho vay, viết giấy có người làm chứng", { lend: { npc: fr, amount: 0.35, years: 2 }, flags: ["mp_paper_loan"], trust: { npc: fr, delta: -0.05 }, memory: { npc: fr, tag: "WIN_WIN_DEAL", weight: 0.2, note: "giấy vay tiền có người làm chứng" } }, "Rõ ràng, bạn cũ hơi chạnh lòng", { tier: "awakened" }),
      C("Cho hẳn một khoản nhỏ, không đòi", { give: { npc: fr, amount: 0.05 }, trust: { npc: fr, delta: 0.05 }, counters: { mp_gave: 1 } }, "Mất ít, không lo bị quỵt, chưa đủ giúp"),
      C("Từ chối, nói thật là không có", { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.25, note: "cuộc gọi hỏi vay mở quán bị từ chối" } }, "Giữ tiền, tình bạn nguội đi")], 1, { npc: fr }); }),

  /* 2. Đám cưới anh chị em thiếu tiền */
  money("mp_sib_wedding", [18, 50], 10, 0.55, (c) => !!role(c, "sibling"), (c, N) => { const s = role(c, "sibling")!;
    return T(`Đám cưới của ${N(s)}`, `${N(s)} sắp cưới, nhà bên kia đã đặt ${vn(c) ? "bốn mươi mâm cỗ" : "tiệc cho một trăm khách"}. Còn thiếu một khoản cỡ hai tháng thu nhập của bạn, và ${N(s)} ngại không dám nói với bố mẹ.`, [
      C("Đỡ trọn khoản thiếu, coi như quà cưới", { give: { npc: s, amount: 0.15 }, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "khoản tiền đỡ đám cưới" }, counters: { mp_gave: 1 } }, "Mất hai tháng thu nhập, được một người nhớ ơn"),
      C("Cho vay, cưới xong trả dần", { lend: { npc: s, amount: 0.15, years: 2 }, trust: { npc: s, delta: 0.05 } }, "Có thể lấy lại, có thể thành chuyện nhà"),
      C("Mừng một phong bì như khách thường", { give: { npc: s, amount: 0.03 }, trust: { npc: s, delta: -0.05 } }, "Đúng lễ, không gánh thêm"),
      C("Khuyên làm đám nhỏ hơn, không góp thêm", { trust: { npc: s, delta: -0.1 }, happy: -1 }, "Giữ tiền, mất lòng ngày vui")], 0, { npc: s }); }),

  /* 3. Con nợ quá hạn */
  money("mp_debtor", [20, 85], 6, 0.85, (c) => c.debtors_overdue.length > 0, (c, N) => { const d = c.debtors_overdue[0]!;
    return T("Món nợ quá hạn", `Đã quá hẹn hơn một năm. ${N(d)} vẫn đăng ảnh đi ăn tiệm, nhưng hễ bạn nhắc đến tiền thì bảo "tháng sau". Bạn còn giữ tin nhắn hẹn trả ngày mùng năm.`, [
      C("Xóa nợ, coi như đã cho", { flags: ["mp_forgave_debt"], memory: { npc: d, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "món nợ được xóa không điều kiện" }, happy: 1 }, "Mất tiền, được một người mang ơn"),
      C("Đến tận nhà đòi, nói cho cả xóm biết", { flags: ["mp_pressed_debt"], memory: { npc: d, tag: "HUMILIATED_ME", weight: -0.35, note: "bị đòi nợ trước mặt hàng xóm" }, gamble: { p: 0.45, win: { money: 0.08, log: `${N(d)} gom được một phần trả bạn, rồi không bao giờ nhìn mặt bạn nữa.` }, lose: { rel: -2, log: `${N(d)} không có gì để trả. Người ta chỉ nhớ bạn làm ầm.` } } }, "Có thể lấy lại một ít, mất hẳn người"),
      C("Giữ chiếc xe của họ để trừ nợ", { money: 0.06, flags: ["mp_pressed_debt"], memory: { npc: d, tag: "TOOK_MY_LAND", weight: -0.3, note: "chiếc xe bị giữ lại để trừ nợ" } }, "Lấy lại được chút ít, thành kẻ thù"),
      C("Ngồi xuống, giãn hạn, trả theo tháng", { flags: ["mp_paper_loan"], trust: { npc: d, delta: 0.15 }, promise: { to: d, what: "giữ lịch trả nợ theo tháng", years: 2 }, bw: -2 }, "Chậm nhưng có đường về, cả hai giữ mặt", { tier: "sovereign" })], 0, { npc: d }); }),

  /* 4. Bố mẹ ốm nặng */
  money("mp_parent_sick", [22, 70], 6, 0.8, (c) => c.parent_sick && !!parentOf(c), (c, N) => { const p = parentOf(c)!; const sib = role(c, "sibling");
    const opts: Choice[] = [
      C("Lo hết, chữa ở chỗ tốt nhất", { support: { who: "parents", level: "hau" }, money: -0.3, trust: { npc: p, delta: 0.25 }, memory: { npc: p, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "đợt nằm viện được con lo trọn" } }, "Mất gần bốn tháng thu nhập, bố mẹ yên lòng"),
      C("Lo phần đủ, chữa theo bảo hiểm", { support: { who: "parents", level: "du" }, money: -0.1, trust: { npc: p, delta: 0.1 } }, "Vừa sức, có lúc phải chờ đợi"),
      C("Gửi một ít, bảo tự xoay", { support: { who: "parents", level: "it" }, trust: { npc: p, delta: -0.25 }, close_doors: ["family_table"] }, "Giữ tiền, mất chỗ ngồi trong mâm cơm nhà")];
    if (sib) opts.splice(2, 0, C(`Họp với ${N(sib)}, chia đều và ghi sổ chung`, { support: { who: "parents", level: "du" }, money: -0.08, flags: ["mp_family_rule"], trust: { npc: sib, delta: 0.1 } }, "Gánh nhẹ hơn, phải bàn bạc từng khoản", { tier: "sovereign" }));
    return T("Tờ giấy báo viện phí", `${N(p)} nằm viện tuần thứ hai. Bác sĩ nói cần một đợt điều trị dài, và tờ giấy báo viện phí đầu tiên đã bằng nửa tháng lương của bạn. ${N(p)} cứ dặn đừng tốn tiền.`, opts, 1, { npc: p }); }),

  /* 5. Tiền hằng tháng cho bố mẹ già */
  money("mp_parent_allowance", [28, 70], 10, 0.7, (c) => c.parent_old && c.parents_alive > 0 && !!parentOf(c), (c, N) => { const p = parentOf(c)!;
    const text = vary("mppa", c.age, [
      `${N(p)} đã thôi làm, sống bằng một khoản lương hưu ít ỏi. Bạn để ý tủ lạnh nhà ${N(p)} chỉ còn hai quả trứng và nửa mớ rau.`,
      `${N(p)} không bao giờ xin. Nhưng lần về thăm vừa rồi, bạn thấy ${N(p)} vá lại chiếc áo khoác đã mặc mười năm.`,
    ]);
    return T("Khoản tiền mỗi tháng", text, [
      C("Gửi đều mỗi tháng, đủ sống thoải mái", { support: { who: "parents", level: "hau" }, trust: { npc: p, delta: 0.2 }, memory: { npc: p, tag: "KEPT_PROMISE", weight: 0.2, note: "khoản tiền đều đặn mỗi tháng" } }, "Bớt tiết kiệm của mình, bố mẹ khỏi lo"),
      C("Gửi vừa đủ tiền chợ và thuốc", { support: { who: "parents", level: "du" }, trust: { npc: p, delta: 0.08 } }, "Cân bằng, không dư dả cho ai"),
      C("Chỉ biếu dịp lễ tết", { support: { who: "parents", level: "it" }, trust: { npc: p, delta: -0.1 } }, "Giữ tiền cho nhà mình, bố mẹ chật vật")], 1, { npc: p }); }),

  /* 6. Con muốn đi học xa */
  money("mp_child_study", [35, 65], 10, 0.6, (c) => c.kids_teen > 0 && !!role(c, "child"), (c, N) => { const k = role(c, "child")!;
    const opts: Choice[] = [
      C("Chu cấp đủ cho con đi học xa", { support: { who: "kids", level: "hau" }, trust: { npc: k, delta: 0.25 }, memory: { npc: k, tag: "HELPED_IN_CRISIS", weight: 0.25, note: "bốn năm học xa nhà được chu cấp" } }, "Gánh nặng bốn năm, con có cơ hội"),
      C("Vay ngân hàng cho con đi", { custom: "borrow:0.6", support: { who: "kids", level: "hau" }, trust: { npc: k, delta: 0.25 } }, "Con được đi, nhà gánh nợ nhiều năm"),
      C("Cho đi nếu con tự làm thêm một nửa", { support: { who: "kids", level: "du" }, promise: { to: k, what: "gửi đều nửa tiền học cho con", years: 4 }, trust: { npc: k, delta: 0.1 } }, "Nhẹ gánh, con vừa học vừa làm, dễ đuối", { tier: "awakened" }),
      C("Bảo con học trường gần nhà", { support: { who: "kids", level: "it" }, trust: { npc: k, delta: -0.2 } }, "Giữ tiền, con mang theo nỗi tiếc")];
    if (c.owns.has("land") || c.owns.has("vehicle")) { const kind = c.owns.has("land") ? "land" : "vehicle";
      opts[1] = C(`Bán ${c.asset_names[kind] ?? (kind === "land" ? "mảnh đất" : "chiếc xe")} lấy tiền học`, { sell: { kind }, support: { who: "kids", level: "hau" }, trust: { npc: k, delta: 0.25 } }, "Mất một món của cải, con không mang nợ"); }
    return T(`${N(k)} đỗ trường ở xa`, `${N(k)} đỗ vào một trường đại học ở thành phố lớn, cách nhà một ngày đường. Học phí, tiền trọ và ăn uống mỗi năm ngốn gần một phần ba thu nhập nhà mình. Tờ giấy báo nhập học dán trên tủ lạnh.`, opts, 2, { npc: k }); }),

  /* 7. Bạn đời lén cho nhà mình vay */
  money("mp_spouse_family", [24, 70], 10, 0.5, (c) => c.married && !!role(c, "spouse"), (c, N) => { const sp = role(c, "spouse")!;
    return T("Khoản tiền rút lặng lẽ", `Kiểm lại sổ tiết kiệm, bạn thấy thiếu một khoản cỡ hai tháng thu nhập. Hỏi ra, ${N(sp)} đã lén đưa cho em ruột mình vay để trả nợ, không nói với bạn câu nào.`, [
      C("Làm to chuyện, đòi lấy lại ngay", { trust: { npc: sp, delta: -0.25 }, memory: { npc: sp, tag: "HUMILIATED_ME", weight: -0.2, note: "trận cãi về khoản tiền đưa cho em" }, gamble: { p: 0.5, win: { money: 0.1, log: "Em của bạn đời gom tiền trả lại sau ba tháng, không nói một lời." }, lose: { rel: -2, log: "Tiền không về, chỉ còn khoảng lạnh giữa hai nhà." } } }, "Có thể lấy lại tiền, sứt mẻ hai nhà"),
      C("Nhắm mắt cho qua", { trust: { npc: sp, delta: 0.05 }, happy: -3 }, "Êm nhà, mất tiền và một chút tin"),
      C("Đặt luật chung: khoản lớn phải bàn trước", { flags: ["mp_family_rule"], trust: { npc: sp, delta: 0.1 }, promise: { to: sp, what: "bàn nhau trước mọi khoản chi lớn", years: 3 }, bw: -2 }, "Cuộc nói chuyện khó, sau đó rõ ràng hơn", { tier: "sovereign" })], 2, { npc: sp }); }),

  /* 8. Góp tiền đám hàng xóm */
  money("mp_neighbor_funeral", [20, 85], 8, 0.65, (c) => !!role(c, "neighbor"), (c, N) => { const nb = role(c, "neighbor")!;
    const text = vary("mpnf", c.age, [
      vn(c) ? `Nhà ${N(nb)} có tang. Tổ dân phố đi từng nhà, cầm cuốn sổ ghi tên ai góp bao nhiêu, đã có hai mươi hộ ký.` : `Nhà ${N(nb)} có tang. Hàng xóm chuyền nhau một tờ danh sách góp tiền lo hậu sự, đã có hai mươi hộ ký tên.`,
      `Cơn bão làm sập mái bếp nhà ${N(nb)}. Mấy nhà trong khu rủ nhau góp tiền mua tôn, mỗi nhà một ít.`,
    ]);
    return T("Cuốn sổ góp tiền", text, [
      C("Góp một khoản tử tế, sang phụ một buổi", { give: { npc: nb, amount: 0.04 }, rel: 2, memory: { npc: nb, tag: "STOOD_UP_FOR_ME", weight: 0.2, note: "buổi sang phụ lúc nhà có chuyện" }, counters: { mp_gave: 1 } }, "Tốn tiền và một ngày, có hàng xóm thật"),
      C("Góp bằng mức mọi người", { give: { npc: nb, amount: 0.015 }, trust: { npc: nb, delta: 0.03 } }, "Đúng lệ, không hơn"),
      C("Không góp", { trust: { npc: nb, delta: -0.1 }, rel: -1 }, "Giữ tiền, tên bạn trống trong sổ")], 1, { npc: nb }); }),

  /* 9. Đứng tên bảo lãnh */
  money("mp_cosign", [22, 65], 12, 0.45, (c) => !!(role(c, "partner") ?? role(c, "childhood_friend")), (c, N) => { const fr = (role(c, "partner") ?? role(c, "childhood_friend"))!; const cr = role(c, "creditor");
    return T("Chữ ký bảo lãnh", `${N(fr)} vay ${cr ? `chỗ ${N(cr)}` : "ngân hàng"} để mở rộng làm ăn, nhưng bên cho vay đòi một người đứng tên bảo lãnh. Tờ giấy chỉ cần một chữ ký của bạn. Nếu ${N(fr)} không trả, khoản nợ cỡ một năm thu nhập sẽ thành của bạn.`, [
      C("Ký", { flags: ["mp_cosigned"], trust: { npc: fr, delta: 0.15 }, gamble: { p: 0.6, win: { memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "chữ ký bảo lãnh khoản vay đầu tiên" }, log: `${N(fr)} trả đủ đúng hạn và mang đến một giỏ quà.` }, lose: { money: -0.6, memory: { npc: fr, tag: "CHEATED_ME", weight: -0.4, note: "khoản nợ bảo lãnh rơi lên đầu" }, log: `Làm ăn đổ. Bên cho vay gọi cho bạn, không gọi cho ${N(fr)}.` } } }, "Giữ bạn, có thể gánh nợ một năm"),
      C("Chỉ bảo lãnh một phần, có tài sản đối ứng", { flags: ["mp_cosigned", "mp_paper_loan"], trust: { npc: fr, delta: 0.05 }, gamble: { p: 0.65, win: { log: "Khoản vay trót lọt. Phần bạn đứng tên được xóa khỏi sổ." }, lose: { money: -0.2, log: "Làm ăn đổ, nhưng phần bạn gánh có giới hạn." } } }, "Rủi ro có trần, bạn thấy bị dè chừng", { tier: "awakened" }),
      C("Không ký", { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.2, note: "chữ ký bảo lãnh không chịu ký" } }, "An toàn, bạn phải đi tìm người khác")], 2, { npc: fr }); }),

  /* 10. Người thầy gặp nạn */
  money("mp_mentor", [25, 75], 10, 0.45, (c) => !!role(c, "mentor"), (c, N) => { const m = role(c, "mentor")!;
    return T("Người thầy cũ gặp nạn", `${N(m)}, người dạy bạn những điều đầu tiên trong nghề, vừa mất việc ở tuổi gần sáu mươi, lại đang nợ tiền thuê nhà ba tháng. Ông ấy gọi hỏi thăm bạn, ngập ngừng mãi mới nói ra.`, [
      C("Trả hộ tiền nhà, không nhắc lại", { give: { npc: m, amount: 0.08 }, memory: { npc: m, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "ba tháng tiền nhà được trả hộ" }, counters: { mp_gave: 1 } }, "Mất một tháng thu nhập, trả được ân"),
      C("Cho vay, hẹn khi có việc thì trả", { lend: { npc: m, amount: 0.08, years: 2 }, trust: { npc: m, delta: 0.1 } }, "Giúp được, nhưng thầy mang nặng khoản nợ"),
      C("Giới thiệu thầy vài lớp dạy thêm", { trust: { npc: m, delta: 0.15 }, bw: -2, rel: 1 }, "Không tốn tiền, tốn công, thầy giữ được mặt", { tier: "awakened" }),
      C("Hỏi thăm, không nhắc chuyện tiền", { memory: { npc: m, tag: "REFUSED_HELP", weight: -0.15, note: "cuộc gọi ngập ngừng không ai nghe ra" } }, "Giữ tiền, thầy hiểu ý")], 0, { npc: m }); }),

  /* 11. Con lớn cứ xin tiền */
  money("mp_adult_child", [45, 85], 8, 0.55, (c) => c.kids_alive > 0 && !!role(c, "child"), (c, N) => { const k = role(c, "child")!;
    const text = vary("mpac", c.age, [
      `${N(k)} đã ngoài hai mươi lăm, đổi việc lần thứ tư trong hai năm. Tháng này lại nhắn xin tiền, lần này để trả thẻ tín dụng.`,
      `${N(k)} đã có việc, nhưng cuối tháng nào cũng nhắn "mẹ ơi, bố ơi, cho con ứng một ít". Bạn đếm được mười một tin nhắn như thế trong năm.`,
    ]);
    return T("Tin nhắn cuối tháng", text, [
      C("Chuyển tiền, con mình mà", { give: { npc: k, amount: 0.06 }, support: { who: "kids", level: "hau" }, trust: { npc: k, delta: 0.1 } }, "Con dễ thở, thói quen ở lại"),
      C("Cho vay, ghi sổ, con tự trả", { lend: { npc: k, amount: 0.06, years: 1 }, support: { who: "kids", level: "du" }, flags: ["mp_paper_loan"] }, "Con học cách giữ lời, có thể giận", { tier: "awakened" }),
      C("Ngồi cùng con lập ngân sách, không chuyển", { support: { who: "kids", level: "it" }, promise: { to: k, what: "mỗi tháng ngồi xem lại chi tiêu cùng con", years: 1 }, bw: -2 }, "Tốn thời gian, con có thể tự đứng"),
      C("Từ chối thẳng", { support: { who: "kids", level: "it" }, trust: { npc: k, delta: -0.2 } }, "Giữ tiền, con thấy bị bỏ mặc")], 2, { npc: k }); }),

  /* 12. Đối thủ sa cơ */
  money("mp_rival_ruined", [25, 80], 12, 0.4, (c) => !!role(c, "rival"), (c, N) => { const r = role(c, "rival")!;
    return T("Đối thủ sa cơ", `${N(r)}, người từng giành mất của bạn một cơ hội lớn và kể khắp nơi, giờ phá sản. Ngồi trước mặt bạn trong quán nước, ${N(r)} xin vay một khoản để giữ lại cái cửa hàng cuối cùng.`, [
      C("Cho vay, không nhắc chuyện cũ", { lend: { npc: r, amount: 0.25, years: 3 }, memory: { npc: r, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "khoản vay lúc phá sản từ người mình từng chơi xấu" } }, "Có thể mất tiền, có thể đổi kẻ thù thành bạn"),
      C("Góp vốn vào cửa hàng, cùng làm chủ", { buy: { kind: "stake", name: `phần vốn trong cửa hàng của ${N(r)}`, price: 0.3, with_npc: r }, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "góp vốn giữ lại cửa hàng" } }, "Thành người cùng thuyền, lời lỗ chia đôi", { tier: "sovereign" }),
      C("Từ chối, nhắc lại chuyện cũ", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "lần xin vay bị nhắc lại chuyện cũ" }, happy: 2 }, "Hả giận một lúc, mối thù dài thêm"),
      C("Lịch sự từ chối", { trust: { npc: r, delta: -0.05 } }, "Không mất gì, không được gì")], 3, { npc: r }); }),

  /* 13. Gửi tiền về nhà từ nước ngoài */
  money("mp_remit", [20, 70], 8, 0.75, (c) => c.migrated && !!(parentOf(c) ?? role(c, "sibling")), (c, N) => { const home = (parentOf(c) ?? role(c, "sibling"))!; const sib = role(c, "sibling");
    const opts: Choice[] = [
      C("Gửi một nửa lương về nhà", { give: { npc: home, amount: 0.3 }, ...(parentOf(c) ? { support: { who: "parents" as const, level: "hau" as const } } : {}), trust: { npc: home, delta: 0.2 }, counters: { mp_gave: 1 }, happy: -2 }, "Ở nhà đổi đời, bạn sống chật chội nơi xứ người"),
      C("Gửi khoản cố định nhỏ, giữ phần còn lại", { give: { npc: home, amount: 0.08 }, ...(parentOf(c) ? { support: { who: "parents" as const, level: "du" as const } } : {}), trust: { npc: home, delta: 0.05 } }, "Cân bằng, ở nhà có người trách ít"),
      C("Chưa gửi, tích vốn cho mình trước", { trust: { npc: home, delta: -0.2 }, memory: { npc: home, tag: "REFUSED_HELP", weight: -0.15, note: "những tháng không có tiền gửi về" } }, "Có vốn nhanh, ở nhà nghĩ bạn đã quên")];
    if (sib && sib !== home) opts.splice(2, 0, C(`Gửi qua ${N(sib)}, dặn để dành xây nhà`, { lend: { npc: sib, amount: 0.2, years: 3 }, flags: ["mp_paper_loan"], trust: { npc: sib, delta: 0.05 } }, "Tiền có mục đích, phải tin người giữ hộ", { tier: "awakened" }));
    return T("Tiền gửi về nhà", `Nơi bạn đang sống, một tháng lương bằng nửa năm lương ở quê. ${N(home)} gọi video, phía sau là bức tường nứt và cái mái dột chưa sửa. Không ai hỏi xin, nhưng ai cũng biết.`, opts, 1, { npc: home }); }),

  /* 14. Chia thừa kế giữa anh chị em */
  money("mp_inherit", [25, 85], 99, 0.6, (c) => f(c, "parent_died") && c.parents_alive === 0 && !!role(c, "sibling") && !f(c, "inherited_home"), (c, N) => flagAll((() => { const s = role(c, "sibling")!;
    return T("Chia phần của bố mẹ", `Sau đám, mấy anh chị em ngồi quanh ${vn(c) ? "chiếc tủ thờ" : "chiếc bàn ăn cũ"}. Bố mẹ để lại căn nhà và một ít tiền tiết kiệm, không có giấy tờ chia. ${N(s)} là người chăm bố mẹ những năm cuối, và đã ở luôn trong nhà.`, [
      C("Chia đều, bán nhà lấy tiền", { money: 0.4, trust: { npc: s, delta: -0.2 }, memory: { npc: s, tag: "TOOK_MY_LAND", weight: -0.25, note: "căn nhà bố mẹ bị bán để chia" } }, "Có tiền, người chăm bố mẹ mất chỗ ở"),
      C(`Nhường phần mình cho ${N(s)}`, { trust: { npc: s, delta: 0.3 }, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "phần thừa kế được nhường lại" }, close_doors: ["inheritance"] }, "Mất phần của mình, giữ được anh chị em"),
      C("Giữ nhà làm nhà chung, ai cũng có quyền về", { flags: ["mp_lineage_house"], trust: { npc: s, delta: 0.15 }, promise: { to: s, what: "góp tiền sửa nhà chung mỗi năm", years: 5 } }, "Không ai lấy tiền, giữ được chỗ để về", { tier: "sovereign" }),
      C("Đòi phần lớn hơn vì đã gửi tiền nhiều nhất", { money: 0.6, memory: { npc: s, tag: "BETRAYED_PARTNERSHIP", weight: -0.45, note: "trận chia thừa kế sau đám tang" }, close_doors: ["family_table"] }, "Nhiều tiền nhất, mất mâm cơm nhà")], 2, { npc: s }); })(), "inherited_home")),
];
