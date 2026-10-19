/**
 * Mùa "Kẻ trốn chạy": bỏ chạy lúc nửa đêm, sống bằng một cái tên giả, và nồi cháo khuya thành thứ người ta nhớ.
 * Đầu mùa (R25): chuyển đi nơi khác (move_city) và mang theo món vay nóng (borrow:0.5) mà gã áo hoa đi đòi; repay ở L_VE trả nó.
 * Gag: cái tên giả "Lâm" mà chính bạn cứ quên.
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, finale, land } from "../kit.ts";

const L_XE = land("xe_chao_hop_phap", "Xe cháo khuya được cấp chỗ đứng hợp pháp, có số riêng, và tấm bảng ghi cả tên thật lẫn chữ “Lâm”.", { custom: "become:street_vendor", happy: 6 });
const L_VE = land("ve_tra_no", "Bạn về lại chốn cũ bằng tên thật, trả sạch món nợ, và thấy nhẹ như vừa đặt ba lô xuống.", { money: -1, custom: "repay:1", happy: 8 });
const L_SANG = land("sang_xe", "Bạn sang lại xe cháo cho người học việc, cầm một khoản kha khá, và lần đầu tiên sau nhiều năm ký tên thật vào giấy tờ.", { money: 1, happy: 4 });
/** long_hauler nhận tới 50 tuổi (PATHS), street_vendor tới 70: landing nghề chỉ mở khi tuổi ≤ trần + 5. */
const L_LAI = land("lai_xe_dem", "Bạn nhận lái xe tải đường dài. Không ở đâu quá ba ngày, và lần này là vì thích thế.", { custom: "become:long_hauler", happy: 3 });

const has = (c: { flags: Set<string> }, f: string) => c.flags.has(f);
const sang = ending(L_SANG, "Sang lại xe cháo, cầm tiền, dùng tên thật", "Có một khoản, rời khỏi nồi cháo");

