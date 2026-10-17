/**
 * Gói "Tay nghề & làng nghề" A: NGHỆ NHÂN LÀNG NGHỀ · THỢ MAY THÀNH NHÀ THIẾT KẾ · THỢ CẮT TÓC · THỢ MỘC.
 * Theo chuẩn của singer.ts và docs/content-guide.md. Tiền tố id: atn_ · fsh_ · brb_ · cpn_.
 * Bộ đếm riêng: atn_name, atn_young · fsh_name, fsh_team · brb_regulars · cpn_craft.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;

/* =====================================================================
 * NGHỆ NHÂN LÀNG NGHỀ (lò gốm của làng) — tiền tố atn_
 * ===================================================================== */
const AT = "artisan";

const ATN_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AT, "atn_t_clay", [8, 13], () => true, (c) => T("Con vật đất bờ ao", `Sau nhà có một lò gốm cũ. Bạn hay ngồi xem ông thợ già vuốt bình rồi về nặn lại bằng đất bờ ao. Chiều nay ông cầm con ${vn(c) ? "trâu" : "ngựa"} đất của bạn lên, xoay một vòng trên tay, bảo để ông nung thử cùng mẻ tới.`, [
    C("Xin ông cho ngồi phụ lò mỗi chiều", { know: 2, rel: -1, flags: [talentFlag(AT)], counters: { talents_seen: 1 } }, "Mất giờ chơi với bạn, tay bắt đầu có nghề"),
    C("Để ông nung cho vui rồi thôi", { happy: 1, counters: { talents_seen: 1 } }, "Một món đồ chơi đẹp, không hơn")], 0)),
  talent(AT, "atn_t_brush", [12, 16], () => true, () => T("Vẽ men mùa hè", "Mùa hè, xưởng gốm đầu làng thuê trẻ con vẽ hoa lam lên bát, trả theo chiếc. Ba ngày đầu bạn vẽ hỏng cả chồng. Đến tuần thứ hai, bà chủ xưởng đặt riêng mấy chiếc bát của bạn lên kệ.", [
    C("Ở lại vẽ cả hè, bỏ lớp học thêm", { money: 0.02, know: -1, flags: [talentFlag(AT)], counters: { talents_seen: 1 } }, "Có tiền tiêu vặt và một cái nghề, hụt bài vở"),
    C("Quay về học thêm như bố mẹ muốn", { know: 3, counters: { talents_seen: 1 } }, "Điểm số chắc hơn, bút vẽ cất đi")], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(AT, "atn_d_lastkiln", [18, 45], () => true, () => T("Lò gốm cuối cùng của làng", "Ông chủ lò cuối cùng trong làng đã bảy mươi tư tuổi; con cái ông đều đi làm ở khu công nghiệp. Ông nói nếu bạn chịu ở lại ba năm, ăn cơm nhà ông, nhận nửa lương ngoài kia, ông sẽ dạy hết, kể cả công thức men.", [
    C("Ở lại học ba năm", { ...become(AT), counters: { doors_seen: 1 }, money: -0.1, happy: 3, agency: 0.01 }, "Nửa lương ba năm, đổi lấy một nghề"),
    C("Học buổi tối, giữ việc ban ngày", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(AT), log: "Một năm sau, ông giao cho bạn chìa khóa lò." }, lose: { log: "Ông yếu đi, đóng lò sớm hơn dự tính. Bạn còn giữ mấy chiếc bình mộc." } } }, "Đỡ thiệt, có thể không kịp học"),
    C("Thôi, lò này không nuôi nổi ai", { counters: { doors_seen: 1 }, money: 0.02 }, "Đủ ăn, làng mất một lò")], 0)),
  door(AT, "atn_d_order", [24, 55], () => true, () => T("Hai trăm cái bát men tro", "Một cửa hàng đồ thủ công ở thành phố tìm về làng bạn, hỏi ai còn làm được hai trăm cái bát men tro như ngày trước. Xưởng của bà bạn bỏ không từ ngày bà mất, lò vẫn còn nguyên, chỉ thiếu người đốt.", [
    C("Bỏ việc, về làng mở lại xưởng của bà", { ...become(AT), counters: { doors_seen: 1 }, money: -0.2, agency: 0.02, flags: ["atn_grandma_kiln"] }, "Mất lương ổn định, nhóm lại lò của bà"),
    C("Nhận đơn, làm vào cuối tuần", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.3, win: { ...become(AT), flags: ["atn_grandma_kiln"], log: "Hai trăm cái bát ra lò lành lặn. Cửa hàng đặt tiếp, bạn xin nghỉ việc." }, lose: { money: -0.03, log: "Một nửa số bát nứt trong lò. Cửa hàng hủy đơn." } } }, "Giữ việc, dễ hỏng mẻ"),
    C("Giới thiệu họ sang làng bên", { counters: { doors_seen: 1 }, rel: 1 }, "Yên ổn, lò của bà tiếp tục nguội")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(AT, 1, 1, (c) => T("Mẻ lò đầu tiên mang tên bạn", `Hai trăm món đồ mộc xếp kín lò. ${f(c, "atn_grandma_kiln") ? "Lò của bà" : "Lò của ông thầy"} đốt bằng củi, phải canh lửa ba ngày ba đêm, mỗi giờ thêm một bó. Xưởng bên cạnh mời bạn gửi nung lò ga: một đêm là xong, màu men đều nhưng phẳng lặng.`, [
    C("Đốt củi ba ngày, tự canh lửa", { counters: step(c, AT), health: -3, flags: ["atn_wood_kiln"], gamble: { p: 0.5, win: { counters: { atn_name: 1 }, happy: 5, log: "Mở lò, men tro chảy thành những vệt xanh, không chiếc nào giống chiếc nào." }, lose: { happy: -3, log: "Một bên lò thiếu lửa. Gần nửa mẻ ra màu đục." } } }, "Kiệt sức, may rủi, có thể ra men đẹp"),
    C("Gửi lò ga cho chắc ăn", { counters: step(c, AT), money: 0.03, flags: ["atn_gas"] }, "Chắc chắn, đồ đều nhưng không ai nhớ"),
    C("Rủ đám trẻ trong làng thay ca canh lửa", { counters: step(c, AT, { atn_young: 1 }), rel: 3, money: -0.02, flags: ["atn_wood_kiln"] }, "Tốn cơm nước, làng có thêm người biết lửa", { tier: "awakened" })], 0), (c) => c.age >= 18),
  beat(AT, 2, 3, (c) => T("Ba nghìn chiếc mỗi tháng", `Một công ty xuất khẩu thấy bình của bạn ở hội chợ. Họ muốn ba nghìn chiếc mỗi tháng, một mẫu duy nhất, đổ khuôn, dán nhãn của họ. Giá mỗi chiếc bằng một phần năm giá bạn bán lẻ, nhưng đủ nuôi cả xóm.${n(c, "atn_young") > 0 ? " Mấy đứa trẻ từng canh lửa với bạn hỏi có được vào làm không." : ""}`, [
    C("Ký, mua khuôn, thuê cả xóm", { counters: step(c, AT, { atn_name: -1 }), income_mult: 1.6, custom: "borrow:0.3", flags: ["atn_mass"] }, "Tiền đều, tên bạn biến mất khỏi đáy bình"),
    C("Từ chối, giữ hàng làm tay", { counters: step(c, AT, { atn_name: 1 }), income_mult: 1.1, flags: ["atn_handmade"] }, "Ít tiền, mỗi chiếc vẫn là của bạn"),
    C("Gom các lò trong làng, đàm phán chung nhãn làng", { counters: step(c, AT), agency: 0.03, bw: -5, gamble: { p: 0.35 + 0.1 * Math.min(2, n(c, "atn_name")) + (n(c, "atn_young") > 0 ? 0.05 : 0), win: { flags: ["atn_coop"], income_mult: 1.4, counters: { atn_name: 1 }, log: "Mười một lò ký chung. Đáy mỗi chiếc bình in tên làng, cạnh dấu của từng nhà." }, lose: { income_mult: 1.05, log: "Ba lò lớn ký riêng sau lưng. Công ty quay đi, bạn mất nửa năm họp hành." } } }, "Mất nửa năm họp, có thể giữ tên cho cả làng", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(AT, 3, 4, (c) => T("Hố đất sét bị bán", `Hố đất sét trắng đầu làng, thứ đất làm nên màu men của bạn, vừa được bán cho một công ty san lấp để làm ${c.poor_country ? "bãi chứa vật liệu" : "khu nhà ở"}. Ba tháng nữa máy xúc vào. ${f(c, "atn_mass") ? "Đơn xuất khẩu ăn mỗi tháng mười xe đất, hợp đồng phạt nặng nếu giao chậm." : f(c, "atn_coop") ? "Ba mươi hộ trong nhãn làng đều trông vào hố đất ấy." : "Đất bạn trữ chỉ đủ dùng chừng một năm."}`, [
    C("Vay tiền mua lại hố đất", { counters: step(c, AT), custom: "borrow:0.8", flags: ["atn_owns_pit"] }, "Nợ nặng, giữ được gốc của nghề"),
    C("Chuyển sang đất mua của nhà máy", { counters: step(c, AT, { atn_name: -1 }), money: 0.05, flags: ["atn_bought_clay"] }, "Yên ổn, men không còn là men của làng"),
    C("Lập hồ sơ xin giữ hố đất như di sản", { counters: step(c, AT), bw: -5, gamble: { p: f(c, "atn_coop") ? 0.55 : 0.35, win: { flags: ["atn_heritage_pit"], counters: { atn_name: 1 }, log: "Tỉnh tạm dừng san lấp để khảo sát. Hố đất được khoanh lại." }, lose: { flags: ["atn_bought_clay"], log: "Hồ sơ bị trả về. Máy xúc vào đúng hẹn." } } }, "Tốn nửa năm giấy tờ, có thể cứu được hố", { tier: "awakened" }),
    C("Tắt lò, xin vào khu công nghiệp", { counters: step(c, AT), ...leave(AT), flags: ["ex_artisan"], happy: -4 }, "Lương đều, lò nguội từ đây")], 0), (c) => c.age >= 18),
  beat(AT, 4, 5, (c) => {
    if (f(c, "atn_mass") && !f(c, "atn_coop")) return T("Mẫu bình làm bằng máy", "Công ty xuất khẩu báo cắt đơn: họ tìm được một nhà máy làm đúng mẫu bình của bạn bằng máy, giá bằng một phần ba. Bốn mươi người trong xóm đang làm cho bạn; khoản vay mua khuôn còn hơn một nửa.", [
      C("Cắt bớt người, xin giãn nợ", { counters: step(c, AT), custom: "restructure", rel: -4, income_mult: 0.7 }, "Giữ được xưởng, mất lòng nửa xóm"),
      C("Đập khuôn, làm tay lại với năm thợ giỏi", { counters: step(c, AT, { atn_name: 1 }), income_mult: 0.8, unflags: ["atn_mass"], flags: ["atn_back_to_hand"] }, "Nhỏ lại, mỗi chiếc lại có tên bạn", { tier: "awakened" }),
      C("Bán xưởng cho công ty, ở lại làm quản đốc", { counters: step(c, AT), ...leave(AT), money: 0.4, flags: ["atn_sold_workshop"] }, "Có tiền trả nợ, không còn là chủ lò")], 0);
    if (f(c, "atn_coop") || f(c, "atn_owns_pit") || f(c, "atn_heritage_pit") || n(c, "atn_name") >= 2) return T("Hồ sơ danh hiệu nghệ nhân", `${vn(c) ? "Sở văn hóa" : "Cơ quan văn hóa"} lập hồ sơ xét danh hiệu nghệ nhân cho bạn, kèm trợ cấp hằng tháng. Một người môi giới nói hồ sơ sẽ "đi nhanh" nếu gửi một khoản. Cùng tuần, một bảo tàng ở nước ngoài muốn mua chiếc bình đẹp nhất của bạn và mời sang trình diễn ba tháng.`, [
      C("Gửi khoản 'cho nhanh'", { counters: step(c, AT), money: -0.2, income_mult: 1.3, flags: ["atn_title"], secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [3, 10], note: "gửi tiền để hồ sơ nghệ nhân đi nhanh" } }, "Có danh hiệu sớm, kèm một bí mật"),
      C("Nộp hồ sơ sạch, đi trình diễn ba tháng", { counters: step(c, AT), rel: -2, gamble: { p: 0.5, win: { flags: ["atn_title"], income_mult: 1.25, log: "Danh hiệu về sau hai năm chờ. Không ai nhắc đến phong bì." }, lose: { income_mult: 1.1, log: "Hồ sơ bị xếp lại năm sau. Chiếc bình nằm trong tủ kính bảo tàng, có tên bạn." } } }, "Sạch sẽ, có thể chờ rất lâu"),
      C("Bỏ qua danh hiệu, mở lớp miễn phí cho trẻ làng", { counters: step(c, AT, { atn_young: 2 }), income_mult: 0.9, agency: 0.02, flags: ["atn_school"] }, "Không danh, bớt thu nhập, nghề có người nối", { longterm: true })], 2);
    return T("Bàn xoay ở sảnh khách sạn", "Đơn hàng thưa dần, thợ trẻ bỏ đi gần hết. Một khu nghỉ dưỡng mời bạn ngồi bàn xoay ở sảnh, ba suất mỗi ngày, mặc áo truyền thống, cho khách chụp ảnh. Lương gấp đôi tiền bán bình cả tháng.", [
      C("Nhận, nặn cho khách xem", { counters: step(c, AT), income_mult: 1.3, happy: -3, flags: ["atn_show"] }, "Đủ sống, nghề thành tiết mục"),
      C("Giữ lò, làm cho vài nhà sưu tầm", { counters: step(c, AT, { atn_name: 1 }), income_mult: 0.8, happy: 2 }, "Nghèo đi, lửa vẫn của mình"),
      C("Tắt lò, bán đất xưởng", { counters: step(c, AT), ...leave(AT), money: 0.5, flags: ["ex_artisan"] }, "Có vốn dưỡng già, làng mất một lò")], 1);
  }, (c) => c.age >= 18),
  beat(AT, 5, 6, (c) => T("Cuốn sổ men tro", `${f(c, "atn_title") ? "Tấm bằng nghệ nhân treo trên vách xưởng. " : f(c, "atn_school") ? "Lớp học của bạn đã có ba khóa ra nghề. " : f(c, "atn_show") ? "Bạn đã nặn cho khách xem hàng nghìn lần. " : ""}Công thức men của bạn chỉ nằm trong đầu và trong một cuốn sổ ố vàng: bao nhiêu tro rơm, bao nhiêu tro trấu, bao nhiêu đất ${f(c, "atn_bought_clay") ? "mua về" : "đầu làng"}. Một công ty gốm sứ lớn trả giá để mua cuốn sổ ấy.`, [
    C("Truyền riêng cho một học trò ruột", { counters: step(c, AT), flags: ["atn_lineage"], happy: 3 }, "Giữ nghề trong một dòng, dễ mất theo người"),
    C("Công bố công thức cho cả làng", { counters: step(c, AT), flags: ["passed_on"], rel: 5, agency: 0.02 }, "Không còn bí mật, làng có thêm một nghề", { tier: "awakened" }),
    C("Bán cuốn sổ cho công ty", { counters: step(c, AT), money: 0.6, happy: -2, flags: ["atn_sold_recipe"] }, "Tiền dưỡng già, men làng thành hàng loạt")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(AT, "atn_tourists", [18, 70], 7, (c) => T("Xe khách dừng trước xưởng", vary("atnto", c.age, [
    "Mỗi sáng có hai xe khách du lịch dừng trước xưởng. Khách đứng chặn lối, chụp ảnh, sờ vào đồ mộc đang phơi, hỏi giá rồi đi.",
    "Một công ty lữ hành muốn đưa khách đến xưởng bạn mỗi chiều, mỗi người tự nặn một cái chén mang về, chia cho bạn một nửa tiền vé."]), [
    C("Mở góc cho khách tự nặn, thu tiền", { money: 0.05, bw: -3, flags: ["atn_tourism"] }, "Có tiền đều, mất giờ làm"),
    C("Treo biển: xưởng làm việc, không tiếp khách", { counters: { atn_name: 1 }, rel: -2 }, "Yên để làm, làng chê bạn khó tính")], 0)),
  daily(AT, "atn_antique", [22, 65], 9, () => T("Bình làm cũ cho lái buôn", "Một lái buôn đặt hai mươi chiếc bình theo mẫu cổ, dặn làm cho cũ: men rạn, chân bám rêu. Anh ta nói để trang trí khách sạn. Bạn từng thấy hàng của anh ta bày ở chợ đồ cổ, ghi là đồ đào được.", [
    C("Làm, không hỏi thêm", { money: 0.2, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 9], note: "làm bình giả cổ cho lái buôn bán như đồ đào được" } }, "Tiền lớn, tên bạn dính vào một vụ lừa"),
    C("Làm, nhưng khắc dấu xưởng và năm làm dưới đáy", { gamble: { p: 0.4, win: { money: 0.1, counters: { atn_name: 1 }, log: "Anh ta càu nhàu nhưng vẫn lấy. Đáy bình nào cũng có năm làm." }, lose: { log: "Anh ta hủy đơn, sang làng bên đặt." } } }, "Giữ sạch tên, có thể mất mối", { tier: "awakened" }),
    C("Từ chối", { counters: { honest: 1 }, money: -0.02 }, "Mất một đơn lớn")], 1)),
  daily(AT, "atn_apprentice", [22, 65], 8, () => T("Học trò khéo nhất xin đi", "Người học trò khéo tay nhất của bạn được khu công nghiệp nhận vào, lương gấp đôi bạn trả. Cậu đứng ở cửa xưởng cả buổi chiều, chưa dám nói.", [
    C("Tăng lương, giữ lại", { money: -0.08, counters: { atn_young: 1 } }, "Tốn tiền, giữ được đôi tay giỏi"),
    C("Chúc đi, dặn muốn thì cứ quay về", { happy: -2, flags: ["atn_door_open"] }, "Nhẹ lòng, xưởng thiếu người"),
    C("Chia cho một phần xưởng, cùng làm chủ", { income_mult: 0.9, agency: 0.02, flags: ["atn_shared_workshop"], counters: { atn_young: 1 } }, "Bớt phần mình, có người nối nghề", { tier: "sovereign" })], 1)),
  daily(AT, "atn_smoke", [22, 65], 8, (c) => T("Khói lò và khu nhà mới", `Một khu nhà mới mọc lên sát xưởng. Mỗi lần đốt lò, cư dân gọi lên ${vn(c) ? "phường" : "chính quyền"} phản ánh. Giấy báo về: trong một năm phải chuyển sang lò ga hoặc dời xưởng.`, [
    C("Vay tiền mua lò ga", { money: -0.3, flags: ["atn_gas"], unflags: ["atn_wood_kiln"] }, "Hết khiếu nại, mất màu men củi"),
    C("Đốt lò vào ban đêm, mặc kệ", { gamble: { p: 0.5, win: { log: "Năm ấy không ai đến đo khói." }, lose: { money: -0.1, flags: ["atn_fined"], log: "Bạn bị phạt, lò bị niêm phong hai tháng." } } }, "Không tốn gì, có thể bị niêm phong"),
    C("Góp với các lò, xây chung một lò củi có lọc khói", { money: -0.12, bw: -4, rel: 3, flags: ["atn_shared_kiln"] }, "Tốn tiền và sức, giữ lửa củi cho cả làng", { tier: "awakened" })], 0)),
  daily(AT, "atn_designer", [22, 65], 9, () => T("Tên in nhỏ ở mặt sau hộp", "Một nhà thiết kế nổi tiếng muốn hợp tác làm một dòng bình mới. Tên cô ấy in to trên hộp, tên bạn in nhỏ ở mặt sau. Giá bán cao gấp năm lần giá bạn vẫn bán.", [
    C("Nhận, tên nhỏ cũng được", { money: 0.15, counters: { atn_name: -1 } }, "Tiền nhiều, ít ai biết người nặn"),
    C("Đòi in tên làng và tên bạn ngang hàng", { gamble: { p: 0.45, win: { money: 0.1, counters: { atn_name: 2 }, log: "Cô ấy đồng ý. Hộp nào cũng in tên làng bạn." }, lose: { log: "Cô ấy tìm một xưởng khác dễ tính hơn." } } }, "Giữ tên, có thể mất hợp đồng", { tier: "awakened" }),
    C("Từ chối, làm theo kiểu của mình", { happy: 1, counters: { atn_name: 1 } }, "Không có tiền lớn, không ai đứng trên tên bạn")], 1)),
  daily(AT, "atn_fair", [22, 65], 7, (c) => T("Gian hàng ở hội chợ", vary("atnfa", c.age, [
    "Hội chợ thủ công ở thủ đô cho thuê gian hàng bằng tiền bán bình của cả một tháng.",
    "Một hội chợ thủ công quốc tế mời xưởng bạn tham dự. Vé máy bay và tiền chở hàng tự lo."]), [
    C("Đi, mang bốn thùng hàng", { money: -0.08, gamble: { p: 0.45, win: { money: 0.2, counters: { atn_name: 1 }, log: "Một khách sạn đặt ba trăm bộ chén." }, lose: { happy: -2, log: "Bán được mười một món, vỡ hai món lúc dỡ hàng." } } }, "Tốn tiền trước, có thể có mối lớn"),
    C("Gửi hàng ký gửi qua người quen", { money: 0.02, flags: ["atn_consign"] }, "Ít tốn, ít người biết đến bạn")], 1)),
  daily(AT, "atn_cracked", [20, 70], 8, (c) => T("Hai phần ba mẻ lò nứt", `${vn(c) ? "Trời nồm" : "Trời mưa ẩm"} cả tháng, đồ mộc chưa khô hẳn đã vào lò. Mở lò, hai phần ba mẻ nứt chân chim. Đó là hai tháng công của cả xưởng.`, [
    C("Bán rẻ hàng lỗi ở chợ", { money: 0.02, counters: { atn_name: -1 } }, "Gỡ lại ít vốn, mang tiếng hàng kém"),
    C("Đập hết, làm lại từ đầu", { money: -0.05, happy: -3, counters: { atn_name: 1 } }, "Mất trắng, giữ được tiếng"),
    C("Hàn vết nứt bằng sơn rắc bột vàng, bán như món riêng", { bw: -3, gamble: { p: 0.4, win: { money: 0.08, flags: ["atn_mended"], log: "Người mua thích chính những vết nứt." }, lose: { log: "Không ai hiểu. Chúng nằm im trong góc xưởng." } } }, "Thêm công, có thể biến lỗi thành dấu riêng", { tier: "awakened" })], 1)),
  daily(AT, "atn_dust", [25, 70], 9, () => T("Hai tháng ho không dứt", "Bạn ho suốt hai tháng. Bác sĩ chụp phổi, hỏi nghề, rồi bảo bụi đất sét và men khô đã đọng lại. Máy hút bụi cho xưởng giá bằng ba tháng thu nhập.", [
    C("Mua máy, đeo khẩu trang mọi lúc", { money: -0.25, health: 5, flags: ["atn_dust_safe"] }, "Tốn ba tháng thu nhập, giữ được phổi"),
    C("Mở cửa cho thoáng, làm tiếp", { health: -5, counters: { dust: 1 } }, "Giữ tiền, phổi trả dần")], 1)),
  daily(AT, "atn_festival", [20, 70], 10, (c) => T(vn(c) ? "Ngày giỗ tổ nghề gốm" : "Ngày hội của làng nghề", vn(c)
    ? vary("atnfe", c.age, ["Đến ngày giỗ tổ nghề gốm. Ban tế lễ nhờ bạn đứng chủ tế và góp khoản lớn nhất, vì năm nay xưởng bạn làm ăn khá.", "Đình làng mở hội tổ nghề. Các cụ muốn bạn đứng ra mở lò trình diễn trước sân đình và góp tiền dựng rạp."])
    : vary("atnfe", c.age, ["Lễ hội thường niên của làng nghề sắp diễn ra. Ban tổ chức muốn bạn mở lò trình diễn và góp khoản lớn nhất.", "Làng nghề kỷ niệm một trăm năm lò đầu tiên. Người ta muốn bạn phát biểu và đứng tên quỹ của lễ hội."]), [
    C("Góp lớn, đứng ra lo lễ", { money: -0.1, rel: 4, flags: ["atn_elder"] }, "Tốn tiền, được làng trọng"),
    C("Góp như mọi nhà", { money: -0.02, rel: 1 }, "Đỡ tốn, không ai nhắc tên"),
    C("Nhân dịp lễ, đề xuất quy ước giữ mẫu và giá", { bw: -3, agency: 0.02, gamble: { p: 0.5, win: { flags: ["atn_village_rules"], counters: { atn_name: 1 }, log: "Hai mươi lò ký quy ước: không nhái mẫu của nhau, không bán dưới giá sàn." }, lose: { rel: -2, log: "Mấy lò lớn bỏ về giữa buổi họp." } } }, "Làm luật mới cho làng, đụng lò lớn", { tier: "sovereign" })], 1)),
  daily(AT, "atn_rival", [22, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Lò mới ở đầu làng", `${N(r)} mở lò ngay đầu làng, bán cùng kiểu bình cho cùng lái buôn, giá thấp hơn bạn một phần năm. Lái buôn bắt đầu ép giá cả hai nhà.`, [
    C("Hạ giá theo", { money: -0.05, trust: { npc: r, delta: -0.1 } }, "Giữ mối, cả hai cùng lỗ"),
    C("Rủ ngồi lại, thống nhất giá sàn", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "cùng giữ giá sàn bình gốm trước lái buôn" }, money: 0.04, log: "Lái buôn thôi ép giá. Hai lò chia nhau đơn hàng." }, lose: { log: `${N(r)} gật đầu, tuần sau vẫn bán rẻ.` } } }, "Có thể cùng thắng, có thể bị lừa", { tier: "awakened" }),
    C("Đổi sang dòng hàng khác hẳn", { know: 2, bw: -3, counters: { atn_name: 1 } }, "Mất công làm mẫu mới, thoát cuộc đua giá")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(AT, "atn_quit", [30, 60], 99, () => T("Bàn vẽ có máy lạnh", "Một nhà máy gạch men cần người thiết kế hoa văn, lương cố định gấp đôi những năm lò bạn đông khách nhất. Bàn làm việc có máy lạnh, không có lửa, không có đất.", [
    C("Nhận lời, tắt lò", { ...leave(AT), flags: ["ex_artisan"] }, "Lương đều, tay không còn chạm đất"),
    C("Ở lại với lò", { happy: 2, counters: { atn_name: 1 } }, "Túng thêm vài năm")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(AT, "atn_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} không muốn nối nghề`, `${N(k)} nói thẳng: không muốn cả đời lấm đất như bạn, muốn lên thành phố học công nghệ thông tin. Lò của bạn chưa có ai khác để giao.`, [
      C("Ủng hộ con đi", { trust: { npc: k, delta: 0.2 }, flags: ["atn_no_heir"] }, "Con được đi, lò chưa có người nối"),
      C("Bắt con ở lại học nghề", { trust: { npc: k, delta: -0.25 } }, "Giữ người cho lò, mất lòng con"),
      C("Cho con đi, nhờ con làm trang bán hàng cho lò", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "lo cho con học xa, con giúp trang bán hàng của lò", years: 2 } }, "Hai bên cùng có phần, treo một lời hứa", { tier: "awakened" })], 2, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Người đã bỏ nghề gốm", `${N(p)} từng bỏ nghề gốm của làng để đi làm công nhân, vì những năm khó, nghề ấy làm cả nhà đói. Ngày bạn nhóm lại lò, ${N(p)} không nói một câu nào.`, [
      C("Mời về canh lò cùng một đêm", { gamble: { p: 0.55, win: { trust: { npc: p, delta: 0.3 }, log: `Gần sáng, ${N(p)} xếp lại một bó củi bạn đặt sai. Không ai đi ngủ.` }, lose: { trust: { npc: p, delta: -0.1 }, log: `${N(p)} bảo mệt, không ra lò.` } } }, "Có thể làm lành, có thể bị từ chối"),
      C("Hỏi vì sao ngày ấy bỏ nghề", { know: 2, happy: -1, trust: { npc: p, delta: 0.1 } }, "Nghe chuyện cũ, mở lại vết thương"),
      C("Thôi, để yên", { happy: -2 }, "Không va chạm, khoảng cách vẫn đó")], 0, { npc: p });
  }),
];

export const PACK_CRAFT_A: Storylet[] = [...ATN_CARDS];
