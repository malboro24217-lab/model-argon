/**
 * Thời sự (A): thiên tai, dịch bệnh và sức khỏe cộng đồng, cú sốc kinh tế, lừa đảo lan trong xã hội,
 * giải tỏa và phát triển đô thị, sốc giá năng lượng. Mỗi thẻ là một chuyện của thời đại chạm vào một đời người.
 * 63 thẻ · 10 biến cố lớn (major). Trẻ em: tiền ≤ ±0.04 qua M(), không trust dưới 12 tuổi.
 */
import type { Storylet, FactContext, Effect, MemoryTag } from "../types.ts";
import { C, T, f, role, news, become } from "./kit.ts";
import { PATHS } from "./registry.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
/** Tiền theo tuổi: dưới 18 chỉ chạm tối đa ±0.04 thu nhập hộ. */
const M = (c: FactContext, x: number): number => (c.age < 18 ? Math.max(-0.04, Math.min(0.04, x)) : x);
/** Bước sang một con đường nếu tuổi hợp lệ (kèm hiệu ứng host khác nếu có); ngoài tuổi thì chỉ giữ phần host. */
const into = (c: FactContext, path: string, base?: string): Effect => {
  const a = PATHS[path]!.ages; const ok = c.age >= a[0] && c.age <= a[1];
  const parts = [base, ok ? `become:${path}` : undefined].filter((x): x is string => !!x);
  return parts.length ? { custom: parts.join("|") } : {};
};
const mem = (npc: string | undefined, tag: MemoryTag, weight: number, note: string): Effect => (npc ? { memory: { npc, tag, weight, note } } : {});
const tr = (npc: string | undefined, delta: number): Effect => (npc ? { trust: { npc, delta } } : {});
const parent = (c: FactContext): string | undefined => role(c, "mother") ?? role(c, "father");

