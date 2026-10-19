/**
 * Nhánh kỳ dị X31–X40 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 *
 * Phi lý cực độ, giọng sitcom: cược ngay câu đầu, một hình ảnh cụ thể, một câu thoại ngắn.
 * Thẻ sau đọc cờ / bộ đếm của thẻ trước (tiền tố x31_ … x40_). Chung kết chọn landing theo tuổi:
 * nghề chỉ mở khi tuổi ≤ ages[1] + 5 của con đường đó.
 */
import type { Choice, FactContext } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import { C, cap, card, ending, land, migrateOk, noOr, pathOpen, season, weird } from "../kit.ts";

const f = (c: FactContext, x: string): boolean => c.flags.has(x);
const n = (c: FactContext, x: string): number => c.counters[x] ?? 0;
/** 2–3 lựa chọn: bỏ chỗ trống, lấy tối đa 3 theo thứ tự. */
const pick = (...xs: (Choice | undefined)[]): Choice[] => xs.filter((x): x is Choice => !!x).slice(0, 3);
/** Lòng tin của mẹ (nếu mẹ còn trong dàn nhân vật). */
const momTrust = (c: FactContext, delta: number) => (c.cast.mother ? { trust: { npc: c.cast.mother, delta } } : {});
/** 12345 → "12.345". */
const dots = (x: number): string => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/** Tên NPC theo id, hoặc chữ dự phòng khi host không có tên ("", chính id, "ai đó"). */
const nameOr = (N: (id: string) => string, id: string | undefined, dflt: string): string => {
  if (!id) return dflt; const v = N(id); return !v || v === id || v === "ai đó" ? dflt : v;
};
const anyFlag = (c: FactContext, xs: string[]): boolean => xs.some((x) => c.flags.has(x));
/** Cách người khác gọi người chơi: "cô" hay "cậu". */
const xung = (c: FactContext): string => (c.sex === "F" ? "cô" : "cậu");
/** Chữ dự phòng chung cho vết "do" (có thể là đồ vật, con vật, kỹ năng, tài sản hay nghề): luôn đi kèm "thứ bạn mang theo từ đời trước". */
const DO_TAIL = "thứ bạn mang theo từ đời trước";
/** Vết "do" kèm DO_TAIL; vết rỗng thì chỉ chữ dự phòng (dự phòng không phải thứ mang theo từ đời trước, nên không gắn đuôi). */
const doTail = (k: { scar: (x: "do") => string }, dflt: string): string => { const d = k.scar("do"); return d ? `${d}, ${DO_TAIL}` : dflt; };

/* ================================================================== X31 Cầu thủ ba con lợn */

const L31_CAU_THU = land("cau_thu_chuyen_nghiep", "Bạn ký hợp đồng chuyên nghiệp đầu tiên, trả bằng tiền. Ba con lợn được mời lên khán đài dự lễ ký.", { custom: "become:footballer", happy: 6 });
const L31_HLV = land("hlv_doi_lang", "Bạn treo giày và nhận dẫn dắt đội làng. Lương vẫn trả bằng lợn, nhưng giờ là cả chuồng.", { custom: "become:coach", happy: 4 }); // gần nhất: cầu thủ quá tuổi → huấn luyện viên
const L31_TRAI = land("trai_lon_huyen_thoai", "Ba con lợn ngày ấy sinh sôi thành một trại bốn mươi con. Bạn giải nghệ và làm chủ chính giá chuyển nhượng của mình.", { money: 2, happy: 3 });
const L31_LEN_PHO = land("len_pho_da_bong", "Bạn theo một đội phong trào lên phố, đá giải công nhân buổi tối, ban ngày tìm việc như mọi người.", { custom: "move_city", money: -0.2 });
/** Đã bán lợn giữa mùa (x31_ban_lon): trại lợn phải gây lại từ đầu. */
const L31_TRAI_MOI = land("trai_lon_gay_lai", "Bạn giải nghệ, gây lại đàn từ đôi lợn giống mua bằng tiền thưởng, và cuối cùng có một trại bốn mươi con.", { money: 1.8, happy: 3 });

const X31 = weird("X31", "abs", ["than", "danh"],
  (c) => c.age >= 18 && c.age <= 45 &&
    (anyFlag(c, ["athlete", "pro_athlete", "life_footballer", "talent_footballer", "ex_footballer"]) || n(c, "exercise") >= 6),
  () => "Để đội bóng làng mua mình bằng ba con lợn",
  (s, c) => ({
    title: "Giá chuyển nhượng: ba con lợn",
    text: `Chiều nay, giá trị của bạn được định bằng ba con lợn đang kêu eng éc ${s.noi ? "ở cổng sân " + s.noi : "ngay đầu ngõ"}. Ông bầu đội bóng làng bên dắt chúng tới tận nơi, tay cầm bản hợp đồng viết trên giấy vở học trò. "Một con ký hợp đồng, một con thưởng ra mắt, con thứ ba để ${xung(c)} đừng đổi ý." Cả nhà nhìn bạn, rồi nhìn ba con lợn, và rõ ràng đang so sánh.`,
  }),
  season({
    id: "w_X31", vn: "Cầu thủ ba con lợn", color: "#d9822b", years: [6, 10], weird: "abs",
    rules: { income: 0.8, flags: ["w_ba_con_lon"] },
    reset: { cast: [{ key: "ong_bau", role: "first_boss", label: "ông bầu đội làng" }, { key: "doi_truong", role: "rival", label: "anh đội trưởng mũi gãy" }] },
    gag: { key: "ba_con_lon", lines: [
      "Ba con lợn được nhốt ngay sau khung thành. Mỗi lần bạn sút trượt, chúng kêu lên đồng thanh.",
      "Con lợn thứ hai vừa đẻ chín con. Ông bầu tuyên bố giá trị chuyển nhượng của bạn tăng gấp bốn.",
      "Cả làng họp ba đêm xem con bò của làng bên có bằng mười hai con lợn không. Kết luận: không, vì bò không biết kêu đồng thanh.",
      "Ba con lợn đầu tiên giờ đã già, ảnh của chúng được treo trong phòng thay đồ như ba huyền thoại.",
    ] },
    landings: [L31_CAU_THU, L31_HLV, L31_TRAI, L31_TRAI_MOI, L31_LEN_PHO],
    beats: [
      /* mo_man */
      [
        card("x31_mo_ra_mat", "Trận ra mắt trên sân ruộng", (c, k) => `Sân là một thửa ruộng vừa gặt, khung thành làm bằng tre, vạch vôi kẻ bằng tro bếp. ${cap(k.npc("ong_bau"))} vỗ vai bạn trước giờ bóng lăn: "Ghi một bàn, tối có thịt. Không ghi, tối cũng có thịt, nhưng không phải phần ${xung(c)}." ${k.gag()}`,
          [C("Lao lên ghi bàn bằng mọi giá", { health: -2, counters: { x31_ban: 1 }, flags: ["x31_ham_ban"] }, "Có bàn, có tiếng, sứt đầu gối"),
           C("Chuyền cho đồng đội đứng trống", { rel: 2, flags: ["x31_dong_doi"] }, "Đồng đội quý bạn, ông bầu thì nhíu mày")]),
        card("x31_mo_hop_dong", "Hợp đồng viết trên giấy vở", (c, k) => `Hợp đồng ghi rõ: lương mỗi tháng một bao cám, mỗi bàn thắng một con gà, mỗi thẻ đỏ phạt một ngày đi chăn. Dòng cuối viết bằng mực khác: "Cầu thủ không được bán sang làng khác." ${cap(k.npc("doi_truong"))} ghé tai bạn: "Ai ký dòng đó rồi cũng hối hận."`,
          [C("Ký nguyên văn, nhận bao cám", { happy: 2, flags: ["x31_ky_nguyen"] }, "Được lòng cả làng, nghèo thêm"),
           C("Đòi thêm một khoản tiền mặt", { money: 0.1, flags: ["x31_tien_mat"] }, "Có tiền tiêu, ông bầu để bụng"),
           C("Sửa dòng cuối: được bán nếu giá cao", { flags: ["x31_dieu_khoan_ban"] }, "Mở cửa ra đi, cả làng thấy bạn tính toán", { tier: "sovereign" })]),
      ],
      /* khoi_dong */
      [
        card("x31_kd_con_bo", "Làng bên trả giá bằng một con bò", (c, k) => `${f(c, "x31_dieu_khoan_ban") ? "Nhờ dòng chữ bạn sửa trong hợp đồng, lời đề nghị hoàn toàn hợp lệ." : "Hợp đồng cấm bán, nhưng ông bầu làng bên vẫn dắt con bò đứng chờ ở cổng."} ${k.gag()} ${n(c, "x31_ban") > 0 ? "Bàn thắng hôm ra mắt đã đến tai họ." : "Họ nói đã xem bạn chuyền bóng và thích cái đầu lạnh của bạn."}`,
          [C("Ở lại với ba con lợn", { happy: 2, flags: ["x31_trung_thanh"] }, "Cả làng gọi bạn là con cưng, ví vẫn mỏng"),
           C("Sang làng bên vì con bò", { money: 0.3, rel: -3, flags: ["x31_doi_bo"] }, "Giàu hơn, làng cũ gọi bạn là kẻ phản bội")]),
        card("x31_kd_co_chan", "Cổ chân kêu rắc", (c, k) => `Phút sáu mươi của trận tranh cúp xã, cổ chân bạn kêu một tiếng rắc nghe rõ đến tận chuồng lợn. ${cap(k.npc("doi_truong"))} quỳ xuống nhìn rồi nói nhỏ: "Còn đứng được thì đứng. Hết trận rồi đau." Khán giả đang hô tên bạn, sai mất một chữ.`,
          [C("Băng lại, đá tiếp hiệp hai", { health: -6, counters: { x31_ban: 1 }, flags: ["x31_da_dau"] }, "Thành người hùng, cổ chân không bao giờ lành hẳn"),
           C("Xin ra sân, đi bệnh viện", { money: -0.1, health: 2, flags: ["x31_nghi"] }, "Giữ được chân, mất trận và mất lòng đội")]),
      ],
      /* cu_lat */
      [
        card("x31_cl_tuyen_trach", "Người tuyển trạch trên bờ ruộng", (c, k) => `Một người đeo kính đen đứng trên bờ ruộng xem ba trận liền, ghi chép kín một cuốn sổ. Hóa ra ${k.scar("nguoi") || "một người quen cũ"} đã gửi thư giới thiệu bạn từ năm ngoái, trong thư nhắc đến ${doTail(k, "đôi giày cũ")}, như bằng chứng rằng bạn không bao giờ bỏ cuộc. ${f(c, "x31_da_dau") ? "Người đó nhìn cổ chân bạn rất lâu." : "Người đó nói đội tỉnh cần người còn nguyên hai cổ chân."} ${k.gag()}`,
          [C("Nhận thử việc ở đội tỉnh", { happy: 3, counters: { x31_len_hang: 1 }, flags: ["x31_doi_tinh"] }, "Lên hạng, bỏ lại làng và ba con lợn"),
           C("Ở lại làm huyền thoại của làng", { rel: 3, flags: ["x31_huyen_thoai"] }, "Cả làng biết ơn, cả tỉnh không biết bạn")]),
      ],
      /* day */
      [
        card("x31_day_dich_lon", "Mùa dịch trong chuồng lợn", (c, k) => `Dịch bệnh quét qua các chuồng lợn trong vùng, đúng lúc mùa giải vào giai đoạn quyết định. ${f(c, "x31_doi_tinh") ? "Ở đội tỉnh người ta không trả bằng lợn, nhưng cũng chậm lương ba tháng." : f(c, "x31_doi_bo") ? "Con bò của làng bên thì khỏe, chỉ có bạn là thấy mình mất giá." : "Ba con lợn, tức toàn bộ giá trị chuyển nhượng của bạn, bị cách ly sau nhà kho."} ${cap(k.npc("ong_bau"))} bắt đầu nói bạn mang vận xui.`,
          [C("Vay tiền chữa cho đàn lợn", { custom: "borrow:0.3", flags: ["x31_cuu_lon"] }, "Giữ được giá trị của mình, gánh thêm nợ"),
           C("Bán lợn sớm, chia tiền cho đội", { money: 0.2, rel: 2, flags: ["x31_ban_lon"] }, "Đội có tiền ăn, bạn thành cầu thủ không giá")]),
        card("x31_day_cap_de", "Trận đấu có giá một cặp dê", (c, k) => `Đêm trước trận chung kết toàn vùng, một người lạ ngồi xuống cạnh bạn ở quán nước. Ông ta không nói nhiều: nếu ngày mai bạn sút ra ngoài, sẽ có một cặp dê buộc sẵn ở cổng nhà. ${k.gag()}`,
          [C("Đá thật, mặc cặp dê", { happy: 3, flags: ["x31_sach"] }, "Ngủ ngon, nhà vẫn không có dê"),
           C("Nhận dê, sút ra ngoài", { money: 0.5, flags: ["x31_ban_do"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [2, 6], note: "bán trận chung kết lấy một cặp dê" } }, "Có dê, có thêm một bí mật biết kêu")]),
      ],
      /* chung_ket */
      [
        card("x31_ket", "Mùa giải cuối của ba con lợn", (c, k) => `${cap(noOr(c, k))} vẫn chưa trả xong, và sáng nay ba lời mời cùng đến một lúc. ${f(c, "x31_ban_do") ? "Cả vùng đã bắt đầu thì thầm về cặp dê, nên lời mời nào cũng kèm một ánh nhìn dò xét." : "Cả làng ra đứng ở cổng chờ nghe bạn chọn."} ${f(c, "x31_ban_lon") ? `${cap(k.npc("ong_bau"))} đứng ở cổng, tay cầm sợi dây buộc lợn đã không còn lợn, như một nhân chứng.` : `${cap(k.npc("ong_bau"))} dắt theo con lợn già nhất, như một nhân chứng.`}`,
          (c) => pick(
            pathOpen("footballer", c.age) ? ending(L31_CAU_THU, "Ký hợp đồng chuyên nghiệp", "Chạy theo trái bóng thêm vài năm nữa")
              : pathOpen("coach", c.age) ? ending(L31_HLV, "Treo giày, nhận dẫn dắt đội làng", "Hết đá, bắt đầu hét bên đường biên") : undefined,
            f(c, "x31_ban_lon") ? ending(L31_TRAI_MOI, "Giải nghệ, gây lại đàn lợn từ đầu", "Làm lại từ đôi lợn giống, giàu chậm mà chắc")
              : ending(L31_TRAI, "Giải nghệ, nuôi cả đàn lợn", "Giàu bằng chính giá chuyển nhượng của mình"),
            ending(L31_LEN_PHO, "Lên phố đá giải phong trào", "Đổi sân ruộng lấy sân cỏ nhân tạo ở phố"))),
      ],
    ],
  }));

