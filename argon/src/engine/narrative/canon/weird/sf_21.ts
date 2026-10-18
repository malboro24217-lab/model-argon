/**
 * Nhánh kỳ dị S21–S30 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 */
import type { WeirdBranch } from "../Canon.ts";
import type { FactContext } from "../../types.ts";
import { C, cap, card, ending, land, season, weird } from "../kit.ts";
import { PATHS } from "../../paths/registry.ts";

const has = (c: FactContext, f: string): boolean => c.flags.has(f);
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Landing `become:<p>` chỉ mở khi PATHS[p].ages[0] ≤ tuổi ≤ PATHS[p].ages[1] + 5 (addendum 1). */
const can = (c: FactContext, p: string): boolean => { const d = PATHS[p]; return !!d && c.age >= d.ages[0] && c.age <= d.ages[1] + 5; };

/* ================================================================== S21 Cuộc gọi từ chính bạn 10 năm sau */

const L21_TRANH = land("s21_tranh_nan", "Bạn bán kịp mọi thứ trước ngày đó và thoát nạn với một khoản tiền lớn. Người thân thiết nhất thì không bao giờ gọi lại nữa.", { money: 1.5, rel: -15, happy: -6 });
const L21_QUAY = land("s21_quay_lai", "Bạn lao lên tầng trên và kéo được người ấy ra khỏi khói. Tiền bạc, giấy tờ, đồ đạc: cháy sạch.", { money: -2, rel: 12, happy: 4, health: -8 });

const S21 = weird("S21", "sf", ["ky", "tinh"],
  (c) => c.pressure.ky >= 5 && c.age >= 18 && c.age <= 70,
  () => "Nghe máy khi chính mình gọi tới",
  () => ({
    title: "Số máy của chính bạn",
    text: "Điện thoại rung lúc 2 giờ 17 sáng, màn hình hiện đúng số của bạn. Đầu dây bên kia là giọng bạn, khàn hơn, già hơn chừng mười tuổi, vừa nói vừa nhai gì đó giòn rụm: \"Đừng hỏi gì. Ngày mai đừng đi đường cũ. Tao nói một lần thôi.\" Rồi máy tắt, và trong nhật ký, cuộc gọi ấy được ghi là gọi đi.",
  }),
  season({
    id: "w_S21", vn: "Nghe lời mình tương lai", color: "#4a5bd6", years: [6, 10], weird: "sf",
    rules: { flags: ["w_future_call"] },
    reset: { cast: [{ key: "co_tho_may", role: "neighbor", label: "cô thợ sửa điện thoại đầu ngõ" }] },
    gag: { key: "tieng_nhai", lines: [
      "Ở đầu dây bên kia, bạn của mười năm sau đang nhai gì đó giòn rụm, và máy tắt đúng lúc sắp nói tới chữ quan trọng.",
      "Lại tiếng nhai giòn rụm. Bạn hỏi đang ăn gì, giọng kia đáp: \"Rồi mày sẽ biết\", rồi tắt máy.",
      "Tiếng nhai vang trong đầu bạn cả khi điện thoại im. Bạn mua thử mười loại bánh giòn, không loại nào đúng tiếng.",
      "Lần này bạn nghe rõ: đó là tiếng nhai đá lạnh. Mười năm sau, bạn nhai đá mỗi khi sợ.",
    ] },
    landings: [L21_TRANH, L21_QUAY],
    beats: [
      /* mo_man */
      [
        card("s21_mo_loi_dau", "Lời khuyên đầu tiên", (c, k) => `Sáng hôm sau, bạn đứng ở ngã tư quen, nhớ lại câu "ngày mai đừng đi đường cũ". Đường cũ ngắn hơn mười phút, đường vòng thì kẹt xe tới tận chợ. ${k.gag()}`,
          [C("Nghe lời, đi đường vòng", { flags: ["s21_nghe_1"], counters: { s21_nghe: 1 }, happy: -1 }, "Đến muộn, nhưng biết giọng kia có nói thật không"),
           C("Đi đường cũ cho biết", { flags: ["s21_cai_1"], counters: { s21_cai: 1 }, health: -4 }, "Tự kiểm chứng, có thể trả giá bằng chính mình")]),
        card("s21_mo_tho_may", "Cô thợ sửa điện thoại", (c, k) => `${has(c, "s21_cai_1") ? "Trên đường cũ, một tấm biển quảng cáo rơi sượt qua vai bạn, cách nửa bước chân." : "Bản tin trưa nói một tấm biển quảng cáo trên đường cũ đã rơi, đúng giờ bạn thường đi qua."} Bạn mang điện thoại tới ${k.npc("co_tho_may")}. Cô tháo máy, soi đèn, rồi kết luận: "Số này gọi từ chính máy này. Mà lúc đó máy này đang tắt."`,
          [C("Đổi sim, đổi luôn số", { flags: ["s21_doi_so"], money: -0.02 }, "Yên được vài tuần, rồi nó gọi qua số mới"),
           C("Nhờ cô ghi âm cuộc gọi sau", { flags: ["s21_ghi_am"], counters: { s21_nguoi_biet: 1 } }, "Có bằng chứng, thêm một người biết chuyện")]),
      ],
      /* khoi_dong */
      [
        card("s21_kd_hop_dong", "Lời khuyên có giá", (c, k) => `Đêm thứ Năm, giọng kia gọi lại: "Đừng ký cái giấy ngày thứ Ba. Ký là mất trắng. Nhưng nghe tao thì sẽ có người giận mày rất lâu." Người rủ bạn làm ăn đã đặt cọc nhà hàng để ăn mừng. ${k.gag()}`,
          [C("Rút khỏi vụ làm ăn", { money: 0.3, rel: -4, counters: { s21_nghe: 1 }, flags: ["s21_rut"] }, "Giữ được tiền, mất lòng người rủ bạn"),
           C("Ký, coi như lời đồn", { money: -0.4, counters: { s21_cai: 1 }, flags: ["s21_ky"] }, "Giữ chữ tín, có thể mất trắng")]),
        card("s21_kd_hoi_so", "Cô thợ muốn hỏi số", (c, k) => `${has(c, "s21_ghi_am") ? `${cap(k.npc("co_tho_may"))} nghe đi nghe lại đoạn ghi âm tới thuộc lòng.` : `${cap(k.npc("co_tho_may"))} vẫn nhớ cái số máy kỳ lạ của bạn.`} Cô đặt lên bàn một tờ giấy trắng và cây bút: "Lần tới hỏi giùm tôi mấy con số. Trúng thì chia đôi."`,
          [C("Hỏi giùm cô", { flags: ["s21_hoi_so"], counters: { s21_tham: 1 } }, "Có thể giàu, giọng kia có thể giận"),
           C("Từ chối thẳng", { flags: ["s21_tu_choi_so"], happy: -1 }, "Giữ lời khuyên cho việc lớn, mất một người bạn mới")]),
      ],
      /* cu_lat */
      [
        card("s21_cl_ngay_do", "Cái ngày được báo trước", (c, k) => `${has(c, "s21_hoi_so") ? "Sau vụ hỏi số, giọng kia im lặng gần một năm, rồi gọi lại đúng sinh nhật bạn." : "Giọng kia gọi lại đúng sinh nhật bạn, nghiêm hơn mọi lần."} "Vài năm nữa, khu nhà ở ${k.noi} sẽ cháy. Hôm đó, thứ mày mang theo từ đời cũ, ${k.scar("do") || "chút vốn liếng cũ của mày"}, sẽ cứu mày. Và đừng để ${k.scar("nguoi") || "người hay lui tới nhà mày"} biết tao đã gọi." Bạn hỏi tại sao. Đầu dây bên kia thở dài: "Vì người đó sẽ không tin, và mày sẽ chọn sai."`,
          [C("Chuẩn bị âm thầm", { counters: { s21_chuan_bi: 2 }, money: -0.15, flags: ["s21_am_tham"] }, "Kịp thời, nhưng phải giấu người thân"),
           C("Kể hết cho người ấy", { flags: ["s21_ke"], rel: 4 }, "Không giấu ai, trái lời chính mình"),
           C("Cúp máy, tự quyết đời mình", { flags: ["s21_tu_quyet"], agency: 0.03 }, "Không nghe ai nữa, kể cả chính mình")]),
      ],
      /* day */
      [
        card("s21_day_nguoi_la", "Người ta bắt đầu tránh bạn", (c, k) => `${cnt(c, "s21_nghe") >= 2 ? "Mấy năm nay bạn làm gì cũng hỏi ý cái điện thoại trước." : "Bạn bắt đầu cất tiền ở ba chỗ khác nhau và ngủ với đôi giày dưới gối."} Người quen nhìn bạn như nhìn một người đang bệnh. ${k.gag()}`,
          [C("Đi khám cho mọi người yên tâm", { money: -0.05, flags: ["s21_kham"], happy: 2 }, "Có giấy khám bình thường, chẳng ai tin hơn"),
           C("Mặc kệ, tiếp tục chuẩn bị", { counters: { s21_chuan_bi: 1 }, rel: -5 }, "Sẵn sàng hơn, cô đơn hơn")]),
        card("s21_day_im_lang", "Đêm điện thoại không reo", (c, k) => `Đêm trước ngày đó, điện thoại không reo. Bạn gọi ngược vào số của chính mình và nghe tổng đài nói: "Số máy này chưa tồn tại." ${has(c, "s21_ke") ? `${cap(k.scar("nguoi") || "Người ấy")} đã nghe bạn kể, cười xòa, rồi vẫn ${c.nemesis ? "hẹn bạn tới khu nhà đó để nói cho ra lẽ chuyện cũ" : "hẹn ăn tối với bạn ở khu nhà đó"}.` : "Không ai khác biết ngày mai có chuyện gì."}`,
          [C("Ép mọi người rời khu nhà", { money: -0.2, rel: -6, flags: ["s21_so_tan"] }, "Có thể cứu người, chắc chắn mất lòng"),
           C("Ở lại canh một mình", { health: -4, flags: ["s21_canh"] }, "Ở gần, kịp ứng biến")]),
      ],
      /* chung_ket */
      [
        card("s21_ket", "Khói lúc chạng vạng", (c, k) => `${has(c, "s21_so_tan") ? "Khói bốc lên lúc chạng vạng, khi khu nhà đã vắng quá nửa nhờ bạn làm ầm suốt ngày." : "Khói bốc lên lúc chạng vạng, đúng như giọng kia đã nói."} ${cnt(c, "s21_chuan_bi") >= 2 ? "Túi đồ chuẩn bị mấy năm nằm sẵn cạnh cửa, nặng trĩu." : "Bạn chẳng chuẩn bị gì, chỉ có đôi dép đang đi."} Bạn chợt nhớ ${k.scar("no") || "món nợ chưa trả"} vẫn còn đó, và người duy nhất biết chuyện ấy đang ở tầng trên. Điện thoại reo lần cuối: "Giờ thì mày chọn. Tao chọn rồi, và tao sống với nó mười năm." ${k.gag()}`,
          [ending(L21_TRANH, "Chạy ra, giữ lấy mình", "Thoát nạn, có tiền, mất người"),
           ending(L21_QUAY, "Lao lên tầng trên", "Giữ được người, mất hết của")]),
      ],
    ],
  }));

/* ================================================================== S22 Vũ trụ song song chạm nhau */

const L22_DOI = land("s22_doi_cho", "Bạn bước qua khe gương, mang theo một người, một món đồ và một món nợ của mình, sống tiếp đời mà bạn đã không chọn.", { custom: "swap_other", money: -1 });
const L22_O = land("s22_o_lai", "Bạn ở lại đời mình. Bản kia để lại cuốn sổ ghi chú mực đỏ, và từ đó bạn làm gì cũng tính trước hai bước.", { income_mult: 1.25, happy: 4 });

