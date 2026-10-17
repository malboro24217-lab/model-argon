/**
 * Thế giới ngầm (A): DÂN BUÔN LẬU · NGƯỜI CHO VAY NẶNG LÃI · KẺ LỪA ĐẢO TRÊN MẠNG · GIANG HỒ.
 * Viết như phim tài liệu: chỉ có tình huống, lựa chọn và cái giá — không mô tả cách làm.
 * Tiền tố: smg_ (buôn lậu), lsk_ (cho vay nặng lãi), scm_ (lừa đảo), gng_ (giang hồ).
 */
import type { Storylet, FactContext, Effect } from "../types.ts";
import { C, T, f, role, vary, life, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const SM = "smuggler";
const LS = "loan_shark";
const SC = "scammer";
const GA = "gangster";

const VN = (c: FactContext): boolean => c.country === "VN";
const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Tiền: người chưa đủ 18 tuổi chỉ được ±0.05 thu nhập hộ. */
const $ = (c: FactContext, x: number): number => (c.age < 18 ? Math.max(-0.05, Math.min(0.05, x)) : x);
/** Rời con đường này và bước sang một con đường khác (vd người từng ở tù, người buôn bán hợp pháp). */
const leaveTo = (path: string, next: string, more: Effect = {}): Effect => ({ ...more, unflags: [life(path), ...(more.unflags ?? [])], custom: `job_lose|become:${next}` });

export const PACK_UNDER_A: Storylet[] = [
  /* ================================================================ DÂN BUÔN LẬU ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(SM, "smg_t_alleys", [12, 16], () => true, (c) => T("Đứa trẻ thuộc mọi lối tắt", "Năm mười ba tuổi, bạn thuộc mọi ngõ tắt trong khu chợ. Các cô bán hàng gửi bạn tiền, gửi hàng, gửi cả chuyện riêng, và bạn chưa bao giờ kể lại với ai.", [
    C("Nhận chạy việc cho cả chợ lấy tiền công", { money: $(c, 0.03), flags: [talentFlag(SM)], counters: { talents_seen: 1 }, know: -2 }, "Có tiền sớm, quen tiền mặt, sao nhãng việc học"),
    C("Chỉ giúp khi rảnh, còn đi học", { counters: { talents_seen: 1 }, know: 2 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SM, "smg_d_night", [18, 40], (c) => !c.rich, (c) => T("Chuyến xe đêm qua biên giới", `Một người quen ở bãi xe hỏi bạn có dám chạy một chuyến đêm qua biên giới không. Một chuyến trả bằng ${c.poor_country ? "hai tháng" : "một tháng"} lương của bạn. Anh ta dặn đúng một câu: không hỏi trong thùng có gì.`, [
    C("Nhận chạy, coi như một nghề", { ...become(SM), counters: { doors_seen: 1 }, money: 0.1 }, "Tiền nhanh, bước qua một lằn ranh"),
    C("Chạy thử một chuyến cho biết", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(SM), money: 0.08, log: "Chuyến đi trót lọt. Hôm sau anh ta gọi lại, và bạn nghe máy." }, lose: { happy: -4, counters: { smg_heat: 1 }, log: "Bạn bị giữ ở trạm cả đêm, rồi được thả vì không ai biết bạn là ai." } } }, "Thử một lần, một lần cũng đủ để có tên"),
    C("Từ chối", { counters: { doors_seen: 1 } })], 2)),
  door(SM, "smg_d_debt", [20, 45], (c) => c.broke || c.debt_ratio > 0.3, (c, N) => { const cr = role(c, "creditor"); const who = cr ? N(cr) : "Người cho bạn vay";
    return T("Món nợ đổi bằng một năm chở hàng", `${who} đề nghị xóa khoản nợ của bạn nếu bạn chở hàng cho một chỗ quen trong một năm. "Một năm thôi," người ta nói. Ai trong nghề cũng từng nghe câu đó.`, [
      C("Nhận, trả nợ bằng những chuyến hàng", { ...become(SM), counters: { doors_seen: 1 }, money: 0.4 }, "Hết nợ ngay, mắc một món nợ khác"),
      C("Bán bớt đồ trong nhà để trả", { counters: { doors_seen: 1 }, money: -0.1, happy: -3 }),
      C("Xin giãn nợ, làm thêm ca", { counters: { doors_seen: 1 }, health: -3, bw: -4, ...(cr ? { trust: { npc: cr, delta: 0.1 } } : {}) }, "Mệt hơn, sạch hơn")], 1, cr ? { npc: cr } : {}); }),

  /* ---------- mạch truyện ---------- */
  beat(SM, 1, 1, (c) => T("Thùng hàng không được mở", `Chuyến đầu tiên của bạn bắt đầu lúc hai giờ sáng. Thùng xe niêm kín, giấy tờ ghi là ${c.poor_country ? "vải vóc" : "đồ gia dụng"}. Người giao hàng nhìn bạn lâu hơn cần thiết rồi nói: "Lái thôi, đừng nghĩ."`, [
    C("Lái, không hỏi gì", { counters: step(c, SM, { smg_heat: 1 }), money: $(c, 0.12), flags: ["smg_no_questions"] }, "Tiền đều, không biết mình đang chở gì"),
    C("Hỏi rõ trong thùng là gì rồi mới đi", { counters: step(c, SM), gamble: { p: 0.5, win: { flags: ["smg_asks"], log: "Họ nói thật: hàng trốn thuế, không hơn. Từ đó họ coi bạn là người cẩn thận." }, lose: { money: $(c, -0.05), flags: ["smg_asks"], log: "Họ trả bạn nửa tiền công và nói lần sau đừng hỏi." } } }, "Biết mình chở gì, mất lòng người thuê"),
    C("Lái, nhưng ghi lại ai giao, ai nhận", { counters: step(c, SM), money: $(c, 0.1), flags: ["smg_notebook"], bw: -3 }, "Một cuốn sổ phòng thân, cũng là một quả mìn", { tier: "awakened" })], 0)),
  beat(SM, 2, 3, (c) => T("Người gác trạm", `${f(c, "smg_no_questions") ? "Ba năm chở không hỏi, bạn được giao xe lớn hơn." : "Ba năm trong nghề, người ta bắt đầu gọi bạn là anh cả của tổ xe."} Một người ở trạm kiểm soát cho biết anh ta có thể "không thấy gì" vào những đêm có xe bạn, đổi lại một phong bì mỗi tháng.`, [
    C("Gửi phong bì đều đặn", { counters: step(c, SM), income_mult: 1.5, flags: ["smg_bribed"], secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 12], note: "phong bì hằng tháng cho trạm kiểm soát" } }, "Đường thông, tên bạn nằm trong sổ của người khác"),
    C("Không gửi, chạy ít chuyến hơn", { counters: step(c, SM, { smg_heat: 1 }), income_mult: 1.1 }, "Ít tiền hơn, mỗi chuyến là một lần đánh cược"),
    C("Lập tổ xe riêng, chỉ chở hàng thường", { counters: step(c, SM), income_mult: 1.3, flags: ["smg_own_crew", "smg_rules"], agency: 0.02, bw: -4 }, "Tự đặt giới hạn: không hàng cấm, không người", { tier: "sovereign" })], 0)),
  beat(SM, 3, 4, (c) => T("Phía sau thùng xe", `${f(c, "smg_rules") ? "Người chủ cũ tìm đến tổ xe của bạn với một chuyến đặc biệt, trả gấp mười." : "Ông chủ gọi bạn ra một góc, nói chuyến này trả gấp mười."} Bạn mở cửa thùng xe. Không phải hàng. Mười hai người lớn ngồi im trong bóng tối, ai cũng ôm một cái túi nhỏ, không ai nhìn vào mắt bạn.`, [
    C("Đóng cửa thùng, nhận tiền, lái", { counters: step(c, SM, { smg_heat: 2 }), money: $(c, 0.8), happy: -6, flags: ["smg_carried_people"], secret: { tag: "FORGED_PAPERS", severity: 0.8, fuse_years: [2, 10], note: "chuyến xe chở người qua biên giới" }, later: { years: 3, storylet: "smg_letter" } }, "Tiền lớn nhất đời, gánh nặng nhất đời"),
    C("Từ chối chuyến này, chịu mất mối", { counters: step(c, SM), income_mult: 0.7, flags: ["smg_refused_people"], happy: 2 }, "Giữ một lằn ranh, mất gần nửa thu nhập"),
    C("Lái thẳng đến đồn công an, khai hết", { counters: step(c, SM), unflags: [life(SM)], agency: 0.03, gamble: { p: 0.55, win: { custom: "job_lose", flags: ["smg_witness"], log: "Bạn được coi là nhân chứng. Mười hai người được đưa đến nơi an toàn; bạn mất nghề, giữ được tên." }, lose: { custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Tòa xử bạn cùng đường dây, nhẹ hơn mọi người vì đã tự khai." } } }, "Mất nghề, có thể mất tự do, mười hai người được cứu", { tier: "sovereign" })], 1)),
  beat(SM, 4, 5, (c) => {
    const hot = f(c, "smg_carried_people") || cnt(c, "smg_heat") >= 3;
    if (hot) return T("Năm giờ sáng", `Lúc năm giờ sáng, công an khám xét cùng lúc nhiều nhà trong đường dây. Hai tài xế đã bị bắt và đang khai.${f(c, "smg_bribed") ? " Người gác trạm năm xưa cũng bị tạm giữ; tên bạn có trong sổ của anh ta." : ""}${f(c, "smg_notebook") ? " Cuốn sổ bạn ghi suốt mấy năm vẫn nằm dưới gầm giường." : ""} Bạn còn vài giờ trước khi họ gõ cửa nhà mình.`, [
      C("Bỏ trốn sang nước khác", { counters: step(c, SM), money: $(c, -0.5), close_doors: ["return_home"], flags: ["smg_fugitive"], health: -3 }, "Thoát tù, mất đường về nhà"),
      C("Ra đầu thú, nhận phần của mình", leaveTo(SM, "ex_convict", { counters: step(c, SM), close_doors: ["clean_record"], happy: -4, agency: 0.02 }), "Mất vài năm tự do, ra tù không phải trốn ai"),
      f(c, "smg_notebook")
        ? C("Mang cuốn sổ đến nộp, khai ra người cầm đầu", { counters: step(c, SM), unflags: [life(SM)], agency: 0.03, gamble: { p: 0.6, win: { custom: "job_lose", flags: ["smg_witness"], log: "Bạn được hưởng khoan hồng. Đường dây sụp đổ vì cuốn sổ của bạn." }, lose: { custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Cuốn sổ giúp phá đường dây, nhưng bạn vẫn nhận án." } } }, "Khoan hồng, và một đường dây sẽ không quên bạn", { tier: "sovereign" })
        : C("Im lặng, nhận tội thay để ông chủ lo cho nhà", leaveTo(SM, "ex_convict", { counters: step(c, SM), money: $(c, 0.6), close_doors: ["clean_record"], flags: ["smg_took_fall"], happy: -6 }), "Nhà có tiền, bạn gánh án của người khác")], 1);
    return T("Lời mời từ bên kia biên giới", `Mười năm trên đường, giờ bạn có đội xe, kho bãi và những người gọi bạn là anh, là chị.${f(c, "smg_rules") ? " Tổ xe của bạn nổi tiếng vì không bao giờ chở hàng cấm." : ""} Một đường dây lớn hơn ở bên kia biên giới muốn hợp tác: hàng của họ, xe của bạn, không ai hỏi gì.`, [
      C("Bắt tay với đường dây lớn", { counters: step(c, SM, { smg_heat: 2 }), income_mult: 1.6, money: $(c, 0.5), flags: ["smg_big_network"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 10], note: "giấy tờ giả cho hàng của đường dây lớn" } }, "Giàu nhanh, không còn biết mình chở gì"),
      C("Mở công ty xuất nhập khẩu thật, nộp đủ thuế", leaveTo(SM, "border_trader", { counters: step(c, SM), money: $(c, -0.6), flags: ["smg_went_legit"], agency: 0.03 }), "Lãi mỏng, ngủ yên, người cũ sẽ không vui", { tier: "sovereign" }),
      C("Giữ nguyên, nhỏ và kín", { counters: step(c, SM), happy: 2, flags: ["smg_stay_small"] })], 0);
  }),
  beat(SM, 5, 6, (c) => T(f(c, "smg_fugitive") ? "Cái tên mượn" : "Cậu thanh niên ở bãi xe", f(c, "smg_fugitive")
    ? "Bạn đã sống nhiều năm ở xứ người dưới một cái tên mượn. Về nước là bị bắt, nên ngày giỗ, ngày cưới ở nhà bạn chỉ nghe kể lại. Một cậu thanh niên cùng quê tìm đến, xin bạn chỉ đường vào nghề."
    : `Một cậu thanh niên ở bãi xe, tuổi bằng bạn năm xưa, xin bạn cho chạy một chuyến. Cậu ấy có mẹ ốm và một món nợ.${f(c, "smg_witness") || f(c, "smg_took_fall") ? " Cậu không biết chuyện cũ của bạn." : ""}`, [
    C("Giới thiệu cậu ấy vào nghề", { counters: step(c, SM), money: 0.1, flags: ["smg_passed_on"], happy: -2 }, "Giúp được lúc này, đẩy một người vào lối cũ"),
    C("Kể cho cậu ấy nghe hết những năm của mình", { counters: step(c, SM), rel: 4, flags: ["smg_told_truth"], happy: 3 }, "Mất chút sĩ diện, có thể cứu một đời"),
    C("Trả nợ giúp, đổi lại cậu ấy đi học nghề", { counters: step(c, SM), money: -0.3, agency: 0.02, flags: ["smg_sponsor"] }, "Tốn tiền, không chắc cậu ấy giữ lời", { tier: "sovereign", longterm: true })], 1), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SM, "smg_tail", [18, 60], 6, (c) => T("Chiếc xe bám theo sau", vary("smgt", c.age, ["Một chiếc xe không biển bám sau xe bạn suốt ba mươi cây số, giữ đúng một khoảng cách.", "Đèn pha của cùng một chiếc xe hiện trong gương chiếu hậu từ lúc bạn rời kho."]), [
      C("Cứ lái bình thường đến chỗ giao", { gamble: { p: 0.6, win: { counters: { smg_heat: 1 }, log: "Đến ngã ba, chiếc xe rẽ sang hướng khác. Bạn không bao giờ biết đó là ai." }, lose: { money: -0.3, counters: { smg_heat: 2 }, flags: ["smg_record"], log: "Ở chỗ giao hàng, người ta đã đứng chờ. Hàng bị thu, bạn bị lập biên bản." } } }, "Có thể chỉ là tưởng tượng, có thể mất trắng"),
      C("Bỏ xe ở trạm xăng, đi bộ về", { money: -0.25, counters: { smg_heat: -1 }, happy: -3 }, "Mất hàng, mất tiền, giữ được mình"),
      C("Lái thẳng về nhà, gọi cho ông chủ", { counters: { smg_heat: 1 }, bw: -4, flags: ["smg_led_home"] }, "Ông chủ sẽ hỏi vì sao bạn dẫn họ về nhà mình")], 0)),
  daily(SM, "smg_codriver", [18, 60], 8, (c, N) => { const fr = role(c, "childhood_friend")!;
    return T(`${N(fr)} bị bắt ở cửa khẩu`, `${N(fr)}, người chạy cặp với bạn, bị bắt ở cửa khẩu cùng cả xe hàng. Người nhà ${N(fr)} đến nhà bạn lúc nửa đêm, hỏi bạn có tiền thuê luật sư không. Chắc chắn công an đang hỏi ${N(fr)} về bạn.`, [
      C("Lo luật sư và tiền chợ cho nhà bạn ấy", { money: -0.25, counters: { smg_heat: 1 }, memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "lo luật sư khi bị bắt ở cửa khẩu" } }, "Tốn tiền, tên bạn đứng gần vụ án hơn"),
      C("Cắt liên lạc, giữ mình", { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.4, note: "bỏ mặc khi bị bắt ở cửa khẩu" } }, "An toàn hôm nay, mất một người bạn"),
      C("Vào trại thăm, hứa lo cho con bạn ấy đi học", { counters: { smg_heat: 1 }, promise: { to: fr, what: "lo cho con đi học trong lúc ngồi tù", years: 3 }, trust: { npc: fr, delta: 0.2 } }, "Một lời hứa nặng, công an thấy bạn ra vào", { tier: "awakened" })], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(SM, "smg_season", [18, 60], 6, (c) => T("Mùa hàng về", vary("smgs", c.age, [VN(c) ? "Giáp Tết, hàng cần chạy gấp đôi. Cả bãi xe thức trắng, ai cũng muốn kiếm một cái Tết to." : "Mùa lễ cuối năm, hàng cần chạy gấp đôi. Cả bãi xe thức trắng, ai cũng muốn kiếm một mùa to.", "Giá hàng hai bên biên giới vừa chênh mạnh. Người ta trả gấp rưỡi cho ai chịu chạy liền ba đêm."]), [
      C("Chạy liền mấy đêm", { money: 0.25, health: -5, counters: { smg_heat: 1 } }, "Tiền gấp đôi, sức hao và may rủi cũng gấp đôi"),
      C("Chạy đúng sức mình", { money: 0.05, health: 1, counters: { smg_heat: -1 } }, "Ít tiền hơn mùa này, đỡ bị để ý")], 0)),
  daily(SM, "smg_lost_load", [18, 60], 8, () => T("Món nợ của một xe hàng", "Xe hàng bị thu giữ giữa đường. Bạn thoát, nhưng người thuê nói giá trị cả xe giờ là nợ của bạn. Họ biết nhà bạn ở đâu.", [
      C("Vay tiền trả cho xong", { custom: "borrow:0.6", happy: -3 }, "Sạch nợ với họ, nợ ngân hàng"),
      C("Chạy không công cho họ đến khi trừ hết", { income_mult: 0.8, flags: ["smg_bonded"], counters: { smg_heat: 1 } }, "Không mất tiền, mất mấy năm tự do"),
      C("Nói thẳng: rủi ro là của chủ hàng", { gamble: { p: 0.45, win: { flags: ["smg_stood_ground"], log: "Họ im lặng một lúc rồi bỏ qua. Từ đó họ nể bạn." }, lose: { bw: -6, money: -0.2, happy: -5, log: "Một đêm, kính nhà bạn bị đập vỡ. Sáng hôm sau bạn mang tiền đến trả." } } }, "Giữ được tiền, hoặc kéo nguy hiểm về nhà")], 1)),
  daily(SM, "smg_patron", [22, 65], 8, (c) => T("Tiền xây trường làng", `${c.poor_country ? "Ở vùng biên này, nửa làng sống nhờ những chuyến hàng đêm." : "Ở thị trấn biên giới nhỏ này, ai cũng biết ai làm gì."} Ban vận động xây lại trường học tìm đến bạn, vì biết bạn có tiền mặt. Họ không hỏi tiền từ đâu ra.`, [
      C("Góp một khoản lớn, tên khắc trên bảng", { money: -0.2, rel: 5, flags: ["smg_patron"], counters: { smg_heat: 1 } }, "Được làng nể, tên bạn hiện ra giữa ban ngày"),
      C("Góp vừa phải, giấu tên", { money: -0.08, rel: 2, counters: { kind: 1 } }),
      C("Không góp, càng ít người để ý càng tốt", { rel: -3 })], 1)),
  daily(SM, "smg_drowsy", [20, 60], 7, (c) => T("Mắt nhắm sau tay lái", vary("smgd", c.age, ["Bốn giờ sáng, bạn giật mình vì tiếng còi. Xe đã lấn sang làn bên kia, chỉ cách một nhịp thở.", "Đã ba năm bạn không ngủ trọn một đêm. Bác sĩ nói tim bạn đập như tim người hơn mười tuổi."]), [
      C("Nghỉ hẳn một tháng", { money: -0.1, health: 6, happy: 2, counters: { smg_heat: -1 } }, "Mất mối hàng mùa này, giữ được mạng"),
      C("Uống thêm thuốc tỉnh ngủ, chạy tiếp", { health: -7, money: 0.08, counters: { smg_heat: 1 } }, "Giữ mối hàng, bào mòn cơ thể"),
      C("Thuê một tài xế trẻ chạy cặp", { money: -0.05, flags: ["smg_crew"], health: 3 }, "Đỡ sức mình, kéo thêm một người vào nghề")], 0)),
  daily(SM, "smg_offer", [20, 60], 10, (c, N) => { const o = role(c, "official");
    return T("Lời đề nghị trong quán cà phê", `${o ? N(o) : "Một người đàn ông mặc thường phục"} ngồi xuống bàn bạn và gọi đúng tên bạn. Người đó nói thẳng: bạn cho biết hàng của ai, đi khi nào, thì hồ sơ của bạn sẽ mỏng đi. Không ai khác cần biết cuộc nói chuyện này.`, [
      C("Nhận lời làm tai mắt", { flags: ["smg_informant"], counters: { smg_heat: -2 }, happy: -3, bw: -4 }, "Nhẹ tội về sau, sống hai mặt mỗi ngày"),
      C("Từ chối, đứng dậy đi", { counters: { smg_heat: 1 }, ...(o ? { trust: { npc: o, delta: -0.2 } } : {}) }, "Giữ chữ tín trong nghề, bị để mắt"),
      C("Gật đầu cho qua, không nói gì thật", { gamble: { p: 0.5, win: { flags: ["smg_double"], log: "Người đó gặp bạn thêm hai lần rồi thôi." }, lose: { counters: { smg_heat: 2 }, flags: ["smg_record"], log: "Người đó nhận ra bạn nói dối và ghi tên bạn vào hồ sơ." } } }, "Câu giờ được, nếu không bị phát hiện")], 1, o ? { npc: o } : {}); }),
  daily(SM, "smg_medicine", [18, 60], 9, () => T("Lô thuốc không nhãn", "Lần này là mấy thùng thuốc chữa bệnh, nhãn in nhòe, không có tên nơi sản xuất. Người giao nói hàng sẽ về các hiệu thuốc ở vùng quê, nơi người ốm không có nhiều lựa chọn.", [
      C("Chở, trả gấp ba", { money: 0.3, counters: { smg_heat: 2 }, happy: -4, secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [3, 12], note: "chở thuốc không rõ nguồn gốc về các hiệu thuốc vùng quê" } }, "Tiền gấp ba, người uống thuốc là người lạ"),
      C("Trả lô thuốc lại, chỉ chở hàng cũ", { money: -0.05, flags: ["smg_refused_dark"] }, "Mất lòng người giao, giữ được ranh giới"),
      C("Bỏ nghề từ chuyến này", { ...leave(SM), flags: ["smg_quit"], happy: 2, money: -0.1 }, "Sạch tay từ nay, mất nguồn thu")], 1)),
  daily(SM, "smg_cash", [22, 65], 9, (c) => T("Tiền mặt không có tên", vary("smgm", c.age, ["Tiền mặt chất trong tủ quần áo. Bạn không thể gửi ngân hàng mà không bị hỏi nguồn gốc.", "Bạn muốn mua một căn nhà, nhưng mọi tờ giấy đều sẽ hỏi tiền từ đâu ra."]), [
      C("Nhờ người họ hàng đứng tên giùm", { money: 0.1, flags: ["smg_hidden_assets"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [4, 15], note: "nhà đứng tên người họ hàng để giấu tiền buôn lậu" } }, "Tiền thành nhà, số phận nó nằm trong tay người khác"),
      C("Tiêu cho hết, ăn chơi cho đã", { money: -0.2, happy: 4, counters: { drink: 2, gamble: 1 } }, "Vui nhanh, hết nhanh, ai cũng thấy"),
      C("Để nguyên trong tủ", { gamble: { p: 0.7, win: { counters: { save: 1 }, log: "Năm đó không ai đụng đến tủ quần áo của bạn." }, lose: { money: -0.4, log: "Một đêm nhà bị trộm. Bạn không thể báo công an." } } }, "Không ai biết, kể cả kẻ trộm thì có thể")], 0)),
  daily(SM, "smg_letter", [20, 65], 99, (c) => T("Người đi tìm em gái", f(c, "smg_carried_people")
    ? "Một người đàn ông chặn xe bạn ở cây xăng. Anh ta là một trong mười hai người năm ấy. Anh ta nói em gái mình đi chuyến sau và không bao giờ đến nơi, rồi hỏi ai là người đứng sau."
    : "Một người đàn ông chặn xe bạn ở cây xăng, hỏi bạn có biết ai chở người qua biên giới không. Em gái anh ta theo một chuyến xe như thế, ba năm nay chưa có tin.", [
      C("Nói cho anh ta những cái tên mình biết", { flags: ["smg_named_boss"], counters: { smg_heat: 1 }, happy: 2 }, "Giúp một người ngoài, phản lại người trong nghề"),
      C("Dúi cho anh ta ít tiền rồi lái đi", { money: -0.05, happy: -3 }),
      C("Cùng anh ta đến công an", { ...leave(SM), agency: 0.03, gamble: { p: f(c, "smg_carried_people") ? 0.35 : 0.7, win: { flags: ["smg_witness"], log: "Lời khai của bạn giúp lần ra đường dây. Người ta giữ bạn lại làm nhân chứng." }, lose: { close_doors: ["clean_record"], custom: "become:ex_convict", log: "Bạn bị khởi tố cùng những người bạn khai ra." } } }, "Bỏ nghề, có thể phải trả giá cho chính mình", { tier: "sovereign" })], 1)),

  /* ---------- gia đình ---------- */
  cross(SM, "smg_home", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => { const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T("Bài văn về nghề của bố mẹ", `${N(k)} phải viết bài văn "Nghề của bố mẹ em" và hỏi bạn: chạy xe ban đêm thì chở hàng gì?`, [
      C("Nói dối: chở hàng cho công ty", { trust: { npc: k, delta: -0.1 }, happy: -2 }, "Giữ con khỏi chuyện người lớn, thêm một lời nói dối"),
      C("Nói thật, kể cả phần không đẹp", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} im lặng rất lâu, rồi hỏi bạn có sợ không.` }, lose: { trust: { npc: k, delta: -0.3 }, log: `${N(k)} không nói chuyện với bạn suốt một tháng.` } } }, "Con có thể hiểu, có thể xa bạn"),
      C("Hứa với con hai năm nữa sẽ bỏ nghề", { promise: { to: k, what: "bỏ nghề chạy hàng đêm trong hai năm", years: 2 }, trust: { npc: k, delta: 0.15 } }, "Lời hứa sẽ bị đòi", { tier: "awakened" })], 0, { npc: k });
    return T("Cọc tiền trong túi áo", `${N(p!)} tìm thấy một cọc tiền trong túi áo bạn lúc giặt đồ. Hàng xóm đã đồn từ lâu. ${N(p!)} không hỏi, chỉ đặt cọc tiền lên bàn và ngồi chờ.`, [
      C("Nói là tiền thưởng chạy xe", { trust: { npc: p!, delta: -0.1 } }, "Yên chuyện tối nay, thêm một lời nói dối"),
      C("Thú thật, xin đừng kể với ai", { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.2 }, log: `${N(p!)} khóc, rồi giữ kín chuyện cho bạn.` }, lose: { trust: { npc: p!, delta: -0.3 }, log: `${N(p!)} không nhận một đồng nào của bạn nữa.` } } }),
      C("Đưa tiền cho bố mẹ sửa nhà", { money: -0.15, trust: { npc: p!, delta: 0.1 }, flags: ["smg_parents_know"] }, "Bố mẹ có nhà mới, và thành người cùng biết")], 0, { npc: p! }); }),

  /* ================================================================ NGƯỜI CHO VAY NẶNG LÃI ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(LS, "lsk_t_ledger", [10, 16], () => true, (c) => T("Cuốn vở ghi nợ", "Bạn cho cả lớp vay tiền ăn sáng, ghi vào một cuốn vở ô li, mỗi tuần thu thêm một chút. Cuối học kỳ, cuốn vở kín ba trang tên, và bạn có số tiền bằng tiền tiêu vặt cả năm.", [
    C("Giữ cuốn vở, cho vay tiếp", { money: $(c, 0.03), flags: [talentFlag(LS)], counters: { talents_seen: 1, kind: -1 }, rel: -2 }, "Biết đếm tiền sớm, bạn bè bắt đầu ngại bạn"),
    C("Xé cuốn vở, xóa nợ cho cả lớp", { money: $(c, -0.01), counters: { talents_seen: 1, kind: 1 }, rel: 3 }, "Mất ít tiền, được cả lớp")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(LS, "lsk_d_pawnshop", [25, 55], (c) => c.savings > 0 || f(c, talentFlag(LS)), (c) => T("Tiệm cầm đồ sang nhượng", `Ông chủ tiệm cầm đồ đầu chợ muốn nghỉ, sang lại cả tiệm lẫn cuốn sổ khách. Trong sổ là ${c.poor_country ? "hơn trăm" : "vài chục"} cái tên còn đang nợ, có người nợ từ thời con họ còn đi học.`, [
    C("Mua cả tiệm lẫn cuốn sổ", { ...become(LS), counters: { doors_seen: 1 }, money: -0.5, flags: ["lsk_old_book"] }, "Có khách ngay, thừa kế cả những món nợ cũ"),
    C("Mua tiệm, đốt cuốn sổ cũ", { ...become(LS), counters: { doors_seen: 1 }, money: -0.7, flags: ["lsk_clean_start"], agency: 0.02 }, "Bắt đầu sạch hơn, tốn hơn", { tier: "sovereign" }),
    C("Không mua", { counters: { doors_seen: 1 } })], 2)),
  door(LS, "lsk_d_neighbor", [22, 55], (c) => !!role(c, "neighbor") && !c.broke, (c, N) => { const n = role(c, "neighbor")!;
    return T("Tiếng gõ cửa lúc nửa đêm", `${N(n)} gõ cửa lúc nửa đêm: cần tiền mổ cho người nhà, ngân hàng không cho vay. ${N(n)} tự đề nghị trả lãi mỗi tháng bằng lãi ngân hàng cả năm. Tuần sau, có thêm hai người khác tìm đến hỏi bạn.`, [
      C("Cho vay theo lãi đó, nhận thêm khách", { ...become(LS), counters: { doors_seen: 1 }, money: 0.1, memory: { npc: n, tag: "HELPED_IN_CRISIS", weight: 0.1, note: "cho vay tiền mổ lúc nửa đêm với lãi cao" } }, "Một nghề mới, một kiểu quan hệ mới với láng giềng"),
      C("Cho vay không lấy lãi, chỉ lần này", { counters: { doors_seen: 1 }, money: -0.15, memory: { npc: n, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "cho vay tiền mổ không lấy lãi" } }, "Có thể mất tiền, được một người nhớ ơn"),
      C("Từ chối", { counters: { doors_seen: 1 }, memory: { npc: n, tag: "REFUSED_HELP", weight: -0.2, note: "đóng cửa lúc nửa đêm khi cần tiền mổ" } })], 1, { npc: n }); }),

  /* ---------- mạch truyện ---------- */
  beat(LS, 1, 1, (c) => T("Chiếc nhẫn cưới đem cầm", `Khách đầu tiên ${f(c, "lsk_old_book") ? "trong cuốn sổ cũ " : ""}là một phụ nữ mang chiếc nhẫn cưới đến cầm, xin vay gấp đôi giá chiếc nhẫn để đóng học cho con. Cô ấy hứa cuối tháng sẽ chuộc. Người làm nghề lâu năm dặn bạn: lòng tốt đầu tiên sẽ thành lệ.`, [
    C("Cho vay đủ, lãi theo lệ của nghề", { counters: step(c, LS, { lsk_hard: 1 }), money: $(c, 0.12) }, "Lời nhiều, cô ấy có thể không bao giờ chuộc được"),
    C("Cho vay đúng giá nhẫn, lãi nhẹ", { counters: step(c, LS, { lsk_soft: 1 }), money: $(c, 0.03), flags: ["lsk_fair_rate"] }, "Ít lời, tiếng lành lan nhanh hơn"),
    C("Từ chối: không đủ vật cầm thì không cho vay", { counters: step(c, LS), happy: -2 }, "Không rủi ro, không ai nhớ đến bạn")], 0)),
  beat(LS, 2, 3, (c) => T("Những người đi đòi nợ", `Sổ của bạn giờ có ${cnt(c, "lsk_hard") >= 1 ? "gần trăm" : "vài chục"} cái tên, một phần ba trả chậm. Một nhóm thanh niên xăm trổ đến chào: họ nhận đòi nợ ăn chia phần trăm, "chưa nợ nào không đòi được". Bạn không hỏi họ đòi bằng cách nào.`, [
    C("Giao các món nợ chậm cho họ", { counters: step(c, LS, { lsk_hard: 2 }), income_mult: 1.6, flags: ["lsk_enforcers"], close_doors: ["village_trust"] }, "Thu đủ, tên bạn gắn với những đêm đáng sợ"),
    C("Tự đi đòi, kiên nhẫn từng nhà", { counters: step(c, LS), income_mult: 1.1, bw: -6 }, "Thu chậm, mệt, giữ được mặt mũi"),
    C("Đặt luật: không đến nhà, giãn nợ cho người ốm", { counters: step(c, LS, { lsk_soft: 1 }), income_mult: 1.2, flags: ["lsk_rules"], agency: 0.02 }, "Lời ít hơn, có người lợi dụng luật của bạn", { tier: "sovereign" })], 0)),
  beat(LS, 3, 4, (c) => T("Lá thư để lại trên bàn", `${f(c, "lsk_enforcers") ? "Nhóm đòi nợ đã đến nhà anh ta ba lần." : "Bạn đã gia hạn cho anh ta ba lần."} Món nợ của một người bán rau, sau bốn năm cộng lãi, đã gấp năm lần số tiền vay. Hôm qua anh ta bỏ đi, để lại vợ con, căn nhà đứng tên vợ và một lá thư xin lỗi gửi bạn.`, [
    C("Lấy căn nhà theo giấy đã ký", { counters: step(c, LS, { lsk_hard: 2 }), money: $(c, 0.8), flags: ["lsk_took_house"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [3, 12], note: "lấy nhà của vợ con một con nợ bằng hợp đồng lãi cắt cổ" }, later: { years: 8, storylet: "lsk_grownup" } }, "Thu đủ cả vốn lẫn lãi, cả khu phố nhìn bạn khác"),
    C("Xóa sạch món nợ", { counters: step(c, LS, { lsk_soft: 2 }), money: $(c, -0.4), happy: 3, later: { years: 8, storylet: "lsk_grownup" } }, "Mất trắng, mở tiền lệ cho người khác xin xóa"),
    C("Xóa lãi, cho vợ anh ta trả gốc trong năm năm", { counters: step(c, LS, { lsk_soft: 1 }), money: $(c, -0.1), flags: ["lsk_restructured"], agency: 0.02, later: { years: 8, storylet: "lsk_grownup" } }, "Thu về chậm, không ai mất nhà", { tier: "sovereign", longterm: true })], 0)),
  beat(LS, 4, 5, (c) => {
    const hot = f(c, "lsk_enforcers") || f(c, "lsk_took_house") || cnt(c, "lsk_hard") >= 3;
    if (hot) return T("Chuyên án cho vay nặng lãi", `Một buổi sáng, công an vào tiệm, thu toàn bộ sổ sách. ${f(c, "lsk_enforcers") ? "Hai người trong nhóm đòi nợ đã bị bắt từ tuần trước và đang khai về bạn." : "Một con nợ cũ đã làm đơn tố cáo, kèm cả tập giấy vay có chữ ký của bạn."} ${VN(c) ? "Báo địa phương gọi đây là đường dây tín dụng đen lớn nhất vùng." : "Báo địa phương đưa tin lên trang nhất."}`, [
      C("Thuê luật sư giỏi nhất, chối đến cùng", { counters: step(c, LS), money: $(c, -0.6), gamble: { p: 0.35, win: { income_mult: 0.7, log: "Bạn được tại ngoại rồi vụ án chìm dần. Tiệm mở lại, khách thưa hẳn." }, lose: { unflags: [life(LS)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Tòa tuyên án. Tiệm cầm đồ đóng cửa." } } }, "Có thể thoát, có thể mất cả tiền lẫn tự do"),
      C("Nhận tội, tự trả lại phần lãi vượt luật", leaveTo(LS, "ex_convict", { counters: step(c, LS), money: $(c, -1), close_doors: ["clean_record"], flags: ["lsk_repaid"], agency: 0.03 }), "Mất phần lớn tài sản, án nhẹ, nhìn được mặt người", { tier: "sovereign" }),
      C("Ôm tiền bỏ trốn", { counters: step(c, LS), money: $(c, -0.3), close_doors: ["return_home", "family_table"], flags: ["lsk_fugitive"], happy: -6 }, "Còn tiền, mất nhà, mất bữa cơm gia đình")], 0);
    return T("Giấy phép cho vay", `Tiệm của bạn giờ có ba chi nhánh${f(c, "lsk_rules") ? ", và cả chợ biết luật của bạn" : ""}. Một quy định mới cho phép lập công ty tài chính nhỏ, nhưng lãi phải dưới trần của luật và sổ sách phải công khai. Một người có chức quyền gợi ý: không cần đăng ký, chỉ cần "có người đỡ".`, [
      C("Đăng ký công ty, lãi theo luật, công khai sổ", leaveTo(LS, "investor", { counters: step(c, LS), income_mult: 0.8, flags: ["lsk_legal"], agency: 0.03 }), "Lời ít hơn nhiều, hết sợ tiếng gõ cửa", { tier: "sovereign" }),
      C("Nhờ người đỡ, mở rộng ra cả thành phố", { counters: step(c, LS, { lsk_hard: 1 }), income_mult: 1.5, secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [2, 10], note: "tiền 'đỡ đầu' cho chuỗi tiệm cầm đồ" } }, "Giàu nhanh, buộc đời mình vào một người có quyền"),
      C("Giữ ba tiệm, không lớn thêm", { counters: step(c, LS), happy: 2, flags: ["lsk_stay_small"] })], 0);
  }),
  beat(LS, 5, 6, (c) => T("Cuốn sổ cuối cùng", `Bạn ${c.age} tuổi${f(c, "lsk_fugitive") ? ", sống ở một thành phố không ai biết tên thật của bạn" : ""}. Cuốn sổ trên bàn vẫn còn ${cnt(c, "lsk_soft") > cnt(c, "lsk_hard") ? "vài chục cái tên, phần lớn đã trả gần đủ gốc" : "hàng trăm cái tên, nhiều người đã trả lãi gấp mấy lần gốc"}.${f(c, "lsk_took_house") ? " Căn nhà lấy năm ấy giờ cho thuê, người thuê không biết chuyện cũ." : ""}`, [
    C("Đốt cuốn sổ, xóa hết nợ còn lại", { counters: step(c, LS), ...leave(LS), money: -0.4, happy: 6, rel: 5, flags: ["lsk_burned_book"] }, "Mất một khoản lớn, nhẹ người khi về già", { tier: "sovereign" }),
    C("Thu cho bằng hết trước khi nghỉ", { counters: step(c, LS, { lsk_hard: 1 }), money: 0.5, happy: -3 }, "Thêm một khoản dưỡng già, thêm vài kẻ thù"),
    C("Giao lại cho người kế nghiệp", { counters: step(c, LS), money: 0.2, flags: ["lsk_successor"] }, "Nghề sống tiếp, tên bạn cũng vậy")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(LS, "lsk_gambler", [22, 70], 7, (c) => T("Con bạc thề lần cuối", vary("lskg", c.age, ["Một con bạc quen mặt đến vay lần thứ năm, thề đây là ván cuối, lần này chắc chắn gỡ được.", "Một thanh niên mang giấy tờ xe của bố đến cầm, mắt đỏ vì thức trắng ở sòng bạc."]), [
      C("Cho vay, lãi cao hơn thường lệ", { gamble: { p: 0.4, win: { money: 0.15, log: "Lần này anh ta trả đủ, kèm cả lãi." }, lose: { money: -0.15, counters: { lsk_hard: 1 }, log: "Anh ta biến mất, để lại một tờ giấy vay vô giá trị." } } }, "Lãi lớn, rủi ro lớn, nuôi thêm một cơn nghiện"),
      C("Từ chối, chỉ chỗ giúp người nghiện cờ bạc", { counters: { lsk_soft: 1 }, happy: 1 }, "Mất một khách, có thể cứu một gia đình"),
      C("Gọi cho người nhà anh ta", { gamble: { p: 0.5, win: { rel: 2, flags: ["lsk_called_family"], log: "Người nhà đến đón anh ta về, cảm ơn bạn ngay trước cửa tiệm." }, lose: { counters: { lsk_hard: 1 }, log: "Anh ta chửi bạn giữa chợ, rồi sang vay một tiệm khác." } } }, "Đúng việc, có thể mất khách và mang tiếng", { tier: "awakened" })], 0)),
  daily(LS, "lsk_student", [22, 70], 8, () => T("Chiếc máy tính đem cầm", "Một sinh viên năm cuối mang chiếc máy tính đến cầm để nộp học phí. Trong máy là luận văn chưa nộp, cậu ấy xin được chép ra trước.", [
      C("Ép giá như mọi món đồ", { money: 0.04, counters: { lsk_hard: 1 } }, "Lời thêm một chút, cậu ấy có thể không chuộc kịp"),
      C("Trả giá công bằng, cho chuộc chậm", { money: -0.01, counters: { lsk_soft: 1 }, flags: ["lsk_student_saved"] }, "Bớt lời, có thể được nhớ ơn"),
      C("Cho vay không cần cầm máy", { money: -0.04, counters: { lsk_soft: 1, kind: 1 }, gamble: { p: 0.6, win: { happy: 3, log: "Ba tháng sau cậu ấy quay lại trả đủ, mang theo tấm bằng." }, lose: { happy: -1, log: "Cậu ấy không quay lại." } } }, "Tin người, có thể mất trắng", { tier: "awakened" })], 1)),
  daily(LS, "lsk_fund_crash", [22, 70], 9, (c) => T(VN(c) ? "Hụi vỡ" : "Quỹ góp của chợ sụp đổ", `${VN(c) ? "Chủ hụi ở chợ ôm tiền bỏ trốn." : "Quỹ tiết kiệm góp vòng của cả chợ sụp đổ, người giữ quỹ biến mất."} Chỉ trong ba ngày, mười mấy người bán hàng xếp hàng trước tiệm bạn, ai cũng cần tiền xoay hàng ngay.`, [
      C("Cho tất cả vay, lãi như thường", { money: 0.3, counters: { lsk_hard: 2 }, rel: -3 }, "Một mùa lời lớn, cả chợ nợ bạn"),
      C("Ưu tiên nhà có con đi học, lãi nhẹ", { money: 0.08, counters: { lsk_soft: 1 }, rel: 3 }, "Lời ít, chợ nhớ lâu"),
      C("Rủ các tiểu thương lập quỹ chung, sổ công khai", { money: -0.1, flags: ["lsk_market_fund"], agency: 0.03, rel: 5 }, "Bỏ vốn, mất phần lời, được làm người giữ luật", { tier: "sovereign" })], 0)),
  daily(LS, "lsk_beat_cop", [22, 70], 8, (c, N) => { const o = role(c, "official");
    return T("Lá đơn tố cáo chưa vào sổ", `${o ? N(o) : "Viên cảnh sát khu vực"} ghé tiệm uống trà, nói như chuyện phiếm: có một lá đơn tố cáo tiệm bạn cho vay quá lãi. Lá đơn chưa được vào sổ.`, [
      C("Biếu một phong bì để lá đơn nằm yên", { money: -0.1, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 10], note: "phong bì để ém đơn tố cáo cho vay nặng lãi" }, ...(o ? { trust: { npc: o, delta: 0.2 } } : {}) }, "Yên chuyện bây giờ, bị nắm thóp về sau"),
      C("Hạ lãi, mời kiểm tra sổ sách", { income_mult: 0.85, flags: ["lsk_fair_rate"], counters: { lsk_soft: 1 } }, "Mất lời, bớt một nỗi lo", { tier: "awakened" }),
      C("Làm như không hiểu", { gamble: { p: 0.5, win: { flags: ["lsk_ignored_warning"], log: "Lá đơn không bao giờ được nhắc lại." }, lose: { flags: ["lsk_under_watch"], log: "Tuần sau, tiệm bị kiểm tra đột xuất." } } }, "Không tốn gì, nếu may")], 0, o ? { npc: o } : {}); }),
  daily(LS, "lsk_coins", [22, 70], 9, () => T("Hộp tiền của cô con gái", "Cô con gái mười bảy tuổi của một con nợ mang đến cả hộp tiền lẻ tiết kiệm, xin trả thay tiền lãi tháng này của bố. Cô ấy đếm từng tờ trước mặt bạn.", [
      C("Nhận, ghi vào sổ", { money: 0.01, happy: -4, counters: { lsk_hard: 1 } }, "Đúng sổ sách, đêm đó khó ngủ"),
      C("Trả lại hộp tiền, xóa lãi tháng này", { money: -0.02, counters: { lsk_soft: 1 }, happy: 2 }, "Mất ít tiền, cô ấy giữ được tiền học"),
      C("Trả lại hộp tiền, gọi người bố đến nói chuyện", { counters: { lsk_soft: 1 }, gamble: { p: 0.5, win: { flags: ["lsk_talked_father"], log: "Người bố ngồi lặng trong tiệm. Tháng sau ông ấy trả bằng tiền của chính mình." }, lose: { happy: -2, log: "Người bố không đến. Cô con gái cũng không quay lại." } } }, "Đẩy trách nhiệm về đúng chỗ, chưa chắc có kết quả", { tier: "awakened" })], 1)),
  daily(LS, "lsk_too_far", [22, 70], 10, (c) => T("Con nợ phải nằm viện", `${f(c, "lsk_enforcers") ? "Một người trong nhóm đòi nợ của bạn" : "Đứa cháu bạn nhờ đi đòi hộ"} quay về với bàn tay băng bó, nói "có chút va chạm". Sáng hôm sau, bạn nghe tin con nợ phải nằm viện.`, [
      C("Lo viện phí cho con nợ, đuổi người kia đi", { money: -0.15, flags: ["lsk_paid_hospital"], counters: { lsk_soft: 1 } }, "Mất tiền, người kia có thể quay lại báo thù"),
      C("Coi như không biết", { counters: { lsk_hard: 1 }, flags: ["lsk_covered_up"], happy: -3, later: { years: 3, storylet: "lsk_beat_cop" } }, "Không tốn gì hôm nay, chuyện chưa xong"),
      C("Đưa người kia đến công an tự thú", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["lsk_cooperated"], log: "Người kia nhận tội một mình. Cơ quan điều tra ghi nhận bạn đã chủ động trình báo." }, lose: { close_doors: ["clean_record"], flags: ["lsk_charged"], log: "Người kia khai bạn là người sai đi. Bạn bị gọi lên làm việc suốt nhiều tháng." } } }, "Đúng việc, có thể tự kéo mình vào vụ án", { tier: "sovereign" })], 0)),
  daily(LS, "lsk_unclaimed", [22, 70], 8, () => T("Ngăn kéo đồ quá hạn", "Ngăn kéo đầy đồ quá hạn chuộc: một chiếc đồng hồ cũ khắc tên, một tấm huy chương, một chiếc vòng bạc trẻ con. Theo hợp đồng, tất cả giờ là của bạn.", [
      C("Bán hết theo đúng hợp đồng", { money: 0.1, counters: { lsk_hard: 1 } }, "Đúng giấy tờ, có những thứ không mua lại được"),
      C("Giữ lại những món có khắc tên thêm một năm", { money: -0.02, flags: ["lsk_kept_items"] }, "Đọng vốn, cho người ta thêm một cơ hội"),
      C("Tìm đến từng nhà trả lại đồ kỷ niệm", { money: -0.05, rel: 4, counters: { kind: 1, lsk_soft: 1 } }, "Mất tiền và thời gian, được tiếng lành", { tier: "awakened" })], 0)),
  daily(LS, "lsk_microbank", [22, 70], 9, () => T("Ngân hàng về tận chợ", "Một quỹ tín dụng nhỏ mở chi nhánh ngay đầu chợ, cho người bán hàng vay lãi thấp. Một nửa khách quen của bạn kéo sang đó.", [
      C("Hạ lãi xuống gần bằng họ", { income_mult: 0.8, counters: { lsk_soft: 1 } }, "Giữ được khách, mất phần lớn lời"),
      C("Chuyển sang cho vay những người họ từ chối", { income_mult: 1.1, counters: { lsk_hard: 1 } }, "Giữ lãi, khách ngày càng tuyệt vọng hơn"),
      C("Tung tin đồn quỹ sắp vỡ", { gamble: { p: 0.5, win: { income_mult: 1.1, flags: ["lsk_rumor"], log: "Người ta rút tiền khỏi quỹ. Khách quay về tiệm bạn." }, lose: { rel: -5, flags: ["lsk_rumor"], log: "Người ta lần ra nguồn tin đồn là bạn." } } }, "Có thể lấy lại khách, có thể mất tên")], 0)),
  daily(LS, "lsk_big_debtor", [25, 70], 10, (c, N) => { const o = role(c, "official");
    return T("Con nợ có chức quyền", `${o ? N(o) : "Một người có chức quyền trong vùng"} vay của bạn một khoản lớn, quá hạn đã một năm. Mỗi lần bạn nhắc, người đó lại hỏi thăm giấy phép kinh doanh của tiệm.`, [
      C("Xóa nợ, coi như mua sự bảo kê", { money: -0.3, flags: ["lsk_protected"], ...(o ? { trust: { npc: o, delta: 0.2 } } : {}) }, "Mất một khoản lớn, có người đứng sau lưng"),
      C("Đòi như mọi con nợ khác", { gamble: { p: 0.4, win: { money: 0.3, log: "Người đó trả đủ, rồi không bao giờ quay lại tiệm." }, lose: { income_mult: 0.85, flags: ["lsk_inspected"], log: "Tháng sau, tiệm bị kiểm tra liên tục." } } }, "Đúng luật chơi của bạn, sai luật chơi của họ"),
      C("Giữ giấy vay làm con bài về sau", { flags: ["lsk_holds_hook"], secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [3, 12], note: "giữ giấy nợ của người có chức quyền làm con bài" } }, "Một con bài mạnh, cũng là một mối nguy")], 0, o ? { npc: o } : {}); }),
  daily(LS, "lsk_kin", [22, 70], 10, (c, N) => { const s = role(c, "sibling")!;
    return T(`${N(s)} hỏi vay tiền`, `${N(s)} cần tiền ${VN(c) ? "lợp lại mái nhà trước mùa mưa" : "sửa nhà"} và đến hỏi bạn, như hỏi người trong nhà. Cả họ đang chờ xem bạn có tính lãi với ruột thịt không.`, [
      C("Cho vay không lấy lãi", { money: -0.15, trust: { npc: s, delta: 0.25 } }, "Mất lời, giữ tình"),
      C("Tính lãi như khách, chỉ bớt một chút", { money: 0.05, counters: { lsk_hard: 1 }, memory: { npc: s, tag: "HUMILIATED_ME", weight: -0.3, note: "bị tính lãi như người ngoài khi hỏi vay sửa nhà" } }, "Đúng nghề, mất một người thân"),
      C("Cho hẳn một khoản, không ghi sổ", { money: -0.25, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "cho tiền sửa nhà không cần trả" } }, "Tốn nhiều hơn, cả họ nhìn bạn khác đi")], 0, { npc: s }); }, (c) => !!role(c, "sibling")),
  daily(LS, "lsk_grownup", [30, 75], 99, (c) => {
    if (f(c, "lsk_took_house")) return T("Tập hồ sơ của người con trai", "Một người đàn ông trẻ mặc vest bước vào tiệm. Anh ta là con trai người bán rau năm ấy, đứa bé đã cùng mẹ dọn khỏi căn nhà bạn lấy. Giờ anh ta là luật sư, và mang theo một tập hồ sơ.", [
      C("Ra tòa, dựa vào giấy tờ đã ký", { money: -0.2, gamble: { p: 0.5, win: { flags: ["lsk_won_case"], log: "Tòa xử bạn thắng vì giấy tờ hợp lệ. Báo chí thì không nghĩ vậy." }, lose: { money: -0.6, close_doors: ["clean_record"], log: "Tòa tuyên hợp đồng vô hiệu vì lãi vượt luật. Bạn mất nhà và có án." } } }, "Có thể giữ được nhà, có thể mất nhiều hơn"),
      C("Trả lại căn nhà", { money: -0.6, happy: 5, flags: ["lsk_returned_house"], custom: "apologize" }, "Mất một tài sản lớn, khép lại một chuyện cũ", { tier: "sovereign" }),
      C("Đưa một khoản tiền để anh ta rút hồ sơ", { money: -0.3, flags: ["lsk_settled"] }, "Ít tốn hơn, chuyện cũ vẫn còn đó")], 1);
    return T("Người con trai năm ấy", "Một người đàn ông trẻ bước vào tiệm, chào bạn bằng tên. Anh ta là con của một con nợ cũ, lớn lên nhờ những năm bạn giãn nợ cho mẹ anh. Giờ anh ta có việc làm tốt, và có một đề nghị.", [
      C("Cùng anh ta lập quỹ vay lãi thấp cho người bán chợ", leaveTo(LS, "investor", { money: -0.3, flags: ["lsk_fair_fund"], agency: 0.03 }), "Bỏ nghề cũ, lời ít, làm điều mình từng muốn", { tier: "sovereign" }),
      C("Cảm ơn, mời anh ta một bữa cơm", { happy: 4, rel: 2, flags: ["lsk_remembered"] }, "Một bữa cơm ấm, nghề vẫn là nghề")], 1);
  }),

  /* ---------- gia đình ---------- */
  cross(LS, "lsk_family", [28, 70], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => { const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị gọi là con chủ nợ`, `${N(k)} đi học về, mắt đỏ. Một bạn cùng lớp nói trước cả lớp rằng nhà bạn ấy khánh kiệt vì nhà ${N(k)}. ${N(k)} hỏi bạn chuyện đó có thật không.`, [
      C("Nói đó là chuyện làm ăn của người lớn", { trust: { npc: k, delta: -0.15 } }, "Gọn chuyện, con giữ câu hỏi ấy một mình"),
      C("Kể thật, để con hỏi bất cứ điều gì", { trust: { npc: k, delta: 0.2 }, happy: -3 }, "Con biết bạn là ai, cả phần khó nghe", { tier: "awakened" }),
      C("Đến gặp gia đình bạn kia, giãn nợ cho họ", { money: -0.15, counters: { lsk_soft: 1 }, trust: { npc: k, delta: 0.25 } }, "Mất tiền, con thấy bạn sửa sai", { tier: "sovereign" })], 1, { npc: k });
    return T("Nghề mà bố mẹ từng sợ", `Hồi bạn còn nhỏ, cả nhà từng trốn một người cho vay suốt một mùa mưa. ${N(p!)} nhớ rõ chuyện đó. Giờ ${N(p!)} nghe hàng xóm gọi bạn là "chủ nợ".`, [
      C("Giải thích rằng mình làm khác người năm xưa", { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.15 }, log: `${N(p!)} không nói gì, nhưng thôi tránh mặt bạn.` }, lose: { trust: { npc: p!, delta: -0.2 }, log: `${N(p!)} chỉ nói: "Ai làm nghề này cũng nghĩ mình khác."` } } }),
      C("Đưa bố mẹ tiền để họ thôi hỏi", { money: -0.1, trust: { npc: p!, delta: -0.05 } }, "Tiền thay lời, không thay được ý nghĩ"),
      C("Hứa sẽ bỏ nghề trong ba năm", { promise: { to: p!, what: "bỏ nghề cho vay lãi trong ba năm", years: 3 }, trust: { npc: p!, delta: 0.2 } }, "Lời hứa sẽ bị đòi", { tier: "awakened" })], 0, { npc: p! }); }),

  /* ================================================================ KẺ LỪA ĐẢO TRÊN MẠNG ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(SC, "scm_t_story", [12, 16], () => true, (c) => T("Câu chuyện bán được thiệp", "Bạn bán hết ba mươi tấm thiệp tự vẽ cho cả khối chỉ bằng một câu chuyện: tiền sẽ gửi cho một bạn đang nằm viện. Không có bạn nào nằm viện cả. Ai cũng tin, kể cả cô giáo.", [
    C("Giữ tiền, lần sau kể chuyện hay hơn", { money: $(c, 0.02), flags: [talentFlag(SC)], counters: { talents_seen: 1, honest: -2 } }, "Biết mình khiến người khác tin được"),
    C("Thú thật, trả lại tiền", { counters: { talents_seen: 1, honest: 2 }, rel: -2, happy: -2 }, "Xấu hổ một tuần, nhẹ lòng lâu hơn"),
    C("Mang tài kể chuyện đi thi hùng biện", { counters: { talents_seen: 1 }, know: 4, flags: ["scm_orator"] }, "Cùng một tài, một con đường khác", { tier: "awakened" })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(SC, "scm_d_job_ad", [18, 35], (c) => c.poor_country || c.broke || c.scarcity || !c.has_job, (c) => T("Việc nhẹ lương cao", `Một trang tuyển dụng đăng tin: nhân viên chăm sóc khách hàng ở nước ngoài, bao vé máy bay, lương gấp ${c.poor_country ? "năm" : "ba"} lần ở nhà. Người tuyển dụng nhắn tin rất nhanh, rất thân, và giục bạn đi ngay trong tuần.`, [
    C("Đi ngay, kẻo mất chỗ", { ...become(SC), counters: { doors_seen: 1 }, flags: ["scm_trapped"], happy: -8, bw: -8, log: "Đến nơi, người ta thu hộ chiếu của bạn, chỉ vào một dãy bàn máy tính và nói bạn đang nợ tiền vé." }, "Một lối thoát nghèo, hoặc một cái bẫy"),
    C("Đòi xem hợp đồng và địa chỉ thật", { counters: { doors_seen: 1 }, gamble: { p: 0.6, win: { flags: ["scm_dodged"], log: "Người tuyển dụng chặn bạn. Ba tháng sau, bạn đọc tin về những người được giải cứu khỏi đúng 'công ty' đó." }, lose: { ...become(SC), flags: ["scm_trapped"], log: "Họ gửi một bản hợp đồng rất đẹp. Bạn đi, và hiểu ra khi đã quá muộn." } } }, "Chậm hơn, vẫn có thể bị lừa", { tier: "awakened" }),
    C("Không đi", { counters: { doors_seen: 1 } })], 2)),
  door(SC, "scm_d_flat", [18, 35], (c) => !!role(c, "childhood_friend"), (c, N) => { const fr = role(c, "childhood_friend")!;
    return T("Căn hộ có mười chiếc điện thoại", `${N(fr)} đi xe mới, nói đang làm "bán hàng online" và rủ bạn vào nhóm. Trong căn hộ thuê có mười chiếc điện thoại, mỗi chiếc dán một cái tên không phải tên thật. Bạn hiểu ngay đây là việc gì.`, [
      C("Nhận, làm vài tháng gom ít vốn", { ...become(SC), counters: { doors_seen: 1 }, money: 0.15, memory: { npc: fr, tag: "WIN_WIN_DEAL", weight: 0.2, note: "rủ vào nhóm 'bán hàng online' trong căn hộ thuê" } }, "Tiền nhanh, không có 'vài tháng' nào cả"),
      C("Từ chối, khuyên bạn ấy dừng lại", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { memory: { npc: fr, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: "khuyên bỏ nhóm lừa đảo trước khi quá muộn" }, log: `Một năm sau, ${N(fr)} gọi cho bạn: đã bỏ, đang làm lại từ đầu.` }, lose: { trust: { npc: fr, delta: -0.2 }, log: `${N(fr)} cười, bảo bạn nghèo vì nghĩ nhiều.` } } }, "Có thể cứu một người bạn, có thể mất người bạn đó"),
      C("Lặng lẽ rời đi, không nói gì", { counters: { doors_seen: 1 } })], 1, { npc: fr }); }),

  /* ---------- mạch truyện ---------- */
  beat(SC, 1, 1, (c) => { const tr = f(c, "scm_trapped");
    return T("Xấp giấy in sẵn", `${tr ? "Người quản lý nói ai không đạt chỉ tiêu thì nợ thêm tiền vé, rồi nhìn bạn rất lâu." : "Trưởng nhóm đưa bạn một xấp giấy in sẵn, bảo đọc thuộc trước tối."} Người đầu tiên bạn gọi là một bà giáo về hưu. Bà kể mãi về đứa cháu đang đi học xa, rồi hỏi bạn đã ăn cơm chưa.`, [
      C("Làm đúng như giấy in sẵn", { counters: step(c, SC, { scm_victims: 1 }), ...(tr ? {} : { money: $(c, 0.1) }), happy: -5, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [3, 12], note: "lừa tiền dưỡng già của một bà giáo về hưu" } }, tr ? "Bớt nợ, khỏi bị phạt; bà ấy mất tiền dưỡng già" : "Có tiền ngay; bà ấy mất tiền dưỡng già"),
      C("Cố tình làm hỏng cuộc gọi", { counters: step(c, SC), flags: ["scm_saboteur"], health: tr ? -6 : -1, ...(tr ? {} : { money: $(c, -0.02) }) }, tr ? "Bà ấy giữ được tiền, bạn bị phạt" : "Bà ấy giữ được tiền, cả nhóm bắt đầu nghi bạn"),
      C("Nói khẽ với bà: hãy cúp máy, đừng tin ai", { counters: step(c, SC), agency: 0.02, gamble: { p: 0.6, win: { flags: ["scm_warned"], log: "Bà im lặng một lúc rồi cúp máy. Không ai nghe thấy bạn." }, lose: { health: -8, flags: ["scm_warned", "scm_marked"], log: "Người quản lý đứng ngay sau lưng bạn. Bạn bị phạt suốt một tuần." } } }, "Cứu một người, có thể trả giá bằng chính mình", { tier: "sovereign" })], 0); }),
  beat(SC, 2, 3, (c) => { const tr = f(c, "scm_trapped");
    return T("Chiếc ghế tổ trưởng", `${tr ? "Ba năm trong khu, bạn thuộc mọi luật lệ không ai nói ra." : "Nhóm của bạn đã chuyển sang một căn hộ lớn hơn."} Số liệu của bạn đứng đầu bảng. Họ muốn bạn làm tổ trưởng: ít gọi điện hơn, kèm người mới${tr ? ", những người vừa đến, sợ hãi như bạn ngày đầu" : ""}.`, [
      C("Nhận ghế tổ trưởng", { counters: step(c, SC, { scm_victims: 3 }), income_mult: 1.6, flags: ["scm_lead"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [3, 12], note: "cầm đầu một tổ gọi điện lừa đảo" } }, "Ít phải gọi, tay dính sâu hơn"),
      C("Từ chối, ngồi lại bàn cũ", { counters: step(c, SC, { scm_victims: 1 }), happy: -2 }, "Giữ khoảng cách, không ai che chở bạn"),
      C("Nhận, rồi lén giúp người mới liên lạc về nhà", { counters: step(c, SC, { scm_victims: 1 }), income_mult: 1.2, flags: ["scm_lead", "scm_inside_help"], agency: 0.03, gamble: { p: 0.65, win: { flags: ["scm_saved_three"], log: "Ba người mới gửi được tin về nhà mà không ai hay." }, lose: { health: -10, unflags: ["scm_lead"], log: "Một người mới bị tra hỏi và nói ra tên bạn. Bạn mất ghế, và bị phạt nặng." } } }, "Đứng giữa hai phía, sai một bước là hết", { tier: "sovereign" })], 0); }),
  beat(SC, 3, 4, (c) => {
    if (f(c, "scm_trapped")) return T("Đêm còi hú", "Nửa đêm, còi hú khắp khu. Cảnh sát ập vào cổng trước. Bảo vệ lùa mọi người ra xe ở cổng sau, nói ai ở lại sẽ bị bắt như tội phạm. Hộ chiếu của bạn vẫn nằm trong két của họ.", [
      C("Chạy về phía cảnh sát", { counters: step(c, SC), unflags: [life(SC)], gamble: { p: f(c, "scm_lead") ? 0.4 : 0.65, win: { custom: "job_lose", flags: ["scm_rescued"], log: "Bạn được xác định là nạn nhân bị lừa bán sức lao động và được đưa về nước sau ba tháng." }, lose: { custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Hồ sơ cho thấy bạn đã gọi hàng trăm cuộc. Bạn bị xử như người trong đường dây." } } }, "Tự do, hoặc bị xử như một kẻ lừa đảo"),
      C("Lên xe ra cổng sau", { counters: step(c, SC, { scm_victims: 2 }), flags: ["scm_deeper"], happy: -6 }, "Thoát cảnh sát, lún sâu hơn"),
      C("Mang theo danh sách nạn nhân, ra trình báo", { counters: step(c, SC), unflags: [life(SC)], agency: 0.03, gamble: { p: 0.75, win: { custom: "job_lose", flags: ["scm_witness"], log: "Danh sách giúp nhiều gia đình lấy lại tiền. Bạn về nước với tư cách nhân chứng." }, lose: { custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], flags: ["scm_witness"], log: "Bạn vẫn bị xử, nhưng tòa ghi nhận lời khai của bạn." } } }, "Rủi ro hơn, nhưng là lối thoát có ích nhất", { tier: "sovereign" })], 0);
    return T("Trưởng nhóm bị bắt", `Sáng nay, trưởng nhóm bị bắt ngay trong căn hộ. Hôm đó bạn đến muộn nên thoát. ${cnt(c, "scm_victims") >= 3 ? "Trong máy anh ta có tên bạn, và cả số tiền bạn đã nhận." : "Bạn không biết anh ta sẽ khai những gì."}`, [
      C("Ra đầu thú, khai hết", leaveTo(SC, "ex_convict", { counters: step(c, SC), close_doors: ["clean_record"], agency: 0.02, happy: 2 }), "Mất tự do vài năm, hết phải chạy"),
      C("Xóa hết, đổi chỗ ở, đổi cả tên", { counters: step(c, SC, { scm_victims: 1 }), flags: ["scm_deeper"], bw: -6, secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 8], note: "đổi danh tính sau khi nhóm lừa đảo bị bắt" } }, "Còn tự do, phải sống như một người khác"),
      C("Trả lại tiền cho những người còn liên lạc được", { counters: step(c, SC), ...leave(SC), money: $(c, -0.6), flags: ["scm_repaid"], agency: 0.03, gamble: { p: 0.6, win: { log: "Vài nạn nhân rút đơn. Cơ quan điều tra ghi nhận bạn đã khắc phục hậu quả." }, lose: { close_doors: ["clean_record"], custom: "become:ex_convict", log: "Bạn vẫn bị khởi tố, nhưng mức án nhẹ hẳn." } } }, "Mất hết tiền đã kiếm, chưa chắc thoát tội", { tier: "sovereign" })], 0);
  }),
  beat(SC, 4, 5, (c) => {
    if (f(c, "scm_lead") || f(c, "scm_deeper")) return T("Một khu của riêng bạn", `Ông chủ muốn mở thêm một khu ở thành phố khác và giao cho bạn${f(c, "scm_trapped") ? ": người từng bị giữ sẽ thành người giữ người khác" : ": người, máy, chỗ ở, mọi thứ đã có sẵn"}. Phần chia gấp mười những năm trước. Trên điện thoại bạn, bài báo về một gia đình mất nhà vì bị lừa vẫn mở từ tối qua.`, [
      C("Nhận khu, làm ông chủ", { counters: step(c, SC, { scm_victims: 5 }), income_mult: 1.8, money: $(c, 0.8), flags: ["scm_boss"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.8, fuse_years: [2, 10], note: "cầm đầu một khu lừa đảo qua mạng" }, later: { years: 4, storylet: "scm_summons" } }, "Giàu nhất đời, án nặng nhất nếu sụp"),
      C("Lấy phần tiền của mình, biến mất về quê", { counters: step(c, SC), ...leave(SC), money: $(c, 0.6), flags: ["scm_vanished"], bw: -4 }, "Thoát khỏi nghề, không thoát khỏi hồ sơ"),
      C("Liên lạc cảnh sát, làm nhân chứng từ bên trong", { counters: step(c, SC), ...leave(SC), agency: 0.04, gamble: { p: 0.5, win: { flags: ["scm_witness"], log: "Ba tháng sau, cả đường dây bị triệt phá. Bạn được hưởng khoan hồng." }, lose: { health: -12, flags: ["scm_marked"], close_doors: ["return_home"], log: "Ông chủ phát hiện. Bạn thoát được, nhưng phải sống lẩn tránh nhiều năm." } } }, "Có thể phá cả đường dây, có thể phải trốn cả đời", { tier: "sovereign" })], 0);
    return T("Món nợ không bao giờ hết", f(c, "scm_trapped")
      ? "Năm thứ chín trong khu. Món nợ tiền vé không bao giờ giảm, mỗi lần bạn hỏi lại tăng thêm. Ở nhà, người ta đã thôi gọi cho bạn."
      : "Nhóm cũ tan, bạn trôi từ nhóm này sang nhóm khác, mỗi chỗ trả ít hơn chỗ trước. Bạn nợ những người không bao giờ cho ai nghỉ.", [
      C("Bỏ trốn, bằng mọi giá", { counters: step(c, SC), gamble: { p: 0.4, win: { ...leave(SC), flags: ["scm_escaped"], log: "Sau ba ngày đi bộ, bạn đến được một đồn cảnh sát và kể hết." }, lose: { health: -12, happy: -6, log: "Bạn bị bắt lại sau hai ngày." } } }, "Tự do, hoặc một trận đòn"),
      C("Nhờ gia đình vay tiền chuộc mình ra", { counters: step(c, SC), unflags: [life(SC)], custom: "borrow:1|job_lose", happy: 3, flags: ["scm_bought_out"] }, "Thoát ra, cả nhà gánh nợ"),
      C("Cắn răng gọi tiếp", { counters: step(c, SC, { scm_victims: 2 }), health: -8, happy: -6 }, "Sống qua thêm một năm, thêm người mất tiền")], 2);
  }),
  beat(SC, 5, 6, (c, N) => { const m = role(c, "mother") ?? role(c, "father");
    return T("Số điện thoại thuộc lòng", `Danh sách số gọi sáng nay có một số bạn thuộc lòng từ năm sáu tuổi: số nhà bạn${m ? `, nơi ${N(m)} vẫn sống` : ""}. ${f(c, "scm_boss") ? "Một người mới trong khu của bạn sẽ gọi số này lúc mười giờ." : "Người ngồi bàn bên sẽ gọi số này lúc mười giờ."}`, [
      C("Lặng lẽ gạch số đó đi, không nói gì", { counters: step(c, SC), happy: -4, flags: ["scm_spared_home"] }, "Cứu nhà mình, những số khác vẫn còn"),
      C("Gọi về nhà bằng giọng thật của mình", { counters: step(c, SC), ...(m ? { trust: { npc: m, delta: 0.3 } } : {}), happy: 5, rel: 3 }, "Lần đầu sau nhiều năm, không có giấy in sẵn"),
      C("Mang cả danh sách ra nộp cho công an", { counters: step(c, SC), ...leave(SC), close_doors: ["clean_record"], flags: ["scm_turned_in"], agency: 0.03 }, "Hàng trăm nhà được báo trước, bạn ra tòa", { tier: "sovereign" })], 1, m ? { npc: m } : {}); }, (c) => c.age >= 35),

  /* ---------- chuyện thường ngày ---------- */
  daily(SC, "scm_board", [18, 60], 6, (c) => T("Bảng xếp hạng cuối tháng", vary("scmb", c.age, ["Cuối tháng, bảng xếp hạng dán trên tường. Ba cái tên cuối bảng sẽ bị phạt trước mặt mọi người.", "Chỉ tiêu tháng này tăng gấp rưỡi. Ai không đạt bị cắt tiền ăn."]), [
      C("Cố đạt chỉ tiêu bằng mọi giá", { counters: { scm_victims: 1 }, money: 0.1, happy: -4 }, "Thoát phạt, thêm một gia đình mất tiền"),
      C("Chịu phạt, không gọi thêm", { health: -5, flags: ["scm_refused_quota"] }, "Thân đau, tay sạch thêm một tháng", { longterm: true }),
      C("Nhận phạt thay cho người mới cuối bảng", { health: -8, rel: 3, flags: ["scm_shielded"] }, "Đau gấp đôi, có một người nhớ ơn bạn", { tier: "awakened" })], 0)),
  daily(SC, "scm_ticket", [18, 60], 8, () => T("Chiếc vé máy bay đã đặt", "Một người mẹ đơn thân đã nhắn tin với 'bạn' suốt bốn tháng. Chị vừa gửi ảnh chiếc vé máy bay đặt bằng tiền dành dụm, nói muốn gặp người duy nhất chịu nghe chị nói. Trưởng nhóm bảo: đây là lúc lấy khoản lớn.", [
      C("Làm theo lời trưởng nhóm", { money: 0.2, counters: { scm_victims: 1 }, happy: -6, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [2, 10], note: "lấy khoản tiền dành dụm cuối cùng của một người mẹ đơn thân" }, later: { years: 3, storylet: "scm_news" } }, "Đạt chỉ tiêu, một người mất chỗ dựa cuối cùng"),
      C("Biến mất khỏi cuộc trò chuyện", { flags: ["scm_let_go"], health: -3 }, "Chị ấy giữ được tiền, bạn bị phạt vì bỏ 'khách'"),
      C("Nói thật với chị rằng đây là lừa đảo", { agency: 0.02, gamble: { p: 0.55, win: { flags: ["scm_confessed"], log: "Chị im lặng rất lâu, rồi gửi lại hai chữ: cảm ơn." }, lose: { health: -8, flags: ["scm_marked"], log: "Tin nhắn bị kiểm tra. Bạn bị phạt nặng." } } }, "Đúng với chị ấy, nguy hiểm cho bạn", { tier: "sovereign" })], 0)),
  daily(SC, "scm_newbie", [18, 60], 8, (c) => { const tr = f(c, "scm_trapped");
    return T("Người mới đến", tr
      ? vary("scmn", c.age, ["Một cô gái mười chín tuổi vừa đến, khóc cả đêm ở giường bên. Cô ấy cũng tin vào một tin tuyển dụng như bạn.", "Một cậu trai từ vùng quê nghèo vừa đến, hỏi bạn khi nào thì được làm việc 'chăm sóc khách hàng' thật."])
      : "Nhóm vừa nhận thêm một cậu mười chín tuổi, mới học xong. Cậu ấy hỏi bạn, rất khẽ: làm việc này có bị bắt không?", [
      C("Dạy người đó luật ngầm để sống sót", { counters: { scm_victims: 1 }, flags: ["scm_mentor"] }, "Giúp người đó đỡ khổ, cũng là dạy họ lừa"),
      C(tr ? "Giúp người đó gửi tin về nhà" : "Nói thật, khuyên cậu ấy về ngay", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["scm_inside_help"], log: tr ? "Tin nhắn đến được nhà. Hai tháng sau, người đó được chuộc về." : "Cậu ấy về quê ngay tối đó, không chào ai." }, lose: { health: -6, flags: ["scm_marked"], log: tr ? "Tin nhắn bị phát hiện. Cả hai bị phạt." : "Cậu ấy kể lại với trưởng nhóm. Từ đó bạn bị để mắt." } } }, "Có thể cứu một người, có thể hại cả hai", { tier: "sovereign" }),
      C("Không dính vào", { happy: -3 })], 0); }),
  daily(SC, "scm_call_home", [18, 60], 8, (c) => { const tr = f(c, "scm_trapped");
    if (tr) return T("Năm phút gọi về nhà", "Mỗi tháng bạn được gọi về nhà năm phút. Người quản lý đứng ngay sau lưng, tay đặt sẵn lên nút tắt máy.", [
      C("Nói mọi thứ đều ổn", { happy: -4, flags: ["scm_hid_truth"] }, "An toàn, nhà bạn sẽ không bao giờ biết"),
      C("Nói một câu chỉ người nhà mới hiểu", { gamble: { p: 0.5, win: { flags: ["scm_family_knows"], log: "Người nhà hiểu ra và đi trình báo." }, lose: { health: -8, log: "Người quản lý nghe ra. Bạn mất quyền gọi về nhà." } } }, "Có thể là đường ra, có thể mất cả năm phút ấy"),
      C("Xin gia đình gửi tiền chuộc", { custom: "borrow:0.6", gamble: { p: 0.5, win: { unflags: [life(SC)], custom: "job_lose", flags: ["scm_bought_out"], log: "Gia đình vay tiền chuộc bạn về." }, lose: { happy: -8, log: "Tiền gửi sang, nhưng họ đòi thêm." } } }, "Có thể về nhà, cả nhà gánh nợ")], 0);
    return T("Mẹ hỏi chuyện công ty", "Người nhà gọi hỏi 'công ty bán hàng online' của bạn dạo này thế nào, và khoe với cả xóm rằng con mình làm văn phòng.", [
      C("Nói dối tiếp", { happy: -2, counters: { honest: -1 } }, "Nhà vẫn tự hào, lời nói dối dày thêm"),
      C("Kể thật", { gamble: { p: 0.5, win: { flags: ["scm_family_knows"], happy: 2, log: "Người nhà lặng đi, rồi bảo bạn về, nhà sẽ lo." }, lose: { rel: -4, flags: ["scm_family_knows"], log: "Người nhà cúp máy. Một tháng sau mới gọi lại." } } }, "Mất niềm tự hào của nhà, có người cùng gánh"),
      C("Gửi tiền về xây nhà cho bố mẹ", { money: -0.4, flags: ["scm_house_home"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.4, fuse_years: [3, 12], note: "căn nhà của bố mẹ xây bằng tiền lừa đảo" } }, "Bố mẹ có nhà mới, đứng tên trên đồng tiền bẩn")], 0); }),
  daily(SC, "scm_news", [18, 65], 7, (c) => T("Bản tin bảy giờ tối", vary("scmt", c.age, ["Bản tin tối kể về một người phụ nữ mất cả căn nhà vì một cuộc gọi. Những câu chị ấy nghe giống hệt những câu bạn nói mỗi ngày.", "Trên mạng, một người con trai đăng ảnh bố mình ngồi thẫn thờ: ông mất hết tiền dưỡng già trong một buổi chiều."]), [
      C("Tắt đi, ngủ", { happy: -2, counters: { scm_guilt: 1 } }, "Qua được đêm nay"),
      C("Ẩn danh góp tiền vào quỹ ủng hộ nạn nhân", { money: -0.1, counters: { scm_guilt: -1, kind: 1 } }, "Nhẹ lòng một chút, không trả lại được bao nhiêu"),
      C("Ghi tên người ấy vào một cuốn sổ riêng", { flags: ["scm_names_book"], counters: { scm_guilt: 1 } }, "Một ngày bạn sẽ phải nhìn vào cuốn sổ đó", { tier: "awakened" })], 0)),
  daily(SC, "scm_summons", [18, 65], 9, (c) => T("Cuộc gọi từ cơ quan điều tra", "Một điều tra viên gọi vào số cá nhân của bạn, đọc đúng họ tên và ngày sinh của bạn, mời bạn đến làm việc về \"một số giao dịch\". Giọng anh ta bình thản, như đã biết hết.", [
      C("Đến, khai thật mọi chuyện", { ...leave(SC), agency: 0.02, gamble: { p: f(c, "scm_trapped") ? 0.6 : 0.35, win: { flags: ["scm_witness"], log: "Bạn được xem là người bị lôi kéo và được làm nhân chứng." }, lose: { close_doors: ["clean_record"], custom: "become:ex_convict", log: "Bạn bị khởi tố. Lời khai thật giúp mức án nhẹ hơn." } } }, "Chấm dứt mọi chuyện, cái giá chưa biết"),
      C("Đổi số, đổi chỗ ở", { bw: -6, money: -0.1, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 8], note: "trốn giấy mời của cơ quan điều tra bằng giấy tờ giả" } }, "Thêm một tội, thêm vài năm chạy trốn"),
      C("Đến nhưng chối hết", { gamble: { p: 0.5, win: { flags: ["scm_on_file"], log: "Họ cho bạn về, nhưng giữ lại hồ sơ." }, lose: { unflags: [life(SC)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Họ cho bạn nghe chính đoạn ghi âm giọng mình. Bạn bị tạm giam." } } }, "Có thể qua, có thể bị bắt ngay tại chỗ")], 0)),
  daily(SC, "scm_fever", [18, 60], 8, (c) => T("Cơn sốt giữa ca", f(c, "scm_trapped") ? "Bạn sốt cao đã ba ngày. Người quản lý nói ai nghỉ thì cộng thêm vào nợ, và ai ốm lâu thì 'bị chuyển đi'." : "Bạn sốt cao đã ba ngày, nhưng trưởng nhóm nói tuần này là tuần 'chốt' lớn nhất năm.", [
      C("Cắn răng gọi tiếp", { health: -8, counters: { scm_victims: 1 }, money: 0.03 }, "Giữ chỗ, cơ thể nhớ lâu hơn bạn nghĩ"),
      C("Nằm nghỉ, chịu phạt", { health: 4, money: -0.05, flags: ["scm_rested"] }, "Lành bệnh, nợ thêm hoặc mất tiền tuần này"),
      C("Xin cho cả phòng được khám bệnh một lần", { agency: 0.02, gamble: { p: 0.4, win: { health: 6, rel: 3, flags: ["scm_spoke_up"], log: "Họ cho một người đến khám cả phòng, vì sợ mất người làm." }, lose: { health: -4, flags: ["scm_marked"], log: "Bạn bị coi là kẻ gây chuyện." } } }, "Lên tiếng cho nhiều người, bị chú ý", { tier: "sovereign" })], 1)),
  daily(SC, "scm_recruit", [18, 60], 9, (c, N) => { const s = role(c, "sibling") ?? role(c, "childhood_friend");
    return T("Rủ thêm người quê", `${f(c, "scm_trapped") ? "Ông chủ hứa xóa một phần nợ" : "Trưởng nhóm hứa thưởng một khoản lớn"} nếu bạn rủ được thêm người. ${s ? `${N(s)} vừa nhắn hỏi bạn bên đó có việc gì cho mình không.` : "Một người cùng quê vừa nhắn hỏi bạn bên đó có việc gì không."}`, [
      C("Rủ người đó sang", { money: 0.15, counters: { scm_victims: 1 }, close_doors: ["village_trust"], ...(s ? { memory: { npc: s, tag: "CHEATED_ME", weight: -0.6, note: "rủ sang làm 'việc nhẹ lương cao' rồi bị giữ lại" } } : {}) }, "Bớt nợ cho mình, đẩy người thân vào đúng cái bẫy cũ"),
      C("Nói không có việc gì", { happy: -1, flags: ["scm_kept_out"] }, "Giữ được người quê, ông chủ không vui"),
      C("Nhắn về quê: đừng ai tin việc nhẹ lương cao", { agency: 0.02, gamble: { p: 0.6, win: { rel: 4, flags: ["scm_warned_home"], log: "Tin nhắn lan khắp xóm. Năm đó không ai trong làng đi theo tin tuyển dụng ấy." }, lose: { health: -8, flags: ["scm_marked"], log: "Tin nhắn bị kiểm tra trước khi gửi đi." } } }, "Cứu được nhiều người, có thể bị phát hiện", { tier: "sovereign" })], 1, s ? { npc: s } : {}); }),
  daily(SC, "scm_face", [18, 60], 9, () => T("Gương mặt trong ảnh đại diện", "Tấm ảnh đại diện bạn dùng mỗi ngày là của một cô y tá thật ở một nước xa. Hôm nay cô ấy đăng lời kêu gọi: đã có ba người tìm đến tận bệnh viện, nói cô ấy lừa họ.", [
      C("Dùng tiếp, để sau hẵng thay", { counters: { scm_victims: 1 }, money: 0.05 }, "Không mất khách, thêm một người vô can bị vạ lây"),
      C("Thay ảnh ngay hôm nay", { flags: ["scm_changed_face"], money: -0.02 }, "Mất vài khách đang 'nóng'"),
      C("Nhắn ẩn danh cho cô ấy những gì bạn biết", { agency: 0.02, gamble: { p: 0.6, win: { flags: ["scm_tipped"], log: "Cô ấy chuyển tin nhắn cho cảnh sát. Một loạt tài khoản bị khóa." }, lose: { flags: ["scm_on_file"], log: "Tin nhắn bị lần ngược lại, đến tận máy của bạn." } } }, "Giúp người vô can, để lại dấu vết", { tier: "awakened" })], 1)),
  daily(SC, "scm_lobby", [18, 60], 9, (c) => { const tr = f(c, "scm_trapped");
    return T("Người đứng chờ ngoài cổng", tr
      ? "Qua khe cửa sổ, bạn thấy một nhóm người cầm ảnh người thân đứng ngoài cổng khu, đòi gặp. Trong một tấm ảnh là gương mặt một người bạn từng nói chuyện qua điện thoại."
      : "Một người đàn ông ngồi chờ dưới sảnh tòa nhà suốt ba ngày, tay cầm ảnh vợ. Bà ấy mất hết tiền tiết kiệm sau một cuộc gọi từ chính căn hộ của nhóm bạn.", [
      C("Tránh mặt, đi lối khác", { happy: -3, counters: { scm_guilt: 1 } }, "Không ai biết, kể cả bạn sẽ cố quên"),
      C(tr ? "Ném qua cửa sổ mẩu giấy ghi những gì bạn biết" : "Xuống gặp, trả lại phần tiền mình đã nhận", { agency: 0.02, ...(tr ? {} : { money: -0.2 }), gamble: { p: 0.5, win: { flags: ["scm_faced_victim"], log: tr ? "Một người nhặt được mẩu giấy và đưa cho cảnh sát." : "Ông ấy nhận tiền, không nói một lời, rồi đi." }, lose: { flags: ["scm_faced_victim", "scm_on_file"], log: tr ? "Bảo vệ thấy bạn ở cửa sổ. Bạn bị chuyển sang phòng khác." : "Ông ấy chụp ảnh bạn và nộp cho công an." } } }, "Đối diện một phần sự thật, để lộ mình", { tier: "sovereign" }),
      C("Báo cho trưởng nhóm", { counters: { scm_victims: 1 }, happy: -6, flags: ["scm_reported_victim"] }, "Nhóm yên chuyện, bạn không biết người kia ra sao")], 0); }),

  /* ---------- gia đình ---------- */
  cross(SC, "scm_home_call", [20, 65], (c) => !!role(c, "mother") || !!role(c, "father") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => { const p = role(c, "mother") ?? role(c, "father"); const k = role(c, "child");
    if (p) return T("Cuộc gọi lừa vào nhà mình", `${N(p)} gọi cho bạn, giọng run: vừa chuyển hết tiền tiết kiệm cho một người lạ qua điện thoại. Những câu người đó nói, bạn thuộc từng chữ.`, [
      C("Bù lại toàn bộ số tiền, không nói gì", { money: -0.3, trust: { npc: p, delta: 0.2 }, happy: -4 }, "Bố mẹ yên lòng, bạn biết rõ tiền mình từ đâu"),
      C("Đưa bố mẹ đi trình báo công an", { trust: { npc: p, delta: 0.1 }, gamble: { p: 0.6, win: { flags: ["scm_family_report"], log: "Công an ghi nhận đơn. Không ai hỏi gì về bạn." }, lose: { flags: ["scm_on_file"], log: "Điều tra viên hỏi bạn làm nghề gì, và ghi lại câu trả lời." } } }, "Đúng việc phải làm, công an có thể hỏi đến bạn"),
      C("Kể thật với bố mẹ bạn làm nghề gì", { trust: { npc: p, delta: -0.3 }, flags: ["scm_told_parents"], happy: 2, agency: 0.02 }, "Mất niềm tin của bố mẹ, hết phải nói dối", { tier: "awakened" })], 0, { npc: p });
    return T(`${N(k!)} muốn đi làm xa`, `${N(k!)} khoe vừa thấy một tin tuyển dụng việc nhẹ lương cao ở nước ngoài, bao cả vé máy bay, và muốn đi ngay sau khi học xong.`, [
      C("Cấm, không giải thích", { trust: { npc: k!, delta: -0.2 } }, "Con ở lại, con không hiểu vì sao"),
      C("Kể cho con nghe những năm của mình", { trust: { npc: k!, delta: 0.25 }, happy: -3, flags: ["scm_told_child"] }, "Con biết bạn là ai, và biết vì sao phải sợ", { tier: "awakened" }),
      C("Hứa giúp con tìm một việc thật ở gần nhà", { promise: { to: k!, what: "tìm cho con một việc đàng hoàng ở gần nhà", years: 2 }, trust: { npc: k!, delta: 0.15 } }, "Một lời hứa phải giữ")], 1, { npc: k! }); }),

  /* ================================================================ GIANG HỒ ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(GA, "gng_t_fist", [10, 16], () => true, (c) => T("Trận đánh ở sân sau trường", "Ba anh lớp trên chặn một bạn nhỏ con ở sân sau. Bạn lao vào, một mình. Hôm sau cả trường nhìn bạn khác đi, và mấy anh lớn ngoài cổng trường bắt đầu gọi tên bạn.", [
    C("Ra cổng trường chơi với mấy anh lớn", { flags: [talentFlag(GA)], counters: { talents_seen: 1 }, rel: 2, know: -2 }, "Được nể, được che chở, bị kéo đi xa"),
    C("Xin bố mẹ cho đi học võ", { counters: { talents_seen: 1, exercise: 3 }, money: $(c, -0.02), flags: ["gng_dojo"] }, "Nắm đấm có luật, tốn tiền nhà"),
    C("Về nhà, không kể với ai", { counters: { talents_seen: 1 } })], 1)),

  /* ---------- cơ hội bước vào ---------- */
  door(GA, "gng_d_bigbro", [14, 25], (c) => !c.rich, (c) => T("Anh lớn đầu ngõ", `Người cả khu gọi là "anh lớn" đưa bạn chìa khóa một chiếc xe máy và ít tiền tiêu. Anh chỉ cần bạn chạy việc vặt, có mặt khi được gọi. ${c.age < 18 ? `Bạn mới ${c.age} tuổi.` : "Việc bạn đang làm trả chưa bằng một nửa."}`, [
    C("Nhận chìa khóa", { ...become(GA), counters: { doors_seen: 1 }, money: $(c, 0.05) }, "Có xe, có anh, có món nợ không ghi giấy"),
    C("Cảm ơn, không nhận", { counters: { doors_seen: 1 }, happy: -1 }, "Đi bộ tiếp, không nợ ai")], 1)),
  door(GA, "gng_d_revenge", [16, 30], (c) => !!role(c, "childhood_friend"), (c, N) => { const fr = role(c, "childhood_friend")!;
    return T("Món nợ cho bạn thân", `${N(fr)} bị một nhóm đánh phải nhập viện vì một chuyện nhỏ ở quán nước. Biên bản lập xong rồi để đó. Một nhóm khác trong khu nói họ sẽ "lo" chuyện này, nếu bạn về làm em họ.`, [
      C("Về làm em, để họ lo", { ...become(GA), counters: { doors_seen: 1 }, memory: { npc: fr, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: "đứng ra đòi lại công bằng sau trận đánh ở quán nước" } }, "Có người chống lưng, nợ họ một đời"),
      C("Cùng bạn ấy theo đến cùng ở công an", { counters: { doors_seen: 1 }, bw: -5, memory: { npc: fr, tag: "STOOD_UP_FOR_ME", weight: 0.4, note: "cùng đi gõ cửa công an sau trận đánh" }, gamble: { p: 0.4, win: { happy: 3, log: "Sau nửa năm, nhóm kia bị đưa ra xử." }, lose: { happy: -3, log: "Hồ sơ chìm dần. Bạn hiểu vì sao người ta tìm đến giang hồ." } } }, "Chậm, có thể không được gì", { tier: "awakened" }),
      C("Khuyên bạn ấy cho qua", { counters: { doors_seen: 1 }, trust: { npc: fr, delta: -0.1 } }, "Yên chuyện, bạn ấy thấy mình bị bỏ rơi")], 1, { npc: fr }); }),

  /* ---------- mạch truyện ---------- */
  beat(GA, 1, 1, (c) => T("Cánh đồng của ông lão", `Anh lớn đưa cả nhóm ra một bãi đất ven ${c.poor_country ? "làng" : "thành phố"}. Một công ty thuê nhóm "giữ trật tự" để san đất, nhưng một ông lão vẫn đứng giữa ruộng không chịu đi. Việc của bạn chỉ là đứng đó cho đông.`, [
    C("Đứng cùng nhóm đến hết ngày", { counters: step(c, GA, { gng_loyal: 1 }), money: $(c, 0.05) }, "Được anh nhớ mặt, ông lão cũng nhớ"),
    C("Viện cớ đau bụng, bỏ về sớm", { counters: step(c, GA), gamble: { p: 0.5, win: { flags: ["gng_slipped"], log: "Không ai để ý bạn đã về." }, lose: { happy: -4, counters: { gng_loyal: -1 }, log: "Anh lớn gọi bạn là đồ nhát trước cả nhóm." } } }, "Tránh được hôm nay, có thể mất mặt"),
    C("Tối đó quay lại, đưa ông lão số một nhà báo", { counters: step(c, GA), flags: ["gng_leak"], agency: 0.02, later: { years: 3, storylet: "gng_summons" } }, "Một việc tử tế, nếu lộ ra thì nguy", { tier: "sovereign" })], 0)),
  beat(GA, 2, 3, (c) => T("Chiếc ghế bên cạnh anh lớn", `${cnt(c, "gng_loyal") >= 1 ? "Ba năm theo anh, bạn chưa từng hỏi lại một lệnh nào." : "Ba năm, anh lớn vẫn chưa tin bạn hẳn, nhưng nhóm đang thiếu người."} Anh giao cho bạn trông một con phố có quán nhậu, tiệm game và bãi xe. Một đứa em bạn đưa vào nhóm năm nào giờ đi đâu cũng theo sau bạn.`, [
    C("Nhận con phố", { counters: step(c, GA, { gng_loyal: 2 }), income_mult: 1.5, money: $(c, 0.2), flags: ["gng_right_hand"] }, "Có tiền, có tiếng, đứng trước mũi mọi chuyện"),
    C("Xin trông tiệm rửa xe của anh, việc tử tế", { counters: step(c, GA), income_mult: 1.1, flags: ["gng_front_job"] }, "Ít tiền, ít máu, anh coi bạn là người mềm"),
    C("Nhận, đặt luật: không đụng người già, người nghèo", { counters: step(c, GA, { gng_loyal: 1 }), income_mult: 1.3, flags: ["gng_right_hand", "gng_code"], agency: 0.02 }, "Đàn em nể, anh lớn bắt đầu dè chừng", { tier: "sovereign" })], 0)),
  beat(GA, 3, 4, (c) => T("Đêm ở quán nhậu", `Một trận xô xát giữa hai nhóm ở quán nhậu ${f(c, "gng_right_hand") ? "trên con phố bạn trông" : "đầu khu"}. Một người bên kia phải vào phòng cấp cứu, đến giờ chưa tỉnh. Công an đang lập hồ sơ. Anh lớn nói phải có một người đứng ra nhận, nhà người đó anh lo. Anh nhìn bạn, rồi nhìn đứa em của bạn.`, [
    C("Đứng ra nhận tội", { counters: step(c, GA, { gng_loyal: 3 }), flags: ["gng_did_time"], close_doors: ["clean_record"], money: $(c, 0.4), health: -6, happy: -8, log: "Bạn ngồi tù bốn năm. Mỗi tháng, có người mang phong bì đến cho nhà bạn." }, "Giữ đứa em, mất bốn năm và lý lịch"),
    C("Im lặng để đứa em nhận", { counters: step(c, GA, { gng_blood: 1 }), flags: ["gng_let_kid_fall"], happy: -10, rel: -4 }, "Bạn còn tự do, đứa em vào tù thay bạn"),
    C("Khai với công an đúng người đã ra tay", { counters: step(c, GA), ...leave(GA), flags: ["gng_witness"], close_doors: ["return_home"], agency: 0.03 }, "Sự thật được nói ra, bạn phải rời khu này mãi mãi", { tier: "sovereign" }),
    C("Bỏ trốn khỏi thành phố trong đêm", { counters: step(c, GA), ...leave(GA), money: $(c, -0.2), flags: ["gng_ran"], happy: -5 }, "Không ai vào tù vì bạn, không ai tin bạn nữa")], 0)),
  beat(GA, 4, 5, (c, N) => {
    if (f(c, "gng_did_time")) { const m = role(c, "mother");
      return T("Cổng trại giam buổi sáng", `Ngày bạn ra tù, anh lớn đến đón bằng xe đẹp và một phong bì dày. ${m ? N(m) : "Người nhà"} đứng phía sau, gầy đi nhiều. Khu phố cũ giờ có những đứa em bạn không quen mặt.`, [
        C("Lên xe anh, về chỗ cũ, ghế cao hơn", { counters: step(c, GA, { gng_loyal: 1 }), income_mult: 1.6, money: $(c, 0.3), flags: ["gng_right_hand", "gng_back"] }, "Được trả công cho những năm tù, lún sâu hơn"),
        C("Về nhà, tìm một việc tử tế", leaveTo(GA, "ex_convict", { counters: step(c, GA), happy: 4, rel: 3, ...(m ? { trust: { npc: m, delta: 0.3 } } : {}) }), "Bắt đầu lại từ đáy, với lý lịch có án", { longterm: true }),
        C("Lấy phần của mình, mở tiệm sửa xe riêng", { counters: step(c, GA), ...leave(GA), money: $(c, 0.5), flags: ["gng_own_shop"], agency: 0.03 }, "Có vốn làm ăn, anh lớn không ưa người tự đi", { tier: "sovereign" })], 0, m ? { npc: m } : {}); }
    if (f(c, "gng_right_hand") || cnt(c, "gng_blood") >= 2) return T("Chiếc ghế bỏ trống", `Anh lớn bị bắt trong một chuyên án lớn. Chiếc ghế của anh bỏ trống, nhóm bên kia sông đã bắt đầu lấn sang. Đàn em nhìn bạn chờ lệnh.${f(c, "gng_let_kid_fall") ? " Đứa em năm xưa vẫn đang ở trong tù." : ""}`, [
      C("Ngồi vào ghế anh lớn", { counters: step(c, GA, { gng_blood: 1 }), income_mult: 1.8, money: $(c, 0.6), flags: ["gng_boss"], secret: { tag: "PAID_BRIBE", severity: 0.7, fuse_years: [2, 10], note: "tiền gửi người có chức quyền để giữ địa bàn" } }, "Đỉnh cao, và là cái đích của mọi chuyên án sau"),
      C("Giải tán nhóm, tìm việc cho đàn em", { counters: step(c, GA), ...leave(GA), money: $(c, -0.4), flags: ["gng_dissolved"], agency: 0.03, rel: 4 }, "Mất hết quyền, nhiều đứa em có một đời khác", { tier: "sovereign", longterm: true }),
      C("Nhường địa bàn cho nhóm bên kia, rời đi", { counters: step(c, GA), ...leave(GA), close_doors: ["return_home"], money: $(c, 0.2) }, "Yên thân, mang tiếng bỏ anh em")], 0);
    return T("Người đứng mãi ở rìa", "Mười năm, bạn vẫn là người chạy việc. Những đứa vào sau đã có phố riêng. Một người trong nhóm rủ bạn làm một \"việc lớn\" cuối cùng, đủ để rút ra.", [
      C("Nhận việc lớn cuối cùng", { counters: step(c, GA, { gng_blood: 1 }), gamble: { p: 0.45, win: { ...leave(GA), money: $(c, 1), log: "Việc trót lọt. Bạn cầm tiền rời khu, không ngoảnh lại." }, lose: { unflags: [life(GA)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], health: -5, log: "Cả nhóm bị bắt ngay đêm đó. Bạn nhận án sáu năm." } } }, "Một lần đổi đời, hoặc sáu năm tù"),
      C("Bỏ nhóm, đi học một nghề", { counters: step(c, GA), ...leave(GA), know: 4, flags: ["gng_trade"], income_mult: 0.8 }, "Làm lại từ đầu khi đã không còn trẻ", { longterm: true }),
      C("Ở lại, chạy việc tiếp", { counters: step(c, GA), happy: -4 }, "Không mất gì, không có gì")], 1);
  }),
  beat(GA, 5, 6, (c) => T("Thằng bé đứng đầu ngõ", `${f(c, "gng_boss") ? "Bạn là người cả khu gọi là anh lớn." : f(c, "gng_did_time") ? "Bạn đã ngồi tù, đã ra, tóc đã bạc." : "Bạn đã qua cái tuổi đánh nhau."} Một thằng bé trong khu ngày nào cũng đứng đầu ngõ nhìn bạn, đúng cái nhìn của bạn năm xưa nhìn anh lớn. Hôm nay nó xin được theo bạn.`, [
    C("Nhận nó làm em", { counters: step(c, GA, { gng_loyal: 1 }), flags: ["gng_new_kid"], happy: 1 }, "Vòng cũ quay thêm một lần"),
    C("Đuổi nó về, nói thật nặng lời", { counters: step(c, GA), happy: -2, flags: ["gng_sent_away"] }, "Có thể cứu nó, có thể đẩy nó sang nhóm khác"),
    C("Mở phòng tập võ miễn phí cho tụi nhỏ trong khu", leaveTo(GA, "coach", { counters: step(c, GA), money: -0.3, flags: ["gng_gym"], agency: 0.03, rel: 5 }), "Tốn tiền, bỏ nhóm, cho tụi nhỏ một chỗ khác", { tier: "sovereign", longterm: true })], 2), (c) => c.age >= 35),

  /* ---------- chuyện thường ngày ---------- */
  daily(GA, "gng_tattoo", [16, 45], 8, (c) => T("Hình xăm chung của nhóm", "Cả nhóm rủ nhau xăm cùng một hình lên cánh tay, như một lời thề. Ai không xăm, người ta sẽ nhớ.", [
      C("Xăm cùng cả nhóm", { counters: { gng_loyal: 1 }, money: $(c, -0.02), flags: ["gng_tattoo"], rel: 2 }, "Được tin hơn, mang dấu của nhóm cả đời"),
      C("Xăm ở chỗ áo che được", { counters: { gng_loyal: 1 }, money: $(c, -0.02), flags: ["gng_hidden_tattoo"] }, "Nửa trong nửa ngoài, ai cũng biết bạn tính toán"),
      C("Không xăm", { counters: { gng_loyal: -1 }, rel: -2 }, "Giữ da sạch, bị coi là người ngoài")], 0)),
  daily(GA, "gng_mother", [16, 40], 10, (c, N) => { const m = role(c, "mother")!;
    return T("Mẹ đến tận quán", `${N(m)} đến tận quán nơi cả nhóm đang ngồi, đứng ở cửa gọi tên bạn trước mặt mọi người, bảo về nhà ăn cơm.`, [
      C("Đứng dậy về cùng mẹ", { trust: { npc: m, delta: 0.25 }, counters: { gng_loyal: -1 }, rel: -2 }, "Mẹ vui, cả nhóm cười sau lưng bạn"),
      C("Bảo mẹ về trước, giọng lạnh tanh", { counters: { gng_loyal: 1 }, memory: { npc: m, tag: "HUMILIATED_ME", weight: -0.3, note: "bị đuổi về trước mặt cả nhóm ở quán" } }, "Giữ thể diện với nhóm, mẹ không quên"),
      C("Ra ngoài nói chuyện riêng, hứa Chủ nhật về", { promise: { to: m, what: "Chủ nhật nào cũng về nhà ăn cơm", years: 1 }, trust: { npc: m, delta: 0.1 } }, "Một lời hứa nhỏ, khó giữ", { tier: "awakened" })], 2, { npc: m }); }, (c) => !!role(c, "mother")),
  daily(GA, "gng_granny", [16, 55], 8, (c) => T("Bà cụ bán nước đầu ngõ", `${f(c, "gng_code") ? "Luật bạn đặt ra là không đụng người nghèo, nhưng anh lớn vẫn hỏi phần tiền của bà." : "Đến kỳ thu tiền \"trông\" của cả dãy."} Bà cụ bán nước đầu ngõ ốm cả tháng, hộp tiền chỉ còn mấy tờ lẻ.`, [
      C("Thu như mọi nhà", { money: $(c, 0.02), counters: { gng_loyal: 1, gng_blood: 1 }, happy: -3 }, "Đủ phần nộp anh, cả ngõ nhìn bạn khác"),
      C("Bỏ tiền túi nộp thay bà", { money: $(c, -0.03), counters: { kind: 1 } }, "Mất tiền mình, bà không bao giờ biết"),
      C("Báo với anh là bà đã nộp", { flags: ["gng_lied_boss"], secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.2, fuse_years: [1, 5], note: "khai gian với anh lớn về tiền thu ở đầu ngõ" } }, "Bà yên, bạn giữ một lời nói dối với anh")], 1)),
  daily(GA, "gng_summons", [16, 55], 8, (c) => T(VN(c) ? "Giấy mời lên phường" : "Giấy triệu tập", `${VN(c) ? "Công an phường" : "Cảnh sát khu vực"} gửi giấy mời bạn lên làm việc về ${f(c, "gng_leak") ? "vụ bãi đất năm nào, sau khi một tờ báo đăng bài" : "một vụ đánh nhau mà bạn nói mình chỉ đứng xem"}.`, [
      C("Lên, ngồi im, không nói gì", { counters: { gng_loyal: 1 }, bw: -5 }, "Được nhóm nể, công an ghi tên bạn vào sổ"),
      C("Lên, kể những gì mình thấy", { flags: ["gng_talked"], counters: { gng_loyal: -2 }, gamble: { p: 0.6, win: { log: "Lời bạn kể khớp với nhiều nhân chứng khác. Không ai biết là bạn." }, lose: { happy: -5, bw: -5, log: "Ba hôm sau, cả khu biết bạn đã \"nói\"." } } }, "Đúng sự thật, có thể bị coi là kẻ phản"),
      C("Không lên", { gamble: { p: 0.5, win: { flags: ["gng_dodged"], log: "Họ không gửi thêm giấy nào." }, lose: { close_doors: ["clean_record"], flags: ["gng_detained"], log: "Một tuần sau, họ đến tận nhà đưa bạn đi." } } }, "Có thể qua, có thể bị tạm giữ")], 0)),
  daily(GA, "gng_visit", [18, 55], 9, () => T("Ngày thăm nuôi", "Bạn vào trại thăm một người anh em đang thụ án. Anh ta gầy đi, nói nhỏ: nhờ bạn chuyển một lời nhắn cho một người ở ngoài, đừng hỏi là gì.", [
      C("Nhận chuyển lời nhắn", { counters: { gng_loyal: 2 }, flags: ["gng_messenger"] }, "Đúng tình anh em, bạn không biết mình dính vào gì"),
      C("Từ chối, chỉ để lại tiền ăn", { money: -0.05, counters: { gng_loyal: -1 } }, "Giữ mình sạch, anh ta nhớ"),
      C("Đưa mẹ anh ta vào thăm thay vì chuyển lời", { counters: { kind: 1 }, rel: 2, flags: ["gng_brought_mother"] }, "Một điều tốt thật, không phải điều được nhờ", { tier: "awakened" })], 0)),
  daily(GA, "gng_love", [18, 45], 10, (c, N) => { const p = role(c, "partner")!;
    return T("Chọn người hay chọn nhóm", `${N(p)} nói thẳng: nếu bạn còn đi với nhóm thì ${N(p)} sẽ đi. ${N(p)} không muốn đêm nào nghe tiếng xe máy cũng giật mình.`, [
      C("Hứa rời nhóm trong một năm", { promise: { to: p, what: "rời nhóm giang hồ trong một năm", years: 1 }, trust: { npc: p, delta: 0.2 } }, "Giữ được người, nợ một lời hứa khó"),
      C("Nói nhóm là anh em, không bỏ được", { trust: { npc: p, delta: -0.4 }, counters: { gng_loyal: 1 }, happy: -5 }, "Giữ nhóm, mất người"),
      C("Rời nhóm ngay hôm nay", { ...leave(GA), trust: { npc: p, delta: 0.3 }, counters: { gng_loyal: -3 }, money: -0.1 }, "Mất thu nhập và chỗ dựa, được một đời khác", { longterm: true })], 0, { npc: p }); }, (c) => !!role(c, "partner")),
  daily(GA, "gng_party", [16, 55], 8, (c) => T("Tiệc sinh nhật anh lớn", `Tiệc sinh nhật anh lớn kín ba tầng nhà hàng. Ai đến cũng mang phong bì. Ở bàn trong cùng, bạn nhận ra một người ${c.poor_country ? "có chức sắc trong vùng" : "mặc vest bạn từng thấy trên báo"}.`, [
      C("Mừng một phong bì thật dày", { money: $(c, -0.1), counters: { gng_loyal: 2 } }, "Anh nhớ mặt, ví bạn mỏng đi"),
      C("Mừng vừa đủ, về sớm", { money: $(c, -0.02), counters: { gng_loyal: -1 } }, "Ít tốn, ít được để ý"),
      C("Lặng lẽ ghi nhớ những gương mặt ở bàn trong", { flags: ["gng_knows_faces"], bw: -3 }, "Một hiểu biết có thể cứu bạn, hoặc hại bạn", { tier: "awakened" })], 0)),
  daily(GA, "gng_turf", [16, 50], 8, (c) => T("Nhóm bên kia sông", vary("gngt", c.age, ["Nhóm bên kia sông kéo sang quán của khu bạn, cố tình gây chuyện. Đàn em nóng mặt, chỉ chờ bạn gật đầu.", "Có tin nhóm bên kia sẽ sang \"nói chuyện\" tối nay. Mấy đứa nhỏ trong nhóm run, nhưng không đứa nào muốn tỏ ra nhát."]), [
      C("Gật đầu", { counters: { gng_blood: 1, gng_loyal: 1 }, gamble: { p: 0.5, win: { rel: 1, log: "Nhóm bên kia rút đi. Cả khu nói về bạn suốt tuần." }, lose: { health: -10, log: "Bạn nằm viện hai tuần. Không ai báo công an." } } }, "Được nể, có thể không đứng dậy được"),
      C("Gặp riêng người cầm đầu bên kia, chia ranh giới", { flags: ["gng_truce"], agency: 0.02, gamble: { p: 0.6, win: { log: "Hai bên giữ được ranh giới suốt mấy năm." }, lose: { counters: { gng_loyal: -1 }, log: "Họ coi đó là bạn sợ." } } }, "Tránh được máu, có thể bị coi là yếu", { tier: "sovereign" }),
      C("Giải tán đàn em, đóng quán sớm", { counters: { gng_loyal: -1 }, money: $(c, -0.03) }, "Không ai bị thương, mất mặt một đêm")], 0)),
  daily(GA, "gng_class", [16, 40], 9, (c) => T("Lớp học nghề buổi tối", `Một ${c.poor_country ? "tổ chức từ thiện" : "trung tâm thanh thiếu niên"} mở lớp học nghề miễn phí buổi tối cho thanh niên trong khu: sửa xe, điện, nấu ăn. Người đứng lớp từng ở tù mười năm.`, [
      C("Lén đăng ký, học đủ khóa", { know: 6, bw: -4, flags: ["gng_trade"], counters: { gng_loyal: -1 } }, "Có một nghề dự phòng, ít thời gian cho nhóm"),
      C("Rủ cả đàn em đi học", { know: 3, flags: ["gng_trade", "gng_class_lead"], agency: 0.02, gamble: { p: 0.5, win: { rel: 3, log: "Ba đứa em học xong, có việc ở một xưởng sửa xe." }, lose: { counters: { gng_loyal: -1 }, log: "Anh lớn biết chuyện, gọi bạn lên hỏi." } } }, "Kéo người khác ra, anh lớn sẽ để ý", { tier: "sovereign" }),
      C("Cười nhạt rồi đi qua", { happy: -1 }, "Không mất gì tối nay")], 0)),
  daily(GA, "gng_sibling", [18, 50], 10, (c, N) => { const s = role(c, "sibling")!;
    return T(`${N(s)} bắt chước bạn`, `${N(s)} bắt đầu bỏ việc, theo chân nhóm của bạn, nói năng y hệt bạn. Người trong khu bảo: "Nhà đó giờ có hai đứa rồi."`, [
      C(`Đưa ${N(s)} về, cấm lại gần nhóm`, { trust: { npc: s, delta: -0.1 }, counters: { gng_loyal: -1 }, flags: ["gng_shielded_sibling"] }, "Giữ người nhà ngoài vòng, bị giận"),
      C("Cho đi theo, mình che chở", { trust: { npc: s, delta: 0.2 }, counters: { gng_loyal: 1 }, flags: ["gng_sibling_in"] }, "Gần nhau hơn, cùng nhau lún"),
      C("Kể hết những gì mình đã thấy", { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.2 }, flags: ["gng_shielded_sibling"], log: `${N(s)} nghe hết, rồi tự rời nhóm.` }, lose: { trust: { npc: s, delta: -0.1 }, log: `${N(s)} bảo bạn chỉ sợ bị tranh chỗ.` } } }, "Có thể cứu, có thể bị coi là ghen", { tier: "awakened" })], 0, { npc: s }); }, (c) => !!role(c, "sibling")),

  /* ---------- gia đình ---------- */
  cross(GA, "gng_home", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "father"), (c, N) => { const k = role(c, "child"); const fa = role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} đánh nhau ở trường`, `${N(k)} bị mời phụ huynh vì đánh nhau. Trong phòng hiệu trưởng, ${N(k)} nhìn bạn và nói: "Ở nhà ai cũng sợ bố mẹ mà." Cô giáo chờ bạn lên tiếng.`, [
      C("Mắng con, bắt hứa không tái phạm", { trust: { npc: k, delta: -0.2 } }, "Đúng phép, con thấy bạn nói một đằng làm một nẻo"),
      C("Kể cho con nghe cái giá mình đã trả", { trust: { npc: k, delta: 0.25 }, happy: -2, flags: ["gng_told_child"] }, "Con biết bạn là ai, cả phần khó nghe", { tier: "awakened" }),
      C("Đưa con đến một lò võ có luật lệ", { money: -0.05, trust: { npc: k, delta: 0.1 }, flags: ["gng_child_dojo"] }, "Tốn tiền, nắm đấm của con có chỗ đi")], 1, { npc: k });
    return T("Bố không cho vào nhà", `${N(fa!)} không cho bạn bước vào nhà ${VN(c) ? "ngày giỗ ông nội" : "trong bữa cơm họp mặt cả họ"}. Ông nói trước mặt mọi người: nhà này không có người làm giang hồ.`, [
      C("Xin lỗi bố trước mặt cả họ", { custom: "apologize", trust: { npc: fa!, delta: 0.2 }, happy: -3 }, "Mất mặt một buổi, cửa nhà có thể mở lại"),
      C("Quay đi, không về nữa", { close_doors: ["family_table"], memory: { npc: fa!, tag: "HUMILIATED_ME", weight: -0.3, note: "đuổi khỏi nhà trước mặt cả họ" } }, "Giữ thể diện, mất bữa cơm gia đình"),
      C("Gửi tiền về, không xuất hiện", { money: -0.1, trust: { npc: fa!, delta: -0.05 } }, "Tiền đến được, bạn thì không")], 0, { npc: fa! }); }),
];
