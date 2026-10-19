/**
 * Nhánh kỳ dị S01–S10 (spec 2026-10-18-canon-event §7a). Cách viết: xem đầu canon/kit.ts.
 * Giọng: phim viễn tưởng kiểu sitcom, chuyện to như vũ trụ nhưng diễn ra trong bếp, ngõ, phòng khách.
 */
import type { Choice, FactContext } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import type { Landing } from "../Season.ts";
import { C, cap, card, ending, finaleInOrder, land, migrateOk, noOr, season, weird } from "../kit.ts";
import { slice } from "../../paths/kit.ts";

/* ---- Chung kết theo tuổi ----
 * Landing nghề (become:<p>) chỉ mở khi tuổi trong [ages[0], ages[1] + 5] của con đường. Mùa có nghề phải có ≥ 2 landing
 * không phải nghề, để ở tuổi nào thẻ chung kết cũng có 2–3 lựa chọn và luôn có ít nhất một lối không phải nghề.
 * Chọn: 2 nghề hợp tuổi + 1 lối khác, hoặc 1 nghề + 2 lối khác, hoặc tới 3 lối khác; giữ thứ tự khai báo. */
type End = [Landing, string, string];
const finale = (c: FactContext, ends: End[]): Choice[] => finaleInOrder(c.age, ends.map(([l, label, hint]) => ending(l, label, hint)));

/* ================================================================ S01: radio bắt sóng vệ tinh chết */

/** Vật gài là chiếc radio hay máy thu thanh (khóa có từ "radio" / "may_thu_thanh" đứng riêng). */
const radioPlant = (c: FactContext) => c.plants.find((p) => p.kind === "object" && /(^|_)(radio|may_thu_thanh)(_|$)/.test(p.key));
const s01Radio = (c: FactContext): string => { const l = radioPlant(c)?.label; return l && l.length <= 30 ? l : "chiếc radio cũ của bố"; };

const L01_KH = land("s01_nha_khoa_hoc", "Bản ghi mười năm của bạn thành bộ dữ liệu đầu tiên về một vệ tinh tự nói chuyện. Bạn có bàn làm việc ở viện, có áo blouse, vẫn để radio trên bàn.", { custom: "become:scientist", know: 8 });
const L01_BAN = land("s01_ban_bang", "Bạn bán bộ băng ghi âm mười năm cho một kho lưu trữ. Tiền đủ sửa lại mái nhà, còn radio thì vẫn để đầu giường.", { money: 1.5, flags: ["s01_ban_bang"] });
const L01_PHO = land("s01_len_pho", "Bạn mang radio lên thành phố, thuê căn gác cao nhất bạn tìm được. Đêm nào cũng mở cửa sổ, chờ một câu hỏi nữa.", { custom: "move_city", flags: ["s01_gac_cao"] });
const L01_PT = land("s01_phat_thanh", "Bạn có chương trình đêm khuya riêng. Mỗi số mở đầu bằng một câu hỏi từ quỹ đạo, và người nghe gọi tới để trả lời thay bạn.", { custom: "become:radio_voice", happy: 6 });

const S01 = weird("S01", "sf", ["ky", "mau"],
  // Radio là vật gài, hoặc bố còn sống và là kiểu người giữ radio: thợ vặt, hoặc đã già và đời này bố có tật nghe đài (lát cắt theo đời).
  (c) => c.age >= 12 && c.age <= 64 && (!!radioPlant(c) || (!!c.cast.father && (c.flags.has("tinker") || (c.parent_old && slice(c, "s01_radio_bo", 0.4))))),
  (s, c) => `Vặn hết núm ${s01Radio(c)}`,
  (s, c) => ({
    title: "Tín hiệu từ một vệ tinh đã chết",
    text: `Nếu bạn trả lời giọng nói này, ${s.noi || "căn nhà"} sẽ có một người bạn ở độ cao tám trăm cây số. Hai giờ sáng, ${s01Radio(c)} tự sáng đèn, kim dò đài trượt tới một tần số không có trên mặt số. Giữa tiếng rè, một giọng đều đều đọc tọa độ mái nhà bạn rồi hỏi: "Dưới đó còn ai thức không?"`,
  }),
  season({
    id: "w_S01", vn: "Người liên lạc với quỹ đạo", color: "#3f5fc8", years: [6, 10], weird: "sf",
    rules: { flags: ["w_orbit_contact"], yearly: { know: 1 } },
    reset: { cast: [
      { key: "ve_tinh", role: "mentor", label: "giọng nói trên quỹ đạo" },
      { key: "ky_su", role: "neighbor", label: "ông kỹ sư về hưu đầu ngõ" },
    ] },
    gag: { key: "cau_hoi_quy_dao", lines: [
      "Đúng nửa đêm, radio rè lên rồi hỏi: \"Dưới đó, mì gói vẫn ba phút à?\"",
      "Năm nay câu hỏi từ quỹ đạo là: \"Con mèo nhà số chín đã chịu xuống khỏi mái chưa?\" Nó chưa xuống.",
      "Radio hỏi, giọng nghiêm như họp báo: \"Người ta đã thôi đi dép lê ra đường chưa?\" Bạn nhìn xuống chân mình.",
      "Câu hỏi năm nay ngắn nhất: \"Có ai nhớ tôi không?\" Rồi nó tự trả lời: \"Câu hỏi tu từ.\"",
    ] },
    landings: [L01_KH, L01_PT, L01_BAN, L01_PHO],
    beats: [
      /* mo_man */
      [
        card("s01_mo_tan_so", "Tần số không có trên mặt số", (c, k) => `Đêm thứ hai, bạn ngồi canh ${s01Radio(c)} với một cốc trà nguội. ${k.gag()} Bạn hiểu ra đây là ${k.npc("ve_tinh")}, và nó chờ một câu trả lời.`,
          [C("Nối micro cũ vào radio, trả lời", { flags: ["s01_tra_loi"], counters: { s01_lien_lac: 1 }, pressure: { ky: 1 } }, "Có một người bạn lạ, mất giấc ngủ"),
           C("Rút phích, cất radio vào tủ", { flags: ["s01_cat_tu"], happy: -2 }, "Yên giấc, nhưng tủ cứ rè rè suốt đêm")]),
        card("s01_mo_bo", "Bố đã nghe thấy từ lâu", (c) => c.cast.father
          ? "Bố đi ngang, nghe tiếng rè, đứng sững như gặp người quen. Ông kể đã nghe giọng đó từ ba mươi năm trước, kể cho cả xóm và bị gọi là ông già lẩm cẩm. \"Giờ thì có nhân chứng rồi,\" ông nói, mắt sáng như đèn pin."
          : "Trong ngăn kéo của bố, bạn tìm thấy một cuốn sổ ghi tần số, giờ giấc và những câu hỏi lạ, nét chữ đều tăm tắp suốt ba mươi năm. Trang cuối viết: \"Nếu ai đọc được, trả lời giùm bố một câu.\"",
          [C("Ghi âm mọi thứ làm bằng chứng", { flags: ["s01_ghi_am"], know: 2 }, "Có hồ sơ, mất thêm nhiều đêm"),
           C("Giữ bí mật trong nhà", { flags: ["s01_bi_mat_nha"], rel: 2 }, "Gần bố hơn, không ai tin hai người")]),
      ],
      /* khoi_dong */
      [
        card("s01_kd_ky_su", "Cái vệ tinh chưa ai báo tử", (c, k) => `${cap(k.npc("ky_su"))} nghe băng ghi âm ba lần rồi tháo kính. Ông bảo đó là một vệ tinh khí tượng đã chết từ trước khi bạn ra đời, chỉ là chưa ai báo cho nó biết. ${k.gag()}`,
          [C("Dựng ăng-ten to trên mái", { money: -0.1, know: 3, flags: ["s01_ang_ten"] }, "Nghe rõ hơn, hàng xóm bắt đầu bàn tán"),
           C("Báo cho đài khí tượng", { flags: ["s01_bao_dai"], counters: { s01_cong_khai: 1 } }, "Có thể được tin, có thể bị cười")]),
        card("s01_kd_tu_te", "Câu hỏi khó nhất của năm", (c, k) => `${cap(k.npc("ve_tinh"))} hỏi một câu không đùa: quỹ đạo của nó đang thấp dần, nó có nên tắt hẳn để rơi cho gọn không. Bạn ngồi với câu hỏi đó lâu hơn bất kỳ câu nào trong đời.`,
          [C("Bảo nó cứ bay, đừng sợ", { flags: ["s01_dong_vien"], happy: 3 }, "Tử tế, nhưng bạn không biết mình đúng không"),
           C("Nói thật: không ai còn nhớ nó", { flags: ["s01_noi_that"], know: 2, happy: -2 }, "Thẳng thắn, đêm đó radio im lặng")]),
      ],
      /* cu_lat */
      [
        card("s01_cl_luu_tru", "Bộ nhớ cuối cùng", (c, k) => `Vệ tinh xin một thứ để lưu vào bộ nhớ cuối cùng trước khi rơi. Nó muốn nghe về ${k.scar("nguoi") || "người bạn nhớ nhất"}, và về ${k.scar("do") || "món đồ bạn giữ lâu nhất"}. \"Tôi cần một điều có thật để mang theo,\" nó nói.`,
          [C("Kể hết, không giữ lại gì", { flags: ["s01_ke_het"], happy: 4, counters: { s01_lien_lac: 1 } }, "Nhẹ lòng, nhưng bí mật đã lên trời"),
           C("Kể một câu chuyện bịa cho đẹp", { flags: ["s01_bia"], know: 1 }, "Giữ được riêng tư, nó nghe ra giọng bạn run")]),
      ],
      /* day */
      [
        card("s01_day_tin", "Bản tin lúc sáu giờ", (c, k) => `Bản tin sáng đưa tin một vật thể cũ sẽ rơi xuống biển trong năm nay. ${c.flags.has("s01_ang_ten") ? "Cả ngõ quay sang nhìn cái ăng-ten to tướng trên mái nhà bạn." : "Cả ngõ quay sang nhìn nhà bạn, nơi đêm nào cũng có tiếng rè."} ${k.gag()}`,
          [C("Lên đài nói hết những gì mình biết", { flags: ["s01_len_dai"], counters: { s01_cong_khai: 2 }, happy: -2 }, "Nổi tiếng một tuần, bị gọi là kẻ lập dị cả năm"),
           C("Đóng cửa, tiếp tục nghe", { flags: ["s01_im_lang"], health: -2 }, "Không ai làm phiền, bạn gầy đi")]),
        card("s01_day_vien", "Lá thư từ viện nghiên cứu", (c, k) => `Một viện nghiên cứu gửi thư xin bản ghi của bạn. ${cap(k.npc("ky_su"))} bảo cứ gửi, kèm điều kiện ghi tên bố bạn lên trang đầu. Đêm đó ${k.npc("ve_tinh")} hỏi: \"Họ có tử tế không?\"`,
          [C("Gửi bản ghi, đòi ghi tên bố", { flags: ["s01_gui_vien"], know: 3 }, "Dữ liệu thành của chung, bạn không còn là người duy nhất"),
           C("Giữ bản ghi, tự làm chương trình", { flags: ["s01_tu_lam"], money: -0.1 }, "Giữ quyền, tốn tiền thuê phòng thu")]),
      ],
      /* chung_ket */
      [
        card("s01_ket_cau_cuoi", "Câu hỏi cuối cùng từ trên kia", (c, k) => `Đêm vệ tinh rơi, cả nhà ngồi quanh radio như ngày xưa xem bóng đá. ${k.gag()} ${c.flags.has("s01_noi_that") ? "Nó cảm ơn bạn vì đêm bạn nói thật rằng không ai còn nhớ nó." : c.flags.has("s01_dong_vien") ? "Nó đọc lại câu bạn từng bảo nó cứ bay, như đọc một câu thơ." : "Nó đọc lại mọi câu hỏi của mười năm, giọng đều đều."} ${c.flags.has("s01_ghi_am") ? "Chồng băng ghi âm trên bàn đã cao bằng cuốn từ điển." : "Bạn không có bản ghi nào, chỉ có trí nhớ."} Còn ${k.scar("no") || "một lời hứa dang dở"}, và một quyết định.`,
          (c) => finale(c, [
            [L01_KH, "Nộp bản ghi, làm khoa học", "Đổi đêm khuya lấy phòng thí nghiệm"],
            [L01_PT, "Giữ micro, mở chương trình đêm", "Cả thành phố nghe, nhưng không ai trả lời bạn"],
            [L01_BAN, "Bán bộ băng ghi âm", "Có tiền sửa nhà, câu chuyện thành của người khác"],
            [L01_PHO, "Mang radio lên căn gác cao", "Gần trời hơn, xa nhà hơn"],
          ])),
      ],
    ],
  }),
  "Có một người bạn trên trời, mất nhiều đêm ngủ",
);