const S22 = weird("S22", "sf", ["ky", "mau"],
  (c) => c.canon_n >= 1 && c.age >= 18 && c.age <= 70,
  () => "Bắt tay bản kia của chính mình",
  () => ({
    title: "Bản kia gõ cửa gương",
    text: "Trong gương thang máy, hình phản chiếu của bạn không giơ tay theo bạn. Nó gõ ba cái vào mặt kính từ phía bên kia, mặc đúng chiếc áo bạn suýt mua năm nào, rồi bước hẳn ra ngoài như bước xuống xe buýt. \"Tao là mày, nếu hồi đó mày chọn cửa kia. Đổi chỗ thử một hôm không?\"",
  }),
  season({
    id: "w_S22", vn: "Đổi chỗ", color: "#7a52d1", years: [5, 6], weird: "sf",
    rules: { flags: ["w_other_self"] },
    reset: { cast: [{ key: "ong_gac_dem", role: "neighbor", label: "ông gác đêm của tòa nhà" }] },
    gag: { key: "ban_kia_muon_do", lines: [
      "Bản kia mượn đôi dép của bạn, sáng hôm sau trả lại một đôi giày da bóng loáng.",
      "Bản kia mượn cái ô thủng, trả lại một cái ô gấp tự bung. Bạn bắt đầu thấy hơi bị xúc phạm.",
      "Bản kia mượn cuốn sổ chi tiêu của bạn, trả lại kèm ba trang ghi chú bằng mực đỏ.",
      "Lần đầu tiên, bản kia trả lại một món tệ hơn lúc mượn: chiếc đồng hồ chạy chậm đúng mười năm.",
    ] },
    landings: [L22_DOI, L22_O],
    beats: [
      /* mo_man */
      [
        card("s22_mo_guong", "Người trong gương bước ra", (c, k) => `Bản kia ngồi xuống ghế nhà bạn, tự rót nước, chê ấm trà hơi nhạt. Nó kể đời bên đó: cùng ngày sinh, cùng cha mẹ, chỉ khác một lần chọn cửa, rồi mọi thứ trượt đi. ${cap(k.npc("ong_gac_dem"))} gõ cửa hỏi sao trong nhà có hai giọng giống hệt nhau. ${k.gag()}`,
          [C("Mời bản kia ở lại vài hôm", { flags: ["s22_o_chung"], happy: 2 }, "Có người hiểu mình nhất, cũng soi mình nhất"),
           C("Nhờ ông gác đêm canh cái gương", { flags: ["s22_canh_guong"], counters: { s22_de_phong: 1 } }, "An toàn hơn, bản kia phật ý")]),
        card("s22_mo_so", "Hai cuốn sổ đời", (c) => `Bản kia đặt lên bàn sổ tiết kiệm, sổ khám bệnh và danh bạ của nó. ${c.married ? "Bên đó nó chưa từng cưới ai." : "Bên đó nó đã có gia đình."} ${c.rich ? "Bên đó nó nghèo hơn bạn một chút." : "Bên đó nó khá giả hơn bạn một chút."} Nó hỏi bạn có muốn xem kỹ không.`,
          [C("Lật từng trang", { know: 3, flags: ["s22_doc_so"], happy: -2 }, "Biết hết, khó ngủ"),
           C("Gấp sổ lại", { flags: ["s22_khong_doc"], happy: 2 }, "Giữ yên đời mình, bỏ lỡ manh mối")]),
      ],
      /* khoi_dong */
      [
        card("s22_kd_doi_vai", "Một ngày đổi vai", (c, k) => `Hai bên thỏa thuận thử: bản kia ${c.has_job ? "đi làm thay bạn" : "sống thay bạn ở nhà"} một ngày, còn bạn sang sống đời bên kia qua khe gương. ${has(c, "s22_canh_guong") ? `${cap(k.npc("ong_gac_dem"))} cầm đèn pin đứng canh, đếm từng phút.` : "Không ai canh khe gương cả."} Chiều về, ${c.has_job ? "đồng nghiệp" : "hàng xóm"} khen bạn hôm nay "như người khác". ${k.gag()}`,
          [C("Đổi thêm một tuần", { counters: { s22_doi: 2 }, flags: ["s22_doi_tuan"] }, "Quen dần đời kia, quen luôn việc bỏ đời này"),
           C("Dừng ngay sau một ngày", { counters: { s22_doi: 1 }, flags: ["s22_dung_som"] }, "Giữ ranh giới, bản kia buồn")]),
      ],
      /* cu_lat */
      [
        card("s22_cl_vet", "Thứ bên kia không có", (c, k) => `${has(c, "s22_doc_so") ? "Bạn đã đọc sổ của nó nên biết trước câu hỏi sắp tới." : "Bạn không đọc sổ của nó, nên câu hỏi tới bất ngờ."} Bản kia hỏi về ${k.scar("nguoi") || "người bạn hay nhắc"}. Bên đó, hai người chưa từng gặp nhau. Nó cũng chưa từng có chuyện gì với ${k.scar("do") || "thứ bạn mang theo từ đời cũ"}, và nghe bạn kể về điều ấy rất lâu, như nhìn một con đường không đi. "Cho tao thử sống với cái đó một hôm, được không?"`,
          [C("Cho nó thử một hôm", { flags: ["s22_cho_muon"], counters: { s22_doi: 1 } }, "Bản kia hiểu đời bạn hơn, có thể không chịu trả lại"),
           C("Kể cho nó nghe về người ấy", { flags: ["s22_ke"], rel: 3 }, "Chia một phần đời mình cho chính mình"),
           C("Giữ lại cả hai", { flags: ["s22_giu"], happy: -1 }, "Đời ai nấy giữ")]),
      ],
      /* day */
      [
        card("s22_day_khe", "Khe gương khép dần", (c, k) => `${has(c, "s22_canh_guong") ? `${cap(k.npc("ong_gac_dem"))} vẫn canh cái gương như bạn nhờ, và đo khe bằng thước dây mỗi đêm` : `${cap(k.npc("ong_gac_dem"))} tự dưng tò mò, đo khe gương bằng thước dây mỗi đêm`}: hẹp lại một ngón tay mỗi tháng. "Hết mùa này là đóng," ông nói. "Ai ở bên nào thì ở luôn bên đó."`,
          [C("Viết thư cho chính mình bên kia", { flags: ["s22_thu"], happy: 2 }, "Để lại một lời dặn, lộ một nỗi sợ"),
           C("Bán bớt đồ cho dễ đi", { money: 0.3, flags: ["s22_ban_do"] }, "Gọn nhẹ, tự cắt đường lui")]),
        card("s22_day_met", "Bản kia cũng có nợ", (c, k) => `Một đêm, bản kia ngồi ở bậc cửa, khóc đúng kiểu bạn vẫn khóc. Bên đó nó cũng có nợ, cũng có người không nhìn mặt, cũng thức tới ba giờ sáng tính tiền. "Tao tưởng đổi được là hết khổ," nó nói. "Hóa ra chỉ là khổ kiểu khác." ${k.gag()}`,
          [C("An ủi nó như an ủi chính mình", { flags: ["s22_an_ui"], happy: 3 }, "Thương mình hơn, khó dứt hơn"),
           C("Hỏi thẳng nó muốn gì", { flags: ["s22_hoi_thang"], know: 2 }, "Rõ ràng, lạnh lùng")]),
      ],
      /* chung_ket */
      [
        card("s22_ket", "Đêm khe gương đóng", (c, k) => `${has(c, "s22_doi_tuan") ? "Mấy tuần đổi vai làm bạn quen đường sang bên đó hơn đường về nhà." : "Bạn mới sang bên đó đủ lâu để nhớ mùi."} Khe gương chỉ còn rộng bằng một bàn tay. Bản kia nói bên đó ${k.scar("no") || "món nợ của bạn"} cũng đang chờ, chỉ là chưa ai tới đòi. ${k.gag()} Nó chìa tay: "Mày qua, hay tao về?"`,
          [ending(L22_DOI, "Bước qua khe gương", "Sống đời đã không chọn, mang theo ba vết cũ"),
           ending(L22_O, "Ở lại, tiễn bản kia về", "Giữ đời mình, học được một nếp nghĩ")]),
      ],
    ],
  }));

/* ================================================================== S23 Cây trong vườn nói được tiếng người */

const L23_AGRI = land("s23_nong_cong_nghe", "Vườn của bạn thành trang trại có máy dịch tiếng cây: cây báo khát, báo sâu, báo cả khi sắp được mùa.", { custom: "become:agritech", happy: 4 });
const L23_NOI = land("s23_noi_tieng", "Bạn thành người nổi tiếng trên mạng với những buổi phát trực tiếp phiên dịch cho cây.", { custom: "become:influencer", happy: 4 });
// gần nhất: "nổi tiếng" cho người quá tuổi làm KOL
const L23_SACH = land("s23_viet_sach", "Bạn viết cuốn sách đầu tiên ghi lại lời cây già kể, và nhà xuất bản đặt luôn cuốn thứ hai.", { custom: "become:writer", happy: 4 });
const L23_BAN = land("s23_ban_giong", "Bạn bán giống cây biết nói cho một viện nghiên cứu, đủ tiền sống thong thả nhiều năm.", { money: 2.5, happy: -2 });
const L23_GIU = land("s23_mo_vuon", "Bạn mở cửa vườn cho khách vào nghe cây kể chuyện. Tiền vé đủ sửa nhà, còn vườn thì không còn là của riêng.", { money: 1.2, happy: 5 });

