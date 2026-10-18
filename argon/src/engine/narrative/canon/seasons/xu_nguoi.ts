/**
 * Mùa "Làm lại ở xứ người": đầu mùa host cho di cư (migrate_now), bạn bắt đầu từ bồn rửa bát của một bếp nhà hàng.
 * Gag: câu cảm ơn đầu tiên bạn học bằng tiếng bản xứ hóa ra nghĩa là "Tôi là một cái ấm nước".
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, finale, land, noOr, pathOpen } from "../kit.ts";

const L_QUAN = land("quan_am_nuoc", "Bạn mở một quán ăn nhỏ ở xứ người, đặt tên là “Ấm nước”. Khách bản xứ không hiểu tại sao cái tên làm người nhập cư bật cười.", { custom: "become:restaurateur", happy: 6 });
const L_VE = land("ve_nuoc", "Bạn về nước, mang theo một công thức, một biệt danh và một cách nhìn mới, rồi làm lại lần nữa ở quê nhà.", { custom: "return_home|become:returnee", happy: 4 });
const L_CUOI = land("cuoi_o_lai", "Bạn ở lại xứ người và cưới một người ở đây. Ở đám cưới, bàn nào cũng có một cái ấm nước.", { custom: "marry", happy: 8 });
const L_O = land("o_lai_xu_nguoi", "Bạn ở lại xứ này, gửi về một khoản lớn để khép chuyện cũ ở quê, và từ đó là người của cả hai nơi.", { money: -1, custom: "repay:1", happy: 3 });
const L_VE_GIA = land("ve_gia", "Bạn về quê nhà, dùng tiền dành dụm sửa lại căn bếp cũ, và ở lại gần những người thân còn lại.", { custom: "return_home", money: -1, happy: 5 });

type Ctx = { flags: Set<string>; counters: Record<string, number> };
const has = (c: { flags: Set<string> }, f: string) => c.flags.has(f);
const tieng = (c: Ctx) => c.counters.xn_tieng ?? 0;
/** Cưới ai: đọc lại người bạn đã gần gũi trong mùa (không đặt tên cast vì host marry tự đặt tên bạn đời). */
/** Cưới chỉ mở cho người trưởng thành chưa có vợ/chồng. */
const cuoiOk = (c: { age: number; married: boolean }) => !c.married && c.age >= 18;
/** Ở lại, gửi tiền về: nhãn theo cảnh (chỉ thẻ sân bay mới có vé để xé). */
const o = (label: string) => ending(L_O, label, "Mất một khoản lớn, giữ được cả hai nơi");
/** Về quê ở gần người thân (khác L_VE: về nước làm nghề mới, nên hai nhãn không na ná). */
const veGia = ending(L_VE_GIA, "Về quê nghỉ ngơi, sửa lại căn bếp cũ", "Tiêu hết tiền dành dụm, ở gần người thân");
const cuoi = (c: Ctx) => ending(L_CUOI,
  has(c, "xn_go_cua") ? "Ở lại, cưới người hàng xóm bạn gõ cửa đêm ốm"
    : has(c, "xn_noi_giup") ? "Ở lại, cưới người bạn từng đứng ra nói giúp"
    : has(c, "xn_hoc_tieng") || has(c, "xn_di_hoc") ? "Ở lại, cưới người bạn cùng lớp học tiếng"
    : "Ở lại, cưới một người của xứ này",
  "Có một mái nhà ở xứ này");

