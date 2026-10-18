/**
 * Nhánh kỳ dị X41–X50 (spec 2026-10-18-canon-event §7b). Cách viết: xem đầu canon/kit.ts.
 * Giọng: sitcom phi lý cực độ. Chuyện vô lý xảy ra giữa phòng họp, đám tang, quán ăn, phòng khách; người trong
 * truyện đối xử với nó nghiêm túc tuyệt đối. Không người thật, không địa điểm hay thương hiệu có thật.
 */
import type { Choice, FactContext } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import type { Landing } from "../Season.ts";
import { PATHS } from "../../paths/registry.ts";
import { C, cap, card, ending, finale as kitFinale, land, noOr, season, weird } from "../kit.ts";

const ac = (c: FactContext): string => (c.sex === "M" ? "anh" : "chị");
const bm = (c: FactContext): string => (c.sex === "M" ? "bố" : "mẹ");
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;
const f = (c: FactContext, k: string): boolean => c.flags.has(k);
const vn = (c: FactContext): boolean => c.country === "VN";

/** Việc làm công ăn lương (có công ty, phòng kế toán, ghế giám đốc). */
const WAGE_JOBS = ["job_office", "job_factory", "job_teach", "job_health", "job_tech"];
/** Con đường đời không phải làm thuê cho công ty: tự làm chủ, buôn bán, nghệ sĩ tự do, tu hành, tị nạn, phạm pháp. */
const NON_WAGE_PATHS = new Set([
  "smuggler", "loan_shark", "scammer", "gangster", "gambler", "counterfeiter", "hacker", "ex_convict",
  "monk", "priest", "refugee", "streamer", "influencer", "vlogger", "painter", "writer", "folk_musician", "comedian",
  "barber", "fortune_teller", "street_vendor", "restaurateur", "startup", "ecommerce", "factory_owner", "investor",
  "border_trader", "real_estate", "ride_hailing", "shipper", "waste_picker", "agritech", "fish_farmer", "homemaker",
  "artisan", "herbalist", "baker", "deep_fisher", "explorer", "activist", "climber", "chess",
]);
/** Người làm công ăn lương: có việc ở công ty/xưởng/trường/viện (cờ job_* hoặc c.worker), không tự làm chủ, không đi con đường ngoài biên chế. */
const wageEarner = (c: FactContext): boolean =>
  c.has_job && !c.farmer && (WAGE_JOBS.some((x) => f(c, x)) || c.worker)
  && !f(c, "own_business") && !f(c, "shop_active") && !f(c, "job_market")
  && !Object.keys(PATHS).some((id) => NON_WAGE_PATHS.has(id) && f(c, "life_" + id));

/** Một lựa chọn chung kết; `path` = id nghề trong PATHS khi landing là become:<path>. */
interface Opt { l: Landing; label: string; hint: string; path?: string }
const O = (l: Landing, label: string, hint: string, path?: string): Opt => (path ? { l, label, hint, path } : { l, label, hint });
/**
 * Lựa chọn chung kết: tối đa 2 landing nghề còn mở theo tuổi, rồi các landing không phải nghề (luôn mở, ≥ 2 cái)
 * cho đủ 3. Nhờ vậy ở mọi tuổi luôn có ≥ 2 lựa chọn và ≥ 1 landing không phải nghề.
 */
const finale = (c: FactContext, careers: Opt[], rest: Opt[]): Choice[] => {
  const ch = (o: Opt) => ending(o.l, o.label, o.hint);
  return kitFinale(c.age, careers.filter((o) => !!o.path).map(ch), rest.map(ch));
};

/* ================================================================ X41: ngồi nhầm ghế giám đốc */

const L41_QL = land("x41_quan_ly", "Cổ đông bầu bạn làm giám đốc thật. Tấm bảng đồng cuối cùng cũng khắc đúng tên bạn, và không ai phải lau quanh nó nữa.",
  { custom: "become:factory_owner", happy: 5 }); // gần nhất: không có nghề quản lý, chủ xưởng ô gần nhất
const L41_LO = land("x41_lo", "Bạn đứng dậy khỏi ghế trước mặt mọi người. Công ty đòi lại một phần lương, bạn mất việc, nhưng đêm đó ngủ một mạch tới sáng.",
  { custom: "job_lose", money: -1.5, happy: 4 });
const L41_THUONG = land("x41_giu_ghe_am", "Giám đốc thật trả bạn một khoản thưởng vì đã giữ ghế ấm mấy năm liền, rồi xin bạn đừng bao giờ lên tầng này nữa.",
  { money: 2, happy: 3 });

const X41 = weird("X41", "abs", ["ky", "danh", "tien"],
  // Làm công trong một công ty có phòng họp, cổ đông (xem wageEarner).
  (c) => wageEarner(c) && c.age >= 22 && c.age <= 58,
  () => "Ngồi yên trên chiếc ghế da đầu bàn họp",
  (s, c) => ({
    title: "Chiếc ghế không ai dám ngồi",
    text: `Nếu bạn đứng dậy lúc này, cả phòng sẽ biết bạn chỉ đi nhầm tầng. Bạn ngồi vào chiếc ghế da duy nhất còn trống ở đầu bàn, ngay sau tấm bảng đồng khắc chữ "Giám đốc". Mười hai người đồng loạt đứng bật dậy, một người run run đẩy tập hồ sơ tới: "Thưa ${ac(c)}, cả công ty chờ ${ac(c)} ba tháng nay rồi."`,
  }),
  season({
    id: "w_X41", vn: "Giám đốc ngồi nhầm", color: "#d9962b", years: [6, 10], weird: "abs",
    rules: { income: 1.8, flags: ["w_wrong_chair"] },
    reset: { cast: [
      { key: "thu_ky", role: "partner", label: "cô thư ký mặt không cảm xúc" },
      { key: "pho_gd", role: "rival", label: "ông phó giám đốc" },
    ] },
    gag: { key: "bang_dong", lines: [
      "Tấm bảng đồng trên bàn vẫn khắc tên một người khác. Không ai nhìn vào nó, kể cả bạn.",
      "Ai đó lau tấm bảng đồng bóng loáng, cẩn thận lau vòng quanh cái tên không phải của bạn.",
      "Tấm bảng đồng được thay mới. Vẫn là cái tên cũ, chỉ có chữ to hơn.",
      "Bạn lật úp tấm bảng đồng. Sáng hôm sau nó lại dựng thẳng, như có người trực đêm chỉ để làm việc đó.",
    ] },
    landings: [L41_QL, L41_LO, L41_THUONG],
    beats: [
      /* mo_man */
      [
        card("x41_mo_hop", "Cuộc họp đầu tiên ở đầu bàn", (c, k) => `Cuộc họp đầu tiên kéo dài bốn tiếng về mẫu ô che mưa mới, và cứ hết một câu, mười hai cái đầu lại quay về phía bạn chờ gật. ${k.gag()} Đến trang cuối, ai đó xin ý giám đốc về màu của cán ô.`,
          [C("Gật đầu với mọi đề xuất", { flags: ["x41_gat"], happy: 2, counters: { x41_lo: 1 } }, "Yên chuyện hôm nay, ai cũng thấy bạn dễ dãi lạ thường"),
           C("Hỏi thật: bán ô để làm gì?", { flags: ["x41_hoi_that"], know: 3, pressure: { ky: 1 } }, "Câu hỏi ngớ ngẩn, có thể thành chiến lược")]),
        card("x41_mo_thu_ky", "Người thư ký biết hết", (c, k) => `Tan họp, ${k.npc("thu_ky")} khép cửa, đặt trước mặt bạn một cuốn lịch dày cộp và một cốc trà. "Tôi biết ${ac(c)} không phải giám đốc. Tôi làm việc cho cái ghế, không làm cho người." Rồi cô chỉ vào dòng đầu tiên: chín giờ sáng mai, tiếp đối tác nước ngoài.`,
          [C("Nhờ cô ấy dạy việc từ đầu", { flags: ["x41_dong_minh"], know: 2, bw: -2 }, "Có đồng minh, nợ một người nắm bí mật"),
           C("Giả vờ như mình biết hết", { flags: ["x41_gia_vo"], counters: { x41_lo: 1 }, happy: 1 }, "Giữ thể diện, ngày nào cũng suýt lộ")]),
      ],
      /* khoi_dong */
      [
        card("x41_kd_luong", "Phiếu lương thêm một số không", (c, k) => `Phiếu lương tháng đầu dài hơn lương cũ của bạn đúng một con số không. ${k.gag()} Phòng kế toán hỏi có chia thưởng quý như giám đốc cũ năm nào cũng làm không.`,
          [C("Gửi tiết kiệm, phòng ngày bị lộ", { money: 0.5, flags: ["x41_de_danh"] }, "Có của để dành, cả xưởng thấy bạn lạnh lùng"),
           C("Chia thưởng cho cả xưởng", { money: 0.15, rel: 4, counters: { x41_long_dan: 2 }, flags: ["x41_chia_thuong"] }, "Được lòng thợ, túi mỏng hơn")]),
        card("x41_kd_pho", "Ông phó đếm bước chân", (c, k) => `${cap(k.npc("pho_gd"))} làm ở đây hai mươi năm và nhớ dáng đi của giám đốc thật. Ông bắt đầu đứng ở hành lang mỗi sáng, đếm bước chân bạn, ghi vào một cuốn sổ nhỏ. Hôm nay ông hỏi rất nhẹ: "Giám đốc vẫn uống cà phê không đường chứ?"`,
          [C("Mời ông đi ăn trưa, nói thẳng", { flags: ["x41_pho_biet"], counters: { x41_lo: 1 } }, "Bớt một kẻ rình, thêm một người nắm thóp"),
           C("Giao ông dự án khó nhất năm", { flags: ["x41_day_pho"] }, "Ông bận tối mặt, và ghét bạn hơn")]),
      ],
      /* cu_lat */
      [
        card("x41_cl_nguoi_that", "Giám đốc thật gọi về", (c, k) => `Bản tin nội bộ in ảnh bạn trên ghế giám đốc, và ${k.scar("nguoi") || "một người quen cũ"} là người đầu tiên gọi tới, cười không thở được. Tối đó máy bàn reo: giám đốc thật đang đi câu ở một hòn đảo xa và muốn ở lại thêm vài năm.${f(c, "x41_dong_minh") ? " Cô thư ký chuyển máy cho bạn mà không hỏi một câu." : ""} "Ghế hợp với ai thì người đó ngồi," ông nói, rồi hỏi bạn về ${k.scar("do") || "thứ bạn mang theo từ đời cũ"}, như thể đã nghe kể từ lâu và tin chính nó đưa bạn tới cái ghế.`,
          [C("Nhận lời giữ ghế thêm vài năm", { flags: ["x41_giu_ghe"], money: 0.2, counters: { x41_lo: 1 } }, "Thêm vài năm lương cao, thêm vài năm sợ lộ"),
           C("Xin ông về công bố sự thật", { flags: ["x41_thu_thuc"], counters: { x41_that: 2 }, happy: 2 }, "Nhẹ người, có thể mất ghế ngay mai")]),
      ],
      /* day */
      [
        card("x41_day_kiem_tra", "Đoàn kiểm tra hỏi chữ ký", (c, k) => `Đoàn kiểm tra mở sổ, thấy chữ ký của giám đốc đổi hẳn từ mấy năm nay.${n(c, "x41_lo") >= 2 ? " Họ hỏi thẳng tên bạn, vì tin đồn về vị giám đốc lạ mặt đã lan tới tận cổng xưởng." : ""} ${k.gag()} ${f(c, "x41_pho_biet") ? `${cap(k.npc("pho_gd"))} ngồi cuối phòng, khoanh tay, chưa quyết sẽ bênh ai.` : "Cả phòng nín thở, không ai dám nói giám đốc thật là ai."}`,
          [C("Ký bằng tên thật của mình", { flags: ["x41_ky_that"], counters: { x41_that: 1 }, happy: -2 }, "Thật thà, mở cửa cho mọi câu hỏi"),
           C("Ký nguệch ngoạc cho không ai đọc ra", { flags: ["x41_ky_nguech"], secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 6], note: "chữ ký nguệch ngoạc trên ghế giám đốc" } }, "Qua kỳ kiểm tra, để lại một quả bom hẹn giờ")]),
        card("x41_day_lo", "Quý lỗ đầu tiên", (c, k) => `Mùa mưa năm nay đến muộn, kho ô chất cao tới trần, công ty lỗ lần đầu. ${cap(k.npc("pho_gd"))} đặt lên bàn danh sách cắt một nửa số thợ${f(c, "x41_day_pho") ? ", mặt hả hê của người vừa ôm trọn dự án khó nhất năm mà vẫn sống sót" : ""}. ${n(c, "x41_long_dan") >= 2 ? "Ngoài cửa sổ, đám thợ từng nhận thưởng của bạn đang đứng chờ tin." : "Ngoài cửa sổ, đám thợ chưa từng thấy mặt bạn đang đứng chờ tin."}`,
          [C("Ký danh sách cắt giảm", { money: 0.2, rel: -5, flags: ["x41_cat_tho"] }, "Cứu sổ sách, mất lòng cả xưởng"),
           C("Giữ thợ, cắt lương chính mình", { money: -0.3, counters: { x41_long_dan: 2 }, flags: ["x41_cat_luong"] }, "Mất tiền, được những người sẽ đứng sau bạn")]),
      ],
      /* chung_ket */
      [
        card("x41_ket", "Đại hội cổ đông", (c, k) => `Đại hội cổ đông, ghế đầu bàn có hai người cùng tới: bạn, và giám đốc thật da cháy nắng, tay xách giỏ cá. ${k.gag()} ${n(c, "x41_that") >= 2 ? "Vì bạn nói thật từ trước, cả hội trường đã biết chuyện, chỉ còn chờ bỏ phiếu." : "Cả hội trường lần đầu biết chuyện, xôn xao như chợ."} Trong đầu bạn vẫn là ${noOr(c, k)}, chưa trả xong.`,
          (c) => finale(c,
            [O(L41_QL, "Ra ứng cử làm giám đốc thật", "Thành người quản lý, bị soi từng bước", "factory_owner")],
            [O(L41_LO, "Đứng dậy, trả lại ghế", "Mất việc, mất lương, hết phải giả vờ"),
             O(L41_THUONG, "Nhận thưởng giữ ghế rồi rút lui", "Có một khoản lớn, không còn chỗ ở công ty")])),
      ],
    ],
  }),
  "Lương giám đốc, sống mỗi ngày như sắp bị lộ",
);