/* ================================================================== X32 Cuộc đua chiều cao */

const L32_CAO = land("nha_cao_nhat_xa", "Nhà bạn thành nhà cao nhất xã. Sân thượng cho thuê chụp ảnh cưới, mỗi tháng thu vừa đủ trả lãi.", { income_mult: 1.2, custom: "borrow:1", happy: 5 });
const L32_PHA_SAN = land("pha_san_vi_mot_xangti", "Bạn bán căn nhà cho chính ông hàng xóm. Thanh toán xong mọi khoản, bạn còn một chiếc xe máy và một cây thước dây.", { sell: { kind: "house" }, money: -1, custom: "repay:1", happy: -6 });
const L32_CAFE = land("cafe_hai_san_thuong", "Hai nhà bắc một cây cầu nối hai sân thượng và mở chung một quán cà phê trên cao.", { custom: "become:restaurateur", rel: 5 }); // gần nhất: chủ quán cà phê sân thượng

const X32 = weird("X32", "abs", ["dat", "tien"],
  (c) => c.age >= 22 && c.age <= 68 && (c.owns.has("house") || c.home_owner),
  () => "Xây thêm một tầng cho cao hơn nhà hàng xóm",
  (s) => ({
    title: "Cao hơn đúng một xăng-ti-mét",
    text: `Sáng nay, nhà hàng xóm cao hơn nhà bạn đúng một xăng-ti-mét, và ông ấy đã thuê người đo bằng thước laser để chứng minh. Tấm băng rôn đỏ treo trên ban công ghi: "Nhà cao nhất ${s.noi || "xóm này"}". Ông đứng trên mái, vẫy tay xuống bạn như vẫy một người vừa về nhì. Năm sau, ông hứa, sẽ thêm một xăng-ti-mét nữa.`,
  }),
  season({
    id: "w_X32", vn: "Cuộc đua chiều cao", color: "#d4a017", years: [6, 12], weird: "abs",
    rules: { income: 0.9, flags: ["w_dua_chieu_cao"] },
    reset: { cast: [{ key: "hang_xom", role: "neighbor", label: "ông hàng xóm sát vách" }, { key: "cai_tho", role: "partner", label: "bà cai thợ xây" }] },
    gag: { key: "thuoc_do", lines: [
      "Ông hàng xóm leo lên mái với cây thước dây, đo xong thì gõ ba tiếng vào tường nhà bạn: cộc, cộc, cộc.",
      "Cộc, cộc, cộc. Lần này ông đo bằng thước laser, có người quay phim làm chứng.",
      "Cộc, cộc, cộc. Ông đã thuê hẳn một người chỉ để gõ vào tường nhà bạn mỗi sáng.",
      "Sáng nay không có tiếng gõ nào. Bạn thấy nhớ, rồi tự ghét mình vì đã nhớ.",
    ] },
    landings: [L32_CAO, L32_PHA_SAN, L32_CAFE],
    beats: [
      /* mo_man */
      [
        card("x32_mo_tang_lung", "Tầng lửng đầu tiên của cuộc chiến", (c, k) => `${cap(k.npc("cai_tho"))} gõ vào tường nhà bạn, lắng nghe như bác sĩ nghe phổi. "Thêm một tầng lửng thì đủ hơn ông ta. Nhưng móng nhà này chỉ chịu được ba tầng nữa thôi đấy." ${k.gag()}`,
          [C("Xây tầng lửng, vay một ít", { custom: "borrow:0.5", counters: { x32_tang: 1 }, flags: ["x32_vay"] }, "Hơn ông ta ngay, món nợ bắt đầu"),
           C("Đặt chậu cây thật cao lên sân thượng", { money: -0.05, flags: ["x32_chau_cay"] }, "Rẻ, cao thêm tám mươi phân, hơi ăn gian"),
           C("Sang nhà ông ấy uống trà", { rel: 2, flags: ["x32_hoa_hoan"] }, "Thử làm lành, ông có thể coi là đầu hàng")]),
        card("x32_mo_ca_xa", "Cả xã kéo ra xem", (c, k) => `Người ta bắt đầu đặt cược xem nhà nào cao hơn vào cuối năm. Một bà bán nước kê ghế ngay giữa hai nhà, gọi đó là "khán đài". ${f(c, "x32_chau_cay") ? "Chậu cây trên sân thượng nhà bạn bị khán giả la ó vì không tính." : "Tỉ lệ cược đang nghiêng về phía nhà bạn."}`,
          [C("Mở quán nước dưới chân nhà mình", { money: 0.1, flags: ["x32_quan_nuoc"] }, "Kiếm lại chút tiền, thành một phần của trò cười"),
           C("Đóng cửa, kéo rèm kín", { happy: -2, flags: ["x32_kin"] }, "Giữ thể diện, người ta đồn bạn sắp thua")]),
      ],
      /* khoi_dong */
      [
        card("x32_kd_cot_ang_ten", "Cột ăng-ten có tính không", (c, k) => `${cap(k.npc("hang_xom"))} dựng lên mái một cột ăng-ten trang trí cao ba mét, không bắt được kênh nào. Ông tuyên bố từ nay nhà ông cao hơn nhà bạn ba mét. ${k.gag()}`,
          [C("Kiện lên xã: ăng-ten không phải nhà", { money: -0.1, flags: ["x32_kien"] }, "Mất ba tháng đi lại, có thể lập luật cho cả xã"),
           C("Gắn một cột thu lôi cao hơn", { money: -0.1, flags: ["x32_cot"] }, "Hơn được nửa mét, sét có thể đồng ý")]),
        card("x32_kd_ngan_hang", "Người ngân hàng trên giàn giáo", (c, k) => `Cán bộ tín dụng phải leo lên giàn giáo mới tìm được bạn. Anh ta nhìn xuống, mặt tái đi, nhưng vẫn mở hồ sơ. ${n(c, "x32_tang") > 0 ? `Nhà bạn giờ đã thêm ${n(c, "x32_tang")} tầng so với hồi đầu,` : "Nhà bạn chưa thêm được tầng nào,"} ${f(c, "x32_vay") ? "và khoản vay cũ đang đến hạn trả." : "và anh ta muốn cho bạn vay để thêm tầng nữa."}`,
          [C("Thế chấp nhà để xây tiếp", { custom: "borrow:1", counters: { x32_tang: 1 }, flags: ["x32_the_chap"] }, "Cao hơn hẳn, căn nhà giờ thuộc một nửa về ngân hàng"),
           C("Dừng xây, trả bớt nợ", { money: -0.3, custom: "repay:0.3", flags: ["x32_dung_xay"] }, "Nhẹ người, ông hàng xóm lên thêm một tầng")]),
      ],
      /* cu_lat */
      [
        card("x32_cl_tang_thuong", "Từ tầng thượng nhìn thấy gì", (c, k) => `Lần đầu đứng trên tầng cao nhất, bạn nhìn thấy cả con sông ở xa và ${k.scar("nguoi") || "một người quen cũ"} đang vẫy tay từ dưới đường. Bạn chợt nghĩ đến ${doTail(k, "chiếc ống nhòm cũ")}, rồi nhìn sang ban công bên kia. Con trai ông hàng xóm kể: mẹ cậu ngày xưa chỉ ước được nhìn thấy sông từ mái nhà, và ông xây vì lời ước ấy. ${f(c, "x32_hoa_hoan") ? "Hóa ra đó là chuyện ông định kể hôm bạn sang uống trà, nhưng không nói được." : "Cậu nói ông chưa bao giờ kể chuyện này với ai trong xóm."}`,
          [C("Mời ông lên tầng mình ngắm sông", { rel: 3, happy: 3, flags: ["x32_moi_len"] }, "Cuộc chiến có thể kết thúc ở đây"),
           C("Xây tiếp, che luôn tầm nhìn của ông", { custom: "borrow:0.5", counters: { x32_tang: 1 }, flags: ["x32_che"] }, "Thắng, và thành người xấu trong mắt cả xã")]),
      ],
      /* day */
      [
        card("x32_day_vet_nut", "Vết nứt chạy dọc cầu thang", (c, k) => `Một vết nứt dài bằng cánh tay chạy dọc cầu thang, và mỗi đêm nó dài thêm một chút. ${n(c, "x32_tang") > 0 ? `Nhà bạn giờ đã thêm ${n(c, "x32_tang")} tầng trên một cái móng chỉ chịu được ba. ${cap(k.npc("cai_tho"))} chỉ nói: "Tôi đã dặn rồi."` : `Nhà bạn chưa thêm tầng nào, nhưng ông hàng xóm khoan móng sát tường chung để xây tiếp. ${cap(k.npc("cai_tho"))} chỉ nói: "Nhà ông ấy càng cao, nhà bạn càng nứt."`} ${k.gag()}`,
          (c) => [C("Gia cố móng, vay thêm", { custom: "borrow:0.5", health: -2, flags: ["x32_gia_co"] }, "Nhà đứng vững, nợ cao thêm một tầng"),
           n(c, "x32_tang") > 0
             ? C("Dỡ bớt tầng trên cùng", { happy: -4, counters: { x32_tang: -1 }, flags: ["x32_do_tang"] }, "An toàn, và ông hàng xóm mở tiệc ăn mừng")
             : C("Sang đòi ông hàng xóm đền tường", { rel: -2, money: 0.1, flags: ["x32_doi_den"] }, "Có tiền trát tường, cuộc chiến thêm một mặt trận")]),
        card("x32_day_gian_giao", "Ông hàng xóm ngã khỏi giàn giáo", (c, k) => `Chiều mưa, ${k.npc("hang_xom")} trượt chân khỏi giàn giáo khi đang đo lại lần thứ ba trong ngày. Ông gãy chân, nằm dưới sân, tay vẫn nắm chặt cây thước. ${f(c, "x32_che") ? `Ông nhìn bạn và nói nhỏ: "${cap(xung(c))} che mất con sông rồi."` : `Ông nhìn bạn và nói nhỏ: "Hôm nay ${xung(c)} thắng."`}`,
          [C("Đưa ông đi viện, trả tiền viện phí", { money: -0.2, rel: 4, flags: ["x32_cuu_ong"] }, "Mất tiền, được một người bạn kỳ quặc"),
           C("Gọi người nhà ông rồi về", { happy: -1, flags: ["x32_mac_ke"] }, "Đúng phận sự, cả xóm nhìn bạn khác đi")]),
      ],
      /* chung_ket */
      [
        card("x32_ket", "Nóc nhà cao nhất xã", (c, k) => `${((x: string) => (k.scar("no") || c.debt > 0 ? `${cap(noOr(c, k))} cộng với ${x}` : cap(x)))(n(c, "x32_tang") > 0 ? `tiền xây thêm ${n(c, "x32_tang")} tầng` : "tiền thuê thợ trát tường và đo đạc")} giờ đã thành một con số bạn không dám đọc to.${f(c, "x32_cot") ? " Cột thu lôi trên mái vẫn hơn cột ăng-ten nhà bên nửa mét, dù không ai tính nó là một tầng." : ""} ${f(c, "x32_cuu_ong") || f(c, "x32_moi_len") ? "Ông hàng xóm chống nạng sang, đặt cây thước dây lên bàn nhà bạn như đặt một lá cờ trắng." : "Bên kia, ông hàng xóm lại đang trộn vữa."} ${k.gag()} Đã đến lúc kết thúc cuộc đua.`,
          (c) => pick(
            ending(L32_CAO, "Hoàn thiện tầng cao nhất, cho thuê sân thượng", "Thắng cuộc đua, trả góp đến già"),
            ending(L32_PHA_SAN, c.debt > 0 ? "Bán nhà cho ông hàng xóm, trả nợ" : "Bán nhà cho ông hàng xóm, dọn đi", c.debt > 0 ? "Thua một xăng-ti-mét, thoát cả núi nợ" : "Thua một xăng-ti-mét, nhẹ cả người"),
            pathOpen("restaurateur", c.age) ? ending(L32_CAFE, "Bắc cầu nối hai sân thượng, mở quán chung", "Hết thù, thành chung vốn") : undefined)),
      ],
    ],
  }));

/* ================================================================== X33 Ông Không */

const L33_MC = land("mc_chu_khong", "Bạn thành MC của chương trình hỏi đáp mà mọi câu trả lời đều là không. Khán giả gọi đó là sự thật thà hiếm hoi trên sóng.", { custom: "become:tv_host", happy: 4 });
const L33_GIAM_KHAO = land("giam_khao_chuyen_nghiep", "Bạn được mời làm trọng tài, giám khảo ở mọi cuộc thi cần một người dám nói không.", { custom: "become:referee", happy: 3 }); // gần nhất: nghề giám khảo
const L33_SACH = land("sach_mot_van_chu_khong", "Cuốn sách của bạn chỉ có một chữ lặp lại suốt ba trăm trang, và nó bán chạy.", { custom: "become:writer", happy: 3 });
const L33_CO = land("chu_co_dau_tien", "Lần đầu tiên sau bao nhiêu năm, bạn nói \"có\", với một lời cầu hôn.", { custom: "marry", happy: 8 });
const L33_TIEN = land("ban_ky_luc", "Bạn bán quyền dùng chữ không của mình cho một hãng quảng cáo, đủ sống thoải mái vài năm.", { money: 2, happy: -2 });
const L33_DI = land("thi_tran_khong_ai_hoi", "Bạn nói không với mọi lời mời và dọn đến một thị trấn nhỏ, nơi không ai hỏi bạn câu gì.", { custom: "move_city", happy: 4 });

