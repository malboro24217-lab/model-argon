/**
 * Thời sự B (63 thẻ): chính trị (trung lập), công nghệ, chiến tranh chạm vào dân thường, lao động,
 * văn hóa – thể thao – du lịch, an ninh khu phố, giáo dục và thi cử, làn sóng di cư.
 * Kiểm bằng: node --experimental-strip-types src/check-pack.ts src/engine/narrative/paths/news_b.ts --news
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, talentFlag, become, news } from "./kit.ts";

export const PACK_NEWS_B: Storylet[] = [
  /* ================= Chính trị (trung lập) ================= */
  news("nv_first_vote", [18, 24], 0.25, () => true, () => T("Lá phiếu đầu tiên", "Lần đầu tên bạn có trong danh sách cử tri. Điểm bỏ phiếu đặt ở trường tiểu học cũ, bàn ghế vẫn thấp như ngày xưa. Nhóm bạn trên mạng đã cãi nhau suốt ba hôm về hai ứng viên.", [
    C("Đọc kỹ chương trình hai bên rồi đi bầu", { know: 3, bw: -2, flags: ["civic_voter"] }, "Mất mấy buổi tối, lá phiếu có lý do"),
    C("Bầu theo ý bố mẹ cho nhanh", { rel: 2, counters: { follow_family: 1 } }, "Êm nhà, không phải nghĩ"),
    C("Đăng ký làm tình nguyện viên giám sát điểm bầu", { bw: -4, happy: 2, agency: 0.02, flags: ["poll_watcher"] }, "Mất trọn ngày, tận mắt thấy phiếu được đếm", { tier: "sovereign" }),
    C("Ở nhà ngủ bù", { health: 1, happy: -1, counters: { abstain: 1 } }, "Được nghỉ, đứng ngoài chuyện chung")], 1)),

  news("nv_campaign_offer", [30, 55], 0.1, (c) => c.reputation >= 40 || f(c, "leader") || f(c, "civic_voter"), () => T("Lời mời ra ứng cử", "Một nhóm cư dân gõ cửa nhà bạn lúc tối. Họ cần một người ra ứng cử vào hội đồng địa phương: ai cũng biết mặt, chưa dính vào phe nào. Chiến dịch kéo dài bốn tháng, tiền in tờ rơi họ chỉ góp được một nửa.", [
    C("Nhận lời, dồn tiền và thời gian cho chiến dịch", { money: -0.2, bw: -6, gamble: { p: 0.4, win: { ...become("politician"), log: "Bạn thắng, hơn người về nhì ba trăm phiếu." }, lose: { happy: -4, flags: ["lost_election"], log: "Bạn thua. Vài người trong nhóm vẫn muốn bạn thử lần sau." } } }, "Tốn tiền, có thể bước vào chính trường"),
    C("Không ra ứng cử, nhận đi vận động cho người khác", { bw: -3, rel: 3, flags: ["campaign_volunteer"] }, "Ít rủi ro, học được cách mọi thứ vận hành"),
    C("Từ chối, giữ đời mình yên ổn", { happy: 1, counters: { declined_office: 1 } }, "Yên ổn, để chỗ trống cho người khác")], 2)),

  news("nv_protest_square", [18, 45], 0.12, () => true, () => T("Quảng trường không ngủ", "Đã ba đêm, hàng nghìn người ngồi kín quảng trường trung tâm để phản đối một dự luật. Bên kia đường, một nhóm khác dựng loa ủng hộ. Trên đường đi làm, bạn phải vòng qua hai hàng rào chắn và một xe cứu thương đỗ sẵn.", [
    C("Ra quảng trường ngồi cùng họ", { happy: 2, health: -2, flags: ["joined_protest"], gamble: { p: 0.7, win: { rel: 3, log: "Bạn ngồi đến sáng, chia ổ bánh mì với một người lạ." }, lose: { money: -0.05, flags: ["detained_once"], log: "Bạn bị đưa về đồn ghi lời khai, sáng hôm sau mới được về." } } }, "Lên tiếng, có thể bị ghi tên"),
    C("Mang nước và băng gạc đến cho cả hai bên", { bw: -3, rel: 4, agency: 0.02, flags: ["street_medic"] }, "Không chọn phe, mất mấy đêm ngủ", { tier: "sovereign" }),
    C("Tránh xa, đi làm như mọi ngày", { money: 0.01, happy: -1, counters: { stayed_out: 1 } }, "An toàn, thấy mình đứng ngoài thời cuộc"),
    C("Gia nhập một nhóm vận động lâu dài", { ...become("activist"), bw: -4 }, "Một đêm thành nhiều năm, thu nhập mỏng")], 2), true),

  news("nv_vendor_law", [25, 65], 0.12, (c) => f(c, "life_street_vendor") || f(c, "job_market") || f(c, "shop_active"), (c) => T("Lệnh dọn vỉa hè", `${c.country === "VN" ? "Phường vừa ra quyết định lấy lại vỉa hè" : "Thành phố vừa thông qua quy định mới về vỉa hè"}: từ thứ Hai, không ai được bày hàng nếu không có giấy phép, mà giấy phép tốn khoảng hai tháng tiền lời. Đội trật tự đã dán thông báo khắp con phố của bạn.`, [
    C("Bỏ tiền làm giấy phép", { money: -0.15, flags: ["licensed_vendor"] }, "Mất vốn, yên tâm bán lâu dài"),
    C("Dọn vào ngõ, bán lén", { income_mult: 0.85, counters: { fines: 1 } }, "Không tốn phí, ít khách, sợ bị thu hàng"),
    C("Gom các hộ trên phố lập hội, xin khung giờ bán", { bw: -5, gamble: { p: 0.45, win: { flags: ["vendor_assoc"], income_mult: 1.05, log: "Chính quyền đồng ý cho bán từ năm giờ chiều đến chín giờ tối." }, lose: { happy: -3, log: "Lá đơn nằm trên bàn ba tháng không ai trả lời." } } }, "Tốn công, có thể đổi được luật chơi", { tier: "sovereign" })], 1)),

  news("nv_corruption_trial", [30, 70], 0.1, (c) => c.has_job, () => T("Phiên tòa của vị giám đốc sở", "Vị giám đốc từng ký duyệt mọi hợp đồng ở chỗ bạn làm bị đưa ra xét xử vì nhận hối lộ. Bên công tố mời bạn làm chứng: bạn từng thấy một phong bì được đẩy qua bàn. Đồng nghiệp khuyên bạn đừng dính vào.", [
    C("Ra tòa, kể đúng những gì đã thấy", { bw: -4, flags: ["trial_witness"], counters: { honest: 1 }, gamble: { p: 0.6, win: { rel: 3, log: "Lời khai của bạn được trích lại trong bản án." }, lose: { income_mult: 0.9, log: "Sau phiên tòa, bạn bị chuyển sang một bộ phận không ai muốn đến." } } }, "Đúng với lòng mình, có thể mất chỗ đứng"),
    C("Nói là không nhớ rõ", { happy: -3, counters: { honest: -1 } }, "Yên thân, mang theo một điều khó nói"),
    C("Viết lại mọi điều đã thấy, gửi một nhà báo", { bw: -2, agency: 0.02, flags: ["source_for_press"] }, "Không phải ra mặt, câu chuyện có thể đi xa hơn", { tier: "awakened" })], 1)),

  news("nv_child_election", [7, 11], 0.2, () => true, () => T("Ngày người lớn xếp hàng", "Sáng Chủ nhật, cả xóm xếp hàng trước cổng trường bạn học. Bố mẹ bảo là đi bầu cử. Tối đó, bữa cơm ồn hơn mọi ngày vì hai người không bầu cho cùng một người.", [
    C("Hỏi bố mẹ bầu cử để làm gì", { know: 2, happy: -1, flags: ["asked_about_vote"] }, "Biết thêm, bữa cơm có thể căng hơn"),
    C("Bày trò bầu lớp trưởng với các bạn", { happy: 3, bw: -1, counters: { leader_kid: 1 } }, "Vui, nhưng giận nhau với đứa thua"),
    C("Ăn nhanh cho xong rồi về phòng", { happy: -1, counters: { avoid_conflict: 1 } }, "Tránh được tiếng to, không hiểu gì thêm")], 2)),

  news("nv_family_vote_split", [35, 70], 0.1, (c) => !!role(c, "sibling"), (c, N) => { const s = role(c, "sibling")!; return T("Bữa cơm sau ngày bầu cử", `Kết quả bầu cử vừa công bố. Trong ${c.country === "VN" ? "bữa cơm giỗ" : "bữa cơm cuối tuần"}, ${N(s)} buông một câu chê những người bầu khác mình là "không có đầu óc". Bạn là một trong số đó. Cả mâm im lặng chờ.`, [
    C("Cãi lại cho ra lẽ", { happy: 1, trust: { npc: s, delta: -0.2 }, memory: { npc: s, tag: "HUMILIATED_ME", weight: -0.2, note: "cãi nhau về bầu cử giữa bữa cơm" } }, "Nói được lòng mình, sứt mẻ anh em"),
    C("Đổi chủ đề, rót thêm nước", { happy: -2, trust: { npc: s, delta: 0.05 } }, "Giữ hòa khí, nuốt lời"),
    C("Hẹn riêng một buổi, nghe xem vì sao", { bw: -3, gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.25 }, log: "Hai người vẫn không đồng ý, nhưng hiểu nhau hơn." }, lose: { trust: { npc: s, delta: -0.05 }, log: `${N(s)} không đến.` } } }, "Tốn một buổi, có thể chẳng đi đến đâu", { tier: "awakened" })], 1, { npc: s }); }),

  news("nv_whistle_docs", [25, 55], 0.08, (c) => c.has_job && (f(c, "job_office") || f(c, "job_tech") || f(c, "life_official") || f(c, "life_banker")), () => T("Tập hồ sơ trong máy in", "Ai đó bỏ quên một tập hồ sơ trong máy in chung. Trong đó, hai gói thầu xây trường học được giao cho cùng một công ty, giá cao gấp đôi. Chữ ký cuối cùng là của sếp trực tiếp của bạn.", [
    C("Gửi bản sao cho thanh tra", { flags: ["whistleblower"], gamble: { p: 0.5, win: { rel: 4, counters: { honest: 1 }, log: "Thanh tra vào cuộc. Gói thầu bị đình chỉ." }, lose: { income_mult: 0.8, happy: -4, log: "Tập hồ sơ quay lại bàn sếp. Bạn bị cắt thưởng cuối năm." } } }, "Làm điều đúng, có thể mất chỗ làm"),
    C("Trả lại chỗ cũ, coi như chưa thấy", { happy: -2, counters: { honest: -1 } }, "Yên thân, ngôi trường xây bằng giá gấp đôi"),
    C("Chụp lại, cất đi phòng thân", { bw: -2, flags: ["holds_evidence"] }, "Chưa làm gì, có một con bài trong tay", { tier: "awakened" })], 1)),

  news("nv_drink_drive_law", [20, 65], 0.15, () => true, () => T("Luật mới về rượu bia", "Luật mới phạt nặng người lái xe có hơi men, dù chỉ một ly. Tuần đầu, quán nhậu đầu ngõ vắng hẳn. Nhóm đồng nghiệp vẫn rủ bạn đi như mọi tối thứ Sáu.", [
    C("Vẫn đi, nhưng gọi xe về", { money: -0.02, rel: 2, counters: { drink: 1 } }, "Giữ bạn nhậu, tốn tiền xe"),
    C("Bỏ hẳn những buổi nhậu", { health: 3, rel: -3, counters: { drink: -1 }, flags: ["quit_drinking"] }, "Khỏe hơn, xa nhóm"),
    C("Rủ cả nhóm đổi sang đá bóng tối thứ Sáu", { health: 2, counters: { exercise: 1 }, gamble: { p: 0.5, win: { rel: 3, log: "Có sáu người ra sân. Mùa sau thành mười." }, lose: { rel: -1, log: "Chỉ có bạn và một người nữa đến." } } }, "Đổi nếp cả nhóm, có thể chỉ mình bạn", { tier: "sovereign" })], 0)),

  news("nv_youth_council", [14, 17], 0.15, () => true, () => T("Bầu ban đại diện học sinh", "Trường lần đầu cho học sinh tự bầu ban đại diện, được góp ý về căng tin và đồng phục. Hạn nộp đơn ứng cử là thứ Sáu. Đứa nổi tiếng nhất lớp đã đăng ký.", [
    C("Ra ứng cử, hứa đổi thực đơn căng tin", { bw: -3, gamble: { p: 0.4, win: { flags: ["student_rep", "leader"], happy: 4, log: "Bạn thắng sát nút. Món canh nhạt bị gạch khỏi thực đơn." }, lose: { happy: -3, log: "Bạn thua, nhưng ba mươi bạn đã bầu cho bạn." } } }, "Bớt giờ học, tập làm người đứng ra"),
    C("Viết khẩu hiệu cho bạn thân ra ứng cử", { happy: 2, counters: { kind: 1 } }, "Vui với bạn, không phải chịu thua"),
    C("Không quan tâm, lo học", { know: 2, counters: { study: 1 } }, "Điểm tốt hơn, không có tiếng nói")], 2)),

  /* ================= Công nghệ ================= */
  news("nv_first_phone", [10, 15], 0.3, () => true, () => T("Chiếc điện thoại đầu tiên", "Bỗng dưng cả lớp ai cũng có điện thoại thông minh. Bố mẹ mua cho bạn một chiếc cũ, màn hình nứt một góc, kèm lời dặn chỉ dùng sau giờ học.", [
    C("Cài trò chơi, chơi đến khuya", { happy: 4, health: -2, know: -1, counters: { screen: 1 } }, "Vui, mất ngủ"),
    C("Dùng để xem bài giảng và tra từ", { know: 3, happy: -1, counters: { read: 1 } }, "Học được nhiều, bị bạn bè chê chán"),
    C("Trả lại, bảo để dành cho em", { happy: -2, rel: 2, flags: ["gave_up_phone"] }, "Thương em, thấy mình lạc lõng ở lớp")], 0)),

  news("nv_net_cafe", [12, 17], 0.2, (c) => c.poor_country || c.gdp < 15000, () => T("Quán điện tử đầu hẻm", "Quán điện tử đầu hẻm mở từ sáu giờ sáng, một giờ chơi rẻ hơn một gói xôi. Đám bạn trốn tiết thể dục ra đó, chơi một trò đối kháng đang làm mưa làm gió.", [
    C("Trốn học đi cùng", { happy: 4, know: -3, money: -0.01, counters: { truant: 1 } }, "Có bạn, mất bài"),
    C("Chỉ chơi cuối tuần, tập cho thật giỏi", { bw: -2, happy: 1, flags: [talentFlag("esports")] }, "Tốn thời gian, có thể thành nghề"),
    C("Không đi", { know: 1, rel: -2, counters: { study: 1 } }, "Giữ bài vở, lẻ loi trong nhóm")], 0)),

  news("nv_ai_replace", [25, 55], 0.18, (c) => c.has_job && !c.farmer, (c) => T("Phần mềm làm thay cả phòng", "Công ty mua một hệ thống trí tuệ nhân tạo viết báo cáo, trả lời khách và soạn hợp đồng. Trong buổi họp sáng thứ Hai, giám đốc nói bộ phận của bạn sẽ giảm từ mười hai người xuống còn ba. Danh sách có vào cuối tháng.", [
    ...(c.age <= 45 ? [C("Bỏ tiền học lại, chuyển sang làm AI", { money: -0.3, bw: -8, gamble: { p: 0.5, win: { ...become("ai_engineer"), log: "Sau một năm học đêm, bạn được nhận vào chính đội viết ra hệ thống đó." }, lose: { custom: "job_lose", happy: -4, log: "Khóa học kết thúc, nhưng chỗ làm thì đã hết." } } }, "Tốn tiền và sức, có thể đổi nghề")] : []),
    C("Xin ở lại, nhận lương thấp hơn", { income_mult: 0.75, happy: -3, flags: ["kept_by_ai_cut"] }, "Giữ việc, mất giá"),
    C("Nghỉ, chạy giao hàng trong lúc tìm hướng", { ...become("shipper"), happy: -2 }, "Có tiền mỗi ngày, nghề nặng"),
    C("Học dùng chính hệ thống đó để làm nhanh gấp ba", { bw: -4, gamble: { p: 0.55, win: { income_mult: 1.2, flags: ["ai_power_user"], log: "Bạn là một trong ba người được giữ lại." }, lose: { custom: "job_lose", log: "Bạn làm nhanh hơn, nhưng tên vẫn nằm trong danh sách." } } }, "Không tốn tiền, đặt cược vào tốc độ", { tier: "awakened" })], 0), true),

  news("nv_ai_translator", [25, 60], 0.1, (c) => c.has_degree, () => T("Máy dịch giỏi hơn mình", "Mấy năm nay bạn kiếm thêm bằng việc dịch tài liệu buổi tối. Giờ khách gửi lại bản dịch của bạn kèm bản máy dịch, hỏi vì sao phải trả gấp hai mươi lần. Ba khách quen đã không quay lại.", [
    C("Hạ giá, nhận sửa bản máy dịch", { income_mult: 0.97, bw: -2, flags: ["post_editor"] }, "Còn việc, mất giá nghề"),
    C("Chuyển sang phiên dịch tại chỗ, việc máy chưa làm được", { bw: -4, money: -0.05, gamble: { p: 0.5, win: { income_mult: 1.1, flags: ["live_interpreter"], log: "Một hội nghị thuê bạn ba ngày, trả bằng cả tháng dịch giấy." }, lose: { happy: -3, log: "Ba tháng không có hội nghị nào gọi." } } }, "Tốn công làm lại tên tuổi, giá cao hơn", { tier: "awakened" }),
    C("Bỏ hẳn việc dịch", { income_mult: 0.95, bw: 4, counters: { quit_side_job: 1 } }, "Mất một nguồn thu, có lại buổi tối")], 0)),

  news("nv_ai_homework", [13, 17], 0.25, () => true, () => T("Bài văn trong mười giây", "Một ứng dụng trí tuệ nhân tạo viết xong bài văn nghị luận trong mười giây. Nửa lớp đã nộp bài như thế và được điểm cao. Cô giáo chưa phát hiện ra.", [
    C("Dùng nó, nộp bài cho kịp", { happy: 2, know: -3, secret: { tag: "CHEATED_EXAM", severity: 0.2, fuse_years: [1, 6], note: "nộp bài văn do máy viết" } }, "Điểm cao, kỹ năng viết không lên"),
    C("Tự viết, chịu điểm thấp hơn", { know: 4, happy: -2, counters: { honest: 1 } }, "Học thật, thua điểm bạn bè"),
    C("Hỏi máy gợi ý, rồi tự viết lại", { know: 2, bw: -2, flags: ["ai_literate"] }, "Mất thời gian hơn, biết cách dùng máy", { tier: "awakened" })], 0)),

  news("nv_viral_clip", [16, 40], 0.12, () => true, () => T("Mười triệu lượt xem qua một đêm", "Một người quay cảnh bạn làm một việc rất bình thường, rồi đăng lên mạng kèm dòng chú thích hài hước. Sáng ra, điện thoại bạn có bốn trăm tin nhắn lạ, và hai nhãn hàng hỏi giá quảng cáo.", [
    C("Lập kênh riêng, chớp thời cơ", { ...become("influencer"), bw: -4, happy: 2 }, "Có thể thành nghề, đời tư thành của chung"),
    C("Nhận một quảng cáo rồi thôi", { money: 0.04, counters: { viral_once: 1 } }, "Có ít tiền, chuyện qua nhanh"),
    C("Xin người đăng gỡ video", { happy: 1, flags: ["private_person"], gamble: { p: 0.5, win: { log: "Video bị gỡ. Một tuần sau không ai nhắc nữa." }, lose: { bw: -3, log: "Video đã bị tải lại ở hàng chục trang khác." } } }, "Giữ đời tư, bỏ lỡ một cơ hội")], 1)),

  news("nv_data_leak", [20, 70], 0.15, () => true, () => T("Thông tin cá nhân bị rao bán", "Báo đưa tin dữ liệu của hàng triệu khách hàng một nhà mạng bị lộ. Bạn tra thử: số điện thoại, ngày sinh, địa chỉ nhà đều có. Mỗi ngày bạn nhận hơn hai mươi cuộc gọi lạ.", [
    C("Đổi số, đổi hết mật khẩu", { bw: -3, money: -0.01, flags: ["privacy_careful"] }, "Mất mấy ngày báo lại cho mọi người"),
    C("Kệ, chặn từng số một", { bw: -2, happy: -2, counters: { spam_calls: 1 } }, "Không mất công, bị quấy rầy dài dài"),
    C("Cùng những người bị lộ khởi kiện công ty", { bw: -5, money: -0.03, gamble: { p: 0.35, win: { money: 0.1, flags: ["class_action"], log: "Công ty phải bồi thường và công khai xin lỗi." }, lose: { happy: -2, log: "Vụ kiện kéo dài hai năm rồi bị bác." } } }, "Tốn công, có thể buộc họ giữ dữ liệu cẩn thận", { tier: "sovereign" })], 1)),

  news("nv_deepfake", [20, 55], 0.07, () => true, () => T("Đoạn video không phải mình", "Một đoạn video lan trong nhóm đồng nghiệp: gương mặt bạn, giọng bạn, nói những lời bạn chưa từng nói. Nó được làm bằng máy, nhưng phải rất tinh mới nhận ra.", [
    C("Báo công an và đăng lời đính chính", { bw: -4, flags: ["deepfake_victim"], gamble: { p: 0.55, win: { rel: 2, log: "Người ta tìm ra tài khoản đã đăng. Đa số tin bạn." }, lose: { rel: -4, happy: -4, log: "Lời đính chính ít người xem hơn đoạn video." } } }, "Mất sức theo đuổi, có thể rửa được tiếng"),
    C("Im lặng chờ nó trôi đi", { happy: -5, rel: -2, counters: { reputation_hit: 1 } }, "Không tốn sức, để người khác tự đoán"),
    C("Làm video chỉ cách nhận ra đồ giả", { bw: -3, gamble: { p: 0.45, win: { rel: 4, flags: ["deepfake_educator"], log: "Video của bạn được nhiều trường học chia sẻ lại." }, lose: { happy: -2, log: "Người ta vẫn chỉ nhớ đoạn giả." } } }, "Biến chuyện xấu thành bài học, có thể vô ích", { tier: "sovereign" })], 1)),

  news("nv_online_class", [6, 11], 0.2, () => true, () => T("Lớp học trên màn hình", "Trường thí điểm học trực tuyến hai buổi một tuần. Nhà chỉ có một chiếc điện thoại, mà anh chị em cũng học cùng giờ. Cô giáo điểm danh bằng cách gọi từng bạn bật camera.", [
    C("Nhường máy, tự đọc sách", { know: -1, rel: 2, counters: { kind: 1 } }, "Thương anh chị em, hụt bài"),
    C("Sang nhà hàng xóm học nhờ", { know: 2, bw: -1, flags: ["neighbor_wifi"] }, "Đủ bài, ngại người"),
    C("Giành máy", { know: 2, rel: -3, counters: { selfish: 1 } }, "Được học, cả nhà khó chịu")], 0)),

  news("nv_gig_app", [18, 50], 0.15, (c) => !c.has_job || c.broke || c.scarcity, () => T("Ứng dụng giao hàng về thành phố", "Một ứng dụng giao hàng mới về thành phố, tuyển tài xế không cần bằng cấp, trả tiền theo từng chuyến. Tuần đầu họ thưởng gấp đôi cho người đăng ký sớm. Áo khoác màu nổi đã có mặt ở khắp các ngã tư.", [
    C("Đăng ký chạy giao hàng", { ...become("shipper"), health: -2 }, "Có tiền mỗi ngày, không có bảo hiểm"),
    C("Dùng xe nhà chở khách", { ...become("ride_hailing") }, "Kiếm khá hơn, xe nhanh xuống cấp"),
    C("Không đăng ký, tìm việc có hợp đồng", { bw: -2, counters: { job_search: 1 } }, "Ổn định hơn về sau, chưa có tiền ngay")], 2)),

  news("nv_social_drama", [16, 35], 0.15, (c) => !!role(c, "childhood_friend"), (c, N) => { const fr = role(c, "childhood_friend")!; return T("Bài đăng ẩn ý", `${N(fr)} đăng một dòng trạng thái về "người bạn hai mặt". Ai trong nhóm cũng hiểu là nói bạn. Bên dưới có sáu mươi bình luận và một tấm ảnh chụp tin nhắn cũ của bạn.`, [
    C("Đăng bài đáp trả", { happy: 1, rel: -2, memory: { npc: fr, tag: "HUMILIATED_ME", weight: -0.25, note: "cãi nhau công khai trên mạng" } }, "Hả giận, mất bạn"),
    C("Nhắn riêng, hẹn gặp nói chuyện", { bw: -2, gamble: { p: 0.55, win: { trust: { npc: fr, delta: 0.2 }, log: "Hai người ngồi quán ba tiếng. Bài đăng bị xóa." }, lose: { trust: { npc: fr, delta: -0.1 }, log: `${N(fr)} đã chặn bạn.` } } }, "Phải nuốt tự ái, có thể cứu được tình bạn", { tier: "awakened" }),
    C("Rời nhóm, khóa trang cá nhân một tháng", { happy: -2, bw: 3, trust: { npc: fr, delta: -0.1 } }, "Yên tai, để người khác kể chuyện thay mình")], 2, { npc: fr }); }),

  news("nv_screen_kid", [30, 55], 0.15, (c) => c.kids_school > 0 && !!role(c, "child"), (c, N) => { const k = role(c, "child")!; return T("Đứa trẻ và màn hình", `${N(k)} ôm máy tính bảng từ lúc tan học đến nửa đêm. Điểm toán tụt hai bậc. Khi bạn cầm lấy máy, ${N(k)} gào khóc như vừa mất thứ quý nhất.`, [
    C("Khóa máy, đặt giờ cứng", { trust: { npc: k, delta: -0.15 }, flags: ["screen_rules"] }, "Con giận, nề nếp vào khuôn"),
    C("Cất bớt điện thoại của chính mình, chơi với con", { bw: -3, happy: 2, trust: { npc: k, delta: 0.2 }, counters: { screen: -1 } }, "Tốn thời gian của mình, sửa từ gốc", { tier: "sovereign" }),
    C("Kệ, đứa nào bây giờ chẳng thế", { bw: 2, counters: { neglect: 1 } }, "Đỡ mệt bây giờ, lo về sau")], 2, { npc: k }); }),

  news("nv_livestream_sell", [20, 50], 0.12, () => true, () => T("Cơn sốt bán hàng trực tiếp", "Ai cũng đang bán hàng qua phát trực tiếp. Bà hàng xóm chốt được ba trăm đơn mỗi tối chỉ với chiếc điện thoại và một chiếc đèn tròn. Bạn có một mặt hàng quen tay từ quê.", [
    C("Mua đèn, mở phiên bán đầu tiên", { money: -0.03, ...become("ecommerce") }, "Vốn nhỏ, phải đứng trước máy mỗi tối"),
    C("Bán ké qua kênh người khác, chia hoa hồng", { money: 0.03, counters: { side_hustle: 1 } }, "Ít rủi ro, phần lời nhỏ"),
    C("Không bán", { happy: 1, bw: 1, counters: { passed_trend: 1 } }, "Giữ sức, nhìn người khác kiếm tiền")], 2)),

  news("nv_videocall_elder", [60, 85], 0.2, (c) => c.kids_alive > 0, () => T("Cuộc gọi có hình", "Cháu cài cho bạn một ứng dụng gọi video. Chỉ cần bấm vào ảnh là thấy mặt con cháu ở xa. Nhưng nút nào cũng bé tí, và bạn đã ba lần gọi nhầm cho người lạ.", [
    C("Học cho bằng được", { bw: -3, know: 2, happy: 3, flags: ["elder_online"] }, "Mệt đầu, gần con cháu hơn"),
    C("Nhờ cháu gọi giùm mỗi tuần", { rel: 2, counters: { depend: 1 } }, "Đỡ học, phải chờ người khác"),
    C("Thôi, gọi điện thường là đủ", { happy: -1, bw: 1, counters: { old_ways: 1 } }, "Quen tay, ít được thấy mặt cháu")], 1)),

  news("nv_family_chat_rumor", [40, 75], 0.12, (c) => !!role(c, "sibling"), (c, N) => { const s = role(c, "sibling")!; return T("Tin đồn trong nhóm gia đình", `${N(s)} chuyển vào nhóm chat gia đình một tin rằng rau ngoài chợ bị tẩm thuốc độc, kèm một tấm ảnh mờ. Hai người cô đã bỏ không mua rau nữa. Bạn tra thử thì thấy đó là tin bịa từ nhiều năm trước.`, [
    C("Đăng bằng chứng tin giả ngay trong nhóm", { know: 1, trust: { npc: s, delta: -0.1 }, flags: ["fact_checker"] }, "Đúng, nhưng làm người kia mất mặt"),
    C("Nhắn riêng cho người gửi", { bw: -1, gamble: { p: 0.6, win: { counters: { kind: 1 }, trust: { npc: s, delta: 0.1 }, log: `${N(s)} tự gỡ tin và nhắn xin lỗi cả nhóm.` }, lose: { trust: { npc: s, delta: -0.1 }, log: `${N(s)} bảo bạn học nhiều nên coi thường người khác.` } } }, "Giữ thể diện cho người ta, chậm hơn", { tier: "awakened" }),
    C("Im lặng cho êm", { happy: -1, counters: { silent: 1 } }, "Êm nhà, tin giả vẫn chạy")], 2, { npc: s }); }),

  news("nv_robot_line", [22, 55], 0.12, (c) => f(c, "job_factory") || c.worker, () => T("Cánh tay máy thay ca đêm", "Xưởng lắp sáu cánh tay máy vào dây chuyền của bạn. Một cánh tay làm bằng bốn người, không nghỉ giữa ca. Quản đốc nói ai học được cách vận hành sẽ được giữ lại; khóa học buổi tối, không lương.", [
    C("Học khóa vận hành", { bw: -5, gamble: { p: 0.6, win: { income_mult: 1.15, flags: ["robot_operator"], log: "Bạn là người đầu tiên đỗ. Lương tăng một bậc." }, lose: { happy: -3, log: "Bạn trượt bài thi, vẫn ở ca cũ." } } }, "Mệt thêm mấy tháng, có thể lên bậc"),
    C("Nhận tiền đền bù, nghỉ", { money: 0.3, happy: -2, custom: "job_lose" }, "Có tiền ngay, mất việc"),
    C("Cùng tổ đề nghị chia lại ca thay vì cắt người", { bw: -3, gamble: { p: 0.4, win: { flags: ["shared_shifts"], rel: 4, log: "Xưởng đồng ý giảm giờ thay vì cắt người." }, lose: { income_mult: 0.9, log: "Đề nghị bị bác. Tên bạn bị ghi lại." } } }, "Giữ việc cho nhiều người, mình bị để ý", { tier: "sovereign" })], 0)),

  news("nv_stream_teen", [15, 22], 0.1, () => true, () => T("Phòng ngủ thành trường quay", "Một bạn cùng lớp kiếm tiền bằng cách phát trực tiếp khi chơi game, mỗi tối vài nghìn người xem. Bạn có giọng nói dí dỏm và một máy tính cũ. Kỳ thi còn sáu tuần.", [
    C("Mở kênh, phát mỗi tối", { ...become("streamer"), know: -3, health: -1 }, "Có thể thành nghề, điểm thi tụt"),
    C("Để sau kỳ thi rồi tính", { know: 2, counters: { delayed_dream: 1 } }, "Chắc bài, có thể lỡ thời"),
    C("Dựng video cho bạn kia, chia tiền", { money: 0.03, know: 1, flags: ["video_editor"] }, "Ít nổi, học được nghề sau màn hình")], 1)),

  /* ================= Chiến tranh chạm vào dân thường ================= */
  news("nv_conscription", [18, 26], 0.08, () => true, () => T("Giấy gọi nhập ngũ", "Xung đột ở vùng biên đã kéo dài nửa năm. Sáng nay, một tờ giấy gọi nhập ngũ có tên bạn được đưa đến tận nhà. Hạn trình diện là mười bốn ngày nữa.", [
    C("Lên đường", { ...become("soldier"), happy: -2 }, "Làm nghĩa vụ, đời rẽ sang hướng khác"),
    C("Làm đơn xin hoãn để học xong", { bw: -3, gamble: { p: 0.5, win: { flags: ["draft_deferred"], log: "Bạn được hoãn thêm hai năm." }, lose: { ...become("soldier"), log: "Đơn bị bác. Bạn lên đường muộn hơn một tháng." } } }, "Có thể được hoãn, có thể không"),
    C("Rời khỏi đất nước", { ...become("refugee"), money: -0.3, close_doors: ["return_home"] }, "Tránh được, có thể không về được nữa")], 0), true),

  news("nv_war_child", [6, 11], 0.05, (c) => c.poor_country || c.gdp < 12000, () => T("Ba lô của một đứa trẻ", "Tiếng nổ phía bên kia đồi gần hơn mọi đêm. Bố mẹ đánh thức bạn lúc ba giờ sáng, bảo mỗi người chỉ được mang một ba lô. Xe tải của làng đang chờ ở đầu đường.", [
    C("Mang theo sách vở", { ...become("refugee"), know: 2, happy: -2, flags: ["kept_books"] }, "Giữ được việc học, bỏ lại đồ chơi"),
    C("Mang thú bông và ảnh gia đình", { ...become("refugee"), happy: 2, flags: ["kept_photos"] }, "Giữ được kỷ niệm, mất sách vở"),
    C("Ôm con chó nhỏ theo", { ...become("refugee"), happy: 3, health: -1, flags: ["saved_dog"] }, "Có bạn đồng hành, đường đi khó hơn")], 0), true),

  news("nv_displaced", [25, 60], 0.06, (c) => c.poor_country || c.gdp < 15000, () => T("Lệnh sơ tán", "Giao tranh đã đến cách thị trấn hai mươi cây số. Loa phát thanh yêu cầu dân rời đi trong ba ngày. Nhà, ruộng, cửa hàng của bạn đều ở đây; khu tạm cư thì cách bốn giờ xe.", [
    C("Đưa cả nhà đi theo đoàn sơ tán", { ...become("refugee"), money: -0.4, health: 1 }, "Giữ được người, mất gần hết của"),
    C("Gửi gia đình đi, mình ở lại giữ nhà", { rel: -3, bw: -6, gamble: { p: 0.6, win: { flags: ["held_home"], log: "Giao tranh dừng lại ở bờ sông. Ngôi nhà còn nguyên." }, lose: { health: -10, money: -0.5, flags: ["held_home"], log: "Bạn phải chạy giữa đêm, tay trắng." } } }, "Có thể giữ được nhà, có thể mất cả hai"),
    C("Về ở nhờ họ hàng trên thành phố", { money: -0.15, rel: 2, income_mult: 0.8, flags: ["displaced_to_city"] }, "Đỡ khổ hơn khu tạm cư, sống nhờ người khác")], 0), true),

  news("nv_hosting_refugees", [30, 70], 0.08, (c) => !c.poor_country || c.gdp >= 8000, () => T("Những người từ bên kia biên giới", "Hàng nghìn người chạy khỏi chiến sự ở nước láng giềng đổ về thành phố. Nhà thi đấu gần nhà bạn thành chỗ ngủ tạm. Một nhóm thiện nguyện hỏi nhà nào có phòng trống cho một gia đình bốn người ở vài tháng.", [
    C("Nhận một gia đình về ở", { money: -0.1, bw: -4, happy: 3, flags: ["hosted_refugees"], counters: { kind: 2 } }, "Tốn tiền và riêng tư, cứu một nhà"),
    C("Góp tiền và quần áo", { money: -0.03, counters: { kind: 1 } }, "Giúp được ít, đời mình không xáo trộn"),
    C("Ký đơn phản đối đặt khu tạm trú gần nhà", { rel: -2, flags: ["opposed_shelter"] }, "Giữ yên khu phố, mang tiếng với nhiều người"),
    C("Mở lớp dạy tiếng cho trẻ con của họ", { bw: -3, know: 2, rel: 3, flags: ["taught_refugees"] }, "Mất mọi buổi tối, giúp chúng có tương lai", { tier: "sovereign" })], 1), true),

  news("nv_parent_front", [12, 17], 0.07, (c) => !!(role(c, "father") ?? role(c, "mother")), (c, N) => { const p = (role(c, "father") ?? role(c, "mother"))!; return T("Lá thư từ mặt trận", `${N(p)} được gọi ra mặt trận từ đầu năm. Mỗi tháng có một lá thư, chữ mỗi lần một ngắn hơn. Ở nhà, việc nặng giờ dồn cả lên vai bạn.`, [
    C("Bớt giờ học, làm việc nhà và trông em", { know: -3, rel: 3, trust: { npc: p, delta: 0.2 }, flags: ["grew_up_early"] }, "Đỡ cho gia đình, hụt việc học"),
    C("Viết thư dài gửi đi mỗi tuần", { happy: 2, bw: -1, trust: { npc: p, delta: 0.15 }, counters: { letters: 1 } }, "Gần nhau hơn, mỗi lần chờ thư là một lần lo"),
    C("Không viết, sợ phải đọc thư trả lời", { happy: -3, trust: { npc: p, delta: -0.1 }, counters: { avoid: 1 } }, "Đỡ đau bây giờ, có thể ân hận về sau")], 1, { npc: p }); }),

  news("nv_ceasefire", [25, 75], 0.06, (c) => c.poor_country || f(c, "life_refugee") || f(c, "displaced_to_city") || f(c, "held_home"), (c) => {
    const uprooted = f(c, "life_refugee") || f(c, "displaced_to_city") || f(c, "held_home");
    if (uprooted) return T("Đình chiến", "Đài phát thanh đọc tin hai bên ký thỏa thuận ngừng bắn. Người ta đổ ra đường, có người khóc, có người lặng im. Con đường về quê đã mở lại, nhưng không ai biết ngôi làng giờ còn những gì.", [
      C("Về quê dựng lại nhà", { money: -0.3, happy: 4, custom: "return_home", flags: ["rebuilt_home"] }, "Về với đất cũ, bắt đầu lại từ đầu"),
      C("Ở lại nơi đã quen, gửi tiền về giúp làng", { money: -0.05, rel: 2, flags: ["helped_rebuild"] }, "Giữ được cuộc sống mới, quê thành nơi xa"),
      C("Tham gia nhóm tìm người thân thất lạc", { bw: -5, rel: 5, happy: 2, flags: ["reunite_volunteer"] }, "Mất nhiều năm, nối lại nhiều gia đình", { tier: "sovereign" })], 0);
    return T("Ngày súng ngừng nổ", "Cuộc giao tranh ở vùng biên kết thúc bằng một thỏa thuận ngừng bắn. Hàng nghìn người sơ tán chuẩn bị trở về, và thị trấn bạn sống nằm ngay trên đường họ đi qua. Trường học vùng biên cần người dựng lại.", [
      C("Đi làm tình nguyện dựng lại trường", { bw: -4, health: -2, rel: 3, flags: ["rebuilt_school"] }, "Mất một mùa làm ăn, để lại một ngôi trường"),
      C("Góp tiền một lần", { money: -0.05, counters: { kind: 1 } }, "Giúp được chút ít, không đổi gì đời mình"),
      ...(c.age <= 50 ? [C("Chở hàng lên vùng biên khi đường vừa mở", { ...become("border_trader"), money: -0.1 }, "Kiếm được, có người bảo ăn trên đổ nát")] : [C("Mở quán cơm cho người đi qua", { money: 0.05, bw: -3, flags: ["postwar_kitchen"] }, "Có thu nhập, làm từ sáng đến khuya")])], 1);
  }, true),

  news("nv_child_draft", [42, 65], 0.07, (c) => c.kids_teen > 0 && !!role(c, "child"), (c, N) => { const k = role(c, "child")!; return T("Tên con trong danh sách nhập ngũ", `Xung đột ở vùng biên chưa dứt. Tên ${N(k)} có trong danh sách gọi nhập ngũ đợt tới. Một người quen nói có cách lo cho được miễn, với một khoản bằng nửa năm thu nhập.`, [
    C("Lo tiền để con được miễn", { money: -0.5, trust: { npc: k, delta: 0.1 }, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [2, 10], note: "chạy cho con được miễn nhập ngũ" } }, "Giữ con ở nhà, mang một bí mật"),
    C("Để con tự quyết", { bw: -3, trust: { npc: k, delta: 0.25 }, flags: ["child_chose_service"] }, "Tôn trọng con, có thể phải tiễn con đi", { tier: "awakened" }),
    C("Gửi con đi học ở nước ngoài", { money: -0.6, trust: { npc: k, delta: 0.05 }, flags: ["child_abroad"] }, "Tốn kém, xa con nhiều năm"),
    C("Tiễn con lên đường, hứa viết thư mỗi tháng", { happy: -4, flags: ["child_in_service"], promise: { to: k, what: "viết thư cho con mỗi tháng khi con đi lính", years: 2 } }, "Đúng luật, đêm nào cũng mất ngủ")], 3, { npc: k }); }),

  /* ================= Lao động, đình công, công đoàn ================= */
  news("nv_strike_factory", [18, 55], 0.14, (c) => f(c, "job_factory") || c.worker, () => T("Ngày cả xưởng ngừng máy", "Công ty cắt tiền ăn ca và tăng định mức thêm một phần năm. Sáng thứ Hai, hơn hai nghìn công nhân đứng ngoài cổng, không ai vào ca. Tổ trưởng nhìn danh sách, rồi nhìn bạn.", [
    C("Đứng ngoài cổng cùng mọi người", { money: -0.04, rel: 3, flags: ["striker"], gamble: { p: 0.55, win: { income_mult: 1.08, log: "Sau năm ngày, công ty trả lại tiền ăn ca và lùi định mức." }, lose: { custom: "job_lose", log: "Công ty cho nghỉ việc những người đứng hàng đầu. Có tên bạn." } } }, "Đòi được quyền lợi, có thể mất việc"),
    C("Vào ca như thường", { money: 0.02, rel: -4, flags: ["crossed_line"] }, "Giữ lương, bị đồng nghiệp xa lánh"),
    C("Đứng ra làm người đại diện đàm phán", { bw: -6, flags: ["leader", "labor_rep"], gamble: { p: 0.45, win: { income_mult: 1.12, rel: 5, log: "Bạn ngồi bàn đàm phán ba đêm. Bản thỏa thuận có chữ ký của bạn." }, lose: { custom: "job_lose", rel: 3, log: "Một tháng sau, bạn bị cho nghỉ với lý do đi muộn." } } }, "Có thể đổi luật chơi, lộ mặt trước công ty", { tier: "sovereign" })], 1), true),

  news("nv_union_vote", [22, 60], 0.1, (c) => c.has_job && !!role(c, "first_boss"), (c, N) => { const b = role(c, "first_boss")!; return T("Lá phiếu lập công đoàn", `Một nhóm đồng nghiệp vận động lập công đoàn ở nơi bạn làm, cuối tuần sẽ bỏ phiếu. Chiều qua, ${N(b)} gọi riêng bạn vào phòng, nói người "biết điều" sẽ được xét tăng lương sớm.`, [
    C("Bỏ phiếu thuận, công khai", { flags: ["union_member"], rel: 3, trust: { npc: b, delta: -0.2 } }, "Đứng cùng tập thể, mất lòng sếp"),
    C("Nghe lời sếp, không đi bỏ phiếu", { income_mult: 1.05, rel: -3, trust: { npc: b, delta: 0.15 } }, "Được tăng lương, bị coi là người của sếp"),
    C("Đề nghị sếp ngồi nói chuyện với cả nhóm", { bw: -3, gamble: { p: 0.4, win: { flags: ["union_member"], memory: { npc: b, tag: "WIN_WIN_DEAL", weight: 0.2, note: "ngồi chung bàn với nhóm lập công đoàn" }, log: "Sếp đồng ý đối thoại với nhóm mỗi tháng một lần." }, lose: { trust: { npc: b, delta: -0.15 }, log: `${N(b)} bảo bạn ngây thơ.` } } }, "Có thể bắc cầu, có thể mất lòng cả hai bên", { tier: "sovereign" })], 1, { npc: b }); }),

  news("nv_teacher_strike", [7, 11], 0.1, () => true, () => T("Hai tuần không có cô giáo", "Giáo viên cả vùng nghỉ dạy để đòi trả lương đúng hạn. Cổng trường khóa hai tuần. Cô chủ nhiệm của bạn cầm tấm biển đứng ở cổng, gật đầu chào khi bạn đi qua.", [
    C("Tự đọc trước sách năm sau", { know: 3, happy: -1, flags: ["self_learner"] }, "Học được thêm, mất kỳ nghỉ bất ngờ"),
    C("Chơi thỏa thích cả hai tuần", { happy: 4, know: -2, counters: { play: 1 } }, "Vui, quay lại lớp thì quên bài"),
    C("Vẽ một tấm biển tặng cô", { happy: 2, rel: 2, flags: ["drew_for_teacher"] }, "Cô cảm động, bố mẹ thì không thích lắm")], 1)),

  news("nv_transit_strike", [20, 65], 0.12, (c) => c.has_job && c.gdp > 8000, () => T("Thành phố không có xe buýt", "Tài xế xe buýt và tàu điện đình công đòi tăng lương. Tuyến bạn đi làm ngừng hẳn. Đi bộ mất hai tiếng, gọi xe thì giá gấp ba ngày thường.", [
    C("Đi bộ, coi như ủng hộ họ", { health: 2, bw: -3, flags: ["supported_strikers"] }, "Mệt, thấy lòng yên"),
    C("Đi chung xe với đồng nghiệp, chia tiền", { money: -0.01, rel: 3, counters: { carpool: 1 } }, "Tốn ít tiền, có thêm bạn"),
    C("Xin làm ở nhà, chịu bị trừ lương", { money: -0.03, happy: 1, counters: { remote: 1 } }, "Đỡ khổ đường, mất tiền")], 1)),

  news("nv_min_wage", [20, 60], 0.15, (c) => c.has_job, (c) => {
    const boss = f(c, "own_business") || f(c, "life_factory_owner") || f(c, "life_restaurateur");
    if (boss) return T("Quỹ lương phải tăng", "Luật mới nâng lương tối thiểu thêm một phần năm. Quỹ lương của bạn tăng ngay từ tháng sau, trong khi giá bán thì chưa thể nâng. Kế toán đặt lên bàn ba phương án.", [
      C("Giữ đủ người, chịu lời ít đi", { money: -0.15, rel: 3, flags: ["fair_employer"] }, "Mất lời, giữ được người giỏi"),
      C("Cắt bớt hai người", { money: 0.05, rel: -3, counters: { honest: -1 } }, "Giữ lời, người ở lại làm gánh thêm"),
      C("Tăng giá, nói rõ lý do với khách", { gamble: { p: 0.5, win: { money: 0.05, flags: ["open_pricing"], log: "Khách quen ở lại. Có người còn khen." }, lose: { money: -0.1, log: "Khách chuyển sang quán bên cạnh." } } }, "Thẳng thắn, có thể mất khách", { tier: "awakened" })], 0);
    return T("Lương tối thiểu tăng", "Luật mới nâng lương tối thiểu thêm một phần năm. Cùng tháng đó, chủ cắt phụ cấp đi lại và tiền chuyên cần, nên lương thực nhận gần như cũ.", [
      C("Chấp nhận, không muốn rắc rối", { happy: -2, counters: { swallowed: 1 } }, "Yên chuyện, thiệt thòi kéo dài"),
      C("Gửi đơn lên thanh tra lao động", { bw: -3, gamble: { p: 0.5, win: { money: 0.08, flags: ["labor_complaint_won"], log: "Thanh tra buộc chủ trả lại phụ cấp." }, lose: { income_mult: 0.95, log: "Đơn không được giải quyết. Chủ biết ai gửi." } } }, "Có thể đòi được, có thể bị để ý"),
      C("Đi tìm chỗ trả đúng luật", { bw: -2, custom: "job_switch" }, "Đổi chỗ làm, mất thâm niên")], 0);
  }),

  news("nv_lying_flat", [22, 35], 0.15, (c) => c.has_job && (c.rat_race || c.happy < 50), () => T("Trào lưu nằm yên", "Trên mạng, người trẻ rủ nhau \"nằm yên\": làm vừa đủ, không tăng ca, không chạy theo thăng chức. Đồng nghiệp ngồi cạnh bạn vừa tuyên bố sẽ về đúng năm giờ chiều mỗi ngày.", [
    C("Làm theo: hết giờ là về", { happy: 4, health: 2, income_mult: 0.92, flags: ["lying_flat"] }, "Sống nhẹ hơn, chậm thăng tiến"),
    C("Tăng ca nhiều hơn, giành chỗ người khác bỏ", { income_mult: 1.1, health: -3, counters: { overtime: 1 } }, "Lên nhanh, cạn sức"),
    C("Bỏ việc, đi đâu đó một năm", { money: -0.3, happy: 5, agency: 0.03, custom: "job_lose", flags: ["gap_year"] }, "Tự do, quay lại khó hơn", { tier: "sovereign" })], 1)),

  news("nv_rider_protest", [20, 55], 0.15, (c) => f(c, "life_shipper") || f(c, "life_ride_hailing") || f(c, "job_driver"), () => T("Tắt ứng dụng một ngày", "Hãng tăng phần trăm ăn chia trên mỗi chuyến mà không báo trước. Trong nhóm chat tài xế, người ta hẹn nhau tắt ứng dụng cả ngày thứ Tư và tập trung trước văn phòng hãng.", [
    C("Tắt máy, đến văn phòng hãng", { money: -0.01, rel: 3, flags: ["rider_protest"], gamble: { p: 0.4, win: { income_mult: 1.05, log: "Hai tuần sau, hãng lùi mức ăn chia về như cũ." }, lose: { income_mult: 0.95, log: "Hãng không đổi gì. Tài khoản của vài người bị khóa." } } }, "Đứng cùng anh em, mất một ngày tiền"),
    C("Chạy cả ngày, hôm đó ít người nên nhiều đơn", { money: 0.02, rel: -3, counters: { scab: 1 } }, "Kiếm đậm một ngày, bị anh em ghét"),
    C("Cùng vài người lập hợp tác xã tài xế", { bw: -5, money: -0.05, gamble: { p: 0.3, win: { flags: ["driver_coop"], income_mult: 1.1, log: "Một năm sau, hợp tác xã có hai trăm tài xế." }, lose: { happy: -3, log: "Không đủ khách, nhóm giải tán sau ba tháng." } } }, "Tự làm chủ, có thể thất bại", { tier: "sovereign" })], 1)),

  /* ================= Văn hóa, thể thao, du lịch ================= */
  news("nv_football_final", [8, 70], 0.3, () => true, (c) => {
    const text = c.country === "VN"
      ? "Đội tuyển vào chung kết một giải lớn. Cả phố kéo tivi ra vỉa hè, cờ đỏ phủ kín. Nếu thắng, người ta sẽ đổ ra đường đi bão đến sáng."
      : "Đội tuyển quốc gia vào chung kết một giải đấu lớn. Quán xá chật kín, cờ treo khắp các ban công. Nếu thắng, cả thành phố sẽ thức đến sáng.";
    if (c.age < 18) return T("Đêm chung kết", text, [
      C("Xin bố mẹ cho ra đường xem cùng mọi người", { happy: 4, health: -1, flags: ["final_night"] }, "Nhớ cả đời, sáng mai đi học ngủ gật"),
      C("Ở nhà xem cùng ông bà", { happy: 2, rel: 2, counters: { family_night: 1 } }, "Ấm cúng, lỡ không khí ngoài phố"),
      C("Tự vẽ cờ, bán cho hàng xóm", { money: 0.01, bw: -1, counters: { hustle: 1 } }, "Có ít tiền, không xem được trọn trận")], 1);
    return T("Đêm chung kết", text, [
      C("Ra đường cùng cả phố", { happy: 5, health: -2, rel: 2, flags: ["final_night"] }, "Một đêm nhớ đời, sáng mai mệt rã"),
      C("Đặt cược một khoản vào tỉ số", { counters: { gamble: 1 }, gamble: { p: 0.3, win: { money: 0.15, log: "Bạn đoán trúng tỉ số." }, lose: { money: -0.1, log: "Đội thua, ví bạn cũng thua." } } }, "Có thể được, dễ mất"),
      C("Bán cờ và áo đấu ở góc phố", { money: 0.08, bw: -3, counters: { hustle: 1 } }, "Kiếm một mẻ, không được xem trọn trận")], 0);
  }, true),

  news("nv_tourism_boom", [25, 60], 0.15, () => true, (c) => T("Khách du lịch tràn về", "Một bộ phim nước ngoài quay vài cảnh ở thị trấn bạn sống. Chỉ một năm sau, mỗi ngày có hàng chục xe khách. Nhà bạn ở ngay con dốc người ta hay đứng chụp ảnh.", [
    C("Vay tiền sửa nhà thành chỗ cho khách ở", { custom: "borrow:0.5", income_mult: 1.2, flags: ["homestay"] }, "Lời lớn nếu khách ở lại, nợ nếu khách đi"),
    C("Giữ nguyên, sống như cũ", { happy: -1, counters: { kept_quiet_life: 1 } }, "Yên ổn, chịu ồn và giá cả tăng"),
    C("Bán nhà cho người làm khách sạn", { money: 1.0, happy: -3, flags: ["sold_family_house"] }, "Có tiền lớn, mất chốn cũ"),
    ...(c.age <= 45 ? [C("Học ngoại ngữ, đi làm hướng dẫn viên", { ...become("tour_guide"), bw: -3 }, "Đổi nghề, xa nhà nhiều ngày")] : [])], 1)),

  news("nv_pop_wave", [12, 17], 0.2, () => true, () => T("Vũ đạo khắp sân trường", "Một nhóm nhạc nước ngoài làm cả lứa tuổi bạn phát cuồng. Giờ ra chơi, sân trường thành chỗ tập nhảy. Một trung tâm mở lớp nhảy, học phí bằng tiền ăn sáng nửa tháng.", [
    C("Đăng ký lớp nhảy", { money: -0.02, health: 2, happy: -1, flags: [talentFlag("dancer")] }, "Tốn tiền nhà, có thể thành nghề"),
    C("Tập theo video với nhóm bạn", { happy: 3, rel: 2, counters: { dance: 1 } }, "Vui, không đi đến đâu"),
    C("Không theo phong trào", { know: 1, rel: -1, counters: { own_taste: 1 } }, "Giữ gu riêng, hơi lạc nhóm")], 1)),

  news("nv_film_shoot", [16, 40], 0.08, () => true, () => T("Đoàn phim về phố", "Một đoàn phim thuê cả con phố của bạn trong ba tuần. Họ cần người đóng vai quần chúng, trả mỗi ngày một ít và một suất cơm hộp. Đạo diễn hay dừng lại xem ai biết diễn.", [
    C("Đi đóng quần chúng, cố lọt vào mắt đạo diễn", { bw: -2, gamble: { p: 0.25, win: { ...become("actor"), log: "Đạo diễn cho bạn một câu thoại, rồi một vai nhỏ trong phim sau." }, lose: { money: 0.02, log: "Bạn có mặt trong phim đúng hai giây, quay lưng." } } }, "Mất ba tuần, có thể bước vào nghề diễn"),
    C("Cho đoàn thuê nhà làm bối cảnh", { money: 0.04, bw: -3, flags: ["house_in_film"] }, "Có tiền, nhà bừa bộn ba tuần"),
    C("Làm phụ việc hậu trường", { money: 0.03, know: 2, flags: ["film_crew_once"] }, "Học được nghề, không ai biết mặt")], 2)),

  news("nv_heritage", [30, 70], 0.1, () => true, (c) => T("Phố cũ thành di sản", "Khu phố cũ nơi bạn lớn lên được công nhận là di sản. Biển báo mới dựng, nhà cũ không được sửa nếu chưa xin phép, giá thuê mặt tiền tăng gấp ba. Nghề cũ của ông bà bỗng thành thứ khách muốn xem tận mắt.", [
    ...(c.age <= 60 ? [C("Học lại nghề cũ của ông bà", { ...become("artisan"), money: -0.05 }, "Giữ nghề cũ, thu nhập chưa chắc")] : []),
    C("Cho thuê mặt tiền, chuyển ra ngoài", { money: 0.4, happy: -2, flags: ["rented_out_home"] }, "Có tiền đều, xa phố cũ"),
    C("Lập hội cư dân giữ nếp sống phố cũ", { bw: -4, rel: 4, flags: ["heritage_keeper"] }, "Mất nhiều buổi họp, phố còn là phố", { tier: "sovereign" })], 1)),

  news("nv_hometown_medal", [9, 15], 0.15, () => true, () => T("Tấm huy chương của người cùng xóm", "Một chị lớn lên cách nhà bạn hai con hẻm vừa giành huy chương ở một đại hội thể thao lớn. Cả xóm treo băng rôn. Sáng hôm sau, sân vận động chật kín trẻ con đến xin tập.", [
    C("Xin tập chạy mỗi sáng", { health: 3, happy: -1, bw: -1, flags: [talentFlag("runner")] }, "Dậy sớm mỗi ngày, có thể thành vận động viên"),
    C("Xin vào lớp võ", { health: 2, happy: -1, flags: [talentFlag("boxer")] }, "Đau tay đau chân, có thể thành võ sĩ"),
    C("Cắt ảnh chị ấy dán vào vở rồi thôi", { happy: 2, counters: { dreamer: 1 } }, "Vui một thời, không tốn sức")], 2)),

  news("nv_overtourism", [35, 75], 0.1, (c) => !c.poor_country || c.gdp > 6000, () => T("Dãy phố thành nhà cho khách thuê", "Mười căn trên dãy phố của bạn đã thành chỗ cho khách du lịch thuê ngắn ngày. Vali kéo lộc cộc lúc hai giờ sáng. Một công ty gửi thư đề nghị mua nhà bạn với giá cao hơn thị trường một phần ba.", [
    C("Bán, chuyển ra ngoại ô", { money: 1.5, happy: -3, rel: -2, flags: ["sold_to_hotels"] }, "Có một khoản lớn, xa hàng xóm cũ"),
    C("Ở lại, chịu ồn", { happy: -2, health: -1, counters: { stubborn: 1 } }, "Giữ nhà, mất giấc ngủ"),
    C("Cùng hàng xóm kiến nghị giới hạn nhà cho thuê", { bw: -4, gamble: { p: 0.4, win: { rel: 5, flags: ["housing_rule"], log: "Thành phố ra quy định riêng cho khu phố của bạn." }, lose: { happy: -2, log: "Kiến nghị bị gác lại đến nhiệm kỳ sau." } } }, "Tốn công, có thể giữ được cả khu phố", { tier: "sovereign" })], 1)),

  /* ================= An ninh khu phố, tội phạm ================= */
  news("nv_theft_wave", [20, 65], 0.15, () => true, (c) => T("Mùa mất trộm", `${c.country === "VN" ? "Trong một tháng, khu phố mất bảy chiếc xe máy, có chiếc bị dắt ra từ trong nhà. Cuộc họp tổ dân phố" : "Trong một tháng, khu phố mất bảy chiếc xe, hai nhà bị cạy cửa giữa ban ngày. Cuộc họp cư dân"} bàn chuyện thuê bảo vệ, mỗi nhà góp một khoản hằng tháng.`, [
    C("Góp tiền thuê bảo vệ", { money: -0.03, flags: ["paid_watch"] }, "Mất tiền đều, yên tâm hơn"),
    C("Lắp khóa và camera riêng cho nhà mình", { money: -0.05, bw: 1, counters: { self_reliant: 1 } }, "Chắc nhà mình, mặc kệ nhà khác"),
    C("Lập nhóm hàng xóm thay phiên nhau canh", { bw: -4, rel: 4, flags: ["neighborhood_watch"] }, "Không tốn tiền, mất ngủ vài đêm mỗi tháng", { tier: "sovereign" }),
    C("Nhận làm bảo vệ ca đêm cho khu phố", { ...become("security_guard"), health: -2 }, "Có thêm thu nhập, đảo lộn giấc ngủ")], 0)),

  news("nv_walk_home", [8, 11], 0.12, () => true, () => T("Không được đi bộ về một mình", "Trường gửi giấy báo: dạo này có người lạ hay đứng ở cổng trường, phụ huynh nên đón con. Bố mẹ bạn tan làm lúc sáu giờ. Bạn phải ngồi chờ ở phòng bảo vệ gần hai tiếng.", [
    C("Ngồi làm bài trong lúc chờ", { know: 3, happy: -2, counters: { study: 1 } }, "Học thêm được, buồn chán"),
    C("Xin đi về cùng nhóm bạn cùng xóm", { happy: 2, rel: 2, bw: -1, flags: ["walk_group"] }, "Tự do hơn, bố mẹ lo"),
    C("Làm quen với chú bảo vệ", { happy: 2, know: -1, flags: ["guard_friend"] }, "Có người lớn để ý, ít học hơn")], 0)),

  news("nv_gang_recruit", [14, 17], 0.08, (c) => c.poor_country || c.family_wealth < 0.4, () => T("Lời mời từ đám anh lớn", "Đám thanh niên ở bãi xe đầu chợ lúc nào cũng có tiền tiêu và xe đẹp. Một người trong đám hỏi bạn có muốn \"đi việc\" với họ không, mỗi tối được trả bằng cả tuần tiền tiêu vặt. Ai cũng biết họ đi đòi nợ thuê.", [
    C("Nhận lời", { ...become("gangster"), money: 0.03, happy: 1 }, "Có tiền và đám đông, khó quay đầu"),
    C("Từ chối thẳng", { flags: ["refused_gang"], gamble: { p: 0.6, win: { happy: 1, log: "Họ nhún vai, không hỏi lại nữa." }, lose: { health: -3, happy: -2, log: "Mấy tuần sau, bạn bị chặn đường trêu chọc trên lối về." } } }, "Giữ mình, có thể bị gây khó"),
    C("Kể với thầy cô và người lớn", { rel: -2, bw: -1, flags: ["told_adult"], gamble: { p: 0.5, win: { log: "Công an đến bãi xe. Đám ấy tản đi chỗ khác." }, lose: { happy: -3, log: "Không ai làm gì. Đám kia biết bạn là người mách." } } }, "Có thể giúp cả xóm, có thể thành kẻ mách lẻo")], 1)),

  news("nv_protection_money", [25, 60], 0.08, (c) => f(c, "own_business") || f(c, "shop_active") || f(c, "life_restaurateur") || f(c, "life_street_vendor"), () => T("Phí giữ trật tự đầu tháng", "Hai người lạ ghé cửa hàng, nói từ tháng này phải nộp \"phí giữ trật tự\", mỗi tháng bằng tiền lời ba ngày. Hai cửa hàng bên cạnh đã nộp. Họ để lại một số điện thoại.", [
    C("Nộp cho yên", { money: -0.1, counters: { protection_paid: 1 } }, "Yên thân, mất tiền đều"),
    C("Báo công an", { bw: -3, gamble: { p: 0.5, win: { flags: ["reported_racket"], log: "Ba tuần sau, hai người kia bị bắt." }, lose: { money: -0.15, health: -2, log: "Một đêm, kính cửa hàng bị đập vỡ." } } }, "Đúng luật, có thể bị trả đũa"),
    C("Rủ cả dãy cùng không nộp, cùng làm đơn", { bw: -4, gamble: { p: 0.45, win: { rel: 5, flags: ["shop_alliance"], log: "Mười hai cửa hàng ký tên. Không ai đến thu nữa." }, lose: { money: -0.1, log: "Một nửa dãy rút tên vì sợ. Bạn thành người bị để ý." } } }, "Đông thì mạnh, đứng đầu thì dễ bị nhắm", { tier: "sovereign" })], 0)),

  news("nv_witness_snatch", [20, 70], 0.1, () => true, () => T("Vụ giật túi trước mắt", "Một người phóng xe qua, giật túi xách của một cụ bà đang chờ đèn đỏ. Cụ ngã xuống vỉa hè. Bạn nhìn rõ biển số xe.", [
    C("Đưa cụ đi viện, rồi đến đồn khai báo", { bw: -4, money: -0.02, flags: ["helped_victim"], counters: { kind: 1 } }, "Mất cả buổi, giúp được người"),
    C("Đuổi theo", { gamble: { p: 0.35, win: { rel: 4, flags: ["street_hero"], log: "Bạn giữ lại được chiếc túi. Kẻ giật bỏ xe chạy bộ." }, lose: { health: -6, flags: ["chase_injury"], log: "Bạn ngã xe ở ngã tư, rách khuỷu tay." } } }, "Có thể lấy lại túi, có thể bị thương"),
    C("Đi tiếp, đã có người khác dừng lại", { happy: -2, counters: { bystander: 1 } }, "Không mất gì, lòng hơi gợn")], 2)),

  /* ================= Giáo dục, thi cử ================= */
  news("nv_exam_reform", [15, 17], 0.2, () => true, (c) => T("Đề thi đổi cách ra", `${c.country === "VN" ? "Kỳ thi tốt nghiệp năm nay" : "Kỳ thi cuối cấp năm nay"} đổi hẳn cách ra đề: bỏ học thuộc, thêm câu hỏi tình huống. Thầy cô cũng lúng túng. Các trung tâm luyện thi mở lớp "đề mới" với giá gấp đôi.`, [
    C("Đi học lớp luyện đề mới", { money: -0.03, know: 3, bw: -3, counters: { cram: 1 } }, "Chắc dạng bài, tốn tiền nhà và sức"),
    C("Tự học theo nhóm với bạn bè", { know: 2, rel: 2, flags: ["study_group"] }, "Không tốn tiền, có thể học lệch"),
    C("Đọc thêm sách, học để hiểu chứ không để thi", { know: 4, happy: 1, gamble: { p: 0.5, win: { flags: ["deep_learner"], log: "Đề thi hỏi đúng những điều bạn đã tự tìm hiểu." }, lose: { happy: -3, log: "Điểm thi không như mong đợi, dù bạn hiểu bài hơn nhiều người." } } }, "Hiểu sâu, điểm thi là canh bạc", { tier: "awakened" })], 0)),

  news("nv_cram_school", [10, 15], 0.25, () => true, () => T("Lớp học thêm buổi tối", "Cả lớp đi học thêm ba tối một tuần, ngay tại nhà thầy dạy chính. Ai không đi thì đến bài kiểm tra mới gặp những dạng bài chưa từng được dạy. Học phí bằng một phần tư thu nhập tháng của nhà.", [
    C("Xin bố mẹ cho đi học thêm", { money: -0.03, know: 3, happy: -2, counters: { cram: 1 } }, "Theo kịp lớp, nhà thêm khoản chi"),
    C("Không đi, tự học ở nhà", { know: 1, happy: 1, flags: ["no_tutoring"] }, "Đỡ tốn, dễ bị điểm kém"),
    C("Rủ mấy bạn không đi thêm lập nhóm học", { know: 2, rel: 2, bw: -1, flags: ["study_group"] }, "Không tốn tiền, phải tự lo bài khó")], 0)),

  news("nv_exam_leak", [17, 18], 0.15, () => true, () => T("Đề thi lộ trước một đêm", "Mười một giờ đêm trước kỳ thi quan trọng nhất, một tấm ảnh lan trong các nhóm chat: nghe nói là đề thi môn sáng mai. Bạn bè gửi cho bạn ba lần.", [
    C("Mở ra xem", { secret: { tag: "CHEATED_EXAM", severity: 0.4, fuse_years: [1, 8], note: "xem đề thi bị lộ trước một đêm" }, gamble: { p: 0.5, win: { know: 1, log: "Đề thật giống đến tám phần. Bạn làm bài trôi chảy." }, lose: { happy: -3, log: "Đề lộ là đề giả. Bạn mất một đêm học sai bài." } } }, "Có thể được điểm, mang một bí mật"),
    C("Không mở, đi ngủ", { health: 2, counters: { honest: 1 } }, "Ngủ ngon, có thể thua người đã xem"),
    C("Chụp màn hình gửi cho nhà trường", { bw: -2, flags: ["reported_leak"], gamble: { p: 0.5, win: { rel: 1, log: "Đề được thay ngay trong đêm." }, lose: { rel: -3, log: "Bạn bè biết bạn báo, cả nhóm chat chặn bạn." } } }, "Giữ kỳ thi công bằng, có thể mất bạn", { tier: "sovereign" })], 1)),

  news("nv_school_merger", [30, 55], 0.1, (c) => c.kids_school > 0, () => T("Điểm trường bị sáp nhập", "Trường gần nhà bị sáp nhập vào một trường lớn cách tám cây số cho \"tinh gọn\". Con bạn phải dậy sớm hơn một tiếng. Giáo viên cũ của con chuyển đi nơi khác.", [
    C("Đưa đón con mỗi ngày", { bw: -4, money: -0.02, rel: 2, counters: { school_run: 1 } }, "Mất hai giờ mỗi ngày, con đỡ vất vả"),
    C("Chuyển con sang trường tư gần nhà", { money: -0.15, flags: ["private_school"] }, "Tốn nhiều tiền, con đỡ đường xa"),
    C("Cùng phụ huynh xin giữ lại điểm trường", { bw: -4, gamble: { p: 0.35, win: { rel: 5, flags: ["saved_school"], log: "Điểm trường được giữ lại cho ba khối nhỏ." }, lose: { happy: -2, log: "Quyết định đã ký. Đơn của phụ huynh được \"ghi nhận\"." } } }, "Tốn công, có thể giữ được trường cho cả xóm", { tier: "sovereign" })], 0)),

  news("nv_scholarship_open", [18, 24], 0.1, (c) => c.know >= 50 || c.has_degree, () => T("Học bổng không cần chứng minh tài chính", "Một chương trình học bổng mới bỏ yêu cầu chứng minh tài chính, chỉ xét bài luận và phỏng vấn. Hạn nộp là sáu tuần nữa. Bạn chưa từng đi xa hơn nơi mình sinh ra.", [
    C("Nộp hồ sơ, viết luận suốt sáu tuần", { bw: -5, gamble: { p: 0.3, win: { ...become("student_abroad"), log: "Thư báo đỗ đến vào một sáng thứ Ba." }, lose: { happy: -3, flags: ["scholar_tried"], log: "Bạn trượt vòng phỏng vấn, nhưng giữ lại được bài luận." } } }, "Mất sáu tuần, có thể đổi cả đời"),
    C("Ở lại học trong nước, đi làm sớm", { money: 0.05, counters: { stay_home: 1 } }, "Chắc ăn, không biết thế giới ngoài kia")], 1)),

  /* ================= Làn sóng di cư ================= */
  news("nv_village_empty", [18, 35], 0.2, (c) => c.poor_country || c.gdp < 10000, (c) => T("Làng chỉ còn người già", `${c.country === "VN" ? "Ra Tết" : "Sau mùa gặt"}, lại thêm một chuyến xe đưa bảy thanh niên trong làng đi làm xa. Trường làng gộp hai lớp làm một vì không đủ học trò. Ở bến xe, một công ty môi giới phát tờ rơi tuyển người đi làm nước ngoài.`, [
    C("Vay tiền phí, nộp hồ sơ đi làm nước ngoài", { custom: "borrow:0.5|become:labor_export" }, "Thu nhập gấp mấy lần, mang nợ và xa nhà"),
    C("Lên thành phố tìm việc", { money: -0.05, happy: -1, flags: ["left_home"] }, "Gần nhà hơn, chật vật nơi mới"),
    C("Ở lại, nhận làm ruộng của những nhà đã đi", { bw: -3, income_mult: 1.1, agency: 0.02, flags: ["stayed_village"] }, "Giữ làng, làm việc của ba người", { tier: "sovereign" })], 1), true),

  news("nv_brain_drain", [24, 40], 0.12, (c) => c.has_degree, (c) => T("Lớp đại học đi gần hết", "Trong nhóm bạn đại học, mười hai trên hai mươi người đã ra nước ngoài làm việc. Một người gửi cho bạn đường dẫn ứng tuyển vào công ty của họ, lương gấp bốn. Bố mẹ bạn mỗi năm một yếu đi.", [
    C("Nộp đơn, nếu đỗ thì đi", { gamble: { p: 0.5, win: { money: 0.3, income_mult: 1.6, rel: -3, flags: ["went_abroad_work", "seen_world"], log: "Bạn nhận việc. Chuyến bay vào cuối quý." }, lose: { happy: -2, log: "Bạn qua ba vòng, trượt vòng cuối." } } }, "Thu nhập cao, xa bố mẹ"),
    C("Ở lại, tìm chỗ tốt nhất trong nước", { rel: 2, counters: { stayed: 1 } }, "Gần gia đình, lương thấp hơn bạn bè"),
    C("Ở lại, nhận làm từ xa cho công ty nước ngoài", { bw: -4, gamble: { p: 0.45, win: { income_mult: 1.3, flags: ["remote_worker"], log: "Bạn làm ca đêm theo giờ bên kia, lương gấp đôi." }, lose: { health: -2, log: "Sau nửa năm, công ty cắt hợp đồng từ xa." } } }, "Có cả hai, đổi bằng giấc ngủ", { tier: "awakened" }),
    ...(c.age <= 30 ? [C("Đi học thạc sĩ ở nước ngoài trước", { ...become("student_abroad"), money: -0.2 }, "Tốn tiền vài năm, mở cửa đi xa hơn")] : [])], 1)),

  news("nv_migrants_arrive", [30, 65], 0.12, (c) => !c.poor_country && c.has_job, () => T("Những đồng nghiệp mới từ xa", "Công ty tuyển hai mươi lao động từ một nước nghèo hơn, trả thấp hơn mặt bằng. Trong phòng nghỉ, có người nói họ \"cướp việc\". Một người mới ngồi một mình với hộp cơm, không ai hỏi đến.", [
    C("Ngồi ăn cùng, chỉ việc cho họ", { rel: 3, counters: { kind: 1 }, flags: ["mentored_migrant"] }, "Có bạn mới, bị vài người dị nghị"),
    C("Ký đơn đòi ưu tiên người bản xứ", { rel: -1, income_mult: 1.02, flags: ["signed_local_first"] }, "Giữ chỗ cho mình, đổ lỗi cho người yếu hơn"),
    C("Đề nghị trả cùng một thang lương cho tất cả", { bw: -3, gamble: { p: 0.45, win: { income_mult: 1.05, rel: 4, flags: ["equal_pay_push"], log: "Công ty buộc phải dùng chung một thang lương." }, lose: { happy: -1, log: "Đề nghị bị hoãn, nhưng người ta bắt đầu bàn về nó." } } }, "Bảo vệ cả hai bên, bị sếp để ý", { tier: "sovereign" })], 1)),

  news("nv_return_wave", [30, 60], 0.1, (c) => c.migrated || f(c, "life_labor_export") || f(c, "life_domestic_abroad") || f(c, "life_student_abroad"), () => T("Làn sóng về nước", "Nước sở tại siết thị thực và việc làm. Chuyến bay về nào cũng đầy những người như bạn, mang vài chiếc vali và một khoản tiết kiệm. Ở quê, người ta đang kể về những người về mở xưởng, mở quán.", [
    C("Về nước, mở việc riêng", { ...become("returnee"), money: -0.2 }, "Về với gia đình, đặt cược vốn tích góp"),
    C("Ở lại, nhận việc nặng ít ai làm", { income_mult: 0.9, health: -3, counters: { stayed_abroad: 1 } }, "Giữ được chỗ đứng, sức khỏe hao mòn"),
    C("Ở lại, gửi tiền về góp vốn với người thân", { money: -0.3, flags: ["remote_investor"], gamble: { p: 0.5, win: { money: 0.4, log: "Quán ở quê có lãi từ năm thứ hai." }, lose: { happy: -3, log: "Vốn góp tan sau một năm." } } }, "Không phải về, phải tin người ở nhà", { tier: "awakened" })], 1)),

  news("nv_left_behind", [6, 11], 0.15, (c) => c.poor_country || c.gdp < 10000, () => T("Bố mẹ đi làm xa", "Bố mẹ bạn đi làm ở một thành phố cách hai ngày đường, mỗi năm về một lần. Bạn ở với ông bà. Tối thứ Bảy nào cũng có một cuộc gọi mười phút qua chiếc điện thoại của bà.", [
    C("Kể hết chuyện ở trường mỗi lần gọi", { happy: 2, rel: 2, counters: { calls: 1 } }, "Gần bố mẹ hơn, cúp máy lại nhớ"),
    C("Không nói gì, giận vì bố mẹ đi", { happy: -3, flags: ["left_behind_anger"] }, "Đỡ phải khóc, xa cách dần"),
    C("Giúp ông bà việc nhà cho họ đỡ mệt", { health: -1, rel: 3, flags: ["grew_up_early"] }, "Hiểu chuyện sớm, bớt thời gian chơi")], 0)),
];