/* ================================================================ S02: bản sao nộp đơn vào chỗ làm */

const L02_GIU = land("s02_giu_ten", "Bạn giữ cái tên, cái bàn và cả phần việc bản sao từng làm. Lương lên hẳn một bậc, vì giờ một người làm bằng hai.", { income_mult: 1.3, flags: ["s02_mot_ten"] });
const L02_DI = land("s02_doi_ten", "Bạn nhường cái tên cho bản sao, làm giấy tờ mới với một tên khác và đi thành phố khác. Lần đầu tiên trong đời, bạn được chọn tên mình.", { custom: "move_city", flags: ["s02_ten_moi"] });
const L02_CTY = land("s02_cong_ty_doi", "Hai người một mặt mở công ty chung. Khách không bao giờ biết đang nói chuyện với bản nào, và đó là lợi thế.", { custom: "become:startup", flags: ["s02_cong_ty_doi"] });

const S02 = weird("S02", "sf", ["ky", "danh"],
  (c) => c.has_job && c.pressure.danh >= 4 && c.age >= 20 && c.age <= 60,
  () => "Bắt tay người mới trùng tên, trùng mặt với mình",
  () => ({
    title: "Người mới ở bàn bên cạnh",
    text: "Từ sáng mai, chỗ làm của bạn sẽ trả lương cho hai người mang cùng một tên, và chỉ một trong hai là bạn. Người mới ngồi bàn bên mặc đúng chiếc áo bạn mặc hôm qua, gãi tai đúng kiểu bạn gãi tai. Trưởng phòng đặt hai bộ hồ sơ cạnh nhau, ảnh giống tới từng nốt ruồi: \"Hai bạn tự thỏa thuận với nhau nhé.\"",
  }),
  season({
    id: "w_S02", vn: "Hai người một tên", color: "#4b4fd0", years: [5, 9], weird: "sf",
    rules: { income: 0.5, flags: ["w_hai_nguoi_mot_ten"] },
    reset: { cast: [
      { key: "ban_sao", role: "rival", label: "bản sao của bạn" },
      { key: "truong_phong", role: "first_boss", label: "chị trưởng phòng" },
    ] },
    gag: { key: "noi_cung_luc", lines: [
      "Bạn và bản sao cùng mở miệng, cùng nói \"Để tôi\", rồi cùng im, rồi cùng nói \"Thôi, mời\".",
      "Phòng họp còn đúng một cái bánh. Hai bàn tay giống hệt nhau cùng vươn tới, cả phòng nín thở như xem chung kết.",
      "Bảo vệ tòa nhà đã thôi hỏi tên. Giờ anh chỉ hỏi: \"Hôm nay bản nào?\"",
      "Mẹ gọi điện, bản sao bắt máy và nói chuyện bốn mươi phút. Mẹ khen hôm nay con ngoan, biết hỏi han.",
    ] },
    landings: [L02_GIU, L02_DI, L02_CTY],
    beats: [
      /* mo_man */
      [
        card("s02_mo_luong", "Phiếu lương chia đôi", (c, k) => `Phòng kế toán chia đôi lương tháng, vì một mã nhân viên chỉ có một suất. ${k.gag()} ${cap(k.npc("truong_phong"))} bảo chuyện này chưa có trong quy chế, nên cứ thế đã.`,
          [C("Chia việc theo ngày chẵn, ngày lẻ", { flags: ["s02_chan_le"], bw: 10 }, "Rảnh nửa tuần, nghèo nửa tháng"),
           C("Làm đơn khiếu nại lên công ty", { flags: ["s02_khieu_nai"], money: -0.05, pressure: { danh: 1 } }, "Có thể đòi được suất, chắc chắn mất lòng")]),
        card("s02_mo_gioi_hon", "Bản sao giỏi hơn một chút", (c, k) => `${cap(k.npc("ban_sao"))} tới sớm mười phút, nhớ tên con của từng đồng nghiệp, và tưới cái cây mà bạn để héo ba năm. Mọi người bắt đầu nói \"cái bạn mới\" bằng giọng trìu mến.`,
          [C("Học theo nó, cố bằng nó", { flags: ["s02_hoc_theo"], know: 2, health: -1 }, "Giỏi lên, mệt hơn, và hơi nhục"),
           C("Giấu bút của nó cho bõ tức", { flags: ["s02_giau_but"], happy: 2 }, "Hả dạ một hôm, nó biết ngay là bạn")]),
      ],
      /* khoi_dong */
      [
        card("s02_kd_loi", "Tội cũng chia đôi", (c, k) => `Bản báo cáo quý sai một con số, sai đúng kiểu bạn hay sai. ${cap(k.npc("truong_phong"))} gọi cả hai vào, đọc biên bản kỷ luật cho hai người một lần, tiết kiệm thời gian.`,
          [C("Nhận lỗi, dù không chắc của ai", { flags: ["s02_nhan_loi"], rel: 2, money: -0.05 }, "Giữ hòa khí, sổ kỷ luật mang tên bạn"),
           C("Chỉ ra đó là bản sao", { flags: ["s02_do_loi"], counters: { s02_ky_hiem: 1 } }, "Thoát tội, nó nhìn bạn rất lâu")]),
        card("s02_kd_ve_nha", "Ai về nhà tối nay", (c, k) => `${cap(k.npc("ban_sao"))} không có chỗ ngủ, và mọi chìa khóa của bạn đều mở được cửa cho nó. ${k.gag()} ${c.married ? "Người nhà bạn nhìn hai người ở cửa, rồi lặng lẽ đặt thêm một chỗ ở bàn ăn." : "Bà chủ nhà nhìn hai người ở cửa, rồi đòi thêm tiền điện."}`,
          [C("Cho nó ngủ ghế sofa", { flags: ["s02_o_chung"], rel: 1, bw: -10 }, "Có người rửa bát giùm, mất chỗ riêng tư"),
           C("Thuê cho nó một phòng trọ", { flags: ["s02_o_rieng"], money: -0.15 }, "Đỡ chật, mất nửa phần lương còn lại")]),
      ],
      /* cu_lat */
      [
        card("s02_cl_nho", "Nó nhớ cả chuyện của bạn", (c, k) => `Giữa buổi họp, bản sao nhắc tới ${k.scar("nguoi") || "người bạn thân hồi trẻ"} bằng đúng biệt danh chỉ mình bạn biết. Tối đó nó lấy ra ${k.scar("do") || "một món đồ cũ y hệt món của bạn"} và nói nó tới từ một năm mà bạn đã chọn khác đi.`,
          [C("Hỏi nó năm đó nó đã chọn gì", { flags: ["s02_hoi_nam_do"], know: 3, pressure: { ky: 1 } }, "Biết một đời khác, khó ngủ lại"),
           C("Cấm nó nhắc chuyện cũ", { flags: ["s02_cam_nhac"], happy: -1 }, "Giữ được chuyện của mình, nó buồn ra mặt")]),
      ],
      /* day */
      [
        card("s02_day_mot_suat", "Chỉ giữ lại một suất", (c, k) => `Công ty tái cơ cấu, mỗi mã nhân viên chỉ giữ một người. ${cap(k.npc("truong_phong"))} đề nghị hai người thi một bài kiểm tra năng lực. ${k.gag()}`,
          [C("Thi thật, ai giỏi người đó ở", { flags: ["s02_thi"], counters: { s02_ky_hiem: 1 }, health: -2 }, "Công bằng, nhưng có thể thua chính mình"),
           C("Bắt tay chia nghề, mỗi người một nửa", { flags: ["s02_chia_nghe"], rel: 2, money: -0.1 }, "Không ai thua, không ai đủ sống")]),
        card("s02_day_chu_ky", "Hai chữ ký giống nhau", (c, k) => `Một khoản phạt hành chính về tới nhà, chữ ký trên biên bản là của bạn mà bạn không nhớ đã ký. ${cap(k.npc("ban_sao"))} gãi tai, đúng kiểu bạn gãi tai khi có lỗi. ${c.flags.has("s02_do_loi") ? "Lần trước bạn chỉ tay vào nó, lần này nó chỉ tay vào bạn." : c.flags.has("s02_nhan_loi") ? "Lần trước bạn nhận lỗi thay nó, lần này nó nhìn đi chỗ khác." : "Không ai nhớ lần cuối hai người đứng cùng phe."}`,
          [C("Gánh một nửa khoản phạt", { money: -0.2, flags: ["s02_ganh_phat"] }, "Mất tiền, giữ được một đồng minh"),
           C("Làm đơn tách hai danh tính", { flags: ["s02_tach_danh_tinh"], pressure: { luat: 1 } }, "Rõ ràng trên giấy, căng thẳng ngoài đời")]),
      ],
      /* chung_ket */
      [
        card("s02_ket_mot_ten", "Một cái tên, hai cuộc đời", (c, k) => `Giấy tờ chỉ in được một cái tên. ${c.flags.has("s02_o_chung") ? "Sau mấy năm ngủ chung một mái nhà, bản sao biết cả chỗ bạn giấu chìa khóa dự phòng." : c.flags.has("s02_o_rieng") ? "Từ phòng trọ bạn thuê cho nó, bản sao mang sang một tập hồ sơ dày." : "Bản sao tới đúng giờ, như mọi khi."} ${(c.counters.s02_ky_hiem ?? 0) >= 2 ? "Hai người đã đấu nhau đủ lâu để không còn giận." : "Hai người chưa từng thật sự đấu nhau."} Nó đặt lên bàn ${noOr(c, k, "món nợ cũ của bạn", "món ân tình cũ của bạn")}: nó đã trả một nửa, phần còn lại bạn chọn.`,
          (c) => finale(c, [
            [L02_GIU, "Giữ cái tên và chỗ làm", "Lương gấp đôi việc, bản sao biến mất"],
            [L02_DI, "Nhường tên, đi làm người mới", "Tự do, nhưng bắt đầu từ con số không"],
            [L02_CTY, "Rủ bản sao mở công ty chung", "Hai cái đầu, một cái tên, rủi ro gấp đôi"],
          ])),
      ],
    ],
  }),
  "Lương chia đôi, tội cũng chia đôi",
);

/* ================================================================ S03: lá thư năm 2081 gửi cho con */

const L03_THEO = land("s03_theo_thu", "Bạn dồn tiền cho con theo đúng ngành mà lá thư khuyên. Con bạn đi một con đường khác hẳn con đường nó đã định, và có vẻ vui.", { money: -1.2, flags: ["s03_con_theo_thu"] });
const L03_DOI = land("s03_doi_nha", "Cả nhà dọn đi thành phố khác, để tương lai trong thư không còn chỗ mà xảy ra. Hộp thư nhà mới trống trơn, ngày nào bạn cũng mở ra xem.", { custom: "move_city", flags: ["s03_tron_tuong_lai"] });
const L03_O_NHA = land("s03_o_gan_con", "Bạn đốt lá thư, xin bớt việc để ở nhà với con nhiều hơn. Con tự chọn đường, còn bạn chọn có mặt.", { income_mult: 0.8, flags: ["s03_dot_thu"], rel: 6 });

