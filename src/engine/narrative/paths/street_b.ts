/**
 * Gói "Đời thường đặc biệt" B: BẢO VỆ · NGƯỜI NỘI TRỢ TOÀN THỜI GIAN · NGƯỜI LÀM NGHỀ TANG LỄ · NGƯỜI CHĂM BỆNH.
 * Theo chuẩn của singer.ts và docs/content-guide.md. Tiền tố id: grd_ · hmk_ · fnr_ · cgv_.
 * Bộ đếm riêng: grd_trust, grd_study · hmk_self, hmk_dep · fnr_grace, fnr_weight · cgv_bond, cgv_load.
 * Tang lễ và bệnh tật kể bằng sự dịu dàng của người làm nghề, không tả chi tiết thân thể.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;

/* =====================================================================
 * BẢO VỆ — tiền tố grd_
 * ===================================================================== */
const G = "security_guard";

const GRD_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(G, "grd_t_gate", [10, 15], () => true, () => T("Đứa trẻ nhớ mặt cả trường", "Bạn tự nhận việc đứng cổng trường mỗi chiều. Sau một học kỳ, bạn nhớ mặt gần hết phụ huynh đến đón, nhớ cả màu xe của từng người. Bác bảo vệ già bảo bạn có con mắt của người giữ cửa, hỏi bạn có muốn phụ bác trực giờ tan học không.", [
    C("Phụ bác trực cổng mỗi chiều", { flags: [talentFlag(G)], counters: { talents_seen: 1 }, rel: 2, know: -1 }, "Mất giờ chơi và giờ học, mở một con đường"),
    C("Cảm ơn bác, chiều còn đi học thêm", { know: 2, counters: { talents_seen: 1 } }, "Học hành chắc hơn, con mắt ấy để yên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(G, "grd_d_tower", [18, 55], () => true, (c) => T("Tuyển bảo vệ tòa nhà", c.poor_country
    ? "Một khu chung cư mới cần mười hai bảo vệ. Ca mười hai tiếng, làm hai ngày nghỉ một, tiền đồng phục trừ vào tháng lương đầu. Người nộp đơn đứng tràn ra vỉa hè."
    : "Một công ty an ninh tuyển người cho tòa văn phòng ba mươi tầng. Ca đêm trả thêm một phần tư, học khóa phòng cháy hai tuần, không cần bằng cấp.", [
    C("Nhận ca đêm cho lương cao hơn", { ...become(G), counters: { doors_seen: 1 }, health: -2, money: 0.03 }, "Có việc ngay, đảo ngược giấc ngủ"),
    C("Nộp đơn, xin ca ngày", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(G), log: "Họ còn đúng một chỗ ca ngày ở cổng chính. Bạn nhận bộ đồng phục hơi rộng." }, lose: { happy: -2, log: "Ca ngày đã đủ người. Họ bảo khi nào thiếu sẽ gọi." } } }, "Giữ được giấc ngủ, khó được nhận"),
    C("Thôi, tìm việc khác", { counters: { doors_seen: 1 } }, "Không trói mình vào chòi gác, chưa có việc")], 0)),
  door(G, "grd_d_layoff", [35, 60], () => true, (c) => T("Tin tuyển dụng không hỏi tuổi", `Xưởng nơi bạn làm mười mấy năm đóng cửa. Ở tuổi ${c.age}, gần như tin tuyển dụng nào cũng ghi "dưới ba mươi lăm". Tin duy nhất không hỏi tuổi là tuyển bảo vệ cho một khu công nghiệp ngoại thành.`, [
    C("Nhận làm bảo vệ, đi làm ngay tuần sau", { ...become(G), counters: { doors_seen: 1 }, happy: -2 }, "Có lương đều, nuốt chút tự ái"),
    C("Bỏ một năm học nghề sửa điện lạnh", { counters: { doors_seen: 1 }, money: -0.2, know: 4, flags: ["grd_retrained"] }, "Tốn tiền tiết kiệm, có thể có nghề tốt hơn"),
    C("Chạy giao hàng tạm cho qua", { counters: { doors_seen: 1 }, custom: "become:shipper", health: -2 }, "Tự do giờ giấc, nắng mưa ngoài đường")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(G, 1, 1, (c) => T("Ca đêm đầu tiên", "Hai giờ sáng, một người đàn ông say đứng trước cổng, không có thẻ cư dân, nói mình ở tầng mười tám và đòi vào. Quy định ghi rõ: không thẻ thì gọi người nhà xuống đón. Ông ta quát rằng mình đóng phí quản lý để nuôi bạn.", [
    C("Giữ quy định, gọi người nhà xuống đón", { counters: step(c, G), flags: ["grd_by_book"], happy: -2 }, "Đúng việc, bị ghét ngay đêm đầu"),
    C("Thấy mặt quen quen, cho lên", { counters: step(c, G), gamble: { p: 0.6, win: { counters: { grd_trust: 1 }, log: "Sáng hôm sau ông ấy đi xuống, ngượng ngùng dúi cho bạn hộp bánh." }, lose: { money: -0.03, flags: ["grd_reprimand"], log: "Ông ta không ở tòa này. Một chiếc xe đạp dưới hầm biến mất, bạn bị trừ lương." } } }, "Được lòng người, rủi ro tính lên đầu bạn"),
    C("Mời ông ngồi chòi uống nước chờ tỉnh", { counters: step(c, G), bw: -2, gamble: { p: 0.5, win: { counters: { grd_trust: 1 }, flags: ["grd_patient"], log: "Bốn giờ sáng ông tỉnh, nhớ ra mình ở tòa bên cạnh, cảm ơn rồi đi." }, lose: { happy: -2, log: "Ông ngủ gục trên ghế đến sáng. Bạn lau sàn chòi gác trước giờ giao ca." } } }, "Mất cả đêm, có thể giải được êm", { tier: "awakened" })], 0)),
  beat(G, 2, 3, (c) => T("Sổ tuần tra bốn vòng", `Công ty đề nghị bạn làm tổ trưởng ca đêm: thêm một phần năm lương, quản sáu người. ${f(c, "grd_by_book") ? "Họ bảo chọn bạn vì bạn làm đúng quy định. " : ""}Điều kiện: đêm nào cũng ký sổ đủ bốn vòng tuần tra hai mươi tư tầng, dù ca chỉ có ba người và thang bộ tầng mười bị khóa từ năm ngoái.`, [
    C("Nhận, ký đủ bốn vòng như mọi người", { counters: step(c, G, { honest: -1 }), income_mult: 1.2, flags: ["grd_signed_logs"], secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 8], note: "ký khống sổ tuần tra ca đêm" } }, "Lên lương, chữ ký có thể quay lại"),
    C("Nhận, nhưng ghi đúng số vòng thật", { counters: step(c, G, { honest: 1 }), flags: ["grd_honest_logs"], gamble: { p: 0.45, win: { income_mult: 1.15, log: "Quản lý nhăn mặt nhưng giữ bạn lại. Tháng sau ca được thêm một người." }, lose: { log: "Hai tháng sau, họ đưa người khác lên tổ trưởng. Bạn về lại cổng chính." } } }, "Sạch sổ, có thể mất chức"),
    C("Rủ cả ca ký đơn đòi đủ người", { counters: step(c, G), agency: 0.03, gamble: { p: 0.4, win: { flags: ["grd_union"], income_mult: 1.15, counters: { grd_trust: 1 }, log: "Công ty thêm hai người cho ca đêm. Anh em gọi bạn là tổ trưởng dù chưa có giấy." }, lose: { income_mult: 0.9, flags: ["grd_marked"], log: "Hai người ký đơn bị điều đi công trường xa. Tên bạn vào danh sách khó bảo." } } }, "Đứng chung thì vững, đứng đầu thì dễ bị đuổi", { tier: "sovereign" })], 0)),
  beat(G, 3, 4, (c) => T("Đêm mất trộm ở tầng mười hai", `Một căn hộ tầng mười hai bị mất trộm đúng ca bạn. Camera hành lang trống bốn mươi phút vì ổ cứng đầy, bạn đã báo hỏng hai lần. ${f(c, "grd_signed_logs") ? "Sổ tuần tra đêm ấy có chữ ký của bạn: bốn vòng, đủ cả. " : ""}${f(c, "grd_union") ? "Anh em trong ca nói sẵn sàng làm chứng cho bạn. " : ""}Ban quản lý muốn bạn khai camera vẫn chạy bình thường.`, [
    C("Khai theo ban quản lý", { counters: step(c, G, { honest: -1 }), flags: ["grd_covered"], income_mult: 1.05, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 7], note: "khai sai về camera trong vụ mất trộm tầng mười hai" } }, "Giữ việc, lời khai sai nằm trong hồ sơ"),
    C("Nộp hai tờ báo hỏng camera cho điều tra viên", { counters: step(c, G, { honest: 1 }), gamble: { p: (f(c, "grd_union") ? 0.65 : 0.45) - (f(c, "grd_signed_logs") ? 0.1 : 0), win: { flags: ["grd_vindicated"], counters: { grd_trust: 2 }, log: "Điều tra viên ghi nhận. Ban quản lý bị phạt, cả tòa biết tên bạn." }, lose: { income_mult: 0.8, flags: ["grd_demoted"], log: "Bạn bị chuyển xuống trông bãi xe tầng hầm, lương giảm." } } }, "Nói thật, có thể bị đẩy xuống hầm"),
    C("Xin nghỉ trước khi bị đổ lỗi", { counters: step(c, G), ...leave(G), flags: ["ex_guard"], happy: -3 }, "Thoát vụ việc, mất chỗ làm")], 1)),
  beat(G, 4, 5, (c) => {
    if (f(c, "grd_covered")) return T("Cậu bảo vệ mới bị đuổi", "Năm năm sau, một cậu bảo vệ trẻ bị đuổi vì một vụ mất trộm khác, cũng vào đêm camera hỏng. Ban quản lý dẫn lại lời khai năm xưa của bạn: camera chưa từng hỏng, chỉ có người lơ là. Cậu ấy ngồi ở chòi gác, gom đồ vào một túi ni lông.", [
      C("Ra làm chứng, khai lại sự thật năm xưa", { counters: step(c, G, { honest: 2 }), custom: "apologize", income_mult: 0.75, flags: ["grd_confessed"] }, "Mất lòng công ty, gỡ được cho một người"),
      C("Im lặng, coi như chuyện của cậu ấy", { counters: step(c, G, { honest: -1 }), happy: -6, flags: ["grd_silent"] }, "Giữ việc, mang chuyện này về nhà mỗi đêm"),
      C("Giới thiệu cậu ấy chỗ làm mới, góp tiền tháng đầu", { counters: step(c, G), money: -0.08, rel: 2, flags: ["grd_helped_rookie"] }, "Tốn tiền mình, sự thật vẫn nằm im", { longterm: true })], 0);
    if (f(c, "grd_vindicated") || f(c, "grd_union") || n(c, "grd_trust") >= 3) return T("Ban cư dân muốn thuê thẳng bạn", `${f(c, "grd_vindicated") ? "Từ vụ tầng mười hai, cư dân tin bạn hơn tin ban quản lý." : "Ngần ấy năm đứng cổng, bạn biết tên gần hết trẻ con trong tòa."} Ban đại diện cư dân muốn bỏ công ty dịch vụ, thuê thẳng một đội bảo vệ do bạn đứng đầu. Cùng lúc, công ty mời bạn làm trưởng an ninh cả khu, lương gấp rưỡi.`, [
      C("Nhận làm trưởng an ninh của công ty", { counters: step(c, G), income_mult: 1.5, flags: ["grd_chief"], rel: -2 }, "Lương cao, đứng về phía công ty"),
      C("Lập đội do cư dân thuê, công khai lương", { counters: step(c, G), agency: 0.03, money: -0.2, gamble: { p: 0.55, win: { income_mult: 1.35, flags: ["grd_own_team"], counters: { grd_trust: 2 }, log: "Đội tám người ký hợp đồng hai năm với ban cư dân. Bảng lương dán ngay ở chòi gác." }, lose: { income_mult: 0.9, log: "Công ty cũ kiện vì phá hợp đồng. Ban cư dân rút lui, đội tan sau ba tháng." } } }, "Tự làm chủ, gánh rủi ro pháp lý", { tier: "sovereign" }),
      C("Ở lại cổng chính, dạy người mới", { counters: step(c, G), happy: 4, flags: ["grd_mentor"] }, "Lương như cũ, giữ được cái mình quý")], 0);
    return T("Camera thay người", `Công ty lắp hệ thống camera nhận diện khuôn mặt cho cả khu. Mười hai bảo vệ ca đêm sẽ chỉ còn ba người ngồi phòng màn hình. ${f(c, "grd_demoted") ? "Bạn đã trông bãi xe tầng hầm mấy năm nay, " : ""}đầu gối bạn đau mỗi lần trời trở. Họ cho chọn: nhận trợ cấp thôi việc, hoặc ngồi phòng màn hình với lương thấp hơn.`, [
      C("Nhận trợ cấp, rời nghề", { counters: step(c, G), ...leave(G), money: 0.3, flags: ["ex_guard"] }, "Có một khoản, mất việc đều"),
      C("Ngồi phòng màn hình", { counters: step(c, G), income_mult: 0.85, flags: ["grd_monitor_room"], health: 1 }, "Đỡ đứng, lương giảm, ca nào cũng như ca nào"),
      C("Học vận hành hệ thống, xin làm kỹ thuật", { counters: step(c, G), bw: -5, know: 4, gamble: { p: 0.45, win: { income_mult: 1.15, flags: ["grd_tech"], log: "Bạn là người duy nhất trong ca đọc được bảng lỗi của hệ thống. Họ giữ bạn lại, tăng lương." }, lose: { income_mult: 0.85, log: "Bạn trượt bài kiểm tra. Họ vẫn cho bạn ngồi phòng màn hình." } } }, "Tốn sức học, có thể đi trước cái máy", { tier: "awakened" })], 0);
  }),
  beat(G, 5, 6, (c) => T("Chùm chìa khóa ba mươi chiếc", `Bạn sắp giao lại chùm chìa khóa đã đeo bên hông bao năm. ${f(c, "grd_silent") ? "Mỗi lần đi qua chòi gác cũ, bạn vẫn nhớ cái túi ni lông của cậu bảo vệ trẻ." : f(c, "grd_own_team") ? "Đội bảo vệ do cư dân thuê giờ đã có mười hai người." : f(c, "grd_chief") ? "Phòng trưởng an ninh có máy lạnh, nhưng bạn vẫn quen ăn trưa ở chòi gác." : "Lũ trẻ ngày bạn mới đến giờ đã đi làm, vài đứa vẫn chào bạn bằng tên."} Ban cư dân muốn làm một buổi chia tay nhỏ ở sảnh.`, [
    C("Viết sổ tay từng ngóc ngách cho người mới", { counters: step(c, G), flags: ["passed_on"], happy: 3, bw: -2 }, "Tốn vài tháng, để lại cái biết"),
    C("Xin ở lại làm thêm ca ngày vài năm", { counters: step(c, G), money: 0.1, health: -3 }, "Thêm tiền dưỡng già, thân thể trả giá"),
    C("Nghỉ hẳn, nhận buổi chia tay", { counters: step(c, G), ...leave(G), happy: 5, rel: 3 }, "Khép lại tử tế, mất lương")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(G, "grd_parcels", [18, 65], 8, (c) => T("Núi hàng trong chòi gác", vary("grdp", c.age, [
    "Chòi gác giờ thành kho hàng: bốn mươi gói một ngày, người giao nào cũng nhờ bạn ký nhận hộ cho nhanh.",
    "Mùa giảm giá, hàng chất kín sau lưng ghế. Một cư dân báo mất gói hàng mà sổ ghi bạn đã nhận."]), [
    C("Ký nhận hộ tất cả", { counters: { grd_trust: 1 }, gamble: { p: 0.7, win: { log: "Cả tháng không thất lạc gói nào. Cư dân gọi bạn là bưu điện tầng trệt." }, lose: { money: -0.03, log: "Một gói điện thoại không cánh mà bay. Bạn tự đền." } } }, "Được lòng, có thể phải đền"),
    C("Chỉ nhận khi cư dân gọi báo trước", { flags: ["grd_strict_parcels"], rel: -1 }, "Hết rủi ro, bị chê khó tính"),
    C("Đề xuất đặt tủ nhận hàng có mã khóa", { agency: 0.01, gamble: { p: 0.5, win: { flags: ["grd_lockers"], bw: 3, log: "Ban quản lý lắp hai dãy tủ. Chòi gác rộng ra một nửa." }, lose: { log: "Đề xuất nằm trong ngăn kéo. Hàng vẫn chất sau lưng ghế." } } }, "Giải gốc chuyện, có thể bị lờ đi", { tier: "awakened" })], 0)),
  daily(G, "grd_holiday", [18, 65], 8, (c) => T(vn(c) ? "Trực đêm giao thừa" : "Trực đêm cuối năm", `${vn(c) ? "Đêm ba mươi Tết, cả tòa nhà về quê gần hết, chỉ còn tiếng pháo hoa xa xa." : "Đêm cuối năm, cả khu đi chơi, chỉ còn tiếng pháo hoa xa xa."} Ca này trả gấp ba. Người cùng ca có con nhỏ, xin bạn trực thay để được về nhà.`, [
    C("Trực thay, lấy tiền gấp ba", { money: 0.04, rel: -2, counters: { grd_trust: 1 } }, "Có tiền và một món nợ ân tình, nhà vắng bạn"),
    C("Từ chối, về với gia đình", { rel: 3, money: -0.01, flags: ["grd_home_holiday"] }, "Ấm nhà, đồng nghiệp lỡ một đêm")], 0)),
  daily(G, "grd_alarm", [18, 65], 8, (c) => T("Chuông báo cháy lúc ba giờ", vary("grdf", c.age, [
    "Chuông báo cháy kêu ở tầng chín lúc ba giờ sáng. Tháng này nó đã kêu nhầm bốn lần, lần nào cư dân cũng gọi xuống mắng.",
    "Có mùi khét dưới hầm xe. Bảng điều khiển báo lỗi cảm biến, không rõ cháy thật hay máy hỏng."]), [
    C("Bấm loa sơ tán cả tòa", { rel: -2, flags: ["grd_evacuated"], gamble: { p: 0.35, win: { counters: { grd_trust: 2 }, log: "Là chập điện thật trong một căn hộ. Lửa được dập khi mọi người đã xuống sân." }, lose: { happy: -2, log: "Lại báo nhầm. Ba trăm người đứng ngoài sân trong bộ đồ ngủ, nhìn bạn." } } }, "Có thể cứu người, có thể bị cả tòa ghét"),
    C("Tự lên kiểm tra trước khi báo", { health: -2, gamble: { p: 0.7, win: { log: "Một nồi cháo quên tắt bếp. Bạn gõ cửa, chủ nhà xin lỗi rối rít." }, lose: { health: -5, flags: ["grd_smoke"], log: "Khói đã đầy hành lang. Bạn kịp gõ cửa ba nhà rồi phải lui xuống." } } }, "Đỡ làm phiền, mạo hiểm thân mình")], 0)),
  daily(G, "grd_blocked", [18, 65], 8, () => T("Chiếc xe chắn lối thoát hiểm", "Một cư dân tầng thượng đỗ chiếc xe đắt tiền chắn ngang lối thoát hiểm, đêm nào cũng vậy. Khi bạn nhắc, ông ta hỏi bạn có biết ông là ai không, rồi bảo quản lý tòa nhà là chỗ quen.", [
    C("Dán giấy nhắc, ghi vào sổ mỗi đêm", { counters: { honest: 1 }, gamble: { p: 0.5, win: { counters: { grd_trust: 1 }, log: "Sang tuần thứ hai, ông ta đổi chỗ đỗ, không nói một lời." }, lose: { income_mult: 0.95, log: "Bạn bị gọi lên văn phòng, bị nhắc nhở vì thái độ với khách." } } }, "Đúng luật, có thể bị trù"),
    C("Làm ngơ, ông ta có thế hơn", { counters: { honest: -1 }, happy: -1 }, "Yên thân, lối thoát vẫn bị chắn"),
    C("Chụp ảnh gửi vào nhóm chung của cư dân", { agency: 0.02, flags: ["grd_public_post"], gamble: { p: 0.6, win: { log: "Hàng chục cư dân vào bình luận. Sáng hôm sau lối thoát hiểm trống trơn." }, lose: { rel: -2, log: "Ông ta dọa kiện bạn tội bôi nhọ. Công ty bắt bạn gỡ ảnh." } } }, "Để mọi người cùng thấy, có thể bị dọa kiện", { tier: "sovereign" })], 0)),
  daily(G, "grd_doze", [18, 65], 8, (c) => T("Ngủ gật lúc bốn giờ", vary("grdd", c.age, [
    "Tuần này bạn trực bảy ca đêm liền vì thiếu người. Bốn giờ sáng bạn gục xuống bàn mười phút, camera chòi gác quay lại cả.",
    "Bạn vừa trực đêm vừa chạy thêm việc ban ngày. Quản lý gửi bạn đoạn phim bạn ngủ gật, hỏi bạn giải thích ra sao."]), [
    C("Nhận lỗi, chịu trừ lương", { money: -0.02, counters: { honest: 1 } }, "Mất tiền, giữ được lời"),
    C("Nhờ đồng nghiệp xóa đoạn ghi hình", { counters: { honest: -1 }, flags: ["grd_erased_tape"], gamble: { p: 0.7, win: { log: "Đoạn phim biến mất. Không ai hỏi nữa." }, lose: { income_mult: 0.9, log: "Bản sao lưu vẫn còn. Cả hai bị kỷ luật." } } }, "Thoát lần này, kéo người khác vào"),
    C("Gửi kèm bảng ca, đề xuất ca tám tiếng", { agency: 0.02, gamble: { p: 0.4, win: { health: 3, flags: ["grd_eight_hours"], log: "Công ty chia lại ca. Từ tháng sau không ai phải trực quá tám tiếng." }, lose: { money: -0.02, log: "Họ vẫn trừ lương, và bảo ai chê ca dài thì nghỉ." } } }, "Đòi luật chung, có thể bị coi là cãi", { tier: "awakened" })], 0)),
  daily(G, "grd_lost_elder", [18, 65], 9, (c) => T("Cụ bà mặc áo ngủ ở sảnh", "Mười một giờ đêm, một cụ bà mặc áo ngủ ngồi ở sảnh, không nhớ mình ở tầng nào. Sổ cư dân không có ảnh. Cụ cứ hỏi bạn đã thấy con trai cụ đi làm về chưa.", [
    C("Ngồi với cụ đến khi tìm được người nhà", { bw: -3, health: -1, counters: { grd_trust: 1 }, flags: ["grd_kind"] }, "Mất cả ca, cả tòa biết bạn"),
    C(`Gọi ${vn(c) ? "công an khu vực" : "cảnh sát"} đến đưa cụ đi`, { flags: ["grd_called_police"] }, "Đúng quy trình, cụ sợ hãi trên xe lạ"),
    C("Đề xuất lập danh sách các cụ sống một mình", { agency: 0.02, bw: -2, counters: { grd_trust: 1 }, flags: ["grd_elder_list"] }, "Tốn công gõ từng cửa, lần sau không ai lạc", { tier: "awakened" })], 0)),
  daily(G, "grd_debris", [18, 65], 9, () => T("Xe chở xà bần lúc nửa đêm", "Một nhà thầu sửa căn hộ muốn bạn mở cổng lúc nửa đêm cho xe chở xà bần ra, tránh giờ quy định và phí vệ sinh. Họ đặt lên bàn một phong bì bằng nửa tháng lương.", [
    C("Nhận phong bì, mở cổng", { money: 0.05, counters: { honest: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [1, 6], note: "nhận phong bì mở cổng cho xe xà bần lúc nửa đêm" } }, "Tiền dễ, một bí mật trong sổ ra vào"),
    C("Từ chối, ghi biển số xe vào sổ", { counters: { honest: 1, grd_trust: 1 }, rel: -1 }, "Sạch tay, nhà thầu ghét ra mặt"),
    C("Trả phong bì, báo ban quản lý", { counters: { honest: 1 }, gamble: { p: 0.5, win: { counters: { grd_trust: 1 }, log: "Nhà thầu bị phạt. Ban quản lý khen bạn trong buổi họp." }, lose: { happy: -2, log: "Hóa ra nhà thầu là người nhà của quản lý. Bạn bị đổi sang ca khó." } } }, "Đúng việc, có thể đụng người có thế")], 1)),
  daily(G, "grd_payslip", [18, 65], 9, () => T("Phí đồng phục trừ vào lương", "Phiếu lương tháng này trừ tiền đồng phục, tiền đào tạo, tiền phạt đi muộn hai phút. Bạn hỏi về bảo hiểm thì được trả lời công ty đang làm hồ sơ, đã làm tám tháng nay.", [
    C("Im lặng nhận lương", { money: -0.03, happy: -2, counters: { grd_quiet: 1 } }, "Giữ chỗ, mất tiền không rõ lý do"),
    C("Nhảy sang công ty khác", { flags: ["grd_switched_firm"], gamble: { p: 0.5, win: { income_mult: 1.08, log: "Công ty mới đóng đủ bảo hiểm, ca ngắn hơn." }, lose: { income_mult: 0.95, log: "Công ty mới còn trừ nhiều hơn. Bạn mất cả thâm niên." } } }, "Có thể khá hơn, mất thâm niên"),
    C("Rủ anh em cùng gửi đơn lên cơ quan lao động", { agency: 0.03, flags: ["grd_labor_claim"], gamble: { p: 0.45, win: { money: 0.05, log: "Thanh tra lao động vào cuộc. Công ty hoàn tiền và đóng bảo hiểm cho cả đội." }, lose: { income_mult: 0.92, log: "Công ty không gia hạn hợp đồng cho người đứng đầu lá đơn: là bạn." } } }, "Đòi cho cả đội, mình đứng mũi chịu sào", { tier: "sovereign" })], 0)),
  daily(G, "grd_study", [18, 60], 8, (c) => T("Cuốn sách trong chòi gác", vary("grds", c.age, [
    "Từ một giờ đến năm giờ sáng, cả tòa ngủ say. Bạn có bốn tiếng yên tĩnh, một ngọn đèn bàn và một cái điện thoại.",
    "Một sinh viên ở tầng bảy cho bạn mượn bộ sách ôn thi chứng chỉ quản lý tòa nhà."]), [
    C("Học mỗi đêm, thi lấy chứng chỉ", { know: 5, bw: -3, counters: { grd_study: 1 }, flags: ["grd_night_school"] }, "Mệt hơn, có đường đi tiếp"),
    C("Xem phim cho đêm trôi nhanh", { happy: 2, bw: 1 }, "Dễ chịu, đêm nào cũng như đêm nào")], 0)),
  daily(G, "grd_quit", [30, 65], 99, () => T("Một lời mời rời chòi gác", "Một người bạn cũ mở kho hàng, cần người quản lý kho ban ngày. Lương ngang ca đêm của bạn, nhưng được ngủ đêm như mọi người.", [
    C("Nhận lời, cởi bộ đồng phục", { ...leave(G), flags: ["ex_guard"], health: 3 }, "Ngủ đêm như người thường, bỏ lại thâm niên"),
    C("Ở lại với chòi gác", { happy: 1, counters: { grd_trust: 1 } }, "Quen việc, quen người, đêm vẫn dài")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(G, "grd_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Bộ đồng phục ở cổng trường", `Bạn ghé đón ${N(k)} sau ca trực, vẫn mặc nguyên đồng phục bảo vệ. ${N(k)} bảo lần sau đứng xa cổng một chút, vì bạn bè cứ hỏi có phải bố mẹ nó gác cổng không.`, [
      C("Lần sau thay đồ rồi mới đến", { trust: { npc: k, delta: 0.05 }, happy: -3 }, "Con đỡ ngượng, bạn nuốt một chút buồn"),
      C("Kể cho con nghe chuyện nghề của mình", { gamble: { p: 0.55, win: { trust: { npc: k, delta: 0.25 }, log: `${N(k)} nghe hết chuyện đêm báo cháy và chuyện cụ bà lạc. Tuần sau nó tự kể lại cho bạn bè.` }, lose: { trust: { npc: k, delta: -0.1 }, log: `${N(k)} đeo tai nghe vào giữa chừng.` } } }, "Có thể gần con hơn, có thể chạm tự ái tuổi mới lớn", { tier: "awakened" }),
      C("Mắng con biết xấu hổ vì cha mẹ", { trust: { npc: k, delta: -0.2 }, rel: -1 }, "Hả giận, con đóng cửa phòng")], 1, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Học bao năm để gác cổng", `${N(p)} nói trong bữa cơm, trước mặt họ hàng: "Học bao nhiêu năm để đi gác cổng cho người ta." Cả mâm im lặng gắp thức ăn.`, [
      C("Cãi lại ngay trên bàn ăn", { trust: { npc: p, delta: -0.15 }, happy: 1 }, "Hả giận, bữa cơm hỏng"),
      C("Mời cha mẹ đến xem nơi mình làm", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.25 }, log: `${N(p)} ngồi chòi gác cả buổi chiều, thấy cư dân chào bạn bằng tên. Về nhà không nhắc chuyện ấy nữa.` }, lose: { trust: { npc: p, delta: -0.05 }, log: `${N(p)} bảo bận, không đến.` } } }, "Có thể đổi cách nhìn, có thể bị từ chối"),
      C("Im lặng, ăn hết bát cơm", { happy: -3, counters: { grd_quiet: 1 } }, "Giữ hòa khí, nuốt một câu")], 1, { npc: p });
  }),
];

