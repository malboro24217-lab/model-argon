/**
 * Nhánh kỳ dị X21–X30 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 *
 * Mỗi nhánh: cửa mọc từ đời người chơi (`when`), một mùa ngắn 8 thẻ chia 2-2-1-2-1, một gag 4 dòng gọi ở mở màn,
 * khởi động, đáy và chung kết. Vết "người" và "đồ" trả ở cú lật, vết "nợ" ở chung kết. Thẻ sau đọc cờ / bộ đếm
 * của thẻ trước (tiền tố x21_…x30_). Chung kết chọn landing theo tuổi lúc chung kết (nghề chỉ mở khi tuổi
 * ≤ ages[1] + 5 của con đường đó) và theo những gì đã chọn trong mùa.
 */
import type { Choice, FactContext } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import type { Landing } from "../Season.ts";
import { C, cap, card, ending, land, migrateOk, noOr, pathOpen, season, weird } from "../kit.ts";

type Names = (id: string) => string;

/** Tên NPC theo id, hoặc chữ dự phòng khi không có người / host chưa có tên. */
const nameOr = (N: Names, id: string | undefined, d: string): string => {
  if (!id) return d;
  const v = N(id);
  return !v || v === id || v === "ai đó" ? d : v;
};
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/**
 * Lựa chọn chung kết cưới một người có tên: thay "marry" bằng "marry:<tên>" (host đặt tên bạn đời theo tên này).
 * Không có tên thì giữ nguyên effects của landing. Landing cưới có thêm tiền ≥ 1 năm nên vẫn bền khi đổi custom.
 */
const wed = (l: Landing, label: string, hint: string, name: string | null): Choice => {
  if (!name) return ending(l, label, hint);
  const clean = name.replace(/[|:]/g, "").trim();
  if (!clean) return ending(l, label, hint);
  const custom = (l.effects.custom ?? "").split("|").map((p) => (p === "marry" ? `marry:${clean}` : p)).join("|");
  return C(label, { ...l.effects, custom }, hint);
};

/* ======================================================================= X21 Vụ án cây cau */

/** Nước có cây cau trong vườn nhà. */
const CAU_COUNTRIES = new Set(["VN", "IN", "PH", "ID", "TH", "MM", "KH", "LA", "BD", "LK", "MY", "TW", "PG"]);
const nb21 = (c: FactContext, N: Names): string => nameOr(N, c.cast.neighbor, "người hàng xóm");

const L21_THANG = land("x21_thang", "Tòa xử bạn thắng: cây cau là của bạn, kể cả phần ngọn đang nằm trong phòng khách nhà bên. Bên kia trả lại toàn bộ án phí bao năm qua.", { money: 2, happy: 6, flags: ["x21_chu_cay_cau"] });
const L21_THUA = land("x21_thua", "Bạn thua kiện: trả án phí, xây lại bức tường cho nhà bên, và nhà bên được hái cau vĩnh viễn.", { money: -2, happy: -6, flags: ["x21_thua_cay_cau"] });
const L21_THONG_GIA = land("x21_thong_gia", "Con bạn và con nhà bên cưới nhau dưới gốc cau. Lỗ thủng trên tường được nới thành cổng chung, hai mảnh vườn gộp lại và lên giá gấp đôi.", { money: 1, rel: 8, happy: 6, flags: ["x21_thong_gia"] });
const L21_CUOI = land("x21_cuoi", "Bạn cưới luôn người nhà bên kia bức tường. Hồ sơ vụ án được đóng lại, vì nguyên đơn và bị đơn giờ ăn chung một nồi cơm.", { custom: "marry", happy: 8 });
const L21_BAN = land("x21_ban_nha", "Bạn khóa cổng vườn, chuyển lên thành phố, để cây cau lại cho tòa tự xử. Nghe nói đến giờ vụ án vẫn chưa xong.", { custom: "move_city", money: -0.3 });

const X21 = weird("X21", "abs", ["dat", "luat", "ky"],
  (c) => CAU_COUNTRIES.has(c.country) && !!c.cast.neighbor && c.age >= 25 && c.age <= 60 &&
    (c.owns.has("land") || c.flags.has("orchard") || (c.home_owner && (c.flags.has("rural") || c.farmer))) && (c.opinion[c.cast.neighbor] ?? 0) < 0.3,
  () => "Ra tòa giành lại cây cau",
  (s, c, N) => ({
    title: "Cây cau đi xuyên tường",
    text: `Đêm qua cây cau trong vườn nhà bạn mọc nghiêng, đâm thủng bức tường chung và thò ngọn vào phòng khách nhà ${nb21(c, N)}. Sáng ra, buồng cau treo lủng lẳng ngay trên mâm cơm nhà họ. ${cap(nb21(c, N))} sang gõ cửa, tay cầm tờ đơn kiện: "Cau nằm trong nhà tôi thì là cau của tôi."`,
  }),
  season({
    id: "w_X21", vn: "Vụ án cây cau", color: "#c98a2e", years: [9, 12], weird: "abs",
    rules: { income: 0.9, yearly: { money: -0.03 }, flags: ["w_vu_an_cay_cau"] },
    reset: { cast: [{ key: "luat_su", role: "mentor", label: "ông luật sư tóc bạc" }, { key: "tham_phan", role: "official", label: "bà thẩm phán đeo kính" }] },
    gag: { key: "ngon_cau", lines: [
      "Ngọn cau nhích thêm một gang tay về phía bếp nhà bên. Không ai thấy nó nhích, nhưng sáng nào cũng có thêm một quả rụng vào nồi cơm.",
      "Ngọn cau giờ đã tới phòng ngủ nhà bên. Người hàng xóm phải mắc màn quanh buồng cau mới ngủ được.",
      "Ngọn cau thò qua cửa sổ phía bên kia, sang tới nhà thứ ba. Nhà thứ ba cũng nộp đơn.",
      "Cây cau ra buồng mới đúng hôm tòa họp. Thư ký phiên tòa xin một quả mang về.",
    ] },
    landings: [L21_THANG, L21_THUA, L21_THONG_GIA, L21_CUOI, L21_BAN],
    beats: [
      [
        card("x21_mo_don", "Tờ đơn dày ba đốt ngón tay", (c, k) => `${cap(nb21(c, k.N))} kiện bạn ra tòa vì ngọn cau đã nằm hẳn trong phòng khách nhà họ. Đơn dày ba đốt ngón tay, kèm ảnh chụp buồng cau treo trên mâm cơm. ${k.gag()}`,
          [C("Thuê luật sư cho đàng hoàng", { money: -0.2, flags: ["x21_thue_ls"] }, "Có người cãi giúp, tiền đi trước"),
           C("Tự đọc luật, tự cãi", { know: 3, counters: { x21_ly: 1 }, flags: ["x21_tu_cai"] }, "Rẻ, nhưng thức trắng nhiều đêm"),
           C("Cưa ngọn cau trả lại cho họ", { flags: ["x21_cua_ngon"], happy: -2 }, "Mất ngọn cau, chưa chắc hết kiện")]),
        card("x21_mo_tuong", "Lỗ thủng trên bức tường chung", (c) => `Chỗ thân cau xuyên qua, bức tường giữa hai nhà thủng một lỗ to bằng cái mâm. Bữa tối nào hai nhà cũng nhìn thấy nhau ăn gì. ${c.flags.has("x21_cua_ngon") ? "Ngọn đã cưa mà lỗ vẫn còn, nhà bên còn kiện thêm tội cưa cau." : "Ngọn cau vẫn đung đưa trên mâm cơm nhà bên."}`,
          [C("Trát xi măng bịt kín", { money: -0.05, flags: ["x21_bit_tuong"], counters: { x21_ly: -1 } }, "Kín đáo, nhưng tòa coi là phá hiện trường"),
           C("Treo rèm hai bên, ai ăn nhà nấy", { flags: ["x21_rem"], rel: 2, counters: { x21_hoa: 1 } }, "Giữ hòa khí, nghe hết chuyện nhà bên")]),
      ],
      [
        card("x21_kd_phien_dau", "Phiên tòa đầu tiên", (c, k) => `Phiên tòa đầu tiên kéo dài sáu tiếng chỉ để trả lời một câu: cây thuộc về chỗ gốc mọc hay chỗ ngọn nằm. ${cap(k.npc("tham_phan"))} hoãn phiên để "đi xem cây tận mắt". ${c.flags.has("x21_thue_ls") ? `${cap(k.npc("luat_su"))} gửi thêm hóa đơn tiền đi lại.` : `${cap(k.npc("luat_su"))} ngồi hàng ghế sau, dúi danh thiếp cho bạn lúc giải lao.`} ${k.gag()}`,
          [C("Thuê người đo rễ cau", { money: -0.1, counters: { x21_ly: 1 }, flags: ["x21_do_re"] }, "Có bằng chứng khoa học, tốn tiền"),
           C("Mang cả buồng cau ra làm tang vật", { flags: ["x21_tang_vat"], counters: { x21_ly: 1 }, happy: 2 }, "Tòa nhớ mặt bạn, theo cả hai nghĩa"),
           C("Xin hoãn để hòa giải", { flags: ["x21_xin_hoa"], rel: 2, counters: { x21_hoa: 1 } }, "Thêm thời gian, thêm năm kiện")]),
        card("x21_kd_phong_vien", "Máy quay trước cổng", () => "Vụ án cây cau lên báo. Sáng nào cũng có người đứng trước cổng chụp ảnh ngọn cau, còn nhà bên bắt đầu bán vé xem từ phía phòng khách. Cả xóm chia làm hai phe: phe gốc và phe ngọn.",
          [C("Lên truyền hình kể chuyện", { flags: ["x21_len_bao", "fame_cay_cau"], counters: { x21_ly: -1 }, happy: 3 }, "Được thương cảm, lời nói bị cắt ghép"),
           C("Bán cau với nhãn Cau Vụ Án", { money: 0.15, flags: ["x21_ban_cau"] }, "Có tiền án phí, tòa không vui"),
           C("Đóng cổng, không tiếp ai", { flags: ["x21_dong_cong"], counters: { x21_ly: 1 } }, "Hồ sơ sạch, mang tiếng khó gần")]),
      ],
      [
        card("x21_cl_anh_cu", "Tấm ảnh hai ông bố", (c, k) => `Một tối giữa vụ kiện, ${k.scar("do") ? `lúc ngồi nhớ lại chuyện ${k.scar("do")}` : "lúc dọn nhà kho"}, bạn lục ra một tấm ảnh: hai ông bố của hai nhà cùng trồng cây cau, cười toe, khi nó còn bằng ngón tay. ${cap(k.scar("nguoi") || "một người quen cũ")} xem ảnh và nói chắc nịch: chính bố nhà bên đã chọn chỗ trồng. Tấm ảnh này có thể thắng kiện, hoặc làm hai nhà nhớ ra họ từng thân nhau.`,
          [C("Nộp ảnh cho tòa", { counters: { x21_ly: 2 }, flags: ["x21_nop_anh"] }, "Gần như thắng, nhà bên mất mặt"),
           C("Mang ảnh sang biếu nhà bên", { flags: ["x21_tang_anh"], rel: 4, counters: { x21_hoa: 2 } }, "Mất bằng chứng, được một buổi trà"),
           C("Cất ảnh đi, chưa quyết", { flags: ["x21_cat_anh"] }, "Giữ con bài, giữ cả nỗi day dứt")]),
      ],
      [
        card("x21_day_an_phi", "Hồ sơ nặng bốn ký", (c, k) => `Hồ sơ vụ án giờ nặng bốn ký, ${c.flags.has("x21_thue_ls") ? `${k.npc("luat_su")} đã gửi hóa đơn thứ ba mươi` : "bạn thuộc luật đất đai hơn cả người làm ở sở đất đai"}. Tiền án phí mỗi năm ăn mất một vụ thu hoạch. ${k.gag()}`,
          [C("Vay tiền theo kiện đến cùng", { custom: "borrow:0.4", counters: { x21_ly: 1 }, flags: ["x21_vay_kien"] }, "Giữ thế, gánh thêm nợ"),
           C("Bán bớt một góc vườn", { money: 0.3, flags: ["x21_ban_goc_vuon"], happy: -3 }, "Có tiền ngay, vườn nhỏ lại"),
           C("Rủ nhà bên cùng xin hoãn", { counters: { x21_hoa: 1 }, flags: ["x21_cung_hoan"] }, "Bớt tiền, chuyện kéo dài thêm")]),
        card("x21_day_bao", "Đêm bão quật ngọn cau", (c) => `Một đêm bão, cây cau quật qua quật lại giữa hai nhà như cái cần gạt nước. ${c.flags.has("x21_rem") ? "Hai tấm rèm bay mất, hai nhà" : "Hai nhà"} phải cùng ôm thân cau đến sáng cho nó khỏi gãy, vì gãy thì mất tang vật. Gần sáng, đứa con nhà bên đưa cho bạn một ca trà nóng.`,
          [C("Cùng nhà bên chống cây lại", { counters: { x21_hoa: 2 }, flags: ["x21_chong_cay"], health: -2 }, "Ướt sũng, ấm lòng"),
           C("Chụp ảnh thân cau nghiêng sang nhà bên", { counters: { x21_ly: 1 }, flags: ["x21_anh_bao"] }, "Thêm chứng cứ, mất ca trà")]),
      ],
      [
        card("x21_ket", "Phán quyết dưới gốc cau", (c, k) => {
          const strong = cnt(c, "x21_ly") >= 3 || c.reputation >= 70;
          return `Phiên xử cuối mở ngay dưới gốc cau, vì ${k.npc("tham_phan")} muốn cây được có mặt. ${strong ? "Hồ sơ của bạn dày và chắc." : "Hồ sơ của bạn mỏng hơn hồ sơ bên kia."} ${cnt(c, "x21_hoa") >= 2 ? `Nhà bên mang theo ${c.country === "VN" ? "một đĩa trầu cau" : "một giỏ quà cưới"}, không rõ để mời ai.` : "Nhà bên mang theo luật sư thứ hai."} Còn ${k.scar("no") || (c.flags.has("x21_vay_kien") ? "món nợ bạn vay để theo kiện" : "tập hóa đơn án phí")} vẫn nằm trong cặp, chờ phán quyết để biết lấy gì mà trả. ${k.gag()}`;
        }, (c) => {
          const strong = cnt(c, "x21_ly") >= 3 || c.reputation >= 70;
          const out: Choice[] = [strong ? ending(L21_THANG, "Đòi phán quyết, lấy lại cây cau", "Thắng kiện, mất một người hàng xóm")
            : ending(L21_THUA, "Nhận phán quyết, trả án phí", "Thua, nhưng hết kiện")];
          if (c.age >= 45 && c.kids_alive > c.kids_school) out.push(ending(L21_THONG_GIA, "Nhận lễ, làm thông gia với nhà bên", "Hết kiện, thêm một nhà thông gia"));
          else if (!c.married) out.push(ending(L21_CUOI, "Cưới luôn người bên kia bức tường", "Hết kiện, thêm một bạn đời"));
          else out.push(ending(L21_BAN, "Dọn lên phố, để cây cau cho tòa xử", "Thoát kiện, bỏ lại khu vườn"));
          if (strong) out.push(ending(L21_THUA, "Chặt cây cau, xin thôi kiện", "Hết chuyện, mất cả cây lẫn tiền"));
          return out;
        }),
      ],
    ],
  }));