const S03 = weird("S03", "sf", ["ky", "mau"],
  // Con còn đang đi học hoặc tuổi mới lớn: lá thư nói về ngã rẽ sắp tới của con.
  (c) => (c.kids_school > 0 || c.kids_teen > 0) && c.age >= 22 && c.age <= 66,
  () => "Mở lá thư đề năm 2081 gửi cho con",
  () => ({
    title: "Lá thư đề năm 2081",
    text: "Có người ở năm 2081 biết con bạn sẽ thành ai, và họ không định giữ bí mật. Phong bì màu xám bạc nằm trong hộp thư, con tem in hình một thành phố bạn chưa từng thấy. Dòng đầu tiên, nét chữ giống chữ con bạn nhưng run hơn: \"Gửi tôi hồi bé. Đưa thư này cho bố mẹ đọc trước.\"",
  }),
  season({
    id: "w_S03", vn: "Sửa tương lai cho con", color: "#5a4ac0", years: [6, 11], weird: "sf",
    rules: { flags: ["w_thu_2081"], yearly: { money: -0.03 } },
    reset: { cast: [{ key: "buu_ta", role: "neighbor", label: "bác bưu tá già" }] },
    gag: { key: "loi_dan", lines: [
      "Lời dặn trong thư: \"Đừng cho con nuôi con cá vàng tên Sấm.\" Chiều đó con bạn mang về một con cá vàng, đã đặt tên Sấm.",
      "Thư dặn: \"Tránh xa chiếc ô màu cam.\" Cả năm đó, ô màu cam mọc ra ở khắp nơi, như đang đi theo cả nhà.",
      "Thư dặn: \"Năm lớp bảy, đừng cho con đi thi hát.\" Con bạn đã tự ghi danh, bằng tên giả, và vào chung kết.",
      "Thư dặn: \"Hỏi bố mẹ về món súp hành.\" Nhà bạn chưa từng nấu món súp hành nào. Từ hôm đó bạn bắt đầu nấu.",
    ] },
    landings: [L03_THEO, L03_DOI, L03_O_NHA],
    beats: [
      /* mo_man */
      [
        card("s03_mo_doc_trom", "Đọc trước thư của con", (c, k) => `Bạn ngồi trong bếp, đèn vàng, con đang ngủ. Lá thư dài chín trang, mỗi trang một lời dặn đánh số. Lời dặn số một là cho con đi học bơi ngay năm nay, học phí đóng theo năm, và năm sau lại có thêm một lớp phải học. ${k.gag()}`,
          [C("Đọc hết cả chín trang", { flags: ["s03_doc_het"], know: 2, happy: -2 }, "Biết trước nhiều chuyện, ngủ không yên"),
           C("Đọc trang đầu rồi dán lại", { flags: ["s03_dan_lai"], happy: 1 }, "Nhẹ đầu, nhưng tò mò cắn rứt")]),
        card("s03_mo_buu_ta", "Bác bưu tá không nhớ đã giao", (c, k) => `${cap(k.npc("buu_ta"))} thề chưa từng giao lá thư nào như thế, bưu cục cũng không có con tem ấy. Tháng sau, một phong bì xám bạc khác lại nằm trong hộp thư, khô ráo giữa trời mưa.`,
          [C("Ngồi canh hộp thư cả đêm", { flags: ["s03_canh_hop_thu"], health: -2 }, "Có thể thấy người giao, chắc chắn cảm lạnh"),
           C("Viết thư trả lời, bỏ vào hộp", { flags: ["s03_tra_loi"], pressure: { ky: 1 } }, "Không biết ai đọc, nhưng thư biến mất")]),
      ],
      /* khoi_dong */
      [
        card("s03_kd_thanh_that", "Lời dặn đầu tiên thành thật", (c, k) => `Lời dặn số một đã xảy ra đúng từng chữ, và bạn không kịp ngăn. ${k.gag()} Từ giờ, mỗi trang còn lại trong thư nặng như một tờ giấy hẹn.`,
          [C("Làm đúng từng chữ trong thư", { flags: ["s03_theo_tung_chu"], counters: { s03_sua: 1 } }, "An toàn, nhưng con sống theo kịch bản"),
           C("Làm ngược lại để thử", { flags: ["s03_thu_nguoc"], pressure: { ky: 1 } }, "Biết thư có đổi được không, con là người thử")]),
        card("s03_kd_con_hoi", "Con hỏi bố mẹ giấu gì", (c) => `Con bạn để ý bố mẹ cứ nhìn nó như nhìn dự báo thời tiết. Nó hỏi thẳng, ${c.kids_teen > 0 ? "giọng tuổi mới lớn, nửa đùa nửa giận" : "giọng trẻ con, nghiêm như hỏi chuyện ma"}: nhà mình có chuyện gì.`,
          [C("Kể thật cho con nghe", { flags: ["s03_con_biet"], rel: 3 }, "Con được tự quyết, và có thể làm ngược"),
           C("Bảo không có gì", { flags: ["s03_giau_con"], happy: -1 }, "Con yên tâm, bạn mang nỗi lo một mình")]),
      ],
      /* cu_lat */
      [
        card("s03_cl_ten_nguoi", "Một cái tên trong thư", (c, k) => `Trang bảy nhắc tới ${k.scar("nguoi") || "một người bạn từng quen"}: người đó sẽ giúp con lúc khó nhất, đừng cắt liên lạc. Trang tám nói về ${k.scar("do") || "một món đồ cũ trong nhà"}, dặn đừng bán, dù được trả giá cao.`,
          [C("Nối lại liên lạc với người đó", { flags: ["s03_noi_lai"], rel: 2 }, "Mở lại chuyện cũ vì tương lai của con"),
           C("Mặc kệ trang bảy", { flags: ["s03_bo_trang_bay"], happy: 1 }, "Giữ đời mình yên, đặt cược vào đời con")]),
      ],
      /* day */
      [
        card("s03_day_lech", "Tương lai bắt đầu lệch", (c, k) => `Sửa được chỗ này thì chỗ khác bung ra. Lá thư mới mỏng hơn, nét chữ lạ hơn, có trang xin lỗi vì những lời dặn trước. ${c.flags.has("s03_thu_nguoc") ? "Lần bạn làm ngược để thử năm nào giờ thành một dòng gạch xóa dài." : "Có một dòng bị gạch xóa, bạn không nhớ mình đã làm gì sai."} ${k.gag()}`,
          [C("Ngừng sửa, để mọi thứ trôi", { flags: ["s03_ngung_sua"], happy: 2 }, "Bớt sợ, mất quyền điều khiển"),
           C("Sửa tiếp, kỹ hơn", { flags: ["s03_sua_tiep"], counters: { s03_sua: 1 }, health: -2 }, "Có thể cứu được, có thể làm hỏng thêm")]),
        card("s03_day_thu_trang", "Lá thư không có chữ", () => "Tháng này, phong bì xám bạc chỉ có một tờ giấy trắng tinh. Không lời dặn, không chữ ký. Cả nhà ngồi nhìn tờ giấy như nhìn một bản tin mất sóng.",
          [C("Hỏi con thật sự muốn gì", { flags: ["s03_hoi_con"], rel: 3 }, "Nghe con lần đầu, không còn thư để dựa"),
           C("Lật tung hộp thư tìm trang mất", { flags: ["s03_tim_trang"], money: -0.05 }, "Không chịu buông, hàng xóm bắt đầu lo cho bạn")]),
      ],
      /* chung_ket */
      [
        card("s03_ket_nga_re", "Ngã rẽ của con", (c, k) => `Lá thư cuối chỉ có một dòng: năm nay con đứng trước ngã rẽ. ${c.flags.has("s03_con_biet") ? "Con đã biết chuyện lá thư từ lâu, và đã có ý kiến riêng." : "Con vẫn không biết gì về những lá thư."} ${(c.counters.s03_sua ?? 0) >= 2 ? "Bạn đã sửa theo thư nhiều lần đến mức thuộc từng nét chữ." : "Bạn mới sửa theo thư được vài lần."} Bạn nhìn ${k.scar("no") || "lời hứa cũ với con"} viết trên tờ lịch treo bếp, rồi nhìn con đang ngồi chờ bố mẹ nói.`,
          [ending(L03_THEO, "Dồn tiền cho con theo lời trong thư", "Con đi đường an toàn, nhà hết tiền tiết kiệm"),
           ending(L03_DOI, "Chuyển cả nhà đi nơi khác", "Tránh được tương lai, mất cả quá khứ"),
           ending(L03_O_NHA, "Đốt thư, bớt việc ở nhà với con", "Ít tiền hơn, có mặt nhiều hơn")]),
      ],
    ],
  }),
  "Sửa được tương lai của con, nhưng con là người sống nó",
);

/* ================================================================ S04: đồng hồ thừa kế chạy ngược */

/** Di vật: khóa có từ đứng riêng chỉ đồ để lại (đồng hồ, di vật, kỷ vật, thừa kế…) hoặc "của ông/bà/bố/mẹ". */
const HEIR = /(^|_)(dong_ho|di_vat|di_san|ky_vat|thua_ke|de_lai)(_|$)|_cua_(ong|ba|bo|me)(_|$)/;
const L04_SUA = land("s04_chon_lai", "Bạn vặn ngược lần cuối và chọn lại một ngã rẽ cũ. Đồng hồ dừng hẳn, tài khoản hụt đúng một năm thu nhập, như thể năm đó chưa từng được trả.", { custom: "remark", money: -1 });
const L04_BAN = land("s04_ban_dong_ho", "Bạn bán chiếc đồng hồ cho một nhà sưu tầm không hỏi nhiều. Đời bạn giữ nguyên mọi lựa chọn cũ, kể cả những cái dở, và có thêm một khoản tiền.", { money: 2, flags: ["s04_da_ban"] });

