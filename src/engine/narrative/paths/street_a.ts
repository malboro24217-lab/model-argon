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

export const PACK_STREET_A: Storylet[] = [...SHP_CARDS, ...RHD_CARDS];