/* ======================================================================= X22 Cụ già 35 tuổi (nâng từ a03) */

const cu22 = (c: FactContext): string => (c.sex === "F" ? "bà" : "ông");
/** Đã thật sự lĩnh lương hưu theo tuổi trên giấy (nhận sổ hưu, hay nhận mà vẫn lén đi làm): hint nói "lương hưu đang lĩnh", không thì "suất hưu đang chờ". */
const huu22 = (c: FactContext): boolean => c.flags.has("x22_nhan_huu") || c.flags.has("x22_hai_mat");

const L22_HUU = land("x22_huu_som", "Bạn chính thức về hưu, sớm hơn bạn bè cùng lứa mấy chục năm. Lương hưu ít nhưng đều, cộng một khoản truy lĩnh mấy năm bị giữ lại.", { custom: "retire", money: 1.5, happy: 5 });
/** Đã nhận sổ hưu từ nhịp đầu (x22_nhan_huu, đã retire một lần): chung kết không retire lần nữa (host retire không lũy đẳng). */
const L22_O_HUU = land("x22_o_huu", "Bạn giữ hẳn tuổi trên giấy, sống tiếp đời hưu trí đã bắt đầu từ hôm nhận sổ, cộng một khoản truy lĩnh mấy năm bị giữ lại.", { money: 1.5, happy: 5 });
const L22_MANG = land("x22_danh_mang", "Kênh của cụ già trẻ nhất cả nước có hàng triệu người theo dõi. Bạn sống bằng nghề làm cụ trên mạng.", { custom: "become:influencer", money: 1 });
// gần nhất: "Danh" khi đã quá tuổi làm người có ảnh hưởng trên mạng
const L22_SACH = land("x22_hoi_ky", "Cuốn hồi ký Tôi Già Trước Ba Mươi Năm bán chạy, nhà xuất bản đặt bạn viết tiếp cuốn thứ hai.", { custom: "become:writer", money: 1 });
const L22_TRA = land("x22_tuoi_that", "Bạn lấy lại tuổi thật, đi làm lại từ đầu, trả lại mọi khoản đã nhận theo tuổi trên giấy cùng phí sửa hồ sơ tồn đọng bao năm.", { money: -1.5, happy: 3, flags: ["x22_tuoi_that"] });

const X22 = weird("X22", "abs", ["luat", "ky", "danh"],
  (c) => c.age >= 25 && c.age <= 45 && c.has_job &&
    (c.flags.has("tp_a03_seen") || (!!c.cast.official && c.pressure.luat + c.pressure.ky >= 6)),
  (s, c) => `Nhận luôn tuổi trên giấy, sống làm ${cu22(c)} cụ`,
  (s, c) => ({
    title: "Già thêm ba mươi tuổi sau một đêm",
    text: `${c.flags.has("tp_a03_seen") ? "Lần trước giấy tờ chỉ cộng cho bạn mười tuổi. Lần này hệ thống sửa lỗi bằng cách cộng thêm hai mươi nữa." : "Hệ thống hộ tịch vừa nâng cấp, và bạn là lỗi đầu tiên của nó."} Trên giấy tờ mới, bạn sinh trước mình ba mươi năm, đủ tuổi nghỉ hưu từ hôm qua. Ảnh vẫn là ảnh bạn, chỉ có ai đó vẽ thêm bộ râu bằng bút bi. "Máy không sai bao giờ, chỉ có người sai," người cán bộ ở quầy nói, rồi đóng dấu.`,
  }),
  season({
    id: "w_X22", vn: "Cụ già 35 tuổi", color: "#d4a24c", years: [6, 10], weird: "abs",
    rules: { income: 0.7, yearly: { happy: 1 }, flags: ["w_cu_gia_tren_giay"] },
    reset: { cast: [{ key: "chu_hoi", role: "neighbor", label: "cụ chủ tịch hội người cao tuổi" }, { key: "can_bo", role: "official", label: "cô cán bộ hộ tịch mới" }] },
    gag: { key: "nhuong_ghe", lines: [
      "Lên xe buýt, một cậu học sinh đứng dậy nhường ghế và gọi bạn là cụ. Bạn ngồi, vì đứng thì bị nhắc.",
      "Ở chợ, người bán rau tự động bớt giá cho người cao tuổi, rồi dặn bạn đi chậm thôi kẻo ngã.",
      "Ngân hàng gửi thiệp chúc sống lâu. Trong thiệp kẹp một tờ quảng cáo dịch vụ hậu sự trả góp.",
      "Hội người cao tuổi tặng bạn cây gậy thứ ba. Bạn dùng hai cây kia để phơi quần áo.",
    ] },
    landings: [L22_HUU, L22_O_HUU, L22_MANG, L22_SACH, L22_TRA],
    beats: [
      [
        card("x22_mo_so_huu", "Sổ hưu đến trước sổ lương", (c, k) => `Phòng nhân sự gửi bạn một bó hoa và quyết định nghỉ hưu, vì "luật là luật". Cùng ngày, bưu tá mang tới sổ lương hưu đầu tiên. ${k.gag()}`,
          [C("Nhận sổ hưu, về nhà nghỉ", { money: 0.2, custom: "retire", counters: { x22_cu: 1 }, flags: ["x22_nhan_huu"] }, "Có lương hưu, thôi đi làm"),
           C("Đi khiếu nại, giữ việc", { money: -0.1, flags: ["x22_khieu_nai"], counters: { x22_tre: 1 } }, "Giữ việc, chuyện giấy tờ kéo dài"),
           C("Nhận hưu mà vẫn lén đi làm", { money: 0.3, flags: ["x22_hai_mat"], secret: { tag: "FORGED_PAPERS", severity: 0.25, fuse_years: [3, 8], note: "lĩnh lương hưu theo giấy tờ ghi sai tuổi mà vẫn đi làm" } }, "Hai nguồn tiền, một quả bom chờ nổ")]),
        card("x22_mo_hoi", "Hội người cao tuổi gõ cửa", (c, k) => `${cap(k.npc("chu_hoi"))}, chín mươi hai tuổi, đến tận nhà mời bạn vào hội vì "hội đang thiếu người trẻ". Hội có ba mươi thành viên, một sân bóng chuyền hơi và một quỹ hiếu hỷ dày hơn quỹ của nhiều công ty.`,
          [C("Vào hội, làm thành viên trẻ nhất", { flags: ["x22_vao_hoi"], rel: 3, counters: { x22_cu: 1 } }, "Có ba mươi ông bà nuôi, mất buổi tối"),
           C("Lịch sự từ chối", { flags: ["x22_tu_choi_hoi"], counters: { x22_tre: 1 } }, "Giữ tuổi trẻ, mất chỗ dựa")]),
      ],
      [
        card("x22_kd_ky_tich", "Kỳ tích y học", (c, k) => `Đi khám định kỳ cho người cao tuổi, bác sĩ đọc kết quả rồi gọi cả khoa tới xem: tim của một cụ già mà đập như tim thanh niên. ${c.flags.has("x22_vao_hoi") ? `${cap(k.npc("chu_hoi"))} đi theo, khoe với cả phòng chờ.` : "Phòng chờ xôn xao."} ${k.gag()}`,
          [C("Cho bệnh viện nghiên cứu", { money: 0.15, flags: ["x22_ky_tich"], counters: { x22_danh: 1 } }, "Có tiền và tiếng, mất mười hai lần lấy máu"),
           C("Xin kết quả rồi về", { flags: ["x22_giau_benh_an"], happy: 1 }, "Yên thân, bác sĩ vẫn gọi điện mỗi tuần")]),
        card("x22_kd_chong_day", "Cụ già chống đẩy", (c) => `Ai đó quay được cảnh bạn chống đẩy năm mươi cái ở công viên, đăng lên với dòng chữ "Cụ ${c.age + 30} tuổi khỏe hơn cả lớp tôi". Đoạn phim có ba triệu lượt xem trong một đêm.`,
          [C("Mở kênh tập thể dục cho người già", { flags: ["x22_kenh", "viral_cu_gia"], counters: { x22_danh: 2, x22_cu: 1 } }, "Nổi tiếng, phải già cho đúng vai"),
           C("Nhờ người gỡ đoạn phim", { flags: ["x22_go_phim"], money: -0.05, counters: { x22_tre: 1 } }, "Đỡ ồn, mất cơ hội"),
           C("Lên phim tuyên bố mình chưa già", { flags: ["x22_tuyen_bo"], counters: { x22_tre: 2 } }, "Nói thật, không ai tin")]),
      ],
      [
        card("x22_cl_nhan_chung", "Người duy nhất biết tuổi thật", (c, k) => `${cap(k.scar("nguoi") || "một người quen từ thuở nhỏ")} là người duy nhất có thể làm chứng bạn chưa già, và chuyện ${k.scar("do") || "một món đồ cũ trong nhà"} là bằng chứng duy nhất còn khớp với năm bạn sinh thật. Nhưng nếu lấy lại tuổi thật, bạn mất ${c.flags.has("x22_nhan_huu") || c.flags.has("x22_hai_mat") ? "lương hưu đang lĩnh" : "suất lương hưu đang chờ duyệt"}, ${c.flags.has("x22_kenh") ? "mất luôn kênh của cụ già khỏe nhất mạng" : "mất luôn chỗ trong hội người cao tuổi"}. ${cap(k.npc("can_bo"))} nói chỉ cần một chữ ký là xong.`,
          (c) => [C("Mời người đó ra làm chứng", { flags: ["x22_lam_chung"], counters: { x22_tre: 2 } }, "Lấy lại tuổi, mất mọi thứ của tuổi già"),
           C("Nhờ người đó giữ im lặng", { flags: ["x22_giu_im"], counters: { x22_cu: 2 }, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 6], note: "nhờ người quen giấu tuổi thật để giữ lương hưu" } },
             huu22(c) ? "Giữ lương hưu, nợ người đó một bí mật" : "Giữ suất hưu đang chờ, nợ người đó một bí mật"),
           C("Đem chuyện ra hỏi ý cả hội", { flags: ["x22_hoi_ca_hoi"], rel: 2 }, "Ba mươi ý kiến, không ai nghe rõ")]),
      ],
      [
        card("x22_day_kiem_tra", "Đoàn kiểm tra tuổi thọ", (c, k) => `Đoàn kiểm tra đến xác minh những người "trẻ bất thường so với giấy tờ". ${c.flags.has("x22_giu_im") || c.flags.has("x22_hai_mat") ? "Họ đã nghe phong thanh chuyện của bạn." : "Tên bạn đứng đầu danh sách."} Bài kiểm tra: hát trọn ba bài hát thịnh hành từ năm mươi năm trước. ${k.gag()}`,
          (c) => [C("Thức ba đêm học thuộc bài hát cũ", { know: 2, health: -2, counters: { x22_cu: 1 }, flags: ["x22_hoc_bai_cu"] }, "Qua kiểm tra, ám ảnh giai điệu cả đời"),
           C("Khai thật với đoàn", { money: -0.3, flags: ["x22_khai_that"], counters: { x22_tre: 2 } }, huu22(c) ? "Mất khoản đã lĩnh, ngủ yên" : "Nộp phạt sửa hồ sơ, ngủ yên")]),
        card("x22_day_chia_cua", "Họ hàng xin chia của", (c) => `${c.kids_alive > 0 ? "Con cái" : "Họ hàng"} nghe tin bạn đã "già" liền họp gia đình, đề nghị chia tài sản luôn cho gọn. Có người mang sẵn bút và một cái cân.`,
          [C("Chia trước một phần cho êm", { money: -0.3, rel: 4, flags: ["x22_chia_som"] }, "Cả nhà vui, ví mỏng"),
           C("Tuyên bố mình còn sống lâu", { rel: -3, flags: ["x22_khong_chia"], counters: { x22_tre: 1 } }, "Giữ của, mất vài lời chúc")]),
      ],
      [
        card("x22_ket", (c) => (c.country === "VN" ? "Lễ mừng thọ của người chưa già" : "Tiệc sinh nhật của người chưa già"), (c, k) => `Hội người cao tuổi tổ chức ${c.country === "VN" ? "mừng thọ" : "tiệc sinh nhật"} cho bạn, bánh kem cắm ${c.age + 30} cây nến. ${cap(k.npc("can_bo"))} mang tới hai tờ giấy: một tờ xác nhận tuổi trên giấy, một tờ trả lại tuổi thật. Còn ${noOr(c, k)} thì không phân biệt tuổi nào, vẫn đòi đúng hạn. ${cnt(c, "x22_cu") >= cnt(c, "x22_tre") ? "Bạn đã quen làm cụ." : "Bạn vẫn thấy mình chưa già."} ${k.gag()}`,
          (c) => {
            const out: Choice[] = [c.flags.has("x22_nhan_huu") ? ending(L22_O_HUU, "Nhận tuổi trên giấy, ở hẳn đời hưu", "Lương hưu đều đặn, thêm khoản truy lĩnh")
              : ending(L22_HUU, "Nhận tuổi trên giấy, về hưu hẳn", "Lương hưu đều đặn, đời chậm lại sớm")];
            if (pathOpen("influencer", c.age)) out.push(ending(L22_MANG, "Làm cụ già nổi tiếng trên mạng", "Nổi tiếng, phải già trước ống kính"));
            else if (pathOpen("writer", c.age)) out.push(ending(L22_SACH, "Viết hồi ký người già trước tuổi", huu22(c) ? "Có danh, có sách, hết tiền hưu" : "Có danh, có sách, thôi chờ suất hưu"));
            out.push(ending(L22_TRA, "Ký tờ trả lại tuổi thật", huu22(c) ? "Trẻ lại, trả mọi khoản theo tuổi trên giấy" : "Trẻ lại, trả phí sửa hồ sơ bao năm"));
            return out;
          }),
      ],
    ],
  }));

/* ======================================================================= X23 Lãnh tụ giấc ngủ (nâng từ a23) */

const L23_CT = land("x23_chinh_tri", "Bạn trúng cử với khẩu hiệu một chữ: Nghỉ. Văn phòng của bạn là nơi duy nhất trong tòa nhà có giường.", { custom: "become:politician", happy: 4 });
// gần nhất: "diễn giả" (không có con đường riêng) → nhà hoạt động xã hội
const L23_DG = land("x23_dien_gia", "Bạn đi khắp nơi nói về quyền được nghỉ, buổi nào cũng kết thúc bằng mười lăm phút cả khán phòng ngủ chung.", { custom: "become:activist", money: 0.5 });
const L23_GOI = land("x23_ban_goi", "Bạn bán bản quyền chiếc gối của phong trào cho một xưởng may. Mỗi chiếc gối bán ra có in mặt bạn đang ngủ.", { money: 2, happy: 3 });
const L23_GIAI_TAN = land("x23_giai_tan", "Bạn giải tán phong trào, trả lại chức, chuyển sang làm bán thời gian để ngủ trưa một mình. Thu nhập giảm, giấc ngủ thì không.", { income_mult: 0.8, happy: 6 });

