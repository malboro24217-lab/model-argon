/**
 * Gói MEDIA B: vlogger du lịch · đạo diễn phim · dân quảng cáo · phát thanh viên.
 * Mỗi con đường 19 thẻ: 1 năng khiếu · 2 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Bộ đếm riêng: vlg_reach / vlg_trust (độ phủ và lòng tin người xem), fdr_name (tên tuổi trong nghề),
 * adc_rep (uy tín nghề), rad_bond (sợi dây với thính giả). Các nhịp b3–b5 đọc lại cờ và bộ đếm này.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const VL = "vlogger";
const FD = "film_director";
const AD = "ad_creative";
const RV = "radio_voice";

/** Các nhịp b1–b4 chỉ mở cho người lớn (con đường nào ở đây cũng bắt đầu từ 18 tuổi). */
const adult = (c: FactContext): boolean => c.age >= 18;
const VN = (c: FactContext): boolean => c.country === "VN";
const lowMood = (c: FactContext): boolean => c.happy < 50 || c.broke;

/* =====================================================================
 * VLOGGER DU LỊCH — tiền tố vlg_
 * ===================================================================== */
const VLOGGER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(VL, "vlg_t_map", [10, 15], () => true, () => T("Tấm bản đồ dán tường", "Bạn dán tấm bản đồ thế giới lên tường, cắm ghim vào những nơi muốn đến. Cuối tuần, bạn mượn chiếc điện thoại cũ trong nhà quay con đường từ nhà đến trường và tự thuyết minh như phim tài liệu. Đoạn phim bốn phút, cả lớp xem đi xem lại.", [
    C("Quay tiếp mỗi cuối tuần", { flags: [talentFlag(VL)], counters: { talents_seen: 1 }, happy: 3, know: -2, money: -0.01 }, "Mất giờ học, mở một con đường"),
    C("Cất điện thoại, lo thi cử", { counters: { talents_seen: 1 }, know: 3 }, "Điểm tốt hơn, tấm bản đồ phai dần")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(VL, "vlg_d_viral", [18, 35], () => true, (c) => T("Ba phút trên chuyến xe đêm", `Bạn đăng một đoạn ba phút quay trên ${VN(c) ? "chuyến xe khách giường nằm" : "chuyến xe đêm"} qua đèo, nói chuyện với bác tài về ba mươi năm chạy tuyến. Sáng ra nó có bốn trăm nghìn lượt xem và hai nghìn người hỏi khi nào có tập sau. Tiền dành dụm của bạn đủ sống chừng một năm nếu ăn tiêu dè sẻn.`, [
    C("Nghỉ việc, đi một năm bằng tiền dành dụm", { ...become(VL), counters: { doors_seen: 1 }, money: -0.4, agency: 0.02 }, "Đốt hết tiết kiệm, đổi một năm tự do"),
    C("Giữ việc, quay vào ngày phép", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(VL), log: "Tập thứ năm vượt cả tập đầu. Một nhãn hàng ba lô gửi lời mời tài trợ." }, lose: { happy: -2, log: "Các tập sau chỉ được vài nghìn lượt xem. Người ta quên rất nhanh." } } }, "An toàn, ngọn lửa có thể tắt"),
    C("Xóa video, coi như một lần may", { counters: { doors_seen: 1 }, bw: 2 }, "Yên ổn, không bao giờ biết điều gì có thể đến")], 1)),
  door(VL, "vlg_d_hostel", [18, 35], () => true, () => T("Người khách cần phiên dịch", "Bạn làm lễ tân ở một nhà nghỉ cho khách đi bụi. Một người khách nước ngoài làm kênh du lịch cần người nói tiếng địa phương, thuộc đường, theo đoàn hai tháng. Họ trả bằng nửa lương hiện tại, nhưng hứa dạy bạn cầm máy và dựng phim.", [
    C("Đi theo, học nghề từ họ", { ...become(VL), counters: { doors_seen: 1 }, money: -0.05, know: 3 }, "Lương thấp, học được cả một nghề"),
    C("Giới thiệu người khác, giữ chỗ làm", { counters: { doors_seen: 1 }, money: 0.02 }, "Chắc chắn, cơ hội về tay người khác")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(VL, 1, 1, (c) => T("Ba lô chín ký", "Chuyến đi thật sự đầu tiên: ba mươi ngày, một ba lô chín ký, một máy quay và hai pin dự phòng. Đêm thứ ba trong nhà trọ, bạn xem hai kiểu kênh đang lên: kênh quay chậm để người địa phương tự kể, và kênh 'thử thách sống sót' với tiêu đề toàn chấm than. Bạn phải chọn giọng cho kênh của mình.", [
    C("Quay chậm, để người địa phương kể", { counters: step(c, VL, { vlg_trust: 1 }), flags: ["vlg_slow"], happy: 3 }, "Lên view chậm, giữ được giọng mình"),
    C("Làm thử thách mạo hiểm, tiêu đề giật", { counters: step(c, VL, { vlg_reach: 1 }), flags: ["vlg_clickbait"], health: -2, money: 0.04 }, "View nhanh, mỗi tập sau phải liều hơn")], 0), adult),
  beat(VL, 2, 3, (c) => T("Ngôi làng chưa có trên bản đồ", `Bạn lạc vào một ngôi làng sau thác nước, ba tiếng đi bộ từ đường lớn. Người trưởng làng mời bạn bữa cơm và nhờ đừng nói làng ở đâu. Hôm sau, một công ty lữ hành gọi: họ tài trợ cả năm nếu video có tọa độ và đường dẫn đặt tour.${(c.counters.vlg_reach ?? 0) >= 1 ? " Kênh của bạn giờ đủ lớn để một video kéo cả nghìn người tới." : ""}`, [
    C("Công khai địa điểm, nhận tài trợ", { counters: step(c, VL, { vlg_reach: 2 }), income_mult: 1.6, flags: ["vlg_revealed"] }, "Kênh lớn nhanh, làng đổi khác mãi mãi"),
    C("Giấu địa điểm, chỉ kể chuyện làng", { counters: step(c, VL, { vlg_trust: 1 }), income_mult: 1.1, flags: ["vlg_kept_secret"] }, "Ít tiền hơn, giữ lời với làng"),
    C("Bàn với làng: làng tự định số khách, chia tiền", { counters: step(c, VL), agency: 0.03, gamble: { p: 0.45, win: { income_mult: 1.4, flags: ["vlg_village_fund"], log: "Làng giới hạn ba mươi khách mỗi tuần. Hai phần mười tiền tài trợ về quỹ chung của làng." }, lose: { income_mult: 1.05, flags: ["vlg_kept_secret"], log: "Công ty rút lời mời. Làng vẫn mời bạn về dự lễ hội mùa." } } }, "Lựa chọn thứ ba: luật chơi do làng đặt", { tier: "sovereign" })], 0), adult),
  beat(VL, 3, 4, (c) => f(c, "vlg_clickbait")
    ? T("Cảnh dựng bị bóc", "Một người xem ghép ba video của bạn lại và chỉ ra cảnh 'lạc giữa rừng' được quay cách khách sạn hai trăm mét. Clip bóc phốt có hai triệu lượt xem trong một ngày. Nhà tài trợ lớn nhất gọi hỏi bạn định nói gì.", [
      C("Xin lỗi, đăng toàn bộ cảnh hậu trường", { counters: step(c, VL, { vlg_trust: 1 }), income_mult: 0.8, happy: -3, flags: ["vlg_owned_up"] }, "Mất tài trợ, giữ người xem thật"),
      C("Im lặng, ra video mới thật nhanh", { counters: step(c, VL), gamble: { p: 0.5, win: { counters: { vlg_reach: 1 }, log: "Hai tuần sau, người ta đã quên." }, lose: { income_mult: 0.5, flags: ["vlg_cancelled"], log: "Hai nhà tài trợ hủy hợp đồng trong cùng một tuần." } } }, "Có thể qua, có thể sập"),
      C("Đóng kênh, về đi làm", { counters: step(c, VL), ...leave(VL), flags: ["ex_vlogger"], happy: -2 }, "Hết bị soi, hết luôn con đường")], 0)
    : T("Hộ chiếu bị giữ", "Ở một thị trấn biên giới, cảnh sát giữ hộ chiếu và thẻ nhớ của bạn vì quay gần một khu cấm không có biển báo. Người phiên dịch nói có thể 'lo' cho nhanh. Đại sứ quán hẹn ba tuần, đúng lúc hợp đồng tài trợ đến hạn giao video.", [
      C("Chờ đại sứ quán, chịu mất hợp đồng", { counters: step(c, VL, { vlg_trust: 1 }), money: -0.2, income_mult: 0.85, flags: ["vlg_clean_border"] }, "Mất ba tuần và tiền, giữ mình sạch"),
      C("Đưa tiền cho người phiên dịch lo", { counters: step(c, VL), money: -0.1, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "đưa tiền chuộc hộ chiếu ở biên giới" } }, "Kịp hợp đồng, mang theo một bí mật"),
      C("Về nước, thôi đi xa", { counters: step(c, VL), ...leave(VL), flags: ["ex_vlogger"], health: 2 }, "An toàn, khép lại tấm bản đồ")], 0), adult),
  beat(VL, 4, 5, (c) => {
    const reach = c.counters.vlg_reach ?? 0;
    if (f(c, "vlg_revealed")) return T("Thác nước sau năm năm", `Ngôi làng bạn từng quay giờ có bốn mươi nhà nghỉ, một bãi đỗ xe và con suối đầy chai nhựa. Người trưởng làng năm xưa đã mất.${reach >= 3 ? " Kênh của bạn vừa vượt một triệu người theo dõi." : ""} Cùng tuần đó, cơ quan du lịch mời bạn nhận giải 'người lan tỏa điểm đến'.`, [
      C("Nhận giải, giữ các hợp đồng", { counters: step(c, VL), income_mult: 1.3, flags: ["vlg_award"] }, "Tiền và danh, còn nợ với làng"),
      C("Làm phim về cái giá của video mình", { counters: step(c, VL, { vlg_trust: 2 }), income_mult: 0.8, rel: 4, flags: ["vlg_reckoning"] }, "Mất tài trợ, trả được món nợ lương tâm", { tier: "awakened" }),
      C("Gỡ video cũ, giải nghệ", { counters: step(c, VL), ...leave(VL), flags: ["ex_vlogger"], happy: -3 }, "Thôi gây hại, cũng thôi có nghề")], 1);
    if (f(c, "vlg_village_fund")) return T("Quỹ làng tròn năm năm", "Quỹ chung với ngôi làng sau thác đã xây được hai lớp học và một trạm y tế nhỏ. Một nền tảng phim lớn muốn mua cả định dạng kênh: họ cử đoàn làm phim, bạn chỉ cần đứng dẫn. Làng hỏi họ có giữ luật ba mươi khách mỗi tuần không.", [
      C("Bán định dạng, đứng dẫn cho họ", { counters: step(c, VL), money: 1.2, income_mult: 1.2, flags: ["vlg_sold_format"] }, "Một khoản lớn, luật làng thành chữ nhỏ"),
      C("Giữ kênh nhỏ, dạy trẻ trong làng cầm máy", { counters: step(c, VL, { vlg_trust: 1 }), income_mult: 0.9, happy: 5, agency: 0.02, flags: ["vlg_teach_village"] }, "Ít tiền, làng tự kể chuyện của mình", { tier: "sovereign" })], 1);
    return T("Lời mua lại kênh", `${reach >= 2 ? "Kênh của bạn có tám trăm nghìn người theo dõi." : "Kênh của bạn không lớn, nhưng người xem ở lại rất lâu."} Một công ty truyền thông muốn mua lại kênh: một khoản tiền lớn, đổi lại họ quyết lịch quay, nhà tài trợ và cả tiêu đề. Bạn đã sống trên đường gần mười năm.`, [
      C("Bán kênh, làm người dẫn ăn lương", { counters: step(c, VL), money: reach >= 2 ? 1.5 : 0.6, income_mult: 1.2, flags: ["vlg_sold_channel"] }, "Một lần đổi đời, mất quyền kể chuyện"),
      C("Giữ kênh, đi chậm lại", { counters: step(c, VL, { vlg_trust: 1 }), income_mult: 0.9, happy: 4 }, "Ít tiền, kênh vẫn là của mình"),
      C("Thôi đi, mở nhà nghỉ cho khách đi bụi", { counters: step(c, VL), ...leave(VL), money: -0.5, flags: ["ex_vlogger", "vlg_hostel"] }, "Bỏ vốn, đổi đường dài lấy một mái nhà")], 1);
  }, adult),
  beat(VL, 5, 6, (c) => T("Tấm bản đồ kín ghim", `Một cô bé mười lăm tuổi nhắn cho bạn: em bắt đầu quay phim vì xem video đầu tiên của bạn. ${f(c, "vlg_reckoning") ? "Em nói bộ phim về ngôi làng sau thác làm em thề không bao giờ đăng tọa độ." : f(c, "vlg_revealed") ? "Em hỏi bạn có hối hận về ngôi làng sau thác không." : f(c, "vlg_teach_village") ? "Em là một trong những đứa trẻ ở làng sau thác từng học cầm máy với bạn." : "Em muốn biết làm sao để đi một mình mà không sợ."} Tấm bản đồ trên tường nhà bạn giờ đã kín ghim.`, [
    C("Trao lại kênh cho người trẻ", { counters: step(c, VL), flags: ["passed_on"], income_mult: 0.7, happy: 4 }, "Mất thu nhập, câu chuyện đi tiếp"),
    C("Viết sách về những nơi không nên đến", { counters: step(c, VL), money: 0.25, know: 3 }, "Một khoản nhỏ, một lời khuyên ngược nghề"),
    C("Đi tiếp, đến khi chân còn đi được", { counters: step(c, VL), health: -4, happy: 5 }, "Sống trọn nghề, cơ thể trả giá")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(VL, "vlg_hotel", [18, 65], 6, (c) => T("Phòng hướng biển miễn phí", vary("vlgh", c.age, [
    "Một khu nghỉ dưỡng mời bạn ở ba đêm miễn phí, đổi lấy một video. Phòng đẹp, nhưng bãi biển trước mặt ngập rác sau mùa mưa.",
    "Một khách sạn mới mời bạn đến 'trải nghiệm'. Hợp đồng có một dòng: không được nhắc tới công trình đang khoan cọc ngay bên cạnh."]), [
    C("Quay đúng những góc họ muốn", { money: 0.04, counters: { vlg_trust: -1 } }, "Tiền dễ, người xem bớt tin"),
    C("Quay cả cái xấu, tự trả tiền phòng", { money: -0.03, counters: { vlg_trust: 1 }, flags: ["vlg_honest_review"] }, "Mất bạn hàng, thêm người tin")], 0)),
  daily(VL, "vlg_drone", [18, 65], 8, () => T("Máy bay quay phim ở hải quan", "Hải quan giữ chiếc máy bay quay phim không người lái của bạn: ở nước này phải xin phép trước, và bạn không biết. Phí giữ đồ tính theo ngày. Chuyến bay tiếp theo cất cánh sau hai tiếng.", [
    C("Bỏ lại máy, đi cho kịp lịch", { money: -0.06, flags: ["vlg_lost_drone"] }, "Mất đồ nghề, giữ được lịch"),
    C("Đổi vé, làm giấy phép cho đúng", { money: -0.04, bw: -4, know: 2, counters: { vlg_trust: 1 } }, "Mất hai ngày, học luật từng nước")], 1)),
  daily(VL, "vlg_cliff", [18, 55], 8, (c) => T("Mép vách đá ba trăm mét", vary("vlgc", c.age, [
    "Ở điểm ngắm cảnh nổi tiếng, ai cũng trèo qua rào chắn để có tấm hình đứng mép vực. Biển cảnh báo ghi năm ngoái có bốn người rơi.",
    "Người xem đòi bạn bơi qua một hồ nước băng như một kênh khác đã làm. Bình luận được thích nhiều nhất: 'Không dám thì đừng làm du lịch.'"]), [
    C("Làm, cho tấm ảnh bìa", { counters: { vlg_reach: 1 }, gamble: { p: 0.85, win: { money: 0.03, log: "Tấm ảnh bìa đẹp nhất năm. Tim bạn vẫn đập mạnh mỗi lần nhìn lại." }, lose: { health: -12, money: -0.2, log: "Bạn trượt chân. Ba tuần bó bột ở một bệnh viện xa nhà." } } }, "Thêm view, cược bằng cơ thể"),
    C("Quay cảnh người khác liều, nói về rào chắn", { counters: { vlg_trust: 1 }, know: 1 }, "Ít kịch tính, có thể giúp ai đó dừng lại")], 1)),
  daily(VL, "vlg_slum", [18, 65], 8, () => T("Tour khu nghèo ven sông", "Một người dẫn tour mời bạn quay khu nhà lụp xụp ven sông: 'khán giả thích cảnh này lắm'. Trẻ con chạy theo máy quay. Trong khu, chưa ai được hỏi có muốn lên hình không.", [
    C("Quay theo lối người dẫn tour", { counters: { vlg_reach: 1 }, money: 0.03, happy: -2 }, "View cao, bạn biết mình đang lấy gì"),
    C("Trả tiền một người trong khu tự dẫn và kể", { money: -0.03, counters: { vlg_trust: 1 }, flags: ["vlg_local_voice"], rel: 2 }, "Tốn tiền, câu chuyện là của họ", { tier: "awakened" }),
    C("Không quay", { happy: 1 }, "Sạch tay, mất một tập")], 1)),
  daily(VL, "vlg_ill", [18, 65], 8, (c) => T("Sốt cao ở xứ người", vary("vlgi", c.age, [
    "Bạn sốt bốn mươi độ trong một nhà trọ cách bệnh viện gần nhất năm tiếng xe. Bảo hiểm du lịch hết hạn tuần trước, bạn quên gia hạn.",
    "Bạn ngộ độc nước ở một thị trấn núi, nằm ba ngày không dậy nổi. Phòng khám tư gần đó đòi đặt cọc trước."]), [
    C("Thuê xe đi bệnh viện lớn ngay", { money: -0.12, health: 3, flags: ["vlg_insured_after"] }, "Tốn tiền lớn, an toàn"),
    C("Nằm nghỉ, tự chữa bằng thuốc mang theo", { counters: { vlg_ill: 1 }, gamble: { p: 0.6, win: { health: -2, log: "Ba ngày sau bạn dậy được, gầy rộc." }, lose: { health: -10, money: -0.15, log: "Sang ngày thứ tư bạn phải đi cấp cứu, nặng hơn nhiều." } } }, "Tiết kiệm, cược bằng sức khỏe"),
    C("Nhờ người xem ở vùng đó giúp", { counters: { vlg_trust: 1 }, gamble: { p: 0.7, win: { health: 2, log: "Một gia đình người xem chở bạn đi viện lúc nửa đêm." }, lose: { happy: -3, log: "Tin nhắn bị chụp lại, người ta bảo bạn câu view bằng bệnh." } } }, "Dựa vào cộng đồng, lộ chỗ yếu")], 0)),
  daily(VL, "vlg_rival", [20, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Kênh đi trước một bước", `${N(r)} làm kênh du lịch lớn hơn bạn, và ba tháng nay luôn đến đúng những nơi bạn vừa đăng, quay đúng góc máy của bạn.`, [
    C("Đăng video so sánh hai kênh", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "video so sánh hai kênh du lịch" }, counters: { vlg_reach: 1 } }, "Thêm view, thêm một kẻ thù"),
    C("Mời đi chung một chặng", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chặng quay chung xuyên biên giới" }, counters: { vlg_reach: 1 }, log: "Hai kênh đổi khán giả cho nhau. Tập quay chung được xem nhiều nhất năm." }, lose: { happy: -2, log: "Họ nhận lời, rồi đăng trước và cắt hết phần của bạn." } } }, "Có thể có đồng minh, có thể bị lợi dụng", { tier: "awakened" }),
    C("Đổi tuyến, đi những nơi họ không đến", { know: 2, money: -0.03, flags: ["vlg_own_route"] }, "Tốn công dò đường, thoát cuộc đua")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(VL, "vlg_fixer", [20, 65], 9, () => T("Người dẫn đường không có tên", "Video được xem nhiều nhất của bạn có công lớn của một người lái xe địa phương: anh tìm đường, xin phép từng nhà, chọn cả góc máy. Anh nhắn hỏi có thể ghi tên mình dưới video không, và kể con anh sắp vào đại học.", [
    C("Ghi tên anh, chia một phần doanh thu", { money: -0.06, counters: { vlg_trust: 1 }, flags: ["vlg_shares_credit"], rel: 2 }, "Bớt tiền, trả đúng công người khác"),
    C("Ghi tên, gửi một khoản cảm ơn", { money: -0.02, counters: { vlg_trust: 1 } }, "Vừa phải, chưa hẳn công bằng"),
    C("Không trả lời", { money: 0.01, counters: { vlg_trust: -1 } }, "Giữ tiền, mất một người dẫn đường")], 0)),
  daily(VL, "vlg_visa", [18, 65], 9, (c) => T("Đơn thị thực bị từ chối", c.poor_country
    ? "Đơn xin thị thực lần thứ ba của bạn bị từ chối, không ghi lý do. Với hộ chiếu nước bạn, gần như nơi nào cũng phải xin trước. Một văn phòng nhỏ hứa 'lo được' với giá bằng hai tháng thu nhập."
    : "Nước bạn định đến quay bỗng đổi luật: người làm nội dung phải có thị thực báo chí, xét trong ba tháng. Một văn phòng nhỏ hứa 'lo được' trong một tuần.", [
    C("Trả tiền cho văn phòng 'lo được'", { money: -0.15, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [1, 6], note: "giấy tờ nhập cảnh do văn phòng lo" } }, "Kịp chuyến đi, giấy tờ không sạch"),
    C("Đổi tuyến sang nước láng giềng", { happy: -2, know: 2, counters: { vlg_trust: 1 } }, "Mất kế hoạch, giữ hồ sơ sạch"),
    C("Làm hồ sơ lại từ đầu, chờ", { bw: -4, money: -0.03, gamble: { p: 0.5, win: { flags: ["vlg_press_visa"], log: "Lần này được duyệt, kèm thị thực nhiều lần." }, lose: { happy: -3, log: "Lại bị từ chối. Bạn dán tờ giấy lên tường, cạnh tấm bản đồ." } } }, "Mất thời gian, có thể mở được cửa")], 1)),
  daily(VL, "vlg_upload", [20, 65], 8, (c) => T("Năm mươi hai tập mỗi năm", vary("vlgu", c.age, [
    "Thuật toán thưởng cho kênh đăng đều mỗi tuần. Ba tháng nay bạn không có ngày nào không cầm máy, và bắt đầu thấy mọi cảnh đẹp đều giống nhau.",
    "Bạn giật mình nhận ra mình chỉ còn nhìn núi qua màn hình máy quay. Lượt xem tuần này giảm một phần ba."]), [
    C("Nghỉ ba tháng, không đăng gì", { income_mult: 0.9, happy: 5, bw: 6, flags: ["vlg_break"] }, "Kênh tụt, bạn sống lại"),
    C("Thuê người dựng, chia lợi nhuận", { money: -0.08, bw: 4, counters: { vlg_reach: 1 } }, "Đỡ mệt, mất một phần thu nhập"),
    C("Cắn răng đăng tiếp", { health: -3, happy: -3, money: 0.04, counters: { vlg_reach: 1 } }, "Giữ thuật toán, mất niềm vui")], 0)),
  daily(VL, "vlg_quit", [26, 65], 99, () => T("Căn phòng có cửa sổ", "Một công ty lữ hành mời bạn về làm trưởng phòng nội dung: lương tháng đều, có bảo hiểm, đêm nào cũng ngủ trên giường của mình. Quai ba lô của bạn đã sờn.", [
    C("Nhận, treo ba lô lên tường", { ...leave(VL), flags: ["ex_vlogger"], money: 0.05 }, "Ổn định, thôi lên đường"),
    C("Đi tiếp", { happy: 2, counters: { vlg_trust: 1 } }, "Tự do, túi vẫn mỏng")], 1), lowMood),

  /* ---------- gia đình ---------- */
  cross(VL, "vlg_home", [22, 65], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse");
    if (c.married && s) return T("Mười tháng xa nhà", `${N(s)} nói đã quen ăn cơm một mình, và chính điều đó làm ${N(s)} sợ hơn cả cãi nhau. Năm nay bạn ở nhà tổng cộng bảy mươi ngày.`, [
      C("Đưa cả nhà đi cùng một mùa", { money: -0.12, bw: -3, trust: { npc: s, delta: 0.25 } }, "Tốn kém, kênh chậm lại, có nhau"),
      C("Hứa năm sau chỉ đi nửa năm", { income_mult: 0.85, trust: { npc: s, delta: 0.1 }, promise: { to: s, what: "chỉ đi quay nửa năm", years: 1 } }, "Giữ được nhà nếu giữ được lời", { tier: "awakened" }),
      C("Giải thích rằng đây là nghề", { money: 0.04, trust: { npc: s, delta: -0.2 } }, "Giữ thu nhập, khoảng cách lớn thêm")], 1, { npc: s });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Xem con qua màn hình", `${N(p)} xem mọi video của bạn, bình luận bằng một tài khoản đặt tên lạ. Lần gọi gần nhất, ${N(p)} hỏi: "Bao giờ con quay một tập ở nhà?"`, [
      C("Về quay một tập ở nhà, có cả bố mẹ", { money: -0.03, trust: { npc: p, delta: 0.3 }, gamble: { p: 0.5, win: { counters: { vlg_reach: 1 }, log: `Tập về nhà được xem nhiều hơn mọi chuyến đi xa. ${N(p)} đọc từng bình luận.` }, lose: { log: "Tập đó ít người xem, nhưng bạn giữ bản gốc." } } }, "Lỡ một chuyến, có một tập không đổi được"),
      C("Hứa sẽ về, rồi đi tiếp", { money: 0.03, trust: { npc: p, delta: -0.15 } }, "Giữ lịch, hứa thêm một lần nữa")], 0, { npc: p });
  }),
];

/* =====================================================================
 * ĐẠO DIỄN PHIM — tiền tố fdr_
 * ===================================================================== */
const DIRECTOR: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(FD, "fdr_t_clay", [9, 16], () => true, () => T("Phim bằng đất nặn", "Bạn nặn mười hai nhân vật bằng đất, chụp từng khung hình bằng chiếc điện thoại cũ, mất ba tuần cho bốn phút phim. Cô giáo chiếu nó cho cả khối xem. Một bạn khóc ở đoạn cuối.", [
    C("Dành tiền tiêu vặt mua một chân máy", { money: -0.02, flags: [talentFlag(FD)], counters: { talents_seen: 1 }, know: -1, happy: 4 }, "Mất giờ học và tiền tiêu vặt"),
    C("Cất đất nặn, ôn thi chuyển cấp", { counters: { talents_seen: 1 }, know: 3 }, "Điểm tốt, bộ phim thứ hai không ra đời")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FD, "fdr_d_crew", [22, 40], () => true, () => T("Bốn mươi ngày trên phim trường", "Một đoàn phim về quay ở thành phố bạn cần người chạy việc: mười sáu tiếng mỗi ngày, ngủ trên xe, cả bốn mươi ngày được trả bằng nửa tháng lương hiện tại. Đạo diễn là người bạn đã xem phim từ hồi đi học.", [
    C("Xin nghỉ việc, theo đoàn", { ...become(FD), counters: { doors_seen: 1 }, money: -0.08, health: -2 }, "Mất việc ổn định, bước được vào nghề"),
    C("Chỉ theo đoàn vào cuối tuần", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(FD), log: "Đạo diễn nhớ tên bạn, gọi bạn làm trợ lý cho phim sau." }, lose: { happy: -2, log: "Đoàn quay xong, không ai nhớ người chỉ đến ngày cuối tuần." } } }, "Giữ việc, khó được ai nhớ"),
    C("Thôi", { counters: { doors_seen: 1 }, money: 0.02 }, "Ổn định, phim vẫn chỉ ở trên màn hình")], 0)),
  door(FD, "fdr_d_short", [22, 45], () => true, () => T("Phim ngắn làm trong ngày nghỉ", "Bộ phim ngắn mười lăm phút bạn quay trong sáu ngày nghỉ phép được chọn vào một liên hoan phim khu vực. Một nhà sản xuất muốn phát triển nó thành phim dài, nhưng cần bạn làm toàn thời gian và tự góp một phần vốn.", [
    C("Vay tiền góp vốn, bỏ việc làm phim", { custom: `borrow:0.5|become:${FD}`, counters: { doors_seen: 1 }, agency: 0.02 }, "Nợ nửa năm thu nhập, có phim đầu tay"),
    C("Bán quyền kịch bản, giữ việc", { counters: { doors_seen: 1 }, money: 0.15, flags: ["fdr_sold_script"] }, "Có tiền, phim thành của người khác")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(FD, 1, 1, (c) => T("Ngày quay đầu tiên", "Đoàn mười hai người, một máy quay thuê theo ngày, trời mưa từ năm giờ sáng. Chủ ngôi nhà cho mượn làm bối cảnh đòi thêm tiền đúng lúc đèn vừa dựng xong. Cả đoàn quay sang nhìn bạn.", [
    C("Trả thêm, quay đúng kịch bản", { counters: step(c, FD), money: -0.06, flags: ["fdr_by_the_book"] }, "Tốn tiền, phim đúng như đã viết"),
    C("Kéo cảnh ra ngoài mưa, viết lại tại chỗ", { counters: step(c, FD), flags: ["fdr_improviser"], gamble: { p: 0.5, win: { counters: { fdr_name: 1 }, log: "Cảnh trong mưa thành cảnh người ta nhớ nhất phim." }, lose: { happy: -3, money: -0.03, log: "Máy quay ướt, mất nửa ngày, đoàn làm thêm giờ không lương." } } }, "Liều, có thể hay hơn cả kịch bản")], 0), adult),
  beat(FD, 2, 3, (c) => T("Tiền có điều kiện", `Kịch bản phim dài của bạn có người muốn đầu tư trọn gói. Điều kiện: cháu của nhà đầu tư đóng vai chính, kết phim phải có hậu, và bốn cảnh có sản phẩm của nhà tài trợ.${f(c, "fdr_sold_script") ? " Lần trước bạn đã bán một kịch bản; lần này bạn không định bán nữa." : ""}`, [
    C("Nhận, làm phim lớn đầu tay", { counters: step(c, FD, { fdr_name: 1 }), income_mult: 1.5, flags: ["fdr_studio"] }, "Phim lớn, không còn hẳn là phim của bạn"),
    C("Làm phim nhỏ bằng tiền tự xoay", { counters: step(c, FD), money: -0.3, flags: ["fdr_indie"] }, "Nghèo, giữ trọn bộ phim"),
    C("Để cả đoàn góp công lấy phần trăm", { counters: step(c, FD), agency: 0.03, gamble: { p: 0.45, win: { income_mult: 1.2, flags: ["fdr_crew_coop", "fdr_indie"], log: "Mười chín người ký nhận phần trăm thay cho lương. Không ai bỏ ngang." }, lose: { money: -0.15, flags: ["fdr_indie"], log: "Nửa đoàn cần lương ngay tháng này. Bạn làm phim nhỏ hơn dự định." } } }, "Lựa chọn thứ ba: phim là của cả đoàn", { tier: "sovereign" })], 0), adult),
  beat(FD, 3, 4, (c) => f(c, "fdr_studio")
    ? T("Bản dựng sau lưng bạn", "Nhà sản xuất cho dựng lại phim khi bạn đi vắng: cắt hai mươi hai phút, chèn thêm một bài hát, đổi cả cái kết. Tên bạn vẫn to nhất trên áp phích. Còn hai tuần nữa là phim ra rạp.", [
      C("Rút tên khỏi phim", { counters: step(c, FD), income_mult: 0.7, agency: 0.02, flags: ["fdr_name_off"] }, "Mất phim và tiền, giữ được tên mình"),
      C("Im lặng, nhận đủ thù lao", { counters: step(c, FD), money: 0.3, happy: -5, flags: ["fdr_swallowed"] }, "Có tiền, có một phim không phải của mình"),
      C("Đăng bản gốc lên mạng, bất chấp hợp đồng", { counters: step(c, FD), gamble: { p: 0.4, win: { counters: { fdr_name: 2 }, flags: ["fdr_directors_cut"], log: "Bản gốc lan khắp nơi. Khán giả đòi rạp chiếu bản của bạn." }, lose: { money: -0.6, ...leave(FD), flags: ["fdr_blacklisted"], log: "Nhà sản xuất kiện. Không hãng nào dám thuê bạn nữa." } } }, "Có thể thắng lớn, có thể mất nghề")], 0)
    : T("Hết tiền giữa phim", `Phim quay được hai phần ba thì hết tiền. Đoàn đã hai tháng chưa nhận lương${f(c, "fdr_crew_coop") ? ", dù họ từng ký nhận phần trăm thay lương" : ""}. Máy quay thuê phải trả trong năm ngày. Còn mười một cảnh chưa quay.`, [
      C("Vay thêm để quay nốt", { counters: step(c, FD), custom: "borrow:0.6", flags: ["fdr_film_debt"] }, "Phim xong, nợ nặng vai"),
      C("Viết lại, ráp thành một phim ngắn hơn", { counters: step(c, FD), income_mult: 0.9, know: 3, flags: ["fdr_cut_down"] }, "Giữ được đoàn, phim nhỏ lại"),
      C("Dừng phim, bán đồ trả lương, bỏ nghề", { counters: step(c, FD), ...leave(FD), money: -0.3, rel: 3, flags: ["ex_director"] }, "Trả sạch nợ người, khép lại giấc mơ")], 1), adult),
  beat(FD, 4, 5, (c) => {
    const name = c.counters.fdr_name ?? 0;
    if (f(c, "fdr_name_off") || f(c, "fdr_swallowed")) return T("Giải thưởng của bản dựng kia", `Bản phim bị dựng lại đoạt giải phim hay nhất trong nước. Nhà sản xuất lên nhận giải, cảm ơn 'tầm nhìn của cả ê-kíp'.${f(c, "fdr_name_off") ? " Tên bạn không còn trên phim." : ""} Một nhà báo nhắn hỏi bạn có muốn kể lại không.`, [
      C("Kể lại toàn bộ với nhà báo", { counters: step(c, FD), gamble: { p: 0.5, win: { counters: { fdr_name: 2 }, income_mult: 1.3, log: "Bài báo được dẫn lại khắp nơi. Hai hãng phim gọi cho bạn." }, lose: { income_mult: 0.7, flags: ["fdr_difficult"], log: "Người ta gọi bạn là kẻ cay cú. Các cuộc hẹn sau bị hủy." } } }, "Đòi lại phim, có thể mang tiếng khó chơi"),
      C("Im lặng, làm phim tiếp theo", { counters: step(c, FD), income_mult: 1.1, happy: -2 }, "Yên ổn, chuyện cũ không ai biết"),
      C("Rời nghề, mở một rạp chiếu phim nhỏ", { counters: step(c, FD), ...leave(FD), money: -0.4, happy: 3, flags: ["ex_director", "fdr_cinema"] }, "Bỏ vốn, thôi làm phim, vẫn ở cạnh phim")], 1);
    if (name >= 2 || f(c, "fdr_crew_coop") || f(c, "fdr_directors_cut")) return T("Thảm đỏ ở nước ngoài", `Phim của bạn được chọn tranh giải ở một liên hoan phim quốc tế${f(c, "fdr_film_debt") ? ", trong khi khoản nợ làm phim vẫn chưa trả xong" : ""}. Một nền tảng chiếu phim toàn cầu muốn mua quyền phát hành khắp thế giới, với điều kiện cắt mười lăm phút cho 'dễ xem'.`, [
      C("Bán toàn bộ quyền, cắt theo yêu cầu", { counters: step(c, FD, { fdr_name: 1 }), money: 1.5, income_mult: 1.4, flags: ["fdr_global_deal"] }, "Đổi đời, phim bị gọt"),
      C("Giữ bản gốc, phát hành ở rạp nhỏ", { counters: step(c, FD, { fdr_name: 1 }), money: 0.2, happy: 5 }, "Ít tiền, phim đúng như bạn muốn"),
      C("Bán có thời hạn năm năm, giữ bản gốc", { counters: step(c, FD), agency: 0.02, gamble: { p: 0.45, win: { money: 0.9, income_mult: 1.3, flags: ["fdr_kept_rights"], log: "Họ đồng ý. Năm năm sau, phim về lại tay bạn." }, lose: { money: 0.2, log: "Họ chọn một phim khác. Phim của bạn ra rạp nhỏ." } } }, "Lựa chọn thứ ba: cho thuê, không bán đứt", { tier: "sovereign" })], 1);
    return T("Rạp ba trăm ghế, mười bảy khán giả", `Buổi chiếu đầu tiên của phim thứ ba có mười bảy khán giả trong rạp ba trăm ghế.${f(c, "fdr_film_debt") ? " Chủ nợ ngồi ở hàng ghế đầu." : ""} Nhà đầu tư rút khỏi dự án tiếp theo. Một công ty quảng cáo mời bạn đạo diễn phim quảng cáo, thù lao gấp ba.`, [
      C("Nhận làm phim quảng cáo để trả nợ", { counters: step(c, FD), income_mult: 1.3, happy: -2, flags: ["fdr_ads"] }, "Có tiền, xa dần phim của mình"),
      C("Bán nhà, làm thêm một phim nữa", { counters: step(c, FD), money: -0.8, flags: ["fdr_all_in"], gamble: { p: 0.35, win: { counters: { fdr_name: 2 }, money: 1.0, log: "Phim thứ tư được khán giả tìm đến nhờ truyền miệng." }, lose: { happy: -6, log: "Phim thứ tư cũng không ai xem. Bạn chuyển sang ở nhà thuê." } } }, "Cược hết, có thể là phim của đời mình"),
      C("Rời nghề, làm việc khác", { counters: step(c, FD), ...leave(FD), health: 2, flags: ["ex_director"] }, "Bình yên, gác máy quay")], 0);
  }, adult),
  beat(FD, 5, 6, (c) => T("Phim đầu tay của người khác", `Một đạo diễn trẻ xin bạn đứng tên sản xuất phim đầu tay của cô ấy. Kịch bản kể về một đạo diễn già thỏa hiệp cả đời${f(c, "fdr_swallowed") ? ", và bạn nhận ra mình trong từng trang" : f(c, "fdr_name_off") ? "; cô ấy nói đã xem bản gốc mà bạn giữ lại" : f(c, "fdr_global_deal") ? "; cô ấy hỏi thẳng mười lăm phút bị cắt năm xưa đã đi đâu" : ""}. Trong ngăn kéo của bạn vẫn còn kịch bản viết dở từ hai mươi năm trước.`, [
    C("Sản xuất phim cho cô ấy, không sửa chữ nào", { counters: step(c, FD), money: -0.3, happy: 4, flags: ["passed_on"] }, "Bỏ tiền và tên tuổi cho người trẻ"),
    C("Dồn sức làm phim cuối của mình", { counters: step(c, FD), money: -0.4, health: -3, gamble: { p: 0.5, win: { happy: 8, log: "Phim cuối của bạn được chiếu trong một rạp kín chỗ." }, lose: { happy: 2, log: "Phim không mấy ai chú ý, nhưng nó đã xong." } } }, "Cạn sức, khép lại đúng ý mình"),
    C("Viết hồi ký về nghề", { counters: step(c, FD), money: 0.2, know: 3 }, "Một khoản nhỏ, kể lại cho người sau")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(FD, "fdr_stunt", [22, 70], 8, () => T("Cảnh quay trên mái nhà", "Cảnh rượt đuổi trên mái nhà phải quay xong trước khi trời tối. Thiết bị an toàn thuê theo ngày đã hết hạn từ trưa. Diễn viên đóng thế nói 'em làm được', nhưng tay đang run.", [
    C("Hoãn một ngày, thuê lại thiết bị", { money: -0.06, flags: ["fdr_safe_set"] }, "Vượt ngân sách, không ai bị thương"),
    C("Quay luôn cho kịp", { gamble: { p: 0.75, win: { money: 0.03, log: "Cảnh quay xong trong một lần. Không ai nhắc lại lúc đó." }, lose: { happy: -8, money: -0.2, flags: ["fdr_set_injury"], log: "Diễn viên đóng thế ngã, gãy hai xương sườn. Cảnh vẫn nằm trong phim." } } }, "Kịp lịch, cược sự an toàn của người khác")], 0)),
  daily(FD, "fdr_star", [22, 70], 7, (c) => T("Ngôi sao đến muộn", vary("fdrs", c.age, [
    "Nam chính đến phim trường muộn bốn tiếng, ngày thứ ba liên tiếp. Sáu mươi người ngồi chờ, tiền thuê bối cảnh tính theo giờ.",
    "Nữ chính đòi sửa thoại của mọi bạn diễn để vai mình nổi hơn. Người quản lý của cô gọi cho nhà sản xuất trước khi gọi cho bạn."]), [
    C("Nói thẳng trước cả đoàn", { counters: { fdr_name: 1 }, gamble: { p: 0.5, win: { log: "Hôm sau họ đến sớm nhất đoàn." }, lose: { income_mult: 0.9, flags: ["fdr_difficult"], log: "Họ bỏ phim. Bạn mất hai tuần tìm người thay." } } }, "Lấy lại phim trường, có thể mất vai chính"),
    C("Chiều theo, quay bù ban đêm", { health: -3, money: -0.04, rel: -2 }, "Phim yên, đoàn mệt và oán"),
    C("Gặp riêng, hỏi chuyện gì đang xảy ra", { bw: -3, gamble: { p: 0.6, win: { rel: 3, flags: ["fdr_actor_ally"], log: "Họ đang chăm mẹ ốm. Hai người dời lịch quay cho nhau." }, lose: { log: "Họ cười, bảo bạn lo việc của mình." } } }, "Tốn sức, có thể có thêm một người bạn", { tier: "awakened" })], 2)),
  daily(FD, "fdr_censor", [22, 70], 9, (c) => T("Cảnh phim phải cắt", VN(c)
    ? "Hội đồng duyệt phim yêu cầu cắt cảnh người cha say rượu đập vỡ bát hương trên bàn thờ, vì 'không phù hợp thuần phong'. Đó là cảnh cả phim dựng lên để đi tới."
    : "Hội đồng phân loại phim báo: nếu giữ cảnh người cha say rượu đập phá nhà, phim sẽ bị dán nhãn chỉ dành cho người lớn và mất một nửa số rạp. Đó là cảnh cả phim dựng lên để đi tới.", [
    C("Cắt cảnh đó", { income_mult: 1.05, happy: -3, counters: { fdr_cuts: 1 } }, "Ra rạp đúng hẹn, mất một nhịp thật"),
    C("Xin duyệt lại, giải trình bằng văn bản", { bw: -4, gamble: { p: 0.4, win: { counters: { fdr_name: 1 }, log: "Hội đồng đồng ý giữ cảnh, kèm một dòng cảnh báo." }, lose: { money: -0.1, log: "Phim ra rạp muộn bốn tháng, rồi vẫn phải cắt." } } }, "Có thể giữ cảnh, có thể mất lịch chiếu"),
    C("Giữ cảnh, chỉ chiếu ở liên hoan phim", { money: -0.15, counters: { fdr_name: 1 }, flags: ["fdr_festival_only"] }, "Mất rạp, giữ trọn bộ phim")], 0)),
  daily(FD, "fdr_rejects", [22, 70], 8, (c) => T("Ba mươi thư từ chối", vary("fdrr", c.age, [
    "Phim của bạn bị ba mươi liên hoan phim từ chối, mỗi lần nộp tốn một khoản phí. Thư nào cũng mở đầu bằng 'Chúng tôi rất tiếc'.",
    "Kịch bản mới của bạn bị mười hai quỹ hỗ trợ từ chối. Một quỹ ghi thêm: 'chủ đề quá địa phương'."]), [
    C("Nộp tiếp, đổi cách giới thiệu phim", { money: -0.04, gamble: { p: 0.3, win: { counters: { fdr_name: 1 }, happy: 5, log: "Lá thư thứ ba mươi mốt mở đầu bằng 'Chúc mừng'." }, lose: { happy: -2, log: "Thêm năm lá thư nữa." } } }, "Tốn tiền phí, chỉ cần một lần đúng"),
    C("Tự chiếu miễn phí ở trường học, quán nhỏ", { money: -0.01, rel: 3, agency: 0.02, counters: { fdr_audience: 1 } }, "Lựa chọn thứ ba: tự tìm khán giả", { tier: "sovereign" }),
    C("Cất phim vào ổ cứng", { happy: -3, bw: 2 }, "Thôi đau, thôi tốn tiền")], 0)),
  daily(FD, "fdr_crewpay", [22, 70], 9, () => T("Lương đoàn bị treo", "Công ty sản xuất chậm lương đoàn phim hai tháng. Trưởng nhóm ánh sáng xin bạn, người đạo diễn, nói giúp một câu. Nhà sản xuất nhắn riêng: 'Bạn cứ quay, chuyện tiền để tôi lo.'", [
    C("Dừng quay đến khi đoàn có lương", { income_mult: 0.95, rel: 4, agency: 0.02, flags: ["fdr_crew_first"] }, "Mất lòng nhà sản xuất, được lòng đoàn"),
    C("Lấy tiền túi ứng trước cho đoàn", { money: -0.15, rel: 3, counters: { kind: 1 } }, "Hao tiền nhà, phim không phải dừng"),
    C("Quay tiếp, coi như không biết", { happy: -2, counters: { fdr_crew_bad: 1 } }, "Phim chạy, đoàn sẽ nhớ")], 0)),
  daily(FD, "fdr_critic", [22, 75], 7, (c) => T("Bài phê bình nặng lời", vary("fdrc", c.age, [
    "Nhà phê bình có tiếng nhất nước gọi phim của bạn là 'một bài văn mẫu dài hai tiếng'.",
    "Một kênh phê bình phim trên mạng làm video nửa tiếng chế giễu từng cảnh trong phim của bạn."]), [
    C("Viết bài đáp trả", { flags: ["public_fight"], gamble: { p: 0.4, win: { counters: { fdr_name: 1 }, log: "Cuộc tranh luận khiến người ta đi xem phim để tự phán xét." }, lose: { happy: -3, log: "Người ta chỉ nhớ bạn nổi nóng." } } }, "Có thể kéo khán giả, có thể mất mặt"),
    C("Mời họ uống cà phê, hỏi họ thấy gì", { know: 3, happy: -2, counters: { fdr_listened: 1 } }, "Nghe khó chịu, học được nhiều"),
    C("Không đọc", { bw: 2, happy: 1 }, "Yên lòng, mất một góc nhìn")], 2)),
  daily(FD, "fdr_editroom", [22, 70], 8, () => T("Phòng dựng lúc ba giờ sáng", "Bốn tháng nay bạn sống trong phòng dựng, ngủ trên ghế sô pha, cà phê thay bữa sáng. Người dựng phim đề nghị cắt cảnh bạn thích nhất: 'nó đẹp, nhưng làm phim chậm lại'.", [
    C("Cắt, nghe người dựng", { happy: -2, counters: { fdr_name: 1 } }, "Phim tốt hơn, mất đứa con cưng"),
    C("Giữ, thức thêm tìm cách khác", { health: -4, counters: { drink: 1 }, gamble: { p: 0.4, win: { happy: 4, log: "Bạn tìm được chỗ đặt cảnh đó. Nó thành điểm nhấn." }, lose: { log: "Ba tuần sau bạn vẫn phải cắt nó." } } }, "Có thể đúng, cơ thể trả giá")], 0)),
  daily(FD, "fdr_mentor", [22, 70], 9, (c, N) => { const m = role(c, "mentor")!; return T("Người thầy xin một vai", `${N(m)}, người đầu tiên dạy bạn cách đặt máy quay, xin cho con trai đóng một vai quan trọng trong phim mới. Cậu ấy diễn không tệ, nhưng có người diễn tốt hơn đã thử vai.`, [
    C("Nhận con trai thầy", { trust: { npc: m, delta: 0.25 }, counters: { fdr_name: -1 } }, "Trả ơn thầy, phim kém đi một chút"),
    C("Chọn người diễn tốt hơn, nói thật với thầy", { memory: { npc: m, tag: "REFUSED_HELP", weight: -0.2, note: "không nhận con trai vào phim" }, counters: { fdr_name: 1 } }, "Phim tốt hơn, thầy có thể giận"),
    C("Cho cậu ấy vai nhỏ, kèm một năm học diễn", { money: -0.03, trust: { npc: m, delta: 0.1 }, promise: { to: m, what: "kèm con trai thầy học diễn một năm", years: 1 } }, "Tốn công, giữ được cả phim lẫn thầy", { tier: "awakened" })], 1, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(FD, "fdr_piracy", [22, 70], 9, () => T("Phim lậu sau hai ngày", "Hai ngày sau khi phim ra rạp, bản quay lén đã có trên hàng chục trang web, kèm quảng cáo cờ bạc. Doanh thu tuần thứ hai giảm một nửa.", [
    C("Thuê luật sư đánh sập từng trang", { money: -0.1, bw: -4, counters: { fdr_fights: 1 }, gamble: { p: 0.4, win: { money: 0.15, log: "Phần lớn đường dẫn bị gỡ trước cuối tuần." }, lose: { log: "Gỡ trang này, mọc trang khác." } } }, "Tốn kém, có thể giữ được doanh thu"),
    C("Tự đăng bản đẹp, mời người xem trả tùy tâm", { agency: 0.02, flags: ["fdr_pay_what_you_want"], gamble: { p: 0.5, win: { money: 0.1, counters: { fdr_name: 1 }, log: "Người xem gửi tiền từ ba mươi nước." }, lose: { money: -0.1, log: "Rạp rút phim sớm vì bạn phát miễn phí." } } }, "Lựa chọn thứ ba: đi đường vòng", { tier: "sovereign" }),
    C("Mặc kệ, lo phim sau", { money: -0.05, happy: -2 }, "Đỡ sức, mất một phần tiền")], 2)),
  daily(FD, "fdr_quit", [30, 70], 99, () => T("Lớp học ban ngày", "Một trường dạy nghề mời bạn dạy dựng phim: lương đều, có kỳ nghỉ hè, không còn phải đi xin tiền nhà đầu tư. Chiếc máy quay của bạn nằm trong tủ đã nửa năm.", [
    C("Nhận dạy, gác máy quay", { ...leave(FD), flags: ["ex_director", "fdr_teacher"] }, "Ổn định, phim của mình thành bài giảng"),
    C("Vẫn làm phim", { happy: 1, counters: { fdr_purist: 1 } }, "Bấp bênh, còn giữ giấc mơ")], 1), lowMood),

  /* ---------- gia đình ---------- */
  cross(FD, "fdr_family", [24, 70], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} xin thử vai`, `${N(k)} xin được thử vai trong phim mới của bạn, một vai có thật trong kịch bản. Hai mươi đứa trẻ khác cũng đã nộp hồ sơ.`, [
      C("Cho con vai đó", { trust: { npc: k, delta: 0.2 }, counters: { fdr_name: -1 } }, "Con vui, đoàn xì xào"),
      C("Cho thi như mọi người, không ưu tiên", { trust: { npc: k, delta: -0.05 }, gamble: { p: 0.35, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} đỗ bằng sức mình. Cả đoàn biết điều đó.` }, lose: { log: `${N(k)} không đỗ, và ba ngày không nói chuyện với bạn.` } } }, "Công bằng, có thể làm con tổn thương", { tier: "awakened" }),
      C("Không cho, bắt học xong đã", { trust: { npc: k, delta: -0.2 } }, "Giữ con xa nghề, con giận")], 1, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Gia đình trong kịch bản", `Kịch bản mới của bạn kể về một gia đình hay cãi nhau trong căn nhà chật, và ai quen nhà bạn cũng nhận ra từng người. ${N(p)} đã đọc được bản in bạn để quên trên bàn.`, [
      C("Ngồi xuống hỏi ý trước khi quay", { trust: { npc: p, delta: 0.25 }, gamble: { p: 0.5, win: { flags: ["fdr_family_blessing"], log: `${N(p)} kể thêm một chuyện bạn chưa từng biết. Chuyện đó vào phim.` }, lose: { happy: -2, log: `${N(p)} xin bạn đổi hết các chi tiết.` } } }, "Có thể mất chuyện, có thể được thêm chuyện"),
      C("Quay đúng như đã viết", { trust: { npc: p, delta: -0.25 }, counters: { fdr_name: 1 } }, "Phim thật hơn, nhà lạnh hơn"),
      C("Đổi bối cảnh, đổi tên mọi nhân vật", { happy: -1, trust: { npc: p, delta: 0.05 } }, "Yên nhà, phim nhạt đi một chút")], 0, { npc: p });
  }),
];