const S23 = weird("S23", "sf", ["ky", "dat"],
  (c) => c.farmer && c.age >= 18 && c.age <= 70 && (c.owns.has("land") || has(c, "orchard") || has(c, "job_farm")),
  () => "Trả lời cái cây trong vườn nhà mình",
  () => ({
    title: "Cây già biết nói",
    text: "Sáng nay cây già nhất trong vườn nhà bạn lên tiếng, bằng giọng một bà cụ khó tính: \"Đất thiếu phân, nước tưới thì lạnh, còn cái kéo của cháu cùn lắm rồi.\" Ba con chim trên cành cùng quay sang nhìn bạn, như chờ bạn trả lời. Cái kéo trong tay bạn đúng là cùn thật.",
  }),
  season({
    id: "w_S23", vn: "Người phiên dịch thực vật", color: "#3d8fc4", years: [6, 10], weird: "sf",
    rules: { flags: ["w_talking_plants"] },
    reset: { cast: [{ key: "giao_su", role: "mentor", label: "ông giáo sư thực vật về hưu" }] },
    gag: { key: "ga_trong", lines: [
      "Cây già phàn nàn: con gà trống nhà bên gáy lệch giờ đúng bốn phút, nghe rất khó chịu.",
      "Cây già lại nhắc tới con gà trống. Lần này nó đòi bạn mang sang nhà bên một cái đồng hồ.",
      "Con gà trống nhà bên gáy đúng giờ được một hôm. Cây già bảo vậy còn tệ hơn, vì nó hết chuyện để chê.",
      "Cây già kể nó quen con gà trống từ đời ông cố của con gà. Bạn quyết định không hỏi thêm.",
    ] },
    landings: [L23_AGRI, L23_NOI, L23_SACH, L23_BAN, L23_GIU],
    beats: [
      /* mo_man */
      [
        card("s23_mo_tra_loi", "Cây già lên tiếng", (c, k) => `Cây già nói suốt buổi sáng, chủ yếu là chê. Nó chê cách bạn tỉa cành, chê chỗ đặt thùng nước, và kể lể chuyện mười năm trước có ai đóng đinh vào thân nó. ${k.gag()}`,
          [C("Trả lời cây đàng hoàng", { flags: ["s23_noi_chuyen"], counters: { s23_than: 1 } }, "Cây vui, hàng xóm nhìn bạn lạ"),
           C("Đi khám tai trước đã", { money: -0.02, flags: ["s23_kham_tai"] }, "Yên tâm hơn, cây giận")]),
        card("s23_mo_vu_thu", "Vụ mùa làm theo cây", (c) => `${has(c, "s23_kham_tai") ? "Bác sĩ nói tai bạn hoàn toàn bình thường, và cây già cười suốt chiều." : "Cây già nói chuyện với bạn từ sáng tới tối."} Nó chỉ cách tưới: sáng sớm, nước ấm, ít thôi, và hát cho cây con nghe. Sách nông nghiệp thì nói khác hẳn.`,
          [C("Làm theo cây", { counters: { s23_mua: 1 }, flags: ["s23_theo_cay"] }, "Có thể được mùa, có thể thành trò cười"),
           C("Làm theo sách", { know: 2, flags: ["s23_theo_sach"] }, "Chắc ăn, bỏ phí một cơ hội lạ")]),
      ],
      /* khoi_dong */
      [
        card("s23_kd_giao_su", "Ông giáo sư dưới gốc cây", (c, k) => `${has(c, "s23_theo_cay") ? "Vụ ấy, luống làm theo lời cây cho trái gấp đôi." : "Vụ ấy, luống làm theo sách được mùa vừa phải, còn cây già hờn cả tháng."} Tin đồn tới tai ${k.npc("giao_su")}. Ông mang theo máy ghi âm, ngồi dưới gốc cây ba ngày, rồi nói khẽ: "Tôi chờ cuộc nói chuyện này bốn mươi năm."`,
          [C("Cho ông ghi âm", { flags: ["s23_ghi_am"], know: 3 }, "Có người tin, cũng có người công bố"),
           C("Mời ông về", { flags: ["s23_giu_kin"], happy: 1 }, "Giữ vườn yên, mất một đồng minh")]),
        card("s23_kd_ca_vuon", "Cả vườn đòi quyền", (c, k) => `Một sáng, cả vườn cùng lên tiếng. Luống rau đòi bỏ thuốc trừ sâu, hàng rào đòi được tỉa cho đẹp, còn cây con thì chỉ khóc. ${k.gag()}`,
          [C("Bỏ thuốc trừ sâu", { money: -0.2, flags: ["s23_bo_thuoc"], counters: { s23_than: 1 } }, "Vườn vui, sâu cũng vui"),
           C("Mua nút tai", { flags: ["s23_nut_tai"], happy: -2 }, "Yên tai, cây thôi chỉ đường")]),
      ],
      /* cu_lat */
      [
        card("s23_cl_re", "Rễ cây nhớ người cũ", (c, k) => `Cây già nói rễ của nó nghe được mọi chuyện người ta kể dưới gốc, kể cả chuyện về ${k.scar("do") || "món đồ cũ của bạn"}. Nó còn nhớ ${k.scar("nguoi") || "một người cũ"} từng ngồi đây, nói những điều bạn chưa bao giờ được nghe. "Muốn nghe không? Ta nhớ từng chữ."`,
          [C("Nghe hết", { flags: ["s23_nghe_chuyen_cu"], happy: -2, know: 2 }, "Biết sự thật, có thể đau"),
           C("Xin cây giữ bí mật", { flags: ["s23_bi_mat"], counters: { s23_than: 1 } }, "Cây quý bạn hơn, bạn mãi không biết"),
           C("Hỏi cây chuyện khác", { flags: ["s23_lang_sang"], happy: 1 }, "Đỡ đau hôm nay, cây thấy bị coi thường")]),
      ],
      /* day */
      [
        card("s23_day_benh", "Cả vườn kêu đau", (c) => `Một thứ bệnh lạ lan qua vườn, và lần này bạn nghe được từng cây kêu đau. Cả tuần bạn không ngủ. ${has(c, "s23_bo_thuoc") ? "Không có thuốc trừ sâu, bệnh lan nhanh hơn." : "Thuốc trừ sâu không ăn thua với bệnh này."}`,
          [C("Vay tiền cứu vườn", { custom: "borrow:0.5", flags: ["s23_vay"] }, "Cứu được cây, gánh thêm nợ"),
           C("Chặt bỏ cây bệnh", { flags: ["s23_chat"], happy: -6, money: -0.1 }, "Vườn sống, bạn nghe tiếng cây ngã")]),
        card("s23_day_video", "Đoạn phim nói chuyện với cây", (c, k) => `Ai đó quay cảnh bạn ngồi dưới gốc cây tranh luận về chuyện gà gáy, đăng lên mạng. Hai triệu lượt xem, phần lớn là cười. ${k.gag()}`,
          [C("Lên tiếng giải thích", { flags: ["s23_len_tieng"], counters: { s23_danh: 1 } }, "Nổi tiếng, kèm chế giễu"),
           C("Tắt điện thoại", { flags: ["s23_tat_may"], happy: 2 }, "Yên ổn, cơ hội trôi qua")]),
      ],
      /* chung_ket */
      [
        card("s23_ket", "Trước giấc ngủ trăm năm", (c, k) => `${has(c, "s23_ghi_am") ? `Đoạn ghi âm của ${k.npc("giao_su")} đã được cả viện nghe.` : "Ngoài bạn, chưa ai nghe trọn một câu của cây."} ${cnt(c, "s23_danh") > 0 ? "Đoạn phim năm nào vẫn khiến khách lạ ghé vườn chụp ảnh." : "Đoạn phim năm nào đã chìm, vườn lại yên."} ${k.gag()} Cây già ${cnt(c, "s23_than") >= 2 ? "thả xuống tay bạn một hạt giống, quà cho người tử tế nhất với nó, rồi nói" : "nói"} nó sắp ngủ một giấc dài trăm năm, và trước khi ngủ muốn nhắc bạn ${k.scar("no") || "món nợ cũ"} vẫn chưa trả. "Ta không cho vay," nó nói. "Nhưng ta có thể cho cháu một con đường."`,
          (c) => {
            const nghe = can(c, "agritech") ? ending(L23_AGRI, "Dựng trang trại nghe được tiếng cây", "Thành nghề, gắn đời với đất") : null;
            const danh = can(c, "influencer") ? ending(L23_NOI, "Phát trực tiếp chuyện trò với cây", "Nổi tiếng nhanh, ồn ào mãi")
              : can(c, "writer") ? ending(L23_SACH, "Viết lại mọi điều cây kể", "Chậm mà bền, cây thích được viết") : null;
            const ban = ending(L23_BAN, "Bán giống cây cho viện nghiên cứu", "Có tiền ngay, vườn trở lại im lặng");
            const giu = ending(L23_GIU, "Mở vườn cho khách vào nghe cây", "Tiền vé đủ sống, vườn không còn của riêng");
            const out = [nghe, danh, ban].filter((x) => x !== null);
            return out.length >= 3 ? out : [...out, giu].slice(0, 3);
          }),
      ],
    ],
  }));

/* ================================================================== S24 Bị nhầm là đặc vụ từ tương lai */

const L24_DANH = land("s24_danh_lon", "Bạn lên truyền hình với danh xưng người từng bị nhầm là khách từ tương lai, và khán giả không chịu chuyển kênh.", { custom: "become:tv_host", happy: 5 });
// gần nhất: "danh lớn" cho người quá tuổi làm MC
const L24_SACH = land("s24_hoi_ky", "Cuốn hồi ký về những năm làm đặc vụ bất đắc dĩ bán chạy hơn mọi cuốn sách bàn về tương lai.", { custom: "become:writer", happy: 4 });
const L24_PHIM = land("s24_ban_phim", "Bạn bán câu chuyện của mình cho một hãng phim, đủ tiền sống sung túc tới cuối đời.", { money: 2, happy: 3 });
const L24_TRUC_XUAT = land("s24_truc_xuat", "Bạn bị trục xuất về nước cũ với một con dấu đỏ trong hộ chiếu: không được quay lại.", { custom: "return_home", money: -1, happy: -6 });
const L24_PHAT = land("s24_nop_phat", "Bạn nộp phạt vì tội gây hoang mang, ký cam kết im lặng, và trở về đời thường với túi rỗng.", { money: -1.5, happy: -4 });

const S24 = weird("S24", "sf", ["ky", "luat"],
  (c) => c.age >= 18 && c.age <= 70 && c.pressure.ky >= 4 && (c.migrated || has(c, "seen_world") || has(c, "left_home") || has(c, "path_migrant")),
  () => "Để người ta tin bạn từ tương lai tới",
  () => ({
    title: "Năm sản xuất 2091",
    text: "Máy soi hành lý ở sân bay kêu ba hồi liền khi túi của bạn đi qua, và màn hình hiện một dòng không ai hiểu: năm sản xuất 2091. Hai người mặc vest xám mời bạn vào phòng kín, rót trà nóng, đóng cửa, rồi hỏi rất nhỏ: \"Bạn đến từ năm nào?\" Trên bàn, ai đó đã chuẩn bị sẵn một tập giấy trắng và ba cây bút.",
  }),
  season({
    id: "w_S24", vn: "Đặc vụ bất đắc dĩ", color: "#5a4fc8", years: [6, 10], weird: "sf",
    rules: { income: 0.8, flags: ["w_future_agent"] },
    reset: { cast: [{ key: "vest_xam", role: "official", label: "người đàn ông mặc vest xám" }] },
    gag: { key: "hoi_tuong_lai", lines: [
      "Người bán nước đầu ngõ hỏi bạn năm sau giá xăng thế nào. Bạn bảo không biết, ông gật gù: \"Bí mật quốc gia, hiểu rồi.\"",
      "Một bà cụ chặn bạn ở chợ, hỏi cháu bà có lấy được vợ không. Bạn nói chắc có. Cả chợ vỗ tay.",
      "Ba đứa trẻ trong xóm hỏi năm 2091 còn phải đi học không. Bạn nói có. Chúng khóc, và bố mẹ chúng giận bạn.",
      "Ngay cả người mặc vest xám, sau ngần ấy năm, cũng hỏi nhỏ bạn một câu: tương lai còn ai mặc vest không.",
    ] },
    landings: [L24_DANH, L24_SACH, L24_PHIM, L24_TRUC_XUAT, L24_PHAT],
    beats: [
      /* mo_man */
      [
        card("s24_mo_tham_van", "Phòng kín có trà", (c, k) => `${cap(k.npc("vest_xam"))} hỏi bạn ba tiếng liền, lịch sự tới mức đáng sợ. Mỗi câu "tôi không biết" của bạn, ông ghi lại cẩn thận, gạch chân hai lần. Bạn đùa rằng năm sau trời sẽ mưa, và ông đứng dậy bắt tay bạn. ${k.gag()}`,
          [C("Khẳng định mình là người thường", { flags: ["s24_choi"], counters: { s24_that: 1 } }, "Thật thà, nhưng không ai tin"),
           C("Đùa thêm vài câu về tương lai", { flags: ["s24_dua"], counters: { s24_doan: 1 } }, "Họ ghi chép từng chữ")]),
        card("s24_mo_the", "Tấm thẻ không ai cấp", (c) => `Một tuần sau, bạn nhận được tấm thẻ nhựa ghi "Cộng tác viên đặc biệt", không có tên cơ quan, kèm khoản trợ cấp hằng tháng. ${has(c, "s24_dua") ? "Mặt sau thẻ in lại đúng câu đùa của bạn về cơn mưa." : "Mặt sau thẻ để trống, như chờ bạn tự viết."}`,
          [C("Nhận thẻ và tiền", { money: 0.3, flags: ["s24_nhan_the"] }, "Có tiền, mất tự do đi lại"),
           C("Trả lại thẻ", { flags: ["s24_tra_the"], happy: 1 }, "Sạch sẽ, người ta càng tò mò")]),
      ],
      /* khoi_dong */
      [
        card("s24_kd_hang", "Hàng người trước cửa", (c, k) => `Tin đồn chạy nhanh hơn bạn. Sáng nào trước cửa nhà cũng có một hàng người cầm sổ và bút, có người mang theo cả ghế nhựa. ${k.gag()}`,
          [C("Đoán bừa cho vui", { counters: { s24_doan: 2 }, flags: ["s24_doan_bua"] }, "Vui, và rất nguy hiểm"),
           C("Treo biển từ chối mọi câu hỏi", { flags: ["s24_treo_bien"], happy: -2 }, "Yên tĩnh, bị cho là đang giấu")]),
        card("s24_kd_trung", "Một lời đoán trúng", (c, k) => `${cnt(c, "s24_doan") >= 2 ? "Trong cả trăm câu đoán bừa của bạn" : "Trong vài câu bạn lỡ miệng"}, có một câu trúng: cây cầu cũ sập đúng ngày bạn nói, may không ai bị thương. Giờ thì cả thành phố tin. ${cap(k.npc("vest_xam"))} gọi điện, giọng run: "Lần sau nhớ báo trước cho chúng tôi."`,
          [C("Mở phòng tư vấn tương lai", { money: 0.5, flags: ["s24_thu_tien"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.3, fuse_years: [2, 5], note: "thu tiền tư vấn tương lai mà chỉ đoán bừa" } }, "Tiền vào, rủi ro lớn dần"),
           C("Công khai rằng chỉ là đoán bừa", { flags: ["s24_noi_that"], counters: { s24_that: 1 }, happy: -2 }, "Mất uy tín, giữ lương tâm")]),
      ],
      /* cu_lat */
      [
        card("s24_cl_ho_so", "Hồ sơ về quá khứ của bạn", (c, k) => `Người ta lục lại quá khứ của bạn để tìm dấu vết tương lai. Họ lập hẳn một tập hồ sơ dày về ${k.scar("do") || "thứ bạn mang theo từ đời cũ"}, nghi đó là mật mã của tương lai. Họ cũng tìm tới ${k.scar("nguoi") || "một người quen cũ"}, hỏi hồi nhỏ bạn có hay nhìn lên trời không.`,
          [C("Giao nộp mọi giấy tờ cho họ soi", { flags: ["s24_nop_do"], happy: -3 }, "Họ yên tâm phần nào, bạn mất quyền riêng tư"),
           C("Nhờ người cũ ra làm chứng", { flags: ["s24_nhan_chung"], counters: { s24_that: 1 } }, "Có người bênh, người đó cũng thành nghi phạm"),
           C("Bảo đó đúng là mật mã thời gian", { flags: ["s24_nhan_vo"], counters: { s24_doan: 1 } }, "Danh to thêm, nợ to thêm")]),
      ],
      /* day */
      [
        card("s24_day_sai", "Lời đoán sai", (c, k) => `${has(c, "s24_thu_tien") ? "Một khách hàng trả tiền tư vấn" : "Một người hàng xóm"} làm theo lời bạn đoán và mất trắng. Ngoài cổng, đám đông cầm biển đòi bạn "trả lại tương lai". ${k.gag()}`,
          [C("Ra nói chuyện với đám đông", { health: -3, flags: ["s24_doi_mat"], counters: { s24_that: 1 } }, "Mất mặt, bớt thù"),
           C("Trốn qua cửa sau", { flags: ["s24_tron"], happy: -3 }, "An toàn hôm nay, thêm tin đồn")]),
        card("s24_day_quyet_dinh", "Tờ giấy cần chữ ký", (c, k) => `${cap(k.npc("vest_xam"))} mang tới một tờ giấy: ký nhận mình là kẻ bịa chuyện thì mọi việc chấm dứt, còn không ký thì hồ sơ của bạn lên bàn cấp cao hơn. Ông thì thầm: "Riêng tôi thì vẫn tin bạn."`,
          [C("Ký cho xong", { flags: ["s24_ky"], happy: -4, counters: { s24_that: 1 } }, "Hết bị theo dõi, hết cả danh"),
           C("Không ký", { flags: ["s24_khong_ky"], counters: { s24_doan: 1 } }, "Giữ huyền thoại, chờ phán quyết")]),
      ],
      /* chung_ket */
      [
        card("s24_ket", "Buổi họp báo cuối cùng", (c, k) => `${cnt(c, "s24_doan") > cnt(c, "s24_that") ? "Bạn đã để người ta tin quá lâu" : "Bạn đã nói thật quá nhiều lần"}, và giờ cả trăm máy quay chĩa vào bạn. Ai đó dưới khán phòng hét lên về ${k.scar("no") || "món nợ cũ của bạn"}: nếu biết trước tương lai, sao không trả cho xong? ${k.gag()}`,
          (c) => [
            can(c, "tv_host") ? ending(L24_DANH, "Nhận lời dẫn chương trình truyền hình", "Danh lớn, đời lên sóng")
              : can(c, "writer") ? ending(L24_SACH, "Viết hồi ký đặc vụ bất đắc dĩ", "Danh lớn mà yên, chữ thay lời đoán")
              : ending(L24_PHIM, "Bán câu chuyện cho hãng phim", "Giàu, nhân vật trên phim không giống bạn"),
            c.migrated ? ending(L24_TRUC_XUAT, "Nhận hết, chịu trục xuất", "Về nước cũ, không được quay lại")
              : ending(L24_PHAT, "Nhận hết, nộp phạt", "Mất tiền, được yên"),
          ]),
      ],
    ],
  }));