const X33 = weird("X33", "abs", ["danh", "ky"],
  (c) => c.age >= 18 && c.age <= 68 && (anyFlag(c, ["temper_tough", "temper2_tough"]) || c.traits.coop <= -2),
  () => "Nói \"không\" thêm một lần nữa, trước đám đông",
  (s) => ({
    title: "Kỷ lục chữ không",
    text: `Một người cầm sổ đã đi theo bạn ba tháng, đếm từng chữ "không". Sáng nay ông ta đứng giữa ${s.noi || "chợ"}, giơ cao tờ giấy chứng nhận: chín nghìn tám trăm lẻ hai lần, nhiều nhất từng được ghi lại. "Bạn có đồng ý nhận danh hiệu này không?" Cả chợ nín thở chờ câu trả lời.`,
  }),
  season({
    id: "w_X33", vn: "Người nói Không", color: "#e8a33d", years: [5, 9], weird: "abs",
    rules: { income: 1.1, yearly: { money: 0.05 }, flags: ["w_ong_khong"] },
    reset: { cast: [{ key: "nguoi_dem", role: "official", label: "ông đếm chữ" }, { key: "nha_san_xuat", role: "partner", label: "cô quản lý chương trình" }] },
    gag: { key: "chu_khong", lines: [
      "Ông đếm chữ gạch thêm một vạch vào sổ, lẩm bẩm con số mới như đọc bảng cửu chương.",
      "Một đứa trẻ hỏi bạn có muốn ăn kẹo không. Bạn nói không. Cả xóm vỗ tay.",
      "Bạn lỡ nói \"có\" trong mơ. Sáng hôm sau ông đếm chữ hỏi lại ba lần cho chắc.",
      "Người ta in chữ \"không\" của bạn lên áo phông, bán chạy hơn mọi áo có chữ \"có\".",
    ] },
    landings: [L33_MC, L33_GIAM_KHAO, L33_SACH, L33_CO, L33_TIEN, L33_DI],
    beats: [
      /* mo_man */
      [
        card("x33_mo_bi_ngo", "Giám khảo hội thi bí ngô", (c, k) => `Hội thi bí ngô to nhất vùng mời bạn làm giám khảo, với một nhiệm vụ duy nhất: nói không với mọi quả bí. Một trăm hai mươi quả xếp hàng, mỗi quả có một người chủ đang run. Hội kỷ lục gửi kèm giấy báo: người giữ danh hiệu được trả một khoản nhỏ mỗi năm, cho tới lễ trao danh hiệu cuối cùng. ${k.gag()}`,
          [C("Nhận lời, nói không cả trăm lần", { money: 0.1, counters: { x33_khong: 1 }, flags: ["x33_giam_khao"] }, "Có tiền công, mất một trăm hai mươi người quen"),
           C("Từ chối lời mời", { happy: 1, counters: { x33_khong: 1 }, flags: ["x33_tu_choi_moi"] }, "Đúng chất, và chính lời từ chối lên báo")]),
        card("x33_mo_bua_com", "Bữa cơm không có chữ có", (c, k) => `Cả nhà biến bữa cơm thành một cuộc thử: ai cũng hỏi bạn những câu chỉ có thể trả lời là có. "Ăn thêm bát nữa không?" ${cap(k.npc("nguoi_dem"))} ngồi ở đầu bàn, bút đã mở nắp.`,
          (c) => [C("Giữ kỷ lục, kể cả ở nhà", { rel: -3, counters: { x33_khong: 1 }, flags: ["x33_cung_ca_nha"] }, "Kỷ lục nguyên vẹn, bữa cơm nguội ngắt"),
           C("Nói \"có\" với người nhà, một lần thôi", { rel: 3, flags: ["x33_co_voi_nha"], ...momTrust(c, 0.1) }, "Ấm cả nhà, ông đếm chữ ghi chú bên lề")]),
      ],
      /* khoi_dong */
      [
        card("x33_kd_show", "Chương trình làm bạn gật đầu", (c, k) => `${cap(k.npc("nha_san_xuat"))} mang tới một kịch bản: mỗi tập, một người lạ tìm mọi cách khiến bạn nói "có". Ai thắng sẽ được một chiếc xe máy, còn bạn được trả theo số chữ không. ${f(c, "x33_co_voi_nha") ? "Cô đã nghe chuyện bữa cơm hôm nọ và coi đó là điểm yếu." : "Cô tin bạn là người duy nhất trên đời không có điểm yếu."}`,
          [C("Ký hợp đồng mười tập", { money: 0.4, counters: { x33_khong: 2 }, flags: ["x33_show"] }, "Tiền về đều, đời bạn thành một trò chơi"),
           C("Từ chối chương trình", { counters: { x33_khong: 1 }, flags: ["x33_tu_choi_show"] }, "Giữ đời mình, mất một khoản tiền đều"),
           C("Đòi được nói \"có\" một lần mỗi tập", { flags: ["x33_doi_dieu_khoan"] }, "Khán giả bớt hứng, bạn giữ được mình", { tier: "sovereign" })]),
        card("x33_kd_thach_dau", "Kẻ thách đấu từ vùng bên", (c, k) => `Một người ở vùng bên tuyên bố mình mới là vua chữ không, và thách bạn đấu tay đôi trước chợ: hai người hỏi nhau đến khi một người gật đầu. ${k.gag()}`,
          [C("Nhận lời đấu", { gamble: { p: 0.5, win: { happy: 4, counters: { x33_khong: 3 }, flags: ["x33_thang_dau"], log: "Đối thủ gật đầu ở câu thứ bốn trăm, vì buồn ngủ." }, lose: { happy: -4, flags: ["x33_thua_dau"], log: "Bạn lỡ gật đầu khi có người hỏi giờ." } } }, "Thắng thì thành huyền thoại, thua thì thành trò cười"),
           C("Lờ đi, nói không với cả lời thách", { counters: { x33_khong: 1 }, flags: ["x33_lo_di"] }, "Giữ được danh, bị đồn là sợ")]),
      ],
      /* cu_lat */
      [
        card("x33_cl_cau_hoi", "Câu hỏi không thể nói không", (c, k) => `Giữa buổi ghi hình ${f(c, "x33_show") ? "tập thứ bảy của chương trình" : "một chương trình địa phương"}, ${k.scar("nguoi") || "một người quen cũ"} bước lên sân khấu và hỏi đúng một câu: bạn còn giữ ${doTail(k, "món đồ năm xưa")}, hay không. Câu trả lời thật là còn. Nói không lúc này là nói dối trước mặt mọi người đang xem.`,
          [C("Nói \"có\" trước ống kính", { happy: 5, rel: 3, counters: { x33_khong: -5 }, flags: ["x33_noi_co"] }, "Mất kỷ lục, được lại một người"),
           C("Nói \"không\", dù sai sự thật", { happy: -3, counters: { x33_khong: 1 }, flags: ["x33_noi_doi"] }, "Giữ kỷ lục bằng một lời nói dối")]),
      ],
      /* day */
      [
        card("x33_day_mat_giong", "Mất giọng trước trận chung kết", (c, k) => `Một tuần trước đêm chung kết, bạn mất giọng hoàn toàn. Bác sĩ hỏi: "Có đau không?" Bạn chỉ còn cách lắc đầu. ${cap(k.npc("nguoi_dem"))} cãi nhau với ban tổ chức suốt ba tiếng xem cái lắc đầu có được tính không. ${k.gag()}`,
          [C("Lắc đầu thay chữ không suốt mùa", { counters: { x33_khong: 1 }, flags: ["x33_lac_dau"] }, "Kỷ lục còn, cổ bạn thì mỏi"),
           C("Nghỉ hẳn một mùa cho lành giọng", { health: 5, money: -0.2, flags: ["x33_nghi"] }, "Khỏe lại, kỷ lục đứng yên")]),
        card("x33_day_quang_cao", "Hợp đồng chỉ cần một chữ có", (c, k) => `Một hãng nệm đề nghị một khoản tiền bằng hơn nửa năm thu nhập, đổi lấy một câu quảng cáo dài đúng một chữ: "Có." ${f(c, "x33_noi_co") ? "Bạn đã từng nói có một lần trên sóng, nên họ tin lần này cũng được." : "Họ nói chữ có đầu tiên của bạn sẽ là chữ có đắt nhất lịch sử."}`,
          [C("Nói \"có\", lấy tiền", { money: 0.6, counters: { x33_khong: -3 }, flags: ["x33_ban_chu"] }, "Giàu lên, danh hiệu thành chuyện cười"),
           C("Nói không với cả đống tiền", { happy: 2, counters: { x33_khong: 2 }, flags: ["x33_liem_chinh"] }, "Nghèo nhưng thẳng, người ta nể bạn thật")]),
      ],
      /* chung_ket */
      [
        card("x33_ket", "Lễ trao danh hiệu cuối cùng", (c, k) => `Ông đếm chữ đọc tổng kết: ${dots(9802 + 1000 * n(c, "x33_khong"))} chữ không. ${k.gag()} ${cap(noOr(c, k))} vẫn chờ một câu trả lời từ nhiều năm nay. ${f(c, "x33_ban_chu") ? "Trên tấm bảng quảng cáo phía sau, gương mặt bạn đang nói \"có\"." : "Khán phòng im lặng chờ bạn nói chữ cuối cùng của mùa."} Có ba lời mời đang nằm trên bàn.`,
          (c) => pick(
            pathOpen("tv_host", c.age) ? ending(L33_MC, "Nhận làm MC chương trình hỏi đáp", "Lên sóng mỗi tối, nói không có lương") : undefined,
            pathOpen("referee", c.age) ? ending(L33_GIAM_KHAO, "Làm giám khảo chuyên nghiệp", "Nghề của người dám làm mất lòng")
              : pathOpen("writer", c.age) ? ending(L33_SACH, "Viết sách về một vạn chữ không", "Một chữ, ba trăm trang, cả đời") : undefined,
            !c.married ? ending(L33_CO, "Nói \"có\" với lời cầu hôn", "Mất kỷ lục, được một mái nhà") : undefined,
            ending(L33_TIEN, "Bán quyền chữ không của mình", "Giàu lên, chữ không không còn là của bạn"),
            ending(L33_DI, "Nói không với tất cả, dọn đi nơi khác", "Yên tĩnh, không còn ai đếm"))),
      ],
    ],
  }));

/* ================================================================== X34 Nhà thiết kế áo mưa */

const L34_NTK = land("nha_thiet_ke_ao_mua", "Bạn mở xưởng thiết kế riêng. Trường phái Rách có tên trong giáo trình của các trường thời trang.", { custom: "become:fashion", happy: 5 });
const L34_BAN = land("ban_thuong_hieu_rach", "Bạn bán thương hiệu Rách cho một tập đoàn may mặc, đủ tiền mua nhà, và không bao giờ phải mặc áo mưa rách nữa.", { money: 2.5, happy: -1 });
/** Không ra nước ngoài được (chưa tự lập, hay không còn nước để đi): ở lại vá áo ở góc chợ. */
const L34_O_LAI = land("o_lai_va_ao", "Bạn ở lại, mở một sạp vá áo mưa ở góc chợ, nhận may đo cho người quen, và để dành được một khoản kha khá.", { money: 1, happy: 3 });
const L34_DI = land("xuong_o_xu_mua", "Bạn mang kéo và dây thun sang một đất nước mưa quanh năm, mở xưởng ở đó.", { custom: "migrate_now", money: -0.5 });

