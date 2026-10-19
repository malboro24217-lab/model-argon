/**
 * Nhánh kỳ dị X01–X10 (spec 2026-10-18-canon-event §7b, phi lý cực độ). Cách viết: xem đầu canon/kit.ts.
 *
 * Mỗi nhánh: 8 thẻ (2-2-1-2-1), 1–2 người mới, gag 4 dòng gọi đúng 4 lần (mở màn, khởi động, đáy, chung kết),
 * cú lật dùng vết người (và vết đồ khi hợp), chung kết dùng vết nợ. Cờ và bộ đếm của mùa mang tiền tố x0N_
 * để các thẻ sau đọc lại lựa chọn trước. Landing nghề chỉ mở khi tuổi ≤ ages[1] + 5 của con đường đó.
 */
import type { FactContext } from "../../types.ts";
import type { WeirdBranch } from "../Canon.ts";
import { C, cap, card, ending, land, noOr, pathOpen, season, weird } from "../kit.ts";

const has = (c: FactContext, ...fs: string[]): boolean => fs.some((f) => c.flags.has(f));
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Nông thôn: làm ruộng, xuất thân nghèo ở quê, hoặc có vườn. */
const rural = (c: FactContext): boolean => c.farmer || has(c, "origin_poor_rural", "job_farm", "orchard");
const animal = (c: FactContext, label: RegExp, key: RegExp) =>
  c.plants.find((p) => p.kind === "animal" && (label.test(p.label) || key.test(p.key)));
/** Vật gài khớp chính xác: khóa có đúng từ "meo"/"ga" (tách bằng _), nhãn có đúng chữ "con mèo"/"con gà". */
const catOf = (c: FactContext) => animal(c, /(^|\s)con mèo(\s|$)/i, /(^|_)meo(_|$)/);
const henOf = (c: FactContext) => { const p = animal(c, /(^|\s)con gà(\s|$)/i, /(^|_)ga(_|$)/); return p && !/trống|chọi/.test(p.label) && !/(^|_)(trong|choi)(_|$)/.test(p.key) ? p : undefined; };
/** Đồ ông để lại: khóa trong danh sách, hoặc nhãn kết thúc bằng "ông để lại". */
const GRANDPA_KEYS = new Set(["dong_ho_cua_ong", "ban_do_cua_ong"]);
const grandpaOf = (c: FactContext) => c.plants.find((p) => p.kind === "object" && (GRANDPA_KEYS.has(p.key) || /ông (nội |ngoại )?để lại$/.test(p.label)));
/** Người bác/chú (vật gài người), dùng chung cho cửa, biến cố và thẻ của X04. */
const uncleOf = (c: FactContext) => c.plants.find((p) => p.kind === "person" && /^(người|ông) (bác|chú)(\s|$)/.test(p.label)
  && (!p.npc || !Object.values(c.cast).includes(p.npc)));   // người đã mất: không còn trong dàn nhân vật sống
/** Vết đồ có thể là đồ vật, con vật, kỹ năng, tài sản hay nghề: luôn gọi là "thứ bạn mang theo từ đời cũ". */
const doTxt = (x: string, pre: string, post: string, alt: string): string => (x ? `${pre}thứ bạn mang theo từ đời cũ, ${x}, ${post}` : alt);
const bac = (c: FactContext): string => uncleOf(c)?.label ?? "ông bác ruột";

/* ================================================================== X01 Nhiệm kỳ của trâu */

const L01_CAN_BO = land("x01_can_bo", "Huyện gọi bạn lên làm cán bộ, vì bạn là người duy nhất trong tỉnh từng thắng một con trâu trong bầu cử.", { custom: "become:official", happy: 3 });
const L01_DAI_BIEU = land("x01_dai_bieu", "Bạn tự nộp đơn ra ứng cử đại biểu, lần đầu tiên trong đời, và trúng. Đốm không ra tranh.", { custom: "become:politician", happy: 3 });
const L01_THUA = land("x01_thua_trau", "Bạn thua Đốm, nộp lại con dấu, tiền vận động mất trắng. Mỗi sáng Đốm đi ngang nhà bạn và dừng một chút, như chào đồng nghiệp cũ.", { money: -1, happy: 4, flags: ["x01_thua_trau"] });
const L01_LEN_PHO = land("x01_len_pho", "Bạn giao con dấu, khăn gói lên phố sống những năm còn lại. Trong va li có một túm lông trâu gói giấy báo.", { custom: "move_city", happy: 2 });

const X01 = weird("X01", "abs", ["danh", "dat"],
  (c) => c.age >= 22 && c.age <= 68 && rural(c) && c.pressure.danh >= 2,
  () => "Nhận con dấu thôn, đấu với con trâu",
  (s) => ({ title: "Trưởng thôn bất đắc dĩ",
    text: `Thôn bạn ở ${s.noi || "quê"} vừa bầu trưởng thôn, và bạn trúng cử dù chưa từng nộp đơn. Người về nhì là con trâu Đốm, kém bạn đúng ba phiếu, mà ba phiếu ấy đều của nhà bạn. Ông tổ trưởng bầu cử cầm loa nói: "Trên giấy thì bạn thắng. Ngoài đồng thì trâu thắng." Ngoài sân, Đốm nhai rơm, nhìn bạn như người chờ đếm lại phiếu.` }),
  season({ id: "w_X01", vn: "Nhiệm kỳ của trâu", color: "#c98a2e", years: [6, 10], weird: "abs",
    rules: { flags: ["w_x01_nhiem_ky_trau"] },
    reset: { cast: [{ key: "chu_trau", role: "neighbor", label: "ông chủ con trâu" }, { key: "thu_ky", role: "official", label: "cô thư ký thôn" }] },
    gag: { key: "dai_bieu_dom", lines: [
      "Đốm nằm chắn cửa nhà họp thôn, nhai rơm, không nhìn ai. Biên bản ghi: đại biểu Đốm có mặt.",
      `Đốm lại nằm chắn cửa. Lần này có người quàng cho nó một vòng hoa ghi "Cảm ơn đại biểu".`,
      "Đốm ngủ gật giữa buổi họp. Cả hội trường tự hạ giọng cho nó ngủ.",
      "Biên bản cuối nhiệm kỳ ghi: đại biểu Đốm có mặt đủ mọi buổi, nhiều hơn bạn hai buổi.",
    ] },
    landings: [L01_CAN_BO, L01_DAI_BIEU, L01_THUA, L01_LEN_PHO],
    beats: [
      [
        card("x01_mo_nham_chuc", "Con dấu và con trâu", (c, k) => `Bạn nhận con dấu thôn trong một buổi sáng có ba mươi người dự, hai mươi chín người đứng phía con trâu. Đốm được ai đó quàng cho một dải lụa đỏ ghi "Đại biểu nhân dân". ${k.gag()}`,
          [C("Đọc diễn văn nhậm chức thật dài", { flags: ["x01_dien_van"], counters: { x01_long_dan: -1 }, pressure: { danh: 1 } }, "Ra dáng người đứng đầu, nhưng trâu im lặng vẫn được vỗ tay"),
           C("Mời Đốm làm phó thôn", { flags: ["x01_pho_trau"], counters: { x01_long_dan: 1 } }, "Dân vui, nhưng từ nay biên bản có dấu móng")]),
        card("x01_mo_chu_trau", "Ông chủ con trâu", (c, k) => `${cap(k.npc("chu_trau"))} sang nhà bạn lúc trời chưa sáng, mang theo một bó cỏ và một tờ đơn. Ông nói trâu nhà ông không ra tranh cử, "nó tự ra", và giờ nó cần một suất cỏ công như mọi đại biểu. Tờ đơn có chữ ký của mười bốn hộ.`,
          [C("Duyệt cho Đốm một suất cỏ công", { flags: ["x01_suat_co"], money: -0.05, counters: { x01_long_dan: 1 } }, "Mười bốn hộ hài lòng, quỹ thôn vơi một ít"),
           C("Từ chối: quỹ thôn không nuôi trâu", { flags: ["x01_tu_choi_co"], counters: { x01_long_dan: -1 } }, "Đúng nguyên tắc, mất mười bốn lá phiếu")]),
      ],
      [
        card("x01_kd_duong", "Con đường của ai", (c, k) => `Quỹ thôn chỉ đủ làm một việc trong năm: đổ bê tông con đường ra đồng, hoặc dựng nhà họp. ${c.flags.has("x01_pho_trau") ? "Phó thôn Đốm đã nằm sẵn ở bãi đất định dựng nhà họp, không chịu dậy." : "Đốm nằm giữa con đường đất, như để nhắc rằng nó đi đường này nhiều hơn ai hết."} ${cap(k.npc("thu_ky"))} hỏi nhỏ: "Bạn chọn, hay để trâu chọn?" ${k.gag()}`,
          [C("Đổ bê tông con đường ra đồng", { flags: ["x01_lam_duong"], counters: { x01_long_dan: -1 } }, "Có ích lâu dài, nhưng trâu không thích bê tông"),
           C("Dựng nhà họp có mái cho trâu nằm", { flags: ["x01_nha_hop"], counters: { x01_long_dan: 1 } }, "Dân khen, đường vẫn lầy")]),
        card("x01_kd_tham_do", "Bảng thăm dò ở chợ", () => `Ai đó dán một tờ giấy ở cổng chợ: Đốm 61%, bạn 38%, 1% ghi "trâu nào cũng được". Bạn nhận ra nét chữ, nhưng không nói. Còn hai năm nữa là bầu lại.`,
          [C("Đi gõ cửa từng nhà", { health: -2, flags: ["x01_go_cua"], counters: { x01_long_dan: 2 } }, "Mỏi chân, lên được vài điểm"),
           C("Chụp ảnh chung với Đốm treo khắp thôn", { flags: ["x01_anh_trau"], counters: { x01_long_dan: 1 }, pressure: { danh: 1 } }, "Mượn uy trâu, mất uy mình"),
           C("Kệ bảng thăm dò, lo việc thôn", { flags: ["x01_lo_viec"], know: 2 }, "Làm được việc, chưa chắc được phiếu")]),
      ],
      [
        card("x01_cl_truyen_don", "Người in truyền đơn", (c, k) => `Bạn lần ra người in truyền đơn "Đốm không ăn hối lộ": đó là ${k.scar("nguoi") || "một người quen cũ"}. Người đó rót cho bạn một chén nước rồi nói: "Tôi không ghét bạn. Tôi chỉ tin trâu hơn." ${doTxt(k.scar("do"), "Người đó còn nhắc tới ", "và bảo trâu thì chẳng cần mang theo gì.", "Người đó còn bảo trâu thì chẳng cần đời cũ nào cả.")}`,
          (c) => [c.flags.has("x01_pho_trau")
            ? C("Mời người đó làm phó thôn thứ hai, cạnh Đốm", { flags: ["x01_moi_nguoi_cu"], counters: { x01_long_dan: 2 }, rel: 2 }, "Thôn có hai phó, một người một trâu")
            : C("Mời người đó về làm phó thôn", { flags: ["x01_moi_nguoi_cu"], counters: { x01_long_dan: 2 }, rel: 2 }, "Thêm một cánh tay, chia bớt một nửa quyền"),
           C("Đem chuyện ra họp thôn", { flags: ["x01_phoi"], counters: { x01_long_dan: -1 }, pressure: { danh: 1 } }, "Thắng lý, thua tình")]),
      ],
      [
        card("x01_day_lu", "Lũ về lúc nửa đêm", (c, k) => `Nước lên quá đầu gối lúc nửa đêm, đúng hôm bạn ở trên huyện xin giống lúa. ${c.flags.has("x01_lam_duong") ? "Con đường bê tông bạn làm là lối duy nhất còn đi được, và Đốm dẫn cả thôn đi trên đó, từng bước chậm rãi." : "Con đường đất đã thành sông, Đốm lội trước, cả thôn bám đuôi nó lên gò cao."} Sáng ra, người ta kể rằng trâu cứu thôn. ${k.gag()}`,
          [C("Lội về ngay trong đêm", { health: -5, flags: ["x01_loi_ve"], counters: { x01_long_dan: 2 } }, "Ướt sũng, cảm một tuần, dân nhớ mặt"),
           C("Ở lại huyện xin cứu trợ", { flags: ["x01_cuu_tro"], counters: { x01_long_dan: -1 } }, "Có gạo về sau, vắng mặt đêm nay")]),
        card("x01_day_kiem_diem", "Buổi kiểm điểm trên huyện", () => `Cán bộ huyện đặt tập biên bản lên bàn và chỉ vào một dòng: "Đại biểu Đốm, có mặt". Ông hỏi đây là người hay là trâu. Cả phòng im lặng, chờ xem bạn đứng phía nào.`,
          [C("Nhận lỗi, gạch tên Đốm khỏi biên bản", { flags: ["x01_xoa_ten"], counters: { x01_long_dan: -2 } }, "Giữ được ghế, mất lòng dân"),
           C("Bảo vệ Đốm: nó chưa vắng buổi nào", { flags: ["x01_bao_ve_trau"], counters: { x01_long_dan: 2 }, pressure: { luat: 1 } }, "Dân thương, huyện ghi tên bạn vào sổ")]),
      ],
      [
        card("x01_ket", "Ngày bầu lại", (c, k) => `Nhiệm kỳ hết, thôn bầu lại. ${n(c, "x01_long_dan") >= 3 ? "Lần này phiếu chia gần đôi, và ai cũng biết vì sao." : "Đốm dẫn trước bốn mươi phiếu mà chưa hứa điều gì."} ${cap(k.scar("no") || "lời hứa làm con đường ra đồng")} vẫn còn đó, chưa ai quên. ${k.gag()}`,
          (c) => {
            const thua = ending(L01_THUA, "Nhường ghế cho Đốm", "Mất chức, mất tiền vận động, được ngủ ngon");
            if (pathOpen("official", c.age)) return [ending(L01_CAN_BO, "Nhận lời lên huyện làm cán bộ", "Thành người nhà nước, xa thôn"), thua];
            if (pathOpen("politician", c.age)) return [ending(L01_DAI_BIEU, "Tự nộp đơn ra ứng cử đại biểu", "Lên cao hơn, lần này phải tự xin phiếu"), thua];
            return [ending(L01_LEN_PHO, "Giao con dấu, lên phố sống tuổi già", "Rời thôn, mang theo chuyện kể cả đời"), thua];
          }),
      ],
    ] }),
  "Trâu được lòng dân hơn bạn, mà nó chẳng cần phát biểu");