/* ================================================================== THIÊN TAI */
const DISASTER: Storylet[] = [
  news("nw_flood_child", [5, 11], 0.2, (c) => c.poor_country, () => T("Nước lên trong đêm", "Nửa đêm mẹ lay bạn dậy. Nước đã ngập đến bậc thềm thứ ba, con gà mái kêu inh ỏi trên nóc chuồng. Bố bảo bạn ôm lấy thứ gì quý nhất rồi trèo lên gác.", [
    C("Ôm cặp sách và vở lên gác", { know: 2, happy: -3, flags: ["nw_flood_kid"] }, "Giữ được bài vở, mất món đồ chơi duy nhất"),
    C("Lội ra chuồng cứu con gà mái", { gamble: { p: 0.6, win: { happy: 4, flags: ["nw_flood_kid", "nw_saved_hen"], log: "Con gà mái sống sót. Mùa sau nó đẻ một ổ mười trứng." }, lose: { health: -4, flags: ["nw_flood_kid"], log: "Bạn trượt chân, uống mấy ngụm nước bùn, sốt ba ngày." } } }, "Liều, có thể ốm"),
    C("Ngồi sát bố mẹ, không rời một bước", { rel: 2, happy: -1, counters: { nw_fear_water: 1 } }, "Yên tâm lúc ấy, nỗi sợ nước theo về sau")], 2), true),

  news("nw_flood_house", [20, 75], 0.2, (c) => c.poor_country || c.gdp < 15000, (c, N) => { const nb = role(c, "neighbor"); return T("Lũ vào nhà", `Mưa sang ngày thứ năm, nước sông vượt mép đê. ${vn(c) ? "Loa xã" : "Xe cứu hộ chạy dọc phố"} kêu sơ tán trước sáu giờ chiều. Tầng trệt nhà bạn còn tủ lạnh, xe máy và hai bao gạo.`, [
    C("Đưa cả nhà đi sơ tán, bỏ đồ lại", { money: -0.25, health: 2, flags: ["nw_flood_lost"] }, "An toàn người, mất phần lớn đồ đạc"),
    C("Ở lại kê đồ, canh nhà", { gamble: { p: 0.5, win: { money: -0.05, flags: ["nw_flood_stayed"], log: "Nước dừng lại cách mặt giường một gang tay. Đồ đạc gần như nguyên." }, lose: { money: -0.3, health: -8, flags: ["nw_flood_stayed"], log: "Nước lên nhanh hơn dự báo. Bạn trèo lên mái ngồi chờ thuyền đến đón." } } }, "Có thể giữ được đồ, có thể kẹt trên mái"),
    nb ? C(`Chèo thuyền sang đón nhà ${N(nb)}`, { money: -0.2, health: -3, flags: ["nw_flood_hero"], memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "chèo thuyền sang đón cả nhà giữa trận lũ" } }, "Bỏ mặc đồ nhà mình, cứu người khác", { tier: "awakened" })
      : C("Chèo thuyền đi đón người già trong xóm", { money: -0.2, health: -3, rel: 4, flags: ["nw_flood_hero"] }, "Bỏ mặc đồ nhà mình, cứu người khác", { tier: "awakened" })], 0, nb ? { npc: nb } : {}); }, true),

  news("nw_typhoon_roof", [20, 80], 0.15, () => true, () => T("Bão tốc mái", "Cơn bão đi qua lúc ba giờ sáng. Sáng ra, nửa mái tôn nhà bạn nằm ở bãi đất bên kia đường, cây xoài trước ngõ bật gốc. Thợ sửa mái giờ lấy giá gấp đôi và phải chờ hai tuần.", [
    C("Vay tiền gọi thợ lợp lại ngay", { custom: "borrow:0.3", happy: 2, flags: ["nw_storm_roof"] }, "Ở yên ngay, gánh thêm nợ"),
    C("Căng bạt tạm, tự sửa dần", { money: -0.05, health: -3, bw: -4, counters: { nw_diy_roof: 1 } }, "Ít tốn, mệt và dột cả mùa mưa"),
    C("Rủ cả xóm lập tổ lợp mái từng nhà", { money: -0.1, rel: 5, agency: 0.02, flags: ["nw_roof_crew", "leader"] }, "Chậm hơn, cả xóm nợ nhau một lần", { tier: "sovereign" })], 0), true),

  news("nw_rescue_team", [18, 30], 0.12, (c) => !f(c, "life_firefighter"), () => T("Đội cứu hộ thiếu người", "Sau trận bão, đội cứu hộ thành phố làm việc ba ngày không ngủ. Người chỉ huy hỏi đám thanh niên đứng xem có ai biết bơi, biết leo. Bạn vừa cùng họ kéo một ông cụ ra khỏi căn nhà sập một nửa.", [
    C("Xin vào đội, học nghề cứu nạn", { ...become("firefighter"), health: -2, agency: 0.02 }, "Nghề nguy hiểm, mỗi ngày đều có ích"),
    C("Phụ một tuần rồi về việc cũ", { rel: 3, health: -2, flags: ["nw_volunteer"] }, "Giúp được, đời không đổi"),
    C("Về lo nhà mình trước", { money: 0.02, happy: -2 }, "Nhà mình yên, lòng thì không")], 0)),

  news("nw_drought", [20, 70], 0.2, (c) => c.farmer || f(c, "job_farm"), (c) => T("Ruộng nứt chân chim", vn(c)
    ? "Ba tháng không một giọt mưa. Nước mặn lấn vào kênh, mạ chết vàng từng đám. Giếng khoan của hàng xóm phải xuống tới bốn mươi mét mới có nước ngọt."
    : "Ba tháng không một giọt mưa. Con kênh cạn trơ đáy, mầm cây héo ngay sau khi nhú. Giếng nhà hàng xóm phải khoan xuống bốn mươi mét mới có nước.", [
    C("Vay tiền khoan giếng sâu cứu vụ", { custom: "borrow:0.4", gamble: { p: 0.6, win: { money: 0.3, flags: ["nw_deep_well"], log: "Giếng ra nước. Vụ nhà bạn là một trong số ít vụ còn thu hoạch được trong vùng." }, lose: { money: -0.1, flags: ["nw_deep_well"], log: "Giếng khoan trúng mạch nước lợ. Khoản nợ thì vẫn còn đó." } } }, "Có thể cứu vụ, có thể ôm nợ"),
    C("Bỏ ruộng, đi làm thời vụ nơi khác", { ...into(c, "seasonal_worker"), rel: -2, money: 0.1, flags: ["nw_left_farm"] }, "Có tiền mặt, ruộng bỏ hoang"),
    C("Bỏ một vụ, học trồng giống chịu hạn", { ...into(c, "agritech"), money: -0.15, know: 3, flags: ["nw_dry_crop"] }, "Mất một vụ để học, có thể mở lối mới", { tier: "awakened", longterm: true })], 0)),

  news("nw_water_haul", [8, 15], 0.12, (c) => c.poor_country, () => T("Gánh nước đầu ngõ", "Mùa khô năm ấy, vòi nước công cộng chỉ chảy hai tiếng mỗi sáng. Nhà bạn cần người xếp hàng từ năm giờ, đúng lúc phải đi học. Mẹ không bảo gì, chỉ nhìn bạn rất lâu.", [
    C("Xếp hàng lấy nước, đi học muộn", { know: -3, rel: 3, health: -1, flags: ["nw_water_carrier"] }, "Nhà đỡ vất, điểm tụt dần"),
    C("Đi học đúng giờ", { know: 2, happy: -2, counters: { nw_guilt: 1 } }, "Giữ việc học, mẹ gánh thêm"),
    C("Rủ đám bạn trong xóm thay phiên xếp hàng", { rel: 4, know: -1, flags: ["nw_water_rota", "leader"] }, "Mỗi đứa mất một buổi, nhà nào cũng đỡ", { tier: "sovereign" })], 1)),

  news("nw_quake", [12, 80], 0.08, () => true, (c) => T("Đất rung lúc nửa đêm", "Chiếc tủ chén đổ sập lúc nửa đêm. Bốn mươi giây dài nhất đời bạn. Sáng ra, tường nhà nứt một đường chéo từ trần xuống sàn, cả phố trải chiếu ngủ ngoài bãi đất trống.", [
    C("Dựng lều ngủ ngoài trời đến khi kiểm định xong", { money: M(c, -0.05), health: -2, flags: ["nw_quake_tent"] }, "An toàn, mất ngủ nhiều tuần"),
    C("Quay vào nhà lấy giấy tờ và tiền", { gamble: { p: 0.7, win: { flags: ["nw_quake_papers"], log: "Bạn mang ra được túi giấy tờ. Hai ngày sau, dư chấn làm sập bức tường bếp." }, lose: { health: -10, flags: ["nw_quake_papers"], log: "Một dư chấn nhẹ làm rơi mảng trần. Bạn bị khâu sáu mũi ở đầu." } } }, "Giữ được giấy tờ, liều mạng"),
    c.age >= 18 && c.age <= 30 && !f(c, "life_firefighter")
      ? C("Theo đội cứu hộ đào bới căn nhà sập cuối phố", { ...become("firefighter"), health: -4, agency: 0.02 }, "Một nghề mới giữa đống đổ nát", { tier: "awakened" })
      : C("Phát nước cho người ngủ ngoài bãi", { money: M(c, -0.03), rel: 4, counters: { kind: 1 } }, "Tốn chút tiền và sức, cả phố nhớ mặt", { tier: "awakened" })], 0), true),

  news("nw_landslide", [18, 75], 0.1, (c) => c.poor_country, () => T("Vết nứt sau đồi", "Sau một tuần mưa dầm, sườn đồi sau nhà bạn hiện ra một vết nứt dài hơn chục mét. Cán bộ đến cắm biển cảnh báo, đề nghị cả xóm dời đi. Chỗ ở tạm là dãy lán trong sân trường, cách nương ba tiếng đi bộ.", [
    C("Dời đi ngay theo khuyến cáo", { money: -0.15, happy: -3, flags: ["nw_slide_moved"] }, "An toàn, xa nương rẫy"),
    C("Ở lại, đêm thay nhau canh", { gamble: { p: 0.75, win: { happy: 2, counters: { nw_stayed_hill: 1 }, log: "Mùa mưa qua. Vết nứt không rộng thêm." }, lose: { health: -12, money: -0.4, flags: ["nw_slide_lost"], log: "Một đêm, nửa quả đồi trượt xuống. Cả nhà kịp chạy, căn nhà thì không." } } }, "Giữ nhà, đánh cược cả nhà"),
    C("Xin vào khu tái định cư lâu dài", { money: -0.05, close_doors: ["return_home"], flags: ["nw_resettled"] }, "Chỗ ở chắc chắn, không còn đường về làng cũ", { tier: "awakened", longterm: true })], 0)),

  news("nw_heatwave_old", [55, 90], 0.25, () => true, (c, N) => { const nb = role(c, "neighbor"); return T("Mùa nóng nhất từng đo", "Nhiệt kế ngoài hiên chỉ bốn mươi ba độ, ba tuần liền không hạ. Bản tin nói bệnh viện quá tải vì người già say nắng. Cái quạt trong nhà chỉ thổi ra hơi nóng.", [
    C("Mua máy lạnh, chịu hóa đơn điện", { money: -0.08, health: 3, flags: ["nw_ac"] }, "Mát, tiền điện gấp ba"),
    C("Ban ngày ra ngồi ở thư viện có điều hòa", { health: 1, rel: 2, bw: -2, counters: { nw_cool_room: 1 } }, "Không tốn tiền, ngày nào cũng phải đi lại"),
    nb ? C(`Ngày nào cũng gõ cửa hỏi thăm ${N(nb)}`, { health: -1, happy: 3, memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "ngày nào cũng gõ cửa hỏi thăm trong đợt nắng nóng" } }, "Tốn sức mình, giữ được một người", { tier: "awakened" })
      : C("Ở yên trong nhà, chịu nóng cho đỡ tiền", { health: -5, money: 0.01 }, "Giữ tiền, cơ thể chịu thay")], 0, nb ? { npc: nb } : {}); }),

  news("nw_heat_shift", [18, 55], 0.15, (c) => c.worker || f(c, "job_build") || f(c, "job_factory"), () => T("Ca trưa bốn mươi độ", "Đợt nóng kéo dài, nơi bạn làm vẫn chạy ca từ mười một giờ trưa đến ba giờ chiều. Tuần trước một người cùng tổ ngất ngay tại chỗ. Quản đốc nói ai không làm thì về, ngoài cổng còn nhiều người chờ việc.", [
    C("Làm tiếp, uống thật nhiều nước", { money: 0.03, health: -5 }, "Giữ việc, sức khỏe hao"),
    C("Xin nghỉ ca trưa, chịu trừ lương", { money: -0.04, health: 2, flags: ["nw_skipped_noon"] }, "Giữ sức, mất tiền, bị để ý"),
    C("Cùng cả tổ đề xuất dời ca sang sáng sớm", { gamble: { p: 0.5, win: { rel: 3, flags: ["nw_early_shift", "leader"], log: "Quản đốc đồng ý thử một tháng. Rồi giữ luôn." }, lose: { money: -0.05, flags: ["nw_marked_worker"], log: "Quản đốc ghi tên bạn vào sổ. Hợp đồng sau không được gia hạn." } } }, "Có thể đổi giờ cho cả tổ, có thể mất việc", { tier: "sovereign" })], 0)),

  news("nw_smoke_haze", [6, 80], 0.12, () => true, (c) => c.age < 18
    ? T("Bầu trời màu cam", "Cháy rừng ở cách hàng trăm cây số, nhưng khói phủ thành phố suốt hai tuần. Mặt trời đỏ như lòng đỏ trứng. Trường cho học sinh nghỉ, cửa sổ đóng kín vẫn ngửi thấy mùi khét.", [
      C("Ở trong nhà đọc hết tủ sách", { know: 3, happy: -2, counters: { read: 1 } }, "Học được nhiều, bức bối cả tuần"),
      C("Lén ra sân đá bóng với bạn", { health: -3, happy: 3, counters: { exercise: 1 } }, "Vui, ho mất mấy hôm")], 0)
    : T("Bầu trời màu cam", "Cháy rừng ở cách hàng trăm cây số, nhưng khói phủ thành phố suốt hai tuần. Mặt trời đỏ như lòng đỏ trứng, cửa sổ đóng kín vẫn ngửi thấy mùi khét. Chỗ làm của bạn vẫn mở cửa.", [
      C("Mua máy lọc không khí cho cả nhà", { money: -0.04, health: 2, flags: ["nw_air_purifier"] }, "Tốn tiền, cả nhà dễ thở"),
      C("Vẫn đi làm, đeo khẩu trang", { money: 0.01, health: -3 }, "Giữ công, phổi chịu thay"),
      C("Đi phát khẩu trang ở bến xe", { health: -2, rel: 3, counters: { kind: 1 } }, "Hít thêm khói, giúp được người lạ", { tier: "awakened" })], 0)),

  news("nw_insurance_denied", [30, 75], 0.1, (c) => !c.poor_country, () => T("Điều khoản về nước", "Trận mưa lớn làm ngập tầng hầm nhà bạn nửa mét. Công ty bảo hiểm gửi thư: hợp đồng chỉ chi trả cho nước \"từ trên xuống\", không phải nước \"dâng từ dưới lên\". Thợ báo giá sửa bằng bốn tháng lương.", [
    C("Thuê luật sư kiện công ty bảo hiểm", { money: -0.1, gamble: { p: 0.35, win: { money: 0.4, flags: ["nw_sued_insurer"], log: "Tòa xử điều khoản ấy mập mờ, công ty phải trả đủ." }, lose: { money: -0.1, happy: -3, flags: ["nw_sued_insurer"], log: "Bạn thua. Án phí cộng thêm vào hóa đơn sửa nhà." } } }, "Có thể đòi được, có thể mất thêm"),
    C("Tự trả tiền sửa, đổi sang hợp đồng khác", { money: -0.35, flags: ["nw_flood_cover"] }, "Mất tiền ngay, lần sau được bảo vệ"),
    C("Gom cả phố bị từ chối, nộp đơn chung", { bw: -5, rel: 4, gamble: { p: 0.5, win: { money: 0.3, flags: ["nw_claim_group", "leader"], log: "Cơ quan giám sát vào cuộc. Công ty chi trả cho cả phố." }, lose: { money: -0.3, flags: ["nw_claim_group"], log: "Đơn nằm im hai năm. Bạn tự sửa nhà trong lúc chờ." } } }, "Tốn sức, có thể đổi luật chơi cho cả phố", { tier: "sovereign" })], 1)),

  news("nw_relief_skim", [20, 70], 0.12, (c) => !!role(c, "official"), (c, N) => { const o = role(c, "official")!; return T("Thùng mì cứu trợ", `Đoàn cứu trợ để lại cho xóm ba trăm thùng mì và năm mươi bao gạo. Đến lượt chia, mỗi hộ chỉ nhận hai gói mì. ${N(o)} nói phần còn lại "để dành cho đợt sau". Tối đó bạn thấy xe nhà ${N(o)} chở mấy bao gạo về.`, [
    C("Hỏi thẳng giữa buổi họp xóm", { rel: 3, flags: ["nw_spoke_up"], memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.3, note: "bị hỏi chuyện gạo cứu trợ giữa buổi họp xóm" } }, "Cả xóm biết ơn, có người nhớ mặt bạn"),
    C("Nhận phần mình, im lặng", { money: 0.01, happy: -2, trust: { npc: o, delta: 0.1 } }, "Yên chuyện, áy náy"),
    C("Tự lập danh sách để lần sau phát tận tay", { bw: -4, agency: 0.02, flags: ["nw_relief_list", "leader"], trust: { npc: o, delta: -0.2 } }, "Mất công, có người mất quyền chia", { tier: "sovereign" })], 0, { npc: o }); }),

  news("nw_sea_rising", [25, 80], 0.08, (c) => c.poor_country, (c) => T("Biển ăn vào làng", "Mỗi mùa triều cường, biển lại lấn vào thêm vài mét. Năm nay nước mặn tràn qua ba hàng dừa cuối cùng, ngập cả nghĩa địa của làng. Chính quyền có khu tái định cư cách bốn mươi cây số, nhà xây sẵn, đất không trồng được gì.", [
    C("Dọn đến khu tái định cư", { money: -0.2, flags: ["nw_resettled"], close_doors: ["return_home"] }, "Nhà chắc chắn, mất nghề và làng"),
    C("Ở lại đắp bờ, sống chung với nước", { health: -3, money: -0.1, happy: 2, counters: { nw_stayed_coast: 1 } }, "Giữ làng, mỗi năm mất thêm một ít"),
    C("Bỏ xứ đi tìm đất sống ở nơi khác", { ...into(c, "refugee"), rel: -4, agency: 0.02, flags: ["nw_climate_leaver"] }, "Đi tay trắng, không ai hứa nơi đến", { tier: "awakened" })], 1)),
];

