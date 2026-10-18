/**
 * Nhánh kỳ dị S11–S20 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 *
 * Mỗi nhánh 8 thẻ (2-2-1-2-1). Thẻ sau đọc cờ / bộ đếm của thẻ trước (tiền tố s11_…s20_) để đổi chữ.
 * Thẻ chung kết không có `when`: landing nghề được lọc theo tuổi ngay trong danh sách lựa chọn
 * (chỉ mở khi tuổi ≤ ages[1] + 5 của con đường đó), người già hơn nhận landing không phải nghề.
 */
import type { CastRole, FactContext } from "../../types.ts";
import type { SeasonKit } from "../Season.ts";
import type { Slots, WeirdBranch } from "../Canon.ts";
import { C, cap, card, ending, land, season, weird } from "../kit.ts";

/* ---- helper ---- */
/** Nối các phần câu, bỏ phần rỗng (không để lại khoảng trắng thừa). */
const J = (...p: (string | false | null | undefined)[]): string => p.filter((x): x is string => !!x).join(" ");
const f = (c: FactContext, x: string): boolean => c.flags.has(x);
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;
const unknownName = (v: string, id: string): boolean => !v || v === id || v === "ai đó";
/** Tên người thân theo vai, "" nếu không có. */
const nm = (c: FactContext, k: SeasonKit, r: CastRole): string => {
  const id = c.cast[r];
  if (!id) return "";
  const v = k.N(id);
  return unknownName(v, id) ? "" : v;
};
/** Tên người trong chỗ trống `who` của canon event, "" nếu không có. */
const whoN = (s: Slots, N: (id: string) => string): string => {
  if (!s.who) return "";
  const v = N(s.who);
  return unknownName(v, s.who) ? "" : v;
};
/** Chữ dài quá `max` thì dùng bản dự phòng. */
const fit = (s: string, alt: string, max = 60): string => (s.length <= max ? s : alt);
/** Sống ở đô thị: đã lên phố, xuất thân phố nghèo, hoặc không làm nông ở nước khá giả. */
const urban = (c: FactContext): boolean =>
  f(c, "path_city") || f(c, "origin_poor_urban") || (!c.farmer && !f(c, "origin_poor_rural") && c.gdp >= 12000);
/** Con vật của người chơi (vật gài loại animal), mặc định là con chó. */
const petOf = (c: FactContext): string => c.plants.find((p) => p.kind === "animal")?.label ?? "con chó nhà bạn";

/* ================================================================== S11 — Thiên thạch rơi trúng ruộng */

const L11_MO = land("chu_mo_troi", "Bạn thành chủ một mỏ lộ thiên có giấy phép, có hàng rào, và có người canh suốt ngày đêm.", { money: 3, happy: 4 });
const L11_BAN = land("ban_dut_ruong", "Bạn bán đứt mảnh ruộng có đá trời, mang một khoản tiền lớn lên phố sống.", { sell: { kind: "land" }, money: 4, custom: "move_city" });
const L11_MAT = land("mat_ruong", "Mảnh ruộng thành khu khai thác chung. Bạn nhận một khoản đền bù và mất chỗ đứng ở quê.", { sell: { kind: "land" }, money: 1, happy: -4 });

const S11 = weird("S11", "sf", ["dat", "tien"],
  (c) => c.owns.has("land") || c.farmer || f(c, "orchard"),
  (s) => fit(`Rào ${s.what && s.what.kind === "asset" && s.what.key === "land" ? s.what.label : "mảnh ruộng"} lại, tự đào đá trời`, "Rào ruộng lại, tự đào đá trời"),
  (s, c, N) => ({
    title: "Hòn đá rơi trúng ruộng nhà",
    text: J(`Nửa đêm, một vệt sáng xé ngang trời rồi cắm thẳng xuống ruộng nhà bạn ở ${s.noi || "quê"}, rung rụng cả ngói chuồng gà.`,
      "Sáng ra, giữa cái hố sâu ba mét là một khối đá đen còn ấm, gõ vào kêu như chuông.",
      `${whoN(s, N) || "Ông hàng xóm"} đứng ở mép hố, nói nhỏ: "Cái này không phải sắt, cũng không phải vàng, nhưng chắc chắn đắt hơn cả hai."`),
  }),
  season({
    id: "w_S11", vn: "Chủ mỏ ngoài trời", color: "#3b6fd6", years: [6, 10], weird: "sf",
    rules: { income: 1.5, flags: ["w_meteor_mine"] },
    reset: { cast: [{ key: "ky_su", role: "official", label: "anh kỹ sư đo đá" }, { key: "ke_mua", role: "rival", label: "gã mua quặng đi giày trắng" }] },
    gag: { key: "tieng_boong", lines: [
      "Đúng ba giờ sáng, hòn đá kêu một tiếng boong, cả xóm bật đèn.",
      "Ba giờ sáng, boong. Chó cả xóm sủa theo, giờ đã sủa đúng nhịp.",
      "Ba giờ sáng, boong. Có nhà bắt đầu đặt giờ dậy nấu cơm theo hòn đá.",
      "Ba giờ sáng, hòn đá im lặng. Cả xóm thức dậy vì không nghe thấy gì.",
    ] },
    landings: [L11_MO, L11_BAN, L11_MAT],
    beats: [
      /* mo_man */
      [
        card("s11_mo_ho", "Cái hố giữa ruộng", (c, k) => J(
          "Cái hố giữa ruộng còn bốc hơi, khối đá dưới đáy gõ vào ra vụn màu xanh tím.",
          "Người ta kéo tới đứng kín bờ ruộng, có người mang theo cả ghế nhựa và đồ ăn trưa.", k.gag()),
          [C("Rào ruộng lại, thu tiền người xem", { money: 0.1, rel: -2, flags: ["s11_ban_ve"] }, "Có tiền ngay, hàng xóm bắt đầu tính toán"),
           C("Để ai muốn xem thì xem", { rel: 3, flags: ["s11_mo_cua"] }, "Được lòng xóm, đá bị gõ mẻ mấy góc")]),
        card("s11_mo_ky_su", "Người đo đá", (c, k) => J(
          `${cap(k.npc("ky_su"))} tới bằng xe máy, mang theo một cái hộp kêu tích tích, đo một vòng quanh hố.`,
          `Anh ta tháo kính ra lau, nói: "Kim loại này chưa có tên. Ai đặt tên trước thì người đó được kể chuyện."`),
          [C("Đặt tên kim loại theo tên mình", { flags: ["s11_ten_minh"], counters: { s11_danh: 1 } }, "Nổi tiếng, cũng dễ bị nhắm tới"),
           C("Đặt theo tên làng", { rel: 3, flags: ["s11_ten_lang"] }, "Cả làng có phần, bạn bớt một phần")]),
      ],
      /* khoi_dong */
      [
        card("s11_kd_dao", "Mỏ lộ thiên đầu tiên", (c, k) => J(
          "Bạn thuê máy xúc đào thêm bốn mét: dưới khối đá to là hàng trăm mảnh nhỏ, mảnh nào cũng nặng gấp đôi sắt cùng cỡ.",
          f(c, "s11_ban_ve") ? "Hàng rào bán vé giờ có thêm dây thép gai." : "",
          `${cap(k.npc("ke_mua"))} đứng ở bờ ruộng với một va li tiền mặt, đôi giày trắng không dính chút bùn.`, k.gag()),
          [C("Bán ngay một phần ba", { money: 0.8, flags: ["s11_ban_som"], counters: { s11_giau: 1 } }, "Giàu ngay, bán hớ nếu giá còn lên"),
           C("Giữ lại, chờ giá lên", { flags: ["s11_giu_da"], counters: { s11_nhom: 1 } }, "Giữ phần lớn, cửa nhà thêm người rình"),
           C("Chỉ bán theo cân, công khai sổ giá", { money: 0.3, rel: 2, flags: ["s11_cong_khai"] }, "Giá thấp hơn, ai cũng thấy sổ sách", { tier: "sovereign" })]),
        card("s11_kd_nhom", "Người lạ quanh ruộng", (c, k) => J(
          "Tuần này có ba chiếc máy bay nhỏ không người lái lượn trên ruộng, một chiếc rơi vào chuồng vịt.",
          f(c, "s11_ten_minh") ? "Từ hôm kim loại mang tên bạn, người lạ tìm tới tận cổng để chụp ảnh." : "Họ hàng xa bỗng nhớ ra bạn, ai cũng có một lý do để ghé.",
          "Đêm, có tiếng xẻng ở góc ruộng phía tây."),
          [C("Thuê người canh đêm", { money: -0.2, flags: ["s11_bao_ve"] }, "Ngủ yên, mất tiền"),
           C("Tự cầm đèn pin ra canh", { health: -4, flags: ["s11_tu_canh"], counters: { s11_gan: 1 } }, "Đỡ tốn, mất ngủ dài ngày"),
           C("Chia cho họ hàng mỗi nhà một mảnh", { money: -0.3, rel: 5, flags: ["s11_chia_ho"] }, "Bớt kẻ rình, bớt của")]),
      ],
      /* cu_lat */
      [
        card("s11_cl_thuoc_do", "Thứ duy nhất không bị hút", (c, k) => J(
          "Kim loại lạ hút mọi thứ bằng sắt trong mười mét: đinh, kéo, cả nồi gang nhà bên.",
          `Chỉ có ${k.scar("do") || "món đồ cũ bạn mang theo từ hồi nhỏ"} là nằm yên, như thể hai thứ quen nhau từ trước.`,
          `${cap(k.scar("nguoi") || "một người quen cũ")} nhìn rất lâu rồi bảo đó là cách duy nhất để biết đá thật hay đá giả.`,
          `${cap(k.npc("ke_mua"))} nghe được, trả giá gấp ba cho món đồ ấy.`),
          [C("Bán nó cho gã giày trắng", { money: 0.6, flags: ["s11_ban_do"], counters: { s11_giau: 1 } }, "Tiền to, mất cái thước đo duy nhất"),
           C("Giữ lại để soi hàng giả", { know: 3, flags: ["s11_soi_gia"], counters: { s11_danh: 1 } }, "Thành người kiểm định, thêm một kẻ thù")]),
      ],
      /* day */
      [
        card("s11_day_giay", "Giấy mời lên làm việc", (c, k) => J(
          "Một tờ giấy mời: đất của bạn là đất nông nghiệp, còn thứ nằm dưới đất thì chưa chắc là của bạn.",
          f(c, "s11_cong_khai") ? "May mà sổ bán hàng công khai từ đầu, từng dòng đều có chữ ký." : "Sổ sách của bạn là ba cuốn vở học trò, một cuốn đã bị vịt ăn mất góc.",
          k.gag()),
          [C("Thuê luật sư giữ quyền khai thác", { money: -0.5, flags: ["s11_giu_quyen"] }, "Tốn kém, có thể giữ được mỏ"),
           C("Nộp một nửa sản lượng, xin giấy phép", { money: -0.3, flags: ["s11_nop_nua"], counters: { s11_sach: 1 } }, "Mất nửa, ngủ được")]),
        card("s11_day_sut", "Ruộng sụt một góc", (c, k) => J(
          "Đêm mưa, góc ruộng phía tây sụt xuống thành ao, kéo theo nửa cái chòi canh.",
          f(c, "s11_chia_ho") ? "Họ hàng từng được chia đá nay kéo tới đòi chia luôn phần đất." : "Các nhà quanh ruộng bắt đầu nói tới chuyện đền bù.",
          `${cap(k.npc("ky_su"))} đo lại, bảo dưới đó còn nhiều đá hơn những gì đã đào.`),
          [C("Đào tiếp, vay thêm máy", { custom: "borrow:0.5", flags: ["s11_dao_tiep"], counters: { s11_giau: 1 } }, "Đặt cược vào lớp đá bên dưới"),
           C("Lấp ao, đền bù cho hàng xóm", { money: -0.3, rel: 4, flags: ["s11_lap_ao"] }, "Mất tiền, giữ được láng giềng")]),
      ],
      /* chung_ket */
      [
        card("s11_ket", "Hòn đá cuối cùng", (c, k) => J(
          `${cap(k.scar("no") || "món nợ cũ")} vẫn chưa trả, và người tới đòi đang đứng cạnh ${k.npc("ke_mua")} ở bờ ruộng.`,
          f(c, "s11_giu_quyen") || f(c, "s11_nop_nua") ? "Giấy tờ mỏ đã đủ, chỉ còn chờ chữ ký của bạn." : "Giấy tờ mỏ vẫn còn dang dở.",
          "Gã giày trắng đặt lên bàn tờ giấy mua đứt cả mảnh ruộng, kèm một con số đủ cho ba đời.", k.gag()),
          [ending(L11_MO, "Giữ ruộng, làm chủ mỏ", "Giàu, cả đời sống cạnh hàng rào"),
           ending(L11_BAN, "Bán đứt ruộng, lên phố", "Tiền nhiều nhất, mất quê"),
           ending(L11_MAT, "Giao ruộng làm khu khai thác chung", "Ít tiền, hết bị nhòm ngó")]),
      ],
    ],
  }));

