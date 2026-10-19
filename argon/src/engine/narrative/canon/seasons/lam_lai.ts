/**
 * Mùa "Làm lại từ số 0": tiền về không, bắt đầu lại trong một căn phòng trọ với ba trăm chiếc giày toàn chiếc trái.
 * Gag: ba trăm chiếc giày trái.
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, finale, land, noOr } from "../kit.ts";

const L_TIEM = land("tiem_giay_lech", "Bạn mở tiệm giày đặt riêng, đôi nào cũng lệch một cách có chủ ý, và người ta xếp hàng để được đi lệch.", { custom: "become:fashion", happy: 6 });
const L_MANG = land("ban_giay_le", "Bạn bán giày lẻ chiếc trên mạng cho những người chỉ còn một chân giày, gửi đi khắp nơi kèm một tấm thiệp viết tay.", { custom: "become:ecommerce", happy: 4 });
const L_BAN_Y = land("ban_y_tuong", "Một xưởng lớn mua lại cái tên “Giày lệch”. Bạn khép xong chuyện cũ, và lần đầu tiên từ số không, còn một khoản đủ để không phải bắt đầu lại nữa.", { money: 1.2, custom: "repay:1", happy: 3 });

const L_KHEP = land("khep_xuong", "Bạn khép xưởng, để chiếc giày trái cuối cùng lại trên bậu cửa, rồi chuyển về một thị trấn nhỏ yên tĩnh.", { custom: "move_city", happy: 4 });

const has = (c: { flags: Set<string> }, f: string) => c.flags.has(f);
const khep = ending(L_KHEP, "Khép xưởng, về một thị trấn yên tĩnh", "Nghỉ ngơi, chỉ giữ lại một chiếc giày");
/** Bán tên "Giày lệch": hint đọc lại khoản vay giữa mùa. */
const banY = (c: { flags: Set<string> }) => ending(L_BAN_Y, "Bán cái tên “Giày lệch”, cầm tiền", has(c, "ll_vay") ? "Trả được cả khoản vay thân thiện lẫn chuyện cũ" : "Có tiền trả chuyện cũ, nhìn người khác làm tiếp");

