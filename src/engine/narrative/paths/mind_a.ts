/**
 * Gói KHOA HỌC & TRI THỨC (A): nhà khoa học · nhà sáng chế · giảng viên đại học · nhà khảo cổ.
 * Mỗi con đường: 1 năng khiếu · 3 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình = 20 thẻ.
 * Tiền tố: sci_ (nhà khoa học) · ivn_ (nhà sáng chế) · prf_ (giảng viên) · akh_ (nhà khảo cổ).
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross, life } from "./kit.ts";

const SC = "scientist";
const IV = "inventor";
const PF = "professor";
const AK = "archaeologist";

/** Nhịp truyện chỉ mở khi đã trưởng thành (tiền trong nhịp là tiền của người lớn). */
const adult = (c: FactContext): boolean => c.age >= 18;
const npcOf = (id: string | undefined): { npc: string } | Record<string, never> => (id ? { npc: id } : {});

export const PACK_MIND_A: Storylet[] = [
  /* ================================================================ NHÀ KHOA HỌC ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(SC, "sci_t_jars", [8, 14], () => true, () => T("Những chiếc lọ trên bậu cửa", "Bạn xếp sáu chiếc lọ nước ao trên bậu cửa sổ, mỗi sáng đếm lũ bọ gậy rồi ghi vào một cuốn vở. Đến ngày thứ mười hai, lọ để chỗ nắng có ít con hơn hẳn. Không ai trong nhà hiểu bạn đang làm gì.", [
    C("Xin tiền mua kính lúp, ghi tiếp cả mùa", { money: -0.02, know: 3, flags: [talentFlag(SC)], counters: { talents_seen: 1 } }, "Tốn tiền nhà, mở một con đường"),
    C("Mang cuốn vở đến hỏi thầy giáo", { counters: { talents_seen: 1 }, know: 2, gamble: { p: 0.5, win: { flags: [talentFlag(SC)], happy: 3, log: "Thầy đọc hết cuốn vở, rồi cho bạn mượn chìa khóa phòng thí nghiệm của trường." }, lose: { happy: -2, log: "Thầy bảo bạn lo học bài trên lớp trước đã." } } }, "Có thể được nâng đỡ, có thể bị gạt đi"),
    C("Đổ lọ đi trước khi người lớn mắng", { counters: { talents_seen: 1 }, happy: -1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SC, "sci_d_lab", [22, 32], (c) => c.has_degree || f(c, "science_prize") || f(c, "path_uni") || f(c, talentFlag(SC)), (c) => T("Phòng thí nghiệm cần trợ lý", `Viện nghiên cứu trong thành phố tuyển một trợ lý phòng thí nghiệm. Lương chỉ bằng một nửa việc văn phòng bạn đang được mời, nhưng đi kèm một chiếc chìa khóa phòng máy và cơ hội làm nghiên cứu sinh.${c.poor_country ? " Cả viện có một máy ly tâm, phải đăng ký lịch trước hai tuần." : ""}`, [
    C("Nhận, chịu lương thấp", { ...become(SC), counters: { doors_seen: 1 }, money: -0.05, know: 3 }, "Nghèo vài năm, bước vào nghề"),
    C("Nhận việc văn phòng lương gấp đôi", { counters: { doors_seen: 1 }, money: 0.05, flags: ["sci_road_not_taken"] }, "Đủ đầy, khép một cánh cửa"),
    C("Làm văn phòng, thứ bảy vào phụ viện", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(SC), log: "Sau nửa năm, viện mở một suất nghiên cứu sinh và gọi tên bạn trước." }, lose: { log: "Viện cảm ơn bạn, rồi tuyển người khác làm chính thức." } } }, "Giữ lương, mất ngày nghỉ")], 0)),
  door(SC, "sci_d_phd", [22, 35], () => true, (c) => T("Học bổng tiến sĩ ở xứ lạ", `Một trường đại học ở nước ngoài nhận bạn làm nghiên cứu sinh, học bổng năm năm đủ sống nếu tiêu dè. Hạn xác nhận là thứ Sáu.${c.parents_alive > 0 ? (c.country === "VN" ? " Mẹ hỏi năm năm ấy có về ăn Tết được không." : " Ở nhà, bố mẹ hỏi năm năm ấy ai sẽ ghé thăm họ.") : ""}`, [
    C("Nhận học bổng, đi năm năm", { ...become(SC), counters: { doors_seen: 1 }, flags: ["sci_abroad"], rel: -4, know: 5 }, "Xa nhà, vào nghề ở nơi có máy móc tốt"),
    C("Ở lại gần gia đình", { counters: { doors_seen: 1 }, rel: 3, happy: -2 }),
    C("Xin làm từ xa, mỗi năm sang ba tháng", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(SC), flags: ["sci_split_life"], log: "Giáo sư hướng dẫn đồng ý thử một năm. Năm ấy kéo dài thành năm năm." }, lose: { log: "Trường trả lời rằng chương trình không có ngoại lệ." } } }, "Đòi cả hai, có thể mất cả hai", { tier: "awakened" })], 1)),
  door(SC, "sci_d_river", [24, 40], () => true, (c, N) => { const m = role(c, "mentor");
    return T("Nhóm đo nước sông", `${m ? N(m) : "Một người thầy cũ"} đang lập nhóm theo dõi chất độc trong các con sông quanh thành phố và gọi cho bạn. Nhóm có kinh phí hai năm, chưa ai biết có năm thứ ba. Mẫu nước đầu tiên đã có mùi lạ.`, [
      C("Bỏ việc, vào nhóm", { ...become(SC), counters: { doors_seen: 1 }, money: -0.1, ...(m ? { trust: { npc: m, delta: 0.2 } } : {}) }, "Kinh phí hai năm, sau đó chưa biết"),
      C("Góp sức cuối tuần, không lấy lương", { counters: { doors_seen: 1 }, know: 3, bw: -3, ...(m ? { memory: { npc: m, tag: "HELPED_IN_CRISIS" as const, weight: 0.2, note: "lấy mẫu nước sông mỗi cuối tuần" } } : { flags: ["sci_volunteer"] }) }, "Giúp được việc, chưa phải nghề"),
      C("Từ chối", { counters: { doors_seen: 1 } })], 0, npcOf(m)); }),

  /* ---------- mạch truyện ---------- */
  beat(SC, 1, 1, (c) => T("Lần chạy thứ bốn mươi", "Ba mươi chín lần thí nghiệm hỏng. Lần thứ bốn mươi, kết quả khớp đúng giả thuyết, trừ một điểm số liệu nằm lệch hẳn ra ngoài. Trưởng nhóm muốn bản thảo gửi đi trước thứ Sáu.", [
    C("Làm lại từ đầu, chậm ba tháng", { counters: step(c, SC, { sci_integrity: 1 }), flags: ["sci_rigorous"], bw: -4, happy: -2 }, "Chậm, nhưng sạch"),
    C("Bỏ điểm lệch, nộp cho kịp", { counters: step(c, SC, { sci_pubs: 1 }), flags: ["sci_trimmed"], happy: 3, secret: { tag: "FORGED_PAPERS", severity: 0.25, fuse_years: [4, 14], note: "bỏ bớt số liệu trong bài báo đầu tay" } }, "Kịp hạn, để lại một vết"),
    C("Nộp cả điểm lệch, ghi rõ chưa giải thích được", { counters: step(c, SC, { sci_integrity: 1 }), gamble: { p: 0.5, win: { know: 5, counters: { sci_pubs: 1 }, flags: ["sci_odd_point"], log: "Một nhóm ở bên kia địa cầu viết thư hỏi về chính điểm lệch đó." }, lose: { happy: -3, log: "Người bình duyệt chê kết quả chưa sạch và trả bài." } } }, "Thật thà, có thể bị trả bài", { tier: "awakened" })], 0), adult),
  beat(SC, 2, 3, (c) => T("Tiền của một tập đoàn", `${f(c, "sci_abroad") ? "Bạn đang làm hậu tiến sĩ ở nước ngoài thì" : "Bài báo của bạn được trích dẫn nhiều đến mức"} một tập đoàn hóa chất đề nghị tài trợ phòng thí nghiệm năm năm, gấp ba kinh phí hiện có. Điều kiện nằm ở trang mười bốn: họ được đọc mọi kết quả trước khi công bố, và có quyền "đề nghị hoãn".`, [
    C("Ký, nhận phòng thí nghiệm đầy đủ", { counters: step(c, SC, { sci_pubs: 2 }), income_mult: 1.4, flags: ["sci_corp_funded"] }, "Máy móc tốt, mất quyền công bố"),
    C("Từ chối, nộp hồ sơ xin quỹ công", { counters: step(c, SC), gamble: { p: 0.4, win: { income_mult: 1.1, flags: ["sci_public_grant"], log: "Hồ sơ đỗ. Kinh phí bằng một phần ba, nhưng không ai đọc trước bài của bạn." }, lose: { bw: -5, income_mult: 0.9, log: "Hồ sơ trượt. Bạn chia ca máy với ba nhóm khác." } } }, "Sạch, nghèo, chậm"),
    C("Ký, nhưng gạch trang mười bốn đi", { counters: step(c, SC), gamble: { p: 0.35, win: { income_mult: 1.3, flags: ["sci_corp_funded", "sci_free_publish"], log: "Họ ký. Điều khoản của bạn thành mẫu hợp đồng cho cả viện." }, lose: { log: "Họ chuyển khoản tiền sang một nhóm dễ tính hơn." } } }, "Lựa chọn thứ ba", { tier: "sovereign" })], 0), adult),
  beat(SC, 3, 4, (c, N) => {
    if (f(c, "sci_corp_funded") && !f(c, "sci_free_publish")) return T("Kết quả không ai muốn", "Dữ liệu ba năm cho thấy một chất phụ gia của chính nhà tài trợ làm hỏng gan chuột thí nghiệm ở liều mà người dùng vẫn gặp. Đại diện tập đoàn mời bạn ăn tối và đề nghị \"kiểm tra thêm hai năm\" trước khi công bố. Hợp đồng gia hạn nằm sẵn trên bàn.", [
      C("Hoãn công bố, ký gia hạn", { counters: step(c, SC), income_mult: 1.3, money: 0.3, flags: ["sci_buried"] }, "Phòng thí nghiệm sống, số liệu nằm trong ngăn kéo"),
      C("Công bố, mất nhà tài trợ", { counters: step(c, SC, { sci_integrity: 2, sci_pubs: 1 }), income_mult: 0.7, agency: 0.03, flags: ["sci_whistle"] }, "Đúng, nhưng nghèo đi"),
      C("Gửi số liệu cho cơ quan quản lý, giữ hợp đồng", { counters: step(c, SC, { sci_integrity: 1 }), gamble: { p: 0.5, win: { flags: ["sci_quiet_report"], log: "Cơ quan quản lý hạ ngưỡng cho phép. Tập đoàn không biết ai gửi." }, lose: { income_mult: 0.7, flags: ["sci_whistle"], log: "Tập đoàn biết ai gửi. Hợp đồng chấm dứt trong tuần." } } }, "Lách giữa hai đường, có thể bị lộ", { tier: "awakened" }),
      C("Nghỉ viện, không dính vào nữa", { counters: step(c, SC), ...leave(SC), happy: -2, flags: ["ex_scientist"] }, "Thoát chuyện này, bỏ nghề")], 0);
    if (f(c, "sci_trimmed")) return T("Bài báo đầu tay bị soi lại", "Một nghiên cứu sinh ở nơi khác làm lại thí nghiệm đầu tay của bạn mười lần, không lần nào ra như bài báo. Trên một diễn đàn khoa học, người ta đã tìm ra chỗ thiếu một điểm số liệu. Hộp thư của bạn có ba mươi email chưa đọc.", [
      C("Rút bài, xin lỗi công khai", { counters: step(c, SC, { sci_integrity: 2 }), custom: "apologize", income_mult: 0.85, flags: ["sci_retracted"] }, "Mất mặt bây giờ, giữ tên về sau"),
      C("Im lặng chờ sóng qua", { counters: step(c, SC), gamble: { p: 0.45, win: { log: "Sau ba tháng, diễn đàn chuyển sang chuyện khác." }, lose: { income_mult: 0.6, flags: ["sci_disgraced"], log: "Tạp chí tự rút bài và đăng thông báo có tên bạn." } } }, "Có thể qua, có thể mất hết"),
      C("Mời người phát hiện cùng làm lại thí nghiệm", { counters: step(c, SC, { sci_integrity: 1 }), gamble: { p: 0.5, win: { know: 5, flags: ["sci_retracted", "sci_coauthor_critic"], log: "Bài sửa sai do hai người cùng ký được trích dẫn nhiều hơn bài gốc." }, lose: { custom: "apologize", income_mult: 0.8, flags: ["sci_retracted"], log: "Cậu ấy từ chối, và đăng toàn bộ thư từ lên mạng." } } }, "Biến người tố mình thành đồng tác giả", { tier: "sovereign" }),
      C("Bỏ nghiên cứu, đi dạy phổ thông", { counters: step(c, SC), ...leave(SC), happy: -3, flags: ["ex_scientist"] }, "Thoát khỏi bão, bỏ nghề")], 0);
    const m = role(c, "mentor") ?? role(c, "first_boss");
    if (m) return T("Ai đứng tên đầu", `Ý tưởng là của bạn, số liệu do bạn đo suốt hai năm. Bản thảo ${N(m)} gửi đi có tên ${N(m)} đứng đầu, tên bạn đứng thứ năm, sau cả hai người chưa từng vào phòng thí nghiệm.`, [
      C("Gửi đơn lên hội đồng đạo đức", { counters: step(c, SC, { sci_integrity: 1 }), memory: { npc: m, tag: "HUMILIATED_ME", weight: -0.3, note: "bị học trò tố lên hội đồng đạo đức" }, gamble: { p: 0.4, win: { flags: ["sci_credit_won"], counters: { sci_pubs: 1 }, log: "Hội đồng sửa thứ tự tên. Bạn đứng đầu." }, lose: { income_mult: 0.8, log: "Hội đồng kết luận \"đóng góp ngang nhau\". Nhóm không còn chỗ cho bạn." } } }, "Đòi lại công, mất người đỡ đầu"),
      C("Nuốt xuống, giữ chỗ trong nhóm", { counters: step(c, SC), income_mult: 1.1, trust: { npc: m, delta: 0.1 }, flags: ["sci_swallowed"], happy: -4 }, "Yên ổn, một lần nhịn là nhiều lần nhịn"),
      C("Công khai sổ thí nghiệm có ngày giờ của mình", { counters: step(c, SC, { sci_integrity: 1 }), trust: { npc: m, delta: -0.2 }, flags: ["sci_credit_won", "public_fight"], agency: 0.02 }, "Bằng chứng nói thay, cả viện biết chuyện", { tier: "awakened" }),
      C("Bỏ nghề, chán cảnh tranh công", { counters: step(c, SC), ...leave(SC), flags: ["ex_scientist"] }, "Hết bị lấy công, hết làm khoa học")], 0, { npc: m });
    return T("Bị vượt mặt trong cuộc đua", "Một phòng thí nghiệm lớn ở nước khác vừa công bố đúng kết quả bạn đang viết dở. Bạn từng trình bày ý tưởng ấy ở hội thảo năm ngoái, và người đứng đầu nhóm đó ngồi hàng ghế đầu.", [
      C("Viết thư công khai, kèm ảnh slide năm ngoái", { counters: step(c, SC), flags: ["public_fight"], gamble: { p: 0.4, win: { counters: { sci_pubs: 1 }, log: "Tạp chí đăng thêm một dòng ghi nhận ý tưởng của bạn." }, lose: { happy: -4, log: "Người ta bảo bạn ghen tị." } } }, "Có thể đòi được công, có thể mang tiếng"),
      C("Gửi bài của mình, nhấn vào phần khác biệt", { counters: step(c, SC, { sci_pubs: 1 }), bw: -4 }, "Thua cuộc đua, vẫn có bài"),
      C("Bỏ nghề, chán cảnh chạy đua", { counters: step(c, SC), ...leave(SC), flags: ["ex_scientist"] }, "Thoát cuộc đua, mất nghề")], 1);
  }, adult),
  beat(SC, 4, 5, (c) => {
    const score = (c.counters.sci_pubs ?? 0) + (c.counters.sci_integrity ?? 0);
    if (f(c, "sci_disgraced")) return T("Không tạp chí nào nhận bài", "Hai năm sau vụ rút bài, hồ sơ xin quỹ nào có tên bạn cũng trượt. Phòng thí nghiệm bị giao cho người khác, bạn được xếp một bàn cạnh kho hóa chất. Một trường cao đẳng ở tỉnh xa cần người dạy hóa.", [
      C("Về trường tỉnh, bắt đầu lại từ đầu", { counters: step(c, SC), income_mult: 0.7, flags: ["sci_redemption"], happy: 2 }, "Nghèo đi, được làm lại"),
      C("Viết công khai về những gì mình đã làm sai", { counters: step(c, SC, { sci_integrity: 2 }), custom: "apologize", agency: 0.03, flags: ["sci_confessed"], rel: 3 }, "Mất nốt thể diện, có thể cứu người sau", { tier: "sovereign" }),
      C("Bỏ nghề hẳn", { counters: step(c, SC), ...leave(SC), flags: ["ex_scientist"] }, "Hết bị soi, hết nghề")], 0);
    if (f(c, "sci_buried")) return T("Người ta bắt đầu ốm", "Báo chí đưa tin hàng loạt người dùng sản phẩm có chất phụ gia ấy phải vào viện vì gan. Một nhà báo gọi cho bạn lúc mười giờ đêm: có nguồn nói phòng thí nghiệm của bạn đã biết từ bốn năm trước.", [
      C("Nói thật, giao toàn bộ số liệu", { counters: step(c, SC, { sci_integrity: 1 }), income_mult: 0.6, custom: "apologize", flags: ["sci_whistle_late"], rel: -2 }, "Muộn còn hơn không, mất hết tài trợ"),
      C("Phủ nhận, viện dẫn hợp đồng bảo mật", { counters: step(c, SC), money: 0.2, happy: -5, secret: { tag: "FORGED_PAPERS", severity: 0.7, fuse_years: [1, 6], note: "giấu kết quả độc tính cho nhà tài trợ" } }, "Yên lúc này, một quả bom hẹn giờ"),
      C("Ra làm chứng cho các gia đình người bệnh", { counters: step(c, SC, { sci_integrity: 2 }), income_mult: 0.5, agency: 0.04, rel: 5, flags: ["sci_witness"], close_doors: ["partner_circle"] }, "Mất mọi đối tác, đứng về phía người bệnh", { tier: "sovereign" })], 0);
    if (f(c, "sci_abroad")) return T("Lời mời về nước", `Kết quả của bạn ${score >= 4 ? "được trích dẫn khắp nơi, có tên trong danh sách đề cử một giải thưởng lớn" : "được nhắc đến ở vài hội nghị lớn"}. Một viện ở quê nhà mời bạn về làm viện trưởng, lương bằng một phần ba hiện tại, máy móc thua mười năm. Trường bên này đề nghị biên chế suốt đời.`, [
      C("Về nước, làm lại từ phòng máy cũ", { counters: step(c, SC), income_mult: 0.7, flags: ["sci_returned"], rel: 6, happy: 3 }, "Nghèo đi, gần nhà, gây dựng thế hệ sau"),
      C("Ở lại, nhận biên chế suốt đời", { counters: step(c, SC, { sci_pubs: 1 }), income_mult: 1.3, flags: ["sci_stayed_abroad"], rel: -3 }, "Đủ đầy, quê nhà xa dần"),
      C("Ở lại, nhận nghiên cứu sinh từ quê sang học", { counters: step(c, SC, { sci_students: 2 }), income_mult: 1.1, agency: 0.02, flags: ["sci_bridge"] }, "Không về, nhưng mở đường cho người khác", { tier: "sovereign" })], 1);
    return T("Ghế viện trưởng", `${score >= 4 ? "Mười năm làm nghề, tên bạn đứng trong danh sách đề cử một giải thưởng khoa học lớn." : "Hướng nghiên cứu ít ai để ý của bạn bỗng thành thời sự."} Người ta đề nghị bạn làm viện trưởng: xe đưa đón, ba cuộc họp mỗi ngày, không còn thời gian cầm ống nghiệm.${f(c, "sci_whistle") ? " Vài người ở cấp trên vẫn chưa quên vụ bạn công bố số liệu của nhà tài trợ." : ""}`, [
      C("Nhận ghế viện trưởng", { counters: step(c, SC), income_mult: 1.4, bw: -6, flags: ["sci_director"] }, "Quyền và lương, xa phòng thí nghiệm"),
      C("Từ chối, ở lại với phòng thí nghiệm", { counters: step(c, SC, { sci_pubs: 1 }), happy: 5, know: 4 }, "Được làm điều mình thích, ít quyền"),
      C("Nhận, với điều kiện công khai mọi khoản chi", { counters: step(c, SC), gamble: { p: 0.45, win: { income_mult: 1.3, agency: 0.03, flags: ["sci_director", "leader"], log: "Lần đầu tiên bảng chi tiêu của viện được dán ở sảnh. Hai trưởng phòng xin nghỉ." }, lose: { log: "Người ta chọn người khác. Bạn vẫn còn phòng thí nghiệm." } } }, "Đổi luật của viện, có thể mất ghế", { tier: "sovereign" })], 0);
  }, adult),
  beat(SC, 5, 6, (c) => {
    const hidden = f(c, "sci_trimmed") && !f(c, "sci_retracted");
    const text = `Thư viện quốc gia xin lưu trữ toàn bộ sổ thí nghiệm của bạn, ba mươi hai cuốn, từ cuốn đầu tiên.${hidden ? " Trong cuốn đầu có trang ghi điểm số liệu bạn đã bỏ đi năm ấy, nét bút vẫn còn rõ." : " Có những trang chỉ ghi một chữ: hỏng."}${(c.counters.sci_students ?? 0) >= 2 ? " Học trò cũ của bạn giờ đã có phòng thí nghiệm riêng." : ""}`;
    if (hidden) return T("Những cuốn sổ thí nghiệm", text, [
      C("Tặng nguyên vẹn, kèm một lá thư giải thích", { counters: step(c, SC, { sci_integrity: 2 }), custom: "apologize", rel: 3, flags: ["sci_legacy_honest"] }, "Tự lật lại vết cũ"),
      C("Xé trang ấy rồi mới tặng", { counters: step(c, SC), flags: ["sci_legacy"], secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 10], note: "xé trang sổ thí nghiệm trước khi lưu trữ" } }, "Giữ tên đẹp, thêm một bí mật"),
      C("Giữ lại, không tặng cuốn nào", { counters: step(c, SC), happy: -2 })], 0);
    return T("Những cuốn sổ thí nghiệm", text, [
      C("Tặng hết, kể cả những trang hỏng", { counters: step(c, SC), flags: ["sci_legacy"], rel: 3, happy: 3 }),
      C("Xin đặt tên kho lưu trữ theo người kỹ thuật viên cũ", { counters: step(c, SC), flags: ["sci_credit_shared"], rel: 5 }, "Nhường tên, trả công cho người đứng sau", { tier: "awakened" }),
      C("Giữ lại để viết hồi ký", { counters: step(c, SC), money: 0.1, flags: ["sci_memoir"] })], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SC, "sci_grant", [24, 65], 6, (c) => T("Mùa viết đề xuất", vary("scg", c.age, [`Hồ sơ xin quỹ dày hai trăm trang, tỷ lệ đỗ một phần tám.${c.econ_phase === "crisis" ? " Năm nay ngân sách bị cắt một nửa." : ""}`, "Lại đến hạn nộp đề xuất. Ba tuần nay bạn không chạm vào máy đo, chỉ viết, sửa, rồi viết lại phần \"tác động xã hội\"."]), [
    C("Viết một mình, thức trắng ba tuần", { health: -3, bw: -4, gamble: { p: 0.35, win: { money: 0.1, counters: { sci_pubs: 1 }, log: "Hồ sơ đỗ. Ba năm tới phòng thí nghiệm có tiền." }, lose: { happy: -3, log: "Hồ sơ trượt với lời nhận xét dài đúng hai dòng." } } }, "Mất sức, có thể đỗ"),
    C("Rủ ba nhóm khác viết chung một đề xuất lớn", { bw: -5, flags: ["sci_consortium"], gamble: { p: 0.45, win: { money: 0.15, counters: { sci_pubs: 1 }, log: "Bốn nhóm đỗ cùng nhau, chia một máy đo mới." }, lose: { log: "Bốn nhóm cãi nhau về thứ tự tên từ trước ngày nộp." } } }, "Cơ hội lớn hơn, phải chia công", { tier: "awakened" }),
    C("Bỏ một năm không xin, chỉ làm thí nghiệm", { money: -0.05, know: 4, counters: { sci_pubs: 1 } }, "Nghèo một năm, có kết quả thật")], 0)),
  daily(SC, "sci_order", [24, 65], 8, () => T("Thứ tự tên tác giả", "Trưởng khoa muốn thêm tên cháu mình vào bài báo của nhóm bạn. Cậu ấy chưa từng vào phòng thí nghiệm. Đổi lại, nhóm bạn được ưu tiên dùng máy đo mới.", [
    C("Thêm tên, đổi lấy giờ máy", { money: 0.02, know: 2, counters: { sci_integrity: -1, sci_pubs: 1 } }, "Có máy dùng, bài báo không còn sạch"),
    C("Từ chối thẳng", { counters: { sci_integrity: 1 }, bw: -3, flags: ["sci_dean_grudge"] }, "Giữ sạch, khoa nhớ mặt bạn"),
    C("Đề xuất quy tắc ghi công bằng văn bản cho cả khoa", { flags: ["leader"], agency: 0.02, gamble: { p: 0.4, win: { counters: { sci_integrity: 1 }, log: "Quy tắc được thông qua. Bài nào cũng phải ghi rõ ai làm phần nào." }, lose: { flags: ["sci_dean_grudge"], log: "Cuộc họp khoa kết thúc mà không ai giơ tay." } } }, "Đổi luật thay vì cãi từng vụ", { tier: "sovereign" })], 1)),
  daily(SC, "sci_journal", [24, 60], 7, (c) => T("Thư mời đăng bài", vary("scj", c.age, ["Một tạp chí bạn chưa nghe tên gửi thư mời: đăng bài trong hai tuần, phí bằng một tháng lương, được tính điểm xét thăng chức.", "Đồng nghiệp chỉ cho bạn một tạp chí \"đăng nhanh\": ba bài một năm là đủ chỉ tiêu, không ai đọc kỹ."]), [
    C("Trả phí, đăng cho đủ điểm", { money: -0.08, counters: { sci_pubs: 1, sci_integrity: -1 }, flags: ["sci_paid_journal"] }, "Đủ chỉ tiêu, tên bạn nằm cạnh bài kém"),
    C("Bỏ qua, chờ tạp chí tử tế", { counters: { sci_integrity: 1 }, happy: -1 }, "Thăng chức chậm hơn"),
    C("Lập danh sách tạp chí đáng ngờ cho cả viện", { flags: ["sci_blacklist"], rel: -1, agency: 0.01 }, "Có ích cho người sau, mất lòng vài đồng nghiệp", { tier: "awakened" })], 1)),
  daily(SC, "sci_machine", [24, 65], 8, (c) => T("Máy đo hỏng giữa mùa", `Chiếc máy đo quang phổ duy nhất của ${c.poor_country ? "cả viện" : "nhóm"} hỏng đúng tuần cần chạy mẫu. Hãng báo sửa mất bốn tháng, còn mẫu chỉ giữ được sáu tuần trong tủ lạnh.`, [
    C("Lấy tạm tiền đề tài khác để sửa gấp", { money: -0.03, flags: ["sci_fund_shuffle"], gamble: { p: 0.7, win: { counters: { sci_pubs: 1 }, log: "Máy chạy lại sau mười ngày. Kế toán chưa hỏi gì." }, lose: { bw: -6, log: "Kiểm toán hỏi đúng khoản đó. Bạn mất cả tháng giải trình." } } }, "Cứu mẫu, rắc rối giấy tờ"),
    C("Chờ bốn tháng, làm lại mẫu", { happy: -3, bw: 2, counters: { sci_integrity: 1 } }, "Đúng quy trình, mất nửa năm"),
    C("Tự tháo máy, sửa theo sách hướng dẫn", { gamble: { p: 0.45, win: { know: 6, flags: ["sci_fixer"], log: "Máy chạy. Từ đó cả viện gọi bạn mỗi khi có máy hỏng." }, lose: { money: -0.1, log: "Bạn làm hỏng thêm một bo mạch. Phí sửa tăng gấp đôi." } } }, "Có thể cứu cả mùa, có thể hỏng thêm")], 1)),
  daily(SC, "sci_conf", [26, 65], 7, (c) => T("Hội nghị bên kia đại dương", vary("scc", c.age, ["Bài của bạn được chọn trình bày ở một hội nghị quốc tế. Viện không có tiền vé máy bay, thị thực mất hai tháng.", "Bạn được mời làm diễn giả chính tại một hội nghị lớn. Tuần đó trùng đúng kỳ chấm thi của khoa."]), [
    C("Tự bỏ tiền đi", { money: -0.08, know: 4, counters: { sci_pubs: 1 } }, "Tốn một khoản lớn, thêm người biết đến"),
    C("Cử nghiên cứu sinh đi thay", { counters: { sci_students: 1 }, happy: -1 }, "Học trò lớn lên, bạn đứng ngoài"),
    C("Xin trình bày qua mạng", { bw: -1, gamble: { p: 0.5, win: { counters: { sci_pubs: 1 }, log: "Hội nghị đồng ý. Hai trăm người xem trực tuyến." }, lose: { happy: -1, log: "Đường truyền rớt giữa phần trả lời câu hỏi." } } })], 0)),
  daily(SC, "sci_tv", [26, 70], 8, (c) => T("Mười giây trên truyền hình", vary("sct", c.age, ["Một kênh truyền hình phỏng vấn bạn về kết quả mới. Biên tập viên muốn bạn nói một câu: \"Đây là bước đột phá chữa được bệnh.\" Thực tế, mới thử trên tế bào.", "Một trang tin lớn giật tít nghiên cứu của bạn thành \"thần dược\". Phóng viên gọi xin bạn xác nhận."]), [
    C("Nói câu họ muốn", { counters: { sci_pubs: 1, sci_integrity: -1 }, happy: 2, money: 0.03 }, "Nổi tiếng, đồng nghiệp nhìn khác đi"),
    C("Nói đủ các điều kiện, chấp nhận bị cắt", { counters: { sci_integrity: 1 } }, "Đúng, nhưng không ai xem"),
    C("Tự viết bài giải thích, mời độc giả hỏi", { bw: -3, gamble: { p: 0.5, win: { rel: 3, counters: { sci_pubs: 1 }, log: "Bài viết được chia sẻ nhiều hơn cả bản tin." }, lose: { log: "Bài viết có mười lượt đọc, chín là đồng nghiệp." } } }, "Tốn công, có thể chạm tới người đọc", { tier: "awakened" })], 1)),
  daily(SC, "sci_student", [28, 70], 8, () => T("Nghiên cứu sinh muốn bỏ dở", "Nghiên cứu sinh giỏi nhất nhóm xin bỏ dở năm thứ ba: nhà cậu ấy nợ tiền, một công ty trả lương gấp bốn học bổng. Luận án còn tám tháng là xong.", [
    C("Cắt một phần thu nhập của mình bù cho cậu ấy", { money: -0.08, counters: { sci_students: 1 }, flags: ["sci_kind_mentor"] }, "Mất tiền, giữ được người"),
    C("Để cậu ấy đi, chúc may mắn", { happy: -2, counters: { sci_pubs: -1 } }, "Không tốn gì, nhóm mất người giỏi"),
    C("Tìm việc bán thời gian, giữ cậu ấy viết tiếp", { bw: -3, gamble: { p: 0.6, win: { counters: { sci_students: 1 }, log: "Cậu ấy bảo vệ luận án, bên trong áo vest vẫn là áo đồng phục công ty." }, lose: { log: "Công ty giữ cậu ấy đến mười giờ đêm. Luận án dừng ở chương bốn." } } }, "Tốn công chạy vạy, có thể vẹn cả đôi", { tier: "awakened" })], 0)),
  daily(SC, "sci_rival", [26, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Nhóm đối thủ xin số liệu", `${N(r)} đứng đầu một nhóm cùng hướng nghiên cứu và vừa xin bạn số liệu gốc để "đối chiếu chéo". Hai nhóm đều đang chạy đua để công bố trước.`, [
    C("Gửi số liệu", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia số liệu gốc giữa cuộc đua" }, counters: { sci_pubs: 1 }, log: "Hai nhóm viết chung một bài, mạnh hơn cả hai bài riêng." }, lose: { happy: -5, log: `${N(r)} công bố trước, dùng số liệu của bạn làm "đối chứng".` } } }, "Có thể thành đồng minh, có thể bị lợi dụng"),
    C("Từ chối lịch sự", { trust: { npc: r, delta: -0.1 } }),
    C("Đăng bản thảo lên mạng ngay đêm nay", { bw: -5, counters: { sci_pubs: 1 }, flags: ["sci_preprint"] }, "Giữ quyền đi trước, bài chưa chín")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(SC, "sci_review", [28, 70], 9, () => T("Bản thảo trên bàn bình duyệt", "Một tạp chí nhờ bạn bình duyệt một bản thảo. Đọc đến trang ba, bạn nhận ra đó chính là kết quả nhóm bạn sắp gửi, chỉ là của người khác, và tốt hơn một chút.", [
    C("Giữ bản thảo thêm hai tháng, gửi bài mình trước", { counters: { sci_pubs: 1, sci_integrity: -2 }, flags: ["sci_slow_review"], happy: 2 }, "Thắng cuộc đua bằng cách không sạch"),
    C("Bình duyệt công bằng, đúng hạn", { counters: { sci_integrity: 1 }, happy: -2 }, "Đúng, và thua cuộc đua"),
    C("Báo xung đột lợi ích, trả lại bản thảo", { counters: { sci_integrity: 1 }, flags: ["sci_declared"] }, "Sạch sẽ, không biết ai sẽ chấm thay", { tier: "awakened" })], 1)),
  daily(SC, "sci_offer", [28, 60], 99, (c) => T("Lời mời từ ngành công nghiệp", `Một công ty dược mời bạn về làm trưởng nhóm, lương gấp ba lương viện${c.kids_alive > 0 ? ", đủ cho con học trường tốt" : ""}. Bạn sẽ nghiên cứu thứ họ cần bán, không phải thứ bạn tò mò.`, [
    C("Nhận, rời viện", { ...leave(SC), money: 0.3, flags: ["sci_to_industry"] }, "Đủ đầy, mất quyền tò mò"),
    C("Ở lại viện", { happy: 1, counters: { sci_integrity: 1 } }),
    C("Làm cố vấn cho họ mỗi tháng hai ngày", { money: 0.08, bw: -3, flags: ["sci_consultant"] }, "Thêm tiền, thêm câu hỏi về xung đột lợi ích")], 1), (c) => c.broke || c.happy < 50 || c.kids_alive > 1),

  /* ---------- gia đình ---------- */
  cross(SC, "sci_family", [28, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} chọn ngành`, `${N(k)} nói sẽ học kinh tế, vì "làm khoa học thì nghèo cả đời". Vậy mà tối qua ${N(k)} vẫn ngồi xem bạn soi kính hiển vi đến khuya.`, [
      C("Tôn trọng lựa chọn của con", { trust: { npc: k, delta: 0.2 }, happy: -1 }),
      C("Cãi lại, kể về những thứ đáng giá hơn tiền", { trust: { npc: k, delta: -0.1 }, rel: -1 }, "Nói điều mình tin, con có thể khép lại"),
      C("Đưa con vào phòng thí nghiệm một ngày", { bw: -2, gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} xin quay lại vào kỳ nghỉ hè.` }, lose: { trust: { npc: k, delta: 0.05 }, log: `${N(k)} ngáp suốt buổi, nhưng chụp ảnh chiếc kính hiển vi gửi bạn bè.` } } }, "Cho con tự thấy, không ép", { tier: "awakened" })], 2, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Thuốc thần trên mạng", `${N(p)} gửi cho bạn một video quảng cáo thuốc "chữa khỏi tiểu đường trong ba tháng", kèm lời nhắn: con là nhà khoa học, mua giúp hai hộp.`, [
      C("Mua cho yên chuyện", { money: -0.04, trust: { npc: p, delta: 0.1 } }, "Mất tiền, giữ hòa khí"),
      C("Giải thích vì sao đó là lừa đảo", { gamble: { p: 0.4, win: { trust: { npc: p, delta: 0.2 }, log: `${N(p)} nghe hết, rồi tự chặn kênh quảng cáo đó.` }, lose: { trust: { npc: p, delta: -0.15 }, log: `${N(p)} bảo bạn học nhiều quá nên coi thường người già.` } } }, "Đúng, có thể làm người thân tự ái"),
      C("Đưa đi khám bác sĩ thật, ngồi chờ cùng", { money: -0.05, bw: -3, trust: { npc: p, delta: 0.25 } }, "Tốn một ngày, chữa đúng bệnh", { tier: "awakened" })], 2, { npc: p });
  }),

  /* ================================================================ NHÀ SÁNG CHẾ ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(IV, "ivn_t_radio", [8, 14], () => true, (c) => T("Chiếc radio tháo tung", `Bạn tháo chiếc radio của nhà ra giữa chiếu để tìm xem tiếng người nói nằm ở đâu. Lắp lại thì thừa ba con ốc, nhưng radio bắt được thêm hai đài.${f(c, "tinker") ? " Đây không phải lần đầu bạn tháo đồ trong nhà." : ""}`, [
    C("Xin giữ hộp linh kiện cũ để mày mò tiếp", { flags: [talentFlag(IV)], counters: { talents_seen: 1 }, know: 3, money: -0.01 }, "Nhà thêm bừa bộn, bạn thêm một đam mê"),
    C("Sửa radio miễn phí cho hàng xóm", { counters: { talents_seen: 1 }, gamble: { p: 0.5, win: { flags: [talentFlag(IV)], rel: 2, log: "Cả xóm mang đồ hỏng đến nhà bạn. Bố mẹ phải kê thêm một cái bàn." }, lose: { happy: -2, log: "Chiếc radio của bà hàng xóm không kêu nữa." } } }, "Có thể nổi tiếng trong xóm, có thể làm hỏng đồ"),
    C("Hứa không đụng vào đồ điện nữa", { counters: { talents_seen: 1 }, happy: -1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(IV, "ivn_d_fair", [14, 19], () => true, (c) => T("Cuộc thi sáng chế học sinh", `Trường bạn được gửi một sản phẩm đi thi sáng chế ${c.country === "VN" ? "cấp tỉnh" : "cấp vùng"}. Hệ thống tưới cây bằng chai nhựa của bạn chạy tốt, nhưng thầy phụ trách muốn đứng tên chung "cho hội đồng tin". Giải nhất là một suất học bổng và một người hướng dẫn.`, [
    C("Tự đứng tên, gửi đi thi", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(IV), flags: ["ivn_young_prize"], log: "Hệ thống tưới của bạn đoạt giải nhất. Một kỹ sư về hưu nhận kèm bạn." }, lose: { happy: -2, log: "Bạn được giải khuyến khích và một tấm bằng khen." } } }, "Ít cơ hội hơn, công là của mình"),
    C("Để thầy đứng tên chung", { counters: { doors_seen: 1 }, gamble: { p: 0.65, win: { ...become(IV), flags: ["ivn_shared_credit"], log: "Giải nhất. Báo địa phương đăng ảnh thầy cầm sản phẩm, tên bạn ở dòng thứ hai." }, lose: { happy: -3, log: "Vẫn trượt, và tên bạn đứng sau." } } }, "Dễ đoạt giải, mất phần công"),
    C("Không thi, tập trung ôn bài", { counters: { doors_seen: 1 }, know: 2 })], 0)),
  door(IV, "ivn_d_shed", [20, 55], (c) => f(c, "invention") || f(c, "tinkerer") || f(c, "tinker") || f(c, talentFlag(IV)), () => T("Cái máy trong nhà kho", "Ba năm nay tối nào bạn cũng ở trong nhà kho với một chiếc máy bóc vỏ hạt tự chế, tốn điện chỉ bằng nửa máy bán ngoài chợ. Ông hàng xóm làm nông đặt mua mười chiếc, trả trước một nửa.", [
    C("Nghỉ việc, làm sáng chế toàn thời gian", { ...become(IV), counters: { doors_seen: 1 }, money: -0.15, agency: 0.02 }, "Mất lương ổn định, được làm điều mình muốn"),
    C("Làm mười chiếc ngoài giờ, giữ việc", { counters: { doors_seen: 1 }, money: 0.06, bw: -4, flags: ["ivn_side_orders"] }, "Thêm tiền, thêm mệt"),
    C("Bán bản vẽ cho một xưởng cơ khí", { counters: { doors_seen: 1 }, money: 0.2, flags: ["ivn_sold_first"] }, "Tiền ngay, người khác làm giàu từ nó")], 0)),
  door(IV, "ivn_d_buyout", [25, 60], (c) => c.has_job, () => T("Gói nghỉ việc tự nguyện", "Nhà máy nơi bạn làm kỹ thuật viên mời nghỉ việc tự nguyện, trả sáu tháng lương. Đã nhiều năm bạn biết cách sửa chỗ kẹt của dây chuyền số ba, nhưng chưa ai hỏi.", [
    C("Nhận tiền, mở xưởng sáng chế", { ...become(IV), counters: { doors_seen: 1 }, money: 0.3, bw: -3 }, "Có vốn mồi, mất lương tháng"),
    C("Ở lại làm", { counters: { doors_seen: 1 }, happy: -1 }),
    C("Đề nghị sửa dây chuyền, ăn phần trăm tiết kiệm", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(IV), income_mult: 1.2, flags: ["ivn_royalty_deal"], log: "Giám đốc ký. Dây chuyền số ba chạy không kẹt suốt ba tháng." }, lose: { log: "Họ cảm ơn ý tưởng, rồi giao cho kỹ sư của hãng làm." } } }, "Đổi luật chơi với chủ cũ", { tier: "sovereign" })], 1)),

  /* ---------- mạch truyện ---------- */
  beat(IV, 1, 1, (c) => T("Bản mẫu chạy bảy lần trên mười", `Bản mẫu đầu tiên của bạn chạy được bảy lần trên mười. Tuần sau có hội chợ công nghệ ở thành phố, gian hàng nhỏ nhất giá bằng hai tháng tiền nhà.${f(c, "ivn_young_prize") ? " Người kỹ sư về hưu năm xưa vẫn gọi điện hỏi thăm." : ""}`, [
    C("Mang đi hội chợ dù chưa hoàn hảo", { counters: step(c, IV), money: -0.1, gamble: { p: 0.5, win: { flags: ["ivn_early_buyers"], money: 0.15, log: "Có ba đơn đặt hàng thử, một người để lại danh thiếp." }, lose: { happy: -4, log: "Máy kẹt ngay trước mặt khách. Có người quay lại đăng lên mạng." } } }, "Nhanh, có thể bẽ mặt"),
    C("Ở nhà sửa đến khi chạy mười trên mười", { counters: step(c, IV, { ivn_quality: 1 }), bw: -3, happy: -1 }, "Chậm, chắc"),
    C("Đăng bản vẽ lên mạng, xin góp ý", { counters: step(c, IV, { ivn_community: 1 }), flags: ["ivn_open"], know: 3 }, "Trăm người sửa giúp, ai cũng có thể chép", { tier: "awakened" })], 1), adult),
  beat(IV, 2, 3, (c) => T("Giá của một tấm bằng sáng chế", `${f(c, "ivn_open") ? "Bản vẽ của bạn đã nằm trên mạng hai năm, có người ở ba nước tự lắp theo." : "Máy của bạn bắt đầu có người đặt mua đều."} Luật sư sở hữu trí tuệ nói nộp đơn bảo hộ tốn gần nửa năm thu nhập, chờ ba năm. Không có bằng, ai cũng có thể làm theo.${f(c, "ivn_open") ? " Phần cải tiến mới vẫn còn kịp nộp." : ""}`, [
    C("Vay tiền nộp đơn", { counters: step(c, IV, { ivn_patents: 1 }), custom: "borrow:0.4", flags: ["ivn_patent"] }, "Mắc nợ, giữ được quyền"),
    C("Bỏ qua, làm nhanh bán nhanh", { counters: step(c, IV), money: 0.2, flags: ["ivn_no_patent"] }, "Tiền ngay, không gì che chắn"),
    C("Mở toàn bộ thiết kế, sống bằng lắp và sửa", { counters: step(c, IV, { ivn_community: 1 }), flags: ["ivn_open", "ivn_open_hardware"], income_mult: 1.1, agency: 0.02 }, "Không độc quyền, sống bằng uy tín", { tier: "sovereign" })], 0), adult),
  beat(IV, 3, 4, (c) => {
    const quit = C("Bỏ nghề, đi làm kỹ thuật viên lại", { counters: step(c, IV), ...leave(IV), flags: ["ex_inventor"] }, "Yên ổn, không còn sáng chế");
    if (f(c, "ivn_patent")) return T("Hàng nhái nửa giá", "Một công ty lớn tung ra chiếc máy giống máy của bạn đến từng con ốc, giá bằng một nửa, bày ở mọi siêu thị điện máy. Luật sư nói vụ kiện có thể kéo dài năm năm. Khoản vay nộp đơn bảo hộ vẫn chưa trả xong.", [
      C("Kiện đến cùng", { counters: step(c, IV), money: -0.3, gamble: { p: 0.4, win: { money: 1.2, income_mult: 1.3, flags: ["ivn_won_suit"], log: "Tòa xử bạn thắng. Công ty phải bồi thường và trả phí bản quyền từng chiếc." }, lose: { income_mult: 0.7, flags: ["ivn_lost_suit"], log: "Tòa cho rằng thiết kế của họ khác đủ để không vi phạm." } } }, "Có thể đổi đời, có thể trắng tay"),
      C("Bán bằng sáng chế cho chính họ", { counters: step(c, IV), money: 0.8, custom: "repay:0.4", flags: ["ivn_sold_patent"], happy: -4 }, "Tiền ngay, mất đứa con tinh thần"),
      C("Rủ những người cùng bị nhái, kiện chung", { counters: step(c, IV, { ivn_community: 1 }), bw: -5, gamble: { p: 0.55, win: { money: 0.6, flags: ["ivn_won_suit", "leader"], log: "Mười hai người cùng đứng đơn. Công ty chọn hòa giải với tất cả." }, lose: { money: -0.1, log: "Nhóm tan sau khi hai người nhận tiền riêng để rút đơn." } } }, "Không đơn độc, phải tin người khác", { tier: "sovereign" }),
      quit], 0);
    if (f(c, "ivn_open")) return T("Bản vẽ mở và một đám cháy", "Một người tự lắp máy theo bản vẽ bạn đăng, dùng dây điện rẻ tiền. Máy chập điện, cháy một gian bếp, may không ai bị thương. Một tờ báo đặt tít: \"Thiết kế trôi nổi trên mạng gây hỏa hoạn\".", [
      C("Đứng ra nhận, sửa bản vẽ, thêm cảnh báo", { counters: step(c, IV, { ivn_community: 1 }), money: -0.1, rel: 3, flags: ["ivn_safety_first"] }, "Mất tiền và thể diện, giữ cộng đồng"),
      C("Nói rõ người lắp đã làm sai", { counters: step(c, IV), flags: ["ivn_blamed_users"], rel: -2 }, "Đúng về kỹ thuật, mất lòng người dùng"),
      C("Lập bộ tiêu chuẩn an toàn chung cho đồ tự lắp", { counters: step(c, IV, { ivn_community: 2 }), bw: -6, agency: 0.03, flags: ["ivn_safety_first", "leader"] }, "Nhiều việc không lương, đổi luật cho cả cộng đồng", { tier: "sovereign" }),
      quit], 0);
    return T("Bị chép không cần xin phép", "Một xưởng ở khu công nghiệp làm ra chiếc máy y hệt máy của bạn, đổi màu sơn, bán rẻ hơn ba phần mười. Bạn không có giấy tờ gì để kiện. Khách quen bắt đầu hỏi sao máy bạn đắt thế.", [
      C("Hạ giá, đua với hàng nhái", { counters: step(c, IV), income_mult: 0.8, bw: -5 }, "Giữ khách, kiệt sức"),
      C("Bỏ món này, nghĩ ra món tiếp theo", { counters: step(c, IV, { ivn_quality: 1 }), flags: ["ivn_next_thing"], happy: -2, money: -0.1 }, "Mất một năm, có thể đi trước họ"),
      C("Gặp chủ xưởng, đề nghị hợp tác sản xuất", { counters: step(c, IV), gamble: { p: 0.45, win: { income_mult: 1.3, flags: ["ivn_partner_factory"], log: "Ông chủ xưởng cười, rồi đề nghị chia ba bảy. Bạn lo thiết kế, họ lo làm." }, lose: { happy: -3, log: "Ông ta bảo máy là của ai làm ra thì là của người đó." } } }, "Biến kẻ chép thành đối tác", { tier: "sovereign" }),
      quit], 0);
  }, adult),
  beat(IV, 4, 5, (c, N) => {
    if (f(c, "ivn_sold_patent")) return T("Chiếc máy của mình trên kệ", "Trong siêu thị điện máy, chiếc máy bạn nghĩ ra nằm ở kệ đầu, mang tên công ty đã mua bằng sáng chế. Họ bán được hàng trăm nghìn chiếc. Tuần trước họ mời bạn về làm kỹ sư trưởng, lương cao nhất đời bạn.", [
      C("Nhận, làm kỹ sư trưởng cho họ", { counters: step(c, IV), income_mult: 1.6, happy: -2, flags: ["ivn_corporate"] }, "Giàu lên, sáng chế mới là của họ"),
      C("Lấy tiền cũ dựng xưởng mới, làm thứ khác", { counters: step(c, IV, { ivn_patents: 1 }), money: -0.6, agency: 0.02, flags: ["ivn_workshop"] }, "Đặt cược lần nữa"),
      C("Đi dạy người trẻ cách giữ quyền sáng chế", { counters: step(c, IV), income_mult: 0.8, rel: 4, flags: ["ivn_teacher"] }, "Ít tiền, người sau đỡ thiệt", { tier: "awakened" })], 0);
    if (f(c, "ivn_lost_suit") || c.debt_ratio > 1.5 || (c.broke && !f(c, "ivn_won_suit"))) {
      const cr = role(c, "creditor");
      return T("Nợ đến hạn", `${f(c, "ivn_lost_suit") ? "Vụ kiện thua đã ăn hết tiền tiết kiệm." : "Đơn hàng chững lại hai năm liền."} ${cr ? N(cr) : "Ngân hàng"} gửi thông báo: khoản vay đến hạn trong chín mươi ngày, tài sản thế chấp là xưởng và toàn bộ máy móc.`, [
        C("Bán xưởng trả nợ, làm lại trong nhà kho", { counters: step(c, IV), custom: "repay:0.5", income_mult: 0.7, happy: -4, flags: ["ivn_lost_workshop"], ...(cr ? { memory: { npc: cr, tag: "KEPT_PROMISE" as const, weight: 0.2, note: "bán xưởng để trả nợ đúng hạn" } } : {}) }, "Sạch nợ, về vạch xuất phát"),
        C("Vay nóng chỗ khác để giữ xưởng", { counters: step(c, IV), custom: "borrow:0.6", gamble: { p: 0.35, win: { income_mult: 1.3, log: "Một đơn hàng lớn đến kịp. Bạn trả được cả hai khoản nợ." }, lose: { health: -5, happy: -6, log: "Đơn hàng không đến. Giờ bạn nợ hai nơi." } } }, "Giữ được xưởng, nợ chồng nợ"),
        C("Đề nghị chủ nợ đổi nợ lấy cổ phần xưởng", { counters: step(c, IV), gamble: { p: 0.4, win: { custom: "restructure", flags: ["ivn_debt_equity"], log: "Chủ nợ thành cổ đông. Từ đó họ hỏi doanh thu mỗi tuần." }, lose: { custom: "repay:0.5", income_mult: 0.7, log: "Họ chỉ muốn tiền. Xưởng bị niêm phong." } } }, "Giữ xưởng, chia quyền", { tier: "sovereign" }),
        C("Đóng xưởng, bỏ nghề", { counters: step(c, IV), ...leave(IV), custom: "job_lose|repay:0.3", flags: ["ex_inventor"] }, "Hết nợ một phần, hết nghề")], 0, npcOf(cr));
    }
    return T("Đơn hàng mười nghìn chiếc", `Một nhà phân phối nước ngoài muốn đặt mười nghìn chiếc, với điều kiện được độc quyền bán ở mọi nơi ngoài nước bạn trong mười năm.${(c.counters.ivn_patents ?? 0) >= 2 ? " Họ biết bạn có hai bằng sáng chế đứng tên." : ""}${(c.counters.ivn_community ?? 0) >= 2 ? " Cộng đồng người lắp máy theo thiết kế của bạn đã có mặt ở hai mươi nước." : ""}`, [
      C("Ký độc quyền mười năm", { counters: step(c, IV), income_mult: 1.8, flags: ["ivn_exclusive"] }, "Giàu nhanh, bị trói mười năm"),
      C("Chỉ ký cho một vùng, ba năm", { counters: step(c, IV), income_mult: 1.3 }, "Lãi vừa, còn tự do"),
      C("Lập hợp tác xã sản xuất với thợ trong vùng", { counters: step(c, IV, { ivn_community: 1 }), income_mult: 1.2, rel: 4, agency: 0.03, flags: ["ivn_coop"] }, "Ít lãi hơn, cả vùng có việc", { tier: "sovereign" })], 0);
  }, adult),
  beat(IV, 5, 6, (c) => {
    if (f(c, "ivn_patent") || f(c, "ivn_sold_patent")) return T("Bằng sáng chế hết hạn", `Hai mươi năm trôi qua, bằng sáng chế đầu tiên của bạn hết hạn. Từ tuần sau, ai cũng được làm chiếc máy ấy mà không phải hỏi ai.${f(c, "ivn_sold_patent") ? " Công ty mua nó năm xưa đã giàu lên từ đó, còn bạn thì không." : ""} Một trường nghề mời bạn đến nói chuyện.`, [
      C("Tặng toàn bộ bản vẽ gốc cho trường nghề", { counters: step(c, IV), rel: 5, flags: ["ivn_legacy_open"] }, "Không còn gì để bán, nhiều người học được"),
      C("Cải tiến, xin một bằng mới", { counters: step(c, IV, { ivn_patents: 1 }), money: -0.2, bw: -4 }, "Thêm mười năm độc quyền, thêm mười năm vất vả"),
      C("Giao xưởng cho người học việc, nghỉ hưu", { counters: step(c, IV), income_mult: 0.6, happy: 5, flags: ["ivn_handover"] }, "Ít tiền, được nghỉ")], 0);
    return T("Bản mẫu dưới gầm giường", `Bảo tàng khoa học xin bản mẫu đầu tiên của bạn, chiếc máy chạy bảy lần trên mười, vẫn nằm dưới gầm giường.${f(c, "ivn_young_prize") ? " Bên cạnh nó là tấm bằng giải nhất thời đi học." : ""} Một cậu thợ trẻ cũng hỏi mua nó để tháo ra học.`, [
      C("Tặng bảo tàng", { counters: step(c, IV), rel: 3, flags: ["ivn_museum"] }, "Được nhớ tên, chiếc máy nằm sau kính"),
      C("Bán cho cậu thợ trẻ với giá một bữa cơm", { counters: step(c, IV), happy: 4, flags: ["ivn_passed_on"] }, "Không ai nhớ, nhưng có người học"),
      C("Giữ lại, đó là của riêng mình", { counters: step(c, IV), happy: 1 })], 1);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(IV, "ivn_angel", [20, 60], 8, (c) => T("Nhà đầu tư thiên thần", vary("iva", c.age, ["Một nhà đầu tư nghe bạn trình bày mười phút, rồi đề nghị góp vốn bằng ba năm thu nhập của bạn, đổi lấy bốn phần mười công ty.", "Một quỹ đầu tư muốn rót vốn, kèm điều kiện có người của họ ngồi trong ban quyết định."]), [
    C("Nhận vốn, nhường quyền", { money: 0.5, income_mult: 1.2, flags: ["ivn_investor"] }, "Lớn nhanh, không còn tự quyết"),
    C("Từ chối, lớn bằng tiền của mình", { bw: -3, counters: { ivn_quality: 1 } }, "Chậm, giữ trọn"),
    C("Mặc cả: ít vốn hơn, giữ quyền quyết định", { gamble: { p: 0.4, win: { money: 0.3, flags: ["ivn_investor"], log: "Họ đồng ý hai phần mười. Bạn vẫn có phiếu quyết định." }, lose: { log: "Họ đi gặp nhóm tiếp theo trong danh sách." } } }, "Có thể được cả hai, có thể mất cả hai", { tier: "awakened" })], 1)),
  daily(IV, "ivn_hazard", [18, 70], 7, (c) => T("Chỗ nguy hiểm trong xưởng", vary("ivw", c.age, ["Ổ cắm chính trong xưởng nóng đến mức chảy nhựa. Đi lại dây đúng chuẩn tốn bằng hai tháng thu nhập và một tuần nghỉ làm.", "Bình khí nén cũ trong xưởng bắt đầu rò. Thay bình mới tốn tiền, mà đơn hàng đang gấp."]), [
    C("Dừng việc, sửa cho đúng chuẩn", { money: -0.15, flags: ["ivn_safe_shop"] }, "Mất tiền, ngủ yên"),
    C("Chằng tạm, làm cho xong đơn", { money: 0.05, gamble: { p: 0.75, win: { log: "Đơn hàng xong. Chỗ hỏng vẫn còn đó." }, lose: { health: -8, money: -0.3, flags: ["ivn_shop_fire"], log: "Một đêm, xưởng bốc khói. Bạn dập kịp, nhưng mất nửa số máy." } } }, "Kịp đơn, đặt cược cả xưởng")], 0)),
  daily(IV, "ivn_hundred", [18, 70], 8, (c) => T("Lần hỏng thứ một trăm", vary("ivh", c.age, ["Bản thử thứ một trăm lại hỏng đúng ở chỗ cũ. Sổ tay của bạn đã kín ba cuốn sơ đồ gạch xóa.", "Sáu tháng chưa có thứ gì chạy được. Tiền tiết kiệm còn đủ bốn tháng."]), [
    C("Làm tiếp bản thứ một trăm lẻ một", { bw: -4, counters: { ivn_quality: 1 }, gamble: { p: 0.35, win: { know: 5, happy: 6, log: "Bản thứ một trăm lẻ một chạy. Bạn ngồi nhìn nó suốt một giờ." }, lose: { happy: -3, log: "Nó lại hỏng, lần này ở chỗ khác. Ít nhất là chỗ mới." } } }, "Kiệt sức, có thể là lần cuối cùng hỏng"),
    C("Đổi hướng, dùng phần đã chạy cho việc khác", { flags: ["ivn_pivot"], money: 0.05 }, "Có tiền, bỏ dở giấc mơ"),
    C("Nghỉ một tuần, đi đâu đó không có máy móc", { happy: 4, bw: 5 }, "Hồi sức, chậm thêm một tuần")], 0)),
  daily(IV, "ivn_crowd", [20, 60], 9, () => T("Tám trăm người đã trả tiền trước", "Chiến dịch gọi vốn cộng đồng của bạn thu gấp ba mục tiêu: tám trăm người đặt trước. Sáu tháng sau, nhà máy gia công báo giá linh kiện tăng gấp đôi. Số tiền còn lại chỉ đủ làm năm trăm chiếc.", [
    C("Hoàn tiền cho ba trăm người cuối", { money: -0.2, rel: 2, counters: { ivn_community: 1 } }, "Mất tiền, giữ lời"),
    C("Im lặng, giao trễ cho tất cả", { gamble: { p: 0.5, win: { log: "Một năm sau, chiếc cuối cùng được giao. Phần lớn khách đã nguôi giận." }, lose: { rel: -4, flags: ["public_fight"], log: "Người đặt trước lập nhóm đòi tiền, ảnh của bạn được đăng khắp nơi." } } }, "Không mất tiền, có thể mất tiếng"),
    C("Viết thư thật cho cả tám trăm người, hỏi họ chọn", { bw: -3, counters: { ivn_community: 2 }, flags: ["ivn_honest_update"] }, "Mệt, nhưng họ thành người cùng đi", { tier: "awakened" })], 2)),
  daily(IV, "ivn_ngo", [22, 70], 9, () => T("Phiên bản cho vùng nghèo", "Một tổ chức phi lợi nhuận muốn đặt hai nghìn chiếc máy cho nông dân vùng hạn, với điều kiện bạn bỏ bớt linh kiện để giá chỉ còn một phần ba. Lãi gần như bằng không.", [
    C("Nhận, thiết kế lại cho rẻ", { bw: -5, rel: 4, counters: { ivn_community: 1 }, flags: ["ivn_frugal"] }, "Không lãi, máy đến tay người cần"),
    C("Từ chối, giữ giá", { money: 0.03 }, "Giữ lãi, bỏ lỡ hai nghìn khách"),
    C("Mở bản thiết kế giá rẻ cho thợ địa phương tự làm", { flags: ["ivn_open"], counters: { ivn_community: 2 }, income_mult: 0.95 }, "Mất đơn hàng, cả vùng biết làm máy", { tier: "sovereign" })], 0)),
  daily(IV, "ivn_friend", [20, 65], 9, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Bạn cũ mượn bản vẽ", `${N(fr)} mở một xưởng cơ khí nhỏ và xin mượn bản vẽ chiếc máy của bạn "để học hỏi". Hai người chơi với nhau từ năm lên bảy.`, [
    C("Cho mượn, tin bạn cũ", { gamble: { p: 0.5, win: { memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "cho mượn bản vẽ máy khi xưởng mới mở" }, log: `${N(fr)} sửa được một lỗi bạn chưa thấy, rồi gửi lại bản vẽ.` }, lose: { happy: -5, log: `Nửa năm sau, xưởng của ${N(fr)} bán máy giống hệt máy bạn.` } } }, "Giữ tình bạn, có thể mất món nghề"),
    C("Từ chối", { trust: { npc: fr, delta: -0.15 } }, "Giữ nghề, sứt mẻ tình bạn"),
    C("Cho mượn, kèm giấy thỏa thuận chia phần", { gamble: { p: 0.6, win: { memory: { npc: fr, tag: "WIN_WIN_DEAL", weight: 0.3, note: "ký giấy chia phần khi mượn bản vẽ" }, money: 0.1, log: "Hai xưởng cùng làm, mỗi chiếc bán ra bạn được một phần." }, lose: { trust: { npc: fr, delta: -0.1 }, log: `${N(fr)} phật ý: bạn bè mà cũng phải ký giấy.` } } }, "Rõ ràng, có thể làm bạn phật lòng", { tier: "awakened" })], 2, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(IV, "ivn_permit", [20, 65], 9, (c, N) => { const o = role(c, "official")!; return T("Giấy chứng nhận an toàn", `Máy của bạn cần giấy chứng nhận an toàn trước khi bán rộng. Hồ sơ nằm trên bàn ${N(o)} đã bốn tháng. Một người quen nói nếu "gửi chút quà" thì tuần sau có dấu.`, [
    C("Gửi quà cho nhanh", { money: -0.1, income_mult: 1.1, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 10], note: "lót tay để lấy giấy chứng nhận máy" } }, "Có giấy ngay, mang theo một bí mật"),
    C("Chờ đúng quy trình", { bw: -3, income_mult: 0.95, counters: { honest: 1 } }, "Sạch, mất mùa bán hàng"),
    C("Gửi văn bản hỏi tiến độ, dẫn thời hạn luật định", { agency: 0.02, gamble: { p: 0.45, win: { log: "Hai tuần sau giấy được cấp, kèm một lời xin lỗi in sẵn." }, lose: { memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.2, note: "bị đòi tiến độ bằng văn bản" }, log: "Hồ sơ bị trả lại vì thiếu một bản sao." } } }, "Dùng chính luật để đòi quyền", { tier: "sovereign" })], 1, { npc: o }); }, (c) => !!role(c, "official")),
  daily(IV, "ivn_apprentice", [25, 75], 9, (c) => T("Người muốn học nghề", vary("ivp", c.age, ["Một đứa trẻ trong xóm ngày nào cũng đứng ngoài cửa xưởng xem bạn làm. Hôm nay nó mang theo một chiếc quạt hỏng, hỏi bạn có dạy nó sửa không.", "Một thanh niên bỏ học nghề xin vào xưởng làm không lương, chỉ để học."]), [
    C("Nhận dạy, mỗi chiều một giờ", { bw: -3, rel: 3, flags: ["ivn_apprentice"] }, "Mất thời gian, có người nối nghề"),
    C("Bảo về đi, xưởng không phải trường học", { happy: -1 }, "Giữ giờ làm, mất một người học trò")], 0)),
  daily(IV, "ivn_troll", [22, 65], 9, () => T("Thư đòi phí bản quyền", "Một công ty không sản xuất thứ gì gửi thư nói máy của bạn vi phạm một bằng sáng chế mơ hồ họ mua lại từ lâu. Họ đề nghị \"dàn xếp\" bằng một khoản tương đương nửa năm thu nhập.", [
    C("Trả cho xong", { money: -0.5, flags: ["ivn_paid_troll"] }, "Mất tiền, hết phiền"),
    C("Thuê luật sư, ra tòa", { money: -0.2, gamble: { p: 0.6, win: { flags: ["ivn_beat_troll"], log: "Tòa bác đơn. Bằng sáng chế của họ bị tuyên vô hiệu." }, lose: { money: -0.4, log: "Tòa xử họ thắng một phần. Bạn trả tiền và cả phí luật sư." } } }, "Tốn kém, có thể thắng"),
    C("Đăng nguyên lá thư lên mạng, gọi người cùng cảnh", { flags: ["public_fight"], gamble: { p: 0.5, win: { counters: { ivn_community: 1 }, log: "Ba mươi xưởng nhỏ cùng nhận thư y hệt. Công ty kia rút hết." }, lose: { money: -0.1, log: "Họ kiện thêm tội bôi nhọ." } } }, "Biến chuyện riêng thành chuyện chung", { tier: "sovereign" })], 1)),
  daily(IV, "ivn_rnd", [25, 60], 99, () => T("Phòng nghiên cứu của tập đoàn", "Một tập đoàn mời bạn về phòng nghiên cứu, lương ổn định gấp đôi những năm bạn kiếm khá nhất. Hợp đồng ghi: mọi thứ bạn nghĩ ra, kể cả ngoài giờ, thuộc về công ty.", [
    C("Ký, dẹp xưởng", { ...leave(IV), money: 0.2, flags: ["ivn_corporate"] }, "Lương đều, ý tưởng không còn là của mình"),
    C("Từ chối, giữ xưởng", { happy: 1, counters: { ivn_quality: 1 } }, "Tự do, bấp bênh"),
    C("Ký, nhưng gạch điều khoản ngoài giờ", { gamble: { p: 0.4, win: { ...leave(IV), money: 0.2, flags: ["ivn_corporate", "ivn_night_shed"], log: "Họ đồng ý. Tối về, bạn vẫn có nhà kho của mình." }, lose: { log: "Họ rút lời mời. Xưởng vẫn là của bạn, nợ cũng vậy." } } }, "Đòi cả lương lẫn tự do", { tier: "sovereign" })], 1), (c) => c.broke || c.happy < 50),

  /* ---------- gia đình ---------- */
  cross(IV, "ivn_home", [22, 70], (c) => !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const s = role(c, "spouse");
    if (s) return T("Gian bếp thành xưởng", `Bàn ăn nhà bạn giờ là bàn hàn, tủ lạnh có một ngăn để linh kiện. ${N(s)} ngồi tính: số tiền bạn đổ vào máy móc ba năm qua bằng ${c.kids_alive > 0 ? "học phí của con đến hết cấp ba" : "tiền đặt cọc một căn hộ nhỏ"}.`, [
      C("Thuê một chỗ riêng làm xưởng", { money: -0.1, trust: { npc: s, delta: 0.2 } }, "Tốn tiền thuê, giữ hòa khí"),
      C("Hứa: một năm nữa không ra tiền thì thôi", { trust: { npc: s, delta: 0.1 }, promise: { to: s, what: "bỏ sáng chế nếu một năm nữa chưa ra tiền", years: 1 } }, "Có thời hạn, phải giữ lời"),
      C(`Mời ${N(s)} cùng quản lý tiền xưởng`, { trust: { npc: s, delta: 0.15 }, bw: -2, flags: ["ivn_family_firm"] }, "Mất quyền tự quyết, thêm một người cùng gánh", { tier: "awakened" })], 2, { npc: s });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Bao giờ đi làm cho đàng hoàng", `${N(p)} kể với họ hàng rằng bạn "đang thất nghiệp". Lần nào bạn về nhà, ${N(p)} cũng hỏi bao giờ xin được việc ở một chỗ lớn cho đàng hoàng.`, [
      C("Mang chiếc máy về nhà, chạy cho xem", { gamble: { p: 0.55, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} không khen, nhưng hôm sau gọi hàng xóm sang xem.` }, lose: { trust: { npc: p, delta: -0.1 }, log: "Máy kẹt đúng lúc cả nhà đứng xem." } } }, "Có thể được hiểu, có thể bẽ mặt"),
      C("Thôi, mặc kệ", { happy: -2, trust: { npc: p, delta: -0.05 } })], 0, { npc: p });
  }),

  /* ================================================================ GIẢNG VIÊN ĐẠI HỌC ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(PF, "prf_t_tutor", [10, 16], () => true, () => T("Người giảng lại bài", "Trước kỳ thi, cả nhóm bạn trong lớp kéo đến nhà nhờ bạn giảng lại bài toán hôm qua. Bạn vẽ lên một tấm bìa các-tông, và lần đầu tiên cả nhóm hiểu. Bạn phát hiện mình thích khoảnh khắc người khác \"à\" lên.", [
    C("Mở nhóm học mỗi tối thứ năm", { flags: [talentFlag(PF)], counters: { talents_seen: 1 }, bw: -2, happy: 3 }, "Mất giờ tự học, tìm thấy điều mình thích"),
    C("Giảng lần này thôi, còn phải học cho mình", { counters: { talents_seen: 1 }, know: 2 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PF, "prf_d_keep", [24, 30], (c) => c.has_degree || f(c, "path_uni") || f(c, talentFlag(PF)), (c, N) => { const m = role(c, "mentor");
    return T("Lời mời ở lại khoa", `${m ? N(m) : "Thầy hướng dẫn"} muốn giữ bạn lại khoa làm giảng viên. Lương chưa bằng một phần ba chỗ một công ty đang mời, và trong năm năm phải có bằng tiến sĩ.${c.country === "VN" ? " Phòng giảng viên trẻ có sáu người dùng chung một máy in." : ""}`, [
      C("Ở lại trường", { ...become(PF), counters: { doors_seen: 1 }, money: -0.05, ...(m ? { trust: { npc: m, delta: 0.2 } } : {}) }, "Lương thấp, bước lên bục giảng"),
      C("Đi làm công ty", { counters: { doors_seen: 1 }, money: 0.1, flags: ["prf_industry_first"] }, "Lương cao, xa giảng đường"),
      C("Đi làm, nhận dạy thỉnh giảng buổi tối", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(PF), log: "Hai năm sau, khoa xin được cho bạn một suất biên chế." }, lose: { log: "Lớp tối bị cắt vì không đủ sinh viên." } } }, "Giữ cả hai, mệt gấp đôi")], 0, npcOf(m)); }),
  door(PF, "prf_d_newuni", [28, 45], (c) => c.migrated || c.has_degree || f(c, "seen_world"), (c) => T("Trường đại học mới mở", `Một trường đại học mới mở ở ${c.migrated ? "quê nhà" : "một thành phố nhỏ"} mời bạn về làm trưởng bộ môn. Họ có tòa nhà mới, thư viện trống một nửa và ba trăm sinh viên khóa đầu. Lương bằng hai phần ba hiện tại.`, [
    C("Nhận, dựng bộ môn từ đầu", { ...become(PF), counters: { doors_seen: 1 }, flags: ["prf_founder"], agency: 0.02 }, "Ít tiền hơn, được xây thứ của mình"),
    C("Dạy thử một học kỳ rồi mới quyết", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(PF), log: "Cuối học kỳ, sinh viên khóa đầu viết thư xin bạn ở lại." }, lose: { log: "Trường đổi hiệu trưởng giữa kỳ. Lời mời không còn." } } }, "Thận trọng, có thể lỡ dịp"),
    C("Từ chối, ở lại chỗ quen", { counters: { doors_seen: 1 }, happy: -1 })], 0)),
  door(PF, "prf_d_evening", [24, 45], () => true, () => T("Lớp học buổi tối", "Một trường đại học thiếu người dạy môn của bạn, mời bạn dạy thỉnh giảng hai tối mỗi tuần, trả theo giờ. Buổi đầu, một sinh viên bàn cuối hỏi một câu bạn không trả lời được, và bạn về nhà đọc đến hai giờ sáng.", [
    C("Bỏ việc chính, theo nghề dạy", { ...become(PF), counters: { doors_seen: 1 }, money: -0.1 }, "Thu nhập giảm, làm việc mình thích"),
    C("Dạy thêm, chờ cơ hội biên chế", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.4, win: { ...become(PF), log: "Khoa mở tuyển chính thức và hỏi bạn trước." }, lose: { money: 0.03, log: "Ba năm dạy thỉnh giảng, khoa vẫn chưa có suất." } } }, "Giữ việc, chờ đợi không biết đến bao giờ"),
    C("Từ chối", { counters: { doors_seen: 1 } })], 1)),

  /* ---------- mạch truyện ---------- */
  beat(PF, 1, 1, (c) => T("Một trăm hai mươi sinh viên", "Giảng đường đầu tiên của bạn có một trăm hai mươi sinh viên, micro rè, máy chiếu lệch màu. Nửa lớp cúi xuống điện thoại từ phút thứ mười. Khoa giao sẵn bộ giáo án mười năm chưa sửa.", [
    C("Dạy đúng giáo án của khoa", { counters: step(c, PF), flags: ["prf_by_the_book"], bw: 2 }, "Yên ổn, lớp vẫn ngủ"),
    C("Bỏ slide, cho sinh viên giải bài thật trên lớp", { counters: step(c, PF), flags: ["prf_active"], bw: -3, gamble: { p: 0.6, win: { counters: { prf_students: 1 }, log: "Đến tuần thứ sáu, không còn ai cúi xuống điện thoại." }, lose: { log: "Khoa nhắc bạn dạy chưa đúng đề cương." } } }, "Lớp sống lại, khoa không thích"),
    C("Chấm thật nghiêm, đánh trượt người không học", { counters: step(c, PF, { prf_strict: 1 }), rel: -2 }, "Lớp sợ bạn, điểm có giá trị")], 0), adult),
  beat(PF, 2, 3, (c) => T("Chỉ tiêu bài báo quốc tế", `Trường đặt mục tiêu leo bảng xếp hạng: mỗi giảng viên hai bài báo quốc tế một năm, mỗi bài thưởng bằng ${c.poor_country ? "nửa năm lương" : "hai tháng lương"}. Một đồng nghiệp rỉ tai: có một "nhóm" bán chỗ đứng tên trong bài báo, ba bài một năm là đủ.`, [
    C("Mua chỗ đứng tên cho đủ chỉ tiêu", { counters: step(c, PF, { prf_papers: 3 }), income_mult: 1.2, money: -0.1, flags: ["prf_bought_papers"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [3, 10], note: "mua chỗ đứng tên trong bài báo quốc tế" } }, "Đủ chỉ tiêu, cài sẵn một quả mìn"),
    C("Tự viết, chậm mà thật", { counters: step(c, PF, { prf_papers: 1 }), bw: -4 }, "Thiếu chỉ tiêu, ngủ yên"),
    C("Lập nhóm nghiên cứu với sinh viên, cho các em đứng đầu", { counters: step(c, PF, { prf_papers: 1, prf_students: 2 }), bw: -5, agency: 0.02, flags: ["prf_lab_group"] }, "Ít bài cho mình, nhiều người lớn lên", { tier: "sovereign" })], 1), adult),
  beat(PF, 3, 4, (c) => {
    if (f(c, "prf_bought_papers")) return T("Danh sách bị lộ", "Một nhà báo công bố danh sách hàng trăm bài báo mua bán từ cùng một \"xưởng\". Tên bạn nằm ở trang thứ hai. Sinh viên chụp màn hình gửi vào nhóm chat của lớp trước khi bạn kịp đọc hết.", [
      C("Nhận lỗi, xin rút cả ba bài", { counters: step(c, PF), custom: "apologize", income_mult: 0.8, flags: ["prf_owned_up"] }, "Mất mặt, còn đứng lớp được"),
      C("Chối, nói mình bị mạo danh", { counters: step(c, PF), gamble: { p: 0.45, win: { log: "Trường lập hội đồng, rồi hội đồng không họp nữa." }, lose: { income_mult: 0.6, flags: ["prf_disgraced"], log: "Thư trao đổi với \"xưởng\" bị đăng lên. Trường đình chỉ bạn." } } }, "Có thể thoát, có thể mất hết"),
      C("Nhận lỗi và kể hết về \"xưởng\" để trường sửa luật", { counters: step(c, PF), custom: "apologize", income_mult: 0.7, agency: 0.03, flags: ["prf_owned_up", "prf_whistle"] }, "Mất thêm bạn bè, người sau không phải mua", { tier: "sovereign" }),
      C("Từ chức, rời trường", { counters: step(c, PF), ...leave(PF), flags: ["ex_professor"] }, "Đi trước khi bị đuổi")], 0);
    return T("Lá thư không ký tên", `Một sinh viên ${f(c, "prf_lab_group") ? "trong nhóm nghiên cứu của bạn" : "năm ba"} gửi bạn lá thư không ký tên: phó trưởng khoa bắt cả lớp đi học thêm ở trung tâm riêng của ông ta, ai không đi thì trượt môn. Kèm theo là bảng điểm của ba khóa. Ông ấy cũng là người ký đề xuất thăng chức cho bạn năm nay.`, [
      C("Gửi đơn lên hiệu trưởng", { counters: step(c, PF), gamble: { p: 0.45, win: { flags: ["prf_reformer"], counters: { prf_students: 1 }, log: "Ông ấy bị chuyển công tác. Khóa sau không ai phải đi học thêm." }, lose: { income_mult: 0.85, flags: ["prf_sidelined"], log: "Đơn của bạn quay lại đúng bàn của ông ấy." } } }, "Có thể sửa được, có thể bị trù"),
      C("Im lặng, chờ được thăng chức rồi tính", { counters: step(c, PF), income_mult: 1.1, happy: -4, flags: ["prf_looked_away"] }, "Lên chức, sinh viên vẫn phải nộp tiền"),
      C("Giúp sinh viên gom chứng cứ, gửi hội đồng trường", { counters: step(c, PF, { prf_students: 2 }), bw: -6, gamble: { p: 0.6, win: { flags: ["prf_reformer", "leader"], log: "Hai trăm sinh viên cùng ký. Hội đồng trường không thể làm ngơ." }, lose: { income_mult: 0.85, flags: ["prf_sidelined"], log: "Hội đồng xử lý \"nội bộ\". Lịch dạy của bạn bị cắt một nửa." } } }, "Không đơn độc, nhưng lộ mặt", { tier: "sovereign" }),
      C("Chán cảnh này, rời trường", { counters: step(c, PF), ...leave(PF), flags: ["ex_professor"] }, "Thoát khỏi khoa, bỏ nghề dạy")], 0);
  }, adult),
  beat(PF, 4, 5, (c) => {
    if (f(c, "prf_disgraced")) return T("Bị đình chỉ đứng lớp", "Bạn bị đình chỉ giảng dạy hai năm. Mỗi sáng bạn vẫn dậy lúc sáu giờ, rồi không biết đi đâu. Một trung tâm luyện thi trả gấp đôi lương cũ, không hỏi gì về quá khứ.", [
      C("Sang dạy luyện thi", { counters: step(c, PF), ...leave(PF), money: 0.2, flags: ["ex_professor"] }, "Đủ tiền, rời giảng đường"),
      C("Xin làm trợ giảng, bắt đầu lại", { counters: step(c, PF), income_mult: 0.6, happy: -2, flags: ["prf_rebuild"] }, "Nghèo và xấu hổ, được ở lại nghề"),
      C("Viết thư công khai về \"xưởng\" bài báo, đề xuất luật mới", { counters: step(c, PF), custom: "apologize", agency: 0.03, rel: 3, flags: ["prf_whistle"] }, "Mất nốt bạn bè trong nghề, có thể đổi luật", { tier: "sovereign" })], 1);
    const papers = c.counters.prf_papers ?? 0;
    const students = c.counters.prf_students ?? 0;
    const vn = c.country === "VN";
    const pWin = Math.max(0.1, Math.min(0.85, 0.3 + 0.1 * papers + 0.05 * students + (f(c, "prf_council") ? 0.1 : 0) - (f(c, "prf_reformer") ? 0.1 : 0) - (f(c, "prf_owned_up") ? 0.15 : 0)));
    return T(vn ? "Hội đồng xét phó giáo sư" : "Hội đồng xét biên chế suốt đời", `Hồ sơ xét ${vn ? "chức danh phó giáo sư" : "biên chế suốt đời"} của bạn được đưa ra hội đồng tháng sau. ${papers >= 3 ? "Hồ sơ dày, đủ bài báo." : "Hồ sơ mỏng hơn những người cùng đợt."}${students >= 3 ? " Thư giới thiệu của học trò cũ xếp thành một chồng." : ""}${f(c, "prf_reformer") ? " Vài người trong hội đồng chưa quên vụ bạn đứng về phía sinh viên." : ""}${f(c, "prf_owned_up") ? " Vụ rút bài năm nào vẫn nằm trong hồ sơ." : ""} Một người quen nói có cách "lo" cho chắc.`, [
      C("Nộp hồ sơ, không lo lót", { counters: step(c, PF), gamble: { p: pWin, win: { income_mult: 1.3, happy: 5, flags: ["prf_tenure"], log: "Hội đồng bỏ phiếu thuận. Lần đầu tiên bạn thấy mình đứng vững." }, lose: { happy: -5, log: "Thiếu hai phiếu. Người ta bảo năm sau thử lại." } } }, "Công bằng, có thể trượt"),
      C("Lo lót cho chắc", { counters: step(c, PF), money: -0.3, income_mult: 1.3, flags: ["prf_tenure"], secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 10], note: "lo lót hội đồng xét chức danh" } }, "Chắc chắn, mang theo một bí mật"),
      C("Nhận ghế trưởng khoa thay vì chức danh", { counters: step(c, PF), income_mult: 1.2, bw: -5, flags: ["prf_dean"] }, "Quyền trong tay, xa lớp học"),
      C("Rút hồ sơ, quay về với lớp học", { counters: step(c, PF, { prf_students: 1 }), happy: 2, flags: ["prf_no_title"] }, "Không danh, không phải đánh đổi")], 0);
  }, adult),
  beat(PF, 5, 6, (c) => {
    const students = c.counters.prf_students ?? 0;
    const hiding = f(c, "prf_bought_papers") && !f(c, "prf_owned_up");
    return T("Bài giảng cuối cùng", `Trường xếp cho bạn một buổi giảng cuối trước ngày nghỉ hưu. ${students >= 3 ? "Giảng đường kín chỗ, có cả học trò từ hai mươi năm trước, giờ có người đã thành giáo sư." : "Ba mươi chiếc ghế, mười lăm người đến, phần lớn vì điểm danh."}${hiding ? " Ở hàng ghế cuối, có người vẫn giữ tấm ảnh chụp danh sách năm nào." : ""}`, [
      C("Giảng như mọi buổi, không nói chuyện đời", { counters: step(c, PF), happy: 3 }, "Trọn vẹn, không ai biết bạn nghĩ gì"),
      C("Kể thật về những lần mình đã sai", { counters: step(c, PF), rel: 4, flags: ["prf_honest_lecture"], ...(hiding ? { custom: "apologize" } : {}) }, "Lộ điểm yếu, để lại một bài học thật", { tier: "awakened" }),
      C("Đưa toàn bộ bài giảng lên mạng, miễn phí", { counters: step(c, PF, { prf_students: 3 }), money: -0.02, flags: ["prf_open_course"] }, "Không bán được giáo trình, ai cũng học được")], 0);
  }, (c) => c.age >= 50),

  /* ---------- chuyện thường ngày ---------- */
  daily(PF, "prf_vip", [26, 70], 9, () => T("Điểm của con người có chức", "Con trai một người có chức trong thành phố trượt môn của bạn với điểm ba. Trưởng khoa gọi bạn lên, nói nhẹ nhàng rằng \"em nó bận việc gia đình, bạn xem lại giúp\".", [
    C("Sửa điểm cho qua", { counters: { prf_strict: -1 }, income_mult: 1.05, flags: ["prf_bent_grade"] }, "Lấy lòng cấp trên, cả lớp biết chuyện"),
    C("Giữ nguyên điểm", { counters: { prf_strict: 1 }, gamble: { p: 0.6, win: { log: "Cậu ấy học lại, lần sau qua với điểm bảy." }, lose: { income_mult: 0.95, log: "Năm sau bạn không được phân dạy lớp chất lượng cao." } } }, "Giữ nguyên tắc, có thể bị gạt ra"),
    C("Cho thi lại công khai, có hội đồng chấm", { counters: { prf_strict: 1 }, agency: 0.02, flags: ["leader"] }, "Không ai mất mặt, không ai được ưu ái", { tier: "sovereign" })], 1)),
  daily(PF, "prf_ai", [26, 75], 8, (c) => T("Bài luận không phải người viết", vary("pfa", c.age, ["Trong bốn mươi bài luận cuối kỳ, bạn đoán một nửa do máy viết. Không có cách nào chứng minh chắc chắn.", "Một sinh viên bị bạn nghi dùng máy viết bài bật khóc ngay trong phòng: em viết thật, chỉ là em viết hay."]), [
    C("Cho trượt những bài đáng ngờ", { counters: { prf_strict: 1 }, gamble: { p: 0.6, win: { log: "Học kỳ sau, số bài đáng ngờ giảm hẳn." }, lose: { happy: -4, rel: -2, log: "Một em bị oan. Phụ huynh làm đơn lên trường." } } }, "Nghiêm, có thể oan người"),
    C("Đổi sang thi vấn đáp từng người", { bw: -6, counters: { prf_students: 1 }, flags: ["prf_oral_exam"] }, "Mệt gấp ba, chấm được thật", { tier: "awakened" }),
    C("Cho qua, không đủ sức truy", { happy: -2 }, "Đỡ mệt, điểm số mất giá")], 1)),
  daily(PF, "prf_thesis", [28, 70], 9, () => T("Đề tài nhạy cảm", "Một học viên cao học muốn viết luận văn về chuyện đất đai bị thu hồi ở quê mình, có phỏng vấn người dân. Khoa ngại \"phức tạp\". Em ấy nói chỉ có bạn dám nhận hướng dẫn.", [
    C("Nhận hướng dẫn", { counters: { prf_students: 1 }, gamble: { p: 0.6, win: { know: 4, flags: ["prf_brave_thesis"], log: "Luận văn bảo vệ xuất sắc, được một tờ báo trích dẫn." }, lose: { income_mult: 0.95, log: "Hội đồng yêu cầu bỏ ba chương. Em ấy khóc ở hành lang." } } }, "Đúng việc, có thể bị để ý"),
    C("Khuyên em đổi đề tài cho an toàn", { happy: -2, counters: { prf_students: -1 } }, "Yên ổn, một câu hỏi bị bỏ lại"),
    C("Nhận, mời thêm một giáo sư nước ngoài cùng hướng dẫn", { bw: -3, counters: { prf_students: 1 }, flags: ["prf_co_supervise"] }, "An toàn hơn, phải chia công", { tier: "awakened" })], 0)),
  daily(PF, "prf_moonlight", [26, 65], 7, (c) => T("Việc làm thêm ngoài giờ", vary("pfc", c.age, [`Lương giảng viên ${c.poor_country ? "không đủ trả tiền nhà" : "đứng yên năm năm"}. Một trung tâm luyện thi trả gấp ba nếu bạn dạy ba tối mỗi tuần.`, "Một công ty mời bạn dạy khóa đào tạo nội bộ cuối tuần, mỗi khóa trả bằng một tháng lương."]), [
    C("Nhận dạy thêm", { money: 0.15, bw: -5, counters: { prf_papers: -1 } }, "Đủ tiền, không còn sức nghiên cứu"),
    C("Từ chối, dành thời gian viết bài", { counters: { prf_papers: 1 }, money: -0.02 }, "Nghèo hơn, hồ sơ dày hơn"),
    C("Mở lớp miễn phí cuối tuần cho sinh viên nghèo", { counters: { prf_students: 2 }, bw: -4, rel: 3 }, "Không đồng nào, nhiều người nhớ ơn", { tier: "awakened" })], 0)),
  daily(PF, "prf_council", [30, 70], 8, () => T("Ghế trong hội đồng khoa", "Bạn được đề cử vào hội đồng khoa: được quyết ai dạy lớp nào, tiền nghiên cứu chia ra sao. Mỗi tuần thêm hai buổi họp, mỗi buổi ba tiếng.", [
    C("Nhận, học cách nắm quyền", { bw: -4, income_mult: 1.05, flags: ["prf_council"] }, "Có tiếng nói, mất thời gian"),
    C("Từ chối, giữ thời gian cho lớp học", { counters: { prf_students: 1 }, know: 2 }, "Gần sinh viên, xa quyền quyết định"),
    C("Nhận, và đòi công khai biên bản họp", { bw: -5, agency: 0.02, rel: -1, flags: ["prf_council", "leader"] }, "Minh bạch, mất lòng người quen giấu", { tier: "sovereign" })], 0)),
  daily(PF, "prf_knock", [26, 75], 8, (c) => T("Tiếng gõ cửa lúc tối", vary("pfk", c.age, ["Gần tám giờ tối, một sinh viên năm hai gõ cửa phòng bạn. Nhà em vỡ nợ, em định bỏ học đi làm, chỉ muốn chào bạn trước khi đi.", "Sinh viên giỏi nhất lớp bỗng bỏ ba tuần không đến. Bạn bè nói em đang làm ca đêm ở một xưởng."]), [
    C("Chạy vạy tìm học bổng cho em", { bw: -4, counters: { prf_students: 1 }, gamble: { p: 0.6, win: { flags: ["saved_student"], log: "Một quỹ học bổng nhận hồ sơ. Em tốt nghiệp đúng hạn." }, lose: { log: "Quỹ hết suất. Em vẫn nghỉ, nhưng giữ số điện thoại của bạn." } } }, "Tốn công, có thể không kịp"),
    C("Cho em vay tiền của mình", { money: -0.06, counters: { prf_students: 1 } }, "Mất tiền, có thể không đòi lại"),
    C("Chúc em may mắn", { happy: -2 }, "Không dính vào, một người bỏ học")], 0)),
  daily(PF, "prf_rival", [28, 70], 9, (c, N) => { const r = role(c, "rival")!; return T("Môn học bị lấy", `${N(r)}, đồng nghiệp cùng khoa, vừa được giao môn học bạn xây dựng ba năm. Giáo án của bạn được đổi tên tác giả trong một buổi chiều.`, [
    C("Phản đối giữa cuộc họp khoa", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "bị phản đối giữa cuộc họp khoa" }, gamble: { p: 0.4, win: { log: "Khoa trả lại tên tác giả cho bạn." }, lose: { happy: -3, log: "Khoa bảo giáo án là tài sản chung." } } }, "Đòi lại công, thêm một kẻ thù"),
    C("Đề nghị dạy chung, chia đôi số tiết", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia đôi môn học thay vì giành nhau" }, log: "Hai người dạy chung, môn học có thêm phần thực hành." }, lose: { log: `${N(r)} không trả lời.` } } }, "Mất một nửa, có thể được một đồng minh", { tier: "awakened" }),
    C("Để vậy, viết một môn mới", { counters: { prf_papers: 1 }, bw: -3 }, "Nhịn, nhưng làm ra thứ mới")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PF, "prf_book", [30, 70], 9, () => T("Giáo trình bắt buộc", "Một nhà xuất bản đề nghị in giáo trình của bạn và đưa vào danh sách bắt buộc của khoa, giá gấp ba sách thường. Bạn được hưởng một phần mười mỗi cuốn bán ra.", [
    C("Ký, đưa vào danh sách bắt buộc", { money: 0.15, rel: -2, flags: ["prf_textbook_deal"] }, "Có tiền đều, sinh viên trả giá"),
    C("Phát bản điện tử miễn phí cho sinh viên", { counters: { prf_students: 1 }, rel: 2 }, "Mất tiền bản quyền, được lòng người học"),
    C("In giá vốn, không bắt ai phải mua", { money: 0.02, counters: { prf_students: 1 } }, "Lãi ít, không ai bị ép")], 0)),
  daily(PF, "prf_abroad", [30, 60], 9, () => T("Lời mời dạy ở nước ngoài", "Một trường đại học nước ngoài mời bạn sang dạy hợp đồng hai năm, lương gấp bốn. Khoa của bạn đang thiếu người, lớp chất lượng cao của bạn sẽ phải giao cho trợ giảng.", [
    C("Đi, hai năm thôi", { income_mult: 1.3, rel: -3, know: 4, flags: ["prf_abroad"] }, "Tiền và kinh nghiệm, lớp cũ bỏ dở"),
    C("Ở lại với khoa", { counters: { prf_students: 1 }, happy: -1 }, "Giữ lớp, lỡ một cơ hội"),
    C("Đề nghị dạy từ xa, mỗi hè sang một tháng", { gamble: { p: 0.45, win: { money: 0.15, flags: ["prf_bridge"], log: "Hai trường ký thỏa thuận trao đổi sinh viên nhờ bạn." }, lose: { log: "Trường bên kia chỉ cần người dạy toàn thời gian." } } }, "Không đi hẳn, mở được một cây cầu", { tier: "sovereign" })], 1)),
  daily(PF, "prf_quit", [30, 60], 99, (c) => T("Bảng lương cuối tháng", `Cuối tháng, bạn cầm bảng lương rồi nhìn sang tin nhắn của một người bạn cũ: công ty bạn ấy cần trưởng phòng đào tạo, lương gấp ba.${c.kids_alive > 0 ? " Tiền học của con kỳ này chưa đóng." : ""}`, [
    C("Nghỉ dạy, sang công ty", { ...leave(PF), money: 0.2, flags: ["ex_professor"] }, "Đủ tiền, xa sinh viên"),
    C("Ở lại trường", { happy: 1, counters: { prf_students: 1 } }, "Nghèo, còn bục giảng")], 1), (c) => c.broke || c.happy < 50),

  /* ---------- gia đình ---------- */
  cross(PF, "prf_family", [30, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} thi vào trường bạn dạy`, `${N(k)} thi vào chính trường bạn dạy, thiếu nửa điểm so với điểm chuẩn. Một đồng nghiệp trong ban tuyển sinh nhắn tin: "Con anh chị à? Để em xem."`, [
      C("Nhờ đồng nghiệp \"xem giúp\"", { trust: { npc: k, delta: 0.1 }, secret: { tag: "CHEATED_EXAM", severity: 0.3, fuse_years: [2, 10], note: "nhờ người nâng điểm tuyển sinh cho con" } }, "Con đỗ, có một bí mật"),
      C("Từ chối, để con thi lại năm sau", { trust: { npc: k, delta: -0.15 }, counters: { honest: 1 } }, "Trong sạch, con mất một năm"),
      C("Khuyên con học trường khác, nơi không ai biết mình", { trust: { npc: k, delta: 0.15 }, flags: ["prf_child_elsewhere"] }, "Con tự đứng, xa vòng tay bạn", { tier: "awakened" })], 1, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Nhờ nói giúp một tiếng", `${N(p)} gọi điện: con nhà hàng xóm thi vào trường bạn, thiếu một điểm. "Con là giảng viên, nói giúp một tiếng, hàng xóm với nhau bao năm."`, [
      C("Nói giúp", { trust: { npc: p, delta: 0.2 }, secret: { tag: "CHEATED_EXAM", severity: 0.2, fuse_years: [2, 8], note: "nói giúp cho con nhà hàng xóm đỗ" } }, "Vừa lòng người nhà, có một bí mật"),
      C("Từ chối, giải thích cho người nhà hiểu", { trust: { npc: p, delta: -0.15 } }, "Sạch sẽ, người nhà phật lòng"),
      C("Kèm em ấy ôn thi lại, không lấy tiền", { bw: -4, trust: { npc: p, delta: 0.15 }, counters: { prf_students: 1 } }, "Không lách luật, vẫn giúp được người", { tier: "sovereign" })], 2, { npc: p });
  }),

  /* ================================================================ NHÀ KHẢO CỔ ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(AK, "akh_t_shard", [8, 15], () => true, () => T("Mảnh gốm sau mùa lũ", "Nước rút, bạn nhặt được ngoài bờ ruộng một mảnh gốm có hoa văn sóng nước. Bạn rửa sạch, đánh số bằng bút bi, cất vào hộp bánh cùng hai mươi mảnh khác. Có người thu mua đồ cũ trả giá cả hộp.", [
    C("Mang hộp gốm đến bảo tàng hỏi", { flags: [talentFlag(AK)], counters: { talents_seen: 1 }, know: 3, money: -0.01 }, "Tốn công đi xa, mở một con đường"),
    C("Bán cả hộp lấy tiền tiêu", { counters: { talents_seen: 1 }, money: 0.02, flags: ["akh_sold_shards"] }, "Có tiền vặt, mất cái hộp"),
    C("Giấu dưới gầm giường, không cho ai xem", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AK, "akh_d_season", [22, 35], () => true, (c) => T("Đoàn khai quật thiếu người", `Một đoàn khai quật cần người phụ việc cho mùa đào ba tháng ở vùng đồi. Ngủ lều, dùng nước giếng, tiền công bằng nửa lương bạn đang có.${f(c, talentFlag(AK)) ? " Trưởng đoàn còn nhớ cái hộp gốm bạn mang đến bảo tàng năm xưa." : ""}`, [
    C("Bỏ việc, theo đoàn", { ...become(AK), counters: { doors_seen: 1 }, money: -0.1, health: -1 }, "Nghèo, nắng, và đúng thứ bạn muốn"),
    C("Xin nghỉ phép đi một tuần", { counters: { doors_seen: 1 }, know: 3, flags: ["akh_one_week"] }, "Nếm thử, không đổi đời"),
    C("Thôi", { counters: { doors_seen: 1 } })], 0)),
  door(AK, "akh_d_bulldozer", [22, 40], () => true, () => T("Máy xúc dừng lại", "Ở công trường gần nhà bạn, gầu máy xúc kéo lên những viên gạch cổ và một chiếc vò còn nguyên nắp. Chủ thầu muốn đổ bê tông ngay trong đêm, trễ một tuần là mất tiền phạt. Bạn là người duy nhất ở đó nhận ra đó là gì.", [
    C("Báo cơ quan văn hóa, xin đi cùng đoàn khảo sát", { ...become(AK), counters: { doors_seen: 1 }, money: -0.05, rel: -2 }, "Mất lòng chủ thầu, bước vào nghề"),
    C("Im lặng, nhận tiền \"bồi dưỡng\"", { counters: { doors_seen: 1 }, money: 0.05, happy: -2, flags: ["akh_covered_site"] }, "Có tiền, một thứ bị chôn mãi"),
    C("Chụp ảnh, đăng lên mạng", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(AK), log: "Ảnh lan khắp nơi. Một viện khảo cổ gọi điện mời bạn tham gia đoàn." }, lose: { rel: -2, log: "Sáng hôm sau công trường đã phủ bê tông. Bài đăng bị báo cáo xóa." } } }, "Để công chúng phán xử, có thể muộn", { tier: "awakened" })], 0)),
  door(AK, "akh_d_basement", [22, 40], (c) => c.has_degree || f(c, talentFlag(AK)), () => T("Bốn mươi nghìn hiện vật dưới hầm", "Bảo tàng tuyển một người kiểm kê kho. Dưới tầng hầm có bốn mươi nghìn hiện vật, một nửa chưa từng được ghi sổ, nhãn giấy đã mục. Lương thấp, nhưng bạn được cầm từng món trên tay.", [
    C("Nhận việc", { ...become(AK), counters: { doors_seen: 1 }, happy: 2 }, "Lương thấp, sống giữa đồ cổ"),
    C("Làm tình nguyện cuối tuần trước đã", { counters: { doors_seen: 1 }, bw: -2, gamble: { p: 0.35, win: { ...become(AK), log: "Ba tháng sau, người kiểm kê chính thức nghỉ. Bảo tàng gọi bạn." }, lose: { log: "Bảo tàng đóng cửa tầng hầm để sửa mái." } } }, "Không mất việc, có thể lỡ cơ hội"),
    C("Từ chối, lương thấp quá", { counters: { doors_seen: 1 }, money: 0.02 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(AK, 1, 1, (c) => T("Hố thám sát đầu tiên", "Hố thám sát của bạn rộng hai mét, mưa đổ mỗi chiều lúc ba giờ. Ở độ sâu một mét tư, bay chạm vào miệng một chiếc vò. Trưởng đoàn muốn đào nhanh cho kịp cuối mùa, còn đúng phương pháp thì phải bóc từng lớp năm phân.", [
    C("Bóc từng lớp, chấp nhận trễ", { counters: step(c, AK), bw: -3, flags: ["akh_careful"] }, "Chậm, giữ được mọi dấu vết"),
    C("Đào nhanh theo ý trưởng đoàn", { counters: step(c, AK, { akh_finds: 1 }), happy: 2, flags: ["akh_fast"] }, "Kịp mùa, mất bối cảnh hiện vật"),
    C("Thuê dân làng cùng đào, kể họ nghe từng lớp đất", { counters: step(c, AK), money: -0.05, rel: 3, flags: ["akh_local_trust"] }, "Tốn tiền, có thêm trăm đôi mắt canh giữ", { tier: "awakened" })], 0), adult),
  beat(AK, 2, 3, (c) => T("Ngôi mộ dưới đồi", `Mùa đào thứ ba, đoàn tìm thấy một ngôi mộ cổ còn nguyên, trong có ${c.country === "VN" ? "một chiếc trống đồng" : "một chiếc vạc đồng"} và đồ trang sức bằng vàng. Một đoàn nước ngoài nhiều tiền đề nghị cùng chủ trì, nhưng hiện vật phải gửi sang phòng thí nghiệm của họ "phân tích" mười năm. Chính quyền địa phương thì muốn làm khu du lịch ngay.${f(c, "akh_careful") ? " Nhờ bóc từng lớp, bạn có bản vẽ đầy đủ của cả ngôi mộ." : ""}`, [
    C("Hợp tác với đoàn nước ngoài", { counters: step(c, AK, { akh_finds: 2 }), income_mult: 1.3, flags: ["akh_foreign_deal"] }, "Kinh phí lớn, hiện vật đi xa"),
    C("Giữ hiện vật ở lại, tự làm với ít tiền", { counters: step(c, AK, { akh_finds: 1 }), bw: -5, flags: ["akh_local_keep"] }, "Chậm và nghèo, cổ vật không rời đất"),
    C("Đòi phân tích tại chỗ, đào tạo người địa phương", { counters: step(c, AK), gamble: { p: 0.4, win: { income_mult: 1.2, counters: { akh_finds: 2 }, flags: ["akh_fair_deal", "akh_local_keep"], log: "Họ đồng ý đưa máy sang. Sáu sinh viên địa phương được học phân tích." }, lose: { flags: ["akh_local_keep"], log: "Họ rút đi. Bạn còn lại ngôi mộ và ba chiếc bay." } } }, "Lựa chọn thứ ba", { tier: "sovereign" })], 1), adult),
  beat(AK, 3, 4, (c, N) => {
    const quit = C("Bỏ nghề, không muốn dây vào nữa", { counters: step(c, AK), ...leave(AK), flags: ["ex_archaeologist"] }, "Thoát rắc rối, rời hố đào");
    if (f(c, "akh_foreign_deal") && !f(c, "akh_fair_deal")) return T("Cổ vật trong catalô đấu giá", "Một người bạn gửi cho bạn trang catalô của một nhà đấu giá ở nước ngoài. Chiếc vòng vàng thứ ba trong ngôi mộ của bạn nằm ở đó, giá ước tính bằng hai mươi năm lương của cả đoàn. Biên bản bàn giao năm ấy có chữ ký của bạn.", [
      C("Công khai, đòi hiện vật về", { counters: step(c, AK), gamble: { p: 0.45, win: { rel: 5, flags: ["akh_repatriated"], log: "Phiên đấu giá bị hoãn. Một năm sau, chiếc vòng về nước." }, lose: { income_mult: 0.8, flags: ["akh_burned_bridge"], log: "Đoàn nước ngoài cắt hợp tác. Chiếc vòng về tay một người mua giấu tên." } } }, "Đúng, có thể mất cả đối tác"),
      C("Im lặng, vì biên bản có chữ ký của mình", { counters: step(c, AK), happy: -5, flags: ["akh_complicit"], secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 8], note: "ký biên bản bàn giao rồi im lặng khi cổ vật bị bán" } }, "Yên lúc này, một quả bom hẹn giờ"),
      C("Lần theo chuỗi bàn giao, tìm người đã bán", { counters: step(c, AK), bw: -6, gamble: { p: 0.5, win: { flags: ["akh_repatriated", "akh_traced"], log: "Dấu vết dẫn về một người trong chính đoàn của bạn. Hồ sơ được gửi cho công an." }, lose: { health: -3, flags: ["akh_threatened"], log: "Bạn nhận một tin nhắn không tên khuyên dừng lại." } } }, "Tìm ra sự thật, có thể bị đe dọa", { tier: "awakened" }),
      quit], 0);
    if (f(c, "akh_local_keep")) return T("Hồ thủy điện sẽ dâng", "Một quyết định đã được ký: mười tám tháng nữa, hồ thủy điện mới sẽ nhấn chìm cả thung lũng, kể cả khu di chỉ. Đoàn bạn mới đào được một phần năm. Dân làng cũng phải chuyển đi.", [
      C("Đào cứu, làm ngày làm đêm", { counters: step(c, AK, { akh_finds: 2 }), health: -5, bw: -6, flags: ["akh_rescue_dig", "akh_flooded"] }, "Cứu được một phần, kiệt sức"),
      C("Vận động dời vị trí đập", { counters: step(c, AK), agency: 0.03, gamble: { p: 0.25, win: { flags: ["akh_saved_valley", "leader"], log: "Đập được dời lên thượng nguồn hai cây số. Thung lũng còn nguyên." }, lose: { happy: -6, flags: ["akh_flooded"], log: "Nước dâng đúng hạn. Bạn đứng trên đồi nhìn nó phủ lên hố đào cuối cùng." } } }, "Ít cơ hội, có thể cứu cả thung lũng", { tier: "sovereign" }),
      C("Đi cùng dân làng, ghi lại ký ức của họ", { counters: step(c, AK), rel: 4, know: 3, flags: ["akh_oral_history", "akh_local_trust", "akh_flooded"] }, "Mất hiện vật, giữ được lời kể", { tier: "awakened" }),
      quit], 0);
    const o = role(c, "official");
    return T("Tiếng xẻng lúc nửa đêm", `Sáng ra, khu di chỉ có mười hai hố đào trộm mới, đất còn ướt. Người trông coi nói có một nhóm đến lúc nửa đêm${o ? `, và ${N(o)} biết rõ họ là ai` : ""}. Hôm sau, có người tìm gặp bạn, đề nghị chia phần để bạn đừng báo.`, [
      C("Báo công an", { counters: step(c, AK), gamble: { p: 0.55, win: { flags: ["akh_stopped_looters"], log: "Nhóm đào trộm bị bắt cùng hai bao hiện vật." }, lose: { health: -3, flags: ["akh_threatened"], log: "Không ai bị bắt. Lều của đoàn bị đốt trong đêm." } } }, "Đúng việc, có thể bị trả thù"),
      C("Nhận phần, ngoảnh mặt đi", { counters: step(c, AK), money: 0.4, flags: ["akh_complicit"], close_doors: ["clean_record"], secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.6, fuse_years: [2, 9], note: "nhận chia phần cổ vật bị đào trộm" } }, "Tiền bằng nửa năm lương, một bí mật lớn"),
      C("Thuê chính những người đào trộm làm bảo vệ", { counters: step(c, AK), money: -0.1, gamble: { p: 0.5, win: { flags: ["akh_guards", "akh_local_trust"], log: "Họ biết mọi lối mòn. Từ đó khu di chỉ không mất thêm món nào." }, lose: { log: "Hai tuần sau, họ bỏ đi cùng toàn bộ dụng cụ của đoàn." } } }, "Biến kẻ trộm thành người giữ", { tier: "sovereign" }),
      quit], 0, npcOf(o));
  }, adult),
  beat(AK, 4, 5, (c) => {
    if (f(c, "akh_complicit")) return T("Cuộc gọi từ cơ quan điều tra", `${f(c, "akh_foreign_deal") ? "Vụ chiếc vòng vàng bị đấu giá được mở lại." : "Nhóm đào trộm năm xưa bị bắt vì một vụ khác, và khai ra tên bạn."} Cơ quan điều tra mời bạn lên làm việc vào thứ Hai. Viện đã tạm đình chỉ bạn khỏi mọi đoàn khai quật.`, [
      C("Khai hết, hợp tác với điều tra", { counters: step(c, AK), custom: "apologize", income_mult: 0.7, flags: ["akh_testified"] }, "Có thể mất nghề, nhẹ lòng"),
      C("Thuê luật sư, giữ im lặng", { counters: step(c, AK), money: -0.3, gamble: { p: 0.5, win: { log: "Hồ sơ khép lại vì không đủ chứng cứ." }, lose: { income_mult: 0.5, close_doors: ["clean_record"], flags: ["akh_convicted"], log: "Tòa tuyên án treo. Bạn không còn được cấp phép khai quật." } } }, "Tốn tiền, có thể thoát"),
      C("Bỏ nghề, về quê", { counters: step(c, AK), ...leave(AK), flags: ["ex_archaeologist"] }, "Rút lui trước khi bị gạch tên")], 0);
    if (f(c, "akh_flooded") && !f(c, "akh_saved_valley")) return T("Mặt hồ phẳng lặng", `Thung lũng giờ là mặt hồ. ${(c.counters.akh_finds ?? 0) >= 3 ? "Ba trăm thùng hiện vật đào cứu" : "Vài chục thùng hiện vật"} nằm trong một nhà kho ẩm, chưa ai có tiền nghiên cứu.${f(c, "akh_oral_history") ? " Bạn còn bốn mươi cuốn băng ghi lời kể của dân làng." : ""}`, [
      C("Viết cuốn sách đầy đủ về khu di chỉ", { counters: step(c, AK), know: 5, bw: -5, flags: ["akh_book"] }, "Nhiều năm không lương, để lại một cuốn sách"),
      C("Dựng bản số ba chiều cho ai cũng xem được", { counters: step(c, AK), money: -0.15, agency: 0.02, flags: ["akh_digital"] }, "Tốn tiền, thung lũng sống lại trên mạng", { tier: "sovereign" }),
      C("Nhận việc ở bảo tàng thành phố", { counters: step(c, AK), income_mult: 1.2, flags: ["akh_museum_job"] }, "Ổn định, nhà kho vẫn ẩm"),
      C("Bỏ nghề", { counters: step(c, AK), ...leave(AK), flags: ["ex_archaeologist"] }, "Buông tay, đi tìm đời khác")], 0);
    return T("Bảo tàng bên di chỉ", `${f(c, "akh_saved_valley") ? "Thung lũng được giữ lại, tin ấy lên báo khắp nơi." : f(c, "akh_repatriated") ? "Chiếc vòng vàng về nước được trưng ở sảnh chính." : "Khu di chỉ của bạn được công nhận là di sản cấp quốc gia."} Chính quyền xây một bảo tàng ngay cạnh hố khai quật và mời bạn làm giám đốc. Một công ty du lịch cũng muốn xây khu nghỉ dưỡng bao quanh.${f(c, "akh_local_trust") ? " Dân làng vẫn gọi bạn bằng tên riêng." : ""}${(c.counters.akh_fame ?? 0) >= 1 ? " Nhiều khách đến vì bộ phim tài liệu năm nào." : ""}`, [
      C("Nhận ghế giám đốc bảo tàng", { counters: step(c, AK), income_mult: 1.3, bw: -4, flags: ["akh_director"] }, "Lương và quyền, rời hố đào"),
      C("Ở lại hiện trường, đào tiếp", { counters: step(c, AK, { akh_finds: 1 }), happy: 4 }, "Làm điều mình thích, không thêm quyền"),
      C("Giao bảo tàng cho làng cùng quản lý, chia tiền vé", { counters: step(c, AK), income_mult: 0.9, agency: 0.03, rel: 5, flags: ["akh_village_museum"] }, "Ít quyền cho mình, làng giữ được di sản", { tier: "sovereign" }),
      C("Ký với công ty du lịch", { counters: step(c, AK), money: 0.5, rel: -3, flags: ["akh_resort"] }, "Tiền lớn, di chỉ thành phông chụp ảnh")], 0);
  }, adult),
  beat(AK, 5, 6, (c) => T("Hài cốt xin về", `Một cộng đồng ở vùng đồi gửi thư: họ tin những bộ hài cốt đoàn bạn khai quật nhiều năm trước là tổ tiên mình, xin được đưa về an táng theo nghi lễ.${f(c, "akh_local_trust") ? " Người ký thư là con trai một bác thợ từng đào cùng bạn mùa đầu tiên." : ""} Các nhà nghiên cứu trẻ muốn giữ lại để phân tích gen.`, [
    C("Trả lại, đến dự lễ an táng", { counters: step(c, AK), rel: 5, flags: ["akh_returned_remains"] }, "Mất mẫu nghiên cứu, giữ được lòng người"),
    C("Giữ lại cho khoa học", { counters: step(c, AK, { akh_finds: 1 }), rel: -3, know: 3 }, "Tri thức cho đời sau, nỗi đau cho người sống"),
    C("Hỏi ý họ, lấy mẫu nhỏ rồi cùng an táng", { counters: step(c, AK), gamble: { p: 0.6, win: { rel: 4, know: 3, flags: ["akh_returned_remains", "akh_shared_science"], log: "Họ đồng ý. Kết quả phân tích được đọc to trong lễ an táng." }, lose: { rel: 2, flags: ["akh_returned_remains"], log: "Họ từ chối lấy mẫu. Bạn trả lại nguyên vẹn." } } }, "Tìm đường cho cả hai bên", { tier: "sovereign" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(AK, "akh_weather", [22, 70], 7, (c) => T("Thời tiết ở công trường", vary("akr", c.age, ["Ba ngày mưa liền, hố đào chính ngập đến ngang ngực. Thuê máy bơm tốn bằng một tháng kinh phí, mà mùa đào chỉ còn hai tuần.", "Nắng bốn mươi độ, hai người trong đoàn bị say nắng trong một buổi sáng. Còn mười ngày nữa là hết giấy phép đào."]), [
    C("Thuê máy, làm tiếp", { money: -0.05, health: -2, counters: { akh_finds: 1 } }, "Tốn tiền và sức, kịp mùa"),
    C("Dừng đào, che hố chờ mùa sau", { happy: -2, flags: ["akh_patient"] }, "Mất một năm, không ai ngã bệnh")], 0)),
  daily(AK, "akh_cert", [24, 75], 9, () => T("Giấy xác nhận cho người buôn đồ cổ", "Một người buôn đồ cổ mang đến chiếc bình men rạn, nhờ bạn viết giấy xác nhận niên đại. Ông ta trả bằng nửa năm lương, không hỏi bạn có chắc không. Bạn khá chắc nó vừa được đào lên từ một khu mộ nào đó.", [
    C("Viết giấy, nhận tiền", { money: 0.5, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 10], note: "ký xác nhận cho cổ vật không rõ nguồn gốc" } }, "Tiền lớn, tên bạn trên một tờ giấy bẩn"),
    C("Từ chối", { counters: { honest: 1 } }, "Sạch, mất một khoản lớn"),
    C("Từ chối, báo cơ quan quản lý di sản", { flags: ["akh_reported_dealer"], gamble: { p: 0.5, win: { log: "Chiếc bình bị thu giữ, đưa về bảo tàng." }, lose: { happy: -3, log: "Ông ta biết ai báo. Từ đó giới buôn đồ cổ không ai chào bạn." } } }, "Cứu được món đồ, có thêm kẻ thù", { tier: "awakened" })], 1)),
  daily(AK, "akh_ritual", [22, 70], 8, (c) => T("Người làng sợ động mộ", `Từ khi đoàn mở ngôi mộ, trong làng có hai người ốm. ${c.country === "VN" ? "Các cụ bảo phải làm lễ cúng trước khi đào tiếp." : "Các bậc cao niên muốn làm một nghi lễ trước khi đào tiếp."} Trưởng đoàn bảo đó là mê tín, mất thêm hai ngày.`, [
    C("Bỏ tiền túi làm lễ, chờ hai ngày", { money: -0.02, rel: 3, flags: ["akh_local_trust"] }, "Chậm hai ngày, làng đứng về phía bạn"),
    C("Đào tiếp theo kế hoạch", { counters: { akh_finds: 1 }, rel: -3 }, "Kịp tiến độ, làng xa lánh")], 0)),
  daily(AK, "akh_film", [24, 70], 9, (c) => T("Kho báu trên màn ảnh", vary("akd", c.age, ["Một kênh truyền hình muốn quay phim tài liệu về đoàn, nhưng cần cảnh \"phát hiện kho báu\" quay lại từ đầu: chôn đồ xuống rồi đào lên.", "Một nhóm làm phim muốn gọi khu di chỉ là \"vương quốc bị lãng quên\", dù bằng chứng chưa đủ."]), [
    C("Diễn lại cho họ quay", { money: 0.08, counters: { akh_fame: 1 }, flags: ["akh_staged"] }, "Nổi tiếng, đồng nghiệp cười sau lưng"),
    C("Từ chối", { counters: { honest: 1 } }, "Giữ sự thật, mất một dịp quảng bá"),
    C("Nhận, đòi được duyệt lời bình", { gamble: { p: 0.5, win: { counters: { akh_fame: 1 }, log: "Bộ phim đúng sự thật mà vẫn hay. Năm sau đoàn có thêm tài trợ." }, lose: { log: "Họ tìm một nhà khảo cổ khác dễ tính hơn." } } }, "Có thể được cả hai, có thể mất dịp", { tier: "awakened" })], 2)),
  daily(AK, "akh_hoard", [24, 70], 9, () => T("Hũ tiền đồng trên đồi", "Hai người đi dò kim loại cuối tuần tìm thấy một hũ tiền đồng cổ trên đồi và gọi cho bạn. Họ muốn được thưởng, nếu không sẽ bán cho người buôn. Luật chỉ cho họ một khoản nhỏ.", [
    C("Theo đúng luật, báo cơ quan thu giữ", { counters: { akh_finds: 1 }, gamble: { p: 0.5, win: { log: "Hũ tiền về bảo tàng. Hai người kia nhận khoản thưởng nhỏ, không vui." }, lose: { log: "Họ biến mất cùng hũ tiền trước khi cơ quan đến." } } }, "Đúng luật, có thể mất cả hũ"),
    C("Bỏ tiền túi bù thêm cho họ", { money: -0.1, counters: { akh_finds: 1 }, flags: ["akh_paid_finders"] }, "Mất tiền, cổ vật về đúng chỗ"),
    C("Mời họ vào đoàn, dạy cách ghi tọa độ khi tìm thấy", { bw: -3, agency: 0.02, flags: ["akh_citizen_team", "akh_local_trust"] }, "Biến người săn đồ thành người cộng tác", { tier: "sovereign" })], 0)),
  daily(AK, "akh_dating", [26, 75], 10, () => T("Niên đại trái sách giáo khoa", "Kết quả đo niên đại của bạn sớm hơn câu chuyện trong sách giáo khoa gần năm trăm năm. Một vị lãnh đạo ngành gợi ý nên \"cân nhắc thời điểm công bố\".", [
    C("Công bố đúng số liệu", { counters: { akh_finds: 1 }, gamble: { p: 0.5, win: { know: 5, flags: ["akh_rewrote"], log: "Ba năm sau, sách giáo khoa được sửa một dòng." }, lose: { income_mult: 0.9, log: "Đoàn bạn không được cấp phép đào mùa sau." } } }, "Đúng sự thật, có thể mất giấy phép"),
    C("Cất số liệu, chờ thời điểm", { happy: -3, flags: ["akh_shelved"] }, "An toàn, sự thật nằm trong ngăn kéo"),
    C("Gửi mẫu cho hai phòng thí nghiệm độc lập", { money: -0.05, bw: -2, gamble: { p: 0.6, win: { flags: ["akh_rewrote"], log: "Cả hai phòng thí nghiệm ra cùng kết quả. Không ai cãi được nữa." }, lose: { log: "Một phòng ra kết quả khác. Câu hỏi vẫn bỏ ngỏ." } } }, "Chậm và tốn, nhưng không ai bác được", { tier: "awakened" })], 1)),
  daily(AK, "akh_rival", [24, 70], 9, (c, N) => { const r = role(c, "rival")!; return T("Ảnh hiện vật bị đăng trước", `${N(r)} ghé thăm hố đào của bạn một buổi chiều, rồi tuần sau đăng ảnh hiện vật kèm bài viết như thể mình phát hiện ra.`, [
    C("Lên tiếng công khai, kèm nhật ký hiện trường", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "bị vạch mặt bằng nhật ký hiện trường" }, gamble: { p: 0.6, win: { log: "Tạp chí đính chính, ghi tên đoàn bạn." }, lose: { log: "Người ta coi đó là chuyện cãi vã trong giới." } } }, "Đòi lại công, thêm một kẻ thù"),
    C("Mời cùng viết báo cáo chính thức", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "cùng đứng tên báo cáo khai quật" }, log: "Báo cáo chung được trích dẫn rộng." }, lose: { log: `${N(r)} bảo không cần.` } } }, "Chia công, có thể được đồng minh", { tier: "awakened" }),
    C("Kệ, lặng lẽ viết báo cáo đầy đủ", { counters: { akh_finds: 1 }, happy: -2 }, "Nhịn, nhưng để lại tài liệu thật")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(AK, "akh_cut", [24, 70], 8, (c) => T("Kinh phí bị cắt giữa mùa", `${c.econ_phase === "crisis" ? "Ngân sách thắt lại vì khủng hoảng. " : ""}Kinh phí mùa đào bị cắt khi đoàn mới đào được một nửa. Để hố mở qua mùa mưa thì các lớp đất sẽ sụt.`, [
    C("Bỏ tiền túi trả công cho đoàn", { money: -0.15, counters: { akh_finds: 1 }, flags: ["akh_self_funded"] }, "Mất tiền nhà, giữ được hố"),
    C("Lấp hố, chờ năm sau", { happy: -2, bw: 2 }, "Không mất tiền, mất một mùa"),
    C("Nhận tài trợ của một hãng bia, in logo lên áo đoàn", { money: 0.05, rel: -1, flags: ["akh_sponsor"] }, "Có tiền, mất chút nghiêm trang")], 0)),
  daily(AK, "akh_pocket", [26, 75], 9, (c) => T("Đồ vật trong túi áo", vary("aki", c.age, ["Cuối ngày, bạn thấy một sinh viên thực tập lén bỏ một đồng xu cổ vào túi áo. Em ấy là sinh viên giỏi nhất khóa.", "Một tình nguyện viên nước ngoài muốn mang một mảnh gốm nhỏ về nước \"làm kỷ niệm\"."]), [
    C("Báo nhà trường, cho nghỉ thực tập", { counters: { honest: 1 }, flags: ["akh_strict"] }, "Đúng luật, có thể chấm dứt một con đường"),
    C("Gọi riêng, cho tự đặt lại", { flags: ["akh_second_chance"], gamble: { p: 0.7, win: { log: "Món đồ được đặt lại. Về sau người ấy thành người cẩn thận nhất đoàn." }, lose: { log: "Một tháng sau, lại có thứ khác biến mất." } } }, "Cho cơ hội, có thể bị lợi dụng"),
    C("Lập luật mới: cả đoàn dốc túi, ghi sổ mỗi chiều", { bw: -2, rel: -1, flags: ["leader"] }, "Không nhắm vào ai, ai cũng phiền", { tier: "sovereign" })], 1)),
  daily(AK, "akh_guide", [26, 60], 99, () => T("Lời mời dẫn tour", "Một công ty du lịch mời bạn làm hướng dẫn viên chuyên về di tích, trả gấp ba lương viện. Bạn sẽ kể chuyện cổ vật cho khách, nhưng không bao giờ cầm bay nữa.", [
    C("Nhận, đổi nghề", { unflags: [life(AK)], custom: "become:tour_guide", flags: ["ex_archaeologist"] }, "Thu nhập gấp ba, rời hố đào"),
    C("Chỉ dẫn tour mùa mưa, khi không đào được", { money: 0.06, bw: -3, flags: ["akh_side_guide"] }, "Thêm tiền, hết mùa nghỉ"),
    C("Từ chối", { happy: 1 })], 2), (c) => c.broke || c.happy < 50),

  /* ---------- gia đình ---------- */
  cross(AK, "akh_family", [24, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Ba tháng vắng nhà mỗi năm", `Mùa đào năm nay trùng đúng ${c.country === "VN" ? "kỳ thi vào lớp mười" : "năm cuối cấp"} của ${N(k)}. ${N(k)} không nói gì, chỉ hỏi năm nay bạn đi mấy tháng.`, [
      C("Đi như mọi năm", { trust: { npc: k, delta: -0.15 }, counters: { akh_finds: 1 } }, "Giữ nghề, vắng mặt đúng lúc cần"),
      C("Bỏ một mùa đào, ở nhà", { trust: { npc: k, delta: 0.2 }, money: -0.1 }, "Mất một mùa, có mặt đúng lúc"),
      C("Cho con theo đoàn một tuần hè", { gamble: { p: 0.6, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} tự tay tìm được một mảnh gốm, giữ nó trên bàn học suốt nhiều năm.` }, lose: { trust: { npc: k, delta: 0.05 }, log: `${N(k)} bị muỗi đốt kín chân, nhưng vẫn kể với bạn bè cả tháng.` } } }, "Kéo con vào thế giới của mình", { tier: "awakened" })], 1, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Học cao để đi đào đất", `${N(p)} nói với họ hàng rằng bạn "làm ở viện", vì không biết giải thích sao chuyện con mình học hành bao năm để ngồi dưới hố đất cả ngày.${c.parent_sick ? ` Dạo này ${N(p)} hay ốm.` : ""}`, [
      C("Đưa bố mẹ đến thăm hố đào", { gamble: { p: 0.6, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} đứng lâu trước chiếc vò vỡ, rồi hỏi người xưa nấu gì trong đó.` }, lose: { trust: { npc: p, delta: -0.05 }, log: `${N(p)} kêu nắng, đòi về sớm.` } } }, "Có thể được hiểu, có thể chỉ thêm mệt"),
      C("Bỏ mùa đào năm nay, ở gần nhà", { trust: { npc: p, delta: 0.2 }, money: -0.1 }, "Mất một mùa, gần người thân"),
      C("Thôi, để họ nghĩ gì thì nghĩ", { happy: -2 })], 0, { npc: p });
  }),
];