export const XU_NGUOI: SeasonDef = {
  id: "xu_nguoi", vn: "Làm lại ở xứ người", color: "#3d7f8c", years: [10, 20],
  rules: { income: 0.8, flags: ["w_xu_nguoi"] },
  reset: {
    cash: 0.5, effects: { custom: "migrate_now" },
    cast: [
      { key: "chu_nha", role: "neighbor", label: "bà chủ nhà" },
      { key: "dong_huong", role: "partner", label: "người đồng hương bán tạp hóa" },
      { key: "chu_bep", role: "first_boss", label: "ông chủ bếp khó tính" },
    ],
  },
  gag: { key: "am_nuoc", lines: [
    "Câu cảm ơn đầu tiên bạn học bằng tiếng bản xứ hóa ra nghĩa là “Tôi là một cái ấm nước”. Bạn đã nói nó với mười bảy người.",
    "Bạn vẫn lỡ miệng nói “Tôi là một cái ấm nước” mỗi khi ai đó giữ cửa. Người ta bắt đầu gật đầu đáp lại.",
    "Cả tòa nhà giờ gọi bạn là “Ấm nước”. Bạn thôi không cải chính nữa.",
    "Trên giấy mời họp cư dân, tên bạn được in kèm biệt danh “Ấm nước” trong ngoặc, rất trang trọng.",
    "Bạn dạy một người mới sang câu cảm ơn cho đúng. Người đó nói sai thành “Tôi là một cái ấm nước”, và bạn quyết định không sửa.",
  ] },
  landings: [L_QUAN, L_VE, L_CUOI, L_O, L_VE_GIA],
  beats: [
    /* mo_man */
    [
      card("xn_mo_san_bay", "Cửa ra số mười bốn", () => "Bạn đặt chân xuống sân bay với hai cái vali, một túi đồ khô và một tờ giấy ghi địa chỉ viết tay. Biển báo nào cũng là chữ lạ. Người duy nhất bạn hỏi đường hóa ra cũng đang lạc.",
        [C("Đi theo người lạc kia, hai người đỡ hơn một", { flags: ["xn_ban_lac"], counters: { xn_quen: 1 } }, "Có người quen đầu tiên, lạc thêm hai tiếng"),
         C("Đi taxi, đưa tờ giấy cho tài xế", { money: -0.05, flags: ["xn_taxi"] }, "Tới nơi nhanh, mất tiền ăn một tuần")]),
      card("xn_mo_phong", "Căn phòng dưới mái", (c, k) => `${cap(k.npc("chu_nha"))} dẫn bạn lên căn phòng dưới mái, nói một tràng dài về giờ đổ rác, rồi nhìn bạn chờ trả lời. Bạn mỉm cười, nói câu cảm ơn duy nhất mình thuộc. ${k.gag()}`,
        [C("Học tiếng mỗi tối, dù mệt", { health: -1, flags: ["xn_hoc_tieng"], counters: { xn_tieng: 1 } }, "Chậm mà chắc, ít ngủ"),
         C("Sống bằng tay chân và nụ cười", { happy: 2, flags: ["xn_ra_hieu"] }, "Đỡ mệt, mãi là người ngoài")]),
      card("xn_mo_bep", "Ba từ mỗi ngày", (c, k) => `${cap(k.npc("chu_bep"))} nhận bạn rửa bát ở một nhà hàng, ca từ bốn giờ chiều tới nửa đêm. Ông nói đúng ba từ mỗi ngày, và cả ba đều có nghĩa là “nhanh lên”.`,
        [C("Làm hết ca, xin làm thêm cuối tuần", { money: 0.15, health: -3, flags: ["xn_lam_them"] }, "Gửi tiền về được, lưng bắt đầu đau"),
         C("Làm đủ ca, cuối tuần đi học", { know: 2, flags: ["xn_di_hoc"], counters: { xn_tieng: 1 } }, "Ít tiền, mở được cánh cửa về sau")]),
    ],
    /* khoi_dong */
    [
      card("xn_kd_tap_hoa", "Chai nước chấm giá gấp năm", (c, k) => `Bạn tìm thấy một tiệm tạp hóa bán đúng loại nước chấm của quê nhà, giá gấp năm lần. ${cap(k.npc("dong_huong"))} đứng quầy, nghe giọng là biết bạn từ đâu tới, và rủ bạn góp vốn mở một gian bán đồ ăn sáng.`,
        [C("Góp vốn, dậy sớm bán đồ ăn sáng", { money: -0.2, flags: ["xn_gop_von"], counters: { xn_quan: 1 } }, "Có thêm một nghề, ngủ còn bốn tiếng"),
         C("Chỉ mua hàng, không làm chung", { flags: ["xn_khong_gop"] }, "Giữ được tiền, lỡ một cơ hội")]),
      card("xn_kd_giay_to", "Lá thư mười hai trang", (c, k) => `Thư của cơ quan di trú tới, dày mười hai trang, hạn trả lời mười bốn ngày. ${has(c, "xn_hoc_tieng") ? "Bạn đọc được chừng một nửa, đủ để biết mình đang gặp rắc rối." : "Bạn không đọc được trang nào, chỉ nhận ra con số mười bốn."} ${k.gag()}`,
        (c, k) => [
          C("Thuê người làm hồ sơ", { money: -0.2, flags: ["xn_thue_ho_so"] }, "Đắt, nhưng chắc chắn hơn"),
          C(`Tự làm, nhờ ${k.npc("chu_nha")} đọc giúp`, { flags: ["xn_tu_lam_ho_so"], counters: { xn_quen: 1, xn_tieng: 1 } }, "Rẻ, trông vào lòng tốt của người khác"),
        ]),
      card("xn_kd_goi_ve", "Cuộc gọi tối chủ nhật", () => "Mỗi tối chủ nhật bạn gọi về nhà. Ở đầu dây bên kia, người ta hỏi chuyện tiền nhiều hơn chuyện bạn có ăn uống được không.",
        [C("Gửi về gấp đôi, nói mọi thứ đều ổn", { money: -0.2, happy: -2, flags: ["xn_gui_nhieu"] }, "Nhà vui, bạn ăn mì gói cả tháng"),
         C("Nói thật, gửi ít đi", { flags: ["xn_noi_that"], counters: { xn_nha: -1 } }, "Nhẹ người, ở nhà bắt đầu xì xào")]),
    ],
    /* cu_lat */
    [
      card("xn_cl_ben_tau", "Gặp lại ở bến tàu điện", (c, k) => `Ở bến tàu điện, bạn đụng mặt ${k.scar("nguoi") || "một người quen cũ"}, cũng đang làm lại ở đây, cũng mặc áo khoác quá mỏng cho mùa này. Hai người đứng nói chuyện tới khi lỡ mất ba chuyến tàu.`,
        [C("Rủ người đó ở chung cho đỡ tiền", { money: 0.05, flags: ["xn_o_chung"], counters: { xn_quen: 1 } }, "Đỡ tiền nhà, mang theo cả chuyện cũ"),
         C("Chào rồi đi, xứ mới thì người mới", { flags: ["xn_chao_di"] }, "Nhẹ đầu, bớt một chỗ dựa")]),
      card("xn_cl_vali", "Thứ trong đáy vali", (c, k) => `Từ đời cũ, bạn mang sang đây một thứ: ${k.scar("do") || "công thức nồi nước dùng của nhà"}. Ở xứ này, hóa ra thứ đó hiếm. ${cap(k.npc("chu_bep"))} nhìn thấy, và lần đầu tiên nói với bạn một câu dài hơn ba từ. ${has(c, "xn_di_hoc") ? "Nhờ mấy năm đi học cuối tuần, bạn trả lời được trọn câu." : has(c, "xn_lam_them") ? "Sau mấy năm làm thêm cả cuối tuần, ông đã quen mặt bạn hơn quen mặt con mình." : "Bạn trả lời bằng tay, ông gật đầu như đã hiểu."} ${k.gag()}`,
        [C("Đem nó vào bếp, đổi lấy chỗ đứng", { income_mult: 1.1, flags: ["xn_dung_vet"], counters: { xn_quan: 2 } }, "Được lên phụ bếp, ông chủ thành người ơn"),
         C("Giữ cho riêng mình", { happy: 3, flags: ["xn_giu_vet"] }, "Giữ được một mảnh nhà, đứng yên chỗ cũ")]),
      card("xn_cl_kiem_tra", "Đợt kiểm tra lúc mười giờ tối", (c, k) => `Một đợt kiểm tra giấy tờ ập tới nhà hàng lúc mười giờ tối. ${has(c, "xn_thue_ho_so") ? "Hồ sơ thuê người làm của bạn sạch tới từng trang." : has(c, "xn_tu_lam_ho_so") ? `Hồ sơ bạn tự làm, có chữ ký bảo lãnh của ${k.npc("chu_nha")}, vẫn còn nguyên giá trị.` : "Giấy của bạn hợp lệ."} Người rửa bát đứng cạnh thì không may như vậy. Người đó nhìn bạn, nhờ bạn nói giúp một câu.`,
        (c) => [
          C("Đứng ra nói giúp", { happy: 2, flags: ["xn_noi_giup"], counters: { xn_quen: 2 } }, tieng(c) >= 2 ? "Bạn đủ tiếng để nói trôi, nhưng sẽ bị để ý" : "Nói lắp bắp, có thể giúp, có thể hỏng việc"),
          C("Im lặng, cúi đầu làm việc", { happy: -3, flags: ["xn_cui_dau"] }, "An toàn, mất ngủ vài đêm"),
        ]),
    ],
    /* day */
    [
      card("xn_day_om", "Lần đầu ốm ở xứ người", (c) => `Bạn sốt ba ngày trong căn phòng dưới mái. ${has(c, "xn_o_chung") ? "Người ở chung đi làm ca đêm cả tuần, nên không ai nấu cháo, không ai đặt tay lên trán." : "Không ai nấu cháo, không ai đặt tay lên trán."} ${has(c, "xn_gui_nhieu") ? "Tiền thuốc phải trích từ tiền ăn, vì tháng này bạn lại gửi về gấp đôi." : "Tờ hướng dẫn trong hộp thuốc in toàn chữ lạ."}`,
        (c, k) => [
          C(`Gọi cho ${k.npc("dong_huong")}`, { flags: ["xn_goi_dong_huong"], counters: { xn_quen: 1 } }, "Có người tới, phải nghe một tràng chuyện quê"),
          C("Tự chịu, không làm phiền ai", { health: -5, flags: ["xn_tu_chiu"] }, "Giữ thể diện, cơ thể gánh"),
          C("Gõ cửa nhà bên, dù chẳng biết nói gì", { flags: ["xn_go_cua"], counters: { xn_quen: 1, xn_tieng: 1 } }, tieng(c) >= 2 ? "Bạn nói được vài câu, có thể có hàng xóm thật" : "Ngượng muốn độn thổ, có thể có hàng xóm thật", { tier: "sovereign" }),
        ]),
      card("xn_day_dong_cua", "Nhà hàng đóng cửa sau một đêm", (c, k) => `Nhà hàng đóng cửa sau một đêm, không báo trước. ${cap(k.npc("chu_bep"))} để lại cho mỗi người một phong bì mỏng và một câu xin lỗi bằng tiếng bản xứ. Lần đầu tiên bạn hiểu trọn một câu, và đó là câu xin lỗi. ${has(c, "xn_gop_von") ? `May mà còn gian đồ ăn sáng góp vốn với ${k.npc("dong_huong")}.` : has(c, "xn_dung_vet") ? "Bạn vừa được lên phụ bếp chưa đầy một năm." : "Bạn còn đúng tiền nhà hai tháng."} ${k.gag()}`,
        [C("Nhận việc đầu tiên tìm được", { money: 0.1, health: -2, flags: ["xn_viec_tam"] }, "Có tiền ngay, lại bắt đầu từ đáy"),
         C("Lấy phong bì làm vốn, tự nấu bán", { money: -0.1, flags: ["xn_tu_ban"], counters: { xn_quan: 2 } }, "Liều, có thể là viên gạch đầu tiên của cái quán")]),
      card("xn_day_la_thu", "Bao giờ về", (c) => `${has(c, "xn_noi_that") ? "Từ hồi bạn nói thật chuyện tiền, thư từ nhà thưa hẳn, nên lá thư này tới như một tiếng gõ cửa." : has(c, "xn_gui_nhieu") ? "Lá thư từ nhà mở đầu bằng lời cảm ơn số tiền tháng trước, kín nửa trang." : "Một lá thư viết tay từ nhà tới chậm hai tháng."} Trong thư có tấm ảnh căn bếp cũ, và một câu hỏi duy nhất: “Bao giờ về?”`,
        [C("Mua vé về thăm một chuyến", { money: -0.3, happy: 4, flags: ["xn_ve_tham"] }, "Ấm lòng, sạch tiền dành dụm"),
         C("Viết thư trả lời: “Chưa”", { flags: ["xn_chua_ve"], counters: { xn_quan: 1 } }, "Ở lại làm tiếp, nỗi nhớ để dành")]),
    ],
    /* chung_ket: thẻ có `when` đứng trước, thẻ không `when` là dự phòng.
       restaurateur nhận tới 50, returnee tới 60 (PATHS) → mở tới 55 / 65; già hơn chỉ có tiền, về quê, hôn nhân. */
    [
      card("xn_ket_bien_quan", "Tấm biển tên quán", (c, k) => `${(c.counters.xn_quan ?? 0) >= 3 ? `${cap(k.npc("dong_huong"))} để ý một mặt bằng nhỏ đang cho thuê, giá vừa đủ để hai người cùng liều.` : "Một mặt bằng nhỏ gần bến tàu điện đang cho thuê, giá vừa đủ để liều."} ${has(c, "xn_chua_ve") ? "Lá thư “Chưa” năm ấy vẫn chưa có lá nào viết tiếp." : has(c, "xn_ve_tham") ? "Từ chuyến về thăm, bạn biết căn bếp cũ giờ chỉ còn một người nấu." : "Ở quê nhà, căn bếp cũ vẫn chờ."} Còn một chuyện bạn chưa làm xong: ${noOr(c, k, "món nợ cũ của gia đình", "món ân tình cũ với gia đình")}. ${k.gag()}`,
        (c) => finale(c.age,
          [ending(L_QUAN, "Mở quán, đặt tên là “Ấm nước”", has(c, "xn_dung_vet") ? "Ông chủ bếp cũ hứa gửi khách, bám rễ ở xứ người" : "Bám rễ ở xứ người, buộc chân với cái bếp"),
           ending(L_VE, "Về nước, mở nghề mới bằng công thức học được", "Về gần nhà, thu nhập tụt một nửa")],
          [...(cuoiOk(c) ? [cuoi(c)] : []), o("Ở lại làm thuê, gửi tiền về khép chuyện cũ"), veGia]), (c) => c.age <= 55),
      card("xn_ket_chuyen_bay", "Chuyến bay một chiều", (c, k) => `Bạn ngồi ở sân bay, cầm một tấm vé một chiều và một quyết định chưa viết xong. ${(c.counters.xn_quen ?? 0) >= 3 ? "Một nhóm người quen ở xứ này ra tận nơi tiễn, mang theo một cái ấm nước làm quà." : "Không ai ra tiễn, nên bạn có nhiều thời gian để nghĩ."} Chuyện cũ ở quê nhà vẫn chờ: ${noOr(c, k, "món nợ cũ của gia đình", "món ân tình cũ với gia đình")}. ${k.gag()}`,
        (c) => finale(c.age,
          [ending(L_VE, "Lên máy bay, về nước làm lại bằng nghề mới", "Về gần nhà, thu nhập tụt một nửa")],
          // Về quê nghỉ ngơi chỉ hiện khi đã quá tuổi làm lại (returnee), để hai lối về nước không đứng cạnh nhau.
          [o("Xé vé, ở lại, gửi tiền về khép chuyện cũ"), ...(cuoiOk(c) ? [cuoi(c)] : []), ...(pathOpen("returnee", c.age) ? [] : [veGia])])),
    ],
  ],
};