const X23 = weird("X23", "abs", ["danh", "ky"],
  (c) => c.age >= 22 && c.age <= 58 && c.has_job &&
    (c.flags.has("tp_a23_seen") || ((c.rat_race || c.bandwidth_locked) && c.pressure.ky >= 3)),
  () => "Đứng đầu phong trào ngủ trưa toàn quốc",
  (s, c) => ({
    title: "Phong trào ngủ trưa toàn quốc",
    text: `${c.flags.has("tp_a23_seen") ? "Hội ngủ trưa từng bầu bạn làm chủ tịch vì bạn vắng cả ba buổi họp." : `Một hội ngủ trưa nhỏ ở ${s.noi || "khu bạn sống"} bầu bạn làm chủ tịch vì bạn ngủ gật ngay buổi họp đầu.`} Sáng nay, tấm ảnh bạn gục đầu ngủ trên bàn làm việc lên trang nhất, dưới hàng chữ: Người Dám Nghỉ. Ba triệu người đăng ký theo dõi trước giờ ăn trưa. "Chủ tịch ơi, mười hai giờ rồi, cả nước đang chờ lệnh," phó chủ tịch hội gọi tới, giọng tỉnh như sáo vì chưa ngủ trưa lần nào.`,
  }),
  season({
    id: "w_X23", vn: "Lãnh tụ giấc ngủ", color: "#e0b040", years: [6, 10], weird: "abs",
    rules: { income: 0.85, flags: ["w_phong_trao_ngu_trua"] },
    reset: { cast: [{ key: "pho_ct", role: "partner", label: "phó chủ tịch hội, người chưa ngủ trưa lần nào" }, { key: "ong_ca_phe", role: "rival", label: "ông chủ chuỗi quán cà phê đặc" }] },
    gag: { key: "ngu_gat", lines: [
      "Bạn vừa cầm micro định nói thì ngủ gật. Hội trường vỗ tay, vì tưởng đó là bài phát biểu.",
      "Lần này bạn ngủ gật giữa câu thứ hai. Báo chí gọi đó là khoảng lặng có chủ đích.",
      "Bạn ngủ gật trên sóng truyền hình trực tiếp. Lượt xem cao nhất năm.",
      "Bạn ngủ gật đúng lúc cần nói câu quan trọng nhất đời. Ai cũng hiểu ý bạn.",
    ] },
    landings: [L23_CT, L23_DG, L23_GOI, L23_GIAI_TAN],
    beats: [
      [
        card("x23_mo_tuyen_ngon", "Bản tuyên ngôn mười một chữ", (c, k) => `Phong trào cần một bản tuyên ngôn trước giờ ngủ trưa mai. ${cap(k.npc("pho_ct"))} đã thức trắng soạn sẵn ba mươi trang, nhưng báo chỉ đăng được mười một chữ. ${k.gag()}`,
          [C("Ai mệt thì được nghỉ, không ai bị trách", { flags: ["x23_on_hoa"], counters: { x23_dan: 1 } }, "Dễ nghe, ít người sợ"),
           C("Ngủ trưa là quyền, không phải ân huệ", { flags: ["x23_cung_ran"], counters: { x23_dan: 2 }, pressure: { danh: 1, luat: 1 } }, "Đông người theo, nhiều người ghét"),
           C("Để phó chủ tịch đăng đủ ba mươi trang", { flags: ["x23_giao_pho"], counters: { x23_dan: -1 } }, "Đỡ việc, không ai đọc hết")]),
        card("x23_mo_sep", "Sếp gọi lên phòng", () => "Sếp đặt hai tờ giấy trước mặt bạn: một là đơn xin thôi việc, một là cam kết không ngủ trưa trong giờ làm. Ngoài cửa kính, nửa phòng đang gục đầu trên bàn theo lời kêu gọi của bạn.",
          [C("Ký đơn thôi việc, đi theo phong trào", { custom: "job_lose", flags: ["x23_bo_viec"], counters: { x23_dan: 2 } }, "Toàn tâm cho phong trào, mất lương"),
           C("Đề nghị cả công ty có giờ nghỉ", { flags: ["x23_thuong_luong"], counters: { x23_dan: 1 }, rel: 2 }, "Có thể thắng, có thể bị trừ lương"),
           C("Ký cam kết, ngủ lén trong kho", { flags: ["x23_ngu_len"], happy: -2, counters: { x23_dan: -1 } }, "Giữ việc, phong trào thấy bạn hèn")]),
      ],
      [
        card("x23_kd_cuoc_nam", "Cuộc nằm lớn nhất lịch sử", (c, k) => `Phong trào kêu gọi một cuộc nằm trưa tập thể ở quảng trường lớn nhất ${k.noi}. Năm vạn người mang thảm đến, nằm im bốn mươi phút, chỉ nghe tiếng ngáy và tiếng chim. ${k.gag()}`,
          [C("Nằm hàng đầu, ngay trước ống kính", { flags: ["x23_nam_dau", "noi_tieng_ngu_trua"], counters: { x23_dan: 2 } }, "Thành biểu tượng, thành mục tiêu"),
           C("Xin phép đàng hoàng, dời vào công viên", { flags: ["x23_dung_phep"], counters: { x23_dan: 1 }, rel: 2 }, "Êm thấm, báo chê nhạt"),
           C("Ở nhà ngủ thật", { flags: ["x23_vang_mat"], health: 3, counters: { x23_dan: -1 } }, "Khỏe người, phong trào hỏi lãnh tụ đâu")]),
        card("x23_kd_ca_phe", "Phong bì của ông vua cà phê", (c, k) => `${cap(k.npc("ong_ca_phe"))} hẹn bạn ở quán đông nhất của ông. Doanh thu buổi trưa của cả chuỗi giảm một nửa từ khi có phong trào. Ông đẩy sang một phong bì: "Chỉ cần nói một câu: ngủ dậy nhớ uống cà phê."`,
          [C("Nhận phong bì, nói đúng một câu", { money: 0.4, flags: ["x23_ban_minh"], counters: { x23_dan: -1 } }, "Có tiền, phong trào có vết"),
           C("Từ chối, kêu gọi uống nước ấm", { flags: ["x23_chong_ca_phe"], counters: { x23_dan: 1 } }, "Giữ tiếng, thêm một kẻ thù giàu")]),
      ],
      [
        card("x23_cl_mat_ngu", "Lãnh tụ mất ngủ", (c, k) => `Mấy năm làm lãnh tụ giấc ngủ, bạn bắt đầu mất ngủ. Đêm nào cũng nhìn trần nhà đến sáng, chỉ chợp mắt được khi nghe giọng ${k.scar("nguoi") || "một người quen cũ"} qua điện thoại, hoặc khi nghĩ về ${k.scar("do") || (c.flags.has("x23_bo_viec") ? "những ngày còn đi làm bình thường" : "những ngày đi làm chưa ai biết mặt mình")}. ${cap(k.npc("pho_ct"))} đã phát hiện ra, và hỏi bạn muốn xử lý thế nào.`,
          [C("Giấu kín, ban ngày vẫn ngáp cho đúng vai", { flags: ["x23_giau_mat_ngu"], health: -4 }, "Giữ hình ảnh, mòn sức"),
           C("Thú nhận trước cả phong trào", { flags: ["x23_thu_nhan"], counters: { x23_dan: 1 }, happy: 3 }, "Mất hào quang, được thương"),
           C("Mời người đó làm người ru chính thức", { flags: ["x23_nguoi_ru"], rel: 3 }, "Ngủ ngon, báo chí bàn tán")]),
      ],
      [
        card("x23_day_chia_phe", "Phe một tiếng, phe hai tiếng", (c, k) => `Phong trào tách làm hai: phe ngủ trưa một tiếng và phe ngủ trưa hai tiếng. Hai phe họp riêng, nhưng họp nào cũng ngủ quên nên chưa bên nào thông qua được gì. ${c.flags.has("x23_ban_minh") ? "Phe hai tiếng tung ảnh bạn nhận phong bì cà phê." : "Cả hai phe đều đòi bạn chọn."} ${k.gag()}`,
          [C("Đứng về phe một tiếng", { flags: ["x23_phe_mot"], counters: { x23_dan: 1 } }, "Được dân văn phòng, mất người già"),
           C("Đứng về phe hai tiếng", { flags: ["x23_phe_hai"], counters: { x23_dan: 1 } }, "Được người già, mất dân văn phòng"),
           C("Đề xuất ai cần bao nhiêu ngủ bấy nhiêu", { flags: ["x23_theo_nhu_cau"], counters: { x23_dan: 2 }, happy: -1 }, "Ai cũng hài lòng một nửa")]),
        card("x23_day_la_phieu", "Lá phiếu in hình cái gối", (c) => `${c.country === "VN" ? "Có người gợi ý bạn ra ứng cử đại biểu, khẩu hiệu in hình cái gối." : "Một đảng nhỏ mời bạn ra tranh cử, biểu tượng là cái gối."} ${cnt(c, "x23_dan") >= 4 ? "Các cuộc thăm dò nói bạn có cơ hội thật." : "Thăm dò nói bạn được đúng số phiếu của hội ngủ trưa ban đầu."} Cùng tuần, một nơi khác mời bạn đi diễn thuyết khắp nơi, trả tiền theo buổi.`,
          (c) => [C(c.country === "VN" ? "Nhận lời ra ứng cử" : "Nhận lời ra tranh cử", { money: -0.2, flags: ["x23_ung_cu"], pressure: { danh: 2 } }, "Tốn tiền vận động, có thể có ghế"),
           C("Nhận đi diễn thuyết", { money: 0.2, flags: ["x23_di_noi"] }, "Có tiền ngay, phong trào thành buổi diễn")]),
      ],
      [
        card("x23_ket", "Giờ nghỉ trưa toàn quốc", (c, k) => `Ngày bỏ phiếu cho dự luật giờ nghỉ trưa, cả nước nín thở chờ bạn phát biểu. ${k.gag()} ${c.flags.has("x23_ung_cu") ? "Lá phiếu in hình cái gối vẫn nằm trong túi áo." : "Vé đi diễn thuyết vẫn nằm trong túi áo."} Tỉnh dậy, bạn vẫn phải quyết đời mình đi tiếp thế nào, và ${noOr(c, k)} vẫn chưa trả.`,
          (c) => {
            // politician 28–55 → mở 28–60; activist 18–60 → mở 18–65; còn lại: bán gối (tiền) và giải tán (thu nhập ×0.8)
            const career: Choice[] = [];
            if (pathOpen("politician", c.age)) career.push(ending(L23_CT, "Ra làm chính trị với khẩu hiệu Nghỉ", "Có ghế, hết giờ ngủ trưa"));
            if (pathOpen("activist", c.age)) career.push(ending(L23_DG, "Đi diễn thuyết về quyền được nghỉ", "Có tiếng, sống trên đường"));
            const rest = [ending(L23_GOI, "Bán bản quyền chiếc gối", "Có tiền, mặt bạn in trên gối"), ending(L23_GIAI_TAN, "Giải tán hội, về ngủ thật", "Bình yên, thu nhập giảm")];
            return career.length >= 2 ? [...career, rest[1]!] : [...career, ...rest];
          }),
      ],
    ],
  }));

/* ======================================================================= X24 Chúa đảo dê */

const L24_DI = land("x24_di_cu", "Bạn chuyển hẳn sang đất nước có hòn đảo, làm chúa của bốn mươi con dê và một ngọn hải đăng.", { custom: "migrate_now", money: -1, happy: 6 });
const L24_BAN = land("x24_ban_lai", "Một khu nghỉ dưỡng mua lại hòn đảo với giá gấp hai mươi lần, kèm điều kiện giữ nguyên bốn mươi con dê làm lễ tân.", { money: 3, happy: 3 });
const L24_TANG = land("x24_tang_de", "Bạn trao hòn đảo cho bầy dê, giấy tờ đầy đủ, rồi về đất liền tay trắng. Báo chí gọi đó là cuộc trao trả lãnh thổ hiền lành nhất lịch sử.", { money: -1.5, happy: 4, flags: ["x24_tang_dao"] });

