/**
 * Mùa mẫu cho bộ kiểm nội dung (Task 4). Đủ ràng buộc mùa thường. Xóa ở Task 6 khi có 5 mùa thật.
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, land } from "../kit.ts";

const L_QUAN = land("quan_co_ten", "Quán nhỏ đầu hẻm thành quán có tên, có giấy phép, có khách quen.", { custom: "become:restaurateur", happy: 5 });
const L_BAN = land("ban_quan", "Bạn bán lại quán, trả sạch nợ và còn dư một khoản.", { money: 1.2, happy: -3 });
const L_DI = land("len_pho", "Bạn trả chìa khóa cho bà chủ nhà và lên chuyến xe sớm.", { custom: "move_city", money: -0.2 });

export const FIXTURE_SEASON: SeasonDef = {
  id: "fixture", vn: "Mùa mẫu: Quán đầu hẻm", color: "#b8742a", years: [8, 12],
  rules: { income: 0.8, flags: ["w_fixture"] },
  reset: { cash: 1, cast: [{ key: "ba_chu_nha", role: "neighbor", label: "bà chủ nhà" }, { key: "quan_doi_dien", role: "rival", label: "chủ quán đối diện" }] },
  gag: { key: "tam_bien", lines: [
    "Tấm biển quán vừa treo đã rơi xuống, trúng ngay chậu ớt.",
    "Gió thổi nhẹ thôi mà tấm biển cũng rơi, khách quen vỗ tay.",
    "Tấm biển rơi đúng lúc có người hỏi tên quán.",
    "Bạn đóng thêm hai cây đinh. Tấm biển vẫn rơi, như có hẹn.",
  ] },
  landings: [L_QUAN, L_BAN, L_DI],
  beats: [
    /* mo_man */
    [
      card("fx_mo_thue", "Căn bếp mặt hẻm", (c, k) => `Bạn thuê lại một căn bếp nhỏ mặt hẻm ở ${k.noi}, đủ kê bốn cái bàn thấp. ${cap(k.npc("ba_chu_nha"))} đếm tiền cọc hai lần rồi mới đưa chìa khóa. ${k.gag()}`,
        [C("Treo biển, mở quán ngay", { flags: ["fx_mo_som"], happy: 3 }, "Có khách sớm, chưa kịp quen việc"),
         C("Sửa bếp một tháng rồi mới mở", { money: -0.1, counters: { fx_chuan_bi: 1 } }, "Tốn thêm tiền, quán gọn hơn")]),
      card("fx_mo_mon", "Món đầu tiên", () => "Quán cần một món để người ta nhớ. Bạn thử ba nồi nước trong một đêm, nồi thứ ba vừa miệng nhất.",
        [C("Giữ công thức của nhà", { flags: ["fx_mon_nha"], happy: 2 }, "Quen vị, ít người lạ tò mò"),
         C("Học món đang được chuộng", { flags: ["fx_mon_moi"], know: 2 }, "Dễ hút khách, dễ bị bắt chước")]),
      card("fx_mo_doi_dien", "Quán bên kia hẻm", (c, k) => `Bên kia hẻm, ${k.npc("quan_doi_dien")} cũng bán nước, đã bán mười năm. Sáng đầu tiên người đó sang uống thử một ly, trả đủ tiền, không nói gì.`,
        [C("Sang chào và biếu một hộp bánh", { flags: ["fx_chao_hang_xom"], rel: 2 }, "Thêm một người quen, bớt một bí mật"),
         C("Hạ giá thấp hơn một nửa", { flags: ["fx_ha_gia"], money: -0.05 }, "Kéo khách nhanh, gây thù cũng nhanh")]),
    ],
    /* khoi_dong */
    [
      card("fx_kd_tho_xay", "Ba mươi thợ xây", (c, k) => `Một công trình mọc lên cuối hẻm, ba mươi thợ xây cần chỗ uống nước mỗi trưa. Họ hỏi có bán chịu đến cuối tháng được không. ${k.gag()}`,
        [C("Cho ghi sổ đến cuối tháng", { flags: ["fx_so_no"], counters: { fx_khach: 2 } }, "Đông khách, nhưng tiền nằm trong sổ"),
         C("Chỉ bán tiền mặt", { money: 0.05, counters: { fx_khach: 1 } }, "Chắc tiền, mất nửa số khách")]),
      card("fx_kd_giay_dan", "Tờ giấy dán cửa", (c, k) => `Sáng thứ hai có tờ giấy dán ở cửa: quán phải bổ sung giấy phép trong ba mươi ngày. ${cap(k.npc("ba_chu_nha"))} nói hợp đồng thuê không có điều khoản này.`,
        [C("Chạy giấy tờ cho đúng", { money: -0.1, flags: ["fx_giay_phep"] }, "Tốn tiền và một tháng đi lại"),
         C("Dời bàn vào trong, bán nhỏ lại", { counters: { fx_khach: -1 }, happy: -2 }, "Đỡ phiền, bớt khách")]),
      card("fx_kd_anh_mang", "Ảnh ly nước trên mạng", () => "Ai đó chụp ly nước của quán đăng lên mạng, kèm dòng chữ 'rẻ mà ngon'. Hôm sau có mười hai người lạ đứng chờ trước khi bạn kịp kéo cửa.",
        [C("Mở sớm hơn hai tiếng", { health: -2, counters: { fx_khach: 2 }, flags: ["fx_noi"] }, "Kiếm thêm, ngủ ít đi"),
         C("Giữ giờ cũ, ai chờ thì chờ", { flags: ["fx_giu_nhip"], happy: 2 }, "Giữ sức, có người bỏ đi")]),
    ],
    /* cu_lat */
    [
      card("fx_cl_nguoi_cu", "Người cũ ghé quán", (c, k) => `Trưa nay, ${k.scar("nguoi") || "một người quen cũ"} bước vào quán và gọi đúng món bạn hay uống hồi trước. Người đó nói nhỏ: quán đối diện đang tính mua lại cả dãy nhà này.`,
        [C("Hỏi thêm cho rõ", { flags: ["fx_biet_tin"], know: 2 }, "Biết trước, mất một buổi bán"),
         C("Kệ, lo bán cho hết ngày", { happy: 1, counters: { fx_khach: 1 } }, "Yên ổn hôm nay, mù chuyện ngày mai")]),
      card("fx_cl_mon_do", "Món đồ ở góc quầy", (c, k) => `Bạn mang ${k.scar("do") || "một món đồ cũ từ đời trước"} tới quán, đặt ở góc quầy cho đỡ trống. Một khách lạ ngắm rất lâu rồi trả giá gấp năm lần tiền bạn từng bỏ ra.`,
        [C("Bán, lấy tiền sửa quán", { money: 0.3, flags: ["fx_ban_do"] }, "Có tiền, mất một thứ của đời cũ"),
         C("Giữ lại", { happy: 3, flags: ["fx_giu_do"] }, "Giữ được kỷ niệm, quán vẫn dột")]),
      card("fx_cl_phong_bi", "Phong bì trên bàn", (c, k) => `${cap(k.npc("quan_doi_dien"))} sang hẳn bên này, đặt một phong bì lên bàn: đủ để bạn lấy lại tiền cọc và sống thêm nửa năm. ${k.gag()}`,
        [C("Nhận phong bì, xin nghĩ thêm", { flags: ["fx_nhan_phong_bi"], money: 0.2 }, "Có tiền ngay, nợ một câu trả lời"),
         C("Đẩy phong bì lại", { flags: ["fx_tu_choi"], counters: { fx_gan: 1 } }, "Giữ quán, thêm một đối thủ")]),
    ],
    /* day */
    [
      card("fx_day_ngap", "Mùa mưa ngập hẻm", () => "Mưa ba ngày, nước trong hẻm lên quá mắt cá. Bếp ướt, hai cái nồi trôi mất, bốn ngày không bán được ly nào.",
        [C("Vay tiền sửa bếp", { custom: "borrow:0.3", flags: ["fx_vay"] }, "Mở lại nhanh, gánh thêm nợ"),
         C("Đóng cửa một tháng", { money: -0.1, happy: -4 }, "Không nợ thêm, khách quen tản đi")]),
      card("fx_day_so", "Sổ cuối tháng", (c, k) => `${c.flags.has("fx_so_no") ? "Cuối tháng, cuốn sổ ghi chịu dày gần kín, đội thợ đã chuyển sang công trình khác." : "Cuối tháng, tiền vào không bằng tiền ra, ngăn kéo chỉ còn tiền lẻ."} ${k.gag()}`,
        [C("Đi tìm từng người đòi", { health: -2, money: 0.1, flags: ["fx_doi_no"] }, "Lấy lại một phần, mệt cả tuần"),
         C("Xé sổ, coi như học phí", { happy: -2, flags: ["fx_xe_so"] }, "Nhẹ đầu, mất trắng")]),
      card("fx_day_dem", "Ba giờ sáng", () => "Bạn ngồi tính sổ đến ba giờ sáng. Nếu tháng sau vẫn như tháng này, quán chỉ trụ thêm được chín tuần.",
        [C("Gọi điện nhờ người nhà", { rel: 2, flags: ["fx_nho_nha"] }, "Có người đỡ, mất chút thể diện"),
         C("Tự xoay, không nói với ai", { happy: -3, counters: { fx_gan: 1 } }, "Giữ thể diện, gánh một mình")]),
    ],
    /* chung_ket */
    [
      card("fx_ket_chon", "Đèn hẻm sáng lần cuối", (c, k) => `Sáng nay, ${k.scar("no") || "món nợ cũ"} lại được nhắc tới, kèm một tờ giấy hẹn ngày trả. ${cap(k.npc("quan_doi_dien"))} ${c.flags.has("fx_tu_choi") ? "chưa quên lần bạn đẩy phong bì lại, vẫn đứng bên kia hẻm chờ." : c.flags.has("fx_nhan_phong_bi") ? "nhắc khéo cái phong bì bạn đã nhận." : "vẫn chờ câu trả lời."} Đã đến lúc quyết quán này sẽ thành gì.`,
        // Nghề chỉ mở trong khoảng tuổi của con đường (bộ kiểm tuổi 8–90); ngoài khoảng thì bán quán hoặc lên phố.
        (c) => c.age >= 18 && c.age <= 55
          ? [ending(L_QUAN, "Đăng ký tên quán, làm cho ra hồn", "Thành nghề, nhưng buộc chân ở đây"), ending(L_BAN, "Bán lại quán, trả nợ", "Có tiền, mất chỗ đứng")]
          : [ending(L_BAN, "Bán lại quán, trả nợ", "Có tiền, mất chỗ đứng"), ending(L_DI, "Lên xe, đi thành phố khác", "Làm lại từ đầu, bỏ quán lại sau lưng")]),
      card("fx_ket_xe_som", "Chuyến xe sớm", (c, k) => `Một người bà con ở thành phố khác nhắn: có việc cho bạn làm, có phòng để ở, vé xe sáng mai. Còn ${k.scar("no") || "món nợ ở quán"} thì vẫn chưa trả xong.`,
        [ending(L_DI, "Lên xe, đi thành phố khác", "Làm lại từ đầu, bỏ quán lại sau lưng"),
         ending(L_QUAN, "Ở lại, giữ quán", "Bám trụ, chịu thêm vài năm vất vả")],
        (c) => c.age >= 18 && c.age <= 55),
    ],
  ],
};