/* ================================================================== S25 Hộp đen của con tàu không có trên bản đồ */

const L25_GIAU = land("s25_giau", "Bạn bán hộp đen và tọa độ cho một nhà sưu tầm giấu mặt, và lần đầu trong đời không phải lo tiền dầu.", { money: 3, happy: 3 });
const L25_BO_BIEN = land("s25_bo_bien", "Bạn bán thuyền, lên bờ, chuyển tới một thành phố không nhìn thấy biển, và không ra khơi nữa.", { custom: "job_lose|move_city", happy: -5 });
const L25_THAM_HIEM = land("s25_tham_hiem", "Bạn theo tọa độ trong hộp đen đi tìm những con tàu khác không có trên bản đồ, và người ta gọi bạn là nhà thám hiểm.", { custom: "become:explorer", health: -3 });

const S25 = weird("S25", "sf", ["ky", "tien"],
  (c) => c.age >= 18 && c.age <= 65 && has(c, "life_deep_fisher"),
  () => "Giữ lại chiếc hộp đen vớt được",
  () => ({
    title: "Chiếc hộp màu cam",
    text: "Lưới kéo lên nặng bất thường. Giữa đám cá giãy là một chiếc hộp màu cam, vỏ khắc tên một con tàu không có trên bất kỳ tấm hải đồ nào. Đêm đó, nó tự kêu bíp ba lần rồi phát ra giọng một thuyền trưởng: \"Ai nghe được thì đừng đưa cái này cho người đội mũ vàng.\"",
  }),
  season({
    id: "w_S25", vn: "Thợ lặn bí ẩn", color: "#2f6fb8", years: [6, 10], weird: "sf",
    rules: { income: 0.8, flags: ["w_black_box"] },
    reset: { cast: [{ key: "mu_vang", role: "rival", label: "người đội mũ vàng" }] },
    gag: { key: "can_cau", lines: [
      "Người đội mũ vàng lại ngồi câu ở đầu bến, cần câu không có lưỡi.",
      "Người đội mũ vàng vẫn ngồi câu. Hôm nay bạn thấy ông ta mua cá của chính bạn, rồi thả lại xuống biển.",
      "Bạn tặng người đội mũ vàng một cái lưỡi câu. Hôm sau ông ta ngồi đó với hai cần câu, vẫn không có lưỡi.",
      "Người đội mũ vàng cuối cùng câu được một con cá. Ông ta nhìn nó rất lâu, như nhìn một bản báo cáo sai.",
    ] },
    landings: [L25_GIAU, L25_BO_BIEN, L25_THAM_HIEM],
    beats: [
      /* mo_man */
      [
        card("s25_mo_hop", "Hộp đen dưới gầm giường", (c, k) => `Bạn mang chiếc hộp về, bọc ba lớp áo mưa. Cứ ba giờ sáng nó lại kêu, và giọng thuyền trưởng đọc một dãy tọa độ, lần nào cũng dài thêm một số. ${k.gag()}`,
          [C("Giấu hộp dưới gầm giường", { flags: ["s25_giau_hop"], happy: -1 }, "Giữ được bí mật, mất ngủ"),
           C("Nộp hộp cho cảng vụ", { flags: ["s25_nop_hop"] }, "Hôm sau họ trả lại, nói là đồ chơi")]),
        card("s25_mo_lan", "Bóng dài dưới đáy", (c) => `Dãy tọa độ dẫn tới một vùng nước bạn đã đi qua cả trăm lần. ${has(c, "s25_nop_hop") ? "Cảng vụ đã trả lại chiếc hộp, bảo đó là đồ chơi trẻ con, nhưng mắt người trả thì không cười." : "Chiếc hộp dưới gầm giường vẫn kêu đều mỗi đêm."} Dưới đáy, ở độ sâu đáng lẽ chỉ có bùn, có một cái bóng dài như thân tàu.`,
          [C("Lặn xuống xem", { health: -4, counters: { s25_lan: 1 }, flags: ["s25_da_lan"] }, "Thấy tận mắt, phổi đau cả tuần"),
           C("Đánh dấu tọa độ rồi về", { flags: ["s25_danh_dau"], know: 2 }, "An toàn, người khác có thể tới trước")]),
      ],
      /* khoi_dong */
      [
        card("s25_kd_thuyen", "Chiếc thuyền tắt đèn", (c, k) => `Ba đêm liền, một chiếc thuyền tắt đèn bám theo thuyền bạn ở đúng khoảng cách tầm mắt. Sáng ra, lưới của bạn bị ai đó gỡ gọn gàng, cá vẫn còn nguyên. ${k.gag()}`,
          [C("Quay mũi đuổi theo", { flags: ["s25_duoi"], health: -2, counters: { s25_gan: 1 } }, "Biết mặt kẻ theo dõi, họ cũng biết bạn"),
           C("Đổi ngư trường", { money: -0.2, flags: ["s25_doi_bai"] }, "Tránh được mắt, mất mùa cá")]),
        card("s25_kd_gia", "Giá của một chiếc hộp", (c, k) => `Một người đàn ông nói giọng thành phố tìm tới, đặt lên bàn số tiền bằng ba năm đi biển của bạn. Ông ta chỉ muốn mua chiếc hộp, không hỏi gì thêm. Lúc ra về, ông ta chào ${k.npc("mu_vang")} ở đầu bến như chào người quen.`,
          [C("Bán bản sao tọa độ, giữ hộp", { money: 0.4, flags: ["s25_ban_ban_sao"], counters: { s25_gan: 1 } }, "Có tiền, kẻ theo dõi có thêm manh mối"),
           C("Từ chối thẳng", { flags: ["s25_tu_choi_mua"] }, "Giữ trọn bí mật, thêm kẻ thù")]),
      ],
      /* cu_lat */
      [
        card("s25_cl_day", "Cuốn sổ trong khoang lái", (c, k) => `${cnt(c, "s25_lan") > 0 ? "Lần lặn thứ hai" : "Lần lặn đầu tiên"}, đèn pin của bạn quét qua boong con tàu lạ. ${has(c, "s25_ban_ban_sao") ? "Ai đó đã tới trước: một sợi dây neo mới tinh còn buộc ở mạn tàu." : "Lớp bùn trên boong còn nguyên, chưa ai chạm vào."} Trong khoang lái có một cuốn sổ ghi tên bạn, kèm vài dòng về ${k.scar("do") || "món đồ cũ của bạn"}, và một tấm ảnh chụp ${k.scar("nguoi") || "một người bạn từng quen"} đứng trên chính con tàu này.`,
          [C("Mang cuốn sổ lên", { flags: ["s25_lay_so"], health: -3 }, "Có bằng chứng, có kẻ muốn cướp"),
           C("Chụp ảnh rồi để lại", { flags: ["s25_chup"], know: 2 }, "Nhẹ người, bằng chứng mỏng"),
           C("Kể cho người trong ảnh", { flags: ["s25_ke"], rel: 3 }, "Thêm đồng minh, thêm người gặp nguy")]),
      ],
      /* day */
      [
        card("s25_day_bao", "Bão và hai chiếc thuyền", (c, k) => `Cơn bão tới sớm hai ngày. ${cnt(c, "s25_gan") >= 2 ? "Kẻ theo dõi đã quá quen mặt bạn, bám sát tới mức suýt va mạn." : "Chiếc thuyền tắt đèn vẫn giữ đúng khoảng cách tầm mắt."} Giữa sóng, bạn thấy chiếc thuyền tắt đèn lật nghiêng, và ${k.npc("mu_vang")} bám vào mạn, mũ vàng vẫn trên đầu.`,
          [C("Quay lại cứu", { health: -6, flags: ["s25_cuu"], counters: { s25_gan: -1 } }, "Có thể chết cùng, có thể có người nợ ơn"),
           C("Chạy vào bờ", { flags: ["s25_bo_mac"], happy: -5 }, "Sống sót, mang theo một hình ảnh")]),
        card("s25_day_luoi", "Lưới bị cắt trong đêm", (c, k) => `${has(c, "s25_cuu") ? `${cap(k.npc("mu_vang"))} không cảm ơn, chỉ nói khẽ: 'Họ sẽ không để bạn yên đâu.'` : `Sau cơn bão, ${k.npc("mu_vang")} vẫn ngồi ở đầu bến như chưa có gì, tóc còn ướt.`} Một tuần sau, toàn bộ lưới của bạn bị cắt đứt trong đêm. ${k.gag()}`,
          [C("Vay tiền mua lưới mới", { custom: "borrow:0.4", flags: ["s25_vay_luoi"] }, "Ra khơi tiếp, nợ thêm"),
           C("Nghỉ biển một mùa", { money: -0.3, flags: ["s25_nghi"] }, "Nghỉ ngơi, mối buôn bỏ đi")]),
      ],
      /* chung_ket */
      [
        card("s25_ket", "Con tàu nổi lên", (c, k) => `Đêm trăng tròn, con tàu không có trên bản đồ tự nổi lên giữa vịnh, đèn khoang lái sáng như có người. Chiếc hộp đen im bặt. ${has(c, "s25_cuu") ? "Người đội mũ vàng, kẻ bạn từng kéo lên khỏi sóng, đứng trên bờ và lần đầu bỏ mũ xuống chào bạn." : "Người đội mũ vàng vẫn ngồi trên bờ, mắt không rời mặt nước."} Bạn nghĩ tới ${k.scar("no") || "món nợ tiền dầu"} chưa trả, và tới việc ngoài kia có người sẵn sàng trả gấp mười lần. ${k.gag()}`,
          (c) => [
            ending(L25_GIAU, "Bán hết bí mật cho người trả giá cao nhất", "Giàu, và không bao giờ biết con tàu là gì"),
            ending(L25_BO_BIEN, "Bán thuyền, lên bờ sống", "Thoát khỏi bị theo dõi, mất cả biển"),
            ...(can(c, "explorer") ? [ending(L25_THAM_HIEM, "Lái thuyền ra con tàu", "Thành nhà thám hiểm, đời hết yên")] : []),
          ]),
      ],
    ],
  }));

/* ================================================================== S26 Thuốc trường thọ thử nghiệm */

const L26_SONG = land("s26_song_lau", "Bạn uống hết liều cuối. Thân thể bạn sẽ đi thêm ba mươi năm, qua đám tang của gần như tất cả những người bạn từng quen.", { custom: "longevity:30", money: -2, rel: -20, happy: -5 });
const L26_DUNG = land("s26_dung_thuoc", "Bạn trả lại hộp thuốc, nhận tiền bồi thường thử nghiệm, và già đi cùng những người mình thương.", { money: 1.5, happy: 6, rel: 6 });