const X24 = weird("X24", "abs", ["tien", "dat", "ky"],
  (c) => c.independent && c.age >= 20 && c.age <= 60 &&
    (c.lifestyle === "pho_truong" || (c.lifestyle === "thoai_mai" && c.traits.risk >= 1) || (c.counters.gamble ?? 0) >= 4),
  () => "Bay ra nhận hòn đảo lỡ tay mua trên mạng",
  () => ({
    title: "Đơn hàng giao tới: một hòn đảo",
    text: `Nửa đêm, bạn bấm mua một món giảm giá chín mươi phần trăm vì tưởng đó là cái đảo bếp cho căn bếp. Sáng ra, bưu tá giao tới giấy chủ quyền một hòn đảo thật ở bên kia đại dương, kèm chùm chìa khóa và một sợi dây dắt dê. "Hàng đã giao, không đổi trả," tin nhắn cuối cùng của người bán viết.`,
  }),
  season({
    id: "w_X24", vn: "Chúa đảo dê", color: "#d9822b", years: [6, 10], weird: "abs",
    rules: { income: 0.6, flags: ["w_chua_dao"] },
    reset: { cast: [{ key: "ong_giu_dao", role: "neighbor", label: "ông giữ đảo râu dài" }, { key: "ba_moi_gioi", role: "rival", label: "bà môi giới đảo" }] },
    gag: { key: "de_rau_bac", lines: [
      "Con dê râu bạc nhai mất góc giấy chủ quyền. Phần còn lại vẫn đủ chữ ký.",
      "Con dê râu bạc nhai luôn tấm bản đồ đảo. Giờ chỉ nó biết đường ra bến.",
      "Con dê râu bạc ăn lá thư của người muốn mua đảo, chừa lại đúng con số.",
      "Con dê râu bạc nhai nốt tờ lịch. Trên đảo không ai còn biết hôm nay thứ mấy, kể cả bạn.",
    ] },
    landings: [L24_DI, L24_BAN, L24_TANG],
    beats: [
      [
        card("x24_mo_ben", "Bốn mươi cư dân có sừng", (c, k) => `Chuyến tàu hàng thả bạn xuống một bến gỗ mục. ${cap(k.npc("ong_giu_dao"))} trao chùm chìa khóa rồi chỉ vào bốn mươi con dê đang đứng thành hàng: "Dân của ngài đấy." ${k.gag()}`,
          [C("Ở lại một mùa cho biết", { money: -0.2, flags: ["x24_o_lai"], counters: { x24_dao: 1 } }, "Hiểu đảo, bỏ dở việc ở đất liền"),
           C("Thuê ông giữ đảo trông giúp, về nhà", { money: -0.1, flags: ["x24_thue_giu"] }, "Giữ đời cũ, đảo sống theo ý ông ấy")]),
        card("x24_mo_luat", "Bộ luật đầu tiên của đảo", (c, k) => `Đảo cần luật. Bạn ngồi trên tảng đá cao nhất, trước bốn mươi con dê đang nhai, nghĩ xem chế độ nào hợp với một dân số không biết đọc. ${c.flags.has("x24_thue_giu") ? `${cap(k.npc("ong_giu_dao"))} gửi thư hỏi ý qua tàu hàng.` : "Tiếng sóng vỗ nghe như tiếng vỗ tay chờ."}`,
          [C("Dê ăn cỏ, người ăn cá, không ai ăn ai", { flags: ["x24_hoa_binh"], counters: { x24_long_de: 1 } }, "Yên bình, cỏ hết nhanh"),
           C("Cho dê bầu ra đại diện", { flags: ["x24_dan_chu"], counters: { x24_long_de: 2 } }, "Dê vui, bạn mất quyền quyết"),
           C("Bạn là chúa đảo, lời bạn là luật", { flags: ["x24_doc_tai"], counters: { x24_long_de: -2 } }, "Nhanh gọn, dê ghi thù")]),
      ],
      [
        card("x24_kd_khach", "Đoàn khách lạc đường", (c, k) => `${c.flags.has("x24_thue_giu") ? `${cap(k.npc("ong_giu_dao"))} gọi điện báo, bạn bay ra ngay trong đêm: một` : "Một"} chiếc thuyền du lịch lạc hướng ghé vào đảo, hai mươi khách xin ở nhờ một đêm và trả tiền rất hào phóng. Bầy dê đứng nhìn họ như nhìn quân xâm lược. ${k.gag()}`,
          [C("Mở nhà nghỉ có dê phục vụ", { money: 0.3, flags: ["x24_homestay"], counters: { x24_long_de: -1 } }, "Có tiền, dê phải đi làm"),
           C("Cho ở miễn phí một đêm rồi tiễn", { flags: ["x24_hieu_khach"], rel: 2 }, "Được tiếng tốt, không được gì khác"),
           C("Đuổi đi, giữ đảo hoang sơ", { flags: ["x24_hoang_so"], counters: { x24_long_de: 1 } }, "Dê quý bạn hơn, ví thì không")]),
        card("x24_kd_bao", "Ba tháng không có tàu", (c) => `${c.flags.has("x24_thue_giu") ? "Bạn còn đang ở lại đảo sau vụ đoàn khách lạc đường thì bão cắt đường tàu ba tháng." : "Bão cắt đường tàu ba tháng."} Gạo hết từ tuần thứ hai. ${c.flags.has("x24_doc_tai") ? "Bầy dê nhìn bạn như nhìn một ông vua hết gạo." : c.flags.has("x24_dan_chu") ? "Hội đồng dê họp khẩn và nhường bạn phần cỏ non." : "Bầy dê vẫn ăn cỏ như chưa có chuyện gì."}`,
          [C("Sống bằng sữa dê và cá", { health: 2, flags: ["x24_tu_cung"], counters: { x24_dao: 1 } }, "Gầy đi, hiểu đảo hơn"),
           C("Gọi đội cứu hộ tư nhân", { money: -0.3, flags: ["x24_cuu_ho"] }, "Về được, tốn một khoản lớn")]),
      ],
      [
        card("x24_cl_nguoi_ban", "Người đăng bán hòn đảo", (c, k) => `Chuyến tàu đầu tiên sau bão chở theo ${k.scar("nguoi") || "một người quen cũ"}. Người đó thú nhận chính mình đã đăng bán hòn đảo với giá rẻ để bạn mua, coi như trả ơn ${k.scar("do") ? `chuyện ${k.scar("do")}` : "một lần bạn giúp"} năm nào. ${cap(k.npc("ba_moi_gioi"))} cũng xuống tàu: đã có khách trả giá gấp hai mươi lần.`,
          [C("Giữ đảo, không bán", { flags: ["x24_giu_dao"], counters: { x24_dao: 1 } }, "Giữ giấc mơ, giữ cả hóa đơn"),
           C("Chia đôi đảo với người đó", { flags: ["x24_chia_dao"], rel: 4 }, "Có bạn cùng gánh, nửa đảo nửa dê"),
           C("Nhờ bà môi giới định giá", { flags: ["x24_dinh_gia"], money: -0.05 }, "Biết giá, bị bà ấy bám theo")]),
      ],
      [
        card("x24_day_noi_day", "Cuộc nổi dậy có sừng", (c, k) => `Sáng nay bạn ra bến thì chiếc thuyền duy nhất của đảo đã bị dê ăn mất nửa mạn. ${c.flags.has("x24_doc_tai") || cnt(c, "x24_long_de") < 0 ? "Rõ ràng đây là phản đối chế độ." : "Có thể chỉ vì đói, nhưng trông rất giống phản đối."} ${k.gag()}`,
          [C("Đàm phán bằng một bao muối", { money: -0.05, counters: { x24_long_de: 2 }, flags: ["x24_muoi"] }, "Dê nguôi, muối hết"),
           C("Đóng bè vượt biển về đất liền", { health: -5, flags: ["x24_dong_be"] }, "Thoát đảo, suýt thì không")]),
        card("x24_day_thue", "Hóa đơn thuế bằng tiếng lạ", (c) => `Nhà chức trách của đất nước có hòn đảo gửi hóa đơn thuế đất mười năm, viết bằng thứ tiếng bạn không đọc được, nhưng con số thì đọc được. ${c.flags.has("x24_homestay") ? "Tiền nhà nghỉ đủ trả một nửa." : "Tiền trong tài khoản đủ trả một góc."}`,
          [C("Trả thuế cho xong", { money: -0.4, flags: ["x24_tra_thue"] }, "Xong thuế, sạch túi"),
           C("Xin hoãn và học tiếng nước đó", { know: 3, flags: ["x24_hoc_tieng"], counters: { x24_dao: 1 } }, "Thêm thời gian, thêm một ngôn ngữ")]),
      ],
      [
        card("x24_ket", "Hải đăng hay đất liền", (c, k) => `Ngọn hải đăng trên đảo sáng lại lần đầu sau ba mươi năm. Bạn đứng dưới chân đèn, một tay cầm thư của ${k.npc("ba_moi_gioi")}, một tay cầm giấy nhắc ${noOr(c, k, "món nợ ở đất liền", "lời hứa ở đất liền")}. ${cnt(c, "x24_dao") >= 2 ? "Bạn đã thuộc từng tảng đá trên đảo." : "Bạn vẫn chưa thuộc đường ra bến."} ${c.flags.has("x24_chia_dao") ? "Nửa kia của đảo đang chờ bạn quyết cùng." : "Cả hòn đảo chỉ chờ một chữ ký của bạn."} ${k.gag()}`,
          (c) => [...(migrateOk(c) ? [ending(L24_DI, "Ở lại, nhập cư làm chúa đảo", "Đổi nước, đổi đời, bốn mươi con dê")] : []),
           ending(L24_BAN, "Bán đảo cho khu nghỉ dưỡng", "Giàu lên, mất vương quốc"),
           ending(L24_TANG, "Trao đảo cho bầy dê", "Nhẹ lòng, nhẹ cả túi")]),
      ],
    ],
  }));

/* ======================================================================= X25 Vương quốc dưa */

const L25_GIAU = land("x25_giau", "Bạn bán sạch từng đợt dưa trước khi hỏng, lời gấp ba số tiền quỹ. Người ta gọi bạn là vua dưa, dù bạn chỉ muốn được gọi là người đã nghỉ hưu.", { money: 3, happy: 6 });
const L25_VON = land("x25_hoa_von", "Bạn bán rẻ phần còn lại cho một xưởng nước ép. Lấy lại được vốn, thêm chút lãi và một tủ lạnh đầy nước dưa.", { money: 1, happy: 2 });
const L25_TRANG = land("x25_trang_tay", "Bạn ôm dưa chờ giá lên thêm một mùa. Dưa không chờ bạn. Quỹ hưu thành phân bón cho cả xóm.", { money: -2, happy: -6, flags: ["x25_trang_tay"] });
const L25_SAP = land("x25_sap_dua", "Bạn mở hẳn một sạp dưa đầu chợ, bán đến cuối đời. Ai mua dưa cũng được nghe kể chuyện quỹ hưu.", { custom: "become:street_vendor", money: 1 });