const X34 = weird("X34", "abs", ["tien", "danh"],
  (c) => c.age >= 18 && c.age <= 60 && (c.family_wealth < 0.4 || c.broke || c.scarcity) &&
    anyFlag(c, ["temper_curious", "temper2_curious", "tinker", "tinkerer", "invention"]),
  () => "Mặc chiếc áo mưa rách ra phố, đầu ngẩng cao",
  () => ({
    title: "Áo mưa rách lên bìa tạp chí",
    text: `Cơn mưa chiều xé chiếc áo mưa của bạn làm ba mảnh, và bạn buộc chúng lại bằng dây thun theo kiểu duy nhất còn che được đầu. Sáng hôm sau, ảnh bạn đứng chờ đèn đỏ lên trang bìa một tạp chí thời trang. Dòng chú thích: "Trường phái Rách, tương lai của thời trang." Ở đâu đó, ba trăm người đang tự cầm kéo cắt áo mưa của mình.`,
  }),
  season({
    id: "w_X34", vn: "Nhà thiết kế áo mưa", color: "#e6b422", years: [6, 10], weird: "abs",
    rules: { income: 0.9, flags: ["w_ao_mua_rach"] },
    reset: { cast: [{ key: "phe_binh", role: "mentor", label: "bà phê bình thời trang" }, { key: "xuong_nhai", role: "rival", label: "ông chủ xưởng nhái" }] },
    gag: { key: "troi_nang", lines: [
      "Ngày ra mắt bộ sưu tập, trời nắng chang chang. Người mẫu mặc áo mưa rách đi giữa nắng, mồ hôi chảy ròng.",
      "Bạn dời buổi ra mắt sang giữa mùa mưa. Trời vẫn nắng, đài khí tượng gọi đó là hiện tượng lạ.",
      "Người ta bắt đầu thuê bạn ra mắt áo mưa để chống mưa: bạn trình diễn ở đâu, ở đó nắng.",
      "Lần đầu tiên, buổi ra mắt có mưa thật. Không ai mang áo mưa, kể cả bạn.",
    ] },
    landings: [L34_NTK, L34_BAN, L34_DI, L34_O_LAI],
    beats: [
      /* mo_man */
      [
        card("x34_mo_xuong", "Xưởng may trong nhà tắm", (c, k) => `Bốn mươi đơn đặt hàng áo mưa rách đến trong một đêm. Xưởng của bạn là nhà tắm, máy móc là một cây kéo và hai túi dây thun. ${cap(k.npc("phe_binh"))} gửi tin nhắn đầu tiên: "Tôi chưa quyết định ghét hay thích bạn."`,
          [C("Nhận hết, thức trắng cắt áo", { money: 0.2, health: -3, counters: { x34_don: 1 }, flags: ["x34_nhan_het"] }, "Có tiền ngay, vết rách bắt đầu cẩu thả"),
           C("Chỉ nhận mười cái, cắt cho kỹ", { happy: 2, counters: { x34_tay_nghe: 1 }, flags: ["x34_ky"] }, "Ít tiền, mỗi vết rách là một chữ ký")]),
        card("x34_mo_trinh_dien", "Buổi trình diễn trên cầu đi bộ", (c, k) => `Sàn diễn là một cây cầu đi bộ, khán giả là người đi chợ về. Mười người mẫu là bạn bè của bạn, mỗi người khoác một chiếc áo mưa rách theo một kiểu. ${k.gag()}`,
          [C("Đi diễn luôn giữa nắng", { counters: { x34_danh: 1 }, flags: ["x34_nang"] }, "Lố bịch, nhưng ảnh lan rất nhanh"),
           C("Thuê vòi tưới phun nước cho giống mưa", { money: -0.05, happy: 3, flags: ["x34_voi_tuoi"] }, "Tốn tiền thuê vòi, ảnh đẹp như phim")]),
      ],
      /* khoi_dong */
      [
        card("x34_kd_hang_nhai", "Áo mưa rách sẵn giá rẻ", (c, k) => `${cap(k.npc("xuong_nhai"))} tung ra áo mưa rách sẵn từ nhà máy, giá chỉ bằng một phần ba của bạn. Vết rách thẳng tắp như kẻ thước. ${f(c, "x34_ky") ? "Khách quen của bạn nhìn là biết hàng giả." : "Khách của bạn không phân biệt được, vì áo của bạn dạo này cũng rách vội."}`,
          [C("Bán luôn công thức vết rách cho xưởng", { money: 0.4, flags: ["x34_ban_cong_thuc"] }, "Có tiền, mất trường phái"),
           C("Kiện bản quyền vết rách", { money: -0.15, flags: ["x34_kien"] }, "Tòa phải định nghĩa chữ rách, rất lâu"),
           C("Ra mẫu mới: áo mưa rách rồi vá", { counters: { x34_tay_nghe: 1 }, flags: ["x34_mau_va"] }, "Máy không nhái kịp, tay bạn thì mỏi", { tier: "sovereign" })]),
        card("x34_kd_phe_binh", "Bài phê bình nửa trang báo", (c, k) => `${cap(k.npc("phe_binh"))} viết nửa trang báo về bạn, kết luận: "Hoặc kẻ phá hoại thời trang, hoặc thiên tài. Chưa rõ." ${k.gag()}`,
          [C("Mời bà đến xưởng xem tận mắt", { know: 2, flags: ["x34_moi_phe_binh"] }, "Có thể được thầy, có thể bị chê thẳng mặt"),
           C("Viết thư trả lời trên báo", { counters: { x34_danh: 1 }, flags: ["x34_cai_nhau"] }, "Thêm nổi tiếng, thêm một kẻ thù có bút")]),
      ],
      /* cu_lat */
      [
        card("x34_cl_ao_goc", "Chiếc áo mưa đầu tiên", (c, k) => `Một bảo tàng muốn mua chiếc áo mưa rách đầu tiên. Bạn tìm thấy nó trong một túi đồ cũ, và chợt nhớ chính ${k.scar("nguoi") || "một người quen cũ"} đã mua nó cho bạn năm nào, cùng thời với ${doTail(k, "đôi dép cũ")}. Người đó giờ không biết gì về trường phái Rách.`,
          [C("Bán chiếc áo cho bảo tàng", { money: 0.5, flags: ["x34_ban_ao_goc"] }, "Có vốn mở tiệm, mất lá bùa may"),
           C("Giữ áo, may bộ sưu tập kể chuyện người đó", { happy: 3, counters: { x34_tay_nghe: 1 }, flags: ["x34_ke_chuyen"] }, "Không có tiền, có một câu chuyện thật")]),
      ],
      /* day */
      [
        card("x34_day_nam_han", "Năm không có mưa", (c, k) => `Cả năm không có một trận mưa nào ra hồn, và không ai mua áo mưa, rách hay lành. Thợ của bạn ngồi chơi cờ trong nhà tắm. ${k.gag()}`,
          [C("Chuyển sang may áo chống nắng rách", { money: -0.1, flags: ["x34_ao_nang"] }, "Sống qua mùa khô, trường phái lạc đề"),
           C("Vay tiền giữ thợ đến mùa mưa", { custom: "borrow:0.4", rel: 3, flags: ["x34_giu_tho"] }, "Giữ được người, gánh thêm nợ")]),
        card("x34_day_don_lon", "Đơn hàng mười nghìn chiếc", (c, k) => `Một nhà buôn nước ngoài đặt mười nghìn chiếc, giao trong hai tháng. Muốn kịp, bạn phải thuê chính ${k.npc("xuong_nhai")} làm, và vết rách sẽ thẳng như kẻ thước. ${f(c, "x34_ke_chuyen") ? "Bộ sưu tập kể chuyện của bạn chưa bán được chiếc nào." : c.broke ? "Tài khoản của bạn đang âm." : "Tiền để dành chỉ đủ trả công thợ ba tháng."}`,
          [C("Nhận, giao cho xưởng nhái làm", { money: 0.6, flags: ["x34_cong_nghiep"] }, "Giàu nhanh, áo của bạn hết là của bạn"),
           C("Từ chối, giữ tay làm", { happy: 2, flags: ["x34_thu_cong"] }, "Giữ được nghề, tiếp tục nghèo")]),
      ],
      /* chung_ket */
      [
        card("x34_ket", "Bộ sưu tập cuối mùa mưa", (c, k) => `${cap(noOr(c, k))} vẫn chờ bạn từ hồi chưa ai biết trường phái Rách là gì. ${f(c, "x34_cong_nghiep") || f(c, "x34_ban_cong_thuc") ? "Giờ áo rách có ở mọi cửa hàng, và không cái nào mang tên bạn." : "Giờ mỗi vết rách trên áo của bạn đều có người nhận ra."} ${k.gag()}`,
          (c) => pick(
            pathOpen("fashion", c.age) ? ending(L34_NTK, "Mở xưởng thiết kế mang tên mình", "Thành nghề thật, vất vả thật") : undefined,
            ending(L34_BAN, "Bán thương hiệu Rách", "Có nhà, có tiền, hết là nhà thiết kế"),
            migrateOk(c) ? ending(L34_DI, "Sang xứ mưa quanh năm mở xưởng", "Đất lạ, mưa nhiều, khách nhiều")
              : ending(L34_O_LAI, "Ở lại, mở sạp vá áo mưa ở góc chợ", "Không giàu, khách quen gọi bạn là thầy"))),
      ],
    ],
  }));

/* ================================================================== X35 Sống trên sóng */

const L35_TIEN = land("ban_quyen_phat_lai", "Bạn ký thêm mười năm phát lại. Tiền đủ mua nhà cho mỗi người, và mỗi người dọn về một căn riêng.", { money: 3, rel: -4 });
const L35_TAN = land("tan_tren_song", "Người bạn đời ký hợp đồng riêng với kênh khác. Cuộc chia tay được phát trực tiếp, lượng xem cao nhất lịch sử.", { custom: "spouse_leave", money: 1 });
const L35_GAN = land("tat_camera_don_di", "Cả nhà chuyển tới một thành phố không ai nhận ra mình, không mang theo một chiếc camera nào. Lần đầu tiên sau nhiều năm, không ai xem bạn ăn sáng.", { custom: "move_city", rel: 6 });

/**
 * Người nhà lên sóng cùng bạn (một người cho cả cửa, biến cố và thẻ): bạn đời, con đã lớn, mẹ, bố, anh chị em.
 * Thẻ mở màn đầu tiên ghi vai đó vào bộ đếm x35_fam (chỉ số + 1), các thẻ sau đọc lại vai đã ghi: người không đổi
 * giữa mùa; nếu người đó mất thì thẻ dùng chữ dự phòng.
 */
const FAM35 = ["spouse", "child", "mother", "father", "sibling"] as const;
const famRole35 = (c: FactContext): number => FAM35.findIndex((r) => !!c.cast[r] &&
  (r !== "child" || c.kids_teen > 0 || (c.kids_alive > 0 && c.kids_school === 0 && c.age >= 45)));
const fam35 = (c: FactContext): string | undefined => {
  const i = n(c, "x35_fam") > 0 ? n(c, "x35_fam") - 1 : famRole35(c);
  return i >= 0 && i < FAM35.length ? c.cast[FAM35[i]!] : undefined;
};
const famMark35 = (c: FactContext): Record<string, number> => (n(c, "x35_fam") > 0 || famRole35(c) < 0 ? {} : { x35_fam: famRole35(c) + 1 });

const X35 = weird("X35", "abs", ["danh", "mau"],
  (c) => c.pressure.danh >= 3 && c.pressure.mau >= 3 && c.age >= 20 && c.age <= 68 && famRole35(c) >= 0,
  () => "Ký hợp đồng cho cả nhà lên sóng 24/7",
  (s, c, N) => ({
    title: "Gia đình mẫu, phát trực tiếp",
    text: `Mười hai chiếc camera được lắp trong nhà bạn trước bữa sáng, kể cả một chiếc trong tủ lạnh. Gia đình bạn vừa được chọn làm "gia đình mẫu" của một kênh truyền hình, phát trực tiếp hai mươi bốn giờ mỗi ngày. Cô nhà sản xuất cài micro lên cổ áo ${nameOr(N, fam35(c), "người nhà bạn")} rồi dặn: "Cứ sống bình thường. Nhưng đừng bình thường quá." Ngoài cổng, ba nghìn người đang xem bạn đánh răng.`,
  }),
  season({
    id: "w_X35", vn: "Sống trên sóng", color: "#f0a830", years: [5, 9], weird: "abs",
    rules: { income: 1.3, flags: ["w_song_tren_song"] },
    reset: { cast: [{ key: "nha_san_xuat", role: "first_boss", label: "cô nhà sản xuất" }, { key: "quay_phim", role: "neighbor", label: "anh quay phim trực đêm" }] },
    gag: { key: "luong_xem", lines: [
      "Góc màn hình hiện dòng chữ: lượng xem tăng gấp đôi lúc bạn làm đổ chai tương cà.",
      "Lượng xem cao nhất tuần không phải lúc cả nhà cãi nhau, mà lúc con mèo ngồi lên cái điều khiển.",
      "Cô nhà sản xuất đưa bảng xếp hạng: cảnh bạn ngủ gật được xem nhiều hơn bản tin thời sự.",
      "Lượng xem rơi xuống mức thấp nhất lịch sử: cả nhà ngồi ăn cơm vui vẻ, không ai cãi ai.",
    ] },
    landings: [L35_TIEN, L35_TAN, L35_GAN],
    beats: [
      /* mo_man */
      [
        card("x35_mo_camera", "Chiếc camera trong tủ lạnh", (c, k) => `${cap(k.npc("nha_san_xuat"))} đi một vòng quanh nhà, chỉ từng góc: chỗ này đặt camera, chỗ kia đặt micro. Hợp đồng cho bạn giữ lại đúng một nơi không quay, đổi lại tiền công giảm một phần. ${k.gag()}`,
          (c) => [C("Giữ nhà tắm làm vùng cấm", { money: -0.05, counters: famMark35(c), flags: ["x35_vung_cam"] }, "Ít tiền hơn, còn một chỗ để khóc"),
           C("Mở cửa mọi phòng", { money: 0.2, counters: { x35_xem: 1, ...famMark35(c) }, flags: ["x35_mo_het"] }, "Thêm tiền, không còn chỗ nào là của mình")]),
        card("x35_mo_cai_nhau", "Trận cãi nhau đầu tiên lên sóng", (c, k) => `Tối thứ ba, cả nhà cãi nhau xem ai chưa rửa bát. Ba nghìn bình luận chia làm hai phe trong mười phút, có người còn vẽ sơ đồ. ${cap(nameOr(k.N, fam35(c), "người nhà của bạn"))} quay sang hỏi nhỏ: "Mình nói tiếp hay tắt đèn?"`,
          [C("Cãi cho ra lẽ trước ống kính", { rel: -3, counters: { x35_xem: 2 }, flags: ["x35_cai_cong_khai"] }, "Lượng xem tăng vọt, bữa tối mất vui"),
           C("Kéo nhau ra góc khuất nói nhỏ", { rel: 2, flags: ["x35_noi_nho"] }, "Hòa được, cô nhà sản xuất cau mày")]),
      ],
      /* khoi_dong */
      [
        card("x35_kd_kich_ban", "Kịch bản nhét dưới khe cửa", (c, k) => `Sáng thứ hai có một tờ giấy nhét dưới khe cửa: "Tuần này: một bí mật gia đình. Ai nói, tùy các bạn." ${f(c, "x35_noi_nho") ? "Bên dưới có thêm dòng viết tay: \"Bớt nói nhỏ đi.\"" : "Bên dưới có thêm dòng viết tay: \"Như tối thứ ba là rất tốt.\""}`,
          [C("Diễn theo kịch bản", { money: 0.3, counters: { x35_xem: 2 }, flags: ["x35_dien"] }, "Tiền thưởng to, sự thật bắt đầu nhòe"),
           C("Lờ tờ giấy đi, sống như thường", { money: -0.05, flags: ["x35_lo_kich_ban"] }, "Không diễn, tiền thưởng bị trừ"),
           C("Xé kịch bản ngay trước camera", { happy: 3, counters: { x35_xem: 1 }, flags: ["x35_xe"] }, "Khán giả mê, nhà sản xuất giận", { tier: "sovereign" })]),
        card("x35_kd_leu_fan", "Người hâm mộ dựng lều trước cổng", (c, k) => `Hai mươi người hâm mộ dựng lều trước cổng, thay nhau đứng đọc to những câu bạn vừa nói trong bếp. Hàng xóm đã ký đơn kiến nghị. ${k.gag()}`,
          [C("Mời người hâm mộ vào ăn một bữa", { money: -0.05, counters: { x35_xem: 1 }, flags: ["x35_moi_fan"] }, "Họ hiền lại, và không chịu về"),
           C("Thuê hàng rào cao hai mét", { money: -0.15, flags: ["x35_hang_rao"] }, "Yên hơn, trông như nhà tù")]),
      ],
      /* cu_lat */
      [
        card("x35_cl_ba_gio_sang", "Bí mật lên sóng lúc ba giờ sáng", (c, k) => `Ba giờ sáng, camera ở cổng ghi được cảnh ${k.scar("nguoi") || "một người quen cũ"} đứng gõ cửa, đến để nói chuyện về ${doTail(k, "một chuyện cũ")}. Lượng xem lúc nửa đêm tăng gấp mười. ${cap(k.npc("quay_phim"))} gõ vào cửa phòng bạn: "Mở hay không thì cũng lên sóng rồi."`,
          [C("Mở cửa, kể hết trước ống kính", { happy: 2, counters: { x35_xem: 3 }, flags: ["x35_ke_het"] }, "Hết bí mật, cũng hết đường lùi"),
           C("Cắt điện cả nhà", { money: -0.2, flags: ["x35_cat_dien"] }, "Phạt hợp đồng, giữ được chuyện riêng")]),
      ],
      /* day */
      [
        card("x35_day_muon_roi", "Một người muốn rời chương trình", (c, k) => `${cap(nameOr(k.N, fam35(c), "một người trong nhà"))} xếp quần áo vào va li ngay trước camera phòng khách, nói rằng không thể sống thêm một ngày nào như vật trưng bày. ${f(c, "x35_dien") ? "Khán giả tưởng đây là kịch bản, và vỗ tay." : "Khán giả biết đây là thật, và im lặng."}`,
          [C("Cùng rời chương trình, đền hợp đồng", { money: -0.5, rel: 4, flags: ["x35_cung_roi"] }, "Mất tiền đền, giữ được người"),
           C("Ở lại một mình trên sóng", { money: 0.3, rel: -5, flags: ["x35_o_lai"] }, "Thêm tiền, căn nhà rộng ra và lạnh đi")]),
        card("x35_day_mat_dien", "Đêm cả phố mất điện", (c, k) => `Một cơn bão cắt điện cả phố. ${f(c, "x35_cung_roi") ? "Camera đã được tháo từ ngày cả nhà rời chương trình, nhưng đây là đêm đầu tiên không còn cả màn hình nào sáng. Cả nhà ngồi sát nhau, nghe tiếng mưa." : f(c, "x35_o_lai") ? "Lần đầu tiên sau nhiều năm, không có chiếc camera nào chạy. Bạn ngồi một mình trong căn nhà rộng, nghe tiếng mưa." : "Lần đầu tiên sau nhiều năm, không có chiếc camera nào chạy. Cả nhà ngồi trong bóng tối, nghe tiếng mưa."} ${k.gag()}`,
          (c) => [f(c, "x35_o_lai")
             ? C("Gọi điện cho người đã rời đi", { happy: 3, rel: 4, flags: ["x35_dem_toi"] }, "Một cuộc gọi không ai xem, đáng giá cả năm")
             : C("Nói thật với nhau trong bóng tối", { happy: 3, rel: 4, flags: ["x35_dem_toi"] }, "Một đêm không ai xem, đáng giá cả năm"),
           f(c, "x35_cung_roi")
             ? C("Mở điện thoại phát trực tiếp lại", { money: 0.1, counters: { x35_xem: 2 }, flags: ["x35_thap_nen"] }, "Khán giả cũ ùa về, cô nhà sản xuất nhắn tin ngay")
             : C("Thắp nến cho camera đêm quay được", { money: 0.1, counters: { x35_xem: 2 }, flags: ["x35_thap_nen"] }, "Cảnh đẹp, cô nhà sản xuất khen")]),
      ],
      /* chung_ket */
      [
        card("x35_ket", "Tập cuối, phát lại mãi mãi", (c, k) => `${f(c, "x35_cung_roi") ? "Một năm sau ngày rời chương trình, kênh truyền hình gọi lại, muốn mua quyền phát lại những gì đã quay." : "Kênh truyền hình muốn ký mùa mới."} ${cap(noOr(c, k))} đã bị khán giả biết hết từ lâu, ${k.scar("no") || c.debt > 0 ? "và có người còn góp tiền trả giúp" : "và có người còn nhắc bạn giữ cho trọn"}. ${f(c, "x35_dem_toi") || f(c, "x35_cung_roi") ? "Cả nhà nhìn nhau, lần này không cần ai cầm micro." : "Mỗi người trong nhà đang nhìn một chiếc camera khác nhau."} ${k.gag()}`,
          (c) => pick(
            ending(L35_TIEN, "Ký mười năm phát lại, chia tiền", "Giàu, mỗi người một nhà"),
            c.married ? ending(L35_TAN, "Để người bạn đời ký riêng, chia tay trên sóng", "Có tiền, mất một nửa gia đình") : undefined,
            ending(L35_GAN, f(c, "x35_cung_roi") ? "Cả nhà chuyển đi thật xa" : "Tháo camera, cả nhà chuyển đi", "Mất tiền, được nhau"))),
      ],
    ],
  }));