/* ================================================================== DỊCH BỆNH & SỨC KHỎE CỘNG ĐỒNG */
const EPIDEMIC: Storylet[] = [
  news("nw_lockdown", [18, 70], 0.3, () => true, (c) => T("Thành phố đóng cửa", "Dịch lan nhanh, chính quyền thông báo phong tỏa toàn thành phố từ nửa đêm mai. Siêu thị hết sạch mì và trứng trong vài giờ. Bạn còn đúng một ngày để quyết định sẽ ở đâu trong những tháng tới.", [
    C("Chạy về nhà bố mẹ trước giờ phong tỏa", { gamble: { p: 0.6, win: { rel: 4, money: -0.05, flags: ["nw_lockdown_home"], log: "Bạn kịp chuyến xe cuối. Ba tháng ở nhà, lần đầu cả nhà ăn cơm đủ mặt." }, lose: { health: -6, money: -0.1, flags: ["nw_lockdown_stuck"], log: "Chốt kiểm dịch giữ bạn lại ở khu cách ly dọc đường mười bốn ngày." } } }, "Có người thân bên cạnh, có thể kẹt giữa đường"),
    C("Ở lại, tích trữ đồ ăn", { money: -0.08, happy: -4, bw: -4, counters: { nw_isolated: 1 } }, "Chắc chỗ ở, cô đơn mấy tháng"),
    C("Đăng ký làm tình nguyện viên chăm người bệnh", { ...into(c, "caregiver"), health: -4, rel: 4, counters: { kind: 1 } }, "Dễ lây bệnh, một nghề có thể mở ra", { tier: "awakened" })], 1), true),

  news("nw_screen_school", [6, 12], 0.25, () => true, (c) => T("Lớp học trong màn hình", `Trường đóng cửa vì dịch. ${c.poor_country ? "Cả lớp học qua chiếc điện thoại cũ của mẹ, màn hình nứt một góc, sóng chập chờn." : "Ba anh em chia nhau chiếc máy tính bảng duy nhất trong nhà, mỗi đứa hai tiếng."} Cô giáo gọi tên bạn ba lần mà tiếng không tới.`, [
    C("Ngồi học đủ giờ dù chỉ nghe được nửa câu", { know: 2, happy: -3, counters: { nw_screen_kid: 1 } }, "Không tụt bài, chán đến phát khóc"),
    C("Tắt camera, ra sân chơi với em", { know: -3, happy: 3, rel: 2, flags: ["nw_lost_year"] }, "Vui, tụt bài cả năm"),
    C("Tự chép bài từ sách, nhờ anh hàng xóm giảng", { know: 4, bw: -3, flags: ["nw_self_taught"] }, "Mệt, nhưng học được cách tự học", { tier: "awakened" })], 0)),

  news("nw_shop_shut", [25, 65], 0.15, (c) => f(c, "own_business") || f(c, "job_market") || f(c, "shop_active"), (c) => T("Cửa tiệm kéo rèm", "Lệnh đóng cửa hàng không thiết yếu kéo sang tháng thứ ba. Tiền thuê mặt bằng vẫn phải trả đủ vào ngày mùng năm. Hàng trong kho bắt đầu hết hạn.", [
    C("Vay tiền giữ mặt bằng, chờ mở cửa lại", { custom: "borrow:0.4", gamble: { p: 0.5, win: { money: 0.3, flags: ["nw_kept_shop"], log: "Mở cửa lại, khách quen kéo đến như chưa từng đi vắng." }, lose: { money: -0.1, flags: ["nw_kept_shop"], log: "Phong tỏa kéo thêm nửa năm. Khoản vay thành gánh nặng nhiều năm." } } }, "Giữ được tiệm, có thể chìm nợ"),
    C("Trả mặt bằng, chuyển sang bán qua mạng", { ...into(c, "ecommerce"), money: -0.1, flags: ["nw_shop_online"] }, "Mất chỗ quen, tiệm nằm trong điện thoại"),
    C("Tự đi giao hàng tận nhà cho khách quen", { ...into(c, "shipper"), health: -2, money: 0.05, flags: ["nw_shop_delivery"] }, "Có tiền mỗi ngày, nghề cũ dần buông")], 0)),

  news("nw_parent_ward", [30, 65], 0.15, (c) => c.parent_old && !!parent(c), (c, N) => { const p = parent(c)!; return T("Giường bệnh thứ một trăm", `${N(p)} sốt cao giữa đỉnh dịch. Bệnh viện gần nhà kê giường ra tận hành lang, y tá bảo phải chờ. Một người lạ đứng ở cổng nói có cách "lo" được một giường trong phòng riêng.`, [
    C("Đưa tiền cho người đứng ở cổng", { money: -0.3, trust: { npc: p, delta: 0.2 }, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "chạy giường bệnh giữa mùa dịch" } }, "Có giường ngay, mang theo một bí mật"),
    C("Xếp hàng chờ như mọi người", { gamble: { p: 0.6, win: { trust: { npc: p, delta: 0.1 }, log: `Sau một đêm ngồi ghế nhựa, ${N(p)} có giường. Tuần sau thì xuất viện.` }, lose: { happy: -6, flags: ["nw_ward_wait"], log: `${N(p)} nằm hành lang ba ngày. Khỏi bệnh, nhưng yếu hẳn đi.` } } }, "Đúng lượt, có thể quá muộn"),
    C("Đưa về nhà, tự chăm theo hướng dẫn của bác sĩ", { bw: -6, health: -3, money: -0.05, memory: { npc: p, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "tự chăm bệnh ở nhà suốt mùa dịch" } }, "Gần nhau, bạn kiệt sức", { longterm: true })], 1, { npc: p }); }),

  news("nw_vaccine_queue", [25, 80], 0.2, () => true, (c, N) => { const p = parent(c); return T("Hàng người trước trạm tiêm", "Đợt vắc-xin đầu tiên về, mỗi phường chỉ có vài trăm liều. Hàng người xếp từ bốn giờ sáng. Ngoài chợ, người ta đồn tiêm vào sẽ \"yếu người mấy năm\".", [
    C("Xếp hàng từ sớm để tiêm", { health: 3, bw: -2, flags: ["nw_vaccinated"] }, "Được bảo vệ sớm, mất một buổi"),
    p && c.parent_old ? C(`Nhường suất của mình cho ${N(p)}`, { health: -1, trust: { npc: p, delta: 0.2 } }, "Người già an toàn trước, bạn chờ thêm")
      : C("Chờ đợt sau cho đỡ đông", { health: -1, happy: 1, counters: { nw_waited: 1 } }, "Đỡ mệt, hở ra mấy tháng"),
    C("Đi từng nhà, đưa người già trong xóm đi tiêm", { rel: 4, bw: -5, flags: ["nw_vax_helper"] }, "Mất mấy ngày công, cả xóm được che chắn", { tier: "awakened" })], 0, p && c.parent_old ? { npc: p } : {}); }),

  news("nw_mosquito", [10, 60], 0.15, (c) => c.poor_country, (c) => c.age < 18
    ? T("Mùa muỗi vằn", "Cả khu có mười mấy ca sốt xuất huyết trong một tháng. Đứa bé nhà bên vừa phải nhập viện. Người lớn rủ nhau đi lật lu, đổ nước đọng trong lốp xe cũ.", [
      C("Đi theo người lớn dọn bãi", { rel: 3, health: -1, flags: ["nw_cleanup"] }, "Mỏi lưng, được người lớn khen"),
      C("Ở nhà ngủ trong màn", { health: 1, happy: -1 }, "Yên thân, bỏ lỡ một buổi cả xóm")], 0)
    : T("Mùa muỗi vằn", "Cả khu có mười mấy ca sốt xuất huyết trong một tháng. Đứa bé nhà bên vừa phải nhập viện. Lu nước, lốp xe cũ, vỏ dừa nằm khắp các bãi đất trống.", [
      C("Bỏ một ngày công, rủ cả xóm dọn bãi", { money: -0.02, rel: 4, flags: ["nw_cleanup", "leader"] }, "Mất ngày công, cả khu bớt muỗi", { tier: "awakened" }),
      C("Mua màn, đóng cửa lo nhà mình", { money: -0.02, health: 1, counters: { nw_guarded: 1 } }, "Nhà mình yên, xóm vẫn thế"),
      C("Kệ, năm nào chẳng có muỗi", { gamble: { p: 0.7, win: { log: "Mùa mưa qua, nhà bạn không ai ốm." }, lose: { health: -10, money: -0.1, log: "Bạn sốt cao năm ngày, phải vào viện truyền dịch." } } }, "Không mất gì, hoặc mất cả tuần")], 0)),

  news("nw_mask_hoard", [20, 60], 0.1, () => true, () => T("Thùng khẩu trang trong kho", "Đầu mùa dịch, bạn tình cờ có ba thùng khẩu trang mua từ trước. Giá ngoài chợ giờ gấp mười lần. Một người quen hỏi mua cả ba thùng, trả tiền mặt ngay.", [
    C("Bán cả ba thùng giá cao", { money: 0.2, flags: ["nw_sold_masks"], counters: { honest: -1 } }, "Lời gấp mười, mang tiếng"),
    C("Bán lẻ đúng giá cũ cho người trong xóm", { money: 0.02, rel: 3, counters: { honest: 1 } }, "Lời ít, giữ được mặt"),
    C("Mang đến phát miễn phí ở bệnh viện", { money: -0.02, rel: 5, flags: ["nw_gave_masks"] }, "Lỗ vốn, được tiếng tử tế", { tier: "awakened" })], 1)),

  news("nw_frontline", [24, 60], 0.2, (c) => f(c, "job_health"), (c) => T("Tuyến đầu", "Khoa của bạn thành khu điều trị bệnh truyền nhiễm. Ca trực mười hai tiếng trong bộ đồ bảo hộ kín mít, không dám uống nước vì không thể đi vệ sinh. Ba tháng rồi bạn chưa về nhà.", [
    C("Ở lại đến hết đợt dịch", { health: -6, rel: -3, income_mult: 1.1, flags: ["nw_frontline"] }, "Được trọng, kiệt sức, xa nhà"),
    C("Xin chuyển về khoa cũ", { happy: 2, counters: { nw_left_front: 1 } }, "Giữ sức, đồng nghiệp gánh thay"),
    C("Nhận lời đi vùng dịch xa nhất, không thêm lương", { ...into(c, "aid_doctor"), health: -4, agency: 0.02, flags: ["nw_remote_ward"] }, "Hy sinh nhiều hơn, một con đường khác", { tier: "awakened" })], 0)),

  news("nw_herd_cull", [20, 70], 0.15, (c) => c.farmer || f(c, "job_farm"), () => T("Lệnh tiêu hủy đàn", "Dịch bệnh gia súc lan đến xã bên. Cán bộ thú y nói phải khai báo, đàn nào có con bệnh thì tiêu hủy, đền bù nửa giá thị trường. Thương lái đứng ngoài ngõ trả rẻ, mua cả đàn ngay trong đêm.", [
    C("Khai báo, chờ kiểm tra", { gamble: { p: 0.5, win: { money: 0.2, flags: ["nw_herd_clean"], log: "Đàn của bạn không nhiễm. Sau dịch, giá thịt tăng gấp rưỡi." }, lose: { money: -0.3, flags: ["nw_herd_culled"], log: "Có hai con dương tính. Cả đàn bị tiêu hủy." } } }, "Làm đúng, có thể mất trắng"),
    C("Bán chạy cả đàn cho thương lái", { money: -0.1, flags: ["nw_sold_sick_herd"], counters: { honest: -1 } }, "Vớt được ít tiền, bệnh có thể theo đàn đi xa"),
    C("Cùng cả xóm lập chốt, không cho thương lái vào", { money: -0.05, rel: 4, bw: -4, flags: ["nw_village_guard", "leader"] }, "Mất công, cả xóm có cơ hội thoát dịch", { tier: "sovereign" })], 0)),

  news("nw_school_outbreak", [6, 11], 0.12, () => true, () => T("Lớp học vắng một nửa", "Một đợt sởi lan trong trường. Lớp bạn bốn mươi em giờ còn mười chín. Mẹ hỏi bạn có chịu đi tiêm mũi nhắc không: trạm y tế đông lắm, mà kim thì to.", [
    C("Gật đầu đi tiêm dù sợ kim", { health: 3, happy: -1, flags: ["nw_kid_shot"] }, "Đau một chút, yên cả mùa"),
    C("Khóc đòi ở nhà", { gamble: { p: 0.6, win: { happy: 2, log: "Đợt dịch qua, bạn không bị lây." }, lose: { health: -8, know: -2, flags: ["nw_had_measles"], log: "Bạn sốt phát ban hai tuần, nghỉ học gần một tháng." } } }, "Khỏi đau kim, có thể ốm nặng"),
    C("Gọi điện kể bài cho bạn cùng bàn đang ốm", { rel: 3, know: 1, bw: -2, counters: { kind: 1 } }, "Mất giờ chơi, có một người bạn thân")], 0)),

  news("nw_well_poison", [18, 70], 0.1, () => true, (c) => T("Nước giếng có mùi lạ", "Từ khi xưởng nhuộm mở phía đầu sông, nước giếng nhà bạn có mùi tanh, áo trắng phơi lâu thành vàng. Trong xóm có ba người mắc bệnh lạ trong một năm. Xưởng trả lương cho một phần ba thanh niên trong làng.", [
    C("Mua máy lọc, lo cho nhà mình", { money: -0.08, health: 2, counters: { nw_filter: 1 } }, "Tốn tiền, nhà mình yên"),
    C("Lấy mẫu nước, gửi đơn lên cơ quan môi trường", { ...into(c, "environmentalist"), bw: -5, rel: -2, flags: ["nw_water_case"] }, "Mất lòng người làm ở xưởng, có thể mở một nghề", { tier: "awakened" }),
    C("Im lặng, cháu trong nhà đang làm ở xưởng", { money: 0.03, health: -4, happy: -2 }, "Giữ chén cơm, uống nước bẩn")], 0)),
];

