/**
 * Gói "Phận đi xa" A: LAO ĐỘNG XUẤT KHẨU · NGƯỜI TỊ NẠN · THỢ MỎ · LAO ĐỘNG THỜI VỤ.
 * Cùng hình dạng với gói mẫu singer.ts — đọc kèm docs/content-guide.md.
 *
 * Tiền tố id: xkl_ (lao động xuất khẩu), rfg_ (tị nạn), mnr_ (thợ mỏ), tvu_ (thời vụ).
 * Bộ đếm riêng:
 *   xk_debt  nợ đi đường còn lại · xk_sent  tiền gửi về · xk_lang  tiếng bản xứ
 *   rf_lang  tiếng bản xứ của người tị nạn
 *   mn_risk  số lần đi tắt, làm liều dưới lò · mn_lungs  bụi đã hít · mn_mask  lần giữ khẩu trang
 *   tv_seasons  số mùa đã đi
 */
import type { Storylet, FactContext, Effect } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const LX = "labor_export";
const RF = "refugee";
const MN = "miner";
const SW = "seasonal_worker";

/** Tiền cho người chưa tự lập: dưới 18 tuổi kẹp về ±0.04 thu nhập hộ (người tị nạn có thể là trẻ con). */
const kid = (c: FactContext, x: number): number => (c.age < 18 ? Math.max(-0.04, Math.min(0.04, x)) : x);
/** Rời con đường, kèm một hệ quả khác của host: về quê, hoặc bước sang con đường khác. */
const leaveTo = (path: string, then: string): Effect => ({ ...leave(path), custom: `job_lose|${then}` });
/** Các con đường người lớn: nhịp truyện chỉ chạy khi đã đủ 18. */
const adult = (c: FactContext): boolean => c.age >= 18;

/* =====================================================================
 * LAO ĐỘNG XUẤT KHẨU — 3 cơ hội · 5 nhịp · 10 chuyện thường ngày · 1 gia đình
 * ===================================================================== */
