/**
 * Nhánh kỳ dị S41–S50 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 *
 * Mỗi nhánh: when ("Mọc từ") → trigger → mùa 8 thẻ (2-2-1-2-1), 1 gag ≥ 3 dòng, 2 người mới, 3 vết
 * (cu_lat dùng người/đồ, chung kết dùng nợ), chung kết đọc cờ/bộ đếm của các nhịp trước.
 * Landing nghề chỉ mở khi tuổi ≤ ages[1] + 5 của con đường (lựa chọn chung kết dựng theo c.age).
 */
import type { Choice, FactContext, Plant } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import { C, cap, card, ending, land, season, weird } from "../kit.ts";

const has = (c: FactContext, f: string): boolean => c.flags.has(f);
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;

/* ================================================================== S41 — Nhà ở hai nơi */

const S41_DANH = land("s41_nguoi_ke_chuyen", "Bạn thành người kể chuyện của căn nhà hai hành tinh, mỗi tối lên mạng với hàng chục nghìn người xem.", { custom: "become:influencer", happy: 4 });
const S41_VE = land("s41_quay_ve", "Cổng nhà bạn có quầy vé, có giờ mở cửa, có sổ khách. Tiền vé đủ sống thong thả nhiều năm.", { money: 2.5, happy: 2 });
const S41_BAN = land("s41_ban_nha", "Bạn bán căn nhà cho một quỹ bảo tàng và dọn lên thành phố, mang theo đúng một chậu xương rồng.", { sell: { kind: "house" }, custom: "move_city", money: 1 });