/* ================================================================== CÚ SỐC KINH TẾ */
const ECONOMY: Storylet[] = [
  news("nw_inflation", [20, 80], 0.25, () => true, (c) => T("Giá gạo lên từng tuần", `Giá gạo tháng này gấp đôi tháng trước, lương thì vẫn vậy. Hàng xóm khuân cả bao về chất góc nhà. ${vn(c) ? "Tiệm vàng đầu phố đông hơn chợ." : "Ai có chút tiền đều tìm cách đổi sang thứ gì đó giữ giá."} Tiền tiết kiệm của bạn mỗi tuần mua được ít hơn một chút.`, [
    C("Rút tiết kiệm mua gạo, dầu tích trữ", { money: -0.15, health: 1, flags: ["nw_hoarded"] }, "Không lo đói, tiền nằm im trong kho"),
    C("Đổi tiền tiết kiệm sang vàng", { gamble: { p: 0.6, win: { money: 0.2, flags: ["nw_gold_hedge"], log: "Ba năm sau, số vàng ấy giữ được giá trị gấp ba số tiền để nguyên." }, lose: { money: -0.1, flags: ["nw_gold_hedge"], log: "Giá vàng đảo chiều ngay tháng sau. Bạn bán lỗ lúc cần tiền." } } }, "Giữ được giá trị, hoặc mua đúng đỉnh"),
    C("Tìm thêm việc làm buổi tối", { money: 0.1, health: -3, bw: -4, counters: { nw_side_job: 1 } }, "Thêm thu nhập, hết thời gian")], 0), true),

  news("nw_pocket_money", [8, 15], 0.2, () => true, () => T("Tờ tiền mất giá", "Đầu năm, tờ tiền mẹ cho ăn sáng mua được một ổ bánh mì kẹp trứng. Giờ nó chỉ đủ một ổ không. Đến cuối năm, ổ bánh mì nhỏ đi một nửa.", [
    C("Nhịn ăn sáng, để dành tiền", { health: -2, money: 0.01, counters: { save: 1 } }, "Có tiền heo đất, bụng đói cả buổi"),
    C("Phụ bà bán hàng sau giờ học lấy công", { money: 0.02, know: -1, flags: ["nw_kid_worked"] }, "Có tiền riêng, ít thời gian học"),
    C("Kể với mẹ, xin mang cơm nắm đi học", { rel: 2, happy: -1, counters: { nw_lunchbox: 1 } }, "Đủ no, bị bạn trêu")], 0)),

  news("nw_bank_run", [25, 80], 0.12, (c) => c.savings > 0, () => T("Hàng người trước cửa ngân hàng", "Sáng nay có tin đồn ngân hàng bạn gửi tiền sắp mất khả năng chi trả. Đến trưa, hàng người đã kéo dài hết dãy phố. Giám đốc chi nhánh đứng trên bậc thềm cầm loa nói tiền của bà con vẫn an toàn.", [
    C("Xếp hàng rút hết tiền", { money: -0.03, bw: -3, flags: ["nw_cash_home"] }, "Chắc ăn, mất lãi, tiền nằm dưới gầm giường"),
    C("Giữ nguyên, tin lời giám đốc", { gamble: { p: 0.75, win: { happy: 1, counters: { nw_trusted_bank: 1 }, log: "Một tuần sau mọi chuyện lắng xuống. Ngân hàng được sáp nhập vào một ngân hàng lớn hơn." }, lose: { money: -0.6, flags: ["nw_bank_lost"], log: "Ngân hàng sụp. Bảo hiểm tiền gửi chỉ trả lại một phần." } } }, "Giữ lãi, đánh cược cả khoản gửi"),
    C("Rút một nửa, để một nửa", { money: -0.01, bw: -2, counters: { nw_split_risk: 1 } }, "Không mất hết, không giữ trọn")], 1), true),

  news("nw_devaluation", [22, 70], 0.15, (c) => c.poor_country, (c) => T("Đồng tiền mất giá qua đêm", "Sáng thứ Hai, ngân hàng trung ương tuyên bố phá giá đồng nội tệ. Hàng nhập khẩu tăng giá ngay trong ngày, tiền tiết kiệm của bạn chỉ còn đáng một nửa so với tuần trước. Ai có việc ở nước ngoài thì bỗng thấy lương mình gấp đôi.", [
    C("Nộp hồ sơ đi làm ở nước ngoài", { ...into(c, "labor_export"), rel: -3, flags: ["nw_went_abroad"] }, "Lương ngoại tệ, xa nhà nhiều năm"),
    C("Thắt lưng buộc bụng, chờ giá ổn lại", { money: -0.1, happy: -3, counters: { nw_tightened: 1 } }, "Ở yên, nghèo đi từng tháng"),
    C("Chuyển sang buôn hàng nội thay hàng nhập", { money: -0.1, gamble: { p: 0.5, win: { income_mult: 1.2, flags: ["nw_local_goods"], log: "Hàng nhập đắt lên, khách quay sang hàng của bạn." }, lose: { money: -0.1, flags: ["nw_local_goods"], log: "Ai cũng nghĩ ra cùng một ý. Chợ ngập hàng nội." } } }, "Đón gió đổi chiều, có thể trễ chân", { tier: "awakened" })], 1)),

  news("nw_land_fever", [25, 60], 0.2, () => true, (c) => T("Cơn sốt đất", `Cả thị trấn chỉ nói chuyện đất. Lô đất ven đường mới mở năm ngoái giờ giá gấp ba, người ta mua bán bằng ${vn(c) ? "giấy tay" : "hợp đồng viết vội"} ngay trong quán cà phê. Ngân hàng sẵn sàng cho vay bảy phần mười nếu bạn mua thêm một lô.`, [
    C("Vay ngân hàng mua thêm một lô", { custom: "borrow:1.2", flags: ["nw_land_debt"], gamble: { p: 0.4, win: { money: 1.5, log: "Bạn bán lại sau tám tháng, lãi gấp đôi số vốn." }, lose: { money: -0.5, log: "Cơn sốt dừng đột ngột. Lô đất nằm im, lãi ngân hàng thì không." } } }, "Có thể đổi đời, có thể ôm nợ nhiều năm"),
    C("Đứng ngoài, giữ tiền mặt", { happy: -2, counters: { nw_sat_out: 1 } }, "An toàn, nhìn người khác giàu lên"),
    C("Theo người quen đi làm môi giới đất", { ...into(c, "real_estate"), bw: -3, flags: ["nw_broker_start"] }, "Kiếm từ cơn sốt, sống theo nhịp của nó")], 1)),

  news("nw_bubble_pop", [28, 70], 0.3, (c) => f(c, "nw_land_debt") || c.debt_ratio > 1.5, (c) => T("Bong bóng xì hơi", `Thị trường nhà đất đóng băng. ${f(c, "nw_land_debt") ? "Lô đất bạn vay tiền mua" : "Những lô đất từng giành nhau"} giờ rao giảm bốn mươi phần trăm vẫn không ai hỏi. Ngân hàng gửi thư báo lãi suất thả nổi tăng từ tháng sau.`, [
    C("Bán cắt lỗ, trả nợ cho xong", { money: -0.6, happy: -4, unflags: ["nw_land_debt"], flags: ["nw_cut_loss"] }, "Mất nhiều, nhẹ người"),
    C("Gồng lãi, chờ thị trường hồi", { counters: { nw_held_on: 1 }, gamble: { p: 0.45, win: { money: 0.5, log: "Bốn năm sau giá hồi. Bạn bán ra, lãi chút ít." }, lose: { money: -0.8, health: -4, log: "Thị trường không hồi. Ngân hàng phát mại tài sản." } } }, "Có thể hồi vốn, có thể mất cả"),
    C("Xin giãn nợ, cho thuê đất trồng rau", { custom: "restructure", money: -0.1, bw: -4, flags: ["nw_restructured"] }, "Sống chậm cùng khoản nợ, giữ được đất", { tier: "awakened" })], 0)),

  news("nw_factory_close", [20, 55], 0.2, (c) => c.worker || f(c, "job_factory"), (c) => T("Cổng nhà máy khóa xích", "Sáng thứ Hai, cổng nhà máy khóa xích, thông báo dán trên cột: công ty ngừng hoạt động, lương tháng cuối \"sẽ thanh toán sau\". Hai nghìn công nhân đứng ngoài cổng. Phòng trọ của bạn còn hạn hai tuần.", [
    C("Đăng ký đi lao động nước ngoài", { ...into(c, "labor_export", "job_lose"), money: -0.15, flags: ["nw_plant_closed"] }, "Phí đi cao, lương gấp mấy lần"),
    C("Mua xe cũ chạy giao hàng", { ...into(c, "shipper", "job_lose"), money: -0.08, flags: ["nw_plant_closed"] }, "Có tiền ngay, nắng mưa ngoài đường"),
    C("Nhận trợ cấp, đi học nghề miễn phí", { custom: "job_lose", know: 4, money: -0.05, flags: ["nw_plant_closed", "nw_retrained"] }, "Nghèo mấy tháng, có nghề mới", { longterm: true })], 0), true),

  news("nw_stock_crash", [25, 70], 0.15, (c) => c.savings > 0 || c.rich, (c) => T("Bảng điện đỏ rực", "Chỉ số chứng khoán mất một phần ba trong hai tuần. Ở chỗ làm, người ta thì thầm về những tài khoản bị bán giải chấp. Anh đồng nghiệp ngồi cạnh bạn ba hôm nay không đi làm.", [
    C("Dồn tiền tiết kiệm mua vào lúc mọi người bán", { money: -0.3, gamble: { p: 0.55, win: { ...into(c, "investor"), money: 0.9, flags: ["nw_bought_dip"], log: "Hai năm sau thị trường hồi. Số cổ phiếu mua đáy thành vốn liếng đầu tiên của bạn." }, lose: { money: -0.2, flags: ["nw_bought_dip"], log: "Thị trường giảm thêm một năm nữa. Bạn bán ra lúc cần tiền." } } }, "Có thể mua được đáy, có thể bắt dao rơi"),
    C("Đứng ngoài, gửi tiết kiệm", { happy: -1, counters: { save: 1 } }, "Yên tâm, bỏ lỡ cơ hội nếu có"),
    C("Gọi hỏi thăm anh đồng nghiệp", { rel: 3, bw: -2, counters: { kind: 1 } }, "Mất một buổi tối, có thêm một người bạn")], 1)),

  news("nw_stock_mania", [22, 65], 0.15, (c) => c.econ_phase !== "crisis", (c) => T("Ai cũng nói chuyện mã cổ phiếu", "Cô bán nước đầu ngõ cũng mở tài khoản chứng khoán. Ở đám cưới, người ta khoe lãi gấp đôi trong ba tháng. Một đồng nghiệp đưa bạn một \"mã sắp lên\", dặn chỉ chia cho người thân.", [
    C("Dồn nửa tiền tiết kiệm vào mã ấy", { gamble: { p: 0.35, win: { money: 0.4, flags: ["nw_hot_tip"], log: "Mã ấy tăng gấp rưỡi. Bạn bán đúng lúc, nhờ may hơn nhờ hiểu." }, lose: { money: -0.4, flags: ["nw_hot_tip"], log: "Mã ấy bị điều tra làm giá. Giá rơi một mạch." } } }, "Có thể lãi nhanh, có thể mất nửa vốn"),
    C("Đứng ngoài, không đụng vào", { happy: -1, counters: { nw_sat_out: 1 } }, "Giữ vốn, nghe người ta khoe cả năm"),
    C("Bỏ một năm học bài bản về đầu tư", { ...into(c, "investor"), know: 5, bw: -4, flags: ["nw_study_invest"] }, "Chậm, tốn sức, hiểu mình đang mua gì", { tier: "awakened", longterm: true })], 1)),

  news("nw_gold_queue", [25, 75], 0.15, () => true, (c) => T("Xếp hàng mua vàng", `Giá vàng lập đỉnh mới ba tuần liền. Trước tiệm vàng lớn nhất phố, người ta xếp hàng từ năm giờ sáng, mỗi người chỉ được mua ${vn(c) ? "một chỉ" : "một lượng nhỏ"}. Ai đứng sau cũng sợ hết hàng.`, [
    C("Xếp hàng mua, dù đắt", { gamble: { p: 0.45, win: { money: 0.1, flags: ["nw_gold_bought"], log: "Giá còn lên thêm một năm. Bạn mừng vì đã đứng hàng." }, lose: { money: -0.1, flags: ["nw_gold_bought"], log: "Tuần sau giá rơi. Số vàng mua đỉnh nằm trong tủ nhiều năm." } } }, "Có thể giữ giá trị, có thể mua đỉnh"),
    c.married ? C("Bán vàng cưới lúc giá đỉnh", { money: 0.3, happy: -2, flags: ["nw_sold_wedding_gold"], ...tr(role(c, "spouse"), -0.1) }, "Chốt lời lớn, mất kỷ vật ngày cưới")
      : C("Bán số vàng bà để lại lúc giá đỉnh", { money: 0.3, happy: -2, flags: ["nw_sold_heirloom_gold"] }, "Chốt lời lớn, mất kỷ vật của bà"),
    C("Đứng ngoài nhìn hàng người", { counters: { nw_sat_out: 1 } }, "Không lời, không lỗ")], 2)),

  news("nw_gold_rumor", [18, 45], 0.08, (c) => c.poor_country, (c) => T("Tin đồn có vàng trên núi", "Người ta đồn ở dãy núi phía tây có người đãi được vàng. Chỉ một tháng, cả nghìn người kéo lên, lán trại mọc dọc suối. Anh họ bạn về làng với chiếc xe máy mới, rủ bạn đi cùng.", [
    C("Bỏ việc theo anh họ lên núi", { ...into(c, "miner"), health: -4, money: -0.05, flags: ["nw_gold_camp"] }, "Có thể đổi đời, đổi bằng sức khỏe"),
    C("Mở quán cơm dưới chân núi cho thợ đào", { money: -0.15, gamble: { p: 0.6, win: { money: 0.5, flags: ["nw_camp_kitchen"], log: "Thợ đào người được người mất, quán cơm thì ngày nào cũng đông." }, lose: { money: -0.1, flags: ["nw_camp_kitchen"], log: "Hai tháng sau có lệnh giải tán bãi vàng. Quán đóng cửa." } } }, "Kiếm từ cơn sốt, không cược thân mình", { tier: "awakened" }),
    C("Ở lại làng", { happy: -1, counters: { nw_sat_out: 1 } }, "Yên thân, lỡ một giấc mơ")], 2)),

  news("nw_office_layoff", [25, 55], 0.15, (c) => c.has_job && (f(c, "job_office") || c.has_degree), (c) => T("Cuộc họp mười lăm phút", "Thư mời họp gửi lúc tám giờ sáng, cuộc họp kéo dài mười lăm phút. Công ty cắt một phần năm nhân sự vì \"thị trường khó khăn\". Bạn có hai tháng lương bồi thường và một thùng các-tông đựng đồ trên bàn.", [
    C("Xin việc khác ngay, nhận lương thấp hơn", { custom: "job_lose|job_new", income_mult: 0.85, flags: ["nw_laid_off"] }, "Có việc liền, xuống một bậc"),
    C("Dùng tiền bồi thường mở công ty nhỏ", { ...into(c, "startup", "job_lose"), money: -0.3, agency: 0.02, flags: ["nw_laid_off"] }, "Tự làm chủ, có thể mất trắng", { tier: "sovereign" }),
    C("Nghỉ ba tháng đi học nghề mới", { custom: "job_lose", know: 5, money: -0.15, flags: ["nw_laid_off", "nw_reskilled"] }, "Hụt tiền, có nghề cho mười năm tới", { longterm: true })], 0)),

  news("nw_crisis_grad", [21, 25], 0.2, (c) => c.has_degree && c.econ_phase !== "boom", () => T("Tốt nghiệp giữa khủng hoảng", "Bạn nhận bằng đúng năm cả nước cắt giảm. Năm mươi hồ sơ gửi đi, ba lời hồi âm, một lời mời làm nhân viên bán hàng với mức lương bằng nửa lời hứa hồi nhập học.", [
    C("Nhận việc trái ngành để có lương", { custom: "job_new", income_mult: 0.9, money: 0.05, flags: ["nw_offtrack_job"] }, "Có thu nhập, lệch khỏi ngành học"),
    C("Xin học bổng học tiếp ở nước ngoài", { gamble: { p: 0.35, win: { ...become("student_abroad"), log: "Một trường ở nước ngoài nhận bạn với học bổng nửa phần." }, lose: { happy: -3, flags: ["nw_scholarship_fail"], log: "Hồ sơ trượt. Một năm trôi qua." } } }, "Có thể bay xa, có thể mất một năm"),
    C("Về quê phụ việc nhà, chờ thời", { money: -0.02, rel: 3, happy: -2, counters: { nw_waited: 1 } }, "Gần nhà, thấy mình tụt lại")], 0)),

  news("nw_dad_jobless", [7, 15], 0.15, (c) => !!role(c, "father"), (c, N) => { const d = role(c, "father")!; return T("Bố ở nhà buổi sáng", `Dạo này sáng nào ${N(d)} cũng ở nhà, ngồi dò báo rao vặt. Mẹ cắt khoản học thêm của bạn, bữa cơm ít thịt đi. Tối qua bạn nghe bố mẹ nói chuyện nhỏ giọng đến khuya.`, [
    C("Tự xin thôi học thêm trước khi mẹ nói", { know: -2, rel: 2, flags: ["nw_kid_sacrifice"] }, "Nhà nhẹ gánh, bạn tụt bài"),
    C(`Hỏi thẳng ${N(d)} chuyện gì đang xảy ra`, { happy: -2, know: 1, counters: { nw_asked_dad: 1 } }, "Biết sự thật, mang nỗi lo của người lớn"),
    C("Giả vờ không biết, cố học cho tốt", { know: 3, happy: -3, bw: -3, counters: { nw_hid_worry: 1 } }, "Điểm cao, lo lắng giấu trong lòng")], 2, { npc: d }); }),

  news("nw_rent_hike", [20, 45], 0.15, (c) => !c.rich, () => T("Chủ nhà tăng giá thuê", "Tin nhắn của chủ nhà đến lúc mười giờ đêm: từ tháng sau tiền thuê tăng một nửa, \"giá chung cả khu rồi\". Cả dãy trọ hai mươi phòng đều nhận cùng một tin nhắn.", [
    C("Chuyển ra ngoại ô, đi làm xa hơn", { money: -0.03, health: -2, bw: -3, flags: ["nw_moved_out"] }, "Đỡ tiền, mất hai tiếng mỗi ngày"),
    C("Ở ghép với một người bạn", { money: -0.02, happy: -2, counters: { nw_shared_room: 1 } }, "Chia tiền, mất chỗ riêng"),
    C("Gom chữ ký cả dãy, cùng thương lượng", { gamble: { p: 0.5, win: { money: 0.02, rel: 4, flags: ["nw_tenant_voice", "leader"], log: "Chủ nhà chịu tăng một phần năm thay vì một nửa." }, lose: { money: -0.1, flags: ["nw_tenant_voice"], log: "Chủ nhà không gia hạn với người đứng đầu danh sách." } } }, "Có thể giữ giá cho cả dãy, có thể mất phòng", { tier: "sovereign" })], 0)),

  news("nw_milk_shortage", [24, 45], 0.1, (c) => c.kids_alive > 0, () => T("Kệ sữa trống trơn", "Một đợt thu hồi sữa bột vì nhiễm khuẩn, cộng thêm đứt nguồn hàng, làm các kệ sữa trống trơn. Hộp sữa con bạn đang uống được bán lại ở chợ đen với giá gấp bốn.", [
    C("Mua giá gấp bốn để con khỏi đổi sữa", { money: -0.08, happy: 1, counters: { nw_black_market: 1 } }, "Con yên, ví thủng"),
    C("Chuyển sang loại khác theo lời bác sĩ", { bw: -3, happy: -2, flags: ["nw_switched_milk"] }, "Đỡ tiền, con quấy cả tháng"),
    C("Lập nhóm bố mẹ trong khu, chia nhau từng hộp", { rel: 5, bw: -4, flags: ["nw_parent_group", "leader"] }, "Mất thời gian, không nhà nào thiếu", { tier: "sovereign" })], 1)),

  news("nw_loan_recall", [28, 60], 0.12, (c) => f(c, "own_business") || c.debt_ratio > 0.5, () => T("Ngân hàng gọi nợ trước hạn", "Ngân hàng siết tín dụng, gửi thư yêu cầu bạn trả khoản vay trong chín mươi ngày. Ngoài chợ, người ta chỉ nhau đến một \"chỗ cho vay nhanh\", không cần thế chấp, lãi tính theo ngày.", [
    C("Bán xe, bán đồ có giá để trả", { money: -0.4, happy: -3, flags: ["nw_sold_assets"] }, "Sạch nợ, mất của"),
    C("Vay chỗ cho vay nhanh để đảo nợ", { custom: "borrow:0.5", flags: ["nw_loan_shark_debt"], gamble: { p: 0.4, win: { log: "Ba tháng sau ngân hàng nới tín dụng. Bạn vay lại được, trả xong khoản lãi ngày." }, lose: { money: -0.4, health: -4, log: "Lãi ngày đẻ ra lãi. Người đòi nợ bắt đầu đến tận nhà." } } }, "Qua được tháng này, có thể sa lầy"),
    C("Xin ngân hàng cơ cấu lại khoản nợ", { custom: "restructure", income_mult: 0.95, bw: -5, flags: ["nw_restructured"] }, "Giấy tờ mệt mỏi, trả chậm mà chắc", { tier: "awakened" })], 2)),

  news("nw_crop_glut", [20, 70], 0.2, (c) => c.farmer || f(c, "job_farm"), (c) => T("Trái chín không ai mua", `Vụ này cả vùng được mùa, nhưng ${vn(c) ? "cửa khẩu ùn ứ, thương lái biến mất" : "cảng ngừng nhận hàng, người thu mua biến mất"}. Giá trái cây còn một phần mười năm ngoái, không đủ trả tiền công hái. Trái chín rụng đầy gốc.`, [
    C("Để trái rụng, đỡ tiền công", { money: -0.2, happy: -4, counters: { nw_wasted_crop: 1 } }, "Không lỗ thêm, nhìn công cả năm mục đi"),
    C("Thuê người hái, bán rẻ ven đường", { money: -0.12, rel: 3, health: -2, counters: { nw_roadside: 1 } }, "Thu được chút ít, mệt cả tháng"),
    C("Tự phơi sấy, đóng gói bán qua mạng", { ...into(c, "ecommerce"), money: -0.1, bw: -5, flags: ["nw_dried_fruit"] }, "Mất vốn và sức, có thể có nghề mới", { tier: "awakened", longterm: true })], 1)),

  news("nw_pension_late", [62, 85], 0.15, () => true, (c, N) => { const k = role(c, "child"); return T("Lương hưu chậm hai tháng", "Quỹ hưu trí thông báo chậm chi trả vì \"cân đối nguồn\". Hai tháng rồi bạn sống bằng chút tiền tiết kiệm và mấy luống rau sau nhà. Thuốc huyết áp hết từ tuần trước.", [
    k ? C(`Gọi điện nhờ ${N(k)} gửi tiền`, { money: 0.1, happy: -2, trust: { npc: k, delta: 0.1 } }, "Có tiền ngay, thấy mình thành gánh nặng")
      : C("Vay tạm hàng xóm", { money: 0.08, happy: -2, counters: { nw_borrowed_neighbor: 1 } }, "Có tiền ngay, mang một món nợ ân tình"),
    C("Ra đầu ngõ bán nước, bán rau", { ...into(c, "street_vendor"), money: 0.06, health: -2, flags: ["nw_old_vendor"] }, "Tự lo được, nắng gió tuổi già"),
    C("Hoãn mua thuốc, chờ lương về", { health: -6, money: 0.02, counters: { nw_skipped_meds: 1 } }, "Giữ tiền, huyết áp không chờ")], 0, k ? { npc: k } : {}); }),

  news("nw_friend_loan", [25, 65], 0.12, (c) => !!role(c, "childhood_friend") && c.econ_phase !== "boom", (c, N) => { const fr = role(c, "childhood_friend")!; return T("Người bạn cũ hỏi vay", `${N(fr)} gọi cho bạn lúc nửa đêm. Xưởng nhỏ của ${N(fr)} vỡ nợ trong đợt suy thoái, người đòi nợ đến tận nhà. ${N(fr)} cần một khoản bằng ba tháng thu nhập của bạn, hứa trả trong một năm.`, [
    C("Cho vay đủ số", { money: -0.25, memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "cho vay giữa mùa vỡ nợ" } }, "Giữ bạn, có thể mất tiền"),
    C("Từ chối, nói thật là không có", { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.3, note: "từ chối cho vay lúc vỡ nợ" } }, "Giữ tiền, mất một người bạn"),
    C("Cho một phần, không đòi lại", { money: -0.08, happy: 1, trust: { npc: fr, delta: 0.15 } }, "Mất ít, nói rõ giới hạn", { tier: "awakened" })], 2, { npc: fr }); }),
];

