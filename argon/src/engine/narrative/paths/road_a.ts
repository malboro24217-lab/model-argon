/**
 * Gói "Biển, trời, đường xa" (A): THUYỀN VIÊN VIỄN DƯƠNG · PHI CÔNG · NGƯ DÂN BÁM BIỂN · TÀI XẾ ĐƯỜNG DÀI.
 * Mỗi con đường: 1 năng khiếu · 2 cơ hội · 5 nhịp truyện · ≥9 chuyện thường ngày · 1 chuyện gia đình.
 * Tiền tố: slr_ (thuyền viên), plt_ (phi công), dfs_ (ngư dân), lhl_ (tài xế đường dài).
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const SA = "sailor";
const PL = "pilot";
const DF = "deep_fisher";
const LH = "long_hauler";

const adult = (c: { age: number }): boolean => c.age >= 18;

/* =====================================================================================
 * THUYỀN VIÊN VIỄN DƯƠNG — chín tháng một hợp đồng, lương ngoại tệ, con tàu là cả thế giới.
 * Cờ: slr_paid_fee, slr_academy, slr_engine, slr_studying, slr_good_company, slr_old_ship, slr_contract_tight…
 * Bộ đếm: slr_rank (tay nghề, đường lên sĩ quan), slr_home_calls.
 * ===================================================================================== */