const X25 = weird("X25", "abs", ["tien", "ky"],
  (c) => c.age >= 50 && c.age <= 68 &&
    (c.retired || c.owns.has("deposit") || c.owns.has("stake")),
  () => "Nhận lương hưu bằng dưa hấu",
  () => ({
    title: "Quỹ hưu trí của bạn là dưa hấu",
    text: `Quỹ hưu trí bạn góp bao năm vừa được "tối ưu hóa danh mục": toàn bộ đổi thành dưa hấu, và từ nay lương hưu sẽ trả bằng dưa. Sáu giờ sáng, xe tải đổ đợt đầu mười hai nghìn quả cao quá mái hiên. "Dưa là tài sản thực, bác ạ," anh nhân viên quỹ nói rồi lên xe đi mất.`,
  }),
  season({
    id: "w_X25", vn: "Vương quốc dưa", color: "#e8a33a", years: [5, 9], weird: "abs",
    rules: { income: 0.9, yearly: { money: -0.05 }, flags: ["w_vuong_quoc_dua", "w_luong_huu_bang_dua"] },
    reset: { cast: [{ key: "anh_quy", role: "official", label: "anh nhân viên quỹ hưu trí" }, { key: "ba_dua", role: "rival", label: "bà buôn dưa đầu chợ" }] },
    gag: { key: "dua_khap_noi", lines: [
      "Bạn mở tủ lạnh: ba quả dưa. Bạn mở tủ quần áo: năm quả dưa và một cái áo.",
      "Đêm nào cũng có một quả dưa lăn xuống cầu thang lúc hai giờ sáng. Cả nhà đã quen, không ai dậy nữa.",
      "Bạn nằm mơ thấy dưa hấu. Tỉnh dậy, đúng là có một quả dưa trên gối.",
      "Đứa trẻ nhà hàng xóm vẽ chân dung bạn: một quả dưa đội mũ. Giống đến mức ai cũng nhận ra.",
    ] },
    landings: [L25_GIAU, L25_VON, L25_TRANG, L25_SAP],
    beats: [
      [
        card("x25_mo_dem", "Mười hai nghìn quả", (c, k) => `Bạn mất trọn một ngày để đếm. Mười hai nghìn quả, vỏ xanh sọc đậm, quả nào cũng dán tem của quỹ hưu trí, và theo tính toán sẽ bắt đầu hỏng sau năm mươi ngày. Năm nào quỹ cũng sẽ chở tới một đợt như thế, thay cho một phần tiền, và phần bán không kịp thì hỏng. ${k.gag()}`,
          [C("Thuê kho lạnh", { money: -0.3, flags: ["x25_kho_lanh"] }, "Dưa sống lâu hơn, tiền thì không"),
           C("Bày bán ngay trước cổng", { money: 0.1, counters: { x25_ban: 1 }, flags: ["x25_ban_cong"] }, "Có tiền liền, cả xóm gọi bạn là nhà dưa"),
           C("Gọi luật sư kiện quỹ", { money: -0.1, flags: ["x25_kien_quy"] }, "Có thể lấy lại tiền, chắc chắn mất thời gian")]),
        card("x25_mo_bao_cao", "Báo cáo lợi nhuận in màu", (c, k) => `${cap(k.npc("anh_quy"))} quay lại với bản báo cáo in màu: nhờ nắng nóng, danh mục dưa của bạn đã tăng giá ba phần trăm. Anh khuyên đừng bán vội, vì "dưa là tài sản dài hạn".`,
          [C("Tin anh ta, giữ dưa", { flags: ["x25_tin_quy"], counters: { x25_hong: 1 } }, "Chờ giá lên, dưa thì chín thêm"),
           C("Bắt anh ta ở lại phụ bán", { flags: ["x25_bat_ban"], counters: { x25_ban: 1 } }, "Có thêm người bán, anh ta bán dở tệ")]),
      ],
      [
        card("x25_kd_cho", "Bà buôn dưa đầu chợ", (c, k) => `Cả chợ chỉ có một sạp dưa, của ${k.npc("ba_dua")}, và sạp ấy bán dưa từ trước khi bạn ra đời. Bà nhìn đống dưa sau lưng bạn, rồi nhìn bạn, rồi bật cười. ${k.gag()}`,
          [C("Hợp tác, chia lời với bà", { flags: ["x25_hop_tac"], counters: { x25_ban: 2 } }, "Bán đều, chia đôi lời"),
           C("Phá giá, bán rẻ một nửa", { money: -0.1, flags: ["x25_pha_gia"], counters: { x25_ban: 3 } }, "Bán nhanh, có kẻ thù ở chợ")]),
        card("x25_kd_mut", "Đếm ngược ngày hỏng", (c) => `${c.flags.has("x25_kho_lanh") ? "Kho lạnh báo đầy, đợt dưa thứ hai phải nằm ngoài sân." : "Sân nhà bắt đầu thơm mùi dưa chín quá."} Bạn có chín ngày trước khi một nghìn quả cuối của đợt này hỏng.`,
          [C("Làm mứt vỏ dưa bán kèm", { know: 2, flags: ["x25_mut"], counters: { x25_ban: 1 } }, "Không phí gì, thức trắng mấy đêm"),
           C("Phát dưa cho trường học và bệnh viện", { rel: 4, flags: ["x25_phat_dua"], counters: { x25_hong: -1 } }, "Được lòng người, không được tiền")]),
      ],
      [
        card("x25_cl_xe_tai", "Người mua cả xe tải", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} nghe chuyện, lái xe tải tới mua một lúc ba nghìn quả, nhưng chỉ trả trước một nửa. Muốn chở dưa lên thành phố bán giá cao thì phải thuê xe lạnh, tốn gần hết tiền dưa từ đầu mùa. Đêm ấy bạn nghĩ tới ${k.scar("do") ? `thứ mang theo từ đời cũ, chuyện ${k.scar("do")}` : c.retired ? "những năm còn đi làm" : "những năm tích cóp cho quỹ hưu"}, và tự hỏi sao đời mình giờ lại xoay quanh dưa.`,
          [C("Bán chịu cho người đó", { counters: { x25_ban: 2 }, flags: ["x25_ban_chiu"] }, "Bán được nhiều, tiền về chậm"),
           C("Chỉ bán tiền mặt", { money: 0.2, counters: { x25_ban: 1 }, flags: ["x25_tien_mat"] }, "Chắc tiền, dư nhiều dưa"),
           C("Thuê xe lạnh, chở dưa lên phố", { money: -0.3, counters: { x25_ban: 3 }, flags: ["x25_xe_lanh"] }, "Tốn tiền thuê xe, bán được giá phố")]),
      ],
      [
        card("x25_day_mua", "Mười ngày mưa", (c, k) => `Mưa mười ngày liền, đường ra chợ ngập. ${c.flags.has("x25_xe_lanh") ? "Chiếc xe lạnh bạn thuê nằm chết máy giữa đường, tiền thuê vẫn chạy." : c.flags.has("x25_kho_lanh") ? "Kho lạnh mất điện ba ngày." : "Xe nào cũng chết máy giữa đường."} Đợt dưa mới nứt vỏ từng quả một, nghe lách tách suốt đêm. ${k.gag()}`,
          [C("Đem quả to nhất lên mạng đấu giá", { gamble: { p: 0.4,
              win: { money: 0.4, counters: { x25_ban: 2 }, flags: ["x25_dau_gia"], log: "Quả dưa to nhất được một quán ăn mua với giá bằng nửa đợt hàng." },
              lose: { money: -0.05, counters: { x25_hong: 1 }, flags: ["x25_dau_gia"], log: "Phiên đấu giá chỉ có một người trả giá, và người đó là bạn." } } }, "Có thể gỡ cả đợt, có thể thành trò cười"),
           C("Ủ dưa nứt làm phân", { happy: -3, flags: ["x25_lam_phan"], counters: { x25_hong: 1 } }, "Không phí hẳn, mất cả đợt")]),
        card("x25_day_thu", "Thư xin lỗi của quỹ", (c, k) => `Quỹ hưu trí gửi thư xin lỗi vì "sai sót trong quản lý danh mục", và đề nghị đổi số dưa còn lại sang một tài sản ổn định hơn: dứa. ${cap(k.npc("anh_quy"))} đứng ngoài cổng, ôm sẵn một quả làm mẫu.`,
          [C("Từ chối, đòi tiền mặt", { money: 0.2, flags: ["x25_doi_tien"], counters: { x25_ban: 1 } }, "Lấy lại một phần, mất cả năm đi lại"),
           C("Kiện chung với những người góp quỹ khác", { money: -0.1, flags: ["x25_kien_tap_the"], rel: 3 }, "Có đồng minh, chưa có tiền"),
           C("Nhận dứa", { flags: ["x25_nhan_dua"], happy: 2 }, "Thêm một vương quốc, thêm một hạn chót")]),
      ],
      [
        card("x25_ket", "Quả dưa cuối cùng", (c, k) => {
          const strong = cnt(c, "x25_ban") >= 4 || c.reputation >= 75;
          return `Còn đúng một đợt dưa cuối, và đúng một tuần trước khi nó hỏng. ${strong ? "Cả thành phố đã quen mua dưa của bạn." : "Ngoài sân dưa vẫn chất cao như ngày đầu."} ${c.flags.has("x25_nhan_dua") ? "Sau nhà, dứa cũng bắt đầu chín." : "Quỹ hưu vẫn chưa trả lời thư."} ${cap(k.npc("ba_dua"))} ghé qua, nhắc bạn rằng ${noOr(c, k)} sẽ không chờ dưa chín. ${k.gag()}`;
        }, (c) => {
          const strong = cnt(c, "x25_ban") >= 4 || c.reputation >= 75;
          const out: Choice[] = [strong ? ending(L25_GIAU, "Bán nốt đợt cuối cho cả thành phố", "Giàu to, cả đời mùi dưa")
            : ending(L25_VON, "Bán rẻ cho xưởng nước ép", "Lấy lại vốn, hết vương quốc")];
          out.push(ending(L25_TRANG, "Ôm dưa chờ giá lên thêm mùa nữa", "Có thể trúng lớn, dưa thì không chờ"));
          if (pathOpen("street_vendor", c.age)) out.push(ending(L25_SAP, "Mở sạp dưa đầu chợ", "Có nghề tuổi già, có cả kẻ thù ở chợ"));
          return out;
        }),
      ],
    ],
  }));

/* ======================================================================= X26 Người giữ luật chơi */

// gần nhất: "Danh văn hóa" → nghệ nhân
const L26_NGHE_NHAN = land("x26_nghe_nhan", "Bạn được phong nghệ nhân trò chơi dân gian, mở sân dạy trò Sỏi Bắt Trăng mỗi đêm có trăng.", { custom: "become:artisan", happy: 6 });
const L26_GIAI = land("x26_giai_thuong", "Bạn nhận giải thưởng văn hóa, tiền thưởng đủ xây lại sân chơi và in bộ luật thành sách, khổ to như mặt bàn.", { money: 1.5, happy: 5 });
const L26_BAN = land("x26_ban_luat", "Bạn bán bản quyền bộ luật cho một công ty trò chơi. Trò Sỏi Bắt Trăng lên điện thoại, điều bốn mươi bảy vẫn giữ nguyên.", { money: 2.5, happy: -2 });

const X26 = weird("X26", "abs", ["danh", "dat", "ky"],
  (c) => c.age >= 45 && c.age <= 70 && (c.flags.has("rural") || c.flags.has("origin_poor_rural") || c.farmer),
  () => "Giữ luật trò chơi ông bà để lại",
  (s) => ({
    title: "Người cuối cùng nhớ luật chơi",
    text: `Một hội đồng di sản của nhiều nước sắp công nhận trò Sỏi Bắt Trăng mà ông bà bạn từng chơi ở ${s.noi || "quê cũ"}, chỉ thiếu đúng một thứ: bộ luật. Hóa ra chỉ còn bạn nhớ đủ một trăm mười hai điều, kể cả điều bốn mươi bảy: có con chó chạy qua thì ván chơi bắt đầu lại. "Bác đọc chậm thôi, máy ghi âm của chúng cháu chỉ có chín tiếng," cô cán bộ văn hóa nói.`,
  }),
  season({
    id: "w_X26", vn: "Người giữ luật chơi", color: "#b8862f", years: [6, 10], weird: "abs",
    rules: { income: 0.9, flags: ["w_nguoi_giu_luat"] },
    reset: { cast: [{ key: "co_vh", role: "official", label: "cô cán bộ văn hóa" }, { key: "cu_lang_ben", role: "rival", label: "cụ làng bên" }] },
    gag: { key: "luat_moi", lines: [
      "Bạn vừa đọc xong điều sáu mươi thì nhớ ra điều sáu mươi mốt: không được chơi khi đang ăn khoai.",
      "Giữa buổi ghi âm, bạn nhớ thêm điều một trăm mười ba: người thua phải khen trăng ba câu.",
      "Đêm qua bạn mơ thấy bà, bà nhắc điều một trăm mười bốn. Sáng ra bạn ghi vội lên vỏ hộp sữa.",
      "Bộ luật giờ dài một trăm hai mươi điều. Cô cán bộ văn hóa bắt đầu khóc lặng lẽ mỗi khi bạn nói: à, còn nữa.",
    ] },
    landings: [L26_NGHE_NHAN, L26_GIAI, L26_BAN],
    beats: [
      [
        card("x26_mo_ghi_am", "Chín tiếng ghi âm", (c, k) => `${cap(k.npc("co_vh"))} đặt máy ghi âm lên bàn, rót cho bạn cốc nước và nói: "Bác cứ từ từ." Bạn bắt đầu từ điều một: ván chơi chỉ được bắt đầu khi thấy trăng dưới nước. ${k.gag()}`,
          [C("Đọc một lèo cho xong", { health: -2, counters: { x26_luat: 2 }, flags: ["x26_doc_mot_leo"] }, "Đủ luật, khản giọng"),
           C("Đòi chơi thật một ván mới nhớ được", { flags: ["x26_choi_that"], counters: { x26_luat: 1 }, happy: 3 }, "Nhớ sâu hơn, ghi âm chậm hơn")]),
        card("x26_mo_san", "Sân chơi thành bãi xe", () => "Bãi đất trống nơi ông bà bạn từng chơi, theo luật phải có một vũng nước để soi trăng, giờ là bãi đỗ xe. Vũng nước duy nhất còn lại nằm dưới gầm một chiếc xe tải không ai nhận.",
          [C("Vận động dời bãi xe", { money: -0.1, flags: ["x26_doi_bai"], rel: 2 }, "Lấy lại sân, mất lòng chủ xe"),
           C("Chơi luôn giữa bãi xe", { flags: ["x26_bai_xe"], counters: { x26_luat: 1 } }, "Đúng luật, sai chỗ")]),
      ],
      [
        card("x26_kd_cu_lang_ben", "Con chó hay con mèo", (c, k) => `${cap(k.npc("cu_lang_ben"))} chống gậy sang, tuyên bố bạn nhớ sai điều bốn mươi bảy: con vật chạy qua làm ván chơi bắt đầu lại phải là con mèo, không phải con chó. Báo địa phương đăng cả hai phiên bản. ${k.gag()}`,
          [C("Thách đấu một ván để phân xử", { gamble: { p: 0.5,
              win: { flags: ["x26_thang_cu"], counters: { x26_luat: 1 }, log: "Bạn thắng ván phân xử. Một con chó chạy qua đúng lúc, như đã hẹn trước." },
              lose: { flags: ["x26_thua_cu"], happy: -2, log: "Bạn thua. Một con mèo đi ngang, ngồi xuống, liếm chân." } } }, "Thắng thì chốt luật, thua thì nhường danh"),
           C("Ghi cả hai: chó hay mèo đều tính", { flags: ["x26_ca_hai"], rel: 3, counters: { x26_luat: 1 } }, "Hòa khí, bộ luật dài thêm")]),
        card("x26_kd_tre", "Bọn trẻ chỉ chơi trên điện thoại", () => "Bạn mở lớp dạy trò Sỏi Bắt Trăng cho trẻ con trong xóm. Buổi đầu có mười hai đứa, buổi thứ hai còn ba, vì trên điện thoại có trò dễ hơn và không cần chờ trăng.",
          [C("Dạy ở trường, mỗi tuần một buổi", { flags: ["x26_day_truong"], counters: { x26_hoc_tro: 2 }, health: -1 }, "Có học trò, mất buổi tối"),
           C("Cho làm bản trò chơi trên điện thoại", { money: 0.1, flags: ["x26_ban_dien_thoai"], counters: { x26_hoc_tro: 1 } }, "Nhiều người chơi, ít ai thấy trăng")]),
      ],
      [
        card("x26_cl_dieu_cuoi", "Điều luật bà dặn đừng kể", (c, k) => `Còn một điều bà dặn bạn đừng kể với ai: người thua ván cuối mùa phải tặng người thắng thứ mình quý nhất. Hồi nhỏ bạn từng thắng ${k.scar("nguoi") || "một đứa bạn cùng xóm"} một ván như thế, và món quà năm ấy có dính dáng tới ${k.scar("do") || "một món đồ cũ bạn vẫn giữ"}. Nếu điều này vào bộ luật, cả hai sẽ phải kể lại chuyện năm ấy.`,
          [C("Công bố đủ một trăm hai mươi điều", { flags: ["x26_cong_bo"], counters: { x26_luat: 2 } }, "Đủ luật, lộ chuyện cũ"),
           C("Giữ kín điều cuối", { flags: ["x26_giu_dieu_cuoi"], happy: 2 }, "Giữ lời bà, bộ luật thiếu một điều"),
           C("Tìm người đó hỏi ý trước", { flags: ["x26_hoi_y"], rel: 3 }, "Tôn trọng người cũ, chậm hồ sơ")]),
      ],
      [
        card("x26_day_tham_dinh", "Đêm không trăng", (c, k) => `Đoàn thẩm định từ nhiều nước đến đúng đêm trời đầy mây. Không có trăng, theo luật thì không được chơi. ${c.flags.has("x26_bai_xe") ? "Họ ngồi trên nắp thùng xe tải chờ trăng." : "Họ ngồi quanh vũng nước, ghi chép trong im lặng."} ${k.gag()}`,
          [C("Soi đèn pin xuống nước làm trăng", { flags: ["x26_den_pin"], counters: { x26_luat: -1 } }, "Đoàn xem được, luật bị bẻ"),
           C("Giữ đúng luật, mời đoàn ở lại chờ", { money: -0.15, flags: ["x26_cho_trang"], counters: { x26_luat: 1 } }, "Tốn tiền tiếp đón, được kính trọng")]),
        card("x26_day_ban_quyen", "Ai sở hữu một trò chơi", (c, k) => `Một công ty trò chơi gửi hợp đồng mua đứt bản quyền bộ luật, trả bằng mấy năm thu nhập của bạn. ${cap(k.npc("co_vh"))} nói trò chơi dân gian không thuộc về ai, nhưng hợp đồng thì đã in sẵn tên bạn.`,
          [C("Ký trước một phần cho chắc", { money: 0.5, flags: ["x26_ky_ban_quyen"] }, "Có tiền, người ta nói bạn bán ông bà"),
           C("Tuyên bố trò chơi của mọi người", { flags: ["x26_cua_chung"], counters: { x26_hoc_tro: 1 }, rel: 3 }, "Giữ tiếng, bỏ qua một khoản lớn")]),
      ],
      [
        card("x26_ket", "Ngày trò chơi được công nhận", (c, k) => `Hội đồng di sản công bố trò Sỏi Bắt Trăng được công nhận, kèm bộ luật ${cnt(c, "x26_luat") >= 4 ? "đủ từng điều" : "còn thiếu vài điều"} do bạn đọc. ${cnt(c, "x26_hoc_tro") >= 2 ? "Học trò của bạn chơi biểu diễn giữa sân." : `Giữa sân chỉ có bạn và ${k.npc("cu_lang_ben")}.`} ${c.flags.has("x26_ky_ban_quyen") ? "Công ty trò chơi muốn mua nốt phần còn lại." : "Công ty trò chơi vẫn gửi thư đều đặn."} Giữa buổi lễ, bạn nhớ ra ${noOr(c, k)} vẫn chưa trả, như một điều luật bị bỏ sót. ${k.gag()}`,
          (c) => {
            const out: Choice[] = [];
            if (pathOpen("artisan", c.age)) out.push(ending(L26_NGHE_NHAN, "Nhận làm nghệ nhân, mở sân dạy", "Có danh phận, buộc chân ở sân chơi"));
            out.push(ending(L26_GIAI, "Nhận giải, in bộ luật thành sách", "Có tiền và tiếng, trò chơi vẫn của chung"));
            out.push(ending(L26_BAN, "Bán bản quyền cho công ty trò chơi", "Giàu lên, bị cả làng nói ra nói vào"));
            return out;
          }),
      ],
    ],
  }));

/* ======================================================================= X27 Ca sĩ một bài */

const L27_CA_SI = land("x27_ca_si", "Bạn ký hợp đồng làm ca sĩ thật, có album, có lịch diễn. Khán giả vẫn đòi bài cái bàn ở cuối mỗi đêm.", { custom: "become:singer", money: 0.5 });
// gần nhất: "nghề ca sĩ" khi đã quá tuổi bước vào nghề ca sĩ
const L27_DAN_GIAN = land("x27_dan_gian", "Bạn theo ông nhạc sĩ già đi hát ở các hội làng, nơi không ai biết bài cái bàn là gì.", { custom: "become:folk_musician" });
const L27_MOT_BAI = land("x27_mot_bai", "Bạn ký hợp đồng trọn đời chỉ hát một bài. Tiền bản quyền đều như lương hưu, còn cái bàn được đặt trong phòng truyền thống của giải đấu.", { income_mult: 1.3, happy: 3, flags: ["x27_ca_si_mot_bai"] });
const L27_BAN_DUT = land("x27_ban_dut", "Bạn bán đứt bài hát cho giải đấu và tuyên bố giải nghệ sau đúng một bài. Không ai được mời bạn hát nữa, kể cả ở đám cưới.", { money: 2, happy: 2 });

const X27 = weird("X27", "abs", ["danh", "ky"],
  (c) => c.age >= 18 && c.age <= 55 &&
    (c.flags.has("talent_singer") || c.flags.has("life_singer") || c.flags.has("talent_folk_musician") || (c.counters.drink ?? 0) >= 5),
  () => "Hát bài lúc say trước bốn mươi nghìn người",
  (s) => ({
    title: "Bài hát lúc ba giờ sáng",
    text: `Ba giờ sáng ở một quán karaoke ${s.noi ? `tại ${s.noi}` : "gần nhà"}, bạn say và bịa ra một bài hát chỉ có hai câu, câu thứ hai là "cái bàn này của tôi". Ai đó quay lại và đăng lên. Một tháng sau, ban tổ chức giải bóng đá toàn quốc chọn nó làm bài ca chính thức, phát trước mỗi trận cho bốn mươi nghìn người cùng hát. "Anh chị phải hát trực tiếp ở trận khai mạc," người của ban tổ chức gọi tới, giọng như ra lệnh.`,
  }),
  season({
    id: "w_X27", vn: "Ca sĩ một bài", color: "#f0b429", years: [6, 10], weird: "abs",
    rules: { income: 1.2, flags: ["w_ca_si_mot_bai"] },
    reset: { cast: [{ key: "quan_ly", role: "partner", label: "cô quản lý nói nhanh như máy" }, { key: "nhac_si", role: "mentor", label: "ông nhạc sĩ già" }] },
    gag: { key: "bai_cai_ban", lines: [
      "Ở đám cưới, sinh nhật, cả buổi họp phụ huynh, ai cũng đòi bạn hát bài cái bàn. Bạn chưa bao giờ được hát hết câu đầu, vì họ hát thay.",
      "Bạn đi khám răng. Nha sĩ bật bài cái bàn và nhờ bạn há miệng hát theo.",
      "Ở sân bay, máy quét hành lý kêu bíp đúng nhịp bài cái bàn. Nhân viên an ninh xin chữ ký.",
      "Bạn thử hát một bài khác. Khán giả lịch sự đợi bạn hát xong, rồi đồng thanh: cái bàn này của tôi.",
    ] },
    landings: [L27_CA_SI, L27_DAN_GIAN, L27_MOT_BAI, L27_BAN_DUT],
    beats: [
      [
        card("x27_mo_khai_mac", "Trận khai mạc", (c, k) => `Bốn mươi nghìn người đứng dậy khi bạn bước ra giữa sân, tay cầm micro, chân hơi run. ${cap(k.npc("quan_ly"))} nói nhỏ vào tai: "Hát y như đêm đó." ${k.gag()}`,
          [C("Hát tỉnh táo, đúng nhạc", { flags: ["x27_hat_tinh"], counters: { x27_danh: 1 } }, "Hay hơn bản gốc, khán giả hơi hụt hẫng"),
           C("Uống hai ly cho đúng giọng gốc", { health: -2, flags: ["x27_hat_say"], counters: { x27_danh: 2, drink: 1 } }, "Cả sân phát cuồng, sáng mai đau đầu"),
           C("Hát chậm lại thành bản tình ca", { flags: ["x27_tinh_ca"], happy: 2 }, "Có người khóc, có người la ó")]),
        card("x27_mo_hop_dong", "Hợp đồng mười năm một bài", (c, k) => `${cap(k.npc("quan_ly"))} đưa bạn bản hợp đồng dày hai mươi trang. Điều khoản quan trọng nhất nằm ở trang mười chín: trong mười năm, bạn chỉ được hát trước công chúng đúng một bài.`,
          [C("Ký, nhận tiền ứng trước", { money: 0.4, flags: ["x27_hop_dong"] }, "Có tiền ngay, giọng bị khóa mười năm"),
           C("Không ký, tự đi diễn", { money: -0.05, flags: ["x27_tu_do"], counters: { x27_danh: -1 } }, "Tự do, chưa ai mời")]),
      ],
      [
        card("x27_kd_bai_hai", "Bài hát thứ hai", (c, k) => `${cap(k.npc("nhac_si"))} gửi bạn một bài hát rất đẹp, viết trong ba năm, nói giọng bạn đáng được hát thứ gì hơn một cái bàn. ${c.flags.has("x27_hop_dong") ? "Hợp đồng không cho bạn hát nó ở đâu cả." : "Không ai cấm bạn hát nó, chỉ là chưa chắc có ai nghe."} ${k.gag()}`,
          [C("Phát hành bài thứ hai", { gamble: { p: 0.3,
              win: { flags: ["x27_bai_hai_hit"], counters: { x27_danh: 2 }, money: 0.2, log: "Bài thứ hai được nghe nhiều hơn cả bài cái bàn, trong đúng một tuần." },
              lose: { flags: ["x27_bai_hai_xit"], money: -0.15, log: "Bài thứ hai có ba nghìn lượt nghe, hai nghìn là của ông nhạc sĩ." } } }, "Có thể thoát vai, có thể bị phạt"),
           C("Cất bài vào ngăn kéo", { flags: ["x27_cat_bai"], happy: -2 }, "Giữ hợp đồng, nợ ông nhạc sĩ một lời hứa")]),
        card("x27_kd_thua", "Năm trận thua liền", () => "Đội chủ nhà thua năm trận liền. Trên mạng có người thống kê: trận nào bạn hát lệch tông thì đội thua. Một nhóm cổ động viên mang bàn gỗ ra trước cổng nhà bạn, gõ nhẹ, rất đều.",
          [C("Đổi lời thành cái ghế này của tôi", { flags: ["x27_doi_loi"], counters: { x27_danh: 1 } }, "Khán giả thích, ban tổ chức không"),
           C("Lên mạng xin lỗi", { flags: ["x27_xin_loi"], counters: { x27_danh: -1 }, happy: -2 }, "Yên chuyện, mất mặt"),
           C("Mặc kệ, đóng cửa ngủ", { flags: ["x27_mac_ke"], rel: -2 }, "Giữ thể diện, giữ cả cái bàn trước cổng")]),
      ],
      [
        card("x27_cl_dong_tac_gia", "Đồng tác giả đêm ấy", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} xuất hiện với đoạn phim gốc dài hơn: đêm đó chính người ấy hét câu "cái bàn này của tôi", bạn chỉ hát theo. Người ấy đòi đứng tên đồng tác giả. Muốn cãi lại, bạn phải kể chuyện ${k.scar("do") || "những năm trước đó"} ra, mà chuyện ấy bạn không muốn ai biết.`,
          [C("Chia đôi bản quyền với người đó", { money: -0.2, flags: ["x27_chia_quyen"], rel: 3 }, "Hết tranh chấp, mất nửa tiền"),
           C("Cãi đến cùng", { flags: ["x27_cai"], counters: { x27_danh: 1 }, money: -0.1 }, "Có thể giữ được bài, chắc chắn mất bạn"),
           C("Rủ người đó lên sân hát cùng", { flags: ["x27_song_ca"], counters: { x27_danh: 2 } }, "Thành song ca, thành chuyện cười")]),
      ],
      [
        card("x27_day_mat_giong", "Mất giọng trước chung kết", (c, k) => `Ba ngày trước trận chung kết, bạn mất giọng hoàn toàn, chỉ còn thì thào như gió lùa khe cửa. ${k.gag()}`,
          [C("Hát nhép theo băng", { flags: ["x27_hat_nhep"], counters: { x27_danh: -1 } }, "Qua trận, có ngày bị lộ"),
           C("Đứng giữa sân, để cả sân hát thay", { flags: ["x27_ca_san_hat"], happy: 5, counters: { x27_danh: 2 } }, "Khoảnh khắc đẹp nhất, ban tổ chức nổi giận")]),
        card("x27_day_bai_moi", "Giải đấu tìm bài ca mới", (c, k) => `Ban tổ chức thông báo mùa sau có thể thay bài ca bằng một đoạn nhạc do máy soạn, "trẻ trung hơn, không say". ${c.flags.has("x27_hop_dong") ? "Hợp đồng một bài của bạn không có điều khoản nào cho trường hợp này." : "Bạn không có hợp đồng nào để bám vào."} ${cap(k.npc("quan_ly"))} hỏi bạn muốn đánh hay muốn buông.`,
          [C("Vận động cổ động viên giữ bài", { money: -0.1, flags: ["x27_giu_bai"], counters: { x27_danh: 1 } }, "Có thể giữ được, mệt nhoài"),
           C("Buông, để máy hát", { flags: ["x27_buong"], happy: -2 }, "Nhẹ người, hụt hẫng")]),
      ],
      [
        card("x27_ket", "Lần hát thứ một nghìn", (c, k) => `Đêm nay là lần thứ một nghìn bạn hát bài cái bàn. ${cnt(c, "x27_danh") >= 4 ? "Cả sân hát to đến mức bạn không nghe được giọng mình." : "Sân vắng hơn mọi năm, nhưng ai còn ở lại đều thuộc lời."} ${c.flags.has("x27_song_ca") ? "Người đồng tác giả đứng hát cạnh bạn như mọi lần." : c.flags.has("x27_chia_quyen") ? "Một nửa tiền bản quyền đêm nay đã có chủ." : "Bạn hát một mình, như đêm đầu tiên."} Sau trận, ${k.npc("quan_ly")} đặt ba bản hợp đồng lên bàn, còn ${noOr(c, k)} thì vẫn chờ một câu trả lời. ${k.gag()}`,
          (c) => {
            const out: Choice[] = [];
            if (pathOpen("singer", c.age)) out.push(ending(L27_CA_SI, "Ký làm ca sĩ thật", "Có nghề, bài cái bàn theo cả đời"));
            else if (pathOpen("folk_musician", c.age)) out.push(ending(L27_DAN_GIAN, "Theo ông nhạc sĩ đi hát hội làng", "Hát bài khác, thu nhập ít đi"));
            out.push(ending(L27_MOT_BAI, "Ký hợp đồng trọn đời một bài", "Tiền đều, giọng bị khóa"));
            out.push(ending(L27_BAN_DUT, "Bán đứt bài hát, giải nghệ", "Có một khoản lớn, không bao giờ được hát nữa"));
            return out;
          }),
      ],
    ],
  }));

