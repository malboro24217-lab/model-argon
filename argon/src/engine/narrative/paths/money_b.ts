/**
 * Gói KINH DOANH & LÀM GIÀU (B): nhà đầu tư · chủ xưởng · người bán hàng online · nhân viên ngân hàng.
 * Mỗi con đường 19 thẻ: 1 năng khiếu · 2 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Bộ đếm riêng để các nhịp sau đọc lại và rẽ cao trào: ivt_risk / ivt_trust · fac_morale · ecm_rep · bnk_clean / bnk_kpi.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const IV = "investor";
const FO = "factory_owner";
const EC = "ecommerce";
const BK = "banker";
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;
const vn = (c: FactContext): boolean => c.country === "VN";
const adult = (c: FactContext): boolean => c.age >= 18;

export const PACK_MONEY_B: Storylet[] = [
  /* ================= NHÀ ĐẦU TƯ (ivt_) ================= */

  /* ---------- năng khiếu ---------- */
  talent(IV, "ivt_t_cards", [9, 15], () => true, () => T("Cơn sốt thẻ hình", "Năm lớp năm, cả trường phát cuồng vì một loại thẻ hình. Bạn mua hai mươi thẻ khi chưa ai để ý, bán dần lúc cơn sốt lên cao, rồi dừng hẳn một tuần trước khi giá rơi. Trong cặp bạn có cuốn sổ ghi giá từng ngày.", [
    C("Xin giữ tiền tiêu vặt, tự ghi sổ lãi lỗ", { flags: [talentFlag(IV)], counters: { talents_seen: 1 }, money: 0.01, know: 3, rel: -2 }, "Học sớm cách nhìn tiền, bạn bè thấy bạn tính toán"),
    C("Lấy tiền lãi mua kem cho cả nhóm", { counters: { talents_seen: 1 }, rel: 4, happy: 2 }, "Được bạn bè quý, cuốn sổ bị bỏ quên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(IV, "ivt_d_savings", [24, 50], (c) => c.has_job, (c) => T("Khoản tiền nằm yên", `Sau mấy năm dành dụm, tài khoản của bạn có một khoản gần bằng một năm lương. Lãi gửi ngân hàng không đuổi kịp giá cả${c.econ_phase === "boom" ? ", trong khi ai quanh bạn cũng khoe lãi từ thị trường" : ""}. Một đồng nghiệp vừa nghỉ việc để sống bằng đầu tư, tối nào cũng gửi ảnh chụp tài khoản.`, [
    C("Nghỉ việc, học bài bản rồi đầu tư toàn thời gian", { ...become(IV), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02 }, "Tự do giờ giấc, mất lương cố định"),
    C("Đầu tư một nửa, vẫn giữ việc", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(IV), log: "Hai năm liền tài khoản tăng đều. Bạn nộp đơn nghỉ việc." }, lose: { money: -0.15, happy: -3, log: "Bạn mua đúng đỉnh. Nửa số tiền ấy chỉ còn lại một phần ba." } } }, "Thử nước trước, có thể mất một phần"),
    C("Gửi tiết kiệm, ngủ ngon", { counters: { doors_seen: 1, save: 1 }, happy: 1 }, "An toàn, tiền mòn dần theo giá cả")], 2)),
  door(IV, "ivt_d_club", [28, 60], (c) => c.know >= 40 || c.has_degree, () => T("Câu lạc bộ sáng thứ bảy", "Mười hai người hay uống trà với bạn mỗi sáng thứ bảy góp được một khoản chung, nhưng không ai đọc nổi một bản báo cáo tài chính. Họ muốn bạn cầm tiền và quyết thay cả nhóm, đổi lại hai phần mười tiền lãi.", [
    C("Nhận quản lý quỹ chung", { ...become(IV), flags: ["ivt_fund"], counters: { doors_seen: 1 }, bw: -3 }, "Có vốn lớn để làm, gánh tiền của người khác"),
    C("Nhận, nhưng viết điều lệ và công khai sổ trước", { ...become(IV), flags: ["ivt_fund", "ivt_open_books"], counters: { doors_seen: 1, ivt_trust: 1 }, bw: -6, agency: 0.02 }, "Chậm và phiền hơn, ai cũng thấy sổ", { tier: "sovereign" }),
    C("Chỉ góp ý, không cầm tiền của ai", { counters: { doors_seen: 1 }, know: 2, rel: 1 }, "Giữ được bạn, bỏ lỡ một cơ hội")], 2)),

  /* ---------- mạch truyện ---------- */
  beat(IV, 1, 1, (c) => T("Lệnh mua đầu tiên", `${f(c, "ivt_fund") ? "Lần này là tiền của mười hai người, không phải của riêng bạn. " : ""}Màn hình có sáu cửa sổ và một cốc cà phê đã nguội. Một bên là công ty làm ống nước nhàm chán mà bạn đã đọc kỹ báo cáo ba năm. Bên kia là nhóm chat hai nghìn người đang hô một mã "tuần sau lên gấp đôi".`, [
    C("Mua công ty nhàm chán, ôm dài", { counters: step(c, IV), flags: ["ivt_value"], know: 3, happy: -1 }, "Chậm, khó khoe, ít mất ngủ"),
    C("Theo nhóm chat, lướt nhanh", { counters: step(c, IV, { ivt_risk: 1 }), flags: ["ivt_trader"], gamble: { p: 0.45, win: { money: 0.15, happy: 4, log: "Bạn chốt lời sau chín ngày. Nhóm chat gọi bạn là cao thủ." }, lose: { money: -0.15, happy: -4, log: "Mã ấy rơi một nửa trong một tuần. Nhóm chat lặng lẽ giải tán." } } }, "Nhanh giàu hoặc nhanh mất"),
    C("Chưa mua gì, ghi chép giả lập ba tháng", { counters: step(c, IV), flags: ["ivt_paper"], know: 5, bw: -2 }, "Không lãi không lỗ, mất ba tháng")], 0), adult),
  beat(IV, 2, 3, (c) => {
    const won = f(c, "ivt_value") ? "Công ty ống nước của bạn đã lên gấp ba." : f(c, "ivt_trader") ? "Bạn đã thắng bảy lệnh liền." : "Tài khoản của bạn tăng đều, không có gì để khoe.";
    return T("Lời mời vay gấp đôi vốn", `${won} Công ty chứng khoán gửi lời mời: bạn được vay thêm gấp đôi số vốn đang có, lãi tính theo ngày.${c.econ_phase === "boom" ? " Ai quanh bạn cũng đang vay." : ""}`, [
      C("Vay thêm gấp đôi vốn", { counters: step(c, IV, { ivt_risk: 2 }), flags: ["ivt_leverage"], custom: "borrow:0.8", income_mult: 1.4 }, "Lãi nhân đôi, lỗ cũng nhân đôi"),
      C("Không vay, rút một phần lãi về", { counters: step(c, IV), flags: ["ivt_cautious"], money: 0.3, happy: -2 }, "Ngủ yên, nhìn người khác giàu nhanh hơn"),
      C("Tự đặt luật: không vay, cắt lỗ, công khai sổ", { counters: step(c, IV, { ivt_trust: 2 }), flags: ["ivt_rules"], income_mult: 1.15, bw: -4, agency: 0.02 }, "Tăng chậm, có người tin mà gửi tiền", { tier: "sovereign" })], 1);
  }, adult),
  beat(IV, 3, 4, (c) => {
    const lev = f(c, "ivt_leverage"), fund = f(c, "ivt_fund");
    const text = lev ? "Thị trường mất bốn phần mười trong ba tuần. Sáu giờ sáng, công ty chứng khoán gọi: nộp thêm tiền trước trưa, nếu không họ sẽ tự bán hết tài khoản của bạn."
      : fund ? `Thị trường mất bốn phần mười trong ba tuần. Mười hai người góp vốn nhắn tin trong cùng một buổi sáng, ai cũng muốn rút.${f(c, "ivt_open_books") ? " Họ đều đọc sổ, nên biết chính xác mình đang lỗ bao nhiêu." : ""}`
      : "Thị trường mất bốn phần mười trong ba tuần. Danh mục bạn chọn kỹ cũng rơi như mọi thứ khác. Báo chí bắt đầu dùng chữ khủng hoảng.";
    const choices = [
      C("Bán hết, cắt lỗ, giữ phần còn lại", { counters: step(c, IV), flags: ["ivt_cut"], money: lev ? -0.6 : -0.3, income_mult: 0.8, happy: -4 }, "Mất thật, nhưng còn đứng được"),
      C("Vay thêm để giữ, chờ thị trường hồi", { counters: step(c, IV, { ivt_risk: 2 }), custom: "borrow:1", gamble: { p: lev ? 0.35 : 0.5, win: { money: 1.2, income_mult: 1.3, flags: ["ivt_held"], log: "Mười tám tháng sau thị trường hồi. Bạn là người duy nhất trong nhóm không bán." }, lose: { money: -1, health: -6, flags: ["ivt_ruined"], log: "Thị trường không hồi kịp. Ngân hàng siết căn nhà bạn đem thế chấp." } } }, "Hoặc đổi đời, hoặc mất nhà"),
    ];
    if (fund) {
      choices.push(C("Gặp từng người góp vốn, nói thật con số", { counters: step(c, IV, { ivt_trust: 2 }), money: -0.2, rel: 4, bw: -5 }, "Mất tiền phí, giữ được lòng tin", { tier: "awakened" }));
      choices.push(C("Báo lãi khống để giữ chân người góp", { counters: step(c, IV), flags: ["ivt_cooked"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [2, 8], note: "báo lãi khống cho quỹ chung của mười hai người bạn" } }, "Yên được một năm, ôm một quả bom hẹn giờ"));
    } else {
      choices.push(C("Rời thị trường, đi làm công ăn lương", { counters: step(c, IV), ...leave(IV), happy: 3, health: 3 }, "Hết thấp thỏm, hết luôn giấc mơ tự do"));
    }
    return T("Ba tuần rơi tự do", text, choices, 0);
  }, adult),
  beat(IV, 4, 5, (c) => {
    if (f(c, "ivt_ruined")) return T("Căn hộ thuê tầng năm", "Bạn sống trong căn hộ thuê, mỗi tháng trả nợ một phần. Một người quen cũ mời bạn về làm phân tích cho một quỹ lớn: lương đều, nhưng không được tự quyết lệnh nào. Trong ngăn kéo vẫn còn cuốn sổ ghi mọi lần thua.", [
      C("Nhận việc, trả nợ trước đã", { counters: step(c, IV), custom: "repay:0.4", income_mult: 1.3, happy: -2 }, "Đều đặn, làm theo lệnh người khác"),
      C("Viết sổ thua lỗ thành sách, kể thật hết", { counters: step(c, IV, { ivt_trust: 2 }), flags: ["ivt_wrote_losses"], gamble: { p: 0.4, win: { money: 0.4, rel: 4, log: "Cuốn sách được người mới vào nghề chuyền tay nhau." }, lose: { happy: -3, log: "Sách bán được vài trăm bản. Vài người viết thư cảm ơn bạn." } } }, "Biến cái sai thành thứ có ích, có thể chẳng ai đọc", { tier: "sovereign" }),
      C("Rời hẳn thị trường", { counters: step(c, IV), ...leave(IV), happy: 2 }, "Khép một chương, khép cả một giấc mơ")], 0);
    if (f(c, "ivt_cooked")) return T("Người góp vốn đòi rút hết", "Một người trong câu lạc bộ cần tiền chữa bệnh cho vợ, đòi rút toàn bộ phần của mình theo con số bạn báo. Con số ấy chưa từng có thật. Những người còn lại bắt đầu hỏi nhau.", [
      C("Thú nhận, bán tài sản riêng bù đủ cho mọi người", { counters: step(c, IV, { ivt_trust: 1 }), flags: ["ivt_confessed"], custom: "apologize", money: -1.2 }, "Mất gần hết, giữ được tên"),
      C("Vay chỗ khác trả người này, giấu tiếp", { counters: step(c, IV), flags: ["ivt_rollover"], custom: "borrow:0.8", gamble: { p: 0.4, win: { log: "Không ai hỏi thêm. Năm sau con số cần lấp lớn hơn." }, lose: { money: -0.8, close_doors: ["partner_circle"], log: "Hai người góp vốn báo công an. Bạn mất cả quỹ lẫn bạn bè." } } }, "Lấp được lỗ này, đào thêm lỗ khác"),
      C("Giải tán quỹ, chia phần còn lại theo sổ thật", { counters: step(c, IV), ...leave(IV), money: -0.4, close_doors: ["partner_circle"] }, "Kết thúc gọn, mất vòng bạn bè")], 0);
    const trusted = cnt(c, "ivt_trust") >= 3;
    return T("Người ta gọi bạn là thầy", `Mười năm, danh mục của bạn tăng gấp nhiều lần${f(c, "ivt_held") ? ", phần lớn nhờ những tháng bạn không bán khi ai cũng bán" : ""}. ${trusted ? "Những người từng góp vốn muốn bạn lập một quỹ chính thức, có giấy phép." : "Một quỹ lớn mời bạn về quản lý tiền của họ."} Cùng tuần, chủ một xưởng cơ khí lâu đời đang lụn bại hỏi bạn có muốn mua lại và tự vào điều hành.`, [
      C(trusted ? "Lập quỹ chính thức cho người góp vốn" : "Về quản lý tiền cho quỹ lớn", { counters: step(c, IV), flags: ["ivt_pro_fund"], income_mult: 1.5, bw: -6 }, "Tiền và tên tuổi, gánh thêm tiền của người khác"),
      C("Mua lại xưởng, tự xắn tay điều hành", { counters: step(c, IV), ...leave(IV), custom: `become:${FO}`, flags: ["ivt_bought_factory"], money: -1 }, "Rời màn hình, gánh cả trăm con người", { tier: "awakened" }),
      C("Dừng lại ở mức đủ, sống chậm", { counters: step(c, IV), income_mult: 0.8, happy: 6, health: 3 }, "Bỏ lỡ đỉnh, có lại thời gian")], 0);
  }, adult),
  beat(IV, 5, 6, (c) => {
    const lost = f(c, "ivt_ruined") || f(c, "ivt_confessed");
    const big = f(c, "ivt_pro_fund") || f(c, "ivt_held");
    return T("Cuốn sổ cuối cùng", `${lost ? "Bạn không giàu như từng mơ, nhưng còn giữ cuốn sổ ghi mọi lần thua." : big ? "Tài sản của bạn giờ đủ cho cả con lẫn cháu." : "Tài sản của bạn không nhiều như những người trên báo, nhưng đủ để không phải lo."} Một sinh viên viết thư hỏi bạn đúng câu bạn từng tự hỏi năm hai mươi tuổi: làm sao biết khi nào là đủ.`, [
      C("Lập quỹ học bổng bằng một phần tài sản", { counters: step(c, IV), flags: ["ivt_scholarship"], money: lost ? -0.3 : -1, rel: 5, happy: 4 }, "Tiền đi ra, tên ở lại"),
      C("Viết thư trả lời thật dài, kể cả những lần sai", { counters: step(c, IV, { ivt_trust: 1 }), flags: ["ivt_mentor"], know: 3, happy: 3 }, "Không tốn tiền, tốn cả một mùa đông", { tier: "awakened" }),
      C("Giữ nguyên, để lại hết cho con cháu", { counters: step(c, IV), flags: ["ivt_heirs"], happy: 1 }, "Con cháu đủ đầy, chưa chắc biết giữ")], 1);
  }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(IV, "ivt_tip", [24, 70], 10, (c, N) => {
    const fr = role(c, "childhood_friend");
    return T("Tin trước giờ công bố", `${fr ? N(fr) : "Một người quen"} đang làm ở một công ty niêm yết kể nhỏ với bạn trong bữa nhậu: tuần sau công ty sẽ công bố được mua lại, giá cao hơn hiện tại một nửa. Không ai khác ở bàn nghe thấy.`, [
      C("Mua trước khi tin ra", { gamble: { p: 0.55, win: { money: 0.4, flags: ["ivt_insider"], log: "Tin ra đúng như lời. Năm ấy không ai hỏi gì." }, lose: { money: -0.4, flags: ["ivt_banned"], close_doors: ["clean_record"], log: "Cơ quan quản lý mở hồ sơ giao dịch bất thường. Bạn bị phạt và cấm giao dịch hai năm." } } }, "Lãi gần như chắc, có thể thành hồ sơ"),
      C("Cảm ơn, đổi chủ đề", { counters: { honest: 1 } }, "Bỏ tiền trên bàn, ngủ yên"),
      ...(fr ? [C("Khuyên bạn ấy đừng kể với ai nữa", { trust: { npc: fr, delta: 0.15 }, counters: { honest: 1, ivt_trust: 1 } }, "Có thể mất lòng, có thể cứu bạn ấy", { tier: "awakened" })] : [])], 1, fr ? { npc: fr } : {});
  }),
  daily(IV, "ivt_ponzi", [24, 75], 10, (c, N) => {
    const nb = role(c, "neighbor");
    const who = nb ? N(nb) : "Người hàng xóm";
    return T("Lãi bốn phần trăm mỗi tháng", `${who} khoe một nơi trả lãi bốn phần trăm mỗi tháng, đều như đồng hồ, và rủ bạn vào. ${who} đã đưa cả tiền bán đất vào đó. Bạn làm phép tính trên mép tờ báo: không việc làm ăn thật nào trả nổi mức ấy lâu dài.`, [
      C("Vào một ít, rút trước khi sụp", { gamble: { p: 0.45, win: { money: 0.15, flags: ["ivt_ponzi_out"], log: "Bạn rút kịp sau năm tháng. Ba tháng sau nơi ấy đóng cửa." }, lose: { money: -0.3, log: "Bạn chưa kịp rút thì nơi ấy đã khóa cửa, người đứng đầu biến mất." } } }, "Ăn theo cơn sốt, có thể kẹt lại"),
      nb
        ? C("Ngồi tính lại cho hàng xóm, khuyên rút sớm", { gamble: { p: 0.5, win: { trust: { npc: nb, delta: 0.3 }, memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "khuyên rút tiền khỏi chỗ lãi cao trước khi sập" }, log: `${N(nb)} rút được một nửa trước khi nơi ấy sập.` }, lose: { trust: { npc: nb, delta: -0.2 }, log: `${N(nb)} giận, bảo bạn ghen ăn tức ở.` } } }, "Có thể cứu người, có thể mất lòng", { tier: "awakened" })
        : C("Viết bài giải thích phép tính, đăng lên mạng", { gamble: { p: 0.5, win: { rel: 3, counters: { ivt_trust: 1 }, log: "Bài viết được chia sẻ, vài người rút kịp." }, lose: { bw: -4, flags: ["ivt_threatened"], log: "Bạn nhận tin nhắn đe dọa từ những tài khoản lạ." } } }, "Có thể cứu người, có thể rước họa", { tier: "awakened" }),
      C("Lặng lẽ đứng ngoài", { bw: 1 }, "Giữ tiền, giữ luôn im lặng")], 2, nb ? { npc: nb } : {});
  }),
  daily(IV, "ivt_founder", [28, 70], 8, (c) => T("Người sáng lập hai mươi bốn tuổi", vary("ivtf", c.age, ["Một cô gái hai mươi bốn tuổi trình bày ứng dụng giúp nông dân bán thẳng cho các bếp ăn tập thể. Cô cần một khoản bằng nửa năm thu nhập của bạn, và chưa có doanh thu.", "Hai kỹ sư trẻ làm máy lọc nước giá rẻ trong một nhà để xe. Họ cần tiền làm lô một trăm chiếc đầu tiên, và chưa biết sẽ bán cho ai."]), [
    C("Rót vốn, đòi một nửa công ty", { money: -0.5, flags: ["ivt_hard_terms"], gamble: { p: 0.25, win: { money: 1.5, log: "Công ty sống sót và lớn lên. Phần một nửa của bạn đáng giá gấp ba." }, lose: { happy: -3, log: "Họ bỏ cuộc sau một năm, nói rằng làm cho bạn chứ không phải cho mình." } } }, "Phần to, người làm mất động lực"),
    C("Rót vốn, lấy phần nhỏ, điều khoản công bằng", { money: -0.5, gamble: { p: 0.3, win: { money: 1, counters: { ivt_trust: 1 }, log: "Năm năm sau họ gọi vốn vòng lớn và nhắc tên bạn trong bài phát biểu." }, lose: { happy: -2, log: "Công ty đóng cửa. Họ gửi bạn một bức thư cảm ơn viết tay." } } }, "Ít phần, nhiều thiện chí, vẫn có thể mất", { tier: "awakened" }),
    C("Từ chối, khuyên họ tìm khách hàng trước", { know: 1, counters: { ivt_risk: -1 } }, "Không mất gì, không được gì")], 2)),
  daily(IV, "ivt_fat", [24, 75], 10, () => T("Thừa một chữ số không", "Mười phút trước giờ đóng cửa, bạn gõ vội một lệnh mua và thừa một chữ số không. Lệnh khớp ngay. Bạn đang giữ gấp mười lần số cổ phiếu định mua, phần lớn bằng tiền vay tự động của công ty chứng khoán.", [
    C("Bán ngay sáng mai, chịu phần chênh lệch", { money: -0.08, flags: ["ivt_fat_finger"], counters: { ivt_risk: -1 } }, "Mất một khoản nhỏ, hết một đêm mất ngủ"),
    C("Giữ nguyên, coi như số phận chọn hộ", { counters: { ivt_risk: 2 }, gamble: { p: 0.4, win: { money: 0.5, log: "Hai tuần sau công ty ấy công bố tin tốt. Lỗi gõ phím thành lệnh hay nhất năm." }, lose: { money: -0.5, log: "Giá đi ngang rồi rơi. Bạn trả lãi vay cho một lệnh mình chưa từng muốn." } } }, "Có thể thành may mắn, có thể thành món nợ")], 0)),
  daily(IV, "ivt_screen", [24, 75], 8, (c) => T("Bốn mươi lần mở ứng dụng", vary("ivts", c.age, ["Bạn nhận ra mình mở ứng dụng xem giá bốn mươi lần mỗi ngày, kể cả trong bữa cơm. Lưng đau, mắt mờ, ngủ không sâu.", `Đêm nào bạn cũng dậy lúc ba giờ để xem thị trường bên kia địa cầu mở cửa.${c.married ? " Bạn đời bắt đầu ngủ phòng khác." : " Bạn quên luôn sinh nhật một người bạn thân."}`]), [
    C("Xóa ứng dụng khỏi điện thoại, chỉ xem cuối tuần", { counters: { ivt_risk: -1 }, health: 3, happy: 2, bw: 4 }, "Lỡ vài cơ hội, lấy lại giấc ngủ"),
    C("Thức tiếp, đó là nghề", { counters: { ivt_risk: 1 }, health: -4, rel: -3, money: 0.05 }, "Không lỡ gì, mất dần người bên cạnh")], 0)),
  daily(IV, "ivt_dirty", [26, 75], 9, (c) => T("Cổ tức từ một con sông", `Công ty trả cổ tức cao nhất trong danh mục của bạn vừa bị phóng viên quay cảnh xả nước thải xuống một con sông.${c.poor_country ? " Dân làng ven sông dùng nước ấy để tưới rau." : " Ngay hạ lưu là một khu bảo tồn chim."} Giá cổ phiếu chỉ giảm hai ngày rồi hồi lại.`, [
    C("Giữ, chuyện xả thải không phải việc của mình", { money: 0.1, counters: { ivt_risk: 1 } }, "Tiền đều, có thể gặp lại nó trên báo"),
    C("Bán hết, dù đang lỗ", { money: -0.1, happy: 2, flags: ["ivt_screened"] }, "Mất một khoản, sạch tay"),
    C("Mua thêm, lên tiếng ở đại hội cổ đông", { money: -0.2, flags: ["ivt_activist"], agency: 0.02, gamble: { p: 0.35, win: { counters: { ivt_trust: 2 }, log: "Đại hội biểu quyết lắp hệ thống xử lý nước. Báo chí nhắc tên bạn." }, lose: { happy: -2, log: "Ban lãnh đạo cảm ơn ý kiến của bạn rồi chuyển sang mục tiếp theo." } } }, "Tốn tiền, dùng cổ phần làm tiếng nói", { tier: "sovereign" })], 0)),
  daily(IV, "ivt_guru", [26, 70], 9, () => T("Nhóm kín thu phí", `Một người làm truyền thông đề nghị mở cho bạn một nhóm kín: mỗi thành viên trả phí hằng tháng để biết bạn mua gì. Họ ước tính năm nghìn người tham gia trong năm đầu. "Không cần đúng, chỉ cần tự tin," người ấy nói.`, [
    C("Mở nhóm, thu phí", { income_mult: 1.3, flags: ["ivt_guru"], counters: { ivt_trust: -1 }, gamble: { p: 0.6, win: { log: "Nhóm đông dần. Có tháng tiền phí nhiều hơn tiền lãi từ thị trường." }, lose: { rel: -5, close_doors: ["partner_circle"], log: "Một lệnh bạn gợi ý làm thành viên mất nặng. Hàng trăm người đòi lại phí trên mạng." } } }, "Tiền đều, đánh cược bằng tên mình"),
    C("Viết miễn phí, đăng cả những lệnh thua", { counters: { ivt_trust: 2 }, bw: -3, rel: 2 }, "Không ra tiền, ra người tin", { tier: "awakened" }),
    C("Từ chối, tiếp tục im lặng", { bw: 1 }, "Giữ sự riêng tư, bỏ một nguồn thu")], 2)),
  daily(IV, "ivt_tax", [24, 75], 9, (c) => T("Mùa khai thuế", vary("ivtx", c.age, [`Năm nay bạn lãi lớn. Kế toán gợi ý một cách "tối ưu" để khoản lãi không xuất hiện trên tờ khai.`, `Một người môi giới nói có cách để phần lớn khoản lãi năm nay "nằm ở nơi khác" trên giấy tờ. Ông ta bảo ai làm lớn cũng làm thế.`]), [
    C("Khai đủ, nộp đủ", { money: -0.15, counters: { honest: 1, ivt_trust: 1 } }, "Mất một khoản, không ai nắm thóp"),
    C("Làm theo lời gợi ý", { money: 0.15, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [3, 10], note: "giấu khoản lãi đầu tư khỏi tờ khai thuế" } }, "Giữ tiền, có một sợi dây người khác cầm")], 0)),
  daily(IV, "ivt_bubble", [24, 75], 8, (c) => T("Cơn sốt ở tiệm cắt tóc", vary("ivtb", c.age, ["Người cắt tóc hỏi bạn có nên bán chiếc xe đang đi hằng ngày để mua một loại tài sản mới, nghe nói đã tăng gấp mười. Cả tiệm im lặng chờ bạn trả lời.", "Tài xế chở bạn kể đã vay tiền để mua thêm một thứ anh ta không giải thích được là gì, chỉ biết là đang tăng."]), [
    C("Mua một ít, coi như vé số", { counters: { ivt_risk: 1 }, gamble: { p: 0.35, win: { money: 0.3, log: "Bạn bán khi nó gấp ba. Người cắt tóc vẫn đang giữ." }, lose: { money: -0.1, log: "Nó về gần bằng không trong sáu tháng." } } }, "Chút tiền cho một tấm vé"),
    C("Khuyên họ đừng bán thứ mình cần để mua", { rel: 2, counters: { ivt_trust: 1 } }, "Có thể sai, có thể bị cười"),
    C("Bán bớt những gì đang có, rời đám đông", { money: 0.1, income_mult: 0.95, flags: ["ivt_contrarian"] }, "Chốt sớm, có thể bỏ lỡ đợt tăng cuối")], 1)),
  daily(IV, "ivt_rival", [28, 70], 10, (c, N) => {
    const r = role(c, "rival")!;
    return T("Bản báo cáo của đối thủ", `${N(r)} vừa công bố một bản phân tích dài bốn mươi trang, nói công ty bạn nắm nhiều nhất đang thổi phồng doanh thu, và đặt cược công khai rằng giá sẽ rơi. Sáng nay cổ phiếu ấy mất một phần năm.`, [
      C("Tự đọc lại sổ sách, bán nếu họ đúng", { know: 4, bw: -4, gamble: { p: 0.5, win: { money: 0.1, flags: ["ivt_humble"], log: "Họ đúng. Bạn bán kịp, mất ít hơn mọi người." }, lose: { money: -0.1, log: "Họ chỉ đúng một nửa. Bạn bán đúng đáy." } } }, "Bỏ cái tôi, mất thời gian"),
      C("Phản bác trên báo, mua thêm", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "cãi nhau trên báo về bản phân tích một công ty" }, gamble: { p: 0.45, win: { money: 0.4, log: "Kiểm toán độc lập xác nhận sổ sạch. Giá tăng lại." }, lose: { money: -0.5, log: "Công ty thừa nhận sai số liệu. Bạn mất nặng, trước đám đông." } } }, "Thắng lớn hoặc thua trước mặt mọi người"),
      C("Mời họ cà phê, so sổ với nhau", { gamble: { p: 0.55, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "ngồi so sổ với nhau về một công ty" }, know: 3, log: "Hai người tìm ra chỗ cả hai cùng nhìn sai." }, lose: { happy: -1, log: "Họ đến, nghe, không nói điều gì có ích." } } }, "Hạ mình một bước, có thể có đồng minh", { tier: "awakened" })], 0, { npc: r });
  }, (c) => !!role(c, "rival")),

  /* ---------- gia đình ---------- */
  cross(IV, "ivt_family", [26, 75], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const s = role(c, "spouse");
    if (c.married && s) return T("Khoản tiền đặt cọc nhà", `${N(s)} phát hiện khoản để dành mua nhà của hai người đã nằm trong tài khoản đầu tư của bạn từ ba tháng trước. ${f(c, "ivt_leverage") ? "Một phần trong đó đang là tiền vay." : "Nó đang lỗ một chút."} ${N(s)} không to tiếng, chỉ hỏi sao bạn không nói.`, [
      C("Rút về ngay, xin lỗi", { trust: { npc: s, delta: 0.2 }, money: -0.05, counters: { ivt_risk: -1 } }, "Cắt lỗ, lấy lại lòng tin"),
      C("Giải thích rằng mình biết đang làm gì", { trust: { npc: s, delta: -0.25 }, gamble: { p: 0.5, win: { money: 0.3, log: `Một năm sau khoản ấy đủ đặt cọc căn rộng hơn. ${N(s)} không nhắc lại chuyện cũ.` }, lose: { money: -0.3, trust: { npc: s, delta: -0.15 }, log: "Khoản ấy mất một phần ba. Hai người dời việc mua nhà thêm ba năm." } } }, "Có thể đúng, nhưng đã đi một mình"),
      C("Mở tài khoản chung, cả hai cùng ký lệnh lớn", { trust: { npc: s, delta: 0.3 }, flags: ["ivt_joint"], bw: -3 }, "Chậm quyết, không còn bí mật", { tier: "sovereign" })], 0, { npc: s });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Cuốn sổ dưỡng già của bố mẹ", `${N(p)} đưa bạn cuốn sổ tiết kiệm cả đời và nói: "Con giỏi chuyện này, làm cho bố mẹ ít lãi." Số tiền ấy là toàn bộ những gì ${N(p)} có để dưỡng già.`, [
      C("Nhận, chỉ để vào nơi an toàn nhất", { trust: { npc: p, delta: 0.15 }, bw: -2, promise: { to: p, what: "giữ an toàn tiền dưỡng già của bố mẹ", years: 5 } }, "Lãi ít, mang thêm một lời hứa"),
      C("Nhận, đầu tư như tiền của mình", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.2 }, money: 0.05, log: `${N(p)} khoe với hàng xóm khoản lãi con làm ra.` }, lose: { trust: { npc: p, delta: -0.3 }, memory: { npc: p, tag: "CHEATED_ME", weight: -0.3, note: "khoản tiền dưỡng già bị hụt một phần tư" }, log: `Khoản ấy hụt một phần tư. ${N(p)} không trách, nhưng thôi hỏi bạn chuyện tiền.` } } }, "Có thể lãi, có thể mất tiền già của bố mẹ"),
      C("Từ chối, nói thật về rủi ro", { trust: { npc: p, delta: -0.05 }, counters: { honest: 1 } }, "Bố mẹ hơi tự ái, tiền nằm yên")], 0, { npc: p });
  }),

  /* ================= CHỦ XƯỞNG (fac_) ================= */

  /* ---------- năng khiếu ---------- */
  talent(FO, "fac_t_line", [10, 16], () => true, () => T("Dây chuyền đèn lồng giấy", "Lớp bạn phải làm ba trăm chiếc đèn lồng giấy cho hội chợ trường. Bạn chia cả lớp thành từng tổ: tổ cắt, tổ dán, tổ tô màu, và xong trước giờ tan học. Chủ một cửa hàng đến xem hội chợ hỏi ai là người sắp xếp.", [
    C("Nhận làm thêm một trăm chiếc cho cửa hàng", { flags: [talentFlag(FO)], counters: { talents_seen: 1 }, money: 0.02, know: -1, bw: -2 }, "Có đồng tiền đầu tiên, học hành chểnh mảng"),
    C("Chỉ làm cho hội chợ thôi", { counters: { talents_seen: 1 }, rel: 2 }, "Trọn vẹn với lớp, để cơ hội đi qua")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FO, "fac_d_buyout", [28, 55], (c) => c.has_job, () => T("Ông chủ muốn về hưu", "Ông chủ xưởng nơi bạn làm hơn chục năm muốn nghỉ. Ông đề nghị bán lại cả xưởng cho bạn: ba mươi máy, hai mươi tám công nhân, trả dần trong năm năm. Bạn biết tiếng kêu của từng cái máy.", [
    C("Vay tiền mua lại xưởng", { custom: `borrow:1.2|become:${FO}`, counters: { doors_seen: 1 }, agency: 0.02 }, "Thành chủ, ôm món nợ năm năm"),
    C("Rủ ba thợ lâu năm cùng góp vốn", { custom: `borrow:0.4|become:${FO}`, flags: ["fac_coop"], counters: { doors_seen: 1, fac_morale: 2 }, agency: 0.03 }, "Ít nợ, việc gì cũng phải bàn", { tier: "sovereign" }),
    C("Từ chối, làm thuê cho yên", { counters: { doors_seen: 1 }, happy: 1 }, "Ngủ ngon, xưởng về tay người lạ")], 2)),
  door(FO, "fac_d_order", [25, 50], () => true, () => T("Hai vạn sản phẩm trong sáu mươi ngày", "Bạn đang nhận gia công lặt vặt với vài cái máy trong nhà. Một người trung gian mang đến đơn hàng hai vạn sản phẩm cho một khách nước ngoài, giao trong sáu mươi ngày. Muốn nhận phải thuê nhà xưởng và tuyển hai chục người ngay tuần này.", [
    C("Thuê xưởng, tuyển người, nhận đơn", { custom: `borrow:0.6|become:${FO}`, counters: { doors_seen: 1 }, bw: -5 }, "Nhảy vọt, một đơn hỏng là phá sản"),
    C("Nhận một nửa, chia nửa kia cho xưởng quen", { counters: { doors_seen: 1 }, gamble: { p: 0.45, win: { ...become(FO), log: "Giao đủ, đúng hạn. Người trung gian quay lại với đơn thứ hai, lớn hơn." }, lose: { money: -0.1, log: "Xưởng quen giao trễ, khách trừ tiền cả hai bên." } } }, "An toàn hơn, phụ thuộc người khác"),
    C("Từ chối, giữ quy mô nhỏ", { counters: { doors_seen: 1 }, happy: 1 }, "Yên ổn, có thể không có lần thứ hai")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(FO, 1, 1, (c) => T("Ngày trả lương đầu tiên", `Sáng ngày trả lương, ${c.poor_country ? "hai mươi tám phong bì phải phát" : "bảng lương hai mươi tám người phải chuyển"}, nhưng khách lớn nhất trả chậm và tài khoản chỉ đủ hai phần ba.${f(c, "fac_coop") ? " Ba người góp vốn cùng bạn đề nghị chính họ nhận lương sau." : ""} Ngoài cổng, công nhân đang đứng chờ.`, [
    C("Vay nóng để trả đủ, đúng ngày", { counters: step(c, FO, { fac_morale: 2 }), custom: "borrow:0.3", bw: -3 }, "Giữ chữ tín, lãi vay ăn vào lời"),
    C("Trả hai phần ba, nói thật và hẹn ngày trả nốt", { counters: step(c, FO, { fac_morale: 1 }), flags: ["fac_open_talk"], rel: 1 }, "Mất mặt, được lòng tin", { tier: "awakened" }),
    C("Hoãn cả tháng, không giải thích", { counters: step(c, FO, { fac_morale: -3 }), flags: ["fac_late_pay"], money: 0.1 }, "Giữ tiền mặt, người giỏi sẽ đi trước")], 1), adult),
  beat(FO, 2, 3, (c) => T("Hợp đồng ba năm giá sát đáy", `${cnt(c, "fac_morale") >= 2 ? "Xưởng chạy đều, thợ giỏi ở lại." : "Xưởng chạy được, nhưng tháng nào cũng có người nghỉ."} Một nhà nhập khẩu lớn đề nghị hợp đồng ba năm, đủ việc cho gấp ba số máy bạn có, với giá thấp đến mức chỉ có lãi nếu chạy mười hai tiếng mỗi ngày.`, [
    C("Nhận, tăng ca mười hai tiếng", { counters: step(c, FO, { fac_morale: -2 }), flags: ["fac_overtime"], income_mult: 1.5, health: -3 }, "Lãi lớn, người và máy cùng mòn"),
    C("Nhận, chia việc cho các xưởng nhỏ không giấy phép", { counters: step(c, FO), flags: ["fac_subcontract"], income_mult: 1.6, bw: 2 }, "Lãi to, không biết xưởng kia làm ra sao"),
    C("Đòi giá cao hơn, đổi lại cam kết kiểm định", { counters: step(c, FO, { fac_morale: 1 }), gamble: { p: 0.4, win: { income_mult: 1.35, flags: ["fac_audited"], log: "Họ đồng ý. Xưởng bạn thành xưởng đầu tiên trong vùng có chứng nhận." }, lose: { income_mult: 1.05, log: "Họ chuyển đơn sang xưởng khác rẻ hơn. Bạn vẫn giữ được khách nhỏ." } } }, "Đặt điều kiện, có thể mất đơn", { tier: "sovereign" }),
    C("Từ chối, giữ khách nhỏ", { counters: step(c, FO), income_mult: 1.05, happy: 2 }, "Không lớn được, không mệt thêm")], 0), adult),
  beat(FO, 3, 4, (c) => {
    const text = f(c, "fac_subcontract")
      ? "Một xưởng gia công nhỏ nhận hàng của bạn bị cháy lúc nửa đêm. Ba người bị thương. Phóng viên tìm thấy nhãn hàng của bạn trong đống tro, và hỏi bạn có biết xưởng ấy không có lối thoát hiểm."
      : `Hai giờ sáng, đường dây điện cũ trong kho chập cháy. ${f(c, "fac_fire_safe") ? "Nhờ lối thoát hiểm bạn cho làm năm trước, ca đêm ra hết, chỉ một người bị bỏng nhẹ." : "Ca đêm chạy ra được, nhưng hai người bị thương vì cửa sau khóa."} Nửa kho hàng của đơn lớn nhất thành tro.`;
    return T("Đêm kho cháy", text, [
      C("Nhận trách nhiệm, chi trả đủ cho người bị thương", { counters: step(c, FO, { fac_morale: 3 }), flags: ["fac_owned_up"], money: -0.6 }, "Mất nửa năm lãi, giữ được người"),
      C("Để bảo hiểm và luật sư lo, nói ít nhất có thể", { counters: step(c, FO, { fac_morale: -2 }), flags: ["fac_lawyered"], money: -0.15, bw: -3 }, "Tốn ít, tiếng xấu ở lại trong khu"),
      C("Lo lót để hồ sơ vụ cháy nhẹ đi", { counters: step(c, FO), flags: ["fac_bribed"], money: -0.3, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 10], note: "lo lót để hồ sơ vụ cháy xưởng nhẹ đi" } }, "Qua được lúc này, người khác nắm thóp"),
      C("Đóng xưởng, bán máy trả nợ và bồi thường", { counters: step(c, FO), ...leave(FO), money: -0.2, happy: -3 }, "Rời nghề, không còn nợ ai")], 0);
  }, adult),
  beat(FO, 4, 5, (c) => {
    if (f(c, "fac_bribed")) return T("Hồ sơ cũ mở lại", "Người cán bộ nhận phong bì năm ấy vừa bị điều tra vì một vụ khác. Tên xưởng bạn nằm trong cuốn sổ ghi chép của ông ta. Điều tra viên hẹn bạn sáng thứ hai.", [
      C("Khai hết, chịu phạt", { counters: step(c, FO), flags: ["fac_confessed"], custom: "apologize", money: -0.8, close_doors: ["clean_record"] }, "Mất tiền và tên, khép được chuyện"),
      C("Thuê luật sư giỏi nhất, chối", { counters: step(c, FO), money: -0.5, gamble: { p: 0.45, win: { log: "Hồ sơ không đủ chứng cứ. Bạn về nhà, già đi mấy tuổi." }, lose: { income_mult: 0.5, close_doors: ["clean_record"], log: "Tòa tuyên phạt nặng. Khách lớn lần lượt rút đơn." } } }, "Có thể thoát, có thể mất nhiều hơn"),
      C("Bán gấp xưởng cho người khác", { counters: step(c, FO), ...leave(FO), money: 0.6 }, "Lấy lại ít vốn, bỏ lại cả đời làm")], 0);
    const loyal = cnt(c, "fac_morale") >= 3 || f(c, "fac_owned_up");
    return T(loyal ? "Không ai bỏ đi" : "Những cánh tay máy", loyal
      ? "Cả khu công nghiệp thiếu người, nhưng thợ của bạn không ai đi. Một tập đoàn muốn mua lại xưởng với giá gấp nhiều lần vốn. Ngân hàng thì sẵn sàng cho vay để bạn xây nhà máy thứ hai."
      : "Một dây chuyền tự động làm bằng sáu mươi công nhân, không nghỉ ốm, không đòi tăng lương. Nhà cung cấp cho trả chậm ba năm. Cùng tháng, một tập đoàn ngỏ ý mua lại xưởng.", [
      C("Bán xưởng cho tập đoàn, chuyển sang đầu tư", { counters: step(c, FO), ...leave(FO), custom: `become:${IV}`, money: 2.5, happy: -2 }, "Thành người giàu, xưởng không còn là của bạn"),
      C("Mua dây chuyền tự động, cắt nửa số người", { counters: step(c, FO, { fac_morale: -3 }), flags: ["fac_automated"], income_mult: 1.6, rel: -3 }, "Lãi gấp rưỡi, nửa xưởng mất việc"),
      loyal
        ? C("Vay tiền xây nhà máy thứ hai", { counters: step(c, FO), flags: ["fac_second_plant"], custom: "borrow:1.5", income_mult: 1.5, bw: -6 }, "Lớn gấp đôi, nợ cũng gấp đôi")
        : C("Giữ người, nâng tay nghề dần", { counters: step(c, FO, { fac_morale: 2 }), flags: ["fac_upskill"], income_mult: 1.1, know: 3 }, "Chậm hơn đối thủ, giữ được người"),
      C("Bán dần cổ phần cho chính công nhân", { counters: step(c, FO, { fac_morale: 3 }), flags: ["fac_employee_owned"], income_mult: 0.85, agency: 0.03 }, "Ít lãi hơn, xưởng sống lâu hơn bạn", { tier: "sovereign" })], 0);
  }, adult),
  beat(FO, 5, 6, (c, N) => {
    const k = role(c, "child");
    const now = f(c, "fac_automated") ? "Xưởng giờ chỉ còn mười hai người và những cánh tay máy chạy suốt đêm."
      : f(c, "fac_employee_owned") ? "Xưởng giờ là của hơn trăm người thợ, bạn chỉ còn giữ một phần nhỏ."
      : f(c, "fac_second_plant") ? "Bạn có hai nhà máy, và một cuốn sổ nợ dày như cuốn lịch."
      : "Xưởng vẫn chạy, tiếng máy vẫn như hôm bạn nhận chìa khóa.";
    return T("Chùm chìa khóa cổng xưởng", `${now} Bác sĩ bảo bạn nên nghỉ. Ai sẽ cầm chùm chìa khóa cổng?`, [
      C(k ? `Giao cho ${N(k)}` : "Giao cho người cháu trong họ", { counters: step(c, FO), flags: ["fac_family_heir"], happy: 2, ...(k ? { trust: { npc: k, delta: 0.15 } } : {}) }, "Giữ trong nhà, chưa chắc người nhận muốn"),
      C("Giao cho tổ trưởng lâu năm nhất", { counters: step(c, FO, { fac_morale: 2 }), flags: ["fac_foreman_heir"], money: -0.2, rel: 3 }, "Nhường phần lãi, xưởng vào tay người hiểu nó", { tier: "awakened" }),
      C("Bán đứt, lấy tiền dưỡng già", { counters: step(c, FO), money: 1.2, happy: -1 }, "Nhẹ người, không còn nơi để quay về")], 1, k ? { npc: k } : {});
  }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(FO, "fac_bonus", [25, 70], 6, (c) => T(vn(c) ? "Thưởng Tết" : "Thưởng cuối năm", vary("facb", c.age, vn(c)
    ? ["Còn ba tuần nữa là Tết. Công nhân hỏi nhau năm nay thưởng mấy tháng lương, vé xe về quê đã tăng giá gấp đôi. Năm nay xưởng lãi mỏng.", "Tết đến sớm, đơn hàng dồn cuối năm chưa thu được tiền. Tổ trưởng hỏi bạn thưởng bao nhiêu để còn báo anh em mua vé tàu."]
    : ["Còn ba tuần nữa là hết năm. Công nhân hỏi nhau năm nay có thưởng không, khi giá thuê nhà vừa tăng. Năm nay xưởng lãi mỏng.", "Cuối năm, đơn hàng dồn nhưng tiền chưa về. Tổ trưởng hỏi bạn thưởng bao nhiêu để còn báo anh em."]), [
    C("Thưởng đủ một tháng lương", { money: -0.15, counters: { fac_morale: 2 } }, "Hụt vốn đầu năm, người ở lại"),
    C("Thưởng nửa tháng, hẹn bù khi có tiền", { money: -0.07, counters: { fac_morale: 1 }, flags: ["fac_bonus_owed"] }, "Vừa sức, mang thêm một lời hứa"),
    C("Không thưởng, giữ tiền nhập nguyên liệu", { money: 0.02, counters: { fac_morale: -2 } }, "Đủ vốn, đầu năm thiếu thợ")], 1)),
  daily(FO, "fac_inspect", [25, 70], 9, () => T("Đoàn kiểm tra phòng cháy", "Đoàn kiểm tra phòng cháy đến không báo trước. Lối thoát hiểm phía sau bị chắn bởi ba chục kiện hàng, bình chữa cháy hết hạn từ năm ngoái. Trưởng đoàn nói nhỏ rằng biên bản có thể viết nhẹ hoặc nặng.", [
    C("Gửi một phong bì cho biên bản nhẹ", { money: -0.05, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "gửi phong bì cho đoàn kiểm tra phòng cháy" } }, "Rẻ, nhanh, lối thoát vẫn bị chắn"),
    C("Nhận biên bản nặng, sửa hết trong một tháng", { money: -0.2, flags: ["fac_fire_safe"], counters: { fac_morale: 1, honest: 1 } }, "Tốn tiền và lỡ đơn, xưởng an toàn thật")], 1)),
  daily(FO, "fac_river", [25, 70], 9, (c, N) => {
    const nb = role(c, "neighbor");
    return T("Ao cá phía hạ lưu", `${nb ? N(nb) : "Nhà nuôi cá phía hạ lưu"} mang đến cổng xưởng một xô cá chết. Mương thoát nước của xưởng bạn chảy thẳng ra ao ấy. Hệ thống xử lý nước thải tử tế tốn bằng nửa năm lãi.`, [
      C("Lắp hệ thống xử lý, đền ao cá", { money: -0.45, flags: ["fac_clean"], ...(nb ? { memory: { npc: nb, tag: "WIN_WIN_DEAL", weight: 0.25, note: "lắp hệ thống xử lý nước và đền ao cá" } } : {}) }, "Mất nửa năm lãi, sống yên với hàng xóm"),
      C("Đền tiền cá, dặn họ đừng làm to chuyện", { money: -0.05, flags: ["fac_hushed"], ...(nb ? { trust: { npc: nb, delta: -0.1 } } : {}) }, "Rẻ, chuyện sẽ còn lặp lại"),
      C("Chối, bảo cá chết vì trời nóng", { counters: { fac_morale: -1 }, ...(nb ? { memory: { npc: nb, tag: "CHEATED_ME", weight: -0.35, note: "xưởng xả nước làm chết cả ao cá" } } : { flags: ["fac_denied"] }) }, "Không tốn gì, mất một người láng giềng")], 0, nb ? { npc: nb } : {});
  }),
  daily(FO, "fac_strike", [25, 70], 8, (c) => T("Chuyền dừng lúc tám giờ", `Tám giờ sáng, cả chuyền ngồi im trước máy. Họ đòi tăng lương một phần mười vì giá thuê trọ và giá đồ ăn đều lên. ${cnt(c, "fac_morale") >= 2 ? "Người đứng ra nói là tổ trưởng theo bạn từ ngày đầu." : "Bạn không nhớ tên người đứng ra nói."}`, [
    C("Tăng lương như họ đòi", { income_mult: 0.92, counters: { fac_morale: 2 } }, "Lãi mỏng đi, chuyền chạy lại ngay"),
    C("Cho nghỉ việc những người cầm đầu", { counters: { fac_morale: -3 }, flags: ["fac_union_busted"], rel: -3, gamble: { p: 0.6, win: { log: "Chuyền chạy lại sau hai ngày. Không ai nói chuyện với bạn ở căng tin nữa." }, lose: { money: -0.2, log: "Cả xưởng nghỉ theo. Đơn hàng giao trễ, khách phạt hợp đồng." } } }, "Giữ quyền, mất lòng người"),
    C("Mở sổ sách, đề nghị chia lãi theo quý", { counters: { fac_morale: 3 }, flags: ["fac_profit_share"], income_mult: 0.95, bw: -4, agency: 0.02 }, "Lộ hết con số, thợ thành người cùng thuyền", { tier: "sovereign" })], 0)),
  daily(FO, "fac_hand", [25, 70], 9, () => T("Máy dập không có tấm chắn", "Một thợ mười chín tuổi bị máy dập kẹp vào tay, phải nghỉ ba tháng. Cái máy ấy không có tấm chắn từ trước khi bạn tiếp quản. Còn mười một cái máy giống thế.", [
    C("Lo viện phí, giữ chỗ làm, lắp chắn mười hai máy", { money: -0.25, flags: ["fac_guards"], counters: { fac_morale: 2 } }, "Tốn một khoản, không ai bị như thế nữa"),
    C("Trả đúng mức luật bắt buộc", { money: -0.05, counters: { fac_morale: -1 } }, "Đúng luật, cả xưởng nhìn thấy"),
    C("Đưa một khoản, khuyên cậu ấy nghỉ hẳn", { money: -0.1, flags: ["fac_paid_off"], counters: { fac_morale: -2 } }, "Khép nhanh, mười một cái máy vẫn thế")], 0)),
  daily(FO, "fac_material", [25, 70], 8, (c) => T("Nguyên liệu tăng bốn phần mười", vary("facm", c.age, ["Giá vải tăng bốn phần mười trong một quý. Hợp đồng với khách đã chốt giá từ đầu năm. Nhà cung cấp quen gợi ý một loại rẻ hơn, nhìn bằng mắt không ai biết.", "Giá thép và nhựa cùng lên. Nhà cung cấp đề nghị một loại kém hơn một bậc, giá cũ, nói rằng khách sẽ không bao giờ kiểm."]), [
    C("Thay nguyên liệu rẻ hơn, không báo khách", { money: 0.15, flags: ["fac_cut_corners"], gamble: { p: 0.65, win: { log: "Lô hàng qua kiểm tra. Bạn giữ được lãi." }, lose: { money: -0.4, close_doors: ["partner_circle"], log: "Khách phát hiện, trả lại cả lô và báo cho các nhà nhập khẩu khác." } } }, "Giữ lãi, đặt cả tên xưởng lên bàn"),
    C("Chịu lỗ đơn này, giữ chất lượng", { money: -0.2, counters: { honest: 1 } }, "Mất một quý lãi, khách tin lâu dài"),
    C("Gọi khách, đề nghị chia đôi phần tăng giá", { gamble: { p: 0.55, win: { money: -0.05, flags: ["fac_shared_cost"], log: "Khách đồng ý chia. Họ ghi tên bạn vào danh sách nhà cung cấp minh bạch." }, lose: { money: -0.2, log: "Khách nói hợp đồng là hợp đồng." } } }, "Thẳng thắn, có thể bị từ chối", { tier: "awakened" })], 2)),
  daily(FO, "fac_debtor", [25, 70], 8, () => T("Khách nợ bốn tháng tiền hàng", `Một khách quen nợ bạn bốn tháng tiền hàng, vẫn đặt đơn mới đều đặn và hứa "cuối tháng". Số nợ đã bằng ba tháng lương của cả xưởng.`, [
    C("Ngừng giao, khởi kiện", { money: -0.05, gamble: { p: 0.5, win: { money: 0.3, log: "Tòa xử bạn thắng. Khách trả đủ, rồi không bao giờ đặt hàng nữa." }, lose: { money: -0.1, log: "Khách tuyên bố phá sản. Bạn xếp hàng cùng hai chục chủ nợ khác." } } }, "Đòi được tiền hoặc mất cả khách lẫn tiền"),
    C("Tiếp tục giao, tin lời hứa", { money: -0.15, gamble: { p: 0.5, win: { money: 0.25, log: "Họ trả hết vào cuối năm, kèm một đơn lớn." }, lose: { money: -0.3, log: "Họ biến mất cùng hai tháng hàng nữa." } } }, "Giữ khách, đặt cược thêm"),
    C("Nhận hàng tồn của họ thay tiền", { money: -0.1, flags: ["fac_barter"], bw: -3 }, "Thu được gì đó, phải tự đi bán")], 1)),
  daily(FO, "fac_dorm", [25, 70], 10, (c) => T("Dãy trọ sau cổng xưởng", `Chủ dãy trọ sau xưởng tăng giá thuê lần thứ hai trong năm. Mười hai thợ ngủ chung một phòng, nấu ăn ngoài hành lang. ${c.poor_country ? "Ba người vừa xin nghỉ về quê." : "Ba người vừa chuyển sang xưởng có ký túc xá."}`, [
    C("Xây ký túc xá cạnh xưởng", { money: -0.5, flags: ["fac_dorm"], counters: { fac_morale: 3 } }, "Mất cả năm lãi, thợ ở lại nhiều năm", { longterm: true }),
    C("Trả thêm tiền trọ mỗi tháng", { income_mult: 0.95, counters: { fac_morale: 1 } }, "Vừa phải, chủ trọ sẽ lại tăng giá"),
    C("Bỏ qua, chuyện trọ không phải việc của xưởng", { money: 0.02, counters: { fac_morale: -1 } }, "Tiết kiệm, phải tuyển người mới liên tục")], 1)),
  daily(FO, "fac_poach", [25, 70], 8, (c, N) => {
    const r = role(c, "rival")!;
    return T("Xưởng bên kia đường", `${N(r)} mở xưởng ngay bên kia đường, trả thêm mỗi tháng một khoản để kéo thợ giỏi của bạn sang. Tuần này đã có bốn người đi, kể cả người duy nhất biết sửa máy cắt.`, [
      C("Tăng lương cho những người còn lại", { income_mult: 0.93, counters: { fac_morale: 1 } }, "Giữ được người, lãi mỏng đi"),
      C("Tung tin xưởng kia sắp phá sản", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bị tung tin xưởng sắp phá sản" }, gamble: { p: 0.5, win: { log: "Hai người quay lại. Bên kia đường bắt đầu nhìn bạn khác đi." }, lose: { rel: -3, log: "Người ta lần ra tin đồn là của bạn. Cả khu cười." } } }, "Có thể kéo người về, có thể mất mặt"),
      C("Sang gặp, đề nghị cùng nhận đơn lớn, chia việc", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.35, note: "cùng nhận một đơn lớn rồi chia việc" }, income_mult: 1.1, log: "Hai xưởng nhận được đơn mà không ai làm nổi một mình." }, lose: { happy: -1, log: "Họ nghe xong, cười, rồi tiếp tục kéo người." } } }, "Biến đối thủ thành đối tác, có thể bị cười", { tier: "sovereign" })], 0, { npc: r });
  }, (c) => !!role(c, "rival")),
  daily(FO, "fac_relocate", [28, 70], 10, (c) => T("Một nước khác báo giá rẻ hơn", `Khách lớn nhất gửi thư: một nước khác báo giá thấp hơn một phần sáu. Họ cho bạn ba mươi ngày để giảm giá tương đương, hoặc họ chuyển đơn đi.${c.poor_country ? "" : " Ở nước bạn, lương tối thiểu vừa tăng."}`, [
    C("Giảm lương thợ để giữ giá", { money: 0.05, counters: { fac_morale: -3 }, rel: -2 }, "Giữ đơn, thợ gánh thay bạn"),
    C("Cắt phần lãi của chính mình", { income_mult: 0.85, counters: { fac_morale: 1 } }, "Giữ đơn và người, bạn nghèo đi"),
    C("Thả khách lớn, tìm khách cần hàng chất lượng", { flags: ["fac_niche"], gamble: { p: 0.45, win: { income_mult: 1.2, log: "Một năm sau bạn có ba khách nhỏ trả giá cao hơn, không ai dọa đi." }, lose: { income_mult: 0.7, money: -0.2, log: "Nửa năm xưởng chạy cầm chừng. Bạn cầm cố chiếc xe để trả lương." } } }, "Thoát cuộc đua giá rẻ, có thể đói trước", { tier: "sovereign" })], 1)),

  /* ---------- gia đình ---------- */
  cross(FO, "fac_family", [30, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (!!role(c, "sibling") && (!!role(c, "father") || !!role(c, "mother"))), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} không muốn nối nghiệp`, `${N(k)} vừa đỗ vào một trường ở xa, muốn học một thứ chẳng liên quan gì đến máy móc. Bạn đã xây cái xưởng này với ý nghĩ một ngày ${N(k)} sẽ cầm chìa khóa.`, [
      C("Để con đi, tự lo người kế nghiệp", { trust: { npc: k, delta: 0.3 }, money: -0.1, happy: -2 }, "Mất người nối nghiệp, được lòng con"),
      C("Ép con học quản trị rồi về xưởng", { trust: { npc: k, delta: -0.3 }, memory: { npc: k, tag: "HUMILIATED_ME", weight: -0.2, note: "bị ép bỏ ngành mình thích để về xưởng" }, flags: ["fac_forced_heir"] }, "Có người kế nghiệp, mất một phần đứa con"),
      C("Hẹn con: đi làm nơi khác năm năm rồi hẵng quyết", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "để con tự chọn có về xưởng hay không sau năm năm", years: 5 } }, "Hoãn câu trả lời, giữ cửa mở", { tier: "awakened" })], 0, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    const s = role(c, "sibling")!;
    return T("Một chỗ trong xưởng cho người nhà", `${N(p)} gọi điện: ${N(s)} vừa mất việc, ở nhà nằm cả ngày. "Xưởng con to thế, cho ${N(s)} một chỗ." Bạn biết ${N(s)} chưa bao giờ đi làm đúng giờ.`, [
      C(`Nhận ${N(s)} làm quản lý kho`, { trust: { npc: p, delta: 0.2 }, counters: { fac_morale: -1 }, gamble: { p: 0.4, win: { memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "cho một chỗ làm lúc thất nghiệp" }, log: `${N(s)} làm tốt hơn bạn tưởng, và ở lại đến tận bây giờ.` }, lose: { money: -0.1, log: `${N(s)} làm hụt kho hai lần. Thợ bắt đầu bàn tán về người nhà chủ.` } } }, "Vui lòng nhà, có thể hỏng việc xưởng"),
      C("Nhận vào làm thợ, chịu luật như mọi người", { trust: { npc: s, delta: -0.1 }, counters: { fac_morale: 1 } }, "Công bằng với thợ, người nhà tự ái", { tier: "awakened" }),
      C("Từ chối, cho tiền thay chỗ làm", { money: -0.05, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.2, note: "không cho vào làm ở xưởng" } }, "Giữ xưởng sạch, mất một bữa cơm vui")], 0, { npc: s });
  }),

  /* ================= NGƯỜI BÁN HÀNG ONLINE (ecm_) ================= */

  /* ---------- năng khiếu ---------- */
  talent(EC, "ecm_t_photos", [11, 16], () => true, () => T("Bán đồ cũ cuối tuần", "Bạn dọn tủ, chụp ảnh đồ chơi và sách cũ dưới nắng bên cửa sổ, mỗi món viết vài dòng thật vui. Cuối tuần, trang của bố mẹ bán hết sạch. Hàng xóm nhờ bạn bán hộ đồ nhà họ, chia cho bạn một phần.", [
    C("Nhận bán hộ, lập một trang riêng", { flags: [talentFlag(EC)], counters: { talents_seen: 1 }, money: 0.02, bw: -2, know: -1 }, "Có nghề tay trái sớm, bài vở bị lấn"),
    C("Thôi, bán đồ nhà mình là đủ", { counters: { talents_seen: 1 }, happy: 1 }, "Giữ cuối tuần, bỏ qua một cái duyên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(EC, "ecm_d_stock", [18, 40], () => true, (c) => T("Ba bao tải hàng tồn", `Một người quen ${c.poor_country ? "buôn quần áo ngoài chợ" : "vừa đóng cửa hàng quần áo"} còn ba bao tải hàng tồn, nhờ bạn bán qua mạng và chia đôi tiền lời. Bạn chụp ảnh buổi tối sau giờ làm. Một tuần, hết hai bao.`, [
    C("Nghỉ việc, mở shop toàn thời gian", { ...become(EC), counters: { doors_seen: 1 }, money: -0.08, agency: 0.02 }, "Làm chủ, thu nhập lên xuống theo tháng"),
    C("Bán buổi tối, vẫn giữ việc", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(EC), log: "Sáu tháng sau tiền shop vượt tiền lương. Bạn xin nghỉ." }, lose: { health: -3, log: "Bạn kiệt sức sau ba tháng thức khuya, đóng trang." } } }, "An toàn hơn, có thể kiệt sức"),
    C("Trả lại hàng, chỉ lấy tiền công tuần này", { counters: { doors_seen: 1 }, money: 0.02 }, "Gọn gàng, cánh cửa khép lại")], 1)),
  door(EC, "ecm_d_live", [18, 35], () => true, () => T("Tháng đầu được đẩy sóng", "Một ứng dụng mua sắm mới mời người bán thử livestream: tháng đầu miễn phí, được đẩy lên trang chủ. Bạn chỉ cần một chiếc điện thoại, một bóng đèn, và nói không ngừng hai tiếng mỗi tối.", [
    C("Vay tiền nhập hàng, lên sóng mỗi tối", { custom: `borrow:0.2|become:${EC}`, counters: { doors_seen: 1 }, bw: -3 }, "Bắt đúng sóng, mắc nợ từ ngày đầu"),
    C("Lên sóng bán đồ ký gửi, không ôm hàng", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(EC), log: "Đêm thứ chín có ba nghìn người xem. Bạn nhận ra mình làm được." }, lose: { happy: -2, log: "Mỗi tối mười hai người xem, phần lớn là bạn bè." } } }, "Không mất vốn, khó bứt lên"),
    C("Thôi, ngại lên hình", { counters: { doors_seen: 1 } }, "Giữ sự riêng tư, bỏ một cơn sóng")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(EC, 1, 1, (c) => T("Hàng chợ hay hàng của mình", `Đơn đều dần, đủ nuôi bạn. Có hai đường: nhập hàng giá rẻ từ ${vn(c) ? "chợ đầu mối" : "các xưởng bán sỉ"}, lãi mỏng nhưng bán được ngay; hoặc tự vẽ một mẫu riêng, đặt một xưởng nhỏ làm hai trăm cái, rồi chờ.`, [
    C("Nhập hàng sỉ, bán số lượng", { counters: step(c, EC), flags: ["ecm_reseller"], money: 0.05, income_mult: 1.1 }, "Tiền về nhanh, ai cũng bán được thứ này"),
    C("Làm mẫu riêng, đặt tên thương hiệu", { counters: step(c, EC, { ecm_rep: 1 }), flags: ["ecm_own_brand"], money: -0.12, gamble: { p: 0.5, win: { happy: 5, log: "Hai trăm cái hết trong mười ngày. Có người hỏi khi nào có mẫu mới." }, lose: { happy: -3, log: "Sau ba tháng còn một trăm sáu mươi cái chất ở góc phòng." } } }, "Vốn nằm trong kho, nếu bán được là của mình"),
    C("Làm cả hai: hàng sỉ nuôi hàng riêng", { counters: step(c, EC), flags: ["ecm_reseller", "ecm_own_brand"], bw: -6, health: -2 }, "Không bỏ đường nào, mệt gấp đôi")], 0), adult),
  beat(EC, 2, 3, (c) => T("Thuật toán đổi luật", `${f(c, "ecm_own_brand") ? "Mẫu của bạn bắt đầu có người nhớ tên." : "Shop của bạn có hàng nghìn đơn mỗi tháng."} Rồi sàn đổi thuật toán: lượt xem rơi một nửa chỉ sau một đêm. Sàn gợi ý trả phí quảng cáo và vào đợt giảm giá lớn, thu thêm một phần bảy doanh thu.`, [
    C("Trả phí, vào đợt giảm giá lớn", { counters: step(c, EC), flags: ["ecm_platform_bound"], income_mult: 1.4, bw: -2 }, "Đơn về lại, lãi mỏng và lệ thuộc sàn"),
    C("Thuê người viết đánh giá ảo để lên top", { counters: step(c, EC), flags: ["ecm_fake_reviews"], income_mult: 1.5 }, "Lên nhanh, mỗi đánh giá giả là một vết"),
    C("Xây nhóm khách quen riêng, bán ngoài sàn", { counters: step(c, EC, { ecm_rep: 1 }), flags: ["ecm_own_channel"], income_mult: 1.05, bw: -5 }, "Chậm, nhưng không ai tắt được bạn"),
    C("Rủ mười shop nhỏ chung kho, chung đơn vị giao", { counters: step(c, EC, { ecm_rep: 1 }), flags: ["ecm_alliance"], income_mult: 1.2, bw: -4, agency: 0.03 }, "Mất thời gian họp, có sức mặc cả", { tier: "sovereign" })], 0), adult),
  beat(EC, 3, 4, (c) => {
    const why = f(c, "ecm_fake_reviews") ? "Hệ thống phát hiện hàng trăm đánh giá ảo trên shop của bạn."
      : f(c, "ecm_own_brand") ? "Một shop khác chép mẫu của bạn, rồi tố ngược rằng bạn chép của họ."
      : "Một hãng lớn tố lô hàng bạn nhập là hàng nhái, dù bạn mua có hóa đơn.";
    const ownWay = f(c, "ecm_own_channel") || f(c, "ecm_alliance");
    const appealP = f(c, "ecm_fake_reviews") ? 0.15 : f(c, "ecm_registered") ? 0.7 : 0.45;
    return T("Gian hàng bị khóa lúc nửa đêm", `${why} Sáng ra, gian hàng bị khóa, tiền ba tháng bị giữ lại chờ xác minh. ${ownWay ? "Điện thoại vẫn sáng: khách quen hỏi bạn còn bán ở đâu." : "Không còn đơn nào đổ về."}`, [
      C("Kháng nghị, nộp đủ giấy tờ, chờ", { counters: step(c, EC), bw: -8, gamble: { p: appealP, win: { money: 0.2, counters: { ecm_rep: 1 }, log: "Bảy tuần sau gian hàng mở lại, kèm một lời xin lỗi tự động." }, lose: { money: -0.4, income_mult: 0.7, log: "Kháng nghị bị bác. Tiền bị giữ thêm sáu tháng." } } }, "Đúng đường, chậm và không chắc"),
      C("Mở gian hàng mới bằng tên người nhà", { counters: step(c, EC), flags: ["ecm_proxy_shop"], income_mult: 0.9, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 7], note: "mở gian hàng mới bằng giấy tờ người nhà sau khi bị khóa" } }, "Bán lại ngay, sống bằng tên người khác"),
      C(ownWay ? "Dồn hết sang kênh riêng, bỏ sàn" : "Dựng trang riêng từ con số không", { counters: step(c, EC, { ecm_rep: 1 }), flags: ["ecm_off_platform"], income_mult: ownWay ? 1 : 0.6, agency: 0.02 }, "Tự do khỏi sàn, mất đơn từ người lạ", { tier: "sovereign" }),
      C("Đóng shop, đi làm thuê", { counters: step(c, EC), ...leave(EC), happy: -2, health: 2 }, "Hết thấp thỏm, mất luôn cái tên đã gây dựng")], 0);
  }, adult),
  beat(EC, 4, 5, (c) => {
    const strong = cnt(c, "ecm_rep") >= 3 || f(c, "ecm_own_channel") || f(c, "ecm_off_platform");
    if (strong) return T("Mười nghìn đơn một đêm", `Một đêm livestream của bạn ra mười nghìn đơn. ${f(c, "ecm_own_brand") ? "Một chuỗi cửa hàng muốn đặt mẫu của bạn lên kệ khắp nước." : "Một nhà đầu tư muốn mua bốn phần mười shop."} Xưởng nhỏ bạn đặt hàng thì không theo kịp.`, [
      C("Bán bốn phần mười cho nhà đầu tư", { counters: step(c, EC), flags: ["ecm_sold_stake"], money: 1.2, income_mult: 0.9 }, "Có tiền mặt lớn, có người hỏi từng con số"),
      C("Vay tiền mở xưởng sản xuất riêng", { counters: step(c, EC), flags: ["ecm_own_factory"], custom: `borrow:1|become:${FO}`, bw: -6 }, "Nắm nguồn hàng, ôm thêm một nghề nặng"),
      C("Giữ nhỏ, chỉ bán cho khách quen", { counters: step(c, EC, { ecm_rep: 1 }), flags: ["ecm_stay_small"], income_mult: 0.9, happy: 6, health: 3 }, "Bỏ đỉnh sóng, có lại buổi tối", { tier: "awakened" })], 0);
    return T("Căn phòng đầy hàng ế", `Sau đợt giảm giá lớn, ${f(c, "ecm_platform_bound") ? "phí sàn ăn hết lãi và " : ""}một nghìn hai trăm sản phẩm nằm chật căn phòng. Khoản vay nhập hàng đến hạn trong sáu tuần. Bạn bắt đầu mất ngủ.`, [
      C("Xả kho ba đêm liền, bán bằng giá vốn", { counters: step(c, EC), bw: -6, gamble: { p: 0.55, win: { money: 0.1, flags: ["ecm_cleared"], log: "Ba đêm, gần hết sạch. Bạn trả được khoản vay, còn lại đôi mắt thâm." }, lose: { money: -0.3, log: "Bán được một phần ba. Phần còn lại bạn đem cho." } } }, "Có thể gỡ, có thể kiệt sức"),
      C("Bán cả lô cho một shop khác, chịu lỗ", { counters: step(c, EC), custom: "repay:0.2", money: -0.25 }, "Lỗ chắc, hết nợ ngay"),
      C("Đóng shop, trả nợ, đi làm thuê", { counters: step(c, EC), ...leave(EC), money: -0.3, happy: 1 }, "Khép lại một giấc mơ, ngủ được")], 0);
  }, adult),
  beat(EC, 5, 6, (c) => T("Người bán lâu năm nhất sàn", `Người bán quanh bạn giờ phần lớn mới hai mươi tuổi, nói nhanh gấp đôi. ${f(c, "ecm_own_brand") ? "Có khách quay lại mua mẫu của bạn cho con mình." : "Vài khách quen đã mua của bạn hơn mười lăm năm."} Một người vừa mở shop nhắn hỏi bạn có nhận dạy không.`, [
    C("Mở lớp miễn phí cho người mới bán hàng", { counters: step(c, EC), flags: ["ecm_mentor"], rel: 5, happy: 3, bw: -3 }, "Mất buổi tối, có thêm học trò"),
    C("Bán lại cả shop và danh sách khách", { counters: step(c, EC), money: 0.8, happy: -1 }, "Một khoản gọn, khách quen về tay người lạ"),
    C("Giao shop cho người làm lâu năm nhất", { counters: step(c, EC), flags: ["ecm_handed_down"], money: -0.1, rel: 3 }, "Không lấy tiền, cái tên sống tiếp", { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(EC, "ecm_cod", [18, 65], 7, (c) => T("Hàng quay về", vary("ecmc", c.age, [`Bốn mươi đơn ${vn(c) ? "bị bom" : "bị từ chối nhận"} trong một tuần: người mua đặt rồi không nghe máy. Phí giao hai chiều bạn chịu.`, "Một người đặt mười lăm món, đến lúc giao thì bảo không đặt gì cả. Hàng quay về, hộp móp méo."]), [
    C("Bắt đặt cọc trước mọi đơn", { flags: ["ecm_deposit"], income_mult: 0.95, money: 0.02 }, "Hết bị bùng đơn, mất khách ngại chuyển tiền"),
    C("Đăng thông tin người bùng đơn lên mạng", { flags: ["ecm_shamed"], gamble: { p: 0.5, win: { counters: { ecm_rep: 1 }, log: "Nhiều shop chia sẻ, cảm ơn bạn." }, lose: { money: -0.05, counters: { ecm_rep: -1 }, log: "Người kia dọa kiện vì lộ thông tin cá nhân. Bạn gỡ bài và xin lỗi." } } }, "Hả giận, có thể thành chuyện khác"),
    C("Chịu lỗ, coi như phí làm nghề", { money: -0.04, happy: -1 }, "Không mất khách, mất tiền")], 2)),
  daily(EC, "ecm_onestar", [18, 65], 7, () => T("Đánh giá một sao kèm ảnh", "Một khách để lại đánh giá một sao, kèm ảnh một món hàng không phải của shop bạn, viết rằng bạn bán hàng giả. Đánh giá ấy nằm đầu trang, ba trăm người thả tim.", [
    C("Trả lời gay gắt, đưa bằng chứng", { gamble: { p: 0.5, win: { counters: { ecm_rep: 2 }, log: "Người ta đọc bằng chứng, quay sang bênh bạn. Shop lên xu hướng." }, lose: { counters: { ecm_rep: -2 }, log: "Người ta chỉ nhớ giọng điệu của bạn. Đơn giảm cả tuần." } } }, "Thắng lớn hoặc thua lớn trước đám đông"),
    C("Nhắn riêng, hoàn tiền dù không phải lỗi mình", { money: -0.02, counters: { ecm_rep: 1 } }, "Mất chút tiền, khách tự sửa đánh giá"),
    C("Trả tiền cho dịch vụ xóa đánh giá", { money: -0.03, flags: ["ecm_bought_removal"] }, "Biến mất nhanh, bạn đã bước vào chợ đen")], 1)),
  daily(EC, "ecm_fakegoods", [18, 65], 9, () => T("Lô túi xách rẻ bất thường", `Một nhà cung cấp mời bạn lô túi "xách tay" giống hệt hàng hiệu, giá bằng một phần năm. Không có hóa đơn. Họ nói các shop lớn đều đang bán.`, [
    C("Nhập, bán như hàng xách tay", { money: 0.3, flags: ["ecm_counterfeit"], gamble: { p: 0.6, win: { log: "Lô hàng bán hết trong hai tuần. Không ai hỏi gì." }, lose: { money: -0.5, counters: { ecm_rep: -2 }, close_doors: ["clean_record"], log: "Cơ quan quản lý thị trường thu toàn bộ hàng và phạt. Tên shop lên báo." } } }, "Lãi gấp năm, đặt cược cả tên shop"),
    C("Từ chối thẳng", { counters: { honest: 1 } }, "Bỏ món lãi to, ngủ yên"),
    C("Đòi giấy tờ nguồn gốc rồi mới bàn", { counters: { ecm_rep: 1 }, know: 2, bw: -1 }, "Mất thời gian, thường là chẳng có gì", { tier: "awakened" })], 1)),
  daily(EC, "ecm_night", [18, 65], 7, (c) => T("Ba giờ sáng vẫn còn sóng", vary("ecmn", c.age, ["Bạn livestream từ chín giờ tối đến ba giờ sáng, giọng khàn, lưng không thẳng được. Người xem đông nhất vào lúc khuya nhất.", "Tuần này bạn đóng gói hai nghìn đơn, mỗi đêm ngủ bốn tiếng. Tay bạn run khi dán băng keo."]), [
    C("Thuê người lên sóng thay hai tối", { flags: ["ecm_has_staff"], income_mult: 0.92, health: 3, bw: 3 }, "Bớt kiệt sức, người xem chưa quen giọng mới"),
    C("Gồng tiếp, mùa này phải tận dụng", { counters: { ecm_rep: 1 }, money: 0.08, health: -5 }, "Thêm tiền, cơ thể ghi nợ")], 0)),
  daily(EC, "ecm_tax", [18, 65], 9, () => T("Quy định khai thuế mới", "Nhà nước yêu cầu người bán online đăng ký kinh doanh và khai thuế theo doanh thu thật; dưới một ngưỡng nhỏ thì được miễn. Sàn sẽ gửi số liệu cho cơ quan thuế. Bạn ước tính sẽ mất khoảng một tháng lãi mỗi năm.", [
    C("Đăng ký đầy đủ", { money: -0.1, flags: ["ecm_registered"], counters: { honest: 1 } }, "Mất lãi, có giấy tờ khi cần kháng nghị"),
    C("Tìm cách để doanh thu trông nhỏ hơn", { money: 0.08, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 8], note: "khai doanh thu shop online thấp hơn thật để né thuế" } }, "Giữ lãi, có một sợi dây người khác cầm"),
    C("Giữ quy mô dưới ngưỡng phải khai", { income_mult: 0.85, flags: ["ecm_under_threshold"] }, "Hợp pháp, tự trói tay mình")], 0)),
  daily(EC, "ecm_kol", [18, 65], 8, () => T("Một video giá ba tháng lãi", "Một người nổi tiếng trên mạng nhận quảng cáo sản phẩm của bạn: một video, giá bằng ba tháng lãi, trả trước. Họ có hai triệu người theo dõi, phần lớn là học sinh.", [
    C("Trả trước, đặt cược vào một video", { money: -0.25, gamble: { p: 0.4, win: { money: 0.7, counters: { ecm_rep: 1 }, log: "Video lan khắp nơi. Bạn hết hàng trong hai ngày." }, lose: { happy: -2, log: "Video có nhiều lượt xem, nhưng chỉ ra hai mươi đơn." } } }, "Có thể bùng nổ, thường là không"),
    C("Đề nghị trả theo phần trăm mỗi đơn bán được", { gamble: { p: 0.5, win: { money: 0.2, flags: ["ecm_affiliate"], log: "Họ đồng ý. Hai bên làm với nhau ba năm." }, lose: { happy: -1, log: "Họ cười và nhận lời shop khác." } } }, "Không mất gì, có thể bị từ chối", { tier: "awakened" }),
    C("Bỏ qua, tự quay video của mình", { counters: { ecm_rep: 1 }, bw: -3 }, "Chậm, không tốn tiền")], 1)),
  daily(EC, "ecm_copycat", [18, 65], 8, (c, N) => {
    const r = role(c, "rival")!;
    return T("Ảnh của mình trên shop người khác", `Shop của ${N(r)} dùng nguyên ảnh của bạn, chụp ở đúng góc phòng bạn, bán rẻ hơn một phần tư. Khách nhầm, nhắn hỏi bạn sao hàng giao chậm thế.`, [
      C("Báo sàn gỡ, đóng dấu lên mọi ảnh", { flags: ["ecm_watermark"], bw: -3, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "bị báo sàn gỡ ảnh lấy của người khác" } }, "Mất công, chặn được lần này"),
      C("Hạ giá thấp hơn họ", { money: -0.1, income_mult: 0.95 }, "Giữ khách, cả hai cùng nghèo đi"),
      C("Nhắn rủ họ bán hàng của bạn, lấy hoa hồng", { gamble: { p: 0.45, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "từ lấy ảnh của nhau sang bán hàng chung" }, income_mult: 1.1, log: "Họ đồng ý. Giờ họ là đại lý chăm nhất của bạn." }, lose: { happy: -1, log: "Họ chặn bạn." } } }, "Biến kẻ chép thành đại lý, có thể bị chặn", { tier: "sovereign" })], 0, { npc: r });
  }, (c) => !!role(c, "rival")),
  daily(EC, "ecm_staff", [18, 65], 10, () => T("Người đóng gói đầu tiên", "Bạn cần người đóng gói. Một chị hàng xóm nuôi con một mình xin làm, chậm nhưng cẩn thận. Một người khác nhanh gấp đôi, đòi trả tiền mặt, không ký giấy tờ gì.", [
    C("Nhận chị hàng xóm, ký hợp đồng, đóng bảo hiểm", { flags: ["ecm_fair_employer"], counters: { ecm_rep: 1 }, income_mult: 0.94, rel: 3 }, "Tốn hơn, có một người tận tụy"),
    C("Nhận người nhanh, trả tiền mặt", { flags: ["ecm_cash_staff"], money: 0.04 }, "Rẻ, nhanh, không ràng buộc cả hai chiều"),
    C("Tự làm tiếp, chưa thuê ai", { money: 0.02, health: -3 }, "Giữ tiền, giữ luôn mọi việc")], 0)),
  daily(EC, "ecm_scamcall", [18, 70], 9, () => T("Cuộc gọi tự xưng từ sàn", "Một người gọi tự xưng nhân viên sàn, đọc đúng tên shop và doanh thu tháng trước. Họ nói tiền của bạn đang bị treo, cần bạn đọc mã xác nhận vừa gửi về điện thoại để mở khóa.", [
    C("Đọc mã cho nhanh", { gamble: { p: 0.15, win: { log: "Hóa ra là cuộc gọi thật. Sàn vẫn nhắc bạn không được đọc mã cho ai." }, lose: { money: -0.35, flags: ["ecm_scammed"], log: "Mười phút sau tài khoản của shop trống trơn." } } }, "Nhanh gọn, có thể mất sạch"),
    C("Cúp máy, gọi tổng đài chính thức", { flags: ["ecm_wary"], bw: -1 }, "Mất mười phút, giữ được tiền"),
    C("Cúp máy, đăng cảnh báo cho các shop khác", { counters: { ecm_rep: 1 }, rel: 2, bw: -2 }, "Tốn chút thời gian, có thêm người quen", { tier: "awakened" })], 1)),
  daily(EC, "ecm_storage", [18, 65], 8, (c) => T("Ngủ giữa ba trăm thùng hàng", vary("ecms", c.age, ["Ba trăm thùng hàng chồng đến trần, bạn ngủ trên một khoảng nệm giữa chúng. Chủ nhà đến thu tiền, nhìn ổ điện và nhíu mày.", "Kho hàng là căn phòng duy nhất trong nhà. Mỗi sáng bạn phải dời mười thùng mới mở được cửa sổ."]), [
    C("Thuê một kho nhỏ", { flags: ["ecm_warehouse"], money: -0.12, health: 2, bw: 2 }, "Thêm chi phí cố định, có lại phòng ngủ"),
    C("Gửi hàng vào kho dịch vụ của sàn", { flags: ["ecm_platform_bound"], income_mult: 0.95, bw: 4 }, "Nhẹ người, sàn nắm thêm một sợi dây"),
    C("Để nguyên như thế", { money: 0.02, gamble: { p: 0.6, win: { health: -1, log: "Không có gì xảy ra. Chỉ là lưng bạn đau hơn." }, lose: { money: -0.1, health: -2, log: "Chủ nhà đòi lại phòng sau một lần chập điện. Bạn chuyển nhà trong ba ngày." } } }, "Không tốn gì, ngồi trên một đống rủi ro")], 2)),

  /* ---------- gia đình ---------- */
  cross(EC, "ecm_family", [20, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} lọt vào khung hình`, `Một lần ${N(k)} vô tình đi ngang lúc bạn đang livestream, người xem thích đến mức đơn tăng gấp đôi. Giờ ai cũng hỏi "bạn nhỏ hôm trước đâu". ${N(k)} thì đang ôn thi.`, [
      C(`Trả công, mời ${N(k)} lên sóng mỗi cuối tuần`, { money: 0.08, flags: ["ecm_kid_on_air"], gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.1 }, log: `${N(k)} thích được trả công, còn tự nghĩ ra cách chào khách.` }, lose: { trust: { npc: k, delta: -0.25 }, log: `${N(k)} bị bạn bè ở trường nhận mặt và trêu, rồi xin thôi.` } } }, "Đơn tăng, con bị nhận mặt ở trường"),
      C("Giữ con ngoài khung hình", { trust: { npc: k, delta: 0.15 }, income_mult: 0.97 }, "Bỏ một chiêu bán hàng, con có đời riêng"),
      C(`Hỏi ${N(k)} muốn gì, cùng viết ra điều kiện`, { trust: { npc: k, delta: 0.25 }, bw: -2, promise: { to: k, what: "chỉ cho con lên sóng khi con muốn, và chia đúng phần công", years: 2 } }, "Mất công thương lượng, con được quyết", { tier: "sovereign" })], 1, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(`${N(p)} muốn bán hàng cùng`, `${N(p)} gửi lên ${vn(c) ? "mấy chục hũ mắm và mứt nhà làm theo xe khách" : "mấy chục hũ mứt nhà làm"}, nhờ bạn bán trên shop. "Cho bố mẹ có việc mà làm." Mỗi hũ một kiểu nhãn viết tay.`, [
      C("Bán thật, làm nhãn đẹp, chia đủ tiền", { trust: { npc: p, delta: 0.3 }, bw: -3, gamble: { p: 0.5, win: { money: 0.05, log: `Mứt của ${N(p)} hết sau một buổi lên sóng. Khách xin thêm.` }, lose: { happy: -1, log: "Bán được một nửa. Bạn mua nốt phần còn lại, không nói với ai." } } }, "Mất công, bố mẹ vui"),
      C("Nhận cho vui, để ở góc shop", { trust: { npc: p, delta: 0.05 }, happy: -1 }, "Không phiền, cũng không ai nhìn thấy"),
      C("Từ chối, sợ ảnh hưởng uy tín shop", { trust: { npc: p, delta: -0.2 }, memory: { npc: p, tag: "REFUSED_HELP", weight: -0.15, note: "không bán giúp mấy hũ mứt nhà làm" } }, "Shop gọn gàng, bố mẹ tủi thân")], 0, { npc: p });
  }),

  /* ================= NHÂN VIÊN NGÂN HÀNG (bnk_) ================= */

  /* ---------- năng khiếu ---------- */
  talent(BK, "bnk_t_fund", [10, 16], () => true, () => T("Quỹ lớp khớp từng đồng", "Ba năm liền bạn giữ quỹ lớp, cuối năm khớp đến từng đồng lẻ, sổ ghi bằng hai màu mực. Thầy chủ nhiệm muốn bạn giữ luôn quỹ dã ngoại của cả khối, hơn ba trăm học sinh.", [
    C("Nhận giữ quỹ cả khối", { flags: [talentFlag(BK)], counters: { talents_seen: 1 }, bw: -3, know: 2 }, "Học cách giữ tiền người khác, mất giờ chơi"),
    C("Từ chối, quỹ lớp là đủ rồi", { counters: { talents_seen: 1 }, happy: 1 }, "Nhẹ đầu, để người khác lo")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(BK, "bnk_d_exam", [22, 35], (c) => c.has_degree || c.know >= 50, (c) => T("Hai nghìn người cho bốn mươi chỗ", `Một ngân hàng lớn tuyển bốn mươi chuyên viên, hai nghìn hồ sơ nộp vào. ${vn(c) ? `Người quen của dì bạn nói có thể "gửi gắm" một hồ sơ, giá bằng nửa năm lương.` : "Một người quen nói có thể đưa hồ sơ đi cửa sau, kèm một khoản phí bằng nửa năm lương."}`, [
    C("Ôn thi ba tháng, bỏ việc làm thêm", { counters: { doors_seen: 1 }, money: -0.05, gamble: { p: 0.4, win: { ...become(BK), log: "Bạn đỗ thứ mười hai. Tên bạn in trên tờ danh sách dán ở sảnh." }, lose: { happy: -3, know: 3, log: "Bạn trượt ba điểm. Những gì đã ôn vẫn còn đó." } } }, "Đi bằng sức mình, có thể trượt"),
    C(vn(c) ? `Trả tiền để được "gửi gắm"` : "Trả phí để đi cửa sau", { ...become(BK), counters: { doors_seen: 1 }, money: -0.5, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [3, 12], note: "trả tiền để chạy một suất vào ngân hàng" } }, "Chắc chỗ, mang theo một bí mật"),
    C("Thôi, đi đường khác", { counters: { doors_seen: 1 } }, "Không mất gì, không có gì")], 0)),
  door(BK, "bnk_d_counter", [22, 40], () => true, () => T("Quầy giao dịch số ba", "Chi nhánh ngân hàng gần nhà cần người ngồi quầy, hợp đồng một năm, lương cơ bản thấp, cộng thưởng theo chỉ tiêu bán thẻ và bảo hiểm. Chưa phải công việc trong mơ, nhưng là một cánh cửa.", [
    C("Nhận, chấp nhận chỉ tiêu", { ...become(BK), counters: { doors_seen: 1 }, happy: -1 }, "Vào được nghề, bắt đầu từ chỗ thấp nhất"),
    C("Chỉ nhận nếu được vào phòng tín dụng", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(BK), flags: ["bnk_analyst"], log: "Trưởng phòng tín dụng thích sự thẳng thắn của bạn và nhận bạn." }, lose: { happy: -1, log: "Họ cảm ơn và gọi người tiếp theo." } } }, "Đòi đúng chỗ mình muốn, có thể mất chỗ", { tier: "sovereign" }),
    C("Từ chối, giữ việc cũ", { counters: { doors_seen: 1 } }, "Không đổi gì")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(BK, 1, 1, (c) => T("Chỉ tiêu tháng đầu", `${f(c, "bnk_analyst") ? "Dù ngồi phòng tín dụng, bạn vẫn có chỉ tiêu bán như mọi người." : "Bảng chỉ tiêu dán ngay cạnh máy chấm công."} Tháng này: hai mươi thẻ tín dụng, năm hợp đồng bảo hiểm. Chị trưởng nhóm chỉ cách: mời các cụ đến gửi tiết kiệm chuyển sang "gói gửi tiền lãi cao", không cần nói rõ đó là bảo hiểm mười lăm năm.`, [
    C("Bán theo cách chị trưởng nhóm chỉ", { counters: step(c, BK, { bnk_kpi: 2 }), flags: ["bnk_missold"], income_mult: 1.2 }, "Đạt chỉ tiêu, có cụ sẽ không rút được tiền"),
    C("Giải thích đủ, chấp nhận thiếu chỉ tiêu", { counters: step(c, BK, { bnk_clean: 2 }), income_mult: 0.95, happy: 1 }, "Lương thấp, bị nhắc tên trong cuộc họp"),
    C("Chỉ bán cho người hiểu sản phẩm, kèm bảng so sánh", { counters: step(c, BK, { bnk_clean: 1, bnk_kpi: 1 }), flags: ["bnk_plain_sheet"], bw: -4 }, "Mất công gấp đôi, ai mua cũng hiểu", { tier: "sovereign" })], 1), adult),
  beat(BK, 2, 3, (c, N) => {
    const b = role(c, "first_boss");
    return T("Hồ sơ định giá gấp đôi", `${b ? N(b) : "Giám đốc chi nhánh"} đặt lên bàn bạn một hồ sơ vay lớn của một công ty do người nhà ${b ? N(b) : "giám đốc"} đứng tên. Mảnh đất thế chấp được định giá gấp đôi giá thị trường. "Em chỉ cần ký phần thẩm định, phần còn lại để tôi lo."${cnt(c, "bnk_kpi") >= 2 ? " Bạn đang là người bán giỏi nhất chi nhánh, và ai cũng biết vì sao." : ""}`, [
      C("Ký", { counters: step(c, BK, { bnk_kpi: 1 }), flags: ["bnk_signed"], income_mult: 1.4, ...(b ? { trust: { npc: b, delta: 0.25 } } : {}) }, "Lên chức nhanh, chữ ký của bạn nằm lại trong hồ sơ"),
      C("Từ chối bằng văn bản", { counters: step(c, BK, { bnk_clean: 2 }), flags: ["bnk_refused"], income_mult: 0.9, ...(b ? { memory: { npc: b, tag: "REFUSED_HELP", weight: -0.3, note: "từ chối ký hồ sơ vay của người nhà" } } : {}) }, "Sạch tay, bị đẩy ra quầy xa nhất"),
      C("Ký, kèm ý kiến bảo lưu gửi thẳng hội sở", { counters: step(c, BK, { bnk_clean: 1 }), flags: ["bnk_dissent"], agency: 0.02, gamble: { p: 0.5, win: { log: "Hội sở yêu cầu định giá lại. Hồ sơ bị trả về, không ai nói gì với bạn." }, lose: { income_mult: 0.85, ...(b ? { memory: { npc: b, tag: "BETRAYED_PARTNERSHIP", weight: -0.35, note: "gửi ý kiến bảo lưu vượt cấp lên hội sở" } } : {}), log: "Văn bản của bạn nằm im ở hội sở. Ở chi nhánh, ai cũng biết bạn đã làm gì." } } }, "Có dấu vết bảo vệ mình, có thể thành kẻ phản", { tier: "sovereign" })], 0, b ? { npc: b } : {});
  }, adult),
  beat(BK, 3, 4, (c, N) => {
    const b = role(c, "first_boss");
    if (f(c, "bnk_signed")) return T("Khoản vay năm ấy thành nợ xấu", `Công ty năm ấy ngừng trả nợ. Mảnh đất thế chấp bán không được một nửa giá định. Thanh tra đang đọc từng chữ ký. ${b ? N(b) : "Giám đốc cũ"} hẹn bạn ra quán cà phê: "Em cứ nói là em tự thẩm định, sau này tôi lo cho em."`, [
      C("Nhận một mình như được dặn", { counters: step(c, BK), flags: ["bnk_scapegoat"], ...(b ? { trust: { npc: b, delta: 0.3 } } : {}), gamble: { p: 0.4, win: { income_mult: 0.8, log: "Bạn bị kỷ luật, chuyển sang phòng khác. Lời hứa lo cho bạn không bao giờ được nhắc lại." }, lose: { ...leave(BK), close_doors: ["clean_record"], log: "Bạn bị đuổi việc và bị khởi tố vì thiếu trách nhiệm." } } }, "Che cho người khác, có thể mất tất cả"),
      C("Khai thật với thanh tra, nộp lại mọi email", { counters: step(c, BK, { bnk_clean: 2 }), flags: ["bnk_witness"], income_mult: 0.85, bw: -6, ...(b ? { memory: { npc: b, tag: "BETRAYED_PARTNERSHIP", weight: -0.5, note: "khai hết với thanh tra về khoản vay năm ấy" } } : {}) }, "Nhẹ tội, mang tiếng chỉ điểm", { tier: "awakened" }),
      C("Xin nghỉ trước khi họ gọi tên", { counters: step(c, BK), ...leave(BK), happy: -3 }, "Rời đi im lặng, hồ sơ vẫn còn đó")], 1, b ? { npc: b } : {});
    return T("Hàng người trước cửa chi nhánh", `Một tin đồn trên mạng nói ngân hàng của bạn sắp đổ. Sáu giờ sáng, hàng người đã kéo dài qua hai dãy phố. Hội sở nhắn: chỉ được nói "mọi thứ ổn", làm thủ tục chậm lại.${f(c, "bnk_missold") ? ` Trong hàng có một cụ bà bạn từng bán "gói gửi tiền lãi cao".` : ""}`, [
      C("Làm đúng kịch bản hội sở", { counters: step(c, BK, { bnk_kpi: 1 }), flags: ["bnk_loyal"], income_mult: 1.1, happy: -3 }, "Giữ việc, nói những điều bạn không chắc"),
      C("Nói thật điều mình biết, giải thích quyền của khách", { counters: step(c, BK, { bnk_clean: 2 }), flags: ["bnk_truthful"], gamble: { p: 0.55, win: { rel: 4, log: "Hàng người tan dần khi trưa đến. Vài khách quay lại gửi tiền chỉ vì bạn." }, lose: { ...leave(BK), log: "Đoạn bạn nói bị quay lại, cắt ghép. Bạn bị cho nghỉ việc." } } }, "Đúng với khách, có thể mất việc"),
      C("Nghỉ việc, rút luôn tiền của mình", { counters: step(c, BK), ...leave(BK), money: 0.05 }, "An toàn cho mình, bỏ đồng nghiệp giữa bão")], 0);
  }, adult),
  beat(BK, 4, 5, (c) => {
    const clean = cnt(c, "bnk_clean") >= 3 || f(c, "bnk_witness") || f(c, "bnk_truthful");
    if (f(c, "bnk_missold") && !clean) return T("Đơn kiện của những người già", "Ba mươi khách hàng lớn tuổi cùng đứng đơn kiện ngân hàng vì bị bán bảo hiểm như gửi tiết kiệm. Tên bạn có trong mười một hợp đồng. Ngân hàng muốn bạn ký bản tường trình rằng khách đã được giải thích đầy đủ.", [
      C("Ký bản tường trình", { counters: step(c, BK, { bnk_kpi: 1 }), flags: ["bnk_false_statement"], income_mult: 1.1, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 8], note: "ký tường trình sai về những hợp đồng bảo hiểm bán cho người già" } }, "Giữ việc, thêm một lời nói dối có chữ ký"),
      C("Ra làm chứng cho những người đi kiện", { counters: step(c, BK, { bnk_clean: 2 }), ...leave(BK), custom: "job_lose|apologize", flags: ["bnk_whistle"], rel: 4, agency: 0.03 }, "Mất việc, trả được một phần món nợ lương tâm", { tier: "sovereign" }),
      C("Xin chuyển sang bộ phận khác, im lặng", { counters: step(c, BK), income_mult: 0.9, happy: -3 }, "Tránh được bão, không tránh được mình")], 0);
    if (clean) return T("Ghế giám đốc chi nhánh", "Sau những năm ấy, người ta nhớ bạn là người không ký bừa. Hội sở mời bạn làm giám đốc chi nhánh, kèm chỉ tiêu tăng trưởng gấp rưỡi. Cùng lúc, một tổ chức tài chính vi mô mời bạn về điều hành mảng cho vay hộ nghèo, lương bằng một nửa.", [
      C("Nhận ghế giám đốc chi nhánh", { counters: step(c, BK), flags: ["bnk_director"], income_mult: 1.5, bw: -5 }, "Quyền lớn, chỉ tiêu lớn, hồ sơ khó lại đến bàn bạn"),
      C("Về điều hành mảng cho vay vốn nhỏ", { counters: step(c, BK, { bnk_clean: 1 }), flags: ["bnk_microfinance"], income_mult: 0.6, happy: 5, agency: 0.03 }, "Lương một nửa, mỗi khoản vay là một gia đình", { tier: "sovereign" }),
      C("Nghỉ ngân hàng, tự quản lý tiền của mình", { counters: step(c, BK), ...leave(BK), custom: `become:${IV}` }, "Tự do, không còn lương tháng")], 0);
    return T("Chi nhánh sắp đóng cửa", "Ngân hàng chuyển hết sang ứng dụng; chi nhánh của bạn và bốn chi nhánh khác sẽ đóng. Bạn được chọn: học lại để sang phòng dữ liệu, hoặc nhận gói nghỉ việc bằng hai năm lương.", [
      C("Học lại từ đầu, sang phòng dữ liệu", { counters: step(c, BK), flags: ["bnk_retrained"], know: 6, bw: -6, income_mult: 1.1 }, "Già nhất lớp, giữ được nghề"),
      C("Nhận gói nghỉ việc", { counters: step(c, BK), ...leave(BK), money: 1.5 }, "Một khoản lớn, hết nghề ngân hàng"),
      C("Đề xuất giữ chi nhánh làm điểm tư vấn cho người già", { counters: step(c, BK, { bnk_clean: 1 }), flags: ["bnk_elder_desk"], agency: 0.02, gamble: { p: 0.35, win: { log: "Hội sở đồng ý thử một năm. Bàn tư vấn của bạn lúc nào cũng có người ngồi chờ." }, lose: { ...leave(BK), money: 1, log: "Đề xuất bị bác. Bạn nhận gói nghỉ việc muộn hơn mọi người một tháng." } } }, "Có thể giữ được một chỗ cho người chậm chân", { tier: "sovereign" })], 0);
  }, adult),
  beat(BK, 5, 6, (c) => T("Hồ sơ trên bàn người trẻ", `Một chuyên viên trẻ mang đến cho bạn một hồ sơ, tay hơi run: tài sản thế chấp định giá cao bất thường, người ký duyệt là sếp của em ấy. ${f(c, "bnk_signed") ? "Bạn nhận ra chính mình nhiều năm trước, ngay trước quyết định đã đổi cả đời." : f(c, "bnk_refused") || f(c, "bnk_dissent") ? "Bạn nhớ ngày mình từ chối một hồ sơ y hệt." : "Bạn hiểu em ấy đang hỏi điều gì."}`, [
    C("Kể thật chuyện của mình, để em ấy tự chọn", { counters: step(c, BK), flags: ["bnk_told_story"], rel: 3, happy: 2 }, "Không dạy đời, chỉ đưa một tấm gương", { tier: "awakened" }),
    C("Khuyên em ấy ký cho yên chuyện", { counters: step(c, BK, { bnk_kpi: 1 }), happy: -2 }, "Giữ người trẻ an toàn hôm nay"),
    C("Viết lại quy trình thẩm định cho cả hệ thống", { counters: step(c, BK, { bnk_clean: 1 }), flags: ["bnk_new_rules"], bw: -6, agency: 0.03 }, "Mất một năm họp hành, chặn được nhiều hồ sơ", { tier: "sovereign" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(BK, "bnk_short", [22, 65], 7, (c) => T("Két thiếu tiền cuối ngày", vary("bnks", c.age, ["Năm giờ chiều kiểm két, thiếu một khoản bằng nửa tháng lương của bạn. Quy định: giao dịch viên tự bù.", "Cuối ngày kiểm két thiếu một khoản. Người ngồi quầy bên cạnh hôm nay về sớm hơn mọi khi."]), [
    C("Báo lên, đề nghị xem lại camera", { counters: { bnk_clean: 1 }, bw: -3, gamble: { p: 0.6, win: { log: "Camera cho thấy một xấp tiền kẹt dưới máy đếm." }, lose: { money: -0.04, log: "Không tìm ra. Bạn vẫn phải bù, và bị ghi một lỗi." } } }, "Đúng quy trình, phiền và có thể vô ích"),
    C("Tự bù tiền túi, không nói với ai", { flags: ["bnk_quiet_fix"], money: -0.04 }, "Nhanh gọn, không ai biết két từng lệch")], 0)),
  daily(BK, "bnk_cards", [22, 65], 8, () => T("Bàn mở thẻ ở cổng trường", "Chi nhánh dựng bàn mở thẻ tín dụng ở cổng một trường đại học, tặng bình nước cho mỗi thẻ. Chỉ tiêu của bạn là năm mươi thẻ trong ba ngày. Phần lớn sinh viên chưa có thu nhập.", [
    C("Mở càng nhiều càng tốt", { counters: { bnk_kpi: 2 }, flags: ["bnk_student_cards"], money: 0.05 }, "Đạt thưởng, có người sẽ nợ từ năm hai mươi tuổi"),
    C("Ngồi giải thích lãi suất cho từng người", { counters: { bnk_clean: 1 }, money: -0.02 }, "Thiếu chỉ tiêu, ít người phải hối hận"),
    C("Đề xuất đổi sang thẻ trả trước hạn mức thấp", { counters: { bnk_clean: 1, bnk_kpi: 1 }, gamble: { p: 0.4, win: { flags: ["bnk_prepaid_idea"], log: "Hội sở áp dụng cho mọi đợt mở thẻ ở trường học." }, lose: { happy: -1, log: "Trưởng phòng gạt đi: chỉ tiêu là thẻ tín dụng." } } }, "Có thể đổi luật chơi, có thể bị gạt đi", { tier: "sovereign" })], 0)),
  daily(BK, "bnk_cash", [22, 65], 10, () => T("Những khoản tiền mặt đều đặn", "Một khách lớn của chi nhánh tuần nào cũng nộp những khoản tiền mặt rất lớn, mỗi lần giải thích nguồn gốc một kiểu. Quy định buộc bạn báo cáo giao dịch đáng ngờ. Khách này là bạn thân của giám đốc.", [
    C("Lập báo cáo đúng quy định", { counters: { bnk_clean: 2 }, flags: ["bnk_reported"], income_mult: 0.95 }, "Đúng luật, mất lòng người có quyền"),
    C("Coi như không thấy", { flags: ["bnk_looked_away"], gamble: { p: 0.65, win: { money: 0.03, log: "Giám đốc khen bạn biết việc. Không ai hỏi gì." }, lose: { ...leave(BK), close_doors: ["clean_record"], log: "Cơ quan điều tra phong tỏa tài khoản ấy. Tên bạn có trong danh sách người xử lý." } } }, "Yên ổn hôm nay, có thể mất cả nghề")], 0)),
  daily(BK, "bnk_elder", [22, 65], 9, () => T("Cụ bà rút hết sổ tiết kiệm", `Một cụ bà run run xin rút toàn bộ sổ tiết kiệm, nói cháu trai đang "gặp chuyện ở đồn công an" và có người gọi điện bảo chuyển tiền gấp. Cụ không muốn bạn hỏi thêm.`, [
    C("Làm thủ tục, đó là quyền của khách", { gamble: { p: 0.2, win: { log: "Hóa ra cháu cụ gặp chuyện thật. Cụ cảm ơn bạn." }, lose: { happy: -4, flags: ["bnk_regret_elder"], log: "Tuần sau cụ quay lại, khóc ở sảnh. Số tiền đã mất." } } }, "Đúng thủ tục, có thể nhìn một người mất trắng"),
    C("Giữ cụ lại, gọi cho người nhà", { counters: { bnk_clean: 1 }, bw: -3, gamble: { p: 0.75, win: { rel: 3, log: "Cháu cụ đang đi học bình thường. Cụ ngồi ở sảnh rất lâu mới về." }, lose: { happy: -1, log: "Cụ khiếu nại bạn tự tiện. Trưởng phòng nhắc nhở bạn." } } }, "Có thể cứu một đời dành dụm, có thể bị khiếu nại", { tier: "awakened" })], 1)),
  daily(BK, "bnk_quarter", [22, 65], 7, (c) => T("Đêm cuối quý", vary("bnkq", c.age, ["Ngày cuối quý, cả phòng ở lại đến mười một giờ đêm cho số liệu đẹp. Trưởng phòng gọi thêm đồ ăn và nói không ai được về trước.", "Cuối quý, bạn được giao gọi cho ba trăm khách cũ mời gửi tiền. Đến cuộc thứ hai trăm, giọng bạn đã không còn là của mình."]), [
    C("Ở lại đến cùng", { counters: { bnk_kpi: 1 }, money: 0.02, health: -3, rel: -2 }, "Được ghi nhận, nhà vắng bạn thêm một tối"),
    C("Làm xong phần mình rồi về", { counters: { bnk_kpi: -1 }, rel: 2 }, "Có bữa tối, mất điểm với trưởng phòng")], 0)),
  daily(BK, "bnk_shop", [22, 65], 9, (c, N) => {
    const nb = role(c, "neighbor");
    return T("Khoản vay của tiệm tạp hóa", `${nb ? N(nb) : "Một chủ tiệm tạp hóa"} vay chi nhánh để mở rộng tiệm, giờ trễ hạn ba kỳ vì con đường trước tiệm bị rào lại để sửa. Quy trình nói: chuyển sang xử lý tài sản thế chấp, tức căn nhà phía sau tiệm.`, [
      C("Làm đúng quy trình", { counters: { bnk_kpi: 1 }, ...(nb ? { memory: { npc: nb, tag: "TOOK_MY_LAND", weight: -0.4, note: "chuyển hồ sơ vay sang xử lý căn nhà sau tiệm" } } : { happy: -2 }) }, "Sổ sách sạch, một gia đình mất nhà"),
      C("Lập phương án giãn nợ, ký tên mình vào", { counters: { bnk_clean: 1 }, flags: ["bnk_vouched"], bw: -4, gamble: { p: 0.6, win: { ...(nb ? { memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "giãn nợ cho tiệm lúc đường bị rào" } } : { rel: 2 }), log: "Đường thông lại. Tiệm trả đủ trong hai năm." }, lose: { income_mult: 0.9, log: "Tiệm vẫn không gượng dậy được. Hồ sơ của bạn bị ghi một vết." } } }, "Cứu được người, đặt cược lý lịch của bạn", { tier: "sovereign" }),
      C("Cho mượn tiền túi trả một kỳ", { money: -0.08, ...(nb ? { trust: { npc: nb, delta: 0.25 } } : { rel: 1 }) }, "Câu thêm thời gian, mất tiền mình")], 0, nb ? { npc: nb } : {});
  }),
  daily(BK, "bnk_poach", [24, 60], 10, () => T("Lời mời kèm một điều kiện", "Một ngân hàng đối thủ mời bạn về với lương cao hơn ba phần mười, cùng một điều kiện không viết ra giấy: mang theo danh sách khách hàng lớn của bạn.", [
    C("Đi, mang theo danh sách", { flags: ["bnk_took_list"], income_mult: 1.3, close_doors: ["partner_circle"] }, "Lương cao, cả nghề biết bạn đã làm gì"),
    C("Đi, chỉ mang theo chính mình", { income_mult: 1.1, gamble: { p: 0.5, win: { flags: ["bnk_clean_move"], log: "Sau một năm, nửa số khách cũ tự tìm đến bạn." }, lose: { income_mult: 0.9, log: "Ngân hàng mới thất vọng. Bạn bị xếp vào quầy xa nhất." } } }, "Sạch sẽ, bên mới có thể thất vọng"),
    C("Ở lại, đem lời mời ra thương lượng", { gamble: { p: 0.5, win: { income_mult: 1.15, log: "Sếp tăng lương cho bạn ngay trong tuần." }, lose: { counters: { bnk_kpi: -1 }, log: "Sếp nói cửa ra luôn mở. Từ đó bạn bị nhìn như người sắp đi." } } }, "Có thể được tăng lương, có thể mất lòng sếp")], 1)),
  daily(BK, "bnk_gift", [22, 65], 9, (c) => T("Hộp quà sau khi giải ngân", `Một tuần sau khi khoản vay được giải ngân, khách gửi đến nhà bạn một hộp quà. ${vn(c) ? "Bên dưới lớp bánh trung thu là một phong bì dày." : "Bên dưới chai rượu đắt tiền là một phong bì dày."} Không ai ở chi nhánh biết.`, [
    C("Gửi trả nguyên vẹn, kèm lời cảm ơn", { counters: { bnk_clean: 1, honest: 1 } }, "Mất món quà, khách hiểu bạn là người thế nào"),
    C("Nhận, coi như lộc", { money: 0.1, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 9], note: "nhận phong bì của khách sau khi giải ngân khoản vay" } }, "Có thêm tiền, có người giữ một sợi dây"),
    C("Nộp lên bộ phận tuân thủ bằng văn bản", { counters: { bnk_clean: 2 }, flags: ["bnk_declared_gift"], rel: -1 }, "Đúng tuyệt đối, đồng nghiệp thấy bạn khó gần", { tier: "awakened" })], 0)),
  daily(BK, "bnk_cut", [26, 65], 10, () => T("Hai cái tên trong sáu người", "Hội sở yêu cầu mỗi nhóm cắt giảm một phần ba. Bạn phải nộp hai cái tên trong sáu người của nhóm trước thứ sáu. Một người sắp sinh con; một người làm kém nhất nhưng đang nuôi mẹ già.", [
    C("Chọn theo hiệu suất, không nhìn hoàn cảnh", { counters: { bnk_kpi: 1 }, rel: -3, happy: -2 }, "Công bằng trên giấy, khó nhìn mặt nhau"),
    C("Chọn người ít gánh nặng gia đình nhất", { counters: { bnk_kpi: -1 }, rel: 1, happy: -1 }, "Thương người, nhóm yếu đi"),
    C("Đề xuất cả nhóm giảm lương để không ai phải đi", { flags: ["bnk_shared_cut"], income_mult: 0.85, agency: 0.03, gamble: { p: 0.45, win: { rel: 5, log: "Hội sở chấp nhận. Sáu người còn nguyên, nghèo đi một chút." }, lose: { happy: -3, log: "Hội sở từ chối và tự chọn hai cái tên. Một trong đó là người bạn muốn giữ nhất." } } }, "Bạn mất trước, có thể không cứu được ai", { tier: "sovereign", longterm: true })], 0)),
  daily(BK, "bnk_dormant", [22, 65], 10, () => T("Tài khoản ngủ quên", "Đối chiếu sổ cuối năm, bạn thấy một tài khoản mười năm không ai đụng tới bỗng có vài lần rút nhỏ. Mã người duyệt là của đồng nghiệp ngồi cạnh, người từng trực thay bạn suốt tuần bạn ốm.", [
    C("Báo ngay lên kiểm soát nội bộ", { counters: { bnk_clean: 2 }, flags: ["bnk_reported_colleague"], rel: -3 }, "Đúng quy định, mất một người bạn"),
    C("Gặp riêng, cho một tuần để trả lại", { flags: ["bnk_gave_chance"], gamble: { p: 0.5, win: { rel: 2, log: "Tiền được trả lại đủ trước hạn. Người ấy xin nghỉ một tháng sau." }, lose: { close_doors: ["clean_record"], log: "Kiểm toán phát hiện trước. Bạn bị hỏi vì sao biết mà không báo." } } }, "Cho người ta đường lùi, tự đặt mình vào rủi ro", { tier: "awakened" }),
    C("Làm như không thấy gì", { flags: ["bnk_saw_nothing"], happy: -2 }, "Yên chuyện, nhưng bạn biết điều mình biết")], 0)),

  /* ---------- gia đình ---------- */
  cross(BK, "bnk_family", [22, 70], (c) => !!role(c, "sibling") || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const who = (role(c, "sibling") ?? role(c, "father") ?? role(c, "mother"))!;
    const biz = c.poor_country ? "cửa hàng vật liệu xây dựng" : "quán cà phê";
    return T("Người nhà xin một lời nói giúp", `${N(who)} muốn vay một khoản lớn để mở ${biz}. Hồ sơ yếu, thu nhập không đủ chứng minh. "Nhà mình có người làm trong đó mà, nói giúp một câu là được."`, [
      C("Nói giúp với phòng tín dụng", { trust: { npc: who, delta: 0.25 }, gamble: { p: 0.45, win: { log: `Hồ sơ được duyệt. ${N(who)} trụ được, trả nợ đúng hạn.` }, lose: { counters: { bnk_clean: -2 }, flags: ["bnk_family_default"], log: "Hai năm sau khoản vay thành nợ xấu. Tên bạn được nhắc trong biên bản họp." } } }, "Vui lòng nhà, đặt cược tên mình"),
      C("Từ chối, giải thích vì sao hồ sơ yếu", { counters: { bnk_clean: 1 }, memory: { npc: who, tag: "REFUSED_HELP", weight: -0.25, note: `không nói giúp hồ sơ vay mở ${biz}` } }, "Giữ nghề sạch, bữa cơm nhà nặng nề"),
      C("Ngồi cùng làm lại kế hoạch, vay nhỏ hơn", { trust: { npc: who, delta: 0.15 }, flags: ["bnk_coached_family"], bw: -4, promise: { to: who, what: "giúp làm lại kế hoạch kinh doanh cho đến khi đủ điều kiện vay", years: 1 } }, "Mất nhiều buổi tối, ra một hồ sơ thật", { tier: "sovereign" })], 2, { npc: who });
  }),
];