const S26 = weird("S26", "sf", ["ky", "than"],
  (c) => c.age >= 60 && c.age <= 72 && (c.rich || c.savings >= 2 * c.income || c.assets_value >= 5 * c.income),
  () => "Ký giấy tham gia thử nghiệm trường thọ",
  () => ({
    title: "Viên thuốc màu xanh nhạt",
    text: "Lá thư không đóng dấu mời bạn tham gia một thử nghiệm: mỗi sáng một viên thuốc màu xanh nhạt, đổi lại là thêm vài chục năm sống. Phòng khám nằm trên tầng ba một tòa nhà không biển hiệu. Cô bác sĩ trẻ đọc hồ sơ của bạn, rồi nói bình thản như đọc dự báo thời tiết: \"Tác dụng phụ duy nhất là bác sẽ phải dự đám tang của gần như tất cả mọi người.\"",
  }),
  season({
    id: "w_S26", vn: "Người không chịu già", color: "#8a5cd6", years: [6, 12], weird: "sf",
    rules: { flags: ["w_longevity_trial"] },
    reset: { cast: [{ key: "bac_si_tre", role: "mentor", label: "cô bác sĩ trẻ phụ trách thử nghiệm" }] },
    gag: { key: "chau_cay", lines: [
      "Ở phòng chờ phòng khám, chậu cây lại héo. Cô y tá thay chậu mới, liếc bạn đầy nghi ngờ.",
      "Lần tái khám sau, chậu cây thứ hai cũng héo. Phòng khám đổi sang cây nhựa, và cây nhựa bắt đầu bạc màu.",
      "Lần tái khám này, phòng chờ không còn chậu cây nào. Cô y tá treo một bức tranh vẽ cây, thỉnh thoảng lại liếc xem nó có héo không.",
      "Ở lần tái khám cuối, người ta mang tới một cây xương rồng. Nó sống. Cả phòng khám vỗ tay, còn bạn thấy hơi bị xúc phạm.",
    ] },
    landings: [L26_SONG, L26_DUNG],
    beats: [
      /* mo_man */
      [
        card("s26_mo_vien", "Viên thuốc đầu tiên", (c, k) => `${cap(k.npc("bac_si_tre"))} đặt viên thuốc vào lòng bàn tay bạn, nhỏ như hạt đậu, mát như đá. Giá một năm thuốc bằng mấy năm tiền chợ. ${k.gag()}`,
          [C("Uống ngay tại chỗ", { money: -0.3, counters: { s26_lieu: 1 }, flags: ["s26_uong"] }, "Bắt đầu trẻ lại, ví bắt đầu mỏng"),
           C("Mang về suy nghĩ thêm", { flags: ["s26_cho"], happy: -1 }, "Chậm một năm, bớt một năm")]),
        card("s26_mo_toc", "Sợi tóc đen", (c) => `${has(c, "s26_uong") ? "Ba tháng sau" : "Một năm sau, khi bạn cuối cùng cũng uống"}, một sợi tóc đen mọc lại giữa mái đầu bạc. Rồi mười sợi. Rồi đầu gối thôi kêu mỗi lần lên cầu thang. ${c.kids_alive > 0 ? "Con cháu nhìn bạn như nhìn một bí mật." : "Hàng xóm bắt đầu hỏi bạn ăn gì."}`,
          [C("Khoe với mọi người", { flags: ["s26_khoe"], happy: 4, counters: { s26_lo: 1 } }, "Vui, và ai cũng muốn xin"),
           C("Nhuộm bạc lại cho đỡ phiền", { flags: ["s26_nhuom"], money: -0.02 }, "Giữ yên, sống hai mặt")]),
      ],
      /* khoi_dong */
      [
        card("s26_kd_ban_co", "Người bạn chơi cờ", () => "Người bạn chơi cờ mỗi chiều của bạn bị chẩn đoán bệnh nặng. Ông nắm tay bạn, không nói thẳng, chỉ hỏi: \"Cái thuốc của ông, còn dư không?\" Danh sách thử nghiệm đã đóng từ lâu.",
          [C("Chia nửa liều cho bạn", { flags: ["s26_chia"], counters: { s26_lieu: -1 }, rel: 5 }, "Cứu bạn thêm ít năm, chính mình hụt thuốc"),
           C("Nói là không còn", { flags: ["s26_tu_choi"], happy: -4 }, "Giữ trọn liều, mất một người bạn")]),
        card("s26_kd_chay", "Mười cây số", (c, k) => `Bạn chạy hết mười cây số ở giải chạy của khu phố, về nhì sau một cậu sinh viên. ${has(c, "s26_khoe") ? "Cả xóm biết vì sao bạn chạy nổi, và bắt đầu xếp hàng xin địa chỉ phòng khám." : "Không ai hiểu vì sao bạn chạy nổi, và người ta bắt đầu nghi bạn khai gian tuổi."} ${k.gag()}`,
          [C("Đưa địa chỉ phòng khám", { flags: ["s26_chi_duong"], rel: 3, counters: { s26_lo: 1 } }, "Thêm người trẻ mãi, thêm người phải chờ"),
           C("Lảng đi", { flags: ["s26_lang"], happy: -1 }, "Giữ yên, bị đồn đoán")]),
      ],
      /* cu_lat */
      [
        card("s26_cl_khong_kip", "Người không kịp", (c, k) => `${cap(k.scar("nguoi") || "Một người cũ")} nhắn muốn gặp bạn lần cuối. Hai người ngồi bên nhau, một mái đầu bạc trắng, một mái đầu đã đen quá nửa, và người kia cứ nhìn tóc bạn mà cười. Người ấy nhắc lại chuyện ${k.scar("do") || "món đồ cũ"} năm nào, rồi dặn: "Người sống lâu thì nhớ giùm cho lâu."`,
          [C("Ở bên người ấy tới cuối", { flags: ["s26_o_ben"], rel: 4, happy: -3 }, "Đau, nhưng không hối tiếc"),
           C("Kể thật về viên thuốc", { flags: ["s26_ke_that"], counters: { s26_lo: 1 } }, "Nhẹ lòng, người ấy có thể giận"),
           C("Rời đi trước khi phải chứng kiến", { flags: ["s26_tranh"], happy: -5 }, "Đỡ đau hôm nay, nặng lòng lâu")]),
      ],
      /* day */
      [
        card("s26_day_tang", "Đám tang thứ mười", (c, k) => `Đây là đám tang thứ mười bạn dự trong vài năm. ${has(c, "s26_chia") ? "Người bạn chơi cờ từng được bạn chia nửa liều ngồi hàng ghế đầu, khỏe hơn cả người đã khuất." : "Lần này là đám tang của người bạn chơi cờ, người từng hỏi xin bạn chút thuốc."} Người bán hoa trước nhà tang lễ đã nhớ mặt bạn, thấy bạn từ xa là gói sẵn bó cúc trắng. ${k.gag()}`,
          [C("Mua sẵn chỗ nằm cạnh bạn bè", { money: -0.2, flags: ["s26_mua_cho"] }, "Yên lòng một chút, dù còn lâu mới dùng"),
           C("Thôi không đi đám tang nữa", { flags: ["s26_khong_di"], rel: -5, happy: 2 }, "Đỡ buồn, người sống trách bạn")]),
        card("s26_day_giay", "Tờ giấy gấp trong hộp thuốc", (c, k) => `Đáy hộp thuốc có một tờ giấy gấp tư, chữ nhỏ li ti: thuốc giữ được thân thể, không giữ được ký ức. Sống thêm năm nào, bạn quên dần một năm của tuổi thơ. ${cap(k.npc("bac_si_tre"))} xác nhận, mắt không nhìn bạn: "Chúng tôi cũng mới biết."`,
          [C("Ghi ký ức vào sổ", { flags: ["s26_ghi_so"], know: 2, counters: { s26_lieu: 1 } }, "Giữ được chữ, chưa chắc giữ được cảm giác"),
           C("Đòi phòng khám bồi thường", { money: 0.3, flags: ["s26_kien"] }, "Có tiền, mất lòng người đang giữ thuốc")]),
      ],
      /* chung_ket */
      [
        card("s26_ket", "Liều cuối cùng", (c, k) => `${cnt(c, "s26_lieu") >= 2 ? "Bạn đã uống đủ để không ai đoán ra tuổi mình." : "Bạn vẫn lưỡng lự từ viên đầu tiên tới giờ."} ${k.gag()} ${cap(k.npc("bac_si_tre"))} đặt hộp thuốc cuối cùng lên bàn: uống hết thì thêm ba mươi năm, trả lại thì được bồi thường. Bạn nghĩ tới ${k.scar("no") || "món nợ cũ"} chưa trả, và tới việc ba mươi năm là đủ để trả, hay đủ để quên.`,
          [ending(L26_SONG, "Uống hết liều cuối", "Sống thêm ba mươi năm, tiễn gần như mọi người"),
           ending(L26_DUNG, "Trả lại hộp thuốc", "Có tiền bồi thường, già đi cùng mọi người")]),
      ],
    ],
  }));

/* ================================================================== S27 Ứng dụng báo ngày chết */

const L27_Y = land("s27_bac_si", "Bạn đi học lại, rồi làm bác sĩ ở những nơi ít ai muốn tới, nơi biết trước một ngày là cứu được một người.", { custom: "become:aid_doctor", know: 5 });
// gần nhất: "nghề y" cho người quá tuổi học làm bác sĩ
const L27_CHAM = land("s27_cham_benh", "Bạn làm người chăm bệnh, ngồi bên giường những người biết rõ ngày mình đi, và không để ai đi một mình.", { custom: "become:caregiver", happy: 3 });
const L27_GHET = land("s27_bi_ghet", "Cả khu phố gọi bạn là thần chết. Bạn chuyển tới một thành phố không ai biết mặt.", { custom: "move_city", rel: -15, happy: -5 });
const L27_XOA = land("s27_xoa_app", "Bạn đền tiền cho những người từng tin ứng dụng, xóa nó khỏi đời mình, và sống tiếp không biết trước ngày nào.", { money: -1.5, happy: 4 });