/* ======================================================================= X28 Chiến tranh bí ngô */

const sp28 = (c: FactContext, N: Names): string => nameOr(N, c.cast.spouse, "bạn đời của bạn");

const L28_TAN = land("x28_tan", "Hai người chia vườn, chia nhà, chia luôn cuộc hôn nhân. Mỗi năm vẫn gặp nhau một lần ở hội thi, đứng hai đầu bàn cân.", { custom: "spouse_leave", happy: -4 });
const L28_TRAI = land("x28_trai_giong", "Hai người gộp vườn, mở trại giống bí ngô khổng lồ. Biển hiệu ghi tên cả hai, chữ to bằng nhau đến từng milimet.", { custom: "become:agritech", happy: 6 });
/** Còn bạn đời bên cạnh (chưa mất, chưa chia tay giữa mùa). */
const wed28 = (c: FactContext): boolean => c.married && !!c.cast.spouse;
/** Người từng là Kẻ Giấu Mặt khi họ không còn ở bên. */
const gone28 = (c: FactContext): string => (c.widowed ? "người bạn đời đã khuất" : "người bạn đời đã rời đi");
const L28_TRAI_MOT = land("x28_trai_mot_minh", "Bạn gộp hai nửa vườn, mở trại giống bí ngô khổng lồ. Biển hiệu vẫn ghi tên cả hai người, chữ to bằng nhau.", { custom: "become:agritech", happy: 3 });
const L28_CUP_MOT = land("x28_cup_mot_minh", "Bạn thi bằng nửa gói hạt của người kia và thắng giải lớn nhất vùng. Tiền thưởng đủ sửa lại cả căn nhà, chiếc cúp đặt cạnh tấm ảnh hai người.", { money: 1.5, happy: 3 });
const L28_BAN_VUON = land("x28_ban_nua_vuon", "Bạn bán nửa vườn bên kia cho một nhà trồng rau, thôi thi bí. Tiền bán vườn đủ sống yên mấy năm, quả bí cuối cùng thành canh.", { money: 1, happy: 1 });
const L28_CUP = land("x28_doi_vo_dich", "Hai người thi chung một quả và thắng giải lớn nhất vùng. Tiền thưởng đủ sửa lại cả căn nhà, quả bí được đặt ở phòng khách thay ghế dài.", { money: 1.5, happy: 6 });

