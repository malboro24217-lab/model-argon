/**
 * Gói TRUYỀN THÔNG A: nhà báo điều tra · MC truyền hình · streamer · người có ảnh hưởng trên mạng.
 * Mỗi con đường: 1 năng khiếu · 3 cơ hội · 5 nhịp truyện · 9–10 chuyện thường ngày · 1 chuyện gia đình.
 * Bộ đếm riêng để các nhịp sau đọc lại: jn_cred (uy tín nghề báo), tvh_fame (độ nổi), stm_viewers (cộng đồng), kol_trust (độ tin của người theo dõi).
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

const JN = "journalist";
const TV = "tv_host";
const ST = "streamer";
const KO = "influencer";

export const PACK_MEDIA_A: Storylet[] = [
  /* ================================================================ NHÀ BÁO ĐIỀU TRA (jn_) */

  /* ---------- năng khiếu ---------- */
  talent(JN, "jn_t_wall", [10, 16], () => true, () => T("Tờ báo tường", "Bạn được giao làm tờ báo tường của lớp. Lúc đếm lại quỹ lớp để viết mục tin vắn, bạn thấy thiếu đúng số tiền mua bộ bóng mới, và trong sổ chi có chữ ký của lớp trưởng.", [
    C("Hỏi thẳng lớp trưởng, rồi mới viết", { flags: [talentFlag(JN)], counters: { talents_seen: 1 }, know: 3, rel: -1 }, "Mất lòng một bạn, học được cách hỏi"),
    C("Đưa sổ cho cô giáo, không viết gì", { counters: { talents_seen: 1 }, rel: 1 }),
    C("Viết chuyện khác cho êm", { counters: { talents_seen: 1 }, happy: -1 })], 2)),

  /* ---------- cơ hội bước vào ---------- */
  door(JN, "jn_d_desk", [21, 35], (c) => c.has_degree || f(c, talentFlag(JN)) || c.know > 55, () => T("Ban điều tra tuyển người", "Một tờ báo cần người cho ban điều tra. Nhuận bút trả theo bài, có tháng chỉ đủ tiền nhà. Người phỏng vấn hỏi bạn đúng một câu: “Bạn chịu được bị ghét không?”", [
    C("Nghỉ việc đang làm, nhận chỗ", { ...become(JN), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02 }, "Lương bấp bênh, đúng việc mình muốn"),
    C("Viết cộng tác vào buổi tối", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(JN), log: "Bài thứ ba của bạn lên trang nhất. Ban điều tra gọi bạn về hẳn." }, lose: { happy: -2, log: "Hai bài bị trả lại. Bạn không còn sức viết sau giờ làm." } } }, "Giữ việc, vào nghề chậm"),
    C("Thôi, tìm việc ổn định hơn", { counters: { doors_seen: 1 }, money: 0.02 })], 2)),
  door(JN, "jn_d_witness", [21, 45], () => true, () => T("Đoạn video lúc hai giờ sáng", "Bạn quay được cảnh một xe bồn xả thứ nước đen sẫm xuống con kênh sau nhà lúc hai giờ sáng. Một phóng viên báo địa phương xin đoạn video, rồi hỏi bạn có muốn đi cùng chị ấy đến cuối vụ này không.", [
    C("Đi cùng, học nghề từ vụ này", { ...become(JN), counters: { doors_seen: 1 }, flags: ["jn_from_witness"], bw: -3 }, "Bỏ việc cũ, bước vào một vụ có thể nguy hiểm"),
    C("Gửi video, xin giấu tên", { counters: { doors_seen: 1 }, flags: ["anon_tipster"], rel: 1 }),
    C("Xóa video, tránh rắc rối", { counters: { doors_seen: 1 }, happy: -3 })], 1)),
  door(JN, "jn_d_blog", [21, 40], () => true, () => T("Trang viết hai trăm nghìn lượt đọc", "Bạn viết một bài dài về hàng người xếp hàng từ bốn giờ sáng ở bệnh viện tỉnh, kèm ảnh tờ phiếu thu tiền ngoài sổ. Bài có hai trăm nghìn lượt đọc. Một tòa soạn điện tử mời bạn về làm phóng viên.", [
    C("Nhận lời, vào tòa soạn", { ...become(JN), counters: { doors_seen: 1 } }, "Có lương, có người sửa bài và chịu trách nhiệm"),
    C("Giữ trang riêng, xin độc giả góp tiền", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(JN), flags: ["jn_reader_funded"], log: "Ba nghìn người góp mỗi tháng một ít. Bạn thành phóng viên không cần tòa soạn." }, lose: { happy: -3, log: "Sau sáu tháng, tiền góp chỉ đủ trả tiền mạng." } } }, "Không ai ra lệnh, cũng không ai bảo lãnh", { tier: "sovereign" }),
    C("Thôi viết, sợ phiền", { counters: { doors_seen: 1 }, happy: -1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(JN, 1, 1, (c) => T("Người đưa tin đầu tiên", "Một kế toán ở bệnh viện huyện đưa bạn bảng kê: máy thở được mua với giá gấp ba thị trường. Chị ấy xin giấu tên. Biên tập viên muốn chị lên hình, nói bài sẽ “nặng ký” hơn nhiều.", [
    C("Giữ kín tên chị ấy, bài nhẹ hơn", { counters: step(c, JN, { jn_cred: 1 }), flags: ["jn_protects_source"] }, "Bài kém nổi, người đưa tin còn tin bạn"),
    C("Thuyết phục chị ấy lộ mặt", { counters: step(c, JN), gamble: { p: 0.5, win: { income_mult: 1.15, counters: { jn_cred: 1 }, log: "Bài gây chấn động. Chị ấy bị chuyển công tác nhưng nói không hối hận." }, lose: { happy: -5, flags: ["jn_burned_source"], log: "Bài lên trang nhất. Hai tuần sau chị ấy mất việc và không nghe máy bạn nữa." } } }, "Bài mạnh, người đưa tin gánh rủi ro"),
    C("Tìm thêm hai nguồn độc lập trước", { counters: step(c, JN), bw: -5, flags: ["jn_protects_source"], gamble: { p: 0.6, win: { counters: { jn_cred: 2 }, log: "Ba tháng sau bài ra, không ai bắt bẻ được một con số." }, lose: { happy: -4, log: "Một tờ báo khác đăng trước phần nổi nhất. Bài của bạn thành bài chạy theo." } } }, "Chậm, có thể bị đăng trước", { tier: "awakened" })], 0), (c) => c.age >= 18),
  beat(JN, 2, 3, (c) => {
    const rf = f(c, "jn_reader_funded");
    return T("Bài thứ ba bị hoãn", `Loạt bài của bạn về khu đô thị lấn ruộng là loạt được đọc nhiều nhất năm.${f(c, "jn_burned_source") ? " Từ vụ người kế toán, không ai trong vụ này dám nói chuyện với bạn nếu không giấu tên." : ""} ${rf ? "Chủ đầu tư nhắn riêng cho bạn: một khoản “tài trợ” bằng hai năm tiền độc giả góp, nếu bài thứ ba không ra." : "Chủ đầu tư cũng là khách quảng cáo lớn nhất của báo. Tổng biên tập gọi bạn lên: bài thứ ba “tạm hoãn”, và bạn sẽ được làm trưởng ban."}`, [
      rf ? C("Nhận khoản tài trợ, bỏ bài", { counters: step(c, JN, { jn_cred: -1 }), money: 0.6, flags: ["jn_killed_story"] }, "Có tiền, mất một phần mình")
        : C("Nhận chức, để bài nằm lại", { counters: step(c, JN, { jn_cred: -1 }), income_mult: 1.3, flags: ["jn_killed_story"] }, "Lên chức, mất một phần mình"),
      rf ? C("Đăng bài, kể luôn lời đề nghị", { counters: step(c, JN, { jn_cred: 2 }), income_mult: 0.9, agency: 0.02, flags: ["jn_independent"] }, "Mất nhà tài trợ, được độc giả")
        : C("Nghỉ việc, mang bài sang nơi khác", { counters: step(c, JN, { jn_cred: 2 }), income_mult: 0.8, agency: 0.02, flags: ["jn_independent"] }, "Mất lương ổn định, bài được đăng"),
      C("Rủ ba tòa soạn cùng đăng một ngày", { counters: step(c, JN), gamble: { p: 0.45, win: { income_mult: 1.1, counters: { jn_cred: 2 }, flags: ["jn_coalition"], log: "Ba tờ báo cùng lên trang một sáng thứ hai. Không ai gỡ được cả ba." }, lose: { income_mult: 0.85, flags: ["jn_independent"], log: "Hai tòa soạn rút phút chót. Bạn bị cho nghỉ vì “làm việc với đối thủ”." } } }, "Không ai gỡ nổi ba bài cùng lúc, nếu họ giữ lời", { tier: "sovereign" })], 0);
  }, (c) => c.age >= 18),
  beat(JN, 3, 4, (c) => {
    const prot = f(c, "jn_protects_source");
    const p = 0.4 + ((c.counters.jn_cred ?? 0) >= 3 ? 0.15 : 0) + (f(c, "jn_coalition") ? 0.1 : 0);
    return T("Đơn kiện mười năm lương", `Doanh nghiệp trong loạt bài kiện bạn tội vu khống, đòi bồi thường bằng mười năm lương. ${prot ? "Luật sư phía họ nói sẽ rút đơn nếu bạn khai ra ai đã đưa tài liệu." : "Họ sẽ rút đơn nếu bạn đăng lời cải chính."} Tối nào cũng có một người lạ đứng hút thuốc trước cổng nhà bạn.`, [
      C("Ra tòa, giữ nguyên bài", { counters: step(c, JN), money: -0.3, bw: -8, gamble: { p, win: { counters: { jn_cred: 2 }, flags: ["jn_won_case"], log: "Tòa bác đơn. Bản án được các lớp báo chí đem ra giảng." }, lose: { money: -0.5, income_mult: 0.7, flags: ["jn_lost_case"], log: "Bạn thua kiện, phải cải chính và bồi thường. Người đọc vẫn nhớ bài." } } }, "Tốn kém, có thể mất trắng", { longterm: true }),
      prot ? C("Khai tên người đưa tin để thoát kiện", { counters: step(c, JN, { jn_cred: -3, honest: -2 }), happy: -8, flags: ["jn_betrayed_source"] }, "Hết kiện, mất thứ quý nhất của nghề")
        : C("Đăng cải chính, khép lại", { counters: step(c, JN, { jn_cred: -2 }), happy: -5, flags: ["jn_retracted"] }, "Yên thân, bài của bạn thành bài sai"),
      C("Bỏ nghề, đưa cả nhà đi nơi khác", { counters: step(c, JN), ...leave(JN), money: -0.15, health: 3, flags: ["ex_journalist"] }, "An toàn, bỏ dở vụ cuối")], 0);
  }, (c) => c.age >= 18),
  beat(JN, 4, 5, (c) => {
    const cred = c.counters.jn_cred ?? 0;
    if (f(c, "jn_lost_case") || f(c, "jn_retracted") || f(c, "jn_betrayed_source")) return T("Không ai giao bài điều tra", `${f(c, "jn_betrayed_source") ? "Chuyện bạn khai tên người đưa tin lan khắp giới báo." : "Sau vụ kiện, không tòa soạn nào dám giao bạn bài điều tra."} Một công ty truyền thông mời bạn viết bài quan hệ công chúng cho các tập đoàn, mỗi bài bằng nửa tháng lương cũ.`, [
      C("Nhận viết bài thuê", { counters: step(c, JN, { jn_cred: -1 }), income_mult: 1.4, flags: ["jn_pr_writer"] }, "Tiền khá, chữ không còn là của mình"),
      C("Viết một cuốn sách kể lại tất cả", { counters: step(c, JN, { jn_cred: 1 }), income_mult: 0.7, know: 4, flags: ["jn_memoir"], gamble: { p: 0.4, win: { money: 0.3, log: "Cuốn sách bán chạy. Người ta tìm đọc lại bài cũ của bạn." }, lose: { happy: -3, log: "Sách in một nghìn bản, bán được ba trăm." } } }, "Nghèo đi, nói được hết", { tier: "awakened" }),
      C("Rời nghề, đi dạy viết cho sinh viên", { counters: step(c, JN), ...leave(JN), happy: 4, flags: ["jn_teacher"] }, "Bình yên, hết hiện trường")], 0);
    if (f(c, "jn_killed_story")) return T("Bài hoãn năm ấy", "Bạn đã ngồi ghế trên nhiều năm. Một phóng viên trẻ nộp bài về khu đô thị năm xưa: giờ mỗi mùa mưa nó ngập đến đầu gối, và trong bài có tên bạn ở danh sách những người biết mà im lặng.", [
      C("Cho đăng, kể cả đoạn về mình", { counters: step(c, JN, { jn_cred: 3 }), income_mult: 0.8, happy: 3, flags: ["jn_redeemed"] }, "Mất ghế, lấy lại tên", { tier: "sovereign" }),
      C("Chặn bài, như người ta từng chặn bạn", { counters: step(c, JN, { jn_cred: -2 }), income_mult: 1.2, flags: ["jn_gatekeeper"] }, "Giữ ghế, thành người mình từng ghét"),
      C("Lặng lẽ chuyển bài sang báo khác", { counters: step(c, JN, { jn_cred: 1 }), gamble: { p: 0.6, win: { log: "Bài ra ở báo khác. Không ai biết ai đã chuyển." }, lose: { ...leave(JN), log: "Người ta tìm ra bạn. Bạn bị cho nghỉ trước hạn." } } }, "Giữ ghế nếu không bị lộ")], 0);
    return T("Giải thưởng lớn nhất nghề", `Loạt bài của bạn được trao giải báo chí cao nhất.${cred >= 4 ? " Một tờ báo lớn ở nước ngoài mời bạn sang làm." : " Một tờ báo lớn mời bạn về làm thư ký tòa soạn."} Cùng tuần, người từng đưa tài liệu cho bạn nhắn: “Tôi vẫn chưa xin được việc.”`, [
      C(cred >= 4 ? "Nhận lời, sang làm ở nước ngoài" : "Nhận ghế thư ký tòa soạn", { counters: step(c, JN), income_mult: 1.4, flags: ["jn_editor"] }, "Quyền và tiền, xa hiện trường"),
      C("Lập tòa soạn nhỏ do độc giả góp tiền", { counters: step(c, JN, { jn_cred: 1 }), money: -0.4, agency: 0.03, flags: ["jn_own_newsroom"] }, "Vốn nhỏ, không ai ra lệnh", { tier: "sovereign" }),
      C("Dùng tiền giải giúp người đưa tin làm lại", { counters: step(c, JN, { kind: 1 }), money: -0.2, happy: 4, flags: ["jn_repaid_source"] }, "Mất tiền thưởng, trả được món nợ lòng")], 0);
  }, (c) => c.age >= 18),
  beat(JN, 5, 6, (c) => {
    const cred = c.counters.jn_cred ?? 0;
    return T("Hai mươi cuốn sổ tay", `Trong tủ của bạn có hai mươi cuốn sổ tay ghi từ ngày vào nghề, có cả tên thật của những người đưa tin. ${cred >= 4 ? "Một trường báo chí xin chúng cho thư viện." : "Một phóng viên trẻ muốn mượn để viết lại một vụ cũ."}${f(c, "jn_betrayed_source") ? " Có một cái tên trong đó bạn vẫn không dám đọc lại." : ""}`, [
      C("Trao đi, sau khi bôi đen mọi tên người", { counters: step(c, JN), bw: -3, rel: 3, flags: ["jn_archive_given"] }, "Mất nhiều tuần, giữ được lời hứa cũ"),
      C("Đốt hết, để người cũ được yên", { counters: step(c, JN), happy: 2, flags: ["jn_burned_notes"] }, "Bí mật an toàn, bài học mất theo"),
      C("Viết hồi ký từ những cuốn sổ", { counters: step(c, JN), money: 0.3, gamble: { p: 0.5, win: { rel: 2, log: "Cuốn hồi ký được các tòa soạn đọc như sách nghề." }, lose: { rel: -4, log: "Một người trong sách nhận ra mình và cắt liên lạc với bạn." } } }, "Có tiền, có thể làm tổn thương người cũ")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(JN, "jn_envelope", [22, 65], 8, (c) => T("Phong bì sau họp báo", vary("jne", c.age, ["Họp báo xong, ban tổ chức đưa mỗi phóng viên một phong bì “tiền xăng xe”, dày hơn mọi lần.", "Một tập đoàn mời phóng viên đi thăm nhà máy mới: khách sạn năm sao, và một phong bì nằm sẵn trong túi quà."]), [
    C("Nhận như mọi người", { money: 0.03, counters: { honest: -1, jn_cred: -1 } }, "Tiền nhỏ, ngòi bút bớt sắc"),
    C("Trả lại, không nói gì", { counters: { honest: 1 }, rel: -1 }),
    C("Trả lại, và viết về cái phong bì", { counters: { honest: 1, jn_cred: 1 }, rel: -3, flags: ["jn_named_envelopes"] }, "Đồng nghiệp ngại bạn, người đọc tin bạn", { tier: "awakened" })], 0)),
  daily(JN, "jn_deadline", [22, 65], 7, (c) => T("Tin chưa kịp kiểm", vary("jnd", c.age, ["Mười một giờ đêm, báo đối thủ đăng tin một quan chức bị bắt, chỉ dẫn “nguồn tin riêng”. Tổng biên tập muốn bạn có bài trong ba mươi phút.", "Một video tai nạn lan khắp mạng, kèm lời kể ai là người gây ra. Ban biên tập muốn có bài ngay, trước khi các báo khác vào cuộc."]), [
    C("Đăng theo, ghi “theo nguồn tin”", { gamble: { p: 0.6, win: { log: "Tin đúng. Báo bạn không bị tụt lại." }, lose: { counters: { jn_cred: -2 }, happy: -3, log: "Tin sai. Báo bạn phải đính chính cùng đối thủ, tên bạn ở dưới." } } }, "Nhanh, có thể sai cả tên mình"),
    C("Gọi xác minh, chấp nhận chậm", { counters: { jn_cred: 1 }, bw: -2, happy: -1 }, "Chậm hơn mọi báo, không phải đính chính")], 1)),
  daily(JN, "jn_undercover", [23, 50], 10, () => T("Ba tháng làm công nhân", "Có tin một xưởng chế biến giữ giấy tờ tùy thân của công nhân và khóa cửa ca đêm. Cách duy nhất để thấy tận mắt là xin vào làm ba tháng, lương theo sản phẩm.", [
    C("Xin vào làm, giấu nghề", { health: -4, bw: -6, gamble: { p: 0.65, win: { counters: { jn_cred: 2 }, know: 4, log: "Bài của bạn kèm bảng chấm công thật. Xưởng bị thanh tra một tuần sau." }, lose: { health: -3, flags: ["jn_exposed_undercover"], log: "Quản đốc nhận ra bạn ở tuần thứ ba. Bạn bị đẩy ra cổng, máy ảnh bị giữ lại." } } }, "Mệt, có thể lộ, bài không ai cãi được"),
    C("Phỏng vấn công nhân đã nghỉ việc", { counters: { jn_cred: 1 }, bw: -2 }, "An toàn, bài yếu hơn"),
    C("Chuyển tin cho thanh tra lao động", { flags: ["jn_tipped_inspectors"], rel: 1 }, "Có thể cứu người sớm hơn, bạn không có bài")], 1)),
  daily(JN, "jn_threat", [23, 65], 9, () => T("Ảnh chụp cổng nhà", "Sáng nay điện thoại bạn nhận một tin nhắn không tên: ảnh chụp cổng nhà bạn, kèm giờ bạn ra khỏi nhà mỗi sáng. Loạt bài về đường dây khai thác cát của bạn còn hai kỳ chưa đăng.", [
    C("Báo công an, công khai lời đe dọa", { bw: -3, flags: ["jn_threat_public"], gamble: { p: 0.6, win: { counters: { jn_cred: 1 }, log: "Nhiều tòa soạn đăng lại lời đe dọa. Tin nhắn không đến nữa." }, lose: { happy: -4, log: "Hồ sơ nằm im. Tin nhắn vẫn đến, giờ là ảnh chiếc xe của bạn." } } }, "Có người cùng nhìn, cũng có thể chọc giận họ"),
    C("Đổi đường đi làm, viết tiếp", { bw: -6, health: -2, counters: { jn_cred: 1 } }, "Mất ngủ, bài vẫn ra"),
    C("Gác lại hai kỳ cuối", { happy: -4, counters: { jn_cred: -1 }, flags: ["jn_shelved"] }, "Yên ổn, bài dang dở")], 1)),
  daily(JN, "jn_grief", [22, 65], 8, (c) => T("Nhà có tang", vary("jng", c.age, ["Sau vụ sập công trình, bạn được cử đến nhà một công nhân thiệt mạng. Biên tập viên dặn: cần ảnh người mẹ khóc.", "Vụ cháy chung cư làm mười một người chết. Ban ảnh cần một khuôn mặt cho trang nhất, và gia đình nạn nhân đang ngồi ngay trước mặt bạn."]), [
    C("Chụp, xin phép sau", { counters: { jn_cred: -1 }, rel: -3, income_mult: 1.02 }, "Ảnh mạnh, gia đình thấy mình bị lợi dụng"),
    C("Chỉ ngồi nghe, không chụp", { happy: 2, counters: { kind: 1 }, gamble: { p: 0.5, win: { counters: { jn_cred: 1 }, log: "Sau tang lễ, gia đình gọi lại kể cho bạn những điều chưa ai biết." }, lose: { log: "Bài của bạn không có ảnh, bị đẩy xuống trang trong." } } }, "Tử tế, bài có thể chìm"),
    C("Để gia đình tự chọn một bức ảnh cũ", { counters: { jn_cred: 1 }, rel: 2, bw: -2 }, "Mất công thuyết phục ban ảnh", { tier: "awakened" })], 0)),
  daily(JN, "jn_clicks", [22, 60], 8, () => T("Chỉ tiêu lượt đọc", "Tờ báo đổi chủ. Lương phóng viên giờ tính theo lượt đọc. Bài điều tra ba tháng của bạn có ít lượt đọc hơn một bài về váy cưới của người nổi tiếng.", [
    C("Viết thêm tin giật gân để giữ lương", { money: 0.05, counters: { jn_cred: -1 }, happy: -2 }, "Đủ lương, chữ rẻ đi"),
    C("Giữ nhịp điều tra, chịu lương thấp", { money: -0.08, counters: { jn_cred: 1 } }, "Nghèo đi, bài vẫn sâu"),
    C("Đề xuất mục điều tra do độc giả trả phí", { gamble: { p: 0.4, win: { income_mult: 1.15, flags: ["jn_paywall_desk"], log: "Mục mới có bốn nghìn người trả phí trong tháng đầu." }, lose: { happy: -2, log: "Ông chủ mới nghe hết, rồi cười." } } }, "Có thể đổi luật chơi, có thể bị cười", { tier: "sovereign" })], 0)),
  daily(JN, "jn_source", [23, 65], 9, (c, N) => { const o = role(c, "official")!; return T("Bản hợp đồng có giá", `${N(o)} giữ bản hợp đồng bạn tìm suốt bốn tháng. Gặp nhau ở quán cà phê, ${N(o)} không nói thẳng, chỉ đặt lên bàn một mảnh giấy ghi một con số.`, [
    C("Trả tiền để có tài liệu", { money: -0.1, counters: { jn_cred: 1 }, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 8], note: "trả tiền cho cán bộ để lấy tài liệu" } }, "Có bài ngay, có một bí mật"),
    C("Đổi bằng một bài khen cơ quan của họ", { counters: { jn_cred: -1, honest: -1 }, memory: { npc: o, tag: "WIN_WIN_DEAL", weight: 0.2, note: "bài khen đổi lấy bản hợp đồng" } }, "Không mất tiền, mất một bài thật"),
    C("Từ chối, tìm đường khác", { bw: -4, trust: { npc: o, delta: -0.1 }, counters: { honest: 1 } }, "Sạch sẽ, mất thêm nhiều tháng")], 2, { npc: o }); }, (c) => !!role(c, "official")),
  daily(JN, "jn_trauma", [24, 65], 10, (c) => T("Những gì bạn đã thấy", vary("jnt", c.age, ["Đã ba tuần bạn không ngủ quá bốn tiếng. Những tấm ảnh hiện trường cũ cứ quay lại mỗi khi tắt đèn.", "Một chiều đang họp, bạn bỗng không thở được khi nghe tiếng còi xe cứu thương ngoài cửa sổ."]), [
    C("Đi gặp chuyên gia tâm lý", { money: -0.04, health: 4, happy: 3, flags: ["jn_therapy"] }, "Tốn tiền, phải nhận mình đang không ổn"),
    C("Uống vài ly cho dễ ngủ", { counters: { drink: 2 }, health: -3, bw: -2 }, "Dễ ngủ đêm nay, khó hơn những đêm sau"),
    C("Xin chuyển sang mảng nhẹ một năm", { income_mult: 0.95, health: 3, counters: { jn_cred: -1 } }, "Hồi lại, mất mạch tin")], 1)),
  daily(JN, "jn_crossroad", [26, 60], 99, (c) => T("Lời mời làm truyền thông", "Một tập đoàn mời bạn về làm giám đốc truyền thông, lương gấp ba. Việc đầu tiên của bạn sẽ là trả lời những phóng viên giống bạn bây giờ.", [
    C("Nhận, rời nghề báo", { ...leave(JN), money: 0.3, flags: ["ex_journalist"] }, "Giàu lên, đổi phía"),
    c.age <= 48
      ? C("Chuyển hồ sơ cũ thành phim tài liệu", { unflags: [life(JN)], ...become("film_director"), money: -0.2 }, "Rời tòa soạn, kể chuyện bằng hình", { tier: "awakened" })
      : C("Đi dạy báo chí", { ...leave(JN), happy: 3, flags: ["jn_teacher"] }, "Bình yên, lương giảng viên"),
    C("Ở lại với nghề", { happy: 2, counters: { jn_cred: 1 } }, "Nghèo, còn là mình")], 2), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(JN, "jn_family", [24, 65], (c) => !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse");
    if (s) return T("Một năm ngủ yên", `${N(s)} đặt lên bàn tờ thông báo tuyển người của một ngân hàng, nói nhỏ: “Chỉ cần một năm ngủ yên thôi.” Đêm qua lại có người bấm chuông lúc một giờ sáng.`, [
      C("Hứa rút khỏi mảng điều tra sau vụ này", { promise: { to: s, what: "rút khỏi mảng điều tra sau vụ đang làm", years: 2 }, trust: { npc: s, delta: 0.15 } }, "Giữ nhà, có thể phải bỏ nghề"),
      C("Giải thích vì sao phải làm tiếp", { trust: { npc: s, delta: -0.15 }, counters: { jn_cred: 1 } }, "Giữ nghề, căng trong nhà"),
      C("Cùng lập kế hoạch an toàn cho cả nhà", { trust: { npc: s, delta: 0.1 }, bw: -3, money: -0.05, flags: ["jn_safety_plan"] }, "Tốn công, hai người cùng gánh", { tier: "awakened" })], 0, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Cuộc gọi lúc nửa đêm", `${N(p)} xem bạn trả lời phỏng vấn trên ti vi, gọi điện lúc nửa đêm: “Bọn họ có tiền, con có gì? Thôi đi con.”`, [
      C("Về nhà ngồi nói chuyện cả buổi", { trust: { npc: p, delta: 0.2 }, bw: -2, happy: 1 }),
      C("Giấu bố mẹ những bài nguy hiểm", { trust: { npc: p, delta: -0.05 }, flags: ["jn_hides_work"] }, "Đỡ lo cho họ, thêm một điều giấu trong nhà"),
      C("Ký bút danh từ nay", { flags: ["jn_pen_name"], counters: { jn_cred: -1 } }, "An toàn hơn cho nhà, tên mình lùi lại")], 0, { npc: p });
  }),

  /* ================================================================ MC TRUYỀN HÌNH (tvh_) */

  /* ---------- năng khiếu ---------- */
  talent(TV, "tvh_t_mic", [8, 14], () => true, () => T("Micro tắt giữa lễ", "Bạn được chọn dẫn buổi lễ đầu năm học vì nói to và không run. Đang giữa chừng thì micro tắt, sáu trăm học sinh im lặng nhìn lên.", [
    C("Bước xuống, nói to không cần micro", { flags: [talentFlag(TV)], counters: { talents_seen: 1 }, happy: 3 }, "Liều, cả trường nhớ mặt bạn"),
    C("Đứng chờ thầy sửa micro", { counters: { talents_seen: 1 } }),
    C("Xin bố mẹ cho học lớp dẫn chương trình", { flags: [talentFlag(TV)], counters: { talents_seen: 1 }, money: -0.03, bw: -2 }, "Tốn tiền nhà, mất giờ chơi")], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(TV, "tvh_d_casting", [20, 32], () => true, (c) => T("Bốn trăm người thử giọng", `Đài truyền hình tìm người dẫn bản tin mới. Bốn trăm người thử giọng, mỗi người ba phút trước máy quay.${c.poor_country ? " Ngoài hành lang có người thì thầm rằng suất này “đã có người lo”, và để lại số điện thoại." : ""}`, [
    C("Thử giọng, nói như người đọc bản tin", { counters: { doors_seen: 1 }, gamble: { p: f(c, talentFlag(TV)) ? 0.5 : 0.3, win: { ...become(TV), log: "Bạn được gọi lại vòng hai, rồi vòng ba. Tháng sau bạn lên sóng." }, lose: { happy: -3, log: "Bạn không qua vòng đầu. Họ nói giọng bạn “chưa có màu”." } } }),
    C("Giữ nguyên giọng quê khi thử", { counters: { doors_seen: 1 }, gamble: { p: 0.25, win: { ...become(TV), flags: ["tvh_own_voice"], log: "Giám khảo dừng bạn ở giây thứ năm mươi: “Đúng thứ chúng tôi đang thiếu.”" }, lose: { happy: -2, log: "Họ khuyên bạn đi sửa giọng rồi quay lại." } } }, "Khó đỗ hơn, đỗ thì là chính mình", { tier: "awakened" }),
    ...(c.poor_country ? [C("Gọi số điện thoại, gửi tiền “lo” suất", { ...become(TV), counters: { doors_seen: 1 }, money: -0.3, secret: { tag: "PAID_BRIBE" as const, severity: 0.35, fuse_years: [3, 12] as [number, number], note: "đưa tiền để có suất dẫn chương trình" } }, "Chắc suất, mang theo một bí mật")] : []),
    C("Thôi, không đi thử", { counters: { doors_seen: 1 } })], 0)),
  door(TV, "tvh_d_standin", [21, 40], (c) => c.has_job, () => T("Hai mươi phút trước giờ lên sóng", "Bạn làm biên tập ở hậu trường một chương trình trực tiếp. Người dẫn chính sốt cao, ngất trong phòng trang điểm. Đạo diễn quay sang bạn: “Bạn thuộc kịch bản hơn ai hết.”", [
    C("Lên hình ngay", { counters: { doors_seen: 1 }, gamble: { p: 0.55, win: { ...become(TV), log: "Bạn dẫn trọn bốn mươi phút. Tuần sau đài đưa bạn hợp đồng." }, lose: { happy: -4, flags: ["tvh_froze_once"], log: "Bạn vấp ba lần, đọc nhầm tên khách mời. Đoạn đó được chia sẻ khắp mạng." } } }, "Một cơ hội, có thể thành trò cười"),
    C("Đề nghị gọi người dẫn dự phòng", { counters: { doors_seen: 1 }, rel: 1 }, "An toàn, cơ hội đi qua")], 0)),
  door(TV, "tvh_d_online", [20, 40], () => true, () => T("Kênh phỏng vấn đường phố", "Những đoạn bạn cầm micro hỏi người đi đường đủ thứ chuyện có hàng triệu lượt xem. Một đài truyền hình mời bạn dẫn chương trình khuya, với điều kiện đóng kênh riêng.", [
    C("Nhận, lên truyền hình", { ...become(TV), counters: { doors_seen: 1 }, flags: ["tvh_from_online"] }, "Có đài, có lương, mất kênh riêng"),
    C("Giữ kênh, sống bằng mạng", { ...become("influencer"), counters: { doors_seen: 1 } }, "Tự do, không ai trả lương"),
    C("Thôi, làm cho vui như cũ", { counters: { doors_seen: 1 }, happy: 1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(TV, 1, 1, (c) => T("Máy nhắc chữ tắt", "Buổi trực tiếp đầu tiên của bạn. Phút thứ bảy, máy nhắc chữ tắt. Khách mời là một quan chức thành phố đang chờ câu hỏi, và tai nghe của bạn chỉ còn tiếng rè.", [
    C("Nói tự do, hỏi câu của mình", { counters: step(c, TV), flags: ["tvh_own_voice"], gamble: { p: 0.5, win: { counters: { tvh_fame: 1 }, log: "Câu hỏi của bạn thành câu được trích nhiều nhất tuần." }, lose: { happy: -3, log: "Vị khách nổi giận. Đạo diễn cắt sóng sớm hai phút." } } }, "Có thể thành tên tuổi, có thể bị cắt"),
    C("Đọc lại phần đã thuộc, bám kịch bản", { counters: step(c, TV), flags: ["tvh_scripted"], money: 0.02 }, "An toàn, không ai nhớ")], 1), (c) => c.age >= 18),
  beat(TV, 2, 3, (c) => {
    const own = f(c, "tvh_own_voice");
    return T("Giờ vàng, năm năm", `${own ? "Khán giả thích cách bạn nói như người thật, không như người đọc. " : ""}Đài mời bạn dẫn chương trình giờ vàng. Hợp đồng năm năm độc quyền: đài quyết bạn mặc gì, đăng gì lên mạng, quảng cáo cho ai.`, [
      C("Ký độc quyền", { counters: step(c, TV, { tvh_fame: 1 }), income_mult: 1.6, flags: ["tvh_network_contract"] }, "Lương cao, mất tự do"),
      C("Làm tự do, nhận dẫn nhiều nơi", { counters: step(c, TV), income_mult: 1.2, bw: -5, flags: ["tvh_freelance"] }, "Chạy show mệt, không ai giữ chân bạn"),
      C("Đòi đồng sở hữu chương trình", { counters: step(c, TV), gamble: { p: own ? 0.45 : 0.3, win: { income_mult: 1.45, flags: ["tvh_owns_show"], counters: { tvh_fame: 1 }, log: "Đài đồng ý chia ba phần mười. Lần đầu một người dẫn có tên trong giấy sở hữu." }, lose: { happy: -3, log: "Họ chọn người khác. Bạn quay về bản tin buổi trưa." } } }, "Có phần của mình, hoặc mất ghế giờ vàng", { tier: "sovereign" })], 0);
  }, (c) => c.age >= 18),
  beat(TV, 3, 4, (c) => {
    const ad = f(c, "tvh_ad_face");
    const hush = C("Thuê người dập bình luận", { counters: step(c, TV), money: -0.2, gamble: { p: 0.45, win: { log: "Câu chuyện chìm sau ba tuần." }, lose: { income_mult: 0.6, flags: ["tvh_cover_up"], log: "Người ta tìm ra đội bình luận thuê. Lần này đài cắt hợp đồng." } } }, "Có thể êm, có thể tệ gấp đôi");
    const quit = C("Rời màn hình, đi làm nghề khác", { counters: step(c, TV), ...leave(TV), happy: -3, flags: ["ex_tv_host"] }, "Hết bị nhìn, hết sân khấu");
    if (ad) return T("Sản phẩm mang mặt bạn", "Loại viên uống bạn quảng cáo suốt hai năm bị phát hiện có chất cấm. Hơn trăm người nhập viện, nhiều người nói họ mua vì tin bạn. Đoạn quảng cáo của bạn được phát lại trên mọi bản tin, kể cả bản tin của đài bạn.", [
      C("Trả lại tiền quảng cáo, đứng về phía người bệnh", { counters: step(c, TV, { tvh_fame: 1 }), money: -0.5, flags: ["tvh_stood_with_victims"] }, "Mất tiền, giữ được lòng tin", { longterm: true }),
      hush, quit], 0);
    return T("Mười lăm giây sau quảng cáo", "Giờ nghỉ quảng cáo, bạn buông một câu đùa về giọng nói của một thí sinh vùng nghèo. Micro chưa tắt. Đoạn mười lăm giây ấy có ba triệu lượt xem trước khi bạn về đến nhà.", [
      C("Xin lỗi thẳng, đến tận nhà thí sinh", { counters: step(c, TV, { tvh_fame: -1 }), income_mult: 0.85, happy: -2, flags: ["tvh_honest_apology"] }, "Mất hợp đồng quảng cáo, giữ được tư cách", { longterm: true }),
      hush, quit], 0);
  }, (c) => c.age >= 18),
  beat(TV, 4, 5, (c) => {
    const fame = c.counters.tvh_fame ?? 0;
    if (f(c, "tvh_cover_up") || fame <= -1) return T("Khung giờ năm giờ sáng", "Đài chuyển bạn sang dẫn chương trình nhà nông lúc năm giờ sáng. Khán giả là những người đang cho gà ăn, và không mấy ai biết chuyện ồn ào của bạn.", [
      C("Nhận, và làm cho thật tử tế", { counters: step(c, TV, { tvh_fame: 1 }), income_mult: 0.7, happy: 2, flags: ["tvh_dawn_show"] }, "Lương thấp, làm lại từ gốc", { longterm: true }),
      C("Mở kênh trên mạng, tự làm", { counters: step(c, TV), money: -0.15, gamble: { p: 0.4, win: { income_mult: 1.2, flags: ["tvh_online_comeback"], log: "Kênh của bạn có khán giả riêng, phần lớn là người trẻ chưa từng xem ti vi." }, lose: { happy: -4, log: "Bình luận đầu tiên dưới mỗi video đều là đoạn mười lăm giây cũ." } } }, "Tự do, có thể không ai xem"),
      C("Mở lớp dạy nói trước đám đông", { counters: step(c, TV), ...leave(TV), happy: 3, flags: ["tvh_coach"] }, "Rời màn hình, sống bằng nghề dạy")], 0);
    if (f(c, "tvh_network_contract")) return T("Người dẫn ảo", "Hợp đồng của bạn hết hạn. Đài đang thử một người dẫn ảo do máy tạo ra, không mệt, không già. Họ đề nghị mua giọng nói và gương mặt bạn để làm nó.", [
      C("Bán giọng và gương mặt", { counters: step(c, TV), money: 1.2, ...leave(TV), flags: ["tvh_sold_likeness"] }, "Tiền lớn, gương mặt không còn là của bạn"),
      C("Gia hạn với lương giảm một nửa", { counters: step(c, TV), income_mult: 0.6, happy: -3 }, "Giữ chỗ, chờ ngày bị thay"),
      C("Rời đài, mang khán giả theo", { counters: step(c, TV), gamble: { p: 0.5 + (fame >= 2 ? 0.15 : 0), win: { income_mult: 1.3, flags: ["tvh_own_studio"], log: "Chương trình mới của bạn phát trên mạng, nửa số khán giả cũ đi theo ngay tháng đầu." }, lose: { income_mult: 0.7, log: "Khán giả quen giờ ấy, kênh ấy. Họ ở lại với người dẫn ảo." } } }, "Mất lưới an toàn, có thể làm chủ", { tier: "sovereign" })], 0);
    return T("Đêm trực tiếp lớn nhất năm", `Bạn được chọn dẫn đêm truyền hình trực tiếp lớn nhất năm.${fame >= 2 ? " Tên bạn được in to hơn tên chương trình." : ""} Nhà tài trợ chính gửi trước danh sách những câu không được hỏi. ${c.country === "VN" ? "Cùng tuần, có người gợi ý bạn ra ứng cử đại biểu." : "Cùng tuần, một đảng mời bạn ra tranh cử."}`, [
      C("Dẫn đúng danh sách nhà tài trợ", { counters: step(c, TV, { tvh_fame: 1 }), income_mult: 1.3 }, "Đêm diễn êm, tiền về đều"),
      C("Hỏi một câu bị cấm, trực tiếp", { counters: step(c, TV), gamble: { p: 0.5, win: { counters: { tvh_fame: 2 }, agency: 0.02, flags: ["tvh_asked_banned"], log: "Câu hỏi ấy được nhắc lại nhiều năm. Nhà tài trợ rút, khán giả ở lại." }, lose: { income_mult: 0.7, log: "Đài xin lỗi nhà tài trợ. Bạn bị rút khỏi chương trình mùa sau." } } }, "Một khoảnh khắc thật, có thể mất ghế", { tier: "awakened" }),
      C(c.country === "VN" ? "Nhận lời ra ứng cử" : "Nhận lời ra tranh cử", { counters: step(c, TV), unflags: [life(TV)], ...become("politician"), money: -0.2 }, "Rời màn hình, bước vào quyền lực")], 0);
  }, (c) => c.age >= 18),
  beat(TV, 5, 6, (c) => {
    const fame = c.counters.tvh_fame ?? 0;
    return T("Buổi ghi hình cuối", `${fame >= 2 ? "Đài muốn làm một đêm tri ân bạn, phát giờ vàng." : "Đài báo chương trình của bạn sẽ dừng sau mùa này."}${f(c, "tvh_sold_likeness") ? " Người dẫn ảo mang gương mặt bạn vẫn lên sóng mỗi tối." : ""} Một người dẫn trẻ từ tỉnh xa xin theo học bạn. Người ấy nói giọng nặng, như bạn hồi mới vào nghề.`, [
      C("Nhận dạy, không lấy tiền", { counters: step(c, TV), rel: 4, happy: 3, flags: ["tvh_mentor"] }, "Mất thời gian, để lại một người"),
      C("Viết tự truyện kể chuyện hậu trường", { counters: step(c, TV), money: 0.3, gamble: { p: 0.5, win: { log: "Cuốn sách bán chạy. Người trong nghề đọc lén." }, lose: { rel: -4, log: "Ba đồng nghiệp cũ cắt liên lạc vì những trang viết về họ." } } }, "Có tiền, có thể mất bạn"),
      C("Lặng lẽ rời sóng", { counters: step(c, TV), ...leave(TV), happy: 3 }, "Bình yên, không ai tiễn")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(TV, "tvh_ad", [22, 60], 8, () => T("Hợp đồng viên uống", "Một hãng thực phẩm chức năng trả bạn bằng một năm lương để đọc câu “tôi dùng mỗi sáng” trong quảng cáo. Bạn chưa từng thấy loại viên ấy trước hôm nay.", [
    C("Nhận, đọc đúng kịch bản", { money: 0.8, flags: ["tvh_ad_face"], counters: { honest: -1 } }, "Tiền lớn, gương mặt bạn gánh sản phẩm"),
    C("Chỉ nhận nếu có kiểm nghiệm độc lập", { gamble: { p: 0.4, win: { money: 0.5, counters: { tvh_fame: 1 }, log: "Kết quả kiểm nghiệm sạch. Bạn quảng cáo với lương tâm yên." }, lose: { log: "Hãng rút lời mời ngay khi nghe chữ “kiểm nghiệm”." } } }, "Ít tiền hơn, ngủ yên hơn", { tier: "awakened" }),
    C("Từ chối", { counters: { honest: 1 } }, "Mất một năm lương")], 0)),
  daily(TV, "tvh_face", [25, 65], 9, (c) => T("Máy quay độ nét cao", vary("tvf", c.age, ["Đài đổi sang máy quay độ nét cao. Đạo diễn hình nhắc khéo: giờ khán giả thấy cả nếp nhăn dưới mắt bạn.", "Khán giả bình luận rằng bạn “trông mệt”. Phòng nhân sự gửi danh sách các phòng khám thẩm mỹ có ưu đãi cho nhân viên đài."]), [
    C("Đi làm thẩm mỹ", { money: -0.1, gamble: { p: 0.75, win: { counters: { tvh_fame: 1 }, log: "Không ai nhận ra, trừ chính bạn trong gương." }, lose: { health: -5, happy: -5, log: "Một bên mặt sưng ba tuần. Bạn phải nghỉ sóng." } } }, "Giữ hình, có rủi ro"),
    C("Để tự nhiên, nói thẳng chuyện tuổi trên sóng", { flags: ["tvh_ages_on_air"], gamble: { p: 0.5, win: { counters: { tvh_fame: 1 }, happy: 3, log: "Rất nhiều thư cảm ơn từ khán giả cùng tuổi." }, lose: { income_mult: 0.9, log: "Bạn bị chuyển sang khung giờ ít người xem." } } }, "Là mình, có thể bị đẩy ra rìa", { tier: "awakened" }),
    C("Xin chuyển sang dẫn ít lên hình", { income_mult: 0.9, happy: 1, counters: { tvh_fame: -1 } }, "Đỡ áp lực, mờ dần")], 0)),
  daily(TV, "tvh_staged", [22, 60], 8, () => T("Câu chuyện được viết thêm", "Chương trình thực tế muốn bạn giới thiệu một thí sinh bằng câu chuyện mẹ cô ấy bỏ nhà đi. Bạn vừa nói chuyện với thí sinh trong hậu trường: mẹ cô ấy vẫn ở nhà, đang ngồi dưới khán đài.", [
    C("Đọc đúng kịch bản", { counters: { tvh_fame: 1, honest: -1 }, money: 0.03 }, "Chương trình hay hơn, một gia đình bị viết lại"),
    C("Đổi lời dẫn ngay trên sân khấu", { flags: ["tvh_broke_script"], gamble: { p: 0.6, win: { counters: { honest: 1 }, log: "Thí sinh nhìn bạn rất lâu khi bước lên. Nhà sản xuất im lặng." }, lose: { income_mult: 0.9, log: "Nhà sản xuất cắt phần đó, và cắt luôn tên bạn khỏi mùa sau." } } }, "Trung thực, có thể mất mùa sau"),
    C("Hỏi thí sinh muốn được kể thế nào", { counters: { honest: 1 }, bw: -2, rel: 2 }, "Mất công thuyết phục ê-kíp", { tier: "awakened" })], 0)),
  daily(TV, "tvh_gaffe", [22, 65], 7, (c) => T("Con số đọc nhầm", vary("tvg", c.age, ["Bản tin trực tiếp về trận lũ, bạn đọc nhầm số người mất tích, thừa một con số không.", "Bạn đọc nhầm tên một bộ trưởng mới thành tên người tiền nhiệm, trên sóng trực tiếp."]), [
    C("Đính chính ngay trên sóng, xin lỗi", { counters: { tvh_fame: 1 }, happy: -2 }, "Ngượng một phút, khán giả tin hơn"),
    C("Để ban biên tập sửa âm thầm sau", { gamble: { p: 0.6, win: { log: "Không ai để ý." }, lose: { counters: { tvh_fame: -1 }, log: "Có người cắt đoạn đó ra so với bản đã sửa. Họ gọi bạn là người dẫn xóa dấu vết." } } }, "Có thể không ai biết"),
    C("Đùa về chính mình ở đoạn sau", { gamble: { p: 0.4, win: { counters: { tvh_fame: 1 }, rel: 2, log: "Câu đùa được khen là duyên." }, lose: { counters: { tvh_fame: -1 }, log: "Đùa trong bản tin thiên tai bị coi là vô cảm." } } }, "Có thể duyên, có thể vô duyên")], 0)),
  daily(TV, "tvh_rumor", [22, 65], 8, (c) => T("Trang lá cải", `Một trang tin lá cải đăng ảnh bạn ăn tối với một người lạ, kèm tiêu đề đoán già đoán non.${c.married ? " Ở nhà, không ai nói gì suốt bữa cơm." : ""}`, [
    C("Kiện trang tin", { money: -0.1, gamble: { p: 0.5, win: { counters: { tvh_fame: 1 }, log: "Trang tin phải gỡ bài và xin lỗi." }, lose: { happy: -3, log: "Vụ kiện làm câu chuyện lan xa hơn." } } }, "Tốn tiền, có thể đổ thêm dầu"),
    C("Im lặng, chờ người ta quên", { happy: -2, bw: -2 }),
    C("Đăng ảnh đầy đủ, nói rõ người kia là ai", { rel: 2, flags: ["tvh_transparent"], gamble: { p: 0.7, win: { log: "Đó là luật sư của gia đình bạn. Trang tin gỡ bài trong một giờ." }, lose: { bw: -3, log: "Người ta chuyển sang soi đời tư của người kia." } } }, "Hết tin đồn, mất thêm chút riêng tư")], 1)),
  daily(TV, "tvh_cut", [24, 65], 9, (c, N) => { const o = role(c, "official")!; return T("Câu hỏi bị gạch", `Trước giờ phỏng vấn ${N(o)}, nhà sản xuất gạch đi câu hỏi về khoản chi cho con đường vừa sụt lún. “Phía ${N(o)} đã dặn trước.”`, [
    C("Vẫn hỏi, trực tiếp", { memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.3, note: "câu hỏi về con đường sụt lún trên sóng trực tiếp" }, gamble: { p: 0.5, win: { counters: { tvh_fame: 2 }, log: "Câu trả lời lúng túng ấy được phát lại cả tuần." }, lose: { income_mult: 0.85, log: "Bạn bị tạm ngừng dẫn hai tháng “để nghỉ ngơi”." } } }, "Khán giả nhớ, phía họ cũng nhớ"),
    C("Bỏ câu hỏi", { memory: { npc: o, tag: "WIN_WIN_DEAL", weight: 0.2, note: "buổi phỏng vấn không có câu hỏi khó" }, counters: { honest: -1 } }, "Êm chuyện, có thêm người quen"),
    C("Mời khán giả gửi câu hỏi lên màn hình trực tiếp", { counters: { tvh_fame: 1 }, trust: { npc: o, delta: -0.1 }, bw: -2 }, "Không ai bắt lỗi được bạn, họ cũng khó né", { tier: "sovereign" })], 1, { npc: o }); }, (c) => !!role(c, "official")),
  daily(TV, "tvh_ratings", [24, 60], 8, () => T("Thua một kênh làm trong phòng thuê", "Chương trình của bạn thua lượt xem một kênh mạng do hai sinh viên làm trong căn phòng thuê. Nhà sản xuất muốn thêm màn thử thách gây sốc và khách mời cãi nhau.", [
    C("Chiều theo, làm cho ồn", { counters: { tvh_fame: 1 }, rel: -2, happy: -2 }, "Kéo lại người xem, mất khán giả cũ"),
    C("Giữ định dạng cũ", { income_mult: 0.9, counters: { tvh_fame: -1 } }, "Giữ chất, có thể bị dừng"),
    C("Mời chính hai sinh viên lên dẫn cùng", { gamble: { p: 0.5, win: { counters: { tvh_fame: 2 }, flags: ["tvh_new_blood"], log: "Khán giả của cả hai bên cùng ngồi xem." }, lose: { happy: -2, log: "Hai sinh viên từ chối: “Bọn em không muốn lên ti vi.”" } } }, "Đổi khung chương trình, có thể bị từ chối", { tier: "sovereign" })], 0)),
  daily(TV, "tvh_cohost", [22, 60], 8, (c, N) => { const r = role(c, "rival")!; return T("Người dẫn cặp", `${N(r)} dẫn cặp với bạn đã ba mùa. Tuần này ${N(r)} nói trước câu đùa bạn chuẩn bị cả tuần, và nhận trọn tràng cười.`, [
    C("Nói chuyện riêng sau buổi ghi hình", { gamble: { p: 0.6, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.25, note: "chia lại lời thoại cho công bằng" }, log: "Hai người chia lại kịch bản. Mùa sau là mùa hay nhất." }, lose: { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "bị gọi ra nói chuyện riêng sau buổi ghi hình" }, log: "Họ phủ nhận, rồi kể lại với cả ê-kíp." } } }, "Có thể làm lành, có thể thành chuyện", { tier: "awakened" }),
    C("Cướp lời lại ở số sau", { counters: { tvh_fame: 1 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "cướp lời nhau trên sóng" }, rel: -2 }, "Thắng một ván, khán giả thấy căng"),
    C("Bỏ qua", { happy: -2 })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(TV, "tvh_season", [22, 60], 7, (c) => T("Ba chương trình một ngày", vary("tvs", c.age, [c.country === "VN" ? "Mùa chương trình Tết, bạn nhận dẫn ba chương trình mỗi ngày, ngủ trong xe giữa các trường quay." : "Mùa lễ cuối năm, bạn nhận dẫn ba chương trình mỗi ngày, ngủ trong xe giữa các trường quay.", "Một nhãn hàng muốn bạn dẫn sự kiện ra mắt ở mười thành phố trong mười ngày."]), [
    C("Nhận hết", { money: 0.15, health: -4, rel: -2, counters: { tvh_fame: 1 } }, "Tiền mùa này, sức của mùa sau"),
    C("Chỉ nhận một nửa", { money: 0.06, health: 1, flags: ["tvh_pace"] }, "Ít tiền hơn, còn giọng")], 0)),
  daily(TV, "tvh_spokes", [28, 60], 99, () => T("Ghế người phát ngôn", "Một cơ quan nhà nước mời bạn làm người phát ngôn: lương ổn định, không ai chấm điểm khuôn mặt bạn mỗi tối. Đổi lại, mỗi câu bạn nói đều do người khác viết.", [
    C("Nhận, rời màn hình giải trí", { ...leave(TV), flags: ["ex_tv_host", "tvh_spokesperson"] }, "Ổn định, lời không còn của mình"),
    C("Nhận, nếu được tự viết câu trả lời", { gamble: { p: 0.3, win: { ...leave(TV), agency: 0.02, flags: ["ex_tv_host", "tvh_spokesperson"], log: "Họ đồng ý thử. Lần đầu có người phát ngôn trả lời không cần giấy." }, lose: { log: "Họ cảm ơn, rồi mời người khác." } } }, "Có thể đổi cách làm, có thể mất ghế", { tier: "sovereign" }),
    C("Ở lại với sóng", { happy: 1, counters: { tvh_fame: 1 } }, "Bấp bênh, vẫn là sân khấu của mình")], 2), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(TV, "tvh_family", [24, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Gia đình trước ống kính", `Một chương trình thực tế mời bạn và ${N(k)} tham gia: hai tháng, máy quay đặt trong nhà, cát-xê bằng nửa năm lương.`, [
      C("Nhận, cả nhà lên hình", { money: 0.5, counters: { tvh_fame: 1 }, trust: { npc: k, delta: -0.15 } }, "Tiền và tiếng, con mất hai tháng riêng tư"),
      C("Từ chối, giữ con khỏi ống kính", { trust: { npc: k, delta: 0.1 }, flags: ["tvh_kids_private"] }, "Mất cát-xê, con được yên"),
      C(`Hỏi ý ${N(k)}, đặt luật không quay phòng con`, { trust: { npc: k, delta: 0.2 }, promise: { to: k, what: "không để máy quay vào phòng con", years: 1 }, money: 0.3 }, "Ít cảnh hơn, con có tiếng nói", { tier: "awakened" })], 1, { npc: k });
    const s = role(c, "spouse");
    if (s) return T("Người ngồi cạnh người nổi tiếng", `${N(s)} bị người lạ chụp ảnh lúc đi chợ, rồi bị bình luận cả về cách ăn mặc. Tối đó ${N(s)} hỏi: “Mình phải sống thế này mãi à?”`, [
      C("Không đưa người nhà lên mạng nữa", { trust: { npc: s, delta: 0.15 }, counters: { tvh_fame: -1 }, flags: ["tvh_family_private"] }, "Bớt chuyện để kể, nhà yên hơn"),
      C("Cùng xuất hiện, để người ta quen dần", { trust: { npc: s, delta: -0.1 }, counters: { tvh_fame: 1 } }, "Nổi hơn, người kia không chọn điều này"),
      C("Hứa nghỉ sóng một năm sau mùa này", { trust: { npc: s, delta: 0.1 }, promise: { to: s, what: "nghỉ sóng một năm sau mùa này", years: 2 } }, "Giữ nhà, mất đà nghề", { tier: "awakened" })], 0, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Khoe khắp xóm", `${N(p)} đi đâu cũng mang theo ảnh bạn trên ti vi. Giờ ${N(p)} nhờ bạn giới thiệu sản phẩm của một người quen ngay trên sóng.`, [
      C("Nhận lời cho bố mẹ vui", { trust: { npc: p, delta: 0.2 }, counters: { honest: -1, tvh_fame: -1 } }, "Bố mẹ vui, bạn bị nhắc nhở"),
      C("Từ chối nhẹ nhàng, giải thích luật đài", { trust: { npc: p, delta: -0.1 }, bw: -1 }),
      C("Mời bố mẹ đến xem một buổi ghi hình", { trust: { npc: p, delta: 0.15 }, money: -0.02, happy: 2 })], 0, { npc: p });
  }),

  /* ================================================================ STREAMER (stm_) */

  /* ---------- năng khiếu ---------- */
  talent(ST, "stm_t_commentary", [10, 16], () => true, () => T("Bình luận viên trong phòng khách", "Bạn hay vừa chơi game vừa bình luận như người tường thuật bóng đá. Đám em họ bỏ cả ti vi để ngồi xem bạn chơi. Một đứa bảo: “Phải phát lên mạng đi chứ!”", [
    C("Xin dùng máy tính nhà để thử phát", { flags: [talentFlag(ST)], counters: { talents_seen: 1 }, bw: -2, money: -0.02 }, "Mất giờ học, có khán giả đầu tiên"),
    C("Chơi cho vui, lo học", { counters: { talents_seen: 1 }, know: 2 })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(ST, "stm_d_twelve", [15, 28], () => true, () => T("Mười hai người xem", "Bạn phát thử một ván game lúc khuya. Mười hai người xem ở lại đến hai giờ sáng, một người gửi tặng một khoản nhỏ kèm dòng chữ: “Mai phát tiếp nhé.”", [
    C("Phát mỗi tối, đặt lịch cố định", { ...become(ST), counters: { doors_seen: 1 }, health: -2, bw: -3 }, "Mất ngủ, có một cộng đồng"),
    C("Phát khi rảnh", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(ST), log: "Mười hai người thành hai trăm. Bạn bắt đầu có lịch phát cố định." }, lose: { log: "Mỗi lần bạn phát lại, người xem cũ đã đi chỗ khác." } } }),
    C("Tắt máy, đi ngủ", { counters: { doors_seen: 1 }, health: 1 })], 1)),
  door(ST, "stm_d_layoff", [20, 35], (c) => !c.has_job || c.econ_phase === "crisis", () => T("Mất việc, còn bộ máy tính", "Công ty cắt giảm, bạn ra về với một tháng lương và bộ máy tính chơi game trong căn phòng thuê. Buổi phát thử tuần trước có ba trăm người xem.", [
    C("Cho mình sáu tháng sống bằng phát trực tiếp", { ...become(ST), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02 }, "Đốt tiền tiết kiệm, đặt cược vào chính mình"),
    C("Đi tìm việc, phát cho vui", { counters: { doors_seen: 1 }, money: 0.03 }, "Chắc ăn, cơ hội nguội dần")], 1)),
  door(ST, "stm_d_ladder", [16, 30], () => true, (c) => T("Hạng một máy chủ", "Bạn leo lên hạng một bảng xếp hạng máy chủ. Một đội thể thao điện tử nhắn mời thử việc, cùng lúc hàng trăm người xin bạn phát trực tiếp cách chơi.", [
    C("Phát trực tiếp, dạy cách chơi", { ...become(ST), counters: { doors_seen: 1 }, flags: ["stm_coach_stream"] }, "Tự do, thu nhập bấp bênh"),
    c.age <= 24
      ? C("Thử việc ở đội tuyển", { ...become("esports"), counters: { doors_seen: 1 } }, "Kỷ luật đội, có thể đi xa hơn")
      : C("Nhận làm huấn luyện cho đội", { counters: { doors_seen: 1 }, money: 0.05, flags: ["stm_team_coach"] }, "Lương đều, đứng sau người khác"),
    C("Giữ hạng cho vui", { counters: { doors_seen: 1 }, happy: 1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(ST, 1, 1, (c) => T("Khoản tặng có điều kiện", `Một người xem lạ tặng bạn ${c.age < 18 ? "số tiền bằng cả tháng tiêu vặt" : "số tiền bằng một tháng lương"}, kèm yêu cầu: thức phát liền bốn mươi tám tiếng, không ngủ.`, [
    C("Nhận, làm thử thách", { counters: step(c, ST, { stm_viewers: 1 }), money: c.age < 18 ? 0.04 : 0.08, health: -5, flags: ["stm_stunts"] }, "Tiền và người xem, cơ thể trả giá"),
    C("Hoàn tiền, đặt luật kênh: không thử thách hại người", { counters: step(c, ST), flags: ["stm_channel_rules"], agency: 0.02, gamble: { p: 0.5, win: { counters: { stm_viewers: 1 }, log: "Người xem quý bạn hơn. Luật kênh được ghim lên đầu." }, lose: { happy: -2, log: "Vài người bỏ đi, chê bạn nhát." } } }, "Mất tiền, có luật của riêng mình", { tier: "sovereign" }),
    C("Nhận tiền, phát mười tiếng rồi đi ngủ", { counters: step(c, ST, { honest: -1 }), money: c.age < 18 ? 0.04 : 0.08, gamble: { p: 0.5, win: { log: "Không ai đòi lại." }, lose: { counters: { stm_viewers: -1 }, log: "Người tặng chụp màn hình, gọi bạn là kẻ lừa." } } }, "Giữ tiền, có thể mang tiếng")], 0)),
  beat(ST, 2, 3, (c) => T("Công ty quản lý kênh", `Một công ty quản lý kênh đề nghị bao trọn: lương cứng mỗi tháng, lo nhà tài trợ, lo kỹ thuật.${f(c, "stm_stunts") ? " Họ nói thích những thử thách liều của bạn và muốn mỗi tuần một cái." : ""} Đổi lại họ giữ một nửa thu nhập và quyết bạn phát gì trong ba năm.`, [
    C("Ký", { counters: step(c, ST), income_mult: 1.5, flags: ["stm_agency_contract"] }, "Ổn định, mất quyền chọn nội dung"),
    C("Tự làm, tự lo", { counters: step(c, ST), income_mult: 1.1, bw: -4, flags: ["stm_indie"] }, "Mệt, giữ được kênh"),
    C("Lập nhóm streamer cùng thương lượng", { counters: step(c, ST), gamble: { p: 0.4, win: { income_mult: 1.35, flags: ["stm_collective"], log: "Mười hai kênh cùng ký một bản hợp đồng chung, giữ quyền nội dung." }, lose: { happy: -2, log: "Nhóm tan sau ba cuộc họp. Công ty ký với từng người lẻ." } } }, "Đổi luật chơi, có thể tan nhóm", { tier: "sovereign" })], 0)),
  beat(ST, 3, 4, (c) => {
    if (f(c, "stm_gambling_ads")) return T("Giấy mời làm việc", "Nền tảng khóa kênh của bạn trong một đêm. Sáng hôm sau, cơ quan điều tra mời bạn lên làm việc về các trang cá cược bạn từng quảng cáo. Trong đơn tố cáo có tên nhiều người xem chưa đủ tuổi đã mất tiền.", [
      C("Khai hết, nộp lại tiền quảng cáo", { counters: step(c, ST, { stm_viewers: -1 }), money: -0.6, income_mult: 0.6, flags: ["stm_cleared"] }, "Mất trắng tiền tài trợ, giữ được lý lịch", { longterm: true }),
      C("Thuê luật sư, chối mọi thứ", { counters: step(c, ST), money: -0.3, gamble: { p: 0.5, win: { flags: ["stm_banned"], log: "Bạn thoát án, nhưng không nền tảng nào nhận bạn quay lại." }, lose: { close_doors: ["clean_record"], income_mult: 0.4, flags: ["stm_banned"], log: "Bạn bị kết án vì quảng cáo cờ bạc trái phép." } } }, "Có thể thoát, có thể mang án"),
      C("Bỏ nghề, xin lỗi người xem", { counters: step(c, ST), ...leave(ST), money: -0.3, flags: ["ex_streamer"] }, "Hết kênh, bớt một gánh")], 0);
    const shield = f(c, "stm_mod_team") || f(c, "stm_channel_rules");
    return T("Địa chỉ nhà trên diễn đàn", `Ai đó đăng địa chỉ nhà bạn lên một diễn đàn. Tuần này có người lạ gõ cửa lúc ba giờ sáng${c.married ? ", cả nhà không ai ngủ được" : ""}.${shield ? " Đội kiểm duyệt của kênh đã thức cả đêm gom bằng chứng." : ""}`, [
      C("Tạm nghỉ, chuyển nhà", { counters: step(c, ST, { stm_viewers: -1 }), money: -0.3, flags: ["stm_moved"] }, "Mất tiền và đà, có chỗ an toàn"),
      C("Phát tiếp, nói thẳng chuyện này với khán giả", { counters: step(c, ST), gamble: { p: shield ? 0.65 : 0.45, win: { counters: { stm_viewers: 2 }, flags: ["stm_doxx_survivor"], log: "Cộng đồng của bạn gom đủ bằng chứng gửi cơ quan chức năng. Người tung địa chỉ bị xử lý." }, lose: { health: -5, bw: -8, log: "Càng nói, càng nhiều người tò mò kéo đến." } } }, "Có thể được che chở, có thể tệ hơn"),
      C("Bỏ nghề, trở về đời thường", { counters: step(c, ST), ...leave(ST), happy: 2, flags: ["ex_streamer"] }, "An toàn, mất thứ mình gây dựng")], 0);
  }, (c) => c.age >= 18),
  beat(ST, 4, 5, (c) => {
    const v = c.counters.stm_viewers ?? 0;
    if (f(c, "stm_banned") || f(c, "stm_cleared") || v <= -1) return T("Kênh mới, số không", "Bạn mở một kênh mới dưới cái tên khác. Buổi đầu có bốn người xem. Một người hỏi: “Có phải bạn là người ngày xưa không?”", [
      C("Nhận là mình, kể lại mọi chuyện", { counters: step(c, ST, { stm_viewers: 1 }), happy: 2, gamble: { p: 0.45, win: { income_mult: 1.2, flags: ["stm_comeback"], log: "Buổi kể chuyện ấy được xem nhiều hơn mọi buổi cũ." }, lose: { happy: -3, log: "Phần lớn bình luận là mắng." } } }, "Thật lòng, chưa chắc được tha", { tier: "awakened" }),
      C("Giấu tên, làm lại từ đầu", { counters: step(c, ST), income_mult: 0.8, flags: ["stm_new_name"] }, "Yên ổn, chậm"),
      C("Đi làm kỹ thuật cho một studio", { counters: step(c, ST), ...leave(ST), flags: ["stm_tech_job"] }, "Lương đều, hết sân khấu")], 1);
    if (f(c, "stm_agency_contract")) return T("Công ty muốn kênh, không cần bạn", "Hợp đồng sắp hết. Công ty quản lý muốn giữ tên kênh và đưa một gương mặt khác vào, hoặc bạn ký tiếp với phần chia thấp hơn. Họ nói kênh là tài sản của công ty.", [
      C("Bán tên kênh cho công ty", { counters: step(c, ST), money: 0.8, ...leave(ST) }, "Một khoản lớn, mất tên mình"),
      C("Ký tiếp, phần chia thấp hơn", { counters: step(c, ST), income_mult: 0.8 }, "Còn kênh, ít tiền hơn"),
      C("Công khai hợp đồng, rủ người xem sang kênh mới", { counters: step(c, ST), gamble: { p: 0.5 + (v >= 2 ? 0.15 : 0), win: { counters: { stm_viewers: 2 }, income_mult: 1.3, flags: ["stm_own_studio"], log: "Hai phần ba người xem đi theo bạn trong một tuần." }, lose: { money: -0.3, log: "Công ty kiện vì vi phạm hợp đồng. Bạn thua, phải bồi thường." } } }, "Giữ được mình, có thể bị kiện", { tier: "sovereign" })], 1);
    return T("Buổi gây quỹ hai mươi bốn giờ", `Buổi phát gây quỹ hai mươi bốn giờ của bạn quyên được số tiền đủ xây một trường học.${v >= 3 ? " Ba hãng game cùng gọi đề nghị đầu tư studio." : " Một hãng game đề nghị đầu tư studio."}`, [
      C("Mở studio, thuê người", { counters: step(c, ST), money: -0.5, income_mult: 1.4, flags: ["stm_own_studio"] }, "Thành ông chủ, ít được phát hơn"),
      C("Giữ nhỏ, ở lại với cộng đồng", { counters: step(c, ST, { stm_viewers: 1 }), happy: 4 }, "Không giàu thêm, không mất mình"),
      C("Công khai từng đồng quỹ, mời người xem giám sát", { counters: step(c, ST, { stm_viewers: 2 }), bw: -4, agency: 0.02, flags: ["stm_open_ledger"] }, "Mất công, được tin lâu dài", { tier: "awakened" })], 0);
  }, (c) => c.age >= 18),
  beat(ST, 5, 6, (c) => T("Người xem năm mười ba tuổi", `Một người từng xem bạn từ năm mười ba tuổi giờ có kênh riêng, đông gấp mười kênh bạn.${f(c, "stm_own_studio") ? " Người ấy từng thực tập ở studio của bạn." : ""} Người ấy mời bạn lên phát chung, giới thiệu bạn là “người dạy tôi cách nói chuyện với người lạ”.`, [
    C("Lên phát, vui vẻ nhường sân", { counters: step(c, ST), happy: 4, rel: 2, flags: ["stm_passed_on"] }, "Nhường ánh đèn, được một lời cảm ơn"),
    C("Nhân dịp này kể lại cả hành trình", { counters: step(c, ST, { stm_viewers: 1 }), money: 0.1, gamble: { p: 0.5, win: { log: "Buổi phát được cắt thành một phim tài liệu ngắn." }, lose: { happy: -2, log: "Người xem trẻ thấy chuyện cũ dài dòng." } } }, "Có thể sống lại, có thể lạc lõng"),
    C("Tắt máy, nghỉ hẳn", { counters: step(c, ST), ...leave(ST), happy: 3, health: 3 }, "Được ngủ đêm, khép một phần đời")], 0), (c) => c.age >= 34),

  /* ---------- chuyện thường ngày ---------- */
  daily(ST, "stm_betting", [18, 50], 9, () => T("Nhà tài trợ trả gấp ba", "Một trang cá cược không có giấy phép đề nghị tài trợ gấp ba mọi nhà tài trợ cũ cộng lại, chỉ cần treo đường dẫn dưới mỗi buổi phát. Một phần ba người xem của bạn chưa đủ mười tám tuổi.", [
    C("Nhận", { money: 0.4, flags: ["stm_gambling_ads"], counters: { honest: -2 } }, "Tiền nhiều, người xem trẻ thua thật"),
    C("Từ chối", { counters: { honest: 1 } }, "Bỏ qua khoản lớn nhất từng thấy"),
    C("Từ chối, và nói công khai trên kênh", { counters: { honest: 1, stm_viewers: 1 }, gamble: { p: 0.7, win: { log: "Nhiều kênh khác lên tiếng theo." }, lose: { bw: -4, log: "Kênh bị tràn ngập bình luận dọa nạt suốt một tuần." } } }, "Bảo vệ người xem, có thể bị nhắm vào", { tier: "awakened" })], 0)),
  daily(ST, "stm_chat", [15, 50], 7, (c) => T("Khung chat lúc nửa đêm", vary("stc", c.age, ["Khung chat tràn những câu chửi nhắm vào một khách mời nữ. Họ gõ nhanh hơn bạn đọc kịp.", "Một nhóm người xem của bạn rủ nhau vào kênh của một streamer nhỏ để chửi, và gọi đó là đi chơi."]), [
    C("Lập đội kiểm duyệt, chặn thẳng tay", { flags: ["stm_mod_team"], counters: { stm_viewers: -1 }, bw: -2 }, "Mất người xem ồn ào, chat sạch"),
    C("Để chat tự do cho vui", { counters: { stm_viewers: 1 }, rel: -2, happy: -2 }, "Đông người, khó chịu"),
    C("Dừng game, nói chuyện thẳng với chat", { gamble: { p: 0.55, win: { counters: { stm_viewers: 1 }, flags: ["stm_channel_rules"], log: "Chat im một lúc, rồi có người xin lỗi." }, lose: { happy: -3, log: "Đoạn bạn nói bị cắt ra chế giễu." } } }, "Có thể đổi văn hóa kênh, có thể bị chế", { tier: "awakened" })], 1)),
  daily(ST, "stm_body", [15, 50], 8, (c) => T("Mười hai tiếng không đứng dậy", vary("stb", c.age, ["Bạn phát mười hai tiếng mỗi ngày. Lưng đau đến mức phải nằm sấp mới ngủ được.", "Mắt bạn khô rát, cổ tay tê mỗi sáng. Bác sĩ nói đây là bệnh của người già, rồi hỏi lại bạn bao nhiêu tuổi."]), [
    C("Giữ lịch, uống thuốc giảm đau", { money: c.age < 18 ? 0.02 : 0.05, health: -5, counters: { stm_viewers: 1 } }, "Giữ người xem, cơ thể trả dần"),
    C("Cắt còn sáu tiếng, tập thể dục", { health: 4, counters: { stm_viewers: -1, exercise: 1 } }, "Đỡ đau, tụt hạng"),
    C("Phát trực tiếp cả buổi tập phục hồi", { health: 2, gamble: { p: 0.5, win: { counters: { stm_viewers: 1 }, log: "Người xem tập cùng bạn mỗi sáng." }, lose: { happy: -1, log: "Lượt xem giảm một nửa trong giờ tập." } } }, "Có thể giữ cả hai, có thể không ai xem", { tier: "awakened" })], 0)),
  daily(ST, "stm_dm", [18, 50], 9, () => T("Tin nhắn lúc ba giờ sáng", "Một người xem quen thuộc nhắn riêng: bạn là người duy nhất họ còn trò chuyện mỗi ngày, và họ mệt đến mức không muốn tiếp tục nữa.", [
    C("Trả lời, cùng họ tìm người có chuyên môn", { bw: -5, counters: { kind: 1 }, flags: ["stm_helped_viewer"], gamble: { p: 0.75, win: { happy: 3, log: "Tuần sau họ quay lại khung chat, gõ một dòng: “Mình đã đi gặp bác sĩ.”" }, lose: { happy: -4, log: "Họ không xuất hiện nữa. Bạn không bao giờ biết vì sao." } } }, "Mất sức, có thể giữ được một người"),
    C("Ghim số đường dây hỗ trợ lên kênh cho mọi người", { flags: ["stm_support_pinned"], counters: { stm_viewers: 1 }, rel: 1 }, "Giúp được nhiều người, không riêng ai", { tier: "sovereign" }),
    C("Không trả lời tin nhắn riêng", { bw: 2, happy: -3 }, "Giữ ranh giới, mang theo câu hỏi")], 0)),
  daily(ST, "stm_clip", [16, 50], 8, (c) => T("Câu nói bị cắt", vary("stl", c.age, ["Một đoạn mười giây bạn nói lúc thua trận bị cắt ra, nghe như bạn chửi cả một vùng miền.", "Một tài khoản chuyên cắt ghép đặt câu nói của bạn cạnh một hình ảnh khác, thành bạn đang chế giễu người khuyết tật."]), [
    C("Đăng toàn bộ đoạn gốc", { gamble: { p: 0.6, win: { counters: { stm_viewers: 1 }, log: "Người xem tự so và quay lại bảo vệ bạn." }, lose: { counters: { stm_viewers: -1 }, log: "Không ai xem đoạn gốc dài hai tiếng." } } }, "Sự thật dài, tin đồn ngắn"),
    C("Xin lỗi cho xong", { counters: { stm_viewers: -1 }, happy: -2, flags: ["stm_apologized_unfair"] }, "Bão qua nhanh, nhận một lỗi không phải của mình"),
    C("Im lặng phát tiếp", { bw: -3 })], 2)),
  daily(ST, "stm_split", [16, 50], 9, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Tiền tài trợ chung", `${N(fr)} phát chung với bạn từ những ngày đầu. Nhà tài trợ mới chuyển cả khoản tiền vào tài khoản của bạn, và ${N(fr)} không biết con số chính xác.`, [
    C("Chia đôi, gửi kèm ảnh hợp đồng", { memory: { npc: fr, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia đôi tiền tài trợ phát chung" }, counters: { honest: 1 } }, "Mất nửa khoản, giữ trọn một người bạn"),
    C("Giữ phần lớn, nói là họ trả ít", { money: c.age < 18 ? 0.03 : 0.1, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.3, fuse_years: [1, 6], note: "giữ phần tiền tài trợ của người phát chung" } }, "Thêm tiền, một bí mật với bạn thân"),
    C("Lập giấy chia tiền cho mọi lần sau", { memory: { npc: fr, tag: "WIN_WIN_DEAL", weight: 0.2, note: "lập giấy chia tiền rõ ràng" }, bw: -2, flags: ["stm_partner_contract"] }, "Ngại lúc đầu, không cãi nhau về sau", { tier: "awakened" })], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(ST, "stm_algorithm", [16, 50], 8, (c) => T("Thuật toán đổi trong một đêm", "Nền tảng đổi cách gợi ý. Lượt xem của bạn giảm bảy phần mười trong một tuần, dù bạn vẫn phát như cũ.", [
    C("Chạy theo xu hướng mới", { counters: { stm_viewers: 1 }, happy: -3, bw: -3 }, "Lấy lại lượt xem, làm thứ mình không thích"),
    C("Mở thêm kênh ở nền tảng khác", { bw: -5, money: c.age < 18 ? -0.02 : -0.05, flags: ["stm_multi_platform"] }, "Mệt gấp đôi, bớt phụ thuộc"),
    C("Lập trang hội viên, người xem trả trực tiếp", { gamble: { p: 0.45, win: { income_mult: 1.15, flags: ["stm_member_funded"], log: "Bốn trăm người đăng ký hội viên. Thuật toán không còn quyết bữa cơm của bạn." }, lose: { happy: -2, log: "Chưa đến năm mươi người đăng ký." } } }, "Thoát thuật toán, nếu đủ người ở lại", { tier: "sovereign" })], 0)),
  daily(ST, "stm_publisher", [16, 50], 8, (c) => T("Bản chơi thử có điều kiện", "Một hãng game gửi bạn bản chơi thử trước ngày ra mắt, kèm một khoản tiền. Điều kiện: không nhắc đến lỗi game, mà game thì lỗi khắp nơi.", [
    C("Nhận, chỉ khen", { money: c.age < 18 ? 0.03 : 0.06, counters: { honest: -1, stm_viewers: -1 } }, "Có tiền, người xem mua phải game lỗi"),
    C("Trả tiền, chơi và nói thật", { counters: { honest: 1, stm_viewers: 1 }, flags: ["stm_honest_reviews"] }, "Mất hãng game, được người xem"),
    C("Nhận, nhưng ghi rõ là được trả tiền", { money: c.age < 18 ? 0.02 : 0.04, gamble: { p: 0.5, win: { log: "Hãng game chấp nhận. Người xem cảm ơn sự rõ ràng." }, lose: { flags: ["stm_publisher_blacklist"], log: "Hãng game đưa bạn vào danh sách không hợp tác." } } }, "Minh bạch, có thể mất hãng", { tier: "awakened" })], 0)),
  daily(ST, "stm_irl", [18, 50], 8, (c) => T("Phát trực tiếp ngoài phố", vary("sti", c.age, ["Bạn phát trực tiếp ở chợ đêm. Một bà cụ bán hàng xua tay không muốn lên hình, khung chat lại đòi bạn quay gần hơn.", "Bạn phát trực tiếp trên tàu điện. Một người say gây gổ với hành khách, khung chat thích thú và lượt xem tăng gấp ba."]), [
    C("Quay tiếp, chiều khung chat", { counters: { stm_viewers: 1 }, rel: -3, gamble: { p: 0.6, win: { log: "Buổi phát đông nhất tháng." }, lose: { flags: ["stm_privacy_complaint"], log: "Người trong video khiếu nại. Nền tảng gỡ buổi phát và cảnh cáo kênh." } } }, "Tăng lượt xem, có thể bị khiếu nại"),
    C("Quay ống kính đi, xin lỗi", { counters: { stm_viewers: -1, kind: 1 }, rel: 1 }, "Mất cảnh hay, giữ phép lịch sự"),
    C("Tắt phát, giúp một tay", { happy: 2, counters: { kind: 1 }, flags: ["stm_offcam_help"] }, "Mất buổi phát, làm được một việc tử tế")], 0)),
  daily(ST, "stm_tax", [20, 50], 99, () => T("Thư của cơ quan thuế", "Cơ quan thuế gửi thư: ba năm thu nhập từ quà tặng và tài trợ của bạn chưa được kê khai. Kèm theo là con số truy thu và tiền phạt.", [
    C("Nộp đủ, thuê kế toán từ nay", { money: -0.3, flags: ["stm_tax_clean"] }, "Mất một khoản, ngủ yên"),
    C("Khai bớt, cãi từng khoản", { money: -0.1, gamble: { p: 0.5, win: { log: "Cơ quan thuế chấp nhận một phần." }, lose: { money: -0.4, flags: ["stm_tax_case"], log: "Hồ sơ bị chuyển sang thanh tra. Tên kênh của bạn lên báo." } } }, "Có thể đỡ, có thể tệ hơn"),
    C("Xin nộp dần", { custom: "borrow:0.3", bw: -2 }, "Nhẹ tháng này, nợ kéo dài")], 0)),

  /* ---------- gia đình ---------- */
  cross(ST, "stm_family", [18, 50], (c) => !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse");
    if (s) return T("Sống lệch múi giờ", `Bạn phát từ tám giờ tối đến ba giờ sáng. ${N(s)} dậy lúc sáu giờ đi làm. Đã hai tuần hai người chỉ gặp nhau qua mảnh giấy dán trên tủ lạnh.`, [
      C("Đổi lịch phát sang ban ngày", { counters: { stm_viewers: -1 }, trust: { npc: s, delta: 0.2 } }, "Mất khung giờ vàng, có lại bữa tối"),
      C("Giữ lịch, hứa nghỉ hai tối mỗi tuần", { promise: { to: s, what: "nghỉ phát hai tối mỗi tuần", years: 1 }, trust: { npc: s, delta: 0.05 } }, "Một lời hứa phải giữ"),
      C("Giữ lịch, giải thích đây là nghề", { trust: { npc: s, delta: -0.2 }, counters: { stm_viewers: 1 } }, "Giữ người xem, căng trong nhà")], 1, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Streamer là nghề gì", `${N(p)} hỏi hàng xóm “streamer là nghề gì”, rồi về bảo bạn: “Ngồi chơi điện tử cả đêm thì sau này lấy gì mà sống?”`, [
      C("Mời ngồi xem một buổi phát", { gamble: { p: 0.55, win: { trust: { npc: p, delta: 0.25 }, log: `${N(p)} ngồi xem đến cuối, còn gõ một dòng vào khung chat.` }, lose: { trust: { npc: p, delta: -0.1 }, log: `${N(p)} xem mười phút rồi đi ngủ.` } } }),
      C("Cho xem bảng thu nhập tháng", { trust: { npc: p, delta: 0.1 }, flags: ["stm_parents_know_income"] }, "Bớt lo, nhưng giờ họ hỏi vay tiền"),
      C("Không giải thích nữa", { trust: { npc: p, delta: -0.1 }, happy: -2 })], 0, { npc: p });
  }),

  /* ================================================================ NGƯỜI CÓ ẢNH HƯỞNG TRÊN MẠNG (kol_) */

  /* ---------- năng khiếu ---------- */
  talent(KO, "kol_t_photo", [12, 16], () => true, () => T("Bức ảnh bữa sáng", "Bạn chụp bát mì ở quán ăn đầu phố, viết vài dòng hài hước rồi đăng lên. Hôm sau quán đông gấp đôi, bà chủ cho bạn ăn miễn phí cả tuần.", [
    C("Lập trang riêng, đăng mỗi ngày", { flags: [talentFlag(KO)], counters: { talents_seen: 1 }, bw: -2, happy: 2 }, "Mất giờ học, học được cách khiến người ta để ý"),
    C("Cảm ơn bà, thôi không đăng nữa", { counters: { talents_seen: 1 }, know: 1 })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(KO, "kol_d_viral", [16, 35], () => true, (c) => T("Hai triệu lượt xem", `Một đoạn video bạn quay ${c.has_job ? "trong giờ nghỉ ở chỗ làm" : "lúc ngồi chờ xe buýt"} bỗng có hai triệu lượt xem. Sáng nay hộp thư có mười bảy lời mời hợp tác của các nhãn hàng.`, [
    C(c.has_job ? "Nghỉ việc, làm nội dung toàn thời gian" : "Làm nội dung toàn thời gian", { ...become(KO), counters: { doors_seen: 1 }, money: c.age < 18 ? -0.02 : -0.08, agency: 0.02 }, "Đặt cược vào một lần may"),
    C("Nhận vài hợp đồng nhỏ, giữ đời thường", { counters: { doors_seen: 1 }, money: c.age < 18 ? 0.03 : 0.05, gamble: { p: 0.3, win: { ...become(KO), log: "Hợp đồng nhỏ thành hợp đồng lớn. Bạn không còn thời gian cho việc cũ." }, lose: { log: "Ba tháng sau, không ai nhắc đến đoạn video nữa." } } }, "Chắc ăn, có thể lỡ thời điểm"),
    C("Ẩn video, sống như cũ", { counters: { doors_seen: 1 }, happy: -1 })], 1)),
  door(KO, "kol_d_shop", [18, 40], (c) => f(c, "life_ecommerce") || f(c, "own_business") || f(c, "shop_active"), (c) => T("Người bán hàng nói chuyện có duyên", "Bạn phát trực tiếp bán hàng mỗi tối. Người ta ở lại nghe bạn nói nhiều hơn là mua hàng. Một công ty quản lý người nổi tiếng mời bạn thôi bán hàng, chỉ làm gương mặt.", [
    C("Nhận, làm gương mặt", { ...become(KO), counters: { doors_seen: 1 }, flags: ["kol_agency"] }, "Có người lo, phải theo lịch của họ"),
    f(c, "life_ecommerce")
      ? C("Ở lại bán hàng, nói chuyện nhiều hơn", { counters: { doors_seen: 1 }, money: 0.05 }, "Vất vả, hàng là của mình")
      : C("Ở lại bán hàng, mở cửa hàng trên mạng", { ...become("ecommerce"), counters: { doors_seen: 1 } }, "Vất vả, hàng là của mình"),
    C("Từ chối cả hai", { counters: { doors_seen: 1 } })], 0)),
  door(KO, "kol_d_cause", [18, 40], () => true, () => T("Bài viết về con đường ngập", "Bạn đăng ảnh con đường trước nhà ngập đến đầu gối sau mỗi cơn mưa, kèm bảng tiến độ công trình chậm hai năm. Bài được chia sẻ hàng chục nghìn lần, chính quyền hứa sửa trong tháng.", [
    C("Làm tiếp, thành tiếng nói của khu phố", { ...become(KO), counters: { doors_seen: 1 }, flags: ["kol_cause"] }, "Có ảnh hưởng, phải nuôi nó bằng quảng cáo"),
    C("Đi vận động lâu dài, không nhận quảng cáo", { ...become("activist"), counters: { doors_seen: 1 } }, "Nghèo hơn, không ai mua được bạn", { tier: "awakened" }),
    C("Dừng ở đây", { counters: { doors_seen: 1 }, rel: 1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(KO, 1, 1, (c) => T("Hợp đồng cấm ghi chữ quảng cáo", `Một hãng mỹ phẩm gửi bạn một hộp sản phẩm và ${c.age < 18 ? "một khoản tiền nhỏ" : "số tiền bằng một tháng lương"} cho một bài đăng. Hợp đồng ghi rõ: không được viết đây là quảng cáo.`, [
    C("Đăng như thể tự mua", { counters: step(c, KO, { kol_trust: -1 }), money: c.age < 18 ? 0.04 : 0.08, flags: ["kol_hidden_ads"] }, "Tiền dễ, người theo dõi bị dắt mũi"),
    C("Đòi được ghi rõ là quảng cáo", { counters: step(c, KO), gamble: { p: 0.5, win: { money: c.age < 18 ? 0.03 : 0.06, counters: { kol_trust: 1 }, log: "Hãng đồng ý. Bài đăng ghi rõ chữ “được tài trợ”." }, lose: { happy: -2, log: "Hãng hủy hợp đồng, chọn người khác." } } }, "Ngay thẳng, có thể mất hợp đồng"),
    C("Dùng thử ba tháng rồi mới quyết", { counters: step(c, KO, { kol_trust: 1 }), flags: ["kol_tests_first"], happy: -1 }, "Chậm, nói được điều mình biết", { tier: "awakened" })], 0)),
  beat(KO, 2, 3, (c) => T("Còn thiếu hai trăm nghìn người", `Bạn có tám trăm nghìn người theo dõi. ${f(c, "kol_agency") ? "Công ty quản lý của bạn" : "Một công ty quản lý"} nói các nhãn hàng lớn chỉ ký với tài khoản từ một triệu, và họ có thể “bơm” thêm hai trăm nghìn người theo dõi trong một tuần.`, [
    C("Mua, đạt mốc cho kịp", { counters: step(c, KO), income_mult: 1.6, flags: ["kol_bought_followers"] }, "Hợp đồng lớn, một quả bom hẹn giờ"),
    C("Đi chậm, chỉ người thật", { counters: step(c, KO, { kol_trust: 1 }), income_mult: 1.15 }, "Chậm hơn, không có gì phải giấu"),
    C("Công khai số liệu thật, đòi trả theo đơn bán", { counters: step(c, KO), gamble: { p: 0.45, win: { income_mult: 1.4, flags: ["kol_open_stats"], counters: { kol_trust: 2 }, log: "Hai nhãn hàng thử trả theo đơn. Bạn bán được nhiều hơn những tài khoản gấp đôi bạn." }, lose: { happy: -2, log: "Nhãn hàng nói họ không quen làm thế. Bạn vẫn kẹt ở tám trăm nghìn." } } }, "Đổi luật chơi, có thể không ai theo", { tier: "sovereign" })], 0)),
  beat(KO, 3, 4, (c) => {
    const kind = f(c, "kol_scam_promo") ? "scam" : f(c, "kol_bought_followers") ? "fake" : (f(c, "kol_hidden_ads") || f(c, "kol_false_health")) ? "ads" : "life";
    const view = {
      scam: ["Ứng dụng đầu tư sập", "Ứng dụng đầu tư bạn từng giới thiệu ngừng hoạt động sau một đêm. Hàng nghìn người theo dõi mất tiền, nhiều người là sinh viên. Họ kéo vào mọi bài đăng của bạn, đòi bạn trả."],
      fake: ["Bốn phần mười là tài khoản ảo", "Một trang chuyên soi số liệu công bố: bốn phần mười người theo dõi bạn là tài khoản ảo. Ba nhãn hàng gửi thư đòi hoàn tiền hợp đồng."],
      ads: ["Bảng tổng hợp quảng cáo trá hình", "Một nhóm người dùng gom mọi bài quảng cáo trá hình của bạn thành một bảng dài, kèm ảnh chụp hợp đồng bị lộ. Bảng ấy được chia sẻ hơn trăm nghìn lần."],
      life: ["Căn nhà thuê theo giờ", "Một người bạn cũ đăng bài dài: căn nhà trong ảnh của bạn là nhà thuê theo giờ, chuyến du lịch là của nhãn hàng, và bạn còn nợ cô ấy tiền từ ba năm trước."],
    }[kind];
    return T(view[0]!, view[1]!, [
      C("Phát trực tiếp xin lỗi, đền tiền", { counters: step(c, KO, { kol_trust: 1 }), money: kind === "scam" ? -0.8 : -0.3, flags: ["kol_owned_it"] }, "Mất tiền, có cơ hội được tha", { longterm: true }),
      C("Im lặng chờ bão qua", { counters: step(c, KO), gamble: { p: kind === "life" ? 0.6 : 0.4, win: { log: "Ba tuần sau người ta có chuyện khác để nói." }, lose: { income_mult: 0.5, counters: { kol_trust: -2 }, log: "Im lặng bị coi là nhận tội. Các nhãn hàng rút hết." } } }, "Có thể qua, có thể sụp hẳn"),
      ...(kind === "scam" ? [C("Nộp hết hợp đồng cho cơ quan điều tra", { counters: step(c, KO, { kol_trust: 1 }), bw: -6, flags: ["kol_witness"], gamble: { p: 0.6, win: { log: "Bạn được xác định là người làm chứng, không phải đồng phạm." }, lose: { close_doors: ["clean_record" as const], money: -0.4, log: "Bạn bị xử phạt vì quảng cáo cho hoạt động lừa đảo." } } }, "Giúp người mất tiền, có thể tự rước họa", { tier: "sovereign" })] : []),
      C("Xóa tài khoản, rời mạng", { counters: step(c, KO), ...leave(KO), happy: -2, flags: ["ex_influencer"] }, "Hết bị soi, mất những gì đã dựng")], 0);
  }, (c) => c.age >= 18),
  beat(KO, 4, 5, (c) => {
    const t = c.counters.kol_trust ?? 0;
    if (t <= -1) return T("Không còn ai gửi hàng", "Hộp thư hợp tác trống ba tháng nay. Những người theo dõi còn lại chủ yếu vào để mỉa mai. Một bên cho vay qua mạng đề nghị trả giá cao cho bất kỳ bài đăng nào bạn viết về họ.", [
      C("Nhận quảng cáo cho bất kỳ ai trả tiền", { counters: step(c, KO, { kol_trust: -2 }), money: 0.3, flags: ["kol_any_deal"] }, "Có tiền tháng này, mất nốt cái tên"),
      C("Làm lại kênh nhỏ, nói thật từ đầu", { counters: step(c, KO, { kol_trust: 2 }), income_mult: 0.6, happy: 2, flags: ["kol_restart"] }, "Nghèo đi, sạch lại", { longterm: true }),
      C("Rời mạng, đi làm việc khác", { counters: step(c, KO), ...leave(KO), flags: ["ex_influencer"] }, "Hết bị chấm điểm, học lại từ đầu")], 0);
    return T("Thương hiệu mang tên bạn", `${t >= 3 ? "Người theo dõi tin bạn đến mức hỏi bạn dùng gì để mua theo." : "Bạn đã đủ tiếng để có tên trên bao bì."} Một nhà máy đề nghị làm dòng sản phẩm riêng mang tên bạn; một tập đoàn khác muốn mua đứt tên bạn trong mười năm.`, [
      C("Ra thương hiệu riêng, vay vốn làm", { counters: step(c, KO), custom: "borrow:0.5", flags: ["kol_own_brand"], gamble: { p: 0.5 + (t >= 3 ? 0.15 : 0), win: { income_mult: 1.6, log: "Lô hàng đầu bán hết trong hai ngày." }, lose: { income_mult: 0.8, happy: -4, log: "Hàng tồn đầy kho. Bạn trả nợ bằng tiền quảng cáo suốt ba năm." } } }, "Có thể giàu, có thể ôm nợ"),
      C("Bán đứt tên cho tập đoàn", { counters: step(c, KO), money: 1.5, flags: ["kol_sold_name"] }, "Tiền lớn, mười năm không được nói khác họ"),
      C("Dùng tầm ảnh hưởng cho một chiến dịch xã hội", { counters: step(c, KO, { kol_trust: 2 }), income_mult: 0.8, agency: 0.03, flags: ["kol_cause"] }, "Ít tiền hơn, tên bạn gắn với một việc thật", { tier: "sovereign" })], 0);
  }, (c) => c.age >= 18),
  beat(KO, 5, 6, (c, N) => {
    if (f(c, "kol_kids_content")) {
      const k = role(c, "child");
      const tr = (d: number) => (k ? { trust: { npc: k, delta: d } } : {});
      return T("Con nhờ xóa video", `${k ? N(k) : "Đứa con"} từng xuất hiện trong hàng trăm video của bạn giờ đã lớn, gửi bạn một danh sách đường dẫn và nhờ xóa hết. Ở trường mới, bạn bè vẫn gửi cho nhau đoạn nó khóc lúc ba tuổi.`, [
        C("Xóa hết, kể cả những video kiếm nhiều nhất", { counters: step(c, KO), income_mult: 0.85, happy: 2, flags: ["kol_deleted_kids"], ...tr(0.3) }, "Mất thu nhập cũ, trả con một phần tuổi thơ"),
        C("Xóa vài cái, giữ những cái dễ thương", { counters: step(c, KO), ...tr(-0.2) }, "Giữ tiền, con thấy mình không được nghe"),
        C("Xóa hết và nói công khai về cái giá ấy", { counters: step(c, KO, { kol_trust: 2 }), agency: 0.02, flags: ["kol_spoke_out"], ...tr(0.2) }, "Bị chỉ trích, giúp được những đứa trẻ khác", { tier: "sovereign" })], 0, k ? { npc: k } : {});
    }
    return T("Câu hỏi của người viết luận văn", `Một sinh viên viết luận văn về thời của những người có ảnh hưởng trên mạng xin phỏng vấn bạn.${f(c, "kol_sold_name") ? " Tên bạn vẫn in trên bao bì của một tập đoàn, dù bạn không còn dùng sản phẩm ấy." : ""} Câu hỏi cuối: “Ngày ấy bạn có tin những gì mình nói không?”`, [
      C("Kể thật, kể cả những lần không tin", { counters: step(c, KO, { kol_trust: 1 }), happy: 3, flags: ["kol_honest_record"] }, "Mất hình ảnh đẹp, để lại một ghi chép thật"),
      C("Kể phiên bản đẹp", { counters: step(c, KO), happy: -1 }, "Giữ hình ảnh, giữ luôn cái gánh"),
      C("Mở lớp miễn phí dạy người trẻ đọc quảng cáo ẩn", { counters: step(c, KO), bw: -3, rel: 4, flags: ["kol_teaches"] }, "Tốn thời gian, để lại một kỹ năng", { tier: "awakened" })], 0);
  }, (c) => c.age >= 38),

  /* ---------- chuyện thường ngày ---------- */
  daily(KO, "kol_filter", [16, 55], 8, (c) => T("Ảnh đẹp hơn đời", vary("kof", c.age, ["Một người theo dõi nhắn rằng đã vay tiền đi sửa mũi cho giống bạn trong ảnh, rồi hỏi bạn sửa ở đâu.", "Ứng dụng chỉnh ảnh làm eo bạn nhỏ đi, da sáng lên, mắt to hơn. Bạn gần như quên mặt thật của mình trông thế nào."]), [
    C("Đăng một ảnh không chỉnh sửa", { counters: { kol_trust: 1 }, gamble: { p: 0.5, win: { happy: 3, log: "Bài ấy nhận nhiều lời cảm ơn nhất từ trước tới giờ." }, lose: { happy: -3, log: "Bình luận chê bạn ngoài đời trông già hơn." } } }, "Thật, có thể bị chê"),
    C("Giữ như cũ, ảnh đẹp mới có hợp đồng", { money: 0.03, counters: { kol_trust: -1 } }, "Giữ hợp đồng, góp thêm một chuẩn đẹp giả"),
    C("Ghi chú “đã chỉnh sửa” dưới mọi ảnh", { flags: ["kol_labels_edits"], counters: { kol_trust: 1 }, income_mult: 0.95 }, "Mất vài nhãn hàng, nói thật đều đặn", { tier: "awakened" })], 1)),
  daily(KO, "kol_expert", [18, 55], 9, () => T("Chứng chỉ ba ngày", "Một hãng trà giảm cân muốn bạn đứng tên “chuyên gia dinh dưỡng” trong chiến dịch mới. Họ lo luôn tấm chứng chỉ: học trên mạng ba ngày, không ai kiểm tra.", [
    C("Nhận, đứng tên chuyên gia", { money: 0.3, counters: { kol_trust: -1 }, flags: ["kol_false_health"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 7], note: "chứng chỉ chuyên gia dinh dưỡng làm trong ba ngày" } }, "Tiền lớn, một tấm giấy có thể nổ"),
    C("Mời một bác sĩ thật cùng nói, không đứng tên", { gamble: { p: 0.35, win: { money: 0.1, counters: { kol_trust: 1 }, log: "Bác sĩ đồng ý, kèm lời khuyên ăn uống thật. Hãng miễn cưỡng chấp nhận." }, lose: { log: "Bác sĩ đọc thành phần rồi khuyên bạn tránh xa. Hãng tìm người khác." } } }, "Ít tiền, có người chịu trách nhiệm chuyên môn", { tier: "awakened" }),
    C("Từ chối", { counters: { honest: 1 } }, "Mất hợp đồng lớn")], 0)),
  daily(KO, "kol_ponzi", [18, 55], 9, () => T("Lãi ba phần trăm mỗi tuần", "Một ứng dụng đầu tư trả bạn khoản tiền bằng nửa năm thu nhập để giới thiệu nó, hứa người dùng lãi ba phần trăm mỗi tuần. Ai kéo được người mới thì có thêm hoa hồng.", [
    C("Nhận, đăng giới thiệu", { money: 0.5, flags: ["kol_scam_promo"], counters: { kol_trust: -1, honest: -1 } }, "Tiền nhanh, người theo dõi gánh rủi ro"),
    C("Từ chối, im lặng", { counters: { honest: 1 } }, "Không dính vào, không giúp ai"),
    C("Từ chối, cảnh báo người theo dõi", { counters: { kol_trust: 2 }, gamble: { p: 0.6, win: { log: "Ba tháng sau ứng dụng sập. Người ta chia sẻ lại bài cảnh báo của bạn." }, lose: { bw: -5, log: "Ứng dụng dọa kiện bạn tội bôi nhọ." } } }, "Bảo vệ người theo dõi, có thể bị dọa kiện", { tier: "awakened" })], 0)),
  daily(KO, "kol_feud", [16, 55], 8, (c, N) => { const r = role(c, "rival")!; return T("Màn cãi nhau dàn dựng", `Đội của bạn đề xuất dựng một màn cãi nhau trên mạng với ${N(r)}, người cũng có nhiều người theo dõi. Hai bên đều được tương tác, và ${N(r)} đã gật đầu.`, [
    C("Diễn cho trọn", { counters: { kol_trust: -1, honest: -1 }, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "dựng màn cãi nhau câu tương tác" }, money: c.age < 18 ? 0.03 : 0.1 }, "Lượt xem tăng vọt, lừa người theo dõi"),
    C("Từ chối, làm một video chung tử tế", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "video chung không cần cãi nhau" }, counters: { kol_trust: 1 }, log: "Video chung ít lượt xem hơn, nhưng người theo dõi cả hai bên ở lại." }, lose: { memory: { npc: r, tag: "REFUSED_HELP", weight: -0.15, note: "từ chối màn diễn đã hứa" }, log: "Họ giận vì bạn đổi ý phút chót." } } }, "Tử tế, có thể mất lòng", { tier: "awakened" }),
    C("Kể công khai lời đề nghị này", { counters: { kol_trust: 2 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.35, note: "bị bóc màn cãi nhau dàn dựng" } }, "Được tin, mất một người trong nghề")], 0, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(KO, "kol_plea", [18, 55], 8, (c) => T("Tin nhắn xin tiền chữa bệnh", vary("kop", c.age, ["Một người theo dõi nhắn kèm ảnh giấy viện phí: mẹ họ cần mổ tim, còn thiếu một khoản lớn.", "Một người lạ gửi bạn hồ sơ bệnh án của chồng mình sau tai nạn, nhờ bạn kêu gọi giúp."]), [
    C("Kêu gọi ngay trên trang", { gamble: { p: 0.7, win: { counters: { kol_trust: 1 }, rel: 3, log: "Đủ tiền trong hai ngày. Ca mổ thành công." }, lose: { counters: { kol_trust: -2 }, log: "Hồ sơ là giả. Những người đã chuyển tiền đổ lỗi cho bạn." } } }, "Nhanh, có thể bị lừa thay người khác"),
    C("Xác minh với bệnh viện trước", { bw: -3, counters: { kol_trust: 1 }, flags: ["kol_verifies"] }, "Chậm vài ngày, chắc chắn"),
    C("Tự chuyển một khoản, không đăng gì", { money: -0.05, counters: { kind: 1 } }, "Giúp lặng lẽ, giúp được ít")], 0)),
  daily(KO, "kol_flood", [18, 55], 8, () => T("Đến vùng lũ cùng máy quay", "Bạn chở hàng cứu trợ về vùng lũ, đi cùng hai người quay phim. Một bà cụ nhận gạo xong hỏi nhỏ: “Phải cười vào máy à cháu?”", [
    C("Quay hết, đăng thành chuỗi video", { money: 0.1, rel: -2, counters: { kol_trust: -1 } }, "Lượt xem lớn, người nhận thành đạo cụ"),
    C("Cất máy quay, chỉ phát hàng", { counters: { kol_trust: 1, kind: 1 }, happy: 2 }, "Mất nội dung, giữ phẩm giá người nhận"),
    C("Công khai toàn bộ sổ thu chi chuyến đi", { counters: { kol_trust: 2 }, bw: -3, flags: ["kol_open_books"] }, "Mất công, không ai nghi được bạn", { tier: "sovereign" })], 0)),
  daily(KO, "kol_team", [22, 55], 9, () => T("Lương của năm người", "Bạn đang trả lương cho năm người: quay phim, dựng phim, trợ lý và hai người trả lời tin nhắn. Tháng này không có hợp đồng nào, chỉ một hãng thuốc lá điện tử muốn mua bài.", [
    C("Nhận quảng cáo thuốc lá điện tử", { money: 0.2, counters: { kol_trust: -1 } }, "Giữ được lương, đẩy người trẻ vào một thói quen"),
    C("Cho hai người nghỉ việc", { money: 0.05, happy: -4, rel: -2, flags: ["kol_cut_team"] }, "Đỡ chi phí, mất hai người cùng làm"),
    C("Chia phần sở hữu kênh cho cả đội", { flags: ["kol_team_shares"], income_mult: 0.9, agency: 0.02, gamble: { p: 0.6, win: { log: "Cả đội ở lại. Ba tháng sau kênh có hướng đi mới." }, lose: { happy: -3, log: "Hai người vẫn bỏ đi, mang theo phần của họ." } } }, "Bớt phần mình, có người cùng thuyền", { tier: "sovereign" })], 0)),
  daily(KO, "kol_offline", [18, 55], 8, (c) => T("Một tuần không điện thoại", vary("koo", c.age, ["Sáng nay bạn ngồi trong xe mười lăm phút, không bước ra được. Bạn biết tám giờ phải đăng bài.", "Bạn đi ăn sinh nhật bạn thân, và nhận ra cả bữa mình chỉ chụp ảnh, không nhớ ai đã nói gì."]), [
    C("Tắt hết một tuần, không báo ai", { happy: 5, bw: 4, income_mult: 0.97, flags: ["kol_took_break"] }, "Hồi lại, tụt tương tác"),
    C("Để đội đăng bài hẹn giờ, giả vờ vẫn ở đó", { money: 0.03, counters: { kol_trust: -1 }, bw: 1 }, "Không mất nhịp, thêm một lớp giả"),
    C("Nói thật với người theo dõi rằng mình kiệt sức", { counters: { kol_trust: 1 }, gamble: { p: 0.6, win: { happy: 4, log: "Hàng nghìn tin nhắn chúc bạn nghỉ ngơi." }, lose: { happy: -2, log: "Có người bảo bạn than vãn trong nhung lụa." } } }, "Thật lòng, có thể bị mỉa", { tier: "awakened" })], 1)),
  daily(KO, "kol_lake", [20, 55], 9, () => T("Bài đăng được đặt hàng", "Một công ty truyền thông trả bạn khoản tiền bằng ba tháng thu nhập để đăng bài khen dự án lấp hồ làm trung tâm thương mại, không ghi là bài được trả tiền. Người dân quanh hồ đang ký đơn phản đối.", [
    C("Đăng, không ghi gì", { money: 0.25, counters: { kol_trust: -1, honest: -1 }, flags: ["kol_paid_politics"] }, "Tiền lớn, đứng ngược phía với hàng xóm"),
    C("Đi xem cái hồ trước rồi mới viết", { bw: -2, counters: { kol_trust: 1 }, gamble: { p: 0.5, win: { flags: ["kol_cause"], log: "Bạn viết về những người câu cá quanh hồ. Bài được đọc nhiều hơn mọi bài quảng cáo." }, lose: { happy: -1, log: "Công ty rút lời mời khi biết bạn đi xem hồ." } } }, "Có thể mất tiền, viết được điều mình thấy", { tier: "awakened" }),
    C("Từ chối", { counters: { honest: 1 } }, "Mất ba tháng thu nhập")], 0)),

  /* ---------- gia đình ---------- */
  cross(KO, "kol_family", [22, 60], (c) => ((c.kids_school > 0 || c.kids_teen > 0) && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child");
    if ((c.kids_school > 0 || c.kids_teen > 0) && k) return T("Video có con được xem gấp năm", `Những video có ${N(k)} được xem gấp năm lần video chỉ có bạn. Một hãng đồ trẻ em muốn ký hợp đồng một năm, mỗi tuần một video có ${N(k)}.`, [
      C("Ký, cho con lên hình đều đặn", { money: 0.3, flags: ["kol_kids_content"], trust: { npc: k, delta: -0.1 } }, "Tiền đều, con chưa đủ tuổi để đồng ý"),
      C("Không bao giờ đăng mặt con", { flags: ["kol_kids_private"], trust: { npc: k, delta: 0.15 }, income_mult: 0.95 }, "Mất hợp đồng, con lớn lên không có khán giả"),
      C("Ký, gửi hết tiền vào tài khoản riêng của con", { money: 0.05, flags: ["kol_kids_content"], promise: { to: k, what: "giữ nguyên tiền video cho con đến năm mười tám tuổi", years: 10 } }, "Con có tiền, vẫn mất riêng tư", { tier: "awakened" })], 1, { npc: k });
    const s = role(c, "spouse");
    if (s) return T("Không muốn lên hình nữa", `${N(s)} nói thẳng: không muốn xuất hiện trong bất kỳ bài đăng nào nữa, kể cả ảnh bữa tối. Những bài có hai người luôn được tương tác cao nhất.`, [
      C("Tôn trọng, từ nay chỉ đăng mình", { trust: { npc: s, delta: 0.2 }, income_mult: 0.95 }, "Mất bài ăn khách, nhà yên"),
      C("Thuyết phục thêm vài bài cho xong hợp đồng", { trust: { npc: s, delta: -0.2 }, money: 0.08 }, "Thêm tiền, thêm một vết nứt"),
      C("Ngồi lại đặt luật riêng tư cho cả nhà", { trust: { npc: s, delta: 0.15 }, flags: ["kol_family_rules"], bw: -2 }, "Mất công, ai cũng có tiếng nói", { tier: "awakened" })], 0, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Hàng xóm hỏi vay tiền", `Hàng xóm nghĩ bạn giàu lắm vì ảnh trên mạng, kéo nhau đến hỏi ${N(p)} vay tiền. ${N(p)} không biết từ chối thế nào, cũng không biết thu nhập của bạn lên xuống thất thường ra sao.`, [
      C("Nói thật với bố mẹ về thu nhập", { trust: { npc: p, delta: 0.2 }, happy: -1 }, "Mất chút sĩ diện, bố mẹ đỡ khó xử"),
      C("Gửi thêm tiền cho bố mẹ cho đẹp mặt", { money: -0.1, trust: { npc: p, delta: 0.1 } }, "Đỡ ngượng cho bố mẹ, hụt tiền mình"),
      C("Đăng một bài nói rõ đời thật của mình", { counters: { kol_trust: 1 }, trust: { npc: p, delta: 0.05 }, flags: ["kol_real_life_post"] }, "Mất vẻ hào nhoáng, hết bị hỏi vay")], 0, { npc: p });
  }),
];