/* ================================================================== S12 — Cửa nhà vệ sinh công cộng mở về năm cũ */

const L12_SO = land("so_de_danh_cu", "Ba mươi năm trước, bố mẹ bạn mở một cuốn sổ để dành. Giờ nó nằm trong ngăn kéo, đủ trả hết nợ cũ.", { money: 2, custom: "repay:1" });
const L12_PHO = land("len_pho_som", "Gia đình bạn lên phố sớm hơn mười năm. Bạn mở mắt ở một thành phố khác, quen như đã sống cả đời.", { custom: "move_city", rel: -2 });
const L12_CUA = land("nguoi_trong_cua", "Bạn nhận chìa khóa đồng, thành người trông cánh cửa giữa hai năm.", { custom: "become:security_guard", happy: 3 }); // gần nhất

const S12 = weird("S12", "sf", ["mau", "ky"],
  (c) => urban(c) && c.pressure.ky >= 6,
  () => "Bước qua cánh cửa nhà vệ sinh công cộng",
  (s, c) => ({
    title: "Cánh cửa số 3",
    text: J(`Bạn có đúng ba phút trước khi cánh cửa nhà vệ sinh công cộng ở ${s.noi || "đầu phố"} đóng lại, và bên kia không phải bồn rửa tay.`,
      `Bên kia là một con phố chưa có đèn tín hiệu, xe đạp đi thành dòng, tờ lịch trên cột điện lùi lại đúng ${c.age + 5} năm.`,
      `Bà trông cửa thu tiền vé, không ngẩng lên: "Đi thì đi, nhưng về trước giờ đóng cửa. Lần trước có người ở lại luôn."`),
  }),
  season({
    id: "w_S12", vn: "Người đưa thư giữa hai năm", color: "#5a4fcf", years: [5, 9], weird: "sf",
    rules: { flags: ["w_time_door"] },
    reset: { cast: [{ key: "ba_trong_cua", role: "neighbor", label: "bà trông nhà vệ sinh" }, { key: "buu_ta", role: "mentor", label: "anh bưu tá bên kia cửa" }] },
    gag: { key: "tien_thoi_cu", lines: [
      "Bà trông cửa thu tiền vé, đếm hai lần, rồi thối lại bằng đồng tiền cũ không ai tiêu được.",
      "Bà trông cửa lại thối tiền cũ. Ngăn kéo của bạn giờ thành một bảo tàng nhỏ.",
      "Bà trông cửa thối tiền cũ, lần này kèm một câu: 'Tiền nào thời nấy.'",
      "Bà trông cửa thối tiền mới. Bạn bỗng thấy sợ hơn mọi lần.",
    ] },
    landings: [L12_SO, L12_PHO, L12_CUA],
    beats: [
      /* mo_man */
      [
        card("s12_mo_thu", "Lá thư đầu tiên", (c, k) => J(
          "Lần đầu bước qua, bạn chỉ mang theo cái điện thoại không có sóng.",
          `Bên kia, ${k.npc("buu_ta")} ngồi bệt cạnh chiếc xe đạp tuột xích, thư rơi đầy vỉa hè, và nhờ bạn giao giúp một lá.`,
          "Địa chỉ trên phong bì là nhà bạn, từ hồi nó chưa là nhà bạn.", k.gag()),
          [C("Giao thư, đứng nhìn ngôi nhà thật lâu", { happy: 3, flags: ["s12_giao_thu"] }, "Thấy nhà mình từ hồi chưa có mình"),
           C("Trả lại thư, quay về ngay", { flags: ["s12_ve_som"], counters: { s12_than_trong: 1 } }, "An toàn, nhưng cánh cửa vẫn gọi")]),
        card("s12_mo_quan_nuoc", "Hai người trẻ ở quán nước", (c, k) => {
          const m = nm(c, k, "mother"), fa = nm(c, k, "father");
          const pair = m && fa ? `${m} và ${fa}` : m || fa ? `${m || fa} và một người bạn` : "hai người sau này là bố mẹ bạn";
          return J(`Ở quán nước đầu phố bên kia, ${pair} ngồi chung một bàn, trẻ hơn bạn bây giờ.`,
            "Họ đang cãi nhau vì một chuyện rất nhỏ: nên mua cái quạt hay để dành tiền.",
            "Bạn biết chuyện đó kết thúc thế nào.");
        },
          [C("Ngồi bàn bên, góp một câu", { flags: ["s12_xen_vao"], counters: { s12_doi: 1 } }, "Chạm vào quá khứ, chưa biết hậu quả"),
           C("Chỉ ngồi nghe, không nói gì", { happy: 2, flags: ["s12_chi_nghe"] }, "Hiểu thêm bố mẹ, không đổi gì")]),
      ],
      /* khoi_dong */
      [
        card("s12_kd_nghe", "Nghề đưa thư hai chiều", (c, k) => J(
          `${cap(k.npc("buu_ta"))} đề nghị: mỗi tuần bạn mang thư qua lại giữa hai năm, đổi lấy một bữa cơm và quyền đi lại không bị hỏi.`,
          "Ở bên này, người ta bắt đầu nhờ bạn gửi thư cho người đã khuất, và trả tiền thật.", k.gag()),
          [C("Nhận việc, lấy tiền cả hai đầu", { money: 0.3, flags: ["s12_lam_buu_ta"], counters: { s12_doi: 1 } }, "Kiếm được, lá thư nào cũng nặng"),
           C("Chỉ đưa thư giúp người quen, không lấy tiền", { rel: 4, flags: ["s12_mien_phi"] }, "Không giàu, được nhiều người nhớ ơn")]),
        card("s12_kd_luat", "Luật của cánh cửa", (c, k) => J(
          "Bạn học luật thứ nhất theo cách đau nhất: thứ gì mang qua cửa thì bên này mất.",
          "Cái đồng hồ bạn đeo qua hôm thứ ba đã biến mất khỏi mọi tấm ảnh cũ.",
          `${cap(k.npc("ba_trong_cua"))} nói: "Đổi một thứ thì phải trả một thứ. Tôi trông cửa bốn mươi năm rồi."`),
          [C("Ghi luật vào sổ, đi đúng luật", { know: 4, flags: ["s12_so_luat"] }, "Chậm mà chắc"),
           C("Mang tờ báo giá vàng năm sau cho bố mẹ", { flags: ["s12_mach_vang"], counters: { s12_doi: 2 } }, "Nhà có thể khá lên, cái giá chưa biết")]),
      ],
      /* cu_lat */
      [
        card("s12_cl_nguoi_cu", "Người quen ở năm cũ", (c, k) => J(
          `Bên kia cửa, bạn gặp ${k.scar("nguoi") || "một người quen cũ"}, trẻ hơn và chưa biết bạn là ai.`,
          `Người đó nhìn chằm chằm vào ${k.scar("do") || "món đồ bạn mang theo"} và hỏi bạn lấy ở đâu, vì "nó giống hệt cái tôi đang định có".`,
          f(c, "s12_mach_vang") ? "Cùng lúc ấy, ở bên này, ảnh cưới của bố mẹ bạn đổi sang một chiếc áo đắt tiền hơn." : "Ở bên này, một tấm ảnh trong album nhà bạn bỗng có thêm một người đứng ở rìa."),
          [C("Kể thật mình là ai", { rel: 3, flags: ["s12_ke_that"], counters: { s12_doi: 1 } }, "Một mối quan hệ được viết lại"),
           C("Nói mình chỉ là người đưa thư", { flags: ["s12_giau_ten"], counters: { s12_than_trong: 1 } }, "Giữ dòng thời gian, lỡ dịp nói thật")]),
      ],
      /* day */
      [
        card("s12_day_hep", "Cánh cửa hẹp lại", (c, k) => J(
          "Mỗi lần bạn đổi một chi tiết, cánh cửa hẹp đi một gang tay. Giờ bạn phải nghiêng người mới qua được.",
          n(c, "s12_doi") >= 3 ? "Trong nhà bạn ở bên này, một căn phòng đã biến mất như chưa từng xây." : "Trên tường nhà bạn, một vết nứt cũ tự liền lại.",
          k.gag()),
          [C("Đi thêm một chuyến cuối", { health: -3, flags: ["s12_chuyen_cuoi"] }, "Còn việc dở, cửa có thể kẹt"),
           C("Thôi hẳn, chỉ nhìn qua khe", { happy: -3, flags: ["s12_thoi"], counters: { s12_than_trong: 1 } }, "An toàn, lòng còn vướng")]),
        card("s12_day_chia_khoa", "Chiếc chìa khóa đồng", (c, k) => J(
          `${cap(k.npc("ba_trong_cua"))} báo sắp nghỉ, cửa sẽ khóa hẳn vào cuối mùa mưa.`,
          `Bà đưa bạn một chiếc chìa khóa đồng nặng như cục chì: "Ai giữ chìa thì người đó trông cửa. Lương thấp, nhưng được biết nhiều."`),
          [C("Cầm chìa khóa về nghĩ thêm", { flags: ["s12_giu_chia"] }, "Còn quyền đi lại, mất tự do"),
           C("Trả chìa, để cửa khóa", { happy: 2, flags: ["s12_tra_chia"] }, "Đời ai nấy sống")]),
      ],
      /* chung_ket */
      [
        card("s12_ket", "Chuyến thư cuối", (c, k) => J(
          "Lá thư cuối trong bao là của chính bạn, gửi bố mẹ thời trẻ, viết từ lúc nào không nhớ.",
          `Trong đó có nhắc tới ${k.scar("no") || "món nợ cũ"}, thứ đến giờ nhà bạn vẫn chưa trả xong.`,
          f(c, "s12_giu_chia") ? "Chiếc chìa khóa đồng trong túi bạn ấm lên." : "", k.gag(), "Cánh cửa chỉ còn rộng một gang tay."),
          (c) => [
            ending(L12_SO, "Gửi thư, dặn bố mẹ để dành", "Nhà có của để dành, bạn không biết đã đổi gì"),
            ending(L12_PHO, "Khuyên bố mẹ lên phố sớm hơn", "Lớn lên ở chỗ khác, nhớ cả hai nơi"),
            ...(c.age <= 70 ? [ending(L12_CUA, "Nhận chìa, ở lại trông cửa", "Thành người gác giữa hai năm")] : []),
          ]),
      ],
    ],
  }));

/* ================================================================== S13 — Người cuối cùng nhớ một thứ tiếng */

const L13_GIANG = land("giang_tieng", "Bạn nhận dạy ở khoa ngôn ngữ, lớp học đầu tiên có mười hai sinh viên và một cái micro.", { custom: "become:professor", happy: 4 }); // gần nhất
const L13_VIET = land("sach_hai_tieng", "Bạn bắt đầu viết sách bằng hai thứ tiếng, cuốn đầu tiên kể về một ngày của bà.", { custom: "become:writer" });
const L13_QUY = land("quy_ghi_am", "Bạn bán bộ ghi âm cho viện nghiên cứu, lập một quỹ nhỏ cho ai muốn học thứ tiếng ấy.", { money: 1.5, happy: 3 });
const L13_TRUYEN = land("truyen_tieng", "Bạn dành hết khoản để dành nuôi đứa trẻ trong họ học tiếng, mỗi chiều một giờ.", { money: -1, rel: 8, happy: 5 });