/* ================================================================ X42: đám tang của ông thành buổi hòa nhạc bán vé */

/** Người đã khuất: một nhãn cố định cho cả cửa, biến cố và mọi thẻ (không đổi theo tuổi). */
const ong42 = (): string => "ông cả trong họ";

const L42_SK = land("x42_to_chuc", "Bạn có công ty lo tang lễ đầu tiên trong vùng có ban kèn riêng. Khách đặt lịch từ lúc người nhà còn khỏe re.",
  { custom: "become:funeral_worker", happy: 4 }); // gần nhất: không có nghề tổ chức sự kiện
const L42_NHAC = land("x42_san_khau", "Bạn bỏ phần tổ chức, giữ lại cây kèn. Ban của bạn đi diễn khắp nơi, đám cưới cũng mời, đám tang cũng mời.",
  { custom: "become:folk_musician", happy: 5 }); // gần nhất
const L42_BAN = land("x42_ban_cty", "Bạn bán lại công việc cho một bên lớn hơn, kèm cả bảng giá lẫn danh bạ ban kèn. Khoản tiền đủ để sống chậm vài năm.",
  { money: 2, happy: 2 });
const L42_QUY = land("x42_quy_xom", "Bạn giao hết đồ nghề và tiền lãi cho quỹ của xóm. Từ nay buổi tiễn nào ở đây cũng có kèn, không ai phải mua vé.",
  { money: -1, rel: 8, happy: 5 });

const X42 = weird("X42", "abs", ["ky", "danh", "mau"],
  (c) => c.age >= 18 && c.age <= 66 && c.pressure.danh >= 2 && (f(c, "parent_died") || c.parents_alive < 2 || c.parent_old),
  (s, c) => `Bán vé cho buổi tiễn ${ong42()}`,
  (s, c) => ({
    title: "Đám tang bán hết vé",
    text: `Nếu buổi tiễn này không đủ vui, ${ong42()} đã dặn sẽ về hỏi tội từng đứa. Tờ di chúc dán trên nắp quan tài ghi rõ: phải có kèn, có trống, có ít nhất một bài để nhảy. Người đến viếng đông tới mức tràn ra ${s.noi ? `đường lớn ở ${s.noi}` : "đường lớn"}, và một cậu bé đã đứng bán vé ở cổng từ sáng: "Vé đứng hay vé ngồi ạ?"`,
  }),
  season({
    id: "w_X42", vn: "Ông bầu tang lễ", color: "#e08a2e", years: [5, 9], weird: "abs",
    rules: { income: 1.1, flags: ["w_funeral_impresario"] },
    reset: { cast: [
      { key: "ban_nhac", role: "partner", label: "anh trưởng ban kèn đồng" },
      { key: "ba_khoc", role: "rival", label: "bà hát tang lễ lâu năm" },
    ] },
    gag: { key: "di_chuc_them", lines: [
      "Trong túi áo vest của ông có thêm một trang di chúc: \"Không được hát bài buồn quá ba phút.\"",
      "Lại thêm một trang di chúc, kẹp trong cuốn sổ hát: \"Ai khóc thì khóc cho đúng nhịp.\"",
      "Trang di chúc thứ năm rơi ra từ hộp đàn: \"Đừng bán vé đắt quá, ông ngại.\"",
      "Không ai tìm được thêm trang di chúc nào nữa. Cả nhà hơi buồn, như mất ông thêm một lần.",
    ] },
    landings: [L42_SK, L42_NHAC, L42_BAN, L42_QUY],
    beats: [
      /* mo_man */
      [
        card("x42_mo_hop_banh", "Tiền vé trong hộp bánh", (c, k) => `Buổi tiễn ${ong42()} kết thúc lúc nửa đêm bằng một vòng nhảy của cả xóm, tiền vé đựng đầy ba hộp bánh quy. ${k.gag()} Cả họ ngồi quanh mấy cái hộp, không ai dám đếm trước.`,
          [C("Góp tiền vé làm quỹ cho xóm", { rel: 4, flags: ["x42_quy_xom"] }, "Được tiếng tốt, trắng tay"),
           C("Trả công ban kèn, giữ phần dư", { money: 0.2, flags: ["x42_giu_tien"], counters: { x42_show: 1 } }, "Có vốn, cả họ xì xào")]),
        card("x42_mo_dat_lich", "Người lạ xin đặt lịch", (c, k) => `Ba hôm sau, một bà cụ ở xóm bên chống gậy sang, đưa ảnh chồng mình: ông ấy cũng thích nhảy, cũng ghét khóc. "Làm cho ông nhà bà một buổi như thế được không?" ${cap(k.npc("ban_nhac"))} đứng sau bà, đã ôm sẵn kèn.`,
          [C("Nhận lời, lần này có lấy tiền công", { money: 0.1, counters: { x42_show: 1 }, flags: ["x42_nhan_viec"] }, "Thành nghề, thành chuyện của cả phố"),
           C("Làm giúp miễn phí một lần", { rel: 3, flags: ["x42_lam_giup"] }, "Tử tế, nhưng mai lại có người khác tới")]),
      ],
      /* khoi_dong */
      [
        card("x42_kd_ba_khoc", "Đối thủ trong bộ đồ tang", (c, k) => `${cap(k.npc("ba_khoc"))} chặn bạn ở đầu ngõ, ${vn(c) ? "khăn tang còn trên đầu" : "bộ đồ đen còn chưa thay"}. Bốn mươi năm bà hát những bài buồn ở các đám tang, chưa ai dám tiễn người ta bằng điệu nhảy. ${k.gag()} "${c.sex === "M" ? "Cậu" : "Cô"} cướp nồi cơm của tôi," bà nói, giọng vẫn ngân như đang khóc.`,
          [C("Mời bà vào đội, làm giọng chính", { flags: ["x42_ba_vao_doi"], counters: { x42_show: 1 } }, "Có giọng ca, thêm một người giành quyền quyết"),
           C("Thách bà một buổi so tài", { flags: ["x42_thach"], pressure: { danh: 1 } }, "Cả phố kéo đến xem, bên thua mất nghề")]),
        card("x42_kd_bang_gia", "Bảng giá đầu tiên", (c) => `Bạn phải in bảng giá, vì khách bắt đầu gọi điện hỏi. Gói thường có kèn và trống. Gói đặc biệt có thêm pháo giấy, ${f(c, "x42_ba_vao_doi") ? "giọng ngân của bà hát tang lễ" : "một màn kể lại đời người đã khuất"}, và một bài cuối cho cả họ cùng nhảy.`,
          [C("Làm gói cao cấp có sân khấu", { money: 0.25, flags: ["x42_cao_cap"] }, "Lãi to, nhà nghèo đứng ngoài"),
           C("Giữ giá rẻ cho nhà nghèo", { rel: 3, flags: ["x42_gia_re"], counters: { x42_long: 1 } }, "Đông việc, mỏng lãi")]),
      ],
      /* cu_lat */
      [
        card("x42_cl_dam_lon", "Đám lớn nhất năm", (c, k) => `Đám lớn nhất năm do chính ${k.scar("nguoi") || "một người quen cũ"} đặt, để tiễn người cha vừa mất, vé bán hết trong một buổi sáng. Đúng giờ mở màn, ${k.npc("ban_nhac")} đòi chia đôi tiền vé, không thì cả ban nghỉ. Bạn chỉ còn cái loa và câu chuyện về ${k.scar("do") || "thứ bạn mang theo từ đời cũ"} để làm thành một tiết mục.${f(c, "x42_ba_vao_doi") ? " Bà hát tang lễ đã đứng sẵn sau cánh gà, hắng giọng chờ hiệu." : ""}`,
          [C("Tự mình lên sân khấu", { flags: ["x42_tu_dien"], counters: { x42_show: 2 }, pressure: { danh: 1 } }, "Một là thành danh, hai là thành trò cười"),
           C("Chia đôi tiền vé cho ban kèn", { money: -0.2, flags: ["x42_chia_doi"] }, "Buổi lễ trọn vẹn, túi bạn nhẹ hẳn")]),
      ],
      /* day */
      [
        card("x42_day_kien", "Lá đơn kiện vì vui quá", (c, k) => `Một gia đình gửi đơn kiện: buổi tiễn bạn làm vui đến mức ai cũng quên mất người đã khuất. Báo địa phương giật tít chuyện đám tang thành hội chợ. ${k.gag()}`,
          [C("Xin lỗi công khai, hoàn tiền", { money: -0.3, flags: ["x42_xin_loi"] }, "Giữ tiếng, mất một mùa lãi"),
           C("Mời cả nhà họ xem lại đoạn phim", { flags: ["x42_xem_phim"], gamble: { p: 0.5,
             win: { happy: 4, counters: { x42_long: 1 }, log: "Xem xong, cả nhà họ vừa khóc vừa cười, rồi rút đơn." },
             lose: { money: -0.4, log: "Xem xong, họ đòi bồi thường gấp đôi." } } }, "Được ăn cả, ngã về không")]),
        card("x42_day_kiet_suc", "Mười một đám trong một tháng", (c) => `${f(c, "x42_cao_cap") ? "Gói cao cấp bán chạy tới mức" : "Khách đông tới mức"} tháng này bạn tiễn mười một người, ngủ luôn trên xe chở trống. Giọng bạn khàn, tay run khi cầm micro, có lần bạn đọc nhầm cả tên người đã khuất.${n(c, "x42_long") >= 1 ? " Mấy nhà nghèo từng được bạn tính giá rẻ mang sang cho bạn một nồi cháo, rồi ngồi canh bạn ăn hết." : ""}`,
          [C("Thuê thêm người, mở hẳn công ty", { money: -0.3, counters: { x42_show: 1 }, flags: ["x42_mo_cty"] }, "Lớn hơn, nợ nhiều hơn"),
           C("Nghỉ một mùa, về thăm mộ ông", { health: 6, happy: 3, flags: ["x42_nghi"] }, "Khỏe lại, khách sang tay người khác")]),
      ],
      /* chung_ket */
      [
        card("x42_ket", "Buổi tiễn được làm lại", (c, k) => `Mấy năm sau ngày ${ong42()} đi, cả xóm đòi làm lại buổi đầu tiên, lần này vé bán từ tháng trước. ${k.gag()} ${n(c, "x42_show") >= 3 ? "Tên bạn in to hơn tên ban kèn trên tấm áp phích." : "Tấm áp phích chỉ in ảnh ông, cười rất tươi."} Trước giờ mở màn, bạn còn ${noOr(c, k, "một món nợ cũ", "một món ân tình cũ")} phải tính, và một câu hỏi: tiếp tục hay hạ màn.`,
          (c) => finale(c,
            [O(L42_SK, "Mở công ty lo tang lễ có kèn", "Thành nghề, quanh năm gặp người buồn", "funeral_worker"),
             O(L42_NHAC, "Giữ cây kèn, đi diễn", "Sống bằng sân khấu, bỏ phần lo việc", "folk_musician")],
            [O(L42_BAN, "Bán lại công việc, hạ màn", "Có một khoản lớn, nhớ tiếng kèn"),
             O(L42_QUY, "Giao hết cho quỹ của xóm", "Mất vốn, cả xóm giữ tiếng kèn")])),
      ],
    ],
  }),
  "Thành ông bầu của những buổi tiễn đưa, bị cả họ bàn tán",
);

/* ================================================================ X43: tên con là biểu tượng cảm xúc */

const L43_LS = land("x43_luat_su", "Bạn thi lấy chứng chỉ hành nghề, nhận những vụ tên lạ khắp nơi gửi về. Văn phòng nhỏ treo tấm biển hình mặt trời cười.",
  { custom: "become:lawyer", know: 5 });
const L43_DANH = land("x43_noi_tieng", "Gia đình mặt trời thành cái tên ai cũng biết. Bạn kể chuyện nhà mỗi ngày cho hàng chục nghìn người theo dõi, còn con chỉ muốn được gọi tên bình thường ở lớp.",
  { custom: "become:influencer", happy: 3 });
const L43_BOI = land("x43_boi_thuong", "Nhà nước dàn xếp: sửa hệ thống cho nhận mọi cái tên, bồi thường cho những năm tài khoản nhà bạn bị khóa.",
  { money: 1.5, happy: 4 });
const L43_THUA = land("x43_thua_kien", "Bạn thua kiện, trả án phí và tiền sửa một nửa số máy in cả nước. Con bạn vẫn ký tên bằng hình mặt trời trên mọi tấm thiệp.",
  { money: -1.5, happy: -2 });

