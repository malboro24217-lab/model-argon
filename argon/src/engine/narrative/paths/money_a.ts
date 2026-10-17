/**
 * Gói KINH DOANH & LÀM GIÀU (A): người khởi nghiệp · dân bất động sản · đầu bếp, chủ nhà hàng · dân buôn biên giới.
 * Mỗi con đường: 1 năng khiếu · 2–3 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Bộ đếm riêng để các nhịp sau đọc lại: kng_cred (uy tín với đội và nhà đầu tư), bds_rep (tiếng của người môi giới),
 * nhh_star (tiếng của bếp), nhh_risk (những lần làm tắt), bgi_heat (mức bị để mắt), bgi_clean (giấy tờ sạch).
 */
import type { Storylet, FactContext, Effect, MemoryTag } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const SU = "startup";
const RE = "real_estate";
const RS = "restaurateur";
const BT = "border_trader";

const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Hiệu ứng gắn với một người chỉ khi người đó có trong đời. */
const tr = (npc: string | undefined, delta: number): Effect => (npc ? { trust: { npc, delta } } : {});
const mem = (npc: string | undefined, tag: MemoryTag, weight: number, note: string): Effect => (npc ? { memory: { npc, tag, weight, note } } : {});

/* ================================================================== NGƯỜI KHỞI NGHIỆP */
const STARTUP: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SU, "kng_t_drawer", [9, 16], () => true, (c) => { const cur = f(c, "temper_curious"); return T(cur ? "Trò chơi tự viết" : "Cửa hàng trong ngăn bàn", cur
    ? "Bạn tự viết một trò chơi nhỏ trên máy tính của thư viện trường. Cả lớp xếp hàng chờ chơi, có đứa đòi trả tiền để được chơi trước. Thầy phụ trách thư viện hỏi ai dạy bạn."
    : "Bạn mua sỉ một túi nhãn dán, bán lại cho cả lớp, lãi gấp đôi. Đến tuần thứ ba, hai lớp bên cạnh cũng đặt hàng. Cô chủ nhiệm gọi bố mẹ lên, nửa trách nửa cười.", [
    C(cur ? "Xin học thêm lập trình, làm tiếp trò chơi" : "Xin bố mẹ chút vốn, ghi sổ lời lãi", { money: -0.02, flags: [talentFlag(SU)], counters: { talents_seen: 1 }, know: -1, happy: 3 }, "Tốn tiền nhà, sao nhãng bài vở, giữ được ngọn lửa"),
    C("Dừng lại, tập trung học", { counters: { talents_seen: 1 }, know: 2 }, "Yên chuyện ở trường, ngọn lửa tắt")], 0); }),

  /* ---------- cơ hội bước vào ---------- */
  door(SU, "kng_d_weekend", [20, 40], () => true, () => T("Bốn mươi tám giờ không ngủ", "Một cuộc thi ý tưởng kéo dài hai ngày cuối tuần. Đội ba người của bạn đoạt giải nhì. Một người trong ban giám khảo đưa danh thiếp: anh ta sẽ rót một khoản vốn nhỏ nếu bạn bỏ việc để làm toàn thời gian.", [
    C("Bỏ việc, nhận vốn, làm thật", { ...become(SU), counters: { doors_seen: 1 }, agency: 0.02, bw: -4 }, "Mất lương ổn định, có một năm để thử"),
    C("Làm buổi tối, giữ việc ban ngày", { counters: { doors_seen: 1 }, health: -2, gamble: { p: 0.35, win: { ...become(SU), log: "Sáu tháng làm đêm, sản phẩm có khách trả tiền. Bạn nộp đơn nghỉ việc." }, lose: { happy: -3, log: "Đội tan sau ba tháng. Mỗi người về với việc ban ngày của mình." } } }, "An toàn hơn, dễ chết yểu"),
    C("Bán ý tưởng cho công ty của anh ta", { counters: { doors_seen: 1 }, money: 0.12, flags: ["kng_sold_idea"] }, "Tiền ngay, ý tưởng thành của người khác")], 1)),
  door(SU, "kng_d_severance", [25, 50], (c) => c.has_job, (c) => T("Gói trợ cấp thôi việc", `Công ty cắt giảm một phần ba nhân sự, có bạn. Trong tay bạn là ${c.poor_country ? "bốn tháng lương" : "sáu tháng lương"} trợ cấp và một ý tưởng đã nằm trong sổ tay ba năm. Hai đồng nghiệp cũng vừa bị cắt hỏi bạn định làm gì.`, [
    C("Dồn tiền trợ cấp làm ý tưởng của mình", { ...become(SU), counters: { doors_seen: 1 }, money: -0.3 }, "Đốt khoản dự phòng cuối cùng"),
    C("Rủ hai đồng nghiệp, chia đều cổ phần ba người", { ...become(SU), counters: { doors_seen: 1 }, flags: ["kng_equal_split"], agency: 0.02, rel: 3 }, "Có đội ngay, việc gì cũng phải bàn", { tier: "sovereign" }),
    C("Nộp đơn xin việc mới ngay tuần này", { counters: { doors_seen: 1 }, money: 0.05, happy: -2 }, "Yên ổn, ý tưởng nằm lại trong sổ")], 2)),
  door(SU, "kng_d_ledger", [22, 45], (c) => !!role(c, "neighbor"), (c, N) => { const m = role(c, "neighbor")!; return T("Cuốn sổ nợ bằng bút bi", `${N(m)} bán tạp hóa cạnh nhà, ghi nợ khách vào một cuốn sổ bằng bút bi, cuối tháng ngồi cộng đến khuya. Bạn làm một ứng dụng nhỏ trên điện thoại để giúp. Ba tuần sau, mười hai chủ tiệm trong khu nhờ bạn cài cho, có người đòi trả tiền.`, [
    C("Thu phí, biến nó thành công ty", { ...become(SU), counters: { doors_seen: 1 }, bw: -3, ...tr(m, 0.1) }, "Thành nghề, hàng xóm thành khách hàng"),
    C("Cài miễn phí cho ai cần, không làm lớn", { counters: { doors_seen: 1 }, rel: 4, flags: ["kng_free_tool"], ...tr(m, 0.2) }, "Được quý, không thành tiền")], 0, { npc: m }); }),

  /* ---------- mạch truyện ---------- */
  beat(SU, 1, 1, (c) => T("Mười người dùng đầu tiên", `Bạn thuê một góc bàn ${vn(c) ? "trong quán cà phê" : "ở một văn phòng chung"} theo giờ. Tiền tiết kiệm đủ trả lương cho chính mình thêm tám tháng. Sản phẩm chạy được, nhưng chưa ai ngoài bạn bè dùng nó quá một tuần.`, [
    C("Gặp tận mặt từng khách, sửa theo lời họ", { counters: step(c, SU, { kng_cred: 1 }), flags: ["kng_close_users"], bw: -5, know: 3 }, "Chậm và mệt, hiểu khách thật"),
    C("Chi tiền quảng cáo cho số người dùng đẹp", { counters: step(c, SU), money: -0.15, flags: ["kng_paid_growth"], gamble: { p: 0.5, win: { counters: { kng_cred: 1 }, log: "Số người dùng tăng gấp mười. Một nửa trong số đó ở lại." }, lose: { log: "Số người dùng tăng vọt rồi rơi về gần như cũ khi hết tiền quảng cáo." } } }, "Nhanh, tốn tiền, con số có thể ảo")], 0)),
  beat(SU, 2, 3, (c) => { const close = f(c, "kng_close_users"); return T("Phòng họp tầng ba mươi", `Một quỹ đầu tư mời bạn lên văn phòng nhìn xuống cả thành phố. Họ đề nghị một khoản vốn lớn, đổi lại ba phần mười công ty, một ghế trong hội đồng và cam kết tăng trưởng gấp ba mỗi năm.${close ? " Cùng tuần đó, vài khách quen hỏi họ có thể góp tiền vào công ty không." : ""}`, [
    C("Nhận vốn, cam kết tăng gấp ba", { counters: step(c, SU), income_mult: 1.5, flags: ["kng_vc"], bw: -4 }, "Có tiền để đốt, mất quyền tự quyết"),
    C("Từ chối, sống bằng doanh thu", { counters: step(c, SU), income_mult: 1.1, flags: ["kng_bootstrap"], health: -3 }, "Chậm và chật vật, giữ trọn công ty", { longterm: true }),
    C("Gọi vốn từ chính khách hàng của mình", { counters: step(c, SU), agency: 0.03, gamble: { p: close ? 0.6 : 0.3, win: { income_mult: 1.3, flags: ["kng_customer_owned"], counters: { kng_cred: 1 }, log: "Bốn trăm khách hàng thành cổ đông nhỏ. Họ là những người bán hàng giỏi nhất của bạn." }, lose: { income_mult: 1.05, flags: ["kng_bootstrap"], log: "Khách thích sản phẩm nhưng không muốn góp tiền. Bạn tiếp tục tự xoay." } } }, "Lựa chọn thứ ba, cần khách thật sự tin mình", { tier: "sovereign" })], 0); }),
  beat(SU, 3, 4, (c, N) => { const p = role(c, "partner"); const who = p ? N(p) : "Người đồng sáng lập"; const vc = f(c, "kng_vc");
    return T(vc ? "Số liệu trước vòng gọi vốn" : "Còn lương hai tháng", `${vc ? "Quỹ muốn thấy doanh thu gấp ba trước khi rót vòng tiếp theo. Con số thật chỉ gấp rưỡi." : "Tài khoản công ty còn đủ trả lương hai tháng. Một khách hàng lớn vừa hủy hợp đồng."} ${who} đề nghị "làm đẹp" báo cáo cho qua vòng này, rồi bù lại sau. Mười hai nhân viên chưa biết gì.`, [
      C("Nói thật với nhà đầu tư và cả đội", { counters: step(c, SU), ...tr(p, -0.1), gamble: { p: 0.25 + 0.1 * Math.max(0, Math.min(3, n(c, "kng_cred"))), win: { counters: { kng_cred: 2 }, flags: ["kng_honest_crisis"], log: "Một nhà đầu tư cũ bỏ thêm tiền, vì bạn là người duy nhất báo tin xấu trước hạn." }, lose: { income_mult: 0.6, flags: ["kng_honest_crisis"], log: "Vòng gọi vốn đổ. Bạn cắt nửa đội, giữ được công ty." } } }, "Có thể mất vòng gọi vốn, giữ được tên mình"),
      C("Làm đẹp báo cáo, bù lại sau", { counters: step(c, SU), income_mult: 1.3, flags: ["kng_cooked_books"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 6], note: "báo cáo doanh thu thổi phồng trước vòng gọi vốn" } }, "Qua được vòng này, giữ một quả bom hẹn giờ"),
      C("Cắt còn ba người, tự trả lương bằng không", { counters: step(c, SU, { kng_cred: 1 }), income_mult: 0.5, health: -5, flags: ["kng_lean"] }, "Sống sót, nghèo và kiệt sức", { longterm: true }),
      C("Đóng công ty, trả đủ lương cho mọi người", { counters: step(c, SU), ...leave(SU), money: -0.3, flags: ["kng_closed_clean"], rel: 4 }, "Mất công ty, giữ được người")], 0, p ? { npc: p } : {}); }),
  beat(SU, 4, 5, (c, N) => { const p = role(c, "partner"); const cred = n(c, "kng_cred");
    if (f(c, "kng_cooked_books")) return T("Kiểm toán độc lập", "Nhà đầu tư mới thuê kiểm toán trước khi rót vòng lớn nhất. Sau hai tuần, người kiểm toán xin gặp riêng bạn, tay cầm bản báo cáo của bốn năm trước.", [
      C("Tự đứng ra nhận, từ chức giám đốc", { counters: step(c, SU), ...leave(SU), income_mult: 0.6, flags: ["kng_confessed"], close_doors: ["partner_circle"] }, "Mất công ty, có thể tránh được tòa"),
      C(p ? `Đổ cho ${N(p)}, người đã đề nghị` : "Đổ cho người kế toán cũ", { counters: step(c, SU), ...mem(p, "BETRAYED_PARTNERSHIP", -0.5, "bị đẩy ra nhận tội báo cáo khống"), gamble: { p: 0.4, win: { income_mult: 1.2, flags: ["kng_scapegoat"], log: "Hội đồng tin bạn. Người kia ra đi, không nói một lời." }, lose: { ...leave(SU), money: -0.8, health: -6, log: "Thư từ cũ lộ ra. Bạn mất ghế, rồi mất luôn những người bạn trong nghề." } } }, "Có thể thoát, có thể mất tất"),
      C("Thuê luật sư, kéo dài thời gian", { counters: step(c, SU), money: -0.6, bw: -8, gamble: { p: 0.3, win: { log: "Vụ việc được dàn xếp kín. Bạn ở lại, nhưng không ai trong phòng họp nhìn bạn như trước." }, lose: { ...leave(SU), money: -0.5, log: "Nhà đầu tư rút. Công ty đóng cửa trong tiếng ồn." } } }, "Tốn tiền, sống trong chờ đợi")], 0, p ? { npc: p } : {});
    if (f(c, "kng_vc")) return T("Lời đề nghị mua lại", `Một tập đoàn muốn mua lại công ty. Phần của bạn đủ để cả nhà không phải lo tiền${c.poor_country ? " suốt hai đời" : " nhiều năm"}. Trong hợp đồng có một dòng nhỏ: họ giữ sản phẩm, không giữ người.${cred >= 2 ? " Cả đội vẫn tin bạn sẽ không bán họ." : ""}`, [
      C("Bán, nhận tiền, rời đi", { counters: step(c, SU), ...leave(SU), money: 2.5, flags: ["kng_exit"], rel: -3 }, "Đổi đời, đội ngũ mất việc"),
      C("Bán, nhưng đòi giữ cả đội hai năm", { counters: step(c, SU), agency: 0.03, gamble: { p: 0.5, win: { ...leave(SU), money: 1.8, flags: ["kng_exit", "kng_kept_team"], rel: 4, log: "Họ đồng ý với giá thấp hơn. Không ai trong đội mất việc." }, lose: { income_mult: 1.1, log: "Họ rút lời đề nghị. Công ty vẫn của bạn, và vẫn đốt tiền." } } }, "Ít tiền hơn, giữ lời với đội", { tier: "sovereign" }),
      C("Không bán, đi tiếp", { counters: step(c, SU), gamble: { p: 0.35, win: { income_mult: 1.8, counters: { kng_cred: 1 }, log: "Ba năm sau, công ty đáng giá gấp bốn lời đề nghị cũ." }, lose: { income_mult: 0.6, log: "Thị trường quay đầu. Không ai còn muốn mua với giá đó nữa." } } }, "Có thể lớn hơn, có thể mất hết")], 0);
    return T("Năm đầu tiên có lãi", `Công ty có lãi lần đầu tiên sau ${vn(c) ? "bảy cái Tết" : "bảy năm"}.${cred >= 2 ? " Khách cũ giới thiệu khách mới, không cần quảng cáo." : " Lãi mỏng, nhưng là tiền thật."} Một quỹ từng từ chối bạn giờ quay lại, lần này để bạn đặt điều kiện.`, [
      C("Nhận vốn theo điều kiện của mình, mở rộng", { counters: step(c, SU), income_mult: 1.5, bw: -4, flags: ["kng_scaled"] }, "Lớn nhanh hơn, bận gấp đôi"),
      C("Chia lãi cho nhân viên, giữ quy mô", { counters: step(c, SU, { kng_cred: 1 }), income_mult: 1.15, happy: 5, flags: ["kng_profit_share"] }, "Không giàu thêm, đội ở lại lâu"),
      C("Bán công ty cho chính nhân viên, nhận tiền dần", { counters: step(c, SU), ...leave(SU), money: 0.8, agency: 0.02, flags: ["kng_employee_owned"] }, "Ra đi nhẹ nhõm, tiền về từ từ", { tier: "sovereign" })], 1); }),
  beat(SU, 5, 6, (c) => { const bad = f(c, "kng_cooked_books"); const exit = f(c, "kng_exit");
    return T("Người trẻ gõ cửa", `Một cô gái hai mươi ba tuổi xin mười lăm phút của bạn. Cô có một bản trình bày, một sản phẩm dở dang, và ánh mắt giống bạn năm ấy.${bad ? " Cô hỏi bạn nghĩ gì về chuyện gọi vốn khi số liệu chưa đẹp." : exit ? " Cô biết bạn từng bán công ty với giá lớn." : ""}`, [
      C("Rót một khoản vốn nhỏ, không đòi ghế", { counters: step(c, SU), money: -0.3, flags: ["kng_angel"], gamble: { p: 0.2, win: { money: 1.2, log: "Mười năm sau, khoản vốn ấy là khoản đầu tư tốt nhất đời bạn." }, lose: { log: "Công ty của cô đóng cửa sau hai năm. Cô vẫn gửi thiệp mỗi năm." } } }, "Có thể mất trắng, có thể nhân mười"),
      C(bad ? "Kể cho cô nghe chuyện bản báo cáo năm ấy" : "Kể thật những năm khó nhất", { counters: step(c, SU, { honest: 1 }), know: 2, happy: 3, flags: ["kng_told_truth"], ...(bad ? { rel: -2 } : {}) }, bad ? "Nhẹ lòng, chuyện cũ có thể lan ra" : "Không tiền, có một người học trò"),
      C("Bắt đầu một công ty mới", { counters: step(c, SU), bw: -6, gamble: { p: 0.35, win: { income_mult: 1.4, log: "Lần thứ hai, bạn mắc ít lỗi hơn, và ngủ nhiều hơn." }, lose: { money: -0.4, happy: -3, log: "Lần thứ hai không dễ hơn lần đầu." } } }, "Thêm một vòng đời nữa")], 1); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(SU, "kng_pitch", [20, 60], 7, (c) => T("Bốn mươi lần bị từ chối", vary("kngp", c.age, ["Bạn đã trình bày ý tưởng với bốn mươi nhà đầu tư. Người thứ bốn mươi mốt bảo ý tưởng hay, nhưng bạn nên thay người đồng sáng lập.", "Một nhà đầu tư nghe bạn nói được ba phút thì cầm điện thoại lên. Cuối buổi, ông ta bảo sẽ rót vốn nếu bạn chuyển công ty sang thành phố khác."]), [
    C("Làm theo yêu cầu để có tiền", { income_mult: 1.15, rel: -3, counters: { kng_cred: -1 } }, "Có vốn, mất một phần thứ bạn tin"),
    C("Cảm ơn, đi gặp người thứ bốn mươi hai", { happy: -2, counters: { kng_cred: 1 } }, "Giữ được mình, thêm một tháng không lương")], 1)),
  daily(SU, "kng_hire", [20, 60], 8, () => T("Kỹ sư giỏi nhất bạn từng gặp", "Người kỹ sư bạn muốn tuyển nhất đòi mức lương cao hơn lương của chính bạn. Một công ty lớn cũng đang mời anh ta.", [
    C("Trả đủ bằng tiền mặt", { money: -0.15, counters: { kng_cred: 1 } }, "Đội mạnh lên, quỹ lương cạn nhanh"),
    C("Trả nửa lương, nửa cổ phần", { flags: ["kng_equity_staff"], gamble: { p: 0.5, win: { counters: { kng_cred: 1 }, log: "Anh ta nhận. Ba năm sau anh ta vẫn ở lại, như một người chủ." }, lose: { log: "Anh ta chọn công ty lớn. Bạn tuyển người khác, chậm hơn." } } }, "Rẻ bây giờ, chia bánh về sau"),
    C("Tuyển người rẻ hơn, tự kèm cặp", { bw: -5, money: 0.03 }, "Tiết kiệm, bạn gánh thêm việc")], 1)),
  daily(SU, "kng_3am", [20, 60], 7, (c) => T("Ba giờ sáng ở văn phòng", vary("kng3", c.age, ["Bạn ngủ trên ghế văn phòng tuần thứ ba liên tiếp. Ngày ra mắt còn mười ngày. Tim bạn thỉnh thoảng đập lỡ một nhịp.", "Bạn quên sinh nhật một người thân, lần thứ hai trong năm. Lịch tuần sau có mười bốn cuộc họp."]), [
    C("Làm tiếp, ra mắt xong sẽ nghỉ", { health: -6, counters: { kng_cred: 1 } }, "Kịp hạn, cơ thể ghi sổ"),
    C("Tắt máy một tuần, giao việc cho đội", { health: 4, bw: 5, flags: ["kng_delegates"], gamble: { p: 0.6, win: { log: "Đội làm được mà không cần bạn. Bạn hơi buồn, rồi thấy nhẹ." }, lose: { counters: { kng_cred: -1 }, log: "Ngày ra mắt lùi hai tuần. Có người trong đội cằn nhằn." } } }, "Hồi sức, có thể trễ hạn")], 0)),
  daily(SU, "kng_clone", [20, 60], 9, () => T("Tập đoàn làm bản sao", "Một tập đoàn lớn tung ra tính năng giống hệt sản phẩm của bạn, miễn phí, gắn sẵn trong ứng dụng mà ai cũng có.", [
    C("Giảm giá, đấu thẳng", { money: -0.2, gamble: { p: 0.3, win: { counters: { kng_cred: 1 }, log: "Khách ở lại vì bạn trả lời tin nhắn nhanh hơn tập đoàn kia." }, lose: { income_mult: 0.8, log: "Một nửa khách đi mất trong một quý." } } }, "Đốt tiền, có thể giữ khách"),
    C("Lùi về phục vụ nhóm khách nhỏ họ bỏ qua", { income_mult: 0.9, flags: ["kng_niche"], counters: { kng_cred: 1 } }, "Nhỏ lại, sống được lâu", { tier: "awakened" }),
    C("Gửi thư đề nghị bán công ty cho họ", { gamble: { p: 0.25, win: { ...leave(SU), money: 0.6, log: "Họ mua lại với giá vừa phải. Bạn về làm cho họ một năm." }, lose: { happy: -3, log: "Thư không có hồi âm." } } }, "Thoát nhanh, có thể bị lờ đi")], 1)),
  daily(SU, "kng_press", [20, 60], 8, (c) => T("Lên trang bìa", `Một tạp chí muốn đưa bạn lên trang bìa với dòng tít "thiên tài". Phóng viên gợi ý nói con số người dùng "làm tròn lên" cho đẹp.${c.age >= 35 ? " Họ cũng muốn bớt vài tuổi của bạn." : ""}`, [
    C("Nói đúng con số, kể cả những lần thất bại", { counters: { kng_cred: 1, honest: 1 }, happy: 1 }, "Bài báo nhạt hơn, không ai bắt lỗi được"),
    C("Để họ viết như họ muốn", { counters: { kng_cred: -1 }, flags: ["kng_hype"], income_mult: 1.1 }, "Nổi nhanh, phải gồng giữ một hình ảnh")], 0)),
  daily(SU, "kng_data", [20, 60], 9, () => T("Người mua dữ liệu", "Một công ty quảng cáo đề nghị mua dữ liệu khách hàng của bạn: thói quen, vị trí, số điện thoại. Khoản tiền đủ trả lương cả đội nửa năm.", [
    C("Bán, chỉ một lần thôi", { money: 0.2, flags: ["kng_sold_data"], counters: { kng_cred: -2 } }, "Sống thêm nửa năm, phản bội khách"),
    C("Từ chối", { money: -0.05, counters: { honest: 1 } }, "Quỹ cạn hơn, giữ lời với khách"),
    C("Từ chối, công khai cách bạn giữ dữ liệu", { counters: { kng_cred: 2 }, agency: 0.02, bw: -3 }, "Thêm việc, thành điểm khác biệt", { tier: "sovereign" })], 1)),
  daily(SU, "kng_cofounder", [22, 60], 10, (c, N) => { const p = role(c, "partner")!; return T(`${N(p)} muốn rút`, `${N(p)} nói đã kiệt sức và muốn rời công ty, nhưng giữ nguyên phần cổ phần đang có. Bạn sẽ làm thêm mười năm, chia lãi cho một người không còn ở đây.`, [
    C(`Gom tiền mua lại phần của ${N(p)}`, { money: -0.4, ...mem(p, "WIN_WIN_DEAL", 0.3, "mua lại cổ phần sòng phẳng") }, "Tốn tiền nhà, công ty gọn"),
    C(`Để ${N(p)} giữ cổ phần, chia tay êm`, { ...tr(p, 0.2), counters: { kng_cred: -1 }, happy: -2 }, "Êm bây giờ, chia lãi cho người vắng mặt"),
    C("Đề nghị cổ phần theo năm làm, áp cho cả hai", { agency: 0.02, gamble: { p: 0.55, win: { ...mem(p, "KEPT_PROMISE", 0.2, "chia lại cổ phần theo năm làm việc"), flags: ["kng_vesting"], log: "Hai người ký một thỏa thuận mới. Cổ phần đi theo công sức." }, lose: { ...mem(p, "HUMILIATED_ME", -0.2, "bị đòi chia lại cổ phần lúc rút"), log: `${N(p)} thấy bị xúc phạm và gọi luật sư.` } } }, "Công bằng, có thể thành kiện tụng", { tier: "sovereign" })], 2, { npc: p }); }, (c) => !!role(c, "partner")),
  daily(SU, "kng_license", [22, 60], 9, (c, N) => { const o = role(c, "official"); return T("Giấy phép chưa có tên", `Một quy định mới bắt sản phẩm của bạn phải có loại giấy phép chưa từng tồn tại. ${o ? `${N(o)}, người quen ở cơ quan quản lý, nói có thể "đi nhanh" nếu bạn hiểu ý.` : "Một người làm dịch vụ giấy tờ nói có thể \"đi nhanh\" nếu bạn hiểu ý."} Đi đường thường thì mất sáu tháng.`, [
    C("Gửi khoản tiền \"hiểu ý\"", { money: -0.15, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [3, 9], note: "chi tiền để có giấy phép nhanh" }, ...tr(o, 0.1) }, "Có giấy trong tuần, giữ một bí mật"),
    C("Làm hồ sơ đúng đường, chờ sáu tháng", { income_mult: 0.9, counters: { honest: 1 } }, "Mất sáu tháng doanh thu, sạch sẽ"),
    C("Cùng các công ty nhỏ góp ý sửa quy định", { agency: 0.03, flags: ["leader"], bw: -4, gamble: { p: 0.4, win: { counters: { kng_cred: 2 }, log: "Bản quy định sửa lại có một điều khoản cho công ty nhỏ. Người trong nghề nhớ tên bạn." }, lose: { income_mult: 0.9, log: "Góp ý được ghi nhận, rồi nằm đó. Bạn vẫn phải chờ." } } }, "Lâu và mệt, có thể đổi luật chơi", { tier: "sovereign" })], 1, o ? { npc: o } : {}); }),
  daily(SU, "kng_pivot", [20, 60], 9, () => T("Tính năng không ai để ý", "Sản phẩm chính của bạn ì ạch. Nhưng có một tính năng phụ, làm vội trong một đêm, được dùng nhiều gấp năm lần mọi thứ còn lại.", [
    C("Bỏ sản phẩm chính, dồn sức cho tính năng ấy", { flags: ["kng_pivot"], bw: -4, gamble: { p: 0.5, win: { income_mult: 1.3, log: "Sau một năm, cái tính năng làm vội trở thành cả công ty." }, lose: { income_mult: 0.85, log: "Hóa ra người ta chỉ thích nó vì nó miễn phí." } } }, "Bỏ ba năm công sức, có thể đúng hướng"),
    C("Giữ tầm nhìn ban đầu", { happy: 2, counters: { kng_cred: 1 }, income_mult: 0.95 }, "Trung thành với ý tưởng, chậm thêm một năm")], 0)),
  daily(SU, "kng_offer", [25, 60], 99, (c) => T("Lương gấp ba", `Một công ty công nghệ lớn mời bạn về làm trưởng nhóm, lương gấp ba những gì bạn tự trả cho mình. ${c.married ? "Bạn đời của bạn đã đọc thư mời trước bạn." : "Tài khoản của bạn còn đủ sống bốn tháng."}`, [
    C("Nhận lời, đóng công ty", { ...leave(SU), flags: ["kng_ex_founder"], money: 0.1, happy: -2 }, "Yên ổn, bỏ lại giấc mơ dở dang"),
    C("Từ chối, ở lại với đội", { happy: 2, counters: { kng_cred: 1 }, bw: -2 }, "Nghèo thêm, đội tin bạn hơn")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(SU, "kng_family", [22, 60], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "father") || !!role(c, "mother"), (c, N) => {
    const s = c.married ? role(c, "spouse") : undefined;
    if (s) return T("Bao giờ thì có lương?", `${N(s)} ngồi cộng hóa đơn tháng này trên bàn ăn. Ba năm nay nhà sống bằng lương của ${N(s)}. Tối nay ${N(s)} hỏi thẳng: bạn cho công ty thêm bao lâu nữa?`, [
      C("Hứa thêm một năm, không thành thì dừng", { promise: { to: s, what: "dừng công ty nếu sau một năm vẫn chưa có lương", years: 1 }, ...tr(s, 0.15) }, "Có hạn chót, có thể phải tự tay dừng nó", { tier: "awakened" }),
      C("Nói rằng chỉ cần thêm chút nữa", { ...tr(s, -0.2), happy: -2 }, "Giữ công ty, mòn lòng tin trong nhà"),
      C("Đi làm thêm buổi tối để góp tiền nhà", { money: 0.1, health: -4, ...tr(s, 0.1) }, "Nhà dễ thở hơn, bạn cạn sức")], 0, { npc: s });
    const p = (role(c, "father") ?? role(c, "mother"))!;
    return T(vn(c) ? "Sổ đỏ trên bàn thờ" : "Giấy tờ căn nhà", `${N(p)} đặt ${vn(c) ? "cuốn sổ đỏ" : "giấy tờ căn nhà"} lên bàn, bảo bạn mang đi thế chấp lấy vốn. Đó là căn nhà duy nhất ${N(p)} có.`, [
      C("Nhận, hứa chuộc lại trong năm năm", { money: 0.6, ...tr(p, 0.2), promise: { to: p, what: "chuộc lại căn nhà đã thế chấp", years: 5 } }, "Có vốn, đặt mái nhà của cha mẹ vào cược"),
      C("Từ chối, không để nhà vào rủi ro", { happy: -1, ...tr(p, 0.05) }, "Thiếu vốn, ngủ ngon hơn"),
      C("Vay một nửa, viết giấy vay rõ ràng", { money: 0.3, promise: { to: p, what: "trả khoản vay có giấy tờ", years: 3 } }, "Ít vốn hơn, sòng phẳng như người ngoài", { tier: "awakened" })], 2, { npc: p });
  }),
];

/* ================================================================== DÂN BẤT ĐỘNG SẢN */
const REAL_ESTATE: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(RE, "bds_t_bike", [9, 16], () => true, () => T("Người bán hộ nhỏ tuổi", "Ông hàng xóm rao bán chiếc xe đạp cũ mãi không ai mua. Bạn lau sạch, chụp ảnh đẹp, kể cho người mua nghe chiếc xe đã chở ai đi học suốt mười năm. Xe bán được giá gấp rưỡi, ông chia cho bạn một phần.", [
    C("Nhận tiền, nhận bán hộ thêm", { money: 0.01, flags: [talentFlag(RE)], counters: { talents_seen: 1 }, happy: 2, know: -1 }, "Có tiền tiêu vặt, mê nghề nói hơn mê học"),
    C("Trả lại, bảo mình giúp cho vui", { counters: { talents_seen: 1, kind: 1 }, rel: 2 }, "Được quý, ngọn lửa buôn bán tắt")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RE, "bds_d_fever", [22, 45], () => true, (c) => T("Cơn sốt đất", `${c.econ_phase === "boom" ? "Giá nhà đất trong thành phố tăng mỗi tuần." : "Thị trường nhà đất vừa có dấu hiệu ấm lại."} Một người bạn cũ, ba năm trước còn vay tiền bạn, giờ lái xe mới và rủ bạn vào đội bán hàng của một dự án ${vn(c) ? "ven đô" : "ở ngoại ô"}. Không lương cứng, chỉ có hoa hồng.`, [
    C("Bỏ việc, đi bán dự án", { ...become(RE), counters: { doors_seen: 1 }, bw: -3 }, "Mất lương cứng, mỗi tháng là một canh bạc"),
    C("Thử bán ngoài giờ trước", { counters: { doors_seen: 1 }, health: -2, gamble: { p: 0.35, win: { ...become(RE), money: 0.1, log: "Căn đầu tiên bạn chốt bằng ba tháng lương cũ. Bạn nộp đơn nghỉ việc." }, lose: { happy: -2, log: "Ba tháng dẫn khách đi xem, không ai đặt cọc." } } }, "An toàn, chậm, có thể lỡ con sóng"),
    C("Đứng ngoài, giữ việc", { counters: { doors_seen: 1 }, money: 0.02, happy: -1 }, "Yên ổn, nhìn người khác giàu lên")], 1)),
  door(RE, "bds_d_land", [25, 55], () => true, (c, N) => { const s = role(c, "sibling"); return T(vn(c) ? "Mảnh đất hương hỏa" : "Mảnh đất của ông bà", `Một công ty muốn mua mảnh đất ông bà để lại. Cả nhà không ai hiểu giấy tờ, ${s ? `${N(s)} thì muốn bán ngay` : "người muốn bán ngay, người muốn giữ"}. Bạn mất ba tháng đọc từng tờ quy hoạch, và nhận ra họ đang trả rẻ một nửa.`, [
    C("Tự đàm phán, rồi ở lại với nghề này", { ...become(RE), counters: { doors_seen: 1 }, money: 0.2, rel: -2 }, "Có nghề mới, mang tiếng buôn đất của nhà"),
    C("Thuê môi giới lo hết, chia tiền cho nhanh", { counters: { doors_seen: 1 }, money: 0.15, ...tr(s, 0.1) }, "Tiền nhanh, mất phần chênh"),
    C("Không bán, lập giấy chia rõ phần từng người", { counters: { doors_seen: 1 }, flags: ["bds_family_land"], agency: 0.02, ...tr(s, -0.1) }, "Giữ đất, có người trong nhà phật ý", { tier: "sovereign" })], 0, s ? { npc: s } : {}); }),

  /* ---------- mạch truyện ---------- */
  beat(RE, 1, 1, (c) => T("Căn hộ có vết thấm", "Ba tháng dẫn bốn mươi khách đi xem, bạn chưa chốt được căn nào. Hôm nay một cặp vợ chồng trẻ sắp đặt cọc căn hộ tầng chín, dồn hết tiền của cả hai bên gia đình. Bạn biết trần nhà tắm căn đó thấm nước mỗi mùa mưa.", [
    C("Chỉ cho họ vết thấm", { counters: step(c, RE, { bds_rep: 1 }), flags: ["bds_straight"], money: -0.03 }, "Mất hợp đồng đầu tiên, được tiếng thật thà"),
    C("Im lặng, chốt hợp đồng", { counters: step(c, RE, { bds_rep: -1 }), money: 0.15, flags: ["bds_first_sale"] }, "Có tiền, có một cặp vợ chồng sẽ biết")], 0)),
  beat(RE, 2, 3, (c) => { const straight = f(c, "bds_straight"); return T("Ôm mười căn", `Chủ đầu tư đề nghị bạn mua trước mười căn với giá chiết khấu, bán dần khi giá lên. Ngân hàng sẵn lòng cho vay bảy phần.${straight ? " Mấy khách cũ, những người bạn từng nói thật, hỏi có thể góp vốn theo bạn không." : ""}`, [
    C("Vay ngân hàng, ôm cả mười căn", { counters: step(c, RE), custom: "borrow:1.5", flags: ["bds_leveraged"] }, "Có thể giàu gấp ba, có thể nợ cả đời"),
    C("Không ôm, chỉ ăn hoa hồng", { counters: step(c, RE), income_mult: 1.3, flags: ["bds_broker_only"] }, "Giàu chậm, ngủ yên"),
    C("Lập quỹ nhỏ với khách quen, công khai sổ sách", { counters: step(c, RE), agency: 0.03, gamble: { p: straight ? 0.6 : 0.3, win: { income_mult: 1.5, flags: ["bds_client_fund"], counters: { bds_rep: 1 }, log: "Mười hai người góp tiền. Mỗi quý bạn gửi họ sổ sách đến từng đồng." }, lose: { income_mult: 1.1, flags: ["bds_broker_only"], log: "Không ai đủ tin để đưa tiền cho một người môi giới." } } }, "Lựa chọn thứ ba, cần lòng tin đã có", { tier: "sovereign" })], 1); }),
  beat(RE, 3, 4, (c) => { const lev = f(c, "bds_leveraged"); return T("Thị trường đóng băng", `${c.econ_phase === "crisis" ? "Khủng hoảng lan đến ngân hàng." : "Ngân hàng siết tín dụng sau một đêm."} Giá nhà rơi ba phần mười, không ai mua, không ai bán. ${lev ? "Ngân hàng gửi thư đòi trả trước hạn khoản vay mười căn." : "Ba tháng liền bạn không có một đồng hoa hồng."}${n(c, "bds_rep") >= 2 ? " Vài khách cũ vẫn gọi hỏi thăm." : ""}`, lev ? [
    C("Bán tháo, cắt lỗ", { counters: step(c, RE), money: -1.0, income_mult: 0.8, flags: ["bds_cut_loss"] }, "Mất nhiều, cầm được máu"),
    C("Gồng, vay chỗ này đắp chỗ kia", { counters: step(c, RE), bw: -8, gamble: { p: 0.35, win: { money: 1.5, flags: ["bds_survived_freeze"], log: "Hai năm sau thị trường ấm lại. Mười căn của bạn đáng gấp đôi giá mua." }, lose: { custom: "restructure", money: -1.2, flags: ["bds_bankrupt"], log: "Khoản vay chồng khoản vay. Ngân hàng phát mãi tài sản của bạn." } } }, "Có thể lật ngược, có thể vỡ nợ"),
    C("Ngồi với ngân hàng, xin giãn nợ, trả dần", { counters: step(c, RE), custom: "restructure", income_mult: 0.85, flags: ["bds_restructured"] }, "Nợ kéo dài, không mất trắng", { longterm: true }),
    C("Giao lại tài sản cho ngân hàng, rời nghề", { counters: step(c, RE), ...leave(RE), money: -0.6, happy: -4 }, "Thoát nợ, mất mười năm tích lũy")] : [
    C("Bám nghề, sống bằng tiền tiết kiệm", { counters: step(c, RE, { bds_rep: 1 }), money: -0.3 }, "Cạn túi, giữ được khách"),
    C("Chuyển sang quản lý nhà cho thuê", { counters: step(c, RE), income_mult: 0.8, flags: ["bds_rental_mgmt"] }, "Thu nhập thấp, đều đặn"),
    C("Rời nghề, đi làm công ăn lương", { counters: step(c, RE), ...leave(RE), money: 0.05 }, "Có lương, bỏ lại những năm dẫn khách")], 0); }),
  beat(RE, 4, 5, (c, N) => {
    if (f(c, "bds_bankrupt")) { const k = role(c, "creditor"); return T("Món nợ hai mươi năm", `Sau phiên phát mãi, bạn còn nợ một khoản mà trả đều mỗi tháng cũng mất hai mươi năm. ${k ? `${N(k)} gọi điện mỗi sáng thứ Hai.` : "Điện thoại đòi nợ reo mỗi sáng thứ Hai."} Một người quen mời bạn làm môi giới phòng trọ, hoa hồng bằng một phần mười ngày xưa.`, [
      C("Nhận, làm lại từ phòng trọ", { counters: step(c, RE), income_mult: 0.7, flags: ["bds_restart"], ...tr(k, 0.2) }, "Nhục và chậm, trả được nợ"),
      C("Bán căn nhà đang ở để trả bớt nợ", { counters: step(c, RE), custom: "repay:0.8", happy: -6, close_doors: ["inheritance"] }, "Nhẹ nợ, mất mái nhà"),
      C("Bỏ nghề, đi xa làm lại", { counters: step(c, RE), ...leave(RE), ...mem(k, "CHEATED_ME", -0.4, "bỏ đi khi còn nợ chưa trả") }, "Thoát cảnh đòi nợ, để lại một món nợ người")], 0, k ? { npc: k } : {}); }
    if (f(c, "bds_client_fund") || f(c, "bds_survived_freeze")) { const o = role(c, "official"); const who = o ? N(o) : "một cán bộ"; return T("Dự án đầu tiên của riêng bạn", `Bạn đủ vốn để tự làm một dự án: tòa nhà mười hai tầng trên khu đất cũ của một nhà máy. Hồ sơ chuyển đổi mục đích đất nằm trên bàn ${who} đã bốn tháng. Người ta nói "chi phí" bằng một phần mười dự án.`, [
      C("Chi khoản đó, khởi công ngay", { counters: step(c, RE), money: 1.5, income_mult: 1.3, secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [3, 10], note: "chi tiền để được duyệt dự án nhà" }, ...tr(o, 0.2) }, "Giàu to, giữ bí mật lớn nhất đời"),
      C("Không chi, chờ đến bao giờ thì chờ", { counters: step(c, RE, { honest: 1 }), income_mult: 0.9, bw: -5 }, "Vốn nằm chết, lương tâm yên"),
      C("Đổi thiết kế thành nhà giá vừa cho công nhân", { counters: step(c, RE, { bds_rep: 1 }), agency: 0.04, gamble: { p: 0.5, win: { money: 0.6, flags: ["bds_affordable"], log: "Dự án nhà giá vừa được duyệt theo diện ưu đãi. Lãi mỏng, bán hết trong một tuần." }, lose: { money: -0.3, log: "Hồ sơ mới lại nằm thêm một năm. Bạn trả lãi cho tiền nằm chờ." } } }, "Lãi mỏng, không ai nắm thóp bạn", { tier: "sovereign" })], 2, o ? { npc: o } : {}); }
    const rep = n(c, "bds_rep");
    return T("Văn phòng môi giới của riêng bạn", `Bạn mở văn phòng riêng với tám người môi giới trẻ.${rep >= 2 ? " Một nửa khách đến vì nghe nói bạn không nói dối." : rep < 0 ? " Trên mạng vẫn còn vài bài kể tên bạn như một tay cò." : ""} Cả tám người hỏi bạn cùng một câu: ở đây thưởng thế nào.`, [
      C("Khoán doanh số cao, không hỏi cách bán", { counters: step(c, RE, { bds_rep: -1 }), income_mult: 1.5, flags: ["bds_hard_sell"] }, "Tiền về nhanh, tên bạn gắn với mọi lời hứa"),
      C("Trả lương cứng, cấm nói sai về căn nhà", { counters: step(c, RE, { bds_rep: 2 }), income_mult: 1.15, flags: ["bds_clean_office"] }, "Ít tiền hơn, khách quay lại", { longterm: true }),
      C("Đóng văn phòng, chỉ giữ vài khách quen", { counters: step(c, RE), income_mult: 0.8, happy: 4 }, "Nhỏ lại, đỡ mệt")], 1);
  }),
  beat(RE, 5, 6, (c) => { const rep = n(c, "bds_rep"); return T("Con phố bạn từng bán", `Bạn đi bộ qua khu phố có những lô đất đầu tiên bạn bán hai mươi năm trước. ${rep >= 2 ? "Một bà cụ nhận ra bạn, gọi cháu ra chào: \"Người bán nhà cho bà đấy.\"" : "Những ngôi nhà cũ đã thành quán xá, chủ cũ không còn ai ở lại."} Hội cư dân đang tìm đất làm sân chơi cho trẻ con.`, [
    C("Hiến một lô đất bạn còn giữ", { counters: step(c, RE), money: -0.5, rel: 5, flags: ["bds_gave_land"] }, "Mất một tài sản, để lại một chỗ chơi"),
    C("Giữ đất để lại cho con cháu", { counters: step(c, RE), flags: ["bds_land_heir"], happy: 2, rel: -2 }, "Con cháu có của, hàng xóm không quên"),
    C("Bán lô đất cho hội với giá vốn", { counters: step(c, RE), money: 0.1, rel: 3, agency: 0.02 }, "Không lãi, không thiệt, ai cũng có phần", { tier: "awakened" })], 0); }, (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(RE, "bds_fake_queue", [22, 65], 8, (c) => T("Hàng người xếp hàng thuê", vary("bdsq", c.age, ["Ngày mở bán, chủ đầu tư thuê sáu mươi người đứng xếp hàng cho đông. Trưởng nhóm dặn bạn nói với khách: \"Chỉ còn ba căn.\"", "Trưởng nhóm muốn bạn đăng bài \"khách vừa đặt cọc căn cuối\", dù căn đó chưa ai hỏi tới."]), [
    C("Nói theo kịch bản", { money: 0.08, counters: { bds_rep: -1 } }, "Chốt nhanh, khách sẽ biết"),
    C("Nói đúng số căn còn lại", { counters: { bds_rep: 1, honest: 1 }, money: -0.02 }, "Chốt chậm, trưởng nhóm để ý bạn")], 0)),
  daily(RE, "bds_deposit", [22, 65], 8, () => T("Bà cụ muốn rút cọc", "Bà cụ bán nhà qua tay bạn đã nhận cọc, giờ muốn hủy vì con trai bà phản đối. Theo hợp đồng, bà phải đền gấp đôi tiền cọc, và bạn mất hoa hồng.", [
    C("Giữ đúng hợp đồng, bà phải đền", { money: 0.1, counters: { bds_rep: -1 }, happy: -2 }, "Đúng luật, có tiền, mang tiếng ép người già"),
    C("Thuyết phục người mua nhận lại cọc, thôi", { money: -0.05, counters: { bds_rep: 1 }, rel: 2 }, "Mất hoa hồng, hai bên đều nợ bạn một lần"),
    C("Ngồi cả ba bên, tìm cho bà một căn gần con", { bw: -4, agency: 0.02, gamble: { p: 0.5, win: { money: 0.08, counters: { bds_rep: 2 }, log: "Bà bán nhà, mua căn nhỏ gần con trai. Bạn nhận hai lần hoa hồng." }, lose: { counters: { bds_rep: 1 }, log: "Con trai bà không chịu. Hợp đồng hủy êm." } } }, "Mất công gấp ba, có thể ai cũng được", { tier: "sovereign" })], 1)),
  daily(RE, "bds_fence", [22, 65], 9, (c, N) => { const nb = role(c, "neighbor")!; return T("Hàng rào lệch ba tấc", `Khách mua nhà qua bạn phát hiện hàng rào của ${N(nb)} lấn sang đất mình ba tấc. Hai bên sắp đưa nhau ra tòa, và cả hai đều gọi cho bạn.`, [
    C("Đứng về phía khách của mình", { ...mem(nb, "TOOK_MY_LAND", -0.3, "đứng ra đòi ba tấc đất chỗ hàng rào"), counters: { bds_rep: 1 } }, "Khách tin, hàng xóm thù"),
    C("Rút lui, để hai bên tự lo", { happy: -1, counters: { bds_rep: -1 } }, "Không dính, không ai cảm ơn"),
    C("Mời đo đạc lại, chia đôi phí", { money: -0.03, gamble: { p: 0.6, win: { ...mem(nb, "WIN_WIN_DEAL", 0.3, "đo lại ranh đất, hai nhà làm lành"), counters: { bds_rep: 1 }, log: "Bản đo mới khác cả hai bản cũ. Hai bên cười, dời hàng rào một tấc." }, lose: { log: "Một bên không chịu đo. Vụ kiện vẫn đi tiếp." } } }, "Tốn chút tiền, có thể dẹp vụ kiện", { tier: "awakened" })], 2, { npc: nb }); }, (c) => !!role(c, "neighbor")),
  daily(RE, "bds_poach", [22, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Khách bị hớt tay trên", `Người khách bạn dẫn đi xem nhà năm lần vừa ký hợp đồng qua ${N(r)}, với mức hoa hồng chỉ bằng một nửa. ${N(r)} còn nhắn tin cảm ơn bạn.`, [
    C("Gọi chủ nhà đòi chia hoa hồng", { money: 0.04, ...mem(r, "HUMILIATED_ME", -0.2, "bị tố hớt khách trước mặt chủ nhà") }, "Đòi được ít tiền, thêm một kẻ thù"),
    C("Bỏ qua, lần sau ký giấy giữ khách", { flags: ["bds_signed_mandates"], money: -0.02 }, "Mất lần này, khôn hơn lần sau"),
    C(`Rủ ${N(r)} chia khách theo khu`, { gamble: { p: 0.45, win: { ...mem(r, "WIN_WIN_DEAL", 0.3, "chia khu môi giới, thôi giẫm chân nhau"), income_mult: 1.05, log: "Hai người vạch ranh khu trên tấm bản đồ ở quán nước. Thỏa thuận giữ được năm năm." }, lose: { happy: -2, log: "Đối thủ gật đầu, rồi vẫn sang khu của bạn." } } }, "Hòa bình có lời, có thể bị lừa lần nữa", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RE, "bds_plan", [22, 65], 10, (c, N) => { const o = role(c, "official"); const who = o ? N(o) : "Một người quen trong ủy ban"; return T("Tin về con đường mới", `${who} thì thầm: tháng sau sẽ công bố một con đường lớn chạy qua khu ruộng phía tây. Giá đất ở đó sẽ gấp năm. Người báo tin muốn được chia phần.`, [
    C("Mua trước, chia phần cho người báo tin", { money: 0.6, secret: { tag: "PAID_BRIBE", severity: 0.45, fuse_years: [2, 8], note: "chia lời mua đất nhờ tin quy hoạch chưa công bố" }, ...tr(o, 0.2) }, "Lãi lớn, có người nắm thóp mình"),
    C("Không dùng tin chưa công bố", { counters: { honest: 1 }, ...tr(o, -0.1) }, "Lỡ một mối lời, sạch tay"),
    C("Báo cho dân khu ruộng đừng bán rẻ", { rel: 4, agency: 0.03, counters: { bds_rep: 1 }, ...tr(o, -0.3) }, "Dân giữ được của, có người ghét bạn", { tier: "sovereign" })], 1, o ? { npc: o } : {}); }),
  daily(RE, "bds_tenant", [22, 70], 8, (c) => T("Ba tháng chưa trả tiền nhà", vary("bdst", c.age, ["Gia đình thuê căn hộ bạn quản lý đã nợ ba tháng tiền nhà. Người chồng mất việc, đứa nhỏ đang học lớp hai.", "Một ông cụ sống một mình trong căn phòng bạn cho thuê nợ tiền hai tháng. Ông nói con ông sắp gửi tiền về."]), [
    C("Cho ở thêm, giãn nợ", { money: -0.05, rel: 2, flags: ["bds_soft_landlord"] }, "Mất tiền, có thể mất luôn"),
    C("Yêu cầu dọn đi trong tháng này", { money: 0.04, happy: -3, counters: { bds_rep: -1 } }, "Thu hồi được nhà, mất ngủ"),
    C("Tìm cho họ chỗ rẻ hơn, xóa nợ cũ", { money: -0.03, bw: -3, counters: { bds_rep: 1 } }, "Mất công, chia tay tử tế", { tier: "awakened" })], 0)),
  daily(RE, "bds_flood", [22, 65], 9, () => T("Hầm xe ngập nước", "Mưa lớn một đêm, hầm xe của tòa nhà bạn đã bán gần hết căn ngập đến nửa bánh xe. Người mua lập nhóm, căng băng rôn. Chủ đầu tư nhờ bạn \"trấn an khách\".", [
    C("Đứng về phía người mua", { counters: { bds_rep: 2 }, income_mult: 0.9, flags: ["bds_sided_buyers"] }, "Mất mối chủ đầu tư, được tiếng"),
    C("Trấn an khách theo lời chủ đầu tư", { money: 0.06, counters: { bds_rep: -2 } }, "Giữ mối làm ăn, mất mặt với khách")], 0)),
  daily(RE, "bds_live", [22, 60], 8, (c) => T("Lên hình mỗi tối", vary("bdsl", c.age, ["Người môi giới trẻ trong văn phòng bán nhà qua video mỗi tối, khách đến tận cửa. Họ bảo bạn: không lên hình thì ba năm nữa hết nghề.", "Một đoạn video bạn quay căn nhà cũ bỗng có cả triệu lượt xem. Người ta bình luận đòi bạn quay mỗi ngày."]), [
    C("Quay video mỗi ngày", { bw: -5, income_mult: 1.1, flags: ["bds_online"] }, "Thêm khách, mất buổi tối"),
    C("Chỉ làm qua người quen giới thiệu", { income_mult: 0.95, happy: 1, counters: { bds_rep: 1 } }, "Ít khách, khách ở lâu")], 0)),
  daily(RE, "bds_two_price", [22, 65], 9, () => T("Giá trên giấy", "Người bán muốn ghi giá trên hợp đồng thấp hơn nửa giá thật để bớt thuế, và người mua đồng ý. Họ chỉ cần bạn đứng ra làm chứng là \"không có gì\".", [
    C("Làm theo, cả hai bên đều vui", { money: 0.05, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [3, 10], note: "làm chứng cho hợp đồng ghi giá thấp hơn giá thật" } }, "Giữ khách, giữ một tờ giấy sai"),
    C("Từ chối, mất cả vụ", { money: -0.05, counters: { honest: 1, bds_rep: 1 } }, "Mất hoa hồng, hồ sơ sạch")], 0)),
  daily(RE, "bds_quit", [28, 65], 99, (c) => T("Ngán nghề dẫn khách", `${c.broke ? "Bạn đã nửa năm không chốt được căn nào." : "Bạn mệt với những cuộc gọi lúc mười giờ đêm."} Một ngân hàng cần người thẩm định nhà đất, lương cứng, nghỉ cuối tuần.`, [
    C("Nhận, rời nghề môi giới", { ...leave(RE), flags: ["bds_appraiser"], happy: 2 }, "Ổn định, hết những cú chốt lớn"),
    C("Ở lại, chờ con sóng sau", { happy: -1, counters: { bds_rep: 1 } }, "Bấp bênh, vẫn có thể trúng lớn")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(RE, "bds_family", [25, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.married && !!role(c, "spouse")), (c, N) => {
    const p = role(c, "father") ?? role(c, "mother");
    if (p) return T("Căn nhà cũ của bố mẹ", `Căn nhà ${N(p)} ở bốn mươi năm giờ nằm trên mặt đường lớn, giá gấp hai mươi lần ngày mua. Bạn biết rõ hơn ai hết: bán bây giờ, ${N(p)} có thể sống sung túc đến cuối đời. Nhưng ${N(p)} chưa từng ngủ ở đâu khác.`, [
      C("Khuyên bán, mua căn hộ nhỏ gần bạn", { gamble: { p: 0.5, win: { money: 0.3, ...tr(p, 0.1), log: `${N(p)} đồng ý. Tháng đầu ở căn hộ mới, ${N(p)} gọi bạn mỗi tối.` }, lose: { ...tr(p, -0.25), log: `${N(p)} giận bạn cả tuần: "Con coi nhà mình như hàng hóa."` } } }, "Tiền dưỡng già, có thể mất lòng"),
      C("Không nhắc chuyện bán nữa", { ...tr(p, 0.15), happy: 1 }, "Giữ nếp nhà, bỏ một khoản lớn"),
      C("Lập giấy để nhà cho anh chị em chia đều", { agency: 0.02, flags: ["bds_family_deed"], ...tr(p, 0.1), rel: -1 }, "Không ai tranh, có người chê bạn tính toán", { tier: "awakened" })], 1, { npc: p });
    const s = role(c, "spouse")!;
    return T("Căn nhà để ở", `${N(s)} muốn mua một căn nhà để cả nhà ở hẳn. Bạn muốn dùng số tiền ấy ôm thêm hai lô đất đang lên giá.`, [
      C("Mua nhà để ở", { ...tr(s, 0.2), money: -0.2, happy: 3 }, "Yên ổn, lỡ một mối lời"),
      C("Ôm đất, thuê nhà ở thêm vài năm", { ...tr(s, -0.2), gamble: { p: 0.5, win: { money: 0.6, log: "Hai lô đất lên giá gấp đôi." }, lose: { money: -0.3, log: "Đất đứng giá. Cả nhà vẫn ở nhà thuê." } } }, "Có thể lời lớn, mất lòng người cùng nhà")], 0, { npc: s });
  }),
];

/* ================================================================== ĐẦU BẾP, CHỦ NHÀ HÀNG */
const RESTAURATEUR: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(RS, "nhh_t_soup", [8, 16], () => true, (c) => T("Nồi canh đầu tiên", `Năm đó người lớn trong nhà về muộn, bạn tự nấu bữa tối cho cả nhà. Đến tháng thứ ba, ${vn(c) ? "bà bán bún đầu ngõ" : "bà hàng xóm"} sang xin công thức món canh của bạn, và bảo bạn có cái lưỡi hiếm.`, [
    C("Theo bà học bếp mỗi chiều", { flags: [talentFlag(RS)], counters: { talents_seen: 1 }, know: -1, happy: 3 }, "Mất giờ chơi, giờ học, thêm một tay nghề"),
    C("Để dành thời gian cho bài vở", { counters: { talents_seen: 1 }, know: 2 }, "Điểm tốt hơn, cái bếp chỉ để nấu cơm")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(RS, "nhh_d_dish", [18, 35], () => true, () => T("Rửa bát ở bếp sau", "Bạn rửa bát ca tối ở một nhà hàng đông khách. Một đêm thiếu người, bếp trưởng bắt bạn thái hành, rồi nếm nồi nước dùng bạn trông hộ, im lặng một lúc. Anh ta hỏi bạn có muốn học việc không: lương bằng nửa bây giờ, mười hai giờ một ngày.", [
    C("Nhận học việc", { ...become(RS), counters: { doors_seen: 1 }, money: -0.05, health: -2 }, "Nghèo hơn, mệt hơn, có nghề"),
    C("Giữ việc rửa bát, học lỏm", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(RS), log: "Một năm sau, bếp trưởng gọi tên bạn đứng bếp phụ." }, lose: { happy: -2, log: "Bếp trưởng nghỉ việc. Người mới không biết bạn là ai." } } }, "Giữ lương, có thể lỡ dịp"),
    C("Nghỉ, tìm việc khác", { counters: { doors_seen: 1 }, money: 0.03, happy: -1 }, "Đỡ cực, bỏ lỡ một người thầy")], 0)),
  door(RS, "nhh_d_stall", [25, 50], () => true, (c, N) => { const m = role(c, "mother"); const who = m ? N(m) : "Bà chủ quán đầu ngõ"; return T(vn(c) ? "Gánh bún sắp dẹp" : "Quầy ăn sắp đóng cửa", `${who} bán ${vn(c) ? "một món bún" : "một món hầm"} ở cùng một góc phố ba mươi năm. Giờ tay đã run, không đứng bếp nổi nữa. Khách quen hỏi bạn có muốn giữ lấy cái quầy và công thức không.`, [
    C("Tiếp quản quầy, giữ nguyên công thức", { ...become(RS), counters: { doors_seen: 1 }, flags: ["nhh_inherited_recipe"], ...tr(m, 0.2) }, "Có khách sẵn, gánh cả một cái tên"),
    C("Vay tiền mở tiệm riêng với công thức ấy", { counters: { doors_seen: 1 }, custom: `borrow:0.5|become:${RS}`, flags: ["nhh_own_room"] }, "Tiệm đẹp, nợ ngay từ ngày đầu"),
    C("Để quầy đóng cửa", { counters: { doors_seen: 1 }, happy: -2 }, "Không ràng buộc, mất một hương vị")], 0, m ? { npc: m } : {}); }),
  door(RS, "nhh_d_online", [20, 45], () => true, (c) => T("Bếp nhà nhận đơn", `Bạn nấu thêm vài suất bán cho đồng nghiệp ${vn(c) ? "qua nhóm chat công ty" : "qua nhóm tin nhắn"}. Ba tháng sau, mỗi trưa có bốn mươi đơn, bếp nhà chật đến mức không còn chỗ đặt nồi cơm.`, [
    C("Bỏ việc văn phòng, thuê bếp riêng", { ...become(RS), counters: { doors_seen: 1 }, money: -0.15, agency: 0.02 }, "Mất lương cứng, có cái bếp của mình"),
    C("Giữ việc, chỉ nhận hai mươi đơn", { counters: { doors_seen: 1 }, money: 0.06, health: -2 }, "Thêm tiền, thêm mệt, không lớn được")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(RS, 1, 1, (c) => T("Mười hai chỗ ngồi", `Quán đầu tiên của bạn có mười hai chỗ ngồi và một bếp hai họng lửa. Tối khai trương, khách xếp hàng ra tận vỉa hè, nồi nước dùng ${vn(c) ? "ninh xương tám tiếng" : "hầm tám tiếng"} hết sạch lúc bảy giờ. Người phụ bếp gợi ý pha gói gia vị sẵn cho kịp.`, [
    C("Nấu đúng cách, hết thì đóng cửa", { counters: step(c, RS, { nhh_star: 1 }), flags: ["nhh_from_scratch"], money: -0.03 }, "Bán ít, giữ hương vị"),
    C("Pha đồ làm sẵn cho kịp khách", { counters: step(c, RS, { nhh_risk: 1 }), flags: ["nhh_shortcuts"], money: 0.06 }, "Bán gấp đôi, món ăn bớt hồn")], 0)),
  beat(RS, 2, 3, (c) => T("Lời mời nhượng quyền", `Quán của bạn có tên trên mạng${n(c, "nhh_star") >= 2 ? " và trong vài bài báo ẩm thực" : ""}. Một nhà đầu tư muốn mở ba mươi cửa hàng mang tên bạn trong hai năm, nấu từ một bếp trung tâm, nước dùng đóng túi.${f(c, "nhh_from_scratch") ? " Họ hỏi có thể bỏ bớt mấy tiếng ninh nước dùng không." : ""}`, [
    C("Ký, nhân rộng thương hiệu", { counters: step(c, RS), income_mult: 1.6, flags: ["nhh_franchise"] }, "Giàu nhanh, món ăn không còn trong tay bạn"),
    C("Vay tiền mở nhà hàng lớn của riêng mình", { counters: step(c, RS), custom: "borrow:0.8", income_mult: 1.3, flags: ["nhh_big_room"] }, "Giữ chất lượng, gánh nợ lớn"),
    C("Chia cổ phần cho bếp phụ, mở quán họ làm chủ", { counters: step(c, RS), income_mult: 1.15, agency: 0.03, flags: ["nhh_staff_coop"], rel: 3 }, "Lớn chậm, người làm cũng là chủ", { tier: "sovereign" })], 1)),
  beat(RS, 3, 4, (c) => { const sc = f(c, "nhh_shortcuts"); const risky = sc || n(c, "nhh_risk") >= 1;
    return T("Ca ngộ độc sau tiệc cưới", `Mười hai khách vào viện sau một tiệc cưới ${f(c, "nhh_franchise") ? "do một cửa hàng mang tên bạn" : "do bạn"} nấu. Báo địa phương đưa tin, đoàn kiểm tra hẹn đến sáng mai.${sc ? " Bạn biết lô nước sốt pha sẵn hôm ấy đã để quá ngày." : risky ? " Bạn nghĩ ngay đến mối hàng rẻ không giấy tờ." : " Bạn chưa biết lỗi nằm ở đâu: lô tôm của nhà cung cấp hay tay người trong bếp."}`, [
      C("Đóng cửa, nhận trách nhiệm, trả viện phí", { counters: step(c, RS, { nhh_star: -1 }), money: -0.5, income_mult: 0.85, flags: ["nhh_owned_up"] }, "Mất tiền, mất khách một thời, giữ được tên"),
      C("Đổ cho nhà cung cấp", { counters: step(c, RS, { honest: -1 }), gamble: { p: risky ? 0.35 : 0.6, win: { log: "Đoàn kiểm tra kết luận lỗi ở lô tôm. Quán mở lại sau một tuần." }, lose: { income_mult: 0.6, flags: ["nhh_scandal"], log: "Một người phụ bếp kể lại mọi chuyện trên mạng. Câu chuyện còn tệ hơn vụ ngộ độc." } } }, "Có thể thoát, có thể thành bê bối"),
      C("Mời đoàn kiểm tra vào, công khai mọi kết quả", { counters: step(c, RS), agency: 0.03, bw: -5, gamble: { p: risky ? 0.3 : 0.65, win: { counters: { nhh_star: 1 }, flags: ["nhh_open_kitchen"], log: "Kết quả treo ngay cửa quán. Khách quay lại, đông hơn trước." }, lose: { money: -0.4, income_mult: 0.8, log: "Kết quả cho thấy lỗi ở bếp của bạn, và ai cũng đã đọc." } } }, "Minh bạch, sự thật có thể không đẹp", { tier: "sovereign" }),
      C("Đóng hẳn, rời nghề bếp", { counters: step(c, RS), ...leave(RS), money: -0.3, happy: -4 }, "Thoát khỏi chuyện này, mất cái nghề")], 0); }),
  beat(RS, 4, 5, (c) => {
    if (f(c, "nhh_franchise")) return T("Món ăn mang tên bạn", `Chuỗi đã có bốn mươi cửa hàng. Bạn ăn thử ở một quán ngoài tỉnh và không nhận ra món của mình.${f(c, "nhh_scandal") ? " Vụ ngộ độc năm xưa vẫn hiện lên mỗi khi ai đó tìm tên bạn trên mạng." : ""} Nhà đầu tư muốn đổi sang nguyên liệu rẻ hơn nữa.`, [
      C("Bán hết cổ phần, rút tên khỏi chuỗi", { counters: step(c, RS), money: 2.0, flags: ["nhh_sold_name"], happy: -3 }, "Giàu, tên mình không còn là của mình"),
      C("Ở lại đấu cho chất lượng", { counters: step(c, RS), bw: -6, gamble: { p: 0.4, win: { counters: { nhh_star: 1 }, income_mult: 1.2, log: "Bạn giữ được công thức gốc ở mọi cửa hàng. Doanh thu giảm, khách quen quay lại." }, lose: { income_mult: 0.7, log: "Hội đồng bỏ phiếu thắng bạn. Bạn chỉ còn là gương mặt trên biển hiệu." } } }, "Có thể giữ món ăn, có thể bị gạt ra"),
      C("Rút ra, mở lại một quán mười hai chỗ", { counters: step(c, RS, { nhh_star: 1 }), income_mult: 0.7, happy: 6, flags: ["nhh_back_small"] }, "Nghèo đi, nấu lại bằng tay mình", { longterm: true })], 2);
    if (f(c, "nhh_staff_coop")) return T("Quán thứ năm của người rửa bát", `Quán thứ năm trong nhóm vừa khai trương. Chủ quán là cậu phụ bếp rửa bát năm nào, giờ đã ba mươi tuổi.${n(c, "nhh_star") >= 2 ? " Một tờ báo gọi nhóm quán của bạn là \"cái lò\" của nghề bếp thành phố." : ""} Một tập đoàn muốn mua cả nhóm.`, [
      C("Bán cả nhóm, chia đều cho mọi người", { counters: step(c, RS), money: 1.2, flags: ["nhh_coop_sold"] }, "Ai cũng có tiền, các quán sẽ đổi khác"),
      C("Giữ nhóm, lập quỹ mở quán cho người kế tiếp", { counters: step(c, RS, { nhh_star: 1 }), income_mult: 1.1, agency: 0.03, flags: ["nhh_coop_fund"] }, "Không giàu thêm, nghề sống tiếp", { tier: "sovereign" }),
      C("Rút về làm cố vấn, bớt việc", { counters: step(c, RS), income_mult: 0.85, health: 4, happy: 3 }, "Khỏe hơn, ít quyền hơn")], 1);
    if (n(c, "nhh_star") >= 2) return T("Vị khách ăn một mình", "Một người đàn ông ăn một mình, ghi chép từng món, trả tiền rồi đi. Tuần sau, quán bạn có tên trong một cuốn sách hướng dẫn ẩm thực danh tiếng. Điện thoại đặt bàn reo không ngớt.", [
      C("Tăng giá gấp đôi, mở thêm ca", { counters: step(c, RS), income_mult: 1.6, health: -4 }, "Giàu nhanh, khách quen không vào nổi"),
      C("Giữ giá, chừa một bàn cho khách quen mỗi tối", { counters: step(c, RS, { nhh_star: 1 }), income_mult: 1.2, rel: 3 }, "Lãi ít hơn, giữ được hàng xóm", { longterm: true }),
      C("Đóng cửa một tháng, đi học bếp nơi khác", { counters: step(c, RS), money: -0.2, know: 5, flags: ["nhh_studied"] }, "Mất đà, mang về món mới")], 1);
    return T("Những ghế trống tối thứ Ba", `${f(c, "nhh_scandal") ? "Từ sau vụ ngộ độc, quán chưa bao giờ đông lại như cũ." : "Phố mới mở thêm năm nhà hàng."} Tối thứ Ba chỉ có bốn bàn có khách. Tiền thuê vẫn đến hạn.`, [
      C("Cắt thực đơn, chỉ nấu những món giỏi nhất", { counters: step(c, RS, { nhh_star: 1 }), income_mult: 0.9, gamble: { p: 0.5, win: { income_mult: 1.3, log: "Thực đơn còn sáu món. Khách nói giờ mới thấy quán có tính cách." }, lose: { log: "Khách mới không quay lại. Khách cũ vẫn ít." } } }, "Rủi ro, có thể tìm lại chính mình"),
      C("Vay thêm tiền sửa sang, chạy quảng cáo", { counters: step(c, RS), custom: "borrow:0.4", gamble: { p: 0.4, win: { income_mult: 1.3, log: "Quán sơn lại, ảnh đẹp trên mạng. Khách đông dần." }, lose: { money: -0.3, log: "Quán đẹp hơn, vẫn vắng. Nợ thì nặng hơn." } } }, "Đánh cược thêm một khoản nợ"),
      C("Trả mặt bằng, đi làm bếp cho người khác", { counters: step(c, RS), ...leave(RS), happy: -3, flags: ["nhh_hired_chef"] }, "Hết nợ thuê, mất cái quán của mình")], 0);
  }),
  beat(RS, 5, 6, (c, N) => { const k = c.kids_alive > 0 ? role(c, "child") : undefined;
    return T("Cuốn sổ công thức", `Cuốn sổ công thức của bạn đã dày ba trăm trang, dính dầu mỡ, có những dòng chỉ bạn đọc được.${f(c, "nhh_inherited_recipe") ? " Trang đầu vẫn là món của người đã trao lại cái quầy cho bạn." : ""} Người học việc lâu năm nhất xin được chép lại.${k ? ` ${N(k)} thì chưa từng đứng bếp một ngày.` : ""}`, [
      C("Trao sổ cho người học việc", { counters: step(c, RS), flags: ["nhh_passed_recipes"], happy: 4, rel: 3 }, "Nghề sống tiếp, không còn là của nhà mình"),
      C(k ? `Giữ sổ, chờ ${N(k)} vào bếp` : "Giữ sổ cho người trong nhà", { counters: step(c, RS), flags: ["nhh_family_secret"], ...tr(k, -0.05) }, "Giữ bí quyết, có thể nó mất theo bạn"),
      C("In thành sách cho ai cũng nấu được", { counters: step(c, RS), money: 0.15, know: 3, agency: 0.02 }, "Ai cũng có, không còn gì là riêng", { tier: "awakened" })], 0, k ? { npc: k } : {}); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(RS, "nhh_meat", [18, 65], 8, (c) => T("Mối thịt rẻ", vary("nhhm", c.age, ["Một mối hàng chào thịt rẻ hơn ba phần mười giá chợ, giao tận nơi lúc bốn giờ sáng, không có giấy kiểm dịch.", "Người giao hải sản mới đề nghị giá rẻ bất ngờ, miễn là bạn đừng hỏi hàng từ đâu ra."]), [
    C("Lấy hàng, không hỏi", { money: 0.08, counters: { nhh_risk: 1 } }, "Lãi dày, mỗi đĩa là một canh bạc"),
    C("Giữ mối cũ, giá cao hơn", { money: -0.03, counters: { nhh_star: 1 } }, "Lãi mỏng, ngủ yên")], 1)),
  daily(RS, "nhh_review", [18, 65], 7, (c) => T("Bài chê một sao", vary("nhhr", c.age, ["Một người có hàng trăm nghìn người theo dõi đăng bài chê quán bạn, kèm ảnh một món quán không hề bán. Trước đó anh ta có nhắn xin ăn miễn phí.", "Một bài đánh giá một sao nói tìm thấy sợi tóc trong bát. Camera của quán không ghi được ai giống người viết."]), [
    C("Đăng lời đáp, kèm bằng chứng", { gamble: { p: 0.5, win: { counters: { nhh_star: 1 }, log: "Người đọc đứng về phía bạn. Quán đông hơn một tuần." }, lose: { happy: -3, counters: { nhh_star: -1 }, log: "Cuộc cãi nhau lan rộng hơn chính bài chê." } } }, "Có thể thắng, có thể thành ồn ào"),
    C("Im lặng, nấu tiếp", { happy: -2, bw: 2 }, "Không ồn, chịu tiếng một thời gian"),
    C("Mời người viết quay lại ăn, không lấy tiền", { money: -0.01, flags: ["nhh_invited_critic"], gamble: { p: 0.4, win: { counters: { nhh_star: 1 }, log: "Bài viết thứ hai dài hơn bài đầu, và tử tế hơn." }, lose: { log: "Họ không đến." } } }, "Hạ mình, có thể đổi chiều gió", { tier: "awakened" })], 1)),
  daily(RS, "nhh_advance", [18, 65], 8, () => T("Phụ bếp xin ứng lương", "Người phụ bếp làm với bạn bốn năm xin ứng ba tháng lương để đưa mẹ đi mổ. Tháng này quán vừa đủ trả tiền thuê.", [
    C("Ứng đủ", { money: -0.06, flags: ["nhh_loyal_cook"], rel: 2 }, "Quỹ quán cạn, người ở lại với bạn"),
    C("Ứng một nửa, rủ cả quán góp phần còn lại", { money: -0.03, rel: 3, flags: ["nhh_staff_fund"] }, "Chia gánh, cả quán thành một nhà", { tier: "awakened" }),
    C("Từ chối, quán không phải ngân hàng", { money: 0.01, rel: -2 }, "Giữ tiền, có thể mất người")], 0)),
  daily(RS, "nhh_inspect", [18, 65], 9, (c, N) => { const o = role(c, "official"); const who = o ? N(o) : "Trưởng đoàn"; return T("Đoàn kiểm tra không báo trước", `${o ? `${N(o)} dẫn một đoàn kiểm tra` : "Một đoàn kiểm tra"} vào bếp đúng giờ cao điểm, ghi chép mười lăm phút. Lỗi thật có hai: tủ lạnh hỏng nhiệt kế, cống thoát chậm. ${who} nói có thể "bỏ qua" nếu bạn hiểu chuyện.`, [
    C("Gửi phong bì cho xong", { money: -0.05, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: "phong bì cho đoàn kiểm tra bếp" }, ...tr(o, 0.1) }, "Mở cửa tiếp, giữ một bí mật"),
    C("Nhận biên bản, đóng cửa hai tuần sửa bếp", { money: -0.12, counters: { nhh_star: 1, honest: 1 } }, "Mất doanh thu, bếp sạch thật")], 1, o ? { npc: o } : {}); }),
  daily(RS, "nhh_burn", [18, 65], 8, (c) => T("Cái giá của bếp nóng", vary("nhhb", c.age, ["Mười bốn giờ đứng bếp mỗi ngày, bạn trượt tay với chảo dầu. Vết bỏng trên cổ tay sẽ để sẹo. Tối nay quán kín bàn.", "Lưng bạn đau đến mức không cúi xuống bê nồi nước dùng được nữa. Bác sĩ bảo nghỉ hai tháng."]), [
    C("Băng lại, đứng bếp tiếp", { health: -6, counters: { nhh_star: 1 }, money: 0.03 }, "Giữ khách, cơ thể ghi nợ"),
    C("Giao bếp cho phụ bếp, đi chữa", { health: 5, flags: ["nhh_delegated"], gamble: { p: 0.6, win: { log: "Phụ bếp nấu được. Bạn nhận ra quán không chết khi bạn vắng mặt." }, lose: { counters: { nhh_star: -1 }, log: "Khách quen nếm là biết ngay không phải bạn nấu." } } }, "Hồi sức, món ăn có thể lệch vị")], 1)),
  daily(RS, "nhh_app", [18, 65], 8, () => T("Ứng dụng lấy ba phần mười", "Một nửa đơn của quán giờ đến từ ứng dụng giao đồ ăn. Ứng dụng vừa tăng phí lên ba phần mười giá mỗi món, và muốn bạn chạy khuyến mãi mỗi cuối tuần.", [
    C("Chấp nhận, tăng giá trên ứng dụng", { income_mult: 0.95, counters: { nhh_star: -1 } }, "Giữ đơn, khách thấy quán đắt"),
    C("Rút khỏi ứng dụng, tự giao cho khách quen", { income_mult: 0.85, flags: ["nhh_own_delivery"], bw: -4 }, "Mất nửa đơn, giữ trọn tiền từng món"),
    C("Rủ các quán trong phố lập kênh đặt món chung", { agency: 0.03, bw: -5, gamble: { p: 0.35, win: { income_mult: 1.1, flags: ["leader"], log: "Hai mươi quán chung một trang đặt món. Phí chỉ bằng một phần ba ứng dụng." }, lose: { log: "Các quán không thống nhất được ai giữ tiền. Mọi thứ trở về như cũ." } } }, "Có thể đổi luật chơi, có thể tan", { tier: "sovereign" })], 0)),
  daily(RS, "nhh_rent", [20, 65], 10, (c) => T("Chủ nhà tăng tiền thuê", `${c.econ_phase === "boom" ? "Con phố của bạn thành phố ẩm thực." : "Một chuỗi cà phê lớn muốn thuê mặt bằng của bạn."} Chủ nhà báo hết hợp đồng sẽ tăng tiền thuê gấp đôi.`, [
    C("Trả giá mới, tăng giá món", { income_mult: 0.85, counters: { nhh_star: -1 } }, "Giữ địa chỉ, mất khách nghèo"),
    C("Dọn vào con hẻm phía sau", { money: -0.15, gamble: { p: 0.5, win: { counters: { nhh_star: 1 }, log: "Khách quen tìm theo. Con hẻm bỗng đông." }, lose: { income_mult: 0.85, log: "Khách vãng lai không tìm thấy quán nữa." } } }, "Tốn tiền chuyển, khách có thể không theo"),
    C("Góp tiền với hai quán bên cạnh, mua đứt mặt bằng", { custom: "borrow:0.6", flags: ["nhh_own_premises"] }, "Nợ nặng, không ai đuổi được nữa", { tier: "awakened" })], 0)),
  daily(RS, "nhh_rival", [20, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Quán đối diện", `${N(r)} mở quán ngay bên kia đường, thực đơn giống hệt quán bạn, rẻ hơn một phần năm. Biển hiệu còn ghi "công thức gốc".`, [
    C("Giảm giá, đấu thẳng", { money: -0.1, ...mem(r, "HUMILIATED_ME", -0.2, "cuộc chiến giá hai quán đối diện") }, "Mất lãi, có thể đuổi được đối thủ"),
    C("Rủ làm chung một phiên chợ đêm cả phố", { gamble: { p: 0.5, win: { ...mem(r, "WIN_WIN_DEAL", 0.3, "chung phiên chợ đêm cả phố"), money: 0.06, log: "Phiên chợ đêm kéo khách cho cả hai quán. Con phố có tên trên bản đồ ăn uống." }, lose: { log: "Họ cười, không trả lời." } } }, "Có thể thành bạn, có thể bị lợi dụng", { tier: "awakened" }),
    C("Mặc kệ, đổi thực đơn mỗi tháng", { bw: -3, counters: { nhh_star: 1 } }, "Mệt hơn, khó bị chép")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(RS, "nhh_leftover", [18, 70], 8, () => T("Hai mươi suất thừa mỗi tối", "Cuối mỗi tối quán thừa khoảng hai mươi suất ăn còn tốt. Vài người không nhà hay đứng chờ ở thùng rác sau quán. Một người quen làm luật khuyên đừng cho, lỡ ai đau bụng thì quán chịu.", [
    C("Đóng hộp, phát cho người chờ mỗi tối", { rel: 3, flags: ["nhh_shared_food"], gamble: { p: 0.85, win: { log: "Mỗi tối có một hàng người im lặng chờ. Có người về sau xin vào rửa bát." }, lose: { money: -0.08, log: "Một người đau bụng, và có kẻ xúi họ đòi quán bồi thường." } } }, "Tốt cho người khác, có rủi ro pháp lý"),
    C("Đổ bỏ như mọi quán", { happy: -2 }, "An toàn, áy náy"),
    C("Nấu ít đi, bán nửa giá trước giờ đóng cửa", { money: 0.02, counters: { nhh_star: 1 }, bw: -2 }, "Bớt lãng phí, ai cũng được một chút")], 0)),
  daily(RS, "nhh_quit", [28, 65], 99, (c) => T("Đôi tay mỏi", `${c.health < 50 ? "Đầu gối bạn kêu mỗi lần ngồi xuống." : "Ba năm nay bạn chưa ăn một bữa tối nào ở nhà."} Một trường học cần người quản lý bếp ăn: giờ hành chính, nghỉ hè, lương đều.`, [
    C("Nhận, trả lại mặt bằng", { ...leave(RS), flags: ["nhh_canteen"], health: 3 }, "Đều đặn, không còn món ăn của mình"),
    C("Ở lại với bếp lửa", { happy: 1, counters: { nhh_star: 1 }, health: -2 }, "Cực thêm, quán còn mang tên bạn")], 1), (c) => c.happy < 50 || c.broke || c.health < 45),

  /* ---------- gia đình ---------- */
  cross(RS, "nhh_family", [22, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = c.kids_alive > 0 ? role(c, "child") : undefined; const who = k ?? (c.married ? role(c, "spouse") : undefined);
    if (who) return T("Bữa tối ở nhà", `Bạn nấu cho người lạ mỗi tối, còn ${N(who)} ăn mì gói một mình. Hôm nay ${N(who)} hỏi, không giận: "Bao giờ nhà mình ăn cơm chung?"`, [
      C("Đóng quán tối thứ Hai để ăn cơm nhà", { money: -0.04, ...tr(who, 0.2) }, "Mất một tối doanh thu mỗi tuần"),
      C("Đưa người nhà vào phụ bếp", { ...tr(who, 0.05), gamble: { p: 0.5, win: { ...tr(who, 0.2), log: `${N(who)} học được món đầu tiên. Hai người cãi nhau vì muối, rồi cười.` }, lose: { ...tr(who, -0.15), log: `${N(who)} bỏ về sau ba tối: "Đây là quán của bạn, không phải nhà mình."` } } }, "Ở gần nhau hơn, có thể thêm cãi vã"),
      C("Hứa sẽ về ăn tối mỗi tuần khi quán ổn", { promise: { to: who, what: "về ăn tối với nhà mỗi tuần", years: 2 }, happy: -1 }, "Hẹn lại, có thể lại thất hứa")], 0, { npc: who });
    const p = (role(c, "mother") ?? role(c, "father"))!;
    return T(vn(c) ? "Mâm cỗ ngày giỗ" : "Bữa tiệc mừng thọ", `${N(p)} muốn bạn nấu ${vn(c) ? "mâm cỗ giỗ ông" : "bữa tiệc mừng thọ"} cho cả họ, đúng tối thứ Bảy, tối đông khách nhất của quán.`, [
      C("Đóng quán một tối, về nấu", { money: -0.04, ...tr(p, 0.25) }, "Mất doanh thu, cả họ nhớ món của bạn"),
      C("Để phụ bếp nấu sẵn rồi mang về", { ...tr(p, -0.1), money: -0.01 }, "Đỡ mất khách, mâm cỗ thiếu hơi người"),
      C("Mời cả họ đến ăn ở quán", { money: -0.02, gamble: { p: 0.6, win: { ...tr(p, 0.2), log: `${N(p)} ngồi đầu bàn, kể với khách lạ bàn bên rằng đây là quán của con mình.` }, lose: { ...tr(p, -0.05), log: "Khách lạ và họ hàng chen nhau. Không ai vui hẳn." } } }, "Vẹn đôi đường, có thể rối cả hai", { tier: "awakened" })], 0, { npc: p });
  }),
];

/* ================================================================== DÂN BUÔN BIÊN GIỚI */
const BORDER_TRADER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(BT, "bgi_t_tongue", [9, 16], () => true, (c) => T("Đứa trẻ nói hai thứ tiếng", `Mỗi phiên chợ ${vn(c) ? "biên" : "gần cửa khẩu"}, bạn theo người lớn ra bán hàng. Bạn học lỏm tiếng của người bên kia biên giới nhanh đến mức người ta nhờ bạn phiên dịch, trả bằng vài đồng tiền lẻ của cả hai nước.`, [
    C("Theo ra chợ mỗi phiên, học trả giá", { flags: [talentFlag(BT)], counters: { talents_seen: 1 }, money: 0.01, know: -1 }, "Bỏ bớt buổi học, có thêm một thứ tiếng"),
    C("Ở nhà học bài cho đủ điểm", { counters: { talents_seen: 1 }, know: 2 }, "Điểm tốt, bỏ dở một thứ tiếng")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(BT, "bgi_d_truck", [18, 40], () => true, (c, N) => { const u = role(c, "neighbor"); return T("Ghế phụ xe tải", `${u ? N(u) : "Một ông chú họ xa"} chở một xe ${c.poor_country ? "trái cây" : "hàng gia dụng"} lên cửa khẩu mỗi tuần và cần người ngồi ghế phụ: canh hàng, lo giấy tờ, nói chuyện với bạn hàng bên kia. Tiền công gấp đôi việc bạn đang làm. Ba ngày một chuyến.`, [
    C("Đi theo, học nghề buôn", { ...become(BT), counters: { doors_seen: 1 }, rel: -2, ...tr(u, 0.15) }, "Thu nhập cao, xa nhà nửa tuần"),
    C("Đi thử một chuyến cho biết", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(BT), log: "Chuyến đầu bạn chốt được giá tốt hơn người dẫn mình. Ai cũng bảo bạn có máu buôn." }, lose: { happy: -2, log: "Xe nằm ở cửa khẩu hai ngày, hàng dập một nửa. Bạn về và không đi nữa." } } }, "Chưa ràng buộc, có thể bỏ lỡ"),
    C("Từ chối, ở gần nhà", { counters: { doors_seen: 1 }, happy: 1, money: -0.02 }, "Ở gần gia đình, kiếm ít hơn")], 0, u ? { npc: u } : {}); }),
  door(BT, "bgi_d_glut", [20, 50], () => true, () => T("Mùa vụ ùn ứ", "Năm được mùa, hàng trăm xe nông sản xếp hàng ở cửa khẩu, giá trong vùng rơi xuống còn một phần ba. Người trồng hỏi nhau có ai biết đường sang bên kia tìm mối mua tận gốc không.", [
    C("Vay tiền gom hàng, sang tìm mối", { counters: { doors_seen: 1 }, custom: `borrow:0.3|become:${BT}`, bw: -3 }, "Nợ ngay, có thể thành người buôn"),
    C("Lập tổ hợp tác, cả vùng cùng ký hợp đồng", { counters: { doors_seen: 1 }, custom: `become:${BT}`, flags: ["bgi_coop"], agency: 0.03, rel: 3 }, "Chậm, nhiều cuộc họp, ai cũng có phần", { tier: "sovereign" }),
    C("Bán rẻ cho thương lái quen", { counters: { doors_seen: 1 }, money: -0.05, happy: -2 }, "Mất giá, khỏi lo")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(BT, 1, 1, (c) => T("Thùng hàng không có trong tờ khai", "Chuyến hàng đầu tiên đứng tên bạn. Đêm trước khi qua cửa khẩu, một người lạ nhờ bạn mang thêm một thùng các-tông dán kín, trả bằng tiền lãi cả chuyến. \"Không ai kiểm đâu,\" người đó nói.", [
    C("Từ chối, chỉ chở hàng có giấy", { counters: step(c, BT, { bgi_clean: 1 }), flags: ["bgi_clean_start"], money: -0.03 }, "Lãi mỏng, tờ khai sạch"),
    C("Nhận thùng hàng", { counters: step(c, BT, { bgi_heat: 1 }), flags: ["bgi_gray"], money: 0.15, gamble: { p: 0.8, win: { log: "Không ai kiểm thật. Người lạ hẹn chuyến sau." }, lose: { money: -0.2, flags: ["bgi_record"], log: "Thùng hàng bị giữ lại. Bạn mất cả chuyến hàng và có tên trong một cuốn sổ." } } }, "Tiền gấp đôi, không biết mình chở gì")], 0)),
  beat(BT, 2, 3, (c) => { const gray = f(c, "bgi_gray"); return T("Ông chủ bên kia biên giới", `Một nhà buôn lớn bên kia biên giới đề nghị bạn làm đại lý độc quyền, mỗi tháng hai mươi xe.${gray ? " Ông ta biết chuyện thùng hàng năm ấy, và nói sẽ còn những chuyến \"đặc biệt\" như thế." : " Kèm theo là vài chuyến hàng \"không cần hóa đơn\", ông ta nói như chuyện thường."}`, [
    C("Nhận làm đại lý, không hỏi nhiều", { counters: step(c, BT, { bgi_heat: 2 }), income_mult: 1.7, flags: ["bgi_exclusive"] }, "Giàu nhanh, dính chặt vào hàng không giấy"),
    C("Chỉ nhận hàng có hóa đơn, ít xe hơn", { counters: step(c, BT, { bgi_clean: 1 }), income_mult: 1.15, flags: ["bgi_licensed"], bw: -4 }, "Chậm, nhiều thủ tục, không ai nắm thóp"),
    C("Rủ các thương lái nhỏ lập hội, cùng đàm phán", { counters: step(c, BT), agency: 0.03, gamble: { p: f(c, "bgi_coop") ? 0.65 : 0.4, win: { income_mult: 1.35, flags: ["bgi_guild"], log: "Mười tám thương lái nhỏ góp tên vào một hội. Ông chủ bên kia phải ngồi lại bàn giá." }, lose: { income_mult: 1.05, flags: ["bgi_licensed"], log: "Mỗi người một ý, hội tan sau hai tháng. Bạn buôn tiếp một mình, theo đúng giấy tờ." } } }, "Lựa chọn thứ ba, cần mọi người đồng lòng", { tier: "sovereign" })], 1); }),
  beat(BT, 3, 4, (c) => { const hot = f(c, "bgi_exclusive") || n(c, "bgi_heat") >= 2; const p = role(c, "partner");
    return T(hot ? "Đợt truy quét" : "Cửa khẩu đóng", hot
      ? `Cửa khẩu đóng đột ngột cho một đợt truy quét. Ba xe của bạn bị giữ, trong đó có hàng của ông chủ bên kia, không giấy tờ. Cơ quan điều tra mời bạn lên làm việc, và có người nhắn: "Im lặng thì có người lo."`
      : `Cửa khẩu đóng đột ngột vì ${c.econ_phase === "crisis" ? "căng thẳng giữa hai nước" : "một trận dịch bên kia biên giới"}. Bốn mươi xe hàng tươi của bạn và bạn hàng nằm phơi nắng trên đường. Không ai biết khi nào mở lại.`, hot ? [
      C("Khai hết, làm chứng chống đường dây", { counters: step(c, BT), flags: ["bgi_witness"], money: -0.4, close_doors: ["partner_circle"], ...mem(p, "BETRAYED_PARTNERSHIP", -0.4, "khai ra đường dây với cơ quan điều tra") }, "Được khoan hồng, mất cả giới làm ăn"),
      C("Im lặng, nhận một mình", { counters: step(c, BT), gamble: { p: 0.45, win: { money: 0.5, flags: ["bgi_protected"], log: "Vụ việc lắng xuống. Ông chủ bên kia gửi một khoản \"cảm ơn\". Từ nay bạn nợ ông ta." }, lose: { ...leave(BT), money: -0.8, health: -6, close_doors: ["clean_record"], flags: ["bgi_jailed"], log: "Bạn nhận án tù. Không ai trong đường dây đến thăm." } } }, "Có thể được che chở, có thể ngồi tù"),
      C("Bỏ trốn sang bên kia biên giới", { counters: step(c, BT), ...leave(BT), close_doors: ["return_home"], rel: -6, flags: ["bgi_fled"] }, "Thoát án, không bao giờ về được nhà")] : [
      C("Đổ hàng xuống bán rẻ cho dân quanh vùng", { counters: step(c, BT, { bgi_clean: 1 }), money: -0.4, rel: 4 }, "Lỗ nặng, cả vùng nhớ ơn"),
      C("Thuê kho lạnh, chờ cửa khẩu mở", { counters: step(c, BT), money: -0.15, gamble: { p: 0.45, win: { money: 0.5, log: "Mười ngày sau cửa khẩu mở. Hàng của bạn là hàng tươi duy nhất còn lại, giá gấp đôi." }, lose: { money: -0.5, log: "Cửa khẩu đóng ba tháng. Tiền kho lạnh ăn hết vốn." } } }, "Có thể lãi gấp đôi, có thể mất trắng"),
      C("Bán xe, rời nghề buôn", { counters: step(c, BT), ...leave(BT), money: 0.2, happy: -3 }, "Có vốn làm lại, bỏ con đường đã quen")], 0, hot && p ? { npc: p } : {}); }),
  beat(BT, 4, 5, (c, N) => {
    if (f(c, "bgi_witness")) return T("Phiên tòa của đường dây", `Bạn ngồi ở hàng ghế nhân chứng. Bên kia là những người từng uống rượu với bạn ở chợ cửa khẩu. Án của bạn được giảm, nhưng ${vn(c) ? "cả thị trấn biên" : "cả thị trấn"} biết bạn đã khai.`, [
      C("Ở lại thị trấn, buôn lại từ đầu", { counters: step(c, BT, { bgi_clean: 1 }), income_mult: 0.6, rel: -4, flags: ["bgi_stayed"] }, "Sống giữa những ánh mắt, buôn sạch"),
      C("Chuyển cả nhà đi nơi khác", { counters: step(c, BT), ...leave(BT), money: -0.3, happy: -3 }, "Mất mối làm ăn, mất quê, được yên"),
      C("Kể công khai chuyện đường dây cho báo chí", { counters: step(c, BT), agency: 0.03, gamble: { p: 0.5, win: { rel: 5, flags: ["bgi_spoke_out"], log: "Bài báo khiến người ta nhìn bạn như người dám nói, không chỉ là người đã khai." }, lose: { health: -5, happy: -4, log: "Bạn bị đe dọa suốt một năm. Bài báo bị gỡ sau ba ngày." } } }, "Đổi tiếng xấu thành tiếng nói, có thể bị trả thù", { tier: "sovereign" })], 0);
    if (f(c, "bgi_guild")) return T("Chợ đầu mối của hội", `Hội thương lái của bạn giờ có sáu mươi thành viên và một khu chợ đầu mối sát cửa khẩu.${n(c, "bgi_clean") >= 2 ? " Ngân hàng chủ động mời hội vay vốn." : ""} Một tập đoàn vận tải muốn mua lại cả khu chợ.`, [
      C("Bán chợ cho tập đoàn, chia đều cho hội", { counters: step(c, BT), money: 1.2, flags: ["bgi_market_sold"] }, "Ai cũng có tiền, hội tan"),
      C("Giữ chợ, mở lớp dạy giấy tờ cho người mới", { counters: step(c, BT, { bgi_clean: 1 }), income_mult: 1.2, rel: 4, flags: ["bgi_school"] }, "Chậm giàu, nghề có người nối"),
      C("Ra ứng cử làm chủ tịch hội không thời hạn", { counters: step(c, BT), income_mult: 1.4, rel: -3, flags: ["bgi_boss"] }, "Quyền lớn, bạn hội bắt đầu xì xào")], 1);
    if (f(c, "bgi_exclusive") || f(c, "bgi_protected")) { const o = role(c, "official"); return T("Người giàu nhất thị trấn biên", `Bạn có ba dãy kho, mười hai xe, và căn nhà to nhất thị trấn. ${o ? `${N(o)} đến nhà bạn ăn cơm mỗi tháng.` : "Mấy cán bộ mới đến nhà bạn ăn cơm mỗi tháng."} Tối nay ông chủ bên kia gọi: ông ta cần bạn đứng tên một công ty mới, mọi thứ khác đã có người lo.`, [
      C("Đứng tên, giàu hơn nữa", { counters: step(c, BT, { bgi_heat: 2 }), money: 1.5, secret: { tag: "FORGED_PAPERS", severity: 0.7, fuse_years: [1, 6], note: "đứng tên công ty bình phong cho đường dây bên kia biên giới" } }, "Giàu thêm, bí mật đủ để mất tất cả"),
      C("Từ chối, rút dần khỏi ông ta", { counters: step(c, BT), income_mult: 0.7, health: -3, gamble: { p: 0.6, win: { log: "Ông ta tìm người khác. Hai năm sau, bạn nghe tin đường dây bị bắt, không có tên bạn." }, lose: { money: -0.6, flags: ["bgi_warehouse_fire"], log: "Hai kho hàng của bạn cháy trong một đêm. Không ai thấy gì." } } }, "Mất mối lớn, có thể bị trả giá", { longterm: true }),
      C("Ra đầu thú, nộp lại tài sản bất minh", { counters: step(c, BT), ...leave(BT), money: -1.0, close_doors: ["clean_record"], flags: ["bgi_surrendered"], happy: 4, ...tr(o, -0.3) }, "Mất gần hết, ngủ được", { tier: "awakened" })], 1, o ? { npc: o } : {}); }
    return T("Hợp đồng với chuỗi siêu thị", `${n(c, "bgi_clean") >= 2 ? "Mười năm giấy tờ sạch của bạn" : "Một bộ hồ sơ giấy tờ đủ đầy"} lọt vào mắt một chuỗi siêu thị lớn bên kia biên giới. Họ muốn ký hợp đồng năm năm, giá cố định, nhưng đòi đặt cọc một khoản lớn và phạt nặng nếu giao trễ một ngày.`, [
      C("Ký, vay tiền đặt cọc", { counters: step(c, BT), custom: "borrow:0.8", income_mult: 1.6, flags: ["bgi_big_contract"] }, "Đổi đời nếu giữ được, nợ nếu trễ hạn"),
      C("Ký hợp đồng nhỏ hơn, giao một nửa", { counters: step(c, BT), income_mult: 1.2 }, "An toàn, bỏ một nửa cơ hội"),
      C("Từ chối, giữ những bạn hàng nhỏ quen", { counters: step(c, BT, { bgi_clean: 1 }), happy: 2, rel: 2 }, "Không lớn được, không bị ai ép")], 1);
  }),
  beat(BT, 5, 6, (c, N) => { const k = c.kids_alive > 0 ? role(c, "child") : undefined;
    return T("Cửa khẩu không còn cần người", `Đường cao tốc mới nối thẳng hai nước, hàng đi bằng xe công-te-nơ khai báo qua mạng. Người trẻ đặt hàng bằng điện thoại, không cần ai ngồi ghế phụ.${f(c, "bgi_stayed") ? " Người trong thị trấn đã thôi nhìn bạn bằng ánh mắt cũ." : ""}${k ? ` ${N(k)} hỏi bạn có nên theo nghề không.` : ""}`, [
      C("Dạy người trẻ những gì giấy tờ không ghi", { counters: step(c, BT), flags: ["bgi_mentor"], happy: 3, income_mult: 0.8 }, "Thu nhập giảm, nghề có người hiểu"),
      C(k ? `Bảo ${N(k)} đi học, đừng theo nghề` : "Bán kho, về vườn", { counters: step(c, BT), ...tr(k, 0.1), money: 0.3, health: 3 }, "Yên ổn, khép lại một đời buôn"),
      C("Học lại từ đầu cách buôn qua mạng", { counters: step(c, BT), bw: -6, gamble: { p: 0.4, win: { income_mult: 1.3, log: "Ở tuổi này bạn học dùng phần mềm khai báo. Mối cũ theo bạn sang cách làm mới." }, lose: { happy: -3, log: "Bạn ngồi trước màn hình ba tháng rồi gập máy lại." } } }, "Mệt, có thể sống thêm một đời nghề", { tier: "awakened" })], 0, k ? { npc: k } : {}); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(BT, "bgi_rate", [18, 65], 7, (c) => T("Tỷ giá nhảy", vary("bgir", c.age, ["Đồng tiền bên kia biên giới mất giá một phần năm chỉ trong một tuần. Bạn đang cầm một túi tiền của họ, thu từ ba chuyến hàng.", "Tin đồn đổi tiền lan khắp chợ. Ai cũng đổ xô đi đổi, người đổi tiền ngoài chợ treo giá mỗi giờ một khác."]), [
    C("Đổi ngay qua ngân hàng, chịu lỗ", { money: -0.05, counters: { bgi_clean: 1 } }, "Mất ít, chắc tay"),
    C("Giữ lại, chờ hồi giá", { gamble: { p: 0.45, win: { money: 0.12, log: "Hai tháng sau tỷ giá hồi. Bạn lãi gấp đôi chuyến hàng." }, lose: { money: -0.15, log: "Đồng tiền ấy rơi tiếp. Túi tiền chỉ còn một nửa giá trị." } } }, "Có thể lãi, có thể mất nửa túi")], 0)),
  daily(BT, "bgi_queue", [18, 65], 8, (c) => T("Hàng xe dài mười cây số", vary("bgiq", c.age, ["Xe của bạn đứng thứ ba trăm trong hàng chờ, hàng tươi sẽ hỏng sau hai ngày. Một người đi dọc hàng xe, nói có \"làn ưu tiên\" cho ai biết điều.", "Mùa cao điểm, hàng xe chờ qua cửa khẩu dài đến mức người ta nấu cơm ngay bên đường. Có người gõ cửa xe, mời \"đi trước\" với một cái giá."]), [
    C("Trả tiền để đi trước", { money: -0.04, counters: { bgi_heat: 1 }, secret: { tag: "PAID_BRIBE", severity: 0.25, fuse_years: [2, 8], note: "trả tiền để được qua cửa khẩu trước" } }, "Cứu được hàng, có một bí mật"),
    C("Xếp hàng, chịu hàng hỏng", { money: -0.08, counters: { bgi_clean: 1 } }, "Lỗ chuyến này, tờ khai sạch"),
    C("Rủ cả hàng xe ký đơn chung gửi cửa khẩu", { agency: 0.02, bw: -3, gamble: { p: 0.35, win: { rel: 4, flags: ["leader"], log: "Lá đơn có ba trăm chữ ký. Tuần sau, cửa khẩu mở thêm một làn cho hàng tươi." }, lose: { money: -0.06, log: "Lá đơn được nhận. Hàng của bạn vẫn hỏng." } } }, "Có thể đổi được luật, chắc chắn mất thời gian", { tier: "sovereign" })], 1)),
  daily(BT, "bgi_label", [18, 65], 9, () => T("Nhãn mác mượn", "Bạn hàng bên kia chào một lô hàng gia dụng giá rẻ, dán sẵn nhãn của một hãng nổi tiếng mà hãng đó không hề làm ra. Lãi gấp ba hàng thật.", [
    C("Nhập lô hàng", { money: 0.2, counters: { bgi_heat: 1 }, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [1, 6], note: "buôn hàng mang nhãn giả" } }, "Lãi gấp ba, một ngày nào đó bị lộ"),
    C("Từ chối, nhập hàng không nhãn bán đúng giá", { counters: { bgi_clean: 1 }, money: 0.02 }, "Lãi ít, khách biết mình mua gì")], 1)),
  daily(BT, "bgi_porter", [18, 65], 9, (c) => T("Người khuân vác ngã", `Một người ${vn(c) ? "cửu vạn" : "khuân vác"} làm thuê cho bạn trượt chân trên con dốc, gãy chân. Anh ta không có bảo hiểm, nhà có ba đứa con. Chủ các xe khác nhìn xem bạn làm gì.`, [
    C("Trả viện phí, nuôi nhà anh ta đến khi lành", { money: -0.1, rel: 3, flags: ["bgi_paid_porter"] }, "Mất tiền, có tiếng là chủ tử tế"),
    C("Đưa một khoản nhỏ, thuê người khác", { money: -0.02, rel: -2 }, "Ít tốn, người ta nhớ cách bạn làm"),
    C("Góp quỹ chung với các chủ xe cho người khuân vác", { money: -0.04, agency: 0.02, gamble: { p: 0.5, win: { rel: 4, flags: ["bgi_porter_fund"], log: "Mười chủ xe góp tiền. Quỹ trả viện phí cho cả người bị ngã sau này." }, lose: { log: "Chỉ hai người góp. Bạn trả phần còn lại." } } }, "Chia gánh, phải thuyết phục người khác", { tier: "awakened" })], 0)),
  daily(BT, "bgi_unpaid", [20, 65], 9, (c, N) => { const p = role(c, "partner"); const who = p ? N(p) : "Bạn hàng bên kia"; return T("Ba xe hàng chưa trả tiền", `${who} nhận ba xe hàng của bạn rồi im lặng hai tháng. Điện thoại không ai nghe. Bạn còn nợ người trồng đúng số tiền ấy.`, [
    C("Sang tận nơi đòi", { health: -2, bw: -3, gamble: { p: 0.5, win: { money: 0.2, log: "Bạn ngồi ở cửa hàng của họ ba ngày. Ngày thứ tư họ trả một nửa, hứa nửa còn lại." }, lose: { money: -0.05, log: "Họ đã dọn đi. Cửa hàng treo biển cho thuê." } } }, "Mất sức, có thể lấy lại được"),
    C("Kiện ra trọng tài thương mại", { money: -0.06, counters: { bgi_clean: 1 }, gamble: { p: 0.45, win: { money: 0.25, log: "Phán quyết có lợi cho bạn. Tiền về chậm, nhưng về đủ." }, lose: { log: "Phán quyết có, tiền thì không." } } }, "Tốn phí, chậm, có giấy tờ"),
    C("Xóa nợ một nửa, giữ mối", { money: -0.1, flags: ["bgi_forgave_debt"], ...mem(p, "HELPED_IN_CRISIS", 0.3, "xóa nửa nợ ba xe hàng") }, "Mất tiền, có thể được trả bằng lòng tin", { tier: "awakened" })], 2, p ? { npc: p } : {}); }),
  daily(BT, "bgi_informant", [20, 65], 10, (c, N) => { const o = role(c, "official"); return T("Cán bộ cửa khẩu mới", `${o ? `${N(o)}, cán bộ mới về cửa khẩu,` : "Cán bộ mới về cửa khẩu"} làm việc theo đúng từng dòng luật. Những lối quen của mọi người không còn đi được. Một hôm ${o ? N(o) : "người đó"} gặp riêng bạn: chỉ cần bạn báo ai còn chở hàng không giấy, hàng của bạn sẽ được thông nhanh.`, [
    C("Nhận lời báo tin", { income_mult: 1.15, rel: -3, flags: ["bgi_informant"], ...tr(o, 0.25) }, "Hàng đi nhanh, bạn hàng sẽ ngờ"),
    C("Từ chối, làm giấy tờ đủ như mọi người", { counters: { bgi_clean: 1 }, bw: -3, ...tr(o, 0.05) }, "Chậm hơn, không làm tai mắt cho ai"),
    C("Báo trước cho bạn hàng biết luật đã đổi", { rel: 3, counters: { bgi_heat: 1 }, ...tr(o, -0.2) }, "Bạn hàng cảm ơn, cán bộ để ý bạn")], 1, o ? { npc: o } : {}); }),
  daily(BT, "bgi_toast", [18, 65], 7, (c) => T("Bữa rượu chốt hợp đồng", vary("bgit", c.age, ["Bạn hàng lớn chỉ ký hợp đồng sau bữa rượu kéo dài đến nửa đêm. Ai bỏ về sớm là không thật lòng.", "Mùa hàng mới, bạn hàng bên kia mời sang ăn cưới con gái. Cỗ ba ngày, rượu không ngớt."]), [
    C("Uống đến cùng, chốt hợp đồng", { health: -4, counters: { drink: 2 }, money: 0.08 }, "Có hợp đồng, gan ghi sổ"),
    C("Uống ít, xin về sớm", { health: 1, gamble: { p: 0.5, win: { flags: ["bgi_sober_trust"], log: "Bạn hàng nể bạn tỉnh táo. Hợp đồng vẫn ký, chậm một tuần." }, lose: { money: -0.04, log: "Hợp đồng về tay một người uống giỏi hơn." } } }, "Giữ sức khỏe, có thể mất mối")], 0)),
  daily(BT, "bgi_cash", [18, 65], 10, () => T("Chiếc túi tiền mặt", "Bạn hàng bên kia chỉ trả tiền mặt. Mỗi chuyến về, bạn mang theo một túi tiền bằng cả năm lương của một người công nhân, qua đoạn đường đèo không có sóng điện thoại.", [
    C("Thôi nhận tiền mặt, đòi chuyển khoản", { income_mult: 0.9, counters: { bgi_clean: 1 } }, "Mất vài bạn hàng, hết nỗi lo đường đèo"),
    C("Thuê người đi kèm mỗi chuyến", { money: -0.04, flags: ["bgi_escort"] }, "Tốn thêm, yên tâm hơn"),
    C("Cứ đi như cũ", { gamble: { p: 0.8, win: { log: "Lại một chuyến về đến nhà an toàn." }, lose: { money: -0.3, health: -4, flags: ["bgi_robbed"], log: "Hai người chặn xe ở khúc cua. Bạn đưa túi tiền và được để đi." } } }, "Không tốn gì, may rủi treo trên đường")], 1)),
  daily(BT, "bgi_rumor", [20, 65], 9, () => T("Tin đồn lệnh cấm nhập", "Có tin bên kia sắp cấm nhập một loại nông sản. Nếu tin là thật, giá trong vùng sẽ sập. Nếu bạn để tin lan ra trước, người trồng sẽ bán rẻ cho bạn.", [
    C("Để tin lan ra, gom hàng giá rẻ", { money: 0.25, rel: -4, counters: { bgi_heat: 1 }, flags: ["bgi_spread_rumor"] }, "Lãi lớn, lừa chính người trong vùng"),
    C("Hỏi cho chắc rồi báo cho người trồng", { rel: 3, counters: { bgi_clean: 1 }, bw: -2 }, "Không lãi thêm, được tin cậy"),
    C("Im lặng, đứng ngoài mùa này", { money: -0.03 }, "Không lỗ lớn, không ai nhờ cậy")], 1)),
  daily(BT, "bgi_quit", [28, 65], 99, (c) => T("Chuyến hàng cuối cùng", `${c.broke ? "Ba chuyến liền lỗ, nợ người trồng chưa trả xong." : "Mười năm ngủ trong cabin xe, lưng bạn không thẳng được nữa."} Một người họ hàng mở xưởng sấy nông sản ở quê, cần người quản lý, lương đều, tối về nhà.`, [
    C("Về quê làm xưởng sấy", { ...leave(BT), flags: ["bgi_settled"], health: 3 }, "Yên ổn, hết những chuyến lãi lớn"),
    C("Chạy thêm một mùa nữa", { happy: -1, money: 0.05, counters: { bgi_heat: 1 } }, "Còn cơ hội gỡ, thêm một mùa trên đường")], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(BT, "bgi_family", [22, 65], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || !!role(c, "mother"), (c, N) => {
    const k = c.kids_teen > 0 ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} bị trêu ở trường`, `Bạn bè ở trường gọi ${N(k)} là "con nhà buôn lậu".${f(c, "bgi_exclusive") || f(c, "bgi_gray") ? " Bạn biết lời đó không hoàn toàn sai." : " Giấy tờ của bạn sạch, nhưng thị trấn không phân biệt."} Tối nay ${N(k)} hỏi thẳng bạn làm nghề gì.`, [
      C("Cho con theo một chuyến hàng", { ...tr(k, 0.15), gamble: { p: 0.6, win: { ...tr(k, 0.1), log: `${N(k)} ngồi ghế phụ ba ngày, về kể với cả lớp về những người khuân vác.` }, lose: { flags: ["bgi_child_saw"], log: `${N(k)} thấy cảnh trao tiền cho người lạ ở cửa khẩu, cả đường về không nói gì.` } } }, "Con hiểu nghề, có thể thấy điều không nên thấy"),
      C("Nói thật hết, kể cả những chuyện không đẹp", { ...tr(k, 0.2), happy: -2, flags: ["bgi_told_child"] }, "Đau lòng, con không phải nghe từ người khác", { tier: "awakened" }),
      C("Bảo con kệ người ta nói", { ...tr(k, -0.15) }, "Nhẹ chuyện tối nay, con tự tìm câu trả lời")], 1, { npc: k });
    const who = (c.married ? role(c, "spouse") : undefined) ?? role(c, "mother")!;
    return T("Người chờ ở nhà", `${N(who)} đếm những ngày bạn đi qua cửa khẩu bằng vạch phấn trên cánh cửa. Tháng này có hai mươi hai vạch. ${N(who)} nói không cần nhiều tiền đến thế.`, [
      C("Bớt chuyến, ở nhà nhiều hơn", { income_mult: 0.85, ...tr(who, 0.2) }, "Kiếm ít đi, nhà ấm hơn"),
      C("Hứa thêm hai năm nữa rồi nghỉ", { promise: { to: who, what: "thôi chạy hàng biên giới sau hai năm", years: 2 }, ...tr(who, 0.05) }, "Còn kiếm được, có một lời hứa phải giữ"),
      C("Đưa người nhà lên ở cùng thị trấn biên", { money: -0.1, ...tr(who, 0.1), gamble: { p: 0.5, win: { happy: 3, log: "Cả nhà thuê căn nhà nhỏ sát chợ. Mỗi tối bạn về kịp ăn cơm." }, lose: { happy: -2, log: "Người nhà không quen nơi lạ, ba tháng sau dọn về." } } }, "Ở gần nhau, xa quê")], 0, { npc: who });
  }),
];

export const PACK_MONEY_A: Storylet[] = [...STARTUP, ...REAL_ESTATE, ...RESTAURATEUR, ...BORDER_TRADER];
