/**
 * Gói THỂ THAO B: huấn luyện viên · trọng tài · kỳ thủ cờ vua · vận động viên leo núi. Đọc kèm docs/content-guide.md.
 * Mỗi con đường: năng khiếu · cơ hội · 5 nhịp truyện · chuyện thường ngày · chuyện gia đình.
 * Bộ đếm riêng (các nhịp sau đọc lại để cao trào khác đi theo những gì người chơi đã chọn):
 *   hlv_wins / hlv_heart   thành tích / tấm lòng của huấn luyện viên
 *   ttr_rep / ttr_heat     uy tín / sức ép dư luận của trọng tài
 *   kyt_elo / kyt_burn     sức cờ / độ kiệt sức của kỳ thủ
 *   lnu_peaks / lnu_risk   số đỉnh / độ liều của người leo núi
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

const CO = "coach";
const RF = "referee";
const CH = "chess";
const CL = "climber";
/** Nhịp truyện của các nghề người lớn: không bao giờ bắn trước 18 tuổi. */
const adult = (c: FactContext): boolean => c.age >= 18;
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;

export const PACK_SPORT_B: Storylet[] = [
  /* ============================ HUẤN LUYỆN VIÊN (hlv_) ============================ */

  /* ---------- năng khiếu ---------- */
  talent(CO, "hlv_t_captain", [8, 14], () => true, () => T("Đứa chia đội", "Giờ ra chơi nào bọn trẻ cũng cãi nhau chuyện chia đội đến hết giờ. Chỉ khi bạn chia thì không ai cãi: bạn luôn xếp đứa chạy chậm nhất đứng cạnh đứa giỏi nhất. Thầy thể dục đứng xem hết một buổi rồi gọi bạn lại.", [
    C("Nhận làm đội trưởng đội bóng của trường", { flags: [talentFlag(CO)], counters: { talents_seen: 1 }, bw: -2, happy: 2 }, "Bớt giờ học, học cách dẫn người"),
    C("Chỉ muốn chơi, không lo cho ai", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CO, "hlv_d_knee", [25, 40], (c) => f(c, "athlete") || f(c, "pro_athlete") || f(c, "life_footballer") || f(c, "life_boxer") || f(c, "life_runner"), () => T("Đầu gối không lành", "Lần chấn thương thứ ba, bác sĩ nói thẳng: chạy bộ thì được, thi đấu thì không. Câu lạc bộ cũ mời bạn về dẫn lứa mười lăm tuổi, lương bằng một phần ba ngày còn thi đấu. Phòng thay đồ của bọn trẻ vẫn nồng mùi dầu xoa bóp như hồi bạn mười lăm.", [
    C("Nhận, bắt đầu từ đội trẻ", { ...become(CO), unflags: ["life_footballer", "life_boxer", "life_runner"], counters: { doors_seen: 1 }, flags: ["ex_player"], happy: -2 }, "Lương thấp, một nghề dài hơi"),
    C("Chữa thêm một năm, mong trở lại", { counters: { doors_seen: 1 }, money: -0.25, gamble: { p: 0.3, win: { health: 4, happy: 5, log: "Bạn trở lại thi đấu thêm hai mùa, rồi tự giải nghệ." }, lose: { happy: -6, log: "Đầu gối sưng lại sau buổi tập thứ ba. Lời mời kia đã có người nhận." } } }, "Tốn tiền chữa, cơ hội mong manh"),
    C("Thôi, rời hẳn thể thao", { counters: { doors_seen: 1 }, flags: ["left_sport"], happy: -1 })], 0)),
  door(CO, "hlv_d_course", [25, 50], () => true, (c) => T("Lớp chứng chỉ huấn luyện", `${c.country === "VN" ? "Trung tâm thể dục thể thao của quận" : "Trung tâm thể thao cộng đồng gần nhà"} tuyển người dẫn lớp năng khiếu cho trẻ em. Muốn nhận, bạn phải qua khóa chứng chỉ ba tháng, học ban ngày, không lương. Bài sát hạch cuối khóa là một buổi tập trước hai mươi đứa trẻ thật.`, [
    C("Nghỉ việc, đi học cả ngày", { ...become(CO), counters: { doors_seen: 1 }, money: -0.2, know: 4 }, "Mất ba tháng lương, có nghề mới"),
    C("Học bù buổi tối, giữ việc", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.4, win: { ...become(CO), log: "Bạn qua sát hạch. Bọn trẻ vỗ tay khi bạn thổi còi hết giờ." }, lose: { happy: -3, log: "Sang tháng thứ hai, bạn ngủ gật trong giờ lý thuyết rồi bỏ dở." } } }, "Không mất việc, dễ đuối sức"),
    C("Thôi", { counters: { doors_seen: 1 } })], 1)),
  door(CO, "hlv_d_field", [25, 55], () => true, (c) => T(c.poor_country ? "Sân đất sau chợ" : "Sân bê tông của khu nhà ở xã hội", `${c.poor_country ? "Chiều nào cũng có ba chục đứa trẻ đá bóng chân đất trên bãi đất sau chợ, khung thành là hai viên gạch." : "Chiều nào cũng có ba chục đứa trẻ đá bóng trên sân bê tông của khu nhà ở xã hội, đến khi đèn đường bật."} Một tổ chức từ thiện tìm người dạy chúng bốn buổi một tuần, phụ cấp ít ỏi. Họ nói mục tiêu không phải là thắng, mà là giữ bọn trẻ khỏi đường phố.`, [
    C("Nhận, dạy cả tuần", { ...become(CO), counters: { doors_seen: 1, kind: 1 }, flags: ["street_team"], income_mult: 0.8 }, "Thu nhập thấp, có một đội của riêng mình"),
    C("Chỉ dạy cuối tuần, giữ việc chính", { counters: { doors_seen: 1, kind: 1 }, happy: 3, bw: -2 }, "Giúp được ít, không đổi đời"),
    C("Từ chối", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(CO, 1, 1, (c) => T("Danh sách của người đi trước", "Sáu giờ sáng, hai mươi hai đứa trẻ, chín quả bóng, một tấm lưới rách. Huấn luyện viên cũ để lại tờ danh sách xếp hạng cả đội, năm cái tên cuối bị gạch kèm hai chữ “cho nghỉ”. Ban quản lý muốn có thành tích ngay mùa này.", [
    C("Giữ cả hai mươi hai đứa", { counters: step(c, CO, { hlv_heart: 1 }), flags: ["keeps_everyone"], bw: -4, happy: 3 }, "Mệt hơn, thắng chậm hơn, không bỏ ai"),
    C("Làm theo danh sách, dồn sức cho đứa giỏi", { counters: step(c, CO, { hlv_wins: 1 }), flags: ["picks_elite"], income_mult: 1.1 }, "Thắng sớm, có đứa bị bỏ lại"),
    C("Xé danh sách, cho cả đội đá thử lại từ đầu", { counters: step(c, CO), gamble: { p: 0.5, win: { flags: ["keeps_everyone"], counters: { hlv_wins: 1 }, log: "Một trong năm cái tên bị gạch thành đứa ghi nhiều bàn nhất mùa." }, lose: { happy: -2, log: "Ba tuần đá thử, phụ huynh phàn nàn rằng bạn bày trò." } } }, "Mất vài tuần, có thể tìm ra viên ngọc", { tier: "awakened" })], 0), adult),
  beat(CO, 2, 3, (c) => T("Em số 7", `Đội của bạn có một đứa mười bốn tuổi mặc áo số 7, chạm bóng tự nhiên như thở.${n(c, "hlv_wins") >= 1 ? " Mùa này đội vô địch khu vực, các tuyển trạch viên bắt đầu đến xem." : " Đội thua chung kết khu vực, nhưng các tuyển trạch viên vẫn ở lại xem em."} Một học viện lớn đưa gia đình em bản hợp đồng bảy năm, và lặng lẽ hứa với bạn một năm lương “tiền giới thiệu” nếu gia đình ký.`, [
    C("Nhận tiền, khuyên gia đình ký", { counters: step(c, CO, { hlv_wins: 1 }), money: 0.8, flags: ["sold_prodigy"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.3, fuse_years: [4, 12], note: "nhận tiền môi giới để học trò ký hợp đồng bảy năm" } }, "Tiền lớn, một gia đình đặt cả lòng tin vào bạn"),
    C("Khuyên gia đình đợi, giữ em lại đội", { counters: step(c, CO, { hlv_heart: 1 }), flags: ["kept_prodigy"], happy: 2 }, "Giữ được em, có thể làm em lỡ thời"),
    C("Mời luật sư đọc hợp đồng giúp gia đình", { counters: step(c, CO), money: -0.05, gamble: { p: 0.5, win: { income_mult: 1.3, flags: ["fair_deal"], counters: { hlv_heart: 1, hlv_wins: 1 }, log: "Học viện chịu rút xuống ba năm, thêm điều khoản giữ việc học văn hóa. Giới nghề bắt đầu gọi bạn là người biết giữ trẻ." }, lose: { flags: ["kept_prodigy"], log: "Học viện chọn một đứa khác. Em số 7 ở lại đội bạn, buồn suốt một mùa." } } }, "Lựa chọn thứ ba: công bằng, có thể mất cơ hội cho em", { tier: "sovereign" })], 0), adult),
  beat(CO, 3, 4, (c) => T("Chín trận không thắng", `Bạn đã lên dẫn đội một. Chín trận liền không thắng, ban lãnh đạo cho ba trận cuối: không trụ hạng thì đi. Đội trưởng, một cựu ngôi sao ba mươi tư tuổi, nói trong phòng thay đồ rằng giáo án của bạn chỉ hợp với đội thiếu niên.${f(c, "keeps_everyone") ? " Ba đứa trẻ năm nào bạn không chịu gạch tên giờ đang ngồi dự bị." : ""}`, [
    C("Gạch tên ngôi sao, đưa bọn trẻ lên đá chính", { counters: step(c, CO), gamble: { p: 0.45, win: { counters: { hlv_wins: 2 }, flags: ["youth_gamble"], happy: 6, log: "Ba trận, bảy điểm. Bàn quyết định đến từ một đứa mười tám tuổi chưa từng đá chính." }, lose: { income_mult: 0.6, flags: ["sacked_once"], happy: -6, log: "Thua trận thứ hai, bạn bị sa thải trong một phòng họp máy lạnh hỏng." } } }, "Thắng thì thành tên tuổi, thua thì mất việc"),
    C("Làm lành với đội trưởng, đá chắc chắn", { counters: step(c, CO), gamble: { p: 0.6, win: { counters: { hlv_wins: 1 }, log: "Đội trụ hạng ở vòng cuối. Đội trưởng nhận hết công trên báo." }, lose: { income_mult: 0.7, flags: ["sacked_once"], log: "Đội vẫn rớt hạng. Đội trưởng được gia hạn, bạn thì không." } } }, "Ít rủi ro hơn, đội không còn là của bạn"),
    C("Từ chức trước, đòi trả đủ hợp đồng", { counters: step(c, CO), money: 0.4, flags: ["resigned_club"], agency: 0.02, happy: 2 }, "Giữ thể diện và tiền, mất đội")], 1), adult),
  beat(CO, 4, 5, (c) => {
    const down = f(c, "sacked_once") || f(c, "resigned_club");
    if (down) return T("Hai mùa không ai gọi", `Từ ngày rời đội, bạn dạy thể dục thay ở một trường cấp hai, tối về xem lại băng các trận cũ. Một câu lạc bộ hạng dưới cách nhà tám trăm cây số gọi: lương bằng nửa ngày xưa, sân tập ngập nước mùa mưa.${f(c, "sold_prodigy") ? " Cùng tuần đó, em số 7 năm nào bị học viện thanh lý hợp đồng, trả lời phỏng vấn có nhắc đến tên bạn." : ""}`, [
      C("Đi, làm lại từ hạng dưới", { counters: step(c, CO, { hlv_wins: 1 }), flags: ["comeback"], income_mult: 0.8, rel: -4 }, "Xa nhà, còn được làm nghề"),
      C("Treo còi, thôi cầm đội", { counters: step(c, CO), ...leave(CO), flags: ["ex_coach"], happy: 2, rel: 3 }, "Bình yên, khép lại sân cỏ"),
      C("Vay tiền mở lò đào tạo của riêng mình", { counters: step(c, CO), custom: "borrow:0.6", flags: ["own_academy"], agency: 0.03, bw: -5 }, "Gánh nợ, tự làm chủ sân bóng", { tier: "sovereign" })], 0);
    return T("Lời mời của đội tuyển", `Liên đoàn mời bạn dẫn đội tuyển trẻ quốc gia. Lương gấp rưỡi, nhưng phải rời câu lạc bộ giữa mùa, và một nửa ban huấn luyện do liên đoàn chỉ định.${f(c, "sold_prodigy") ? " Báo vừa đăng chuyện em số 7 bị thanh lý hợp đồng, có nhắc đến khoản tiền giới thiệu năm ấy." : f(c, "fair_deal") || f(c, "kept_prodigy") ? " Em số 7 năm nào giờ là đội trưởng của chính đội tuyển ấy." : ""}`, [
      C("Nhận, lên đội tuyển", { counters: step(c, CO, { hlv_wins: 1 }), income_mult: 1.5, rel: -3, bw: -4, flags: ["national_coach"] }, "Đỉnh nghề, không được chọn người của mình"),
      C("Ở lại câu lạc bộ đến hết mùa", { counters: step(c, CO, { hlv_heart: 1 }), happy: 3, flags: ["loyal_coach"] }, "Giữ lời với đội, lời mời có thể không quay lại"),
      C("Nhận, nếu được tự chọn trợ lý", { counters: step(c, CO), gamble: { p: 0.4, win: { income_mult: 1.5, flags: ["national_coach"], agency: 0.02, log: "Liên đoàn nhượng bộ. Bạn mang theo hai người từng đứng sân đất với bạn năm nào." }, lose: { happy: -2, log: "Liên đoàn mời người khác ngay chiều hôm đó." } } }, "Lựa chọn thứ ba: đòi quyền, có thể mất ghế", { tier: "sovereign" })], 0);
  }, adult),
  beat(CO, 5, 6, (c) => T("Trận đấu tri ân", `Học trò cũ tổ chức một trận đấu để chia tay bạn. Có đứa giờ đã lấm tấm tóc bạc, có đứa dắt theo con.${f(c, "keeps_everyone") ? " Cả những đứa ngày xưa hiếm khi được vào sân cũng có mặt, đứng thành hàng dài nhất." : f(c, "picks_elite") ? " Những đứa thành danh đến đủ; vài cái tên năm xưa bị gạch không trả lời tin nhắn." : ""} Họ để sẵn một chiếc ghế ngoài đường biên cho bạn.`, [
    C("Ngồi chiếc ghế đó lần cuối, rồi nghỉ hẳn", { counters: step(c, CO), ...leave(CO), flags: ["retired_coach"], happy: 6, rel: 4 }, "Khép nghề trong tiếng vỗ tay"),
    C("Biến trận đấu thành quỹ học bổng cho trẻ nghèo", { counters: step(c, CO, { kind: 1 }), money: -0.1, rel: 5, flags: ["coach_fund"], agency: 0.02 }, "Không về hưu, gánh thêm một việc", { tier: "awakened" }),
    C("Dự xong, sáng hôm sau vẫn ra sân lúc sáu giờ", { counters: step(c, CO), happy: 2, health: -2 }, "Còn sân là còn mình, cơ thể đã mỏi")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(CO, "hlv_envelope", [25, 70], 10, (c) => T("Phong bì trong túi áo", vary("hlve", c.age, [
    "Sau buổi tập, một người bố dúi phong bì vào túi áo bạn, chỉ xin cho con được đá chính trận tới.",
    "Một bà mẹ hứa tài trợ áo đấu cho cả đội suốt mùa, nếu con bà được đeo băng đội trưởng.",
    c.country === "VN" ? "Gần Tết, một phụ huynh mang giỏ quà đến tận nhà, dưới đáy giỏ có một phong bì dày." : "Cuối năm, một phụ huynh mời bạn ăn tối ở nhà hàng đắt nhất thành phố, rồi hỏi về đội hình mùa sau."]), [
    C("Nhận, xếp đứa trẻ vào đội hình", { money: 0.1, counters: { hlv_heart: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [2, 8], note: "nhận phong bì để xếp đội hình" } }, "Tiền dễ, cả đội đều biết"),
    C("Trả lại, không nói với ai", { counters: { hlv_heart: 1, honest: 1 }, happy: -1 }, "Sạch sẽ, phụ huynh ấy sẽ còn thử lần nữa"),
    C("Dán tiêu chí chọn đội hình lên bảng tin", { flags: ["open_lineup"], rel: -1, agency: 0.01, counters: { hlv_heart: 1 } }, "Hết đường nhờ vả, vài phụ huynh giận", { tier: "sovereign" })], 0)),
  daily(CO, "hlv_data", [25, 70], 10, (c) => T("Cậu phân tích số liệu", vary("hlvd", c.age, [
    "Câu lạc bộ thuê một cậu hai mươi ba tuổi chưa từng đá bóng để phân tích số liệu. Cậu chỉ vào màn hình: đội bạn chạy nhiều nhất giải nhưng sút ít nhất.",
    "Một phần mềm phân tích mới chấm điểm từng cầu thủ sau mỗi trận. Nó xếp đứa bạn tin nhất vào hàng cuối."]), [
    C("Ngồi học lại cùng cậu ấy", { know: 5, bw: -4, counters: { hlv_wins: 1 } }, "Mất chút thể diện, đội đá khôn hơn"),
    C("Tin vào mắt mình như hai mươi năm qua", { happy: 2, flags: ["old_school"] }, "Nhẹ đầu, có thể bị thời thế bỏ lại"),
    C("Giao cậu ấy lo các tình huống cố định", { counters: { hlv_wins: 1 }, rel: 1, flags: ["has_analyst"], bw: -1 }, "Chia quyền, bớt việc, bớt cả tiếng nói", { tier: "awakened" })], 0)),
  daily(CO, "hlv_knee_kid", [25, 70], 9, () => T("Đau gối trước trận chung kết", "Đứa chơi hay nhất đội, mười sáu tuổi, kêu đau gối hai hôm trước trận chung kết. Bác sĩ đội nói “có thể không sao”. Bố mẹ em muốn em đá, vì có tuyển trạch viên ngồi trên khán đài.", [
    C("Cho em ngồi ngoài, chụp phim trước", { counters: { hlv_heart: 1, hlv_wins: -1 }, happy: -2 }, "Có thể mất cúp, giữ được đầu gối của em"),
    C("Cho em đá, dặn đau thì xin ra", { gamble: { p: 0.6, win: { counters: { hlv_wins: 1 }, log: "Em đá trọn trận, ghi một bàn. Tuần sau, phim chụp chỉ thấy viêm nhẹ." }, lose: { flags: ["injured_player"], happy: -6, counters: { hlv_heart: -1 }, log: "Em rời sân ở phút ba mươi, phải nghỉ trọn một năm." } } }, "Có thể có cúp, có thể hỏng một sự nghiệp")], 0)),
  daily(CO, "hlv_presser", [25, 70], 10, (c) => T("Họp báo sau trận thua", vary("hlvp", c.age, [
    "Đội thua bốn bàn trên sân nhà. Câu hỏi đầu tiên của phóng viên: bạn có định từ chức không?",
    "Đội thua vì một quả phạt đền gây tranh cãi ở phút cuối. Mười hai chiếc micro chĩa vào bạn."]), [
    C("Đổ lỗi cho trọng tài", { money: -0.03, flags: ["blamed_ref"], happy: 1 }, "Cầu thủ đứng sau bạn, liên đoàn phạt tiền"),
    C("Nhận hết trách nhiệm về mình", { rel: 2, happy: -2, counters: { hlv_heart: 1 } }, "Cầu thủ nể, ban lãnh đạo ghi sổ"),
    C("Trả lời đúng một câu rồi rời phòng", { bw: 2, rel: -1 }, "Giữ được đầu óc, báo chí không ưa")], 1)),
  daily(CO, "hlv_fix", [25, 70], 99, () => T("Cuộc gọi trước vòng cuối", "Trước vòng đấu cuối, một số máy lạ gọi cho bạn. Người đó biết câu lạc bộ đang nợ lương bạn ba tháng, và nói chỉ cần đội bạn thua cách biệt ở một trận không còn ý nghĩa gì với bảng xếp hạng.", [
    C("Từ chối và báo cho liên đoàn", { gamble: { p: 0.6, win: { flags: ["whistleblower"], rel: 3, counters: { hlv_heart: 1 }, log: "Liên đoàn chuyển hồ sơ cho công an. Ba người bị bắt trước mùa giải mới." }, lose: { bw: -6, flags: ["whistleblower"], log: "Hồ sơ bị ngâm. Bạn bắt đầu nhận những tin nhắn không ký tên." } } }, "Đúng việc, có thể rước họa", { tier: "awakened" }),
    C("Từ chối, cúp máy, không kể với ai", { counters: { honest: 1 }, happy: -1 }, "Yên thân, đường dây vẫn còn đó"),
    C("Nhận tiền", { money: 0.9, flags: ["fixed_match"], counters: { hlv_heart: -2 }, secret: { tag: "PAID_BRIBE", severity: 0.7, fuse_years: [2, 8], note: "nhận tiền bán độ một trận cuối mùa" } }, "Hết nợ lương, một bí mật đủ chôn cả nghề")], 1)),
  daily(CO, "hlv_owner", [25, 70], 8, () => T("Cháu của ông chủ", "Ông chủ câu lạc bộ gửi xuống một cầu thủ hai mươi tuổi, nói gọn: “Cháu tôi, cho nó đá.” Cậu ta chạy chậm hơn mọi người trong đội nửa nhịp, và biết điều đó.", [
    C("Cho đá chính", { income_mult: 1.05, counters: { hlv_heart: -1, hlv_wins: -1 } }, "Giữ ghế, mất lòng phòng thay đồ"),
    C("Từ chối thẳng", { counters: { hlv_heart: 1 }, gamble: { p: 0.5, win: { log: "Ông chủ im lặng một tuần, rồi thôi." }, lose: { income_mult: 0.85, log: "Hợp đồng của bạn không được gia hạn đúng hạn." } } }, "Giữ nguyên tắc, có thể mất ghế"),
    C("Cho đá thử, chấm điểm công khai như mọi người", { flags: ["open_lineup"], gamble: { p: 0.5, win: { counters: { hlv_wins: 1 }, log: "Cậu ta tiến bộ thật, và lần đầu được cả đội nhận là người trong đội." }, lose: { log: "Bảng điểm nói rõ tất cả. Ông chủ tự rút cháu về." } } }, "Mất vài trận thử, để con số nói thay", { tier: "awakened" })], 1)),
  daily(CO, "hlv_burnout", [25, 70], 10, (c) => T("Mùa giải không có ngày nghỉ", vary("hlvb", c.age, [
    "Cả mùa bạn không có ngày nghỉ: tuần tập sáu buổi, Chủ nhật đi xem đối thủ. Bác sĩ đo huyết áp hai lần rồi mới đọc con số.",
    "Bạn ngủ bốn tiếng mỗi đêm, thời gian còn lại là băng hình trận đấu. Một sáng, bạn lái xe đến sân rồi không nhớ mình đã đi đường nào."]), [
    C("Thuê một trợ lý, chia bớt việc", { money: -0.1, health: 4, bw: 4, flags: ["has_assistant"] }, "Tốn tiền, có người đỡ một vai"),
    C("Gồng đến hết mùa", { counters: { hlv_wins: 1 }, health: -4, rel: -2 }, "Đội đá tốt hơn, cơ thể trả giá"),
    C("Xin nghỉ nửa mùa", { income_mult: 0.9, health: 5, happy: 4 }, "Hồi sức, ghế có thể có người ngồi")], 1)),
  daily(CO, "hlv_abroad", [28, 60], 10, (c) => T("Lời mời từ xứ người", vary("hlva", c.age, [
    "Một câu lạc bộ ở nước ngoài, trong một giải đang chi tiền mạnh tay, mời bạn sang làm trợ lý. Lương gấp đôi, hợp đồng hai năm, gia đình không đi theo được.",
    "Một học viện nước ngoài mở chi nhánh trong thành phố và mời bạn làm giám đốc chuyên môn, lương gấp đôi. Bạn sẽ dạy theo giáo án của họ, không phải của bạn."]), [
    C("Nhận lời", { income_mult: 1.5, rel: -4, happy: -1, flags: ["took_big_offer"] }, "Tiền nhiều, xa người thân hoặc xa cách dạy của mình"),
    C("Ở lại với đội đang dẫn", { rel: 2, counters: { hlv_heart: 1 } }, "Ở gần những gì mình dựng, tiền thì vẫn thế")], 1)),
  daily(CO, "hlv_rival", [25, 70], 9, (c, N) => { const r = role(c, "rival")!; return T("Lời mời gấp ba lương", `${N(r)} giờ dẫn đội đối thủ cùng thành phố, và vừa mời đứa giỏi nhất đội bạn sang với mức lương gấp ba. Em ấy đến hỏi ý bạn trước khi ký.`, [
    C("Khuyên em ở lại, hứa thêm suất đá chính", { counters: { hlv_wins: 1 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "giữ chân cầu thủ không cho sang đội đối thủ" } }, "Giữ người, em có thể oán bạn về sau"),
    C("Khuyên em đi, vì tương lai của em", { counters: { hlv_heart: 1, hlv_wins: -1 }, happy: 1 }, "Đúng cho em, đội bạn yếu đi"),
    C(`Đòi ${N(r)} trả phí đào tạo về cho đội trẻ`, { gamble: { p: 0.5, win: { money: 0.1, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "trả phí đào tạo sòng phẳng khi mua cầu thủ" }, log: "Đội kia trả phí đào tạo. Lần đầu tiên, tiền đó được dùng mua bóng cho lứa mười tuổi." }, lose: { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "bị đòi phí đào tạo trước mặt báo chí" }, log: "Họ từ chối, và kể với báo rằng bạn “bán học trò”." } } }, "Lựa chọn thứ ba: em được đi, đội trẻ có tiền", { tier: "sovereign" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(CO, "hlv_mentor", [25, 70], 99, (c, N) => { const m = role(c, "mentor")!; return T("Người thầy cũ xin một chỗ ngồi", `${N(m)}, người dạy bạn những buổi tập đầu tiên, giờ đã già và sống bằng đồng lương hưu ít ỏi. ${N(m)} hỏi có thể ngồi trên băng ghế của bạn một mùa không, “chỉ để còn được nghe tiếng còi”.`, [
    C("Mời về làm trợ lý, trích lương mình trả", { money: -0.08, trust: { npc: m, delta: 0.3 }, memory: { npc: m, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "mời về ngồi băng ghế huấn luyện lúc tuổi già" } }, "Tốn tiền, có thêm một đôi mắt già"),
    C("Gửi ít tiền, nói băng ghế đã đủ người", { money: -0.03, trust: { npc: m, delta: 0.05 } }, "Tốn ít, thầy hiểu ý"),
    C("Từ chối khéo", { bw: 2, memory: { npc: m, tag: "REFUSED_HELP", weight: -0.2, note: "không cho ngồi băng ghế huấn luyện" } }, "Băng ghế gọn gàng, một người thầy buồn")], 0, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(CO, "hlv_quit", [28, 65], 99, () => T("Lời mời ngồi bàn giấy", "Một công ty bán dụng cụ thể thao mời bạn làm trưởng phòng kinh doanh: lương cố định, cuối tuần được ở nhà. Mùa giải mới còn ba tuần nữa là bắt đầu.", [
    C("Nhận, treo còi", { ...leave(CO), flags: ["ex_coach"], happy: -1, rel: 3 }, "Ổn định, mất sân tập"),
    C("Ở lại sân", { happy: 1, counters: { hlv_heart: 1 } }, "Còn nghề, tiền vẫn bấp bênh")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(CO, "hlv_family", [28, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} trong đội của bạn`, `${N(k)} xin vào đội bạn dẫn. ${N(k)} chơi khá nhưng chưa phải giỏi nhất, và phụ huynh khác đã bắt đầu xì xào.`, [
      C("Nhận, nghiêm với con hơn mọi đứa khác", { trust: { npc: k, delta: -0.15 }, counters: { hlv_heart: 1 } }, "Đội tin bạn, con thấy thiệt thòi"),
      C("Nhận, đối xử như mọi đứa", { trust: { npc: k, delta: 0.1 }, rel: -2 }, "Công bằng, nhưng ai cũng nghi"),
      C("Gửi con sang thầy khác, đi xem như phụ huynh", { trust: { npc: k, delta: 0.2 }, money: -0.03, flags: ["parent_not_coach"] }, "Mất cơ hội dạy con, giữ được làm cha mẹ", { tier: "awakened" })], 2, { npc: k });
    if (s) return T("Bữa cơm Chủ nhật vắng bạn", `${N(s)} đếm lại: năm nay bạn ăn cơm nhà vào Chủ nhật đúng bốn lần. “Ở sân, bạn có hai mươi đứa trẻ. Còn nhà này thì sao?”`, [
      C("Hứa mỗi tháng giữ một Chủ nhật cho nhà", { promise: { to: s, what: "giữ một Chủ nhật mỗi tháng cho gia đình", years: 2 }, trust: { npc: s, delta: 0.15 }, counters: { hlv_wins: -1 } }, "Đội thiếu bạn một buổi, nhà có bạn"),
      C("Nói thật: mùa này chưa thể", { trust: { npc: s, delta: -0.2 }, counters: { hlv_wins: 1 } }, "Đội có bạn, bữa cơm thì không"),
      C("Rủ cả nhà ra sân cùng", { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.2 }, log: `Chủ nhật thành ngày cả nhà ra sân. Bọn trẻ trong đội gọi ${N(s)} là “hậu cần trưởng”.` }, lose: { trust: { npc: s, delta: -0.1 }, log: `${N(s)} ngồi khán đài một buổi rồi về trước.` } } }, "Gộp hai thế giới, có thể chẳng vừa bên nào", { tier: "awakened" })], 0, { npc: s });
    return T("Một nghề “chạy theo trẻ con”", `${N(p!)} vẫn hỏi bao giờ bạn kiếm một việc “đàng hoàng”. Trong mắt ${N(p!)}, dạy trẻ con chơi thể thao chỉ là việc làm thêm.`, [
      C(`Mời ${N(p!)} đến xem trận chung kết`, { gamble: { p: 0.6, win: { trust: { npc: p!, delta: 0.3 }, log: `${N(p!)} đứng dậy vỗ tay khi đội bạn ghi bàn, rồi giả vờ như không có gì.` }, lose: { trust: { npc: p!, delta: -0.1 }, log: `${N(p!)} nói bận, không đến.` } } }, "Có thể được nhìn nhận, có thể hụt hẫng"),
      C("Thôi, không cần ai công nhận", { happy: -2, flags: ["own_path_coach"] }, "Đỡ một lần thất vọng, bớt một lần gần nhau")], 0, { npc: p! });
  }),

  /* ============================ TRỌNG TÀI (ttr_) ============================ */

  /* ---------- năng khiếu ---------- */
  talent(RF, "ttr_t_whistle", [8, 14], () => true, () => T("Người cầm còi của xóm", "Trận bóng nào trong xóm cũng cãi nhau vì một bàn thắng có hay không. Lạ là khi bạn đứng ngoài phân xử, cả hai bên đều nghe, kể cả khi bạn xử thua cho đội có bạn thân của mình. Thầy thể dục đưa bạn một cái còi để bắt giải của trường.", [
    C("Nhận còi, bắt giải của trường", { flags: [talentFlag(RF)], counters: { talents_seen: 1 }, rel: -1, happy: 1 }, "Mất vài người bạn, được cả hai bên tin"),
    C("Trả còi, xin vào sân đá", { counters: { talents_seen: 1 }, happy: 2, rel: 1 }, "Vui với bạn bè, tiếng còi để người khác giữ")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RF, "ttr_d_course", [22, 40], () => true, () => T("Khóa trọng tài cấp cơ sở", "Liên đoàn bóng đá thành phố mở khóa trọng tài cấp cơ sở: tám buổi tối học luật, một bài chạy thể lực, rồi ra bắt các giải phong trào cuối tuần. Mỗi trận được trả bằng một bữa ăn ngon, kèm quyền bị cả hai đội cùng chửi.", [
    C("Đăng ký, bắt giải cuối tuần", { ...become(RF), counters: { doors_seen: 1 }, health: 2, bw: -2 }, "Mất cuối tuần, có đường lên"),
    C("Học cho biết luật thôi", { counters: { doors_seen: 1 }, know: 3 }, "Hiểu luật, không thêm việc"),
    C("Thôi", { counters: { doors_seen: 1 } })], 0)),
  door(RF, "ttr_d_noshow", [22, 45], () => true, (c) => T("Trọng tài không đến", `Trận chung kết ${c.poor_country ? "giải bóng đá công nhân khu công nghiệp" : "giải bóng đá của các công ty trong thành phố"} đã trễ bốn mươi phút vì trọng tài không đến. Hai đội trưởng nhìn quanh khán đài rồi cùng chỉ vào bạn. Bạn bắt trọn trận, không ai cãi một quả nào; cuối trận, một người trong ban tổ chức đưa bạn tấm danh thiếp.`, [
    C("Gọi vào số trên danh thiếp", { ...become(RF), counters: { doors_seen: 1 }, flags: ["natural_ref"] }, "Một nghề mới, cuối tuần không còn là của mình"),
    C("Cất danh thiếp, kể như một buổi chiều vui", { counters: { doors_seen: 1 }, happy: 2 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(RF, 1, 1, (c) => T("Thẻ đỏ đầu tiên", "Giải hạng nghiệp dư, chiều thứ Bảy, ba trăm khán giả. Phút sáu mươi, ông chủ doanh nghiệp tài trợ cả giải, cũng là hậu vệ của một đội, vào bóng bằng hai chân từ phía sau. Trưởng ban tổ chức đứng ngay đường biên, nhìn bạn.", [
    C("Rút thẻ đỏ", { counters: step(c, RF, { ttr_rep: 1 }), flags: ["calls_it"], gamble: { p: 0.6, win: { log: "Ông ấy rời sân, cuối mùa vẫn tài trợ, và nhớ tên bạn." }, lose: { money: -0.03, counters: { ttr_heat: 1 }, log: "Tuần sau, bạn không được phân trận nào ở giải đó nữa." } } }, "Đúng luật, có thể mất chỗ bắt"),
    C("Rút thẻ vàng cho trận đấu yên", { counters: step(c, RF), flags: ["soft_whistle"], money: 0.02, happy: -2 }, "Yên chuyện, bạn biết mình đã thấy gì")], 0), adult),
  beat(RF, 2, 3, (c) => T("Danh sách trọng tài chuyên nghiệp", `Bạn được đề cử vào danh sách trọng tài giải chuyên nghiệp. Còn bài kiểm tra thể lực: sáu lần chạy nước rút bốn mươi mét, rồi bốn mươi vòng chạy biến tốc. Trưởng ban trọng tài dặn thêm: “Ở giải này, người ta nhớ những trọng tài biết điều.”${f(c, "soft_whistle") ? " Ông ấy đã nghe chuyện tấm thẻ vàng năm nào, và có vẻ hài lòng." : f(c, "calls_it") ? " Ông ấy cũng đã nghe chuyện tấm thẻ đỏ năm nào." : ""}`, [
    C("Tập thêm hai buổi mỗi ngày", { counters: step(c, RF), health: 3, rel: -3, gamble: { p: 0.7, win: { income_mult: 1.4, flags: ["top_panel"], log: "Bạn qua bài chạy, còn dư hai giây." }, lose: { happy: -4, log: "Bạn hụt hơi ở vòng chạy thứ ba mươi tám. Năm sau thi lại." } } }, "Tự lực, có thể trượt"),
    C("Mời trưởng ban ăn tối, hiểu ý ông ấy", { counters: step(c, RF), money: -0.1, income_mult: 1.4, flags: ["top_panel", "owes_chief"], secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 9], note: "mời cơm để được vào danh sách trọng tài" } }, "Chắc suất, mang theo một món nợ"),
    C("Ở lại hạng dưới, học làm trọng tài video", { counters: step(c, RF, { ttr_rep: 1 }), know: 5, flags: ["video_ref"] }, "Chậm hơn, có một tay nghề mới", { tier: "awakened" })], 0), adult),
  beat(RF, 3, 4, (c) => T("Phút tám mươi chín", `Trận cầu lớn nhất mùa, tỉ số đang hòa. Phút tám mươi chín, bạn công nhận một bàn thắng; đêm đó, đoạn phát lại cho thấy bạn đã sai. Liên đoàn muốn bạn ký thông cáo rằng quyết định “đúng với góc nhìn trên sân”.${f(c, "owes_chief") ? " Trưởng ban gọi riêng: “Nhớ ai đưa cậu lên.”" : ""}${f(c, "video_ref") ? " Bạn biết rõ: nếu có màn hình, bạn đã sửa được trong một phút." : ""}`, [
    C("Xin lỗi công khai, nhận mình sai", { counters: step(c, RF, { ttr_rep: 1 }), flags: ["admitted_error"], income_mult: 0.85, happy: 2 }, "Bị đình chỉ, giữ được lòng tin"),
    C("Ký thông cáo, im lặng", { counters: step(c, RF, { ttr_heat: 1 }), flags: ["silent_ref"], bw: -6 }, "Giữ suất, mang tiếng"),
    C("Đề nghị công bố ghi âm của tổ trọng tài", { counters: step(c, RF), gamble: { p: 0.5, win: { counters: { ttr_rep: 2 }, flags: ["open_audio"], agency: 0.03, log: "Cả nước nghe bạn nói “tôi không thấy rõ”. Lạ thay, lời chửi giảm hẳn." }, lose: { income_mult: 0.7, log: "Liên đoàn từ chối và gạch tên bạn khỏi ba vòng đấu." } } }, "Lựa chọn thứ ba: minh bạch, có thể bị trù", { tier: "sovereign" }),
    C("Treo còi", { counters: step(c, RF), ...leave(RF), flags: ["ex_ref"], happy: -2, bw: 4 }, "Thoát khỏi đám đông, bỏ nghề đã chọn")], 0), adult),
  beat(RF, 4, 5, (c) => {
    const hooked = f(c, "owes_chief") || f(c, "silent_ref");
    if (hooked) return T("Cuộc gọi lúc nửa đêm", `Một giọng lạ gọi lúc nửa đêm. Người đó biết địa chỉ nhà bạn, biết món nợ của nhà bạn${f(c, "owes_chief") ? ", biết cả bữa tối năm nào với trưởng ban" : ", biết cả tờ thông cáo năm nào bạn đã ký"}. Họ không cần bạn thổi sai. Họ chỉ cần bạn “không thấy” một lần, ở một trận không ai để ý.`, [
      C("Báo ngay cho cơ quan điều tra", { counters: step(c, RF), flags: ["witness"], gamble: { p: 0.55, win: { counters: { ttr_rep: 2 }, rel: 3, log: "Đường dây bị bắt. Bạn ra làm chứng, tên bạn lên báo theo cách tử tế." }, lose: { bw: -8, happy: -5, log: "Vụ án kéo dài ba năm. Suốt thời gian đó, nhà bạn có người canh." } } }, "Đúng việc, đời bạn bị đảo lộn", { tier: "awakened" }),
      C("Nhận lời", { counters: step(c, RF, { ttr_heat: 1 }), money: 1.2, flags: ["fixed_ref"], secret: { tag: "PAID_BRIBE", severity: 0.8, fuse_years: [1, 6], note: "nhận tiền để làm ngơ trong một trận đấu" } }, "Hết nợ một lần, sống cùng nó cả đời"),
      C("Treo còi ngay sáng hôm sau", { counters: step(c, RF), ...leave(RF), flags: ["ex_ref"], happy: -3 }, "Thoát khỏi họ, mất nghề")], 0);
    const rep = n(c, "ttr_rep");
    return T("Trận chung kết", `Bạn được phân công bắt trận chung kết: bảy mươi nghìn người, hai mươi hai máy quay, một mặt sân bạn đã đi bộ một vòng lúc sáu giờ sáng.${f(c, "admitted_error") || f(c, "open_audio") ? " Đội trưởng hai đội đều nói với báo chí rằng họ muốn bạn bắt." : rep >= 2 ? " Báo chí gọi bạn là trọng tài ít tranh cãi nhất mùa." : ""}${f(c, "ref_union") ? " Hội trọng tài phong trào bạn lập năm nào gửi lời chúc, ký ba trăm cái tên." : ""}`, [
      C("Bắt như mọi trận khác", { counters: step(c, RF), gamble: { p: Math.max(0.3, Math.min(0.75, 0.45 + 0.1 * rep)), win: { income_mult: 1.3, counters: { ttr_rep: 1 }, flags: ["final_ref"], log: "Sáng hôm sau, không tờ báo nào nhắc tên bạn. Đó là lời khen lớn nhất của nghề." }, lose: { happy: -6, counters: { ttr_heat: 2 }, log: "Một tình huống việt vị mười phân. Mặt bạn lại lên trang nhất." } } }, "Đỉnh nghề, một sai lầm là cả đời"),
      C("Nhường trận, vào phòng video đỡ cho người trẻ", { counters: step(c, RF), rel: 3, happy: 1, flags: ["mentor_ref"] }, "Không lên đỉnh, nâng một người khác lên", { tier: "awakened" }),
      C("Nhận, kèm đòi bảo hiểm cho trọng tài phong trào", { counters: step(c, RF), gamble: { p: 0.4, win: { flags: ["ref_union"], agency: 0.03, rel: 4, log: "Liên đoàn lập quỹ bảo hiểm cho trọng tài các giải nghiệp dư. Bạn bắt trận chung kết với chiếc còi cũ." }, lose: { income_mult: 0.9, log: "Bạn vẫn bắt trận chung kết. Đó là trận cuối bạn được phân công trong hai năm." } } }, "Lựa chọn thứ ba: dùng lúc mình có tiếng nói", { tier: "sovereign" })], 0);
  }, adult),
  beat(RF, 5, 6, (c) => T("Lá cờ cuối cùng", `Bạn đến tuổi phải rời danh sách trọng tài chuyên nghiệp. Liên đoàn mời bạn dạy lớp trọng tài trẻ, một đài truyền hình mời bình luận luật mỗi tối thứ Bảy, còn giải bóng đá thiếu nhi ${c.country === "VN" ? "của phường" : "trong khu bạn ở"} vẫn thiếu người cầm còi.${f(c, "fixed_ref") ? " Mỗi lần có ai nhắc đến mùa giải năm ấy, bạn vẫn giật mình." : f(c, "witness") ? " Người ta vẫn gọi bạn là “người trọng tài ra tòa làm chứng”." : ""}`, [
    C("Dạy lớp trọng tài trẻ", { counters: step(c, RF), income_mult: 0.9, rel: 3, flags: ["ref_teacher"] }, "Lương ít hơn, có người nối nghề"),
    C("Lên truyền hình bình luận luật", { counters: step(c, RF, { ttr_heat: 1 }), income_mult: 1.3, happy: 2 }, "Tiền khá, phán xét đồng nghiệp trên sóng"),
    C("Về cầm còi cho bọn trẻ, không lấy tiền", { counters: step(c, RF, { kind: 1 }), ...leave(RF), happy: 5, flags: ["sunday_whistle"] }, "Không tiền, không đám đông, nghe trẻ con cười")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(RF, "ttr_parents", [22, 60], 10, (c) => T("Phụ huynh bên đường biên", vary("ttrp", c.age, [
    "Trận của bọn trẻ mười tuổi. Một phụ huynh chửi bạn từ phút đầu, to đến mức bọn trẻ dừng chơi để nhìn.",
    "Giải thiếu niên cuối tuần. Một nhóm phụ huynh quay lại từng quyết định của bạn và bình luận trực tiếp lên mạng."]), [
    C("Dừng trận đến khi người đó rời sân", { counters: { ttr_rep: 1 }, flags: ["stopped_match"], bw: -2 }, "Bảo vệ trận đấu, bị gọi là làm quá"),
    C("Mặc kệ, bắt tiếp", { happy: -3, counters: { ttr_heat: 1 } }, "Trận trôi qua, bọn trẻ học được rằng chửi là bình thường"),
    C("Mời phụ huynh đó cầm cờ biên một hiệp", { gamble: { p: 0.5, win: { counters: { ttr_rep: 1 }, rel: 2, log: "Hết hiệp, người đó im lặng trả lá cờ, bắt tay bạn rồi về chỗ." }, lose: { happy: -2, log: "Người đó từ chối, và cả khán đài cười bạn." } } }, "Có thể đổi một người, có thể thành trò cười", { tier: "awakened" })], 0)),
  daily(RF, "ttr_fitness", [25, 60], 10, (c) => T("Đầu gối trước mùa giải", vary("ttrf", c.age, [
    "Bài kiểm tra thể lực đầu mùa còn hai tuần. Đầu gối trái của bạn kêu lục cục mỗi khi xuống cầu thang.",
    "Một bác sĩ tư đọc phim chụp: sụn đầu gối rách nhẹ. Liên đoàn chưa biết, bài kiểm tra còn mười ngày."]), [
    C("Giấu chấn thương, uống thuốc giảm đau", { health: -4, flags: ["hidden_knee"] }, "Giữ suất mùa này, đầu gối trả giá"),
    C("Khai thật, nghỉ một mùa", { income_mult: 0.9, health: 5, counters: { honest: 1 } }, "Mất một mùa, giữ được đôi chân"),
    C("Thuê người tập riêng ba tháng", { money: -0.1, health: 2, counters: { exercise: 2 } }, "Tốn tiền, chưa chắc kịp")], 1)),
  daily(RF, "ttr_rival", [25, 50], 99, (c, N) => { const r = role(c, "rival")!; return T("Suất quốc tế duy nhất", `Năm nay liên đoàn chỉ có một suất đề cử trọng tài quốc tế. Ứng viên còn lại là ${N(r)}. Bạn nghe tin ${N(r)} đi gặp từng thành viên hội đồng, và kể với họ những chuyện cũ của bạn.`, [
    C("Đi gặp hội đồng, kể lại phần của bạn", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "tranh nhau suất trọng tài quốc tế" }, gamble: { p: 0.5, win: { income_mult: 1.15, flags: ["intl_badge"], log: "Bạn có suất. Từ đó hai người không nói chuyện với nhau." }, lose: { happy: -3, log: "Hội đồng chọn người kia." } } }, "Có thể có suất, mất một đồng nghiệp"),
    C("Không vận động, để hồ sơ tự nói", { counters: { honest: 1 }, gamble: { p: 0.35, win: { flags: ["intl_badge"], income_mult: 1.15, log: "Hồ sơ của bạn đủ dày. Bạn có suất." }, lose: { log: "Suất về tay người kia." } } }, "Sạch sẽ, cửa hẹp hơn"),
    C("Đề nghị hội đồng chấm bằng băng hình hai người", { gamble: { p: 0.5, win: { flags: ["intl_badge", "open_selection"], income_mult: 1.1, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "chọn trọng tài quốc tế bằng băng hình công khai" }, log: "Hội đồng chấm mười trận của mỗi người. Bạn hơn nửa điểm, và người kia là người đầu tiên bắt tay bạn." }, lose: { happy: -1, log: "Hội đồng nói chưa có tiền lệ, rồi bỏ phiếu như cũ." } } }, "Lựa chọn thứ ba: luật chơi mới, không chắc thắng", { tier: "sovereign" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RF, "ttr_threat", [22, 60], 10, (c) => T("Địa chỉ nhà bị đăng lên mạng", vary("ttrt", c.age, [
    "Sau một trận thua của đội bóng đông cổ động viên nhất thành phố, địa chỉ nhà bạn bị đăng lên một diễn đàn.",
    "Có người dán ảnh bạn kèm chữ “mua được” ở cổng sân vận động. Tin nhắn đe dọa đến suốt một tuần."]), [
    C("Báo công an, giữ lại mọi tin nhắn", { flags: ["threat_case"], bw: -3, gamble: { p: 0.5, win: { log: "Ba người bị mời lên làm việc. Tin nhắn dừng hẳn." }, lose: { log: "Hồ sơ nằm yên đó. Bạn tự lắp thêm một lớp khóa cửa." } } }, "Đúng quy trình, tốn sức chờ đợi"),
    C("Rời nhà một tháng, ở nhờ người thân", { money: -0.05, rel: -2, bw: 3 }, "Yên thân, như thể bạn đã có lỗi"),
    C("Xin không bắt các trận của đội đó nữa", { income_mult: 0.95, counters: { ttr_heat: -1 }, happy: 1 }, "Bớt sức ép, ít trận lớn hơn")], 0)),
  daily(RF, "ttr_strike", [22, 60], 99, () => T("Trọng tài phong trào nghỉ việc", "Một đồng nghiệp bị cầu thủ hành hung ở giải hạng dưới, phải nằm viện. Tiền bồi dưỡng trọng tài thì đã nợ hai tháng. Các trọng tài phong trào rủ nhau không ra sân cuối tuần này.", [
    C("Nghỉ cùng mọi người", { rel: 3, money: -0.03, counters: { ttr_rep: 1 } }, "Mất tiền vài trận, được đồng nghiệp tin"),
    C("Vẫn bắt, giải đang thiếu người", { money: 0.04, counters: { ttr_heat: 1 }, rel: -3 }, "Thêm tiền, bị gọi là kẻ phá rào"),
    C("Đứng ra lập hội trọng tài, đòi luật bảo vệ", { flags: ["ref_union"], bw: -5, agency: 0.02, rel: 4 }, "Thêm việc không công, có thể đổi luật", { tier: "sovereign" })], 0)),
  daily(RF, "ttr_language", [24, 60], 10, (c) => T("Giải đấu ở xứ người", vary("ttrl", c.age, [
    "Bạn được cử bắt một giải trẻ ở nước ngoài. Mọi trao đổi với cầu thủ phải bằng ngoại ngữ, và vốn ngoại ngữ của bạn dừng ở ba từ: có, không, việt vị.",
    "Một cầu thủ nước ngoài chửi bạn bằng thứ tiếng bạn không hiểu. Cả sân cười, trừ bạn."]), [
    C("Học ngoại ngữ ba buổi tối một tuần", { know: 5, bw: -4, flags: ["ref_language"] }, "Mệt thêm, mở cửa ra giải quốc tế"),
    C("Dùng còi và cờ thay lời", { happy: -1, counters: { ttr_heat: 1 } }, "Đỡ tốn sức, nhiều lần bị hiểu lầm")], 0)),
  daily(RF, "ttr_friend", [22, 60], 99, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Tiệc tân gia của bạn cũ", `${N(fr)} giờ là huấn luyện viên của một đội bạn sắp bắt ở vòng sau. ${N(fr)} mời bạn đến tiệc tân gia: “Bạn từ thuở nhỏ, ai nói gì kệ họ.”`, [
    C("Đi dự, chuyện nghề tính sau", { rel: 2, trust: { npc: fr, delta: 0.15 }, gamble: { p: 0.6, win: { log: "Không ai để ý. Bạn về nhà lúc mười giờ, lòng nhẹ tênh." }, lose: { counters: { ttr_heat: 1 }, log: "Một tấm ảnh hai người nâng ly lan khắp diễn đàn cổ động viên." } } }, "Giữ bạn, có thể mất tiếng"),
    C("Từ chối, nói thẳng lý do", { trust: { npc: fr, delta: -0.15 }, counters: { ttr_rep: 1 } }, "Giữ nghề, một người bạn tủi thân"),
    C("Đi dự, và xin liên đoàn đổi trận", { trust: { npc: fr, delta: 0.1 }, income_mult: 0.98, flags: ["asked_reassign"] }, "Giữ cả hai, mất một trận đáng bắt", { tier: "awakened" })], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(RF, "ttr_machine", [22, 60], 99, () => T("Máy bắt việt vị", "Giải đấu lắp hệ thống tự động bắt việt vị và bóng qua vạch. Liên đoàn cắt một phần ba số trọng tài biên, và gửi thư mời những người còn lại đi học vận hành máy.", [
    C("Đi học vận hành máy", { know: 4, bw: -3, flags: ["video_ref"] }, "Theo kịp thời thế, thành người ngồi sau màn hình"),
    C("Ký đơn phản đối cùng đồng nghiệp", { agency: 0.01, rel: 2, gamble: { p: 0.3, win: { counters: { ttr_rep: 1 }, log: "Liên đoàn giữ lại trọng tài biên cho các giải trẻ." }, lose: { income_mult: 0.85, log: "Bạn có tên trong danh sách bị cắt." } } }, "Đứng về phía đồng nghiệp, có thể mất suất"),
    C("Chấp nhận bắt ít trận hơn", { income_mult: 0.9, happy: -1, bw: 2 }, "Nhẹ việc, nhẹ cả túi tiền")], 0)),
  daily(RF, "ttr_handball", [22, 60], 99, () => T("Bàn tay của cậu bé chín tuổi", "Trận giải thiếu nhi, đội áo xanh vừa ghi bàn. Cậu bé chín tuổi ghi bàn chạy đến chỗ bạn: “Cháu chạm tay vào bóng.” Không ai khác thấy, kể cả bạn, và huấn luyện viên đội áo xanh đang nhìn bạn chằm chằm.", [
    C("Hủy bàn thắng, khen cậu bé trước hai đội", { counters: { ttr_rep: 1 }, flags: ["fair_play_story"], happy: 4 }, "Đội cậu mất bàn, cả giải nhớ chuyện này"),
    C("Công nhận bàn thắng, vì bạn không thấy", { happy: -1, counters: { ttr_heat: 1 } }, "Đúng quy trình, bỏ lỡ một bài học")], 0)),
  daily(RF, "ttr_quit", [24, 60], 99, () => T("Tiếng còi không nuôi nổi người", "Tiền bồi dưỡng trọng tài vừa đủ đổ xăng và thay giày. Một công ty bảo hiểm mời bạn làm nhân viên thẩm định, lương cố định, nhưng phải làm cả thứ Bảy.", [
    C("Nhận việc, cất còi", { ...leave(RF), flags: ["ex_ref"], happy: -1 }, "Ổn định, mất sân bóng"),
    C("Giữ còi, ban ngày làm thêm việc khác", { bw: -4, money: 0.05, flags: ["ref_day_job"] }, "Đủ sống, mệt gấp đôi")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(RF, "ttr_family", [24, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị bạn học trêu`, `Bạn học của ${N(k)} cắt đoạn phim bạn bắt sai năm nào thành trò cười, gửi khắp nhóm lớp. ${N(k)} về nhà, đóng cửa phòng, không ăn cơm.`, [
      C("Ngồi xem đoạn phim cùng con, kể lại thật", { trust: { npc: k, delta: 0.2 }, bw: -2 }, "Khó nói, con hiểu bạn hơn"),
      C("Lên trường gặp giáo viên", { trust: { npc: k, delta: -0.1 }, rel: 1 }, "Xong chuyện nhanh, con thấy xấu hổ thêm"),
      C("Dẫn con đi bắt cùng một trận thiếu nhi", { trust: { npc: k, delta: 0.25 }, happy: 2, flags: ["ref_family"] }, "Mất một Chủ nhật, con thấy nghề từ bên trong", { tier: "awakened" })], 0, { npc: k });
    if (s) return T("Khán đài không có người nhà", `${N(s)} đi xem bạn bắt đúng một trận. Cả khán đài hô tên bạn kèm những từ không thể nhắc lại, và ${N(s)} ngồi im đến hết giờ.`, [
      C("Kể về những trận không ai chửi", { trust: { npc: s, delta: 0.15 }, rel: 1 }, "Gần nhau hơn, nỗi lo vẫn còn"),
      C("Giữ nghề tách hẳn khỏi gia đình", { trust: { npc: s, delta: -0.05 }, bw: 2, flags: ["ref_keeps_apart"] }, "Đỡ cho người nhà, bạn một mình với nghề"),
      C("Hứa sẽ cân nhắc treo còi", { promise: { to: s, what: "cân nhắc treo còi vì gia đình", years: 2 }, trust: { npc: s, delta: 0.2 } }, "Người nhà yên lòng, lời hứa phải giữ")], 0, { npc: s });
    return T("Một tấm vé khán đài lén mua", `${N(p!)} lén mua vé xem bạn bắt, ngồi giữa đám cổ động viên đang chửi bạn. Về nhà, ${N(p!)} chỉ hỏi: “Sao con chịu được?”`, [
      C("Kể vì sao bạn chọn nghề này", { trust: { npc: p!, delta: 0.2 }, bw: -1 }, "Một buổi tối dài, được hiểu thêm một chút"),
      C("Xin đừng đến sân nữa", { trust: { npc: p!, delta: -0.1 }, bw: 2, flags: ["ref_keeps_apart"] }, "Đỡ lo cho cả hai, xa nhau thêm một chút")], 0, { npc: p! });
  }),

  /* ============================ KỲ THỦ CỜ VUA (kyt_) ============================ */

  /* ---------- năng khiếu ---------- */
  talent(CH, "kyt_t_park", [8, 12], () => true, (c) => T("Các ông cụ đánh cờ", `${c.country === "VN" ? "Chiều nào cũng có mấy ông cụ đánh cờ vua dưới gốc bàng đầu ngõ." : "Chiều nào cũng có mấy ông cụ đánh cờ vua ở góc công viên gần nhà."} Bạn đứng xem suốt một tháng, không ai dạy, rồi một hôm thắng người giỏi nhất trong ba mươi nước. Ông ấy bày lại cả ván, rồi hỏi bố mẹ bạn ở đâu.`, [
    C("Xin bố mẹ cho vào câu lạc bộ cờ", { money: -0.02, flags: [talentFlag(CH)], counters: { talents_seen: 1 }, bw: -1 }, "Tốn tiền học, mở một con đường"),
    C("Ra đánh với các ông cho vui", { counters: { talents_seen: 1 }, happy: 3 }, "Vui, không ai thúc ép")], 0)),
  talent(CH, "kyt_t_puzzle", [10, 16], () => true, () => T("Bài cờ ở trang cuối báo", "Tờ báo cuối tuần có một mục đố cờ: trắng đi trước, chiếu hết sau ba nước. Bạn giải đúng mười hai tuần liền, gửi đáp án qua bưu điện, và có tên trong danh sách trúng thưởng. Cô giáo toán đọc tên bạn trước cả lớp.", [
    C("Xin vào đội tuyển cờ của trường", { flags: [talentFlag(CH)], counters: { talents_seen: 1 }, bw: -2, know: 2 }, "Bớt giờ chơi, có một đường riêng"),
    C("Giải tiếp cho vui, không thi thố", { counters: { talents_seen: 1 }, happy: 2, know: 1 }, "Nhẹ nhõm, tài năng ở yên trong trang báo")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CH, "kyt_d_youth", [8, 16], () => true, () => T("Giải cờ thiếu niên toàn quốc", "Bạn về thứ ba ở giải cờ thiếu niên toàn quốc, chỉ thua đúng một ván. Huấn luyện viên đội tuyển trẻ muốn nhận bạn, nhưng phải chuyển sang trường năng khiếu: sáng học văn hóa, chiều và tối là cờ.", [
    C("Chuyển trường, theo cờ", { ...become(CH), counters: { doors_seen: 1 }, money: -0.03, know: -2 }, "Ít giờ văn hóa, cả tuổi thơ là cờ"),
    C("Học kèm cuối tuần, giữ trường cũ", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(CH), log: "Thầy nhận bạn dù chỉ học cuối tuần. Ba năm sau, bạn có tên trong đội tuyển trẻ." }, lose: { happy: -2, log: "Thầy chỉ nhận học trò toàn thời gian. Bạn đánh cờ với máy tính một mình." } } }, "Giữ trường, chưa chắc được nhận"),
    C("Thôi, học cho xong đã", { counters: { doors_seen: 1 }, know: 2 })], 0)),
  door(CH, "kyt_d_hustle", [16, 25], () => true, (c) => T("Bàn cờ ăn tiền ngoài công viên", "Ở công viên có một bàn cờ chớp ăn tiền, mỗi ván năm phút. Bạn thắng người giỏi nhất ở đó bảy ván liền. Một người đàn ông đứng xem từ đầu ngỏ ý bao tiền cho bạn đi giải mở rộng ở thủ đô, đổi lại lấy một phần ba tiền thưởng của bạn trong ba năm.", [
    C("Nhận tài trợ, chia một phần ba", { ...become(CH), counters: { doors_seen: 1 }, flags: ["backer_deal"] }, "Có tiền đi giải, mất một phần mỗi lần thắng"),
    C("Tự bỏ tiền đi giải", { counters: { doors_seen: 1 }, money: c.age < 18 ? -0.04 : -0.12, gamble: { p: 0.4, win: { ...become(CH), log: "Bạn về nhì giải mở rộng. Liên đoàn gọi bạn vào đội tuyển dự bị." }, lose: { happy: -3, log: "Bạn hết tiền sau vòng thứ sáu, về nhà bằng xe khách đêm." } } }, "Giữ trọn tiền thưởng, tự gánh rủi ro"),
    C("Ở lại công viên, đánh ăn tiền vặt", { counters: { doors_seen: 1 }, money: 0.02, flags: ["park_hustler"] }, "Có tiền tiêu vặt, tài năng dừng ở đó")], 0)),
  door(CH, "kyt_d_stream", [15, 25], () => true, () => T("Ván cờ chớp lan trên mạng", "Đoạn phim bạn thí hậu rồi chiếu hết trong một ván cờ chớp ba phút được xem hai triệu lần. Một nền tảng cờ trực tuyến mời bạn làm người phát trực tiếp có lương. Huấn luyện viên của bạn nói cờ chớp sẽ làm hỏng cờ thật.", [
    C("Theo đường thi đấu chuyên nghiệp", { ...become(CH), counters: { doors_seen: 1 }, bw: -2 }, "Đường dài, ít người xem"),
    C("Nhận lời, làm người phát trực tiếp cờ", { custom: "become:streamer", counters: { doors_seen: 1 }, flags: ["chess_streamer"] }, "Nổi nhanh, xa dần ván cờ thật"),
    C("Đánh cho vui, không theo nghề nào", { counters: { doors_seen: 1 }, happy: 2 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(CH, 1, 1, (c) => T("Ván thứ bảy", "Giải có tính điểm xếp hạng đầu tiên của bạn: chín ván trong năm ngày, trong một nhà thi đấu ồn tiếng quạt trần. Ván thứ bảy, bạn đang hơn thế trước một đối thủ có điểm cao hơn bạn ba trăm. Người đó đề nghị hòa; một ván hòa là đủ để bạn có giải.", [
    C("Từ chối, đánh tiếp", { counters: step(c, CH), flags: ["plays_for_win"], gamble: { p: 0.5, win: { counters: { kyt_elo: 1 }, happy: 5, log: "Đối thủ xin thua ở nước năm mươi hai, rồi bắt tay bạn rất lâu." }, lose: { happy: -4, log: "Đồng hồ còn ba mươi giây, bạn đi nhầm một nước." } } }, "Có thể thắng lớn, có thể mất giải"),
    C("Nhận hòa, giữ suất có giải", { counters: step(c, CH), flags: ["safe_player"], money: 0.02, happy: 2 }, "Chắc ăn, không biết mình tới đâu")], 0)),
  beat(CH, 2, 3, (c) => { const kid = c.age < 18; return T(kid ? "Chuẩn kiện tướng đầu tiên" : "Chuẩn đại kiện tướng đầu tiên", `${kid ? "Bạn đạt chuẩn kiện tướng đầu tiên. Liên đoàn muốn đưa bạn vào chương trình tập trung: mỗi năm sáu tháng đi giải, học văn hóa qua mạng." : "Bạn đạt chuẩn đại kiện tướng đầu tiên. Một nhà tài trợ muốn trả lương để bạn đánh cờ toàn thời gian, với điều kiện bỏ hết mọi việc khác."}${f(c, "plays_for_win") ? " Giới cờ nhớ bạn là người không nhận hòa." : ""}`, [
    C("Dồn hết vào cờ", { counters: step(c, CH, { kyt_elo: 2, kyt_burn: 1 }), flags: ["all_in_chess"], know: -3 }, "Lên nhanh, không còn đường lùi"),
    C("Vừa học vừa đánh", { counters: step(c, CH, { kyt_elo: 1 }), bw: -6, flags: ["dual_track"], know: 3 }, "Chậm hơn, giữ được tấm bằng"),
    C("Lập nhóm tập với ba kỳ thủ cùng lứa", { counters: step(c, CH, { kyt_elo: 1 }), money: kid ? -0.03 : -0.08, rel: 3, flags: ["chess_crew"], agency: 0.02 }, "Lựa chọn thứ ba: tự học cùng nhau, rẻ, dựa vào bạn bè", { tier: "sovereign" })], 0); }),
  beat(CH, 3, 4, (c) => { const kid = c.age < 18; return T("Lời tố gian lận", `Bạn thắng một đối thủ có điểm xếp hạng hơn bạn bốn trăm. Tối đó, người ấy đăng lên mạng rằng các nước đi của bạn “giống máy tính quá mức”. Ban tổ chức mở cuộc điều tra, và phóng viên đến tận nhà.${f(c, "chess_crew") ? " Ba người bạn cùng nhóm tập lên tiếng bênh bạn ngay trong đêm." : ""}`, [
    C("Đồng ý kiểm tra, đánh lại dưới giám sát", { counters: step(c, CH), flags: ["cleared"], gamble: { p: 0.6, win: { counters: { kyt_elo: 1 }, log: "Bạn thắng lại trong phòng kín có hai giám sát. Người tố cáo im lặng." }, lose: { happy: -5, counters: { kyt_burn: 1 }, log: "Bạn thua ván đánh lại. Không ai kết luận bạn gian lận, nhưng cũng không ai xin lỗi." } } }, "Minh bạch, có thể thua trước cả giới cờ"),
    C("Kiện người tố cáo tội vu khống", { counters: step(c, CH, { kyt_burn: 1 }), money: kid ? -0.05 : -0.25, gamble: { p: 0.45, win: { flags: ["won_lawsuit"], money: kid ? 0.05 : 0.4, log: "Tòa buộc người ấy xin lỗi công khai và bồi thường." }, lose: { happy: -4, log: "Vụ kiện kéo dài hai năm rồi bị bác." } } }, "Đòi lại danh dự, tốn tiền và sức"),
    C("Bỏ cờ, quay về học tiếp", { counters: step(c, CH), ...leave(CH), flags: ["ex_chess"], know: 3, happy: -3 }, "Thoát ồn ào, bỏ lại mười năm tập")], 0); }),
  beat(CH, 4, 5, (c) => {
    const kid = c.age < 18; const elo = n(c, "kyt_elo"); const burn = n(c, "kyt_burn");
    if (elo >= 3 && burn < 3) return T("Ván cuối giải tuyển chọn", `Ván cuối của giải tuyển chọn người thách đấu ngôi vô địch thế giới. Hòa thì bạn đồng hạng nhất, phải đánh thêm loạt cờ nhanh; thắng thì bạn đi tiếp một mình; thua là hết.${f(c, "plays_for_win") ? " Mười mấy năm trước, ở giải đầu tiên, bạn đã từ chối một ván hòa." : f(c, "safe_player") ? " Mười mấy năm trước, ở giải đầu tiên, bạn đã nhận hòa để giữ giải." : ""}`, [
      C("Đánh để thắng", { counters: step(c, CH), gamble: { p: Math.min(0.6, 0.3 + 0.05 * elo), win: { income_mult: 1.8, flags: ["challenger"], happy: 8, log: "Đối thủ xin thua ở nước bốn mươi mốt. Bạn giành quyền thách đấu ngôi vô địch thế giới." }, lose: { income_mult: 0.9, happy: -6, counters: { kyt_burn: 1 }, log: "Bạn thí quân xe quá sớm. Đến tối, bạn vẫn ngồi trước bàn cờ trống." } } }, "Tất cả hoặc không"),
      C("Chơi chắc, cầm hòa, vào loạt cờ nhanh", { counters: step(c, CH), gamble: { p: 0.4, win: { income_mult: 1.6, flags: ["challenger"], log: "Loạt cờ nhanh kéo đến nửa đêm. Bạn thắng ván quyết định khi đồng hồ còn bốn giây." }, lose: { income_mult: 1.2, flags: ["solid_top"], log: "Bạn thua loạt cờ nhanh, nhưng vẫn ở trong nhóm mười người mạnh nhất thế giới." } } }, "Ít rủi ro hơn, đỉnh chưa chắc tới")], 0);
    return T("Hết thời thần đồng", `${c.age} tuổi, điểm xếp hạng của bạn đứng yên ba năm. Những đứa mười lăm tuổi tập với máy từ bé vượt bạn từng tháng. Tiền thưởng giải mở rộng không đủ trả tiền phòng khách sạn.${burn >= 3 ? " Đã lâu rồi bạn không còn thấy vui khi bày quân." : ""}`, [
      C("Mở lớp dạy cờ, thành huấn luyện viên", { counters: step(c, CH), unflags: [life(CH)], custom: "become:coach", flags: ["chess_teacher"] }, "Thu nhập ổn, khép giấc mơ vô địch"),
      C("Đánh thêm ba năm, cược lần cuối", { counters: step(c, CH, { kyt_elo: 1 }), money: kid ? -0.05 : -0.3, gamble: { p: 0.3, win: { flags: ["late_bloom"], income_mult: 1.4, log: "Ba năm sau, bạn có chuẩn cuối cùng, và một lời mời vào đội tuyển." }, lose: { happy: -5, counters: { kyt_burn: 1 }, log: "Ba năm, hai lần hụt chuẩn nửa điểm. Bạn bán bộ sách cờ để trả nợ." } } }, "Có thể muộn mà thành, có thể trắng tay"),
      C("Làm khóa học trực tuyến về lối khai cuộc của mình", { counters: step(c, CH), flags: ["chess_author"], income_mult: 1.2, bw: -5, agency: 0.02 }, "Tự làm chủ, rời xa bàn thi đấu", { tier: "sovereign" })], 0);
  }),
  beat(CH, 5, 6, (c) => T("Cô bé ở bàn thứ mười bốn", `Bạn đánh đồng loạt với ba mươi học sinh một trường tiểu học. Ở bàn thứ mười bốn, một cô bé chín tuổi đi một nước bạn không thấy trước, rồi ngẩng lên nhìn bạn. Cô giáo nói nhà em không đủ tiền cho em vào câu lạc bộ.${f(c, "challenger") ? " Hiệu trưởng giới thiệu bạn là người từng thách đấu ngôi vô địch thế giới." : f(c, "chess_author") ? " Trên bàn giáo viên có khóa học của bạn, in ra đóng thành tập." : ""}`, [
    C("Nhận em làm học trò, không lấy tiền", { counters: step(c, CH, { kind: 1 }), flags: ["chess_patron"], bw: -4, happy: 5 }, "Tốn sức nhiều năm, có một người nối nghiệp"),
    C("Lập quỹ học bổng cờ cho trẻ nghèo", { counters: step(c, CH), money: -0.3, rel: 4, flags: ["chess_fund"], agency: 0.02 }, "Tốn tiền, giúp được nhiều đứa hơn một", { tier: "sovereign" }),
    C("Tặng em bộ cờ và cuốn sách, rồi đi tiếp", { counters: step(c, CH), happy: 1 }, "Nhẹ gánh, không biết em sẽ ra sao")], 0), (c) => c.age >= 35),

  /* ---------- chuyện thường ngày ---------- */
  daily(CH, "kyt_engine", [12, 65], 10, (c) => T("Máy tính mạnh hơn mọi người", vary("kyte", c.age, [
    "Huấn luyện viên đưa bạn một tập giấy in dày: hai mươi lăm nước đầu của mọi khai cuộc, đều do máy tính chọn. Học thuộc thì thắng ở giải tới, nhưng bạn không hiểu vì sao những nước đó hay.",
    "Một phần mềm cờ mới thắng mọi kỳ thủ trên thế giới. Một phóng viên hỏi bạn: con người còn đánh cờ để làm gì?"]), [
    C("Học thuộc các biến của máy", { counters: { kyt_elo: 1, kyt_burn: 1 }, bw: -4 }, "Thắng ngay, chán dần ván cờ"),
    C("Tự mày mò, đánh theo cách của mình", { happy: 3, know: 3, flags: ["own_style"] }, "Chậm hơn, giữ được niềm vui")], 0)),
  daily(CH, "kyt_blitz", [14, 65], 10, (c) => T("Ván cờ chớp thứ bốn mươi", vary("kytb", c.age, [
    "Ba giờ sáng, bạn vẫn đánh cờ chớp trên mạng, ván thứ bốn mươi. Điểm cờ chớp tăng, mắt đỏ, sáng mai có ván cờ thật.",
    "Giải cờ chớp trên mạng có thưởng mỗi tuần. Bạn thắng đủ tiền ăn một tháng, nhưng ván cờ chậm của bạn ngày càng vội."]), [
    C("Đánh thêm, đang lên tay", { counters: { kyt_elo: 1 }, health: -3, bw: -3, money: c.age < 18 ? 0.01 : 0.03 }, "Lên tay cờ nhanh, cờ chậm trả giá"),
    C("Tắt máy đi ngủ", { health: 2, flags: ["sleep_rule"] }, "Giữ sức, lỡ một mạch thắng")], 1)),
  daily(CH, "kyt_mentor", [12, 30], 99, (c, N) => { const m = role(c, "mentor")!; const kid = c.age < 18; return T("Hai người thầy", `${N(m)} dạy bạn từ những ván đầu tiên, gần như không lấy tiền. Một huấn luyện viên nổi tiếng ở nước ngoài nhận dạy bạn qua mạng, với điều kiện bạn chỉ theo một thầy.`, [
    C("Theo thầy mới", { counters: { kyt_elo: 1 }, money: kid ? -0.05 : -0.15, memory: { npc: m, tag: "BETRAYED_PARTNERSHIP", weight: -0.2, note: "bỏ thầy cũ để theo thầy nước ngoài" } }, "Lên trình nhanh, mất một người thầy"),
    C("Ở lại với thầy cũ", { trust: { npc: m, delta: 0.2 }, memory: { npc: m, tag: "KEPT_PROMISE", weight: 0.2, note: "ở lại học khi có thầy nổi tiếng mời" } }, "Giữ nghĩa, có thể chững lại"),
    C("Xin cả hai thầy cùng ngồi một buổi", { gamble: { p: 0.4, win: { counters: { kyt_elo: 1 }, trust: { npc: m, delta: 0.2 }, log: `${N(m)} và thầy mới tranh luận hai giờ về một thế cờ. Từ đó bạn có hai người thầy.` }, lose: { log: "Thầy nước ngoài từ chối. Bạn vẫn còn thầy cũ." } } }, "Có thể giữ cả hai, có thể mất cơ hội", { tier: "awakened" })], 1, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(CH, "kyt_open", [14, 65], 10, (c) => { const kid = c.age < 18; return T("Giải mở rộng xa nhà", vary("kyto", c.age, [
    "Một giải mở rộng ở thành phố biển, giải nhất bằng nửa năm thu nhập. Vé đi lại, mười đêm khách sạn, lệ phí: tất cả bạn tự lo.",
    "Một giải cờ ở nước ngoài mời bạn, lo chỗ ở nhưng không lo vé. Đối thủ mạnh hơn, chuẩn danh hiệu dễ có hơn."]), [
    C("Đi", { money: kid ? -0.04 : -0.12, gamble: { p: 0.35, win: { money: kid ? 0.05 : 0.4, counters: { kyt_elo: 1 }, log: "Bạn về nhất, đánh ván cuối khi cả khán phòng đứng xem." }, lose: { counters: { kyt_burn: 1 }, log: "Bạn về thứ mười hai, tiền thưởng đủ mua một vé tàu." } } }, "Tốn tiền đi lại, có thể có chuẩn"),
    C("Ở nhà, tập cho giải sau", { know: 2, happy: -1 }, "Đỡ tốn, lỡ một cơ hội")], 1); }),
  daily(CH, "kyt_rival", [12, 65], 99, (c, N) => { const r = role(c, "rival")!; return T("Không bắt tay", `Bạn và ${N(r)} đã gặp nhau hai mươi lần trên bàn cờ. Lần này ${N(r)} thua, đứng dậy không bắt tay, rồi nói với phóng viên rằng bạn chỉ giỏi học thuộc máy.`, [
    C("Đáp trả trên mạng", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "đáp trả trên mạng sau ván cờ không bắt tay" }, happy: 2 }, "Hả giận, giới cờ có thêm chuyện để bàn"),
    C("Rủ người ấy phân tích lại ván cờ cùng nhau", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "ngồi phân tích ván cờ cùng nhau đến khuya" }, counters: { kyt_elo: 1 }, log: "Hai người ngồi đến khi phòng thi tắt đèn. Từ đó, hai bạn thành bạn tập của nhau." }, lose: { happy: -1, log: "Người ấy bỏ đi, không quay lại." } } }, "Có thể có một bạn tập, có thể bị bẽ mặt", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(CH, "kyt_team", [16, 65], 99, () => T("Danh sách đội tuyển", "Liên đoàn công bố đội tuyển dự giải đồng đội thế giới. Bạn có điểm xếp hạng cao thứ ba nước nhưng không có tên; người được chọn là con của một thành viên ban điều hành.", [
    C("Lên tiếng trên báo", { gamble: { p: 0.4, win: { flags: ["national_team"], counters: { kyt_elo: 1 }, log: "Liên đoàn sửa danh sách sau một tuần ồn ào." }, lose: { flags: ["federation_enemy"], happy: -3, log: "Danh sách giữ nguyên. Từ đó, bạn ít được mời các giải trong nước." } } }, "Có thể có suất, có thể bị gạch tên lâu dài"),
    C("Im lặng, chờ năm sau", { happy: -3, counters: { kyt_burn: 1 } }, "Yên ổn, nuốt một nỗi ấm ức"),
    C("Đề xuất chọn đội theo điểm xếp hạng công khai", { flags: ["open_selection"], agency: 0.02, bw: -3, gamble: { p: 0.5, win: { flags: ["national_team"], log: "Quy chế mới được thông qua cho kỳ sau, và bạn có tên trong đội tuyển năm ấy." }, lose: { log: "Đề xuất được ghi nhận, rồi nằm trong ngăn kéo." } } }, "Lựa chọn thứ ba: đổi luật cho mọi người, chậm", { tier: "sovereign" })], 0)),
  daily(CH, "kyt_quit", [18, 65], 99, () => T("Chức vô địch bằng nửa tháng lương", "Bạn vô địch một giải quốc gia; tiền thưởng bằng nửa tháng lương của người bạn cùng lớp giờ làm ngân hàng. Một công ty phân tích dữ liệu mời bạn về làm, vì “người đánh cờ giỏi thường giỏi nhìn số”.", [
    C("Nhận việc, cất bàn cờ", { ...leave(CH), flags: ["ex_chess"], happy: -1 }, "Lương ổn định, khép lại một tuổi thơ"),
    C("Làm bán thời gian, vẫn đánh giải", { money: 0.15, bw: -4, counters: { kyt_elo: -1 } }, "Có tiền, cờ chững lại"),
    C("Từ chối, sống bằng cờ", { happy: 2, money: -0.05, counters: { kyt_elo: 1 } }, "Trọn vẹn với cờ, túi tiền mỏng")], 1), (c) => c.happy < 50 || c.broke),
  daily(CH, "kyt_nerves", [10, 65], 10, (c) => T("Tay run khi đồng hồ chạy", vary("kytn", c.age, [
    "Ván nào cũng vậy: khi đồng hồ còn năm phút, tay bạn run đến mức suýt làm đổ quân.",
    "Đêm trước ván quan trọng, bạn nằm nhìn trần nhà đến bốn giờ sáng, trong đầu chạy các biến cờ."]), [
    C("Gặp chuyên gia tâm lý thể thao", { money: c.age < 18 ? -0.03 : -0.06, counters: { kyt_burn: -1 }, happy: 2 }, "Tốn tiền, đầu nhẹ hơn"),
    C("Tập thở và chạy bộ mỗi sáng", { counters: { exercise: 2 }, health: 2, bw: -1 }, "Tốn công mỗi ngày, chậm thấy kết quả"),
    C("Mặc kệ, ván nào hay ván đó", { counters: { kyt_burn: 1 } }, "Không tốn gì, nỗi sợ ở lại")], 1)),
  daily(CH, "kyt_school", [8, 17], 99, () => T("Giải đấu trùng tuần thi", "Giải vô địch trẻ quốc gia rơi đúng vào tuần thi học kỳ. Cô chủ nhiệm nói không có chuyện thi bù cho “việc chơi”.", [
    C("Đi đánh giải", { counters: { kyt_elo: 1 }, know: -3, flags: ["missed_exam"] }, "Có giải, điểm học bạ tụt"),
    C("Ở lại thi", { know: 2, happy: -3 }, "Giữ điểm, lỡ một mùa giải"),
    C("Mang giấy triệu tập lên gặp hiệu trưởng", { gamble: { p: 0.6, win: { counters: { kyt_elo: 1 }, log: "Hiệu trưởng cho thi bù. Từ đó, cô chủ nhiệm gọi bạn là “nhà vô địch” mỗi lần điểm danh." }, lose: { happy: -3, log: "Hiệu trưởng từ chối. Bạn ở lại thi, đầu óc để cả ở giải đấu." } } }, "Có thể giữ cả hai, có thể làm phật lòng cô", { tier: "awakened" })], 1)),
  daily(CH, "kyt_body", [16, 65], 10, (c) => T("Ván cờ bảy giờ đồng hồ", vary("kytbd", c.age, [
    "Ván dài nhất của bạn kéo dài bảy giờ. Đến nước thứ chín mươi, bạn mệt đến mức không nhìn ra một nước chiếu hết đơn giản.",
    "Bác sĩ nói lưng bạn như lưng người năm mươi tuổi, và bạn sụt bốn cân sau một giải."]), [
    C("Tập thể lực như vận động viên", { health: 4, counters: { exercise: 2, kyt_elo: 1 }, bw: -2, money: c.age < 18 ? -0.02 : -0.04 }, "Tốn thời gian và tiền, ván dài khỏe hơn"),
    C("Dành hết giờ cho bàn cờ", { health: -3, counters: { kyt_elo: 1, kyt_burn: 1 } }, "Thêm giờ tập, cơ thể kiệt dần")], 0)),

  /* ---------- gia đình ---------- */
  cross(CH, "kyt_family", [12, 65], (c) => (c.age >= 30 && c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if ((c.age >= 30 && c.kids_teen > 0 && k) || !p) { const kk = k!; return T(`${N(kk)} cất bàn cờ vào gầm giường`, `Bạn dạy ${N(kk)} đánh cờ từ năm sáu tuổi. Năm nay, ${N(kk)} cất bàn cờ vào gầm giường và nói thẳng: không muốn sống cả đời trước sáu mươi tư ô vuông như bạn.`, [
      C("Để con bỏ cờ, tìm thứ của riêng con", { trust: { npc: kk, delta: 0.25 }, happy: -2 }, "Mất một người nối nghiệp, được một đứa con"),
      C("Bắt con đánh hết giải năm nay", { trust: { npc: kk, delta: -0.25 }, flags: ["pushed_kid_chess"] }, "Giữ kỷ luật, con xa bạn hơn"),
      C("Hỏi con thích gì, rồi đi xem cùng con", { trust: { npc: kk, delta: 0.2 }, promise: { to: kk, what: "đi cùng con theo điều con thích", years: 2 }, bw: -2 }, "Tốn thời gian, học lại cách làm cha mẹ", { tier: "awakened" })], 2, { npc: kk }); }
    const kid = c.age < 18;
    return T("Khoản tiền cho chuyến đi giải", `Để bạn đi ${c.age < 21 ? "giải trẻ thế giới" : "giải mở rộng đầu tiên ở nước ngoài"}, ${N(p)} ${c.country === "VN" ? "bán chiếc xe máy vẫn đi làm mỗi ngày" : "rút hết khoản tiết kiệm của nhà"}. Trước ngày đi, ${N(p)} chỉ nói: “Đánh cho bằng được.”`, [
      C("Hứa sẽ mang huy chương về", { promise: { to: p, what: "mang huy chương giải cờ về cho gia đình", years: 1 }, trust: { npc: p, delta: 0.1 }, counters: { kyt_burn: 1 } }, "Có động lực, mang thêm gánh nặng lên đường"),
      C("Từ chối khoản tiền, tự lo chuyến đi", { trust: { npc: p, delta: 0.2 }, money: kid ? -0.05 : -0.15, bw: -3 }, "Nhà nhẹ gánh, bạn gánh thêm"),
      C("Đi, và nói rằng thắng thua không phải để trả nợ", { trust: { npc: p, delta: 0.05 }, happy: 2, flags: ["plays_free"] }, "Nhẹ đầu khi đánh, người nhà có thể chạnh lòng", { tier: "awakened" })], 0, { npc: p });
  }),

  /* ============================ VẬN ĐỘNG VIÊN LEO NÚI (lnu_) ============================ */

  /* ---------- năng khiếu ---------- */
  talent(CL, "lnu_t_wall", [8, 16], () => true, () => T("Bức tường leo ở hội chợ", "Hội chợ cuối năm của trường dựng một bức tường leo bằng gỗ cao tám mét, có dây an toàn. Bạn lên đến đỉnh trong mười hai giây, nhanh hơn cả thầy thể dục, rồi xin leo thêm năm lần nữa. Người phụ trách bức tường đưa bạn tờ rơi của một câu lạc bộ leo núi.", [
    C("Xin bố mẹ cho đi tập ở câu lạc bộ", { money: -0.02, flags: [talentFlag(CL)], counters: { talents_seen: 1 }, health: 2 }, "Tốn tiền, có một nơi để leo"),
    C("Cất tờ rơi đi", { counters: { talents_seen: 1 }, happy: 1 }, "Không tốn gì, đôi tay còn ngứa ngáy")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CL, "lnu_d_gym", [18, 35], () => true, () => T("Phòng leo trong nhà kho cũ", "Một phòng leo núi trong nhà mở ra trong nhà kho cũ gần chỗ bạn làm. Sau ba tháng, chủ phòng tập rủ bạn thi giải leo vách quốc gia và tập theo giáo án của đội tuyển: sáu buổi một tuần, không lương.", [
    C("Bỏ việc, tập toàn thời gian", { ...become(CL), counters: { doors_seen: 1 }, money: -0.15, health: 3 }, "Hết lương, có một con đường"),
    C("Thi thử, vẫn giữ việc", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(CL), log: "Bạn vào chung kết. Một nhà tài trợ nhỏ đề nghị trả tiền phòng tập cho bạn." }, lose: { happy: -2, log: "Bạn rơi ở bám thứ năm vòng loại, tay còn run vì ca làm đêm trước." } } }, "Giữ việc, sức chia đôi"),
    C("Leo cho vui sau giờ làm", { counters: { doors_seen: 1, exercise: 2 }, happy: 3 }, "Khỏe người, không đổi đời")], 0)),
  door(CL, "lnu_d_expedition", [20, 40], () => true, () => T("Đoàn thám hiểm thiếu một người", "Một đoàn leo đỉnh hơn bảy nghìn mét thiếu một thành viên vì có người rút vào phút chót. Họ cần người khỏe, chịu lạnh, đi được ba tháng. Không lương, chỉ được lo ăn ở và vé đi lại.", [
    C("Xin nghỉ việc, đi", { ...become(CL), counters: { doors_seen: 1 }, money: -0.2, rel: -2 }, "Mất ba tháng lương, có thể không quay lại như cũ"),
    C("Từ chối, hẹn đoàn lần sau", { counters: { doors_seen: 1 }, happy: -2, flags: ["missed_expedition"] }, "Giữ việc, tự hỏi mãi nếu đã đi")], 0)),
  door(CL, "lnu_d_porter", [18, 40], (c) => c.poor_country || c.farmer, (c) => { const vn = c.country === "VN"; return T("Gùi hàng cho đoàn leo núi", `${vn ? "Bản của bạn ở chân dãy núi cao nhất vùng." : "Làng của bạn nằm dưới chân một dãy núi tuyết."} Mỗi mùa, các đoàn leo núi từ xa đến thuê người gùi hàng lên trại: hai mươi lăm cân mỗi chuyến, cả mùa bằng ba tháng làm ruộng. Người già trong ${vn ? "bản" : "làng"} nói núi cho tiền, núi cũng lấy người.`, [
    C("Đi gùi hàng mùa này", { ...become(CL), counters: { doors_seen: 1 }, money: 0.2, health: -3, flags: ["porter_start"] }, "Tiền khá, hiểm nguy thật"),
    C("Ở nhà làm ruộng", { counters: { doors_seen: 1 }, rel: 1 }, "An toàn, nghèo như cũ")], 0); }),

  /* ---------- mạch truyện ---------- */
  beat(CL, 1, 1, (c, N) => { const fr = role(c, "childhood_friend"); const who = fr ? N(fr) : "người cùng dây"; return T("Tám mươi mét cuối", `Hai giờ chiều, còn tám mươi mét nữa đến đỉnh. Mây đen dồn lên từ thung lũng phía tây, và ${who} muốn đi tiếp: “Lên rồi xuống nhanh, kịp mà.”${f(c, "porter_start") ? " Mấy mùa gùi hàng đã dạy bạn đọc mây trên núi." : ""}`, [
    C("Quay xuống ngay", { counters: step(c, CL), flags: ["turns_back"], happy: -2, ...(fr ? { trust: { npc: fr, delta: -0.05 } } : {}) }, "An toàn, mất đỉnh đầu tiên"),
    C("Lên tiếp", { counters: step(c, CL, { lnu_risk: 1 }), flags: ["summit_fever"], gamble: { p: 0.6, win: { counters: { lnu_peaks: 1 }, happy: 6, log: "Hai người lên đỉnh lúc trời vừa tắt nắng, xuống bằng đèn đội đầu." }, lose: { health: -6, log: "Mưa đá ập đến khi còn bốn mươi mét. Đêm ấy hai người ngồi co ro dưới một mỏm đá, sáng mới xuống được." } } }, "Có đỉnh, hoặc một đêm ngoài trời")], 0, fr ? { npc: fr } : {}); }, adult),
  beat(CL, 2, 3, (c) => T("Hợp đồng có in logo", `Một hãng đồ dã ngoại muốn tài trợ cho bạn lên một đỉnh tám nghìn mét. Đổi lại, mỗi ngày bạn đăng ảnh từ núi, và nếu quay đầu trước đỉnh mà không có lý do y tế, bạn trả lại một nửa tiền.${f(c, "turns_back") ? " Họ biết chuyện bạn từng quay xuống ở tám mươi mét cuối, và coi đó là điểm yếu." : f(c, "summit_fever") ? " Họ thích câu chuyện bạn đi tiếp khi trời đã chuyển." : ""}`, [
    C("Ký, leo dưới logo nhà tài trợ", { counters: step(c, CL), income_mult: 1.6, flags: ["sponsored_climb"] }, "Có tiền đi núi lớn, bị đặt chỉ tiêu lên đỉnh"),
    C("Tự gom tiền, leo nhóm nhỏ không bình dưỡng khí", { counters: step(c, CL, { lnu_risk: 1 }), money: -0.4, flags: ["alpine_style"], agency: 0.01 }, "Tự do, nghèo hơn, nguy hơn"),
    C("Đòi bỏ điều khoản phạt quay đầu", { counters: step(c, CL), gamble: { p: 0.45, win: { income_mult: 1.4, flags: ["sponsored_climb", "free_to_turn"], log: "Họ đồng ý. Lần đầu tiên hợp đồng của họ có câu: “Quyết định quay đầu thuộc về người leo.”" }, lose: { log: "Họ chọn một người leo khác. Bạn vẫn còn đôi giày cũ." } } }, "Lựa chọn thứ ba: giữ quyền sống, có thể mất tài trợ", { tier: "sovereign" })], 0), adult),
  beat(CL, 3, 4, (c) => {
    const penalty = f(c, "sponsored_climb") && !f(c, "free_to_turn"); const alpine = f(c, "alpine_style");
    return T("Người ngồi gục bên dây cố định", `Tám giờ sáng ngày lên đỉnh, ở độ cao tám nghìn mét, còn ba trăm mét nữa. Một người leo của đoàn khác ngồi gục bên dây cố định, nói không ra lời; đoàn của người ấy đã đi trước. Đưa người ấy xuống nghĩa là bỏ đỉnh.${penalty ? " Hợp đồng ghi rõ: không lên đỉnh, trả lại một nửa tiền tài trợ." : alpine ? " Bạn không mang bình dưỡng khí nào để chia." : ""}`, [
      C("Bỏ đỉnh, đưa người đó xuống", { counters: step(c, CL), ...(penalty ? { money: -0.5 } : {}), gamble: { p: 0.5, win: { happy: 6, rel: 3, flags: ["rescuer", "saved_climber"], log: "Người ấy sống. Ba năm sau, bạn nhận được tấm ảnh chụp cả gia đình họ." }, lose: { happy: -8, flags: ["rescuer"], log: "Bạn đưa người ấy xuống được hai trăm mét. Đến trại bốn, người ấy không qua khỏi." } } }, penalty ? "Mất đỉnh, mất nửa tiền tài trợ, có thể cứu một mạng" : "Mất đỉnh, có thể cứu được một mạng"),
      C("Gọi bộ đàm báo trại dưới, đi tiếp", { counters: step(c, CL, { lnu_peaks: 2 }), flags: ["passed_by"], happy: -4, income_mult: 1.1 }, "Có đỉnh, mang theo một hình ảnh cả đời"),
      C(alpine ? "Ngồi lại giữ ấm cho người ấy, chờ cứu hộ" : "Chia bình dưỡng khí, ngồi chờ cứu hộ", { counters: step(c, CL, { lnu_risk: 1 }), health: -4, gamble: { p: 0.55, win: { flags: ["rescuer", "saved_climber"], log: "Đội cứu hộ lên đến nơi sau ba giờ. Cả hai cùng xuống." }, lose: { health: -6, counters: { lnu_risk: 1 }, log: "Đội cứu hộ không lên được. Bạn xuống một mình khi trời đã quá trưa, hai bàn chân tê dại." } } }, "Không bỏ ai, đặt chính mình vào vòng nguy hiểm", { tier: "awakened" })], 0);
  }, adult),
  beat(CL, 4, 5, (c) => {
    const risk = n(c, "lnu_risk");
    if (risk >= 3 || (f(c, "alpine_style") && risk >= 2)) return T("Ba đốt ngón tay", `Sau chuyến leo mùa trước, bạn mất ba đốt ngón tay vì tê cóng. ${f(c, "sponsored_climb") ? "Nhà tài trợ lặng lẽ không gia hạn hợp đồng." : "Tiền dành dụm đã hết sau ca mổ."} Một công ty du lịch mời bạn dẫn khách lên những đỉnh dễ, còn ở phòng tập cũ, một cậu bé mất bàn tay từ nhỏ hỏi bạn có dạy leo không.`, [
      C("Nhận dẫn khách, thành người dẫn đường", { counters: step(c, CL), unflags: [life(CL)], custom: "become:tour_guide", flags: ["mountain_guide"] }, "Thu nhập đều, thôi săn đỉnh"),
      C("Tập lại, leo tiếp với bảy ngón", { counters: step(c, CL, { lnu_risk: 1 }), health: -3, gamble: { p: 0.4, win: { counters: { lnu_peaks: 1 }, happy: 8, flags: ["comeback_climb"], log: "Hai năm sau, bạn đứng trên đỉnh với đôi găng khâu lại cho vừa tay." }, lose: { happy: -6, money: -0.2, log: "Bạn phải quay đầu ở trại hai. Bàn tay không còn bám nổi đá lạnh." } } }, "Không bỏ cuộc, có thể mất thêm"),
      C("Mở lớp leo cho người khuyết tật", { counters: step(c, CL, { kind: 1 }), money: -0.15, rel: 5, agency: 0.03, flags: ["adaptive_climbing"] }, "Ít tiền, một cách khác để ở lại với đá", { tier: "sovereign" })], 0);
    return T("Tuyến đường chưa có tên", `Bạn và đoàn vừa mở một tuyến đường mới lên một bức vách chưa ai leo. Người dẫn đường địa phương đi đầu dây gần nửa chặng khó nhất. Nhà tài trợ muốn thông cáo báo chí chỉ có tên bạn.${f(c, "porter_start") ? " Hơn mười năm trước, chính bạn là người gùi hàng không ai ghi tên." : f(c, "fair_pay") ? " Trong đoàn, chỉ bạn biết tên các con của anh ấy." : ""}`, [
      C("Ghi tên người dẫn đường lên tuyến đường", { counters: step(c, CL, { lnu_peaks: 1 }), flags: ["shared_credit"], rel: 4, income_mult: 1.1 }, "Công bằng, nhà tài trợ không vui"),
      C("Để nhà tài trợ viết thông cáo", { counters: step(c, CL, { lnu_peaks: 1 }), income_mult: 1.5, flags: ["solo_credit"] }, "Tên bạn lên báo một mình"),
      C("Lấy tiền thưởng lập quỹ bảo hiểm cho người gùi hàng", { counters: step(c, CL), money: -0.3, flags: ["porter_fund", "shared_credit"], agency: 0.03, rel: 5 }, "Lựa chọn thứ ba: mất tiền thưởng, đổi luật của núi", { tier: "sovereign" })], 0);
  }, adult),
  beat(CL, 5, 6, (c) => T("Hàng người trên sườn núi", `Ngọn núi lớn đầu tiên của bạn giờ đông như chợ: khách xếp hàng ở dây cố định, rác chất đống ở các trại. Chính quyền địa phương mời bạn vào hội đồng xét cấp phép leo; các công ty du lịch, trong đó có bạn cũ của bạn, muốn cấp càng nhiều càng tốt.${f(c, "porter_fund") ? " Quỹ bảo hiểm cho người gùi hàng bạn lập năm nào nay đã có hơn ba trăm người." : f(c, "saved_climber") ? " Người bạn đưa xuống năm nào vẫn gửi thiệp cho bạn mỗi năm." : ""}`, [
    C("Bỏ phiếu giới hạn số giấy phép", { counters: step(c, CL), flags: ["permit_cap"], income_mult: 0.85, agency: 0.02, rel: -2 }, "Đúng cho núi, mất lòng giới làm tour", { tier: "awakened" }),
    C("Dẫn một đoàn dọn rác, không lấy tiền", { counters: step(c, CL, { kind: 1 }), health: -3, rel: 4, flags: ["mountain_cleanup"] }, "Tốn sức, núi sạch hơn một mùa"),
    C("Mở công ty dẫn khách leo núi", { counters: step(c, CL), income_mult: 1.4, flags: ["guide_company"] }, "Tiền đều, góp thêm vào hàng người")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(CL, "lnu_window", [18, 65], 10, (c) => T("Cửa sổ thời tiết", vary("lnuw", c.age, [
    "Dự báo cho một cửa sổ thời tiết ba mươi sáu giờ, rồi bão kéo dài hai tuần. Mười hai đoàn ở trại chính cùng chuẩn bị xuất phát.",
    "Gió trên đỉnh dự báo sáu mươi cây số một giờ, giảm dần sau nửa đêm. Đoàn của bạn đã đợi ở trại chính mười chín ngày."]), [
    C("Xuất phát ngay", { counters: { lnu_risk: 1 }, gamble: { p: 0.6, win: { counters: { lnu_peaks: 1 }, happy: 5, log: "Bạn lên đỉnh trước khi gió đổi chiều." }, lose: { health: -5, log: "Gió đến sớm hơn dự báo. Bạn quay đầu ở độ cao bảy nghìn rưỡi." } } }, "Có thể có đỉnh, có thể trả giá bằng cơ thể"),
    C("Chờ cửa sổ sau", { money: -0.05, happy: -2, flags: ["patient_climber"] }, "Tốn thêm tiền trại, giữ được người")], 1)),
  daily(CL, "lnu_fake", [18, 65], 99, (c, N) => { const r = role(c, "rival")!; return T("Tấm ảnh trời xanh", `${N(r)} công bố đã lên đỉnh một ngọn núi khó, kèm một tấm ảnh. Hôm đó bạn ở trại bên dưới, và nhớ rõ trời mù đến chiều; trong ảnh, trời xanh ngắt.`, [
    C("Công khai điều bạn thấy", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bị nghi ngờ công khai về tấm ảnh lên đỉnh" }, gamble: { p: 0.5, win: { rel: 3, log: "Hội đồng kiểm chứng kết luận ảnh chụp vào một ngày khác. Thành tích bị gạch." }, lose: { happy: -4, rel: -2, log: "Không đủ bằng chứng. Người ta nói bạn ghen tị." } } }, "Bảo vệ sự thật, có thể bị coi là ghen ăn tức ở"),
    C("Nói riêng với người ấy", { gamble: { p: 0.4, win: { memory: { npc: r, tag: "STOOD_UP_FOR_ME", weight: 0.2, note: "nói riêng thay vì bêu riếu chuyện tấm ảnh" }, log: "Người ấy tự rút lại tuyên bố, nói là “nhầm ngày”." }, lose: { log: "Người ấy cười, rồi chặn số bạn." } } }, "Cho một lối thoát, có thể bị lờ đi", { tier: "awakened" }),
    C("Im lặng", { happy: -2, counters: { honest: -1 } }, "Yên chuyện, một thành tích giả đứng đó")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(CL, "lnu_porter_pay", [18, 65], 10, (c) => T("Tiền công người gùi hàng", vary("lnup", c.age, [
    "Một người gùi hàng cho đoàn bạn, mỗi ngày mang hai mươi lăm cân, xin tăng tiền công. Tiền công cả mùa của anh ấy ít hơn giá đôi giày bạn đang đi.",
    "Một người gùi hàng bị ngã gãy tay giữa mùa. Công ty du lịch nói anh ấy không có bảo hiểm, “tự chịu”."]), [
    C("Bù thêm bằng tiền túi", { money: -0.06, rel: 2, counters: { kind: 1 }, flags: ["fair_pay"] }, "Tốn tiền, người ta nhớ bạn"),
    C("Giữ đúng mức chung của trại", { happy: -1 }, "Không phá lệ, lương tâm không yên"),
    C("Kêu gọi cả trại góp quỹ cho người gùi hàng", { flags: ["fair_pay"], rel: 3, bw: -2, gamble: { p: 0.6, win: { log: "Mười hai người góp. Lần đầu tiên có một bảng tiền công dán ở trại chính." }, lose: { money: -0.04, log: "Chỉ hai người góp. Bạn bù phần còn lại." } } }, "Có thể đổi lệ cả trại, mất lòng vài người", { tier: "awakened" })], 0)),
  daily(CL, "lnu_lungs", [20, 65], 10, (c) => T("Dấu vết của độ cao", vary("lnul", c.age, [
    "Bác sĩ đọc phim chụp sau mùa leo: phổi bạn có dấu hiệu phù do độ cao, lần thứ hai.",
    "Sau chuyến leo, bạn quên tên một người bạn cũ suốt một tuần. Bác sĩ nói đó là dấu vết của những đêm ngủ trên tám nghìn mét."]), [
    C("Nghỉ một mùa", { health: 5, income_mult: 0.9, counters: { lnu_risk: -1 } }, "Mất một mùa, giữ được đầu óc"),
    C("Leo tiếp, uống thuốc phòng", { health: -4, counters: { lnu_risk: 1, lnu_peaks: 1 } }, "Thêm một đỉnh, thêm một vết")], 0)),
  daily(CL, "lnu_recovery", [20, 65], 99, () => T("Chiếc máy ảnh trên núi", "Một người leo núi cùng thời với bạn mất trên núi mùa trước. Gia đình nhờ bạn mùa sau lên tìm chiếc máy ảnh anh ấy mang theo, “để biết những ngày cuối anh ấy đã nhìn thấy gì”.", [
    C("Nhận lời, mùa sau lên tìm", { counters: { lnu_risk: 1 }, flags: ["recovery_trip"], rel: 3, gamble: { p: 0.4, win: { happy: 4, log: "Bạn tìm thấy chiếc máy ảnh dưới một lớp tuyết mỏng. Tấm ảnh cuối là bình minh." }, lose: { happy: -3, log: "Bạn tìm ba ngày, không thấy gì ngoài gió." } } }, "Có thể mang về một lời đáp, liều thêm một chuyến"),
    C("Nói thật rằng chuyến đi quá nguy hiểm", { happy: -3, counters: { honest: 1 } }, "Giữ an toàn, một gia đình buồn thêm")], 0)),
  daily(CL, "lnu_client", [22, 65], 10, (c) => T("Khách hàng trả gấp ba", vary("lnuc", c.age, [
    "Một doanh nhân trả gấp ba để bạn dẫn ông lên một đỉnh bảy nghìn mét. Ông chưa từng leo quá ba nghìn.",
    "Một người nổi tiếng trên mạng muốn bạn dẫn lên đỉnh trong mười ngày, kèm quay phim, trả bằng nửa năm thu nhập của bạn."]), [
    C("Nhận, dẫn theo yêu cầu", { money: 0.3, counters: { lnu_risk: 1 }, gamble: { p: 0.7, win: { log: "Khách lên đỉnh, chụp ảnh, và không bao giờ hiểu mình đã gặp may thế nào." }, lose: { health: -4, happy: -5, log: "Khách kiệt sức ở trại ba. Bạn mất hai ngày đưa khách xuống." } } }, "Tiền lớn, mạng người trong tay bạn"),
    C("Từ chối", { happy: 1, flags: ["picky_guide"] }, "Yên tâm, mất một mùa thu nhập"),
    C("Nhận, kèm điều khoản quay đầu do bạn quyết", { money: 0.2, flags: ["turnaround_clause"] }, "Ít tiền hơn, giữ quyền nói không", { tier: "sovereign" })], 0)),
  daily(CL, "lnu_permit", [18, 65], 99, (c, N) => { const o = role(c, "official")!; return T("Còn thiếu một chữ ký", `Đoàn của bạn đến văn phòng cấp phép thì ${N(o)} nói hồ sơ “còn thiếu một chữ ký”, và chữ ký đó cần “một chút chi phí”. Cửa sổ thời tiết còn bốn ngày.`, [
    C("Đưa tiền cho xong", { money: -0.08, secret: { tag: "PAID_BRIBE", severity: 0.2, fuse_years: [2, 8], note: "đưa tiền để lấy giấy phép leo núi" } }, "Kịp cửa sổ, mang theo một bí mật"),
    C("Chờ đủ thủ tục", { happy: -3, money: -0.05, counters: { honest: 1 } }, "Đúng luật, có thể lỡ mùa"),
    C("Gửi đơn lên cấp trên, công khai chuyện này", { agency: 0.02, gamble: { p: 0.4, win: { memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.2, note: "bị tố đòi tiền cấp phép leo núi" }, flags: ["exposed_permit"], log: "Văn phòng cấp phép niêm yết lệ phí trên tường. Đoàn bạn đi kịp." }, lose: { memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.3, note: "bị tố đòi tiền cấp phép leo núi" }, happy: -3, log: "Hồ sơ của đoàn bạn “thất lạc” đến hết mùa." } } }, "Lựa chọn thứ ba: đổi lệ cho mọi đoàn, có thể lỡ mùa", { tier: "sovereign" })], 1, { npc: o }); }, (c) => !!role(c, "official")),
  daily(CL, "lnu_film", [20, 65], 99, () => T("Đoàn làm phim tài liệu", "Một đoàn làm phim tài liệu muốn theo bạn cả mùa leo. Đạo diễn nói thẳng: phim cần “khoảnh khắc”, và khoảnh khắc thường đến khi người ta liều hơn bình thường.", [
    C("Nhận, cho quay mọi thứ", { income_mult: 1.15, counters: { lnu_risk: 1 }, flags: ["on_film"] }, "Có tiền và tiếng, máy quay đẩy bạn đi xa hơn"),
    C("Từ chối", { happy: 1, bw: 1 }, "Yên tĩnh, không ai biết bạn đã leo những gì"),
    C("Nhận, với điều kiện được duyệt bản cuối", { gamble: { p: 0.5, win: { income_mult: 1.1, flags: ["on_film"], log: "Phim ra không có cảnh nào bạn không muốn. Nhiều người nói nó chậm; vài người nói nó thật." }, lose: { log: "Đạo diễn rút lui, đi tìm một người leo khác." } } }, "Giữ quyền với câu chuyện, có thể mất phim", { tier: "awakened" })], 2)),
  daily(CL, "lnu_teach", [20, 65], 10, (c) => T("Lớp leo cho trẻ con", vary("lnug", c.age, [
    "Phòng leo trong thành phố mời bạn dạy lớp thiếu nhi năm buổi một tuần. Lương đều, nhưng bạn sẽ phải bỏ mùa leo mùa thu.",
    "Một trường học cần huấn luyện viên leo vách cho đội học sinh, hợp đồng một năm, không được nghỉ dài ngày."]), [
    C("Nhận dạy", { income_mult: 1.1, happy: 2, flags: ["climb_teacher"] }, "Thu nhập đều, mất một mùa núi"),
    C("Từ chối, giữ mùa leo", { counters: { lnu_peaks: 1 }, money: -0.05 }, "Thêm một đỉnh, ví mỏng thêm")], 0)),
  daily(CL, "lnu_quit", [22, 65], 99, (c) => T("Lời mời quản lý kho hàng", `${c.age} tuổi, bạn chưa có bảo hiểm, chưa có nhà, tài khoản còn đủ tiền cho đúng một chuyến leo. Một người bạn mời về làm quản lý kho hàng: lương cố định, mười hai ngày phép một năm.`, [
    C("Nhận việc, treo dây leo lên tường", { ...leave(CL), flags: ["ex_climber"], happy: -2 }, "Ổn định, núi chỉ còn trong ảnh"),
    C("Leo tiếp, sống tằn tiện", { happy: 2, counters: { lnu_peaks: 1 }, money: -0.05 }, "Còn núi, túi càng nhẹ")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(CL, "lnu_family", [22, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn lên trại chính`, `${N(k)} xem hết ảnh của bạn và xin đi cùng chuyến tới, “ít nhất là đến trại chính”. ${N(k)} chưa từng ngủ một đêm nào ở nơi cao quá hai nghìn mét.`, [
      C("Hứa đưa con đi khi con đủ mười tám", { promise: { to: k, what: "đưa con lên trại chính khi con đủ mười tám", years: 4 }, trust: { npc: k, delta: 0.1 } }, "Con chờ được, lời hứa phải giữ"),
      C("Dẫn con leo một đỉnh thấp gần nhà", { trust: { npc: k, delta: 0.25 }, money: -0.03, happy: 3 }, "Một ngày đẹp, con có thể muốn nhiều hơn"),
      C("Từ chối, kể con nghe về những người không về", { trust: { npc: k, delta: -0.1 }, flags: ["told_kid_truth"] }, "Con hiểu núi hơn, có thể giận bạn")], 0, { npc: k });
    if (s) return T("Chuyến cuối cùng?", `Trước mỗi mùa leo, ${N(s)} lại mất ngủ hai tuần. Lần này ${N(s)} hỏi thẳng: “Đây có phải chuyến cuối không?”`, [
      C("Hứa đây là chuyến núi cao cuối cùng", { promise: { to: s, what: "không leo đỉnh trên bảy nghìn mét nữa", years: 3 }, trust: { npc: s, delta: 0.2 } }, "Gia đình yên lòng, núi lớn khép lại"),
      C("Nói thật là chưa thể hứa", { trust: { npc: s, delta: -0.2 }, counters: { honest: 1 } }, "Thật lòng, người ở nhà lo thêm"),
      C("Đưa người ấy đến trại chính một lần", { trust: { npc: s, delta: 0.15 }, money: -0.1, rel: 2 }, "Tốn tiền, người ở nhà thấy núi bằng mắt mình", { tier: "awakened" })], 0, { npc: s });
    return T("Hai mươi cuộc gọi nhỡ", `${N(p!)} xem bản tin về một trận lở tuyết trên ngọn núi bạn đang leo, gọi hai mươi lần trong một đêm. Ở trại chính, chỉ có sóng điện thoại lúc bình minh.`, [
      C("Gọi về mỗi sáng, dù phải trèo lên mỏm đá bắt sóng", { trust: { npc: p!, delta: 0.2 }, bw: -2 }, "Mất sức mỗi sáng, người ở nhà yên lòng"),
      C("Nhờ đoàn báo tin hộ, tập trung leo", { trust: { npc: p!, delta: -0.1 }, bw: 2 }, "Đầu óc cho núi, người ở nhà thắt ruột")], 0, { npc: p! });
  }),
];