const X43 = weird("X43", "abs", ["ky", "luat", "danh"],
  // Con đang tuổi đi học: các thẻ sau có phấn vẽ tường, cặp sách, con hỏi ở bậc cửa.
  (c) => c.kids_school >= 1 && c.age >= 20 && c.age <= 50,
  () => "Đặt tên con là một hình mặt trời cười",
  (s, c) => ({
    title: "Cái tên làm cả nước đứng hình",
    text: `Nếu người cán bộ bấm nút lưu, giấy tờ cả nước sẽ đứng hình theo con bạn. Làm lại giấy khai sinh cho con vào lớp mới, bạn điền tên con là một hình mặt trời đang cười, cái tên ở nhà mà cả nhà cùng đồng ý. Màn hình chớp ba lần, rồi mọi máy in trong tòa nhà cùng nhả ra một tờ giấy chỉ có hình mặt trời. "${cap(ac(c))} có chắc không?" người cán bộ hỏi, giọng như sắp khóc.`,
  }),
  season({
    id: "w_X43", vn: "Cuộc chiến giấy khai sinh", color: "#e6a532", years: [6, 11], weird: "abs",
    rules: { flags: ["w_emoji_name"] },
    reset: { cast: [
      { key: "can_bo", role: "official", label: "anh cán bộ hộ tịch" },
      { key: "luat_su", role: "mentor", label: "bà luật sư về hưu" },
    ] },
    gag: { key: "mat_troi_in", lines: [
      "Máy bán vé ở bến xe in ra hình mặt trời cười thay cho số ghế.",
      "Hóa đơn tiền điện cả khu tháng này chỉ có một hình mặt trời cười. Không ai biết phải trả bao nhiêu.",
      "Bảng điểm của trường in mặt trời cười vào ô nhận xét của giáo viên. Phụ huynh khen rối rít.",
      "Máy in của tòa kẹt giấy, nhả ra đúng một hình mặt trời, rồi im.",
    ] },
    landings: [L43_LS, L43_DANH, L43_BOI, L43_THUA],
    beats: [
      /* mo_man */
      [
        card("x43_mo_dung_hinh", "Ngày cả nước đứng hình", (c, k) => `Ba ngày liền, mọi ô họ tên trên cả nước chỉ hiện một hình mặt trời cười. ${k.gag()} ${cap(k.npc("can_bo"))} đến tận nhà, mồ hôi ướt áo, xin bạn đổi tên con trước khi hệ thống sập hẳn.`,
          [C("Đổi tên con cho xong chuyện", { flags: ["x43_doi_ten"], happy: -3, counters: { x43_kien: -1 } }, "Yên chuyện, con mất cái tên cả nhà đã chọn"),
           C("Giữ tên, đó là quyền của con", { flags: ["x43_giu_ten"], counters: { x43_kien: 1 }, pressure: { danh: 1 } }, "Thành chuyện cả nước, khó lùi được nữa")]),
        card("x43_mo_con", "Bức tường của con", (c) => `Con bạn nghe chuyện, lấy phấn vẽ cái tên của mình lên tường nhà, to bằng cánh cửa. Cả xóm đi ngang đều dừng lại chụp ảnh. ${f(c, "x43_doi_ten") ? "Nét vẽ vẫn là mặt trời, dù trên giấy đã là tên khác." : "Bên dưới, con viết thêm: \"Tên con đây.\""}`,
          [C("Hỏi con thật sự muốn tên gì", { flags: ["x43_hoi_con"], rel: 3 }, "Gần con hơn, có thể nghe câu trả lời khó"),
           C("Chụp ảnh con với bức tường", { flags: ["x43_chup_anh"], counters: { x43_danh: 1 } }, "Ảnh lan khắp nơi, con thành người nổi tiếng")]),
      ],
      /* khoi_dong */
      [
        card("x43_kd_bao", "Bốn chiếc máy quay trước cổng", (c, k) => `${n(c, "x43_danh") >= 1 ? "Tấm ảnh bức tường lan đi khắp nơi," : "Tin đồn lan đi khắp nơi,"} và sáng nào trước cổng cũng có bốn chiếc máy quay. ${k.gag()} Người ta hỏi bạn là nghệ sĩ, kẻ phá hoại hay người đi trước thời đại.`,
          [C("Trả lời phỏng vấn đầy đủ", { counters: { x43_danh: 2 }, flags: ["x43_len_bao"] }, "Có người ủng hộ, có người ghét ra mặt"),
           C("Đóng cổng, căng một tấm vải", { flags: ["x43_tranh"], happy: -1 }, "Yên tĩnh, tin đồn tự viết tiếp")]),
        card("x43_kd_luat_su", "Bà luật sư mang ô đen", (c, k) => `${cap(k.npc("luat_su"))} gõ cổng một chiều mưa, tay cầm chiếc ô đen và một tập luật dày. Bà nghỉ hưu mười năm, nhưng chưa từng gặp vụ nào vui như vụ này. "Không có điều nào cấm một cái tên biết cười," bà nói.`,
          [C("Nhờ bà đứng đơn kiện", { flags: ["x43_co_ls"], counters: { x43_kien: 1 } }, "Có người giỏi bên cạnh, thành vụ kiện thật"),
           C("Tự học luật mỗi tối", { know: 5, bw: -3, flags: ["x43_tu_hoc"] }, "Hiểu luật, mất ngủ cả năm")]),
      ],
      /* cu_lat */
      [
        card("x43_cl_phien_toa", "Phiên tòa đọc tên", (c, k) => `Tòa yêu cầu tên phải đọc thành tiếng được. Bên kia mời ${k.scar("nguoi") || "một người quen cũ"} làm chứng, vì người đó từng gọi bạn là đứa thích làm chuyện lạ. Để chứng minh cả nhà kiên nhẫn đến đâu, bạn kể chuyện ${k.scar("do") || "thứ bạn mang theo từ đời cũ"} suốt mười phút, rồi mời con đứng lên đọc tên mình.`,
          [C("Để con đọc tên bằng một tiếng cười", { flags: ["x43_doc_cuoi"], gamble: { p: 0.5,
             win: { happy: 5, counters: { x43_kien: 1, x43_danh: 1 }, log: "Cả phòng xử bật cười theo, thư ký ghi nhận cái tên đọc được." },
             lose: { happy: -4, log: "Thẩm phán gõ búa, ghi vào biên bản: tiếng cười không phải chữ." } } }, "Có thể thắng ngay, có thể bị coi thường"),
           C("Chấp nhận thêm một tên chữ bên cạnh", { flags: ["x43_hai_ten"], counters: { x43_kien: -1 }, rel: 2 }, "Giữ được mặt trời, nhường một nửa")]),
      ],
      /* day */
      [
        card("x43_day_khoa", "Tài khoản bị khóa", (c, k) => `Ngân hàng khóa tài khoản của cả nhà, vì hệ thống không chịu nhận một khách hàng có con tên là mặt trời. ${k.gag()}${f(c, "x43_co_ls") ? " Bà luật sư bảo đây là bằng chứng tốt, nhưng bằng chứng không mua được gạo." : ""}`,
          [C("Vay tạm để sống qua mùa kiện", { custom: "borrow:0.3", flags: ["x43_vay"] }, "Có tiền tiêu, có thêm món nợ"),
           C("Bán bớt đồ trong nhà", { money: 0.1, happy: -3, flags: ["x43_ban_do"] }, "Không nợ, nhà trống dần")]),
        card("x43_day_con_hoi", "Câu hỏi của con", (c) => `Một tối, con ngồi ở bậc cửa hỏi: "${cap(bm(c))} kiện vì con, hay vì ${bm(c)}?" ${n(c, "x43_kien") >= 2 ? "Hồ sơ vụ kiện đã dày hơn cả cặp sách của con." : "Vụ kiện mới đi được nửa đường."} Bạn nhận ra mình chưa từng nghĩ tới câu này.`,
          [C("Rút đơn vì con", { flags: ["x43_rut_don"], rel: 5, counters: { x43_kien: -2 } }, "Nhà yên, cả nước quên dần"),
           C("Đi tiếp đến phiên cuối", { flags: ["x43_den_cung"], counters: { x43_kien: 1 }, happy: -2 }, "Có thể thắng, con lớn lên trong phòng xử")]),
      ],
      /* chung_ket */
      [
        card("x43_ket", "Phán quyết cuối", (c, k) => `Ngày tuyên án, cả nhà mặc áo giống nhau, in hình mặt trời. ${k.gag()} ${f(c, "x43_rut_don") ? "Dù bạn đã rút đơn, tòa vẫn mời cả nhà đến nghe kết luận." : "Hội trường chật kín, nửa ủng hộ, nửa phản đối."} Bạn còn ${noOr(c, k)} chưa trả, và ai cũng chờ bạn nói câu cuối.`,
          (c) => finale(c,
            [O(L43_LS, "Học luật, nhận những vụ như mình", "Thành luật sư, cả đời ở tòa", "lawyer"),
             O(L43_DANH, "Kể chuyện nhà cho cả nước nghe", "Nổi tiếng, con mất riêng tư", "influencer")],
            [O(L43_THUA, "Không lùi, chấp nhận thua kiện", "Mất tiền, giữ nguyên cái tên"),
             O(L43_BOI, "Ký dàn xếp với nhà nước", "Có tiền bồi thường, hết chuyện để kể")])),
      ],
    ],
  }),
  "Cả nước lỗi giấy tờ, nhà bạn ra tòa và lên báo",
);

/* ================================================================ X44: cả thành phố mất điện trừ nhà bạn */

const L44_TT = land("x44_thu_linh", "Bạn thành người đứng đầu khu phố. Cuộc họp nào cũng mở đầu bằng việc hỏi nhà ai đang thiếu điện, thiếu nước, thiếu người hỏi han.",
  { custom: "become:activist", rel: 6 }); // gần nhất: không có nghề thủ lĩnh khu phố
const L44_NC = land("x44_nghien_cuu", "Bạn theo anh thợ điện về xưởng, cùng mày mò cái nguồn điện không nối vào đâu. Hai người có chung một bằng sáng chế chưa ai hiểu nổi.",
  { custom: "become:inventor", know: 6 }); // gần nhất
const L44_DI = land("x44_doi_di", "Lời trách nhiều hơn lời cảm ơn. Bạn dọn sang một khu khác, nơi không ai biết nhà bạn từng là ngọn đèn duy nhất.",
  { custom: "move_city", happy: -2 });
const L44_BAN = land("x44_nhuong_cho", "Công ty điện xin dùng chỗ bạn đang ở làm nơi nghiên cứu, trả bạn một khoản bồi thường đủ sống yên nhiều năm ở chỗ khác.",
  { money: 1.5 });

