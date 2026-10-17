/**
 * Gói "Đời thường đặc biệt" A: SHIPPER · TÀI XẾ XE CÔNG NGHỆ · NGƯỜI BÁN HÀNG RONG · NGƯỜI NHẶT VE CHAI.
 * Theo chuẩn của singer.ts và docs/content-guide.md. Tiền tố id: shp_ · rhd_ · hrg_ · vch_.
 * Bộ đếm riêng: shp_stars, shp_crew · rhd_stars · hrg_regulars · vch_trust.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;
/** Các nhịp truyện có chuyện tiền nong của người lớn: chỉ mở từ 18 tuổi. */
const A18 = (c: FactContext): boolean => c.age >= 18;

/* =====================================================================
 * SHIPPER — tiền tố shp_
 * ===================================================================== */
const SH = "shipper";

const SHP_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SH, "shp_t_alleys", [10, 15], () => true, (c) => T("Đứa trẻ thuộc mọi con hẻm", `Cô bán tạp hóa đầu ${vn(c) ? "hẻm" : "phố"} nhờ bạn đạp xe mang mấy két nước ngọt đến nhà khách. Bạn đi đường tắt qua ba con ngõ, về trước khi đá trong thùng kịp tan. Cô bảo: "Mai cô trả công, cháu chạy tiếp nhé?"`, [
    C("Nhận chạy hàng cho cô sau giờ học", { money: 0.01, know: -1, health: 1, flags: [talentFlag(SH)], counters: { talents_seen: 1 } }, "Có tiền tiêu vặt, bớt giờ học"),
    C("Cảm ơn cô, về làm bài tập", { know: 2, counters: { talents_seen: 1 } }, "Học đủ giờ, chiếc xe đạp nằm yên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SH, "shp_d_layoff", [20, 45], () => true, (c) => T("Áo khoác màu của ứng dụng", `${c.has_job ? "Xưởng nơi bạn làm cắt một nửa ca." : "Bạn đã nộp hồ sơ ba tháng mà chưa ai gọi lại."} Đầu ngõ, người mặc áo khoác của ứng dụng giao hàng ngày một đông. Đăng ký chỉ cần xe máy, điện thoại và một tấm ảnh chân dung.`, [
    C("Đăng ký, chạy toàn thời gian", { ...become(SH), counters: { doors_seen: 1 }, money: -0.03, agency: 0.01 }, "Có tiền ngay tuần sau, không có bảo hiểm"),
    C("Chạy buổi tối, ban ngày vẫn tìm việc", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.45, win: { ...become(SH), log: "Ba tuần sau, tiền giao hàng đã hơn lương cũ. Bạn thôi nộp hồ sơ." }, lose: { log: "Bạn chạy được một tháng rồi có việc khác. Chiếc áo khoác treo sau cửa." } } }, "Ít liều hơn, mệt gấp đôi"),
    C("Chờ việc đúng nghề", { counters: { doors_seen: 1 }, money: -0.05, happy: -2 }, "Giữ nghề cũ, tiêu dần tiền dành dụm")], 0)),
  door(SH, "shp_d_student", [18, 25], () => true, () => T("Ca tối của sinh viên", "Học phí kỳ này tăng, tiền nhà trọ cũng tăng. Thằng bạn cùng phòng chạy giao đồ ăn từ sáu giờ tối đến mười một giờ đêm, cuối tuần đủ tiền ăn cả tháng.", [
    C("Mượn xe của bạn, chạy ca tối", { ...become(SH), counters: { doors_seen: 1 }, know: -2, money: 0.03 }, "Tự lo được tiền, điểm thi tụt"),
    C("Xin dạy kèm, ít tiền hơn", { counters: { doors_seen: 1 }, money: 0.01, know: 2 }, "Giữ sức học, túi vẫn mỏng")], 0)),
  door(SH, "shp_d_cousin", [18, 40], () => true, () => T("Chiếc xe trả góp của anh họ", "Anh họ bạn mở một điểm nhận gửi hàng nhỏ, thiếu người chạy tuyến ngoại thành. Anh đứng tên cho bạn mua trả góp một chiếc xe máy, trừ dần vào tiền công.", [
    C("Nhận xe, chạy tuyến cho anh", { counters: { doors_seen: 1 }, custom: `become:${SH}|borrow:0.15` }, "Có xe có việc, nợ người nhà"),
    C("Nhận việc nhưng tự thuê xe theo ngày", { ...become(SH), counters: { doors_seen: 1 }, income_mult: 0.9 }, "Không nợ ai, mỗi ngày mất tiền thuê"),
    C("Thôi, ngại làm ăn với họ hàng", { counters: { doors_seen: 1 }, rel: -1 }, "Giữ hòa khí, mất một cơ hội")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(SH, 1, 1, (c) => T("Tầng mười hai không có thang", "Đơn đầu tiên trong ngày: một ly trà sữa, giao lên tầng mười hai. Bảo vệ tòa nhà không cho shipper đi thang máy. Ứng dụng còn bảy phút, khách nhắn: \"Nhanh lên em ơi\".", [
    C("Chạy bộ mười hai tầng", { counters: step(c, SH, { shp_stars: 1 }), health: -2, flags: ["shp_fast"] }, "Năm sao, đôi gối biết đau"),
    C("Nhắn khách xuống sảnh lấy", { counters: step(c, SH), gamble: { p: 0.5, win: { log: "Khách xuống, còn xin lỗi vì bắt bạn chờ." }, lose: { counters: { shp_stars: -1 }, log: "Khách xuống, mặt nặng, chấm hai sao." } } }, "Giữ sức, có thể mất sao"),
    C("Ghi tên tòa nhà vào sổ, rủ anh em cùng đòi", { counters: step(c, SH, { shp_crew: 1 }), agency: 0.01, flags: ["shp_notebook"] }, "Chậm hôm nay, có bạn về sau", { tier: "awakened" })], 0), A18),
  beat(SH, 2, 3, (c) => T("Thuật toán xếp hạng", `Ứng dụng đổi luật: tài xế nhận trên chín mươi lăm phần trăm đơn được ưu tiên đơn ngon. Từ chối một đơn mười lăm cây số dưới mưa là tụt hạng.${f(c, "shp_notebook") ? " Cuốn sổ của bạn đã có tên ba mươi tòa nhà cấm thang." : ""}`, [
    C("Nhận mọi đơn, chạy mười bốn tiếng", { counters: step(c, SH, { shp_stars: 1 }), income_mult: 1.3, health: -6, flags: ["shp_grinder"] }, "Thu nhập lên, cơ thể trả giá"),
    C("Chạy tám tiếng, chịu đơn ít", { counters: step(c, SH), income_mult: 0.95, happy: 3, flags: ["shp_steady"] }, "Ít tiền hơn, còn bữa tối ở nhà"),
    C("Lập nhóm ở điểm đợi, chia đơn và mẹo", { counters: step(c, SH, { shp_crew: 2 }), income_mult: 1.1, rel: 4, agency: 0.02, flags: ["shp_crew"] }, "Không ai giàu hơn ai, có anh em", { tier: "sovereign" })], 0), A18),
  beat(SH, 3, 4, (c) => T("Ổ gà dưới nước", `${f(c, "shp_grinder") ? "Mười một giờ đêm, đơn thứ ba mươi tư." : "Chiều mưa to, nước ngập nửa bánh xe."} Bánh trước sụp vào một ổ gà không thấy đáy. Bạn gãy xương cổ tay, bát canh của khách đổ hết. Ứng dụng trừ tiền đơn hàng và gửi một tin nhắn tự động hỏi thăm.`, [
    C("Nghỉ hai tháng, chữa cho lành", { counters: step(c, SH), money: -0.3, health: 4, income_mult: 0.9 }, "Mất đà và tiền, giữ được cái tay"),
    C("Băng tay, chạy tiếp bằng một tay", { counters: step(c, SH), money: 0.05, gamble: { p: 0.5, win: { log: "Bạn qua được mùa mưa. Cổ tay lành lệch, trời trở là nhức." }, lose: { health: -10, income_mult: 0.8, log: "Bạn ngã lần nữa, lần này nằm viện ba tuần." } } }, "Có tiền tháng này, rủi ro cả đời"),
    ...(n(c, "shp_crew") >= 2 ? [C("Để anh em góp quỹ, chạy hộ khách quen", { counters: step(c, SH), money: -0.05, rel: 5, health: 2, flags: ["shp_crew_fund"] }, "Nợ ân tình, không mất khách", { tier: "sovereign" as const })] : []),
    C("Bán xe, về quê làm việc khác", { counters: step(c, SH), ...leave(SH), money: 0.1, happy: -2 }, "Hết lo ổ gà, hết nghề")], 0), A18),
  beat(SH, 4, 5, (c) => {
    if (f(c, "shp_crew")) return T("Ba ngày tắt ứng dụng", "Ứng dụng cắt hai mươi phần trăm tiền mỗi đơn. Nhóm của bạn giờ có bốn trăm người, ai cũng nhìn bạn. Có người đề nghị tắt ứng dụng ba ngày cùng lúc, đứng chật trước văn phòng công ty.", [
      C("Đứng đầu cuộc tắt ứng dụng", { counters: step(c, SH), gamble: { p: 0.45, win: { income_mult: 1.2, flags: ["shp_strike_won"], agency: 0.03, log: "Ngày thứ ba, công ty lùi một nửa mức cắt. Bạn lên báo." }, lose: { income_mult: 0.8, flags: ["shp_blacklisted"], log: "Tài khoản của bạn bị khóa vĩnh viễn. Anh em vẫn gọi bạn là trưởng nhóm." } } }, "Có thể thắng, có thể mất tài khoản"),
      C("Lập hợp tác xã giao hàng của anh em", { counters: step(c, SH), money: -0.3, income_mult: 0.95, agency: 0.03, flags: ["shp_coop"] }, "Không ông chủ, không ai bảo lãnh", { tier: "sovereign" }),
      C("Lặng lẽ chạy tiếp, nuôi nhà đã", { counters: step(c, SH), money: 0.06, rel: -5, flags: ["shp_stayed_out"] }, "Đủ tiền tháng này, mất mặt với nhóm")], 0);
    if (f(c, "shp_grinder")) return T("Tài khoản bị khóa", "Sáng nay, ứng dụng báo tài khoản của bạn bị khóa vì \"nhiều phản ánh tiêu cực\". Không có người để gọi, chỉ có một hộp thoại tự động trả lời trong vòng bảy ngày làm việc.", [
      C("Gửi kháng nghị kèm ảnh chụp mọi đơn hàng", { counters: step(c, SH), bw: -5, gamble: { p: 0.5, win: { log: "Mười hai ngày sau, tài khoản mở lại. Không ai giải thích vì sao." }, lose: { income_mult: 0.7, log: "Kháng nghị bị từ chối. Bạn chuyển sang chạy cho một ứng dụng nhỏ hơn." } } }, "Đúng quy trình, chờ trong túng"),
      C("Thuê tài khoản của người khác chạy tạm", { counters: step(c, SH), money: 0.08, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [1, 5], note: "chạy bằng tài khoản thuê của người khác" } }, "Có tiền ngay, sống dưới tên người khác"),
      C("Bỏ ứng dụng, xin làm ở kho hàng", { counters: step(c, SH), ...leave(SH), happy: 2, health: 3 }, "Lương cố định, mất tự do giờ giấc")], 0);
    return T("Tuyến hàng của chợ", `Mấy chục tiểu thương ở chợ gần nhà quen giao hàng qua bạn${n(c, "shp_stars") >= 2 ? ", vì bạn chưa làm vỡ một quả trứng nào" : ""}. Họ đề nghị bạn bỏ ứng dụng, làm tuyến giao riêng cho cả chợ, tính tiền theo tháng.`, [
      C("Nhận tuyến của chợ", { counters: step(c, SH), income_mult: 1.15, flags: ["shp_own_route"] }, "Thu nhập đều, phụ thuộc một cái chợ"),
      C("Vay mua thêm hai xe, thuê người chạy", { counters: step(c, SH), custom: "borrow:0.5", gamble: { p: 0.5, win: { income_mult: 1.5, flags: ["shp_fleet"], log: "Sau một năm, ba chiếc xe chạy kín lịch. Bạn bắt đầu ngồi một chỗ nghe điện thoại." }, lose: { income_mult: 0.85, log: "Một người làm thuê ôm hàng bỏ trốn. Bạn trả nợ thêm hai năm." } } }, "Thành chủ nhỏ, hoặc ôm nợ"),
      C("Giữ ứng dụng, không bó mình", { counters: step(c, SH), happy: 1 }, "Tự do, không gì chắc chắn")], 0);
  }, A18),
  beat(SH, 5, 6, (c) => T("Đầu gối và bản đồ", `Hai mươi năm ngồi xe, bác sĩ nói đầu gối bạn như của người bảy mươi. ${f(c, "shp_coop") || f(c, "shp_strike_won") ? "Anh em trong nhóm muốn bầu bạn làm người giữ quỹ chung." : f(c, "shp_fleet") ? "Ba chiếc xe của bạn giờ là tám." : "Ứng dụng vừa thêm nút giao bằng xe tự hành ở vài khu."} Một cậu shipper mới hỏi bạn đường tắt ra cảng.`, [
      C("Dạy cậu ấy mọi con hẻm bạn biết", { counters: step(c, SH), rel: 5, happy: 4, flags: ["passed_on"] }, "Không được gì, để lại bản đồ"),
      C("Bán xe, nghỉ hẳn", { counters: step(c, SH), ...leave(SH), health: 4, money: 0.1 }, "Đầu gối được nghỉ, ngày dài ra"),
      C("Viết lại cuốn sổ đường thành sách cho anh em", { counters: step(c, SH), agency: 0.02, know: 3, flags: ["shp_map_book"] }, "Mất nhiều đêm, thành người giữ ký ức", { tier: "sovereign" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SH, "shp_rain", [18, 60], 6, (c) => T("Thưởng mưa gấp rưỡi", vary("shpr", c.age, ["Bão vào, ứng dụng bật thưởng mưa gấp rưỡi. Đường ngập đến bô xe.", "Mưa từ chiều đến khuya, cả thành phố gọi đồ ăn. Đơn nổ liên tục trên màn hình."]), [
    C("Mặc áo mưa, chạy đến khuya", { money: 0.04, health: -3, counters: { shp_stars: 1 } }, "Tiền gấp rưỡi, ướt đến xương"),
    C("Trú mưa dưới mái hiên, nghỉ", { money: -0.01, happy: 1 }, "Khô người, mất một tối đẹp tiền")], 0)),
  daily(SH, "shp_bomb", [18, 60], 7, () => T("Đơn bom năm ly trà sữa", "Bạn ứng tiền mua năm ly trà sữa cho một đơn thu tiền khi nhận. Đến nơi, số điện thoại không ai nghe, cổng khóa, đá đã tan một nửa.", [
    C("Đăng số đó lên nhóm shipper cảnh báo", { money: -0.01, flags: ["shp_warned_bomb"], counters: { shp_crew: 1 } }, "Mất tiền, anh em bớt mất theo"),
    C("Đứng đợi thêm nửa tiếng", { bw: -3, gamble: { p: 0.3, win: { log: "Khách về, rối rít xin lỗi, trả thêm tiền chờ." }, lose: { money: -0.01, log: "Không ai về. Bạn mang năm ly trà sữa ra điểm đợi chia anh em." } } }, "Mất giờ, có thể gỡ lại")], 0)),
  daily(SH, "shp_tuesday", [20, 60], 99, () => T("Bát cháo thứ ba", "Có một ông cụ sống một mình ở tầng bốn, chiều thứ ba nào cũng đặt một bát cháo cá. Hôm nay ông không nghe máy, cửa khóa trong, bên trong có tiếng tivi.", [
    C("Gọi bảo vệ phá cửa xem sao", { bw: -2, gamble: { p: 0.6, win: { flags: ["shp_saved_customer"], happy: 6, log: "Ông cụ ngã trong nhà tắm từ sáng. Con gái ông gọi cho bạn từ bệnh viện." }, lose: { counters: { shp_stars: -1 }, log: "Ông đang ngủ quên. Ông cáu, rồi cười, rồi cho bạn cái bánh." } } }, "Trễ ba đơn, có thể cứu một người"),
    C("Để cháo ở cửa, đi đơn tiếp", { counters: { shp_stars: 1 }, happy: -2 }, "Đúng giờ, lấn cấn cả đêm")], 0)),
  daily(SH, "shp_ticket", [18, 60], 8, (c) => T("Biên bản dừng xe", `Bạn dừng xe trước cửa quán đợi lấy đồ ăn. ${vn(c) ? "Một tổ cảnh sát giao thông" : "Một nhân viên kiểm soát đỗ xe"} lập biên bản: dừng sai chỗ, phạt bằng tiền chạy ba ngày.`, [
    C("Ký biên bản, nộp phạt", { money: -0.03, counters: { honest: 1 } }, "Mất ba ngày công, giấy tờ sạch"),
    C("Dúi ít tiền cho qua", { money: -0.01, secret: { tag: "PAID_BRIBE", severity: 0.1, fuse_years: [1, 4], note: "dúi tiền cho qua biên bản dừng xe" } }, "Rẻ hơn, có người nhớ mặt bạn"),
    C("Xin quán kẻ một ô chờ cho shipper", { money: -0.03, agency: 0.01, gamble: { p: 0.5, win: { flags: ["shp_waiting_bay"], log: "Tuần sau, quán sơn một ô vàng trên vỉa hè của chính họ." }, lose: { log: "Chủ quán bảo không phải việc của họ." } } }, "Vẫn mất tiền, có thể đổi chỗ đứng", { tier: "awakened" })], 0)),
  daily(SH, "shp_kitchen", [18, 60], 8, (c) => T("Bốn mươi phút trước bếp", vary("shpk", c.age, ["Quán đông khách tại chỗ, bắt shipper đứng chờ bốn mươi phút. Khách nhắn hỏi đơn đâu.", "Bếp làm sai món, bảo bạn chờ làm lại. Đồng hồ trên ứng dụng chuyển màu đỏ."]), [
    C("Hủy đơn, chạy đơn khác", { counters: { shp_stars: -1 }, money: 0.01 }, "Không phí thời gian, mất sao"),
    C("Chờ, nhắn khách xin lỗi thay quán", { bw: -2, counters: { shp_stars: 1 } }, "Giữ khách, mất cả buổi"),
    C("Ghi quán vào danh sách tránh của nhóm", { flags: ["shp_blacklist_shop"], counters: { shp_crew: 1 } }, "Đỡ anh em, quán có thể trả đũa")], 1)),
  daily(SH, "shp_missing", [18, 60], 8, () => T("Kiện hàng không ai nhận", "Một khách khiếu nại chưa nhận được chiếc điện thoại bạn đã giao tận tay hôm qua. Ứng dụng tạm trừ tiền hàng vào ví của bạn, bằng hai tuần chạy.", [
    C("Gửi ảnh giao hàng, đòi xét lại", { bw: -3, gamble: { p: 0.6, win: { log: "Ảnh có cả bàn tay khách cầm hộp. Tiền được hoàn sau mười ngày." }, lose: { money: -0.04, log: "Ảnh bị mờ. Bạn mất tiền và chụp kỹ hơn từ hôm đó." } } }, "Tốn sức, có thể lấy lại"),
    C("Chịu mất, coi như học phí", { money: -0.04, flags: ["shp_film_every_drop"] }, "Đỡ mệt, mất hai tuần công")], 0)),
  daily(SH, "shp_engine", [18, 60], 7, () => T("Xe chết máy lúc chín giờ tối", "Chiếc xe đã chạy hơn trăm nghìn cây số, chết máy giữa cầu. Trên ứng dụng còn hai đơn đang giao. Thợ quen nói đến lúc thay cả máy rồi.", [
    C("Thay máy mới, trả một lần", { money: -0.06, health: 1 }, "Hết tiền dành dụm, xe chạy chắc"),
    C("Nhờ thợ quen sửa tạm", { money: -0.01, gamble: { p: 0.5, win: { log: "Xe chạy thêm được hai năm, ho mỗi sáng." }, lose: { money: -0.03, log: "Một tuần sau xe lại chết, lần này giữa đường cao tốc." } } }, "Rẻ trước, có thể đắt sau"),
    C("Mua xe điện trả góp", { custom: "borrow:0.1", flags: ["shp_ebike"] }, "Đỡ tiền xăng, thêm một khoản nợ")], 0)),
  daily(SH, "shp_night", [18, 55], 7, (c) => T("Đơn thuốc lúc hai giờ sáng", vary("shpn", c.age, ["Hai giờ sáng, một đơn mua thuốc hạ sốt cho trẻ con. Giá gấp đôi, đường vắng tanh.", "Ca đêm chỉ còn bạn và mấy xe rác. Đơn ít nhưng mỗi đơn đáng hai đơn ban ngày."]), [
    C("Chạy ca đêm", { money: 0.03, health: -3, rel: -1, counters: { shp_stars: 1 } }, "Tiền gấp đôi, ngủ ngày"),
    C("Tắt máy, về ngủ", { health: 1 }, "Khỏe người, người khác nhận đơn")], 1)),
  daily(SH, "shp_stolen_bike", [18, 60], 8, () => T("Chiếc xe của cậu em mới", "Cậu em mới vào nghề bị giật mất xe khi vừa leo lên tầng giao hàng. Không có xe thì không có việc. Ở điểm đợi dưới gốc cây, anh em chuyền tay một chiếc mũ bảo hiểm để góp tiền.", [
    C("Góp tiền và chở cậu ấy đi làm lại giấy tờ", { money: -0.02, rel: 4, counters: { shp_crew: 1 }, flags: ["shp_brother"] }, "Mất một ngày công, có người nhớ ơn"),
    C("Góp một ít rồi đi chạy tiếp", { money: -0.01, rel: 1, counters: { shp_crew: 1 } }, "Vừa lòng mọi người, không ai nhớ"),
    C("Không góp, nhà cũng đang thiếu", { rel: -2 }, "Giữ tiền, mất chỗ đứng ở gốc cây")], 0)),
  daily(SH, "shp_rival", [18, 60], 8, (c, N) => { const r = role(c, "rival")!; return T("Người tranh khách quen", `${N(r)} cũng chạy giao hàng và vừa đứng chờ sẵn trước cửa hàng hoa quen của bạn, chào giá thấp hơn cho chủ tiệm.`, [
    C("Hạ giá theo", { money: -0.02, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "giành khách tiệm hoa" } }, "Giữ khách, mất lãi"),
    C("Đề nghị chia ngày: chẵn bạn, lẻ người ta", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia ngày giao hàng tiệm hoa" }, log: "Hai người chia ngày. Hôm bạn ốm, người kia chạy hộ." }, lose: { log: "Họ cười, rồi vẫn đứng trước cửa tiệm." } } }, "Bớt việc, có thể bớt thù", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(SH, "shp_quit", [25, 55], 99, () => T("Lời mời ngồi văn phòng kho", "Một kho hàng lớn cần người điều phối ca. Lương cố định, có bảo hiểm, ngồi dưới quạt. Nhưng phải đến đúng bảy giờ sáng, sáu ngày một tuần.", [
    C("Nhận, treo áo khoác giao hàng", { ...leave(SH), flags: ["ex_shipper"], health: 3 }, "Ổn định, mất con đường và tự do"),
    C("Ở lại với chiếc xe", { happy: 1, counters: { shp_stars: 1 } }, "Tự chủ giờ giấc, không ai lo cho bạn")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(SH, "shp_family", [22, 60], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "spouse"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Giao cơm đến trường con", `Một đơn giao cơm trưa đến đúng trường của ${N(k)}. Bạn thấy ${N(k)} đứng cùng nhóm bạn ở cổng. ${N(k)} nhìn thấy bạn, rồi quay mặt đi.`, [
      C("Gọi tên con, vẫy tay", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.2 }, log: `${N(k)} chạy ra, giới thiệu bạn với cả nhóm.` }, lose: { trust: { npc: k, delta: -0.2 }, log: `${N(k)} đỏ mặt, tối về không nói chuyện.` } } }, "Có thể gần lại, có thể làm con xấu hổ"),
      C("Lặng lẽ giao hàng rồi đi", { happy: -3 }, "Giữ thể diện cho con, lòng nặng"),
      C("Tối về kể cho con nghe một ngày chạy xe", { trust: { npc: k, delta: 0.25 }, bw: -2 }, "Mệt thêm, con hiểu bạn hơn", { tier: "awakened" })], 2, { npc: k });
    const s = role(c, "spouse");
    if (s) return T("Tin tai nạn trên điện thoại", `${N(s)} đọc được tin một shipper bị xe tải cuốn dưới mưa, đòi bạn mua bảo hiểm tai nạn, tiền đóng mỗi tháng bằng hai ngày chạy.`, [
      C("Mua bảo hiểm như vợ chồng đã bàn", { money: -0.04, trust: { npc: s, delta: 0.2 }, flags: ["shp_insured"] }, "Bớt tiền mỗi tháng, bớt lo cho nhà"),
      C("Hứa sẽ đi chậm, không mua", { promise: { to: s, what: "không chạy khi mưa bão", years: 3 } }, "Giữ tiền, giữ một lời hứa khó")], 0, { npc: s });
    const m = role(c, "mother")!;
    return T("Mẹ dặn mang áo mưa", `${N(m)} gấp sẵn một bộ áo mưa trong cốp xe bạn, và mỗi tối đều gọi hỏi: "Về chưa con?". Có hôm gọi lúc bạn đang chạy giữa đường.`, [
      C("Nghe máy dù đang chạy", { trust: { npc: m, delta: 0.2 }, health: -1 }, "Mẹ yên tâm, bạn liều hơn"),
      C("Nhắn trước giờ về mỗi tối", { trust: { npc: m, delta: 0.15 }, bw: -1, promise: { to: m, what: "nhắn tin mỗi tối khi về", years: 2 } }, "Một việc nhỏ phải nhớ mãi")], 1, { npc: m });
  }),
];

/* =====================================================================
 * TÀI XẾ XE CÔNG NGHỆ — tiền tố rhd_
 * ===================================================================== */
const RH = "ride_hailing";

const RHD_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(RH, "rhd_t_uncle", [11, 16], () => true, () => T("Ghế phụ của bác tài", "Hè này bác bạn chạy taxi, cho bạn ngồi ghế phụ những chuyến ban ngày. Bạn thuộc đường nhanh hơn bản đồ trên điện thoại, và biết khách nào muốn nói chuyện, khách nào muốn im lặng.", [
    C("Theo bác chạy xe cả mùa hè", { know: 1, rel: 2, flags: [talentFlag(RH)], counters: { talents_seen: 1 } }, "Mất mùa hè chơi bời, biết đọc đường và người"),
    C("Ở nhà ôn bài cho năm học mới", { know: 2, counters: { talents_seen: 1 } }, "Học chắc hơn, thành phố vẫn lạ")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RH, "rhd_d_carloan", [22, 50], () => true, () => T("Mua xe không cần trả trước", "Một đại lý ô tô hợp tác với ứng dụng gọi xe: không cần trả trước, mỗi tuần trừ thẳng vào tiền chạy, bốn năm là xe thành của bạn. Người bán nói cứ chạy mười tiếng một ngày là dư.", [
    C("Ký vay, chạy toàn thời gian", { counters: { doors_seen: 1 }, custom: `become:${RH}|borrow:0.8`, flags: ["rhd_car_loan"] }, "Có xe của mình, bốn năm làm cho khoản nợ"),
    C("Thuê xe theo tuần của một chủ đội xe", { ...become(RH), counters: { doors_seen: 1 }, income_mult: 0.85, flags: ["rhd_rented"] }, "Không nợ, mỗi tuần trả tiền thuê"),
    C("Thôi, đọc kỹ hợp đồng thấy sợ", { counters: { doors_seen: 1 } }, "Giữ an toàn, giữ việc cũ")], 0)),
  door(RH, "rhd_d_oldcar", [18, 40], () => true, () => T("Chiếc xe cũ trong sân", "Từ ngày bố nghỉ hưu, chiếc xe của nhà nằm phủ bạt trong sân. Bố bảo: \"Để đó cũng mục, con đem đi chạy khách thì chạy\". Chỉ cần đăng ký và một tờ giấy khám sức khỏe.", [
    C("Đăng ký chạy toàn thời gian", { ...become(RH), counters: { doors_seen: 1 }, rel: 2 }, "Có việc ngay, xe cũ hay hỏng"),
    C("Chạy cuối tuần cho biết", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(RH), log: "Ba tháng sau, tiền cuối tuần bằng lương cả tháng. Bạn chạy luôn." }, lose: { money: 0.02, log: "Chạy được vài tuần thì chán. Chiếc xe quay về dưới tấm bạt." } } }, "Ít rủi ro, ít cam kết"),
    C("Bán xe lấy tiền đi học thêm", { counters: { doors_seen: 1 }, money: 0.15, know: 2 }, "Có vốn học, mất một kế sinh nhai")], 0)),
  door(RH, "rhd_d_midlife", [38, 55], (c) => c.has_job || c.broke, () => T("Bốn mươi tuổi, bị cắt giảm", "Công ty tái cơ cấu, bạn nằm trong danh sách. Đi phỏng vấn ở đâu cũng nghe câu \"anh chị hơi quá tuổi\". Người hàng xóm cũng từng làm văn phòng, giờ chạy xe gọi qua ứng dụng, khoe tuần rồi được hai khách tip.", [
    C("Đăng ký chạy xe, coi như tạm thời", { ...become(RH), counters: { doors_seen: 1 }, happy: -2, agency: 0.01 }, "Có tiền ngay, nuốt tự ái"),
    C("Học nghề mới sáu tháng", { counters: { doors_seen: 1 }, money: -0.15, know: 4 }, "Tốn tiền dành dụm, có thể đổi đời"),
    C("Tiếp tục nộp đơn văn phòng", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { money: 0.1, log: "Một công ty nhỏ nhận bạn, lương bằng hai phần ba chỗ cũ." }, lose: { happy: -4, log: "Mười tám lá đơn, không một hồi âm." } } }, "Giữ nghề cũ, cược vào may")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(RH, 1, 1, (c) => T("Chuyến ra sân bay đầu tiên", "Khách lên xe lúc năm giờ sáng, chuyến bay cất cánh sau một giờ mười phút. Ứng dụng chỉ đường qua cầu đang tắc. Khách bảo: \"Anh chạy kiểu gì cũng được, miễn kịp\".", [
    C("Phóng nhanh, vượt đèn vàng", { counters: step(c, RH), gamble: { p: 0.6, win: { counters: { rhd_stars: 1 }, money: 0.02, log: "Khách kịp chuyến bay, để lại năm sao và tiền boa." }, lose: { money: -0.05, log: "Camera phạt nguội. Biên lai đến sau ba tuần, bằng tiền chạy năm ngày." } } }, "Có thể được năm sao, có thể bị phạt"),
    C("Đi đúng luật, đổi sang đường vòng", { counters: step(c, RH), flags: ["rhd_careful"], gamble: { p: 0.5, win: { log: "Đường vòng thông. Khách kịp, không nói gì." }, lose: { counters: { rhd_stars: -1 }, log: "Khách trễ chuyến, chấm một sao." } } }, "Bằng lái sạch, khách có thể giận"),
    C("Gọi trước cho hãng bay giúp khách", { counters: step(c, RH, { rhd_stars: 1 }), bw: -2, flags: ["rhd_careful"] }, "Thêm việc cho mình, khách có lối lui", { tier: "awakened" })], 0)),
  beat(RH, 2, 3, (c) => T("Hạng xe sang", `Ứng dụng mở hạng xe sang, giá mỗi chuyến gấp đôi, nhưng xe phải đời mới.${f(c, "rhd_car_loan") ? " Khoản trả góp chiếc xe đầu tiên mới đi được nửa đường." : ""} Cùng lúc, mấy khách quen hỏi xin số riêng để gọi thẳng, khỏi qua ứng dụng.`, [
    C("Vay đổi xe đời mới, chạy hạng sang", { counters: step(c, RH), custom: "borrow:0.6", income_mult: 1.35, flags: ["rhd_premium"] }, "Thu nhập cao, nợ chồng nợ"),
    C("Giữ xe cũ, chạy hạng thường", { counters: step(c, RH), happy: 1, flags: ["rhd_steady"] }, "Không thêm nợ, thu nhập đứng yên"),
    C("Lập nhóm tài xế nhận khách gọi thẳng", { counters: step(c, RH), income_mult: 1.15, agency: 0.02, rel: 3, flags: ["rhd_direct"] }, "Không mất phí ứng dụng, tự lo mọi rủi ro", { tier: "sovereign" })], 0)),
  beat(RH, 3, 4, (c) => T("Tài khoản bị treo", `Một hành khách tố bạn đi vòng để tính thêm tiền. Ứng dụng treo tài khoản mười bốn ngày để \"xác minh\".${f(c, "rhd_car_loan") || f(c, "rhd_premium") ? " Thứ hai tuần sau là hạn trả góp." : " Tiền nhà đến hạn cuối tháng."}${f(c, "rhd_dashcam") ? " Camera hành trình của bạn còn lưu cả chuyến đi." : ""}`, [
    C("Kháng nghị, nộp mọi bằng chứng", { counters: step(c, RH), bw: -5, gamble: { p: f(c, "rhd_dashcam") ? 0.85 : 0.4, win: { log: "Tài khoản được mở lại, kèm một lời xin lỗi tự động." }, lose: { income_mult: 0.8, money: -0.1, log: "Không đủ bằng chứng. Bạn bị hạ hạng, mất các chuyến ngon." } } }, "Đúng lý, chờ trong túng"),
    C("Chạy cho hãng taxi truyền thống trong lúc chờ", { counters: step(c, RH), income_mult: 0.9, flags: ["rhd_taxi_side"] }, "Có tiền ngay, mất phần trăm cho hãng"),
    ...(f(c, "rhd_direct") ? [C("Chạy hẳn cho khách quen của nhóm", { counters: step(c, RH), income_mult: 1.05, agency: 0.02, flags: ["rhd_off_app"] }, "Thoát ứng dụng, không ai bảo vệ bạn", { tier: "sovereign" as const })] : []),
    C("Bán xe trả nợ, nghỉ chạy", { counters: step(c, RH), ...leave(RH), money: 0.2, happy: -3 }, "Hết nợ hết lo, mất nghề")], 0)),
  beat(RH, 4, 5, (c) => {
    if (f(c, "rhd_direct") || f(c, "rhd_off_app")) return T("Đội xe mười hai người", "Nhóm khách gọi thẳng của bạn giờ có mười hai tài xế và vài trăm khách quen. Có người đề nghị lập công ty, đăng ký đàng hoàng, đóng thuế, mua bảo hiểm cho cả đội. Một ứng dụng lớn cũng ngỏ ý mua lại danh sách khách.", [
      C("Lập công ty, chia cổ phần cho cả đội", { counters: step(c, RH), money: -0.4, income_mult: 1.3, agency: 0.03, flags: ["rhd_coop_company"] }, "Vốn và trách nhiệm lớn, của chung", { tier: "sovereign" }),
      C("Bán danh sách khách cho ứng dụng lớn", { counters: step(c, RH), money: 1.2, rel: -6, flags: ["rhd_sold_list"] }, "Một khoản lớn, mất lòng cả đội"),
      C("Giữ nhóm nhỏ như cũ", { counters: step(c, RH), happy: 2 }, "Không to lên, không ai bị bỏ lại")], 0);
    if (f(c, "rhd_premium")) return T("Ông khách hạng sang", "Một ông chủ doanh nghiệp đi xe bạn ba năm nay đề nghị bạn làm tài xế riêng: lương tháng gấp rưỡi, nhưng gọi là phải có mặt, kể cả nửa đêm. Ông cũng nói sẵn lòng trả nốt khoản vay xe cho bạn.", [
      C("Nhận, làm tài xế riêng cho ông", { counters: step(c, RH), income_mult: 1.4, rel: -4, flags: ["rhd_private_driver"] }, "Lương cao, đời bạn theo lịch người khác"),
      C("Từ chối, giữ tự do", { counters: step(c, RH), happy: 2, flags: ["rhd_free_agent"] }, "Tự do, khoản nợ vẫn còn"),
      C("Đề nghị ông góp vốn thêm hai xe, bạn quản lý", { counters: step(c, RH), gamble: { p: 0.45, win: { income_mult: 1.5, flags: ["rhd_fleet"], log: "Ông đồng ý. Bạn có đội xe nhỏ, ông có phần lời." }, lose: { happy: -2, log: "Ông cười, bảo bạn chỉ nên lái xe thôi." } } }, "Thành chủ nhỏ, hoặc mất lòng khách sộp", { tier: "awakened" })], 0);
    return T("Xe không người lái về thành phố", "Một hãng thử xe tự lái ở ba quận trung tâm, giá chỉ bằng hai phần ba giá của bạn. Chuyến dài ra sân bay vơi hẳn. Cùng lúc, hãng ấy tuyển người ngồi giám sát đội xe từ xa.", [
      C("Ứng tuyển làm giám sát đội xe tự lái", { counters: step(c, RH), know: 3, gamble: { p: 0.4, win: { income_mult: 1.2, flags: ["rhd_robot_monitor"], log: "Bạn ngồi trước sáu màn hình, mỗi màn hình một chiếc xe không có ai." }, lose: { happy: -3, log: "Họ cần người dưới ba mươi lăm, biết lập trình." } } }, "Học cái mới, có thể bị loại"),
      C("Chuyển sang chạy xe đường dài liên tỉnh", { counters: step(c, RH), ...leave(RH), custom: "job_lose|become:long_hauler", health: -2 }, "Xa nhà, việc chưa bị máy lấy"),
      C("Chạy vùng ven, nơi xe tự lái chưa tới", { counters: step(c, RH), income_mult: 0.8, flags: ["rhd_outskirts"] }, "Ít khách hơn, vẫn là nghề của mình")], 0);
  }),
  beat(RH, 5, 6, (c) => T("Hành khách nhận ra bạn", f(c, "rhd_baby_ride")
    ? "Một cặp vợ chồng lên xe cùng đứa con gái mười tuổi. Người mẹ nhìn gáy bạn rất lâu rồi hỏi: \"Có phải anh chị chở tôi đi đẻ năm ấy không?\". Đứa bé là đứa bé ấy."
    : `Một bác sĩ trẻ lên xe, nhìn bạn rồi cười: ngày xưa cậu ấy là cậu học sinh bạn chở đi ôn thi mỗi sáng, có hôm không lấy tiền.${n(c, "rhd_stars") >= 2 ? " Cậu ấy còn nhớ cả tên bạn trên ứng dụng." : ""}`, [
    C("Không lấy tiền chuyến này", { counters: step(c, RH), happy: 6, rel: 3, flags: ["passed_on"] }, "Mất một cuốc, được một ngày đẹp"),
    C("Lấy tiền như mọi chuyến, kể chuyện cả đường", { counters: step(c, RH), happy: 3, money: 0.01 }, "Nghề là nghề, chuyện là chuyện"),
    C("Hỏi xin lời giới thiệu cho con mình", { counters: step(c, RH), gamble: { p: 0.5, win: { flags: ["rhd_network"], log: "Họ để lại số điện thoại, rồi gọi thật." }, lose: { happy: -1, log: "Họ gật đầu lịch sự, rồi thôi." } } }, "Dùng ân tình cũ, có thể thành ngượng", { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(RH, "rhd_drunk", [18, 65], 6, (c) => T("Khách say lúc hai giờ sáng", vary("rhdd", c.age, ["Ba thanh niên say lảo đảo vẫy xe trước quán nhậu, một người đã xanh mặt.", "Một người đàn ông mặc vest say đến mức không nói được địa chỉ nhà mình."]), [
    C("Chở, chuẩn bị sẵn túi nilon", { money: 0.01, gamble: { p: 0.6, win: { counters: { rhd_stars: 1 }, log: "Họ về nhà an toàn, sáng hôm sau còn nhắn cảm ơn." }, lose: { money: -0.03, log: "Ghế sau phải đi giặt. Ứng dụng không bồi thường." } } }, "Có tiền cuốc, có thể mất tiền giặt"),
    C("Từ chối cuốc", { counters: { rhd_stars: -1 } }, "Xe sạch, điểm nhận chuyến tụt"),
    C("Gọi người nhà họ ra đón, chờ cùng", { bw: -2, rel: 2, counters: { kind: 1 } }, "Mất một giờ, không ai gặp chuyện", { tier: "awakened" })], 0)),
  daily(RH, "rhd_surge", [18, 65], 8, () => T("Giá tăng gấp ba", "Buổi hòa nhạc vừa tan, giá trên ứng dụng tự nhảy gấp ba. Một bà cụ ở cổng hỏi bạn có chở về cách đây năm cây số không, bà chỉ mang đủ tiền giá thường.", [
    C("Nhận cuốc giá cao của khách khác", { money: 0.03 }, "Tiền tối nay gấp ba, bà cụ đứng đó"),
    C("Tắt ứng dụng, chở bà giá thường", { money: 0.005, happy: 4, counters: { kind: 1 }, flags: ["rhd_off_app_once"] }, "Mất tiền đêm, ngủ ngon")], 1)),
  daily(RH, "rhd_dashcam", [18, 65], 9, () => T("Camera hành trình", "Một tài xế quen bị khách vu cáo, mất tài khoản vì không có bằng chứng. Anh ấy khuyên bạn lắp camera trước và sau, giá bằng một tuần chạy.", [
    C("Lắp camera ngay", { money: -0.03, flags: ["rhd_dashcam"] }, "Mất một tuần tiền, có bằng chứng sau này"),
    C("Để tháng sau tính", { money: 0.01 }, "Giữ tiền, gặp chuyện thì chịu")], 0)),
  daily(RH, "rhd_tip", [20, 65], 8, (c) => T("Lời khuyên của hành khách", vary("rhdt", c.age, ["Một khách mặc áo sơ mi đắt tiền nói nhỏ: \"Mua cổ phiếu này đi, tuần sau lên gấp đôi\".", "Một khách khoe đang góp vốn vào một dự án đất, lãi mỗi tháng năm phần trăm, còn suất cho bạn."]), [
    C("Bỏ tiền dành dụm vào thử", { gamble: { p: 0.3, win: { money: 0.3, log: "Lần này khách nói đúng. Bạn không kể với ai." }, lose: { money: -0.25, flags: ["rhd_burned"], log: "Ba tháng sau, số điện thoại ấy không còn liên lạc được." } } }, "Có thể đổi đời, có thể mất trắng"),
    C("Cảm ơn rồi quên đi", { counters: { save: 1 } }, "Không mất gì, không được gì")], 1)),
  daily(RH, "rhd_wallet", [18, 65], 8, () => T("Phong bì ở ghế sau", "Cuối ca, bạn thấy một phong bì dày dưới ghế sau, trong có tiền mặt bằng ba tháng chạy xe và một tờ giấy hẹn khám bệnh viện.", [
    C("Mang lên văn phòng ứng dụng trả lại", { counters: { honest: 1 }, gamble: { p: 0.6, win: { happy: 5, flags: ["rhd_returned_cash"], log: "Người mất là một bà mẹ đi gom tiền mổ cho con. Bà khóc ngay ở quầy." }, lose: { log: "Họ ký nhận, không ai báo lại cho bạn." } } }, "Không được gì chắc chắn, lòng sạch"),
    C("Giữ lại, coi như trời cho", { money: 0.25, happy: -3, counters: { honest: -1 } }, "Có tiền, mang theo tờ giấy hẹn ấy")], 0)),
  daily(RH, "rhd_back", [25, 65], 7, (c) => T("Cái lưng mười một tiếng", vary("rhdb", c.age, ["Ngồi mười một tiếng mỗi ngày, lưng bạn bắt đầu đau lan xuống chân.", "Bác sĩ chỉ vào phim chụp: đĩa đệm thoát vị nhẹ, nên đứng dậy mỗi giờ."]), [
    C("Mỗi giờ dừng xe đi bộ năm phút", { money: -0.02, health: 3, counters: { exercise: 1 } }, "Ít cuốc hơn, lưng đỡ hơn"),
    C("Uống thuốc giảm đau, chạy tiếp", { money: 0.02, health: -3 }, "Giữ thu nhập, đau ở lại")], 0)),
  daily(RH, "rhd_rating", [18, 65], 8, () => T("Bốn phẩy bảy chín", "Điểm của bạn tụt xuống bốn phẩy bảy chín. Dưới bốn phẩy bảy là ứng dụng khóa. Bạn không biết ai đã chấm thấp, vì sao.", [
    C("Mua nước suối và kẹo mời khách", { money: -0.02, counters: { rhd_stars: 1 } }, "Tốn tiền, điểm nhích lên"),
    C("Kệ, chạy như cũ", { gamble: { p: 0.6, win: { log: "Tháng sau điểm tự nhích lên." }, lose: { counters: { rhd_stars: -1 }, bw: -3, log: "Điểm tụt tiếp. Bạn bắt đầu cười gượng với mọi khách." } } }, "Không đổi mình, có thể bị khóa"),
    C("Lập nhóm tài xế góp ý luật chấm điểm", { agency: 0.01, bw: -2, flags: ["rhd_petition"] }, "Mất thời gian, có thể đổi luật cho nhiều người", { tier: "sovereign" })], 0)),
  daily(RH, "rhd_fuel", [18, 65], 8, (c) => T("Giá xăng lên ba mươi phần trăm", `Giá xăng lên ba lần trong hai tháng, giá cuốc xe vẫn giữ nguyên.${c.econ_phase === "crisis" ? " Khách cũng ít đi vì ai cũng thắt lưng." : ""}`, [
    C("Vay đổi sang xe điện", { custom: "borrow:0.4", flags: ["rhd_ev"], income_mult: 1.05 }, "Đỡ tiền xăng, thêm một khoản nợ"),
    C("Chạy ít giờ hơn, chỉ chạy giờ cao điểm", { income_mult: 0.9, happy: 1 }, "Ít lỗ hơn, ít tiền hơn"),
    C("Chạy nhiều hơn để bù", { money: 0.02, health: -3, counters: { rhd_stars: 1 } }, "Đủ tiền, mệt hơn")], 1)),
  daily(RH, "rhd_labor", [20, 50], 99, () => T("Chuyển dạ ở ghế sau", "Nửa đêm, một người đàn ông vẫy xe, vợ anh đang chuyển dạ. Xe cấp cứu báo bốn mươi phút nữa mới tới. Bệnh viện gần nhất cách mười hai phút.", [
    C("Chở thẳng đến bệnh viện", { money: -0.02, happy: 6, flags: ["rhd_baby_ride"] }, "Có thể bẩn xe, có thể kịp một mạng người"),
    C("Gọi cấp cứu, đứng chờ cùng họ", { bw: -2, happy: 1 }, "Đúng quy trình, chậm hơn")], 0)),
  daily(RH, "rhd_rival", [18, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Hàng chờ ở sân bay", `${N(r)} cũng chạy xe và vừa chen lên trước bạn ở hàng chờ sân bay, sau khi bạn đã đợi bốn mươi phút.`, [
    C("Xuống xe cãi tay đôi", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "cãi nhau ở hàng chờ sân bay" }, happy: -1 }, "Lấy lại chỗ, mất một kẻ thù hòa bình"),
    C("Đề nghị cả bãi lập sổ chờ chung", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.25, note: "lập sổ chờ chung ở sân bay" }, flags: ["leader"], log: "Bãi xe dùng cuốn sổ của bạn. Người kia cũng ký tên." }, lose: { log: "Không ai buồn ghi tên vào sổ." } } }, "Mất công, có thể yên cả bãi", { tier: "sovereign" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RH, "rhd_quit", [25, 60], 99, () => T("Lời mời lái xe cho trường học", "Một trường quốc tế tuyển tài xế đưa đón học sinh: lương cố định, có bảo hiểm, nghỉ hè, nhưng không được chạy thêm ngoài giờ.", [
    C("Nhận, tắt ứng dụng gọi xe", { ...leave(RH), flags: ["ex_rideshare"], happy: 2 }, "Ổn định, mất tự do và tiền boa"),
    C("Ở lại với ứng dụng", { counters: { rhd_stars: 1 } }, "Tự do giờ giấc, không ai lo cho bạn")], 0), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(RH, "rhd_family", [22, 65], (c) => ((c.parent_sick && (!!role(c, "mother") || !!role(c, "father"))) || !!role(c, "spouse")), (c, N) => {
    const p = role(c, "mother") ?? role(c, "father");
    if (c.parent_sick && p) return T("Chuyến xe không tính tiền", `${N(p)} phải chạy thận ba buổi một tuần, đúng vào giờ cao điểm buổi sáng. Thuê xe khác thì tốn, tự chở thì mất những cuốc ngon nhất trong ngày.`, [
      C("Tự chở, mất giờ cao điểm", { money: -0.06, trust: { npc: p, delta: 0.3 }, memory: { npc: p, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "con chở đi chạy thận mỗi tuần" } }, "Mất tiền, được những buổi sáng bên nhau"),
      C("Đặt xe khác cho bố mẹ", { money: -0.03, trust: { npc: p, delta: -0.05 } }, "Giữ thu nhập, bố mẹ đi với người lạ"),
      C("Xếp lịch chạy quanh giờ chạy thận", { money: -0.02, bw: -3, trust: { npc: p, delta: 0.2 } }, "Tính toán mệt hơn, mất ít hơn", { tier: "awakened" })], 0, { npc: p });
    const s = role(c, "spouse")!;
    return T("Bữa tối lúc nửa đêm", `${N(s)} để phần cơm trong lồng bàn suốt ba năm nay. Hôm nay là kỷ niệm ngày cưới, ứng dụng đang bật thưởng cuối tuần.`, [
      C("Tắt máy sớm, đưa nhau đi ăn", { money: -0.02, trust: { npc: s, delta: 0.2 }, happy: 3 }, "Mất tiền thưởng, có một buổi tối"),
      C("Chạy nốt, hứa bù dịp khác", { money: 0.02, promise: { to: s, what: "nghỉ trọn một ngày để đi chơi cùng nhau", years: 1 } }, "Có tiền, nợ một lời hứa"),
      C("Rủ ngồi ghế phụ chạy cùng một tối", { trust: { npc: s, delta: 0.15 }, rel: 2, gamble: { p: 0.6, win: { log: "Hai người cười suốt đêm vì những vị khách lạ." }, lose: { log: "Một khách say làm cả hai mất hứng." } } }, "Lạ mà vui, có thể hỏng", { tier: "awakened" })], 0, { npc: s });
  }),
];

/* =====================================================================
 * NGƯỜI BÁN HÀNG RONG — tiền tố hrg_
 * ===================================================================== */
const HV = "street_vendor";
/** Món hàng rong: rẽ theo nước, để chi tiết Việt Nam chỉ hiện ở Việt Nam. */
const dish = (c: FactContext): string => (vn(c) ? "xôi" : c.poor_country ? "bánh rán" : "bánh mì kẹp");

const HRG_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(HV, "hrg_t_call", [9, 14], () => true, (c) => T("Tiếng rao của bà", `Bà bạn bán ${dish(c)} ở đầu chợ từ năm giờ sáng. Hôm bà đau lưng, bạn ra bán thay trước giờ học. Bạn nhớ tên từng người mua, ai ít hành, ai không cay. Gánh hàng hết trước bảy giờ.`, [
    C("Xin ra bán cùng bà mỗi sáng", { rel: 2, know: -1, health: -1, flags: [talentFlag(HV)], counters: { talents_seen: 1 } }, "Dậy sớm, mệt, học được cách giữ khách"),
    C("Ngủ đủ giấc, để bà tự lo", { health: 1, counters: { talents_seen: 1 } }, "Khỏe người, gánh hàng là chuyện của bà")], 0)),
  talent(HV, "hrg_t_change", [10, 15], () => true, () => T("Thối tiền nhanh hơn máy tính", "Ở cổng trường, bạn bán kẹo bông giúp chú hàng xóm giờ tan học. Ba mươi đứa trẻ chìa tiền cùng lúc, bạn thối đúng từng đồng, không cần ghi. Chú bảo cháu mà bán hàng thì không ai lừa được.", [
    C("Phụ chú bán mỗi chiều", { money: 0.01, know: -1, flags: [talentFlag(HV)], counters: { talents_seen: 1 } }, "Có tiền tiêu vặt, bớt giờ chơi"),
    C("Ham chơi đá bóng hơn", { rel: 2, counters: { talents_seen: 1 } }, "Vui với bạn bè, năng khiếu ngủ yên")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(HV, "hrg_d_corner", [18, 60], () => true, (c) => T("Góc phố của bà cụ", `Bà cụ bán ${dish(c)} ở góc phố ba mươi năm nay về quê ở với con. Bà muốn sang lại chiếc xe đẩy, nồi niêu, và quan trọng nhất là cái góc: người ta quen tìm đến đó mỗi sáng.`, [
    C("Bỏ tiền dành dụm, nhận lại góc phố", { ...become(HV), counters: { doors_seen: 1 }, money: -0.1, agency: 0.01 }, "Có khách sẵn, cược hết vốn"),
    C("Xin bà cho bán thử một tháng rồi trả", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(HV), log: "Hết tháng, khách cũ đã gọi bạn là \"cháu bà\". Bạn trả đủ tiền." }, lose: { log: "Bà đã sang cho người khác trả tiền ngay." } } }, "Ít rủi ro, có thể mất góc"),
    C("Thôi, đứng bếp nắng mưa không nổi", { counters: { doors_seen: 1 }, health: 1 }, "Giữ sức, giữ việc cũ")], 0)),
  door(HV, "hrg_d_arrival", [18, 45], (c) => c.migrated || c.poor_country || c.broke, (c) => T("Thúng hàng của chị phòng bên", `Bạn ${c.migrated ? "mới đến nơi đất khách" : "mới lên thành phố"}, chưa ai nhận vào làm. Chị phòng trọ bên cạnh đi bán trái cây cắt sẵn, bảo: "Mai đi lấy hàng với chị, chị chỉ chỗ đứng".`, [
    C("Theo chị đi lấy hàng từ ba giờ sáng", { ...become(HV), counters: { doors_seen: 1 }, health: -2, rel: 3 }, "Có việc ngay, đời bắt đầu từ ba giờ sáng"),
    C("Chờ xin vào xưởng may", { counters: { doors_seen: 1 }, money: -0.04, gamble: { p: 0.4, win: { log: "Hai tuần sau xưởng nhận. Bạn vẫn hay mua trái cây của chị." }, lose: { happy: -3, log: "Xưởng không tuyển nữa. Tiền trọ đến hạn." } } }, "Việc có lương, phải chờ")], 0)),
  door(HV, "hrg_d_recipe", [25, 60], (c) => c.broke || c.has_job || c.married, () => T("Nồi chè của mẹ", "Thu nhập trong nhà không đủ. Bạn còn nhớ công thức nồi chè mẹ nấu ngày xưa, cả xóm khen. Một người bạn bảo: \"Nấu đi, đẩy ra cổng bệnh viện bán buổi chiều\".", [
    C("Nấu một nồi, đẩy ra cổng bệnh viện", { ...become(HV), counters: { doors_seen: 1 }, money: -0.03, happy: 2 }, "Vốn nhỏ, việc nặng, món của nhà"),
    C("Chỉ nấu bán cho người quen đặt trước", { counters: { doors_seen: 1 }, money: 0.02 }, "Ít việc, ít tiền, không ra đường")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(HV, 1, 1, (c) => {
    return T("Góc phố có chủ", "Sáng đầu tiên, bạn vừa dựng xe thì bà bán nước bên cạnh sang nói thẳng: góc này mười năm nay của nhà bà. Không có giấy tờ nào, chỉ có mười năm và một cái ghế nhựa đỏ.", [
      C("Dời sang góc vắng bên kia đường", { counters: step(c, HV), income_mult: 0.85, happy: -1 }, "Yên chuyện, ít khách"),
      C("Đứng lại, ai đến trước bán trước", { counters: step(c, HV), gamble: { p: 0.5, win: { log: "Bà bỏ đi chỗ khác. Bạn có góc, có cả ánh mắt của cả dãy." }, lose: { money: -0.03, rel: -3, log: "Sáng hôm sau, xe bạn bị xì lốp." } } }, "Có thể giữ góc, chắc chắn có thù"),
      C("Đề nghị chung góc: bà bán nước, bạn bán đồ ăn", { counters: step(c, HV, { hrg_regulars: 1 }), rel: 3, agency: 0.02, flags: ["hrg_shared_corner"] }, "Chia khách, có đồng minh", { tier: "sovereign" })], 0);
  }, A18),
  beat(HV, 2, 3, (c) => T("Lên mạng sau một đêm", `Một người làm video ẩm thực quay món ${dish(c)} của bạn. Sáng hôm sau, hàng người xếp dài đến cuối phố, toàn mặt lạ. Khách quen đứng ngoài rìa, không chen vào được.`, [
    C("Tăng giá gấp đôi khi còn nổi", { counters: step(c, HV, { hrg_regulars: -2 }), income_mult: 1.4, flags: ["hrg_price_up"] }, "Lời nhanh, mất khách quen"),
    C("Giữ giá, dậy sớm hơn hai tiếng", { counters: step(c, HV, { hrg_regulars: 2 }), income_mult: 1.15, health: -4 }, "Giữ khách quen, mất ngủ"),
    C("Vay thuê một quầy cố định", { counters: step(c, HV), custom: "borrow:0.4", gamble: { p: 0.55, win: { income_mult: 1.5, flags: ["hrg_kiosk"], log: "Quầy mới đông như xe đẩy cũ. Bạn có mái che, có số nhà." }, lose: { income_mult: 0.9, flags: ["hrg_kiosk"], log: "Cơn sốt qua sau hai tháng. Tiền thuê quầy thì không qua." } } }, "Có chỗ đứng hợp pháp, gánh nợ thuê")], 1), A18),
  beat(HV, 3, 4, (c) => T(f(c, "hrg_kiosk") ? "Giá thuê quầy tăng gấp ba" : "Đợt dẹp vỉa hè", f(c, "hrg_kiosk")
    ? "Chủ nhà báo hết hợp đồng sẽ tăng giá thuê quầy gấp ba, vì khu này giờ đã \"lên\". Một chuỗi cửa hàng tiện lợi đang chờ lấy chỗ."
    : `${vn(c) ? "Phường ra quân lập lại trật tự vỉa hè." : "Thành phố mở đợt dọn dẹp người bán rong ở khu trung tâm."} Chiếc xe đẩy của bạn bị thu, kèm biên bản phạt bằng một tháng bán. Muốn lấy lại xe phải nộp phạt trong mười ngày.`, [
    C(f(c, "hrg_kiosk") ? "Chấp nhận giá mới, làm thêm giờ" : "Nộp phạt, chuộc xe về", { counters: step(c, HV), money: -0.15, health: -2 }, "Giữ chỗ bán, mất tiền dành dụm"),
    C(f(c, "hrg_kiosk") ? "Trả quầy, quay lại đẩy xe" : "Mua xe mới, bán né giờ kiểm tra", { counters: step(c, HV), money: -0.05, bw: -4, flags: ["hrg_cat_mouse"] }, "Ít tốn hơn, sống trong nơm nớp"),
    C("Cùng cả dãy viết đơn xin khu bán có giờ", { counters: step(c, HV), bw: -4, agency: 0.03, gamble: { p: 0.4 + Math.min(0.3, n(c, "hrg_regulars") * 0.1), win: { flags: ["hrg_market_zone"], rel: 5, log: "Sau ba tháng, thành phố kẻ vạch cho một khu bán buổi tối. Tên bạn đứng đầu lá đơn." }, lose: { money: -0.05, log: "Lá đơn nằm ở đâu đó trong một ngăn kéo. Cả dãy vẫn chạy mỗi lần có xe tới." } } }, "Mất công, có thể đổi luật cho cả dãy", { tier: "sovereign" }),
    C("Gác gánh, đi làm thuê", { counters: step(c, HV), ...leave(HV), happy: -3 }, "Hết nơm nớp, mất cái nghề tự chủ")], 0), A18),
  beat(HV, 4, 5, (c) => {
    if (f(c, "hrg_market_zone")) return T("Chợ đêm mang tên mình", "Khu bán buổi tối giờ có sáu mươi gian hàng. Người ta gọi là chợ của bạn. Ban quản lý muốn bạn làm trưởng chợ, có phụ cấp, và một công ty muốn thuê lại cả khu để làm phố ẩm thực có vé vào cổng.", [
      C("Làm trưởng chợ, giữ luật chia gian công bằng", { counters: step(c, HV), income_mult: 1.2, agency: 0.03, flags: ["leader", "hrg_market_head"] }, "Có tiếng nói, có trăm việc lo", { tier: "sovereign" }),
      C("Ủng hộ công ty thuê, lấy suất gian đẹp nhất", { counters: step(c, HV), income_mult: 1.5, rel: -6, flags: ["hrg_sold_market"] }, "Bạn lời, nhiều người mất chỗ"),
      C("Chỉ bán hàng, không dính vào việc chung", { counters: step(c, HV), happy: 2 }, "Nhẹ đầu, người khác quyết thay")], 0);
    if (f(c, "hrg_cat_mouse")) return T("Lần bị thu xe thứ ba", `Lần thứ ba trong năm, chiếc xe đẩy bị thu.${n(c, "hrg_regulars") >= 2 ? " Mấy khách quen góp tiền đặt trước cả tháng để bạn có vốn làm lại." : " Không ai đứng ra nói giúp bạn câu nào."}`, [
      C("Làm lại từ đầu ở khu khác", { counters: step(c, HV), money: -0.1, income_mult: 0.85 }, "Còn nghề, mất khách cũ"),
      C("Chuyển sang bán hàng qua điện thoại cho khách quen", { counters: step(c, HV), income_mult: n(c, "hrg_regulars") >= 2 ? 1.1 : 0.8, agency: 0.02, flags: ["hrg_preorder"] }, "Không cần vỉa hè, cần người tin bạn", { tier: "awakened" }),
      C("Bỏ nghề, đi phụ bếp nhà hàng", { counters: step(c, HV), ...leave(HV), money: 0.04 }, "Lương đều, nấu món của người khác")], 0);
    return T("Người mua công thức", `Một công ty thực phẩm muốn mua công thức món ${dish(c)} của bạn để làm hàng đóng gói, trả một khoản bằng năm năm bán hàng, kèm điều kiện bạn thôi bán món ấy.`, [
      C("Bán công thức, nghỉ ngơi", { counters: step(c, HV), money: 2, ...leave(HV), happy: -2, flags: ["hrg_sold_recipe"] }, "Một khoản đổi đời, mất cái nghề"),
      C("Không bán, giữ món của nhà", { counters: step(c, HV), happy: 3, flags: ["hrg_kept_recipe"] }, "Giữ món ăn, giữ cái nghèo quen thuộc"),
      C("Đòi tên mình trên bao bì và phần trăm mỗi gói", { counters: step(c, HV), gamble: { p: 0.4, win: { money: 0.8, income_mult: 1.3, flags: ["hrg_royalty"], log: "Họ đồng ý. Mặt bạn in trên bao bì, bạn vẫn đẩy xe mỗi sáng." }, lose: { log: "Họ tìm một người khác chịu bán đứt." } } }, "Giữ cả hai, có thể mất cả hai", { tier: "sovereign" })], 1);
  }, A18),
  beat(HV, 5, 6, (c, N) => {
    const k = role(c, "child");
    return T("Ai giữ lửa bếp", `Tay bạn bắt đầu run khi bê nồi. ${f(c, "hrg_apprentice") ? "Đứa trẻ bạn cho ăn năm nào giờ đứng bếp thạo hơn bạn." : k ? `${N(k)} đã có việc văn phòng, thỉnh thoảng về phụ cuối tuần.` : "Không có ai trong nhà muốn nối nghề."}${f(c, "hrg_sold_market") ? " Gian hàng đẹp nhất phố ẩm thực vẫn mang tên bạn." : ""} Khách quen hỏi: \"Sau này ai bán món này?\".`, [
      C("Truyền hết cho người học việc", { counters: step(c, HV), happy: 4, rel: 3, flags: ["passed_on"] }, "Món ăn còn sống, không còn là của bạn"),
      C("Viết công thức thành sổ, ai muốn thì học", { counters: step(c, HV), know: 2, agency: 0.02, flags: ["hrg_open_recipe"] }, "Không giữ bí quyết, ai cũng được", { tier: "sovereign" }),
      C("Bán đến khi nào không bán nổi nữa", { counters: step(c, HV), health: -3, money: 0.05 }, "Còn góc phố, còn mình")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(HV, "hrg_rain", [18, 70], 6, (c) => T("Cơn mưa lúc mười giờ", vary("hrgr", c.age, ["Mưa đổ lúc mười giờ, nồi hàng còn quá nửa. Mai không bán lại được.", "Trời mưa dầm ba ngày liền, hàng ế đến chiều."]), [
    C("Mang biếu đội thợ xây công trình bên cạnh", { rel: 3, counters: { hrg_regulars: 1, kind: 1 } }, "Mất vốn hôm nay, có khách ngày mai"),
    C("Bán nửa giá cho ai đi qua", { money: 0.005 }, "Gỡ được ít vốn"),
    C("Đem về nhà ăn dần", { happy: -1, money: -0.01 }, "Không mất mặt, cả nhà ăn một món ba ngày")], 0)),
  daily(HV, "hrg_tab", [18, 70], 7, () => T("Cuốn sổ ghi nợ", "Một anh phụ hồ ăn chịu đã ba tuần, hứa cuối tháng lĩnh lương sẽ trả. Hôm nay anh lại đến, cúi đầu xin thêm một suất.", [
    C("Cho ăn, ghi thêm vào sổ", { money: -0.01, counters: { hrg_regulars: 1, kind: 1 }, gamble: { p: 0.6, win: { log: "Cuối tháng anh trả đủ, còn dắt theo ba người bạn." }, lose: { money: -0.01, log: "Công trình xong, anh đi mất. Trang sổ ấy bạn không xé." } } }, "Có thể mất tiền, có thể được khách"),
    C("Từ chối, nói trả hết nợ đã", { counters: { hrg_regulars: -1 } }, "Giữ vốn, mất một người"),
    C("Đổi luật: ai cũng được nợ tối đa ba bữa", { flags: ["hrg_tab_rule"], agency: 0.01, money: -0.01 }, "Có luật rõ, bớt khó xử", { tier: "awakened" })], 0)),
  daily(HV, "hrg_fakebill", [18, 70], 8, () => T("Tờ tiền giả trong túi", "Tối đếm tiền, bạn thấy một tờ tiền mệnh giá lớn nhất là tiền giả, bằng nửa ngày bán. Ai đưa, bạn không nhớ nổi.", [
    C("Xé đi, chịu mất", { money: -0.01, counters: { honest: 1 } }, "Mất nửa ngày công, tay sạch"),
    C("Trả lại cho khách nào đó lúc vội", { money: 0.005, counters: { honest: -1 }, happy: -1 }, "Không mất tiền, đẩy cái mất cho người khác")], 0)),
  daily(HV, "hrg_protection", [18, 70], 9, (c, N) => { const b = role(c, "bully"); return T("Tiền đứng đường", `${b ? `${N(b)}, kẻ hay bắt nạt bạn ngày xưa, giờ` : "Một nhóm thanh niên xăm trổ"} đi thu \"phí đứng đường\" của cả dãy hàng rong mỗi tuần, bằng tiền một ngày bán.`, [
    C("Nộp cho yên", { money: -0.04, flags: ["hrg_pays_fee"] }, "Yên ổn, mất một phần bảy thu nhập"),
    C("Không nộp", { gamble: { p: 0.4, win: { log: "Họ dọa vài lần rồi thôi, chuyển sang dãy khác." }, lose: { money: -0.05, health: -3, log: "Nồi hàng bị hất đổ giữa phố." } } }, "Giữ tiền, có thể mất hàng"),
    C("Cùng cả dãy ký đơn trình báo", { agency: 0.02, bw: -3, ...(b ? { memory: { npc: b, tag: "HUMILIATED_ME", weight: -0.2, note: "bị cả dãy hàng rong trình báo chuyện thu tiền" } } : {}), gamble: { p: 0.5, win: { flags: ["leader"], log: "Công an khu vực lập biên bản. Từ đó không ai đến thu nữa." }, lose: { money: -0.03, log: "Đơn bị bỏ đó. Tuần sau họ đến thu gấp đôi." } } }, "Có thể dẹp được, có thể bị trả đũa", { tier: "sovereign" })], 0, b ? { npc: b } : {}); }),
  daily(HV, "hrg_graduate", [20, 70], 99, () => T("Cô sinh viên năm tư", "Một cô sinh viên ăn sáng ở xe bạn suốt bốn năm, hôm nay đưa tấm thiệp mời dự lễ tốt nghiệp. Lễ vào đúng buổi sáng đông khách nhất tuần.", [
    C("Nghỉ bán một buổi, đi dự lễ", { money: -0.01, happy: 6, counters: { hrg_regulars: 1 }, flags: ["hrg_went_graduation"] }, "Mất một buổi bán, có một tấm ảnh"),
    C("Gửi tặng một hộp đồ ăn, vẫn đi bán", { money: 0.005, happy: 1, counters: { hrg_regulars: 1 } }, "Đủ tình, đủ tiền, thiếu một buổi")], 0)),
  daily(HV, "hrg_legs", [25, 70], 7, (c) => T("Mười tiếng đứng bếp", vary("hrgl", c.age, ["Chân bạn nổi gân xanh sau mười năm đứng bếp, tối về phải gác lên tường.", "Khói than làm bạn ho cả mùa khô. Bác sĩ dặn đổi sang bếp điện."]), [
    C("Mua ghế cao và bếp mới", { money: -0.04, health: 4 }, "Tốn tiền, đỡ được tấm thân"),
    C("Chịu đựng thêm vài năm nữa", { health: -4, money: 0.01, counters: { hrg_tough: 1 } }, "Giữ vốn, cơ thể trả lãi")], 0)),
  daily(HV, "hrg_supplier", [18, 70], 8, () => T("Mối hàng giá rẻ", "Một mối hàng sỉ chào nguyên liệu rẻ hơn ba mươi phần trăm, không có giấy tờ nguồn gốc, đóng trong bao không nhãn.", [
    C("Lấy hàng rẻ", { money: 0.03, gamble: { p: 0.75, win: { log: "Chưa ai kêu gì. Lãi tháng này khá hơn." }, lose: { counters: { hrg_regulars: -2 }, money: -0.05, log: "Mấy khách bị đau bụng. Cả khu đồn ầm lên." } } }, "Lãi cao hơn, có thể mất cả khách"),
    C("Giữ mối hàng cũ, đắt mà rõ ràng", { counters: { hrg_regulars: 1 } }, "Lãi mỏng, ngủ yên")], 1)),
  daily(HV, "hrg_qr", [18, 70], 8, () => T("Mã thanh toán dán trên xe", "Khách trẻ không còn mang tiền mặt. Ai cũng hỏi có chuyển khoản qua điện thoại không. Có tài khoản thì mọi đồng thu vào đều có dấu vết.", [
    C("Mở tài khoản, dán mã lên xe", { income_mult: 1.08, bw: -2, flags: ["hrg_digital"] }, "Thêm khách trẻ, mọi khoản đều hiện ra"),
    C("Chỉ nhận tiền mặt", { counters: { hrg_regulars: -1 } }, "Không phiền phức, mất khách trẻ")], 0)),
  daily(HV, "hrg_stray", [20, 70], 99, () => T("Đứa trẻ đứng nhìn nồi hàng", "Một đứa nhỏ chừng mười bốn tuổi, quần áo bẩn, đứng nhìn nồi hàng của bạn mấy sáng liền mà không mua. Hỏi thì nó bảo bỏ nhà đi đã hai tuần.", [
    C("Cho ăn, rồi đưa đến trung tâm bảo trợ", { money: -0.01, counters: { kind: 1 }, happy: 2 }, "Đúng việc, không biết nó sẽ ra sao"),
    C("Cho ăn, nhận phụ việc, gọi báo gia đình nó", { money: -0.02, bw: -3, flags: ["hrg_apprentice"] }, "Thêm một miệng ăn, có thể thêm một người nối nghề", { tier: "awakened" }),
    C("Đuổi đi cho khỏi phiền", { happy: -2 }, "Đỡ lo, mang theo ánh mắt ấy")], 1)),
  daily(HV, "hrg_tourist", [18, 70], 8, (c) => T("Khách du lịch hỏi giá", vary("hrgt", c.age, ["Một nhóm khách nước ngoài hỏi giá, rõ ràng không biết giá thật.", "Một đoàn khách du lịch dừng lại chụp ảnh xe hàng của bạn, rồi hỏi mua cả chục phần."]), [
    C("Nói giá gấp ba", { money: 0.02, counters: { honest: -1 }, gamble: { p: 0.6, win: { log: "Họ trả, vui vẻ đi tiếp." }, lose: { counters: { hrg_regulars: -1 }, log: "Họ viết bài chê trên mạng, kèm ảnh mặt bạn." } } }, "Lãi hôm nay, có thể mang tiếng"),
    C("Bán đúng giá, chỉ cách ăn", { money: 0.005, counters: { hrg_regulars: 1 } }, "Lãi thường, có thể được giới thiệu")], 1)),
  daily(HV, "hrg_copycat", [18, 70], 8, (c, N) => { const r = role(c, "rival")!; return T("Xe hàng bên cạnh", `${N(r)} dựng xe bán đúng món của bạn ngay bên cạnh, rẻ hơn hai phần mười.`, [
    C("Hạ giá theo", { money: -0.02, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "phá giá ngay cạnh xe hàng" } }, "Giữ khách, mất lãi"),
    C("Đề nghị chia món: người bán sáng, người bán chiều", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia giờ bán sáng chiều" }, log: "Hai xe chia giờ. Khách quen gọi cả hai là \"góc phố\"." }, lose: { log: "Người kia bảo vỉa hè không của riêng ai." } } }, "Bớt khách, có thể bớt thù", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),

  /* ---------- gia đình ---------- */
  cross(HV, "hrg_family", [25, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Giấy báo đỗ ở thành phố xa", `${N(k)} đỗ đại học ở một thành phố cách nhà cả ngày đường. Học phí năm đầu bằng gần một năm bán hàng của bạn. ${N(k)} bảo hay là con đi làm luôn.`, [
      C("Vay tiền cho con đi học", { custom: "borrow:0.6", trust: { npc: k, delta: 0.3 }, memory: { npc: k, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "vay tiền cho đi học đại học" } }, "Nợ lớn, con có con đường khác"),
      C("Cho con đi làm như con muốn", { money: 0.05, trust: { npc: k, delta: -0.15 } }, "Không nợ, con dừng ở đây"),
      C("Bảo con vừa học vừa làm, bạn lo nửa học phí", { money: -0.3, trust: { npc: k, delta: 0.2 }, promise: { to: k, what: "gửi nửa học phí mỗi năm", years: 4 } }, "Chia gánh, một lời hứa bốn năm", { tier: "awakened" })], 0, { npc: k });
    const m = role(c, "mother")!;
    return T("Mẹ muốn ra phụ bán", `${N(m)} đã yếu nhưng cứ đòi ra ngồi cạnh xe hàng của bạn, bảo ở nhà một mình buồn. Ngồi cả buổi giữa khói bụi thì mệt.`, [
      C("Cho mẹ ra ngồi thu tiền", { trust: { npc: m, delta: 0.25 }, health: -1, counters: { hrg_regulars: 1 } }, "Mẹ vui, mẹ mệt"),
      C("Bảo mẹ ở nhà nghỉ cho khỏe", { trust: { npc: m, delta: -0.1 } }, "Mẹ khỏe hơn, mẹ buồn hơn")], 0, { npc: m });
  }),
];

/* =====================================================================
 * NGƯỜI NHẶT VE CHAI — tiền tố vch_  (con đường "đời", không có năng khiếu)
 * ===================================================================== */
const WP = "waste_picker";
/** Người mua phế liệu: ở Việt Nam là "vựa ve chai". */
const yard = (c: FactContext): string => (vn(c) ? "vựa ve chai" : "bãi thu mua phế liệu");

const VCH_CARDS: Storylet[] = [
  /* ---------- cơ hội bước vào (không có năng khiếu: bốn cánh cửa) ---------- */
  door(WP, "vch_d_oldage", [60, 75], (c) => !c.rich, () => T("Không có lương hưu", "Bạn không có lương hưu. Con cái cũng chật vật, mỗi lần đưa tiền là một lần nhìn nhau ngượng ngùng. Bà cụ cùng xóm sáng nào cũng đẩy chiếc xe nôi cũ đi gom vỏ lon, bảo: \"Tự nuôi mình thì không phải ngửa tay\".", [
    C("Mua lại một chiếc xe đẩy cũ, đi gom", { ...become(WP), counters: { doors_seen: 1 }, agency: 0.02, health: -2 }, "Tự lo được, cái lưng già chịu"),
    C("Nhận trông xe ở chợ, ít tiền hơn", { counters: { doors_seen: 1 }, money: 0.02, happy: -1 }, "Ngồi một chỗ, đồng lương bèo"),
    C("Về ở với con, để con lo", { counters: { doors_seen: 1 }, rel: 2, happy: -3 }, "Yên thân, sống trong ơn người")], 0)),
  door(WP, "vch_d_injury", [25, 58], () => true, () => T("Cái lưng không còn bê nổi", "Sau cú ngã ở công trường, bác sĩ cấm bạn mang vác nặng. Không ai thuê một thợ phụ không bê được bao xi măng. Người hàng xóm kéo xe ba gác đầy bìa các-tông qua cửa, rủ bạn đi cùng.", [
    C("Đi cùng, học cách phân loại", { ...become(WP), counters: { doors_seen: 1 }, happy: -2, rel: 2 }, "Có việc ngay, mang tiếng \"đồng nát\""),
    C("Đi học nghề sửa xe đạp", { counters: { doors_seen: 1 }, money: -0.06, know: 3 }, "Tốn tiền học, có nghề tay"),
    C("Chờ lưng lành rồi tính", { counters: { doors_seen: 1 }, health: 3, money: -0.08 }, "Giữ sức, tiêu hết tiền dành dụm")], 0)),
  door(WP, "vch_d_dump", [18, 45], (c) => c.poor_country || c.migrated || c.broke, (c) => T("Căn chòi cạnh bãi rác", `Chỗ duy nhất bạn thuê nổi là một căn chòi sát ${vn(c) ? "bãi rác ven đô" : "bãi rác lớn của thành phố"}. Mỗi khi xe rác đổ xuống, cả xóm cầm móc sắt chạy ra. Người ta nói ở đây không ai đói, chỉ là không ai sạch.`, [
    C("Cầm móc sắt, chạy ra cùng mọi người", { ...become(WP), counters: { doors_seen: 1 }, health: -3, money: 0.02 }, "Có ăn từ hôm nay, sức khỏe hao mòn"),
    C("Đi làm thuê theo ngày ở chợ đầu mối", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { money: 0.03, log: "Một chủ sạp nhận bạn bốc hàng cố định." }, lose: { ...become(WP), log: "Chợ không cần thêm người. Tuần sau bạn cũng cầm móc sắt." } } }, "Việc khá hơn, chưa chắc có")], 0)),
  door(WP, "vch_d_night", [30, 60], (c) => c.debt_ratio > 0.8 || c.broke, () => T("Ca đêm sau ca ngày", "Khoản nợ mỗi tháng ăn gần hết lương. Một người cùng xóm kể mỗi đêm anh đi gom ve chai từ mười giờ đến hai giờ sáng, đủ trả lãi mà không ai biết.", [
    C("Đi gom ban đêm, ban ngày vẫn đi làm", { counters: { doors_seen: 1 }, health: -4, gamble: { p: 0.6, win: { ...become(WP), log: "Ba tháng sau, tiền ve chai nhiều hơn tiền lương. Bạn nghỉ việc ngày." }, lose: { money: 0.03, log: "Bạn gom được hai tháng rồi kiệt sức, thôi hẳn." } } }, "Thêm tiền trả nợ, mất giấc ngủ"),
    C("Xin chủ nợ giãn thêm một năm", { counters: { doors_seen: 1 }, custom: "restructure", happy: -2 }, "Thở được một năm, nợ dài thêm"),
    C("Bỏ hẳn việc, gom ve chai cả ngày", { ...become(WP), counters: { doors_seen: 1 }, agency: 0.01 }, "Tự chủ giờ giấc, mất lương cố định")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(WP, 1, 1, (c) => T("Cái cân của vựa", `Bao ve chai đầu tiên của bạn nặng gần ba mươi cân, ${yard(c)} chỉ cân được hai mươi hai. Chủ vựa nói cân điện tử không bao giờ sai. Mấy người đứng sau bạn cúi đầu, không ai nói gì.`, [
    C("Nhận tiền, không cãi", { counters: step(c, WP), money: 0.005, happy: -2 }, "Yên chuyện, mất phần tư công sức"),
    C("Kéo xe sang vựa khác xa hơn ba cây số", { counters: step(c, WP, { vch_trust: 1 }), health: -2, money: 0.01, flags: ["vch_far_yard"] }, "Được giá đúng, mất sức"),
    C("Mua một cái cân treo, cân trước rồi mới bán", { counters: step(c, WP, { vch_trust: 2 }), money: -0.01, agency: 0.02, flags: ["vch_own_scale"], gamble: { p: 0.6, win: { log: "Chủ vựa liếc cái cân của bạn rồi cân lại. Hai mươi chín cân." }, lose: { log: "Chủ vựa không mua của bạn nữa. Bạn chuyển sang vựa khác." } } }, "Tốn chút vốn, đòi được giá thật", { tier: "sovereign" })], 0), A18),
  beat(WP, 2, 3, (c) => T("Con hẻm sau dãy quán", `Dãy quán ăn đầu phố đề nghị: nếu đêm nào bạn cũng dọn sạch con hẻm sau bếp, toàn bộ vỏ chai và thùng giấy là của bạn. Cùng tuần, một nhóm thiện nguyện đến xóm, vận động người nhặt ve chai lập hợp tác xã có thẻ hội viên, găng tay và giá bán chung.${f(c, "vch_own_scale") ? " Họ đã nghe chuyện cái cân của bạn." : ""}`, [
    C("Nhận dọn hẻm, đổi lấy vỏ chai", { counters: step(c, WP), income_mult: 1.2, health: -2, flags: ["vch_route"] }, "Nguồn hàng chắc, làm không công nửa đêm"),
    C("Vào hợp tác xã, đi họp mỗi tháng", { counters: step(c, WP, { vch_trust: 2 }), income_mult: 1.1, rel: 4, agency: 0.02, flags: ["vch_coop"] }, "Giá tốt hơn, phải chung tiếng nói", { tier: "sovereign" }),
    C("Đi một mình như cũ", { counters: step(c, WP), happy: 1, flags: ["vch_lone"] }, "Tự do, ai ép giá cũng chịu")], 1), A18),
  beat(WP, 3, 4, (c) => T("Giá phế liệu rớt một nửa", `Giá bìa giấy và nhựa trên thế giới rớt một nửa trong hai tháng. Cùng lúc, thành phố thông báo xây nhà máy phân loại rác, cấm bới thùng rác ở khu trung tâm.${f(c, "vch_coop") ? " Hợp tác xã họp khẩn ngay tối hôm đó." : " Ở vựa, chủ vựa lắc đầu không mua bìa nữa."}`, [
    C("Gom gấp đôi để bù giá", { counters: step(c, WP), health: -6, money: 0.02 }, "Đủ ăn, cơ thể trả giá"),
    C("Tích trữ trong nhà, chờ giá lên", { counters: step(c, WP), money: -0.06, gamble: { p: 0.5, win: { money: 0.15, log: "Tám tháng sau giá lên lại. Đống giấy trong nhà thành tiền." }, lose: { health: -3, money: -0.04, log: "Đống giấy ẩm mốc, chuột làm tổ. Bạn bán rẻ cho xong." } } }, "Có thể lời, nhà thành bãi chứa"),
    ...(f(c, "vch_coop") ? [C("Cùng hợp tác xã đòi việc phân loại ở nhà máy", { counters: step(c, WP), bw: -5, agency: 0.03, gamble: { p: 0.5, win: { flags: ["vch_city_contract"], income_mult: 1.3, log: "Thành phố ký hợp đồng: hợp tác xã được phân loại ở nhà máy mới, có lương." }, lose: { income_mult: 0.85, log: "Nhà máy thuê một công ty tư nhân. Hợp tác xã vẫn họp mỗi tháng." } } }, "Đòi chỗ đứng cho cả nhóm, có thể trắng tay", { tier: "sovereign" as const })] : []),
    C("Về quê, thôi nghề ve chai", { counters: step(c, WP), ...leave(WP), custom: "job_lose|return_home", happy: -2 }, "Hết bới rác, về với ruộng vườn")], 0), A18),
  beat(WP, 4, 5, (c) => {
    if (f(c, "vch_city_contract")) return T("Chiếc áo đồng phục có tên", "Ba trăm người của hợp tác xã giờ mặc áo đồng phục có tên, làm ca ở nhà máy phân loại. Họ bầu bạn làm chủ nhiệm. Một tập đoàn xử lý rác muốn \"sáp nhập\" hợp tác xã, nhận hết người vào làm công nhân với lương thấp hơn một phần năm.", [
      C("Nhận làm chủ nhiệm, giữ hợp tác xã", { counters: step(c, WP), income_mult: 1.3, bw: -6, agency: 0.03, flags: ["leader", "vch_chair"] }, "Có tiếng nói, có trăm việc lo", { tier: "sovereign" }),
      C("Ủng hộ sáp nhập, nhận ghế quản lý", { counters: step(c, WP), money: 0.5, income_mult: 1.4, rel: -6, flags: ["vch_merged"] }, "Bạn lên, anh em xuống lương"),
      C("Nhường ghế cho người trẻ, làm tổ viên", { counters: step(c, WP), happy: 3, rel: 2 }, "Nhẹ đầu, mất tiếng nói")], 0);
    return T("Chiếc túi trong thùng rác", `${f(c, "vch_route") ? "Nửa đêm dọn hẻm sau dãy quán," : "Một sáng ở khu nhà giàu,"} bạn lôi ra một chiếc túi xách còn mới. Bên trong có một hộp nhẫn vàng, giấy tờ của một căn nhà và một tờ giấy ghi địa chỉ. Số vàng bằng mấy năm bạn đi gom.`, [
      C("Mang trả theo địa chỉ trên giấy", { counters: step(c, WP, { vch_trust: 2, honest: 1 }), bw: -2, gamble: { p: 0.5, win: { money: 0.3, flags: ["vch_returned_bag"], log: "Bà chủ khóc, ép bạn nhận một khoản tiền cảm ơn. Báo địa phương viết về bạn." }, lose: { flags: ["vch_returned_bag"], log: "Người nhận cầm túi, nghi ngờ hỏi bạn đã lấy gì chưa, rồi đóng cửa." } } }, "Không được gì chắc chắn, giữ được mình"),
      C("Nộp cho đồn cảnh sát gần nhất", { counters: step(c, WP, { honest: 1 }), bw: -3, flags: ["vch_returned_bag"] }, "Đúng thủ tục, mất cả buổi"),
      C("Giữ lại, coi như phần của mình", { counters: step(c, WP, { honest: -2 }), money: 1.0, happy: -3, flags: ["vch_kept_bag"] }, "Đổi đời trong một đêm, ngủ không yên")], 0);
  }, A18),
  beat(WP, 5, 6, (c) => T("Những thứ người ta vứt đi", `Lưng bạn không còn cúi xuống thùng rác được nữa. ${f(c, "vch_books") ? "Trong nhà bạn có ba bao tải sách nhặt được suốt mấy chục năm." : f(c, "vch_kept_bag") ? "Số vàng năm ấy đã thành mái nhà, nhưng bạn vẫn nhớ tờ giấy ghi địa chỉ." : "Bạn biết giá từng loại nhựa, từng loại sắt, hơn cả chủ vựa."}${f(c, "vch_chair") ? " Hợp tác xã muốn treo ảnh bạn ở phòng họp." : ""}`, [
      C("Mở vựa nhỏ của mình, cân công khai", { counters: step(c, WP), money: -0.3, income_mult: 1.3, agency: 0.03, flags: ["vch_fair_yard"] }, "Thành người mua, vốn lớn", { tier: "sovereign" }),
      C(f(c, "vch_books") ? "Mở góc đọc sách miễn phí cho trẻ trong xóm" : "Dạy lớp người mới cách phân loại và giữ sức", { counters: step(c, WP), happy: 5, rel: 4, flags: ["passed_on"] }, "Không có tiền, để lại một thứ"),
      C("Nghỉ hẳn, sống với con cháu", { counters: step(c, WP), ...leave(WP), health: 3 }, "Nghỉ ngơi, sống nhờ người khác")], 1), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(WP, "vch_heat", [18, 75], 6, (c) => T("Trưa bốn mươi độ", vary("vchh", c.age, ["Nắng bốn mươi độ, mặt đường hắt hơi nóng lên tận mặt. Xe đẩy mới đầy một nửa.", "Đợt nắng nóng kéo dài mười ngày. Tin tức nói đã có người ngất ngoài đường."]), [
    C("Nghỉ trưa dưới gầm cầu, chiều đi tiếp", { money: -0.005, health: 2, counters: { vch_rest: 1 } }, "Mất một buổi gom, giữ sức"),
    C("Gom tiếp cho kịp chuyến bán", { money: 0.01, health: -4 }, "Có tiền, có thể say nắng")], 0)),
  daily(WP, "vch_gate", [18, 75], 8, () => T("Bảo vệ khu nhà giàu", "Bảo vệ khu biệt thự đuổi bạn khỏi dãy thùng rác, bảo cư dân phàn nàn bạn làm bừa bãi. Mà trong mấy thùng đó toàn lon và giấy sạch.", [
    C("Đi chỗ khác", { happy: -2 }, "Yên chuyện, mất khu ngon"),
    C("Đề nghị cư dân để riêng túi đồ tái chế ở cổng", { agency: 0.02, bw: -2, gamble: { p: 0.5, win: { flags: ["vch_sorted_street"], counters: { vch_trust: 2 }, log: "Một tháng sau, chín nhà treo túi đồ tái chế ở cổng chờ bạn." }, lose: { log: "Ban quản lý bảo không có quy định đó." } } }, "Mất công thuyết phục, có thể có nguồn sạch", { tier: "sovereign" }),
    C("Đến lúc nửa đêm khi bảo vệ ngủ", { money: 0.01, health: -2, counters: { vch_trust: -1 } }, "Vẫn có hàng, sống như kẻ lén lút")], 1)),
  daily(WP, "vch_glass", [18, 75], 7, () => T("Mảnh chai trong bao", "Một mảnh chai vỡ giấu trong túi rác cứa sâu vào lòng bàn tay bạn. Máu thấm qua găng vải. Trạm y tế gần nhất lấy tiền tiêm phòng uốn ván bằng ba ngày gom.", [
    C("Đến trạm y tế tiêm phòng", { money: -0.02, health: 2, flags: ["vch_tetanus_shot"] }, "Mất ba ngày công, yên tâm"),
    C("Rửa nước muối, băng lại, đi tiếp", { gamble: { p: 0.7, win: { log: "Vết thương lành sau hai tuần, để lại một vệt sẹo." }, lose: { health: -10, money: -0.05, log: "Tay sưng tấy, bạn nằm viện một tuần." } } }, "Giữ tiền, cược cả bàn tay")], 0)),
  daily(WP, "vch_books", [18, 75], 99, () => T("Thùng sách ai bỏ", "Một gia đình chuyển nhà vứt ra cả thùng sách: truyện thiếu nhi, từ điển, mấy cuốn sách giáo khoa còn mới. Bán theo cân được bằng một ngày gom.", [
    C("Bán theo cân", { money: 0.005 }, "Một ngày công, thùng sách thành bột giấy"),
    C("Mang về, xếp lên kệ ván", { know: 2, happy: 2, flags: ["vch_books"] }, "Mất tiền bán, nhà có một góc sách")], 1)),
  daily(WP, "vch_wet", [18, 75], 8, () => T("Bìa các-tông dầm mưa", "Mưa suốt đêm, đống bìa ngoài sân ướt sũng. Bìa ướt nặng gấp rưỡi. Có người trong xóm còn cố tình tưới nước vào bìa trước khi bán.", [
    C("Phơi khô rồi mới bán", { money: -0.005, counters: { vch_trust: 1, honest: 1 } }, "Bán chậm, chủ vựa tin bạn"),
    C("Bán luôn khi còn ướt", { money: 0.01, counters: { vch_trust: -1, honest: -1 }, gamble: { p: 0.7, win: { log: "Chủ vựa cân, không nói gì." }, lose: { money: -0.01, log: "Chủ vựa trừ một nửa và ghi tên bạn vào sổ đen." } } }, "Lợi hôm nay, có thể mất mối")], 0)),
  daily(WP, "vch_camera", [18, 75], 8, () => T("Ống kính của người lạ", "Một nhóm sinh viên làm phim tài liệu xin quay bạn một tuần. Họ muốn cảnh bạn bới rác lúc trời mưa, trả một khoản bằng nửa tháng gom.", [
    C("Đồng ý quay như họ muốn", { money: 0.02, happy: -2, flags: ["vch_filmed"] }, "Có tiền, hình ảnh do người khác kể"),
    C("Đồng ý, nhưng đòi được tự kể chuyện mình", { agency: 0.02, gamble: { p: 0.6, win: { flags: ["vch_filmed"], happy: 5, log: "Phim mở đầu bằng câu bạn nói: \"Tôi nuôi hai đứa con ăn học bằng cái mọi người vứt đi\"." }, lose: { log: "Họ cảm ơn rồi đi tìm người khác dễ quay hơn." } } }, "Giữ phẩm giá, có thể mất khoản tiền", { tier: "sovereign" }),
    C("Từ chối", { happy: 1 }, "Riêng tư, không có tiền")], 1)),
  daily(WP, "vch_charity", [18, 75], 8, (c) => T("Túi quà và chiếc máy ảnh", vary("vchc", c.age, ["Một đoàn thiện nguyện phát quà cho người nhặt ve chai: gạo, dầu ăn, một phong bì. Ai nhận phải đứng cầm bảng chụp ảnh.", "Cuối năm, một công ty đến xóm phát quà, kèm ba chiếc máy quay và một người dẫn chương trình."]), [
    C("Đứng chụp ảnh, nhận quà", { money: 0.01, happy: -2 }, "Có gạo ăn tháng này, mặt mình trên mạng"),
    C("Xin nhận quà không chụp ảnh", { gamble: { p: 0.5, win: { money: 0.01, counters: { vch_trust: 1 }, log: "Một cô tình nguyện viên lén đưa phần quà ra sau xe." }, lose: { log: "Họ bảo không chụp thì không có báo cáo, không có quà." } } }, "Giữ thể diện, có thể về tay không")], 0)),
  daily(WP, "vch_papers", [18, 75], 9, (c) => T("Giấy tờ cư trú", `${vn(c) ? "Công an khu vực kiểm tra tạm trú" : "Cảnh sát kiểm tra giấy tờ cư trú"} ở xóm trọ. Bạn chưa đăng ký vì chủ trọ không chịu khai. Mức phạt bằng hai tuần gom.`, [
    C("Nộp phạt, đi đăng ký cho đúng", { money: -0.03, bw: -2, flags: ["vch_registered"] }, "Mất tiền, từ nay có tên trong sổ"),
    C("Dúi ít tiền cho xong", { money: -0.01, secret: { tag: "PAID_BRIBE", severity: 0.1, fuse_years: [1, 4], note: "dúi tiền cho qua chuyện tạm trú" } }, "Rẻ hơn, vẫn không có giấy")], 0)),
  daily(WP, "vch_copper", [18, 75], 9, () => T("Cuộn dây đồng giá rẻ", "Hai thanh niên lạ mặt bán cho bạn một cuộn dây đồng còn mới với giá bằng một phần ba. Đồng bán lại cho vựa được cả tháng gom. Đầu dây còn vết cắt mới.", [
    C("Mua, bán lại ngay trong ngày", { money: 0.05, counters: { honest: -1 }, gamble: { p: 0.6, win: { log: "Không ai hỏi gì. Tiền đó trả được tiền trọ hai tháng." }, lose: { money: -0.08, flags: ["vch_police_record"], log: "Hôm sau công an đến vựa truy nguồn dây cáp bị cắt trộm. Bạn mất tiền và có tên trong biên bản." } } }, "Lời to, có thể dính vào chuyện trộm"),
    C("Từ chối, không đụng vào", { counters: { honest: 1, vch_trust: 1 } }, "Mất cơ hội, sạch sẽ")], 1)),
  daily(WP, "vch_kid", [20, 75], 99, () => T("Đứa nhỏ muốn đi theo", "Đứa con mười tuổi nhà bên cạnh trốn học đi theo xe đẩy của bạn, bảo đi gom vui hơn ngồi lớp. Nó nhặt lon nhanh và đếm tiền giỏi.", [
    C("Dắt nó về trường, nói chuyện với cô giáo", { bw: -2, counters: { kind: 1 }, flags: ["vch_walked_kid"] }, "Mất buổi gom, nó còn đường đi học"),
    C("Cho nó đi theo, chia cho vài đồng", { money: -0.005, happy: 1, counters: { vch_trust: -1 } }, "Vui cả hai, nó bỏ lỡ lớp học"),
    C("Hẹn: đi học đủ tuần thì Chủ nhật cho đi theo", { bw: -1, agency: 0.01, flags: ["vch_walked_kid"] }, "Mất chút công, giữ được cả hai", { tier: "awakened" })], 0)),
  daily(WP, "vch_rival", [18, 75], 8, (c, N) => { const r = role(c, "rival")!; return T("Tuyến phố của ai", `${N(r)} cũng đi gom ve chai, và bảo cả tuyến phố chợ là của mình từ trước khi bạn đến.`, [
    C("Tránh sang tuyến khác", { money: -0.005, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.05, note: "nhường tuyến phố chợ" } }, "Hòa khí, ít hàng hơn"),
    C("Chia giờ: sáng một người, tối một người", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia giờ gom ở phố chợ" }, log: "Hai người chia giờ. Có hôm người kia để phần bạn một bao lon." }, lose: { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "giành tuyến phố chợ" }, log: "Người kia không chịu. Hai xe đẩy cứ chạm nhau mỗi sáng." } } }, "Có thể yên ổn, có thể thêm thù", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(WP, "vch_sweeper", [25, 60], 99, () => T("Chỗ trống ở đội quét đường", "Công ty vệ sinh của quận tuyển người quét đường ca đêm: lương cố định, có bảo hộ, áo phản quang. Nhưng không được nhặt ve chai trong giờ làm.", [
    C("Nhận, gửi lại chiếc xe đẩy", { ...leave(WP), flags: ["ex_waste_picker"], health: 2 }, "Ổn định, mất tự do và mối hàng"),
    C("Ở lại với xe đẩy", { counters: { vch_trust: 1 }, happy: 1 }, "Tự do, không ai lo cho bạn")], 0), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(WP, "vch_family", [25, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "sibling"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Ô nghề nghiệp của bố mẹ", `Phiếu thông tin ở trường của ${N(k)} có ô \"nghề nghiệp của bố mẹ\". Bạn thấy ${N(k)} viết \"buôn bán tự do\", rồi gạch đi, rồi để trống.`, [
      C("Bảo con cứ viết đúng: nhặt ve chai", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.25 }, log: `${N(k)} viết \"tái chế\". Cô giáo mời bạn đến kể chuyện cho cả lớp.` }, lose: { trust: { npc: k, delta: -0.15 }, log: `${N(k)} im lặng cả tuần.` } } }, "Có thể gần con, có thể làm con xấu hổ"),
      C("Để con viết gì cũng được", { happy: -2 }, "Giữ thể diện cho con, lòng nặng"),
      C("Dắt con theo một buổi, cho con tự đếm tiền", { bw: -2, trust: { npc: k, delta: 0.2 }, memory: { npc: k, tag: "KEPT_PROMISE", weight: 0.2, note: "một buổi đi gom ve chai cùng bố mẹ" } }, "Mất một buổi gom, con thấy tận mắt", { tier: "awakened" })], 0, { npc: k });
    const s = role(c, "sibling")!;
    return T("Anh chị em gửi tiền", `${N(s)} gửi về một khoản tiền, nhắn: \"Nghỉ cái nghề đó đi, họ hàng người ta nói\". Khoản tiền đủ sống ba tháng.`, [
      C("Nhận tiền, hứa sẽ tìm việc khác", { money: 0.25, trust: { npc: s, delta: 0.1 }, promise: { to: s, what: "bỏ nghề ve chai tìm việc khác", years: 2 } }, "Có tiền, nợ một lời hứa"),
      C("Trả lại tiền, bảo nghề này nuôi mình được", { agency: 0.02, trust: { npc: s, delta: -0.1 }, happy: 2 }, "Giữ tự trọng, mất khoản đỡ")], 1, { npc: s });
  }),
];

export const PACK_STREET_A: Storylet[] = [...SHP_CARDS, ...RHD_CARDS, ...HRG_CARDS, ...VCH_CARDS];