const SAILOR: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SA, "slr_t_harbor", [9, 15], () => true, () => T("Những con tàu ngoài cảng", "Bạn thuộc tên từng con tàu neo ngoài cảng, nhìn cờ là biết tàu của nước nào. Lần đi phà ra đảo, cả thuyền say sóng, chỉ mình bạn đứng ở mũi phà ăn hết bữa trưa.", [
    C("Xin đi học bơi và học thêm tiếng Anh", { money: -0.03, know: 2, flags: [talentFlag(SA)], counters: { talents_seen: 1 } }, "Tốn tiền nhà, mở đường ra biển lớn"),
    C("Ngắm tàu cho vui thôi", { happy: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SA, "slr_d_agency", [18, 32], () => true, (c) => c.poor_country
    ? T("Tờ rơi tuyển thủy thủ", "Tờ rơi dán ở cột điện đầu chợ: “Tuyển thủy thủ đi tàu nước ngoài, lương ngoại tệ, bao ăn ở”. Công ty môi giới đòi phí đào tạo và tiền đặt cọc bằng nửa năm thu nhập của bạn bây giờ. Hợp đồng đầu tiên chín tháng.", [
      C("Vay tiền đóng phí, lên tàu", { custom: "borrow:0.5|become:sailor", flags: ["slr_paid_fee"], counters: { doors_seen: 1 } }, "Mang nợ trước khi kiếm được đồng nào"),
      C("Thi vào trường hàng hải chính quy", { money: -0.05, counters: { doors_seen: 1 }, gamble: { p: 0.45, win: { ...become(SA), flags: ["slr_academy"], know: 4, log: "Bạn đỗ. Hai năm sau bạn lên tàu với tấm bằng sĩ quan dự bị." }, lose: { happy: -3, log: "Bạn trượt kỳ khám thể lực vì mắt kém một độ." } } }, "Chậm hơn, không mất phí môi giới"),
      C("Ở lại trên bờ", { counters: { doors_seen: 1 } })], 0)
    : T("Hợp đồng thủy thủ học việc", "Một hãng tàu hàng tuyển thủy thủ học việc: ba tháng học an toàn trên bờ, rồi lên tàu chạy tuyến xuyên đại dương, chín tháng một hợp đồng. Lương khá, nhưng mỗi năm bạn chỉ ở nhà chừng ba tháng.", [
      C("Ký hợp đồng học việc", { ...become(SA), rel: -2, counters: { doors_seen: 1 } }, "Lương khá, xa nhà chín tháng mỗi năm"),
      C("Thi vào trường hàng hải chính quy", { money: -0.05, counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(SA), flags: ["slr_academy"], know: 4, log: "Bạn đỗ. Hai năm sau bạn lên tàu với tấm bằng sĩ quan dự bị." }, lose: { happy: -3, log: "Bạn trượt kỳ khám thể lực vì mắt kém một độ." } } }, "Chậm hơn, có đường lên sĩ quan"),
      C("Ở lại trên bờ", { counters: { doors_seen: 1 } })], 0)),
  door(SA, "slr_d_engine", [18, 40], () => true, (c, N) => { const nb = role(c, "neighbor"); const who = nb ? N(nb) : "Một người quen trong xóm";
    return T("Chỗ trống dưới hầm máy", `${who} làm máy trưởng trên một tàu chở hàng rời. Thợ máy của tàu bỏ ngang ở cảng, mười hai ngày nữa tàu nhổ neo. Việc là lau dầu, canh máy, dưới hầm nóng năm mươi độ, nhưng lên được là có nghề.`, [
      C("Đi ngay, học nghề dưới hầm máy", { ...become(SA), flags: ["slr_engine"], health: -2, counters: { doors_seen: 1 }, ...(nb ? { trust: { npc: nb, delta: 0.15 } } : {}) }, "Nóng, ồn, nhưng có nghề thật"),
      C("Nhờ giữ chỗ cho chuyến sau", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(SA), flags: ["slr_engine"], log: "Nửa năm sau người ta gọi lại thật. Bạn bay sang một cảng xa để lên tàu." }, lose: { log: "Chuyến sau không còn chỗ. Người máy trưởng đã nghỉ hưu." } } }, "Có thời gian chuẩn bị, có thể mất chỗ"),
      C("Từ chối", { counters: { doors_seen: 1 } })], 0, nb ? { npc: nb } : {}); }),

  /* ---------- mạch truyện ---------- */
  beat(SA, 1, 1, (c) => T("Ca trực bốn giờ sáng", `Con tàu chở ba vạn tấn quặng, hai mươi hai người, bốn quốc tịch. ${f(c, "slr_engine") ? "Dưới hầm máy" : "Trên boong"}, bạn gõ rỉ sơn tám tiếng mỗi ngày. Ngoài giờ, ai muốn học thi chứng chỉ sĩ quan thì phó hai cho mượn sách và cho đứng ca đêm cùng.`, [
    C("Đứng ca đêm học nghề, ngủ ít", { counters: step(c, SA, { slr_rank: 1 }), flags: ["slr_studying"], know: 4, health: -3, bw: -3 }, "Mệt bây giờ, có đường lên sĩ quan"),
    C("Nhận làm thêm giờ lấy tiền", { counters: step(c, SA), money: 0.15, flags: ["slr_overtime"] }, "Gửi về nhiều hơn, khó rời boong"),
    C("Giữ sức, hết ca là ngủ", { counters: step(c, SA), health: 2, happy: 2 }, "Khỏe, đứng yên một chỗ")], 0), adult),
  beat(SA, 2, 3, (c) => T("Hai lời mời ký tàu", `${f(c, "slr_studying") || f(c, "slr_academy") ? "Bạn vừa có chứng chỉ sĩ quan boong hạng ba." : "Bạn đã thành thủy thủ lành nghề, tay chai vì dây cáp."} Hãng cũ mời ký tiếp: tàu mới, bảo hiểm đủ, lương như cũ. Một chủ tàu khác trả gấp đôi để chạy một con tàu ba mươi năm tuổi, đã đổi cờ hai lần, đi những vùng biển ít ai muốn đến.`, [
    C("Ở lại hãng cũ, tàu tốt lương vừa", { counters: step(c, SA), income_mult: 1.15, flags: ["slr_good_company"] }, "An toàn, chậm giàu"),
    C("Lên con tàu già, nhận lương gấp đôi", { counters: step(c, SA), income_mult: 1.6, health: -2, flags: ["slr_old_ship"] }, "Tiền nhiều, không ai bảo lãnh nếu có chuyện"),
    C("Ký tàu già, đòi ghi rõ bảo hiểm và trả lương qua ngân hàng", { counters: step(c, SA), agency: 0.02, gamble: { p: 0.5, win: { income_mult: 1.45, flags: ["slr_old_ship", "slr_contract_tight"], log: "Chủ tàu càu nhàu rồi ký. Bạn gửi một bản hợp đồng cho hội thuyền viên giữ hộ." }, lose: { income_mult: 1.05, log: "Họ gạch tên bạn, lấy người ít hỏi hơn. Hai tháng sau bạn mới có tàu khác." } } }, "Lựa chọn thứ ba: điều khoản trước, lương sau", { tier: "sovereign" })], 0), adult),
  beat(SA, 3, 4, (c) => { const old = f(c, "slr_old_ship"); const tight = f(c, "slr_contract_tight");
    return T("Con tàu bị bỏ lại", `${old ? "Điều bạn lo đã đến: chủ tàu biến mất." : "Giá cước sụp, hãng của bạn phá sản giữa chừng."} Con tàu bị giữ ở một cảng xa vì nợ phí, năm tháng nay không ai trả lương. Nước ngọt chia theo ca, thức ăn do một hội từ thiện ở cảng mang lên. Một người môi giới đề nghị mua vé về nước cho cả đoàn, nếu mọi người ký giấy bỏ quyền đòi lương.${tight ? " Bản hợp đồng bạn gửi hội thuyền viên giờ nằm trên bàn một luật sư." : ""}`, [
      C("Ở lại giữ tàu, chờ tòa bán tàu trả lương", { counters: step(c, SA), money: -0.3, health: -5, bw: -6, flags: ["slr_stayed_aboard"], gamble: { p: tight ? 0.75 : 0.45, win: { money: 0.9, log: "Mười một tháng sau, tòa bán đấu giá con tàu. Bạn nhận đủ lương, trừ phí luật sư." }, lose: { happy: -6, log: "Tiền bán tàu chỉ đủ trả ngân hàng. Bạn về nhà tay trắng." } } }, "Chờ lâu và đói, có thể lấy lại lương"),
      C("Ký giấy, về nước ngay", { counters: step(c, SA), money: -0.4, happy: 3, rel: 3, flags: ["slr_signed_away"] }, "Về với gia đình, mất năm tháng lương"),
      C("Cùng cả đoàn kể chuyện với báo chí", { counters: step(c, SA), agency: 0.03, flags: ["slr_spoke_out"], gamble: { p: 0.5, win: { money: 0.6, rel: 4, log: "Bài báo lan đi. Chính quyền cảng buộc chủ hàng ứng lương cho cả đoàn." }, lose: { income_mult: 0.85, log: "Bài báo ra, lương vẫn chưa về. Vài công ty môi giới lặng lẽ gạch tên bạn." } } }, "Lựa chọn thứ ba: lên tiếng, có thể bị gạch tên", { tier: "sovereign" }),
      C("Về nước và thôi nghề biển", { counters: step(c, SA), ...leave(SA), flags: ["ex_sailor"], money: -0.4, rel: 4 }, "Mất lương, mất nghề, giữ được mình")], 1); }, adult),
  beat(SA, 4, 5, (c) => { const officer = f(c, "slr_studying") || f(c, "slr_academy") || (c.counters.slr_rank ?? 0) >= 2; const burned = f(c, "slr_spoke_out");
    if (officer) return T("Chiếc ghe ngoài khơi lúc nửa đêm", `Bạn đã là thuyền phó, đứng ca đêm trên buồng lái. Ra-đa bắt được một chiếc ghe gỗ trôi dạt, người chen kín, có ai đó vẫy đèn pin. Hãng nhắn: báo trung tâm cứu nạn rồi giữ lịch, chậm một ngày mất cả trăm nghìn đô tiền phạt.${burned ? " Từ vụ con tàu bị bỏ lại, bạn biết bị bỏ mặc giữa biển là thế nào." : ""}`, [
      C("Đổi hướng cứu người, ghi đủ vào nhật ký", { counters: step(c, SA), flags: ["slr_rescuer"], rel: 6, happy: 4, income_mult: 0.9 }, "Cứu người, hãng có thể không ký tiếp"),
      C("Báo trung tâm cứu nạn, giữ hành trình", { counters: step(c, SA), money: 0.1, happy: -6, flags: ["slr_passed_by"] }, "Đúng lệnh hãng, mang theo ánh đèn pin ấy"),
      C("Cứu người, báo cả cứu nạn lẫn báo chí để cảng phải mở", { counters: step(c, SA), agency: 0.03, flags: ["slr_rescuer"], gamble: { p: 0.55, win: { income_mult: 1.2, rel: 8, log: "Hai ngày sau, một cảng cho cập bến. Hãng giữ bạn lại và đưa lên làm thuyền trưởng." }, lose: { income_mult: 0.8, rel: 4, log: "Chín ngày không cảng nào nhận. Mọi người đều sống, nhưng hãng không ký tiếp với bạn." } } }, "Lựa chọn thứ ba: ép hệ thống phải làm phần của nó", { tier: "sovereign" })], 0);
    return T("Tuổi bốn mươi trên boong", `Bạn vẫn là thủy thủ. Công ty môi giới nói các chủ tàu giờ thích người trẻ hơn, rẻ hơn${burned ? ", và tên bạn vẫn nằm trong danh sách “hay gây chuyện”" : ""}. Lưng bạn đau mỗi lần kéo dây. Một con tàu già đang cần người, không ai hỏi giấy khám sức khỏe.`, [
      C("Lên con tàu già không ai muốn đi", { counters: step(c, SA), money: 0.2, health: -6, flags: ["slr_last_old_ship"] }, "Còn lương, sức khỏe là thứ đem cược"),
      C("Lên bờ, làm thợ sửa tàu ở cảng nhà", { counters: step(c, SA), ...leave(SA), flags: ["ex_sailor", "slr_dock_worker"], rel: 4 }, "Lương thấp, tối nào cũng về nhà"),
      C("Vào hội thuyền viên, đi kiểm tra tàu cho anh em", { counters: step(c, SA), agency: 0.03, income_mult: 0.85, flags: ["slr_union_inspector", "leader"] }, "Lựa chọn thứ ba: giữ biển cho người sau, thu nhập ít", { tier: "sovereign" })], 1); }, adult),
  beat(SA, 5, 6, (c) => T("Bàn tuyển thuyền viên", `Một công ty môi giới thuyền viên mời bạn về làm trưởng phòng tuyển dụng. Mỗi sáng có hàng trăm thanh niên từ những vùng nghèo nhất xếp hàng ngoài cửa, giống hệt bạn ngày xưa. ${f(c, "slr_paid_fee") ? "Họ phải đóng một khoản phí, đúng bằng khoản bạn từng đi vay." : "Giám đốc nói phí tuyển dụng thu từ họ là nguồn lời chính."}`, [
    C("Nhận việc, giữ nguyên mức phí", { counters: step(c, SA), income_mult: 1.3, money: 0.3, flags: ["slr_recruiter"] }, "Lương bờ cao, tiền lấy từ túi người nghèo"),
    C("Nhận việc, bỏ phí, đòi chủ tàu trả", { counters: step(c, SA), agency: 0.03, gamble: { p: 0.4, win: { income_mult: 1.1, rel: 5, flags: ["slr_fair_recruiter"], log: "Năm sau, ba chủ tàu chuyển sang tuyển qua bạn vì người bạn đưa lên tàu không ai bỏ ngang." }, lose: { income_mult: 0.8, log: "Sáu tháng sau giám đốc cho bạn nghỉ. Mấy chục thanh niên đã lên tàu không mất đồng nào." } } }, "Lựa chọn thứ ba: đổi luật của nghề, có thể mất ghế", { tier: "sovereign" }),
    C("Về dạy ở trường hàng hải", { counters: step(c, SA), income_mult: 0.7, happy: 5, know: 3, flags: ["slr_teacher"] }, "Lương thấp, nói được sự thật với người trẻ")], 2), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SA, "slr_wifi", [18, 65], 7, (c) => T("Gói mạng trên tàu", vary("slrw", c.age, ["Gói mạng trên tàu: mười megabyte một ngày, đủ gửi vài tấm ảnh. Ai mua thêm thì trừ thẳng vào lương.", "Tàu chạy giữa đại dương, cuộc gọi video với nhà cứ đứng hình ở khuôn mặt người thân đang nói dở.", "Tàu mới lắp mạng vệ tinh nhanh, giá mỗi giờ gọi bằng một bữa ăn ở cảng."]), [
    C("Mua thêm gói, gọi về mỗi tối", { money: -0.04, rel: 3, happy: 2, counters: { slr_home_calls: 1 } }, "Tốn tiền, gần nhà hơn"),
    C("Chỉ nhắn tin cuối tuần, gửi tiền nhiều hơn", { money: 0.03, rel: -3, flags: ["slr_distant"] }, "Dành được tiền, xa dần")], 0)),
  daily(SA, "slr_shore", [18, 65], 7, (c) => T("Bốn tiếng trên bờ", vary("slrs", c.age, ["Tàu cập cảng một đêm. Thuyền trưởng cho mỗi người bốn tiếng lên bờ; từ cầu cảng vào thành phố mất bốn mươi phút taxi.", "Cảng mới xây cách xa thành phố. Ngoài cổng chỉ có một quán ăn và một nhà nghỉ cho thuyền viên do hội từ thiện mở."]), [
    C("Vào thành phố cho biết", { money: -0.03, happy: 4, know: 2, counters: { slr_ports: 1 }, gamble: { p: 0.85, win: { log: "Bạn kịp về tàu, túi có quà cho người nhà." }, lose: { flags: ["slr_late_aboard"], log: "Kẹt xe, bạn về trễ hai mươi phút và bị ghi tên vào sổ kỷ luật." } } }, "Tốn tiền, có thể trễ giờ tàu"),
    C("Ở lại tàu ngủ bù", { health: 2, bw: 2 }, "Khỏe hơn, chẳng thấy gì"),
    C("Ghé nhà thuyền viên, gọi về nhà miễn phí", { rel: 2, happy: 1, counters: { slr_home_calls: 1 } })], 2)),
  daily(SA, "slr_cert", [19, 60], 8, () => T("Chứng chỉ mua sẵn", "Chứng chỉ chữa cháy nâng cao của bạn sắp hết hạn. Học lại mất hai tuần trên bờ không lương. Một người môi giới ở cảng nhà nói có thể “làm giấy” trong ba ngày, không cần đến lớp.", [
    C("Đi học lại hai tuần", { money: -0.06, know: 3, flags: ["slr_certs_clean"] }, "Mất lương, giấy thật, nghề thật"),
    C("Mua giấy cho nhanh", { money: -0.02, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 8], note: "chứng chỉ chữa cháy mua không qua lớp" } }, "Rẻ, nhanh, một bí mật trong hồ sơ")], 0)),
  daily(SA, "slr_drill", [19, 60], 8, () => T("Buổi diễn tập trên giấy", "Sáng mai thanh tra cảng lên tàu. Sổ ghi đã diễn tập hạ xuồng cứu sinh đủ ba tháng một lần, nhưng cái tời đã kẹt từ năm ngoái. Thuyền phó dặn cả tàu: ai hỏi thì nói vừa tập tuần trước.", [
    C("Nói như được dặn", { flags: ["slr_kept_line"], happy: -2 }, "Yên chuyện, cái tời vẫn kẹt"),
    C("Nói thật với thanh tra", { flags: ["slr_whistle"], gamble: { p: 0.5, win: { rel: 2, log: "Tàu bị giữ ba ngày để sửa tời. Thuyền trưởng không nói gì, nhưng gật đầu với bạn ở bữa cơm." }, lose: { income_mult: 0.95, log: "Tàu bị giữ ba ngày. Hợp đồng sau, tên bạn không còn trong danh sách." } } }, "Đúng, có thể mất chỗ"),
    C("Thức cả đêm tự sửa cái tời", { health: -3, bw: -4, counters: { slr_rank: 1 } }, "Mất ngủ, không ai phải nói dối", { tier: "awakened" })], 0)),
  daily(SA, "slr_stowaway", [19, 65], 9, () => T("Người trong hầm hàng", "Hai ngày sau khi rời cảng, thủy thủ trực tìm thấy một thanh niên gầy gò trốn sau đống dây chão, không giấy tờ, chai nước đã cạn. Hãng tàu điện xuống: giữ trong phòng khóa, không ai được nói chuyện với cậu ấy.", [
    C("Làm đúng lệnh hãng", { flags: ["slr_followed_orders"], happy: -2 }, "Không rắc rối, không nhìn vào mắt cậu ấy"),
    C("Mang cơm, ngồi nói chuyện mỗi tối", { rel: 3, happy: 2, flags: ["slr_kind_stowaway"], gamble: { p: 0.7, win: { log: "Ở cảng sau, cậu ấy được bàn giao kèm một lá thư bạn viết về những gì cậu kể." }, lose: { income_mult: 0.95, log: "Thuyền trưởng ghi bạn vào báo cáo vì không chấp hành lệnh." } } }, "Tử tế, có thể bị ghi tên")], 0)),
  daily(SA, "slr_extend", [19, 60], 7, (c) => T("Thêm ba tháng nữa", vary("slre", c.age, ["Người thay ca của bạn không bay sang được vì trục trặc thị thực. Hãng đề nghị bạn ở lại thêm ba tháng, trả thêm hai mươi phần trăm. Bạn đã ở trên tàu mười tháng.", "Biên giới các nước đóng vì dịch, không ai được xuống tàu. Hãng xin bạn ở lại thêm, hứa thưởng khi về."]), [
    C("Ở lại thêm", { money: 0.15, health: -3, rel: -4, counters: { slr_months_extra: 3 } }, "Thêm tiền, mất sức và mất dịp ở nhà"),
    C("Đòi xuống tàu đúng hạn", { rel: 2, happy: 2, income_mult: 0.98, flags: ["slr_insisted_signoff"] }, "Về nhà, bị đánh dấu là khó bảo")], 0)),
  daily(SA, "slr_piracy", [19, 60], 9, () => T("Vùng biển đỏ trên hải đồ", "Hải trình mới đi qua một vùng biển có cướp. Hãng trả lương gấp đôi những ngày đi qua đó; ai không muốn thì xuống tàu ở cảng trước và mất phần thưởng chuyến.", [
    C("Ở lại, nhận lương gấp đôi", { counters: { slr_danger_runs: 1 }, gamble: { p: 0.85, win: { money: 0.12, log: "Tàu qua vùng biển trong năm ngày, chỉ thấy thuyền đánh cá." }, lose: { health: -6, happy: -8, flags: ["slr_shaken"], log: "Một đêm, xuồng lạ bám theo hai tiếng rồi bỏ đi. Nhiều tháng sau bạn vẫn ngủ không yên." } } }, "Tiền gấp đôi, đặt cược giấc ngủ"),
    C("Xuống tàu ở cảng trước", { money: -0.08, rel: 2, flags: ["slr_skipped_risk"] }, "An toàn, mất thưởng chuyến")], 0)),
  daily(SA, "slr_crewmate", [19, 65], 8, () => T("Người bạn cùng ca", "Một thủy thủ cùng ca, người nước khác, ba tuần nay không ăn cùng ai, đêm nào cũng ngồi một mình ở đuôi tàu. Nghe nói ở nhà vợ cậu ấy vừa bỏ đi.", [
    C("Ngồi trực cùng, kể chuyện nhà mình", { bw: -3, rel: 3, happy: 1, flags: ["slr_brother_at_sea"] }, "Mất giấc ngủ, có thêm một người anh em"),
    C("Báo thuyền trưởng cho cậu ấy về sớm", { gamble: { p: 0.6, win: { rel: 1, log: "Cậu ấy được xuống tàu ở cảng sau. Hai năm sau cậu nhắn tin cảm ơn." }, lose: { happy: -2, log: "Cậu ấy bị cắt hợp đồng, mất luôn tiền thưởng chuyến, và không nhìn mặt bạn nữa." } } }, "Đúng quy trình, cậu ấy có thể mất việc"),
    C("Để cậu ấy yên", { bw: 1 })], 0)),
  daily(SA, "slr_house", [20, 60], 9, (c) => T("Ngôi nhà xây bằng lương biển", c.country === "VN"
    ? "Ở quê, nhà bạn đang xây ba tầng bằng tiền bạn gửi về. Mẹ gọi bảo họ hàng ai cũng khen, chỉ cần thêm một khoản để lát đá cổng và làm mâm cơm mừng nhà mới."
    : "Ở nhà, gia đình dùng tiền bạn gửi về để xây thêm một tầng. Họ hàng ai cũng khen, chỉ cần thêm một khoản để làm cho xong trước khi bạn về.", [
    C("Gửi thêm, cho nhà nở mày nở mặt", { money: -0.25, rel: 3, flags: ["slr_big_house"] }, "Nhà đẹp, quỹ phòng thân về không"),
    C("Gửi một nửa, giữ một nửa phòng thân", { money: -0.1, rel: -1, counters: { save: 1 } }, "Mất lòng một chút, có đường lui"),
    C("Bảo dừng lại, để dành vốn cho ngày lên bờ", { rel: -3, flags: ["slr_shore_plan"] }, "Bị trách, có kế hoạch cho ngày bỏ biển", { tier: "awakened" })], 1)),

  /* ---------- gia đình ---------- */
  cross(SA, "slr_family", [22, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => { const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_alive > 0 && k) return T("Người lạ trong nhà", `Bạn về sau mười tháng. ${N(k)} lớn hơn bạn nhớ, chào bạn bằng giọng khách sáo. Mọi việc trong nhà đã có người lo, kể cả những chuyện bạn không hề được biết.`, [
      C("Nghỉ một chuyến, ở nhà trọn một năm", { money: -0.4, happy: 3, trust: { npc: k, delta: 0.3 } }, "Mất một năm lương, có lại đứa con"),
      C("Mua quà thật to rồi đi tiếp", { money: -0.05, trust: { npc: k, delta: -0.1 } }, "Đỡ áy náy, khoảng cách vẫn còn"),
      C("Hẹn gọi video mỗi tối suốt chuyến sau", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "gọi video cho con mỗi tối suốt chuyến tàu", years: 1 } }, "Không mất lương, phải giữ lời giữa đại dương", { tier: "awakened" })], 2, { npc: k });
    return T("Tin nhắn giữa đại dương", `${N(p!)} nhập viện. Tàu còn mười chín ngày nữa mới cập một cảng có sân bay. Người nhà nhắn hỏi khi nào bạn về.`, [
      C("Xin xuống ở cảng gần nhất, tự trả vé", { money: -0.3, income_mult: 0.95, trust: { npc: p!, delta: 0.3 } }, "Tốn kém, mang tiếng bỏ ngang, có mặt ở nhà"),
      C("Gửi tiền viện phí, ở lại hết hợp đồng", { money: -0.15, happy: -3, trust: { npc: p!, delta: -0.1 } }, "Giữ việc, vắng mặt lúc người nhà cần"),
      C("Nhờ người nhà lo, hứa về chăm sau chuyến này", { promise: { to: p!, what: "về chăm bố mẹ sau chuyến tàu", years: 1 } }, "Giữ việc, mang một lời hứa")], 0, { npc: p! }); }),
];

