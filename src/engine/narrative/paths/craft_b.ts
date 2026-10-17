/**
 * Gói "Tay nghề & làng nghề" B: THỢ LÀM BÁNH · THẦY THUỐC NAM · NÔNG DÂN CÔNG NGHỆ CAO · NGƯỜI NUÔI TRỒNG THỦY SẢN.
 * Theo chuẩn của singer.ts và docs/content-guide.md. Tiền tố id: bkr_ · hrb_ · agt_ · aqf_.
 * Bộ đếm riêng: bkr_name · hrb_trust, hrb_evidence · agt_data · aqf_water.
 * Thầy thuốc: không có bài thuốc, không có liều lượng; chuyện là sự thật về giới hạn của nghề.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;

/* =====================================================================
 * THỢ LÀM BÁNH — tiền tố bkr_
 * ===================================================================== */
const BK = "baker";

const BKR_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(BK, "bkr_t_dough", [8, 13], () => true, () => T("Bàn tay nhồi bột", "Bà hàng xóm làm bánh bán buổi sáng bị đau tay, bạn sang nhồi bột giúp bà một tuần. Đến ngày thứ năm, bà bảo khối bột bạn nhồi nở đều hơn bột của bà, rồi hỏi bạn có muốn dậy từ bốn giờ để học thật không.", [
    C("Dậy lúc bốn giờ sang học bà", { health: -1, know: 2, flags: [talentFlag(BK)], counters: { talents_seen: 1 } }, "Mất giấc ngủ tuổi lớn, mở một con đường"),
    C("Cảm ơn bà, sáng còn phải đi học", { know: 1, counters: { talents_seen: 1 } }, "Giữ nếp học, bột là chuyện của bà")], 0)),
  talent(BK, "bkr_t_fair", [12, 16], () => true, (c) => T("Bốn mươi cái bánh ở hội chợ trường", `Hội chợ của trường, bạn tự nướng bốn mươi cái bánh ${vn(c) ? "bông lan" : "bơ"} bằng cái lò nhỏ của nhà. Hết sạch trước mười giờ sáng. Một cô giáo hỏi đặt hai chục cái cho sinh nhật con tuần sau.`, [
    C("Nhận đơn, mượn tiền mẹ mua thêm bột", { money: -0.02, bw: -2, flags: [talentFlag(BK)], counters: { talents_seen: 1 } }, "Mất mấy tối học bài, có khách đầu tiên"),
    C("Đưa hết tiền lời cho mẹ, cất lò đi", { money: 0.02, rel: 2, counters: { talents_seen: 1 } }, "Mẹ vui, cái lò lại nằm dưới gầm bếp")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(BK, "bkr_d_apprentice", [16, 30], () => true, (c) => T("Tiệm bánh góc phố tuyển học việc", `Tiệm bánh góc phố dán tờ giấy: cần người học việc, ca bắt đầu lúc ba giờ sáng. Ông chủ ${c.poor_country ? "trả bằng nửa lương công nhân, bao bữa sáng" : "trả lương tối thiểu, không tính giờ làm thêm"}. Ông nói trước: ba tháng đầu chỉ được rửa khay.`, [
    C("Nhận, đi làm từ ba giờ sáng", { ...become(BK), counters: { doors_seen: 1 }, health: -2, money: -0.03 }, "Lương thấp, mất giấc ngủ, có nghề"),
    C("Xin học ca chiều, giữ việc đang làm", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(BK), log: "Ông chủ cần người cho mẻ bánh chiều. Ba tháng sau ông cho bạn đứng lò." }, lose: { log: "Ông chủ lắc đầu: làm bánh mà không dậy sớm thì không phải làm bánh." } } }, "An toàn hơn, khó được nhận"),
    C("Thôi, tìm việc giờ hành chính", { counters: { doors_seen: 1 }, money: 0.02 }, "Ngủ đủ giấc, mùi bánh là của người khác")], 0)),
  door(BK, "bkr_d_kitchen", [24, 50], () => true, () => T("Đơn hàng từ căn bếp nhà", "Bạn mang bánh tự nướng đến chỗ làm vài lần, giờ mỗi tuần có mười lăm người nhắn đặt. Căn bếp nhà nóng như lò, bàn ăn thành bàn nhồi bột. Ở chợ có một gian hàng nhỏ cho thuê, đặt cọc bằng ba tháng lương.", [
    C("Vay tiền, thuê gian hàng, bỏ việc", { custom: "borrow:0.3|become:baker", counters: { doors_seen: 1 }, agency: 0.02 }, "Đặt cược vào tay nghề, mang một khoản nợ"),
    C("Nhận đơn cuối tuần, chưa bỏ việc", { counters: { doors_seen: 1 }, money: 0.04, bw: -4, gamble: { p: 0.3, win: { ...become(BK), log: "Đơn cuối tuần nhiều đến mức bạn xin nghỉ việc mà không cần vay." }, lose: { health: -2, log: "Sau ba tháng, bạn kiệt sức và thôi nhận đơn." } } }, "Ít rủi ro, cháy cả hai đầu"),
    C("Tặng bánh cho vui, không bán", { counters: { doors_seen: 1 }, rel: 2 }, "Bạn bè quý, nghề không thành")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(BK, 1, 1, (c) => T("Ba giờ sáng", "Tháng đầu đứng lò. Chủ tiệm đưa bạn bao bột trộn sẵn và hộp phụ gia: bánh nở to sau hai tiếng, mềm suốt ba ngày. Cách cũ là ủ bột qua đêm, bánh thơm hơn, nhưng mỗi mẻ mất cả ngày và hỏng thì không cứu được.", [
    C("Dùng bột trộn sẵn, giữ nhịp tiệm", { counters: step(c, BK), flags: ["bkr_shortcut"], income_mult: 1.1 }, "Nhanh, đều, bánh như mọi tiệm khác"),
    C("Xin làm một mẻ ủ qua đêm mỗi ngày", { counters: step(c, BK), flags: ["bkr_slow_dough"], health: -2, gamble: { p: 0.5, win: { counters: { bkr_name: 1 }, log: "Mẻ bánh ủ qua đêm hết trước bảy giờ sáng. Có khách hỏi tên người làm." }, lose: { happy: -2, log: "Hai mẻ đầu xẹp lép. Chủ tiệm trừ tiền bột vào lương." } } }, "Mất ngủ thêm, có thể thành dấu ấn")], 0), (c) => c.age >= 18),
  beat(BK, 2, 3, (c) => T("Một cái lò của riêng mình", `${f(c, "bkr_slow_dough") ? "Khách xếp hàng vì mẻ bánh ủ qua đêm của bạn." : "Bạn đã là người đứng lò nhanh nhất phố."} Một mặt bằng ở phố chính cho thuê, tiền thuê bằng nửa năm thu nhập. Cùng tuần, một chuỗi siêu thị muốn bạn làm bánh cho họ theo công thức của họ, đóng gói in tên họ.`, [
    C("Vay tiền, thuê mặt bằng, mở tiệm", { counters: step(c, BK), custom: "borrow:0.5", flags: ["bkr_own_shop"], income_mult: 1.3, bw: -4 }, "Tên bạn trên biển hiệu, nợ trên vai"),
    C("Làm bánh cho chuỗi siêu thị", { counters: step(c, BK), flags: ["bkr_supplier"], income_mult: 1.4 }, "Thu nhập đều, bánh không còn mang tên bạn"),
    C("Rủ ba người làm bánh tại nhà chung một lò", { counters: step(c, BK), agency: 0.03, gamble: { p: f(c, "bkr_slow_dough") ? 0.65 : 0.45, win: { flags: ["bkr_coop"], income_mult: 1.2, counters: { bkr_name: 1 }, log: "Bốn người chia ca, chia tiền thuê. Mỗi người giữ món riêng của mình." }, lose: { income_mult: 1.05, log: "Nửa năm sau, hai người rút vì cãi nhau chuyện chia ca. Bạn trả nốt tiền lò." } } }, "Chia quyền, chia lời, ít nợ", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(BK, 3, 4, (c) => T("Hạnh nhân không có trên nhãn", `Một khách hàng phải vào viện cấp cứu vì dị ứng sau khi ăn bánh ${f(c, "bkr_supplier") ? "in tên siêu thị nhưng ra từ lò của bạn" : "của tiệm bạn"}. Bánh có bột hạnh nhân; nhãn không ghi. ${f(c, "bkr_shortcut") ? "Lỗi nằm ở bao bột trộn sẵn mới đổi nhà cung cấp. " : "Người phụ việc mới đổi công thức mà không báo. "}Người nhà khách đã đăng bài lên mạng.`, [
    C("Nhận lỗi công khai, thu hồi bánh, trả viện phí", { counters: step(c, BK, { honest: 1 }), money: -0.3, flags: ["bkr_owned_up"], happy: -3 }, "Mất tiền và mặt mũi, giữ được lòng tin"),
    C("Gặp riêng, trả tiền để gia đình gỡ bài", { counters: step(c, BK, { honest: -1 }), money: -0.15, flags: ["bkr_hushed"] }, "Êm nhanh, chuyện có thể bị đào lại"),
    C("Đóng tiệm, thôi nghề bánh", { counters: step(c, BK), ...leave(BK), happy: -5, flags: ["ex_baker"] }, "Hết lo, mất cả nghề")], 0), (c) => c.age >= 18),
  beat(BK, 4, 5, (c) => {
    if (f(c, "bkr_hushed")) return T("Bài viết cũ sống lại", "Bốn năm sau, một nhóm phụ huynh lập danh sách những tiệm bánh “giấu thành phần”. Bài viết cũ về tiệm bạn được đào lại, kèm ảnh chụp tin nhắn bạn trả tiền gỡ bài. Doanh thu tuần này còn một phần ba.", [
      C("Xin lỗi công khai, ghi rõ thành phần mọi món", { counters: step(c, BK, { honest: 1 }), custom: "apologize", income_mult: 0.8, flags: ["bkr_open_recipe"] }, "Muộn nhưng thật, mất một nửa khách"),
      C("Đổi tên tiệm, chuyển sang phố khác", { counters: step(c, BK), money: -0.4, flags: ["bkr_renamed"] }, "Làm lại từ đầu, mang theo chuyện cũ"),
      C("Bán lò, nghỉ hẳn", { counters: step(c, BK), ...leave(BK), money: 0.2 }, "Thoát cơn bão, mất nghề")], 0);
    if (f(c, "bkr_supplier")) return T("Siêu thị đổi lò", "Chuỗi siêu thị báo không gia hạn hợp đồng: họ tìm được nhà máy làm rẻ hơn ba mươi phần trăm. Lò của bạn được sắm để chạy đúng một công thức, của họ. Còn sáu tuần.", [
      C("Hạ giá, xin giữ hợp đồng", { counters: step(c, BK), income_mult: 0.8, health: -3 }, "Giữ việc, làm nhiều hơn để được ít hơn"),
      C("Mở cửa bán lẻ bằng công thức của mình", { counters: step(c, BK), money: -0.3, gamble: { p: 0.45, win: { flags: ["bkr_own_shop"], counters: { bkr_name: 2 }, income_mult: 1.1, log: "Người trong khu tìm đến vì mùi bánh. Lần đầu tiên bánh của bạn mang tên bạn." }, lose: { income_mult: 0.7, log: "Khách quen bánh siêu thị, chưa quen bánh của bạn. Nửa năm đầu lỗ." } } }, "Đặt cược vào tên mình, nhiều năm mới gỡ"),
      C("Bán lò, đi làm công cho nhà máy", { counters: step(c, BK), ...leave(BK), money: 0.25 }, "Lương đều, không còn là thợ bánh")], 1);
    if (f(c, "bkr_owned_up") || f(c, "bkr_coop") || n(c, "bkr_name") >= 2) return T("Hàng dài trước tiệm", `${f(c, "bkr_owned_up") ? "Từ hôm bạn nhận lỗi công khai, người ta tin những gì ghi trên nhãn của bạn." : "Bánh của bạn thành thứ người ta mang đi làm quà."} Sáng thứ bảy, hàng người kéo dài qua ba nhà. Một nhà đầu tư muốn mở mười chi nhánh mang tên bạn, dùng bột của nhà máy.`, [
      C("Nhận vốn, mở chuỗi mười tiệm", { counters: step(c, BK), income_mult: 1.6, bw: -6, flags: ["bkr_chain"] }, "Giàu nhanh, bánh mang tên bạn nhưng không do bạn làm"),
      C("Giữ một tiệm, mở thêm lớp dạy nghề", { counters: step(c, BK), income_mult: 1.1, happy: 4, flags: ["bkr_school"] }, "Không giàu, có học trò"),
      C("Đòi ba tiệm, công thức và lò do bạn giữ", { counters: step(c, BK), gamble: { p: 0.5, win: { income_mult: 1.35, flags: ["bkr_chain", "bkr_kept_recipe"], log: "Nhà đầu tư đồng ý. Sáng nào bạn cũng đi qua cả ba lò." }, lose: { log: "Nhà đầu tư đi tìm một tiệm khác dễ bảo hơn." } } }, "Đòi điều khoản, có thể mất cả thương vụ", { tier: "sovereign" })], 0);
    return T("Tiền thuê tăng gấp ba", "Khu phố của tiệm thành phố cà phê và cửa hàng thời trang. Chủ nhà báo tiền thuê năm tới tăng gấp ba. Phần lớn khách quen của bạn đã dọn đi vì nhà trong phố quá đắt.", [
      C("Ký tiếp, tăng giá bánh", { counters: step(c, BK), income_mult: 0.9, bw: -4 }, "Giữ chỗ, mất khách cũ"),
      C("Dọn về một con hẻm rẻ hơn", { counters: step(c, BK), money: -0.15, happy: -2, flags: ["bkr_moved"] }, "Mất mặt tiền, giữ được nghề"),
      C("Bán hết dụng cụ, đi làm công", { counters: step(c, BK), ...leave(BK), money: 0.1 }, "Hết nợ thuê, mất cái lò")], 1);
  }, (c) => c.age >= 18),
  beat(BK, 5, 6, (c) => T("Hũ men hai mươi năm", `Hũ men cái bạn nuôi từ những năm đầu vẫn sủi bọt trên kệ. ${f(c, "bkr_chain") ? "Các tiệm mang tên bạn giờ dùng bột nhà máy; chỉ lò đầu tiên còn dùng hũ men này." : f(c, "bkr_school") ? "Mười hai học trò của bạn đã có lò riêng." : "Tay bạn bắt đầu run mỗi sáng khi nhồi bột."} Người học việc lâu năm nhất xin bạn một ít men và cuốn sổ công thức.`, [
    C("Trao men và sổ, không lấy gì", { counters: step(c, BK), flags: ["passed_on"], happy: 5, rel: 3 }, "Nghề sống tiếp, bạn không còn độc quyền"),
    C("Bán thương hiệu và sổ công thức", { counters: step(c, BK), money: 0.6, happy: -2 }, "Một khoản lớn, tên bạn vào tay người lạ"),
    C("Nướng mẻ cuối rồi treo tạp dề", { counters: step(c, BK), ...leave(BK), happy: 4, health: 2 }, "Nghỉ ngơi, lò nguội")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(BK, "bkr_flour", [18, 70], 7, (c) => T("Giá bột mì nhảy vọt", vary("bkrfl", c.age, ["Giá bột mì tăng bốn mươi phần trăm trong hai tháng vì mất mùa ở một nơi xa. Khách quen vẫn đòi bánh giá cũ.", "Bơ và trứng cùng lên giá một lúc. Bảng giá viết tay ở quầy đã ba năm chưa đổi."]), [
    C("Tăng giá, dán giấy giải thích", { money: 0.03, counters: { bkr_name: -1 } }, "Đủ lời, vài khách bỏ đi"),
    C("Giữ giá, làm bánh nhỏ đi một chút", { money: 0.04, counters: { honest: -1 } }, "Không ai nói, ai cũng thấy"),
    C("Giữ giá, chịu lỗ một mùa", { money: -0.06, counters: { bkr_name: 1 } }, "Mất lời, giữ khách")], 0)),
  daily(BK, "bkr_leftover", [18, 70], 8, (c) => T("Bánh thừa lúc đóng cửa", vary("bkrlo", c.age, ["Chín giờ tối, còn ba khay bánh chưa bán. Sáng mai chúng sẽ cứng.", "Mưa cả ngày, khách vắng. Hai mươi ổ bánh nằm trên kệ lúc đóng cửa."]), [
    C("Bỏ đi, không bán bánh cũ", { money: -0.01, flags: ["bkr_fresh_only"] }, "Giữ tiếng bánh mới, phí của"),
    C("Bán nửa giá sáng hôm sau", { money: 0.01, counters: { bkr_name: -1 } }, "Gỡ chút tiền, khách quen chờ hàng giảm"),
    C("Hẹn mái ấm gần đó đến lấy mỗi tối", { rel: 3, bw: -1, flags: ["bkr_shelter_deal"], counters: { bkr_name: 1 } }, "Mất chút công, phố biết đến bạn", { tier: "awakened" })], 2)),
  daily(BK, "bkr_wedding", [18, 65], 8, () => T("Bánh cưới năm tầng", "Một đám cưới đặt bánh năm tầng cho ba trăm khách, giao sau bốn ngày. Tiền công bằng hai tháng bán bánh. Lò của bạn chỉ nướng vừa một tầng mỗi lần.", [
    C("Nhận, thức trắng ba đêm", { money: 0.15, health: -4, counters: { bkr_name: 1 } }, "Tiền lớn, thân thể trả giá"),
    C("Nhận, thuê thêm lò của tiệm quen", { money: 0.07, gamble: { p: 0.7, win: { counters: { bkr_name: 1 }, log: "Bánh đứng vững suốt buổi tiệc. Cô dâu gửi ảnh cảm ơn." }, lose: { counters: { bkr_name: -1 }, log: "Tầng thứ ba nghiêng trên xe giao. Bạn phải bớt nửa tiền." } } }, "Chia lời, chia rủi ro"),
    C("Từ chối, hẹn mùa sau", { happy: 1 }, "Ngủ ngon, mất một đơn lớn")], 1)),
  daily(BK, "bkr_review", [18, 70], 8, (c) => T("Một ngôi sao trên mạng", vary("bkrrv", c.age, ["Một tài khoản lạ chấm tiệm bạn một sao, kèm ảnh một sợi tóc trong ổ bánh. Ảnh chụp trên một cái bàn bạn không nhận ra.", "Một người nổi tiếng trên mạng chê bánh của bạn “khô như bìa các-tông” trước hai trăm nghìn người theo dõi."]), [
    C("Trả lời gay gắt, đòi bằng chứng", { happy: 1, counters: { bkr_name: -1 } }, "Hả giận, người đọc chỉ thấy cãi nhau"),
    C("Mời họ đến xem bếp lúc ba giờ sáng", { bw: -2, gamble: { p: 0.5, win: { counters: { bkr_name: 2 }, log: "Họ đến, quay cả buổi. Video mới được xem nhiều hơn bài chê." }, lose: { log: "Họ không trả lời. Bài chê vẫn nằm đó." } } }, "Mất công, có thể đổi được câu chuyện", { tier: "awakened" }),
    C("Im lặng, làm bánh tiếp", { happy: -2, flags: ["bkr_thick_skin"] }, "Đỡ mệt, bài chê ở lại")], 2)),
  daily(BK, "bkr_inspector", [18, 70], 9, () => T("Đoàn kiểm tra vệ sinh", "Đoàn kiểm tra vệ sinh đến đúng giờ cao điểm. Ống thoát nước sau bếp rò từ tháng trước, bạn chưa kịp sửa. Một người trong đoàn nói nhỏ chuyện này “có thể châm chước”.", [
    C("Gửi một phong bì, xong trong mười phút", { money: -0.04, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [2, 8], note: "phong bì cho đoàn kiểm tra vệ sinh tiệm bánh" } }, "Nhanh gọn, có một bí mật"),
    C("Nhận biên bản, đóng cửa ba ngày sửa", { money: -0.08, counters: { honest: 1 } }, "Mất doanh thu, bếp sạch thật")], 1)),
  daily(BK, "bkr_wrist", [25, 70], 8, (c) => T("Cổ tay của thợ bánh", vary("bkrwr", c.age, ["Sáng nay bạn không nắm nổi cái cán lăn bột. Bác sĩ nói gân cổ tay bị viêm vì nhồi bột bằng tay mười mấy năm.", "Vết bỏng thứ ba trong tháng trên cánh tay. Cái lò cũ nóng không đều, cửa lò hay kẹt."]), [
    C("Vay tiền mua máy nhồi và lò mới", { custom: "borrow:0.25", health: 4, flags: ["bkr_machines"] }, "Đỡ thân, thêm nợ, bánh khác đi đôi chút"),
    C("Nghỉ hai tuần cho lành", { money: -0.04, health: 3, flags: ["bkr_rested"] }, "Mất khách hai tuần"),
    C("Băng tay, làm tiếp", { health: -4, money: 0.02 }, "Giữ nhịp, đau dài lâu")], 1)),
  daily(BK, "bkr_apprentice", [22, 70], 9, () => T("Cậu học việc đi muộn", "Cậu học việc mười bảy tuổi bạn nhận từ một mái ấm đi muộn lần thứ tư trong tháng. Sáng nay bạn thấy cậu nhét hai ổ bánh vào ba lô.", [
    C("Cho nghỉ việc", { bw: 2, flags: ["bkr_strict"] }, "Tiệm yên ổn, cậu ra đường"),
    C("Hỏi vì sao, cho cậu mang bánh về mỗi tối", { money: -0.01, rel: 2, gamble: { p: 0.6, win: { flags: ["has_apprentice"], log: "Cậu đang nuôi hai đứa em. Từ đó sáng nào cậu cũng đến trước bạn." }, lose: { log: "Một tuần sau, cậu bỏ đi cùng tiền trong quầy." } } }, "Có thể có một học trò, có thể mất tiền", { tier: "awakened" })], 1)),
  daily(BK, "bkr_rush", [18, 70], 7, (c) => T(vn(c) ? "Mùa bánh Trung thu" : "Mùa bánh cuối năm", vary("bkrru", c.age, [vn(c) ? "Một tháng trước Trung thu, đơn bánh nướng bánh dẻo gấp mười ngày thường. Các công ty đặt hộp quà theo trăm cái." : "Sáu tuần cuối năm, đơn bánh lễ gấp mười ngày thường. Các công ty đặt hộp quà theo trăm cái.", "Mùa lễ năm nay, một công ty lớn muốn đặt ba nghìn hộp bánh, trả trước một nửa."]), [
    C("Nhận hết, thuê thêm người thời vụ", { money: 0.2, bw: -6, health: -2, flags: ["bkr_mass_order"] }, "Kiếm cả năm trong một tháng, kiệt sức"),
    C("Chỉ nhận đặt trước, đủ sức thì làm", { money: 0.07, counters: { bkr_name: 1 } }, "Ít tiền hơn, giữ được chất lượng")], 0)),
  daily(BK, "bkr_app", [18, 70], 9, () => T("Ứng dụng giao đồ ăn", "Một ứng dụng giao đồ ăn mời tiệm bạn lên sàn. Họ lấy ba mươi phần trăm mỗi đơn; đổi lại, tiệm hiện ngay trên điện thoại của nửa thành phố.", [
    C("Lên sàn, chấp nhận chiết khấu", { income_mult: 1.1, counters: { bkr_name: -1 } }, "Thêm khách, mỏng lời, phụ thuộc sàn"),
    C("Không lên, giữ khách tại quầy", { happy: 1, flags: ["bkr_offline"] }, "Lời dày, ít người biết"),
    C("Lập nhóm đặt hàng chung với các tiệm trong phố", { bw: -4, agency: 0.02, gamble: { p: 0.45, win: { flags: ["bkr_street_group"], income_mult: 1.08, log: "Sáu tiệm chung một nhóm đặt hàng và một người giao. Không ai mất ba mươi phần trăm." }, lose: { log: "Nhóm tan sau bốn tháng vì không ai rảnh để trực." } } }, "Tốn công tổ chức, có thể thoát sàn", { tier: "sovereign" })], 1)),
  daily(BK, "bkr_rival", [20, 70], 9, (c, N) => { const r = role(c, "rival")!; return T("Tiệm bánh bên kia đường", `${N(r)} mở tiệm bánh ngay bên kia đường, bán đúng món bạn nổi tiếng, rẻ hơn hai phần mười. Có người thấy ${N(r)} đứng chụp ảnh tủ bánh của bạn.`, [
    C("Hạ giá ngang", { money: -0.05, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "cuộc chiến giá bánh hai bên đường" } }, "Giữ khách, cả hai cùng lỗ"),
    C("Sang chào, rủ chia nhau mặt hàng", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia mặt hàng giữa hai tiệm bánh" }, log: "Hai tiệm chia nhau: bên này bánh mì, bên kia bánh ngọt. Con phố thành phố bánh." }, lose: { log: "Họ cười, nói khách là của ai nhanh tay." } } }, "Có thể có đồng minh, có thể bị cười", { tier: "awakened" }),
    C("Làm món mới, không đáp", { bw: -2, counters: { bkr_name: 1 } }, "Tốn sức sáng tạo, giữ chất riêng")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(BK, "bkr_quit", [30, 70], 99, () => T("Tấm biển sang nhượng", "Sáng nay chuông báo thức kêu lúc ba giờ và bạn không bước nổi xuống giường. Một người hỏi mua lại tiệm với giá đủ trả hết nợ.", [
    C("Sang tiệm, nghỉ nghề", { ...leave(BK), money: 0.3, flags: ["ex_baker"] }, "Hết nợ, hết ba giờ sáng, hết lò"),
    C("Thuê người đứng lò sáng, giữ tiệm", { income_mult: 0.85, health: 2, flags: ["bkr_hired_baker"] }, "Đỡ thân, mỏng lời")], 1), (c) => c.happy < 45 || c.health < 40 || c.broke),

  /* ---------- gia đình ---------- */
  cross(BK, "bkr_family", [24, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => { const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} và cái lò`, `${N(k)} lớn lên trong mùi bánh, nhưng giờ nói không bao giờ muốn dậy lúc ba giờ sáng như bạn. ${N(k)} muốn đi học xa, học một ngành chẳng dính gì đến bột.`, [
      C("Mừng cho con, đóng học phí", { trust: { npc: k, delta: 0.25 }, money: -0.1 }, "Con đi xa, tiệm không người nối"),
      C("Bắt con phụ tiệm mỗi hè để giữ nghề", { trust: { npc: k, delta: -0.2 }, flags: ["bkr_heir_pushed"] }, "Có người phụ, con xa cách"),
      C("Dạy con làm một món, rồi để con đi", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "dạy con làm ổ bánh đầu tiên trước khi con đi xa", years: 1 } }, "Giữ một sợi dây, không giữ người", { tier: "awakened" })], 2, { npc: k });
    return T("Người ngồi quầy không lương", `${N(p!)} ngày nào cũng ra tiệm ngồi quầy, không lấy tiền, nhưng chê bánh của bạn ngọt quá và kể với mọi khách rằng hồi xưa nhà mình nghèo thế nào.`, [
      C("Mời ngồi quầy mỗi ngày, chịu nghe chê", { trust: { npc: p!, delta: 0.25 }, happy: -1, counters: { bkr_name: 1 } }, "Gần nhau, khách nghe hết chuyện nhà"),
      C("Khuyên ở nhà nghỉ ngơi", { trust: { npc: p!, delta: -0.15 }, bw: 2 }, "Yên tĩnh, người già thấy mình thừa"),
      C("Giao hẳn một góc quầy bán món bánh ngày xưa", { trust: { npc: p!, delta: 0.3 }, money: -0.02, flags: ["bkr_old_recipe"] }, "Mất một kệ bánh, được một câu chuyện", { tier: "awakened" })], 2, { npc: p! }); }),
];

/* =====================================================================
 * THẦY THUỐC NAM (thầy thuốc thảo dược truyền thống) — tiền tố hrb_
 * Kịch tính: truyền thống và bằng chứng, người bệnh từ chối bệnh viện, sự thật về giới hạn.
 * Không bao giờ nói thuốc chưa kiểm chứng là chữa khỏi; không có bài thuốc, không có liều.
 * ===================================================================== */
const HB = "herbalist";
const herb = (c: FactContext): string => (vn(c) ? "thuốc nam" : "thảo dược");

const HRB_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(HB, "hrb_t_garden", [8, 13], () => true, (c) => T("Vườn thuốc của bà", `Bà bạn trồng mấy chục loại cây sau nhà và gọi được tên từng loại. Hè này bà dẫn bạn lên đồi, chỉ cây nào người xưa hay dùng, cây nào tuyệt đối không được đụng vào. Bà nói nghề ${herb(c)} nhà mình đã truyền ba đời.`, [
    C("Theo bà lên đồi mỗi sáng hè", { health: 1, know: 2, flags: [talentFlag(HB)], counters: { talents_seen: 1 } }, "Mất mùa hè chơi với bạn, mở một con đường"),
    C("Ở nhà, đồi nắng lắm", { happy: 2, counters: { talents_seen: 1 } }, "Hè thảnh thơi, chuyện của bà ở lại với bà")], 0)),
  talent(HB, "hrb_t_notebook", [12, 16], () => true, () => T("Ai khỏi, ai không", "Hàng xóm hay sang xin lá của nhà bạn. Bạn bắt đầu ghi vào một cuốn vở: ai xin, bị gì, ai đỡ, ai không. Sau một năm, cuốn vở cho thấy có loại lá ai cũng khen, nhưng người dùng chẳng khỏi nhanh hơn người không dùng.", [
    C("Mang cuốn vở đi hỏi thầy dạy sinh", { know: 4, rel: -1, flags: [talentFlag(HB), "hrb_young_skeptic"], counters: { talents_seen: 1 } }, "Người nhà phật lòng, mở một con đường"),
    C("Cất cuốn vở, đừng làm bà buồn", { rel: 2, counters: { talents_seen: 1 } }, "Giữ hòa khí, câu hỏi bỏ ngỏ")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(HB, "hrb_d_heir", [20, 45], () => true, (c, N) => { const m = role(c, "mentor"); const who = m ? N(m) : "Ông thầy thuốc già đầu làng";
    return T("Tủ thuốc trăm ngăn", `${who} đã yếu, không còn lên đồi được nữa. Ông muốn trao cho bạn tủ thuốc trăm ngăn, ba cuốn sổ chép tay và những người bệnh quen. Ông chỉ dặn một câu: phải biết cái gì mình không chữa được.`, [
      C("Nhận tủ thuốc, theo ông học", { ...become(HB), counters: { doors_seen: 1 }, money: -0.05, ...(m ? { trust: { npc: m, delta: 0.3 } } : {}) }, "Thu nhập ít, nhận cả nghề lẫn trách nhiệm"),
      C("Đi học lớp y sĩ trước, nhận sau", { counters: { doors_seen: 1 }, money: -0.08, know: 4, gamble: { p: 0.45, win: { ...become(HB), flags: ["hrb_trained"], log: "Hai năm sau bạn có chứng chỉ, về ngồi cạnh ông bên tủ thuốc." }, lose: { log: "Bạn học xong thì ông đã trao tủ thuốc cho người khác." } } }, "Chắc tay hơn, có thể lỡ dịp"),
      C("Từ chối, nghề này không nuôi nổi ai", { counters: { doors_seen: 1 }, money: 0.03 }, "Giữ việc ổn định, tủ thuốc vào tay người khác")], 0, m ? { npc: m } : {}); }),
  door(HB, "hrb_d_course", [26, 55], () => true, (c) => T("Lớp y học cổ truyền buổi tối", `Sau mấy năm ${c.has_job ? "làm việc đến kiệt sức" : "chăm người ốm trong nhà"}, bạn ghi tên một lớp y học cổ truyền buổi tối. Một phòng chẩn trị cần người phụ: lương bằng hai phần ba việc cũ, được học tay đôi với thầy.`, [
    C("Bỏ việc, vào phòng chẩn trị", { ...become(HB), counters: { doors_seen: 1 }, income_mult: 0.85, happy: 3 }, "Ít tiền hơn, làm việc mình tin"),
    C("Học tiếp buổi tối, chờ thêm", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.3, win: { ...become(HB), log: "Năm sau phòng chẩn trị mời bạn vào hẳn, lương khá hơn." }, lose: { log: "Lớp học đóng vì thiếu học viên. Bạn giữ lại mấy cuốn giáo trình." } } }, "Không mất gì, có thể chẳng đi đến đâu"),
    C("Thôi, học cho biết", { counters: { doors_seen: 1 }, know: 2 }, "Biết thêm, nghề vẫn là nghề cũ")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(HB, 1, 1, (c) => T("Tiếng ho ba tháng", `Người bệnh đầu tiên tự tìm đến bạn: một bác thợ hồ ho đã ba tháng, sút cân, đêm nào cũng vã mồ hôi. Bác không có tiền đi viện, chỉ xin ít ${herb(c)} cho dịu cổ. ${f(c, "hrb_young_skeptic") ? "Cuốn vở hồi nhỏ dạy bạn rằng có những thứ lá không đổi được gì." : "Thầy bạn từng dặn phải biết cái gì mình không chữa được."}`, [
    C("Bốc thuốc dịu họng như bác xin", { counters: step(c, HB, { hrb_trust: 1 }), money: 0.02, flags: ["hrb_comfort_only"] }, "Bác vui, bệnh thật chưa ai xem"),
    C("Không bốc gì, bắt bác đi chụp phổi trước", { counters: step(c, HB, { hrb_evidence: 1 }), flags: ["hrb_refers"], gamble: { p: 0.5, win: { log: "Bác đi chụp, được chữa đúng bệnh. Tháng sau bác dẫn cả vợ đến cảm ơn." }, lose: { counters: { hrb_trust: -1 }, log: "Bác bỏ về, kể với cả xóm rằng thầy mới kênh kiệu." } } }, "Đúng việc, có thể mất người bệnh"),
    C("Bỏ tiền túi đưa bác đi khám, dặn quay lại", { counters: step(c, HB, { hrb_evidence: 1, hrb_trust: 1 }), flags: ["hrb_refers"], money: -0.04, bw: -2 }, "Tốn tiền tốn công, giữ được cả người lẫn lòng tin", { tier: "awakened" })], 2)),
  beat(HB, 2, 3, (c) => T("Tên bạn trên nhãn chai", `Tiếng lành đồn xa, sáng nào trước cửa cũng có chục người chờ. Một công ty muốn đóng chai “bài thuốc của thầy”, in tên và ảnh bạn lên nhãn, quảng cáo là chữa dứt điểm cả chục bệnh. Họ trả một khoản bằng ba năm thu nhập.`, [
    C("Ký, để họ quảng cáo thế nào cũng được", { counters: step(c, HB), money: 1.0, income_mult: 1.3, flags: ["hrb_brand"] }, "Giàu nhanh, tên bạn đứng sau những lời hứa không thật"),
    C("Từ chối, vay tiền mở phòng chẩn trị có giấy phép", { counters: step(c, HB), custom: "borrow:0.3", flags: ["hrb_licensed"], income_mult: 1.15, bw: -3 }, "Chậm, có nợ, đứng vững trước pháp luật"),
    C("Mời trạm y tế cùng ghi sổ theo dõi người bệnh", { counters: step(c, HB, { hrb_evidence: 2 }), flags: ["hrb_records"], agency: 0.03, gamble: { p: 0.5, win: { counters: { hrb_trust: 1 }, log: "Bác sĩ trạm đồng ý. Mỗi tháng hai bên ngồi xem sổ một buổi." }, lose: { log: "Trạm bận quá, chỉ ghi được ba tháng. Bạn tự ghi tiếp." } } }, "Không thêm tiền, biết thật cái gì có ích", { tier: "sovereign" })], 1)),
  beat(HB, 3, 4, (c) => T("Bà cụ không chịu đi viện", `Bà cụ bán xôi đầu chợ có một khối u ở ngực, to dần nửa năm nay. Bà nói chết cũng không vào viện, chỉ tin thuốc của bạn. ${f(c, "hrb_brand") ? "Con gái bà cầm theo chai thuốc in ảnh bạn, chữ “chữa dứt điểm” nằm ngay dưới ảnh. " : ""}Con cháu xin bạn nhận chữa, vì bà chỉ nghe mỗi bạn.`, [
    C("Nhận chữa theo ý bà", { counters: step(c, HB, { hrb_trust: 1 }), money: 0.05, gamble: { p: 0.2, win: { log: "Một năm, khối u không lớn thêm. Không ai biết vì sao, kể cả bạn." }, lose: { flags: ["hrb_patient_lost"], happy: -8, log: "Mùa đông năm sau bà mất. Đến lúc ấy, bệnh viện cũng không còn làm được gì." } } }, "Giữ lòng tin của bà, đánh cược một mạng người"),
    C("Nói thật thuốc của mình không chữa được u, đưa bà đi viện", { counters: step(c, HB, { hrb_evidence: 1 }), flags: ["hrb_told_limit"], gamble: { p: f(c, "hrb_refers") || f(c, "hrb_records") ? 0.6 : 0.4, win: { counters: { hrb_trust: 1 }, log: "Bà khóc cả buổi, rồi để bạn dắt vào viện. Lần khám nào bà cũng đòi bạn ngồi cạnh." }, lose: { counters: { hrb_trust: -1 }, log: "Bà bỏ đi tìm một ông thầy khác, người hứa chữa khỏi." } } }, "Thật với bà, có thể mất bà vào tay kẻ khác", { tier: "awakened" }),
    C("Từ chối, đóng cửa phòng thuốc", { counters: step(c, HB), ...leave(HB), happy: -4, flags: ["ex_herbalist"] }, "Không gánh mạng người, bỏ nghề")], 1)),
  beat(HB, 4, 5, (c) => {
    if (f(c, "hrb_brand") || f(c, "hrb_patient_lost")) return T("Đơn tố cáo", `${f(c, "hrb_brand") ? "Cơ quan quản lý khởi tố công ty đóng chai thuốc mang tên bạn vì quảng cáo sai sự thật." : "Con gái bà cụ bán xôi gửi đơn tố cáo bạn hành nghề làm chết người."} Phóng viên đứng chờ trước cửa phòng thuốc. Luật sư nói bạn có thể nhận mình chỉ là người bị lợi dụng.`, [
      C("Khai thật mọi lời hứa đã nói ra", { counters: step(c, HB, { honest: 2, hrb_evidence: 1 }), custom: "apologize", income_mult: 0.6, flags: ["hrb_confessed"] }, "Mất tiếng và tiền, giữ được lương tâm"),
      C("Nhận là bị lợi dụng, đổ cho người khác", { counters: step(c, HB, { honest: -2 }), money: -0.3, flags: ["hrb_blamed_others"] }, "Có thể thoát, người trong nghề sẽ nhớ"),
      C("Đóng phòng thuốc, rời nghề", { counters: step(c, HB), ...leave(HB), close_doors: ["village_trust"], money: -0.2 }, "Chấm dứt, cả vùng không còn tin bạn")], 0);
    if (f(c, "hrb_told_limit") || f(c, "hrb_records") || n(c, "hrb_evidence") >= 2) return T("Phòng thí nghiệm muốn thử lá của bạn", `${f(c, "hrb_records") ? "Mười năm sổ theo dõi của bạn và trạm y tế đến tay một nhóm nghiên cứu đại học." : "Một bác sĩ bệnh viện tỉnh nhớ chuyện bạn tự dắt người bệnh vào khám."} Họ muốn thử nghiệm đàng hoàng một loại cây bạn hay dùng. Kết quả có thể cho thấy nó có ích, cũng có thể cho thấy nó vô dụng.`, [
      C("Đồng ý, chấp nhận kết quả dù thế nào", { counters: step(c, HB, { hrb_evidence: 2 }), flags: ["hrb_trial"], gamble: { p: 0.4, win: { income_mult: 1.3, log: "Cây có tác dụng thật, nhỏ hơn nhiều so với lời đồn. Tên bạn có trong bài báo khoa học." }, lose: { income_mult: 0.9, happy: -2, log: "Không khác gì giả dược. Bạn thôi dùng loại lá ấy và nói thẳng với người bệnh." } } }, "Có thể mất niềm tin vào chính mình", { tier: "sovereign" }),
      C("Bán quyền cây thuốc cho một công ty dược", { counters: step(c, HB), money: 0.8, flags: ["hrb_sold_rights"] }, "Tiền lớn, cây thuốc thành của người khác"),
      C("Từ chối, giữ bí truyền", { counters: step(c, HB, { hrb_trust: 1 }), happy: 1 }, "Giữ vẻ bí ẩn, không bao giờ biết thật")], 0);
    return T("Hàng người từ năm giờ sáng", "Bạn thành thầy thuốc có tiếng nhất vùng. Người xếp hàng từ năm giờ sáng, có người đi xe cả ngày mới đến. Bạn khám hơn sáu mươi người một ngày, không còn kịp hỏi ai là ai.", [
      C("Khám hết, tăng giá cho bớt đông", { counters: step(c, HB), income_mult: 1.4, health: -4 }, "Giàu lên, thành cái máy bốc thuốc"),
      C("Giới hạn hai mươi người, khám cho kỹ", { counters: step(c, HB, { hrb_trust: 1 }), income_mult: 0.95, happy: 3 }, "Ít tiền, có thì giờ nghe người bệnh"),
      C("Nhận hai học trò, dạy cả cách biết từ chối", { counters: step(c, HB), flags: ["has_apprentice"], bw: -4, agency: 0.02 }, "Mệt thêm mấy năm, nghề có người nối", { tier: "awakened" })], 1);
  }),
  beat(HB, 5, 6, (c) => T("Những cuốn sổ chép tay", `Tủ thuốc của bạn giờ có thêm chục cuốn sổ chép tay: cây gì, ai dùng, ai đỡ, ai không. ${f(c, "hrb_trial") ? "Một trang ghi rõ loại lá bạn đã bỏ, kèm lý do." : f(c, "hrb_confessed") ? "Có một cuốn bạn không dám mở lại." : "Có những dòng bạn biết chưa từng được ai kiểm chứng."} Viện nghiên cứu xin bộ sổ; con cháu muốn giữ làm của gia truyền.`, [
    C("Tặng sổ cho viện, ghi rõ chỗ nào chưa chắc", { counters: step(c, HB), flags: ["passed_on"], happy: 4, know: 2 }, "Nghề vào sách, nhà mất của riêng"),
    C("Truyền sổ cho con cháu", { counters: step(c, HB), rel: 4, flags: ["hrb_family_books"] }, "Giữ trong nhà, đúng sai cũng giữ"),
    C("Gạch những trang chưa từng giúp ai, rồi nghỉ", { counters: step(c, HB), ...leave(HB), happy: 3 }, "Trung thực đến cùng, mất một phần di sản")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(HB, "hrb_wild", [20, 75], 8, (c) => T("Cây thuốc trên núi cạn dần", vary("hrbwi", c.age, ["Loại rễ bạn hay dùng giờ phải đi ba ngày mới tìm được. Người hái thuê bán giá gấp năm.", "Khu đồi bạn hái thuốc hai mươi năm vừa bị san phẳng làm khu nghỉ dưỡng."]), [
    C("Mua của người hái thuê, không hỏi nguồn", { money: -0.04, counters: { honest: -1 } }, "Đủ thuốc, góp phần làm núi trọc"),
    C("Tự trồng một vườn thuốc, chờ ba năm", { money: -0.06, bw: -3, flags: ["hrb_garden"] }, "Tốn tiền và chờ đợi, có nguồn sạch", { longterm: true }),
    C("Thôi dùng loại cây ấy", { counters: { hrb_trust: -1 } }, "Núi đỡ, người bệnh hỏi sao đổi thuốc")], 1)),
  daily(HB, "hrb_chemo", [22, 75], 8, (c) => T("Bỏ hóa trị để uống lá", vary("hrbch", c.age, ["Người nhà một chị đang hóa trị đến xin thuốc để chị bỏ viện về nhà. Họ nói hóa trị làm chị rụng hết tóc, gầy rộc.", "Một anh mới biết mình bị ung thư hỏi bạn có cách nào thay được ca mổ không. Anh sợ dao kéo hơn sợ chết."]), [
    C("Bán thuốc theo ý họ", { money: 0.04, counters: { honest: -1, hrb_trust: 1 } }, "Được lòng người nhà, đánh cược mạng người"),
    C("Khuyên giữ điều trị, thứ gì thêm phải hỏi bác sĩ", { counters: { honest: 1, hrb_evidence: 1 }, gamble: { p: 0.6, win: { log: "Họ quay lại bệnh viện. Tháng sau họ mang trái cây đến cảm ơn." }, lose: { counters: { hrb_trust: -1 }, log: "Họ bỏ đi tìm một thầy khác dễ tính hơn." } } }, "Thật lòng, có thể mất người bệnh")], 1)),
  daily(HB, "hrb_tainted", [20, 75], 9, () => T("Bột thuốc rẻ bất thường", "Một mối buôn mang đến bột thuốc giá chỉ bằng nửa, nói người dùng thấy đỡ ngay sau hai ngày. Trong nghề có lời thì thầm rằng loại bột ấy có trộn thuốc tây mà không ghi trên bao.", [
    C("Nhập về dùng, người bệnh khen đỡ nhanh", { money: 0.1, counters: { hrb_trust: 1, honest: -2 }, flags: ["hrb_tainted"] }, "Tiếng tăm lên, một thứ độc nằm trong tủ"),
    C("Từ chối mối buôn", { counters: { honest: 1 } }, "Không thêm lời, không thêm tội"),
    C("Gửi mẫu đi kiểm nghiệm, báo cơ quan quản lý", { money: -0.03, bw: -2, agency: 0.01, gamble: { p: 0.5, win: { counters: { hrb_evidence: 1 }, log: "Mẫu có chất cấm. Đường dây bị bắt, tên bạn không bị lộ." }, lose: { log: "Mẫu thất lạc. Mối buôn chuyển sang bán cho thầy khác." } } }, "Tốn tiền, có thể chặn được cái hại", { tier: "awakened" })], 1)),
  daily(HB, "hrb_doctor", [20, 75], 8, () => T("Bác sĩ trẻ ở trạm y tế", "Bác sĩ mới về trạm y tế nói giữa buổi họp thôn rằng thầy thuốc vườn chỉ làm người bệnh đến viện muộn. Mấy chục người quay sang nhìn bạn.", [
    C("Cãi lại ngay giữa buổi họp", { happy: 1, counters: { hrb_trust: 1 }, flags: ["hrb_feud_clinic"] }, "Giữ thể diện, thêm một người đối đầu"),
    C("Mời bác sĩ đến xem sổ khám của mình", { bw: -2, gamble: { p: 0.55, win: { counters: { hrb_evidence: 1 }, flags: ["hrb_clinic_ally"], log: "Bác sĩ chỉ ra ba trường hợp lẽ ra bạn nên chuyển viện sớm hơn. Từ đó hai bên gửi bệnh cho nhau." }, lose: { log: "Bác sĩ không đến. Lời nói hôm ấy vẫn còn trong làng." } } }, "Nuốt tự ái, có thể có một đồng minh", { tier: "awakened" }),
    C("Im lặng, làm tiếp", { happy: -2, counters: { hrb_trust: -1 } }, "Không động chạm, nghi ngờ ở lại")], 1)),
  daily(HB, "hrb_pay", [20, 75], 8, (c) => T("Trả công bằng con gà", vary("hrbpa", c.age, ["Một ông cụ không có tiền, mang đến một con gà mái và một rổ trứng thay tiền thuốc.", "Ba tháng nay, một nửa người bệnh khất nợ bạn. Tiền mua dược liệu thì không khất được."]), [
    C("Nhận gì cũng được, không đòi", { money: -0.04, rel: 3, counters: { hrb_trust: 1 } }, "Được lòng người nghèo, túi cạn"),
    C("Treo bảng giá, không có tiền thì không bốc", { money: 0.04, counters: { hrb_trust: -1 } }, "Đủ sống, người nghèo đi chỗ khác"),
    C("Thu theo khả năng: giàu trả thêm, nghèo trả ít", { bw: -2, flags: ["hrb_sliding_fee"], agency: 0.01 }, "Phải nói chuyện tiền với từng người", { tier: "sovereign" })], 2)),
  daily(HB, "hrb_video", [20, 75], 9, () => T("Máy quay trong phòng thuốc", "Một người làm video có hai triệu người theo dõi muốn quay một buổi ở phòng thuốc của bạn. Kịch bản viết sẵn câu bạn phải nói: “bài thuốc này chữa khỏi tiểu đường”.", [
    C("Nói theo kịch bản", { money: 0.15, income_mult: 1.2, flags: ["hrb_viral_claim"], counters: { honest: -2 } }, "Nổi tiếng một đêm, lời hứa không thật lan đi"),
    C("Nhận quay, nhưng nói thật mình không chữa khỏi", { gamble: { p: 0.4, win: { counters: { hrb_trust: 1, hrb_evidence: 1 }, log: "Họ vẫn đăng. Video ít người xem, nhưng bác sĩ trong tỉnh chia sẻ." }, lose: { log: "Họ cắt phần của bạn, sang quay ông thầy làng bên." } } }, "Thật thà trước máy quay, có thể chẳng được gì"),
    C("Từ chối", { happy: 1, counters: { honest: 1 } }, "Yên ổn, ít người biết bạn")], 2)),
  daily(HB, "hrb_lookalike", [20, 75], 9, () => T("Lá giống lá", "Một người hàng xóm tự lên đồi hái thứ lá anh tưởng là loại bạn hay dùng, mang về uống rồi phải đi cấp cứu. Cả xóm bàn tán là thuốc của bạn độc.", [
    C("Vào viện thăm, nói rõ đó không phải lá của mình", { bw: -2, rel: 2, counters: { hrb_trust: 1 } }, "Mất công, giữ được tiếng"),
    C("Mở buổi nói chuyện: đừng tự hái, tự uống", { bw: -3, agency: 0.01, flags: ["hrb_warned_village"], counters: { hrb_evidence: 1 } }, "Mất khách tự túc, bớt người ngộ độc", { tier: "awakened" }),
    C("Kệ, người ta tự làm thì tự chịu", { counters: { hrb_trust: -1 }, happy: -1 }, "Đỡ việc, lời đồn ở lại")], 0)),
  daily(HB, "hrb_license", [20, 75], 10, () => T("Kỳ thi cấp phép hành nghề", "Quy định mới: ai bốc thuốc phải có chứng chỉ, thi cả lý thuyết lẫn thực hành. Một người quen nói có thể lo giấy tờ trọn gói, khỏi thi.", [
    C("Ôn thi nửa năm", { bw: -5, know: 4, flags: ["hrb_licensed"] }, "Mệt, có giấy phép thật"),
    C("Nhờ người quen lo giấy", { money: -0.1, flags: ["hrb_licensed"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [3, 10], note: "chứng chỉ hành nghề thuốc mua trọn gói" } }, "Nhanh, một tờ giấy có thể bị lật lại"),
    C("Không thi, chỉ giúp người quen không lấy tiền", { income_mult: 0.7, counters: { hrb_trust: 1 } }, "Không phạm luật, thu nhập rơi")], 0)),
  daily(HB, "hrb_tourist", [25, 75], 9, (c) => T("Khách phương xa tìm phép màu", `Một đoàn khách ${vn(c) ? "nước ngoài" : "từ thành phố lớn"} đặt cả tuần ở phòng thuốc, trả gấp mười giá thường. Họ muốn nghe về “bí mật ngàn năm” và mang về một câu chuyện kỳ diệu.`, [
    C("Kể chuyện huyền bí, bán đúng thứ họ muốn", { money: 0.15, counters: { honest: -1 }, flags: ["hrb_mystique"] }, "Tiền dễ, nghề thành màn trình diễn"),
    C("Dạy họ tên cây, nói rõ cái gì chưa ai chứng minh", { money: 0.05, know: 1, counters: { hrb_evidence: 1 } }, "Ít tiền, khách có thể thất vọng")], 1)),
  daily(HB, "hrb_quit", [30, 75], 99, () => T("Tủ thuốc phủ bụi", "Người bệnh thưa dần, ai cũng có bảo hiểm và tin bệnh viện hơn. Tháng này bạn chỉ bốc chưa đến mười thang. Một người họ hàng rủ bạn về làm ăn chung, thu nhập đều.", [
    C("Đóng tủ thuốc, đi làm với họ hàng", { ...leave(HB), flags: ["ex_herbalist"], money: 0.1 }, "Đủ ăn, nghề nằm lại"),
    C("Giữ tủ thuốc mở, sống thanh đạm", { happy: 1, income_mult: 0.85, counters: { hrb_trust: 1 } }, "Nghèo hơn, vẫn là thầy thuốc")], 1), (c) => c.happy < 45 || c.broke),

  /* ---------- gia đình ---------- */
  cross(HB, "hrb_family", [22, 75], (c) => (c.parent_sick && (!!role(c, "father") || !!role(c, "mother"))) || (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse"), (c, N) => {
    const p = role(c, "father") ?? role(c, "mother"); const k = role(c, "child"); const s = role(c, "spouse");
    if (c.parent_sick && p) return T("Người nhà cũng không chịu đi viện", `${N(p)} đau bụng dữ dội từ hôm qua nhưng nhất định không đi viện: “con làm thầy thuốc, sao bắt bố mẹ đi chỗ khác”. Cả nhà chờ bạn quyết.`, [
      C("Gọi xe đưa đi viện ngay, mặc phản đối", { trust: { npc: p, delta: -0.15 }, money: -0.05, counters: { hrb_evidence: 1 }, log: `Bác sĩ nói muộn thêm một ngày là khó. ${N(p)} giận bạn cả tuần.` }, "Giận nhau, giữ được người"),
      C("Chăm ở nhà theo ý người nhà", { trust: { npc: p, delta: 0.2 }, gamble: { p: 0.4, win: { log: "Cơn đau tự qua sau hai ngày. Bạn biết mình đã gặp may." }, lose: { happy: -6, flags: ["hrb_family_guilt"], log: "Đến ngày thứ ba thì phải cấp cứu. Ca mổ khó hơn nhiều." } } }, "Chiều lòng, đánh cược với người thân")], 0, { npc: p });
    if (c.kids_teen > 0 && k) return T(`${N(k)} gọi nghề của bạn là mê tín`, `${N(k)} đứng đầu lớp môn sinh, vừa nói giữa bữa cơm rằng nghề của bạn là mê tín, và sau này sẽ học y khoa để “chữa bệnh thật”.`, [
      C("Nổi giận, cấm nói thế trong nhà", { trust: { npc: k, delta: -0.25 } }, "Giữ uy, con im lặng chứ không đổi ý"),
      C("Đưa con xem sổ ghi chép, cùng tìm cái gì đúng", { trust: { npc: k, delta: 0.25 }, counters: { hrb_evidence: 1 }, promise: { to: k, what: "cùng con kiểm lại những ghi chép trong sổ thuốc", years: 2 } }, "Mất chút tự ái, có thêm một người cùng hỏi", { tier: "awakened" }),
      C("Mừng, đóng tiền luyện thi y cho con", { trust: { npc: k, delta: 0.15 }, money: -0.08 }, "Con đi đường khác, nghề nhà không người nối")], 1, { npc: k });
    return T("Bữa cơm thiếu người", `${N(s!)} ăn tối một mình đã ba tuần: bạn ngồi phòng thuốc đến mười giờ đêm vì người bệnh không chịu về. ${N(s!)} hỏi bạn lo cho cả làng, ai lo cho cái nhà này.`, [
      C("Đóng cửa phòng thuốc lúc sáu giờ", { trust: { npc: s!, delta: 0.25 }, income_mult: 0.9 }, "Ít người bệnh, có bữa cơm"),
      C("Xin thông cảm, người bệnh không chờ được", { trust: { npc: s!, delta: -0.2 }, money: 0.03 }, "Giữ nghề, nhà nguội dần")], 0, { npc: s! }); }),
];

export const PACK_CRAFT_B: Storylet[] = [...BKR_CARDS, ...HRB_CARDS];