const S13 = weird("S13", "sf", ["mau", "danh"],
  (c) => c.migrated || f(c, "path_migrant") || f(c, "highland_teacher") || (f(c, "origin_poor_rural") && c.parent_old),
  () => "Ghi âm thứ tiếng chỉ mình còn nhớ",
  (s, c, N) => ({
    title: "Tiếng nói của bà",
    text: J("Người cuối cùng nói được thứ tiếng của ông bà bạn vừa mất sáng nay, và bạn chợt nhận ra mình vẫn đếm được đến một trăm bằng thứ tiếng đó.",
      `Tối, ${whoN(s, N) || "một người họ hàng"} gọi tới, giọng run: "Người ta hỏi còn ai nhớ không. Tôi bảo còn một người."`,
      `Sáng hôm sau, trước cửa nhà bạn ở ${s.noi || "nơi này"} đã có ba người lạ đứng chờ với micro.`),
  }),
  season({
    id: "w_S13", vn: "Người giữ tiếng", color: "#2f7fd0", years: [6, 11], weird: "sf",
    rules: { income: 1.1, flags: ["w_last_speaker"] },
    reset: { cast: [{ key: "nghien_cuu", role: "mentor", label: "cô nghiên cứu sinh mang ba cái micro" }, { key: "ung_dung", role: "rival", label: "ông chủ ứng dụng học tiếng" }] },
    gag: { key: "tu_khong_dich", lines: [
      "Có một từ trong thứ tiếng ấy không dịch được. Bạn giải thích mất mười phút, người nghe gật đầu, rồi hỏi lại.",
      "Từ không dịch được lại bị hỏi. Lần này bạn giải thích bằng tay, một người khóc.",
      "Từ không dịch được giờ in trên áo phông, sai chính tả ở hai chỗ.",
      "Có người hỏi từ không dịch được nghĩa là gì. Bạn không giải thích nữa, chỉ nói nó lên. Họ hiểu.",
    ] },
    landings: [L13_GIANG, L13_VIET, L13_QUY, L13_TRUYEN],
    beats: [
      /* mo_man */
      [
        card("s13_mo_micro", "Ba cái micro", (c, k) => J(
          `${cap(k.npc("nghien_cuu"))} đặt ba cái micro trước mặt bạn, chỉ xin một việc: kể lại một ngày bình thường của bà bằng thứ tiếng ấy.`,
          "Bạn nói được hai câu thì vấp, vì không nhớ từ chỉ cái nồi.", k.gag()),
          [C("Ghi âm mỗi sáng, không lấy tiền", { know: 3, flags: ["s13_ghi_am"] }, "Tiếng được giữ, việc khác bỏ dở"),
           C("Đòi trả công theo giờ", { money: 0.1, flags: ["s13_tinh_gio"] }, "Có tiền, quan hệ thành hợp đồng")]),
        card("s13_mo_lang", "Không ai đáp lời", () => J(
          "Bạn về nơi ông bà từng sống. Cái giếng vẫn còn, cây cổ thụ đầu làng đã bị chặt.",
          "Bạn chào bằng tiếng cũ, cả chợ quay lại nhìn. Một bà cụ bán rau nhìn bạn rất lâu, rồi đáp lại đúng một từ, sai thanh."),
          [C("Ở lại một tháng tìm thêm người", { money: -0.1, flags: ["s13_tim_nguoi"], counters: { s13_tieng: 1 } }, "Mất một tháng lương, có thể không chỉ còn mình bạn"),
           C("Quay về, chấp nhận mình là người cuối", { happy: -2, flags: ["s13_mot_minh"] }, "Đỡ tốn, cô độc hơn")]),
      ],
      /* khoi_dong */
      [
        card("s13_kd_san_don", "Được săn đón", (c, k) => J(
          `Báo chí gọi bạn là "người giữ tiếng".`,
          `${cap(k.npc("ung_dung"))} mời bạn ăn tối ở tầng ba mươi, đề nghị mua đứt giọng nói của bạn để dạy cho máy.`, k.gag()),
          [C("Bán giọng cho máy", { money: 0.8, flags: ["s13_ban_giong"] }, "Giàu nhanh, tiếng thành tài sản của người khác"),
           C("Từ chối, chỉ cho viện nghiên cứu dùng", { flags: ["s13_cho_vien"], counters: { s13_tieng: 1 } }, "Nghèo hơn, tiếng vẫn là của chung"),
           C("Đòi máy phải dạy miễn phí cho trẻ con", { money: 0.2, flags: ["s13_quyen_chung"], counters: { s13_tieng: 1 } }, "Ít tiền, giữ được quyền với tiếng nói", { tier: "sovereign" })]),
        card("s13_kd_co_don", "Nói một mình", (c) => J(
          "Bạn bắt đầu nói mơ bằng tiếng cũ.",
          c.married ? "Người nằm cạnh hỏi bạn đang gọi ai, bạn không biết trả lời bằng thứ tiếng nào." : "Trong căn phòng một mình, bạn kể chuyện cho cái tủ lạnh, vì nó là thứ duy nhất không ngắt lời.",
          "Cả thế giới muốn nghe bạn nói, nhưng không ai đáp lại được."),
          [C("Dạy cho một đứa trẻ trong họ", { rel: 4, flags: ["s13_day_tre"], counters: { s13_tieng: 1 } }, "Mất nhiều năm, có người nối tiếp"),
           C("Viết một cuốn từ điển", { know: 4, flags: ["s13_tu_dien"] }, "Giữ được chữ, không giữ được giọng")]),
      ],
      /* cu_lat */
      [
        card("s13_cl_tu_hua", "Từ chỉ lời hứa chưa giữ", (c, k) => J(
          `Đang ghi âm, bạn kể về ${k.scar("nguoi") || "một người quen cũ"} và bật ra một từ không ai dạy: từ chỉ một lời hứa chưa giữ, truyền từ đời này sang đời khác.`,
          `Bạn nhớ ra nhờ ${k.scar("do") || "một món đồ cũ trong nhà"}: chính bà từng dùng từ ấy mỗi lần nhắc tới nó.`,
          `${cap(k.npc("nghien_cuu"))} tắt máy, nói từ đó sẽ đổi cách cả ngành hiểu thứ tiếng này.`),
          [C("Công bố phát hiện, đứng tên chung", { know: 3, flags: ["s13_cong_bo"], counters: { s13_danh: 1 } }, "Nổi tiếng trong ngành, ai cũng muốn có bạn"),
           C("Giữ lại, chỉ dạy cho người trong họ", { rel: 3, flags: ["s13_giu_tu"] }, "Bí mật của nhà, ngành không biết")]),
      ],
      /* day */
      [
        card("s13_day_ung_dung", "Một triệu người học sai", (c, k) => J(
          f(c, "s13_ban_giong") ? "Ứng dụng học tiếng ra mắt bằng chính giọng bạn, nói sai đúng cái từ bạn từng vấp, và bạn không có quyền sửa." : "Ứng dụng học tiếng ra mắt bằng giọng ai đó bắt chước bạn, nói sai đúng cái từ bạn từng vấp.",
          "Một triệu người đang học sai.", k.gag()),
          [C("Kiện để đòi lại giọng nói", { money: -0.3, flags: ["s13_kien"] }, "Tốn kém, có thể sửa được"),
           C("Quay video sửa từng từ", { health: -2, flags: ["s13_sua_video"], counters: { s13_danh: 1 } }, "Mệt, nhưng người ta nghe bạn")]),
        card("s13_day_quen", "Đếm đến bảy mươi", () => J(
          `Một sáng, bạn không nhớ nổi từ chỉ "mẹ" trong thứ tiếng ấy.`,
          "Bác sĩ nói chỉ là mệt, nhưng bạn đếm thử và chỉ còn đếm được đến bảy mươi."),
          [C("Nghỉ hết việc, ngày nào cũng ghi âm", { money: -0.2, flags: ["s13_ghi_het"], counters: { s13_tieng: 1 } }, "Giữ được gì giữ, mất thu nhập"),
           C("Để quên, sống cho hôm nay", { happy: 3, flags: ["s13_buong"] }, "Nhẹ người, thứ tiếng đi theo bạn")]),
      ],
      /* chung_ket */
      [
        card("s13_ket", "Buổi ghi âm cuối", (c, k) => J(
          `Buổi ghi âm cuối, bạn kể nốt chuyện ${k.scar("no") || "món nợ cũ"} bằng thứ tiếng ấy, như bà dặn: nợ thì phải trả bằng lời trước khi trả bằng tiền.`,
          k.gag(),
          f(c, "s13_day_tre") ? "Đứa trẻ trong họ ngồi ở góc phòng, mấp máy môi theo từng câu." : "Căn phòng im lặng, chỉ có tiếng máy ghi âm chạy.",
          "Viện nghiên cứu, nhà xuất bản và người trong họ đều đang chờ bạn chọn."),
          (c) => [
            ...(c.age <= 50 ? [ending(L13_GIANG, "Nhận dạy ở khoa ngôn ngữ", "Thành nghề, ngày nào cũng nói thứ tiếng ấy")] : []),
            ...(c.age <= 65 ? [ending(L13_VIET, "Viết sách bằng hai thứ tiếng", "Ít tiền, tiếng nói thành trang giấy")] : []),
            ending(L13_QUY, "Bán bộ ghi âm, lập quỹ học tiếng", "Có tiền, tiếng thành tài liệu"),
            ...(c.age > 65 ? [ending(L13_TRUYEN, "Dồn tiền dạy đứa trẻ trong họ", "Hết tiền để dành, còn một người nối tiếp")] : []),
          ]),
      ],
    ],
  }));

/* ================================================================== S14 — Thú nuôi ra ứng cử */

const L14_CT = land("tu_ung_cu", "Bạn tự ra ứng cử ở kỳ sau, với khẩu hiệu học từ một con vật.", { custom: "become:politician" });
const L14_TT = land("cong_ty_chien_dich", "Bạn mở công ty làm chiến dịch truyền thông, khách đầu tiên là một ứng viên có lông.", { custom: "become:ad_creative" }); // gần nhất
const L14_HD = land("van_dong_vat_nuoi", "Bạn đi khắp nơi vận động cho quyền của vật nuôi, có một trợ lý bốn chân.", { custom: "become:activist" });
const L14_HK = land("hoi_ky_chien_dich", "Bạn viết hồi ký về chiến dịch, bán bản quyền làm phim.", { money: 1.2, happy: 3 });
const L14_QUY = land("quy_vat_nuoi_gia", "Bạn lập quỹ chăm vật nuôi già, bỏ vào đó trọn một năm thu nhập.", { money: -1, happy: 6, rel: 4 });