/* ================================================================== X36 Thuyền trưởng karaoke */

const L36_QUAN = land("quan_karaoke_noi", "Con thuyền thành quán karaoke nổi có tên trên bản đồ. Bạn đứng quầy, và đêm nào cũng mở màn bằng bài tủ của mẹ.", { custom: "become:restaurateur", happy: 5 }); // gần nhất: chủ quán
const L36_SONG = land("song_tren_song", "Bạn bán nốt những gì còn trên bờ, mua đứt con thuyền làm nhà. Từ nay địa chỉ của bạn là một khúc sông.", { buy: { kind: "house", name: "căn nhà nổi trên sông", price: 1, borrow: true }, happy: 4 });
const L36_LEN_BO = land("len_bo_len_pho", "Bạn bán thuyền, lên phố thuê một căn hộ có ban công đủ rộng cho một cái loa và bài tủ của mẹ.", { custom: "move_city", money: 1 });

/** Mẹ còn sống không (dàn nhân vật chỉ giữ người còn sống; mẹ có thể mất giữa mùa). */
const me36 = (c: FactContext): boolean => !!c.cast.mother;

const X36 = weird("X36", "abs", ["mau", "tien"],
  (c) => !!c.cast.mother && c.age >= 18 && c.age <= 60 &&
    (anyFlag(c, ["life_singer", "talent_singer", "talent_folk_musician", "life_folk_musician"]) || c.pressure.mau >= 3),
  () => "Lên thuyền karaoke của mẹ làm thuyền trưởng",
  (s) => ({
    title: "Mẹ đổi nhà lấy một con thuyền",
    text: `Mẹ bạn vừa bán căn nhà ${s.noi ? "ở " + s.noi : "của cả nhà"} để mua một con thuyền gỗ dài mười hai mét, có dàn loa to hơn cả buồng lái. Giấy tờ đã ký, tiền đã trao, và mẹ đang hát thử bài đầu tiên ngay trên bến. "Mẹ già rồi. Mẹ muốn hát cho cả con sông nghe." Mẹ đưa bạn chiếc mũ thuyền trưởng còn nguyên mác.`,
  }),
  season({
    id: "w_X36", vn: "Thuyền trưởng karaoke", color: "#e3953a", years: [6, 11], weird: "abs",
    rules: { income: 0.7, flags: ["w_thuyen_karaoke"] },
    reset: { cast: [{ key: "lai_do", role: "neighbor", label: "ông lái đò kế bên" }, { key: "can_bo_song", role: "official", label: "cô cán bộ đường thủy" }] },
    gag: { key: "bai_tu", lines: [
      "Bài tủ của mẹ vang lên lần đầu trong đêm. Đàn vịt trên bờ lặng lẽ bơi ra xa.",
      "Bài tủ của mẹ vang lên lần thứ ba trăm. Ông lái đò kế bên đã thuộc lời và bắt đầu hát bè.",
      "Có khách gọi bài khác. Loa vẫn phát bài tủ của mẹ, chậm hơn một chút, và người ta bảo đó là bản phối mới.",
      "Cả khúc sông giờ đều hát được bài tủ của mẹ. Cá cũng nổi lên đúng đoạn điệp khúc.",
    ] },
    landings: [L36_QUAN, L36_SONG, L36_LEN_BO],
    beats: [
      /* mo_man */
      [
        card("x36_mo_dem_dau", "Đêm đầu tiên trên sông", (c, k) => `Đêm khai trương không có khách nào, chỉ có muỗi và một chiếc đèn dầu. ${me36(c) ? "Mẹ vẫn chỉnh micro, hắng giọng, và cúi chào mặt nước." : "Bạn bật cuộn băng mẹ thu sẵn, chỉnh âm lượng, và cúi chào mặt nước thay mẹ."} ${k.gag()}`,
          [C("Treo đèn nhấp nháy dọc mạn thuyền", { money: -0.05, counters: { x36_khach: 1 }, flags: ["x36_den"] }, "Tốn tiền điện, từ bờ nhìn thấy rõ"),
           C("Chèo ra giữa sông cho khỏi phiền ai", { happy: 2, flags: ["x36_giua_song"] }, "Không phiền ai, cũng chẳng ai thấy")]),
        card("x36_mo_giuong_dua", "Chiếc giường đung đưa", (c, k) => `Bạn ngủ đêm đầu trên chiếc giường đung đưa theo sóng, sáng ra tóc ướt vì thuyền dột. ${cap(k.npc("lai_do"))} chèo ngang qua, hỏi bạn định ở trên bờ hay ở dưới nước. "Không ai sống được ở cả hai nơi đâu."`,
          (c) => c.has_job
            ? [C("Bỏ việc trên bờ, ở hẳn trên thuyền", { custom: "job_lose", flags: ["x36_o_han"], ...momTrust(c, 0.2) }, "Mẹ vui, thu nhập chỉ còn tiền karaoke"),
               C("Giữ việc trên bờ, tối mới xuống thuyền", { health: -2, flags: ["x36_hai_noi"] }, "Có lương, ngủ ít, con thuyền vắng bạn")]
            : [C("Ở hẳn trên thuyền, sống bằng tiền hát", { flags: ["x36_o_han"], ...momTrust(c, 0.2) }, "Mẹ vui, cả nhà chỉ trông vào tiền karaoke"),
               C("Lên bờ tìm việc ban ngày", { custom: "job_new", health: -2, flags: ["x36_hai_noi"] }, "Có thêm lương, ngủ ít, con thuyền vắng bạn")]),
      ],
      /* khoi_dong */
      [
        card("x36_kd_bien_ban", "Biên bản tiếng ồn trên mặt nước", (c, k) => `${cap(k.npc("can_bo_song"))} cập ca nô vào mạn thuyền, mang theo máy đo tiếng ồn và một cuốn biên bản dày. Máy đo chỉ con số cao hơn cả tiếng còi tàu. ${f(c, "x36_giua_song") ? "Cô nói ra giữa sông không có nghĩa là ra khỏi luật." : "Cô nói cả hai bờ đã gọi điện phản ánh."}`,
          (c) => [C("Lắp cách âm cho buồng hát", { money: -0.2, flags: ["x36_cach_am"] }, me36(c) ? "Tốn tiền, mẹ nói hát trong hộp thì buồn" : "Tốn tiền, khách nói hát trong hộp thì buồn"),
           C("Mời cô cán bộ hát một bài", { gamble: { p: 0.5, win: { rel: 2, flags: ["x36_can_bo_hat"], log: "Cô hát ba bài, tối thứ sáu nào cũng ghé." }, lose: { money: -0.1, flags: ["x36_bi_phat"], log: "Cô từ chối và ghi biên bản gấp đôi." } } }, "Có thể thành bạn, có thể bị phạt gấp đôi")]),
        card("x36_kd_dam_cuoi", "Đám cưới trên sông", (c, k) => `Một cặp đôi đặt con thuyền cho tiệc cưới, ba mươi khách, hát đến nửa đêm. Thuyền chở được hai mươi người là cùng. ${k.gag()}`,
          [C("Nhận đủ ba mươi khách", { money: 0.3, counters: { x36_khach: 2 }, flags: ["x36_dam_cuoi"] }, "Tiền nhiều, thuyền chìm sâu thêm một gang"),
           C("Chỉ nhận hai mươi khách", { money: 0.1, flags: ["x36_an_toan"] }, "Ít tiền, cô dâu giận")]),
      ],
      /* cu_lat */
      [
        card("x36_cl_nuoc_len", "Mùa nước lên", (c, k) => `Nước lũ lên trong một đêm, và con thuyền karaoke thành chỗ khô ráo duy nhất cả xóm. Trong số người lội ra là ${k.scar("nguoi") || "một người quen cũ"}, người từng biết bạn từ thời còn ${doTail(k, "những ngày cũ")}. ${me36(c) ? "Mẹ đếm người, rồi nhìn bạn" : "Bạn đếm người, rồi nhìn lên tấm ảnh mẹ treo trong buồng lái"}: thuyền chỉ chở được nửa số đó.`,
          [C("Đón hết, bỏ dàn loa xuống nước cho nhẹ", { money: -0.2, rel: 5, flags: ["x36_cuu_lu", "x36_mat_loa"] }, "Cứu được cả xóm, mất giọng hát của con thuyền"),
           C("Chỉ đón người quen và người già", { rel: -2, flags: ["x36_chon_nguoi"] }, "Giữ được thuyền, có người nhớ mặt bạn")]),
      ],
      /* day */
      [
        card("x36_day_me_mat_giong", (c) => (me36(c) ? "Mẹ mất giọng" : "Cuộn băng bị nhão"), (c, k) => `${me36(c) ? "Sau một mùa hát quá nhiều, giọng mẹ chỉ còn là tiếng thì thào. Bác sĩ bảo nghỉ ba tháng, mẹ bảo ba ngày." : "Cuộn băng bài tủ mẹ để lại bị nhão sau một mùa phát quá nhiều, giọng mẹ trong loa chỉ còn là tiếng thì thào."} ${f(c, "x36_o_han") ? "Bạn đã ở hẳn trên thuyền từ lâu, nên tiền chợ giờ chỉ trông vào tiếng hát ấy." : c.has_job ? "Lương trên bờ của bạn vẫn đủ đong gạo, nhưng con thuyền thì im lặng." : "Ngoài tiếng hát ấy, nhà không có khoản thu nào khác."} ${f(c, "x36_mat_loa") ? "Con thuyền vốn đã không còn loa, giờ thì không còn cả người hát." : "Dàn loa vẫn còn đó, chờ ai đó cầm micro."}`,
          (c) => [C("Cầm micro hát thay mẹ", { happy: -1, counters: { x36_khach: 1 }, flags: ["x36_hat_thay"] }, "Giữ khách, bạn hát dở và ai cũng biết"),
            me36(c)
              ? C("Đóng cửa thuyền một mùa cho mẹ nghỉ", { money: -0.2, flags: ["x36_nghi"], ...momTrust(c, 0.2) }, "Mất thu nhập, mẹ khỏe lại")
              : C("Đóng cửa thuyền một mùa", { money: -0.2, happy: 2, flags: ["x36_nghi"] }, "Mất thu nhập, có thời gian nhớ mẹ")]),
        card("x36_day_thuyen_ro", "Đáy thuyền rò nước", (c, k) => `Bạn thức dậy vì nước đã lên đến mắt cá chân. Thợ đóng thuyền nói đáy đã mục, phải thay cả đoạn giữa. ${k.gag()}`,
          (c) => [C("Vay tiền đóng lại đáy thuyền", { custom: "borrow:0.4", flags: ["x36_sua_day"] }, "Thuyền nổi tiếp, nợ chìm theo"),
           f(c, "x36_mat_loa")
             ? C(f(c, "x36_den") ? "Bán dàn đèn và bộ micro để sửa" : "Bán bộ micro và mấy cái ghế để sửa", { money: 0.1, happy: -3, flags: ["x36_ban_den"] }, f(c, "x36_den") ? "Không nợ, con thuyền hát trong bóng tối" : "Không nợ, khách phải đứng mà nghe")
             : C("Bán dàn loa để sửa", { money: 0.1, happy: -3, flags: ["x36_ban_loa"] }, "Không nợ, bài tủ chỉ còn hát mộc")]),
      ],
      /* chung_ket */
      [
        card("x36_ket", "Bến cuối của con thuyền", (c, k) => `${cap(noOr(c, k))} vẫn neo ở trên bờ, cùng với những gì bạn bỏ lại. ${f(c, "x36_cuu_lu") ? "Cả xóm từng ngủ trên thuyền mùa lũ giờ đứng chật bến, chờ nghe bạn quyết." : "Trên bến, chỉ có ông lái đò và đàn vịt chờ nghe bạn quyết."} ${k.gag()} ${me36(c) ? "Mẹ ngồi ở mũi thuyền, hát rất chậm." : "Chiếc mũ thuyền trưởng của mẹ treo ở mũi thuyền, đung đưa theo sóng."}`,
          (c) => pick(
            pathOpen("restaurateur", c.age) ? ending(L36_QUAN, "Đăng ký quán karaoke nổi cho đàng hoàng", "Thành nghề, sống bằng tiếng hát của mẹ") : undefined,
            ending(L36_SONG, "Mua đứt con thuyền, sống hẳn trên sông", "Nhà là nước, nợ là thuyền"),
            ending(L36_LEN_BO, me36(c) ? "Bán thuyền, đưa mẹ lên phố" : "Bán thuyền, lên phố", "Có tiền, mất con sông"))),
      ],
    ],
  }));

