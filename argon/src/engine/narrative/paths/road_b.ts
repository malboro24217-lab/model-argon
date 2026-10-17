/**
 * Gói "Biển, trời, đường xa" (B): HƯỚNG DẪN VIÊN DU LỊCH · NHÀ THÁM HIỂM · TIẾP VIÊN HÀNG KHÔNG · LÁI TÀU.
 * Mỗi con đường: năng khiếu · cơ hội · 5 nhịp truyện · chuyện thường ngày · chuyện gia đình. Xem docs/content-guide.md.
 *
 * Tiền tố id: tg_ (tour_guide) · xp_ (explorer) · cab_ (flight_attendant) · trn_ (train_driver).
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, life, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const PT = "tour_guide";
const PX = "explorer";
const PF = "flight_attendant";
const PR = "train_driver";
/** Mọi con đường trong gói bắt đầu từ tuổi trưởng thành: nhịp 1–4 không bao giờ chạy với trẻ em. */
const adult = (c: { age: number }) => c.age >= 18;

/* ================================================================ HƯỚNG DẪN VIÊN DU LỊCH */
/* Cờ: tg_commission / tg_clean / tg_open_books (b1) · tg_company / tg_own_tours / tg_guild (b2) · tg_held_on (b3)
 *     tg_whistle / tg_sold / tg_director / tg_community (b4). Bộ đếm: tg_rep (lòng tin của khách). */