const LABOR: Storylet[] = [
  /* ---------- cơ hội bước vào ---------- */
  door(LX, "xkl_d_broker", [18, 38], (c) => c.poor_country || c.gdp < 20000, (c) => T("Người môi giới về làng",
    `Một người môi giới đến ${c.country === "VN" ? "nhà văn hóa xã" : "hội trường thị trấn"}, phát tờ rơi in hình nhà máy sạch bóng: ba năm làm ở nước ngoài, lương gấp bốn ở nhà. Phí đi bằng hơn một năm thu nhập của cả nhà, có sẵn người cho vay. Chuyến bay gần nhất là tháng sau.`, [
    C("Vay tiền, ký ngay đợt này", { custom: `borrow:1.2|become:${LX}`, counters: { doors_seen: 1, xk_debt: 3 }, flags: ["broker_debt"], rel: -3 }, "Đi ngay, gánh khoản nợ hơn một năm thu nhập"),
    C("Rủ năm người cùng đi, đòi hợp đồng ghi rõ lương", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.45, win: { custom: `borrow:0.7|become:${LX}`, counters: { xk_debt: 2 }, flags: ["group_contract"], log: "Người môi giới bớt phí. Hợp đồng có đủ chữ ký của sáu người." }, lose: { log: "Người môi giới chọn nhóm khác, ít câu hỏi hơn." } } }, "Phí thấp, hợp đồng rõ, có thể mất suất", { tier: "sovereign" }),
    C("Ở lại, làm tiếp việc ở nhà", { counters: { doors_seen: 1 }, happy: -1 }, "Không nợ, không đổi đời")], 2)),

  door(LX, "xkl_d_cousin", [18, 40], (c) => !!role(c, "sibling") || !!role(c, "childhood_friend"), (c, N) => { const p = (role(c, "sibling") ?? role(c, "childhood_friend"))!; return T("Lời rủ từ bên kia biển",
    `${N(p)} đang làm ở một xưởng bên nước ngoài, gọi về bảo xưởng thiếu người, chủ không hỏi giấy tờ. Đi đường chính thức phải chờ một năm. Sang bằng thị thực du lịch rồi ở lại thì tháng sau đã có việc.`, [
    C("Sang bằng thị thực du lịch, rồi ở lại", { custom: `become:${LX}`, counters: { doors_seen: 1 }, flags: ["undocumented"], money: -0.4, trust: { npc: p, delta: 0.15 } }, "Nhanh và rẻ, sống không giấy tờ"),
    C("Nộp hồ sơ chính thức, chờ đến lượt", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { custom: `borrow:0.8|become:${LX}`, counters: { xk_debt: 2 }, log: "Một năm sau, hồ sơ được duyệt. Bạn sang với một hợp đồng thật." }, lose: { log: "Hồ sơ nằm chờ. Chỗ trống ở xưởng đã có người khác." } } }, "Chậm, có giấy tờ, chưa chắc có suất", { tier: "awakened" }),
    C("Cảm ơn, nhưng không đi", { counters: { doors_seen: 1 }, trust: { npc: p, delta: -0.05 } }, "Ở gần nhà, người rủ hơi phật lòng")], 2, { npc: p }); }),

  door(LX, "xkl_d_sign", [20, 40], (c) => c.broke || c.econ_phase === "crisis" || !c.has_job, () => T("Tấm biển tuyển hai trăm người",
    "Đã ba tháng bạn không có việc ổn định. Ở bến xe dựng một tấm biển: tuyển hai trăm người đi làm công trường nước ngoài, không cần tay nghề, bao ăn ở, xuất cảnh trong sáu tuần. Người ngồi bàn ghi danh không trả lời câu nào về tên chủ thầu.", [
    C("Ghi danh, đi công trường", { custom: `borrow:0.8|become:${LX}`, counters: { doors_seen: 1, xk_debt: 2 }, health: -2 }, "Có việc ngay, mang nợ trước khi đi"),
    C("Hỏi cho ra tên chủ thầu và ai giữ hộ chiếu", { counters: { doors_seen: 1 }, know: 2, gamble: { p: 0.5, win: { custom: `borrow:0.8|become:${LX}`, counters: { xk_debt: 2 }, flags: ["knows_rights"], log: "Bạn ghi lại tên chủ thầu và số đường dây nóng của lãnh sự trước khi bay." }, lose: { flags: ["dodged_scam"], log: "Không ai trả lời được. Tháng sau, báo đưa tin công ty ấy ôm tiền cọc biến mất." } } }, "Chậm hơn, ít bị lừa hơn", { tier: "awakened" }),
    C("Chờ thêm, tìm việc gần nhà", { counters: { doors_seen: 1 }, money: -0.05, happy: -2 }, "Không nợ, thêm vài tháng túng")], 2)),

  /* ---------- mạch truyện ---------- */
  beat(LX, 1, 1, (c) => T("Hộ chiếu nằm trong két", f(c, "undocumented")
    ? "Bạn nhập cảnh như một khách du lịch. Chủ nhà trọ, cũng là người giới thiệu việc, đòi giữ hộ chiếu của bạn 'làm tin', vì bạn không có giấy phép lao động. Ca đầu tiên bắt đầu lúc sáu giờ sáng mai."
    : "Bạn xuống máy bay lúc bốn giờ sáng. Người quản lý thu hộ chiếu của cả nhóm 'để làm thẻ cư trú', nói sẽ giữ giúp cho khỏi mất. Ký túc xá cách xưởng bốn mươi phút xe.", [
    C("Nộp hộ chiếu như mọi người", { counters: step(c, LX), flags: ["passport_held"], rel: 2 }, "Yên chuyện, mất giấy tờ trong tay"),
    C("Chụp lại từng trang gửi về nhà, rồi mới nộp", { counters: step(c, LX), flags: ["passport_held", "passport_copy"], bw: -2 }, "Mất công, thêm một lớp phòng thân", { tier: "awakened" }),
    C("Từ chối, tự giữ hộ chiếu của mình", { counters: step(c, LX), agency: 0.02, gamble: { p: 0.5, win: { flags: ["kept_passport"], log: "Người kia nhún vai, trả lại. Hai người khác làm theo bạn." }, lose: { flags: ["kept_passport", "marked_trouble"], income_mult: 0.9, log: "Bạn giữ được hộ chiếu, nhưng bị xếp toàn ca đêm, ít giờ tăng ca." } } }, "Giữ quyền của mình, có thể bị trù", { tier: "sovereign" })], 0), adult),

  beat(LX, 2, 3, (c) => { const debt = c.counters.xk_debt ?? 0; return T("Đơn hàng mùa cao điểm",
    `Năm thứ hai. ${debt >= 3 ? "Khoản nợ đi đường mới trả được một nửa." : debt > 0 ? "Khoản nợ đi đường chỉ còn một ít." : "Bạn không nợ ai, chỉ có cả nhà chờ tiền."} Xưởng nhận đơn hàng lớn: ai nhận ca mười hai tiếng cả tuần được trả gấp rưỡi. Tổ trưởng người bản xứ cũng đang cần một người biết tiếng để phiên dịch cho cả tổ.`, [
    C("Nhận ca dài, gửi hết về nhà", { counters: step(c, LX, { xk_sent: 2, xk_debt: -2 }), money: 0.5, health: -8, bw: -4 }, "Trả nợ nhanh, cạn sức"),
    C("Học tiếng ban đêm, xin làm phiên dịch tổ", { counters: step(c, LX, { xk_lang: 2 }), know: 6, income_mult: 1.2, money: 0.1, flags: ["speaks_local"] }, "Chậm tiền lúc đầu, lên được một bậc", { longterm: true }),
    C("Nhận thêm việc ngoài giờ ở chỗ khác", { counters: step(c, LX, { xk_sent: 1, xk_debt: -1 }), money: 0.35, health: -3, flags: ["side_job"] }, "Thêm tiền, phạm điều khoản cư trú")], 0); }, adult),

  beat(LX, 3, 4, (c) => { const held = f(c, "passport_held") && !f(c, "kept_passport"); const owe = (c.counters.xk_debt ?? 0) > 0;
    return T("Ba tháng không lương", `Chủ xưởng báo đơn hàng bị hủy. Ba tháng liền không ai được trả lương${held ? ", và hộ chiếu của cả tổ vẫn nằm trong két văn phòng" : ""}. ${f(c, "side_job") ? "Có người biết bạn làm thêm bên ngoài, dọa báo cơ quan xuất nhập cảnh. " : ""}Ở nhà, ${owe ? "chủ nợ bắt đầu gọi cho bố mẹ bạn." : "cả nhà đang chờ tiền tháng này."}`, [
    C("Chờ, tin lời chủ xưởng", { counters: step(c, LX), gamble: { p: 0.5, win: { money: 0.3, log: "Tháng thứ tư, lương về đủ cả ba tháng." }, lose: { money: -0.2, happy: -5, log: "Chủ xưởng biến mất. Két văn phòng trống trơn." } } }, "Không mất gì thêm, nếu chủ giữ lời"),
    C("Bỏ trốn, làm chui chỗ khác", { counters: step(c, LX), flags: ["undocumented", "ran_away"], money: 0.2, bw: -6, close_doors: ["clean_record"] }, "Có tiền lại, sống trong sợ hãi"),
    C("Cùng cả tổ làm đơn gửi cơ quan lao động", { counters: step(c, LX), agency: 0.03, gamble: { p: f(c, "speaks_local") || f(c, "group_contract") || f(c, "knows_rights") ? 0.6 : 0.4, win: { money: 0.4, unflags: ["passport_held"], flags: ["won_wage_claim", "leader"], log: "Sau năm tháng, cơ quan lao động buộc chủ trả lương và trả hộ chiếu. Tên bạn đứng đầu lá đơn." }, lose: { income_mult: 0.8, flags: ["blacklisted"], log: "Chủ xưởng chuyển cả tổ sang nhà máy khác, trừ bạn." } } }, "Đòi được cho cả tổ, hoặc bị gạt ra", { tier: "sovereign" }),
    C("Về nước, chấp nhận trắng tay", { counters: step(c, LX), ...leaveTo(LX, "return_home"), money: -0.2, rel: 5, happy: -4 }, "Về với nhà, khoản nợ vẫn còn đó")], 0); }, adult),

  beat(LX, 4, 5, (c) => {
    if (f(c, "undocumented")) return T("Đợt kiểm tra lúc rạng sáng", `Lực lượng xuất nhập cảnh đi kiểm tra các khu trọ của người làm không giấy tờ. Bạn đã ở đây đủ lâu để ${(c.counters.xk_sent ?? 0) >= 2 ? "gửi về nhà đủ xây một căn nhà" : "thuộc từng con hẻm"}. Một luật sư tình nguyện nói đang có đợt hợp thức hóa cho người sống trên năm năm, nếu dám ra trình diện.`, [
      C("Ra trình diện, xin hợp thức hóa", { counters: step(c, LX), agency: 0.02, gamble: { p: f(c, "local_friend") || f(c, "speaks_local") ? 0.55 : 0.4, win: { unflags: ["undocumented"], flags: ["legalized"], income_mult: 1.3, log: "Bạn nhận tấm thẻ cư trú đầu tiên có tên mình." }, lose: { ...leaveTo(LX, "return_home"), happy: -6, log: "Hồ sơ bị bác. Bạn bị trục xuất, cấm quay lại mười năm." } } }, "Được giấy tờ, hoặc bị trục xuất", { tier: "sovereign" }),
      C("Chuyển sang vùng khác, làm tiếp", { counters: step(c, LX), money: 0.3, bw: -8, health: -4 }, "Vẫn có tiền, không bao giờ yên"),
      C("Tự mua vé về trước khi bị bắt", { counters: step(c, LX), ...leaveTo(LX, "return_home"), money: 0.2, rel: 6 }, "Về có tiền, khó lòng quay lại")], 1);
    const strong = f(c, "speaks_local") || f(c, "won_wage_claim") || (c.counters.xk_sent ?? 0) >= 3;
    return T(strong ? "Thẻ cư trú dài hạn" : "Hợp đồng cuối cùng", strong
      ? `Chủ xưởng muốn giữ bạn lại làm thợ chính, bảo lãnh thẻ cư trú dài hạn${c.married ? " và cho đón gia đình sang" : ""}. Ở quê, người ta hỏi bạn có về mở xưởng không, vì bạn biết làm những thứ cả vùng chưa ai làm.`
      : `Hợp đồng sắp hết và không được gia hạn. Tiền gửi về ${(c.counters.xk_debt ?? 0) > 0 ? "vẫn chưa trả hết nợ đi đường" : "đã trả xong nợ, còn dư một ít"}. Một công ty môi giới mời ký thêm một hợp đồng ở nước khác, phí đi tính lại từ đầu.`, [
      C(strong ? (c.married ? "Ở lại, đón gia đình sang" : "Ở lại, xin thường trú") : "Ký tiếp hợp đồng ở nước khác", strong
        ? { counters: step(c, LX), income_mult: 1.3, custom: "borrow:0.5", flags: ["settled_abroad"], close_doors: ["return_home"], rel: -2 }
        : { counters: step(c, LX, { xk_debt: 2 }), custom: "borrow:0.8", income_mult: 1.1, health: -4, rel: -4 }, strong ? "Đời mới bên này, quê thành nơi để thăm" : "Thêm tiền, thêm nợ, thêm năm xa nhà"),
      C("Về nước, mở xưởng bằng tay nghề học được", { counters: step(c, LX), ...leaveTo(LX, "become:returnee"), money: strong ? -0.3 : -0.5 }, "Làm chủ ở nhà, đặt cược vốn liếng"),
      C("Về nước, làm thuê như trước", { counters: step(c, LX), ...leaveTo(LX, "return_home"), happy: 3, rel: 5 }, "Bình yên, thu nhập về như cũ")], 0);
  }, adult),

  beat(LX, 5, 6, (c) => T("Bọn trẻ hỏi chuyện đi xa", `${f(c, "settled_abroad") || f(c, "legalized") ? "Lần về thăm quê này" : "Dạo này"}, bọn trẻ trong ${c.country === "VN" ? "xóm" : "khu phố"} cũ kéo đến hỏi chuyện đi nước ngoài. Người môi giới năm xưa, giờ mở công ty lớn hơn, mời bạn làm 'đại diện': mỗi người bạn giới thiệu được trả hoa hồng. ${f(c, "told_truth") ? "Bọn trẻ còn nhớ những gì bạn từng kể thật." : "Bọn trẻ chỉ biết những bức ảnh bạn đăng."}`, [
    C("Nhận làm đại diện, lấy hoa hồng", { counters: step(c, LX), money: 0.4, flags: ["recruiter"] }, "Tiền dễ, tên bạn gắn với nợ của người khác"),
    C("Kể thật hết, lập nhóm tư vấn miễn phí", { counters: step(c, LX), rel: 6, money: -0.05, agency: 0.03, flags: ["migrant_guide", "leader"] }, "Không lời, bớt người bị lừa", { tier: "sovereign" }),
    C("Không nói gì, để mỗi người tự chọn", { counters: step(c, LX), happy: -1 }, "Nhẹ đầu, không thay đổi được gì")], 2), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(LX, "xkl_remit", [18, 60], 8, (c) => T("Ngày gửi tiền về", vary("xkr", c.age, [
    "Ngày lĩnh lương. Bạn xếp hàng ở quầy chuyển tiền cùng hàng trăm người cùng cảnh, ai cũng cầm một mẩu giấy ghi số tài khoản ở quê.",
    "Nhà nhắn: tháng này cần thêm để đóng học cho đứa em. Lương bạn vừa về, chưa kịp trừ tiền ăn.",
  ]), [
    C("Gửi gần hết, chỉ giữ tiền ăn", { money: -0.1, rel: 3, happy: -1, counters: { xk_sent: 1 } }, "Nhà vững, bạn không có đồng dự phòng"),
    C("Gửi một nửa, mở sổ tiết kiệm riêng", { money: 0.05, rel: -2, counters: { save: 1 } }, "Có vốn cho mình, nhà kêu thiếu"),
    C("Gửi qua người quen cho rẻ phí", { gamble: { p: 0.85, win: { money: 0.02, counters: { xk_sent: 1 }, log: "Tiền về đủ, nhanh hơn ngân hàng một ngày." }, lose: { money: -0.12, log: "Người nhận chuyển hộ biến mất cùng ba tháng lương của cả nhóm." } } }, "Rẻ hơn, không có gì bảo đảm")], 0)),

  daily(LX, "xkl_dorm", [18, 60], 8, () => T("Mười hai người một phòng", "Phòng ký túc mười hai giường tầng, một bếp điện, một nhà vệ sinh. Người giường dưới về sau ca đêm, nấu ăn lúc hai giờ sáng, cả phòng thức theo.", [
    C("Đề nghị cả phòng lập lịch nấu, lịch ngủ", { rel: 3, bw: -2, flags: ["room_rules"] }, "Mất công dàn xếp, cả phòng dễ thở hơn", { tier: "sovereign" }),
    C("Thuê chung phòng ngoài với hai người", { money: -0.08, health: 2, happy: 3, counters: { xk_sent: -1 } }, "Ngủ được, gửi về ít đi"),
    C("Mua nút tai, chịu đựng", { bw: -3, health: -1 }, "Không tốn tiền, không ngủ đủ")], 2)),

  daily(LX, "xkl_payslip", [18, 60], 9, () => T("Phiếu lương thêm ba dòng", "Phiếu lương tháng này có thêm ba dòng mới: phí ký túc, phí đưa đón, phí đồng phục. Cộng lại gần một phần tư lương. Hợp đồng bạn ký ở nhà không có dòng nào như vậy.", [
    C("Ký nhận, không hỏi", { money: -0.08 }, "Yên ổn, mất một phần tư lương"),
    C("Lên văn phòng hỏi một mình", { gamble: { p: 0.35, win: { money: 0.05, log: "Họ bỏ phí đồng phục, chỉ cho riêng bạn." }, lose: { income_mult: 0.95, flags: ["marked_trouble"], log: "Tuần sau bạn bị bớt giờ tăng ca." } } }, "Có thể được việc, có thể bị để ý"),
    C("Gom phiếu lương cả tổ, so với hợp đồng", { agency: 0.02, bw: -3, gamble: { p: 0.55, win: { money: 0.1, flags: ["leader"], log: "Văn phòng rút lại hai trong ba khoản phí cho cả tổ." }, lose: { flags: ["blacklisted"], log: "Chủ xưởng gọi từng người lên hỏi ai cầm đầu." } } }, "Đòi cho cả tổ, bạn đứng mũi chịu sào", { tier: "sovereign" })], 0), (c) => !f(c, "undocumented")),

  daily(LX, "xkl_hand", [18, 55], 99, () => T("Hai ngón tay bị máy ép", "Một chiếc máy ép làm gãy hai ngón tay của bạn. Quản lý đưa bạn đến phòng khám tư, trả tiền, rồi dặn: đừng khai báo bảo hiểm, nếu không hợp đồng sẽ không được gia hạn.", [
    C("Im lặng, nghỉ ba ngày rồi làm tiếp", { health: -6, flags: ["hid_injury"], counters: { xk_sent: 1 } }, "Giữ hợp đồng, tay không lành hẳn"),
    C("Khai báo tai nạn lao động", { health: 3, gamble: { p: 0.5, win: { money: 0.3, log: "Bảo hiểm trả tiền chữa và tiền những ngày nghỉ." }, lose: { money: 0.15, flags: ["no_renewal"], log: "Bạn được bồi thường, rồi được báo hợp đồng sẽ không gia hạn." } } }, "Có quyền lợi, có thể mất việc")], 0), (c) => !f(c, "undocumented")),

  daily(LX, "xkl_house", [20, 60], 99, () => T("Tầng ba cho bằng hàng xóm", "Ảnh từ nhà gửi sang: căn nhà xây bằng tiền bạn gửi đã lên tầng hai. Người nhà muốn xây thêm tầng ba, 'cho bằng nhà có con đi nước ngoài bên cạnh'. Bạn vẫn ngủ giường tầng, chưa có đồng nào cho riêng mình.", [
    C("Gửi thêm, xây cho bằng người ta", { money: -0.3, rel: 4, happy: -2, counters: { xk_sent: 1 } }, "Nhà nở mày, bạn thêm hai năm xa nhà"),
    C("Bảo dừng lại, giữ tiền làm vốn", { money: 0.2, rel: -4, flags: ["own_savings"] }, "Có vốn, mất lòng người nhà"),
    C("Đề nghị làm tầng một thành cửa hàng", { money: -0.15, rel: 2, income_mult: 1.05, flags: ["family_shop"] }, "Tốn ít hơn, nhà có thêm nguồn thu", { tier: "awakened" })], 0), (c) => c.parents_alive > 0 || c.married),

  daily(LX, "xkl_photo", [18, 50], 8, (c) => T("Bức ảnh trước tòa tháp", vary("xkp", c.age, [
    "Ngày nghỉ hiếm hoi, bạn mặc áo đẹp nhất, chụp ảnh trước tòa nhà cao nhất thành phố. Ở quê, ảnh được chia sẻ hàng trăm lần. Ba đứa em họ nhắn hỏi cách đi.",
    "Bạn đăng ảnh bữa tối thịt nướng ở nhà một người quen. Không ai thấy chiếc giường tầng bạn ngủ tối hôm ấy. Một người cùng làng nhắn: 'Tao cũng muốn sang'.",
  ]), [
    C("Kể thật cả phòng ở, giờ làm, khoản nợ", { rel: -1, flags: ["told_truth"], counters: { honest: 1 } }, "Mất hình ảnh, bớt người đi mù quáng"),
    C("Để yên cho người nhà tự hào", { happy: 2, rel: 2 }, "Nhà vui, có người sẽ đi theo bức ảnh")], 1)),

  daily(LX, "xkl_local", [18, 60], 99, () => T("Bà cụ ở sạp rau", "Bà cụ bán rau đầu phố nhận ra bạn sau bốn tháng mua hành mỗi sáng. Hôm nay bà dúi thêm một bó rau thơm, nói chậm từng chữ để bạn hiểu, rồi mời Chủ nhật đến nhà ăn cơm.", [
    C("Đến, mang theo một món quê nhà", { happy: 4, know: 2, bw: -1, counters: { xk_lang: 1 }, flags: ["local_friend"] }, "Mất ngày nghỉ, có một người quen bản xứ"),
    C("Cảm ơn, hẹn dịp khác", { bw: 2 }, "Giữ ngày nghỉ để ngủ")], 1)),

  daily(LX, "xkl_fever", [18, 60], 99, (c) => T("Cơn sốt không có thẻ bảo hiểm", `Bạn sốt ba ngày liền. ${f(c, "undocumented") ? "Bạn không có giấy tờ, đến bệnh viện là sợ bị hỏi." : "Thẻ bảo hiểm do công ty giữ, phòng khám đòi tiền mặt trước."} Nghỉ một ngày là mất tiền chuyên cần cả tháng.`, [
    C("Uống thuốc mua ngoài, đi làm tiếp", { health: -6, money: 0.02, counters: { xk_sent: 1 } }, "Giữ tiền chuyên cần, bệnh kéo dài"),
    C("Trả tiền phòng khám tư", { money: -0.08, health: 4 }, "Khỏi nhanh, mất nửa tháng lương"),
    C("Nhờ hội đồng hương góp tiền đi khám", { health: 3, rel: 2, money: -0.02, flags: ["owes_community"] }, "Có người đỡ, nợ một ân tình", { tier: "awakened" })], 0)),

  daily(LX, "xkl_switch", [19, 55], 99, () => T("Ông chủ bên kia đường", "Xưởng bên kia đường trả cao hơn ba mươi phần trăm và cho nghỉ Chủ nhật. Nhưng thị thực của bạn gắn với chủ hiện tại: đổi chủ mà không có giấy đồng ý là mất tư cách cư trú.", [
    C("Xin chủ cũ ký giấy cho chuyển", { gamble: { p: 0.3, win: { income_mult: 1.3, flags: ["changed_employer"], log: "Chủ cũ ký, sau khi bạn hứa làm nốt đơn hàng." }, lose: { income_mult: 0.95, flags: ["marked_trouble"], log: "Chủ cũ từ chối, và bắt đầu để ý bạn." } } }, "Đúng luật, dễ bị để ý"),
    C("Chuyển luôn, tính giấy tờ sau", { income_mult: 1.3, bw: -5, flags: ["undocumented"] }, "Lương cao, thành người không giấy tờ"),
    C("Ở lại chỗ cũ", { happy: -1, counters: { xk_loyal: 1 } }, "Yên ổn, lương thấp")], 2), (c) => !f(c, "undocumented")),

  daily(LX, "xkl_lender", [18, 50], 99, (c, N) => { const cr = role(c, "creditor")!; const owe = (c.counters.xk_debt ?? 0) > 0; return T("Chủ nợ ngồi ở nhà bố mẹ",
    `${N(cr)} đến nhà bố mẹ bạn lần thứ hai trong tháng, ngồi uống nước rất lâu. Khoản vay đi đường ${owe ? "còn hơn một nửa" : "còn ít, nhưng lãi đã cộng dồn"}. Bố mẹ gọi cho bạn, giọng nhỏ.`, [
    C("Gửi dồn ba tháng lương trả bớt", { money: -0.25, health: -2, counters: { xk_debt: -1 }, trust: { npc: cr, delta: 0.1 } }, "Bớt nợ, bạn cạn sạch"),
    C("Gọi thẳng cho chủ nợ, xin giãn lịch trả", { gamble: { p: 0.5, win: { custom: "restructure", trust: { npc: cr, delta: 0.1 }, log: `${N(cr)} đồng ý giãn thêm một năm, lãi giữ nguyên.` }, lose: { memory: { npc: cr, tag: "HUMILIATED_ME", weight: -0.2, note: "bị gọi điện mặc cả nợ đi nước ngoài" }, log: `${N(cr)} không nghe máy lần nào nữa.` } } }, "Thở được, có thể mất lòng chủ nợ", { tier: "awakened" }),
    C("Bảo bố mẹ cứ khất thêm", { rel: -3, memory: { npc: cr, tag: "CHEATED_ME", weight: -0.2, note: "khất nợ tiền đi nước ngoài" } }, "Giữ tiền, để bố mẹ chịu trận")], 0, { npc: cr }); }, (c) => !!role(c, "creditor")),

  /* ---------- gia đình ---------- */
  cross(LX, "xkl_family", [20, 55], (c) => (c.kids_alive > 0 && !!role(c, "child")) || (c.parents_alive > 0 && (!!role(c, "mother") || !!role(c, "father"))), (c, N) => {
    const k = c.kids_alive > 0 ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} gọi bà là mẹ`, `Gọi video, ${N(k)} chạy đi chỗ khác. Bà nói con quen gọi bà là mẹ rồi. Lần cuối bạn ở nhà là ba năm trước, và hợp đồng còn hai năm nữa.`, [
      C("Về hẳn để ở bên con", { ...leaveTo(LX, "return_home"), money: -0.3, trust: { npc: k, delta: 0.25 } }, "Có con, mất thu nhập"),
      C("Gửi thêm tiền, hứa hai năm nữa về", { money: -0.1, promise: { to: k, what: "về nhà ở với con sau hai năm", years: 2 } }, "Giữ việc, nợ con một lời hứa"),
      ...(f(c, "undocumented") ? [] : [C("Làm giấy tờ đón con sang ở cùng", { custom: "borrow:0.6", flags: ["family_abroad"], trust: { npc: k, delta: 0.15 } }, "Ở cạnh con, gánh thêm nợ, con xa quê", { tier: "awakened" })])], 1, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(`${N(p)} hỏi bao giờ về`, `${N(p)} khoe với hàng xóm từng đồng bạn gửi về, nhưng cuộc gọi nào cũng kết thúc bằng một câu: bao giờ con về. Tháng sau là ngày mừng thọ.`, [
      C("Hứa về dự mừng thọ", { promise: { to: p, what: "về dự ngày mừng thọ", years: 1, cost_money: 0.15 }, trust: { npc: p, delta: 0.1 } }, "Mất một tháng lương và tiền vé"),
      C("Gửi tiền làm cỗ, ở lại làm", { money: -0.1, trust: { npc: p, delta: -0.1 } }, "Giữ việc, ghế của bạn để trống"),
      C("Đón bố mẹ sang thăm một tháng", { money: -0.25, trust: { npc: p, delta: 0.25 }, flags: ["parents_visited"] }, "Tốn kém, bố mẹ thấy tận mắt đời bạn", { tier: "awakened" })], 1, { npc: p });
  }),
];

/* =====================================================================
 * NGƯỜI TỊ NẠN — 4 cơ hội (biến cố) · 5 nhịp · 10 chuyện thường ngày · 1 gia đình
 * Đi được từ 1 đến 70 tuổi: thẻ nào có thể gặp trẻ con thì rẽ văn bản theo tuổi,
 * tiền dưới 18 tuổi qua kid(), không dùng trust dưới 12 tuổi.
 * ===================================================================== */
const REFUGEE: Storylet[] = [
  /* ---------- biến cố đẩy vào con đường ---------- */
  door(RF, "rfg_d_war", [18, 70], (c) => c.poor_country || c.econ_phase === "crisis", () => T("Chuyến xe cuối về phía biên giới",
    "Giao tranh đã đến thị trấn bên cạnh. Đêm nay chuyến xe khách cuối cùng chạy về phía biên giới, mỗi người một túi. Hàng xóm khóa cửa, mang chìa khóa theo như thể tuần sau sẽ về.", [
    C("Đi ngay với cả nhà", { ...become(RF), counters: { doors_seen: 1 }, money: -0.3, happy: -6, flags: ["fled_with_family"] }, "Mất nhà, giữ được nhau"),
    C("Ở lại giữ nhà, chờ xem", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { happy: -3, flags: ["stayed_through"], log: "Giao tranh dừng cách nhà hai cây số. Thị trấn sống tiếp, nghèo hơn." }, lose: { ...become(RF), money: -0.8, health: -6, log: "Một tuần sau bạn vẫn phải đi, lần này chỉ còn quần áo trên người." } } }, "Có thể giữ được nhà, hoặc mất cả"),
    C("Trả tiền người dẫn đường đi xa hơn", { ...become(RF), counters: { doors_seen: 1 }, money: -1.0, flags: ["paid_passage"], secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [3, 12], note: "giấy thông hành mua dọc đường chạy loạn" } }, "Đến nơi yên hơn, mang giấy tờ không thật")], 0)),

  door(RF, "rfg_d_flood", [1, 70], (c) => c.poor_country, (c) => c.age < 16
    ? T("Nước không rút nữa", "Lũ ngập đến bậu cửa sổ lần thứ ba trong năm. Cả làng lên những chiếc xe tải đi về phía trại tạm cư. Mẹ bế em, bố khoác hai bao tải. Bạn ngồi ở cuối thùng xe, nhìn ra phía sau.", [
      C("Thức suốt đường, nhìn làng mình xa dần", { ...become(RF), counters: { doors_seen: 1 }, happy: -2, flags: ["remembers_home"] }, "Đau hơn, nhưng nhớ được đường về"),
      C("Ngủ trong lòng mẹ đến khi tới nơi", { ...become(RF), counters: { doors_seen: 1 }, health: 1, happy: 1 }, "Đỡ sợ, quê nhà nhạt dần trong trí nhớ")], 1)
    : T("Nước không rút nữa", "Mùa lũ thứ ba liên tiếp. Lần này nước không rút: ruộng thành đầm, giếng nhiễm mặn, trường học thành chỗ trú. Người ta nói ở trại bên kia biên giới có nước sạch và lớp học cho trẻ con.", [
      C("Đi theo đoàn người sang trại", { ...become(RF), counters: { doors_seen: 1 }, money: kid(c, -0.4), happy: -3 }, "Có nước sạch, thành người không quê"),
      C("Ở lại đắp đê cùng cả làng", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { rel: 5, flags: ["village_dike"], log: "Con đê cả làng đắp giữ được nửa cánh đồng. Mùa sau vẫn có lúa." }, lose: { ...become(RF), money: kid(c, -0.6), health: -5, log: "Đê vỡ vào tháng sau. Cả làng đi, bạn đi cuối cùng." } } }, "Giữ được làng, hoặc đi muộn mà mất nhiều hơn", { tier: "sovereign" }),
      C("Lên thành phố trong nước tìm việc", { counters: { doors_seen: 1 }, money: kid(c, -0.15), happy: -2, flags: ["left_home"] }, "Không vào trại, tự lo một mình")], 0)),

  door(RF, "rfg_d_list", [18, 70], (c) => c.poor_country || c.econ_phase === "crisis", () => T("Tên bạn trong danh sách",
    "Một người bạn cũ báo tin: tên bạn có trong danh sách những người bị 'mời lên làm việc'. Vì niềm tin của gia đình bạn, hay vì một lần bạn lên tiếng ở cuộc họp khu phố, không ai nói rõ. Hai người trong danh sách đã không về nhà.", [
    C("Đi ngay đêm nay, không kịp chào ai", { ...become(RF), counters: { doors_seen: 1 }, money: -0.5, rel: -6, close_doors: ["return_home"] }, "An toàn, có thể không bao giờ về được"),
    C("Ở lại, im lặng, chờ qua đợt này", { counters: { doors_seen: 1 }, bw: -6, gamble: { p: 0.6, win: { happy: -6, flags: ["went_silent"], log: "Danh sách được gỡ xuống sau ba tháng. Bạn thôi đến những nơi đông người." }, lose: { ...become(RF), money: -0.9, health: -5, log: "Họ đến tìm. Bạn đi bằng cửa sau, không mang theo được gì." } } }, "Giữ nhà, sống trong sợ"),
    C("Nhờ luật sư lập hồ sơ làm bằng rồi mới đi", { counters: { doors_seen: 1 }, money: -0.3, gamble: { p: 0.5, win: { ...become(RF), flags: ["documented_case"], log: "Bạn qua biên giới với tập hồ sơ có chữ ký luật sư. Nó sẽ cần đến sau này." }, lose: { bw: -4, flags: ["went_silent"], log: "Luật sư từ chối nhận vụ. Bạn ở lại và học cách im lặng." } } }, "Có bằng chứng cho sau này, có thể lỡ chuyến", { tier: "awakened" })], 1)),

  door(RF, "rfg_d_backpack", [6, 15], (c) => c.poor_country || c.econ_phase === "crisis", (c, N) => { const s = role(c, "sibling"); return T("Một ba lô cho mỗi người",
    "Bố mẹ đánh thức bạn lúc nửa đêm. Cả nhà sẽ đi xa, rất xa, và mỗi người chỉ được mang một ba lô. Mẹ dặn: đi đâu cũng phải nắm tay người lớn, không được buông.", [
    C("Xếp sách vở vào ba lô", { ...become(RF), counters: { doors_seen: 1, rf_lang: 1 }, know: 2 }, "Ít đồ chơi, có chữ để học tiếp"),
    C("Mang tấm ảnh cả nhà và giấy khai sinh", { ...become(RF), counters: { doors_seen: 1 }, flags: ["family_photo"] }, "Không có gì để chơi, có giấy tờ cho sau này", { tier: "awakened" }),
    ...(s ? [C(`Nhường chỗ trong ba lô cho đồ của ${N(s)}`, { ...become(RF), counters: { doors_seen: 1 }, rel: 3, flags: ["carried_sibling"] }, "Mình ít đồ, người thân đỡ khổ")] : [])], 0); }),

  /* ---------- mạch truyện ---------- */
  beat(RF, 1, 1, (c) => c.age < 14
    ? T("Lớp học dưới mái bạt", "Trại có một lớp học dưới mái bạt: bốn mươi đứa trẻ, một cô giáo cũng là người tị nạn, một tấm bảng viết bằng than. Giờ học trùng với giờ xếp hàng lấy nước, mà mẹ thì đang ốm.", [
      C("Đi học dưới mái bạt", { counters: step(c, RF, { rf_lang: 1 }), know: 4, rel: -1 }, "Có chữ, mẹ một mình xếp hàng"),
      C("Xếp hàng lấy nước thay mẹ", { counters: step(c, RF), rel: 4, know: -1, flags: ["carried_family"] }, "Đỡ được nhà, lỡ buổi học"),
      C("Học buổi sáng, chiều dạy lại cho đứa nhỏ hơn", { counters: step(c, RF, { rf_lang: 1 }), know: 2, bw: -3, flags: ["camp_teacher"] }, "Mệt hơn, thành người cả lớp cần", { tier: "sovereign" })], 0)
    : T("Tấm thẻ mang số", "Ở trại, bạn được phát một tấm thẻ có số, một tấm bạt, hai can nước mỗi ngày. Mười nghìn người, ba giếng nước. Ban quản lý trại cần người biết chữ để ghi danh sách người mới đến, không lương.", [
      C("Nhận việc ghi danh sách", { counters: step(c, RF, { rf_lang: 1 }), know: 3, bw: -4, flags: ["camp_helper"] }, "Mất sức, được việc và được biết đến"),
      C("Chỉ lo cho gia đình mình", { counters: step(c, RF), rel: 3, health: 2 }, "Nhà đủ nước, không ai biết đến bạn"),
      C("Lẻn ra thị trấn làm thuê lấy tiền mặt", { counters: step(c, RF), money: kid(c, 0.15), bw: -3, flags: ["informal_work"] }, "Có tiền, có thể mất quy chế tị nạn")], 1), (c) => c.age >= 5),

  beat(RF, 2, 3, (c) => {
    const base = Math.min(0.75, 0.35 + (f(c, "documented_case") ? 0.25 : 0) + (f(c, "family_photo") ? 0.1 : 0) + (f(c, "camp_helper") ? 0.05 : 0));
    const ok = (log: string): Effect => ({ flags: ["asylum_granted"], happy: 6, log });
    const no = (log: string): Effect => ({ flags: ["asylum_denied"], happy: -4, log });
    if (c.age < 16) return T("Phiên dịch cho bố mẹ", "Bố mẹ được gọi phỏng vấn tị nạn. Phiên dịch viên không đến. Bạn là người duy nhất trong nhà nói được tiếng ở đây, dù mới học hơn một năm. Người phỏng vấn hỏi bạn có muốn thử không.", [
      C("Dịch hết, kể cả lúc bố mẹ khóc", { counters: step(c, RF), flags: ["child_interpreter"], gamble: { p: Math.min(0.85, base + 0.1), win: ok("Cả nhà được công nhận tị nạn. Bố bạn ôm bạn rất lâu, không nói gì."), lose: no("Hồ sơ bị từ chối. Bố mẹ không trách bạn, nhưng bạn tự trách mình.") } }, "Cả nhà dựa vào bạn, bạn lớn trước tuổi"),
      C("Xin chờ phiên dịch viên người lớn", { counters: step(c, RF), bw: -2, gamble: { p: base, win: ok("Ba tháng sau có phiên dịch viên. Cả nhà được công nhận tị nạn."), lose: no("Ba tháng sau có phiên dịch viên, và một lá thư từ chối.") } }, "Bạn được làm trẻ con, cả nhà chờ thêm")], 1);
    return T("Buổi phỏng vấn tị nạn", `Người phỏng vấn hỏi ngày tháng, tên đường, tên những người đã đến tìm bạn. ${f(c, "documented_case") ? "Bạn có tập hồ sơ có chữ ký luật sư." : f(c, "family_photo") ? "Bạn có một tấm ảnh và tờ giấy khai sinh." : "Bạn không có giấy tờ gì ngoài trí nhớ."} Ở trại, có người khuyên bạn kể một câu chuyện 'dễ được duyệt hơn' mà họ soạn sẵn.`, [
      C("Kể đúng những gì đã xảy ra, cả chỗ nhớ mờ", { counters: step(c, RF), gamble: { p: base, win: ok("Ba tháng sau, thư đến: bạn được công nhận là người tị nạn."), lose: no("Thư đến: lời khai 'thiếu nhất quán'. Bạn có ba mươi ngày để kháng cáo.") } }, "Thật, nhưng có thể không đủ"),
      C("Kể câu chuyện đã soạn sẵn", { counters: step(c, RF), secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 15], note: "lời khai tị nạn học thuộc của người khác" }, gamble: { p: Math.min(0.85, base + 0.15), win: ok("Hồ sơ được duyệt nhanh. Bạn cố quên câu chuyện mình đã kể."), lose: no("Người phỏng vấn đã nghe đúng câu chuyện ấy từ ba người khác.") } }, "Dễ được duyệt hơn, mang theo một bí mật"),
      C("Chờ thêm sáu tháng để có luật sư tình nguyện", { counters: step(c, RF), bw: -4, health: -2, gamble: { p: Math.min(0.85, base + 0.15), win: ok("Luật sư giúp bạn xếp lại lời khai theo đúng ngày tháng. Hồ sơ được duyệt."), lose: no("Sáu tháng chờ, rồi vẫn là thư từ chối.") } }, "Thêm nửa năm trong trại, cơ hội cao hơn", { tier: "awakened" })], 0);
  }, (c) => c.age >= 8),

  beat(RF, 3, 4, (c) => {
    const denied = f(c, "asylum_denied") && !f(c, "asylum_granted");
    const goHome = leaveTo(RF, "return_home");
    if (c.age < 18) return denied
      ? T("Lá thư gửi cả nhà", "Lá thư nói cả nhà phải rời khỏi lãnh thổ trong sáu mươi ngày. Thầy cô và bạn cùng lớp muốn viết thư chung xin cho gia đình bạn ở lại, nếu bạn đồng ý đứng tên và kể chuyện của mình trước toàn trường.", [
        C("Đứng tên, kể chuyện mình trước toàn trường", { counters: step(c, RF), happy: -3, gamble: { p: 0.5, win: { unflags: ["asylum_denied"], flags: ["asylum_granted", "school_campaign"], log: "Hơn hai nghìn chữ ký. Hồ sơ của cả nhà được xét lại và chấp thuận." }, lose: { flags: ["school_campaign"], log: "Lá thư không đổi được quyết định, nhưng cả trường biết tên bạn." } } }, "Phơi chuyện riêng, có thể cứu cả nhà", { tier: "sovereign" }),
        C("Để người lớn lo", { counters: step(c, RF), gamble: { p: 0.25, win: { unflags: ["asylum_denied"], flags: ["asylum_granted"], log: "Luật sư của gia đình thắng kháng cáo vào phút cuối." }, lose: { bw: -4, log: "Kháng cáo bị bác. Bố mẹ bắt đầu nói chuyện về nước." } } }, "Giữ được riêng tư, ít cơ hội hơn"),
        C("Theo bố mẹ về nước", { counters: step(c, RF), ...goHome, happy: -4 }, "Cả nhà về, chưa biết quê còn gì")], 1)
      : T("Ca tối ở xưởng bánh", "Bố bạn vẫn chưa tìm được việc, tiền trợ cấp hết trước cuối tháng. Một xưởng bánh gần nhà nhận thiếu niên làm ca tối, trả tiền mặt. Kỳ thi cuối năm còn hai tháng.", [
        C("Đi làm ca tối, đỡ nhà", { counters: step(c, RF), money: kid(c, 0.04), know: -3, rel: 3, flags: ["teen_worker"] }, "Nhà bớt thiếu, điểm thi tụt"),
        C("Ở nhà học, nhà chật vật thêm", { counters: step(c, RF, { rf_lang: 1 }), know: 5, rel: -2 }, "Học tiếp, thấy mình có lỗi"),
        C("Dạy kèm tiếng cho trẻ mới đến, lấy ít tiền", { counters: step(c, RF, { rf_lang: 1 }), money: kid(c, 0.02), know: 2, flags: ["camp_teacher"] }, "Ít tiền hơn, vẫn giữ được việc học", { tier: "awakened" })], 0);
    if (denied) return T("Lệnh rời khỏi lãnh thổ", "Kháng cáo bị bác. Lá thư cho bạn sáu mươi ngày để tự rời đi. Quê nhà vẫn chưa yên. Bạn đã có một chỗ làm không giấy phép, một căn phòng thuê chung và vài người bạn ở đây.", [
      C("Ở lại, sống không giấy tờ", { counters: step(c, RF), flags: ["undocumented"], close_doors: ["clean_record"], money: 0.1, bw: -6 }, "Ở lại được, sống trong bóng tối"),
      C("Nộp hồ sơ lại với bằng chứng mới", { counters: step(c, RF), money: -0.15, gamble: { p: f(c, "camp_helper") || f(c, "documented_case") ? 0.5 : 0.3, win: { unflags: ["asylum_denied"], flags: ["asylum_granted"], log: "Một nhân chứng từ trại xác nhận lời khai của bạn. Hồ sơ được duyệt." }, lose: { bw: -6, log: "Hồ sơ mới cũng bị bác. Bạn còn ba mươi ngày." } } }, "Thêm một lần thử, thêm tiền và chờ", { tier: "awakened" }),
      C("Về nước dù quê chưa yên", { counters: step(c, RF), ...goHome, happy: -5, health: -3 }, "Về được nhà, không biết điều gì chờ")], 0);
    return T("Tấm bằng không ai công nhận", `Bạn có giấy tờ tị nạn và quyền đi làm. Nhưng tấm bằng ${c.has_degree ? "đại học" : "nghề"} của bạn không được công nhận: muốn hành nghề phải học lại ba năm bằng tiếng bản xứ, ${(c.counters.rf_lang ?? 0) >= 2 ? "thứ tiếng bạn đã nói khá" : "thứ tiếng bạn còn nói bập bẹ"}. Một nhà hàng nhận bạn rửa bát từ tuần sau.`, [
      C("Học lại từ đầu, sống bằng trợ cấp", { counters: step(c, RF, { rf_lang: 1 }), know: 8, money: -0.3, bw: -6, flags: ["requalifying"] }, "Ba năm nghèo, mở lại nghề cũ", { longterm: true }),
      C("Rửa bát, gửi tiền cho người còn ở trại", { counters: step(c, RF), money: 0.15, happy: -4, rel: 4 }, "Có tiền ngay, nghề cũ mất dần"),
      C("Về nước dù quê chưa yên", { counters: step(c, RF), ...goHome, happy: -3 }, "Về với quê, bỏ lại chỗ đứng mới")], 1);
  }),

  beat(RF, 4, 5, (c) => {
    if (f(c, "undocumented")) return T("Đợt ân xá cho người không giấy tờ", "Bạn đã sống không giấy tờ đủ lâu để con hàng xóm gọi bạn bằng tên. Một đợt ân xá mở ra cho ai chứng minh được nhiều năm làm việc liên tục. Chủ cũ phải ký xác nhận, mà ông ta sợ bị phạt vì đã thuê người không giấy phép.", [
      C("Xin chủ cũ ký xác nhận", { counters: step(c, RF), gamble: { p: 0.4, win: { unflags: ["undocumented"], flags: ["legalized"], income_mult: 1.3, log: "Ông chủ ký, sau ba lần bạn đến tận nhà. Bạn có giấy tờ." }, lose: { bw: -4, log: "Ông ta nói không hề biết bạn." } } }, "Nhanh, phụ thuộc lòng tốt một người"),
      C("Tự gom biên lai, tin nhắn, ảnh của nhiều năm", { counters: step(c, RF), bw: -6, agency: 0.03, gamble: { p: 0.55, win: { unflags: ["undocumented"], flags: ["legalized"], income_mult: 1.25, log: "Hai thùng giấy tờ, mười năm đời bạn. Hội đồng chấp thuận." }, lose: { bw: -3, log: "Hồ sơ thiếu hai năm không chứng minh được." } } }, "Mệt và lâu, không phải xin ai", { tier: "sovereign" }),
      C("Không ra trình diện, sợ bị lộ", { counters: step(c, RF), bw: -4, money: kid(c, 0.05) }, "Không mất gì, cũng không có gì")], 2);
    const rooted = f(c, "asylum_granted") && ((c.counters.rf_lang ?? 0) >= 2 || f(c, "requalifying"));
    if (rooted) return T("Lời tuyên thệ công dân", "Bạn đủ điều kiện nhập quốc tịch. Buổi lễ có quốc ca, có bánh ngọt, có một người lạ bắt tay chúc mừng. Nước cũ không cho giữ hai quốc tịch. Cùng tháng đó, tin từ quê báo thị trấn cũ đang được dựng lại.", [
      C("Tuyên thệ, nhận quốc tịch mới", { counters: step(c, RF), income_mult: 1.2, happy: 4, flags: ["naturalized"], close_doors: ["return_home"] }, "Có chỗ đứng, quê cũ thành nơi để thăm"),
      C("Giữ quy chế tị nạn, chờ ngày về", { counters: step(c, RF), bw: -2, flags: ["waiting_return"] }, "Giữ hy vọng về, sống mãi tạm thời"),
      C("Về quê góp tay dựng lại thị trấn", { counters: step(c, RF), ...leaveTo(RF, "become:returnee"), money: kid(c, -0.3), happy: f(c, "remembers_home") ? 6 : 2 }, "Về dựng lại, bỏ dở đời mới")], 0);
    return T("Danh sách việc ở trung tâm", `Việc làm thuê của bạn vừa kết thúc. Ở tuổi ${c.age}, ${(c.counters.rf_lang ?? 0) >= 2 ? "tiếng đã khá" : "tiếng chưa thạo"}, không có bằng được công nhận, trung tâm việc làm đưa bạn một danh sách: dọn vệ sinh, bốc vác, chăm người già.`, [
      C("Học chứng chỉ chăm người già", { counters: step(c, RF), ...leaveTo(RF, "become:caregiver"), know: 3 }, "Có nghề và chỗ đứng, việc nặng lòng"),
      C("Mở quầy bán món ăn quê nhà", { counters: step(c, RF), money: kid(c, -0.2), gamble: { p: f(c, "home_food_stall") ? 0.65 : 0.4, win: { ...leaveTo(RF, "become:street_vendor"), log: "Quầy của bạn có khách quen, rồi có hàng người chờ." }, lose: { money: kid(c, -0.1), log: "Quầy đóng sau năm tháng. Bạn nợ tiền thuê chỗ." } } }, "Có thể thành nghề riêng, có thể mất vốn", { tier: "sovereign" }),
      C("Nhận việc gì có trước", { counters: step(c, RF), money: kid(c, 0.1), health: -4 }, "Có tiền ngay, thân thể trả giá")], 2);
  }, (c) => c.age >= 16),

  beat(RF, 5, 6, (c) => T("Gia đình mới ở tầng dưới", `Một gia đình vừa đến từ một cuộc chiến khác chuyển vào tầng dưới. Họ chưa nói được tiếng ở đây. Đứa nhỏ nhất ôm chặt một cái ba lô, như bạn ngày trước. ${f(c, "naturalized") ? "Bạn đã là công dân ở đây nhiều năm." : "Bạn vẫn đang chờ một tờ giấy cuối cùng."}`, [
    C("Làm phiên dịch, dẫn họ đi làm giấy tờ", { counters: step(c, RF), rel: 5, bw: -3, flags: ["guide_newcomers"] }, "Mất thời gian, trả lại món nợ cũ"),
    C("Lập hội cộng đồng, quỹ chung, sổ sách công khai", { counters: step(c, RF), money: -0.1, rel: 4, agency: 0.03, flags: ["community_fund", "leader"] }, "Việc lớn, cần nhiều người tin bạn", { tier: "sovereign" }),
    C("Chào hỏi tử tế, rồi giữ khoảng cách", { counters: step(c, RF), happy: 1, flags: ["moved_on"] }, "Bạn muốn thôi là người tị nạn")], 0), (c) => c.age >= 35),

  /* ---------- chuyện thường ngày ---------- */
  daily(RF, "rfg_queue", [10, 70], 8, (c) => T("Hàng người lúc sáu giờ sáng", vary("rfq", c.age, [
    "Xe phát lương thực đến muộn hai giờ. Hàng người dài đến tận cổng trại, nắng bắt đầu gắt.",
    "Đợt phát chăn mùa lạnh chỉ đủ cho một nửa số lều. Người ta bắt đầu chen nhau.",
  ]), [
    C("Nhường chỗ cho người già và người bế con", { rel: 3, health: -2, counters: { kind: 1 } }, "Được lòng người, nhà nhận phần cuối"),
    C("Chen lên cho kịp phần", { rel: -3, health: 1 }, "Nhà có phần, người quanh bạn nhớ mặt"),
    C("Đề nghị phát số thứ tự theo từng lều", { agency: 0.02, bw: -2, gamble: { p: 0.6, win: { rel: 4, flags: ["leader"], log: "Ban quản lý làm theo. Hàng người từ đó trật tự hơn." }, lose: { log: "Không ai nghe. Hôm sau vẫn chen như cũ." } } }, "Mất công, có thể đổi được cả trại", { tier: "sovereign" })], 0)),

  daily(RF, "rfg_phone", [12, 70], 8, (c) => T("Chiếc điện thoại sạc chung", vary("rfp", c.age, [
    "Cả lều dùng chung một ổ sạc. Mỗi tối, nhóm tin nhắn của người cùng quê báo thêm vài cái tên không còn liên lạc được.",
    "Một người quen gửi ảnh con phố cũ của bạn. Bạn phóng to, cố tìm ô cửa sổ nhà mình.",
  ]), [
    C("Đọc hết mọi tin, tìm từng cái tên", { happy: -5, bw: -3, flags: ["tracing_family"] }, "Biết được tin, mất ngủ nhiều đêm"),
    C("Chỉ mở nhóm tin một lần mỗi tuần", { happy: 1, bw: 2 }, "Ngủ được, có thể lỡ tin quan trọng"),
    C("Dùng máy học tiếng ở đây mỗi tối", { know: 3, happy: -1, counters: { rf_lang: 1 } }, "Nhìn về phía trước, có lúc thấy có lỗi")], 1)),

  daily(RF, "rfg_class", [14, 70], 99, (c) => T("Lớp tiếng ở thư viện", "Lớp tiếng miễn phí ở thư viện, ba buổi tối mỗi tuần. Cô giáo về hưu dạy bằng tranh vẽ. Trong lớp có một bác sĩ, một thợ mộc và một cậu bé mười bốn tuổi đi một mình.", [
    C("Đi đủ cả ba buổi", { know: 4, bw: -4, counters: { rf_lang: 2 } }, "Mệt, nhưng mở được nhiều cánh cửa"),
    C("Đi một buổi, còn lại đi làm thêm", { money: kid(c, 0.05), counters: { rf_lang: 1 } }, "Có tiền, học chậm"),
    C("Kèm cậu bé đi một mình cùng học", { rel: 3, bw: -2, counters: { rf_lang: 1 }, flags: ["mentored_minor"] }, "Thêm một người dựa vào bạn", { tier: "awakened" })], 0)),

  daily(RF, "rfg_daywork", [16, 65], 99, (c) => T("Thùng xe ở góc chợ", "Mỗi sáng, một người đàn ông dừng xe ở góc chợ, chọn người lên thùng xe đi làm công trình. Tiền mặt, không hợp đồng. Người đang chờ duyệt hồ sơ tị nạn mà bị bắt gặp đi làm có thể bị hủy hồ sơ.", [
    C("Lên xe", { money: kid(c, 0.15), gamble: { p: 0.8, win: { log: "Một tuần đủ tiền thuê phòng." }, lose: { bw: -6, flags: ["caught_working"], log: "Một đợt kiểm tra. Tên bạn được ghi vào hồ sơ." } } }, "Có tiền, đặt cược hồ sơ"),
    C("Chờ giấy phép, sống bằng trợ cấp", { happy: -3, bw: -1 }, "Hồ sơ sạch, túi rỗng"),
    C("Làm tình nguyện ở bếp ăn để học việc", { know: 2, counters: { rf_lang: 1 }, flags: ["volunteer_kitchen"] }, "Không có tiền, có người biết đến bạn", { tier: "awakened" })], 1), (c) => !f(c, "naturalized")),

  daily(RF, "rfg_dish", [16, 70], 9, (c) => T("Món ăn của quê nhà", vary("rfd", c.age, [
    "Hàng xóm ngửi thấy mùi món bạn nấu, gõ cửa hỏi đó là món gì, nấu thế nào.",
    "Chợ cuối tuần trong khu phố có một gian trống, phí thuê rẻ cho người mới đến.",
  ]), [
    C("Mở một gian bán món quê nhà cuối tuần", { money: kid(c, -0.05), gamble: { p: 0.55, win: { money: kid(c, 0.15), flags: ["home_food_stall"], log: "Đến tháng thứ ba, có người xếp hàng chờ món của bạn." }, lose: { log: "Món quá lạ với người ở đây. Bạn dẹp gian hàng sau hai tháng." } } }, "Tốn chút vốn, có thể thành nghề"),
    C("Mời hàng xóm sang ăn", { rel: 4, money: kid(c, -0.02), flags: ["neighbor_friend"] }, "Thêm bạn, không thêm tiền"),
    C("Giữ món ăn cho riêng gia đình", { happy: 1 }, "Yên ổn, không ai biết bạn")], 2)),

  daily(RF, "rfg_bus", [10, 70], 99, () => T("Câu nói trên xe buýt", "Một người đàn ông trên xe buýt nói to rằng 'bọn các người' đến đây để ăn bám. Cả xe im lặng. Một bà cụ ngồi đối diện nhìn bạn, không nói gì.", [
    C("Nói bình tĩnh rằng bạn đang chờ được đi làm", { gamble: { p: 0.5, win: { happy: 3, flags: ["spoke_up"], log: "Bà cụ gật đầu. Một người khác đứng dậy nhường chỗ cho bạn." }, lose: { happy: -3, log: "Ông ta nói to hơn. Bạn xuống sớm hai bến." } } }, "Giữ phẩm giá, có thể căng hơn"),
    C("Im lặng, xuống bến sau", { happy: -4, bw: -2 }, "Yên chuyện, nuốt vào trong"),
    C("Kể chuyện này ở buổi họp khu phố tháng sau", { agency: 0.02, rel: 3, bw: -2, flags: ["community_voice"] }, "Chậm, có thể đổi cách khu phố nhìn bạn", { tier: "sovereign" })], 1)),

  daily(RF, "rfg_trace", [14, 70], 99, (c, N) => { const s = role(c, "sibling"); const who = s ? N(s) : "người anh họ của bạn"; return T("Danh sách tìm người thân",
    `Một tổ chức nhân đạo báo tin: họ tìm thấy một người trùng tên với ${who}, đang ở một trại khác cách ba nghìn cây số. Có ảnh, nhưng mờ.`, [
    C("Dồn hết tiền đi gặp", { money: kid(c, -0.3), happy: 8, flags: ["reunited"], ...(s ? { trust: { npc: s, delta: 0.3 } } : {}) }, "Gặp lại người thân, cạn sạch tiền"),
    C("Nộp đơn đoàn tụ gia đình, chờ thủ tục", { bw: -3, gamble: { p: f(c, "family_photo") ? 0.7 : 0.45, win: { happy: 6, flags: ["reunited"], log: "Hai năm sau, người thân bạn bước ra khỏi cửa sân bay." }, lose: { happy: -3, log: "Hồ sơ bị trả về vì thiếu giấy tờ chứng minh quan hệ." } } }, "Không tốn nhiều, phải chờ lâu", { tier: "awakened" }),
    C("Gọi video trước, chưa hứa gì", { happy: 2, flags: ["tracing_family"] }, "Chắc chắn hơn, nhưng xa vẫn hoàn xa")], 2, s ? { npc: s } : {}); }),

  daily(RF, "rfg_school", [8, 17], 99, () => T("Lớp học lệch tuổi", "Vì chưa biết tiếng, bạn được xếp học cùng những đứa nhỏ hơn mình ba tuổi. Bạn ngồi bàn cuối, đầu gối chạm gầm bàn. Bố mẹ bảo cố lên, rồi đi làm đến tối.", [
    C("Cố học, xin cô giáo thêm bài", { know: 5, happy: -2, counters: { rf_lang: 2 }, flags: ["caught_up_school"] }, "Vất vả, hai năm sau lên đúng lớp"),
    C("Bỏ học đi phụ việc cho nhà", { money: 0.04, know: -4, flags: ["left_school_early"] }, "Đỡ được nhà, mất lớp học"),
    C("Lập nhóm học với hai bạn cùng cảnh", { know: 3, rel: 3, counters: { rf_lang: 1 }, flags: ["study_circle"] }, "Ít được kèm, nhưng không một mình", { tier: "sovereign" })], 0)),

  daily(RF, "rfg_fireworks", [8, 70], 99, (c) => T("Pháo hoa đêm hội", "Thành phố bắn pháo hoa mừng ngày hội. Người ta reo hò ngoài phố. Bạn thấy mình đã nằm sát xuống sàn bếp lúc nào không biết, tim đập như đêm rời nhà.", [
    C("Tìm đến nhóm hỗ trợ tâm lý cho người tị nạn", { health: 3, happy: 3, bw: -2, flags: ["therapy"] }, "Phải kể lại, rồi mới nhẹ đi"),
    C("Không kể với ai", c.age >= 18 ? { happy: -2, health: -3, counters: { drink: 2 } } : { happy: -3, bw: -3 }, c.age >= 18 ? "Giữ kín, tìm đến rượu để ngủ" : "Giữ kín, mang theo một mình")], 1)),

  daily(RF, "rfg_permit", [16, 70], 8, (c) => T("Gia hạn giấy tạm trú", vary("rfr", c.age, [
    "Giấy tạm trú của bạn hết hạn sau ba tuần. Lịch hẹn gia hạn sớm nhất là hai tháng nữa.",
    "Lần thứ sáu bạn xếp hàng ở văn phòng di trú. Người cán bộ mới hỏi lại những câu bạn đã trả lời năm lần.",
  ]), [
    C("Đến xếp hàng từ bốn giờ sáng", { health: -2, bw: -2, counters: { rf_wait: 1 } }, "Mất ngày công, giữ được giấy tờ"),
    C("Nhờ luật sư tình nguyện viết thư khẩn", { gamble: { p: 0.6, win: { flags: ["legal_aid"], log: "Thư khẩn được nhận. Giấy của bạn được gia hạn tạm." }, lose: { bw: -4, log: "Văn phòng luật quá tải, không nhận thêm hồ sơ." } } }, "Có thể nhanh, có thể chẳng được gì"),
    C("Kệ, cứ đi làm, tính sau", { money: kid(c, 0.03), flags: ["permit_lapsed"] }, "Giữ việc, giấy tờ hết hạn")], 0), (c) => !f(c, "naturalized")),

  /* ---------- gia đình ---------- */
  cross(RF, "rfg_family", [18, 70], (c) => (c.kids_alive > 0 && !!role(c, "child")) || (c.parents_alive > 0 && (!!role(c, "mother") || !!role(c, "father"))), (c, N) => {
    const k = c.kids_alive > 0 ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} trả lời bằng tiếng bản xứ`, `${N(k)} lớn lên ở đây, nói tiếng bản xứ không vấp một chữ, và bắt đầu trả lời bạn bằng thứ tiếng đó. Khi ông bà gọi video từ quê cũ, ${N(k)} chỉ biết cười.`, [
      C("Mở lớp tiếng mẹ đẻ cuối tuần cho trẻ trong khu", { bw: -3, agency: 0.02, flags: ["heritage_class"], trust: { npc: k, delta: 0.1 } }, "Thêm việc, cả khu giữ được tiếng nói", { tier: "sovereign" }),
      C("Ở nhà chỉ nói tiếng mẹ đẻ", { flags: ["home_tongue"], trust: { npc: k, delta: -0.1 } }, "Con giữ được tiếng, nhưng cãi nhau nhiều"),
      C("Để con lớn lên theo cách của con", { happy: -2, trust: { npc: k, delta: 0.1 } }, "Con thoải mái, sợi dây với quê đứt dần")], 2, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(`${N(p)} không chịu rời quê`, `${N(p)} vẫn ở lại quê cũ, nói già rồi, đi đâu cũng thế. Mỗi lần mạng chập chờn mất liên lạc, bạn thức trắng cả đêm.`, [
      C(`Làm hồ sơ đoàn tụ cho ${N(p)}`, { money: -0.2, gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.3 }, flags: ["parent_joined"], log: `Một năm sau, ${N(p)} sang ở cùng, mang theo một túi hạt giống quê nhà.` }, lose: { trust: { npc: p, delta: 0.1 }, log: `${N(p)} được cấp giấy, nhưng đến phút chót vẫn không chịu đi.` } } }, "Tốn tiền và công, chưa chắc người già chịu đi"),
      C("Gửi tiền đều mỗi tháng", { money: -0.1, trust: { npc: p, delta: 0.1 }, promise: { to: p, what: "gửi tiền về đều đặn mỗi tháng", years: 3 } }, "Đỡ được người già, buộc mình vào lời hứa"),
      C("Tôn trọng quyết định ở lại", { happy: -3, trust: { npc: p, delta: 0.05 } }, "Không ép ai, mang theo nỗi lo")], 1, { npc: p });
  }),
];