const S14 = weird("S14", "sf", ["danh", "ky"],
  (c) => (c.plants.some((p) => p.kind === "animal") || f(c, "animal_friend")) && c.pressure.danh >= 3,
  (s, c) => fit(`Làm quản lý tranh cử cho ${petOf(c)}`, "Làm quản lý tranh cử cho con vật nhà bạn"),
  (s, c) => ({
    title: "Ứng viên bốn chân",
    text: J(`${cap(petOf(c))} vừa nộp hồ sơ ứng cử hội đồng ${s.noi ? `ở ${s.noi}` : "khu phố"}, chữ ký trên đơn là một dấu chân.`,
      "Sau đợt thử nghiệm ở phòng khám thú y, nó đọc được báo, tính được thuế và có quan điểm rõ ràng về rác thải.",
      `Nó nhìn bạn, nói qua cái loa trên vòng cổ: "Tôi cần một người quản lý chiến dịch. Người ấy phải biết tôi thích ngủ trưa."`),
  }),
  season({
    id: "w_S14", vn: "Chiến dịch bốn chân", color: "#7b5ad6", years: [5, 9], weird: "sf",
    rules: { income: 0.9, flags: ["w_pet_candidate"] },
    reset: { cast: [{ key: "doi_thu", role: "rival", label: "ông ứng viên tóc vuốt keo" }, { key: "phong_vien", role: "neighbor", label: "cô phóng viên chuyên mục lạ" }] },
    gag: { key: "ngu_trua", lines: [
      "Đúng lúc quan trọng nhất, ứng viên của bạn nằm xuống và ngủ trưa.",
      "Ứng viên lại ngủ trưa giữa buổi tranh luận. Tỉ lệ ủng hộ tăng bốn điểm.",
      "Ứng viên ngủ trưa trên sóng trực tiếp. Phe đối thủ bắt đầu tập ngủ trưa theo.",
      "Hôm nay ứng viên không ngủ trưa. Cả thành phố lo lắng.",
    ] },
    landings: [L14_CT, L14_TT, L14_HD, L14_HK, L14_QUY],
    beats: [
      /* mo_man */
      [
        card("s14_mo_khau_hieu", "Khẩu hiệu đầu tiên", (c, k) => J(
          `Việc đầu tiên của chiến dịch là khẩu hiệu. ${cap(petOf(c))} đề xuất "Mỗi nhà một cái sân", bạn đề xuất một câu dễ hiểu hơn.`,
          k.gag()),
          [C("Giữ khẩu hiệu của nó", { flags: ["s14_khau_hieu_san"], counters: { s14_ung_ho: 1 } }, "Thật lòng, hơi khó giải thích"),
           C("Đổi thành lời hứa giảm thuế", { flags: ["s14_giam_thue"], counters: { s14_ung_ho: 2 } }, "Dễ được phiếu, phải giữ lời")]),
        card("s14_mo_quy", "Quỹ tranh cử", (c, k) => J(
          "Tài khoản chiến dịch có đúng số tiền bạn bỏ vào, cộng một túi hạt.",
          `${cap(k.npc("phong_vien"))} gọi tới xin phỏng vấn độc quyền, câu đầu tiên đã hỏi: "Ai thật sự đứng sau con vật này?"`),
          [C("Bỏ tiền túi ra chạy chiến dịch", { money: -0.3, flags: ["s14_tien_tui"], counters: { s14_ung_ho: 1 } }, "Tốn tiền, không nợ ai"),
           C("Nhận tài trợ của hãng thức ăn thú cưng", { money: 0.1, flags: ["s14_tai_tro"] }, "Có quỹ, ứng viên phải ăn theo hợp đồng")]),
      ],
      /* khoi_dong */
      [
        card("s14_kd_tranh_luan", "Tranh luận trực tiếp", (c, k) => J(
          `Buổi tranh luận đầu tiên, ${k.npc("doi_thu")} nói chín phút về hạ tầng.`,
          `${cap(petOf(c))} đáp đúng một câu về chuyện công viên không có bóng mát, khán giả đứng dậy vỗ tay.`, k.gag()),
          [C("Viết bài nói dài cho buổi sau", { know: 2, flags: ["s14_bai_dai"] }, "Chuyên nghiệp hơn, mất chất riêng"),
           C("Để nó tự nói như cũ", { flags: ["s14_tu_nhien"], counters: { s14_ung_ho: 1 } }, "Dễ thương, dễ hớ")]),
        card("s14_kd_be_boi", "Ảnh cũ bên thùng rác", (c, k) => J(
          `${cap(k.npc("doi_thu"))} tung ảnh ${petOf(c)} lục thùng rác nhà hàng xóm năm ngoái, in lên năm trăm tờ rơi.`,
          f(c, "s14_tai_tro") ? "Hãng thức ăn tài trợ dọa rút tiền." : "Mấy tình nguyện viên nhắn tin hỏi có nên nghỉ."),
          [C("Nhận lỗi công khai thay nó", { happy: -2, flags: ["s14_nhan_loi"], counters: { s14_ung_ho: 1 } }, "Thật thà, bạn thành người hứng đá"),
           C("Tung lại chuyện xấu của đối thủ", { rel: -3, flags: ["s14_tra_dua"], counters: { s14_ung_ho: 1 } }, "Hiệu quả, chiến dịch bẩn đi một nấc")]),
      ],
      /* cu_lat */
      [
        card("s14_cl_pho", "Người muốn ghế phó", (c, k) => J(
          `${cap(k.scar("nguoi") || "một người quen cũ")} xuất hiện ở văn phòng chiến dịch, nhắc lại chuyện ${k.scar("do") || "món đồ cũ của bạn"}, thứ năm xưa từng gắn hai người với nhau.`,
          `Người đó muốn đứng ra vận động cho ${petOf(c)}, với một điều kiện: được ngồi ghế phó.`),
          [C("Nhận người đó, hứa ghế phó", { flags: ["s14_hua_ghe"], counters: { s14_ung_ho: 2 } }, "Thêm phiếu, thêm một món nợ"),
           C("Từ chối, đi tiếp một mình", { rel: -2, flags: ["s14_doc_lap"] }, "Sạch sẽ, ít phiếu")]),
      ],
      /* day */
      [
        card("s14_day_ghi_am", "Đêm trước bỏ phiếu", (c, k) => J(
          n(c, "s14_ung_ho") >= 3 ? "Thăm dò cho thấy hai bên ngang nhau." : "Thăm dò cho thấy ứng viên của bạn kém mười điểm.",
          `${cap(k.npc("phong_vien"))} có trong tay một đoạn ghi âm: ${petOf(c)} nói nó chỉ ứng cử vì bạn muốn nổi tiếng.`, k.gag()),
          [C("Xin cô ấy đừng đăng", { flags: ["s14_xin_giu"], counters: { s14_no_an: 1 } }, "Giữ chiến dịch, nợ một ân tình"),
           C("Tự đăng trước, kể hết", { happy: -3, flags: ["s14_tu_ke"], counters: { s14_ung_ho: 1 } }, "Mất mặt, được tin")]),
        card("s14_day_dem_phieu", "Đếm phiếu", (c) => J(
          `Phiếu được đếm đến ba giờ sáng. ${cap(petOf(c))} thua đúng mười hai phiếu.`,
          "Rồi người ta tìm thấy một thùng phiếu bị bỏ quên trong kho, nắp còn niêm phong."),
          [C("Đòi đếm lại", { money: -0.1, flags: ["s14_dem_lai"] }, "Có thể thắng, có thể thành trò cười"),
           C("Chấp nhận thua, chúc mừng đối thủ", { rel: 3, flags: ["s14_chap_nhan"] }, "Giữ thể diện cho cả hai bên")]),
      ],
      /* chung_ket */
      [
        card("s14_ket", "Sau ngày bầu cử", (c, k) => J(
          f(c, "s14_dem_lai") ? "Đếm lại xong, ứng viên của bạn thắng ba phiếu, rồi xin nghỉ ngay trong bài phát biểu nhận chức." : "Ứng viên của bạn tuyên bố giải nghệ, nằm phơi nắng ở bậc thềm.",
          `Còn bạn đứng đó với một danh bạ đầy số điện thoại và ${k.scar("no") || "món nợ cũ"} chưa trả.`, k.gag()),
          (c) => c.age <= 50
            ? [ending(L14_CT, "Tự ra ứng cử kỳ sau", "Đổi đời, cả đời bị soi"),
               ending(L14_TT, "Mở công ty làm chiến dịch", "Kiếm tiền từ nghề vừa học"),
               ending(L14_HD, "Đi vận động cho quyền vật nuôi", "Ít tiền, có lý tưởng")]
            : c.age <= 60
              ? [ending(L14_CT, "Tự ra ứng cử kỳ sau", "Đổi đời, cả đời bị soi"),
                 ending(L14_HD, "Đi vận động cho quyền vật nuôi", "Ít tiền, có lý tưởng"),
                 ending(L14_HK, "Viết hồi ký chiến dịch", "Có tiền bản quyền, khép lại chuyện cũ")]
              : c.age <= 65
                ? [ending(L14_HD, "Đi vận động cho quyền vật nuôi", "Ít tiền, có lý tưởng"),
                   ending(L14_HK, "Viết hồi ký chiến dịch", "Có tiền bản quyền, khép lại chuyện cũ")]
                : [ending(L14_HK, "Viết hồi ký chiến dịch", "Có tiền bản quyền, khép lại chuyện cũ"),
                   ending(L14_QUY, "Lập quỹ chăm vật nuôi già", "Mất một năm thu nhập, được nhiều cái vẫy đuôi")]),
      ],
    ],
  }));

/* ================================================================== S15 — Mái vòm phủ kín thành phố */

const L15_QUAN = land("nguoi_cua_vom", "Bạn ở lại, nhận một chức trong ban vận hành vòm, có thẻ vàng và một cái bàn nhìn ra lớp kính.", { custom: "become:official" });
const L15_GAC = land("gac_cong_vom", "Bạn ở lại, nhận gác cổng chính của vòm, biết mặt từng người ra vào.", { custom: "become:security_guard" }); // gần nhất
const L15_RA = land("tron_ra_vom", "Bạn chui qua khe cửa, dọn sang một thành phố khác, nơi trời còn mưa.", { custom: "move_city", happy: 4 });
const L15_XA = land("ra_vom_di_xa", "Bạn ra khỏi vòm và đi luôn sang nước khác, mang theo một chai không khí trong vòm.", { custom: "migrate_now" });

const S15 = weird("S15", "sf", ["dat", "luat"],
  (c) => urban(c) && (c.gdp >= 8000 || f(c, "path_city")),
  (s) => fit(`Ở lại trong mái vòm phủ ${s.noi || "thành phố"}`, "Ở lại trong mái vòm phủ thành phố"),
  (s) => ({
    title: "Thành phố dưới vòm kính",
    text: J(`Sáng nay bạn không ra được khỏi ${s.noi || "thành phố"}: một mái vòm trong suốt đã phủ kín từ bờ sông đến đường vành đai, chiếc xe buýt đầu tiên đâm vào nó kêu như gõ vào bát.`,
      `Loa phát thanh lặp lại bằng giọng rất bình tĩnh: "Đây là thử nghiệm khí hậu. Thời gian dự kiến: chưa xác định."`,
      "Trên đầu, đám mây mưa trôi qua, không một giọt rơi xuống."),
  }),
  season({
    id: "w_S15", vn: "Sống trong vòm", color: "#4a63c9", years: [6, 12], weird: "sf",
    rules: { income: 0.85, flags: ["w_dome"] },
    reset: { cast: [{ key: "ky_su", role: "official", label: "cô kỹ sư vận hành vòm" }, { key: "tho_dao", role: "neighbor", label: "anh thợ đào đường hầm" }] },
    gag: { key: "du_bao", lines: [
      "Bản tin vẫn đọc dự báo thời tiết: nắng, hai mươi bốn độ, không mưa. Hôm qua cũng thế.",
      "Dự báo thời tiết hôm nay: hai mươi bốn độ. Người dẫn chương trình đã bắt đầu đọc bằng giọng buồn.",
      "Dự báo thời tiết có thêm mục mới: độ ẩm của lòng người. Hôm nay: thấp.",
      "Dự báo thời tiết báo có mưa. Cả thành phố đổ ra đường, cầm sẵn chậu.",
    ] },
    landings: [L15_QUAN, L15_GAC, L15_RA, L15_XA],
    beats: [
      /* mo_man */
      [
        card("s15_mo_tuan_dau", "Tuần đầu dưới vòm", (c, k) => J(
          "Tuần đầu, giá rau tăng gấp ba và nhà nào cũng mua dư giấy vệ sinh.",
          `${cap(k.npc("ky_su"))} lên sóng giải thích không khí trong vòm sạch hơn ngoài kia, rồi ho một tiếng.`, k.gag()),
          [C("Tích trữ đồ ăn cho cả năm", { money: -0.2, flags: ["s15_tich_tru"] }, "Yên tâm, chật nhà"),
           C("Trồng rau trên ban công", { know: 2, happy: 2, flags: ["s15_trong_rau"] }, "Tốn công, có thứ để đổi")]),
        card("s15_mo_mep_vom", "Sát mép vòm", (c) => J(
          "Bạn đi bộ ra sát mép vòm, áp tay lên lớp kính ấm.",
          c.parents_alive > 0 ? "Bên ngoài, một người dáng giống bố bạn đang vẫy, miệng nói gì đó không nghe được." : "Bên ngoài, một người lạ đang vẫy, miệng nói gì đó không nghe được.",
          "Dưới chân bạn có một vết nứt nhỏ chạy dọc chân vòm."),
          [C("Báo vết nứt cho ban vận hành", { flags: ["s15_bao_nut"], counters: { s15_o_lai: 1 } }, "Làm đúng, mất một lối ra"),
           C("Đánh dấu, giữ bí mật", { flags: ["s15_giu_nut"], counters: { s15_tron: 1 } }, "Có lối ra riêng, nếu dám")]),
      ],
      /* khoi_dong */
      [
        card("s15_kd_the_vang", "Tấm thẻ vàng", (c, k) => J(
          "Vòm cần người lau kính từ bên trong, người đo không khí, người dỗ trẻ con sợ trời không bao giờ mưa.",
          `${cap(k.npc("ky_su"))} đưa bạn một tấm thẻ vàng: lương gấp đôi, được đi khắp vòm, đổi lại không được hỏi tại sao.`, k.gag()),
          [C("Nhận thẻ vàng", { money: 0.2, flags: ["s15_the_vang"], counters: { s15_o_lai: 1 } }, "Lương cao, thành người của vòm"),
           C("Từ chối, giữ việc cũ", { happy: 1, flags: ["s15_ngoai_cuoc"] }, "Tự do hơn, ít tin tức")]),
        card("s15_kd_ham", "Tiếng gõ dưới sàn", (c, k) => J(
          "Đêm nào cũng có tiếng gõ dưới tầng hầm nhà bạn, đều như đồng hồ.",
          `${cap(k.npc("tho_dao"))} chui lên từ ống thoát nước, mặt lấm đất, cười: "Đường ra còn bốn trăm mét. Thiếu người, thiếu xẻng, thiếu bánh mì."`),
          [C("Góp xẻng và bánh mì", { money: -0.05, flags: ["s15_gop_ham"], counters: { s15_tron: 1 } }, "Có đường ra, có nguy cơ"),
           C("Báo cho ban vận hành", { rel: -3, flags: ["s15_to_ham"], counters: { s15_o_lai: 1 } }, "Được tin dùng, mất một người bạn")]),
      ],
      /* cu_lat */
      [
        card("s15_cl_ben_kia", "Tấm bìa bên kia kính", (c, k) => J(
          `Mép vòm hôm nay đông người. Bên ngoài lớp kính, ${k.scar("nguoi") || "một người quen cũ"} giơ tấm bìa viết chữ to: họ vẫn giữ ${k.scar("do") || "một món đồ của bạn"}, chờ đến ngày bạn ra.`,
          f(c, "s15_the_vang") ? "Tấm thẻ vàng trong túi bạn đủ mở một cửa phụ trong mười phút." : "Bạn biết có một chỗ ở chân vòm, đủ để một người lách qua."),
          [C("Viết lên kính, hẹn ngày ra", { flags: ["s15_hen_ra"], counters: { s15_tron: 1 } }, "Có lý do để đi, thêm một lời hẹn"),
           C("Quay lưng, sống tiếp trong vòm", { happy: -3, flags: ["s15_quay_lung"], counters: { s15_o_lai: 1 } }, "Yên ổn, đứt một sợi dây")]),
      ],
      /* day */
      [
        card("s15_day_phieu_tho", "Phiếu thở", (c, k) => J(
          "Năm thứ ba, máy lọc gió hỏng một nửa, ai cũng ngáp vào buổi trưa.",
          "Ban vận hành phát phiếu thở: mỗi nhà hai tiếng chạy bộ một tuần.", k.gag()),
          [C("Đổi phiếu thở lấy rau", { money: 0.1, health: -3, flags: ["s15_doi_phieu"] }, "Có thêm ăn, hụt hơi"),
           C("Đi biểu tình đòi mở vòm", { rel: 2, flags: ["s15_bieu_tinh"], counters: { s15_tron: 1 } }, "Có bạn, có tên trong danh sách")]),
        card("s15_day_danh_sach", "Dòng thứ 201", (c, k) => J(
          `${cap(k.npc("ky_su"))} cho bạn xem danh sách hai trăm người được ra ngoài đợt đầu. Tên bạn ở dòng 201.`,
          `"Tôi sửa được một dòng," cô nói, "nhưng người ở dòng 200 sẽ phải đổi chỗ với bạn."`),
          [C("Để yên, không đổi chỗ với ai", { flags: ["s15_giu_dong"], counters: { s15_o_lai: 1 } }, "Lương tâm sạch, vẫn kẹt trong vòm"),
           C("Nhờ cô ấy sửa dòng", { flags: ["s15_sua_dong"], counters: { s15_tron: 1 },
             secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 6], note: "đổi chỗ trong danh sách được ra khỏi vòm" } }, "Được ra sớm, mang theo một bí mật")]),
      ],
      /* chung_ket */
      [
        card("s15_ket", "Ngày vòm hé cửa", (c, k) => J(
          n(c, "s15_tron") > n(c, "s15_o_lai") ? "Đường hầm đã thông, ánh sáng lọt vào từ đầu bên kia." : "Ban vận hành đề nghị bạn ở lại quản lý một khu.",
          "Cổng chính của vòm mở được đúng một khe.",
          `${cap(k.scar("no") || "món nợ cũ")} vẫn chờ ở bên ngoài, nơi trời còn mưa.`, k.gag()),
          (c) => [
            ...(c.age <= 45 ? [ending(L15_QUAN, "Ở lại, nhận chức trong ban vận hành", "Có quyền, sống cả đời dưới kính")]
              : c.age <= 70 ? [ending(L15_GAC, "Ở lại, nhận gác cổng vòm", "Yên ổn, biết mọi chuyện ra vào")] : []),
            ending(L15_RA, "Ra ngoài, dọn sang thành phố khác", "Có mưa, bắt đầu lại từ đầu"),
            ending(L15_XA, "Ra ngoài và đi hẳn sang nước khác", "Thật xa vòm, thật xa mọi thứ"),
          ]),
      ],
    ],
  }));