const S27 = weird("S27", "sf", ["ky", "than"],
  (c) => c.age >= 18 && c.age <= 70 && (has(c, "job_tech") || has(c, "temper_curious") || has(c, "temper2_curious") || has(c, "life_ai_engineer") || has(c, "life_hacker")),
  () => "Mở ứng dụng biết ngày mất của người khác",
  () => ({
    title: "Thứ Ba, 16 giờ 40",
    text: "Ứng dụng bạn lỡ cài chỉ có một nút: chĩa camera vào ai thì hiện ngày người đó mất, chính xác tới từng phút. Bạn thử với ông bán bánh mì đầu ngõ, và màn hình hiện: thứ Ba tuần sau, 16 giờ 40. Ông cười, đưa ổ bánh qua quầy: \"Nhìn gì mà nhìn dữ vậy, bánh nóng đó.\"",
  }),
  season({
    id: "w_S27", vn: "Người biết trước", color: "#4b3fa8", years: [6, 10], weird: "sf",
    rules: { flags: ["w_death_app"] },
    reset: { cast: [{ key: "lap_trinh", role: "partner", label: "cậu lập trình viên viết ra ứng dụng" }] },
    gag: { key: "dang_tai", lines: [
      "Bạn thử chĩa camera vào gương. Ô ngày của chính bạn hiện chữ \"Đang tải...\", thanh tiến trình nhích một vạch.",
      "Ô ngày của chính bạn vẫn đang tải. Thanh tiến trình nhích thêm một vạch, rồi lùi lại nửa vạch.",
      "Ứng dụng xin lỗi vì ngày của bạn tải lâu, tặng kèm một mã giảm giá cho dịch vụ hoa tang.",
      "Thanh tiến trình của bạn chạy tới 99 phần trăm, hiện dòng \"Thử lại sau vài chục năm\" rồi tắt.",
    ] },
    landings: [L27_Y, L27_CHAM, L27_GHET, L27_XOA],
    beats: [
      /* mo_man */
      [
        card("s27_mo_banh_mi", "Ông bán bánh mì", (c, k) => `Cả tuần bạn đi ngang tiệm bánh mì, nhìn ông chủ nhào bột, hát sai lời một bài hát cũ. Thứ Ba tuần sau, 16 giờ 40, còn bốn ngày. ${k.gag()}`,
          [C("Kiếm cớ kéo ông đi khám", { flags: ["s27_cuu_1"], counters: { s27_cuu: 1 }, money: -0.05 }, "Có thể cứu, có thể bị coi là điên"),
           C("Im lặng, chờ xem có đúng không", { flags: ["s27_im_1"], counters: { s27_im: 1 } }, "Biết chắc, và phải sống với điều đó")]),
        card("s27_mo_dev", "Người viết ra ứng dụng", (c, k) => `${has(c, "s27_cuu_1") ? "Ông bán bánh mì được mổ cấp cứu chiều thứ Ba, và ngày trên màn hình nhảy sang mười hai năm sau." : "Chiều thứ Ba, 16 giờ 40, tiệm bánh mì đóng cửa, và không mở lại nữa."} Tối đó, ${k.npc("lap_trinh")} nhắn tin: cậu là người viết ra ứng dụng, và cậu cần dữ liệu từ "người dùng số một".`,
          [C("Hợp tác với cậu", { flags: ["s27_hop_tac"], know: 3 }, "Hiểu ứng dụng hơn, ràng buộc hơn"),
           C("Chặn số, gỡ ứng dụng", { flags: ["s27_go"], happy: 1 }, "Sáng hôm sau nó tự cài lại")]),
      ],
      /* khoi_dong */
      [
        card("s27_kd_nha", "Chiếc điện thoại úp trên bàn ăn", (c, k) => `Bữa cơm tối, điện thoại nằm úp trên bàn, cách tay bạn một gang. ${c.married ? "Bạn đời đang kể một chuyện vui trong ngày, cười to hơn thường lệ." : "Mấy người bạn thân ngồi quanh bàn, ai cũng đang kể chuyện ngày hôm nay."} Chỉ cần lật lên là biết. ${k.gag()}`,
          [C("Lật lên, quét cả nhà", { flags: ["s27_quet_nha"], know: 2, happy: -6 }, "Biết hết, ăn không còn ngon"),
           C("Cất hẳn vào ngăn kéo", { flags: ["s27_khong_quet"], happy: 2 }, "Giữ bữa cơm, bớt một lần cảnh giác")]),
        card("s27_kd_danh_sach", "Danh sách hai trăm người", (c, k) => `${cap(k.npc("lap_trinh"))} gửi bạn một bản danh sách: hai trăm người trong thành phố sẽ mất trong năm nay, nhiều người còn trẻ. Cậu hỏi: "Mình cứu được ai thì cứu, hay đó không phải việc của mình?"`,
          [C("Đi gõ cửa từng nhà", { counters: { s27_cuu: 2 }, health: -4, flags: ["s27_go_cua"] }, "Cứu được vài người, bị đuổi nhiều lần"),
           C("Báo cho bệnh viện gần nhất", { flags: ["s27_bao_vien"], counters: { s27_cuu: 1 } }, "Gọn, và chẳng ai tin"),
           C("Giữ im lặng", { counters: { s27_im: 1 }, flags: ["s27_im_lang"] }, "Đỡ phiền, nặng đầu")]),
      ],
      /* cu_lat */
      [
        card("s27_cl_ngay_quen", "Một ngày quá gần", (c, k) => `Một chiều, bạn chĩa camera nhầm vào ${k.scar("nguoi") || "một người cũ trong đời"}. Màn hình hiện một ngày rất gần. Người ấy đang kể chuyện ${k.scar("do") || "những ngày xưa"}, cười như chưa từng biết sợ.`,
          [C("Nói thẳng cho người ấy", { flags: ["s27_noi_thang"], rel: -2, know: 2 }, "Họ có thể đổi, có thể ghét bạn"),
           C("Âm thầm đổi lịch của người ấy", { flags: ["s27_am_tham"], counters: { s27_cuu: 1 }, money: -0.1 }, "Không ai biết, kể cả khi thất bại"),
           C("Tắt máy, ở bên họ", { flags: ["s27_o_ben"], happy: -3, rel: 4 }, "Không cứu, không bỏ")]),
      ],
      /* day */
      [
        card("s27_day_than_chet", "Biệt danh thần chết", (c, k) => `${cnt(c, "s27_cuu") >= 2 ? "Người ta để ý: bạn gõ cửa nhà ai thì nhà đó có chuyện." : "Người ta để ý: bạn hay đứng nhìn người khác rất lâu."} Biệt danh "thần chết" lan khắp ${k.noi}, có người dán giấy đỏ lên cửa nhà bạn. ${k.gag()}`,
          [C("Kể công khai về ứng dụng", { flags: ["s27_cong_khai"], counters: { s27_cuu: 1 } }, "Người ta hiểu, rồi xếp hàng nhờ"),
           C("Im lặng chịu tiếng", { flags: ["s27_chiu"], happy: -4 }, "Giữ bí mật, mất hàng xóm")]),
        card("s27_day_chu_moi", "Ứng dụng có chủ mới", (c, k) => `${has(c, "s27_hop_tac") ? `${cap(k.npc("lap_trinh"))} báo tin: cậu đã bán ứng dụng cho một công ty bảo hiểm, và xin lỗi bạn ba lần.` : `${cap(k.npc("lap_trinh"))} biến mất, ứng dụng có chủ mới là một công ty bảo hiểm.`} Phí bảo hiểm của cả khu phố tăng gấp đôi trong một đêm.`,
          [C("Đứng ra tố cáo", { flags: ["s27_to_cao"], health: -3, rel: 3 }, "Đúng việc, thành mục tiêu"),
           C("Lặng lẽ mua bảo hiểm sớm", { money: -0.3, flags: ["s27_mua_som"] }, "Lo được cho mình, khó nhìn mặt hàng xóm")]),
      ],
      /* chung_ket */
      [
        card("s27_ket", "Ngày của chính bạn", (c, k) => `${cnt(c, "s27_im") > cnt(c, "s27_cuu") ? "Bạn đã im lặng nhiều hơn đã cứu." : "Bạn đã cứu nhiều hơn đã im lặng."} Một sáng, thanh tiến trình trên ô ngày của chính bạn bắt đầu chạy nhanh. ${k.gag()} Bạn đặt điện thoại xuống. Trong đầu chỉ còn ${k.scar("no") || "món nợ cũ"} chưa trả, và những ngày bạn đã biết trước của người khác.`,
          (c) => can(c, "aid_doctor") || can(c, "caregiver")
            ? [can(c, "aid_doctor") ? ending(L27_Y, "Đi học lại để làm bác sĩ", "Biết trước để cứu, đời bận rộn") : ending(L27_CHAM, "Làm người chăm bệnh", "Ở bên người sắp đi, lương ít"),
               ending(L27_GHET, "Đi tới nơi không ai biết mặt", "Thoát tiếng thần chết, xa hết người quen"),
               ending(L27_XOA, "Đền tiền, xóa ứng dụng", "Mất tiền, được sống không biết trước")]
            : [ending(L27_XOA, "Đền tiền, xóa ứng dụng", "Mất tiền, được sống không biết trước"),
               ending(L27_GHET, "Đi tới nơi không ai biết mặt", "Thoát tiếng thần chết, xa hết người quen")]),
      ],
    ],
  }));

/* ================================================================== S28 Kẹt trong một ngày lặp lại */

const L28_BEP = land("s28_dau_bep", "Bạn bước ra khỏi ngày thứ Tư với một món ăn đã nấu ba trăm lần, hoàn hảo tới từng hạt muối, và mở một quán nhỏ.", { custom: "become:restaurateur", happy: 5 });
const L28_DAN = land("s28_nghe_nhan_dan", "Bạn bước ra với bài hát trên radio đã đàn ba trăm lần, không sai một nốt, và người ta mời bạn đi diễn khắp nơi.", { custom: "become:folk_musician", happy: 5 });
const L28_MAY = land("s28_sang_che", "Bạn bước ra với cái radio đã tháo ráp ba trăm lần và một bản vẽ máy chưa ai nghĩ ra.", { custom: "become:inventor", know: 6 });
const L28_LOP = land("s28_mo_lop", "Bạn mở lớp dạy đúng thứ mình đã luyện ba trăm ngày, học trò đông tới mức phải chia ca.", { money: 1.2, happy: 4 });
const L28_LAM_THUE = land("s28_lam_thue", "Ra khỏi vòng lặp, bạn nhận làm thuê đúng việc mình đã luyện. Ai thuê một lần cũng quay lại thuê lần nữa.", { money: 1, happy: 2 });
const L28_NHANH = land("s28_lam_nhanh", "Ra khỏi vòng lặp, bạn làm việc gì cũng như đã làm ba trăm lần. Thu nhập tăng hẳn, và bạn không bao giờ đi trễ nữa.", { income_mult: 1.3 });

/** Kỹ năng đã luyện trong vòng lặp; chưa chọn (không xảy ra trong game) thì theo thiên hướng. */
const skill28 = (c: FactContext): "bep" | "dan" | "may" =>
  has(c, "s28_hoc_dan") ? "dan" : has(c, "s28_hoc_may") ? "may" : has(c, "s28_hoc_bep") ? "bep"
    : has(c, "tinker") || has(c, "tinkerer") ? "may" : has(c, "temper_kind") ? "dan" : "bep";

