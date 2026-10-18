/**
 * Thẻ tiền: TÀI SẢN CÓ TÊN (16 thẻ, tiền tố ma_).
 * Nhà, đất, xe, cửa hàng: mua lần đầu, sốt đất, bán tháo lúc khủng hoảng, cho thuê, người thuê quỵt, sửa nhà,
 * giải tỏa, bán nhà vì một giấc mơ, mất xe, nhà của bố mẹ để lại, bạn đời muốn nhà to hơn, ki-ốt,
 * tiền góp vay đè nặng, thuê hay mua ở nước giàu, mua đất chung với anh chị em.
 * Giá luôn lấy từ c.price_years.<loại> nhân hệ số; engine kẹp giá và có thể từ chối khi thiếu tiền hoặc ngân hàng không cho vay.
 * Bán luôn lỗ phí (Holdings.HAIRCUT). Chi tiết Việt Nam (sổ đỏ, giải tỏa, ki-ốt chợ) chỉ khi c.country === "VN".
 */
import type { Storylet, FactContext, Effect, MemoryTag } from "../types.ts";
import { C, T, f, role, vary, money, flagAll } from "./kit.ts";

const vn = (c: FactContext): boolean => c.country === "VN";
/** Nước nghèo: xe là xe máy, nhà là nhà cấp bốn; nước giàu: ô tô cũ, căn hộ. */
const poor = (c: FactContext): boolean => c.poor_country || c.gdp < 8000;
/** Làm tròn và kẹp một khoản tiền (số năm thu nhập). */
const amt = (x: number, lo: number, hi: number): number => Math.round(Math.min(hi, Math.max(lo, x)) * 100) / 100;
const mem = (npc: string | undefined, tag: MemoryTag, weight: number, note: string): Effect => (npc ? { memory: { npc, tag, weight, note } } : {});
const tr = (npc: string | undefined, delta: number): Effect => (npc ? { trust: { npc, delta } } : {});