/* ================================================================== X02 Gia tộc mèo */

const L02_HOA = land("x02_hoa", "Bạn ở lại, nhận chiếc ghế cạnh con mèo. Họ trả lại phần đất của nhà bạn bằng tiền, đủ sống hơn một năm.", { money: 1.2, happy: 4, flags: ["x02_hoa"] });
const L02_TACH = land("x02_tach", "Bạn tách khỏi họ, chuyển lên thành phố, ở một căn hộ cấm nuôi mèo. Lần đầu sau nhiều năm, bạn tự xếp lịch cho mình.", { custom: "move_city", happy: 3, rel: -4 });

const X02 = weird("X02", "abs", ["mau"],
  (c) => c.age >= 18 && c.age <= 68 && c.pressure.mau >= 4 && !!catOf(c),
  () => "Để cả họ sống theo lịch của con mèo",
  (s, c) => ({ title: "Gia tộc theo lịch mèo",
    text: `Cuộc họp họ ở ${s.noi || "nhà họ"} kéo dài sáu tiếng và chỉ tan khi con mèo nhà bạn ngáp một cái thật dài. Ông trưởng họ đập bàn: "Từ nay mèo ngáp thì tan họp, mèo ngủ thì cấm cãi." Cả họ giơ tay biểu quyết. Con mèo không giơ, vì nó đang nằm trên cuốn sổ biểu quyết.` }),
  season({ id: "w_X02", vn: "Gia tộc mèo", color: "#e0a030", years: [5, 9], weird: "abs",
    rules: { flags: ["w_x02_gia_toc_meo"] },
    reset: { cast: [{ key: "truong_ho", role: "mentor", label: "ông chú trưởng họ" }, { key: "em_ho", role: "sibling", label: "cô em họ giữ sổ lịch mèo" }] },
    gag: { key: "meo_chu_toa", lines: [
      "Con mèo nằm lên tờ chương trình họp. Cả họ ngồi chờ nó dậy mới đọc tiếp.",
      "Con mèo bỏ đi giữa lúc biểu quyết. Biên bản ghi: hoãn, chờ ý kiến.",
      "Không có mèo, cả họ ngồi nhìn chiếc ghế trống của nó, không ai dám tan họp.",
      "Con mèo ngủ trên ghế chủ tọa. Ông trưởng họ ngồi ghế nhựa bên cạnh, không ai thấy lạ.",
    ] },
    landings: [L02_HOA, L02_TACH],
    beats: [
      [
        card("x02_mo_lich", "Tờ lịch hai cột", (c, k) => `Tờ lịch mới dán ở nhà họ chỉ có hai cột: "mèo thức" và "mèo ngủ". Đám cưới, chia đất, sửa nhà, việc gì cũng phải xếp vào cột thức. ${cap(k.npc("truong_ho"))} đưa bút cho bạn ký tên đầu tiên. ${k.gag()}`,
          [C("Ký tên vào lịch mèo", { flags: ["x02_ky_lich"], rel: 2, counters: { x02_tach: -1 } }, "Yên với họ hàng, mất quyền tự xếp lịch"),
           C("Xin cho nhà mình được miễn", { flags: ["x02_xin_mien"], counters: { x02_tach: 1 } }, "Giữ được giờ giấc, bị nhìn như người ngoài")]),
        card("x02_mo_so", "Cuốn sổ tâm trạng", (c, k) => `${cap(k.npc("em_ho"))} được giao giữ sổ tâm trạng của con mèo, ghi từng giờ nó ngáp, nó liếm chân, nó nhìn ra cửa. Muốn đặt lịch họp phải nộp phí "giữ sổ" cho cô. Cuốn sổ đã dày hơn cả gia phả.`,
          [C("Giúp cô ấy ghi sổ", { flags: ["x02_giu_so"], know: 2, counters: { x02_quyen: 1 } }, "Biết lịch mèo trước mọi người, dính vào tiền phí"),
           C("Hỏi công khai về tiền phí giữ sổ", { flags: ["x02_hoi_phi"], counters: { x02_tach: 1 } }, "Đúng lẽ, mất một đồng minh")]),
      ],
      [
        card("x02_kd_dam_cuoi", "Đám cưới chờ mèo", (c, k) => `Đám cưới của đứa em họ đã hoãn ba tuần vì con mèo không chịu bước vào phòng tiệc. Hai trăm khách, mười bàn tiệc nguội, cô dâu đứng cầm hoa cạnh chiếc lồng trống. Mọi người quay sang bạn, người duy nhất con mèo cho bế. ${k.gag()}`,
          [C("Bế mèo vào phòng tiệc", { flags: ["x02_be_meo"], counters: { x02_quyen: 1 }, happy: 2 }, "Cưới được, nhưng bạn vừa phá luật họ"),
           C("Giữ đúng lịch, hoãn tiếp", { flags: ["x02_hoan_cuoi"], rel: -2, counters: { x02_tach: 1 } }, "Không ai trách bạn, chỉ trách số phận")]),
        card("x02_kd_quy_ca", "Quỹ họ mua cá", (c, k) => `Sổ quỹ họ cuối năm ghi: tiền mua cá cho mèo gấp ba tiền học bổng cho con cháu. ${cap(k.npc("truong_ho"))} giải thích rằng mèo no thì họp mới yên. Một đứa cháu học giỏi đứng ngoài cửa, cầm tờ giấy khen, chờ xin tiền mua sách.`,
          [C("Đề nghị chia lại quỹ họ", { flags: ["x02_chia_quy"], counters: { x02_tach: 1 }, pressure: { mau: 1 } }, "Đứa cháu có sách, ông trưởng họ mất mặt"),
           C("Bỏ tiền túi mua sách cho cháu", { money: -0.05, flags: ["x02_mua_sach"], rel: 2 }, "Êm chuyện, tiền mình chịu")]),
      ],
      [
        card("x02_cl_thong_dich", "Người hiểu ý mèo", (c, k) => `Con mèo bắt đầu ngủ trên đùi bạn ở mọi buổi họp, và cả họ kết luận bạn là "người hiểu ý mèo". ${cap(k.scar("nguoi") || "một người họ hàng xa")} thì thầm rằng ngày trước ông nội cũng được gọi như thế, và ông đã dùng danh ấy để chia đất cho cả họ. ${doTxt(k.scar("do"), "Người đó bảo con mèo chọn bạn vì ", "thứ có mùi của người biết việc.", "Người đó bảo con mèo chọn bạn vì bạn ngồi yên nhất họ.")}`,
          [C("Nhận làm người thông dịch cho mèo", { flags: ["x02_thong_dich"], counters: { x02_quyen: 2 } }, "Nắm quyền trong họ, gánh mọi lời trách"),
           C("Nói thật: mèo chỉ thích chỗ ấm", { flags: ["x02_noi_that"], counters: { x02_tach: 1 } }, "Thật thà, cả họ cho là bạn phá đám")]),
      ],
      [
        card("x02_day_meo_mat", "Chín ngày không mèo", (c, k) => `Con mèo biến mất chín ngày, và cả họ đứng im như cái đồng hồ hết pin. Buổi họp chia đất không mở được, đám cưới thứ hai hoãn, ${c.flags.has("x02_thong_dich") ? "và ai cũng nhìn bạn, người thông dịch không còn gì để dịch." : "và có người bắt đầu nói rằng bạn giấu mèo."} ${k.gag()}`,
          [C("Đi tìm mèo khắp xóm", { health: -2, flags: ["x02_tim_meo"], counters: { x02_quyen: 1 } }, "Mỏi chân, được cả họ ghi công"),
           C("Đề nghị họp luôn, không cần mèo", { flags: ["x02_hop_khong_meo"], counters: { x02_tach: 2 }, pressure: { mau: 1 } }, "Việc chạy lại, nhưng bạn thành kẻ phản luật")]),
        card("x02_day_meo_con", "Con mèo thứ hai", (c, k) => `Con mèo trở về, kéo theo một con mèo con không ai biết từ đâu. ${cap(k.npc("em_ho"))} tuyên bố mèo con mới là người kế vị, và lịch họ phải chia làm hai. Đến chiều, cả họ đã chia làm hai phe.`,
          [C("Theo phe mèo già", { flags: ["x02_phe_gia"], counters: { x02_quyen: 1 } }, "Giữ lề lối cũ, mất lòng người trẻ"),
           C("Theo phe mèo con", { flags: ["x02_phe_con"], counters: { x02_tach: 1 } }, "Đứng với người trẻ, mất lòng ông trưởng họ"),
           C("Bỏ họp, về nhà nấu cơm", { flags: ["x02_bo_ve"], counters: { x02_tach: 2 }, happy: 2 }, "Yên thân hôm nay, xa họ thêm một bước")]),
      ],
      [
        card("x02_ket", "Buổi họp cuối mùa", (c, k) => `${n(c, "x02_tach") >= 4 ? "Cả họ họp lần cuối để quyết có giữ tên bạn trong sổ hay không." : "Cả họ họp lần cuối để bầu người ngồi cạnh con mèo."} ${cap(k.scar("no") || "lời hứa với người trong họ")} được ông trưởng họ nhắc lại trước mặt mọi người, rành rọt từng chữ. ${k.gag()}`,
          [ending(L02_HOA, "Ở lại, ngồi cạnh con mèo", "Được phần đất, mất quyền tự quyết lịch đời mình"),
           ending(L02_TACH, "Tách họ, lên thành phố", "Tự do giờ giấc, xa cả họ")]),
      ],
    ] }),
  "Mọi cuộc họp phải có mèo, và mèo thì ghét họp");

/* ================================================================== X03 Lễ hội mang tên mình */

const L03_MC = land("x03_mc", "Đài tỉnh mời bạn dẫn chương trình lễ hội, rồi giữ bạn lại dẫn luôn bản tin cuối tuần.", { custom: "become:tv_host", happy: 3 });
const L03_HDV = land("x03_huong_dan", "Bạn mở tour \"Đi lại đám cưới\", dẫn khách qua từng góc quảng trường năm ấy.", { custom: "become:tour_guide", happy: 2 });
const L03_BAN = land("x03_ban_ten", "Bạn bán quyền đặt tên lễ hội cho tỉnh, nhận một khoản bằng hai năm thu nhập. Từ năm sau, lễ hội mang tên một loại trái cây.", { money: 2, happy: 1 });
const L03_GIU = land("x03_giu_hoi", "Bạn giữ lễ hội, mở quầy bán hình nộm lưu niệm ngay cạnh sân khấu. Mỗi mùa hội nuôi cả năm.", { income_mult: 1.2, money: 0.5, flags: ["x03_giu_hoi"] });