const X44 = weird("X44", "abs", ["ky", "dat", "danh"],
  // Sống ở đô thị: đã lên thành phố (move_city đặt path_city), lớn lên ở phố nghèo, hoặc làm văn phòng/công nghệ.
  (c) => c.age >= 18 && c.age <= 70 && !c.farmer && (f(c, "path_city") || f(c, "origin_poor_urban") || f(c, "job_office") || f(c, "job_tech")),
  () => "Bật đèn khi cả thành phố tối om",
  (s) => ({
    title: "Ô cửa sáng duy nhất",
    text: `Nếu bạn bật thêm một bóng đèn, cả ${s.noi || "thành phố"} sẽ nhìn thấy. Mười giờ tối, mọi ngọn đèn tắt phụt, chỉ còn ô cửa sổ nhà bạn sáng giữa một biển đen như ngọn hải đăng. Mười phút sau có tiếng gõ cửa, ngoài kia là một hàng dài người cầm điện thoại sắp tắt: "Cho sạc nhờ năm phút thôi."`,
  }),
  season({
    id: "w_X44", vn: "Ngọn đèn duy nhất", color: "#f0b429", years: [5, 9], weird: "abs",
    rules: { flags: ["w_last_light"] },
    reset: { cast: [
      { key: "to_truong", role: "neighbor", label: "bác trưởng ban khu phố" },
      { key: "tho_dien", role: "rival", label: "anh thợ điện thành phố" },
    ] },
    gag: { key: "o_cam", lines: [
      "Ổ cắm nhà bạn giờ có mười hai cái điện thoại cắm xòe ra như một chùm nho.",
      "Dây nối dài từ nhà bạn đã bò qua ba con hẻm, có người phơi cả quần áo lên đó.",
      "Ai đó để trước cửa một cái nồi điện kèm tờ giấy: \"Khi nào rảnh thì nấu giùm.\"",
      "Chùm dây nối dài được cuộn lại, treo trên tường nhà bạn như một vòng hoa.",
    ] },
    landings: [L44_TT, L44_NC, L44_DI, L44_BAN],
    beats: [
      /* mo_man */
      [
        card("x44_mo_hang", "Hàng người trước cửa", (c, k) => `Đêm thứ ba, hàng người trước cửa nhà bạn dài tới ngã tư, có người mang theo ghế xếp và cơm hộp. ${k.gag()} ${cap(k.npc("to_truong"))} đứng đầu hàng, cầm loa, hỏi bạn tính sao.`,
          [C("Mở cửa cho sạc miễn phí", { rel: 5, flags: ["x44_mien_phi"], counters: { x44_long_pho: 2 } }, "Cả phố thương, nhà không còn chỗ ngủ"),
           C("Thu mỗi lượt sạc một ít tiền", { money: 0.1, flags: ["x44_thu_tien"], counters: { x44_long_pho: -1 } }, "Có tiền, có người nói bạn hám lợi")]),
        card("x44_mo_tho_dien", "Anh thợ điện trèo cột", (c, k) => `${cap(k.npc("tho_dien"))} trèo lên cột điện trước nhà bạn ba lần, đo ba lần, rồi trèo xuống với vẻ mặt của người vừa thấy ma. Dây nhà bạn không nối vào đâu cả. Anh xin tháo cái đồng hồ điện mang về nghiên cứu.`,
          [C("Cho anh tháo mang về", { flags: ["x44_cho_do"], know: 2 }, "Có thể biết sự thật, có thể mất luôn điện"),
           C("Không cho ai đụng vào", { flags: ["x44_giu_bi_mat"], pressure: { ky: 1 } }, "Giữ được đèn, thêm một người tò mò")]),
      ],
      /* khoi_dong */
      [
        card("x44_kd_lop_hoc", "Lớp học dưới bóng đèn", (c, k) => `Mùa thi tới, phòng khách nhà bạn thành lớp học buổi tối cho hai mươi đứa trẻ trong phố. ${k.gag()} ${cap(k.npc("to_truong"))} đề nghị lập lịch dùng điện, ghi tên từng nhà.`,
          [C("Lập lịch dùng điện cho cả phố", { flags: ["x44_lap_lich"], counters: { x44_long_pho: 2 }, know: 1 }, "Công bằng, nhưng bạn thành người phát điện"),
           C("Chỉ ưu tiên trẻ con và người ốm", { flags: ["x44_uu_tien"], rel: 2, counters: { x44_long_pho: 1 } }, "Tử tế, người lớn bắt đầu cằn nhằn")]),
        card("x44_kd_pho_ben", "Hòn đá từ phố bên", () => "Phố bên cạnh không ai quen bạn, chỉ có bóng tối và tin đồn rằng bạn ăn cắp điện của họ. Đêm qua một hòn đá bay qua cửa kính, kèm tờ giấy gói bên ngoài: \"Chia đi.\"",
          [C("Kéo dây sang cả phố bên", { money: -0.1, flags: ["x44_keo_day"], counters: { x44_long_pho: 1 } }, "Thêm bạn, ổ điện nhà bạn nóng ran"),
           C("Dựng hàng rào, đóng cổng sớm", { flags: ["x44_rao"], counters: { x44_long_pho: -2 } }, "An toàn, cả hai phố nhìn bạn khác đi")]),
      ],
      /* cu_lat */
      [
        card("x44_cl_nguon", "Nguồn điện bí mật", (c, k) => `${cap(k.npc("tho_dien"))} lần theo sợi dây cuối cùng tới một chiếc hộp cũ trong góc nhà, nơi bạn cất mọi thứ dính tới ${k.scar("do") || "đời cũ của mình"}. Anh đặt tay lên, chiếc hộp ấm như vừa có người cầm.${f(c, "x44_cho_do") ? " Cái đồng hồ điện anh tháo về hôm trước vẫn quay, dù chẳng nối vào đâu." : ""} Cùng đêm ấy, ${k.scar("nguoi") || "một người quen cũ"} gõ cửa, xin cắm một cái máy thở cho người nhà.`,
          [C("Nhường ổ cắm tốt nhất cho máy thở", { flags: ["x44_may_tho"], rel: 4, counters: { x44_long_pho: 1 } }, "Cứu người trước, lịch dùng điện rối tung"),
           C("Cho thợ điện mang chiếc hộp đi nghiên cứu", { flags: ["x44_giao_do"], know: 3, pressure: { ky: 1 } }, "Có thể giải được bí ẩn, có thể tắt đèn")]),
      ],
      /* day */
      [
        card("x44_day_dien_ve", "Điện về, trừ nhà bạn", (c, k) => `Một sáng, điện thành phố có lại, và cùng lúc ấy nhà bạn tối om. ${k.gag()} Rồi hóa đơn gửi tới, ghi tên bạn, cho toàn bộ số điện cả phố đã dùng${f(c, "x44_thu_tien") ? ", trừ đi số tiền sạc bạn đã thu" : ""}.`,
          [C("Tự trả hóa đơn", { money: -0.4, flags: ["x44_tu_tra"], counters: { x44_long_pho: 1 } }, "Mất một khoản lớn, giữ được lòng phố"),
           C("Gõ cửa từng nhà xin góp", { flags: ["x44_xin_gop"], money: -0.1 }, "Nhẹ túi, biết ai thật lòng")]),
        card("x44_day_hop", "Cuộc họp khu phố", (c, k) => {
          const lp = n(c, "x44_long_pho");
          const mood = lp >= 3 ? "người ta mang hoa tới" : lp <= 0 ? "người ta mang theo cả hóa đơn của mình" : "nửa phòng mang hoa, nửa phòng khoanh tay";
          return `Cuộc họp khu phố đông chưa từng thấy, ${mood}. ${cap(k.npc("to_truong"))} nói ông đã già, phố cần một người mới đứng ra lo chuyện chung.`;
        },
          [C("Đứng lên nói vài lời", { flags: ["x44_phat_bieu"], pressure: { danh: 1 }, counters: { x44_long_pho: 1 } }, "Được chú ý, cũng bị soi"),
           C("Ngồi im ở cuối phòng", { flags: ["x44_im"], happy: -2 }, "Không ai đòi gì ở bạn, cũng không ai nhớ tên")]),
      ],
      /* chung_ket */
      [
        card("x44_ket", "Tờ phiếu bầu đầu ngõ", (c, k) => `Ngày bầu trưởng khu phố mới, tờ phiếu nào cũng có tên bạn, viết tay, ${n(c, "x44_long_pho") >= 3 ? "kèm vài hình bóng đèn vẽ vội" : "nhiều tờ kèm một dòng trách móc"}. ${k.gag()} Bạn vẫn còn ${noOr(c, k, "một món nợ cũ", "một món ân tình cũ")} chưa trả, và cả phố đang chờ bạn chọn.`,
          (c) => finale(c,
            [O(L44_TT, "Nhận làm người đứng đầu khu phố", "Lo chuyện chung, chuyện riêng xếp sau", "activist"),
             O(L44_NC, "Theo thợ điện đi tìm nguồn điện", "Thành người mày mò, phố tự lo lấy", "inventor")],
            [O(L44_DI, "Dọn đi nơi khác cho yên", "Hết bị trách, cũng hết người quen"),
             O(L44_BAN, "Nhường chỗ ở cho công ty điện nghiên cứu", "Có một khoản lớn, rời ngọn đèn")])),
      ],
    ],
  }),
  "Thành ngọn đèn của cả phố, cũng thành cái gai của cả phố",
);

/* ================================================================ X45: nhân chứng duy nhất vụ con voi vào ngân hàng */

const L45_BAO = land("x45_nghe_bao", "Bạn bỏ chỗ làm cũ, đi làm phóng viên. Câu đầu tiên bạn hỏi mọi nhân chứng là: người đó có ổn không.",
  { custom: "become:journalist", know: 4 });
const L45_TV = land("x45_len_song", "Bạn dẫn một chương trình truyền hình về những chuyện lạ có thật. Khán giả nhớ nhất câu mở màn: \"Tôi từng thấy một con voi lấy số.\"",
  { custom: "become:tv_host", happy: 4 });
const L45_SACH = land("x45_ban_quyen", "Bạn bán bản quyền câu chuyện cho một nhà làm phim. Khoản tiền lớn hơn mười năm lương cộng lại.",
  { money: 2 });
const L45_DI = land("x45_an_danh", "Bạn chuyển đến một thành phố khác, đổi kiểu tóc, không nhận mình là ai. Thấy chuyện con voi trên báo, bạn lật sang trang khác.",
  { custom: "move_city" });

const X45 = weird("X45", "abs", ["ky", "danh", "luat"],
  // Có việc làm (các thẻ sau nói tới chỗ làm, xin nghỉ việc) và có lý do đứng trong sảnh ngân hàng.
  (c) => c.age >= 18 && c.age <= 68 && c.has_job && (f(c, "life_banker") || f(c, "job_office") || c.owns.has("deposit") || c.deposit > 0),
  () => "Kể lại điều mình thấy trong sảnh ngân hàng",
  (s, c) => ({
    title: "Con voi lấy số thứ tự",
    text: `Nếu bạn kể ra điều mình thấy, sẽ không ai tin, nhưng ai cũng muốn nghe. Chín giờ sáng, một con voi đi lạc từ đoàn xiếc lưu động bước vào sảnh ngân hàng ${s.noi ? `ở ${s.noi}` : "đầu phố"}, xếp hàng sau bạn, dùng vòi bấm số thứ tự. Camera hôm đó hỏng, nhân viên đều chui dưới gầm bàn. Bác bảo vệ thò đầu ra, thì thầm: "Cả cái thành phố này chỉ có ${ac(c)} thấy hết thôi."`,
  }),
  season({
    id: "w_X45", vn: "Nhân chứng voi", color: "#d98a1f", years: [5, 9], weird: "abs",
    rules: { flags: ["w_elephant_witness"] },
    reset: { cast: [
      { key: "phong_vien", role: "rival", label: "cô phóng viên đeo ba máy ảnh" },
      { key: "quan_tuong", role: "mentor", label: "ông quản tượng già" },
    ] },
    gag: { key: "so_48", lines: [
      "Câu đầu tiên của mọi phóng viên vẫn là: \"Con voi lấy số mấy?\" Bạn đáp: \"Số bốn mươi tám.\"",
      "Một tờ báo in tít lớn: \"Voi số bốn mươi tám: ai đã cho nó vào?\" Bên dưới là ảnh bạn đang nhắm mắt.",
      "Người ta xếp hàng xin chụp ảnh với tờ số bốn mươi bảy của bạn. Tờ số bốn mươi tám đã được đem bán đấu giá.",
      "Nhiều năm sau, máy bấm số của ngân hàng vẫn nhảy qua số bốn mươi tám. Không ai dám hỏi vì sao.",
    ] },
    landings: [L45_BAO, L45_TV, L45_SACH, L45_DI],
    beats: [
      /* mo_man */
      [
        card("x45_mo_loi_khai", "Lời khai đầu tiên", (c, k) => `Người ta ghi lời khai của bạn suốt bốn tiếng, vì cứ hết một câu lại phải hỏi lại: con voi thật à. ${k.gag()} Cuối buổi, người ghi biên bản xin chữ ký của bạn, rồi xin thêm một chữ ký nữa cho con gái.`,
          [C("Kể đúng những gì mình thấy", { flags: ["x45_khai_that"], counters: { x45_danh: 1 } }, "Thật thà, và thành người kể chuyện voi"),
           C("Nói mình không nhìn rõ", { flags: ["x45_che"], happy: -2, counters: { x45_danh: -1 } }, "Thoát được nhà báo, mất ngủ vì nói dối")]),
        card("x45_mo_phong_vien", "Người đứng ở cổng lúc sáu giờ", (c, k) => `${cap(k.npc("phong_vien"))} đứng ở cổng nhà bạn từ sáu giờ sáng, ba máy ảnh trên cổ, một ổ bánh mì trong túi. Cô ấy đã đứng như vậy ba ngày. "Một câu thôi," cô nói, "con voi có nhìn ${ac(c)} không?"`,
          [C("Nhận phỏng vấn độc quyền", { money: 0.1, counters: { x45_danh: 2 }, flags: ["x45_doc_quyen"] }, "Có tiền, có tên trên báo"),
           C("Đi cửa sau, đội mũ sụp", { flags: ["x45_tron"], bw: -2 }, "Tránh được hôm nay, cô ấy kiên nhẫn hơn bạn")]),
      ],
      /* khoi_dong */
      [
        card("x45_kd_hop_noi_bo", "Cuộc họp về cánh cửa", (c, k) => `Ngân hàng mời bạn tới một buổi họp kín để tìm xem ai đã để cửa tự động mở cho một con voi. ${k.gag()} Ánh mắt cả phòng dồn về phía bạn, người đứng gần cửa nhất hôm ấy.`,
          [C("Bênh vực con voi", { flags: ["x45_benh_voi"], counters: { x45_danh: 1 } }, "Được lòng người yêu thú, mất lòng nhiều người khác"),
           C("Đổ lỗi cho cánh cửa tự động", { flags: ["x45_do_cua"], know: 1 }, "Cửa không cãi lại, bạn an toàn")]),
        card("x45_kd_quan_tuong", "Ông quản tượng tìm đến", (c, k) => `${cap(k.npc("quan_tuong"))} tìm đến nhà bạn, đội cái mũ rách, mang một nải chuối làm quà. Người ta muốn đưa con voi tên Bông đi nơi khác vì cho rằng nó nguy hiểm. "Chỉ có lời của ${ac(c)} mới cứu được nó," ông nói.`,
          [C("Hứa đứng ra làm chứng cho Bông", { flags: ["x45_hua_qt"], pressure: { tinh: 1 }, counters: { x45_danh: 1 } }, "Có một người bạn già, thêm nhiều buổi ra tòa"),
           C("Bảo ông tự lo liệu", { flags: ["x45_tu_choi_qt"], happy: -1 }, "Yên thân, nải chuối để lại trên bậc cửa")]),
      ],
      /* cu_lat */
      [
        card("x45_cl_buc_anh", "Bức ảnh duy nhất", (c, k) => `Một khách hàng tìm được bức ảnh duy nhất của buổi sáng hôm ấy: con voi đang dùng vòi nhấc túi giấy tờ của bạn lên ngắm, tập giấy về ${k.scar("do") || "những chuyện từ đời cũ"} rơi lả tả, còn bạn đứng nhìn, mặt rất bình tĩnh. Người tung bức ảnh lên mạng là ${k.scar("nguoi") || "một người quen cũ"}, kèm lời bình: "Tôi biết người này từ lâu, chuyện gì kỳ lạ cũng tìm đến."`,
          [C("Bán bản gốc bức ảnh cho cô phóng viên", { money: 0.4, flags: ["x45_ban_anh"], counters: { x45_danh: 1 } }, "Có tiền, bức ảnh thuộc về người khác"),
           C("Đưa ảnh cho ông quản tượng làm bằng chứng", { flags: ["x45_anh_qt"], rel: 3 }, "Cứu được con voi, báo chí càng bám")]),
      ],
      /* day */
      [
        card("x45_day_bi_san", "Bị săn khắp phố", (c, k) => `${n(c, "x45_danh") >= 3 ? "Bạn nổi tiếng tới mức" : "Chuyện con voi dai dẳng tới mức"} đi chợ cũng có người chụp lén. ${k.gag()} Ở chỗ làm, khách xin gặp bạn chỉ để hỏi về con voi.`,
          [C("Xin nghỉ việc một năm", { flags: ["x45_nghi"], money: -0.2 }, "Tránh được ống kính, mất một năm lương"),
           C("Mở họp báo, trả lời câu cuối cùng", { flags: ["x45_hop_bao"], counters: { x45_danh: 2 } }, "Chấm dứt được, hoặc mở ra một mùa mới")]),
        card("x45_day_tin_don", "Tin đồn bạn dẫn voi vào", (c) => `Một trang mạng tung tin chính bạn đã dẫn con voi vào, để đánh lạc hướng một vụ mất tiền. Cảnh sát mời bạn lên làm việc lần nữa, lần này không ai xin chữ ký.${f(c, "x45_benh_voi") ? " Người ta lôi cả chuyện bạn từng bênh con voi ra làm bằng chứng." : ""}`,
          [C("Đến đồn trình bày hết", { flags: ["x45_trinh_bay"], happy: -2 }, "Mệt mỏi, nhưng hồ sơ sạch"),
           C("Nhờ cô phóng viên viết bài đính chính", { flags: ["x45_dinh_chinh"], counters: { x45_danh: 1 } }, "Có người bênh, nợ cô ấy một ân tình")]),
      ],
      /* chung_ket */
      [
        card("x45_ket", "Bài báo cuối về con voi", (c, k) => `Mấy năm sau buổi sáng ấy, ${k.npc("phong_vien")} xin viết bài cuối cùng về con voi và mời bạn cùng ký tên. ${k.gag()} ${f(c, "x45_hua_qt") || f(c, "x45_anh_qt") ? "Ông quản tượng gửi lời: con voi Bông đã được về rừng." : "Không ai biết con voi giờ ở đâu."} Bạn còn ${noOr(c, k, "một món nợ cũ", "một món ân tình cũ")} chưa trả, và một quyết định cho phần đời còn lại.`,
          (c) => finale(c,
            [O(L45_BAO, "Đi làm phóng viên", "Thành người đi hỏi, thôi làm người bị hỏi", "journalist"),
             O(L45_TV, "Nhận dẫn chương trình chuyện lạ", "Nổi tiếng, cả đời gắn với con voi", "tv_host")],
            [O(L45_SACH, "Bán bản quyền câu chuyện", "Có một khoản lớn, câu chuyện thành của người khác"),
             O(L45_DI, "Chuyển đi, không nhận là ai", "Yên thân, bỏ lại mọi người quen")])),
      ],
    ],
  }),
  "Thành nhân chứng duy nhất, bị báo chí săn suốt nhiều năm",
);