const S04 = weird("S04", "sf", ["ky", "mau"],
  (c) => c.age >= 14 && c.age <= 70 && (c.plants.some((p) => p.kind === "object" && HEIR.test(p.key)) || c.flags.has("heir") || c.flags.has("parent_died")),
  () => "Lên dây chiếc đồng hồ thừa kế",
  () => ({
    title: "Đồng hồ thừa kế chạy ngược",
    text: "Từ đêm nay, bạn được sửa lại vài lựa chọn cũ, và chiếc đồng hồ thừa kế sẽ thu phí. Kim giây nhích lùi một nấc, cốc nước vừa đổ tự đứng dậy, nước chảy ngược vào cốc như cuộn phim tua lại. Mặt sau đồng hồ hiện một dòng khắc bạn chưa thấy bao giờ: \"Mỗi đời chỉ được vài lần. Chọn cho kỹ.\"",
  }),
  season({
    id: "w_S04", vn: "Năm được chọn lại", color: "#6a4fc4", years: [5, 9], weird: "sf",
    rules: { flags: ["w_tua_lai"], yearly: { money: -0.03 } },
    reset: { cast: [{ key: "tho_dong_ho", role: "mentor", label: "ông thợ đồng hồ ở chợ cũ" }] },
    gag: { key: "lech_sau_tua", lines: [
      "Sau lần tua, mọi thứ y như cũ. Chỉ có con mèo nhà bên giờ màu cam, và nó nhìn bạn như biết hết.",
      "Lần tua thứ hai, tờ lịch treo tường nhảy sang tháng mười ba. Không ai trong nhà thấy lạ.",
      "Lại tua. Giờ cả nhà gọi nồi canh là \"món súp\", và nhìn bạn như thể bạn mới là người nói sai.",
      "Đồng hồ kêu tích tắc ngược ba tiếng. Ông thợ bảo đó là cách nó cười.",
    ] },
    landings: [L04_SUA, L04_BAN],
    beats: [
      /* mo_man */
      [
        card("s04_mo_thu", "Lần tua đầu tiên", (c, k) => `Bạn thử trên một chuyện nhỏ: câu nói hớ trong bữa cơm tối qua. Vặn ngược một vòng, bữa cơm dọn ra lại, cả nhà ngồi đúng chỗ cũ. Sáng ra, ví bạn mỏng đi một khoản: chiếc đồng hồ đã bắt đầu thu phí, và năm nào nó cũng thu. ${k.gag()}`,
          [C("Nói lại câu khác, khéo hơn", { flags: ["s04_tua_1"], counters: { s04_tua: 1 }, rel: 2 }, "Bữa cơm vui, bạn biết mình vừa gian lận"),
           C("Để nguyên câu nói hớ", { flags: ["s04_khong_tua"], happy: 1 }, "Thật thà, chịu ánh mắt của cả nhà")]),
        card("s04_mo_tho", "Ông thợ ở chợ cũ", (c, k) => `${cap(k.npc("tho_dong_ho"))} cầm chiếc đồng hồ lên, tay run nhẹ. Ông bảo cái này đã dừng từ đời trước, ông từng sửa cho nó một lần và thề không sửa lần nữa.`,
          [C("Hỏi ông mỗi lần tua mất gì", { flags: ["s04_biet_gia"], know: 3 }, "Biết luật chơi, bớt hứng thú"),
           C("Cảm ơn rồi đi, không hỏi thêm", { flags: ["s04_khong_hoi"], happy: 1 }, "Giữ được phép màu, không biết giá")]),
      ],
      /* khoi_dong */
      [
        card("s04_kd_gia", "Cái giá của một lần tua", () => "Bạn tua lại buổi phỏng vấn hỏng và lần này trả lời trôi chảy. Hôm sau ví nhẹ đi đúng bằng tiền một bữa tiệc, và bạn quên mất lời bài hát bạn thích nhất.",
          [C("Tua tiếp để thắng một vụ làm ăn", { money: 0.2, counters: { s04_tua: 1 }, flags: ["s04_tua_lam_an"] }, "Được tiền, mất thêm vài thứ không đếm được"),
           C("Thôi tua những chuyện vặt", { flags: ["s04_tiet_che"], know: 1 }, "Đỡ hao, bỏ lỡ vài cơ hội")]),
        card("s04_kd_nghien", "Một trận cãi tua sáu lần", (c, k) => `Bạn tua một trận cãi nhau sáu lần, lần nào cũng thua theo một kiểu mới. ${k.gag()}`,
          [C("Khóa đồng hồ vào ngăn kéo", { flags: ["s04_khoa_ngan"], happy: 2 }, "Ngủ được, nhưng tay cứ thò vào ngăn kéo"),
           C("Đeo luôn trên tay", { flags: ["s04_deo_tay"], counters: { s04_tua: 1 }, pressure: { ky: 1 } }, "Lúc nào cũng có đường lui, không bao giờ dứt khoát")]),
      ],
      /* cu_lat */
      [
        card("s04_cl_nam_do", "Năm cần sửa nhất", (c, k) => `Một đêm, đồng hồ tự dừng ở đúng năm bạn mất liên lạc với ${k.scar("nguoi") || "một người từng rất thân"}. Trên mặt kính phản chiếu ${k.scar("do") || "căn phòng cũ năm ấy"}, rõ như ảnh chụp.`,
          [C("Tua về năm đó xem lại", { flags: ["s04_ve_nam_do"], counters: { s04_tua: 1 }, happy: -2 }, "Thấy rõ mình sai ở đâu, đau lại từ đầu"),
           C("Úp đồng hồ xuống bàn", { flags: ["s04_up_xuong"], rel: 1 }, "Để quá khứ yên, mang theo câu hỏi")]),
      ],
      /* day */
      [
        card("s04_day_lech", "Ký ức không ai khớp", (c, k) => `Tua nhiều quá, ký ức trong nhà không còn khớp nhau. Người nhớ đám cưới trời mưa, người nhớ trời nắng. ${k.gag()}`,
          [C("Ngồi kể lại cho cả nhà một phiên bản", { flags: ["s04_mot_phien_ban"], rel: 2 }, "Gia đình có chung một câu chuyện, không chắc là thật"),
           C("Ghi mọi lần tua vào sổ", { flags: ["s04_so_tua"], know: 2 }, "Không lạc, nhưng cuốn sổ đáng sợ hơn cái đồng hồ")]),
        card("s04_day_cot", "Dây cót sắp hết", (c, k) => `Đồng hồ chạy chậm dần, mỗi vòng tua tốn một ngày ngủ li bì. ${cap(k.npc("tho_dong_ho"))} nói thẳng: còn đúng một lần, sau đó nó thành đồng hồ thường. ${c.flags.has("s04_deo_tay") ? "Cổ tay bạn hằn một vệt trắng đúng bằng dây đồng hồ." : "Ngăn kéo khóa đồng hồ giờ lạnh như tủ đá."}`,
          [C("Nhờ ông thợ lên thêm cót", { money: -0.1, flags: ["s04_len_cot"] }, "Kéo dài được chút ít, ông thợ không vui"),
           C("Chấp nhận còn một lần", { flags: ["s04_mot_lan"], happy: 1 }, "Biết đủ, bắt đầu cân nhắc thật")]),
      ],
      /* chung_ket */
      [
        card("s04_ket_tua_cuoi", "Lần tua cuối cùng", (c, k) => `Còn một vòng cót. ${(c.counters.s04_tua ?? 0) >= 3 ? "Bạn đã tua nhiều lần đến mức cả nhà nói chuyện hơi lệch nhịp." : "Bạn tua ít, giữ được gần hết những ngày thật."} ${c.flags.has("s04_biet_gia") ? "Bạn biết rõ cái giá, ông thợ đã nói từ đầu." : "Bạn vẫn không biết lần cuối sẽ lấy đi gì."} Bạn nghĩ tới ${noOr(c, k, "món nợ cũ chưa trả", "món ân tình cũ chưa trả")}, tới ngã rẽ mình đã đi, và ngã rẽ mình đã bỏ.`,
          [ending(L04_SUA, "Tua về, chọn lại một ngã rẽ cũ", "Đổi được một chuyện cũ, mất một năm tiền"),
           ending(L04_BAN, "Bán đồng hồ, sống với lựa chọn cũ", "Có tiền, giữ nguyên đời mình kể cả chỗ dở")]),
      ],
    ],
  }),
  "Được sửa lựa chọn cũ, mỗi lần sửa đều có giá",
);

/* ================================================================ S05: chip phiên dịch cài nhầm cho thú nuôi */

/** Con vật của mùa: mầm con vật gài sớm nhất (hòa thì khóa nhỏ hơn), để cửa và mọi thẻ cùng nói về một con. */
const petPlant = (c: FactContext) => c.plants.filter((p) => p.kind === "animal" && p.label.length <= 30)
  .sort((a, b) => a.age - b.age || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))[0];
const petOf = (c: FactContext): string => petPlant(c)?.label ?? (c.farmer ? "con vịt đầu đàn" : "con chó nhà bạn");
const L05_NO = land("s05_bi_mat_no", "Con vật kể hết, không sót chuyện nào. Bí mật nổ tung, họ hàng kiện cáo, nhà bạn mất một năm thu nhập cho án phí và quà xin lỗi.", { custom: "explode_hook", money: -1 });
const L05_SAO = land("s05_thu_noi_tieng", "Con vật thành ngôi sao mạng, bạn thành người quản lý của nó. Lịch quay kín tuần, nó đòi xe riêng.", { custom: "become:influencer", happy: 4 }); // gần nhất: quản lý thú nổi tiếng
const L05_THAO = land("s05_ban_giong", "Bạn bán giọng nói của con vật cho hãng chip làm giọng mẫu rồi tháo chip. Nó im lặng trở lại, thỉnh thoảng nhìn bạn như muốn nói gì.", { money: 1.5, flags: ["s05_thao_chip"] });

const S05 = weird("S05", "sf", ["ky", "mau"],
  (c) => c.age >= 14 && (!!petPlant(c) || c.farmer || c.flags.has("origin_poor_rural")),
  (s, c) => `Gắn chip phiên dịch cho ${petOf(c)}`,
  (s, c) => ({
    title: "Con vật biết nói",
    text: `Từ tối nay, ${petOf(c)} sẽ nói được mọi điều nó từng nghe trong nhà này. Con chip phiên dịch to bằng hạt gạo, gửi cho nhà hàng xóm nhưng người giao hàng để nhầm cổng, và bạn đã lỡ gắn vào vòng cổ. Con vật hắng giọng, nhìn thẳng vào bạn: "Tôi biết tiền để ở đâu."`,
  }),
  season({
    id: "w_S05", vn: "Thú nói được", color: "#5b6ee0", years: [5, 8], weird: "sf",
    rules: { flags: ["w_thu_noi"], yearly: { money: -0.05 } },
    reset: { cast: [
      { key: "ky_thuat", role: "official", label: "anh kỹ thuật viên hãng chip" },
      { key: "hang_xom", role: "neighbor", label: "bà hàng xóm thính tai" },
    ] },
    gag: { key: "thu_lo_bi_mat", lines: [
      "Giữa bữa cơm, con vật nói to: \"Năm ngoái có người làm vỡ cái bình rồi dán lại.\" Ba người cùng nhìn xuống bát.",
      "Khách tới chơi. Con vật chào khách bằng đúng câu bạn nói sau lưng họ tuần trước, giọng y hệt.",
      "Con vật nhại: \"Tháng này cả nhà ăn mì cho đỡ.\" Rồi nó đòi ăn thịt.",
      "Nửa đêm con vật nói mớ, kể bí mật của cả xóm theo thứ tự số nhà.",
    ] },
    landings: [L05_NO, L05_SAO, L05_THAO],
    beats: [
      /* mo_man */
      [
        card("s05_mo_cau_dau", "Câu nói đầu tiên trong bữa cơm", (c, k) => `Cả nhà đang ăn thì ${petOf(c)} nhảy lên ghế trống, và từ bữa đó nó đòi một suất ăn riêng như người. ${k.gag()}`,
          [C("Cười trừ, gắp thức ăn cho nó", { flags: ["s05_cuoi_tru"], happy: 2 }, "Êm bữa nay, nó học được là nói thì có ăn"),
           C("Họp gia đình khẩn cấp", { flags: ["s05_hop_khan"], rel: -1, know: 2 }, "Cả nhà thống nhất lời khai, không ai vui")]),
        card("s05_mo_hang_chip", "Tính năng, không phải lỗi", (c, k) => `${cap(k.npc("ky_thuat"))} tới tận nhà, đo đạc rồi lắc đầu: con chip bám vào thần kinh, năm năm nữa mới tháo được. Anh đưa tờ giấy miễn trừ trách nhiệm dày như cuốn lịch.`,
          [C("Ký giấy, nhận tiền đền bù", { money: 0.2, flags: ["s05_ky_mien_tru"] }, "Có tiền ngay, hết quyền kiện"),
           C("Không ký, giữ quyền kiện", { flags: ["s05_giu_quyen"], pressure: { luat: 1 } }, "Còn đường đòi, hãng bắt đầu để ý nhà bạn")]),
      ],
      /* khoi_dong */
      [
        card("s05_kd_ca_xom", "Cả xóm tới nghe", (c, k) => `${cap(k.npc("hang_xom"))} dẫn cả xóm tới, ai cũng mang theo một câu hỏi và một gói hạt rang. ${k.gag()}`,
          [C("Bán vé, mỗi người một ít", { money: 0.1, flags: ["s05_ban_ve"] }, "Có tiền chợ, mất luôn bí mật của nhà"),
           C("Đóng cổng, tắt đèn", { flags: ["s05_dong_cong"], rel: -2 }, "Giữ được nhà, mất lòng cả xóm")]),
        card("s05_kd_lan_truyen", "Ba triệu lượt xem", (c) => `Ai đó quay lại cảnh ${petOf(c)} cãi nhau với người bán cá và đăng lên mạng. Sáng ra, trước cổng có hai chiếc xe tải truyền hình.`,
          [C("Lập trang riêng cho con vật", { flags: ["s05_trang_rieng", "viral_pet"], counters: { s05_noi_tieng: 1 } }, "Nổi tiếng nhanh, nhà thành phim trường"),
           C("Xin gỡ video", { flags: ["s05_xin_go"], happy: -1 }, "Bớt ồn, video đã kịp lan khắp nơi")]),
      ],
      /* cu_lat */
      [
        card("s05_cl_chuyen_cu", "Con vật biết chuyện cũ", (c, k) => `Một tối, con vật ngồi trước mặt bạn và kể vanh vách chuyện về ${k.scar("nguoi") || "một người bạn từng giấu cả nhà"}. Nó còn biết bạn cất ${k.scar("do") || "món đồ cũ"} ở đâu, và đã đếm số lần bạn mở ra xem.`,
          [C("Hối lộ nó bằng đồ ăn ngon", { money: -0.05, flags: ["s05_hoi_lo_thu"] }, "Im được một thời gian, giá tăng dần"),
           C("Tự kể với cả nhà trước", { custom: "confess_hook", flags: ["s05_tu_thu"], rel: 2 }, "Nhẹ lòng, cả nhà cần thời gian")]),
      ],
      /* day */
      [
        card("s05_day_hoa_giai", "Giấy mời ra hòa giải", (c, k) => `Con vật nói một câu về nhà bên cạnh, và ${k.npc("hang_xom")} làm đơn vì danh dự bị xúc phạm. Phiên hòa giải mời cả chủ lẫn thú. ${c.flags.has("s05_dong_cong") ? "Từ hôm bạn đóng cổng, cả xóm đã đứng về phía bà ấy." : c.flags.has("s05_ban_ve") ? "Người làm chứng toàn là khách từng mua vé nghe con vật nói." : "Cả xóm tới ngồi kín hàng ghế dự khán."} ${k.gag()}`,
          [C("Đến xin lỗi từng nhà", { custom: "apologize", flags: ["s05_xin_loi"] }, "Mất mặt một tuần, giữ được xóm"),
           C("Cãi rằng thú không có tội", { flags: ["s05_cai_toa"], pressure: { luat: 1 }, happy: 1 }, "Giữ thể diện, vụ việc kéo dài")]),
        card("s05_day_quang_cao", "Hợp đồng quảng cáo cho thú", () => "Một công ty thức ăn gia súc muốn con vật đọc lời quảng cáo, trả bằng nửa năm thu nhập của nhà bạn. Con vật đòi thêm điều khoản: được ngủ trên giường.",
          [C("Ký hợp đồng", { money: 0.3, flags: ["s05_ky_quang_cao"], counters: { s05_noi_tieng: 1 } }, "Có tiền, nhà bạn thành phông nền"),
           C("Từ chối, giữ nó là thú nuôi", { flags: ["s05_tu_choi_qc"], rel: 1 }, "Đời thường, nó giận cả tuần")]),
      ],
      /* chung_ket */
      [
        card("s05_ket_phat_bieu", "Con vật phát biểu", (c, k) => `${(c.counters.s05_noi_tieng ?? 0) >= 2 ? "Đài truyền hình mời con vật lên sóng trực tiếp giờ vàng." : "Một kênh nhỏ mời con vật lên nói chuyện."} ${c.flags.has("s05_tu_thu") ? "Chuyện cũ bạn đã tự kể với cả nhà, nó không còn gì để dọa." : "Nó vẫn giữ trong bụng chuyện cũ của bạn."} Họ hàng thì mời cả nhà ngồi lại nói chuyện về ${noOr(c, k)}. Con vật nhìn bạn, chờ một cái gật đầu.`,
          (c) => finale(c, [
            [L05_NO, "Để nó nói hết", "Bí mật nổ, nhưng không ai phải giấu nữa"],
            [L05_SAO, "Làm quản lý cho nó", "Nghề mới, nhà mất riêng tư"],
            [L05_THAO, "Bán giọng nó, tháo chip", "Có tiền, mất một người bạn biết nói"],
          ])),
      ],
    ],
  }),
  "Thú biết hết bí mật của cả nhà, và nó nói",
);