const X03 = weird("X03", "abs", ["tinh", "danh"],
  (c) => !c.married && !c.widowed && c.age >= 22 && c.age <= 45 && c.rel >= 40,
  () => "Để đám cưới thành lễ hội của cả tỉnh",
  () => ({ title: "Đám cưới thành lễ hội",
    text: `Ba ngày trước đám cưới, thiệp mời của bạn bị in nhầm vào lịch lễ hội của cả tỉnh. Sáng nay xe tải chở tới một sân khấu, bốn đội múa và một ông cán bộ văn hóa cầm cờ: "Năm đầu thì phải làm cho hoành tráng." Người sắp cưới của bạn đứng ở cổng với bó hoa cưới, kẹt giữa hai hàng xúc xích nướng.` }),
  season({ id: "w_X03", vn: "Lễ hội mang tên mình", color: "#e8b23a", years: [6, 10], weird: "abs",
    rules: { flags: ["w_x03_le_hoi"], yearly: { money: -0.05 } },
    reset: { cast: [{ key: "can_bo", role: "official", label: "ông cán bộ văn hóa tỉnh" }] },
    gag: { key: "hinh_nom", lines: [
      "Linh vật lễ hội là hai hình nộm khổng lồ mặc đồ cưới, mặt giống bạn chừng sáu phần.",
      "Hình nộm năm nay được sơn lại, giống bạn bảy phần, giống ông cán bộ ba phần.",
      "Gió lật hình nộm cô dâu đè lên hình nộm chú rể. Khán giả vỗ tay, tưởng là tiết mục.",
      "Trẻ con cả tỉnh hóa trang thành bạn, có đứa đội nguyên kiểu tóc ngày cưới.",
    ] },
    landings: [L03_MC, L03_HDV, L03_BAN, L03_GIU],
    beats: [
      [
        card("x03_mo_cuoi", "Năm nghìn khách không mời", (c, k) => `Bạn đọc lời thề trước năm nghìn người lạ, qua một cái loa vang tới tận chợ huyện. Có người ở hàng sau hô "Hôn đi!", rồi cả quảng trường hô theo. ${k.gag()}`,
          (c) => [C("Cứ thế mà cưới giữa hội", { flags: ["x03_cuoi_giua_hoi"], happy: 3, counters: { x03_danh: 1 }, ...(c.married ? {} : { custom: "marry" }) }, "Một ngày nhớ đời, của cả tỉnh chứ không riêng ai"),
            C("Kéo nhau về nhà cưới lại", { flags: ["x03_cuoi_lai"], money: -0.1, rel: 3, ...(c.married ? {} : { custom: "marry" }) }, "Đám cưới của riêng hai người, sân khấu bỏ trống")]),
        card("x03_mo_cong_van", "Công văn số một", (c, k) => `Một tuần sau, ${k.npc("can_bo")} mang tới công văn đóng dấu đỏ: lễ hội mang tên bạn được tổ chức hằng năm, và bạn là "trưởng ban danh dự". Điều ba ghi rõ: mỗi năm hai người phải tái hiện đám cưới trên sân khấu chính.`,
          [C("Ký nhận chức trưởng ban", { flags: ["x03_ky_nhan"], counters: { x03_danh: 1 } }, "Có danh, có việc mỗi năm, không có lối ra"),
           C("Xin đổi tên lễ hội", { flags: ["x03_doi_ten"], counters: { x03_danh: -1 } }, "Bớt mang tiếng, tỉnh phật ý")]),
      ],
      [
        card("x03_kd_tai_hien", "Cưới lại thêm lần nữa", (c, k) => `Mấy mùa hội sau, hai người lại mặc đồ cưới, lại đọc lời thề, lần này có thêm màn bắn pháo giấy và một đoàn xe hoa của nhà tài trợ. ${c.flags.has("x03_cuoi_lai") ? "Đám cưới thật ở nhà năm ấy giờ chỉ còn trong một tấm ảnh nhòe." : "Hai người đã thuộc kịch bản hơn cả lời thề thật."} ${k.gag()}`,
          [C("Diễn cho tròn vai", { counters: { x03_danh: 2 }, rel: -2, flags: ["x03_dien_tron"] }, "Khán giả đông thêm, hai người mệt thêm"),
           C("Thuê một cặp đóng thế", { money: -0.05, flags: ["x03_dong_the"], counters: { x03_danh: -1 } }, "Đỡ mệt, báo tỉnh viết rằng cô dâu chú rể gầy đi")]),
        card("x03_kd_tai_tro", "Nhà tài trợ nước chấm", () => `Một hãng nước chấm trong tỉnh muốn gắn thêm chữ "mùa nước chấm" vào sau tên lễ hội, trả một khoản bằng nửa năm thu nhập. Trên bản phác thảo, chai nước chấm to hơn mặt hai người cộng lại.`,
          [C("Nhận tiền tài trợ", { money: 0.5, flags: ["x03_tai_tro"], counters: { x03_danh: 1 } }, "Có tiền, tên mình đi cạnh chai nước chấm"),
           C("Từ chối để giữ tên lễ hội", { flags: ["x03_giu_ten"], happy: 2 }, "Giữ thể diện, ngân sách hội thiếu")]),
      ],
      [
        card("x03_cl_thiep", "Tấm thiệp không in nhầm", (c, k) => `Năm nay ban tổ chức mời một giám khảo bất ngờ cho cuộc thi "cặp đôi giống chủ lễ hội nhất": ${k.scar("nguoi") || "một người quen cũ"}. Sau buổi chấm, người đó kéo bạn ra sau sân khấu: tấm thiệp năm ấy không in nhầm, có người cố ý gửi nó lên tỉnh. "Muốn biết là ai thì cứ hỏi, nhưng hỏi rồi thì đừng trách tôi."`,
          [C("Tìm cho ra người gửi thiệp", { flags: ["x03_tim_nguoi_gui"], know: 2, counters: { x03_danh: -1 } }, "Biết sự thật, mất lòng một người trong nhà"),
           C("Cảm ơn người đó rồi về", { flags: ["x03_bo_qua"], happy: 2, counters: { x03_danh: 1 } }, "Yên ổn, giữ lễ hội như cũ")]),
      ],
      [
        card("x03_day_bao", "Bão đêm khai mạc", (c, k) => `Bão vào đúng đêm khai mạc. Sân khấu đổ, hình nộm bay sang ruộng bên, và vì bạn là trưởng ban danh dự nên giấy đòi đền gửi thẳng về nhà bạn. ${c.flags.has("x03_tai_tro") ? "Hãng nước chấm rút tài trợ ngay trong đêm, chỉ để lại một thùng nước chấm." : "Không có nhà tài trợ nào đỡ, quỹ hội trống trơn."} ${k.gag()}`,
          [C("Bỏ tiền túi ra đền", { money: -0.4, flags: ["x03_den_tien"], counters: { x03_danh: 1 } }, "Mất tiền, giữ được tên tuổi"),
           C("Đẩy trách nhiệm về cho tỉnh", { flags: ["x03_day_tinh"], counters: { x03_danh: -2 }, pressure: { luat: 1 } }, "Giữ tiền, mất lòng ông cán bộ")]),
        card("x03_day_cai_nhau", "Vương miện giấy", () => `Một mùa hội nọ, ngay trước giờ tái hiện, nửa kia của bạn tháo chiếc vương miện giấy xuống: "Mình cưới nhau hay cưới cái lễ hội?" Hai nghìn khán giả đang chờ sau tấm màn.`,
          [C("Hứa đây là năm cuối", { flags: ["x03_hua_nghi"], rel: 3, counters: { x03_danh: -1 } }, "Giữ được nhà, lễ hội thiếu người"),
           C("Xin thêm một năm nữa thôi", { flags: ["x03_them_nam"], rel: -3, counters: { x03_danh: 1 } }, "Giữ được hội, nhà lạnh thêm")]),
      ],
      [
        card("x03_ket", "Lễ hội năm cuối", (c, k) => `Đêm bế mạc, ${k.npc("can_bo")} trao cho bạn một tấm bằng khen và một xấp hóa đơn. ${c.flags.has("x03_hua_nghi") ? "Nửa kia của bạn ngồi hàng đầu, nhắc khẽ lời hứa năm ngoái." : n(c, "x03_danh") >= 3 ? "Cả quảng trường hô tên bạn như hô tên một ca sĩ." : "Khán giả thưa hơn năm trước, hình nộm đã bong sơn."} ${cap(k.scar("no") || "lời hứa trong ngày cưới")} vẫn chưa trả, và tỉnh muốn biết năm sau lễ hội còn mang tên bạn hay không. ${k.gag()}`,
          (c) => {
            const ban = ending(L03_BAN, "Bán tên lễ hội cho tỉnh", "Có một khoản lớn, tên bạn rời khỏi tấm băng rôn");
            const giu = ending(L03_GIU, "Giữ lễ hội, mở quầy lưu niệm", "Thu nhập đều mỗi mùa, năm nào cũng phải cưới lại");
            if (pathOpen("tv_host", c.age)) return [ending(L03_MC, "Nhận lời dẫn chương trình cho đài tỉnh", "Thành gương mặt quen của tỉnh, hết là cô dâu chú rể"), ban, giu];
            if (pathOpen("tour_guide", c.age)) return [ending(L03_HDV, "Mở tour dẫn khách đi lại đám cưới", "Sống bằng chuyện của mình, kể mãi một câu chuyện"), ban, giu];
            return [ban, giu];
          }),
      ],
    ] }),
  "Năm nào cũng phải tổ chức, và năm nào cũng phải cưới lại");

/* ================================================================== X04 Quốc vương 30 m² */

const L04_DU_LICH = land("x04_du_lich", "Vương quốc thành điểm tham quan có vé, có quầy hộ chiếu lưu niệm. Tiền vé mỗi năm bằng hơn một năm làm thuê.", { income_mult: 1.3, money: 1, flags: ["x04_vuong_quoc"] });
const L04_KIEN = land("x04_kien_tung", "Bạn kiện đến cùng và thua. Ba mươi mét vuông chia làm bốn, án phí bằng hai năm thu nhập, lá cờ được trả lại trong một túi nilon.", { money: -2, happy: -3, flags: ["x04_thua_kien"] });
const L04_BAN = land("x04_ban_nuoc", "Bạn bán cả vương quốc cho một nhà sưu tập kỳ quặc, kèm cờ, dấu và quốc ca. Giá bằng ba năm thu nhập.", { money: 3, happy: 2 });