const TOUR_GUIDE: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PT, "tg_t_lost", [9, 15], () => true, () => T("Hai vị khách hỏi đường", "Một đôi vợ chồng già nói thứ tiếng bạn mới học được hai năm đứng hỏi đường trước cổng trường. Bạn dắt họ qua bốn ngã tư ra bến xe, vừa đi vừa kể về khu chợ cũ. Tuần sau, cô giáo đưa bạn một tấm bưu thiếp gửi từ thành phố của họ.", [
    C("Xin bố mẹ cho học thêm ngoại ngữ buổi tối", { money: -0.03, know: 2, flags: [talentFlag(PT)], counters: { talents_seen: 1 } }, "Tốn tiền nhà, mở một con đường"),
    C("Kẹp tấm bưu thiếp vào vở, rồi quên", { happy: 1, counters: { talents_seen: 1 } })], 0)),
  talent(PT, "tg_t_museum", [11, 16], () => true, () => T("Thay người thuyết minh bảo tàng", "Chuyến tham quan bảo tàng của lớp, người thuyết minh bị ốm. Bạn đọc tấm bảng dưới chiếc bình gốm ba nghìn năm tuổi rồi kể lại theo cách của mình, thêm cả chuyện ông bà kể. Bốn mươi bạn cùng lớp đi theo bạn qua sáu phòng, không ai đòi về sớm.", [
    C("Đăng ký làm thuyết minh viên nhí cuối tuần", { bw: -2, know: 3, flags: [talentFlag(PT)], counters: { talents_seen: 1 } }, "Mất giờ chơi cuối tuần, được kể chuyện"),
    C("Trả micro cho cô giáo", { happy: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PT, "tg_d_season", [20, 38], () => true, (c) => T("Mùa cao điểm thiếu người dẫn", `Một công ty lữ hành dán thông báo tuyển hướng dẫn viên thời vụ: lương cứng chỉ bằng nửa ${c.poor_country ? "lương công nhân may" : "lương tối thiểu"}, còn lại sống bằng tiền boa và hoa hồng. Ba tháng, mỗi tuần một đoàn, xe dừng ở đâu ngủ ở đó.`, [
    C("Nhận, học nghề từ đoàn đầu tiên", { ...become(PT), counters: { doors_seen: 1 }, money: -0.05, health: -1 }, "Thu nhập bấp bênh, được đi"),
    C("Thi chứng chỉ hành nghề trước đã", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.55, win: { ...become(PT), flags: ["tg_licensed"], know: 3, log: "Bạn đỗ cả phần thi nói. Công ty xếp bạn dẫn ngay một đoàn." }, lose: { happy: -3, log: "Bạn trượt phần lịch sử địa phương, thiếu nửa điểm." } } }, "Chậm một mùa, vào nghề có giấy tờ"),
    C("Giữ việc đang làm", { counters: { doors_seen: 1 } })], 0)),
  door(PT, "tg_d_viral", [22, 45], () => true, (c) => T("Quê nhà lên mạng", `Một đoạn phim ngắn quay ${c.country === "VN" ? "con đèo và bản làng" : "con thung lũng"} nơi bạn lớn lên bỗng có hàng triệu lượt xem. Tuần nào cũng có người đeo ba lô xuống xe, hỏi ai biết đường vào thác, ai biết chuyện ngôi làng bỏ hoang trên núi. Bạn biết cả hai.`, [
    C("Bỏ việc về quê dẫn khách", { ...become(PT), counters: { doors_seen: 1 }, money: -0.1, flags: ["tg_local"], agency: 0.02 }, "Đặt cược vào một cơn sốt"),
    C("Dẫn khách cuối tuần, giữ việc chính", { counters: { doors_seen: 1 }, money: 0.03, bw: -3 }, "Thêm tiền, mệt gấp đôi"),
    C("Kệ, cơn sốt nào cũng qua", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PT, 1, 1, (c) => T("Phong bì ở cửa hàng đá quý", "Đoàn đầu tiên của bạn: bốn mươi khách, ba ngày, một chiếc xe năm mươi chỗ. Trưa ngày đầu, tài xế rẽ vào một cửa hàng đá quý không có trong lịch trình. Chủ cửa hàng dúi vào túi bạn một phong bì và nói nhỏ: mười phần trăm mọi thứ khách mua.", [
    C("Nhận, dẫn khách vào mọi điểm mua sắm", { counters: step(c, PT, { tg_rep: -1 }), money: 0.08, flags: ["tg_commission"] }, "Tiền dễ, khách dần mất lòng tin"),
    C("Trả phong bì, đưa khách ra chợ của dân", { counters: step(c, PT, { tg_rep: 1 }), flags: ["tg_clean"], money: -0.02, happy: -1 }, "Mất lòng tài xế và công ty"),
    C("Nói thẳng với khách: điểm này có hoa hồng", { counters: step(c, PT, { tg_rep: 1 }), flags: ["tg_open_books"], gamble: { p: 0.5, win: { money: 0.03, log: "Khách cười, vẫn mua, và tin bạn hơn suốt chuyến đi." }, lose: { happy: -3, log: "Chủ cửa hàng gọi cho công ty. Bạn bị cắt một đoàn." } } }, "Lựa chọn thứ ba: minh bạch, có thể bị phạt", { tier: "sovereign" })], 0), adult),
  beat(PT, 2, 3, (c) => {
    const rep = c.counters.tg_rep ?? 0;
    const note = rep >= 1 ? ", có người bay lại lần hai chỉ để đi cùng bạn" : f(c, "tg_commission") ? ", dù vài bài nhắc đến cửa hàng đá quý bằng giọng không vui" : "";
    return T("Năm sao và một lời mời riêng", `Khách bắt đầu gọi tên bạn trong các bài đánh giá${note}. Một nhóm mười hai người muốn thuê riêng bạn cho chuyến mười ngày, trả gấp ba. Hợp đồng với công ty cấm hướng dẫn viên nhận khách riêng.`, [
      C("Ở lại công ty, lên trưởng nhóm điều hành", { counters: step(c, PT), income_mult: 1.25, flags: ["tg_company"] }, "Ổn định, đi theo lịch của người khác"),
      C("Nghỉ công ty, mở tour riêng", { counters: step(c, PT), flags: ["tg_own_tours"], bw: -6, gamble: { p: 0.55, win: { income_mult: 1.6, log: "Mùa đầu tiên bạn kín lịch. Khách cũ kéo theo khách mới." }, lose: { income_mult: 0.85, money: -0.2, log: "Ba tháng đầu chỉ có hai đoàn. Bạn bán xe máy để trả tiền đặt phòng." } } }, "Gấp đôi nếu đủ khách, trắng tay nếu không"),
      C("Lập nhóm hướng dẫn viên tự do, chia khách", { counters: step(c, PT), flags: ["tg_guild"], income_mult: 1.2, rel: 3, agency: 0.03 }, "Lựa chọn thứ ba: chia khách, chia rủi ro", { tier: "sovereign" })], 0);
  }, adult),
  beat(PT, 3, 4, (c) => {
    const extra = f(c, "tg_own_tours") ? " Tiền đặt cọc khách sạn của bạn chưa đòi lại được." : f(c, "tg_guild") ? " Nhóm hướng dẫn viên của bạn có một quỹ chung, đủ cầm cự bốn tháng." : f(c, "tg_company") ? " Công ty cho cả phòng nghỉ không lương." : "";
    return T("Một năm không có đoàn nào", `Biên giới đóng, các chuyến bay bị hủy, khách sạn trong phố tắt đèn từng tầng. Cả năm bạn không dẫn một đoàn nào.${extra} Tấm thẻ hướng dẫn viên nằm im trong ngăn kéo.`, [
      C("Bỏ nghề, đi làm việc khác", { counters: step(c, PT), ...leave(PT), flags: ["ex_guide"] }, "Có lương ngay, mất cái nghề đã gây dựng"),
      C("Dẫn tour qua màn hình cho khách ở xa", { counters: step(c, PT), bw: -4, gamble: { p: 0.4, win: { counters: { tg_rep: 2 }, income_mult: 1.1, log: "Một trường học ở nước khác thuê bạn dẫn học sinh “đi” qua phố cổ mỗi tuần." }, lose: { money: -0.08, log: "Mỗi buổi chỉ năm, sáu người xem. Máy quay mua trả góp vẫn còn nợ." } } }, "Thử cái mới, có thể chẳng ai mua"),
      C("Vay tiền cầm cự, chờ khách quay lại", { counters: step(c, PT), custom: "borrow:0.4", happy: -3, flags: ["tg_held_on"] }, "Giữ nghề, mang nợ")], 2);
  }, adult),
  beat(PT, 4, 5, (c) => {
    if (f(c, "tg_commission") && !f(c, "tg_open_books")) return T("Đoạn phim trong cửa hàng", "Một vị khách quay lén cảnh nhân viên cửa hàng đá quý vây quanh một cụ bà, ép mua chiếc vòng giá bằng nửa năm lương hưu. Trong góc hình là bạn, đang nhìn đồng hồ. Đoạn phim có hai triệu lượt xem trong ba ngày; cơ quan quản lý du lịch gọi bạn lên làm việc.", [
      C("Xin lỗi công khai, kể hết luật ngầm của nghề", { counters: step(c, PT), unflags: ["tg_commission"], flags: ["tg_whistle"], income_mult: 0.7, agency: 0.03 }, "Mất bạn nghề, được làm lại từ đầu", { tier: "sovereign" }),
      C("Im lặng, chờ chuyện lắng xuống", { counters: step(c, PT), gamble: { p: 0.5, win: { counters: { tg_rep: -1 }, log: "Ba tuần sau, mạng xã hội có chuyện khác để giận." }, lose: { income_mult: 0.5, flags: ["tg_suspended"], log: "Bạn bị treo thẻ hành nghề một năm." } } }, "Có thể qua, có thể mất thẻ"),
      C("Trả thẻ, rời nghề", { counters: step(c, PT), ...leave(PT), happy: -4 })], 1);
    const own = f(c, "tg_own_tours") || f(c, "tg_guild");
    const big = (c.counters.tg_rep ?? 0) >= 2;
    return T("Người dẫn đường có tên tuổi", `${big ? "Lịch của bạn kín trước một năm." : "Lịch của bạn kín ba tháng tới."} Một tập đoàn lữ hành muốn ${own ? "mua lại thương hiệu tour của bạn" : "mời bạn làm giám đốc tuyến"}. Cùng tuần, trưởng làng ở thung lũng bạn hay dẫn khách đến hỏi: giá như khách ngủ lại nhà dân, tiền ở lại trong làng.`, [
      own
        ? C("Bán thương hiệu cho tập đoàn", { counters: step(c, PT), money: 1.0, income_mult: 0.8, flags: ["tg_sold"] }, "Một khoản lớn, rồi làm thuê trên tour của mình")
        : C("Nhận ghế giám đốc tuyến", { counters: step(c, PT), income_mult: 1.3, bw: -4, happy: -2, flags: ["tg_director"] }, "Lương cao, ngồi bàn giấy, xa đường mòn"),
      C("Mở tour cộng đồng, chia lợi cho làng", { counters: step(c, PT), money: -0.3, rel: 5, flags: ["tg_community"], agency: 0.02 }, "Lãi mỏng, làng giữ được mình", { tier: "awakened" }),
      C("Giữ nhỏ, tự dẫn khi còn đi được", { counters: step(c, PT), happy: 4, health: -3 }, "Tự do, đầu gối không trẻ mãi")], 0);
  }, adult),
  beat(PT, 5, 6, (c) => {
    const past = f(c, "tg_community") ? " Làng ở thung lũng giờ có mười hai nhà đón khách; con cái họ không phải đi xa làm thuê."
      : f(c, "tg_whistle") ? " Từ ngày bạn kể hết luật ngầm, nhiều người trẻ tìm đến hỏi cách làm nghề sạch."
      : f(c, "tg_sold") ? " Thương hiệu cũ của bạn giờ in trên những chiếc xe mà bạn không quen ai."
      : f(c, "tg_director") ? " Đã nhiều năm bạn không tự cầm cờ dẫn một đoàn nào." : "";
    return T("Ba cuốn sổ chép tay", `Hai mươi năm dẫn khách, bạn có ba cuốn sổ chép tay: đường mòn không có trên bản đồ, nhà nào nấu ngon, chuyện của từng cây cầu.${past} Một hướng dẫn viên trẻ xin được theo bạn một mùa.`, [
      C("Dạy hết, cả những con đường bí mật", { counters: step(c, PT), flags: ["tg_passed_on"], rel: 4, happy: 3, income_mult: 0.9 }, "Có người nối nghề, thêm một đối thủ"),
      C("In sổ thành sách, bán cho các công ty", { counters: step(c, PT, { tg_rep: 1 }), money: 0.25, flags: ["tg_book"] }, "Có tiền, đường vắng thành đường đông"),
      C("Giữ sổ cho riêng mình", { counters: step(c, PT), happy: 1, rel: -2 }, "Đường mòn còn yên, nghề không có người nối")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PT, "tg_lost_guest", [20, 65], 6, (c) => T("Khách lạc trước giờ xe chạy", vary("tgl", c.age, ["Một cụ ông trong đoàn biến mất giữa chợ đêm, bốn mươi phút trước giờ xe chạy. Điện thoại của ông nằm trên ghế xe.", "Hai vợ chồng già trong đoàn lạc nhau ở bến phà đông nghịt, đúng lúc phà sắp rời bến. Ba mươi tám người còn lại đang nhìn đồng hồ."]), [
    C("Giữ cả đoàn chờ, tự đi tìm", { counters: { tg_rep: 1 }, bw: -4, happy: -1 }, "Cả đoàn trễ lịch, không ai bị bỏ lại"),
    C("Nhờ tài xế tìm, cho xe chạy đúng giờ", { money: 0.01, gamble: { p: 0.7, win: { log: "Người lạc tự bắt xe về khách sạn, còn mua quà cho bạn." }, lose: { counters: { tg_rep: -2 }, log: "Người lạc ngồi ở đồn cảnh sát đến nửa đêm. Bài đánh giá một sao dài hai trang." } } }, "Đúng giờ, đặt cược vào may")], 0)),
  daily(PT, "tg_sacred", [20, 65], 8, () => T("Bức ảnh trên bậc thờ", "Một vị khách nhất quyết leo lên bậc thờ để chụp ảnh, ngay cạnh tấm biển cấm. Người giữ đền nhìn bạn, không nói gì. Vị khách này là người boa nhiều nhất đoàn.", [
    C("Mời khách xuống, giải thích vì sao", { counters: { tg_rep: 1 }, money: -0.01, flags: ["tg_temple_friend"] }, "Mất tiền boa, giữ được lời với làng"),
    C("Lờ đi cho khách vui", { money: 0.02, gamble: { p: 0.6, win: { log: "Không ai nói gì. Bức ảnh có rất nhiều lượt thích." }, lose: { flags: ["tg_temple_banned"], log: "Ban quản lý đền cấm đoàn của bạn vào từ mùa sau." } } }, "Tiền boa hôm nay, có thể mất một điểm đến")], 0)),
  daily(PT, "tg_knees", [25, 65], 7, (c) => T("Đầu gối sau mùa cao điểm", vary("tgk", c.age, ["Mùa này bạn đi trung bình hai mươi lăm nghìn bước một ngày. Sáng nay bạn phải vịn lan can mới xuống được cầu thang khách sạn.", "Bác sĩ xem phim chụp đầu gối và hỏi bạn làm nghề gì mà sụn mòn như người hơn bạn hai mươi tuổi."]), [
    C("Nhận thêm đoàn, mùa này khách nhiều", { money: 0.06, health: -4, counters: { tg_tours: 1 } }, "Tiền bây giờ, khớp gối về sau"),
    C("Nghỉ hai tuần, nhường đoàn cho đồng nghiệp", { money: -0.03, health: 3, rel: 1 }, "Mất một khoản, chân còn đi được lâu")], 0)),
  daily(PT, "tg_legend", [22, 65], 8, () => T("Truyền thuyết do người trước bịa", "Mười năm nay bạn kể cho khách chuyện nàng công chúa nhảy xuống hồ. Hôm nay một nhà sử học trong đoàn kéo bạn ra riêng: chuyện ấy do một hướng dẫn viên đời trước bịa ra, cái hồ mới được đào cách đây sáu mươi năm.", [
    C("Bỏ chuyện ấy khỏi lộ trình", { know: 2, happy: -2, counters: { tg_rep: 1 } }, "Đúng sử, mất đoạn hay nhất chuyến đi"),
    C("Kể tiếp, khách thích", { money: 0.02, flags: ["tg_tall_tales"] }, "Khách vui, có ngày bị bóc"),
    C("Kể cả hai, nói rõ đâu là truyền thuyết", { know: 2, bw: -3, flags: ["tg_honest_story"] }, "Tốn công viết lại, khách có thể chán", { tier: "awakened" })], 1)),
  daily(PT, "tg_one_star", [22, 65], 7, (c) => T("Đánh giá một sao", vary("tgo", c.age, ["Một vị khách viết đánh giá một sao, gọi bạn là thô lỗ, chỉ vì bạn không cho cả nhóm rời đường mòn ở đoạn sạt lở.", "Một bài đánh giá một sao chê bạn “nói quá nhiều về lịch sử”. Nó nằm đầu tiên mỗi khi ai đó tìm tên bạn."]), [
    C("Trả lời công khai, kèm ảnh biển cảnh báo", { gamble: { p: 0.6, win: { counters: { tg_rep: 1 }, log: "Người đọc đứng về phía bạn. Lượt đặt tour tăng lên." }, lose: { happy: -3, log: "Cuộc cãi nhau dưới bài đánh giá kéo dài hai tuần." } } }, "Có thể được bênh, có thể thành chuyện ồn ào"),
    C("Nhắn xin lỗi riêng, tặng một tour miễn phí", { money: -0.03, counters: { tg_rep: 1 } }, "Mất tiền, bài đánh giá được sửa lại"),
    C("Bỏ qua, thôi không đọc nữa", { happy: -1, bw: 2 })], 2)),
  daily(PT, "tg_half_price", [22, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Tour giá nửa tiền", `${N(r)} cũng mở tour, và vừa rao đúng lộ trình của bạn với giá chỉ bằng một nửa. Ba đoàn đã đặt cọc với bạn gọi hỏi có giảm giá không.`, [
    C("Hạ giá theo", { money: -0.05, income_mult: 0.95, flags: ["tg_price_war"] }, "Giữ khách, cả hai cùng nghèo đi"),
    C("Giữ giá, thêm một điểm đến không ai có", { bw: -3, counters: { tg_rep: 1 } }, "Mất vài đoàn, giữ được giá trị"),
    C("Rủ ghép đoàn, chia khách theo ngày", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "ghép đoàn chia khách mùa cao điểm" }, money: 0.03, log: "Hai bên chia lịch. Mùa đó không ai phải chạy xe rỗng." }, lose: { log: "Họ cười và cúp máy." } } }, "Có thể thành bạn làm ăn, có thể bị cười", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PT, "tg_language", [22, 55], 10, () => T("Thứ tiếng thứ ba", "Khách từ một nước mới bắt đầu đến đông. Cả thành phố chỉ có vài người nói được tiếng của họ, và lịch của những người ấy kín đến cuối năm. Lớp buổi tối học hai năm, mỗi tuần bốn buổi.", [
    C("Đăng ký học, bỏ hết các buổi tối", { money: -0.04, bw: -5, know: 4, income_mult: 1.1, flags: ["tg_third_lang"] }, "Hai năm mệt, mở một thị trường"),
    C("Thuê phiên dịch đi kèm, chia tiền", { money: 0.02, counters: { tg_tours: 1 } }, "Có khách ngay, mất một phần lãi"),
    C("Bỏ qua, khách cũ đủ sống", { happy: 1 })], 1)),
  daily(PT, "tg_storm_pass", [20, 65], 8, () => T("Vượt đèo trong mưa lớn", "Mưa ba ngày liền. Tài xế muốn vượt đèo ngay đêm nay để kịp chuyến bay sáng mai của khách, cả đoàn cũng muốn đi. Đài báo có thể sạt lở.", [
    C("Bắt cả đoàn dừng, ngủ nhờ nhà dân", { money: -0.04, happy: -1, counters: { tg_rep: 1 } }, "Khách lỡ bay, bạn đền tiền, mọi người an toàn"),
    C("Cho xe đi tiếp", { gamble: { p: 0.8, win: { money: 0.02, log: "Xe qua đèo lúc nửa đêm. Khách ngủ suốt." }, lose: { health: -6, counters: { tg_rep: -2 }, flags: ["tg_bus_accident"], log: "Xe trượt xuống rãnh ở khúc cua thứ chín. Vài người bị thương nhẹ, cả đoàn đứng dưới mưa chờ cứu hộ." } } }, "Đúng lịch, đặt cược vào con đường")], 1)),
  daily(PT, "tg_overtourism", [25, 65], 10, () => T("Phố cổ quá tải", "Phố cổ bạn dẫn khách mười năm giờ có ba mươi đoàn một ngày. Người dân treo băng rôn phản đối, bà cụ bán bánh đầu ngõ đã dọn đi. Hội đồng thành phố hỏi ý kiến các hướng dẫn viên về việc giới hạn số khách.", [
    C("Ủng hộ giới hạn, kể cả mất đoàn", { income_mult: 0.95, rel: 2, agency: 0.01, flags: ["tg_cap_supporter"] }, "Ít khách hơn, phố còn là phố"),
    C("Phản đối, nghề cần khách", { money: 0.03, counters: { tg_tours: 1 } }, "Đủ khách, phố cứ thế đổi"),
    C("Đề xuất dẫn khách vào giờ vắng, chia luồng", { bw: -3, gamble: { p: 0.5, win: { counters: { tg_rep: 1 }, log: "Thành phố lấy đề xuất của bạn làm thí điểm ở hai con phố." }, lose: { log: "Đề xuất của bạn nằm giữa hai mươi bộ hồ sơ khác." } } }, "Tốn công, có thể chẳng ai đọc", { tier: "awakened" })], 1)),
  daily(PT, "tg_quit", [30, 65], 99, () => T("Quầy lễ tân khách sạn", "Một khách sạn lớn mời bạn về làm trưởng bộ phận lễ tân. Lương cố định, có bảo hiểm, tối nào cũng ngủ ở nhà. Mùa thấp điểm năm nay bạn chỉ dẫn được bốn đoàn.", [
    C("Nhận việc, cất thẻ hướng dẫn viên", { ...leave(PT), flags: ["ex_guide"] }, "Bình yên, không còn đường xa"),
    C("Chờ thêm một mùa", { happy: 1, money: -0.03 })], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(PT, "tg_family", [24, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    const holiday = c.country === "VN" ? "Tết" : "kỳ nghỉ lễ";
    if (c.kids_alive > 0 && k) return T("Dẫn gia đình người khác đi chơi", `${N(k)} hỏi vì sao ${holiday} năm nào bạn cũng dẫn gia đình người khác đi chơi, còn nhà mình chưa đi đâu bao giờ.`, [
      C("Bỏ một đoàn, đưa cả nhà đi", { money: -0.06, happy: 3, trust: { npc: k, delta: 0.25 } }, "Mất đoàn đông nhất năm"),
      C("Hứa mùa thấp điểm sẽ đi", { promise: { to: k, what: "đưa con đi một chuyến xa", years: 1 }, trust: { npc: k, delta: 0.05 } }, "Hứa thì phải giữ"),
      C("Đi làm, cả năm trông vào mùa này", { money: 0.05, trust: { npc: k, delta: -0.15 } })], 1, { npc: k });
    if (s) return T("Chiếc vali chưa từng được cất", `${N(s)} đếm được năm nay bạn ngủ ở nhà bốn mươi đêm. Chiếc vali của bạn chưa bao giờ được cất lên nóc tủ.`, [
      C("Chỉ nhận tour trong ngày từ nay", { income_mult: 0.85, trust: { npc: s, delta: 0.25 } }, "Ít tiền hơn, có mặt ở nhà"),
      C(`Rủ ${N(s)} đi cùng một chuyến`, { money: -0.04, gamble: { p: 0.6, win: { trust: { npc: s, delta: 0.2 }, log: `${N(s)} lần đầu thấy bạn làm việc, và hiểu vì sao bạn mệt.` }, lose: { trust: { npc: s, delta: -0.05 }, log: `${N(s)} say xe ba ngày, về nhà không nói gì.` } } }),
      C("Giữ lịch như cũ", { money: 0.04, trust: { npc: s, delta: -0.15 } })], 0, { npc: s });
    return T("Chuyến đi xa đầu tiên của bố mẹ", `${N(p!)} chưa từng đi xa quá vùng bên. ${N(p!)} hỏi, nửa đùa nửa thật, có thể đi theo một đoàn của bạn không.`, [
      C("Xếp một ghế trong đoàn, tự trả tiền", { money: -0.03, happy: 3, trust: { npc: p!, delta: 0.3 } }, "Tốn một ghế, bố mẹ thấy bạn làm nghề"),
      C("Hẹn khi nào rảnh", { trust: { npc: p!, delta: -0.05 } })], 0, { npc: p! });
  }),
];

/* ================================================================ NHÀ THÁM HIỂM */
/* Cờ: xp_listens / xp_solo / xp_frostbite (b1) · xp_brand / xp_crowd / xp_science (b2)
 *     xp_turned_back / xp_summit / xp_partner_hurt (b3) · xp_confessed / xp_speaker / xp_foundation (b4). Bộ đếm: xp_feats. */
const EXPLORER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PX, "xp_t_map", [8, 14], () => true, () => T("Tấm bản đồ tự vẽ", "Bạn vẽ bản đồ cả khu đồi sau nhà trên giấy kẻ ô, đặt tên cho từng con suối, từng tảng đá. Hôm qua bạn lần theo một con suối đến tận chỗ nó chui vào lòng đất, về đến nhà thì trời đã tối và hàng xóm đang đi tìm.", [
    C("Xin vào câu lạc bộ dã ngoại cuối tuần", { money: -0.02, health: 2, flags: [talentFlag(PX)], counters: { talents_seen: 1 } }, "Tốn tiền nhà, học đi rừng cho đúng cách"),
    C("Hứa với bố mẹ không đi xa nữa", { happy: -2, counters: { talents_seen: 1 } })], 0)),
  talent(PX, "xp_t_atlas", [10, 16], () => true, () => T("Những vùng trắng trong atlas", "Trong thư viện trường có một cuốn atlas cũ, vài vùng chỉ tô trắng kèm dòng chữ “chưa khảo sát”. Bạn chép từng vùng trắng vào sổ, rồi hỏi thầy địa lý vì sao người lớn chưa ai đi đến đó.", [
    C("Viết thư xin làm tình nguyện viên hội địa lý", { bw: -2, know: 3, flags: [talentFlag(PX)], counters: { talents_seen: 1 } }, "Mất mùa hè chơi, mở ra một đời khác"),
    C("Trả sách, quay về ôn thi", { know: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PX, "xp_d_team", [20, 40], () => true, () => T("Đoàn thám hiểm thiếu một người", "Một đoàn sáu người chuẩn bị đi bộ xuyên một dải băng dài bốn trăm cây số. Một thành viên gãy chân ba tuần trước ngày đi. Họ cần một người khỏe, không trả lương, tự lo đồ nghề.", [
    C("Bỏ việc, đi theo đoàn", { ...become(PX), counters: { doors_seen: 1 }, money: -0.3, agency: 0.02 }, "Tốn một khoản lớn, đổi lấy một con đường"),
    C("Xin nghỉ không lương, đi thử một chuyến", { counters: { doors_seen: 1 }, money: -0.15, gamble: { p: 0.45, win: { ...become(PX), log: "Bạn kéo xe trượt suốt ba mươi ngày. Trưởng đoàn giữ bạn lại cho chuyến sau." }, lose: { health: -3, log: "Bạn bỏ cuộc ở ngày thứ chín vì bỏng lạnh, được đưa về bằng máy bay nhỏ." } } }, "Giữ đường lui, có thể bị loại"),
    C("Từ chối, giữ việc đang làm", { counters: { doors_seen: 1 } })], 0)),
  door(PX, "xp_d_first", [22, 45], () => true, () => T("Người đầu tiên của cả nước", "Bạn đọc thấy chưa ai sinh ra ở nước mình từng một mình băng qua sa mạc muối ở phía tây lục địa. Kỷ lục ấy chỉ cần một người đủ gan, chín tháng chuẩn bị và một khoản tiền bằng nửa năm thu nhập.", [
    C("Vay tiền, bắt đầu chuẩn bị", { custom: `borrow:0.5|become:${PX}`, counters: { doors_seen: 1 }, agency: 0.02 }, "Mang nợ, có thể là người đầu tiên"),
    C("Đi gõ cửa các nhà tài trợ trước", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(PX), flags: ["xp_sponsored"], log: "Một hãng đồ dã ngoại nhỏ nhận tài trợ, đổi lại logo trên áo khoác." }, lose: { happy: -2, log: "Bốn mươi lá thư, hai câu trả lời, cả hai đều là không." } } }, "Không mất tiền, có thể chẳng đi được"),
    C("Để người khác làm", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PX, 1, 1, (c) => T("Đêm bão trên dải băng", "Ngày thứ mười hai, âm ba mươi độ, lều rách một góc. Người dẫn đường bản địa đi cùng đoàn ngửi gió và nói phải quay lại: bão sẽ kéo dài năm ngày. Đích chỉ còn bốn ngày đi bộ.", [
    C("Nghe người dẫn đường, quay lại", { counters: step(c, PX), flags: ["xp_listens"], happy: -3 }, "Mất chuyến đầu, học được cách sống sót"),
    C("Tách đoàn, đi tiếp một mình", { counters: step(c, PX), flags: ["xp_solo"], gamble: { p: 0.5, win: { counters: { xp_feats: 1 }, happy: 6, log: "Bạn đến đích muộn hai ngày, gầy đi bảy cân. Tên bạn lên bản tin." }, lose: { health: -8, money: -0.2, flags: ["xp_frostbite"], log: "Ngày thứ hai bạn phải bấm nút cứu hộ. Bạn mất đầu hai ngón chân, và nhận hóa đơn trực thăng." } } }, "Có thể thành danh, có thể trả bằng cơ thể")], 0), adult),
  beat(PX, 2, 3, (c) => T("Nhà tài trợ có lịch riêng", `${f(c, "xp_sponsored") ? "Hãng đồ dã ngoại năm nào" : "Một hãng nước tăng lực"} muốn tài trợ toàn bộ chuyến lớn tiếp theo của bạn, đủ cả máy quay lẫn trực thăng dự phòng. Điều kiện: xuất phát đúng ngày họ ra mắt sản phẩm, sớm hơn mùa an toàn ba tuần.${f(c, "xp_frostbite") ? " Bạn nhìn hai ngón chân cụt và nghĩ về ba tuần ấy." : f(c, "xp_listens") ? " Bạn nhớ người dẫn đường từng ngửi gió và bảo quay lại." : ""}`, [
    C("Nhận, đi theo lịch của họ", { counters: step(c, PX), money: 0.4, income_mult: 1.4, flags: ["xp_brand"] }, "Đủ tiền, đi sai mùa"),
    C("Gây quỹ từ người theo dõi, đi đúng mùa", { counters: step(c, PX), bw: -6, money: -0.1, income_mult: 1.1, flags: ["xp_crowd"] }, "Thiếu tiền, mệt, an toàn hơn"),
    C("Đi cùng nhà khoa học, nhận quỹ nghiên cứu", { counters: step(c, PX), know: 5, income_mult: 1.15, flags: ["xp_science"], agency: 0.02 }, "Lựa chọn thứ ba: ít tiếng tăm, có ý nghĩa", { tier: "sovereign" })], 0), adult),
  beat(PX, 3, 4, (c) => {
    const load = f(c, "xp_brand") ? " Máy quay của nhà tài trợ vẫn đang chạy; hợp đồng ghi rõ phải đến đích." : f(c, "xp_science") ? " Trong xe trượt là bốn mươi ống mẫu băng mà nhóm nghiên cứu đã chờ ba năm." : "";
    return T("Hai ngày trước đích", `Ngày thứ ba mươi mốt, người bạn đồng hành bắt đầu nói lẫn, môi tím tái, không tự buộc được dây giày. Đích còn hai ngày đi bộ.${load} Bộ đàm gọi được trạm cứu hộ, nhưng trời đang chuyển xấu.`, [
      C("Bỏ đích, kéo bạn quay về", { counters: step(c, PX), flags: ["xp_turned_back"], health: -4, rel: 5, income_mult: f(c, "xp_brand") ? 0.75 : 0.9 }, "Mất kỷ lục, có thể mất tài trợ, giữ được người"),
      C("Gọi cứu hộ cho bạn, mình đi tiếp", { counters: step(c, PX, { xp_feats: 2 }), flags: ["xp_summit"], gamble: { p: 0.6, win: { log: "Bạn đến đích. Trực thăng đưa người đồng hành về an toàn trước khi bão tới." }, lose: { flags: ["xp_partner_hurt"], happy: -8, log: "Bạn đến đích. Trực thăng chỉ bay được sau ba ngày; người đồng hành mất ba ngón tay và không bao giờ gọi cho bạn nữa." } } }, "Kỷ lục, và một câu hỏi theo bạn cả đời"),
      C("Quay về, treo dụng cụ sau chuyến này", { counters: step(c, PX), ...leave(PX), flags: ["xp_turned_back", "ex_explorer"], health: -2 }, "Về nhà an toàn, khép lại con đường")], 0);
  }, adult),
  beat(PX, 4, 5, (c) => {
    if (f(c, "xp_partner_hurt")) return T("Những câu hỏi sau kỷ lục", "Một nhà báo dựng lại từng giờ của chuyến đi từ nhật ký trạm cứu hộ. Câu hỏi trong bài không phải bạn có đến đích không, mà vì sao bạn không quay lại. Ba nhà tài trợ đang chờ xem bạn trả lời thế nào.", [
      C("Công khai toàn bộ nhật ký, nhận phần sai", { counters: step(c, PX), flags: ["xp_confessed"], income_mult: 0.7, agency: 0.03 }, "Mất hợp đồng, nhìn thẳng được vào gương", { tier: "sovereign" }),
      C("Im lặng, để luật sư trả lời", { counters: step(c, PX), gamble: { p: 0.5, win: { income_mult: 1.2, log: "Câu chuyện trôi đi sau một tháng. Kỷ lục vẫn mang tên bạn." }, lose: { income_mult: 0.6, flags: ["xp_disgraced"], log: "Hội thám hiểm gạch tên bạn khỏi danh sách thành viên danh dự." } } }, "Giữ hình ảnh, nếu may"),
      C("Bỏ nghề, về sống lặng lẽ", { counters: step(c, PX), ...leave(PX), happy: -3 }, "Thoát khỏi máy quay, mất con đường")], 0);
    if (f(c, "xp_turned_back")) return T("Lần thử thứ hai", "Nhiều năm sau lần quay đầu, bạn có một mùa cuối để thử lại đúng tuyến đường ấy. Bạn không còn trẻ, đầu gối kêu mỗi sáng. Một đoàn trẻ hơn mời bạn làm trưởng trại nền cho họ.", [
      C("Đi, lần cuối cùng", { counters: step(c, PX), gamble: { p: 0.5, win: { counters: { xp_feats: 2 }, flags: ["xp_summit"], happy: 8, log: "Lần này bạn đến đích, và lần này cả đoàn cùng về." }, lose: { health: -8, log: "Bão lại đến ở đúng chỗ cũ. Bạn quay đầu lần thứ hai, lần này không tiếc." } } }, "Một cơ hội cuối, cơ thể trả giá"),
      C("Làm trưởng trại nền cho người trẻ", { counters: step(c, PX), flags: ["xp_base_leader"], income_mult: 1.1, rel: 4 }, "Không còn đỉnh, có cả một thế hệ")], 1);
    const famous = (c.counters.xp_feats ?? 0) >= 2;
    return T("Diễn giả trên sân khấu lớn", `${famous ? "Tên bạn có trong sách giáo khoa địa lý." : "Người ta bắt đầu nhận ra bạn ở sân bay."} Các công ty trả tiền để bạn kể chuyện vượt khó cho nhân viên, mỗi buổi bằng hai tháng thu nhập cũ. Lịch nói chuyện kín đến mức bạn không còn thời gian chuẩn bị chuyến đi nào.`, [
      C("Nhận hết, đi nói chuyện khắp nơi", { counters: step(c, PX), income_mult: 1.6, happy: -2, flags: ["xp_speaker"] }, "Giàu lên, thành người kể về đời cũ"),
      C("Lập quỹ bảo vệ vùng đất đã đi qua", { counters: step(c, PX), money: -0.3, flags: ["xp_foundation"], agency: 0.02 }, "Tốn tiền, để lại thứ bền hơn tên mình", { tier: "awakened" }),
      C("Từ chối, lên đường chuyến khó hơn", { counters: step(c, PX), gamble: { p: 0.45, win: { counters: { xp_feats: 1 }, happy: 6, log: "Bạn mở một tuyến đường chưa ai đi. Người ta đặt tên nó theo tên bạn." }, lose: { health: -10, money: -0.3, log: "Bạn gãy hông ở ngày thứ sáu. Ca cứu hộ tốn hết tiền dành dụm." } } }, "Sống đúng nghề, liều cả thân")], 0);
  }, adult),
  beat(PX, 5, 6, (c) => {
    const scars = (f(c, "xp_frostbite") ? " Lật trang nào bạn cũng nhớ hai ngón chân để lại trên băng." : "") + (f(c, "xp_confessed") ? " Từ ngày bạn công khai nhật ký chuyến cũ, nhiều đoàn trẻ in trang ấy ra đọc trước khi đi." : f(c, "xp_foundation") ? " Quỹ của bạn giờ trả lương cho mười bốn kiểm lâm." : "");
    return T("Mười bốn cuốn nhật ký hành trình", `Bạn có mười bốn cuốn nhật ký hành trình, mép giấy ố vì tuyết tan.${scars} Một người hai mươi ba tuổi viết thư xin tuyến đường và ghi chép của bạn: họ muốn phá kỷ lục bạn lập ra.`, [
      C("Gửi hết ghi chép, kể cả lần suýt chết", { counters: step(c, PX), flags: ["xp_passed_on"], happy: 4 }, "Kỷ lục sẽ mất, kinh nghiệm thì còn"),
      C("Bán bản quyền nhật ký làm phim", { counters: step(c, PX), money: 0.4, flags: ["xp_film_rights"] }, "Có tiền, đời mình thành kịch bản người khác viết"),
      C("Tặng nhật ký cho thư viện quốc gia", { counters: step(c, PX), rel: 3, flags: ["xp_archive"] }, "Ai cũng đọc được, không ai trả tiền")], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PX, "xp_gear", [20, 65], 6, (c) => T("Bộ đồ lông vũ đã vá bốn chỗ", vary("xpg", c.age, ["Bộ đồ lông vũ chịu được âm năm mươi độ giá bằng ba tháng thu nhập. Bộ cũ của bạn đã vá bốn chỗ.", "Đôi giày leo băng mới nhẹ hơn một nửa, giá bằng hai tháng thu nhập. Đôi cũ đã theo bạn qua ba chuyến."]), [
    C("Mua đồ mới, nợ thêm", { money: -0.2, health: 2, counters: { xp_gear: 1 } }, "Đắt, nhưng đồ tốt giữ mạng"),
    C("Vá lại, đi tiếp", { gamble: { p: 0.75, win: { log: "Đồ cũ chịu thêm được một mùa." }, lose: { health: -6, log: "Đường may bung ở ngày thứ tám. Bạn mất cảm giác ở ngón tay suốt hai tuần." } } }, "Tiết kiệm, đặt cược vào đường kim"),
    C("Nhận đồ của hãng, quảng cáo cho họ", { happy: -1, flags: ["xp_gear_deal"], counters: { xp_ads: 1 } }, "Không mất tiền, mất một phần tự do")], 1)),
  daily(PX, "xp_porter", [22, 65], 8, () => T("Người khuân vác đòi được ghi tên", "Người khuân vác bản địa đi với đoàn bạn ba mùa liền, mang gấp đôi trọng lượng của bạn. Anh hỏi: lần này tên anh có được ghi trong báo cáo thành tích không, và có được trả công ngang người nước ngoài không.", [
    C("Trả công ngang mọi thành viên, ghi tên anh", { money: -0.08, rel: 3, flags: ["xp_credit_local"] }, "Tốn tiền, chuyến đi thành của chung"),
    C("Trả theo giá thị trường, như mọi đoàn", { money: 0.02, happy: -1 }, "Đúng lệ, không ai trách bạn"),
    C("Lập quỹ bảo hiểm cho người khuân vác cả vùng", { money: -0.12, agency: 0.02, flags: ["xp_porter_fund"] }, "Đắt, đổi luật chơi của cả vùng", { tier: "sovereign" })], 1)),
  daily(PX, "xp_heart", [30, 70], 9, () => T("Phim chụp tim", "Bác sĩ thể thao chỉ vào phim chụp: tim bạn dày lên sau những tháng sống ở độ cao, đầu gối mòn như người bảy mươi. Bà khuyên đừng lên quá ba nghìn mét nữa.", [
    C("Nghe bác sĩ, chuyển sang hang động và rừng thấp", { health: 4, flags: ["xp_lowland"], counters: { xp_feats: -1 } }, "Giữ tim, mất những đỉnh cao"),
    C("Gật đầu, rồi vẫn lên", { health: -4, happy: 2, counters: { xp_ignored_doctor: 1 } }, "Sống đúng nghề, tim trả giá")], 1)),
  daily(PX, "xp_valley", [25, 65], 10, () => T("Thung lũng chưa có tên", "Chuyến trước bạn tìm thấy một thung lũng không có trên bản đồ nào: suối nước nóng, rừng chưa ai chặt. Một công ty khai khoáng gọi điện, muốn thuê bạn dẫn đội khảo sát vào đó, trả bằng nửa năm thu nhập.", [
    C("Nhận dẫn đường cho đội khảo sát", { money: 0.5, happy: -2, flags: ["xp_sold_valley"] }, "Tiền lớn, thung lũng sẽ có đường xe tải"),
    C("Từ chối, giữ kín vị trí", { happy: 1, flags: ["xp_kept_valley"] }, "Mất tiền, bí mật có thể lộ"),
    C("Công bố thung lũng, xin lập khu bảo tồn", { bw: -4, agency: 0.02, gamble: { p: 0.4, win: { rel: 4, flags: ["xp_reserve"], log: "Sau hai năm giấy tờ, thung lũng được khoanh làm khu bảo tồn, mang tên con suối bạn đặt." }, lose: { happy: -4, log: "Bản đồ bạn công bố đến tay công ty khai khoáng trước khi hồ sơ được duyệt." } } }, "Có thể giữ nó mãi, có thể dâng nó cho người khác", { tier: "awakened" })], 1)),
  daily(PX, "xp_photo", [22, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Bức ảnh ở điểm đích", `${N(r)} viết trên một diễn đàn thám hiểm rằng bức ảnh ở điểm đích chuyến gần nhất của bạn được chụp cách đích hai trăm mét: bóng núi không khớp với giờ bạn khai. Máy định vị của bạn hết pin đúng hôm ấy.`, [
    C("Mời hội đồng độc lập xem toàn bộ dữ liệu", { gamble: { p: 0.6, win: { counters: { xp_feats: 1 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "vụ bức ảnh ở điểm đích bị bác bỏ" }, log: "Hội đồng xác nhận bạn đã đến đích. Ảnh lệch giờ vì máy ảnh để sai múi giờ." }, lose: { counters: { xp_feats: -1 }, log: "Hội đồng kết luận không đủ dữ liệu. Thành tích của bạn bị đánh dấu sao." } } }, "Có thể được minh oan, có thể mất thành tích"),
    C("Đáp trả ngay trên diễn đàn", { happy: -2, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "trận cãi nhau trên diễn đàn thám hiểm" } }, "Hả giận, thêm một kẻ thù"),
    C("Im lặng, chuẩn bị chuyến sau", { happy: -2, bw: 2 })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PX, "xp_talk", [25, 70], 7, (c) => T("Hai lời mời trong cùng một ngày", vary("xpt", c.age, ["Một trường làng mời bạn đến nói chuyện với học sinh, không có tiền. Cùng ngày, một ngân hàng mời bạn nói ở hội nghị khách hàng, trả bằng một tháng thu nhập.", "Một trại hè cho trẻ khuyết tật mời bạn dẫn một buổi đi rừng. Cùng tuần, một hãng xe muốn quay quảng cáo với bạn trên núi."]), [
    C("Chọn lời mời không có tiền", { rel: 3, happy: 2, counters: { kind: 1 } }, "Mất một khoản, có những gương mặt nhớ mãi"),
    C("Chọn lời mời trả tiền", { money: 0.08, counters: { xp_ads: 1 } }, "Đủ tiền cho chuyến sau")], 1)),
  daily(PX, "xp_return", [22, 70], 6, (c) => T("Trở về sau ba tháng", vary("xpr", c.age, ["Về đến nhà sau ba tháng, bạn không ngủ được trên giường. Tài khoản còn đủ tiền cho sáu tuần.", "Thành phố ồn đến mức bạn đeo nút tai cả ngày. Hóa đơn chồng trên bàn, chưa cái nào được mở."]), [
    C("Nhận việc tạm để trả nợ", { money: 0.1, bw: -3, counters: { xp_odd_jobs: 1 } }, "Đủ tiền, mất nửa năm chuẩn bị"),
    C("Lên kế hoạch chuyến sau ngay", { happy: 3, money: -0.05, flags: ["xp_restless"] }, "Sống bằng giấc mơ, ví mỏng dần")], 0)),
  daily(PX, "xp_permit", [22, 65], 9, () => T("Giấy phép vùng biên", "Vùng núi bạn muốn đến nằm trong khu biên giới, giấy phép phải chờ mười bốn tháng. Một người trung gian ở thủ phủ nói chỉ cần thêm một phong bì, giấy tờ có trong tuần.", [
    C("Gửi phong bì qua người trung gian", { money: -0.1, counters: { xp_feats: 1 }, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 10], note: "phong bì xin giấy phép vùng biên" } }, "Đi ngay, mang theo một bí mật"),
    C("Làm đúng thủ tục, chờ hơn một năm", { happy: -3, counters: { honest: 1 } }, "Sạch sẽ, mất một mùa"),
    C("Đổi sang một vùng chưa ai xin phép đến", { know: 2, bw: -3, flags: ["xp_new_route"] }, "Làm lại kế hoạch từ đầu")], 1)),
  daily(PX, "xp_camera", [20, 40], 99, () => T("Kênh video từ hang băng", "Đoạn phim bạn tự quay cảnh ngủ trong hang băng có ba triệu lượt xem. Một công ty quản lý nội dung đề nghị: bỏ những chuyến dài, làm video du lịch mỗi tuần, chia đôi doanh thu.", [
    C("Chuyển hẳn sang làm video du lịch", { custom: "become:vlogger", unflags: [life(PX)], income_mult: 1.2, flags: ["ex_explorer"] }, "Đều tiền, đổi băng tuyết lấy ống kính"),
    C("Quay tiếp, chỉ đăng sau mỗi chuyến", { money: 0.05, counters: { xp_ads: 1 } }, "Thêm chút tiền, không ai giục"),
    C("Giữ máy quay cho riêng mình", { happy: 1 })], 1)),
  daily(PX, "xp_quit", [30, 70], 99, () => T("Cửa hàng đồ leo núi", "Một chuỗi cửa hàng đồ leo núi mời bạn làm quản lý ở thành phố: lương đều, giờ hành chính, được giảm giá đồ nghề. Chuyến gần nhất của bạn vẫn chưa trả hết nợ.", [
    C("Nhận, treo dụng cụ lên tường", { ...leave(PX), flags: ["ex_explorer"] }, "Bình yên, thôi nhìn lên đỉnh núi"),
    C("Từ chối, còn một chuyến nữa", { happy: 2, money: -0.03 })], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(PX, "xp_family", [22, 70], (c) => !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    if (s) return T("Lá thư trong ngăn kéo", `${N(s)} tìm thấy lá thư bạn viết trước mỗi chuyến đi, ngoài bì ghi: “Chỉ mở nếu tôi không về.”${c.kids_alive > 0 ? " Các con đang ngủ ở phòng bên." : ""} ${N(s)} hỏi bạn còn định viết bao nhiêu lá thư như thế.`, [
      C("Hứa chuyến tới là chuyến cuối", { promise: { to: s, what: "thôi những chuyến đi nguy hiểm", years: 3 }, trust: { npc: s, delta: 0.15 } }, "Giữ được nhà, phải giữ được lời"),
      C("Đi tiếp, mua bảo hiểm và lập di chúc", { money: -0.05, trust: { npc: s, delta: -0.1 } }, "Nhà có lưới an toàn, lòng thì không"),
      C("Đưa cả nhà đến trại nền chuyến tới", { money: -0.12, happy: 3, trust: { npc: s, delta: 0.25 } }, "Tốn kém, họ hiểu bạn đi đâu", { tier: "awakened" })], 0, { npc: s });
    return T("Ba đêm xem bản tin thời tiết", `${N(p!)} xem bản tin thấy bão trên vùng núi bạn đang đi, ba đêm không ngủ. Khi bạn về, ${N(p!)} không ra cửa đón.`, [
      C("Ngồi kể hết chuyến đi cho bố mẹ nghe", { bw: -2, trust: { npc: p!, delta: 0.2 } }, "Mất một buổi tối, bố mẹ bớt sợ"),
      C("Để lại máy định vị cho bố mẹ theo dõi", { money: -0.02, flags: ["xp_tracker"], trust: { npc: p!, delta: 0.15 } }, "Tốn tiền, bố mẹ thấy bạn từng giờ"),
      C("Dặn bố mẹ đừng xem tin nữa", { trust: { npc: p!, delta: -0.1 } })], 0, { npc: p! });
  }),
];

/* ================================================================ TIẾP VIÊN HÀNG KHÔNG */
/* Cờ: cab_by_the_book / cab_pleaser (b1) · cab_purser / cab_union (b2) · cab_hidden_fear / cab_therapy / cab_ground_job (b3)
 *     cab_manager / cab_contract_won / cab_trainer / cab_first_class / cab_school (b4). Bộ đếm: cab_rep. */
const FLIGHT_ATTENDANT: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PF, "cab_t_calm", [8, 14], () => true, () => T("Người giữ bình tĩnh trên xe đêm", "Trên chuyến xe khách đêm, bà cụ ngồi cạnh bạn ngất đi. Người lớn la hét, tài xế không dừng được giữa cầu. Bạn quạt cho bà, rót nước vào nắp chai, nói chuyện với đứa cháu đang khóc của bà cho đến khi xe vào trạm.", [
    C("Xin học ngoại ngữ và một lớp sơ cứu", { money: -0.03, know: 2, flags: [talentFlag(PF)], counters: { talents_seen: 1 } }, "Tốn tiền nhà, học cách chăm người lạ"),
    C("Kể lại cho bạn bè như một chuyện lạ", { happy: 1, counters: { talents_seen: 1 } })], 0)),
  talent(PF, "cab_t_routes", [12, 16], () => true, () => T("Bản đồ đường bay trên tường", "Bạn chưa từng đi máy bay, nhưng dán kín tường bản đồ đường bay cắt từ tạp chí cũ. Bạn thuộc mã của sáu mươi sân bay và biết giờ địa phương ở từng nơi mà không cần nhìn đồng hồ.", [
    C("Học tiếng Anh mỗi tối bằng phim không phụ đề", { bw: -2, know: 3, flags: [talentFlag(PF)], counters: { talents_seen: 1 } }, "Mất giấc ngủ, có thêm một đôi cánh"),
    C("Gỡ bản đồ xuống, lo ôn thi", { know: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PF, "cab_d_open_day", [19, 28], () => true, () => T("Ngày tuyển tiếp viên", "Ba trăm ứng viên xếp hàng trong sảnh khách sạn từ sáu giờ sáng. Có thước đo chiều cao, bài bơi hai mươi lăm mét, phỏng vấn bằng tiếng Anh, và ba phút giữ nụ cười khi một giám khảo giả làm khách quát vào mặt. Hãng lấy mười hai người.", [
    C("Đi thi, học cấp tốc ba tháng trước đó", { counters: { doors_seen: 1 }, money: -0.05, gamble: { p: 0.4, win: { ...become(PF), log: "Bạn nhận thư mời vào khóa huấn luyện tám tuần." }, lose: { happy: -3, know: 2, log: "Bạn trượt vòng phỏng vấn. Giám khảo nói giọng bạn còn run." } } }, "Tốn tiền học, may thì vào"),
    C("Nộp đơn vào hãng giá rẻ, dễ đỗ hơn", { counters: { doors_seen: 1 }, gamble: { p: 0.7, win: { ...become(PF), income_mult: 0.85, flags: ["cab_budget"], log: "Hãng giá rẻ nhận bạn. Lương thấp hơn, mỗi ngày bốn chặng." }, lose: { happy: -2, log: "Bạn không qua bài bơi." } } }, "Dễ vào, lương thấp, bay nhiều"),
    C("Ở nhà, không đi thi", { counters: { doors_seen: 1 } })], 0)),
  door(PF, "cab_d_abroad", [19, 28], () => true, () => T("Hãng bay ở xứ người", "Một hãng bay ở một nước giàu, cách nhà bạn tám giờ bay, tuyển tiếp viên từ ba mươi nước. Lương miễn thuế gấp ba lương trong nước, ở ký túc xá của hãng, có giờ giới nghiêm, ra vào bằng thẻ từ.", [
    C("Đi, sống ở căn cứ nước ngoài", { ...become(PF), counters: { doors_seen: 1 }, flags: ["cab_abroad"], rel: -3 }, "Lương cao, xa nhà, luật hãng khắt khe"),
    C("Ở lại, chờ hãng trong nước tuyển", { counters: { doors_seen: 1 }, happy: -1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PF, 1, 1, (c) => T("Vị khách ghế 2A", "Chuyến đêm mười một tiếng, hai trăm tám mươi khách. Vị khách ghế 2A đã uống bốn ly, đòi thêm, và quát vào mặt bạn trước cả khoang thương gia. Tiếp viên trưởng nhìn bạn: “Chuyện của em.”", [
    C("Từ chối rót thêm, ghi vào báo cáo chuyến bay", { counters: step(c, PF), flags: ["cab_by_the_book"], gamble: { p: 0.6, win: { log: "Ông ta ngủ thiếp đi trước giờ ăn sáng. Tiếp viên trưởng gật đầu với bạn." }, lose: { happy: -3, log: "Ông ta là khách thẻ hạng cao nhất. Tuần sau bạn bị gọi lên phòng chăm sóc khách hàng." } } }, "Đúng luật, có thể mất lòng hãng"),
    C("Rót thêm, mỉm cười cho êm chuyến", { counters: step(c, PF), flags: ["cab_pleaser"], happy: -2, money: 0.01 }, "Chuyến bay êm, bạn nuốt giận")], 0), adult),
  beat(PF, 2, 3, (c) => T("Danh sách chữ ký", `Hãng mở đợt xét lên tiếp viên trưởng. Cùng tuần, công đoàn tiếp viên đi xin chữ ký phản đối lịch bay mười bốn tiếng không có giường nghỉ. Ai cũng biết người được đề bạt sẽ là người không ký.${f(c, "cab_by_the_book") ? " Báo cáo về vị khách ghế 2A vẫn nằm trong hồ sơ của bạn." : f(c, "cab_pleaser") ? " Hồ sơ của bạn có sáu lá thư khen của khách hạng thương gia." : ""}`, [
    C("Không ký, nhận đề bạt", { counters: step(c, PF), income_mult: 1.3, rel: -2, flags: ["cab_purser"] }, "Lên chức, mất lòng đồng nghiệp"),
    C("Ký tên, đứng cùng công đoàn", { counters: step(c, PF), rel: 3, flags: ["cab_union"] }, "Chậm thăng tiến, có người đứng sau lưng"),
    C("Mang số liệu mệt mỏi lên gặp ban giám đốc", { counters: step(c, PF), agency: 0.03, gamble: { p: 0.4, win: { income_mult: 1.2, flags: ["cab_purser", "cab_union"], log: "Hãng thêm giường nghỉ trên các chặng dài. Bạn vẫn được đề bạt." }, lose: { income_mult: 0.9, flags: ["cab_union"], log: "Bạn bị chuyển sang chặng ngắn, bốn lượt một ngày." } } }, "Lựa chọn thứ ba: đổi luật thay vì chọn phe", { tier: "sovereign" })], 0), adult),
  beat(PF, 3, 4, (c) => T("Khói trong khoang", `Bốn mươi phút sau khi cất cánh, khói bốc lên từ khoang hành lý phía sau. Máy bay hạ cánh khẩn ở một sân bay nhỏ, cả khoang phải thoát trong chín mươi giây.${f(c, "cab_purser") ? " Bạn là người chỉ huy khoang." : ""} Mọi người ra ngoài an toàn. Ba tuần sau, mỗi lần cửa khoang đóng lại, tay bạn run.`, [
    C("Bay lại ngay, giấu chuyện run tay", { counters: step(c, PF), flags: ["cab_hidden_fear"], health: -4, money: 0.04 }, "Giữ chỗ, mang theo nỗi sợ"),
    C("Nhận trị liệu sáu tháng, mất phụ cấp bay", { counters: step(c, PF), money: -0.15, health: 5, flags: ["cab_therapy"] }, "Mất tiền, lành thật"),
    C("Xin xuống làm việc dưới mặt đất", { counters: step(c, PF), ...leave(PF), flags: ["cab_ground_job"], happy: 2 }, "Bình yên, mất bầu trời")], 0), adult),
  beat(PF, 4, 5, (c) => {
    if (f(c, "cab_hidden_fear")) return T("Hai mươi giây đứng im", "Máy bay qua vùng nhiễu động mạnh, đèn khoang tắt một nhịp. Bạn đứng im giữa lối đi hai mươi giây, không nghe thấy gì. Một đồng nghiệp kéo bạn vào ghế và làm hết phần việc của bạn. Báo cáo chuyến bay phải nộp trước nửa đêm.", [
      C("Tự khai hết với hãng, xin điều trị", { counters: step(c, PF), unflags: ["cab_hidden_fear"], flags: ["cab_therapy"], income_mult: 0.8, health: 4 }, "Mất phụ cấp, có thể mất chặng dài"),
      C("Nhờ đồng nghiệp viết báo cáo khác đi", { counters: step(c, PF), money: 0.03, secret: { tag: "FORGED_PAPERS", severity: 0.35, fuse_years: [2, 8], note: "báo cáo chuyến bay viết lại để giấu cơn hoảng" } }, "Giữ chỗ, kéo thêm một người vào bí mật"),
      C("Nộp đơn nghỉ việc", { counters: step(c, PF), ...leave(PF), happy: -2 }, "Hết sợ, hết nghề")], 0);
    if (f(c, "cab_union")) return T("Bàn đàm phán hợp đồng", "Công đoàn chọn bạn ngồi bàn đàm phán hợp đồng mới. Giữa buổi, giám đốc nhân sự mời bạn ra hành lang: hãng cần một trưởng phòng tiếp viên, và người đó không thể ngồi ở phía bên kia bàn.", [
      C("Nhận ghế trưởng phòng", { counters: step(c, PF), income_mult: 1.4, rel: -4, unflags: ["cab_union"], flags: ["cab_manager"] }, "Lương cao, đồng nghiệp gọi bạn là kẻ bỏ đi"),
      C("Ở lại bàn đàm phán đến cùng", { counters: step(c, PF), gamble: { p: 0.5, win: { income_mult: 1.1, rel: 5, flags: ["cab_contract_won"], log: "Hợp đồng mới có mười hai giờ nghỉ sau mỗi chặng dài và giường cho tổ bay." }, lose: { income_mult: 0.8, log: "Hãng thuê tiếp viên qua công ty cung ứng. Bạn bị xếp toàn chặng đêm." } } }, "Có thể đổi luật cho cả nghề, có thể bị trù")], 1);
    return T("Lời mời từ trung tâm huấn luyện", `${f(c, "cab_purser") ? "Mười năm làm tiếp viên trưởng" : "Mười năm trên các chặng bay"}, bạn thuộc lòng mọi loại máy bay của hãng. Trung tâm huấn luyện mời bạn về dạy tân binh. Cùng tháng, một hãng lớn hơn mời bạn sang phục vụ khoang hạng nhất trên các chặng xuyên lục địa.`, [
      C("Về trung tâm huấn luyện, thôi bay", { counters: step(c, PF), income_mult: 1.05, health: 3, flags: ["cab_trainer"] }, "Lương vừa, tối nào cũng ngủ ở nhà"),
      C("Sang hãng lớn, bay khoang hạng nhất", { counters: step(c, PF), income_mult: 1.4, rel: -4, health: -2, flags: ["cab_first_class"] }, "Đỉnh nghề, xa nhà hơn"),
      C("Lấy tiền dành dụm mở trường dạy nghề tiếp viên", { counters: step(c, PF), money: -0.5, agency: 0.02, flags: ["cab_school"] }, "Vốn lớn, thành người làm ra nghề", { tier: "awakened" })], 0);
  }, adult),
  beat(PF, 5, 6, (c) => {
    const echo = (f(c, "cab_contract_won") ? " Những tiếp viên trẻ trên chuyến này được ngủ trên giường nghỉ nhờ bản hợp đồng năm ấy." : "") + (f(c, "cab_trainer") || f(c, "cab_school") ? " Ba người trong tổ bay là học trò của bạn." : "") + (f(c, "cab_manager") ? " Vài đồng nghiệp cũ vẫn không ký vào tấm thiệp." : "");
    return T("Chặng bay cuối cùng", `Chặng cuối của bạn trước khi rời đường bay. Tổ bay giấu một tấm thiệp ký kín tên trong khoang bếp.${echo} Hãng mời bạn ở lại làm cố vấn an toàn khoang, bán thời gian.`, [
      C("Nói lời chào qua loa phát thanh, rồi về hẳn", { counters: step(c, PF), happy: 4, rel: 2, flags: ["cab_farewell"] }, "Một phút cho mình, rồi buông hẳn"),
      C("Nhận làm cố vấn an toàn khoang", { counters: step(c, PF), income_mult: 0.9, know: 2, flags: ["cab_advisor"] }, "Còn trong nghề, không còn bay"),
      C("Viết lại sổ tay xử lý tình huống cho tân binh", { counters: step(c, PF), bw: -3, flags: ["cab_passed_on"] }, "Tốn công, để lại kinh nghiệm", { tier: "awakened" })], 0);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PF, "cab_jetlag", [19, 60], 6, (c) => T("Ba giờ sáng ở khách sạn sân bay", vary("cbj", c.age, ["Bạn thức dậy lúc ba giờ sáng trong một phòng khách sạn và mất gần một phút mới nhớ ra mình đang ở thành phố nào.", "Tuần này bạn đi qua năm múi giờ. Một đồng nghiệp đưa bạn vỉ thuốc ngủ, bảo cả tổ ai cũng dùng."]), [
    C("Uống thuốc ngủ đồng nghiệp đưa", { bw: 3, health: -2, counters: { cab_pills: 1 } }, "Ngủ được hôm nay, quen thuốc về sau"),
    C("Dậy chạy bộ, chịu mất ngủ", { bw: -3, health: 1, counters: { exercise: 1 } }, "Mệt hôm nay, khỏe về sau")], 0)),
  daily(PF, "cab_parcel", [19, 55], 9, () => T("Gói quà nhờ mang hộ", "Ở sân bay, một người tự giới thiệu là bạn của một đồng nghiệp cũ, nhờ bạn mang một gói quà nhỏ đến thành phố bạn sắp quá cảnh. Tiền công bằng một tháng lương. Gói quà được dán kín.", [
    C("Từ chối, không mang đồ của người lạ", { counters: { honest: 1 }, flags: ["cab_refused_parcel"] }, "Mất một tháng lương, ngủ yên"),
    C("Nhận, không hỏi gì", { money: 0.08, gamble: { p: 0.7, win: { log: "Một người đàn ông nhận gói quà ở sảnh khách sạn, không nói một lời." }, lose: { income_mult: 0.6, health: -3, flags: ["cab_detained"], log: "Hải quan giữ bạn chín tiếng. Bạn không biết trong gói có gì; hãng đình chỉ bạn trong lúc điều tra." } } }, "Một tháng lương, đặt cược cả nghề"),
    C("Báo cho an ninh sân bay", { bw: -3, flags: ["cab_reported_parcel"], gamble: { p: 0.8, win: { log: "Người kia biến mất khỏi sảnh trước khi an ninh đến." }, lose: { happy: -3, log: "Mấy tháng sau, có người nhắn tin đe dọa bạn qua mạng xã hội." } } }, "Đúng việc, có thể bị để ý")], 0)),
  daily(PF, "cab_doctor", [19, 60], 8, () => T("Có ai là bác sĩ không?", "Giữa đại dương, một hành khách sáu mươi tuổi ôm ngực, vã mồ hôi. Trên máy bay không có bác sĩ. Cơ trưởng hỏi ý bạn: hạ cánh khẩn ở sân bay gần nhất sẽ tốn của hãng một khoản rất lớn và làm ba trăm người lỡ chuyến nối.", [
    C("Đề nghị hạ cánh khẩn", { counters: { cab_rep: 1 }, gamble: { p: 0.6, win: { happy: 4, log: "Xe cấp cứu đón ông ở chân cầu thang máy bay. Ông qua khỏi." }, lose: { happy: -2, log: "Ở bệnh viện, bác sĩ nói chỉ là cơn đau dạ dày. Hãng gửi bạn bản báo cáo chi phí." } } }, "Có thể cứu người, có thể tốn của hãng vô ích"),
    C("Cho thở oxy, theo dõi, bay tiếp", { money: 0.01, gamble: { p: 0.75, win: { log: "Ông đỡ dần, xuống máy bay tự đi được." }, lose: { happy: -8, flags: ["cab_lost_passenger"], log: "Ông lịm đi hai mươi phút trước khi hạ cánh. Bạn ngồi cạnh ông đến cuối chuyến." } } }, "Đúng lịch, đặt cược vào may")], 1)),
  daily(PF, "cab_weigh_in", [19, 50], 9, () => T("Kỳ cân định kỳ", "Hãng cân tiếp viên mỗi quý. Bạn nặng hơn mức trong hồ sơ ba cân và nhận thư cảnh cáo: hai tháng nữa không về được thì bị rút khỏi các chặng quốc tế.", [
    C("Ăn kiêng gắt hai tháng", { health: -3, happy: -2, counters: { cab_diet: 1 } }, "Giữ chặng bay, cơ thể trả giá"),
    C("Ký đơn phản đối cùng đồng nghiệp", { agency: 0.01, flags: ["cab_petition"], gamble: { p: 0.4, win: { log: "Hãng bỏ quy định cân, chỉ giữ bài kiểm tra sức khỏe." }, lose: { income_mult: 0.9, log: "Bạn bị chuyển sang chặng nội địa. Những người ký tên khác cũng vậy." } } }, "Có thể đổi luật, có thể mất chặng", { tier: "awakened" }),
    C("Chấp nhận bay chặng nội địa", { income_mult: 0.9, happy: 1 }, "Ít phụ cấp, ăn uống tự do")], 0)),
  daily(PF, "cab_layover", [19, 60], 6, (c) => T("Hai ngày ở thành phố lạ", vary("cbl", c.age, ["Chặng dài, hai ngày nghỉ ở một thành phố bạn chưa từng đến. Cả tổ rủ nhau đi khu mua sắm hàng hiệu.", "Lần thứ mười bạn nghỉ ở thành phố này, và bạn vẫn chưa ra khỏi bán kính một cây số quanh khách sạn."]), [
    C("Đi cùng cả tổ bay", { money: -0.04, rel: 2, counters: { cab_crew_bond: 1 } }, "Tốn tiền, có bạn"),
    C("Đi một mình đến những chỗ không có trong sách", { know: 2, happy: 2, flags: ["seen_world"] }, "Lạc một chút, nhớ cả đời"),
    C("Ngủ bù trong phòng", { health: 2 })], 2)),
  daily(PF, "cab_patron", [22, 50], 99, () => T("Lời mời từ khách hạng nhất", "Một vị khách quen hạng nhất, chủ một tập đoàn, mời bạn về làm tiếp viên riêng trên máy bay của ông. Lương gấp đôi, lịch bay theo ý ông, có thể bị gọi đi bất cứ giờ nào.", [
    C("Nhận, rời hãng bay", { income_mult: 1.5, rel: -3, happy: -2, flags: ["cab_private_crew"] }, "Lương gấp đôi, đời phụ thuộc vào một người"),
    C("Từ chối, ở lại hãng", { counters: { cab_rep: 1 } }, "Lương như cũ, lịch là của bạn")], 1)),
  daily(PF, "cab_seats", [19, 60], 8, () => T("Gia đình muốn ngồi cạnh nhau", "Một gia đình năm người bị xếp ghế rời nhau. Họ đòi bạn bắt những hành khách khác đổi chỗ. Không ai muốn đổi, và máy bay đã muộn mười lăm phút.", [
    C("Thuyết phục từng người, đổi bằng phiếu đồ ăn", { bw: -2, money: -0.01, counters: { cab_rep: 1 } }, "Muộn thêm, cả khoang vui"),
    C("Giữ đúng sơ đồ ghế", { gamble: { p: 0.6, win: { log: "Gia đình ấy ngủ suốt chuyến, không ai nhắc lại." }, lose: { happy: -2, counters: { cab_complaints: 1 }, log: "Họ quay video, đăng lên mạng kèm tên hãng và tên bạn." } } }, "Đúng giờ, có thể thành clip")], 1)),
  daily(PF, "cab_trolley", [19, 60], 8, () => T("Xe đẩy giữa vùng nhiễu động", "Đèn thắt dây an toàn bật giữa giờ phát bữa tối. Tiếp viên trưởng bảo cố phát nốt dãy cuối, vì hãng chấm điểm theo tốc độ phục vụ. Xe đẩy nặng tám mươi cân.", [
    C("Dừng phục vụ, về ghế ngồi", { happy: -1, counters: { cab_safety: 1 } }, "Khách cằn nhằn, điểm phục vụ thấp"),
    C("Phát nốt cho kịp", { gamble: { p: 0.8, win: { money: 0.01, log: "Bạn phát xong dãy cuối trước khi máy bay rung mạnh." }, lose: { health: -6, flags: ["cab_injured"], log: "Xe đẩy trượt về phía bạn. Bạn trật khớp vai, nghỉ bay hai tháng." } } }, "Đúng chỉ tiêu, cược bằng bờ vai")], 1)),
  daily(PF, "cab_cockpit", [20, 30], 99, () => T("Buồng lái mở cửa", "Một cơ trưởng sắp nghỉ hưu thấy bạn hỏi mãi về đồng hồ nhiên liệu. Ông bảo hãng đang mở chương trình đào tạo phi công cho nhân viên: học bốn năm, hãng trả học phí, đổi lại bảy năm không được nghỉ việc.", [
    C("Thi vào chương trình học lái", { bw: -5, gamble: { p: 0.35, win: { custom: "become:pilot", unflags: [life(PF)], flags: ["cab_to_pilot"], log: "Bạn đỗ vòng cuối. Bộ đồng phục tiếp viên được trả về kho." }, lose: { happy: -3, know: 3, log: "Bạn trượt bài kiểm tra phản xạ, nhưng thuộc thêm nửa buồng lái." } } }, "Bảy năm ràng buộc, đổi lấy một đời khác"),
    C("Cảm ơn ông, ở lại khoang khách", { happy: 1 })], 1)),
  daily(PF, "cab_ground", [26, 60], 99, () => T("Quầy thủ tục mặt đất", "Sân bay tuyển trưởng ca quầy làm thủ tục. Lương thấp hơn một phần ba, nhưng tối nào cũng về nhà, không lệch múi giờ, không ai cân bạn mỗi quý.", [
    C("Nộp đơn, rời đường bay", { ...leave(PF), flags: ["ex_cabin_crew"] }, "Ngủ ở nhà, thu nhập giảm"),
    C("Ở lại trên trời thêm vài năm", { happy: 1, health: -1 })], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(PF, "cab_family", [20, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_alive > 0 && k) return T("Sinh nhật trên chín nghìn mét", `${N(k)} hỏi vì sao ba lần sinh nhật liền bạn đều ở trên trời. Lịch bay tháng sau lại rơi đúng ngày ấy.`, [
      C("Đổi ca, trả bằng hai chặng đêm", { health: -2, trust: { npc: k, delta: 0.2 } }, "Có mặt, mệt gấp đôi"),
      C("Mang quà từ một thành phố xa về", { money: -0.02, trust: { npc: k, delta: 0.03 } }, "Con có quà, vẫn thiếu bạn"),
      C("Xin chuyển sang chặng ngắn, tối nào cũng về", { income_mult: 0.8, trust: { npc: k, delta: 0.25 } }, "Mất phụ cấp chặng dài, được bữa tối", { tier: "awakened" })], 2, { npc: k });
    return T("Chiếc vé cho người chưa từng bay", `Hãng tặng mỗi tiếp viên một vé cho người thân. ${N(p!)} chưa từng đi máy bay${c.country === "VN" ? ", cả đời chỉ đi xe khách về quê ăn Tết" : ", cả đời chưa ra khỏi biên giới"}.`, [
      C(`Đưa ${N(p!)} bay chuyến đầu đời`, { money: -0.02, happy: 3, trust: { npc: p!, delta: 0.3 } }, "Mất ngày nghỉ, có một tấm ảnh để đời"),
      C("Để dành vé cho kỳ nghỉ của mình", { happy: 1, trust: { npc: p!, delta: -0.05 } })], 0, { npc: p! });
  }),
];

/* ================================================================ LÁI TÀU */
/* Cờ: trn_covered_mentor / trn_straight / trn_shift_deal (b1) · trn_flagship / trn_freight / trn_union (b2)
 *     trn_slowed / trn_derail / trn_whistle (b3) · trn_testified / trn_took_blame / trn_spokesperson / trn_inaugural (b4). Bộ đếm: trn_safety. */
const TRAIN_DRIVER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PR, "trn_t_timetable", [8, 14], () => true, () => T("Đứa trẻ thuộc giờ tàu", "Nhà bạn cách đường sắt một bờ rào. Bạn thuộc giờ từng chuyến, nghe tiếng là biết tàu khách hay tàu hàng, đếm toa không sai một toa. Bác gác đường ngang bảo bạn có cái tai của người lái tàu.", [
    C("Mượn sách về đầu máy, tự vẽ sơ đồ", { know: 3, bw: -1, flags: [talentFlag(PR)], counters: { talents_seen: 1 } }, "Bớt giờ chơi, thành người hiểu máy"),
    C("Chỉ ngồi xem tàu cho vui", { happy: 1, counters: { talents_seen: 1 } })], 0)),
  talent(PR, "trn_t_pump", [12, 16], () => true, () => T("Chiếc máy bơm của cả khu", "Mùa hè, chiếc máy bơm nước của cả khu hỏng. Bạn tháo nó ra trên tấm bạt, ba ngày tay đen dầu, lắp lại thừa đúng một con ốc. Nó chạy, và chạy đến tận bây giờ.", [
    C("Xin học trường kỹ thuật thay vì trường thường", { know: 2, happy: -1, flags: [talentFlag(PR)], counters: { talents_seen: 1 } }, "Rẽ khỏi đường đại học, vào nghề máy"),
    C("Coi như một chuyện mùa hè", { happy: 1, counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PR, "trn_d_school", [20, 33], () => true, () => T("Ngành đường sắt tuyển phụ lái", "Ngành đường sắt tuyển phụ lái tàu: khám mắt, đo phản xạ, hai năm vừa học vừa chạy tàu hàng đêm. Lương khởi điểm thấp, nhưng năm nào nghề này cũng thiếu người hơn năm trước.", [
    C("Nộp đơn, chạy tàu hàng đêm từ năm đầu", { ...become(PR), counters: { doors_seen: 1 }, health: -2, money: -0.03 }, "Vào nghề ngay, đổi bằng những đêm thức trắng"),
    C("Học hết khóa lý thuyết rồi mới lên đầu máy", { counters: { doors_seen: 1 }, money: -0.1, gamble: { p: 0.6, win: { ...become(PR), know: 3, flags: ["trn_certified"], log: "Bạn qua kỳ sát hạch với điểm cao nhất khóa." }, lose: { happy: -3, log: "Bạn trượt bài đo phản xạ, phải chờ kỳ sau." } } }, "Chậm hai năm, vào nghề vững hơn"),
    C("Giữ việc đang làm", { counters: { doors_seen: 1 } })], 0)),
  door(PR, "trn_d_metro", [20, 35], () => true, (c) => T("Tuyến tàu điện mới tuyển người lái", `${c.poor_country ? "Thành phố khánh thành tuyến tàu điện đầu tiên" : "Thành phố mở thêm một tuyến tàu điện ngầm"} và tuyển người lái: làm theo ca, phần lớn thời gian dưới lòng đất, có hợp đồng công đoàn, lương đều hơn mọi việc bạn từng làm.`, [
    C("Nhận, lái tàu dưới lòng đất", { ...become(PR), counters: { doors_seen: 1 }, flags: ["trn_metro"] }, "Lương đều, sống theo ca, ít thấy trời"),
    C("Ở lại việc cũ", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PR, 1, 1, (c) => T("Người thầy ngủ gật", "Ca đêm đầu tiên, bạn ngồi ghế phụ cạnh một bác lái tàu ba mươi năm trong nghề. Qua đoạn đồng bằng dài, bác bảo bạn bấm nút cảnh giác mỗi khi nó kêu, rồi ngả đầu ngủ. Bác dạy nghề giỏi nhất ga đầu mối, và sắp nghỉ hưu.", [
    C("Bấm hộ, giữ im lặng", { counters: step(c, PR, { trn_safety: -1 }), flags: ["trn_covered_mentor"] }, "Được bác dạy hết nghề, giữ một bí mật"),
    C("Đánh thức bác, nói thẳng", { counters: step(c, PR, { trn_safety: 1 }), flags: ["trn_straight"], happy: -2 }, "Đúng luật, bác lạnh nhạt với bạn cả năm"),
    C("Đề nghị chia ca: một người ngủ ở ga, một người lái", { counters: step(c, PR, { trn_safety: 1 }), flags: ["trn_shift_deal"], gamble: { p: 0.5, win: { log: "Bác nhìn bạn rất lâu rồi gật đầu. Từ đó cả tổ chia ca theo cách ấy." }, lose: { happy: -2, log: "Bác cười khẩy: “Lịch là của công ty, không phải của cậu.”" } } }, "Lựa chọn thứ ba: đổi cách làm thay vì chọn phe", { tier: "sovereign" })], 0), adult),
  beat(PR, 2, 3, (c) => {
    const past = f(c, "trn_straight") ? " Bác lái tàu năm ấy, trước khi nghỉ hưu, vẫn ký giấy giới thiệu cho bạn." : f(c, "trn_covered_mentor") ? " Bác lái tàu năm ấy đã dạy bạn mọi mẹo của nghề, kể cả những mẹo không có trong sách." : "";
    const fast = c.poor_country ? "tuyến liên vận sang nước láng giềng phải học thêm luật và tiếng của họ" : "tuyến cao tốc mới phải học lại một năm ở thành phố khác";
    return T("Đầu máy của riêng bạn", `Bạn được giao lái chính.${past} Ba tuyến đang cần người: ${fast}, tuyến tàu hàng đường dài trả gấp rưỡi, và tuyến địa phương nơi ban an toàn của công đoàn đang thiếu người.`, [
      C(c.poor_country ? "Học lái tàu liên vận" : "Học lái tàu cao tốc", { counters: step(c, PR), money: -0.1, income_mult: 1.3, rel: -2, flags: ["trn_flagship"] }, "Lên đời nghề, xa nhà một năm"),
      C("Nhận tuyến tàu hàng đường dài", { counters: step(c, PR), income_mult: 1.45, health: -3, flags: ["trn_freight"] }, "Tiền nhiều, đêm nhiều"),
      C("Ở tuyến địa phương, vào ban an toàn", { counters: step(c, PR, { trn_safety: 1 }), income_mult: 1.05, agency: 0.02, flags: ["trn_union"] }, "Lựa chọn thứ ba: ít tiền, có tiếng nói", { tier: "sovereign" })], 0);
  }, adult),
  beat(PR, 3, 4, (c) => {
    const load = f(c, "trn_freight") ? "hai nghìn tấn hàng, trong đó có sáu toa hóa chất" : f(c, "trn_flagship") ? "bốn trăm hành khách ở tốc độ cao nhất của tuyến" : "ba trăm người đi làm buổi sáng";
    return T("Đoạn ray qua cầu sông", `Ba chuyến liền, bạn thấy đoàn tàu rung lạ ở đoạn ray qua cầu sông. Bạn báo lên. Điều độ trả lời: tuần sau đội sửa mới đến, cứ chạy đúng tốc độ, chạy chậm là bị phạt trễ giờ. Sáng mai bạn chở ${load}.`, [
      C("Tự giảm tốc mỗi lần qua cầu, chịu phạt", { counters: step(c, PR, { trn_safety: 1 }), income_mult: 0.92, flags: ["trn_slowed"] }, "Mất thưởng, ngủ yên"),
      C("Chạy đúng lệnh điều độ", { counters: step(c, PR), gamble: { p: 0.75, win: { money: 0.03, log: "Đội sửa đến sau chín ngày, thay ba thanh ray nứt. Không ai biết đã suýt có chuyện." }, lose: { health: -6, flags: ["trn_derail"], log: "Hai toa cuối trật bánh ở đầu cầu. Không ai chết. Người ta hỏi bạn đã biết từ bao giờ." } } }, "Giữ lệnh, đặt cược vào may"),
      C("Từ chối lái, báo thanh tra đường sắt", { counters: step(c, PR, { trn_safety: 1 }), agency: 0.02, flags: ["trn_whistle"], gamble: { p: 0.5, win: { log: "Thanh tra đóng cầu ba tuần để sửa. Cả năm sau, không ai ở công ty chào bạn." }, lose: { income_mult: 0.8, log: "Bạn bị chuyển sang lái tàu dồn trong bãi ga, lương giảm." } } }, "Đúng việc, có thể mất tuyến", { tier: "awakened" }),
      C("Nghỉ việc, không lái qua cây cầu ấy nữa", { counters: step(c, PR), ...leave(PR), flags: ["ex_train_driver"] }, "Giữ lương tâm, mất nghề")], 1);
  }, adult),
  beat(PR, 4, 5, (c) => {
    if (f(c, "trn_derail")) return T("Hội đồng điều tra vụ trật bánh", `Hội đồng điều tra vụ trật bánh mời bạn lên làm việc. Luật sư của công ty gợi ý: nếu bạn khai mình chạy quá tốc độ, công ty sẽ lo cho bạn một khoản và một chỗ ngồi văn phòng. Nhật ký điều độ năm ấy vẫn còn${f(c, "trn_covered_mentor") ? ", và ai cũng biết bạn từng bấm nút cảnh giác hộ người khác" : ""}.`, [
      C("Khai hết, kể cả lệnh của điều độ", { counters: step(c, PR), agency: 0.02, flags: ["trn_testified"], gamble: { p: 0.55, win: { counters: { trn_safety: 2 }, log: "Hội đồng kết luận lỗi ở khâu bảo trì. Công ty bị phạt, bạn được trở lại buồng lái." }, lose: { ...leave(PR), log: "Công ty chứng minh bạn chạy quá tốc độ hai cây số giờ. Bạn bị thu bằng lái tàu." } } }, "Sự thật, có thể mất nghề", { tier: "sovereign" }),
      C("Nhận lỗi về mình, đổi lấy khoản hỗ trợ", { counters: step(c, PR), ...leave(PR), money: 0.6, happy: -5, flags: ["trn_took_blame"] }, "Có tiền, mất nghề, mang tiếng một mình"),
      C("Im lặng, chờ hội đồng kết luận", { counters: step(c, PR), income_mult: 0.85, happy: -2 }, "Không hứa gì với ai, lương bị treo")], 0);
    if (f(c, "trn_union") || f(c, "trn_whistle")) return T("Tổng đình công đường sắt", `Công đoàn kêu gọi đình công toàn ngành, đòi ngân sách thay ray cũ. Họ chọn bạn đứng trước máy quay, ${f(c, "trn_whistle") ? "vì bạn là người từng không chịu chạy qua cây cầu ấy" : "vì bạn ngồi ban an toàn lâu nhất"}. Bộ giao thông tuyên bố đình công là trái luật.`, [
      C("Đứng ra phát ngôn trên truyền hình", { counters: step(c, PR), agency: 0.03, flags: ["trn_spokesperson"], gamble: { p: 0.5, win: { income_mult: 1.1, rel: 4, log: "Sau mười hai ngày, chính phủ duyệt ngân sách thay ray cho ba tuyến cũ nhất." }, lose: { income_mult: 0.8, log: "Đình công bị tuyên bố trái luật. Bạn mất một năm thâm niên và mọi khoản thưởng." } } }, "Có thể đổi cả ngành, có thể mất thâm niên"),
      C("Đình công, nhưng đứng ở hàng sau", { counters: step(c, PR), rel: 2, income_mult: 0.95 }, "An toàn hơn, không ai nhớ tên bạn"),
      C("Rút khỏi công đoàn, nhận chức trưởng tổ lái", { counters: step(c, PR), income_mult: 1.25, rel: -4, unflags: ["trn_union"], flags: ["trn_foreman"] }, "Lên chức, đồng nghiệp quay lưng")], 0);
    return T("Chuyến tàu khánh thành", `${f(c, "trn_flagship") ? "Tuyến mới nối hai thủ đô" : "Tuyến đường sắt mới lên vùng cao"} sắp khánh thành. Công ty chọn bạn lái chuyến đầu tiên: có quan chức, có máy quay, ảnh bạn sẽ lên trang nhất. Bác tổ trưởng sắp nghỉ hưu cũng ao ước chuyến ấy cả đời.`, [
      C("Nhận, lái chuyến khánh thành", { counters: step(c, PR), income_mult: 1.2, happy: 4, flags: ["trn_inaugural"] }, "Vinh dự, và một người thầy buồn"),
      C("Nhường cho bác tổ trưởng", { counters: step(c, PR), rel: 4, flags: ["trn_gave_way"] }, "Mất tấm ảnh, được một người nhớ mãi"),
      C("Nhận chức trưởng đoàn lái, thôi ra tuyến", { counters: step(c, PR), income_mult: 1.3, happy: -2, flags: ["trn_manager"] }, "Lương cao, xa buồng lái")], 0);
  }, adult),
  beat(PR, 5, 6, (c) => {
    const past = f(c, "trn_covered_mentor") ? " Hồi mới vào nghề, bạn đã bấm nút hộ người thầy của mình." : f(c, "trn_straight") ? " Hồi mới vào nghề, bạn đã đánh thức người thầy của mình." : " Bạn nhớ ca đêm đầu tiên của chính mình.";
    return T("Cậu phụ lái ngủ gật", `Ca đêm, qua đoạn đồng bằng dài, cậu phụ lái hai mươi tư tuổi gục đầu ngủ: cậu đã làm ba ca liền vì công ty thiếu người.${past}${f(c, "trn_derail") ? " Bạn cũng nhớ hai toa cuối ở đầu cầu năm ấy." : ""}`, [
      C("Để cậu ngủ, lái một mình đến sáng", { counters: step(c, PR), health: -3, flags: ["trn_covered_young"] }, "Cậu ấy được nghỉ, luật thì bị bẻ"),
      C("Đánh thức cậu, kể chuyện cây cầu", { counters: step(c, PR), rel: 2, flags: ["trn_passed_on"] }, "Cậu ấy giận, rồi nhớ cả đời"),
      C("Báo lịch ba ca liền lên công đoàn", { counters: step(c, PR), agency: 0.02, flags: ["trn_reported_roster"], gamble: { p: 0.5, win: { log: "Công ty phải tuyển thêm mười hai phụ lái." }, lose: { happy: -2, log: "Báo cáo bị trả về với dòng chữ: chờ ngân sách." } } }, "Đổi luật cho người sau, mất lòng cấp trên", { tier: "awakened" })], 1);
  }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PR, "trn_crossing", [20, 65], 8, () => T("Xe kẹt trên đường ngang", "Một chiếc xe tải nhỏ chết máy giữa đường ngang, đèn cảnh báo ở đó hỏng từ tháng trước. Bạn kéo phanh khẩn từ xa, kéo còi liên tục. Đoàn tàu dừng cách thùng xe mười mét; hai hành khách ngã trầy tay. Báo cáo sự cố phải nộp trong ngày.", [
    C("Ghi rõ: đèn đường ngang hỏng đã một tháng", { happy: -1, counters: { trn_safety: 1 }, flags: ["trn_crossing_report"] }, "Đúng sự thật, đội bảo trì sẽ ghét bạn"),
    C("Viết như mọi vụ: lỗi của người lái xe", { money: 0.01, counters: { trn_safety: -1 } }, "Êm chuyện, đèn vẫn hỏng")], 1)),
  daily(PR, "trn_overtime", [20, 65], 6, (c) => T("Ca thứ ba liên tiếp", vary("trno", c.age, ["Công ty thiếu người lái. Tổ trưởng gọi lúc nửa đêm: thêm một ca nữa, trả gấp đôi. Bạn mới ngủ được bốn tiếng.", "Mùa lễ, tàu chạy thêm chuyến. Bạn đã lái mười một tiếng, và người thay ca báo ốm."]), [
    C("Nhận thêm ca", { money: 0.05, health: -3, counters: { trn_overtime: 1 } }, "Gấp đôi tiền, mắt díp lại sau tay phanh"),
    C("Từ chối, ghi giờ nghỉ vào sổ", { happy: -1, counters: { trn_safety: 1 } }, "Tổ trưởng nhớ tên bạn")], 0)),
  daily(PR, "trn_stowaways", [22, 65], 9, () => T("Tiếng gõ trong toa hàng kín", "Ở ga tránh, bạn nghe tiếng gõ từ bên trong một toa hàng kín. Bên trong là bảy người lớn, đã ở đó hai ngày. Họ xin bạn đừng gọi ai, chỉ cần qua được ga biên giới.", [
    C("Đi tiếp, đến ga sau mới báo cảnh sát", { money: 0.01, happy: -2, flags: ["trn_reported_stowaways"] }, "Đúng luật, đúng giờ, bảy gương mặt theo bạn lâu"),
    C("Dừng tàu ngay, gọi cấp cứu rồi mới báo", { money: -0.02, counters: { trn_safety: 1 }, flags: ["trn_called_medics"] }, "Trễ bốn mươi phút, bị phạt, họ được uống nước"),
    C("Mở cửa toa, đưa nước, giả như không thấy", { rel: 1, gamble: { p: 0.7, win: { happy: 2, log: "Ở ga sau, cửa toa đã mở sẵn. Không ai hỏi gì." }, lose: { income_mult: 0.85, flags: ["trn_disciplined"], log: "Camera ga quay được bạn. Bạn bị kỷ luật, cắt thưởng một năm." } } }, "Cứu người theo cách của mình, có thể mất thưởng", { tier: "awakened" })], 0)),
  daily(PR, "trn_driverless", [25, 65], 10, () => T("Tàu không người lái", "Công ty thử nghiệm tàu tự lái trên tuyến của bạn. Người lái được chọn: học lại làm giám sát ở trung tâm điều khiển, lương thấp hơn một phần năm, hoặc giữ ghế lái cho đến khi tuyến tự động hoàn toàn.", [
    C("Học lại làm giám sát từ xa", { know: 3, income_mult: 0.85, flags: ["trn_supervisor"] }, "Ít tiền hơn, còn việc lâu hơn"),
    C("Giữ ghế lái đến ngày cuối", { happy: 1, counters: { trn_last_drivers: 1 } }, "Giữ nghề, đến ngày nghề không còn"),
    C("Vận động giữ một người lái trên mỗi đoàn tàu", { agency: 0.01, flags: ["trn_union"], gamble: { p: 0.4, win: { log: "Luật mới bắt buộc mỗi đoàn tàu khách có một người trong buồng lái." }, lose: { log: "Bản kiến nghị được ghi nhận, rồi bị quên." } } }, "Có thể giữ nghề cho cả ngành, tốn công vô ích", { tier: "awakened" })], 1)),
  daily(PR, "trn_cattle", [20, 65], 8, (c) => { const a = c.country === "VN" ? "trâu" : "bò"; return T(`Đàn ${a} trên đường ray`, `Qua đoạn ven làng, một đàn ${a} thả rông đứng giữa đường ray. Bạn phanh không kịp; một con non chết. Người chủ chặn đầu tàu ở ga sau, đòi đền. Công ty nói lỗi là của ông.`, [
    C("Góp tiền riêng đền một nửa", { money: -0.03, rel: 2, flags: ["trn_paid_farmer"] }, "Mất tiền, làng bớt ghét đường tàu"),
    C("Để công ty giải quyết", { counters: { trn_village_grudge: 1 } }, "Đúng luật, lần sau qua làng có người ném đá")], 1); }),
  daily(PR, "trn_eyes", [30, 65], 10, () => T("Kỳ khám mắt định kỳ", "Kỳ khám sức khỏe định kỳ. Mắt trái của bạn kém đi, có thể không đạt chuẩn phân biệt màu tín hiệu. Bác sĩ khám là bạn học cũ, bảo có thể ký cho đạt, “năm sau đi mổ là xong”.", [
    C("Nhờ bạn ký cho đạt", { money: 0.02, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 8], note: "phiếu khám mắt ký khống cho người lái tàu" } }, "Giữ buồng lái, mang một bí mật"),
    C("Khai thật, xin nghỉ đi mổ", { money: -0.08, health: 3, counters: { honest: 1 } }, "Mất ba tháng lương, mắt sáng lại")], 1)),
  daily(PR, "trn_cab_visit", [22, 65], 8, () => T("Chiếc mũ lái tàu", "Một đứa bé đứng trên sân ga nhìn vào buồng lái không chớp mắt. Bố nó hỏi có thể cho cháu ngồi thử một phút trong lúc tàu đỗ không. Quy định cấm người lạ vào buồng lái.", [
    C("Cho bé ngồi một phút khi tàu đứng yên", { happy: 3, gamble: { p: 0.85, win: { counters: { kind: 1 }, log: "Bé đội chiếc mũ của bạn, to quá trùm cả mắt. Bố nó chụp lại." }, lose: { income_mult: 0.95, log: "Có người chụp ảnh gửi lên công ty. Bạn bị cắt thưởng một tháng." } } }, "Một kỷ niệm cho bé, có thể mất thưởng"),
    C("Từ chối, tặng bé tấm vé tham quan đầu máy", { money: -0.01, counters: { trn_safety: 1 } }, "Đúng luật, bé hơi buồn")], 1)),
  daily(PR, "trn_branch_line", [25, 70], 10, () => T("Tuyến tàu sắp bị đóng", "Ga xép lúc năm giờ sáng chỉ có một bà cụ chờ, như mọi ngày. Bà đi tàu của bạn lên thị trấn để chạy thận. Bộ vừa công bố sẽ đóng tuyến này vì lỗ.", [
    C("Ký kiến nghị, đi xin chữ ký đồng nghiệp", { rel: 2, bw: -2, agency: 0.01, flags: ["trn_petition"] }, "Mất ngày nghỉ, có thể giữ được tuyến"),
    C("Đứng ngoài chuyện chính sách", { happy: -1, counters: { trn_silent: 1 } }, "Yên thân, ga xép rồi cũng tắt đèn"),
    C("Viết lên mạng chuyện của bà cụ", { gamble: { p: 0.5, win: { rel: 3, flags: ["trn_line_saved"], log: "Bài viết lan khắp nơi. Tuyến được giữ thêm năm năm." }, lose: { income_mult: 0.95, log: "Công ty nhắc nhở bạn vì phát ngôn khi chưa được phép." } } }, "Có thể cứu tuyến, có thể bị kỷ luật")], 1)),
  daily(PR, "trn_roster", [22, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Tuyến ngày, tuyến đêm", `${N(r)} được xếp toàn tuyến ban ngày năm năm nay. Một đồng nghiệp ghé tai: ai muốn tuyến ngày thì gửi trưởng ga một phong bì mỗi quý.`, [
    C("Gửi phong bì", { money: -0.06, health: 3, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [3, 10], note: "phong bì xin tuyến ban ngày" } }, "Ngủ đêm ở nhà, mang một bí mật"),
    C("Khiếu nại cách xếp ca lên công đoàn", { gamble: { p: 0.45, win: { flags: ["trn_fair_roster"], memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "vụ khiếu nại xếp ca làm lộ chuyện phong bì" }, log: "Công ty chuyển sang xếp ca bằng phần mềm, công khai cho mọi người xem." }, lose: { happy: -3, log: "Bạn bị xếp toàn ca đêm thêm một năm nữa." } } }, "Có thể đổi luật, có thể bị trù", { tier: "sovereign" }),
    C("Thôi, tuyến đêm cũng là tuyến", { health: -1, counters: { honest: 1 } })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PR, "trn_quit", [28, 65], 99, () => T("Văn phòng kho vận", "Một người bạn cũ mở công ty kho vận, cần người điều phối xe. Giờ hành chính, cuối tuần ở nhà, lương tương đương. Tuần này bạn đã ngủ ban ngày sáu hôm.", [
    C("Nhận, rời buồng lái", { ...leave(PR), flags: ["ex_train_driver"] }, "Giờ giấc như mọi người, mất đường ray"),
    C("Ở lại với đầu máy", { happy: 1, health: -1 })], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(PR, "trn_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn lái tàu`, `${N(k)} nộp hồ sơ vào trường đường sắt mà không hỏi bạn. Con nói muốn ngồi đúng chiếc ghế bạn ngồi.`, [
      C("Ủng hộ, dạy con mọi thứ mình biết", { flags: ["trn_second_gen"], trust: { npc: k, delta: 0.25 } }, "Con theo nghề, mang theo cả cái giá của nó"),
      C("Khuyên con học kỹ sư, đừng ngồi buồng lái", { know: 1, trust: { npc: k, delta: -0.1 } }, "Con an toàn hơn, giận bạn một thời gian"),
      C("Kể hết cái giá của nghề, rồi để con chọn", { bw: -2, trust: { npc: k, delta: 0.15 } }, "Tốn nhiều buổi tối, con tự quyết", { tier: "awakened" })], 2, { npc: k });
    if (s) return T("Người ngủ ban ngày", `${N(s)} nói sống với bạn như sống với một cái bóng: bạn ngủ khi cả nhà thức, đi làm khi cả nhà ngủ.${c.country === "VN" ? " Ba năm liền bạn trực đêm giao thừa trên tàu." : ""}`, [
      C("Xin chuyển sang tuyến ban ngày, chịu giảm lương", { income_mult: 0.85, trust: { npc: s, delta: 0.25 } }, "Ít tiền, có bữa tối"),
      C("Hứa mỗi tuần ăn tối cùng nhau ba buổi", { promise: { to: s, what: "ăn tối cùng nhau ba buổi mỗi tuần", years: 1 }, trust: { npc: s, delta: 0.05 } }, "Hứa dễ, giữ khó"),
      C("Giữ ca đêm, tiền ca đêm nuôi cả nhà", { money: 0.05, trust: { npc: s, delta: -0.15 } })], 1, { npc: s });
    return T("Một người thân trên toa đầu", `${N(p!)} mua vé đi đúng chuyến bạn lái, ngồi toa đầu, không báo trước. Ở ga cuối, ${N(p!)} đứng chờ bên đầu máy.`, [
      C(`Đưa ${N(p!)} đi ăn ở quán cạnh ga`, { health: -1, trust: { npc: p!, delta: 0.25 } }, "Mất giấc ngủ trước ca sau"),
      C("Vội về ngủ, hẹn hôm khác", { health: 1, trust: { npc: p!, delta: -0.1 } })], 0, { npc: p! });
  }),
];

export const PACK_ROAD_B: Storylet[] = [
  ...TOUR_GUIDE,
  ...EXPLORER,
  ...FLIGHT_ATTENDANT,
  ...TRAIN_DRIVER,
];