export const PACK_MONEY_ASSETS: Storylet[] = [
  /* ---------- 1. chiếc xe đầu tiên ---------- */
  money("ma_first_ride", [18, 35], 99, 0.8, (c) => !c.owns.has("vehicle") && c.has_job, (c) => {
    const p = poor(c); const v = c.price_years.vehicle;
    return T(p ? "Chiếc xe máy đầu tiên" : "Chiếc ô tô đầu tiên", p
      ? "Đi làm bằng hai chặng xe buýt mất một tiếng rưỡi mỗi sáng. Cửa hàng đầu phố có xe máy mới, trả trước ba phần mười, góp hai năm. Một người quen bán lại chiếc xe cũ đã chạy sáu năm, lấy tiền mặt."
      : "Chuyến tàu cuối về khu bạn ở là mười một giờ đêm, ca làm thì tan lúc mười một rưỡi. Đại lý chào xe mới, góp năm năm. Trên mạng có chiếc xe cũ đã chạy tám vạn cây số, chủ cần bán gấp.", [
      C(p ? "Mua xe máy mới, góp hai năm" : "Mua xe mới, góp năm năm", { buy: { kind: "vehicle", name: p ? "chiếc xe máy mới" : "chiếc ô tô mới", price: amt(v * 1.3, 0.05, 3), borrow: true }, happy: 3 }, "Đi lại nhàn, xe mất giá mỗi năm, còn khoản góp"),
      C("Mua xe cũ bằng tiền mặt", { buy: { kind: "vehicle", name: p ? "chiếc xe máy cũ" : "chiếc ô tô cũ", price: amt(v * 0.5, 0.03, 2) }, happy: 1 }, "Không nợ, có thể hỏng giữa đường"),
      C("Chưa mua, đi xe công cộng", { flags: ["no_vehicle"], bw: -2, counters: { save: 1 } }, "Giữ tiền, mất thời gian và sức mỗi ngày")], 1);
  }),

  /* ---------- 2. căn nhà đầu tiên ---------- */
  money("ma_first_home", [26, 45], 12, 0.75, (c) => !c.home_owner && !c.owns.has("house") && c.has_job, (c) => {
    const h = c.price_years.house;
    const where = vary("ma_fh", c.age, [
      "Chủ nhà báo tăng tiền thuê lần thứ ba trong bốn năm.",
      "Bạn đã chuyển nhà trọ năm lần, lần nào cũng mất tiền cọc.",
      "Hàng xóm cùng dãy thuê vừa bị chủ nhà đòi lại phòng trong ba mươi ngày.",
    ]);
    return T("Chán cảnh đi thuê",`${where} Một căn hộ hai phòng ${poor(c) ? "bốn mươi lăm" : "sáu mươi"} mét vuông ở ngoại ô đang mở bán, ngân hàng cho vay hai mươi năm. Ở thị trấn cách hai tiếng, một căn nhà nhỏ chỉ bằng một phần ba giá.`, [
      C("Mua căn hộ ngoại ô, vay hai mươi năm", { buy: { kind: "house", name: "căn hộ hai phòng ở ngoại ô", price: amt(h * 0.9, 0.5, 30), borrow: true }, happy: 4, bw: -3 }, "Có nhà, gánh hai mươi năm góp"),
      C("Mua căn nhà nhỏ ở thị trấn", { buy: { kind: "house", name: "căn nhà nhỏ ở thị trấn", price: amt(h * 0.35, 0.3, 12), borrow: true }, rel: -2, flags: ["long_commute"] }, "Nợ ít hơn, xa việc và xa bạn bè"),
      C("Ở thuê tiếp, gửi tiết kiệm phần chênh", { deposit: amt(c.savings / Math.max(1, c.income) * 0.5, 0.1, 2), flags: ["renter"] }, "Linh hoạt, không có gì trong tay khi về già")], 2);
  }),

  /* ---------- 3. sốt đất ven đô ---------- */
  money("ma_land_fever", [22, 70], 8, 0.5, (c) => c.econ_phase === "boom" && !c.broke, (c) => {
    const l = c.price_years.land;
    const rumor = vary("ma_lf", c.age, [
      "Tin đồn có cây cầu mới bắc qua sông.",
      "Người ta nói khu công nghiệp sắp mở ngay bên kia đường.",
      "Có tin một trường đại học sẽ dời về đây.",
    ]);
    return T("Đất ven đô lên giá từng tuần", `${rumor} Mảnh đất ba trăm mét vuông ven đô tháng trước còn rao một giá, tuần này đã cao hơn một phần năm. ${vn(c) ? "Môi giới cam đoan sổ đỏ có sẵn, cọc trong ngày." : "Môi giới nói hồ sơ đầy đủ, ai đặt cọc trước thì được."}`, [
      C("Mua bằng tiền dành dụm", { buy: { kind: "land", name: "mảnh đất ven đô", price: amt(l * 0.6, 0.2, 8) }, flags: ["land_speculator"] }, "Có thể lãi lớn, tiền nằm chết khi thị trường đứng"),
      C("Vay thêm để mua mảnh to hơn", { buy: { kind: "land", name: "mảnh đất góc ven đô", price: amt(l * 1.1, 0.4, 14), borrow: true }, bw: -4, flags: ["land_speculator"] }, "Lãi gấp đôi nếu sốt tiếp, siết nợ nếu sốt tắt"),
      C("Đứng ngoài, để người khác đuổi giá", { counters: { save: 1 }, happy: -1 }, "Không rủi ro, có thể nhìn người khác giàu lên")], 2);
  }),

  /* ---------- 4. khủng hoảng: bán tháo hay mua rẻ ---------- */
  money("ma_fire_sale", [25, 75], 10, 0.4, (c) => c.econ_phase === "crisis" && ((c.owns.has("house") && c.loan_burden > 0.3) || c.deposit > 0 || c.rich), (c) => {
    const squeezed = c.owns.has("house") && c.loan_burden > 0.3;
    const name = c.asset_names.house ?? "căn nhà";
    if (squeezed) return T("Nợ nhiều hơn giá nhà", `Giá nhà trong khu đã rơi gần một phần tư sau mười hai tháng. Khoản góp cho ${name} vẫn ngốn hơn ba phần mười thu nhập. Ngân hàng gửi thư nhắc: chậm hai năm liền là siết.`, [
      C(`Bán ${name} khi còn bán được`, { sell: { kind: "house" }, happy: -5, flags: ["sold_in_crisis"] }, "Thoát nợ, lỗ thật và mất chỗ ở"),
      C("Thắt lưng, sống tằn tiện để giữ nhà", { lifestyle: "tan_tien", bw: -4, flags: ["held_through_crisis"] }, "Giữ được nhà nếu trụ nổi, mệt mỏi nhiều năm"),
      ...(c.deposit > 0 ? [C("Rút tiết kiệm ra để góp tiếp", { withdraw: amt(c.deposit / Math.max(1, c.income), 0.05, 5), happy: -2 }, "Mua thêm thời gian, cạn quỹ phòng thân")] : [])], 1);
    return T("Nhà bán gấp giá bằng sáu phần mười", `Khắp khu phố treo biển bán gấp. Một gia đình vỡ nợ rao căn nhà hai tầng, sáu mươi mét vuông, bằng sáu phần mười giá năm ngoái. ${vn(c) ? "Họ cần tiền mặt trước rằm." : "Họ cần tiền mặt trong tháng."}`, [
      C("Mua căn nhà đó bằng tiền mặt", { buy: { kind: "house", name: "căn nhà hai tầng mua lúc khủng hoảng", price: amt(c.price_years.house * 0.6, 0.5, 20) }, flags: ["crisis_buyer"] }, "Món hời nếu thị trường hồi, tiền mặt cạn giữa bão"),
      C("Mua một ki-ốt rẻ, vay phần thiếu", { buy: { kind: "shop", name: vn(c) ? "ki-ốt bán gấp ở chợ" : "cửa hàng nhỏ bán gấp", price: amt(c.price_years.shop * 0.5, 0.3, 8), borrow: true } }, "Có chỗ cho thuê, thêm nợ lúc ngân hàng siết chặt"),
      C("Giữ tiền mặt, chờ đáy", { flags: ["crisis_cash"], counters: { save: 1 } }, "An toàn, có thể lỡ cơ hội một đời")], 2);
  }),

  /* ---------- 5. cho thuê mặt tiền tầng trệt ---------- */
  money("ma_ground_floor", [25, 75], 10, 0.5, (c) => c.owns.has("house"), (c) => {
    const name = c.asset_names.house ?? "căn nhà";
    return T("Có người hỏi thuê tầng trệt", `Một người bán đồ ăn sáng hỏi thuê bốn mét mặt tiền tầng trệt của ${name}, dọn hàng từ năm giờ sáng. Tiền thuê một năm bằng gần một tháng rưỡi thu nhập của bạn. Cả nhà sẽ phải đi cửa sau.`, [
      C("Cho thuê theo tháng", { money: 0.12, happy: -2, flags: ["rents_ground_floor"] }, "Có thêm tiền, mất yên tĩnh buổi sáng"),
      C("Ký hợp đồng ba năm, lấy trước một năm tiền", { money: 0.15, flags: ["rents_ground_floor", "written_lease"], happy: -1 }, "Tiền chắc, bị ràng buộc ba năm", { tier: "awakened" }),
      C("Tự mở quầy bán hàng ở đó", { money: -0.08, flags: ["home_shop"], bw: -3, gamble: { p: 0.5, win: { money: 0.2, log: "Quầy hàng đông khách từ tháng thứ hai." }, lose: { money: -0.05, log: "Quầy hàng ế, sáu tháng sau bạn dẹp." } } }, "Lãi nhiều hơn, tự mình đứng quầy"),
      C("Giữ nguyên, nhà để ở", { happy: 1 }, "Yên tĩnh, bỏ qua một khoản thu")], 3);
  }),

  /* ---------- 6. người thuê cửa hàng ngừng trả ---------- */
  money("ma_tenant_late", [28, 80], 8, 0.45, (c) => c.owns.has("shop"), (c) => {
    const name = c.asset_names.shop ?? "cửa hàng";
    const why = vary("ma_tl", c.age, [
      "Người thuê nói con ốm nằm viện.",
      "Người thuê nói làm ăn thua lỗ từ đầu năm.",
      "Người thuê không nghe máy, cửa vẫn mở bán hàng.",
    ]);
    return T("Bốn tháng chưa trả tiền thuê", `Người thuê ${name} đã chậm bốn tháng. ${why} Hàng xóm mách có người khác đang dò hỏi thuê chỗ đó.`, [
      C("Đòi lại mặt bằng, tìm người thuê mới", { money: -0.03, flags: ["evicted_tenant"], rel: -2, gamble: { p: 0.6, win: { money: 0.06, log: "Ba tuần sau đã có người mới, trả trước sáu tháng." }, lose: { money: -0.05, log: "Mặt bằng bỏ trống gần nửa năm." } } }, "Dứt khoát, có thể để trống mấy tháng"),
      C("Cho khất, lập giấy trả dần có chữ ký", { flags: ["tenant_payment_plan"], rel: 2, gamble: { p: 0.65, win: { money: 0.05, log: "Họ trả đủ trong một năm, kèm một giỏ quà." }, lose: { money: -0.06, log: "Họ dọn đi trong đêm, để lại tờ giấy nợ." } } }, "Giữ người, chịu chờ tiền", { tier: "awakened" }),
      C(`Bán luôn ${name}, thôi làm chủ cho thuê`, { sell: { kind: "shop" }, happy: 1 }, "Hết đau đầu, bán dưới giá và mất khoản thu"),
      C("Để đó, chờ họ tự trả", { happy: -2, counters: { kind: 1 } }, "Không mất lòng ai, có thể mất trắng")], 1);
  }),

  /* ---------- 7. mái nhà dột ---------- */
  money("ma_roof_leak", [25, 85], 8, 0.6, (c) => c.owns.has("house"), (c) => {
    const name = c.asset_names.house ?? "căn nhà";
    const fix = amt(c.price_years.house * 0.03, 0.05, 0.8);
    const what = vary("ma_rl", c.age, [
      `Sau trận mưa đầu mùa, trần phòng ngủ của ${name} loang một vệt rộng bằng cái chiếu, nước nhỏ giọt vào xô suốt đêm.`,
      `Thợ đến xem nói ống nước âm tường của ${name} đã mục, tường tầng hai thấm ướt cao nửa mét.`,
      `Một vết nứt chạy dọc tường bếp của ${name}, cửa sổ phòng khách đóng không khít nữa.`,
    ]);
    return T("Thợ báo phải làm lại cả mái", `${what} Thợ báo giá sửa tận gốc mất ba tuần, hoặc vá tạm trong một buổi chiều.`, [
      C("Sửa tận gốc", { money: -fix, flags: ["house_renovated"], happy: 2 }, "Tốn một khoản lớn, yên tâm chục năm"),
      C("Vá tạm, để năm sau tính", { money: -0.02, flags: ["house_patched"], gamble: { p: 0.55, win: { log: "Chỗ vá trụ được qua mùa mưa." }, lose: { money: -amt(fix * 1.5, 0.05, 1.2), health: -2, log: "Mùa mưa sau, chỗ vá bục, hỏng luôn đồ đạc bên dưới." } } }, "Rẻ bây giờ, có thể đắt gấp rưỡi về sau"),
      C(`Bán ${name} như hiện trạng`, { sell: { kind: "house" }, happy: -3, flags: ["sold_as_is"] }, "Thoát gánh sửa chữa, bị ép giá và phải tìm chỗ ở")], 0);
  }),

  /* ---------- 8. giải tỏa / thu hồi đất ---------- */
  money("ma_clearance", [25, 85], 99, 0.25, (c) => c.owns.has("land") || c.owns.has("house"), (c, N) => {
    const kind = c.owns.has("land") ? "land" as const : "house" as const;
    const name = (kind === "land" ? c.asset_names.land : c.asset_names.house) ?? (kind === "land" ? "mảnh đất" : "căn nhà");
    const base = c.price_years[kind];
    const nb = role(c, "neighbor");
    return T(vn(c) ? "Quyết định giải tỏa" : "Thông báo thu hồi đất làm đường", `${vn(c) ? "Phường dán thông báo" : "Chính quyền gửi thư"}: con đường sáu làn sẽ đi qua ${name}. Giá đền bù bằng khoảng bảy phần mười giá ngoài chợ, nhận trong chín mươi ngày. ${nb ? `${N(nb)} rủ cả dãy cùng ký đơn đòi định giá lại.` : "Vài hộ trong dãy nói sẽ không ký."}`, [
      C("Nhận đền bù, dọn đi sớm", { sell: { kind }, money: -amt(base * 0.15, 0.05, 1.5), flags: ["took_compensation"], happy: -2 }, "Tiền chắc, thấp hơn giá thật"),
      C("Không ký, chờ giá cao hơn", { bw: -5, gamble: { p: 0.4, win: { sell: { kind }, money: amt(base * 0.15, 0.05, 1.5), flags: ["held_out_won"], log: "Hai năm sau, giá đền bù được nâng. Bạn là hộ cuối cùng ký." }, lose: { sell: { kind }, money: -amt(base * 0.25, 0.05, 2), happy: -5, flags: ["held_out_lost"], log: "Bạn bị cưỡng chế. Tiền đền bù tính theo giá cũ, trừ cả phí tháo dỡ." } } }, "Có thể được nhiều hơn, có thể mất nhiều hơn"),
      C("Cùng cả dãy đòi định giá độc lập, công khai", { agency: 0.02, flags: ["led_clearance_petition"], ...tr(nb, 0.2), gamble: { p: 0.5, win: { sell: { kind }, money: amt(base * 0.08, 0.03, 1), rel: 4, log: "Hội đồng định giá lại. Cả dãy được đền bù sát giá thị trường." }, lose: { sell: { kind }, bw: -4, log: "Đơn bị bác. Bạn nhận đền bù như mọi người, nhưng cả dãy nhớ tên bạn." } } }, "Mất thời gian, được hay mất cùng cả xóm", { tier: "sovereign" })], 0, nb ? { npc: nb } : {});
  }),

  /* ---------- 9. bán nhà vì một việc lớn ---------- */
  money("ma_sell_for_dream", [35, 70], 15, 0.4, (c) => c.owns.has("house") && (c.kids_teen > 0 || f(c, "own_business") || c.parent_sick), (c) => {
    const name = c.asset_names.house ?? "căn nhà";
    const why = c.kids_teen > 0 ? "Con bạn đỗ một trường ở nước ngoài, học bổng chỉ đủ một nửa học phí bốn năm."
      : c.parent_sick ? "Bác sĩ nói ca mổ của bố mẹ bạn nên làm ở bệnh viện tuyến trên, chi phí bằng nhiều năm thu nhập."
      : "Cửa hàng của bạn có cơ hội mở chi nhánh thứ hai, chỉ thiếu vốn.";
    return T("Bán nhà để đổi lấy một cơ hội", `${why} Thứ duy nhất đủ lớn là ${name}. Một người môi giới nói bán trong ba tháng, chậm thì mất giá.`, [
      C(`Bán ${name}, mua căn nhỏ hơn`, { sell: { kind: "house" }, buy: { kind: "house", name: "căn nhà nhỏ hơn", price: amt(c.price_years.house * 0.4, 0.3, 12) }, money: -amt(c.price_years.house * 0.4, 0.3, 10), flags: ["sold_home_for_family"], happy: -2 }, "Có tiền cho việc lớn, sống chật hơn"),
      C(`Bán ${name}, cả nhà đi thuê`, { sell: { kind: "house" }, money: -amt(c.price_years.house * 0.5, 0.3, 12), flags: ["sold_home_for_family", "renter"], happy: -4 }, "Nhiều tiền nhất, không còn nhà riêng"),
      C("Giữ nhà, vay thêm một khoản", { custom: "borrow:0.6", money: -0.6, bw: -4 }, "Giữ chỗ ở, nợ tiêu dùng lãi cao"),
      C("Giữ nhà, bỏ qua cơ hội này", { happy: -3, flags: ["kept_home"] }, "Nhà còn, cơ hội mất")], 0);
  }),

  /* ---------- 10. mất xe ---------- */
  money("ma_vehicle_loss", [20, 75], 8, 0.5, (c) => c.owns.has("vehicle"), (c) => {
    const name = c.asset_names.vehicle ?? "chiếc xe";
    const ins = c.insured.has("property");
    const what = vary("ma_vl", c.age, [
      `Sáng ra, ${name} không còn ở chỗ để. Camera nhà bên chỉ quay được một bóng người lúc ba giờ sáng.`,
      `Một chiếc xe tải tạt vào ${name} ở ngã tư. Bạn chỉ trầy tay, xe thì bẹp nửa thân.`,
    ]);
    return T(`Mất ${name}`, `${what} ${ins ? "Hợp đồng bảo hiểm tài sản sẽ trả một phần, sau hai tháng giấy tờ." : "Bạn chưa từng mua bảo hiểm tài sản."}`, [
      C("Mua xe khác ngay", { buy: { kind: "vehicle", name: poor(c) ? "chiếc xe máy thay thế" : "chiếc ô tô thay thế", price: amt(c.price_years.vehicle * (ins ? 0.6 : 0.8), 0.03, 3), borrow: true } }, "Không lỡ việc, thêm một khoản chi"),
      C("Đi xe công cộng một thời gian", { flags: ["no_vehicle"], bw: -3, counters: { save: 1 } }, "Đỡ tiền, mất thời gian mỗi ngày"),
      ...(ins ? [] : [C("Mua bảo hiểm tài sản từ giờ", { insure: "property", money: -0.02 }, "Tốn phí mỗi năm, lần sau đỡ đau", { tier: "awakened" as const })])], 0);
  }),

  /* ---------- 11. nhà của bố mẹ để lại ---------- */
  money("ma_parents_house", [30, 75], 99, 0.4, (c) => !!role(c, "sibling") && c.parents_alive === 0 && f(c, "parent_died") && !f(c, "inherited_home"), (c, N) => flagAll((() => {
    const s = role(c, "sibling")!;
    const share = amt(c.price_years.house * 0.12, 0.1, 2);
    return T("Chìa khóa nhà bố mẹ để lại", `Căn nhà cấp bốn của bố mẹ đứng trống từ sau ${vn(c) ? "đám giỗ đầu" : "đám tang"}, sân sau còn cây ăn quả bố trồng ba mươi năm trước. ${N(s)} muốn bán ngay, chia đều. Có người trả giá trong tuần này.`, [
      C("Đồng ý bán, chia phần", { money: share, happy: -3, flags: ["parents_house_sold"], ...tr(s, 0.1) }, "Có tiền ngay, mất chỗ về"),
      C("Mua lại phần của anh chị em", { buy: { kind: "house", name: "căn nhà cũ của bố mẹ", price: amt(c.price_years.house * 0.25, 0.3, 8), borrow: true }, ...mem(s, "WIN_WIN_DEAL", 0.2, "mua lại nhà bố mẹ"), flags: ["kept_parents_house"] }, "Giữ được nhà, gánh thêm nợ"),
      C("Giữ chung, cho thuê, có giấy chia tiền", { money: 0.05, flags: ["shared_parents_house", "written_agreement"], ...tr(s, 0.2) }, "Giữ nhà, giữ hòa khí, thu ít", { tier: "sovereign" }),
      C("Không cho bán", { ...mem(s, "REFUSED_HELP", -0.25, "không cho bán nhà bố mẹ"), happy: 1 }, "Giữ kỷ niệm, mất lòng anh chị em")], 0, { npc: s });
  })(), "inherited_home")),

  /* ---------- 12. bạn đời muốn nhà to hơn ---------- */
  money("ma_spouse_bigger", [30, 60], 12, 0.45, (c) => c.married && !!role(c, "spouse") && c.owns.has("house"), (c, N) => {
    const sp = role(c, "spouse")!;
    const name = c.asset_names.house ?? "căn nhà";
    return T(`${N(sp)} muốn đổi nhà`, `${N(sp)} đặt lên bàn tờ rao bán một căn ba phòng ngủ, có sân nhỏ. ${c.kids_alive > 0 ? "Bọn trẻ đang lớn, ngủ chung một phòng mười hai mét vuông." : "Hai người làm việc ở nhà, chung một bàn ăn."} Bán ${name} vẫn chưa đủ, phải vay thêm.`, [
      C(`Bán ${name}, vay mua căn to hơn`, { sell: { kind: "house" }, buy: { kind: "house", name: "căn nhà ba phòng có sân", price: amt(c.price_years.house * 1.2, 0.5, 34), borrow: true }, ...tr(sp, 0.2), bw: -3 }, "Rộng rãi, nợ mới hai mươi năm"),
      C("Cơi nới thêm một phòng", { money: -amt(c.price_years.house * 0.06, 0.1, 1.5), ...tr(sp, 0.1), flags: ["house_extended"] }, "Đỡ chật, tốn một khoản, ồn mấy tháng"),
      C("Ở lại, chờ vài năm nữa", { ...tr(sp, -0.15), counters: { save: 1 } }, "Không thêm nợ, bạn đời không vui")], 2, { npc: sp });
  }),

  /* ---------- 13. ki-ốt / cửa hàng nhỏ ---------- */
  money("ma_kiosk", [22, 60], 10, 0.5, (c) => !c.owns.has("shop") && !c.broke, (c) => {
    const sh = c.price_years.shop;
    const place = vn(c) ? "ki-ốt chín mét vuông ở cổng chợ" : "cửa hàng mười hai mét vuông ở góc phố";
    return T(vn(c) ? "Ki-ốt cổng chợ sang nhượng" : "Cửa hàng góc phố rao bán", `Một ${place} đang được rao bán. Người bán làm hai mươi năm, giờ về quê. Mỗi sáng có hàng trăm người đi qua trước cửa.`, [
      C("Mua bằng tiền dành dụm", { buy: { kind: "shop", name: vn(c) ? "ki-ốt ở chợ" : "cửa hàng góc phố", price: amt(sh * 0.4, 0.2, 6) }, flags: ["own_business"] }, "Có chỗ buôn bán hoặc cho thuê, tiền khó rút ra"),
      C("Vay ngân hàng để mua", { buy: { kind: "shop", name: vn(c) ? "ki-ốt ở chợ" : "cửa hàng góc phố", price: amt(sh * 0.5, 0.3, 8), borrow: true }, flags: ["own_business"], bw: -3 }, "Giữ tiền mặt, góp nợ dù bán được hay không"),
      C("Thuê lại thay vì mua", { money: -0.05, flags: ["rented_shop"] }, "Ít vốn, chủ nhà có thể lấy lại bất cứ lúc nào"),
      C("Không mua", { happy: -1, counters: { save: 1 } }, "Không rủi ro, không có thêm nguồn thu")], 3);
  }),

  /* ---------- 14. tiền góp vay đè nặng ---------- */
  money("ma_loan_squeeze", [25, 70], 8, 0.5, (c) => c.loans > 0 && c.loan_burden > 0.2 && c.econ_phase !== "crisis", (c) => {
    const pct = Math.round(c.loan_burden * 10);
    return T("Tiền góp ăn hết phần dư", `Mỗi tháng, khoản góp vay mua đã ăn gần ${pct} phần mười thu nhập. Ngân hàng vừa báo lãi thả nổi tăng từ kỳ sau. Chậm góp hai năm liền là bị siết.`, [
      C("Chuyển sang sống tằn tiện", { lifestyle: "tan_tien", happy: -2 }, "Góp đủ, cả nhà chật vật nhiều năm"),
      ...(c.owns.has("vehicle") ? [C(`Bán ${c.asset_names.vehicle ?? "chiếc xe"} để có tiền đệm`, { sell: { kind: "vehicle" }, bw: -2 }, "Có thêm tiền mặt, đi lại vất vả")] : []),
      ...(c.owns.has("house") ? [C("Cho thuê một phòng trong nhà", { money: 0.08, happy: -3, flags: ["rents_room"] }, "Đỡ khoản góp, mất riêng tư", { tier: "awakened" as const })] : []),
      C("Giữ nguyên, hy vọng lương tăng", { bw: -3, flags: ["hoping_on_raise"] }, "Không đổi gì, rủi ro bị siết nếu có biến")], 0);
  }),

  /* ---------- 15. thuê hay mua ở nước giàu ---------- */
  money("ma_rent_vs_buy", [26, 50], 99, 0.45, (c) => c.gdp >= 30000 && !c.poor_country && !c.home_owner, (c) => {
    const h = c.price_years.house;
    return T("Tiền thuê nhà có phải là ném qua cửa sổ?", `Một đồng nghiệp vừa mua nhà nói đi thuê là ném tiền qua cửa sổ. Bạn ngồi tính: căn hộ đang thuê giá bằng khoảng ${Math.round(h)} năm thu nhập, tiền thuê thì chỉ bằng một phần tư lương. Lãi vay đang cao hơn hai năm trước.`, [
      C("Mua căn hộ đang thuê, vay hai mươi năm", { buy: { kind: "house", name: "căn hộ đang thuê", price: amt(h * 0.8, 0.5, 30), borrow: true }, happy: 2 }, "Có nhà, mất linh hoạt, gánh lãi vay"),
      C("Ở thuê, đều đặn gửi phần chênh lệch", { deposit: 0.3, flags: ["renter_by_choice"], counters: { save: 2 } }, "Linh hoạt, cần kỷ luật nhiều năm", { tier: "awakened" }),
      C("Chuyển về thị trấn nhỏ, mua nhà rẻ", { buy: { kind: "house", name: "căn nhà ở thị trấn nhỏ", price: amt(h * 0.3, 0.3, 10), borrow: true }, income_mult: 0.9, flags: ["moved_small_town"] }, "Nhà rẻ, lương thấp hơn và xa bạn bè"),
      C("Chưa quyết, ở thuê như cũ", { flags: ["renter"] }, "Không đổi gì, câu hỏi còn đó")], 3);
  }),

  /* ---------- 16. mua đất chung với anh chị em ---------- */
  money("ma_joint_land", [25, 55], 99, 0.35, (c) => !!role(c, "sibling") && !c.owns.has("land") && !c.broke, (c, N) => {
    const s = role(c, "sibling")!;
    const l = c.price_years.land;
    return T(`${N(s)} rủ mua đất chung`, `${N(s)} tìm được một mảnh đất năm trăm mét vuông ${vn(c) ? "ở quê, sát đường liên xã" : "ở ngoại ô, cạnh đường tỉnh"}, giá vừa, một mình không đủ tiền. ${N(s)} đề nghị mỗi người góp một nửa, ${vn(c) ? "đứng tên một người cho nhanh" : "đứng tên một người cho gọn"}.`, [
      C("Góp một nửa, lập giấy góp vốn có chữ ký", { buy: { kind: "land", name: "mảnh đất mua chung với anh chị em", price: amt(l * 0.5, 0.2, 6), with_npc: s }, ...mem(s, "WIN_WIN_DEAL", 0.25, "mua chung mảnh đất có giấy rõ ràng"), flags: ["written_agreement"] }, "Rõ ràng từ đầu, có thể làm anh chị em phật lòng", { tier: "sovereign" }),
      C("Góp một nửa, tin lời là đủ", { buy: { kind: "land", name: "mảnh đất mua chung với anh chị em", price: amt(l * 0.5, 0.2, 6), with_npc: s }, ...tr(s, 0.15), flags: ["handshake_land"] }, "Giữ hòa khí, sau này dễ tranh chấp"),
      C("Cho mượn tiền, đất để họ đứng tên", { lend: { npc: s, amount: amt(l * 0.4, 0.1, 5), years: 5 }, ...tr(s, 0.1) }, "Không vướng đất, chờ được trả"),
      C("Từ chối", { ...tr(s, -0.1) }, "Giữ tiền, anh chị em hơi buồn")], 0, { npc: s });
  }),
];
