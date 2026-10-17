/**
 * Gói THỂ THAO A: cầu thủ bóng đá · võ sĩ · vận động viên điền kinh · tuyển thủ thể thao điện tử.
 * Mỗi con đường: 1 năng khiếu · 3 cơ hội · 5 nhịp truyện · 9 chuyện thường ngày · 1 chuyện gia đình. Đọc kèm docs/content-guide.md.
 * Các con đường này có thể bắt đầu từ 12–14 tuổi, nên nhịp truyện có thể rơi vào tuổi vị thành niên:
 * mọi khoản tiền ở những thẻ đó đi qua cash() để không vượt ±0.05 thu nhập hộ khi người chơi dưới 18.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

/** Dưới 18 tuổi, tiền là tiền của hộ: cắt về ±0.05. */
const cash = (c: FactContext, x: number): number => (c.age < 18 ? Math.max(-0.05, Math.min(0.05, x)) : x);
/** Đọc bộ đếm, mặc định 0. */
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;

const FB = "footballer";
const BX = "boxer";
const RN = "runner";
const ES = "esports";

export const PACK_SPORT_A: Storylet[] = [
  /* ================================================================ CẦU THỦ BÓNG ĐÁ (fb_) */
  /* Bộ đếm fb_rep: tiếng tăm trên sân. Cờ đọc lại: fb_academy, fb_abroad, fb_agent, fb_study_clause, fb_painkillers, fb_fixed, fb_captain. */

  /* ---------- năng khiếu ---------- */
  talent(FB, "fb_t_lot", [8, 14], () => true, (c) => T("Bãi đất sau chợ", `Chiều nào bạn cũng đá bóng với bọn lớn hơn ở bãi đất sau chợ, khung thành là hai chiếc dép. ${c.poor_country ? "Quả bóng là một cuộn giẻ quấn băng dính." : "Quả bóng đã sờn hết lớp da."} Một người đàn ông ngồi xem ba buổi liền, rồi hỏi tên bạn và bảo đội năng khiếu của quận đang tuyển.`, [
    C("Xin bố mẹ cho đi tập đội năng khiếu", { money: -0.03, flags: [talentFlag(FB)], counters: { talents_seen: 1 }, know: -2, health: 2 }, "Tốn tiền giày, bớt giờ học"),
    C("Tự tập thêm mỗi sáng trước giờ học", { flags: [talentFlag(FB)], counters: { talents_seen: 1, exercise: 1 }, bw: -3 }, "Không tốn tiền nhà, thiếu ngủ"),
    C("Đá ở bãi đất cho vui thôi", { counters: { talents_seen: 1 }, happy: 2 }, "Vui, không ai biết bạn giỏi đến đâu")], 2)),

  /* ---------- cơ hội bước vào ---------- */
  door(FB, "fb_d_academy", [12, 16], () => true, (c) => T("Ngày thử việc ở học viện", `Học viện bóng đá của một câu lạc bộ lớn mở ngày thử việc: hai nghìn đứa trẻ, ba mươi suất. Học viện cách nhà bốn trăm cây số, ở nội trú, học văn hóa buổi tối. ${f(c, talentFlag(FB)) ? "Người đàn ông ở bãi đất đã gửi tên bạn đi trước." : "Bạn đi cùng một đứa bạn, ban đầu chỉ định đứng xem."}`, [
    C("Đi thử, chấp nhận xa nhà", { counters: { doors_seen: 1 }, money: -0.02, gamble: { p: f(c, talentFlag(FB)) ? 0.5 : 0.25, win: { ...become(FB), flags: ["fb_academy"], log: "Tên bạn nằm trong danh sách ba mươi. Mẹ khâu tên vào từng chiếc áo." }, lose: { happy: -4, log: "Bạn bị loại sau trận đấu tập thứ hai. Huấn luyện viên nói bạn còn thấp quá." } } }, "Ba mươi suất trên hai nghìn, xa nhà từ nhỏ"),
    C("Ở nhà, đá cho đội của phường", { counters: { doors_seen: 1 }, know: 2, happy: 1 }, "Ở gần nhà, bỏ lỡ một cánh cửa")], 1)),
  door(FB, "fb_d_lowleague", [16, 22], () => true, (c) => T("Đội hạng ba tìm tiền đạo", `Đội bóng hạng ba của tỉnh mở cửa cho bất kỳ ai đến thử. Lương bằng nửa lương công nhân, ở chung phòng trọ sáu người, sân tập không có đèn. ${c.has_job ? "Bạn đang có một công việc ổn định." : "Bạn đang không có việc gì tốt hơn."}`, [
    C("Đến thử, bỏ việc làm thêm", { ...become(FB), counters: { doors_seen: 1 }, money: cash(c, -0.08), agency: 0.02 }, "Lương thấp, có một số áo"),
    C("Đá cho đội công ty vào cuối tuần", { counters: { doors_seen: 1 }, money: cash(c, 0.03), happy: 2 }, "Thu nhập ổn, bóng đá chỉ còn là thú vui")], 1)),
  door(FB, "fb_d_broker", [18, 22], () => true, (c) => T("Người môi giới đến từ xa", `Một người đàn ông nói mình môi giới cầu thủ cho các câu lạc bộ nước ngoài. Ông ta xem bạn đá hai mươi phút, rồi nói chỉ cần một khoản phí giấy tờ và vé máy bay, bằng ${c.poor_country ? "cả năm lương của bố bạn" : "ba tháng lương"}, là có buổi thử việc.`, [
    C("Gom tiền nhà, lên đường", { counters: { doors_seen: 1 }, money: -0.4, gamble: { p: 0.3, win: { ...become(FB), flags: ["fb_abroad"], log: "Buổi thử việc là thật. Một đội hạng hai giữ bạn lại với hợp đồng một năm." }, lose: { happy: -8, flags: ["fb_scammed"], log: "Đến nơi, không có buổi thử việc nào. Số điện thoại của người môi giới đã khóa." } } }, "Có thể là thật, có thể mất trắng"),
    C("Tự gửi video cho các câu lạc bộ, không qua ai", { counters: { doors_seen: 1 }, agency: 0.02, bw: -3, gamble: { p: 0.2, win: { ...become(FB), flags: ["fb_abroad"], log: "Một câu lạc bộ trả lời thư và tự trả vé máy bay cho bạn." }, lose: { happy: -2, log: "Bốn tháng, không câu lạc bộ nào trả lời." } } }, "Ít cơ hội, không mất đồng nào", { tier: "sovereign" }),
    C("Không đi", { counters: { doors_seen: 1 } }, "Giữ tiền nhà, giấc mơ ở lại")], 2)),

  /* ---------- mạch truyện ---------- */
  beat(FB, 1, 1, (c) => T("Lần đầu đá chính", `Huấn luyện viên cho bạn đá chính trận gặp đội đầu bảng${f(c, "fb_academy") ? " của giải trẻ" : ""}. Phút sáu mươi, bạn có bóng ở rìa vòng cấm. Đồng đội đá cặp đứng trống bên trái, nhưng góc sút trước mặt bạn cũng đang mở.`, [
    C("Tự sút", { counters: step(c, FB), gamble: { p: 0.4, win: { counters: { fb_rep: 2 }, flags: ["fb_striker"], log: "Bóng vào góc xa. Tên bạn được đọc trên loa sân." }, lose: { counters: { fb_rep: -1 }, rel: -2, log: "Bóng bay ra ngoài. Đồng đội không nói gì suốt bữa tối." } } }, "Nổi bật, hoặc mang tiếng ích kỷ"),
    C("Chuyền cho đồng đội", { counters: step(c, FB, { fb_rep: 1 }), flags: ["fb_team_player"], rel: 3 }, "Đội tin bạn, ít người nhớ tên bạn")], 1)),
  beat(FB, 2, 3, (c) => T("Hợp đồng chuyên nghiệp", `Câu lạc bộ đưa hợp đồng chuyên nghiệp năm năm. Ngoài cửa, một người đại diện đã chờ sẵn: ông ta lo hết chuyện đàm phán, đổi lại lấy hai phần mười mọi khoản bạn kiếm được trong mười năm, kể cả tiền quảng cáo.${c.age < 18 ? " Bạn chưa đủ mười tám tuổi, bố mẹ phải ký cùng." : ""}${f(c, "fb_abroad") ? " Ở xứ người, bạn không đọc hết được bản hợp đồng." : ""}`, [
    C("Ký qua người đại diện", { counters: step(c, FB), income_mult: 1.6, flags: ["fb_agent"] }, "Lương cao ngay, mất hai phần mười suốt mười năm"),
    C("Ký thẳng với câu lạc bộ, tự đàm phán", { counters: step(c, FB), income_mult: 1.25, bw: -5, flags: ["fb_self_rep"] }, "Lương thấp hơn, giữ trọn phần mình"),
    C("Đòi thêm suất học và điều khoản chấn thương", { counters: step(c, FB), gamble: { p: 0.45, win: { income_mult: 1.4, flags: ["fb_study_clause"], log: "Câu lạc bộ đồng ý. Bạn là cầu thủ trẻ duy nhất có lớp học buổi tối ghi trong hợp đồng." }, lose: { income_mult: 1.1, log: "Câu lạc bộ ký với người khác trước. Bạn nhận bản hợp đồng thấp hơn." } } }, "Có lối ra nếu chấn thương, có thể bị hạ giá", { tier: "sovereign" })], 0)),
  beat(FB, 3, 4, (c) => T("Tiếng kêu khô ở đầu gối", `Một pha vào bóng từ phía sau, đầu gối phải của bạn kêu một tiếng khô. Bác sĩ nói đứt dây chằng chéo, chín tháng mới đá lại được. Một bác sĩ khác của câu lạc bộ nói có thể tiêm giảm đau đá nốt mùa rồi mổ sau.${f(c, "fb_agent") ? " Người đại diện gọi hỏi bao giờ bạn ra sân, trước khi hỏi bạn có đau không." : ""}${f(c, "fb_study_clause") ? " Điều khoản học tiếp trong hợp đồng vẫn còn hiệu lực." : ""}`, [
    C("Mổ ngay, nghỉ chín tháng", { counters: step(c, FB, { fb_rep: -1 }), health: 6, income_mult: 0.8 }, "Mất chỗ đá chính, giữ được đầu gối"),
    C("Tiêm giảm đau, đá nốt mùa", { counters: step(c, FB), money: cash(c, 0.3), flags: ["fb_painkillers"], gamble: { p: 0.5, win: { counters: { fb_rep: 2 }, log: "Bạn đá hết mùa và ghi bàn ở trận quyết định. Đêm nào đầu gối cũng sưng." }, lose: { health: -12, income_mult: 0.6, log: "Tháng thứ hai, đầu gối khóa cứng giữa trận. Ca mổ phải làm lại hai lần." } } }, "Tiền và chỗ đứng bây giờ, đầu gối về sau"),
    C(f(c, "fb_study_clause") ? "Treo giày, dùng suất học trong hợp đồng" : "Treo giày, đi học lại", { counters: step(c, FB), ...leave(FB), flags: ["ex_footballer"], know: f(c, "fb_study_clause") ? 8 : 4, happy: -4 }, "Rời sân cỏ khi còn đi lại bình thường")], 0)),
  beat(FB, 4, 5, (c) => {
    if (f(c, "fb_fixed")) return T("Cái tên trong điện thoại", "Công an triệt phá một đường dây cá độ. Trong điện thoại của kẻ cầm đầu có tên bạn và ngày của trận đấu năm ấy. Liên đoàn gọi bạn lên làm việc vào sáng thứ hai.", [
      C("Khai hết, chịu án cấm thi đấu", { counters: step(c, FB), ...leave(FB), flags: ["fb_banned"], close_doors: ["clean_record"], happy: -6, agency: 0.02 }, "Mất nghề, hết phải giấu"),
      C("Chối, thuê luật sư", { counters: step(c, FB), money: cash(c, -0.5), gamble: { p: 0.4, win: { counters: { fb_rep: -2 }, log: "Không đủ bằng chứng. Bạn được đá tiếp, nhưng khán đài thôi hô tên bạn." }, lose: { ...leave(FB), flags: ["fb_banned"], close_doors: ["clean_record"], log: "Tòa tuyên án. Bạn bị cấm thi đấu suốt đời." } } }, "Có thể thoát, có thể mất cả nghề lẫn tiền"),
      C("Làm nhân chứng, khai cả đường dây", { counters: step(c, FB), gamble: { p: 0.55, win: { flags: ["fb_witness"], income_mult: 0.7, log: "Bạn được giảm án, đá lại sau một năm. Vài người trong đội không bắt tay bạn nữa." }, lose: { ...leave(FB), flags: ["fb_witness"], log: "Lời khai của bạn đưa cả đường dây ra tòa, nhưng liên đoàn vẫn cấm bạn thi đấu." } } }, "Phá đường dây, có thể vẫn mất nghề", { tier: "sovereign" })], 2);
    if (cnt(c, "fb_rep") >= 2 && !f(c, "fb_painkillers")) return T("Hai cuộc gọi trong một tuần", `Bạn được gọi lên đội tuyển quốc gia lần đầu. Cùng tuần đó, một câu lạc bộ ở nước giàu hơn trả gấp ba lương, nhưng bạn sẽ ngồi dự bị.${f(c, "fb_abroad") ? " Bạn đã đá ở xứ người đủ lâu để biết ghế dự bị lạnh thế nào." : ""}${f(c, "fb_agent") ? " Người đại diện đã hứa với họ trước khi hỏi bạn." : ""}`, [
      C("Sang đội giàu, chấp nhận ngồi dự bị", { counters: step(c, FB), income_mult: 1.8, rel: -4, happy: -2, flags: ["fb_rich_club"] }, "Gấp ba lương, ít được ra sân"),
      C("Ở lại, nhận băng đội trưởng", { counters: step(c, FB, { fb_rep: 2 }), income_mult: 1.15, happy: 4, flags: ["fb_captain"] }, "Lương thấp hơn, thành biểu tượng của đội"),
      C("Đòi điều khoản được đá chính mười lăm trận", { counters: step(c, FB), gamble: { p: 0.4, win: { income_mult: 1.6, counters: { fb_rep: 2 }, flags: ["fb_rich_club"], log: "Họ ký điều khoản. Mùa đầu bạn đá chính hai mươi trận." }, lose: { income_mult: 1.05, log: "Họ mua người khác. Bạn ở lại với mức lương cũ." } } }, "Có cả tiền lẫn sân, có thể mất cả hai", { tier: "sovereign" })], 1);
    return T("Bản hợp đồng cho mượn", `Đầu gối bạn không còn chịu nổi hai trận một tuần${f(c, "fb_painkillers") ? ", cái giá của mùa giải đá bằng thuốc giảm đau" : ""}. Câu lạc bộ muốn đem bạn cho một đội hạng dưới mượn, nửa lương. Một người bạn cũ mở cửa hàng đồ thể thao, đang cần người đứng quầy.`, [
      C("Đi đá hạng dưới, nửa lương", { counters: step(c, FB), income_mult: 0.6, happy: 2, flags: ["fb_journeyman"] }, "Vẫn được ra sân, thu nhập giảm nửa"),
      C("Giải nghệ, đứng quầy cửa hàng", { counters: step(c, FB), ...leave(FB), flags: ["ex_footballer"], health: 4 }, "Ổn định, mất sân cỏ"),
      C("Tự bỏ tiền mổ lại, cược một mùa cuối", { counters: step(c, FB), money: cash(c, -0.4), gamble: { p: 0.35, win: { counters: { fb_rep: 2 }, income_mult: 1.2, log: "Ca mổ thành công. Ngày bạn trở lại đá chính, khán đài đứng dậy vỗ tay." }, lose: { health: -6, happy: -5, log: "Đầu gối không hồi phục. Bạn ngồi khán đài cả mùa." } } }, "Tiền dành dụm đổi lấy một cơ hội")], 0);
  }),
  beat(FB, 5, 6, (c) => T("Trận chia tay", `Bạn đá trận cuối cùng. ${f(c, "fb_captain") ? "Cả khán đài giơ khăn in số áo của bạn." : f(c, "fb_rich_club") || f(c, "fb_abroad") ? "Ở xứ người, chỉ vài chục khán giả biết hôm nay là trận cuối của bạn." : "Câu lạc bộ dành mười phút trước giờ bóng lăn để tặng bạn một bó hoa."} Sau trận, có ba lời mời đang chờ.`, [
    C("Mở lớp bóng đá miễn phí cho trẻ con nghèo", { counters: step(c, FB), money: -0.3, rel: 6, happy: 4, flags: ["fb_free_school"] }, "Tốn tiền dành dụm, để lại một lứa cầu thủ", { longterm: true }),
    C("Học bằng huấn luyện viên, bắt đầu từ đội trẻ", { counters: step(c, FB), unflags: [life(FB)], custom: "become:coach", know: 3 }, "Thu nhập lại từ đầu, ở lại với bóng đá"),
    C("Nhận lời bình luận trên truyền hình", { counters: step(c, FB), money: 0.2, flags: ["fb_pundit"], happy: -1 }, "Tiền dễ, từ nay chỉ đứng ngoài nhìn")], 1), (c) => c.age >= 32),

  /* ---------- chuyện thường ngày ---------- */
  daily(FB, "fb_wages", [18, 38], 8, () => T("Ba tháng không lương", "Câu lạc bộ đã nợ lương cả đội ba tháng. Ông chủ hứa \"sau trận thứ bảy\". Hai cầu thủ lớn tuổi bắt đầu chạy xe ôm buổi tối để có tiền gửi về nhà.", [
    C("Đá tiếp, chờ", { money: -0.15, happy: -2, counters: { fb_rep: 1 } }, "Giữ hòa khí, cạn tiền"),
    C("Cùng cả đội gửi đơn lên liên đoàn", { agency: 0.02, flags: ["fb_union"], gamble: { p: 0.5, win: { money: 0.2, log: "Liên đoàn trừ điểm câu lạc bộ. Lương về đủ trong hai tuần." }, lose: { income_mult: 0.9, log: "Lương về, nhưng hết mùa câu lạc bộ không gia hạn cho ba người đứng tên đơn." } } }, "Đòi được tiền cho cả đội, có thể bị loại", { tier: "sovereign" }),
    C("Tìm đội khác ngay giữa mùa", { income_mult: 0.95, flags: ["fb_journeyman"], bw: -3 }, "Có lương, mất chỗ đứng ở đội cũ")], 0)),
  daily(FB, "fb_envelope", [18, 38], 10, () => T("Phong bì trên yên xe", "Một người lạ đợi bạn ở bãi gửi xe sau buổi tập. Ông ta không nói gì về tỷ số, chỉ nói \"trận thứ bảy không cần thắng\", rồi đặt một phong bì dày lên yên xe của bạn.", [
    C("Cầm phong bì", { money: 0.5, flags: ["fb_fixed"], secret: { tag: "PAID_BRIBE", severity: 0.7, fuse_years: [2, 8], note: "nhận tiền bán một trận bóng" } }, "Tiền ngay, một bí mật có thể nổ"),
    C("Trả lại, báo ban huấn luyện", { counters: { honest: 1 }, flags: ["fb_reported_fix"], gamble: { p: 0.7, win: { log: "Câu lạc bộ báo công an. Người lạ không quay lại." }, lose: { bw: -6, log: "Tuần sau, lốp xe của bạn bị rạch nát." } } }, "Sạch sẽ, có thể bị trả thù"),
    C("Trả lại, không nói với ai", { counters: { honest: 1 }, happy: -2 }, "Yên chuyện, nỗi lo ở lại")], 2)),
  daily(FB, "fb_penalty", [16, 38], 7, (c) => T("Quả phạt đền hỏng", vary("fbp", c.age, ["Phút cuối trận, bạn sút hỏng quả phạt đền. Sáng hôm sau, trang cá nhân của bạn có hơn hai nghìn tin nhắn chửi rủa.", "Bạn đá hỏng quả luân lưu thứ năm, đội bị loại. Có người tìm ra địa chỉ nhà bố mẹ bạn và đăng lên mạng."]), [
    C("Đăng lời xin lỗi, đọc hết tin nhắn", { happy: -5, counters: { fb_rep: 1 } }, "Người hâm mộ dịu lại, bạn mất ngủ"),
    C("Khóa mạng, chiều nào cũng ở lại tập sút", { counters: { exercise: 1 }, bw: 2, rel: -1 }, "Yên đầu, xa người hâm mộ"),
    C("Công bố những tin nhắn đe dọa, báo công an", { flags: ["fb_spoke_out"], gamble: { p: 0.5, win: { rel: 3, log: "Câu lạc bộ ra thông cáo bênh vực bạn. Vài tài khoản bị khóa." }, lose: { happy: -3, log: "Người ta bảo bạn \"không chịu được áp lực\"." } } }, "Lên tiếng thay nhiều người, có thể bị chế giễu", { tier: "awakened" })], 1)),
  daily(FB, "fb_night", [17, 36], 6, (c) => T("Lời rủ đi chơi đêm", vary("fbn", c.age, ["Đêm trước trận derby, ba đồng đội rủ bạn trốn khỏi khách sạn đi quán bar. Huấn luyện viên kiểm tra phòng lúc mười một giờ.", "Đội vừa thắng trận lớn. Cả nhóm rủ đi ăn mừng đến sáng, hai ngày nữa lại có trận."]), [
    C("Đi cùng", { rel: 3, counters: { drink: 1, fb_rep: -1 }, gamble: { p: 0.6, win: { log: "Không ai phát hiện. Từ đó bạn được rủ đi mọi cuộc vui." }, lose: { money: cash(c, -0.05), log: "Ảnh bạn trong quán bar lên mạng trước giờ bóng lăn. Câu lạc bộ phạt nửa tháng lương." } } }, "Thân với đội, có thể bị phạt"),
    C("Ở lại ngủ", { rel: -2, health: 1, counters: { fb_rep: 1 } }, "Giữ thể lực, bị coi là xa cách")], 1)),
  daily(FB, "fb_kin", [18, 38], 8, (c) => T("Cả họ trông vào bạn", `${c.country === "VN" ? "Tết năm ấy" : "Kỳ nghỉ năm ấy"}, bạn về nhà sau mùa giải đầu tiên có lương cao. Bố mẹ muốn xây lại nhà, một ông chú muốn vay vốn mở quán, ba người em họ xin tiền học.`, [
    C("Xây nhà cho bố mẹ, cho họ hàng vay", { money: -0.8, rel: 6, happy: 3, flags: ["fb_family_bank"] }, "Cả họ nở mày, tiền dành dụm cạn"),
    C("Gửi bố mẹ đều mỗi tháng, giữ phần còn lại", { money: -0.15, rel: 1, counters: { save: 1 } }, "Bền lâu, có người phật ý"),
    C("Thuê người quản lý tiền, để họ từ chối thay", { money: -0.05, rel: -4, flags: ["fb_planner"] }, "Giữ được tiền, mang tiếng keo kiệt", { tier: "awakened" })], 1)),
  daily(FB, "fb_bench", [18, 38], 8, (c) => T("Huấn luyện viên mới", vary("fbb", c.age, ["Huấn luyện viên mới đổi sơ đồ, vị trí của bạn biến mất. Mười trận liền bạn ngồi ghế dự bị.", "Câu lạc bộ mua một cầu thủ trẻ đá cùng vị trí, lương gấp đôi bạn. Bạn bị đưa xuống tập cùng đội hai."]), [
    C("Xin chuyển nhượng", { income_mult: 0.9, flags: ["fb_journeyman"], happy: 2 }, "Được ra sân, thu nhập giảm"),
    C("Tập đá một vị trí mới", { bw: -5, counters: { fb_rep: 1 }, gamble: { p: 0.5, win: { income_mult: 1.1, log: "Hai tháng sau, bạn đá chính ở vị trí hậu vệ cánh." }, lose: { happy: -3, log: "Bạn vẫn ngồi ghế dự bị, giờ ở một vị trí khác." } } }, "Mệt, có thể mở ra một sự nghiệp mới"),
    C("Kể chuyện với báo chí", { counters: { fb_rep: -1 }, gamble: { p: 0.3, win: { log: "Người hâm mộ đứng về phía bạn. Huấn luyện viên cho bạn đá lại." }, lose: { income_mult: 0.85, log: "Câu lạc bộ phạt bạn và để bạn ở đội hai đến hết mùa." } } }, "Có thể được ra sân, dễ bị phạt nặng")], 1)),
  daily(FB, "fb_chant", [16, 38], 9, () => T("Tiếng hô từ khán đài đội khách", "Khán đài đội khách hô những lời miệt thị nhắm vào màu da của một đồng đội. Trọng tài không dừng trận. Đồng đội ấy quay sang nhìn bạn.", [
    C("Dẫn cả đội rời sân", { agency: 0.02, flags: ["fb_walked_off"], gamble: { p: 0.5, win: { counters: { fb_rep: 2 }, log: "Trận đấu bị hoãn. Đội khách phải đá ba trận không khán giả." }, lose: { counters: { fb_rep: -1 }, log: "Đội bạn bị xử thua, báo chí chia làm hai phe." } } }, "Đặt ra luật mới, có thể bị xử thua", { tier: "sovereign" }),
    C("Đá tiếp, báo trọng tài và giám sát sau trận", { counters: { honest: 1 }, rel: 1 }, "Đúng quy trình, trận đấu vẫn tiếp diễn"),
    C("Giả như không nghe thấy", { happy: -3, rel: -2 }, "Yên trận, mất lòng đồng đội")], 1)),
  daily(FB, "fb_campaign", [20, 38], 9, () => T("Tấm ảnh trước bầu cử", "Một chính khách sắp ra tranh cử muốn chụp ảnh với bạn ở sân tập, đổi lại tài trợ cho câu lạc bộ một năm. Ông chủ câu lạc bộ đã gật đầu trước khi hỏi bạn.", [
    C("Chụp, cười đúng như họ dặn", { money: 0.05, counters: { fb_rep: -1 }, flags: ["fb_campaign_photo"] }, "Câu lạc bộ có tiền, bạn mất nửa khán đài"),
    C("Đòi ông ta cam kết làm sân bóng cho khu nghèo", { agency: 0.02, gamble: { p: 0.4, win: { flags: ["fb_pitch_promise"], rel: 4, log: "Ông ta ký trước mặt báo chí. Hai năm sau sân bóng mở cửa." }, lose: { income_mult: 0.95, log: "Ông ta chụp với một cầu thủ khác. Ông chủ câu lạc bộ ghi nhớ chuyện này." } } }, "Biến tấm ảnh thành sân bóng, có thể mất lòng chủ", { tier: "sovereign" }),
    C("Từ chối", { counters: { fb_rep: 1 }, income_mult: 0.97 }, "Giữ mình, ông chủ khó chịu")], 2)),
  daily(FB, "fb_pitch_kid", [16, 38], 9, (c) => T("Đứa trẻ trèo rào vào sân", "Phút cuối trận sân nhà, một đứa trẻ trèo rào chạy vào ôm chầm lấy bạn. Nó mặc áo số của bạn, con số được khâu tay. Bảo vệ đang chạy tới, và luật giải sẽ phạt đội chủ nhà.", [
    C("Bế nó ra tận cửa, ký lên áo", { money: cash(c, -0.03), counters: { fb_rep: 2 }, flags: ["fb_kid_moment"] }, "Khán giả nhớ mãi, bạn gánh phần tiền phạt"),
    C("Để bảo vệ đưa đi", { counters: { fb_rep: -1 }, happy: -1 }, "Đúng luật, một tấm ảnh buồn lên báo")], 0)),

  /* ---------- gia đình ---------- */
  cross(FB, "fb_family", [16, 45], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} không muốn đá bóng`, `${N(k)} lớn lên trên khán đài, mặc áo số của bạn từ năm ba tuổi. Giờ ${N(k)} nói thẳng: không muốn đá bóng, muốn học vẽ, và đã mệt vì ai cũng hỏi "có giỏi như bố mẹ không".`, [
      C("Để con học vẽ, tự trả tiền lớp", { trust: { npc: k, delta: 0.25 }, money: -0.05 }, "Con thoải mái, giấc mơ của bạn dừng lại"),
      C("Bắt con tập thêm một năm nữa", { trust: { npc: k, delta: -0.25 }, flags: ["fb_pushed_kid"] }, "Có thể con thành cầu thủ, có thể con xa bạn"),
      C("Hứa không bao giờ ép chuyện bóng đá nữa", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "không ép con đá bóng nữa", years: 3 } }, "Phải giữ lời cả khi con đổi ý", { tier: "awakened" })], 0, { npc: k });
    return T("Người đứng sau khung thành", `${N(p!)} có mặt ở mọi trận, đứng sau khung thành và la hét chỉ đạo bạn suốt chín mươi phút. Huấn luyện viên đề nghị bạn nói với ${N(p!)} đừng đến nữa.`, [
      C("Nói thẳng, xin bố mẹ chỉ ngồi khán đài", { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.1 }, log: `${N(p!)} lặng đi một lúc, rồi chuyển lên khán đài, chỉ vỗ tay.` }, lose: { trust: { npc: p!, delta: -0.3 }, log: `${N(p!)} không đến trận nào nữa suốt một năm.` } } }, "Yên tâm đá, có thể mất người cổ vũ đầu tiên"),
      C("Để mặc, chịu bị la", { trust: { npc: p!, delta: 0.05 }, counters: { fb_rep: -1 }, happy: -2 }, "Giữ hòa khí, trận đấu không còn là của bạn"),
      C("Mời cùng xem lại băng trận đấu mỗi tối", { trust: { npc: p!, delta: 0.2 }, bw: -3, flags: ["fb_tape_nights"] }, "Tốn thời gian, biến lời la thành lời bàn", { tier: "awakened" })], 2, { npc: p! });
  }),

  /* ================================================================ VÕ SĨ (bx_) */
  /* Bộ đếm bx_rep: tên tuổi trên đài; bx_hits: số đòn nặng vào đầu tích lại. Cờ đọc lại: bx_old_coach, bx_underground, bx_own_doctor, bx_technician, bx_dive, bx_champion. */

  /* ---------- năng khiếu ---------- */
  talent(BX, "bx_t_bag", [9, 15], () => true, (c) => T("Bao cát trong nhà kho", `Ông hàng xóm treo một bao cát cũ trong nhà kho. Chiều nào bạn cũng sang đánh vào nó đến khi hai tay sưng, không ai phải nhắc. ${c.age >= 12 ? "Ở trường, bạn vừa bị gọi lên phòng giám thị lần thứ hai vì đánh nhau." : "Bố mẹ bảo bạn nóng tính giống ông nội."}`, [
    C("Xin đi tập ở câu lạc bộ quyền anh", { money: -0.02, flags: [talentFlag(BX)], counters: { talents_seen: 1 }, health: 2, happy: 2 }, "Tốn tiền tập, cơn nóng có chỗ để đi"),
    C("Thôi, tập trung học", { counters: { talents_seen: 1 }, know: 2, happy: -1 }, "Bình yên, cơn nóng không có chỗ để đi")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(BX, "bx_d_bridge", [14, 20], () => true, (c) => T("Phòng tập dưới gầm cầu", `Một phòng tập quyền anh nằm dưới gầm cầu, mái tôn, sáu bao cát vá chằng vá đụp. Ông thầy già nhận học trò không lấy tiền, đổi lại phải quét sàn mỗi tối và hứa không bao giờ đánh nhau ngoài đường.${f(c, talentFlag(BX)) ? " Ông nhìn hai bàn tay bạn và bảo: \"Mai đến sớm.\"" : ""}`, [
    C("Vào tập, giữ lời hứa với thầy", { ...become(BX), counters: { doors_seen: 1 }, flags: ["bx_old_coach"], health: 2, bw: -2 }, "Mất mọi buổi tối, có kỷ luật"),
    C("Chỉ tập cho khỏe, không lên đài", { counters: { doors_seen: 1, exercise: 1 }, health: 3 }, "Khỏe người, không thành võ sĩ")], 1)),
  door(BX, "bx_d_warehouse", [18, 28], () => true, (c) => T("Võ đài đêm thứ bảy", `Trong một nhà kho ở rìa thành phố, cứ tối thứ bảy lại có những trận đấu không giấy phép, không bác sĩ, người xem đặt tiền. Một trận trả bằng ${c.poor_country ? "hai tháng lương công nhân" : "hai tuần lương"}, trả tiền mặt ngay đêm đó.`, [
    C("Lên đài lấy tiền mặt", { ...become(BX), counters: { doors_seen: 1 }, flags: ["bx_underground"], money: 0.1, health: -4 }, "Tiền nhanh, không ai chịu trách nhiệm nếu bạn ngã"),
    C("Tìm phòng tập có giấy phép, đi từ nghiệp dư", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.45, win: { ...become(BX), log: "Một phòng tập nhận bạn sau ba buổi thử. Trận đầu tiên của bạn có bác sĩ ngồi cạnh đài." }, lose: { happy: -2, log: "Phòng tập nói bạn đã quá tuổi để bắt đầu." } } }, "Chậm, có luật, có thể không ai nhận"),
    C("Không dính vào", { counters: { doors_seen: 1 } }, "An toàn, tiền vẫn thiếu")], 1)),
  door(BX, "bx_d_debt", [20, 28], (c) => c.broke || c.debt_ratio > 0.5, (c) => T("Trận đấu trả nợ", `Bạn đang nợ ${c.debt_ratio > 1 ? "hơn một năm thu nhập" : "gần nửa năm thu nhập"}. Một nhà tổ chức quyền anh cần người thế chỗ cho một trận sau mười ngày nữa, trả gọn hai tháng lương, thắng thua như nhau.`, [
    C("Nhận trận, tập mười ngày", { counters: { doors_seen: 1 }, health: -3, gamble: { p: 0.4, win: { ...become(BX), money: 0.2, log: "Bạn trụ đủ sáu hiệp. Nhà tổ chức hỏi bạn có muốn đấu tiếp không." }, lose: { money: 0.15, health: -5, log: "Bạn ngã ở hiệp ba. Tiền vẫn đủ trả hai món nợ." } } }, "Trả được nợ, đổi bằng cơ thể"),
    C("Từ chối, đi làm thêm ca đêm", { counters: { doors_seen: 1 }, money: 0.05, bw: -4 }, "Trả nợ chậm, giữ sức")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(BX, 1, 1, (c) => T("Ba hiệp đầu tiên", `Trận nghiệp dư đầu tiên: ba hiệp, mỗi hiệp hai phút, găng đỏ. Đối thủ đã có mười hai trận. Ở góc đài, ${f(c, "bx_old_coach") ? "ông thầy già" : "người quấn băng tay cho bạn"} nói nhỏ: "Đừng để nó dồn vào dây."`, [
    C("Lao lên đánh phủ đầu", { counters: step(c, BX, { bx_hits: 1 }), gamble: { p: 0.45, win: { counters: { bx_rep: 2 }, flags: ["bx_brawler"], log: "Trọng tài dừng trận ở hiệp hai. Người ta bắt đầu gọi bạn bằng biệt danh." }, lose: { health: -4, log: "Bạn thua điểm, mũi chảy máu đến sáng." } } }, "Thắng nhanh, hoặc ăn đòn nhiều"),
    C("Giữ khoảng cách, đánh tính điểm", { counters: step(c, BX), flags: ["bx_technician"], gamble: { p: 0.55, win: { counters: { bx_rep: 1 }, log: "Bạn thắng sát nút. Không ai nhớ trận này, trừ bạn." }, lose: { happy: -2, log: "Thua điểm. Có người trên khán đài huýt sáo chê bạn chạy." } } }, "Ít đòn hơn, ít người xem hơn")], 1)),
  beat(BX, 2, 3, (c) => T("Bản hợp đồng của nhà tổ chức", `Một nhà tổ chức đưa hợp đồng: ba trận mỗi năm, tiền thưởng bảo đảm, nhưng họ chọn đối thủ và giữ một phần ba mọi khoản.${f(c, "bx_underground") ? " Ông ta biết bạn từng đánh ở nhà kho, và nói \"sẽ không ai nhắc lại chuyện đó\"." : ""}${cnt(c, "bx_rep") >= 2 ? " Ông ta muốn bạn vì cái biệt danh." : ""}`, [
    C("Ký", { counters: step(c, BX), income_mult: 1.6, flags: ["bx_promoter"] }, "Trận đều, tiền đều, người khác chọn đối thủ"),
    C("Tự tìm trận, tự lo", { counters: step(c, BX), income_mult: 1.1, bw: -5, flags: ["bx_independent"] }, "Ít trận, giữ quyền với thân mình"),
    C("Đòi bác sĩ riêng và quyền từ chối đối thủ", { counters: step(c, BX), gamble: { p: 0.4, win: { income_mult: 1.4, flags: ["bx_promoter", "bx_own_doctor"], log: "Ông ta chửi thề rồi ký. Bạn là võ sĩ đầu tiên của ông ta có bác sĩ riêng." }, lose: { income_mult: 1.0, flags: ["bx_independent"], log: "Ông ta ký với người khác. Bạn tự đi tìm trận." } } }, "Giữ được cái đầu, có thể mất hợp đồng", { tier: "sovereign" })], 0)),
  beat(BX, 3, 4, (c) => T("Phim chụp não", `Sau một trận thua knock-out, phim chụp não cho thấy một vết mờ nhỏ.${cnt(c, "bx_hits") >= 3 ? " Bác sĩ hỏi đây có phải lần đầu bạn bị như thế không, và bạn không trả lời được." : ""} Hội đồng y khoa có thể không cấp giấy phép năm sau. ${f(c, "bx_own_doctor") ? "Bác sĩ riêng mà bạn đòi trong hợp đồng là người đầu tiên nói ra." : "Nhà tổ chức nói có những nước không kiểm kỹ như thế."}`, [
    C("Nghỉ một năm, chữa rồi chụp lại", { counters: step(c, BX, { bx_hits: -1 }), health: 6, income_mult: 0.7 }, "Mất đà, giữ được cái đầu"),
    C("Sang nước khác đấu, nơi không ai hỏi", { counters: step(c, BX, { bx_hits: 2 }), money: cash(c, 0.4), health: -6, flags: ["bx_unlicensed"] }, "Tiền bây giờ, trí nhớ về sau"),
    C("Treo găng", { counters: step(c, BX), ...leave(BX), flags: ["ex_boxer"], health: 4, happy: -4 }, "Giữ trí nhớ, mất nghề")], 0)),
  beat(BX, 4, 5, (c) => {
    if (f(c, "bx_dive")) return T("Đoạn ghi âm cũ", "Một nhà báo gọi cho bạn. Cô ấy có đoạn ghi âm nhà tổ chức bàn chuyện bạn sẽ ngã ở hiệp bốn trận năm ấy. Bài báo sẽ lên trong ba ngày, có hoặc không có lời của bạn.", [
      C("Nhận hết, trả lại tiền thưởng", { counters: step(c, BX), ...leave(BX), money: cash(c, -0.4), flags: ["bx_confessed"], agency: 0.02 }, "Mất nghề và tiền, hết phải sống với nó"),
      C("Chối, im lặng", { counters: step(c, BX), gamble: { p: 0.4, win: { counters: { bx_rep: -2 }, log: "Bài báo đăng, nhưng hội đồng không đủ bằng chứng để xử bạn." }, lose: { ...leave(BX), close_doors: ["clean_record"], log: "Hội đồng thu hồi giấy phép của bạn vĩnh viễn." } } }, "Có thể giữ nghề, có thể mất cả tên"),
      C("Kể hết, khai cả nhà tổ chức", { counters: step(c, BX), gamble: { p: 0.5, win: { flags: ["bx_witness"], income_mult: 0.8, log: "Nhà tổ chức bị cấm hoạt động. Bạn bị treo giò một năm rồi được đấu lại." }, lose: { ...leave(BX), flags: ["bx_witness"], log: "Nhà tổ chức bị điều tra, nhưng không ai còn dám xếp trận cho bạn." } } }, "Làm sạch nghề, có thể không ai thuê bạn nữa", { tier: "sovereign" })], 2);
    if (cnt(c, "bx_rep") >= 2 && cnt(c, "bx_hits") < 4) return T("Trận tranh đai", `Bạn có trận tranh đai vô địch. Nhà đương kim vô địch cao hơn bạn một cái đầu, chưa thua trận nào. Tiền thưởng chia ba phần cho bạn, bảy phần cho ông ta.${f(c, "bx_technician") ? " Thầy bạn dặn: đánh đủ mười hai hiệp, đừng đi tìm cú đấm may mắn." : ""}`, [
      C("Nhận trận như họ đưa", { counters: step(c, BX), money: cash(c, 0.5), gamble: { p: f(c, "bx_technician") ? 0.45 : 0.35, win: { flags: ["bx_champion"], income_mult: 1.8, counters: { bx_rep: 3 }, log: "Hiệp mười một, trọng tài giơ tay bạn lên. Cả khu phố cũ thức đến sáng." }, lose: { counters: { bx_hits: 2 }, health: -6, log: "Bạn thua điểm sau mười hai hiệp. Mắt trái sưng kín hai tuần." } } }, "Cơ hội một lần trong đời, chỉ ba phần tiền"),
      C("Đòi chia năm năm, không thì thôi", { counters: step(c, BX), agency: 0.02, gamble: { p: 0.35, win: { money: cash(c, 0.8), flags: ["bx_fair_purse"], counters: { bx_hits: 2 }, log: "Phía nhà vô địch đồng ý chia đôi. Bạn thua điểm sát nút, nhưng mang về đủ tiền mua nhà." }, lose: { counters: { bx_rep: -1 }, log: "Họ chọn một người thách đấu khác. Cơ hội tranh đai trôi qua." } } }, "Đòi phần công bằng, có thể mất trận", { tier: "sovereign" }),
      C("Từ chối, đấu thêm hai trận lấy kinh nghiệm", { counters: step(c, BX, { bx_rep: 1 }), happy: -2 }, "Chắc tay hơn, có thể không còn cơ hội")], 0);
    return T("Người thua có tên tuổi", `Bạn đã thua bốn trong sáu trận gần nhất. Nhà tổ chức giờ chỉ gọi bạn làm đối thủ "có tên tuổi" cho những võ sĩ trẻ đang lên, tiền đủ trả nợ từng tháng.${cnt(c, "bx_hits") >= 4 ? " Gần đây bạn hay quên mình để chìa khóa ở đâu." : ""}`, [
      C("Nhận tiếp các trận", { counters: step(c, BX, { bx_hits: 2 }), money: cash(c, 0.3), flags: ["bx_journeyman"], health: -4 }, "Trả được nợ, cái đầu trả giá"),
      C("Treo găng, đi làm bảo vệ", { counters: step(c, BX), unflags: [life(BX)], custom: "become:security_guard", happy: -2 }, "Lương đều, mất cái tên trên đài"),
      C("Vay tiền mở phòng tập của riêng mình", { counters: step(c, BX), unflags: [life(BX)], custom: "borrow:0.5|become:coach", flags: ["bx_own_gym"] }, "Nợ thêm, thành người dạy nghề", { longterm: true })], 0);
  }),
  beat(BX, 5, 6, (c) => T("Đôi găng treo trên tường", `${f(c, "bx_champion") ? "Chiếc đai vô địch nằm trong tủ kính ở phòng khách." : "Đôi găng đỏ của trận đầu tiên vẫn treo trên tường."} ${cnt(c, "bx_hits") >= 4 ? "Dạo này bạn hay quên tên người mới gặp." : "Bạn vẫn nhớ từng hiệp đấu."} Một cậu bé trong xóm đứng ở cửa, tay quấn băng vụng về, hỏi bạn có dạy không.`, [
    C("Dạy nó, như ngày xưa có người dạy bạn", { counters: step(c, BX), flags: ["bx_passed_on"], rel: 4, bw: -3 }, "Mất thời gian, có người nối nghề"),
    C("Khuyên nó đi học một nghề khác", { counters: step(c, BX), flags: ["bx_warned_kid"], happy: -1 }, "Có thể cứu nó, có thể nó tìm thầy khác tệ hơn"),
    C("Vận động luật bắt buộc chụp não mỗi năm cho võ sĩ", { counters: step(c, BX), agency: 0.03, bw: -5, flags: ["bx_safety_law"] }, "Mất mấy năm đi gõ cửa, đổi được luật chơi", { tier: "sovereign" })], 0), (c) => c.age >= 34),

  /* ---------- chuyện thường ngày ---------- */
  daily(BX, "bx_scale", [16, 40], 6, (c) => T("Thừa ba ký trước giờ cân", vary("bxs", c.age, ["Còn ba mươi sáu giờ đến buổi cân, bạn thừa ba ký. Nhà tổ chức nói thiếu cân là hủy trận, mất trắng tiền thưởng.", "Bạn muốn xuống một hạng cân để gặp đối thủ nhỏ hơn. Muốn thế phải ép năm ký trong một tháng."]), [
    C("Ép cân bằng mọi giá", { health: -6, counters: { bx_rep: 1 }, gamble: { p: 0.6, win: { log: "Bạn đạt cân, nhưng lên đài với đôi chân nặng như chì." }, lose: { health: -6, log: "Bạn ngất trước giờ cân. Trận bị hủy." } } }, "Giữ trận, cơ thể trả giá"),
    C("Xin đấu ở hạng cân trên", { counters: { bx_hits: 1 }, gamble: { p: 0.4, win: { counters: { bx_rep: 1 }, log: "Bạn thắng một người nặng hơn mình. Cái tên của bạn được nhắc nhiều hơn." }, lose: { health: -3, log: "Đối thủ nặng hơn hẳn. Bạn thua và đau suốt một tuần." } } }, "Không phải ép, nhưng gặp người to hơn"),
    C("Bỏ trận, chịu phạt hợp đồng", { money: cash(c, -0.1), health: 2, counters: { bx_rep: -1 } }, "Giữ sức, mất tiền và tiếng")], 2)),
  daily(BX, "bx_fourth", [18, 40], 10, () => T("Ngã ở hiệp bốn", "Nhà tổ chức gọi bạn vào phòng thay đồ, đóng cửa lại. Có người đặt tiền lớn cho đối thủ thắng knock-out ở hiệp bốn. Nếu bạn ngã đúng lúc đó, tiền thưởng của bạn sẽ gấp ba.", [
    C("Nhận lời", { money: 0.6, flags: ["bx_dive"], counters: { bx_rep: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [2, 8], note: "nhận tiền để thua một trận quyền anh" } }, "Tiền gấp ba, một bí mật đi theo"),
    C("Từ chối, đánh thật", { counters: { honest: 1 }, gamble: { p: 0.5, win: { counters: { bx_rep: 2 }, log: "Bạn thắng điểm. Nhà tổ chức không gọi bạn suốt một năm." }, lose: { income_mult: 0.85, log: "Bạn thua thật. Từ đó ông ta chỉ xếp cho bạn những trận khó." } } }, "Giữ mình, mất lòng người phát tiền"),
    C("Từ chối, báo hội đồng quyền anh", { flags: ["bx_reported"], agency: 0.01, gamble: { p: 0.5, win: { log: "Trận đấu bị hủy, nhà tổ chức bị điều tra." }, lose: { income_mult: 0.8, log: "Hội đồng nói không đủ bằng chứng. Tên bạn biến mất khỏi các lịch thi đấu." } } }, "Làm sạch nghề, có thể mất nghề", { tier: "awakened" })], 1)),
  daily(BX, "bx_presser", [18, 40], 8, (c, N) => { const r = role(c, "rival")!; return T("Buổi họp báo trước trận", `Trước ống kính, ${N(r)} gọi bạn là "kẻ hết thời" và nói một câu về mẹ bạn. Phóng viên quay sang chờ bạn đáp.`, [
    C("Đáp trả, hứa cho hắn nằm sàn", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "lời thách thức ở buổi họp báo" }, counters: { bx_rep: 1 }, money: 0.05 }, "Bán được vé, thêm một kẻ thù thật"),
    C("Bình thản, nói sẽ trả lời trên đài", { rel: 1, counters: { honest: 1 }, happy: -1 }, "Giữ đầu lạnh, kém hấp dẫn với báo chí"),
    C("Hẹn uống cà phê sau trận, dù thắng hay thua", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "ly cà phê sau trận đấu" }, log: "Sau trận, hai người ngồi với nhau đến khuya. Trận tái đấu bán hết vé." }, lose: { log: "Hắn không đến." } } }, "Có thể có thêm một người bạn, có thể bị coi là yếu", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(BX, "bx_spar", [18, 38], 7, (c) => T("Người đấu tập thuê", vary("bxp", c.age, ["Một nhà vô địch ở nước ngoài cần người đấu tập sáu tuần, trả bằng ba trận của bạn. Ông ta nổi tiếng đánh thật cả trong buổi tập.", "Phòng tập lớn nhất thành phố thuê bạn làm bạn tập cho một võ sĩ trẻ được đầu tư mạnh, mỗi chiều mười hiệp."]), [
    C("Nhận, học được gì thì học", { money: 0.15, know: 3, counters: { bx_hits: 1, bx_rep: 1 } }, "Tiền và nghề, thêm đòn vào đầu"),
    C("Từ chối, giữ sức cho trận của mình", { happy: -1, health: 1, flags: ["bx_saved_legs"] }, "Giữ sức, mất một khoản và một bài học")], 1)),
  daily(BX, "bx_bar", [18, 45], 10, (c) => T("Gã say ở quán ăn đêm", `Một gã say ở quán ăn đêm cố tình va vào bạn, gọi to tên bạn và thách ra ngoài. Cả quán quay lại nhìn. Trước tòa, nắm đấm của một võ sĩ chuyên nghiệp thường bị xét nặng hơn của người thường.${f(c, "bx_old_coach") ? " Bạn nhớ lời hứa với ông thầy già dưới gầm cầu." : ""}`, [
    C("Trả tiền, bỏ về", { happy: -2, counters: { honest: 1 }, flags: ["bx_walked_away"] }, "Mất mặt một tối, giữ giấy phép"),
    C("Ra ngoài với hắn", { counters: { bx_rep: 1 }, gamble: { p: 0.35, win: { log: "Hắn tỉnh rượu ngay khi nhìn thấy tay bạn. Không ai ra đòn." }, lose: { money: -0.3, close_doors: ["clean_record"], income_mult: 0.8, log: "Hắn phải vào viện. Bạn có án tích và bị treo giấy phép một năm." } } }, "Giữ thể diện, có thể mất cả nghề"),
    C("Ngồi yên, nhờ chủ quán gọi công an", { bw: -2, rel: 1, flags: ["bx_called_police"] }, "Đúng luật, bị cả quán cười")], 0)),
  daily(BX, "bx_kids", [20, 45], 9, () => T("Lũ trẻ bám cửa phòng tập", "Mấy đứa trẻ trong xóm ngày nào cũng đứng bám cửa phòng tập xem bạn đánh bao cát. Một đứa ngày nào cũng ở đến tối mịt, không muốn về nhà.", [
    C("Mở lớp miễn phí sáng chủ nhật", { bw: -4, rel: 4, flags: ["bx_sunday_class"] }, "Mất ngày nghỉ, lũ trẻ có chỗ để đến", { longterm: true }),
    C("Hỏi chuyện đứa bé, báo cho nhà trường", { flags: ["bx_spoke_for_kid"], gamble: { p: 0.6, win: { rel: 3, log: "Cô giáo chủ nhiệm đến nhà đứa bé. Tuần sau nó đi học lại đều." }, lose: { bw: -3, log: "Bố đứa bé đến phòng tập chửi bới bạn trước mặt mọi người." } } }, "Có thể giúp nó, có thể rước phiền"),
    C("Đuổi đi cho đỡ vướng", { counters: { kind: -1 }, bw: 2 }, "Yên tĩnh, mất một cơ hội làm điều tốt")], 0)),
  daily(BX, "bx_license", [18, 42], 7, (c) => T("Giấy khám sức khỏe hằng năm", vary("bxl", c.age, ["Khám sức khỏe để gia hạn giấy phép, bác sĩ thấy võng mạc mắt trái của bạn có một vết rách nhỏ.", "Bác sĩ của hội đồng nói tim bạn đập bất thường khi gắng sức, chưa ký giấy."]), [
    C("Khám thật, chờ kết quả", { counters: { honest: 1 }, gamble: { p: 0.6, win: { log: "Bạn chữa kịp. Giấy phép được gia hạn sau hai tháng." }, lose: { income_mult: 0.8, log: "Giấy phép bị treo một năm. Bạn đi làm thuê ở công trường để sống." } } }, "Có thể mất một năm thi đấu"),
    C("Nhờ người quen ở phòng khám ký giấy", { money: -0.05, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 7], note: "giấy khám sức khỏe võ sĩ ký khống" }, counters: { bx_hits: 1 } }, "Đấu tiếp ngay, giấu một vết thương và một tờ giấy")], 0)),
  daily(BX, "bx_film", [20, 45], 9, () => T("Vai phụ trong phim hành động", "Một đạo diễn muốn bạn đóng vai tay đấm trong một phim hành động, quay sáu tuần, trùng đúng trại tập trước trận lớn.", [
    C("Nhận vai", { money: 0.2, flags: ["bx_on_screen"], gamble: { p: 0.5, win: { counters: { bx_rep: 1 }, log: "Phim ăn khách. Khán giả đến xem bạn đấu đông gấp đôi." }, lose: { health: -2, log: "Bạn lên đài thiếu tập và thua một trận đáng lẽ thắng." } } }, "Tiền và tiếng, mất trại tập"),
    C("Từ chối, vào trại tập", { counters: { exercise: 1 }, happy: -1 }, "Giữ phong độ, lỡ một cơ hội ngoài đài")], 1)),
  daily(BX, "bx_camp", [20, 40], 8, (c) => T("Tiền cho trại tập", `Trận tới cần tám tuần tập với huấn luyện viên thể lực, bạn tập và thức ăn riêng. Tổng chi phí bằng ${c.poor_country ? "gần một năm thu nhập của cả nhà" : "bốn tháng lương"}, phải trả trước.`, [
    C("Vay để tập đầy đủ", { custom: "borrow:0.3", counters: { bx_rep: 1 }, health: 3 }, "Lên đài sung sức, gánh thêm nợ"),
    C("Tự tập ở phòng tập cũ", { counters: { bx_hits: 1 }, money: -0.03 }, "Không nợ, lên đài kém hơn"),
    C("Bán trước một phần tiền thưởng cho mạnh thường quân", { money: 0.1, income_mult: 0.9, flags: ["bx_backer"] }, "Có tiền tập, trận nào cũng phải chia phần")], 1)),

  /* ---------- gia đình ---------- */
  cross(BX, "bx_family", [18, 45], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "mother"), (c, N) => {
    const s = c.married ? role(c, "spouse") : undefined; const m = role(c, "mother");
    if (s) return T("Người không dám xem trận", `${N(s)} chưa từng xem hết một trận của bạn. Đêm nào có trận, ${N(s)} ngồi ngoài hành lang nhà thi đấu, đợi đến tiếng chuông cuối. Tối nay ${N(s)} hỏi: còn bao nhiêu trận nữa?`, [
      C("Hứa treo găng sau ba trận nữa", { trust: { npc: s, delta: 0.2 }, promise: { to: s, what: "treo găng sau ba trận nữa", years: 3 } }, "Có ngày kết thúc, phải giữ lời", { tier: "awakened" }),
      C("Nói thật: chưa biết", { trust: { npc: s, delta: -0.1 }, counters: { bx_rep: 1 } }, "Thật lòng, bạn đời lo thêm"),
      C("Rủ vào ngồi ở góc đài", { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.25 }, log: `${N(s)} ngồi ở góc đài, cầm khăn cho bạn. Từ đó không trận nào vắng.` }, lose: { trust: { npc: s, delta: -0.15 }, log: `${N(s)} bỏ ra ngoài từ hiệp hai và ngồi khóc ở bãi xe.` } } }, "Gần nhau hơn, có thể làm họ sợ hơn")], 0, { npc: s });
    return T(c.country === "VN" ? "Nén hương đêm có trận" : "Lời cầu nguyện đêm có trận", `Đêm nào bạn có trận, ${N(m!)} ${c.country === "VN" ? "thắp hương ngồi trước bàn thờ" : "ngồi cầu nguyện"} đến khi có tin. ${N(m!)} chưa bao giờ nói ra, nhưng hàng xóm kể từ ngày bạn lên đài, bà gầy đi trông thấy.`, [
      C("Gọi cho mẹ ngay sau mỗi trận", { trust: { npc: m!, delta: 0.2 }, flags: ["bx_calls_mom"], bw: -1 }, "Mẹ yên lòng, bạn phải nghe giọng mẹ cả lúc thua"),
      C("Đưa mẹ đến phòng tập xem một buổi", { gamble: { p: 0.6, win: { trust: { npc: m!, delta: 0.3 }, log: `${N(m!)} xem bạn tập, rồi hỏi thầy về găng tay và mũ bảo hộ.` }, lose: { trust: { npc: m!, delta: -0.1 }, log: `${N(m!)} nhìn bạn tập được năm phút thì xin về.` } } }, "Mẹ hiểu nghề hơn, có thể sợ hơn"),
      C("Thôi, không nói chuyện nghề với mẹ", { happy: -2 }, "Đỡ khó xử, khoảng cách còn nguyên")], 0, { npc: m! });
  }),

  /* ================================================================ VẬN ĐỘNG VIÊN ĐIỀN KINH (rn_) */
  /* Bộ đếm rn_pb: thành tích cá nhân. Cờ đọc lại: rn_all_in, rn_switched, rn_shoe_deal, rn_doped, rn_whistle, rn_medal. */

  /* ---------- năng khiếu ---------- */
  talent(RN, "rn_t_crosscountry", [8, 14], () => true, (c) => T("Giải việt dã đầu tiên", `${c.poor_country ? "Mỗi sáng bạn chạy sáu cây số đến trường vì nhà không có xe." : "Bạn chạy quanh khu nhà mỗi tối chỉ vì thích nghe tiếng thở của mình."} Ở giải việt dã của ${c.country === "VN" ? "huyện" : "vùng"}, bạn về nhất trong đôi ${c.poor_country ? "dép nhựa" : "giày vải mòn gót"}, bỏ người thứ hai nửa vòng sân.`, [
    C("Xin vào đội điền kinh của tỉnh", { money: -0.03, flags: [talentFlag(RN)], counters: { talents_seen: 1, exercise: 1 }, know: -2 }, "Tốn tiền đi lại, bớt giờ học"),
    C("Chạy cho vui, giữ việc học", { counters: { talents_seen: 1 }, know: 2 }, "Học tốt hơn, đôi chân không ai biết đến")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RN, "rn_d_school", [12, 17], () => true, (c) => T("Trường năng khiếu thể thao", `Trường năng khiếu thể thao ${c.country === "VN" ? "của tỉnh" : "của vùng"} tuyển mười học sinh chạy cự ly trung bình. Bao ăn ở, buổi sáng chạy, buổi chiều học, nhưng chương trình văn hóa nhẹ hơn trường thường.${f(c, talentFlag(RN)) ? " Thầy thể dục đã gửi kết quả giải việt dã của bạn đi." : ""}`, [
    C("Vào trường năng khiếu", { ...become(RN), counters: { doors_seen: 1 }, know: -3, health: 3, flags: ["rn_sport_school"] }, "Có thầy, có sân, học hành mỏng đi"),
    C("Ở lại trường thường, chạy ngoài giờ", { counters: { doors_seen: 1, exercise: 1 }, know: 2 }, "Học đủ, chạy không ai dạy")], 1)),
  door(RN, "rn_d_city", [18, 24], () => true, (c) => T("Giải chạy thành phố", `Bạn chạy một giải nghiệp dư chỉ để lấy áo kỷ niệm, rồi về thứ tư trong nhóm chuyên nghiệp. Một huấn luyện viên đội tuyển đợi bạn ở vạch đích, hỏi bạn có dám bỏ việc để tập không.${c.has_job ? "" : " Bạn đang thất nghiệp."}`, [
    C("Bỏ việc, theo đội tuyển", { ...become(RN), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02 }, "Thu nhập giảm, có một lá cờ trên áo"),
    C("Tập sau giờ làm, chạy giải để thử sức", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.3, win: { ...become(RN), log: "Sáu tháng sau, thành tích của bạn đủ chuẩn đội tuyển. Họ gọi lại." }, lose: { happy: -2, log: "Bạn kiệt sức sau ba tháng vừa làm vừa tập." } } }, "Giữ việc, cơ hội mong manh"),
    C("Cảm ơn, giữ chiếc áo kỷ niệm", { counters: { doors_seen: 1 }, happy: 1 }, "Đời yên ổn, một câu hỏi bỏ ngỏ")], 1)),
  door(RN, "rn_d_unit", [17, 24], () => true, (c) => T("Đội thể thao của ngành", `Đội điền kinh của một ngành có biên chế tuyển vận động viên: có lương, có nhà tập thể, ${c.poor_country ? "có bữa ăn đủ thịt mỗi ngày" : "có bảo hiểm y tế"}. Đổi lại, bạn phải ký cam kết phục vụ mười năm và chạy cho họ ở mọi giải trong nước.`, [
    C("Ký cam kết mười năm", { ...become(RN), counters: { doors_seen: 1 }, money: cash(c, 0.05), flags: ["rn_salaried"] }, "Lương đều, mười năm không tự do"),
    C("Không ký, giữ tự do chọn giải", { counters: { doors_seen: 1 }, happy: 1 }, "Tự do, không có gì chắc chắn")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(RN, 1, 1, (c) => { const young = c.age < 19; return T("Hai buổi mỗi ngày", `Huấn luyện viên muốn bạn tập hai buổi mỗi ngày: năm giờ sáng và năm giờ chiều, một trăm bốn mươi cây số mỗi tuần. Như vậy bạn phải bỏ ${young ? "lớp học thêm buổi tối, và kỳ thi cuối năm sẽ khó giữ" : "ca làm thêm buổi tối, thứ duy nhất đang trả tiền nhà"}.`, [
    C("Theo lịch hai buổi", { counters: step(c, RN, { rn_pb: 2 }), flags: ["rn_all_in"], ...(young ? { know: -4 } : { money: -0.1 }) }, young ? "Nhanh hơn, học hành đuối dần" : "Nhanh hơn, túi tiền đuối dần"),
    C("Tập một buổi, giữ đường lui", { counters: step(c, RN, { rn_pb: 1 }), flags: ["rn_plan_b"], ...(young ? { know: 2 } : { money: 0.03 }) }, "Chậm hơn, có chỗ dựa nếu hỏng chân")], 0); }),
  beat(RN, 2, 3, (c) => c.poor_country
    ? T("Lá cờ khác trên ngực áo", "Liên đoàn điền kinh của một nước giàu mời bạn nhập quốc tịch: lương gấp mười lần, nhà ở, trại tập riêng. Đổi lại, bạn sẽ không bao giờ được chạy cho đất nước mình nữa.", [
      C("Nhận quốc tịch mới", { counters: step(c, RN), income_mult: 2.0, flags: ["rn_switched"], rel: -4, happy: -2 }, "Giàu lên, mất lá cờ của mình"),
      C("Ở lại chạy cho quê nhà", { counters: step(c, RN), income_mult: 1.1, flags: ["rn_home_flag"], rel: 3 }, "Nghèo hơn, được cả nước gọi tên"),
      C("Đòi liên đoàn nhà ký lương để ở lại", { counters: step(c, RN), agency: 0.02, gamble: { p: 0.35, win: { income_mult: 1.5, flags: ["rn_home_flag", "rn_home_deal"], log: "Liên đoàn nhà lần đầu ký lương cho một vận động viên trẻ. Báo chí gọi đó là \"hợp đồng giữ người\"." }, lose: { income_mult: 1.0, flags: ["rn_home_flag"], log: "Liên đoàn nói không có ngân sách. Lời mời kia đã hết hạn." } } }, "Mở đường cho người sau, có thể mất cả hai", { tier: "sovereign" })], 1)
    : T("Hợp đồng giày độc quyền", "Một hãng đồ thể thao đưa hợp đồng tài trợ năm năm, đủ để bạn khỏi phải đi làm thêm. Đổi lại, họ chọn lịch giải cho bạn và bạn chỉ được đi giày của họ, kể cả khi hãng khác làm giày nhanh hơn.", [
      C("Ký năm năm", { counters: step(c, RN), income_mult: 1.7, flags: ["rn_shoe_deal"] }, "Hết lo tiền, mất quyền chọn giải"),
      C("Ở ngoài, nhận thưởng theo từng giải", { counters: step(c, RN), income_mult: 1.1, flags: ["rn_free_runner"], bw: -4 }, "Chọn được giải, tiền bấp bênh"),
      C(c.sex === "F" ? "Đòi giữ lương khi chấn thương hay mang thai" : "Đòi điều khoản giữ lương khi chấn thương", { counters: step(c, RN), agency: 0.02, gamble: { p: 0.4, win: { income_mult: 1.5, flags: ["rn_shoe_deal", "rn_safe_clause"], log: "Hãng đồng ý. Về sau, điều khoản ấy được gọi theo tên bạn." }, lose: { income_mult: 1.05, flags: ["rn_free_runner"], log: "Hãng ký với người khác. Bạn tự lo tiền tập." } } }, "Bảo vệ cả những năm xấu, có thể mất hợp đồng", { tier: "sovereign" })], 0)),
  beat(RN, 3, 4, (c, N) => {
    const m = role(c, "mentor");
    return T("Hộp thuốc không nhãn", `Trước vòng loại lớn, ${m ? N(m) : "huấn luyện viên"} đưa bạn một hộp thuốc không nhãn và nói: "Cả đội đều dùng, kiểm tra không ra đâu." Bạn còn thiếu hai giây so với tiêu chuẩn.${f(c, "rn_switched") ? " Liên đoàn mới của bạn trả thưởng theo từng tấm huy chương." : ""}`, [
      C("Dùng", { counters: step(c, RN, { rn_pb: 3 }), flags: ["rn_doped"], secret: { tag: "CHEATED_EXAM", severity: 0.6, fuse_years: [2, 8], note: "dùng thuốc cấm trước vòng loại" } }, "Đạt chuẩn, mang theo một quả bom hẹn giờ"),
      C("Từ chối, chạy bằng sức mình", { counters: step(c, RN, { honest: 1 }), flags: ["rn_clean"], gamble: { p: 0.35, win: { counters: { rn_pb: 1 }, log: "Bạn đạt chuẩn với ba phần mười giây dư." }, lose: { happy: -5, log: "Bạn thiếu một giây rưỡi. Hai người dùng thuốc đi tiếp." } } }, "Sạch, có thể lỡ giải lớn nhất đời"),
      C("Nộp hộp thuốc cho cơ quan chống doping", { counters: step(c, RN), flags: ["rn_whistle"], agency: 0.03, ...(m ? { memory: { npc: m, tag: "BETRAYED_PARTNERSHIP" as const, weight: -0.3, note: "hộp thuốc bị nộp cho cơ quan chống doping" } } : {}), gamble: { p: 0.5, win: { log: "Cả đường dây bị điều tra. Đội tẩy chay bạn, nhưng bạn được giữ chỗ." }, lose: { income_mult: 0.7, log: "Liên đoàn ém chuyện đi. Tên bạn bị gạch khỏi đội tập trung." } } }, "Đổi luật chơi, có thể mất chỗ", { tier: "sovereign" }),
      C("Rời đội tuyển, chạy giải đường phố kiếm sống", { counters: step(c, RN), ...leave(RN), flags: ["rn_quit_team"], money: cash(c, 0.1) }, "Sạch và tự do, hết giấc mơ huy chương")], 1, m ? { npc: m } : {});
  }),
  beat(RN, 4, 5, (c) => {
    if (f(c, "rn_doped")) return T("Mẫu thử lưu kho", "Cơ quan chống doping kiểm tra lại các mẫu thử lưu kho từ những năm trước bằng phương pháp mới. Mẫu của bạn dương tính. Huy chương, kỷ lục và tiền thưởng của những năm ấy đều có thể bị thu hồi.", [
      C("Nhận lỗi, trả lại huy chương", { counters: step(c, RN), ...leave(RN), money: cash(c, -0.5), flags: ["rn_stripped"], agency: 0.02 }, "Mất tất cả, không còn gì phải giấu"),
      C("Kháng cáo đến cùng", { counters: step(c, RN), money: cash(c, -0.4), gamble: { p: 0.25, win: { log: "Tòa trọng tài thể thao hủy kết quả vì sai quy trình bảo quản mẫu." }, lose: { ...leave(RN), close_doors: ["clean_record"], flags: ["rn_stripped"], log: "Kháng cáo bị bác. Bạn bị cấm thi đấu tám năm." } } }, "Có thể giữ được, mất tiền và thời gian"),
      C("Khai cả hệ thống đã đưa thuốc cho bạn", { counters: step(c, RN), flags: ["rn_whistle"], gamble: { p: 0.5, win: { income_mult: 0.8, log: "Án của bạn được giảm còn hai năm. Ba huấn luyện viên bị cấm hành nghề." }, lose: { ...leave(RN), log: "Bạn vẫn bị cấm, nhưng hệ thống ấy không còn đưa thuốc cho ai nữa." } } }, "Nói thật cho người sau, vẫn có thể mất nghề", { tier: "sovereign" })], 0);
    if (cnt(c, "rn_pb") >= 3 || f(c, "rn_whistle")) return T("Mười hai người ở vạch xuất phát", `Chung kết lớn nhất đời bạn.${f(c, "rn_switched") ? " Trên ngực áo là lá cờ của một nước khác." : ""}${f(c, "rn_whistle") ? " Vài người trong đội vẫn không nhìn mặt bạn." : ""} Đồng đội đề nghị hai người thay nhau kéo nhịp, nhưng như thế chỉ một người còn sức lên bục.`, [
      C("Chạy cho riêng mình", { counters: step(c, RN), gamble: { p: Math.min(0.55, 0.25 + cnt(c, "rn_pb") * 0.05), win: { flags: ["rn_medal"], income_mult: 1.6, money: cash(c, 0.5), log: "Bạn băng qua vạch đích thứ hai. Tấm huy chương bạc nặng hơn bạn tưởng." }, lose: { happy: -4, log: "Bạn về thứ năm. Cả trăm mét cuối bạn không nghe thấy gì." } } }, "Cơ hội huy chương, có thể về tay trắng"),
      C("Kéo nhịp cho đồng đội", { counters: step(c, RN), flags: ["rn_paced_friend"], rel: 4, gamble: { p: 0.5, win: { happy: 5, log: "Đồng đội giành huy chương, quay lại ôm bạn trên đường chạy." }, lose: { happy: -2, log: "Cả hai về ngoài top năm. Không ai nhắc lại kế hoạch ấy." } } }, "Đội có thể thắng, tên bạn không ở trên bục", { tier: "awakened" })], 0);
    return T("Vết nứt ở xương chày", `Phim chụp cho thấy một vết nứt mỏi ở xương chày, cái giá của ${f(c, "rn_all_in") ? "những năm chạy hai buổi mỗi ngày" : "quá nhiều giải trong một mùa"}. Thành tích của bạn đã chững lại ba năm. Có người thuê bạn làm người dẫn tốc cho các giải đường phố.`, [
      C("Nghỉ hẳn một năm, đổi sang chạy marathon", { counters: step(c, RN), income_mult: 0.7, flags: ["rn_marathon"], health: 4 }, "Bắt đầu lại ở cự ly khác, mất một năm"),
      C("Làm người dẫn tốc thuê", { counters: step(c, RN), money: cash(c, 0.2), flags: ["rn_pacer"], health: -3 }, "Có tiền, chạy cho chiến thắng của người khác"),
      C("Giải nghệ, theo học huấn luyện viên", { counters: step(c, RN), unflags: [life(RN)], custom: "become:coach", know: 3 }, "Rời đường chạy, ở lại với nghề")], 0);
  }),
  beat(RN, 5, 6, (c) => T("Vòng chạy cuối ở quê nhà", `Bạn chạy giải ở thành phố quê nhà lần cuối với số áo chuyên nghiệp. ${f(c, "rn_medal") ? "Người ta vẫn nhận ra bạn ở cây số thứ ba mươi." : f(c, "rn_switched") ? "Khán giả quê nhà không biết nên cổ vũ cho lá cờ nào trên áo bạn." : "Chỉ vài người già trong xóm còn nhớ tên bạn."} Sau vạch đích, một nhóm trẻ con chạy chân đất đứng chờ.`, [
    C("Mở trại chạy miễn phí cho trẻ vùng quê", { counters: step(c, RN), money: -0.3, rel: 5, flags: ["rn_camp"] }, "Tốn tiền dành dụm, để lại một lứa người chạy", { longterm: true }),
    C(f(c, "rn_doped") ? "Kể công khai chuyện hộp thuốc năm xưa" : "Đòi xét lại các kỷ lục dính thuốc", { counters: step(c, RN), agency: 0.03, bw: -4, flags: ["rn_reopen"], gamble: { p: 0.4, win: { log: "Liên đoàn xét lại mười năm kết quả. Ba tấm huy chương được trao lại cho người chạy sạch." }, lose: { rel: -3, log: "Người ta bảo bạn chỉ muốn khuấy lại chuyện cũ." } } }, "Trả lại công bằng cho người khác, thêm kẻ thù", { tier: "sovereign" }),
    C("Treo giày, về sống yên", { counters: step(c, RN), happy: 3, health: 2 }, "Bình yên, đôi chân được nghỉ")], 0), (c) => c.age >= 32),

  /* ---------- chuyện thường ngày ---------- */
  daily(RN, "rn_altitude", [15, 36], 6, (c) => T("Ba tháng trên núi cao", vary("rna", c.age, ["Đội tập trung ba tháng ở một trại tập trên núi cao hai nghìn mét, không sóng điện thoại, mỗi tuần chỉ một chuyến xe xuống thị trấn.", "Mùa tập trên núi năm nay rơi đúng vào dịp gia đình có việc lớn."]), [
    C("Lên núi", { counters: { rn_pb: 1 }, rel: -3, happy: -1 }, "Phổi khỏe hơn, người nhà xa hơn"),
    C("Tập ở nhà, tự lo", { rel: 2, counters: { rn_pb: -1 }, flags: ["rn_home_training"] }, "Ở gần người thân, chậm hơn đối thủ")], 0)),
  daily(RN, "rn_prize", [18, 38], 7, (c) => T("Mùa giải chạy có thưởng", vary("rnp", c.age, ["Một người quản lý đề nghị đưa bạn đi tám giải chạy đường phố có thưởng ở nước ngoài trong một năm, ông ta giữ hai phần mười.", "Một giải marathon thương mại trả tiền xuất hiện cho bạn, đúng ba tuần trước giải vô địch quốc gia."]), [
    C("Chạy hết, lấy tiền", { money: 0.3, health: -5, counters: { rn_pb: -1 } }, "Nhiều tiền, đôi chân mòn nhanh"),
    C("Chọn ba giải, giữ sức", { money: 0.08, counters: { rn_pb: 1 } }, "Ít tiền, giữ được phong độ"),
    C("Lập nhóm vận động viên, thuê chung một luật sư", { agency: 0.02, bw: -4, flags: ["rn_collective"], money: 0.12 }, "Tự đàm phán được, tốn công sức", { tier: "sovereign" })], 1)),
  daily(RN, "rn_carbon", [16, 38], 9, (c) => T("Đôi giày nhanh hơn", `Một mẫu giày chạy mới giúp người ta nhanh hơn hai phần trăm, đắt bằng ${c.poor_country ? "nửa tháng lương" : "vài ngày lương"}. Liên đoàn chưa cấm.${f(c, "rn_shoe_deal") ? " Nhưng hợp đồng của bạn ghi rõ: chỉ được đi giày của nhà tài trợ." : ""}`, [
    C("Mua, đi trong mọi giải", { money: cash(c, -0.05), counters: { rn_pb: 1 }, ...(f(c, "rn_shoe_deal") ? { income_mult: 0.85 } : {}) }, "Nhanh hơn, tốn tiền hoặc vỡ hợp đồng"),
    C("Giữ đôi giày cũ", { happy: -2, flags: ["rn_old_shoes"] }, "Không tốn gì, chậm hơn người khác"),
    C("Kiến nghị liên đoàn đặt chuẩn giày chung", { agency: 0.01, flags: ["rn_shoe_rule"], bw: -3 }, "Công bằng cho người nghèo, mất lòng nhà tài trợ", { tier: "awakened" })], 1)),
  daily(RN, "rn_weighin", [15, 34], 9, (c) => T("Chiếc cân trước cả đội", "Huấn luyện viên bắt bạn đứng lên cân trước mặt cả đội, rồi nói bớt hai ký thì mỗi vòng sẽ nhanh hơn ba giây.", [
    C("Ăn ít đi theo lời thầy", { health: -6, counters: { rn_pb: 1 }, flags: ["rn_underfed"] }, "Nhanh hơn một mùa, xương giòn đi"),
    C("Gặp chuyên gia dinh dưỡng, tự trả tiền", { money: cash(c, -0.04), health: 3, counters: { rn_pb: 1 } }, "Tốn tiền, cơ thể bền hơn"),
    C("Đề nghị bỏ lệ cân trước cả đội", { agency: 0.01, flags: ["rn_spoke_out"], rel: -1 }, "Bảo vệ cả đội, mất lòng thầy", { tier: "awakened" })], 1)),
  daily(RN, "rn_heel", [16, 38], 7, (c) => T("Gót chân đau buổi sáng", vary("rnh", c.age, ["Sáng nào bước xuống giường, gót chân trái của bạn cũng đau như dẫm phải đinh. Giải quan trọng còn năm tuần.", "Gân gót chân sưng to như quả trứng sau mỗi buổi chạy dốc."]), [
    C("Nghỉ sáu tuần, bỏ giải", { health: 5, counters: { rn_pb: -1 }, happy: -2 }, "Chân lành, mất một mùa"),
    C("Băng chặt, chạy tiếp", { gamble: { p: 0.5, win: { counters: { rn_pb: 1 }, log: "Bạn qua được giải. Cơn đau giảm dần sau mùa giải." }, lose: { health: -8, counters: { rn_pb: -2 }, log: "Gân đứt hẳn ở cây số thứ ba. Bạn nghỉ gần một năm." } } }, "Giữ giải, có thể mất cả năm")], 0)),
  daily(RN, "rn_knock", [16, 38], 9, (c) => T("Tiếng gõ cửa lúc sáu giờ sáng", `Bạn quên cập nhật nơi ở cho cơ quan kiểm tra doping. Nhân viên đến nhà lúc sáu giờ sáng, đúng hôm bạn về quê ${c.country === "VN" ? "dự đám giỗ" : "dự đám cưới người anh họ"}. Ba lần lỡ kiểm tra trong một năm là bị cấm thi đấu.`, [
    C("Nhận lỗi, đặt báo thức cập nhật mỗi tối", { bw: -3, flags: ["rn_missed_test"] }, "Mất một lần, thêm một việc phải nhớ mỗi ngày"),
    C("Kháng nghị, kèm ảnh và giấy xác nhận", { money: cash(c, -0.03), gamble: { p: 0.5, win: { log: "Lần lỡ kiểm tra được xóa khỏi hồ sơ." }, lose: { flags: ["rn_missed_test"], happy: -2, log: "Kháng nghị bị bác. Lỡ thêm hai lần nữa là bị cấm." } } }, "Có thể xóa vết, tốn tiền và thời gian")], 0)),
  daily(RN, "rn_shadow", [18, 40], 9, () => T("Cái bóng chạy theo", "Mấy tuần nay, một đứa trẻ chân đất chạy theo bạn suốt buổi tập sáng, giữ đúng nhịp của bạn được cả năm cây số.", [
    C("Mua giày, đưa nó đến gặp huấn luyện viên", { money: -0.03, flags: ["rn_found_kid"], rel: 3 }, "Tốn tiền, có thể đổi một đời người", { longterm: true }),
    C("Dừng lại hỏi chuyện nhà nó", { bw: -2, gamble: { p: 0.5, win: { rel: 3, flags: ["rn_found_kid"], log: "Bố mẹ nó đồng ý cho nó chạy cùng bạn mỗi sáng." }, lose: { log: "Hôm sau nó không đến nữa. Nhà nó đã dọn đi nơi khác." } } }, "Hỏng buổi tập, có thể chẳng đi đến đâu"),
    C("Chạy nhanh hơn cho nó tự bỏ cuộc", { counters: { rn_pb: 1 }, happy: -1 }, "Buổi tập tốt, một cơ hội trôi qua")], 1)),
  daily(RN, "rn_second", [16, 38], 8, (c, N) => { const r = role(c, "rival")!; return T("Người thắng bạn một phần mười giây", `Ba giải liền, ${N(r)} về trước bạn đúng một phần mười giây. Hai người tập trên cùng một con đường ven sông, chỉ khác giờ.`, [
    C("Rủ tập chung mỗi sáng", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "những buổi chạy chung ven sông" }, counters: { rn_pb: 1 }, log: "Cả hai nhanh lên. Năm ấy cả hai cùng có suất đi giải quốc tế." }, lose: { log: `${N(r)} cười rồi chạy tiếp, không trả lời.` } } }, "Cùng tiến, hoặc lộ hết bài", { tier: "awakened" }),
    C("Đổi giờ tập, lén chạy thêm buổi đêm", { health: -3, counters: { rn_pb: 1 }, flags: ["rn_obsessed"] }, "Nhanh hơn, ngủ ít hơn"),
    C("Kệ, chạy cuộc đua của mình", { happy: 2 }, "Nhẹ đầu, có thể mãi về nhì")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RN, "rn_heat", [18, 38], 8, () => T("Bốn mươi độ ở vạch xuất phát", "Ban tổ chức giữ giờ xuất phát mười hai giờ trưa cho kịp sóng truyền hình. Mặt đường nóng bốn mươi độ. Năm ngoái hai người ngất ở cây số thứ ba mươi.", [
    C("Chạy, giữ nhịp chậm", { health: -3, gamble: { p: 0.5, win: { money: 0.1, counters: { rn_pb: 1 }, log: "Một nửa số người bỏ cuộc. Bạn về thứ ba." }, lose: { health: -5, log: "Bạn được đưa lên xe cứu thương ở cây số hai mươi tám." } } }, "Tiền thưởng dễ hơn, cơ thể chịu trận"),
    C("Cùng các vận động viên khác đòi dời giờ chạy", { agency: 0.02, flags: ["rn_heat_protest"], gamble: { p: 0.45, win: { rel: 3, log: "Ban tổ chức dời giờ xuất phát sang sáu giờ sáng. Năm sau nó thành luật của giải." }, lose: { money: -0.05, log: "Họ giữ giờ cũ và gạch tên những người ký đơn." } } }, "Đổi luật cho mọi người, có thể bị gạch tên", { tier: "sovereign" }),
    C("Rút tên", { happy: -1, counters: { rn_pb: -1 } }, "An toàn, mất một giải")], 0)),

  /* ---------- gia đình ---------- */
  cross(RN, "rn_family", [18, 40], (c) => !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const p = (c.parent_sick ? role(c, "father") ?? role(c, "mother") : role(c, "mother") ?? role(c, "father"))!;
    if (c.parent_sick) return T("Tiền thưởng hay tiền thuốc", `${N(p)} ốm nặng, cần tiền chữa trị đúng mùa bạn chuẩn bị cho giải lớn. Một giải chạy đường phố ở nước bên cạnh trả thưởng đủ tiền thuốc, nhưng chạy nó sẽ phá hết lịch tập.`, [
      C("Chạy giải lấy tiền thuốc", { trust: { npc: p, delta: 0.3 }, counters: { rn_pb: -2 }, health: -2 }, "Có tiền chữa bệnh, lỡ giải lớn"),
      C("Giữ lịch tập, vay tiền chữa cho bố mẹ", { custom: "borrow:0.3", trust: { npc: p, delta: 0.15 } }, "Giữ cả hai, gánh nợ"),
      C("Giữ lịch tập, để anh chị em lo", { counters: { rn_pb: 1 }, memory: { npc: p, tag: "REFUSED_HELP", weight: -0.3, note: "mùa giải con không về khi ốm nặng" } }, "Giữ giấc mơ, một vết rạn trong nhà")], 0, { npc: p });
    return T("Người đứng ở cây số ba mươi", `Ở giải nào ${N(p)} cũng đứng ở cây số thứ ba mươi, chỗ khó nhất, cầm sẵn chai nước. Năm nay chân ${N(p)} yếu đi, đứng lâu không được nữa.`, [
      C("Đặt một chiếc ghế cho bố mẹ ở vạch đích", { trust: { npc: p, delta: 0.2 }, flags: ["rn_finish_chair"], money: -0.02 }, "Bố mẹ vẫn đến, bạn mất điểm tựa giữa đường"),
      C("Chạy một giải ngay ở quê cho bố mẹ xem", { trust: { npc: p, delta: 0.3 }, counters: { rn_pb: -1 }, happy: 3 }, "Một ngày đẹp, lỡ một giải có thưởng"),
      C("Bảo bố mẹ ở nhà xem truyền hình", { trust: { npc: p, delta: -0.1 }, counters: { rn_pb: 1 } }, "Tập trung chạy, thiếu một gương mặt quen")], 0, { npc: p });
  }),

  /* ================================================================ TUYỂN THỦ THỂ THAO ĐIỆN TỬ (es_) */
  /* Sự nghiệp ngắn: nhịp truyện cách nhau 1–4 năm. Bộ đếm es_fame: tên tuổi; es_wrist: cổ tay ghi nợ.
     Cờ đọc lại: es_house, es_student, es_carry, es_org_contract, es_player_share, es_fixed, es_cleared, es_champion. */

  /* ---------- năng khiếu ---------- */
  talent(ES, "es_t_ladder", [10, 15], () => true, (c) => T("Năm trăm người giỏi nhất", `${c.poor_country ? `Bạn chơi ở quán net đầu ngõ, mỗi giờ bằng ${c.country === "VN" ? "một ổ bánh mì" : "tiền một bữa sáng"}.` : "Bạn chơi trên chiếc máy tính cũ anh họ để lại."} Tài khoản của bạn lọt vào top năm trăm cả máy chủ, và mấy người lớn bắt đầu đứng sau lưng xem bạn chơi.`, [
    C("Xin bố mẹ một bộ máy tử tế", { money: -0.05, flags: [talentFlag(ES)], counters: { talents_seen: 1 }, know: -2 }, "Tốn tiền nhà, mở một con đường lạ"),
    C(c.poor_country ? "Để dành tiền ăn sáng ra quán chơi" : "Thức khuya chơi lén sau giờ ngủ", { flags: [talentFlag(ES)], counters: { talents_seen: 1 }, ...(c.poor_country ? { health: -3 } : { bw: -3 }) }, "Không tốn tiền nhà, cơ thể trả giá"),
    C("Chơi ít lại, lo học", { counters: { talents_seen: 1 }, know: 3, happy: -2 }, "Học tốt hơn, bỏ một thứ mình giỏi")], 2)),

  /* ---------- cơ hội bước vào ---------- */
  door(ES, "es_d_house", [15, 22], () => true, (c) => T("Lời mời vào nhà chung", `Một đội thể thao điện tử nhắn tin: họ thấy tên bạn trên bảng xếp hạng, mời đến ở "nhà chung" của đội một tháng thử việc. Bao ăn ở, chưa có lương, tập mười hai tiếng mỗi ngày.${c.age < 18 ? " Bạn chưa đủ mười tám tuổi: bố mẹ phải ký giấy, và bạn phải nghỉ học một học kỳ." : ""}`, [
    C(c.age < 18 ? "Đi, xin nghỉ học một học kỳ" : "Đi, bỏ việc đang làm", { ...become(ES), counters: { doors_seen: 1 }, flags: ["es_house"], ...(c.age < 18 ? { know: -4 } : { money: -0.1 }) }, "Vào nghề ngay, mất một chỗ dựa"),
    C("Chỉ đánh giải trực tuyến từ nhà", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.3, win: { ...become(ES), log: "Đội của bạn thắng một giải trực tuyến. Một tổ chức gọi cả năm người." }, lose: { happy: -2, log: "Đội tan sau hai giải. Mỗi người một múi giờ." } } }, "Giữ chỗ dựa, cơ hội mỏng"),
    C("Không đi", { counters: { doors_seen: 1 }, happy: -1 }, "Yên ổn, thắc mắc mãi chuyện nếu như")], 2)),
  door(ES, "es_d_campus", [17, 24], () => true, (c) => T("Học bổng cho người chơi game", `Một trường đại học lập đội thể thao điện tử, trao học bổng cho người chơi giỏi, đổi lại phải giữ điểm trung bình khá và đại diện trường ở các giải sinh viên.${c.has_degree ? " Bạn đã có một tấm bằng, đây sẽ là tấm thứ hai." : ""}`, [
    C("Nhận học bổng, vừa học vừa thi đấu", { ...become(ES), counters: { doors_seen: 1 }, flags: ["es_student"], bw: -4, know: 2 }, "Không toàn lực, có tấm bằng làm lưới đỡ"),
    C("Từ chối, chơi cho vui", { counters: { doors_seen: 1 }, happy: 1 }, "Nhẹ người, bỏ qua một suất học")], 1)),
  door(ES, "es_d_mall", [14, 20], () => true, (c) => T("Giải đấu ở trung tâm thương mại", `Một giải đấu nghiệp dư ở trung tâm thương mại, giải nhất bằng ${c.poor_country ? "nửa năm lương công nhân" : "hai tháng lương"}. Đội của mấy người bạn trên mạng thiếu một người, và giải rơi đúng tuần ${c.age < 18 ? "thi học kỳ" : "bạn phải làm ca"}.`, [
    C(c.age < 18 ? "Đi đấu, bỏ một môn thi" : "Đi đấu, xin nghỉ ca", { counters: { doors_seen: 1 }, ...(c.age < 18 ? { know: -3 } : { money: -0.03 }), gamble: { p: f(c, talentFlag(ES)) ? 0.5 : 0.3, win: { ...become(ES), log: "Đội bạn vô địch. Một tổ chức chuyên nghiệp xin liên lạc của cả năm người." }, lose: { happy: -2, log: c.age < 18 ? "Đội bạn thua ở bán kết. Bạn phải thi lại môn ấy vào mùa hè." : "Đội bạn thua ở bán kết. Bạn bị trừ một ngày lương." } } }, "Một cuối tuần đổi lấy một cánh cửa"),
    C("Ở nhà, lo việc trước mắt", { counters: { doors_seen: 1 }, know: 1 }, "Chắc chắn, bỏ lỡ một cuộc chơi")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(ES, 1, 1, (c) => T("Vị trí không ai muốn chơi", `Tuần đầu ${f(c, "es_house") ? "ở nhà chung" : "với đội"}, huấn luyện viên nói đội đã có người chơi vị trí của bạn. Đội đang thiếu một người hỗ trợ, vị trí ít được lên màn hình nhất. Bạn chưa từng chơi vị trí ấy quá mười trận.`, [
    C("Đổi sang vị trí hỗ trợ", { counters: step(c, ES, { es_team: 1 }), flags: ["es_support"], bw: -4, rel: 2 }, "Có suất đá chính, ít ai biết tên bạn"),
    C("Giữ vị trí cũ, chờ ở ghế dự bị", { counters: step(c, ES), flags: ["es_carry"], gamble: { p: 0.45, win: { counters: { es_fame: 2 }, log: "Người đá chính bị đau cổ tay. Bạn vào thay và tỏa sáng ngay trận đầu." }, lose: { happy: -3, log: "Cả mùa giải bạn ngồi sau màn hình của người khác." } } }, "Giữ thế mạnh, có thể ngồi ngoài cả mùa")], 0)),
  beat(ES, 2, 2, (c) => T("Hợp đồng ba năm với tổ chức", `Một tổ chức lớn mua suất thi đấu của đội. Họ đưa bạn hợp đồng ba năm: lương cố định, nhưng tiền thưởng giải và tiền quảng cáo trên kênh cá nhân đều thuộc về họ; phá hợp đồng phải đền gấp năm.${c.age < 18 ? " Bạn chưa đủ tuổi, bố mẹ phải ký thay." : ""}${f(c, "es_student") ? " Bạn sẽ phải bảo lưu việc học." : ""}`, [
    C("Ký", { counters: step(c, ES), income_mult: 1.7, flags: ["es_org_contract"] }, "Lương đều, mất quyền với tên tuổi của mình"),
    C("Ở ngoài, tự phát trực tiếp và đánh giải mở", { counters: step(c, ES, { es_fame: 1 }), income_mult: 1.1, bw: -5, flags: ["es_free_agent"] }, "Tiền bấp bênh, giữ được kênh của mình"),
    C("Rủ cả đội cùng đòi chia tiền thưởng", { counters: step(c, ES), agency: 0.02, gamble: { p: 0.4, win: { income_mult: 1.5, flags: ["es_org_contract", "es_player_share"], log: "Tổ chức đồng ý chia bốn phần tiền thưởng cho người chơi. Các đội khác bắt đầu đòi theo." }, lose: { income_mult: 1.0, flags: ["es_free_agent"], log: "Tổ chức ký với năm người khác. Tên bạn nằm trong một danh sách không ai nói ra." } } }, "Cả đội có phần, hoặc cả đội mất suất", { tier: "sovereign" })], 0)),
  beat(ES, 3, 2, (c) => {
    if (f(c, "es_fixed")) return T("Điện thoại của cả đội", "Một tài khoản ẩn danh tung bảng tỉ lệ cược bất thường của trận đấu năm ấy. Ban tổ chức yêu cầu cả đội nộp điện thoại để kiểm tra trong bốn mươi tám giờ. Bạn biết trong máy mình có gì.", [
      C("Tự đến khai trước", { counters: step(c, ES), ...leave(ES), flags: ["es_banned"], agency: 0.02, happy: -5 }, "Mất nghề, được giảm án, hết phải giấu"),
      C("Xóa tin nhắn, nộp máy", { counters: step(c, ES), gamble: { p: 0.35, win: { counters: { es_fame: -1 }, log: "Không tìm thấy gì. Nhưng một đồng đội nhìn bạn rất lâu khi nghe tin." }, lose: { ...leave(ES), close_doors: ["clean_record"], flags: ["es_banned"], log: "Dữ liệu được khôi phục. Bạn bị cấm thi đấu vĩnh viễn và bị khởi tố." } } }, "Có thể thoát, có thể thêm tội che giấu"),
      C("Khai cả đường dây đứng sau", { counters: step(c, ES), flags: ["es_witness"], gamble: { p: 0.5, win: { income_mult: 0.7, log: "Đường dây bị triệt phá. Bạn bị cấm một năm rồi được thi đấu lại." }, lose: { ...leave(ES), log: "Bạn vẫn bị cấm, nhưng ba giải đấu khác thoát khỏi đường dây ấy." } } }, "Làm sạch nghề, có thể vẫn mất nghề", { tier: "sovereign" })], 0);
    return T("Lời tố gian lận", `Sau một pha xử lý không tưởng${f(c, "es_carry") ? " ở vị trí bạn giữ bằng mọi giá" : ""}, hàng nghìn người tố bạn dùng phần mềm gian lận. Ban tổ chức đòi kiểm tra máy của bạn trong bốn mươi tám giờ. Bạn trong sạch, nhưng trong máy có những cuộc trò chuyện riêng của cả đội về chuyện lương.${f(c, "es_org_contract") ? " Tổ chức chủ quản muốn bạn im lặng chờ." : ""}`, [
      C("Nộp máy, chấp nhận lộ chuyện riêng", { counters: step(c, ES, { es_fame: 1 }), rel: -3, flags: ["es_cleared"] }, "Rửa sạch tên, đồng đội mất lòng"),
      C("Từ chối, chịu treo giò chờ điều tra", { counters: step(c, ES, { es_fame: -2 }), income_mult: 0.8, happy: -4 }, "Giữ bí mật cho đội, mang tiếng mãi"),
      C("Chơi trực tiếp, có camera quay cả bàn tay", { counters: step(c, ES), agency: 0.02, gamble: { p: 0.55, win: { counters: { es_fame: 3 }, flags: ["es_cleared"], log: "Ba trăm nghìn người xem bạn lặp lại pha xử lý ấy, lần này có camera quay cả bàn tay." }, lose: { counters: { es_fame: -1 }, log: "Bạn run tay, không lặp lại được. Người ta nói như thế còn đáng ngờ hơn." } } }, "Tự chứng minh theo cách của mình, có thể hỏng", { tier: "sovereign" }),
      C("Giải nghệ, chuyển sang làm streamer", { counters: step(c, ES), unflags: [life(ES)], custom: "become:streamer", happy: 2 }, "Rời sân khấu thi đấu, khỏi phải chứng minh gì")], 0);
  }),
  beat(ES, 4, 3, (c) => {
    if (cnt(c, "es_fame") >= 2 || f(c, "es_cleared")) return T("Chung kết thế giới", `Đội bạn vào chung kết thế giới, sân vận động hai mươi nghìn chỗ ở nước ngoài.${f(c, "es_player_share") ? " Nhờ hợp đồng chia thưởng, mỗi người sẽ có phần nếu thắng." : ""} Đêm trước trận, một tổ chức nước ngoài đề nghị mua bạn với giá kỷ lục, công bố ngay sau chung kết.`, [
      C("Ký trước trận, giấu cả đội", { counters: step(c, ES), income_mult: 2.0, flags: ["es_transfer"], gamble: { p: 0.4, win: { money: cash(c, 0.5), log: "Đội thắng. Hai ngày sau tin bạn ra đi được công bố, không ai trong đội gọi lại." }, lose: { rel: -4, log: "Đội thua. Người ta nói bạn đã bỏ đội từ đêm hôm trước." } } }, "Giá kỷ lục, mất đồng đội"),
      C("Từ chối, chơi trọn trận cho đội", { counters: step(c, ES), rel: 3, gamble: { p: 0.45, win: { flags: ["es_champion"], money: cash(c, 0.8), counters: { es_fame: 2 }, log: "Đội bạn vô địch thế giới. Bạn khóc trên sân khấu trước hai mươi nghìn người." }, lose: { happy: -4, log: "Đội thua ba ván sát nút. Lời đề nghị kia không quay lại." } } }, "Giữ đội, có thể mất cả hai"),
      C("Kể với cả đội trước khi quyết", { counters: step(c, ES), flags: ["es_open_book"], agency: 0.02, rel: 4, gamble: { p: 0.4, win: { flags: ["es_champion"], money: cash(c, 0.5), log: "Cả đội cười, rồi chơi trận hay nhất đời. Đội vô địch, và bạn ra đi với lời chúc." }, lose: { log: "Đội thua. Nhưng đêm ấy cả năm người vẫn ngồi ăn với nhau đến sáng." } } }, "Thẳng thắn, đặt cả đội vào thế khó", { tier: "sovereign" })], 1);
    return T("Tuổi già ở tuổi hai mươi", `Phản xạ của bạn chậm hơn ba năm trước vài phần trăm giây, đủ để thua những đứa mười bảy tuổi. Tổ chức đưa bạn xuống đội hai.${cnt(c, "es_wrist") >= 2 ? " Cổ tay phải vẫn tê mỗi sáng." : ""}`, [
      C("Chuyển sang làm huấn luyện viên chiến thuật", { counters: step(c, ES), unflags: [life(ES)], custom: "become:coach", know: 3 }, "Ở lại với nghề, rời màn hình thi đấu"),
      C("Ở lại đội hai, tập gấp đôi", { counters: step(c, ES), health: -4, gamble: { p: 0.3, win: { counters: { es_fame: 2 }, log: "Nửa mùa sau, bạn được gọi lên lại đội một." }, lose: { happy: -4, log: "Hết mùa, hợp đồng của bạn không được gia hạn." } } }, "Còn cơ hội, cơ thể và tinh thần trả giá"),
      C(f(c, "es_student") ? "Quay về học nốt tấm bằng" : "Đi học lại từ đầu", { counters: step(c, ES), ...leave(ES), know: 6, flags: ["ex_esports"] }, "Rời nghề, mua lại một tương lai khác")], 0);
  }),
  beat(ES, 5, 4, (c) => T("Tài khoản thời thi đấu", `Bạn đăng nhập lại tài khoản cũ. Tên bạn vẫn nằm trong bảng vinh danh ${f(c, "es_champion") ? "của một mùa vô địch thế giới" : "của một mùa giải khu vực"}. Một nhóm phụ huynh nhờ bạn nói chuyện với con họ, những đứa đang muốn bỏ học để thi đấu.`, [
    C("Nói thật, cả những năm tệ nhất", { counters: step(c, ES), flags: ["es_honest_talk"], rel: 4, happy: -1 }, "Có thể dập tắt vài giấc mơ, cứu vài đứa trẻ"),
    C("Mở học viện có cả giờ học văn hóa", { counters: step(c, ES), money: -0.4, agency: 0.03, flags: ["es_academy"] }, "Vốn lớn, đặt luật mới cho nghề", { tier: "sovereign" }),
    C("Từ chối, xóa tài khoản", { counters: step(c, ES), happy: 2, flags: ["es_logged_out"] }, "Nhẹ người, khép một quãng đời")], 0), (c) => c.age >= 26),

  /* ---------- chuyện thường ngày ---------- */
  daily(ES, "es_hours", [15, 30], 6, (c) => T("Mười bốn tiếng mỗi ngày", vary("esh", c.age, ["Quản lý thu điện thoại của cả đội từ chín giờ sáng đến hai giờ đêm. Ngày nghỉ duy nhất trong tháng vừa bị hủy vì có lịch đấu tập với đội nước ngoài.", "Mùa giải mới, lịch tập kéo đến bốn giờ sáng. Bạn ăn mì gói trước màn hình ba bữa một ngày."]), [
    C("Theo lịch, không kêu ca", { counters: { es_fame: 1 }, health: -4, rel: -2 }, "Giỏi lên, cơ thể và người thân bị bỏ quên"),
    C("Cùng cả đội đòi một ngày nghỉ mỗi tuần", { agency: 0.02, flags: ["es_rest_day"], gamble: { p: 0.5, win: { health: 3, log: "Quản lý đồng ý. Thành tích của đội không giảm, còn tốt lên." }, lose: { income_mult: 0.95, log: "Quản lý ghi tên bạn vào sổ \"thiếu chuyên nghiệp\"." } } }, "Có ngày nghỉ cho cả đội, có thể bị ghi tên", { tier: "sovereign" }),
    C("Trốn ra ngoài đi bộ mỗi đêm", { health: 2, counters: { es_fame: -1 } }, "Giữ đầu óc, tập ít hơn đồng đội")], 0)),
  daily(ES, "es_wrist", [15, 30], 7, (c) => T("Cổ tay phải tê dần", vary("esw", c.age, ["Cổ tay phải của bạn tê từ khuỷu xuống ngón út sau mỗi buổi tập. Bác sĩ nói viêm gân, nên nghỉ sáu tuần.", "Ngón tay bạn run nhẹ mỗi sáng. Bác sĩ hỏi bạn ngồi trước màn hình mấy tiếng một ngày."]), [
    C("Nghỉ sáu tuần, tập vật lý trị liệu", { health: 5, counters: { es_fame: -1 }, money: cash(c, -0.04) }, "Tay lành, mất suất đá chính một thời gian"),
    C("Băng cổ tay, chơi tiếp", { counters: { es_wrist: 2, es_fame: 1 }, health: -4 }, "Giữ suất, cổ tay ghi nợ")], 0)),
  daily(ES, "es_hotmic", [15, 30], 9, () => T("Câu nói lọt micro", "Đang phát trực tiếp, bạn buột miệng chửi một đồng đội bằng một câu rất nặng. Đoạn mười giây ấy có hai triệu lượt xem trước khi bạn ngủ dậy.", [
    C("Quay video xin lỗi, gặp riêng đồng đội", { counters: { es_fame: -1 }, rel: 2, flags: ["es_apologized"] }, "Mất mặt công khai, giữ lại một người bạn"),
    C("Im lặng, chờ mạng quên", { counters: { es_fame: -1 }, rel: -3 }, "Đỡ ngượng, đồng đội không quên"),
    C("Đổ cho áp lực, đăng ảnh lịch tập của đội", { counters: { es_fame: 1 }, gamble: { p: 0.4, win: { log: "Người xem quay sang chỉ trích cách tổ chức vắt kiệt tuyển thủ." }, lose: { rel: -3, log: "Người ta bảo bạn dùng chuyện ấy để chạy tội." } } }, "Có thể đổi câu chuyện, có thể bị ghét hơn")], 0)),
  daily(ES, "es_offer", [16, 30], 10, (c) => T("Tin nhắn từ tài khoản lạ", "Một tài khoản không ảnh đại diện nhắn: chỉ cần đội bạn thua ván đầu của trận tối thứ năm, cả trận thắng hay thua thì kệ. Số tiền họ đưa bằng nửa năm lương của bạn.", [
    C("Nhận lời", { money: cash(c, 0.5), flags: ["es_fixed"], secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [1, 6], note: "nhận tiền để thua một ván đấu" } }, "Nửa năm lương, một bí mật trong điện thoại"),
    C("Chặn, chụp màn hình gửi ban tổ chức", { flags: ["es_reported"], counters: { honest: 1 }, gamble: { p: 0.7, win: { log: "Ban tổ chức cảm ơn và khóa tài khoản kia." }, lose: { bw: -5, log: "Ba tài khoản khác bắt đầu nhắn tin đe dọa bạn." } } }, "Sạch sẽ, có thể bị đe dọa"),
    C("Chặn, không nói với ai", { happy: -1, counters: { honest: 1 } }, "Yên chuyện, đường dây sẽ tìm người khác")], 1)),
  daily(ES, "es_visa", [16, 30], 9, (c) => T("Thị thực bị từ chối", `Giải quốc tế còn mười ngày, đại sứ quán từ chối thị thực của bạn vì "không chứng minh được nghề nghiệp ổn định".${c.poor_country ? " Ba trong năm người của đội cùng bị từ chối." : ""}`, [
    C("Để người dự bị đi thay", { happy: -4, counters: { es_fame: -1 } }, "Đội vẫn thi đấu, bạn ngồi xem qua màn hình"),
    C("Bay sang nước thứ ba nộp lại hồ sơ", { money: cash(c, -0.1), bw: -4, gamble: { p: 0.5, win: { counters: { es_fame: 1 }, log: "Thị thực đến kịp hai ngày trước giải." }, lose: { happy: -2, log: "Lần thứ hai cũng bị từ chối. Bạn mất cả tiền vé." } } }, "Tốn tiền, còn một cơ hội"),
    C("Cùng liên đoàn đòi công nhận tuyển thủ là một nghề", { agency: 0.02, flags: ["es_recognized"], gamble: { p: 0.35, win: { log: "Một năm sau, tuyển thủ được xin thị thực vận động viên." }, lose: { bw: -3, log: "Thư gửi đi không ai trả lời." } } }, "Mở đường cho người sau, không kịp giải này", { tier: "sovereign" })], 0)),
  daily(ES, "es_channel", [15, 30], 7, (c) => T("Kênh phát trực tiếp riêng", vary("esc", c.age, ["Kênh phát trực tiếp của bạn có mười nghìn người theo dõi. Mỗi tối phát sáu tiếng thì tiền ủng hộ nhiều hơn tiền lương.", "Một nền tảng phát trực tiếp muốn ký độc quyền với bạn, đổi lại phải phát đủ một trăm giờ mỗi tháng."]), [
    C("Phát mỗi đêm sau giờ tập", { money: cash(c, 0.1), counters: { es_fame: 1 }, bw: -5, health: -2 }, "Thêm tiền và người hâm mộ, cạn sức"),
    C("Chỉ phát cuối tuần", { flags: ["es_weekend_streams"], happy: 1 }, "Giữ sức cho thi đấu, bỏ lỡ một nguồn tiền")], 0)),
  daily(ES, "es_patch", [15, 30], 7, (c) => T("Bản cập nhật mới", vary("esp", c.age, ["Nhà phát hành tung bản cập nhật, nhân vật sở trường của bạn bị làm yếu hẳn. Sáu tuần nữa là vòng loại.", "Bản cập nhật đổi bản đồ, mọi chiến thuật đội bạn tập cả năm thành vô dụng."]), [
    C("Thức trắng học lối chơi mới", { bw: -6, counters: { es_fame: 1 }, health: -2 }, "Theo kịp, mất ngủ"),
    C("Giữ lối cũ, chờ bản sau", { counters: { es_fame: -1 }, flags: ["es_old_style"] }, "Đỡ mệt, tụt hạng"),
    C("Viết phân tích công khai gửi nhà phát hành", { flags: ["es_analyst"], gamble: { p: 0.4, win: { counters: { es_fame: 1 }, know: 2, log: "Nhà phát hành sửa lại bản cập nhật. Bài phân tích của bạn được cả cộng đồng chia sẻ." }, lose: { log: "Không ai trả lời. Bạn mất hai tuần tập." } } }, "Có thể đổi luật trò chơi, mất thời gian tập", { tier: "awakened" })], 0)),
  daily(ES, "es_rookie", [17, 30], 9, () => T("Đồng đội mười sáu tuổi", "Đội vừa nhận một cậu mười sáu tuổi chơi rất giỏi. Đêm nào bạn cũng nghe cậu ấy gọi điện về nhà rồi khóc. Quản lý nói \"ai cũng phải qua giai đoạn đó\".", [
    C("Đòi quản lý cho cậu ấy giờ ngủ và giờ học", { agency: 0.01, flags: ["es_stood_up"], gamble: { p: 0.5, win: { rel: 3, log: "Đội thuê một gia sư và ấn định giờ tắt máy cho người dưới mười tám tuổi." }, lose: { income_mult: 0.95, log: "Quản lý bảo bạn lo việc của mình đi." } } }, "Bảo vệ một đứa trẻ, mất lòng quản lý", { tier: "sovereign" }),
    C("Kèm cậu ấy, chia ca dọn dẹp giúp", { bw: -3, rel: 3, flags: ["es_big_brother"] }, "Mất thời gian của mình, có người nhớ ơn"),
    C("Kệ, ai cũng phải tự lớn", { counters: { es_fame: 1 }, rel: -1 }, "Tập trung cho mình, nhìn đi chỗ khác")], 1)),
  daily(ES, "es_sunset", [17, 30], 10, () => T("Trò chơi hết thời", "Nhà phát hành tuyên bố ngừng tổ chức giải chuyên nghiệp cho trò chơi bạn chơi từ năm mười hai tuổi. Người chơi đang bỏ sang một trò mới.", [
    C("Chuyển sang trò mới, bắt đầu từ hạng thấp", { bw: -6, counters: { es_fame: -1 }, gamble: { p: 0.4, win: { counters: { es_fame: 2 }, log: "Sau một năm, bạn lại có tên trong bảng xếp hạng." }, lose: { happy: -2, log: "Lũ mười lăm tuổi học nhanh hơn bạn." } } }, "Còn đường thi đấu, làm lại từ đầu"),
    C("Ở lại, tổ chức giải cộng đồng", { flags: ["es_community_cup"], income_mult: 0.8, rel: 3 }, "Giữ một cộng đồng sống, thu nhập giảm", { tier: "awakened" }),
    C("Chuyển hẳn sang làm streamer", { unflags: [life(ES)], custom: "become:streamer", happy: 1 }, "Đi tiếp bằng cái tên của mình, rời sân thi đấu")], 0)),

  /* ---------- gia đình ---------- */
  cross(ES, "es_family", [15, 45], (c) => !!role(c, "mother") || !!role(c, "father") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn làm tuyển thủ`, `${N(k)} xin nghỉ học một năm để vào nhà chung của một đội trẻ, giống bạn ngày trước. Bạn biết rõ nhà chung ấy trông thế nào lúc hai giờ đêm.`, [
      C("Cho đi, kể trước mọi điều tệ nhất", { trust: { npc: k, delta: 0.2 }, flags: ["es_kid_pro"] }, "Con được thử, bạn thức trắng vì lo"),
      C("Cấm, bắt học xong đã", { trust: { npc: k, delta: -0.25 } }, "Con an toàn, con thấy bạn đạo đức giả"),
      C("Hứa tự kèm con một năm, giữ giờ học", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "kèm con tập một năm mà không bỏ học", years: 1 } }, "Tốn thời gian của bạn, con có người dẫn đường", { tier: "awakened" })], 2, { npc: k });
    return T("Tờ thông báo tuyển dụng trên bàn", `${N(p!)} vẫn nói với họ hàng rằng bạn "chơi điện tử cả ngày", và tháng nào cũng để trên bàn ${c.country === "VN" ? "một tờ thông báo thi công chức" : "một tờ tin tuyển dụng của công ty ổn định"}.`, [
      C("Đưa bố mẹ xem hợp đồng và bảng lương", { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.25 }, log: `${N(p!)} đọc hai lần, rồi đem khoe với cả xóm.` }, lose: { trust: { npc: p!, delta: -0.1 }, log: `${N(p!)} bảo: "Được mấy năm?"` } } }, "Có thể được hiểu, có thể bị hỏi khó hơn"),
      C("Hứa học song song một tấm bằng từ xa", { trust: { npc: p!, delta: 0.15 }, bw: -3, promise: { to: p!, what: "học xong một tấm bằng từ xa", years: 4 } }, "Bố mẹ yên tâm, thêm một gánh nặng", { tier: "awakened" }),
      C("Thôi, không giải thích nữa", { happy: -2, flags: ["es_silent_home"] }, "Đỡ cãi nhau, xa nhau thêm")], 0, { npc: p! });
  }),
];