/* =====================================================================
 * THỢ MỎ — 1 năng khiếu · 3 cơ hội · 5 nhịp · 10 chuyện thường ngày · 1 gia đình
 * mn_risk cộng dồn mỗi lần đi tắt; khủng hoảng ở b3 nặng hay nhẹ là do nó.
 * ===================================================================== */
const MINER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(MN, "mnr_t_stones", [8, 14], () => true, () => T("Hộp đá dưới gầm giường", "Bạn nhặt đá ở bờ suối, xếp đầy một hộp dưới gầm giường. Ông hàng xóm từng đi lò nhìn hộp đá, gọi đúng tên từng viên, rồi bảo bạn có con mắt của người làm mỏ.", [
    C("Theo ông học tên các lớp đá", { flags: [talentFlag(MN)], counters: { talents_seen: 1 }, know: 2, happy: 2 }, "Mê đá, mở một con đường dưới lòng đất"),
    C("Mang hộp đá đến lớp khoa học", { counters: { talents_seen: 1 }, know: 3 }, "Thành bài học, không thành nghề")], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(MN, "mnr_d_hire", [18, 40], () => true, (c) => T("Mỏ tuyển thợ hầm lò",
    `Công ty mỏ ở vùng ${c.poor_country ? "núi" : "phía bắc"} cách nhà hai trăm cây số tuyển thợ hầm lò: lương gấp rưỡi nhà máy, có nhà tập thể, đóng bảo hiểm đủ. Khóa học an toàn ba tháng. Người đi lò lâu năm nào cũng có tiếng ho riêng của mình.`, [
    C("Đăng ký học nghề hầm lò", { ...become(MN), counters: { doors_seen: 1 }, health: -1, rel: -2 }, "Lương cao, trả bằng sức khỏe"),
    C("Học trung cấp địa chất trước, vào sau", { counters: { doors_seen: 1 }, know: 4, money: -0.1, gamble: { p: 0.6, win: { ...become(MN), income_mult: 1.15, flags: ["mine_tech"], log: "Hai năm sau bạn vào mỏ với tấm bằng kỹ thuật viên trắc địa." }, lose: { log: "Học xong thì mỏ ngừng tuyển. Tấm bằng nằm trong ngăn kéo." } } }, "Chậm và tốn, vào nghề ở bậc cao hơn", { longterm: true }),
    C("Không đi, ở gần nhà", { counters: { doors_seen: 1 }, happy: -1 }, "Yên ổn, lương như cũ")], 2)),

  door(MN, "mnr_d_pit", [18, 45], (c) => c.poor_country, () => T("Bãi vàng đầu nguồn",
    "Người ta đào được vàng ở bãi bồi đầu nguồn. Cả làng kéo lên dựng lán. Không ai có giấy phép, không ai đội mũ bảo hộ. Có người đổi đời trong một tháng, có người mất trắng cả vốn lẫn sức.", [
    C("Lên bãi, góp công đào chung một giếng", { ...become(MN), counters: { doors_seen: 1 }, flags: ["informal_pit"], health: -2 }, "Có thể đổi đời, không có gì che chắn"),
    C("Mở quán cơm cho thợ đào", { counters: { doors_seen: 1 }, money: 0.1, flags: ["pit_canteen"] }, "Ít giàu hơn, an toàn hơn"),
    C("Ở nhà, làm việc cũ", { counters: { doors_seen: 1 } }, "Không mất gì, không được gì")], 2)),

  door(MN, "mnr_d_roster", [20, 45], (c) => !c.poor_country, () => T("Hai tuần dưới mỏ, một tuần ở nhà",
    "Một mỏ quặng ở vùng hoang mạc, cách thành phố hai giờ bay, tuyển thợ theo ca: hai tuần ở trại mỏ, ca mười hai tiếng, rồi bay về nhà một tuần. Lương gấp đôi việc hiện tại.", [
    C("Nhận, sống theo lịch bay", { ...become(MN), counters: { doors_seen: 1 }, flags: ["fly_in"], rel: -4 }, "Lương cao, nửa đời vắng nhà"),
    C("Không, giữ việc gần nhà", { counters: { doors_seen: 1 }, rel: 1 }, "Có mặt ở nhà, lương thấp hơn")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(MN, 1, 1, (c) => T("Lần đầu xuống lò", f(c, "informal_pit")
    ? "Giếng sâu hai mươi mét, chống bằng cây rừng. Người già nhất bãi chỉ bạn cách nghe tiếng đất trước khi xuống. Nhóm của bạn đang đào nhanh hơn những đoạn đã chống xong."
    : "Thang lồng đưa bạn xuống ba trăm mét trong bốn phút. Tổ trưởng gõ lên nóc lò, bảo bạn nghe: tiếng đục là đá chắc, tiếng bộp là đá sắp rơi. Tổ đang thiếu chỉ tiêu, mọi người đi tắt qua những đoạn chưa chống xong.", [
    C("Làm đúng quy trình, chậm thì chịu", { counters: step(c, MN), money: -0.03, rel: -2, flags: ["by_the_book"] }, "Bị chê chậm, bớt liều"),
    C("Làm theo tổ, đi tắt cho kịp chỉ tiêu", { counters: step(c, MN, { mn_risk: 2 }), money: 0.08, rel: 3 }, "Được tổ quý, rủi ro cộng dồn"),
    C("Xin theo người thợ già học nghe đất", { counters: step(c, MN), know: 3, bw: -2, flags: ["old_hand_taught"] }, "Mất giờ nghỉ, học được nghề sống sót", { tier: "awakened" })], 1), adult),

  beat(MN, 2, 3, (c) => { const pit = f(c, "informal_pit"); const risky = (c.counters.mn_risk ?? 0) >= 2; return T(pit ? "Giếng trúng mạch" : "Tổ trưởng ca ba", pit
    ? `Giếng của nhóm bạn trúng mạch. Chủ bãi muốn bạn quản lý thêm hai giếng nữa, chia phần theo vàng ra. ${risky ? "Ai cũng biết nhóm bạn đào nhanh vì dám đào liều." : "Nhóm bạn nổi tiếng chống giếng kỹ nhất bãi."}`
    : `Bạn được làm tổ trưởng${risky ? " vì tổ bạn luôn vượt chỉ tiêu" : " vì tổ bạn ba năm chưa ai bị thương"}. Công ty treo thưởng cho tổ nào vượt sản lượng quý. Thợ trẻ muốn thưởng; thợ già muốn thêm cột chống.`, [
    C("Đẩy sản lượng, lấy thưởng cho cả tổ", { counters: step(c, MN, { mn_risk: 2 }), income_mult: 1.3, rel: 2 }, "Cả tổ khá lên, lò kém an toàn"),
    C("Giữ nhịp an toàn, chịu không có thưởng", { counters: step(c, MN), income_mult: 1.05, flags: ["safe_crew"] }, "Ít tiền, thợ trẻ phàn nàn"),
    C(pit ? "Lập hợp tác xã thợ đào, xin giấy phép" : "Vào công đoàn, đòi thưởng theo ngày an toàn", { counters: step(c, MN), agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.2, flags: pit ? ["coop_license"] : ["union_member", "safety_bonus"], log: pit ? "Hợp tác xã có giấy phép. Bãi có quy định chống giếng đầu tiên." : "Công ty đổi cách tính thưởng cho cả mỏ. Người ta gọi đó là 'thưởng của tổ bạn'." }, lose: { flags: pit ? ["marked_trouble"] : ["union_member", "marked_trouble"], log: pit ? "Chủ bãi đuổi nhóm bạn sang mép bãi, chỗ đất xấu nhất." : "Đề xuất bị gạt. Tên bạn vào danh sách 'cần theo dõi'." } } }, "Đổi luật cho cả nơi, có thể bị trù", { tier: "sovereign" })], 0); }, adult),

  beat(MN, 3, 4, (c) => { const risk = c.counters.mn_risk ?? 0; return T("Máy đo khí kêu giữa ca",
    `Giữa ca, máy đo khí ${f(c, "informal_pit") ? "cũ mà cả nhóm góp tiền mua " : ""}kêu liên tục. ${f(c, "informal_pit") ? "Chủ bãi" : "Quản đốc"} qua bộ đàm bảo máy hỏng, cứ làm tiếp, hàng đang gấp. ${risk >= 3 ? "Mấy tháng nay tổ bạn đã đi tắt quá nhiều đoạn." : "Bạn nhớ những đoạn lò tổ mình đã chống cẩn thận."}${f(c, "rescue_team") ? " Bạn là người của đội cấp cứu, mọi người nhìn bạn." : ""}`, [
    C("Làm tiếp như được bảo", { counters: step(c, MN), money: 0.05, gamble: { p: Math.max(0.3, 0.8 - 0.1 * risk), win: { log: "Hết ca, không có chuyện gì. Hôm sau có máy đo mới." }, lose: { health: -15, happy: -8, flags: ["mine_accident"], log: "Một đoạn lò sập sau lưng tổ bạn. Mười một tiếng sau, đội cứu hộ đưa được cả tổ lên; một người không đi lại được nữa." } } }, "Giữ việc, đặt cược vào cái máy"),
    C("Ra lệnh cả tổ rút lên", { counters: step(c, MN), flags: ["refused_unsafe"], gamble: { p: 0.5, win: { rel: 4, flags: ["respected_call"], log: "Hai giờ sau, đoạn lò ấy sụt. Không ai ở dưới." }, lose: { income_mult: 0.85, flags: ["marked_trouble"], log: "Không có gì xảy ra. Bạn bị kỷ luật vì bỏ ca." } } }, "Giữ được người, có thể mất chức"),
    C("Rút lên và gọi thẳng thanh tra", { counters: step(c, MN), agency: 0.03, gamble: { p: 0.45, win: { flags: ["whistleblower", "leader"], log: "Thanh tra đình chỉ khu lò ba tuần. Cả mỏ được thay máy đo mới." }, lose: { ...leave(MN), flags: ["whistleblower"], log: "Bạn bị đuổi việc vì 'gây hoang mang'. Không mỏ nào quanh vùng nhận bạn." } } }, "Đổi được cả mỏ, hoặc mất nghề", { tier: "sovereign" })], 0); }, adult),

  beat(MN, 4, 5, (c) => {
    if (f(c, "mine_accident")) return T("Phiên điều trần về vụ sập lò", "Một năm sau vụ sập lò, có phiên điều trần. Luật sư công ty đề nghị bạn ký bản tường trình rằng 'thợ tự ý làm sai quy trình', đổi lại một khoản bồi thường lớn và việc nhẹ trên mặt đất. Gia đình người đồng đội không đi lại được nữa ngồi ở hàng ghế đầu.", [
      C("Ký, nhận tiền", { counters: step(c, MN), money: 1.0, rel: -4, flags: ["signed_statement"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 10], note: "ký tường trình sai về vụ sập lò" } }, "Tiền lớn, một lời khai sai"),
      C("Khai đúng sự thật trước hội đồng", { counters: step(c, MN), agency: 0.02, gamble: { p: f(c, "union_member") ? 0.6 : 0.45, win: { money: 0.5, rel: 6, flags: ["testified"], log: "Công ty bị phạt nặng. Gia đình người đồng đội được bồi thường đủ." }, lose: { ...leave(MN), flags: ["testified"], log: "Công ty thắng. Bạn không còn chỗ trong mỏ nào quanh vùng." } } }, "Đúng với đồng đội, có thể mất nghề", { tier: "sovereign" }),
      C("Giải nghệ, nhận trợ cấp thương tật", { counters: step(c, MN), ...leave(MN), money: 0.3, health: 2 }, "Thoát khỏi lò, sống bằng trợ cấp")], 2);
    const dusty = (c.counters.mn_lungs ?? 0) + (c.counters.mn_risk ?? 0) >= 4;
    return T("Tấm phim phổi", `Khám định kỳ: phim phổi của bạn có những đốm mờ. ${dusty ? "Bác sĩ nói đó là bụi của những năm không giữ khẩu trang, không chống đủ." : "Bác sĩ nói còn nhẹ, nếu dừng bây giờ."} Cùng tuần đó, công ty đề nghị bạn làm quản đốc cả khu.`, [
      C("Nhận làm quản đốc, xuống lò ít hơn", { counters: step(c, MN), income_mult: 1.4, health: dusty ? -6 : -3, flags: ["foreman_mine"] }, "Lên chức, vẫn hít bụi"),
      C("Chuyển sang dạy an toàn cho thợ mới", { counters: step(c, MN), income_mult: 0.9, health: 4, flags: ["safety_trainer"] }, "Ít tiền, thợ trẻ học được nghề sống sót", { tier: "awakened" }),
      C("Rời mỏ, chữa bệnh, tìm nghề khác", { counters: step(c, MN), ...leave(MN), health: 6, money: -0.2 }, "Giữ phổi, mất lương cao"),
      ...(f(c, "union_member") || f(c, "whistleblower") ? [C("Ứng cử chủ tịch công đoàn mỏ", { counters: step(c, MN), agency: 0.03, income_mult: 0.95, bw: -4, flags: ["union_leader", "leader"] }, "Ít tiền, gánh tiếng nói của cả mỏ", { tier: "sovereign" })] : [])], 0);
  }, adult),

  beat(MN, 5, 6, (c) => { const pit = f(c, "informal_pit"); return T(pit ? "Bãi vàng bị rào lại" : "Mỏ đóng cửa", pit
    ? "Một công ty lớn có giấy phép đến rào cả bãi lại, đề nghị thuê thợ cũ làm công nhật. Đồi trọc, suối đục. Bọn trẻ trong làng không còn biết bãi này từng là rừng."
    : `Công ty thông báo đóng mỏ sau bốn mươi năm: giá không còn bù được chi phí. Thị trấn có hai nghìn thợ. ${f(c, "union_leader") ? "Công đoàn của bạn đòi được một gói hỗ trợ chuyển nghề." : "Không ai nói thợ sẽ đi đâu."} Có người đề xuất biến khu lò cũ thành bảo tàng, cần người từng xuống lò dẫn khách.`, [
    C("Học một nghề mới, rời mỏ", { counters: step(c, MN), ...leaveTo(MN, "job_new"), know: 4, happy: f(c, "union_leader") ? 2 : -2 }, "Bắt đầu lại ở tuổi này, bỏ nghề cả đời"),
    C(pit ? "Lập hợp tác xã trồng lại rừng trên bãi cũ" : "Dẫn khách thăm lò cũ, kể chuyện nghề", { counters: step(c, MN), income_mult: 0.7, happy: 6, agency: 0.02, flags: pit ? ["replanted_pit", "passed_on"] : ["mine_museum", "passed_on"] }, "Ít tiền, giữ được ký ức cả vùng", { tier: "sovereign" }),
    C(pit ? "Làm công nhật cho công ty mới" : "Ở lại, sống bằng trợ cấp", { counters: step(c, MN), money: 0.3, happy: -3, flags: ["mine_pension"] }, "Có thu nhập, nhìn quê đổi khác")], 2); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(MN, "mnr_dust", [18, 60], 99, () => T("Khẩu trang trong ca nóng", "Dưới lò ba mươi tám độ, khẩu trang lọc bụi ướt sũng sau một giờ. Thợ trẻ kéo xuống cằm cho dễ thở. Phổi không đau ngay, nên chẳng ai sợ.", [
    C("Đeo suốt ca, chịu ngộp", { health: 2, bw: -2, counters: { mn_mask: 1 } }, "Ngộp bây giờ, phổi sạch về sau"),
    C("Kéo xuống như mọi người", { happy: 1, counters: { mn_lungs: 1 } }, "Dễ thở bây giờ, bụi tích lại"),
    C("Rủ tổ góp tiền mua thêm quạt gió", { money: -0.04, rel: 2, flags: ["crew_fan"], counters: { mn_mask: 1 } }, "Tốn tiền túi, cả tổ dễ thở", { tier: "sovereign" })], 1)),

  daily(MN, "mnr_night", [18, 60], 8, (c) => T("Ca đêm cả tháng", vary("mnn", c.age, [
    "Tháng này bạn trực ca đêm, mười giờ tối đến sáu giờ sáng. Về đến nhà thì con đã đi học.",
    "Ba tuần ca đêm liền. Bạn ngủ ban ngày trong tiếng xe tải chở quặng chạy qua cửa sổ.",
  ]), [
    C("Đổi ca để ở với gia đình", { money: -0.03, rel: 3, counters: { mn_family: 1 } }, "Mất phụ cấp, có mặt ở nhà"),
    C("Nhận thêm ca đêm lấy phụ cấp", { money: 0.06, health: -3, rel: -2 }, "Thêm tiền, thiếu ngủ, vắng nhà")], 0)),

  daily(MN, "mnr_payday", [18, 60], 8, (c) => T("Ngày lĩnh lương ở thị trấn mỏ", vary("mnp", c.age, [
    "Ngày lĩnh lương, quán nhậu đầu dốc đông kín thợ lò. Ai cũng nói uống để rửa bụi trong cổ.",
    "Sòng bài sau dãy nhà tập thể mở thâu đêm ngày lĩnh lương. Cả tổ rủ bạn ngồi một ván cho vui.",
  ]), [
    C("Ngồi với anh em đến khuya", { rel: 3, money: -0.02, health: -1, counters: { drink: 1 } }, "Gắn bó với tổ, hao tiền hao sức"),
    C("Mang lương về đưa cả cho nhà", { money: 0.03, rel: -1, counters: { save: 1 } }, "Nhà dư dả hơn, tổ bảo bạn xa cách")], 0)),

  daily(MN, "mnr_log", [20, 60], 99, () => T("Sổ đo khí bỏ trống", "Sắp có đoàn kiểm tra. Quản đốc đưa bạn cuốn sổ ghi các lần đo khí tháng trước, nhiều trang bỏ trống, bảo bạn điền cho đủ rồi ký, như mọi tổ trưởng khác.", [
    C("Điền cho đủ và ký", { money: 0.05, flags: ["false_log"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 8], note: "ký khống sổ đo khí hầm lò" } }, "Yên với quản đốc, mang một bí mật"),
    C("Ghi đúng 'không đo' vào những ngày trống", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["honest_log"], counters: { honest: 1 }, log: "Đoàn kiểm tra hỏi đến những ngày trống. Mỏ phải mua thêm máy đo." }, lose: { income_mult: 0.9, flags: ["marked_trouble"], log: "Bạn bị hạ bậc lương vì 'làm khó' quản đốc." } } }, "Sổ sạch, có thể bị trù", { tier: "sovereign" })], 0)),

  daily(MN, "mnr_price", [20, 60], 9, (c) => T("Giá quặng rơi", vary("mnq", c.age, [
    "Giá quặng trên thị trường thế giới giảm một nửa trong sáu tháng. Mỏ cắt một ca, thợ thay nhau nghỉ không lương.",
    "Có tin mỏ sắp bán cho một tập đoàn khác, người lớn tuổi sẽ bị cho nghỉ trước.",
  ]), [
    C("Chấp nhận giảm giờ, chờ giá lên", { money: -0.15, counters: { mn_loyal: 1 } }, "Giữ chỗ, túi mỏng đi"),
    C("Làm thêm nghề phụ những ngày nghỉ", { money: -0.05, bw: -3, flags: ["side_trade"] }, "Mệt hơn, có đường lui"),
    C("Cùng thợ đòi chia đều giờ, không ai mất việc", { money: -0.08, rel: 4, agency: 0.02, flags: ["work_sharing"] }, "Ai cũng thiệt một ít, không ai mất hết", { tier: "sovereign" })], 0)),

  daily(MN, "mnr_fund", [20, 60], 99, () => T("Hòm quỹ của tổ", "Tổ bạn có một hòm quỹ: mỗi người góp một ít mỗi tháng, ai bị thương thì được chia. Người giữ quỹ vừa chuyển mỏ khác. Cả tổ đề nghị bạn giữ.", [
    C("Nhận giữ, ghi sổ công khai mỗi tháng", { bw: -2, rel: 4, flags: ["fund_keeper", "leader"] }, "Thêm việc, cả tổ tin bạn"),
    C("Nhận giữ, lặng lẽ vay quỹ trả nợ riêng", { money: 0.08, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.4, fuse_years: [1, 5], note: "vay lén hòm quỹ thợ lò" } }, "Đỡ lúc túng, mang một bí mật"),
    C("Từ chối, đề nghị gửi quỹ vào ngân hàng", { rel: -1, flags: ["fund_banked"] }, "Sạch sẽ, cả tổ thấy bạn né việc")], 0)),

  daily(MN, "mnr_taboo", [18, 60], 99, () => T("Lời kiêng dưới lò", "Thợ mới trong tổ huýt sáo khi đang xuống lò. Thợ già bắt cậu ta lên lại, nói dưới lò kiêng huýt sáo, kiêng nói chữ 'sập'. Cậu ta cười, bảo đó là mê tín.", [
    C("Đứng về phía thợ già", { rel: 3, flags: ["keeps_taboo"] }, "Tổ yên, cậu thợ mới thấy lạc lõng"),
    C("Bênh cậu thợ mới", { rel: -3, happy: 1, flags: ["broke_taboo"] }, "Hợp lý, mất lòng người già"),
    C("Giải thích: kiêng để mọi người nghe được tiếng đất", { know: 2, rel: 2, flags: ["explains_taboo"] }, "Tốn lời, cả hai bên cùng hiểu", { tier: "awakened" })], 0)),

  daily(MN, "mnr_cough", [20, 60], 99, () => T("Tiếng ho của chú tổ phó", "Chú tổ phó ho suốt ca, giấu bệnh vì còn hai năm nữa mới đủ tuổi hưu. Nếu bác sĩ mỏ biết, chú sẽ bị cho nghỉ với nửa lương hưu.", [
    C("Giữ kín, làm đỡ phần việc nặng cho chú", { health: -3, rel: 3, flags: ["covered_elder"] }, "Chú giữ được lương, bạn gánh thêm"),
    C("Báo bác sĩ mỏ", { gamble: { p: 0.5, win: { flags: ["saved_elder"], log: "Chú được chuyển lên làm kho. Hai năm sau về hưu đủ lương." }, lose: { rel: -4, log: "Chú bị cho nghỉ. Cả tổ không nói chuyện với bạn một tuần." } } }, "Có thể cứu phổi chú, có thể mất lòng tổ"),
    C("Vận động cả tổ đòi chế độ bệnh nghề nghiệp", { agency: 0.02, bw: -3, gamble: { p: 0.45, win: { rel: 5, flags: ["leader"], log: "Công ty công nhận bệnh bụi phổi của chú là bệnh nghề nghiệp." }, lose: { flags: ["lung_checks"], log: "Hồ sơ bị trả về. Nhưng cả tổ bắt đầu đi khám phổi." } } }, "Lâu và mệt, có thể đổi luật cho mọi người", { tier: "sovereign" })], 0)),

  daily(MN, "mnr_kids", [20, 60], 99, () => T("Bọn trẻ ở bãi thải", "Mấy đứa trẻ trong xóm mỏ ra bãi thải nhặt quặng sót, bán theo cân cho người thu mua. Một đứa xin đi theo bạn để 'học nghề'.", [
    C("Từ chối, bảo nó về đi học", { happy: -1, counters: { kind: 1 } }, "Không dính vào, mọi chuyện vẫn như cũ"),
    C("Góp tiền cùng thợ thuê lớp học buổi chiều", { money: -0.05, rel: 4, agency: 0.02, flags: ["mine_school"] }, "Tốn tiền túi, bọn trẻ có chỗ đi", { tier: "sovereign" })], 0), (c) => c.poor_country),

  daily(MN, "mnr_rescue", [20, 50], 99, () => T("Đội cấp cứu mỏ", "Mỏ tuyển người vào đội cấp cứu: tập luyện thêm mỗi tuần, phụ cấp không nhiều. Khi có sự cố, họ là những người đầu tiên xuống.", [
    C("Đăng ký vào đội", { health: 2, bw: -2, rel: 3, flags: ["rescue_team"] }, "Thêm việc, thêm rủi ro, được tin cậy"),
    C("Để người trẻ hơn vào", { happy: 1 }, "Nhẹ người, không ai trông vào bạn")], 1)),

  /* ---------- gia đình ---------- */
  cross(MN, "mnr_family", [20, 60], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || (c.parents_alive > 0 && !!role(c, "mother")), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} muốn theo bạn xuống lò`, `Mỏ đang tuyển thợ học việc. Lương khởi điểm của thợ lò cao hơn lương kỹ sư mới ra trường. ${N(k)} nói muốn bỏ học để đi làm như bạn.`, [
      C("Cấm, bắt học tiếp", { trust: { npc: k, delta: -0.15 } }, "Con giận, tránh được lò"),
      C("Cho đi, dặn kỹ từng điều", { trust: { npc: k, delta: 0.15 }, flags: ["child_miner"] }, "Con nể bạn, đời con dưới đất"),
      C("Dẫn con đến xem ca làm, nói thật mọi chuyện", { trust: { npc: k, delta: 0.1 }, bw: -2, flags: ["showed_mine"] }, "Để con tự chọn khi đã thấy tận mắt", { tier: "awakened" })], 2, { npc: k });
    const s = c.married ? role(c, "spouse") : undefined;
    const p = (s ?? role(c, "mother"))!;
    return T(`${N(p)} chờ ở cổng mỏ`, `Mỗi lần có còi báo động, ${N(p)} chạy ra cổng mỏ, đứng đến khi thấy bạn lên. ${N(p)} muốn bạn bỏ nghề.`, [
      C("Hứa làm thêm hai năm rồi nghỉ", { promise: { to: p, what: "bỏ nghề đi lò sau hai năm", years: 2 }, trust: { npc: p, delta: 0.1 } }, "Giữ lương, nợ một lời hứa"),
      C("Chuyển lên làm trên mặt đất", { income_mult: 0.75, trust: { npc: p, delta: 0.25 } }, "Lương thấp, người nhà yên lòng"),
      C("Nói đây là nghề của mình", { trust: { npc: p, delta: -0.15 }, happy: 1 }, "Giữ nghề, để người nhà lo")], 0, { npc: p });
  }),
];

/* =====================================================================
 * LAO ĐỘNG THỜI VỤ — 1 năng khiếu · 2 cơ hội · 5 nhịp · 10 chuyện thường ngày · 1 gia đình
 * ===================================================================== */
const SEASONAL: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SW, "tvu_t_picker", [9, 15], () => true, (c) => T("Đứa trẻ hái nhanh nhất xóm", `Mùa thu hoạch, cả xóm đi hái thuê. Bạn ${c.age} tuổi mà hái nhanh hơn nhiều người lớn, nắng cũng không than. Chủ vườn hỏi bố mẹ có cho bạn đi hái cả mùa không.`, [
    C("Đi hái thuê cả mùa, kiếm tiền tiêu", { flags: [talentFlag(SW)], counters: { talents_seen: 1 }, money: 0.02, know: -2, health: 1 }, "Có tiền, quen nghề, lỡ bài vở"),
    C("Chỉ đi cuối tuần, còn lại đi học", { counters: { talents_seen: 1 }, know: 1 }, "Giữ việc học, mùa vụ chỉ là mùa vụ")], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(SW, "tvu_d_visa", [21, 45], (c) => c.poor_country || c.gdp < 25000, () => T("Chương trình lao động mùa vụ",
    "Một chương trình hợp tác cho người ở đây sang một nước lạnh hơn hái trái cây sáu tháng mỗi năm, rồi về. Không mất phí môi giới, nhưng phải chứng minh có gia đình ở nhà để bảo đảm sẽ quay về. Một công ty tư nhân hứa 'chắc suất' nếu nộp qua họ.", [
    C("Tự nộp hồ sơ, chờ được chọn", { counters: { doors_seen: 1 }, gamble: { p: 0.6, win: { ...become(SW), flags: ["seasonal_visa"], log: "Bạn có tên trong danh sách. Chuyến bay vào đầu mùa xuân bên ấy." }, lose: { log: "Năm nay chỉ tuyển người đã từng đi. Bạn chờ năm sau." } } }, "Không mất phí, chưa chắc được chọn"),
    C("Nộp qua công ty tư nhân cho chắc suất", { custom: `borrow:0.3|become:${SW}`, counters: { doors_seen: 1 }, flags: ["seasonal_visa", "broker_fee"] }, "Chắc suất, mất khoản phí lẽ ra không cần"),
    C("Ở nhà", { counters: { doors_seen: 1 } }, "Không xa nhà, không thêm thu nhập")], 2)),

  door(SW, "tvu_d_truck", [18, 50], () => true, (c) => T("Xe tải đón người đi mùa", c.country === "VN"
    ? "Một chiếc xe tải dừng đầu làng. Chủ vườn cà phê trên cao nguyên tuyển người hái mùa: ba tháng, bao ăn ở, trả theo bao. Ông ta nói giá công bằng miệng, không ghi vào đâu."
    : "Một chiếc xe tải dừng ở quảng trường. Chủ trang trại nho ở vùng phía nam tuyển người thu hoạch: ba tháng, bao ăn ở, trả theo thùng. Ông ta nói giá công bằng miệng, không ghi vào đâu.", [
    C("Leo lên xe, đi ngay", { ...become(SW), counters: { doors_seen: 1 }, money: 0.05, rel: -2 }, "Có tiền mặt, xa nhà ba tháng"),
    C("Đòi ghi giá công ra giấy rồi mới đi", { counters: { doors_seen: 1 }, gamble: { p: 0.6, win: { ...become(SW), flags: ["written_rate"], log: "Chủ xe ký tờ giấy viết tay. Bạn giữ nó suốt mùa." }, lose: { log: "Chủ xe chở người khác đi. Bạn ở lại." } } }, "Có giấy tờ, có thể mất chỗ", { tier: "awakened" }),
    C("Không đi", { counters: { doors_seen: 1 } }, "Ở nhà, không thêm đồng nào")], 2)),

  /* ---------- mạch truyện ---------- */
  beat(SW, 1, 1, (c) => T("Thùng hàng đầu tiên được ghi sổ", `${f(c, "seasonal_visa") ? "Trang trại ở nước lạnh, sương trắng mỗi sáng." : "Vườn trên đồi, nắng từ sáu giờ."} Tiền công tính theo thùng: thùng đầy mới được ghi sổ. Tay bạn phồng rộp từ ngày thứ hai. Người hái giỏi nhất đội là một bà cụ, chậm mà không bao giờ dừng.`, [
    C("Chạy đua hái nhiều nhất đội", { counters: step(c, SW, { tv_seasons: 1 }), money: 0.1, health: -5 }, "Tiền nhiều, cái lưng trả giá"),
    C("Học cách hái của bà cụ", { counters: step(c, SW, { tv_seasons: 1 }), money: 0.05, health: 1, flags: ["learned_pace"] }, "Chậm lúc đầu, bền cả mùa", { tier: "awakened" }),
    C("Giúp mấy người mới không đủ thùng", { counters: step(c, SW, { tv_seasons: 1 }), money: 0.03, rel: 4, flags: ["helped_crew"] }, "Ít tiền hơn, có người nhớ ơn")], 0), adult),

  beat(SW, 2, 3, (c) => T("Cai đội mùa sau", `Chủ trang trại muốn mùa sau bạn mang theo hai mươi người cùng quê và làm cai đội. Mỗi đầu người bạn được một khoản, trừ vào lương của họ. ${f(c, "helped_crew") ? "Người ở quê tin bạn vì chuyện mùa đầu." : "Ở quê, người ta mới biết tên bạn."}`, [
    C("Nhận, lấy phần trăm theo đầu người", { counters: step(c, SW), income_mult: 1.4, flags: ["crew_boss", "takes_cut"], secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.3, fuse_years: [2, 6], note: "lấy phần trăm lương của người cùng quê" } }, "Tiền theo đầu người, lấy từ lương người quen"),
    C("Làm cai, không lấy phần từ lương ai", { counters: step(c, SW), income_mult: 1.1, rel: 5, agency: 0.02, flags: ["crew_boss", "fair_crew"] }, "Ít tiền hơn, cả đội tin bạn", { tier: "sovereign" }),
    C("Từ chối, chỉ hái cho mình", { counters: step(c, SW), happy: 1 }, "Nhẹ đầu, không lên được")], 2), adult),

  beat(SW, 3, 4, (c) => { const boss = f(c, "crew_boss"); return T("Mười phút mưa đá",
    `Một trận mưa đá trong mười phút phá nát cả vườn ngay trước vụ hái. Chủ trang trại nói không có việc thì không có lương, ai muốn ở lại thì tự lo tiền ăn. ${boss ? "Hai mươi người bạn đưa đi đang nhìn bạn." : "Bạn còn nợ tiền vé."}`, [
    C(boss ? "Cho cả đội vay tiền vé về" : "Chia tiền dành dụm với người cùng lán", { counters: step(c, SW), money: boss ? -0.4 : -0.15, rel: 6, flags: ["paid_crew_home"] }, "Mất tiền cả mùa, giữ được chữ tín"),
    C("Tìm trang trại khác còn thiếu người", { counters: step(c, SW), gamble: { p: 0.5, win: { money: 0.15, log: "Một vườn táo cách hai trăm cây số nhận cả đội." }, lose: { money: -0.15, log: "Đến nơi thì họ đã đủ người." } } }, "Có thể cứu được mùa, có thể mất thêm"),
    C("Đòi chủ trả nửa lương như đã hứa", { counters: step(c, SW), agency: 0.02, gamble: { p: f(c, "written_rate") || f(c, "seasonal_visa") ? 0.6 : 0.35, win: { money: 0.15, flags: ["won_half_pay"], log: "Chủ trả một nửa. Tờ giấy có chữ ký hóa ra có giá trị." }, lose: { flags: ["blacklisted"], log: "Năm sau, tên bạn không còn trong danh sách gọi người." } } }, "Đòi được phần mình, có thể bị gạch tên", { tier: "sovereign" }),
    C("Thôi đi mùa, về hẳn", { counters: step(c, SW), ...leaveTo(SW, "return_home"), rel: 4, happy: -2 }, "Ở với nhà, mất nguồn thu mùa vụ")], 1); }, adult),

  beat(SW, 4, 5, (c) => {
    if (f(c, "takes_cut")) return T("Lá đơn của người cùng làng", "Một người trong đội gửi đơn lên cơ quan lao động: cai đội lấy tiền đầu người trái quy định. Đội đã có người gọi về quê kể. Chủ trang trại bảo bạn tự lo.", [
      C("Trả lại tiền cho từng người", { counters: step(c, SW), money: -0.5, rel: 4, unflags: ["takes_cut"], flags: ["repaid_crew"] }, "Mất mấy mùa dành dụm, giữ được tên"),
      C("Chối, nói đó là phí ăn ở", { counters: step(c, SW), gamble: { p: 0.5, win: { log: "Không đủ bằng chứng. Đơn bị gác lại, nhưng nửa đội không đi cùng bạn nữa." }, lose: { income_mult: 0.6, flags: ["blacklisted"], log: "Cơ quan lao động phạt và cấm bạn làm cai đội." } } }, "Giữ tiền, cược vào việc không ai chứng minh được"),
      C("Rời đội, không đi mùa nữa", { counters: step(c, SW), ...leaveTo(SW, "return_home"), rel: -3 }, "Thoát chuyện, mang tiếng ở quê")], 0);
    const seasons = c.counters.tv_seasons ?? 1;
    return T("Mảnh đất của riêng mình", `Sau ${seasons > 1 ? "nhiều" : "mấy"} mùa đi hái thuê, tiền dành dụm đủ mua một mảnh đất nhỏ ở quê. ${f(c, "fair_crew") ? "Cả đội nói nếu bạn làm vườn, họ sẽ về làm cùng." : "Người ta bảo trồng gì cũng không bằng đi mùa vụ."}`, [
      C("Mua đất, về trồng cây của mình", { counters: step(c, SW), ...leaveTo(SW, "become:agritech"), money: -0.8 }, "Làm chủ, đặt cược hết tiền dành dụm"),
      C("Mua đất, vẫn đi mùa, để nhà trồng", { counters: step(c, SW), money: -0.6, rel: -2, flags: ["own_plot"] }, "Hai nguồn thu, ít khi ở nhà"),
      C("Không mua, dồn tiền cho người nhà đi học", { counters: step(c, SW), money: -0.3, rel: 4, flags: ["funded_school"] }, "Không có đất, nhà có một người học hành", { longterm: true }),
      ...(f(c, "fair_crew") ? [C("Rủ cả đội lập hợp tác xã, cùng mua vườn", { counters: step(c, SW), money: -0.5, rel: 4, agency: 0.03, flags: ["crew_coop", "leader"] }, "Ít đất cho riêng mình, nhiều người cùng có", { tier: "sovereign" })] : [])], 1);
  }, adult),

  beat(SW, 5, 6, (c) => T("Máy hái về vườn", `Trang trại mua máy thu hoạch: một máy làm bằng bốn mươi người. Mùa sau chỉ cần năm người biết lái và sửa máy. ${(c.counters.tv_seasons ?? 0) >= 3 ? "Bạn đã đi đủ nhiều mùa để chủ muốn giữ bạn lại." : "Bạn chưa chắc mình có trong năm người đó."}`, [
    C("Học lái và sửa máy", { counters: step(c, SW), know: 4, income_mult: 1.15, flags: ["machine_operator"] }, "Giữ việc, đội cũ mất việc"),
    C("Dẫn đội cũ sang vùng chưa có máy", { counters: step(c, SW), rel: 5, money: -0.05, flags: ["passed_on"] }, "Giúp người khác, mình không được gì thêm", { tier: "sovereign" }),
    C("Nghỉ đi mùa, ở nhà với gia đình", { counters: step(c, SW), ...leave(SW), happy: 4, rel: 4 }, "Yên ổn, mất thu nhập mùa")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SW, "tvu_bus", [18, 60], 8, (c) => T("Chuyến xe đêm đi mùa", vary("tvb", c.age, [
    "Ba mươi người trên chiếc xe chạy suốt đêm. Ai cũng ôm một bao tải chăn màn và nồi niêu.",
    "Chuyến bay đêm, rồi sáu tiếng xe buýt. Người ngồi cạnh bạn đi mùa năm thứ mười hai.",
  ]), [
    C("Ngủ cho mai còn sức", { health: 2 }, "Khỏe người, không biết thêm gì"),
    C("Thức nghe người đi mùa lâu năm kể", { know: 2, bw: -1, flags: ["veteran_tips"] }, "Mệt ngày đầu, biết trước chỗ hiểm")], 0)),

  daily(SW, "tvu_scale", [18, 60], 99, () => T("Cái cân ở cuối luống", "Cuối ngày, người quản lý cân thùng của bạn. Bạn biết thùng mình nặng hơn con số trên cân. Cả đội đều nghi cái cân.", [
    C("Chấp nhận, mai hái thêm", { money: -0.03 }, "Yên chuyện, mất phần công"),
    C("Im lặng, tự ghi số cân riêng mỗi ngày", { bw: -1, flags: ["own_records"] }, "Chưa được gì, có bằng chứng cho sau này", { tier: "awakened" }),
    C("Đòi cân lại trước mặt cả đội", { gamble: { p: 0.5, win: { money: 0.06, rel: 3, log: "Cân lại thì thiếu thật. Từ đó họ cân trước mặt mọi người." }, lose: { flags: ["blacklisted"], log: "Quản lý nói bạn gây rối. Mùa sau không ai gọi bạn." } } }, "Có thể đòi được cho cả đội, có thể mất mùa sau")], 0)),

  daily(SW, "tvu_heat", [18, 60], 8, (c) => T("Bốn mươi độ giữa trưa", vary("tvh", c.age, [
    "Nhiệt kế ở lán chỉ bốn mươi độ. Quản lý nói ai nghỉ giữa trưa thì trừ nửa ngày công.",
    "Một người trong đội ngã quỵ vì say nắng. Quản lý bảo những người còn lại làm tiếp.",
  ]), [
    C("Làm tiếp, uống thật nhiều nước", { money: 0.03, health: -4 }, "Giữ công, cơ thể trả giá"),
    C("Nghỉ dưới bóng cây, chịu trừ công", { money: -0.03, health: 2, counters: { tv_rest: 1 } }, "Giữ sức, mất nửa ngày"),
    C("Rủ cả đội cùng nghỉ một giờ", { agency: 0.02, gamble: { p: 0.55, win: { rel: 3, flags: ["heat_break"], log: "Quản lý nhượng bộ: nghỉ trưa một giờ, không trừ công." }, lose: { money: -0.05, log: "Cả đội bị trừ nửa ngày công." } } }, "Có thể đổi luật cả vườn, có thể cùng mất công", { tier: "sovereign" })], 0)),

  daily(SW, "tvu_spray", [18, 60], 99, () => T("Mùi thuốc trên lá", "Chiều qua người ta phun thuốc trừ sâu ở hàng bên cạnh. Sáng nay quản lý bảo vào hái luôn, không cần chờ. Lá vẫn còn mùi hắc, găng tay thì thiếu.", [
    C("Vào hái như được bảo", { money: 0.02, health: -4, counters: { tv_exposure: 1 } }, "Giữ công, hít mùi thuốc"),
    C("Chờ đủ ngày rồi mới vào, chịu mất công", { money: -0.03, health: 1, flags: ["refused_spray"] }, "Mất tiền, giữ được người"),
    C("Chụp nhãn thuốc, gửi đường dây hỗ trợ lao động", { gamble: { p: 0.5, win: { flags: ["reported_farm"], log: "Một thanh tra đến. Từ đó trang trại treo biển ngày được vào lại." }, lose: { flags: ["blacklisted"], log: "Không ai đến. Quản lý biết ai đã gọi." } } }, "Có thể đổi được cả vườn, có thể bị đuổi", { tier: "awakened" })], 0)),

  daily(SW, "tvu_shed", [18, 60], 99, () => T("Nhà kho bốn mươi người", "Chỗ ở là một nhà kho cũ ngăn bằng bạt: bốn mươi người, hai vòi nước. Tiền lán trừ thẳng vào lương mỗi tuần, đắt bằng thuê một căn hộ ở thành phố.", [
    C("Ở, chịu", { money: -0.04 }, "Gần vườn, mất tiền vô lý"),
    C("Rủ năm người thuê nhà ngoài thị trấn", { money: -0.02, health: 2, bw: -2, flags: ["shared_rent"] }, "Đi xa hơn, ở như người"),
    C("Dựng lều riêng ở bãi đất cạnh sông", { money: 0.02, health: -2, flags: ["camped_out"] }, "Đỡ tiền, chịu mưa gió")], 0)),

  daily(SW, "tvu_wedding", [18, 60], 99, (c, N) => { const s = role(c, "sibling")!; return T(`${N(s)} cưới giữa vụ hái`, `${N(s)} cưới vào đúng tuần cao điểm của vụ hái. Về thì mất chỗ trong đội mùa sau, ở thì lỡ ngày vui nhất của ${N(s)}.`, [
    C("Về dự cưới", { money: -0.1, trust: { npc: s, delta: 0.25 }, flags: ["lost_crew_spot"] }, "Có mặt ngày vui, mất chỗ mùa sau"),
    C("Ở lại, gửi tiền mừng gấp đôi", { money: -0.05, trust: { npc: s, delta: -0.1 }, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.1, note: "vắng mặt trong đám cưới vì vụ hái" } }, "Giữ chỗ, ghế của bạn để trống"),
    C("Nhờ người trong đội giữ chỗ, về ba ngày", { money: -0.06, gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.25 }, log: "Bạn kịp về, kịp đi. Người giữ chỗ không đòi gì." }, lose: { trust: { npc: s, delta: 0.2 }, flags: ["lost_crew_spot"], log: "Bạn dự được cưới. Quay lại thì chỗ đã có người khác." } } }, "Có thể vẹn cả hai, phụ thuộc người khác", { tier: "awakened" })], 2, { npc: s }); }, (c) => !!role(c, "sibling")),

  daily(SW, "tvu_cash", [18, 60], 99, () => T("Cả mùa trong một túi vải", "Hết mùa, chủ trả bằng tiền mặt. Cả mùa dồn lại trong một chiếc túi vải. Chuyến xe về đi qua hai thị trấn, nghe nói gần đây có người bị giật túi.", [
    C("Gửi ngân hàng, chịu phí chuyển", { money: -0.02, counters: { save: 1 } }, "Mất phí, chắc chắn"),
    C("Khâu tiền vào lớp áo trong", { gamble: { p: 0.85, win: { money: 0.02, log: "Về đến nhà, tiền còn nguyên." }, lose: { money: -0.4, log: "Bạn mất túi trên xe khách. Cả mùa công cốc." } } }, "Không mất phí, mất là mất hết"),
    C("Cả đội gửi chung một tài khoản, về chia", { rel: 2, flags: ["shared_account"], counters: { save: 1 } }, "Rẻ và an toàn, phải tin nhau", { tier: "sovereign" })], 0)),

  daily(SW, "tvu_offseason", [18, 60], 9, (c) => T("Những tháng không có mùa", vary("tvo", c.age, [
    "Hết mùa. Bốn tháng tới không có việc. Tiền dành dụm vừa đủ trả nợ cũ.",
    "Mùa giáp hạt. Cửa hàng tạp hóa đầu làng lại ghi sổ nợ cho bạn như mọi năm.",
  ]), [
    C("Ghi nợ, chờ mùa sau", { custom: "borrow:0.15", happy: -1 }, "Qua được mấy tháng, nợ lăn sang năm"),
    C("Học một nghề cho mùa nghỉ", { know: 4, money: -0.05, flags: ["offseason_trade"] }, "Tốn tiền học, có việc quanh năm", { longterm: true }),
    C("Lên thành phố làm phụ hồ", { money: 0.08, health: -3, rel: -2 }, "Có tiền, quanh năm không ở nhà")], 0)),

  daily(SW, "tvu_friend", [18, 60], 99, () => T("Người bạn của mỗi mùa", "Năm nào cũng vậy, ở hàng cây bên cạnh là cùng một người từ một vùng đất khác. Hai người chưa bao giờ nói chung một thứ tiếng, nhưng chia nhau bánh mì, thuốc đau lưng và tin thời tiết.", [
    C("Học vài câu tiếng của nhau", { know: 2, happy: 3, flags: ["season_friend"] }, "Mất giờ nghỉ, có một người bạn"),
    C("Giữ khoảng cách, đi làm để kiếm tiền", { money: 0.02 }, "Thêm chút công, mùa nào cũng như mùa nào")], 0)),

  daily(SW, "tvu_overstay", [18, 60], 99, () => T("Người không lên chuyến bay về", "Một người trong đội nói sẽ không lên chuyến bay về. Anh ta xin bạn đừng nói gì: nếu chương trình biết có người bỏ trốn, cả đội của bạn có thể bị cắt suất năm sau.", [
    C("Giữ im lặng", { gamble: { p: 0.6, win: { log: "Không ai hỏi. Năm sau đội vẫn được đi." }, lose: { flags: ["blacklisted"], log: "Chương trình cắt suất cả đội năm sau." } } }, "Không phản ai, cược suất của cả đội"),
    C("Báo cán bộ chương trình", { rel: -4, flags: ["reported_crewmate"] }, "Giữ suất cho đội, mang tiếng chỉ điểm"),
    C("Thuyết phục anh ta về, hứa giúp tìm suất dài hạn", { bw: -3, gamble: { p: 0.5, win: { rel: 3, flags: ["talked_down"], log: "Anh ta lên máy bay. Hai năm sau, anh ta có hợp đồng dài hạn." }, lose: { flags: ["blacklisted"], log: "Anh ta vẫn ở lại. Đội bị cắt suất." } } }, "Tốn công, có thể vẹn cả hai", { tier: "sovereign" })], 0), (c) => f(c, "seasonal_visa") || c.migrated),

  /* ---------- gia đình ---------- */
  cross(SW, "tvu_family", [20, 55], (c) => (c.kids_alive > 0 && !!role(c, "child")) || (c.parents_alive > 0 && (!!role(c, "mother") || !!role(c, "father"))), (c, N) => {
    const k = c.kids_alive > 0 ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} lớn lên theo mùa vụ`, `Năm nào bạn cũng vắng nhà nửa năm. ${N(k)} viết trong bài tập làm văn: 'Bố mẹ em đi hái trái cây cho người ở xa ăn.' Cô giáo gửi bài về cho bạn đọc.`, [
      C("Đưa con đến vườn một tuần vào kỳ nghỉ", { money: -0.05, trust: { npc: k, delta: 0.2 }, flags: ["kid_saw_farm"] }, "Tốn tiền, con thấy bạn làm gì"),
      C("Đi mùa ngắn hơn, ở nhà lâu hơn", { income_mult: 0.85, trust: { npc: k, delta: 0.15 } }, "Ít tiền, nhiều ngày bên con"),
      C("Gửi thêm tiền cho con học thêm", { money: -0.05, trust: { npc: k, delta: 0.05 } }, "Con có điều kiện học, vẫn vắng bạn")], 2, { npc: k });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(`${N(p)} ở nhà một mình nửa năm`, `${N(p)} đã già. Mỗi mùa bạn đi là ${N(p)} ở một mình sáu tháng. Hàng xóm gọi bảo dạo này ${N(p)} hay quên tắt bếp.`, [
      C("Trả tiền nhờ hàng xóm trông giúp", { money: -0.08, trust: { npc: p, delta: 0.1 }, flags: ["paid_neighbor_care"] }, "Tốn tiền, có người để mắt"),
      C("Ở nhà một mùa", { money: -0.2, trust: { npc: p, delta: 0.25 } }, "Mất một mùa thu nhập, có mặt bên bố mẹ"),
      C("Gọi điện mỗi tối, vẫn đi", { trust: { npc: p, delta: -0.05 }, bw: -2 }, "Giữ thu nhập, lo suốt cả mùa")], 0, { npc: p });
  }),
];

export const PACK_AWAY_A: Storylet[] = [...LABOR, ...REFUGEE, ...MINER, ...SEASONAL];
