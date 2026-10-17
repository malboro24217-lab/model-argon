/**
 * Gói "Phụng sự & tâm linh" B: NGƯỜI BẢO VỆ MÔI TRƯỜNG · NHÂN VIÊN CÔNG TÁC XÃ HỘI · THẦY BÓI, THẦY PHONG THỦY · LÍNH CỨU HỎA.
 * Theo chuẩn của singer.ts và docs/content-guide.md. Tiền tố id: env_ · sow_ · ftl_ · fir_.
 * Bộ đếm riêng: env_cred · sow_bond, sow_load · ftl_truth, ftl_flatter, ftl_fame · fir_nerve, fir_scars, fir_kind.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, life, step, talent, door, beat, daily, cross } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;

/* =====================================================================
 * NGƯỜI BẢO VỆ MÔI TRƯỜNG (kiểm lâm, nhà bảo tồn) — tiền tố env_
 * ===================================================================== */
const EN = "environmentalist";

const ENV_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(EN, "env_t_birds", [8, 13], () => true, () => T("Cuốn sổ chim", "Bạn ghi vào một cuốn vở cũ mọi loài chim thấy sau nhà: bốn mươi mốt loài, có vẽ cả mỏ và màu lông. Thầy dạy sinh mượn về đọc, rồi hỏi bạn có muốn đi đếm chim với nhóm của thầy mỗi sáng Chủ nhật không.", [
    C("Đi theo thầy mỗi sáng Chủ nhật", { money: -0.02, know: 3, rel: -1, flags: [talentFlag(EN)], counters: { talents_seen: 1 } }, "Mất buổi chơi với bạn, mở một con đường"),
    C("Cảm ơn thầy, Chủ nhật còn đá bóng", { rel: 2, counters: { talents_seen: 1 } }, "Vui với bạn bè, cuốn sổ nằm im")], 0)),
  talent(EN, "env_t_stream", [11, 16], () => true, () => T("Con suối đổi màu", "Từ ngày xưởng nhuộm đầu nguồn chạy ca đêm, con suối nơi bạn hay tắm chuyển sang màu tím nhạt. Sáng nay có mấy chục con cá nổi trắng ở khúc quanh. Người lớn bảo đừng dây vào: chú của đứa bạn thân đang làm ở xưởng.", [
    C("Đổ nước vào chai, mang đến cho cô giáo", { rel: -3, agency: 0.01, flags: [talentFlag(EN)], counters: { talents_seen: 1 } }, "Bị xì xào trong xóm, mở một con đường"),
    C("Rủ bạn ra chỗ khác tắm", { rel: 1, health: -1, counters: { talents_seen: 1 } }, "Giữ hòa khí, nước bẩn vẫn chảy qua làng")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(EN, "env_d_ranger", [18, 35], () => true, (c) => T("Tuyển kiểm lâm", c.poor_country
    ? "Hạt kiểm lâm tuyển người cho một trạm cách chợ gần nhất bốn mươi cây số đường đất. Lương thấp, một tháng về nhà một lần, mùa mưa có khi kẹt cả tuần."
    : "Vườn quốc gia cần người tuần tra khu rừng phía bắc. Hợp đồng theo mùa, ở trong nhà gỗ cạnh trạm, sóng điện thoại chỉ có trên đỉnh đồi.", [
    C("Nộp đơn, chấp nhận ở trong rừng", { ...become(EN), counters: { doors_seen: 1 }, rel: -3, happy: 2 }, "Lương thấp, xa người thân, được ở với rừng"),
    C("Nộp đơn nhưng xin trạm gần nhà", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(EN), log: "Bạn được nhận vào trạm cách nhà mười hai cây số." }, lose: { happy: -2, log: "Trạm gần nhà đã đủ người. Họ không gọi lại." } } }, "Ít hy sinh hơn, khó được nhận"),
    C("Thôi, tìm việc ở thành phố", { counters: { doors_seen: 1 }, money: 0.03 }, "Đủ ăn, rừng là chuyện của người khác")], 0)),
  door(EN, "env_d_fishkill", [20, 50], () => true, () => T("Cá chết trắng sông", "Một sáng, cá chết dạt kín hai bờ sông suốt mấy cây số. Nhà máy đầu nguồn nói do thời tiết. Một nhóm nhỏ ở thị trấn đang lấy mẫu nước và cần người làm toàn thời gian, lương trả bằng tiền quyên góp.", [
    C("Bỏ việc, theo nhóm ấy toàn thời gian", { ...become(EN), counters: { doors_seen: 1 }, money: -0.15, agency: 0.02 }, "Đặt cược thu nhập vào một dòng sông"),
    C("Đi lấy mẫu buổi tối, vẫn giữ việc", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.3, win: { ...become(EN), log: "Mẫu nước bạn lấy lên báo. Nhóm mời bạn làm hẳn." }, lose: { log: "Mẫu nước bị trả về vì sai quy trình. Nhóm cảm ơn rồi thôi." } } }, "Giữ an toàn, kiệt sức buổi tối"),
    C("Đứng ngoài, nhà còn nợ", { counters: { doors_seen: 1 }, happy: -2 }, "Yên ổn, áy náy mỗi lần đi qua sông")], 1)),
  door(EN, "env_d_survey", [22, 45], (c) => c.has_degree || f(c, talentFlag(EN)), () => T("Hai năm đếm một loài", "Một dự án đại học cần trợ lý thực địa hai năm để đặt máy ảnh tự động và đếm một loài mèo rừng tưởng đã biến mất. Lương bằng nửa việc văn phòng, ngủ lều, nhưng có tên trong công trình.", [
    C("Nhận, xách ba lô vào rừng", { ...become(EN), counters: { doors_seen: 1 }, know: 4, rel: -2 }, "Nửa lương, có nghề và có tên"),
    C("Từ chối, giữ việc văn phòng", { counters: { doors_seen: 1 }, money: 0.04, happy: -1 }, "Lương ổn, tiếc mãi một mùa rừng")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(EN, 1, 1, (c) => T("Ca tuần tra đầu tiên", `Ngày thứ ba ở trạm, bạn tìm thấy một đường bẫy dây thép dài ba trăm mét, hai mươi bảy cái thòng lọng. Dấu dép dẫn về một làng nhỏ nơi${c.poor_country ? " nhà nào cũng thiếu gạo tháng ba" : " nhiều nhà sống nhờ trợ cấp"}. Trạm trưởng bảo cứ lập biên bản cho đủ chỉ tiêu.`, [
    C("Gỡ hết, lập biên bản đúng luật", { counters: step(c, EN), flags: ["env_by_book"], income_mult: 1.05, rel: -2 }, "Cấp trên ghi nhận, làng dè chừng bạn"),
    C("Gỡ bẫy rồi tìm người đặt để nói chuyện", { counters: step(c, EN), bw: -3, gamble: { p: 0.5, win: { flags: ["env_village_ally"], counters: { env_cred: 1 }, log: "Người đặt bẫy là một ông già. Hôm sau ông dẫn bạn đi gỡ thêm mười cái nữa." }, lose: { log: "Không ai nhận. Tuần sau bẫy mới mọc lên ở khe bên kia." } } }, "Mất công, có thể có một đồng minh")], 0), (c) => c.age >= 18),
  beat(EN, 2, 3, (c) => T("Tấm ảnh lúc ba giờ sáng", `Máy ảnh tự động chụp được một con mèo rừng mà sách ghi đã tuyệt chủng ở vùng này. ${f(c, "env_village_ally") ? "Ông già làng bên là người chỉ cho bạn chỗ đặt máy." : "Bạn đặt máy theo tấm bản đồ cũ của trạm."} Một quỹ nước ngoài muốn tài trợ cho trạm; một công ty du lịch muốn mua ảnh để quảng bá khu nghỉ dưỡng ven rừng.`, [
    C("Nhận tài trợ, làm theo khung báo cáo của quỹ", { counters: step(c, EN), income_mult: 1.4, bw: -4, flags: ["env_funded"] }, "Có tiền và máy móc, sống theo lịch của nhà tài trợ"),
    C("Bán ảnh cho khu nghỉ dưỡng", { counters: step(c, EN), money: 0.4, flags: ["env_resort_deal"] }, "Tiền ngay, mở một con đường vào rừng"),
    C("Lập tổ tuần rừng với người trong làng, chia tiền khoán", { counters: step(c, EN), agency: 0.03, gamble: { p: f(c, "env_village_ally") ? 0.7 : 0.45, win: { flags: ["env_community_patrol"], counters: { env_cred: 2 }, income_mult: 1.15, log: "Mười hai hộ nhận khoán. Năm đầu, số bẫy gỡ được giảm một nửa." }, lose: { counters: { env_cred: 1 }, log: "Sau mùa mưa, tổ chỉ còn năm người. Bạn vẫn trả tiền khoán đúng hạn." } } }, "Chậm, chia quyền, bền nếu làng tin bạn", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(EN, 3, 4, (c, N) => { const o = role(c, "official"); const who = o ? N(o) : "Một cán bộ tỉnh";
    return T("Con đường xuyên vùng lõi", `Dự án ${c.poor_country ? "mỏ đá" : "đường cao tốc"} được duyệt cắt ngang vùng lõi, chỉ còn thiếu chữ ký của trạm vào báo cáo đánh giá tác động. ${who} gợi ý một chức phó hạt nếu bạn ký. ${f(c, "env_resort_deal") ? "Khu nghỉ dưỡng từng mua ảnh của bạn cũng đứng tên trong dự án. " : ""}${f(c, "env_community_patrol") ? "Tổ tuần rừng của làng nói sẵn sàng ra chặn xe. " : ""}Tuần trước, xe máy của trạm bị đốt.`, [
      C("Ký, nhận chức", { counters: step(c, EN), income_mult: 1.3, flags: ["env_signed"], secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 9], note: "ký báo cáo đánh giá tác động cho con đường xuyên rừng" }, ...(o ? { trust: { npc: o, delta: 0.2 } } : {}) }, "Lên chức, một chữ ký có thể quay lại"),
      C("Gửi toàn bộ hồ sơ cho báo chí", { counters: step(c, EN, { env_cred: 1 }), flags: ["env_whistle"], gamble: { p: 0.35 + 0.1 * Math.min(3, n(c, "env_cred")), win: { log: "Báo đăng ba kỳ. Dự án bị dừng để thẩm định lại." }, lose: { income_mult: 0.75, health: -3, log: "Bạn bị điều về văn phòng hạt. Hồ sơ nằm im trong một ngăn kéo." } } }, "Có thể cứu rừng, có thể mất chỗ đứng"),
      C("Xin nghỉ, rời khỏi rừng", { counters: step(c, EN), ...leave(EN), flags: ["ex_ranger"], happy: -4 }, "An toàn cho mình, bỏ lại khu rừng")], 1, o ? { npc: o } : {}); }, (c) => c.age >= 18),
  beat(EN, 4, 5, (c) => {
    if (f(c, "env_signed")) return T("Sạt lở sau mùa mưa", "Ba năm sau khi con đường mở, cả một sườn đồi trượt xuống sau bốn ngày mưa, vùi bảy nóc nhà. Đoàn điều tra lật lại báo cáo đánh giá tác động: trang cuối có chữ ký của bạn. Người hứa cho bạn chức đã chuyển công tác.", [
      C("Khai hết ai đã ép bạn ký", { counters: step(c, EN, { honest: 2 }), custom: "apologize", income_mult: 0.6, flags: ["env_confessed"] }, "Mất chức, có thể ngủ được"),
      C("Im lặng, đổ cho mưa lớn", { counters: step(c, EN, { honest: -2 }), happy: -6, flags: ["env_buried_truth"] }, "Giữ ghế, mang chuyện này suốt đời"),
      C("Lập quỹ cho các hộ mất nhà rồi xin nghỉ", { counters: step(c, EN), ...leave(EN), money: -0.5, agency: 0.02 }, "Trả bằng tiền của mình, rời nghề", { longterm: true })], 0);
    if (f(c, "env_whistle") || f(c, "env_community_patrol") || n(c, "env_cred") >= 3) return T("Vùng lõi được công nhận", `Khu rừng được công nhận là vùng bảo tồn cấp quốc gia${f(c, "env_whistle") ? ", phần lớn nhờ bộ hồ sơ bạn từng gửi báo" : ", nhờ mười năm số liệu tổ tuần rừng ghi chép"}. Bộ mời bạn về thủ đô làm giám đốc chương trình. Ở trạm, ba kiểm lâm trẻ vẫn chờ bạn dạy cách đọc dấu chân.`, [
      C("Về thủ đô làm giám đốc", { counters: step(c, EN), income_mult: 1.4, flags: ["env_director"], happy: -2 }, "Quyền lớn, xa rừng"),
      C("Ở lại trạm dạy lớp kiểm lâm trẻ", { counters: step(c, EN), flags: ["env_mentor"], happy: 5, income_mult: 0.95 }, "Ít tiền, ở lại với rừng"),
      C("Đề nghị giao quyền quản lý rừng cho các làng", { counters: step(c, EN), agency: 0.03, gamble: { p: 0.5, win: { flags: ["env_comanaged"], log: "Bốn làng ký quy ước giữ rừng. Lần đầu tiên tiền khoán đi thẳng về làng." }, lose: { income_mult: 0.85, log: "Đề xuất bị gác lại. Bạn bị coi là người khó bảo." } } }, "Làm luật mới, đụng nhiều người", { tier: "sovereign" })], 0);
    return T("Mùa khô thứ mười", "Mười năm, rừng vẫn mất từng mảng nhỏ mỗi mùa khô, không ai thấy, không ai ghi. Lưng bạn đau mỗi sáng, lương vẫn như cũ. Một công ty trồng cây lấy gỗ mời bạn làm quản lý vùng nguyên liệu, lương gấp ba.", [
      C("Nhận lời, rời ngành bảo tồn", { counters: step(c, EN), ...leave(EN), money: 0.3 }, "Đủ tiền nuôi nhà, rừng thiếu một người"),
      C("Ở lại, xin thêm hai người cho trạm", { counters: step(c, EN, { env_cred: 1 }), health: -3, gamble: { p: 0.4, win: { log: "Hạt cấp thêm hai biên chế. Ca tuần đêm không còn đi một mình." }, lose: { happy: -3, log: "Đơn xin người bị trả lời bằng một câu: chờ năm sau." } } }, "Bền bỉ, thân thể trả giá"),
      C("Công khai sổ tuần tra thành bản đồ mất rừng", { counters: step(c, EN, { env_cred: 1 }), flags: ["env_open_map"], bw: -4, agency: 0.02 }, "Ai cũng thấy rừng mất ở đâu, cấp trên không vui", { tier: "awakened" })], 1);
  }, (c) => c.age >= 18),
  beat(EN, 5, 6, (c) => T("Cây cổ thụ số một", `Cây cổ thụ bạn đánh số trong ca tuần tra đầu tiên giờ là mốc trên bản đồ. ${f(c, "env_buried_truth") ? "Mỗi lần đi qua sườn đồi sạt năm ấy, bạn vẫn đi vòng." : f(c, "env_director") ? "Bạn chỉ còn về rừng hai lần một năm, theo đoàn khách." : f(c, "env_mentor") ? "Học trò đầu tiên của bạn giờ làm trạm trưởng." : "Trạm đã đổi ba đời trạm trưởng, bạn vẫn ở đó."} Một công ty muốn đặt tên bạn cho dự án tín chỉ các-bon của họ, trả một khoản lớn.`, [
    C("Cho mượn tên, lấy tiền cho trạm", { counters: step(c, EN), money: 0.3, flags: ["env_named_project"] }, "Rừng có tiền, tên bạn gắn với họ"),
    C("Từ chối, viết sổ tay tuần rừng cho người trẻ", { counters: step(c, EN), flags: ["passed_on"], happy: 4, money: -0.03 }, "Không tiền, để lại cái biết"),
    C("Đi tuần lần cuối cùng học trò rồi nghỉ hưu", { counters: step(c, EN), ...leave(EN), happy: 6, rel: 3, health: -2 }, "Khép lại tử tế, mất thu nhập")], 1), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(EN, "env_envelope", [20, 60], 8, () => T("Phong bì trên yên xe", "Một xe tải chở gỗ dừng ở barie lúc mười một giờ đêm. Giấy tờ ghi gỗ rừng trồng, nhưng vân gỗ thì không phải. Tài xế đặt một phong bì dày lên yên xe máy của bạn rồi quay đi.", [
    C("Cầm phong bì, nâng barie", { money: 0.15, counters: { honest: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [2, 8], note: "nhận phong bì cho xe gỗ qua trạm" } }, "Tiền dễ, một bí mật nằm ở sổ trạm"),
    C("Giữ xe, lập biên bản", { counters: { honest: 1, env_cred: 1 }, bw: -3, gamble: { p: 0.6, win: { log: "Hạt tịch thu cả xe. Trạm được khen." }, lose: { happy: -3, log: "Sáng hôm sau có lệnh cho xe đi. Không ai giải thích." } } }, "Đúng luật, có thể vô ích")], 1)),
  daily(EN, "env_fire", [20, 60], 7, (c) => T("Lửa vượt đường băng", vary("envfi", c.age, [
    "Lửa đốt nương ở làng bên vượt qua đường băng cản lửa, lan vào rừng. Trạm có ba người và một máy bơm.",
    "Mùa khô năm nay dài bốn tháng. Một tàn lửa ở bãi cắm trại thành đám cháy dài một cây số trước khi trời sáng."]), [
    C("Lao vào dập cùng anh em", { health: -5, rel: 2, counters: { env_cred: 1 } }, "Cứu được rừng, phổi trả giá"),
    C("Giữ khoảng cách, gọi cứu viện, báo dân sơ tán", { happy: -2, flags: ["env_fire_protocol"] }, "An toàn, rừng cháy thêm vài héc-ta")], 0)),
  daily(EN, "env_cage", [20, 60], 8, (c) => T("Con thú nhỏ trong lồng", `Ở chợ ven đường, một bà cụ bán ${vn(c) ? "con cu li" : "một con thú nhỏ thuộc loài được bảo vệ"} trong lồng tre, giá bằng hai bữa ăn. Mắt nó to, tròn, sợ ánh đèn. Bà bảo ở nhà còn hai đứa cháu chưa ăn trưa.`, [
    C("Mua về thả", { money: -0.02, happy: 2, counters: { env_soft: 1 } }, "Cứu một con, chợ sẽ bắt thêm con khác"),
    C("Tịch thu, nhắc nhở bà cụ", { rel: -2, flags: ["env_confiscated"] }, "Đúng luật, bà cụ mất một bữa ăn"),
    C("Tịch thu, mời bà làm công ở vườn ươm của trạm", { money: -0.04, agency: 0.01, counters: { env_cred: 1 } }, "Tốn tiền trạm, cắt một mắt xích", { tier: "awakened" })], 1)),
  daily(EN, "env_saplings", [20, 60], 8, () => T("Hai nghìn cây giống để chụp ảnh", "Một đoàn tình nguyện từ thành phố đến trồng hai nghìn cây giống, có máy quay đi theo. Loại cây họ mang không hợp đất đồi này; ba năm nữa sẽ chết gần hết.", [
    C("Để họ trồng, nhận tiền ủng hộ trạm", { money: 0.05, counters: { env_cred: -1 } }, "Có tiền, đồi vẫn trọc"),
    C("Nói thật, đề nghị đổi sang cây bản địa", { rel: -1, know: 2, gamble: { p: 0.5, win: { flags: ["env_native_trees"], log: "Họ quay lại năm sau với cây bản địa từ vườn ươm của làng." }, lose: { log: "Họ sang trồng ở xã khác, nơi không ai hỏi." } } }, "Đúng việc, có thể mất nhà tài trợ")], 1)),
  daily(EN, "env_boars", [20, 60], 8, (c) => T("Thú rừng phá rẫy", vary("envbo", c.age, [
    "Đàn lợn rừng từ khu bảo tồn xuống phá trụi ba rẫy ngô trong một đêm. Dân làng kéo đến trạm, đòi được săn.",
    "Năm nay thú rừng xuống phá vườn bốn lần. Một ông trưởng thôn nói thẳng: hoặc trạm đền, hoặc làng tự lo."]), [
    C("Cho phép săn có kiểm soát", { rel: 3, counters: { env_cred: -1 }, flags: ["env_allowed_cull"] }, "Làng yên lòng, đàn thú vơi đi"),
    C("Lấy quỹ trạm đền bù cho các hộ", { money: -0.05, rel: 2, counters: { env_cred: 1 } }, "Giữ được thú, quỹ trạm cạn"),
    C("Cùng làng dựng hàng rào và chòi canh", { bw: -4, agency: 0.02, gamble: { p: 0.55, win: { flags: ["env_fence"], counters: { env_cred: 1 }, log: "Hàng rào xong trước mùa thu hoạch. Đàn lợn rừng đổi đường." }, lose: { log: "Hàng rào đổ sau trận mưa đầu mùa. Làng lại kéo đến trạm." } } }, "Tốn sức cả mùa, có thể giải được gốc", { tier: "awakened" })], 0)),
  daily(EN, "env_alone", [20, 55], 8, (c) => T("Tháng thứ ba chưa về nhà", `${vary("enval", c.age, [
    "Mưa rừng kéo dài, đường ra bị sạt, ba tháng rồi bạn chưa về nhà. Điện thoại chỉ có sóng trên mỏm đá sau trạm, mỗi tối mười phút.",
    "Người cùng trạm vừa xin chuyển. Giờ chỉ còn bạn và một con chó, cách người gần nhất bảy cây số."])}${vn(c) ? " Tết này trạm chỉ còn mình bạn trực." : ""}`, [
    C("Xin chuyển về trạm gần thị trấn", { income_mult: 0.92, happy: 3, rel: 3, flags: ["env_town_post"] }, "Gần người thân, xa rừng sâu"),
    C("Ở lại, viết thư về nhà", { happy: -3, rel: -2, counters: { env_cred: 1 } }, "Giữ rừng, xa người")], 1)),
  daily(EN, "env_viral", [20, 60], 9, () => T("Đoạn phim bạn khóc", "Một khách du lịch quay cảnh bạn ngồi bên con gấu non vừa gỡ khỏi bẫy, mắt đỏ hoe. Đoạn phim có hai triệu lượt xem sau một đêm. Hàng nghìn người hỏi số tài khoản.", [
    C("Mở quỹ quyên góp đứng tên mình", { money: 0.1, bw: -5, flags: ["env_own_fund"], counters: { env_fame: 2 } }, "Tiền về nhanh, sổ sách là việc của bạn"),
    C("Chỉ người ta về quỹ chung của trạm", { counters: { env_fame: 1, honest: 1 } }, "Ít tiếng, đỡ lời ra tiếng vào"),
    C("Mở quỹ, đăng sổ thu chi công khai mỗi tháng", { money: 0.05, bw: -3, agency: 0.02, counters: { env_cred: 2 } }, "Mất công mỗi tháng, ai cũng soi được", { tier: "awakened" })], 1)),
  daily(EN, "env_firewood", [20, 60], 8, (c) => T("Bó củi trong vùng cấm", c.poor_country
    ? "Một bà cụ trong làng cõng bó củi khô ra từ vùng lõi, đúng chỗ cắm biển cấm. Nhà bà không có bếp ga, mùa đông lạnh xuống năm độ."
    : "Một ông lão nghỉ hưu vẫn nhặt nấm và củi trong khu cấm như ông đã làm suốt bốn mươi năm, từ trước khi có tấm biển.", [
    C("Phạt đúng mức quy định", { rel: -2, flags: ["env_fined_elder"], counters: { env_cred: -1 } }, "Giữ luật, mất lòng cả làng"),
    C("Làm ngơ lần này", { rel: 1, counters: { honest: -1 } }, "Được lòng, mở một tiền lệ"),
    C("Đề xuất một dải vùng đệm cho dân lấy củi", { agency: 0.02, bw: -3, gamble: { p: 0.5, win: { flags: ["env_buffer_zone"], counters: { env_cred: 1 }, log: "Hạt duyệt một dải vùng đệm. Lối mòn vào vùng lõi thưa hẳn." }, lose: { log: "Đề xuất bị trả về vì sai mẫu đơn." } } }, "Làm luật mới, tốn nửa năm giấy tờ", { tier: "sovereign" })], 2)),
  daily(EN, "env_dredger", [20, 60], 9, () => T("Máy hút cát lúc nửa đêm", "Hai chiếc máy hút cát không số hiệu làm việc dưới sông lúc nửa đêm. Bờ ruộng bên kia đã sụt mất ba mét. Trên bờ có người canh, cầm đèn pin chiếu về phía bạn.", [
    C("Một mình ra đối mặt", { gamble: { p: 0.4, win: { counters: { env_cred: 1 }, log: "Họ nổ máy bỏ đi. Đêm sau không quay lại." }, lose: { health: -7, log: "Bạn bị đánh, phải nằm viện hai tuần." } } }, "Có thể chặn được, có thể nằm viện"),
    C("Quay phim từ xa, gửi công an", { bw: -2, flags: ["env_filed_report"], gamble: { p: 0.5, win: { log: "Công an bắt được một chiếc. Chiếc kia đổi chỗ." }, lose: { log: "Hồ sơ chuyển qua ba phòng rồi im." } } }, "An toàn, chậm"),
    C("Rủ dân hai bờ cùng thay nhau canh sông", { rel: 3, health: -1, agency: 0.02, counters: { env_cred: 1 } }, "Đông người thì vững, kéo họ vào rủi ro", { tier: "awakened" })], 1)),
  daily(EN, "env_dataset", [22, 60], 9, (c, N) => { const m = role(c, "mentor")!; return T("Sáu năm số liệu", `${N(m)}, người dạy bạn những năm đầu, muốn dùng sáu năm số liệu máy ảnh tự động của bạn cho một bài báo khoa học. Tên bạn sẽ nằm trong phần cảm ơn. Đổi lại, ${N(m)} giới thiệu bạn một suất học bổng ở nước ngoài.`, [
    C("Đồng ý, nhận suất học bổng", { know: 5, flags: ["env_scholarship"], memory: { npc: m, tag: "WIN_WIN_DEAL", weight: 0.2, note: "trao bộ số liệu rừng để đổi suất học bổng" } }, "Có đường học lên, mất công trình của mình"),
    C("Đòi đứng tên đồng tác giả", { gamble: { p: 0.5, win: { counters: { env_cred: 1 }, memory: { npc: m, tag: "WIN_WIN_DEAL", weight: 0.3, note: "cùng đứng tên bài báo về khu rừng" }, log: "Bài báo có tên bạn đứng thứ hai." }, lose: { trust: { npc: m, delta: -0.2 }, log: `${N(m)} thôi không nhắc chuyện học bổng nữa.` } } }, "Giữ công sức, có thể mất người đỡ đầu", { tier: "awakened" }),
    C("Giữ số liệu, tự viết lấy", { bw: -6, know: 3, trust: { npc: m, delta: -0.1 } }, "Chậm mấy năm, của mình hoàn toàn")], 1, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(EN, "env_consult", [28, 60], 99, () => T("Lời mời làm tư vấn", "Một công ty tư vấn mời bạn viết báo cáo môi trường cho các dự án xây dựng, lương gấp ba. Bạn biết phần lớn báo cáo kiểu này được viết để dự án được duyệt.", [
    C("Nhận, rời ngành bảo tồn", { ...leave(EN), money: 0.2, flags: ["env_consultant"] }, "Lương cao, đổi phe bàn ký"),
    C("Ở lại với rừng", { happy: 1, counters: { env_cred: 1 } }, "Nghèo thêm vài năm nữa")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(EN, "env_family", [22, 60], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const sp = role(c, "spouse");
    if (c.married && sp) return T("Mười hai ngày một tháng", `${N(sp)} đếm được: một tháng bạn ở nhà mười hai ngày. ${c.kids_alive > 0 ? "Bọn trẻ bắt đầu gọi điện cho bạn như gọi cho một người họ hàng xa." : "Những bữa tối của hai người toàn qua màn hình điện thoại."}`, [
      C("Xin chuyển về văn phòng hạt", { trust: { npc: sp, delta: 0.2 }, income_mult: 0.95, happy: -3 }, "Gia đình đủ người, rừng thiếu một người"),
      C("Đưa cả nhà lên sống gần trạm", { money: -0.25, rel: 2, trust: { npc: sp, delta: 0.1 } }, "Ở cạnh nhau, người nhà bỏ việc ở phố"),
      C("Giữ nguyên, hứa nghỉ trọn mùa mưa ở nhà", { trust: { npc: sp, delta: -0.05 }, promise: { to: sp, what: "nghỉ trọn một tháng mùa mưa ở nhà", years: 1 } }, "Giữ nghề, treo một lời hứa")], 0, { npc: sp });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Quả đồi của nhà", `${N(p)} muốn bán ba héc-ta đồi của nhà cho một công ty trồng cây lấy gỗ, để có tiền sửa nhà. Trên đồi còn mấy cây cổ thụ từ thời ông nội.`, [
      C("Đồng ý để bố mẹ bán", { trust: { npc: p, delta: 0.2 }, happy: -3 }, "Bố mẹ có tiền, đồi thành rừng một loài"),
      C("Xin giữ đồi, tự góp tiền sửa nhà", { money: -0.3, trust: { npc: p, delta: 0.1 }, flags: ["env_family_grove"] }, "Mất tiền mình, giữ được cây"),
      C("Bán phần đồi trọc, giữ phần có cây cổ thụ", { money: -0.1, agency: 0.01, gamble: { p: 0.6, win: { trust: { npc: p, delta: 0.15 }, log: "Công ty đồng ý mua nửa đồi. Mấy cây cổ thụ còn đứng đó." }, lose: { trust: { npc: p, delta: -0.1 }, log: "Công ty chỉ mua nguyên lô. Chuyện bán đồi bị gác lại, không khí trong nhà lạnh hẳn." } } }, "Thỏa hiệp, có thể không ai vừa lòng", { tier: "awakened" })], 1, { npc: p });
  }),
];

/* =====================================================================
 * NHÂN VIÊN CÔNG TÁC XÃ HỘI — tiền tố sow_
 * Hồ sơ trẻ em kể bằng hậu quả và lựa chọn của người làm nghề, không tả chi tiết bạo hành.
 * ===================================================================== */
const SW = "social_worker";

const SOW_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SW, "sow_t_lunch", [10, 16], () => true, () => T("Hộp cơm chia đôi", "Người bạn ngồi cạnh bạn đến lớp không ăn sáng, hay ngủ gục giờ đầu. Bạn biết bố mẹ bạn ấy đi làm xa, ở nhà chỉ có bà đã yếu. Bạn ấy dặn đừng nói với ai.", [
    C("Chia cơm, rồi kể với cô chủ nhiệm", { rel: -2, flags: [talentFlag(SW)], counters: { talents_seen: 1, kind: 1 } }, "Bạn ấy được giúp, có thể giận bạn"),
    C("Chia cơm mỗi ngày, giữ kín cho bạn", { rel: 2, money: -0.01, counters: { talents_seen: 1, kind: 1 } }, "Giữ lời, gánh một mình")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SW, "sow_d_shelter", [22, 50], () => true, () => T("Mái ấm thiếu người", "Mái ấm cho trẻ ở cuối phố vừa mất người phụ trách duy nhất. Hai mươi sáu đứa trẻ, một bếp ăn, một bà giám đốc đã ngoài bảy mươi. Bà hỏi bạn có về làm được không, lương bằng hai phần ba chỗ cũ.", [
    C("Nhận, về làm cho mái ấm", { ...become(SW), counters: { doors_seen: 1 }, money: -0.05, happy: 3 }, "Ít lương, nhiều việc, có ý nghĩa"),
    C("Làm tình nguyện mỗi tối thứ Bảy", { counters: { doors_seen: 1, kind: 1 }, bw: -2, gamble: { p: 0.25, win: { ...become(SW), log: "Sau nửa năm, bà giám đốc giao hẳn cho bạn sổ hồ sơ." }, lose: { log: "Mái ấm tìm được người khác. Bạn vẫn đến mỗi tối thứ Bảy." } } }, "Giữ việc cũ, góp một buổi"),
    C("Gửi một khoản tiền thay cho thời gian", { counters: { doors_seen: 1 }, money: -0.03 }, "Nhẹ lòng, không đổi đời")], 0)),
  door(SW, "sow_d_evening", [22, 40], () => true, () => T("Lớp công tác xã hội buổi tối", "Trường đại học mở lớp công tác xã hội hệ buổi tối, hai năm, học phí bằng ba tháng lương. Ai học xong được nhận vào trung tâm bảo trợ của thành phố.", [
    C("Đăng ký, đi học sau giờ làm", { counters: { doors_seen: 1 }, money: -0.25, health: -2, know: 4, gamble: { p: 0.7, win: { ...become(SW), log: "Hai năm sau, bạn cầm bằng và được nhận vào trung tâm bảo trợ." }, lose: { happy: -3, log: "Bạn bỏ dở năm hai. Học phí không lấy lại được." } } }, "Hai năm vất vả, có thể không xong"),
    C("Thôi, để dành tiền", { counters: { doors_seen: 1 }, money: 0.02 }, "Chắc ăn, cánh cửa khép lại")], 0)),
  door(SW, "sow_d_flood", [22, 50], () => true, () => T("Hai trăm hộ trong trường học", "Sau trận lũ, hai trăm hộ sống tạm trong một trường học. Chính quyền tuyển gấp người làm hồ sơ hỗ trợ: ghi tên, hỏi chuyện, tìm người thân thất lạc. Hợp đồng sáu tháng.", [
    C("Nhận hợp đồng sáu tháng", { ...become(SW), counters: { doors_seen: 1 }, health: -2, bw: -3 }, "Việc tạm, có thể thành nghề"),
    C("Mang đồ đến góp rồi về", { counters: { doors_seen: 1, kind: 1 }, money: -0.02 }, "Giúp được một lần, đời vẫn như cũ")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(SW, 1, 1, (c) => T("Ba mươi bảy hồ sơ", "Bạn nhận lại ba mươi bảy hồ sơ gia đình từ người vừa nghỉ việc. Một bìa hồ sơ có chữ \"gấp\" viết tay từ ba tháng trước, chưa ai mở. Quy định là mỗi gia đình một lần thăm mỗi tháng; tuần chỉ có năm ngày.", [
    C("Đọc từng hồ sơ, làm đến tối mỗi ngày", { counters: step(c, SW, { sow_bond: 1 }), flags: ["sow_thorough"], health: -3, bw: -4 }, "Không bỏ sót ai, cạn sức sớm"),
    C("Xếp hồ sơ theo mức gấp, chấp nhận chậm vài nhà", { counters: step(c, SW), flags: ["sow_triage"], bw: 2 }, "Giữ sức, có nhà phải chờ"),
    C("Đề nghị trưởng phòng chia bớt hồ sơ", { counters: step(c, SW), gamble: { p: 0.4, win: { flags: ["sow_fair_load"], log: "Trưởng phòng chia lại. Bạn còn hai mươi hai hồ sơ." }, lose: { rel: -2, flags: ["sow_triage"], log: "Trưởng phòng bảo ai cũng thế. Bạn bị xem là người hay kêu." } } }, "Đòi hợp lý, có thể mang tiếng", { tier: "awakened" })], 0), (c) => c.age >= 18),
  beat(SW, 2, 3, (c) => T("Cậu thiếu niên rời mái ấm", `Cậu thiếu niên bạn theo từ năm mười lăm tuổi vừa rời mái ấm, có việc làm và phòng trọ riêng.${f(c, "sow_thorough") ? " Bạn là người duy nhất từng đọc hết hồ sơ của cậu." : ""} Câu chuyện được kể ở hội nghị thành phố. Sở muốn đưa bạn lên làm trưởng nhóm; một tổ chức gây quỹ muốn dùng ảnh cậu cho chiến dịch.`, [
    C("Lên làm trưởng nhóm, cho dùng ảnh", { counters: step(c, SW), income_mult: 1.3, flags: ["sow_supervisor"], happy: -1 }, "Lương cao, ít gặp các gia đình"),
    C("Ở lại thực địa, từ chối cho dùng ảnh", { counters: step(c, SW, { sow_bond: 1 }), flags: ["sow_field"], happy: 3 }, "Giữ người, giữ đồng lương cũ"),
    C("Giúp người từng ở mái ấm lập nhóm hỗ trợ nhau", { counters: step(c, SW, { sow_bond: 1 }), agency: 0.03, bw: -4, gamble: { p: 0.5 + 0.05 * Math.min(3, n(c, "sow_bond")), win: { flags: ["sow_peer_network"], log: "Nhóm có hai mươi thành viên. Họ đón những đứa trẻ vừa rời mái ấm ngay tại cổng." }, lose: { log: "Nhóm họp được ba lần rồi tan. Cậu thiếu niên vẫn giữ liên lạc với bạn." } } }, "Chậm, không ai trả lương cho việc này", { tier: "sovereign" })], 1), (c) => c.age >= 18),
  beat(SW, 3, 4, (c) => T("Đứa trẻ được trả về nhà", `Tám tháng trước, bạn ký đánh giá cho một bé gái bảy tuổi về lại với mẹ. Tuần này bé phải vào viện; giờ bé đã an toàn, đang ở với bà ngoại. Báo chí hỏi ai đã ký. ${f(c, "sow_triage") ? "Hồ sơ ấy nằm trong nhóm bạn xếp là chưa gấp. " : f(c, "sow_thorough") ? "Bạn đã thăm nhà ấy đủ bốn lần và có ghi một dòng lo ngại. " : ""}Mỗi người trong phòng đang gánh hơn bốn mươi hồ sơ.`, [
    C("Đứng ra nhận trách nhiệm trước hội đồng", { counters: step(c, SW, { honest: 2 }), flags: ["sow_owned"], income_mult: 0.85, happy: -5 }, "Mất điểm, giữ được mình"),
    C("Công bố số hồ sơ mỗi người phải gánh", { counters: step(c, SW), flags: ["sow_spoke_out"], agency: 0.02, gamble: { p: 0.45, win: { log: "Báo chuyển sự chú ý sang chuyện thiếu người. Thành phố hứa tuyển thêm mười hai người." }, lose: { income_mult: 0.8, log: "Bạn bị kỷ luật vì phát ngôn khi chưa được phép." } } }, "Chỉ ra lỗi hệ thống, có thể bị kỷ luật", { tier: "sovereign" }),
    C("Sửa ngày trong sổ ghi chép thăm nhà", { counters: step(c, SW, { honest: -2 }), flags: ["sow_forged"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 8], note: "sửa sổ thăm nhà sau khi bé phải vào viện" } }, "Giữ việc, giữ một bí mật"),
    C("Xin nghỉ việc", { counters: step(c, SW), ...leave(SW), happy: -3 }, "Thoát ra, mang câu hỏi theo")], 0), (c) => c.age >= 18),
  beat(SW, 4, 5, (c) => {
    if (f(c, "sow_forged")) return T("Thanh tra lật hồ sơ cũ", "Đoàn thanh tra đối chiếu sổ ghi chép với định vị điện thoại công vụ. Ngày bạn ghi đã thăm nhà bé năm ấy, máy của bạn ở một quận khác. Một đồng nghiệp cũ đã được mời lên làm việc.", [
      C("Khai thật trước khi bị hỏi", { counters: step(c, SW, { honest: 3 }), custom: "apologize", income_mult: 0.6, flags: ["sow_confessed"] }, "Mất chức, còn giữ được nghề"),
      C("Giữ nguyên lời khai cũ", { counters: step(c, SW), gamble: { p: 0.4, win: { happy: -4, log: "Thanh tra kết luận thiếu căn cứ. Bạn mất ngủ cả năm." }, lose: { ...leave(SW), close_doors: ["clean_record"], log: "Bạn bị buộc thôi việc và có tên trong kết luận thanh tra." } } }, "Có thể thoát, có thể mất tất cả"),
      C("Nghỉ việc trước khi có kết luận", { counters: step(c, SW), ...leave(SW), happy: -4 }, "Tránh được phiên họp, không tránh được mình")], 0);
    if (f(c, "sow_spoke_out") || f(c, "sow_peer_network") || f(c, "sow_owned")) return T("Lời mời viết chuẩn nghề", `Bộ đang soạn chuẩn mới cho nghề: mỗi người không quá hai mươi lăm hồ sơ.${f(c, "sow_spoke_out") ? " Con số bạn công bố năm ấy được trích ngay trang đầu." : ""} Họ mời bạn vào tổ soạn thảo. Cùng lúc, một nhà tài trợ đề nghị bạn mở trung tâm riêng.`, [
      C("Vào tổ soạn thảo ở bộ", { counters: step(c, SW), income_mult: 1.3, flags: ["sow_policy"] }, "Đổi luật cho cả nước, xa các gia đình"),
      C("Mở trung tâm riêng bằng tiền tài trợ", { counters: step(c, SW), money: -0.3, income_mult: 1.2, agency: 0.02, flags: ["sow_own_center"] }, "Tự quyết, tự gánh nợ"),
      C("Ở lại, đỡ đầu cho nhân viên mới", { counters: step(c, SW, { sow_bond: 1 }), happy: 4, flags: ["sow_mentor"] }, "Không lên chức, giữ được nghề")], 0);
    return T("Mười năm nghe chuyện buồn", `Bạn nhận ra mình không còn khóc khi nghe một câu chuyện buồn, và cũng ít cười ở nhà. ${f(c, "sow_supervisor") ? "Ghế trưởng nhóm cho bạn nhiều cuộc họp hơn, ít gương mặt hơn." : "Hồ sơ thứ bốn mươi mốt vừa được đặt lên bàn."} Bác sĩ gọi đó là kiệt sức nghề nghiệp.`, [
      C("Nghỉ ba tháng không lương để hồi lại", { counters: step(c, SW), money: -0.25, health: 6, happy: 4 }, "Mất tiền, lấy lại mình"),
      C("Làm tiếp, cố thêm vài năm", { counters: step(c, SW, { sow_load: 2 }), health: -6, happy: -4 }, "Giữ thu nhập, cạn dần"),
      C("Rời nghề, tìm việc nhẹ hơn", { counters: step(c, SW), ...leave(SW), happy: 2 }, "Thở được, bỏ lại những gia đình")], 0);
  }, (c) => c.age >= 18),
  beat(SW, 5, 6, (c) => T("Người lạ ở cổng cơ quan", `Một người ngoài hai mươi tuổi chờ bạn ở cổng cơ quan. Mười lăm năm trước, bạn là người đưa họ từ nhà mẹ sang một gia đình nhận nuôi. ${n(c, "sow_bond") >= 2 ? "Giờ họ cũng đang học công tác xã hội, và muốn nói lời cảm ơn." : "Họ muốn biết vì sao ngày ấy bạn quyết định như thế."}`, [
    C("Mời họ đi ăn, kể những gì được phép kể", { counters: step(c, SW), happy: 4, rel: 3, flags: ["sow_reunion"] }, "Mở lại chuyện cũ, có thể đau"),
    C("Chỉ đưa họ hồ sơ theo đúng thủ tục", { counters: step(c, SW), bw: 2, happy: -1 }, "Giữ khoảng cách nghề, lạnh"),
    C("Mời họ cùng dạy lớp nhân viên mới", { counters: step(c, SW), flags: ["passed_on"], agency: 0.01, bw: -3 }, "Biến chuyện cũ thành bài học, tốn sức", { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SW, "sow_door", [22, 60], 8, (c) => T("Cánh cửa không mở", vary("swd", c.age, [
    "Bạn gõ cửa căn hộ tầng bốn lần thứ ba trong tháng. Bên trong có tiếng tivi, có tiếng trẻ con, nhưng không ai mở.",
    "Người bố đứng chắn ở cửa, nói nếu bạn còn đến thì ông sẽ kiện. Sau lưng ông, hành lang tối om."]), [
    C(`Quay lại cùng ${vn(c) ? "công an phường" : "cảnh sát"}`, { rel: -2, flags: ["sow_police_visit"], gamble: { p: 0.6, win: { log: "Cửa mở. Bọn trẻ ổn, nhà chỉ bị cắt điện vì nợ tiền." }, lose: { log: "Gia đình chuyển nhà trong đêm. Hồ sơ mất dấu." } } }, "Nhanh, gia đình sẽ không tin bạn nữa"),
    C("Ngồi ở cầu thang chờ một tiếng", { bw: -3, counters: { sow_bond: 1 }, gamble: { p: 0.5, win: { log: "Người mẹ đi chợ về, ngập ngừng rồi mời bạn vào uống nước." }, lose: { log: "Không ai về. Bạn ghi vào sổ: chưa gặp được." } } }, "Chậm, có thể mở được lòng người")], 1)),
  daily(SW, "sow_cat", [22, 60], 8, () => T("Cụ ông và con mèo", "Cụ ông tám mươi sáu tuổi sống một mình, ngã hai lần trong tháng. Viện dưỡng lão có chỗ trống, nhưng không nhận con mèo cụ nuôi mười bốn năm. Cụ nói không có nó thì cụ không đi.", [
    C("Thuyết phục cụ gửi mèo cho hàng xóm", { flags: ["sow_elder_moved"], gamble: { p: 0.5, win: { log: "Cụ vào viện. Hàng xóm mang mèo đến thăm mỗi Chủ nhật." }, lose: { happy: -2, log: "Cụ ký giấy vào viện rồi không nói với bạn câu nào nữa." } } }, "Cụ an toàn, có thể mất ý muốn sống"),
    C("Để cụ ở nhà, sắp người ghé thăm mỗi ngày", { bw: -4, flags: ["sow_home_care"], counters: { sow_bond: 1 } }, "Cụ giữ được nhà, bạn gánh thêm việc"),
    C("Đi tìm một viện chịu nhận cả mèo", { bw: -2, counters: { sow_bond: 1 }, gamble: { p: 0.35, win: { log: "Một viện nhỏ ngoại thành nhận cả hai." }, lose: { log: "Gọi mười một nơi, không nơi nào nhận." } } }, "Tốn cả tuần, có thể không ra")], 1)),
  daily(SW, "sow_forms", [22, 60], 8, () => T("Bốn mươi ô cho một lần thăm", "Hệ thống mới bắt điền bốn mươi ô cho mỗi lần thăm nhà. Một lần thăm mất một giờ, điền xong mất hai giờ. Đồng nghiệp chỉ cách chép lại ghi chú cũ cho nhanh.", [
    C("Chép ghi chú cũ cho kịp", { bw: 4, counters: { sow_shortcut: 1, honest: -1 } }, "Đỡ mệt, hồ sơ kém chính xác"),
    C("Điền đủ từng ô, về muộn", { health: -2, rel: -2, counters: { honest: 1 } }, "Chính xác, mất buổi tối ở nhà"),
    C("Gom ý kiến cả phòng gửi lên sở", { agency: 0.01, gamble: { p: 0.4, win: { flags: ["sow_form_cut"], log: "Sở bỏ mười lăm ô thừa." }, lose: { rel: -1, log: "Sở trả lời bằng một mẫu văn bản." } } }, "Có thể đỡ cho cả phòng, mất lòng cấp trên", { tier: "awakened" })], 0)),
  daily(SW, "sow_gift", [22, 60], 9, () => T("Phong bì dưới hộp bánh", "Gia đình bạn giúp giữ được nhà mang đến một hộp bánh. Lúc về, bạn thấy dưới đáy hộp có một phong bì bằng nửa tháng lương của họ.", [
    C("Giữ lại, coi như quà cảm ơn", { money: 0.03, flags: ["sow_kept_gift"], counters: { honest: -1 } }, "Ấm lòng họ, sai quy định"),
    C("Mang phong bì trả lại tận nhà", { bw: -2, counters: { honest: 1, sow_bond: 1 } }, "Đúng luật, có thể làm họ tủi")], 1)),
  daily(SW, "sow_threat", [22, 60], 9, () => T("Tin nhắn lúc hai giờ sáng", "Một người mẹ có con vừa được đưa sang gia đình tạm nuôi nhắn tin cho bạn lúc hai giờ sáng. Tin đầu chửi bới, tin thứ năm nhắc đến địa chỉ nhà bạn.", [
    C("Báo cơ quan và công an", { bw: -3, happy: -2, flags: ["sow_threat_case"] }, "Bảo vệ nhà mình, người mẹ thêm một tội"),
    C("Hẹn gặp chị ấy cùng trưởng phòng", { gamble: { p: 0.5, win: { counters: { sow_bond: 1 }, log: "Chị ấy khóc suốt buổi gặp. Từ đó chị đi học lớp làm cha mẹ đều đặn." }, lose: { bw: -6, log: "Chị ấy không đến. Tin nhắn vẫn tiếp tục." } } }, "Có thể gỡ được nút, có thể nguy hiểm", { tier: "awakened" }),
    C("Đổi số, xin chuyển hồ sơ cho người khác", { happy: 1, counters: { sow_bond: -1 } }, "Yên ổn, gia đình ấy mất người hiểu họ")], 0)),
  daily(SW, "sow_meals", [22, 60], 9, () => T("Bữa chiều bị cắt", "Chương trình bữa ăn chiều cho ba mươi đứa trẻ ở khu trọ bị cắt ngân sách từ tháng sau. Với vài đứa, đó là bữa ăn chắc chắn duy nhất trong ngày.", [
    C("Bỏ tiền túi nuôi chương trình một tháng", { money: -0.06, happy: 2, counters: { kind: 2 } }, "Cứu được một tháng, tháng sau thì chưa biết"),
    C("Đi gõ cửa các quán ăn quanh khu", { agency: 0.02, bw: -4, gamble: { p: 0.55, win: { flags: ["sow_meal_network"], log: "Sáu quán ăn thay phiên nấu. Chương trình chạy thêm hai năm." }, lose: { log: "Hai quán góp được ba tuần rồi thôi." } } }, "Lập mạng lưới mới, tốn sức", { tier: "awakened" }),
    C("Chấp nhận, ghi vào báo cáo", { happy: -3, counters: { sow_load: 1 } }, "Đúng phận sự, ăn ngủ không yên")], 1)),
  daily(SW, "sow_papers", [22, 60], 9, (c) => T("Gia đình không giấy tờ", vn(c)
    ? "Một gia đình từ quê lên ở trọ, chưa đăng ký tạm trú, đứa con chưa đi học vì thiếu giấy. Nếu bạn đưa họ vào hồ sơ, chủ trọ sẽ biết và có thể đuổi họ."
    : "Một gia đình nhập cư không có giấy tờ cần khám bệnh cho con. Quy định bắt bạn ghi đầy đủ danh tính vào hệ thống, và hệ thống chia sẻ dữ liệu với cơ quan di trú.", [
    C("Làm đúng quy định, ghi đủ hồ sơ", { rel: -1, flags: ["sow_by_rule"], counters: { honest: 1 } }, "Đúng luật, gia đình có thể bỏ trốn"),
    C("Giúp ngoài sổ sách", { flags: ["sow_offbook"], counters: { sow_bond: 1 }, gamble: { p: 0.7, win: { log: "Đứa bé được khám. Không ai biết bạn đã giúp." }, lose: { income_mult: 0.9, log: "Một đồng nghiệp báo lên. Bạn bị nhắc nhở bằng văn bản." } } }, "Giúp được ngay, đặt nghề vào rủi ro"),
    C("Nối họ với nhóm luật sư làm miễn phí", { bw: -3, counters: { sow_bond: 1 } }, "Chậm hơn, đúng luật và đỡ rủi ro", { tier: "awakened" })], 2)),
  daily(SW, "sow_interpreter", [22, 60], 9, () => T("Đứa con làm phiên dịch", "Gia đình mới chuyển đến chỉ nói được tiếng mẹ đẻ. Đứa con gái mười hai tuổi xin dịch giúp, kể cả những câu về tiền nợ và bệnh của bố. Phiên dịch viên của sở thì phải chờ hai tuần.", [
    C("Để cô bé dịch cho nhanh", { bw: 2, counters: { sow_shortcut: 1 } }, "Việc chạy nhanh, đứa trẻ gánh chuyện người lớn"),
    C("Chờ phiên dịch viên hai tuần", { flags: ["sow_waited_interpreter"], happy: -1 }, "Đúng cách, gia đình chờ trong khó khăn"),
    C("Học vài trăm câu tiếng của họ", { bw: -5, know: 3, counters: { sow_bond: 2 } }, "Tốn nhiều buổi tối, gần họ hơn hẳn", { tier: "awakened" })], 1)),
  daily(SW, "sow_custody", [24, 60], 9, () => T("Lời khai ở phiên tòa nuôi con", "Bạn được gọi làm chứng trong vụ giành quyền nuôi con. Luật sư của bên có tiền gợi ý: nếu bạn nói nhẹ đi về những lần say rượu, thân chủ của ông sẽ ủng hộ trung tâm một khoản lớn.", [
    C("Khai đúng những gì đã thấy", { bw: -2, flags: ["sow_testified"], counters: { honest: 2 } }, "Thẳng, sẽ có người giận"),
    C("Nói nhẹ đi, nhận khoản ủng hộ cho trung tâm", { income_mult: 1.05, counters: { honest: -2 }, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 8], note: "nói nhẹ lời khai đổi lấy tiền ủng hộ trung tâm" } }, "Trung tâm có tiền, đứa trẻ có thể chịu thiệt")], 0)),
  daily(SW, "sow_hr", [28, 60], 99, () => T("Phòng nhân sự cần người", "Một công ty lớn tuyển người lo phúc lợi nhân viên, lương gấp đôi, không bao giờ phải gõ cửa nhà ai lúc chín giờ tối.", [
    C("Nhận, rời nghề công tác xã hội", { ...leave(SW), money: 0.15, flags: ["ex_social_worker"] }, "Đủ ăn, đủ ngủ, mất những gia đình"),
    C("Ở lại", { happy: -1, counters: { sow_bond: 1 } }, "Nghèo thêm, giữ những người cần bạn")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(SW, "sow_family", [24, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child");
    if (c.kids_alive > 0 && k) return T("Buổi diễn bạn đến muộn", `${N(k)} có buổi diễn văn nghệ ở trường. Bạn đến muộn bốn mươi phút vì một ca khẩn. Tối ấy ${N(k)} hỏi: "${c.sex === "M" ? "Bố" : "Mẹ"} thương mấy đứa trong hồ sơ hơn con à?"`, [
      C("Giữ trọn cuối tuần cho con, tắt máy", { income_mult: 0.95, trust: { npc: k, delta: 0.2 } }, "Con có bạn, đồng nghiệp gánh thay"),
      C("Kể cho con nghe nghề mình làm gì", { gamble: { p: 0.6, win: { trust: { npc: k, delta: 0.25 }, log: `${N(k)} xin đi cùng bạn đến buổi phát quà cuối năm ở mái ấm.` }, lose: { trust: { npc: k, delta: -0.1 }, log: `${N(k)} nghe xong vẫn quay mặt vào tường.` } } }, "Con có thể hiểu, cũng có thể thấy bị so sánh", { tier: "awakened" }),
      C("Hứa sẽ không lỡ buổi nào nữa", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "không lỡ buổi diễn nào của con nữa", years: 2 } }, "Lời hứa khó giữ với nghề này")], 0, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Danh sách chờ", `${N(p)} bắt đầu lẫn, hay đi lạc. Danh sách chờ vào viện dưỡng lão công dài mười tám tháng. Bạn quen người giữ danh sách.`, [
      C("Nhờ người quen cho lên đầu danh sách", { trust: { npc: p, delta: 0.05 }, flags: ["sow_jumped_queue"], counters: { honest: -2 } }, "Người nhà an toàn sớm, gia đình khác chờ thêm"),
      C("Chờ như mọi người, tự chăm ở nhà", { bw: -6, health: -2, trust: { npc: p, delta: 0.2 } }, "Giữ nguyên tắc, kiệt sức"),
      C("Nghỉ không lương ba tháng để chăm", { money: -0.25, trust: { npc: p, delta: 0.25 } }, "Mất tiền, có thời gian bên nhau", { longterm: true })], 1, { npc: p });
  }),
];

/* =====================================================================
 * THẦY BÓI, THẦY PHONG THỦY — tiền tố ftl_
 * Kịch tính nằm ở người khách tuyệt vọng, ở sự thật và điều người ta muốn nghe, ở tiền và lương tâm.
 * Không thẻ nào coi việc xem bói là có thật: "trúng" là trùng hợp, cái giỏi là đọc người.
 * ===================================================================== */
const FT = "fortune_teller";
const craft = (c: FactContext): string => (vn(c) ? "xem tướng, xem tử vi" : "xem bài, xem chiêm tinh");

const FTL_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(FT, "ftl_t_ring", [10, 16], () => true, (c) => T("Chiếc nhẫn tìm thấy", `Bà hàng xóm mất chiếc nhẫn cưới, cả xóm tìm hai ngày. Bạn để ý bà luôn tháo nhẫn mỗi lần ${vn(c) ? "vo gạo" : "rửa bát"}, và chỉ đúng chỗ: dưới cái chậu cạnh bể nước. Từ đó người ta bảo bạn ${vn(c) ? "\"có căn\"" : "có giác quan thứ sáu"}.`, [
    C("Để mọi người tin là mình có phép lạ", { happy: 3, flags: [talentFlag(FT)], counters: { talents_seen: 1 } }, "Được chú ý, bắt đầu một vai diễn"),
    C("Nói thật là mình chỉ để ý kỹ", { know: 2, counters: { talents_seen: 1, honest: 1 } }, "Mất phép màu, giữ sự thật")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FT, "ftl_d_table", [25, 55], () => true, (c) => T("Chiếc bàn của ông thầy già", `Ông thầy ${craft(c)} đầu ngõ đã ngoài tám mươi, muốn nhường lại chiếc bàn, quyển sổ khách và mối quen. Ông dặn: "Người ta đến đây không phải để nghe sự thật. Nhưng đừng lấy của ai quá sức họ."`, [
    C("Nhận bàn, ngồi thay ông", { ...become(FT), counters: { doors_seen: 1 }, money: -0.03, flags: ["ftl_old_rule"] }, "Có sẵn khách, mang theo lời dặn của ông"),
    C("Nhận, nhưng treo biển “chỉ để tham khảo”", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(FT), flags: ["ftl_disclaimer"], log: "Khách vẫn đến. Họ đọc tấm biển rồi vẫn hỏi như cũ." }, lose: { log: "Khách quen của ông chuyển sang thầy khác. Bạn trả lại chiếc bàn." } } }, "Thẳng thắn từ đầu, có thể mất khách"),
    C("Từ chối", { counters: { doors_seen: 1 } }, "Không dính vào, mất một nghề sẵn khách")], 0)),
  door(FT, "ftl_d_stream", [25, 55], () => true, () => T("Kênh xem bài lúc nửa đêm", "Lúc rảnh, bạn mở phát trực tiếp xem bài cho vui. Đến đêm thứ ba mươi đã có ba nghìn người xem. Một người chuyển khoản kèm lời nhắn: \"Xem riêng cho em, em không biết có nên bỏ chồng không.\"", [
    C("Bắt đầu nhận tiền xem riêng", { ...become(FT), counters: { doors_seen: 1 }, money: 0.05 }, "Tiền đến nhanh, người ta đặt cả đời vào bạn"),
    C("Trả lại tiền, chỉ xem cho vui", { counters: { doors_seen: 1, honest: 1 }, happy: 1 }, "Nhẹ lòng, bỏ một nguồn thu")], 0)),
  door(FT, "ftl_d_site", [30, 60], (c) => c.has_degree || f(c, "job_build") || f(c, talentFlag(FT)), () => T("Ngày động thổ", "Một chủ thầu nhờ bạn chọn ngày khởi công và hướng cổng cho dãy nhà xưởng, trả bằng hai tháng lương. Bạn biết chút về xây dựng; ông ấy chỉ cần một người nói thật chắc nịch.", [
    C("Nhận, mở văn phòng phong thủy", { ...become(FT), counters: { doors_seen: 1 }, money: 0.15 }, "Tiền dễ, nghề dựa vào sự chắc nịch"),
    C("Chỉ góp ý kỹ thuật, không bàn phong thủy", { counters: { doors_seen: 1, honest: 1 }, money: 0.03 }, "Thật, ít tiền")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(FT, 1, 1, (c) => T("Tấm ảnh người chồng đi xa", `Một phụ nữ trẻ đặt lên bàn tấm ảnh chồng đang làm việc ở nước ngoài. Tám tháng nay anh không gửi tiền, không gọi về. Chị hỏi: "Năm sau anh ấy có về không?" Tay chị cầm sẵn tờ tiền lễ, nhiều hơn một ngày công.${f(c, "ftl_old_rule") ? " Bạn nhớ lời ông thầy già." : ""}`, [
    C("Nói điều chị muốn nghe: anh ấy sẽ về", { counters: step(c, FT, { ftl_flatter: 1 }), money: 0.02, flags: ["ftl_comfort"] }, "Khách vui, quay lại, bạn quen dần với lời dễ nghe"),
    C("Nói khéo rằng quẻ bảo chị phải tự đứng", { counters: step(c, FT, { ftl_truth: 1 }), gamble: { p: 0.5, win: { log: "Một năm sau chị quay lại, đã mở được hàng may nhỏ, mang cho bạn một túi cam." }, lose: { happy: -2, log: "Chị bỏ về, đi tìm thầy khác." } } }, "Thật hơn, có thể mất khách"),
    C("Trả tiền, chỉ chị chỗ hỗ trợ gia đình người đi xa", { counters: step(c, FT, { ftl_truth: 1 }), money: -0.01, agency: 0.01, flags: ["ftl_referrer"] }, "Không lấy tiền, bước ra khỏi vai thầy", { tier: "awakened" })], 0), (c) => c.age >= 18),
  beat(FT, 2, 3, (c) => T("Lời phán trúng", `Bạn dặn một bà khách "nửa năm tới chồng chị đừng ký giấy lớn" — câu bạn nói với một nửa số khách. Ba tháng sau, đối tác của chồng bà bị bắt. Tiếng đồn lan khắp thành phố. Một doanh nhân muốn thuê bạn làm thầy riêng; một kênh truyền hình muốn bạn nói ${vn(c) ? "tử vi" : "chiêm tinh"} mỗi sáng.`, [
    C("Làm thầy riêng cho doanh nhân", { counters: step(c, FT), income_mult: 1.6, flags: ["ftl_patron"] }, "Tiền lớn, quyết định lớn của người khác nằm trong tay bạn"),
    C("Lên sóng mỗi sáng", { counters: step(c, FT, { ftl_fame: 2 }), income_mult: 1.3, flags: ["ftl_media"] }, "Nổi tiếng, lời nói đi xa không thu lại được"),
    C("Treo biển: “Tôi đọc người, không đọc trời”", { counters: step(c, FT, { ftl_truth: 1 }), agency: 0.03, flags: ["ftl_honest_brand"], gamble: { p: 0.45 + 0.05 * Math.min(3, n(c, "ftl_truth")), win: { income_mult: 1.2, log: "Khách ít hơn, nhưng toàn người quay lại và giới thiệu thêm người." }, lose: { income_mult: 0.8, log: "Một nửa khách bỏ đi tìm thầy chịu nói điều họ muốn nghe." } } }, "Giữ mình, đặt cược thu nhập", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(FT, 3, 4, (c) => T("Quẻ cho người bệnh", `${f(c, "ftl_patron") ? "Vợ của doanh nhân thuê bạn làm thầy riêng đưa ông đến: ông bị ung thư gan." : "Một gia đình đưa người cha bị ung thư gan đến."} Bác sĩ đề nghị hóa trị sáu đợt. Họ hỏi có nên bỏ viện để làm lễ ${vn(c) ? "giải hạn" : "trừ vận xấu"} không, và nói bạn bảo gì họ làm nấy. Khoản tiền lễ họ mang theo bằng nửa năm thu nhập của bạn.`, [
    C("Bảo họ nghe bác sĩ, không nhận lễ", { counters: step(c, FT, { ftl_truth: 2 }), money: -0.02, happy: 2, flags: ["ftl_sent_to_doctor"] }, "Mất khoản lớn, có thể mất cả khách quen"),
    C("Nhận làm lễ, không nói gì về viện", { counters: step(c, FT, { ftl_flatter: 2 }), money: 0.5, flags: ["ftl_ritual_money"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.55, fuse_years: [1, 6], note: "nhận tiền lễ thay cho việc chữa bệnh của người cha" } }, "Tiền lớn, một mạng người đặt trên lời bạn"),
    C("Làm lễ không lấy tiền, buộc họ hứa vẫn đi viện", { counters: step(c, FT, { ftl_truth: 1 }), bw: -3, rel: 2, flags: ["ftl_both_ways"] }, "Giữ niềm tin của họ, dắt họ về phía bác sĩ", { tier: "awakened" })], 0), (c) => c.age >= 18),
  beat(FT, 4, 5, (c) => {
    if (f(c, "ftl_ritual_money")) return T("Lá đơn tố cáo", "Người bệnh mất sau bốn tháng bỏ viện. Con trai ông gửi đơn tố cáo kèm đoạn ghi âm bạn nói \"cứ làm lễ là qua\". Báo địa phương gọi bạn là \"thầy\" trong ngoặc kép.", [
      C("Trả lại tiền và xin lỗi gia đình", { counters: step(c, FT, { ftl_truth: 2 }), custom: "apologize", money: -0.6, income_mult: 0.6 }, "Mất tiền và tên tuổi, gỡ được một phần"),
      C("Thuê luật sư, chối tới cùng", { counters: step(c, FT), money: -0.3, gamble: { p: 0.45, win: { income_mult: 0.8, log: "Hồ sơ đóng lại vì không đủ căn cứ. Khách vắng đi một nửa." }, lose: { income_mult: 0.4, close_doors: ["clean_record"], log: "Bạn bị xử phạt vì lừa đảo, tên lên báo địa phương." } } }, "Có thể thoát, có thể mang án"),
      C("Gỡ biển, bỏ nghề", { counters: step(c, FT), ...leave(FT), happy: -3 }, "Rời đi, câu hỏi còn ở lại")], 0);
    if (f(c, "ftl_patron")) return T("Thương vụ bạn đã gật đầu", "Doanh nhân thuê bạn vừa mất gần hết tài sản trong một thương vụ mà bạn chọn ngày ký. Ông đòi lại toàn bộ thù lao ba năm và nói sẽ cho cả thành phố biết bạn là ai.", [
      C("Trả lại một nửa, chấm dứt hợp đồng", { counters: step(c, FT), money: -0.5, unflags: ["ftl_patron"], flags: ["ftl_paid_back"] }, "Mất tiền, cắt được dây"),
      C("Nói thật: ngày ký chưa bao giờ là lý do", { counters: step(c, FT, { ftl_truth: 2 }), gamble: { p: 0.4, win: { log: "Ông im lặng rất lâu, rồi đứng dậy đi. Không ai nhắc lại chuyện tiền." }, lose: { income_mult: 0.6, log: "Ông tung tin khắp nơi. Khách giảm một nửa." } } }, "Thật với ông, tự tháo vai thầy"),
      C("Gỡ biển, bỏ nghề", { counters: step(c, FT), ...leave(FT), happy: -2 }, "Thoát khỏi ông, mất luôn nghề")], 1);
    return T("Hàng người từ năm giờ sáng", `Mỗi sáng có hơn trăm người xếp hàng trước cửa nhà bạn${f(c, "ftl_media") ? ", nhiều người cầm theo ảnh chụp bạn trên tivi" : ""}. Có người đi xe khách cả đêm. Một nhà đầu tư muốn mở chuỗi phòng xem mang tên bạn và đào tạo hai mươi "đệ tử".`, [
      C("Mở chuỗi, đào tạo đệ tử", { counters: step(c, FT, { ftl_fame: 2 }), income_mult: 1.8, flags: ["ftl_franchise"] }, "Giàu lên, lời bạn đi qua miệng hai mươi người khác"),
      C("Giới hạn mười khách một ngày", { counters: step(c, FT, { ftl_truth: 1 }), income_mult: 0.9, health: 4, happy: 3 }, "Ít tiền, mỗi người được nghe kỹ"),
      C("Đi học tâm lý, chuyển sang làm tư vấn", { counters: step(c, FT, { ftl_truth: 2 }), unflags: [life(FT)], custom: "become:social_worker", money: -0.3, agency: 0.03 }, "Bỏ vai thầy, học lại từ đầu", { tier: "sovereign" })], 1);
  }, (c) => c.age >= 18),
  beat(FT, 5, 6, (c) => T("Người trẻ xin học nghề", `Một người trẻ xin theo học, mang theo chai rượu và một phong bì. Cậu muốn biết "bí quyết". ${n(c, "ftl_truth") >= n(c, "ftl_flatter") ? "Bạn đã nói thật với khách nhiều hơn là nói điều họ muốn nghe, và biết điều đó tốn bao nhiêu." : "Bạn đếm được những lần mình nói điều khách muốn nghe, và số tiền nó mang lại."}`, [
    C("Dạy cách nhìn, cách nghe, và nói thật về nghề", { counters: step(c, FT, { ftl_truth: 1 }), happy: 3, flags: ["passed_on"] }, "Người trẻ có thể bỏ đi, nghề sạch hơn"),
    C("Dạy mánh giữ khách, nhận phong bì", { counters: step(c, FT, { ftl_flatter: 1 }), money: 0.2 }, "Có tiền dưỡng già, mánh cũ nối dài"),
    C("Không nhận học trò, đóng cửa nghỉ", { counters: step(c, FT), ...leave(FT), happy: 2 }, "Thôi nghề, không để lại gì")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(FT, "ftl_match", [25, 75], 8, (c) => T("Xem tuổi cho đôi trẻ", vary("ftm", c.age, vn(c) ? [
    "Bà mẹ chồng tương lai nhờ bạn xem tuổi hai đứa, kèm một phong bì dày. Bà dặn nhỏ: \"Thầy cứ nói là khắc.\"",
    "Hai đứa trẻ yêu nhau năm năm, nhà gái nhờ bạn xem tuổi. Ông bố dặn riêng: \"Thầy nói khắc thì nhà tôi có cớ.\""] : [
    "Bà mẹ chồng tương lai nhờ bạn so lá số chiêm tinh của hai đứa, kèm một phong bì dày. Bà dặn nhỏ: \"Cứ nói là không hợp.\"",
    "Một ông bố nhờ bạn xem bài cho đám cưới của con gái, rồi dặn riêng: \"Cứ nói là không hợp, nhà tôi cần một cái cớ.\""]), [
    C("Nói “không hợp” như họ muốn", { money: 0.06, flags: ["ftl_broke_couple"], counters: { ftl_flatter: 1, honest: -1 } }, "Tiền dày, một đám cưới có thể đổ"),
    C("Nói “hợp”, trả lại phong bì", { rel: -1, counters: { ftl_truth: 1 } }, "Mất lòng khách, giữ lời mình"),
    C("Nói chuyện cưới là của hai đứa, thầy không quyết", { money: 0.01, agency: 0.01, counters: { ftl_truth: 1 } }, "Không ai vừa lòng, không ai bị dắt mũi", { tier: "awakened" })], 2)),
  daily(FT, "ftl_exam", [25, 75], 8, (c) => T("Lá bùa mùa thi", vn(c)
    ? "Mùa thi đại học, phụ huynh xếp hàng xin bùa đỗ cho con. Một bà mẹ hỏi lá bùa giá cao nhất có \"chắc chắn\" hơn không."
    : "Mùa thi tuyển, phụ huynh đặt mua bùa may mắn cho con qua mạng. Một ông bố hỏi gói đắt nhất có \"chắc chắn\" hơn không.", [
    C("Bán gói đắt nhất", { money: 0.05, counters: { ftl_flatter: 1 } }, "Lãi nhiều, đứa trẻ thêm một chỗ dựa giả"),
    C("Bán bùa rẻ, dặn cho con ngủ đủ và ăn sáng", { money: 0.01, counters: { ftl_truth: 1 } }, "Lãi ít, lời dặn có ích thật")], 1)),
  daily(FT, "ftl_lottery", [25, 75], 9, () => T("Con số cho người nợ nần", "Một người đàn ông nợ ba năm lương xin bạn một con số. Anh nói nếu trúng lần này thì trả hết nợ và bỏ hẳn. Ngón tay anh run khi đặt tiền lên bàn.", [
    C("Cho số, lấy tiền như mọi người", { money: 0.02, counters: { ftl_flatter: 1 } }, "Đúng giá, anh ta sẽ quay lại"),
    C("Từ chối, nói thật về những con số", { counters: { ftl_truth: 1 }, gamble: { p: 0.3, win: { log: "Anh ngồi im rất lâu, rồi hỏi bạn có biết chỗ nào giúp người nợ nần không." }, lose: { log: "Anh chửi bạn rồi sang thầy bên kia đường." } } }, "Có thể cứu một người, chắc chắn mất một khách"),
    C("Cho một số, buộc anh hứa chỉ mua một vé", { money: 0.01, flags: ["ftl_one_ticket"] }, "Nửa vời, giữ anh ta trong tầm mắt", { tier: "awakened" })], 0)),
  daily(FT, "ftl_office", [25, 75], 9, () => T("Bể cá ở sảnh công ty", "Một công ty thuê bạn xem phong thủy văn phòng. Bạn để ý lối thoát hiểm bị chặn bởi một chồng thùng hàng, và ổ điện sau quầy lễ tân nóng ran. Giám đốc chỉ hỏi nên đặt bể cá ở đâu để có tiền.", [
    C("Bán gói bể cá và tượng đá giá cao", { money: 0.1, counters: { ftl_flatter: 1 } }, "Lãi lớn, lối thoát vẫn bị chặn"),
    C("Bảo ‘luồng khí’ phải đi qua lối thoát hiểm", { money: 0.04, rel: 2, flags: ["ftl_safety_trick"], counters: { ftl_truth: 1 } }, "Mượn lời thầy để làm việc đúng", { tier: "sovereign" })], 1)),
  daily(FT, "ftl_rival", [25, 75], 9, (c, N) => { const r = role(c, "rival")!; return T("Thầy bên kia đường", `${N(r)} mở bàn xem ngay bên kia đường, lấy rẻ một nửa và nói với khách rằng bạn "chỉ đoán mò".`, [
    C(`Kể cho khách nghe mánh của ${N(r)}`, { counters: { ftl_fame: 1 }, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "bị vạch mánh trước mặt khách" } }, "Giữ khách, bạn cũng có mánh để bị vạch"),
    C(`Mời ${N(r)} ngồi bàn chuyện giá chung`, { gamble: { p: 0.5, win: { money: 0.03, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "thỏa thuận chung giá xem ở đầu phố" }, log: "Hai bàn cùng giá. Khách chia đều, không ai phải nói xấu ai." }, lose: { log: `${N(r)} nhận lời rồi lại hạ giá tuần sau.` } } }, "Hòa hoãn, có thể bị lừa", { tier: "awakened" }),
    C("Mặc kệ", { happy: -1 }, "Yên thân, mất dần khách")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(FT, "ftl_inspect", [25, 75], 9, (c) => T("Đoàn kiểm tra", vn(c)
    ? "Đoàn kiểm tra văn hóa đến nhắc rằng hành nghề bói toán có thu tiền có thể bị xử phạt. Một người trong đoàn ra hiệu có thể \"bỏ qua\" nếu có phong bì."
    : "Thanh tra thuế hỏi về khoản thu từ các buổi xem riêng mà bạn chưa từng khai. Một người trung gian nói có thể \"lo\" cho hồ sơ nhẹ đi.", [
    C("Gửi phong bì cho xong", { money: -0.08, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "gửi phong bì cho đoàn kiểm tra" } }, "Yên chuyện, thêm một người nắm thóp bạn"),
    C("Đăng ký làm dịch vụ tư vấn, khai thuế đủ", { money: -0.12, flags: ["ftl_registered"], counters: { honest: 1 } }, "Tốn tiền, đứng thẳng được"),
    C("Đóng cửa vài tháng chờ yên", { money: -0.1, happy: -2, counters: { ftl_fame: -1 } }, "Không ai nắm thóp, mất khách quen")], 1)),
  daily(FT, "ftl_grief", [25, 75], 9, (c) => T("Người mẹ muốn gặp lại con", `Một người mẹ mất con trai trong tai nạn giao thông năm ngoái. Bà muốn bạn ${vn(c) ? "gọi hồn" : "kết nối với linh hồn"} con để hỏi nó có lạnh không. Bà mang theo chiếc áo khoác của nó, gấp vuông vức.`, [
    C("Làm buổi lễ, nói những lời bà cần nghe", { money: 0.08, happy: -2, counters: { ftl_flatter: 1 } }, "Bà được an ủi đêm nay, bạn lấy tiền trên nỗi đau"),
    C("Ngồi nghe bà kể, không làm lễ, không lấy tiền", { bw: -3, counters: { ftl_truth: 1 }, gamble: { p: 0.6, win: { log: "Bà kể suốt hai tiếng. Lúc về, bà gấp chiếc áo cẩn thận hơn lúc đến." }, lose: { log: "Bà bảo bạn chẳng giúp được gì, rồi đi tìm người khác." } } }, "Không tiền, có thể giúp thật"),
    C("Chỉ bà đến một nhóm cha mẹ mất con", { flags: ["ftl_referrer"], counters: { ftl_truth: 1 } }, "Đúng chỗ hơn, bà có thể thấy bị từ chối")], 1)),
  daily(FT, "ftl_stones", [25, 75], 9, () => T("Vòng đá giá gấp năm mươi", "Một nhóm bán hàng trên mạng mời bạn đứng tên giới thiệu vòng đá \"khai vận\", giá gấp năm mươi giá nhập, kèm giấy kiểm định in sẵn. Hoa hồng mỗi tháng bằng ba tháng thu nhập của bạn.", [
    C("Nhận đứng tên", { money: 0.3, counters: { ftl_fame: 1, ftl_flatter: 2 }, secret: { tag: "FORGED_PAPERS", severity: 0.45, fuse_years: [2, 6], note: "đứng tên bán vòng đá kèm giấy kiểm định giả" } }, "Tiền lớn, tên bạn nằm trên giấy giả"),
    C("Từ chối", { happy: 1, counters: { honest: 1 } }, "Sạch tay, mất một mỏ tiền"),
    C("Từ chối và đăng cảnh báo cho người xem", { agency: 0.01, counters: { ftl_truth: 1 }, gamble: { p: 0.6, win: { counters: { ftl_fame: 1 }, log: "Bài đăng được chia sẻ nhiều. Nhóm kia đổi tên trang." }, lose: { bw: -4, log: "Nhóm kia thuê người vào chửi bạn suốt một tuần." } } }, "Đứng về phía khách, chuốc thù", { tier: "awakened" })], 1)),
  daily(FT, "ftl_secrets", [25, 75], 9, () => T("Sổ chuyện nhà người khác", "Sau ngần ấy năm, bạn biết ai sắp bán nhà, ai nợ ai, ai đang giấu chồng giấu vợ điều gì. Một người chồng trả gấp ba tiền xem chỉ để hỏi vợ ông đã kể gì với bạn.", [
    C("Nói cho ông ta biết", { money: 0.06, flags: ["ftl_leaked"], counters: { ftl_flatter: 1, honest: -1 } }, "Tiền ngay, khách sẽ thôi tin bạn"),
    C("Từ chối, mời ông về", { counters: { honest: 1 }, gamble: { p: 0.7, win: { log: "Ông bỏ về. Tuần sau người vợ đến, mang cho bạn một hộp trà." }, lose: { bw: -3, log: "Ông đứng chửi trước cửa nửa tiếng." } } }, "Giữ chữ tín, có thể chuốc rắc rối")], 1)),
  daily(FT, "ftl_ring", [25, 75], 9, (c) => T("Chiếc nhẫn vàng cảm ơn", vary("ftr", c.age, [
    "Một bà khách quay lại, mừng rỡ: con trai bà đỗ việc, đúng như bạn \"phán\". Bà muốn tặng bạn chiếc nhẫn vàng. Bạn nhớ mình chỉ dặn cậu ấy chịu khó đi phỏng vấn.",
    "Một ông khách khỏi bệnh, tin là nhờ lời bạn dặn đổi hướng giường. Ông mang đến một chiếc nhẫn vàng. Bạn biết ông khỏi vì chịu uống thuốc đủ liều."]), [
    C("Nhận nhẫn, để khách tin là nhờ quẻ", { money: 0.05, counters: { ftl_fame: 1, ftl_flatter: 1 } }, "Có vàng, thêm một người tin vào bạn"),
    C("Từ chối, trả công cho đúng người", { happy: 2, rel: 1, counters: { ftl_truth: 1 } }, "Mất vàng, giữ được mình")], 0)),

  /* ---------- gia đình ---------- */
  cross(FT, "ftl_family", [30, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const k = role(c, "child"); const me = c.sex === "M" ? "Bố" : "Mẹ";
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị trêu ở trường`, `Ở trường, bạn bè gọi ${N(k)} là "con nhà ${vn(c) ? "thầy bói" : "bà đồng"}". Tối nay ${N(k)} hỏi thẳng: "${me} có thật sự nhìn thấy gì không?"`, [
      C("Nói thật: mình đọc người, không đọc trời", { trust: { npc: k, delta: 0.25 }, counters: { ftl_truth: 1 } }, "Con tin bạn hơn, có thể kể lại với cả lớp"),
      C("Nói rằng đó là một khả năng đặc biệt", { trust: { npc: k, delta: -0.1 }, counters: { ftl_flatter: 1 } }, "Giữ hình ảnh, con sẽ tự tìm ra"),
      C("Cho con ngồi xem một buổi", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.2 }, log: `${N(k)} ngồi xem cả buổi rồi bảo: "${me} chỉ nghe kỹ thôi mà."` }, lose: { trust: { npc: k, delta: -0.15 }, log: `${N(k)} thấy một người khóc vì lời bạn, và không hỏi gì thêm.` } } }, "Để con tự thấy, không biết con sẽ thấy gì", { tier: "awakened" })], 0, { npc: k });
    const fa = role(c, "father"); const p = (fa ?? role(c, "mother"))!; const who = fa ? "bố" : "mẹ";
    return T(`Lá số của ${who}`, `${N(p)} dạo này yếu đi, đưa bạn tờ giấy ghi ngày giờ sinh: "Con xem cho ${who} còn được bao lâu."`, [
      C("Nói rằng còn lâu lắm", { happy: -1, trust: { npc: p, delta: 0.1 } }, "Cho yên lòng, bằng một lời không thật"),
      C("Nói thật là không ai xem được chuyện ấy", { trust: { npc: p, delta: 0.15 }, counters: { ftl_truth: 1 } }, "Thật với người thân, có thể làm họ sợ"),
      C(`Đưa ${who} đi khám, cùng nghe bác sĩ nói`, { money: -0.05, bw: -2, trust: { npc: p, delta: 0.25 } }, "Tốn tiền và ngày nghỉ, biết điều có thể biết", { tier: "awakened" })], 2, { npc: p });
  }),
];

/* =====================================================================
 * LÍNH CỨU HỎA — tiền tố fir_
 * ===================================================================== */
const FF = "firefighter";

const FIR_CARDS: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(FF, "fir_t_drill", [8, 13], () => true, () => T("Buổi diễn tập ở trường", "Chuông báo cháy giả reo giữa giờ toán. Cả lớp chen nhau ra cửa chính; bạn nhớ có cầu thang phụ phía sau và dẫn cả dãy bàn mình ra trước. Chú lính cứu hỏa đến kiểm tra cho bạn cầm thử vòi nước.", [
    C("Xin vào đội an toàn của trường", { bw: -1, health: 1, flags: [talentFlag(FF)], counters: { talents_seen: 1 } }, "Thêm việc sau giờ học, mở một con đường"),
    C("Về kể với bố mẹ rồi thôi", { happy: 2, counters: { talents_seen: 1 } }, "Một buổi vui, không hơn")], 0)),
  talent(FF, "fir_t_summer", [12, 16], () => true, () => T("Mùa hè ở trạm cứu hỏa", "Bác hàng xóm làm ở trạm cứu hỏa thị trấn, bảo hè này bạn có thể đến lau xe, cuộn vòi, nghe các chú kể chuyện. Lớp học thêm toán cũng mở đúng mùa hè ấy.", [
    C("Đến trạm mỗi sáng", { health: 2, know: -1, flags: [talentFlag(FF)], counters: { talents_seen: 1 } }, "Khỏe ra, hụt một mùa học thêm"),
    C("Đi học thêm toán", { know: 3, money: -0.02, counters: { talents_seen: 1 } }, "Điểm cao hơn, mùa hè trong phòng kín")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(FF, "fir_d_test", [18, 30], () => true, () => T("Kỳ tuyển lính cứu hỏa", "Đội cứu hỏa thành phố tuyển người. Bài thể lực: vác hai mươi lăm cân lên sáu tầng trong ba phút. Mỗi năm chỉ thi một lần.", [
    C("Tập sáu tháng rồi đi thi", { counters: { doors_seen: 1, exercise: 2 }, money: -0.03, gamble: { p: 0.6, win: { ...become(FF), log: "Bạn lên tới tầng sáu khi đồng hồ còn mười một giây." }, lose: { happy: -3, log: "Bạn hụt hơi ở tầng năm. Phải chờ thêm một năm." } } }, "Tốn nửa năm, cơ hội cao hơn"),
    C("Đi thi luôn tuần sau", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(FF), log: "Bạn qua bài thể lực, lảo đảo nhưng đủ giờ." }, lose: { health: -1, log: "Bạn dừng ở tầng bốn, hai chân run." } } }, "Nhanh, dễ trượt"),
    C("Thôi", { counters: { doors_seen: 1 } }, "Giữ đời yên, bỏ một giấc mơ")], 0)),
  door(FF, "fir_d_market", [18, 30], () => true, () => T("Đêm cháy chợ", "Chợ gần nhà cháy lúc nửa đêm. Bạn cùng mấy người hàng xóm kéo được mười hai bình ga ra khỏi dãy hàng ăn trước khi xe cứu hỏa đến. Đội trưởng hỏi tên bạn, bảo đội đang thiếu người.", [
    C("Nộp hồ sơ vào đội", { ...become(FF), counters: { doors_seen: 1 }, health: -1 }, "Lương vừa, việc liều"),
    C("Nhận lời cảm ơn rồi về", { counters: { doors_seen: 1 }, happy: 3, rel: 2 }, "Một đêm can đảm là đủ")], 0)),
  door(FF, "fir_d_brigade", [18, 30], () => true, (c) => T("Đội chữa cháy của khu phố", `Khu phố của bạn lập đội ${vn(c) ? "phòng cháy dân phòng" : "chữa cháy tình nguyện"}: mười người, một máy bơm cũ, trực bằng điện thoại. Họ cần người trẻ, khỏe và ở nhà buổi tối.`, [
    C("Tham gia, theo hẳn nghề này", { ...become(FF), counters: { doors_seen: 1 }, money: -0.03 }, "Ban đầu gần như không lương, học được nghề"),
    C("Chỉ đăng ký trực cuối tuần", { counters: { doors_seen: 1 }, rel: 2, happy: 1 }, "Giúp được, không đổi đời")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(FF, 1, 1, (c) => T("Lần đầu vào đám cháy", "Cuộc gọi đầu tiên của bạn: bếp một căn hộ tầng ba bốc cháy. Đội trưởng ra lệnh bạn giữ vòi ở chân cầu thang. Qua làn khói, bạn thấy cửa sổ phòng bên vẫn còn sáng đèn.", [
    C("Giữ vị trí, báo qua bộ đàm", { counters: step(c, FF), flags: ["fir_disciplined"], happy: -1 }, "Đúng quy trình, có thể chậm một nhịp"),
    C("Rời vị trí, chạy lên kiểm tra phòng bên", { counters: step(c, FF), flags: ["fir_maverick"], gamble: { p: 0.5, win: { counters: { fir_nerve: 1 }, log: "Phòng có một ông cụ ngủ quên. Bạn dìu ông xuống, rồi bị kỷ luật vì rời vị trí." }, lose: { health: -5, log: "Phòng trống. Bạn bị bỏng nhẹ ở cổ tay và bị ghi kỷ luật." } } }, "Có thể cứu người, phá đội hình")], 0), (c) => c.age >= 18),
  beat(FF, 2, 3, (c) => T("Mười bốn tiếng ở kho hóa chất", `Vụ cháy kho hóa chất ở khu công nghiệp kéo dài mười bốn tiếng. ${f(c, "fir_maverick") ? "Lần này bạn đi đúng đội hình, và là người tìm ra đường vào cho cả đội." : "Bạn là người tìm ra đường vào cho cả đội."} Báo gọi bạn là người hùng. Sở mời bạn sang phòng thẩm duyệt phòng cháy, lương cao hơn, ngồi bàn giấy.`, [
    C("Sang phòng thẩm duyệt", { counters: step(c, FF), income_mult: 1.3, flags: ["fir_inspector"] }, "Lương cao, an toàn, gần những chữ ký"),
    C("Ở lại, xin học cứu nạn chuyên sâu", { counters: step(c, FF, { fir_nerve: 1 }), flags: ["fir_rescue_team"], know: 3, health: -2 }, "Nguy hiểm hơn, giỏi nghề hơn"),
    C("Mở lớp phòng cháy cho các khu nhà trọ", { counters: step(c, FF), agency: 0.03, bw: -4, gamble: { p: 0.55, win: { flags: ["fir_community"], log: "Ba mươi khu trọ lắp chuông báo khói. Năm ấy không khu nào cháy." }, lose: { log: "Chủ trọ bảo tốn tiền. Chỉ năm khu chịu nghe." } } }, "Không ai trả công, có thể cứu nhiều người hơn", { tier: "sovereign" })], 1), (c) => c.age >= 18),
  beat(FF, 3, 4, (c) => { const insp = f(c, "fir_inspector");
    return T("Tòa nhà không có lối thoát", `Một ${vn(c) ? "quán karaoke" : "quán bar"} bốn tầng cháy lúc mười giờ đêm. Lối thoát duy nhất bị khóa bằng xích. Mười một người không ra được. ${insp ? "Biên bản cho quán ấy đủ điều kiện có chữ ký của bạn, ký vội trong buổi chiều cấp trên dặn \"cho qua\"." : "Hồ sơ thẩm duyệt của quán do một đồng nghiệp ký sau khi nhận phong bì; cả phòng đều biết."} Đêm nào bạn cũng nghe lại tiếng còi.`, [
      C("Khai hết với cơ quan điều tra", { counters: step(c, FF, { honest: 2 }), flags: ["fir_testified"], gamble: { p: 0.5, win: { rel: -3, log: "Ba người bị khởi tố. Anh em trong ngành gọi bạn là kẻ phản bội." }, lose: { income_mult: 0.7, log: "Bạn bị điều về một trạm xa. Vụ án vẫn xử như cũ." } } }, "Sự thật ra ánh sáng, mất anh em"),
      C("Im lặng, giữ đơn vị", { counters: step(c, FF, { fir_scars: 2 }), flags: ["fir_silent"], happy: -5, ...(insp ? { secret: { tag: "FORGED_PAPERS" as const, severity: 0.6, fuse_years: [2, 7] as [number, number], note: "ký biên bản thẩm duyệt cho quán bị cháy" } } : {}) }, "Giữ chỗ, giữ cả những đêm mất ngủ"),
      C("Xin rời ngành", { counters: step(c, FF, { fir_scars: 1 }), ...leave(FF), happy: -3 }, "Thoát ra, không thoát được ký ức")], 0); }, (c) => c.age >= 18),
  beat(FF, 4, 5, (c) => {
    if (f(c, "fir_silent")) return T("Ba tiếng ngủ mỗi đêm", `Từ đêm cháy năm ấy, bạn ngủ không quá ba tiếng. Mùi khói ở đâu cũng làm tay bạn run.${c.married ? " Người nhà bảo bạn hay quát vô cớ." : ""} Tuần trước bạn đứng sững trước một đám cháy nhỏ, đồng đội phải kéo bạn ra.`, [
      C("Đi điều trị sang chấn", { counters: step(c, FF), money: -0.1, health: 6, income_mult: 0.9, flags: ["fir_therapy"] }, "Tốn tiền và chỗ đứng, có thể ngủ lại được"),
      C("Uống cho ngủ được, đi làm tiếp", { counters: step(c, FF, { drink: 3, fir_scars: 1 }), health: -8, happy: -4 }, "Giữ việc, gan và nhà trả giá"),
      C("Khai lại với điều tra, rồi rời ngành", { counters: step(c, FF, { honest: 2 }), unflags: [life(FF)], custom: "job_lose|apologize", happy: 2 }, "Nhẹ lòng, mất nghề")], 0);
    if (f(c, "fir_testified") || f(c, "fir_community") || f(c, "fir_rescue_team")) return T("Chỉ huy đội", `${f(c, "fir_testified") ? "Sau vụ án, luật kiểm tra phòng cháy được viết lại; người ta nhớ tên bạn." : f(c, "fir_community") ? "Các khu trọ bạn từng dạy đã ba năm không có vụ cháy nào." : "Đội cứu nạn của bạn được gọi đi khắp vùng."} Sở đề nghị bạn làm chỉ huy đội. Một tập đoàn bất động sản mời bạn làm giám đốc an toàn, lương gấp đôi, kèm lời nhờ "giúp hồ sơ đi nhanh".`, [
      C("Nhận làm chỉ huy đội", { counters: step(c, FF), income_mult: 1.3, flags: ["fir_commander"] }, "Gánh mạng của cả đội, lương nhà nước"),
      C("Sang tập đoàn làm giám đốc an toàn", { counters: step(c, FF), income_mult: 2.0, flags: ["fir_corporate"] }, "Giàu lên, đứng phía bên kia bàn thẩm duyệt"),
      C("Đề xuất luật buộc công khai biên bản phòng cháy", { counters: step(c, FF), agency: 0.03, gamble: { p: 0.45, win: { flags: ["fir_open_inspection"], log: "Thành phố bắt dán biên bản phòng cháy ở cửa mọi quán. Người dân bắt đầu đọc chúng." }, lose: { income_mult: 0.9, log: "Đề xuất bị gác lại. Vài người trong sở bắt đầu tránh mặt bạn." } } }, "Làm luật mới, đụng nhiều lợi ích", { tier: "sovereign" })], 0);
    return T("Cái lưng của người cứu hỏa", "Mười năm vác bình thở, lưng bạn bắt đầu kêu mỗi sáng. Bác sĩ nói thêm năm năm nữa là thoát vị đĩa đệm. Đội vẫn cần người có kinh nghiệm vào đám cháy.", [
      C("Chuyển sang huấn luyện lính mới", { counters: step(c, FF), income_mult: 0.95, health: 4, flags: ["fir_trainer"] }, "Giữ lưng, rời tuyến đầu"),
      C("Ở lại tuyến đầu", { counters: step(c, FF, { fir_nerve: 1 }), health: -6, income_mult: 1.1 }, "Còn được làm nghề, cơ thể trả giá"),
      C("Rời ngành, mở dịch vụ lắp thiết bị báo cháy", { counters: step(c, FF), ...leave(FF), money: -0.3, agency: 0.02 }, "Tự làm chủ, bỏ lại đồng đội")], 0);
  }, (c) => c.age >= 18),
  beat(FF, 5, 6, (c) => T("Người được cứu năm ấy", `Một người đàn ông dắt theo đứa con nhỏ đến tìm bạn. Mười mấy năm trước, bạn là người đưa anh ra khỏi đám cháy. ${f(c, "fir_commander") ? "Trạm giờ do bạn chỉ huy; anh đứng nhìn chiếc xe cứu hỏa rất lâu." : f(c, "fir_corporate") ? "Anh tìm đến văn phòng tập đoàn, không phải trạm, và ngạc nhiên khi thấy bạn mặc com-lê." : f(c, "fir_silent") ? "Bạn suýt không nhận ra anh: những năm ấy bạn nhớ khói nhiều hơn mặt người." : "Anh vẫn nhớ tên bạn, dù bạn đã quên mặt anh."} Hôm nay cũng là ngày bạn có thể nộp đơn nghỉ hưu sớm.`, [
    C("Nghỉ hưu sớm, về dạy ở trường huấn luyện", { counters: step(c, FF), income_mult: 0.8, happy: 4, flags: ["passed_on"] }, "Ít tiền, truyền nghề"),
    C("Ở lại đến tuổi nghỉ", { counters: step(c, FF), health: -3, money: 0.2 }, "Đủ lương hưu, thân thể mỏi"),
    C("Nghỉ hẳn, sống chậm với gia đình", { counters: step(c, FF), ...leave(FF), rel: 4, health: 3 }, "Về với nhà, mất tiếng chuông")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(FF, "fir_small", [19, 60], 7, (c) => T("Không phải cuộc gọi cháy", vary("fsm", c.age, [
    "Một chú chó kẹt dưới gầm cống, chủ của nó gọi đội lần thứ ba trong buổi sáng.",
    "Một tổ ong to bằng cái nồi treo trước cửa tiệm bánh, chủ tiệm gọi đội từ sáu giờ sáng."]), [
    C("Đi ngay, việc nhỏ cũng là việc", { rel: 2, counters: { fir_kind: 1 }, gamble: { p: 0.85, win: { log: "Xong trong hai mươi phút. Chủ nhà mang đến trạm một rổ chuối." }, lose: { happy: -3, log: "Đúng lúc ấy có cuộc gọi cháy; xe phải vòng về muộn bảy phút." } } }, "Được lòng dân, có thể lỡ cuộc gọi lớn"),
    C("Chuyển cho đơn vị khác, giữ xe ở trạm", { rel: -1, flags: ["fir_by_priority"] }, "Sẵn sàng cho đám cháy, mất lòng người gọi")], 0)),
  daily(FF, "fir_sidejob", [19, 60], 7, (c) => T("Ngày nghỉ sau ca trực", vary("fsj", c.age, [
    "Sau ca trực hai mươi bốn giờ, một người quen mời bạn chạy giao hàng vào ngày nghỉ, thêm một phần ba thu nhập.",
    "Ngày nghỉ, người anh họ rủ bạn làm thêm ở công trường, trả theo ngày."]), [
    C("Nhận làm thêm ngày nghỉ", { money: 0.08, health: -3, counters: { fir_tired: 1 } }, "Thêm tiền, vào đám cháy khi đang mệt"),
    C("Ngủ bù, đi tập", { health: 2, counters: { exercise: 1 } }, "Khỏe, túi mỏng")], 1)),
  daily(FF, "fir_prank", [19, 60], 9, (c) => T("Cuộc gọi báo cháy giả", "Tháng này có chín cuộc báo cháy giả từ cùng một số máy. Bạn lần ra đó là một bà cụ sống một mình ở tầng năm, gọi để có người đến.", [
    C("Báo công an để phạt", { rel: -1, bw: 2, flags: ["fir_reported_prank"] }, "Hết gọi giả, bà cụ lại một mình"),
    C(`Ghé thăm bà ngày nghỉ, nhờ ${vn(c) ? "tổ dân phố" : "hàng xóm"} để ý`, { bw: -3, counters: { fir_kind: 1, kind: 1 }, gamble: { p: 0.7, win: { log: `Bà thôi gọi. ${vn(c) ? "Tết nào" : "Cuối năm nào"} bà cũng gửi trạm một hộp mứt.` }, lose: { log: "Bà vẫn gọi, nhưng giờ gọi thẳng số của bạn." } } }, "Tốn ngày nghỉ, có thể giải được gốc")], 1)),
  daily(FF, "fir_mask", [19, 60], 9, () => T("Bình thở quá hạn", "Bốn bình thở của trạm đã quá hạn kiểm định tám tháng. Kinh phí mua mới chưa về. Trạm trưởng bảo cứ dùng tạm, đừng làm to chuyện kẻo ảnh hưởng thi đua.", [
    C("Làm văn bản gửi lên trên", { flags: ["fir_flagged_gear"], counters: { honest: 1 }, gamble: { p: 0.5, win: { log: "Bình mới về sau ba tuần. Trạm trưởng không nói với bạn câu nào suốt một tháng." }, lose: { income_mult: 0.95, log: "Văn bản bị trả về trạm. Bạn mất suất xét thi đua năm ấy." } } }, "Có thể đúng, có thể bị ghét"),
    C("Cả đội góp tiền thuê kiểm định", { money: -0.04, rel: 2, flags: ["fir_team_fund"] }, "Tốn tiền túi, lỗ hổng vẫn còn"),
    C("Dùng tạm như trạm trưởng bảo", { gamble: { p: 0.8, win: { log: "Năm ấy không bình nào hỏng." }, lose: { health: -8, log: "Một bình hết khí giữa đám cháy. Bạn ra kịp, phổi đau cả tháng." } } }, "Yên chuyện, cược phổi của mình")], 0)),
  daily(FF, "fir_hazing", [20, 60], 9, () => T("Lính mới ở trạm", "Lính mới là người nhỏ con nhất trạm, nói giọng vùng khác. Mấy anh em lâu năm bắt cậu rửa xe một mình mỗi đêm, giấu ủng trước giờ tập.", [
    C("Lên tiếng trước cả trạm", { rel: -2, flags: ["fir_stood_up"], counters: { fir_kind: 1 } }, "Đúng việc, mất phe"),
    C("Kèm riêng cho cậu ngoài giờ", { bw: -3, counters: { fir_kind: 1 } }, "Lặng lẽ giúp, chuyện cũ vẫn tiếp diễn"),
    C("Mặc kệ, ai cũng từng qua", { rel: 1, counters: { honest: -1 } }, "Yên với anh em, cậu chịu một mình")], 1)),
  daily(FF, "fir_storm", [19, 60], 8, (c) => T("Không chỉ có lửa", vary("fst", c.age, [
    "Lũ lên trong đêm, đội được điều đi đưa người khỏi các mái nhà. Thuyền chỉ có hai chiếc, hết ca lúc sáu giờ sáng.",
    "Một trận bão quật đổ hàng trăm cây trên phố. Cả đội cưa cây ba ngày; ca của bạn hết từ chiều qua."]), [
    C("Làm đến khi xong việc, không về nhà", { health: -4, rel: -2, counters: { fir_nerve: 1 } }, "Giúp được nhiều người, nhà vắng bạn"),
    C("Đổi ca đúng giờ để về với gia đình", { rel: 2, happy: -1, counters: { fir_nerve: -1 } }, "Giữ nhà, đồng đội gánh thêm")], 0)),
  daily(FF, "fir_viral", [19, 60], 9, () => T("Tấm ảnh bế con chó nhỏ", "Một tấm ảnh bạn bế con chó nhỏ ra khỏi đám cháy được chia sẻ hàng trăm nghìn lần. Một hãng nước tăng lực muốn thuê bạn quay quảng cáo trong bộ đồ chữa cháy.", [
    C("Nhận quay quảng cáo", { money: 0.15, rel: -1, flags: ["fir_ad_deal"], counters: { fir_fame: 1 } }, "Tiền lớn, đồng đội và cấp trên nhíu mày"),
    C("Từ chối, cho quỹ cứu trợ dùng tấm ảnh", { rel: 2, counters: { fir_fame: 1, kind: 1 } }, "Giữ đồng phục sạch, bỏ một khoản tiền")], 1)),
  daily(FF, "fir_knee", [22, 60], 9, () => T("Đầu gối trước kỳ sát hạch", "Đầu gối phải sưng sau lần nhảy xuống từ thang. Hai tuần nữa là kỳ sát hạch thể lực; ai trượt bị chuyển xuống hậu cần.", [
    C("Giấu chấn thương, uống giảm đau đi thi", { flags: ["fir_hid_injury"], gamble: { p: 0.6, win: { health: -2, log: "Bạn qua kỳ sát hạch. Đầu gối kêu mỗi khi trời trở lạnh." }, lose: { health: -7, income_mult: 0.9, log: "Đầu gối khuỵu ở bài chạy. Bạn phải mổ, nghỉ ba tháng." } } }, "Giữ chỗ ở tuyến đầu, cược khớp gối"),
    C("Báo bác sĩ đội, hoãn thi", { income_mult: 0.95, health: 4, counters: { honest: 1 } }, "Giữ khớp, có thể mất tuyến đầu")], 1)),
  daily(FF, "fir_exam", [22, 55], 9, () => T("Đề thi nâng bậc", "Kỳ thi nâng bậc tháng sau quyết định ai được lên tổ trưởng. Một người ở trường huấn luyện bán bộ đề, giá bằng nửa tháng lương; nửa khóa đã mua.", [
    C("Mua bộ đề", { money: -0.04, income_mult: 1.1, secret: { tag: "CHEATED_EXAM", severity: 0.3, fuse_years: [2, 8], note: "mua đề thi nâng bậc ở trường huấn luyện" } }, "Lên bậc chắc, có một bí mật"),
    C("Tự ôn sau ca trực", { bw: -4, counters: { honest: 1 }, gamble: { p: 0.5, win: { income_mult: 1.1, log: "Bạn đỗ, điểm thấp hơn những người mua đề." }, lose: { happy: -3, log: "Bạn trượt vì kém đúng hai điểm." } } }, "Sạch, có thể thua người gian")], 1)),
  daily(FF, "fir_factory", [25, 60], 99, () => T("Ghế trưởng ban an toàn", "Một nhà máy mời bạn làm trưởng ban an toàn, lương gấp rưỡi, giờ hành chính, không bao giờ phải chui vào khói nữa.", [
    C("Nhận, rời đội cứu hỏa", { ...leave(FF), money: 0.15, flags: ["ex_firefighter"] }, "Ngủ đủ giấc, nhớ tiếng chuông"),
    C("Ở lại trạm", { happy: 1, counters: { fir_nerve: 1 } }, "Lương thấp, vẫn là người lao vào")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(FF, "fir_family", [20, 60], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const sp = role(c, "spouse");
    if (c.married && sp) return T("Sau đám tang đồng đội", `Sau đám tang một đồng đội, ${N(sp)} ngồi chờ bạn đến hai giờ sáng rồi nói nhỏ: "Lần sau, người nhận lá cờ ấy có thể là nhà mình."`, [
      C("Hứa chuyển sang hậu cần trong hai năm", { trust: { npc: sp, delta: 0.15 }, promise: { to: sp, what: "rời tuyến đầu trong hai năm", years: 2 } }, "Nhà yên, nghề phải lùi"),
      C("Nói thật đây là nghề mình chọn", { trust: { npc: sp, delta: -0.15 }, counters: { fir_nerve: 1 } }, "Giữ nghề, rạn trong nhà"),
      C("Đưa cả nhà đến ngày mở cửa của trạm", { gamble: { p: 0.6, win: { trust: { npc: sp, delta: 0.2 }, log: `${N(sp)} thử bộ đồ chữa cháy nặng hai mươi cân, và hiểu bạn hơn một chút.` }, lose: { log: `${N(sp)} đi một vòng rồi về sớm.` } } }, "Để người nhà tự thấy, không biết họ sẽ thấy gì", { tier: "awakened" })], 0, { npc: sp });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T("Cuộc gọi sau mỗi bản tin", `Mỗi lần tivi đưa tin cháy, ${N(p)} lại gọi cho bạn, dù vụ cháy cách hai trăm cây số. Tối nay ${N(p)} khóc trong điện thoại, xin bạn đổi nghề.`, [
      C("Hứa gọi về sau mỗi ca trực", { bw: -1, trust: { npc: p, delta: 0.15 }, promise: { to: p, what: "gọi về sau mỗi ca trực", years: 3 } }, "Người nhà yên tâm, thêm một việc phải nhớ"),
      C("Nói thẳng là sẽ không đổi nghề", { happy: 1, trust: { npc: p, delta: -0.1 } }, "Rõ ràng, người nhà vẫn lo"),
      C(`Mời ${N(p)} đến trạm ăn một bữa với đội`, { money: -0.02, trust: { npc: p, delta: 0.2 } }, "Tốn một ngày nghỉ, nỗi sợ có hình dạng")], 2, { npc: p });
  }),
];

/* ---------- xuất gói ---------- */
export const PACK_SERVE_B: Storylet[] = [...ENV_CARDS, ...SOW_CARDS, ...FTL_CARDS, ...FIR_CARDS];