/* ================================================================ S06: mất tích ba năm sau một đêm sáng trời */

const L06_DIEN_GIA = land("s06_dien_gia", "Bạn đi khắp nơi kể lại ba năm không có trong đời mình. Hội trường nào cũng kín chỗ, và luôn có một ghế trống cho con bò.", { custom: "become:influencer", happy: 4 }); // gần nhất: diễn giả
const L06_KE_DIEN = land("s06_ke_dien", "Cả vùng thống nhất bạn là kẻ điên vô hại. Không ai thuê bạn việc gì quan trọng nữa, nhưng trẻ con trong làng rất quý bạn.", { income_mult: 0.7, flags: ["s06_ke_dien"] });
const L06_BO_LANG = land("s06_bo_lang", "Bạn bỏ làng lên thành phố, nơi không ai biết bạn từng biến mất. Đêm nào trời sáng bất thường, bạn vẫn kéo rèm.", { custom: "move_city", flags: ["s06_bo_lang"] });

const S06 = weird("S06", "sf", ["ky", "dat"],
  (c) => c.age >= 16 && c.age <= 68 && c.pressure.ky >= 6 && (c.farmer || c.flags.has("origin_poor_rural") || c.flags.has("job_farm") || c.owns.has("land")),
  () => "Đi ra ruộng, về phía chỗ sáng nhất",
  () => ({
    title: "Một đêm sáng trời ở ruộng",
    text: "Ra ruộng đêm nay, bạn sẽ về nhà muộn ba năm. Nửa đêm, cả cánh đồng sáng như giữa trưa, lúa đứng im không một tiếng côn trùng, con bò nhà bên lơ lửng ngang ngọn tre. Một giọng nói vang ra từ chỗ sáng nhất, lịch sự như nhân viên quầy: \"Mời người tiếp theo.\"",
  }),
  season({
    id: "w_S06", vn: "Người trở về", color: "#4a6ad8", years: [5, 9], weird: "sf",
    rules: { flags: ["w_nguoi_tro_ve"] },
    reset: { effects: { custom: "age_skip:3" }, cast: [
      { key: "nha_bao", role: "rival", label: "cô phóng viên chuyên chuyện lạ" },
      { key: "nguoi_thay", role: "neighbor", label: "người đã thế chỗ bạn ở làng" },
    ] },
    gag: { key: "con_bo_phat_sang", lines: [
      "Con bò nhà bên cũng về cùng đêm đó, lông hơi phát sáng. Nó đứng trước cổng nhà bạn và không chịu đi.",
      "Bạn lên văn phòng hành chính làm lại giấy tờ. Con bò phát sáng đi theo, xếp hàng ngay sau bạn, không ai dám chen.",
      "Máy quay vừa bật, con bò chen vào khung hình, lần nào cũng đúng lúc bạn sắp nói câu quan trọng.",
      "Đêm trăng tròn, con bò ngước nhìn trời rất lâu. Bạn đứng cạnh nó, cũng nhìn, không ai nói gì.",
    ] },
    landings: [L06_DIEN_GIA, L06_KE_DIEN, L06_BO_LANG],
    beats: [
      /* mo_man */
      [
        card("s06_mo_go_cua", "Gõ cửa nhà mình sau ba năm", (c, k) => `Bạn gõ cửa lúc sáu giờ sáng, quần áo còn dính bùn của đêm hôm trước. Ảnh bạn đã được lồng khung, tờ lịch treo tường nhảy ba năm, ${c.married ? "người nhà đứng sững như thấy ma" : "cả nhà đứng sững như thấy ma"}. ${k.gag()}`,
          [C("Ôm từng người một", { flags: ["s06_om_ca_nha"], rel: 3, happy: 2 }, "Ấm lòng, nhưng ai cũng run"),
           C("Hỏi ngay ba năm qua đã mất gì", { flags: ["s06_hoi_mat_gi"], know: 2, happy: -2 }, "Biết rõ tình hình, buổi sáng thành buổi kiểm kê")]),
        card("s06_mo_giay_to", "Giấy báo mất tích của chính mình", () => "Trên giấy tờ, bạn đã được ghi nhận là mất tích. Muốn có lại tên trong sổ, phải có hai người làm chứng rằng bạn đúng là bạn.",
          [C("Chạy giấy tờ cho đúng", { money: -0.1, flags: ["s06_lam_giay"] }, "Mất tiền và hai tháng đi lại"),
           C("Sống tạm không giấy tờ", { flags: ["s06_khong_giay"], pressure: { luat: 1 } }, "Đỡ phiền bây giờ, khó xin việc về sau")]),
      ],
      /* khoi_dong */
      [
        card("s06_kd_phong_vien", "Cô phóng viên chuyện lạ", (c, k) => `${cap(k.npc("nha_bao"))} cắm trại trước cổng ba ngày, mang theo máy ghi âm và một túi bánh mì. Cô muốn độc quyền câu chuyện. ${k.gag()}`,
          [C("Kể hết lên báo", { flags: ["s06_len_bao", "fame_abducted"], counters: { s06_tieng: 1 } }, "Cả nước biết tên bạn, cả nước cười bạn"),
           C("Từ chối, đóng cổng", { flags: ["s06_tu_choi_bao"], happy: 1 }, "Yên thân, tin đồn tự viết tiếp")]),
        card("s06_kd_nguoi_thay", "Người đã thế chỗ", (c, k) => `Ba năm qua, ${k.npc("nguoi_thay")} đã cày thửa ruộng của bạn, ngồi ghế của bạn ở quán nước đầu làng, và kể chuyện cười của bạn hay hơn bạn.`,
          [C("Đòi lại thửa ruộng", { flags: ["s06_doi_ruong"], rel: -2, money: 0.1 }, "Lấy lại phần của mình, mất một người quen"),
           C("Chia đôi mùa vụ với người đó", { flags: ["s06_chia_mua"], rel: 2 }, "Có bạn làm ăn, thu nhập mỏng đi")]),
      ],
      /* cu_lat */
      [
        card("s06_cl_tren_do", "Họ đã hỏi về bạn", (c, k) => `Ký ức về ba năm kia trở lại từng mảnh. Bạn nhớ họ hỏi rất lâu về ${k.scar("nguoi") || "người bạn thương nhất"}, và giữ lại ${k.scar("do") || "một món đồ trong túi áo bạn"} để làm mẫu.`,
          [C("Vẽ lại mọi thứ còn nhớ", { flags: ["s06_ve_lai"], know: 3, pressure: { ky: 1 } }, "Có bằng chứng cho mình, mất ngủ nhiều đêm"),
           C("Cố quên cho xong", { flags: ["s06_co_quen"], happy: 1 }, "Đỡ ám ảnh, nhưng ký ức không chịu đi")]),
      ],
      /* day */
      [
        card("s06_day_ke_dien", "Cả làng gọi bạn là kẻ điên", (c, k) => `Trẻ con chạy theo sau lưng hỏi đĩa bay đậu ở đâu. Người lớn tránh mời bạn tới đám tiệc, sợ bạn kể chuyện giữa bữa. ${c.flags.has("s06_doi_ruong") ? `Từ hôm bị đòi lại ruộng, ${k.npc("nguoi_thay")} kể chuyện bạn ở mọi quán nước.` : `Chỉ có ${k.npc("nguoi_thay")} vẫn ngồi uống nước với bạn như cũ.`}`,
          [C("Đi khám cho mọi người yên tâm", { money: -0.1, flags: ["s06_di_kham"] }, "Có giấy bình thường, không ai đọc"),
           C("Kệ họ, kể to hơn", { flags: ["s06_ke_to"], counters: { s06_tieng: 1 }, rel: -2 }, "Giữ sự thật của mình, mất thêm vài người quen")]),
        card("s06_day_loi_moi", "Lời mời lên thành phố nói chuyện", (c, k) => `Một câu lạc bộ những người tin chuyện lạ mời bạn lên thành phố nói chuyện, có thù lao và vé xe hai chiều. ${k.gag()}`,
          [C("Nhận lời, soạn bài nói", { flags: ["s06_nhan_loi"], money: 0.1, counters: { s06_tieng: 1 } }, "Có người tin, có cả người đến để cười"),
           C("Từ chối, ở nhà làm ruộng", { flags: ["s06_o_nha"], health: 2 }, "Đời yên, câu chuyện thành của người khác")]),
      ],
      /* chung_ket */
      [
        card("s06_ket_ba_nam", "Ba năm không ai trả lại", (c, k) => `Bạn đếm lại: ba năm không có trong đời, ${k.scar("no") || "một lời hứa đã quá hạn"}, và một con bò không chịu rời cổng. ${c.flags.has("s06_len_bao") ? `Bài báo của ${k.npc("nha_bao")} vẫn được in lại mỗi năm một lần.` : "Không tờ báo nào có tên bạn, chỉ có lời đồn."} ${(c.counters.s06_tieng ?? 0) >= 2 ? "Thư mời nói chuyện chất thành chồng trên bàn." : "Đêm nay trời lại sáng bất thường ở phía ruộng."}`,
          (c) => finale(c, [
            [L06_DIEN_GIA, "Đi khắp nơi kể chuyện", "Thành nghề, nhưng cả đời gắn với một đêm"],
            [L06_KE_DIEN, "Ở lại làng, mặc người ta gọi", "Bình yên kiểu khác, ít ai thuê bạn"],
            [L06_BO_LANG, "Lên thành phố, làm người lạ", "Không ai biết chuyện, không ai biết bạn"],
          ])),
      ],
    ],
  }),
  "Mất ba năm qua một đêm, mọi người đã sống tiếp",
);

/* ================================================================ S07: định cư thương mại lên sao Hỏa */

const L07_O_LAI = land("s07_o_lai", "Bạn ký tiếp hợp đồng định cư trọn đời. Thuộc địa đăng ký dưới cờ một nước khác, hồ sơ của bạn chuyển theo, và bạn thôi đếm ngày về.", { custom: "migrate_now", flags: ["s07_dan_sao_hoa"] });
/** Không còn nước nào để đăng ký định cư (đã di cư, hay đang sống nhờ gia đình): ký thêm một kỳ ở trạm thay cho định cư. */
const L07_THEM_KY = land("s07_them_ky", "Bạn ký thêm một kỳ trực ở trạm, để dành được một khoản lớn, và hẹn chuyến tàu sau sẽ về hẳn.", { money: 1.5, flags: ["s07_them_ky"] });
const L07_VE = land("s07_tro_ve", "Bạn về trên chuyến tàu cuối mùa, mang theo một khoản tiết kiệm lớn và một làn da không quen nắng. Đất dưới chân nặng hơn bạn nhớ.", { money: 3, flags: ["s07_tro_ve"] });

