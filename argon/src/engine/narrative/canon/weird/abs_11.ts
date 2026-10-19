/**
 * Nhánh kỳ dị X11–X20 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 * Phi lý cực độ, giọng sitcom: cược ngay câu đầu, một hình ảnh cụ thể, một cú lật, thoại ngắn.
 * X12 (chết hợp pháp) và X15 (ngủ quên trong container) đụng tới pháp luật: chỉ tả hậu quả, không tả cách làm.
 */
import type { Choice, FactContext, PlantKind } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import type { Landing } from "../Season.ts";
import { C, cap, card, ending, finale as kitFinale, land, migrateOk, noOr, pathOpen, season, weird } from "../kit.ts";

const f = (c: FactContext, x: string): boolean => c.flags.has(x);
const n = (c: FactContext, x: string): number => c.counters[x] ?? 0;

/** Một lựa chọn chung kết; `path` = id con đường của landing nghề (bỏ trống với landing không phải nghề). */
interface Opt { l: Landing; label: string; hint: string; path?: string }
/**
 * Lựa chọn chung kết theo tuổi: tối đa 2 landing nghề còn mở ở tuổi này, phần còn lại (đến 3) là landing không phải nghề.
 * Mỗi nhánh khai báo ≥ 2 landing không phải nghề, nên ở tuổi nào cũng có ≥ 2 lựa chọn và ≥ 1 lối ra không phải nghề.
 */
function finale(c: FactContext, opts: Opt[]): Choice[] {
  const ch = (o: Opt) => ending(o.l, o.label, o.hint);
  return kitFinale(c.age, opts.filter((o) => o.path !== undefined).map(ch), opts.filter((o) => o.path === undefined).map(ch));
}

/** Vật gài cụ thể (đúng khóa): còn trong c.plants, hoặc đã gài (cờ "plant:<loại>:<khóa>"). Trả khóa đầu tiên khớp. */
function plantKey(c: FactContext, kind: PlantKind, keys: readonly string[]): string | undefined {
  return keys.find((k) => c.plants.some((p) => p.kind === kind && p.key === k) || c.flags.has(`plant:${kind}:${k}`));
}

/* ================================================================== X11 — Vận động viên môn bí ẩn */

const X11_VDV = land("x11_van_dong_vien", "Liên đoàn điền kinh gọi bạn lên tuyển, vì môn kia có ra sao thì bạn vẫn chạy nhanh nhất.", { custom: "become:runner", happy: 4, pressure: { danh: 2 } });
const X11_TT = land("x11_trong_tai", "Bạn thành trọng tài của môn này. Không ai cãi được bạn, vì không ai biết luật.", { custom: "become:referee", happy: 3 });
const X11_HLV = land("x11_hlv", "Bạn thành huấn luyện viên đầu tiên của môn này, người duy nhất dám nói mình hiểu luật.", { custom: "become:coach", happy: 4 });
const X11_SACH = land("x11_sach_luat", "Bạn bán quyền in cuốn luật cho một nhà xuất bản, tên bạn in ngay bìa, đủ sống thong thả vài năm.", { money: 2, happy: 3, pressure: { danh: 2 } });
const X11_SAN = land("x11_san_tap", "Bạn bỏ tiền dựng một sân tập cho trẻ con trong phố, vạch kẻ bằng sơn hẳn hoi.", { money: -1, happy: 6 });

/* ================================================================== X12 — Người đã chết hợp pháp */

const X12_TEN_CU = land("x12_ten_cu", "Bạn sống lại bằng tên cũ, trả nợ cũ cùng phí giấy tờ, giữ tờ giấy chứng tử làm kỷ niệm.", { custom: "repay:1.5", money: -2, happy: 4 });
const X12_TEN_MOI = land("x12_ten_moi", "Bạn nhận tên mới, dọn sang thành phố khác, bắt đầu lại ở nơi không ai gọi nhầm tên mình.", { custom: "move_city", money: -1, happy: 2 });
const X12_TANG_LE = land("x12_nghe_tang_le", "Sau ngần ấy chuyện, bạn hiểu nghề tang lễ hơn ai hết, và mở dịch vụ tổ chức tang lễ chu đáo nhất vùng.", { custom: "become:funeral_worker", happy: 3 });

/* ================================================================== X13 — Bảo tàng sống */

const X13_VE = land("x13_ban_ve", "Bạn ký tiếp, sống bằng tiền vé, và quen dần với việc ngày nào cũng có người lạ nhìn mình ăn cơm.", { income_mult: 1.3, happy: -4 });
const X13_BAN_DUT = land("x13_ban_dut", "Bạn bán đứt bộ sưu tập và quyền trưng bày cho bảo tàng, nhận tiền rồi dọn lên thành phố.", { money: 3, custom: "move_city", happy: 2 });
const X13_DONG_CUA = land("x13_dong_cua", "Bạn bồi thường hợp đồng, gỡ hết số kiểm kê, ngồi lên cái ghế của mình lần đầu sau nhiều năm.", { money: -1, happy: 8 });

/* ================================================================== X14 — Người thừa kế bốc thăm */

const X14_GIAU = land("x14_giau", "Tòa giữ nguyên lá thăm. Bạn thành người giàu nhất phố, kèm hai mươi phòng và một dòng họ ghét bạn.", { money: 5, happy: 3 });
const X14_CHIA = land("x14_chia_doi", "Bạn ký chia đôi với người nhà cụ, cầm phần của mình và được mời dự ngày tưởng nhớ cụ hằng năm.", { money: 2, happy: 5, rel: 4 });
const X14_TRANG = land("x14_trang_tay", "Tòa tuyên lá thăm vô hiệu. Bạn mất cả án phí lẫn tiền đã ứng trước, chỉ giữ được túi cam cuối cùng.", { money: -2, happy: -4 });

/* ================================================================== X15 — Kiện hàng biết đi */

const X15_O_LAI = land("x15_o_lai", "Bạn ở lại, giấy tờ hợp pháp sau nhiều năm chờ, và bắt đầu đời người di cư thật sự.", { custom: "migrate_now", money: -1 });
/** Không làm được giấy ở lại (chưa tự lập, hay không còn nước để đi): ở lại không giấy tờ, gửi tiền về. */
const X15_O_CHUI = land("x15_o_chui", "Bạn ở lại bến cảng ấy, sống không giấy tờ, làm công nhật cho bác gác kho và gửi về nhà một khoản lớn dành dụm từng đồng.", { money: -1, happy: -2 });
const X15_VE = land("x15_ve_nha", "Bạn về nước, nộp phạt, mang theo ba từ ngoại ngữ và một cái tem đã bạc màu.", { money: -1.5, happy: 4 });
const X15_THUYEN = land("x15_thuyen_vien", "Bạn ký hợp đồng thuyền viên trên chính con tàu từng chở mình, lần này có hộ chiếu và giường riêng.", { custom: "become:sailor", money: -0.5 });

/* ================================================================== X16 — Phát ngôn viên của chó */

const X16_MC = land("x16_mc", "Bạn thành MC truyền hình, người duy nhất mở chương trình bằng câu: chào quý vị và các bạn bốn chân.", { custom: "become:tv_host", happy: 3 });
const X16_PT = land("x16_phat_thanh", "Bạn thành phát thanh viên, giọng đọc quen của cả vùng, con chó nằm dưới chân bàn mỗi sáng.", { custom: "become:radio_voice", happy: 4 });
const X16_HOI_KY = land("x16_hoi_ky", "Bạn viết hồi ký nhân danh con chó. Sách bán chạy, nó được chia phần bằng xương.", { money: 2, happy: 3 });
const X16_CUU_HO = land("x16_cuu_ho", "Bạn dồn tiền danh tiếng lập một trạm cứu hộ chó mèo bị bỏ rơi.", { money: -1.5, happy: 7 });

/* ================================================================== X17 — Con phố mang tên tôi */

const X17_CONG_TAC = land("x17_cong_tac_xa_hoi", "Bạn mở một văn phòng nhỏ ở đầu phố, giúp ai cần thì giúp, không cần biển tên.", { custom: "become:social_worker", happy: 4 });
const X17_DAI_BIEU = land("x17_dai_bieu", "Bạn ra ứng cử và trúng, nhờ cả một con phố mang tên mình. Từ nay danh tiếng là việc làm.", { custom: "become:politician", happy: 2, pressure: { danh: 3 } });
const X17_DI = land("x17_don_di", "Bạn dọn sang thành phố khác, nơi không con phố nào biết tên bạn.", { custom: "move_city", happy: 5 });
const X17_BAN_TEN = land("x17_ban_ten", "Bạn bán quyền dùng tên cho tiệm bánh đầu phố, sống bằng tiền bản quyền và chịu tiếng.", { money: 1.5, happy: -2, pressure: { danh: 2 } });

/* ================================================================== X18 — Nhà côn trùng học bất đắc dĩ */

const X18_KH = land("x18_nha_khoa_hoc", "Bạn thành nghiên cứu viên thật, đứng tên ba bài báo, và vẫn bị gọi là người đặt tên con bọ.", { custom: "become:scientist", happy: 4 });
const X18_BT = land("x18_giu_rung", "Bạn thành người giữ rừng, sống trong căn chòi cạnh tổ của loài bọ mang câu chửi của mình.", { custom: "become:environmentalist", happy: 5 });
const X18_MAU = land("x18_ban_mau", "Bạn bán bộ sưu tập mẫu cho một viện bảo tàng, đủ khép mọi chuyện cũ và còn dư.", { money: 2, custom: "repay:1", happy: 2 });
const X18_HIEN = land("x18_hien_dat", "Bạn dồn tiền mua lại mảnh rừng nhỏ và hiến cho khu bảo tồn.", { money: -2, happy: 7 });

/* ================================================================== X19 — Đầu bếp giả mạo */

const X19_DB = land("x19_dau_bep", "Bạn mở bếp riêng bằng tên thật. Khách cũ tìm đến, gọi đúng món tủ có tên thật của bạn.", { custom: "become:restaurateur", happy: 5 });
const X19_LO = land("x19_lo", "Bạn công khai mọi chuyện, bồi thường đủ cả, và cả vùng biết bạn từng là đầu bếp giả.", { money: -2, happy: 2 });
const X19_QUAN = land("x19_quan_com", "Bạn mua một gian quán cơm nhỏ, nấu đúng mấy món mình biết, không thêm tên kêu.", { buy: { kind: "shop", name: "gian quán cơm nhỏ", price: 1, borrow: true }, happy: 4 });

/* ================================================================== X20 — Hôn nhân giấy tờ */

const X20_YEU = land("x20_yeu_that", "Hai người ký lại giấy kết hôn, lần này cố ý, và giữ vạch phấn làm kỷ niệm.", { custom: "marry", happy: 8 });
const X20_CU = land("x20_cuoi_dung_nguoi", "Tờ giấy cũ được hủy. Bạn cưới đúng người hứa hôn ban đầu, trong một đám cưới chỉ có mười khách.", { custom: "marry", happy: 6 });
const X20_MOT_MINH = land("x20_mot_minh", "Hủy xong mọi giấy tờ, bạn ở một mình, trả án phí bằng cả năm thu nhập và thấy nhẹ nhõm lạ lùng.", { money: -1, happy: 3 });

/* X13: đồ ông bà để lại (đúng khóa vật gài), nhãn cố định để cửa, biến cố và thẻ cùng nói về một món. */
export const HEIRLOOMS: Record<string, string> = {
  ban_do_cua_ong: "tấm bản đồ ông để lại", ban_do_kho_bau_cua_ong: "tờ bản đồ kho chôn của ông",
  vat_vang_trong_heo_dat: "vật bằng vàng ông gửi trong con heo đất",
};   // chỉ khóa có route Codex gài (Task 20c bỏ khóa chết dong_ho_cua_ong); canon-test kiểm
const heirloomKey = (c: FactContext): string | undefined => plantKey(c, "object", Object.keys(HEIRLOOMS));
const museumItem = (c: FactContext): string => HEIRLOOMS[heirloomKey(c) ?? ""] ?? "chiếc tủ gỗ cũ trong nhà";
/* X16: con chó của người chơi (đúng khóa vật gài), một tên dùng ở cửa, biến cố và thẻ. */
const DOGS: Record<string, string> = { con_cho_lam_nhan_chung: "con chó từng bị gọi là nhân chứng", hai_con_cho_hai_nha: "con chó nhà bạn trong cặp chó hai nhà" };
const dogKey = (c: FactContext): string | undefined => plantKey(c, "animal", Object.keys(DOGS));
const dogName = (c: FactContext): string => DOGS[dogKey(c) ?? ""] ?? "con chó nhà bạn";
/* X15: làm kho, cảng hoặc giao hàng (họ nghề lái xe, nhà máy, hoặc con đường shipper / tài xế đường dài / thuyền viên). */
const handlesCargo = (c: FactContext): boolean => f(c, "job_driver") || f(c, "job_factory") || f(c, "life_shipper") || f(c, "life_long_hauler") || f(c, "life_sailor")
  || /(^|\s)(kho|cảng)(\s|$)|bốc xếp|giao hàng/.test(c.job);
/* X15: có đường ở lại hợp pháp (người bảo lãnh, hoặc hồ sơ đủ dày ở nhịp đáy). */
const x15Legal = (c: FactContext): boolean => f(c, "x15_bao_lanh") || n(c, "x15_hop_phap") >= 3;
/* X19: biết nấu (đầu bếp, thợ bánh, nội trợ, giúp việc, hoặc nghề có chữ bếp / nấu). */
const cooks = (c: FactContext): boolean => f(c, "life_restaurateur") || f(c, "life_baker") || f(c, "life_homemaker") || f(c, "job_domestic") || /bếp|nấu/.test(c.job);

