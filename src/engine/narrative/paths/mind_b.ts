/**
 * Gói MIND_B: bác sĩ phẫu thuật · kỹ sư trí tuệ nhân tạo · kiến trúc sư · bác sĩ thú y.
 * Mỗi con đường: năng khiếu · 2 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Các nhịp sau đọc lại cờ và bộ đếm của nhịp trước (vd `bonded_district`, `signed_report`, `sur_name`),
 * nên khủng hoảng (b3) và đỉnh/vực (b4) khác nhau theo những gì người chơi đã chọn.
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

/* ================================================================ BÁC SĨ PHẪU THUẬT */
const SU = "surgeon";

const SURGEON: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SU, "sur_t_hands", [9, 14], () => true, (c) => T("Bàn tay không run", `Bà bạn đứt tay khi thái rau. Cả nhà cuống lên, chỉ có bạn nhớ lời cô giáo: ép chặt miếng vải sạch, giơ tay bà lên cao, giữ yên mười phút. Người y tá ở ${c.country === "VN" ? "trạm y tế phường" : "phòng khám đầu phố"} khen bàn tay bạn không hề run.`, [
    C("Xin sách sinh học, học thêm buổi tối", { money: -0.02, know: 3, flags: [talentFlag(SU)], counters: { talents_seen: 1 } }, "Bớt giờ chơi, mở cửa nghề y"),
    C("Kể cho vui rồi thôi", { happy: 1, counters: { talents_seen: 1 } })], 0)),
  talent(SU, "sur_t_heart", [12, 16], () => true, () => T("Trái tim bằng đất sét", "Hội thi khoa học của trường, bạn nặn một trái tim bốn ngăn bằng đất sét, van đóng mở bằng dây chun. Một bác sĩ trong ban giám khảo hỏi bạn làm mất bao lâu. Bạn nói ba tuần, mỗi tối sau giờ học.", [
    C("Vào lớp chuyên sinh, bỏ đội bóng", { know: 4, happy: -2, flags: [talentFlag(SU)], counters: { talents_seen: 1 } }, "Mất đội bóng, thêm một con đường"),
    C("Xin bác sĩ cho theo xem một buổi khám", { counters: { talents_seen: 1 }, gamble: { p: 0.5, win: { know: 2, flags: [talentFlag(SU)], log: "Bác sĩ cho bạn đứng ở góc phòng khám một buổi sáng. Bạn ghi kín hai trang vở." }, lose: { happy: -1, log: "Bác sĩ bận, hẹn bạn dịp khác, rồi quên." } } }, "Có thể mở cửa, có thể bị quên"),
    C("Giữ đội bóng, sinh học để sau", { happy: 2, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SU, "sur_d_resident", [24, 32], (c) => c.has_degree || f(c, "job_health") || f(c, talentFlag(SU)), (c) => T("Kỳ thi bác sĩ nội trú", `Bệnh viện ${c.poor_country ? "tuyến trung ương" : "đại học"} mở kỳ thi bác sĩ nội trú ngoại khoa: mười hai chỗ, gần hai trăm người dự. Đỗ thì sáu năm lương thấp, trực đêm cách ngày. Trượt thì mất một năm ôn.`, [
    C("Nghỉ việc, ôn thi cả năm", { counters: { doors_seen: 1 }, gamble: { p: 0.55, win: { ...become(SU), money: -0.25, log: "Tên bạn đứng thứ bảy trên bảng kết quả." }, lose: { money: -0.25, happy: -5, know: 3, log: "Bạn trượt hai điểm. Một năm ôn thi còn lại một chồng sách." } } }, "Mất một năm thu nhập, cược lấy nghề"),
    C("Vừa làm vừa ôn", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.25, win: { ...become(SU), log: "Bạn đỗ sát nút, chỗ cuối cùng." }, lose: { happy: -2, log: "Bạn trượt. Ít nhất công việc vẫn còn." } } }, "Giữ thu nhập, cơ hội mỏng"),
    C("Làm bác sĩ đa khoa, không thi", { counters: { doors_seen: 1 }, money: 0.05, happy: 1 }, "Có lương ngay, phòng mổ đóng lại")], 1)),
  door(SU, "sur_d_bond", [25, 35], (c) => c.has_degree || f(c, "job_health") || f(c, talentFlag(SU)), (c) => T("Bác sĩ ngoại duy nhất ngã bệnh", c.poor_country
    ? `${c.country === "VN" ? "Bệnh viện huyện" : "Bệnh viện thị trấn"} nơi bạn làm có ba trăm giường và đúng một bác sĩ ngoại. Ông ấy vừa nhập viện. Giám đốc đề nghị cử bạn đi học ngoại khoa ở thành phố, đổi lại bạn ký cam kết quay về làm năm năm.`
    : "Bệnh viện vùng ven biển nơi bạn làm thiếu bác sĩ ngoại suốt hai năm. Ban giám đốc trả toàn bộ chi phí đào tạo ngoại khoa, đổi lại bạn cam kết ở lại năm năm, xa thành phố và bạn bè.", [
    C("Ký cam kết, học xong về làm năm năm", { ...become(SU), counters: { doors_seen: 1 }, flags: ["bonded_district"], rel: -2 }, "Có nghề, đổi năm năm ở nơi xa"),
    C("Tự trả tiền học ở thành phố, không ràng buộc", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(SU), money: -0.4, log: "Bạn xin được một suất tự túc ở bệnh viện lớn." }, lose: { money: -0.05, happy: -3, log: "Năm đó không bệnh viện nào nhận người tự túc." } } }, "Tự do, tốn tiền, khó vào"),
    C("Ở lại làm việc đang làm", { counters: { doors_seen: 1 }, happy: 1 })], 2)),

  /* ---------- mạch truyện ---------- */
  beat(SU, 1, 1, (c) => T("Ca trực đầu tiên", `Ba giờ sáng, một người đàn ông được đưa vào với cơn đau bụng dữ dội. Bạn nghĩ đến ruột thừa vỡ. Bác sĩ trực chính không nghe máy, phòng mổ đang trống.${f(c, "bonded_district") ? " Ở bệnh viện xa này, không còn ai khác để gọi." : ""}`, [
    C("Gọi đến khi có người nghe máy", { counters: step(c, SU), flags: ["by_the_book"], bw: -3, gamble: { p: 0.75, win: { log: "Bác sĩ trực đến sau bốn mươi phút. Ca mổ ổn, bạn phụ mổ." }, lose: { happy: -4, log: "Chờ quá lâu, ca mổ khó hơn nhiều. Bệnh nhân nằm viện thêm hai tuần." } } }, "An toàn cho bạn, chậm cho bệnh nhân"),
    C("Tự mổ, ghi lại từng bước", { counters: step(c, SU), gamble: { p: 0.65, win: { flags: ["bold_hands"], counters: { sur_name: 1 }, happy: 5, log: "Ca mổ gọn. Sáng hôm sau trưởng khoa chỉ hỏi bạn đã ngủ chưa." }, lose: { flags: ["early_complication"], happy: -6, log: "Bệnh nhân qua khỏi nhưng phải mổ lại. Tên bạn được nêu trong buổi giao ban." } } }, "Cứu nhanh, hoặc mang một vết trong hồ sơ"),
    C("Chuyển bệnh nhân lên bệnh viện lớn hơn", { counters: step(c, SU), flags: ["transferred"], happy: -2 }, "Không phải quyết, bệnh nhân mất hai giờ đường")], 0)),
  beat(SU, 2, 3, (c, N) => { const m = role(c, "mentor"); const bonded = f(c, "bonded_district");
    return T("Kỹ thuật mới hay lương gấp đôi", `${m ? N(m) : "Trưởng khoa"} sắp làm ca mổ nội soi đầu tiên của bệnh viện và muốn bạn phụ, học trọn kỹ thuật mới. Cùng tuần đó, một bệnh viện tư mời bạn với lương gấp đôi, toàn ca dễ, có giờ về nhà. Thư báo đỗ một suất học một năm ở nước ngoài cũng vừa đến, tự túc.${f(c, "bold_hands") ? " Người ta bắt đầu nhắc tên bạn sau ca trực năm ấy." : ""}${bonded ? " Cam kết năm năm của bạn còn chưa hết." : ""}`, [
      C("Theo thầy, học kỹ thuật mới", { counters: step(c, SU, { sur_name: 1 }), income_mult: 1.15, know: 5, flags: ["mentor_line"], ...(m ? { trust: { npc: m, delta: 0.2 } } : {}) }, "Lương thấp hơn, nghề sâu hơn"),
      C("Sang bệnh viện tư", { counters: step(c, SU), income_mult: 1.7, flags: ["private_hospital"], ...(bonded ? { money: -0.3 } : {}) }, bonded ? "Tiền nhiều, phải bồi hoàn tiền cam kết" : "Tiền nhiều, ca dễ, ít học thêm"),
      C("Đi học nước ngoài một năm bằng tiền túi", { counters: step(c, SU), money: -0.5, know: 8, rel: -3, flags: ["trained_abroad"] }, "Tốn nửa năm thu nhập, về có nghề riêng", { longterm: true })], 0); }),
  beat(SU, 3, 4, (c) => { const priv = f(c, "private_hospital");
    return T("Biên bản sau ca mổ", `Một bệnh nhân của bạn mất hai ngày sau ca mổ vì một biến chứng hiếm. Gia đình làm đơn. ${priv ? "Giám đốc bệnh viện tư lo trước hết cho thương hiệu, đưa bạn tờ biên bản ghi lỗi do bác sĩ gây mê trực đêm." : "Phó giám đốc đưa sẵn tờ biên bản ghi lỗi do điều dưỡng theo dõi sai giờ."}${f(c, "early_complication") ? " Đây là lần thứ hai tên bạn nằm trong hồ sơ." : f(c, "bold_hands") ? " Lần này không ai nhắc đến sự gan dạ của bạn." : ""} Chỉ cần bạn ký.`, [
      C("Ký biên bản như bệnh viện muốn", { counters: step(c, SU), flags: ["signed_report"], secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 10], note: "ký biên bản đổ lỗi cho đồng nghiệp sau ca mổ" } }, "Giữ ghế, có người gánh thay bạn"),
      C("Viết đúng những gì đã xảy ra", { counters: step(c, SU), gamble: { p: 0.55, win: { flags: ["honest_record"], counters: { sur_name: 1 }, log: "Hội đồng chuyên môn kết luận đó là rủi ro không lường trước. Gia đình rút đơn." }, lose: { flags: ["suspended"], income_mult: 0.7, happy: -6, log: "Bạn bị đình chỉ phẫu thuật sáu tháng trong lúc chờ kết luận." } } }, "Đúng sự thật, có thể mất dao mổ"),
      C("Gặp gia đình, mở buổi rút kinh nghiệm công khai", { counters: step(c, SU), flags: ["open_review"], agency: 0.03, bw: -6, happy: -3, rel: 3 }, "Mất mặt trước khoa, đổi cách cả khoa làm việc", { tier: "sovereign" }),
      C("Treo dao mổ, chuyển sang khám ngoại trú", { ...leave(SU), counters: step(c, SU), flags: ["ex_surgeon"], income_mult: 0.7, happy: 2 }, "Ngủ được, bỏ lại nghề học mười năm")], 1); }),
  beat(SU, 4, 5, (c) => {
    if (f(c, "signed_report")) { const who = f(c, "private_hospital") ? "Bác sĩ gây mê" : "Người điều dưỡng";
      return T("Người gánh tội thay", `${who} bị ghi tên trong biên bản năm ấy đã mất việc. Giờ người ấy gửi đơn lên ${c.poor_country ? "cơ quan y tế" : "hội đồng y khoa"}, kèm lời khai của hai đồng nghiệp. Chín giờ tối, một phóng viên gọi cho bạn.`, [
        C("Nhận hết, xin lỗi công khai", { counters: step(c, SU), unflags: ["signed_report"], flags: ["confessed"], income_mult: 0.6, agency: 0.02, happy: 3 }, "Mất danh tiếng, trả lại tên cho người khác"),
        C("Thuê luật sư, giữ nguyên lời khai cũ", { counters: step(c, SU), money: -0.4, gamble: { p: 0.5, win: { flags: ["kept_silent"], log: "Vụ việc khép lại vì thiếu chứng cứ. Bạn vẫn mổ, nhưng ít ai trong khoa nói chuyện với bạn." }, lose: { income_mult: 0.5, flags: ["license_lost"], log: "Hội đồng thu hồi chứng chỉ hành nghề của bạn ba năm." } } }, "Tốn tiền, có thể giữ được nghề"),
        C("Âm thầm giúp người ấy tìm việc mới", { counters: step(c, SU), money: -0.15, flags: ["quiet_amends"] }, "Chuộc lỗi một nửa, bí mật vẫn còn")], 1);
    }
    if (f(c, "honest_record") || f(c, "open_review") || f(c, "suspended") || f(c, "mentor_line")) return T("Ghế trưởng khoa", `Bệnh viện mời bạn làm trưởng khoa ngoại.${f(c, "suspended") ? " Sáu tháng bị đình chỉ năm xưa giờ lại là lý do người ta tin bạn." : ""}${(c.counters.sur_name ?? 0) >= 3 ? " Bệnh nhân từ những vùng rất xa xin được chính bạn mổ." : ""} Kèm theo là chỉ tiêu: mỗi tháng thêm ba mươi ca, ưu tiên ca có bảo hiểm cao.`, [
      C("Nhận, chạy đủ chỉ tiêu", { counters: step(c, SU), income_mult: 1.4, flags: ["dept_head"], health: -4 }, "Lương và quyền, khoa chạy như nhà máy"),
      C("Nhận, đổi chỉ tiêu bằng luật hội chẩn hai người", { counters: step(c, SU), flags: ["dept_head", "second_opinion_rule"], agency: 0.03, gamble: { p: 0.6, win: { income_mult: 1.15, counters: { sur_name: 1 }, log: "Ban giám đốc chấp nhận. Một năm sau, số ca biến chứng của khoa giảm một nửa." }, lose: { income_mult: 1.05, log: "Ban giám đốc nhận luật mới nhưng cắt ngân sách của khoa." } } }, "Ít ca hơn, mỗi ca đúng hơn", { tier: "sovereign" }),
      C("Từ chối, ở lại phòng mổ", { counters: step(c, SU, { sur_name: 1 }), happy: 4 }, "Không quyền, giữ đôi tay")], 0);
    return T("Lời mời từ bệnh viện nước ngoài", `${f(c, "trained_abroad") ? "Những người thầy ở nước ngoài năm ấy" : "Một tập đoàn bệnh viện"} mời bạn sang làm việc ở một nước khác, lương gấp bốn. Bạn phải thi lại chứng chỉ hành nghề, hai năm đầu chỉ được phụ mổ.${f(c, "private_hospital") ? " Bệnh viện tư hiện tại hứa tăng lương nếu bạn ở lại." : ""}`, [
      C("Đi, làm lại từ đầu ở xứ người", { counters: step(c, SU), income_mult: 1.6, rel: -6, flags: ["surgeon_abroad"] }, "Lương gấp bốn, hai năm làm người phụ"),
      C("Ở lại, vay tiền mở phòng khám ngoại riêng", { counters: step(c, SU), custom: "borrow:0.8", income_mult: 1.3, flags: ["own_practice"] }, "Nợ lớn, làm chủ đôi tay mình"),
      C("Ở lại, nhận dạy ở trường y", { counters: step(c, SU), income_mult: 0.9, know: 4, flags: ["teacher"] }, "Ít tiền, nhiều học trò")], 0);
  }),
  beat(SU, 5, 6, (c) => T("Ngón tay run nhẹ", `Một buổi sáng, bạn nhận ra ngón trỏ run nhẹ khi cầm kẹp. Chưa ai khác thấy. ${f(c, "bonded_district") ? `${c.country === "VN" ? "Bệnh viện huyện" : "Bệnh viện ở thị trấn"} năm xưa vẫn chỉ có hai bác sĩ ngoại, một trong hai là học trò cũ của bạn.` : (c.counters.sur_teach ?? 0) >= 1 ? "Người học trò bạn kèm từ thuở run tay đã đủ sức mổ những ca bạn vẫn giữ cho mình." : "Bác sĩ trẻ nhất khoa đã đủ sức mổ những ca bạn vẫn giữ cho mình."}${f(c, "signed_report") ? " Tờ biên bản năm ấy vẫn nằm trong ngăn kéo của ai đó." : ""}`, [
    C("Giao ca khó cho học trò, đứng bên cạnh", { counters: step(c, SU), flags: ["passed_on"], happy: 4, income_mult: 0.85 }, "Lùi một bước, nghề được nối"),
    C("Mổ thêm vài năm, không nói với ai", { counters: step(c, SU), money: 0.3, gamble: { p: 0.6, win: { log: "Bạn mổ thêm ba năm. Không ca nào có chuyện." }, lose: { happy: -8, flags: ["tremor_incident"], log: "Giữa một ca mổ, bạn phải nhờ đồng nghiệp làm tiếp. Cả khoa biết." } } }, "Thêm tiền và thời gian, cược bằng bệnh nhân"),
    C("Về vùng xa mở lớp dạy mổ cho bác sĩ trẻ", { counters: step(c, SU), income_mult: 0.6, agency: 0.02, happy: 5, flags: ["rural_teacher"] }, "Thu nhập giảm, kỹ thuật đi xa hơn bạn", { tier: "awakened" })], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(SU, "sur_envelope", [26, 65], 10, (c) => { const vn = c.country === "VN";
    return T(vn ? "Phong bì trong túi áo" : "Món quà để chen lịch mổ", vn
      ? `Trước giờ mổ, người nhà bệnh nhân nhét một phong bì vào túi áo blouse của bạn: "Chút lòng thành, bác sĩ cầm cho nhà em yên tâm." Ngoài hành lang còn sáu gia đình khác đang chờ.`
      : "Người nhà một bệnh nhân giàu gửi đến phòng làm việc của bạn một chiếc đồng hồ đắt tiền, kèm lời nhờ xếp lịch mổ sớm hơn ba tuần. Danh sách chờ còn bốn mươi người.", [
      C("Trả lại, mổ như mọi ca", { counters: { honest: 1 }, rel: -1 }, "Sạch sẽ, người nhà lo lắng hơn"),
      C("Nhận cho họ yên lòng", { money: 0.04, counters: { honest: -1 }, flags: ["took_gifts"] }, "Thêm tiền, dần thành thói quen"),
      C("Nhận, chuyển hết vào quỹ bệnh nhân nghèo", { flags: ["poor_fund"], rel: 2, bw: -2 }, "Không giữ đồng nào, phải giải thích với mọi người", { tier: "awakened" })], 0); }),
  daily(SU, "sur_queue", [28, 65], 8, (c, N) => { const o = role(c, "official")!;
    return T("Một chỗ trống trên lịch mổ", `Lịch mổ ngày mai còn đúng một chỗ. Một ông cụ đã chờ tám tháng. ${N(o)} gọi điện nhờ cho người nhà mổ trước, giọng rất thân mật.`, [
      C("Giữ chỗ cho người đã chờ", { memory: { npc: o, tag: "REFUSED_HELP", weight: -0.2, note: "không cho người nhà chen lịch mổ" }, counters: { honest: 1 } }, "Đúng thứ tự, mất lòng người có quyền"),
      C(`Cho người nhà ${N(o)} lên trước`, { trust: { npc: o, delta: 0.2 }, counters: { honest: -1 }, flags: ["favor_owed"] }, "Có người nợ bạn một ân, một người phải chờ tiếp"),
      C("Mổ thêm một ca tối, không ai phải chờ", { health: -4, bw: -5, gamble: { p: 0.8, win: { trust: { npc: o, delta: 0.1 }, log: "Cả hai ca đều ổn. Bạn ngủ gục trong phòng thay đồ." }, lose: { flags: ["near_miss"], happy: -4, log: "Ca thứ hai suýt có sai sót, người điều dưỡng dụng cụ kịp nhắc bạn." } } }, "Không ai thiệt, trừ sức của bạn")], 0, { npc: o }); }, (c) => !!role(c, "official")),
  daily(SU, "sur_call", [26, 62], 10, (c) => T("Cuộc gọi từ khoa", vary("suc", c.age, ["Giữa bữa cơm cuối tuần với gia đình, điện thoại reo: bác sĩ trẻ đang trực không chắc về một ca vừa mổ xong.", "Kỳ nghỉ đầu tiên sau hai năm, khoa gọi: một ca khó, chỉ bạn từng làm.", "Hai giờ sáng, bác sĩ trực gọi xin ý kiến. Giọng cậu ấy run."]), [
    C("Vào viện ngay", { health: -2, rel: -3, counters: { sur_name: 1 } }, "Ca bệnh yên, ở nhà vắng bạn"),
    C("Hướng dẫn qua điện thoại, để người trẻ tự làm", { rel: 1, gamble: { p: 0.7, win: { flags: ["teacher"], log: "Người trẻ làm được. Sáng hôm sau cậu ấy mang cho bạn một cốc cà phê." }, lose: { happy: -4, log: "Mọi thứ chưa ổn, bạn vẫn phải vào viện lúc bốn giờ." } } }, "Người trẻ lớn lên, bệnh nhân chờ lâu hơn", { tier: "awakened" })], 0)),
  daily(SU, "sur_device", [30, 65], 9, () => T("Hội thảo bên bờ biển", "Người đại diện một hãng khớp nhân tạo mời bạn dự hội thảo năm ngày ở khu nghỉ dưỡng ven biển, vé máy bay hạng thương gia. Không ai nói ra điều kiện, nhưng ai cũng biết bác sĩ nào đi về thì dùng hàng của hãng.", [
    C("Đi, coi như được nghỉ", { happy: 4, flags: ["device_ties"], secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 9], note: "nhận chuyến đi của hãng thiết bị để dùng hàng của họ" } }, "Một tuần sang trọng, một mối ràng buộc"),
    C("Từ chối", { counters: { honest: 1 } }, "Giữ tay sạch, bỏ lỡ một tuần nghỉ"),
    C("Đề nghị khoa chọn thiết bị bằng đấu thầu công khai", { flags: ["open_tender"], agency: 0.02, bw: -4, rel: -2 }, "Sạch cả khoa, mất lòng vài đồng nghiệp", { tier: "sovereign" })], 1)),
  daily(SU, "sur_fifth", [28, 62], 10, (c) => T("Ca thứ năm trong ngày", vary("suf", c.age, ["Bạn ngủ bốn tiếng mỗi đêm suốt một tháng. Hôm nay lịch xếp năm ca, ca cuối bắt đầu lúc tám giờ tối.", "Khoa thiếu hai bác sĩ. Lịch tuần này của bạn là ba mươi hai ca mổ."]), [
    C("Mổ hết, cà phê thay giấc ngủ", { money: 0.04, health: -5, counters: { sur_name: 1 } }, "Thêm tiền và tiếng tăm, cạn sức"),
    C("Hoãn ca chưa gấp, báo cáo thiếu người", { happy: 2, rel: -1, flags: ["staffing_report"] }, "Ngủ được, ban giám đốc không vui")], 0)),
  daily(SU, "sur_rival", [30, 62], 9, (c, N) => { const r = role(c, "rival")!;
    return T("Tỷ lệ biến chứng", `${N(r)} cũng là bác sĩ ngoại, đang nhắm ghế phó khoa. Trong buổi giao ban, ${N(r)} nhắc đến "một số ca biến chứng gần đây" rồi liếc về phía bạn.`, [
      C("Lật lại hồ sơ ca mổ của người kia ngay tại chỗ", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bị lật hồ sơ ca mổ giữa buổi giao ban" }, happy: 2 }, "Thắng một buổi họp, thêm một kẻ thù"),
      C("Đề nghị công khai tỷ lệ biến chứng cả khoa", { flags: ["open_stats"], agency: 0.02, gamble: { p: 0.6, win: { counters: { sur_name: 1 }, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.1, note: "cùng công khai số liệu của khoa" }, log: "Số liệu cho thấy cả hai đều làm tốt. Buổi giao ban sau yên hơn." }, lose: { happy: -3, log: "Số liệu của bạn kém hơn bạn nghĩ, và cả khoa đều thấy." } } }, "Minh bạch, kể cả với chính bạn", { tier: "sovereign" }),
      C("Im lặng, làm việc", { happy: -2 }, "Không thêm thù, tin đồn còn đó")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(SU, "sur_student", [32, 68], 10, (c) => T("Người học việc run tay", vary("sus", c.age, ["Một sinh viên y năm cuối run đến mức làm rơi kẹp. Bác sĩ phụ mổ bật cười.", "Cô bác sĩ nội trú mới ngồi khóc trong phòng thay đồ sau lần đầu bị mắng giữa ca mổ."]), [
    C("Kèm riêng sau ca, cho làm dưới tay bạn", { bw: -3, counters: { sur_teach: 1 }, flags: ["teacher"] }, "Mất giờ nghỉ, có thêm một người học"),
    C("Để người ấy tự vượt qua", { happy: 1 }, "Đỡ việc cho bạn, người trẻ có thể bỏ nghề")], 0)),
  daily(SU, "sur_lawsuit", [30, 65], 9, (c) => T("Đơn đòi bồi thường", c.poor_country
    ? "Người nhà một bệnh nhân kéo đến hành lang khoa đòi bồi thường vì vết sẹo dài hơn họ nghĩ. Họ quay video, dọa đăng lên mạng."
    : "Một bệnh nhân kiện bạn vì vết sẹo và cơn đau kéo dài sau mổ. Cả hai đều có trong giấy cam kết, nhưng luật sư của họ đòi một khoản lớn.", [
    C("Dàn xếp, trả tiền cho xong", { money: -0.2, flags: ["settled_case"] }, "Mất tiền, xong nhanh"),
    C("Ra hội đồng, theo đến cùng", { money: -0.05, bw: -5, gamble: { p: 0.6, win: { counters: { sur_name: 1 }, log: "Hội đồng kết luận bạn làm đúng quy trình." }, lose: { money: -0.3, happy: -4, log: "Bạn thua vì hồ sơ thiếu một chữ ký." } } }, "Có thể giữ tên, có thể mất nhiều hơn"),
    C("Ngồi với họ, giải thích lại từ đầu", { bw: -3, gamble: { p: 0.5, win: { rel: 3, flags: ["listened_family"], log: "Họ rút yêu cầu. Người mẹ nói chỉ muốn có ai đó giải thích." }, lose: { log: "Họ nghe hết, rồi vẫn nộp đơn." } } }, "Mất một buổi chiều, có thể không cần ra hội đồng", { tier: "awakened" })], 1)),
  daily(SU, "sur_mission", [28, 65], 10, (c) => T("Hai tuần ở nơi không có bác sĩ", c.country === "VN"
    ? "Một đoàn mổ từ thiện lên các xã vùng cao cần một bác sĩ ngoại trong hai tuần, không lương. Hơn trăm người đã đăng ký chờ mổ."
    : `Một tổ chức thiện nguyện cần bác sĩ ngoại cho chuyến hai tuần đến ${c.poor_country ? "vùng biên giới" : "một nước nghèo"} không có bệnh viện. Danh sách chờ đã hơn trăm người.`, [
    C("Đi, dùng hết phép năm", { happy: 5, health: -2, flags: ["mission"], counters: { kind: 1 } }, "Mất kỳ nghỉ, nhớ lại vì sao mình học y"),
    C("Gửi tiền ủng hộ thay", { money: -0.05, counters: { kind: 1 } }, "Đỡ mất thời gian, ít ai nhớ"),
    C("Ở lại hẳn, làm bác sĩ thiện nguyện", { unflags: [life(SU)], custom: "become:aid_doctor" }, "Rời phòng mổ hiện đại, đi theo người cần mổ")], 1)),
  daily(SU, "sur_bully", [28, 65], 9, (c, N) => { const b = role(c, "bully")!;
    return T("Tên quen trong hồ sơ cấp cứu", `Ca cấp cứu đêm nay là một vụ tai nạn giao thông. Trên hồ sơ là tên ${N(b)}, người từng bắt nạt bạn suốt những năm đi học. Người đó không nhận ra bạn.`, [
      C("Tự mổ, như mọi ca khác", { memory: { npc: b, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "mổ cấp cứu sau tai nạn giao thông" }, bw: -2 }, "Làm đúng nghề, lòng bạn chưa chắc yên"),
      C("Xin rút, chuyển cho đồng nghiệp", { flags: ["recused"], happy: -1 }, "Đúng nguyên tắc, không ai biết vì sao"),
      C("Mổ, rồi nói cho người đó biết bạn là ai", { gamble: { p: 0.5, win: { memory: { npc: b, tag: "HELPED_IN_CRISIS", weight: 0.5, note: "mổ cứu và nhắc lại chuyện năm học cũ" }, happy: 4, log: "Người đó im rất lâu, rồi xin lỗi chuyện năm xưa." }, lose: { memory: { npc: b, tag: "HUMILIATED_ME", weight: -0.1, note: "bị nhắc chuyện cũ trên giường bệnh" }, log: "Người đó quay mặt vào tường, không nói gì." } } }, "Có thể khép chuyện cũ, có thể mở lại vết thương")], 0, { npc: b }); }, (c) => !!role(c, "bully")),

  /* ---------- gia đình ---------- */
  cross(SU, "sur_kin", [28, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.married && !!role(c, "spouse")), (c, N) => {
    const p = role(c, "father") ?? role(c, "mother"); const s = role(c, "spouse");
    if (p && (c.parent_sick || !(c.married && s))) return T("Ca mổ không nên tự cầm dao", `${N(p)} cần mổ, và nói chỉ tin mỗi bạn cầm dao. Quy định không cấm hẳn, nhưng thầy bạn từng dặn: đừng bao giờ mổ cho người nhà.`, [
      C(`Tự mổ cho ${N(p)}`, { gamble: { p: 0.7, win: { trust: { npc: p, delta: 0.3 }, log: `Ca mổ ổn. ${N(p)} khoe với hàng xóm rằng con mình mổ.` }, lose: { trust: { npc: p, delta: -0.1 }, happy: -8, log: "Có một biến chứng nhỏ. Mọi thứ rồi cũng qua, nhưng bạn mất ngủ suốt một tuần." } } }, "Người nhà yên tâm, tay bạn có thể run"),
      C("Nhờ người giỏi nhất mổ, bạn ngồi chờ ngoài cửa", { trust: { npc: p, delta: 0.1 }, flags: ["family_not_patient"] }, "Bố mẹ hơi buồn, bạn được làm con", { tier: "awakened" }),
      C("Dùng quan hệ xin phòng riêng, ca đầu tiên trong ngày", { trust: { npc: p, delta: 0.2 }, counters: { honest: -1 } }, "Bố mẹ dễ chịu, người khác lùi một ngày")], 1, { npc: p });
    return T("Lịch mổ trùng ngày kỷ niệm", `Năm nay là lần thứ ba bạn lỡ ngày kỷ niệm cưới vì ca mổ. ${N(s!)} không giận nữa, chỉ hỏi bạn có biết tuần sau là ngày gì không.`, [
      C("Xin nghỉ hẳn một tuần, đi cùng nhau", { trust: { npc: s!, delta: 0.25 }, money: -0.05, counters: { sur_name: -1 } }, "Mất vài ca lớn, giữ một người"),
      C("Hứa năm sau sẽ khác", { trust: { npc: s!, delta: 0.05 }, promise: { to: s!, what: "không để lịch mổ trùng ngày kỷ niệm cưới", years: 1 } }, "Dễ nói, năm sau sẽ bị đòi"),
      C("Nói thật: nghề này là vậy", { trust: { npc: s!, delta: -0.15 }, counters: { sur_name: 1 } }, "Thẳng thắn, lạnh")], 0, { npc: s! });
  }),
];

/* ================================================================ KỸ SƯ TRÍ TUỆ NHÂN TẠO */
const AI = "ai_engineer";

const AI_ENGINEER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AI, "aie_t_digits", [10, 16], () => true, (c) => T("Chương trình đoán chữ số", `Bạn tự học lập trình trên ${c.poor_country ? "chiếc máy tính cũ ở thư viện" : "chiếc máy tính xách tay cũ của anh họ"}. Sau ba tháng, chương trình của bạn đoán đúng chữ số viết tay của cả lớp bảy lần trong mười lần. Thầy dạy toán xin chép về cho con mình xem.`, [
    C("Xin học lớp tin học buổi tối", { money: -0.03, know: 3, flags: [talentFlag(AI)], counters: { talents_seen: 1 } }, "Tốn tiền học, có người dẫn đường"),
    C("Thức đêm tự học, không nói với ai", { health: -3, bw: -2, flags: [talentFlag(AI)], counters: { talents_seen: 1 } }, "Không tốn tiền, tốn giấc ngủ"),
    C("Cất máy, tập trung ôn thi", { know: 2, counters: { talents_seen: 1 } }, "Điểm thi chắc hơn, chương trình nằm im")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AI, "aie_d_retrain", [24, 42], () => true, (c) => T("Khóa học chuyển nghề", `${c.econ_phase === "crisis" ? "Công ty cắt giảm một phần ba nhân sự, phần việc của bạn được giao cho phần mềm." : "Phần mềm mới làm được một nửa công việc của bạn, nhanh gấp mười."} Một khóa học sáu tháng hứa biến người mới thành kỹ sư học máy. Học phí bằng nửa năm thu nhập.`, [
    C("Vay tiền, học toàn thời gian", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.6, win: { custom: `borrow:0.5|become:${AI}`, log: "Tám tháng sau, bạn nhận được việc đầu tiên trong ngành." }, lose: { custom: "borrow:0.5", happy: -4, log: "Học xong, bạn gửi hai trăm hồ sơ mà chưa nơi nào nhận." } } }, "Nợ nửa năm lương, chưa chắc có việc"),
    C("Tự học buổi tối bằng tài liệu miễn phí", { counters: { doors_seen: 1 }, bw: -5, gamble: { p: 0.3, win: { ...become(AI), log: "Một dự án nhỏ bạn đăng lên mạng được một công ty để ý." }, lose: { know: 3, log: "Một năm trôi qua, bạn hiểu nhiều hơn, nhưng vẫn ở chỗ cũ." } } }, "Không tốn tiền, tốn từng buổi tối"),
    C("Ở lại, học cách làm cùng phần mềm", { counters: { doors_seen: 1 }, income_mult: 0.95, happy: 1 }, "Giữ chỗ, lương chững lại")], 2)),
  door(AI, "aie_d_offer", [21, 35], (c) => c.has_degree || f(c, "job_tech") || f(c, talentFlag(AI)), (c) => T("Nhóm năm người hay tòa nhà kính", `Một nhóm khởi nghiệp năm người cần kỹ sư huấn luyện mô hình ${c.poor_country ? "nhận diện bệnh cây trồng qua ảnh chụp điện thoại" : "đọc phim chụp X-quang"}: lương thấp, nhiều cổ phần. Cùng lúc, một tập đoàn lớn mời bạn vào nhóm tối ưu quảng cáo, lương gấp đôi.`, [
    C("Vào nhóm năm người", { ...become(AI), flags: ["startup_equity"], counters: { doors_seen: 1 }, money: -0.05 }, "Lương thấp, cổ phần nhiều, có thể mất trắng"),
    C("Vào tập đoàn", { ...become(AI), flags: ["bigco"], counters: { doors_seen: 1 } }, "Lương cao, việc ít ý nghĩa"),
    C("Từ chối cả hai, học tiếp", { counters: { doors_seen: 1 }, know: 4, money: -0.05 }, "Thêm bằng cấp, lỡ chuyến tàu đang chạy")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(AI, 1, 1, (c) => T("Chín mươi tư phần trăm", `Mô hình đầu tiên của bạn đạt chín mươi tư phần trăm trên bộ kiểm tra. ${f(c, "startup_equity") ? "Sáng mai cả nhóm gặp nhà đầu tư." : f(c, "bigco") ? "Sáng mai sếp trình diễn cho ban giám đốc tập đoàn." : "Sáng mai sếp trình diễn cho khách hàng lớn."} Tối nay bạn phát hiện nó đoán sai gần hết ảnh chụp bằng điện thoại cũ, ở nơi thiếu sáng, tức là ảnh của những người nghèo nhất.`, [
    C("Trình diễn luôn, sửa sau", { counters: step(c, AI, { aie_rep: 1 }), income_mult: 1.1, flags: ["shipped_fast"] }, "Được khen ngay, lỗi vẫn nằm đó"),
    C("Xin hoãn một tháng để thu thêm dữ liệu", { counters: step(c, AI), flags: ["data_careful"], happy: -2, gamble: { p: 0.5, win: { counters: { aie_rep: 1 }, log: "Sếp càu nhàu nhưng đồng ý. Bản sửa chạy đúng cả với ảnh mờ." }, lose: { income_mult: 0.95, log: "Khách hàng chuyển sang bên khác. Sếp nhắc chuyện này suốt một năm." } } }, "Có thể mất khách, sản phẩm đúng hơn"),
    C("Trình diễn, nhưng nói rõ giới hạn trước mọi người", { counters: step(c, AI), flags: ["named_limits"], gamble: { p: 0.55, win: { counters: { aie_rep: 1 }, log: "Người nghe đánh giá cao sự thẳng thắn và ký hợp đồng thử." }, lose: { log: "Người nghe do dự, xin thêm thời gian suy nghĩ." } } }, "Thật thà giữa buổi bán hàng", { tier: "awakened" })], 0)),
  beat(AI, 2, 3, (c) => { const team = f(c, "startup_equity");
    return T("Công cụ nghìn người dùng", `Công cụ nhỏ bạn viết để làm sạch dữ liệu được hàng nghìn kỹ sư trên thế giới dùng. ${c.poor_country ? "Một tập đoàn ở nước giàu" : "Một tập đoàn ở thành phố công nghệ bên kia đại dương"} mời bạn sang, lương gấp ba.${team ? " Nhóm khởi nghiệp của bạn chỉ còn tiền cho mười tháng." : ""}${f(c, "shipped_fast") ? " Trong thư mời, họ khen tốc độ ra sản phẩm của bạn." : ""}`, [
      C("Nhận lời, chuyển sang đó", { counters: step(c, AI), income_mult: 1.7, rel: -5, flags: ["ai_abroad"] }, "Lương gấp ba, xa nhà, bắt đầu lại"),
      C(team ? "Ở lại với nhóm, giữ cổ phần" : "Ở lại, xin dẫn một nhóm nhỏ", { counters: step(c, AI), income_mult: 1.1, flags: ["stayed_home_team"] }, team ? "Ít tiền hơn, có thể giàu to hoặc mất trắng" : "Ít tiền hơn, được làm chủ việc mình"),
      C("Mở mã nguồn công cụ, sống bằng tư vấn", { counters: step(c, AI, { aie_rep: 2 }), income_mult: 1.25, flags: ["open_source"], agency: 0.02, bw: -4 }, "Không ông chủ, thu nhập lên xuống theo tháng", { tier: "sovereign" })], 1); }),
  beat(AI, 3, 4, (c) => T("Hợp đồng camera thành phố", `Công ty nhận một hợp đồng lớn: hệ thống camera nhận diện khuôn mặt cho cả một thành phố, chấm điểm "mức độ rủi ro" của từng người đi đường. Phần lõi là mô hình bạn xây.${f(c, "shipped_fast") ? " Bạn biết rõ mô hình của mình hay sai với ai." : f(c, "data_careful") ? " Lần trước bạn đòi hoãn vì dữ liệu lệch. Lần này cái giá lớn hơn nhiều." : ""}${f(c, "stayed_home_team") || f(c, "startup_equity") ? " Không có hợp đồng này, công ty đóng cửa trong ba tháng." : ""}`, [
    C("Làm, coi đó là việc của khách hàng", { counters: step(c, AI), income_mult: 1.3, flags: ["built_surveillance"] }, "Công ty sống, mô hình đi theo người khác"),
    C("Ghi giới hạn sử dụng vào hợp đồng rồi mới làm", { counters: step(c, AI), agency: 0.03, gamble: { p: 0.4, win: { flags: ["ethics_clause"], income_mult: 1.1, log: "Khách hàng ký phụ lục: hệ thống không được dùng để chấm điểm người dân." }, lose: { flags: ["built_surveillance"], income_mult: 1.1, log: "Họ ký, rồi sáu tháng sau lặng lẽ bỏ phụ lục ấy." } } }, "Đổi luật chơi, có thể chỉ đổi trên giấy", { tier: "sovereign" }),
    C("Từ chối, nghỉ việc", { counters: step(c, AI), income_mult: 0.75, flags: ["refused_contract"], happy: 2 }, "Sạch tay, mất việc giữa năm"),
    C("Rời ngành, đi dạy tin học", { ...leave(AI), counters: step(c, AI), flags: ["ex_ai"], happy: 3 }, "Bình yên, bỏ lại một nghề đang lên")], 0)),
  beat(AI, 4, 5, (c) => {
    if (f(c, "built_surveillance")) return T("Tên bạn trong tài liệu rò rỉ", "Một phóng viên gửi cho bạn tài liệu nội bộ: hệ thống đã gắn cờ hàng nghìn người vô tội, phần lớn ở các khu nghèo. Tên bạn nằm trong danh sách kỹ sư. Cô ấy hỏi bạn có muốn nói gì không.", [
      C("Lên tiếng, kể hết những gì bạn biết", { counters: step(c, AI), income_mult: 0.6, agency: 0.04, flags: ["whistleblower"], gamble: { p: 0.5, win: { counters: { aie_rep: 2 }, log: "Thành phố tạm dừng hệ thống. Bạn mất việc, nhưng nhận được thư cảm ơn từ những người lạ." }, lose: { money: -0.4, happy: -5, log: "Công ty kiện bạn vi phạm thỏa thuận bảo mật." } } }, "Có thể dừng hệ thống, chắc chắn mất việc"),
      C("Im lặng, âm thầm sửa lỗi từ bên trong", { counters: step(c, AI), flags: ["fixed_quietly"], bw: -5 }, "Giữ việc, sửa được một phần", { tier: "awakened" }),
      C("Từ chối trả lời", { counters: step(c, AI), happy: -4 }, "Không ai biết, chỉ bạn biết")], 2);
    if (f(c, "startup_equity") || f(c, "stayed_home_team") || f(c, "open_source")) return T("Lời đề nghị thâu tóm", `${f(c, "open_source") ? "Dự án mã nguồn mở của bạn" : "Công ty nhỏ của bạn"} được một tập đoàn hỏi mua. Số tiền đủ để bạn không phải đi làm nữa. Điều kiện: đóng mã nguồn, cắt nửa nhóm, chuyển sản phẩm sang phục vụ khách hàng lớn.${(c.counters.aie_rep ?? 0) >= 3 ? " Hai tập đoàn khác cũng đang hỏi." : ""}`, [
      C("Bán", { counters: step(c, AI), money: 2.5, flags: ["sold_out"], happy: 2, rel: -3 }, "Giàu ngay, những người đi cùng mất việc"),
      C("Bán, với điều kiện giữ mã mở và giữ người", { counters: step(c, AI), gamble: { p: 0.35, win: { money: 1.5, flags: ["sold_with_terms"], log: "Họ chấp nhận, trả ít hơn, nhưng cả nhóm đi cùng bạn." }, lose: { flags: ["stayed_independent"], log: "Họ rút lời. Bạn vẫn còn công ty và cả nhóm." } } }, "Ít tiền hơn, có thể không ai mua", { tier: "sovereign" }),
      C("Không bán, tự đi tiếp", { counters: step(c, AI), income_mult: 1.2, bw: -5, flags: ["stayed_independent"] }, "Giữ quyền, tiếp tục làm mười hai giờ mỗi ngày")], 2);
    return T("Ba trăm người được thay", `Hệ thống bạn dẫn dắt có thể thay ba trăm nhân viên tổng đài của chính công ty. Ban giám đốc muốn triển khai ngay trong quý này.${f(c, "ai_abroad") ? " Phần lớn họ làm việc ở nước bạn sinh ra." : ""} Một người bạn học cũ của bạn ở trong số đó.`, [
      C("Triển khai đúng kế hoạch", { counters: step(c, AI), income_mult: 1.35, flags: ["replaced_staff"] }, "Thưởng lớn, ba trăm người mất việc"),
      C("Đề xuất lấy tiền tiết kiệm được để đào tạo lại họ", { counters: step(c, AI), gamble: { p: 0.5, win: { flags: ["retrain_fund"], income_mult: 1.1, log: "Một trăm hai mươi người chuyển sang kiểm tra và huấn luyện hệ thống." }, lose: { income_mult: 0.9, log: "Đề xuất bị bác. Tên bạn bị ghi là người cản trở chuyển đổi." } } }, "Ít thưởng, có người không mất việc", { tier: "sovereign" }),
      C("Xin rút khỏi dự án", { counters: step(c, AI), income_mult: 0.85, happy: 1, flags: ["stepped_aside"] }, "Lòng yên, dự án vẫn chạy không có bạn")], 0);
  }),
  beat(AI, 5, 6, (c) => T("Cỗ máy viết mã giỏi hơn bạn", `Thế hệ mô hình mới viết mã nhanh và sạch hơn bạn. Kỹ sư trẻ hỏi máy trước khi hỏi bạn.${f(c, "open_source") || f(c, "stayed_independent") ? " Cộng đồng bạn lập vẫn gửi thư hỏi ý kiến bạn mỗi tuần." : ""}${f(c, "whistleblower") ? " Ở vài trường đại học, người ta dạy về vụ rò rỉ năm ấy." : ""}${f(c, "sold_out") ? " Tiền bán công ty năm ấy vẫn nằm yên trong tài khoản." : ""}`, [
    C("Chuyển sang dạy đạo đức và an toàn AI", { counters: step(c, AI), income_mult: 0.8, flags: ["teaches_ethics"], happy: 4 }, "Lương giảm, nghề có nghĩa hơn"),
    C("Lên làm quản lý, để máy viết mã", { counters: step(c, AI), income_mult: 1.2, bw: -5, happy: -2 }, "Lương cao, xa dần thứ bạn yêu"),
    C("Nghỉ hẳn, làm thứ máy không làm được", { ...leave(AI), counters: step(c, AI), happy: 5, flags: ["ex_ai"] }, "Bình yên, rời ngành đúng lúc nó lên đỉnh")], 0), (c) => c.age >= 42),

  /* ---------- chuyện thường ngày ---------- */
  daily(AI, "aie_label", [21, 65], 9, (c) => T("Người gán nhãn ở đầu kia", `Dữ liệu của nhóm bạn được gán nhãn bởi hàng trăm người làm theo sản phẩm, ${c.poor_country ? "ở một thị trấn cách bạn hai trăm cây số" : "ở một nước nghèo bên kia địa cầu"}. Mỗi ảnh họ được trả chưa tới một xu. Một người viết vào ô ghi chú: "Xin hãy trả tiền đúng hẹn."`, [
    C("Đề nghị tăng giá công, bỏ phần thưởng của nhóm", { money: -0.04, flags: ["fair_labels"], counters: { kind: 1 } }, "Mất thưởng quý, người làm thuê bớt khổ"),
    C("Giữ nguyên, đúng hạn dự án", { income_mult: 1.03 }, "Dự án đẹp, người làm thuê vẫn thế"),
    C("Đến tận nơi, ghi lại điều kiện làm việc", { bw: -4, gamble: { p: 0.5, win: { flags: ["fair_labels"], counters: { aie_rep: 1 }, log: "Báo cáo của bạn khiến công ty đổi nhà cung cấp và trả đúng hẹn." }, lose: { happy: -3, log: "Bạn đi, ghi chép, nhưng không ai trong công ty đọc báo cáo." } } }, "Mất công, có thể đổi cả chuỗi cung ứng", { tier: "awakened" })], 1)),
  daily(AI, "aie_bill", [21, 60], 9, () => T("Hóa đơn máy chủ cuối tuần", "Bạn quên tắt một lượt huấn luyện, nó chạy suốt cuối tuần. Hóa đơn máy chủ sáng thứ Hai bằng ba tháng lương của bạn. Chưa ai để ý.", [
    C("Báo ngay với trưởng nhóm", { counters: { honest: 1 }, happy: -3, gamble: { p: 0.7, win: { log: "Trưởng nhóm thở dài, rồi kể chuyện chính anh ấy từng làm mất gấp đôi." }, lose: { income_mult: 0.95, log: "Bạn bị trừ thưởng và mất suất thăng chức năm đó." } } }, "Mất mặt, giữ được lòng tin"),
    C("Ghi khoản đó vào ngân sách dự án khác", { secret: { tag: "FORGED_PAPERS", severity: 0.2, fuse_years: [1, 5], note: "giấu hóa đơn máy chủ vào ngân sách dự án khác" } }, "Không ai biết, cho đến kỳ kiểm toán"),
    C("Viết công cụ tự tắt cho cả công ty, kèm lời nhận lỗi", { flags: ["cost_guard"], counters: { aie_rep: 1, honest: 1 }, bw: -4 }, "Thêm việc, lỗi của bạn thành luật chung", { tier: "sovereign" })], 0)),
  daily(AI, "aie_fake", [22, 65], 9, () => T("Gương mặt bạn trong quảng cáo lừa", `Một video giả dùng gương mặt và giọng nói của bạn, giới thiệu một sàn đầu tư "do AI vận hành, lãi mười phần trăm mỗi tháng". Đã có người nhắn hỏi bạn có thật không.`, [
    C("Làm video cảnh báo, chỉ cách nhận ra đồ giả", { rel: 2, counters: { aie_rep: 1 }, bw: -3 }, "Mất vài ngày, nhiều người được cảnh báo"),
    C("Trình báo và thuê luật sư", { money: -0.06, flags: ["deepfake_case"], gamble: { p: 0.3, win: { log: "Trang lừa đảo bị gỡ. Kẻ đứng sau vẫn chưa tìm ra." }, lose: { log: "Họ đổi tên miền, video lại hiện lên ở chỗ khác." } } }, "Tốn tiền, chưa chắc bắt được ai"),
    C("Mặc kệ, ai tin thì chịu", { happy: 1, gamble: { p: 0.6, win: { log: "Video chìm dần sau một tháng." }, lose: { happy: -6, flags: ["victim_letter"], log: "Một bà cụ mất hết tiền tiết kiệm và viết thư trách bạn." } } }, "Đỡ mệt, có thể có người mất tiền")], 0)),
  daily(AI, "aie_crunch", [21, 55], 10, (c) => T("Tuần ra mắt", vary("aic", c.age, ["Còn năm ngày đến buổi ra mắt sản phẩm. Cả nhóm ngủ lại văn phòng.", "Đối thủ vừa ra mắt trước một tuần. Sếp muốn bạn làm tám mươi giờ cho đến khi đuổi kịp.", "Mô hình mới phải xong trước hội nghị lớn nhất năm. Ba tuần nay bạn không gặp ai ngoài nhóm."]), [
    C("Ở lại đến khi xong", { health: -4, rel: -2, counters: { aie_rep: 1 }, income_mult: 1.03 }, "Tiếng tăm lên, cơ thể trả giá"),
    C("Về lúc sáu giờ, làm đúng phần mình", { happy: 3, rel: 2, flags: ["sets_limits"] }, "Sống được, có thể bị coi là thiếu nhiệt tình")], 0)),
  daily(AI, "aie_poach", [24, 55], 9, () => T("Cuộc gọi của người săn đầu người", `Một công ty đối thủ muốn tuyển bạn, lương thêm bốn mươi phần trăm. Người săn đầu người nói khẽ: "Nếu bạn mang theo được vài thứ từ dự án cũ thì càng tốt."`, [
    C("Đi, mang theo mã nguồn cũ", { income_mult: 1.4, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.5, fuse_years: [2, 7], note: "mang mã nguồn của công ty cũ sang đối thủ" } }, "Lương cao, một vụ kiện có thể đang chờ"),
    C("Đi tay trắng", { income_mult: 1.2, counters: { honest: 1 } }, "Lương khá hơn, bắt đầu từ số không"),
    C("Mang lời mời về đàm phán tăng lương", { gamble: { p: 0.5, win: { income_mult: 1.15, log: "Công ty giữ bạn lại bằng một mức lương mới." }, lose: { income_mult: 1.05, flags: ["flight_risk"], log: "Sếp tăng lương, nhưng từ đó không giao cho bạn việc quan trọng." } } }, "Ở lại có giá hơn, có thể bị nghi ngờ")], 1)),
  daily(AI, "aie_leak", [22, 60], 9, () => T("Kết quả đẹp bất thường", "Hai giờ sáng, đêm trước hạn nộp bài cho hội nghị, mô hình của bạn vượt mọi kết quả từng công bố. Đẹp đến mức đáng ngờ. Kiểm tra lại mất ít nhất một tuần.", [
    C("Nộp luôn, kiểm tra sau", { counters: { aie_rep: 1 }, gamble: { p: 0.5, win: { flags: ["lucky_paper"], log: "Bài được nhận. Sau này bạn kiểm tra lại, kết quả vẫn đúng." }, lose: { secret: { tag: "CHEATED_EXAM", severity: 0.3, fuse_years: [1, 6], note: "nộp bài báo có kết quả sai vì dữ liệu kiểm tra bị lọt" }, log: "Một tuần sau bạn tìm ra lỗi: dữ liệu kiểm tra đã lọt vào lúc huấn luyện. Bài đã được nhận." } } }, "Có thể nổi tiếng, có thể thành bê bối"),
    C("Bỏ hạn nộp, kiểm tra đến cùng", { happy: -3, counters: { honest: 1 }, know: 3 }, "Lỡ một năm, ngủ yên")], 1)),
  daily(AI, "aie_friend", [24, 62], 9, (c, N) => { const fr = role(c, "childhood_friend")!;
    return T("Bạn cũ mất việc vì máy", `${N(fr)} làm ${c.country === "VN" ? "phiên dịch ở khu công nghiệp" : "nhân viên tổng đài"} mười hai năm, vừa bị thay bằng một hệ thống giống thứ bạn làm. Trong bữa cơm, ${N(fr)} hỏi: "Cậu có thấy mình góp tay vào không?"`, [
      C("Giới thiệu bạn ấy vào làm kiểm định dữ liệu", { memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "giới thiệu việc mới khi mất việc vì máy" }, bw: -2 }, "Mất công nhờ vả, giữ được một người bạn"),
      C("Nói thật: không mình thì người khác cũng làm", { trust: { npc: fr, delta: -0.2 }, rel: -2 }, "Đúng, nhưng lạnh"),
      C("Góp tiền cho bạn ấy đi học nghề mới", { money: -0.1, memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "góp tiền học nghề mới sau khi mất việc" } }, "Tốn tiền của mình, đỡ một đời người")], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(AI, "aie_lonely", [23, 62], 9, () => T("Người dùng trò chuyện mười tiếng mỗi ngày", `Số liệu cho thấy một ông cụ góa vợ trò chuyện với trợ lý ảo của công ty mười tiếng mỗi ngày. Nhóm sản phẩm muốn nhân rộng "mức độ gắn bó" này ra mọi người dùng, vì doanh thu tăng theo số giờ.`, [
    C("Làm theo, tối ưu số giờ trò chuyện", { income_mult: 1.08, counters: { honest: -1 } }, "Thưởng tăng, người cô đơn càng cô đơn"),
    C("Cài nhắc nghỉ và gợi ý gọi cho người thân", { income_mult: 0.97, flags: ["humane_design"], counters: { kind: 1 } }, "Số liệu giảm, sếp không vui"),
    C("Đề xuất nối người dùng cô đơn với tình nguyện viên", { bw: -4, gamble: { p: 0.45, win: { flags: ["humane_design"], counters: { aie_rep: 1 }, log: "Thử nghiệm thành công. Ông cụ giờ có một người gọi điện mỗi chiều thứ Năm." }, lose: { log: "Ban giám đốc nói đó không phải việc của một công ty công nghệ." } } }, "Đổi mục tiêu sản phẩm, có thể bị gạt đi", { tier: "sovereign" })], 1)),
  daily(AI, "aie_wrong", [23, 62], 9, () => T("Câu trả lời tự tin và sai", "Trong lúc kiểm thử, bạn thấy trợ lý của công ty trả lời một câu hỏi về thuốc rất tự tin, và sai. Ngày ra mắt là thứ Sáu. Sửa cho đúng cần thêm hai tháng.", [
    C("Viết báo cáo nội bộ, đề nghị hoãn", { flags: ["safety_report"], income_mult: 0.97, gamble: { p: 0.5, win: { counters: { aie_rep: 1 }, log: "Buổi ra mắt lùi hai tháng. Không ai cảm ơn bạn, nhưng lỗi đã được sửa." }, lose: { log: "Báo cáo bị xếp vào mục \"cải tiến sau\". Sản phẩm vẫn ra mắt." } } }, "Có thể bị ghét, có thể cứu một người"),
    C("Để nhóm khác lo, ra mắt đúng hạn", { money: 0.05 }, "Thưởng ra mắt, một lỗi đang chạy"),
    C("Chặn riêng mảng câu hỏi y tế trước, sửa sau", { flags: ["safety_patch"], bw: -3 }, "Nửa vời, nhưng kịp thứ Sáu", { tier: "awakened" })], 0)),
  daily(AI, "aie_kid", [25, 70], 9, (c, N) => { const n = role(c, "neighbor")!;
    return T("Đứa trẻ nhà bên muốn học lập trình", `Con của ${N(n)} học lớp chín, tự viết được một trò chơi nhỏ, và xin bạn kèm mỗi cuối tuần. Đứa bé hỏi câu đầu tiên: "Máy làm hết rồi thì cháu học để làm gì?"`, [
      C("Kèm mỗi sáng Chủ nhật", { bw: -3, happy: 2, trust: { npc: n, delta: 0.2 }, flags: ["mentors_kid"] }, "Mất cuối tuần, có một học trò"),
      C("Gửi một danh sách tài liệu", { trust: { npc: n, delta: 0.05 } }, "Nhẹ việc, nhẹ tình")], 0, { npc: n }); }, (c) => !!role(c, "neighbor")),

  /* ---------- gia đình ---------- */
  cross(AI, "aie_home", [26, 70], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T("Bài luận do máy viết", `Nhà trường mời bạn lên vì bài luận của ${N(k)} bị phát hiện do máy viết. Cô giáo nhìn bạn: "Nghe nói phụ huynh làm trong ngành này?"`, [
      C("Bênh con: công cụ thì ai cũng dùng", { trust: { npc: k, delta: 0.2 }, rel: -2 }, "Con tin bạn, nhà trường thì không"),
      C("Bắt con viết lại bằng tay, ngồi cạnh con", { trust: { npc: k, delta: -0.1 }, bw: -3, flags: ["writes_with_kid"] }, "Con giận một tuần, học được thật"),
      C("Dạy con dùng máy để phản biện, không để viết thay", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "mỗi tuần cùng con đọc lại một bài viết", years: 1 } }, "Mất mỗi tối Chủ nhật, con có một cách học", { tier: "awakened" })], 1, { npc: k });
    return T("Cuộc gọi bằng giọng của bạn", `${N(p!)} nhận một cuộc gọi bằng chính giọng của bạn, khóc xin chuyển tiền gấp. ${N(p!)} đã ra đến quầy ngân hàng thì người nhân viên ngăn lại. Từ hôm đó, ${N(p!)} sợ nghe điện thoại.`, [
      C("Đặt một mật khẩu riêng cho cả nhà", { trust: { npc: p!, delta: 0.2 }, flags: ["family_codeword"] }, "Đơn giản, bố mẹ phải nhớ thêm một điều"),
      C("Viết một ứng dụng lọc cuộc gọi cho người già", { bw: -5, gamble: { p: 0.4, win: { counters: { aie_rep: 2 }, trust: { npc: p!, delta: 0.2 }, log: `Ứng dụng được vài nghìn gia đình dùng. ${N(p!)} khoe với hàng xóm.` }, lose: { trust: { npc: p!, delta: 0.1 }, log: `Ứng dụng chạy được, nhưng chỉ có ${N(p!)} dùng.` } } }, "Mất nhiều buổi tối, có thể giúp nhiều nhà", { tier: "awakened" }),
      C("Dặn bố mẹ đừng nghe số lạ", { trust: { npc: p!, delta: -0.05 } }, "Nhanh, nỗi sợ vẫn còn")], 0, { npc: p! });
  }),
];

/* ================================================================ KIẾN TRÚC SƯ */
const AR = "architect";

const ARCHITECT: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AR, "kts_t_plan", [9, 15], () => true, (c) => T("Mặt bằng trong vở toán", `Bạn đo từng phòng trong nhà bằng bước chân rồi vẽ lại ở cuối vở toán, có cả hướng nắng buổi chiều. Bố mẹ biết chuyện khi cô giáo gửi vở về kèm lời phê: "Em vẽ nhà nhiều hơn làm toán."`, [
    C(`Xin đi học vẽ ở ${c.country === "VN" ? "nhà văn hóa" : "trung tâm cộng đồng"}`, { money: -0.03, happy: 2, flags: [talentFlag(AR)], counters: { talents_seen: 1 } }, "Tốn tiền học, được vẽ có thầy"),
    C("Làm mô hình bằng bìa các-tông, tự học", { bw: -2, know: 2, flags: [talentFlag(AR)], counters: { talents_seen: 1 } }, "Không tốn tiền, điểm toán có thể tụt"),
    C("Hứa với cô sẽ chăm làm toán", { know: 3, counters: { talents_seen: 1 } }, "Điểm số lên, cuốn vở vẽ nằm im")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AR, "kts_d_contest", [22, 38], () => true, (c) => T(c.poor_country ? "Cuộc thi nhà chống lũ" : "Cuộc thi nhà ở giá rẻ", c.poor_country
    ? "Một quỹ phát triển mở cuộc thi thiết kế nhà chống lũ cho vùng ven sông, giá xây không quá một năm thu nhập của một hộ nông dân. Giải nhất được xây thật hai trăm căn."
    : "Thành phố mở cuộc thi thiết kế nhà ở giá rẻ cho người trẻ, mỗi căn dưới ba mươi mét vuông. Giải nhất được xây thật một khu hai trăm căn.", [
    C("Nghỉ việc ba tháng để dự thi", { counters: { doors_seen: 1 }, money: -0.2, gamble: { p: 0.4, win: { ...become(AR), flags: ["won_contest"], log: "Phương án của bạn đoạt giải. Ba văn phòng thiết kế gọi điện ngay trong tuần." }, lose: { happy: -4, know: 3, log: "Bạn vào chung khảo rồi dừng lại. Bộ bản vẽ nằm trong ống giấy trên nóc tủ." } } }, "Mất ba tháng lương, cược lấy một cái tên"),
    C("Lập nhóm với hai người bạn, chia giải", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.3, win: { ...become(AR), flags: ["team_studio"], log: "Nhóm ba người đoạt giải nhì và quyết định mở văn phòng chung." }, lose: { rel: 2, log: "Nhóm trượt, nhưng ba người vẫn ngồi với nhau đến sáng." } } }, "Chia công chia giải, đỡ đơn độc"),
    C("Thôi, để năm sau", { counters: { doors_seen: 1 }, happy: 1 })], 2)),
  door(AR, "kts_d_office", [22, 40], (c) => c.has_degree || f(c, "job_build") || f(c, "job_office") || f(c, talentFlag(AR)), () => T("Văn phòng của người nổi tiếng", "Một kiến trúc sư nổi tiếng cần người dựng hình: lương bằng nửa công ty xây dựng, làm đến mười giờ đêm, tên bạn sẽ không có trên công trình nào. Đổi lại, bạn được ngồi cạnh bàn vẽ của người ấy. Cùng lúc, một công ty xây dựng cần người vẽ nhà phố, lương ổn định.", [
    C("Nhận, học từ người giỏi nhất", { ...become(AR), flags: ["star_office"], counters: { doors_seen: 1 }, money: -0.05, health: -2 }, "Lương thấp, giờ dài, học nhanh"),
    C("Vào công ty xây dựng, vẽ nhà phố", { ...become(AR), flags: ["builder_office"], counters: { doors_seen: 1 }, money: 0.05 }, "Lương ổn, ít chỗ cho sáng tạo"),
    C("Không, ở lại việc hiện tại", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(AR, 1, 1, (c) => T("Thêm một tầng ngoài giấy phép", `${f(c, "won_contest") ? "Nhờ giải thưởng, khách đầu tiên tự tìm đến bạn. " : f(c, "star_office") ? "Người thầy nổi tiếng cho bạn tự nhận một ca nhỏ. " : ""}Bản vẽ đầu tiên mang tên bạn là ${c.country === "VN" ? "một căn nhà ống bốn mét mặt tiền" : "một căn nhà hai tầng cho một gia đình trẻ"}. Chủ nhà muốn xây thêm một tầng so với giấy phép: "Ai cũng làm thế, phạt thì nộp." Móng bạn tính cho hai tầng.`, [
    C("Từ chối, vẽ đúng giấy phép", { counters: step(c, AR), flags: ["by_permit"], money: -0.04, gamble: { p: 0.5, win: { counters: { kts_name: 1 }, log: "Chủ nhà càu nhàu nhưng giữ bạn. Ba năm sau, họ giới thiệu thêm bốn khách." }, lose: { log: "Chủ nhà thuê người khác vẽ lại. Bạn mất khách hàng đầu tiên." } } }, "Có thể mất khách đầu tiên"),
    C("Vẽ thêm tầng, gia cố móng, không khai", { counters: step(c, AR), flags: ["extra_floor"], money: 0.06, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [3, 10], note: "ký bản vẽ khác với ngôi nhà được xây thật" } }, "Khách vui, giấy phép và ngôi nhà lệch nhau"),
    C("Xin phép bổ sung, thuyết phục chủ nhà chờ", { counters: step(c, AR), bw: -4, gamble: { p: 0.45, win: { flags: ["by_permit"], counters: { kts_name: 1 }, log: "Bốn tháng sau, giấy phép mới được cấp. Ngôi nhà ba tầng đứng thẳng." }, lose: { money: -0.03, log: "Hồ sơ bị trả về hai lần. Chủ nhà mất kiên nhẫn và tự xây theo ý họ." } } }, "Mất bốn tháng, ai cũng ngủ yên", { tier: "awakened" })], 0)),
  beat(AR, 2, 3, (c) => T("Khu nghỉ dưỡng trên đồi", `${f(c, "extra_floor") ? `Một chủ đầu tư nghe nói bạn "dễ làm việc".` : f(c, "by_permit") ? "Một chủ đầu tư nghe nói bạn khó tính, nhưng chưa bản vẽ nào của bạn bị phạt." : "Một chủ đầu tư tìm đến văn phòng bạn."} Họ muốn bạn thiết kế khu nghỉ dưỡng trên ngọn đồi nhìn ra biển, nơi có một làng chài bốn mươi hộ. Cùng tháng, thành phố mời bạn thiết kế một thư viện nhỏ, kinh phí eo hẹp.`, [
    C("Nhận khu nghỉ dưỡng", { counters: step(c, AR), income_mult: 1.5, flags: ["developer_ties"] }, "Tiền lớn, làng chài phải dời đi"),
    C("Nhận thư viện", { counters: step(c, AR, { kts_name: 2 }), flags: ["public_work"] }, "Ít tiền, tên bạn trên một công trình công"),
    C("Nhận khu nghỉ, giữ làng chài trong thiết kế", { counters: step(c, AR), gamble: { p: 0.4, win: { income_mult: 1.3, flags: ["village_kept", "developer_ties"], counters: { kts_name: 1 }, log: "Chủ đầu tư chịu. Làng chài thành điểm đến, dân làng có việc." }, lose: { income_mult: 1.05, log: "Chủ đầu tư thuê người khác. Bạn còn bộ bản vẽ và lời cảm ơn của trưởng làng." } } }, "Đề nghị luật chơi khác, có thể mất hợp đồng", { tier: "sovereign" })], 0)),
  beat(AR, 3, 4, (c) => T("Vết nứt trên dầm", `${f(c, "developer_ties") ? "Tòa nhà chính của khu nghỉ dưỡng" : f(c, "extra_floor") ? "Ngôi nhà đầu tiên bạn từng cho xây thêm tầng" : f(c, "public_work") ? "Thư viện mang tên bạn" : "Một trường học bạn thiết kế"} xuất hiện những vết nứt chéo trên dầm. Bạn biết nhà thầu đã thay thép trong bản vẽ bằng loại rẻ hơn. Nhà thầu gửi một phong bì dày và tờ biên bản ghi "nứt bề mặt, không ảnh hưởng kết cấu".`, [
    C("Báo cơ quan chức năng, cho người dân dọn ra", { counters: step(c, AR, { kts_name: 1 }), income_mult: 0.8, flags: ["reported_cracks"], happy: -2 }, "Mất khách lớn, có thể cứu nhiều người"),
    C("Nhận tiền, ký biên bản", { counters: step(c, AR), money: 0.4, flags: ["hid_cracks"], secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [2, 8], note: "nhận tiền ký biên bản che vết nứt công trình" } }, "Tiền lớn hôm nay, một tòa nhà chờ ngày"),
    C("Tự bỏ tiền thuê kiểm định độc lập, công bố", { counters: step(c, AR), money: -0.3, agency: 0.03, gamble: { p: 0.6, win: { flags: ["independent_audit"], counters: { kts_name: 2 }, log: "Kiểm định chỉ ra lỗi ở vật liệu thay thế. Nhà thầu phải gia cố, tên bạn được giữ sạch." }, lose: { flags: ["independent_audit"], income_mult: 0.85, log: "Kiểm định cho thấy một phần lỗi nằm ở bản vẽ của bạn. Bạn chịu tiền sửa." } } }, "Tốn tiền túi, sự thật có thể chạm cả bạn", { tier: "sovereign" }),
    C("Trả chứng chỉ hành nghề, rời nghề", { ...leave(AR), counters: step(c, AR), flags: ["ex_architect"], happy: -2 }, "Thoát khỏi mọi chữ ký, mất nghề")], 0)),
  beat(AR, 4, 5, (c) => {
    if (f(c, "hid_cracks")) return T("Đêm mưa ở công trình cũ", "Sau một trận mưa lớn, một mảng tường của công trình năm ấy đổ xuống trong đêm. Không ai chết, nhưng hai mươi gia đình mất chỗ ở. Cơ quan điều tra mời bạn lên làm việc; nhà thầu đã khai trước.", [
      C("Khai hết, kể cả phong bì năm ấy", { counters: step(c, AR), unflags: ["hid_cracks"], flags: ["confessed"], income_mult: 0.5, money: -0.4, agency: 0.02 }, "Mất nghề và tiền, trả lại sự thật"),
      C("Thuê luật sư, đổ lỗi cho nhà thầu", { counters: step(c, AR), money: -0.5, gamble: { p: 0.45, win: { flags: ["escaped_case"], log: "Nhà thầu lĩnh án. Bạn bị phạt hành chính và vẫn hành nghề." }, lose: { income_mult: 0.5, flags: ["license_lost"], log: "Tòa xác định bạn biết mà vẫn ký. Chứng chỉ của bạn bị thu hồi." } } }, "Có thể thoát, có thể mất hết"),
      C("Bỏ tiền dựng nhà tạm cho hai mươi hộ", { counters: step(c, AR), money: -0.8, rel: 4, flags: ["rebuilt_homes"] }, "Chuộc lỗi bằng tiền, bí mật vẫn còn")], 0);
    if (f(c, "reported_cracks") || f(c, "independent_audit") || f(c, "public_work") || f(c, "village_kept")) return T("Bệnh viện cho cả vùng", `Chính quyền giao bạn thiết kế một bệnh viện một nghìn giường${(c.counters.kts_name ?? 0) >= 3 ? ", vì tên tuổi bạn đã đủ để không ai phản đối" : ""}. Họ muốn khánh thành trong hai năm, kịp một ngày lễ lớn. Bạn biết làm đúng cần bốn năm.`, [
      C("Nhận, rút gọn mọi thứ cho kịp", { counters: step(c, AR, { kts_name: 1 }), income_mult: 1.4, gamble: { p: 0.5, win: { flags: ["landmark"], log: "Bệnh viện khánh thành đúng ngày. Hai năm sau mới phải sửa hệ thống thông gió." }, lose: { happy: -6, flags: ["rushed_flaws"], log: "Khánh thành đúng ngày, rồi đóng cửa một khu vì thấm dột sau mùa mưa đầu." } } }, "Vinh quang đúng hẹn, chất lượng là canh bạc"),
      C("Đề xuất hai giai đoạn: kịp lễ một nửa, làm đúng", { counters: step(c, AR), agency: 0.02, gamble: { p: 0.55, win: { income_mult: 1.25, flags: ["landmark"], counters: { kts_name: 2 }, log: "Họ đồng ý. Nửa đầu khánh thành kịp lễ, nửa sau xong đúng chuẩn." }, lose: { log: "Họ giao dự án cho người hứa xong trong hai năm." } } }, "Đổi luật dự án, có thể mất nó", { tier: "sovereign" }),
      C("Giao cho nhóm trẻ bạn kèm, bạn đứng sau", { counters: step(c, AR), income_mult: 1.1, rel: 3, flags: ["passed_on_early"] }, "Người trẻ có tên, bạn có thời gian")], 1);
    return T("Bốn mươi tòa tháp", `${f(c, "developer_ties") ? "Chủ đầu tư khu nghỉ dưỡng năm ấy" : "Một tập đoàn bất động sản"} mời bạn làm cổ đông, đứng tên thiết kế cho cả một khu đô thị bốn mươi tòa tháp. Bạn sẽ không kịp xem kỹ từng bản vẽ.${f(c, "builder_office") ? " Những người cùng vẽ nhà phố năm xưa đều khuyên bạn nhận." : ""}`, [
      C("Nhận làm cổ đông", { counters: step(c, AR), income_mult: 1.6, flags: ["partner_dev"] }, "Giàu nhanh, tên bạn trên thứ bạn không kiểm"),
      C("Mở xưởng thiết kế nhỏ của riêng mình", { counters: step(c, AR), income_mult: 0.9, happy: 5, flags: ["own_studio"] }, "Ít tiền, mỗi bản vẽ là của bạn"),
      C("Nhận, với điều kiện có hội đồng kiểm định độc lập", { counters: step(c, AR), gamble: { p: 0.4, win: { income_mult: 1.4, flags: ["partner_dev", "audit_board"], log: "Họ đồng ý. Hội đồng kiểm định chặn được ba bản vẽ lỗi ngay năm đầu." }, lose: { log: "Họ chọn một kiến trúc sư ít điều kiện hơn." } } }, "Kiếm ít hơn, ngủ ngon hơn", { tier: "sovereign" })], 0);
  }),
  beat(AR, 5, 6, (c) => T("Ngôi nhà đầu tiên, hai mươi năm sau", `Bạn đi ngang ngôi nhà đầu tiên mình thiết kế. ${f(c, "extra_floor") ? "Tầng xây thêm năm ấy đã có vết nứt dọc chân tường." : "Cây trồng trước cửa đã cao quá mái."} Gia đình ấy nhận ra bạn, mời vào uống nước, kể rằng các con họ đã lớn lên trong những căn phòng bạn vẽ.${f(c, "confessed") ? " Họ biết chuyện của bạn qua báo, nhưng vẫn mời." : ""}`, [
    C("Tặng họ bản thiết kế sửa nhà, không lấy tiền", { counters: step(c, AR), money: -0.03, rel: 4, happy: 4, flags: ["passed_on"] }, "Mất công vài tuần, khép lại một vòng"),
    C("Đưa sinh viên đến xem, dạy từ chính lỗi của mình", { counters: step(c, AR), know: 3, happy: 2, flags: ["teacher"] }, "Phơi hồ sơ cũ cho người khác học", { tier: "awakened" }),
    C("Bán bộ bản vẽ gốc cho một bảo tàng", { counters: step(c, AR), money: 0.3 }, "Có tiền, bản vẽ thôi là của bạn")], 0), (c) => c.age >= 42),

  /* ---------- chuyện thường ngày ---------- */
  daily(AR, "kts_client_taste", [24, 65], 9, (c) => { const vn = c.country === "VN";
    return T(vn ? "Lời thầy phong thủy" : "Căn nhà trong tạp chí", vn
      ? "Chủ nhà mang đến lời thầy phong thủy: cửa chính phải lệch sang trái một mét, cầu thang không được nhìn ra cổng. Mọi thứ bạn tính về gió và ánh sáng đổ vỡ."
      : "Chủ nhà mang đến một trang tạp chí: họ muốn căn nhà giống hệt biệt thự trong ảnh, dù mảnh đất chỉ bằng một phần ba và quay ngược hướng nắng.", [
      C("Làm theo, khách là vua", { money: 0.04, counters: { kts_name: -1 } }, "Tiền dễ, công trình không còn là của bạn"),
      C("Tìm phương án vừa ý họ, vừa đúng gió nắng", { bw: -4, counters: { kts_name: 1 } }, "Thêm hai tuần vẽ lại, cả hai cùng được", { tier: "awakened" }),
      C("Trả lại hợp đồng", { money: -0.03, happy: 1, flags: ["picky_architect"] }, "Giữ chuẩn của mình, mất khách")], 0); }),
  daily(AR, "kts_unpaid", [24, 65], 9, () => T("Khách quỵt bốn mươi phần trăm", "Ngôi nhà đã xây xong theo bản vẽ của bạn, gia đình đã dọn vào ở. Phần phí thiết kế còn lại, bốn mươi phần trăm, họ cứ hẹn tháng sau suốt một năm.", [
    C("Khởi kiện", { money: -0.05, bw: -4, gamble: { p: 0.5, win: { money: 0.15, log: "Tòa xử bạn thắng. Họ trả đủ, rồi không chào bạn nữa." }, lose: { flags: ["contract_lesson"], log: "Hợp đồng thiếu một điều khoản. Bạn mất thêm án phí." } } }, "Tốn công, có thể lấy lại tiền"),
    C("Bỏ qua, coi như học phí", { happy: -2, flags: ["contract_lesson"] }, "Mất tiền, hợp đồng sau chặt hơn"),
    C("Đề nghị họ trả bằng cách giới thiệu khách", { gamble: { p: 0.6, win: { money: 0.05, counters: { kts_name: 1 }, log: "Họ giới thiệu ba khách mới. Bạn thôi nhắc khoản nợ." }, lose: { log: "Họ hứa, rồi im lặng." } } }, "Biến món nợ thành mối quen", { tier: "awakened" })], 1)),
  daily(AR, "kts_credit", [23, 50], 10, (c) => T("Tên ai trên hồ sơ dự thi", vary("ktc", c.age, ["Đêm trước hạn nộp hồ sơ dự thi, cả văn phòng thức trắng. Ý tưởng chính là của bạn, nhưng người ký tên là giám đốc.", "Công trình bạn vẽ chín phần mười vừa được lên báo. Bài viết chỉ nhắc tên người đứng đầu văn phòng."]), [
    C("Im lặng, học thêm", { know: 3, health: -1 }, "Yên chuyện, công sức thành của người khác"),
    C("Đòi ghi tên mình vào nhóm thiết kế", { gamble: { p: 0.5, win: { counters: { kts_name: 1 }, log: "Tên bạn được thêm vào, ở dòng thứ hai." }, lose: { happy: -3, flags: ["office_friction"], log: "Giám đốc gật đầu, rồi từ đó giao cho bạn toàn việc vặt." } } }, "Có thể có tên, có thể mất chỗ đứng")], 0)),
  daily(AR, "kts_permit", [24, 65], 9, (c) => T("Hồ sơ xin phép nằm im", c.poor_country || c.country === "VN"
    ? `Hồ sơ xin phép xây dựng của khách nằm ở phòng quản lý đô thị ba tháng. Một người quen gợi ý "chi phí bôi trơn" bằng một tháng thu nhập của bạn, xong trong một tuần.`
    : `Hồ sơ xin phép của khách nằm chờ chín tháng. Một người môi giới nói quen người trong sở, xong trong ba tuần nếu trả phí "tư vấn".`, [
    C("Đưa tiền cho xong", { money: -0.08, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [2, 8], note: "đưa tiền bôi trơn giấy phép xây dựng" } }, "Nhanh, có một bí mật"),
    C("Chờ, giải thích với khách", { happy: -3, counters: { honest: 1 } }, "Sạch, khách sốt ruột"),
    C("Rủ các văn phòng công khai thời gian chờ từng hồ sơ", { bw: -4, agency: 0.02, flags: ["leader"] }, "Mất thời gian, có thể đổi cách cả ngành chờ", { tier: "sovereign" })], 1)),
  daily(AR, "kts_heritage", [25, 65], 9, (c) => T("Ngôi nhà trăm năm", `Khu đất của khách có một ngôi nhà ${c.country === "VN" ? "mái ngói rêu phong từ thời ông bà" : "gạch đỏ hơn trăm năm tuổi"}. Khách muốn phá để xây tòa văn phòng mười tầng. Một hội những người yêu phố cũ đang thu chữ ký phản đối.`, [
    C("Thiết kế đúng ý khách", { money: 0.08, counters: { kts_name: -1 } }, "Tiền tốt, mất một phần thành phố"),
    C("Đề xuất giữ mặt tiền, xây lùi vào trong", { gamble: { p: 0.5, win: { counters: { kts_name: 2 }, flags: ["kept_facade"], log: "Khách đồng ý. Tòa nhà mới đứng sau mặt tiền cũ, ảnh lên khắp các trang kiến trúc." }, lose: { money: -0.02, log: "Khách thuê người khác. Ngôi nhà bị phá trong một tuần." } } }, "Có thể mất hợp đồng, có thể giữ được lịch sử", { tier: "awakened" }),
    C("Rút khỏi dự án, ký vào đơn phản đối", { money: -0.05, flags: ["heritage_activist"] }, "Đứng về phía phố cũ, mất khách")], 0)),
  daily(AR, "kts_glass", [24, 65], 9, (c) => T("Tòa kính dưới nắng", `Khách muốn một tòa nhà toàn kính cho "hiện đại". Ở ${c.poor_country ? "cái nắng bốn mươi độ này" : "nơi mùa hè mỗi năm một nóng hơn"}, nó sẽ chạy điều hòa quanh năm. Phương án che nắng và thông gió tự nhiên của bạn đắt hơn mười phần trăm lúc xây.`, [
    C("Làm tòa kính", { money: 0.04 }, "Khách vui, hóa đơn điện của họ thì không"),
    C("Thuyết phục khách theo phương án mát tự nhiên", { bw: -3, gamble: { p: 0.5, win: { flags: ["green_design"], counters: { kts_name: 1 }, log: "Năm đầu tiên, hóa đơn điện của tòa nhà chỉ bằng nửa tòa kính bên cạnh." }, lose: { log: "Khách nghe hết, rồi vẫn chọn kính." } } }, "Mất công thuyết phục, có thể không được"),
    C("Bớt phí thiết kế để bù phần chênh", { money: -0.06, flags: ["green_design"], counters: { kts_name: 1 } }, "Chịu thiệt bây giờ, có công trình để đời", { longterm: true })], 1)),
  daily(AR, "kts_sketch", [25, 60], 9, (c, N) => { const r = role(c, "rival")!;
    return T("Giải thưởng cho bản phác thảo cũ", `${N(r)} vừa đoạt một giải kiến trúc với thiết kế giống đến lạ bản phác thảo bạn bỏ dở, bản bạn từng cho ${N(r)} xem trong một buổi cà phê năm năm trước.`, [
      C("Công khai bản phác thảo có ngày tháng", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bị tố chép bản phác thảo trước hội đồng giải" }, gamble: { p: 0.4, win: { counters: { kts_name: 1 }, log: "Hội đồng giải ghi nhận bạn là đồng tác giả." }, lose: { happy: -3, log: "Hội đồng nói hai ý tưởng giống nhau là chuyện thường." } } }, "Có thể lấy lại tên, chắc chắn mất một người quen"),
      C("Gọi điện, đề nghị cùng làm dự án sau", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "cùng làm dự án sau vụ bản phác thảo" }, log: `${N(r)} im một lúc, rồi nhận lời.` }, lose: { log: `${N(r)} nói không hiểu bạn đang nói gì.` } } }, "Nuốt tự ái, có thể được một cộng sự", { tier: "awakened" }),
      C("Bỏ qua, vẽ cái mới", { happy: -2 }, "Đỡ mệt, ý tưởng cũ thành của người khác")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(AR, "kts_scaffold", [24, 65], 9, () => T("Giàn giáo không dây an toàn", `Ở công trình của bạn, công nhân leo giàn giáo tầng bảy không đeo dây an toàn. Nhà thầu cười: "Họ quen rồi, đeo vào còn vướng." Tiến độ đang chậm hai tuần.`, [
    C("Dừng công trình đến khi đủ dây", { money: -0.03, flags: ["safety_first"], counters: { kts_name: 1 } }, "Chậm thêm, chủ đầu tư bực"),
    C("Nhắc một câu rồi đi", { gamble: { p: 0.85, win: { log: "Công trình xong mà không ai bị gì." }, lose: { happy: -8, flags: ["site_accident"], log: "Một công nhân trượt chân, gãy chân. Bạn nghĩ mãi về câu nhắc vội hôm ấy." } } }, "Đúng tiến độ, cược bằng người khác"),
    C("Tự mua dây, trừ vào phí của bạn", { money: -0.02, flags: ["safety_first"], counters: { kind: 1 } }, "Mất ít tiền, không phải đợi ai", { tier: "awakened" })], 0)),
  daily(AR, "kts_neighbor", [25, 70], 9, (c, N) => { const n = role(c, "neighbor")!;
    return T("Nhà bên muốn xây cao", `${N(n)} nhờ bạn vẽ giúp phần nới thêm hai tầng, miễn phí "vì là hàng xóm". Hai tầng ấy sẽ che hết nắng buổi sáng vào cửa sổ nhà bạn.`, [
      C("Vẽ giúp, đúng như họ muốn", { trust: { npc: n, delta: 0.2 }, happy: -2 }, "Giữ tình hàng xóm, mất nắng"),
      C("Vẽ giúp, lùi tầng trên để hai nhà cùng có nắng", { bw: -3, gamble: { p: 0.6, win: { trust: { npc: n, delta: 0.3 }, log: "Họ đồng ý. Sân thượng lùi vào thành chỗ hai nhà ngồi uống trà." }, lose: { trust: { npc: n, delta: -0.1 }, log: "Họ cho là bạn vẽ vì lợi riêng, rồi thuê người khác." } } }, "Cả hai cùng được, nếu họ tin bạn", { tier: "awakened" }),
      C("Từ chối, nói thẳng lý do", { trust: { npc: n, delta: -0.2 } }, "Rõ ràng, lạnh tình")], 1, { npc: n }); }, (c) => !!role(c, "neighbor")),
  daily(AR, "kts_together", [24, 70], 9, (c) => T("Vẽ cùng người dân, không thù lao", c.poor_country
    ? "Một nhóm thiện nguyện mời bạn cùng người dân một khu nhà tự dựng ven kênh vẽ lại lối đi, chỗ thoát nước và sân chơi. Không có thù lao, họp vào tối Chủ nhật."
    : "Một nhóm thiện nguyện mời bạn cùng những người không nhà thiết kế một khu nhà tạm. Không có thù lao, họp vào tối Chủ nhật.", [
    C("Tham gia, vẽ cùng người dân", { money: -0.02, happy: 4, bw: -3, flags: ["community_design"], counters: { kind: 1 } }, "Mất cuối tuần, học được thứ trường không dạy"),
    C("Gửi vài bản phác thảo rồi thôi", { counters: { kind: 1 } }, "Nhẹ việc, bản vẽ có thể không hợp với họ"),
    C("Từ chối", { happy: -1 }, "Giữ cuối tuần cho mình")], 0)),

  /* ---------- gia đình ---------- */
  cross(AR, "kts_home", [25, 70], (c) => !!role(c, "father") || !!role(c, "mother"), (c, N) => { const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Ngôi nhà cho bố mẹ", c.country === "VN"
      ? `${N(p)} muốn xây lại ngôi nhà ở quê: nhà ba gian, bàn thờ chính giữa, sân phơi thóc. Bạn có bản vẽ một ngôi nhà mát, dễ chăm cho người già. Anh chị em bàn nhau góp tiền, ai cũng có ý kiến.`
      : `${N(p)} muốn xây lại ngôi nhà cũ của gia đình, đúng như ngày xưa. Bạn có bản vẽ một ngôi nhà một tầng, không bậc thềm, dễ sống cho người già. Anh chị em bàn nhau góp tiền, ai cũng có ý kiến.`, [
      C("Vẽ đúng ý bố mẹ", { trust: { npc: p, delta: 0.25 }, money: -0.2, happy: -1 }, "Bố mẹ vui, bạn biết căn nhà khó sống"),
      C("Thuyết phục theo bản vẽ của bạn", { money: -0.2, gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.2 }, counters: { kts_name: 1 }, log: `Ba năm sau, ${N(p)} bảo căn nhà mới là thứ tốt nhất bạn từng làm.` }, lose: { trust: { npc: p, delta: -0.2 }, log: `${N(p)} dọn vào ở nhưng vẫn nhắc ngôi nhà cũ mỗi bữa cơm.` } } }, "Nhà tốt hơn, có thể làm bố mẹ buồn"),
      C("Ngồi vẽ cùng bố mẹ qua nhiều lần về thăm", { bw: -5, money: -0.2, trust: { npc: p, delta: 0.35 }, flags: ["designed_with_parents"] }, "Mất nhiều chuyến về, căn nhà là của cả nhà", { tier: "awakened" })], 2, { npc: p }); }),
];