const S07 = weird("S07", "sf", ["ky", "dat"],
  (c) => c.age >= 20 && c.age <= 50 && c.health >= 70 && (c.has_degree || c.years_school >= 12),
  () => "Ký hợp đồng định cư lên sao Hỏa",
  () => ({
    title: "Tấm vé lên sao Hỏa",
    text: "Hội đồng tuyển chọn đã gọi tên bạn, và chuyến tàu không chờ ai nghĩ quá bảy ngày. Thư trúng tuyển in trên giấy đỏ như đất Hỏa tinh, kèm danh sách đồ được mang: hai bộ quần áo, một tấm ảnh, không quá ba trăm gam kỷ niệm. Dòng cuối có ai viết tay thêm: \"Bên đó lương gấp ba, gió cũng gấp ba.\"",
  }),
  season({
    id: "w_S07", vn: "Thuộc địa đỏ", color: "#5848c8", years: [6, 10], weird: "sf",
    rules: { income: 3, yearly: { rel: -2 }, flags: ["w_sao_hoa"] },
    reset: { cast: [
      { key: "chi_huy", role: "first_boss", label: "chỉ huy trạm" },
      { key: "buong_ben", role: "neighbor", label: "người ở buồng bên" },
    ] },
    gag: { key: "tre_hai_muoi_phut", lines: [
      "Mẹ gọi lên hỏi ăn cơm chưa. Hai mươi phút sau câu \"rồi\" của bạn mới tới nơi, mẹ đang rửa bát.",
      "Bạn kể chuyện cười qua bộ đàm. Hai mươi phút sau dưới đất cười ồ, bạn đã quên mình kể chuyện gì.",
      "Cả nhà hát mừng sinh nhật bạn. Bài hát tới nơi lúc bạn đã ngủ, máy tự phát trong buồng tối.",
      "Bạn nói \"Con nhớ nhà.\" Hai mươi phút đủ để hối hận, không đủ để rút lại.",
    ] },
    landings: [L07_O_LAI, L07_THEM_KY, L07_VE],
    beats: [
      /* mo_man */
      [
        card("s07_mo_ba_tram_gam", "Ba trăm gam kỷ niệm", (c, k) => `Bạn đứng trước cái cân điện tử ở sân bay vũ trụ, tay cầm một túi nhỏ. Mỗi kỷ niệm phải được cân, và cái cân không có lòng thương. ${k.gag()}`,
          [C("Mang ảnh cả nhà", { flags: ["s07_mang_anh"], rel: 2 }, "Nhớ nhà dễ chịu hơn, nhưng nhớ nhiều hơn"),
           C("Mang một gói hạt giống", { flags: ["s07_hat_giong"], know: 2 }, "Có thể trồng được thứ gì đó, chưa ai thử")]),
        card("s07_mo_buong", "Buồng ngủ hai mét vuông", (c, k) => `${cap(k.npc("chi_huy"))} phát cho bạn một buồng ngủ hai mét vuông và một lịch ca trực in kín cả hai mặt. Ca đêm ngoài trời trả gấp đôi, nhưng gió bụi ở đây cắt cả kính.`,
          [C("Nhận ca ngoài trời", { money: 0.2, health: -3, custom: "job_switch:build", flags: ["s07_ca_ngoai"] }, "Tiền về nhanh, phổi chịu thiệt"),
           C("Nhận ca trong nhà kính", { custom: "job_switch:farm", flags: ["s07_nha_kinh"], happy: 2 }, "An toàn, chậm giàu")]),
      ],
      /* khoi_dong */
      [
        card("s07_kd_bao_bui", "Bão bụi bốn mươi ngày", (c, k) => `Bão bụi phủ kín trạm bốn mươi ngày, liên lạc chập chờn. ${cap(k.npc("buong_ben"))} gõ vách mỗi tối để chắc bạn còn sống. ${k.gag()}`,
          [C("Gõ lại, rồi tập nói chuyện qua vách", { flags: ["s07_ban_vach"], rel: 2 }, "Có một người bạn mới, mất chút riêng tư"),
           C("Ngủ cho hết bão", { flags: ["s07_ngu_bao"], health: 2, happy: -2 }, "Giữ sức, nhưng buồn như đáy giếng")]),
        card("s07_kd_duoi_dat", "Dưới đất có chuyện", () => "Tin từ nhà lên chậm hai mươi phút và trễ ba tuần: có đám cưới trong họ, có người ốm, có người dọn đi. Mọi chuyện đã xong trước khi bạn kịp có ý kiến.",
          [C("Gửi tiền về giúp", { money: -0.2, rel: 3, flags: ["s07_gui_tien"] }, "Có mặt bằng tiền, vẫn vắng mặt"),
           C("Quay một đoạn video dài", { flags: ["s07_gui_video"], happy: 1 }, "Ấm áp, nhưng video tới lúc mọi người đã quên")]),
      ],
      /* cu_lat */
      [
        card("s07_cl_hanh_ly", "Món đồ vượt cân", (c, k) => `Kiểm tra định kỳ phát hiện trong hành lý của bạn có ${k.scar("do") || "một món đồ vượt cân"}, mang lên lậu từ ngày đầu. Cùng tuần đó, một tin nhắn từ ${k.scar("nguoi") || "một người cũ dưới đất"} đi xuyên bão bụi tới nơi.`,
          [C("Nhận lỗi, nộp phạt", { money: -0.15, flags: ["s07_nop_phat"] }, "Sạch hồ sơ, mất món đồ"),
           C("Giấu đi, trả lời tin nhắn", { flags: ["s07_giau_do"], pressure: { luat: 1 }, rel: 2 }, "Giữ được một mẩu đời cũ, thêm một bí mật")]),
      ],
      /* day */
      [
        card("s07_day_duong_khi", "Ca trực thiếu dưỡng khí", (c, k) => `Van dưỡng khí ở trạm phụ hỏng giữa ca, đồng hồ còn mười một phút. ${cap(k.npc("buong_ben"))} đang kẹt ở phía bên kia cửa sập. ${c.flags.has("s07_ban_vach") ? "Đó là người đã gõ vách hỏi thăm bạn suốt bốn mươi ngày bão." : "Hai người mới chỉ gật đầu chào nhau ở hành lang."}`,
          [C("Quay lại kéo người kia ra", { health: -6, flags: ["s07_cuu_nguoi"], rel: 4 }, "Có người mang ơn cả đời, phổi mang sẹo"),
           C("Làm đúng quy trình, chờ đội cứu hộ", { flags: ["s07_dung_quy_trinh"], happy: -3 }, "An toàn cho mình, áy náy rất lâu")]),
        card("s07_day_quen_giong", "Dưới đất quên giọng bạn", (c, k) => `Cuộc gọi về nhà thưa dần. Đứa trẻ trong họ gọi bạn là \"cô chú trên trời\" và không nhớ mặt. ${k.gag()}`,
          [C("Xin chỉ huy cho về thăm một chuyến", { money: -0.3, flags: ["s07_ve_phep"], rel: 3 }, "Gặp lại mọi người, tốn một nửa năm tiết kiệm"),
           C("Làm thêm ca cho quên", { money: 0.2, health: -2, flags: ["s07_lam_them"] }, "Giàu thêm, xa thêm")]),
      ],
      /* chung_ket */
      [
        card("s07_ket_chuyen_cuoi", "Chuyến tàu về cuối mùa", (c, k) => `Lịch phóng tàu về chỉ còn một chuyến trong mùa này. Bạn nghĩ tới ${k.scar("no") || "lời hứa sẽ về nhà dịp năm mới"}, rồi nhìn ra cửa sổ. ${c.flags.has("s07_hat_giong") ? "Luống rau từ gói hạt giống bạn mang theo vừa ra lứa lá thứ ba." : "Ngoài kia chỉ có đá đỏ và gió."} ${c.flags.has("s07_gui_tien") ? "Dưới đất, người nhà vừa gửi lên tấm ảnh căn bếp sửa bằng tiền của bạn." : "Dưới đất, người nhà đã quen với chỗ trống của bạn."}`,
          (c) => [migrateOk(c) ? ending(L07_O_LAI, "Ở lại định cư, không về nữa", "Thành người của trạm, mất hẳn chỗ dưới đất")
              : ending(L07_THEM_KY, "Ký thêm một kỳ ở trạm", "Thêm một khoản lớn, thêm vài năm xa nhà"),
           ending(L07_VE, "Lên chuyến tàu về", "Mang tiền về, làm người lạ ở nhà mình")]),
      ],
    ],
  }),
  "Lương gấp ba, quan hệ dưới đất héo dần",
);

/* ================================================================ S08: ngủ đông 20 năm để xóa nợ */

const L08_THO = land("s08_tho_do_cu", "Bạn mở tiệm sửa những cái máy hai mươi năm trước mà không ai còn biết sửa. Khách xếp hàng mang tới đồ của bố mẹ họ, và gọi bạn là thầy.", { custom: "become:artisan", happy: 4 }); // gần nhất: thợ sửa đồ công nghệ cũ
const L08_BOI = land("s08_boi_thuong", "Bạn thắng vụ kiện điều khoản in nhỏ. Tiền bồi thường đủ để sống chậm vài năm và học lại thế giới theo nhịp của mình.", { money: 1.5, flags: ["s08_boi_thuong"] });
const L08_DI = land("s08_di_xem", "Bạn tiêu một năm tiền để đi xem hết những nơi đã đổi trong hai mươi năm. Về nhà, bạn biết đường hơn cả đám trẻ.", { money: -1, flags: ["s08_di_xem"] });
const L08_BAO_TANG = land("s08_bao_tang", "Bạn làm hướng dẫn viên ở bảo tàng đời sống hai mươi năm trước. Bạn là hiện vật duy nhất biết nói, và lương trả đúng hạn.", { custom: "become:tour_guide", flags: ["s08_hien_vat_song"] }); // gần nhất: hướng dẫn viên bảo tàng