const s41: WeirdBranch = weird("S41", "sf", ["danh", "ky"],
  (c) => c.age >= 18 && c.age <= 70 && c.owns.has("house") && c.pressure.danh >= 2,
  () => "Mở cổng cho khách hành hương vào xem nhà",
  (s, c) => ({
    title: "Căn nhà trên hành tinh khác",
    text: `Nếu bức ảnh này là thật, ${c.asset_names.house ?? "căn nhà của bạn"} sẽ không bao giờ còn là của riêng bạn. Tàu thăm dò gửi về từ một hành tinh đỏ tấm ảnh mờ: đúng căn nhà ấy, đúng ô cửa sổ nứt một góc, đúng sợi dây phơi chéo qua sân. Sáng nay người lạ đứng kín ngõ ở ${s.noi || "nơi này"}, tay cầm hoa. Một bà cụ nắm chặt tay bạn: "Cho tôi sờ cái cửa sổ một cái thôi."`,
  }),
  season({
    id: "w_S41", vn: "Nhà ở hai nơi", color: "#4a6fd1", years: [6, 10], weird: "sf",
    rules: { flags: ["w_nha_hai_noi"] },
    reset: { cast: [{ key: "chu_doan", role: "rival", label: "người trưởng đoàn hành hương" }, { key: "thien_van", role: "mentor", label: "cô nhà thiên văn trẻ" }] },
    gag: { key: "anh_moi", lines: [
      "Ảnh mới từ tàu thăm dò: căn nhà bên kia có một chậu xương rồng ở bậc cửa. Chiều đó, khách mang tới bảy chậu xương rồng.",
      "Ảnh mới: căn nhà bên kia sơn lại cửa màu xanh. Có người xin sơn cửa nhà bạn cho khớp, mang sẵn cả cọ.",
      "Ảnh mới: trên mái căn nhà bên kia có cái ăng-ten cong. Nửa đêm, ăng-ten nhà bạn bị ai đó bẻ cong hộ.",
      "Ảnh mới: cửa sổ căn nhà bên kia sáng đèn. Cả đoàn khách đứng nín thở chờ đèn nhà bạn bật.",
    ] },
    landings: [S41_DANH, S41_VE, S41_BAN],
    beats: [
      /* mo_man */
      [
        card("s41_mo_anh", "Bức ảnh lúc sáu giờ sáng", (c, k) => `Sáu giờ sáng, điện thoại rung không ngớt: bức ảnh đã lên bản tin, và ai cũng nhận ra ô cửa sổ nứt nhà bạn. Trước cổng ở ${k.noi} đã có hai mươi người đứng chờ, vài người mặc áo in hình căn nhà. ${k.gag()}`,
          [C("Mở cửa cho mọi người xem", { flags: ["s41_mo_cua"], happy: 2, counters: { s41_khach: 1 } }, "Vui, nhưng nhà không còn là chỗ riêng"),
           C("Kéo rèm, không trả lời ai", { flags: ["s41_kin"], happy: -1 }, "Giữ được yên, tin đồn tự mọc thêm")]),
        card("s41_mo_doan", "Bốn mươi cái mũ giống nhau", (c, k) => `${cap(k.npc("chu_doan"))} dẫn tới bốn mươi người đội mũ giống hệt nhau, xin ngủ một đêm trong sân "cho gần căn nhà kia hơn". ${has(c, "s41_kin") ? "Họ đã đứng ngoài rèm nhà bạn suốt ba ngày." : "Họ đã vào xem nhà bạn từ hôm trước và chưa ai muốn về."} Mỗi người kẹp nách một cái gối hơi.`,
          [C("Thu tiền chỗ ngủ, mỗi người một ít", { money: 0.15, flags: ["s41_thu_tien"], counters: { s41_khach: 1 } }, "Có tiền, mang tiếng buôn căn nhà"),
           C("Cho ở miễn phí một đêm", { rel: 2, flags: ["s41_mien_phi"], counters: { s41_khach: 2 } }, "Được thương, sân thành bãi cắm trại")]),
      ],
      /* khoi_dong */
      [
        card("s41_kd_may_do", "Cái máy trên mái nhà", (c, k) => `${cap(k.npc("thien_van"))} trèo lên mái nhà bạn với một cái máy đo to bằng cái nồi, xin đặt ở đó vài năm. Nếu hai căn nhà thật sự giống nhau, cái máy sẽ bắt được tiếng vọng từ bên kia mỗi đêm. "Khoa học không có tiền thuê mái đâu," cô nói trước, rất nhanh.`,
          [C("Cho đặt máy, không lấy tiền", { flags: ["s41_may"], know: 3 }, "Có đồng minh khoa học, mái nhà thành phòng thí nghiệm"),
           C("Đòi ký hợp đồng thuê mái", { money: 0.2, flags: ["s41_hop_dong"] }, "Có tiền đều, cô ấy lạnh nhạt hẳn", { tier: "awakened" }),
           C("Từ chối, mái nhà là của nhà", { flags: ["s41_khong_may"], happy: 1 }, "Yên mái, mất một người đứng về phía bạn")]),
        card("s41_kd_ngo", "Con ngõ thành chợ", (c, k) => `Ba tháng sau, con ngõ trước nhà đã thành chợ: bán nước, bán mô hình căn nhà, bán cả "đất từ sân nhà thật" mà bạn không nhớ đã bán cho ai. ${has(c, "s41_thu_tien") ? "Hàng xóm nói bạn thu tiền được thì họ cũng thu được." : "Hàng xóm nói bạn hiền quá nên họ phải thu tiền hộ."} ${k.gag()}`,
          [C("Chia sân cho hàng xóm cùng bán", { rel: 3, flags: ["s41_chia"] }, "Xóm vui, nhà bạn ồn đến khuya"),
           C("Rào cổng, bán vé theo giờ", { money: 0.3, flags: ["s41_rao"], counters: { s41_ghet: 1 } }, "Tiền vào đều, hàng xóm bắt đầu ghét"),
           C("Lập tổ quản lý chung cho cả ngõ", { flags: ["s41_to_chung"], know: 2, rel: 1 }, "Mệt vì họp, nhưng không ai thiệt", { tier: "sovereign" })]),
      ],
      /* cu_lat */
      [
        card("s41_cl_anh_chin", "Bức ảnh thứ chín", (c, k) => `Bức ảnh thứ chín phóng to được bậc thềm căn nhà bên kia: trên đó là dấu vết rõ mồn một của thứ bạn mang theo từ đời cũ: ${k.scar("do") || "một món đồ bạn tưởng đã mất từ lâu"}. Cả nước bàn tán. Tối đó, ${k.scar("nguoi") || "một người quen cũ"} gọi cho bạn lần đầu sau nhiều năm: "Cái đó là chuyện của hai đứa mình mà."`,
          [C("Kể hết chuyện cũ lên bản tin", { flags: ["s41_ke"], counters: { s41_danh: 2 }, happy: -2 }, "Nổi hơn nữa, đời tư thành của chung"),
           C("Hẹn gặp riêng người cũ", { flags: ["s41_gap_cu"], rel: 3 }, "Gỡ được một nút cũ, bỏ lỡ tin nóng"),
           C("Xin viện công bố toàn bộ ảnh gốc", { flags: ["s41_cong_bo"], know: 3 }, "Sự thật trước, danh tiếng tính sau", { tier: "sovereign" })]),
      ],
      /* day */
      [
        card("s41_day_mai", "Mái nhà sụt một góc", (c, k) => `Đêm mưa lớn, mái nhà sụt một góc vì quá nhiều khách trèo lên chụp ảnh "cho giống góc tàu thăm dò". ${has(c, "s41_may") ? `Cái máy đo của ${k.npc("thien_van")} lăn xuống sân, vẫn kêu tít tít.` : "Nước chảy thẳng xuống giường bạn ngủ."} ${k.gag()}`,
          [C("Vay tiền sửa mái cho chắc", { custom: "borrow:0.5", flags: ["s41_vay"] }, "Nhà lành, gánh thêm một khoản nợ"),
           C("Để nguyên, khách thích mái dột", { happy: -3, counters: { s41_khach: 1 } }, "Không nợ, ngủ cạnh cái chậu hứng nước")]),
        card("s41_day_tin_don", "Tin đồn ảnh ghép", (c, k) => `${cap(k.npc("chu_doan"))} lên mạng tuyên bố căn nhà bên kia thật ra giống nhà mình hơn, và ảnh nhà bạn là ảnh ghép. Một nửa số khách kéo sang ngõ bên. ${n(c, "s41_ghet") > 0 ? "Hàng xóm bị bạn rào cổng hôm trước gật gù rất nhiệt tình." : "Hàng xóm đứng giữa hai ngõ, chưa biết theo ai."}`,
          [C("Lên truyền hình đối chất", { counters: { s41_danh: 1 }, health: -2, flags: ["s41_doi_chat"] }, "Thắng thì nổi hơn, thua thì thành trò cười"),
           C("Im lặng, để số liệu tự nói", { flags: ["s41_im"], happy: 1 }, "Đỡ mệt, khách bớt dần")]),
      ],
      /* chung_ket */
      [
        card("s41_ket", "Tấm ảnh cuối cùng", (c, k) => `${cap(k.scar("no") || "khoản tiền sửa nhà")} vẫn chưa trả xong thì tàu thăm dò gửi về tấm ảnh cuối cùng trước khi hết pin. ${k.gag()} ${cap(k.npc("chu_doan"))} hỏi thẳng trước mặt mọi người: từ giờ căn nhà này là của ai? ${has(c, "s41_ke") ? "Cả nước đã biết chuyện cũ của bạn, nên ai cũng nghĩ mình có phần." : "Bạn chưa từng kể với ai câu chuyện thật của căn nhà."}`,
          (c) => {
            const ve = ending(S41_VE, "Mở quầy bán vé, có giờ có giấc", "Tiền đều, nhà thành nơi tham quan");
            const ban = ending(S41_BAN, "Bán nhà cho bảo tàng, dọn đi", "Có tiền và yên tĩnh, mất chỗ đã gắn bó");
            const out: Choice[] = has(c, "s41_gap_cu") || has(c, "s41_kin") ? [ban, ve] : [ve, ban];
            if (c.age >= 16 && c.age <= 45) {
              const danh = ending(S41_DANH, "Làm người kể chuyện của căn nhà", "Nổi tiếng thật, đời tư thành nghề");
              if (n(c, "s41_danh") >= 2) out.unshift(danh); else out.push(danh);
            }
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: nhà bạn có ở hai nơi, khách kéo đến cả hai");

/* ================================================================== S42 — Người bán mưa */

const S42_GIAU = land("s42_ban_mua", "Bạn giữ hợp đồng làm mưa thêm nhiều mùa. Nhà xây lại, ruộng thuê thêm, cả vùng gọi bạn là người bán mưa.", { money: 3, happy: 2 });
const S42_KIEN = land("s42_ra_toa", "Vụ kiện kéo dài hai năm. Bạn bồi thường cho cả vùng, trả lại máy và mất luôn chỗ làm.", { money: -2, custom: "job_lose", happy: -4 });
const S42_NONG = land("s42_nong_moi", "Bạn trả máy, giữ lại con mắt biết đọc mây, mở trang trại tưới tiêu kiểu mới.", { custom: "become:agritech", happy: 3 });

const s42: WeirdBranch = weird("S42", "sf", ["tien", "dat", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && c.farmer && (c.debt > 0 || c.loans > 0),
  () => "Ký hợp đồng làm mưa cho cả vùng",
  (s) => ({
    title: "Trúng thầu làm mưa",
    text: `Bạn bỏ thầu làm mưa cho vui, và giờ cả vùng sống chết theo lịch mưa của bạn. Chiếc xe tải chở cái máy to bằng chuồng bò đỗ giữa ${s.noi || "nơi này"}, kèm tờ giấy trúng thầu đóng ba con dấu. Anh kỹ sư leo xuống, phủi bụi: "Mây ở đâu thì tôi không biết, nhưng nút bấm thì ở đây."`,
  }),
  season({
    id: "w_S42", vn: "Người bán mưa", color: "#3f7fbf", years: [6, 11], weird: "sf",
    rules: { income: 1.3, flags: ["w_ban_mua"] },
    reset: { cast: [{ key: "ky_su", role: "partner", label: "anh kỹ sư máy mưa" }, { key: "chu_tich", role: "official", label: "ông chủ tịch hội nông dân" }] },
    gag: { key: "giot_dau", lines: [
      "Mây kéo về đúng giờ hẹn. Giọt mưa đầu tiên rơi trúng sào quần áo vừa phơi của nhà bạn.",
      "Lần này bạn cất quần áo từ sáng. Giọt mưa đầu tiên rơi trúng đĩa thức ăn bạn đang ăn ngoài hiên.",
      "Bạn ngồi hẳn trong nhà. Giọt mưa đầu tiên lọt qua đúng một viên ngói lệch, rơi xuống giữa trán.",
      "Giờ cả vùng biết sắp có mưa mỗi khi thấy bạn che ô trong nhà.",
    ] },
    landings: [S42_GIAU, S42_KIEN, S42_NONG],
    beats: [
      [
        card("s42_mo_nut", "Cái nút bấm màu xanh", (c, k) => `Lần đầu bạn bấm nút, cái máy rung như sắp bay, rồi một đám mây nhỏ bằng cái sân phơi mọc lên trên đầu cả xóm. ${k.gag()} ${cap(k.npc("ky_su"))} nói nhiên liệu chỉ đủ hai tuần, sau đó bạn tự lo.`,
          [C("Vay thêm để mua nhiên liệu", { custom: "borrow:0.5", flags: ["s42_vay_them"] }, "Máy chạy cả mùa, nợ chồng lên nợ cũ"),
           C("Chạy cầm chừng bằng vốn có", { money: -0.3, flags: ["s42_cam_chung"] }, "Không thêm nợ, mưa lúc có lúc không")]),
        card("s42_mo_so", "Cuốn sổ đặt mưa", () => "Cuối tuần, cả vùng xếp hàng trước nhà bạn để đặt mưa. Người trồng lúa muốn mưa thứ ba, người phơi gạch muốn nắng cả tuần, một đám cưới xin trời khô đúng tối thứ bảy. Cuốn sổ đặt mưa dày lên từng ngày.",
          [C("Mưa cho ai trả tiền trước", { money: 0.3, flags: ["s42_ban_truoc"], counters: { s42_ghet: 1 } }, "Có tiền ngay, người nghèo đứng cuối hàng"),
           C("Bốc thăm, công bằng cho mọi nhà", { rel: 2, flags: ["s42_boc_tham"] }, "Ít tiền, ai cũng phải chờ tới lượt"),
           C("Lập hội đồng làng chia lịch mưa", { flags: ["s42_hoi_dong"], know: 2 }, "Họp nhiều, nhưng lỗi không đổ hết lên bạn", { tier: "sovereign" })]),
      ],
      [
        card("s42_kd_qua", "Giỏ quà của ông chủ tịch", (c, k) => `${cap(k.npc("chu_tich"))} ghé chơi, để lại một giỏ quà nặng tay và một câu dặn: ruộng nhà ông cần mưa trước cả vùng ba ngày. ${has(c, "s42_hoi_dong") ? "Ông nói hội đồng làng cứ họp, còn mưa thì cứ mưa." : "Ông nói chuyện sổ sách để ông lo."}`,
          [C("Nhận quà, mưa cho ông trước", { money: 0.2, flags: ["s42_nhan_qua"], counters: { s42_ghet: 1 } }, "Có người chống lưng, cả vùng thấy hết"),
           C("Trả quà, ghi vào sổ công khai", { flags: ["s42_so_cong_khai"] }, "Sạch tay, thêm một người khó chịu với bạn")]),
        card("s42_kd_han", "Ba tháng không một gợn mây", (c, k) => `Rồi trời khô ba tháng liền, cái máy chỉ còn ho ra khói trắng vì không có mây mà đẩy. Người ta bắt đầu viết tên bạn lên những bức tường đất nứt. Cuối tháng thứ ba, máy cũng nặn ra được một cơn mưa nhỏ. ${k.gag()}`,
          [C("Chạy máy hết công suất", { money: -0.3, health: -2, counters: { s42_mua: 1 } }, "Cứu được vài ruộng, máy và bạn đều kiệt"),
           C("Nói thật là trời hết mây", { counters: { s42_ghet: 2 }, flags: ["s42_noi_that"] }, "Thật lòng, nhưng không ai muốn nghe")]),
      ],
      [
        card("s42_cl_linh_kien", "Linh kiện còn thiếu", (c, k) => `Máy hỏng đúng mùa gieo hạt. ${cap(k.npc("ky_su"))} dẫn tới một người bán linh kiện không lấy tiền: ông chỉ chịu đổi lấy thứ bạn mang theo từ đời cũ, ${k.scar("do") || "thứ bạn quý nhất"}. ${cap(k.scar("nguoi") || "một người quen cũ")} đứng ở cửa, nhìn bạn như đã biết trước bạn sẽ chọn gì.`,
          [C("Đổi nó lấy linh kiện", { flags: ["s42_lap_do"], counters: { s42_mua: 2 }, happy: -2 }, "Máy mạnh gấp đôi, mất một thứ của đời cũ"),
           C("Giữ lại, chờ linh kiện thật", { flags: ["s42_giu_do"], counters: { s42_ghet: 1 }, happy: 2 }, "Giữ được kỷ niệm, cả vùng chờ thêm một tháng")]),
      ],
      [
        card("s42_day_lu", "Cơn mưa không chịu tắt", (c, k) => `${has(c, "s42_lap_do") ? "Cái linh kiện đổi bằng thứ của đời cũ chạy quá tốt" : "Linh kiện mới lắp vào bị lệch"}: mưa chín ngày liền không tắt, nước tràn qua bờ ruộng. Nút bấm màu xanh kẹt cứng. ${k.gag()}`,
          [C("Đập máy cho nó tắt", { flags: ["s42_dap_may"], money: -0.5 }, "Hết mưa ngay, nhưng máy của nhà nước thì hỏng"),
           C("Gọi kỹ sư, chờ tới sáng", { counters: { s42_ghet: 2 }, flags: ["s42_cho_sang"] }, "Giữ được máy, thêm một đêm nước dâng")]),
        card("s42_day_don", "Lá đơn dán ngoài cổng", (c) => `Sáng ra, ngoài cổng dán một lá đơn kiện có ${n(c, "s42_ghet") >= 3 ? "hơn hai trăm" : "ba mươi mốt"} chữ ký, đòi bồi thường một mùa mất trắng. ${has(c, "s42_so_cong_khai") ? "Cuốn sổ công khai của bạn được chuyền tay khắp xóm, đỡ được phần nào." : has(c, "s42_nhan_qua") ? "Ai cũng nhắc tới giỏ quà và cái ruộng được mưa trước ba ngày." : "Ai cũng nhắc chuyện nhà nào được mưa trước."}`,
          [C("Thuê luật sư cãi tới cùng", { money: -0.4, flags: ["s42_luat_su"] }, "Có người nói thay, tốn tiền và tốn thời gian"),
           C("Đi từng nhà xin lỗi", { custom: "apologize", rel: 2, flags: ["s42_xin_loi"] }, "Mất mặt, nhưng nhiều người có thể rút tên")]),
      ],
      [
        card("s42_ket", "Hợp đồng mùa sau", (c, k) => `Hợp đồng làm mưa hết hạn đúng ngày tòa gửi giấy mời. ${cap(k.scar("no") || "khoản vay mua nhiên liệu")} vẫn chưa trả xong. ${k.gag()} ${cap(k.npc("chu_tich"))} đặt hai tờ giấy lên bàn: một tờ gia hạn, một tờ hòa giải.`,
          (c) => {
            const giau = ending(S42_GIAU, "Ký gia hạn, bán mưa thêm nhiều mùa", "Giàu lên, cơn hạn sau vẫn là lỗi của bạn");
            const kien = ending(S42_KIEN, "Ra tòa, nhận phần bồi thường", "Mất tiền và mất việc, đổi lại ngủ được");
            const out: Choice[] = n(c, "s42_ghet") >= 3 && !has(c, "s42_xin_loi") ? [kien, giau] : [giau, kien];
            if (c.age >= 20 && c.age <= 60) out.push(ending(S42_NONG, "Trả máy, làm nông theo kiểu mới", "Bớt quyền, giữ được nghề và hàng xóm"));
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: mưa trong tay bạn, cơn hạn cũng là lỗi của bạn");

/* ================================================================== S43 — Mèo đòi quyền lợi */

const isMeo = (p: Plant): boolean => p.kind === "animal" && (/(^|_)meo(_|$)/.test(p.key) || /(^|\s)mèo(\s|$)/i.test(p.label));
const meo = (c: FactContext): string => c.plants.find(isMeo)?.label ?? "con mèo nhà bạn";

const S43_DAI = land("s43_tin_meo", "Bạn thành phát thanh viên của chuyên mục tin mèo mỗi sáng, giọng đọc quen của cả thành phố.", { custom: "become:radio_voice", happy: 4 });
const S43_NHA = land("s43_nha_tro_meo", "Bạn mở một nhà trọ cho mèo, có bảng nội quy do chính mèo soạn.", { buy: { kind: "shop", name: "nhà trọ cho mèo", price: 1, borrow: true }, happy: 3 });
const S43_BAN = land("s43_ban_may", "Bạn bán bản quyền máy dịch cho một hãng đồ chơi. Tiền về nhiều, còn mèo nhà bạn thôi nói chuyện với bạn.", { money: 2, happy: -2 });

const s43: WeirdBranch = weird("S43", "sf", ["danh", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && c.plants.some(isMeo),
  (s, c) => `Đeo máy dịch cho ${meo(c)}`,
  (s, c) => ({
    title: "Con mèo đã lên tiếng",
    text: `Từ khi đeo máy dịch, ${meo(c)} có thể nói ra mọi điều nó biết về nhà bạn, và nó biết rất nhiều. Cái vòng cổ nhấp nháy đèn xanh, giọng máy đều đều vang khắp ${s.noi || "nơi này"}. Câu đầu tiên trong đời nó nói với bạn là: "Cá hôm nay không tươi."`,
  }),
  season({
    id: "w_S43", vn: "Mèo đòi quyền lợi", color: "#5a5fd0", years: [5, 9], weird: "sf",
    rules: { flags: ["w_meo_noi"] },
    reset: { cast: [{ key: "meo_dau_dan", role: "rival", label: "con mèo mướp cụt đuôi đầu đàn" }, { key: "phong_vien", role: "partner", label: "chị phóng viên đeo ba cái thẻ" }] },
    gag: { key: "ca_tuoi", lines: [
      "Máy dịch rè lên câu đầu tiên trong ngày, như mọi ngày: \"Cá hôm nay không tươi.\"",
      "Máy dịch, câu đầu tiên: \"Cá hôm nay vẫn không tươi, và tôi đã nói từ hôm qua.\"",
      "Máy dịch, câu đầu tiên: \"Tôi sẽ không nhắc chuyện cá nữa.\" Ba giây sau: \"Cá.\"",
      "Máy dịch, câu đầu tiên: \"Cá hôm nay tươi.\" Cả xóm im phăng phắc, không ai tin.",
    ] },
    landings: [S43_DAI, S43_NHA, S43_BAN],
    beats: [
      [
        card("s43_mo_vong", "Cái vòng cổ biết nói", (c, k) => `Bạn cài cái vòng cổ phiên dịch cho ${meo(c)}, bấm nút, rồi chờ. Con mèo nhìn bạn ba giây, ngáp, rồi mới mở miệng. ${k.gag()}`,
          [C("Đăng đoạn ghi âm lên mạng", { flags: ["s43_dang"], counters: { s43_danh: 1 } }, "Cả thành phố nghe, mèo nhà bạn thành người nổi tiếng"),
           C("Giữ bí mật, chỉ nghe một mình", { flags: ["s43_bi_mat"], happy: 3 }, "Yên ổn, nhưng bí mật trong xóm không giữ được lâu")]),
        card("s43_mo_mai", "Hội nghị trên mái tôn", (c, k) => `Đêm thứ ba, ba mươi con mèo của cả xóm ngồi kín mái tôn nhà bạn, xếp hàng ngay ngắn như đi họp. ${cap(k.npc("meo_dau_dan"))} nhảy xuống bậu cửa, gõ móng vào cái vòng cổ: nó muốn mượn máy một đêm.`,
          [C("Cho mượn máy một đêm", { flags: ["s43_cho_muon"] }, "Được lòng xóm mèo, không biết chúng sẽ nói gì"),
           C("Đóng cửa sổ, tắt đèn", { counters: { s43_meo_gian: 1 }, flags: ["s43_dong_cua"] }, "Giữ được máy, mất lòng cả xóm mèo")]),
      ],
      [
        card("s43_kd_dinh_cong", "Xóm mèo đình công", (c, k) => `Sáng thứ hai, không một con mèo nào trong xóm chịu bắt chuột. Chuột diễu hành giữa ban ngày qua chợ. ${has(c, "s43_cho_muon") ? "Bản yêu sách in bằng máy của bạn" : "Bản yêu sách cào bằng móng"} dán ở cột điện: chỗ nắng trên nắp ca-pô, cá tươi mỗi sáng, quyền ngủ trên bàn phím. ${k.gag()}`,
          [C("Đứng ra phiên dịch cho hai bên", { flags: ["s43_phien_dich"], counters: { s43_danh: 1 }, health: -1 }, "Thành người không thể thiếu, bị cả hai bên trách"),
           C("Đứng về phía người, mua bẫy chuột", { money: -0.1, counters: { s43_meo_gian: 2 } }, "Xóm người cảm ơn, xóm mèo ghi thù"),
           C("Soạn bản thỏa thuận mèo và người", { flags: ["s43_thoa_thuan"], know: 2 }, "Lần đầu có luật cho cả hai loài, mất cả tháng", { tier: "sovereign" })]),
        card("s43_kd_phong_vien", "Ba cái thẻ phóng viên", (c, k) => `${cap(k.npc("phong_vien"))} tới gõ cửa, ngực đeo ba cái thẻ của ba đài khác nhau. Chị muốn phỏng vấn trực tiếp ${has(c, "s43_dong_cua") ? "con mèo nhà bạn" : k.npc("meo_dau_dan")}, tối nay, đúng giờ vàng.`,
          [C("Lên sóng trực tiếp cùng con mèo", { counters: { s43_danh: 2 }, flags: ["s43_len_song"] }, "Nổi lên một đêm, mèo nói gì thì không biết trước"),
           C("Cho quay mèo, giấu mặt mình", { flags: ["s43_giau_mat"], happy: 1 }, "An toàn, không ai biết người cầm máy là bạn")]),
      ],
      [
        card("s43_cl_nho_het", "Con mèo nhớ hết", (c, k) => `${has(c, "s43_len_song") ? "Giữa buổi phát sóng trực tiếp" : "Giữa buổi quay cho bản tin tối"}, ${meo(c)} nói một câu rất thản nhiên: nó còn nhớ chuyện của ${k.scar("nguoi") || "một người bạn cũ"} năm xưa, và biết cả chuyện thật về ${k.scar("do") || "món đồ bạn tìm mãi không thấy"}. Cả trường quay im lặng. Đèn đỏ của máy quay vẫn sáng.`,
          [C("Hỏi tới cùng, ngay trên sóng", { flags: ["s43_hoi_het"], counters: { s43_danh: 2 }, happy: -2 }, "Biết hết sự thật, cả thành phố cũng biết"),
           C("Rút dây máy dịch", { flags: ["s43_rut_day"], happy: 2 }, "Giữ chuyện cũ cho mình, bị nói là dàn dựng")]),
      ],
      [
        card("s43_day_kien", "Ông chủ sạp cá", (c) => `Ông chủ sạp cá đầu chợ đâm đơn kiện: từ khi mèo cả xóm nói cá ông không tươi, sạp ông vắng tanh. ${n(c, "s43_meo_gian") >= 2 ? "Xóm mèo vẫn còn giận bạn, nhất quyết không ra làm chứng." : "Xóm mèo kéo nhau tới, ngồi thành hàng ở cửa phòng hòa giải."}`,
          [C("Bồi thường, xin lỗi ông", { money: -0.3, custom: "apologize" }, "Yên chuyện, mất một khoản và chút mặt mũi"),
           C("Ra tòa, mang máy dịch làm chứng", { flags: ["s43_ra_toa"], counters: { s43_danh: 1 } }, "Có thể thắng, có thể thành vụ mèo làm chứng đầu tiên")]),
        card("s43_day_pin", "Máy dịch hết pin", (c, k) => `Sáng hôm ấy máy dịch vẫn chạy. ${k.gag()} Đến chiều, cái vòng cổ tắt phụt. Không còn giọng máy đều đều, chỉ còn tiếng meo và một ánh mắt rất khó hiểu.`,
          [C("Bỏ tiền sửa máy", { money: -0.4, flags: ["s43_sua_may"] }, "Có lại giọng nói, ví mỏng đi"),
           C("Tập nghe mèo bằng tai", { know: 3, flags: ["s43_nghe_tai"] }, "Chậm và sai nhiều, nhưng không ai lấy được của bạn")]),
      ],
      [
        card("s43_ket", "Chuyên mục tin mèo", (c, k) => `Đài phát thanh gọi: họ muốn một chuyên mục tin mèo lúc sáu giờ sáng, và ${has(c, "s43_nghe_tai") ? "giờ bạn nghe mèo bằng tai còn nhanh hơn máy" : "chỉ bạn hiểu mèo đủ để đọc"}. ${k.gag()} ${cap(k.scar("no") || "món nợ cũ")} vẫn chưa trả, còn ${k.npc("meo_dau_dan")} đang ngồi chờ trên nóc tủ.`,
          (c) => {
            const nha = ending(S43_NHA, "Mở nhà trọ cho mèo", "Vay thêm, nhưng ngày nào cũng có khách");
            const ban = ending(S43_BAN, "Bán bản quyền máy dịch", "Có tiền ngay, mất người bạn biết nói");
            const out: Choice[] = has(c, "s43_nghe_tai") || n(c, "s43_meo_gian") >= 2 ? [nha, ban] : [ban, nha];
            if (c.age >= 20 && c.age <= 55) out.unshift(ending(S43_DAI, "Nhận chuyên mục, đọc tin mèo mỗi sáng", "Có nghề mới, cả đời gắn với tiếng meo"));
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: mèo nói được, cả xóm mèo đình công");

/* ================================================================== S44 — Thành phố ngủ */

const S44_CHINH = land("s44_hoi_dong", "Thành phố bầu bạn vào hội đồng. Bạn có bàn làm việc, có con dấu, và có nỗi sợ ngủ quên.", { custom: "become:politician", happy: 3 });
const S44_THUONG = land("s44_huy_chuong", "Bạn nhận huy chương và một khoản thưởng lớn, rồi về sống tiếp như cũ.", { money: 1.5, happy: 3 });
const S44_DI = land("s44_roi_thanh_pho", "Lời ra tiếng vào không dứt. Bạn dọn tới một thành phố khác, nơi không ai biết bạn từng thức.", { custom: "move_city", money: -1, happy: -2 });

const s44: WeirdBranch = weird("S44", "sf", ["luat", "ky"],
  (c) => c.age >= 18 && c.age <= 70 && !c.farmer && (c.flags.has("path_city") || c.flags.has("origin_poor_urban") || c.flags.has("job_office") || c.flags.has("job_tech") || c.migrated),
  () => "Đi qua thành phố đang ngủ, một mình",
  () => ({
    title: "Thành phố ngủ ba mươi ngày",
    text: "Cả thành phố ngủ thiếp đi lúc sáu giờ sáng, và trong ba mươi ngày tới chỉ còn bạn thức để quyết định mọi chuyện. Ông bán bánh mì gục trên lò, tay vẫn cầm cái kẹp; xe buýt đứng giữa ngã tư, tài xế ngáy đều. Đài phát thanh lặp đi lặp lại đúng câu bạn vừa ghi âm: \"Có ai còn thức không?\"",
  }),
  season({
    id: "w_S44", vn: "Thành phố ngủ", color: "#2f5d9e", years: [5, 9], weird: "sf",
    rules: { flags: ["w_thanh_pho_ngu"] },
    reset: { cast: [{ key: "ao_mua", role: "rival", label: "người đàn ông mặc áo mưa vàng" }, { key: "thanh_tra", role: "official", label: "viên thanh tra mặt lạnh" }] },
    gag: { key: "den_do", lines: [
      "Đèn đỏ ở ngã tư vẫn nhấp nháy. Bạn vẫn dừng lại chờ, một mình giữa thành phố ngủ.",
      "Bạn lại dừng ở đèn đỏ. Một con chim sẻ đậu xuống cạnh chân, cũng đứng chờ.",
      "Ở đèn đỏ, bạn bắt gặp mình đang huýt sáo cho đèn chuyển xanh nhanh hơn.",
      "Khi thành phố tỉnh dậy, người đầu tiên vượt đèn đỏ bị bạn quát to đến mức chính bạn cũng giật mình.",
    ] },
    landings: [S44_CHINH, S44_THUONG, S44_DI],
    beats: [
      [
        card("s44_mo_thuc", "Sáu giờ sáng, không ai dậy", (c, k) => `Sáu giờ sáng ở ${k.noi}, cả phố im như tờ. Người đi tập thể dục ngủ ngồi trên ghế đá, cô bán hoa ngủ gục trên xô nước, chó mèo cũng ngủ. ${k.gag()}`,
          [C("Đi từng nhà kiểm tra", { flags: ["s44_kiem_tra"], health: -1, counters: { s44_thien: 1 } }, "Mệt, nhưng biết ai đang cần gì"),
           C("Pha cà phê, chờ xem sao", { happy: 2, flags: ["s44_cho"] }, "Giữ sức, có thể đã chậm mất một ngày")]),
        card("s44_mo_bep", "Những cái bếp còn đỏ lửa", (c) => `${has(c, "s44_kiem_tra") ? "Tới căn nhà thứ mười hai" : "Đến trưa"}, bạn ngửi thấy mùi khét: cả dãy phố còn những nồi súp trên bếp. Trong tiệm tạp hóa, đồ ăn xếp đầy kệ, chủ tiệm ngủ ngồi ở quầy, tay vẫn cầm cây bút.`,
          [C("Tắt hết bếp cả dãy phố", { counters: { s44_thien: 2 }, health: -2 }, "Cứu được nhiều nhà, mệt rã người"),
           C("Lấy đồ ăn, để lại giấy ghi nợ", { flags: ["s44_giay_no"], money: -0.05 }, "Sòng phẳng, tốn chút tiền"),
           C("Lấy đồ ăn, không để lại gì", { flags: ["s44_lay_do"], counters: { s44_nghi: 1 } }, "Không ai thấy, nhưng camera thì có")]),
      ],
      [
        card("s44_kd_ket_sat", "Cửa két ngân hàng mở toang", (c, k) => `${k.gag()} Bên kia đường, cửa két ngân hàng mở toang, người bảo vệ ngủ dựa vào song sắt. Tiền xếp thành khối như gạch.`,
          [C("Khóa két lại, dán giấy niêm phong", { counters: { s44_thien: 1 }, flags: ["s44_niem_phong"] }, "Đúng việc, nhưng dấu tay bạn ở khắp nơi"),
           C("Đi tiếp, coi như không thấy", { flags: ["s44_lo_di"] }, "Sạch tay, ai lấy thì cũng không phải bạn"),
           C("Cầm một xấp, chỉ để thử cảm giác", { money: 0.5, flags: ["s44_cam_tien"], counters: { s44_nghi: 3 } }, "Có tiền, và một bí mật không bao giờ ngủ")]),
        card("s44_kd_ao_mua", "Người mặc áo mưa vàng", (c, k) => `Giữa quảng trường có người đang xếp lại biển hiệu của cả con phố theo thứ tự chữ cái. Đó là ${k.npc("ao_mua")}, cũng còn thức như bạn, và vui ra mặt: "Cuối cùng cũng có người để cãi nhau."`,
          [C("Đi cùng, để mắt tới ông ta", { flags: ["s44_di_cung"], counters: { s44_nghi: 1 } }, "Biết ông ta làm gì, nhưng camera thấy hai người"),
           C("Khóa ông ta trong thư viện", { flags: ["s44_khoa_ao_mua"], counters: { s44_thien: 1 } }, "Phố yên, nhưng bạn vừa nhốt một người")]),
      ],
      [
        card("s44_cl_benh_vien", "Tầng ba bệnh viện", (c, k) => `Năm sau, thành phố lại ngủ đúng ngày ấy. ${k.gag()} Ở tầng ba bệnh viện không ai thay chai truyền; trên giường số chín là ${k.scar("nguoi") || "một người bạn từng rất thân"}, chai dịch sắp cạn. Thứ duy nhất bạn mang theo từ đời cũ là ${k.scar("do") || "đôi tay và một quyển hướng dẫn dày"}, và lúc này nó phải đủ dùng.`,
          [C("Ở lại trông cả tầng bệnh viện", { counters: { s44_thien: 3 }, health: -3, flags: ["s44_benh_vien"] }, "Cứu được nhiều người, bỏ ngỏ cả thành phố"),
           C("Lo cho người quen rồi đi tiếp", { counters: { s44_thien: 1 }, flags: ["s44_nguoi_quen"] }, "Giữ được người mình thương, phần còn lại tùy số")]),
      ],
      [
        card("s44_day_thanh_tra", "Viên thanh tra mặt lạnh", (c, k) => `Thành phố tỉnh dậy và đếm lại: thiếu tiền ở ngân hàng, thiếu đồ ở tiệm. Camera chỉ thấy một người đi lại suốt ba mươi ngày: bạn. ${cap(k.npc("thanh_tra"))} đặt máy ghi âm lên bàn. ${has(c, "s44_cam_tien") ? "Câu hỏi đầu tiên là về cái két." : has(c, "s44_giay_no") ? "Trên bàn là xấp giấy ghi nợ có chữ ký của bạn." : "Chưa hỏi gì, chỉ nhìn."}`,
          [C("Nộp hết nhật ký ba mươi ngày", { flags: ["s44_nop_nhat_ky"], counters: { s44_thien: 1 } }, "Mọi chuyện được kể ra, kể cả chuyện xấu"),
           C("Chỉ trả lời điều được hỏi", { flags: ["s44_kin_tieng"], counters: { s44_nghi: 1 } }, "Không tự hại mình, cũng không tự gỡ mình")]),
        card("s44_day_trang_nhat", "Trang nhất chia đôi", (c, k) => `Tờ báo sáng chia trang nhất làm đôi: nửa trên gọi bạn là người hùng, nửa dưới gọi bạn là kẻ trộm thành phố. ${n(c, "s44_thien") > n(c, "s44_nghi") ? "Những nhà được bạn tắt bếp kéo nhau tới tòa soạn bênh bạn." : `${cap(k.npc("ao_mua"))} đã biến mất, chỉ còn bạn để người ta hỏi.`}`,
          [C("Đi xin lỗi những nhà đã vào", { custom: "apologize", rel: 2, flags: ["s44_xin_loi"] }, "Mất mặt, nhưng người ta nhớ bạn đã tới"),
           C("Kiện tờ báo tội vu khống", { money: -0.3, flags: ["s44_kien_bao"] }, "Có thể đòi lại danh dự, chắc chắn tốn tiền")]),
      ],
      [
        card("s44_ket", "Huy chương, hay phiên tòa", (c, k) => `Hội đồng thành phố họp suốt đêm để quyết định bạn là gì. ${k.gag()} ${cap(k.scar("no") || "một món nợ cũ")} bị lôi ra giữa phòng họp như thêm một bằng chứng. ${n(c, "s44_thien") >= n(c, "s44_nghi") + 2 ? "Phần đông giơ tay cho huy chương." : "Phần đông vẫn chưa tin bạn."}`,
          (c) => {
            const tin = n(c, "s44_thien") >= n(c, "s44_nghi") + 2;
            const hero: Choice[] = [ending(S44_THUONG, "Nhận huy chương và khoản thưởng", "Có tiền, có tiếng, rồi về sống như cũ")];
            if (c.age >= 28 && c.age <= 60) hero.unshift(ending(S44_CHINH, "Nhận lời ra ứng cử hội đồng", "Có quyền, và cả thành phố soi từng bước"));
            const di = ending(S44_DI, "Rời thành phố, làm lại ở nơi khác", "Thoát lời ra tiếng vào, mất chỗ quen");
            return tin ? [...hero, di] : [di, ...hero];
          }),
      ],
    ],
  }),
  "Viễn tưởng: cả thành phố ngủ, mỗi ngày một lựa chọn không ai thấy");

/* ================================================================== S45 — Ứng viên một chiều */

const S45_DI = land("s45_ve_mot_chieu", "Con tàu chưa cất cánh, nhưng vé một chiều vẫn là vé một chiều: bạn được đưa tới căn cứ phóng ở nước ngoài và ở lại làm người đi tiên phong.", { custom: "migrate_now|become:explorer", happy: 3 });
const S45_BAY = land("s45_can_cu", "Bạn theo đoàn sang căn cứ phóng ở nước ngoài, ở lại trông vườn rau của trạm, chờ một chuyến tàu không biết bao giờ.", { custom: "migrate_now", happy: 2 });
const S45_RUT = land("s45_rut_lui", "Bạn rút tên trước giờ phóng, đền hợp đồng, và ra đường lúc nào cũng có người hô theo câu khẩu hiệu cũ.", { money: -1.5, happy: -4 });
const S45_HAI = land("s45_dien_hai", "Bạn biến cái nhục thành tiết mục: người suýt bay lên sao kể chuyện mình ở lại.", { custom: "become:comedian", happy: 2 });

const s45: WeirdBranch = weird("S45", "sf", ["danh", "ky"],
  (c) => c.age >= 18 && c.age <= 65 && c.pressure.danh >= 4 && c.happy < 40,
  () => "Ghi tên vào cuộc thi đi sao không vé về",
  (s) => ({
    title: "Vé một chiều lên sao",
    text: `Nếu thắng cuộc thi này, bạn sẽ rời Trái Đất mãi mãi, và cả nước sẽ ngồi xem bạn đi. Lá đơn bạn gửi lúc hai giờ sáng cho vui giờ hiện trên màn hình lớn giữa ${s.noi || "quảng trường"}, cạnh tấm ảnh bạn đang ngáp. Anh MC tóc dựng đứng chỉ thẳng vào ống kính: "Một chiều, không quay đầu!"`,
  }),
  season({
    id: "w_S45", vn: "Ứng viên một chiều", color: "#6a4fc9", years: [5, 8], weird: "sf",
    rules: { income: 0.8, flags: ["w_ung_vien"] },
    reset: { cast: [{ key: "mc", role: "rival", label: "anh MC tóc dựng đứng" }, { key: "ba_cu", role: "partner", label: "bà cụ ứng viên bảy mươi tuổi" }] },
    gag: { key: "khau_hieu", lines: [
      "Anh MC chỉ thẳng vào ống kính: \"Một chiều, không quay đầu!\" Khán giả hô theo, bạn cũng lỡ miệng hô theo.",
      "Hôm nay anh MC hô \"Một chiều, không quay đầu!\" rồi quay đầu lại vì quên kịch bản.",
      "Câu \"Một chiều, không quay đầu!\" giờ được in lên áo, lên cốc, và lên tấm biển cấm quay xe trước trường quay.",
      "Bạn nằm mơ thấy mình hô \"Một chiều, không quay đầu!\", tỉnh dậy thì cả nhà đang hô theo ngoài phòng khách.",
    ] },
    landings: [S45_DI, S45_BAY, S45_RUT, S45_HAI],
    beats: [
      [
        card("s45_mo_ghi_hinh", "Buổi ghi hình đầu tiên", (c, k) => `Bạn tới buổi ghi hình đầu tiên với đôi dép lê, giữa ba trăm ứng viên ăn mặc như sắp đi dự tiệc. ${k.gag()}`,
          [C("Đi tiếp, kể cho cả nhà biết", { flags: ["s45_ke_nha"], rel: 1, counters: { s45_diem: 1 } }, "Có người ủng hộ, cũng có người khóc"),
           C("Đi tiếp, giấu cả nhà", { flags: ["s45_giau_nha"], counters: { s45_diem: 1 } }, "Yên được ít lâu, tới khi họ bật ti vi")]),
        card("s45_mo_vong_loai", "Vòng loại thức ăn ống", () => "Vòng loại: ăn ba bữa thức ăn đóng ống trước máy quay, rồi kể câu chuyện buồn nhất đời mình trong chín mươi giây. Ứng viên bên cạnh khóc từ giây thứ năm.",
          [C("Kể thật chuyện đời mình", { counters: { s45_diem: 2 }, happy: -2, flags: ["s45_ke_that"] }, "Thật lòng, nhưng phải mở lòng trước cả nước"),
           C("Bịa một chuyện thật cảm động", { counters: { s45_diem: 3 }, flags: ["s45_bia"] }, "Điểm cao, và một lời nói dối có hạn dùng")]),
      ],
      [
        card("s45_kd_tai_tro", "Hợp đồng quảng cáo", (c) => `Sau ba tập, mặt bạn đã lên bảng quảng cáo. ${has(c, "s45_giau_nha") ? "Cả nhà biết chuyện qua một tấm áp phích bên đường, và chưa ai nói chuyện với bạn." : "Cả nhà đi đâu cũng bị hỏi xin chữ ký hộ."} Một hãng nước tăng lực đưa bản hợp đồng dày ba mươi trang.`,
          [C("Ký hợp đồng quảng cáo", { money: 0.5, flags: ["s45_tai_tro"] }, "Có tiền ngay, rút lui thì phạt nặng"),
           C("Từ chối, giữ mình sạch sẽ", { flags: ["s45_sach"], happy: 1 }, "Nghèo hơn, nhưng đi hay ở là quyền của bạn")]),
        card("s45_kd_ba_cu", "Chiếc khăn dài nhất phòng chờ", (c, k) => `${cap(k.npc("ba_cu"))} ngồi cạnh bạn ở phòng chờ, đan một chiếc khăn đã dài tới cửa. Bà nói muốn bay lên để nhìn Trái Đất một lần cho rõ, rồi rủ bạn lập đội. ${k.gag()}`,
          [C("Lập đội với bà", { flags: ["s45_lap_doi"], rel: 2 }, "Có bạn đồng hành, chia điểm với một người già"),
           C("Đi một mình", { counters: { s45_diem: 1 }, flags: ["s45_mot_minh"] }, "Điểm cao hơn, đêm dài hơn")]),
      ],
      [
        card("s45_cl_nguoi_o_lai", "Tập đặc biệt: người ở lại", (c, k) => `Tập đặc biệt, đèn sân khấu tắt rồi bật: ${k.scar("nguoi") || "một người bạn từng rất thân"} bước ra, nhắc tới ${k.scar("do") || "một món đồ cũ của bạn"}, rồi xin bạn ở lại trước cả nước. Khán giả nín thở. Trong tai nghe, đạo diễn thì thầm: "Khóc đi, khóc là lên điểm."`,
          [C("Hứa sẽ ở lại", { flags: ["s45_hua_o"], happy: 3, counters: { s45_diem: -2 } }, "Giữ được một người, mất lòng khán giả"),
           C("Nói lời từ biệt trên sóng", { counters: { s45_diem: 2 }, flags: ["s45_tu_biet"], happy: -2 }, "Lên điểm, và một vết rạn không ai sửa")]),
      ],
      [
        card("s45_day_hoan", "Lịch phóng lại hoãn", (c, k) => `Lịch phóng hoãn lần thứ ba. Các ứng viên vào trại huấn luyện, mỗi sáng chạy mười vòng quanh một mô hình tên lửa bằng xốp. ${has(c, "s45_lap_doi") ? `${cap(k.npc("ba_cu"))} chạy chậm nhưng chưa bỏ vòng nào.` : "Bạn chạy một mình, đếm vòng bằng tiếng thở."}`,
          [C("Ở lại trại tập tiếp", { health: 3, flags: ["s45_o_trai"] }, "Khỏe lên, đời ngoài kia trôi mất"),
           C("Xin phép về nhà một tháng", { money: -0.2, flags: ["s45_ve_nha"], rel: 2 }, "Gặp lại người thân, bị gọi là kẻ dao động")]),
        card("s45_day_lo", "Phóng sự vạch mặt", (c, k) => `Một tờ báo đăng phóng sự: ${has(c, "s45_bia") ? "câu chuyện cảm động của bạn ở vòng loại là bịa" : "con tàu mới đóng xong một nửa, nửa còn lại vẫn là bản vẽ"}. Lượt bình chọn rơi như đá. ${k.gag()}`,
          [C("Xin lỗi trên sóng trực tiếp", { custom: "apologize", counters: { s45_nhuc: 1 } }, "Nhục một lần cho xong"),
           C("Đổ lỗi cho người viết kịch bản", { counters: { s45_nhuc: 2 }, flags: ["s45_do_loi"] }, "Thoát hôm nay, mang tiếng lâu")]),
      ],
      [
        card("s45_ket", "Đêm trước giờ phóng", (c, k) => `Đêm trước giờ phóng, điện thoại bạn có ba trăm tin nhắn. ${cap(k.scar("no") || "món nợ cũ")} vẫn ở đó, không bay theo ai cả. ${has(c, "s45_hua_o") ? "Lời hứa ở lại trên sóng được chiếu lại suốt buổi tối." : "Ngoài cửa, người ta đã dựng sẵn sân khấu tiễn đưa."}`,
          (c) => {
            const out: Choice[] = [c.age >= 20 && c.age <= 50
              ? ending(S45_DI, "Lên tàu, đi thật", "Không quay đầu, đời mới ở một nơi rất xa")
              : ending(S45_BAY, "Theo đoàn sang căn cứ phóng", "Đi xa thật, dù tàu chưa chắc bay")];
            out.push(ending(S45_RUT, "Rút tên, chịu phạt hợp đồng", "Ở lại với người thân, mang nhục nhiều năm"));
            if (c.age >= 18 && c.age <= 50) out.push(ending(S45_HAI, "Rút tên, rồi diễn hài về chuyện đó", "Biến nhục thành nghề, không ai quên chuyện cũ"));
            return has(c, "s45_hua_o") ? out.reverse() : out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: cả nước xem bạn chuẩn bị rời Trái Đất");

/* ================================================================== S46 — Đứa trẻ từ sao khác */

const S46_CON = land("s46_con_nuoi", "Đứa trẻ có giấy khai sinh, có tên trong sổ nhà bạn, và có một chiếc ghế riêng cạnh cái máy giặt.", { custom: "have_child", happy: 6 });
const S46_VE = land("s46_vuon_la", "Đứa trẻ về nhà trên trời. Nó để lại một túi hạt giống lạ, mọc thành khu vườn ai cũng muốn mua.", { money: 2, happy: -2 });
const S46_DIEU_TRA = land("s46_bi_dieu_tra", "Bạn nhận hết trách nhiệm trước đoàn điều tra. Đứa trẻ được đưa đi nơi an toàn, còn bạn nộp một khoản phạt lớn và mất chỗ đứng trong làng.", { money: -1.5, custom: "job_lose", happy: -3 });

const s46: WeirdBranch = weird("S46", "sf", ["tinh", "mau", "ky"],
  (c) => c.age >= 22 && c.age <= 65 && (c.farmer || c.flags.has("origin_poor_rural")) && ((c.counters.kind ?? 0) >= 3 || c.flags.has("temper_kind")),
  () => "Bế đứa trẻ dưới hồ về nhà",
  (s) => ({
    title: "Đứa trẻ dưới hồ làng",
    text: `Nửa đêm, một con tàu nhỏ bằng cái bồn nước rơi xuống hồ ở ${s.noi || "làng bạn"}, và người duy nhất nghe thấy là bạn. Cửa tàu mở ra: bên trong là một đứa trẻ tóc bạc, khô ráo, ngồi thẳng lưng như phi công thật. Nó nhìn bạn và nói rõ ràng câu duy nhất nó biết: "Xin chào, đây là nhà phải không?"`,
  }),
  season({
    id: "w_S46", vn: "Nuôi đứa trẻ từ sao khác", color: "#7a6ad8", years: [7, 12], weird: "sf",
    rules: { flags: ["w_tre_sao_khac"] },
    reset: { cast: [{ key: "dua_tre", role: "child", label: "đứa trẻ tóc bạc từ dưới hồ" }, { key: "kinh_ram", role: "official", label: "người điều tra đeo kính râm" }] },
    gag: { key: "may_giat", lines: [
      "Đứa trẻ cúi chào cái máy giặt có cửa tròn rất lễ phép, gọi nó là \"thưa thuyền trưởng\".",
      "Đứa trẻ vẫn chào máy giặt là \"thưa thuyền trưởng\", và giờ nó kéo ghế ra ngồi canh mỗi lần máy quay.",
      "Máy giặt hỏng. Đứa trẻ để tang máy giặt ba ngày, đội trên đầu một cái rổ.",
      "Bạn mua máy giặt mới. Đứa trẻ đứng nghiêm chào: \"Thưa thuyền trưởng, chào mừng trở lại.\"",
    ] },
    landings: [S46_CON, S46_VE, S46_DIEU_TRA],
    beats: [
      [
        card("s46_mo_bep", "Sáng đầu tiên trong bếp", (c, k) => `Bạn quấn ${k.npc("dua_tre")} trong chăn mang về. Sáng ra nó đã dậy trước bạn, đứng nghiêm trong bếp. ${k.gag()}`,
          [C("Giấu nó trong nhà một thời gian", { flags: ["s46_giau"], counters: { s46_tinh: 1 } }, "Yên được ít ngày, càng giấu càng khó nói"),
           C("Báo ngay cho chính quyền", { flags: ["s46_bao"], counters: { s46_nghi: -1 } }, "Đúng luật, không biết họ sẽ đưa nó đi đâu")]),
        card("s46_mo_vo_trung", "Bữa ăn bằng vỏ trứng", () => "Đứa trẻ không ăn cơm, không ăn rau, chỉ ăn đúng một thứ: vỏ trứng nghiền nhỏ rắc lên nước lã. Nó ăn rất lịch sự và cảm ơn từng cái vỏ.",
          [C("Dạy nó ngồi ăn chung bàn như người nhà", { counters: { s46_tinh: 1 }, happy: 2 }, "Thân hơn mỗi ngày, khó buông hơn mỗi ngày"),
           C("Ghi chép từng thứ nó ăn", { know: 2, flags: ["s46_ghi_chep"] }, "Hiểu nó hơn, nhưng nhìn nó như một ca nghiên cứu")]),
      ],
      [
        card("s46_kd_hang_rao", "Cả làng đứng ngoài hàng rào", (c) => `${has(c, "s46_bao") ? "Tin đã báo lên trên" : "Bạn giấu rất kỹ"}, vậy mà chỉ một tuần sau cả làng đã đứng kín ngoài hàng rào. Đứa trẻ vẫy tay chào từng người, gọi ai cũng là "thưa thuyền phó".`,
          [C("Nói nó là cháu họ ở xa", { flags: ["s46_noi_doi"], counters: { s46_nghi: 1 } }, "Êm chuyện hôm nay, sổ sách thì không êm"),
           C("Cho nó đi học như mọi đứa trẻ", { counters: { s46_tinh: 2 }, flags: ["s46_di_hoc"] }, "Nó có bạn, cả trường có chuyện để kể")]),
        card("s46_kd_kinh_ram", "Cái lều bên bờ hồ", (c, k) => `${cap(k.npc("kinh_ram"))} dựng lều bên bờ hồ, đo nước bằng một cây thước dài ba mét, ngày nào cũng ghé nhà bạn hỏi mượn cái gáo. ${k.gag()}`,
          [C("Mời vào nhà uống nước", { flags: ["s46_moi_nuoc"], counters: { s46_nghi: -1 } }, "Thật thà, nhưng người ta sẽ thấy đứa trẻ"),
           C("Nói không biết gì hết", { counters: { s46_nghi: 2 }, flags: ["s46_choi"] }, "Giữ được bí mật ít lâu, mất lòng tin lâu dài")]),
      ],
      [
        card("s46_cl_sua_tau", "Con tàu cần một thứ của bạn", (c, k) => `Một đêm, đứa trẻ dắt bạn ra bờ hồ, chỉ vào con tàu dưới nước: nó cần đúng thứ bạn mang theo từ đời cũ, ${k.scar("do") || "món đồ cũ nhất trong nhà"}, để tàu sáng lại. ${cap(k.scar("nguoi") || "một người quen cũ")} từng nói với bạn rằng có những thứ giữ lại chỉ để chờ đúng người.`,
          [C("Trao nó cho đứa trẻ sửa tàu", { flags: ["s46_sua_tau"], happy: -1 }, "Nó có đường về, bạn mất một thứ của đời mình"),
           C("Giữ nó lại, để tàu nằm dưới hồ", { flags: ["s46_giu_lai"], counters: { s46_tinh: 1 } }, "Giữ được đứa trẻ, nhưng chưa hỏi nó muốn gì")]),
      ],
      [
        card("s46_day_bien_ban", "Biên bản dày ba phân", (c, k) => `${cap(k.npc("kinh_ram"))} đặt lên bàn một biên bản dày ba phân, ${n(c, "s46_nghi") >= 2 ? "trang nào cũng có lời khai của bạn bị gạch đỏ" : "trang nào cũng có câu hỏi về đứa trẻ"}. Bạn có ba ngày để trả lời.`,
          [C("Khai thật, xin được nuôi tiếp", { flags: ["s46_khai_that"], counters: { s46_tinh: 1, s46_nghi: -1 } }, "Mọi thứ ra ánh sáng, kể cả lỗi của bạn"),
           C("Thuê luật sư lo giấy tờ", { money: -0.4, flags: ["s46_luat_su"] }, "Có người đỡ đòn, tốn một khoản lớn")]),
        card("s46_day_tin_hieu", "Mặt hồ sáng từng đợt", (c, k) => `Đêm đó, mặt hồ sáng lên từng đợt, như có ai đang gõ cửa từ trên trời. Đứa trẻ ngồi bên cửa sổ rất lâu, không nói gì. ${k.gag()}`,
          [C("Hỏi nó muốn về hay ở", { counters: { s46_tinh: 1 }, flags: ["s46_hoi"] }, "Tôn trọng nó, chuẩn bị nghe điều khó nghe"),
           C("Kéo rèm, tắt đèn đi ngủ", { flags: ["s46_keo_rem"], counters: { s46_nghi: 1 } }, "Giữ nó thêm một đêm, và nó sẽ nhớ")]),
      ],
      [
        card("s46_ket", "Đêm hồ sáng lần cuối", (c, k) => `Mặt hồ sáng lần cuối, và đoàn điều tra đã đứng ngoài cổng. ${cap(k.scar("no") || "một lời hứa cũ")} bỗng hiện về trong đầu bạn, rõ như hôm mới bắt đầu. ${k.gag()} ${has(c, "s46_sua_tau") ? "Con tàu dưới hồ đã sáng đèn, chờ sẵn." : "Đứa trẻ nắm tay bạn, chờ bạn nói trước."}`,
          (c) => {
            const con = ending(S46_CON, "Làm giấy nhận nó làm con nuôi", "Có thêm một đứa con, và đoàn điều tra ở lại lâu");
            const ve = ending(S46_VE, "Để nó về nhà trên trời", "Nó được về, bạn còn lại một khu vườn");
            const dt = ending(S46_DIEU_TRA, "Nhận hết trách nhiệm trước đoàn điều tra", "Đứa trẻ an toàn, bạn mất tiền và chỗ đứng");
            return has(c, "s46_sua_tau") || has(c, "s46_hoi") ? [ve, con, dt] : [con, ve, dt];
          }),
      ],
    ],
  }),
  "Viễn tưởng: nuôi một đứa trẻ từ sao khác, cả làng dòm ngó");

/* ================================================================== S47 — Chuộc ký ức */

const S47_CHUOC = land("s47_chuoc_het", "Bạn chuộc về gần hết ký ức của nhà mình. Tài khoản trống trơn, nhưng đêm nào cũng có ảnh cũ để xem.", { money: -2, happy: 5 });
const S47_BAN = land("s47_ban_quyen", "Bạn ký giấy bán nốt quyền ký ức cho người mua giấu mặt, nhận một khoản đủ đổi đời và một khoảng trống không lấp được.", { money: 1.5, happy: -5 });
const S47_PT = land("s47_phong_trao", "Bạn đứng đầu phong trào đòi trả ký ức về cho các gia đình. Không giàu, nhưng không bao giờ rảnh.", { custom: "become:activist", happy: 3 });

const s47: WeirdBranch = weird("S47", "sf", ["tinh", "tien", "ky"],
  (c) => c.age >= 18 && c.age <= 72 && (c.flags.has("parent_died") || c.widowed || c.kids_alive > 0),
  () => "Chuộc lại ký ức của nhà mình",
  () => ({
    title: "Ký ức nhà bạn đang được rao bán",
    text: "Ba mươi ngày nữa, toàn bộ ảnh, phim và tin nhắn của nhà bạn sẽ thuộc về người trả giá cao nhất. Bức thư báo đến lúc nửa đêm, kèm ảnh chụp trang đấu giá: lô số một là đoạn phim bạn bốn tuổi đứng hát sai lời. Người bán chỉ ghi một dòng: \"Tài khoản lưu trữ của quý khách đã hết hạn.\"",
  }),
  season({
    id: "w_S47", vn: "Chuộc ký ức nhà mình", color: "#4b58b8", years: [5, 9], weird: "sf",
    rules: { flags: ["w_chuoc_ky_uc"] },
    reset: { cast: [{ key: "nguoi_mua", role: "rival", label: "người mua giấu mặt" }, { key: "tho_may", role: "partner", label: "cậu thợ sửa máy dưới tầng trệt" }] },
    gag: { key: "lo_dau_gia", lines: [
      "Lô đầu tiên lên sàn: đoạn phim bạn bốn tuổi hát sai lời trong đám cưới nhà hàng xóm. Giá khởi điểm đã cao hơn bạn tưởng.",
      "Lô kế tiếp: bức ảnh bạn ngủ gật há miệng trong buổi tốt nghiệp. Có bảy người trả giá.",
      "Lô mới: đoạn ghi âm bạn tập nói lời tỏ tình trước gương. Người mua giấu mặt giơ bảng ngay giây đầu.",
      "Lô cuối: tấm ảnh bạn mặc áo len ngược cả buổi. Phòng đấu giá đứng dậy vỗ tay.",
    ] },
    landings: [S47_CHUOC, S47_BAN, S47_PT],
    beats: [
      [
        card("s47_mo_thu", "Bức thư lúc nửa đêm", (c, k) => `Bạn đọc lại bức thư lần thứ ba, gọi vào tổng đài, nghe nhạc chờ bốn mươi phút rồi máy tự cúp. Trang đấu giá đã mở. ${k.gag()}`,
          [C("Đặt cọc giữ chỗ trong phiên đấu", { money: -0.2, flags: ["s47_dat_coc"] }, "Có chỗ trong phòng đấu giá, tiền bắt đầu chảy"),
           C("Gọi cả nhà về họp khẩn", { rel: 2, flags: ["s47_hop_nha"] }, "Đông người góp sức, cũng đông ý kiến")]),
        card("s47_mo_tho_may", "Cậu thợ dưới tầng trệt", (c, k) => `${cap(k.npc("tho_may"))} nghe chuyện, gật gù, rồi bê lên một thùng điện thoại và máy ảnh cũ: "Ký ức hay trốn trong máy cũ lắm." Cậu tính tiền theo giờ, giờ đầu miễn phí.`,
          [C("Nhờ cậu lục lại máy cũ", { know: 2, flags: ["s47_luc_may"], money: -0.05 }, "Cứu được ít ảnh, mất thêm ít tiền"),
           C("Nhờ cậu dò xem ai đang mua", { money: -0.1, flags: ["s47_do_nguoi_mua"] }, "Biết đối thủ là ai, chưa chắc đã muốn biết")]),
      ],
      [
        card("s47_kd_phien_dau", "Phiên đấu giá đầu tiên", (c, k) => `Phòng đấu giá trực tuyến có ba trăm người xem, phần lớn vào để cười. ${cap(k.npc("nguoi_mua"))} trả giá cho từng lô, không bỏ lô nào. ${k.gag()}`,
          [C("Trả giá đến cùng mọi lô", { money: -0.5, counters: { s47_chuoc: 2 } }, "Giữ được nhiều, ví cạn nhanh"),
           C("Chỉ chuộc những lô có người đã khuất", { money: -0.2, counters: { s47_chuoc: 1 }, flags: ["s47_chon_loc"] }, "Giữ cái quý nhất, mất những cái buồn cười nhất")]),
        card("s47_kd_ca_pho", "Cả con phố lên sàn", (c, k) => `Sang trang sau, bạn thấy ký ức của ba mươi nhà khác cùng phố cũng đang bị rao bán, cùng một người mua. ${has(c, "s47_do_nguoi_mua") ? `${cap(k.npc("tho_may"))} đã dò ra: người đó đang gom ký ức của cả khu.` : "Không ai biết người ta gom chừng ấy ký ức để làm gì."}`,
          [C("Lập nhóm các nhà bị rao bán", { flags: ["s47_nhom"], counters: { s47_pt: 1 } }, "Đông thì mạnh, nhưng việc nhà mình phải chờ", { tier: "sovereign" }),
           C("Lo cho nhà mình trước", { flags: ["s47_lo_minh"], counters: { s47_chuoc: 1 }, money: -0.1 }, "Nhanh hơn, và hàng xóm sẽ nhớ")]),
      ],
      [
        card("s47_cl_doan_phim", "Đoạn phim chưa từng xem", (c, k) => `Lô số bốn mươi hai là một đoạn phim bạn chưa từng xem: ${k.scar("nguoi") || "một người bạn từng thương"} đứng trước máy quay, nhắc tới ${k.scar("do") || "một món đồ cũ của bạn"}, định nói điều gì đó về bạn thì phim dừng. Giá khởi điểm bằng ba tháng chi tiêu của cả nhà.`,
          [C("Mua bằng mọi giá", { money: -0.6, counters: { s47_chuoc: 2 }, happy: 3, flags: ["s47_mua_phim"] }, "Biết được câu nói ấy, trả bằng tiền ăn"),
           C("Để người khác mua, chỉ xem đoạn xem thử", { happy: -2, flags: ["s47_xem_thu"] }, "Giữ được tiền, câu nói bỏ lửng mãi mãi")]),
      ],
      [
        card("s47_day_can_tien", "Tài khoản về không", (c, k) => `Tài khoản về không vào một sáng thứ năm. ${cap(k.npc("nguoi_mua"))} gửi lời đề nghị: mua trọn gói mọi ký ức còn lại, kể cả những ký ức nhà bạn chưa kịp có. ${has(c, "s47_hop_nha") ? "Cả nhà ngồi quanh bàn, không ai dám nhìn ai." : "Bạn ngồi một mình, đọc đi đọc lại ba chữ chưa kịp có."}`,
          [C("Vay tiền để chuộc tiếp", { custom: "borrow:0.5", counters: { s47_chuoc: 1 } }, "Còn sức đấu tiếp, thêm một món nợ"),
           C("Bán bớt đồ trong nhà", { money: 0.3, happy: -2, flags: ["s47_ban_do"] }, "Không nợ thêm, nhà trống dần")]),
        card("s47_day_lo_mat", "Người mua lộ mặt", (c, k) => `${cap(k.npc("nguoi_mua"))} hẹn gặp bạn ở quán nước đầu ngõ. Hóa ra đó là một người già sống một mình, không có lấy một tấm ảnh của nhà mình, nên mua ký ức nhà người khác để xem mỗi tối. ${k.gag()}`,
          [C("Mời ông về ăn cơm với nhà mình", { rel: 3, flags: ["s47_moi_com"] }, "Thêm một người nhà, chưa chắc lấy lại được gì"),
           C("Kiện ông ta ra tòa", { money: -0.3, flags: ["s47_kien"], counters: { s47_pt: 1 } }, "Có thể thắng, chắc chắn làm khổ một người đáng thương")]),
      ],
      [
        card("s47_ket", "Phiên đấu giá cuối cùng", (c, k) => `Phiên đấu giá cuối cùng mở lúc tám giờ tối. ${k.gag()} ${cap(k.scar("no") || "khoản vay chuộc ký ức")} vẫn chưa trả, còn ${k.npc("nguoi_mua")} ${has(c, "s47_moi_com") ? "ngồi cạnh bạn, tay không cầm bảng" : "ngồi ở hàng ghế đầu, chưa giơ bảng"}.`,
          (c) => {
            const out: Choice[] = [ending(S47_CHUOC, "Chuộc nốt, bằng mọi giá", "Giữ ký ức, mất tiền tích cóp"),
              ending(S47_BAN, "Bán nốt quyền ký ức", "Có tiền đổi đời, mất những gì không mua lại được")];
            if (c.age >= 18 && c.age <= 65) {
              const pt = ending(S47_PT, "Biến phiên đấu thành phong trào", "Không giàu, nhưng cả phố đứng sau bạn");
              if (n(c, "s47_pt") >= 2) out.unshift(pt); else out.push(pt);
            }
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: từng tấm ảnh nhà bạn lên sàn đấu giá");

/* ================================================================== S48 — Kẻ buồn hợp pháp */

const S48_PT = land("s48_phong_trao", "Bạn dẫn đầu phong trào đòi quyền được buồn. Thành phố mở những căn phòng không camera, và bạn có một nghề không ai dạy.", { custom: "become:activist", happy: 4 });
const S48_DI = land("s48_di_cu", "Bạn sang một nước không chấm điểm hạnh phúc, nơi người ta được phép mặt nặng mày nhẹ.", { custom: "migrate_now", money: -1 });
const S48_QUE = land("s48_ve_noi_it_camera", "Bạn dọn tới một thị trấn nhỏ ít camera, nơi người ta còn được ngồi buồn trước hiên nhà.", { custom: "move_city", happy: 3 });
const S48_CUOI = land("s48_cuoi_chuan", "Bạn luyện được nụ cười đạt chín mươi điểm. Lương tăng, điểm tăng, và không ai biết bạn thật ra đang nghĩ gì.", { income_mult: 1.3, happy: -4 });

const s48: WeirdBranch = weird("S48", "sf", ["luat", "tinh", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && c.happy < 35,
  () => "Nộp phạt và cứ tiếp tục buồn",
  (s) => ({
    title: "Điểm hạnh phúc quá thấp",
    text: `Từ hôm nay, mỗi lần bạn buồn ở nơi công cộng sẽ bị trừ tiền thẳng vào tài khoản. Camera trên cột đèn ở ${s.noi || "nơi này"} quay về phía bạn, chớp một cái, rồi điện thoại rung: "Bạn được 41 điểm. Hãy cười để tránh bị phạt."`,
  }),
  season({
    id: "w_S48", vn: "Kẻ buồn hợp pháp", color: "#5c6bc0", years: [6, 10], weird: "sf",
    rules: { income: 0.85, flags: ["w_cham_diem_vui"] },
    reset: { cast: [{ key: "kiem_dinh", role: "official", label: "nhân viên kiểm định nụ cười" }, { key: "ong_bong_bay", role: "mentor", label: "ông già bán bóng bay không bao giờ cười" }] },
    gag: { key: "camera_cham", lines: [
      "Camera ở cửa chấm bạn 41 điểm hạnh phúc. Con chó nhà bên đi ngang, được 88.",
      "Camera chấm bạn 39 điểm. Cái bình hoa giả trên bàn được 90.",
      "Camera chấm bạn 52 điểm, cao nhất từ trước tới nay. Hóa ra lúc đó bạn đang hắt hơi.",
      "Camera chấm 100 điểm cho tấm ảnh cười bạn dán trước ống kính. Không ai sửa lỗi này.",
    ] },
    landings: [S48_PT, S48_DI, S48_CUOI, S48_QUE],
    beats: [
      [
        card("s48_mo_phat", "Tin nhắn trừ tiền đầu tiên", (c, k) => `Tin nhắn trừ tiền đầu tiên tới lúc bạn đang xếp hàng mua bánh mì, mặt chưa kịp tỉnh ngủ. ${k.gag()}`,
          [C("Nộp phạt, sống tiếp", { money: -0.1, counters: { s48_phat: 1 } }, "Giữ được mặt thật, ví nhẹ dần"),
           C("Tập cười trước gương mỗi sáng", { health: -1, counters: { s48_cuoi: 1 }, flags: ["s48_tap_cuoi"] }, "Đỡ bị phạt, mỏi cơ mặt và mỏi lòng")]),
        card("s48_mo_bong_bay", "Chùm bóng bay ở góc công viên", (c, k) => `Ở góc công viên, ${k.npc("ong_bong_bay")} đứng giữa chùm bóng bay đủ màu, mặt buồn hiu, bị phạt tới mức chỉ còn đúng chùm bóng. Ông chỉ cho bạn một tầng hầm sau tiệm sửa xe: "Dưới đó không có camera. Muốn buồn thì xuống."`,
          [C("Xuống tầng hầm ngồi một buổi", { happy: 3, flags: ["s48_tang_ham"] }, "Được buồn cho đã, từ nay bạn giữ một bí mật"),
           C("Cảm ơn rồi đi thẳng", { flags: ["s48_tranh"], counters: { s48_cuoi: 1 } }, "An toàn, nhưng không còn chỗ nào để buồn")]),
      ],
      [
        card("s48_kd_kiem_dinh", "Hai phút giữ nụ cười", (c, k) => `${cap(k.npc("kiem_dinh"))} gọi bạn lên phòng kiểm định, bấm đồng hồ: bạn phải giữ nụ cười trọn hai phút. Tới giây thứ bốn mươi, má bạn bắt đầu giật. ${k.gag()}`,
          [C("Cười gắng cho đủ hai phút", { counters: { s48_cuoi: 1 }, health: -2 }, "Qua được kiểm định, mặt tê cả chiều"),
           C("Bật khóc ngay tại chỗ", { counters: { s48_phat: 2 }, flags: ["s48_khoc"], happy: 2 }, "Nhẹ lòng, hồ sơ bị đánh dấu đỏ")]),
        card("s48_kd_ha_bac", "Bị hạ bậc vì buồn", (c) => `${c.has_job ? "Chỗ làm nhận được điểm hạnh phúc của bạn và hạ bậc lương" : "Văn phòng trợ cấp nhận được điểm hạnh phúc của bạn và cắt một nửa tiền hỗ trợ"}, "vì nỗi buồn dễ lây". ${has(c, "s48_tang_ham") ? "Dưới tầng hầm tối qua, ba người ngồi cạnh bạn cũng vừa bị như vậy." : "Người quen đi ngang bạn đều cố cười to hơn thường lệ."}`,
          [C("Thuê người cười hộ trong ảnh hồ sơ", { money: -0.2, flags: ["s48_thue_cuoi"], counters: { s48_cuoi: 1 } }, "Qua mặt được máy, lần sau giá cao hơn"),
           C("Ký đơn chung với những người cùng cảnh", { flags: ["s48_don_chung"], counters: { s48_pt: 1 } }, "Có đồng đội, cũng có tên trong danh sách theo dõi")]),
      ],
      [
        card("s48_cl_nut_hong", "Cái nút màu hồng", (c, k) => `Hệ thống gợi ý: điểm của bạn sẽ tăng gấp đôi nếu đồng ý xóa mọi ảnh và tin nhắn có ${k.scar("nguoi") || "một người bạn từng thương"}, cùng mọi dấu vết của ${k.scar("do") || "những món đồ gợi nhớ chuyện cũ"}. Một cái nút màu hồng, rất to, nhấp nháy.`,
          [C("Bấm xóa cho xong", { counters: { s48_cuoi: 2 }, flags: ["s48_xoa"], happy: -3 }, "Điểm tăng vọt, một phần đời biến mất"),
           C("Giữ nỗi buồn của mình", { counters: { s48_pt: 1 }, flags: ["s48_giu_buon"] }, "Điểm vẫn thấp, nhưng nỗi buồn là của bạn")]),
      ],
      [
        card("s48_day_niem_phong", "Tầng hầm bị niêm phong", (c, k) => `Một sáng, tầng hầm sau tiệm sửa xe bị niêm phong. ${cap(k.npc("ong_bong_bay"))} bị mời đi làm việc vì "tổ chức buồn trái phép", chùm bóng bay buộc tạm vào cột điện. ${k.gag()}`,
          [C("Đứng ra làm chứng cho ông", { counters: { s48_pt: 2 }, flags: ["s48_lam_chung"] }, "Đúng với lòng mình, hồ sơ bạn đỏ thêm"),
           C("Im lặng, cười cho qua", { counters: { s48_cuoi: 1 }, happy: -3 }, "An toàn, và không quên được chùm bóng bay")]),
        card("s48_day_bang", "Dòng cuối bảng xếp hạng", (c) => `Bảng xếp hạng hạnh phúc của thành phố công bố, tên bạn nằm ở dòng cuối cùng. ${n(c, "s48_cuoi") >= 3 ? "Dù bạn đã cười nhiều hơn bao giờ hết, máy vẫn chấm thấp." : (c.has_job ? "Bạn bị nhắc nhở ở chỗ làm, bị hàng xóm né, bị quán quen từ chối phục vụ." : "Bạn bị cắt nốt trợ cấp, bị hàng xóm né, bị quán quen từ chối phục vụ.")} Một tờ đơn xin định cư nước ngoài nằm sẵn trong ngăn kéo.`,
          [C("Nộp đơn đi nước ngoài", { flags: ["s48_nop_don_di"], money: -0.1 }, "Có lối thoát, phải bỏ lại tất cả"),
           C("Tổ chức một buổi buồn công khai", { counters: { s48_pt: 2 }, flags: ["s48_buoi_buon"] }, "Có thể thành phong trào, có thể thành án phạt")]),
      ],
      [
        card("s48_ket", "Phiên họp về luật nụ cười", (c, k) => `Hội đồng thành phố mở phiên họp về luật chấm điểm, và tên bạn có trong danh sách phát biểu. ${k.gag()} ${cap(k.scar("no") || "một lời hứa cũ")} vẫn nằm đó, như mọi nỗi buồn chưa xong.`,
          (c) => {
            const di = ending(S48_DI, "Đi nước ngoài, nơi được phép buồn", "Thoát luật, bỏ lại mọi người");
            const yen = c.has_job && !c.retired && c.age <= 65
              ? ending(S48_CUOI, "Luyện nụ cười đạt chuẩn, sống yên", "Lương tăng, mặt mình không còn là của mình")
              : ending(S48_QUE, "Dọn về thị trấn nhỏ ít camera", "Yên thân, nhưng phải xa mọi thứ quen thuộc");
            if (c.age < 18 || c.age > 65) return has(c, "s48_nop_don_di") ? [di, yen] : [yen, di];
            const pt = ending(S48_PT, "Đứng lên phát biểu, dẫn đầu phong trào", "Có thể đổi luật, chắc chắn mất yên ổn");
            return n(c, "s48_pt") >= 3 ? [pt, di, yen] : has(c, "s48_nop_don_di") ? [di, pt, yen] : [yen, pt, di];
          }),
      ],
    ],
  }),
  "Viễn tưởng: buồn là phạm luật, cả thành phố bị ép cười");

/* ================================================================== S49 — Người thấy giá */

const S49_GIAU = land("s49_giau_lanh", "Bạn giàu lên nhanh hơn bất kỳ ai ở chợ, nhưng nhìn ai cũng thấy một con số trước khi thấy khuôn mặt.", { money: 4, rel: -8, happy: -3 });
const S49_LY = land("s49_chia_tay", "Người bạn đời dọn đi, để lại một tờ giấy không ghi giá. Bạn giàu, và lần đầu không biết thứ gì đáng bao nhiêu.", { custom: "spouse_leave", money: 3, happy: -6 });
const S49_DAU_TU = land("s49_dau_tu", "Bạn đóng sạp, mở văn phòng đầu tư. Người ta trả tiền chỉ để bạn nhìn qua một món hàng.", { custom: "become:investor", rel: -4 });
const S49_MU = land("s49_mu_gia", "Sau ca mổ, các con số biến mất. Buôn bán chậm hẳn, nhưng nhìn người thân lại thấy mặt người thân.", { income_mult: 0.7, happy: 6, rel: 6 });

const s49: WeirdBranch = weird("S49", "sf", ["than", "tien", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && c.pressure.than >= 6 && (c.flags.has("job_market") || c.flags.has("own_business") || c.flags.has("shop_active") || c.owns.has("shop")),
  () => "Ra chợ thử con mắt mới",
  (s) => ({
    title: "Mọi thứ đều có giá",
    text: `Từ sau cú ngã ở cầu thang chợ, bạn nhìn đâu cũng thấy giá, và chưa lần nào sai. Trên đầu cái giường bệnh lơ lửng một con số, trên cây bút của cô y tá một con số khác, trên ô cửa sổ nhìn ra ${s.noi || "thành phố"} cũng vậy. Bạn hỏi bác sĩ mình bị gì, ông chỉ nói: "Đừng soi gương vội."`,
  }),
  season({
    id: "w_S49", vn: "Người thấy giá", color: "#3d4fb0", years: [6, 10], weird: "sf",
    rules: { income: 1.6, flags: ["w_thay_gia"] },
    reset: { cast: [{ key: "ba_sap", role: "rival", label: "bà chủ sạp đối diện" }, { key: "bac_si", role: "mentor", label: "ông bác sĩ thần kinh mê giải ô chữ" }] },
    gag: { key: "nhan_guong", lines: [
      "Bạn soi gương. Trên đầu người trong gương có tấm nhãn: \"Hàng trưng bày, không bán.\"",
      "Bạn soi gương lần nữa. Tấm nhãn đổi thành: \"Giảm ba mươi phần trăm, hàng lỗi nhẹ.\"",
      "Gương hôm nay ghi: \"Còn hàng, ít người hỏi.\"",
      "Lần cuối soi gương, tấm nhãn ghi: \"Liên hệ để biết giá.\" Bạn đứng nhìn rất lâu.",
    ] },
    landings: [S49_GIAU, S49_LY, S49_DAU_TU, S49_MU],
    beats: [
      [
        card("s49_mo_guong", "Tấm gương trong bệnh viện", (c, k) => `Ngày ra viện, bạn đứng trước tấm gương nhà vệ sinh bệnh viện, mặc kệ lời dặn của bác sĩ. ${k.gag()}`,
          [C("Ra chợ thử ngay", { flags: ["s49_thu"], counters: { s49_loi: 1 } }, "Biết ngay có đúng không, chưa kịp nghĩ cái giá"),
           C("Kể hết cho bác sĩ nghe", { flags: ["s49_bao_bac_si"], know: 1 }, "Có người theo dõi, mất thế độc quyền")]),
        card("s49_mo_lo_binh", "Lô bình cũ ai cũng chê", (c, k) => `Cuối chợ có một lô hàng ai cũng chê: mấy chục cái bình cũ phủ bụi, giá rẻ như cho. Trên đầu mỗi cái bình, bạn thấy một con số dài gấp năm lần. ${cap(k.npc("ba_sap"))} đứng bên kia lối đi, cũng đang ngắm lô hàng.`,
          [C("Mua hết, ngay trước mặt bà", { money: 0.5, counters: { s49_loi: 1, s49_lanh: 1 } }, "Lãi to ngay, thêm một đối thủ ghi thù"),
           C("Mua một nửa, chừa bà một nửa", { money: 0.2, flags: ["s49_nhuong"], rel: 1 }, "Lãi vừa, giữ được một người hàng xóm")]),
      ],
      [
        card("s49_kd_bua_com", "Con số trong bữa cơm", (c, k) => `Bữa cơm tối, bạn ngẩng lên và thấy một con số lơ lửng trên đầu ${c.married ? "người bạn đời" : "người thân ngồi đối diện"}. Con số không lớn lắm. ${k.gag()}`,
          [C("Cúi xuống, không nhìn nữa", { flags: ["s49_ne"], happy: -1 }, "Giữ được bữa cơm, mang theo một con số"),
           C("Nhìn cho rõ từng chữ số", { counters: { s49_lanh: 1 }, know: 1 }, "Biết rõ hơn, khó quên hơn")]),
        card("s49_kd_sap", "Cái sạp bên kia lối đi", (c, k) => `Sau một năm bạn thắng mọi phiên chợ, ${k.npc("ba_sap")} sang hỏi bán lại cái sạp của mình, giá nào cũng được. Con số trên đầu cái sạp thấp tới mức bạn hơi ngượng. ${has(c, "s49_nhuong") ? "Bà vẫn nhớ lần bạn chừa cho bà nửa lô bình." : "Bà không nhắc gì tới lô bình cũ năm ngoái."}`,
          [C("Trả đúng giá bạn thấy", { money: -0.3, counters: { s49_loi: 2, s49_lanh: 1 } }, "Mua rẻ, thêm một người không bao giờ tha thứ"),
           C("Trả hơn giá, cho bà đường lui", { money: -0.6, flags: ["s49_tra_hon"], rel: 2 }, "Thiệt tiền, được một người nhớ ơn")]),
      ],
      [
        card("s49_cl_khong_gia", "Thứ không có giá", (c, k) => `Bạn nghĩ tới thứ mang theo từ đời cũ, ${k.scar("do") || "một món đồ từ thời còn nghèo"}, và lần đầu tiên từ sau cú ngã, không có con số nào hiện lên. Còn khi ${k.scar("nguoi") || "một người bạn cũ"} ghé chơi, trên đầu người ấy hiện một con số rất nhỏ, nhỏ hơn hẳn những gì bạn nhớ.`,
          [C("Tin con số, cắt đứt người cũ", { counters: { s49_lanh: 2 }, flags: ["s49_cat_dut"] }, "Đỡ mất thời gian, mất một người quen cả đời"),
           C("Tin thứ không có giá, giữ cả hai", { happy: 2, flags: ["s49_giu"] }, "Không lời lãi gì, nhưng lòng ấm lại")]),
      ],
      [
        card("s49_day_tan_gia", "Bữa tiệc mừng sạp thứ ba", (c) => `Bạn mở tiệc mừng sạp hàng thứ ba, khách đông, đồ ăn ngon, không ai vui. ${n(c, "s49_lanh") >= 2 ? "Bạn đã nhẩm xong giá của từng vị khách trước khi họ kịp chào." : "Bạn cố không nhìn lên đầu ai."} ${c.married ? "Người bạn đời" : "Một người thân"} kéo bạn ra ban công, nói rất khẽ: "Dạo này nhìn tôi như nhìn hàng."`,
          [C("Xin lỗi, hứa đi khám lại", { flags: ["s49_hua_kham"], rel: 2 }, "Giữ được người ở lại, hứa thì phải giữ"),
           C("Giải thích bằng con số", { counters: { s49_lanh: 2 }, flags: ["s49_giai_thich"] }, "Đúng từng chữ số, sai mọi thứ khác")]),
        card("s49_day_ca_mo", "Ca mổ có thể xóa giá", (c, k) => `${cap(k.npc("bac_si"))} vừa điền xong ô chữ, vừa nói: một ca mổ nhỏ có thể làm các con số biến mất, nhưng không ai hứa trả lại được những gì đã mất. ${k.gag()}`,
          [C("Hẹn ngày mổ", { flags: ["s49_hen_mo"], money: -0.3 }, "Có đường quay về, mất con mắt hái ra tiền"),
           C("Xé giấy hẹn", { counters: { s49_loi: 1, s49_lanh: 1 }, flags: ["s49_xe_hen"] }, "Giữ con mắt vàng, thêm một năm nhìn người như hàng")]),
      ],
      [
        card("s49_ket", "Thứ duy nhất không thấy giá", (c, k) => `${cap(k.scar("no") || "món nợ cũ")} là thứ duy nhất bạn chưa bao giờ nhìn ra giá. Sáng nay, ${has(c, "s49_hen_mo") ? "giấy hẹn mổ nằm trên bàn" : "một lời mời mở văn phòng đầu tư nằm trên bàn"}, cạnh ${c.married ? "chiếc nhẫn cưới" : "chùm chìa khóa sạp mới"}. ${k.gag()}`,
          (c) => {
            const giu = c.married
              ? ending(S49_LY, "Giữ con mắt, để người kia ra đi", "Giàu thêm, nhà vắng đi một người")
              : ending(S49_GIAU, "Giữ con mắt, buôn tiếp", "Giàu thêm, ai cũng chỉ là một con số");
            const mu = ending(S49_MU, "Lên bàn mổ, chấp nhận mù giá", "Buôn chậm lại, nhìn người lại thấy người");
            const out: Choice[] = has(c, "s49_hen_mo") || has(c, "s49_hua_kham") ? [mu, giu] : [giu, mu];
            if (c.age >= 22 && c.age <= 65) out.push(ending(S49_DAU_TU, "Đóng sạp, mở văn phòng đầu tư", "Bán con mắt mình theo giờ, giàu và lạnh"));
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: buôn đâu thắng đó, nhìn người cũng thấy giá");

/* ================================================================== S50 — Người không tồn tại */

const S50_TEN_MOI = land("s50_ten_moi", "Bạn bắt đầu lại dưới một cái tên mới ở thành phố khác: không nợ, không nghề, không ai nhớ mặt.", { custom: "repay:5|job_lose|move_city", happy: 3 });
const S50_TEN_CU = land("s50_ten_cu", "Hệ thống khôi phục bạn kèm đầy đủ nợ nần và một khoản phạt vì đã không tồn tại quá hạn.", { money: -1.5, happy: -2 });
const S50_GIUP = land("s50_giup_nguoi", "Bạn làm cho một văn phòng nhỏ chuyên đưa những người bị xóa trở lại sổ sách.", { custom: "become:social_worker", happy: 3 });

const s50: WeirdBranch = weird("S50", "sf", ["luat", "tien", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && c.debt > 0 && (c.pressure.luat >= 4 || c.debt > c.income),
  () => "Sống tiếp như một người không có tên",
  (s) => ({
    title: "Bạn không còn tồn tại",
    text: `Sáng thứ hai, hệ thống xóa bạn khỏi mọi hồ sơ, và xóa luôn mọi khoản nợ mang tên bạn. Thẻ ra vào kêu bíp đỏ, ngân hàng không tìm thấy khách hàng nào như vậy, sổ nợ ở ${s.noi || "nơi này"} trắng tinh. Người ở quầy hành chính nhìn màn hình rất lâu rồi ngẩng lên: "Xin lỗi, bạn là ai cơ?"`,
  }),
  season({
    id: "w_S50", vn: "Người không tồn tại", color: "#55489e", years: [5, 9], weird: "sf",
    rules: { income: 0.6, flags: ["w_khong_ton_tai"] },
    reset: { cast: [{ key: "o_quay", role: "official", label: "cô nhân viên quầy số bảy" }, { key: "ong_khong_ten", role: "mentor", label: "ông già không tồn tại từ mười năm nay" }] },
    gag: { key: "may_lay_so", lines: [
      "Máy lấy số in ra một tờ giấy trắng tinh. Người ở quầy nhìn tờ giấy, rồi nhìn xuyên qua bạn.",
      "Máy lấy số lại in giấy trắng. Bạn xếp hàng bằng tờ giấy trắng, người phía sau cũng xếp hàng sau tờ giấy trắng.",
      "Máy lấy số hôm nay in giấy trắng cho cả ba người đứng trước bạn. Có người vỗ vai: \"Chào mừng tới hội.\"",
      "Máy lấy số in ra một con số thật. Bạn cầm nó lên, tay hơi run, như cầm tờ vé trúng giải.",
    ] },
    landings: [S50_TEN_MOI, S50_TEN_CU, S50_GIUP],
    beats: [
      [
        card("s50_mo_lay_so", "Khiếu nại việc mình không tồn tại", (c, k) => `Bạn tới văn phòng hành chính ở ${k.noi} để khiếu nại việc mình không tồn tại. ${k.gag()}`,
          [C("Ngồi chờ cho tới lượt", { flags: ["s50_khieu_nai"], health: -1 }, "Kiên nhẫn, chưa biết chờ tới bao giờ"),
           C("Về nhà ăn mừng: không còn nợ ai", { happy: 4, flags: ["s50_an_mung"] }, "Vui hôm nay, mai thì chưa biết")]),
        card("s50_mo_cong_ty", "Chỗ làm không có tên bạn", (c) => `${c.has_job ? "Ở chỗ làm, phòng nhân sự không tìm ra hợp đồng của bạn" : "Ở chỗ làm thuê theo ngày, sổ chấm công không còn dòng nào mang tên bạn"}. Người trả lương gãi đầu: muốn trả cũng không biết trả cho ai, mà không trả thì cũng không biết nợ ai.`,
          [C("Làm tiếp, nhận tiền mặt", { money: 0.1, flags: ["s50_tien_mat"] }, "Có tiền ăn, không có gì chứng minh mình làm"),
           C("Nghỉ ở nhà chờ hệ thống sửa", { money: -0.2, flags: ["s50_nghi_viec"] }, "Giữ thể diện, ví mỏng nhanh")]),
      ],
      [
        card("s50_kd_thu_vien", "Góc cửa sổ trong thư viện", (c, k) => `Trong thư viện công cộng, ${k.npc("ong_khong_ten")} ngồi ở góc cửa sổ, đọc báo không mất tiền suốt mười năm. Ông nói người không tồn tại được miễn nhiều thứ lắm, chỉ có điều không ai chịu nghe mình kể chuyện.`,
          [C("Theo ông học cách sống ngoài sổ sách", { flags: ["s50_hoc_ong"], know: 2, counters: { s50_ten_moi: 1 } }, "Sống được, nhưng ngày càng xa tên cũ"),
           C("Cảm ơn, mình sẽ sớm quay lại sổ", { flags: ["s50_tranh_ong"], counters: { s50_ten_cu: 1 } }, "Giữ hy vọng, bỏ lỡ một người thầy lạ")]),
        card("s50_kd_chu_no", "Chủ nợ cầm cuốn sổ trắng", (c, k) => `Chủ nợ cũ đứng trước cửa, tay cầm cuốn sổ trắng tinh, mặt rất khổ sở: ông nhớ bạn nợ, nhưng không còn tờ giấy nào chứng minh. Chiều đó hai người đứng cạnh nhau ở hàng chờ văn phòng hành chính. ${k.gag()}`,
          [C("Tự nhận nợ, viết giấy tay", { flags: ["s50_nhan_no"], counters: { s50_ten_cu: 1 } }, "Sòng phẳng, tự buộc mình lại"),
           C("Nói người ông tìm đã chuyển đi", { flags: ["s50_choi_no"], counters: { s50_ten_moi: 1 } }, "Thoát nợ thật, và thêm một lời nói dối")]),
      ],
      [
        card("s50_cl_nguoi_cu", "Người đi ngang không chào", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} đi ngang bạn ở chợ, nhìn thẳng mà không chào, như thể hệ thống đã xóa luôn bạn trong trí nhớ người ta. Thứ duy nhất còn nói được bạn là ai là ${k.scar("do") || "một món đồ cũ có khắc tên bạn"}.`,
          [C("Dùng nó để chứng minh mình là ai", { flags: ["s50_bang_chung"], counters: { s50_ten_cu: 1 } }, "Có cơ hội lấy lại tên, cũng lấy lại nợ"),
           C("Bỏ nó lại, bắt đầu làm người khác", { flags: ["s50_buong_ten"], counters: { s50_ten_moi: 1 } }, "Nhẹ người, một phần đời bỏ lại phía sau")]),
      ],
      [
        card("s50_day_om", "Ốm mà không có tên", (c, k) => `Bạn sốt cao một tuần. Bệnh viện cần giấy tờ, còn bạn chỉ có ${has(c, "s50_tien_mat") ? "một nắm tiền công trả tay" : "vài đồng còn sót lại"} và một cái tên không máy nào tra ra. ${has(c, "s50_hoc_ong") ? `${cap(k.npc("ong_khong_ten"))} đã dặn trước chuyện này, kèm một địa chỉ.` : "Bạn chưa từng hỏi ai xem người không tên thì ốm ở đâu."}`,
          [C("Trả tiền mặt, gấp ba giá", { money: -0.4, health: 3 }, "Khỏi bệnh, hết sạch tiền dành dụm"),
           C("Tìm tới phòng khám tình nguyện", { health: 2, flags: ["s50_phong_kham"], counters: { s50_ten_moi: 1 } }, "Được chữa miễn phí, quen thêm những người không tên")]),
        card("s50_day_ban_sao", "Một bản ghi gần giống bạn", (c, k) => `${k.gag()} Tới lượt, ${k.npc("o_quay")} ${has(c, "s50_nhan_no") ? "nhắc tới tờ giấy nợ viết tay bạn đã nộp, rồi" : "chẳng hỏi gì,"} xoay màn hình cho bạn xem: hệ thống tìm thấy một bản ghi gần giống bạn, chỉ sai ngày sinh và có thêm một khoản nợ lạ. Nhận thì có lại tên, không nhận thì thôi.`,
          [C("Nhận bản ghi, sửa dần", { flags: ["s50_ban_ghi"], counters: { s50_ten_cu: 1 }, money: -0.2 }, "Có tên lại, gánh luôn món nợ lạ"),
           C("Từ chối bản ghi", { counters: { s50_ten_moi: 1 }, flags: ["s50_tu_choi_ban_ghi"] }, "Giữ sự thật, vẫn chưa là ai cả")]),
      ],
      [
        card("s50_ket", "Ba tờ đơn ở quầy số bảy", (c, k) => `${k.gag()} ${cap(k.npc("o_quay"))} đẩy sang ba tờ đơn. ${cap(k.scar("no") || "món nợ cũ")} sẽ quay lại nếu bạn ký tờ đầu, và biến mất mãi mãi nếu bạn ký tờ thứ hai.`,
          (c) => {
            const moi = ending(S50_TEN_MOI, "Ký tờ thứ hai: tên mới, không nợ", "Sạch nợ, mất nghề, làm lại từ đầu");
            const cu = ending(S50_TEN_CU, "Ký tờ đầu: lấy lại tên cũ", "Có lại đời mình, kèm cả nợ và tiền phạt");
            const out: Choice[] = n(c, "s50_ten_cu") > n(c, "s50_ten_moi") ? [cu, moi] : [moi, cu];
            if (c.age >= 22 && c.age <= 55) out.push(ending(S50_GIUP, "Ký tờ thứ ba: giúp người bị xóa", "Có nghề mới, sống giữa những người không tên"));
            return out;
          }),
      ],
    ],
  }),
  "Viễn tưởng: không giấy tờ, nhưng cũng không còn nợ");

export const SF_41: WeirdBranch[] = [s41, s42, s43, s44, s45, s46, s47, s48, s49, s50];