const S28 = weird("S28", "sf", ["ky"],
  (c) => c.pressure.ky >= 7 && c.age >= 18 && c.age <= 70,
  () => "Sống lại ngày thứ Tư cho tới khi đúng",
  () => ({
    title: "Ngày thứ Tư lần thứ ba",
    text: "Bạn thức dậy lần thứ ba trong cùng một ngày thứ Tư. Cái tách bạn làm vỡ hôm qua lại lành lặn trên bàn, và đúng 7 giờ 02, con bồ câu lại đâm vào cửa kính. Ở đầu đường, cô bán cà phê nheo mắt nhìn bạn như nhìn một bài toán khó: \"Lại là bạn à? Hôm nay là lần thứ mấy rồi?\"",
  }),
  season({
    id: "w_S28", vn: "Ngày thứ 300", color: "#3f7fd9", years: [5, 8], weird: "sf",
    rules: { flags: ["w_time_loop"] },
    reset: { cast: [{ key: "co_ca_phe", role: "neighbor", label: "cô bán cà phê đầu đường" }] },
    gag: { key: "bo_cau", lines: [
      "Đúng 7 giờ 02, con bồ câu lại đâm vào cửa kính. Bạn đã thử đóng, mở, dán giấy báo, nó vẫn đâm.",
      "Đúng 7 giờ 02, bạn đứng sẵn và đỡ được con bồ câu. Nó nhìn bạn đầy oán trách, rồi bay sang đâm vào cửa nhà bên.",
      "Đúng 7 giờ 02, bạn mở toang cửa sổ. Con bồ câu bay thẳng vào nhà, đâm vào cái tủ lạnh.",
      "Đúng 7 giờ 02, con bồ câu không tới. Bạn chờ tới 7 giờ 10, thấy nhớ nó lạ lùng.",
    ] },
    landings: [L28_BEP, L28_DAN, L28_MAY, L28_LOP, L28_NHANH, L28_LAM_THUE],
    beats: [
      /* mo_man */
      [
        card("s28_mo_thu_tu", "Thứ Tư không chịu hết", (c, k) => `Bạn thử mọi cách để thoát: ngủ sớm, thức trắng, ngủ nhờ nhà khác. Sáng nào cũng là thứ Tư, cũng bản tin ấy, cũng bài hát ấy trên radio. ${k.gag()} Nếu ngày mai không bao giờ tới, ít nhất cũng học được một thứ.`,
          [C("Học nấu một món cho hoàn hảo", { flags: ["s28_hoc_bep"], counters: { s28_luyen: 1 } }, "Ba trăm lần nêm nếm"),
           C("Học đàn bài hát trên radio", { flags: ["s28_hoc_dan"], counters: { s28_luyen: 1 } }, "Ba trăm lần cùng một bài"),
           C("Tháo tung cái radio ra xem", { flags: ["s28_hoc_may"], counters: { s28_luyen: 1 }, know: 2 }, "Ba trăm lần tháo ra lắp vào")]),
        card("s28_mo_bon_muoi", "Ngày thứ bốn mươi", (c, k) => `Tới ngày thứ bốn mươi, bạn hiểu ra một điều: hôm nay làm gì, mai cũng xóa sạch. ${cap(k.npc("co_ca_phe"))} đưa ly cà phê như mọi lần, nói cùng một câu như mọi lần: "Trời này mà uống nóng là gan đấy."`,
          [C("Nói thật mọi điều với mọi người", { flags: ["s28_noi_that"], happy: 4, rel: -2 }, "Nhẹ người, hôm sau họ quên, bạn thì không"),
           C("Ngồi thư viện từ sáng tới tối", { flags: ["s28_doc_sach"], know: 5 }, "Thông thái dần, cô đơn dần")]),
      ],
      /* khoi_dong */
      [
        card("s28_kd_co_nho", "Cô bán cà phê cũng nhớ", (c, k) => `Ngày thứ chín mươi, ${k.npc("co_ca_phe")} không nói câu quen thuộc. Cô nhìn bạn, hạ giọng: "Tôi kẹt ở đây lâu hơn bạn nhiều. Tôi đếm được hai nghìn lần thứ Tư rồi." ${k.gag()}`,
          [C("Hợp sức tìm lối ra", { flags: ["s28_dong_doi"], rel: 4 }, "Có người cùng đếm ngày"),
           C("Giữ khoảng cách", { flags: ["s28_tu_minh"], counters: { s28_luyen: 1 } }, "Tự lực, không ai làm rối kế hoạch")]),
        card("s28_kd_tram_hai", "Ngày thứ một trăm hai mươi", (c, k) => {
          const sk = skill28(c);
          const tay = sk === "dan" ? "Bạn đã đàn bài hát trên radio trôi chảy hơn chính người hát." : sk === "may" ? "Bạn tháo lắp cái radio nhắm mắt cũng xong." : "Món ăn của bạn đã ngon tới mức chính bạn cũng thấy lạ.";
          const lieu = has(c, "s28_dong_doi") ? `${cap(k.npc("co_ca_phe"))} đề nghị thử một cách liều: lái xe thật xa, để nửa đêm tới khi đang ở chỗ khác.` : "Bạn nảy ra một cách liều: lái xe thật xa, để nửa đêm tới khi đang ở chỗ khác.";
          return `${tay} Nhưng thứ Tư vẫn là thứ Tư. ${lieu}`;
        },
          [C("Lái xe đi thật xa", { flags: ["s28_di_xa"], health: -3 }, "Có thể thoát, có thể tỉnh dậy ở giường cũ"),
           C("Luyện thêm cho thật hoàn hảo", { counters: { s28_luyen: 2 }, flags: ["s28_luyen_tiep"] }, "Giỏi hơn, ngày vẫn lặp")]),
      ],
      /* cu_lat */
      [
        card("s28_cl_lich", "Tờ lịch năm xưa", (c, k) => `Ngày thứ hai trăm, bạn nhận ra một chi tiết đã bỏ qua suốt hai trăm lần: tờ lịch treo tường không phải năm nay. Đây là ngày thứ Tư năm xưa, ngày bạn quay lưng với ${k.scar("nguoi") || "một người từng thân"}, ngày mọi chuyện về ${k.scar("do") || "những thứ bạn đang giữ"} còn chưa bắt đầu. Có lẽ vòng lặp đang chờ bạn chọn lại.`,
          [C("Chọn lại một lựa chọn cũ", { custom: "remark", flags: ["s28_chon_lai"] }, "Sửa một chuyện cũ, kéo theo mọi thứ sau đó"),
           C("Giữ nguyên, chỉ nói lời xin lỗi", { flags: ["s28_xin_loi"], rel: 3 }, "Không đổi quá khứ, nhẹ được lòng")]),
      ],
      /* day */
      [
        card("s28_day_hai_tram_nam_muoi", "Ngày thứ hai trăm năm mươi", (c, k) => `${has(c, "s28_chon_lai") ? "Từ hôm chọn lại, căn phòng có vài món đồ khác đi, nhưng thứ Tư vẫn lặp." : "Thứ Tư vẫn lặp, không sai một chi tiết."} Bạn bắt đầu sợ cái radio, sợ cái tách, sợ cả tiếng mở cửa của chính mình. ${k.gag()}`,
          [C("Nằm lì cả ngày", { health: -4, flags: ["s28_nam_li"], happy: -3 }, "Nghỉ ngơi, mất đà"),
           C("Chạy bộ quanh hồ mỗi sáng", { health: 4, flags: ["s28_chay"], counters: { s28_luyen: 1 } }, "Thân khỏe, đầu đỡ rối")]),
        card("s28_day_muoi_ngay", "Mười ngày cuối", (c, k) => `${has(c, "s28_dong_doi") ? `${cap(k.npc("co_ca_phe"))} tìm ra quy luật: ngày chỉ trôi khi có người làm trọn một việc, không sai một li.` : "Bạn tự tìm ra quy luật: ngày chỉ trôi khi bạn làm trọn một việc, không sai một li."} Gần ba trăm lần thứ Tư, giờ chỉ còn thiếu một lần đúng.`,
          [C("Tập lại từ đầu, thật chậm", { counters: { s28_luyen: 1 }, flags: ["s28_cham"] }, "Chắc tay, mệt mỏi"),
           C("Làm liều một lần cho xong", { flags: ["s28_lieu"], happy: 2 }, "Nhanh, có thể phải đếm lại")]),
      ],
      /* chung_ket */
      [
        card("s28_ket", "Ngày thứ ba trăm", (c, k) => `Sáng thứ Tư lần thứ ba trăm. ${k.gag()} ${cnt(c, "s28_luyen") >= 3 ? "Bạn làm trọn việc mình đã luyện suốt ba trăm ngày, nhẹ như thở." : "Bạn làm trọn việc mình đã luyện, run tay ở bước cuối nhưng không sai một li."} Rồi bạn chợt nhớ ${k.scar("no") || "món nợ cũ"} vẫn chưa trả, và nếu ngày mai tới thật thì nó cũng tới theo.`,
          (c) => {
            const sk = skill28(c);
            const nghe = sk === "dan" ? (can(c, "folk_musician") ? ending(L28_DAN, "Đi diễn với bài đã đàn ba trăm lần", "Thành nghề, đời trên sân khấu") : null)
              : sk === "may" ? (can(c, "inventor") ? ending(L28_MAY, "Đăng ký bản vẽ máy mới", "Thành nhà sáng chế, tiền chưa chắc") : null)
              : (can(c, "restaurateur") ? ending(L28_BEP, "Mở quán với món đã nấu ba trăm lần", "Thành nghề, gắn đời với bếp") : null);
            const lop = ending(L28_LOP, "Mở lớp dạy lại kỹ năng ấy", "Có tiền, có học trò, không thành danh");
            const sau = c.has_job ? ending(L28_NHANH, "Quay lại việc đang làm, nhanh gấp đôi", "Thu nhập tăng, đời không đổi hướng")
              : nghe ? lop : ending(L28_LAM_THUE, "Nhận làm thuê đúng việc đã luyện", "Có tiền đều, không thành danh");
            return [nghe ?? lop, sau];
          }),
      ],
    ],
  }));

/* ================================================================== S29 Trọng lực trong nhà giảm một nửa */

const L29_KHACH = land("s29_ban_ve", "Căn nhà nửa trọng lực thành điểm tham quan có tiếng. Tiền vé mỗi năm nhiều hơn mọi khoản thu trước đây của bạn.", { money: 2.5, happy: 3 });
const L29_BAN = land("s29_ban_nha", "Bạn bán căn nhà cho một viện nghiên cứu, cầm tiền chuyển đi, và lần đầu sau nhiều năm thấy chân mình nặng.", { sell: { kind: "house" }, money: 1, happy: -2 });

const S29 = weird("S29", "sf", ["ky", "dat"],
  (c) => c.age >= 18 && c.age <= 72 && (c.owns.has("house") || c.home_owner),
  () => "Ở lại trong căn nhà mất nửa trọng lực",
  () => ({
    title: "Căn nhà nhẹ đi một nửa",
    text: "Sáng nay bạn nhón chân lấy cái chảo trên kệ và đụng đầu vào trần nhà. Trong căn nhà của bạn, mọi thứ chỉ còn nặng một nửa: nước rót chậm như mật, bước một bước trôi xa ba mét. Ông hàng xóm đứng ngoài cổng, nhìn chiếc dép của bạn bay lững lờ qua cửa sổ, rồi nói: \"Cái này chắc phải xin giấy phép.\"",
  }),
  season({
    id: "w_S29", vn: "Nhà bay", color: "#6a7ae0", years: [5, 9], weird: "sf",
    rules: { flags: ["w_half_gravity"] },
    reset: { cast: [{ key: "hang_xom_kien", role: "neighbor", label: "ông hàng xóm hay kiện" }, { key: "nha_vat_ly", role: "mentor", label: "chị nhà vật lý mang theo cái cân" }] },
    gag: { key: "meo_tran", lines: [
      "Con mèo nhà bên lẻn sang, nhảy một cái lên tận trần nhà, nằm ngủ ở đó, đuôi thả xuống như sợi dây bật đèn.",
      "Con mèo nhà bên lại ngủ trên trần. Khách tưởng đó là đồ trang trí, xin chụp ảnh chung.",
      "Con mèo nhà bên giờ không chịu về nhà nó nữa. Chủ nó ghi thêm con mèo vào đơn kiện.",
      "Con mèo nhà bên đã quen sống trên trần. Về nhà chủ, nó cứ nhảy lên rồi rơi bịch xuống, nhìn mọi người đầy trách móc.",
    ] },
    landings: [L29_KHACH, L29_BAN],
    beats: [
      /* mo_man */
      [
        card("s29_mo_tran", "Cú nhảy đụng trần", (c, k) => `Tin vui là bạn bê được cái tủ lạnh bằng một tay. Tin buồn là nồi canh nổi lơ lửng nửa bát giữa không trung. ${k.gag()}`,
          [C("Kéo rèm, giấu kín", { flags: ["s29_giau"], happy: -1 }, "Yên, sống như kẻ trộm trong nhà mình"),
           C("Gọi cả xóm sang chơi", { flags: ["s29_khoe"], counters: { s29_khach: 1 }, happy: 3 }, "Vui, cả xóm biết")]),
        card("s29_mo_do", "Chăn gối trôi như cá", (c) => `Đêm đầu tiên, bạn tỉnh dậy cách giường nửa mét, chăn gối trôi quanh như cá. ${has(c, "s29_khoe") ? "Sáng ra, ba đứa trẻ trong xóm đã đứng chờ ở cổng, đòi vào bay thử." : "Sáng ra, bạn phải bơi trong không khí mới tới được cửa."}`,
          [C("Buộc mọi thứ bằng dây", { money: -0.05, flags: ["s29_buoc_day"] }, "Gọn gàng, nhà như khoang tàu"),
           C("Kệ, để đồ trôi tự do", { flags: ["s29_troi"], happy: 2 }, "Vui mắt, khó tìm đồ")]),
      ],
      /* khoi_dong */
      [
        card("s29_kd_ve", "Hàng người mua vé", (c, k) => `${has(c, "s29_khoe") ? "Cả xóm đã kể cho cả khu phố." : "Một đứa trẻ trèo rào nhìn vào, và cả khu phố biết."} Sáng thứ Bảy, năm mươi người xếp hàng trước cổng, cầm tiền lẻ, muốn được nhảy một cái chạm trần. ${k.gag()}`,
          [C("Bán vé vào nhà", { money: 0.4, counters: { s29_khach: 2 }, flags: ["s29_ban_ve_som"] }, "Tiền vào, nhà thành chợ"),
           C("Đóng cổng", { flags: ["s29_dong_cong"], happy: -2 }, "Giữ nhà là nhà")]),
        card("s29_kd_vat_ly", "Chị nhà vật lý", (c, k) => `${cap(k.npc("nha_vat_ly"))} tới với một cái cân, một quả bóng và một cuốn sổ ô li. Chị đứng giữa phòng khách, thả quả bóng xuống, đếm, rồi ngồi bệt xuống sàn: "Cả đời tôi chờ được thấy cái này."`,
          [C("Cho chị đo đạc", { flags: ["s29_khoa_hoc"], know: 4, money: 0.1 }, "Có tiền tài trợ, nhà đầy dây đo"),
           C("Mời chị về", { flags: ["s29_khong_do"], happy: 1 }, "Giữ riêng tư, thiếu người hiểu chuyện")]),
      ],
      /* cu_lat */
      [
        card("s29_cl_tam", "Tâm của vùng nhẹ", (c, k) => `${has(c, "s29_khoa_hoc") ? `${cap(k.npc("nha_vat_ly"))} tìm ra tâm của vùng nhẹ:` : "Bạn tự tìm ra tâm của vùng nhẹ:"} ngay góc nhà gắn với ${k.scar("do") || "những kỷ niệm cũ nhất"}. Cùng tuần đó, ${k.scar("nguoi") || "một người cũ"} ghé qua, bay một vòng quanh phòng, ${c.nemesis ? "rồi bám trần nhà mà vẫn cố giữ vẻ khó chịu." : "cười như hồi hai người còn trẻ."}`,
          [C("Dọn trống góc nhà ấy", { flags: ["s29_doi_do"], know: 1 }, "Biết được nhà có nặng lại không"),
           C("Mời người cũ ở lại thêm", { flags: ["s29_moi_o"], rel: 4 }, "Thêm một người gắn với căn nhà"),
           C("Cho viện đặt máy đo ở góc ấy", { flags: ["s29_cho_muon"], money: 0.2 }, "Có tiền, nhà thành phòng thí nghiệm")]),
      ],
      /* day */
      [
        card("s29_day_kien", "Đơn kiện", (c, k) => `${cap(k.npc("hang_xom_kien"))} nộp đơn kiện: căn nhà của bạn làm cây nhà ông mọc nghiêng, ${has(c, "s29_ban_ve_som") ? "khách xem nhà đỗ xe chắn cổng," : "người tò mò rình rập suốt ngày,"} và nhiều chuyện khác. ${k.gag()}`,
          [C("Hầu tòa tới cùng", { money: -0.3, flags: ["s29_hau_toa"] }, "Có thể thắng, chắc chắn tốn"),
           C("Dàn xếp, chia tiền vé cho ông", { money: -0.2, flags: ["s29_dan_xep"], rel: 2 }, "Mất tiền, được một hàng xóm")]),
        card("s29_day_nut", "Nền nhà nứt", () => "Trọng lực không đều làm nền nhà nứt một đường chéo từ bếp ra cổng. Thợ xây tới xem, nhảy thử một cái, rồi báo giá gấp ba bình thường \"vì công trình đặc biệt\".",
          [C("Vay tiền gia cố móng", { custom: "borrow:0.5", flags: ["s29_gia_co"] }, "Giữ được nhà, gánh thêm nợ"),
           C("Để nguyên, khóa phòng bếp", { flags: ["s29_de_nguyen"], counters: { s29_khach: -1 } }, "Đỡ tốn, nhà xuống cấp dần")]),
      ],
      /* chung_ket */
      [
        card("s29_ket", "Căn nhà giá bao nhiêu", (c, k) => `${cap(k.npc("nha_vat_ly"))} báo: vùng nhẹ đang lan, năm sau có khi cả mái nhà sẽ bay. Một viện nghiên cứu đề nghị mua lại căn nhà, còn ${cnt(c, "s29_khach") >= 2 ? "khách vẫn xếp hàng dài ngoài cổng" : "ngoài cổng lác đác vài người tò mò"}. ${k.gag()} Bạn nhẩm lại ${k.scar("no") || "món nợ cũ"} và biết căn nhà này là thứ duy nhất đủ để trả.`,
          [ending(L29_KHACH, "Giữ nhà, bán vé cho khách", "Tiền đều, đời thành điểm tham quan"),
           ending(L29_BAN, "Bán nhà cho viện nghiên cứu", "Có tiền, mất căn nhà biết bay")]),
      ],
    ],
  }));