/* ================================================================ X46: con đăng bán bạn là "bố/mẹ cho thuê" */

const L46_CTY = land("x46_dich_vu", "Bạn mở hẳn một dịch vụ cha mẹ cho thuê, rủ thêm năm người già trong xóm. Ai cũng có việc để mắng, có người để thương.",
  { money: 1.5, rel: 6 });
const L46_CHAM = land("x46_cham_nguoi", "Bạn học thêm cách chăm người ốm, nhận chăm những người già không còn ai bên cạnh. Lương không cao, điện thoại reo cả ngày.",
  { custom: "become:caregiver", rel: 4 }); // gần nhất: không có nghề làm cha mẹ hộ
const L46_CON_NUOI = land("x46_con_nuoi", "Bạn ghi tên cậu khách quen vào sổ gia đình, chia cho cậu một phần tiền dành dụm. Bữa cơm chủ nhật có thêm một cái bát.",
  { money: -1, rel: 8, happy: 6 });

const X46 = weird("X46", "abs", ["ky", "mau", "tien"],
  // Con đã lớn: có con còn sống, không đứa nào còn tuổi đi học.
  (c) => c.kids_alive >= 1 && c.kids_school === 0 && c.kids_teen === 0 && c.age >= 55 && c.age <= 75,
  (s, c) => `Đi làm ${bm(c)} cho thuê theo giờ`,
  (s, c) => ({
    title: `${cap(bm(c))} còn tốt, giá theo giờ`,
    text: `Nếu có người bấm đặt thuê, sáng mai bạn sẽ phải đi làm ${bm(c)} của con nhà người ta. Con bạn đăng ảnh bạn lên chợ đồ cũ trên mạng, xếp giữa một cái tủ lạnh và một chiếc xe đạp, kèm dòng: "${cap(bm(c))} còn tốt, biết mắng đúng lúc, giá theo giờ." Chưa hết buổi chiều đã có mười chín lượt đặt.`,
  }),
  season({
    id: "w_X46", vn: "Phụ huynh cho thuê", color: "#e39b3a", years: [5, 8], weird: "abs",
    rules: { flags: ["w_parent_for_rent"] },
    reset: { cast: [
      { key: "khach_quen", role: "partner", label: "cậu khách quen đặt ba buổi một tuần" },
      { key: "doi_thu", role: "rival", label: "ông bố cho thuê ở khu bên" },
    ] },
    gag: { key: "danh_gia", lines: [
      "Đánh giá đầu tiên trên trang: \"Mắng rất có tâm. Bốn sao, vì hơi lâu.\"",
      "Đánh giá mới: \"Nhắc mặc áo ấm đúng ba lần. Năm sao.\" Con bạn chụp lại, gửi vào nhóm gia đình.",
      "Có người chê: \"Hỏi chuyện cưới xin hơi nhiều.\" Bạn đọc xong, cãi lại bằng một đánh giá dài hai trang.",
      "Chính con bạn để lại đánh giá đầu tiên của mình: \"Lẽ ra phải thuê từ lâu.\"",
    ] },
    landings: [L46_CTY, L46_CHAM, L46_CON_NUOI],
    beats: [
      /* mo_man */
      [
        card("x46_mo_don_dau", "Đơn thuê đầu tiên", (c, k) => `Đơn thuê đầu tiên là của một chàng trai sắp ra mắt nhà người yêu, cần một người ngồi cạnh làm ${bm(c)} cho đỡ run. Bạn mặc cái áo đẹp nhất, nhẩm tên giả ba lần trên đường đi. ${k.gag()}`,
          [C("Nhận đơn, diễn cho tròn vai", { money: 0.05, flags: ["x46_nhan"], counters: { x46_khach: 1 } }, "Có tiền tiêu vặt, có một vai mới"),
           C("Gọi con ra hỏi cho ra nhẽ", { flags: ["x46_hoi_con"], rel: -1, counters: { x46_con: 1 } }, "Biết lý do, có thể nghe điều khó nghe")]),
        card("x46_mo_con", "Vì sao con đăng bài", (c) => `Con bạn gãi đầu thú nhận: từ ngày con cái lớn và bận việc riêng, bạn cãi nhau với cái ti vi nhiều hơn với người. "Con nghĩ ${bm(c)} cần có việc để mắng," con nói, "mà con thì bận quá."`,
          [C("Giận, bắt con gỡ bài", { flags: ["x46_gian"], rel: -3 }, "Giữ thể diện, nhà yên mà buồn"),
           C("Cười, đòi chia phần trăm", { flags: ["x46_chia"], happy: 3, counters: { x46_khach: 1 } }, "Thành chuyện vui của cả nhà, lịch kín dần")]),
      ],
      /* khoi_dong */
      [
        card("x46_kd_khach_quen", "Cậu khách quen", (c, k) => `${cap(k.npc("khach_quen"))} không cần ra mắt ai, cũng không cần đi họp phụ huynh. Cậu chỉ cần có người hỏi hôm nay ăn gì, rồi chê cậu nấu mặn. ${k.gag()}`,
          [C("Dạy cậu ấy nấu ăn", { flags: ["x46_day_nau"], rel: 3, counters: { x46_than: 1 } }, "Thân hơn, thời gian cho nhà mình ít đi"),
           C("Giữ đúng giờ thuê, hết giờ là về", { money: 0.1, flags: ["x46_dung_gio"] }, "Chuyên nghiệp, cậu ấy hơi buồn")]),
        card("x46_kd_doi_thu", "Đối thủ ở khu bên", (c, k) => `${cap(k.npc("doi_thu"))} đăng quảng cáo rẻ hơn bạn một nửa, kèm lời hứa không bao giờ hỏi chuyện cưới xin. Khách của bạn bắt đầu so giá.`,
          [C("Hạ giá theo", { money: -0.05, counters: { x46_khach: 1 }, flags: ["x46_ha_gia"] }, "Giữ khách, mất công"),
           C("Thêm dịch vụ đi họp phụ huynh hộ", { flags: ["x46_hop_ph"], counters: { x46_khach: 2 } }, "Đông khách, thêm nhiều tối ngồi ghế nhựa")]),
      ],
      /* cu_lat */
      [
        card("x46_cl_dat_thue", "Người đặt thuê trọn chủ nhật", (c, k) => `Một tài khoản lạ đặt thuê bạn trọn ngày chủ nhật, trả gấp ba. Người mở cửa là chính con bạn, tay ôm một cuốn album dán đầy ảnh về ${k.scar("do") || "những ngày cả nhà còn ở chung"}: "Con không biết hẹn ${bm(c)} bằng cách nào khác." Trong bếp, ${k.scar("nguoi") || "một người quen cũ"} đã ngồi chờ cơm từ sớm.${f(c, "x46_gian") ? " Bài đăng bạn bắt gỡ hôm nào, hóa ra con vẫn lưu một bản." : ""}`,
          [C("Ở lại trọn ngày, không tính tiền", { flags: ["x46_o_lai"], rel: 6, pressure: { tinh: 1 } }, "Ấm lòng, lỡ hẹn ba khách quen"),
           C("Tính đúng giá, rồi lén trả lại", { flags: ["x46_tra_lai"], happy: 2, counters: { x46_con: 1 } }, "Giữ luật nghề, giữ cả thể diện cho con")]),
      ],
      /* day */
      [
        card("x46_day_lich_kin", "Lịch kín đến cuối năm", (c, k) => `${n(c, "x46_khach") >= 3 ? "Lịch thuê của bạn kín đến cuối năm," : "Lịch thuê dày dần,"} có hôm ba nơi cùng gọi ${bm(c)}. ${k.gag()} Bác sĩ nhìn kết quả đo huyết áp rồi hỏi bạn đang làm nghề gì.`,
          [C("Từ chối bớt khách", { money: -0.1, health: 4, flags: ["x46_bot"] }, "Khỏe hơn, ít tiền hơn"),
           C("Nhận hết, ngủ trên xe buýt", { money: 0.2, health: -6, flags: ["x46_nhan_het"] }, "Giàu nhanh, già nhanh")]),
        card("x46_day_dam_cuoi", "Đám cưới của cậu khách quen", (c, k) => `${cap(k.npc("khach_quen"))} sắp cưới, xin bạn đứng làm ${bm(c)} bên nhà trai, lần này không lấy tiền. Đúng ngày ấy lại là sinh nhật con bạn.${n(c, "x46_than") >= 1 ? " Cậu đã nấu được món bạn dạy, định làm cho cả tiệc." : ""}`,
          [C("Đi đám cưới của cậu khách quen", { flags: ["x46_di_cuoi"], counters: { x46_than: 1 } }, "Thành người nhà thật của một người lạ"),
           C("Ở nhà với con mình", { flags: ["x46_o_nha"], rel: 4 }, "Đúng chỗ, nhưng tiệc cưới có một ghế trống")]),
      ],
      /* chung_ket */
      [
        card("x46_ket", "Hợp đồng cuối cùng", (c, k) => `${n(c, "x46_con") >= 1 ? "Lần này con bạn tự mang tới tận nơi" : "Con bạn gửi tới"} một bản hợp đồng in sẵn, mục giá để trống, mục thời hạn ghi "đến khi nào ${bm(c)} chán". ${k.gag()} ${n(c, "x46_than") >= 2 ? "Cậu khách quen cũng gửi một bản, nét chữ run run." : "Ngoài kia vẫn còn một danh sách khách đang chờ."} Bạn còn ${noOr(c, k, "một món nợ cũ", "một món ân tình cũ")} phải lo, và một câu trả lời phải đưa.`,
          (c) => finale(c,
            [O(L46_CHAM, "Học nghề chăm người già", "Thành nghề thật, lương không cao", "caregiver")],
            [O(L46_CTY, "Mở hẳn dịch vụ cha mẹ cho thuê", "Có tiền, có việc, ít thời gian cho nhà"),
             O(L46_CON_NUOI, "Nhận cậu khách quen làm con nuôi", "Thêm một đứa con, bớt một phần tiền")])),
      ],
    ],
  }),
  "Đi làm cha mẹ hộ cho người lạ, con mình đứng nhìn",
);

/* ================================================================ X47: thư tình năm 16 tuổi khắc lên tượng đài */

