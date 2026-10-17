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

/* =====================================================================
 * NGƯỜI LÀM NGHỀ TANG LỄ — tiền tố fnr_
 * Cái chết kể bằng sự dịu dàng của người tiễn đưa; không tả thân thể, chỉ kể việc, giá và lòng người.
 * ===================================================================== */
const FW = "funeral_worker";

const FNR_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(FW, "fnr_t_vigil", [12, 16], () => true, (c) => T("Đêm thức canh linh cữu", `${vn(c) ? "Trong đám tang ông nội ở quê" : "Trong đám tang của người ông"}, người lớn khóc, trẻ con sợ. Chỉ có bạn ngồi cạnh bác làm dịch vụ tang lễ suốt đêm: đưa nến, xếp ghế, ghi sổ người đến viếng không sót một ai. Bác bảo hiếm đứa trẻ nào bình tĩnh được như thế.`, [
    C("Xin theo bác phụ việc mùa hè", { flags: [talentFlag(FW)], counters: { talents_seen: 1 }, money: 0.02, rel: -1 }, "Bị bạn bè trêu, mở một con đường"),
    C("Thôi, chuyện buồn để người lớn lo", { happy: 1, counters: { talents_seen: 1 } }, "Tuổi thơ nhẹ nhõm, sự bình tĩnh ấy để yên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FW, "fnr_d_hire", [18, 50], () => true, () => T("Cơ sở tang lễ tuyển người", "Một cơ sở dịch vụ tang lễ cần người phụ việc: trực điện thoại đêm, đi đón người mất, dựng rạp, lo giấy tờ. Lương cao hơn mặt bằng một nửa vì ít ai chịu làm. Người nhà bạn nghe xong thì im lặng rất lâu.", [
    C("Nhận việc, chịu lời ra tiếng vào", { ...become(FW), counters: { doors_seen: 1 }, rel: -2 }, "Lương khá, nhiều người sẽ ngại bạn"),
    C("Làm thử một tháng, giữ việc cũ", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.45, win: { ...become(FW), log: "Hết tháng, bạn nhận ra mình làm được việc mà nhiều người không làm được. Bạn ở lại." }, lose: { happy: -2, log: "Đến đám thứ năm, bạn xin thôi. Đêm nào cũng mơ thấy tiếng kèn." } } }, "Ít liều hơn, mệt gấp đôi"),
    C("Thôi, nghề này nặng quá", { counters: { doors_seen: 1 } }, "Nhẹ đầu, bỏ qua một nghề ít người tranh")], 0)),
  door(FW, "fnr_d_uncle", [22, 55], () => true, () => T("Cửa hàng của người chú", "Người chú họ làm nghề tang lễ ba mươi năm, nay yếu, các con chú không ai chịu nối nghề. Chú gọi bạn đến, đưa chùm chìa khóa và cuốn sổ ghi tên mấy nghìn người chú đã tiễn.", [
    C("Nhận cửa hàng, học nghề từ chú", { ...become(FW), counters: { doors_seen: 1 }, money: -0.1, flags: ["fnr_heir"] }, "Có nghề và cửa hàng, gánh cả tiếng tăm của chú"),
    C("Giúp chú bán cửa hàng lấy tiền dưỡng già", { counters: { doors_seen: 1 }, rel: 2, happy: 1 }, "Chú yên tuổi già, cuốn sổ khép lại"),
    C("Từ chối, bận việc của mình", { counters: { doors_seen: 1 }, rel: -1 }, "Giữ đời mình, chú buồn")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(FW, 1, 1, (c) => T("Người đầu tiên bạn tiễn", "Một cụ bà mất ở nhà lúc gần sáng. Con gái cụ xin cho mẹ mặc chiếc áo cụ tự may từ ngày cưới, và muốn tự tay chải tóc cho mẹ lần cuối. Theo lệ của cơ sở, người nhà không vào phòng chuẩn bị. Hôm ấy còn ba đám đang chờ.", [
    C("Mời người con vào cùng chải tóc cho mẹ", { counters: step(c, FW, { fnr_grace: 1 }), bw: -2, flags: ["fnr_family_in"] }, "Chậm cả lịch, người nhà nhớ mãi"),
    C("Làm đúng lệ, nhanh và chu đáo", { counters: step(c, FW), money: 0.02, flags: ["fnr_by_rule"] }, "Kịp ba đám kia, người con đứng ngoài cửa")], 0)),
  beat(FW, 2, 3, (c) => T("Bảng giá ba hạng", `${f(c, "fnr_heir") ? "Một chuỗi dịch vụ tang lễ đề nghị gắn biển hiệu của họ lên cửa hàng của chú, kèm bảng giá ba hạng và một kịch bản bán hàng:" : "Cơ sở bắt đầu bán gói trọn gói. Quản lý đưa bạn một kịch bản bán hàng:"} gặp gia đình khi họ chưa kịp khóc, giới thiệu gói đắt nhất trước, nhắc rằng ai cũng muốn tiễn cha mẹ cho đàng hoàng. Theo kịch bản, thu nhập của bạn sẽ gần gấp đôi.`, [
    C("Theo kịch bản, mời gói đắt nhất trước", { counters: step(c, FW, { honest: -1 }), income_mult: 1.5, flags: ["fnr_upsell"] }, "Thu nhập vọt lên, nỗi đau được tính theo giá"),
    C("Đưa đủ bảng giá, để gia đình tự chọn", { counters: step(c, FW, { fnr_grace: 1 }), income_mult: 1.1, flags: ["fnr_fair_price"] }, "Thu nhập vừa phải, người ta tin bạn"),
    C("Mở dịch vụ nhỏ của mình, niêm yết giá công khai", { counters: step(c, FW), money: -0.4, agency: 0.03, gamble: { p: 0.5, win: { flags: ["fnr_own_house"], income_mult: 1.3, log: "Bảng giá dán ngay cửa và đăng lên mạng. Tháng thứ sáu, khách đến vì nghe người quen kể." }, lose: { income_mult: 0.8, log: "Ba tháng đầu không có đám nào. Bạn phải nhận làm thuê thêm cho chỗ cũ." } } }, "Tự chủ, minh bạch, vốn và tên tuổi đặt cược", { tier: "sovereign" })], 1)),
  beat(FW, 3, 4, (c) => T("Tuần có quá nhiều đám", `${c.poor_country ? "Sau trận lũ lớn" : "Giữa một đợt dịch"}, chỉ trong một tuần cơ sở nhận bốn mươi người mất, gấp mười ngày thường. Phòng lạnh đã kín chỗ, xe chạy suốt đêm. Chính quyền yêu cầu làm nhanh, gọn, hạn chế người đến viếng. ${f(c, "fnr_upsell") ? "Quản lý gợi ý tính giá mùa cao điểm. " : ""}Bạn đã ngủ bốn tiếng trong hai ngày.`, [
    C("Làm không nghỉ, đủ lễ cho từng người", { counters: step(c, FW, { fnr_grace: 2, fnr_weight: 2 }), health: -8 }, "Giữ phẩm giá cho người mất, thân bạn trả giá"),
    C("Làm theo yêu cầu: nhanh, gọn, đủ giấy tờ", { counters: step(c, FW, { fnr_weight: 1 }), money: 0.1, flags: ["fnr_followed_order"] }, "Kịp việc, nhiều gia đình không kịp chào"),
    f(c, "fnr_upsell")
      ? C("Tính giá mùa cao điểm như quản lý bảo", { counters: step(c, FW, { honest: -2 }), money: 0.4, flags: ["fnr_profiteer"] }, "Tiền nhiều, tên bạn nằm trên từng hóa đơn")
      : C("Gọi tình nguyện viên, gọi video cho người nhà", { counters: step(c, FW, { fnr_grace: 1 }), agency: 0.03, gamble: { p: 0.55, win: { flags: ["fnr_volunteers"], log: "Mười hai người tình nguyện đến. Đám nào cũng có một cuộc gọi video cho người thân ở xa." }, lose: { bw: -5, log: "Chỉ ba người đến. Bạn vẫn phải làm gần hết." } } }, "Mở cửa cho cộng đồng, thêm việc phải điều phối", { tier: "sovereign" }),
    C("Xin nghỉ, rời khỏi nghề", { counters: step(c, FW), ...leave(FW), flags: ["ex_funeral"], happy: -3 }, "Thoát khỏi tuần ấy, mang nó theo")], 0)),
  beat(FW, 4, 5, (c) => {
    if (f(c, "fnr_profiteer")) return T("Bài báo về giá tang lễ mùa dịch", "Một tờ báo đăng loạt bài về các cơ sở tang lễ tăng giá giữa mùa dịch. Hóa đơn có chữ ký của bạn nằm trong ảnh minh họa. Ba gia đình đòi hoàn tiền; quản lý nói với nhà báo rằng nhân viên tự quyết định giá.", [
      C("Công khai xin lỗi, hoàn tiền cho các gia đình", { counters: step(c, FW, { honest: 2 }), custom: "apologize", money: -0.4, flags: ["fnr_repaid"] }, "Mất tiền, gỡ lại một phần tên mình"),
      C("Im lặng, để công ty lo", { counters: step(c, FW), income_mult: 0.85, happy: -5, flags: ["fnr_hid"] }, "Giữ tiền, mang tiếng suốt nghề"),
      C("Bỏ nghề, chuyển đi nơi khác", { counters: step(c, FW), ...leave(FW), flags: ["ex_funeral"], rel: -2 }, "Tránh được ánh mắt, mất cả nghề")], 0);
    if (n(c, "fnr_grace") >= 3 || f(c, "fnr_own_house") || f(c, "fnr_fair_price") || f(c, "fnr_volunteers")) return T("Người cả vùng tin cậy", `${f(c, "fnr_own_house") ? "Cơ sở nhỏ của bạn" : "Tên bạn"} được cả vùng tin: nhiều nhà dặn con cháu khi nào mình đi thì gọi người ấy. Một chuỗi dịch vụ lớn muốn ${f(c, "fnr_own_house") ? "mua lại cơ sở" : "mời bạn về làm giám đốc chi nhánh"}, với điều kiện dùng bảng giá và kịch bản của họ.`, [
      C("Nhận lời, đổi lấy tiền lớn", { counters: step(c, FW), ...(f(c, "fnr_own_house") ? { money: 1.2 } : { income_mult: 1.5 }), flags: ["fnr_sold"] }, "Đủ đầy, bảng giá không còn là của bạn"),
      C("Lập hội tang lễ tương trợ cho cả phố", { counters: step(c, FW), agency: 0.03, gamble: { p: 0.5, win: { flags: ["fnr_mutual_fund"], counters: { fnr_grace: 1 }, log: "Ba trăm hộ tham gia. Không nhà nào trong hội phải đi vay để lo tang." }, lose: { money: -0.2, log: "Quỹ thiếu người đóng, hai năm sau phải giải tán. Bạn bù phần còn thiếu." } } }, "Làm luật mới cho cả phố, tiền chung dễ sinh chuyện", { tier: "sovereign" }),
      C("Giữ nguyên quy mô, nhận học trò", { counters: step(c, FW), flags: ["fnr_mentor"], happy: 3 }, "Không giàu thêm, nghề có người nối")], 0);
    return T("Mười năm nỗi buồn của người khác", "Bạn bắt đầu mất ngủ. Tiếng khóc ở các đám đi theo bạn về nhà, vào cả bữa cơm. Có hôm đang nói chuyện với người thân, bạn bỗng không nghe được gì. Một đồng nghiệp lớn tuổi bảo: nghề này ai rồi cũng đến lúc ấy.", [
      C("Đi gặp chuyên gia tâm lý, nói hết", { counters: step(c, FW, { fnr_weight: -2 }), money: -0.05, health: 4, flags: ["fnr_therapy"] }, "Tốn tiền và thời gian, có thể nhẹ lòng", { tier: "awakened" }),
      C("Uống vài ly mỗi tối cho dễ ngủ", { counters: step(c, FW, { drink: 2 }), health: -5 }, "Ngủ được, gan trả giá"),
      C("Chuyển sang làm giấy tờ, không gặp gia đình", { counters: step(c, FW), income_mult: 0.85, flags: ["fnr_back_office"] }, "Đỡ nặng lòng, xa phần ý nghĩa của nghề")], 0);
  }),
  beat(FW, 5, 6, (c) => T("Bản dặn dò của chính mình", `Một người đàn ông trung niên tìm đến: cha anh vừa mất, và anh muốn chính bạn lo. ${f(c, "fnr_family_in") ? "Anh là cháu của cụ bà năm xưa, người được con gái tự tay chải tóc. " : ""}Tối ấy, bạn ngồi viết bản dặn dò cho đám tang của mình. ${f(c, "fnr_profiteer") ? "Bạn gạch đi rồi viết lại dòng về tiền nhiều lần." : f(c, "fnr_mutual_fund") ? "Bạn ghi số thẻ hội viên của hội tương trợ lên đầu trang." : "Chỉ vài dòng, không kèn trống."}`, [
    C("Nhận lo cho cha anh, dẫn học trò theo", { counters: step(c, FW, { fnr_grace: 1 }), flags: ["passed_on"], health: -1 }, "Thêm một đám nặng, để lại cách làm nghề"),
    C("Giới thiệu người trẻ lo, mình nghỉ hẳn", { counters: step(c, FW), ...leave(FW), happy: 4 }, "Khép nghề nhẹ người, anh ấy hơi buồn"),
    C("Viết bản dặn dò thành sổ tay cho các gia đình", { counters: step(c, FW), money: -0.03, agency: 0.01, flags: ["fnr_guidebook"] }, "Tốn công, nhiều nhà bớt hoang mang", { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(FW, "fnr_short", [18, 65], 8, (c) => T("Gia đình chỉ đủ một phần ba", vary("fnrs", c.age, [
    "Một gia đình nghèo chỉ trả được một phần ba gói rẻ nhất. Người con trai đặt lên bàn chiếc nhẫn cưới của mẹ.",
    "Một người đàn ông sống một mình mất trong phòng trọ. Người duy nhất đến lo là bà chủ trọ, với một phong bì mỏng."]), [
    C("Làm đủ lễ, bù bằng tiền của mình", { money: -0.05, counters: { fnr_grace: 1 } }, "Đúng lòng, hụt túi"),
    C("Làm đúng phần tiền họ trả", { money: 0.01, counters: { fnr_weight: 1 } }, "Đúng sổ sách, áy náy về nhà"),
    C(`Gọi ${vn(c) ? "nhà chùa và hội người cao tuổi" : "nhóm thiện nguyện trong khu"} cùng góp`, { gamble: { p: 0.6, win: { counters: { fnr_grace: 1 }, flags: ["fnr_network"], log: "Trong một buổi chiều, đủ tiền và đủ người khiêng. Đám tang đông hơn người ta tưởng." }, lose: { money: -0.03, log: "Không ai trả lời kịp. Bạn bù phần thiếu." } } }, "Có thể đủ cả lễ lẫn tiền, tốn một buổi gọi điện", { tier: "awakened" })], 0)),
  daily(FW, "fnr_siblings", [18, 65], 9, () => T("Hai người con, hai cách tiễn", "Hai người con cãi nhau ngay trong nhà tang lễ: một người muốn hỏa táng theo di nguyện, người kia muốn chôn cất theo lệ họ. Cả hai cùng quay sang hỏi bạn.", [
    C("Tìm người làm chứng di nguyện, theo đúng ý người mất", { bw: -2, gamble: { p: 0.6, win: { counters: { fnr_grace: 1 }, log: "Người bạn già của người mất đọc lại tờ giấy viết tay. Hai anh em lặng lẽ ký." }, lose: { rel: -2, log: "Không ai có giấy tờ. Người em bỏ về giữa chừng." } } }, "Đúng ý người mất, có thể mất lòng người sống"),
    C("Làm theo người đứng tên trả tiền", { money: 0.03, counters: { honest: -1 } }, "Nhanh gọn, một người con ôm hận"),
    C("Đề nghị một lễ nhỏ theo mỗi cách", { bw: -3, counters: { fnr_grace: 1 }, flags: ["fnr_two_rites"] }, "Tốn thêm một ngày, cả hai được tiễn theo cách mình", { tier: "awakened" })], 0)),
  daily(FW, "fnr_stigma", [18, 65], 8, (c) => T("Không ai muốn bắt tay", vary("fnrg", c.age, [
    "Ở một đám cưới, nghe bạn làm nghề gì, người ngồi cạnh lặng lẽ đổi chỗ.",
    "Chủ nhà trọ nghe nghề của bạn thì bảo phòng vừa có người thuê. Hôm sau tấm biển cho thuê vẫn còn đó."]), [
    C("Giấu nghề, nói mình làm tổ chức sự kiện", { flags: ["fnr_hidden_job"], happy: -2 }, "Đỡ ánh mắt, sống hai mặt"),
    C("Nói thẳng, ai sợ thì thôi", { rel: -2, counters: { fnr_pride: 1 } }, "Đứng thẳng, ít bạn đi")], 1)),
  daily(FW, "fnr_night_call", [18, 65], 8, (c) => T("Cuộc gọi lúc ba giờ sáng", vary("fnrn", c.age, [
    "Ba giờ sáng, điện thoại trực reo. Một người mất ở nhà, gia đình hoảng loạn, không biết phải làm gì trước.",
    "Đêm mưa to, một gia đình ở xóm ven sông gọi. Đường ngập đến đầu gối."]), [
    C("Đi ngay", { health: -2, counters: { fnr_grace: 1 } }, "Gia đình yên lòng, bạn mất giấc"),
    C("Hướng dẫn qua điện thoại, sáng sớm đến", { health: 1, counters: { fnr_weight: 1 } }, "Giữ sức, họ trải qua đêm một mình")], 0)),
  daily(FW, "fnr_rites", [18, 65], 9, () => T("Nghi lễ bạn chưa từng làm", "Một gia đình mới đến định cư theo một tôn giáo bạn chưa từng tiếp xúc. Họ cần những nghi thức riêng, có giờ giấc riêng, và không ai trong cơ sở biết làm.", [
    C("Ngồi học từ người già trong gia đình họ", { know: 3, bw: -2, counters: { fnr_grace: 1 }, flags: ["fnr_many_rites"] }, "Tốn thời gian, mở lòng với một cộng đồng"),
    C("Giới thiệu sang cơ sở khác", { money: -0.02, flags: ["fnr_referred"] }, "Không làm sai, mất khách")], 0)),
  daily(FW, "fnr_kickback", [18, 65], 9, () => T("Hoa hồng ở nhà xác bệnh viện", "Một nhân viên nhà xác bệnh viện gợi ý: mỗi gia đình anh ta chỉ sang chỗ bạn, bạn gửi lại một phần mười. Anh ta bảo các cơ sở khác đều làm vậy.", [
    C("Đồng ý chia phần", { income_mult: 1.15, counters: { honest: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "trả hoa hồng cho người chỉ khách ở nhà xác bệnh viện" } }, "Đông khách, một bí mật"),
    C("Từ chối", { income_mult: 0.95, counters: { honest: 1 } }, "Sạch tay, mất khách"),
    C("Báo ban giám đốc bệnh viện", { counters: { honest: 1 }, gamble: { p: 0.4, win: { flags: ["fnr_reported"], log: "Bệnh viện dán bảng danh sách các cơ sở tang lễ, ghi rõ: gia đình tự chọn." }, lose: { rel: -2, log: "Không ai bị kỷ luật. Bạn bị cả giới tang lễ trong vùng xa lánh." } } }, "Sửa luật chơi, có thể bị cô lập", { tier: "awakened" })], 1)),
  daily(FW, "fnr_sleepless", [18, 65], 8, (c) => T("Tiếng khóc theo về nhà", vary("fnrl", c.age, [
    "Đã ba đêm bạn không ngủ được. Gương mặt một người mẹ ở đám hôm thứ hai cứ trở lại.",
    "Mùa này nhiều đám người trẻ. Về nhà, bạn ngồi im trong bóng tối rất lâu."]), [
    C("Ngồi nói chuyện với đồng nghiệp lâu năm", { counters: { fnr_weight: -1 }, rel: 1, bw: -1 }, "Nhẹ lòng, phải mở lòng"),
    C("Uống vài ly cho dễ ngủ", { counters: { drink: 1 }, health: -2 }, "Ngủ được đêm nay"),
    C("Làm tiếp, bận thì quên", { counters: { fnr_weight: 1 }, money: 0.02 }, "Có thêm tiền, nỗi nặng tích lại")], 0)),
  daily(FW, "fnr_simple", [18, 65], 9, () => T("Tang lễ không kèn không trống", "Một gia đình trẻ muốn tiễn người cha thật giản dị: không kèn, không vòng hoa, tro cốt trồng dưới gốc cây. Họ hàng lớn tuổi bảo làm thế là bất hiếu, rồi nhìn bạn chờ bạn can.", [
    C("Đứng về phía di nguyện, giải thích với họ hàng", { gamble: { p: 0.55, win: { flags: ["fnr_green"], counters: { fnr_grace: 1 }, log: "Buổi tiễn chỉ có hai mươi người và một cây non. Một bà cụ trong họ dặn bạn sau này làm cho bà như thế." }, lose: { rel: -2, log: "Họ hàng bỏ về. Gia đình trẻ vẫn cảm ơn bạn." } } }, "Đúng người mất, mất lòng người già"),
    C("Khuyên gia đình thêm vài nghi lễ cho êm", { money: 0.03, flags: ["fnr_compromise"] }, "Êm họ, di nguyện bớt đi một phần")], 0)),
  daily(FW, "fnr_film", [20, 65], 9, () => T("Máy quay trong nhà tang lễ", "Một người làm phim tài liệu muốn quay một ngày làm việc của bạn cho loạt phim về những nghề ít ai thấy. Họ hứa không quay mặt người mất.", [
    C("Nhận lời, kể thật về nghề", { gamble: { p: 0.5, win: { counters: { fnr_grace: 1 }, flags: ["fnr_documentary"], log: "Phim được chiếu khắp nơi. Ba người trẻ viết thư xin học nghề." }, lose: { rel: -2, log: "Một gia đình nhận ra đám của nhà mình trong phim, gọi đến trách." } } }, "Nghề được hiểu hơn, riêng tư dễ vỡ"),
    C("Từ chối, nghề này cần kín đáo", { flags: ["fnr_private"] }, "Giữ kín cho các gia đình, nghề vẫn bị hiểu lầm")], 1)),
  daily(FW, "fnr_quit", [30, 60], 99, () => T("Lời mời sang nghề tiệc cưới", "Một người quen mở công ty tổ chức sự kiện, cần người cẩn thận, giỏi lo hậu cần dưới áp lực. Họ bảo: tiệc cưới cũng là một buổi lễ, chỉ vui hơn.", [
    C("Nhận lời, rời nghề tang lễ", { ...leave(FW), flags: ["ex_funeral"], happy: 2 }, "Vui hơn, bỏ lại những gia đình cần bạn"),
    C("Ở lại với nghề", { counters: { fnr_grace: 1 }, happy: -1 }, "Giữ nghề, nỗi buồn vẫn theo về")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(FW, "fnr_family", [22, 60], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Không ai ngồi cạnh con ở lớp", `${N(k)} về nhà, ném cặp xuống: bạn cùng lớp không ai chịu ngồi cạnh vì biết nghề của bạn.`, [
      C("Đến lớp nói chuyện về nghề với cả lớp", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.25 }, log: `Bạn kể chuyện chải tóc cho một cụ bà. Cả lớp im phăng phắc. Hôm sau có người ngồi cạnh ${N(k)}.` }, lose: { trust: { npc: k, delta: -0.15 }, log: `Cả lớp cười khúc khích. ${N(k)} không nói chuyện với bạn ba ngày.` } } }, "Có thể đổi cả lớp, có thể làm con ngượng thêm", { tier: "awakened" }),
      C("Dặn con đừng nói nghề của cha mẹ với ai", { trust: { npc: k, delta: -0.1 }, flags: ["fnr_hidden_job"] }, "Con đỡ bị trêu, học cách giấu"),
      C("Ôm con, kể vì sao mình chọn nghề", { trust: { npc: k, delta: 0.1 }, happy: -1 }, "Gần con, chuyện ở lớp vẫn còn đó")], 2, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Lời dặn của cha mẹ", `${N(p)} gọi bạn ngồi xuống, nói chậm: "Sau này đến lượt cha mẹ, con lo nhé. Đừng to, đừng tốn. Nhưng con lo."`, [
      C("Hứa sẽ tự tay lo", { trust: { npc: p, delta: 0.2 }, promise: { to: p, what: "tự tay lo một đám tang giản dị cho cha mẹ", years: 10 } }, "Cha mẹ yên lòng, một lời hứa nặng"),
      C("Bảo cha mẹ đừng nói chuyện gở", { trust: { npc: p, delta: -0.05 }, happy: 1 }, "Né được câu chuyện, bỏ lỡ một lời dặn"),
      C("Ngồi ghi lại cùng cha mẹ từng mong muốn", { trust: { npc: p, delta: 0.25 }, happy: -1, flags: ["fnr_parent_wishes"] }, "Một buổi tối nặng lòng, sau này không phải đoán", { tier: "awakened" })], 2, { npc: p });
  }),
];

/* =====================================================================
 * NGƯỜI CHĂM BỆNH — tiền tố cgv_
 * Bệnh tật và cái chết kể bằng sự dịu dàng; không tả chi tiết thân thể. Gánh nặng là của người chăm.
 * ===================================================================== */
const CG = "caregiver";

const CGV_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(CG, "cgv_t_grandma", [9, 15], () => true, () => T("Bà chỉ uống thuốc khi bạn đưa", "Bà nằm một chỗ đã nửa năm. Người lớn đi làm cả ngày; chỉ có bạn biết cách đỡ bà ngồi dậy, bón từng thìa cháo, và bà chỉ chịu uống thuốc khi bạn đưa. Cô y tá khu phố đến khám, bảo bạn có đôi tay của người chăm bệnh.", [
    C("Xin ở nhà với bà sau giờ học", { flags: [talentFlag(CG)], counters: { talents_seen: 1 }, rel: 2, know: -2 }, "Bà yên lòng, bạn lỡ nhiều buổi chơi, mở một con đường"),
    C("Để người lớn thuê người chăm bà", { money: -0.02, happy: 1, counters: { talents_seen: 1 } }, "Tuổi thơ nhẹ hơn, bà phải quen người lạ")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CG, "cgv_d_ward", [18, 55], () => true, (c) => T("Giường bệnh cần người ngồi cạnh", vn(c)
    ? "Ở hành lang bệnh viện tỉnh, những người nuôi bệnh thuê ngồi chờ khách trên chiếu gấp. Một người quen bảo bạn: trả theo ngày, bao ăn, ngủ ngay cạnh giường bệnh. Khách lúc nào cũng thiếu người."
    : "Một trung tâm dưỡng lão tuyển nhân viên chăm sóc, ca mười hai tiếng, nhận cả người chưa có chứng chỉ và đào tạo ba tuần. Lương thấp, nhưng trung tâm lúc nào cũng thiếu người.", [
    C("Nhận việc ngay tuần này", { ...become(CG), counters: { doors_seen: 1 }, health: -1 }, "Có việc ngay, học nghề bằng chính đôi tay"),
    C("Học một khóa ngắn trước rồi mới nhận", { counters: { doors_seen: 1 }, money: -0.05, know: 2, gamble: { p: 0.55, win: { ...become(CG), flags: ["cgv_certified"], log: "Bạn cầm chứng chỉ đi xin việc. Ngay tuần đầu đã có ba nơi gọi." }, lose: { happy: -1, log: "Khóa học dời lịch hai lần. Bạn tìm việc khác trong lúc chờ." } } }, "Tốn tiền và thời gian, vào nghề vững hơn"),
    C("Thôi, nghề này cực quá", { counters: { doors_seen: 1 } }, "Giữ sức mình, bỏ qua một nghề luôn thiếu người")], 0)),
  door(CG, "cgv_d_neighbor", [25, 60], (c) => c.parent_sick && (!!role(c, "father") || !!role(c, "mother")), (c, N) => { const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Sau hai năm chăm cha mẹ", `Bạn đã gác việc hai năm để chăm ${N(p)} ốm. Một người hàng xóm thấy bạn kiên nhẫn, sang hỏi bạn có nhận chăm người chồng nằm liệt của bà không, trả theo tháng, nhà ngay đầu ngõ.`, [
      C("Nhận, vừa chăm cha mẹ vừa chăm thuê", { ...become(CG), counters: { doors_seen: 1 }, bw: -4, trust: { npc: p, delta: -0.05 } }, "Có thu nhập lại, sức chia đôi"),
      C("Từ chối, chỉ lo cho cha mẹ", { counters: { doors_seen: 1 }, trust: { npc: p, delta: 0.1 }, money: -0.05 }, "Cha mẹ trọn vẹn, nhà vẫn hụt tiền"),
      C("Nhận, rủ một người bạn cùng thay ca", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.55, win: { ...become(CG), flags: ["cgv_shift_partner"], log: "Bạn và một người bạn cũ chia ca sáng tối. Không ai phải thức trắng." }, lose: { bw: -2, log: "Người bạn bận việc riêng. Bà hàng xóm tìm được người khác." } } }, "Bền sức hơn, phải chia tiền", { tier: "awakened" })], 0, { npc: p }); }),
  door(CG, "cgv_d_hospice", [22, 50], () => true, () => T("Ca đêm ở khoa cuối đời", "Một khoa chăm sóc giảm nhẹ cần người trực đêm ngồi bên những người sắp đi xa, để không ai phải đi một mình. Lương thấp, có bảo hiểm và một chỗ ngủ.", [
    C("Nhận ca đêm ở khoa", { ...become(CG), counters: { doors_seen: 1 }, happy: -1, flags: ["cgv_hospice"] }, "Một nghề có ý nghĩa, nhiều đêm nặng lòng"),
    C("Chỉ đến làm tình nguyện cuối tuần", { counters: { doors_seen: 1 }, rel: 2, bw: -2 }, "Giữ việc cũ, chạm vào nghề từ xa")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(CG, 1, 1, (c) => T("Người bệnh đầu tiên", "Ông cụ sau tai biến không chịu cho bạn lau người, hất đổ bát cháo, gọi bạn là người lạ trong nhà. Con gái ông trả tiền theo ngày và nói thẳng: hai người trước đều bỏ sau một tuần.", [
    C("Kiên nhẫn từng chút, hỏi ông về nghề cũ", { counters: step(c, CG), bw: -3, gamble: { p: 0.55, win: { counters: { cgv_bond: 1 }, flags: ["cgv_patient"], log: "Ông từng là thợ sửa đồng hồ. Tuần thứ hai, ông để bạn lau tay, vừa lau vừa kể chuyện những chiếc đồng hồ." }, lose: { happy: -2, log: "Ông vẫn hất đổ bát cháo. Bạn lau sàn ba lần một ngày." } } }, "Mất sức, có thể chạm được ông"),
    C("Làm đúng việc, giữ khoảng cách", { counters: step(c, CG), money: 0.02, flags: ["cgv_distance"] }, "Đỡ hao lòng, ông vẫn coi bạn là người lạ")], 0)),
  beat(CG, 2, 3, (c) => T("Ba lời mời cùng một lúc", `Tiếng lành đồn xa. ${f(c, "cgv_patient") ? "Con gái ông cụ thợ đồng hồ đã giới thiệu bạn cho bốn nhà. " : ""}Một gia đình khá giả muốn bạn ở hẳn nhà họ chăm bà cụ, lương gấp ba, mỗi tháng nghỉ một ngày. Một trung tâm môi giới muốn đưa bạn vào danh sách, giữ lại ba phần mười. Mấy người cùng nghề thì rủ bạn lập nhóm.`, [
    C("Ở hẳn nhà họ, lương gấp ba", { counters: step(c, CG), income_mult: 1.6, flags: ["cgv_live_in"], rel: -3 }, "Tiền nhiều, đời bạn thu vào một căn phòng"),
    C("Ký với trung tâm, họ giữ ba phần mười", { counters: step(c, CG), income_mult: 1.2, flags: ["cgv_agency"] }, "Đều khách, có người đứng giữa, mất một phần lương"),
    C("Lập nhóm cùng nghề, tự đặt giá và ca nghỉ", { counters: step(c, CG), agency: 0.03, gamble: { p: 0.5, win: { flags: ["cgv_collective"], income_mult: 1.3, log: "Tám người, một bảng giá chung, ai cũng được nghỉ một ngày mỗi tuần." }, lose: { income_mult: 1.05, log: "Nhóm cãi nhau chuyện chia khách, tan sau nửa năm." } } }, "Tự làm luật cho nghề, chung chạ dễ vỡ", { tier: "sovereign" })], 0)),
  beat(CG, 3, 4, (c) => T("Đêm bà cụ ngã", `Đã ${f(c, "cgv_live_in") ? "năm tuần bạn không có ngày nghỉ" : "hai mươi tiếng bạn chưa chợp mắt"}. Bốn giờ sáng, bà cụ tự đứng dậy và ngã. Bạn đỡ kịp, nhưng lưng bạn nhói lên, còn tay bà bị nứt xương. Gia đình nói bạn sơ suất, đòi trừ hai tháng lương. ${f(c, "cgv_agency") ? "Trung tâm môi giới bảo đây là chuyện giữa bạn và gia đình. " : ""}${f(c, "cgv_collective") ? "Nhóm của bạn đề nghị cử người thay ca để bạn đi khám lưng." : ""}`, [
    C("Nhận lỗi, chịu trừ lương", { counters: step(c, CG, { cgv_load: 1 }), money: -0.15 }, "Giữ việc, nuốt nỗi oan, lưng chưa được khám"),
    C("Đưa sổ ghi ca, chỉ ra số giờ không được nghỉ", { counters: step(c, CG, { honest: 1 }), gamble: { p: f(c, "cgv_collective") ? 0.65 : 0.4, win: { flags: ["cgv_stood_ground"], money: 0.05, log: "Gia đình xem sổ, im lặng rất lâu, rồi thuê thêm một người trực đêm." }, lose: { flags: ["cgv_fired"], money: -0.1, log: "Họ cho bạn nghỉ ngay hôm sau, không trả nốt tháng lương." } } }, "Đòi công bằng, có thể mất khách", { tier: "awakened" }),
    C("Bỏ nghề, đi chữa lưng", { counters: step(c, CG), ...leave(CG), health: 3, flags: ["ex_caregiver"] }, "Giữ thân mình, rời người bệnh")], 0)),
  beat(CG, 4, 5, (c) => {
    if (n(c, "cgv_load") >= 2 || (f(c, "cgv_live_in") && !f(c, "cgv_stood_ground"))) return T("Cái lưng không còn của mình", "Bác sĩ chỉ vào hai đốt sống trên phim chụp: bao năm đỡ người đã để lại dấu. Không được bê vác nặng nữa. Người bạn đang chăm vẫn gọi tên bạn mỗi sáng.", [
      C("Chuyển sang trực đêm, chỉ ngồi canh", { counters: step(c, CG), income_mult: 0.75, flags: ["cgv_night_watch"] }, "Giữ nghề, lương giảm"),
      C("Mổ lưng, nghỉ nửa năm", { counters: step(c, CG), money: -0.4, gamble: { p: 0.6, win: { health: 8, log: "Ca mổ thành công. Sáu tháng sau bạn đứng thẳng được, nhưng không bê ai nữa." }, lose: { health: -3, log: "Lưng đỡ được một phần. Mưa trở trời vẫn nhức." } } }, "Tốn tiền, có thể đứng thẳng lại", { longterm: true }),
      C("Rời nghề, tìm một việc nhẹ hơn", { counters: step(c, CG), ...leave(CG), flags: ["ex_caregiver"] }, "Cứu cái lưng, bỏ lại người cần bạn")], 0);
    if (f(c, "cgv_collective")) return T("Bệnh viện muốn ký với cả nhóm", `Bệnh viện ${vn(c) ? "tỉnh" : "khu vực"} muốn ký hợp đồng chăm sóc với cả nhóm của bạn: ca tám tiếng, bảo hiểm đầy đủ. Đổi lại, họ muốn bạn đứng tên điều phối và chịu trách nhiệm cho mọi sai sót của cả nhóm.`, [
      C("Ký, đứng tên điều phối", { counters: step(c, CG), income_mult: 1.4, bw: -4, flags: ["cgv_coordinator"] }, "Lương và luật cho cả nhóm, bạn gánh trách nhiệm"),
      C("Đề nghị chia trách nhiệm theo ca, ai trực người ấy ký", { counters: step(c, CG), agency: 0.03, gamble: { p: 0.5, win: { flags: ["cgv_shared_charter"], income_mult: 1.25, log: "Bệnh viện đồng ý. Bản quy chế của nhóm bạn được các khoa khác xin chép lại." }, lose: { income_mult: 1.05, log: "Bệnh viện chuyển sang ký với một công ty lớn." } } }, "Công bằng cho từng người, có thể mất hợp đồng", { tier: "sovereign" }),
      C("Giữ nhóm nhỏ, tự nhận khách như cũ", { counters: step(c, CG), happy: 3, flags: ["cgv_small_team"] }, "Tự do, không có bảo hiểm")], 0);
    return T("Lá thư từ văn phòng luật sư", "Người bạn chăm lâu nhất đã ra đi êm trong giấc ngủ. Di chúc để lại cho bạn một khoản bằng ba năm lương, kèm một lá thư viết tay. Các con của người ấy nói bạn lợi dụng lúc cha mẹ họ yếu, và dọa kiện.", [
      C("Nhận đúng phần được để lại, ra tòa nếu cần", { counters: step(c, CG), gamble: { p: 0.55, win: { money: 1.5, log: "Tòa giữ nguyên di chúc. Lá thư viết tay được đọc to trước phiên tòa." }, lose: { money: -0.2, log: "Bạn thua kiện, trả cả án phí. Lá thư vẫn là của bạn." } } }, "Có thể đổi đời, có thể mất cả án phí"),
      C("Trả lại cho các con, chỉ giữ lá thư", { counters: step(c, CG, { cgv_bond: 1 }), rel: 2, flags: ["cgv_returned_gift"] }, "Không tiền, lòng thanh thản"),
      C("Lập quỹ khám bệnh cho người chăm bệnh nghèo", { counters: step(c, CG), agency: 0.03, money: 0.2, flags: ["cgv_fund"] }, "Biến món quà thành việc chung, các con vẫn có thể kiện", { tier: "sovereign" })], 1);
  }),
  beat(CG, 5, 6, (c) => T("Đến lượt mình cần người nhắc thuốc", `${f(c, "cgv_returned_gift") ? "Lá thư viết tay năm ấy vẫn nằm trong ngăn kéo. " : f(c, "cgv_fund") ? "Quỹ mang tên người ấy đã giúp ba mươi người chăm bệnh đi khám lưng. " : f(c, "cgv_night_watch") ? "Bạn vẫn trực đêm, chiếc ghế gấp đã thay đến lần thứ tư. " : ""}Một buổi sáng, bạn nhận ra chính mình cũng cần ai đó nhắc uống thuốc. Trung tâm dạy nghề mời bạn đứng lớp cho những người chăm bệnh trẻ.`, [
    C("Đứng lớp, dạy hết những gì mình biết", { counters: step(c, CG), flags: ["passed_on"], happy: 3, money: 0.03 }, "Để lại đôi tay nghề cho người sau, mệt thêm"),
    C("Dành dụm cho tuổi già của mình", { counters: step(c, CG), money: -0.2, flags: ["cgv_own_plan"] }, "Bớt tiền bây giờ, về sau không phải trông vào ai", { longterm: true }),
    C("Nghỉ hẳn, về với người nhà", { counters: step(c, CG), ...leave(CG), rel: 3 }, "Có thời gian cho người thân, hết lương")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(CG, "cgv_cot", [18, 65], 8, (c) => T("Chiếc ghế gấp cạnh giường", vary("cgvc", c.age, [
    "Đêm thứ ba mươi, bạn ngủ trên chiếc ghế gấp cạnh giường. Người bệnh gọi bạn mỗi giờ một lần.",
    "Phòng bệnh sáu giường, mười hai người nhà và người chăm thuê nằm dưới sàn. Đèn không bao giờ tắt."]), [
    C("Ở lại, ngủ chập chờn", { health: -3, counters: { cgv_bond: 1 } }, "Người bệnh yên, bạn mỏi"),
    C("Xin người nhà trực thay một đêm mỗi tuần", { gamble: { p: 0.5, win: { health: 2, flags: ["cgv_night_off"], log: "Người con trai nhận trực tối thứ bảy. Đêm đầu tiên anh ấy gọi cho bạn bốn lần." }, lose: { money: -0.02, log: "Họ bảo trả tiền để bạn trực, không phải để họ trực. Tháng ấy bị trừ một ngày lương." } } }, "Giữ sức, có thể bị cho là lười")], 0)),
  daily(CG, "cgv_quarrel", [18, 65], 9, () => T("Các con cãi nhau bên giường", "Ba người con cãi nhau chuyện chia đất ngay cạnh giường mẹ. Bà nằm quay mặt vào tường, nắm chặt tay bạn.", [
    C("Đẩy xe đưa bà ra hành lang hóng gió", { counters: { cgv_bond: 1 }, rel: -1 }, "Che cho bà, họ thấy bạn tự ý"),
    C("Nhắc thẳng họ ra ngoài mà nói", { gamble: { p: 0.5, win: { counters: { cgv_bond: 1 }, log: "Họ im, lần lượt ra ngoài. Bà ngủ được một giấc dài." }, lose: { money: -0.05, flags: ["cgv_dismissed"], log: "Người con cả bảo bạn chỉ là người làm thuê. Tuần sau bạn bị cho nghỉ." } } }, "Bảo vệ bà, có thể mất việc"),
    C("Im lặng làm việc của mình", { happy: -2, counters: { cgv_load: 1 } }, "Giữ việc, nghe hết những lời ấy")], 0)),
  daily(CG, "cgv_witness", [20, 65], 9, () => T("Chữ ký làm chứng", "Người con út nhờ bạn ký làm chứng vào bản di chúc mới của người bệnh, đúng hôm người bệnh lúc tỉnh lúc mê. Anh ta dúi vào tay bạn một phong bì.", [
    C("Ký, nhận phong bì", { money: 0.1, counters: { honest: -1 }, secret: { tag: "FORGED_PAPERS", severity: 0.45, fuse_years: [2, 8], note: "ký làm chứng di chúc khi người bệnh không còn tỉnh" } }, "Tiền dễ, một chữ ký có thể quay lại"),
    C("Từ chối ký", { counters: { honest: 1 }, rel: -1 }, "Sạch tay, mất lòng người trả lương"),
    C("Đề nghị mời luật sư và bác sĩ xác nhận", { gamble: { p: 0.5, win: { counters: { cgv_bond: 1 }, flags: ["cgv_proper_will"], log: "Bác sĩ xác nhận ngày người bệnh tỉnh táo. Di chúc được làm lại, có đủ các con chứng kiến." }, lose: { money: -0.05, log: "Người con út cho bạn nghỉ việc ngay chiều ấy." } } }, "Đúng việc cho người bệnh, có thể mất khách", { tier: "awakened" })], 1)),
  daily(CG, "cgv_sea", [18, 65], 9, () => T("Muốn nhìn biển một lần nữa", "Người bệnh muốn được nhìn biển một lần trước khi đi xa, cách hai trăm cây số. Gia đình bảo quá nguy hiểm. Bác sĩ nói: nếu đi thì trong tháng này.", [
    C("Thuyết phục gia đình cùng đi", { bw: -3, gamble: { p: 0.5, win: { counters: { cgv_bond: 2 }, flags: ["cgv_sea_trip"], log: "Cả nhà ngồi trên bãi cát một buổi chiều. Người bệnh ngủ thiếp đi, miệng còn cười." }, lose: { rel: -1, log: "Gia đình nói không. Bạn mở cho người bệnh nghe tiếng sóng trên điện thoại." } } }, "Có thể cho người bệnh một buổi chiều, mất lòng gia đình", { tier: "awakened" }),
    C("Làm theo ý gia đình", { happy: -2, counters: { cgv_load: 1 } }, "Không rủi ro, một ước nguyện bỏ lỡ")], 0)),
  daily(CG, "cgv_dawn", [18, 65], 8, (c) => T("Rạng sáng hôm ấy", vary("cgvd", c.age, [
    "Rạng sáng, người bạn chăm hai năm thở chậm dần rồi đi, tay vẫn trong tay bạn. Gia đình chưa ai kịp đến.",
    "Người bệnh đi trong giấc ngủ, đúng ca bạn trực. Căn phòng bỗng im đến lạ."]), [
    C("Ngồi lại, lần lượt gọi từng người con", { happy: -3, counters: { cgv_bond: 1, cgv_load: 1 } }, "Gia đình biết ai ở bên cuối cùng, bạn mang thêm nỗi buồn"),
    C("Nghỉ một tuần trước khi nhận khách mới", { money: -0.03, health: 3, counters: { cgv_load: -1 } }, "Hụt tiền, lòng được nghỉ"),
    C("Nhận khách mới ngay hôm sau", { money: 0.03, counters: { cgv_load: 1 } }, "Có tiền, nỗi buồn chưa kịp đặt xuống")], 0)),
  daily(CG, "cgv_course", [18, 60], 9, () => T("Lớp chăm sóc cuối tuần", "Một trung tâm y tế mở lớp chăm sóc người bệnh nằm lâu ngày: sáu cuối tuần, có chứng chỉ, học cách đỡ người mà không hại lưng mình.", [
    C("Đi học, lấy chứng chỉ", { money: -0.04, know: 4, bw: -2, flags: ["cgv_certified"], counters: { cgv_load: -1 } }, "Mất sáu cuối tuần và tiền học, đỡ cho lưng về sau"),
    C("Nghề này học bằng tay, không cần giấy", { money: 0.02 }, "Giữ thêm ngày công, mãi là người không bằng cấp")], 0)),
  daily(CG, "cgv_wrong_name", [18, 65], 9, () => T("Bà gọi bạn bằng tên người khác", "Bà cụ mất trí nhớ gọi bạn bằng tên con gái mình, người đã đi xa ba mươi năm trước. Mỗi sáng bà hỏi con đi đâu về muộn thế.", [
    C("Đáp lời như người con ấy", { counters: { cgv_bond: 1 }, bw: -2, happy: -1 }, "Bà yên lòng, bạn mang thêm một vai"),
    C("Nhẹ nhàng nói thật mỗi lần", { flags: ["cgv_truthful"], happy: -1 }, "Đúng sự thật, bà buồn lại mỗi sáng"),
    C("Xin gia đình mang ảnh cũ đến kể chuyện cùng bà", { gamble: { p: 0.6, win: { counters: { cgv_bond: 1 }, flags: ["cgv_memory_box"], log: "Hộp ảnh cũ thành giờ kể chuyện mỗi chiều. Có hôm bà gọi đúng tên bạn." }, lose: { happy: -1, log: "Gia đình bận, không ai mang ảnh đến." } } }, "Mở một lối khác, phụ thuộc vào gia đình", { tier: "awakened" })], 0)),
  daily(CG, "cgv_unpaid", [18, 65], 9, () => T("Ba tháng lương bị khất", "Gia đình người bệnh khất lương ba tháng, lần nào cũng hứa tuần sau. Người bệnh không biết, vẫn hỏi bạn đã ăn cơm chưa.", [
    C("Ở lại vì người bệnh, chờ thêm", { money: -0.1, counters: { cgv_bond: 1 } }, "Người bệnh có bạn, túi bạn rỗng"),
    C("Nghỉ việc, đòi bằng được", { flags: ["cgv_left_client"], gamble: { p: 0.5, win: { money: 0.1, log: "Họ trả đủ, kèm một câu xin lỗi ngắn." }, lose: { money: -0.1, log: "Họ chặn số điện thoại của bạn." } } }, "Giữ phẩm giá, người bệnh mất người quen"),
    C("Rủ người cùng nghề lập sổ đen các nhà quỵt lương", { agency: 0.02, flags: ["cgv_blacklist"], rel: 1 }, "Bảo vệ cả nghề, có nhà sẽ dọa kiện", { tier: "sovereign" })], 0)),
  daily(CG, "cgv_app", [18, 60], 9, () => T("Ứng dụng chấm sao người chăm bệnh", "Một ứng dụng mới cho gia đình đặt người chăm bệnh theo giờ, chấm sao sau mỗi ca, giữ lại một phần năm tiền công. Khách quen bắt đầu hỏi sao bạn chưa có trên đó.", [
    C("Đăng ký lên ứng dụng", { income_mult: 1.1, bw: -2, flags: ["cgv_app"] }, "Nhiều khách hơn, sống theo những ngôi sao"),
    C("Giữ khách quen truyền miệng", { income_mult: 0.95, counters: { cgv_bond: 1 } }, "Ít khách, giữ được nhịp của mình")], 0)),
  daily(CG, "cgv_quit", [30, 65], 99, () => T("Một ca làm tám tiếng", "Một người quen mời bạn đứng quầy ở nhà thuốc: ca tám tiếng, ngày nào cũng được về nhà ngủ, không phải bê đỡ ai.", [
    C("Nhận lời, rời nghề chăm bệnh", { ...leave(CG), flags: ["ex_caregiver"], health: 2 }, "Đêm được ngủ, bỏ lại người đang cần bạn"),
    C("Ở lại với người bệnh", { counters: { cgv_bond: 1 }, health: -1 }, "Giữ một mối gắn bó, thân thể tiếp tục trả giá")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(CG, "cgv_family", [22, 65], (c) => (c.parent_sick && (!!role(c, "father") || !!role(c, "mother"))) || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const p = role(c, "father") ?? role(c, "mother");
    if (c.parent_sick && p) return T("Người nhà của bạn cũng ốm", `${N(p)} ốm nằm ở nhà, trong khi bạn ngồi cạnh giường người lạ để lấy lương. Anh chị em bảo bạn là người biết chăm nhất nhà.`, [
      C("Thuê người chăm cha mẹ, mình đi làm tiếp", { money: -0.1, trust: { npc: p, delta: -0.1 } }, "Giữ thu nhập, cha mẹ quen tay người lạ"),
      C("Nghỉ khách, về chăm cha mẹ", { money: -0.3, trust: { npc: p, delta: 0.3 }, flags: ["cgv_home_care"] }, "Cha mẹ có bạn, nhà hụt một nguồn tiền"),
      C("Đề nghị anh chị em góp tiền, chia ca", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.2 }, flags: ["cgv_family_rota"], log: "Mỗi người nhận một ngày trong tuần. Lần đầu tiên bạn không phải gánh một mình." }, lose: { rel: -2, log: "Ai cũng có lý do. Cuối cùng vẫn là bạn." } } }, "Chia gánh công bằng, có thể sứt mẻ anh em", { tier: "awakened" })], 1, { npc: p });
    const k = role(c, "child")!;
    return T("Cha mẹ chăm người khác giỏi thế", `${N(k)} nhắn: cả tháng nay chỉ thấy cha mẹ qua điện thoại. Cha mẹ chăm người khác giỏi thế, sao không ở nhà với con?`, [
      C("Xin bớt ca, dành tối thứ bảy cho con", { income_mult: 0.9, trust: { npc: k, delta: 0.2 } }, "Gần con, bớt lương"),
      C("Giải thích tiền học của con từ những ca ấy", { trust: { npc: k, delta: -0.05 }, money: 0.02 }, "Nói thật, con vẫn thấy thiếu"),
      C("Dẫn con theo một buổi đến thăm người bệnh", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.25 }, log: `${N(k)} ngồi nghe ông cụ kể chuyện cả buổi chiều. Trên đường về, nó nắm tay bạn.` }, lose: { trust: { npc: k, delta: -0.05 }, log: `${N(k)} ngồi bấm điện thoại suốt buổi, về nhà không nói gì.` } } }, "Có thể hiểu nhau hơn, có thể chẳng đổi gì", { tier: "awakened" })], 0, { npc: k });
  }),
];

export const PACK_STREET_B: Storylet[] = [...GRD_CARDS, ...HMK_CARDS, ...FNR_CARDS, ...CGV_CARDS];