export const LAM_LAI: SeasonDef = {
  id: "lam_lai", vn: "Làm lại từ số 0", color: "#6f8f4e", years: [8, 20],
  rules: { income: 0.6, flags: ["w_lam_lai"] },
  reset: {
    cash: 0,
    cast: [
      { key: "ba_phe_lieu", role: "mentor", label: "bà chủ vựa phế liệu" },
      { key: "ban_phong", role: "partner", label: "người bạn cùng phòng" },
      { key: "chu_xuong", role: "first_boss", label: "ông chủ xưởng giày" },
    ],
  },
  gag: { key: "giay_trai", lines: [
    "Ba trăm chiếc giày trái xếp chồng trong góc, chiếc nào cũng như đang nhìn bạn.",
    "Có người gõ cửa hỏi mua một chiếc giày phải. Bạn tiễn họ về, lòng nặng trĩu.",
    "Một đoàn kịch hỏi thuê ba mươi chiếc giày trái để diễn cảnh “đoàn quân đi lạc”.",
    "Bạn dùng mấy chiếc giày trái làm chậu trồng hành. Hành mọc nghiêng hết về một bên.",
    "Ở hội chợ, có người bày bán ba trăm chiếc giày phải. Hai người nhìn nhau rất lâu, như trong phim.",
  ] },
  landings: [L_TIEM, L_MANG, L_BAN_Y, L_KHEP],
  beats: [
    /* mo_man */
    [
      card("ll_mo_trang_tay", "Buổi sáng trắng tay", (c, k) => `Bạn thức dậy trong căn phòng trọ mười hai mét vuông, ví còn đúng tiền một bữa sáng. ${c.home_owner ? "Mọi thứ của đời trước đã mất: tiền, những mối làm ăn, và cả cái tên trong danh bạ của nhiều người. Căn nhà cũ vẫn đứng tên bạn, nhưng nó ở lại phía sau, cùng với đời trước." : "Mọi thứ của đời trước đã mất: tiền, chỗ ở, và cả cái tên trong danh bạ của nhiều người."} ${cap(k.npc("ban_phong"))} ngáy to tới mức cửa sổ rung theo nhịp.`,
        [C("Ăn sáng thật no, rồi tính tiếp", { happy: 3, flags: ["ll_an_no"] }, "Hết tiền, nhưng có sức"),
         C("Nhịn, giữ tiền đi xe tìm việc", { health: -2, flags: ["ll_nhin"], counters: { ll_cham: 1 } }, "Đói, nhưng đi được xa hơn")]),
      card("ll_mo_giay", "Ba trăm chiếc giày trái", (c, k) => `Bạn khuân hàng giúp một xưởng giày đang dọn đi. Xưởng phá sản, ${k.npc("chu_xuong")} trả công bằng thứ duy nhất còn lại: ba trăm chiếc giày, chiếc nào cũng là chiếc trái. ${k.gag()}`,
        [C("Chất đầy phòng trọ", { flags: ["ll_giay_phong"], counters: { ll_ban: -1 } }, "Có hàng trong tầm tay, bạn cùng phòng không vui"),
         C("Gửi nhờ ở vựa phế liệu đầu dốc", { flags: ["ll_giay_vua"], counters: { ll_ba: 1 } }, "Phòng thoáng, mắc nợ bà chủ vựa một chỗ để")]),
      card("ll_mo_vua", "Vựa phế liệu đầu dốc", (c, k) => `${cap(k.npc("ba_phe_lieu"))} thuê người phân loại phế liệu, trả theo cân. Bà không hỏi bạn từng làm gì, chỉ hỏi bạn có phân biệt được nhôm với thiếc không.`,
        [C("Nhận việc, học phân loại", { health: -2, flags: ["ll_lam_vua"], counters: { ll_ba: 1 } }, "Bẩn, ổn định, học được giá của từng thứ"),
         C("Chở hàng thuê bằng chiếc xe mượn", { money: 0.05, flags: ["ll_cho_thue"] }, "Tiền tươi, nhưng xe không phải của mình")]),
    ],
    /* khoi_dong */
    [
      card("ll_kd_ban_thu", "Chiếc giày trái đầu tiên", () => "Bạn rao bán giày trái trên mạng, chủ yếu cho vui. Đêm đó có một người nhắn: họ đánh rơi chiếc giày trái xuống sông khi bước lên thuyền, chiếc phải vẫn còn mới tinh.",
        [C("Bán, ghi lại câu chuyện của họ", { money: 0.02, flags: ["ll_ban_le"], counters: { ll_khach: 1 } }, "Một chiếc, một câu chuyện, một ý tưởng"),
         C("Tặng luôn, xin họ đăng ảnh", { flags: ["ll_tang"], counters: { ll_tieng: 1 } }, "Không có tiền, có người kể về bạn")]),
      card("ll_kd_may_may", "Cái máy may của người ngáy to", (c, k) => `${cap(k.npc("ban_phong"))} có một cái máy may cũ, bạn có ba trăm chiếc giày. Người đó đề nghị thử khâu hai chiếc trái khác màu thành một đôi “lệch có chủ ý”. ${k.gag()}`,
        [C("Góp chung, chia đôi lãi", { flags: ["ll_gop_von"], counters: { ll_ban: 1 } }, "Có bạn đồng hành, phải chia mọi thứ"),
         C("Mượn máy, tự làm một mình", { flags: ["ll_mot_minh"], counters: { ll_cham: 1 } }, "Giữ hết lãi, gánh hết việc")]),
      card("ll_kd_loi_moi_vay", "Lời mời vay rất thân thiện", () => "Một người quen thấy bạn bắt đầu có khách, gợi ý vay một khoản “để làm lớn”. Lãi không cao, người cho vay rất thân thiện, thân thiện tới mức hơi lạ.",
        [C("Vay, làm lớn ngay", { custom: "borrow:0.5", flags: ["ll_vay"] }, "Lớn nhanh, đời trước cũng bắt đầu y như thế"),
         C("Không vay, lớn bằng tiền của mình", { flags: ["ll_khong_vay"], counters: { ll_cham: 1 } }, "Chậm, nhưng không ai gõ cửa đòi")]),
    ],
    /* cu_lat */
    [
      card("ll_cl_nguoi_cu", "Hóa ra vẫn còn sống", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} tìm tới phòng trọ, nhìn đống giày trái, rồi nhìn bạn. Người đó nói câu bạn chờ đã lâu, hoặc sợ đã lâu: “Hóa ra vẫn còn sống.” Rồi đề nghị giúp một khoản, với một điều kiện.`,
        [C("Nhận giúp, chấp nhận điều kiện", { money: 0.3, flags: ["ll_nhan_giup"] }, "Có vốn, có người nhắc chuyện cũ mỗi tuần"),
         C("Cảm ơn, tự đi tiếp", { happy: 2, flags: ["ll_tu_di"], counters: { ll_cham: 1 } }, "Giữ lòng tự trọng, giữ cái nghèo thêm ít lâu")]),
      card("ll_cl_con_sot", "Thứ còn sót lại", (c, k) => `Đời trước cuốn đi gần hết, trừ một thứ: ${k.scar("do") || "đôi tay quen việc"}. Một đêm, bạn nhận ra chính nó là mảnh còn thiếu để những đôi giày lệch thành thứ người ta muốn mua, không chỉ muốn chụp ảnh.`,
        [C("Dồn hết sức vào hướng đó", { health: -3, flags: ["ll_dung_vet"], counters: { ll_khach: 2 } }, "Làm ra hàng thật, kiệt sức"),
         C("Gác nó lại, làm theo kiểu dễ bán", { money: 0.15, flags: ["ll_gac_vet"] }, "Có tiền nhanh, hàng giống của mọi người")]),
      card("ll_cl_don_lon", "Đơn hàng một nghìn đôi", (c, k) => `Một chuỗi cửa hàng đặt một nghìn đôi giày lệch, cọc trước ba mươi phần trăm, giao trong sáu tuần. Bạn có ${has(c, "ll_gop_von") ? "hai người" : "một mình"}, một cái máy may, và một đống giày trái đã vơi đi một nửa. ${k.gag()}`,
        [C("Nhận đơn, thuê thêm người", { money: 0.3, health: -4, flags: ["ll_don_lon"] }, "Lên một bậc, một sai sót là sập"),
         C("Nhận một nửa số lượng", { money: 0.15, flags: ["ll_don_nua"] }, "An toàn, khách có thể đi tìm người khác"),
         C("Từ chối, giữ hàng làm tay", { flags: ["ll_lam_tay"], counters: { ll_tieng: 1 } }, "Nhỏ mà chất, tiền về chậm", { tier: "sovereign" })]),
    ],
    /* day */
    [
      card("ll_day_tra_hang", "Những đôi giày há mõm", (c) => `${has(c, "ll_don_lon") ? "Sáu trăm đôi trong đơn hàng lớn bị trả lại vì bong keo." : "Một lô hàng bị trả lại vì bong keo."} ${has(c, "ll_vay") ? "Cùng tuần đó, khoản vay rất thân thiện tới hạn." : "Cùng tuần đó, tiền nhà cũng tới hạn."} Bạn ngồi giữa đống giày bị trả về, đôi nào cũng há mõm như đang cười.`,
        [C("Hoàn tiền đủ, nhận lỗi", { money: -0.4, flags: ["ll_hoan_tien"], counters: { ll_tieng: 1 } }, "Sạch tiền, giữ được tên tuổi"),
         C("Sửa lại từng đôi, xin khách gia hạn", { health: -4, flags: ["ll_sua_lai"], counters: { ll_cham: 1 } }, "Không mất tiền, mất ba tháng ngủ")]),
      card("ll_day_ban_phong", "Phòng trọ im lặng", (c, k) => `${has(c, "ll_gop_von") ? `${cap(k.npc("ban_phong"))} để lại một lá thư, nói không chịu nổi nữa, rồi mang theo một nửa tiền chung.` : `${cap(k.npc("ban_phong"))} chuyển đi, để lại cái máy may và một câu: “Phòng yên quá, tôi không ngủ được.”`} Đêm đầu tiên không có tiếng ngáy, bạn cũng không ngủ được. ${k.gag()}`,
        [C("Đi tìm người đó, nói cho ra nhẽ", { health: -2, flags: ["ll_tim_ban"], counters: { ll_ban: 1 } }, "Có thể lấy lại một người bạn, mất một tuần"),
         C("Để người ta đi, làm tiếp một mình", { happy: -3, flags: ["ll_de_di"], counters: { ll_cham: 1 } }, "Đỡ phiền, cô đơn hơn")]),
      card("ll_day_so_khong", "Lần thứ hai ở số không", (c) => `Ba giờ sáng, bạn ngồi đếm lại: ${has(c, "ll_vay") ? "món nợ mới đã lớn bằng nửa những gì bạn từng mất" : c.debt > 0 ? "món nợ từ đời trước vẫn còn nguyên, còn túi thì chẳng còn gì" : "không nợ ai, nhưng cũng chẳng còn gì"}. Lần thứ hai trong đời bạn đứng ở số không, chỉ khác là lần này bạn biết số không trông như thế nào.`,
        (c, k) => [
          C(`Gọi cho ${k.npc("ba_phe_lieu")}`, { flags: ["ll_goi_ba"], counters: { ll_ba: 1 } }, "Có người chỉ đường, phải nghe giảng một buổi"),
          C("Viết lại kế hoạch từ dòng đầu tiên", { know: 3, flags: ["ll_ke_hoach"] }, "Rõ ràng hơn, chưa ai kiểm chứng"),
        ]),
    ],
    /* chung_ket: thẻ có `when` đứng trước, thẻ không `when` là dự phòng. fashion nhận tới 45, ecommerce tới 50 (PATHS) → mở tới 50 / 55. */
    [
      card("ll_ket_tam_bien", "Tấm biển trước xưởng", (c, k) => `${(c.counters.ll_ba ?? 0) >= 2 ? `${cap(k.npc("ba_phe_lieu"))} cho bạn mượn khoảng sân sau vựa làm xưởng, không lấy tiền, chỉ đòi một đôi giày lệch.` : "Bạn thuê được một gian nhỏ ở cuối chợ, vừa đủ kê cái máy may."} Còn một chuyện của đời trước chưa khép: ${noOr(c, k)}. Lần này, bạn có đủ thứ để chọn cách khép nó. ${k.gag()}`,
        (c) => finale(c.age,
          [ending(L_TIEM, "Treo biển, mở tiệm giày đặt riêng", (c.counters.ll_tieng ?? 0) >= 2 ? "Khách quen đã chờ sẵn, buộc chân ở một chỗ" : "Thành nghề, buộc chân ở một chỗ"),
           ending(L_MANG, "Bán giày lẻ chiếc trên mạng", "Bán khắp nơi, sống trong những thùng hàng")],
          [banY(c), khep]), (c) => c.age <= 50),
      card("ll_ket_chiec_cuoi", "Chiếc giày trái cuối cùng", (c, k) => `Chỉ còn một chiếc giày trái trong số ba trăm chiếc. Bạn đặt nó lên bàn, cạnh tờ giấy ghi chuyện cũ chưa xong: ${noOr(c, k)}. ${k.gag()}`,
        (c) => finale(c.age, [ending(L_MANG, "Bán nốt từng chiếc trên mạng", "Chậm rãi, vui, không bao giờ hết việc")], [banY(c), khep], 2)),
    ],
  ],
};