/** Số năm từ lúc viết thư (16 tuổi) tới nay. */
const namThu = (c: FactContext): number => Math.max(1, c.age - 16);

const L47_CUOI = land("x47_tai_hop", "Bạn cưới người nhận bức thư năm ấy. Tấm biển dưới tượng ghi thêm một dòng: người nhận đã trả lời, muộn ngần ấy năm.",
  { custom: "marry", happy: 8 });
const L47_DOI = land("x47_doi_pho", "Bạn chuyển khỏi thành phố có tượng đài, mang theo bản nháp bức thư. Ở nơi mới, không ai biết câu thứ ba là của bạn.",
  { custom: "move_city" });
const L47_BAN = land("x47_ban_quyen", "Bạn bán bản quyền bức thư cho thành phố, chia đôi với người nhận. Hai người thành bạn, mỗi năm gặp nhau một lần dưới chân tượng.",
  { money: 1.2, happy: 3 });

const X47 = weird("X47", "abs", ["ky", "tinh", "danh"],
  (c) => c.age >= 30 && c.age <= 70 && (f(c, "first_love") || c.pressure.tinh >= 4),
  () => "Nhận bức thư trên tượng đài là của mình",
  (s) => ({
    title: "Bức thư năm mười sáu tuổi",
    text: `Nếu ai đọc to câu thứ ba, bạn sẽ phải đổi tên mà sống. Tượng đài mới khánh thành ở ${s.noi || "quảng trường thành phố"} khắc nguyên văn một bức thư tình tìm thấy trong hộp thời gian của trường cũ. Đó là thư của bạn, năm mười sáu tuổi, sai ba lỗi chính tả, ký tên rõ ràng. Người dẫn chương trình rưng rưng: "Một tình yêu trong sáng của thế hệ trước!"`,
  }),
  season({
    id: "w_X47", vn: "Tượng đài ngượng", color: "#e0a43c", years: [5, 10], weird: "abs",
    rules: { flags: ["w_love_monument"] },
    reset: { cast: [
      { key: "nguoi_nhan", role: "partner", label: "người nhận bức thư năm ấy" },
      { key: "dieu_khac", role: "neighbor", label: "bà nhà điêu khắc" },
    ] },
    gag: { key: "cau_thu_ba", lines: [
      "Một đoàn khách du lịch đứng đọc to câu thứ ba. Hướng dẫn viên ngắt nhịp rất đúng chỗ.",
      "Câu thứ ba được in lên áo phông bán ở chân tượng. Bạn mua một cái để không ai khác mua được.",
      "Học sinh chép câu thứ ba vào bài văn. Cô giáo cho điểm chín, gạch đỏ ba lỗi chính tả của bạn.",
      "Có người sửa lỗi chính tả trên tượng bằng bút dạ. Bạn thấy nhớ mấy lỗi ấy lạ lùng.",
    ] },
    landings: [L47_CUOI, L47_DOI, L47_BAN],
    beats: [
      /* mo_man */
      [
        card("x47_mo_khanh_thanh", "Ngày khánh thành", (c, k) => `Lễ khánh thành có kèn, có bóng bay, có một em bé được giao nhiệm vụ đọc to toàn văn bức thư. ${k.gag()} Bạn đứng hàng thứ ba, mặt đỏ bừng.`,
          [C("Bước lên nhận mình là người viết", { flags: ["x47_nhan"], counters: { x47_lo: 1 }, pressure: { danh: 1 } }, "Nổi tiếng nhất buổi lễ, theo cách tệ nhất"),
           C("Kéo mũ thấp, lẫn vào đám đông", { flags: ["x47_giau"], happy: -1 }, "Thoát hôm nay, tên bạn vẫn khắc trên đá")]),
        card("x47_mo_bua_com", "Bữa cơm tối hôm ấy", (c) => `${c.married ? "Bữa tối, người bạn đời đặt tờ báo có ảnh tượng đài lên bàn ăn, không nói gì, chỉ gạch chân câu thứ ba." : "Bữa tối, một người trong nhà gọi điện, đọc lại câu thứ ba bằng giọng của người đọc bản tin thời sự."} Cả nhà chờ bạn giải thích.`,
          [C("Kể hết chuyện năm mười sáu tuổi", { flags: ["x47_ke"], rel: 2 }, "Nhẹ lòng, câu chuyện thành của chung"),
           C("Bảo đó là thư chép trong sách", { flags: ["x47_choi"], happy: -1, counters: { x47_lo: 1 } }, "Qua bữa cơm, thêm một lời nói dối phải giữ")]),
      ],
      /* khoi_dong */
      [
        card("x47_kd_dieu_khac", "Bà nhà điêu khắc không sửa", (c, k) => `Bạn tìm đến xưởng của ${k.npc("dieu_khac")}, xin sửa ba lỗi chính tả, hoặc ít nhất là xóa tên. Bà lau tay vào tạp dề, lắc đầu: "Đá không biết xấu hổ, chỉ người mới biết." ${k.gag()}`,
          [C("Làm đơn kiến nghị gỡ tượng", { flags: ["x47_kien_nghi"], counters: { x47_lo: 1 } }, "Có thể được gỡ, chắc chắn bị chú ý hơn"),
           C("Xin khắc thêm một dòng trả lời", { flags: ["x47_them_dong"], pressure: { tinh: 1 } }, "Tượng dài thêm, chuyện cũng dài thêm")]),
        card("x47_kd_thu_moi", "Phong bì dưới chân tượng", () => "Người ta bắt đầu để thư tình dưới chân tượng, như một hòm thư không địa chỉ. Một sáng, bạn thấy một phong bì cũ, nét chữ quen đến lạnh người, đề đúng tên bạn năm mười sáu tuổi.",
          [C("Nhặt lá thư mang về", { flags: ["x47_nhat_thu"], pressure: { tinh: 1 }, counters: { x47_gan: 1 } }, "Biết người ấy còn nhớ, khó quên lại"),
           C("Để yên đó, đi thẳng", { flags: ["x47_de_yen"], happy: -1 }, "Giữ được hiện tại, ngoảnh lại hai lần")]),
      ],
      /* cu_lat */
      [
        card("x47_cl_quay_lai", "Người nhận năm ấy", (c, k) => `${cap(k.npc("nguoi_nhan"))} đứng trước tượng, vẫn nhớ chuyện ${k.scar("do") || "những ngày cũ của bạn"} rõ hơn cả bạn. Người ấy nói chưa từng nhận được bức thư, vì ${k.scar("nguoi") || "một người quen cũ"} đã giữ nó lại suốt ${namThu(c)} năm rồi lặng lẽ bỏ vào hộp thời gian. "Hóa ra câu thứ ba là viết cho tôi," người ấy nói.${f(c, "x47_nhan") ? " Người ấy nhận ra bạn nhờ tấm ảnh hôm khánh thành." : ""}`,
          [C("Đi tìm hỏi người đã giữ thư", { flags: ["x47_hoi"], know: 2 }, "Biết sự thật, có thể mất thêm một người quen"),
           C("Mời người ấy đi uống một ấm trà", { flags: ["x47_tra"], counters: { x47_gan: 1 }, pressure: { tinh: 1 } }, "Bao nhiêu năm dồn vào một buổi chiều")]),
      ],
      /* day */
      [
        card("x47_day_bao", "Báo chí tìm ra cả hai người", (c, k) => `${n(c, "x47_lo") >= 2 ? "Vì bạn đã lộ mặt từ đầu," : "Dù bạn giấu kỹ đến đâu,"} báo chí vẫn tìm ra cả người viết lẫn người nhận, chụp hai người đứng cách nhau đúng một mét trước tượng. ${k.gag()}${c.married ? " Ở nhà, người bạn đời bắt đầu đi ngủ sớm hơn." : ""}`,
          [C("Nói thật với cả nhà và báo chí", { flags: ["x47_noi_that"], counters: { x47_lo: 1 } }, "Hết phải giấu, hết cả yên tĩnh"),
           C("Hẹn người nhận lần cuối để nói lời chào", { flags: ["x47_chao"], happy: -2 }, "Khép lại cho gọn, đau một lần")]),
        card("x47_day_mua", "Đêm mưa dưới chân tượng", (c, k) => `Đêm mưa to, nước chảy theo từng nét chữ khắc, cuốn trôi hết những lá thư người lạ để lại. Bạn và ${k.npc("nguoi_nhan")} cùng đứng trú dưới mái hiên đối diện, không ai có ô.${f(c, "x47_chao") ? " Lời chào hôm trước hóa ra chưa phải lời chào cuối." : ""}`,
          [C("Thú nhận mình vẫn còn nhớ", { flags: ["x47_thu_nhan"], counters: { x47_gan: 2 } }, "Một câu nói đổi cả phần đời còn lại"),
           C("Nói rằng mình đã khác xưa", { flags: ["x47_khac"], know: 1 }, "Thật thà, mưa vẫn rơi")]),
      ],
      /* chung_ket */
      [
        card("x47_ket", "Câu thứ ba", (c, k) => `Thành phố hỏi ý bạn lần cuối trước khi gắn tấm biển tên cho tượng. ${k.gag()} ${n(c, "x47_gan") >= 2 ? "Người nhận năm ấy đứng bên cạnh, lần này không cách một mét." : "Người nhận năm ấy đứng ở xa, chờ."} Bạn còn ${k.scar("no") || "một lời hứa cũ"} chưa trả, và câu thứ ba vẫn chờ một câu đáp.`,
          (c): Choice[] => !c.married && c.age >= 18
            ? [ending(L47_CUOI, "Trả lời bức thư bằng một lời cầu hôn", "Tình cũ trở lại, cả thành phố đứng xem"),
               ending(L47_DOI, "Rời thành phố, mang theo bản nháp", "Hết ngượng, hết cả người cũ"),
               ending(L47_BAN, "Bán bản quyền, chia đôi với người nhận", "Thành bạn, có thêm một khoản")]
            : [ending(L47_DOI, "Rời thành phố cùng gia đình", "Giữ được nhà, bỏ lại tượng đài"),
               ending(L47_BAN, "Bán bản quyền, chia đôi với người nhận", "Thành bạn, có thêm một khoản")]),
      ],
    ],
  }),
  "Câu thứ ba thành biểu tượng thành phố, người nhận thư quay lại",
);

/* ================================================================ X48: người yêu cũ mở quán đối diện, rẻ hơn một đồng */

const L48_THANG = land("x48_thang", "Quán bên kia trả mặt bằng. Bạn mua lại bộ bàn ghế, giữ nguyên giá cũ, và khách đông gấp đôi.",
  { income_mult: 1.4, happy: 3 });
const L48_PHA_SAN = land("x48_pha_san", "Cuộc chiến một đồng xu nuốt hết vốn của bạn. Bạn đóng quán, trả nợ dần, và từ đó không ăn món ấy nữa.",
  { money: -2, custom: "repay:1", happy: -4 });
const L48_TAI_HOP = land("x48_tai_hop", "Hai người tháo một tấm bảng giá, gộp hai quán làm một, và làm đám cưới ngay giữa con đường từng chia đôi họ.",
  { custom: "marry", happy: 8 });
const L48_GOP = land("x48_gop_quan", "Hai người gộp hai quán làm một, chia ca sáng chiều, chia đôi tiền lãi. Cả phố chỉ còn một tấm bảng giá.",
  { income_mult: 1.25, rel: 4 });