/* ================================================================== LỪA ĐẢO LAN TRONG XÃ HỘI */
const SCAM: Storylet[] = [
  news("nw_mlm_friend", [20, 55], 0.2, (c) => !!role(c, "childhood_friend"), (c, N) => { const fr = role(c, "childhood_friend")!; return T("Buổi hội thảo cơ hội", `${N(fr)} mời bạn đến một "buổi hội thảo về tự do tài chính" ở khách sạn. Diễn giả mặc vest trắng kể chuyện từ bán rau thành chủ xe sang. Muốn làm "nhà phân phối", bạn phải mua gói hàng bằng hai tháng lương, rồi rủ thêm người khác.`, [
    C("Mua gói hàng, vào hệ thống", { money: -0.2, gamble: { p: 0.15, win: { money: 0.3, flags: ["nw_mlm_in"], log: "Bạn lên được cấp trên nhờ kéo thêm người, và bắt đầu ngại gặp họ." }, lose: { money: -0.1, rel: -4, flags: ["nw_mlm_in"], log: "Hàng chất đầy góc nhà. Bạn bè thôi nghe máy khi bạn gọi." } } }, "Hy vọng làm giàu, thường là mất tiền và bạn"),
    C("Từ chối thẳng", { memory: { npc: fr, tag: "HUMILIATED_ME", weight: -0.15, note: "bị từ chối giữa buổi hội thảo" } }, "Giữ tiền, bạn ấy giận"),
    C("Mua một hộp cho vừa lòng, nói rõ chỉ một lần", { money: -0.02, trust: { npc: fr, delta: 0.05 } }, "Mất chút tiền, giữ hòa khí"),
    C("Ngồi tính cho bạn ấy xem ai thực sự có lãi", { bw: -3, gamble: { p: 0.4, win: { memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "kéo ra khỏi đường dây bán hàng đa cấp" }, log: `Một tháng sau, ${N(fr)} rút khỏi hệ thống và cảm ơn bạn.` }, lose: { trust: { npc: fr, delta: -0.2 }, log: `${N(fr)} bảo bạn "tư duy nghèo" rồi chặn số.` } } }, "Có thể cứu một người, có thể mất người ấy", { tier: "awakened" })], 1, { npc: fr }); }),

  news("nw_mlm_parent", [28, 60], 0.12, (c) => !!role(c, "mother"), (c, N) => { const m = role(c, "mother")!; return T("Phòng khách đầy hộp thuốc bổ", `Sáng nào ${N(m)} cũng đi "câu lạc bộ dưỡng sinh" và mang về những hộp thực phẩm chức năng giá bằng nửa tháng lương hưu. Mẹ tin chúng chữa được bệnh khớp, và đang rủ cả họ hàng cùng mua.`, [
    C("Cãi nhau, bắt mẹ thôi đi", { trust: { npc: m, delta: -0.2 }, gamble: { p: 0.5, win: { flags: ["nw_mom_out"], log: "Mẹ giận một tuần, rồi thôi không đi nữa." }, lose: { flags: ["nw_mom_still_in"], log: "Mẹ đi tiếp, chỉ là không kể với bạn nữa." } } }, "Có thể dừng ngay, mẹ thấy bị xem thường"),
    C("Đi cùng mẹ một buổi để xem tận mắt", { bw: -3, trust: { npc: m, delta: 0.15 }, flags: ["nw_saw_club"] }, "Mất thời gian, mẹ còn chịu nghe bạn", { tier: "awakened" }),
    C("Lặng lẽ trả các khoản mẹ nợ", { money: -0.15, trust: { npc: m, delta: 0.05 }, counters: { nw_paid_for_mom: 1 } }, "Êm nhà, gốc rễ còn nguyên")], 1, { npc: m }); }),

  news("nw_ponzi", [25, 75], 0.15, () => true, () => T("Lãi năm phần trăm mỗi tháng", "Một \"công ty đầu tư\" mở văn phòng sang trọng ở trung tâm, hứa lãi năm phần trăm mỗi tháng. Hàng xóm của bạn đã nhận lãi tám tháng liền và vừa đổi xe mới. Họ nói chỉ còn suất cho ai vào trước cuối tháng.", [
    C("Gửi một phần tiền tiết kiệm", { flags: ["nw_ponzi_in"], gamble: { p: 0.25, win: { money: 0.15, log: "Bạn rút ra kịp sau sáu tháng, lãi nhỏ. Năm sau công ty biến mất." }, lose: { money: -0.5, log: "Mười tháng sau văn phòng đóng cửa. Không ai liên lạc được với giám đốc." } } }, "Có thể lãi chút ít, thường là mất"),
    C("Gửi tất cả, vay thêm để gửi", { custom: "borrow:0.5", flags: ["nw_ponzi_in"], gamble: { p: 0.1, win: { money: 0.8, log: "Bạn rút kịp trước khi sụp. Bạn không bao giờ kể với ai mình đã may thế nào." }, lose: { money: -1.2, happy: -8, log: "Công ty sụp. Bạn mất cả vốn lẫn tiền vay." } } }, "Nếu đúng, giàu nhanh; nếu sai, mất cả nhà"),
    C("Không gửi, đi báo cơ quan chức năng", { bw: -3, rel: -2, flags: ["nw_reported_fund"], counters: { honest: 1 } }, "Hàng xóm bảo bạn ghen ăn tức ở"),
    C("Đứng ngoài, không gửi", { happy: -1, counters: { nw_sat_out: 1 } }, "Giữ tiền, nhìn người khác nhận lãi")], 3), true),

  news("nw_ponzi_victims", [26, 80], 0.35, (c) => f(c, "nw_ponzi_in") || (c.broke && c.debt_ratio > 1.5), () => T("Danh sách nạn nhân", "Công ty đầu tư sụp. Hàng nghìn người như bạn lập nhóm, nộp đơn cho cơ quan điều tra. Một \"văn phòng hỗ trợ đòi tiền\" gọi đến, nói chỉ cần đóng trước một khoản phí là lấy lại được bảy phần mười số đã mất.", [
    C("Đóng phí cho văn phòng hỗ trợ", { money: -0.1, gamble: { p: 0.1, win: { money: 0.2, log: "Lạ thay, họ đòi được một phần thật." }, lose: { flags: ["nw_scammed_twice"], happy: -4, log: "Văn phòng ấy cũng biến mất. Bạn bị lừa lần thứ hai." } } }, "Hy vọng lấy lại, thường là bị lừa lần hai"),
    C("Khai báo đầy đủ, chờ cơ quan điều tra", { bw: -2, counters: { nw_waited: 1 }, gamble: { p: 0.3, win: { money: 0.15, log: "Năm năm sau, bạn nhận lại một phần nhỏ từ tài sản bị thu hồi." }, lose: { log: "Vụ án kéo dài. Bạn thôi theo dõi." } } }, "Chậm, có thể nhận lại chút ít"),
    C("Làm sổ sách cho cả nhóm nạn nhân", { bw: -6, rel: 4, flags: ["nw_victim_book", "leader"] }, "Mất nhiều thời gian, cả nhóm có tiếng nói", { tier: "sovereign" }),
    C("Gạch bỏ, coi như học phí", { happy: 2, unflags: ["nw_ponzi_in"] }, "Nhẹ đầu, mất hẳn")], 1)),

  news("nw_scam_call_parent", [30, 60], 0.15, (c) => c.parent_old && !!parent(c), (c, N) => { const p = parent(c)!; return T("Cuộc gọi giả danh", `${N(p)} gọi cho bạn, giọng run: có người tự xưng cán bộ điều tra, nói tài khoản của ${N(p)} "liên quan một vụ án", phải chuyển hết tiền sang "tài khoản tạm giữ". ${N(p)} đã ra đến ngân hàng.`, [
    C("Bảo cúp máy ngay, bỏ việc chạy sang", { bw: -3, money: -0.01, memory: { npc: p, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "chạy sang kịp lúc bị gọi điện lừa" } }, "Kịp lúc, bỏ dở việc"),
    C("Gọi ngân hàng nhờ chặn giao dịch", { gamble: { p: 0.7, win: { trust: { npc: p, delta: 0.1 }, log: "Nhân viên ngân hàng giữ được lệnh chuyển." }, lose: { money: -0.15, flags: ["nw_parent_scammed"], log: "Lệnh chuyển đã đi trước một phút." } } }, "Không phải bỏ việc, có thể chậm một bước"),
    C("Khuyên bố mẹ giao hết tiền cho bạn giữ", { trust: { npc: p, delta: -0.15 }, flags: ["nw_holds_parent_money"] }, "An toàn, bố mẹ thấy mình bị coi như trẻ con")], 0, { npc: p }); }),

  news("nw_scam_call_self", [25, 85], 0.2, () => true, (c) => { const who = c.kids_alive > 0 ? "Con" : c.married ? "Người nhà" : "Em"; return T("Cuộc gọi báo người thân gặp nạn", `Một số lạ gọi đến: "${who} anh chị bị tai nạn, đang cấp cứu, cần chuyển ngay tiền phẫu thuật." Đầu dây bên kia có tiếng còi xe cấp cứu. Bạn gọi cho người thân thì không ai bắt máy.`, [
    C("Chuyển tiền ngay", { gamble: { p: 0.05, win: { happy: 2, log: "Lần này là thật. Bạn nhẹ người vì đã không chần chừ." }, lose: { money: -0.15, happy: -4, flags: ["nw_scammed_call"], log: "Mười phút sau người thân gọi lại: họ đang ngồi họp." } } }, "Nếu là thật thì kịp, mà thường không thật"),
    C("Gọi thẳng bệnh viện để hỏi", { bw: -3, counters: { nw_scam_spotted: 1 } }, "Mất vài phút, nếu là thật thì chậm"),
    C("Giữ máy, báo công an", { bw: -4, rel: 2, flags: ["nw_reported_scam"] }, "Mất cả buổi, có thể chặn được kẻ lừa")], 1); }),

  news("nw_ghost_project", [25, 65], 0.12, () => true, (c) => T("Dự án trên bản vẽ", `Một công ty mời bạn đặt cọc lô đất nền "ven khu đô thị mới". Có bản vẽ đẹp, có nhà mẫu, có xe đưa đón đi xem. Cọc chỉ ba mươi phần trăm, còn ${vn(c) ? "sổ đỏ" : "giấy chủ quyền"} thì "đang làm".`, [
    C("Đặt cọc giữ chỗ", { gamble: { p: 0.3, win: { money: 0.4, flags: ["nw_plot"], log: "Dự án có thật. Lô đất lên giá sau hai năm." }, lose: { money: -0.6, flags: ["nw_ghost_plot"], log: "Khu đất hóa ra thuộc quyền người khác. Công ty đổi tên, dời văn phòng." } } }, "Có thể lời, có thể mất cọc"),
    C("Đòi xem giấy tờ pháp lý gốc", { bw: -3, know: 2, counters: { nw_checked_papers: 1 } }, "Chậm, có thể mất suất"),
    C("Từ chối", { happy: -1, counters: { nw_sat_out: 1 } }, "Yên tâm, lỡ nếu dự án là thật")], 1)),

  news("nw_job_abroad_trap", [18, 35], 0.12, (c) => c.poor_country, (c) => T("Việc nhẹ lương cao", "Người quen của một người quen giới thiệu việc \"chăm sóc khách hàng\" ở nước láng giềng, lương bằng một năm ở quê, bao vé máy bay. Chỉ cần mang hộ chiếu đến, mọi thứ \"công ty lo\".", [
    C("Nhận lời đi ngay", { gamble: { p: 0.35, win: { ...into(c, "labor_export"), money: 0.1, log: "Công việc có thật, nặng hơn lời hứa, nhưng lương đủ gửi về." }, lose: { health: -8, happy: -8, flags: ["nw_trafficked"], log: "Đến nơi, hộ chiếu bị giữ, bạn bị giam làm việc trong một tòa nhà kín cổng. Nửa năm sau mới được đưa về nước." } } }, "Có thể đổi đời, có thể mất tự do"),
    C("Đi qua công ty xuất khẩu lao động có giấy phép", { ...into(c, "labor_export", "borrow:0.4"), flags: ["nw_legal_abroad"] }, "Tốn phí, chậm, có hợp đồng thật", { tier: "awakened" }),
    C("Ở lại quê", { happy: -1, counters: { nw_sat_out: 1 } }, "An toàn, nghèo như cũ")], 2)),

  news("nw_scratch_ticket", [9, 14], 0.12, () => true, () => T("Phiếu cào trước cổng trường", "Một ông bán hàng rong đứng trước cổng trường với xấp phiếu cào. Bạn cùng lớp vừa cào trúng một chiếc xe đồ chơi. Ông bảo mỗi phiếu chỉ bằng một bữa sáng, \"cào là có quà\".", [
    C("Dốc hết tiền heo đất mua phiếu", { money: -0.01, gamble: { p: 0.1, win: { happy: 4, counters: { gamble: 1 }, log: "Bạn trúng một hộp bút màu. Tuần sau bạn mua thêm mười phiếu." }, lose: { happy: -3, counters: { gamble: 1 }, log: "Mười phiếu đều ghi \"chúc may mắn lần sau\"." } } }, "Có thể trúng quà, thường là mất trắng"),
    C("Về kể với bố mẹ", { rel: 1, happy: -1, flags: ["nw_told_parents"] }, "Bạn bè chê mách lẻo, ông bán hàng bị đuổi đi"),
    C("Đứng xem xem ai thực sự trúng", { know: 2, flags: ["nw_noticed_trick"] }, "Mất giờ chơi, hiểu ra một trò cũ", { tier: "awakened" })], 1)),
];

