/**
 * Gói NGHỆ THUẬT A: diễn viên · nhà văn · họa sĩ · nhiếp ảnh gia. Cùng chuẩn với singer.ts — đọc kèm docs/content-guide.md.
 *
 * Mỗi con đường: năng khiếu → cơ hội → 5 nhịp truyện (b2 đặt cờ rẽ nhánh, b3 khủng hoảng đọc cờ đó, b4 đỉnh/vực đọc cờ + bộ đếm,
 * b5 gọi lại những gì đã chọn) → chuyện thường ngày → gia đình.
 * Bộ đếm riêng: act_fame (diễn viên), wrt_name (nhà văn), pnt_name (họa sĩ), pho_eye (nhiếp ảnh).
 * Nhịp b1–b4 chỉ mở khi đã trưởng thành, để mọi khoản tiền lớn rơi vào người lớn.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

const adult = (c: FactContext): boolean => c.age >= 18;
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;

/* ======================================================================= DIỄN VIÊN */
const A = "actor";

const ACTOR: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(A, "act_t_mimic", [8, 13], () => true, () => T("Nhại giọng cô chủ nhiệm", "Giờ ra chơi, bạn nhại giọng cô chủ nhiệm giống đến mức cả lớp cười lăn. Cô đứng ở cửa từ lúc nào không ai hay. Thay vì phạt, cô giao cho bạn vai chính trong vở kịch cuối năm.", [
    C("Nhận vai, ở lại tập mỗi chiều", { flags: [talentFlag(A)], counters: { talents_seen: 1 }, happy: 4, know: -1 }, "Bớt giờ học, mở một con đường"),
    C("Xin vai phụ cho đỡ run", { counters: { talents_seen: 1 }, rel: 1 }, "Yên ổn, không ai để ý")], 0)),
  talent(A, "act_t_club", [13, 16], () => true, () => T("Lớp kịch tối thứ bảy", "Trung tâm văn hóa quận mở lớp kịch cho thiếu niên, tập tối thứ bảy và chủ nhật, trùng đúng giờ học thêm của bạn. Người dạy là một diễn viên đã giải nghệ, đứng hút thuốc ở cửa và nhớ tên từng đứa ngay buổi đầu.", [
    C("Bỏ lớp học thêm, đi tập kịch", { flags: [talentFlag(A)], counters: { talents_seen: 1 }, money: -0.01, know: -2, happy: 5 }, "Điểm có thể tụt, được đứng trên sân khấu"),
    C("Đi tập, giấu bố mẹ", { flags: [talentFlag(A)], counters: { talents_seen: 1, honest: -1 }, happy: 3, rel: -2 }, "Được tập, phải sống hai mặt"),
    C("Học thêm, xem kịch khi rảnh", { counters: { talents_seen: 1 }, know: 2 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(A, "act_d_casting", [18, 30], () => true, () => T("Số báo danh 212", "Một phim truyền hình mở buổi tuyển vai công khai: bốn trăm người cho ba vai phụ. Bạn đến từ sáu giờ sáng, số 212 ghim trên ngực áo. Đến trưa họ mới gọi tới số 90, còn ca làm của bạn bắt đầu lúc hai giờ chiều.", [
    C("Ở lại chờ, bỏ ca làm hôm nay", { counters: { doors_seen: 1 }, money: -0.02, gamble: { p: 0.35, win: { ...become(A), log: "Đạo diễn bảo bạn đọc lại lần hai, rồi xin số điện thoại." }, lose: { happy: -3, log: "Bạn diễn bốn mươi giây. Họ nói sẽ gọi lại, rồi không gọi." } } }, "Mất một ngày lương, có thể có vai"),
    C("Nhờ người giữ chỗ, đi làm rồi quay lại", { counters: { doors_seen: 1 }, gamble: { p: 0.2, win: { ...become(A), log: "Bạn chạy về kịp, áo ướt đẫm mồ hôi. Họ chọn bạn cho vai người đưa thư." }, lose: { log: "Bạn quay lại thì họ đã gọi qua số 212." } } }, "Giữ được việc, ít cơ hội hơn"),
    C("Về đi làm", { counters: { doors_seen: 1 }, money: 0.01 })], 0)),
  door(A, "act_d_extras", [18, 40], () => true, () => T("Đoàn phim về đầu ngõ", "Một đoàn phim dựng cảnh ngay đầu ngõ nhà bạn, cần người đóng quần chúng: bốn giờ sáng có mặt, trả một hộp cơm và chút tiền công. Đến ngày thứ ba, chị trợ lý đạo diễn nhớ mặt bạn. Chị nói tuần sau có một vai có thoại, nếu bạn còn theo.", [
    C("Theo đoàn cả mùa quay", { ...become(A), counters: { doors_seen: 1 }, money: -0.04, health: -2 }, "Thu nhập bèo, đặt được chân vào nghề"),
    C("Đi thêm vài buổi cho biết", { counters: { doors_seen: 1 }, money: 0.01, happy: 2 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(A, 1, 1, (c) => T("Ba câu thoại ở hành lang", "Vai có thoại đầu tiên của bạn: một y tá trong cảnh hành lang bệnh viện, ba câu. Diễn viên chính cứ nói lấn vào câu thứ hai của bạn, còn đạo diễn đang vội vì sắp hết giờ thuê bối cảnh. Đây là lần quay thứ năm.", [
    C("Giữ đúng câu thoại, nói to hơn", { counters: step(c, A), flags: ["act_holds_ground"], gamble: { p: 0.5, win: { counters: { act_fame: 1 }, log: "Đạo diễn giữ cảnh của bạn. Phó đạo diễn ghi tên bạn vào sổ." }, lose: { happy: -3, log: "Diễn viên chính phàn nàn. Cảnh của bạn bị cắt khi dựng phim." } } }, "Có thể được nhớ, có thể bị ghét"),
    C("Nhường lời, diễn bằng ánh mắt", { counters: step(c, A), flags: ["act_listener"], rel: 2, know: 2 }, "Ít đất diễn, học được cách nghe"),
    C("Xin đạo diễn quay riêng một góc", { counters: step(c, A), gamble: { p: 0.3, win: { counters: { act_fame: 1 }, flags: ["act_holds_ground"], log: "Ông ấy đồng ý. Một lần quay là xong." }, lose: { happy: -2, log: "Ông ấy bảo bạn đừng làm mất thời gian của cả đoàn." } } }, "Dám đòi, có thể mất điểm", { tier: "awakened" })], 1), adult),
  beat(A, 2, 3, (c) => T("Hợp đồng bảy năm", `${f(c, "act_holds_ground") ? "Cảnh hành lang năm ấy có người nhớ. " : ""}Một hãng phim đề nghị hợp đồng độc quyền bảy năm: lương tháng đều đặn, đổi lại hãng chọn vai, duyệt mọi bài bạn đăng lên mạng và muốn bạn chuyên đóng "người tốt bụng". Bản hợp đồng dày ba mươi hai trang.`, [
    C("Ký độc quyền", { counters: step(c, A), income_mult: 1.7, flags: ["act_studio"] }, "Lương đều, mất quyền chọn vai"),
    C("Về đoàn kịch, lương thấp, vai khó", { counters: step(c, A), income_mult: 1.1, know: 4, flags: ["act_stage"] }, "Nghèo hơn, lên tay nghề"),
    C("Đòi quyền từ chối hai vai mỗi năm", { counters: step(c, A), gamble: { p: 0.4, win: { income_mult: 1.5, flags: ["act_studio", "act_veto"], log: "Hãng đồng ý. Luật sư của họ nói chưa ai từng đòi điều này." }, lose: { income_mult: 1.1, flags: ["act_freelance"], log: "Hãng chọn người khác. Bạn tiếp tục đi thử vai tự do." } } }, "Giữ quyền chọn vai, có thể mất hợp đồng", { tier: "sovereign" })], 0), adult),
  beat(A, 3, 4, (c) => { const bound = f(c, "act_studio") && !f(c, "act_veto"); return T("Vai diễn đổi bằng mười lăm cân", `Vai chính trong một phim về nạn đói: nhân vật phải gầy rộc, bạn cần giảm mười lăm cân trong mười tuần. Bác sĩ của đoàn nói tim bạn chịu được, nhưng không dám chắc. ${bound ? "Hãng đã nhận vai thay bạn; rút lui sẽ bị phạt theo hợp đồng." : "Đạo diễn cho bạn ba ngày để trả lời."}`, [
    C("Nhận vai, ăn kiêng theo bác sĩ", { counters: step(c, A), health: -8, gamble: { p: 0.55, win: { income_mult: 1.4, counters: { act_fame: 2 }, flags: ["act_breakthrough"], log: "Tấm áp phích đầu tiên ra mắt, nhiều người quen không nhận ra bạn." }, lose: { health: -5, income_mult: 0.9, log: "Phim bị hoãn vô thời hạn. Cân nặng thì không về như cũ." } } }, "Có thể thành danh, chắc chắn hao người"),
    C(bound ? "Từ chối, chịu tiền phạt hợp đồng" : "Từ chối, nhận vai nhỏ an toàn", { counters: step(c, A, { act_fame: -1 }), health: 2, ...(bound ? { money: -0.3 } : { happy: -2 }) }, bound ? "Giữ sức khỏe, mất một khoản lớn" : "Giữ sức khỏe, lỡ một cơ hội"),
    C("Rời nghề, tìm việc có lương đều", { counters: step(c, A), ...leave(A), flags: ["ex_actor"], health: 3, happy: -4 }, "Bình yên, khép lại sân khấu")], 0); }, adult),
  beat(A, 4, 5, (c) => {
    const studio = f(c, "act_studio");
    if (f(c, "act_breakthrough") || cnt(c, "act_fame") >= 3) return T("Đêm đề cử", `Bạn được đề cử ${c.sex === "F" ? "nữ" : "nam"} diễn viên chính xuất sắc. Cùng tuần, một đạo diễn nước ngoài mời bạn đóng phim nói tiếng nước họ, quay hai năm xa nhà, còn một đài truyền hình đưa hợp đồng ba trăm tập.${studio ? " Hãng phim của bạn chỉ muốn bạn nhận phim truyền hình." : ""}`, [
      C("Nhận phim nước ngoài, học tiếng mới", { counters: step(c, A, { act_fame: 1 }), income_mult: 1.3, rel: -5, know: 4, flags: ["act_abroad"] }, "Vươn xa, hai năm vắng nhà"),
      C("Ký ba trăm tập truyền hình", { counters: step(c, A, { act_fame: 1 }), income_mult: 1.6, health: -3, flags: ["act_soap"] }, "Giàu và quen mặt, khó thoát vai"),
      C("Lập nhóm kịch độc lập với người trẻ", { counters: step(c, A), money: -0.5, agency: 0.03, flags: ["act_troupe"] }, "Bỏ vốn, thành người dẫn đường", { tier: "sovereign" })], 0);
    return T("Mười năm vai bạn thân", `Mười năm nay bạn chỉ đóng bạn thân của nhân vật chính. Giờ người ta bắt đầu mời bạn đóng ${c.sex === "F" ? "mẹ" : "bố"} của nhân vật chính.${studio ? " Hãng phim vừa báo không gia hạn hợp đồng." : ""} Một chương trình truyền hình thực tế trả gấp mười cát-xê để quay cuộc sống trong nhà bạn suốt ba tháng.`, [
      C("Nhận chương trình thực tế", { counters: step(c, A, { act_fame: 1 }), money: 0.6, rel: -4, flags: ["act_reality"] }, "Tiền nhanh, đời tư lên sóng"),
      C("Mở lớp dạy diễn xuất", { counters: step(c, A), income_mult: 0.8, happy: 4, flags: ["act_teacher"] }, "Ít tiền hơn, có học trò"),
      C("Đi thử vai tiếp, vai nào cũng nhận", { counters: step(c, A), gamble: { p: 0.25, win: { income_mult: 1.6, counters: { act_fame: 2 }, flags: ["act_late_bloom"], log: `Một vai ${c.sex === "F" ? "người mẹ câm" : "người cha câm"} đưa bạn lên trang nhất ở cái tuổi không ai ngờ.` }, lose: { happy: -4, log: "Một năm, mười bảy buổi thử vai, không vai nào." } } }, "Còn nước còn tát", { longterm: true })], 1);
  }, adult),
  beat(A, 5, 6, (c) => {
    const who = f(c, "act_student_film") ? " Cô ấy chính là cô sinh viên từng mời bạn đóng phim tốt nghiệp không lấy tiền."
      : f(c, "act_troupe") ? " Cô ấy từng tập ở nhóm kịch của bạn năm mười sáu tuổi."
      : f(c, "act_teacher") ? " Cô ấy là học trò cũ ở lớp diễn của bạn."
      : f(c, "act_reality") ? " Cô ấy nói chỉ biết bạn qua chương trình thực tế."
      : f(c, "act_abroad") ? " Cô ấy đã xem bộ phim nước ngoài của bạn bốn lần." : "";
    return T("Tấm gương phòng hóa trang", `Thợ trang điểm đắp thêm cho bạn ba mươi tuổi để đóng một người già sắp mất. Nhìn vào gương, bạn thấy gương mặt ${c.sex === "F" ? "mẹ" : "bố"} mình. Đạo diễn mới hai mươi bốn tuổi, phim kinh phí nhỏ, không trả nổi cát-xê như bạn quen.${who}`, [
      C("Đóng, lấy cát-xê tượng trưng", { counters: step(c, A), rel: 3, happy: 3, flags: ["act_passed_on"] }, "Mất tiền, nâng người trẻ"),
      C("Đòi đúng cát-xê như mọi phim", { counters: step(c, A), money: 0.2 }, "Giữ giá, phim có thể không làm nổi"),
      C("Đóng và góp vốn làm đồng sản xuất", { counters: step(c, A), money: -0.2, gamble: { p: 0.4, win: { money: 0.6, counters: { act_fame: 1 }, log: "Phim được chọn chiếu ở một liên hoan phim nước ngoài." }, lose: { log: "Phim chiếu ở ba rạp, trong hai tuần." } } }, "Đặt cược cùng người trẻ", { tier: "sovereign" })], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(A, "act_selftape", [18, 50], 10, (c) => T("Băng thử vai lúc nửa đêm", vary("acs", c.age, [
    "Các đoàn phim giờ chỉ nhận băng thử vai tự quay. Mười một giờ đêm, bạn cần một người đọc thoại cùng, và căn phòng thuê vọng lên tiếng xe dưới cửa sổ.",
    "Một vai bạn rất muốn, hạn nộp băng là tám giờ sáng mai. Bạn đã quay hai mươi ba lần, lần nào xem lại cũng thấy giả."]), [
    C("Quay đến sáng cho bằng được", { health: -2, bw: -3, gamble: { p: 0.4, win: { counters: { act_fame: 1 }, money: 0.04, log: "Họ gọi bạn đến vòng hai." }, lose: { log: "Không có hồi âm." } } }, "Mất ngủ, có thể có vai"),
    C("Gửi bản thứ ba, bản mộc nhất", { happy: 2, health: 1 }),
    C("Rủ ba diễn viên khác lập nhóm quay chung", { bw: 2, rel: 2, flags: ["act_tape_circle"] }, "Tốn thời gian cho người khác, có bạn nghề", { tier: "awakened" })], 0)),
  daily(A, "act_villain", [18, 65], 10, (c) => T("Lại vai kẻ ác", vary("acv", c.age, [
    "Lần thứ ba liên tiếp, người ta mời bạn đóng phản diện. Phim trước vừa phát xong, một bà cụ ngoài chợ mắng bạn vì đã \"hành hạ con dâu\".",
    "Kịch bản mới gửi đến: lại là một người chủ nhà độc ác, lần này có cảnh tát người giúp việc. Cát-xê cao hơn mọi vai bạn từng nhận."]), [
    C("Nhận, diễn cho ra kẻ ác", { money: 0.08, happy: -2, counters: { act_fame: 1 }, flags: ["act_typecast"] }, "Có tiền và tiếng, bị đóng khung"),
    C("Từ chối, chờ một vai khác hẳn", { money: -0.05, flags: ["act_range"] }, "Hụt thu, giữ được vùng diễn"),
    C("Nhận, xin thêm cảnh cho thấy vì sao hắn ác", { gamble: { p: 0.45, win: { counters: { act_fame: 2 }, know: 2, log: "Biên kịch đồng ý. Khán giả ghét nhân vật ít hơn, nhớ nó lâu hơn." }, lose: { money: 0.04, log: "Biên kịch nói không còn thời gian sửa." } } }, "Đòi chiều sâu, có thể bị gạt đi", { tier: "awakened" })], 0)),
  daily(A, "act_stunt", [18, 55], 99, () => T("Cú nhảy từ ban công tầng hai", "Người đóng thế bị kẹt xe, mặt trời sắp lặn, và đạo diễn muốn bạn tự nhảy từ ban công tầng hai xuống tấm đệm. Tấm đệm mỏng hơn bạn tưởng. Cả đoàn đang nhìn.", [
    C("Tự nhảy", { gamble: { p: 0.75, win: { counters: { act_fame: 1 }, log: "Một lần là xong. Cả đoàn vỗ tay." }, lose: { health: -12, money: -0.1, log: "Bạn tiếp đất lệch, rạn xương mắt cá. Ba tháng không đi quay được." } } }, "Được tiếng liều, có thể gãy chân"),
    C("Đợi người đóng thế, chịu lỡ ánh chiều", { flags: ["act_safety_first"], happy: -1, counters: { act_fame: -1 } }, "An toàn, bị chê làm khó"),
    C("Đề nghị đổi cảnh, quay từ góc khác", { gamble: { p: 0.5, win: { rel: 2, flags: ["act_safety_first"], log: "Đạo diễn nghĩ một lúc rồi gật. Cảnh mới còn hay hơn." }, lose: { rel: -1, log: "Đạo diễn gạt đi, cho người khác đóng thay bạn." } } }, "Tìm lối thứ ba, có thể bị gạt đi", { tier: "sovereign" })], 1)),
  daily(A, "act_recognized", [18, 75], 10, (c) => T("Bị nhận ra giữa đám đông", vary("acr", c.age, [
    "Ngoài chợ, một người bán hàng nhận ra bạn và gọi to tên nhân vật bạn đóng. Mười phút sau, hai mươi chiếc điện thoại giơ lên quanh bạn.",
    "Bạn đi khám răng. Trong phòng chờ, một nhóm người thì thầm, rồi một người xin chụp ảnh đúng lúc bạn đang ôm má."]), [
    C("Dừng lại, chụp ảnh với từng người", { rel: 2, bw: -2, counters: { act_fame: 1 } }, "Được thương, mất sức"),
    C("Đeo khẩu trang, kính râm khi ra đường", { happy: -1, flags: ["act_incognito"] }, "Yên thân, xa dần người xem")], 0)),
  daily(A, "act_supplement", [20, 70], 99, () => T("Quảng cáo thuốc bổ", "Một hãng thực phẩm chức năng mời bạn quay quảng cáo, trả bằng cả năm đi diễn. Kịch bản bắt bạn nói hộp thuốc đã chữa khỏi bệnh đau lưng của mình. Bạn chưa từng uống nó.", [
    C("Nhận, nói đúng kịch bản", { money: 0.4, counters: { honest: -1 }, gamble: { p: 0.6, win: { log: "Quảng cáo chạy suốt hai năm, không ai hỏi gì." }, lose: { counters: { act_fame: -2 }, happy: -4, log: "Một nhóm người bệnh kiện hãng. Mặt bạn có trong mọi bài báo." } } }, "Tiền lớn, đặt cược tên tuổi"),
    C("Nhận, sửa lời thành \"tôi đang dùng thử\"", { gamble: { p: 0.4, win: { money: 0.3, flags: ["act_honest_ad"], log: "Hãng miễn cưỡng đồng ý." }, lose: { log: "Hãng tìm người khác chịu đọc đúng kịch bản." } } }, "Đòi lời thật, có thể mất hợp đồng", { tier: "sovereign" }),
    C("Từ chối", { counters: { honest: 1 } })], 2)),
  daily(A, "act_pr_romance", [20, 50], 99, (c) => { const s = c.married ? role(c, "spouse") : undefined; return T("Tin đồn do hãng dựng", `Phim sắp ra rạp. Bộ phận truyền thông muốn bạn và bạn diễn để lộ vài tấm ảnh đi ăn tối cùng nhau, cho báo viết thành chuyện tình cảm.${c.married ? " Họ biết bạn đã có gia đình, và nói thế \"càng có chuyện để bàn\"." : ""}`, [
    C("Đồng ý, để báo đoán già đoán non", { counters: { act_fame: 2, honest: -1 }, rel: -3, ...(s ? { trust: { npc: s, delta: -0.2 } } : {}) }, "Phim đông khách, người nhà buồn"),
    C("Từ chối, chỉ nói về bộ phim", { counters: { act_fame: -1, honest: 1 } }, "Sạch sẽ, phim kém ồn ào")], 1, s ? { npc: s } : {}); }),
  daily(A, "act_rival_role", [20, 65], 99, (c, N) => { const r = role(c, "rival")!; return T("Vai diễn bị hớt tay trên", `Đạo diễn đã hứa vai đó cho bạn. Tuần sau, ${N(r)} có một bữa tối với nhà sản xuất, và vai thuộc về ${N(r)}. Một phóng viên gọi hỏi bạn có muốn bình luận gì không.`, [
    C("Kể với phóng viên về bữa tối", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bị kể với báo chuyện bữa tối giành vai" }, counters: { act_fame: 1 }, rel: -1 }, "Hả giận, thêm một kẻ thù"),
    C("Gửi hoa chúc mừng ngày khai máy", { trust: { npc: r, delta: 0.15 }, happy: -2 }, "Nuốt giận, giữ đường lui"),
    C(`Xin vai đối thủ của ${N(r)} trong phim`, { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "cặp đối thủ ăn ý trên phim" }, counters: { act_fame: 1 }, log: "Hai người đối đầu trên phim còn ăn ý hơn ngoài đời." }, lose: { log: "Nhà sản xuất nói vai đó đã có người." } } }, "Biến đối thủ thành bạn diễn", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(A, "act_night_shoot", [18, 65], 99, () => T("Đêm quay thứ mười bốn", "Mười bốn đêm quay liền, cả đoàn ngủ gục trên ghế nhựa giữa các cảnh. Ba giờ sáng, một anh thợ ánh sáng ngất khi đang trèo thang. Nhà sản xuất nói lịch không thể lùi thêm một ngày nào.", [
    C("Im lặng, quay tiếp", { health: -4, money: 0.04 }, "Giữ lịch, giữ lòng nhà sản xuất"),
    C("Tuyên bố đêm nay không quay nữa", { gamble: { p: 0.5, win: { rel: 4, log: "Cả đoàn được nghỉ một đêm. Nhà sản xuất không nói chuyện với bạn ba hôm." }, lose: { income_mult: 0.95, log: "Nhà sản xuất ghi tên bạn vào danh sách \"khó làm việc\"." } } }, "Bênh người, mang tiếng khó tính"),
    C("Cùng tổ ánh sáng soạn quy định giờ quay", { flags: ["act_crew_rules", "leader"], agency: 0.02, bw: -3 }, "Mất thời gian, đổi luật cho cả đoàn", { tier: "sovereign" })], 0)),
  daily(A, "act_blank", [18, 75], 99, () => T("Quên thoại giữa hồi hai", "Đêm diễn kịch thứ ba mươi, bốn trăm khán giả. Giữa hồi hai, đầu bạn bỗng trống rỗng; bạn diễn nhìn bạn chờ, người nhắc tuồng thì đang ngủ gật trong cánh gà.", [
    C("Ứng biến bằng lời của mình", { gamble: { p: 0.6, win: { counters: { act_fame: 1 }, happy: 4, log: "Khán giả không hề biết. Bạn diễn ôm bạn sau màn chào." }, lose: { happy: -5, log: "Câu ứng biến làm gãy mạch vở. Bạn diễn giận cả tuần." } } }, "Có thể cứu cảnh, có thể phá vở"),
    C("Đứng yên, chờ bạn diễn đỡ lời", { happy: -2, know: 1, flags: ["act_humbled"] }, "Ngượng một lúc, vở diễn an toàn")], 0)),
  daily(A, "act_student_film", [18, 65], 99, () => T("Phim tốt nghiệp không cát-xê", "Một sinh viên điện ảnh nhờ bạn đóng phim tốt nghiệp: ba cuối tuần, không cát-xê, quay trong một tiệm sửa xe. Kịch bản mười hai trang, và đó là vai hay nhất bạn được mời trong nhiều năm.", [
    C("Đóng, không lấy tiền", { money: -0.02, happy: 4, know: 2, flags: ["act_student_film"] }, "Mất ba tuần cuối, được diễn thật"),
    C("Từ chối, cuối tuần còn suất diễn", { money: 0.04 }, "Có tiền, lỡ một vai hay")], 0)),
  daily(A, "act_accent", [18, 55], 99, () => T("Giọng quê", "Đạo diễn khen bạn diễn tốt nhưng bảo phải bỏ giọng quê, nói giọng chuẩn như phát thanh viên. Lớp luyện giọng kéo dài ba tháng, mỗi tối hai tiếng.", [
    C("Đi luyện giọng chuẩn", { bw: -4, money: -0.03, income_mult: 1.05, flags: ["act_neutral_voice"] }, "Được nhiều vai hơn, mất một phần mình"),
    C("Giữ giọng, nhận vai người vùng mình", { counters: { act_fame: -1 }, happy: 2, flags: ["act_own_voice"] }, "Ít vai, vai nào cũng thật"),
    C("Đề nghị viết nhân vật thành người quê bạn", { gamble: { p: 0.4, win: { counters: { act_fame: 1 }, flags: ["act_own_voice"], log: "Biên kịch cho nhân vật một quê hương. Vai sống hẳn lên." }, lose: { log: "Đạo diễn nói khán giả cả nước sẽ không quen." } } }, "Đổi khung câu chuyện, có thể bị từ chối", { tier: "sovereign" })], 0)),

  /* ---------- gia đình ---------- */
  cross(A, "act_family", [20, 70], (c) => !!(role(c, "mother") || role(c, "father")) || (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    const p = role(c, "mother") ?? role(c, "father");
    if (k) return T(`${N(k)} bị trêu ở trường`, `Tập phim có cảnh nhân vật của bạn bị bắt vì tham ô vừa phát sóng. Ở trường, bạn bè gọi ${N(k)} là "con nhà tù". ${N(k)} xin bạn đừng đến họp phụ huynh nữa.`, [
      C(`Đến lớp ${N(k)} nói chuyện về nghề diễn`, { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.25 }, log: `Cả lớp hỏi bạn suốt một tiếng. Hôm sau ${N(k)} được bạn bè vây quanh.` }, lose: { trust: { npc: k, delta: -0.15 }, log: `${N(k)} cúi gằm suốt buổi, về nhà đóng cửa phòng.` } } }, "Có thể gỡ được, có thể làm con xấu hổ hơn"),
      C("Hứa bớt nhận vai kẻ xấu", { promise: { to: k, what: "bớt nhận vai kẻ xấu", years: 2 }, trust: { npc: k, delta: 0.1 }, income_mult: 0.95 }, "Con yên lòng, bạn mất vai hay"),
      C("Bảo con phải tự học cách sống với nó", { trust: { npc: k, delta: -0.1 }, happy: -1 })], 0, { npc: k });
    if (p) return T(`${N(p)} xem cảnh bạn chết`, `Tập phim có cảnh nhân vật của bạn chết trong một tai nạn. Nửa đêm ${N(p)} gọi điện, giọng run run, hỏi bạn có ổn không, rồi xin bạn đổi nghề khác "cho lành".`, [
      C(`Đưa ${N(p)} đến phim trường một ngày`, { gamble: { p: 0.6, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} xem bạn diễn lại cảnh ấy mười lần, rồi bật cười khi đạo diễn hô cắt.` }, lose: { trust: { npc: p, delta: -0.05 }, bw: -2, log: `${N(p)} ngồi ở góc, mệt và lạc lõng giữa đống dây điện.` } } }, "Có thể hiểu nhau hơn, có thể chỉ thêm mệt"),
      C("Về nhà một tuần, ăn cơm cùng", { trust: { npc: p, delta: 0.15 }, money: -0.03 }, "Mất vài buổi diễn, người nhà yên lòng"),
      C("Bảo rằng đó chỉ là phim", { trust: { npc: p, delta: -0.05 }, happy: -1 })], 0, { npc: p });
    const s = role(c, "spouse")!;
    return T("Lịch quay và bữa tối", `Ba tháng nay bạn về nhà sau nửa đêm. ${N(s)} dọn bàn ăn cho hai người, rồi ăn một mình. Tối nay ${N(s)} nói: "Mình sống với lịch quay của bạn, không phải với bạn."`, [
      C("Từ chối phim tiếp theo, ở nhà ba tháng", { trust: { npc: s, delta: 0.25 }, money: -0.15 }, "Mất một vai, giữ một mái nhà"),
      C(`Đưa ${N(s)} theo đoàn làm phim`, { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.2 }, log: `${N(s)} kết thân với cả tổ phục trang.` }, lose: { trust: { npc: s, delta: -0.1 }, log: `${N(s)} ngồi chờ cả ngày trong xe, rồi bắt xe về trước.` } } }),
      C("Hứa đây là phim dài cuối cùng", { promise: { to: s, what: "bớt nhận phim dài ngày", years: 2 }, trust: { npc: s, delta: 0.1 } }, "Yên tạm thời, một lời hứa phải giữ")], 0, { npc: s });
  }),
];

/* ======================================================================= NHÀ VĂN */
const W = "writer";

const WRITER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(W, "wrt_t_notebook", [9, 14], () => true, () => T("Cuốn vở dưới gối", "Bạn viết kín một cuốn vở những chuyện bịa về người trong xóm: bà bán rau từng là nữ hoàng, ông sửa xe từng lái tàu ngầm. Một đứa bạn lấy trộm cuốn vở, đọc to giữa lớp. Cả lớp cười, nhưng đến giờ ra chơi có ba đứa xin đọc tiếp.", [
    C("Viết tiếp, đặt tên cho cuốn vở", { flags: [talentFlag(W)], counters: { talents_seen: 1 }, happy: 3, rel: 1 }, "Bị trêu thêm, có những người đọc đầu tiên"),
    C("Xé cuốn vở cho khỏi xấu hổ", { counters: { talents_seen: 1 }, happy: -2 }, "Hết bị trêu, mất một thói quen")], 0)),
  talent(W, "wrt_t_library", [12, 16], () => true, () => T("Kệ sách người lớn", "Cô thủ thư cho bạn mượn sách ở kệ người lớn, mỗi lần ba cuốn. Bạn đọc cả giờ ăn trưa, đọc dưới gầm bàn trong giờ toán. Học kỳ này điểm toán của bạn tụt xuống cuối lớp.", [
    C("Đọc hết kệ, chép câu hay vào sổ", { flags: [talentFlag(W)], counters: { talents_seen: 1, read: 1 }, know: 3, happy: 2 }, "Văn lên, toán xuống"),
    C("Trả sách, tập trung ôn toán", { counters: { talents_seen: 1 }, know: 2 }, "Điểm đẹp, bớt một thế giới")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(W, "wrt_d_contest", [18, 45], () => true, () => T("Ba tuần trước hạn nộp", "Một tạp chí văn học mở cuộc thi truyện ngắn, hạn nộp còn ba tuần. Bạn có một truyện viết dở về bà ngoại, nằm trong ngăn kéo đã hai năm. Muốn viết xong thì phải xin nghỉ phép không lương.", [
    C("Xin nghỉ, viết cho xong", { counters: { doors_seen: 1 }, money: -0.03, gamble: { p: 0.3, win: { ...become(W), counters: { wrt_name: 1 }, log: "Truyện đoạt giải ba. Một biên tập viên gọi hỏi bạn còn truyện nào khác không." }, lose: { happy: -2, log: "Truyện không lọt vào danh sách nào. Bạn vẫn giữ bản thảo." } } }, "Mất lương, có thể mở cửa nghề"),
    C("Gửi bản dang dở cho kịp hạn", { counters: { doors_seen: 1 }, gamble: { p: 0.1, win: { ...become(W), log: "Ban giám khảo cho truyện dang dở vào chung khảo, kèm một dòng: \"Viết tiếp đi.\"" }, lose: { log: "Không có hồi âm." } } }, "Không mất gì, cơ hội mỏng"),
    C("Để dịp khác", { counters: { doors_seen: 1 } })], 0)),
  door(W, "wrt_d_drawer", [25, 60], () => true, () => T("Bản thảo bảy năm", "Bảy năm nay bạn viết mỗi sáng từ năm đến bảy giờ, trước khi đi làm. Bản thảo bốn trăm trang đã xong. Một nhà xuất bản nhỏ nhận in nếu bạn trả một nửa tiền in; họ nói sách đầu tay thường chỉ bán được vài trăm cuốn.", [
    C("Bỏ việc, sống bằng nghề viết", { ...become(W), counters: { doors_seen: 1 }, money: -0.15, agency: 0.02 }, "Mất lương ổn định, có cả ngày để viết"),
    C("Trả nửa tiền in, vẫn đi làm", { counters: { doors_seen: 1 }, money: -0.12, gamble: { p: 0.35, win: { ...become(W), log: "Năm trăm cuốn bán hết trong bốn tháng. Nhà xuất bản đặt cuốn thứ hai." }, lose: { happy: -2, log: "Bốn trăm cuốn vẫn chất trong góc nhà bạn." } } }, "Mất tiền in, giữ được việc"),
    C("Cất bản thảo vào ngăn kéo", { counters: { doors_seen: 1 }, happy: -3 })], 1)),
  door(W, "wrt_d_ghost", [22, 50], () => true, () => T("Viết thuê một cuộc đời", "Một doanh nhân giàu có muốn ra hồi ký nhân dịp sinh nhật bảy mươi. Ông kể, bạn viết; tên bạn sẽ không có trên bìa. Tiền công bằng một năm lương của bạn, và ông có rất nhiều chuyện không muốn kể.", [
    C("Nhận viết, không đứng tên", { ...become(W), counters: { doors_seen: 1 }, money: 0.3, flags: ["wrt_ghost"] }, "Tiền tốt, câu chữ của bạn mang tên người khác"),
    C("Nhận, đòi ghi \"cùng viết\" trên bìa", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(W), money: 0.2, counters: { wrt_name: 1 }, log: "Ông ngẫm một lúc rồi đồng ý. Tên bạn in nhỏ dưới tên ông." }, lose: { log: "Ông tìm một người viết thuê khác." } } }, "Đòi được ghi tên, có thể mất việc", { tier: "sovereign" }),
    C("Từ chối", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(W, 1, 1, (c) => T("Mười hai người ở buổi ra mắt", `Cuốn sách đầu tay của bạn được in một nghìn bản và nằm ở kệ dưới cùng của hiệu sách. Buổi ra mắt có mười hai người, ba người là họ hàng.${f(c, "wrt_ghost") ? " Ông doanh nhân năm nọ gửi tới một lẵng hoa to hơn cả cái bàn." : ""}`, [
    C("Ôm sách đi từng hiệu sách nhỏ", { counters: step(c, W), bw: -3, gamble: { p: 0.5, win: { counters: { wrt_name: 1 }, log: "Một hiệu sách nhỏ đặt thêm hai trăm cuốn, bày ngay cửa." }, lose: { happy: -2, log: "Sách nằm im trên kệ đến cuối năm." } } }, "Mệt, có thể có độc giả"),
    C("Bắt tay viết cuốn thứ hai ngay", { counters: step(c, W), know: 2, flags: ["wrt_keeps_writing"] }, "Bỏ mặc cuốn đầu, giữ nhịp viết"),
    C("Gửi sách tặng mười nhà phê bình", { counters: step(c, W), money: -0.02, gamble: { p: 0.3, win: { counters: { wrt_name: 2 }, log: "Một bài điểm sách dài cả trang báo." }, lose: { log: "Không ai viết một dòng nào." } } }, "Tốn sách, có thể được chú ý")], 1), adult),
  beat(W, 2, 3, (c) => T("Chương bị yêu cầu cắt", `${f(c, "wrt_keeps_writing") ? "Cuốn thứ hai của bạn đã xong. " : ""}Một nhà xuất bản lớn đề nghị hợp đồng ba cuốn, tiền ứng trước bằng hai năm lương. Biên tập viên muốn bạn đổi cái kết cho có hậu và bỏ chương viết về một vụ cưỡng chế đất. "Không ai cấm," chị nói, "nhưng nhà phát hành sẽ ngại."`, [
    C("Ký, sửa theo yêu cầu", { counters: step(c, W), income_mult: 1.6, flags: ["wrt_softened"] }, "Sách đến nhiều người, không còn nguyên vẹn"),
    C("Giữ nguyên, in ở nhà xuất bản nhỏ", { counters: step(c, W, { wrt_name: 1 }), income_mult: 1.1, flags: ["wrt_uncut"] }, "Ít tiền, trọn câu chữ"),
    C("Ký, đăng chương bị cắt miễn phí trên mạng", { counters: step(c, W), gamble: { p: 0.45, win: { income_mult: 1.4, counters: { wrt_name: 2 }, flags: ["wrt_uncut", "wrt_online"], log: "Chương bị cắt được đọc nhiều hơn cả cuốn sách." }, lose: { income_mult: 1.2, flags: ["wrt_uncut"], log: "Nhà xuất bản hủy hai cuốn còn lại trong hợp đồng." } } }, "Có cả hai, hoặc mất hợp đồng", { tier: "sovereign" })], 0), adult),
  beat(W, 3, 4, (c) => {
    if (f(c, "wrt_uncut")) return T("Đơn kiện vì một nhân vật", `Một doanh nhân ở tỉnh nói nhân vật chủ dự án trong sách của bạn chính là ông ta, và kiện bạn tội vu khống. Luật sư đòi trả trước một khoản bằng ba tháng thu nhập.${f(c, "wrt_online") ? " Chương sách đăng trên mạng bị yêu cầu gỡ." : ""} Nhà xuất bản tạm ngừng phát hành chờ tòa xử.`, [
      C("Ra tòa, bảo vệ cuốn sách", { counters: step(c, W), money: -0.25, gamble: { p: 0.5, win: { counters: { wrt_name: 2 }, flags: ["wrt_won_case"], log: "Tòa bác đơn. Sách được tái bản, bìa in thêm dòng \"cuốn sách từng bị kiện\"." }, lose: { money: -0.4, happy: -5, log: "Bạn thua. Lần tái bản phải đổi tên và nghề của nhân vật." } } }, "Tốn kém, có thể thắng lớn"),
      C("Xin lỗi công khai, sửa sách", { counters: step(c, W, { wrt_name: -1 }), custom: "apologize", happy: -4 }, "Yên chuyện, mang tiếng chùn tay"),
      C("Bỏ nghề viết, đi dạy văn", { counters: step(c, W), ...leave(W), flags: ["wrt_quit"], happy: -3 }, "Thoát vụ kiện, gác bút")], 0);
    return T("Mười tám tháng giấy trắng", "Mười tám tháng rồi bạn không viết được trang nào dùng được. Tiền ứng trước đã tiêu hết. Nhà xuất bản lớn gửi thư: nộp bản thảo trong ba tháng, hoặc hoàn trả toàn bộ tiền ứng.", [
      C("Trả lại tiền ứng, viết lại từ đầu", { counters: step(c, W), money: -0.35, health: 3, flags: ["wrt_restart"] }, "Mất tiền lớn, lấy lại chính mình", { longterm: true }),
      C("Viết vội cho kịp hạn", { counters: step(c, W, { wrt_name: -2 }), money: 0.1, flags: ["wrt_rushed"] }, "Giữ tiền, một cuốn sách tệ mang tên bạn"),
      C("Bỏ viết, nhận việc văn phòng", { counters: step(c, W), ...leave(W), flags: ["wrt_quit"], happy: -3 }, "Có lương, gác bút")], 0);
  }, adult),
  beat(W, 4, 5, (c) => {
    if (cnt(c, "wrt_name") >= 3 || f(c, "wrt_won_case") || f(c, "wrt_online")) return T("Danh sách rút gọn", `Cuốn sách mới của bạn lọt vào danh sách rút gọn của một giải văn chương lớn. Một quỹ nước ngoài mời bạn sang viết sáu tháng và dịch sách ra năm thứ tiếng.${c.parent_sick ? " Cùng tuần đó, bác sĩ gọi báo bệnh của bố mẹ bạn trở nặng." : ""}`, [
      C("Đi, nhận học bổng sáng tác", { counters: step(c, W, { wrt_name: 1 }), income_mult: 1.4, rel: -4, flags: ["wrt_translated"] }, c.parent_sick ? "Vươn ra thế giới, vắng nhà lúc khó" : "Vươn ra thế giới, sáu tháng xa nhà"),
      C("Ở lại, viết cuốn tiếp theo ở quê", { counters: step(c, W), happy: 3, rel: 3, flags: ["wrt_rooted"] }, "Lỡ cơ hội dịch, giữ được gốc"),
      C("Nhận, đề nghị dịch thêm hai tác giả trẻ", { counters: step(c, W), agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.2, flags: ["wrt_translated", "wrt_bridge"], log: "Quỹ đồng ý. Hai cuốn sách đầu tay theo bạn ra nước ngoài." }, lose: { income_mult: 1.2, flags: ["wrt_translated"], log: "Quỹ nói ngân sách chỉ đủ cho một người." } } }, "Chia cơ hội, bớt phần mình", { tier: "sovereign" })], 0);
    return T("Ba nghìn cuốn sắp bị nghiền", `Nhà xuất bản báo: ba nghìn cuốn sách tồn kho của bạn sẽ bị nghiền làm bột giấy, trừ khi bạn mua lại theo giá vốn.${f(c, "wrt_rushed") ? " Phần lớn là cuốn bạn viết vội năm ấy." : ""} Cùng lúc, một hãng phim mời bạn viết kịch bản phim truyền hình, trả theo tập.`, [
      C("Mua lại sách, tự bán dần", { counters: step(c, W), money: -0.25, flags: ["wrt_own_stock"] }, "Tốn tiền, sách còn sống"),
      C("Để họ nghiền, đi viết kịch bản", { counters: step(c, W, { wrt_name: -1 }), income_mult: 1.5, flags: ["wrt_screen"] }, "Có tiền đều, chữ thành của người khác"),
      C("Tặng hết cho thư viện trường vùng xa", { counters: step(c, W, { wrt_name: 1 }), money: -0.1, rel: 3, flags: ["wrt_donated"] }, "Mất tiền chở sách, có người đọc thật")], 0);
  }, adult),
  beat(W, 5, 6, (c) => {
    const p = role(c, "mother") ?? role(c, "father");
    const extra = f(c, "wrt_translated") ? " Nhà xuất bản nước ngoài đã đặt trước bản dịch."
      : f(c, "wrt_screen") ? " Một hãng phim muốn mua bản quyền dù bạn chưa viết xong."
      : f(c, "wrt_ghost") ? " Lần này, tên trên bìa sẽ là tên bạn."
      : f(c, "wrt_donated") ? " Vài thư viện vùng xa từng nhận sách của bạn viết thư xin được đọc trước." : "";
    return T("Cuốn sách về gia đình", `Cuốn sách bạn muốn viết từ năm hai mươi tuổi đã xong: chuyện gia đình bạn, kể cả món nợ năm xưa và người con riêng mà cả nhà không bao giờ nhắc tới.${extra}`, [
      C("In ngay, kể cả những điều đau", { counters: step(c, W, { wrt_name: 2 }), rel: -4, ...(p ? { trust: { npc: p, delta: -0.25 } } : {}) }, "Trọn sự thật, gia đình rạn"),
      C("Viết xong, dặn chỉ in sau khi mình mất", { counters: step(c, W), happy: 3, flags: ["wrt_posthumous"] }, "Giữ hòa khí, sách chờ bạn", { tier: "awakened" }),
      C("Đổi tên người, viết thành tiểu thuyết", { counters: step(c, W, { wrt_name: 1 }), know: 2 }, "Bớt đau, bớt thật")], 1, p ? { npc: p } : {});
  }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(W, "wrt_thesis", [20, 65], 99, () => T("Viết thuê luận văn", "Một sinh viên năm cuối nhắn tin: cậu trả bằng ba tháng nhuận bút để bạn viết hộ luận văn tốt nghiệp. Hạn nộp còn năm tuần, và cậu đã chọn sẵn đề tài.", [
    C("Nhận viết", { money: 0.12, secret: { tag: "CHEATED_EXAM", severity: 0.3, fuse_years: [2, 10], note: "viết thuê luận văn tốt nghiệp cho người khác" } }, "Có tiền ngay, mang một bí mật"),
    C("Từ chối", { counters: { honest: 1 } }),
    C("Đề nghị kèm cậu ấy tự viết, lấy học phí", { money: 0.03, bw: -2, gamble: { p: 0.5, win: { flags: ["wrt_tutor"], log: "Cậu ấy tự viết xong, đạt điểm khá, gửi bạn một lá thư dài." }, lose: { log: "Cậu ấy đi tìm người khác viết hộ." } } }, "Ít tiền, không phải giấu gì", { tier: "awakened" })], 1)),
  daily(W, "wrt_critic", [20, 80], 10, (c) => T("Bài phê bình độc địa", vary("wrc", c.age, [
    "Một nhà phê bình có tiếng viết về sách của bạn: \"văn như nhật ký học trò, cảm xúc rẻ\". Bài báo được chia sẻ bốn nghìn lần.",
    "Trên một diễn đàn đọc sách, một người viết bài dài chứng minh cuốn sách mới của bạn \"không có gì mới\". Bên dưới, hàng trăm người đồng ý."]), [
    C("Viết bài đáp lại", { gamble: { p: 0.4, win: { counters: { wrt_name: 1 }, log: "Cuộc tranh luận khiến người ta tìm đọc sách của bạn." }, lose: { counters: { wrt_name: -1 }, happy: -3, log: "Bài đáp của bạn bị coi là tự ái." } } }, "Có thể lật thế, có thể thành trò cười"),
    C("Im lặng, viết tiếp", { bw: 2, happy: -2 }, "Nuốt cay, giữ sức cho trang sau"),
    C("Đọc kỹ, ghi lại những chỗ họ nói đúng", { know: 3, happy: -1, flags: ["wrt_takes_critique"] }, "Đau hơn, viết tốt hơn", { tier: "awakened" })], 1)),
  daily(W, "wrt_prison_letter", [22, 85], 99, () => T("Lá thư từ trại giam", "Bạn nhận một lá thư viết tay gửi từ trại giam. Người viết nói cuốn sách của bạn giúp anh ta qua được năm đầu tiên, và gửi kèm tập bản thảo ba trăm trang, nhờ bạn đọc.", [
    C("Đọc hết, viết thư góp ý", { bw: -4, know: 2, flags: ["wrt_prison_reader"], counters: { kind: 1 } }, "Mất nhiều tuần, có thể đổi một đời"),
    C("Gửi sách tặng thư viện trại giam", { money: -0.02, rel: 1, counters: { kind: 1 } }, "Tốn ít tiền, không phải dấn thân"),
    C("Cất thư, không trả lời", { happy: -1 })], 0)),
  daily(W, "wrt_adaptation", [25, 80], 99, () => T("Bán bản quyền chuyển thể", "Một hãng sản xuất muốn mua bản quyền tiểu thuyết của bạn để làm phim chiếu mạng. Họ nói thẳng sẽ đổi bối cảnh, thêm chuyện tình tay ba và đổi tên nhân vật chính cho \"dễ nhớ\".", [
    C("Bán đứt", { money: 0.4, counters: { wrt_name: 1 }, happy: -2 }, "Tiền lớn, truyện không còn là của bạn"),
    C("Bán, đòi quyền duyệt kịch bản", { gamble: { p: 0.35, win: { money: 0.3, counters: { wrt_name: 2 }, flags: ["wrt_script_veto"], log: "Họ đồng ý. Bạn gạch bỏ chuyện tình tay ba." }, lose: { log: "Họ chuyển sang mua một cuốn sách khác." } } }, "Giữ hồn truyện, có thể mất hợp đồng", { tier: "sovereign" }),
    C("Giữ lại, không bán", { happy: 1, money: -0.02 }, "Truyện vẹn nguyên, ví vẫn mỏng")], 0)),
  daily(W, "wrt_ai", [22, 80], 99, () => T("Phần mềm viết theo giọng bạn", "Một phần mềm có thể viết truyện theo giọng văn của bạn sau khi đọc hết sách của bạn. Nhà xuất bản gợi ý: dùng nó viết bản nháp, mỗi năm ra ba cuốn thay vì một.", [
    C("Dùng để viết nhanh gấp ba", { income_mult: 1.3, counters: { wrt_name: -1 }, flags: ["wrt_ai_drafts"] }, "Nhiều sách, nhiều tiền, giọng mỏng dần"),
    C("Từ chối, viết như cũ", { money: -0.03, happy: 2, flags: ["wrt_handmade"] }, "Chậm và nghèo hơn, chữ nào cũng là mình"),
    C("Cùng các nhà văn ký thư đòi luật về giọng văn", { agency: 0.02, bw: -3, flags: ["wrt_voice_letter", "leader"] }, "Mất thời gian viết, làm luật cho cả nghề", { tier: "sovereign" })], 1)),
  daily(W, "wrt_neighbor", [22, 80], 99, (c, N) => { const nb = role(c, "neighbor")!; return T(`${N(nb)} nhận ra mình trong truyện`, `${N(nb)} đọc truyện ngắn mới của bạn và nhận ra người hàng xóm hay than thở trong đó chính là mình, đến cả cái chậu cây trước cửa. Cả xóm cũng nhận ra. ${N(nb)} thôi không chào bạn nữa.`, [
    C("Đến xin lỗi, hứa sửa khi tái bản", { trust: { npc: nb, delta: 0.15 }, promise: { to: nb, what: "sửa nhân vật khi tái bản", years: 2 } }, "Mất mặt, giữ được tình xóm"),
    C("Giải thích rằng đó là hư cấu", { memory: { npc: nb, tag: "HUMILIATED_ME", weight: -0.25, note: "bị đưa vào truyện làm trò cười cho cả xóm" } }, "Giữ quyền viết, mất một người hàng xóm"),
    C("Tặng sách kèm lời đề tặng riêng", { gamble: { p: 0.5, win: { trust: { npc: nb, delta: 0.2 }, log: `${N(nb)} đọc lời đề tặng, rồi mang cuốn sách đi khoe khắp chợ.` }, lose: { trust: { npc: nb, delta: -0.1 }, log: `${N(nb)} gửi trả cuốn sách qua hàng rào.` } } }, "Mềm mỏng, có thể bị trả lại")], 0, { npc: nb }); }, (c) => !!role(c, "neighbor")),
  daily(W, "wrt_column", [22, 70], 99, () => T("Mục báo sáng thứ năm", "Một tờ báo mời bạn viết mục tạp văn hằng tuần, nhuận bút đều đặn. Hạn nộp là sáng thứ năm, trong khi cuốn tiểu thuyết dang dở đã nằm yên ba tháng. Tổng biên tập còn gợi ý bạn vào làm phóng viên hẳn.", [
    C("Nhận mục báo", { income_mult: 1.15, bw: -4, flags: ["wrt_columnist"] }, "Có tiền đều, tiểu thuyết chậm lại"),
    C("Từ chối, giữ sức cho tiểu thuyết", { counters: { wrt_name: 1 }, money: -0.03 }, "Nghèo thêm, sách tiến lên"),
    C("Vào tòa soạn làm phóng viên", { unflags: [life(W)], custom: "become:journalist", flags: ["ex_writer"] }, "Đổi nghề, cầm bút theo cách khác")], 0)),
  daily(W, "wrt_night_class", [28, 80], 10, (c) => T("Lớp viết văn buổi tối", vary("wrn", c.age, [
    "Bạn dạy lớp viết văn buổi tối ở thư viện quận. Một cô thợ may ngồi bàn cuối viết hay hơn bạn ở tuổi ấy rất nhiều.",
    "Lớp viết văn của bạn có một ông lái xe tải về hưu. Truyện của ông về những chuyến xe đêm khiến bạn mất ngủ."]), [
    C("Gửi bản thảo của học trò cho nhà xuất bản", { rel: 3, bw: -2, counters: { kind: 1 }, flags: ["wrt_found_talent"] }, "Mất thời gian của mình, mở cửa cho người khác"),
    C("Dạy cho đủ giờ, lấy tiền", { money: 0.04 }),
    C("Đề nghị cùng viết một cuốn sách", { gamble: { p: 0.5, win: { counters: { wrt_name: 1 }, rel: 2, log: "Cuốn sách chung bán chạy hơn mọi cuốn bạn viết một mình." }, lose: { rel: -2, log: "Hai người cãi nhau về cái kết, cuốn sách bỏ dở." } } }, "Chia tên trên bìa, có thể cãi nhau", { tier: "awakened" })], 0)),
  daily(W, "wrt_royalty", [22, 80], 10, (c) => T("Bảng kê nhuận bút", vary("wrr", c.age, [
    "Bảng kê nhuận bút gửi về: hai năm viết đổi được khoản tiền bằng năm tuần lương công nhân. Chủ nhà vừa báo tăng tiền thuê.",
    "Nhà xuất bản chậm trả nhuận bút đã tám tháng. Tủ lạnh nhà bạn chỉ còn mấy quả trứng."]), [
    C("Viết quảng cáo cho một hãng bột giặt", { money: 0.15, happy: -2, counters: { wrt_name: -1 } }, "Đủ tiền nhà, chữ đem đi bán bột giặt"),
    C("Nộp hồ sơ xin học bổng sáng tác", { gamble: { p: 0.3, win: { money: 0.25, counters: { wrt_name: 1 }, log: "Bạn nhận được học bổng một năm." }, lose: { happy: -2, log: "Hồ sơ bị trả về kèm một lá thư in sẵn." } } }, "Không mất gì, khó trúng"),
    C("Về quê sống cho rẻ, viết tiếp", { custom: "return_home", money: 0.05, rel: -1 }, "Bớt chi tiêu, xa giới văn chương")], 0)),
  daily(W, "wrt_rival", [25, 80], 99, (c, N) => { const r = role(c, "rival")!; return T("Giải thưởng về tay người khác", `Bạn và ${N(r)} cùng vào chung khảo, và ${N(r)} thắng. Ở bữa tiệc sau lễ trao giải, ${N(r)} nhờ bạn viết lời giới thiệu cho cuốn sách tiếp theo.`, [
    C("Viết lời giới thiệu, khen thật lòng", { trust: { npc: r, delta: 0.2 }, happy: -1 }, "Nuốt cay, có thêm đồng minh"),
    C("Từ chối khéo", { memory: { npc: r, tag: "REFUSED_HELP", weight: -0.15, note: "từ chối viết lời giới thiệu sau lễ trao giải" } }, "Giữ thể diện, thêm một khoảng cách"),
    C("Đề nghị hai người viết chung một tập truyện", { gamble: { p: 0.4, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "tập truyện viết chung sau lễ trao giải" }, counters: { wrt_name: 1 }, log: "Tập truyện chung được đọc nhiều hơn sách riêng của cả hai." }, lose: { log: `${N(r)} cười, bảo để sau.` } } }, "Biến đối thủ thành bạn viết", { tier: "awakened" })], 0, { npc: r }); }, (c) => !!role(c, "rival")),

  /* ---------- gia đình ---------- */
  cross(W, "wrt_family", [22, 80], (c) => !!(role(c, "mother") || role(c, "father")) || (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    const s = c.married ? role(c, "spouse") : undefined;
    if (k) return T(`${N(k)} đọc sách của bạn`, `${N(k)} lén đọc cuốn tiểu thuyết mới của bạn và nhận ra đứa trẻ hay nói dối trong đó chính là mình, đến cả vết sẹo trên cằm. Từ hôm đó ${N(k)} không nói chuyện với bạn.`, [
      C("Xin lỗi, hứa không viết về con nữa", { trust: { npc: k, delta: 0.2 }, promise: { to: k, what: "không đưa con vào sách", years: 3 } }, "Con nguôi giận, bạn mất một nguồn chuyện"),
      C("Giải thích rằng nhân vật ghép từ nhiều người", { trust: { npc: k, delta: -0.1 } }, "Giữ cuốn sách, con vẫn giận"),
      C("Mời con viết lại chương ấy theo cách của con", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} viết bốn trang, gay gắt và rất hay. Bạn in nó ở cuối lần tái bản.` }, lose: { trust: { npc: k, delta: -0.05 }, log: `${N(k)} nói không cần bạn ban ơn.` } } }, "Trao lại tiếng nói, có thể bị từ chối", { tier: "sovereign" })], 2, { npc: k });
    if (s) return T("Trận cãi nhau trong trang sách", `${N(s)} đọc bản thảo và thấy những trận cãi nhau của hai người được chép lại gần như nguyên văn. "Bạn sống với tôi, hay sống để lấy tư liệu?"`, [
      C("Cắt những chương đó", { trust: { npc: s, delta: 0.2 }, counters: { wrt_name: -1 } }, "Giữ nhà, cuốn sách yếu đi"),
      C("Giữ nguyên, đó là văn chương", { trust: { npc: s, delta: -0.25 }, counters: { wrt_name: 1 } }, "Sách mạnh hơn, nhà lạnh đi"),
      C(`Để ${N(s)} đọc duyệt trước mọi bản thảo`, { trust: { npc: s, delta: 0.15 }, bw: -2, flags: ["wrt_spouse_reader"] }, "Chậm hơn, có người cùng giữ ranh giới", { tier: "awakened" })], 2, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(`${N(p)} hỏi bao giờ đi làm`, `${c.country === "VN" ? "Tết năm nào, trước mặt họ hàng" : "Bữa tối gia đình nào"}, ${N(p)} cũng hỏi: "Bao giờ con đi làm cho tử tế?" Cuốn sách bạn tặng vẫn nằm trong túi, chưa bóc lớp giấy gói.`, [
      C(`Đọc to một chương cho ${N(p)} nghe`, { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} nghe hết, rồi hỏi nhân vật bà cụ có phải là bà nội không.` }, lose: { trust: { npc: p, delta: -0.05 }, log: `${N(p)} ngủ gật ở trang thứ ba.` } } }, "Có thể chạm được, có thể ngượng thêm"),
      C(`Cho ${N(p)} xem bảng kê nhuận bút`, { trust: { npc: p, delta: 0.05 }, happy: -2 }, "Nói bằng tiền, tự thấy mình nhỏ đi"),
      C("Thôi, không giải thích nữa", { happy: -2, trust: { npc: p, delta: -0.05 } })], 0, { npc: p });
  }),
];

/* ======================================================================= HỌA SĨ */
const PN = "painter";

const PAINTER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PN, "pnt_t_charcoal", [8, 12], () => true, () => T("Gương mặt ông trên tường", "Bạn lấy than củi vẽ kín bức tường sau nhà, từ chân tường lên ngang vai. Người lớn định quét vôi lại thì bà hàng xóm sang, đứng nhìn rất lâu hình người ông đã mất, rồi nói khẽ: \"Giống quá.\"", [
    C("Xin một hộp màu và xấp giấy", { flags: [talentFlag(PN)], counters: { talents_seen: 1 }, money: -0.01, happy: 4 }, "Tốn chút tiền nhà, mở một con đường"),
    C("Phụ người lớn quét vôi lại", { counters: { talents_seen: 1 }, rel: 2 }, "Nhà sạch, tường trắng trở lại")], 0)),
  talent(PN, "pnt_t_contest", [12, 16], () => true, () => T("Bức tranh gửi đi nước ngoài", "Cô giáo dạy vẽ chọn tranh của bạn dự một cuộc thi vẽ thiếu nhi quốc tế, nhưng phải vẽ lại trên khổ lớn trong kỳ nghỉ hè. Mùa hè nào bạn cũng phụ việc cho gia đình để có tiền mua sách vở.", [
    C("Vẽ lại suốt mùa hè", { flags: [talentFlag(PN)], counters: { talents_seen: 1 }, money: -0.02, know: 2, happy: 3 }, "Nhà thiếu người phụ, tranh được đi xa"),
    C("Phụ việc nhà, gửi bản vẽ nhỏ", { counters: { talents_seen: 1 }, money: 0.02, rel: 1 }, "Có tiền sách vở, tranh dừng ở lớp")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PN, "pnt_d_school", [16, 24], () => true, () => T("Sáu tiếng vẽ tượng thạch cao", "Kỳ thi vào trường mỹ thuật: sáu tiếng vẽ một pho tượng thạch cao, và chỉ lấy ba mươi người. Gia đình muốn bạn thi ngành kế toán \"cho chắc ăn\". Hai kỳ thi trùng ngày.", [
    C("Thi mỹ thuật", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(PN), log: "Bạn đỗ thứ mười bảy. Bố mẹ im lặng suốt bữa tối, rồi chúc mừng bạn bằng một cái gật đầu." }, lose: { happy: -3, log: "Bạn trượt môn hình họa, kém nửa điểm." } } }, "Theo đam mê, có thể trượt cả đường lui"),
    C("Thi kế toán, vẽ vào cuối tuần", { counters: { doors_seen: 1 }, know: 2, happy: -2 }, "Chắc ăn, giấc mơ thành sở thích")], 0)),
  door(PN, "pnt_d_square", [18, 50], () => true, () => T("Giá vẽ giữa quảng trường", "Bạn thử dựng giá vẽ ở quảng trường đông khách du lịch, vẽ chân dung trong hai mươi phút. Tối đầu tiên, một cặp khách trả bằng ba ngày lương của bạn ở chỗ làm. Tối thứ hai trời mưa, không ai ngồi.", [
    C("Bỏ việc, ra quảng trường mỗi ngày", { ...become(PN), counters: { doors_seen: 1 }, money: -0.05 }, "Bấp bênh theo trời, sống bằng cây bút"),
    C("Chỉ vẽ tối cuối tuần", { counters: { doors_seen: 1 }, money: 0.03, happy: 2 })], 0)),
  door(PN, "pnt_d_midlife", [32, 55], () => true, () => T("Hộp màu cũ trên gác", "Dọn nhà, bạn tìm thấy hộp màu từ thời hai mươi tuổi, vài tuýp đã khô cứng. Tối đó bạn vẽ một bức, rồi một bức nữa. Quán cà phê đầu ngõ ngỏ ý treo tranh lên tường, bán được thì chia đôi.", [
    C("Treo tranh, bán thử", { counters: { doors_seen: 1 }, gamble: { p: 0.45, win: { ...become(PN), log: "Bức đầu tiên bán được sau mười ngày. Người mua để lại số điện thoại, hỏi bạn còn bức nào không." }, lose: { happy: -2, log: "Tranh treo ba tháng, chỉ được khen." } } }, "Không mất gì, chờ xem"),
    C("Nghỉ việc sớm để vẽ hẳn", { ...become(PN), counters: { doors_seen: 1 }, money: -0.2, agency: 0.02 }, "Mất lương giữa đời, có lại chính mình"),
    C("Cất hộp màu lại", { counters: { doors_seen: 1 }, happy: -2 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PN, 1, 1, (c) => T("Bức tranh cạnh cửa nhà vệ sinh", "Triển lãm nhóm đầu tiên của bạn cùng năm họa sĩ trẻ, trong một căn phòng thuê. Tranh của bạn bị treo cạnh cửa nhà vệ sinh. Đêm khai mạc, một nhà sưu tầm hỏi giá, và bạn không biết nên nói bao nhiêu.", [
    C("Nói giá cao, chấp nhận không bán", { counters: step(c, PN), flags: ["pnt_high_price"], gamble: { p: 0.3, win: { money: 0.15, counters: { pnt_name: 1 }, log: "Ông ấy trả đủ, không mặc cả, và hỏi về bức tiếp theo." }, lose: { log: "Ông ấy mỉm cười, đi sang bức bên cạnh." } } }, "Định giá mình, có thể trắng tay"),
    C("Nói giá rẻ cho dễ bán", { counters: step(c, PN), money: 0.05, flags: ["pnt_cheap"] }, "Có tiền ngay, giá khó nâng về sau"),
    C("Hỏi ông ấy thích điều gì ở bức tranh", { counters: step(c, PN), know: 2, gamble: { p: 0.5, win: { money: 0.1, flags: ["pnt_first_collector"], log: "Hai người nói chuyện đến lúc đóng cửa. Ông ấy mua, và hẹn ghé xưởng." }, lose: { log: "Ông ấy nói vài câu xã giao rồi về." } } }, "Chưa nói giá, mở một mối quan hệ", { tier: "awakened" })], 1), adult),
  beat(PN, 2, 3, (c) => { const themes = c.country === "VN" ? "phố cổ, hoa sen và thiếu nữ áo dài" : "phố cổ, cánh đồng hoa và phiên chợ quê"; return T("Phòng tranh muốn độc quyền", `${f(c, "pnt_first_collector") ? "Nhà sưu tầm đầu tiên giới thiệu bạn với một phòng tranh lớn. " : "Một phòng tranh lớn để ý đến bạn. "}Họ đề nghị độc quyền: lấy một nửa giá bán, tự định giá, và cần hai mươi bức mỗi năm theo đề tài khách du lịch thích: ${themes}.`, [
    C("Ký, vẽ theo đơn hàng", { counters: step(c, PN), income_mult: 1.7, flags: ["pnt_gallery"] }, "Thu nhập đều, tranh thành hàng hóa"),
    C("Tự bán qua mạng, vẽ điều mình muốn", { counters: step(c, PN, { pnt_name: 1 }), income_mult: 1.1, bw: -4, flags: ["pnt_indie"] }, "Chậm và mệt, tự do trọn vẹn"),
    C("Lập xưởng chung với ba họa sĩ trẻ", { counters: step(c, PN), money: -0.2, agency: 0.03, flags: ["pnt_collective"], gamble: { p: 0.5, win: { income_mult: 1.4, log: "Sau một năm xưởng chung có khách quen. Bốn người chia nhau tiền thuê và cả ý tưởng." }, lose: { income_mult: 1.0, log: "Năm đầu lỗ. Cả bốn người vẫn ở lại." } } }, "Bỏ vốn, chia rủi ro và quyền quyết", { tier: "sovereign" })], 0); }, adult),
  beat(PN, 3, 4, (c) => {
    if (f(c, "pnt_gallery")) return T("Chữ ký của bạn trên tranh chép", "Một người mua ở nước ngoài gửi ảnh bức tranh \"của bạn\", xin giấy chứng nhận. Bạn chưa từng vẽ bức ấy. Hóa ra hai năm nay phòng tranh thuê thợ chép tranh của bạn rồi ký tên bạn, và phần chia của bạn vẫn đều đặn vào tài khoản.", [
      C("Tố cáo, chấm dứt hợp đồng", { counters: step(c, PN, { pnt_name: 1 }), income_mult: 0.6, money: -0.2, flags: ["pnt_whistle"] }, "Mất nguồn thu, giữ được tên mình"),
      C("Im lặng, nhận phần chia", { counters: step(c, PN), money: 0.3, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 8], note: "để phòng tranh ký tên mình lên tranh chép" } }, "Tiền đều, một quả bom hẹn giờ"),
      C("Bỏ vẽ, đi dạy mỹ thuật ở trường", { counters: step(c, PN), ...leave(PN), flags: ["pnt_quit"], happy: -3 }, "Thoát vòng ấy, gác cọ")], 0);
    return T("Mắt không còn thấy đúng màu", "Bác sĩ nói mắt bạn bị đục thủy tinh thể sớm: màu xanh ngả xám, màu đỏ hóa nâu. Mổ thì phải nghỉ vẽ nửa năm, và không chắc màu sẽ về như cũ. Triển lãm cá nhân đầu tiên của bạn còn bốn tháng.", [
      C("Hoãn triển lãm, mổ ngay", { counters: step(c, PN), money: -0.25, health: 5, income_mult: 0.85 }, "Lỡ thời cơ, giữ được đôi mắt", { longterm: true }),
      C("Vẽ tiếp bằng những màu mắt mới thấy", { counters: step(c, PN), health: -3, gamble: { p: 0.45, win: { counters: { pnt_name: 2 }, flags: ["pnt_new_palette"], log: "Giới phê bình gọi đó là \"giai đoạn xám\" của bạn. Tranh bán hết." }, lose: { happy: -5, log: "Người xem bảo tranh của bạn bỗng đục và buồn." } } }, "Biến khuyết thành phong cách, mắt yếu thêm"),
      C("Bỏ vẽ, nhận dạy mỹ thuật ở trường", { counters: step(c, PN), ...leave(PN), flags: ["pnt_quit"], happy: -3 }, "Có lương, gác cọ")], 0);
  }, adult),
  beat(PN, 4, 5, (c) => {
    if (cnt(c, "pnt_name") >= 3 || f(c, "pnt_whistle") || f(c, "pnt_new_palette")) return T("Phiên đấu giá không có bạn", `Một bức tranh bạn bán ${f(c, "pnt_cheap") ? "rẻ như cho" : "với giá phải chăng"} mười năm trước vừa được đấu giá gấp bốn mươi lần. Bạn không nhận được đồng nào. Tuần sau, bảo tàng thành phố xin bạn tặng một bức lớn, còn một chuỗi khách sạn đặt hai trăm bức treo phòng.`, [
      C("Tặng bảo tàng bức lớn nhất", { counters: step(c, PN, { pnt_name: 2 }), money: -0.1, flags: ["pnt_museum"] }, "Mất một bức giá trị, có chỗ trong lịch sử"),
      C("Nhận đơn hai trăm bức cho khách sạn", { counters: step(c, PN, { pnt_name: -1 }), money: 1.0, health: -4 }, "Giàu nhanh, tranh thành đồ trang trí"),
      C("Vận động luật chia phần khi tranh bán lại", { counters: step(c, PN), agency: 0.04, flags: ["pnt_resale_law", "leader"], gamble: { p: 0.3, win: { money: 0.3, log: "Đề xuất của bạn thành luật. Lần đầu tiên, tranh bán lại phải trả một phần cho người vẽ." }, lose: { bw: -4, log: "Đề xuất bị xếp vào ngăn kéo, nhưng hai trăm họa sĩ đã ký tên cùng bạn." } } }, "Đổi luật cho cả nghề, có thể vô ích", { tier: "sovereign" })], 0);
    return T("Xưởng vẽ bị lấy lại", `Chủ nhà bán căn nhà có xưởng vẽ của bạn; một tháng nữa phải dọn đi.${f(c, "pnt_collective") ? " Ba người bạn trong xưởng chung cũng phải tìm chỗ mới." : ""} Một trăm hai mươi bức tranh không bán được xếp chồng sát tường, chưa biết mang đi đâu.`, [
      C("Đốt những bức không ưng, giữ hai mươi bức", { counters: step(c, PN), happy: -3, bw: 4, flags: ["pnt_burned"] }, "Nhẹ người, mất một phần đời đã vẽ"),
      C("Vay tiền thuê kho, giữ tất cả", { counters: step(c, PN), custom: "borrow:0.4", flags: ["pnt_archive"] }, "Nợ thêm, không mất bức nào"),
      C("Tặng tranh cho trường học, bệnh viện", { counters: step(c, PN, { pnt_name: 1 }), rel: 4, flags: ["pnt_gave_away"] }, "Không được đồng nào, tranh có người xem")], 2);
  }, adult),
  beat(PN, 5, 6, (c) => {
    const why = f(c, "pnt_burned") ? " Đó là bức duy nhất bạn không nỡ đốt năm dọn xưởng."
      : f(c, "pnt_museum") ? " Bảo tàng đã có bức lớn nhất của bạn, nhưng họ muốn cả bức này."
      : f(c, "pnt_whistle") ? " Bức này chưa từng qua tay phòng tranh nào."
      : f(c, "pnt_apprentice") ? " Đứa trẻ từng đứng xem bạn vẽ năm nào, giờ là họa sĩ, nói nó muốn được giữ bức tranh." : "";
    return T("Bức tranh không bao giờ bán", `Bức chân dung mẹ bạn vẽ năm hai mươi lăm tuổi vẫn treo ở đầu giường. Một người mua trả cái giá bằng mấy năm thu nhập.${why}`, [
      C("Bán, chia tiền cho con cháu", { counters: step(c, PN), money: 0.8, happy: -2 }, "Của để lại, mất một kỷ vật"),
      C("Tặng bảo tàng nơi mình lớn lên", { counters: step(c, PN, { pnt_name: 1 }), rel: 2, flags: ["pnt_legacy"] }, "Không lấy tiền, bức tranh ở lại với quê"),
      C("Giữ lại, vẽ thêm một bức cuối bên cạnh", { counters: step(c, PN), happy: 5, health: -1 }, "Không đổi gì, thêm một mùa vẽ")], 2);
  }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(PN, "pnt_late_portrait", [18, 80], 10, (c) => T("Chân dung từ tấm ảnh mờ", vary("pnd", c.age, [
    "Một gia đình mang đến tấm ảnh thẻ mờ của người cha vừa mất, nhờ bạn vẽ chân dung khổ lớn. Họ muốn ông cười, dù trong ảnh ông không cười.",
    "Một bà cụ nhờ vẽ chân dung người con trai mất năm mười chín tuổi, \"vẽ như nó bây giờ, nếu nó còn sống\"."]), [
    C("Nhận, vẽ kỹ từng nét", { money: 0.05, happy: -1, counters: { kind: 1 } }, "Có tiền, nặng lòng nhiều tuần"),
    C("Từ chối, chỉ vẽ người đang sống", { happy: 1 }, "Nhẹ lòng, mất một khoản")], 0)),
  daily(PN, "pnt_forgery", [20, 75], 99, () => T("Vẽ theo phong cách cố danh họa", "Một tay buôn tranh đặt bạn vẽ mười bức \"theo phong cách\" một danh họa đã mất, không ký tên, nói là để trang trí khách sạn. Giá gấp năm lần tranh của chính bạn. Bạn biết danh họa ấy có rất nhiều tranh thất lạc.", [
    C("Nhận, không hỏi thêm", { money: 0.3, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [3, 12], note: "vẽ tranh nhái để người khác ký tên danh họa" } }, "Tiền lớn, một bí mật có thể nổ"),
    C("Từ chối", { counters: { honest: 1 } }),
    C("Nhận, ký tên mình ở mặt sau từng bức", { money: 0.2, gamble: { p: 0.5, win: { flags: ["pnt_signed_back"], log: "Tay buôn càu nhàu nhưng vẫn lấy tranh." }, lose: { money: -0.2, log: "Tay buôn hủy đơn, đòi lại tiền cọc." } } }, "Ít tiền hơn, có bằng chứng mình trong sạch", { tier: "awakened" })], 1)),
  daily(PN, "pnt_ai_client", [20, 75], 99, () => T("Chép lại một bức ảnh máy tạo", "Một khách gửi bức ảnh do phần mềm tạo ra, nhờ bạn chép lại bằng sơn dầu \"cho có hồn\". Họ trả bằng một nửa giá tranh của bạn, vì \"bố cục có sẵn rồi\".", [
    C("Nhận, chép cho xong", { money: 0.04, happy: -2, flags: ["pnt_copies_machine"] }, "Có tiền, tay vẽ thành máy in"),
    C("Từ chối", { happy: 1 }, "Giữ tay nghề, mất một khách"),
    C("Đề nghị vẽ trực tiếp, khách ngồi xem", { gamble: { p: 0.5, win: { money: 0.06, flags: ["pnt_live_painting"], log: "Khách ngồi xem suốt ba buổi, rồi đặt thêm hai bức nữa." }, lose: { log: "Khách nói không có thời gian." } } }, "Bán cả quá trình, không chỉ bức tranh", { tier: "sovereign" })], 0)),
  daily(PN, "pnt_mural", [18, 80], 10, (c) => T("Bức tường cho cả xóm", vary("pnm", c.age, [
    "Một trường tiểu học ở vùng ven xin bạn vẽ bức tranh tường dài hai mươi mét. Trường chỉ lo được tiền sơn; bạn phải đi về ba tháng cuối tuần.",
    "Khu phố nhờ bạn vẽ lên bức tường cũ dán đầy quảng cáo. Ban đại diện khu phố hứa chịu tiền sơn, nhưng chưa ai ký giấy."]), [
    C("Vẽ không lấy tiền công", { money: -0.04, rel: 4, counters: { pnt_name: 1 }, flags: ["pnt_mural"] }, "Mất cuối tuần, cả khu nhớ tên bạn"),
    C("Nhận, đòi đủ tiền công", { money: 0.05, rel: -1 }, "Đúng giá công, bớt tình nghĩa"),
    C("Rủ bọn trẻ cùng vẽ một phần", { bw: -3, rel: 3, counters: { kind: 1 }, flags: ["pnt_mural"] }, "Chậm và lem nhem hơn, tường là của tất cả", { tier: "awakened" })], 0)),
  daily(PN, "pnt_removed", [22, 80], 99, () => T("Bức tranh bị yêu cầu gỡ", "Hai giờ trước khai mạc, chủ phòng triển lãm xin bạn gỡ một bức: cảnh xóm chài ngập nước, phía sau là sân gôn mới xây. \"Nhà tài trợ sẽ đến,\" chị nói.", [
    C("Gỡ xuống", { happy: -3, flags: ["pnt_self_censor"] }, "Triển lãm suôn sẻ, lòng không yên"),
    C("Giữ, chấp nhận hủy triển lãm", { counters: { pnt_name: 1 }, money: -0.1 }, "Mất triển lãm, giữ tiếng nói"),
    C("Treo khung trống, ghi \"bức tranh đã bị gỡ\"", { gamble: { p: 0.55, win: { counters: { pnt_name: 2 }, log: "Khung trống được chụp ảnh nhiều hơn mọi bức khác." }, lose: { money: -0.05, log: "Nhà tài trợ rút tiền khỏi phòng triển lãm từ năm sau." } } }, "Biến lệnh gỡ thành tác phẩm", { tier: "sovereign" })], 0)),
  daily(PN, "pnt_solvent", [25, 80], 99, () => T("Mùi dung môi trong phòng kín", "Mười năm vẽ sơn dầu trong căn phòng không cửa sổ. Bạn hay đau đầu về chiều, tay run khi rửa cọ. Lắp quạt hút và chuyển sang màu gốc nước tốn bằng hai tháng thu nhập.", [
    C("Lắp quạt hút, đổi chất liệu", { money: -0.15, health: 4, flags: ["pnt_safe_studio"] }, "Tốn tiền, phải học lại cách vẽ"),
    C("Mở hé cửa, vẽ tiếp như cũ", { health: -4 }, "Giữ chất liệu quen, phổi chịu")], 0)),
  daily(PN, "pnt_watcher", [20, 80], 99, () => T("Đứa trẻ đứng ngoài cửa xưởng", "Một đứa trẻ trong xóm đứng ngoài cửa xưởng xem bạn vẽ mỗi chiều, áo đồng phục đã bạc màu. Hôm nay nó mang theo một bức vẽ bằng bút bi trên mặt sau tờ lịch cũ.", [
    C("Dạy nó vẽ, mỗi chiều một tiếng", { bw: -3, counters: { kind: 1 }, flags: ["pnt_apprentice"] }, "Mất giờ vẽ, có một học trò"),
    C("Cho nó một hộp màu", { money: -0.02, counters: { kind: 1 } }, "Tốn ít, giúp một chút"),
    C("Đóng cửa xưởng cho yên", { happy: -1, bw: 1 }, "Yên tĩnh, lỡ một đôi mắt")], 0)),
  daily(PN, "pnt_rival", [20, 80], 99, (c, N) => { const r = role(c, "rival")!; return T("Lối vẽ bị lấy mất", `${N(r)} từng học cùng lớp mỹ thuật với bạn. Triển lãm mới của ${N(r)} dùng đúng lối vẽ bạn mày mò suốt mười năm, và báo chí gọi đó là "một phát hiện".`, [
    C("Viết bài so sánh hai loạt tranh", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.3, note: "bài báo so sánh hai loạt tranh" }, gamble: { p: 0.4, win: { counters: { pnt_name: 1 }, log: "Người trong nghề đứng về phía bạn." }, lose: { happy: -3, log: "Người ta bảo bạn ghen tị." } } }, "Đòi công bằng, thêm một kẻ thù"),
    C("Đổi hướng, tìm một lối vẽ mới", { know: 3, happy: -2, flags: ["pnt_reinvented"] }, "Đau, nhưng buộc phải lớn"),
    C("Đề nghị triển lãm đôi, treo hai loạt cạnh nhau", { gamble: { p: 0.45, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.25, note: "triển lãm đôi treo hai loạt tranh cạnh nhau" }, counters: { pnt_name: 1 }, log: "Người xem tự thấy ai đi trước. Cả hai vẫn bán được tranh." }, lose: { log: `${N(r)} từ chối, nói không có lịch.` } } }, "Để người xem phân xử", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PN, "pnt_tradition", [20, 60], 99, (c) => { const vn = c.country === "VN"; return T("Chất liệu của người xưa", vn
    ? "Một nghệ nhân sơn mài ngoài bảy mươi tuổi đề nghị dạy bạn nghề: hai năm, mài tay từng lớp sơn, không được bán bức nào trước khi ông cho phép."
    : "Một nghệ nhân già vẽ bằng màu tự nghiền từ đất và đá đề nghị nhận bạn làm học trò: hai năm, không được bán bức nào trước khi bà cho phép.", [
    C("Theo học hai năm", { income_mult: 0.85, know: 4, flags: ["pnt_tradition"] }, "Nghèo hai năm, có tay nghề hiếm"),
    C("Cảm ơn, giữ lối vẽ hiện tại", { money: 0.03 }),
    C("Học buổi tối, quay phim ghi lại nghề", { bw: -4, gamble: { p: 0.5, win: { counters: { pnt_name: 1 }, flags: ["pnt_tradition", "pnt_recorded_craft"], log: "Bộ phim ngắn về nghề được trường mỹ thuật dùng làm tài liệu." }, lose: { log: vn ? "Ông không thích máy quay, chỉ dạy bạn vài buổi." : "Bà không thích máy quay, chỉ dạy bạn vài buổi." } } }, "Học ít hơn, giữ nghề cho nhiều người", { tier: "sovereign" })], 0); }),
  daily(PN, "pnt_collector", [25, 80], 99, () => T("Mua cả xưởng một lần", "Một nhà đầu tư tranh đề nghị mua toàn bộ bốn mươi bức trong xưởng, giá bằng ba năm thu nhập, với điều kiện năm năm tới chỉ ông được bán tranh của bạn.", [
    C("Bán hết, ký điều kiện", { money: 0.9, happy: -1, flags: ["pnt_owned"] }, "Giàu ngay, giá tranh do ông ấy định"),
    C("Chỉ bán một nửa, không ký độc quyền", { gamble: { p: 0.5, win: { money: 0.4, log: "Ông ấy đồng ý, có phần tiếc." }, lose: { log: "Ông ấy chỉ muốn tất cả hoặc không gì cả." } } }, "Giữ tự do, có thể trắng tay"),
    C("Giữ lại, không bán", { happy: 2 })], 1)),

  /* ---------- gia đình ---------- */
  cross(PN, "pnt_family", [22, 80], (c) => !!(role(c, "mother") || role(c, "father")) || (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    const p = role(c, "mother") ?? role(c, "father");
    if (k) return T(`${N(k)} ngại vì nghề của bạn`, `Sắp họp phụ huynh, ${N(k)} xin bạn đừng mặc chiếc áo dính sơn và đừng nói mình là họa sĩ. "Bố mẹ các bạn khác toàn là bác sĩ với kỹ sư."`, [
      C("Mặc sơ mi, đi họp lặng lẽ", { trust: { npc: k, delta: 0.1 }, happy: -2 }, "Con yên tâm, bạn thu mình lại"),
      C("Đến đúng như mình vẫn là", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.15 }, log: `Cô giáo xin bạn vẽ giúp tờ báo tường. ${N(k)} giả vờ không quan tâm, nhưng kể với cả lớp.` }, lose: { trust: { npc: k, delta: -0.15 }, log: `${N(k)} đi trước bạn mười bước suốt đường về.` } } }, "Sống thật, có thể làm con ngượng"),
      C("Mời cả lớp đến xưởng vẽ một buổi", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `Ba mươi đứa trẻ lấm lem màu. ${N(k)} được bạn bè hỏi han cả tuần.` }, lose: { trust: { npc: k, delta: -0.1 }, log: "Chỉ có bốn đứa đến." } } }, "Biến nỗi ngại thành niềm tự hào", { tier: "sovereign" })], 0, { npc: k });
    if (p) return T(`${N(p)} ngồi làm mẫu`, `${N(p)} đã có tuổi, đồng ý ngồi cho bạn vẽ chân dung: mười buổi chiều, mỗi buổi hai tiếng. Ngồi lâu, ${N(p)} bắt đầu kể những chuyện cũ chưa từng kể với ai.`, [
      C("Vẽ thật chậm, nghe hết từng chuyện", { trust: { npc: p, delta: 0.3 }, bw: -2, money: -0.03 }, "Lỡ vài đơn hàng, có mười buổi chiều"),
      C("Chụp ảnh rồi vẽ theo ảnh cho nhanh", { trust: { npc: p, delta: -0.05 }, money: 0.03 }, "Nhanh gọn, lỡ những câu chuyện")], 0, { npc: p });
    const s = role(c, "spouse")!;
    return T("Bức chân dung đã bán", `Bạn bán bức chân dung ${N(s)} vẽ hồi mới quen, vì người mua trả giá quá hời. Tối về, ${N(s)} nhìn khoảng tường trống rất lâu mà không nói gì.`, [
      C("Mua lại bức tranh, dù giá gấp đôi", { trust: { npc: s, delta: 0.25 }, money: -0.15 }, "Mất tiền, giữ được lòng người"),
      C(`Vẽ ${N(s)} một bức mới ngay tối nay`, { trust: { npc: s, delta: 0.15 }, bw: -2 }, "Một đêm thức trắng, một bức tranh khác"),
      C("Giải thích rằng tranh là để bán", { trust: { npc: s, delta: -0.2 } })], 1, { npc: s });
  }),
];

/* ======================================================================= NHIẾP ẢNH GIA */
const PH = "photographer";

const PHOTOGRAPHER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PH, "pho_t_film", [10, 16], () => true, () => T("Cuộn phim ba mươi sáu kiểu", "Ông để lại cho bạn một chiếc máy ảnh phim cũ và một cuộn phim chưa dùng. Ba mươi sáu kiểu, tiền rửa bằng cả tháng tiền ăn sáng. Bạn đã ngắm qua ống ngắm cả tuần mà chưa bấm lần nào.", [
    C("Nhịn ăn sáng để chụp và rửa phim", { flags: [talentFlag(PH)], counters: { talents_seen: 1 }, money: -0.01, health: -1, happy: 4 }, "Đói một tháng, học được cách nhìn"),
    C("Bán máy cho tiệm đồ cũ", { counters: { talents_seen: 1 }, money: 0.02 }, "Có chút tiền, mất kỷ vật"),
    C("Cất máy làm kỷ niệm", { counters: { talents_seen: 1 }, happy: 1 })], 0)),
  talent(PH, "pho_t_faces", [12, 16], () => true, () => T("Những gương mặt đầu ngõ", "Bằng chiếc điện thoại cũ, bạn chụp ông thợ khóa, bà bán rau, chú bảo vệ chợ, mỗi người một tấm. Trang mạng của khu phố đăng lại, và có người bình luận: \"Lần đầu tôi thấy chú ấy cười.\"", [
    C("Chụp tiếp mỗi chiều sau giờ học", { flags: [talentFlag(PH)], counters: { talents_seen: 1 }, know: -1, happy: 3 }, "Học hành lơ là, khu phố thành bạn"),
    C("Xóa bớt ảnh, tập trung ôn thi", { counters: { talents_seen: 1 }, know: 2 }, "Điểm chắc hơn, bớt một con mắt")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PH, "pho_d_wedding", [18, 40], () => true, () => T("Người vác đèn cho tiệm ảnh cưới", "Một tiệm ảnh cưới cần người phụ vác đèn, mỗi cuối tuần mười bốn tiếng đứng ngoài nắng. Chủ tiệm nói nếu bạn chịu được một mùa cưới, ông sẽ cho bạn cầm máy thứ hai.", [
    C("Nhận, học nghề từ chân vác đèn", { ...become(PH), counters: { doors_seen: 1 }, money: -0.03, health: -2 }, "Cực và rẻ, vào nghề từ gốc"),
    C("Chỉ phụ vài đám cưới kiếm thêm", { counters: { doors_seen: 1 }, money: 0.03 })], 0)),
  door(PH, "pho_d_flood", [18, 45], () => true, () => T("Tấm ảnh con phố ngập", "Bạn chụp được cảnh người dân dùng thuyền nhỏ chở nhau qua con phố ngập sau trận mưa lớn. Tấm ảnh lan khắp mạng chỉ sau một đêm. Một tòa báo muốn mua nó và đề nghị bạn làm cộng tác viên ảnh.", [
    C("Bán ảnh, nhận làm cộng tác viên", { ...become(PH), counters: { doors_seen: 1 }, money: 0.03, flags: ["pho_press"] }, "Có nghề mới, thu nhập theo tin"),
    C("Cho báo dùng miễn phí, chỉ cần ghi tên", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(PH), log: "Ba tòa báo gọi đến sau khi thấy tên bạn dưới tấm ảnh." }, lose: { log: "Tên bạn bị in sai. Không ai gọi lại." } } }, "Không lấy tiền, đặt cược vào cái tên"),
    C("Không bán, người trong ảnh chưa đồng ý", { counters: { doors_seen: 1, honest: 1 } }, "Giữ nguyên tắc, lỡ một cánh cửa")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PH, 1, 1, (c) => T("Khoảnh khắc trao nhẫn bị che", `Đám cưới đầu tiên bạn chụp chính: sáu trăm tấm ảnh. Về nhà xem lại, khoảnh khắc trao nhẫn bị lưng ông chú cô dâu che mất trọn vẹn.${f(c, "pho_press") ? " Bạn nhận đám này vì tiền ảnh báo không đủ trả tiền nhà." : ""}`, [
    C("Nói thật, giảm một nửa tiền", { counters: step(c, PH, { honest: 1 }), money: -0.03, flags: ["pho_honest"] }, "Mất tiền, được tiếng thật thà"),
    C("Mời cô dâu chú rể dựng lại cảnh", { counters: step(c, PH), gamble: { p: 0.6, win: { counters: { pho_eye: 1 }, log: "Họ vui vẻ trao nhẫn lần hai dưới nắng chiều. Tấm ảnh còn đẹp hơn." }, lose: { happy: -3, log: "Mẹ cô dâu nổi giận, kể với cả họ hàng." } } }, "Có thể cứu vãn, có thể mất khách"),
    C("Ghép ảnh cho có, không nói gì", { counters: step(c, PH, { honest: -1 }), money: 0.02, flags: ["pho_retoucher"] }, "Êm chuyện, bắt đầu một thói quen")], 0), adult),
  beat(PH, 2, 3, (c, N) => { const pa = role(c, "partner"); return T("Studio hay tòa soạn", `${f(c, "pho_press") ? "Tòa soạn đề nghị bạn vào làm phóng viên ảnh chính thức" : "Một hãng tin đề nghị bạn làm phóng viên ảnh"}: lương thấp, đi bất cứ đâu có tin. Cùng lúc, ${pa ? N(pa) : "một người quen"} rủ hùn vốn mở studio ảnh cưới, góp tiền thuê mặt bằng và máy móc.`, [
    C("Mở studio ảnh cưới", { counters: step(c, PH), income_mult: 1.6, flags: ["pho_studio"], ...(pa ? { trust: { npc: pa, delta: 0.15 } } : {}) }, "Thu nhập tốt, ống kính quanh váy cưới"),
    C("Vào hãng tin, chụp thời sự", { counters: step(c, PH, { pho_eye: 1 }), income_mult: 1.1, flags: ["pho_press"] }, "Lương thấp, đi theo sự thật"),
    C("Làm dự án ảnh dài hạn, tự xin tài trợ", { counters: step(c, PH), gamble: { p: 0.4, win: { income_mult: 1.3, counters: { pho_eye: 2 }, flags: ["pho_project"], log: "Một quỹ văn hóa tài trợ bạn hai năm để chụp những người cuối cùng còn làm một nghề sắp mất." }, lose: { income_mult: 0.9, flags: ["pho_project"], log: "Không quỹ nào trả lời. Bạn vẫn chụp, bằng tiền tiết kiệm." } } }, "Tự chọn đề tài, có thể không ai trả tiền", { tier: "sovereign" })], 0, pa ? { npc: pa } : {}); }, adult),
  beat(PH, 3, 4, (c) => {
    const pa = role(c, "partner");
    if (!f(c, "pho_studio")) return T("Chuyến đi vùng giao tranh", "Giao tranh nổ ra ở một vùng biên giới. Hãng cần một người đi ngay, trả gấp ba, nhưng bảo hiểm không chi trả cho vùng chiến sự. Hai đồng nghiệp đã từ chối.", [
      C("Đi", { counters: step(c, PH), gamble: { p: 0.6, win: { money: 0.3, counters: { pho_eye: 3 }, flags: ["pho_frontline"], log: "Ảnh của bạn lên trang nhất ở nhiều nước. Bạn về nhà gầy đi bảy cân." }, lose: { health: -15, flags: ["pho_injured"], log: "Một mảnh đạn găm vào chân. Bạn nằm viện ba tháng." } } }, "Có thể thành danh, có thể không về"),
      C("Không đi, ở lại chụp tin trong nước", { counters: step(c, PH), happy: -3, health: 1 }, "An toàn, nhìn người khác lên trang nhất"),
      C("Bỏ nghề ảnh, tìm việc văn phòng", { counters: step(c, PH), ...leave(PH), flags: ["pho_quit"], happy: -2 }, "Bình yên, cất máy ảnh vào tủ")], 1);
    return T("Ai cũng có máy ảnh trong túi", "Khách giờ tự chụp bằng điện thoại, còn các studio mới đổi phông nền bằng phần mềm chỉ trong một phút. Lịch chụp của bạn giảm hơn một nửa, tiền thuê mặt bằng đã nợ năm tháng.", [
      C("Vay tiền làm mới studio", { counters: step(c, PH), custom: "borrow:0.5", gamble: { p: 0.4, win: { income_mult: 1.3, log: "Studio mới kín lịch trước ba tháng." }, lose: { income_mult: 0.7, log: "Khách vẫn thưa. Giờ bạn còn thêm một khoản nợ." } } }, "Đặt cược tiếp, có thể nợ chồng nợ"),
      C("Thu nhỏ, chụp ảnh thẻ và ảnh sản phẩm", { counters: step(c, PH), income_mult: 0.8, flags: ["pho_small_shop"] }, "Sống được, không còn là nghệ thuật"),
      C("Đóng studio, nghỉ nghề", { counters: step(c, PH), ...leave(PH), flags: ["pho_quit"], happy: -3, ...(pa ? { memory: { npc: pa, tag: "BETRAYED_PARTNERSHIP", weight: -0.2, note: "đóng studio ảnh cưới giữa chừng" } } : {}) }, "Cắt lỗ, mất nghề")], 1, pa ? { npc: pa } : {});
  }, adult),
  beat(PH, 4, 5, (c) => {
    if (f(c, "pho_frontline") || cnt(c, "pho_eye") >= 3) return T("Người trong tấm ảnh đoạt giải", `Tấm ảnh nổi tiếng nhất của bạn đoạt một giải ảnh quốc tế, tiền thưởng bằng hai năm thu nhập. Tuần sau, người phụ nữ trong ảnh tìm đến. Đời bà không đổi gì sau tấm ảnh ấy, và bà hỏi bạn có chia cho bà một phần không.${f(c, "pho_injured") ? " Bạn vẫn đi tập tễnh từ chuyến công tác năm ấy." : ""}`, [
      C("Chia bà một nửa tiền thưởng", { counters: step(c, PH), money: 0.5, rel: 3, flags: ["pho_shared_prize"] }, "Giữ ít hơn, nhẹ lòng hơn"),
      C("Giữ tiền, đó là công việc của mình", { counters: step(c, PH, { pho_eye: -1 }), money: 1.0, happy: -2 }, "Đủ đầy, mang theo một câu hỏi mãi"),
      C("Lập quỹ học bổng cho trẻ em làng bà", { counters: step(c, PH, { pho_eye: 1 }), money: 0.2, agency: 0.03, flags: ["pho_fund"] }, "Tiền không về ai, về cả làng", { tier: "sovereign" })], 0);
    return T("Kho ảnh hai mươi năm", `${f(c, "pho_small_shop") ? "Tiệm ảnh thẻ của bạn vắng dần. " : ""}Một công ty muốn mua trọn kho ảnh hai mươi năm của bạn, hàng trăm nghìn tấm, để bán trên mạng và dạy máy tạo ảnh. Họ trả một lần, và mọi tấm ảnh sẽ không còn mang tên bạn.`, [
      C("Bán cả kho ảnh", { counters: step(c, PH), money: 0.8, flags: ["pho_sold_archive"] }, "Tiền ngay, mất quyền với cả đời ảnh"),
      C("Tự in một cuốn sách ảnh về phố cũ", { counters: step(c, PH, { pho_eye: 2 }), money: -0.2, flags: ["pho_photobook"] }, "Tốn tiền in, tên bạn ở lại"),
      C("Tặng kho ảnh cho thư viện thành phố", { counters: step(c, PH, { pho_eye: 1 }), rel: 3, flags: ["pho_public_archive"] }, "Không lấy đồng nào, ảnh thuộc về mọi người")], 1);
  }, adult),
  beat(PH, 5, 6, (c) => {
    const memo = f(c, "pho_injured") ? " Cái chân bị thương năm nào lại nhức lên mỗi khi trời trở."
      : f(c, "pho_sold_archive") ? " Kho ảnh cũ không còn là của bạn; chỉ còn mấy cuộn này."
      : f(c, "pho_shared_prize") ? " Người phụ nữ trong tấm ảnh đoạt giải vẫn gửi thiệp cho bạn mỗi năm."
      : f(c, "pho_photobook") ? " Cuốn sách ảnh về phố cũ đã tái bản ba lần, mà bạn chưa từng biết có những cuộn này." : "";
    return T("Những cuộn phim chưa rửa", `Dọn tủ, bạn tìm thấy mười hai cuộn phim chưa rửa từ những năm đầu vào nghề. Trong đó là bố mẹ bạn khi còn trẻ hơn bạn bây giờ, và những người bạn đã không còn.${memo} Một bảo tàng muốn làm triển lãm hồi cố về bạn.`, [
      C("Triển lãm, kể cả những tấm hỏng", { counters: step(c, PH, { pho_eye: 1 }), happy: 4, flags: ["pho_retrospective"] }, "Phơi cả đời mình, được nhìn lại"),
      C("Dạy lớp ảnh miễn phí cho trẻ vùng xa", { counters: step(c, PH), rel: 3, bw: -3, flags: ["pho_teacher"] }, "Mất sức, trao lại con mắt"),
      C("Rửa ảnh, chỉ để gia đình xem", { counters: step(c, PH), happy: 3, rel: 2 }, "Không ai ngoài nhà biết, nhà thì nhớ")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PH, "pho_bride_edit", [18, 65], 10, (c) => T("Chỉnh mặt cô dâu", vary("phb", c.age, [
    "Cô dâu gửi lại bộ ảnh lần thứ tư: mắt to hơn, cằm nhọn hơn, da trắng hơn nữa. Đến bản này, mẹ cô cũng không nhận ra con gái mình.",
    "Một khách hàng đòi xóa hẳn người chị gái vừa cãi nhau với cô khỏi mọi tấm ảnh cưới."]), [
    C("Chỉnh đúng như khách muốn", { money: 0.03, happy: -1, flags: ["pho_retoucher"] }, "Khách vui, ảnh không còn là người thật"),
    C("Từ chối chỉnh thêm", { happy: 1, money: -0.02, counters: { honest: 1 } }, "Mất khách, giữ tay nghề"),
    C("Giao hai bản: bản thật và bản chỉnh", { bw: -2, gamble: { p: 0.6, win: { counters: { pho_eye: 1 }, log: "Mười năm sau, họ in bản thật treo phòng khách." }, lose: { log: "Khách xóa bản thật ngay trước mặt bạn." } } }, "Tốn công gấp đôi, để khách tự chọn", { tier: "sovereign" })], 0)),
  daily(PH, "pho_exposure", [18, 60], 99, () => T("Trả công bằng tiếng tăm", "Một khu nghỉ dưỡng mời bạn chụp bộ ảnh quảng cáo, trả công bằng ba đêm phòng miễn phí và \"được nhiều người biết đến\". Tiền thuê nhà tháng này của bạn còn thiếu một nửa.", [
    C("Nhận, coi như quảng bá", { money: -0.02, happy: 2, gamble: { p: 0.3, win: { counters: { pho_eye: 1 }, money: 0.08, log: "Một khách nghỉ ở đó thuê bạn chụp sự kiện, trả đủ tiền." }, lose: { log: "Ảnh của bạn lên biển quảng cáo, tên bạn thì không." } } }, "Không có tiền, có thể có khách"),
    C("Đòi trả tiền theo bảng giá", { gamble: { p: 0.45, win: { money: 0.06, log: "Họ trả, sau ba tuần im lặng." }, lose: { log: "Họ tìm người khác chịu làm không công." } } }, "Giữ giá, có thể mất việc"),
    C("Rủ các thợ ảnh cùng công khai bảng giá chung", { flags: ["pho_fair_rates", "leader"], agency: 0.02, bw: -2 }, "Mất khách trước mắt, đổi luật chơi", { tier: "sovereign" })], 1)),
  daily(PH, "pho_lens", [20, 65], 10, (c) => T("Đồ nghề bằng ba tháng lương", vary("phl", c.age, [
    "Một ống kính mới giúp bạn chụp được trong ánh sáng yếu, giá bằng ba tháng thu nhập. Người bán cho trả góp mười hai tháng.",
    "Máy ảnh của bạn hỏng màn trập giữa mùa cưới. Sửa thì mất ba tuần, mua mới thì phải vay."]), [
    C("Mua trả góp", { custom: "borrow:0.25", income_mult: 1.05 }, "Nợ một năm, ảnh đẹp hơn"),
    C("Thuê máy theo từng buổi chụp", { money: -0.04, bw: -1 }, "Không nợ, mỗi buổi đều tốn"),
    C("Dùng đồ cũ, chụp khéo hơn", { know: 2, flags: ["pho_old_gear"] }, "Không nợ, phải giỏi hơn đồ nghề")], 2)),
  daily(PH, "pho_tabloid", [20, 65], 99, () => T("Ảnh trong hành lang bệnh viện", "Một tờ báo lá cải trả số tiền bằng nửa năm thu nhập cho tấm ảnh một ca sĩ nổi tiếng đang nằm viện. Họ biết bạn quen người bảo vệ ở tầng ấy.", [
    C("Chụp, bán ảnh", { money: 0.5, counters: { honest: -1 }, flags: ["pho_paparazzi"], gamble: { p: 0.7, win: { log: "Tấm ảnh lên trang nhất. Bạn không đọc phần bình luận." }, lose: { counters: { pho_eye: -2 }, log: "Gia đình ca sĩ kiện tờ báo. Tên bạn bị nêu ra trước tòa." } } }, "Tiền lớn, đổi bằng phẩm giá"),
    C("Từ chối", { counters: { honest: 1 } })], 1)),
  daily(PH, "pho_stranger", [20, 65], 99, () => T("Người phụ nữ trong khung hình", "Tấm ảnh đường phố chụp một người phụ nữ đang cười của bạn đoạt giải nhì một cuộc thi. Chị tìm ra bạn và xin gỡ ảnh: chị đang tránh mặt người chồng cũ, và không muốn bị nhận ra.", [
    C("Gỡ ảnh, rút khỏi cuộc thi", { counters: { pho_eye: -1, honest: 1 }, flags: ["pho_consent"] }, "Mất giải, giữ an toàn cho người khác"),
    C("Giữ ảnh, đó là nơi công cộng", { counters: { pho_eye: 1 }, happy: -2 }, "Giữ giải, mang theo một nỗi lo"),
    C("Xin ban tổ chức thay bằng bản che mặt", { gamble: { p: 0.5, win: { flags: ["pho_consent"], log: "Ban tổ chức đồng ý. Chị gửi bạn một tin nhắn cảm ơn." }, lose: { counters: { pho_eye: -1 }, log: "Ban tổ chức nói giải phải gắn với ảnh gốc. Bạn rút ảnh." } } }, "Tìm đường giữa, có thể vẫn mất giải", { tier: "awakened" })], 0)),
  daily(PH, "pho_ai", [20, 70], 99, () => T("Ảnh không có ai chụp", "Tạp chí quen báo từ nay sẽ dùng ảnh do máy tạo cho các bài du lịch: rẻ hơn, \"đẹp hơn thật\". Họ chỉ còn cần bạn cho những tin có người thật, việc thật.", [
    C("Học dùng phần mềm, nhận cả hai việc", { know: 2, income_mult: 1.05, flags: ["pho_hybrid"] }, "Giữ thu nhập, ranh giới thật giả mờ đi"),
    C("Chỉ chụp người thật, việc thật", { income_mult: 0.9, counters: { pho_eye: 1 }, flags: ["pho_real_only"] }, "Ít việc hơn, tấm nào cũng có thật"),
    C("Cùng đồng nghiệp lập nhãn \"ảnh chụp thật\"", { agency: 0.02, bw: -3, flags: ["pho_real_label", "leader"] }, "Tốn công, cho người xem quyền được biết", { tier: "sovereign" })], 1)),
  daily(PH, "pho_rival", [20, 70], 99, (c, N) => { const r = role(c, "rival")!; return T("Khách quen sang tiệm bên kia", `${N(r)} mở tiệm ảnh cách bạn hai con phố, chào giá rẻ hơn ba mươi phần trăm. Ba khách quen của bạn đã sang bên ấy, và ${N(r)} còn đăng ảnh của bạn làm mẫu trên trang của mình.`, [
    C("Hạ giá theo", { money: -0.05, income_mult: 0.95, counters: { pho_eye: -1 } }, "Giữ khách, cả hai cùng nghèo đi"),
    C("Công khai chuyện lấy ảnh, đòi gỡ", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "bị tố lấy ảnh người khác làm mẫu" }, gamble: { p: 0.6, win: { counters: { pho_eye: 1 }, log: `${N(r)} gỡ ảnh và xin lỗi trên trang của mình.` }, lose: { log: "Người ta coi đó là chuyện cãi vã của hai tiệm ảnh." } } }, "Đòi lại công bằng, thêm một kẻ thù"),
    C(`Đề nghị chia khách với ${N(r)}`, { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia khách giữa hai tiệm ảnh" }, log: "Bạn chụp cưới, bên kia chụp ảnh thẻ. Hai tiệm gửi khách cho nhau, cả hai cùng đông." }, lose: { log: `${N(r)} cười, bảo khách là của ai nhanh tay.` } } }, "Bắt tay đối thủ, có thể bị lợi dụng", { tier: "sovereign" })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PH, "pho_back", [25, 70], 99, () => T("Mười hai cân trên vai", "Mười lăm năm đeo túi máy mười hai cân, lưng bạn bắt đầu đau mỗi sáng. Bác sĩ nói đĩa đệm đã phồng, phải bớt mang vác.", [
    C("Đổi sang máy nhẹ, bỏ bớt ống kính", { money: -0.15, health: 4, flags: ["pho_light_kit"] }, "Tốn tiền, có những cảnh không chụp được"),
    C("Thuê một người phụ mang đồ", { money: -0.06, rel: 2, flags: ["pho_assistant"] }, "Mất bớt thu nhập, có người học nghề"),
    C("Mặc kệ, chụp tiếp", { health: -5 }, "Không tốn gì, lưng trả giá")], 1)),
  daily(PH, "pho_candidate", [25, 70], 99, (c, N) => { const o = role(c, "official")!; return T("Chân dung cho người ra ứng cử", `${N(o)} chuẩn bị ra ứng cử, thuê bạn chụp ảnh chân dung với giá gấp ba. Yêu cầu: trẻ đi mười tuổi, xóa vết sẹo trên má, và "trông như người của dân".`, [
    C("Nhận, chỉnh theo yêu cầu", { money: 0.15, memory: { npc: o, tag: "WIN_WIN_DEAL", weight: 0.2, note: "bộ ảnh chân dung ra ứng cử" } }, "Có tiền, quen người quyền thế"),
    C("Nhận, chụp đẹp nhưng giữ vết sẹo", { gamble: { p: 0.4, win: { trust: { npc: o, delta: 0.2 }, counters: { pho_eye: 1 }, log: `${N(o)} nhìn ảnh rất lâu, rồi chọn đúng tấm có vết sẹo.` }, lose: { trust: { npc: o, delta: -0.15 }, log: `${N(o)} trả nửa tiền và thuê người khác chỉnh lại.` } } }, "Giữ sự thật, có thể mất lòng", { tier: "awakened" }),
    C("Từ chối", { counters: { honest: 1 } })], 0, { npc: o }); }, (c) => !!role(c, "official")),
  daily(PH, "pho_long_trip", [20, 60], 10, (c) => T("Chuyến đi dài ngày", vary("pha", c.age, [
    "Một tạp chí địa lý mời bạn đi ba tháng chụp những người du mục cuối cùng trên cao nguyên, nơi không có sóng điện thoại.",
    "Một tổ chức quốc tế cần người chụp ảnh tư liệu ở các trại di cư, hai tháng, trả theo ngày."]), [
    C("Đi trọn chuyến", { money: 0.1, rel: -3, know: 2, counters: { pho_eye: 1 } }, "Ảnh để đời, nhà vắng bạn"),
    C("Chỉ nhận nửa thời gian", { money: 0.04, happy: -1 }, "Ở gần nhà, ảnh nửa vời"),
    C("Đi, trao máy cho người dân ở đó cùng chụp", { money: 0.06, flags: ["pho_shared_lens"], gamble: { p: 0.5, win: { counters: { pho_eye: 2 }, log: "Bộ ảnh do chính họ chụp được in cạnh ảnh của bạn." }, lose: { log: "Tạp chí chỉ đăng ảnh của bạn." } } }, "Chia ống kính, chia cả tiếng tăm", { tier: "sovereign" })], 0)),

  /* ---------- gia đình ---------- */
  cross(PH, "pho_family", [22, 80], (c) => !!(role(c, "mother") || role(c, "father")) || (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    const p = role(c, "mother") ?? role(c, "father");
    if (k) return T(`${N(k)} xin gỡ ảnh khỏi triển lãm`, `${N(k)} phát hiện bạn treo ảnh hồi nhỏ của mình trong một triển lãm, có cả tấm đang khóc nhè. Bạn bè của ${N(k)} đã thấy, và đã chụp lại.`, [
      C("Gỡ ảnh, xin lỗi con", { trust: { npc: k, delta: 0.25 }, counters: { pho_eye: -1 } }, "Triển lãm hụt một tấm, con tin bạn hơn"),
      C("Giữ, đó là tấm ảnh đẹp nhất của bạn", { trust: { npc: k, delta: -0.2 }, counters: { pho_eye: 1 } }, "Giữ tác phẩm, con xa bạn"),
      C("Để con chọn tấm nào được treo", { trust: { npc: k, delta: 0.2 }, flags: ["pho_family_consent"] }, "Mất quyền chọn, con có tiếng nói", { tier: "awakened" })], 0, { npc: k });
    if (p) return T(`Ảnh chân dung cho ${N(p)}`, c.country === "VN"
      ? `${N(p)} nhờ bạn chụp một tấm chân dung "để sau này làm ảnh thờ". ${N(p)} mặc chiếc áo đẹp nhất, ngồi thẳng lưng, và hỏi bạn có nên cười không.`
      : `${N(p)} nhờ bạn chụp một tấm chân dung "để sau này con cháu có ảnh mà nhớ". ${N(p)} mặc chiếc áo đẹp nhất, ngồi thẳng lưng, và hỏi bạn có nên cười không.`, [
      C("Chụp cả buổi chiều, vừa chụp vừa trò chuyện", { trust: { npc: p, delta: 0.3 }, bw: -2, happy: 2 }, "Mất một ngày làm, được một buổi chiều"),
      C("Chụp nhanh vài kiểu rồi đi làm", { trust: { npc: p, delta: -0.05 }, money: 0.02 }, "Kịp việc, tấm ảnh chỉ vừa đủ"),
      C("Hẹn dịp khác, khi rảnh hơn", { promise: { to: p, what: "chụp ảnh chân dung cho bố mẹ", years: 1 } }, "Lời hứa có thể trễ")], 0, { npc: p });
    const s = role(c, "spouse")!;
    return T("Album gia đình thiếu một người", `${N(s)} lật album gia đình mười năm và nhận ra không có tấm nào có mặt bạn. "Bạn luôn đứng sau máy ảnh," ${N(s)} nói, "kể cả lúc mình cần bạn ở trong khung hình."`, [
      C(`Đưa máy cho ${N(s)}, đứng vào khung hình`, { trust: { npc: s, delta: 0.2 }, flags: ["pho_in_frame"] }, "Ảnh xấu hơn, có mặt mình"),
      C("Thuê thợ chụp ảnh cho cả nhà", { trust: { npc: s, delta: 0.1 }, money: -0.05 }, "Tốn chút tiền, nhanh gọn"),
      C("Cười cho qua", { trust: { npc: s, delta: -0.1 } })], 0, { npc: s });
  }),
];

export const PACK_ARTS_A: Storylet[] = [...ACTOR, ...WRITER, ...PAINTER, ...PHOTOGRAPHER];