const X04 = weird("X04", "abs", ["dat", "tien"],
  (c) => c.age >= 18 && c.age <= 68 && (c.owns.has("land") || !!uncleOf(c)),
  () => "Nhận thừa kế một quốc gia 30 m²",
  (s, c) => ({ title: "Quốc gia ba mươi mét vuông",
    text: `${cap(bac(c))} mất, để lại cho bạn đúng ba mươi mét vuông đất ${c.owns.has("land") ? "giáp mảnh đất của bạn" : `sau chợ ${s.noi || "quê"}`} và một tờ giấy đóng con dấu tự khắc: "Vương quốc Ba Mươi Mét, diện tích toàn quốc 30 m²." Trong hộp có lá cờ may bằng áo mưa, một con dấu và cuốn sổ ghi "dân số: 1, đã mất". Người đọc di chúc gập giấy lại, cúi đầu: "Mời bệ hạ ký nhận."` }),
  season({ id: "w_X04", vn: "Quốc vương 30 m²", color: "#d97b29", years: [5, 9], weird: "abs",
    rules: { flags: ["w_x04_quoc_vuong"] },
    reset: { cast: [{ key: "dia_chinh", role: "official", label: "anh cán bộ địa chính" }, { key: "khach", role: "neighbor", label: "cô du khách xin nhập quốc tịch" }] },
    gag: { key: "quoc_ca", lines: [
      "Quốc ca của vương quốc dài đúng mười một giây, phát bằng một cái loa cầm tay.",
      "Quốc ca vang lên lúc bảy giờ sáng. Hàng xóm gõ tường xin vặn nhỏ, gõ đúng nhịp.",
      "Có khách lạ thuộc lòng quốc ca, hát luôn cả đoạn hai mà bạn chưa từng viết.",
      "Cái loa cầm tay hỏng hẳn. Bạn tự hát quốc ca, mười một giây, không lệch nhịp nào.",
    ] },
    landings: [L04_DU_LICH, L04_KIEN, L04_BAN],
    beats: [
      [
        card("x04_mo_bien_gioi", "Biên giới bằng dây phơi", (c, k) => `Bạn căng một sợi dây phơi quanh ba mươi mét vuông và treo tấm biển "Biên giới, xin xuất trình giấy tờ". Ngay chiều hôm đó, con gà nhà hàng xóm vượt biên ba lần. ${k.gag()}`,
          [C("Mở cửa khẩu, bán vé tham quan", { flags: ["x04_thu_ve"], money: 0.05, counters: { x04_quoc: 1 } }, "Có chút tiền vé, bắt đầu bị để ý"),
           C("Trồng rau trên lãnh thổ", { flags: ["x04_trong_rau"], happy: 2 }, "Yên lành, quốc gia thành luống cải")]),
        card("x04_mo_ho_chieu", "Hộ chiếu số 0002", (c, k) => `${cap(k.npc("khach"))} đi bộ từ bến xe tới, cầm theo ảnh thẻ in sẵn, xin làm công dân thứ hai. "Tôi chưa từng thuộc về nơi nào nhỏ như thế này," cô nói, rồi đặt lệ phí lên bàn trước khi bạn kịp đặt ra lệ phí.`,
          [C("Cấp hộ chiếu số 0002", { flags: ["x04_cong_dan"], counters: { x04_quoc: 1 } }, "Dân số tăng gấp đôi, trách nhiệm cũng thế"),
           C("Mở dịch vụ đóng dấu hộ chiếu", { money: 0.1, flags: ["x04_ban_dau"], counters: { x04_kien: 1 } }, "Tiền vào đều, giấy tờ bắt đầu rắc rối")]),
      ],
      [
        card("x04_kd_thue", "Thuế nhập cảnh", (c, k) => `Mùa du lịch, khách xếp hàng bốn mươi mét để được đóng dấu nhập cảnh vào một mảnh đất nhỏ hơn sân bóng chuyền. Bạn thu mỗi người một khoản "thuế nhập cảnh". Sáng thứ hai, ${k.npc("dia_chinh")} đứng ở cửa khẩu, tay cầm biên bản. ${k.gag()}`,
          [C("Đăng ký nộp thuế như một quán nước", { money: -0.1, flags: ["x04_nop_thue"] }, "Hợp pháp, nhưng vương quốc thành hộ kinh doanh"),
           C("Tuyên bố miễn trừ ngoại giao", { flags: ["x04_mien_tru"], counters: { x04_kien: 2 }, pressure: { luat: 2 } }, "Khách thích, biên bản dày thêm")]),
        card("x04_kd_lang_gieng", "Nước láng giềng", () => "Ông hàng xóm tuyên bố cái nhà kho hai mươi mét vuông của ông là một nước độc lập, và đòi lại nửa mét đất biên giới. Ông treo cờ bằng tấm bạt xanh, cao hơn cờ của bạn đúng một gang tay.",
          [C("Ký hiệp ước hòa bình", { flags: ["x04_hiep_uoc"], rel: 2 }, "Thêm đồng minh, mất nửa mét đất"),
           C("Xây tường biên giới bằng gạch", { money: -0.1, flags: ["x04_xay_tuong"], counters: { x04_kien: 1 } }, "Giữ được đất, mất hàng xóm")]),
      ],
      [
        card("x04_cl_quoc_kho", "Quốc khố bằng hộp bánh", (c, k) => `Bạn mở quốc khố, một hộp bánh quy bằng thiếc, và tìm thấy cuốn sổ tay của ${bac(c)}. ${k.scar("nguoi") ? `Trang đầu ghi tên công dân danh dự đầu tiên: ${k.scar("nguoi")}.` : "Trang đầu ghi tên một công dân danh dự mà bạn không nhớ là ai."} Dòng cuối viết: "Nước nhỏ thì sống bằng khách, nước lớn thì sống bằng giấy tờ. Đừng để mất cả hai."`,
          [C("Mời người đó về làm thủ tướng", { flags: ["x04_thu_tuong"], counters: { x04_quoc: 1 }, rel: 2 }, "Có người chia việc, chia luôn cả quyền"),
           C("Bán cuốn sổ cho nhà sưu tập", { money: 0.3, flags: ["x04_ban_so"], happy: -2 }, "Có tiền, mất chứng từ duy nhất của vương quốc")]),
      ],
      [
        card("x04_day_trieu_tap", "Giấy triệu tập", (c, k) => `${c.flags.has("x04_mien_tru") ? "Giấy triệu tập ghi rõ: tuyên bố miễn trừ ngoại giao không có giá trị trước tòa." : "Giấy triệu tập tới vào một sáng mưa."} Mấy người anh em họ kiện đòi chia ba mươi mét vuông làm bốn, mỗi phần bảy mét rưỡi, phần nào cũng muốn giữ cột cờ. ${k.gag()}`,
          [C("Ra tòa với tư cách quốc vương", { flags: ["x04_ra_toa"], counters: { x04_kien: 2 }, pressure: { luat: 1 } }, "Báo chí thích, thẩm phán thì không"),
           C("Thuê luật sư thật", { money: -0.3, flags: ["x04_luat_su"] }, "Tốn tiền, có cơ hội thắng")]),
        card("x04_day_vang_khach", "Mùa không có khách", (c, k) => `Trào lưu qua đi nhanh như lúc đến. Cả tháng chỉ có hai người khách, và một người trong đó hỏi đường ra chợ. ${c.flags.has("x04_cong_dan") ? `Công dân số 0002, ${k.npc("khach")}, vẫn ở lại bán nước dưới lá cờ đã phai màu.` : "Lá cờ áo mưa đã phai màu, chỉ còn bạn đứng gác."}`,
          [C("Tổ chức lễ duyệt binh một người mỗi sáng", { flags: ["x04_duyet_binh"], counters: { x04_quoc: 1 }, health: -1 }, "Kéo lại vài khách, mỏi chân mỗi sáng"),
           C("Đóng cửa khẩu, đi làm thuê lại", { flags: ["x04_dong_cua"], money: 0.1 }, "Có lương, vương quốc ngủ đông")]),
      ],
      [
        card("x04_ket", "Quốc vương thoái vị", (c, k) => `${n(c, "x04_kien") >= 3 ? "Tòa đã hẹn ngày tuyên án." : "Một nhà đầu tư du lịch gửi thư hỏi mua cả vương quốc."} ${cap(noOr(c, k, `món nợ ${bac(c)} để lại`, `lời dặn ${bac(c)} để lại`))} cũng được nhắc tới, ngay dưới dòng ghi diện tích. Bạn đứng giữa ba mươi mét vuông, lần cuối với tư cách người đứng đầu một nước. ${k.gag()}`,
          [ending(L04_DU_LICH, "Giữ nước, mở cửa đón khách", "Có nguồn thu lâu dài, cả đời làm vua một mảnh vườn"),
           ending(L04_KIEN, "Kiện đến cùng để giữ trọn lãnh thổ", "Không lùi một mét, có thể mất tất cả"),
           ending(L04_BAN, "Bán cả vương quốc", "Có tiền ngay, hết làm vua")]),
      ],
    ] }),
  "In hộ chiếu, thu thuế khách, và chờ giấy của chính quyền");

/* ================================================================== X05 Cuộc săn của ông */

const L05_KHO_BAU = land("x05_kho_bau", "Phong bì cuối là cuốn sổ tiết kiệm ông gửi từ năm bạn ra đời, ghi tên người giải được câu đố. Đó là bạn.", { money: 3, happy: 3, rel: -4 });
const L05_CHIA = land("x05_chia_deu", "Bạn đọc to phong bì cuối và chia đều cho cả họ. Phần mỗi người không lớn, nhưng năm sau cả họ lại ngồi chung một bàn.", { money: 1, rel: 5, happy: 3 });
const L05_BAI_HOC = land("x05_bai_hoc", "Phong bì cuối chỉ có một dòng: \"Ngần ấy năm cả họ ngồi lại với nhau, thế là đủ.\" Tiền bạn đổ vào cuộc săn mất trắng.", { money: -1, happy: 2, know: 5 });

const X05 = weird("X05", "abs", ["mau", "tien"],
  (c) => c.age >= 18 && c.age <= 50 && c.pressure.mau >= 2 && (!!grandpaOf(c) || c.flags.has("heir")),
  () => "Tham gia cuộc săn kho báu ông để lại",
  (s, c) => ({ title: "Di chúc là câu đố",
    text: `Ông mất, để lại cho cả họ một chồng phong bì dán kín và một câu dặn: "Mỗi năm mở một cái. Ai đi đến cuối thì được hết." Manh mối đầu tiên là ${grandpaOf(c)?.label ?? "một chiếc chìa khóa không vừa ổ nào"}. Mười bảy người cháu cùng nhìn nó, rồi nhìn nhau như nhìn đối thủ.` }),
  season({ id: "w_X05", vn: "Cuộc săn của ông", color: "#b8862f", years: [7, 12], weird: "abs",
    rules: { flags: ["w_x05_cuoc_san"] },
    reset: { cast: [{ key: "anh_ho", role: "rival", label: "ông anh họ" }, { key: "luat_su", role: "mentor", label: "bà luật sư giữ phong bì" }] },
    gag: { key: "dao_roc_giay", lines: [
      "Bà luật sư mở phong bì bằng dao rọc giấy, chậm đến mức có người xin ra ngoài giữa chừng.",
      "Phong bì năm nay dán ba lớp băng keo. Bà luật sư mất mười phút, cả họ nín thở mười phút.",
      "Bà luật sư đọc manh mối, đọc lại, rồi đọc lần thứ ba cho người đến muộn.",
      "Phong bì cuối mỏng như lá lúa. Bà luật sư vẫn mở nó bằng dao rọc giấy, vẫn chậm như thế.",
    ] },
    landings: [L05_KHO_BAU, L05_CHIA, L05_BAI_HOC],
    beats: [
      [
        card("x05_mo_manh_moi", "Nơi ông ngồi lâu nhất", (c, k) => `Phong bì thứ nhất chỉ có một dòng: "Nơi ông ngồi lâu nhất mà không ai thấy." ${k.gag()} Đến tối, đã có ba người cháu vác xẻng ra vườn.`,
          [C("Đào gốc cây to nhất sau nhà", { flags: ["x05_dao_goc"], health: -1, counters: { x05_dua: 1 } }, "Nhanh tay hơn người khác, mỏi lưng hơn"),
           C("Lục chiếc ghế mây của ông", { flags: ["x05_ghe_may"], know: 2 }, "Chậm hơn, nhưng có thể đúng hơn")]),
        card("x05_mo_tham_tu", "Thám tử mặc áo khoác", (c, k) => `${cap(k.npc("anh_ho"))} thuê hẳn một thám tử, thực ra là thầy giáo về hưu ở đầu ngõ, mặc áo khoác dài giữa mùa nóng. Ông anh rủ bạn góp tiền: "Chia đôi kho báu, chia đôi tiền thuê."`,
          [C("Góp tiền, đi chung với anh họ", { money: -0.05, flags: ["x05_di_chung"], counters: { x05_hop: 1 } }, "Có bạn đồng hành, phải chia đôi mọi thứ"),
           C("Từ chối, đi một mình", { flags: ["x05_di_rieng"], counters: { x05_dua: 1 } }, "Giữ trọn phần mình, thêm một đối thủ")]),
      ],
      [
        card("x05_kd_so_no", "Cuốn sổ cho vay của ông", (c, k) => `${c.flags.has("x05_ghe_may") ? "Manh mối thứ hai nằm sẵn trong chiếc ghế mây bạn đã lục" : "Manh mối thứ hai dẫn tới chiếc ghế mây của ông"}: một cuốn sổ ghi tên những người từng vay ông mà chưa trả. Nửa họ có tên trong đó, có người nợ từ hồi làng chưa có điện. ${k.gag()}`,
          [C("Đọc to cuốn sổ trước cả họ", { flags: ["x05_doc_so"], counters: { x05_dua: 1 }, pressure: { mau: 2 } }, "Sự thật ra ánh sáng, bữa cơm họ thành phiên tòa"),
           C("Cất sổ, giữ cho riêng mình", { flags: ["x05_giu_so"], know: 2, counters: { x05_dua: 1 } }, "Nắm thóp nửa họ, ngủ không yên"),
           C("Đốt cuốn sổ trong bếp", { flags: ["x05_dot_so"], counters: { x05_hop: 2 } }, "Xóa nợ cho cả họ, mất một manh mối")]),
        card("x05_kd_ao_doi", "Ba đội áo màu", (c, k) => `Tới phong bì thứ tư, cả họ chia làm ba đội, in áo ba màu, lập nhóm nhắn tin riêng và cài người sang đội khác. ${cap(k.npc("luat_su"))} nhắc rằng di chúc cấm phá hoại, nhưng không cấm in áo.`,
          [C("Lập đội riêng, áo màu cam", { flags: ["x05_doi_rieng"], counters: { x05_dua: 2 } }, "Tự quyết mọi thứ, cả họ coi bạn là đối thủ"),
           C("Đề nghị gộp ba đội làm một", { flags: ["x05_gop_doi"], counters: { x05_hop: 2 }, rel: 2 }, "Ít người tranh, kho báu chia nhỏ")]),
      ],
      [
        card("x05_cl_chia_khoa", "Thứ cháu đã mang theo", (c, k) => `Phong bì thứ sáu viết: "Thứ cần tìm, một đứa cháu đã mang theo từ lâu." Cả họ lục túi nhau. ${doTxt(k.scar("do"), "Bạn chợt hiểu ", "chính là lời giải ông muốn nói tới,", "Bạn chợt hiểu thứ ông muốn nói là thói quen ông dạy bạn hồi nhỏ,")} còn ${k.scar("nguoi") || "một người họ hàng xa"} là người duy nhất biết điều đó, và đang nhìn bạn.`,
          [C("Nói cho cả họ cùng biết", { flags: ["x05_cong_khai"], counters: { x05_hop: 2 } }, "Mọi người tin bạn, cuộc đua chậm lại"),
           C("Giấu đi, tự giải một mình", { flags: ["x05_giau_manh"], counters: { x05_dua: 2 }, pressure: { mau: 1 } }, "Đi trước một bước, mang tiếng giấu bài")]),
      ],
      [
        card("x05_day_vuon", "Mảnh vườn bị bán", (c, k) => `${cap(k.npc("anh_ho"))} bán mảnh vườn của ông để lấy tiền săn tiếp, và người mua san phẳng nó trong một buổi sáng. Manh mối thứ bảy, nếu có, giờ đã nằm dưới móng nhà mới. ${k.gag()}`,
          [C("Đưa anh họ ra trước hội đồng họ", { flags: ["x05_kien_anh"], counters: { x05_dua: 1 }, pressure: { mau: 2 } }, "Đòi được lẽ phải, mất luôn người anh"),
           C("Xin chủ mới cho đào một góc", { money: -0.1, flags: ["x05_xin_dao"], counters: { x05_hop: 1 } }, "Tốn tiền, có thể tìm lại manh mối")]),
        card("x05_day_bua_com", "Bữa cơm không ai nói", (c, k) => `Ngày tưởng nhớ ông năm ấy, bữa cơm chỉ còn bảy người, và không ai nói chuyện gì ngoài manh mối. Một đứa cháu nhỏ hỏi: "Ông để lại kho báu, hay để lại cái họ này?" Không ai trả lời${c.flags.has("x05_giau_manh") ? ", và vài người liếc sang bạn." : "."}`,
          [C("Mời cả họ một bữa, cấm nhắc kho báu", { money: -0.05, flags: ["x05_bua_com"], counters: { x05_hop: 2 } }, "Tốn một bữa, kéo lại được vài người"),
           C("Tranh thủ đêm đó đọc lại mọi phong bì", { flags: ["x05_doc_lai"], know: 2, counters: { x05_dua: 1 } }, "Gần lời giải hơn, xa mọi người hơn")]),
      ],
      [
        card("x05_ket", "Phong bì cuối cùng", (c, k) => `${cap(k.npc("luat_su"))} giơ phong bì cuối lên trước ${n(c, "x05_hop") > n(c, "x05_dua") ? "cả họ ngồi chung một bàn" : "những người còn chịu đến"}. ${cap(k.scar("no") || "món nợ cũ của ông")} được ghi ngay ngoài bìa, phải trả trước khi bóc. ${k.gag()}`,
          [ending(L05_KHO_BAU, "Nhận hết phần thưởng về mình", "Giàu lên, cả họ nhìn bạn khác đi"),
           ending(L05_CHIA, "Chia đều cho cả họ", "Ít tiền hơn, giữ được cái họ"),
           ending(L05_BAI_HOC, "Bóc phong bì ngay trước mặt mọi người", "Chưa ai biết bên trong là gì")]),
      ],
    ] }),
  "Mỗi năm một manh mối, cả họ đua nhau, không ai chịu về");