/* ================================================================== GIẢI TỎA & PHÁT TRIỂN */
const LAND: Storylet[] = [
  news("nw_land_clearance", [30, 75], 0.15, (c) => c.farmer || f(c, "job_farm") || c.age >= 40, (c, N) => { const o = role(c, "official"); return T("Quyết định thu hồi đất", "Một con đường lớn sẽ chạy qua làng. Nhà và mảnh vườn của bạn nằm trọn trong vạch sơn đỏ. Mức đền bù bằng một phần ba giá người ta mua bán ngoài thị trường, hạn bàn giao là sáu tháng.", [
    C("Nhận đền bù, bàn giao đúng hạn", { money: 1.2, happy: -4, flags: ["nw_land_paid"], close_doors: ["inheritance"] }, "Có tiền ngay, mất đất ông bà"),
    C("Khiếu nại, giữ đất đến cùng", { bw: -4, gamble: { p: 0.3, win: { money: 2, flags: ["nw_land_paid"], log: "Hai năm khiếu nại, mức đền bù được nâng gần gấp đôi." }, lose: { money: 0.8, bw: -6, flags: ["nw_land_paid", "nw_forced_out"], ...mem(o, "TOOK_MY_LAND", -0.4, "cưỡng chế mảnh vườn làm đường"), log: "Hết hạn, đất bị cưỡng chế. Tiền đền bù bị trừ chi phí." } } }, "Có thể được nhiều hơn, có thể mất cả lý lẫn tình"),
    C("Cùng cả làng thuê luật sư, đòi tái định cư tại chỗ", { money: -0.1, bw: -5, flags: ["nw_land_group", "leader"], gamble: { p: 0.4, win: { money: 1.5, flags: ["nw_land_paid"], log: `Cả làng được bố trí đất ở ngay cạnh tuyến đường mới.${o ? ` ${N(o)} phải ký lại từng hồ sơ.` : ""}` }, lose: { money: 1, flags: ["nw_land_paid"], log: "Đơn bị bác. Mỗi nhà nhận đền bù như cũ, chậm nửa năm." } } }, "Tốn tiền, có thể đổi kết cục cho cả làng", { tier: "sovereign" })], 0, o ? { npc: o } : {}); }, true),

  news("nw_payout", [31, 80], 0.35, (c) => f(c, "nw_land_paid") || f(c, "land_sold"), (c) => T("Khoản tiền lớn nhất đời", "Tiền đền bù về tài khoản: một con số bạn chưa từng thấy. Trong một tuần, có ba người đến mời mua ô tô, hai người rủ hùn vốn, và một ông chú họ lâu năm không gặp ghé chơi.", [
    C("Xây nhà ba tầng, mua xe", { money: -0.8, happy: 6, rel: 2, flags: ["nw_big_house"] }, "Sướng ngay, tiền hết sau vài năm"),
    C("Mua đất xã bên để tiếp tục làm vườn", { money: -0.6, happy: 1, flags: ["nw_new_land"] }, "Giữ nghề, đất xa và cằn hơn"),
    C("Hùn vốn với người quen mở xưởng", { gamble: { p: 0.4, win: { income_mult: 1.3, flags: ["nw_partner_ok"], log: "Xưởng chạy được. Ba năm sau bạn có thu nhập đều." }, lose: { money: -0.8, flags: ["nw_partner_bust"], log: "Người quen ôm tiền vốn đi đâu không ai biết." } } }, "Có thể sinh lời, có thể mất trắng"),
    c.kids_alive > 0 ? C("Gửi tiết kiệm lo cho con học hành", { happy: -1, counters: { save: 2 }, flags: ["nw_edu_fund"] }, "Không hưởng gì bây giờ, con có đường đi", { longterm: true, tier: "awakened" })
      : C("Gửi tiết kiệm, sống như chưa có gì", { happy: -1, counters: { save: 2 } }, "Không hưởng gì bây giờ, già không lo", { longterm: true })], 3)),

  news("nw_school_razed", [6, 12], 0.1, () => true, () => T("Ngôi trường bị phá", "Ngôi trường cũ của bạn nằm trong khu giải tỏa. Học kỳ sau cả lớp chuyển về trường mới cách bốn cây số, chia ra ba lớp khác nhau. Hôm cuối, cô giáo cho mỗi đứa mang về một viên gạch.", [
    C("Đi bộ bốn cây số với nhóm bạn cũ", { health: 2, know: -1, rel: 3, flags: ["nw_walked_school"] }, "Giữ bạn cũ, sáng nào cũng mệt rã"),
    C("Làm quen với lớp mới", { rel: 1, happy: -2, know: 1, counters: { nw_new_school: 1 } }, "Học tốt hơn, nhớ bạn cũ"),
    C("Viết tên cả lớp lên viên gạch, cất dưới gầm giường", { happy: 2, bw: -1, flags: ["nw_school_brick"] }, "Giữ được một kỷ niệm, không giữ được ngôi trường")], 0)),

  news("nw_industrial_zone", [16, 45], 0.15, (c) => c.poor_country || c.farmer, (c) => c.age < 18
    ? T("Khu công nghiệp trên đồng lúa", "Cánh đồng sau làng được san lấp làm khu công nghiệp. Chỉ một năm, bốn mươi nhà xưởng mọc lên, xe đưa đón công nhân chạy ầm ầm qua ngõ. Cổng tuyển dụng dán thông báo: nhận người từ mười tám tuổi. Bạn mới mười sáu, mười bảy.", [
      C("Khai tăng tuổi để vào làm sớm", { money: M(c, 0.04), know: -4, secret: { tag: "FORGED_PAPERS", severity: 0.2, fuse_years: [2, 8], note: "khai tăng tuổi để vào làm khu công nghiệp" } }, "Có tiền sớm, bỏ học, mang một bí mật"),
      C("Học tiếp, chờ đủ tuổi", { know: 2, happy: -1, counters: { nw_waited: 1 } }, "Chậm hơn bạn bè, giữ được đường học")], 1)
    : T("Khu công nghiệp trên đồng lúa", "Cánh đồng sau làng được san lấp làm khu công nghiệp. Chỉ một năm, bốn mươi nhà xưởng mọc lên, xe đưa đón công nhân chạy ầm ầm qua ngõ. Cổng tuyển dụng dán thông báo tuyển người, không cần kinh nghiệm.", [
      C("Vào làm công nhân, lương đều", { custom: "job_new", health: -2, happy: -1, flags: ["nw_factory_hand"] }, "Lương ổn, ca kíp, bỏ ruộng"),
      C("Vay tiền xây phòng trọ cho công nhân thuê", { custom: "borrow:0.5", flags: ["nw_rooms_for_rent"], gamble: { p: 0.6, win: { money: 0.6, log: "Phòng kín người sau ba tháng. Tiền trọ đều như lương." }, lose: { money: -0.2, log: "Khu công nghiệp lấp đầy chậm. Phòng trống quá nửa." } } }, "Có thể có thu nhập đều, có thể ôm nợ"),
      C("Giữ ruộng còn lại, trồng rau bán cho bếp ăn công nhân", { money: 0.05, happy: 1, counters: { nw_kept_field: 1 } }, "Thu nhỏ mà chắc, không giàu nhanh", { tier: "awakened" })], 0)),

  news("nw_old_block", [35, 85], 0.1, (c) => !c.poor_country || c.gdp > 8000, () => T("Chung cư cũ chờ đập bỏ", "Khu chung cư bạn ở hơn ba mươi năm được quyết định đập đi xây mới. Chủ đầu tư hứa sau ba năm mỗi hộ có căn hộ mới rộng hơn, trong lúc chờ thì nhận tiền thuê nhà tạm. Một nửa số hộ đã ký.", [
    C("Ký, dọn đi thuê nhà tạm", { gamble: { p: 0.5, win: { money: 0.3, flags: ["nw_new_flat"], log: "Bốn năm sau bạn nhận chìa khóa. Muộn một năm, căn hộ đúng như hứa." }, lose: { money: -0.2, happy: -5, flags: ["nw_stalled_block"], log: "Dự án đình trệ. Tiền thuê tạm ngừng chi từ năm thứ hai." } } }, "Có thể được nhà mới, có thể treo nhiều năm"),
    C("Bán suất tái định cư, chuyển đi hẳn", { money: 0.4, happy: -3, flags: ["nw_sold_slot"] }, "Có tiền ngay, mất hàng xóm ba mươi năm"),
    C("Không ký, đòi hợp đồng có ngân hàng bảo lãnh", { bw: -4, rel: -2, flags: ["nw_holdout", "leader"] }, "Bị coi là kẻ cản trở, có thể bảo vệ cả khu", { tier: "sovereign" })], 0)),

  news("nw_frontage_lost", [25, 65], 0.12, (c) => f(c, "own_business") || f(c, "job_market") || f(c, "shop_active"), (c) => T("Phố cũ đổi chủ", "Con phố nơi bạn mở quán mười năm được một tập đoàn mua lại gần hết. Chủ nhà báo không gia hạn hợp đồng, mặt bằng sẽ thành cửa hàng thời trang. Khách quen hỏi bạn sẽ dọn đi đâu.", [
    C("Thuê mặt bằng mới ở phố khác, giá cao hơn", { money: -0.3, income_mult: 0.9, flags: ["nw_relocated_shop"] }, "Giữ được quán, mất khách vãng lai"),
    C("Dọn ra bán xe đẩy ở đầu ngõ", { ...into(c, "street_vendor"), income_mult: 0.7, happy: 2, flags: ["nw_cart"] }, "Ít vốn, mất chỗ đứng, giữ khách quen"),
    C("Đóng quán, đi làm thuê", { custom: "job_new", money: 0.05, happy: -4, flags: ["nw_closed_shop"] }, "Lương đều, mất cái của mình")], 0)),
];