const X48 = weird("X48", "abs", ["ky", "tinh", "tien"],
  // Có quán ăn cố định (đầu bếp, chủ quán): các thẻ nói tới mặt bằng, tô, nước dùng, hành.
  (c) => c.age >= 22 && c.age <= 65 && f(c, "life_restaurateur")
    && (f(c, "first_love") || c.married || c.widowed || c.pressure.tinh >= 2),
  () => "Nhìn sang quán đối diện của người yêu cũ",
  () => ({
    title: "Rẻ hơn đúng một đồng xu",
    text: "Nếu khách chịu đếm tiền lẻ, quán bạn sẽ mất sạch khách vì một đồng xu. Sáng thứ hai, quán đối diện khai trương, bán đúng món của bạn, cùng loại tô, cùng cách rắc hành, rẻ hơn đúng một đồng xu. Chủ quán bước ra vẫy tay, là người yêu cũ của bạn, tóc cắt y kiểu năm xưa: \"Lâu quá không gặp. Ăn thử không?\"",
  }),
  season({
    id: "w_X48", vn: "Cuộc chiến một đồng", color: "#dd7f26", years: [5, 9], weird: "abs",
    rules: { flags: ["w_one_coin_war"] },
    reset: { cast: [
      { key: "nguoi_cu", role: "rival", label: "người yêu cũ bên kia đường" },
      { key: "ba_khach", role: "neighbor", label: "bà khách ăn sáng ở cả hai quán" },
    ] },
    gag: { key: "bang_gia", lines: [
      "Bảng giá bên kia đường vừa sửa, vẫn rẻ hơn bạn đúng một đồng xu.",
      "Bạn hạ giá lúc sáu giờ. Sáu giờ năm phút, bảng bên kia đã rẻ hơn một đồng xu, nét phấn còn ướt.",
      "Giá hai bên giờ thấp tới mức bà khách ăn sáng hỏi có được trả tiền ngược không.",
      "Hai tấm bảng giá đứng đối diện nhau như hai người không chịu nói trước.",
    ] },
    landings: [L48_THANG, L48_PHA_SAN, L48_TAI_HOP, L48_GOP],
    beats: [
      /* mo_man */
      [
        card("x48_mo_khai_truong", "Khách quen đứng giữa đường", (c, k) => `Khách quen của bạn đứng giữa đường, nhìn hai tấm bảng giá, rồi bước sang bên kia. ${k.gag()} Người yêu cũ đứng sau quầy, vẫn quen lau tay vào vạt áo như ngày trước.`,
          [C("Hạ giá thêm một đồng xu", { money: -0.05, flags: ["x48_ha_gia"], counters: { x48_chien: 1 } }, "Giữ khách hôm nay, mở màn cuộc chiến"),
           C("Giữ giá, nấu ngon hơn", { flags: ["x48_ngon_hon"], know: 2 }, "Chậm, nhưng không phải chạy theo ai")]),
        card("x48_mo_cong_thuc", "Cái tô giống hệt", () => "Bạn sang ăn thử, cẩn thận đeo khẩu trang. Nước dùng đúng vị bạn nấu hồi hai người còn yêu nhau, chung nhau một căn bếp nhỏ, kể cả cái lỗi cho hơi nhiều gừng.",
          [C("Hỏi thẳng chuyện công thức", { flags: ["x48_hoi_thang"], pressure: { tinh: 1 }, counters: { x48_hoa: 1 } }, "Biết lý do, có thể khơi lại chuyện cũ"),
           C("Đổi công thức, thêm một vị bí mật", { flags: ["x48_doi_vi"], money: -0.05, know: 1 }, "Làm mới mình, mất khách quen vị cũ")]),
      ],
      /* khoi_dong */
      [
        card("x48_kd_ba_khach", "Bà khách ăn ở cả hai quán", (c, k) => `${cap(k.npc("ba_khach"))} ăn sáng ở quán bạn, ăn trưa ở quán bên kia, chiều nào cũng sang kể chuyện. ${k.gag()} Bà bảo bên kia đêm nào cũng thức tới hai giờ để tính giá.`,
          [C("Nhờ bà dò tin bên kia", { flags: ["x48_do_tin"], counters: { x48_chien: 1 } }, "Biết trước một bước, thêm một người lắm lời"),
           C("Nhờ bà chuyển một lời nhắn", { flags: ["x48_nhan_tin"], counters: { x48_hoa: 1 }, pressure: { tinh: 1 } }, "Mở ra một khe cửa nhỏ")]),
        card("x48_kd_khuyen_mai", "Mua một tặng một", () => "Quán bên kia treo băng rôn mua một tặng một. Quán bạn vắng tới mức con mèo hàng xóm vào nằm ngủ giữa bàn.",
          [C("Vay tiền làm khuyến mãi lớn hơn", { custom: "borrow:0.3", flags: ["x48_vay"], counters: { x48_chien: 2 } }, "Có thể giành lại phố, chắc chắn thêm nợ"),
           C("Đóng cửa một ngày, sang ăn quán kia", { flags: ["x48_an_thu"], counters: { x48_hoa: 1 } }, "Mất một ngày bán, được một buổi nói chuyện")]),
      ],
      /* cu_lat */
      [
        card("x48_cl_vi_sao", "Vì sao là một đồng xu", (c, k) => `Đêm mất điện, hai quán cùng tối, ${k.npc("nguoi_cu")} sang ngồi ở bậc thềm nhà bạn. Người ấy kể đã mở quán bằng tiền vay của ${k.scar("nguoi") || "một người cả hai cùng quen"}, và đặt giá rẻ hơn một đồng xu chỉ để mỗi sáng bạn phải nhìn sang. Bên kia, người ấy vẫn kể với khách chuyện ${k.scar("do") || "những ngày cũ của hai người"} như chuyện của chính mình.`,
          [C("Đề nghị đình chiến", { flags: ["x48_dinh_chien"], counters: { x48_hoa: 2 } }, "Ngủ ngon hơn, khách chia đôi"),
           C("Tuyên bố chiến tranh tổng lực", { flags: ["x48_tong_luc"], counters: { x48_chien: 2 }, pressure: { tien: 1 } }, "Một bên phải đóng cửa")]),
      ],
      /* day */
      [
        card("x48_day_so_sach", "Sổ sách cuối quý", (c, k) => `${n(c, "x48_chien") >= 3 ? "Sau mấy vòng hạ giá, mỗi tô bán ra lỗ đúng bằng tiền hành." : "Dù đã bớt hạ giá, quán vẫn lỗ đều tay."} ${k.gag()} Bên kia đường, đèn cũng sáng tới khuya.`,
          [C("Cầm cố đồ đạc để trụ thêm", { custom: "borrow:0.2", flags: ["x48_cam_co"] }, "Trụ thêm được một mùa, gánh thêm nợ"),
           C("Bỏ món cũ, bán món khác hẳn", { flags: ["x48_mon_moi"], know: 2, counters: { x48_chien: -1 } }, "Thoát khỏi cuộc chiến, phải học lại từ đầu")]),
        card("x48_day_om", "Quán bên kia không mở cửa", (c, k) => `Một sáng quán bên kia không mở cửa. ${cap(k.npc("ba_khach"))} chạy sang báo: người bên kia ốm, nằm một mình trên gác, nồi nước dùng vẫn đang sôi dở.${f(c, "x48_tong_luc") ? " Băng rôn tuyên chiến của bạn vẫn treo ngay trước mặt nhà người ấy." : ""}`,
          [C("Sang nấu hộ, bán hộ quán bên kia", { flags: ["x48_ban_ho"], counters: { x48_hoa: 2 } }, "Tử tế, quán mình bỏ không một tuần"),
           C("Kéo hết khách về quán mình", { money: 0.2, flags: ["x48_keo_khach"], counters: { x48_chien: 1 } }, "Thắng một tuần, cả phố nhìn bạn")]),
      ],
      /* chung_ket */
      [
        card("x48_ket", "Một đồng xu cuối cùng", (c, k) => `${n(c, "x48_hoa") > n(c, "x48_chien") ? "Hai quán giờ đã chung nhau một chiếc ô che nắng." : "Hai quán vẫn kéo bạt quay lưng vào nhau."} ${k.gag()} Bạn còn ${noOr(c, k, "một món nợ cũ", "một món ân tình cũ")} phải trả, và người bên kia đường đang băng qua, tay cầm một đồng xu.`,
          (c): Choice[] => [
            ending(L48_THANG, "Mua lại quán bên kia", "Thắng cuộc chiến, phố có một người buồn"),
            ending(L48_PHA_SAN, "Hạ giá lần cuối, tới đâu thì tới", "Có thể trắng tay"),
            c.married || c.age < 18
              ? ending(L48_GOP, "Gộp hai quán, chia đôi ca", "Hết chiến tranh, chia đôi phần lãi")
              : ending(L48_TAI_HOP, "Nhận đồng xu, và nhận lại người cũ", "Tái hợp, cả phố làm khách mời"),
          ]),
      ],
    ],
  }),
  "Chiến tranh giá với người yêu cũ, thắng thua đều đổi đời",
);

/* ================================================================ X49: lương trả bằng thời gian rảnh */

const L49_NGHE = land("x49_ban_gio", "Bạn dựng một quầy nhỏ đầu chợ, bán giờ rảnh theo phút cho người bận. Khách hiếm khi trả giá, vì ai cũng vội.",
  { custom: "become:street_vendor", happy: 6 }); // gần nhất: không có nghề bán thời gian
const L49_CHAM = land("x49_song_cham", "Bạn giữ lại thói quen của người giàu giờ: làm ít, ăn chậm, ngủ trưa. Thu nhập teo lại, nụ cười thì không.",
  { income_mult: 0.7, happy: 12 });
const L49_DOI = land("x49_doi_tien", "Bạn bán hết kho giờ cho chị doanh nhân không bao giờ ngồi. Khoản tiền rất lớn, và lần đầu tiên chị ấy ngồi xuống uống trà với bạn.",
  { money: 1.5 });