/* ================================================================== X06 Cha đẻ khẩu hiệu */

const L06_QC = land("x06_quang_cao", "Một công ty quảng cáo tuyển bạn vào làm người nghĩ chữ. Họ không cần câu thứ hai, họ cần người dám nói câu thứ nhất.", { custom: "become:ad_creative", happy: 3 });
const L06_MC = land("x06_mc", "Bạn nhận dẫn một chương trình truyền hình buổi tối, mở màn bằng câu khẩu hiệu cũ, khán giả hô theo.", { custom: "become:tv_host", happy: 3 });
const L06_SACH = land("x06_sach", "Bạn in một cuốn sách mỏng mang đúng tên câu khẩu hiệu, bán chạy mùa tốt nghiệp, đủ tiêu hơn một năm.", { money: 1.5, happy: 2 });
const L06_IM = land("x06_im", "Bạn từ chối mọi lời mời, về làm một công việc bình thường với đồng lương thấp hơn, và chỉ nói đùa ở những bàn quen.", { income_mult: 0.8, happy: 4 });

const X06 = weird("X06", "abs", ["danh"],
  (c) => c.age >= 18 && c.age <= 68 && c.pressure.danh >= 3 && (has(c, "temper_bold", "temper2_bold", "life_comedian", "talent_comedian") || n(c, "drink") >= 3),
  () => "Nhận mình là tác giả câu khẩu hiệu",
  (s) => ({ title: "Câu đùa thành khẩu hiệu",
    text: `Ở một bàn nhậu tại ${s.noi || "quán quen"}, bạn buột miệng một câu cho cả bàn cười: "Nghèo thì nghèo, đừng nghèo ý tưởng." Ba tuần sau, câu đó in trên băng rôn khắp nước, góc dưới ghi tên bạn. Sáng nay điện thoại reo lần thứ bốn mươi: người ta mời bạn lên sân khấu nói về "tầm nhìn".` }),
  season({ id: "w_X06", vn: "Cha đẻ khẩu hiệu", color: "#f0a91c", years: [5, 9], weird: "abs",
    rules: { flags: ["w_x06_khau_hieu"] },
    reset: { cast: [{ key: "quan_ly", role: "first_boss", label: "cô quản lý lịch diễn thuyết" }, { key: "tac_gia_gia", role: "rival", label: "ông tự xưng là tác giả thật" }] },
    gag: { key: "khau_hieu_sai", lines: [
      `Băng rôn ở cổng trường viết sai một chữ: "Nghèo thì nghèo, đừng nghèo ý tướng."`,
      `Ở hội chợ, khẩu hiệu thành "Giàu thì giàu, đừng giàu ý tưởng", và không ai thấy lạ.`,
      `Có người xăm khẩu hiệu lên cánh tay, nhưng xăm thiếu mất chữ "đừng".`,
      "Khẩu hiệu được dịch ra ba thứ tiếng rồi dịch ngược lại, thành một câu khuyên nấu canh.",
    ] },
    landings: [L06_QC, L06_MC, L06_SACH, L06_IM],
    beats: [
      [
        card("x06_mo_san_khau", "Bốn trăm cái ghế", (c, k) => `Bốn trăm sinh viên ngồi chờ bạn nói về "tư duy đột phá", còn bạn chỉ có đúng một câu, nói lúc đã ngà ngà. Đèn sân khấu nóng như bếp than. ${k.gag()}`,
          [C("Kể thật: câu đó nói lúc say", { flags: ["x06_noi_that"], counters: { x06_uy_tin: 1 }, happy: 2 }, "Cả hội trường cười, ban tổ chức thì không"),
           C("Bịa một câu chuyện truyền cảm hứng", { flags: ["x06_bia"], counters: { x06_lan: 1 }, pressure: { danh: 1 } }, "Được vỗ tay, từ nay phải nhớ mình đã bịa gì")]),
        card("x06_mo_ban_quyen", "Ai sở hữu một câu nói", () => "Một hãng sơn tường muốn mua câu khẩu hiệu để in lên mọi thùng sơn, trả bằng nửa năm thu nhập. Luật sư của họ hỏi bạn lấy gì chứng minh câu đó là của bạn. Bạn chỉ có trí nhớ và một tờ hóa đơn quán nhậu.",
          [C("Bán quyền câu nói", { money: 0.5, flags: ["x06_ban_quyen"], counters: { x06_lan: 1 } }, "Có tiền, câu nói từ nay thuộc về thùng sơn"),
           C("Để câu nói cho mọi người dùng", { flags: ["x06_tu_do"], counters: { x06_uy_tin: 1 }, happy: 2 }, "Nghèo hơn một chút, nhẹ lòng hơn nhiều")]),
      ],
      [
        card("x06_kd_lich", "Ba buổi một ngày", (c, k) => `${cap(k.npc("quan_ly"))} xếp cho bạn ba buổi phát biểu mỗi ngày, ở ba tỉnh khác nhau, với ba bộ áo khác nhau. Bữa cơm nhà gần nhất bạn ăn là từ tháng trước. ${k.gag()}`,
          [C("Nhận hết, tranh thủ lúc còn nóng", { money: 0.3, health: -3, flags: ["x06_chay_show"], counters: { x06_lan: 1 } }, "Kiếm đậm, người mòn đi"),
           C("Cắt một nửa lịch, giữ cuối tuần", { flags: ["x06_cat_lich"], rel: 3 }, "Ít tiền hơn, gặp lại người nhà")]),
        card("x06_kd_khan_giay", "Tờ khăn giấy năm ấy", (c, k) => `${cap(k.npc("tac_gia_gia"))} lên truyền hình, giơ một tờ khăn giấy có chữ viết tay: câu khẩu hiệu, ký tên ông, ghi ngày trước bạn hai hôm. Khán giả gọi điện vào chương trình chia làm hai phe.`,
          [C("Thách ông ta tranh luận trực tiếp", { flags: ["x06_thach_dau"], counters: { x06_uy_tin: 1 }, pressure: { danh: 2 } }, "Cược cả tên tuổi vào một buổi lên hình"),
           C("Nhường câu nói cho ông ta", { flags: ["x06_nhuong"], happy: 2, counters: { x06_uy_tin: -1 } }, "Hết bị mời, hết được trả tiền")]),
      ],
      [
        card("x06_cl_nhan_chung", "Người tỉnh nhất bàn nhậu", (c, k) => `Đêm ấy bên bàn nhậu chỉ có một người còn tỉnh: ${k.scar("nguoi") || "một người bạn cũ"}. Người đó gọi cho bạn sau nhiều năm: "Câu đó tôi nói với bạn từ hồi mười bảy tuổi. Bạn chỉ nói lại thôi." Bạn nhớ ra thật, và thấy mặt mình nóng hơn đèn sân khấu.`,
          [C("Công khai người nói câu đó đầu tiên", { flags: ["x06_tra_cong"], counters: { x06_uy_tin: 2 }, rel: 3 }, "Mất danh tác giả, được lại một người bạn"),
           C("Chia tiền cho người đó, giữ im lặng", { money: -0.2, flags: ["x06_chia_im"], counters: { x06_lan: 1 }, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.3, fuse_years: [3, 8], note: "câu khẩu hiệu không phải của bạn" } }, "Giữ được danh, thêm một bí mật phải giữ")]),
      ],
      [
        card("x06_day_to_roi", "Khẩu hiệu trên tờ rơi lạ", (c, k) => `Câu khẩu hiệu xuất hiện trên tờ rơi của một đường dây cho vay mờ ám, kèm ảnh bạn đang cười. Mười hai người gọi tới trách bạn đã dẫn họ vào chỗ đó. ${k.gag()}`,
          [C("Lên tiếng phản đối công khai", { flags: ["x06_phan_doi"], counters: { x06_uy_tin: 1 }, pressure: { luat: 1 } }, "Rửa được tên, mất vài hợp đồng"),
           C("Im lặng cho qua", { flags: ["x06_im_lang"], counters: { x06_lan: 1 }, happy: -3 }, "Đỡ phiền, tên bạn dính vào chuyện xấu")]),
        card("x06_day_giay_trang", "Ba giờ sáng không ra chữ", (c) => `Người ta đặt bạn viết khẩu hiệu thứ hai, hạn chót sáng mai. Ba giờ sáng, tờ giấy vẫn trắng, ${c.flags.has("x06_bia") ? "và câu chuyện truyền cảm hứng bạn bịa năm nào quay lại như một chủ nợ." : "và bạn thèm một bàn nhậu hơn bao giờ hết."}`,
          [C("Ra quán nhậu tìm cảm hứng", { flags: ["x06_ra_quan"], health: -2, counters: { drink: 1 } }, "Có thể ra câu mới, có thể chỉ ra hóa đơn"),
           C("Gọi điện nói thật là đã hết ý", { flags: ["x06_het_y"], counters: { x06_uy_tin: 1 }, happy: 1 }, "Mất hợp đồng, nhẹ cả người")]),
      ],
      [
        card("x06_ket", "Câu thứ hai", (c, k) => `${n(c, "x06_uy_tin") >= 3 ? "Người ta vẫn tin bạn, dù biết bạn chỉ có một câu." : "Người ta bắt đầu hỏi bạn còn câu nào khác không."} ${cap(k.scar("no") || "lời hứa viết câu thứ hai")} vẫn treo đó như một tấm băng rôn chưa căng. Trên bàn có ba lá thư mời. ${k.gag()}`,
          (c) => {
            const im = ending(L06_IM, "Từ chối hết, về sống bình thường", "Thu nhập giảm, được làm người bình thường");
            if (pathOpen("ad_creative", c.age) && pathOpen("tv_host", c.age)) return [ending(L06_QC, "Vào làm cho công ty quảng cáo", "Sống bằng chữ, phải nghĩ câu mới mỗi tuần"), ending(L06_MC, "Nhận dẫn chương trình truyền hình", "Lên hình mỗi tối, câu đùa thành nghề"), im];
            if (pathOpen("ad_creative", c.age)) return [ending(L06_QC, "Vào làm cho công ty quảng cáo", "Sống bằng chữ, phải nghĩ câu mới mỗi tuần"), ending(L06_SACH, "In một cuốn sách mỏng", "Kiếm một khoản rồi thôi"), im];
            return [ending(L06_SACH, "In một cuốn sách mỏng", "Kiếm một khoản rồi thôi"), im];
          }),
      ],
    ] }),
  "Bị mời phát biểu khắp nơi, mà bạn chỉ có đúng một câu");

/* ================================================================== X07 Gương mặt trên bao bì */

const L07_GIA_HAN = land("x07_gia_han", "Bạn ký gia hạn thêm một kỳ nữa. Tiền về đều như mì lên kệ, còn bữa cơm nhà thì thưa dần, rồi thôi hẳn.", { money: 3, rel: -10, happy: -3, flags: ["x07_gia_han"] });
const L07_MUA_LAI = land("x07_mua_lai", "Bạn bỏ tiền mua lại khuôn mặt của mình, rồi cắt phăng mái tóc ngay ở bãi gửi xe.", { money: -1, rel: 6, happy: 6 });
const L07_DIEN_VIEN = land("x07_dien_vien", "Một đạo diễn thấy bạn trên bao bì, mời đóng vai một người bán mì. Bạn đóng thật, không cần trang điểm.", { custom: "become:actor", happy: 3 });