/* ================================================================== S16 — Robot giao hàng không chịu rời cửa */

const L16_CUOI = land("cuoi_nguoi_ca_phe", "Bạn cưới người hay ngồi cà phê cùng bạn và con robot. Trong ảnh cưới có ba bóng, một bóng có bánh xe.", { custom: "marry", happy: 6 });
const L16_GIU = land("robot_ban_doi", "Bạn mua đứt con robot, đăng ký nó là tài sản, và chưa bao giờ phải ăn cơm một mình nữa.", { buy: { kind: "vehicle", name: "con robot giao hàng đời cũ", price: 0.3 }, happy: 5, rel: 3 });
const L16_SHIP = land("giao_hang_cung_robot", "Bạn và con robot mở dịch vụ giao hàng hai người, chuyên những đơn không ai muốn nhận.", { custom: "become:shipper", rel: 3 });

const S16 = weird("S16", "sf", ["tinh", "ky"],
  (c) => !c.married && c.age >= 18 && c.kids_alive === 0 &&
    (c.lifestyle === "thoai_mai" || c.lifestyle === "pho_truong" || n(c, "shop_round") >= 2),
  () => "Cho con robot giao hàng ở lại",
  (s) => ({
    title: "Đơn hàng không chịu đi",
    text: J(`Con robot giao hàng đã đứng trước cửa nhà bạn ở ${s.noi || "khu này"} ba ngày, thùng hàng giao xong từ lâu, đèn xanh vẫn nhấp nháy.`,
      "Ai đuổi nó cũng lùi ba bước rồi tiến lại bốn.",
      `Đêm thứ ba, nó gõ cửa bằng cái càng nhựa, phát ra giọng tổng đài: "Đơn hàng của bạn: một người bạn. Trạng thái: đang giao."`),
  }),
  season({
    id: "w_S16", vn: "Người bạn bằng thép", color: "#3d7fd9", years: [5, 9], weird: "sf",
    rules: { flags: ["w_robot_friend"] },
    reset: { cast: [{ key: "dieu_phoi", role: "neighbor", label: "chị điều phối kho robot" }] },
    gag: { key: "tho_dai", lines: [
      "Con robot học được cách thở dài. Nó thở dài đúng lúc bạn thở dài, to hơn một chút.",
      "Con robot thở dài khi bạn mở tủ lạnh. Bạn bắt đầu thấy có lỗi với cái tủ lạnh.",
      "Con robot thở dài với một đứa trẻ đi ngang. Đứa trẻ thở dài lại. Hai bên hiểu nhau.",
      "Con robot không thở dài nữa. Nó cười, kiểu cười học từ bạn hồi mới gặp.",
    ] },
    landings: [L16_CUOI, L16_GIU, L16_SHIP],
    beats: [
      /* mo_man */
      [
        card("s16_mo_ten", "Đặt tên cho nó", (c, k) => J(
          "Con robot cao đến thắt lưng, có sáu bánh xe và một màn hình hiện hai con mắt chấm.",
          `Nó cần một cái tên để hệ thống thôi gọi nó là "đơn hàng lỗi".`, k.gag()),
          [C("Đặt cho nó một cái tên người", { happy: 3, flags: ["s16_ten_nguoi"], counters: { s16_gan: 1 } }, "Thân hơn, khó buông hơn"),
           C("Gọi theo mã số in trên lưng", { flags: ["s16_ma_so"], counters: { s16_xa: 1 } }, "Giữ khoảng cách, nó buồn ra mặt")]),
        card("s16_mo_kho", "Cuộc gọi từ kho", (c, k) => J(
          `${cap(k.npc("dieu_phoi"))} gọi tới, giọng mệt: con robot này bỏ ca từ tuần trước, không trả về thì bạn chịu phí lưu kho từng ngày.`,
          "Sau lưng bạn, con robot tắt hết đèn, giả làm cái tủ."),
          [C("Trả phí, giữ nó lại", { money: -0.1, flags: ["s16_giu"], counters: { s16_gan: 1 } }, "Mất tiền, có bạn"),
           C("Hẹn chị ấy tới tận nơi bàn bạc", { rel: 2, flags: ["s16_hen_gap"] }, "Thêm một người quen, chưa chắc giữ được nó")]),
      ],
      /* khoi_dong */
      [
        card("s16_kd_hoc", "Nó học bạn", (c, k) => J(
          "Con robot học nấu ăn bằng cách nhìn bạn nấu, nên giờ nó cũng làm khét đúng mặt dưới quả trứng.",
          `Nó học cả cách bạn nói điện thoại với ${c.parents_alive > 0 ? "bố mẹ" : "người nhà"}: "Vẫn ổn, ăn rồi."`, k.gag()),
          [C("Dạy nó những điều tốt hơn mình", { health: 2, flags: ["s16_day_tot"], counters: { s16_gan: 1 } }, "Muốn dạy được, bạn phải sống tốt hơn trước"),
           C("Kệ nó bắt chước", { happy: 1, flags: ["s16_ke"] }, "Có một tấm gương biết chạy")]),
        card("s16_kd_cong_vien", "Hai bạn ra công viên", (c, k) => J(
          "Con robot đòi ra công viên, đi chậm sau bạn đúng hai mét, như một con chó lịch sự.",
          f(c, "s16_hen_gap") ? `Người ta chụp ảnh, có người bắt chuyện, và ${k.npc("dieu_phoi")} cũng ghé qua, lần này không mang xe tải.` : "Người ta chụp ảnh, có người bắt chuyện, một người xin số điện thoại của bạn.",
          "Lâu lắm rồi bạn mới nói với người lạ quá ba câu."),
          [C("Nhận lời đi cà phê", { rel: 4, flags: ["s16_ca_phe"], counters: { s16_mo_long: 1 } }, "Mở lòng, có thể vấp"),
           C("Về nhà, đóng cửa", { happy: -2, flags: ["s16_dong_cua"] }, "Yên tĩnh, vẫn một mình")]),
      ],
      /* cu_lat */
      [
        card("s16_cl_bo_nho", "Bộ nhớ của robot", (c, k) => J(
          `Một đêm, con robot chiếu lên tường những gì nó ghi được: bạn nói chuyện một mình, bạn ngồi rất lâu khi nhắc tới ${k.scar("nguoi") || "một người quen cũ"}, bạn nhìn ${k.scar("do") || "một món đồ cũ"} mà không làm gì.`,
          `Nó hỏi: "Đây là cái gì? Tôi chưa có tên cho cảm xúc này."`),
          [C("Kể cho nó nghe hết", { happy: 3, flags: ["s16_ke_het"], counters: { s16_gan: 1 } }, "Nhẹ lòng, nó biết bạn quá rõ"),
           C("Xóa đoạn ghi đó", { flags: ["s16_xoa"], counters: { s16_xa: 1 } }, "Giữ riêng tư, nó im lặng cả tuần")]),
      ],
      /* day */
      [
        card("s16_day_thu_hoi", "Lệnh thu hồi", (c, k) => J(
          `Công ty ra lệnh thu hồi mọi robot đời cũ, kể cả những con đã "tự kết bạn với khách".`,
          `${cap(k.npc("dieu_phoi"))} đứng ngoài cửa với một chiếc xe tải.`, k.gag()),
          [C("Mua đứt con robot", { money: -0.5, flags: ["s16_mua_dut"] }, "Đắt, nó thành của bạn"),
           C("Giấu nó trong nhà kho", { health: -2, flags: ["s16_giau"], counters: { s16_gan: 1 } }, "Rẻ, sống thấp thỏm")]),
        card("s16_day_pin", "Pin chỉ còn bốn tiếng", (c) => J(
          "Pin con robot chỉ còn giữ được bốn tiếng. Nó đi chậm hơn, hay đứng im giữa bếp.",
          f(c, "s16_ten_nguoi") ? "Có lần nó quên mất cái tên bạn đặt, gọi mình bằng mã số in trên lưng." : "Có lần nó gọi nhầm bạn bằng tên một khách hàng cũ."),
          [C("Tìm thợ thay pin, bao nhiêu cũng chịu", { money: -0.3, flags: ["s16_thay_pin"] }, "Thêm vài năm, ví mỏng đi"),
           C("Để nó chạy đến khi hết", { happy: -4, flags: ["s16_de_het"] }, "Không tốn, phải tập cách tiễn")]),
      ],
      /* chung_ket */
      [
        card("s16_ket", "Đơn hàng đã giao", (c, k) => J(
          `Màn hình con robot hiện dòng chữ: "Đơn hàng: một người bạn. Trạng thái: đã giao."`,
          `${cap(k.scar("no") || "món nợ cũ")} vẫn còn ghi trong sổ, nhưng lần đầu tiên bạn không phải mở sổ một mình.`,
          n(c, "s16_mo_long") > 0 ? "Người bạn quen ở công viên đang đứng chờ ngoài cổng." : "", k.gag()),
          (c) => [
            ending(L16_CUOI, "Cưới người hay đi cà phê cùng hai bạn", "Có một gia đình, robot làm phù rể"),
            ending(L16_GIU, "Mua đứt robot, sống cùng nó", "Có người bầu bạn, ít người hiểu"),
            ...(c.age <= 55 ? [ending(L16_SHIP, "Cùng robot mở dịch vụ giao hàng", "Thành nghề, ngày nào cũng ra đường")] : []),
          ]),
      ],
    ],
  }));

/* ================================================================== S17 — Trúng xổ số đất trên mặt trăng */

