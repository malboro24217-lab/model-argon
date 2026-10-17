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

/* =====================================================================
 * THỢ MAY THÀNH NHÀ THIẾT KẾ — tiền tố fsh_
 * ===================================================================== */
const FS = "fashion";

const FSH_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(FS, "fsh_t_doll", [9, 14], () => true, () => T("Áo cho búp bê bằng vải vụn", "Bạn cắt vạt áo cũ của mẹ, khâu tay cho con búp bê của em một bộ đầm có cả túi và cổ lá sen. Bà thợ may đầu ngõ nhìn đường khâu, hỏi ai dạy. Không ai dạy cả.", [
    C("Xin ra tiệm bà ngồi xem mỗi chiều", { money: -0.01, know: 2, flags: [talentFlag(FS)], counters: { talents_seen: 1 } }, "Mất giờ chơi, mua kim chỉ, mở một con đường"),
    C("Giấu cái đầm đi, sợ bị mắng cắt áo", { happy: -1, counters: { talents_seen: 1 } }, "Không bị mắng, đôi tay nằm im")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FS, "fsh_d_alley", [16, 30], () => true, () => T("Tiệm may trong ngõ cần người học", "Tiệm may trong ngõ cần người học việc: ba năm, bao cơm trưa, tháng đầu chỉ được nhặt chỉ và là quần áo. Bà chủ nói người kiên nhẫn thì năm thứ hai được cầm kéo.", [
    C("Vào học, chịu ba năm lương ít", { ...become(FS), counters: { doors_seen: 1 }, money: -0.03, agency: 0.01 }, "Ba năm gần như không lương, đổi lấy cái nghề"),
    C("Học buổi tối, ban ngày đi làm", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(FS), log: "Một năm sau, bà chủ giao cho bạn may đồ cho khách quen." }, lose: { log: "Tiệm cần người cả ngày. Bà chủ nhận một người khác." } } }, "Đỡ thiệt, chậm lên tay"),
    C("Thôi, đi làm nơi khác", { counters: { doors_seen: 1 }, money: 0.02 }, "Có tiền ngay, kim chỉ để sau")], 0)),
  door(FS, "fsh_d_line", [18, 40], () => true, () => T("Một nghìn hai trăm ống tay mỗi ngày", "Ở xưởng may, mỗi ngày bạn may đúng một đường ống tay, một nghìn hai trăm lần. Bà chủ một tiệm thời trang nhỏ thấy bạn may lại chiếc áo của mình, mời về may mẫu cho tiệm: lương bằng một nửa, nhưng được làm trọn cả chiếc áo.", [
    C("Nghỉ xưởng, về may mẫu", { ...become(FS), counters: { doors_seen: 1 }, money: -0.1, happy: 3 }, "Nửa lương, học được cả chiếc áo"),
    C("May mẫu vào Chủ nhật", { counters: { doors_seen: 1 }, health: -2, gamble: { p: 0.35, win: { ...become(FS), log: "Mẫu của bạn bán chạy nhất tiệm. Bà chủ trả lương bằng xưởng để bạn về hẳn." }, lose: { log: "Bà chủ cần người cả tuần, tìm được người khác." } } }, "Giữ lương, mất ngày nghỉ"),
    C("Ở lại xưởng, lương đều", { counters: { doors_seen: 1 }, money: 0.03 }, "Đủ ăn, vẫn chỉ là một đường may")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(FS, 1, 1, (c) => T("Tấm ảnh trong tạp chí", `Một cô dâu mang đến ảnh chụp ${vn(c) ? "chiếc áo dài cưới" : "chiếc váy cưới"} của một nhà mốt nổi tiếng, muốn may y hệt, hẹn ba tuần. Bạn đã phác sẵn một mẫu khác hợp dáng cô hơn: cổ thuyền, tay lỡ, ít đính kết.`, [
    C("May y hệt tấm ảnh", { counters: step(c, FS), money: 0.04, flags: ["fsh_copier"] }, "Khách vui, bạn chỉ là đôi tay chép"),
    C("Thuyết phục cô thử mẫu của bạn", { counters: step(c, FS), gamble: { p: 0.5, win: { flags: ["fsh_own_style"], counters: { fsh_name: 1 }, happy: 4, log: "Ảnh cưới được chia sẻ khắp nơi. Ba cô dâu khác tìm đến hỏi đúng mẫu ấy." }, lose: { money: -0.02, happy: -3, log: "Cô dâu khóc trong phòng thử. Bạn may lại theo ảnh, không lấy thêm tiền." } } }, "Có thể có tên, có thể mất khách")], 1), (c) => c.age >= 18),
  beat(FS, 2, 3, (c) => T("Mười hai bộ đầu tay", `Mười hai bộ đồ đầu tay của bạn${f(c, "fsh_own_style") ? ", nối tiếp chiếc váy cưới năm nào," : ""} được một người mẫu đăng lên mạng. Một chuỗi thời trang nhanh muốn mua đứt cả mười hai mẫu để sản xuất năm mươi nghìn chiếc. Một nhà đầu tư muốn rót vốn, đổi lấy năm mươi mốt phần trăm nhãn hiệu.`, [
    C("Bán đứt mẫu cho chuỗi thời trang", { counters: step(c, FS), money: 0.6, flags: ["fsh_sold_designs"] }, "Tiền ngay, mẫu của bạn mang tên người khác"),
    C("Nhận vốn, nhường quyền chi phối", { counters: step(c, FS), income_mult: 1.6, flags: ["fsh_investor"] }, "Lớn nhanh, người khác cầm lái"),
    C("Mở đặt trước, chỉ may số đã trả tiền", { counters: step(c, FS), agency: 0.03, bw: -5, gamble: { p: 0.4 + 0.1 * Math.min(2, n(c, "fsh_name")), win: { flags: ["fsh_preorder"], income_mult: 1.3, counters: { fsh_name: 1, fsh_team: 1 }, log: "Bốn trăm đơn đặt trước trong một tuần. Bạn thuê sáu thợ may trong khu, trả theo giờ." }, lose: { income_mult: 1.05, log: "Được chín mươi đơn: đủ tiền vải, chưa đủ trả công mình." } } }, "Chậm, không ai cầm lái thay bạn", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(FS, 3, 4, (c) => T("Cửa sắt khóa từ bên ngoài", `Đơn hàng tăng gấp năm${f(c, "fsh_investor") ? "; nhà đầu tư chỉ định một xưởng gia công rẻ nhất" : ""}. Hai giờ sáng, bạn ghé xưởng gia công lấy hàng mẫu: ba mươi thợ vẫn đang may, cửa sắt khóa từ bên ngoài, lối thoát hiểm chất đầy cuộn vải. Sáng mai là ngày giao hàng cho đợt mở bán lớn nhất của bạn.`, [
    C("Nhận hàng, coi như không thấy", { counters: step(c, FS, { honest: -1 }), money: 0.2, flags: ["fsh_sweatshop"] }, "Kịp mở bán, một bức ảnh có thể quay lại"),
    C("Rút hàng, chuyển sang xưởng trả lương đàng hoàng", { counters: step(c, FS), money: -0.3, income_mult: 0.85, flags: ["fsh_fair_made"] }, "Lỡ đợt bán lớn, ngủ yên"),
    C("Báo thanh tra lao động, công khai nơi may", { counters: step(c, FS), bw: -5, gamble: { p: f(c, "fsh_investor") ? 0.35 : 0.5, win: { flags: ["fsh_open_supply"], counters: { fsh_name: 2 }, log: "Xưởng bị buộc mở lối thoát hiểm và trả lương làm thêm. Khách hàng đứng về phía bạn." }, lose: { income_mult: 0.8, log: "Nhà đầu tư nói bạn 'làm ồn' rồi rút vốn. Đợt mở bán bị hủy." } } }, "Có thể mất vốn, xưởng phải mở cửa", { tier: "awakened" }),
    C("Bỏ nhãn hiệu, về làm thợ may thuê", { counters: step(c, FS), ...leave(FS), flags: ["ex_designer"], happy: -3 }, "Hết lo nhãn hiệu, giấc mơ khép lại")], 1), (c) => c.age >= 18),
  beat(FS, 4, 5, (c) => {
    if (f(c, "fsh_sweatshop")) return T("Nhãn của bạn trong bức ảnh", "Một bài báo điều tra đăng ảnh xưởng gia công bị cháy một góc. Không ai chết, nhưng ảnh chụp rõ chồng áo gắn nhãn của bạn cạnh cánh cửa khóa ngoài. Điện thoại reo suốt đêm.", [
      C("Xin lỗi công khai, trả đủ lương cho thợ xưởng", { counters: step(c, FS), custom: "apologize", money: -0.5, flags: ["fsh_repaid"] }, "Mất nhiều tiền, có thể giữ được nghề"),
      C("Đổ hết cho xưởng gia công", { counters: step(c, FS, { honest: -1 }), income_mult: 0.7, flags: ["fsh_blamed"] }, "Tạm thoát, khách hàng không quên"),
      C("Đóng nhãn hiệu", { counters: step(c, FS), ...leave(FS), flags: ["ex_designer"], happy: -5 }, "Dứt chuyện, mất cả sự nghiệp")], 0);
    if (n(c, "fsh_name") >= 2 || f(c, "fsh_preorder") || f(c, "fsh_fair_made") || f(c, "fsh_open_supply")) return T("Tuần lễ thời trang gọi tên", `Bạn được mời trình diễn ở một tuần lễ thời trang lớn ở nước ngoài, chi phí bằng nửa năm doanh thu.${n(c, "fsh_team") > 0 ? " Đội thợ của bạn đã sẵn sàng thức trắng một tháng." : ""} Cùng lúc, một tập đoàn muốn mua lại nhãn hiệu, giữ bạn làm giám đốc sáng tạo năm năm.`, [
      C("Dồn tiền đi trình diễn", { counters: step(c, FS), money: -0.4, gamble: { p: 0.45 + 0.05 * Math.min(2, n(c, "fsh_name")), win: { income_mult: 1.5, counters: { fsh_name: 2 }, log: "Hai cửa hàng lớn ở nước ngoài đặt hàng ngay sau buổi diễn." }, lose: { happy: -4, log: "Buổi diễn trùng giờ với một tên tuổi lớn. Không phóng viên nào đến." } } }, "Đặt cược nửa năm doanh thu"),
      C("Bán nhãn hiệu cho tập đoàn", { counters: step(c, FS), money: 1.0, income_mult: 1.2, flags: ["fsh_acquired"] }, "Giàu lên, tên bạn thuộc về người khác"),
      C("Giữ nhỏ, mở lớp cắt may cho thợ trong khu", { counters: step(c, FS, { fsh_team: 1 }), income_mult: 0.95, agency: 0.02, flags: ["fsh_school"] }, "Chậm giàu, dạy được người khác", { longterm: true })], 2);
    return T("Tiệm vắng cuối mùa", "Tiệm ở mặt phố tăng giá thuê gấp đôi. Trên mạng có hàng chục cửa hàng bán mẫu của bạn với giá một phần ba. Tháng này bạn bán được mười một bộ.", [
      C("Chuyển hẳn sang bán qua livestream", { counters: step(c, FS), income_mult: 1.1, bw: -5, flags: ["fsh_live"] }, "Sống được, ngày nào cũng phải nói"),
      C("Quay về sửa đồ, may đo cho khách quen", { counters: step(c, FS), income_mult: 0.75, happy: 2, flags: ["fsh_tailor_again"] }, "Nhỏ lại, yên tâm"),
      C("Đóng tiệm, đi thiết kế cho xưởng lớn", { counters: step(c, FS), ...leave(FS), flags: ["ex_designer"] }, "Lương đều, tên bạn biến mất")], 1);
  }, (c) => c.age >= 18),
  beat(FS, 5, 6, (c) => T("Kho rập giấy ba mươi năm", `${f(c, "fsh_acquired") ? "Nhãn hiệu mang tên bạn giờ có ba mươi cửa hàng, nhưng bạn không còn được chọn vải. " : f(c, "fsh_school") ? "Lớp cắt may của bạn đã có hơn trăm người ra nghề. " : f(c, "fsh_blamed") ? "Người ta vẫn hỏi bạn về xưởng gia công năm ấy. " : ""}Một trường dạy nghề xin kho rập giấy ba mươi năm của bạn làm giáo trình. Một nhà sưu tầm trả giá cao cho chính kho rập ấy.`, [
    C("Tặng kho rập cho trường", { counters: step(c, FS), flags: ["passed_on"], rel: 4 }, "Không tiền, người trẻ học được"),
    C("Bán cho nhà sưu tầm", { counters: step(c, FS), money: 0.5 }, "Tiền dưỡng già, rập nằm trong tủ kính"),
    C("Giữ lại, may tiếp cho vài khách cũ", { counters: step(c, FS), happy: 3, flags: ["fsh_last_clients"] }, "Còn được cầm kéo, chẳng để lại gì")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(FS, "fsh_rush", [18, 65], 7, (c) => T("Bốn mươi đơn trong mười ngày", vn(c)
    ? vary("fshru", c.age, ["Tháng Chạp, khách đặt áo dài Tết dồn về: bốn mươi bộ trong mười ngày.", "Mùa cưới đến sớm. Ba nhà đặt áo cho cả họ, giao trước rằm."])
    : vary("fshru", c.age, ["Mùa lễ cuối năm, bốn mươi đơn may đo dồn về trong mười ngày.", "Mùa cưới đến sớm. Ba gia đình đặt đồ cho cả họ, giao trong hai tuần."]), [
    C("Nhận hết, thức thâu đêm", { money: 0.08, health: -4 }, "Tiền nhiều, thân thể trả giá"),
    C("Nhận một nửa, hẹn khách lần sau", { money: 0.03, rel: -1 }, "Đỡ mệt, mất vài khách"),
    C("Thuê thợ thời vụ, kèm họ từng đường", { money: 0.05, bw: -3, counters: { fsh_team: 1 } }, "Mệt đầu, tiệm có thêm người", { tier: "awakened" })], 1)),
  daily(FS, "fsh_influencer", [18, 60], 8, () => T("Mượn đầm đi tiệc", "Một người có hai triệu người theo dõi muốn mặc bộ đầm mới của bạn đến một buổi tiệc, đổi lại gắn tên tiệm. Họ không trả tiền và không hứa trả lại đồ.", [
    C("Tặng, đổi lấy một lần nhắc tên", { money: -0.03, gamble: { p: 0.4, win: { money: 0.06, counters: { fsh_name: 1 }, log: "Tiệm hết hàng trong ba ngày." }, lose: { log: "Họ đăng ảnh, không gắn tên tiệm." } } }, "Mất một bộ, có thể nổi"),
    C("Báo giá như mọi khách", { happy: 1, flags: ["fsh_no_freebies"] }, "Giữ giá, mất một cơ hội")], 1)),
  daily(FS, "fsh_silk", [20, 60], 9, () => T("Lô vải sờ như lụa", "Mối vải quen chào một lô vải bóng mượt, sờ như lụa, giá bằng một nửa. Họ nói thẳng: một nửa là sợi tổng hợp, nhưng tiệm nào cũng ghi là lụa.", [
    C("Mua, ghi nhãn lụa", { money: 0.1, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 8], note: "ghi nhãn lụa cho vải pha sợi tổng hợp" } }, "Lời nhiều, nhãn mác nói dối"),
    C("Mua, ghi đúng thành phần", { money: 0.03, counters: { honest: 1 } }, "Lời ít, khách tin"),
    C("Đặt lụa dệt tay của một làng dệt, trả trước", { money: -0.06, flags: ["fsh_handwoven"], counters: { fsh_name: 1 } }, "Đắt và chậm, có chuyện để kể", { tier: "awakened" })], 1)),
  daily(FS, "fsh_size", [18, 60], 8, () => T("Nhãn cỡ trong phòng thử", "Một khách quen thì thầm nhờ bạn khâu nhãn cỡ S vào chiếc váy cỡ M. Cô nói cô không chịu nổi chữ M mỗi lần mở tủ.", [
    C("Khâu nhãn S cho khách vui", { rel: 1, counters: { fsh_kind: 1 } }, "Khách vui, một lời nói dối nhỏ"),
    C("Từ chối, nói thật về số đo", { rel: -1, counters: { honest: 1 } }, "Thật thà, có thể mất khách"),
    C("Bỏ hẳn nhãn S, M, L, chỉ ghi số đo thật", { bw: -2, flags: ["fsh_no_sizes"], gamble: { p: 0.5, win: { counters: { fsh_name: 1 }, log: "Khách bắt đầu gọi đây là tiệm 'không có cỡ'." }, lose: { money: -0.03, log: "Một số khách thấy phiền, sang tiệm khác." } } }, "Đổi luật của tiệm, có người không quen", { tier: "sovereign" })], 0)),
  daily(FS, "fsh_collar", [20, 60], 9, () => T("Cổ áo của bạn ở cửa hàng lớn", "Bộ sưu tập mới của một hãng thời trang lớn có đúng chiếc cổ áo bạn vẽ và bán từ hai năm trước, xếp nếp y hệt.", [
    C("Đăng ảnh so sánh lên mạng", { flags: ["fsh_public_fight"], gamble: { p: 0.5, win: { counters: { fsh_name: 1 }, log: "Người xem đứng về phía bạn. Đơn hàng tăng." }, lose: { happy: -3, log: "Hãng nói xếp nếp là kỹ thuật chung. Bạn bị gọi là kẻ ăn theo." } } }, "Có thể được ủng hộ, có thể bị chê"),
    C("Thuê luật sư", { money: -0.15, gamble: { p: 0.3, win: { money: 0.4, log: "Hãng chịu dàn xếp ngoài tòa." }, lose: { happy: -4, log: "Mẫu áo chưa đăng ký, vụ kiện dừng lại." } } }, "Tốn tiền chắc, thắng không chắc"),
    C("Im lặng, làm mẫu tiếp theo nhanh hơn", { know: 2, happy: -1 }, "Không tốn gì, nuốt cục tức")], 2)),
  daily(FS, "fsh_eyes", [30, 70], 9, () => T("Kim không xâu được nữa", "Mười mấy năm may dưới ánh đèn bàn, giờ bạn phải nheo mắt mới xâu được kim. Bác sĩ dặn bớt làm đêm, đeo kính, nghỉ mắt mỗi giờ.", [
    C("Thuê một thợ trẻ làm phần chi tiết", { money: -0.05, health: 2, counters: { fsh_team: 1 } }, "Tốn lương, giữ được mắt"),
    C("Cứ làm như cũ", { health: -4, money: 0.02 }, "Đỡ tốn, mắt kém dần")], 0)),
  daily(FS, "fsh_scraps", [20, 60], 8, (c) => T("Hai trăm ký vải vụn", vary("fshsc", c.age, [
    "Cuối năm, bạn đếm được hơn hai trăm ký vải vụn chất trong kho, sắp bị đem đi đổ.",
    "Xe rác không chịu chở mấy bao vải vụn của tiệm nữa, bảo phải thuê xe riêng."]), [
    C("Làm một dòng đồ chắp vá từ vải vụn", { bw: -3, gamble: { p: 0.45, win: { money: 0.06, flags: ["fsh_patchwork"], log: "Dòng chắp vá bán hết trong một tháng." }, lose: { log: "Chỉ bán được vài chiếc. Số còn lại bạn tặng trường mầm non." } } }, "Thêm việc, có thể ra một dòng mới"),
    C("Bán rẻ cho người thu gom", { money: 0.01 }, "Nhanh gọn, vải thành rác ở nơi khác")], 1)),
  daily(FS, "fsh_vanished", [20, 60], 9, () => T("Cửa hàng ký gửi biến mất", "Cửa hàng nhận ký gửi sáu mươi bộ đồ của bạn đóng cửa sau một đêm. Chủ cửa hàng không nghe máy. Số tiền bằng gần hai tháng thu nhập.", [
    C("Đến tận nhà đòi", { money: -0.15, bw: -4, gamble: { p: 0.4, win: { money: 0.1, log: "Bà ấy trả một nửa, khóc nói chồng nợ cờ bạc." }, lose: { log: "Nhà khóa cửa. Hàng xóm nói họ đã chuyển đi." } } }, "Mất sức, có thể đòi lại một phần"),
    C("Đăng lên mạng cảnh báo các tiệm khác", { money: -0.15, rel: 2, flags: ["fsh_warned_others"] }, "Mất tiền, giữ người khác khỏi mất"),
    C("Soạn hợp đồng ký gửi mẫu cho mọi đơn về sau", { money: -0.15, agency: 0.01, flags: ["fsh_contracts"] }, "Mất tiền lần này, đóng cửa lần sau", { tier: "awakened" })], 2)),
  daily(FS, "fsh_mentor", [22, 65], 99, (c, N) => { const m = role(c, "mentor")!; return T("Tiệm may của người thầy", `${N(m)}, người dạy bạn cầm kéo, phải nghỉ vì đau lưng. Tiệm may nhỏ ấy còn hơn trăm khách quen ba mươi năm và hai chiếc máy may cũ. ${N(m)} hỏi bạn có muốn nhận lại không.`, [
    C("Nhận tiệm, giữ khách của thầy", { money: -0.1, bw: -4, memory: { npc: m, tag: "KEPT_PROMISE", weight: 0.3, note: "nhận lại tiệm may và khách quen của thầy" } }, "Thêm gánh nặng, giữ được một nơi"),
    C("Từ chối, việc mình đã quá sức", { trust: { npc: m, delta: -0.1 } }, "Giữ sức, tiệm cũ đóng cửa"),
    C("Nhận, chia lãi cho thầy hằng tháng", { money: -0.05, income_mult: 1.05, memory: { npc: m, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "chia lãi tiệm may cho thầy lúc về già" } }, "Bớt lãi, thầy có chỗ dựa", { tier: "awakened" })], 0, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(FS, "fsh_rival", [20, 60], 8, (c, N) => { const r = role(c, "rival")!; return T("Bị tố chép mẫu", `${N(r)} mở nhãn hiệu cùng năm với bạn, nay đăng lên mạng ảnh hai chiếc áo đặt cạnh nhau, tố bạn chép mẫu.`, [
    C("Đăng bản phác thảo có ghi ngày tháng", { gamble: { p: 0.6, win: { counters: { fsh_name: 1 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "bị bóc trần lời tố chép mẫu áo" }, log: "Bản phác thảo của bạn có trước bốn tháng. Bài tố bị gỡ." }, lose: { happy: -2, log: "Người xem vẫn chia hai phe." } } }, "Có thể thắng, kết thêm một mối thù"),
    C("Mời làm chung một bộ sưu tập", { gamble: { p: 0.4, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "làm chung một bộ sưu tập sau vụ tố chép mẫu" }, money: 0.05, log: "Bộ sưu tập chung bán hết. Hai bên thôi đá xéo nhau." }, lose: { log: "Họ coi lời mời là nhận tội." } } }, "Biến đối thủ thành đồng minh, hoặc mất mặt", { tier: "awakened" }),
    C("Im lặng", { happy: -3, counters: { fsh_name: -1 } }, "Không ồn ào, mang tiếng")], 0, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(FS, "fsh_quit", [28, 60], 99, () => T("Phòng rập của hãng đồng phục", "Một hãng may đồng phục mời bạn làm trưởng phòng rập, lương đều, có bảo hiểm. Từ nay chỉ còn áo sơ mi trắng và quần tây xanh.", [
    C("Nhận, gác giấc mơ nhãn hiệu", { ...leave(FS), flags: ["ex_designer"] }, "Yên ổn, mất cái tên của mình"),
    C("Ở lại với tiệm", { happy: 1, counters: { fsh_name: 1 } }, "Túng thêm vài năm")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(FS, "fsh_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Chiếc áo khoác bị ném vào góc", `${N(k)} về nhà, ném chiếc áo khoác bạn may vào góc: cả lớp chê đồ "nhà làm", đứa nào cũng mặc đồ hiệu.`, [
      C("Mua cho con một chiếc đồ hiệu", { money: -0.04, trust: { npc: k, delta: 0.1 } }, "Con vui, bạn chạnh lòng"),
      C("Cùng con vẽ chiếc áo con muốn mặc", { bw: -2, trust: { npc: k, delta: 0.2 }, flags: ["fsh_kid_design"] }, "Mất mấy buổi tối, con có thứ không ai có", { tier: "awakened" }),
      C("Bảo con đừng để ý lời người khác", { trust: { npc: k, delta: -0.1 } }, "Nhanh, con thấy không ai hiểu mình")], 1, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Áo cho ngày mừng thọ", `${N(p)} sắp mừng thọ bảy mươi, ${vn(c) ? "cả họ sẽ về" : "cả nhà sẽ tụ họp"}. ${N(p)} muốn mặc lại kiểu áo ngày cưới, nhờ bạn may, nhưng chỉ còn một tấm ảnh đen trắng đã mờ.`, [
      C("Gác đơn hàng một tuần để may", { money: -0.04, happy: 3, trust: { npc: p, delta: 0.3 } }, "Mất một tuần thu nhập, có một ngày đẹp"),
      C("May kiểu mới cho hợp tuổi", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.15 }, log: `${N(p)} mặc vào, soi gương rất lâu.` }, lose: { trust: { npc: p, delta: -0.1 }, log: `${N(p)} bảo đẹp, nhưng không phải cái áo ấy.` } } }, "Nhanh hơn, có thể sai ý"),
      C("Nhờ thợ trong tiệm may thay", { money: -0.01, trust: { npc: p, delta: -0.05 } }, "Không lỡ việc, không phải tay bạn")], 0, { npc: p });
  }),
];

/* =====================================================================
 * THỢ CẮT TÓC — tiền tố brb_
 * ===================================================================== */
const BB = "barber";

const BRB_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(BB, "brb_t_scissors", [10, 15], () => true, () => T("Cây kéo cắt vải của mẹ", "Nhà không có tiền ra tiệm, bạn cắt tóc cho em bằng cây kéo cắt vải của mẹ. Lần đầu lởm chởm, lần thứ ba thì gọn gàng đến mức mấy đứa trẻ hàng xóm xếp hàng trước hiên chờ.", [
    C("Cắt cho cả xóm, lấy vài đồng", { money: 0.01, rel: 2, flags: [talentFlag(BB)], counters: { talents_seen: 1 } }, "Có tiền tiêu vặt, bài vở bị bỏ dở"),
    C("Cất kéo, sợ cắt hỏng tóc người ta", { counters: { talents_seen: 1 } }, "Không ai trách, đôi tay quên dần")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(BB, "brb_d_oldchair", [16, 40], () => true, (c) => T("Chiếc ghế của ông thợ già", `${vn(c) ? "Ông thợ cắt tóc dưới gốc cây đầu chợ có một tấm gương đóng vào thân cây và một chiếc ghế sắt, ba mươi năm không đổi." : "Ông thợ cắt tóc ở góc phố có một tiệm hai ghế, ba mươi năm không đổi."} Mắt ông kém rồi. Ông bảo nếu bạn chịu theo ông một năm, ông giao lại chỗ ngồi và cả sổ khách quen.`, [
    C("Theo ông, nhận lại chỗ", { ...become(BB), counters: { doors_seen: 1 }, money: -0.03, flags: ["brb_old_chair"] }, "Một năm lương ít, có sẵn khách quen"),
    C("Học vào cuối tuần", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(BB), flags: ["brb_old_chair"], log: "Ông khen tay bạn chắc. Ông về quê, để lại cây kéo." }, lose: { log: "Ông nhận một người theo học cả tuần. Chỗ ngồi thuộc về người ấy." } } }, "Giữ việc, có thể chậm chân"),
    C("Thôi, nghề này đứng cả ngày", { counters: { doors_seen: 1 } }, "Không phải đứng, không có nghề tay")], 0)),
  door(BB, "brb_d_academy", [18, 35], () => true, () => T("Khóa học sáu tháng không lương", "Một chuỗi tiệm tóc mở khóa đào tạo sáu tháng không lương. Học xong được đứng một ghế, hưởng bốn mươi phần trăm tiền công; học phí trừ dần vào lương hai năm.", [
    C("Ký, học sáu tháng", { ...become(BB), counters: { doors_seen: 1 }, money: -0.08, flags: ["brb_chain_trained"] }, "Nửa năm không lương, nghề bài bản"),
    C("Học khóa hai tuần ở trung tâm rẻ", { counters: { doors_seen: 1 }, money: -0.02, gamble: { p: 0.3, win: { ...become(BB), log: "Một tiệm nhỏ nhận bạn đứng ghế thử. Tháng sau họ giữ bạn lại." }, lose: { log: "Học xong, chưa tiệm nào dám giao khách cho bạn." } } }, "Rẻ, nhanh, tay còn non"),
    C("Không ký", { counters: { doors_seen: 1 } }, "Giữ tự do, không có nghề mới")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(BB, 1, 1, (c) => T("Kiểu tóc trong điện thoại", `Vị khách đầu tiên trong ngày ngồi vào ${f(c, "brb_old_chair") ? "chiếc ghế của ông thầy" : "ghế của bạn"}, chìa ra ảnh một cầu thủ với kiểu tóc cạo hai bên, vẽ đường kẻ. Bạn chưa làm kiểu này bao giờ. Ngoài cửa còn ba người đang chờ.`, [
    C("Nói thật, đề nghị kiểu bạn làm chắc tay", { counters: step(c, BB, { brb_regulars: 1 }), money: -0.01 }, "Mất một lần lấy le, được một khách tin"),
    C("Làm thử, chậm mà kỹ", { counters: step(c, BB), gamble: { p: 0.5, win: { flags: ["brb_bold_cuts"], happy: 4, log: "Cậu ta chụp ảnh đăng lên mạng. Hôm sau năm đứa bạn cậu kéo đến." }, lose: { happy: -3, log: "Đường kẻ lệch. Cậu ta đội mũ đi về, không quay lại." } } }, "Có thể nổi, có thể mất mặt")], 0), (c) => c.age >= 18),
  beat(BB, 2, 3, (c) => T("Mặt bằng ở phố chính", `${n(c, "brb_regulars") >= 2 ? "Khách quen đã đủ để bạn ít khi ngồi chơi." : "Khách đến đều hơn, nhưng chưa ai gọi bạn bằng tên."} Một mặt bằng ở phố chính cho thuê giá gấp ba chỗ cũ. Một chuỗi tiệm tóc mời bạn mở tiệm nhượng quyền: họ lo biển hiệu và khách, bạn trả phí hằng tháng và theo bảng giá của họ.`, [
    C("Vay tiền, thuê mặt bằng đứng tên mình", { counters: step(c, BB), custom: "borrow:0.4", income_mult: 1.4, flags: ["brb_own_shop"] }, "Nợ một khoản, tiệm là của mình"),
    C("Mở tiệm nhượng quyền của chuỗi", { counters: step(c, BB), income_mult: 1.3, flags: ["brb_franchise"] }, "Khách có sẵn, luật là của họ"),
    C("Rủ ba thợ chung tiệm, chia đều ghế và tiền thuê", { counters: step(c, BB), agency: 0.03, gamble: { p: 0.45 + 0.1 * Math.min(2, n(c, "brb_regulars")), win: { flags: ["brb_collective"], income_mult: 1.3, counters: { brb_regulars: 1 }, log: "Bốn chiếc ghế, một cuốn sổ thu chi treo trên tường, ai cũng xem được." }, lose: { income_mult: 1.05, log: "Nửa năm sau, một thợ rút đi với nửa số khách. Tiệm co lại còn hai ghế." } } }, "Chia quyền, chia rủi ro, cần người tin nhau", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(BB, 3, 4, (c) => T("Sáu mươi ngày để dọn đi", `Tòa nhà bị bán. Chủ mới dán thông báo lên cửa kính: sáu mươi ngày nữa phải dọn đi để ${c.poor_country ? "làm cửa hàng điện thoại" : "xây cao ốc"}. ${f(c, "brb_franchise") ? "Chuỗi tiệm đòi bạn tự bỏ tiền dựng lại tiệm theo mẫu của họ ở chỗ mới, nếu không sẽ phạt hợp đồng." : f(c, "brb_collective") ? "Ba thợ cùng tiệm nhìn bạn, chờ quyết định." : "Toàn bộ đồ nghề của bạn chất vừa hai chuyến xe."}`, [
    C("Dời vào ngõ nhỏ, giá thuê rẻ", { counters: step(c, BB), income_mult: 0.8, flags: ["brb_alley"] }, "Đỡ tiền thuê, mất khách vãng lai"),
    C("Cắt tóc lưu động: tận nhà, viện dưỡng lão", { counters: step(c, BB), bw: -4, flags: ["brb_mobile"], gamble: { p: 0.3 + 0.1 * Math.min(3, n(c, "brb_regulars")), win: { counters: { brb_regulars: 2 }, income_mult: 1.1, log: "Khách quen gọi điện đặt lịch. Viện dưỡng lão đặt bạn mỗi tuần một buổi." }, lose: { income_mult: 0.75, log: "Một ngày chạy ba nơi, chỉ cắt được sáu đầu tóc." } } }, "Không cần mặt bằng, sống nhờ khách quen", { tier: "awakened" }),
    C("Vay lớn, mua đứt một gian ở góc chợ", { counters: step(c, BB), custom: "borrow:1", income_mult: 1.1, flags: ["brb_bought_space"] }, "Nợ nặng, từ nay không ai đuổi được"),
    C("Gác kéo, đi làm việc khác", { counters: step(c, BB), ...leave(BB), flags: ["ex_barber"], happy: -3 }, "Hết lo mặt bằng, mất cái nghề")], 0), (c) => c.age >= 18),
  beat(BB, 4, 5, (c, N) => {
    if (f(c, "brb_franchise")) return T("Phí nhượng quyền tăng một nửa", "Chuỗi tiệm đổi chủ. Phí hằng tháng tăng một nửa, bảng giá mới cao đến mức khách quen của bạn bắt đầu sang tiệm khác. Hợp đồng còn bốn năm.", [
      C("Phá hợp đồng, chịu phạt, treo biển tên mình", { counters: step(c, BB), money: -0.3, agency: 0.02, unflags: ["brb_franchise"], flags: ["brb_own_shop"] }, "Mất một khoản phạt, lấy lại tiệm"),
      C("Chịu, theo bảng giá mới", { counters: step(c, BB, { brb_regulars: -1 }), income_mult: 0.85 }, "Yên chuyện hợp đồng, khách quen thưa dần"),
      C("Rủ các tiệm nhượng quyền khác cùng đàm phán lại", { counters: step(c, BB), bw: -4, gamble: { p: 0.45, win: { income_mult: 1.1, flags: ["brb_franchise_union"], log: "Hai mươi ba tiệm cùng ký một lá thư. Chuỗi rút lại một nửa mức tăng." }, lose: { money: -0.1, log: "Chuỗi tách từng tiệm ra nói chuyện riêng. Bạn bị ghi tên là người cầm đầu." } } }, "Đông thì mạnh, đứng đầu thì dễ bị nhắm", { tier: "awakened" })], 1);
    if (n(c, "brb_regulars") >= 3 || f(c, "brb_collective") || f(c, "brb_mobile")) return T("Người thợ biết tên cả khu", `Tiệm của bạn thành chỗ cả khu ghé ${vn(c) ? "uống trà đá" : "uống cà phê"}, nghe chuyện. Một đoạn phim ngắn về "người thợ biết tên cả khu phố" có hàng triệu lượt xem. Một chuỗi lớn muốn mua tiệm và cả tên bạn; một quỹ xã hội muốn bạn mở lớp nghề cho thanh niên vừa ra trại.`, [
      C("Bán tiệm và tên cho chuỗi", { counters: step(c, BB), money: 0.8, income_mult: 0.9, flags: ["brb_sold"] }, "Có một khoản lớn, tiệm không còn của mình"),
      C("Mở lớp nghề cho thanh niên ra trại", { counters: step(c, BB), income_mult: 0.95, rel: 4, agency: 0.02, flags: ["brb_school"] }, "Ít lời, dạy được người khác", { longterm: true }),
      C("Giữ nguyên, thêm một ghế cho thợ trẻ", { counters: step(c, BB, { brb_regulars: 1 }), income_mult: 1.15 }, "Lớn chậm, giữ nguyên chất tiệm")], 2);
    const r = role(c, "rival");
    return T("Tiệm đèn neon bên kia đường", `${r ? `${N(r)} mở` : "Bên kia đường mở"} một tiệm tóc kiểu mới: đèn neon, nhạc to, ba thợ trẻ, giá bằng bạn. Cuối ngày, tay bạn bắt đầu run nhẹ mỗi khi cầm dao cạo.`, [
      C("Chuyên cạo mặt, cắt kiểu cổ điển cho khách lớn tuổi", { counters: step(c, BB), income_mult: 0.9, happy: 2, flags: ["brb_classic"] }, "Ít khách hơn, đúng sở trường"),
      C("Nhận một thợ trẻ, học kiểu mới từ cậu ấy", { counters: step(c, BB), gamble: { p: 0.5, win: { income_mult: 1.15, counters: { brb_regulars: 1 }, log: "Cậu thợ trẻ kéo khách trẻ về. Bạn giữ khách già. Tiệm đông cả hai đầu." }, lose: { money: -0.05, log: "Cậu ta học xong nghề cạo của bạn rồi sang tiệm neon." } } }, "Học lại từ người trẻ, có thể bị bỏ", { tier: "awakened" }),
      C("Treo kéo, nghỉ nghề", { counters: step(c, BB), ...leave(BB), flags: ["ex_barber"] }, "Nghỉ ngơi, mất thu nhập")], 0, r ? { npc: r } : {});
  }, (c) => c.age >= 18),
  beat(BB, 5, 6, (c) => T("Lần cạo mặt cuối cho ông khách", `Ông khách ngồi ghế của bạn mỗi sáng thứ Bảy suốt hai mươi năm nay nằm viện, không dậy được. Gia đình gọi: ông muốn được cắt tóc, cạo mặt một lần nữa. Hôm ấy là ngày đông khách nhất tuần.${f(c, "brb_school") ? " Một học trò lớp nghề đang đứng ghế bên cạnh bạn." : f(c, "brb_sold") ? " Tiệm giờ mang biển hiệu của chuỗi, nhưng ông vẫn chỉ đòi bạn." : ""}`, [
    C("Đóng tiệm một ngày, vào viện", { counters: step(c, BB), money: -0.02, happy: 5, rel: 3, flags: ["brb_last_shave"] }, "Mất ngày đông khách, giữ trọn một lời hẹn"),
    C("Cử thợ trẻ đi thay, giữ ca đông khách", { counters: step(c, BB), money: 0.02, happy: -3 }, "Không mất tiền, mang một nỗi áy náy"),
    C("Đi cùng thợ trẻ, để cậu ấy cạo, bạn đứng cạnh", { counters: step(c, BB), happy: 3, flags: ["passed_on"] }, "Truyền nghề tận tay, ông khách có thể phật ý", { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(BB, "brb_towel", [18, 65], 8, () => T("Chuyện kể dưới khăn nóng", "Một khách quen, dưới chiếc khăn nóng, kể rằng ông sắp kiện một khách quen khác của tiệm vì món nợ cũ. Chiều nay người kia đến cắt tóc, hỏi bạn có nghe ngóng được gì không.", [
    C("Giữ kín, chuyện trên ghế để lại trên ghế", { counters: { brb_regulars: 1, honest: 1 } }, "Giữ chữ tín, người kia không được báo trước"),
    C("Nói cho người kia biết", { rel: -2, counters: { brb_regulars: -1 }, flags: ["brb_gossip"] }, "Giúp một người, mất tiếng kín miệng"),
    C("Gợi ý hai người ngồi lại ở tiệm, bạn pha trà", { gamble: { p: 0.4, win: { rel: 3, counters: { brb_regulars: 1 }, log: "Họ ngồi đến tối. Không ai phải ra tòa." }, lose: { rel: -2, log: "Hai người to tiếng, một người không bao giờ quay lại." } } }, "Có thể hòa giải, có thể mất cả hai", { tier: "awakened" })], 0)),
  daily(BB, "brb_inspect", [18, 65], 9, () => T("Dao cạo dùng một lần", "Quy định mới: dao cạo dùng một lần, khăn phải hấp, phải có giấy chứng nhận vệ sinh. Mỗi tháng tốn thêm bằng ba ngày công. Tiệm bên cạnh nói cứ dùng như cũ, ai mà kiểm.", [
    C("Làm đúng quy định", { money: -0.04, flags: ["brb_clean"] }, "Tốn tiền đều, ngủ yên"),
    C("Dùng như cũ", { gamble: { p: 0.6, win: { money: 0.02, log: "Năm ấy không ai đến kiểm tra." }, lose: { money: -0.08, counters: { brb_regulars: -1 }, log: "Đoàn kiểm tra đến đúng sáng thứ Bảy. Biên bản dán lên cửa." } } }, "Đỡ tốn, có thể mất mặt")], 0)),
  daily(BB, "brb_firstcut", [18, 65], 8, (c) => T("Lần cắt tóc đầu đời", vary("brbfc", c.age, [
    "Một bé trai ba tuổi gào khóc trên ghế trong lần cắt tóc đầu đời. Mẹ cậu bé xin lỗi rối rít, khách chờ bắt đầu sốt ruột.",
    "Một bé gái nhất định không chịu ngồi ghế, chỉ chịu ngồi trong lòng bố. Hai bố con chiếm ghế đã nửa tiếng."]), [
    C("Dừng tay, dỗ cho đến khi bé chịu", { money: -0.01, counters: { brb_regulars: 1 } }, "Mất cả giờ, được một gia đình khách"),
    C("Cắt nhanh cho xong", { money: 0.01, rel: -1 }, "Kịp khách sau, bé nhớ cái ghế đáng sợ")], 0)),
  daily(BB, "brb_monday", [20, 65], 9, () => T("Sáng thứ Hai dưới gầm cầu", "Mỗi sáng thứ Hai, ngày tiệm vắng, bạn cắt tóc miễn phí cho mấy người vô gia cư dưới gầm cầu. Có người quay lại đăng lên mạng; người ta bắt đầu hỏi số tài khoản để ủng hộ.", [
    C("Mở tài khoản quyên góp đứng tên mình", { money: 0.05, bw: -3, flags: ["brb_own_fund"] }, "Có tiền mua đồ nghề, dễ bị nghi ngờ"),
    C("Nhờ người đăng gỡ đoạn phim", { happy: 1, counters: { honest: 1 } }, "Giữ việc nhỏ cho nhỏ"),
    C("Lập nhóm thợ tình nguyện, công khai thu chi", { bw: -4, rel: 4, agency: 0.02, flags: ["brb_free_monday"] }, "Thêm việc sổ sách, việc tốt lan rộng", { tier: "awakened" })], 1)),
  daily(BB, "brb_legs", [25, 70], 9, () => T("Mười một tiếng đứng", "Bạn đứng mười một tiếng mỗi ngày. Tĩnh mạch ở bắp chân nổi xanh, tối về lưng đau không cúi được. Bác sĩ bảo phải bớt giờ, hoặc tập cắt tóc ngồi.", [
    C("Mua ghế yên ngựa, bớt hai giờ mỗi ngày", { income_mult: 0.95, health: 4, flags: ["brb_saddle_stool"] }, "Bớt thu nhập, giữ được đôi chân"),
    C("Cứ đứng, còn phải trả nợ", { health: -5, money: 0.03 }, "Đủ tiền, chân trả giá")], 0)),
  daily(BB, "brb_dye", [20, 65], 9, () => T("Hộp thuốc nhuộm không nhãn", "Người bán hàng chào một loại thuốc nhuộm không nhãn, rẻ bằng một phần ba. Ai cũng dùng, anh ta nói. Trên hộp không ghi thành phần.", [
    C("Mua về dùng", { money: 0.04, gamble: { p: 0.7, win: { log: "Không khách nào bị sao." }, lose: { money: -0.1, counters: { brb_regulars: -1 }, log: "Một khách bị bỏng da đầu, đòi bồi thường." } } }, "Lời thêm, có thể làm hại khách"),
    C("Dùng loại có kiểm định", { money: -0.03, flags: ["brb_safe_dye"] }, "Lời ít, an tâm")], 1)),
  daily(BB, "brb_argue", [18, 65], 8, (c) => T("Hai khách quen to tiếng", vary("brbar", c.age, [
    "Hai khách quen cãi nhau về bầu cử, to đến mức khách mới đứng ngoài cửa không dám vào.",
    "Trận bóng tối qua khiến hai ông khách quen suýt ném lược vào nhau."]), [
    C("Treo biển: ở đây chỉ bàn chuyện tóc", { rel: -1, flags: ["brb_no_politics"] }, "Tiệm yên, mất cái chất quán xóm"),
    C("Để họ cãi, ai cũng có quyền nói", { rel: 1, money: -0.01 }, "Giữ không khí tự do, mất khách mới"),
    C("Pha trà, mỗi người nói hai phút, không ai ngắt lời", { bw: -2, rel: 2, counters: { brb_regulars: 1 } }, "Mất thời gian, tiệm có luật riêng", { tier: "sovereign" })], 1)),
  daily(BB, "brb_rival", [20, 60], 8, (c, N) => { const r = role(c, "rival")!; return T("Băng rôn giảm nửa giá", `${N(r)} mở tiệm ngay đối diện, treo băng rôn giảm nửa giá suốt một tháng, đứng trước cửa mời cả khách của bạn.`, [
    C("Giảm giá theo", { money: -0.05, trust: { npc: r, delta: -0.1 } }, "Giữ khách, cả hai cùng lỗ"),
    C("Sang gặp, đề nghị chia giờ mở cửa", { gamble: { p: 0.5, win: { money: 0.03, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia giờ mở cửa hai tiệm tóc đối diện" }, log: "Tiệm bạn mở sớm, tiệm kia mở khuya. Cả hai bên đều đông hơn." }, lose: { log: `${N(r)} cười, bảo không cần.` } } }, "Có thể cùng có lời, có thể bị cười", { tier: "awakened" }),
    C("Kệ, giữ giá", { money: -0.02, counters: { brb_regulars: 1 } }, "Vắng một tháng, lọc ra khách thật")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(BB, "brb_app", [20, 60], 9, () => T("Ứng dụng chấm sao", "Một ứng dụng đặt lịch hứa đưa khách mới đến mỗi ngày, đổi lại lấy hai mươi phần trăm mỗi lần cắt và cho khách chấm điểm bạn bằng sao.", [
    C("Tham gia", { income_mult: 1.1, bw: -2, flags: ["brb_app"] }, "Thêm khách, sống theo điểm sao"),
    C("Không, giữ sổ khách viết tay", { income_mult: 0.98, counters: { brb_regulars: 1 } }, "Ít khách mới, khách cũ thân hơn")], 1)),
  daily(BB, "brb_wedding", [18, 65], 8, (c) => T("Năm giờ sáng ngày cưới", `Chú rể và sáu người bạn gọi cửa lúc năm giờ sáng ngày cưới, đòi cắt, cạo, vuốt sáp cho kịp giờ ${vn(c) ? "rước dâu" : "làm lễ"}.`, [
    C("Mở cửa, tính giá gấp ba", { money: 0.05, health: -1 }, "Lời to, mất giấc ngủ"),
    C("Mở cửa, lấy giá thường, dặn nhớ giới thiệu", { money: 0.02, health: -1, counters: { brb_regulars: 1 } }, "Lời ít, thêm bảy người biết tiệm"),
    C("Hẹn tám giờ như mọi ngày", { happy: 1, rel: -1 }, "Ngủ đủ, họ đi tiệm khác")], 1)),
  daily(BB, "brb_quit", [28, 60], 99, () => T("Thợ tóc trên tàu biển", "Một công ty tàu du lịch tuyển thợ cắt tóc: hợp đồng chín tháng trên biển, lương gấp ba. Về đến nơi là mất hết khách quen.", [
    C("Ký hợp đồng, bỏ tiệm", { ...leave(BB), money: 0.1, flags: ["ex_barber"] }, "Tiền nhiều, mất chỗ đứng trên phố"),
    C("Ở lại với ghế của mình", { happy: 1, counters: { brb_regulars: 1 } }, "Túng thêm vài năm, khách vẫn còn")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(BB, "brb_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T("Tóc xanh lá cho cuối tuần", `${N(k)} muốn nhuộm tóc màu xanh lá. Trường cấm, nên ${N(k)} xin bạn làm lén vào tối thứ Sáu.`, [
      C("Nhuộm cho con", { trust: { npc: k, delta: 0.2 }, rel: -1 }, "Con vui, nhà trường có thể mời bạn lên"),
      C("Không, nội quy là nội quy", { trust: { npc: k, delta: -0.15 } }, "Không rắc rối, con thấy bạn cứng nhắc"),
      C("Nhuộm loại gội trôi, chỉ để cuối tuần", { money: -0.01, trust: { npc: k, delta: 0.15 }, flags: ["brb_weekend_green"] }, "Cả hai cùng nhường một nửa", { tier: "awakened" })], 2, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Người nhà ngồi vào ghế", `${N(p)} xưa nay chưa từng để bạn cắt tóc, vẫn nói nghề này là "nghề tạm". Hôm nay ${N(p)} bước vào tiệm, ngồi xuống ghế của bạn, không nói lý do.`, [
      C("Cắt thật kỹ, không lấy tiền, không hỏi gì", { happy: 3, trust: { npc: p, delta: 0.25 } }, "Im lặng mà gần, có thể bỏ lỡ chuyện cần nói"),
      C("Hỏi xem ở nhà có chuyện gì", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} kể chuyện đi khám bệnh tuần trước. Hai người nói chuyện đến lúc đóng cửa.` }, lose: { trust: { npc: p, delta: -0.05 }, log: `${N(p)} bảo không có gì, cắt xong thì về.` } } }, "Có thể mở lòng, có thể làm người ấy ngại")], 0, { npc: p });
  }),
];

/* =====================================================================
 * THỢ MỘC — tiền tố cpn_
 * ===================================================================== */
const CP = "carpenter";

const CPN_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(CP, "cpn_t_stool", [10, 15], () => true, () => T("Chiếc ghế từ thùng gỗ cũ", "Bạn tháo mấy tấm ván thùng hàng cũ, đóng thành một chiếc ghế đẩu. Ông ngồi thử, rồi đứng hẳn lên. Ghế không rung. Ông thợ mộc cuối xóm đi ngang, cầm chiếc ghế lật lên xem mặt dưới.", [
    C("Xin theo ông thợ mộc cả mùa hè", { money: -0.02, health: -1, flags: [talentFlag(CP)], counters: { talents_seen: 1 } }, "Mất hè, phồng tay, có một cái nghề"),
    C("Để chiếc ghế ở góc bếp, đi chơi tiếp", { happy: 1, counters: { talents_seen: 1 } }, "Một mùa hè thong thả")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CP, "cpn_d_apprentice", [15, 30], () => true, () => T("Hai năm quét mùn cưa", "Xưởng mộc đầu phố cần người học việc. Ông chủ nói trước: hai năm đầu chỉ quét mùn cưa, chà giấy nhám và khiêng gỗ, chưa được cầm đục.", [
    C("Vào học, chịu hai năm quét mùn cưa", { ...become(CP), counters: { doors_seen: 1 }, money: -0.03, health: -1 }, "Hai năm vất vả ít tiền, đổi lấy cái nghề"),
    C("Hỏi xin học việc ở xưởng máy cho nhanh", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(CP), flags: ["cpn_machine_shop"], log: "Xưởng máy nhận bạn đứng máy cưa ngay tuần đầu." }, lose: { log: "Xưởng máy chỉ nhận người đã có nghề." } } }, "Nhanh có lương, học lệch tay"),
    C("Thôi, tìm việc khác", { counters: { doors_seen: 1 }, money: 0.02 }, "Có tiền ngay, không có nghề tay")], 0)),
  door(CP, "cpn_d_formwork", [20, 45], () => true, () => T("Thợ cốp pha ở công trường", "Ở công trường, bạn làm phụ hồ đã hai năm. Tổ trưởng tổ cốp pha thiếu người: lương cao hơn một phần ba, nhưng đứng trên giàn giáo tầng mười hai, ghép ván khuôn cho bê tông.", [
    C("Chuyển sang tổ cốp pha", { ...become(CP), counters: { doors_seen: 1 }, money: 0.05, health: -2 }, "Lương cao, đứng trên cao mỗi ngày"),
    C("Xin học nghề mộc ở xưởng của tổ trưởng", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(CP), flags: ["cpn_joinery"], log: "Tổ trưởng có một xưởng nhỏ. Ông dạy bạn làm mộng vào buổi tối." }, lose: { log: "Ông bảo xưởng đang vắng việc, để năm sau." } } }, "Chậm hơn, nghề sâu hơn"),
    C("Ở lại phụ hồ", { counters: { doors_seen: 1 } }, "Đỡ nguy hiểm, lương không lên")], 0)),
  door(CP, "cpn_d_storm", [22, 50], (c) => c.poor_country || c.econ_phase !== "boom", () => T("Lớp nghề sau cơn bão", "Sau trận bão, cả một xóm mất mái và cửa. Một tổ chức cứu trợ mở lớp nghề mộc ba tháng có trợ cấp: học xong, mỗi học viên dựng lại năm căn nhà cho xóm.", [
    C("Đăng ký học, bỏ việc đang làm", { ...become(CP), counters: { doors_seen: 1 }, money: -0.06, rel: 3 }, "Mất thu nhập ba tháng, có nghề và có ơn với xóm"),
    C("Chỉ đi khuân vác giúp, không học", { counters: { doors_seen: 1 }, rel: 2, health: -1 }, "Giúp được người, không có gì mới cho mình")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(CP, 1, 1, (c) => T("Chiếc tủ không một cây đinh", `Khách đặt một chiếc tủ quần áo. ${f(c, "cpn_machine_shop") ? "Ở xưởng máy bạn chỉ quen bắn vít, nhưng ông thợ già bên cạnh" : "Ông thầy"} bảo làm mộng, không một cây đinh: mất ba tuần. Khách muốn xong trong năm ngày, dùng ván ép bắn vít, giá rẻ hơn một nửa.`, [
    C("Làm mộng, xin khách chờ ba tuần", { counters: step(c, CP, { cpn_craft: 1 }), money: -0.02, flags: ["cpn_joinery"] }, "Lỗ công, chiếc tủ sống được năm mươi năm"),
    C("Làm ván ép bắn vít cho kịp", { counters: step(c, CP), money: 0.04, flags: ["cpn_quick"] }, "Có lời, chiếc tủ chẳng ai nhớ"),
    C("Làm khung mộng, cánh ván ép, nói rõ với khách", { counters: step(c, CP), money: 0.01, know: 1 }, "Vừa túi khách, vừa đủ bền")], 0), (c) => c.age >= 18),
  beat(CP, 2, 3, (c) => T("Năm trăm bộ bàn ghế mỗi tháng", `Bạn đã có xưởng riêng.${f(c, "cpn_joinery") ? " Khách đặt tủ năm nào giới thiệu thêm bốn nhà nữa." : ""} Một công ty xuất khẩu đồ gỗ đưa hợp đồng ba năm: thuê máy cắt điều khiển số, làm năm trăm bộ bàn ghế mỗi tháng theo bản vẽ của họ.`, [
    C("Ký, thuê máy, làm hàng loạt", { counters: step(c, CP), custom: "borrow:0.5", income_mult: 1.6, flags: ["cpn_cnc"] }, "Tiền đều, nợ máy, sống theo bản vẽ người khác"),
    C("Giữ làm đồ đặt riêng từng món", { counters: step(c, CP, { cpn_craft: 1 }), income_mult: 1.15, flags: ["cpn_custom"] }, "Ít tiền, mỗi món một câu chuyện"),
    C("Góp với năm xưởng trong phố, chung máy chung sổ", { counters: step(c, CP), agency: 0.03, gamble: { p: 0.4 + 0.1 * Math.min(2, n(c, "cpn_craft")), win: { flags: ["cpn_guild"], income_mult: 1.35, counters: { cpn_craft: 1 }, log: "Sáu xưởng chung một máy, một sổ đơn hàng. Đơn lớn chia đều, không ai phải vay một mình." }, lose: { income_mult: 1.05, log: "Lịch chạy máy cãi nhau mỗi tuần. Sau một năm, nhóm tan." } } }, "Chia quyền, chia nợ, cần người giữ lời", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(CP, 3, 4, (c) => T("Lưỡi cưa cuối ngày", `Cuối một ngày làm mười bốn tiếng${f(c, "cpn_cnc") ? " cho kịp đơn xuất khẩu" : ""}, tay bạn trượt trên bàn cưa. Bạn mất một đốt ngón trỏ. Bác sĩ dặn nghỉ ba tháng. Trong xưởng còn ${f(c, "cpn_cnc") ? "hai mươi thợ chờ lương và một container phải đóng" : f(c, "cpn_guild") ? "phần đơn chung bạn đã nhận với năm xưởng kia" : "bốn đơn hàng đã nhận cọc"}.`, [
    C("Nghỉ đủ ba tháng", { counters: step(c, CP), income_mult: 0.8, money: -0.2, health: 4 }, "Mất đơn, giữ được bàn tay"),
    C("Băng tay, quay lại xưởng sau một tuần", { counters: step(c, CP), money: 0.2, gamble: { p: 0.5, win: { log: "Bạn kịp giao hàng. Ngón tay lành chậm và cứng mãi." }, lose: { health: -8, income_mult: 0.7, log: "Vết thương nhiễm trùng. Bạn nằm viện thêm một tháng." } } }, "Giữ đơn, đặt cược thân thể"),
    C("Giao xưởng cho thợ cả, bạn chuyển sang vẽ và dạy", { counters: step(c, CP), income_mult: 0.9, agency: 0.02, flags: ["cpn_delegated"] }, "Bớt quyền, xưởng không còn chỉ dựa vào tay bạn", { tier: "awakened" }),
    C("Bán đồ nghề, rời nghề mộc", { counters: step(c, CP), ...leave(CP), money: 0.1, flags: ["ex_carpenter"] }, "Có ít vốn, khép lại cái nghề")], 0), (c) => c.age >= 18),
  beat(CP, 4, 5, (c) => {
    if (f(c, "cpn_cnc") && !f(c, "cpn_guild")) return T("Container bị trả về", "Khách nước ngoài trả về nguyên một container: gỗ chưa sấy đủ, mặt bàn nứt sau ba tuần đi biển. Hợp đồng ghi xưởng chịu toàn bộ chi phí. Tiền thuê máy vẫn chạy mỗi tháng.", [
      C("Xin giãn nợ, bán rẻ hàng trong nước", { counters: step(c, CP), custom: "restructure", money: -0.2, income_mult: 0.75 }, "Sống sót, nhỏ lại nhiều năm"),
      C("Trả máy, quay về làm đồ đặt riêng", { counters: step(c, CP, { cpn_craft: 1 }), income_mult: 0.85, unflags: ["cpn_cnc"], flags: ["cpn_back_to_hand"] }, "Mất đà, lấy lại tay nghề", { tier: "awakened" }),
      C("Đóng xưởng", { counters: step(c, CP), ...leave(CP), money: -0.3, flags: ["ex_carpenter"] }, "Cắt lỗ, mất cả cái nghề")], 0);
    if (n(c, "cpn_craft") >= 2 || f(c, "cpn_guild") || f(c, "cpn_joinery") || f(c, "cpn_delegated")) return T("Cột gỗ hai trăm năm", `${vn(c) ? "Ngôi đình làng" : "Ngôi nhà họp bằng gỗ của thị trấn"} hai trăm năm tuổi được trùng tu, bạn được mời làm thợ cả. Nhà thầu muốn thay mấy cây cột mục bằng cột bê tông sơn giả vân gỗ, rẻ một nửa, nhanh gấp ba; phần chênh lệch "chia nhau".`, [
      C("Dựng cột bê tông, nhận phần chia", { counters: step(c, CP), money: 0.4, happy: -4, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.45, fuse_years: [3, 10], note: "chia nhau tiền chênh lệch khi thay cột gỗ bằng cột bê tông lúc trùng tu" } }, "Tiền lớn, cột giả đứng đó mãi"),
      C("Đòi gỗ thật, mộng thật như ngày xưa", { counters: step(c, CP, { cpn_craft: 2 }), gamble: { p: 0.5, win: { income_mult: 1.3, flags: ["cpn_restorer"], log: "Hội đồng nghiệm thu đứng về phía bạn. Tên bạn được khắc dưới xà ngang." }, lose: { income_mult: 0.85, log: "Nhà thầu thay bạn bằng người khác. Cột bê tông vẫn được dựng." } } }, "Đúng nghề, có thể mất việc"),
      C("Ghi lại mọi mộng gỗ, dạy mười thợ trẻ ngay tại công trình", { counters: step(c, CP), money: -0.1, agency: 0.02, flags: ["cpn_school"] }, "Tốn tiền túi, cái biết không chết theo ngôi nhà", { longterm: true })], 1);
    return T("Đồ gỗ đóng hộp", "Một siêu thị nội thất khổng lồ mở cách xưởng hai cây số: bàn ghế đóng hộp, tự lắp, giá bằng một phần ba đồ bạn làm. Tháng này xưởng chỉ có hai đơn sửa cửa.", [
      C("Nhận lắp ráp thuê cho siêu thị", { counters: step(c, CP), income_mult: 0.85, flags: ["cpn_installer"] }, "Có việc đều, tay thành tay vặn ốc"),
      C("Chuyên sửa và phục chế đồ cũ", { counters: step(c, CP, { cpn_craft: 1 }), income_mult: 0.9, flags: ["cpn_repair"] }, "Ít tiền, giữ được nghề tay"),
      C("Đóng xưởng", { counters: step(c, CP), ...leave(CP), flags: ["ex_carpenter"] }, "Thôi lo, mất cái nghề")], 1);
  }, (c) => c.age >= 18),
  beat(CP, 5, 6, (c) => T("Bộ đục mòn theo bàn tay", `${f(c, "cpn_restorer") ? "Tên bạn còn khắc dưới xà ngang ngôi nhà gỗ cổ. " : f(c, "cpn_school") ? "Mấy thợ trẻ học ở công trình năm ấy giờ đã có xưởng riêng. " : f(c, "cpn_installer") ? "Bạn đã lắp hàng nghìn chiếc tủ đóng hộp. " : ""}Cán bộ đục của bạn đã mòn theo đúng hình bàn tay bạn. Một người thợ trẻ xin mua lại cả bộ. Một công ty bất động sản muốn mua đất xưởng.`, [
    C("Tặng bộ đục cho thợ trẻ, kèm sổ ghi các mộng", { counters: step(c, CP), happy: 4, flags: ["passed_on"] }, "Không lấy tiền, nghề có người cầm tiếp"),
    C("Bán đất xưởng", { counters: step(c, CP), money: 0.8, flags: ["cpn_sold_land"] }, "Tiền dưỡng già, xưởng thành nhà cao tầng"),
    C("Giữ xưởng, mỗi ngày làm một món nhỏ", { counters: step(c, CP), happy: 3, income_mult: 0.8 }, "Thu nhập ít đi, vẫn nghe mùi gỗ mỗi sáng")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(CP, "cpn_logs", [20, 60], 9, () => T("Xe gỗ không giấy tờ", "Gỗ tốt khan hiếm. Một mối quen chở đến một xe gỗ quý, giá bằng một nửa, không hóa đơn, không giấy nguồn gốc. Anh ta nói giấy tờ có thể 'làm sau'.", [
    C("Mua, giấy tờ tính sau", { money: 0.15, secret: { tag: "FORGED_PAPERS", severity: 0.45, fuse_years: [2, 9], note: "mua gỗ quý không rõ nguồn gốc rồi hợp thức giấy tờ" } }, "Lời lớn, một khu rừng ở đâu đó mất cây"),
    C("Chỉ dùng gỗ rừng trồng có giấy", { money: -0.03, counters: { honest: 1 } }, "Lời mỏng, ngủ yên"),
    C("Mua lại gỗ từ những ngôi nhà cũ bị phá dỡ", { bw: -3, flags: ["cpn_reclaimed"], gamble: { p: 0.5, win: { money: 0.03, counters: { cpn_craft: 1 }, log: "Gỗ cũ đanh chắc, khách quý chính những vết đinh xưa." }, lose: { money: -0.02, log: "Nửa số gỗ mục ruột, phải bỏ." } } }, "Mất công tìm, có loại gỗ không ai có", { tier: "awakened" })], 1)),
  daily(CP, "cpn_dust", [25, 70], 9, () => T("Tai ù đến tối", "Sau mỗi ngày đứng cạnh máy cưa và máy bào, tai bạn ù đến tối. Mùi bụi gỗ bám vào cả giấc ngủ. Một bộ hút bụi và chụp tai cho cả xưởng giá bằng hai tháng thu nhập.", [
    C("Mua bộ hút bụi, bắt cả xưởng đeo chụp tai", { money: -0.15, health: 5, flags: ["cpn_safe"] }, "Tốn hai tháng thu nhập, giữ phổi và tai"),
    C("Mở toang cửa, làm tiếp", { health: -5, counters: { dust: 1 } }, "Giữ tiền, cơ thể trả dần")], 1)),
  daily(CP, "cpn_deposit", [20, 65], 8, () => T("Khách hủy khi gỗ đã xẻ", "Một khách đặt bộ bàn ăn, cọc ba phần mười. Gỗ đã xẻ, mộng đã đục một nửa thì khách gọi hủy, đòi lại tiền cọc vì 'chưa giao gì cả'.", [
    C("Trả lại đủ tiền cọc", { money: -0.04, rel: 2 }, "Mất tiền gỗ, giữ tiếng dễ chịu"),
    C("Giữ cọc theo thỏa thuận", { money: 0.02, rel: -2, flags: ["cpn_kept_deposit"] }, "Đúng giấy tờ, khách đi nói xấu"),
    C("Làm xong, bán cho khách khác rồi hoàn cọc", { bw: -2, gamble: { p: 0.6, win: { money: 0.03, counters: { cpn_craft: 1 }, log: "Bộ bàn bán được sau hai tuần. Khách cũ nhận lại cọc, lần sau quay lại đặt." }, lose: { money: -0.03, log: "Bộ bàn nằm trong xưởng ba tháng." } } }, "Ôm hàng một thời gian, không ai thiệt hẳn", { tier: "awakened" })], 2)),
  daily(CP, "cpn_coffin", [25, 70], 10, () => T("Cỗ quan tài trả góp", "Một gia đình nghèo trong xóm có người mất đêm qua. Họ cần một cỗ quan tài trước trưa mai, chỉ trả được một phần ba, phần còn lại xin trả dần.", [
    C("Đóng ngay, cho trả dần", { money: -0.03, rel: 4, flags: ["cpn_coffin_credit"] }, "Ôm một khoản nợ khó đòi, được lòng xóm"),
    C("Đóng, không lấy tiền", { money: -0.06, rel: 5, counters: { kind: 1 } }, "Mất tiền gỗ và hai đêm công"),
    C("Giới thiệu sang cơ sở mai táng", { rel: -1 }, "Không thiệt gì, xóm nhớ bạn đã từ chối")], 0)),
  daily(CP, "cpn_kid", [22, 65], 9, () => T("Cậu thiếu niên đứng ở cửa xưởng", "Một cậu thiếu niên mười sáu tuổi ngày nào cũng đứng ở cửa xưởng nhìn bạn bào gỗ. Nhà cậu nghèo, cậu đã nghỉ học. Hôm nay cậu xin học việc.", [
    C("Nhận, trả chút tiền và dạy từ đầu", { money: -0.04, bw: -2, flags: ["cpn_apprentice"] }, "Tốn tiền và kiên nhẫn, có người nối nghề"),
    C("Khuyên cậu đi học lại, hè hãy đến", { rel: 1, counters: { kind: 1 } }, "Đúng lẽ, cậu có thể không quay lại"),
    C("Từ chối, xưởng không có chỗ", { money: 0.01 }, "Đỡ một gánh, mất một người")], 0)),
  daily(CP, "cpn_storm", [20, 65], 8, (c) => T("Cả xóm cần cửa mới", vary("cpnst", c.age, [
    "Bão quét qua đêm qua. Sáng ra, nửa xóm mất cửa, tốc mái. Điện thoại của bạn reo liên tục.",
    "Sau trận lũ, cửa gỗ nhà nào cũng trương nở, không đóng được. Người ta xếp hàng chờ bạn."]), [
    C("Tăng giá gấp ba, ai trả trước làm trước", { money: 0.15, rel: -4, counters: { honest: -1 } }, "Lời to, xóm nhớ mãi"),
    C("Giữ giá cũ, làm theo thứ tự", { money: 0.05, rel: 2 }, "Lời vừa, công bằng"),
    C("Sửa trước cho nhà người già và nhà neo người", { money: 0.01, rel: 5, counters: { kind: 1 } }, "Gần như không lời, được cả xóm tin", { longterm: true })], 1)),
  daily(CP, "cpn_contractor", [22, 60], 9, () => T("Hai mươi căn tủ bếp chưa trả", "Một nhà thầu thuê bạn làm tủ bếp cho bốn mươi căn hộ. Lắp xong hai mươi căn, họ chưa trả đồng nào, hẹn 'sau đợt bàn giao'.", [
    C("Dừng làm cho đến khi được trả", { gamble: { p: 0.55, win: { money: 0.2, log: "Họ trả đủ hai mươi căn trong tuần." }, lose: { money: -0.15, log: "Họ thuê xưởng khác làm tiếp. Tiền hai mươi căn cũ vẫn treo." } } }, "Có thể đòi được, có thể mất hợp đồng"),
    C("Làm tiếp, tin lời hứa", { gamble: { p: 0.4, win: { money: 0.35, log: "Bàn giao xong, họ trả đủ cả bốn mươi căn." }, lose: { money: -0.35, flags: ["cpn_burned"], log: "Nhà thầu phá sản. Tên bạn nằm trong danh sách chủ nợ." } } }, "Được ăn cả, ngã về không"),
    C("Rủ các xưởng cùng bị nợ, nộp đơn chung", { bw: -4, agency: 0.02, flags: ["cpn_creditors_group"], gamble: { p: 0.5, win: { money: 0.15, log: "Sáu xưởng cùng đứng đơn. Nhà thầu phải ký lịch trả nợ." }, lose: { money: -0.1, log: "Đơn nằm ở tòa hai năm. Mỗi xưởng nhận lại một ít." } } }, "Đông người thì mạnh, chậm và mệt", { tier: "awakened" })], 0)),
  daily(CP, "cpn_chair", [22, 65], 9, () => T("Chiếc ghế gãy chân", "Một chiếc ghế bạn đóng hai năm trước gãy chân khi khách đang ngồi. Bà ấy bị bầm lưng, đăng ảnh lên mạng kèm tên xưởng.", [
    C("Đến xin lỗi, đổi ghế mới, kiểm lại cả bộ", { money: -0.04, counters: { cpn_craft: 1 } }, "Tốn tiền, giữ tiếng"),
    C("Xem kỹ, chỉ ra ghế bị kê lên đứng", { gamble: { p: 0.5, win: { log: "Ảnh chân ghế cho thấy vết dập. Bà ấy gỡ bài." }, lose: { counters: { cpn_craft: -1 }, log: "Người ta chỉ nhớ bạn đổ lỗi cho khách." } } }, "Có thể đúng, dễ thành đổ lỗi")], 0)),
  daily(CP, "cpn_tree", [22, 70], 9, (c) => T("Thân cây ông trồng", `Một gia đình chở đến thân cây ${vn(c) ? "mít" : "lớn"} trong vườn, cây do người ông đã khuất trồng, vừa đổ sau trận gió. Họ muốn làm một chiếc bàn ăn cho cả nhà. Gỗ còn tươi, nhiều mắt, dễ nứt.`, [
    C("Nhận, sấy một năm, làm thật kỹ", { bw: -3, gamble: { p: 0.6, win: { rel: 2, counters: { cpn_craft: 1 }, log: "Một năm sau, cả nhà ngồi quanh chiếc bàn. Bà cụ sờ mãi vân gỗ." }, lose: { money: -0.03, log: "Mặt bàn nứt một đường dài. Bạn chèn nêm hình cánh bướm; họ vẫn nhận." } } }, "Giữ chỗ một năm, có thể hỏng"),
    C("Khuyên làm vài món nhỏ thay vì bàn", { money: 0.02, know: 1, flags: ["cpn_small_keepsakes"] }, "Chắc chắn, không thành điều họ mong"),
    C("Từ chối, gỗ này không làm được", { rel: -1 }, "Không rủi ro, họ đi tìm người khác")], 0)),
  daily(CP, "cpn_tender", [22, 60], 9, (c, N) => { const r = role(c, "rival")!; return T("Bốn trăm bộ bàn ghế trường học", `Trường học trong ${vn(c) ? "huyện" : "vùng"} mời thầu bốn trăm bộ bàn ghế. ${N(r)} cũng dự thầu, và nói thẳng: muốn trúng thì phải "lại quả" cho người chấm.`, [
    C("Lại quả như người ta", { money: 0.2, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [2, 8], note: "lại quả để trúng thầu bàn ghế trường học" } }, "Có hợp đồng, có một bí mật"),
    C("Bỏ thầu sạch", { counters: { honest: 1 }, gamble: { p: 0.3, win: { money: 0.15, log: "Năm ấy có đoàn thanh tra. Hồ sơ sạch của bạn thắng." }, lose: { log: "Hợp đồng về tay người khác, như dự đoán." } } }, "Có thể trượt, giữ sạch tay"),
    C(`Rủ ${N(r)} đứng thầu chung, công khai giá`, { gamble: { p: 0.4, win: { money: 0.1, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "cùng đứng thầu bàn ghế trường học, công khai giá" }, log: "Hai xưởng chia đôi đơn. Bảng giá dán ngay cổng trường." }, lose: { trust: { npc: r, delta: -0.1 }, log: `${N(r)} đi báo trước với người chấm thầu.` } } }, "Đổi luật chơi, có thể bị bán đứng", { tier: "sovereign" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(CP, "cpn_quit", [30, 60], 99, () => T("Trưởng ca ở nhà máy ván ép", "Một nhà máy ván ép tuyển trưởng ca kiểm hàng: lương đều, có bảo hiểm, không phải cầm đục, không phải đứng cạnh lưỡi cưa nữa.", [
    C("Nhận, đóng xưởng", { ...leave(CP), flags: ["ex_carpenter"] }, "Ổn định, tay không còn mùi gỗ"),
    C("Ở lại xưởng", { happy: 1, counters: { cpn_craft: 1 } }, "Túng thêm vài năm, còn nghề")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(CP, "cpn_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")), (c, N) => {
    const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn bỏ học theo nghề mộc`, `${N(k)} muốn theo bạn học nghề mộc ngay bây giờ, bỏ năm cuối phổ thông. ${N(k)} đã tự đóng một chiếc kệ sách, mộng còn hở nhưng đứng vững.`, [
      C("Cho theo, dạy từ đầu", { trust: { npc: k, delta: 0.2 }, flags: ["cpn_child_apprentice"] }, "Có người nối nghề, con dở dang bằng cấp"),
      C("Bắt học xong phổ thông", { trust: { npc: k, delta: -0.1 } }, "Chắc đường học, con thấy bị cản"),
      C("Dạy cuối tuần, học xong rồi tính", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "dạy con nghề mộc khi con học xong phổ thông", years: 2 } }, "Cả hai cùng chờ, treo một lời hứa", { tier: "awakened" })], 2, { npc: k });
    const sp = role(c, "spouse")!;
    return T("Tủ bếp nhà mình thiếu cánh", `${N(sp)} chỉ vào tủ bếp nhà mình: ba năm nay vẫn thiếu hai cánh cửa. "Nhà thợ mộc mà như nhà không ai ở," ${N(sp)} nói, nửa đùa nửa thật.`, [
      C("Gác đơn hàng, dành bốn Chủ nhật làm", { money: -0.03, trust: { npc: sp, delta: 0.2 } }, "Mất bốn ngày công, nhà ra nhà"),
      C("Hứa làm xong sau mùa đơn hàng", { trust: { npc: sp, delta: -0.05 }, promise: { to: sp, what: "làm xong cánh tủ bếp nhà mình", years: 1 } }, "Không mất việc, treo một lời hứa"),
      C("Thuê một thợ khác làm cho nhanh", { money: -0.04, happy: -1, trust: { npc: sp, delta: -0.05 } }, "Nhanh gọn, thành chuyện cười trong họ")], 0, { npc: sp });
  }),
];

export const PACK_CRAFT_A: Storylet[] = [...ATN_CARDS, ...FSH_CARDS, ...BRB_CARDS, ...CPN_CARDS];