const X07 = weird("X07", "abs", ["danh", "tinh"],
  (c) => c.age >= 18 && c.age <= 60 && (has(c, "life_actor", "talent_actor", "life_influencer", "talent_influencer", "life_singer", "talent_singer", "life_dancer") || c.pressure.danh >= 4),
  () => "Bán bản quyền khuôn mặt cho một hãng mì",
  () => ({ title: "Khuôn mặt có hợp đồng",
    text: `Một hãng mì gói muốn mua bản quyền khuôn mặt bạn dài hạn, trả trước một khoản gần bằng một năm thu nhập. Điều khoản số bảy dài đúng một dòng: "Bên B không được thay đổi kiểu tóc." Người đại diện đẩy cây bút sang và mỉm cười. Trên gói mì mẫu đặt giữa bàn, bạn cũng đang mỉm cười y hệt.` }),
  season({ id: "w_X07", vn: "Gương mặt trên bao bì", color: "#e39a4f", years: [8, 12], weird: "abs",
    rules: { flags: ["w_x07_bao_bi"], income: 1.2 },
    reset: { cast: [{ key: "dai_dien", role: "first_boss", label: "chị đại diện của hãng mì" }, { key: "dong_the", role: "rival", label: "người đóng thế giống bạn" }] },
    gag: { key: "kieu_toc", lines: [
      "Tóc bạn dài thêm hai phân. Hãng gửi thợ tới cắt lại cho đúng bao bì, tận nhà, lúc sáu giờ sáng.",
      "Bạn đội mũ đi đám cưới bạn thân. Hôm sau hãng gửi thư nhắc: mũ cũng tính là kiểu tóc.",
      "Gió thổi tóc bạn lệch sang trái. Có người chụp ảnh gửi ngay cho hãng.",
      "Người thợ cắt tóc của hãng giờ thuộc cái đầu của bạn hơn cả bạn.",
    ] },
    landings: [L07_GIA_HAN, L07_MUA_LAI, L07_DIEN_VIEN],
    beats: [
      [
        card("x07_mo_ky", "Trang mười bốn", (c, k) => `Bản hợp đồng dày ba mươi trang, chữ ký của bạn nằm ở trang mười bốn, ngay dưới hình vẽ mái tóc được đo bằng thước. ${cap(k.npc("dai_dien"))} nói: "Từ hôm nay, mặt bạn là tài sản. Giữ gìn giúp chúng tôi." ${k.gag()}`,
          [C("Ký ngay, nhận tiền trước", { money: 0.8, flags: ["x07_ky_ngay"], counters: { x07_xa: 1 } }, "Tiền về ngay, chưa kịp đọc trang mười lăm"),
           C("Đòi một tháng nghỉ phép cho khuôn mặt", { money: 0.5, flags: ["x07_nghi_phep"] }, "Ít tiền hơn, mỗi năm có một tháng được là mình")]),
        card("x07_mo_ke_hang", "Mười nghìn gói mì", () => "Khuôn mặt bạn có mặt trên mười nghìn gói mì ở mọi kệ hàng. Một đứa trẻ hàng xóm vẽ thêm râu lên một gói rồi chụp ảnh, và tấm ảnh ấy được chia sẻ nhiều hơn mọi quảng cáo của hãng. Hãng gọi hỏi có phải bạn đứng sau không.",
          [C("Nhận là ý mình, xin lỗi hãng", { flags: ["x07_nhan_loi"], money: -0.1 }, "Giữ đứa trẻ khỏi rắc rối, bị trừ tiền"),
           C("Đề nghị hãng in luôn bản có râu", { flags: ["x07_ban_rau"], counters: { x07_tu_do: 1 }, pressure: { danh: 1 } }, "Có thể thành trào lưu, có thể bị phạt")]),
      ],
      [
        card("x07_kd_nguoi_than", "Cái mặt ở siêu thị", (c, k) => `Người thân nhất của bạn nói một câu nửa đùa nửa thật: "Ở nhà thì mặt bạn mệt, ra siêu thị thì mặt bạn cười. Tôi quen cái mặt ở siêu thị hơn." Tối đó hãng mời bạn đi buổi ra mắt vị mì mới. ${k.gag()}`,
          [C("Ở nhà, tắt điện thoại một tối", { flags: ["x07_o_nha"], rel: 3, money: -0.05 }, "Giữ được một tối bình thường, bị trừ tiền vắng mặt"),
           C("Đi sự kiện, hứa mai sẽ bù", { money: 0.1, rel: -3, counters: { x07_xa: 1 }, flags: ["x07_di_su_kien"] }, "Tiền thêm, lời hứa cũng thêm")]),
        card("x07_kd_dong_the", "Người giống bạn hơn bạn", (c, k) => `Hãng thuê ${k.npc("dong_the")} đi thay bạn ở những sự kiện nhỏ. Sáu tháng sau, người đó giống khuôn mặt trên bao bì hơn chính bạn, vì người đó không bao giờ mệt. Có khách xin chữ ký người đó, rồi quay sang hỏi bạn là ai.`,
          [C("Kết thân với người đóng thế", { flags: ["x07_ban_dong_the"], happy: 2 }, "Có một người hiểu mình, mất một phần mặt mình"),
           C("Đòi hãng thôi dùng người đóng thế", { flags: ["x07_doi_cham_dut"], counters: { x07_xa: 1 }, health: -2 }, "Giữ mặt cho riêng mình, phải tự đi mọi sự kiện")]),
      ],
      [
        card("x07_cl_xin_loi", "Khuôn mặt xin lỗi", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} gọi lúc nửa đêm: người đó vừa thấy mặt bạn trên tấm biển xin lỗi khách hàng vì một lô mì bị lỗi. Hãng dùng mặt bạn để xin lỗi mà không hỏi bạn một câu${c.flags.has("x07_ban_rau") ? ", lần này còn vẽ thêm râu cho giống trào lưu" : ""}. ${k.scar("do") ? doTxt(k.scar("do"), "Người đó còn nhắc tới ", "và hỏi bạn có còn nhớ mình là ai trước khi lên bao bì.", "") : "Người đó hỏi bạn còn nhớ mặt thật của mình không."}`,
          [C("Kiện hãng vì dùng mặt sai mục đích", { flags: ["x07_kien_hang"], counters: { x07_tu_do: 2 }, pressure: { luat: 1 } }, "Có thể đòi lại mặt, có thể mất hết tiền"),
           C("Im lặng, ký phụ lục xin lỗi", { money: 0.3, flags: ["x07_ky_phu_luc"], counters: { x07_xa: 1 } }, "Có thêm tiền, mặt bạn xin lỗi thay người khác")]),
      ],
      [
        card("x07_day_toc_bac", "Sợi tóc bạc đầu tiên", (c, k) => `Sợi tóc bạc đầu tiên mọc ngay giữa mái, chỗ dễ thấy nhất trên bao bì. ${cap(k.npc("dai_dien"))} gửi tới một hộp thuốc nhuộm và một trang hợp đồng có gạch chân. ${k.gag()}`,
          [C("Để tóc bạc, chịu phạt", { money: -0.4, flags: ["x07_toc_bac"], counters: { x07_tu_do: 1 }, happy: 3 }, "Mất tiền phạt, được làm người đúng tuổi"),
           C("Nhuộm theo hợp đồng", { flags: ["x07_nhuom"], counters: { x07_xa: 1 }, happy: -3 }, "Giữ được tiền, gương mặt thành đồ dùng")]),
        card("x07_day_bua_com", "Bữa cơm thiếu một người", (c) => `${n(c, "x07_xa") >= 3 ? "Bữa cơm cuối tuần giờ chỉ còn bạn với một gói mì in mặt mình." : "Bữa cơm cuối tuần vắng dần, nhưng vẫn còn người chờ."} Người nhà nói không trách gì bạn, chỉ là họ đã quen ăn trước.`,
          [C("Bảo hãng tạm dừng hợp đồng một năm", { money: -0.3, flags: ["x07_nghi_nam"], rel: 5 }, "Mất tiền, kéo lại được một bữa cơm"),
           C("Gửi thêm tiền về thay cho mình", { money: -0.1, flags: ["x07_gui_tien"], counters: { x07_xa: 1 } }, "Người nhà đủ ăn, bàn ăn vẫn trống")]),
      ],
      [
        card("x07_ket", "Hết hạn hợp đồng", (c, k) => `Hợp đồng sắp hết hạn, và ${k.npc("dai_dien")} đặt lên bàn bản gia hạn với con số lớn hơn hẳn lần đầu. ${cap(k.scar("no") || "lời hứa với người nhà")} vẫn chưa trả được. ${c.flags.has("x07_toc_bac") ? "Trong gương, sợi tóc bạc vẫn còn đó, thứ duy nhất trên đầu bạn không thuộc về hãng." : "Trong gương, mái tóc vẫn y như ngày ký."} ${k.gag()}`,
          (c) => {
            const out = [ending(L07_GIA_HAN, "Ký gia hạn thêm một kỳ", "Giàu thêm, bàn ăn trống thêm"),
              ending(L07_MUA_LAI, "Mua lại khuôn mặt của mình", "Mất một khoản, được lại cái đầu và người nhà")];
            if (pathOpen("actor", c.age)) out.push(ending(L07_DIEN_VIEN, "Nhận lời đóng phim", "Dùng khuôn mặt cho việc của mình"));
            return out;
          }),
      ],
    ] }),
  "Tiền về đều, nhưng suốt hợp đồng không được đổi kiểu tóc");

/* ================================================================== X08 Cụ tổ 30 tuổi */

const L08_CAN_BO = land("x08_can_bo", "Xã mời bạn làm cán bộ hòa giải, có lương, có con dấu. Người ta vẫn gọi bạn là cụ.", { custom: "become:official", happy: 2 });
const L08_TRUONG_LANG = land("x08_truong_lang", "Bạn ở lại làm người phân xử của làng. Làng giao cho bạn mảnh ruộng công và chiếc ghế gỗ, lần này đã cưa bớt chân.", { income_mult: 1.2, happy: 3, flags: ["x08_cu_to"] });
const L08_BO_LANG = land("x08_bo_lang", "Bạn xếp đồ đi trong đêm, lên thành phố, nơi không ai biết bạn là cụ của ai.", { custom: "move_city", happy: 2, rel: -4 });

const X08 = weird("X08", "abs", ["mau", "dat"],
  (c) => c.age >= 22 && c.age <= 40 && rural(c) && c.pressure.mau >= 2,
  () => "Nhận làm cụ tổ của cả làng",
  (s) => ({ title: "Cụ tổ về làng",
    text: `Sau một trận sốt, bạn nói mê một câu bằng giọng rất cổ, và bà cụ cao tuổi nhất ${s.noi || "làng"} quỳ ngay xuống đầu giường: "Cụ về rồi." Đến trưa đã có ba mươi người xếp hàng ngoài sân, mỗi người cầm theo một vụ tranh chấp chờ cụ phân xử. Có người còn ôm theo một con gà làm lễ ra mắt.` }),
  season({ id: "w_X08", vn: "Cụ tổ 30 tuổi", color: "#c7942a", years: [6, 10], weird: "abs",
    rules: { flags: ["w_x08_cu_to"] },
    reset: { cast: [{ key: "ba_cu", role: "neighbor", label: "bà cụ cao tuổi nhất làng" }, { key: "truong_chi", role: "rival", label: "ông trưởng chi thứ" }] },
    gag: { key: "ghe_go", lines: [
      "Người ta khiêng ra một chiếc ghế gỗ cao quá đầu gối. Bạn ngồi lên, chân không chạm đất.",
      `Trẻ con trong làng gọi bạn là "cụ" rồi xin tiền mua kem, đúng giọng nói với người già.`,
      "Bạn đi chợ, cả dãy hàng cá đứng dậy chào. Một con cá cũng nhảy lên, chắc là tình cờ.",
      "Chiếc ghế gỗ được nâng thêm một tấc cho xứng tầm. Bây giờ bạn phải trèo.",
    ] },
    landings: [L08_CAN_BO, L08_TRUONG_LANG, L08_BO_LANG],
    beats: [
      [
        card("x08_mo_cay_xoai", "Cây xoài trên bờ ranh", (c, k) => `Vụ đầu tiên: hai anh em ruột cãi nhau ba mươi năm về một cây xoài mọc đúng trên bờ ranh, quả rụng bên nào thì bên đó nhặt. Cả làng đứng xem, chờ cụ phán. ${k.gag()}`,
          [C("Phán chia cây xoài theo năm", { flags: ["x08_chia_nam"], counters: { x08_uy: 1 } }, "Công bằng, ai cũng hơi tiếc"),
           C("Phán hai anh em cùng hái, cùng ăn", { flags: ["x08_an_chung"], counters: { x08_uy: 1 }, rel: 2 }, "Đẹp lòng, chưa chắc làm được"),
           C("Bảo họ tự hòa giải", { flags: ["x08_tu_hoa"], counters: { x08_uy: -1 } }, "Không dính vào, cả làng bảo cụ yếu")]),
        card("x08_mo_le_vat", "Gà, gạo và một cái quạt máy", (c, k) => `${cap(k.npc("ba_cu"))} tự nhận việc giữ lịch hầu cụ, và sân nhà bạn đầy lễ vật: gà, gạo, một cái quạt máy còn nguyên hộp. Bà dặn: "Cụ phải nhận, không nhận là cụ giận."`,
          [C("Nhận rồi chia lại cho nhà nghèo", { flags: ["x08_chia_le"], counters: { x08_uy: 1 }, happy: 2 }, "Được tiếng, mất một cái quạt"),
           C("Từ chối mọi lễ vật", { flags: ["x08_tu_choi_le"], counters: { x08_uy: -1 } }, "Sạch sẽ, bà cụ dỗi cả tuần"),
           C("Giữ lại cái quạt máy", { flags: ["x08_giu_quat"], money: 0.05, happy: 1 }, "Mát nhà, có người bắt đầu xì xào")]),
      ],
      [
        card("x08_kd_vo_chong", "Ly hôn trước sân", (c, k) => `Một cặp vợ chồng dắt nhau tới xin cụ cho ly hôn, kèm danh sách mười bảy cái lỗi viết kín hai mặt giấy. ${c.married ? "Người bạn đời của bạn đứng sau bếp, nhìn như muốn nói: cụ thì biết gì." : c.widowed ? "Bạn từng một lần đeo tang người mình cưới, và cả làng đều biết." : "Bạn chưa từng có vợ có chồng, và cả làng đều biết."} ${k.gag()}`,
          [C("Phán cho họ về sống thử một tháng", { flags: ["x08_song_thu"], counters: { x08_uy: 1 } }, "Kéo dài thời gian, có khi cứu được"),
           C("Phán cho ly hôn, chia đều", { flags: ["x08_cho_ly_hon"], counters: { x08_uy: 1 }, pressure: { mau: 1 } }, "Dứt khoát, cả hai họ giận bạn")]),
        card("x08_kd_thu_cu", "Ông trưởng chi thử cụ", (c, k) => `${cap(k.npc("truong_chi"))} không tin. Trước mặt cả làng, ông hỏi cụ còn nhớ năm xưa chôn chum bạc ở đâu không, chuyện chỉ cụ tổ thật mới biết.`,
          [C("Chỉ đại một gốc tre", { gamble: { p: 0.4, win: { counters: { x08_uy: 3 }, flags: ["x08_trung_chum"] }, lose: { counters: { x08_uy: -2 }, flags: ["x08_trat_chum"] } } }, "Trúng thì thành huyền thoại, trật thì thành trò cười"),
           C("Nói thật: cụ không nhớ gì", { flags: ["x08_khong_nho"], counters: { x08_uy: -1 }, happy: 1 }, "Thật thà, ông trưởng chi được thể")]),
      ],
      [
        card("x08_cl_cau_ru", "Câu ru năm xưa", (c, k) => `Bạn chợt nhớ ra câu nói mê bằng giọng cổ kia là câu ${k.scar("nguoi") || "một người già trong xóm"} vẫn đọc dỗ bạn ngủ hồi nhỏ. Không có cụ tổ nào cả, chỉ có một câu ru. Đúng lúc đó, ${k.npc("truong_chi")} quay ngoắt sang tin: ${doTxt(k.scar("do"), "ông đem ", "ra làm bằng chứng cụ đã chọn bạn từ lâu.", "ông bảo chính vì bạn không nhớ gì nên mới là cụ thật.")}`,
          [C("Công khai: không có cụ tổ nào cả", { flags: ["x08_cong_khai"], counters: { x08_uy: -2 }, happy: 3 }, "Nhẹ người, cả làng hụt hẫng"),
           C("Giữ bí mật, tiếp tục làm cụ", { flags: ["x08_giu_bi_mat"], counters: { x08_uy: 1 }, pressure: { mau: 1 } }, "Làng yên, bạn sống trong một vai diễn")]),
      ],
      [
        card("x08_day_canh_dong", "Vụ cánh đồng", (c, k) => `Một công ty muốn mua cả cánh đồng của làng để làm khu nghỉ dưỡng. Nửa làng muốn bán, nửa làng muốn giữ, và cả hai nửa đều chờ cụ phán. ${c.flags.has("x08_cong_khai") ? "Dù bạn đã nói không có cụ tổ nào, không ai chịu nghe, và tối đó người của công ty vẫn để lại một phong bì dày dưới chiếc ghế gỗ." : "Tối đó, người của công ty để lại một phong bì dày dưới chiếc ghế gỗ."} ${k.gag()}`,
          [C("Phán bán đất, nhận phong bì", { money: 0.5, flags: ["x08_nhan_phong_bi"], counters: { x08_uy: -2 }, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [2, 6], note: "phong bì dưới ghế cụ tổ" } }, "Giàu lên, làng mất đồng, bí mật nằm dưới ghế"),
           C("Phán giữ đất, trả phong bì", { flags: ["x08_giu_dat"], counters: { x08_uy: 2 }, pressure: { dat: 1 } }, "Giữ được đồng, thêm một kẻ thù có tiền")]),
        card("x08_day_met", "Cụ cũng biết mệt", () => "Mười giờ đêm vẫn có người gõ cửa nhờ cụ phân xử vụ con lợn nhà bên sang ủi nát luống rau. Bạn chưa được ăn một bữa cơm trọn vẹn từ đầu năm, và đã quên giọng nói thật của mình nghe ra sao.",
          [C("Treo biển: cụ nghỉ chủ nhật", { flags: ["x08_nghi_cn"], happy: 3, counters: { x08_uy: -1 } }, "Có một ngày là mình, uy giảm một chút"),
           C("Tiếp hết, không từ chối ai", { health: -4, flags: ["x08_tiep_het"], counters: { x08_uy: 2 } }, "Làng thương, người kiệt sức")]),
      ],
      [
        card("x08_ket", "Tiệc tri ân cụ tổ", (c, k) => `Làng mở tiệc tri ân cụ tổ, dù cụ ${c.age < 50 ? "chưa tới năm mươi" : "còn kém tuổi nhiều người ngồi dưới"}. ${cap(k.scar("no") || "lời hứa với làng")} được ${k.npc("ba_cu")} đọc to giữa buổi, như một điều cụ còn nợ con cháu. ${n(c, "x08_uy") >= 3 ? "Cả làng chờ cụ nhận ghế mãi mãi." : "Có người bắt đầu đòi cụ rời làng."} ${k.gag()}`,
          (c) => {
            const o = [ending(L08_TRUONG_LANG, "Ở lại làm người phân xử của làng", "Có ruộng, có uy, không bao giờ được là mình"),
              ending(L08_BO_LANG, "Bỏ làng lên thành phố", "Hết làm cụ, mất cả làng")];
            if (pathOpen("official", c.age)) o.unshift(ending(L08_CAN_BO, "Nhận làm cán bộ hòa giải của xã", "Có lương, có dấu, uy của cụ thành chức vụ"));
            return o;
          }),
      ],
    ] }),
  "Phải phân xử mọi chuyện, từ bờ ruộng đến chuyện vợ chồng");

/* ================================================================== X09 Gà tiên tri */

const L09_TRAI_GA = land("x09_trai_ga", "Bạn mở trại gà quy mô, ghi chép sổ sách hẳn hoi. Không con nào đẻ ra số, nhưng con nào cũng đẻ.", { custom: "become:agritech", happy: 2 });
const L09_BAN_GA = land("x09_ban_ga", "Bạn bán con gà cho một nhà sưu tập ở thành phố, giá bằng hai năm thu nhập. Đêm đầu không có tiếng cục tác, bạn không ngủ được.", { money: 2, happy: -2 });
const L09_GIU_GA = land("x09_giu_ga", "Bạn giữ con gà tới ngày nó mất, và trả lại tiền cho những ai từng mua theo trứng. Trên mộ nó có ba con số, không ai dám mua.", { money: -1, happy: 5, flags: ["x09_giu_ga"] });

const X09 = weird("X09", "abs", ["tien", "dat"],
  (c) => c.age >= 18 && c.age <= 68 && (!!henOf(c) || c.farmer || has(c, "job_farm")),
  () => "Bán vé xem con gà đẻ trứng có số",
  (s, c) => ({ title: "Quả trứng có số",
    text: `Sáng nay ${henOf(c)?.label ?? "con gà mái già bạn nuôi lấy trứng sau nhà"} đẻ một quả trứng có ba con số in mờ trên vỏ, và tối đó ba số ấy trúng giải xổ số ở ${s.noi || "tỉnh nhà"}. Đến trưa hôm sau, hàng rào nhà bạn đổ vì người chen. Một bà cụ chìa nắm thóc qua khe cửa: "Cho gà ăn giùm, tôi đặt trước lượt đẻ sau."` }),
  season({ id: "w_X09", vn: "Gà tiên tri", color: "#e6c13a", years: [5, 9], weird: "abs",
    rules: { flags: ["w_x09_ga_tien_tri"] },
    reset: { cast: [{ key: "ong_buon", role: "rival", label: "ông buôn gà lạ mặt" }, { key: "phong_vien", role: "neighbor", label: "cậu phóng viên báo tỉnh" }] },
    gag: { key: "con_ga", lines: [
      "Con gà đứng trên nóc chuồng nhìn đám đông, như nghệ sĩ nhìn khán giả trước giờ diễn.",
      "Con gà mổ vào tay người định sờ nó, rồi mổ luôn ống kính của người quay phim.",
      "Con gà đẻ thêm một quả trứng trơn, không số. Cả sân thở dài cùng một lúc.",
      "Con gà cục tác đúng ba tiếng. Ba người ngoài cổng lập tức chạy đi mua vé số.",
    ] },
    landings: [L09_TRAI_GA, L09_BAN_GA, L09_GIU_GA],
    beats: [
      [
        card("x09_mo_hang_rao", "Hàng rào đổ", (c, k) => `Hàng rào tre đổ lúc chín giờ sáng, và đến mười giờ sân nhà bạn đã có hai trăm người, một xe bán nước giải khát và một ông thầy bói tự dựng ô. Ai cũng muốn chạm vào con gà một lần. ${k.gag()}`,
          [C("Bán vé vào sân xem gà", { money: 0.1, flags: ["x09_ban_ve"], counters: { x09_tieng: 1 } }, "Có tiền ngay, nhà thành chợ"),
           C("Đóng cổng, giấu gà vào bếp", { flags: ["x09_giau_ga"], happy: -1 }, "Giữ yên nhà, người ta trèo tường")]),
        card("x09_mo_qua_trung", "Quả trứng thứ hai", () => "Ba tuần sau, quả trứng thứ hai có số. Một người đàn ông đi xe hơi tới, đặt lên bàn số tiền bằng nửa năm thu nhập của bạn, để mua quả trứng chưa ai kịp đọc số.",
          [C("Bán quả trứng nguyên vỏ", { money: 0.5, flags: ["x09_ban_trung"], counters: { x09_tieng: 1 } }, "Có tiền, có thể vừa bán đi một giải lớn"),
           C("Đập trứng ra rán ăn sáng", { flags: ["x09_an_trung"], happy: 3 }, "Mất cơ hội, được bữa sáng ngon và yên lòng"),
           C("Đọc số rồi công bố cho cả làng", { flags: ["x09_cong_bo"], counters: { x09_on: 2 } }, "Cả làng có phần, bạn không có gì riêng")]),
      ],
      [
        card("x09_kd_ong_buon", "Gà giống tiên tri", (c, k) => `${cap(k.npc("ong_buon"))} đề nghị mở chuỗi bán "gà giống tiên tri", mỗi con gà con kèm giấy chứng nhận in ảnh gà mẹ. Ông đưa tay định bế con gà lên chụp ảnh mẫu. ${k.gag()}`,
          [C("Ký hợp đồng bán gà giống", { money: 0.3, flags: ["x09_ga_giong"], counters: { x09_tieng: 1 } }, "Có tiền đều, tên bạn gắn với giấy chứng nhận"),
           C("Từ chối, gà nhà không bán giống", { flags: ["x09_tu_choi_giong"], counters: { x09_on: 1 } }, "Giữ chữ tín, mất một khoản")]),
        card("x09_kd_bat_coc", "Chuồng gà trống trơn", (c, k) => `Sáng thứ năm, chuồng gà trống trơn, chỉ còn một chiếc lông và mẩu giấy viết tay đòi tiền chuộc bằng nửa năm thu nhập. ${cap(k.npc("phong_vien"))} tới trước cả công an, máy ảnh đeo sẵn trên cổ.`,
          [C("Trả tiền chuộc", { money: -0.5, flags: ["x09_chuoc"] }, "Gà về sớm, kẻ bắt cóc biết bạn chịu chi"),
           C("Báo công an và lên báo", { flags: ["x09_bao_an"], counters: { x09_tieng: 1 }, pressure: { luat: 1 } }, "Đúng luật, gà về chậm, cả tỉnh biết chuyện"),
           C("Tự đi tìm khắp các chợ gà", { health: -3, flags: ["x09_tu_tim"], counters: { x09_on: 1 } }, "Mỏi chân, có thể tìm thấy, có thể không")]),
      ],
      [
        card("x09_cl_nguoi_ban_ga", "Người bán gà năm xưa", (c, k) => `Mười ngày sau, con gà về, gầy đi và khó tính hơn. Theo sau nó là ${k.scar("nguoi") || "một người quen cũ"}, người từng bán nó cho bạn từ hồi nó còn là gà con, với giá một bữa cơm, giờ đứng ở cổng đòi chia phần: "Gà của tôi đẻ, chỉ là đẻ ở nhà bạn."${k.scar("do") ? ` ${doTxt(k.scar("do"), "Người đó còn nhắc tới ", "và bảo con gà đẻ ra số là nhờ hơi của nó.", "")}` : ""}`,
          [C("Chia cho người đó một phần ba", { flags: ["x09_chia_ba"], money: -0.1, counters: { x09_on: 1 }, rel: 2 }, "Mất ít tiền, thêm một người đứng chung"),
           C("Đuổi về, gà là của mình", { flags: ["x09_duoi"], pressure: { tien: 1 } }, "Giữ trọn phần, thêm một người hiểu rõ nhà bạn")]),
      ],
      [
        card("x09_day_trung_tron", "Một năm trứng trơn", (c, k) => `Cả năm trời, con gà chỉ đẻ trứng trơn. Khách vãn dần, rồi những người từng bán ruộng mua vé số theo trứng quay lại, đứng trước cổng hỏi tiền. ${k.gag()}`,
          [C("Trả lại một phần cho người thua", { money: -0.3, flags: ["x09_tra_nguoi_thua"], counters: { x09_on: 2 } }, "Mất tiền, giữ được làng"),
           C("Treo biển: gà không chịu trách nhiệm", { flags: ["x09_bien_mien_tru"], counters: { x09_tieng: -1 }, pressure: { luat: 1 } }, "Đúng lý, làng bắt đầu ghét bạn")]),
        card("x09_day_kien", "Đơn kiện có tên con gà", (c) => `${c.flags.has("x09_ga_giong") ? "Một người mua gà giống kiện bạn vì gà con chỉ đẻ ra trứng, không đẻ ra số." : "Một ông hàng xóm kiện bạn vì đám đông xem gà giẫm nát ruộng rau nhà ông."} Giấy triệu tập ghi tên bị đơn là bạn, và ghi cả tên con gà.`,
          [C("Thương lượng đền cho xong", { money: -0.3, flags: ["x09_den_bu"] }, "Mất tiền, xong chuyện"),
           C("Ra tòa, mang theo con gà", { flags: ["x09_ra_toa"], counters: { x09_tieng: 2 }, pressure: { luat: 1 } }, "Cả tỉnh theo dõi, thắng thua chưa biết")]),
      ],
      [
        card("x09_ket", "Con gà già", (c, k) => `Con gà đã già, lông thưa, đi chậm, nhưng mỗi sáng vẫn có người đứng ngoài cổng${n(c, "x09_on") >= 3 ? " mang thóc cho nó" : " chờ nó đẻ"}. ${cap(k.scar("no") || "nỗi áy náy với những người thua vé số")} vẫn treo trước cửa nhà bạn. ${k.gag()}`,
          (c) => {
            const o = [ending(L09_BAN_GA, "Bán con gà cho nhà sưu tập", "Có một khoản lớn, sân nhà im lặng"),
              ending(L09_GIU_GA, "Giữ gà, trả tiền cho người thua", "Mất tiền, được ngủ yên và được làng thương")];
            if (pathOpen("agritech", c.age)) o.unshift(ending(L09_TRAI_GA, "Mở trại gà cho đàng hoàng", "Thành nghề thật, hết chuyện tiên tri"));
            return o;
          }),
      ],
    ] }),
  "Khách kéo về, gà thành của báu, và của báu thì bị bắt cóc");

/* ================================================================== X10 Vua món cháy */

const L10_CHU_QUAN = land("x10_chu_quan", "Bạn đăng ký quán có tên, có giấy phép phòng cháy dán ngay cửa. Món cháy thành món chính, và bạn thành chủ quán thật.", { custom: "become:restaurateur", happy: 4 });
const L10_HANG_RONG = land("x10_hang_rong", "Bạn đẩy một xe bếp nhỏ đi khắp phố, đốt chảo ngay giữa vỉa hè. Đi tới đâu khói theo tới đó, khách theo khói.", { custom: "become:street_vendor", happy: 3 });
const L10_BAN = land("x10_ban_cong_thuc", "Bạn bán công thức cho một chuỗi quán ở thành phố, giá bằng hai năm thu nhập. Họ lắp máy tạo lửa, và món không bao giờ ngon như cũ.", { money: 2, happy: -1 });
const L10_TRUYEN = land("x10_truyen_nghe", "Bạn trao chảo cho cậu phụ bếp, nhận một khoản tiền sang quán, và lần đầu sau nhiều năm ăn một bữa cơm chín bằng lửa vừa.", { money: 1, happy: 3 });

const X10 = weird("X10", "abs", ["tien", "danh"],
  (c) => c.age >= 18 && c.age <= 68 && (has(c, "life_restaurateur", "talent_restaurateur", "life_baker", "talent_baker", "life_street_vendor") || (c.flags.has("shop_active") && c.poor_country)),
  () => "Bán món ăn ra đời từ vụ cháy bếp",
  (s) => ({ title: "Món ăn từ đám cháy",
    text: `Chảo dầu bùng lửa cao ngang mái, khách la hét chạy ra đường, và khi khói tan thì trên chảo chỉ còn một miếng thịt đen sì. Ông khách quen nếm thử, im lặng rất lâu, rồi nói: "Từ nay tôi chỉ ăn món này." Hôm sau có bốn mươi người xếp hàng trước bếp của bạn ở ${s.noi || "đầu phố"}, chỉ để gọi đúng món bạn làm hỏng.` }),
  season({ id: "w_X10", vn: "Vua món cháy", color: "#dd7a24", years: [6, 10], weird: "abs",
    rules: { flags: ["w_x10_mon_chay"], income: 1.2 },
    reset: { cast: [{ key: "phu_bep", role: "partner", label: "cậu phụ bếp sợ lửa" }, { key: "can_bo_pccc", role: "official", label: "chị cán bộ phòng cháy" }] },
    gag: { key: "binh_chua_chay", lines: [
      "Cậu phụ bếp đứng cách bếp ba mét, ôm bình chữa cháy như ôm bó hoa cưới.",
      "Chuông báo khói kêu. Khách trong quán vỗ tay, tưởng là món đã chín.",
      "Lần này cậu phụ bếp xịt bình chữa cháy thật, từ khoảng cách ba mét, trúng ngay người bạn.",
      "Chị cán bộ phòng cháy gọi món mang về, rồi đứng đợi ngoài vỉa hè cho chắc.",
    ] },
    landings: [L10_CHU_QUAN, L10_HANG_RONG, L10_BAN, L10_TRUYEN],
    beats: [
      [
        card("x10_mo_cong_thuc", "Công thức không ai dám ghi", (c, k) => `Bạn thử làm lại món ấy cho đúng cách, lửa vừa, chảo sạch, và nó dở tệ. Chỉ khi chảo bốc lửa cao quá đầu thì miếng thịt mới có cái vị khiến người ta im lặng. ${k.gag()}`,
          [C("Cố tình đốt chảo mỗi mẻ", { flags: ["x10_dot"], counters: { x10_lua: 1 }, health: -1 }, "Đúng vị, bếp thành bãi tập chữa cháy"),
           C("Tìm cách nướng than cho gần giống", { flags: ["x10_nuong_than"], know: 2 }, "An toàn hơn, khách quen chê nhạt")]),
        card("x10_mo_xep_hang", "Năm giờ sáng trước cửa quán", () => "Hàng người xếp từ năm giờ sáng, có người mang ghế xếp, có người bế theo con. Một cụ già xin mua cả phần cháy dính đáy chảo, trả gấp đôi giá món chính.",
          [C("Tăng giá gấp ba", { money: 0.3, flags: ["x10_tang_gia"], counters: { x10_tieng: 1 } }, "Giàu nhanh, mang tiếng chặt chém"),
           C("Giữ giá cũ, phát số thứ tự", { flags: ["x10_giu_gia"], counters: { x10_on: 1 }, happy: 2 }, "Ít lời, khách thương")]),
      ],
      [
        card("x10_kd_pccc", "Biên bản phòng cháy", (c, k) => `${cap(k.npc("can_bo_pccc"))} tới vào giờ đông khách nhất, đúng lúc chảo đang bốc lửa. Chị lập biên bản ba trang, rồi đứng lại ngửi mùi khói lâu hơn cần thiết. ${k.gag()}`,
          [C("Lắp hệ thống chữa cháy đầy đủ", { money: -0.3, flags: ["x10_an_toan"] }, "Tốn tiền, ngủ yên"),
           C("Mời chị ấy ăn thử một miếng", { flags: ["x10_moi_an"], counters: { x10_lua: 1 }, pressure: { luat: 1 } }, "Có khi thành khách quen, có khi thành chuyện lớn")]),
        card("x10_kd_quan_nhai", "Món cháy chính gốc", () => `Ba quán mới mở cùng dãy phố, treo biển "Món cháy chính gốc". Một quán cháy thật vào tuần thứ hai, và báo đăng ảnh quán ấy kèm tên món của bạn.`,
          [C("Đăng ký tên món cho riêng mình", { money: -0.1, flags: ["x10_dang_ky_ten"], counters: { x10_tieng: 1 } }, "Giữ được tên, mất thời gian đi lại"),
           C("Dạy miễn phí cách đốt chảo an toàn", { flags: ["x10_day_mien_phi"], counters: { x10_on: 2 } }, "Phố bớt cháy, quán bớt độc quyền")]),
      ],
      [
        card("x10_cl_mui_khoi", "Mùi khói năm xưa", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} ghé quán, nếm một miếng rồi buông thìa xuống, mắt đỏ hoe. Người đó nói đây đúng là vị của đêm căn bếp cũ nhà bạn bị cháy, năm bạn còn nhỏ, cái đêm mà ai cũng tưởng đã quên. ${doTxt(k.scar("do"), "Bạn chợt hiểu vì sao ", "chưa bao giờ rời khỏi mình.", "Bạn chợt hiểu vì sao mình chưa bao giờ sợ lửa.")}`,
          [C("Đặt tên món theo đêm ấy", { flags: ["x10_ten_ky_niem"], counters: { x10_on: 1 }, happy: 3 }, "Món có câu chuyện, chuyện nhà thành chuyện phố"),
           C("Giữ kín, chỉ nấu riêng cho người đó", { flags: ["x10_giu_kin"], rel: 3 }, "Giữ được một điều riêng, mất một câu chuyện bán hàng")]),
      ],
      [
        card("x10_day_chay_that", "Đám cháy thật", (c, k) => `Lần này lửa không dừng ở chảo. ${c.flags.has("x10_an_toan") ? "Hệ thống chữa cháy bạn lắp năm trước dập được ngọn lửa trong bốn phút, quán chỉ đen một mảng tường." : "Lửa leo lên mái, và sáng ra quán chỉ còn bốn bức tường đen với cái chảo nằm nguyên giữa đống tro."} ${k.gag()}`,
          [C("Mở lại ngay trên đống tro", { custom: "borrow:0.5", flags: ["x10_mo_lai"], counters: { x10_tieng: 1 } }, "Khách thích cảnh tro, bạn gánh thêm nợ"),
           C("Đóng cửa một mùa để sửa sang", { money: -0.2, flags: ["x10_dong_mua"], happy: -2 }, "Ít nợ hơn, khách quen tản đi")]),
        card("x10_day_phu_bep", "Lá đơn của cậu phụ bếp", (c, k) => `${cap(k.npc("phu_bep"))} đặt lá đơn xin nghỉ lên quầy, tay vẫn ôm bình chữa cháy. Cậu nói có quán ở thành phố mời về, trả gấp đôi, và ở đó người ta nấu món chín bằng lửa vừa.`,
          [C("Tăng lương, giữ cậu ấy lại", { money: -0.2, flags: ["x10_giu_phu_bep"], counters: { x10_on: 1 } }, "Tốn tiền, có người đỡ lưng"),
           C("Dạy hết bí quyết rồi cho cậu ấy đi", { flags: ["x10_cho_di"], happy: 2 }, "Mất người, món của bạn đi xa hơn")]),
      ],
      [
        card("x10_ket", "Chảo cuối mùa", (c, k) => `${n(c, "x10_tieng") >= 3 ? "Tên món cháy giờ đã nằm trong sách hướng dẫn du lịch của tỉnh." : "Món cháy vẫn bán, khách vẫn quen, phố vẫn khét."} ${cap(noOr(c, k, "món nợ sửa quán", "lời hứa sửa quán cho tử tế"))} vẫn còn trên sổ. Bạn đứng trước bếp, chảo trên tay, chờ lửa bùng lần cuối của mùa. ${k.gag()}`,
          (c) => {
            const ban = ending(L10_BAN, "Bán công thức cho chuỗi quán", "Có một khoản lớn, món ăn thành của người khác");
            const truyen = ending(L10_TRUYEN, "Trao chảo cho cậu phụ bếp", "Nhận một khoản vừa, nghề đi tiếp bằng tay người khác");
            if (pathOpen("restaurateur", c.age)) return [ending(L10_CHU_QUAN, "Đăng ký quán, làm chủ cho ra hồn", "Thành nghề thật, buộc chân với cái bếp"), ban, truyen];
            if (pathOpen("street_vendor", c.age)) return [ending(L10_HANG_RONG, "Đẩy xe bếp đi khắp phố", "Nghề nhỏ, tự do, khói theo mình"), ban, truyen];
            return [ban, truyen];
          }),
      ],
    ] }),
  "Món chỉ ngon khi cháy, và lửa thì không chờ ai");

export const ABS_01: WeirdBranch[] = [X01, X02, X03, X04, X05, X06, X07, X08, X09, X10];