const X49 = weird("X49", "abs", ["ky", "tien", "than"],
  // Làm công ăn lương: có phòng kế toán trả lương (xem wageEarner).
  (c) => wageEarner(c) && c.pressure.ky >= 4 && c.age >= 20 && c.age <= 62,
  () => "Ký nhận lương bằng giờ rảnh",
  () => ({
    title: "Lương tháng này: ba trăm giờ rảnh",
    text: "Nếu bạn ký nhận phong bì này, bạn sẽ không bao giờ phải vội nữa, và cũng không còn đồng lương nào. Cuối tháng, phòng kế toán đưa bạn một phong bì dày, bên trong là xấp phiếu in chữ \"một giờ rảnh\", đóng dấu đỏ. Kế toán trưởng nói rất nghiêm túc: \"Công ty hết tiền, nhưng giờ thì còn nhiều lắm.\"",
  }),
  season({
    id: "w_X49", vn: "Triệu phú thời gian", color: "#e8b43f", years: [6, 10], weird: "abs",
    rules: { income: 0.4, flags: ["w_time_rich"], yearly: { happy: 1 } },
    reset: { cast: [
      { key: "nguoi_ban", role: "partner", label: "chị doanh nhân không bao giờ ngồi" },
      { key: "ke_toan", role: "first_boss", label: "ông kế toán trưởng" },
    ] },
    gag: { key: "may_gio", lines: [
      "Ai đi ngang cũng hỏi bạn mấy giờ rồi. Bạn trả lời thong thả, không ai chờ nổi câu trả lời.",
      "Một người lạ dúi tiền vào tay bạn, xin mua mười phút. Bạn chưa kịp đếm thì người ấy đã chạy mất.",
      "Cả xóm dựng một cái đồng hồ trước nhà bạn như dựng cột mốc. Nó chạy chậm hơn mọi đồng hồ khác đúng năm phút.",
      "Bạn ngồi uống trà đến khi nước nguội. Cả xóm đứng nhìn như xem phim.",
    ] },
    landings: [L49_NGHE, L49_CHAM, L49_DOI],
    beats: [
      /* mo_man */
      [
        card("x49_mo_phong_bi", "Phong bì đầy giờ rảnh", (c, k) => `Xấp phiếu giờ rảnh dày tới mức phong bì không dán lại được. ${cap(k.npc("ke_toan"))} đóng dấu từng tờ, tay không run. ${k.gag()}`,
          [C("Ký nhận, xem chuyện gì xảy ra", { flags: ["x49_ky"], happy: 3, counters: { x49_gio: 1 } }, "Giàu giờ, nghèo tiền"),
           C("Đòi lương bằng tiền như cũ", { flags: ["x49_doi_tien"], money: 0.05, counters: { x49_gio: -1 } }, "Có tiền chợ, công ty ghi tên bạn vào sổ")]),
        card("x49_mo_ngay_dau", "Ngày đầu tiên tiêu giờ", () => "Sáng thứ hai đầu tiên không phải đi làm, bạn ngồi ở công viên từ sáu giờ, xem một con ốc bò hết chiều dài cái ghế đá. Đến trưa, bạn nhận ra mình chưa từng biết một ngày lại dài như thế.",
          [C("Dành cả buổi chiều cho người nhà", { rel: 4, flags: ["x49_gia_dinh"] }, "Gần người thân, họ chưa quen thấy bạn rảnh"),
           C("Học một thứ chưa từng có thời gian học", { know: 4, flags: ["x49_hoc"] }, "Giỏi thêm một nghề, ít gặp ai")]),
      ],
      /* khoi_dong */
      [
        card("x49_kd_nguoi_mua", "Chị doanh nhân không ngồi", (c, k) => `${cap(k.npc("nguoi_ban"))} điều hành bốn công ty, ăn trưa khi đang đi bộ, ngủ khi đang ngồi xe. Chị đặt lên bàn một xấp tiền, xin mua mười giờ rảnh của bạn để được ngồi xuống một lần. ${k.gag()}`,
          [C("Bán cho chị ấy mười giờ", { money: 0.3, counters: { x49_gio: -1 }, flags: ["x49_ban_gio"] }, "Có tiền, chị ấy sẽ quay lại mua tiếp"),
           C("Từ chối, giờ của mình không bán", { flags: ["x49_giu_gio"], counters: { x49_gio: 1 }, happy: 2 }, "Giữ được của, mất một khách sộp")]),
        card("x49_kd_cho_gio", "Chợ giờ rảnh", () => "Tin bạn giàu giờ lan khắp xóm, người bận rộn kéo tới xin mua, người rảnh rỗi kéo tới xin bán. Sân nhà bạn thành một cái chợ không có hàng hóa.",
          [C("Mở quầy đổi giờ lấy việc vặt", { flags: ["x49_quay"], counters: { x49_gio: 1 }, rel: 2 }, "Thành người giữ chợ, không còn rảnh nữa"),
           C("Cho vay giờ, lấy lãi bằng giờ", { flags: ["x49_cho_vay"], money: 0.1, counters: { x49_gio: 2 } }, "Giàu lên, có người không trả nổi")]),
      ],
      /* cu_lat */
      [
        card("x49_cl_can_gio", "Người cần giờ nhất", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} tìm đến lúc nửa đêm, mắt thâm như hai đồng xu. Người ấy đang làm ba việc một lúc, xin mua hai trăm giờ để được ngủ một giấc cho tử tế. Bạn thì từ lâu đã hẹn sẽ dành thời gian cho ${k.scar("do") || "một việc dang dở từ đời cũ"} khi nào rảnh, và cần đúng chừng ấy giờ.`,
          [C("Tặng người ấy hai trăm giờ", { flags: ["x49_tang"], counters: { x49_gio: -2 }, rel: 5 }, "Cứu một người, bạn hết vốn"),
           C("Giữ giờ để làm việc mình đã hẹn", { flags: ["x49_giu_hen"], happy: 3, know: 2 }, "Xong việc của mình, người kia lặng lẽ đi")]),
      ],
      /* day */
      [
        card("x49_day_mat_gia", "Giờ rảnh mất giá", (c, k) => `Công ty nào trong thành phố cũng bắt chước trả lương bằng giờ, và giờ rảnh rớt giá như lá mùa thu. ${k.gag()} ${n(c, "x49_gio") >= 3 ? "Kho giờ của bạn lớn nhất xóm, giờ chỉ đổi được vài bó rau." : "Số giờ ít ỏi của bạn giờ chỉ đổi được một cốc trà."}`,
          [C("Đổi hết giờ lấy tiền trước khi muộn", { money: 0.3, counters: { x49_gio: -2 }, flags: ["x49_doi_het"] }, "Cứu được chút tiền, mất hết vốn giờ"),
           C("Giữ nguyên, tin vào giờ", { flags: ["x49_tin_gio"], money: -0.2, counters: { x49_gio: 1 } }, "Nghèo đi, vẫn còn nguyên những buổi chiều")]),
        card("x49_day_ke_toan", "Ông kế toán thú nhận", (c, k) => `${cap(k.npc("ke_toan"))} tìm đến nhà bạn, lần đầu không mang theo con dấu. Ông thú nhận chính ông nghĩ ra trò trả lương bằng giờ để công ty khỏi sập, và giờ ông muốn làm việc cho bạn.${f(c, "x49_tang") ? " Ông nghe nói bạn đã cho đi hai trăm giờ, và muốn biết vì sao." : ""}`,
          [C("Nhận ông làm người giữ sổ giờ", { flags: ["x49_nhan_kt"], know: 2 }, "Có người giỏi sổ sách, thêm một miệng ăn"),
           C("Bảo ông về nghỉ, coi như trả nợ giờ", { flags: ["x49_tha"], counters: { x49_gio: 1 }, happy: 2 }, "Nhẹ lòng, mất một người biết việc")]),
      ],
      /* chung_ket */
      [
        card("x49_ket", "Kiểm kê giờ cuối mùa", (c, k) => `Cuối mùa, bạn đếm lại kho giờ của mình trên bàn ăn. ${k.gag()} ${n(c, "x49_gio") >= 3 ? "Số còn lại nhiều hơn một đời người dùng." : "Số còn lại vừa đủ cho vài buổi chiều."} ${k.scar("no") || c.debt > 0 ? `Riêng ${noOr(c, k)} thì vẫn tính bằng tiền, không chịu nhận giờ.` : "Riêng tiền chợ thì vẫn tính bằng tiền, không chịu nhận giờ."}`,
          (c) => finale(c,
            [O(L49_NGHE, "Dựng quầy bán giờ ở đầu chợ", "Một nghề lạ, khách lúc nào cũng vội", "street_vendor")],
            [O(L49_CHAM, "Giữ giờ cho mình, sống chậm", "Ít tiền, nhiều buổi chiều"),
             O(L49_DOI, "Bán hết kho giờ lấy tiền", "Có một khoản lớn, lại phải vội")])),
      ],
    ],
  }),
  "Giàu thời gian, nghèo tiền, cả xóm xếp hàng mua giờ",
);

/* ================================================================ X50: lịch in sai, đám giỗ của bạn khi bạn còn sống (nâng từ Codex a42) */

/** Codex a42 "Tờ lịch bị in hai tháng bảy" đã ra trong đời này. */
const a42 = (c: FactContext): boolean => f(c, "tp_a42_seen");
const gio = (c: FactContext): string => (vn(c) ? "đám giỗ" : "lễ tưởng niệm");
const ban50 = (c: FactContext): string => (vn(c) ? "bàn thờ" : "bàn tưởng niệm");

const L50_CHAM = land("x50_song_cham", "Bạn làm ít đi, đi thăm người nhiều lên. Mỗi tuần bạn nói một lời khen thật với một người còn sống.",
  { income_mult: 0.75, rel: 8, happy: 8 });
const L50_VE = land("x50_ve_gan", "Bạn dọn về sống gần họ hàng, cạnh nhà người em giữ sổ lễ. Lịch năm sau in đúng, nhưng ai cũng tự nhớ ngày.",
  { custom: "move_city", rel: 10 });
const L50_CHO = land("x50_cho_di", "Bạn chia một phần tiền dành dụm cho những người đã nói thật về mình, khi họ còn kịp tiêu. Di chúc chỉ còn một trang.",
  { money: -1.5, rel: 12, happy: 6 });

const X50 = weird("X50", "abs", ["ky", "mau", "tinh"],
  // Ưu tiên đời đã gặp thẻ a42 (tờ lịch in sai); không có thì cần Máu mủ cao và đã ở tuổi trung niên.
  (c) => c.age <= 72 && (a42(c) ? c.age >= 25 : c.pressure.mau >= 6 && c.age >= 40),
  (s, c) => `Đi dự ${gio(c)} của chính mình`,
  (s, c) => ({
    title: vn(c) ? "Đám giỗ của một người còn sống" : "Lễ tưởng niệm người còn sống",
    text: `Nếu bạn bước vào bây giờ, cả nhà sẽ phải thôi khen bạn. Tờ lịch gia đình năm nay in nhầm${a42(c) ? " lần nữa, sau vụ in hai tháng bảy," : ""} ghi ngày ${gio(c)} của bạn vào đúng chủ nhật này, và không ai dám cãi tờ lịch. Qua khe cửa, bạn thấy ảnh mình đặt giữa ${ban50(c)}, nến đã thắp, người em họ giữ sổ lễ đang lau nước mắt: "Nó sống tốt lắm, chỉ là chưa ai kịp nói."`,
  }),
  season({
    id: "w_X50", vn: "Lễ tưởng niệm người còn sống", color: "#d4a03a", years: [5, 9], weird: "abs",
    rules: { flags: ["w_own_memorial"] },
    reset: { cast: [
      { key: "chu_le", role: "sibling", label: "người em họ giữ sổ lễ" },
      { key: "chu_in", role: "neighbor", label: "ông chủ xưởng in lịch" },
    ] },
    gag: { key: "lich_sai", lines: [
      "Tờ lịch treo tường lật sang tháng mới, in hai ngày mười ba liền nhau.",
      "Lịch năm nay có thêm một ngày thứ tám trong tuần. Cả nhà thống nhất dùng nó để họp.",
      "Ông chủ xưởng in mang tới tờ lịch đính chính. Tờ đính chính in sai năm.",
      "Tờ lịch mới nhất in đúng hết, không sót ngày nào. Cả nhà nhìn nó đầy nghi ngờ.",
    ] },
    landings: [L50_CHAM, L50_VE, L50_CHO],
    beats: [
      /* mo_man */
      [
        card("x50_mo_khe_cua", "Nấp sau khe cửa", (c, k) => `Bạn đứng sau khe cửa nghe trọn ${gio(c)} của chính mình. Người ta kể chuyện bạn cõng ai qua đoạn đường ngập, cho ai vay tiền rồi không đòi, toàn những chuyện bạn đã quên. ${k.gag()}`,
          [C("Bước vào, cảm ơn từng người", { flags: ["x50_buoc_vao"], rel: 3, happy: 2 }, "Ấm lòng, cả phòng ngượng chín người"),
           C("Đứng nghe tiếp đến hết", { flags: ["x50_nghe_lom"], know: 2, counters: { x50_nghe: 1 } }, "Biết thêm nhiều điều, mang thêm một bí mật")]),
        card("x50_mo_cau_noi", "Câu nói ở bến xe", () => "Cuối buổi, một người bạn không nhớ mặt kể rằng mười năm trước, một câu bạn nói ở bến xe đã khiến người ấy quay về học tiếp. Bạn hoàn toàn không nhớ mình đã nói gì.",
          [C("Tìm người ấy hỏi lại câu đó", { flags: ["x50_tim_hoi"], pressure: { tinh: 1 } }, "Có thêm một người bạn, gặp lại mình ngày xưa"),
           C("Ghi câu chuyện vào sổ tay", { flags: ["x50_ghi_so"], counters: { x50_nghe: 1 } }, "Giữ làm của riêng, đọc lại những đêm khó ngủ")]),
      ],
      /* khoi_dong */
      [
        card("x50_kd_moi_nam", "Họ muốn làm mỗi năm", (c, k) => `${cap(k.npc("chu_le"))} ghi chép cẩn thận rồi đề nghị năm nào cũng làm, vì chưa bao giờ cả nhà tụ họp đông như thế. ${k.gag()}`,
          [C("Đồng ý, miễn là có mặt mình", { flags: ["x50_hang_nam"], rel: 4, counters: { x50_le: 1 } }, "Mỗi năm một lần nghe khen, một lần ngượng"),
           C("Đổi thành tiệc của người còn sống", { flags: ["x50_tiec_song"], happy: 3 }, "Vui hơn, nhưng người ta bớt nói thật")]),
        card("x50_kd_xuong_in", "Ông chủ xưởng in xin lỗi", (c, k) => `${cap(k.npc("chu_in"))} mang tới một giỏ trái cây và một chồng lịch mới. Ông thú nhận xưởng in sai đã mấy năm${a42(c) ? ", tính cả lần in hai tháng bảy" : ""}, và ít nhất bốn người khác cũng vừa được dự ${gio(c)} của chính mình.`,
          [C("Bắt ông in lại cho đúng", { flags: ["x50_in_lai"], money: 0.05 }, "Lịch đúng, chuyện cũng hết"),
           C("Nhờ ông in thêm ngày cho từng người trong họ", { flags: ["x50_in_them"], counters: { x50_le: 1 }, pressure: { ky: 1 } }, "Cả họ được nghe khen, cả họ cùng ngượng")]),
      ],
      /* cu_lat */
      [
        card("x50_cl_dieu_van", "Bài điếu văn viết tay", (c, k) => `Một năm sau, ${k.scar("nguoi") || "một người lâu không nói chuyện với bạn"} đến muộn, đứng trước ${ban50(c)} kể một câu về ${k.scar("do") || "những ngày cũ của bạn"}, rồi đọc một bài điếu văn viết tay. Bài ấy kể đúng một lần bạn sai, rất sai, rồi kể bạn đã sửa thế nào. Đọc xong, người ấy nhìn thẳng vào bạn: "Giờ thì nói được rồi."`,
          [C("Ôm người ấy trước mặt cả họ", { flags: ["x50_om"], rel: 5, pressure: { tinh: 1 } }, "Làm lành, cả họ có chuyện để kể"),
           C("Xin lỗi thêm một lần, cho đủ", { flags: ["x50_xin_loi"], counters: { x50_doi: 1 }, happy: 2 }, "Nhẹ lòng, người ấy cũng nhẹ")]),
      ],
      /* day */
      [
        card("x50_day_tin_don", "Tin bạn đã mất thật", (c, k) => `Tin bạn qua đời lan nhanh hơn tờ lịch đính chính. Ngân hàng tạm khóa tài khoản, điện thoại bị cắt, một người lạ đến hỏi thuê lại chỗ bạn đang ở. ${k.gag()}`,
          [C("Đi làm giấy xác nhận còn sống", { flags: ["x50_xac_nhan"], money: -0.05, happy: -2 }, "Mất mấy tháng chạy giấy, đời trở lại như cũ"),
           C("Tận hưởng vài tháng làm người đã khuất", { flags: ["x50_lam_khuat"], counters: { x50_doi: 1 }, bw: 4 }, "Tự do kỳ lạ, rắc rối về sau")]),
        card("x50_day_loi_khen", "Lời khen không thật", (c) => `${n(c, "x50_nghe") >= 1 ? "Lần nghe lén thứ ba," : "Một tối dọn dẹp,"} bạn phát hiện lời khen cảm động nhất năm ấy được nói ra để xin bạn ghi tên vào di chúc. Người nói vẫn ngồi đầu bàn mỗi ${gio(c)}, khóc rất đúng lúc.`,
          [C("Vẫn cảm ơn, coi như một món quà", { flags: ["x50_bo_qua"], happy: 1, rel: 1 }, "Giữ hòa khí, mất chút niềm tin"),
           C("Sửa di chúc ngay hôm ấy", { flags: ["x50_sua_di_chuc"], counters: { x50_doi: 1 } }, "Rõ ràng, cả họ sẽ biết lý do")]),
      ],
      /* chung_ket */
      [
        card("x50_ket", "Lần cuối người dự là chính mình", (c, k) => `${n(c, "x50_le") >= 1 ? "Mấy năm liền như thế, lần này" : "Lần cuối,"} ${gio(c)} của bạn đông hơn cả đám cưới trong họ. ${k.gag()} Bạn còn ${k.scar("no") || "một lời hứa cũ"} chưa trả, và lần đầu tiên biết người ta nhớ gì về mình. ${n(c, "x50_doi") >= 2 ? "Bạn đã bắt đầu sống khác từ mấy năm nay, giờ chỉ còn chọn cho trọn." : "Giờ đến lượt bạn chọn sống ra sao cho xứng."}`,
          [ending(L50_CHAM, "Làm ít đi, thăm người nhiều lên", "Ít tiền hơn, nhiều người nhớ hơn"),
           ending(L50_VE, "Dọn về sống gần họ hàng", "Gần người thương, xa chỗ cũ"),
           ending(L50_CHO, "Chia tiền khi mình còn sống", "Bớt của, được thấy người khác vui")]),
      ],
    ],
  }),
  "Nghe người ta khen mình thật lòng, rồi phải sống cho xứng",
);

export const ABS_41: WeirdBranch[] = [X41, X42, X43, X44, X45, X46, X47, X48, X49, X50];
