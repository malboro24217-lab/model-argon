/**
 * Mùa "Vụ án gia tộc": người lớn nhất họ mất, để lại một căn nhà, một hộp sắt khóa số và hai bản di chúc.
 * Bạn bị giao giữ chìa, nên vừa là thám tử vừa là nghi phạm. Gag: nhóm chat của họ đổi tên sau mỗi trận cãi.
 */
import type { SeasonDef } from "../Season.ts";
import { C, cap, card, ending, land } from "../kit.ts";

const L_LUAT = land("hoc_luat", "Bạn đọc luật nhiều tới mức đi thi luôn, và từ đó họ hàng gọi bạn bằng chức danh mỗi khi có chuyện.", { custom: "become:lawyer", know: 5 });
const L_PHAN = land("nhan_phan", "Bạn nhận phần thừa kế của mình, ký tên vào biên bản cuối cùng và khép hồ sơ.", { money: 1.5, happy: 3 });
const L_RA_RIENG = land("ra_rieng", "Bạn rời cả họ, chuyển sang thành phố khác, chỉ giữ lại số điện thoại của một người.", { custom: "move_city", rel: -3 });

const has = (c: { flags: Set<string> }, f: string) => c.flags.has(f);

export const VU_AN_GIA_TOC: SeasonDef = {
  id: "vu_an_gia_toc", vn: "Vụ án gia tộc", color: "#7a3b45", years: [8, 16],
  rules: { income: 0.9, flags: ["w_vu_an_gia_toc"] },
  reset: {
    cast: [
      { key: "anh_ho", role: "rival", label: "người anh họ đeo đồng hồ to" },
      { key: "co_ut", role: "mentor", label: "bà cô út" },
      { key: "cong_chung", role: "official", label: "ông công chứng viên" },
    ],
  },
  gag: { key: "nhom_chat_ho", lines: [
    "Tối đó, nhóm chat của họ đổi tên từ “Đại gia đình yêu thương” thành “Gia đình (tạm thời)”.",
    "Nhóm chat của họ lại đổi tên: “Ai cầm giấy tờ nhà thì tự biết”.",
    "Có người lỡ gửi ảnh con mèo vào nhóm chat của họ. Ba mươi người thả tim, cuộc chiến ngừng đúng bốn phút.",
    "Nhóm chat của họ giờ tên là “Họ hàng ơi, bình tĩnh”. Không ai bình tĩnh.",
    "Nhóm chat của họ đổi về tên cũ “Đại gia đình yêu thương”. Lần này, hình như có người tin thật.",
  ] },
  landings: [L_LUAT, L_PHAN, L_RA_RIENG],
  beats: [
    /* mo_man */
    [
      card("va_mo_tang", "Ba mươi hai người khóc to bằng nhau", (c, k) => `Người lớn nhất họ mất ở tuổi chín mươi mốt, để lại căn nhà cũ có giàn hoa giấy, một hộp sắt khóa số và ba mươi hai người con cháu khóc to bằng nhau. Sau bữa cơm, ${k.npc("co_ut")} kéo bạn ra sau bếp, thì thầm: “Hộp sắt nhẹ hơn hôm qua.” ${k.gag()}`,
        [C("Cân thử hộp sắt, ghi lại cân nặng", { know: 2, flags: ["va_can_hop"] }, "Có bằng chứng đầu tiên, bị gọi là đa nghi"),
         C("Bảo bà cô đừng nói lung tung", { flags: ["va_im_di"], counters: { va_hoa: 1 } }, "Giữ hòa khí, mất dấu vết sớm")]),
      card("va_mo_doc", "Buổi đọc di chúc bị hoãn", (c, k) => `${cap(k.npc("cong_chung"))} tới, mở cặp, rồi xin hoãn vì quên kính. Trong mười lăm phút chờ, ${k.npc("anh_ho")} kịp đề nghị bán căn nhà, chia đều, “cho nhanh”.`,
        [C("Đồng ý chia nhanh cho êm", { money: 0.1, flags: ["va_chia_nhanh"], counters: { va_hoa: 1 } }, "Có chút tiền ngay, mất quyền hỏi về sau"),
         C("Đòi chờ đọc di chúc đã", { flags: ["va_cho_doc"], counters: { va_nghi: 1 } }, "Đúng thủ tục, anh họ bắt đầu ghi thù")]),
      card("va_mo_chia_khoa", "Người giữ chìa", () => "Vì là người duy nhất không đòi gì trong bữa cơm, bạn được cả họ giao giữ chìa khóa căn nhà. Chiếc chìa nhỏ xíu mà nặng như một lời buộc tội chưa nói ra.",
        (c, k) => [
          C("Nhận chìa, lập sổ ghi ai ra vào", { flags: ["va_so_ra_vao"], counters: { va_nghi: 1 } }, "Có sổ sách, mất lòng người hay ghé"),
          C(`Gửi chìa cho ${k.npc("co_ut")} giữ hộ`, { flags: ["va_dua_chia"], counters: { va_hoa: 1 } }, "Nhẹ người, chìa nằm trong tay người khác"),
        ]),
    ],
    /* khoi_dong */
    [
      card("va_kd_di_chuc", "Bản di chúc thứ hai", (c, k) => `Cuối cùng di chúc cũng được đọc. Rồi ${k.npc("anh_ho")} rút ra bản thứ hai, mới hơn ba tháng, giao gần hết cho chính anh ta. Chữ ký giống, nhưng nét móc ở cuối thì không. ${k.gag()}`,
        [C("Đòi đem bản thứ hai đi giám định", { money: -0.1, flags: ["va_giam_dinh"], counters: { va_nghi: 1 } }, "Tốn tiền, chiến tranh chính thức nổ ra"),
         C("Ký nhận cả hai, để tòa lo", { flags: ["va_de_toa"] }, "Đỡ ồn ào, mọi thứ kéo dài thêm vài năm")]),
      card("va_kd_hop", "Hộp sắt khóa bốn số", () => "Hộp sắt có ổ khóa bốn số. Cả họ thử ngày sinh, ngày cưới, số nhà, rồi tới số điện thoại của tiệm bánh đầu ngõ. Không cái nào đúng, và tiệm bánh bắt đầu nhận những cuộc gọi rất lạ.",
        [C("Thuê thợ phá khóa", { money: -0.05, flags: ["va_pha_khoa"] }, "Mở được hộp, mất dấu vết trên ổ khóa"),
         C("Đọc nhật ký cũ để đoán mã số", { know: 3, flags: ["va_nhat_ky"], counters: { va_manh: 1 } }, "Chậm, nhưng biết thêm chuyện cũ của họ")]),
      card("va_kd_dem", "Dấu dép cỡ bốn mươi ba", (c) => `${has(c, "va_so_ra_vao") ? "Sổ ra vào ghi trống trơn, vậy mà" : "Không ai ghi chép gì, và"} sáng nay cửa sau mở hé, dấu dép in rõ trên lớp bột mì bạn rắc từ tối qua. Cỡ bốn mươi ba. Cả họ có bảy người đi dép cỡ bốn mươi ba.`,
        [C("Đo chân cả bảy người trong bữa cơm họ", { rel: -3, flags: ["va_do_chan"], counters: { va_nghi: 2 } }, "Ra manh mối, cả họ thấy bị xúc phạm"),
         C("Lặng lẽ thay ổ khóa", { money: -0.02, flags: ["va_thay_khoa"] }, "Chặn được lần sau, mất dấu lần này")]),
    ],
    /* cu_lat */
    [
      card("va_cl_nhan_chung", "Cú điện thoại nửa đêm", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} gọi cho bạn lúc nửa đêm. Hôm bản di chúc đầu tiên được ký, người đó tình cờ có mặt, đứng ngoài cửa sổ chờ trả đồ. Người đó nhớ rất rõ: bản di chúc ký bằng tay trái, vì tay phải của người lớn nhất họ đang băng bó.`,
        [C("Mời người đó ra làm chứng", { flags: ["va_co_nhan_chung"], counters: { va_manh: 2 } }, "Có nhân chứng, kéo người cũ vào vụ ồn ào"),
         C("Giữ bí mật, tự đi kiểm chứng", { know: 2, flags: ["va_tu_kiem"], counters: { va_manh: 1 } }, "Không phiền ai, chậm hơn")]),
      card("va_cl_ma_so", "Bốn câu hỏi, bốn con số", (c, k) => `${has(c, "va_pha_khoa") ? "Hộp sắt đã bị phá khóa từ trước, nhưng đáy hộp còn một ngăn bí mật, cũng khóa bốn số." : "Hộp sắt vẫn đóng chặt."} Đêm mất ngủ, bạn nghĩ tới thứ của đời cũ vẫn còn đi theo mình: ${k.scar("do") || "chiếc đồng hồ cũ"}. Hồi bạn còn nhỏ, người lớn nhất họ từng hỏi bạn về nó đúng bốn câu, và bạn nhớ cả bốn câu trả lời.`,
        (c, k) => [
          C("Thử bốn con số lên ổ khóa", { flags: ["va_mo_hop"], counters: { va_manh: 2 } }, "Có thể mở được, có thể chỉ là trùng hợp"),
          C(`Hẹn ${k.npc("cong_chung")} mở cùng`, { flags: ["va_mo_cong_khai"], counters: { va_hoa: 1, va_manh: 1 } }, "Minh bạch, mất một tháng chờ lịch"),
        ]),
      card("va_cl_so_vay", "Cuốn sổ trong hộp sắt", (c, k) => `Trong hộp không có tiền. Chỉ có một cuốn sổ ghi tay, liệt kê ai trong họ từng vay bao nhiêu, từ năm nào, kèm lời nhắn “không đòi”. ${has(c, "va_chia_nhanh") ? "Tên bạn cũng có, ở dòng thứ chín." : `Tên của ${k.npc("anh_ho")} đứng đầu, gạch chân hai lần.`} ${k.gag()}`,
        [C("Đọc to cuốn sổ trước cả họ", { rel: -4, flags: ["va_doc_so"], counters: { va_nghi: 2 } }, "Sự thật ra ánh sáng, cả họ mất mặt"),
         C("Cất sổ, chỉ nói với người cần biết", { flags: ["va_cat_so"], counters: { va_hoa: 1 } }, "Giữ thể diện cho họ, giữ một quả bom"),
         C("Đốt sổ, xóa nợ cho tất cả", { happy: 3, flags: ["va_dot_so"], counters: { va_hoa: 2 } }, "Cả họ được tha, bạn mất con bài", { tier: "sovereign" })]),
    ],
    /* day */
    [
      card("va_day_to_cao", "Lá đơn có mười một chữ ký", (c, k) => `${cap(k.npc("anh_ho"))} nộp đơn, nói bạn là người giữ chìa nên chính bạn lấy giấy tờ nhà. Lá đơn có chữ ký của mười một người họ hàng, trong đó có hai người bạn từng cho vay tiền.`,
        [C("Thuê luật sư, cãi tới cùng", { money: -0.3, flags: ["va_thue_ls"] }, "Tốn tiền, giữ được tên mình"),
         C("Tự đọc luật, tự bào chữa", { know: 5, health: -3, flags: ["va_tu_hoc_luat"] }, "Rẻ, mất ngủ, hiểu luật hơn mình tưởng")]),
      card("va_day_o_khoa", "Ổ khóa lạ trên cửa nhà cũ", (c, k) => `Sáng nay căn nhà cũ có ổ khóa mới, không phải của bạn. ${has(c, "va_thay_khoa") ? "Ổ khóa bạn thay hôm trước bị tháo ra, vứt dưới gốc hoa giấy." : "Giàn hoa giấy đã bị chặt sát gốc."} Hàng xóm kể ${k.npc("anh_ho")} đưa người tới dọn đồ từ lúc trời chưa sáng. ${k.gag()}`,
        [C("Đứng trước cửa cả ngày, không về", { health: -3, flags: ["va_ngoi_cua"], counters: { va_nghi: 1 } }, "Cả xóm nhìn thấy, anh họ buộc phải nói chuyện"),
         C("Về nhà, gom giấy tờ, chờ phiên tòa", { happy: -3, flags: ["va_cho_toa"] }, "Giữ sức cho trận chính, mất căn nhà vài tháng")]),
      card("va_day_co_ut", "Ấm trà rất đặc", (c, k) => `${cap(k.npc("co_ut"))} gọi bạn tới, pha một ấm trà rất đặc, rồi đặt lên bàn một phong bì cũ. Chính bà là người lấy giấy tờ nhà khỏi hộp sắt, từ trước khi người lớn nhất họ mất, theo đúng lời dặn: “Đừng đưa cho đứa nào hỏi đầu tiên.”`,
        [C("Đưa phong bì ra tòa ngay", { flags: ["va_nop_giay"], counters: { va_manh: 2 } }, "Thắng nhanh, bà cô bị hỏi han ê chề"),
         C("Cùng bà tìm cách nói với cả họ", { flags: ["va_noi_ca_ho"], counters: { va_hoa: 2 } }, "Chậm hơn, không ai phải mất mặt một mình")]),
    ],
    /* chung_ket: thẻ có `when` đứng trước, thẻ không `when` là dự phòng. */
    [
      card("va_ket_toa", "Phiên tòa đông như đám cưới", (c, k) => `Ngày xử, phòng tòa chật như đám cưới. ${has(c, "va_nop_giay") || has(c, "va_noi_ca_ho") ? `Phong bì của ${k.npc("co_ut")} được mở, và bản di chúc thứ hai rơi vào im lặng.` : has(c, "va_co_nhan_chung") ? "Nhân chứng kể về bàn tay phải băng bó, và bản di chúc thứ hai rơi vào im lặng." : "Không ai có bằng chứng trọn vẹn, nên tòa chia đều cho tất cả."} Ra khỏi tòa, bạn nhớ ra mình còn một chuyện riêng của đời cũ chưa xong: ${k.scar("no") || "món nợ cũ"}.`,
        (c) => [
          ending(L_LUAT, "Đi thi vào nghề luật, làm cho ra lẽ", "Bắt đầu một nghề mới, cả họ thành khách hàng"),
          ending(L_PHAN, "Nhận phần của mình, khép hồ sơ", "Có tiền trả chuyện cũ, mất vài người họ hàng"),
          ...(has(c, "va_dot_so") || (c.counters.va_hoa ?? 0) >= 4 ? [ending(L_RA_RIENG, "Rời cả họ, ra riêng ở thành phố khác", "Nhẹ đầu, ít người gọi về")] : []),
        ], (c) => c.age < 56),
      card("va_ket_hoa_giay", "Giàn hoa giấy mọc lại", (c, k) => `Giàn hoa giấy trước căn nhà cũ đâm chồi lại, như chưa từng bị chặt. Vụ án đã khép, chỉ còn chuyện của riêng bạn: ${k.scar("no") || "món nợ cũ"}. Bạn ngồi dưới giàn hoa, nghĩ xem mình muốn sống phần đời còn lại ở đâu. ${k.gag()}`,
        [ending(L_PHAN, "Nhận phần thừa kế, trả dứt chuyện cũ", "Có tiền, mất vài người họ hàng"),
         ending(L_RA_RIENG, "Rời cả họ, ra riêng ở thành phố khác", "Nhẹ đầu, ít người gọi về")]),
    ],
  ],
};