/* =====================================================================
 * NGƯỜI NỘI TRỢ TOÀN THỜI GIAN — tiền tố hmk_
 * Dành cho mọi giới. Việc không lương là việc thật; đánh đổi xoay quanh tiền, danh tính, quay lại đi làm.
 * ===================================================================== */
const H = "homemaker";
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
/** Người đang giữ tiền trong nhà: bạn đời nếu có, không thì gọi chung. */
const earner = (c: FactContext, N: (id: string) => string): { sp: string | undefined; who: string } => {
  const sp = c.married ? role(c, "spouse") : undefined;
  return { sp, who: sp ? N(sp) : "người lo tiền trong nhà" };
};

const HMK_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(H, "hmk_t_table", [9, 14], () => true, () => T("Bữa tối do bạn nấu", "Từ khi người lớn trong nhà làm ca tối, bạn là người nấu cơm, nhắc em làm bài, nhớ ai không ăn hành. Hàng xóm sang chơi bảo căn nhà này chạy được là nhờ bạn. Cô giáo thì nhắn về rằng điểm của bạn đang tụt.", [
    C("Nhận hẳn việc nhà mỗi tối", { flags: [talentFlag(H)], counters: { talents_seen: 1 }, rel: 3, know: -2 }, "Nhà êm, sách vở thiệt, mở một con đường"),
    C("Xin chia việc để còn thời gian học", { know: 2, rel: -1, counters: { talents_seen: 1 } }, "Giữ điểm số, nhà kém êm một chút")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(H, "hmk_d_baby", [22, 45], (c) => c.married && !!role(c, "spouse") && c.kids_alive > 0, (c, N) => { const sp = role(c, "spouse")!;
    return T("Một suất lương cho nhà trẻ", `Đứa con nhỏ tròn sáu tháng. Tiền gửi trẻ gần bằng lương của một trong hai người. ${N(sp)} nói: một người ở nhà thì nhà đỡ hơn, và người ở nhà nên là bạn.`, [
      C("Ở nhà nuôi con, tạm gác việc", { ...become(H), counters: { doors_seen: 1 }, happy: 2, trust: { npc: sp, delta: 0.1 } }, "Con có người, bạn mất lương và chỗ đứng"),
      C("Gửi trẻ, cả hai cùng đi làm", { counters: { doors_seen: 1 }, money: -0.15, bw: -4 }, "Giữ nghề, nhà lúc nào cũng hụt hơi"),
      C("Đề nghị hai người thay nhau nghỉ mỗi người một năm", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.5, win: { ...become(H), flags: ["hmk_shared_turn"], trust: { npc: sp, delta: 0.2 }, log: `${N(sp)} đồng ý. Bạn nghỉ trước, ${N(sp)} hứa năm sau đến lượt mình.` }, lose: { trust: { npc: sp, delta: -0.1 }, money: -0.1, log: `${N(sp)} bảo chỗ làm không cho nghỉ dài. Hai người đành gửi trẻ.` } } }, "Công bằng hơn, có thể không ai chịu nhường", { tier: "sovereign" })], 0, { npc: sp }); }),
  door(H, "hmk_d_visa", [24, 50], (c) => c.married && !!role(c, "spouse"), (c, N) => { const sp = role(c, "spouse")!;
    return T("Thị thực của người đi kèm", `${N(sp)} được mời một công việc ở nước ngoài, lương gấp ba. Thị thực diện người đi kèm không cho bạn đi làm trong hai năm đầu. Ở bên ấy, bạn không quen một ai, không nói được tiếng của họ.`, [
      C("Đi theo, lo việc nhà bên ấy", { ...become(H), counters: { doors_seen: 1 }, money: 0.2, rel: -4, flags: ["hmk_abroad"] }, "Nhà có thu nhập lớn, bạn mất việc và bạn bè"),
      C("Ở lại giữ việc, sống xa nhau", { counters: { doors_seen: 1 }, trust: { npc: sp, delta: -0.1 }, happy: -3 }, "Giữ nghề, hôn nhân qua màn hình"),
      C("Khuyên bạn đời từ chối", { counters: { doors_seen: 1 }, trust: { npc: sp, delta: -0.15 }, money: -0.05 }, "Giữ nguyên nếp, người kia tiếc một cơ hội")], 0, { npc: sp }); }),
  door(H, "hmk_d_burnout", [25, 55], () => true, () => T("Lời khuyên của bác sĩ", "Sau ba năm làm đến mười giờ đêm, bạn ngất ở chỗ làm. Bác sĩ bảo cơ thể bạn cần nghỉ ít nhất một năm. Thu nhập của những người khác trong nhà đủ sống, nếu bớt đi nhiều thứ.", [
    C("Nghỉ hẳn, ở nhà lo cho gia đình", { ...become(H), counters: { doors_seen: 1 }, health: 5, money: -0.1 }, "Hồi sức, mất thu nhập và đồng nghiệp"),
    C("Xin làm bán thời gian", { counters: { doors_seen: 1 }, income_mult: 0.6, health: 2, flags: ["hmk_part_time"] }, "Nửa lương, nửa sức"),
    C("Uống thuốc, làm tiếp", { counters: { doors_seen: 1 }, health: -5, money: 0.05 }, "Giữ lương, cơ thể ghi nợ")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(H, 1, 1, (c, N) => { const { sp, who } = earner(c, N);
    return T("Tháng đầu không có lương", `Ngày nhận lương, điện thoại không báo tiền về như mọi tháng trước. Bạn cần một đôi dép mới và một lọ thuốc ho cho mình. Tiền trong nhà nằm trong tài khoản của ${who}.`, [
      C("Đề nghị một khoản cố định đứng tên mình", { counters: step(c, H, { hmk_self: 1 }), flags: ["hmk_own_account"], bw: -2, ...(sp ? { trust: { npc: sp, delta: -0.05 } } : {}) }, "Có tiền riêng, một cuộc nói chuyện khó"),
      C("Cần gì thì hỏi, cho đỡ căng", { counters: step(c, H, { hmk_dep: 1 }), rel: 1 }, "Êm nhà, mỗi lần mua gì cũng phải mở lời"),
      C("Ghi sổ mọi việc nhà, quy ra tiền công", { counters: step(c, H, { hmk_self: 1 }), flags: ["hmk_ledger"], agency: 0.02, know: 2 }, "Thấy rõ công sức mình, có người sẽ phật ý", { tier: "sovereign" })], 1, sp ? { npc: sp } : {}); }),
  beat(H, 2, 3, (c) => T("Mười suất cơm cho hàng xóm", `Món ăn của bạn nổi tiếng cả ${vn(c) ? "con hẻm" : "khu phố"}. Mấy nhà đi làm cả ngày muốn đặt cơm tối theo tháng, trả tiền mặt. ${f(c, "hmk_ledger") ? "Cuốn sổ của bạn ghi: mỗi tuần bạn đã nấu hai mươi mốt bữa không lương. " : ""}Nhận thì bếp bận từ ba giờ chiều đến tối.`, [
    C("Nhận nấu cơm tháng cho mười nhà", { counters: step(c, H, { hmk_self: 1 }), flags: ["hmk_side_income"], money: 0.1, bw: -4, health: -1 }, "Có tiền riêng, bếp không bao giờ nghỉ"),
    C("Chỉ nấu cho nhà mình", { counters: step(c, H, { hmk_dep: 1 }), happy: 2 }, "Thong thả, vẫn phải hỏi tiền"),
    C("Rủ mấy người ở nhà lập bếp chung, chia lời", { counters: step(c, H, { hmk_self: 1 }), agency: 0.03, gamble: { p: 0.5, win: { flags: ["hmk_coop"], money: 0.08, log: "Bốn người, mỗi người một ngày đứng bếp. Lần đầu tiên bạn có một ngày trong tuần không phải nấu." }, lose: { rel: -2, log: "Sau hai tháng, chuyện ai nấu nhiều ai nấu ít làm nhóm tan." } } }, "Nhẹ gánh, chung chạ dễ sinh chuyện", { tier: "sovereign" })], 0)),
  beat(H, 3, 4, (c, N) => { const { who } = earner(c, N); const kitchen = f(c, "hmk_side_income") || f(c, "hmk_coop"); const own = f(c, "hmk_own_account");
    return T("Người kiếm tiền mất việc", `${cap(who)} bị cắt việc sau một đợt tái cấu trúc. Tiền tiết kiệm của cả nhà chỉ đủ ba tháng. ${own ? "Tài khoản riêng của bạn còn một khoản nhỏ góp từng tháng. " : "Không có đồng nào đứng tên bạn. "}${kitchen ? "Bếp cơm tháng là khoản thu duy nhất còn đều." : "Hóa đơn vẫn đến đúng ngày."}`, [
      C("Đi làm lại ngay, nhận chăm bệnh thuê", { counters: step(c, H), unflags: [life(H)], custom: "become:caregiver", flags: ["hmk_back_to_work"], health: -2 }, "Có tiền ngay, căn nhà thiếu người"),
      kitchen
        ? C("Nhận thêm suất cơm, gánh nhà một thời gian", { counters: step(c, H, { hmk_self: 1 }), money: 0.25, health: -4, flags: ["hmk_breadwinner"] }, "Nhà trụ được, lưng bạn gánh")
        : C("Thắt lưng buộc bụng, chờ người kia tìm việc", { counters: step(c, H, { hmk_dep: 1 }), money: -0.3, bw: -5, flags: ["hmk_held_on"] }, "Giữ nếp nhà, sống trong lo âu"),
      own
        ? C("Rút tiền riêng ra gánh, ghi rõ là cho vay", { counters: step(c, H, { hmk_self: 1 }), money: 0.1, agency: 0.02, flags: ["hmk_lent_home"] }, "Nhà qua cơn, tiền của bạn có tên", { tier: "awakened" })
        : C("Vay họ hàng, tự đứng tên khoản nợ", { counters: step(c, H, { hmk_self: 1 }), custom: "borrow:0.3", agency: 0.02, flags: ["hmk_own_debt"] }, "Nhà qua cơn, nợ mang tên bạn", { tier: "awakened" })], 1); }),
  beat(H, 4, 5, (c, N) => { const { sp, who } = earner(c, N);
    if (n(c, "hmk_dep") >= 2 && !f(c, "hmk_own_account") && !f(c, "hmk_side_income")) return T("Ai nuôi cái nhà này", `Trong một trận cãi nhau, ${who} buột miệng: "Ai nuôi cái nhà này?" Bạn chợt nhận ra căn nhà, sổ tiết kiệm, cả chiếc xe đều không có tên mình. Hồ sơ xin việc của bạn có một khoảng trống dài ${c.age >= 45 ? "hơn mười năm" : "nhiều năm"}.`, [
      C("Đòi ghi nhận công sức, đứng tên chung tài sản", { counters: step(c, H, { hmk_self: 1 }), agency: 0.03, gamble: { p: 0.45, win: { flags: ["hmk_co_owner"], log: "Sau ba tuần căng thẳng, giấy tờ nhà có thêm tên bạn." }, lose: { happy: -4, ...(sp ? { trust: { npc: sp, delta: -0.2 } } : {}), log: "Câu trả lời là không. Cả nhà sống trong im lặng suốt mùa đông ấy." } } }, "Đòi điều đúng, có thể vỡ nhà", { tier: "sovereign" }),
      C("Nuốt câu ấy, ở lại như cũ", { counters: step(c, H, { hmk_dep: 1 }), happy: -6 }, "Nhà còn nguyên, bạn mất thêm một phần mình"),
      C("Xách va li đi, bắt đầu lại từ đầu", { counters: step(c, H), unflags: [life(H)], ...(sp ? { custom: "spouse_leave" } : {}), money: -0.3, flags: ["hmk_walked_out"], agency: 0.02 }, "Tự do, nghèo, làm lại từ số không")], 1, sp ? { npc: sp } : {});
    if (n(c, "hmk_self") >= 2 || f(c, "hmk_own_account") || f(c, "hmk_side_income") || f(c, "hmk_coop") || f(c, "hmk_ledger")) return T("Bếp ăn của trường cần người", `${f(c, "hmk_coop") ? "Bếp chung của nhóm bạn" : f(c, "hmk_side_income") ? "Bếp cơm tháng của bạn" : "Cách bạn quán xuyến cái nhà"} đến tai ban phụ huynh. Trường của ${vn(c) ? "phường" : "khu"} mời bạn điều hành bếp bán trú cho bốn trăm học sinh, có lương, có bảo hiểm. Cùng lúc, một nhóm nghiên cứu mời bạn kể về những năm làm việc không lương trong một hội thảo.`, [
      C("Nhận điều hành bếp trường", { counters: step(c, H), unflags: [life(H)], custom: "become:restaurateur", flags: ["hmk_school_kitchen"] }, "Có nghề, có lương, căn nhà phải tự xoay"),
      C("Lên hội thảo kể về việc không lương", { counters: step(c, H, { hmk_self: 1 }), agency: 0.03, flags: ["hmk_spoke_out"], gamble: { p: 0.5, win: { rel: 4, log: "Bài nói được chia sẻ khắp nơi. Nhiều người ở nhà viết thư cho bạn." }, lose: { rel: -2, log: "Họ hàng xem đoạn phim, bảo bạn đem chuyện nhà ra chợ." } } }, "Lên tiếng cho việc không lương, lộ chuyện nhà", { tier: "sovereign" }),
      C("Giữ nhịp nhà, chỉ nhận góp ý vài buổi", { counters: step(c, H), money: 0.05, happy: 3 }, "Ít tiền, giữ được nhịp sống")], 0);
    return T("Căn nhà vắng lúc mười giờ sáng", `${c.kids_alive > 0 ? "Đứa con út đã đi học xa." : "Những người bạn từng lo cho giờ đều tự lo được."} Mười giờ sáng, việc nhà xong hết, căn nhà im phăng phắc. Bạn mở lại hồ sơ xin việc cũ: dòng cuối cùng cách đây nhiều năm.`, [
      C("Đi học lại một nghề mới", { counters: step(c, H, { hmk_self: 1 }), money: -0.15, know: 6, flags: ["hmk_back_to_school"] }, "Tốn tiền, có một tương lai riêng"),
      C("Nộp đơn với khoảng trống trong hồ sơ", { counters: step(c, H), gamble: { p: 0.4, win: { unflags: [life(H)], custom: "become:social_worker", log: "Một trung tâm hỗ trợ gia đình nhận bạn. Người phỏng vấn bảo những năm ở nhà là kinh nghiệm thật." }, lose: { happy: -4, log: "Mười hai lá đơn, không một cuộc gọi lại." } } }, "Có thể bước ra, có thể bị từ chối nhiều lần"),
      C("Ở nhà, nhận trông cháu cho họ hàng", { counters: step(c, H, { hmk_dep: 1 }), rel: 3, health: -2 }, "Có người cần mình, vẫn không có lương")], 0);
  }),
  beat(H, 5, 6, (c) => T("Cuốn sổ chi tiêu của cả một đời", `${f(c, "hmk_co_owner") ? "Giấy tờ nhà giờ có tên bạn. " : f(c, "hmk_breadwinner") ? "Cả họ vẫn nhắc những năm bạn gánh nhà bằng bếp cơm. " : f(c, "hmk_ledger") ? "Cuốn sổ ghi việc nhà của bạn đã dày bốn quyển. " : ""}Một người trẻ trong nhà vừa có con đầu lòng, hỏi bạn có thể trông cháu toàn thời gian để cả hai vợ chồng đi làm không.`, [
    C("Trông cháu toàn thời gian, không lấy tiền", { counters: step(c, H), rel: 4, health: -3, flags: ["hmk_grandcare"] }, "Gần con cháu, lại một vòng không lương"),
    C("Nhận trông, nhưng xin trả công như người ngoài", { counters: step(c, H, { hmk_self: 1 }), money: 0.05, agency: 0.02, flags: ["hmk_paid_care"] }, "Công bằng, có người cho là tính toán", { tier: "sovereign" }),
    C("Từ chối, kể cho họ nghe những năm của mình", { counters: step(c, H), unflags: [life(H)], flags: ["passed_on"], happy: 4, rel: -1 }, "Tuổi già là của mình, người trẻ tự xoay")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(H, "hmk_party", [20, 60], 8, (c) => T("Thế bạn làm nghề gì?", `Ở một bữa tiệc, người ngồi cạnh hỏi bạn làm nghề gì. Khi bạn nói mình ở nhà lo việc nhà, ${c.sex === "M" ? "họ cười: đàn ông gì mà ở nhà." : "họ gật đầu: à, chỉ ở nhà thôi."} Rồi họ quay sang nói chuyện với người khác.`, [
    C("Nói rõ: tôi làm việc nhà, không lương", { counters: { hmk_self: 1 }, rel: -1, agency: 0.01 }, "Giữ phẩm giá, bữa tiệc ngượng ngùng"),
    C("Cười trừ, nói lảng sang chuyện khác", { happy: -2, counters: { hmk_dep: 1 } }, "Êm chuyện, thấy mình nhỏ đi"),
    C("Kể một ngày của mình từ năm giờ sáng", { gamble: { p: 0.5, win: { rel: 2, counters: { hmk_self: 1 }, log: "Cả bàn im lặng nghe. Có người xin số điện thoại để hỏi cách xoay bữa tối." }, lose: { happy: -1, log: "Họ gật gù lịch sự rồi đổi chủ đề." } } }, "Có thể được hiểu, có thể bị lờ đi")], 0)),
  daily(H, "hmk_shoes", [20, 60], 8, (c) => T("Đôi giày phải xin tiền", `${vary("hmks", c.age, ["Đôi giày của bạn đã há mõm sau ba năm.", "Bạn muốn mua quà sinh nhật cho người lo tiền trong nhà, bằng chính tiền của họ."])} ${f(c, "hmk_own_account") ? "Khoản tiền riêng tháng này đã dồn vào học phí." : "Đồng nào trong nhà cũng phải hỏi."}`, [
    C("Mở lời xin tiền", { counters: { hmk_dep: 1 }, happy: -1 }, "Có thứ cần, thêm một lần ngửa tay"),
    C("Nhịn, để dành cho người khác", { happy: -3 }, "Không phải hỏi ai, mình thiệt"),
    C("Bán đồ cũ trên mạng lấy tiền riêng", { money: 0.01, bw: -2, counters: { hmk_self: 1 }, flags: ["hmk_resale"] }, "Có đồng tiền của mình, tốn công chụp ảnh, nhắn tin", { tier: "awakened" })], 0)),
  daily(H, "hmk_holiday", [20, 60], 9, (c) => T(vn(c) ? "Ba ngày Tết, bốn mâm cỗ" : "Kỳ nghỉ lễ của cả họ", vn(c)
    ? "Tết năm nay cả họ về nhà bạn. Bạn nấu bốn mâm cỗ trong ba ngày, rửa bát đến nửa đêm, trong khi mọi người ngồi chơi ngoài phòng khách."
    : "Kỳ nghỉ lễ, mười bốn người trong họ về nhà bạn. Bạn nấu ba bữa một ngày suốt năm ngày, trong khi mọi người xem thể thao ngoài phòng khách.", [
    C("Làm hết như mọi năm", { rel: 3, health: -3, counters: { hmk_dep: 1 } }, "Họ hàng vui, bạn kiệt sức"),
    C("Dán bảng phân việc lên tủ lạnh", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["hmk_chore_chart"], counters: { hmk_self: 1 }, log: "Người lớn tuổi nhất nhận rửa bát đầu tiên. Những người khác theo." }, lose: { rel: -3, log: "Mấy người lớn tuổi phật ý. Bảng phân việc bị gỡ xuống lúc nào không hay." } } }, "Đổi nếp cả họ, có thể mất lòng", { tier: "sovereign" }),
    C("Đặt đồ ăn ngoài một ngày, nghỉ ngơi", { money: -0.03, happy: 3, rel: -1, flags: ["hmk_took_day_off"] }, "Tốn tiền, được thở, bị nói ra nói vào")], 0)),
  daily(H, "hmk_sick", [20, 60], 8, (c) => T("Người nội trợ cũng ốm", `${vary("hmkf", c.age, ["Bạn sốt cao ba ngày.", "Lưng bạn đau đến mức không cúi được."])} Không ai trong nhà biết thuốc của người già để đâu, hóa đơn điện đến hạn hôm nào, đứa nhỏ học thêm buổi nào.`, [
    C("Gượng dậy làm như thường", { health: -4, counters: { hmk_dep: 1 } }, "Nhà chạy đều, bạn ốm lâu hơn"),
    C("Nằm hẳn, để cả nhà tự xoay", { health: 3, gamble: { p: 0.5, win: { flags: ["hmk_house_learned"], log: "Ba ngày lộn xộn. Đến ngày thứ tư, ai cũng biết hóa đơn để ở ngăn kéo nào." }, lose: { rel: -2, log: "Nhà rối tung. Khỏi ốm, bạn phải dọn gấp đôi." } } }, "Hồi sức, nhà có thể học được"),
    C("Viết một cuốn sổ hướng dẫn cho cả nhà", { bw: -2, agency: 0.01, flags: ["hmk_house_manual"], counters: { hmk_self: 1 } }, "Tốn một buổi tối, lần sau bạn có quyền ốm", { tier: "awakened" })], 1)),
  daily(H, "hmk_hours", [20, 60], 8, (c) => T("Bảy mươi giờ một tuần", vary("hmkh", c.age, [
    "Một bài báo nói người làm nội trợ toàn thời gian làm trung bình bảy mươi giờ một tuần. Bạn đếm thử: còn hơn thế.",
    "Mười một giờ đêm, bồn rửa vẫn đầy bát. Năm giờ sáng mai bạn lại dậy."]), [
    C("Mua máy rửa bát trả góp", { money: -0.05, bw: 3, flags: ["hmk_dishwasher"] }, "Tốn tiền, lấy lại một giờ mỗi ngày"),
    C("Đề nghị mỗi người tự rửa bát của mình", { counters: { hmk_self: 1 }, rel: -1 }, "Chia gánh, có người càu nhàu"),
    C("Thôi, việc nhà ai mà chẳng làm", { happy: -2, counters: { hmk_dep: 1 } }, "Không ai phiền, bạn mệt thêm")], 2)),
  daily(H, "hmk_old_friend", [24, 60], 9, () => T("Bạn cũ lên chức giám đốc", "Một người bạn cùng khóa vừa lên chức giám đốc, mời bạn đi ăn trưa. Giữa bữa, họ hỏi bạn có muốn nhận làm thêm vài việc ở nhà không: dịch tài liệu, làm sổ sách, trả theo việc.", [
    C("Nhận việc làm thêm ở nhà", { money: 0.06, bw: -4, counters: { hmk_self: 1 }, flags: ["hmk_freelance"] }, "Có tiền riêng, ngủ muộn hơn"),
    C("Từ chối, nhà đang cần mình", { happy: -1, counters: { hmk_dep: 1 } }, "Nhà yên, cánh cửa ấy khép lại"),
    C("Nhận, và nhờ giới thiệu một lớp cập nhật nghề", { money: 0.03, know: 4, bw: -5, flags: ["hmk_freelance", "hmk_reskill"] }, "Mệt gấp đôi, đường quay lại rộng hơn", { tier: "awakened" })], 1)),
  daily(H, "hmk_treasurer", [24, 60], 9, () => T("Thủ quỹ hội phụ huynh", "Bạn là người duy nhất trong lớp có thời gian ban ngày, nên được bầu làm thủ quỹ hội phụ huynh. Cuối kỳ, sổ quỹ thiếu một khoản, và trưởng ban muốn ghi là chi khác.", [
    C("Ghi chi khác cho xong", { counters: { honest: -1 }, rel: 1 }, "Êm chuyện, tên bạn nằm trên sổ"),
    C("Dán sổ thu chi công khai cho cả lớp xem", { agency: 0.02, counters: { honest: 1, hmk_self: 1 }, gamble: { p: 0.5, win: { flags: ["leader"], log: "Trưởng ban hoàn lại khoản thiếu. Các phụ huynh bầu bạn làm trưởng ban năm sau." }, lose: { rel: -3, log: "Trưởng ban đi nói khắp nơi rằng bạn rảnh nên hay soi." } } }, "Minh bạch, đụng người có tiếng nói", { tier: "sovereign" }),
    C("Xin thôi làm thủ quỹ", { flags: ["hmk_quit_pta"], happy: 1 }, "Thoát việc phiền, để một chuyện sai trôi qua")], 0)),
  daily(H, "hmk_class", [20, 60], 8, (c) => T("Lớp học buổi sáng", vary("hmkc", c.age, [
    "Trung tâm cộng đồng mở lớp kế toán miễn phí từ tám đến mười giờ sáng, đúng giờ bạn thường đi chợ.",
    "Một lớp ngoại ngữ buổi sáng giảm học phí cho người không có việc làm. Lớp có mười hai người, phần lớn tóc đã điểm bạc."]), [
    C("Đi học, dời giờ đi chợ", { know: 4, bw: -2, counters: { hmk_self: 1 }, flags: ["hmk_course"] }, "Mở đầu óc, nhà kém chu đáo hơn"),
    C("Ở nhà, việc nào cũng gấp", { happy: -1, counters: { hmk_dep: 1 } }, "Nhà chu đáo, sách vở xa dần")], 0)),
  daily(H, "hmk_pension", [28, 60], 9, (c, N) => { const { sp, who } = earner(c, N);
    return T("Già rồi lấy gì mà sống", "Một người hàng xóm làm nội trợ cả đời, nay góa, sống nhờ từng đồng con gửi về. Bạn tính thử: ngày bạn sáu mươi, không lương hưu, không bảo hiểm, không tài sản đứng tên.", [
      C("Tự đóng bảo hiểm hưu trí tự nguyện", { money: -0.06, flags: ["hmk_pension"], counters: { hmk_self: 1 } }, "Bớt tiền nhà bây giờ, có chỗ dựa tuổi già", { longterm: true }),
      C("Tin vào con cái sau này", { counters: { hmk_dep: 1 }, happy: 1 }, "Nhẹ đầu bây giờ, trông vào người khác về sau"),
      C("Nhờ người giữ tiền đóng hộ, ghi vào giấy", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["hmk_pension", "hmk_written_deal"], log: `Tờ giấy có chữ ký của ${who}, cất trong ngăn tủ cùng giấy tờ nhà.` }, lose: { ...(sp ? { trust: { npc: sp, delta: -0.1 } } : {}), happy: -2, log: "Câu trả lời là: tiền nhà cũng là tiền chung, cần gì giấy." } } }, "Có cam kết rõ, có thể bị cho là tính toán", { tier: "sovereign" })], 0, sp ? { npc: sp } : {}); }),
  daily(H, "hmk_quit", [25, 60], 99, () => T("Tờ tuyển dụng ở cửa siêu thị", "Siêu thị đầu ngõ tuyển thu ngân ca sáng, nhận cả người lớn tuổi và người nghỉ việc lâu năm. Lương không cao, nhưng là tiền của bạn.", [
    C("Nộp đơn, đi làm lại", { ...leave(H), flags: ["hmk_back_to_work"], money: 0.05, bw: -3 }, "Có lương riêng, việc nhà dồn vào buổi tối"),
    C("Ở nhà thêm một thời gian", { happy: -1, counters: { hmk_dep: 1 } }, "Nhà vẫn êm, túi vẫn rỗng")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(H, "hmk_family", [22, 60], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Cả ngày ở nhà có làm gì đâu", `Trong một trận cãi nhau, ${N(k)} buột miệng: cả ngày ở nhà thì có làm gì đâu mà mệt. Rồi đóng sầm cửa phòng.`, [
      C("Giao con lo việc nhà trọn một tuần", { gamble: { p: 0.6, win: { trust: { npc: k, delta: 0.2 }, counters: { hmk_self: 1 }, log: `Đến ngày thứ ba, ${N(k)} hỏi bạn làm sao nhớ được hết mọi thứ.` }, lose: { trust: { npc: k, delta: -0.1 }, log: `${N(k)} làm qua loa, nhà bừa suốt một tuần, hai người không nói với nhau.` } } }, "Con có thể hiểu, nhà có thể loạn", { tier: "awakened" }),
      C("Im lặng, vào bếp nấu tiếp", { happy: -4, counters: { hmk_dep: 1 } }, "Êm nhà, nỗi buồn để trong bụng"),
      C("Nói thẳng câu ấy làm mình đau", { trust: { npc: k, delta: 0.05 }, rel: 1 }, "Thật lòng, có thể con chưa nghe được")], 0, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Ăn học bao năm để ở nhà", `${N(p)} thở dài với hàng xóm: nuôi ăn học bao năm, giờ con ở nhà nấu cơm. Câu ấy đến tai bạn qua ba người.`, [
      C("Ngồi kể cho cha mẹ nghe một ngày của mình", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.2 }, log: `${N(p)} nghe xong, lần sau gặp hàng xóm thì khoe con quán xuyến cả nhà.` }, lose: { trust: { npc: p, delta: -0.05 }, log: `${N(p)} gật đầu cho qua, tuần sau lại thở dài.` } } }, "Có thể được hiểu, có thể chẳng đổi gì"),
      C("Bảo cha mẹ đừng xen vào đời mình", { trust: { npc: p, delta: -0.15 }, happy: 1 }, "Rạch ròi, cha mẹ tự ái"),
      C("Nhận thêm việc làm nhỏ cho cha mẹ yên lòng", { money: 0.03, bw: -3, counters: { hmk_self: 1 } }, "Cha mẹ yên tâm, bạn bận thêm")], 0, { npc: p });
  }),
];

export const PACK_STREET_B: Storylet[] = [...GRD_CARDS, ...HMK_CARDS];