/* ================================================================== X37 Trả nợ bằng bánh */

const L37_THO = land("lo_banh_gia_truyen", "Bạn giữ lò bánh của bà cô và biến nó thành tiệm. Tên tiệm là con số chiếc bánh cuối cùng.", { custom: "become:baker", happy: 5 });
const L37_XOA = land("xoa_no_ca_lang", "Ông trưởng ban đòi bánh xé tờ biên nhận cuối. Số bánh dư bán ra phố đủ một năm thu nhập.", { money: 1, rel: 4 });
const L37_BAN = land("ban_cong_thuc", "Bạn bán công thức cho một hãng bánh lớn và trả hết nợ bằng bánh công nghiệp. Cả làng chê, nhưng vẫn ăn.", { money: 2.5, rel: -3 });

const X37 = weird("X37", "abs", ["tien", "mau"],
  (c) => c.age >= 18 && c.age <= 68 && (anyFlag(c, ["life_baker", "talent_baker", "ex_baker", "life_restaurateur"]) || (c.pressure.mau >= 4 && c.pressure.tien >= 3)),
  () => "Nhận món nợ một triệu chiếc bánh của bà cô",
  () => ({
    title: "Di chúc nợ một triệu chiếc bánh",
    text: `Bạn vừa thừa kế một món nợ không trả được bằng tiền: một triệu chiếc bánh, và cả làng đã chờ bốn mươi năm. Luật sư đọc di chúc của bà cô họ xa xong thì tháo kính, lau, rồi đọc lại lần nữa cho chắc. Đi kèm món nợ là công thức bánh gia truyền. "Bà dặn không được trả bằng tiền. Phải là bánh." Ngoài cửa, người đầu tiên đã đến đòi, tay cầm tờ biên nhận ố vàng.`,
  }),
  season({
    id: "w_X37", vn: "Trả nợ bằng bánh", color: "#d98b2b", years: [7, 12], weird: "abs",
    rules: { income: 0.8, flags: ["w_no_banh"] },
    reset: { cast: [{ key: "truong_ban", role: "creditor", label: "ông trưởng ban đòi bánh" }, { key: "tho_lo", role: "partner", label: "cô thợ lò" }] },
    gag: { key: "bang_dem", lines: [
      "Tấm bảng đếm treo ở cửa lò ghi: còn 999.212 chiếc.",
      "Bảng đếm còn 870.004 chiếc. Ông trưởng ban vẫn đến mỗi sáng, ăn thử một chiếc, ghi chữ đạt.",
      "Bảng đếm còn 612.950 chiếc. Ai đó lén vẽ thêm một số không, cả lò mất ba ngày mới phát hiện.",
      "Bảng đếm còn đúng một chiếc. Không ai trong lò muốn là người nướng chiếc cuối cùng.",
    ] },
    landings: [L37_THO, L37_XOA, L37_BAN],
    beats: [
      /* mo_man */
      [
        card("x37_mo_lo_nguoi", "Lò bánh nguội bốn mươi năm", (c, k) => `Lò bánh của bà cô nằm sau nhà, mạng nhện giăng kín cửa lò như một tấm rèm. ${cap(k.npc("truong_ban"))} đứng chờ sẵn với cuốn sổ, nói làng đã đợi đủ lâu rồi. ${k.gag()}`,
          [C("Nhóm lò ngay đêm nay", { health: -2, counters: { x37_banh: 1 }, flags: ["x37_nhom_lo"] }, "Cả làng thấy khói, bạn mất ngủ"),
           C("Thuê cô thợ lò, chia lãi", { money: -0.1, counters: { x37_banh: 1 }, flags: ["x37_thue_tho"] }, "Nhanh hơn, mất một phần công thức")]),
        card("x37_mo_cong_thuc", "Công thức viết như câu đố", (c, k) => `Công thức của bà không ghi gam hay muỗng: "một nắm bằng tay người đang giận", "nướng đến khi con mèo ngẩng đầu". ${f(c, "x37_thue_tho") ? `${cap(k.npc("tho_lo"))} đọc xong thì cười, nói bà cô của bạn là người tinh quái.` : "Bạn đọc ba lần, rồi đi tìm một con mèo."}`,
          [C("Làm đúng từng chữ, kể cả con mèo", { know: 2, flags: ["x37_dung_cong_thuc"] }, "Chậm, nhưng ra đúng vị của bà"),
           C("Bỏ công thức, làm theo kiểu mình", { counters: { x37_banh: 1 }, flags: ["x37_kieu_minh"] }, "Nhanh, nhưng không giống bánh ai từng ăn")]),
      ],
      /* khoi_dong */
      [
        card("x37_kd_hoi_dong", "Hội đồng nếm bánh", (c, k) => `Hội đồng ba cụ già nếm mẻ bánh đầu tiên trong im lặng. ${f(c, "x37_kieu_minh") ? "Cụ thứ nhất nhổ ra, cụ thứ hai nói không giống, cụ thứ ba xin thêm một chiếc." : "Cụ thứ nhất rơm rớm nước mắt, nói đúng là vị năm đó."} ${k.gag()}`,
          [C("Làm lại cả mẻ cho giống hệt", { money: -0.1, counters: { x37_banh: 1 }, flags: ["x37_lam_lai"] }, "Tốn bột, được lòng hội đồng"),
           C("Xin hội đồng nếm lại vào tuần sau", { happy: -1, flags: ["x37_hoan"] }, "Có thời gian sửa, cả làng sốt ruột"),
           C("Cãi: giấy nợ ghi bánh, không ghi ngon", { flags: ["x37_cai_chu"] }, "Đúng luật, mất lòng cả làng", { tier: "sovereign" })]),
        card("x37_kd_khach_pho", "Người phố muốn mua bằng tiền", (c, k) => `Một người từ thành phố nếm thử một chiếc, rồi muốn mua năm nghìn chiếc với giá tốt. Nhưng mỗi chiếc bánh ra lò đều là của làng, theo giấy nợ.`,
          [C("Bán một nửa, lấy tiền mua lò mới", { money: 0.4, counters: { x37_banh: 1 }, flags: ["x37_ban_ra_pho"] }, "Có lò mới, làng phải chờ lâu hơn"),
           C("Từ chối, bánh là của làng", { rel: 3, flags: ["x37_giu_banh"] }, "Được làng thương, lò vẫn cũ")]),
      ],
      /* cu_lat */
      [
        card("x37_cl_bien_nhan", "Tờ biên nhận đầu tiên", (c, k) => `Lục hộp giấy của bà cô, bạn tìm thấy tờ biên nhận đầu tiên, ghi tên gia đình của ${k.scar("nguoi") || "một người quen cũ"}. Bên lề, bà cô ghi tên ${k.scar("do") ? `${k.scar("do")}, đúng ${DO_TAIL}` : "một tấm ảnh cũ"}, như thể bà đã biết trước. Dòng cuối viết: món nợ này không phải tiền, là một lời xin lỗi.`,
          [C("Giao phần bánh đó trước tiên", { rel: 3, counters: { x37_banh: 1 }, flags: ["x37_uu_tien"] }, "Trả xong lời xin lỗi của bà, làng xếp hàng chờ"),
           C("Đi hỏi cho ra chuyện năm xưa", { know: 3, flags: ["x37_chuyen_cu"] }, "Biết sự thật, mất một mùa bánh")]),
      ],
      /* day */
      [
        card("x37_day_bot_tang", "Giá bột tăng gấp ba", (c, k) => `Giá bột tăng gấp ba trong một mùa, và giấy nợ không ghi gì về giá bột. ${cap(k.npc("tho_lo"))} lật ngược bao bột cuối cùng cho bạn xem. ${k.gag()}`,
          [C("Vay tiền mua bột cho cả năm", { custom: "borrow:0.5", flags: ["x37_tich_bot"] }, "Lò chạy đều, nợ tiền chồng lên nợ bánh"),
           C("Làm bánh nhỏ lại một nửa", { rel: -2, counters: { x37_banh: 2 }, flags: ["x37_banh_nho"] }, "Đếm nhanh gấp đôi, cả làng bĩu môi")]),
        card("x37_day_lo_nut", "Lò nứt giữa mẻ thứ mười nghìn", (c, k) => `Đúng mẻ thứ mười nghìn, cửa lò nứt một đường dài, khói tràn ra cả xóm. ${f(c, "x37_ban_ra_pho") ? "Chiếc lò mới mua bằng tiền người phố vẫn chưa lắp xong." : "Lò này đã nướng bánh từ thời bà cô còn trẻ."}`,
          [C("Nướng nhờ lò nhà hàng xóm", { rel: 2, counters: { x37_banh: 1 }, flags: ["x37_lo_nho"] }, "Nợ thêm ơn, bánh vẫn ra"),
           C("Nghỉ một tháng xây lò mới", { money: -0.3, health: 3, flags: ["x37_lo_moi"] }, "Lò tốt hơn, bảng đếm đứng yên")]),
      ],
      /* chung_ket */
      [
        card("x37_ket", "Chiếc bánh thứ một triệu", (c, k) => `${k.gag()} Cuối cùng bạn tự tay nướng nó, và giờ nó nằm trên khay, còn nóng. ${cap(noOr(c, k))} của chính bạn vẫn chưa ai đòi, nhưng ai cũng biết. ${f(c, "x37_cai_chu") ? "Hội đồng nếm bánh đến đủ, vẫn còn giận chuyện chữ ngon." : "Hội đồng nếm bánh đến đủ, mặc áo đẹp nhất."} ${cap(k.npc("truong_ban"))} cầm tờ biên nhận cuối, chờ bạn quyết số phận của cái lò.`,
          (c) => pick(
            pathOpen("baker", c.age) ? ending(L37_THO, "Giữ lò, mở tiệm bánh gia truyền", "Thành nghề, thơm tay cả đời") : undefined,
            ending(L37_XOA, "Giao chiếc cuối, xin làng xóa nợ", "Sạch nợ, có thêm một khoản"),
            ending(L37_BAN, "Bán công thức cho hãng bánh lớn", "Giàu, nhưng làng nhớ mãi"))),
      ],
    ],
  }));

/* ================================================================== X38 Ngoại giao sân trường */

const L38_GIAO = land("thay_co_dai_su", "Bạn chuyển hẳn sang nghề dạy học. Học trò gọi bạn là ngài đại sứ.", { custom: "become:professor", happy: 4 }); // gần nhất: nghề giáo
const L38_NGOAI_GIAO = land("ngoai_giao_that", "Một người ở bộ ngoại giao đọc báo về bạn và mời bạn thi tuyển. Bạn đỗ.", { custom: "become:diplomat", happy: 4 });
const L38_SACH = land("hoi_ky_ba_o_gach", "Cuốn hồi ký về đất nước ba ô gạch bán chạy, bạn đi khắp nơi kể chuyện.", { custom: "become:writer", happy: 3 });
const L38_GIAI = land("giai_thuong_hoa_binh", "Bạn nhận giải thưởng của một quỹ giáo dục, đủ tiền sống một năm rưỡi.", { money: 1.5, happy: 3 });
const L38_CO_VAN = land("co_van_tron_doi", "Bạn nghỉ hẳn việc, làm cố vấn trọn đời cho nước ba ô gạch. Phụ huynh góp quỹ tặng bạn một khoản đủ sống một năm, lương thì trả bằng tranh vẽ.", { custom: "retire", money: 1, happy: 5 });