export const TRON_CHAY: SeasonDef = {
  id: "tron_chay", vn: "Kẻ trốn chạy", color: "#4f6377", years: [8, 14],
  rules: { income: 0.8, flags: ["w_tron_chay", "w_ten_gia"] },   // 0.6 → 0.8: cân chỉnh tiền 2026-10-19
  reset: {
    cash: 0.2, effects: { custom: "move_city|borrow:0.5" },
    cast: [
      { key: "chu_tro", role: "neighbor", label: "bà chủ trọ" },
      { key: "ao_hoa", role: "creditor", label: "gã đòi nợ áo hoa" },
      { key: "tra_da", role: "partner", label: "cô bán nước" },
    ],
  },
  gag: { key: "ten_gia_lam", lines: [
    "Bạn khai tên là Lâm. Ba ngày sau có người gọi “Lâm ơi” ngay sau lưng, bạn vẫn đứng im vì quên mất mình đang tên Lâm.",
    "Ngoài chợ có người gọi “Lâm”, bạn không quay lại. Một ông Lâm thật quay lại, rồi nhìn bạn rất lâu.",
    "Bạn đã tập quay đầu mỗi khi nghe chữ “Lâm”, tập kỹ tới mức nghe ai nói “lâm thời” cũng giật mình.",
    "Có người gọi tên thật của bạn giữa đường. Bạn không quay lại, và lần đầu tiên điều đó làm bạn buồn.",
    "Tấm thiệp mời ghi “Thân gửi Lâm”. Bạn đặt nó cạnh gối, thấy cái tên giả hôm nay ấm hơn tên thật.",
  ] },
  landings: [L_XE, L_VE, L_LAI, L_SANG],
  beats: [
    /* mo_man */
    [
      card("tc_mo_xe", "Chuyến xe lúc hai giờ sáng", (c, k) => `Hai giờ sáng, bạn xách một cái ba lô, bỏ lại chậu cây, nửa nồi cơm và tờ giấy vay nóng ký vội tuần trước, giờ đã thành một món nợ có người đi đòi. Chuyến xe đêm còn đúng một ghế, cạnh một lồng gà rất có ý kiến. Sáng ra, xe thả bạn xuống một bến lạ ở ${k.noi}.`,
        [C("Ngồi cạnh lồng gà, đi thẳng một mạch", { flags: ["tc_di_thang"], happy: -2 }, "Tới nhanh, ai hỏi thăm bến xe là lần ra"),
         C("Đổi ba chuyến xe cho rối dấu", { money: -0.1, health: -2, flags: ["tc_doi_xe"] }, "Tốn tiền và sức, khó bị lần theo")]),
      card("tc_mo_tro", "Phòng trọ không hỏi giấy", (c, k) => `${cap(k.npc("chu_tro"))} cho thuê căn gác mười mét vuông, không hỏi giấy tờ, chỉ hỏi bạn có biết sửa ống nước không. Bạn nói biết. ${k.gag()}`,
        [C("Trả trước ba tháng tiền phòng", { money: -0.15, flags: ["tc_tra_truoc"] }, "Hết sạch tiền, được yên ba tháng"),
         C("Trả theo tuần, sửa ống nước bù", { health: -1, flags: ["tc_sua_ong"], counters: { tc_chu_tro: 1 } }, "Giữ được tiền, nhưng bạn đâu có biết sửa ống nước")]),
      card("tc_mo_viec", "Việc không cần tên", () => "Ở chợ đêm, người ta chỉ hỏi bạn làm được gì, không ai hỏi bạn là ai. Một ông già bán cháo bị đau lưng, cần người đẩy xe từ chín giờ tối tới ba giờ sáng.",
        [C("Đẩy xe cháo cho ông già", { flags: ["tc_xe_chao"], counters: { tc_chao: 1 } }, "Lương ít, học được nồi cháo"),
         C("Rửa bát cho quán nhậu bên cạnh", { money: 0.1, flags: ["tc_rua_bat"] }, "Tiền khá hơn, đêm nào cũng ướt tới khuỷu tay")]),
    ],
    /* khoi_dong */
    [
      card("tc_kd_ao_hoa", "Áo hoa ở đầu hẻm", (c, k) => `Chiều thứ bảy, ${k.npc("ao_hoa")} xuất hiện ở đầu hẻm, cầm một tấm ảnh đi hỏi từng nhà. Tấm ảnh chụp bạn năm năm trước, tóc còn dài, mặt còn tròn. ${cap(k.npc("chu_tro"))} cầm ảnh nhìn rất lâu, rồi lắc đầu.`,
        [C("Trốn trong bếp nhà bà chủ trọ", { flags: ["tc_tron_bep"], counters: { tc_chu_tro: 1 } }, "Thoát lần này, mắc nợ bà chủ thêm một lần"),
         C("Cắt tóc, đổi dáng đi, đổi cả giọng", { money: -0.03, happy: -2, flags: ["tc_doi_dang"] }, "Khó nhận ra hơn, soi gương thấy người lạ"),
         C("Ra mặt, hẹn nói chuyện cho xong", { health: -3, flags: ["tc_ra_mat"], counters: { tc_gan: 1 } }, "Hết trốn, nhưng trong túi chưa có tiền trả", { tier: "sovereign" })]),
      card("tc_kd_chao", "Nồi cháo lúc nửa đêm", (c, k) => `${has(c, "tc_xe_chao") ? "Ông già bán cháo nghỉ hẳn, để lại cho bạn cái xe và một lời dặn: “Đừng bớt hành.”" : "Ông già bán cháo nghỉ hẳn. Thấy bạn hay ghé ăn, ông bán lại cái xe với giá rẻ như cho."} Bạn nêm thêm một nhúm tiêu theo kiểu nhà mình, và đám công nhân ca đêm bắt đầu xếp hàng. ${k.gag()}`,
        [C("Bán xuyên đêm, tới khi cạn nồi", { money: 0.15, health: -3, counters: { tc_chao: 2 } }, "Đông khách, ngủ ban ngày như dơi"),
         C("Bán ít, về sớm, giữ mình kín", { flags: ["tc_ban_it"], counters: { tc_chao: 1 } }, "Ít tiền, ít người nhớ mặt")]),
      card("tc_kd_anh", "Tấm ảnh bốn mươi nghìn lượt thích", (c, k) => `Một cô sinh viên chụp xe cháo, đăng lên mạng với dòng chữ “Cháo của người không bao giờ nói tên”. Bài viết có bốn mươi nghìn lượt thích. ${cap(k.npc("tra_da"))} ở xe bên cạnh nhận xét: trong ảnh, mặt bạn còn rõ hơn ảnh căn cước.`,
        [C("Đeo khẩu trang và mũ, kể cả lúc ngủ", { happy: -1, flags: ["tc_khau_trang"] }, "An toàn hơn, khách đồn bạn là người nổi tiếng"),
         C("Treo biển “Cháo Lâm” cho đàng hoàng", { flags: ["tc_bien_lam"], counters: { tc_chao: 2 } }, "Đắt khách, cái tên giả thành thương hiệu")]),
    ],
    /* cu_lat */
    [
      card("tc_cl_nguoi_cu", "Người từ đời cũ ngồi xuống ghế nhựa", (c, k) => `Một tối, ${k.scar("nguoi") || "một người quen ở chốn cũ"} ngồi xuống ghế nhựa trước xe cháo, gọi một tô, rồi nói nhỏ: “Thấy trên mạng.” Người đó kể món nợ của bạn đã được bán lại cho một nhóm khác, và nhóm này không kiên nhẫn như ${k.npc("ao_hoa")}.`,
        [C("Nhờ người đó giữ kín, đừng kể với ai", { flags: ["tc_nho_giu"], counters: { tc_gan: 1 } }, "Giữ được chỗ trốn, thêm một người biết"),
         C("Gửi người đó cầm về một khoản trả bớt", { money: -0.3, flags: ["tc_tra_bot"] }, "Nhẹ nợ, nhưng lộ ra là bạn đang có tiền")]),
      card("tc_cl_mon_do", "Thứ duy nhất trong ba lô", (c, k) => `Từ đời cũ, bạn chỉ mang theo một thứ: ${k.scar("do") || "con dao thái của nhà"}. Đêm cả chợ mất điện, chính thứ đó giúp bạn giữ được nồi cháo, và cả chợ nhìn thấy. Sáng hôm sau, người quản lý chợ hỏi bạn có muốn lấy thêm một chỗ nữa không.`,
        [C("Lấy thêm chỗ, mở xe thứ hai", { money: -0.2, flags: ["tc_xe_hai"], counters: { tc_chao: 2 } }, "Lớn hơn, dễ bị để ý hơn"),
         C("Từ chối, một xe là đủ để trốn", { happy: 2, flags: ["tc_mot_xe"] }, "Yên thân, đứng yên một chỗ")]),
      card("tc_cl_goi_chao", "Gã áo hoa gọi một tô thêm trứng", (c, k) => `Hai giờ sáng, ${k.npc("ao_hoa")} ngồi xuống xe cháo của bạn, gọi một tô thêm trứng. ${has(c, "tc_khau_trang") ? "Gã không nhận ra bạn sau lớp khẩu trang." : has(c, "tc_doi_dang") ? "Gã không nhận ra bạn với mái tóc mới." : "Gã nhìn bạn hai lần, nhưng không nhận ra."} Gã kể đã chán nghề đi đòi nợ, chỉ muốn về quê nuôi cá. ${k.gag()}`,
        [C("Nói thật mình là ai", { flags: ["tc_lo_mat"], counters: { tc_gan: 2 } }, "Liều, có thể thành bạn, có thể thành hồ sơ"),
         C("Múc thêm trứng, im lặng", { flags: ["tc_im"], counters: { tc_chao: 1 } }, "Qua được đêm nay, nỗi sợ còn nguyên")]),
    ],
    /* day */
    [
      card("tc_day_dep", "Đêm dẹp chợ", (c) => `Một đêm có lệnh dẹp chợ đêm. Xe cháo bị cẩu đi lúc nồi còn đang sôi, kèm theo ${has(c, "tc_xe_hai") ? "cả chiếc xe thứ hai" : "cái ghế nhựa duy nhất"}. Muốn chuộc xe phải có giấy tờ tùy thân thật.`,
        [C("Dùng giấy tờ thật để chuộc xe", { money: -0.15, flags: ["tc_lo_ten"] }, "Lấy lại xe, tên thật nằm trong sổ"),
         C("Bỏ xe, bán cháo trước cửa nhà bà chủ trọ", { flags: ["tc_ban_cua"], counters: { tc_chu_tro: 1, tc_chao: -1 } }, "Không lộ tên, khách giảm một nửa"),
         C("Vay nóng đóng một chiếc xe mới", { custom: "borrow:0.3", flags: ["tc_vay_moi"] }, "Trốn nợ bằng một món nợ mới")]),
      card("tc_day_sot", "Cơn sốt không có họ", (c, k) => `Bạn sốt ba ngày liền. Ở phòng khám người ta hỏi họ tên, bạn ấp úng, cô y tá viết tạm “Lâm, không rõ họ”. ${(c.counters.tc_chu_tro ?? 0) >= 2 ? `${cap(k.npc("chu_tro"))} nấu cháo mang lên tận gác, bảo cho bạn biết cảm giác ăn cháo người khác nấu.` : "Không ai biết bạn ốm, nồi cháo nguội trên bếp."}`,
        [C("Nằm viện cho khỏi hẳn", { money: -0.2, health: 5, flags: ["tc_nam_vien"] }, "Mất tiền, lấy lại sức"),
         C("Uống thuốc rồi dậy bán tiếp", { health: -6, counters: { tc_chao: 1 } }, "Giữ khách, sức khỏe trả giá sau")]),
      card("tc_day_giay", "Tờ giấy luồn dưới cửa", (c, k) => `Sáng nay có tờ giấy luồn dưới cửa, viết tay: “Biết chỗ rồi.” ${has(c, "tc_lo_mat") ? `Nét chữ giống hệt chữ ${k.npc("ao_hoa")} ký nợ tô cháo hôm nọ.` : "Không ký tên, không biết của ai, chữ viết rất đẹp."} ${k.gag()}`,
        [C("Xếp ba lô, để sẵn sau cửa", { happy: -3, flags: ["tc_ba_lo"] }, "Sẵn sàng chạy tiếp, không ngủ yên"),
         C("Dán tờ giấy lên tường, kệ nó", { flags: ["tc_o_lai"], counters: { tc_gan: 1 } }, "Quyết không chạy nữa, chưa biết đúng sai")]),
    ],
    /* chung_ket: thẻ có `when` đứng trước, thẻ không `when` là dự phòng (host bắn theo thứ tự khai báo). */
    [
      card("tc_ket_nga_ba", "Ngã ba lúc rạng sáng", (c, k) => `${has(c, "tc_lo_ten") ? "Tên thật của bạn đã nằm trong sổ bãi giữ xe từ lâu, và chẳng ai tới tìm." : "Bạn đã sống bằng tên Lâm lâu tới mức tên thật nghe như của người khác."} Còn một chuyện của đời cũ vẫn chờ lời kết: ${k.scar("no") || "món nợ cũ"}. Một tài xế quen ở chợ đêm cần người thay ca, chạy suốt chiều dài đất nước. ${k.gag()}`,
        (c) => {
          const ve = ending(L_VE, "Về chốn cũ, trả nợ cho xong", "Mất gần hết tiền, được ngủ yên");
          // Đã ra mặt / lộ mặt / trả bớt thì đường về trả nợ đứng trước; nếu không, nó chỉ hiện khi thiếu lựa chọn nghề.
          const ra = has(c, "tc_lo_mat") || has(c, "tc_ra_mat") || has(c, "tc_tra_bot");
          return finale(c.age,
            [ending(L_LAI, "Cầm vô lăng, đi tiếp mà không phải trốn", "Đi mãi, nhưng lần này là tự chọn"),
             ending(L_XE, "Ở lại, xin giấy phép cho xe cháo", "Đứng yên một chỗ, bằng tên thật")],
            ra ? [ve, sang] : [sang, ve]);
        }, (c) => c.age <= 55),
      card("tc_ket_ten_that", "Tên thật", (c, k) => `Một sáng, bạn nhận ra mình không còn sợ tiếng gõ cửa nữa. ${cap(k.scar("no") || "món nợ cũ")}: chuyện đó vẫn chưa xong, và chỉ có tên thật của bạn mới khép nó lại được. ${k.gag()}`,
        (c) => finale(c.age,
          [ending(L_XE, "Ở lại, treo tên thật lên xe cháo", "Giữ được chỗ đứng, gửi tiền trả dần")],
          [ending(L_VE, "Về chốn cũ, trả nợ bằng tên thật", "Mất gần hết tiền, được ngủ yên"), sang],
          2)),
    ],
  ],
};