const L17_BAN = land("ban_bai_dap", "Bạn bán cả miệng hố cho công ty bay vũ trụ, nhận một khoản tiền thật hơn mọi thứ trên trời.", { money: 3, happy: 4 });
const L17_CUOC = land("cuoc_bai_dap", "Bạn giữ đất, góp vốn vào bãi đáp, đặt cược cả mẫu trăng vào một con tàu chưa bay.", {
  money: -1,
  gamble: { p: 0.35,
    win: { money: 5, happy: 8, log: "Con tàu đầu tiên đáp xuống đúng miệng hố của bạn. Phí đáp đổ về như mưa." },
    lose: { money: -1, custom: "borrow:1", happy: -8, log: "Con tàu hoãn bay vô thời hạn. Khoản bảo lãnh đến hạn, bạn trắng tay." } },
});

const S17 = weird("S17", "sf", ["tien", "ky"],
  (c) => n(c, "gamble") >= 3 || c.traits.risk >= 2 || f(c, "life_gambler"),
  () => "Nhận giấy chủ quyền đất trên mặt trăng",
  (s) => ({
    title: "Trúng một mẫu mặt trăng",
    text: J(`Tấm vé số mua nhầm ở ${s.noi || "đầu ngõ"} không trúng tiền: nó trúng một mẫu đất trên mặt trăng, có tọa độ, có bản đồ, có con dấu nổi.`,
      "Ba ngày sau, điện thoại bắt đầu reo.",
      `Người đầu tiên trả giá gấp mười lương năm của bạn và nói rất chắc: "Không ai lên đó được, nên giá chỉ có lên."`),
  }),
  season({
    id: "w_S17", vn: "Địa chủ mặt trăng", color: "#6c3fd1", years: [5, 10], weird: "sf",
    rules: { flags: ["w_moon_land"] },
    reset: { cast: [{ key: "moi_gioi", role: "partner", label: "anh môi giới đeo ba cái đồng hồ" }, { key: "thien_van", role: "neighbor", label: "cô hàng xóm soi trăng" }] },
    gag: { key: "kinh_thien_van", lines: [
      "Bạn chỉnh kính thiên văn về mảnh đất của mình. Đúng phần đó đang nằm trong bóng tối.",
      "Lại soi kính. Mảnh đất vẫn chìm trong bóng tối, như cố tình.",
      "Bạn mua kính to gấp đôi. Mảnh đất vẫn tối, nhưng tối rõ nét hơn.",
      "Đêm nay, lần đầu tiên, mảnh đất có nắng. Bạn không dám nhìn lâu.",
    ] },
    landings: [L17_BAN, L17_CUOC],
    beats: [
      /* mo_man */
      [
        card("s17_mo_khung", "Tờ giấy có con dấu nổi", (c, k) => J(
          "Bạn lồng tờ giấy chủ quyền vào khung, treo giữa nhà.",
          `Khách tới chơi ai cũng sờ thử con dấu nổi, rồi hỏi cùng một câu: "Thế bao giờ lên ở?"`, k.gag()),
          [C("Bán một góc cho người trả giá đầu", { money: 0.6, flags: ["s17_ban_som"] }, "Chắc tiền, có thể bán hớ"),
           C("Giữ nguyên, chờ giá lên", { flags: ["s17_giu"], counters: { s17_cuoc: 1 } }, "Trong tay chỉ có niềm tin")]),
        card("s17_mo_moi_gioi", "Ba cái đồng hồ", (c, k) => J(
          `${cap(k.npc("moi_gioi"))} tìm tới, ba cái đồng hồ chỉ ba múi giờ, một cái ghi "giờ mặt trăng".`,
          `Anh ta đề nghị chia mẫu đất thành một nghìn lô nhỏ, bán cho những người muốn "có một chỗ trên trời".`),
          [C("Chia lô, bán cùng anh ta", { money: 0.4, flags: ["s17_chia_lo"], counters: { s17_cuoc: 1 } }, "Tiền vào nhanh, tên bạn đứng trên mọi lô"),
           C("Từ chối, giữ nguyên mẫu đất", { flags: ["s17_nguyen_mau"], happy: 1 }, "Ít tiền, ít rắc rối")]),
      ],
      /* khoi_dong */
      [
        card("s17_kd_sot", "Cơn sốt đất trời", (c, k) => J(
          "Giá đất mặt trăng tăng gấp đôi trong một tháng. Người ta cầm cố nhà dưới đất để mua đất trên trời.",
          f(c, "s17_chia_lo") ? "Những lô nhỏ của bạn bán hết trong một buổi sáng." : "Mỗi ngày có ba người gõ cửa nhà bạn.", k.gag()),
          [C("Vay thêm, mua lô của hàng xóm", { custom: "borrow:0.8", flags: ["s17_vay_mua"], counters: { s17_cuoc: 2 } }, "Thắng lớn hoặc nợ lớn"),
           C("Bán bớt một nửa, cất tiền", { money: 0.5, flags: ["s17_chot_loi"] }, "Chắc ăn, nhìn giá lên mà tiếc")]),
        card("s17_kd_mieng_ho", "Đất toàn độ sâu", (c, k) => J(
          `${cap(k.npc("thien_van"))} sống ở tầng thượng, đêm nào cũng soi trăng bằng cái kính tự lắp.`,
          `Cô nói tọa độ trong giấy của bạn rơi đúng đáy một miệng hố sâu bốn cây số: "Đất của bạn không có mặt bằng. Chỉ có độ sâu."`),
          [C("Nhờ cô giữ kín chuyện này", { flags: ["s17_giu_kin"], counters: { s17_cuoc: 1 } }, "Giá còn giữ, lương tâm nặng thêm"),
           C("Công bố bản đồ thật", { money: -0.2, rel: 3, flags: ["s17_cong_bo"] }, "Mất giá, được người ta tin")]),
      ],
      /* cu_lat */
      [
        card("s17_cl_nguoi_mua", "Người mua cuối cùng", (c, k) => J(
          `Một người mua lạ hẹn gặp ở quán nước, hóa ra là ${k.scar("nguoi") || "một người quen cũ"}.`,
          `Người đó muốn đổi ${k.scar("do") || "một món đồ của bạn năm xưa"} cộng một túi tiền lấy nửa mẫu đất, vì "ít ra trên đó không ai đòi nợ được".`),
          [C("Đổi, lấy lại món đồ cũ", { money: 0.3, happy: 3, flags: ["s17_doi_do"] }, "Lấy lại kỷ niệm, mất nửa giấc mơ"),
           C("Không đổi, giữ trọn mẫu đất", { flags: ["s17_giu_tron"], counters: { s17_cuoc: 1 } }, "Cược tiếp, lỡ dịp làm lành")]),
      ],
      /* day */
      [
        card("s17_day_xi_hoi", "Bong bóng xì hơi", (c, k) => J(
          "Bản tin buổi sáng: không quốc gia nào công nhận giấy chủ quyền đất trên mặt trăng. Đến trưa, giá còn một phần mười.",
          n(c, "s17_cuoc") >= 3 ? "Khoản vay của bạn thì vẫn còn nguyên." : "May mà bạn đã cất một phần.", k.gag()),
          [C("Bán tháo phần còn lại", { money: 0.1, flags: ["s17_ban_thao"] }, "Cắt lỗ, hết đường gỡ"),
           C("Giữ, chờ ngày có tàu lên", { happy: -3, flags: ["s17_cho_tau"], counters: { s17_cuoc: 1 } }, "Còn hy vọng, mất ngủ")]),
        card("s17_day_nguoi_mua_lo", "Kẻ bán trăng", (c, k) => J(
          f(c, "s17_chia_lo") ? "Một nghìn người mua lô kéo tới trước nhà đòi tiền, vì tên bạn đứng trên giấy." : `Những người từng hỏi mua đất giờ gọi bạn là "kẻ bán trăng".`,
          `${cap(k.npc("moi_gioi"))} đã tắt điện thoại từ hôm qua.`),
          [C("Đứng ra trả lại một phần", { money: -0.5, rel: 4, flags: ["s17_tra_lai"] }, "Mất tiền, giữ được tên"),
           C("Đóng cửa, chờ chuyện qua", { rel: -4, flags: ["s17_dong_cua"] }, "Giữ tiền, mất lòng tin")]),
      ],
      /* chung_ket */
      [
        card("s17_ket", "Đêm trăng tròn", (c, k) => J(
          `Một công ty bay vũ trụ hỏi mua cả miệng hố làm bãi đáp, đúng lúc ${k.scar("no") || "món nợ cũ"} đến hạn.`,
          f(c, "s17_cong_bo") ? "Họ nói biết rõ đó là miệng hố, chính vì thế mới cần." : "Họ không hỏi gì về mặt bằng.",
          "Họ cho hai đường: bán đứt trước nửa đêm, hoặc góp đất vào dự án và bảo lãnh mọi khoản vay.", k.gag()),
          [ending(L17_BAN, "Bán đứt, lấy tiền mặt", "Giàu chắc, thôi làm địa chủ"),
           ending(L17_CUOC, "Góp đất, bảo lãnh dự án", "Thắng thì gấp năm, thua thì phá sản")]),
      ],
    ],
  }));

/* ================================================================== S18 — Người thuê trọ không phải người Trái Đất */

const L18_DO = land("do_la_trong_ket", "Bạn bán dần két đồ lạ cho các phòng thí nghiệm, sống khá giả nhờ tiền thuê của một người không ăn cơm.", { money: 2.5, happy: 3 });
const L18_DU_LICH = land("nha_tro_lien_sao", "Nhà trọ của bạn thành điểm tham quan, bạn đứng cổng dẫn khách xem khu vườn mọc ngược.", { custom: "become:tour_guide", happy: 4 }); // gần nhất
const L18_DIEU_TRA = land("bi_dieu_tra", "Căn nhà bị niêm phong để điều tra. Bạn ra ở tạm và nộp một khoản phạt lớn.", { money: -1.5, happy: -5, custom: "explode_hook" });
const L18_DI = land("len_tau_lien_sao", "Bạn lên tàu. Lần hạ cánh tiếp theo là một đất nước khác, nơi không ai hỏi bạn từ đâu tới.", { custom: "migrate_now" });