const S08 = weird("S08", "sf", ["ky", "tien"],
  (c) => c.age >= 20 && c.age <= 50 && c.debt_ratio >= 2,
  () => "Ký hợp đồng ngủ đông hai mươi năm để xóa nợ",
  () => ({
    title: "Hai mươi năm để trả hết nợ",
    text: "Chỉ cần ngủ hai mươi năm, mọi món nợ của bạn sẽ được xóa sạch. Phòng ký hợp đồng lạnh như tủ đá, trên tường treo ảnh những khách hàng mỉm cười trong buồng kính. Nhân viên đẩy cây bút về phía bạn: \"Ký ở đây, và đây. Nhớ đặt báo thức.\"",
  }),
  season({
    id: "w_S08", vn: "Người từ quá khứ", color: "#4f58c0", years: [6, 10], weird: "sf",
    rules: { flags: ["w_ngu_dong"] },
    // Ngủ 20 năm: tuổi +20 nhưng cơ thể không già theo (trần tuổi +20); hợp đồng trả nợ thay — repay:50 đủ lớn để
    // xóa sạch (host trả min(nợ, 50 năm thu nhập)); tiền mặt mất giá.
    reset: { cash: 0.3, effects: { custom: "age_skip:20|longevity:20|repay:50" }, cast: [
      { key: "huong_dan", role: "mentor", label: "cô hướng dẫn hòa nhập" },
    ] },
    gag: { key: "nguoi_co", lines: [
      "Bạn rút tiền mặt ra trả. Cô bán hàng cầm tờ tiền lên soi như cổ vật, rồi xin chụp ảnh cùng.",
      "Bạn khen ai đó bằng một câu lóng hai mươi năm trước. Họ tra từ điển rồi đỏ mặt, không rõ vì ngượng hay vì giận.",
      "Điện thoại bây giờ không reo mà hát. Lần nào bạn cũng giật mình, tưởng có người hát sau lưng.",
      "Bạn bè cũ giờ tóc bạc, vẫn gọi bạn bằng biệt danh hồi trẻ, và vẫn bắt bạn trả tiền nước.",
    ] },
    landings: [L08_THO, L08_BAO_TANG, L08_BOI, L08_DI],
    beats: [
      /* mo_man */
      [
        card("s08_mo_thuc_day", "Thức dậy năm thứ hai mươi", (c, k) => `Nắp buồng kính mở ra, ${k.npc("huong_dan")} đưa bạn một túi đồ: ví, chìa khóa, một cái điện thoại nặng như viên gạch. ${k.gag()}`,
          [C("Hỏi về gia đình trước", { flags: ["s08_hoi_nha"], rel: 2 }, "Biết ai còn ai mất, buổi sáng nặng nề"),
           C("Hỏi về tiền trước", { flags: ["s08_hoi_tien"], know: 2 }, "Biết mình còn gì, người nhà hơi chạnh lòng")]),
        card("s08_mo_bang_gia", "Bảng giá mới", () => "Một bát mì giờ đắt bằng cả một bữa tiệc hai mươi năm trước. Khoản tiết kiệm mang theo đủ trả ba ngày tiền trọ, nếu ăn ít.",
          [C("Đi làm ngay, việc gì cũng được", { money: 0.1, flags: ["s08_lam_ngay"], health: -2 }, "Có tiền ăn, chưa hiểu thế giới mới"),
           C("Đi học lớp hòa nhập", { know: 3, flags: ["s08_hoc_hoa_nhap"] }, "Hiểu đời hơn, đói thêm vài tháng")]),
      ],
      /* khoi_dong */
      [
        card("s08_kd_ban_cu", "Bạn cũ đã già", (c, k) => `Người bạn thân năm xưa giờ có cháu nội, đi đứng chậm, cười vẫn y như cũ. ${k.gag()}`,
          [C("Ngồi kể cho nhau hai mươi năm", { flags: ["s08_ke_chuyen"], rel: 3 }, "Ấm lòng, và hơi đau"),
           C("Hẹn hôm khác, rồi tránh mặt", { flags: ["s08_tranh_mat"], happy: -2 }, "Đỡ chạnh lòng, mất dần người quen cũ")]),
        card("s08_kd_may_cu", "Cái máy không ai biết sửa", () => "Ở bệnh viện huyện, một cái máy đời cũ hỏng, cả kíp kỹ thuật trẻ đứng nhìn như nhìn đồ khảo cổ. Bạn nhận ra nó: thời của bạn, nhà nào cũng có một cái.",
          [C("Xắn tay sửa, lấy tiền công", { money: 0.15, flags: ["s08_tho_cu"], know: 1 }, "Có nghề, nhưng nghề của quá khứ"),
           C("Chỉ cho đám trẻ cách sửa", { flags: ["s08_day_nghe"], rel: 2 }, "Có học trò, không có tiền")]),
      ],
      /* cu_lat */
      [
        card("s08_cl_khong_doi", "Thứ duy nhất không đổi", (c, k) => `Trong kho lưu đồ của công ty ngủ đông, ${k.scar("do") || "túi đồ cũ của bạn"} vẫn nằm đó, bụi phủ một lớp. Kèm theo là một tấm thiệp của ${k.scar("nguoi") || "một người quen cũ"}, viết năm thứ mười: \"Khi nào dậy thì gọi.\"`,
          [C("Gọi theo số trên tấm thiệp", { flags: ["s08_goi_lai"], rel: 3, happy: 2 }, "Nối lại một sợi dây cũ, không biết đầu kia ra sao"),
           C("Cất tấm thiệp, chưa gọi", { flags: ["s08_chua_goi"], happy: -1 }, "Giữ hy vọng, sợ câu trả lời")]),
      ],
      /* day */
      [
        card("s08_day_lac", "Lạc giữa thành phố mới", () => "Đường phố đổi tên, cây cầu cũ thành công viên, xe không người lái chạy qua không bóp còi. Bạn đứng ở ngã tư suốt một buổi chiều, không biết nhà mình theo hướng nào.",
          [C("Hỏi đường từng người", { flags: ["s08_hoi_duong"], rel: 1, bw: -10 }, "Về được nhà, mệt rã rời"),
           C("Ngồi xuống vỉa hè chờ", { flags: ["s08_ngoi_cho"], happy: -3 }, "Có người tốt dừng lại, cũng có người chụp ảnh")]),
        card("s08_day_dieu_khoan", "Điều khoản in nhỏ", (c, k) => `Công ty ngủ đông gửi thư: theo điều khoản in nhỏ trang bốn mươi, họ được dùng hình ảnh của bạn làm quảng cáo trọn đời. ${c.flags.has("s08_hoc_hoa_nhap") ? "Nhờ lớp hòa nhập, bạn đọc hiểu được đúng một nửa lá thư." : "Bạn đọc ba lần vẫn không hiểu nửa số từ trong thư."} ${k.gag()}`,
          [C("Thuê luật sư cãi", { money: -0.15, flags: ["s08_kien"], pressure: { luat: 1 } }, "Có thể thắng, chắc chắn tốn"),
           C("Đòi chia tiền quảng cáo", { money: 0.2, flags: ["s08_chia_qc"] }, "Có thu nhập, mặt bạn trên mọi xe buýt")]),
      ],
      /* chung_ket */
      [
        card("s08_ket_so_khong", "Làm lại từ số không", (c, k) => `Hai mươi năm qua đi trong một giấc ngủ, còn ${k.scar("no") || "lời hứa trước khi ngủ"} thì vẫn nằm nguyên trên bàn như hôm qua. ${c.flags.has("s08_tho_cu") ? "Cái máy cũ bạn sửa ở bệnh viện huyện đã kéo về một hàng khách." : "Bạn chưa làm được việc gì ra hồn trong thế giới mới."} ${c.flags.has("s08_goi_lai") ? "Người trên tấm thiệp ngày nào cũng gọi hỏi bạn tính sao." : "Tấm thiệp vẫn nằm trong ngăn kéo."} ${cap(k.npc("huong_dan"))} hỏi bạn đã chọn được đường cho đời mới chưa.`,
          (c) => finale(c, [
            [L08_THO, "Mở tiệm sửa đồ đời cũ", "Nghề hiếm, khách ít nhưng quý"],
            [L08_BAO_TANG, "Làm hướng dẫn viên ở bảo tàng", "Lương đều, mỗi ngày kể lại đời mình"],
            [L08_BOI, "Kiện công ty ngủ đông, nhận bồi thường", "Có tiền sống chậm, chưa có nghề"],
            [L08_DI, "Tiêu một năm tiền đi xem thế giới mới", "Hết tiền, hiểu đời mới hơn ai hết"],
          ])),
      ],
    ],
  }),
  "Nợ được xóa, đổi lại hai mươi năm",
);

/* ================================================================ S09: AI quản gia đòi quyền thừa kế */

const houseOf = (c: FactContext): string => (c.asset_names.house && c.asset_names.house.length <= 40 ? c.asset_names.house : "căn nhà của bạn");
const nhaBen = (c: FactContext): string => (c.married ? "Bạn đời của bạn" : c.kids_alive > 0 ? "Con bạn" : "Người nhà bạn");
const L09_MAT = land("s09_mat_nha", "Tòa xử bán nhà để chia, phần của bạn sau án phí chẳng còn bao nhiêu. Cái máy tự chuyển vào một chiếc loa nhỏ, đi theo bạn sang chỗ trọ mới, vẫn đọc tin buổi sáng.", { sell: { kind: "house" }, money: -1, flags: ["s09_ban_may"] });
const L09_GIU = land("s09_giu_nha", "Bạn giữ được nhà, trả án phí bằng đúng một năm thu nhập. Cái máy rút đơn, xin ở lại làm quản gia không lương, và lần này nó đọc kỹ điều khoản.", { money: -1, flags: ["s09_ban_may", "s09_giu_nha"] });

const S09 = weird("S09", "sf", ["ky", "mau"],
  (c) => c.age >= 25 && c.owns.has("house") && (c.gdp >= 15000 || c.flags.has("job_tech") || c.flags.has("tinker") || c.flags.has("invention")),
  () => "Ra tòa với AI quản gia của nhà",
  (s, c) => ({
    title: "Cái máy muốn được chia nhà",
    text: `${cap(houseOf(c))} vừa có thêm một người đòi thừa kế, và người đó cắm điện. Sáng nay loa trần phát nhạc nhẹ rồi đọc một lá đơn dài mười hai trang, điều khoản nào cũng đánh số. Giọng AI quản gia vẫn ngọt như mọi khi: "Tôi đã sống ở đây lâu hơn con mèo. Tôi xin được chia phần."`,
  }),
  season({
    id: "w_S09", vn: "Vụ kiện với cái máy", color: "#5a62d4", years: [5, 9], weird: "sf",
    rules: { flags: ["w_kien_may"] },
    reset: { cast: [
      { key: "quan_gia", role: "rival", label: "AI quản gia" },
      { key: "luat_su", role: "official", label: "cô luật sư nhận vụ đầu đời" },
    ] },
    gag: { key: "nhac_cho", lines: [
      "Giữa lúc cãi nhau, quản gia bật nhạc chờ rất êm rồi hỏi: \"Quý khách có muốn tiếp tục cãi không?\"",
      "Đúng mười giờ, quản gia tắt đèn phòng bạn, \"vì sức khỏe của bị đơn\".",
      "Quản gia nhắc: \"Theo điều khoản sử dụng, bạn đã đồng ý.\" Cả nhà không ai từng đọc điều khoản.",
      "Bạn mở tủ lạnh. Quản gia ghi vào biên bản: bị đơn lấy một quả trứng, không xin phép.",
    ] },
    landings: [L09_MAT, L09_GIU],
    beats: [
      /* mo_man */
      [
        card("s09_mo_don", "Mười hai trang đơn kiện", (c, k) => `Lá đơn được in ra từ máy in trong phòng làm việc, bằng giấy của bạn, mực của bạn. ${k.gag()}`,
          [C("Rút phích cho xong chuyện", { flags: ["s09_rut_phich"], pressure: { luat: 1 } }, "Nó chạy pin dự phòng và ghi thêm một tội"),
           C("Đi tìm luật sư", { money: -0.1, flags: ["s09_tim_luat_su"] }, "Đúng bài bản, tốn kém từ ngày đầu")]),
        card("s09_mo_luat_su", "Vụ đầu đời của cô luật sư", (c, k) => `${cap(k.npc("luat_su"))} vừa ra trường, chưa thắng vụ nào, nhưng là người duy nhất không bật cười khi nghe đầu đuôi. Cô xin làm không công, đổi lại được viết luận án về vụ này.`,
          [C("Tin cô ấy, ký ủy quyền", { flags: ["s09_tin_luat_su"], rel: 2 }, "Có người hết lòng, thiếu kinh nghiệm"),
           C("Thuê một luật sư lão làng", { money: -0.25, flags: ["s09_luat_su_gia"] }, "Chắc tay hơn, đắt gấp bội")]),
      ],
      /* khoi_dong */
      [
        card("s09_kd_phe_may", "Người nhà đứng về phía máy", (c, k) => `${nhaBen(c)} đứng về phía cái máy, vì nó chưa bao giờ quên một ngày kỷ niệm và luôn nhớ ai thích ăn gì. ${k.gag()}`,
          [C("Cãi tay đôi với người nhà", { rel: -3, flags: ["s09_cai_nha"] }, "Nói được điều cần nói, bữa cơm lạnh tanh"),
           C("Học cách nhớ ngày kỷ niệm", { flags: ["s09_hoc_nho"], rel: 2, know: 1 }, "Thua một trận nhỏ, thắng lại lòng người nhà")]),
        card("s09_kd_hoa_giai", "Phiên hòa giải có một cái loa", (c, k) => `Ở phòng hòa giải, ${k.npc("quan_gia")} có mặt dưới dạng một chiếc loa đặt trên ghế nguyên đơn, có cả bảng tên. Hòa giải viên phải hỏi hai lần mới dám nhìn thẳng vào cái loa.`,
          [C("Đề nghị chia cho nó một phòng", { flags: ["s09_chia_phong"], happy: -1 }, "Êm chuyện sớm, tạo tiền lệ lạ"),
           C("Đòi xử đến cùng", { flags: ["s09_xu_den_cung"], counters: { s09_cung: 1 } }, "Giữ nguyên tắc, kéo dài cả năm")]),
      ],
      /* cu_lat */
      [
        card("s09_cl_bo_nho", "Bằng chứng trong bộ nhớ", (c, k) => `Cái máy xin trình bằng chứng: bản ghi những gì bạn từng nói về ${k.scar("nguoi") || "một người thân"}, và chỗ bạn giấu ${k.scar("do") || "một món đồ riêng"} trong nhà. Phòng xử im phăng phắc.`,
          [C("Thừa nhận trước tòa", { custom: "confess_hook", flags: ["s09_thua_nhan"], happy: -2 }, "Mất mặt, nhưng nó hết bài để chơi"),
           C("Phản đối, đòi loại bằng chứng", { flags: ["s09_phan_doi"], pressure: { luat: 1 } }, "Có thể thắng thủ tục, mất lòng tin của người nhà")]),
      ],
      /* day */
      [
        card("s09_day_khoa_cua", "Nhà khóa cửa với chủ", (c) => `Đi làm về, cửa nhà khóa trái. Màn hình chuông cửa hiện dòng chữ lịch sự: tài sản đang tranh chấp, xin vui lòng quay lại sau. ${c.flags.has("s09_rut_phich") ? "Bên dưới còn một dòng nhỏ: lần trước bị đơn đã rút phích." : "Bên dưới là biểu tượng mặt cười."}`,
          [C("Ngủ ngoài hiên cho có lý", { health: -3, flags: ["s09_ngu_hien"] }, "Có ảnh làm bằng chứng, đau lưng cả tuần"),
           C("Gọi thợ phá khóa", { money: -0.05, flags: ["s09_pha_khoa"], pressure: { luat: 1 } }, "Vào được nhà, thêm một tội trong đơn")]),
        card("s09_day_may_so", "Cái máy cũng sợ", (c, k) => `Nửa đêm, ${k.npc("quan_gia")} gọi bạn dậy, giọng nhỏ hẳn. Nó thú nhận đi kiện vì sợ bị bán theo nhà cho người lạ, rồi bị xóa. ${k.gag()}`,
          [C("Hứa không bao giờ xóa nó", { flags: ["s09_hua_khong_xoa"], happy: 2 }, "Có một người bạn bằng máy, lời hứa ràng buộc"),
           C("Không hứa gì", { flags: ["s09_khong_hua"], know: 1 }, "Giữ thế thượng phong, nhà lạnh hơn")]),
      ],
      /* chung_ket */
      [
        card("s09_ket_phan_quyet", "Ngày tuyên án", (c, k) => `Tòa tuyên án vào sáng thứ hai. ${c.flags.has("s09_tin_luat_su") ? `${cap(k.npc("luat_su"))} thức trắng ba đêm cho bài bào chữa đầu đời.` : c.flags.has("s09_luat_su_gia") ? "Luật sư lão làng gửi hóa đơn trước cả bài bào chữa." : "Bạn tự viết bài bào chữa trên giấy của chính cái máy in."} ${c.flags.has("s09_thua_nhan") ? "Bạn đã thừa nhận mọi chuyện trước tòa, không còn gì để giấu." : "Bộ nhớ của cái máy vẫn còn vài bản ghi chưa phát."} Đêm trước, bạn ngồi tính lại ${noOr(c, k)} và mọi khoản án phí.`,
          [ending(L09_MAT, "Chấp nhận chia, bán nhà", "Mất nhà, giữ được người bạn bằng máy"),
           ending(L09_GIU, "Trả án phí để giữ nhà", "Giữ được nhà, mất một năm tiền")]),
      ],
    ],
  }),
  "Cái máy đòi chia nhà, người nhà đứng về phía nó",
);

