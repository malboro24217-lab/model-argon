/**
 * Gói QUYỀN LỰC & NHÀ NƯỚC (A): cán bộ nhà nước · chính trị gia · cảnh sát · quân nhân (80 thẻ).
 * Mỗi con đường: 1 năng khiếu · 3 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Bộ đếm riêng để các nhịp sau đọc lại:
 *   cán bộ   cbn_clean (giữ mình) · cbn_ties (quan hệ, phe cánh)
 *   chính trị ctg_trust (lòng tin cử tri) · ctg_debt (nợ người đỡ lưng)
 *   cảnh sát csa_clean (giữ mình) · csa_street (lòng tin của khu phố)
 *   quân nhân qnh_bond (tình đồng đội) · qnh_scar (vết hằn trong đầu)
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross, life } from "./kit.ts";

const OF = "official";
const PO = "politician";
const CO = "police";
const SO = "soldier";
/** Đọc bộ đếm riêng của con đường (0 nếu chưa có). */
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Xác suất cho gamble, luôn trong (0,1). */
const pr = (x: number): number => Math.max(0.1, Math.min(0.9, x));
/** Nhịp truyện của các con đường này chỉ diễn ra khi đã trưởng thành. */
const adult = (c: FactContext): boolean => c.age >= 18;

export const PACK_STATE_A: Storylet[] = [
  /* ======================================================================
   * CÁN BỘ NHÀ NƯỚC (official) — tiền tố cbn_
   * ==================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(OF, "cbn_t_ledger", [10, 15], () => true, () => T("Cuốn sổ quỹ lớp", "Cô chủ nhiệm giao bạn giữ quỹ lớp. Mỗi thứ Hai bạn thu từng khoản nhỏ, ghi vào cuốn sổ kẻ ô, cuối tháng đọc to trước lớp. Hết học kỳ, sổ khớp đến từng đồng lẻ, còn lớp bên cạnh thì mất cả quỹ.", [
    C("Nhận làm lớp trưởng, giữ sổ cả năm", { flags: [talentFlag(OF)], counters: { talents_seen: 1 }, bw: -2, know: 2 }, "Bớt giờ chơi, quen việc sổ sách"),
    C("Dán sổ quỹ lên bảng cho cả lớp xem", { flags: [talentFlag(OF), "open_ledger_kid"], counters: { talents_seen: 1 }, rel: -1, agency: 0.01 }, "Minh bạch, mấy bạn còn nợ quỹ không vui", { tier: "awakened" }),
    C("Trả sổ, ra sân đá bóng", { counters: { talents_seen: 1 }, happy: 2, health: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(OF, "cbn_d_exam", [22, 35], () => true, (c) => T("Kỳ thi tuyển công chức", `Một cơ quan nhà nước của thành phố tuyển bảy chỉ tiêu, hơn bốn trăm hồ sơ nộp vào. Lương khởi điểm thấp hơn việc bạn đang làm, nhưng ổn định đến lúc về hưu.${c.country === "VN" ? " Một người họ hàng gọi điện, bảo có thể 'lo' được một suất, giá bằng gần một năm lương." : " Một người quen kín đáo nói có cách 'lo' được một suất, nếu bạn chịu chi."}`, [
    C("Ôn thi ba tháng, thi bằng sức mình", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(OF), counters: { cbn_clean: 1 }, log: "Bạn đỗ thứ sáu trên bảy. Tờ quyết định có con dấu đỏ." }, lose: { happy: -3, know: 2, log: "Bạn trượt vì kém nửa điểm. Kỳ thi sau còn hai năm nữa." } } }, "Ổn định cả đời nếu đỗ, công cốc nếu trượt"),
    C("Nhờ người 'lo' một suất", { ...become(OF), counters: { doors_seen: 1, cbn_clean: -1, cbn_ties: 1 }, money: -0.8, secret: { tag: "PAID_BRIBE", severity: 0.45, fuse_years: [4, 15], note: "chạy một suất vào biên chế" } }, "Chắc chân, vào nghề với một món nợ và một bí mật"),
    C("Thôi, ở lại việc đang làm", { counters: { doors_seen: 1 } })], 0)),
  door(OF, "cbn_d_flood", [22, 40], () => true, (c, N) => { const o = role(c, "official"); const group = c.country === "VN" ? "tổ dân phố" : "hội cư dân";
    return T("Trụ sở khu phố cần người", `Mùa lũ năm ấy bạn đi phát gạo cùng ${group}, ghi danh sách từng hộ, không sót nhà nào. ${o ? N(o) : "Người phụ trách khu"} mời bạn về làm ở trụ sở: lương hợp đồng, một cái bàn kê sát cửa sổ, hứa sẽ xét vào biên chế "khi có chỉ tiêu".`, [
      C("Nhận, làm hợp đồng trước", { ...become(OF), counters: { doors_seen: 1 }, money: -0.05, rel: 2, ...(o ? { trust: { npc: o, delta: 0.15 } } : {}) }, "Lương thấp, chờ biên chế không biết bao lâu"),
      C("Giúp không công những lúc rảnh", { counters: { doors_seen: 1 }, flags: ["civic_volunteer"], rel: 3, bw: -2 }, "Được quý, không thành nghề"),
      C("Cảm ơn, từ chối", { counters: { doors_seen: 1 } })], 0, o ? { npc: o } : {}); }),
  door(OF, "cbn_d_remote", [23, 35], (c) => c.has_degree, (c, N) => { const m = role(c, "mother"); return T("Năm năm ở huyện vùng cao", "Một chương trình tuyển người có bằng đại học về làm việc năm năm ở một huyện vùng cao, cách thành phố chín giờ xe. Hết hạn, bạn được xếp một vị trí ở tỉnh. Huyện ấy chưa có đường nhựa tới trung tâm, và mùa mưa thì mất sóng điện thoại.", [
    C("Đi, ký cam kết năm năm", { ...become(OF), counters: { doors_seen: 1, cbn_clean: 1 }, flags: ["official_remote"], rel: -3, ...(m ? { promise: { to: m, what: "về lại gần nhà sau năm năm ở vùng cao", years: 5 } } : {}) }, `Vào nghề chắc chắn, xa nhà năm năm${m ? `, hứa với ${N(m)} sẽ về` : ""}`),
    C("Ở lại thành phố tìm việc khác", { counters: { doors_seen: 1 }, bw: -2 }, "Gần nhà, đường vào nhà nước khép lại")], 0); }),

  /* ---------- mạch truyện ---------- */
  beat(OF, 1, 1, (c, N) => { const b = role(c, "first_boss"); return T("Bốn mươi bộ hồ sơ tồn", `Ngày đầu đi làm, ${b ? N(b) : "trưởng phòng"} đặt lên bàn bạn bốn mươi bộ hồ sơ tồn từ năm ngoái. Ngoài hành lang, một bà cụ đến lần thứ năm để xin một con dấu xác nhận mảnh đất. Người cũ dặn: việc gì cũng phải chờ "ý anh ấy".`, [
    C("Làm theo nếp, chờ cấp trên duyệt", { counters: step(c, OF, { cbn_ties: 1 }), ...(b ? { trust: { npc: b, delta: 0.15 } } : {}) }, "Yên ổn với sếp, bà cụ còn phải chờ"),
    C("Làm xong hồ sơ của bà cụ ngay hôm ấy", { counters: step(c, OF, { cbn_clean: 1 }), flags: ["official_fast_hand"], gamble: { p: 0.6, win: { rel: 3, log: "Bà cụ cầm tờ giấy, đứng lặng ở cửa rất lâu rồi mới về." }, lose: { counters: { cbn_ties: -1 }, log: "Trưởng phòng gọi bạn lên, nhắc rằng ở đây không ai làm thay ai." } } }, "Được việc cho dân, có thể mất lòng sếp"),
    C("Lập bảng theo dõi hồ sơ, dán ở sảnh", { counters: step(c, OF), flags: ["official_open_queue"], agency: 0.02, gamble: { p: 0.4, win: { income_mult: 1.1, log: "Phòng bạn được nêu gương. Bảng theo dõi được nhân ra cả tầng." }, lose: { counters: { cbn_ties: -1 }, log: "Bảng bị gỡ sau ba ngày. Không ai nói ai gỡ." } } }, "Công khai tiến độ, có người không vui", { tier: "sovereign" })], 0, b ? { npc: b } : {}); }, adult),
  beat(OF, 2, 3, (c, N) => { const m = role(c, "mentor"); return T("Người đỡ đầu", `${m ? `${N(m)}, giờ đã là phó giám đốc,` : "Một phó giám đốc"} để ý đến bạn sau một cuộc họp và mời bạn về làm trợ lý riêng: đi theo mọi chuyến công tác, nghe mọi cuộc gọi, thăng chức nhanh. Đổi lại, khi có chuyện, bạn đứng về một phía.`, [
    C("Nhận, đi theo người ấy", { counters: step(c, OF, { cbn_ties: 2 }), income_mult: 1.4, flags: ["official_patron"], ...(m ? { trust: { npc: m, delta: 0.2 } } : {}) }, "Lên nhanh, buộc đời mình vào một người"),
    C("Ở lại phòng, thi nâng ngạch", { counters: step(c, OF), know: 4, bw: -4, flags: ["official_merit"], gamble: { p: 0.5, win: { income_mult: 1.2, log: "Bạn đỗ ngay kỳ đầu, đứng thứ hai toàn cơ quan." }, lose: { income_mult: 1.05, log: "Bạn trượt kỳ đầu, đỗ kỳ sau, chậm mất hai năm." } } }, "Chậm, tự đứng trên chân mình"),
    C("Nhận, nhưng xin mọi chỉ đạo bằng văn bản", { counters: step(c, OF, { cbn_ties: 1 }), income_mult: 1.2, flags: ["official_patron", "official_paper_trail"], ...(m ? { trust: { npc: m, delta: -0.05 } } : {}) }, "Lên chậm hơn, giữ cho mình một đường lui", { tier: "awakened" })], 0, m ? { npc: m } : {}); }, adult),
  beat(OF, 3, 4, (c, N) => { const b = role(c, "first_boss"); const patron = f(c, "official_patron");
    return T("Chữ ký cho khu đô thị mới", `Hồ sơ một khu đô thị mới cần chữ ký thẩm định của bạn. Biên bản đền bù thiếu chữ ký của mười hai hộ dân, bản đồ quy hoạch bị sửa sau ngày họp. ${patron ? `Người đỡ đầu gọi điện lúc mười giờ đêm: "Cứ ký đi, phần còn lại để tôi lo."` : `${b ? N(b) : "Trưởng phòng"} đặt cây bút lên bàn, nói cả cơ quan đang chờ mỗi chữ ký của bạn.`}${f(c, "official_paper_trail") ? " Bạn xin chỉ đạo bằng văn bản; người ta bảo việc này không tiện viết ra." : ""}`, [
      C("Ký, như mọi người vẫn ký", { counters: step(c, OF, { cbn_clean: -2, cbn_ties: 1 }), income_mult: 1.2, flags: ["official_signed_land"], secret: { tag: "FORGED_PAPERS", severity: 0.55, fuse_years: [4, 12], note: "ký thẩm định hồ sơ đền bù thiếu chữ ký dân" } }, "Giữ ghế, chữ ký nằm trong hồ sơ mãi mãi"),
      C("Không ký, ghi rõ lý do vào hồ sơ", { counters: step(c, OF, { cbn_clean: 2, cbn_ties: -1 }), income_mult: 0.85, flags: ["official_refused_land"], ...(b ? { trust: { npc: b, delta: -0.2 } } : {}) }, "Sạch tay, bị gạt ra rìa"),
      C("Mời mười hai hộ dân đến đối chất công khai", { counters: step(c, OF), agency: 0.03, flags: ["official_hearing"], gamble: { p: 0.4, win: { counters: { cbn_clean: 2 }, rel: 4, log: "Dự án lùi nửa năm, đền bù được làm lại. Mười hai gia đình nhớ tên bạn." }, lose: { income_mult: 0.7, log: "Buổi đối chất bị hủy phút chót. Tuần sau bạn nhận quyết định chuyển sang phòng lưu trữ." } } }, "Làm đúng đến cùng, có thể mất chỗ đứng", { tier: "sovereign" }),
      C("Nộp đơn xin nghỉ việc", { counters: step(c, OF), ...leave(OF), flags: ["ex_official"], happy: -2, money: -0.2 }, "Không dính vào, mất chỗ làm ổn định")], 1, b ? { npc: b } : {}); }, adult),
  beat(OF, 4, 5, (c) => {
    if (f(c, "official_signed_land")) return T("Đoàn thanh tra về cơ quan", `Một dãy nhà trong khu đô thị năm ấy sụt lún, và đoàn thanh tra mở lại toàn bộ hồ sơ. Tên bạn nằm ở trang mười bốn. ${f(c, "official_patron") ? "Người đỡ đầu của bạn đã nghỉ hưu, số điện thoại không còn ai nghe." : "Những người cùng ký đều nói họ chỉ ký sau bạn."}`, [
      C("Khai hết, kể cả người đã chỉ đạo", { counters: step(c, OF, { cbn_clean: 2 }), income_mult: 0.6, flags: ["official_testified"], happy: 3 }, "Mất ghế, nhẹ lòng"),
      C("Im lặng, nhận phần lỗi một mình", { counters: step(c, OF, { cbn_ties: 1 }), gamble: { p: 0.5, win: { income_mult: 0.9, log: "Bạn bị khiển trách, giữ được ghế. Người chỉ đạo gửi đến một giỏ quà không kèm thiệp." }, lose: { unflags: [life(OF)], custom: "job_lose", close_doors: ["clean_record"], log: "Bạn bị cách chức và khởi tố. Người chỉ đạo không bị gọi tên." } } }, "Che cho người trên, đánh cược chính mình"),
      C("Thuê luật sư, đẩy lỗi xuống cấp dưới", { counters: step(c, OF, { cbn_clean: -2 }), money: -0.5, gamble: { p: 0.6, win: { flags: ["official_scapegoat"], log: "Một chuyên viên trẻ chịu kỷ luật thay bạn. Bạn giữ được ghế." }, lose: { income_mult: 0.5, close_doors: ["clean_record"], log: "Chuyên viên ấy giữ bản sao mọi email. Bạn mất cả ghế lẫn tiếng." } } }, "Thoát thân bằng vai người khác")], 0);
    const clean = cnt(c, "cbn_clean"); const patron = f(c, "official_patron");
    return T("Chiếc ghế đứng đầu cơ quan", `Người đứng đầu cơ quan về hưu, ghế trống.${f(c, "official_refused_land") || f(c, "official_hearing") ? " Người ta vẫn nhớ bạn là người không ký năm ấy: có người nể, có người ngại." : ""}${patron ? " Người đỡ đầu hứa đẩy bạn lên, đổi lại bạn nhận đứa cháu họ của người ấy vào làm." : " Bạn không có ai đứng sau, chỉ có mười mấy năm hồ sơ không trễ hạn."}`, [
      C(patron ? "Nhận lời, đưa cháu người ấy vào làm" : "Đi gặp từng người, hứa hẹn vị trí", { counters: step(c, OF, { cbn_ties: 2, cbn_clean: -1 }), income_mult: 1.5, flags: ["official_head"] }, "Lên ghế, nợ nhiều người"),
      C("Nộp đề án cải tổ, để phiếu tự nói", { counters: step(c, OF), agency: 0.02, gamble: { p: pr(0.3 + 0.08 * clean), win: { income_mult: 1.4, flags: ["official_head", "official_reformer"], log: "Bạn thắng hơn hai phiếu. Đề án được dán ở sảnh ngày bạn nhận việc." }, lose: { happy: -3, log: "Bạn thua. Người thắng mời bạn làm phó, với điều kiện thôi nhắc đến đề án." } } }, "Lên bằng việc thật, có thể thua", { tier: "sovereign" }),
      C("Nhường ghế, xin về cơ sở làm việc mình thích", { counters: step(c, OF), income_mult: 0.9, happy: 5, flags: ["official_grassroots"] }, "Ít quyền, nhiều việc thật")], 1); }, adult),
  beat(OF, 5, 6, (c) => { const signed = f(c, "official_signed_land");
    return T("Buổi chia tay cuối cùng", `Buổi chia tay có hoa, có bài phát biểu viết sẵn, có tấm ảnh chụp chung trước cổng. Một nhà báo trẻ xin phỏng vấn bạn về những năm làm việc.${signed ? " Cô ấy có bản sao hồ sơ khu đô thị năm nào, mở sẵn ở trang mười bốn." : f(c, "official_head") ? " Cô ấy hỏi bạn đã đổi được gì khi ngồi ghế cao nhất." : " Cô ấy hỏi vì sao bạn chưa bao giờ lên ghế cao nhất."}`, [
      C(signed ? "Kể thật, xin lỗi những hộ dân năm ấy" : "Kể thật hết, cả những điều không đẹp", { counters: step(c, OF), flags: ["official_told_truth"], happy: 2, ...(signed ? { custom: "apologize", rel: 3 } : { rel: 2 }) }, "Nhẹ lòng, có người không muốn nghe"),
      C("Nói những điều đẹp, rồi về nghỉ", { counters: step(c, OF), happy: 3 }, "Yên ổn, câu chuyện thật đi theo bạn"),
      C("Mở lớp dạy công chức trẻ làm hồ sơ minh bạch", { counters: step(c, OF), flags: ["passed_on", "official_mentor"], bw: -4, know: 3, agency: 0.02 }, "Bận rộn tuổi già, để lại một nếp làm việc", { tier: "awakened" })], 1); }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(OF, "cbn_envelope", [24, 60], 6, (c) => T("Phong bì cuối năm", c.country === "VN"
    ? vary("cbe", c.age, ["Chiều hai mươi ba tháng Chạp, một nhà thầu để lại trên bàn bạn một hộp bánh. Dưới đáy hộp là một phong bì dày.", "Trước Tết, một doanh nghiệp đang chờ giấy phép gửi quà đến tận nhà bạn: một giỏ rượu và một phong bì."])
    : vary("cbe", c.age, ["Cuối năm, một nhà thầu để lại trên bàn bạn một hộp quà. Dưới đáy hộp là một phong bì dày.", "Một doanh nghiệp đang chờ giấy phép mời cả nhà bạn đi nghỉ cuối tuần, 'không ràng buộc gì'."]), [
    C("Nhận, ai cũng nhận", { money: 0.08, counters: { cbn_clean: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.2, fuse_years: [2, 8], note: "nhận quà của doanh nghiệp đang chờ giấy phép" } }, "Đỡ chi tiêu, có người giữ bằng chứng"),
    C("Gửi trả lại, kèm một lời cảm ơn", { counters: { cbn_clean: 1 }, rel: -1 }, "Sạch, bị coi là khó gần"),
    C("Nộp lên bộ phận thanh tra, lấy biên nhận", { counters: { cbn_clean: 1, cbn_ties: -1 }, flags: ["official_reported_gift"], agency: 0.01 }, "Có giấy tờ bảo vệ mình, đồng nghiệp xa lánh", { tier: "awakened" })], 1)),
  daily(OF, "cbn_meeting", [22, 60], 7, () => T("Cuộc họp chuẩn bị cho cuộc họp", "Cuộc họp bàn việc chuẩn bị cho hội nghị tổng kết kéo dài ba tiếng, mười bốn người phát biểu cùng một ý. Bản báo cáo của bạn phải nộp trước năm giờ chiều.", [
    C("Ngồi đến cuối, gật đầu đúng lúc", { counters: { cbn_ties: 1 }, bw: -3 }, "Được lòng, trễ hạn báo cáo"),
    C("Xin phép ra ngoài làm báo cáo", { counters: { cbn_ties: -1 }, know: 1 }, "Xong việc, bị để ý là thiếu tôn trọng"),
    C("Đề xuất họp ba mươi phút, góp ý bằng văn bản", { flags: ["official_short_meetings"], gamble: { p: 0.4, win: { bw: 4, rel: 2, log: "Cấp trên đồng ý thử. Các cuộc họp sau ngắn hẳn." }, lose: { counters: { cbn_ties: -1 }, log: "Có người bật cười. Cuộc họp kéo dài thêm nửa tiếng." } } }, "Đổi nếp cả phòng, có thể bị cười", { tier: "sovereign" })], 0)),
  daily(OF, "cbn_complaint", [22, 60], 7, () => T("Lá đơn đi qua bốn phòng", "Một người đàn ông đập bàn ở bộ phận tiếp dân: lá đơn về đường ống nước vỡ của ông đã đi qua bốn phòng trong tám tháng, phòng nào cũng bảo không thuộc thẩm quyền.", [
    C("Chuyển đơn sang phòng đúng chức năng", { bw: 2, counters: { cbn_clean: -1 } }, "Đúng quy trình, lá đơn đi tiếp vòng thứ năm"),
    C("Nhận đơn, tự theo đến khi xong", { bw: -5, rel: 2, counters: { cbn_clean: 1 }, flags: ["official_owns_case"] }, "Mất cả tháng, nhà ông ấy có nước"),
    C("Gọi đủ bốn phòng ngồi chung một bàn", { agency: 0.02, gamble: { p: 0.5, win: { counters: { cbn_clean: 1, cbn_ties: 1 }, log: "Bốn phòng chia việc trong một buổi sáng. Đường ống được sửa sau hai tuần." }, lose: { counters: { cbn_ties: -1 }, log: "Chỉ một phòng đến. Ba phòng kia nói bạn vượt quyền." } } }, "Có thể gỡ nút cho cả hệ thống, có thể bị coi là vượt quyền", { tier: "sovereign" })], 1)),
  daily(OF, "cbn_kin", [24, 60], 8, (c, N) => { const s = role(c, "sibling")!; return T("Người nhà xin đi trước", `${N(s)} nhờ bạn "nói một tiếng" để hồ sơ xin mở quán của mình được duyệt trước. Hồ sơ ấy đang xếp hàng thứ chín mươi.`, [
    C("Nói một tiếng, chỉ lần này", { trust: { npc: s, delta: 0.2 }, counters: { cbn_clean: -1, cbn_ties: 1 } }, "Người nhà vui, tám mươi chín người chờ thêm"),
    C("Từ chối thẳng", { memory: { npc: s, tag: "REFUSED_HELP", weight: -0.25, note: "không chịu nói giúp hồ sơ mở quán" }, counters: { cbn_clean: 1 } }, "Giữ nguyên tắc, mất một bữa cơm vui"),
    C("Chỉ cách làm hồ sơ cho đủ, đi đúng lượt", { trust: { npc: s, delta: 0.05 }, bw: -3, know: 1 }, "Mất buổi tối, không ai được ưu tiên", { tier: "awakened" })], 2, { npc: s }); }, (c) => !!role(c, "sibling")),
  daily(OF, "cbn_numbers", [24, 60], 8, () => T("Con số chín mươi lăm phần trăm", "Cấp trên cần báo cáo chín mươi lăm phần trăm hộ dân đã có nước sạch. Số bạn đếm được là bảy mươi mốt. Hạn nộp là tám giờ sáng mai.", [
    C("Viết chín mươi lăm", { counters: { cbn_ties: 1, cbn_clean: -1 }, secret: { tag: "FORGED_PAPERS", severity: 0.2, fuse_years: [3, 10], note: "nâng số liệu nước sạch trong báo cáo" } }, "Cả phòng được khen, những nhà thiếu nước bị quên"),
    C("Viết bảy mươi mốt", { counters: { cbn_clean: 1, cbn_ties: -1 }, income_mult: 0.97 }, "Đúng sự thật, phòng bị nhắc nhở"),
    C("Viết bảy mươi mốt, kèm danh sách vùng thiếu nước", { counters: { cbn_clean: 1 }, bw: -4, gamble: { p: 0.4, win: { flags: ["official_water_fund"], log: "Năm sau có thêm ngân sách cho bốn vùng thiếu nước." }, lose: { log: "Bản kế hoạch nằm yên trong ngăn kéo của cấp trên." } } }, "Thêm việc, có thể mở ra tiền thật", { tier: "sovereign" })], 1)),
  daily(OF, "cbn_rotation", [26, 55], 8, (c) => T("Quyết định luân chuyển", vary("cbr", c.age, ["Bạn có quyết định luân chuyển về một huyện cách nhà bốn giờ xe, ba năm. Người ta nói đây là bước đệm để lên.", "Một chân phó phòng ở tỉnh bên trống. Đi thì lên chức, nhưng mỗi tuần chỉ về nhà được một ngày."]), [
    C("Đi", { income_mult: 1.15, rel: -4, flags: ["official_rotated"], counters: { cbn_ties: 1 } }, "Lên chức, nhà vắng bạn"),
    C("Xin ở lại vì gia đình", { rel: 2, counters: { cbn_ties: -1 } }, "Gia đình đủ người, đường lên chậm lại")], 0)),
  daily(OF, "cbn_software", [22, 55], 9, () => T("Phần mềm nhận hồ sơ trực tuyến", "Cơ quan đưa phần mềm nhận hồ sơ trực tuyến vào dùng. Ba người lớn tuổi nhất phòng vẫn in mọi thứ ra giấy, còn hồ sơ gửi qua mạng thì nằm đó ba tuần không ai mở.", [
    C("Ở lại sau giờ làm, chỉ cho từng người", { bw: -4, rel: 3, counters: { cbn_ties: 1 }, know: 1 }, "Mất buổi tối, cả phòng chạy được"),
    C("Tự làm hết phần trên mạng", { bw: -6, income_mult: 1.05, flags: ["official_digital"] }, "Thành người không thể thiếu, và kiệt sức"),
    C("Kệ, giấy tờ vẫn chạy", { counters: { cbn_clean: -1 }, bw: 2 }, "Nhàn, người dân vẫn xếp hàng")], 0)),
  daily(OF, "cbn_side", [24, 55], 8, (c) => T("Lương không đủ sống", `${c.poor_country ? "Lương của bạn đủ trả tiền thuê nhà và nửa tháng tiền ăn." : "Lương của bạn đủ sống, nhưng không đủ cho con đi học thêm."} Một công ty tư vấn mời bạn làm thêm buổi tối. Khách của họ chính là những người nộp hồ sơ ở phòng bạn.`, [
    C("Nhận, chỉ góp ý chung chung", { money: 0.2, counters: { cbn_clean: -1 }, flags: ["official_side_gig"] }, "Đủ tiền, mỗi hồ sơ thành một xung đột lợi ích"),
    C("Từ chối, sống bằng lương", { money: -0.03, happy: -1, counters: { cbn_clean: 1 } }, "Sạch, tháng nào cũng thiếu"),
    C("Đi dạy lớp buổi tối ở trung tâm", { money: 0.08, bw: -4, health: -1, flags: ["official_night_teacher"] }, "Tiền ít, sạch, mệt")], 1), (c) => c.poor_country || c.broke || c.scarcity),
  daily(OF, "cbn_party", [24, 60], 8, (c) => T("Tiệc nhà sếp", c.country === "VN"
    ? vary("cbp", c.age, ["Con gái giám đốc cưới. Cả phòng bàn nhau mừng bao nhiêu; ai cũng để ý xem phong bì của bạn dày hay mỏng.", "Giám đốc mừng thọ mẹ, mời cả cơ quan. Danh sách người mừng được một chị bên văn phòng ghi rất kỹ."])
    : vary("cbp", c.age, ["Cấp trên mời cả phòng dự sinh nhật năm mươi tuổi ở một nhà hàng đắt tiền. Có một cuốn sổ ghi tên người góp quà.", "Con của cấp trên tốt nghiệp, cả phòng góp tiền mua quà. Có người đề nghị mỗi người góp nửa tuần lương."]), [
    C("Góp thật hậu", { money: -0.05, counters: { cbn_ties: 1 } }, "Được nhớ tên, ví mỏng đi"),
    C("Góp như mọi người", { money: -0.02 }, "Không ai để ý, không ai nhớ"),
    C("Không đi, gửi lời chúc", { counters: { cbn_ties: -1 }, happy: 1 }, "Giữ tiền, bị nhớ theo kiểu khác")], 1)),
  daily(OF, "cbn_offer", [28, 55], 99, () => T("Lời mời từ khu vực tư", "Một công ty tư nhân mời bạn về làm giám đốc pháp chế, lương gấp ba. Họ cần người hiểu cơ quan nhà nước từ bên trong, và bạn biết vì sao họ cần đúng bạn.", [
    C("Nhận, rời cơ quan", { ...leave(OF), flags: ["ex_official"], money: 0.2 }, "Giàu hơn, bị coi là người đem quan hệ đi bán"),
    C("Ở lại, chịu lương thấp", { happy: -1, counters: { cbn_clean: 1 } }, "Ổn định, lương vẫn thế")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(OF, "cbn_family", [26, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => { const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`${N(k)} thiếu hai điểm`, `${N(k)} thiếu hai điểm để vào trường tốt nhất thành phố. Một người quen trong ngành giáo dục nói chỉ cần bạn gọi một cuộc. ${N(k)} nghe được, đứng ở cửa nhìn bạn chờ đợi.`, [
      C("Gọi cuộc điện thoại ấy", { trust: { npc: k, delta: 0.2 }, counters: { cbn_clean: -1, cbn_ties: 1 }, flags: ["official_pulled_string"] }, "Con vào trường tốt, học một bài học sai"),
      C("Không gọi, để con học trường gần nhà", { trust: { npc: k, delta: -0.15 }, counters: { cbn_clean: 1 } }, "Con giận một thời gian, bạn giữ được mình"),
      C("Không gọi, hứa kèm con thi lại năm sau", { trust: { npc: k, delta: 0.1 }, bw: -4, promise: { to: k, what: "kèm con ôn thi lại vào trường tốt", years: 1 } }, "Mất cả năm buổi tối, con tự đứng được", { tier: "awakened" })], 2, { npc: k });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T("Con đường về làng", `${N(p)} nhắn: cả làng biết bạn làm ở cơ quan nhà nước, nhờ bạn "xin" cho ${c.poor_country ? "con đường đất về làng được đổ bê tông trước" : "tuyến xe buýt về làng được mở lại trước"}. Danh sách ưu tiên năm nay không có làng mình.`, [
      C("Lách để làng được làm trước", { trust: { npc: p, delta: 0.25 }, rel: 3, counters: { cbn_clean: -1, cbn_ties: 1 } }, "Cả làng tự hào, nơi khác chờ thêm"),
      C("Giải thích là không thể", { memory: { npc: p, tag: "REFUSED_HELP", weight: -0.2, note: "không chịu xin con đường cho làng" } }, "Giữ nguyên tắc, cả làng xì xào"),
      C("Hướng dẫn làng làm đơn đúng cách, tự theo dõi", { trust: { npc: p, delta: 0.1 }, bw: -3, flags: ["official_village_petition"] }, "Chậm, đúng, bạn phải bỏ công", { tier: "awakened" })], 0, { npc: p }); }),

  /* ======================================================================
   * CHÍNH TRỊ GIA (politician) — tiền tố ctg_
   * ==================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(PO, "ctg_t_speech", [12, 16], () => true, () => T("Ba phút trước sân trường", "Trường định chặt hàng cây già sau sân để làm bãi xe. Trong giờ chào cờ, bạn xin micro và nói ba phút trước sáu trăm học sinh. Cả sân im phắc, rồi có tiếng vỗ tay từ cuối hàng.", [
    C("Gom chữ ký cả trường, xin gặp hiệu trưởng", { flags: [talentFlag(PO)], counters: { talents_seen: 1 }, bw: -2, gamble: { p: 0.5, win: { happy: 4, log: "Hàng cây được giữ lại. Bãi xe dời sang góc sân bên kia." }, lose: { happy: -2, log: "Bãi xe vẫn được làm, nhưng thầy hiệu trưởng nhớ tên bạn." } } }, "Bị để ý, học cách thuyết phục người lớn"),
    C("Vào đội tranh biện của trường", { flags: [talentFlag(PO)], counters: { talents_seen: 1 }, money: -0.02, know: 2 }, "Tốn tiền đi thi, rèn lý lẽ"),
    C("Xin lỗi thầy, không nói nữa", { counters: { talents_seen: 1 }, happy: -1 })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(PO, "ctg_d_seat", [28, 50], () => true, () => T("Ghế trống ở hội đồng địa phương", "Một ghế trong hội đồng địa phương bỏ trống sau khi người cũ qua đời. Hàng xóm biết bạn từ vụ đòi lắp đèn đường năm ngoái. Còn bốn tháng đến ngày bầu, và bạn chưa từng nói trước quá năm mươi người.", [
    C("Ra ứng cử, tự bỏ tiền vận động", { counters: { doors_seen: 1 }, money: -0.15, agency: 0.02, gamble: { p: 0.45, win: { ...become(PO), counters: { ctg_trust: 1 }, log: "Bạn thắng đối thủ bốn trăm phiếu." }, lose: { happy: -4, log: "Bạn thua, nhưng có ba nghìn người đã chọn bạn." } } }, "Tốn tiền, có thể thua"),
    C("Làm người vận động cho ứng viên khác", { counters: { doors_seen: 1 }, flags: ["politician_campaigner"], rel: 2, bw: -2 }, "Học nghề, tên trên lá phiếu không phải của bạn"),
    C("Thôi, lo việc nhà", { counters: { doors_seen: 1 } })], 0)),
  door(PO, "ctg_d_faction", [30, 55], () => true, () => T("Gương mặt mới cho một phe", "Một nhóm có thế lực trong thành phố cần một gương mặt mới: sạch, nói chuyện được, chưa dính vụ nào. Họ lo bộ máy vận động, tiền, báo chí. Đổi lại, khi cần, lá phiếu của bạn đi theo nhóm.", [
    C("Nhận lời, đứng vào nhóm", { ...become(PO), counters: { doors_seen: 1, ctg_debt: 2 }, flags: ["politician_machine"] }, "Có bộ máy, mất một phần lá phiếu"),
    C("Ra độc lập, không thuộc phe nào", { counters: { doors_seen: 1 }, money: -0.2, gamble: { p: 0.3, win: { ...become(PO), flags: ["politician_independent"], counters: { ctg_trust: 2 }, log: "Bạn thắng sít sao. Báo gọi đó là bất ngờ của mùa bầu cử." }, lose: { happy: -3, log: "Không có bộ máy, bạn thua ngay vòng đầu." } } }, "Tự do, khó thắng"),
    C("Từ chối", { counters: { doors_seen: 1 } })], 0)),
  door(PO, "ctg_d_cause", [28, 55], () => true, (c) => T("Từ người phản đối thành ứng viên", `Suốt hai năm bạn dẫn đầu cư dân phản đối ${c.poor_country ? "một bãi rác lộ thiên mọc ngay cạnh trường học" : "việc đóng cửa trạm y tế duy nhất của khu"}. Giờ người ta giục bạn ra tranh cử, để đưa chuyện ấy vào phòng họp thay vì đứng ngoài cổng.`, [
    C("Ra tranh cử", { counters: { doors_seen: 1 }, gamble: { p: 0.55, win: { ...become(PO), flags: ["politician_cause"], counters: { ctg_trust: 2 }, log: "Bạn thắng. Người ủng hộ mang băng rôn cũ đến buổi nhậm chức." }, lose: { happy: -2, log: "Bạn thua, nhưng hội đồng mới buộc phải đưa chuyện ấy vào chương trình họp." } } }, "Vào bên trong, có thể mất chất người ngoài cuộc"),
    C("Ở lại làm người vận động bên ngoài", { counters: { doors_seen: 1 }, custom: "become:activist", agency: 0.02 }, "Giữ tiếng nói độc lập, không có lá phiếu"),
    C("Trở về đời thường", { counters: { doors_seen: 1 }, happy: 1 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(PO, 1, 1, (c, N) => { const nb = role(c, "neighbor"); return T("Lời hứa về cây cầu sắt", `Buổi gặp cử tri đầu tiên sau khi nhận ghế, trong hội trường một trường tiểu học, hai trăm người ngồi ghế nhựa. Câu hỏi cuối cùng${nb ? ` của ${N(nb)}` : ""}: "Có dám hứa sửa cây cầu sắt trong nhiệm kỳ này không?" Ngân sách năm nay chưa có một đồng nào cho nó.`, [
    C("Hứa chắc chắn", { counters: step(c, PO, { ctg_trust: 1 }), flags: ["politician_bridge_promise"], ...(nb ? { promise: { to: nb, what: "sửa cây cầu sắt trong nhiệm kỳ", years: 4 } } : {}) }, "Được lòng hôm nay, hứa điều chưa chắc làm được"),
    C("Nói thật: chưa có tiền, nhưng sẽ đòi", { counters: step(c, PO), gamble: { p: 0.5, win: { counters: { ctg_trust: 2 }, log: "Có người vỗ tay, vì bạn không nói dối." }, lose: { counters: { ctg_trust: -1 }, log: "Đối thủ cắt câu nói ấy thành 'không dám hứa'." } } }, "Thật thà, có thể mất phiếu"),
    C("Mời dân cùng lập dự toán cho cây cầu", { counters: step(c, PO, { ctg_trust: 1 }), flags: ["politician_participatory"], agency: 0.02, bw: -5 }, "Chia quyền quyết định, chậm và mệt", { tier: "sovereign" })], 0, nb ? { npc: nb } : {}); }, adult),
  beat(PO, 2, 3, (c) => T("Bữa tối với nhà tài trợ", `Một doanh nhân xây dựng mời bạn ăn tối, đề nghị lo toàn bộ chi phí cho lần tái tranh cử. Ông không đòi gì, chỉ mong bạn "hiểu cho" khi hội đồng xét gói thầu đường vành đai.${f(c, "politician_machine") ? " Nhóm của bạn đã gật đầu trước khi bạn đến." : ""}`, [
    C("Nhận, hứa sẽ 'xem xét'", { counters: step(c, PO, { ctg_debt: 2 }), money: 0.2, income_mult: 1.2, flags: ["politician_donor"] }, "Chiến dịch dư dả, mang một món nợ"),
    C("Từ chối, gây quỹ bằng những khoản nhỏ", { counters: step(c, PO, { ctg_trust: 1 }), bw: -6, money: -0.1, flags: ["politician_small_donors"] }, "Sạch, mệt, túi luôn rỗng"),
    C("Nhận, nhưng công khai mọi khoản lên mạng", { counters: step(c, PO), flags: ["politician_open_books"], agency: 0.02, gamble: { p: 0.5, win: { counters: { ctg_trust: 2 }, log: "Ông rút lại một nửa. Nửa còn lại vẫn đến, công khai từng khoản." }, lose: { money: -0.1, log: "Ông rút hết. Bạn còn một trang sổ sách sạch và một chiến dịch rỗng túi." } } }, "Minh bạch, có thể mất nhà tài trợ", { tier: "sovereign" })], 0), adult),
  beat(PO, 3, 4, (c) => { const donor = f(c, "politician_donor"); const machine = f(c, "politician_machine");
    return T("Phiên bỏ phiếu gói thầu", `Gói thầu đường vành đai lên bàn hội đồng. Hồ sơ của công ty ${donor ? "người đã lo chiến dịch cho bạn" : "được nhiều người đỡ"} đắt hơn hai phần mười so với đối thủ; nếu thông qua, cây cầu sắt phải chờ thêm năm năm vì hết tiền.${donor ? ` Tối qua ông nhắn: "Nhớ bữa tối hôm ấy."` : machine ? " Trưởng nhóm nói lần này cần đúng lá phiếu của bạn." : " Lá phiếu của bạn là lá quyết định, và cả hai phía đều gọi điện."}`, [
      C("Bỏ phiếu thuận", { counters: step(c, PO, { ctg_debt: -2, ctg_trust: -2 }), income_mult: 1.2, flags: ["politician_voted_deal"], ...(donor ? { secret: { tag: "PAID_BRIBE", severity: 0.55, fuse_years: [2, 8], note: "đổi lá phiếu gói thầu lấy tiền vận động" } } : {}) }, "Trả xong món nợ, cây cầu phải chờ"),
      C("Bỏ phiếu chống", { counters: step(c, PO, { ctg_trust: 2 }), income_mult: 0.85, flags: ["politician_broke_ranks"] }, "Giữ lời với cử tri, mất người đỡ lưng"),
      C("Rời phòng họp trước khi bỏ phiếu", { counters: step(c, PO, { ctg_trust: -1 }), bw: 2 }, "Không ai trách được, cũng không ai tin hẳn"),
      C("Công bố toàn bộ hồ sơ thầu trước phiên họp", { counters: step(c, PO), agency: 0.03, gamble: { p: 0.4, win: { flags: ["politician_whistle"], counters: { ctg_trust: 3 }, log: "Phiên họp bị hoãn. Báo chí vào cuộc, gói thầu được mở lại." }, lose: { close_doors: ["partner_circle"], income_mult: 0.8, log: "Bạn bị gạt khỏi mọi ủy ban. Hồ sơ chìm sau một tuần." } } }, "Có thể lật ván cờ, có thể bị cô lập", { tier: "sovereign" })], 1); }, adult),
  beat(PO, 4, 5, (c) => {
    if (f(c, "politician_voted_deal")) return T("Hồ sơ rò rỉ trước ngày bầu", `Đúng tuần trước ngày bầu cho chiếc ghế lớn nhất đời bạn, một tờ báo đăng ${f(c, "politician_donor") ? `tin nhắn "Nhớ bữa tối hôm ấy"` : "biên bản họp nhóm trước phiên bỏ phiếu"} cùng toàn bộ hồ sơ gói thầu vành đai. Điện thoại của bạn rung suốt đêm.`, [
      C("Chối, đổ lỗi cho trợ lý", { counters: step(c, PO), gamble: { p: 0.45, win: { income_mult: 1.3, flags: ["politician_high_office"], log: "Bạn thắng sít sao. Người trợ lý lặng lẽ rời thành phố." }, lose: { ...leave(PO), close_doors: ["clean_record"], log: "Bạn thua và bị điều tra. Người trợ lý ra làm chứng." } } }, "Có thể thoát, có thể mất tất cả"),
      C("Nhận trách nhiệm, rút khỏi chính trường", { counters: step(c, PO, { ctg_trust: 1 }), unflags: [life(PO)], custom: "job_lose|apologize", flags: ["ex_politician"], happy: -3 }, "Mất sự nghiệp, giữ được chút tự trọng"),
      C("Ở lại, xin lỗi công khai, trả lại tiền", { counters: step(c, PO), money: -0.5, custom: "apologize", gamble: { p: 0.35, win: { counters: { ctg_trust: 2 }, log: "Bạn thua cuộc đua lớn nhưng giữ được ghế cũ. Người ta bắt đầu nghe bạn trở lại." }, lose: { income_mult: 0.7, log: "Lời xin lỗi không đủ. Kỳ bầu sau bạn mất cả ghế cũ." } } }, "Tốn kém, bắt đầu lại từ dưới")], 1);
    const trust = cnt(c, "ctg_trust"); const bridge = f(c, "politician_bridge_promise");
    return T("Chiếc ghế lớn hơn", `Ghế đứng đầu thành phố bỏ trống. ${trust >= 3 ? "Người ta dừng bạn ngoài chợ để nói sẽ bầu cho bạn." : "Tên bạn mới chỉ quen với vài khu phố."} ${bridge ? "Cây cầu sắt bạn từng hứa vẫn chưa sửa xong." : "Việc dở trong khu của bạn vẫn còn cả một chồng."}`, [
      C("Ra tranh ghế cao", { counters: step(c, PO), money: -0.3, gamble: { p: pr(0.3 + 0.1 * trust), win: { income_mult: 1.5, flags: ["politician_high_office"], log: "Bạn thắng. Đêm ấy bạn ngủ ba tiếng, sáng ra đã có bốn mươi cuộc hẹn." }, lose: { happy: -4, counters: { ctg_trust: -1 }, log: "Bạn thua, và người khác đã ngồi vào ghế cũ của bạn." } } }, "Đổi đời nếu thắng, mất ghế nếu thua"),
      C(bridge ? "Ở lại, sửa cho xong cây cầu" : "Ở lại, làm cho xong việc dở", { counters: step(c, PO, { ctg_trust: 1 }), happy: 4, flags: ["politician_stayed_local"] }, "Ít quyền hơn, giữ được lời"),
      C("Rời chính trường, về sống đời thường", { counters: step(c, PO), ...leave(PO), flags: ["ex_politician"], happy: 3, money: -0.1 }, "Bình yên, bỏ dở những gì đang làm")], 1); }, adult),
  beat(PO, 5, 6, (c) => { const donor = f(c, "politician_donor");
    return T("Người trẻ xin chiếc ghế", `Một người trẻ trong khu xin bạn đỡ đầu để ra tranh đúng chiếc ghế bạn đang ngồi. Người ấy thông minh, nóng vội, thẳng tính hơn bạn ngày xưa.${donor ? " Ông doanh nhân năm nào cũng đã tìm đến người ấy." : ""}${f(c, "politician_high_office") ? " Ở ghế cao, bạn còn quyền chọn người thay." : ""}`, [
      C("Trao lại ghế và cả mạng lưới của mình", { counters: step(c, PO), flags: ["passed_on"], happy: 4, income_mult: 0.7 }, "Lùi về, người trẻ có đà"),
      C("Giữ ghế thêm một nhiệm kỳ", { counters: step(c, PO, { ctg_trust: -1 }), income_mult: 1.1, rel: -2 }, "Còn quyền, bị coi là bám ghế"),
      C("Đỡ đầu, với điều kiện công khai mọi khoản quỹ", { counters: step(c, PO), flags: ["passed_on", "politician_open_rule"], agency: 0.02, bw: -3 }, "Để lại một luật chơi, không chỉ một cái tên", { tier: "sovereign" }),
      ...(donor ? [C("Viết hồi ký kể hết những bữa tối", { counters: step(c, PO), flags: ["politician_memoir"], money: 0.2, close_doors: ["partner_circle"] }, "Kể thật, mất hết bạn bè cũ")] : [])], 0); }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(PO, "ctg_townhall", [28, 75], 6, (c, N) => { const nb = role(c, "neighbor"); return T("Câu hỏi lúc mười giờ đêm", vary("ctgh", c.age, ["Buổi gặp cử tri kéo đến mười giờ đêm. Một người đàn ông đứng dậy, kể con phố của ông ngập ba lần từ đầu mùa mưa, và hỏi bạn đã làm gì.", "Một bà mẹ bế con đến buổi gặp cử tri, hỏi vì sao trạm y tế đóng cửa sau năm giờ chiều."]), [
    C("Ở lại đến người hỏi cuối cùng", { counters: { ctg_trust: 1 }, bw: -4, health: -1 }, "Được lòng, kiệt sức"),
    C("Về đúng giờ, nhờ trợ lý ghi lại", { counters: { ctg_trust: -1 }, bw: 2 }, "Giữ sức, mất điểm"),
    C("Hẹn tuần sau quay lại cùng kỹ sư", { counters: { ctg_trust: 1 }, flags: ["politician_followup"], bw: -2, ...(nb ? { promise: { to: nb, what: "quay lại khu phố cùng kỹ sư sau một tuần", years: 1 } } : {}) }, `Một lời hẹn phải giữ${nb ? `, ${N(nb)} sẽ nhắc` : ""}`, { tier: "awakened" })], 0); }),
  daily(PO, "ctg_clip", [28, 75], 8, () => T("Mười hai giây bị cắt", "Một câu bạn nói trong phiên họp bị cắt còn mười hai giây, nghe như bạn chê người nghèo lười biếng. Đoạn phim có hai triệu lượt xem trước bữa trưa.", [
    C("Đăng toàn bộ đoạn phim gốc", { gamble: { p: 0.55, win: { counters: { ctg_trust: 1 }, log: "Nhiều người xem hết bản gốc và đổi ý." }, lose: { counters: { ctg_trust: -1 }, log: "Bản gốc chẳng ai xem; bản cắt vẫn chạy." } } }, "Có thể gỡ lại, có thể không ai xem"),
    C("Xin lỗi cho xong chuyện", { counters: { ctg_trust: -1 }, happy: -2, bw: 2 }, "Nhanh gọn, nhận một lỗi mình không mắc"),
    C("Kiện trang đã đăng tin", { money: -0.1, flags: ["politician_sued_media"], counters: { ctg_trust: -1 } }, "Có thể đúng luật, trông như bịt miệng báo chí")], 0)),
  daily(PO, "ctg_favor", [28, 70], 8, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Người dán áp phích", `${N(fr)} đã đi dán áp phích cho bạn suốt mùa bầu cử, không lấy một đồng. Giờ ${N(fr)} nhờ bạn xin cho con mình một chỗ làm trong cơ quan quận.`, [
    C("Viết thư giới thiệu", { trust: { npc: fr, delta: 0.2 }, flags: ["politician_patronage"], counters: { ctg_trust: -1 } }, "Trả ơn bạn cũ, mở đầu một nếp xấu"),
    C("Từ chối, giải thích vì sao", { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.3, note: "không xin việc cho con sau mùa dán áp phích" } }, "Giữ nguyên tắc, mất người bạn"),
    C("Kèm cháu ôn thi tuyển công khai", { trust: { npc: fr, delta: 0.1 }, bw: -4, promise: { to: fr, what: "kèm con của bạn ôn thi tuyển công khai", years: 1 } }, "Mất thời gian, không ai phải đi cửa sau", { tier: "awakened" })], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(PO, "ctg_dirt", [30, 70], 8, (c, N) => { const r = role(c, "rival")!; return T("Tập hồ sơ về đối thủ", `Một người lạ gửi bạn tập hồ sơ về ${N(r)}: bệnh án của đứa con và vài tấm ảnh chụp trộm. Còn ba tuần đến ngày bầu, bạn đang kém năm điểm.`, [
    C("Tung ra qua một trang tin ẩn danh", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.4, note: "tung bệnh án của con ra trước ngày bầu" }, gamble: { p: 0.6, win: { counters: { ctg_trust: 1 }, log: "Bạn vượt lên hai điểm." }, lose: { counters: { ctg_trust: -3 }, log: "Người ta lần ra nguồn. Bạn tụt mười điểm." } } }, "Có thể thắng, mãi là người đã làm việc ấy"),
    C("Đốt tập hồ sơ", { flags: ["politician_burned_dirt"], happy: 1 }, "Tay sạch, vẫn kém năm điểm"),
    C("Gửi trả tập hồ sơ cho chính đối thủ", { memory: { npc: r, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: "gửi trả tập hồ sơ về con mình trước ngày bầu" } }, "Kẻ thù nợ bạn một lần", { tier: "awakened" })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(PO, "ctg_trade", [30, 70], 8, () => T("Đổi phiếu lấy phiếu", "Một đại biểu bên phe kia đề nghị: bạn bỏ phiếu cho ngôi trường bên khu ông ấy, ông ấy bỏ phiếu cho hệ thống cống bên khu bạn. Không ai cần biết.", [
    C("Bắt tay, không ai cần biết", { flags: ["politician_logroll"], counters: { ctg_debt: 1 }, rel: 1 }, "Khu bạn có cống, bạn có thêm một món nợ ngầm"),
    C("Từ chối, mỗi lá phiếu theo lương tâm", { counters: { ctg_trust: 1 }, happy: -1 }, "Thẳng thắn, khu bạn chưa có cống"),
    C("Đề xuất cùng đứng tên một gói chung, công khai", { agency: 0.02, gamble: { p: 0.5, win: { counters: { ctg_trust: 2 }, flags: ["politician_cross_party"], log: "Gói chung được thông qua. Hai phe chụp chung một tấm ảnh hiếm hoi." }, lose: { log: "Phe ông ấy không cho. Cả hai khu đều phải chờ." } } }, "Biến đổi chác ngầm thành thỏa thuận công khai", { tier: "sovereign" })], 1)),
  daily(PO, "ctg_threat", [30, 75], 8, (c) => T("Thư đe dọa không ký tên", vary("ctgt", c.age, ["Lá thư thứ ba trong tháng: không ký tên, biết cả trường con bạn đang học.", "Có người sơn chữ lên cổng nhà bạn trong đêm, sau phiên họp về bãi rác."]), [
    C("Thuê bảo vệ riêng", { money: -0.1, bw: 2, flags: ["politician_guarded"] }, "An toàn hơn, xa dân hơn"),
    C("Báo cảnh sát, đi tiếp như cũ", { bw: -4, counters: { ctg_trust: 1 } }, "Giữ hình ảnh, gia đình lo sợ"),
    C("Lùi khỏi vấn đề đang theo đuổi", { counters: { ctg_trust: -2 }, happy: -2, rel: 2 }, "Nhà yên, người ủng hộ thất vọng")], 1)),
  daily(PO, "ctg_junket", [30, 70], 9, () => T("Chuyến khảo sát năm sao", "Một tập đoàn mời đoàn hội đồng đi khảo sát mô hình ở nước ngoài mười ngày, khách sạn năm sao, có cả vé cho người nhà. Lịch trình chỉ có hai buổi làm việc.", [
    C("Đi cùng cả nhà", { happy: 4, rel: 2, counters: { ctg_debt: 1 }, flags: ["politician_junket"] }, "Một kỳ nghỉ đẹp, một món nợ"),
    C("Từ chối", { counters: { ctg_trust: 1 }, rel: -1 }, "Sạch, bị đồng nghiệp coi là làm màu"),
    C("Đi, tự trả vé, công bố lịch làm việc", { money: -0.1, counters: { ctg_trust: 1 }, know: 2 }, "Tốn tiền, đi mà không nợ ai", { tier: "awakened" })], 1)),
  daily(PO, "ctg_debate", [30, 75], 8, (c) => T("Tranh luận trực tiếp trên sóng", `Trong buổi tranh luận trực tiếp, đối thủ nhắc đến ${c.married ? "chuyện hôn nhân của bạn" : "món nợ cũ của gia đình bạn"} thay vì trả lời câu hỏi về giá nước. Máy quay chĩa thẳng vào mặt bạn.`, [
    C("Đáp trả bằng chuyện đời tư của họ", { gamble: { p: 0.5, win: { counters: { ctg_trust: 1 }, log: "Khán giả trường quay cười ồ. Đoạn ấy được chia sẻ nhiều nhất." }, lose: { counters: { ctg_trust: -2 }, log: "Cả hai bị chê như nhau. Không ai còn nhớ giá nước." } } }, "Gỡ thế, kéo cả buổi tranh luận xuống thấp"),
    C("Bỏ qua, quay về chuyện giá nước", { counters: { ctg_trust: 1 }, happy: -2 }, "Đứng đắn, trông như bị đánh trúng"),
    C("Đưa bảng số liệu ra, hỏi ngược lại", { know: 1, flags: ["politician_data"], gamble: { p: 0.6, win: { counters: { ctg_trust: 2 }, log: "Đối thủ không trả lời được." }, lose: { log: "Bảng số liệu quá dài, người xem chuyển kênh." } } }, "Thuyết phục người nghe kỹ, mất người nghe vội", { tier: "awakened" })], 1)),
  daily(PO, "ctg_water", [30, 75], 9, () => T("Đường ống năm mươi năm tuổi", "Đường ống nước của thành phố đã năm mươi năm tuổi, mỗi ngày rò mất gần một phần ba lượng nước. Muốn thay thì phải tăng giá nước. Thăm dò cho thấy bảy phần mười cử tri phản đối.", [
    C("Gác đề xuất, để nhiệm kỳ sau", { counters: { ctg_trust: 1 }, flags: ["politician_kicked_can"] }, "Được lòng bây giờ, ống vẫn rò"),
    C("Đẩy đề xuất bằng mọi giá", { counters: { ctg_trust: -2 }, flags: ["politician_pipes"], income_mult: 1.05 }, "Có ống mới, mất phiếu"),
    C("Tăng theo bậc, nhà dùng ít được miễn", { counters: { ctg_trust: -1 }, bw: -4, flags: ["politician_pipes"], agency: 0.02 }, "Rắc rối hơn, công bằng hơn", { tier: "sovereign" })], 0)),
  daily(PO, "ctg_tired", [35, 75], 99, () => T("Lời mời của trường đại học", "Ba năm rồi bạn không có một bữa tối trọn vẹn với gia đình. Một trường đại học mời bạn về dạy chính sách công: lương thấp hơn, không ai gọi điện lúc nửa đêm.", [
    C("Nhận lời, rời chính trường", { ...leave(PO), flags: ["ex_politician"], happy: 4, rel: 3 }, "Bình yên, bỏ lại cử tri giữa chừng"),
    C("Ở lại", { counters: { ctg_trust: 1 }, health: -2 }, "Giữ ghế, trả bằng sức khỏe")], 1), (c) => c.happy < 50 || c.bandwidth < 40),

  /* ---------- gia đình ---------- */
  cross(PO, "ctg_family", [30, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse"), (c, N) => { const k = role(c, "child");
    if (c.kids_teen > 0 && k) return T(`Ảnh của ${N(k)} trên báo`, `Một trang tin đăng ảnh ${N(k)} say xỉn ở một bữa tiệc, kèm dòng tít "Con nhà đại biểu". ${N(k)} đã ba ngày không ra khỏi phòng.`, [
      C("Họp báo, xin cho con được yên", { trust: { npc: k, delta: 0.2 }, gamble: { p: 0.5, win: { counters: { ctg_trust: 1 }, log: "Báo chí thôi đăng. Có người viết thư cảm ơn bạn đã nói thay các phụ huynh." }, lose: { counters: { ctg_trust: -1 }, log: "Buổi họp báo thành tin thứ hai về con bạn." } } }, "Che cho con, đem chuyện nhà ra trước máy quay"),
      C("Im lặng, để chuyện tự lắng", { trust: { npc: k, delta: -0.15 }, bw: -2 }, "Không thêm dầu vào lửa, con thấy bị bỏ mặc"),
      C("Tạm nghỉ ba tháng, ở nhà với con", { trust: { npc: k, delta: 0.3 }, income_mult: 0.9, counters: { ctg_trust: -1 } }, "Con có bố mẹ bên cạnh, ghế có người dòm ngó", { tier: "awakened" })], 2, { npc: k });
    const s = role(c, "spouse")!;
    return T("Hai mươi chín buổi tối vắng nhà", `${N(s)} đặt lên bàn lịch làm việc của bạn tháng qua: hai mươi chín buổi tối có việc ngoài giờ. "Hoặc bớt đi, hoặc mình phải nói chuyện nghiêm túc."`, [
      C("Cắt bớt một nửa lịch", { trust: { npc: s, delta: 0.25 }, counters: { ctg_trust: -1 } }, "Nhà ấm lại, cử tri thấy bạn vắng"),
      C("Xin thêm một năm, hứa sau đó sẽ bớt", { promise: { to: s, what: "bớt một nửa lịch làm việc sau một năm", years: 1 }, trust: { npc: s, delta: -0.05 } }, "Kéo dài thời gian, một lời hứa phải giữ"),
      C("Nói thẳng là không bớt được", { trust: { npc: s, delta: -0.3 }, gamble: { p: 0.3, win: { custom: "spouse_leave", log: `${N(s)} dọn sang ở nhà người thân.` }, lose: { log: `${N(s)} không nói gì thêm, nhưng thôi đợi bạn về ăn tối.` } } }, "Giữ đà sự nghiệp, có thể mất gia đình")], 0, { npc: s }); }),

  /* ======================================================================
   * CẢNH SÁT (police) — tiền tố csa_
   * ==================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(CO, "csa_t_market", [12, 16], () => true, () => T("Kẻ móc túi ở chợ sáng", "Ở chợ sáng, bạn thấy một người đàn ông rút chiếc ví trong giỏ của bà bán rau. Bạn nhớ rõ áo anh ta màu gì, dép gì, rẽ vào ngõ nào. Bà bán rau vẫn chưa biết gì.", [
    C("Đuổi theo, hô người giúp", { flags: [talentFlag(CO)], counters: { talents_seen: 1 }, gamble: { p: 0.6, win: { happy: 4, log: "Người ta giữ được anh ta ở đầu ngõ. Bà bán rau dúi cho bạn một bó rau." }, lose: { health: -3, log: "Bạn ngã trầy đầu gối, anh ta chạy mất." } } }, "Can đảm, có thể bị thương"),
    C("Chạy đi báo bảo vệ chợ, tả lại thật kỹ", { flags: [talentFlag(CO)], counters: { talents_seen: 1 }, know: 1 }, "An toàn, chậm hơn một bước", { tier: "awakened" }),
    C("Coi như không thấy", { counters: { talents_seen: 1 }, happy: -1 })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(CO, "csa_d_academy", [18, 24], () => true, (c) => T("Kỳ tuyển sinh trường cảnh sát", `Trường cảnh sát tuyển sinh: thi viết, chạy ba nghìn mét, ${c.country === "VN" ? "xét lý lịch gia đình ba đời" : "kiểm tra lý lịch và phỏng vấn tâm lý"}. Cứ mười hai người dự thi thì một người đỗ.`, [
    C("Dự thi bằng sức mình", { counters: { doors_seen: 1 }, bw: -3, gamble: { p: 0.35, win: { ...become(CO), counters: { csa_clean: 1 }, log: "Bạn đỗ. Bộ cảnh phục đầu tiên rộng hơn một cỡ." }, lose: { happy: -3, log: "Bạn trượt ở vòng chạy, chậm mười bốn giây." } } }, "Đỗ thì vào nghề sạch sẽ, trượt thì làm lại từ đầu"),
    C("Dự thi, nhờ người 'gửi gắm' thêm", { ...become(CO), counters: { doors_seen: 1, csa_clean: -1 }, money: -0.5, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [4, 14], note: "chạy suất vào trường cảnh sát" } }, "Chắc đỗ, vào nghề với một món nợ"),
    C("Thôi, tìm việc khác", { counters: { doors_seen: 1 } })], 0)),
  door(CO, "csa_d_witness", [18, 30], () => true, () => T("Người làm chứng duy nhất", "Bạn là người duy nhất nhìn rõ mặt kẻ cướp tiệm điện thoại đầu phố, và bạn đã ra tòa làm chứng dù bị dọa. Điều tra viên phụ trách vụ án bảo bạn có con mắt của người trong nghề, và lực lượng đang tuyển cảnh sát khu vực.", [
    C("Nộp đơn làm cảnh sát khu vực", { ...become(CO), counters: { doors_seen: 1, csa_street: 1 } }, "Vào nghề, kẻ cướp đã biết mặt bạn"),
    C("Tình nguyện tuần tra đêm cuối tuần", { counters: { doors_seen: 1 }, flags: ["night_watch"], rel: 2, bw: -2 }, "Giúp được khu phố, giữ việc cũ"),
    C("Cảm ơn, quay về đời mình", { counters: { doors_seen: 1 } })], 0)),
  door(CO, "csa_d_wage", [18, 30], (c) => c.poor_country || c.scarcity || c.broke, (c, N) => { const m = role(c, "mother"); return T("Đồng lương tháng nào cũng có", `Nhà bạn đang nợ, việc thì bấp bênh. Ngành cảnh sát tuyển đợt lớn: lương thấp nhưng tháng nào cũng có, có chỗ ở tập thể, có bảo hiểm. Một người anh họ làm trong ngành bảo "lương thì ít, nhưng sống được", rồi nháy mắt.`, [
    C("Nộp đơn, vì gia đình", { ...become(CO), counters: { doors_seen: 1 }, flags: ["police_for_family"] }, "Có lương đều, cái nháy mắt kia vẫn đang chờ"),
    C("Nộp đơn, tự hứa không nhận đồng nào ngoài lương", { ...become(CO), counters: { doors_seen: 1, csa_clean: 2 }, happy: -1, ...(m ? { promise: { to: m, what: "làm cảnh sát không nhận đồng nào ngoài lương", years: 10 } } : {}) }, `Sạch sẽ, nghèo lâu hơn${m ? `, ${N(m)} giữ lời hứa ấy` : ""}`, { longterm: true }),
    C("Đi làm công nhân", { counters: { doors_seen: 1 }, money: 0.03 }, "Tiền nhanh hơn, không có gì chắc chắn")], 0); }),

  /* ---------- mạch truyện ---------- */
  beat(CO, 1, 1, (c, N) => { const b = role(c, "first_boss"); return T("Ca đêm đầu tiên", `Ca đêm đầu tiên, bạn đi cùng ${b ? `${N(b)}, một trung sĩ` : "một trung sĩ"} hai mươi năm trong nghề. Người ấy dừng một xe tải chở quá tải, nói chuyện với tài xế năm phút, rồi vẫy cho đi. Túi áo ngực của người ấy cộm lên một thứ gì đó.`, [
    C("Coi như không thấy", { counters: step(c, CO, { csa_clean: -1 }), flags: ["police_saw_nothing"], ...(b ? { trust: { npc: b, delta: 0.2 } } : {}) }, "Được đồng đội tin, bắt đầu một nếp"),
    C("Hỏi thẳng người ấy", { counters: step(c, CO, { csa_clean: 1 }), gamble: { p: 0.5, win: { log: `Người ấy cười: "Rồi sẽ hiểu thôi." Từ hôm đó, không làm thế khi có bạn.` }, lose: { bw: -3, log: "Tuần sau bạn bị chuyển sang trực kho tang vật." } } }, "Giữ mình, có thể bị cô lập"),
    C("Báo cáo lên đội trưởng", { counters: step(c, CO, { csa_clean: 2 }), flags: ["police_reported_partner"], ...(b ? { memory: { npc: b, tag: "BETRAYED_PARTNERSHIP", weight: -0.3, note: "báo cáo chuyện xe tải trong ca đêm đầu tiên" } } : {}) }, "Đúng luật, cả đội biết ai đã báo")], 0, b ? { npc: b } : {}); }, adult),
  beat(CO, 2, 3, (c) => T("Mười bảy vụ cướp giật ở chợ đêm", `Đội trưởng giao bạn chuỗi mười bảy vụ cướp giật ở khu chợ đêm, hạn một tháng. Cấp trên cần một cái tên trước buổi họp báo.${f(c, "police_reported_partner") ? " Không ai trong đội muốn đi cùng bạn." : ""}`, [
    C("Xin vào tổ hình sự, theo dấu cả băng", { counters: step(c, CO), income_mult: 1.3, health: -3, flags: ["police_detective"], gamble: { p: 0.6, win: { flags: ["police_big_bust"], log: "Cả băng bị bắt trong một đêm mưa. Tên bạn lên bản tin." }, lose: { health: -5, log: "Bạn bị thương ở tay trong lúc vây bắt. Băng ấy dạt sang quận khác." } } }, "Lên nhanh, nguy hiểm"),
    C("Đi từng sạp hàng, làm quen cả khu chợ", { counters: step(c, CO, { csa_street: 2 }), bw: -4, income_mult: 1.1, flags: ["police_beat_cop"] }, "Chậm, người dân tin bạn"),
    C("Ép một nghi phạm nhỏ nhận hết cho kịp hạn", { counters: step(c, CO, { csa_clean: -2 }), income_mult: 1.4, flags: ["police_coerced"], secret: { tag: "FORGED_PAPERS", severity: 0.55, fuse_years: [4, 12], note: "lời khai bị ép trong vụ cướp giật chợ đêm" } }, "Kịp hạn, có thể bắt nhầm người")], 1), adult),
  beat(CO, 3, 4, (c) => { const prior = f(c, "police_saw_nothing") ? ` Ông trung sĩ năm nào giờ là phó đội, chỉ nói: "Lần này cũng thế thôi."` : f(c, "police_reported_partner") ? " Cả đội nhìn bạn, chờ xem lần này bạn làm gì." : "";
    return T("Biên bản lúc hai giờ sáng", `Một chiếc xe sang tông chết một người bán hàng rong lúc hai giờ sáng. Người cầm lái là con trai một nhân vật có thế lực. Sáng hôm sau, bạn được yêu cầu viết lại biên bản hiện trường: người lái thành "tài xế riêng".${prior}`, [
      C("Viết lại biên bản", { counters: step(c, CO, { csa_clean: -3 }), income_mult: 1.3, flags: ["police_cover_up"], secret: { tag: "FORGED_PAPERS", severity: 0.7, fuse_years: [3, 10], note: "viết lại biên bản vụ xe tông người bán hàng rong" } }, "Được che chở, ôm một bí mật nặng"),
      C("Giữ nguyên biên bản, ký tên mình", { counters: step(c, CO, { csa_clean: 2 }), flags: ["police_held_report"], gamble: { p: 0.5, win: { counters: { csa_street: 1 }, log: "Hồ sơ đi tiếp. Người lái thật phải ra tòa." }, lose: { income_mult: 0.8, log: "Hồ sơ của bạn bị 'thất lạc'. Tháng sau bạn bị điều về một đồn ở vùng xa." } } }, "Giữ lương tâm, mất đường thăng tiến"),
      C("Gửi bản sao biên bản cho gia đình nạn nhân", { counters: step(c, CO), agency: 0.03, flags: ["police_leaked_truth"], gamble: { p: 0.45, win: { counters: { csa_street: 3 }, log: "Gia đình nạn nhân có luật sư. Vụ án được điều tra lại từ đầu." }, lose: { income_mult: 0.6, close_doors: ["clean_record"], log: "Bạn bị đình chỉ vì làm lộ tài liệu, nhưng vụ án vẫn được điều tra lại." } } }, "Sự thật đến được người cần, bạn trả giá", { tier: "sovereign" }),
      C("Nộp đơn xin ra khỏi ngành", { counters: step(c, CO), ...leave(CO), flags: ["ex_police"], happy: -3 }, "Không dính tay, mất cái nghề đã chọn")], 1); }, adult),
  beat(CO, 4, 5, (c) => {
    const coerced = f(c, "police_coerced"); const cover = f(c, "police_cover_up");
    if (coerced || cover) return T(coerced ? "Người ngồi tù thay" : "Đoạn phim từ quán bên đường", coerced
      ? `Một luật sư trẻ chứng minh được người thanh niên nhận tội trong vụ cướp giật chợ đêm năm ấy vô tội. Anh ta đã ngồi tù sáu năm. Cuộc điều tra đang lần ngược về người lấy lời khai: bạn.${cover ? " Và đó chưa phải bí mật duy nhất của bạn." : ""}`
      : "Một đoạn phim từ camera của quán ăn đối diện, quay đêm chiếc xe sang tông người bán hàng rong, xuất hiện trên mạng. Khuôn mặt người cầm lái hiện rõ. Biên bản có chữ ký của bạn.", [
      C("Khai nhận tất cả", { counters: step(c, CO, { csa_clean: 3 }), ...leave(CO), custom: "job_lose|apologize", close_doors: ["clean_record"], flags: ["police_confessed"], happy: 2 }, "Mất nghề và lý lịch, gỡ được một nút thắt"),
      C("Im lặng, dựa vào cấp trên", { counters: step(c, CO), gamble: { p: 0.5, win: { income_mult: 1.1, flags: ["police_protected"], log: "Cấp trên đứng ra che. Bạn được chuyển sang một phòng hành chính." }, lose: { ...leave(CO), close_doors: ["clean_record"], log: "Cấp trên lo giữ mình trước. Bạn bị khởi tố một mình." } } }, "Có thể thoát, có thể bị bỏ rơi"),
      C("Xin nghỉ hưu sớm trước khi họ tới", { counters: step(c, CO), ...leave(CO), money: -0.3, flags: ["ex_police"] }, "Rút êm, câu chuyện chưa kết thúc")], 1);
    return T("Chiếc ghế đồn trưởng", `Bạn được đề bạt làm đồn trưởng. ${cnt(c, "csa_street") >= 2 ? "Người dân khu chợ gửi thư đề nghị giữ bạn ở lại khu cũ." : "Bạn được chọn nơi về: đồn trung tâm hay đồn khu ven."}${f(c, "police_held_report") || f(c, "police_leaked_truth") ? " Ai trong ngành cũng biết bạn là người không viết lại biên bản năm ấy." : ""}`, [
      C("Về đồn trung tâm, nơi dễ lên tiếp", { counters: step(c, CO), income_mult: 1.4, flags: ["police_chief"] }, "Lên nhanh, xa những người quen bạn"),
      C("Ở lại đồn khu cũ", { counters: step(c, CO, { csa_street: 2 }), income_mult: 1.15, flags: ["police_chief"], happy: 3 }, "Ít quyền, gần dân"),
      C("Nhận ghế, đòi ghi hình mọi buổi lấy lời khai", { counters: step(c, CO, { csa_clean: 1 }), flags: ["police_chief", "police_recorded_interviews"], agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.2, log: "Đồn bạn được chọn làm thí điểm. Số đơn khiếu nại giảm một nửa." }, lose: { income_mult: 1.05, log: "Cấp trên duyệt, nhưng camera hỏng ba tháng không ai sửa." } } }, "Đổi luật chơi của cả đồn, có người không vui", { tier: "sovereign" })], 1); }, adult),
  beat(CO, 5, 6, (c) => { const cover = f(c, "police_cover_up") && !f(c, "police_confessed");
    return T("Ngăn kéo cuối cùng", `Ngày cuối trước khi nghỉ hưu, bạn dọn ngăn kéo và thấy tập hồ sơ một vụ mất tích chưa giải quyết từ mười một năm trước. ${cover ? "Bên dưới là bản nháp biên bản vụ xe tông năm ấy, viết bằng tay bạn." : "Một cảnh sát trẻ đứng ở cửa, xin bạn một lời khuyên."}`, [
      C("Ở lại thêm một năm, lật lại vụ cũ", { counters: step(c, CO), bw: -5, flags: ["police_cold_case"], gamble: { p: 0.35, win: { happy: 6, log: "Người mất tích được tìm thấy, còn sống, ở một thành phố khác." }, lose: { happy: -2, log: "Vụ án vẫn khép. Bạn để lại sổ ghi chép cho người sau." } } }, "Thêm một năm mệt, có thể gỡ một nỗi day dứt"),
      C("Trao hồ sơ và sổ tay cho cảnh sát trẻ", { counters: step(c, CO), flags: ["passed_on"], rel: 3 }, "Để lại nghề cho người sau, buông tay khỏi vụ án"),
      C(cover ? "Đến gặp gia đình người bán hàng rong" : "Nghỉ hưu, về đi câu cá", cover ? { counters: step(c, CO), custom: "apologize", happy: 2, rel: 1 } : { counters: step(c, CO), happy: 5, health: 2 }, cover ? "Nói ra sự thật muộn màng, không biết họ đón thế nào" : "Bình yên, vụ án ở lại trong ngăn kéo")], 1); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(CO, "csa_checkpoint", [19, 60], 6, (c) => T("Chốt kiểm tra lúc nửa đêm", vary("csac", c.age, ["Một tài xế vượt đèn đỏ, chìa ra tấm bằng lái kẹp sẵn một tờ tiền gấp tư.", "Một thanh niên say rượu bị giữ xe. Mẹ cậu chạy đến xin cho con về, giúi vào tay bạn một nắm tiền nhàu."]), [
    C("Nhận, cho đi", { money: 0.03, counters: { csa_clean: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.15, fuse_years: [2, 8], note: "nhận tiền ở chốt kiểm tra đêm" } }, "Thêm chút tiền, thêm một vết"),
    C("Lập biên bản đúng luật", { counters: { csa_clean: 1 }, bw: -1 }, "Sạch, bị chửi"),
    C("Trả tiền lại, nhắc nhở rồi cho về", { counters: { csa_street: 1 } }, "Mềm mỏng, luật bị uốn một chút")], 1)),
  daily(CO, "csa_nightcall", [19, 60], 7, () => T("Tiếng đổ vỡ ở tầng bốn", "Hai giờ sáng, hàng xóm gọi báo có tiếng đổ vỡ ở một căn hộ tầng bốn. Người phụ nữ mở cửa, mắt sưng, nói mình bị ngã. Người chồng đứng phía sau, mỉm cười, mời bạn vào uống nước.", [
    C("Tách hai người ra, lập hồ sơ", { bw: -4, counters: { csa_street: 1 }, flags: ["police_dv_case"], gamble: { p: 0.6, win: { log: "Ba tháng sau, chị ấy đến đồn tự nộp đơn, có em gái đi cùng." }, lose: { log: "Chị ấy rút lời khai ngay sáng hôm sau." } } }, "Mất cả đêm, có thể mở ra một lối thoát"),
    C("Nhắc nhở rồi về, chuyện nhà người ta", { bw: 2, counters: { csa_clean: -1 } }, "Nhanh, có thể có lần sau tệ hơn"),
    C("Để lại số đường dây hỗ trợ, ba ngày sau quay lại", { bw: -2, flags: ["police_dv_followup"], counters: { csa_street: 1 } }, "Chậm mà chắc, phải nhớ quay lại", { tier: "awakened" })], 0)),
  daily(CO, "csa_clip", [20, 60], 8, () => T("Mười lăm giây khóa tay", "Một người qua đường quay cảnh bạn khóa tay một người đàn ông say xỉn. Đoạn phim mười lăm giây, không có đoạn ông ta vung chai trước đó, đã có nửa triệu lượt xem.", [
    C("Xin công bố đoạn phim từ camera đeo người", { gamble: { p: 0.5, win: { counters: { csa_street: 1 }, log: "Bản đầy đủ được công bố. Bình luận đổi chiều." }, lose: { bw: -3, log: "Cấp trên không cho công bố. Bạn tạm thời ngồi bàn giấy." } } }, "Có thể minh oan, có thể bị giam ở bàn giấy"),
    C("Im lặng, chờ chuyện qua", { happy: -3, counters: { csa_street: -1 } }, "Không thêm rắc rối, tiếng xấu ở lại"),
    C("Tìm gặp người quay phim, ngồi nói chuyện", { counters: { csa_street: 1 }, flags: ["police_talked_filmer"], bw: -2 }, "Mất buổi chiều, có thể đổi được một người", { tier: "awakened" })], 1)),
  daily(CO, "csa_informant", [22, 60], 8, () => T("Người báo tin", "Một tay buôn nhỏ trong khu đề nghị: anh ta báo trước cho bạn mọi băng lớn, đổi lại bạn để yên chỗ làm ăn của anh ta. Tháng trước, tin của anh ta giúp bạn phá một vụ lớn.", [
    C("Giữ thỏa thuận", { counters: { csa_clean: -1 }, income_mult: 1.1, flags: ["police_informant"] }, "Phá được án lớn, nhắm mắt với án nhỏ"),
    C("Cắt đứt, bắt luôn anh ta", { counters: { csa_clean: 1 }, gamble: { p: 0.5, win: { log: "Anh ta nhận tội nhẹ. Bạn mất người báo tin." }, lose: { bw: -4, log: "Anh ta khai ra những lần gặp bạn. Bạn mất ba tháng giải trình." } } }, "Sạch sẽ, mất nguồn tin"),
    C("Giúp anh ta tìm việc khác, rút khỏi nghề cũ", { bw: -4, agency: 0.02, flags: ["police_turned_informant"], gamble: { p: 0.4, win: { counters: { csa_street: 2 }, log: "Anh ta mở một quán sửa xe. Thỉnh thoảng vẫn mời bạn ly trà." }, lose: { log: "Được hai tháng, anh ta quay lại nghề cũ." } } }, "Tốn công, có thể đổi được một đời người", { tier: "sovereign" })], 1)),
  daily(CO, "csa_oldfriend", [20, 60], 8, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Cái tên trong danh sách khám xét", `Danh sách nghi phạm của một đường dây cá độ có tên ${N(fr)}, người bạn từ thuở bé của bạn. Lệnh khám xét là sáu giờ sáng mai.`, [
    C("Gọi báo cho bạn trước một đêm", { trust: { npc: fr, delta: 0.3 }, counters: { csa_clean: -2 }, flags: ["police_tipped_friend"] }, "Giữ bạn cũ, phản bội đồng đội"),
    C("Xin rút khỏi vụ án", { counters: { csa_clean: 1 }, bw: -2 }, "Đúng quy tắc, không cứu được ai"),
    C("Làm đúng phận sự", { memory: { npc: fr, tag: "BETRAYED_PARTNERSHIP", weight: -0.4, note: "dẫn đoàn khám nhà lúc sáu giờ sáng" }, counters: { csa_clean: 1 } }, "Giữ nghề, mất người bạn")], 1, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(CO, "csa_runaway", [20, 60], 9, () => T("Cậu bé ngủ ở bến xe", "Một cậu bé mười bốn tuổi bị đưa về đồn vì ngủ ở bến xe. Cậu không chịu nói địa chỉ, chỉ nói không muốn về nhà. Theo quy trình, sáng mai gọi người nhà đến đón.", [
    C("Làm theo quy trình, gọi người nhà", { bw: 1 }, "Đúng việc, không biết về nhà cậu sẽ ra sao"),
    C("Mua cho cậu bát mì, ngồi nghe cậu kể", { bw: -2, happy: 2, flags: ["police_listened_kid"], counters: { csa_street: 1 } }, "Mất giờ nghỉ, có thể hiểu vì sao cậu bỏ đi", { tier: "awakened" }),
    C("Gọi nhân viên bảo vệ trẻ em đến", { bw: -3, flags: ["police_called_social"] }, "Thêm thủ tục, cậu có người theo dõi lâu dài")], 1)),
  daily(CO, "csa_knife", [20, 55], 8, () => T("Người cầm dao giữa chợ", "Giữa trưa, một người đàn ông cầm con dao gọt hoa quả đứng giữa chợ, la hét rằng ai cũng đang theo dõi mình. Đám đông lùi ra thành một vòng tròn. Tay bạn đặt trên bao súng.", [
    C("Bỏ tay khỏi bao súng, đứng xa nói chuyện", { counters: { csa_street: 2 }, gamble: { p: 0.65, win: { flags: ["police_talked_down"], log: "Sau hai mươi phút, ông ta đặt con dao xuống và ngồi khóc." }, lose: { health: -6, log: "Ông ta lao tới. Bạn bị thương ở cánh tay trước khi đồng đội giữ được ông ta." } } }, "Có thể cứu một người bệnh, có thể bị thương"),
    C("Rút súng, ra lệnh buông dao", { flags: ["police_drew_gun"], gamble: { p: 0.8, win: { counters: { csa_street: -1 }, log: "Ông ta buông dao. Đoạn phim bạn chĩa súng vào một người bệnh lan khắp mạng." }, lose: { happy: -10, counters: { csa_street: -2 }, log: "Ông ta không buông. Phát súng hôm ấy theo bạn suốt nhiều năm." } } }, "Nhanh, có điều không bao giờ rút lại được"),
    C("Giữ vòng vây, chờ đội y tế tâm thần", { bw: -3, gamble: { p: 0.5, win: { counters: { csa_street: 1 }, log: "Đội y tế đến sau bốn mươi phút. Không ai bị thương." }, lose: { counters: { csa_street: -1 }, log: "Đội y tế không đến. Một người bán hàng bị thương nhẹ khi đám đông xô đẩy." } } }, "An toàn cho ông ta, đám đông mất kiên nhẫn")], 0)),
  daily(CO, "csa_shift", [20, 60], 7, (c) => T("Giấc ngủ của người trực đêm", vary("csas", c.age, ["Tháng này bạn trực đêm mười tám ca. Sáng nào về cũng thấy con đã đi học.", "Ba năm trực đêm, bạn ngủ bốn tiếng một ngày và quên mất lần cuối mình ăn tối cùng cả nhà."]), [
    C("Nhận thêm ca để có tiền làm thêm giờ", { money: 0.06, health: -4, rel: -2, flags: ["police_overtime"] }, "Thêm tiền, cơ thể trả giá"),
    C("Xin chuyển sang ca ngày", { income_mult: 0.95, health: 2, rel: 2, flags: ["police_day_shift"] }, "Bớt tiền, có bữa tối"),
    C("Gặp chuyên viên tâm lý của ngành", { bw: 4, flags: ["police_counsel"] }, "Bị đồng nghiệp trêu, đầu óc nhẹ đi", { tier: "awakened" })], 0)),
  daily(CO, "csa_petition", [22, 60], 9, (c, N) => { const b = role(c, "first_boss"); return T("Lá đơn đòi tiền trực", `Tiền trực đêm đã nửa năm không được trả. Vài đồng nghiệp soạn một lá đơn tập thể và cần chữ ký thứ mười. ${c.poor_country ? "Ở đây, ai đứng tên trong đơn thường bị điều đi xa." : "Người đứng đầu lá đơn lần trước bị chuyển sang trực kho."}`, [
    C("Ký tên", { flags: ["police_signed_petition"], gamble: { p: 0.5, win: { money: 0.06, log: "Tiền trực được trả đủ sau hai tháng." }, lose: { income_mult: 0.95, log: "Tiền được trả, còn bạn bị chuyển sang một đồn xa hơn." } } }, "Đòi quyền lợi, có thể bị trù dập"),
    C("Không ký, chờ người khác đòi", { happy: -1 }, "An toàn, tiền về thì vẫn nhận"),
    C(`Gặp riêng ${b ? N(b) : "cấp trên"}, nói thay cả nhóm`, { bw: -2, flags: ["police_spoke_for_squad"], ...(b ? { trust: { npc: b, delta: -0.1 } } : {}), gamble: { p: 0.45, win: { money: 0.06, log: "Tiền về trong tháng. Không ai bị điều đi." }, lose: { log: "Cấp trên hứa sẽ xem xét. Tiền vẫn chưa về." } } }, "Không ai phải đứng tên, bạn thành người bị nhớ mặt", { tier: "awakened" })], 1, b ? { npc: b } : {}); }),
  daily(CO, "csa_private", [25, 60], 99, () => T("Bộ cảnh phục bạc màu", "Một công ty an ninh tư nhân mời bạn làm trưởng ca, lương gấp đôi, không trực đêm, không ai quay phim bạn. Bộ cảnh phục treo trong tủ đã bạc màu ở hai vai.", [
    C("Cởi cảnh phục, sang làm an ninh tư", { unflags: [life(CO)], custom: "become:security_guard", flags: ["ex_police"], money: 0.1 }, "Đời dễ thở hơn, không còn là cảnh sát"),
    C("Ở lại ngành", { counters: { csa_street: 1 }, happy: -1 }, "Giữ nghề, giữ luôn cái khó")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(CO, "csa_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "spouse") || !!role(c, "mother"), (c, N) => { const k = role(c, "child"); const s = role(c, "spouse");
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị cả lớp quay lưng`, `Sau khi bạn bắt bố của một bạn cùng lớp, ${N(k)} bị cả lớp gọi là "con cớm" và không ai ngồi cùng bàn. Hôm nay ${N(k)} về nhà với chiếc cặp bị rạch.`, [
      C("Đến trường gặp thầy cô và phụ huynh", { trust: { npc: k, delta: 0.2 }, bw: -3, gamble: { p: 0.5, win: { log: "Buổi gặp êm hơn bạn nghĩ. Bố mẹ đứa bạn kia cũng không muốn con mình mang tiếng." }, lose: { trust: { npc: k, delta: -0.1 }, log: "Buổi gặp thành cãi vã. Ngày hôm sau cả trường biết chuyện." } } }, "Bảo vệ con, có thể làm to chuyện"),
      C("Dạy con mặc kệ, nghề của bố mẹ là thế", { trust: { npc: k, delta: -0.2 } }, "Không làm to chuyện, con thấy cô đơn"),
      C("Xin cho con chuyển trường", { money: -0.05, trust: { npc: k, delta: 0.1 }, flags: ["police_kid_moved"] }, "Con được yên, mất bạn bè cũ")], 0, { npc: k });
    if (s) return T("Chiếc điện thoại không bao giờ tắt", `${N(s)} không ngủ được những đêm bạn trực. Sau vụ một đồng nghiệp của bạn bị thương, ${N(s)} nói: "Chuyển sang làm văn phòng đi, hoặc mình phải nói chuyện."`, [
      C("Xin chuyển sang làm văn phòng", { trust: { npc: s, delta: 0.3 }, income_mult: 0.9, flags: ["police_desk"] }, "Nhà yên, bạn nhớ đường phố"),
      C("Hứa năm năm nữa sẽ chuyển", { promise: { to: s, what: "chuyển sang làm văn phòng sau năm năm", years: 5 }, trust: { npc: s, delta: 0.05 } }, "Kéo dài thời gian, một lời hứa phải giữ"),
      C("Giải thích rằng đây là nghề bạn đã chọn", { trust: { npc: s, delta: -0.2 }, happy: 1 }, "Giữ nghề, khoảng cách lớn dần")], 0, { npc: s });
    const m = role(c, "mother")!;
    return T("Bản tin lúc bảy giờ tối", `${N(m)} xem bản tin thời sự mỗi tối chỉ để chắc không có tin cảnh sát nào bị thương. Mỗi lần bạn quên gọi điện, ${N(m)} thức đến sáng.`, [
      C("Gọi điện sau mỗi ca trực", { trust: { npc: m, delta: 0.2 }, bw: -1, promise: { to: m, what: "gọi điện báo bình an sau mỗi ca trực", years: 3 } }, "Mẹ yên lòng, thêm một việc phải nhớ"),
      C("Bảo mẹ đừng xem tin nữa", { trust: { npc: m, delta: -0.1 } }, "Nhẹ việc cho bạn, mẹ vẫn lo"),
      C("Đưa mẹ đến thăm đồn một lần", { trust: { npc: m, delta: 0.25 }, happy: 2, bw: -2 }, "Mất một ngày nghỉ, mẹ biết bạn làm việc ở đâu", { tier: "awakened" })], 0, { npc: m }); }),

  /* ======================================================================
   * QUÂN NHÂN (soldier) — tiền tố qnh_
   * ==================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(SO, "qnh_t_trail", [10, 15], () => true, (c) => T("Bốn cây số mỗi sáng", `Mỗi sáng bạn đi bộ bốn cây số đến trường${c.poor_country ? ", mùa mưa lội qua một đoạn suối" : ", kể cả những hôm mưa lạnh hay gió lớn"}. Năm nay có giải chạy việt dã toàn vùng. Thầy thể dục bảo sức bền của bạn hiếm thấy.`, [
    C("Tập chạy mỗi sáng, dự giải", { flags: [talentFlag(SO)], counters: { talents_seen: 1 }, health: 3, bw: -2 }, "Mệt, rèn được sức bền và kỷ luật"),
    C("Vào đội hướng đạo, học đọc bản đồ", { flags: [talentFlag(SO)], counters: { talents_seen: 1 }, money: -0.02, know: 2 }, "Tốn chút tiền, học sống ngoài trời"),
    C("Đi học như thường, không thi", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SO, "qnh_d_call", [18, 25], () => true, (c) => c.country === "VN"
    ? T("Giấy gọi nhập ngũ", "Giấy gọi nhập ngũ dán ở nhà văn hóa, có tên bạn. Khám sức khỏe đạt loại một. Có người trong xóm bảo 'lo' được cho khỏi đi, giá bằng ba tháng thu nhập của cả nhà.", [
      C("Lên đường", { ...become(SO), counters: { doors_seen: 1 }, rel: -2 }, "Mấy năm xa nhà, trở về khác đi"),
      C("Nhờ người 'lo' cho khỏi đi", { counters: { doors_seen: 1 }, money: -0.25, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 12], note: "chạy để khỏi đi nghĩa vụ" } }, "Ở nhà, mang một bí mật"),
      C("Xin hoãn để đi học tiếp", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { know: 2, log: "Bạn được hoãn vì đang theo học." }, lose: { ...become(SO), log: "Đơn xin hoãn bị bác. Bạn lên đường cùng đợt." } } }, "Có thể được hoãn, có thể vẫn phải đi")], 0)
    : T("Văn phòng tuyển quân cạnh bến xe", "Văn phòng tuyển quân mở ngay cạnh bến xe: hợp đồng bốn năm, lương đều, học bổng sau khi ra quân, bảo hiểm cho cả nhà. Người tuyển quân nói chuyện rất hay và không nhắc đến chữ 'chiến sự'.", [
      C("Ký hợp đồng bốn năm", { ...become(SO), counters: { doors_seen: 1 }, money: 0.05 }, "Lương đều, bốn năm không thuộc về mình"),
      C("Đọc kỹ điều khoản rồi mới ký", { counters: { doors_seen: 1 }, know: 1, gamble: { p: 0.5, win: { ...become(SO), flags: ["soldier_trade_clause"], log: "Bạn đòi được suất học nghề kỹ thuật ghi vào hợp đồng." }, lose: { log: "Người tuyển quân mất kiên nhẫn. Đợt tuyển đóng lại." } } }, "Có thể được điều khoản tốt hơn, có thể lỡ đợt", { tier: "awakened" }),
      C("Không ký", { counters: { doors_seen: 1 } })], 0)),
  door(SO, "qnh_d_flood", [18, 30], () => true, () => T("Người lính trên chiếc xuồng", "Năm ấy nước lên tới mái nhà. Người kéo cả nhà bạn lên xuồng là một trung sĩ chưa tới hai mươi lăm tuổi, ướt sũng, hai ngày chưa ngủ. Khi nước rút, bạn đứng rất lâu trước bảng tuyển quân.", [
    C("Ghi danh nhập ngũ", { ...become(SO), counters: { doors_seen: 1 }, flags: ["soldier_flood_debt"] }, "Trả ơn bằng cả tuổi trẻ"),
    C("Vào đội cứu hộ tình nguyện của vùng", { counters: { doors_seen: 1 }, flags: ["rescue_volunteer"], rel: 2, bw: -2 }, "Giúp được người, giữ đời dân sự"),
    C("Ở nhà dựng lại nhà cửa", { counters: { doors_seen: 1 }, money: -0.05, rel: 1 }, "Lo cho nhà mình trước, cánh cửa kia khép lại")], 0)),
  door(SO, "qnh_d_bread", [18, 28], (c) => c.poor_country || c.broke || c.scarcity, () => T("Ba bữa ăn và đôi ủng mới", "Quê bạn không có việc. Quân đội trả lương đều, cho ăn ba bữa, phát đôi ủng mới, và dạy lái xe tải. Đêm trước ngày đi, cả nhà không ai nói gì, chỉ lặng lẽ gói cho bạn một túi đồ khô.", [
    C("Nhập ngũ, gửi lương về nhà", { ...become(SO), counters: { doors_seen: 1 }, flags: ["soldier_sends_home"], happy: -1 }, "Nhà đỡ đói, bạn đi xa"),
    C("Lên thành phố làm thuê", { counters: { doors_seen: 1 }, money: 0.03 }, "Tự do, bấp bênh"),
    C("Ở lại quê, bám ruộng", { counters: { doors_seen: 1 }, rel: 2 }, "Gần nhà, nghèo như cũ")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(SO, 1, 1, (c) => T("Năm vòng chạy phạt", "Tháng thứ hai huấn luyện, trời ba mươi tám độ. Tiểu đội trưởng bắt cả tiểu đội chạy thêm năm vòng vì tân binh gầy nhất làm rơi súng. Cả tiểu đội bắt đầu nhìn tân binh ấy bằng ánh mắt khó chịu.", [
    C("Chạy cạnh, vác giúp ba lô", { counters: step(c, SO, { qnh_bond: 2 }), health: -3, flags: ["soldier_carried"] }, "Mệt gấp đôi, có một người bạn suốt đời"),
    C("Giữ sức, chạy cho xong phần mình", { counters: step(c, SO), health: 1 }, "An toàn, không ai nhớ đến bạn"),
    C("Báo lên cấp trên chuyện phạt cả tiểu đội", { counters: step(c, SO), gamble: { p: 0.5, win: { counters: { qnh_bond: 1 }, flags: ["soldier_spoke_up"], log: "Lệnh phạt tập thể bị bỏ. Tiểu đội trưởng lạnh nhạt với bạn ba tháng, rồi thôi." }, lose: { counters: { qnh_bond: -1 }, log: "Bạn bị gọi là kẻ mách lẻo. Năm vòng thành mười vòng." } } }, "Có thể đổi luật, có thể bị ghét", { tier: "sovereign" })], 0), adult),
  beat(SO, 2, 3, (c) => T("Ngã rẽ sau ba năm quân ngũ", `Ba năm trong quân ngũ, bạn được gọi lên ban chỉ huy. Có ba hướng: thi vào trường sĩ quan, xin vào đơn vị đặc nhiệm, hoặc học ngành công binh.${f(c, "soldier_carried") ? " Người tân binh bạn từng vác ba lô hỏi bạn chọn gì để chọn theo." : ""} Hợp đồng của bạn cũng sắp hết hạn.`, [
    C("Thi trường sĩ quan", { counters: step(c, SO), bw: -4, gamble: { p: 0.55, win: { income_mult: 1.3, flags: ["soldier_officer"], log: "Bạn đỗ. Hai năm sau, cầu vai có thêm một ngôi sao." }, lose: { income_mult: 1.05, log: "Bạn trượt môn chiến thuật, ở lại đơn vị cũ." } } }, "Lên quân hàm, gánh nhiều trách nhiệm hơn"),
    C("Xin vào đơn vị đặc nhiệm", { counters: step(c, SO, { qnh_scar: 1, qnh_bond: 1 }), income_mult: 1.2, health: -4, flags: ["soldier_elite"] }, "Danh dự và phụ cấp, cơ thể trả giá"),
    C("Học công binh, có nghề cho mai sau", { counters: step(c, SO), know: 4, income_mult: 1.1, flags: ["soldier_engineer"] }, "Lên chậm, có nghề dùng được cả ngoài quân ngũ"),
    C("Hết hạn, ra quân về nhà", { counters: step(c, SO), ...leave(SO), flags: ["veteran"], rel: 3 }, "Về đời thường, bỏ lại đồng đội")], 0), adult),
  beat(SO, 3, 4, (c) => T("Bản tường trình về tân binh", `Đợt diễn tập giữa mùa nắng, một chiến sĩ trẻ ngã quỵ và không tỉnh lại. Đơn vị cần một bản tường trình ghi "chiến sĩ giấu bệnh tim". Bạn biết cậu ấy đã xin dừng hai lần và bị từ chối.${f(c, "soldier_officer") ? " Bạn là người ký thứ hai, ngay sau đại đội trưởng." : ""}${f(c, "soldier_carried") ? " Bạn nhớ mình từng vác ba lô cho một người như thế." : ""}`, [
    C("Ký bản tường trình", { counters: step(c, SO, { qnh_scar: 1 }), income_mult: 1.15, flags: ["soldier_signed_report"], secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 12], note: "ký tường trình sai về cái chết của chiến sĩ trẻ" } }, "Đơn vị yên, gia đình cậu ấy không biết sự thật"),
    C("Khai đúng sự thật với đoàn điều tra", { counters: step(c, SO), flags: ["soldier_testified"], gamble: { p: 0.5, win: { counters: { qnh_bond: 1 }, log: "Người chỉ huy bị kỷ luật. Mẹ của cậu ấy viết cho bạn một lá thư." }, lose: { income_mult: 0.85, counters: { qnh_bond: -2 }, log: "Lời khai của bạn bị gạt đi. Bạn bị chuyển đơn vị, mang tiếng không giữ nội bộ." } } }, "Đúng với người đã mất, có thể mất đồng đội"),
    C("Đề xuất lệnh dừng tập khi trời quá nắng", { counters: step(c, SO), agency: 0.03, flags: ["soldier_heat_rule"], gamble: { p: 0.4, win: { log: "Quy định được áp dụng cho cả sư đoàn. Không ai nhắc tên bạn, cũng không ai nhắc tên cậu ấy." }, lose: { counters: { qnh_bond: -1 }, log: "Đề xuất nằm trong ngăn kéo. Bạn bị coi là người lắm chuyện." } } }, "Cứu người sau, chưa trả lại công bằng cho người trước", { tier: "sovereign" }),
    C("Xin ra quân", { counters: step(c, SO, { qnh_scar: 1 }), ...leave(SO), flags: ["veteran"] }, "Rời đi, mang câu chuyện theo mình")], 1), adult),
  beat(SO, 4, 5, (c) => {
    if (f(c, "soldier_signed_report")) return T("Lá đơn của người mẹ", "Mẹ của chiến sĩ năm ấy đã gửi đơn đi khắp nơi suốt năm năm. Lá đơn vừa đến được một tờ báo lớn, và phóng viên đang tìm từng người đã ký bản tường trình. Tháng sau bạn có tên trong danh sách đề bạt.", [
      C("Đến gặp bà, kể sự thật", { counters: step(c, SO, { qnh_scar: -1 }), custom: "apologize", income_mult: 0.7, flags: ["soldier_told_mother"] }, "Mất cơ hội đề bạt, gỡ được nỗi day dứt"),
      C("Từ chối phỏng vấn, giữ im lặng", { counters: step(c, SO, { qnh_scar: 1 }), gamble: { p: 0.6, win: { income_mult: 1.3, log: "Bài báo chỉ nêu tên đại đội trưởng. Bạn được đề bạt đúng hạn." }, lose: { ...leave(SO), close_doors: ["clean_record"], log: "Bài báo có tên bạn. Bạn bị kỷ luật và buộc phải ra quân." } } }, "Có thể giữ đường lên, có thể mất tất cả"),
      C("Nộp đơn ra quân trước khi bài báo lên", { counters: step(c, SO), ...leave(SO), flags: ["veteran"], happy: -2 }, "Tránh bão, câu chuyện vẫn còn đó")], 1);
    const eng = f(c, "soldier_engineer");
    return T("Lệnh đi phái bộ", `Bạn được chọn dẫn một đơn vị đi làm nhiệm vụ gìn giữ hòa bình ở một nước xa, một năm. ${cnt(c, "qnh_bond") >= 2 ? "Nửa đơn vị cũ xin được đi theo bạn." : "Bạn chưa quen ai trong đơn vị mới."} ${eng ? "Bên dân sự, một công ty cầu đường mời bạn về làm kỹ sư trưởng." : "Ở nhà, người thân đếm từng ngày bạn về."}`, [
      C("Nhận lệnh đi phái bộ", { counters: step(c, SO, { qnh_bond: 1 }), income_mult: 1.4, rel: -4, flags: ["soldier_mission"], gamble: { p: 0.75, win: { log: "Một năm sau cả đơn vị về đủ người. Bạn được đề bạt." }, lose: { health: -10, counters: { qnh_scar: 2 }, log: "Một đêm đoàn xe trúng mìn. Bạn về nhà với một bên tai không còn nghe rõ." } } }, "Đỉnh cao của nghề, có thể không về nguyên vẹn"),
      C("Ở lại huấn luyện tân binh", { counters: step(c, SO, { qnh_bond: 2 }), income_mult: 1.1, happy: 2, flags: ["soldier_trainer"] }, "Lên chậm, những người lính trẻ học từ bạn"),
      C(eng ? "Chuyển sang dân sự làm kỹ sư cầu đường" : "Ra quân, về với gia đình", { counters: step(c, SO), ...leave(SO), flags: ["veteran"], ...(eng ? { money: 0.3 } : { rel: 4 }) }, eng ? "Lương cao hơn, rời xa đồng đội" : "Gia đình có bạn, cởi tấm áo lính")], 1); }, adult),
  beat(SO, 5, 6, (c) => { const haunted = f(c, "soldier_signed_report") && !f(c, "soldier_told_mother");
    return T("Buổi họp mặt đồng đội", `Hai mươi năm sau ngày nhập ngũ, đồng đội cũ họp mặt. ${cnt(c, "qnh_bond") >= 3 ? "Hơn ba mươi người đến, có người đi từ đầu kia đất nước." : "Chỉ có bảy người đến."} ${haunted ? "Không ai nhắc đến bản tường trình năm ấy, nhưng ai cũng nhớ." : f(c, "soldier_heat_rule") ? "Một người lính trẻ kể đơn vị cậu dừng tập vì nắng, theo một quy định không ai biết của ai." : "Có người mất việc, có người mất nhà, có người không ngủ được từ ngày ra quân."}`, [
      C("Lập quỹ giúp cựu binh khó khăn", { counters: step(c, SO), money: -0.2, flags: ["passed_on", "veteran_fund"], agency: 0.02, rel: 3 }, "Tốn tiền, giữ được tình đồng đội", { tier: "sovereign" }),
      C("Viết lại chuyện thời lính cho con cháu", { counters: step(c, SO), flags: ["soldier_memoir"], happy: 3, know: 1 }, "Lặng lẽ, câu chuyện có người giữ"),
      C(haunted ? "Đến thăm mộ người chiến sĩ năm ấy" : "Uống cùng nhau đến sáng", haunted ? { counters: step(c, SO, { qnh_scar: -1 }), custom: "apologize", happy: 2 } : { counters: step(c, SO, { drink: 1 }), rel: 3, health: -2 }, haunted ? "Muộn màng, nhưng là bước đầu tiên" : "Vui một đêm, cơ thể không còn trẻ")], 0); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SO, "qnh_letter", [18, 55], 6, (c) => T("Lá thư từ nhà", vary("qnhl", c.age, [`Thư nhà kể ${c.parent_sick ? "bố mẹ đau ốm, không ai đưa đi khám" : "mùa màng thất bát, nhà phải đi vay tiền"}. Đơn vị đang trong đợt huấn luyện, phép năm đã dùng hết.`, "Thư nhà kể nhà vừa bị ngập, mọi người đều ổn, nhưng mái bếp đã sập. Lá thư viết từ ba tuần trước."]), [
    C("Gửi gần hết lương về nhà", { money: -0.1, rel: 3, flags: ["soldier_sends_home"] }, "Nhà đỡ khó, bạn tiêu dè sẻn"),
    C("Xin phép đặc biệt về nhà", { gamble: { p: 0.5, win: { rel: 4, log: "Chỉ huy cho bạn năm ngày. Bạn về kịp." }, lose: { counters: { qnh_bond: -1 }, log: "Đơn bị bác. Bạn bị nhắc nhở vì thiếu ý chí." } } }, "Có thể về kịp, có thể mang tiếng"),
    C("Viết thư trả lời, ở lại đơn vị", { happy: -2, counters: { qnh_bond: 1 } }, "Giữ kỷ luật, lòng để ở nhà")], 0)),
  daily(SO, "qnh_hazing", [19, 50], 8, () => T("Đêm chào đón lính mới", "Giờ bạn đã là lính cũ. Đêm nay mấy người cùng khóa định chào đón lớp tân binh theo kiểu người ta từng chào đón bạn: đánh thức lúc hai giờ sáng, bắt làm những việc nhục nhã.", [
    C("Tham gia, đó là truyền thống", { counters: { qnh_bond: 1 }, flags: ["soldier_hazer"] }, "Lính cũ coi là người nhà, tân binh nhớ mặt"),
    C("Đứng ra chặn lại", { counters: { qnh_bond: -1 }, flags: ["soldier_stopped_hazing"], gamble: { p: 0.6, win: { rel: 2, log: "Đêm ấy không ai bị đánh thức. Năm sau cũng không." }, lose: { health: -3, log: "Bạn bị cả nhóm cô lập. Đêm ấy vẫn diễn ra, chỉ là không có bạn." } } }, "Bảo vệ người yếu, mất lòng người cùng khóa"),
    C("Biến đêm ấy thành buổi chạy đêm cùng nhau", { agency: 0.01, bw: -2, gamble: { p: 0.5, win: { counters: { qnh_bond: 2 }, flags: ["soldier_new_tradition"], log: "Chạy xong, cả hai khóa ngồi ăn mì đến sáng. Năm sau tân binh tự hỏi bao giờ đến đêm chạy." }, lose: { log: "Lính cũ chê nhạt, tự làm theo kiểu cũ ở dãy bên kia." } } }, "Giữ truyền thống, bỏ phần nhục mạ, chưa chắc ai nghe", { tier: "sovereign" })], 0)),
  daily(SO, "qnh_post", [19, 50], 8, () => T("Đêm gác ở trạm vùng biên", "Ba giờ sáng ở trạm gác vùng biên, một người đàn ông dắt con la chở đầy bao tải đi qua lối mòn. Ông chìa ra một xấp tiền bằng hai tháng lương của bạn.", [
    C("Nhận tiền, quay mặt đi", { money: 0.15, counters: { qnh_scar: 1 }, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [2, 9], note: "nhận tiền để hàng lậu qua trạm gác" } }, "Có tiền gửi về nhà, một bí mật theo bạn"),
    C("Giữ người, báo lên", { counters: { qnh_bond: 1 }, flags: ["soldier_stopped_smuggler"], gamble: { p: 0.7, win: { log: "Bạn được khen trước hàng quân." }, lose: { bw: -4, log: "Tuần sau có người lạ hỏi thăm nhà bạn ở quê." } } }, "Đúng nhiệm vụ, có thể bị trả thù"),
    C("Không nhận tiền, nhưng để ông đi", { flags: ["soldier_let_pass"], happy: -1 }, "Thương người nghèo, làm sai nhiệm vụ")], 1)),
  daily(SO, "qnh_landslide", [19, 55], 7, (c) => T("Ba ngày dưới mưa", vary("qnhs", c.age, ["Lở núi vùi một bản làng ven sông. Đơn vị bạn được điều đến đào bới bằng tay, mưa vẫn chưa dứt.", "Bão quật đổ hàng trăm nóc nhà. Đơn vị bạn dựng lều, phát gạo, khiêng người già lên chỗ cao."]), [
    C("Xin vào tổ ở chỗ nguy hiểm nhất", { health: -4, counters: { qnh_bond: 1, qnh_scar: 1 }, gamble: { p: 0.6, win: { happy: 5, log: "Tổ bạn đưa được hai người ra an toàn." }, lose: { health: -5, log: "Đất sụt thêm một lần nữa. Bạn được kéo ra kịp." } } }, "Cứu được người, có thể bị thương"),
    C("Ở tổ hậu cần, giữ sức", { counters: { qnh_bond: -1 }, bw: 1 }, "An toàn, nhìn người khác đi trước"),
    C("Tổ chức dân chia ca, lập danh sách người mất tích", { know: 2, bw: -3, flags: ["soldier_organizer"] }, "Ít anh hùng hơn, cứu được nhiều người hơn", { tier: "awakened" })], 0)),
  daily(SO, "qnh_knee", [20, 50], 9, (c) => T("Đầu gối trước kỳ sát hạch", `Sau đợt hành quân dài, đầu gối phải của bạn sưng to. Báo với quân y nghĩa là có thể bị loại khỏi ${f(c, "soldier_elite") ? "đơn vị đặc nhiệm" : "đợt sát hạch tháng sau"}.`, [
    C("Giấu đi, quấn băng chạy tiếp", { health: -6, counters: { qnh_scar: 1 }, gamble: { p: 0.5, win: { income_mult: 1.05, log: "Bạn qua đợt sát hạch, nhưng đầu gối không bao giờ như cũ." }, lose: { health: -6, log: "Giữa đợt sát hạch, đầu gối bạn khuỵu hẳn." } } }, "Giữ chỗ, đánh cược cái chân"),
    C("Báo quân y, nghỉ chữa", { health: 4, income_mult: 0.95, flags: ["soldier_knee_treated"] }, "Lành chân, mất suất")], 1)),
  daily(SO, "qnh_debt", [20, 50], 8, () => T("Người giường bên nợ cá độ", "Người nằm giường bên cạnh bạn ba năm nay nợ một khoản cá độ bóng đá bằng nửa năm lương. Chủ nợ đã gọi điện về tận nhà mẹ anh ấy.", [
    C("Cho vay, không hẹn ngày trả", { money: -0.2, counters: { qnh_bond: 2 } }, "Có thể mất tiền, giữ được một người anh em"),
    C("Từ chối", { counters: { qnh_bond: -1 }, bw: 1 }, "Giữ tiền, giường bên cạnh im lặng"),
    C("Đưa anh ấy lên gặp chỉ huy, cùng tìm cách", { flags: ["soldier_helped_gambler"], gamble: { p: 0.5, win: { counters: { qnh_bond: 1 }, log: "Đơn vị giúp anh ấy giãn nợ và bỏ cá độ." }, lose: { counters: { qnh_bond: -1 }, log: "Anh ấy bị kỷ luật, và không nhìn mặt bạn nữa." } } }, "Có thể cứu anh ấy, có thể mất anh ấy", { tier: "awakened" })], 1)),
  daily(SO, "qnh_class", [19, 45], 9, () => T("Lớp học buổi tối trong doanh trại", "Đơn vị mở lớp buổi tối: lái xe hạng nặng, ngoại ngữ, sửa máy. Học xong có chứng chỉ dùng được cả ngoài đời. Lớp kéo dài sáu tháng, mỗi tối sau giờ huấn luyện.", [
    C("Học lái xe hạng nặng", { bw: -4, know: 2, flags: ["soldier_heavy_license"] }, "Mệt sáu tháng, có nghề sau này"),
    C("Học ngoại ngữ", { bw: -4, know: 4, flags: ["soldier_language"] }, "Khó hơn, mở cửa ra thế giới"),
    C("Dành buổi tối để ngủ", { health: 2, happy: 1 }, "Khỏe người, tay trắng khi ra quân")], 0)),
  daily(SO, "qnh_parade", [19, 45], 9, () => T("Khối duyệt binh", "Bạn được chọn vào khối duyệt binh cho ngày lễ lớn. Bốn tháng tập dưới nắng, mỗi ngày tám tiếng, không được về phép. Người nhà sẽ được xem bạn trên truyền hình.", [
    C("Nhận, tập đến cùng", { health: -2, happy: 4, counters: { qnh_bond: 1 }, flags: ["soldier_parade"] }, "Một lần trong đời, bốn tháng xa nhà"),
    C("Xin nhường suất, về phép với gia đình", { rel: 3, happy: 1 }, "Gần nhà, lỡ một dịp hiếm")], 0)),
  daily(SO, "qnh_flinch", [22, 75], 8, (c) => T("Tiếng nổ trong đêm vui", c.country === "VN"
    ? vary("qnhf", c.age, ["Đêm giao thừa, pháo hoa nổ trên sông. Mọi người reo hò; bạn thấy mình đang nép sát vào tường, tim đập dồn.", "Một chiếc xe nổ lốp ngoài đường. Bạn nằm rạp xuống vỉa hè trước khi kịp nghĩ, giữa bao ánh mắt."])
    : vary("qnhf", c.age, ["Đêm năm mới, pháo hoa nổ khắp thành phố. Mọi người reo hò; bạn thấy mình đang nép sát vào tường, tim đập dồn.", "Một chiếc xe nổ lốp ngoài đường. Bạn nằm rạp xuống vỉa hè trước khi kịp nghĩ, giữa bao ánh mắt."]), [
    C("Đi gặp bác sĩ tâm lý", { bw: 4, money: -0.03, counters: { qnh_scar: -1 }, flags: ["soldier_therapy"] }, "Tốn tiền, bị trêu là yếu, đầu óc nhẹ đi"),
    C("Uống cho quên", { counters: { qnh_scar: 1, drink: 1 }, health: -2 }, "Dễ ngủ đêm nay, khó hơn những đêm sau"),
    C("Gọi cho một đồng đội cũ", { counters: { qnh_bond: 1 }, happy: 2 }, "Có người hiểu, nhưng không ai chữa")], 0)),
  daily(SO, "qnh_civvy", [25, 55], 99, () => T("Hợp đồng sắp hết hạn", "Hợp đồng của bạn sắp hết. Một công ty vận tải đường dài đang tìm tài xế từng đi lính: lương cao hơn, gần nhà hơn, không còn ai ra lệnh lúc nửa đêm.", [
    C("Ra quân, sang lái xe đường dài", { unflags: [life(SO)], custom: "become:long_hauler", flags: ["veteran"] }, "Lương khá, mất chỗ dựa của đơn vị"),
    C("Ký tiếp hợp đồng", { counters: { qnh_bond: 1 }, happy: -1 }, "Ở lại nơi quen, đời vẫn chật")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(SO, "qnh_family", [19, 60], (c) => (c.parent_sick && (!!role(c, "mother") || !!role(c, "father"))) || !!role(c, "spouse") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const p = role(c, "mother") ?? role(c, "father"); const s = role(c, "spouse"); const k = role(c, "child");
    if (c.parent_sick && p) return T(`${N(p)} ốm nặng giữa mùa bão`, `${N(p)} nhập viện, bác sĩ nói nên gọi con cái về. Đơn vị bạn đang trực sẵn sàng vì một cơn bão lớn sắp vào bờ, mọi đơn xin phép đều bị hoãn.`, [
      C("Xin về bằng được", { gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.3 }, log: `Bạn về kịp, ngồi cạnh giường ${N(p)} hai đêm liền.` }, lose: { trust: { npc: p, delta: 0.1 }, counters: { qnh_bond: -1 }, log: "Bạn về được, nhưng bị kỷ luật vì rời đơn vị khi đang có lệnh." } } }, "Có thể kịp, có thể bị kỷ luật"),
      C("Ở lại đơn vị trực bão", { counters: { qnh_bond: 1 }, trust: { npc: p, delta: -0.2 }, happy: -4 }, "Làm tròn nhiệm vụ, có thể không gặp lần cuối"),
      C("Nhờ đồng đội ở quê mang tiền và hoa đến", { money: -0.05, trust: { npc: p, delta: 0.1 }, counters: { qnh_bond: 1 } }, "Có người thay mặt, nhưng không phải là bạn")], 1, { npc: p });
    if (s) return T("Đứa con chào đời khi bạn ở xa", `${N(s)} sắp sinh. Bạn đang ở một trạm xa, ba tuần mới có một chuyến xe tiếp tế. "Đừng lo," ${N(s)} nói qua điện thoại, giọng không giấu được sự mệt.`, [
      C("Xin đổi ca, về trước ngày sinh", { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.3 }, log: "Bạn về kịp hai ngày trước khi con chào đời." }, lose: { trust: { npc: s, delta: 0.1 }, log: "Bạn về đến nơi khi con đã được một tuần tuổi." } } }, "Có thể kịp, nợ đồng đội một ca"),
      C("Ở lại, hứa sẽ bù cho cả nhà", { trust: { npc: s, delta: -0.1 }, promise: { to: s, what: "về ở nhà trọn một tháng sau đợt trực", years: 1 } }, "Đúng lịch trực, một lời hứa phải giữ"),
      C("Xin chuyển về đơn vị gần nhà", { trust: { npc: s, delta: 0.25 }, income_mult: 0.9, flags: ["soldier_near_home"] }, "Gần vợ con, chậm lên")], 0, { npc: s });
    const kid = k!;
    return T(`${N(kid)} muốn đi lính`, `${N(kid)} nói muốn đi lính giống bạn. ${cnt(c, "qnh_scar") >= 2 ? "Bạn nghĩ đến những đêm mình không ngủ được." : "Bạn nhớ cảm giác ngày đầu khoác áo lính."}`, [
      C("Ủng hộ, kể cho con nghe những điều tốt", { trust: { npc: kid, delta: 0.2 }, flags: ["soldier_kid_follows"] }, "Con tự hào, chưa biết hết cái giá"),
      C("Cấm, bắt con học đại học", { trust: { npc: kid, delta: -0.2 } }, "Giữ con khỏi những gì bạn đã qua, con thấy bị áp đặt"),
      C("Kể hết, cả những đêm không ngủ, rồi để con chọn", { trust: { npc: kid, delta: 0.15 }, counters: { qnh_scar: -1 }, bw: -2 }, "Khó nói, con chọn với đôi mắt mở", { tier: "awakened" })], 2, { npc: kid }); }),
];