/* ================================================================== SỐC GIÁ NĂNG LƯỢNG */
const ENERGY: Storylet[] = [
  news("nw_fuel_spike", [20, 65], 0.15, (c) => f(c, "job_driver"), (c) => T("Giá xăng tăng ba lần trong tháng", "Giá xăng điều chỉnh tăng ba lần trong một tháng. Mỗi chuyến xe của bạn giờ chỉ lãi bằng một nửa trước đây, khách thì chê cước tăng.", [
    C("Chạy thêm giờ để bù", { money: 0.03, health: -4, bw: -3, counters: { nw_long_hours: 1 } }, "Giữ thu nhập, mất ngủ"),
    C("Bán xe cũ, vay mua xe điện", { custom: "borrow:0.4", income_mult: 1.1, flags: ["nw_ev"] }, "Nợ thêm, mỗi ngày đỡ tiền nhiên liệu", { longterm: true }),
    C("Chuyển sang chạy xe công nghệ, nhận cuốc gần", { ...into(c, "ride_hailing"), income_mult: 0.95, flags: ["nw_switched_ride"] }, "Có khách đều, phụ thuộc vào ứng dụng")], 0)),

  news("nw_rolling_blackout", [10, 80], 0.15, (c) => c.poor_country, (c) => c.age < 18
    ? T("Cắt điện luân phiên", "Hồ thủy điện cạn nước, cả thành phố bị cắt điện luân phiên tám tiếng mỗi ngày. Tối nào nhà bạn cũng tối om, quạt đứng im, tủ lạnh chảy nước.", [
      C("Làm bài dưới ánh đèn dầu", { know: 2, health: -1, counters: { read: 1 } }, "Không tụt bài, mỏi mắt"),
      C("Ra ngõ chơi với đám trẻ cả tối", { happy: 3, know: -2, rel: 2, counters: { nw_blackout_play: 1 } }, "Vui hết cỡ, bài vở bỏ dở")], 1)
    : T("Cắt điện luân phiên", "Hồ thủy điện cạn nước, cả thành phố bị cắt điện luân phiên tám tiếng mỗi ngày. Đêm nóng không quạt, tủ lạnh chảy nước, điện thoại phải mang ra quán sạc nhờ.", [
      C("Mua máy phát điện chạy dầu", { money: -0.1, health: 1, flags: ["nw_generator"] }, "Có điện, tốn tiền và ồn"),
      C("Đổi giờ sinh hoạt theo lịch có điện", { bw: -4, health: -1, counters: { nw_odd_hours: 1 } }, "Không tốn tiền, cả nhà đảo lộn"),
      C("Góp tiền cùng hàng xóm lắp điện mặt trời chung", { money: -0.08, rel: 4, flags: ["nw_shared_solar", "leader"] }, "Bỏ vốn trước, cả xóm có điện lâu dài", { tier: "sovereign", longterm: true })], 0)),

  news("nw_fuel_queue", [18, 65], 0.1, () => true, () => T("Hàng xe dài hai cây số", "Các cây xăng treo biển \"hết hàng\". Cây nào còn thì xe xếp hàng dài hai cây số, người ta ngủ trên yên xe chờ. Ngoài chợ đen, mỗi lít giá gấp ba.", [
    C("Xếp hàng sáu tiếng", { bw: -4, happy: -2, counters: { nw_queued: 1 } }, "Giá đúng, mất nửa ngày"),
    C("Mua chợ đen để kịp đi làm", { money: -0.04, counters: { honest: -1 } }, "Kịp việc, đắt gấp ba"),
    C("Để xe ở nhà, đạp xe đi làm cả tháng", { health: 3, bw: -2, counters: { exercise: 1 }, flags: ["nw_bike_month"] }, "Khỏe ra, đến chỗ làm ướt áo", { tier: "awakened" })], 0)),
];

export const PACK_NEWS_A: Storylet[] = [...DISASTER, ...EPIDEMIC, ...ECONOMY, ...SCAM, ...LAND, ...ENERGY];