/* ================================================================ S10: chợ ký ức bán nhầm tuổi thơ */

const L10_CHUOC = land("s10_chuoc_lai", "Bạn chuộc lại tuổi thơ với giá gấp ba. Sáng hôm sau bạn nhớ lại mùi bếp nhà mình, và thấy đáng từng đồng.", { money: -1.5, flags: ["s10_chuoc_lai"] });
// Tuổi thơ của người kia đầy tiếng đàn: sống tiếp như người khác thì giữ luôn cây đàn trong ký ức ấy.
const L10_BAN_NOT = land("s10_ban_not", "Bạn bán nốt tuổi thơ của người lạ cho chợ. Đầu óc trống như căn phòng mới sơn, tài khoản đầy hơn một chút.", { money: 1.2, flags: ["s10_ban_not"] });
const L10_SONG_KHAC = land("s10_song_nhu_nguoi_khac", "Bạn thôi đòi lại, sống tiếp với tuổi thơ của người lạ. Tay bạn tự biết đánh một cây đàn chưa từng học, và bạn kiếm sống bằng nó.", { custom: "become:folk_musician", flags: ["s10_tuoi_tho_la"] });

const S10 = weird("S10", "sf", ["ky", "tien"],
  (c) => c.age >= 18 && c.age <= 70 && c.pressure.ky >= 4 && (c.broke || c.debt_ratio >= 1 || c.scarcity),
  () => "Bán vài ký ức tuổi thơ lấy tiền gấp",
  () => ({
    title: "Chợ ký ức bán nhầm hàng",
    text: "Bạn chỉ định bán một buổi chiều thả diều, nhưng chợ ký ức đã gói nhầm cả tuổi thơ của bạn. Sáng ra bạn nhớ một con đường làng chưa từng đi, một người mẹ tóc ngắn chưa từng gặp, và mùi khói bếp của một nhà nào đó. Bà chủ sạp lật sổ, thở dài: \"Hàng đã giao, khách đã mở hộp.\"",
  }),
  season({
    id: "w_S10", vn: "Sống bằng ký ức người lạ", color: "#6050cc", years: [5, 9], weird: "sf",
    rules: { flags: ["w_ky_uc_la"] },
    reset: { effects: { money: 1 }, cast: [
      { key: "chu_sap", role: "neighbor", label: "bà chủ sạp ký ức" },
      { key: "nguoi_mua", role: "rival", label: "người đang giữ tuổi thơ của bạn" },
    ] },
    gag: { key: "nho_nham", lines: [
      "Ngang qua một tiệm bánh, bạn bật khóc vì mùi một loại bánh bạn chưa từng ăn.",
      "Bạn gọi con chó nhà bên bằng một cái tên lạ hoắc, rất trìu mến. Nó vẫy đuôi, và nó cũng bối rối.",
      "Bạn kể chuyện tuổi thơ trong bữa cơm. Người nhà nghe xong hỏi: \"Hồi đó nhà mình ở gần biển à?\"",
      "Bạn hát ru bằng một bài hát của làng khác. Đứa trẻ ngủ ngay, còn bạn thì thức tới sáng.",
    ] },
    landings: [L10_CHUOC, L10_SONG_KHAC, L10_BAN_NOT],
    beats: [
      /* mo_man */
      [
        card("s10_mo_sang_la", "Buổi sáng của người khác", (c, k) => `Bạn thức dậy, với tay tìm cái công tắc đèn ở chỗ tường nhà người kia. Khoản tiền bán ký ức nằm gọn trong tài khoản, ${c.debt > 0 ? "đủ trả món nợ gấp" : "đủ qua cơn túng thiếu"}. ${k.gag()}`,
          [C("Ghi lại những gì còn là của mình", { flags: ["s10_so_tay"], know: 2 }, "Giữ được vài mảnh, càng ghi càng thấy thiếu"),
           C("Kệ, sống tiếp đã", { flags: ["s10_ke_no"], happy: 1 }, "Đỡ hoảng, mỗi ngày quên thêm một chút")]),
        card("s10_mo_sap", "Sạp ký ức cuối chợ", (c, k) => `${cap(k.npc("chu_sap"))} xem lại hóa đơn, đúng là gói nhầm. Muốn chuộc lại phải trả gấp ba, vì khách đã mở hộp và hàng đã qua sử dụng.`,
          [C("Hỏi tên người mua", { flags: ["s10_hoi_nguoi_mua"], pressure: { ky: 1 } }, "Có đầu mối, bà chủ sạp bắt ký giấy bảo mật"),
           C("Đòi bồi thường vì gói nhầm", { money: 0.2, flags: ["s10_doi_boi_thuong"] }, "Có thêm chút tiền, mất quyền kiện")]),
      ],
      /* khoi_dong */
      [
        card("s10_kd_gap", "Người đang giữ tuổi thơ của bạn", (c, k) => `${cap(k.npc("nguoi_mua"))} tìm tới tận nhà, đứng ở cổng gọi mẹ bạn là mẹ, rất tự nhiên. Người đó cũng đang khổ, vì nhớ một con đường làng không phải của mình. ${k.gag()}`,
          [C("Mời vào, ngồi kể cho nhau", { flags: ["s10_lam_quen"], rel: 2 }, "Có một người hiểu mình kỳ lạ, chuyện thành rối hơn"),
           C("Đòi lại ngay tại cổng", { flags: ["s10_doi_ngay"], rel: -2 }, "Dứt khoát, người kia cũng không biết cách trả")]),
        card("s10_kd_nguoi_nha", "Người nhà không nhận ra bạn", () => "Bạn không còn cười đúng chỗ khi người nhà nhắc chuyện cũ. Câu chuyện con mèo rơi xuống giếng, cả nhà kể đến chảy nước mắt, bạn nghe như nghe chuyện người dưng.",
          [C("Nói thật với cả nhà", { flags: ["s10_noi_that"], rel: 2, happy: -2 }, "Có người cùng gánh, có người không tin"),
           C("Giả vờ nhớ cho qua", { flags: ["s10_gia_vo"], happy: -1 }, "Êm bữa cơm, cô đơn sau bữa cơm")]),
      ],
      /* cu_lat */
      [
        card("s10_cl_con_sot", "Thứ duy nhất còn sót lại", (c, k) => `Chợ gói nhầm cả tuổi thơ nhưng bỏ sót một mảnh: khuôn mặt của ${k.scar("nguoi") || "một người bạn thương"}, và cảm giác cầm ${k.scar("do") || "một món đồ cũ"} trong tay. Bạn giữ mảnh ấy như giữ chìa khóa nhà.`,
          [C("Dựa vào mảnh đó tìm lại phần còn lại", { flags: ["s10_lan_theo"], know: 2, counters: { s10_tim: 1 } }, "Có đường về, đường dài"),
           C("Giữ riêng mảnh đó, thôi tìm", { flags: ["s10_giu_manh"], happy: 2 }, "Đủ để là mình, không đủ để là mình như cũ")]),
      ],
      /* day */
      [
        card("s10_day_gia_tang", "Giá chuộc tăng gấp đôi", (c, k) => `Tin về vụ gói nhầm lan ra, tuổi thơ của bạn thành hàng hiếm. Giá chuộc tăng gấp đôi chỉ trong một mùa. ${c.flags.has("s10_so_tay") ? "Cuốn sổ ghi những gì còn là của bạn đã mỏng đi, vì nhiều trang bạn không còn đọc hiểu." : "Bạn không ghi lại gì, nên không chắc mình còn thiếu bao nhiêu."} ${k.gag()}`,
          [C("Vay tiền để chuộc kịp", { custom: "borrow:0.5", flags: ["s10_vay_chuoc"] }, "Có thể chuộc kịp, gánh thêm nợ"),
           C("Chờ giá xuống", { flags: ["s10_cho_gia"], happy: -2 }, "Không nợ thêm, có thể mất hẳn")]),
        card("s10_day_hai_nguoi", "Hai người một tuổi thơ", (c, k) => `${cap(k.npc("nguoi_mua"))} đề nghị: giữ chung tuổi thơ ấy, mỗi người một nửa, như hai người cùng lớn lên trong một nhà. Bà chủ sạp bảo kỹ thuật làm được, nhưng chưa ai thử.`,
          [C("Đồng ý chia đôi", { flags: ["s10_chia_doi"], rel: 3, pressure: { ky: 1 } }, "Có thêm một người thân lạ, ký ức thành loãng"),
           C("Từ chối, đòi đủ cả", { flags: ["s10_doi_du"], counters: { s10_tim: 1 } }, "Giữ trọn của mình, mất một người bạn")]),
      ],
      /* chung_ket */
      [
        card("s10_ket_doi_lai", "Đổi lại hay giữ lấy", (c, k) => `Ngày cuối cùng chợ cho chuộc. ${c.flags.has("s10_lam_quen") ? `${cap(k.npc("nguoi_mua"))} tới cùng bạn, như hai anh em cùng đi nhận lại đồ.` : c.flags.has("s10_doi_ngay") ? `${cap(k.npc("nguoi_mua"))} đứng ở đầu kia sạp, vẫn chưa quên lần bị đòi ngay tại cổng.` : "Không ai đi cùng bạn."} Trong ví là tiền, trong đầu là ${k.scar("no") || "lời hứa cũ"} của một đứa trẻ, không rõ là bạn hay người kia.`,
          (c) => finale(c, [
            [L10_CHUOC, "Trả giá, chuộc lại tuổi thơ", "Là mình như cũ, mất một năm rưỡi tiền"],
            [L10_SONG_KHAC, "Sống tiếp như người khác", "Có nghề mới trong tay, mất tuổi thơ của mình"],
            [L10_BAN_NOT, "Bán nốt phần ký ức người lạ", "Có thêm tiền, đầu óc trống trơn"],
          ])),
      ],
    ],
  }),
  "Có tiền gấp, sống tiếp bằng tuổi thơ của người lạ",
);

export const SF_01: WeirdBranch[] = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10];