/* ================================================================ BÁC SĨ THÚ Y */
const VT = "vet";

const VET: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(VT, "vet_t_bird", [8, 14], () => true, (c) => T("Con chim sẻ gãy cánh", "Bạn nhặt được một con chim sẻ gãy cánh dưới gốc cây. Bạn nẹp cánh nó bằng hai que kem, cho ăn bằng ống nhỏ giọt suốt ba tuần. Sáng nay nó bay qua hàng rào.", [
    C(`Xin theo ${c.country === "VN" ? "bác thú y trong xã" : "bác sĩ thú y gần nhà"} mỗi cuối tuần`, { happy: 2, flags: [talentFlag(VT)], counters: { talents_seen: 1 } }, "Mất ngày nghỉ, được học từ người làm nghề"),
    C("Xin nuôi một con chó bị bỏ rơi", { money: -0.02, happy: 3, flags: [talentFlag(VT)], counters: { talents_seen: 1 } }, "Tốn tiền ăn, cả nhà phải chịu thêm việc"),
    C("Kể cho cả lớp nghe rồi thôi", { happy: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(VT, "vet_d_outbreak", [22, 40], () => true, (c) => T("Đội tiêm phòng thiếu người", `Dịch bệnh lan trong đàn ${c.poor_country ? "lợn và gà của cả vùng" : "gia cầm ở các trang trại quanh vùng"}. Chính quyền tuyển gấp người vào đội tiêm phòng và giám sát dịch: học cấp tốc hai tháng, lương thấp, đi khắp nơi.`, [
    C("Đăng ký vào đội", { ...become(VT), counters: { doors_seen: 1 }, health: -2, flags: ["outbreak_team"] }, "Lương thấp, vào nghề qua cửa khó nhất"),
    C("Đi học thú y bài bản ba năm", { counters: { doors_seen: 1 }, money: -0.4, gamble: { p: 0.6, win: { ...become(VT), log: "Bạn tốt nghiệp muộn hơn bạn bè, nhưng chắc tay nghề." }, lose: { happy: -3, log: "Năm thứ hai, nhà có việc, bạn bỏ dở." } } }, "Tốn tiền, chậm, chắc tay nghề"),
    C("Thôi", { counters: { doors_seen: 1 } })], 0)),
  door(VT, "vet_d_clinic", [25, 45], (c) => c.has_degree || f(c, "job_health") || f(c, "job_farm") || f(c, talentFlag(VT)), (c) => T("Phòng khám của ông bác sĩ già", `Bác sĩ thú y già ở ${c.country === "VN" ? "đầu chợ huyện" : "thị trấn"} muốn nghỉ. Ông nhượng lại phòng khám bằng nửa giá, chỉ xin một điều: tiếp tục đi khám gia súc cho nông dân nghèo, kể cả khi họ trả chậm. Cùng tháng, một chuỗi phòng khám thú cưng trong thành phố tuyển bác sĩ, lương gấp rưỡi.`, [
    C("Vay tiền nhận phòng khám, giữ lời ông", { custom: `borrow:0.6|become:${VT}`, flags: ["own_clinic", "farm_promise"], counters: { doors_seen: 1 } }, "Nợ lớn, làm chủ, nhận một lời hứa"),
    C("Vào chuỗi phòng khám thú cưng", { ...become(VT), flags: ["chain_clinic"], counters: { doors_seen: 1 } }, "Lương cao, đi kèm chỉ tiêu doanh số"),
    C("Không nhận cả hai", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(VT, 1, 1, (c) => T("Hai cuộc gọi lúc nửa đêm", `Mười một giờ đêm, trời mưa. Một nông dân gọi: con bò đẻ khó, nhà cách hai mươi cây số. Cùng lúc, một khách quen giàu có gọi vì con chó nhỏ nôn hai lần, trả gấp ba tiền công.${f(c, "chain_clinic") ? " Phòng khám chuỗi dặn ưu tiên khách có thẻ hội viên." : ""}${f(c, "farm_promise") ? " Bạn nhớ lời hứa với ông bác sĩ già." : ""}`, [
    C("Đi đỡ đẻ cho con bò", { counters: step(c, VT, { vet_trust: 1 }), health: -2, money: 0.01, flags: ["farm_rounds"] }, "Ít tiền, cả làng biết tên bạn"),
    C("Đến nhà khách giàu", { counters: step(c, VT), money: 0.04, flags: ["city_clients"] }, "Tiền tốt, một người nông dân phải tự xoay"),
    C("Hướng dẫn nông dân qua điện thoại, đi khám chó", { counters: step(c, VT), money: 0.03, gamble: { p: 0.5, win: { flags: ["farm_rounds"], counters: { vet_trust: 1 }, log: "Bạn hướng dẫn từng bước qua điện thoại. Bê con ra đời lúc một giờ sáng." }, lose: { happy: -4, log: "Nông dân làm không kịp. Bê con không sống, con mẹ qua khỏi." } } }, "Cố được cả hai, có thể hỏng một", { tier: "awakened" })], 0)),
  beat(VT, 2, 3, (c) => T("Kháng sinh trộn vào cám", `Chủ một trại ${c.poor_country ? "lợn năm nghìn con" : "gà công nghiệp hai trăm nghìn con"} đề nghị hợp đồng dài hạn: bạn kê đơn kháng sinh trộn đều vào thức ăn để con vật lớn nhanh, ít ốm. Tiền hợp đồng bằng cả năm khám lẻ.${f(c, "farm_rounds") ? " Ông ấy nói chọn bạn vì nông dân quanh vùng ai cũng tin bạn." : ""}`, [
    C("Ký", { counters: step(c, VT), income_mult: 1.5, flags: ["feed_antibiotics"] }, "Thu nhập gấp rưỡi, vi khuẩn nhờn thuốc dần"),
    C("Từ chối", { counters: step(c, VT, { honest: 1 }), happy: 1 }, "Giữ nguyên tắc, giữ nguyên thu nhập cũ"),
    C("Đề xuất gói tiêm phòng và vệ sinh chuồng thay thế", { counters: step(c, VT), agency: 0.02, gamble: { p: 0.5, win: { income_mult: 1.3, flags: ["clean_farm_plan"], counters: { vet_trust: 1 }, log: "Năm đầu trại tốn hơn, năm thứ hai tỷ lệ chết giảm một nửa. Ông chủ giới thiệu bạn cho ba trại khác." }, lose: { income_mult: 1.05, log: "Ông chủ thuê người khác kê đơn kháng sinh." } } }, "Đổi cách nuôi cả trại, có thể mất hợp đồng", { tier: "sovereign" })], 1)),
  beat(VT, 3, 4, (c) => { const city = (f(c, "city_clients") || f(c, "chain_clinic")) && !f(c, "farm_rounds");
    return T(city ? "Lệnh bắt chó thả rông" : "Lệnh tiêu hủy trong bán kính ba cây số", city
      ? "Hai người trong khu phố bị chó dại cắn. Chính quyền ra lệnh bắt và tiêu hủy mọi con chó thả rông hoặc không có giấy tiêm phòng. Nhiều khách quen nhờ bạn ký giấy tiêm cho những con chưa từng được tiêm."
      : `Dịch bùng ở ${f(c, "feed_antibiotics") ? "chính trại lớn bạn từng kê kháng sinh" : "một trại gần đó"}. Lệnh tiêu hủy toàn bộ đàn trong bán kính ba cây số, tiền hỗ trợ chỉ bằng một phần ba giá trị.${f(c, "farm_rounds") ? " Những nông dân bạn từng đỡ đẻ cho bò gọi bạn trước khi gọi chính quyền." : ""} Họ xin bạn ký giấy kiểm dịch cho những đàn chưa có triệu chứng.`, [
      C("Làm đúng lệnh, đứng ra giúp thực hiện", { counters: step(c, VT, { vet_trust: -1 }), flags: ["followed_order"], happy: -5 }, "Đúng luật, mất lòng nhiều người quen"),
      C(city ? "Ký giấy tiêm phòng khống cho khách quen" : "Ký giấy kiểm dịch cho đàn chưa có triệu chứng", { counters: step(c, VT), money: 0.25, flags: ["signed_false_cert"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [1, 6], note: city ? "ký giấy tiêm phòng khống cho chó" : "ký giấy kiểm dịch cho đàn trong vùng dịch" } }, "Cứu người quen hôm nay, dịch có thể lan"),
      C(city ? "Tổ chức tiêm miễn phí cả khu, xin hoãn lệnh" : "Lập quỹ chung với các hộ, xin khoanh vùng hẹp", { counters: step(c, VT), money: -0.2, agency: 0.03, gamble: { p: 0.5, win: { flags: ["coop_fund"], counters: { vet_trust: 2 }, log: city ? "Bảy trăm con chó được tiêm trong một tuần. Lệnh bắt được thu hẹp." : "Chính quyền chấp nhận khoanh vùng hẹp sau khi bạn nộp số liệu xét nghiệm. Hai mươi hộ giữ được đàn." }, lose: { flags: ["coop_fund"], log: city ? "Lệnh không đổi, nhưng ba trăm con chó có giấy tiêm thật và được tha." : "Lệnh không đổi. Quỹ chung vẫn giúp mười hai hộ có vốn nuôi lại." } } }, "Tốn tiền túi và sức, có thể đổi được lệnh", { tier: "sovereign" }),
      C("Bỏ nghề, đi làm việc khác", { ...leave(VT), counters: step(c, VT), flags: ["ex_vet"], happy: -1 }, "Thoát khỏi lựa chọn này, mất nghề")], 0); }),
  beat(VT, 4, 5, (c) => {
    if (f(c, "signed_false_cert")) return T("Ổ dịch ở vùng bên cạnh", "Dịch bùng lại ở vùng bên cạnh. Cơ quan thú y lần ngược nguồn lây, đến những tờ giấy mang chữ ký của bạn. Thanh tra hẹn gặp bạn sáng thứ Hai.", [
      C("Nhận hết trách nhiệm", { counters: step(c, VT), unflags: ["signed_false_cert"], flags: ["confessed"], income_mult: 0.5, agency: 0.02 }, "Mất chứng chỉ một thời gian, không ai gánh thay"),
      C("Nói chữ ký trên giấy bị làm giả", { counters: step(c, VT), gamble: { p: 0.4, win: { income_mult: 0.85, log: "Thanh tra không đủ chứng cứ. Bạn giữ được nghề, mất nhiều khách." }, lose: { income_mult: 0.5, flags: ["license_lost"], log: "Một người chủ trại khai thật. Bạn bị tước chứng chỉ hành nghề." } } }, "Có thể thoát, có thể mất tất cả"),
      C("Lấy tiền tiết kiệm đền cho các hộ bị lây", { counters: step(c, VT, { vet_trust: 1 }), money: -0.7, flags: ["paid_amends"] }, "Cạn tiền, giữ được mặt với mọi người")], 0);
    if (f(c, "coop_fund") || f(c, "clean_farm_plan") || f(c, "followed_order")) return T("Trạm thú y cả vùng", `Chính quyền mời bạn làm trưởng trạm thú y vùng.${(c.counters.vet_trust ?? 0) >= 3 ? " Nông dân ký tên kiến nghị chọn bạn." : ""} Cùng lúc, một dự án quốc tế về bệnh lây từ động vật sang người mời bạn làm việc ở nước ngoài hai năm, lương gấp đôi.`, [
      C("Nhận làm trưởng trạm", { counters: step(c, VT), income_mult: 1.25, flags: ["station_head"], bw: -4 }, "Có quyền, nhiều giấy tờ, ít thời gian khám"),
      C("Đi theo dự án quốc tế", { counters: step(c, VT, { vet_trust: -1 }), income_mult: 1.7, rel: -5, flags: ["one_health_abroad"] }, "Lương gấp đôi, xa những người tin bạn"),
      C("Ở lại, mở lớp cho người chăm thú ở các làng", { counters: step(c, VT, { vet_trust: 2 }), income_mult: 0.95, happy: 4, flags: ["trains_paravets"] }, "Ít tiền, mỗi làng có một người biết nghề", { tier: "awakened" })], 2);
    return T("Chuỗi phòng khám hỏi mua", `Một chuỗi phòng khám thú cưng muốn mua lại ${f(c, "own_clinic") ? "phòng khám của bạn" : "danh sách khách hàng và tên tuổi của bạn"}, giá bằng mấy năm thu nhập. Họ sẽ tăng giá dịch vụ, bỏ những chuyến khám xa và những khoản ghi nợ.`, [
      C("Bán", { counters: step(c, VT), money: 1.2, income_mult: 0.9, flags: ["sold_clinic"] }, "Tiền lớn, khách nghèo mất chỗ khám"),
      C("Bán, kèm điều kiện giữ ngày khám giá rẻ", { counters: step(c, VT), gamble: { p: 0.4, win: { money: 0.9, flags: ["sold_with_terms_vet"], log: "Họ đồng ý, ghi vào hợp đồng. Thứ Tư hằng tuần vẫn là ngày khám giá rẻ." }, lose: { log: "Họ không chịu điều kiện. Bạn vẫn giữ phòng khám." } } }, "Ít tiền hơn, có thể không bán được", { tier: "sovereign" }),
      C("Không bán", { counters: step(c, VT, { vet_trust: 1 }), happy: 2 }, "Giữ chỗ cho khách nghèo, tự gánh mọi rủi ro")], 2);
  }),
  beat(VT, 5, 6, (c) => T("Người kế nghiệp ở phòng khám", `${f(c, "farm_rounds") ? "Đứa con nhà nông năm nào nhìn bạn đỡ đẻ cho con bò" : "Người trợ lý theo bạn mười năm"} giờ đã có chứng chỉ hành nghề và muốn tiếp quản công việc của bạn, trả tiền dần. Một chuỗi phòng khám trả gấp ba, trả ngay.${f(c, "confessed") ? " Chuyện năm xưa của bạn, người ấy biết cả." : ""}${(c.counters.vet_trust ?? 0) >= 4 ? " Cả vùng hỏi bạn định giao cho ai." : ""}`, [
    C("Trao lại cho người trẻ, nhận trả dần", { counters: step(c, VT), money: 0.2, happy: 5, flags: ["passed_on"] }, "Ít tiền, nghề ở lại với vùng"),
    C("Bán cho chuỗi, lấy tiền ngay", { counters: step(c, VT), money: 0.8, happy: -2 }, "Tuổi già yên ổn, phòng khám đổi chủ"),
    C("Làm tiếp đến khi không đi nổi", { counters: step(c, VT, { vet_trust: 1 }), health: -3, happy: 2 }, "Giữ nghề, người trẻ phải đợi")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(VT, "vet_goodbye", [23, 70], 10, (c) => T("Lần tiêm cuối cùng", vary("vtg", c.age, ["Con chó mười lăm tuổi của một gia đình đã không đứng dậy được. Họ không đủ tiền chữa tiếp. Đứa con gái út xin được ở lại trong phòng.", "Bà cụ sống một mình mang con mèo già đến, hỏi bạn có cách nào khác không. Bà không nhắc đến tiền."]), [
    C("Chữa thêm một tháng, không lấy tiền", { money: -0.04, counters: { vet_trust: 1, kind: 1 } }, "Mất tiền thuốc, thêm một tháng cho họ"),
    C("Giúp con vật ra đi nhẹ nhàng, để họ ở bên", { happy: -3, rel: 2, flags: ["gentle_goodbye"] }, "Đau lòng, đúng lúc")], 1)),
  daily(VT, "vet_muzzle", [23, 65], 9, () => T("Con chó không chịu rọ mõm", `Một con chó lớn đến khám, chủ nhất quyết không cho đeo rọ mõm: "Nó hiền lắm." Nó đã gầm gừ hai lần khi bạn chạm vào chân nó.`, [
    C("Từ chối khám nếu không đeo rọ mõm", { rel: -2, flags: ["clinic_rules"] }, "An toàn, mất một khách"),
    C("Khám luôn cho nhanh", { gamble: { p: 0.65, win: { money: 0.01, log: "Nó chỉ gầm gừ. Ca khám xong trong mười phút." }, lose: { health: -5, money: -0.03, counters: { vet_scars: 1 }, log: "Nó cắn vào cổ tay bạn. Bạn nghỉ việc một tuần." } } }, "Giữ khách, cược cổ tay"),
    C("Hẹn lại, chỉ chủ cách tập cho chó quen rọ mõm", { bw: -2, counters: { vet_trust: 1 } }, "Chậm một tuần, lần sau dễ cho cả hai", { tier: "awakened" })], 0)),
  daily(VT, "vet_ledger", [24, 70], 9, (c) => T("Sổ ghi nợ cuối vụ", `${c.country === "VN" ? "Vụ lúa mất mùa, cả xóm nợ tiền thuốc của bạn" : "Một năm hạn hán, nông dân quanh vùng nợ tiền khám của bạn"}, cộng lại bằng hai tháng thu nhập. Phòng khám cũng đang nợ tiền thuốc nhà phân phối.`, [
    C("Xóa nợ cho các hộ khó nhất", { money: -0.15, counters: { vet_trust: 2, kind: 1 } }, "Mất tiền, được lòng cả vùng"),
    C("Đòi đủ, cho trả góp", { money: 0.08, counters: { vet_trust: -1 } }, "Phòng khám sống, vài nhà khó chịu"),
    C("Nhận trả bằng gạo, gà, ngày công sửa nhà", { money: 0.03, flags: ["barter_book"], counters: { vet_trust: 1 } }, "Ít tiền mặt, không ai mất mặt", { tier: "awakened" })], 0)),
  daily(VT, "vet_wild", [24, 65], 9, (c) => T("Con vật lạ trong lồng", `Một người đàn ông mang đến ${c.poor_country ? "một con tê tê bị thương trong lồng sắt" : "một con vẹt quý hiếm không có giấy tờ"}, trả gấp mười tiền khám, dặn đừng hỏi gì. Bạn biết loài này bị cấm buôn bán.`, [
    C("Chữa rồi báo cơ quan bảo vệ động vật hoang dã", { flags: ["reported_wildlife"], gamble: { p: 0.7, win: { counters: { vet_trust: 1 }, log: "Con vật được đưa về trung tâm cứu hộ. Người đàn ông không quay lại." }, lose: { happy: -4, bw: -4, log: "Có người đến phòng khám hỏi ai đã báo. Bạn mất ngủ cả tháng." } } }, "Đúng luật, có thể bị để ý"),
    C("Chữa, nhận tiền, không hỏi", { money: 0.08, counters: { honest: -1 }, flags: ["wildlife_quiet"] }, "Tiền dễ, con vật đi tiếp về chỗ cũ"),
    C("Đi theo đội cứu hộ động vật hoang dã", { unflags: [life(VT)], custom: "become:environmentalist", counters: { kind: 1 } }, "Rời phòng khám, đi theo những con vật không chủ")], 0)),
  daily(VT, "vet_quota", [23, 60], 9, () => T("Chỉ tiêu tháng của phòng khám", "Phòng khám cần thêm doanh thu tháng này. Người quản lý gợi ý: con nào đến cũng nên làm thêm xét nghiệm máu, cạo vôi răng, bán kèm thức ăn chức năng. Phần lớn là không cần.", [
    C("Làm theo, kê thêm cho đủ chỉ tiêu", { money: 0.06, counters: { honest: -1, vet_trust: -1 } }, "Thu nhập tăng, khách trả tiền cho thứ không cần"),
    C("Chỉ làm những gì con vật cần", { money: -0.02, counters: { vet_trust: 1 } }, "Thu nhập thấp hơn, ngủ ngon"),
    C("Dán bảng giá công khai, ghi rõ việc không bắt buộc", { flags: ["price_list"], gamble: { p: 0.55, win: { counters: { vet_trust: 2 }, log: "Khách mới đến vì bảng giá. Doanh thu quý sau còn tăng." }, lose: { money: -0.03, log: "Quản lý gỡ bảng giá xuống sau một tuần." } } }, "Minh bạch, có thể bị gỡ xuống", { tier: "sovereign" })], 1)),
  daily(VT, "vet_strays", [23, 70], 10, (c) => T("Đàn chó mèo hoang sau chợ", vary("vts", c.age, ["Đàn chó mèo hoang sau chợ đã lên bốn mươi con. Một nhóm sinh viên xin bạn triệt sản miễn phí mỗi Chủ nhật; vài hộ dân lại muốn gọi người đến bắt.", "Một cô giáo về hưu nuôi hai mươi con mèo hoang, xin bạn khám chịu, trả dần bằng lương hưu."]), [
    C("Nhận làm miễn phí ngày Chủ nhật", { money: -0.03, bw: -3, happy: 3, flags: ["stray_program"], counters: { kind: 1 } }, "Mất ngày nghỉ, đàn hoang bớt dần"),
    C("Từ chối, phòng khám không làm từ thiện", { money: 0.01 }, "Giữ ngày nghỉ, đàn hoang vẫn tăng")], 0)),
  daily(VT, "vet_fakevax", [24, 65], 9, () => T("Vắc-xin giá nửa tiền", `Một người bán hàng mời bạn lô vắc-xin giá bằng nửa giá nhà phân phối, "hàng xách tay, y hệt". Không có tem nhập khẩu. Nông dân sẽ không bao giờ biết khác nhau.`, [
    C("Mua, giảm giá cho nông dân", { money: 0.05, flags: ["fake_vaccine"], gamble: { p: 0.5, win: { log: "Mùa đó không có dịch. Không ai biết lô vắc-xin ấy có tác dụng hay không." }, lose: { counters: { vet_trust: -2 }, happy: -6, log: "Một đàn đã tiêm vẫn chết vì dịch. Người ta mang lọ vắc-xin đến hỏi bạn." } } }, "Rẻ cho mọi người, cược bằng đàn của họ"),
    C("Từ chối, mua hàng chính hãng", { money: -0.02, counters: { honest: 1 } }, "Đắt hơn, chắc chắn"),
    C("Rủ các bác sĩ thú y khác mua chung giá sỉ", { bw: -3, gamble: { p: 0.6, win: { money: 0.03, flags: ["buying_coop"], log: "Mười hai phòng khám mua chung, giá giảm một phần tư." }, lose: { log: "Họ hứa, rồi ai về nhà nấy." } } }, "Mất công tổ chức, hàng thật giá rẻ", { tier: "sovereign" })], 1)),
  daily(VT, "vet_race", [24, 65], 9, (c) => T("Mũi tiêm trước giờ thi đấu", c.country === "VN"
    ? "Một chủ gà chọi mang con gà đau chân đến, trả hậu hĩnh, nhờ bạn tiêm thuốc giảm đau để nó kịp trận đấu chiều mai."
    : "Chủ một con ngựa đua bị đau chân nhờ bạn tiêm thuốc giảm đau để nó kịp chạy cuộc đua cuối tuần. Tiền công bằng nửa tháng lương.", [
    C("Tiêm, nhận tiền", { money: 0.06, counters: { honest: -1 }, flags: ["doped_animal"] }, "Tiền nhanh, con vật thi đấu trên chân đau"),
    C("Từ chối, kê đơn nghỉ hai tuần", { money: -0.01, counters: { vet_trust: 1 } }, "Mất khách giàu, con vật lành")], 1)),
  daily(VT, "vet_flood", [23, 65], 9, (c) => T("Mùa lũ, chuồng trại ngập", `Nước lên trong một đêm. ${c.poor_country ? "Trâu bò, lợn gà của cả vùng" : "Gia súc ở các trang trại ven sông"} kẹt trong chuồng ngập. Đội cứu hộ cần một bác sĩ thú y đi xuồng cùng, ba ngày liền.`, [
    C("Lên xuồng, đi ba ngày", { health: -4, happy: 4, counters: { vet_trust: 2 }, flags: ["flood_rescue"] }, "Mệt và nguy hiểm, cả vùng nhớ"),
    C("Ở lại phòng khám, nhận ca chuyển về", { money: 0.03, bw: -2 }, "An toàn, chỉ cứu được con nào đến tay"),
    C("Quyên thuốc và thức ăn, gửi theo đội", { money: -0.05, counters: { kind: 1 } }, "Tốn tiền, không tốn sức")], 0)),
  daily(VT, "vet_viral", [23, 60], 9, () => T("Video cứu chú mèo", "Đoạn video bạn cứu một chú mèo con kẹt trong ống cống có hai triệu lượt xem. Một hãng thức ăn thú cưng muốn trả tiền để bạn nói trong video tới rằng đồ ăn của họ là tốt nhất.", [
    C("Nhận quảng cáo, nói như họ muốn", { money: 0.1, counters: { honest: -1 } }, "Tiền dễ, nói điều bạn không chắc"),
    C("Nhận, ghi rõ là quảng cáo, nói điều bạn biết", { money: 0.04, gamble: { p: 0.5, win: { counters: { vet_trust: 1 }, log: "Người xem quý sự thẳng thắn. Hãng vẫn giữ hợp đồng." }, lose: { log: "Hãng rút hợp đồng sau video đầu tiên." } } }, "Ít tiền hơn, giữ được lời mình nói", { tier: "awakened" }),
    C("Từ chối, dùng tiếng tăm kêu gọi nhận nuôi", { flags: ["adopt_drive"], counters: { kind: 1 } }, "Không kiếm được đồng nào, vài chục con có nhà")], 2)),

  /* ---------- gia đình ---------- */
  cross(VT, "vet_home", [24, 70], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    if (c.married && s) return T("Ngôi nhà mười hai con mèo", `Nhà bạn giờ có mười hai con mèo và bốn con chó, con nào cũng là ca bạn không nỡ bỏ. ${N(s)} nói nhẹ nhàng nhưng rõ ràng: "Hoặc chúng có chỗ khác, hoặc tôi đi chỗ khác."`, [
      C("Tìm nhà mới cho gần hết", { trust: { npc: s, delta: 0.2 }, happy: -3 }, "Nhà yên, lòng bạn trống"),
      C("Giữ tất cả", { trust: { npc: s, delta: -0.25 } }, "Giữ những con vật, rạn một mối quan hệ"),
      C("Mở góc nhận nuôi ở phòng khám, tìm chủ mới", { money: -0.08, trust: { npc: s, delta: 0.15 }, flags: ["adoption_corner"] }, "Tốn tiền, nhà nhẹ đi, chúng có nhà mới", { tier: "awakened" })], 2, { npc: s });
    return T("Đàn gà ở nhà bố mẹ", `Đàn gà của ${N(p!)} chết dần, mỗi ngày hai ba con. ${N(p!)} tin bài thuốc cũ của một ông lang trong làng hơn tin bạn: "Bố mẹ nuôi gà từ trước khi con ra đời."`, [
      C("Cãi đến cùng, tiêm cho cả đàn", { trust: { npc: p!, delta: -0.15 }, gamble: { p: 0.7, win: { log: "Đàn gà khỏi. Không ai nhắc lại chuyện cãi nhau." }, lose: { log: "Đàn gà vẫn chết thêm vài con. Bạn và bố mẹ ai cũng thấy mình đúng." } } }, "Cứu được đàn gà, bố mẹ phật ý"),
      C("Để bố mẹ làm theo cách cũ", { trust: { npc: p!, delta: 0.1 }, happy: -2 }, "Giữ hòa khí, mất nửa đàn gà"),
      C("Làm cùng bố mẹ, vừa bài thuốc cũ vừa vắc-xin", { bw: -2, trust: { npc: p!, delta: 0.25 }, flags: ["mixed_remedy"] }, "Mất một ngày nghỉ, ai cũng giữ được thể diện", { tier: "awakened" })], 2, { npc: p! });
  }),
];

export const PACK_MIND_B: Storylet[] = [...SURGEON, ...AI_ENGINEER, ...ARCHITECT, ...VET];