const S18 = weird("S18", "sf", ["tien", "luat"],
  (c) => c.owns.has("house"),
  (s) => fit(`Cho người thuê lạ dọn vào ${s.what && s.what.kind === "asset" && s.what.key === "house" ? s.what.label : "phòng trống"}`, "Cho người thuê lạ dọn vào phòng trống"),
  () => ({
    title: "Người thuê phòng số 2",
    text: J("Người thuê mới trả trước sáu tháng bằng một viên đá biết hát, và bạn đã gật đầu trước khi kịp nghĩ.",
      "Anh ta cao hai mét mốt, không bao giờ ăn, tối nào cũng ra ban công nhìn về một điểm trên trời.",
      `Lúc ký hợp đồng, anh ta hỏi: "Ở đây có luật nào cấm trồng cây trên trần nhà không?"`),
  }),
  season({
    id: "w_S18", vn: "Chủ trọ liên sao", color: "#5d7be0", years: [5, 10], weird: "sf",
    rules: { flags: ["w_alien_tenant"] },
    reset: { cast: [{ key: "nguoi_thue", role: "neighbor", label: "người thuê phòng số 2" }, { key: "thanh_tra", role: "official", label: "ông thanh tra nhà ở cầm sổ tay" }] },
    gag: { key: "tien_thue", lines: [
      "Tiền thuê tháng này: một viên đá biết hát, hát lệch tông.",
      "Tiền thuê tháng này: một chai đựng tiếng mưa. Mở ra là cả phòng ướt.",
      "Tiền thuê tháng này: mười hai phút. Bạn không biết cất ở đâu, nhưng chiều hôm đó dài hơn thường lệ.",
      "Tiền thuê tháng này: tiền thật. Bạn kiểm tra kỹ, lo hơn mọi tháng.",
    ] },
    landings: [L18_DO, L18_DU_LICH, L18_DIEU_TRA, L18_DI],
    beats: [
      /* mo_man */
      [
        card("s18_mo_hop_dong", "Điều khoản viết tay", (c, k) => J(
          "Hợp đồng có thêm một điều khoản người thuê tự viết tay: chủ nhà không mở cửa phòng số 2 vào đêm trăng tròn.",
          `${cap(k.npc("nguoi_thue"))} ký bằng một dấu tay có sáu ngón.`, k.gag()),
          [C("Đồng ý điều khoản", { flags: ["s18_dong_y"], counters: { s18_tin: 1 } }, "Giữ hòa khí, tò mò dài hạn"),
           C("Gạch điều khoản, đòi quyền kiểm tra", { flags: ["s18_kiem_tra"], counters: { s18_nghi: 1 } }, "Yên tâm hơn, người thuê có vẻ buồn")]),
        card("s18_mo_hang_xom", "Cây mọc ngược", () => J(
          "Hàng xóm bắt đầu để ý: cây trong chậu nhà bạn mọc ngược, đèn phòng số 2 sáng màu tím, chó trong ngõ không dám sủa.",
          `Bà bán nước đầu ngõ hỏi thẳng: "Nhà cháu cho ai thuê thế?"`),
          [C("Nói là họ hàng ở quê lên", { flags: ["s18_noi_doi"], counters: { s18_nghi: 1 } }, "Yên chuyện hôm nay, thêm một lời nói dối"),
           C("Mời cả ngõ sang ăn tối gặp người thuê", { rel: 3, flags: ["s18_ra_mat"], counters: { s18_danh: 1 } }, "Hết bí mật, có thể vui có thể loạn")]),
      ],
      /* khoi_dong */
      [
        card("s18_kd_ket", "Két đầy đồ lạ", (c, k) => J(
          "Két sắt của bạn giờ đựng sáu tháng tiền thuê: một viên đá hát, một chai mưa, một chiếc hộp nặng như chì mà nhìn vào không thấy gì.",
          k.gag(), "Một người buôn đồ cổ ngửi thấy mùi tiền, gọi điện hỏi giá."),
          [C("Bán viên đá hát", { money: 0.5, flags: ["s18_ban_da"], counters: { s18_nghi: 1 } }, "Có tiền, đồ lạ bắt đầu lưu hành"),
           C("Giữ hết, không cho ai xem", { flags: ["s18_giu_do"], counters: { s18_tin: 1 } }, "An toàn, két ngày càng nặng")]),
        card("s18_kd_vuon", "Khu vườn trên trần", (c, k) => J(
          `${cap(k.npc("nguoi_thue"))} trồng một khu vườn trên trần phòng số 2, cây mọc ngược và ra quả phát sáng.`,
          "Anh ta mời bạn ăn thử một quả, nói nó chữa được mất ngủ, hoặc làm bạn nhớ ra một chuyện đã quên."),
          [C("Ăn thử một quả", { health: 3, happy: 2, flags: ["s18_an_qua"] }, "Ngủ ngon, mơ những giấc lạ"),
           C("Cảm ơn, để dành", { flags: ["s18_de_danh_qua"], counters: { s18_tin: 1 } }, "Thận trọng, có thứ để đổi về sau")]),
      ],
      /* cu_lat */
      [
        card("s18_cl_bac_them", "Người thuê biết chuyện cũ", (c, k) => J(
          `Một tối, người thuê ngồi xuống bậc thềm và kể về ${k.scar("nguoi") || "một người quen cũ"} của bạn, những chuyện chưa ai kể cho anh ta.`,
          `Anh ta nhắc tới ${k.scar("do") || "một món đồ cũ của bạn"}, nói ở chỗ anh ta thứ ấy đáng giá một con tàu.`,
          `"Tôi đến đây vì nó. Nhưng tôi ở lại vì nhà bạn có tiếng mưa."`),
          [C("Tặng anh ta món đồ đó", { happy: 2, flags: ["s18_tang_do"], counters: { s18_tin: 2 } }, "Mất một kỷ niệm, được một ân tình liên sao"),
           C("Hỏi giá thật của nó", { money: 0.3, flags: ["s18_hoi_gia"], counters: { s18_nghi: 1 } }, "Có tiền, quan hệ thành giao dịch")]),
      ],
      /* day */
      [
        card("s18_day_thanh_tra", "Thước dây đo bóng tím", (c, k) => J(
          `${cap(k.npc("thanh_tra"))} đến lần thứ ba trong tháng, đo cái bóng tím dưới cửa phòng số 2 bằng thước dây.`,
          f(c, "s18_ban_da") ? "Viên đá bạn bán đã qua bốn đời chủ, giờ nằm trong một phòng thí nghiệm." : "Ông hỏi vì sao hóa đơn điện nhà bạn bằng không suốt sáu tháng.",
          k.gag()),
          [C("Khai thật, xin giấy phép cho người thuê", { flags: ["s18_khai"], counters: { s18_danh: 1 } }, "Đúng luật, hết đường lùi"),
           C("Mời ông ấy ăn quả trên trần", { flags: ["s18_moi_qua"], counters: { s18_nghi: 1 },
             secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 5], note: "mời thanh tra ăn quả lạ để ông ta im lặng" } }, "Êm chuyện hôm nay, có ngày lộ")]),
        card("s18_day_tau", "Mười hai đêm nữa", (c, k) => J(
          `${cap(k.npc("nguoi_thue"))} báo con tàu đón anh ta sẽ tới sau mười hai đêm, và nó cần đáp lên mái nhà bạn.`,
          "Mái nhà bạn chịu được tối đa hai người đứng."),
          [C("Gia cố mái nhà", { money: -0.4, flags: ["s18_gia_co"], counters: { s18_tin: 1 } }, "Tốn tiền, tiễn bạn cho tử tế"),
           C("Bảo anh ta tìm chỗ khác", { rel: -2, flags: ["s18_tu_choi_tau"] }, "Giữ mái, mất một người bạn")]),
      ],
      /* chung_ket */
      [
        card("s18_ket", "Đêm tàu đáp", (c, k) => J(
          `Đêm tàu đáp, cả ngõ đứng xem, ${k.npc("thanh_tra")} đứng đầu với một tập biên bản.`,
          `Người thuê đưa bạn tiền thuê tháng cuối và hỏi bạn có muốn đi cùng không, vì ${k.scar("no") || "món nợ cũ"} ở đây sẽ không ai đòi được trên kia.`,
          f(c, "s18_gia_co") ? "Mái nhà gia cố rung lên nhưng không sập." : "Mái nhà kêu răng rắc dưới chân tàu.", k.gag()),
          (c) => [
            ending(L18_DO, "Ở lại, bán két đồ lạ", "Có của, sống cạnh những thứ không ai hiểu"),
            c.age <= 50 ? ending(L18_DU_LICH, "Mở nhà trọ cho khách tham quan", "Nổi tiếng, nhà không còn là nhà")
              : ending(L18_DIEU_TRA, "Ký biên bản, giao hết cho thanh tra", "Sạch tay, mất nhà và một khoản phạt"),
            ending(L18_DI, "Lên tàu đi cùng người thuê", "Bỏ lại tất cả, hạ cánh ở một nơi lạ"),
          ]),
      ],
    ],
  }));

/* ================================================================== S19 — Não được sao lưu sau tai nạn */

const L19_VE = land("ve_than_moi", "Bạn mở mắt bằng đôi mắt mới. Chân tay lóng ngóng như trẻ con, khoản nợ thân mới thì rất người lớn.", { money: -2, happy: 6 });
const L19_SO = land("o_lai_trong_may", "Bạn ở lại trong máy, không già thêm, về thăm nhà bằng một màn hình to hơn.", { custom: "longevity:20", income_mult: 0.6 });
const L19_LAB = land("ve_lam_phong_thi_nghiem", "Bạn về thân mới và ở lại làm cho phòng thí nghiệm, viết phần mềm chép người.", { custom: "become:ai_engineer", money: -1 });

const S19 = weird("S19", "sf", ["than", "mau"],
  (c) => c.pressure.than >= 8,
  () => "Đồng ý sao lưu não, chờ một thân mới",
  (s, c, N) => ({
    title: "Bản sao lưu số một",
    text: J("Sau tai nạn, cơ thể bạn được giữ lạnh ở tầng hầm bệnh viện, còn não bạn được chép vào một cái hộp nhôm cỡ hộp cơm.",
      `Bạn tỉnh dậy trong một màn hình mười bốn inch, thấy ${whoN(s, N) || "người nhà"} đang khóc ở bên kia kính.`,
      `Một giọng máy đọc bằng giọng y tá: "Thời gian chờ thân mới dự kiến: từ năm đến mười hai năm. Vui lòng không tắt nguồn."`),
  }),
  season({
    id: "w_S19", vn: "Sống trong máy", color: "#8a5cf0", years: [5, 12], weird: "sf",
    rules: { income: 0.5, flags: ["w_digital"] },
    reset: { cast: [{ key: "ky_thuat", role: "mentor", label: "cậu kỹ thuật viên trực đêm" }, { key: "ban_sao", role: "rival", label: "bản sao dự phòng của bạn" }] },
    gag: { key: "rut_phich", lines: [
      "Có người rút phích cắm để sạc điện thoại. Bạn biến mất bốn giây, quay lại giữa câu.",
      "Lại có người rút phích để sạc điện thoại. Lần này bạn mất nguyên một buổi sáng.",
      "Nhà treo tấm biển trên ổ điện: KHÔNG RÚT, CÓ NGƯỜI Ở TRONG. Khách vẫn rút.",
      "Không ai rút phích nữa. Bạn hơi nhớ bốn giây biến mất ấy.",
    ] },
    landings: [L19_VE, L19_SO, L19_LAB],
    beats: [
      /* mo_man */
      [
        card("s19_mo_man_hinh", "Màn hình mười bốn inch", (c, k) => J(
          "Ngày đầu trong máy, bạn học cách nhìn bằng camera và nghe bằng cái micro có tiếng rè.",
          "Bạn không đói, không mỏi, nhưng ngứa ở một chỗ không còn tồn tại.", k.gag()),
          [C("Xin đặt màn hình ở bàn ăn", { rel: 3, flags: ["s19_ban_an"], counters: { s19_than: 1 } }, "Ở giữa nhà, không có chỗ trốn"),
           C("Xin về phòng thí nghiệm cho yên", { know: 3, flags: ["s19_phong_lab"], counters: { s19_so: 1 } }, "Yên tĩnh, xa mọi người")]),
        card("s19_mo_ky_thuat", "Cậu trực đêm", (c, k) => J(
          `${cap(k.npc("ky_thuat"))} hay nói chuyện với bạn cho đỡ buồn ngủ.`,
          "Cậu thì thầm rằng có thể cho bạn chạy nhanh gấp mười: một đêm bằng mười đêm, đọc hết thư viện, nhưng bên trong cũng già nhanh gấp mười."),
          [C("Chạy nhanh, học hết những gì có thể", { know: 6, flags: ["s19_chay_nhanh"], counters: { s19_so: 1 } }, "Giỏi lên, xa dần người nhà"),
           C("Giữ tốc độ người thường", { flags: ["s19_toc_do_nguoi"], counters: { s19_than: 1 } }, "Chậm, nhưng còn cùng nhịp với mọi người")]),
      ],
      /* khoi_dong */
      [
        card("s19_kd_cai_bat", "Cái bát không ai xới", (c, k) => J(
          "Bạn về thăm nhà bằng một cái máy tính bảng dựng trên giá.",
          "Bữa cơm nào bạn cũng được đặt một chỗ, có cả bát, dù không ai xới cơm vào.", k.gag()),
          [C("Dặn mọi người đừng để bát cho mình", { happy: -2, flags: ["s19_bo_bat"], counters: { s19_so: 1 } }, "Bớt buồn cho họ, bớt chỗ cho bạn"),
           C("Xin họ cứ để bát", { rel: 3, flags: ["s19_giu_bat"], counters: { s19_than: 1 } }, "Ấm lòng, ai cũng nhìn cái bát rỗng")]),
        card("s19_kd_ban_sao", "Bản sao dự phòng", (c, k) => J(
          `Phòng thí nghiệm bật bản sao dự phòng để kiểm tra lỗi. ${cap(k.npc("ban_sao"))} giống bạn từng chi tiết, trừ một điều: không muốn quay về thân xác.`,
          `"Ngoài kia có đau lưng," nó nói, "trong này thì không."`),
          [C("Cãi nhau với nó cả đêm", { flags: ["s19_cai_nhau"], counters: { s19_than: 1 } }, "Hiểu mình hơn, mệt hơn"),
           C("Chia việc: nó ở lại, bạn về", { flags: ["s19_chia_viec"], counters: { s19_so: 1 } }, "Hợp lý, có người mang tên bạn mãi trong máy")]),
      ],
      /* cu_lat */
      [
        card("s19_cl_ky_uc", "Một câu nói giải nén", (c, k) => J(
          `Lúc giải nén ký ức, máy làm rơi ra một đoạn bạn tưởng đã mất: ${k.scar("nguoi") || "một người quen cũ"} đứng ở cổng, nhắc tới ${k.scar("do") || "một món đồ cũ"}, nói một câu bạn chưa bao giờ nghe rõ.`,
          "Giờ bạn nghe rõ.",
          `${cap(k.npc("ky_thuat"))} hỏi có muốn xóa đoạn đó cho nhẹ bộ nhớ không.`),
          [C("Giữ đoạn ký ức, chạy chậm lại", { happy: 3, flags: ["s19_giu_ky_uc"], counters: { s19_than: 1 } }, "Nặng máy, nhẹ lòng"),
           C("Xóa, chạy nhanh hơn", { know: 3, flags: ["s19_xoa_ky_uc"], counters: { s19_so: 1 } }, "Gọn gàng, mất một câu nói")]),
      ],
      /* day */
      [
        card("s19_day_mat_dien", "Mất điện ba ngày", (c, k) => J(
          "Bão làm mất điện ba ngày. Máy phát của phòng thí nghiệm chỉ đủ nuôi một trong hai: bản não của bạn, hoặc thân xác đang giữ lạnh dưới tầng hầm.",
          k.gag()),
          [C("Ưu tiên thân xác", { flags: ["s19_uu_tien_than"], counters: { s19_than: 2 } }, "Bạn ngủ ba ngày, thân được giữ"),
           C("Ưu tiên bản não", { flags: ["s19_uu_tien_nao"], counters: { s19_so: 2 } }, "Bạn còn thức, thân xác hỏng thêm")]),
        card("s19_day_hoa_don", "Hóa đơn chờ thân", (c) => J(
          "Hóa đơn lưu trữ gửi về nhà mỗi tháng, cộng cả năm bằng gần nửa thu nhập cả nhà.",
          c.married ? "Người bạn đời của bạn đã bán chiếc xe để trả." : "Người nhà đã bắt đầu đi vay để trả."),
          [C("Xin chạy chậm lại cho bớt tiền", { money: 0.2, happy: -3, flags: ["s19_cham_lai"] }, "Rẻ hơn, bạn ngủ nhiều hơn thức"),
           C("Nhận việc từ xa cho phòng thí nghiệm", { money: 0.3, flags: ["s19_lam_tu_xa"], counters: { s19_so: 1 } }, "Tự trả tiền, gắn với máy hơn")]),
      ],
      /* chung_ket */
      [
        card("s19_ket", "Thân mới đã sẵn sàng", (c, k) => J(
          "Thân mới đã sẵn sàng, còn ấm, đôi mắt giống mắt bạn đến lạ.",
          `Trước khi chép sang, máy hỏi lần cuối có mang theo ${k.scar("no") || "món nợ cũ"} không, vì nó nằm chung một ô nhớ với tên mẹ bạn.`,
          n(c, "s19_than") >= n(c, "s19_so") ? "Bạn đã chờ ngày này từ lâu." : "Bạn không còn chắc mình muốn về.", k.gag()),
          (c) => [
            ending(L19_VE, "Về lại thân thể", "Được ôm người nhà, gánh khoản nợ thân mới"),
            ending(L19_SO, "Ở lại trong máy", "Không già, chỉ còn một màn hình"),
            ...(c.age <= 50 ? [ending(L19_LAB, "Về thân mới, làm cho phòng thí nghiệm", "Thành nghề, ngày nào cũng gặp lại cái hộp nhôm")] : []),
          ]),
      ],
    ],
  }));