/* =====================================================================================
 * PHI CÔNG — ghế phải, ghế trái, và những giây quyết định trên không.
 * Cờ: plt_bonded, plt_self_funded, plt_bush, plt_speaks_up, plt_reporter, plt_quiet, plt_expat, plt_hid_heart…
 * Bộ đếm: plt_fatigue (những lần bay khi mệt), plt_rep.
 * ===================================================================================== */
const PILOT: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PL, "plt_t_fence", [9, 15], () => true, () => T("Đường băng sau hàng rào", "Bạn đạp xe hai mươi phút ra hàng rào sân bay, ngồi đếm máy bay hạ cánh. Nhìn chúng vào đường băng là bạn đoán được hướng gió. Thầy dạy toán bảo bạn tính nhẩm nhanh nhất lớp.", [
    C("Xin vào câu lạc bộ mô hình bay", { money: -0.03, know: 2, flags: [talentFlag(PL)], counters: { talents_seen: 1 } }, "Tốn tiền, nuôi một giấc mơ đắt"),
    C("Ngắm cho vui, học như mọi người", { counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PL, "plt_d_cadet", [20, 30], () => true, (c) => T("Kỳ tuyển phi công học viên", "Một hãng bay tuyển phi công học viên: năm vòng thi, từ toán, tiếng Anh, tâm lý đến khám mắt. Hãng trả tiền học, đổi lại bạn ký cam kết làm cho hãng mười năm; bỏ ngang thì bồi hoàn toàn bộ. Trường bay tư thì nhận bất kỳ ai trả nổi học phí.", [
    C("Dự tuyển, chấp nhận cam kết mười năm", { counters: { doors_seen: 1 }, gamble: { p: f(c, talentFlag(PL)) ? 0.45 : 0.25, win: { ...become(PL), flags: ["plt_bonded"], log: "Trong ba trăm người dự tuyển, bạn là một trong mười hai người đỗ." }, lose: { happy: -4, log: "Bạn trượt ở vòng phỏng vấn tâm lý, không ai giải thích vì sao." } } }, "Không mất tiền, mất tự do mười năm"),
    C("Vay tiền tự học ở trường bay tư", { custom: "borrow:1.5|become:pilot", agency: 0.01, flags: ["plt_self_funded"], counters: { doors_seen: 1 } }, "Nợ rất lớn, tự do chọn hãng"),
    C("Thôi, giữ việc đang có", { counters: { doors_seen: 1 } })], 0)),
  door(PL, "plt_d_bush", [20, 30], (c) => c.know >= 30 || f(c, talentFlag(PL)), () => T("Hãng bay nhỏ ở vùng xa", "Một hãng bay nhỏ chở thư, thuốc và người ra các đảo và vùng núi xa, cần người lái máy bay một động cơ và sẵn lòng trả tiền cho người mới học tiếp. Đường băng là bãi cỏ dài sáu trăm mét, thời tiết đổi trong mười phút. Lương thấp, nhưng mỗi năm có tám trăm giờ bay.", [
    C("Nhận, đi bay vùng xa", { ...become(PL), flags: ["plt_bush"], health: -2, counters: { doors_seen: 1 } }, "Nhiều giờ bay, nhiều rủi ro"),
    C("Học thêm một năm cho chắc rồi mới nộp", { money: -0.1, know: 3, counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(PL), flags: ["plt_bush"], log: "Năm sau bạn nộp lại. Họ nhận ngay, xếp bạn bay tuyến đảo." }, lose: { log: "Hãng đã đủ người. Tấm bằng mới của bạn nằm trong ngăn kéo." } } }, "Chắc tay hơn, có thể lỡ chỗ"),
    C("Không đi", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PL, 1, 1, (c) => T("Bước kiểm tra bị bỏ qua", `Bạn ngồi ghế phải cạnh một cơ trưởng hai mươi năm kinh nghiệm${f(c, "plt_bush") ? ", người vẫn nhìn bằng nửa con mắt những phi công đi lên từ hãng nhỏ" : ""}. Trước khi cất cánh ở một sân bay đang mưa, ông bỏ qua một bước trong bảng kiểm. Ông không thích bị cơ phó nhắc.`, [
    C("Nhắc rõ ràng, đọc lại bảng kiểm", { counters: step(c, PL), flags: ["plt_speaks_up"], gamble: { p: 0.6, win: { happy: 3, log: "Ông im lặng một lúc rồi làm lại bước đó. Chuyến sau ông xin bay cùng bạn." }, lose: { income_mult: 0.95, log: "Ông làm lại, rồi ghi một nhận xét lạnh lùng về bạn trong phiếu đánh giá." } } }, "Đúng, có thể mất lòng người chấm điểm"),
    C("Im lặng, tự kiểm lại trong đầu", { counters: step(c, PL), flags: ["plt_quiet"], happy: 1 }, "Êm chuyện, tập thói quen im lặng"),
    C("Bay xong, viết báo cáo an toàn ẩn danh", { counters: step(c, PL), flags: ["plt_reporter"], bw: -2 }, "Không đối đầu, nhưng hệ thống biết chuyện", { tier: "awakened" })], 0), adult),
  beat(PL, 2, 3, (c) => { const bonded = f(c, "plt_bonded");
    return T("Lời mời từ bên kia biển", `Bạn đã đủ giờ bay để vào lớp huấn luyện cơ trưởng. Cùng lúc, một hãng bay nước ngoài thiếu người, trả lương gấp đôi, cho nhà ở miễn phí. ${bonded ? "Bạn còn bảy năm cam kết; bỏ đi là phải bồi hoàn tiền học." : f(c, "plt_self_funded") ? "Khoản nợ trường bay vẫn còn hơn một nửa." : "Ở đây bạn có người quen, có đường lên."}`, [
      C("Ở lại, học lên cơ trưởng", { counters: step(c, PL), income_mult: 1.25, flags: ["plt_captain"] }, "Chậm giàu, lên ghế trái ở nhà"),
      C("Sang nước ngoài bay", { counters: step(c, PL), income_mult: 1.7, rel: -5, flags: ["plt_expat"], ...(bonded ? { money: -1 } : {}) }, bonded ? "Bồi hoàn tiền học, lương gấp đôi, xa nhà" : "Lương gấp đôi, xa nhà, vẫn ngồi ghế phải"),
      C("Cùng đồng nghiệp thương lượng lương và lịch bay", { counters: step(c, PL), agency: 0.03, flags: ["plt_union"], gamble: { p: 0.45, win: { income_mult: 1.35, flags: ["plt_captain"], log: "Hãng tăng lương, rút ngắn cam kết để giữ người. Tên bạn đứng đầu lá đơn." }, lose: { income_mult: 1.05, log: "Hãng tăng lương chút ít, nhưng lớp cơ trưởng năm đó không có tên bạn." } } }, "Lựa chọn thứ ba: đòi cho cả đoàn, có thể bị ghi sổ", { tier: "sovereign" })], 0); }, adult),
  beat(PL, 3, 4, (c) => { const tired = (c.counters.plt_fatigue ?? 0) >= 2;
    return T("Nhịp tim lạc", `Kỳ khám sức khỏe định kỳ sắp tới. Mấy tháng nay, sau những chuyến bay đêm${f(c, "plt_expat") ? " ở xứ người" : ""}, tim bạn thỉnh thoảng đập lạc nhịp${tired ? ", nhất là sau những chặng bay thêm khi đã mệt" : ""}. Khai ra, bạn có thể bị dừng bay sáu tháng để làm xét nghiệm. Một bác sĩ quen nói có thể “không thấy gì” trong hồ sơ.`, [
      C("Khai thật, dừng bay để xét nghiệm", { counters: step(c, PL), income_mult: 0.85, money: -0.4, health: 6, flags: ["plt_declared"] }, "Mất nửa năm thu nhập, giữ hồ sơ sạch"),
      C("Nhờ bác sĩ quen bỏ qua", { counters: step(c, PL), money: 0.1, flags: ["plt_hid_heart"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 8], note: "hồ sơ sức khỏe phi công bị làm sạch" } }, "Bay tiếp, mang theo một bí mật trong lồng ngực"),
      C("Khai thật, lập nhóm hỗ trợ sức khỏe cho phi công", { counters: step(c, PL), agency: 0.03, money: -0.3, flags: ["plt_declared", "plt_peer_group"], gamble: { p: 0.5, win: { rel: 5, log: "Hãng đồng ý trả lương cơ bản cho người phải dừng bay vì sức khỏe. Mười một phi công khác lên tiếng sau bạn." }, lose: { happy: -2, log: "Hãng ghi nhận rồi để đó. Vài đồng nghiệp ngại ngồi cùng bàn với bạn." } } }, "Lựa chọn thứ ba: mở đường cho người đến sau", { tier: "sovereign" }),
      C("Rời buồng lái, xin chuyển sang điều phối bay", { counters: step(c, PL), ...leave(PL), flags: ["ex_pilot"], health: 4, happy: -3 }, "Đất bằng, lương thấp, ngủ đủ giấc")], 0); }, adult),
  beat(PL, 4, 5, (c) => { const crew = f(c, "plt_speaks_up") || f(c, "plt_reporter") || f(c, "plt_mentor"); const hid = f(c, "plt_hid_heart");
    const adj = (crew ? 0.15 : 0) - (hid ? 0.2 : 0);
    const fail = (log: string) => hid
      ? { ...leave(PL), health: -8, flags: ["plt_license_lost"], log: log + " Cuộc điều tra lật lại hồ sơ sức khỏe. Bạn mất bằng lái." }
      : { income_mult: 0.6, health: -6, flags: ["plt_crash_probe"], log };
    return T("Một động cơ trên biển đêm", `Chuyến bay đêm, hai trăm hành khách, giữa biển. Động cơ trái báo cháy rồi tắt. Gần nhất là một sân bay đảo có đường băng ngắn và mưa giông; sân bay lớn cách bốn mươi phút bay bằng một động cơ.${hid ? " Ngực bạn bắt đầu đập loạn." : ""} ${crew ? "Cơ phó ngồi cạnh bình tĩnh đọc bảng kiểm, đúng như cách bạn vẫn làm." : "Cơ phó ngồi cạnh tái mặt, chờ bạn nói."}`, [
      C("Hạ cánh ngay xuống sân bay đảo", { counters: step(c, PL), gamble: { p: 0.6 + adj, win: { income_mult: 1.2, happy: 6, flags: ["plt_hero"], log: "Máy bay dừng lại cách cuối đường băng bốn mươi mét. Hành khách vỗ tay suốt lúc bạn bước ra." }, lose: fail("Máy bay trượt khỏi đường băng; hai mươi người bị thương nhẹ.") } }, "Gần, đường băng ngắn, trời xấu"),
      C("Bay tiếp bốn mươi phút đến sân bay lớn", { counters: step(c, PL), gamble: { p: 0.62 + adj, win: { income_mult: 1.15, flags: ["plt_hero"], log: "Bạn hạ cánh êm trên đường băng dài, xe cứu hỏa chạy theo hai bên. Không ai bị thương." }, lose: fail("Động cơ còn lại quá nhiệt khi hạ độ cao; máy bay hạ cánh nặng, gãy càng.") } }, "Đường băng tốt, thêm bốn mươi phút rủi ro"),
      C("Giao cần lái cho cơ phó, bạn lo xử lý sự cố", { counters: step(c, PL), gamble: { p: crew ? 0.85 : 0.45, win: { flags: ["plt_hero", "plt_trusted_crew"], rel: 4, log: "Cơ phó hạ cánh chắc tay. Báo cáo điều tra lấy chuyến bay ấy làm bài học về làm việc nhóm." }, lose: fail("Cơ phó run tay trong cơn gió giật; máy bay chạm đất lệch tâm, nổ lốp.") } }, "Chia việc, cược vào người ngồi cạnh", { tier: "awakened" })], 1); }, adult),
  beat(PL, 5, 6, (c) => T("Chuyến bay cuối cùng", `Bạn sắp đến tuổi phải rời buồng lái${f(c, "plt_hero") ? ", và ai trong hãng cũng biết chuyện đêm hạ cánh một động cơ" : ""}. Hãng mời bạn dạy trên buồng lái mô phỏng. Một công ty khác mời làm cố vấn cho dự án máy bay chở hàng không người lái, lương gấp ba. Ở quê, một trường nghề muốn mở lớp kỹ thuật hàng không cho con nhà nghèo nhưng không có tiền thuê thầy.`, [
    C("Dạy mô phỏng cho hãng", { counters: step(c, PL), income_mult: 0.8, know: 2, flags: ["plt_instructor"] }, "Lương giảm, giữ nghề tới cuối"),
    C("Làm cố vấn máy bay không người lái", { counters: step(c, PL), money: 1, income_mult: 1.1, happy: -2, flags: ["plt_autonomy"] }, "Rất nhiều tiền, góp tay thay thế nghề mình"),
    C("Về quê mở lớp, dạy không lấy lương", { counters: step(c, PL), income_mult: 0.5, happy: 6, rel: 4, agency: 0.02, flags: ["plt_village_school"] }, "Lựa chọn thứ ba: nghề bay cho người không tiền học", { tier: "sovereign" })], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(PL, "plt_jetlag", [20, 65], 7, (c) => T("Sống lệch giờ với cả nhà", vary("pltj", c.age, ["Tuần này bạn bay qua năm múi giờ. Ba giờ chiều bạn buồn ngủ, ba giờ sáng bạn tỉnh như sáo.", "Lịch bay đêm liền bốn tuần. Bạn ăn sáng lúc người nhà ăn tối, ngủ khi cả nhà đi làm."]), [
    C("Giữ giờ ngủ khắt khe, từ chối mọi cuộc hẹn", { health: 3, rel: -3, flags: ["plt_sleep_disciplined"] }, "Khỏe, xa dần bạn bè"),
    C("Thức theo giờ người nhà", { rel: 3, health: -3, bw: -3, counters: { plt_fatigue: 1 } }, "Gần gia đình, mệt kéo dài")], 0)),
  daily(PL, "plt_unruly", [21, 65], 9, () => T("Hành khách ở hàng ghế 34", "Hành khách ở hàng ghế 34 say rượu, la hét và đẩy ngã một tiếp viên. Còn ba tiếng nữa mới tới nơi. Hạ cánh khẩn ở sân bay gần nhất thì hãng mất phí, hai trăm người lỡ chuyến nối.", [
    C("Hạ cánh khẩn, giao người cho cảnh sát", { bw: -3, flags: ["plt_diverted"] }, "Tổ bay an toàn, hãng tốn tiền, khách lỡ chuyến"),
    C("Để tiếp viên khống chế, bay tiếp", { gamble: { p: 0.75, win: { money: 0.02, log: "Ông ta ngủ thiếp đi sau một giờ. Chuyến bay đến đúng giờ." }, lose: { happy: -4, flags: ["plt_crew_hurt"], log: "Ông ta làm một tiếp viên bị thương trước khi bị giữ lại. Công đoàn tiếp viên chất vấn quyết định của bạn." } } }, "Đúng giờ, cược vào sự an toàn của tổ bay")], 0)),
  daily(PL, "plt_extra_leg", [21, 65], 7, () => T("Cuộc gọi lúc mười giờ đêm", "Điều phối gọi: một tổ bay khác ốm, hãng cần bạn bay thêm một chặng sáng mai. Vẫn trong giới hạn luật cho phép, nhưng ba mươi giờ qua bạn mới ngủ được bốn tiếng.", [
    C("Nhận, lấy phụ cấp", { money: 0.05, health: -2, counters: { plt_fatigue: 1 } }, "Thêm tiền, bay khi mệt"),
    C("Báo mệt, từ chối", { income_mult: 0.99, flags: ["plt_fatigue_report"] }, "An toàn, bị điều phối nhớ tên"),
    C("Từ chối, đề xuất lập tổ bay dự bị cố định", { agency: 0.01, flags: ["plt_fatigue_report"], gamble: { p: 0.4, win: { rel: 2, log: "Ba tháng sau hãng lập tổ bay dự bị. Không ai phải nhận cuộc gọi lúc mười giờ đêm nữa." }, lose: { log: "Đề xuất của bạn nằm im trong hộp thư một trưởng phòng." } } }, "Lựa chọn thứ ba: sửa cái lịch, không chỉ né nó", { tier: "sovereign" })], 1)),
  daily(PL, "plt_layover", [21, 65], 7, (c) => T("Đêm nghỉ ở thành phố lạ", vary("pltl", c.age, ["Tổ bay nghỉ đêm ở một thành phố biển. Cơ phó rủ đi uống, chuyến về cất cánh lúc mười một giờ trưa mai.", "Tiếp viên trưởng tổ chức sinh nhật trong khách sạn, có rượu và bánh. Mười bốn tiếng nữa bạn bay."]), [
    C("Đi cùng, chỉ uống nước ngọt", { rel: 2, bw: -1, counters: { plt_crew_bond: 1 } }, "Gắn kết, ngủ muộn"),
    C("Uống một hai ly cho vui", { rel: 3, counters: { drink: 1 }, gamble: { p: 0.85, win: { log: "Sáng hôm sau bạn tỉnh táo; máy đo nồng độ cồn đầu ca không báo gì." }, lose: { income_mult: 0.85, flags: ["plt_alcohol_mark"], log: "Máy đo đầu ca báo vượt ngưỡng rất nhỏ. Bạn bị dừng bay và ghi vào hồ sơ." } } }, "Vui, cược vào cái máy đo sáng mai"),
    C("Ở phòng ngủ sớm", { health: 2, rel: -1 }, "Tỉnh táo, bị coi là khó gần")], 0)),
  daily(PL, "plt_sim_check", [21, 65], 9, () => T("Bài kiểm tra trong buồng mô phỏng", "Kỳ kiểm tra mô phỏng sáu tháng một lần, bạn xử lý chậm tình huống mất áp suất cabin. Người chấm là bạn học cũ. Anh ấy nói có thể ghi “đạt” để bạn khỏi bị dừng bay chờ thi lại.", [
    C("Xin thi lại, chịu dừng bay hai tuần", { money: -0.04, know: 3, flags: ["plt_retook"] }, "Mất lương, kỹ năng thật"),
    C("Nhận chữ “đạt” của bạn học", { money: 0.02, secret: { tag: "CHEATED_EXAM", severity: 0.4, fuse_years: [2, 9], note: "bài kiểm tra mô phỏng được ghi đạt dù chưa đạt" } }, "Giữ lịch bay, một lỗ hổng trong tay nghề")], 0)),
  daily(PL, "plt_strike", [22, 65], 9, (c, N) => { const r = role(c, "rival");
    return T("Cuộc đình công của phi công", `Hội phi công bỏ phiếu đình công hai ngày vì lịch bay quá dày${r ? `; ${N(r)} đứng đầu danh sách vận động` : ""}. Hãng hứa thưởng gấp ba cho ai vẫn bay.`, [
      C("Đình công cùng mọi người", { money: -0.04, rel: 3, flags: ["plt_striker"], ...(r ? { memory: { npc: r, tag: "STOOD_UP_FOR_ME", weight: 0.2, note: "cùng đình công hai ngày vì lịch bay" } } : {}) }, "Mất thưởng, giữ đồng nghiệp"),
      C("Vẫn bay, nhận thưởng gấp ba", { money: 0.08, rel: -4, flags: ["plt_strikebreaker"], ...(r ? { memory: { npc: r, tag: "BETRAYED_PARTNERSHIP", weight: -0.3, note: "vẫn bay trong hai ngày đình công" } } : {}) }, "Tiền ngay, đồng nghiệp nhớ lâu")], 0, r ? { npc: r } : {}); }),
  daily(PL, "plt_fuel", [21, 65], 8, (c) => T("Thêm hai tấn nhiên liệu", vary("pltf", c.age, ["Dự báo sân bay đích có sương mù lúc gần sáng. Hãng thưởng cho phi công nạp nhiên liệu sát mức tối thiểu để tiết kiệm.", "Mùa bão, sân bay dự bị có thể đóng. Nạp thêm nhiên liệu thì máy bay nặng hơn, hãng trừ vào điểm tiết kiệm của bạn."]), [
    C("Nạp thêm, chịu bị trừ điểm", { income_mult: 0.99, bw: 1, flags: ["plt_extra_fuel"] }, "Ngủ yên, mất thưởng"),
    C("Nạp sát mức, nhận thưởng", { money: 0.03, gamble: { p: 0.85, win: { log: "Sương tan sớm. Bạn hạ cánh với đúng lượng dầu đã tính." }, lose: { bw: -6, flags: ["plt_low_fuel"], log: "Sân bay đích đóng. Bạn hạ cánh ở sân bay dự bị với bình dầu gần cạn." } } }, "Thưởng nhỏ, đặt cược lớn")], 0)),
  daily(PL, "plt_young_fo", [28, 65], 9, () => T("Cơ phó run tay", "Một cơ phó mới ra trường hạ cánh lệch tâm đường băng ba lần trong tháng. Phòng huấn luyện hỏi ý kiến bạn: có nên cho cậu ấy bay tiếp không.", [
    C("Kèm thêm cậu ấy một tháng", { bw: -4, flags: ["plt_mentor"], counters: { plt_rep: 1 } }, "Tốn sức, có thể cứu một sự nghiệp"),
    C("Đề nghị cho đi huấn luyện lại", { flags: ["plt_strict"] }, "An toàn, cậu ấy chậm lại một năm"),
    C("Ghi “bình thường” cho xong", { gamble: { p: 0.7, win: { log: "Cậu ấy tự tiến bộ dần." }, lose: { happy: -4, flags: ["plt_signed_off_badly"], log: "Ba tháng sau cậu ấy làm hỏng càng máy bay khi hạ cánh. Tên bạn có trong hồ sơ đánh giá." } } }, "Nhẹ việc, đẩy rủi ro cho người sau")], 0)),
  daily(PL, "plt_family_pass", [22, 65], 8, () => T("Vé chờ chỗ cho người nhà", "Mỗi năm hãng cho người nhà phi công vài vé chờ chỗ trống. Cả nhà muốn đi biển dịp nghỉ lễ, đúng lúc chuyến nào cũng kín, và đúng lúc hãng trả phụ cấp gấp đôi cho ai bay ca lễ.", [
    C("Xin nghỉ lễ, cả nhà đi vé chờ", { happy: 2, gamble: { p: 0.6, win: { rel: 5, counters: { plt_family_trips: 1 }, log: "Còn đúng bốn ghế cuối. Cả nhà ngồi rải rác nhưng cười suốt chuyến." }, lose: { rel: -1, log: "Cả nhà chờ ở sân bay sáu tiếng rồi kéo vali về." } } }, "Rẻ, có thể chờ không"),
    C("Mua vé thường cho chắc", { money: -0.06, rel: 3, counters: { plt_family_trips: 1 } }, "Tốn tiền, chắc chuyến"),
    C("Bay ca lễ lấy phụ cấp, hẹn dịp khác", { money: 0.05, rel: -3, flags: ["plt_missed_holiday"] }, "Thêm tiền, thêm một lần vắng mặt")], 0)),

  /* ---------- gia đình ---------- */
  cross(PL, "plt_family", [26, 66], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => { const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn học bay`, `${N(k)} đã thi qua vòng một kỳ tuyển phi công học viên mà không nói với bạn. Con biết rõ những đêm bạn không ngủ và những ngày bạn vắng nhà, nhưng vẫn muốn.`, [
      C("Ủng hộ, giúp con ôn các vòng sau", { money: -0.05, trust: { npc: k, delta: 0.2 } }, "Con được chọn, bạn lo cho con"),
      C("Cấm, bảo con chọn nghề khác", { trust: { npc: k, delta: -0.2 } }, "Yên tâm hơn, con giận lâu"),
      C("Đưa con vào buồng mô phỏng, cho thấy cả phần khó", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "tôn trọng lựa chọn của con sau buổi bay mô phỏng", years: 1 } }, "Con tự quyết, bạn phải chấp nhận", { tier: "awakened" })], 2, { npc: k });
    return T("Chuyến bay chở bố mẹ", `${N(p!)} chưa đi máy bay bao giờ. Tháng sau bạn bay đúng tuyến về thành phố quê nhà, và có thể đọc lời chào hành khách trên loa.`, [
      C("Mua vé cho bố mẹ, đọc lời chào riêng", { money: -0.03, happy: 4, trust: { npc: p!, delta: 0.3 }, gamble: { p: 0.8, win: { log: `${N(p!)} kể chuyến bay ấy với cả xóm suốt nhiều năm.` }, lose: { log: "Một hành khách quay video lời chào; hãng nhắc nhở bạn về quy định." } } }, "Một chuyến nhớ đời, có thể bị nhắc nhở"),
      C("Thôi, bố mẹ sợ độ cao", { happy: -1 }, "Không phiền ai, không có kỷ niệm")], 0, { npc: p! }); }),
];

/* =====================================================================================
 * NGƯ DÂN BÁM BIỂN — chia cá theo phần, nợ theo con tàu, sống theo con bão.
 * Cờ: dfs_owner, dfs_fair_split, dfs_steel_boat, dfs_trader_tied, dfs_coop, dfs_insured, dfs_rescuer, dfs_lost_boat…
 * Bộ đếm: dfs_dark_trips (những chuyến tàu mất tín hiệu), dfs_skill.
 * ===================================================================================== */
const FISHER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(DF, "dfs_t_clouds", [9, 15], () => true, () => T("Đọc mây đoán gió", "Bạn nhìn màu mây cuối chiều mà đoán được sáng mai biển động hay êm, trúng hơn cả cái đài của ông hàng xóm. Mùa hè, bạn bơi ra tận phao neo thuyền ngoài cửa lạch rồi bơi về.", [
    C("Xin theo người lớn đi biển những ngày hè", { money: 0.02, health: -1, flags: [talentFlag(DF)], counters: { talents_seen: 1 } }, "Có nghề sớm, bớt thời gian học chữ"),
    C("Ở nhà học bài", { know: 2, counters: { talents_seen: 1 } }, "Học chữ, xa dần con nước")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(DF, "dfs_d_crew", [15, 30], () => true, (c) => T("Tàu thiếu bạn thuyền", `Con tàu gỗ hai mươi mét của một chủ tàu trong xóm sắp đi chuyến hai mươi ngày, còn thiếu một bạn thuyền. Không có lương cứng: bán cá xong, chủ tàu lấy một nửa, nửa kia chia đều cho mười người.${c.age < 18 ? " Đi thì phải nghỉ học." : ""}`, [
    C(c.age < 18 ? "Nghỉ học, xuống tàu" : "Xuống tàu, đi chuyến này", { ...become(DF), health: -1, counters: { doors_seen: 1 }, ...(c.age < 18 ? { flags: ["dfs_left_school"] } : {}) }, c.age < 18 ? "Có tiền sớm, bỏ dở chuyện học" : "Thu nhập theo con cá, không theo tháng"),
    C("Đi thử một chuyến rồi tính", { counters: { doors_seen: 1 }, gamble: { p: 0.6, win: { ...become(DF), log: "Bạn say sóng ba ngày rồi quen. Chủ tàu giữ bạn lại cho mùa sau." }, lose: { happy: -2, log: "Bạn nôn suốt hai mươi ngày. Lên bờ, bạn thề không xuống tàu nữa." } } }, "Biết mình hợp không, có thể mất chỗ"),
    C("Thôi", { counters: { doors_seen: 1 } })], 0)),
  door(DF, "dfs_d_boat", [24, 45], () => true, (c) => T("Con tàu gỗ được rao bán", `Một ông chủ tàu già lên bờ, rao bán con tàu gỗ mười lăm mét cùng bộ lưới. Giá bằng hơn một năm thu nhập của bạn. Ở bến ai cũng nói con tàu này có lộc.${c.country === "VN" ? " Ông còn dặn: nhớ làm lễ cúng tàu trước chuyến đầu." : ""}`, [
    C("Vay tiền mua tàu, làm chủ", { custom: "borrow:1.2|become:deep_fisher", agency: 0.01, flags: ["dfs_owner"], counters: { doors_seen: 1 } }, "Làm chủ, mang nợ lớn"),
    C("Rủ hai nhà cùng góp mua", { agency: 0.02, counters: { doors_seen: 1 }, gamble: { p: 0.55, win: { custom: "borrow:0.4|become:deep_fisher", flags: ["dfs_owner", "dfs_coop"], log: "Ba nhà ký giấy chung. Con tàu mang tên ghép của ba nhà." }, lose: { log: "Một nhà rút vốn vào phút chót. Con tàu về tay người khác." } } }, "Lựa chọn thứ ba: nợ ít, chia quyền", { tier: "sovereign" }),
    C("Không mua", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(DF, 1, 1, (c) => f(c, "dfs_owner")
    ? T("Chuyến đầu làm chủ tàu", "Chuyến đầu với con tàu của mình. Cá bán được nhiều hơn mọi người mong. Mười bạn thuyền chờ bạn chia tiền ở bến. Lệ ở đây: chủ tàu lấy một nửa để trả nợ và tiền dầu, nửa kia chia đều.", [
      C("Chia theo lệ, trả nợ cho nhanh", { counters: step(c, DF), money: 0.05, flags: ["dfs_strict_split"] }, "Nợ vơi nhanh, bạn thuyền giỏi dễ bỏ đi"),
      C("Lấy ít hơn một chút, giữ người giỏi", { counters: step(c, DF), money: -0.03, rel: 4, flags: ["dfs_fair_split"] }, "Nợ lâu hơn, có một đội tàu muốn ở lại")], 0)
    : T("Nửa phần của người mới", "Chuyến đầu tiên, bạn say sóng hai ngày rồi quen. Về bến, cá bán được nhiều hơn mọi người mong. Chủ tàu chia: người mới chỉ được nửa phần, như lệ xưa nay.", [
      C("Nhận nửa phần, làm cho người ta nể", { counters: step(c, DF), health: -2, flags: ["dfs_patient"] }, "Thiệt bây giờ, có chỗ chuyến sau"),
      C("Đòi đủ phần như mọi người", { counters: step(c, DF), gamble: { p: 0.4, win: { money: 0.04, log: "Chủ tàu cười, bảo bạn có gan, rồi chia đủ." }, lose: { flags: ["dfs_marked"], log: "Chủ tàu chia đủ, nhưng chuyến sau không gọi bạn nữa." } } }, "Có thể được, có thể mất chỗ"),
      C("Xin đứng ca đêm học nghề bù cho phần thiếu", { counters: step(c, DF, { dfs_skill: 1 }), know: 4, health: -3, flags: ["dfs_sea_sense"] }, "Mệt, học được nghề đọc biển", { tier: "awakened" })], 0)),
  beat(DF, 2, 3, (c, N) => { const cr = role(c, "creditor"); const lender = cr ? N(cr) : "Một thương lái ở bến";
    return T("Món nợ đóng tàu", `${f(c, "dfs_owner") ? "Con tàu gỗ đã cũ, mỗi chuyến chỉ đi được ba ngày đường." : "Ba năm làm bạn thuyền, bạn muốn có tàu của riêng mình."} ${c.country === "VN" ? "Ngân hàng đang có chương trình cho vay đóng tàu vỏ thép, lãi thấp, giấy tờ mất nửa năm." : "Ngân hàng cho vay đóng tàu vỏ thép, máy lớn, đi xa gấp đôi, giấy tờ mất nửa năm."} ${lender} sẵn tiền cho vay ngay, chỉ cần bạn bán toàn bộ cá cho người đó, giá do người đó định.`, [
      C("Vay ngân hàng đóng tàu thép", { counters: step(c, DF), custom: "borrow:2", income_mult: 1.4, flags: ["dfs_owner", "dfs_steel_boat", "dfs_bank_loan"] }, "Tàu lớn, nợ lớn, chờ nửa năm"),
      C("Vay thương lái, ra khơi ngay", { counters: step(c, DF), custom: "borrow:1", income_mult: 1.25, flags: ["dfs_owner", "dfs_trader_tied"], ...(cr ? { trust: { npc: cr, delta: 0.1 } } : {}) }, "Nhanh, nhưng cá bán theo giá người cho vay"),
      C("Góp vốn với bốn nhà trong xóm, cùng mua, cùng bán", { counters: step(c, DF), agency: 0.03, bw: -4, flags: ["dfs_owner", "dfs_coop"], gamble: { p: f(c, "dfs_fair_split") ? 0.65 : 0.45, win: { income_mult: 1.3, rel: 5, log: "Tổ năm tàu chung nhau một bộ đàm tầm xa và tự chở cá lên chợ đầu mối, được giá hơn ở bến một phần năm." }, lose: { income_mult: 1.05, log: "Hai nhà rút khỏi tổ sau mùa đầu vì ai cũng nghĩ mình góp nhiều hơn." } } }, "Lựa chọn thứ ba: mạnh nhờ đông, chậm vì phải bàn", { tier: "sovereign" })], 0, cr ? { npc: cr } : {}); }, adult),
  beat(DF, 3, 4, (c, N) => { const nb = role(c, "neighbor"); const steel = f(c, "dfs_steel_boat"); const coop = f(c, "dfs_coop"); const insured = f(c, "dfs_insured");
    const safe = f(c, "dfs_safety_rules") || f(c, "dfs_taught_swim");
    const other = nb ? `tàu của ${N(nb)}` : coop ? "một tàu trong tổ" : "một tàu cùng xóm";
    return T("Bão trái mùa", `Áp thấp mạnh lên thành bão chỉ trong một đêm, lệch hẳn dự báo. Tàu bạn đang cách bờ hai trăm hải lý${steel ? ", vỏ thép chịu được sóng lớn" : ", vỏ gỗ đã rệu"}. Qua bộ đàm, ${other} báo gãy bánh lái, mười một người trên tàu, cách bạn ba giờ chạy ngược gió.`, [
      C("Quay lại cứu", { counters: step(c, DF), flags: ["dfs_rescuer"], gamble: { p: (steel ? 0.65 : 0.45) + (coop ? 0.1 : 0) + (safe ? 0.1 : 0), win: { rel: 8, happy: 5, ...(nb ? { memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.5, note: "quay tàu lại cứu giữa đêm bão" } } : {}), log: "Bạn kéo được tàu kia về chỗ tránh gió. Cả mười một người lên bờ." }, lose: { money: insured ? -0.3 : -1, health: -8, flags: ["dfs_lost_boat"], ...(nb ? { memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.6, note: "mất tàu vì quay lại cứu giữa đêm bão" } } : {}), log: "Sóng đánh vỡ cabin, cả hai tàu chìm. Mọi người bám phao đến khi tàu cứu hộ tới; không ai chết, nhưng bạn mất tàu." } } }, insured ? "Có thể cứu người, bảo hiểm đỡ một phần" : "Có thể cứu người, có thể mất trắng con tàu"),
      C("Chạy vào chỗ tránh trú, báo tọa độ cho cứu hộ", { counters: step(c, DF), happy: -5, flags: ["dfs_ran_for_shelter"], ...(nb ? { memory: { npc: nb, tag: "REFUSED_HELP", weight: -0.3, note: "chạy vào bờ đêm bão, để tàu gãy bánh lái lại" } } : {}) }, "Giữ tàu và người của mình, mang theo đêm đó"),
      C("Chạy vào bờ, rồi bán tàu, thôi nghề biển", { counters: step(c, DF), ...leave(DF), money: 0.3, happy: -3, flags: ["ex_fisher", "dfs_ran_for_shelter"] }, "An toàn, bỏ cái nghề của cả dòng họ")], 0, nb ? { npc: nb } : {}); }, adult),
  beat(DF, 4, 5, (c, N) => { const cr = role(c, "creditor"); const coop = f(c, "dfs_coop"); const rescuer = f(c, "dfs_rescuer");
    if (f(c, "dfs_lost_boat")) return T("Món nợ của con tàu đã chìm", `Con tàu nằm dưới đáy biển từ đêm bão, nhưng khoản nợ vẫn còn${f(c, "dfs_insured") ? "; bảo hiểm chỉ trả được một phần" : ", và bạn chưa từng mua bảo hiểm thân tàu"}. ${rescuer ? "Những gia đình bạn cứu đêm ấy góp được một ít tiền, đặt trong phong bì ở bàn thờ nhà bạn." : ""}`, [
      C("Vay thêm, đóng lại tàu", { counters: step(c, DF), custom: "borrow:1.5", income_mult: 1.1, flags: ["dfs_rebuilt"] }, "Giữ nghề, nợ chồng nợ"),
      C("Đi bạn thuyền cho tàu người khác", { counters: step(c, DF), income_mult: 0.7, happy: -3, flags: ["dfs_crew_again"] }, "Không nợ thêm, làm thuê trên biển"),
      C("Lên bờ, xin ngân hàng giãn nợ", { counters: step(c, DF), ...leave(DF), custom: "job_lose|restructure", flags: ["ex_fisher"] }, "Thoát biển, nợ kéo dài nhiều năm")], 1);
    if (f(c, "dfs_trader_tied") && !coop) { const who = cr ? N(cr) : "Người thương lái";
      return T("Vùng biển của nước khác", `Cá gần bờ cạn dần, mỗi chuyến về chỉ đủ tiền dầu. ${who} nhắc khoản nợ, rồi gợi ý: chạy sang vùng biển của nước khác, một chuyến là trả hết nợ.${(c.counters.dfs_dark_trips ?? 0) > 0 ? " Người đó biết bạn từng chạy tàu mất tín hiệu." : ""} Tháng trước, hai tàu trong xóm đi như thế và bị bắt giữ ở nước ngoài.`, [
        C("Đi, một chuyến cho xong nợ", { counters: step(c, DF), gamble: { p: 0.4, win: { money: 0.8, flags: ["dfs_crossed_line"], log: "Bạn về với khoang đầy cá. Lần này, không ai hỏi gì." }, lose: { ...leave(DF), money: -1.5, health: -5, flags: ["dfs_detained_abroad"], close_doors: ["clean_record"], log: "Tàu bạn bị lực lượng tuần duyên nước kia bắt giữ. Bạn ở trại giam bảy tháng; con tàu bị tịch thu." } } }, "Trả nợ một lần, hoặc mất tất cả"),
        C("Từ chối, bán tàu trả nợ", { counters: step(c, DF), ...leave(DF), money: -0.3, flags: ["ex_fisher"], ...(cr ? { memory: { npc: cr, tag: "REFUSED_HELP", weight: -0.2, note: "không chịu chạy tàu sang vùng biển nước khác" } } : {}) }, "Hết nợ, hết nghề"),
        C("Chuyển sang nuôi cá lồng gần bờ, xin giãn nợ", { counters: step(c, DF), custom: "restructure", income_mult: 0.8, agency: 0.02, flags: ["dfs_farm"] }, "Lựa chọn thứ ba: ở gần bờ, thu nhập thấp hơn", { tier: "sovereign" })], 1, cr ? { npc: cr } : {}); }
    return T("Con cá có tên", `${coop ? "Tổ tàu của bạn" : "Con tàu thép của bạn"} được một chuỗi nhà hàng ở thành phố đặt mua cá cả năm, giá cao gấp rưỡi, với điều kiện mỗi con cá phải ghi rõ tàu nào, đánh ở đâu, bằng lưới gì. Lưới mắt nhỏ quen dùng phải bỏ hết.${rescuer ? " Họ chọn bạn vì nghe chuyện đêm bão." : ""}`, [
      C("Ký, đổi sang lưới mắt to theo yêu cầu", { counters: step(c, DF), money: -0.2, income_mult: 1.35, flags: ["dfs_traceable"] }, "Tốn tiền lưới, giá cao và ổn định"),
      C("Không ký, bán cho thương lái như cũ", { counters: step(c, DF), money: 0.1, flags: ["dfs_old_ways"] }, "Tiền ngay, giá lên xuống theo người mua"),
      C(coop ? "Ký cho cả tổ, lấy quỹ chung mua lưới mới" : "Rủ cả xóm cùng ký, lập hợp tác xã", { counters: step(c, DF), agency: 0.03, gamble: { p: 0.55, win: { income_mult: 1.5, rel: 5, flags: ["dfs_traceable", "dfs_coop"], log: "Cả xóm đổi lưới trong một mùa. Cá của làng có tên trên thực đơn thành phố." }, lose: { income_mult: 1.1, rel: -2, log: "Hai tàu giấu lưới mắt nhỏ, bị phát hiện. Nhà hàng cắt hợp đồng với cả nhóm, chỉ giữ tàu bạn." } } }, "Lựa chọn thứ ba: cả xóm cùng lên giá, gánh cả người chậm", { tier: "sovereign" })], 0); }, adult),
  beat(DF, 5, 6, (c) => T("Ba năm không thả lưới", `Cơ quan nghề cá đề xuất biến vùng rạn ngoài cửa lạch thành khu bảo tồn: cấm đánh bắt ba năm cho cá về đẻ. Cả làng họp ở ${c.country === "VN" ? "nhà văn hóa thôn" : "hội trường làng"}. Người ta chờ bạn nói trước${f(c, "dfs_rescuer") ? ", vì ai cũng nhớ đêm bão bạn quay tàu lại" : ", vì bạn đã đi biển lâu hơn hầu hết mọi người"}.`, [
    C("Ủng hộ cấm, kêu gọi mọi người chịu khó ba năm", { counters: step(c, DF), income_mult: 0.85, rel: -2, flags: ["dfs_reserve"] }, "Cả làng thiệt bây giờ, con cháu có cá", { longterm: true }),
    C("Phản đối, giữ miếng ăn cho làng", { counters: step(c, DF), money: 0.1, rel: 3, flags: ["dfs_against_reserve"] }, "Giữ thu nhập hôm nay, rạn tiếp tục cạn"),
    C("Đề xuất làng tự canh rạn, đổi lấy quyền thu phí lặn ngắm", { counters: step(c, DF), agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.1, rel: 6, flags: ["dfs_reserve", "dfs_village_patrol"], log: "Làng giữ quyền canh rạn. Năm thứ tư, cá về dày đến mức người lặn ngắm phải xếp hàng." }, lose: { rel: -2, flags: ["dfs_reserve"], log: "Đề xuất bị gạt đi. Khu bảo tồn vẫn lập, làng không được gì." } } }, "Lựa chọn thứ ba: làng giữ biển, biển nuôi làng", { tier: "sovereign" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(DF, "dfs_fuel", [18, 70], 7, (c) => T("Giá dầu lại lên", vary("dfsf", c.age, ["Giá dầu tăng một phần ba trong hai tháng. Một chuyến biển giờ tốn bằng nửa số cá đánh được.", "Cây xăng ở bến hết dầu, phải mua lại của người tích trữ với giá cao hơn hẳn."]), [
    C("Vẫn ra khơi", { money: -0.06, gamble: { p: 0.55, win: { money: 0.15, log: "Bạn gặp một luồng cá lớn. Chuyến biển gánh được cả hai chuyến sau." }, lose: { money: -0.05, log: "Biển vắng. Bạn về với khoang cá lưng lửng." } } }, "Có thể lỗ dầu"),
    C("Nằm bờ, vá lưới chờ giá xuống", { money: -0.04, health: 2, counters: { dfs_shore_days: 1 } }, "Mất chuyến, giữ được vốn")], 1)),
  daily(DF, "dfs_price", [18, 70], 7, (c) => T("Thương lái ép giá ở bến", vary("dfsp", c.age, ["Tàu về lúc bốn giờ sáng, khoang đầy cá ngừ. Thương lái ở bến trả thấp hơn hôm qua một phần tư, bảo chợ đầu mối đang ứ hàng.", "Mùa cá nổi, cả bến về cùng lúc. Thương lái chỉ mua một nửa, nửa còn lại muốn bán thì tùy giá họ đặt."]), [
    C("Bán luôn cho kịp ra khơi", { money: 0.05, counters: { dfs_dock_sales: 1 } }, "Tiền ngay, giá thấp"),
    C("Ướp thêm đá, tự chở lên chợ đầu mối", { money: -0.02, bw: -3, gamble: { p: 0.6, win: { money: 0.12, log: "Chợ đầu mối đang thiếu cá. Bạn bán được giá cao hơn hẳn ở bến." }, lose: { money: -0.05, log: "Đá tan giữa đường, cá xuống màu. Bạn bán rẻ hơn cả giá ở bến." } } }, "Có thể được giá, có thể hỏng cá"),
    C("Để người nhà bán lẻ ở chợ", { money: 0.08, rel: -1, bw: -2, flags: ["dfs_family_stall"] }, "Lời hơn, cả nhà thức từ ba giờ sáng")], 0)),
  daily(DF, "dfs_turtle", [18, 70], 9, () => T("Con rùa trong lưới", "Lúc kéo lưới, bạn thấy một con rùa biển lớn mắc kẹt, còn sống. Gỡ ra mất hai tiếng và phải cắt hỏng một đoạn lưới. Một bạn thuyền nói mai rùa bán được khối tiền.", [
    C("Cắt lưới, thả rùa", { money: -0.03, happy: 3, flags: ["dfs_freed_turtle"] }, "Mất lưới, mất giờ"),
    C("Mang rùa về bán", { money: 0.05, flags: ["dfs_sold_turtle"], gamble: { p: 0.7, win: { log: "Một người lạ trả tiền mặt ở bến, không hỏi gì." }, lose: { money: -0.15, flags: ["dfs_fined"], log: "Kiểm ngư kiểm tra ở cửa biển. Bạn bị phạt và tịch thu cả chuyến cá." } } }, "Tiền nhanh, phạm luật")], 0)),
  daily(DF, "dfs_trawler", [18, 70], 9, () => T("Tàu cào lấn vào gần bờ", "Đêm nào cũng có một tàu cào lớn, không rõ của ai, kéo lưới sát vùng rạn gần bờ. Sáng ra, lưới của các tàu nhỏ trong xóm bị kéo rách, cá non trôi trắng mép nước.", [
    C("Báo cơ quan chức năng", { bw: -2, gamble: { p: 0.4, win: { rel: 3, log: "Tàu cào bị bắt quả tang ở chuyến tuần tra thứ ba." }, lose: { happy: -3, flags: ["dfs_threatened"], log: "Không ai đến. Tuần sau, lưới của bạn bị cắt ngay giữa bến." } } }, "Đúng việc, có thể bị trả thù"),
    C("Kệ, chạy ra xa hơn mà đánh", { money: -0.04, counters: { dfs_far: 1 } }, "Yên thân, tốn dầu"),
    C("Rủ các tàu trong xóm quay phim, gửi lên báo", { agency: 0.02, flags: ["dfs_filmed"], gamble: { p: 0.55, win: { rel: 5, log: "Đoạn phim lên báo tỉnh. Tàu cào biến mất khỏi vùng rạn từ tuần đó." }, lose: { rel: 1, log: "Đoạn phim bị gỡ sau một ngày. Nhưng cả xóm giờ đã quen ngồi cùng nhau." } } }, "Lựa chọn thứ ba: cả xóm làm chứng", { tier: "sovereign" })], 0)),
  daily(DF, "dfs_engine", [18, 70], 8, () => T("Máy chết giữa biển", "Máy tàu tắt ở cách bờ chín mươi hải lý, trời bắt đầu nổi gió. Gọi tàu kéo về thì mất một khoản bằng ba chuyến biển; tự sửa thì cần ít nhất một đêm.", [
    C("Gọi tàu kéo", { money: -0.15, flags: ["dfs_towed"] }, "Tốn tiền, về chắc"),
    C("Tự sửa trong đêm", { bw: -4, gamble: { p: 0.6, win: { know: 3, counters: { dfs_skill: 1 }, log: "Gần sáng máy nổ lại. Cả tàu gật gù với bạn suốt tuần." }, lose: { money: -0.2, health: -3, log: "Đến trưa máy vẫn chết. Bạn vẫn phải gọi tàu kéo, sau một đêm trôi dạt." } } }, "Tiết kiệm, có thể mất cả hai")], 1)),
  daily(DF, "dfs_insure", [20, 70], 9, () => T("Bảo hiểm thân tàu", "Một nhân viên bảo hiểm đến tận bến mời mua bảo hiểm thân tàu và bảo hiểm tai nạn cho bạn thuyền. Phí mỗi năm bằng tiền lời của bốn chuyến biển. Cả xóm chưa ai mua.", [
    C("Mua cho cả tàu và người", { money: -0.08, flags: ["dfs_insured"] }, "Tốn tiền mỗi năm, đỡ khi gặp nạn", { longterm: true }),
    C("Không mua, giữ tiền dầu", { money: 0.01 }, "Đủ tiền dầu, phó mặc cho biển")], 1)),
  daily(DF, "dfs_festival", [18, 75], 8, (c) => T(c.country === "VN" ? "Lễ cầu ngư đầu năm" : "Lễ cầu an đầu mùa", c.country === "VN"
    ? "Làng tổ chức lễ cầu ngư, có hát bả trạo trên bến, mỗi tàu góp một phần lễ. Chủ tàu nào góp nhiều được đứng hàng đầu khi rước, và có tiếng nói trong các buổi họp làng."
    : "Đầu mùa, cả làng chài làm lễ cầu bình an cho các tàu, mỗi tàu treo cờ và góp một phần chi phí. Ai góp nhiều được ngồi bàn đầu, và có tiếng nói trong các buổi họp làng.", [
    C("Góp nhiều, đứng hàng đầu", { money: -0.05, rel: 4, counters: { dfs_standing: 1 } }, "Tốn tiền, có tiếng nói trong làng"),
    C("Góp phần như mọi người", { money: -0.01, rel: 1 }),
    C("Ra khơi sớm hôm đó, bỏ lễ", { money: 0.03, rel: -3, flags: ["dfs_skipped_rites"] }, "Được chuyến cá, bị cả làng để ý")], 1)),
  daily(DF, "dfs_lifejacket", [18, 70], 9, () => T("Áo phao không ai mặc", "Trên tàu có mười áo phao, nhưng chẳng ai mặc vì vướng tay khi kéo lưới. Một bạn thuyền trẻ không biết bơi, vẫn cười bảo biển là nhà.", [
    C("Mua áo phao loại gọn, bắt mọi người mặc", { money: -0.03, rel: -1, flags: ["dfs_safety_rules"] }, "Tốn tiền, bị càu nhàu"),
    C("Dạy cậu ấy bơi những hôm nằm bờ", { bw: -2, rel: 2, flags: ["dfs_taught_swim"] }, "Mất ngày nghỉ, có thể cứu một người", { tier: "awakened" }),
    C("Để mọi người làm theo thói quen", { gamble: { p: 0.85, win: { log: "Mùa biển trôi qua yên ổn." }, lose: { happy: -8, rel: -4, flags: ["dfs_man_overboard"], log: "Một đêm sóng lớn, cậu ấy rơi xuống biển. Sáu tiếng sau mới kéo được lên, cậu nằm viện cả tháng." } } }, "Không tốn gì, cược vào biển")], 0)),
  daily(DF, "dfs_vms", [18, 70], 9, () => T("Máy định vị mất tín hiệu", "Thiết bị giám sát hành trình trên tàu mất tín hiệu đã mười ngày. Không sửa thì không được cấp phép ra khơi; chờ thợ trên tỉnh xuống mất nửa tháng. Có người mách cứ đi, ai hỏi thì kêu tại sóng yếu.", [
    C("Chờ sửa, nằm bờ nửa tháng", { money: -0.06, flags: ["dfs_compliant"] }, "Mất chuyến, giấy tờ sạch"),
    C("Cứ đi, đổ tại sóng yếu", { money: 0.06, counters: { dfs_dark_trips: 1 }, gamble: { p: 0.6, win: { log: "Không ai hỏi gì." }, lose: { money: -0.2, flags: ["dfs_fined"], log: "Bạn bị phạt vì tàu mất tín hiệu quá lâu trên biển. Giấy phép bị treo hai tháng." } } }, "Không mất chuyến, có thể bị treo giấy phép")], 0)),

  /* ---------- gia đình ---------- */
  cross(DF, "dfs_family", [25, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => { const k = role(c, "child"); const s = role(c, "spouse");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn bỏ học đi biển`, `${N(k)} chán trường, muốn theo tàu của bạn từ mùa sau. Bạn thuyền trên tàu bảo nghề này chưa bao giờ thiếu người, chỉ thiếu cá.`, [
      C("Cho con đi theo một mùa", { money: 0.03, trust: { npc: k, delta: 0.2 }, flags: ["dfs_child_aboard"] }, "Con có nghề, lỡ mấy năm học"),
      C("Bắt con học hết phổ thông", { money: -0.03, trust: { npc: k, delta: -0.15 } }, "Con giận, cửa khác còn mở"),
      C("Cho con đi một chuyến cho biết cực, rồi để con chọn", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "tôn trọng lựa chọn của con sau chuyến biển", years: 1 } }, "Con tự quyết, bạn phải chấp nhận", { tier: "awakened" })], 2, { npc: k });
    return T("Đêm không có sóng bộ đàm", `Mỗi mùa bão, ${N(s!)} thức trắng bên cái bộ đàm ở nhà. Lần này ${N(s!)} nói thẳng: hoặc bạn lên bờ, hoặc đừng hứa gì nữa.`, [
      C("Hứa đi thêm hai mùa rồi lên bờ", { trust: { npc: s!, delta: 0.15 }, promise: { to: s!, what: "lên bờ sau hai mùa biển nữa", years: 2 } }, "Yên nhà, phải giữ lời"),
      C("Mua điện thoại vệ tinh, gọi về mỗi tối", { money: -0.05, trust: { npc: s!, delta: 0.1 }, flags: ["dfs_sat_phone"] }, "Tốn tiền, bớt một nỗi lo"),
      C("Nói thật: bạn không làm được nghề nào khác", { happy: -1, trust: { npc: s!, delta: -0.1 } }, "Thật lòng, người ở nhà vẫn thức trắng")], 1, { npc: s! }); }),
];

/* =====================================================================================
 * TÀI XẾ ĐƯỜNG DÀI — cabin là nhà, sổ giờ lái là luật, con đèo là phép thử.
 * Cờ: lhl_company_driver, lhl_owner, lhl_paper_rest, lhl_by_the_book, lhl_lease, lhl_independent, lhl_coop…
 * Bộ đếm: lhl_risk (những lần cắt giờ ngủ, chở quá tải, đi đường liều).
 * ===================================================================================== */
const HAULER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(LH, "lhl_t_cab", [11, 16], () => true, () => T("Ghế phụ trong cabin", "Hè năm ấy, bạn được theo một người chú chạy xe tải ba ngày. Bạn nhớ hết tên các con đèo, nghe tiếng máy là biết xe sắp hỏng chỗ nào, và không hề kêu mỏi.", [
    C("Xin học việc ở tiệm sửa xe gần nhà", { money: 0.01, happy: -1, know: 1, flags: [talentFlag(LH)], counters: { talents_seen: 1 } }, "Ít thời gian chơi, có nghề trong tay"),
    C("Hết hè thì quên", { happy: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(LH, "lhl_d_license", [21, 45], () => true, () => T("Bằng lái xe đầu kéo", "Một công ty vận tải tuyển tài xế xe đầu kéo: họ trả tiền học bằng lái hạng nặng, đổi lại bạn chạy cho họ ít nhất ba năm, lương theo chuyến. Tuyến dài nhất mất bốn ngày một chiều.", [
    C("Ký, đi học lái xe đầu kéo", { ...become(LH), rel: -2, flags: ["lhl_company_driver"], counters: { doors_seen: 1 } }, "Có nghề, ba năm không được đổi chủ"),
    C("Tự bỏ tiền học, không ký ràng buộc", { money: -0.15, counters: { doors_seen: 1 }, gamble: { p: 0.7, win: { ...become(LH), flags: ["lhl_free_agent"], log: "Bạn đỗ ngay lần đầu. Trong tuần có ba công ty gọi." }, lose: { happy: -2, log: "Bạn trượt phần lùi xe vào bãi, phải chờ kỳ thi sau." } } }, "Tốn tiền, được tự chọn chủ"),
    C("Thôi", { counters: { doors_seen: 1 } })], 0)),
  door(LH, "lhl_d_truck", [23, 50], () => true, (c) => T("Chiếc xe tải trả góp", `Một người chạy xe lâu năm muốn bán lại chiếc xe tải mười lăm tấn đã chạy năm trăm nghìn cây số. Trả trước một phần ba, phần còn lại góp trong hai năm. ${c.has_job ? "Việc bạn đang làm ổn định nhưng chẳng dư được đồng nào." : "Bạn đang không có việc."}`, [
    C("Mua, tự chạy hàng", { custom: "borrow:0.8|become:long_hauler", agency: 0.01, flags: ["lhl_owner"], counters: { doors_seen: 1 } }, "Làm chủ cái vô lăng, mang nợ"),
    C("Đi phụ xe cho ông ấy một năm trước", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(LH), know: 2, flags: ["lhl_free_agent"], log: "Một năm phụ xe, bạn thuộc hết mối hàng. Ông giao lại cho bạn cả mối lẫn xe chạy thuê." }, lose: { log: "Ông bán xe cho người khác sau ba tháng." } } }, "Học trước, có thể lỡ cơ hội"),
    C("Không mua", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(LH, 1, 1, (c) => T("Ba nghìn cây số đầu tiên", `Chuyến dài đầu tiên, bạn chạy cặp với một tài xế già. Lịch giao hàng sát đến mức chỉ kịp nếu bớt giờ nghỉ. Ông bảo ai cũng “nghỉ trên giấy”: sổ ghi một kiểu, xe chạy một kiểu${f(c, "lhl_owner") ? ", nhất là khi xe còn đang trả góp" : ""}.`, [
    C("Nghỉ đủ giờ, giao trễ nửa ngày", { counters: step(c, LH), income_mult: 0.95, flags: ["lhl_by_the_book"] }, "Bị điều phối ghi tên, ngủ đủ"),
    C("Làm như ông, kịp giờ giao", { counters: step(c, LH, { lhl_risk: 1 }), money: 0.05, flags: ["lhl_paper_rest"] }, "Thưởng đúng giờ, quen dần với việc cắt giờ ngủ"),
    C("Gọi điều phối, đòi lịch có đủ giờ nghỉ", { counters: step(c, LH), agency: 0.01, gamble: { p: 0.5, win: { flags: ["lhl_by_the_book"], log: "Điều phối dời giờ giao. Ông tài xế già nhìn bạn một lúc, rồi ngủ một giấc dài nhất trong năm." }, lose: { income_mult: 0.95, log: "Điều phối bảo ai không chạy được thì có người khác chạy." } } }, "Lựa chọn thứ ba: sửa cái lịch, không sửa cái sổ", { tier: "sovereign" })], 0), adult),
  beat(LH, 2, 3, (c) => T("Xe của mình hay xe của hãng", `Ba năm, bạn thuộc từng trạm cân và từng quán cơm dọc tuyến. ${f(c, "lhl_owner") ? "Chiếc xe trả góp đã trả xong, nhưng máy bắt đầu kêu." : "Bạn đã chán chạy thuê."} Công ty mời mua xe kiểu thuê-mua: họ bán xe trả góp, bạn chỉ chạy hàng của họ. Ngân hàng cũng cho vay mua xe mới, nhưng bạn phải tự tìm mối.`, [
    C("Thuê-mua xe của công ty", { counters: step(c, LH), custom: "borrow:1", income_mult: 1.2, flags: ["lhl_lease"] }, "Có hàng đều, giá cước do họ quyết"),
    C("Vay ngân hàng, tự tìm mối", { counters: step(c, LH), custom: "borrow:1.5", income_mult: 1.35, bw: -4, flags: ["lhl_independent"] }, "Tự do, lo cả mối lẫn nợ"),
    C("Lập nhóm năm tài xế, chung điều phối và xưởng sửa", { counters: step(c, LH), agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.4, rel: 4, flags: ["lhl_coop"], log: "Năm chiếc xe sơn cùng một màu. Nhóm nhận được hợp đồng chở hàng cho một nhà máy mà xe đơn lẻ không bao giờ có." }, lose: { income_mult: 1.1, flags: ["lhl_independent"], log: "Nhóm tan sau tám tháng vì chia chuyến không đều. Bạn giữ lại chiếc xe của mình." } } }, "Lựa chọn thứ ba: mạnh nhờ chung, phải tin nhau", { tier: "sovereign" })], 0), adult),
  beat(LH, 3, 4, (c) => { const risk = c.counters.lhl_risk ?? 0; const paper = f(c, "lhl_paper_rest"); const fund = f(c, "lhl_fund_keeper") || f(c, "lhl_fund_member");
    return T("Ba giờ sáng trên đèo", `Ba giờ sáng, xuống dốc đèo, ${risk >= 2 ? "bạn đã cầm lái mười chín tiếng liền" : "bạn vừa ngủ đủ một giấc ở trạm dừng"}. Một xe máy không đèn lấn sang làn bạn. Bạn đánh lái, xe tải lật nghiêng vào vách núi; người đi xe máy bị thương nặng. Công an sẽ đọc sổ giờ lái và thiết bị ghi hành trình.${fund ? " Quỹ tương trợ của tuyến gọi hỏi bạn cần gì." : ""}`, [
      C("Khai thật mọi thứ, kể cả số giờ đã chạy", { counters: step(c, LH), happy: -4, flags: ["lhl_told_truth"], ...(paper ? { income_mult: 0.7, close_doors: ["clean_record"] } : { income_mult: 0.95 }) }, paper ? "Bị treo bằng, cả công ty bị lật hồ sơ" : "Mất mấy tháng chạy, lòng nhẹ nhõm"),
      C(paper ? "Giữ nguyên sổ đã ghi, đổ lỗi cho xe máy" : "Để công ty lo thủ tục, im lặng", { counters: step(c, LH), ...(paper ? { secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [1, 6], note: "sổ giờ lái ghi khống trong vụ lật xe trên đèo" } } : {}), gamble: { p: paper ? 0.45 : 0.7, win: { log: "Hồ sơ khép lại sau ba tháng. Bạn chạy lại tuyến cũ, nhưng không bao giờ chạy đêm qua con đèo ấy nữa." }, lose: { income_mult: 0.7, money: fund ? -0.15 : -0.4, log: "Thiết bị ghi hành trình nói khác với sổ của bạn. Bạn bị treo bằng một năm." } } }, "Có thể thoát, có thể mất nhiều hơn"),
      C("Vào viện thăm, tự nguyện lo cho gia đình người bị thương", { counters: step(c, LH), money: fund ? -0.15 : -0.3, rel: 3, happy: 2, flags: ["lhl_paid_care"] }, "Tốn tiền, không ai bắt buộc", { tier: "awakened" }),
      C("Treo bằng lái, về nhà làm việc khác", { counters: step(c, LH), ...leave(LH), health: 3, flags: ["ex_trucker"] }, "Thoát nghề, mất cái nghề duy nhất")], 0); }, adult),
  beat(LH, 4, 5, (c) => { const coop = f(c, "lhl_coop"); const lease = f(c, "lhl_lease"); const back = f(c, "lhl_told_truth") && f(c, "lhl_paper_rest");
    if (coop) return T("Hợp đồng nhà máy", `Một ứng dụng ghép hàng làm cả thị trường đảo lộn: chủ hàng đăng chuyến, ai trả giá thấp nhất thì được. Nhóm năm xe của bạn vẫn giữ hợp đồng nhà máy, và nhà máy muốn mở thêm ba tuyến mới${back ? ", dù ai cũng biết bạn từng bị treo bằng" : ""}. Muốn nhận thì phải mua thêm xe.`, [
      C("Mở rộng nhóm lên hai mươi xe", { counters: step(c, LH), custom: "borrow:1", gamble: { p: 0.6, win: { income_mult: 1.5, flags: ["lhl_fleet"], log: "Nhóm hai mươi xe có văn phòng điều phối riêng. Bạn hầu như không còn cầm lái." }, lose: { income_mult: 0.9, log: "Mười lăm xe mới, mối hàng chỉ đủ cho mười. Nợ chia đều cho tất cả." } } }, "Lớn nhanh, cược vào mối hàng"),
      C("Giữ năm xe, giao cho thật đúng giờ", { counters: step(c, LH), income_mult: 1.1, flags: ["lhl_kept_small"] }, "Ít lời, chắc ăn"),
      C("Biến nhóm thành hợp tác xã, mở cửa cho tài xế lẻ vào", { counters: step(c, LH), agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.3, rel: 6, flags: ["lhl_coop_open", "leader"], log: "Bốn mươi tài xế lẻ gia nhập. Ứng dụng phải thương lượng giá với hợp tác xã thay vì với từng người." }, lose: { income_mult: 0.95, rel: 2, log: "Người vào đông, người góp ít. Bạn mất hai năm gỡ những cuộc cãi nhau về chia chuyến." } } }, "Lựa chọn thứ ba: mạnh lên cùng cả tuyến", { tier: "sovereign" })], 1);
    return T("Cước rơi", `Một ứng dụng ghép hàng làm cả thị trường đảo lộn: chủ hàng đăng chuyến, ai trả giá thấp nhất thì được. Cước giảm một phần ba trong một năm. ${lease ? "Công ty cho thuê-mua hạ giá cước trả cho bạn, nhưng tiền góp xe vẫn giữ nguyên." : "Tháng này bạn chưa đủ tiền trả góp ngân hàng."}${back ? " Bạn vừa lấy lại bằng sau một năm ngồi nhà." : ""}`, [
      C("Hạ giá theo ứng dụng, chạy nhiều chuyến hơn", { counters: step(c, LH, { lhl_risk: 1 }), health: -6, income_mult: 0.9, flags: ["lhl_race_bottom"] }, "Giữ được xe, bán sức"),
      C("Bán xe trả nợ, đi lái thuê", { counters: step(c, LH), money: 0.3, income_mult: 0.75, flags: ["lhl_hired_again"] }, "Hết nợ, hết làm chủ"),
      C("Cùng tài xế cả tuyến dừng xe một ngày, đòi giá sàn", { counters: step(c, LH), agency: 0.03, gamble: { p: 0.4, win: { income_mult: 1.15, rel: 5, flags: ["lhl_strike_leader"], log: "Ba trăm xe dừng ở trạm dừng chân. Tuần sau, ứng dụng công bố giá sàn cho tuyến dài." }, lose: { income_mult: 0.85, flags: ["lhl_blacklisted"], log: "Cuộc dừng xe tan sau sáu tiếng. Tài khoản của bạn trên ứng dụng bị khóa vĩnh viễn." } } }, "Lựa chọn thứ ba: cả tuyến cùng đòi, có thể bị khóa", { tier: "sovereign" }),
      C("Bỏ nghề, về quê", { counters: step(c, LH), ...leave(LH), rel: 3, flags: ["ex_trucker"] }, "Hết lo cước, hết cái nghề quen tay")], 0); }, adult),
  beat(LH, 5, 6, (c) => { const risk = c.counters.lhl_risk ?? 0;
    return T("Chiếc xe không người lái", `Trên tuyến bạn chạy hai mươi năm, người ta thử nghiệm xe tải tự lái. Công ty cần tài xế lâu năm ngồi sau vô lăng để giám sát, dạy hệ thống những khúc cua bạn thuộc lòng. Ở chân đèo, bà chủ quán cơm quen muốn nghỉ, hỏi bạn có muốn sang lại quán không.`, [
      C("Ngồi giám sát xe tự lái", { counters: step(c, LH), income_mult: 1.2, happy: -3, flags: ["lhl_trained_ai"] }, "Lương tốt, dạy cái máy thay mình"),
      C("Sang lại quán cơm cho tài xế", { counters: step(c, LH), money: -0.5, income_mult: 0.7, happy: 6, rel: 4, flags: ["lhl_diner"] }, "Vốn lớn, giữ con đường theo cách khác"),
      C("Mở lớp dạy lái an toàn cho tài xế trẻ", { counters: step(c, LH), income_mult: 0.8, know: 2, flags: ["lhl_teacher"] }, risk >= 3 ? "Dạy điều chính bạn từng không làm" : "Truyền nghề, thu nhập ít")], 1); }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(LH, "lhl_overload", [21, 65], 7, (c) => T("Thêm năm tấn", vary("lhlo", c.age, ["Chủ hàng muốn bạn chở quá tải năm tấn, trả thêm tiền mặt, bảo trạm cân tuyến này hay nghỉ đêm.", "Công ty xếp hàng quá tải lên xe bạn, bảo các xe khác vẫn chạy thế cả năm nay."]), [
    C("Chở, lấy tiền thêm", { money: 0.06, counters: { lhl_risk: 1 }, gamble: { p: 0.7, win: { log: "Trạm cân đóng cửa thật. Bạn về sớm hơn dự tính." }, lose: { money: -0.15, log: "Trạm cân mở. Bạn bị phạt, hàng thừa phải hạ xuống ngay bên đường." } } }, "Tiền thêm, phanh mòn nhanh, có thể bị phạt"),
    C("Từ chối, chỉ chở đúng tải", { income_mult: 0.98, flags: ["lhl_refused_overload"] }, "An toàn, chủ hàng tìm người khác")], 1)),
  daily(LH, "lhl_checkpoint", [21, 65], 9, () => T("Tờ tiền kẹp trong sổ xe", "Ở một chốt kiểm tra, người kiểm tra lật đi lật lại giấy tờ xe rồi bảo kiểm tra kỹ thì mất cả buổi. Tài xế xe sau nháy mắt với bạn: kẹp một tờ tiền vào sổ là xong.", [
    C("Kẹp tiền cho nhanh", { money: -0.01, secret: { tag: "PAID_BRIBE", severity: 0.2, fuse_years: [2, 8], note: "kẹp tiền trong sổ xe ở chốt kiểm tra" } }, "Nhanh, một bí mật nhỏ"),
    C("Chờ kiểm tra cả buổi", { money: -0.02, counters: { honest: 1 } }, "Trễ hàng, sổ sạch"),
    C("Bình tĩnh xin biên bản, ghi lại từng bước", { agency: 0.01, flags: ["lhl_asked_record"], gamble: { p: 0.5, win: { log: "Người kiểm tra trả giấy tờ trong năm phút." }, lose: { bw: -4, log: "Bạn bị giữ xe đến tối vì “thái độ chưa hợp tác”." } } }, "Lựa chọn thứ ba: đòi đúng quy trình, có thể bị làm khó", { tier: "sovereign" })], 1)),
  daily(LH, "lhl_back", [24, 65], 7, (c) => T("Cái lưng của tài xế", vary("lhlb", c.age, ["Sau mười tiếng ngồi, bạn phải vịn vào cửa cabin mới bước xuống được. Bác sĩ nói đĩa đệm thắt lưng đã lệch.", "Một tài xế cùng tuyến khoe chiếc ghế hơi chống rung, giá bằng một tháng thu nhập."]), [
    C("Mua ghế tốt, tập lưng mỗi sáng", { money: -0.08, health: 4, counters: { exercise: 1 } }, "Tốn tiền, lưng còn dùng được lâu"),
    C("Uống thuốc giảm đau, chạy tiếp", { money: 0.03, health: -4, counters: { lhl_pain: 1 } }, "Không lỡ chuyến, lưng tệ dần")], 0)),
  daily(LH, "lhl_hitch", [21, 65], 9, () => T("Người đứng vẫy ở trạm xăng", "Mười một giờ đêm, một phụ nữ ôm túi đồ đứng vẫy xe ở trạm xăng vắng, nói cần về thị trấn cách đó ba trăm cây số. Công ty cấm chở người lạ; camera trong cabin ghi lại mọi thứ.", [
    C("Cho đi nhờ", { rel: 2, happy: 2, gamble: { p: 0.75, win: { flags: ["lhl_good_turn"], log: "Bà ấy xuống xe trước cổng bệnh viện, nơi con gái bà vừa sinh." }, lose: { income_mult: 0.95, log: "Camera ghi lại. Bạn bị trừ một tháng thưởng vì vi phạm quy định." } } }, "Tử tế, có thể mất thưởng"),
    C("Gọi giúp một chiếc taxi, trả trước tiền xe", { money: -0.02, flags: ["lhl_good_turn"] }, "Mất ít tiền, không phạm quy", { tier: "awakened" }),
    C("Đi tiếp", { happy: -1 }, "Đúng quy định, nhớ mãi khuôn mặt ấy")], 1)),
  daily(LH, "lhl_trailer", [21, 65], 9, (c) => T("Tiếng gõ trong thùng xe", "Gần cửa khẩu, bạn nghe tiếng gõ trong thùng hàng đã niêm phong. Có người trốn bên trong. Nếu bị phát hiện ở biên giới, người lái xe có thể bị phạt nặng hoặc bị truy tố.", [
    C("Dừng xe, gọi biên phòng", { bw: -3, happy: -2, flags: ["lhl_called_border"] }, "Đúng luật, họ bị giữ lại và trả về"),
    C("Mở thùng cho họ xuống trước cửa khẩu", { gamble: { p: 0.6, win: { happy: 1, flags: ["lhl_let_go"], log: `Họ biến vào ${c.country === "VN" ? "rừng cao su" : "bóng tối"} ven đường. Không ai biết.` }, lose: { money: -0.3, close_doors: ["clean_record"], log: "Camera trạm dừng ghi lại cảnh bạn mở thùng. Bạn bị phạt và mất hợp đồng với công ty." } } }, "Không ai bị bắt, có thể chính bạn bị buộc tội"),
    C("Mở thùng cho nước, rồi gọi biên phòng và hội cứu trợ", { bw: -4, rel: 2, flags: ["lhl_called_border", "lhl_humane"] }, "Đúng luật mà vẫn tử tế, mất trọn một ngày", { tier: "awakened" })], 0)),
  daily(LH, "lhl_parking", [21, 65], 7, () => T("Bãi đất trống ven đường", "Đêm thứ hai trên đường. Bãi đỗ có bảo vệ còn cách bốn mươi cây số và thu phí bằng tiền ăn hai ngày. Ngay đây là một bãi đất trống miễn phí, nơi tuần trước có xe bị rạch bạt lấy hàng.", [
    C("Chạy thêm, ngủ ở bãi có bảo vệ", { money: -0.01, health: -1, counters: { lhl_safe_parking: 1 } }, "Tốn tiền, mệt thêm một chút"),
    C("Ngủ ở bãi miễn phí", { gamble: { p: 0.8, win: { money: 0.01, log: "Đêm yên. Sáng ra chỉ có sương đọng trên kính." }, lose: { money: -0.2, flags: ["lhl_robbed"], log: "Sáng ra bạt xe bị rạch, mất một phần ba số hàng. Công ty trừ vào tiền cọc của bạn." } } }, "Tiết kiệm, cược bằng số hàng")], 1)),
  daily(LH, "lhl_holiday", [21, 65], 8, (c) => T(c.country === "VN" ? "Xe đào ngày giáp Tết" : "Chuyến hàng mùa lễ", c.country === "VN"
    ? "Hai mươi tháng Chạp, chủ hàng trả gấp ba để bạn chở một xe đào và quất vào Nam. Giao xong là đêm giao thừa; bạn sẽ đón Tết ở bãi xe."
    : "Mùa lễ cuối năm, cước tăng gấp ba. Nhận chuyến này nghĩa là bạn đón năm mới trong một trạm dừng chân cách nhà nghìn cây số.", [
    C(c.country === "VN" ? "Nhận chuyến, ăn Tết ngoài đường" : "Nhận chuyến, đón năm mới ngoài đường", { money: 0.1, rel: -4, happy: -2, counters: { lhl_holidays_away: 1 } }, "Tiền gấp ba, một năm vắng mặt"),
    C("Từ chối, về nhà", { rel: 3, happy: 3, flags: ["lhl_home_holiday"] }, "Có mặt với gia đình, mất cước gấp ba")], 0)),
  daily(LH, "lhl_fund", [21, 65], 9, () => T("Quỹ tương trợ của tuyến", "Nhóm tài xế cùng tuyến lập một quỹ chung: mỗi người góp một ít mỗi tháng, ai gặp nạn trên đường thì quỹ lo tiền kéo xe và viện phí. Họ cần một người giữ sổ.", [
    C("Nhận giữ sổ quỹ, công khai từng khoản", { bw: -3, rel: 4, agency: 0.02, flags: ["lhl_fund_keeper", "leader"] }, "Lựa chọn thứ ba: mất thời gian, được cả tuyến tin", { tier: "sovereign" }),
    C("Góp tiền, không nhận việc", { money: -0.02, flags: ["lhl_fund_member"] }, "Tốn ít tiền, có chỗ dựa"),
    C("Không tham gia", { money: 0.01 }, "Giữ tiền, một mình khi gặp nạn")], 1)),
  daily(LH, "lhl_camera", [21, 65], 8, () => T("Camera nhìn vào mặt", "Công ty lắp camera hướng vào mặt tài xế. Máy đếm số lần bạn ngáp và dụi mắt; quá ba lần trong một giờ là bị trừ điểm. Vài tài xế đã dán băng dính lên ống kính.", [
    C("Để yên camera, nghỉ khi máy báo", { income_mult: 0.98, health: 2, flags: ["lhl_watched"] }, "Mất chuyến thưởng, ngủ đủ hơn"),
    C("Dán băng dính như mọi người", { counters: { lhl_risk: 1 }, gamble: { p: 0.6, win: { log: "Công ty không kiểm tra suốt cả quý." }, lose: { income_mult: 0.9, log: "Bạn bị phạt vì che camera và bị chuyển sang tuyến ngắn, lương thấp." } } }, "Thoải mái, có thể bị phạt")], 0)),
  daily(LH, "lhl_pass", [21, 65], 7, (c) => T("Cao tốc hay đường đèo", vary("lhlp", c.age, ["Tuyến cao tốc mới mở rút ngắn bốn tiếng, nhưng phí qua trạm bằng một phần năm tiền cước. Đường đèo cũ miễn phí, hẹp, sương mù dày.", "Mùa mưa, đường đèo cũ sạt lở một đoạn, chỉ còn một làn. Cao tốc thì thu phí gấp đôi dịp cao điểm."]), [
    C("Đi cao tốc, trả phí", { money: -0.03, health: 1, counters: { lhl_tolls: 1 } }, "Mất tiền, ngủ thêm bốn tiếng"),
    C("Đi đèo cũ, giữ tiền", { money: 0.02, counters: { lhl_risk: 1 }, gamble: { p: 0.85, win: { log: "Bạn qua đèo lúc trời hửng, sương tan dần sau lưng." }, lose: { money: -0.1, log: "Xe trượt bánh trên dốc ướt. Bạn mất hai ngày chờ xe cứu hộ." } } }, "Giữ tiền, cược vào con dốc")], 0)),

  /* ---------- gia đình ---------- */
  cross(LH, "lhl_family", [25, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => { const k = role(c, "child"); const s = role(c, "spouse");
    if (c.kids_teen > 0 && k) return T(`${N(k)} xin theo xe một chuyến`, `Cả năm, ${N(k)} gặp bạn chưa đến hai mươi ngày. Hè này ${N(k)} xin theo xe chạy một chuyến bốn ngày. Công ty cấm chở người nhà.`, [
      C("Xin phép đặc biệt, cho con theo", { money: -0.02, happy: 4, trust: { npc: k, delta: 0.3 } }, "Bốn ngày bên con, mất lòng điều phối"),
      C("Đổi sang tuyến ngắn suốt hè, tối nào cũng về", { money: -0.08, trust: { npc: k, delta: 0.2 } }, "Mất cước tuyến dài, có cả mùa hè"),
      C("Hứa sang năm, rồi chạy tiếp", { money: 0.03, promise: { to: k, what: "cho con theo xe một chuyến hè sau", years: 1 } }, "Giữ cước, nợ con một lời hứa")], 0, { npc: k });
    return T("Tin tuyển tài xế xe buýt", `Mỗi lần bạn về, ${N(s!)} đã quen tự quyết mọi việc trong nhà. Lần này ${N(s!)} đưa bạn xem tin tuyển tài xế xe buýt trong thành phố: lương bằng hai phần ba, nhưng tối nào cũng về.`, [
      C("Hứa chạy thêm hai năm rồi đổi nghề", { trust: { npc: s!, delta: 0.1 }, promise: { to: s!, what: "thôi chạy đường dài sau hai năm", years: 2 } }, "Giữ thu nhập, phải giữ lời"),
      C("Chuyển sang tuyến ngắn, chịu giảm thu nhập", { income_mult: 0.85, trust: { npc: s!, delta: 0.25 } }, "Ít tiền hơn, có mặt ở nhà"),
      C("Nói rằng bạn cần đường dài", { happy: 1, trust: { npc: s!, delta: -0.15 } }, "Giữ nghề mình chọn, người ở nhà xa dần")], 1, { npc: s! }); }),
];

export const PACK_ROAD_A: Storylet[] = [...SAILOR, ...PILOT, ...FISHER, ...HAULER];