const X28 = weird("X28", "abs", ["tinh", "ky", "dat"],
  (c) => c.married && !!c.cast.spouse && c.age >= 38 && c.age <= 70 &&
    (c.owns.has("land") || c.flags.has("orchard") || c.farmer || (c.home_owner && c.flags.has("rural"))),
  () => "Lật mặt Kẻ Giấu Mặt của hội thi bí ngô",
  (s, c, N) => ({
    title: "Đối thủ ngủ cạnh bạn bao năm",
    text: `Từ ngày cưới tới nay, năm nào quả bí ngô của bạn cũng về nhì ở hội thi bí ngô ${s.noi ? `của ${s.noi}` : "trong vùng"}, thua một người ký tên Kẻ Giấu Mặt. Năm nay, giữa lễ trao giải, Kẻ Giấu Mặt tháo mặt nạ: là ${sp28(c, N)}, người vẫn rót trà cho bạn mỗi sáng. "Phân bón của mình hôi quá nên mình mới phải giấu," ${sp28(c, N)} nói, tay ôm quả bí nặng hơn cái tủ lạnh.`,
  }),
  season({
    id: "w_X28", vn: "Chiến tranh bí ngô", color: "#e07b22", years: [6, 10], weird: "abs",
    rules: { income: 0.9, flags: ["w_chien_tranh_bi_ngo"] },
    reset: { cast: [{ key: "trong_tai", role: "official", label: "ông trọng tài đeo kính lúp" }, { key: "ba_ban_phan", role: "neighbor", label: "bà bán phân bón cho cả hai phe" }] },
    gag: { key: "qua_bi", lines: [
      "Tối nay hai người ngủ hai đầu giường, ở giữa là quả bí dự thi được đắp chăn.",
      "Sáng ra, dây bí của hai bên đã vượt qua vạch phấn và quấn chặt vào nhau.",
      "Bữa cơm nào cũng có canh bí. Không ai dám hỏi bí của ai.",
      "Con mèo hàng xóm chọn phe bằng cách nằm lên quả bí to hơn. Mỗi tuần nó đổi phe một lần.",
    ] },
    landings: [L28_TAN, L28_TRAI, L28_CUP, L28_TRAI_MOT, L28_CUP_MOT, L28_BAN_VUON],
    beats: [
      [
        card("x28_mo_phan", "Đường phấn giữa vườn", (c, k) => `Sáng hôm sau lễ trao giải, ${sp28(c, k.N)} cầm cục phấn kẻ một đường thẳng chia đôi khu vườn, đều như cắt bánh. ${k.gag()}`,
          [C("Chấp nhận chia đôi vườn", { flags: ["x28_chia_vuon"] }, "Công bằng, lạnh lẽo"),
           C("Tuyên chiến công khai", { flags: ["x28_tuyen_chien"], counters: { x28_cang: 1 } }, "Hả giận, bữa cơm thành trận đấu"),
           C("Đề nghị năm nay thi chung một quả", { flags: ["x28_de_nghi_chung"], counters: { x28_hoa: 1 } }, "Có thể làm lành, có thể bị cười")], wed28),
        card("x28_mo_so", "Cuốn sổ phân bón", (c, k) => `Dọn tủ, bạn tìm thấy cuốn sổ bìa da của ${sp28(c, k.N)}: bao nhiêu năm ghi chép, công thức phân bón viết bằng mật mã, và một trang chỉ vẽ hình bạn đang tưới cây, kèm mũi tên ghi "đừng để biết".`,
          (c) => {
            const sid = c.cast.spouse;
            return [C("Đọc trộm hết cuốn sổ", { flags: ["x28_doc_trom"], counters: { x28_cang: 1 }, ...(sid ? { trust: { npc: sid, delta: -0.15 } } : {}) }, "Biết bí mật, mất lòng tin"),
              C("Đặt lại chỗ cũ, không mở", { flags: ["x28_tra_so"], counters: { x28_hoa: 1 }, ...(sid ? { trust: { npc: sid, delta: 0.1 } } : {}) }, "Giữ lòng tin, thi tiếp trong bóng tối")];
          }, wed28),
      ],
      [
        card("x28_kd_canh_dem", "Tiếng tưới cây lúc nửa đêm", (c, k) => `Nửa đêm, bạn nghe tiếng bước chân ngoài vườn và tiếng nước tưới rất khẽ vào gốc bí của mình. Sáng ra, quả bí to thêm một vòng tay, và bạn không biết nên cảm ơn hay đi báo trọng tài. ${k.gag()}`,
          [C("Treo chuông quanh gốc bí", { flags: ["x28_chuong"], counters: { x28_cang: 1 } }, "Bắt được thủ phạm, mất giấc ngủ"),
           C("Đêm sau lén tưới lại gốc bên kia", { flags: ["x28_tuoi_lai"], counters: { x28_hoa: 1 } }, "Hai người tưới cho nhau, không ai nói")], wed28),
        card("x28_kd_chon_phe", "Hai nồi canh bí", (c) => `${c.kids_alive > 0 ? "Con cái" : "Họ hàng hai bên"} bắt đầu chọn phe. Bữa cơm cuối tuần có hai nồi canh bí, ai múc nồi nào thì coi như đứng về phe đó.`,
          [C("Kéo cả nhà về phe mình", { flags: ["x28_keo_phe"], rel: -3, counters: { x28_cang: 1 } }, "Đông quân, nhà thành chiến trường"),
           C("Cấm cả nhà bàn chuyện bí", { flags: ["x28_cam_noi"], rel: 2 }, "Yên bữa cơm, chuyện dồn vào trong")]),
      ],
      [
        card("x28_cl_hat_giong", "Gói hạt giống ngày cưới", (c, k) => `${cap(k.npc("trong_tai"))} soi kính lúp vào hai quả bí và kết luận: chúng cùng một dòng hạt. Bạn chợt nhớ gói hạt giống ${k.scar("nguoi") || "một vị khách"} tặng trong ngày cưới, từ hồi bạn còn mải lo ${k.scar("do") || "chuyện làm ăn"}. Hai người đã chia đôi gói hạt rồi quên mất.`,
          (c) => [C(wed28(c) ? "Kể cho bạn đời nghe" : "Kể cho cả nhà nghe", { flags: ["x28_ke_hat"], counters: { x28_hoa: 2 } }, wed28(c) ? "Có thể làm lành, mất lợi thế" : "Nhẹ lòng, mất lợi thế"),
           C("Giữ bí mật, gieo nửa gói còn lại", { flags: ["x28_giu_hat"], counters: { x28_cang: 1 } }, "Có hạt gốc, thêm một điều phải giấu"),
           C("Mời người tặng hạt đến phân xử", { flags: ["x28_moi_nguoi_cu"], rel: 3 }, "Có người phân xử, chuyện cũ bị khơi")]),
      ],
      [
        card("x28_day_sau", "Sâu đục quả trước ngày thi", (c, k) => `Hai đêm trước hội thi, quả bí của bạn bị sâu đục một lỗ bằng đồng xu. ${!wed28(c) ? `Người duy nhất biết cách chữa là ${gone28(c)}, chỉ còn cuốn sổ phân bón để lại.` : c.flags.has("x28_doc_trom") ? "Bạn biết cách chữa nhờ cuốn sổ đọc trộm, nhưng dùng thì sẽ bị lộ." : `Chỉ có ${sp28(c, k.N)} biết cách chữa.`} ${k.gag()}`,
          (c) => [wed28(c) ? C("Xin bạn đời cứu quả bí", { flags: ["x28_nho_cuu"], counters: { x28_hoa: 2 } }, "Cứu được bí, nợ một lời cảm ơn")
              : C("Mở cuốn sổ phân bón người kia để lại", { flags: ["x28_nho_cuu"], counters: { x28_hoa: 2 } }, "Cứu được bí, nhớ người cũ"),
            C("Tự cứu, không cầu cạnh", { health: -2, flags: ["x28_tu_cuu"], counters: { x28_cang: 1 } }, "Giữ thể diện, quả bí có sẹo")]),
        card("x28_day_can_lai", "Cân lại từng năm", (c, k) => `${cap(k.npc("trong_tai"))} lật lại sổ cân của hội thi và phát hiện ba năm cân bị lệch: lẽ ra bạn mới là người thắng. ${cap(k.npc("ba_ban_phan"))} thì thú nhận đã bán cho cả hai người cùng một loại phân, dán hai cái nhãn khác nhau.`,
          [C("Đòi lại ba chiếc cúp", { flags: ["x28_doi_cup"], counters: { x28_cang: 2 } }, "Được công bằng, mất hòa khí"),
           C("Bỏ qua, coi như hòa", { flags: ["x28_bo_qua"], counters: { x28_hoa: 1 }, happy: 2 }, "Nhẹ lòng, mất ba chiếc cúp")]),
      ],
      [
        card("x28_ket", "Chung kết hội thi bí ngô", (c, k) => `Ngày chung kết, hai quả bí nằm cạnh nhau trên bàn cân, chênh nhau đúng một quả trứng gà. ${!wed28(c) ? `Quả bên kia là của ${gone28(c)}, bạn tự tay mang tới.` : cnt(c, "x28_cang") > cnt(c, "x28_hoa") ? `${cap(sp28(c, k.N))} không nhìn bạn.` : `${cap(sp28(c, k.N))} khẽ nắm tay bạn dưới gầm bàn.`} ${c.flags.has("x28_ke_hat") ? (wed28(c) ? "Hai quả bí cùng mọc từ một gói hạt, và cả hai người đều biết." : "Hai quả bí cùng mọc từ một gói hạt, như bạn từng kể.") : c.flags.has("x28_giu_hat") ? "Chỉ mình bạn biết hai quả bí cùng một gói hạt." : "Không ai nhắc tới gói hạt ngày cưới."} Còn ${noOr(c, k)} thì vẫn nằm đó, như quả bí thứ ba không ai muốn cân. ${k.gag()}`,
          (c) => {
            const agri = pathOpen("agritech", c.age);
            if (!wed28(c)) {
              const out: Choice[] = [ending(L28_CUP_MOT, "Thi bằng nửa gói hạt của người kia", "Có tiền thưởng, có một nỗi nhớ")];
              if (agri) out.push(ending(L28_TRAI_MOT, "Gộp hai nửa vườn, mở trại giống", "Thành nghề, mang tên cả hai người"));
              else out.push(ending(L28_BAN_VUON, "Bán hẳn nửa vườn bên kia, thôi thi", "Có tiền, vườn nhỏ lại"));
              return out;
            }
            const out: Choice[] = [ending(L28_TAN, "Chia vườn, chia luôn cuộc hôn nhân", "Hết chiến tranh, hết cả gia đình")];
            if (agri) out.push(ending(L28_TRAI, "Gộp vườn, mở trại giống bí ngô", "Thành nghề chung, cãi nhau cả đời"));
            out.push(ending(L28_CUP, "Thi chung một quả, giành giải lớn", "Có tiền thưởng, có nhau"));
            return out;
          }),
      ],
    ],
  }));

/* ======================================================================= X29 Lời hứa tuổi thơ */

const fr29 = (c: FactContext, N: Names): string => nameOr(N, c.cast.childhood_friend, "người bạn thân thời nhỏ");
const LOP_TRUONG = "người lớp trưởng cũ";

const L29_CUOI = land("x29_cuoi", "Hai người cưới nhau, đúng như tờ giấy kẻ ô đã hẹn. Lớp trưởng cũ lo trọn tiệc cưới và tính giá không bớt một đồng.", { custom: "marry", money: -1, happy: 10 });
const L29_BAN = land("x29_ban_than", "Hai người không cưới. Bạn chuyển hẳn tới thành phố của người bạn, thuê căn hộ cách một con hẻm, làm bạn thân đến già.", { custom: "move_city", happy: 5 });
const L29_LOP_TRUONG = land("x29_cuoi_lop_truong", "Bạn cưới luôn người lớp trưởng cũ, người đã dựng cổng hoa từ ba năm trước. Hóa ra ngay từ đầu, cổng hoa không dành cho ai khác.", { custom: "marry", money: -1, happy: 8 });