const X38 = weird("X38", "abs", ["danh", "mau"],
  (c) => c.age >= 25 && c.age <= 68 && (anyFlag(c, ["job_teach", "life_professor", "highland_teacher"]) || c.kids_school > 0),
  () => "Nhận chức đại sứ của một nước trong sân trường",
  () => ({
    title: "Quốc thư viết bằng bút sáp",
    text: `Giờ ra chơi, một phái đoàn bảy đứa trẻ khoác khăn tắm làm áo choàng tiến về phía bạn, mang theo một tờ quốc thư viết bằng bút sáp màu. Nước của chúng nằm giữa gốc cây và cột cờ, rộng đúng ba ô gạch, vừa tuyên bố độc lập sáng nay. "Chúng cháu cần một người lớn làm đại sứ. Người lớn khác đều bận." Cô bé nguyên thủ quốc gia chìa tay ra, ngón tay còn dính mực.`,
  }),
  season({
    id: "w_X38", vn: "Ngoại giao sân trường", color: "#eebc3a", years: [5, 9], weird: "abs",
    rules: { flags: ["w_ngoai_giao_san_truong"], yearly: { money: -0.03 } },
    reset: { cast: [{ key: "nguyen_thu", role: "neighbor", label: "cô bé nguyên thủ" }, { key: "hieu_pho", role: "first_boss", label: "thầy hiệu phó" }] },
    gag: { key: "hiep_uoc", lines: [
      "Hiệp ước đầu tiên được ký trên giấy gói kẹo: hai nước cùng dùng chung cái xích đu.",
      "Nước láng giềng bên bồn hoa đòi ký lại hiệp ước xích đu. Lý do: giấy gói kẹo bị ăn mất.",
      "Kho lưu trữ quốc gia, tức một hộp bút chì, giờ chứa bốn mươi hai hiệp ước và một con dế.",
      "Hiệp ước hòa bình cuối cùng được ký bằng ba thứ: bút sáp, phấn, và một vết sô-cô-la.",
    ] },
    landings: [L38_GIAO, L38_NGOAI_GIAO, L38_SACH, L38_GIAI, L38_CO_VAN],
    beats: [
      /* mo_man */
      [
        card("x38_mo_quoc_thu", "Trình quốc thư trước cột cờ", (c, k) => `${cap(k.npc("nguyen_thu"))} yêu cầu một lễ trình quốc thư đúng nghi thức: đại sứ phải cúi chào, đọc to, và không được cười. Nghi thức còn gồm quà ngoại giao: mỗi năm một túi kẹo cho cả nước, đại sứ tự lo. Cả sân trường dừng chơi để xem. ${k.gag()}`,
          (c) => [C("Mặc vest đi trình quốc thư", { happy: 3, counters: { x38_uy_tin: 1 }, flags: ["x38_vest"] }, c.has_job && anyFlag(c, ["job_teach", "life_professor", "highland_teacher"]) ? "Lũ trẻ tin bạn tuyệt đối, đồng nghiệp thì cười" : "Lũ trẻ tin bạn tuyệt đối, các phụ huynh thì cười"),
           C("Nhận chức, giữ kín với người lớn", { flags: ["x38_bi_mat"] }, "Yên chuyện, nhưng bí mật nào cũng có ngày lộ")]),
        card("x38_mo_o_gach", "Tranh chấp ô gạch thứ tư", (c, k) => `Nước láng giềng bên bồn hoa tuyên bố ô gạch thứ tư là lãnh thổ lịch sử của họ, vì có lần họ làm rơi kẹo ở đó. Hai nguyên thủ đứng hai bên, tay khoanh trước ngực, chờ đại sứ lên tiếng.`,
          [C("Đề xuất chia đôi ô gạch bằng phấn", { counters: { x38_uy_tin: 1 }, flags: ["x38_chia_doi"] }, "Công bằng, cả hai bên đều hơi tiếc"),
           C("Đứng về phía nước mình", { rel: -1, flags: ["x38_thien_vi"] }, "Lũ trẻ của bạn reo hò, bồn hoa thề trả thù")]),
      ],
      /* khoi_dong */
      [
        card("x38_kd_hieu_pho", "Lệnh giải tán của thầy hiệu phó", (c, k) => `${cap(k.npc("hieu_pho"))} dán thông báo: sân trường không phải là quốc gia, mọi hoạt động ngoại giao phải dừng trước thứ hai. ${f(c, "x38_bi_mat") ? "Thầy còn chưa biết đại sứ là ai." : "Thầy nhìn thẳng vào bạn khi đọc thông báo."}`,
          [C("Nhượng bộ, dời nước ra sau nhà xe", { happy: -2, flags: ["x38_doi_nuoc"] }, "Hết rắc rối, lũ trẻ buồn"),
           C("Cãi thẳng với thầy trong phòng hội đồng", { rel: -2, counters: { x38_uy_tin: 1 }, flags: ["x38_cai_thay"] }, "Lũ trẻ nể, thầy hiệu phó ghi nhớ"),
           C("Đàm phán quy chế tự trị giờ ra chơi", { counters: { x38_uy_tin: 2 }, flags: ["x38_tu_tri"] }, "Mất ba buổi chiều, có thể được cả trường nể", { tier: "sovereign" })]),
        card("x38_kd_banh_quy", "Khủng hoảng bánh quy", (c, k) => `Nước láng giềng cấm vận bánh quy, và nước ba ô gạch cạn kho chỉ sau hai giờ ra chơi. Cô bé nguyên thủ gọi đây là ngày đen tối nhất lịch sử. ${k.gag()}`,
          [C("Bỏ tiền túi mua kẹo cứu trợ", { money: -0.05, counters: { x38_uy_tin: 1 }, flags: ["x38_cuu_tro"] }, "Lũ trẻ biết ơn, ví bạn nhẹ đi"),
           C("Để hai nước tự giải quyết", { know: 2, flags: ["x38_buong_tay"] }, "Lũ trẻ học được thương lượng, bạn mất điểm")]),
      ],
      /* cu_lat */
      [
        card("x38_cl_hop_phu_huynh", "Cuộc họp phụ huynh bất thường", (c, k) => `Ba mươi phụ huynh ngồi chật lớp học, có cả ${k.scar("nguoi") || "một người quen cũ"}, giận vì con họ về nhà đòi có hộ chiếu. Cô bé nguyên thủ đứng lên đọc tên quốc bảo của đất nước: ${k.scar("do") ? `${k.scar("do")}, ${DO_TAIL} và đã kể cho lũ trẻ nghe hôm nhậm chức` : "một món đồ bạn từng làm rơi, chuyện bạn đã kể cho lũ trẻ nghe hôm nhậm chức"}.`,
          [C("Đứng ra bảo vệ lũ trẻ", { rel: -2, counters: { x38_uy_tin: 2 }, flags: ["x38_bao_ve"] }, "Mất lòng phụ huynh, lũ trẻ nhớ bạn cả đời"),
           C("Xin lỗi, hứa dẹp chuyện này", { rel: 2, flags: ["x38_xin_loi"] }, "Phụ huynh yên tâm, quốc gia lung lay")]),
      ],
      /* day */
      [
        card("x38_day_bao_chi", "Nhà báo đến sân trường", (c, k) => `Một nhà báo đăng bài về người lớn duy nhất làm đại sứ cho một nước rộng ba ô gạch, và bài viết lan đi khắp nơi. Ống kính chĩa vào sân trường từ sáng sớm. ${k.gag()}`,
          [C("Trả lời phỏng vấn", { counters: { x38_uy_tin: 1 }, flags: ["x38_len_bao"] }, "Nổi tiếng, lũ trẻ thành đề tài bàn tán"),
           C("Từ chối, che lũ trẻ khỏi ống kính", { happy: 2, flags: ["x38_che_chan"] }, "Mất cơ hội, giữ được tuổi thơ của chúng")]),
        card("x38_day_ke_nhiem", "Nguyên thủ sắp tốt nghiệp", (c, k) => `${cap(k.npc("nguyen_thu"))} sắp tốt nghiệp, và nước ba ô gạch chưa có luật kế vị. ${f(c, "x38_bao_ve") ? "Lũ trẻ tin bạn hơn bất kỳ ai, nên chúng hỏi bạn phải làm gì." : "Ba ứng viên đã tự xưng, một trong số đó mới bốn tuổi."}`,
          [C("Tổ chức bầu cử bằng sỏi", { counters: { x38_uy_tin: 1 }, flags: ["x38_bau_cu"] }, "Lũ trẻ học dân chủ, mất hai tuần đếm sỏi"),
           C("Để cô bé tự chỉ định người kế nhiệm", { flags: ["x38_chi_dinh"] }, "Nhanh gọn, ứng viên bốn tuổi khóc")]),
      ],
      /* chung_ket */
      [
        card("x38_ket", "Lễ hạ cờ cuối năm học", (c, k) => `Lá cờ vẽ bằng bút sáp được hạ xuống lần cuối của năm học. ${cap(noOr(c, k))} vẫn đi theo bạn ngoài cổng trường. ${n(c, "x38_uy_tin") >= 4 ? "Lũ trẻ xếp hàng, mỗi đứa trao bạn một tờ giấy khen tự vẽ." : "Lũ trẻ vẫy tay, vài đứa đã quên bạn là ai."} ${k.gag()} Ngoài cổng, cuộc đời người lớn đang chờ bạn quyết.`,
          (c) => pick(
            pathOpen("professor", c.age) ? ending(L38_GIAO, "Chuyển hẳn sang nghề dạy học", "Lương ít, sân trường là của bạn") : undefined,
            pathOpen("diplomat", c.age) ? ending(L38_NGOAI_GIAO, "Đi thi làm nhà ngoại giao thật", "Từ ba ô gạch ra cả thế giới")
              : pathOpen("writer", c.age) ? ending(L38_SACH, "Viết hồi ký đại sứ ba ô gạch", "Kể chuyện cả đời, sống bằng chữ") : undefined,
            ending(L38_GIAI, "Nhận giải thưởng, quay lại đời cũ", "Có tiền, sân trường chỉ còn là kỷ niệm"),
            ending(L38_CO_VAN, "Nghỉ hẳn, làm cố vấn trọn đời", "Ít tiền, nhiều tranh vẽ"))),
      ],
    ],
  }));

/* ================================================================== X39 Mối thù với quạ */

const L39_HOA = land("qua_tra_do", "Con quạ trả lại tất cả đồ sáng bóng của bao năm, xếp thành hàng trên bậc cửa. Bán lại cũng được bằng một năm thu nhập.", { money: 1, happy: 6 });
const L39_BAO_TON = land("nguoi_bao_ton_chim", "Bạn thành người bảo tồn chim. Trong ảnh thẻ, có một con quạ mỏ sứt đậu trên vai.", { custom: "become:environmentalist", happy: 5 });
const L39_DOI = land("doi_nha_tron_qua", "Bạn dọn lên thành phố để thoát con quạ. Một tuần sau, có một chiếc lông đen trên bậu cửa sổ căn hộ mới.", { custom: "move_city", happy: -2 });

const X39 = weird("X39", "abs", ["ky", "dat"],
  (c) => c.age >= 18 && c.age <= 68 && (c.farmer || c.flags.has("orchard") || c.owns.has("land")),
  () => "Ném trả con quạ một hòn sỏi",
  () => ({
    title: "Con quạ nhớ mặt bạn",
    text: `Từ sáng nay, mọi thứ sáng bóng bạn có sẽ lần lượt biến mất, và kẻ trộm có cánh. Nhiều năm trước, bạn ném một hòn sỏi trượt qua đầu một con quạ trong vườn. Nó chưa quên. Chiếc chìa khóa, chiếc nhẫn và cả nắp nồi nhà bạn đã đi trước, thay vào đó là đúng hòn sỏi năm xưa đặt ngay ngắn trên bậc cửa. Trên cành cây trước nhà, con quạ mỏ sứt nghiêng đầu nhìn bạn và kêu "Quạ!" một tiếng, nghe như một lời tuyên chiến.`,
  }),
  season({
    id: "w_X39", vn: "Mối thù với quạ", color: "#cf8a2e", years: [6, 12], weird: "abs",
    rules: { flags: ["w_thu_qua"] },
    reset: { cast: [{ key: "ba_nghien_cuu", role: "mentor", label: "bà nghiên cứu chim" }, { key: "be_hang_xom", role: "neighbor", label: "cậu bé hàng xóm nuôi chim" }] },
    gag: { key: "do_sang", lines: [
      "Chiếc thìa inox cuối cùng trong nhà biến mất. Trên bậu cửa sổ có một chiếc lông đen.",
      "Bạn sơn đen mọi thứ sáng bóng trong nhà. Sáng hôm sau, mất luôn hộp sơn.",
      "Con quạ đậu trên dây điện, đeo chiếc nhẫn của bạn trên cổ như một tấm huân chương.",
      "Hôm nay không mất gì. Bạn lo đến mức không ngủ được.",
    ] },
    landings: [L39_HOA, L39_BAO_TON, L39_DOI],
    beats: [
      /* mo_man */
      [
        card("x39_mo_vu_trom", "Vụ trộm đầu tiên", (c, k) => `Cả nhà kiểm kê: mất bảy chiếc thìa, hai chìa khóa, một cặp kính và chiếc đồng hồ không chạy. Con quạ đậu ở hàng rào, ăn sáng bằng hạt giống của bạn. ${k.gag()}`,
          [C("Ném trả một hòn sỏi", { counters: { x39_thu: 1 }, flags: ["x39_nem"] }, "Hả giận, và nó đi gọi thêm bạn"),
           C("Đặt một chiếc thìa lên hàng rào làm quà", { counters: { x39_hoa: 1 }, flags: ["x39_qua_tang"] }, "Có thể là đầu hàng, có thể là ngoại giao"),
           C("Dựng bù nhìn đeo kính râm", { money: -0.02, flags: ["x39_bu_nhin"] }, "Rẻ, và con quạ lấy luôn kính râm")]),
        card("x39_mo_ba_nghien_cuu", "Bà nghiên cứu chim gõ cửa", (c, k) => `${cap(k.npc("ba_nghien_cuu"))} gõ cửa, mang theo một cuốn sổ dày. Bà giải thích loài quạ nhớ mặt người rất lâu, và dạy cả con cháu ghét đúng người đó. "Chúc mừng. Bạn đã thành truyền thống của một gia đình quạ."`,
          [C("Cho bà ghi chép mọi vụ trộm", { know: 3, flags: ["x39_ghi_chep"] }, "Hiểu kẻ thù, nhà thành phòng thí nghiệm"),
           C("Đeo mặt nạ mỗi khi ra vườn", { happy: -1, flags: ["x39_mat_na"] }, "Quạ không nhận ra, hàng xóm thì có")]),
      ],
      /* khoi_dong */
      [
        card("x39_kd_ngay_quan_trong", "Ngày quan trọng nhất năm", (c, k) => `Đúng sáng bạn có việc lớn nhất năm, con quạ sà xuống giật mất chùm chìa khóa nhà và bay lên ngọn cây cao nhất xóm. ${f(c, "x39_mat_na") ? "Hôm nay bạn quên đeo mặt nạ." : "Nó nhìn thẳng vào bạn, như đã chờ ngày này từ lâu."} ${k.gag()}`,
          [C("Leo cây đòi lại", { health: -4, counters: { x39_thu: 1 }, flags: ["x39_leo_cay"] }, "Lấy được chìa khóa, gãy một ngón tay"),
           C("Bỏ qua, gọi thợ phá khóa", { money: -0.1, flags: ["x39_bo_qua"] }, "Trễ một chút, đỡ một cuộc chiến")]),
        card("x39_kd_ca_dan", "Cả đàn đến dự", (c, k) => `Con quạ mỏ sứt dẫn về cả đàn, ba mươi con, đậu kín dây điện trước nhà mỗi sáng. Chúng theo bạn ra chợ, ra đồng, và đứng chờ ở cổng như một đội hộ tống. ${cap(k.npc("be_hang_xom"))} nói nhỏ: "${c.sex === "F" ? "Cô" : "Chú"} có muốn cháu dạy cách nói chuyện với chúng không?"`,
          (c) => [C("Rải hạt cho cả đàn mỗi sáng", { money: -0.05, counters: { x39_hoa: 1 }, flags: ["x39_cho_an"] }, "Tốn tiền hạt, đàn quạ bắt đầu chờ bạn"),
           C(c.has_job ? "Đổi giờ đi làm sang ca đêm" : "Chỉ ra khỏi nhà sau khi trời tối", { health: -2, flags: ["x39_ca_dem"] }, "Thoát quạ, mất ngủ")]),
      ],
      /* cu_lat */
      [
        card("x39_cl_kho_bau", "Kho báu trên ngọn cây", (c, k) => `${cap(k.npc("be_hang_xom"))} dẫn bạn đến tổ quạ trên ngọn cây cao nhất. Trong đó là bao năm đồ sáng bóng của bạn và một tấm ảnh cũ có ${k.scar("nguoi") || "một người quen cũ"}. Nhìn đống đồ, bạn chợt nghĩ đến ${doTail(k, "những gì quý nhất của mình")}, thứ duy nhất con quạ chưa lấy được. Con quạ đậu ngay cạnh tổ, không bay đi, chỉ nhìn. ${f(c, "x39_mat_na") ? "Bạn đang đeo mặt nạ, nhưng nó vẫn nhận ra dáng đi của bạn." : f(c, "x39_qua_tang") ? "Chiếc thìa bạn đặt làm quà năm nào nằm riêng một góc, được lau sáng nhất." : "Nó vẫn giữ hòn sỏi thứ hai, phòng khi cần."}`,
          [C("Lấy lại hết", { money: 0.2, counters: { x39_thu: 2 }, flags: ["x39_lay_lai"] }, "Đồ về tay, chiến tranh leo thang"),
           C("Lấy một món, để lại một chiếc thìa mới", { happy: 3, counters: { x39_hoa: 2 }, flags: ["x39_doi_qua"] }, "Mất gần hết, được một hiệp ước")]),
      ],
      /* day */
      [
        card("x39_day_ca_xom", "Cả xóm trách bạn", (c, k) => `Đàn quạ bắt đầu lấy đồ của cả xóm: kính, kéo, bông tai, cả huy chương của một ông cụ. Người ta họp xóm và mọi ánh mắt đổ dồn về phía bạn. ${f(c, "x39_cho_an") ? "Ai cũng biết chính bạn rải hạt mỗi sáng nên cả đàn mới ở lại." : "Có người nói phải chi năm đó bạn đừng ném hòn sỏi."} ${k.gag()}`,
          [C("Đền đồ cho hàng xóm", { money: -0.2, rel: 2, flags: ["x39_den"] }, "Mất tiền, giữ được hòa khí"),
           C("Kể chuyện hòn sỏi năm xưa", { rel: 1, counters: { x39_hoa: 1 }, flags: ["x39_thu_nhan"] }, "Cả xóm cười, có người thông cảm")]),
        card("x39_day_qua_om", "Con quạ già trong mưa", (c, k) => `Một đêm mưa lạnh, con quạ mỏ sứt rơi xuống sân nhà bạn, lông ướt sũng, cánh không nhấc lên được. Nó đã già. ${n(c, "x39_thu") > n(c, "x39_hoa") ? "Nó vẫn cố mổ vào tay bạn khi bạn cúi xuống." : "Nó nhìn bạn, không kêu, không bay."}`,
          [C("Mang nó vào nhà sưởi ấm", { happy: 2, counters: { x39_hoa: 2 }, flags: ["x39_cuu_qua"] }, "Kẻ thù nằm trong hộp giấy cạnh bếp"),
           C("Để nó ngoài hiên", { happy: -3, counters: { x39_thu: 1 }, flags: ["x39_mac_qua"] }, "Hết chiến tranh, nhưng không ai thắng")]),
      ],
      /* chung_ket */
      [
        card("x39_ket", "Lời chào cuối của con quạ", (c, k) => `${cap(noOr(c, k))} vẫn còn đó, như hòn sỏi năm xưa trên bậc cửa. ${n(c, "x39_hoa") >= n(c, "x39_thu") ? "Sáng nay con quạ đặt lên bậc cửa một chiếc thìa, chiếc thìa đầu tiên nó từng lấy." : "Sáng nay con quạ đậu trên mái nhà, ngậm chiếc chìa khóa cuối cùng của bạn, chờ."} ${k.gag()}`,
          (c) => pick(
            ending(L39_HOA, "Ngồi xuống bậc cửa, làm hòa", "Nhận lại đồ, có một người bạn mỏ sứt"),
            pathOpen("environmentalist", c.age) ? ending(L39_BAO_TON, "Đi làm người bảo tồn chim", "Biến mối thù thành một nghề") : undefined,
            ending(L39_DOI, "Dọn lên thành phố cho xong", "Thoát được nó, hoặc không"))),
      ],
    ],
  }));

