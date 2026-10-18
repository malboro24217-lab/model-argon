/**
 * Mùa "Ngôi sao bất đắc dĩ": ba mươi giây cầm chổi chỉ đường ở ngã tư làm bạn nổi tiếng cả nước.
 * Thu nhập ×3 suốt mùa, đổi lại không còn đời tư. Gag: cây chổi đi theo bạn tới mọi nơi.
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, land } from "../kit.ts";

const L_MC = land("dan_chuong_trinh", "Bạn nhận dẫn một chương trình buổi tối. Cây chổi năm ấy được treo trên tường trường quay, như một tấm bằng.", { custom: "become:tv_host", happy: 5 });
const L_HAI = land("dien_hai", "Bạn đứng trên sân khấu hài, kể chuyện về cây chổi bằng giọng của người đã chán nó, và khán giả cười to hơn bao giờ hết.", { custom: "become:comedian", happy: 6 });
const L_RUT = land("rut_lui", "Bạn rút lui khi còn được nhớ tới, cầm một khoản đủ để mua sự yên tĩnh trong nhiều năm.", { money: 2.5, happy: 4 });
const L_CUOI = land("cuoi_nguoi_khong_chup", "Bạn cưới người duy nhất chưa từng xin chụp ảnh với mình.", { custom: "marry", happy: 8 });

const has = (c: { flags: Set<string> }, f: string) => c.flags.has(f);
const danh = (c: { counters: Record<string, number> }) => c.counters.ns_danh ?? 0;

export const NGOI_SAO: SeasonDef = {
  id: "ngoi_sao", vn: "Ngôi sao bất đắc dĩ", color: "#d39b1f", years: [8, 14],
  rules: { income: 3, flags: ["w_ngoi_sao", "no_privacy"] },
  reset: {
    cast: [
      { key: "quan_ly", role: "partner", label: "cô quản lý nói nhanh" },
      { key: "fan", role: "neighbor", label: "người hâm mộ số một" },
      { key: "doi_thu", role: "rival", label: "người bắt chước bạn" },
    ],
  },
  gag: { key: "cay_choi", lines: [
    "Từ hôm đó, ở đâu bạn đi qua cũng có người giơ cây chổi lên chào.",
    "Một xưởng làm chổi gửi tặng bạn bốn trăm cây chổi. Phòng khách giờ chỉ còn lối đi ngang.",
    "Ở đám cưới một người quen, cô dâu tung bó hoa, rồi tung luôn một cây chổi về phía bạn.",
    "Có người xin chữ ký lên cán chổi. Bạn ký, và nhận ra chữ ký của mình trên cán chổi đẹp hơn trên giấy.",
    "Bạn mơ thấy mình là một cây chổi. Tỉnh dậy kể với quản lý, cô ấy hỏi ngay có quay lại được không.",
  ] },
  landings: [L_MC, L_HAI, L_RUT, L_CUOI],
  beats: [
    /* mo_man */
    [
      card("ns_mo_clip", "Ba mươi giây giữa ngã tư", () => "Đèn giao thông ở ngã tư hỏng, xe kẹt cứng, và bạn đang cầm sẵn cây chổi vừa mua. Ba mươi giây bạn đứng giữa đường hô “Bên này đi, bên kia chờ” được ai đó quay lại. Sáng hôm sau, đoạn clip có mười một triệu lượt xem.",
        [C("Lên mạng nói vài câu cảm ơn", { flags: ["ns_cam_on"], counters: { ns_danh: 1 } }, "Dễ thương, thêm một triệu lượt xem"),
         C("Tắt điện thoại, đi làm như thường", { happy: 1, flags: ["ns_tat_may"] }, "Yên được ba ngày, rồi người ta tự tìm tới")]),
      card("ns_mo_quan_ly", "Hợp đồng dày như sách giáo khoa", (c, k) => `${cap(k.npc("quan_ly"))} gõ cửa lúc sáu giờ sáng, nói liền một mạch bốn phút không ngắt câu, rồi để lại một bản hợp đồng dày như sách giáo khoa. ${k.gag()}`,
        [C("Ký luôn, tin cô ấy", { flags: ["ns_ky_ngay"], counters: { ns_danh: 2 } }, "Nổi nhanh, không biết mình đã bán những gì"),
         C("Đọc hết hợp đồng rồi mới ký", { know: 2, flags: ["ns_doc_hd"], counters: { ns_danh: 1 } }, "Chậm một tuần, biết rõ mình bán cái gì"),
         C("Tự làm lấy, không cần quản lý", { flags: ["ns_tu_lam"], counters: { ns_danh: 1 }, health: -2 }, "Giữ toàn quyền, tự gánh mọi cuộc gọi", { tier: "sovereign" })]),
      card("ns_mo_quang_cao", "Quảng cáo đầu tiên", () => "Một hãng nước chấm muốn bạn cầm chổi chỉ đường cho một chai nước chấm, trả bằng số tiền bạn từng kiếm trong ba năm. Kịch bản chỉ có một câu: “Chấm là phải đúng làn.”",
        [C("Nhận, đọc câu thoại thật nghiêm túc", { money: 0.5, flags: ["ns_qc_dau"], counters: { ns_danh: 1 } }, "Tiền về, người ta gọi bạn là “chai nước chấm”"),
         C("Từ chối, chỉ nhận việc mình thích", { happy: 2, flags: ["ns_ken_chon"] }, "Giữ được mình, quản lý thở dài")]),
    ],
    /* khoi_dong */
    [
      card("ns_kd_fan", "Tấm bảng tự vẽ ở hàng đầu", (c, k) => `${cap(k.npc("fan"))} có mặt ở mọi buổi bạn xuất hiện, luôn đứng hàng đầu, luôn cầm tấm bảng tự vẽ hình bạn và cây chổi. Hôm nay người đó mang tới một hộp cơm, bảo dạo này bạn gầy đi.`,
        [C("Nhận hộp cơm, hỏi chuyện người đó", { flags: ["ns_quen_fan"], counters: { ns_than: 1 } }, "Có thêm một người quen thật, khó giữ khoảng cách"),
         C("Cảm ơn lịch sự, giữ khoảng cách", { flags: ["ns_xa_fan"] }, "An toàn, hơi lạnh")]),
      card("ns_kd_doi_thu", "Trận đấu chỉ đường", (c, k) => `Trên mạng xuất hiện ${k.npc("doi_thu")}, cầm cây lau nhà chỉ đường ở mọi ngã tư, nói to hơn bạn và cán dài hơn chổi của bạn. Người đó thách bạn một trận chỉ đường phát trực tiếp. ${k.gag()}`,
        [C("Nhận lời thách đấu", { gamble: { p: 0.5,
            win: { flags: ["ns_thang_dau"], counters: { ns_danh: 3 }, log: "Bạn thắng sát nút, khán giả tung chổi lên trời." },
            lose: { happy: -4, flags: ["ns_thua_dau"], counters: { ns_danh: 1 }, log: "Bạn thua, và đoạn thua có nhiều lượt xem hơn mọi đoạn thắng." } } }, "Thắng thì lên đỉnh, thua thì thành trò cười"),
         C("Lờ đi, không đáp lại", { flags: ["ns_lo_di"], counters: { ns_danh: -1 } }, "Giữ phong độ, mất nhiệt")]),
      card("ns_kd_lich", "Mười chín sự kiện một tuần", () => "Lịch tuần này có mười chín sự kiện, ba buổi chụp ảnh và một buổi cắt băng khánh thành nhà vệ sinh công cộng. Bạn ngủ trung bình bốn tiếng, ăn trong xe, và đã quên ngày sinh của chính mình.",
        [C("Chạy hết lịch", { money: 0.3, health: -6, counters: { ns_danh: 2 } }, "Tiền vào ào ào, cơ thể ghi sổ"),
         C("Hủy một nửa, ngủ cho đủ", { health: 3, flags: ["ns_nghi_ngoi"], counters: { ns_danh: -1 } }, "Khỏe hơn, quản lý giận một tuần")]),
    ],
    /* cu_lat */
    [
      card("ns_cl_nguoi_cu", "Ngôi sao này từng là ai", (c, k) => `Một chương trình truyền hình tìm được ${k.scar("nguoi") || "một người quen cũ của bạn"} và mời lên sóng trong số đặc biệt “Ngôi sao này từng là ai”. Người đó đồng ý lên hình, nhưng muốn gặp bạn trước, ở quán nước cũ.`,
        [C("Gặp, cùng chuẩn bị câu chuyện", { flags: ["ns_cung_ke"], counters: { ns_than: 1 } }, "Câu chuyện đẹp, có thể không hoàn toàn thật"),
         C("Không gặp, người đó kể gì thì kể", { flags: ["ns_de_ke"], counters: { ns_danh: 1 } }, "Thật hơn, không ai biết người đó sẽ nói gì")]),
      card("ns_cl_trien_lam", "Triển lãm “Trước khi có chổi”", (c, k) => `Một nhóm làm triển lãm muốn dựng phần “Trước khi có chổi”, kể về đời trước của bạn. Họ muốn làm riêng một góc về ${k.scar("do") || "đôi dép bạn đi hôm quay clip"}, thứ bạn mang theo từ đời cũ, và trả gấp mười lần giá trị của nó.`,
        [C("Đồng ý, kể hết chuyện cũ", { money: 0.3, flags: ["ns_ban_chuyen"], counters: { ns_danh: 1 } }, "Có tiền, đời trước thành của công chúng"),
         C("Từ chối, giữ phần đó cho riêng mình", { happy: 2, flags: ["ns_giu_rieng"] }, "Giữ được một góc riêng, mất một hợp đồng")]),
      card("ns_cl_dieu_khoan", "Điều khoản số mười bảy", (c, k) => `${has(c, "ns_tu_lam") ? "Hãng quảng cáo đầu tiên gửi thư báo" : `${cap(k.npc("quan_ly"))} báo tin`}: theo điều khoản mười bảy, hình ảnh cây chổi giờ thuộc về công ty. ${has(c, "ns_doc_hd") ? "Bạn đã đọc điều khoản này từ đầu, nên rút ngay bản hợp đồng có gạch chân đỏ." : has(c, "ns_tu_lam") ? "Bạn tự ký bản hợp đồng đó, không ai đọc giúp, nên ngồi im rất lâu." : "Bạn chưa từng đọc điều khoản mười bảy, nên ngồi im rất lâu."} ${k.gag()}`,
        [C("Mua lại quyền dùng cây chổi", { money: -0.6, flags: ["ns_mua_quyen"] }, "Đắt, nhưng cây chổi lại là của bạn"),
         C("Đổi hình ảnh, bỏ hẳn cây chổi", { flags: ["ns_bo_choi"], counters: { ns_danh: -2 } }, "Tự do, khán giả cứ hỏi “chổi đâu”"),
         C("Lên mạng kể hết chuyện hợp đồng", { happy: -2, flags: ["ns_to_hd"], counters: { ns_danh: 2 } }, "Được thương, bị kiện", { tier: "sovereign" })]),
    ],
    /* day */
    [
      card("ns_day_clip_cu", "Đoạn clip mười năm trước", () => "Ai đó đào lên một đoạn clip mười năm trước: bạn quát một người bán hàng vì thối nhầm tiền. Trong một đêm, số người theo dõi giảm bốn trăm nghìn, và ba hợp đồng quảng cáo rút lui.",
        [C("Lên sóng xin lỗi, không biện minh", { happy: -3, flags: ["ns_xin_loi"], counters: { ns_danh: -1 } }, "Mất mặt một lần, có thể được tha"),
         C("Im lặng chờ bão qua", { flags: ["ns_im_bao"], counters: { ns_danh: -2 } }, "Không nói sai thêm, bị cho là kiêu"),
         C("Đi tìm người bán hàng năm ấy", { money: -0.1, flags: ["ns_tim_nguoi_ban"], counters: { ns_than: 1 } }, "Chuộc lỗi thật, không ai quay phim", { tier: "sovereign" })]),
      card("ns_day_khong_ai_nhan", "Đi chợ không đeo kính râm", (c, k) => `${danh(c) >= 5 ? "Dù vẫn còn nổi," : "Hai năm sau cơn sốt,"} một sáng bạn đi chợ không đeo kính râm. Cả dãy hàng không ai ngẩng lên, chỉ có đúng một người nhận ra bạn. ${k.gag()}`,
        [C("Tận hưởng sự yên lặng", { happy: 4, flags: ["ns_yen"] }, "Dễ thở, thu nhập bắt đầu tụt"),
         C("Quay một clip mới thật ồn để níu khán giả", { health: -2, flags: ["ns_niu"], counters: { ns_danh: 1 } }, "Có thể trở lại, có thể thành lố")]),
      card("ns_day_cap_cuu", "Đêm ở phòng cấp cứu", (c, k) => `Bạn ngất trong hậu trường một chương trình ca nhạc, ngay trước tiết mục cầm chổi. ${has(c, "ns_quen_fan") ? `${cap(k.npc("fan"))} là người ngồi chờ ngoài phòng cấp cứu tới sáng, không chụp một tấm ảnh nào.` : "Sáng ra, ảnh bạn nằm trên băng ca đã lên mạng trước khi bạn kịp tỉnh."}`,
        [C("Nghỉ hẳn ba tháng", { health: 6, flags: ["ns_nghi_dai"], counters: { ns_danh: -2 } }, "Lấy lại sức, mất ghế"),
         C("Xuất viện, quay lại sân khấu ngay", { money: 0.2, health: -5, counters: { ns_danh: 1 } }, "Khán giả vỗ tay, bác sĩ lắc đầu")]),
    ],
    /* chung_ket: thẻ có `when` đứng trước, thẻ không `when` là dự phòng. */
    [
      card("ns_ket_dem_dien", "Đêm diễn cuối của cây chổi", (c, k) => `${danh(c) >= 6 ? "Vé đêm diễn kỷ niệm bán hết trong bốn phút." : "Đêm diễn kỷ niệm còn trống vài hàng ghế, đủ để bạn nhìn rõ từng khuôn mặt."} Trước giờ lên sân khấu, có tin nhắn nhắc bạn về chuyện cũ chưa xong: ${k.scar("no") || "món nợ cũ"}. Người ta nói giờ bạn nổi tiếng rồi, chắc không quên. Đêm nay, bạn phải chọn mình sẽ là ai khi đèn tắt.`,
        (c) => [
          ending(L_MC, "Nhận dẫn chương trình buổi tối", "Ổn định, cây chổi thành quá khứ có khung"),
          ending(L_RUT, "Rút lui, cầm tiền trả chuyện cũ", "Yên tĩnh, có tiền, không còn ai nhận ra"),
          c.married ? ending(L_HAI, "Lên sân khấu hài, tự cười mình", "Vẫn ở trên sân khấu, lần này bằng giọng thật")
            : ending(L_CUOI, "Cưới người chưa từng xin chụp ảnh", "Một đời tư trở lại, cùng một người"),
        ], (c) => c.age < 50),
      card("ns_ket_tang_choi", "Cây chổi cuối cùng", (c, k) => `Bạn đem tặng cây chổi cuối cùng trong số bốn trăm cây. Chuyện cũ vẫn còn đó: ${k.scar("no") || "món nợ cũ"}, và giờ bạn đủ tiền để khép nó lại. Mười mấy năm được cả nước nhận ra, giờ bạn muốn được nhận ra theo cách khác.`,
        (c) => [
          ending(L_HAI, "Lên sân khấu hài, tự cười mình", "Vẫn ở trên sân khấu, lần này bằng giọng thật"),
          ending(L_RUT, "Rút lui, cầm tiền trả chuyện cũ", "Yên tĩnh, có tiền, không còn ai nhận ra"),
          ...(c.married ? [] : [ending(L_CUOI, "Cưới người chưa từng xin chụp ảnh", "Một đời tư trở lại, cùng một người")]),
        ]),
    ],
  ],
};