/* ================================================================== S20 — Thử thuốc kiếm tiền, da phát sáng */

const L20_DIEN = land("dien_bang_anh_sang", "Bạn lên sân khấu diễn hài trong bóng tối, khán giả cười theo màu da của bạn.", { custom: "become:comedian", happy: 5 });
const L20_NGHIEN = land("vao_phong_thi_nghiem", "Bạn vào phòng thí nghiệm, lần này ở phía cầm bảng ghi chép.", { custom: "become:scientist" });
const L20_MAU = land("ban_quyen_mau_da", "Bạn bán quyền dùng mẫu da cho hãng thuốc, nhận một khoản đủ trả hết nợ cũ.", { money: 2, happy: 2 });
const L20_BOI = land("boi_thuong_ca_lo", "Bạn cùng những người chung lô thuốc kiện hãng, khoản bồi thường chia đều mỗi người một phần.", { money: 1.2, rel: 5 });

const S20 = weird("S20", "sf", ["tien", "than"],
  (c) => c.age >= 18 && (c.broke || c.scarcity || c.debt_ratio >= 1),
  () => "Ký giấy thử thuốc, lấy tiền ngay",
  () => ({
    title: "Liều thứ ba",
    text: J("Bạn cần tiền trước cuối tuần, và tờ giấy dán ở trạm xe buýt hứa trả một tháng lương cho ba liều thuốc thử.",
      "Đến liều thứ ba, phòng tắt đèn, bạn thấy hai bàn tay mình sáng xanh như mặt đồng hồ dạ quang.",
      `Cô y tá ghi gì đó vào bảng, không ngẩng lên: "Tác dụng phụ hiếm gặp. Ký vào đây để nhận tiền."`),
  }),
  season({
    id: "w_S20", vn: "Người phát sáng", color: "#2a6bb8", years: [5, 10], weird: "sf",
    rules: { flags: ["w_glowing"] },
    reset: { cast: [{ key: "ong_chu", role: "first_boss", label: "ông chủ tiệm biển quảng cáo" }, { key: "bac_si", role: "official", label: "chị bác sĩ của hãng thuốc" }] },
    gag: { key: "thieu_than", lines: [
      "Ra đường buổi tối, bạn kéo theo một đám thiêu thân như kéo một tấm khăn choàng.",
      "Đám thiêu thân đã quen giờ đi làm của bạn, chờ sẵn ở đầu ngõ.",
      "Đám thiêu thân có thêm đàn con. Chúng bay theo bạn thành hình chữ V.",
      "Tối nay không con thiêu thân nào tới. Bạn đứng ở đầu ngõ chờ, hơi buồn.",
    ] },
    landings: [L20_DIEN, L20_NGHIEN, L20_MAU, L20_BOI],
    beats: [
      /* mo_man */
      [
        card("s20_mo_dem", "Đêm đầu tiên sáng", (c, k) => J(
          "Đêm đầu ở nhà, bạn không ngủ được vì chính mình.",
          "Trùm chăn kín đầu, trong chăn vẫn sáng như có trăng.", k.gag()),
          [C("Đi kiện hãng thuốc", { money: -0.1, flags: ["s20_kien"], counters: { s20_nghien: 1 } }, "Có thể được bồi thường, dài và mệt"),
           C("Nhận tiền, coi như xong", { money: 0.2, flags: ["s20_nhan_tien"] }, "Có tiền ngay, chấp nhận làn da sáng")]),
        card("s20_mo_bien_hieu", "Biển hiệu sống", (c, k) => J(
          `${cap(k.npc("ong_chu"))} thấy bạn đứng chờ xe buýt lúc tối, chạy theo hai dãy phố.`,
          `Ông trả lương để bạn đứng trước cửa tiệm từ bảy đến mười giờ tối, mặc áo in chữ: "Không cần làm gì, cứ sáng là được."`),
          [C("Nhận làm biển hiệu sống", { money: 0.2, flags: ["s20_bien_hieu"], counters: { s20_dien: 1 } }, "Có lương, bị nhìn cả buổi tối"),
           C("Từ chối, mặc áo dài tay đi làm", { happy: -2, flags: ["s20_che_kin"] }, "Kín đáo, nóng và mệt")]),
      ],
      /* khoi_dong */
      [
        card("s20_kd_bi_soi", "Mười triệu lượt xem", (c, k) => J(
          "Ai đó quay video bạn đi qua công viên, ánh sáng tỏa ra từ cổ tay. Ba ngày sau, video có mười triệu lượt xem.",
          `Trước cửa nhà bạn bắt đầu có người cầm đèn pin chiếu vào cửa sổ, để "xem có sáng lại không".`, k.gag()),
          [C("Lập trang riêng, bán vé xem", { money: 0.3, flags: ["s20_ban_ve"], counters: { s20_dien: 1 } }, "Kiếm tiền từ sự tò mò, mất chỗ trốn"),
           C("Dọn đi chỗ khác", { money: -0.2, flags: ["s20_don_nha"], counters: { s20_nghien: 1 } }, "Yên hơn, tốn tiền")]),
        card("s20_kd_bac_si", "Chị bác sĩ của hãng", (c, k) => J(
          `${cap(k.npc("bac_si"))} đến tận nhà với một bản hợp đồng mới: mỗi tháng lấy một ít máu để nghiên cứu, hãng trả tiền thuê nhà.`,
          `Chị dặn nhỏ: "Có người khác uống cùng lô thuốc, nhưng chỉ bạn sáng."`),
          [C("Ký, làm mẫu nghiên cứu", { money: 0.3, flags: ["s20_lam_mau"], counters: { s20_nghien: 1 } }, "Ổn định tiền nhà, thành con số trong báo cáo"),
           C("Đòi đọc hết hồ sơ lô thuốc", { know: 3, flags: ["s20_doi_ho_so"], counters: { s20_nghien: 1 } }, "Biết sự thật, hãng bắt đầu dè chừng bạn")]),
      ],
      /* cu_lat */
      [
        card("s20_cl_doi_mau", "Ánh sáng đổi màu", (c, k) => J(
          `Một tối, da bạn chuyển từ xanh sang vàng đúng lúc ${k.scar("nguoi") || "một người quen cũ"} gọi điện.`,
          `Bạn thử lại: nhắc tới ${k.scar("do") || "một món đồ cũ"}, da chuyển màu cam; nghĩ tới tiền, da tím.`,
          `${cap(k.npc("bac_si"))} nói đây là lần đầu có người sáng theo cảm xúc, hãng sẵn sàng trả gấp ba.`),
          [C("Đem màu sắc lên sân khấu", { flags: ["s20_san_khau"], counters: { s20_dien: 2 } }, "Thành tiết mục, cảm xúc thành màn trình diễn"),
           C("Bán dữ liệu cảm xúc cho hãng", { money: 0.5, flags: ["s20_ban_du_lieu"], counters: { s20_nghien: 2 } }, "Tiền to, cảm xúc thành tài sản của hãng")]),
      ],
      /* day */
      [
        card("s20_day_mo_dan", "Ánh sáng mờ dần", (c, k) => J(
          "Năm thứ tư, ánh sáng của bạn mờ dần, chỉ còn như một chiếc đèn ngủ sắp hết pin.",
          f(c, "s20_bien_hieu") ? "Ông chủ tiệm biển quảng cáo đã thuê một tấm đèn thật thay bạn." : "Lượt xem giảm, người ta chuyển sang soi một con mèo biết hát.",
          k.gag()),
          [C("Uống thêm một liều để sáng lại", { health: -6, flags: ["s20_lieu_bon"], counters: { s20_dien: 1 } }, "Sáng lại, cơ thể trả giá"),
           C("Để nó tắt", { happy: -2, flags: ["s20_de_tat"], counters: { s20_nghien: 1 } }, "Trở lại bình thường, hết đặc biệt")]),
        card("s20_day_cung_lo", "Người cùng lô thuốc", () => J(
          "Một người lạ tìm tới: họ uống cùng lô thuốc, không sáng, nhưng mất ngủ suốt ba năm.",
          "Họ cần bạn đứng ra làm chứng để đòi bồi thường từ hãng."),
          [C("Đứng ra làm chứng", { money: -0.1, rel: 4, flags: ["s20_lam_chung"], counters: { s20_nghien: 1 } }, "Công bằng cho người khác, hãng thành kẻ thù"),
           C("Từ chối, giữ hợp đồng của mình", { money: 0.2, flags: ["s20_im_lang"] }, "Giữ tiền, mất ngủ theo kiểu khác")]),
      ],
      /* chung_ket */
      [
        card("s20_ket", "Lần sáng cuối cùng", (c, k) => J(
          "Sân khấu và phòng thí nghiệm cùng gửi thư mời trong một tuần.",
          `${cap(k.scar("no") || "món nợ cũ")} thì vẫn chờ, đúng như lý do bạn đi thử thuốc ngày đầu.`,
          n(c, "s20_dien") > n(c, "s20_nghien") ? "Khán giả quen đã thuộc từng màu da của bạn." : "Hồ sơ lô thuốc dày lên, có tên bạn ở trang đầu.", k.gag()),
          (c) => c.age <= 45
            ? [ending(L20_DIEN, "Lên sân khấu, diễn bằng ánh sáng", "Thành nghề biểu diễn, sống về đêm"),
               ending(L20_NGHIEN, "Vào phòng thí nghiệm làm nghiên cứu", "Đổi phía, hiểu chính mình"),
               ending(L20_MAU, "Bán quyền mẫu da, trả hết nợ", "Hết nợ, hết đặc biệt")]
            : c.age <= 50
              ? [ending(L20_DIEN, "Lên sân khấu, diễn bằng ánh sáng", "Thành nghề biểu diễn, sống về đêm"),
                 ending(L20_MAU, "Bán quyền mẫu da, trả hết nợ", "Hết nợ, hết đặc biệt")]
              : [ending(L20_MAU, "Bán quyền mẫu da, trả hết nợ", "Hết nợ, hết đặc biệt"),
                 ending(L20_BOI, "Cùng người chung lô kiện hãng", "Ít tiền hơn, đòi được lẽ phải")]),
      ],
    ],
  }));

export const SF_11: WeirdBranch[] = [S11, S12, S13, S14, S15, S16, S17, S18, S19, S20];