export const ABS_11: WeirdBranch[] = [
  /* ---------------------------------------------------------------- X11 */
  weird("X11", "abs", ["ky", "than", "danh"],
    (c) => c.age >= 14 && c.age <= 55 && (c.health >= 70 || n(c, "exercise") >= 4 || f(c, "athlete") || f(c, "pro_athlete") || c.luck > 0.9),
    () => "Ký giấy vào đội tuyển một môn không ai biết luật",
    (s) => ({ title: "Đội tuyển môn không ai biết luật", text: `Một người đàn ông mặc áo thể thao đứng chặn cửa nhà bạn ở ${s.noi || "nơi này"}, tay cầm giấy triệu tập đóng dấu đỏ. Môn này cả nước chỉ có bảy người chơi, và một người vừa bong gân. "Chạy nhanh là được," ông nói, "luật thì ra sân rồi tính."` }),
    season({ id: "w_X11", vn: "Vận động viên môn bí ẩn", color: "#e0a020", years: [6, 10], weird: "abs",
      rules: { flags: ["w_mon_bi_an"] },
      reset: { cast: [{ key: "hlv", role: "mentor", label: "ông huấn luyện viên" }, { key: "doi_thu", role: "rival", label: "đội trưởng đội bạn" }] },
      gag: { key: "luat_moi", lines: [
        "Bạn hỏi luật. Ông huấn luyện viên đáp: bóng hình vuông, không ai được chạm tay, trừ thứ Ba.",
        "Luật được giải thích lần thứ hai: bóng vẫn vuông, nhưng thứ Ba đã bị bỏ, thay bằng ngày mưa.",
        "Lần thứ ba bạn hỏi luật, ông lấy ra một cuốn sổ, lật đúng trang trống rồi gật đầu rất chắc.",
        "Cuốn luật cuối cùng cũng in xong. Trang đầu ghi: mọi tranh cãi do người chạy nhanh nhất quyết.",
      ] },
      landings: [X11_VDV, X11_TT, X11_HLV, X11_SACH, X11_SAN],
      beats: [
        [
          card("x11_mo_tap", "Buổi tập đầu tiên", (c, k) => `Sân tập là bãi đất sau một nhà kho, vạch vôi đã mờ một nửa. ${cap(k.npc("hlv"))} đưa bạn bộ đồ số 7 và một quả bóng nặng như viên gạch. ${k.gag()}`,
            [C("Tập như thể hiểu hết", { flags: ["x11_gia_hieu"], health: 2, counters: { x11_phong_do: 1 } }, "Được đá chính, càng ngày càng khó hỏi lại"),
             C("Ngồi ghi chép mọi điều ông nói", { know: 3, flags: ["x11_ghi_chep"] }, "Chậm vào đội hình, có cuốn sổ tay riêng")]),
          card("x11_mo_dong_doi", "Sáu đồng đội", () => `Sáu người còn lại gồm một bác bán cá, hai chị em sinh đôi, một thầy giáo về hưu và hai người không ai nhớ tên. Không ai biết luật, nhưng ai cũng có ý kiến. "Mình chơi vì danh dự," bác bán cá nói, "và vì có suất ăn trưa."`,
            [C("Nhận làm đội trưởng", { flags: ["x11_doi_truong"], counters: { x11_phong_do: 1 }, happy: 2 }, "Có tiếng nói, cũng có người để đổ lỗi"),
             C("Chỉ lo ăn trưa cho đủ", { money: 0.05, health: 2, flags: ["x11_an_trua"] }, "Đỡ mệt, mất tiếng nói trong đội")]),
        ],
        [
          card("x11_kd_giai", "Trận ra mắt khu vực", (c, k) => `Đội được mời dự giải khu vực. Đối thủ đến với ba xe khách và một ban nhạc riêng, còn ${k.npc("doi_thu")} bắt tay bạn rất lâu, như đang đo cổ tay. ${k.gag()}`,
            [C("Chơi theo bản năng, chạy hết sân", { health: -3, counters: { x11_phong_do: 2 }, flags: ["x11_chay_het"] }, "Có thể thắng, có thể chấn thương"),
             C("Xin trọng tài giải thích luật trước", { know: 2, flags: ["x11_hoi_trong_tai"] }, "Hiểu thêm chút ít, đội bạn cười cả buổi")]),
          card("x11_kd_tai_tro", "Nhà tài trợ đầu tiên", (c) => `${f(c, "x11_chay_het") ? "Đoạn phim bạn chạy hết sân, ngã ba lần vẫn đứng dậy, được chia sẻ khắp nơi." : "Đoạn phim bạn đứng giữa sân hỏi luật bỗng được chia sẻ khắp nơi."} Một hãng nước giải khát muốn in mặt bạn lên nhãn chai, với điều kiện đội phải thắng ít nhất một trận.`,
            [C("Ký hợp đồng, in mặt lên nhãn", { money: 0.3, flags: ["x11_tai_tro"] }, "Có tiền, giờ thua là cả phố biết"),
             C("Từ chối, chơi cho vui", { happy: 3, flags: ["x11_choi_vui"] }, "Nhẹ đầu, đội vẫn ăn cơm hộp")]),
        ],
        [
          card("x11_cl_luat_goc", "Bản luật gốc", (c, k) => `Trước trận bán kết, ${k.scar("nguoi") || "một người quen cũ"} tìm đến sân tập, chìa ra trang đầu của một tờ giấy ố vàng: bản luật gốc viết tay của môn này. Muốn đọc nốt, người đó đòi bạn nhường lại thứ mang theo từ đời cũ: ${k.scar("do") || "món đồ quý nhất bạn có"}. Chỉ trang đầu thôi đã đủ thấy cả đội đang chạy ngược chiều.`,
            [C("Đổi, rồi dạy cả đội chạy đúng chiều", { flags: ["x11_luat_goc"], counters: { x11_phong_do: 2 }, happy: 2 }, "Đội mạnh hẳn, mất một thứ của đời cũ"),
             C("Không đổi, cứ chạy như cũ", { flags: ["x11_chay_nguoc"], happy: 1 }, "Giữ được thứ của đời cũ, đội vẫn lạc hướng"),
             C("Đọc to trang đầu cho cả hai đội", { flags: ["x11_cong_bo"], rel: 3, know: 2 }, "Trận đấu công bằng, mất lợi thế riêng", { tier: "sovereign" })]),
        ],
        [
          card("x11_day_dau_goi", "Đầu gối kêu lách cách", (c, k) => `${f(c, "x11_chay_het") ? "Cái đầu gối từng chạy hết sân năm nào" : "Đầu gối trái của bạn"} bắt đầu kêu lách cách mỗi lần lên cầu thang. ${k.gag()} Bác sĩ của đội nói nhỏ: nghỉ một mùa thì lành, chơi tiếp thì không chắc.`,
            [C("Nghỉ một mùa", { health: 5, counters: { x11_phong_do: -1 }, flags: ["x11_nghi"] }, "Lành gối, đội thua liền ba trận"),
             C("Băng gối, chơi tiếp", { health: -6, counters: { x11_phong_do: 1 }, flags: ["x11_choi_dau"] }, "Giữ vị trí, đầu gối nhớ mãi")]),
          card("x11_day_bo_doi", "Ba người bỏ đội", (c, k) => `${cap(k.npc("doi_thu"))} chiêu mộ ba người trong đội bạn, trả gấp đôi suất ăn trưa. ${f(c, "x11_tai_tro") ? "Hãng nước giải khát dọa rút tài trợ nếu đội không đủ người ra sân." : "Đội chỉ còn bốn người, chưa đủ để ra sân."} Ngoài quán nước, cả khu phố đang đặt cược xem đội có giải tán không.`,
            [C("Đi từng nhà năn nỉ họ về", { rel: 3, health: -2, counters: { x11_phong_do: 1 }, flags: ["x11_giu_doi"] }, "Giữ được đội, mất trọn một tháng"),
             C("Tuyển người mới ngoài chợ", { money: -0.1, flags: ["x11_doi_moi"] }, "Đủ người, chẳng ai hiểu luật")]),
        ],
        [
          card("x11_ket", "Trận chung kết dưới mưa", (c, k) => `Trận chung kết diễn ra dưới mưa, khán đài chật kín người không hiểu chuyện gì đang xảy ra. ${n(c, "x11_phong_do") >= 4 ? "Đội bạn thắng, theo cách tính của trọng tài." : "Đội bạn thua sát nút, theo cách tính của trọng tài."} ${k.gag()} Đêm đó về nhà, ${noOr(c, k)} vẫn chờ trên bàn, và bạn phải chọn sống tiếp với môn này bằng cách nào.`,
            (c) => finale(c, [
              { l: X11_VDV, label: "Nhận lời lên tuyển điền kinh", hint: "Chạy thật, có huy chương thật", path: "runner" },
              { l: X11_TT, label: "Cầm còi làm trọng tài", hint: "Quyền lớn, ai thua cũng ghét bạn", path: "referee" },
              { l: X11_HLV, label: "Nhận dạy đội trẻ", hint: "Thu nhập vừa phải, cả đời gắn với môn này", path: "coach" },
              { l: X11_SACH, label: "Bán quyền in cuốn luật", hint: "Có tiền, rời sân cỏ" },
              { l: X11_SAN, label: "Bỏ tiền dựng sân tập cho trẻ con", hint: "Mất một năm thu nhập, được cả phố nhớ" },
            ])),
        ],
      ] }),
    "Phi lý: vào đội tuyển trước, hỏi luật sau"),

  /* ---------------------------------------------------------------- X12 */
  weird("X12", "abs", ["ky", "danh", "tien"],
    (c) => c.age >= 25 && c.age <= 70 && (c.debt > 0 || c.plants.some((p) => p.kind === "debt")) && (c.reputation >= 50 || c.pressure.danh >= 3),
    () => "Đến dự đám tang của chính mình",
    (s, c) => ({ title: "Đám tang đông hơn đám cưới", text: `Sáng thứ Bảy, bạn đi ngang ${s.noi || "nơi này"} và thấy ảnh của chính mình đặt giữa một đám tang đông nghịt, hoa trắng xếp tới tận cổng. Một người trùng họ tên vừa qua đời, và giấy chứng tử in nhầm số giấy tờ của bạn. Khách đến viếng ${c.married || c.widowed ? "đông gấp đôi đám cưới của bạn năm nào" : "đông hơn mọi đám cưới bạn từng đi dự"}. "Sống thì chẳng ai đến," một bà cụ thì thầm, "chết mới biết mình được thương."` }),
    season({ id: "w_X12", vn: "Người đã chết hợp pháp", color: "#d9822b", years: [5, 9], weird: "abs",
      rules: { income: 0.3, flags: ["w_legally_dead"] },
      reset: { cast: [{ key: "ho_tich", role: "official", label: "cô cán bộ hộ tịch" }, { key: "chu_no", role: "creditor", label: "ông chủ nợ" }] },
      gag: { key: "quay_ho_tich", lines: [
        "Ở quầy hộ tịch, cô cán bộ nói bình thản: người đã mất không được tự nộp đơn, phải có người nhà nộp hộ.",
        "Bạn nộp lại đơn qua người nhà. Hồ sơ bị trả về vì chữ ký của người đã mất không hợp lệ.",
        "Lần thứ ba, cô cán bộ chỉ hỏi một câu: hôm nay anh chị đến với tư cách người sống hay người đã mất?",
        "Cô cán bộ hộ tịch giờ đã quen mặt bạn, kê hẳn một chiếc ghế riêng có tấm bảng: dành cho người đã khuất.",
      ] },
      landings: [X12_TEN_CU, X12_TEN_MOI, X12_TANG_LE],
      beats: [
        [
          card("x12_mo_dieu_van", "Nghe điếu văn của chính mình", (c, k) => `Bạn đứng cuối đám, nghe người ta đọc điếu văn về mình. Có người khóc thật, có người đến chỉ để ăn, có người kể một chuyện tốt bạn chưa từng làm. ${k.gag()}`,
            [C("Bước lên tuyên bố mình còn sống", { flags: ["x12_hien_hinh"], happy: -2, counters: { x12_song: 1 } }, "Cả đám tang hoảng loạn, ít ra mọi chuyện rõ ràng"),
             C("Đứng yên nghe hết điếu văn", { flags: ["x12_nghe_dieu_van"], know: 2, happy: 3 }, "Biết ai thương mình, lỡ mất thời điểm vàng")]),
          card("x12_mo_vong_hoa", "Vòng hoa của chủ nợ", (c, k) => `${cap(k.npc("chu_no"))} gửi vòng hoa to nhất đám, ruy băng ghi: xin chia buồn, khoản nợ xin khép lại. Ông lau nước mắt rất thật, rồi gạch tên bạn khỏi cuốn sổ ngay trước linh cữu.`,
            [C("Chạy tới nói thật với ông ấy", { flags: ["x12_thu_that"], counters: { x12_song: 1 }, rel: 2 }, "Giữ chữ tín, khoản nợ quay về nguyên vẹn"),
             C("Để ông ấy khép sổ", { custom: "repay:0.5", flags: ["x12_khep_so"], pressure: { luat: 1 } }, "Nhẹ nợ hôm nay, mang thêm một bí mật")]),
        ],
        [
          card("x12_kd_tai_khoan", "Tài khoản của người quá cố", (c, k) => `Ngân hàng khóa tài khoản của bạn${c.home_owner ? ", căn nhà đứng tên bạn chuyển sang chờ thừa kế" : c.independent ? ", chủ nhà đòi lại phòng" : ", tên bạn bị gạch khỏi hồ sơ cư trú của gia đình"}${c.has_job ? ", chỗ làm gửi thư chia buồn, từ nay lương chỉ trả qua người nhà và bớt gần hết" : ", mọi đơn xin việc bị trả về vì người nộp đã mất"}. ${k.gag()} Trên giấy tờ, bạn không còn được làm gì, kể cả mắc nợ.`,
            [C("Nhận làm việc vặt trả công ngày", { money: 0.1, health: -2, flags: ["x12_viec_vat"] }, "Sống tạm được, không ai bảo hiểm cho bạn"),
             C("Dọn về ở nhờ người thân", { rel: 3, happy: -2, flags: ["x12_o_nho"] }, "Có mái nhà, mất chút tự trọng")]),
          card("x12_kd_tu_do", "Tự do của người đã khuất", (c) => `Một tuần sau, bạn nhận ra không ai gọi điện đòi tiền, không ai mời họp, ${c.married ? "không ai nhắc ngày kỷ niệm cưới" : "không ai hỏi bao giờ lấy vợ lấy chồng"}. Bạn ngủ một mạch đến trưa lần đầu sau mười năm. "Chết sướng thế này thì sống làm gì," bạn nghĩ, rồi giật mình vì đã nghĩ thế.`,
            [C("Tận hưởng thêm một thời gian", { happy: 5, flags: ["x12_tan_huong"], counters: { x12_song: -1 } }, "Nghỉ ngơi thật, giấy tờ càng khó sửa"),
             C("Đi nộp đơn xin được sống lại", { flags: ["x12_nop_don"], counters: { x12_song: 1 }, money: -0.05 }, "Bắt đầu một hành trình giấy tờ rất dài")]),
        ],
        [
          card("x12_cl_nhan_chung", "Nhân chứng của người sống", (c, k) => `Tòa cần một nhân chứng xác nhận bạn đúng là bạn. ${cap(k.scar("nguoi") || "một người quen cũ")} được mời tới, nhìn bạn rất lâu rồi nói: "Trông thì giống, nhưng người tôi biết không gầy thế." Để thuyết phục, bạn phải kể lại chuyện ${k.scar("do") || "những ngày cũ"}, chuyện chỉ hai người biết.`,
            [C("Kể hết, kể cả đoạn xấu hổ", { flags: ["x12_nhan_chung"], counters: { x12_song: 2 }, happy: -2 }, "Được công nhận, cả tòa nghe chuyện riêng"),
             C("Thôi, không cần người ấy làm chứng", { flags: ["x12_tu_chung"], happy: 1 }, "Giữ thể diện, hồ sơ kéo thêm một năm")]),
        ],
        [
          card("x12_day_mao_danh", "Có người dùng tên bạn", (c, k) => `${k.gag()} Trong lúc bạn còn đang chết trên giấy, có người đã mượn tên bạn vay ba khoản ở ba nơi khác nhau. ${f(c, "x12_khep_so") ? `${cap(k.npc("chu_no"))} nghe tin, lật lại cuốn sổ cũ và bắt đầu nghi ngờ đám tang năm nào.` : "Cơ quan điều tra gửi giấy mời, hỏi người đã mất thì vay tiền bằng cách nào."}`,
            [C("Hợp tác điều tra đến cùng", { flags: ["x12_hop_tac"], health: -3, counters: { x12_song: 1 } }, "Mệt mỏi, nhưng tên bạn được rửa sạch"),
             C("Im lặng, chờ mọi chuyện tự lắng", { flags: ["x12_im_lang"], pressure: { luat: 2 }, happy: -3 }, "Khỏi phải trình diện, nợ lạ vẫn mang tên bạn")]),
          card("x12_day_bia", "Tấm bia ghi tên mình", () => "Gia đình người quá cố mời bạn ra thăm mộ, vì giờ hai bên coi như họ hàng. Trên tấm bia có tên bạn, ngày sinh của bạn, và một câu khắc rất đẹp mà bạn chưa bao giờ dám nói về mình.",
            [C("Nhận làm họ hàng với gia đình ấy", { rel: 4, flags: ["x12_ho_hang"] }, "Thêm một nhà để về, thêm một ngày tưởng niệm"),
             C("Xin họ khắc lại tấm bia", { money: -0.1, flags: ["x12_khac_bia"], happy: 1 }, "Rạch ròi, gia đình ấy hơi buồn")]),
        ],
        [
          card("x12_ket", "Phiên tòa sống lại", (c, k) => `Cuối cùng tòa mở phiên xử: bạn được sống lại bằng tên cũ, hoặc nhận một tên hoàn toàn mới. ${n(c, "x12_song") >= 3 ? "Hồ sơ của bạn dày và sạch, thẩm phán chỉ hỏi đúng một câu." : "Hồ sơ của bạn mỏng đến mức thẩm phán phải hỏi lại bạn là ai."} ${k.gag()} ${f(c, "x12_hien_hinh") ? "Ai cũng nhớ ngày bạn đứng dậy giữa đám tang, nên chẳng ai phản đối." : "Nhiều người vẫn tin bạn đã mất thật."} Sống lại bằng tên cũ nghĩa là ${noOr(c, k)} sống lại cùng bạn, cộng thêm ${f(c, "x12_im_lang") ? "mấy khoản nợ lạ kẻ mạo danh để lại" : "phí giấy tờ của ngần ấy năm"}.`,
            (c) => finale(c, [
              { l: X12_TANG_LE, label: "Mở dịch vụ tang lễ", hint: "Nghề lạ, không ai hiểu khách bằng bạn", path: "funeral_worker" },
              { l: X12_TEN_CU, label: "Sống lại bằng tên cũ, trả nợ", hint: "Sạch sẽ, mất hai năm thu nhập" },
              { l: X12_TEN_MOI, label: "Nhận tên mới, đi thành phố khác", hint: "Nhẹ quá khứ, mất hết người quen" },
            ])),
        ],
      ] }),
    "Phi lý: chết trên giấy, nợ tạm ngủ, việc cũng mất"),

  /* ---------------------------------------------------------------- X13 */
  weird("X13", "abs", ["ky", "dat", "mau"],
    (c) => c.age >= 25 && c.age <= 70 && (c.home_owner || heirloomKey(c) !== undefined),
    (s, c) => heirloomKey(c) ? "Để đồ ông để lại thành hiện vật bảo tàng" : "Để nhà mình thành bảo tàng",
    (s, c) => ({ title: "Chiếc ghế có số kiểm kê", text: `Một đoàn người đeo găng tay trắng bước vào nhà bạn ở ${s.noi || "nơi này"}, dán số kiểm kê lên cái ghế, cái nồi và ${museumItem(c)}. Hội đồng đã thẩm định: đồ đạc nhà bạn là hiện vật quý của một thời. "Xin đừng ngồi lên hiện vật," cô trưởng đoàn nói, đúng lúc bạn định ngồi xuống ghế của chính mình.` }),
    season({ id: "w_X13", vn: "Bảo tàng sống", color: "#e8a33d", years: [6, 10], weird: "abs",
      rules: { income: 1.2, flags: ["no_privacy", "w_bao_tang_song"] },
      reset: { cast: [{ key: "huong_dan", role: "official", label: "cô hướng dẫn viên" }, { key: "khach_quen", role: "neighbor", label: "ông khách ngày nào cũng đến" }] },
      gag: { key: "thuyet_minh", lines: [
        "Cô hướng dẫn viên chỉ vào cái nồi: đây là nồi chủ nhà nấu cơm suốt ba mươi năm. Bạn mới mua nó tháng trước.",
        "Cô hướng dẫn viên chỉ vào bạn đang ngủ trưa: hiện vật sống, xin quý khách giữ trật tự và đừng cho ăn.",
        "Bản thuyết minh mới có thêm đoạn: chủ nhà từng khóc trong nhà tắm này. Bạn không nhớ, nhưng khách thì khóc theo.",
        "Bản thuyết minh cuối cùng chỉ có một câu: chủ nhà vẫn đang sống ở đây. Khách vỗ tay rất lâu.",
      ] },
      landings: [X13_VE, X13_BAN_DUT, X13_DONG_CUA],
      beats: [
        [
          card("x13_mo_ve", "Quầy vé trước cổng", (c, k) => `Cổng nhà bạn giờ có một quầy bán vé, giá vé bằng một bữa sáng, và hiện vật số 1 là ${museumItem(c)}. Khách tham quan xếp hàng từ sáu giờ, nhìn bạn đánh răng qua sợi dây chắn bọc nhung. ${k.gag()}`,
            [C("Diễn cho đúng bản thuyết minh", { flags: ["x13_dien"], money: 0.1, happy: -2, counters: { x13_khach: 1 } }, "Khách thích, bạn mệt"),
             C("Sống như cũ, kệ khách nhìn", { flags: ["x13_that"], happy: 1 }, "Thật thà, vé bán chậm hơn")]),
          card("x13_mo_khach_quen", "Người khách mua vé tháng", (c, k) => `${cap(k.npc("khach_quen"))} mua vé tháng, ngày nào cũng ngồi đúng một chỗ trên băng ghế, nhìn bạn ăn cơm và ghi chép. Đến ngày thứ mười, người ấy hỏi: "Món canh hôm nay có giống hôm qua không, hay là hiện vật mới?"`,
            [C("Mời người ấy ngồi ăn cùng", { rel: 3, flags: ["x13_ban_an"] }, "Có thêm một người bạn, tốn thêm một bát"),
             C("Nhờ kéo dây chắn ra xa hơn", { flags: ["x13_day_chan"], happy: 1 }, "Yên hơn, khách quen buồn ra mặt")]),
        ],
        [
          card("x13_kd_phong_ngu", "Phòng ngủ thành phòng trưng bày", (c, k) => `Bảo tàng cần thêm diện tích. Phòng ngủ của bạn được chuyển thành phòng trưng bày, còn bạn được cấp một chiếc giường gấp trong kho. ${k.gag()}`,
            [C("Đồng ý, đổi lấy phần trăm tiền vé", { money: 0.2, flags: ["x13_phan_tram"], health: -2, counters: { x13_khach: 1 } }, "Tiền vào đều, ngủ không yên"),
             C("Đòi giữ lại phòng ngủ", { flags: ["x13_giu_phong"], happy: 2, counters: { x13_khach: -1 } }, "Còn chỗ riêng, bảo tàng giận")]),
          card("x13_kd_vo_chen", "Hiện vật số 112", (c, k) => `Sáng nay bạn làm rơi cái chén uống nước quen thuộc. Theo hợp đồng, đó là hiện vật số 112, và bạn vừa phá hoại di sản. ${cap(k.npc("huong_dan"))} lập biên bản, mắt đỏ hoe.`,
            [C("Bồi thường đúng giá hiện vật", { money: -0.2, flags: ["x13_boi_thuong"] }, "Xong chuyện, đắt hơn cả bộ chén mới"),
             C("Dán lại, ghi chú: vết nứt lịch sử", { flags: ["x13_vet_nut"], counters: { x13_khach: 1 }, happy: 2 }, "Khách thích hơn, hội đồng nghi ngờ")]),
        ],
        [
          card("x13_cl_hien_vat", "Người biết chuyện thật", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} mua vé vào xem, đứng trước tấm biển thuyết minh về ${k.scar("do") || "một món đồ cũ của bạn"} và nói to giữa phòng: "Chuyện này sai hết, tôi biết rõ hơn ai hết." Cả đoàn khách quay sang nhìn bạn.`,
            [C("Mời người ấy kể lại cho đúng", { flags: ["x13_su_that"], rel: 2, counters: { x13_khach: 1 } }, "Bảo tàng có chuyện thật, bạn mất một bí mật"),
             C("Nhờ bảo vệ mời người ấy ra", { flags: ["x13_duoi"], happy: -1 }, "Giữ phiên bản đẹp, mất một người cũ")]),
        ],
        [
          card("x13_day_rieng_tu", "Không còn chỗ để khóc", (c, k) => `${k.gag()} Bạn nhận ra trong nhà không còn góc nào không có dây chắn hay ống kính. Tối đó bạn ra ngồi ở bậc thềm, và một vị khách đi tham quan buổi tối chụp ảnh bạn như chụp tượng.`,
            [C("Xin mỗi tuần đóng cửa một ngày", { flags: ["x13_ngay_nghi"], money: -0.1, happy: 4 }, "Có một ngày làm người, mất một ngày tiền vé"),
             C("Chịu đựng, tiền vé đang lên", { money: 0.2, happy: -5, health: -2, counters: { x13_khach: 1 } }, "Giàu lên, buồn hơn")]),
          card("x13_day_mua_dut", "Đề nghị mua đứt", (c) => `Hội đồng bảo tàng đề nghị mua đứt cả bộ sưu tập lẫn quyền trưng bày nơi bạn ở, kèm điều khoản bạn được ở lại làm hiện vật sống trọn đời. ${f(c, "x13_vet_nut") ? "Họ nói vết nứt lịch sử trên cái chén đã làm số khách tăng gấp ba." : "Họ nói đã có ba bảo tàng khác hỏi mua bộ sưu tập này."} Trong phong bì có cả lịch khám sức khỏe định kỳ cho hiện vật.`,
            [C("Xin thêm thời gian suy nghĩ", { flags: ["x13_suy_nghi"], know: 1 }, "Chưa mất gì, chưa được gì"),
             C("Thuê luật sư đọc hợp đồng", { money: -0.15, flags: ["x13_luat_su"], know: 3 }, "Tốn tiền, biết rõ mình đang bán gì")]),
        ],
        [
          card("x13_ket", "Ngày kiểm kê cuối cùng", (c, k) => `Mùa tham quan cuối cùng sắp khép lại${n(c, "x13_khach") >= 3 ? ", với số khách cao nhất từ trước tới nay" : ""}. ${f(c, "x13_su_that") ? `Bảng thuyết minh về ${museumItem(c)} giờ kể đúng chuyện thật, và khách đứng đó lâu nhất.` : `Bảng thuyết minh về ${museumItem(c)} vẫn kể phiên bản đẹp, chỉ bạn biết nó sai ở đâu.`} ${k.gag()} Tiền vé tích góp đủ ${k.scar("no") || c.debt > 0 ? "trả" : "đền đáp"} ${noOr(c, k)}, nhưng không mua lại được một buổi sáng đánh răng mà không ai nhìn.${f(c, "x13_luat_su") ? " Nhờ luật sư, bạn biết điều khoản trọn đời gỡ được bằng một khoản bồi thường." : ""}`,
            [ending(X13_VE, "Ký tiếp, sống bằng tiền vé", "Thu nhập cao, đời sống trong tủ kính"),
             ending(X13_BAN_DUT, "Bán đứt bộ sưu tập, dọn lên thành phố", "Có tiền, mất nơi ở cũ"),
             ending(X13_DONG_CUA, "Bồi thường, đóng cửa bảo tàng", "Mất một năm thu nhập, lấy lại cái ghế")]),
        ],
      ] }),
    "Phi lý: nhà thành bảo tàng, bạn thành hiện vật"),

  /* ---------------------------------------------------------------- X14 */
  weird("X14", "abs", ["ky", "tien", "mau"],
    (c) => c.pressure.ky >= 4 && c.age >= 18 && c.age <= 70,
    () => "Nhận di sản của người thừa kế bốc thăm",
    () => ({ title: "Lá thăm có tên bạn", text: `Một ông cụ giàu có, không vợ con, để lại di chúc lạ: tài sản thuộc về người được bốc ngẫu nhiên từ danh bạ thành phố. Trước mặt ba luật sư và một chiếc máy quay, lá thăm mở ra, và đó là tên bạn. "Chúc mừng," bà luật sư nói, "và xin lỗi trước về họ hàng của cụ."` }),
    season({ id: "w_X14", vn: "Người thừa kế bốc thăm", color: "#d4a017", years: [5, 9], weird: "abs",
      rules: { flags: ["w_thua_ke_boc_tham"], yearly: { money: -0.05 } },
      reset: { cast: [{ key: "luat_su", role: "mentor", label: "bà luật sư của cụ" }, { key: "chau_cu", role: "rival", label: "người cháu đích tôn của cụ" }] },
      gag: { key: "ho_hang_moi", lines: [
        "Chuông cửa reo. Một người tự giới thiệu là cháu gọi cụ bằng ông trẻ, mang theo một túi cam và một tờ đơn kiện.",
        "Lại chuông cửa. Lần này là chắt của người hàng xóm từng cho cụ mượn cái thang, cũng mang túi cam và đơn kiện.",
        "Số người nhận là họ hàng của cụ đã đông hơn cả danh bạ của phố. Túi cam thì vẫn đến đều.",
        "Người họ hàng cuối cùng gõ cửa không mang đơn kiện, chỉ mang túi cam. Bạn suýt khóc vì cảm động.",
      ] },
      landings: [X14_GIAU, X14_CHIA, X14_TRANG],
      beats: [
        [
          card("x14_mo_biet_thu", "Căn biệt thự hai mươi phòng", (c, k) => `${cap(k.npc("luat_su"))} giao cho bạn một chùm chìa khóa nặng hai cân và bản kê tài sản dài bốn trang. Căn biệt thự có hai mươi phòng, ba phòng chưa ai tìm thấy cửa. Người giữ chìa chịu tiền điện nước và án phí của nó cho tới ngày tòa xử xong, đóng theo năm. ${k.gag()}`,
            [C("Dọn vào ở ngay", { flags: ["x14_don_vao"], happy: 3, money: 0.1 }, "Sống như vua, thành bia cố định"),
             C("Ở nhà cũ, khóa biệt thự lại", { flags: ["x14_khoa_cua"], counters: { x14_cung: 1 } }, "An toàn, đồ trong đó cứ mất dần")]),
          card("x14_mo_chau", "Người cháu đích tôn", (c, k) => `${cap(k.npc("chau_cu"))} hẹn bạn ở quán nước, mặc vest dù trời ba mươi sáu độ. Người ấy nói nhẹ nhàng: ông cụ lẩm cẩm, lá thăm là trò đùa, gia đình sẽ kiện tới cùng. "Hoặc," người ấy đẩy một tờ giấy qua bàn, "bạn ký nhường lại và nhận một phần mười."`,
            [C("Từ chối, giữ lá thăm", { flags: ["x14_giu"], counters: { x14_cung: 1 } }, "Giữ quyền, chuẩn bị cho một cuộc chiến"),
             C("Hỏi xem một phần mười là bao nhiêu", { flags: ["x14_ngam_vuc"], know: 1 }, "Chưa ký, nhưng họ biết bạn có giá")]),
        ],
        [
          card("x14_kd_san", "Người nhà thật đi săn", (c, k) => `Từ tháng này, người nhà của cụ thay nhau theo dõi bạn: một người đứng ở chợ, một người đi xe theo sau, một người gửi đơn tố bạn nuôi gà trái phép. ${k.gag()}`,
            [C("Thuê bảo vệ riêng", { money: -0.2, flags: ["x14_bao_ve"], counters: { x14_cung: 1 } }, "An toàn hơn, tiền thừa kế chưa về đã tiêu"),
             C("Mời họ vào uống nước, nói thẳng", { flags: ["x14_moi_nuoc"], rel: 2 }, "Có thể làm lành, có thể bị ghi âm")]),
          card("x14_kd_no_kem", "Trang năm của bản kê", (c, k) => `${cap(k.npc("luat_su"))} đọc tiếp trang năm, trang không ai đọc tới: tài sản đi kèm một khoản nợ thuế và một con ngựa đua bị thương. Muốn nhận nhà, bạn phải nộp trước một khoản bằng nửa năm thu nhập.`,
            [C("Vay tiền nộp trước", { custom: "borrow:0.5", flags: ["x14_vay"], counters: { x14_cung: 1 } }, "Giữ quyền thừa kế, gánh nợ thật vì tiền chưa thấy"),
             C("Bán con ngựa đua lấy tiền nộp", { money: 0.1, flags: ["x14_ban_ngua"] }, "Đỡ nợ, mất con ngựa bạn bắt đầu thương")]),
        ],
        [
          card("x14_cl_di_chuc", "Bản di chúc thứ hai", (c, k) => `Đúng ngày ra tòa, ${k.scar("nguoi") || "một người quen cũ"} xuất hiện với một phong bì cũ: bản di chúc thứ hai của cụ, viết sau bản đầu ba ngày. Trong đó cụ dặn người thừa kế phải từ bỏ thứ mang theo từ đời cũ, ở bạn là ${k.scar("do") || "món đồ quý nhất của mình"}, mới được nhận chìa khóa két sắt.`,
            [C("Làm đúng di chúc, từ bỏ thứ ấy", { flags: ["x14_di_chuc_2"], counters: { x14_cung: 2 }, happy: -2 }, "Thắng thế ở tòa, mất một thứ của đời cũ"),
             C("Giấu bản di chúc thứ hai", { flags: ["x14_giau"], pressure: { luat: 2 } }, "Giữ được thứ của đời cũ, mang một bí mật vào phòng xử"),
             C("Đưa di chúc cho cả hai bên cùng đọc", { flags: ["x14_cong_khai"], rel: 3, counters: { x14_cung: -1 } }, "Công bằng, mất lợi thế", { tier: "sovereign" })]),
        ],
        [
          card("x14_day_toa", "Phiên tòa thứ chín", (c, k) => `${k.gag()} Phiên tòa thứ chín kéo dài tới tối. Luật sư bên kia trình ảnh bạn ${f(c, "x14_don_vao") ? "nằm võng trong vườn biệt thự" : "đứng nhìn qua hàng rào biệt thự"}, gọi đó là bằng chứng của lòng tham.`,
            [C("Tự bào chữa, kể hết từ đầu", { flags: ["x14_tu_bao_chua"], health: -3, counters: { x14_cung: 1 } }, "Tòa nghe chuyện thật, bạn kiệt sức"),
             C("Thuê luật sư giỏi nhất", { money: -0.4, flags: ["x14_luat_su_gioi"], counters: { x14_cung: 1 } }, "Có cơ hội, tiền thật đi trước tiền thừa kế")]),
          card("x14_day_dem", "Một đêm không ngủ", (c, k) => `Đêm đó bạn ngồi tính: ${n(c, "x14_cung") >= 3 ? "phần thắng đang nghiêng về bạn, nhưng người nhà cụ đã soạn sẵn đơn kháng cáo" : "phần thắng đang nghiêng về người nhà cụ, và án phí đã ăn gần hết tiền tiết kiệm"}. ${cap(k.npc("chau_cu"))} nhắn tin: đề nghị chia đôi vẫn còn hiệu lực đến sáng mai.`,
            [C("Trả lời: gặp nhau ở tòa", { flags: ["x14_den_cung"], counters: { x14_cung: 1 }, happy: -2 }, "Được ăn cả, ngã về không"),
             C("Trả lời: mình nói chuyện chia đi", { flags: ["x14_muon_chia"], happy: 2 }, "Mở cửa chia đôi, đêm nay ngủ được")]),
        ],
        [
          card("x14_ket", "Ngày tuyên án", (c, k) => `Ngày tuyên án, phòng xử chật kín, có cả người bán cam ngồi hàng ghế đầu${f(c, "x14_muon_chia") ? ", và bản thỏa thuận chia đôi đã soạn sẵn trên bàn luật sư" : ""}. ${f(c, "x14_cong_khai") ? "Nhờ bản di chúc thứ hai được đọc công khai, hai bên lần đầu chào nhau ở hành lang." : f(c, "x14_giau") ? "Bản di chúc thứ hai vẫn nằm trong túi áo bạn, nặng như một hòn đá." : "Người nhà cụ ngồi kín một bên, không ai nhìn sang phía bạn."} ${k.gag()} ${cap(noOr(c, k))} vẫn còn đó, và dù tòa nói gì, bạn cũng phải chọn mình sẽ là ai sau hôm nay.`,
            (c) => [ending(n(c, "x14_cung") >= 3 || c.luck > 0.8 ? X14_GIAU : X14_TRANG, "Theo vụ kiện đến lời tuyên cuối", "Được ăn cả, ngã về không"),
              ending(X14_CHIA, "Ký chia đôi trước giờ tuyên án", "Chắc một nửa, có thêm một dòng họ")]),
        ],
      ] }),
    "Phi lý: giàu nhờ lá thăm, cả họ nhà người ta săn bạn"),

  /* ---------------------------------------------------------------- X15 */
  weird("X15", "abs", ["ky", "dat", "luat"],
    (c) => c.age >= 18 && c.age <= 60 && handlesCargo(c),
    () => "Ngủ quên trong một container hàng xuất",
    (s) => ({ title: "Tỉnh dậy ở bến lạ", text: `Ca đêm ở ${s.noi || "nơi này"}, bạn chợp mắt mười phút trên đống thùng các-tông trong một container hàng xuất chưa đóng cửa. Khi tỉnh dậy, cửa mở ra một bến cảng lạ, loa phát một thứ tiếng bạn không hiểu, và trên lưng áo bạn có tem dán: HÀNG DỄ VỠ. "Kiện này biết đi," người công nhân đầu tiên thấy bạn hét lên.` }),
    season({ id: "w_X15", vn: "Kiện hàng biết đi", color: "#e07b24", years: [5, 10], weird: "abs",
      rules: { income: 0.4, flags: ["w_khong_giay_to"] },
      reset: { cast: [{ key: "gac_kho", role: "neighbor", label: "bác gác kho xứ lạ" }, { key: "can_bo", role: "official", label: "cán bộ xuất nhập cảnh" }] },
      gag: { key: "tem_de_vo", lines: [
        "Cái tem HÀNG DỄ VỠ vẫn dính trên lưng áo. Ai đi ngang cũng nhẹ tay với bạn hẳn.",
        "Bạn giặt áo ba lần, cái tem vẫn còn. Ở xứ này người ta đọc được nó, và tự động dắt bạn qua đường.",
        "Cái tem giờ đã bạc màu, chỉ còn đọc được chữ DỄ. Người gác kho bảo thế cũng đúng.",
        "Bạn bóc cái tem ra, dán vào cuốn sổ tay. Lưng áo nhẹ hẳn, như vừa mất một người bảo lãnh.",
      ] },
      landings: [X15_O_LAI, X15_VE, X15_THUYEN, X15_O_CHUI],
      beats: [
        [
          card("x15_mo_ben", "Bến cảng không biết tên", (c, k) => `Bạn đứng giữa bãi container, không hộ chiếu, không điện thoại, túi áo còn đúng chiếc bút bi của kho. ${k.gag()} ${cap(k.npc("gac_kho"))} chỉ tay về phía văn phòng cảng, rồi lắc đầu, rồi lại chỉ.`,
            [C("Tới thẳng văn phòng cảng trình diện", { flags: ["x15_trinh_dien"], counters: { x15_hop_phap: 1 } }, "Đúng luật, có thể bị giữ lại nhiều tháng"),
             C("Ở lại trong kho với người gác", { flags: ["x15_o_kho"], pressure: { luat: 2 }, happy: -2 }, "Có chỗ ngủ, ngày nào cũng sợ bị phát hiện")]),
          card("x15_mo_ba_tu", "Ba từ đầu tiên", (c, k) => `${cap(k.npc("gac_kho"))} dạy bạn ba từ đầu tiên của xứ này: cảm ơn, xin lỗi, và một từ dùng được cho mọi trường hợp còn lại. Bạn dùng từ thứ ba ở tiệm bánh mì, và cả tiệm vỗ tay.`,
            [C("Học tiếng mỗi tối", { know: 3, flags: ["x15_hoc_tieng"], counters: { x15_hop_phap: 1 } }, "Chậm mà chắc, bớt giờ ngủ"),
             C("Sống bằng từ thứ ba", { happy: 3, flags: ["x15_tu_thu_ba"] }, "Vui, nhưng chẳng ai giải thích luật lệ cho bạn")]),
        ],
        [
          card("x15_kd_luu_tru", "Trung tâm lưu trú", (c, k) => `Một buổi sáng, xe của ${k.npc("can_bo")} đậu trước kho. ${f(c, "x15_trinh_dien") ? "Vì bạn đã tự trình diện, họ đưa bạn tới trung tâm lưu trú và trả lại chiếc bút bi." : "Người gác kho bị phạt vì chứa người không giấy tờ, còn bạn bị đưa tới trung tâm lưu trú."} ${k.gag()} Hồ sơ của bạn nằm trong một chồng cao ngang ngực.`,
            [C("Khai thật từng chi tiết", { flags: ["x15_khai_that"], counters: { x15_hop_phap: 1 }, happy: -2 }, "Hồ sơ rõ ràng, chờ lâu hơn"),
             C("Xin gọi về nhà một cuộc", { rel: 3, flags: ["x15_goi_nha"], money: -0.05 }, "Người nhà yên tâm, hồ sơ chưa nhích")]),
          card("x15_kd_viec", "Việc làm không hợp đồng", () => "Trong lúc chờ, có người rủ bạn làm phụ bếp ca đêm, công chưa bằng nửa mức thường, không hợp đồng. Mấy người cùng phòng đã nhận, và một người vừa bị quỵt ba tháng lương mà không biết kêu ai.",
            [C("Nhận, vì cần tiền gửi về", { money: 0.1, health: -3, flags: ["x15_lam_chui"], pressure: { luat: 2 } }, "Có tiền, mất hết tiếng nói nếu bị quỵt"),
             C("Từ chối, làm tình nguyện ở trung tâm", { flags: ["x15_tinh_nguyen"], counters: { x15_hop_phap: 1 }, rel: 2 }, "Không có tiền, có người tốt ghi tên bạn")]),
        ],
        [
          card("x15_cl_bao_lanh", "Một người bảo lãnh", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} xem được tin về kiện hàng biết đi trên mạng và gọi sang tận nơi. Người đó hứa đứng ra bảo lãnh, nhưng hồ sơ cần chứng minh bạn có thứ để bắt đầu, và người đó nhắc tới ${k.scar("do") || "tay nghề cũ của bạn"}.`,
            [C("Nhận bảo lãnh, chịu nợ ân tình", { flags: ["x15_bao_lanh"], counters: { x15_hop_phap: 2 } }, "Có đường hợp pháp, mắc nợ một người"),
             C("Cảm ơn, xin tự lo", { flags: ["x15_tu_lo"], happy: 1, counters: { x15_hop_phap: -1 } }, "Giữ tự trọng, hồ sơ vẫn treo")]),
        ],
        [
          card("x15_day_quyet_dinh", "Tờ quyết định dưới bóng đèn", (c, k) => `${k.gag()} Hồ sơ của bạn có kết quả: ${n(c, "x15_hop_phap") >= 3 ? "được ở lại tạm thời một năm, kèm điều kiện trình diện hằng tháng" : "phải về nước trong ba mươi ngày, kèm lệnh cấm quay lại năm năm"}. Bạn đọc tờ giấy dưới bóng đèn hành lang, rồi đọc lại lần nữa cho chắc.`,
            [C("Làm đơn xin xem xét lại", { flags: ["x15_xem_lai"], money: -0.1, counters: { x15_hop_phap: 1 } }, "Thêm một vòng hồ sơ, thêm một tia hy vọng"),
             C("Chấp nhận, chuẩn bị về", { flags: ["x15_chap_nhan"], happy: -2, rel: 2 }, "Hết lo âu, mất cơ hội ở lại")]),
          card("x15_day_bua_com", "Bữa cơm nhà ở xứ lạ", (c, k) => `${cap(k.npc("gac_kho"))} mời bạn ăn tối, nấu thử một món quê bạn theo lời bạn tả. Món ăn sai gần hết, chỉ đúng mỗi vị mặn. Ăn xong, bạn ngồi im rất lâu, và người ấy hỏi bạn muốn về hay muốn ở.`,
            [C("Nói thật: muốn về", { flags: ["x15_muon_ve"], rel: 2, happy: 2 }, "Lòng nhẹ, nhưng đường về cũng không rẻ"),
             C("Nói thật: muốn ở lại", { flags: ["x15_muon_o"], know: 1 }, "Có mục tiêu, còn nhiều năm chật vật")]),
        ],
        [
          card("x15_ket", "Con tàu cập bến lần nữa", (c, k) => `${k.gag()} Con tàu năm xưa chở bạn sang lại cập bến, lần này có danh sách hành khách đàng hoàng. ${f(c, "x15_bao_lanh") ? "Người bảo lãnh nhắn: giấy tờ ở lại đã có cửa, chỉ chờ bạn gật đầu." : f(c, "x15_chap_nhan") ? "Vé về đã nằm sẵn trong túi từ hôm bạn chấp nhận quyết định." : x15Legal(c) ? "Giấy phép ở tạm của bạn sắp được xét gia hạn." : `Lệnh về nước vẫn còn hiệu lực${f(c, "x15_muon_o") ? ", dù bạn đã nói muốn ở lại" : ""}; muốn ở, chỉ còn một lần kháng cáo.`} Ở nhà, ${noOr(c, k)} vẫn chờ; ở đây, cuộc đời mới chưa có tên bạn trên giấy.`,
            (c) => {
              const home = ending(X15_VE, "Về nước, nộp phạt", "Mất tiền, được về nhà");
              const stay = !migrateOk(c) ? ending(X15_O_CHUI, "Ở lại không giấy tờ, gửi tiền về nhà", "Có việc ở bến, không có tên trên giấy")
                : x15Legal(c) ? ending(X15_O_LAI, "Ở lại, chờ giấy tờ hợp pháp", "Đời mới ở xứ lạ, trả giá bằng nhiều năm")
                : ending(X15_O_LAI, "Kháng cáo lần cuối để được ở lại", "Tốn hai năm thu nhập, chờ thêm nhiều năm", { effects: { ...X15_O_LAI.effects, money: -2 } });
              const sail = pathOpen("sailor", c.age) ? [ending(X15_THUYEN, "Xin làm thuyền viên trên con tàu ấy", "Có hộ chiếu, đời lênh đênh")] : [];
              return f(c, "x15_chap_nhan") ? [home, stay, ...sail] : [...sail, stay, home];
            }),
        ],
      ] }),
    "Phi lý: không giấy tờ ở xứ lạ, về hay ở đều đắt"),

  /* ---------------------------------------------------------------- X16 */
  weird("X16", "abs", ["ky", "danh"],
    (c) => c.age >= 16 && c.age <= 68 && dogKey(c) !== undefined,
    () => "Làm người phát ngôn cho con chó anh hùng",
    (s, c) => ({ title: "Con chó được đề cử anh hùng", text: `${cap(dogName(c))} sủa liền bốn mươi phút giữa đêm, đánh thức cả ${s.noi || "khu phố"} đúng lúc đường ống nước chính vỡ tung. Sáng hôm sau, hội đồng khu phố đề cử nó danh hiệu công dân anh hùng. Nó không nói được, nên mười hai chiếc micro chĩa vào bạn. "Xin cho biết, lúc ấy nó đã nghĩ gì?"` }),
    season({ id: "w_X16", vn: "Phát ngôn viên của chó", color: "#f0b429", years: [5, 9], weird: "abs",
      rules: { flags: ["w_phat_ngon_cho"] },
      reset: { cast: [{ key: "quan_ly", role: "first_boss", label: "cô quản lý truyền thông" }, { key: "chu_meo", role: "rival", label: "chủ của con mèo cũng được đề cử" }] },
      gag: { key: "dich_tieng_sua", lines: [
        "Phóng viên hỏi: nó có muốn cảm ơn ai không? Con chó gãi tai. Bạn dịch: nó cảm ơn khu phố.",
        "Câu hỏi quen thuộc lại đến: nó nghĩ gì về tương lai? Con chó ngáp. Bạn dịch: nó thận trọng nhưng lạc quan.",
        "Lần này phóng viên hỏi thẳng con chó. Nó quay sang nhìn bạn. Cả hội trường cũng quay sang nhìn bạn.",
        "Câu hỏi cuối mùa: nó có hối tiếc gì không? Con chó nằm ngủ trên chân bạn. Bạn không cần dịch nữa.",
      ] },
      landings: [X16_MC, X16_PT, X16_HOI_KY, X16_CUU_HO],
      beats: [
        [
          card("x16_mo_hop_bao", "Buổi họp báo đầu tiên", (c, k) => `Buổi họp báo đầu tiên có mười hai micro, một bát nước và một tấm phông in hình ${dogName(c)} đeo huy chương. Đèn flash nháy liên tục, con chó sủa vào từng ống kính. ${k.gag()}`,
            [C("Dịch cho thật hay", { flags: ["x16_dich_hay"], counters: { x16_danh: 2 }, happy: 2 }, "Lên báo ngay, lời đã nói khó rút lại"),
             C("Nói thật: tôi không biết nó nghĩ gì", { flags: ["x16_noi_that"], counters: { x16_danh: 1 }, rel: 2 }, "Ít giật gân, nhiều người tin bạn")]),
          card("x16_mo_quan_ly", "Cô quản lý truyền thông", (c, k) => `${cap(k.npc("quan_ly"))} xuất hiện với một tập hợp đồng và một bộ vòng cổ gắn đá. Kế hoạch: mỗi tuần hai sự kiện, một quảng cáo, một buổi thăm trường học. "Con chó cần hình ảnh," cô nói, "còn bạn cần cắt tóc."`,
            [C("Ký hợp đồng quản lý", { flags: ["x16_ky_quan_ly"], money: 0.2, counters: { x16_danh: 1 } }, "Lịch kín, tiền đều, mất tự do"),
             C("Tự lo, không cần quản lý", { flags: ["x16_tu_lo"], happy: 2 }, "Giữ quyền quyết, sự kiện lộn xộn")]),
        ],
        [
          card("x16_kd_quang_cao", "Hợp đồng thức ăn hạt", (c, k) => `Một hãng thức ăn cho chó trả tiền để con chó ăn sản phẩm của họ trước ống kính. ${k.gag()} Rắc rối là nó chỉ chịu ăn cơm nguội chan nước canh do bạn nấu.`,
            [C("Lén đổ cơm vào bao bì của hãng", { flags: ["x16_tron_com"], money: 0.3, counters: { x16_danh: 1 }, pressure: { danh: 2 } }, "Nhiều tiền, một ngày nào đó sẽ lộ"),
             C("Từ chối quảng cáo", { flags: ["x16_tu_choi_qc"], happy: 2, counters: { x16_danh: -1 } }, "Trong sạch, ít tiền hơn")]),
          card("x16_kd_con_meo", "Đối thủ có ria", (c, k) => `Ở khu bên, một con mèo cũng được đề cử vì đuổi sạch bầy chuột khỏi kho gạo. ${cap(k.npc("chu_meo"))} lên truyền hình nói con chó nhà bạn chỉ sủa vì đói. Báo chí đặt tên cho cuộc đua: chó hay mèo.`,
            [C("Lên sóng tranh luận trực tiếp", { flags: ["x16_tranh_luan"], counters: { x16_danh: 2 }, happy: -1 }, "Nổi hơn, cả phố chia phe"),
             C("Lờ đi, để con chó tự nói bằng việc làm", { flags: ["x16_lo_meo"], happy: 1, counters: { x16_danh: -1 } }, "Yên thân, báo chí cho mèo thắng"),
             C("Mời chủ con mèo đi ăn trưa", { flags: ["x16_lien_minh"], rel: 3 }, "Có đồng minh, báo chí mất trò vui", { tier: "sovereign" })]),
        ],
        [
          card("x16_cl_doan_phim", "Đoạn phim đêm hôm ấy", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} gửi cho bạn đoạn phim camera đêm hôm ấy: người đứng ở cổng lúc con chó sủa chính là người đó, đến để nói chuyện ${k.scar("do") || "ngày cũ"} với bạn rồi bỏ về. Đường ống vỡ chỉ là trùng hợp. Nếu đoạn phim lộ ra, danh hiệu anh hùng sẽ thành chuyện cười.`,
            [C("Công bố đoạn phim", { flags: ["x16_cong_bo"], counters: { x16_danh: -2 }, rel: 2 }, "Trung thực, con chó mất danh hiệu"),
             C("Giữ kín, gọi lại cho người đó", { flags: ["x16_giu_kin"], rel: 3, pressure: { danh: 2 } }, "Nối lại chuyện cũ, giữ một bí mật")]),
        ],
        [
          card("x16_day_kiet_suc", "Con chó nằm dưới gầm giường", (c, k) => `${k.gag()} Sau ${f(c, "x16_ky_quan_ly") ? "năm mươi sự kiện trong một mùa" : "bao nhiêu sự kiện tự lo lộn xộn"}, con chó bỏ ăn, nằm im dưới gầm giường. Bác sĩ thú y nói nhỏ: nó không ốm, nó chỉ mệt vì phải làm anh hùng.`,
            [C("Hủy hết lịch, đưa nó về quê", { flags: ["x16_nghi"], money: -0.2, happy: 3, counters: { x16_danh: -1 } }, "Con chó khỏe lại, phải đền hợp đồng"),
             C("Giảm lịch, giữ các sự kiện lớn", { flags: ["x16_giam_lich"], health: -2, counters: { x16_danh: 1 } }, "Giữ được danh, con chó vẫn buồn")]),
          card("x16_day_mot_minh", "Lời mời không có chó", (c) => `${f(c, "x16_tron_com") ? "Hãng thức ăn hạt vừa phát hiện bao bì của họ đựng toàn cơm nguội, đòi lại cả tiền quảng cáo. " : ""}Một đài truyền hình mời bạn dẫn chương trình riêng, không có chó. Họ nói giọng bạn dễ nghe, và bạn dịch tiếng sủa hay hơn bất kỳ ai từng làm nghề này, nếu nghề này có thật. Con chó nhìn bạn từ góc phòng.`,
            (c) => { const lo = f(c, "x16_tron_com") ? { money: -0.3 } : {};
              return [C("Nhận lời, đi một mình", { ...lo, flags: ["x16_mot_minh"], counters: { x16_danh: 1 }, happy: -2 }, "Sự nghiệp của bạn, con chó ở nhà"),
                C("Chỉ nhận nếu có chó đi cùng", { ...lo, flags: ["x16_ca_hai"], rel: 2 }, "Trung thành, đài có thể đổi ý")]; }),
        ],
        [
          card("x16_ket", "Lễ trao danh hiệu", (c, k) => `${f(c, "x16_cong_bo") ? "Dù đoạn phim đã lộ, lễ trao danh hiệu vẫn diễn ra, vì con chó đã cứu cả khu phố thật." : "Lễ trao danh hiệu diễn ra vào sáng Chủ nhật."} ${cap(dogName(c))} đeo nơ, bạn cầm bài phát biểu viết sẵn. ${k.gag()} Trong túi áo, ${noOr(c, k)} vẫn chờ ngày được trả, và tiền danh tiếng có thể trả nó.`,
            (c) => finale(c, [
              { l: X16_MC, label: "Nhận dẫn chương trình truyền hình", hint: "Nổi tiếng thật, lịch kín cả tuần", path: "tv_host" },
              { l: X16_PT, label: "Làm phát thanh viên", hint: "Giọng quen, mặt ít người biết", path: "radio_voice" },
              { l: X16_HOI_KY, label: "Viết hồi ký nhân danh con chó", hint: "Có tiền, nghề nghiệp vẫn như cũ" },
              { l: X16_CUU_HO, label: "Lập trạm cứu hộ chó mèo", hint: "Tiêu hết tiền danh tiếng, được cả xóm thương" },
            ])),
        ],
      ] }),
    "Phi lý: con chó là anh hùng, bạn là người phải nói"),

  /* ---------------------------------------------------------------- X17 */
  weird("X17", "abs", ["ky", "danh"],
    (c) => c.age >= 20 && c.age <= 70 && (c.reputation >= 70 || n(c, "kind") >= 5 || f(c, "saved_student") || c.pressure.danh >= 5),
    () => "Để cả con phố đổi theo tên mình",
    () => ({ title: "Tấm biển tên phố mới", text: `Sáng nay, công nhân tháo tấm biển cũ ở đầu phố nhà bạn và treo lên một tấm biển mới mang đúng họ tên bạn. Hội đồng giải thích: cần đặt tên phố theo một người tốt còn sống, và tên bạn được nhiều phiếu nhất vì dễ đọc. "Từ giờ," bà trưởng hội khu phố vỗ vai bạn, "cả phố này soi vào bạn mà sống."` }),
    season({ id: "w_X17", vn: "Con phố mang tên tôi", color: "#cc8a1e", years: [6, 11], weird: "abs",
      rules: { flags: ["w_pho_ten_toi"], yearly: { money: -0.03 } },
      reset: { cast: [{ key: "to_truong", role: "neighbor", label: "bà trưởng hội khu phố" }, { key: "ban_banh", role: "rival", label: "ông bán bánh đầu phố" }] },
      gag: { key: "bien_pho", lines: [
        "Tấm biển phố in sai một dấu, tên bạn thành một từ khác hẳn nghĩa. Cả phố thống nhất không ai nhắc tới.",
        "Biển được làm lại. Lần này đúng dấu nhưng sai năm sinh, khiến bạn già thêm hai mươi tuổi trên giấy.",
        "Tấm biển thứ ba đúng hết, chỉ có điều bị treo ngược. Khách qua đường nghiêng đầu chụp ảnh.",
        "Tấm biển cuối cùng hoàn hảo. Không ai chụp ảnh nữa. Bạn thấy hơi tiếc.",
      ] },
      landings: [X17_CONG_TAC, X17_DAI_BIEU, X17_DI, X17_BAN_TEN],
      beats: [
        [
          card("x17_mo_le", "Lễ gắn biển", (c, k) => `Lễ gắn biển có băng rôn, có đội trống thiếu nhi, và một bài phát biểu bạn phải tự viết về chính mình. ${k.gag()}`,
            [C("Phát biểu khiêm tốn, cúi chào", { flags: ["x17_khiem_ton"], rel: 2, counters: { x17_guong: 1 } }, "Ai cũng quý, ai cũng chờ bạn sơ hở"),
             C("Phát biểu thật lòng, kể cả cái dở", { flags: ["x17_that_long"], happy: 2 }, "Nhẹ người, có người lắc đầu")]),
          card("x17_mo_quy_tac", "Bản quy tắc gương mẫu", (c, k) => `${cap(k.npc("to_truong"))} dán lên cửa nhà bạn một tờ quy tắc: không cãi nhau to tiếng, không phơi quần áo ra mặt phố, không về nhà sau mười giờ đêm, không nợ tiền ai, và đóng quỹ khu phố hằng năm gấp đôi nhà khác. "Người mang tên phố," bà nói, "thì phải sạch như tấm biển."`,
            [C("Ký cam kết tuân thủ", { flags: ["x17_cam_ket"], counters: { x17_guong: 1 }, happy: -2 }, "Được lòng hàng xóm, mất tự do"),
             C("Gỡ tờ quy tắc xuống", { flags: ["x17_go_quy_tac"], happy: 2, counters: { x17_guong: -1 } }, "Sống như cũ, cả phố xì xào")]),
        ],
        [
          card("x17_kd_banh", "Bánh mang tên bạn", (c, k) => `${cap(k.npc("ban_banh"))} đổi tên tiệm theo tên phố, tức là theo tên bạn, và vẽ mặt bạn lên hộp bánh mà không xin phép. ${k.gag()} Bánh thì khét, và khách mua về đổ lỗi cho bạn.`,
            [C("Đòi chia phần trăm", { money: 0.15, flags: ["x17_phan_tram"], counters: { x17_guong: -1 } }, "Có tiền, mang tiếng ham lợi"),
             C("Vào bếp dạy ông ấy nướng cho ngon", { flags: ["x17_day_nuong"], rel: 3, health: -1, counters: { x17_guong: 1 } }, "Bánh ngon hơn, bạn mất mỗi sáng sớm")]),
          card("x17_kd_anh", "Một tấm ảnh trên bảng tin", (c) => `Có người chụp được ảnh bạn vứt vỏ chai nhựa chệch thùng rác đúng mười phân. Ảnh được dán lên bảng tin phố, kèm dòng chữ: tên phố mà thế à? ${f(c, "x17_cam_ket") ? "Tờ cam kết bạn ký vẫn dán ngay bên cạnh." : "Bên cạnh là tờ quy tắc bạn đã gỡ, giờ được dán lại."}`,
            [C("Xin lỗi trước cả phố", { flags: ["x17_xin_loi"], happy: -3, counters: { x17_guong: 1 } }, "Được tha, nhưng ai cũng nhớ"),
             C("Dán ảnh người khác vứt rác bên cạnh", { flags: ["x17_tra_dua"], counters: { x17_guong: -2 }, pressure: { danh: 2 } }, "Hả giận, cả phố chia phe")]),
        ],
        [
          card("x17_cl_don", "Ai mới xứng tên phố", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} đến gặp hội đồng với một lá đơn: việc tốt năm ấy không phải do bạn làm, ít nhất không phải một mình bạn. Lá đơn kể lại chuyện ${k.scar("do") || "những ngày cũ"}, chi tiết đến mức bạn đỏ mặt.`,
            [C("Thừa nhận, xin ghi cả hai tên", { flags: ["x17_hai_ten"], rel: 3, counters: { x17_guong: 2 } }, "Biển dài gấp đôi, lòng nhẹ gấp đôi"),
             C("Phản bác trước hội đồng", { flags: ["x17_phan_bac"], counters: { x17_guong: -1 }, pressure: { danh: 2 } }, "Giữ tên, mất một người cũ")]),
        ],
        [
          card("x17_day_rem", "Ngủ với rèm kéo kín", (c, k) => `${k.gag()} ${n(c, "x17_guong") >= 3 ? "Cả phố khen bạn gương mẫu, và vì thế bạn không dám ốm, không dám buồn, không dám mua chịu một bó rau." : "Cả phố đã chán khen, giờ chỉ còn soi."} Bạn ngủ với rèm kéo kín, và mơ thấy tấm biển gọi tên mình.`,
            [C("Đi gặp bác sĩ tâm lý", { flags: ["x17_tri_lieu"], money: -0.1, happy: 4 }, "Đỡ hơn nhiều, cả phố biết bạn đi khám"),
             C("Gồng tiếp, không ai được thấy bạn mệt", { health: -5, counters: { x17_guong: 1 }, flags: ["x17_gong"] }, "Hình ảnh nguyên vẹn, cơ thể thì không")]),
          card("x17_day_doi_ten", "Đơn đề nghị đổi tên phố", (c) => `Hội đồng nhận được đơn đề nghị đổi tên phố lần nữa, lần này theo tên ${f(c, "x17_hai_ten") ? "cả hai người, cho đỡ cãi nhau" : "con mèo hay nằm ở bậc thềm bưu điện"}. Ba tháng nữa bỏ phiếu.`,
            [C("Vận động giữ tên", { flags: ["x17_van_dong"], money: -0.1, counters: { x17_guong: 1 } }, "Có thể giữ, phải gõ cửa từng nhà"),
             C("Bỏ phiếu cho con mèo", { flags: ["x17_bau_meo"], happy: 4 }, "Nhẹ gánh, mất tên phố")]),
        ],
        [
          card("x17_ket", "Ngày bỏ phiếu", (c, k) => `Ngày bỏ phiếu, cả phố xếp hàng ở hội trường khu phố${f(c, "x17_bau_meo") ? ", và con mèo ngồi chễm chệ ở bàn đầu" : ""}. ${k.gag()} Dù kết quả ra sao, ${noOr(c, k)} vẫn đứng tên bạn, còn tên bạn thì đứng trên đầu cả phố.`,
            (c) => finale(c, [
              { l: X17_CONG_TAC, label: "Mở văn phòng giúp người ở đầu phố", hint: "Thu nhập thấp, việc tốt thật", path: "social_worker" },
              { l: X17_DAI_BIEU, label: "Ra ứng cử bằng cái tên ấy", hint: "Quyền lực thật, áp lực gấp mười", path: "politician" },
              { l: X17_DI, label: "Dọn đi nơi không ai biết tên mình", hint: "Tự do, mất hết hàng xóm" },
              { l: X17_BAN_TEN, label: "Bán quyền dùng tên cho tiệm bánh", hint: "Có tiền, chịu tiếng" },
            ])),
        ],
      ] }),
    "Phi lý: tên bạn trên biển phố, cả phố soi bạn"),

  /* ---------------------------------------------------------------- X18 */
  weird("X18", "abs", ["ky", "danh", "dat"],
    (c) => c.age >= 16 && c.age <= 70 && (f(c, "temper_curious") || f(c, "temper2_curious") || f(c, "life_environmentalist") || f(c, "life_explorer") || f(c, "life_climber") || c.farmer),
    () => "Để câu chửi của mình thành tên khoa học",
    () => ({ title: "Loài bọ mang câu chửi của bạn", text: `Đi rừng hôm ấy, một con bọ cánh cứng màu cam bò lên tay bạn và cắn một phát, bạn buột miệng: "Cái đồ khỉ gió!" Đúng lúc đó, một đoàn khảo sát đang ghi âm tiếng côn trùng ngay sau bụi cây. Ba tháng sau, tạp chí khoa học công bố loài mới, Khigio khigio, ghi tên người phát hiện là bạn.` }),
    season({ id: "w_X18", vn: "Nhà côn trùng học bất đắc dĩ", color: "#d98c3f", years: [6, 10], weird: "abs",
      rules: { flags: ["w_con_trung_hoc"] },
      reset: { cast: [{ key: "giao_su", role: "mentor", label: "bà giáo sư côn trùng" }, { key: "tay_buon", role: "rival", label: "tay buôn bọ quý" }] },
      gag: { key: "ten_khoa_hoc", lines: [
        "Tại hội thảo, bà giáo sư đọc tên loài mới bằng giọng trang trọng: Khi-gi-ô khi-gi-ô. Hàng ghế đầu gật gù.",
        "Tên con bọ được in lên tem thư. Bà bán tem ở bưu điện đọc to lên, rồi nhìn bạn rất lâu.",
        "Một đoàn học sinh hát bài hát về loài Khigio khigio. Phụ huynh không ai dám hỏi nghĩa.",
        "Ở hội nghị quốc tế, cả hội trường đứng dậy hô tên con bọ. Bạn là người duy nhất trong phòng biết nó nghĩa là gì.",
      ] },
      landings: [X18_KH, X18_BT, X18_MAU, X18_HIEN],
      beats: [
        [
          card("x18_mo_hoi_thao", "Hội thảo đầu tiên", (c, k) => `Bạn được mời lên bục với tư cách người phát hiện, đứng cạnh tấm ảnh phóng to con bọ đã cắn mình. ${k.gag()}`,
            [C("Kể thật chuyện bị cắn và câu chửi", { flags: ["x18_ke_that"], happy: 3, counters: { x18_khoa_hoc: 1 } }, "Cả hội trường cười, bạn thành người đáng nhớ"),
             C("Nói như một nhà khoa học", { flags: ["x18_gia_khoa_hoc"], know: 2 }, "Nghe trang trọng, câu hỏi sau khó hơn câu trước")]),
          card("x18_mo_loi_moi", "Lời mời vào rừng", (c, k) => `${cap(k.npc("giao_su"))} mời bạn theo nhóm khảo sát một mùa, không lương, có cơm và có lều. "Bạn có đôi mắt thấy con vật ở chỗ người khác chỉ thấy lá," bà nói, "và cái miệng mà côn trùng nhớ được."`,
            (c) => [C("Theo nhóm khảo sát", { flags: ["x18_khao_sat"], know: 3, money: -0.1, counters: { x18_khoa_hoc: 1 } }, "Học được nghề, mất một mùa thu nhập"),
             C(c.has_job ? "Cảm ơn, xin về làm việc cũ" : "Cảm ơn, xin ở nhà lo việc nhà", { flags: ["x18_ve_viec_cu"], money: 0.05 }, "Ổn định, cái tên vẫn bám theo bạn")]),
        ],
        [
          card("x18_kd_tay_buon", "Người hỏi mua bọ", (c, k) => `${cap(k.npc("tay_buon"))} tìm đến tận nhà, trả giá gấp mười cho một cặp Khigio khigio còn sống. ${k.gag()} Loài này vừa vào danh sách cần bảo vệ, ai mua bán nó sẽ bị phạt rất nặng.`,
            [C("Từ chối, báo cho bà giáo sư", { flags: ["x18_bao_cao"], counters: { x18_khoa_hoc: 1 }, rel: 2 }, "Đúng luật, thêm một kẻ thù"),
             C("Đuổi ông ta đi, không nói với ai", { flags: ["x18_im_lang"], happy: -1 }, "Yên chuyện, ông ta chưa bỏ cuộc")]),
          card("x18_kd_bai_bao", "Bài báo đầu tay", (c, k) => `${cap(k.npc("giao_su"))} đề nghị bạn đứng tên chung một bài báo khoa học. Phần của bạn là mô tả nơi sống của loài bọ, viết bằng thứ ngôn ngữ bạn chỉ hiểu một nửa.`,
            [C("Thức trắng học viết cho đúng", { flags: ["x18_viet_bai"], know: 4, health: -2, counters: { x18_khoa_hoc: 2 } }, "Thành tác giả thật, mất vài tháng ngủ"),
             C("Nhờ người viết hộ, chỉ ký tên", { flags: ["x18_ky_ten"], counters: { x18_khoa_hoc: -1 } }, "Nhanh gọn, sau này bị hỏi sẽ khó trả lời")]),
        ],
        [
          card("x18_cl_manh_dat", "Mảnh đất có tổ bọ", (c, k) => `Bạn dẫn đoàn khảo sát về đúng chỗ con bọ đã cắn mình, và nhận ra đó là mảnh đất của ${k.scar("nguoi") || "một người quen cũ"}. Người đó sắp bán đất, và chỉ chịu nghe bạn nếu bạn nhường lại thứ mang theo từ đời cũ: ${k.scar("do") || "lời hứa ngày cũ"}.`,
            [C("Đổi thứ ấy để giữ khu rừng", { flags: ["x18_giu_rung"], counters: { x18_khoa_hoc: 2 }, happy: 2 }, "Loài bọ còn chỗ sống, bạn mất một thứ của đời cũ"),
             C("Để người đó bán đất", { flags: ["x18_mat_rung"], happy: -3 }, "Giữ đồ, loài bọ mất tổ"),
             C("Rủ người đó cùng lập khu bảo tồn", { flags: ["x18_bao_ton"], rel: 3, money: -0.2, counters: { x18_khoa_hoc: 1 } }, "Tốn tiền và giấy tờ, cả hai cùng đứng tên", { tier: "sovereign" })]),
        ],
        [
          card("x18_day_bien_mat", "Loài bọ thưa dần", (c, k) => `${k.gag()} ${f(c, "x18_mat_rung") ? "Một năm sau ngày khu đất bị bán, đoàn khảo sát không tìm thấy con Khigio nào nữa." : "Một đợt nắng hạn kéo dài, số con Khigio đếm được chỉ còn một phần ba."} ${cap(k.npc("giao_su"))} ngồi im ở mép lều rất lâu.`,
            [C("Ở lại rừng cả mùa khô để đếm", { flags: ["x18_o_rung"], health: -4, counters: { x18_khoa_hoc: 2 } }, "Có số liệu quý, sức khỏe sa sút"),
             C("Về thành phố gây quỹ", { flags: ["x18_gay_quy"], money: 0.1, counters: { x18_khoa_hoc: 1 } }, "Có tiền cứu loài bọ, xa rừng")]),
          card("x18_day_chiec_hop", "Chiếc hộp dưới thềm nhà", (c) => `Sáng nay có một chiếc hộp đặt dưới thềm nhà bạn: bên trong là mười con Khigio khigio còn sống, kèm tờ giấy không ký tên. ${f(c, "x18_bao_cao") ? "Bạn đoán được ai gửi, và đoán được họ muốn kéo bạn vào chuyện gì." : "Bạn không biết ai gửi, nhưng biết giữ chúng trong nhà là phạm luật."}`,
            [C("Mang nộp ngay cho cơ quan bảo tồn", { flags: ["x18_nop"], counters: { x18_khoa_hoc: 1 } }, "Sạch sẽ, mất trọn buổi khai báo"),
             C("Lặng lẽ thả chúng về rừng cũ", { flags: ["x18_tha"], happy: 3, pressure: { luat: 1 } }, "Đúng lòng, sai thủ tục")]),
        ],
        [
          card("x18_ket", "Hội nghị cuối mùa", (c, k) => `${k.gag()} ${n(c, "x18_khoa_hoc") >= 4 ? "Sau hội nghị, người ta gọi bạn là nhà khoa học mà không ai cười." : "Sau hội nghị, người ta vẫn gọi bạn là người đặt tên con bọ."} Ba lá thư chờ bạn: một lời mời làm việc, một đề nghị mua bộ sưu tập mẫu, và một tờ nhắc về ${noOr(c, k)}.`,
            (c) => finale(c, [
              { l: X18_KH, label: "Nhận lời làm nghiên cứu viên", hint: "Nghề thật, lương vừa đủ", path: "scientist" },
              { l: X18_BT, label: "Về giữ rừng cho loài bọ", hint: "Sống xa phố, gần thứ mình thương", path: "environmentalist" },
              { l: X18_MAU, label: "Bán bộ sưu tập mẫu", hint: "Có tiền, khép lại chuyện con bọ" },
              { l: X18_HIEN, label: "Mua lại mảnh rừng để hiến", hint: "Mất hai năm thu nhập, loài bọ có nhà" },
            ])),
        ],
      ] }),
    "Phi lý: một câu chửi thành tên khoa học"),

  /* ---------------------------------------------------------------- X19 */
  weird("X19", "abs", ["ky", "danh", "tien"],
    (c) => c.age >= 18 && c.age <= 70 && cooks(c) && (c.reputation >= 40 || c.pressure.danh >= 2),
    () => "Nhận lời nấu yến tiệc dưới tên người khác",
    (s) => ({ title: "Chiếc mũ đầu bếp bỏ quên", text: `Bạn ngồi đợi xe buýt ở ${s.noi || "bến xe gần nhà"}, cạnh một chiếc mũ đầu bếp cao ai đó bỏ quên. Một chiếc xe sang dừng lại, ba người mặc vest kéo bạn lên. "Thưa đầu bếp, năm trăm khách đang chờ, bếp đã đỏ lửa." Họ nhầm bạn với người đầu bếp nổi tiếng nhất vùng, và bạn chưa kịp nói gì thì đã đứng giữa bếp.` }),
    season({ id: "w_X19", vn: "Đầu bếp giả mạo", color: "#e6b422", years: [5, 9], weird: "abs",
      rules: { flags: ["w_dau_bep_gia"] },
      reset: { cast: [{ key: "chu_tiec", role: "first_boss", label: "ông chủ tiệc" }, { key: "bep_that", role: "rival", label: "người đầu bếp nổi tiếng thật" }] },
      gag: { key: "mon_tu", lines: [
        "Ông chủ tiệc dặn: nhất định phải có món tủ, cá chép bay. Bạn gật đầu, chưa từng nghe tên món ấy.",
        "Thực đơn lần này có thêm món tủ thứ hai: gà hát. Bạn hỏi phụ bếp, phụ bếp hỏi lại bạn.",
        "Khách đặt riêng món canh không đáy. Bạn múc mãi không hết, vì quên dặn phụ bếp ngừng đổ nước.",
        "Món tủ cuối cùng khách gọi là món bạn nấu từ hồi nhỏ. Lần đầu tiên, nó có tên thật.",
      ] },
      landings: [X19_DB, X19_LO, X19_QUAN],
      beats: [
        [
          card("x19_mo_tiec", "Năm trăm khách", (c, k) => `Năm trăm khách, ba mươi phụ bếp, và một thực đơn mà bạn chỉ đọc hiểu mỗi tên món. ${k.gag()}`,
            [C("Nấu kiểu nhà mình, đặt tên thật kêu", { flags: ["x19_nau_nha"], counters: { x19_tai: 2 }, happy: 2 }, "Khách khen lạ miệng, mỗi món một lời nói dối"),
             C("Chỉ huy phụ bếp, tự mình chỉ nếm", { flags: ["x19_chi_huy"], counters: { x19_tai: 1 }, know: 2 }, "Đỡ lộ tay nghề, phụ bếp bắt đầu nghi")]),
          card("x19_mo_phu_bep", "Tay trái hay tay phải", () => `Một phụ bếp trẻ đứng cạnh bạn suốt buổi, nhìn tay bạn thái hành. Cuối buổi người ấy nói nhỏ: "Đầu bếp thật thái hành bằng tay trái." Bạn thuận tay phải.`,
            [C("Nhờ người ấy giữ bí mật", { flags: ["x19_dong_loa"], money: -0.05, rel: 2 }, "Có đồng minh trong bếp, nợ người ấy một ân tình"),
             C("Tập thái hành bằng tay trái", { flags: ["x19_tay_trai"], health: -1, counters: { x19_tai: 1 } }, "Diễn giỏi hơn, ngón cái băng suốt tuần")]),
        ],
        [
          card("x19_kd_tiec_lon", "Một nghìn khách", (c, k) => `${cap(k.npc("chu_tiec"))} hài lòng đến mức đặt luôn bữa tiệc sau: một nghìn khách, có cả hội đồng thẩm định ẩm thực. ${k.gag()}`,
            [C("Nhận lời, thuê thêm bếp", { flags: ["x19_nhan_tiec"], money: 0.3, counters: { x19_tai: 1 }, health: -2 }, "Tiền gấp đôi, nguy cơ lộ cũng gấp đôi"),
             C("Viện cớ đau tay để từ chối", { flags: ["x19_tu_choi"], happy: 1 }, "Tạm an toàn, ông chủ tiệc bắt đầu nghi")]),
          card("x19_kd_hoc_dem", "Học nấu ban đêm", (c) => `Đêm nào bạn cũng nấu thử trong căn bếp thuê, làm cháy bốn cái chảo trong một tháng. ${f(c, "x19_nau_nha") ? "Món nhà mình nấu đi nấu lại thành ra có hồn hơn món của bất kỳ ai." : "Món nào cũng giống món trong sách, chỉ thiếu một chút gì đó."}`,
            [C("Đăng ký một lớp nấu ăn thật", { flags: ["x19_hoc_that"], money: -0.1, know: 3, counters: { x19_tai: 2 } }, "Tay nghề lên thật, lỡ vài bữa tiệc"),
             C("Học qua phim trên mạng cho nhanh", { flags: ["x19_hoc_mang"], counters: { x19_tai: 1 } }, "Nhanh, nhưng chỉ đủ để diễn")]),
        ],
        [
          card("x19_cl_bep_that", "Người đầu bếp thật trở về", (c, k) => `${cap(k.npc("bep_that"))} xuất hiện ở cửa bếp, vừa đi xa về, mặt không cảm xúc. Đứng sau lưng là ${k.scar("nguoi") || "một người quen cũ"}, người đã nhận ra bạn từ tấm ảnh trên báo. Người đầu bếp nếm một thìa nước dùng của bạn rồi nói: "Món này có vị của ${k.scar("do") || "một thứ rất cũ"}. Tôi không nấu được thế."`,
            [C("Thú nhận tất cả với người ấy", { flags: ["x19_thu_nhan"], counters: { x19_tai: 1 }, rel: 2 }, "Có thể được tha, có thể bị kiện"),
             C("Chối, bảo người ấy nhận nhầm", { flags: ["x19_choi"], pressure: { danh: 2 }, happy: -1 }, "Giữ vai thêm ít lâu, gây thù với người thật"),
             C("Đề nghị hai người nấu chung một bữa", { flags: ["x19_nau_chung"], counters: { x19_tai: 2 }, happy: 2 }, "Hai người một bếp, khách không biết ai nấu", { tier: "sovereign" })]),
        ],
        [
          card("x19_day_bao", "Hai bữa tiệc cùng giờ", (c, k) => `${k.gag()} Một tờ báo ẩm thực đăng bài: người đầu bếp nổi tiếng nấu hai bữa tiệc cùng giờ ở hai nơi. ${f(c, "x19_thu_nhan") || f(c, "x19_nau_chung") ? "Người đầu bếp thật gọi điện, hỏi bạn muốn cùng ra mặt hay để mình người ấy chịu." : "Ông chủ tiệc gọi điện, giọng lạnh tanh, đòi gặp bạn ngay tối nay."}${f(c, "x19_dong_loa") ? " Người phụ bếp năm nào nhắn: nếu cần, người ấy sẵn sàng làm chứng là bạn nấu thật." : ""}`,
            [C("Ra mặt trả lời báo chí", { flags: ["x19_ra_mat"], happy: -3, counters: { x19_tai: 1 } }, "Đối diện, mất tấm mặt nạ"),
             C("Tắt điện thoại, trốn một tuần", { flags: ["x19_tron"], pressure: { danh: 2 }, happy: -2 }, "Chưa phải trả lời, tin đồn lớn dần")]),
          card("x19_day_boi_thuong", "Tờ giấy đòi bồi thường", (c, k) => `${cap(k.npc("chu_tiec"))} gửi tới một tờ giấy đòi bồi thường, cộng cả tiền mời hội đồng thẩm định. Nhưng ở cuối thư có một dòng viết tay: khách vẫn hỏi món tủ của bạn.`,
            [C("Trả một phần, xin giữ quan hệ", { money: -0.3, flags: ["x19_tra_phan"], rel: 2 }, "Mất tiền, còn đường quay lại"),
             C("Đề nghị nấu không công một tiệc", { flags: ["x19_nau_tra_no"], health: -3, counters: { x19_tai: 1 } }, "Trả bằng tay nghề, kiệt sức thêm một lần")]),
        ],
        [
          card("x19_ket", "Bữa tiệc cuối mùa", (c, k) => `Bữa tiệc cuối mùa, khách ngồi kín ba dãy bàn. ${k.gag()} ${n(c, "x19_tai") >= 5 ? "Tay nghề của bạn giờ đã là thật, chỉ có cái tên là chưa." : "Bạn vẫn nấu bằng một nửa tay nghề và một nửa liều lĩnh."} Trong túi tạp dề, ${noOr(c, k)} vẫn chờ được trả, và lần này bạn phải chọn đứng trong bếp bằng tên ai.`,
            (c) => finale(c, [
              { l: X19_DB, label: "Mở bếp riêng bằng tên thật", hint: "Nghề thật, bắt đầu lại từ khách quen", path: "restaurateur" },
              { l: X19_QUAN, label: "Mua một gian quán cơm nhỏ", hint: "Vay thêm, nấu đúng món mình biết" },
              { l: X19_LO, label: "Công khai, bồi thường đủ cả", hint: "Mất hai năm thu nhập, nhẹ lòng" },
            ])),
        ],
      ] }),
    "Phi lý: mỗi bữa tiệc lớn hơn, lời nói dối cũng vậy"),

  /* ---------------------------------------------------------------- X20 */
  weird("X20", "abs", ["ky", "tinh"],
    (c) => !c.married && !c.widowed && c.age >= 22 && c.age <= 40 && (c.pressure.tinh >= 3 || f(c, "first_love") || c.rel >= 60),
    () => "Sống chung với người cưới nhầm, chờ hủy giấy",
    () => ({ title: "Đám cưới tập thể, nhầm một cặp", text: `Sau mấy lần gặp mặt do người nhà mai mối, bạn và người hứa hôn đăng ký vào một đám cưới tập thể có một trăm cặp đôi và một người đọc tên rất nhanh. Bạn ký vào tờ giấy được đưa tới, quay sang thì thấy người đứng cạnh không phải người hứa hôn, chỉ trùng họ tên với người ấy. "Giấy đã ký, đã đóng dấu," cán bộ nói, "muốn hủy thì làm đơn, chờ thủ tục."` }),
    season({ id: "w_X20", vn: "Hôn nhân giấy tờ", color: "#c7922f", years: [5, 8], weird: "abs",
      rules: { flags: ["w_hon_nhan_giay"], yearly: { money: -0.03 } },
      reset: { cast: [{ key: "nguoi_kia", role: "neighbor", label: "người cưới nhầm" }, { key: "can_bo", role: "official", label: "anh cán bộ hộ tịch" }] },
      gag: { key: "trung_ten", lines: [
        "Ở văn phòng hộ tịch, người ta gọi tên người kia. Cả người kia lẫn người hứa hôn của bạn cùng đứng dậy. Cán bộ thở dài, ghi thêm chữ A và chữ B.",
        "Thư của người hứa hôn của bạn lại đến tay người kia. Lần này là thư mời họp lớp, và người kia đã đi họp thay.",
        "Ngân hàng gửi tới một thẻ cho cả hai người, chung một hạn mức. Cả nhà tiết kiệm như chưa từng tiết kiệm.",
        "Trên tờ giấy cuối cùng, hai cái tên giống hệt nhau đứng cạnh tên bạn. Lần đầu tiên, không ai nhầm.",
      ] },
      landings: [X20_YEU, X20_CU, X20_MOT_MINH],
      beats: [
        [
          card("x20_mo_chung_nha", "Căn hộ cho hai người lạ", (c, k) => `Theo quy định, cặp vừa đăng ký phải ở chung một địa chỉ tới khi thủ tục hủy được duyệt. ${cap(k.npc("nguoi_kia"))} xách vali đến, đặt một chậu cây lên bàn của bạn và hỏi phòng tắm ở đâu. Lệ phí giữ hồ sơ hủy nộp theo năm, hai người chia đôi. ${k.gag()}`,
            [C("Chia nhà bằng một vạch phấn", { flags: ["x20_vach_phan"], happy: 1 }, "Rạch ròi, ngày nào cũng có người giẫm vạch"),
             C("Nấu cơm mời người kia ăn chung", { flags: ["x20_an_chung"], rel: 2, counters: { x20_gan: 1 } }, "Dễ thở hơn, khó giữ khoảng cách")]),
          card("x20_mo_nguoi_yeu", "Ba người, một cái bàn", () => "Người hứa hôn của bạn đến chơi, mang theo hộp bánh và vẻ mặt cố bình tĩnh. Ba người ngồi quanh một cái bàn, người kia rót nước, và không ai biết nên ngồi ghế nào.",
            [C("Nắm tay người hứa hôn ngay trước mặt", { flags: ["x20_giu_nguoi_yeu"], counters: { x20_cu: 1 }, happy: 1 }, "Người hứa hôn yên lòng, người kia ra ban công rất lâu"),
             C("Giới thiệu hai người làm quen", { flags: ["x20_lam_quen"], rel: 2 }, "Ai cũng lịch sự, ai cũng hơi đau")]),
        ],
        [
          card("x20_kd_ho_so", "Hồ sơ hủy bị trả về", (c, k) => `${k.gag()} Hồ sơ hủy kết hôn bị trả về vì thiếu chữ ký nhân chứng, mà nhân chứng là chín mươi chín cặp đôi còn lại. ${cap(k.npc("can_bo"))} đưa bạn bản danh sách địa chỉ của họ.`,
            [C("Cùng người kia đi xin đủ chữ ký", { flags: ["x20_di_cung"], health: -2, counters: { x20_gan: 1 } }, "Hồ sơ nhích, hai người đi chung nhiều chuyến xe"),
             C("Thuê dịch vụ làm hộ", { money: -0.2, flags: ["x20_thue_dich_vu"] }, "Tốn tiền, thủ tục vẫn chậm")]),
          card("x20_kd_om", "Đêm người kia sốt", (c) => `Một đêm người kia sốt cao, nằm co trên chiếc ghế dài ${f(c, "x20_vach_phan") ? "vì không dám bước qua vạch phấn" : "vì không muốn làm phiền ai"}. Bạn đứng cạnh, cầm cốc nước, nghĩ về những điều luật không ai viết ra.`,
            [C("Ngồi chăm người kia đến sáng", { flags: ["x20_cham_soc"], counters: { x20_gan: 2 }, health: -1 }, "Lòng tốt, và một thứ khó gọi tên"),
             C("Gọi người hứa hôn đến cùng giúp", { flags: ["x20_goi_nguoi_yeu"], counters: { x20_cu: 1 }, rel: 1 }, "Đúng mực, người hứa hôn bắt đầu mệt")]),
        ],
        [
          card("x20_cl_nhan_ra", "Người kia đã biết từ trước", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} đến chơi, nhìn người kia rồi sững lại: hai người từng quen nhau, từ cái thời gắn với ${k.scar("do") || "những món đồ cũ"}. Hóa ra người kia không ký nhầm hoàn toàn: người đó đã nhận ra bạn từ trước khi đặt bút.`,
            [C("Hỏi thẳng vì sao người kia im lặng", { flags: ["x20_hoi_thang"], counters: { x20_gan: 1 }, know: 2 }, "Biết sự thật, không quay lại được"),
             C("Giả vờ không nghe thấy", { flags: ["x20_lo_di"], happy: -1, counters: { x20_cu: 1 } }, "Yên ổn bề ngoài, trong lòng thì không")]),
        ],
        [
          card("x20_day_nguoi_yeu", "Chiếc chìa khóa dự phòng", (c, k) => `${k.gag()} ${n(c, "x20_cu") >= 2 ? "Người hứa hôn vẫn đợi, nhưng bắt đầu hỏi bạn định đợi đến bao giờ." : "Người hứa hôn gửi lại chiếc chìa khóa dự phòng, kèm một mẩu giấy: mình mệt rồi."}`,
            [C("Đến tận nhà xin thêm thời gian", { flags: ["x20_xin_doi"], counters: { x20_cu: 1 }, happy: -1 }, "Còn cơ hội, ai cũng mỏi"),
             C("Để người ấy đi", { flags: ["x20_de_di"], happy: -4 }, "Buông được, thấy trống một chỗ")]),
          card("x20_day_ky_niem", "Thiệp kỷ niệm một năm", (c) => `Đúng một năm sau đám cưới tập thể, ban tổ chức gửi thiệp chúc mừng kỷ niệm ngày cưới cho cả trăm cặp, kể cả hai người. Người kia đặt tấm thiệp lên bàn, ${f(c, "x20_vach_phan") ? "ngay giữa vạch phấn đã mờ" : "ngay giữa hai chiếc cốc"}.`,
            [C("Mời người kia đi ăn tối, coi như đùa", { flags: ["x20_an_toi"], counters: { x20_gan: 2 }, happy: 3 }, "Vui thật, và đó mới là chuyện đáng lo"),
             C("Cất tấm thiệp vào ngăn kéo", { flags: ["x20_cat_thiep"], counters: { x20_cu: 1 } }, "Giữ khoảng cách, cả nhà im lặng")]),
        ],
        [
          card("x20_ket", "Quyết định hủy được duyệt", (c, k) => `${cap(k.npc("can_bo"))} gọi cả hai lên: quyết định hủy đã được duyệt, chỉ còn ký nốt. ${k.gag()} Trên đường đi, bạn nghĩ về ${noOr(c, k)}, và về những gì một tờ giấy có thể làm với hai con người.`,
            (c) => [ending(X20_YEU, n(c, "x20_gan") >= 3 ? "Xé quyết định, ở lại với người kia" : "Hỏi người kia có muốn ký lại không", "Bắt đầu thật từ một lần nhầm"),
              ending(X20_CU, f(c, "x20_de_di") ? "Chạy theo người hứa hôn cũ, xin cưới lại" : "Ký hủy, cưới đúng người hứa hôn ban đầu", "Trở về lời hứa cũ, sau ngần ấy năm"),
              ending(X20_MOT_MINH, "Ký hủy, ở một mình", "Trả án phí cả năm thu nhập, tự do")]),
        ],
      ] }),
    "Phi lý: cưới nhầm người cùng tên, sống chung chờ hủy"),
];