/* ================================================================== S30 Dịch bệnh làm mọi người không nói dối được */

const L30_LY = land("s30_chia_tay", "Sau một bữa cơm không ai nói dối được, hai người ký giấy chia tay, lần đầu tiên nói thật với nhau trọn một buổi.", { custom: "spouse_leave", happy: -4 });
const L30_CUOI = land("s30_ket_hon", "Bạn nói thật một câu đã giữ nhiều năm, và người kia cũng thế. Đám cưới nhỏ, khách mời toàn người không nói dối được.", { custom: "marry", happy: 8 });
const L30_BAO = land("s30_lam_bao", "Bạn đi làm phóng viên ở thời ai cũng phải nói thật, và mỗi cuộc phỏng vấn là một cơn địa chấn.", { custom: "become:journalist", know: 3 });
const L30_DI = land("s30_chuyen_di", "Bạn nói thật với cả khu phố lần cuối, rồi dọn tới một thành phố mới, nơi chưa ai biết chuyện cũ.", { custom: "move_city", happy: 2 });
const L30_MAT_VIEC = land("s30_mat_viec", "Bạn nói thật với sếp một lần quá nhiều. Bạn mất việc, mất khoản thưởng, nhưng không còn phải cười giả nữa.", { custom: "job_lose", money: -1, happy: 3 });

const S30 = weird("S30", "sf", ["ky", "tinh"],
  (c) => c.age >= 18 && c.age <= 70 && (Object.keys(c.hooks).length > 0 || c.plants.some((p) => p.kind === "secret")),
  () => "Để cơn sốt thật thà lây sang mình",
  (s) => ({
    title: "Cơn sốt thật thà",
    text: `Một cơn sốt nhẹ lan khắp ${s.noi || "thành phố"} trong một tuần, và sau đó không ai nói dối được nữa. Người bán hàng nói giá gốc, sếp nói thật lý do bắt tăng ca, còn cô dẫn bản tin thời tiết nhìn thẳng vào máy quay: "Thật ra chúng tôi chỉ đoán." Bạn sờ trán mình, thấy hơi ấm, và nhớ tới chuyện chưa từng kể với ai.`,
  }),
  season({
    id: "w_S30", vn: "Thế giới nói thật", color: "#5d48c9", years: [6, 10], weird: "sf",
    rules: { flags: ["w_no_lies"] },
    reset: { cast: [{ key: "ba_thang_tinh", role: "neighbor", label: "bà hàng xóm thẳng tính nhất xóm" }] },
    gag: { key: "du_bao", lines: [
      "Trên tivi, cô dẫn bản tin thời tiết thú nhận \"thật ra chúng tôi chỉ đoán\", rồi vẫn đọc tiếp dự báo.",
      "Bản tin thời tiết hôm nay chỉ có một câu: mai có thể mưa, có thể không, đài cũng không chắc.",
      "Cô dẫn bản tin thời tiết khóc trên sóng, kể rằng chưa bao giờ thích mặc áo mưa. Lượt xem tăng gấp mười.",
      "Bản tin thời tiết giờ có thêm mục mới: cảm xúc của người dẫn chương trình. Hôm nay: hơi buồn, gió nhẹ.",
    ] },
    landings: [L30_LY, L30_CUOI, L30_BAO, L30_MAT_VIEC, L30_DI],
    beats: [
      /* mo_man */
      [
        card("s30_mo_sot", "Ba mươi tám độ", (c, k) => `Nhiệt kế chỉ ba mươi tám độ. Sáng nay bạn định nói "ổn cả" với người nhà, nhưng miệng tự nói "mệt và hơi sợ". ${cap(k.npc("ba_thang_tinh"))} bên kia hàng rào gật gù: "Thế là dính rồi." ${k.gag()}`,
          [C("Đeo khẩu trang, tránh nói chuyện", { flags: ["s30_im"], counters: { s30_im: 1 } }, "Ít lộ chuyện, ít bạn bè"),
           C("Tự kể bí mật trước khi bị hỏi", { custom: "confess_hook", flags: ["s30_tu_thu"], counters: { s30_that: 1 } }, "Mất mặt sớm, đỡ nổ muộn")]),
        card("s30_mo_hop", "Cuộc họp mười phút", (c) => `${c.has_job ? "Cuộc họp đầu tuần ở chỗ làm" : "Cuộc họp khu phố"} kéo dài mười phút thay vì hai tiếng, vì không ai vòng vo được nữa. ${c.has_job ? "Sếp" : "Người trưởng khu phố"} nhìn bạn và nói thật điều đã nghĩ từ lâu: ${has(c, "s30_tu_thu") ? "rằng mình nể bạn vì dám nói trước." : "rằng mình chưa bao giờ nghe hết một câu bạn nói."}`,
          [C("Nói thật lại ngay tại chỗ", { flags: ["s30_noi_sep"], counters: { s30_that: 1 }, happy: 3 }, "Hả dạ, bấp bênh"),
           C("Ghi chép, không nói gì", { flags: ["s30_ghi_chep"], counters: { s30_im: 1 } }, "An toàn, nghẹn")]),
      ],
      /* khoi_dong */
      [
        card("s30_kd_com", "Bữa cơm thật thà", (c, k) => `${c.married ? "Bữa tối, bạn đời hỏi một câu tưởng vô hại: dạo này bạn có thật sự vui không." : "Bữa tối với người quen, ai đó hỏi một câu tưởng vô hại: bao giờ bạn mới chịu tìm một người bầu bạn."} Cả bàn im phăng phắc chờ câu trả lời mà bạn không thể bịa. ${k.gag()}`,
          [C("Trả lời thật, rồi xin lỗi", { flags: ["s30_tra_loi"], counters: { s30_that: 1 }, rel: -3 }, "Đau một lần, sạch một lần"),
           C("Đứng dậy rửa bát", { flags: ["s30_ne"], counters: { s30_im: 1 }, happy: -2 }, "Né được hôm nay, câu hỏi chờ ngày mai")]),
        card("s30_kd_quang_cao", "Thế giới không quảng cáo nổi", (c, k) => `Không ai quảng cáo được nữa: biển hiệu nào cũng phải ghi "bình thường, giá hơi cao". Nhiều công ty sập, vài nghề mới mọc lên, và ${k.npc("ba_thang_tinh")} mở dịch vụ nhận xét thẳng mặt, khách xếp hàng.`,
          [C("Viết nhật ký sự thật lên mạng", { flags: ["s30_viet"], counters: { s30_that: 1 }, know: 2 }, "Có người đọc, có người ghét"),
           C("Giữ mồm, lo việc của mình", { flags: ["s30_giu_mieng"], counters: { s30_im: 1 } }, "Yên thân, bỏ lỡ thời thế")]),
      ],
      /* cu_lat */
      [
        card("s30_cl_nguoi_cu", "Câu hỏi về người cũ", (c, k) => `Ở đám cưới một người quen, ai đó hỏi bạn về ${k.scar("nguoi") || "người cũ"}. Miệng bạn trả lời trước khi đầu kịp ngăn, đủ to để cả bàn nghe. Rồi tới câu hỏi về ${k.scar("do") || "món đồ bạn giữ bao năm"}, và câu trả lời còn thật hơn.`,
          [C("Nói nốt cho xong", { flags: ["s30_noi_het"], counters: { s30_that: 1 }, rel: -4 }, "Hết bí mật, hết vài người bạn"),
           C("Bỏ về giữa tiệc", { flags: ["s30_bo_ve"], counters: { s30_im: 1 }, happy: -3 }, "Giữ được nửa câu chuyện"),
           C("Hỏi ngược lại người hỏi", { flags: ["s30_hoi_nguoc"], know: 2 }, "Ai cũng có bí mật, kể cả họ")]),
      ],
      /* day */
      [
        card("s30_day_no", "Bí mật nổ", (c, k) => `${cnt(c, "s30_that") >= 2 ? "Bạn đã nói thật nhiều tới mức tưởng chẳng còn gì để giấu." : "Bạn đã né suốt mấy năm."} Nhưng người biết chuyện cũ của bạn cũng không nói dối được nữa, và giờ cả ${k.noi} biết. ${k.gag()}`,
          [C("Đứng ra nhận hết", { custom: "confess_hook", flags: ["s30_nhan"], happy: -3 }, "Mất mặt, giữ được người tin bạn"),
           C("Lánh đi vài tháng", { custom: "explode_hook", flags: ["s30_lanh"], money: -0.2 }, "Tránh mặt, chuyện nổ to hơn")]),
        card("s30_day_thuoc", "Thuốc giải", () => "Tin mới: thuốc giải cơn sốt thật thà sắp có, mỗi người được chọn tiêm hay không. Nửa thành phố xếp hàng tiêm, nửa còn lại thề không bao giờ quay lại thời nói dối.",
          [C("Đăng ký tiêm đợt đầu", { flags: ["s30_tiem"], happy: 2 }, "Lại được nói dối, lại phải nhớ mình đã nói gì"),
           C("Không tiêm, sống thật", { flags: ["s30_khong_tiem"], counters: { s30_that: 1 } }, "Thẳng mãi, ít bạn mãi")]),
      ],
      /* chung_ket */
      [
        card("s30_ket", "Câu hỏi cuối cùng", (c, k) => `${has(c, "s30_tiem") ? "Thuốc giải đã ngấm, nhưng bạn nhận ra mình không muốn nói dối nữa." : "Cơn sốt vẫn âm ỉ trong người bạn."} ${k.gag()} Người quan trọng nhất đời bạn hỏi câu cuối cùng: ${k.scar("no") || "món nợ cũ"} thì sao, bạn định trả hay định quên? Lần này, câu trả lời sẽ đổi hết.`,
          (c) => [
            c.married ? ending(L30_LY, "Nói thật, rồi ký giấy chia tay", "Hết dối nhau, hết chung nhà")
              : ending(L30_CUOI, "Nói thật một câu giữ đã lâu", "Có người ở lại, vì biết hết"),
            ...(can(c, "journalist") ? [ending(L30_BAO, "Đi làm phóng viên thời nói thật", "Đúng thời, nguy hiểm")] : []),
            c.has_job ? ending(L30_MAT_VIEC, "Nói thật với sếp lần cuối", "Mất việc, hết phải cười giả")
              : ending(L30_DI, "Nói thật lần cuối, rồi dọn đi", "Hết chuyện cũ, xa người quen"),
          ]),
      ],
    ],
  }));

export const SF_21: WeirdBranch[] = [S21, S22, S23, S24, S25, S26, S27, S28, S29, S30];