/* ================================================================== X40 Người của một ngày */

const L40_THU = land("sach_thu_hai_nguoi", "Bạn in hết thư từ của hai người thành sách. Ở trang cuối, người kia viết lời cảm ơn.", { custom: "become:writer", happy: 5 });
const L40_CUOI = land("cuoi_nguoi_quen_cua_ho", "Bạn cưới người mà người kia đã quen trước. Đám cưới được tổ chức đúng vào ngày đó.", { custom: "marry", happy: 8 });
const L40_TRA = land("tra_no_ca_hai", "Bạn trả nốt món nợ cuối cùng của người kia. Năm sau, lá thư chỉ có một chữ: cảm ơn.", { money: -1.5, happy: 6 });
const L40_DOI = land("song_o_noi_nguoi_kia_chon", "Bạn chuyển đến thành phố người kia chọn, ở căn hộ người kia đã đặt cọc từ ba năm trước.", { custom: "move_city", happy: 3 });

const X40 = weird("X40", "abs", ["than", "ky"],
  (c) => c.age >= 18 && c.age <= 70 && c.pressure.than >= 5 && c.pressure.ky >= 1,
  () => "Nhường một ngày mỗi năm cho người kia",
  () => ({
    title: "Ngày bạn không có mặt",
    text: `Bạn tỉnh dậy với một hình cá heo vẽ bằng bút bi trên cổ tay, một chậu xương rồng lạ trên bàn, và một tin nhắn gửi từ số điện thoại của chính mình. Cả ngày hôm qua đã biến mất khỏi trí nhớ, không sót một phút. Tin nhắn viết: "Chào. Mình là người hôm qua. Mình mượn tạm ít tiền, sang năm gặp lại." Trên lịch treo tường có một ngày được khoanh đỏ, nét chữ không phải của bạn.`,
  }),
  season({
    id: "w_X40", vn: "Người của một ngày", color: "#e6a23c", years: [7, 12], weird: "abs",
    rules: { flags: ["w_nguoi_mot_ngay"], yearly: { money: -0.05 } },
    reset: { cast: [{ key: "ban_cua_ho", role: "partner", label: "người bạn của người kia" }, { key: "cam_do", role: "creditor", label: "bà chủ tiệm cầm đồ" }] },
    gag: { key: "loi_nhan", lines: [
      "Tờ giấy dán trên gương: \"Mượn tạm ít tiền mua giày. Giày đẹp.\" Ký tên: Người Hôm Đó.",
      "Năm nay người kia để lại lời nhắn: \"Tưới cây xương rồng mỗi tháng một lần. Đừng nói chuyện với nó, nó ngại.\"",
      "Người kia để lại một cuốn sổ bìa ghi \"Hai chúng ta\". Trang đầu là danh sách nợ, trang cuối là danh sách những người đã gặp.",
      "Lời nhắn năm nay dài ba trang, trang cuối chỉ có một dòng: \"Mình đăng ký cho bạn học nhảy rồi. Đóng tiền rồi.\"",
      "Lời nhắn năm nay: \"Bạn ngáy to quá. Mình đã mua cho bạn cái gối mới.\" Cái gối đặt sẵn trên giường.",
      "Năm nay không có lời nhắn nào. Chỉ có bữa sáng đã nấu sẵn, bày cho hai người.",
      "Lời nhắn năm nay viết run run: \"Hôm nay mình đi khám rồi. Mình khỏe. Bạn cũng khỏe. Đừng lo.\"",
      "Lá thư cuối cùng không ký tên Người Hôm Đó nữa. Nó ký đúng tên bạn, bằng nét chữ của người kia.",
    ] },
    landings: [L40_THU, L40_CUOI, L40_TRA, L40_DOI],
    beats: [
      /* mo_man */
      [
        card("x40_mo_tin_nhan", "Một ngày không có trong trí nhớ", (c, k) => `Năm đầu tiên, bạn kiểm tra ví và thấy thiếu đúng số tiền một đôi giày. Dưới gầm giường có một đôi giày mới, màu bạn chưa bao giờ dám mua. ${k.gag()}`,
          [C("Nhắn trả lời cho người kia", { counters: { x40_thu: 1 }, flags: ["x40_tra_loi"] }, "Bắt đầu một cuộc thư từ rất kỳ quặc"),
           C("Đi khám thần kinh", { money: -0.1, health: 1, flags: ["x40_kham"] }, "Bác sĩ không tìm ra gì, hóa đơn thì có")]),
        card("x40_mo_nguoi_la", "Người lạ gọi bạn bằng tên thân mật", (c, k) => `Ở chợ, ${k.npc("ban_cua_ho")} ôm chầm lấy bạn, gọi bạn bằng một biệt danh bạn chưa từng nghe. "Hôm đó vui quá. Năm sau mình lại đi câu nhé?" ${k.gag()}`,
          [C("Giả vờ nhớ hết", { counters: { x40_quen: 1 }, flags: ["x40_gia_vo"] }, "Giữ được người bạn, sống trong một vai"),
           C("Nói thật: tôi không phải người hôm đó", { happy: 1, flags: ["x40_noi_that"] }, "Người đó ngơ ngác, rồi tò mò")]),
      ],
      /* khoi_dong */
      [
        card("x40_kd_cam_do", "Biên lai tiệm cầm đồ", (c, k) => `Năm thứ ba, trong túi áo có một tờ biên lai: người kia đã đem chiếc đồng hồ của bạn đi cầm để lấy tiền mua vé xem nhạc. Mặt sau ghi: "Yên tâm, ${k.scar("do") || "thứ quý nhất của bạn"} thì mình không đụng tới." ${cap(k.npc("cam_do"))} nhận ra bạn ngay: "Hôm đó bạn hát suốt từ cửa vào đến quầy." ${k.gag()}`,
          [C("Chuộc lại chiếc đồng hồ", { money: -0.2, flags: ["x40_chuoc"] }, "Mất tiền, giữ được đồ của mình"),
           C("Khóa ví trước ngày đó", { counters: { x40_thu: 1 }, flags: ["x40_khoa_vi"] }, "Năm sau người kia sẽ phá khóa")]),
        card("x40_kd_lop_nhay", "Lớp học nhảy đã đóng tiền", (c, k) => `Thầy dạy nhảy gọi điện nhắc lịch học, giọng rất vui: "Hôm đăng ký bạn nhảy đẹp lắm, chỉ hơi ngượng một chút." Bạn chưa nhảy bao giờ trong đời. ${k.gag()}`,
          [C("Đi học thử một buổi", { health: 2, happy: 3, flags: ["x40_hoc_nhay"] }, "Vụng về, nhưng hóa ra vui"),
           C("Gọi điện đòi lại tiền", { money: 0.05, flags: ["x40_doi_tien"] }, "Lấy lại tiền, người kia sẽ biết")]),
      ],
      /* cu_lat */
      [
        card("x40_cl_nguoi_cu", "Người kia đã đi gặp ai", (c, k) => `Năm thứ năm, bạn phát hiện người kia đã đi gặp ${k.scar("nguoi") || "một người quen cũ"} và nói chuyện suốt một buổi chiều. Người đó gọi cho bạn, giọng nghẹn lại: "Cảm ơn vì hôm ấy đã đến. Tôi chờ câu đó lâu lắm rồi." ${k.gag()}`,
          [C("Đến gặp người đó hỏi chuyện", { rel: 3, counters: { x40_thu: 1 }, flags: ["x40_hoi_lai"] }, "Biết người kia đã nói gì, và đã sửa được gì"),
           C("Viết thư mắng người kia", { happy: -1, counters: { x40_thu: 1 }, flags: ["x40_mang"] }, "Giữ ranh giới, người kia có thể buồn")]),
      ],
      /* day */
      [
        card("x40_day_no_lon", "Món nợ người kia để lại", (c, k) => `${cap(k.npc("cam_do"))} đến tận nhà: người kia đã vay một khoản lớn để đặt cọc một căn hộ ở thành phố khác. ${f(c, "x40_mang") ? "Lá thư mắng năm ngoái của bạn được kẹp trong hợp đồng, có dòng chữ: \"Mình hiểu. Nhưng mình cũng cần một nơi để ở.\"" : "Hợp đồng ký đúng tên bạn, chữ ký giống hệt."} ${k.gag()}`,
          [C("Trả thay người kia", { money: -0.4, flags: ["x40_tra_thay"] }, "Mất tiền, giữ được hòa khí giữa hai người"),
           C("Không trả, khóa tài khoản lại", { rel: -2, flags: ["x40_khong_tra"] }, "Giữ được tiền, bà chủ tiệm cầm đồ không quên"),
           C("Viết hợp đồng chia nợ với người kia", { counters: { x40_thu: 1 }, flags: ["x40_hop_dong"] }, "Ký với chính mình, kỳ lạ nhưng công bằng", { tier: "sovereign" })]),
        card("x40_day_thuc_trang", "Thức trắng để canh ngày đó", (c, k) => `Năm nay bạn quyết định thức trắng đêm trước ngày đó để bắt quả tang lúc đổi người. Bạn pha ba ấm trà và đặt điện thoại quay phim. ${k.gag()}`,
          [C("Đặt máy quay trong phòng", { money: -0.05, flags: ["x40_quay_phim"] }, "Có thể nhìn thấy người kia, có thể không muốn thấy"),
           C("Thôi, đi ngủ đúng giờ", { happy: 2, flags: ["x40_buong"] }, "Để người kia có ngày của mình")]),
      ],
      /* chung_ket */
      [
        card("x40_ket", "Lá thư cuối từ người kia", (c, k) => `Năm cuối, lá thư dài hơn mọi năm. Người kia viết rằng ${noOr(c, k)} của bạn, người kia đã trả một nửa, phần còn lại để bạn tự quyết. ${n(c, "x40_thu") >= 3 ? "Cuối thư có một câu: \"Mình nghĩ mình là phần của bạn biết chơi.\"" : "Cuối thư có một câu: \"Mình không biết bạn có muốn gặp mình không.\""} ${k.gag()}`,
          (c) => pick(
            pathOpen("writer", c.age) ? ending(L40_THU, "In thư từ của hai người thành sách", "Đời hai người thành một cuốn sách") : undefined,
            !c.married ? ending(L40_CUOI, "Cưới người mà người kia đã quen", "Một tình yêu bắt đầu từ ngày bạn vắng mặt") : undefined,
            ending(L40_TRA, "Trả nốt món nợ của người kia", "Mất tiền, được yên"),
            ending(L40_DOI, "Chuyển đến căn hộ người kia đã chọn", "Sống theo lựa chọn của một người lạ quen thuộc"))),
      ],
    ],
  }));

export const ABS_31: WeirdBranch[] = [X31, X32, X33, X34, X35, X36, X37, X38, X39, X40];