/* =====================================================================
 * DÂN QUẢNG CÁO — tiền tố adc_
 * ===================================================================== */
const ADCREATIVE: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AD, "adc_t_sign", [10, 16], () => true, () => T("Tấm biển cho quán nước", "Bạn viết lại tấm biển cho quán nước đầu ngõ: thay chữ 'Nước chanh' bằng một câu có vần, đọc một lần là nhớ. Tuần đó quán bán gấp đôi. Chủ quán cho bạn uống miễn phí cả tháng.", [
    C("Nhận viết biển cho cả dãy phố", { flags: [talentFlag(AD)], counters: { talents_seen: 1 }, money: 0.01, know: -2, happy: 3 }, "Có tiền vặt, sao nhãng bài vở"),
    C("Viết một lần cho vui thôi", { counters: { talents_seen: 1 }, know: 1 }, "Học hành yên ổn, thôi viết chữ cho người")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AD, "adc_d_brief", [21, 40], () => true, () => T("Bốn mươi tám giờ cho một ý tưởng", "Một công ty quảng cáo mở cuộc thi tuyển người: bốn mươi tám giờ làm một chiến dịch cho một hãng nước giải khát địa phương đang chết dần. Người thắng được nhận vào làm, người thua mất hai ngày phép.", [
    C("Thức hai đêm làm bài", { counters: { doors_seen: 1 }, health: -2, gamble: { p: 0.45, win: { ...become(AD), log: "Ý tưởng của bạn thắng. Giám đốc sáng tạo hỏi bạn đi làm từ thứ Hai được không." }, lose: { happy: -3, log: "Bạn vào tới vòng cuối rồi thua một người nhiều kinh nghiệm hơn." } } }, "Mất hai đêm, có thể đổi nghề"),
    C("Nộp bài kèm đơn xin làm thực tập", { ...become(AD), counters: { doors_seen: 1 }, income_mult: 0.7 }, "Chắc vào được, lương thực tập"),
    C("Thôi", { counters: { doors_seen: 1 }, bw: 2 }, "Giữ sức, bỏ một cánh cửa")], 0)),
  door(AD, "adc_d_inhouse", [21, 45], () => true, () => T("Người viết chữ của cả công ty", "Ở chỗ bạn đang làm, ai cũng nhờ bạn viết lời giới thiệu sản phẩm, vì bạn viết hay hơn cả phòng tiếp thị. Một người bạn làm ở công ty quảng cáo rủ bạn sang, lương thử việc bằng hai phần ba lương hiện tại.", [
    C("Nhảy sang, chịu lương thử việc", { ...become(AD), counters: { doors_seen: 1 }, money: -0.06 }, "Hụt lương mấy tháng, làm đúng nghề"),
    C("Ở lại, nhận viết thuê ngoài giờ", { counters: { doors_seen: 1 }, money: 0.05, bw: -4 }, "Thêm tiền, mất những buổi tối")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(AD, 1, 1, (c) => T("Câu chữ không ai kiện được", "Bản brief đầu tiên của bạn: một hãng sữa bột muốn quảng cáo nói sản phẩm 'giúp trẻ thông minh vượt trội'. Không có nghiên cứu nào nói vậy. Giám đốc sáng tạo dặn: 'Viết sao cho người ta hiểu thế, mà không ai kiện được.'", [
    C("Viết khéo, lách từng chữ", { counters: step(c, AD), income_mult: 1.1, money: 0.03, flags: ["adc_weasel"] }, "Được khen, câu chữ đó sẽ theo bạn"),
    C("Đề xuất ý tưởng khác, nói thật", { counters: step(c, AD), flags: ["adc_honest"], gamble: { p: 0.5, win: { counters: { adc_rep: 1 }, log: "Khách hàng chọn ý tưởng của bạn: những đứa trẻ bình thường, vụng về, đáng yêu." }, lose: { happy: -3, log: "Sếp gạch ý tưởng của bạn, giao câu chữ cho người khác viết." } } }, "Có thể bị gạt ra, giữ được lòng mình")], 0), adult),
  beat(AD, 2, 3, (c, N) => {
    const b = role(c, "first_boss");
    const who = b ? N(b) : "giám đốc sáng tạo";
    return T("Ý tưởng mang tên người khác", `Cuộc đấu thầu lớn nhất năm: một hãng viễn thông, đủ nuôi cả công ty ba năm. Ý tưởng thắng thầu là của bạn, nhưng trên sân khấu, ${who} trình bày như của mình. Tối đó, ${who} nhắn riêng: "Năm sau cho bạn lên trưởng nhóm."`, [
      C("Im lặng, nhận lời hứa thăng chức", { counters: step(c, AD), income_mult: 1.3, happy: -3, flags: ["adc_ghosted"] }, "Lên chức, quen với việc bị lấy công"),
      C("Đòi ghi tên mình trước cả công ty", { counters: step(c, AD, { adc_rep: 1 }), ...(b ? { memory: { npc: b, tag: "HUMILIATED_ME" as const, weight: -0.25, note: "vụ bị đòi lại ý tưởng trước cả công ty" } } : {}), gamble: { p: 0.5, win: { income_mult: 1.2, log: "Chủ tịch công ty sửa hồ sơ thầu, ghi tên bạn." }, lose: { income_mult: 0.9, log: "Bạn được ghi tên, rồi bị chuyển sang nhóm lo khách hàng nhỏ." } } }, "Lấy lại công, mất lòng người trên"),
      C("Rủ hai đồng nghiệp ra mở công ty nhỏ", { counters: step(c, AD), agency: 0.03, money: -0.3, gamble: { p: 0.5, win: { income_mult: 1.3, flags: ["adc_own_shop"], log: "Khách hàng đầu tiên đi theo ba người. Văn phòng là một căn gác." }, lose: { income_mult: 0.8, flags: ["adc_own_shop"], log: "Sáu tháng đầu không có khách. Ba người ăn mì gói ở văn phòng." } } }, "Lựa chọn thứ ba: tự đứng tên mình", { tier: "sovereign" })], 0, b ? { npc: b } : {});
  }, adult),
  beat(AD, 3, 4, (c) => f(c, "adc_weasel")
    ? T("Câu chữ trong quyết định phạt", "Cơ quan bảo vệ người tiêu dùng phạt hãng sữa vì quảng cáo gây hiểu nhầm. Câu bị trích trong quyết định phạt là câu bạn viết mấy năm trước. Khách hàng đòi công ty quảng cáo chịu một nửa tiền phạt, và sếp cần một cái tên.", [
      C("Nhận mình là người viết, xin nghỉ", { counters: step(c, AD), ...leave(AD), happy: -3, rel: 2, flags: ["adc_took_fall", "ex_adman"] }, "Mất việc, không để người khác gánh"),
      C("Để thực tập sinh đứng tên", { counters: step(c, AD), income_mult: 1.1, flags: ["adc_scapegoat"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.4, fuse_years: [2, 9], note: "đẩy thực tập sinh gánh vụ quảng cáo sai" } }, "Giữ ghế, có người trả giá thay bạn"),
      C("Nhận lỗi công khai, lập quy trình kiểm chứng", { counters: step(c, AD, { adc_rep: 1 }), income_mult: 0.85, agency: 0.02, flags: ["adc_fact_check"] }, "Mất thưởng, nghề sạch hơn", { tier: "sovereign" })], 2)
    : T("Chiến dịch bị tẩy chay", "Một câu đùa trong quảng cáo bạn làm bị cắt khỏi ngữ cảnh, lan khắp mạng với lời chú thích là xúc phạm người dân một vùng quê. Trong bốn mươi tám giờ, khách hàng mất ba phần trăm giá cổ phiếu. Họ cần ai đó đứng ra.", [
      C("Đứng ra xin lỗi, gỡ chiến dịch", { counters: step(c, AD, { adc_rep: 1 }), income_mult: 0.85, happy: -3, flags: ["adc_apologized"] }, "Mất mặt, giữ được nghề"),
      C("Bảo vệ ý tưởng, đăng bản đầy đủ", { counters: step(c, AD), gamble: { p: 0.35, win: { counters: { adc_rep: 2 }, log: "Bản đầy đủ được chia sẻ lại. Người ta hiểu, và nhớ tên chiến dịch." }, lose: { income_mult: 0.7, flags: ["adc_toxic"], log: "Khách hàng chấm dứt hợp đồng. Tên bạn bị nhắc trong mọi bài báo." } } }, "Có thể lật ngược, có thể chìm hẳn"),
      C("Rời nghề quảng cáo", { counters: step(c, AD), ...leave(AD), flags: ["ex_adman"] }, "Thoát bão, bỏ lại mười năm làm nghề")], 0), adult),
  beat(AD, 4, 5, (c) => {
    const rep = c.counters.adc_rep ?? 0;
    if (f(c, "adc_own_shop")) return T("Khách hàng chiếm sáu phần mười", "Công ty nhỏ của bạn giờ có mười hai người. Sáu phần mười doanh thu đến từ một ứng dụng cho vay nhanh lãi rất cao, và họ muốn chiến dịch mới nhắm vào sinh viên. Cùng tháng, một tập đoàn quảng cáo đa quốc gia ngỏ lời mua lại công ty.", [
      C("Bán công ty cho tập đoàn", { counters: step(c, AD), money: 2, income_mult: 1.1, flags: ["adc_sold_shop"] }, "Đổi đời, thành nhân viên trong công ty mình"),
      C("Bỏ khách cho vay, cả công ty giảm lương", { counters: step(c, AD, { adc_rep: 1 }), income_mult: 0.7, happy: 4, rel: 2 }, "Nghèo đi, ngủ ngon"),
      C("Giữ khách, buộc in rõ lãi suất trên mọi mẫu", { counters: step(c, AD), agency: 0.03, gamble: { p: 0.4, win: { income_mult: 1.2, flags: ["adc_clear_terms"], log: "Họ chịu. Quảng cáo của bạn là quảng cáo cho vay duy nhất in lãi suất to bằng tiêu đề." }, lose: { income_mult: 0.7, log: "Họ đi tìm công ty khác. Bạn mất sáu phần mười doanh thu trong một ngày." } } }, "Lựa chọn thứ ba: đặt luật cho khách", { tier: "sovereign" })], 1);
    if (f(c, "adc_ghosted")) return T("Chiếc ghế của người cũ", "Giám đốc sáng tạo về hưu, và bạn ngồi vào ghế ấy. Tuần đầu, một nhân viên trẻ mang đến ý tưởng hay nhất bạn thấy trong năm. Ban giám đốc muốn trình nó dưới tên bạn cho 'khách hàng tin hơn'.", [
      C("Trình dưới tên mình", { counters: step(c, AD), income_mult: 1.4, flags: ["adc_took_credit"] }, "Lên đỉnh, lặp lại điều từng làm bạn đau"),
      C("Ra quy định: ý tưởng mang tên người nghĩ ra", { counters: step(c, AD, { adc_rep: 2 }), income_mult: 1.1, agency: 0.03, flags: ["adc_credit_rule"] }, "Mất chút uy, dựng được một nơi tử tế", { tier: "sovereign" }),
      C("Từ chức, viết tự do", { counters: step(c, AD), ...leave(AD), happy: 2, flags: ["ex_adman"] }, "Tự do, bỏ chiếc ghế đã chờ mười năm")], 1);
    return T("Giải thưởng lớn nhất nghề", `${rep >= 2 ? "Bạn đang là cái tên được nhắc nhiều nhất trong nghề." : "Bạn làm nghề đủ lâu để không ai còn coi bạn là người mới."} Chiến dịch bạn làm cho một hãng bia đoạt giải lớn nhất của ngành quảng cáo trong khu vực. Cùng tuần, một nghiên cứu chỉ ra quảng cáo của hãng nhắm vào người dưới hai mươi tuổi.`, [
      C("Nhận giải, ký tiếp hợp đồng ba năm", { counters: step(c, AD), income_mult: 1.4, flags: ["adc_beer_award"] }, "Đỉnh nghề, tên bạn gắn với hãng bia"),
      C("Nhận giải, tặng tiền thưởng cho quỹ cai rượu", { counters: step(c, AD, { adc_rep: 1 }), income_mult: 1.1, rel: 3 }, "Giữ danh, trả lại một phần lương tâm"),
      C("Không nhận giải, rời khách hàng đó", { counters: step(c, AD, { adc_rep: 1 }), income_mult: 0.8, happy: 3, agency: 0.02 }, "Mất khách lớn, giữ một lằn ranh")], 0);
  }, adult),
  beat(AD, 5, 6, (c) => T("Khẩu hiệu ai cũng thuộc", `Một câu khẩu hiệu bạn viết hai mươi năm trước vẫn được người ta dùng như câu cửa miệng. Một trường đại học mời bạn dạy một học kỳ${f(c, "adc_weasel") ? ", và giáo trình của họ lấy quảng cáo sữa bột năm xưa của bạn làm ví dụ về lời hứa sai" : f(c, "adc_credit_rule") ? ", và kể rằng quy định ghi tên người nghĩ ra ý tưởng đã lan sang nhiều công ty khác" : f(c, "adc_clear_terms") ? ", lấy mẫu quảng cáo in rõ lãi suất của bạn làm bài học" : ""}.`, [
    C("Dạy cả mặt tối của nghề, kể cả chuyện mình", { counters: step(c, AD), income_mult: 0.8, happy: 3, flags: ["passed_on"] }, "Bớt thu nhập, người sau đi đường sáng hơn"),
    C("Mở khóa học viết quảng cáo có thu phí", { counters: step(c, AD), money: 0.3 }, "Một khoản tốt, dạy nghề như nó vốn là"),
    C("Làm miễn phí một chiến dịch cho việc tử tế", { counters: step(c, AD), money: -0.05, rel: 4, happy: 4 }, "Không tiền, một chiến dịch không bán gì")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(AD, "adc_revision", [21, 65], 7, (c) => T("Bản sửa thứ mười bảy", vary("adcr", c.age, [
    "Mười một giờ đêm, khách hàng gửi bản sửa thứ mười bảy: 'logo to hơn, chữ ít hơn, cảm xúc nhiều hơn'. Hạn nộp là tám giờ sáng.",
    "Khách hàng duyệt xong rồi đổi ý lúc nửa đêm: họ vừa xem quảng cáo của đối thủ và muốn 'giống thế nhưng khác'."]), [
    C("Sửa đúng từng chữ khách muốn", { money: 0.02, happy: -2, counters: { adc_yes_man: 1 } }, "Khách vui, quảng cáo nát dần"),
    C("Đòi gặp khách, nói lại từ đầu", { bw: -2, gamble: { p: 0.5, win: { counters: { adc_rep: 1 }, log: "Khách hàng nhận ra họ chưa biết mình muốn gì. Lần sửa này là lần cuối." }, lose: { money: -0.03, log: "Khách chuyển dự án sang công ty khác." } } }, "Có thể sửa tận gốc, có thể mất khách")], 0)),
  daily(AD, "adc_ghost", [21, 65], 9, () => T("Quảng cáo chỉ để đi thi", "Công ty muốn bạn làm chiến dịch cho một tổ chức từ thiện nhỏ, đăng đúng một lần trên một tờ báo địa phương, chỉ để nộp đi giải thưởng. 'Ai cũng làm thế', sếp nói. Giải năm nay quyết định ai lên giám đốc.", [
    C("Làm, nộp đi thi", { income_mult: 1.1, counters: { adc_awards: 1 }, secret: { tag: "FORGED_PAPERS", severity: 0.25, fuse_years: [2, 8], note: "chiến dịch 'ma' nộp đi giải" } }, "Có giải, có một bí mật"),
    C("Đề nghị chạy thật, xin ngân sách cho họ", { bw: -3, gamble: { p: 0.4, win: { counters: { adc_rep: 1 }, rel: 3, log: "Chiến dịch chạy thật ba tháng. Tổ chức có thêm bốn trăm người tình nguyện." }, lose: { log: "Ban giám đốc nói không có tiền cho 'việc không sinh lời'." } } }, "Lựa chọn thứ ba: làm thật", { tier: "sovereign" }),
    C("Từ chối", { income_mult: 0.95, counters: { honest: 1 } }, "Sạch, chậm lên chức")], 2)),
  daily(AD, "adc_elder", [38, 65], 8, () => T("Người lớn tuổi nhất phòng họp", "Trong phòng họp sáng tạo, bạn lớn hơn người lớn tuổi thứ hai bảy năm. Một trưởng nhóm trẻ hỏi, rất lịch sự, liệu bạn có 'hiểu được người trẻ bây giờ' không.", [
    C("Học lại từ đầu những gì người trẻ dùng", { know: 4, bw: -4, counters: { adc_rep: 1 } }, "Mệt, vẫn đứng vững trong nghề"),
    C("Chuyển sang làm chiến lược, bớt cầm bút", { income_mult: 1.1, happy: -2, flags: ["adc_strategist"] }, "Lương khá hơn, xa dần chữ nghĩa"),
    C("Nhận kèm hai bạn trẻ, đổi lại họ dạy bạn", { rel: 3, know: 2, flags: ["adc_reverse_mentor"] }, "Tốn thời gian, hai bên cùng lớn", { tier: "awakened" })], 0)),
  daily(AD, "adc_rival", [21, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Ý tưởng sang công ty đối thủ", `Công ty của ${N(r)} vừa tung chiến dịch giống hệt bản đề xuất bạn trình cho khách tháng trước, đến cả câu khẩu hiệu. Một người làm tự do từng nhận việc của cả hai bên.`, [
    C("Công bố hai bản đề xuất kèm ngày tháng", { flags: ["public_fight"], memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "bị tố lấy ý tưởng quảng cáo" }, gamble: { p: 0.5, win: { counters: { adc_rep: 1 }, log: "Giới làm nghề đứng về phía bạn." }, lose: { happy: -3, log: "Người ta bảo ý tưởng nào chẳng giống nhau." } } }, "Đòi lại công, mở một cuộc chiến"),
    C("Gặp riêng, đề nghị chia nhau khách", { gamble: { p: 0.5, win: { money: 0.06, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "thỏa thuận chia khách sau vụ ý tưởng" }, log: "Hai bên ký thỏa thuận không lôi kéo khách và người của nhau." }, lose: { log: "Họ cười, bảo bạn cứ chứng minh đi." } } }, "Có thể thành đồng minh, có thể bị coi thường", { tier: "awakened" }),
    C("Viết một ý tưởng mới tốt hơn", { know: 2, bw: -3 }, "Tốn sức, không ai trả lại công")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(AD, "adc_focus", [21, 65], 7, () => T("Căn phòng có tấm gương một chiều", "Sau tấm gương một chiều, tám người được trả tiền để xem ý tưởng bạn tâm đắc nhất. Bảy người nói 'khó hiểu'. Khách hàng quay sang chờ bạn quyết định.", [
    C("Bỏ ý tưởng, làm phương án an toàn", { money: 0.03, happy: -2, counters: { adc_safe: 1 } }, "Chắc ăn, quảng cáo dễ quên"),
    C("Bảo vệ ý tưởng, xin chạy thử nhỏ", { gamble: { p: 0.4, win: { counters: { adc_rep: 2 }, log: "Bản chạy thử vượt mọi chỉ số. Tám người kia đã sai." }, lose: { counters: { adc_rep: -1 }, log: "Bản chạy thử thất bại đúng như họ nói." } } }, "Cược uy tín vào trực giác")], 1)),
  daily(AD, "adc_layoff", [24, 65], 9, () => T("Hai cái tên phải cắt", "Khách hàng lớn nhất rời công ty. Ban giám đốc yêu cầu bạn, với tư cách trưởng nhóm, chọn hai người trong nhóm để cho nghỉ trước thứ Sáu.", [
    C("Chọn hai người làm kém nhất", { bw: -3, happy: -4, counters: { adc_cuts: 1 } }, "Nhóm gọn lại, mất hai người từng tin bạn"),
    C("Đề xuất cả nhóm giảm lương, không ai bị cắt", { income_mult: 0.85, agency: 0.02, gamble: { p: 0.5, win: { rel: 4, flags: ["adc_team_held"], log: "Cả nhóm ký đồng ý. Tám tháng sau có khách mới, lương trở lại." }, lose: { log: "Ban giám đốc từ chối. Hai người vẫn phải đi." } } }, "Lựa chọn thứ ba: chia nhau cái khó", { tier: "sovereign" }),
    C("Tự xin nghỉ, giữ chỗ cho người khác", { ...leave(AD), rel: 3, flags: ["ex_adman"] }, "Mất việc, giữ được hai chỗ làm")], 0)),
  daily(AD, "adc_overnight", [21, 60], 8, () => T("Đèn văn phòng lúc ba giờ sáng", "Ba giờ sáng, một đồng nghiệp gục xuống bàn sau ba ngày gần như không ngủ để kịp buổi trình bày. Buổi trình bày vẫn diễn ra lúc chín giờ, và không ai nhắc chuyện đó.", [
    C("Viết đề xuất: không họp, không giao việc sau 8 giờ tối", { agency: 0.02, flags: ["adc_8pm_rule"], gamble: { p: 0.45, win: { rel: 4, log: "Ban giám đốc cho thử ba tháng, rồi giữ luôn." }, lose: { income_mult: 0.95, log: "Bạn bị gọi là người 'thiếu lửa'." } } }, "Có thể đổi luật, có thể bị coi là lười", { tier: "awakened" }),
    C("Làm như mọi người, kịp hạn đã", { health: -4, money: 0.03, counters: { adc_overtime: 1 } }, "Giữ chỗ, đốt sức khỏe"),
    C("Đưa đồng nghiệp đi viện, bỏ buổi trình bày", { rel: 3, income_mult: 0.95, counters: { kind: 1 } }, "Mất điểm với sếp, được một người bạn")], 1)),
  daily(AD, "adc_freepitch", [24, 65], 9, () => T("Đấu thầu không trả tiền", "Một tập đoàn mời sáu công ty quảng cáo cùng trình bày ý tưởng, không trả phí. Năm ngoái họ cũng làm vậy, rồi tự chạy chiến dịch bằng ý tưởng của một công ty thua thầu.", [
    C("Tham gia như mọi người", { money: -0.04, gamble: { p: 0.2, win: { money: 0.3, log: "Bạn thắng thầu. Hợp đồng nuôi công ty một năm." }, lose: { counters: { adc_robbed: 1 }, log: "Bạn thua. Sáu tháng sau, ý tưởng của bạn hiện lên trên biển quảng cáo của họ." } } }, "Tốn công, cơ hội nhỏ"),
    C("Rủ năm công ty kia cùng đòi phí trình bày", { agency: 0.03, gamble: { p: 0.4, win: { money: 0.05, counters: { adc_rep: 1 }, flags: ["adc_pitch_fee"], log: "Cả sáu công ty đứng chung. Tập đoàn trả phí cho mọi bản trình bày." }, lose: { log: "Hai công ty lén nộp bài. Liên minh tan." } } }, "Lựa chọn thứ ba: liên minh với đối thủ", { tier: "sovereign" }),
    C("Từ chối", { happy: 1, money: -0.01 }, "Giữ công sức, mất một cửa")], 2)),
  daily(AD, "adc_parody", [21, 65], 8, (c) => T("Khẩu hiệu bị chế", vary("adcp", c.age, [
    "Câu khẩu hiệu bạn viết bị cư dân mạng chế thành hàng trăm phiên bản, có bản rất tục. Khách hàng gọi lúc sáu giờ sáng, giọng hoảng hốt.",
    "Một diễn viên hài nhại quảng cáo của bạn trên sân khấu. Đoạn nhại được xem nhiều hơn bản gốc."]), [
    C("Chơi cùng: làm một quảng cáo tự chế mình", { gamble: { p: 0.5, win: { counters: { adc_rep: 2 }, log: "Doanh số tuần đó tăng gấp rưỡi. Người ta khen hãng biết cười." }, lose: { counters: { adc_rep: -1 }, log: "Trò đùa lần hai không còn buồn cười." } } }, "Có thể biến cười chê thành tiếng tốt"),
    C("Khuyên khách im lặng chờ qua", { bw: 2, counters: { adc_safe: 1 } }, "An toàn, bỏ lỡ một con sóng"),
    C("Gửi thư yêu cầu gỡ các bản chế", { money: -0.02, counters: { adc_rep: -1 }, flags: ["adc_takedown"] }, "Bảo vệ thương hiệu, bị chê cứng nhắc")], 1)),
  daily(AD, "adc_quit", [28, 65], 99, () => T("Ghế bên phía khách hàng", "Một ngân hàng mời bạn về làm trưởng phòng truyền thông: lương cao hơn, sáu giờ tan làm, và từ nay bạn là người gửi bản sửa lúc nửa đêm cho người khác.", [
    C("Nhận, sang bên khách hàng", { ...leave(AD), money: 0.06, flags: ["ex_adman"] }, "Ổn định, thôi tự tay làm ý tưởng"),
    C("Ở lại với nghề", { happy: 1, counters: { adc_rep: 1 } }, "Mệt, vẫn còn được sáng tạo")], 1), lowMood),

  /* ---------- gia đình ---------- */
  cross(AD, "adc_family", [24, 70], (c) => !!role(c, "mother") || !!role(c, "father") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} hỏi về một quảng cáo`, `${N(k)} chỉ vào tấm biển trên xe buýt, quảng cáo do bạn làm, và hỏi: "Cái này có thật không, hay chỉ là quảng cáo?" Bạn trong lớp đang lấy câu khẩu hiệu đó ra trêu nhau.`, [
      C("Giải thích quảng cáo được làm ra thế nào", { know: 1, trust: { npc: k, delta: 0.2 } }, "Con hiểu nghề của bạn, hết ảo tưởng"),
      C("Bảo là thật, cho nhanh", { trust: { npc: k, delta: -0.1 } }, "Nhanh, con sẽ tự biết sau"),
      C("Rủ con cùng viết một quảng cáo nói thật", { bw: -3, trust: { npc: k, delta: 0.25 }, promise: { to: k, what: "cùng con viết một quảng cáo nói thật", years: 1 } }, "Tốn thời gian, một bài học chung", { tier: "awakened" })], 2, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Ba hộp thuốc bổ trong tủ bếp", `${N(p)} vừa mua ba hộp thực phẩm chức năng, giá bằng nửa tháng tiền chợ, vì "quảng cáo nói chắc lắm". Câu quảng cáo đó do chính bạn viết.`, [
      C(`Nói thật với ${N(p)} về nghề mình`, { happy: -3, trust: { npc: p, delta: 0.15 }, flags: ["adc_told_parent"] }, "Mất mặt, bố mẹ bớt bị dắt mũi"),
      C("Lặng lẽ trả lại tiền, không nói gì", { money: -0.03, trust: { npc: p, delta: 0.05 } }, "Tốn tiền, giữ thể diện cho cả hai"),
      C("Bảo sản phẩm cũng chẳng hại gì", { happy: -1, counters: { honest: -1 } }, "Yên chuyện, một lời nói dối nhỏ")], 0, { npc: p });
  }),
];

/* =====================================================================
 * PHÁT THANH VIÊN — tiền tố rad_
 * ===================================================================== */
const RADIO: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(RV, "rad_t_speaker", [10, 16], () => true, (c) => T("Giọng đọc trên loa trường", VN(c)
    ? "Cô tổng phụ trách cho bạn đọc thông báo trên loa trường mỗi sáng thứ Hai. Bác tổ trưởng dân phố nghe được, hỏi bạn có muốn đọc tin trên loa phường dịp hè không."
    : "Thầy hiệu trưởng cho bạn đọc thông báo trên loa trường mỗi sáng thứ Hai. Đài phát thanh địa phương nghe tiếng, mời bạn đọc trong chương trình thiếu nhi cuối tuần.", [
    C("Nhận lời, dậy sớm mỗi tuần", { flags: [talentFlag(RV)], counters: { talents_seen: 1 }, happy: 3, bw: -2 }, "Mất giấc sáng, giọng được rèn"),
    C("Ngại, để bạn khác đọc", { counters: { talents_seen: 1 }, bw: 1 }, "Thoải mái, giọng chỉ để nói chuyện")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RV, "rad_d_night", [20, 45], () => true, () => T("Ca đêm còn trống", "Đài phát thanh địa phương cần người dẫn ca từ nửa đêm đến bốn giờ sáng: đọc thư thính giả, chọn nhạc, nghe điện thoại. Lương thấp hơn việc bạn đang làm, nhưng giám đốc đài nói giọng bạn 'làm người ta muốn nghe đến cuối'.", [
    C("Nhận ca đêm, bỏ việc ban ngày", { ...become(RV), counters: { doors_seen: 1 }, money: -0.05, health: -2 }, "Đảo lộn giấc ngủ, có một chỗ trên sóng"),
    C("Làm thử ba tháng, giữ việc ngày", { counters: { doors_seen: 1 }, health: -3, gamble: { p: 0.4, win: { ...become(RV), log: "Sau ba tháng, đài nhận bạn chính thức." }, lose: { log: "Bạn ngủ gật trong ca thứ hai mươi. Đài tìm người khác." } } }, "Giữ việc, cạn sức"),
    C("Thôi", { counters: { doors_seen: 1 }, bw: 2 }, "Ngủ đủ, sóng đêm thuộc về người khác")], 0)),
  door(RV, "rad_d_audition", [20, 45], () => true, () => T("Một trăm hai mươi giọng thử", "Đài phát thanh lớn tuyển phát thanh viên bản tin. Một trăm hai mươi người thử giọng, mỗi người đọc ba phút một bản tin có đủ tên nước ngoài, những con số dài và một tin buồn.", [
    C("Luyện ba tuần rồi đi thử", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(RV), log: "Bạn đọc tin buồn chậm hơn mọi người nửa nhịp. Hội đồng gọi lại ngay chiều hôm đó." }, lose: { happy: -2, know: 2, log: "Bạn vấp ở một cái tên nước ngoài. Từ đó bạn đọc đúng nó." } } }, "Mất ba tuần, cửa hẹp"),
    C("Xin vào làm biên tập, chờ ngày lên sóng", { ...become(RV), counters: { doors_seen: 1 }, income_mult: 0.8 }, "Vào được đài, lương và giọng phải chờ")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(RV, 1, 1, (c) => T("Ba mươi phút một mình trên sóng", "Buổi lên sóng chính thức đầu tiên, khách mời báo hủy năm phút trước giờ. Đèn đỏ 'ĐANG PHÁT' bật sáng. Bạn có ba mươi phút và một xấp giấy trắng.", [
    C("Kể chuyện của chính mình", { counters: step(c, RV), flags: ["rad_own_voice"], gamble: { p: 0.5, win: { counters: { rad_bond: 1 }, log: "Tổng đài nhận mười bảy cuộc gọi. Ai cũng muốn kể một chuyện tương tự." }, lose: { happy: -3, log: "Bạn nói lạc đề hai lần. Trưởng ca nhắc nhở sau giờ phát." } } }, "Có thể chạm người nghe, có thể lạc giọng"),
    C("Phát nhạc liền mạch, chen vài câu dẫn", { counters: step(c, RV), bw: 2, flags: ["rad_by_script"] }, "An toàn, không ai nhớ bạn")], 0), adult),
  beat(RV, 2, 3, (c) => T("Chương trình tâm sự đêm khuya", `Đài giao cho bạn chương trình tâm sự đêm khuya, nơi thính giả gọi đến kể chuyện đời mình.${f(c, "rad_own_voice") ? " Họ chọn bạn vì nhớ đêm đầu tiên năm nào." : ""} Ban giám đốc muốn tăng lượng nghe: chọn những chuyện giật gân nhất, và đăng lại các đoạn ghi âm lên mạng.`, [
    C("Chọn chuyện giật gân, đăng ghi âm", { counters: step(c, RV), income_mult: 1.4, flags: ["rad_drama"] }, "Lượng nghe tăng, người gọi bị phơi ra"),
    C("Giữ chương trình chậm, che danh tính người gọi", { counters: step(c, RV, { rad_bond: 1 }), income_mult: 1.05, flags: ["rad_listener_first"] }, "Ít người nghe, người gọi được an toàn"),
    C("Đặt luật: không đăng lại, có chuyên gia trực", { counters: step(c, RV), agency: 0.03, gamble: { p: 0.5, win: { counters: { rad_bond: 2 }, income_mult: 1.2, flags: ["rad_listener_first", "rad_counselor"], log: "Đài đồng ý thử. Chương trình thành nơi người ta gọi đến trước cả khi gọi cho người nhà." }, lose: { income_mult: 0.95, flags: ["rad_listener_first"], log: "Đài không có tiền thuê chuyên gia. Bạn giữ được luật không đăng lại." } } }, "Lựa chọn thứ ba: luật mới cho chương trình", { tier: "sovereign" })], 1), adult),
  beat(RV, 3, 4, (c, N) => {
    if (f(c, "rad_drama")) return T("Giọng người gọi bị nhận ra", "Một người phụ nữ từng gọi đến kể chuyện nhà chồng bị hàng xóm nhận ra giọng qua đoạn ghi âm đài đăng lại. Chị mất việc, con chị bị trêu ở trường. Luật sư của chị gửi thư cho đài, và ban giám đốc chỉ vào tên bạn trên chương trình.", [
      C("Xin lỗi trên sóng, gỡ toàn bộ ghi âm", { counters: step(c, RV, { rad_bond: 1 }), income_mult: 0.8, flags: ["rad_apologized"] }, "Mất lượng nghe, sửa được phần nào"),
      C("Để đài lo, mình im lặng", { counters: step(c, RV), happy: -5, flags: ["rad_silent"] }, "Giữ chỗ, mang theo một món nợ"),
      C("Đứng ra làm chứng cho chị, rời đài", { counters: step(c, RV), ...leave(RV), rel: 4, flags: ["rad_testified", "ex_radio"] }, "Mất nghề, đứng về phía người bị hại")], 0);
    const o = role(c, "official");
    return T("Bản tin về con sông", `Sáng nay cá chết trắng một khúc sông, người dân gọi về đài không ngớt. Bản tin bạn được giao đọc lúc sáu giờ nói nước sông 'đã an toàn', trích một nguồn bạn không kiểm chứng được.${o ? ` ${N(o)} đã gọi cho giám đốc đài từ tối qua.` : ""}`, [
      C("Đọc đúng bản được giao", { counters: step(c, RV), happy: -6, flags: ["rad_read_it"], ...(o ? { trust: { npc: o, delta: 0.15 } } : {}) }, "Giữ chỗ, giọng bạn thành lời bảo đảm"),
      C("Đọc, thêm câu 'chưa có xét nghiệm độc lập'", { counters: step(c, RV), agency: 0.02, gamble: { p: 0.5, win: { counters: { rad_bond: 2 }, flags: ["rad_one_line"], log: "Câu nói ấy được người nghe chép lại. Ba ngày sau, kết quả xét nghiệm cho thấy bạn đúng." }, lose: { income_mult: 0.6, flags: ["rad_one_line", "rad_benched"], log: "Bạn bị rút khỏi bản tin sáng, chuyển sang đọc dự báo thời tiết." } } }, "Đúng nghề, có thể mất sóng", { tier: "sovereign" }),
      C("Từ chối lên sóng, nộp đơn nghỉ", { counters: step(c, RV), ...leave(RV), happy: 2, flags: ["rad_refused", "ex_radio"] }, "Giọng sạch, mất nghề")], 0, o ? { npc: o } : {});
  }, adult),
  beat(RV, 4, 5, (c) => {
    const loyal = (c.counters.rad_bond ?? 0) >= 2 || f(c, "rad_listener_first") || f(c, "rad_one_line");
    if (loyal) return T("Ba nghìn lá thư", `Đài thông báo sáp nhập, chương trình của bạn bị cắt từ tháng sau. Trong hai tuần, ba nghìn thính giả gửi thư và tin nhắn${f(c, "rad_one_line") ? ", nhiều người nhắc câu bạn thêm vào bản tin về con sông năm nào" : ""}. Một nền tảng âm thanh lớn mời bạn về với lương gấp rưỡi.`, [
      C("Mở chương trình độc lập, thính giả góp tiền", { counters: step(c, RV, { rad_bond: 1 }), agency: 0.03, gamble: { p: 0.55, win: { income_mult: 1.3, flags: ["rad_independent"], log: "Tháng đầu, hai nghìn người góp tiền. Bạn thu âm trong một căn phòng thuê theo tháng." }, lose: { income_mult: 0.7, flags: ["rad_independent"], log: "Người ta thương bạn, nhưng ít ai góp tiền đều đặn." } } }, "Lựa chọn thứ ba: đài của người nghe", { tier: "sovereign" }),
      C("Về nền tảng lớn", { counters: step(c, RV), income_mult: 1.5, flags: ["rad_platform"] }, "Lương cao, chương trình chạy theo số liệu"),
      C("Làm buổi phát sóng cuối, nghỉ sớm", { counters: step(c, RV), ...leave(RV), happy: 3, flags: ["ex_radio"] }, "Khép đẹp, rời nghề sớm")], 0);
    return T("Bán giọng nói", `Đài sáp nhập, bạn có tên trong danh sách dôi dư.${f(c, "rad_read_it") ? " Người ta vẫn nhận ra giọng bạn: giọng đọc bản tin về con sông năm ấy." : ""} Một công ty công nghệ muốn mua quyền giọng nói của bạn để máy tổng hợp đọc mọi thứ, mãi mãi, với một khoản bằng hai năm lương.`, [
      C("Bán đứt giọng nói", { counters: step(c, RV), money: 1.8, income_mult: 0.7, flags: ["rad_voice_sold"] }, "Hai năm lương, giọng bạn nói điều bạn không nói"),
      C("Cho thuê năm năm, cấm dùng vào lừa đảo, chính trị", { counters: step(c, RV), agency: 0.03, gamble: { p: 0.45, win: { money: 0.8, flags: ["rad_voice_leased"], log: "Họ ký, với một điều khoản lần đầu có trong hợp đồng của họ." }, lose: { money: 0.1, log: "Họ mua giọng của người khác. Bạn nhận một khoản phí thử giọng." } } }, "Lựa chọn thứ ba: cho thuê có điều kiện", { tier: "sovereign" }),
      C("Từ chối, rời sóng đi dạy luyện giọng", { counters: step(c, RV), ...leave(RV), money: 0.05, flags: ["ex_radio", "rad_voice_coach"] }, "Giữ giọng cho mình, rời sóng")], 1);
  }, adult),
  beat(RV, 5, 6, (c) => T("Giọng đọc cho người không nhìn thấy", `Một thư viện dành cho người khiếm thị nhờ bạn thu âm sách, không có thù lao. Cùng tháng, một đài lớn mời bạn dẫn chương trình hoài niệm cuối tuần.${f(c, "rad_voice_sold") ? " Trong thang máy, bạn nghe giọng mình đọc một câu quảng cáo bạn chưa từng nói." : (c.counters.rad_bond ?? 0) >= 2 ? " Ông thính giả gọi đến mỗi tuần suốt mười lăm năm vừa mất; con gái ông gửi bạn chiếc radio cũ của ông." : ""}`, [
    C("Thu âm sách cho thư viện", { counters: step(c, RV), money: -0.02, happy: 5, flags: ["passed_on"] }, "Không tiền, giọng bạn ở lại lâu hơn bạn"),
    C("Nhận chương trình hoài niệm", { counters: step(c, RV), money: 0.2, happy: 2 }, "Thu nhập tốt, sống bằng ngày cũ"),
    C("Tắt micro lần cuối, về nghỉ", { counters: step(c, RV), ...leave(RV), health: 3, happy: 2, flags: ["ex_radio"] }, "Nghỉ ngơi, im lặng sau ba mươi năm")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(RV, "rad_regular", [20, 75], 7, (c) => T("Người gọi lúc hai giờ sáng", vary("radr", c.age, [
    "Một ông cụ gọi vào chương trình đêm nào cũng như đêm nào, chỉ để kể hôm nay ăn gì. Biên tập viên muốn chặn số ông vì 'chiếm sóng'.",
    "Một tài xế xe tải gọi đến mỗi đêm từ một trạm dừng khác nhau, xin một bài hát cho vợ ở nhà. Trưởng ca bảo chương trình không phải tổng đài riêng."]), [
    C("Dành cho người ấy năm phút mỗi tuần", { money: -0.01, rel: 2, counters: { rad_bond: 1 } }, "Mất năm phút quảng cáo, giữ một người nghe"),
    C("Chặn số, giữ nhịp chương trình", { bw: 2, counters: { rad_bond: -1 } }, "Chương trình gọn, đêm của ai đó dài hơn")], 0)),
  daily(RV, "rad_miracle", [20, 75], 8, () => T("Quảng cáo thuốc thần", "Đài nhận quảng cáo một loại thuốc thảo dược 'chữa dứt điểm tiểu đường' và giao cho bạn đọc, vì thính giả tin giọng bạn nhất. Tiền quảng cáo đủ trả lương cả ca đêm ba tháng.", [
    C("Đọc", { money: 0.04, counters: { honest: -1, rad_bond: -1 } }, "Giữ lương cả ca, đem giọng mình ra bảo lãnh"),
    C("Từ chối, để người khác đọc", { income_mult: 0.95, counters: { honest: 1 } }, "Giọng sạch, mất lòng phòng kinh doanh"),
    C("Đọc, kèm câu 'hãy hỏi bác sĩ trước khi dùng'", { gamble: { p: 0.5, win: { counters: { rad_bond: 1 }, log: "Nhãn hàng phàn nàn, nhưng đài giữ câu đó cho mọi quảng cáo thuốc." }, lose: { money: -0.03, log: "Nhãn hàng rút quảng cáo. Phòng kinh doanh tính khoản đó lên đầu bạn." } } }, "Nói được nửa câu thật, có thể mất tiền", { tier: "awakened" })], 1)),
  daily(RV, "rad_dawn", [20, 65], 8, (c) => T("Báo thức lúc ba giờ rưỡi", vary("radd", c.age, [
    "Bạn chuyển sang ca sáng: dậy lúc ba giờ rưỡi, lên sóng năm giờ. Cả năm nay bạn chưa ăn tối cùng ai.",
    "Ca sáng sang năm thứ năm. Bạn ngủ gục trên xe buýt, tỉnh dậy ở bến cuối."]), [
    C("Xin đổi ca, chịu khung giờ kém hơn", { income_mult: 0.9, health: 3, rel: 3, flags: ["rad_day_shift"] }, "Ít người nghe hơn, có lại buổi tối"),
    C("Giữ ca sáng, giờ vàng của đài", { health: -3, rel: -2, money: 0.03, counters: { rad_bond: 1 } }, "Đông người nghe, cơ thể trả giá")], 1)),
  daily(RV, "rad_cohost", [20, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Người dẫn cùng", `Đài ghép bạn với ${N(r)} trong chương trình buổi sáng. ${N(r)} cắt lời bạn trên sóng, kể lại câu đùa của bạn như của mình, và lượng nghe đang tăng vì hai người cãi nhau.`, [
    C("Cãi lại trên sóng cho thính giả nghe", { money: 0.03, bw: -3, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "trận cãi nhau trên sóng buổi sáng" } }, "Lượng nghe tăng, sáng nào cũng là một trận"),
    C("Đề nghị chia rõ phần, tập trước mỗi buổi", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "thỏa thuận chia phần dẫn buổi sáng" }, log: "Hai người tìm ra nhịp. Chương trình hay hơn khi không ai phải thắng." }, lose: { happy: -2, log: "Họ đồng ý trước mặt sếp, rồi vẫn cắt lời bạn." } } }, "Có thể thành cặp đôi, có thể bị lừa", { tier: "awakened" }),
    C("Xin tách chương trình", { income_mult: 0.9, happy: 2 }, "Yên thân, khung giờ kém hơn")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RV, "rad_names", [20, 70], 9, (c) => T("Cái tên đọc sai", VN(c)
    ? "Bạn đọc sai tên một bản của đồng bào dân tộc trong bản tin, ba lần trong một tuần. Một thầy giáo cắm bản viết thư về đài: 'Người ta chỉ gọi đúng tên bản tôi khi có lũ quét.'"
    : "Bạn đọc sai tên một ngôi làng của cộng đồng thiểu số trong bản tin, ba lần trong một tuần. Một thầy giáo ở làng viết thư về đài: 'Người ta chỉ gọi đúng tên làng tôi khi có tai nạn.'", [
    C("Gọi cho thầy giáo, học đọc cho đúng", { know: 3, bw: -2, counters: { rad_bond: 1 }, flags: ["rad_learned_names"] }, "Tốn công, cả bản tin chuẩn hơn"),
    C("Xin lỗi một câu trên sóng", { happy: -1, counters: { rad_bond: 1 } }, "Nhanh gọn, lần sau có thể lại sai"),
    C("Bỏ qua, ai cũng đọc như thế", { bw: 1, counters: { rad_bond: -1 } }, "Đỡ việc, một ngôi làng thôi nghe đài")], 0)),
  daily(RV, "rad_banned_song", [20, 70], 9, () => T("Bài hát không được phát", "Một thính giả xin bài hát nằm trong danh sách không phát của đài từ nhiều năm, không ai nhớ vì sao. Người đó nói đây là bài mẹ họ hay hát trước khi mất.", [
    C("Phát luôn", { gamble: { p: 0.5, win: { counters: { rad_bond: 2 }, log: "Không ai trên đài nói gì. Hôm sau có hai trăm tin nhắn cảm ơn." }, lose: { income_mult: 0.85, flags: ["rad_warned"], log: "Bạn bị kỷ luật, cắt thưởng nửa năm." } } }, "Đẹp lòng người nghe, có thể bị kỷ luật"),
    C("Đọc lời bài hát như đọc một bài thơ", { bw: -2, agency: 0.02, counters: { rad_bond: 1 } }, "Lựa chọn thứ ba: lách khung một cách lặng lẽ", { tier: "sovereign" }),
    C("Từ chối, giải thích luật của đài", { happy: -2 }, "An toàn, một đêm buồn")], 2)),
  daily(RV, "rad_flood", [20, 70], 9, () => T("Bản tin trước giờ xả lũ", "Mười một giờ đêm, một người quen làm ở nhà máy thủy điện nhắn: đập sẽ xả lũ trong ba tiếng nữa. Thông báo chính thức chưa có. Đọc sai, cả vùng hoảng loạn; chờ đợi, vùng hạ lưu đang ngủ.", [
    C("Đọc cảnh báo ngay, nói rõ nguồn chưa chính thức", { agency: 0.02, gamble: { p: 0.7, win: { counters: { rad_bond: 2 }, rel: 3, log: "Nước về lúc hai giờ sáng. Vùng hạ lưu đã kịp dọn đồ lên cao." }, lose: { income_mult: 0.85, flags: ["rad_false_alarm"], log: "Đập không xả. Bạn bị kỷ luật vì gây hoang mang." } } }, "Có thể cứu người, có thể gây hoảng loạn"),
    C("Gọi ba nơi xác minh rồi mới đọc", { bw: -3, gamble: { p: 0.5, win: { counters: { rad_bond: 1 }, log: "Bạn xác minh được lúc nửa đêm, đọc tin sớm hơn mọi đài khác." }, lose: { happy: -6, log: "Đến khi xác minh xong, nước đã vào nhà dân." } } }, "Chắc chắn hơn, có thể quá muộn", { tier: "awakened" }),
    C("Chờ thông báo chính thức", { happy: -2, counters: { rad_bond: -1 } }, "Đúng quy trình, không phải chịu trách nhiệm")], 1)),
  daily(RV, "rad_prison", [20, 75], 9, () => T("Lá thư từ trại giam", "Một phạm nhân viết thư cho chương trình: đêm nào anh cũng nghe bạn qua chiếc loa chung của trại. Anh nhờ bạn đọc trên sóng một lá thư gửi con gái, người đã mười năm không nói chuyện với anh.", [
    C("Đọc lá thư trên sóng", { counters: { rad_bond: 1 }, gamble: { p: 0.5, win: { happy: 5, log: "Một tháng sau, đài nhận được thư của cô con gái. Chỉ một dòng: 'Con đã nghe.'" }, lose: { happy: -2, log: "Vài thính giả gọi đến trách đài cho người phạm tội lên sóng." } } }, "Có thể nối lại một gia đình, có thể bị chê"),
    C("Gửi lá thư đến tận nhà cô gái", { bw: -3, rel: 2, flags: ["rad_letter_delivered"] }, "Tốn công, kín đáo hơn"),
    C("Không đọc thư của phạm nhân", { counters: { rad_bond: -1 } }, "Không rắc rối, một lời nhắn bị bỏ lại")], 0)),
  daily(RV, "rad_podcast", [20, 65], 8, () => T("Phòng thu trong tủ quần áo", "Bạn lót chăn bông trong tủ quần áo, làm một chương trình riêng mỗi tuần về những nghề sắp mất. Hợp đồng với đài cấm người dẫn làm chương trình bên ngoài. Chương trình đã có năm nghìn người nghe.", [
    C("Xin phép đài, chia doanh thu", { money: 0.02, gamble: { p: 0.5, win: { flags: ["rad_side_show"], counters: { rad_bond: 1 }, log: "Đài đồng ý, còn phát lại vài tập." }, lose: { log: "Đài từ chối. Bạn dừng chương trình." } } }, "Đúng luật, có thể phải dừng"),
    C("Làm tiếp dưới một cái tên khác", { money: 0.04, flags: ["rad_side_show"], counters: { honest: -1 } }, "Giữ cả hai, có thể bị phát hiện"),
    C("Dừng chương trình riêng", { bw: 3, happy: -2 }, "An toàn, bỏ dở một điều mình thích")], 0)),
  daily(RV, "rad_quit", [28, 65], 99, () => T("Giấc ngủ của người bình thường", "Một người bạn mời bạn về làm hành chính ở bệnh viện: ca ngày, nghỉ cuối tuần, lương đều. Đã lâu lắm rồi bạn chưa ngủ trọn một đêm.", [
    C("Nhận, tắt micro", { ...leave(RV), health: 3, flags: ["ex_radio"] }, "Ngủ ngon, giọng chỉ còn cho người nhà"),
    C("Ở lại với sóng", { happy: 1, counters: { rad_bond: 1 } }, "Mệt, vẫn có người chờ nghe")], 1), lowMood),

  /* ---------- gia đình ---------- */
  cross(RV, "rad_caller17", [22, 75], (c) => !!role(c, "father") || !!role(c, "mother") || (c.married && !!role(c, "spouse")), (c, N) => {
    const p = role(c, "father") ?? role(c, "mother");
    if (p) return T("Thính giả số mười bảy", `Một cuộc gọi vào chương trình đêm: giọng một người lớn tuổi, xưng tên giả, nói muốn xin lỗi đứa con vì chưa bao giờ nói mình tự hào về nó. Bạn nhận ra đó là ${N(p)}.`, [
      C("Trả lời trên sóng, như với mọi thính giả", { happy: 4, trust: { npc: p, delta: 0.3 }, counters: { rad_bond: 1 } }, "Cả thành phố nghe chuyện nhà bạn"),
      C("Cắt cuộc gọi, gọi lại sau giờ phát", { bw: -2, trust: { npc: p, delta: 0.15 } }, "Kín đáo, lỡ một khoảnh khắc lạ lùng"),
      C("Giữ giọng chuyên nghiệp, chuyển sang bài hát", { happy: -2, trust: { npc: p, delta: -0.15 } }, "Chương trình suôn sẻ, một lời chưa đáp")], 0, { npc: p });
    const s = role(c, "spouse")!;
    return T("Giọng nói dành cho người lạ", `${N(s)} nói bạn dịu dàng với hàng nghìn người lạ mỗi đêm, rồi về nhà không còn chữ nào cho người nhà. Hôm qua là kỷ niệm ngày cưới, và bạn đang trên sóng.`, [
      C("Xin nghỉ một ca mỗi tuần để ở nhà", { income_mult: 0.95, trust: { npc: s, delta: 0.2 }, promise: { to: s, what: "nghỉ một ca mỗi tuần để ở nhà", years: 2 } }, "Mất chút lương, giữ một lời hứa", { tier: "awakened" }),
      C("Dành một bài hát trên sóng cho người nhà", { trust: { npc: s, delta: 0.05 }, counters: { rad_bond: 1 } }, "Đẹp trên sóng, ở nhà vẫn im"),
      C("Nói đây là nghề, ai cũng phải hiểu", { money: 0.02, trust: { npc: s, delta: -0.2 } }, "Giữ ca, khoảng cách lớn thêm")], 0, { npc: s });
  }),
];

export const PACK_MEDIA_B: Storylet[] = [...VLOGGER, ...DIRECTOR, ...ADCREATIVE, ...RADIO];