const X29 = weird("X29", "abs", ["tinh", "ky"],
  (c) => !c.married && !!c.cast.childhood_friend && c.age >= 32 && c.age <= 39,
  () => "Giữ lời hứa bốn mươi tuổi lấy nhau",
  (s, c, N) => ({
    title: "Hộp thư thời gian mở sớm",
    text: `Trường cũ phá dỡ dãy phòng học, nên hộp thư thời gian của lớp bạn được đào lên sớm. Trong đó có một tờ giấy kẻ ô, chữ của bạn và ${fr29(c, N)} hồi lớp năm: "Nếu bốn mươi tuổi chưa ai lấy ai thì hai đứa mình lấy nhau." Cả lớp đọc to giữa sân trường, rồi quay sang nhìn hai người còn độc thân duy nhất.`,
  }),
  season({
    id: "w_X29", vn: "Lời hứa tuổi thơ", color: "#e6a85c", years: [5, 8], weird: "abs",
    rules: { flags: ["w_loi_hua_tuoi_tho"], yearly: { money: -0.03 } },
    reset: { cast: [{ key: "lop_truong", role: "neighbor", label: LOP_TRUONG }, { key: "co_giao", role: "mentor", label: "cô giáo chủ nhiệm cũ" }] },
    gag: { key: "dem_nguoc", lines: [
      "Lớp trưởng cũ lập nhóm chat tên Đếm Ngược Đến Bốn Mươi. Nhóm có bốn mươi hai thành viên, chỉ hai người không được nói.",
      "Lớp trưởng cũ gửi báo giá tiệc cưới, kèm dòng chú thích: chưa cần trả lời, không trả lời là đồng ý.",
      "Nhóm chat đổi tên thành Sắp Bốn Mươi Rồi Đấy. Có người gửi ảnh tờ giấy kẻ ô đã được ép nhựa.",
      "Lớp trưởng cũ đã dựng xong cổng hoa đầu hẻm. Không ai biết cho đám cưới của ai.",
    ] },
    landings: [L29_CUOI, L29_BAN, L29_LOP_TRUONG],
    beats: [
      [
        card("x29_mo_san_truong", "Giữa sân trường", (c, k) => `Cả lớp đứng vòng quanh hai người, ai cũng giơ điện thoại. ${cap(fr29(c, k.N))} đỏ mặt nhìn tờ giấy, rồi nhìn bạn, rồi nhìn cột cờ như muốn trèo lên trốn. Lớp trưởng tuyên bố từ nay năm nào cả lớp cũng họp để theo dõi hai người, ai cũng đóng quỹ, riêng hai người đóng gấp đôi. ${k.gag()}`,
          [C("Cười trừ, bảo hồi đó còn bé", { flags: ["x29_cuoi_tru"], counters: { x29_ban: 1 } }, "Qua chuyện, người kia hơi buồn"),
           C("Nghiêm túc hẹn gặp riêng", { flags: ["x29_hen_rieng"], counters: { x29_tinh: 1 } }, "Mở một cánh cửa, cả lớp hóng"),
           C("Xé tờ giấy trước mặt mọi người", { flags: ["x29_xe_giay"], happy: -2, counters: { x29_ban: -1 } }, "Dứt khoát, hơi tàn nhẫn")]),
        card("x29_mo_ca_phe", "Bữa cà phê ngượng nhất đời", (c, k) => `${c.flags.has("x29_xe_giay") ? `${cap(fr29(c, k.N))} vẫn hẹn bạn đi cà phê, mang theo tờ giấy đã dán lại bằng băng keo.` : "Hai người ngồi đối diện ở quán cà phê gần trường, gọi hai ly giống hệt nhau như hồi lớp năm."} Mười lăm phút không ai nói gì, rồi cả hai cùng mở miệng một lúc.`,
          [C("Thỏa thuận coi như trò đùa", { flags: ["x29_tro_dua"], counters: { x29_ban: 1 } }, "Nhẹ nhõm, có gì đó hơi tiếc"),
           C("Thử hẹn hò một năm cho biết", { flags: ["x29_thu_hen"], counters: { x29_tinh: 2 } }, "Có thể thành, có thể mất một người bạn")]),
      ],
      [
        card("x29_kd_nguoi_la", "Người lạ trong ảnh", (c, k) => `${cap(fr29(c, k.N))} đăng ảnh đi du lịch với một người lạ, cả lớp lập tức phân tích từng góc chụp. ${c.flags.has("x29_thu_hen") ? "Người lạ hóa ra là anh họ, nhưng bạn đã kịp mất ngủ hai đêm." : "Bạn bất ngờ thấy khó chịu, dù chẳng có lý do nào."} ${k.gag()}`,
          [C("Nhắn tin chúc mừng thật lòng", { flags: ["x29_chuc_mung"], counters: { x29_ban: 1 } }, "Giữ tình bạn, giấu một chút ghen"),
           C("Hỏi thẳng người trong ảnh là ai", { flags: ["x29_ghen"], counters: { x29_tinh: 1 } }, "Lộ cảm xúc, có câu trả lời")]),
        card("x29_kd_co_giao", "Bản sao của cô giáo", (c, k) => `${cap(k.npc("co_giao"))}, giờ đã ngoài bảy mươi, mời hai người tới nhà và lấy ra bản sao tờ giấy cô giữ gần ba mươi năm. Cô kể: hôm đó chính bạn viết trước, còn ${fr29(c, k.N)} chỉ ký vào vì sợ bạn khóc.`,
          [C("Nhận là mình viết trước", { flags: ["x29_nhan_viet"], counters: { x29_tinh: 1 }, happy: 2 }, "Thật thà, đỏ mặt"),
           C("Khăng khăng là người kia viết", { flags: ["x29_choi_cai"], counters: { x29_ban: 1 } }, "Giữ thể diện, cô giáo bật cười")]),
      ],
      [
        card("x29_cl_loi_khuyen", "Lời khuyên của người cũ", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} nghe hết câu chuyện rồi nói một câu bạn không quên được: hứa với trẻ con là hứa thật. Tối đó ${fr29(c, k.N)} gọi điện, nhắc lại chuyện ${k.scar("do") || "những ngày cũ"}, chuyện mà bạn tưởng chỉ mình còn nhớ.`,
          [C("Nghe lời khuyên, nghĩ cho nghiêm túc", { flags: ["x29_nghiem_tuc"], counters: { x29_tinh: 2 } }, "Nghiêm túc thật, hết đường đùa"),
           C("Cười cho qua, bảo người cũ lẩm cẩm", { flags: ["x29_gat_di"], counters: { x29_ban: 1 } }, "Giữ an toàn, giữ cả nỗi day dứt")]),
      ],
      [
        card("x29_day_dem_truoc", "Đêm ngồi trên mái nhà", (c, k) => `Đêm trước sinh nhật thứ ${c.age + 1}, bạn ngồi một mình trên mái nhà, điện thoại rung liên tục. ${c.flags.has("x29_thu_hen") ? "Một năm hẹn hò thử đã qua từ lâu, không ai nhắc tới kết quả." : "Hai người vẫn gặp nhau mỗi tuần, như chưa có tờ giấy nào."} ${k.gag()}`,
          [C("Gọi điện nói thật lòng", { flags: ["x29_to_tinh"], counters: { x29_tinh: 2 } }, "Hết đường lùi, có thể là đường tới"),
           C("Rủ cả lớp đi chơi cho khỏi phải nói", { flags: ["x29_ru_ca_lop"], counters: { x29_ban: 1 }, money: -0.05 }, "Vui, an toàn, chưa xong chuyện")]),
        card("x29_day_hai_nha", "Hai gia đình đã gặp nhau", () => "Hóa ra gia đình hai bên đã gặp nhau từ tháng trước, bàn xong ngày cưới, danh sách khách và món tráng miệng. Chỉ còn hai nhân vật chính là chưa ai hỏi ý.",
          [C("Để hai nhà lo, mình lo phần mình", { flags: ["x29_de_nha_lo"], counters: { x29_tinh: 1 } }, "Nhanh, nhưng chưa chắc là ý mình"),
           C("Nói rõ với hai bên, đừng ép", { flags: ["x29_noi_ro"], rel: 2, counters: { x29_ban: 1 } }, "Giữ quyền quyết, làm phật lòng")]),
      ],
      [
        card("x29_ket", "Tờ giấy kẻ ô trước cổng", (c, k) => `${c.age === 40 ? "Sáng sinh nhật bốn mươi" : c.age > 40 ? `Đã quá hạn bốn mươi tuổi ${c.age - 40} năm, một sáng` : "Còn chưa tới bốn mươi, nhưng một sáng"}, ${fr29(c, k.N)} đứng trước cổng nhà bạn, tay cầm tờ giấy kẻ ô. ${c.flags.has("x29_to_tinh") ? "Cuộc điện thoại đêm nọ vẫn chưa có hồi âm." : c.flags.has("x29_xe_giay") ? "Vết băng keo trên tờ giấy đã ngả vàng." : "Tờ giấy vẫn phẳng phiu như ngày đào lên."} ${cnt(c, "x29_tinh") > cnt(c, "x29_ban") ? "Hai người đều biết câu trả lời, chỉ chưa ai nói ra." : "Hai người đều sợ làm hỏng gần ba mươi năm làm bạn."} Còn ${k.scar("no") || "lời hứa cũ"} thì vẫn chờ, như mọi lời hứa khác bạn từng ký. ${k.gag()}`,
          (c, k) => {
            const fr = nameOr(k.N, c.cast.childhood_friend, "");
            const lt = k.npc("lop_truong");
            const ltName = lt === LOP_TRUONG || lt === "một người mới quen" ? "" : lt;
            return [wed(L29_CUOI, "Giữ lời hứa, cưới nhau", "Có nhau, mất một người bạn thân thuần túy", fr || null),
              ending(L29_BAN, "Làm bạn thân đến già, ở gần nhau", "Giữ tình bạn, đổi thành phố"),
              wed(L29_LOP_TRUONG, "Cưới luôn người dựng cổng hoa", "Bất ngờ cho cả lớp, kể cả bạn", ltName || null)];
          }),
      ],
    ],
  }));

/* ======================================================================= X30 Kẻ thù lông vũ */

const nb30 = (c: FactContext, N: Names): string => nameOr(N, c.cast.neighbor, "người hàng xóm");

const L30_DON = land("x30_don_nha", "Bạn dọn lên thành phố cho xa con ngỗng. Ba tuần sau, Đại Tá xuất hiện ở bến xe, đeo đúng cái chuông của tòa.", { custom: "move_city", flags: ["x30_ngong_ca_doi"] });
const L30_MUA = land("x30_mua_ngong", "Bạn trả nhà bên một khoản lớn để mua lại Đại Tá, xây cho nó cái chuồng có mái che. Nó vẫn cắn bạn mỗi sáng, nhưng giờ là ngỗng nhà.", { money: -1, happy: 3, flags: ["x30_ngong_ca_doi"] });
const L30_VET = land("x30_hoc_thu_y", "Bạn đi học làm bác sĩ thú y, chỉ để hiểu ngỗng nghĩ gì. Bệnh nhân đầu tiên của bạn là Đại Tá.", { custom: "become:vet", flags: ["x30_ngong_ca_doi"] });

const X30 = weird("X30", "abs", ["luat", "ky"],
  (c) => !!c.cast.neighbor && c.age >= 20 && c.age <= 70 &&
    (c.flags.has("rural") || c.flags.has("origin_poor_rural") || c.farmer || c.owns.has("land") || c.flags.has("orchard")),
  () => "Kiện con ngỗng nhà bên ra tòa",
  (s, c, N) => ({
    title: "Bị cáo có lông vũ",
    text: `Con ngỗng tên Đại Tá của ${nb30(c, N)} đã cắn bạn mười bảy lần trong một năm, lần gần nhất ngay trước cổng chợ. Bạn làm đơn kiện, và lần đầu tiên ở ${s.noi || "vùng này"}, tòa xử một con ngỗng. Đại Tá thua, phải đeo chuông và giữ cách bạn mười mét, nhưng lúc ra khỏi tòa nó quay lại nhìn bạn rất lâu. "Nó nhớ mặt rồi đấy," ${nb30(c, N)} nói khẽ.`,
  }),
  season({
    id: "w_X30", vn: "Kẻ thù lông vũ", color: "#c9a227", years: [8, 12], weird: "abs",
    rules: { flags: ["w_ke_thu_long_vu"], yearly: { happy: -1 } },
    reset: { cast: [{ key: "luat_su_ngong", role: "rival", label: "cô luật sư chuyên bênh vật nuôi" }, { key: "thay_vo", role: "mentor", label: "ông thầy võ chuyên đuổi ngỗng" }] },
    gag: { key: "dai_ta", lines: [
      "Bạn mở cửa sổ. Đại Tá đang đứng dưới gốc cây, nhìn lên, không chớp mắt.",
      "Bạn đi ăn cưới ở làng bên. Đại Tá đã đứng sẵn cạnh cổng hoa, đeo cái chuông của tòa.",
      "Bạn chuyển chỗ ngồi uống trà ra sau nhà. Sáng hôm sau, trên ghế có một chiếc lông ngỗng.",
      "Đại Tá già rồi, đi chậm hơn, nhưng vẫn đi theo bạn. Bạn bắt đầu đi chậm lại cho nó theo kịp.",
    ] },
    landings: [L30_DON, L30_MUA, L30_VET],
    beats: [
      [
        card("x30_mo_chuong", "Mười mét và một cái chuông", (c, k) => `Từ hôm tòa xử, Đại Tá đeo chuông và giữ đúng khoảng cách mười mét, không hơn không kém. Bạn đi chợ, nó đi theo. Bạn dừng, nó dừng. ${k.gag()}`,
          [C("Đổi đường đi mỗi ngày", { flags: ["x30_doi_duong"], bw: -2 }, "Đỡ chạm mặt, mệt đầu"),
           C("Quay lại nhìn thẳng vào mắt nó", { flags: ["x30_nhin_thang"], counters: { x30_thu: 1 } }, "Giữ thể diện, chiến tranh leo thang"),
           C("Mang bánh mì ra làm hòa", { flags: ["x30_banh_mi"], counters: { x30_hoa: 1 } }, "Có thể hòa, có thể bị cắn")]),
        card("x30_mo_khang_cao", "Hàng xóm kháng cáo", (c, k) => `${cap(nb30(c, k.N))} thuê ${k.npc("luat_su_ngong")} kháng cáo, lập luận rằng Đại Tá chỉ "bảo vệ lãnh thổ một cách nhiệt tình". Hồ sơ kèm cả giấy khen của Đại Tá hồi nó giữ vườn năm ngoái.`,
          [C("Thuê luật sư cãi lại", { money: -0.2, flags: ["x30_thue_ls"], counters: { x30_thu: 1 } }, "Có người cãi, mất tiền"),
           C("Đề nghị hòa giải ngay tại vườn", { flags: ["x30_hoa_giai"], counters: { x30_hoa: 1 }, rel: 2 }, "Có thể yên, phải ngồi cạnh Đại Tá")]),
      ],
      [
        card("x30_kd_bon_gio", "Bốn giờ sáng", (c, k) => `Đúng bốn giờ sáng mỗi ngày, Đại Tá đứng dưới cửa sổ phòng ngủ kêu ba tiếng, nghỉ, rồi kêu ba tiếng nữa, như đánh điện báo. ${cap(k.npc("thay_vo"))} đi ngang, nói có thể dạy bạn vài thế. ${k.gag()}`,
          [C("Học võ với ông thầy đuổi ngỗng", { flags: ["x30_hoc_vo"], health: 3, counters: { x30_thu: 1 } }, "Khỏe người, Đại Tá cũng tập"),
           C("Mua nút tai, ngủ tiếp", { money: -0.02, flags: ["x30_nut_tai"] }, "Ngủ được, thua một hiệp")]),
        card("x30_kd_ngong_con", "Sáu con ngỗng con", () => "Mùa xuân, Đại Tá có sáu con ngỗng con. Cả sáu đứa đều đi theo bạn, cũng đúng mười mét, như đã được dặn kỹ.",
          [C("Nhận nuôi một con cho đỡ căng", { flags: ["x30_nuoi_con"], counters: { x30_hoa: 2 } }, "Có một con ngỗng phe mình, Đại Tá nghi ngờ"),
           C("Xin tòa mở rộng lệnh cho cả đàn", { money: -0.05, flags: ["x30_lenh_ca_dan"], counters: { x30_thu: 1 } }, "Đúng luật, cả xóm cười")]),
      ],
      [
        card("x30_cl_dem_chay", "Đêm cháy bếp", (c, k) => `Một đêm bếp nhà bạn bắt lửa. Đại Tá là con vật đầu tiên kêu lên, đập cánh vào cửa đến khi ${k.scar("nguoi") || "một người quen cũ"} đang ngủ nhờ nhà bạn tỉnh dậy. Lửa tắt, bếp cháy xém, nhưng những gì bạn mang theo từ đời cũ vẫn còn nguyên${k.scar("do") ? `, kể cả chuyện ${k.scar("do")}` : ""}.`,
          [C("Cảm ơn Đại Tá trước cả xóm", { flags: ["x30_cam_on"], counters: { x30_hoa: 2 }, happy: 3 }, "Hòa giải, mất thế thắng kiện"),
           C("Vẫn giữ lệnh mười mét", { flags: ["x30_giu_lenh"], counters: { x30_thu: 1 } }, "Đúng luật, hơi bạc"),
           C("Rút đơn kiện cũ", { flags: ["x30_rut_don"], counters: { x30_hoa: 1 }, money: -0.05 }, "Hết lệnh, hết chuông, hết giới hạn")]),
      ],
      [
        card("x30_day_kien_nguoc", "Phiên tòa thứ hai", (c, k) => `${cap(nb30(c, k.N))} kiện ngược bạn: Đại Tá sụt hai lạng vì "căng thẳng kéo dài do bị theo dõi". ${cap(k.npc("luat_su_ngong"))} trình ra một chiếc lông rụng làm tang vật. ${c.flags.has("x30_thue_ls") ? "Luật sư của bạn xin hoãn vì dị ứng lông vũ." : "Lần này bạn không có luật sư nào bên cạnh."} ${k.gag()}`,
          [C("Nhận lỗi, bồi thường cho êm", { money: -0.2, flags: ["x30_boi_thuong"], counters: { x30_hoa: 1 } }, "Yên chuyện, mất tiền và thể diện"),
           C("Cãi đến cùng", { money: -0.1, flags: ["x30_cai_den_cung"], counters: { x30_thu: 2 } }, "Có thể thắng, chắc chắn kéo dài")]),
        card("x30_day_om", "Đại Tá ốm", (c) => `Một sáng không nghe tiếng chuông. Đại Tá nằm co dưới gốc cây đầu ngõ, không kêu, không cắn ai. ${cnt(c, "x30_thu") > cnt(c, "x30_hoa") ? "Bạn thấy hụt hẫng lạ lùng, như mất một đối thủ cờ." : "Bạn thấy lo, và tự ngạc nhiên vì mình lo."}`,
          [C("Bế Đại Tá đi bác sĩ thú y", { money: -0.05, flags: ["x30_cuu_ngong"], counters: { x30_hoa: 2 } }, "Cứu kẻ thù, bị cắn trên đường đi"),
           C("Để nhà bên tự lo", { flags: ["x30_mac_ke"], counters: { x30_thu: 1 }, happy: -2 }, "Đúng lý, day dứt")]),
      ],
      [
        card("x30_ket", "Bao năm, mười mét", (c, k) => `Bao năm đã qua, Đại Tá già, lông cổ bạc trắng, nhưng vẫn giữ đúng mười mét. ${cnt(c, "x30_hoa") > cnt(c, "x30_thu") ? "Có hôm nó đứng gần hơn một chút, rồi lùi lại như ngượng." : "Mắt nó vẫn sắc như ngày đầu."} ${c.flags.has("x30_nuoi_con") ? "Con ngỗng nhỏ bạn nhận nuôi năm nào giờ đứng đúng giữa hai bên." : "Sáu con ngỗng con năm nào giờ đã thành một đàn canh cổng."} Còn ${noOr(c, k)} thì cũng theo bạn dai dẳng không kém con ngỗng. ${k.gag()}`,
          (c) => {
            const out: Choice[] = [ending(L30_DON, "Dọn lên thành phố cho xa Đại Tá", "Đổi chỗ ở, không đổi được kẻ thù"),
              ending(L30_MUA, "Mua lại Đại Tá làm ngỗng nhà", "Tốn một khoản lớn, có một kẻ thù trong nhà")];
            if (pathOpen("vet", c.age)) out.push(ending(L30_VET, "Đi học làm bác sĩ thú y", "Đổi nghề vì một con ngỗng"));
            return out;
          }),
      ],
    ],
  }));

export const ABS_21: WeirdBranch[] = [X21, X22, X23, X24, X25, X26, X27, X28, X29, X30];
