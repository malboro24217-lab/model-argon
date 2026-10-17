/**
 * Branch packs — the life forks. Content is partitioned by five path qualities so two lives see different decisions:
 *   temper_*  (curious | bold | kind | tough)      ← the choices at age 3 and 5
 *   origin_*  (poor_rural | poor_urban | middle | rich)
 *   job_*     (farm | market | driver | build | factory | teach | health | office | tech | domestic) ← career choice
 *   spouse_*  (warm | proud | restless | fair)      ← the spouse's hidden archetype
 *   path_*    (migrant | uni | dropout) and life facts (married, kids…)
 * Branch cards score specificity ≥ 3 so they always beat generic micro cards when eligible.
 */
import type { Storylet, FactContext, StoryletView, Choice, CastRole, Effect } from "./types.ts";
import { prov } from "./Causality.ts";

const C = (label: string, effects: Effect, hint?: string, extra: Partial<Choice> = {}): Choice => ({ label, ...(hint !== undefined ? { hint } : {}), effects, ...extra });
const f = (c: FactContext, x: string) => c.flags.has(x);
const role = (c: FactContext, r: CastRole): string | undefined => c.cast[r];
type Build = (c: FactContext, N: (id: string) => string) => StoryletView;

/** Branch micro: gated by a path flag (or a predicate), age window, specificity 3+. */
function B(id: string, gate: string | ((c: FactContext) => boolean), ages: [number, number], build: Build, extra: Partial<Storylet> = {}): Storylet {
  const g = typeof gate === "string" ? (c: FactContext) => f(c, gate) : gate;
  return { id, category: "micro", urgency: 18, cooldownYears: 99, once: true, tension: 2, prerequisites: (c) => c.age >= ages[0] && c.age <= ages[1] && g(c), specificity: () => 4, build, ...extra };
}
/** Follow-up arc card: fires when its flag is set (usually through `later`), urgent. */
function A(id: string, need: string, build: Build, extra: Partial<Storylet> = {}): Storylet {
  return { id, category: "arc", urgency: 84, cooldownYears: 99, once: true, tension: 8, prerequisites: (c) => f(c, need), specificity: () => 6, causes: () => [prov.flag(need)], build, ...extra };
}
const T = (title: string, text: string, choices: Choice[], def = 0, more: Partial<StoryletView> = {}): StoryletView => ({ title, text, choices, def, ...more });
const only = (...xs: string[]) => (c: FactContext) => xs.some((x) => f(c, x));
const temperFlags = ["temper_curious", "temper_bold", "temper_kind", "temper_tough"];

export const BRANCHES: Storylet[] = [
  /* ===================================== TÍNH KHÍ (3 & 5 tuổi) ===================================== */
  { id: "temper_3", category: "childhood", urgency: 100, cooldownYears: 99, once: true, tension: 0, prerequisites: (c) => c.age === 3, specificity: () => 9,
    build: (c) => T("Cơn mưa rào", "Mưa rào đổ xuống, sân nhà ngập đến mắt cá. Người lớn chạy đi cất đồ. Bạn ba tuổi, đứng ở bậc cửa.", [
      C("Ngồi xem đàn kiến bò lên tường tránh nước", { flags: ["temper_curious"], know: 2 }, "Tò mò"),
      C("Lội ùa ra giữa sân", { flags: ["temper_bold"], health: 1 }, "Gan lì"),
      C("Kéo con chó con vào hiên cho khỏi ướt", { flags: ["temper_kind"], rel: 2 }, "Thương người"),
      C("Trượt ngã, tự đứng dậy, không khóc", { flags: ["temper_tough"], health: 2 }, "Bền bỉ")], Math.floor(((c.family_wealth * 9973 + c.gdp * 0.37) % 1) * 4)) },
  { id: "temper_5", category: "childhood", urgency: 100, cooldownYears: 99, once: true, tension: 0, prerequisites: (c) => c.age === 5, specificity: () => 9,
    build: (c) => { const was = temperFlags.find((t) => f(c, t)); const keep = (t: string): Effect => ({ flags: was === t ? ["temper2_" + t.slice(7), "temper_deep"] : ["temper2_" + t.slice(7)] });
      return T("Ngày đầu đi học", "Buổi đầu tiên ở lớp mẫu giáo. Cô giáo bận dỗ một đứa, cả lớp nhốn nháo.", [
        C("Hỏi cô cả trăm câu về cái quả địa cầu", { ...keep("temper_curious"), know: 2 }),
        C("Rủ cả bọn chơi trò mình bày ra", { ...keep("temper_bold"), rel: 1 }),
        C("Ngồi cạnh đứa đang khóc", { ...keep("temper_kind"), rel: 2 }),
        C("Nhớ mẹ, nhưng không khóc", { ...keep("temper_tough"), happy: -1 })], Math.max(0, temperFlags.indexOf(was ?? "temper_curious"))); } },

  /* ---- Tò mò ---- */
  B("cu_radio", "temper_curious", [8, 12], () => T("Cái radio hỏng", "Cái radio cũ của ông nằm trong góc nhà, không ai dùng nữa.", [
    C("Tháo ra xem bên trong", { know: 3, flags: ["tinker"], gamble: { p: 0.4, win: { happy: 4, log: "Bạn lắp lại được, radio kêu rè rè. Cả nhà ngạc nhiên." }, lose: { happy: -1, log: "Bạn không lắp lại được. Ông lắc đầu, nhưng không mắng." } } }),
    C("Để yên, ông sẽ giận", {})])),
  B("cu_fair", (c) => (f(c, "temper_curious") || f(c, "temper2_curious") || f(c, "tinker")) && c.in_school, [12, 16], () => T("Cuộc thi khoa học", "Trường gửi thông báo cuộc thi khoa học cấp huyện. Phải tự bỏ tiền làm mô hình.", [
    C("Đăng ký", { money: -0.02, know: 4, gamble: { p: 0.45, win: { flags: ["science_prize"], happy: 6, log: "Mô hình của bạn đoạt giải. Tên bạn lên bảng tin huyện." }, lose: { happy: -2, log: "Không đoạt giải, nhưng thầy giữ lại mô hình của bạn." } } }),
    C("Thôi, tốn tiền", {})])),
  B("cu_scholar", "science_prize", [15, 18], (c, N) => { const m = role(c, "mother") ?? role(c, "father"); return T("Học bổng trường chuyên", `Trường chuyên ở thành phố cấp học bổng cho bạn. Phải đi xa nhà ba năm.${m ? ` ${N(m)} không nói gì, chỉ hỏi ai sẽ phụ việc nhà.` : ""}`, [
    C("Đi", { flags: ["scholarship", "left_home"], know: 8, rel: -4, custom: "scholar", agency: 0.03 }, "Đường học mở rộng, nhà vắng một người"),
    C("Ở lại phụ gia đình", { rel: 4, ...(m ? { trust: { npc: m, delta: 0.15 } } : {}), flags: ["declined_scholarship"] })]); }),
  B("cu_question", (c) => f(c, "temper_curious") && c.has_job, [30, 60], () => T("Một câu hỏi chưa ai trả lời", "Có một cách làm việc tốt hơn mà bạn nghĩ ra từ lâu. Thử thì tốn tiền và thời gian.", [
    C("Làm thử ngoài giờ", { money: -0.15, health: -2, later: { years: 3, storylet: "cu_invent" }, flags: ["invention"] }),
    C("Để đó", { happy: -1 })])),
  A("cu_invent", "invention", () => T("Sau ba năm mày mò", "Thứ bạn làm ngoài giờ cuối cùng cũng chạy được.", [
    C("Bán ý tưởng cho công ty lớn", { money: 0.8, unflags: ["invention"], log: "Họ mua với giá một năm lương." }),
    C("Tự sản xuất", { unflags: ["invention"], gamble: { p: 0.35, win: { income_mult: 1.6, flags: ["own_business"], log: "Xưởng nhỏ của bạn có đơn hàng đều." }, lose: { money: -0.5, log: "Không ai mua. Bạn bán lại máy móc." } } }, "Rủi hơn, có thể đổi đời")])),

  /* ---- Gan lì ---- */
  B("bo_gang", "temper_bold", [8, 12], () => T("Thủ lĩnh xóm", "Đám trẻ trong xóm nghe bạn. Hôm nay cả bọn chờ bạn bày trò.", [
    C("Dẫn cả bọn đi hái trộm ổi nhà ông Tư", { happy: 3, rel: 2, trait: { bold: 1 }, gamble: { p: 0.6, win: {}, lose: { rel: -3, log: "Ông Tư bắt được, dắt cả bọn về từng nhà." } } }),
    C("Lập đội bóng, đá với xóm bên", { happy: 3, counters: { exercise: 1 }, flags: ["leader"] })])),
  B("bo_fight", "temper_bold", [14, 18], (c, N) => { const b = role(c, "bully"); return T("Đám làng bên", `Đám thanh niên làng bên chặn đường bạn bè bạn${b ? `, ${N(b)} đi cùng bọn chúng` : ""}.`, [
    C("Xông vào", { health: -5, trait: { bold: 2 }, flags: ["brawler"], ...(b ? { memory: { npc: b, tag: "HUMILIATED_ME", weight: -0.2, note: "trận đánh ở bờ đê" } } : {}) }),
    C("Đứng ra nói chuyện", { trait: { fair: 1 }, gamble: { p: 0.5, win: { rel: 4, flags: ["leader"], log: "Hai bên giải tán. Người lớn bắt đầu để ý bạn." }, lose: { health: -3, log: "Nói không xong, vẫn ăn đòn." } } })]); }),
  B("bo_own", (c) => (f(c, "temper_bold") || f(c, "temper2_bold")) && c.has_job && !f(c, "own_business"), [22, 40], () => T("Tự làm chủ", "Bạn chán làm công. Một quầy hàng nhỏ ở chợ đang sang nhượng.", [
    C("Vay tiền, ra làm riêng", { custom: "borrow:0.6|job_switch:market", flags: ["own_business"], agency: 0.03 }, "Nợ ngay, có thể giàu"),
    C("Ở lại làm công", { happy: -1 })])),
  B("bo_second", "own_business", [26, 55], () => T("Cửa hàng thứ hai", "Việc buôn bán đang lên. Ngân hàng sẵn sàng cho vay mở thêm một điểm.", [
    C("Mở rộng", { custom: "borrow:1", income_mult: 1.35, flags: ["expanded"], later: { years: 3, storylet: "bo_pricewar" } }, "Gấp đôi rủi ro"),
    C("Giữ một cửa hàng cho chắc", { bw: 4 })])),
  A("bo_pricewar", "expanded", (c, N) => { const r = role(c, "rival"); return T("Đối thủ hạ giá", `${r ? N(r) : "Một đối thủ"} mở cửa hàng ngay đối diện và bán dưới giá vốn.`, [
    C("Hạ giá theo", { unflags: ["expanded"], gamble: { p: 0.45, win: { income_mult: 1.1, log: "Đối thủ đóng cửa trước." }, lose: { custom: "borrow:0.6", income_mult: 0.8, log: "Cả hai cùng lỗ. Bạn trụ được, nhưng ngập nợ." } } }),
    C("Giữ giá, chăm khách quen", { unflags: ["expanded"], income_mult: 0.9, rel: 3 }),
    C("Gặp đối thủ, chia khu vực", { unflags: ["expanded"], gamble: { p: 0.6, win: { income_mult: 1.05, log: "Hai bên bắt tay. Mỗi người giữ một đầu phố." }, lose: { log: "Họ không gặp." } } }, "Lựa chọn thứ ba: biến trò chơi gà thành thỏa thuận", { tier: "sovereign" })], 1, r ? { npc: r } : {}); }),

  /* ---- Thương người ---- */
  B("ki_dog", "temper_kind", [7, 12], () => T("Con chó bị thương", "Một con chó hoang nằm bên đường, gãy chân.", [
    C("Bế về chăm", { happy: 2, rel: 1, counters: { kind: 1 }, flags: ["animal_friend"] }), C("Đi qua", { happy: -2 })])),
  B("ki_oldlady", (c) => f(c, "temper_kind") && !!role(c, "neighbor"), [12, 17], (c, N) => { const nb = role(c, "neighbor")!; return T(`${N(nb)} ở một mình`, `${N(nb)} già đi nhanh. Con cái đi làm xa cả.`, [
    C("Chiều nào cũng ghé qua", { counters: { kind: 2 }, memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "những buổi chiều ghé qua" }, flags: ["carer"] }), C("Thỉnh thoảng", { counters: { kind: 1 } })], 0, { npc: nb }); }),
  B("ki_clinic", (c) => f(c, "temper_kind") || f(c, "temper2_kind") || f(c, "carer"), [18, 30], () => T("Trạm xá thiếu người", "Trạm xá xã cần người tình nguyện cuối tuần.", [
    C("Đi", { counters: { kind: 2 }, health: -1, know: 2, flags: ["clinic_vol"] }), C("Bận việc nhà", {})])),
  B("ki_child", (c) => (f(c, "temper_kind") || f(c, "carer")) && c.has_job, [30, 60], () => T("Đứa trẻ không nhà", "Có một đứa trẻ mồ côi ngủ ở mái hiên chợ. Người ta đi qua, không ai dừng.", [
    C("Đỡ đầu cho nó đi học", { money: -0.1, counters: { kind: 2 }, flags: ["sponsor"], later: { years: 15, storylet: "ki_return" } }, "Tốn tiền mười năm"),
    C("Cho ít tiền", { money: -0.01 }), C("Đi qua", { happy: -2 })])),
  A("ki_return", "sponsor", () => T("Đứa trẻ năm xưa", "Một người lạ gõ cửa, tay cầm giỏ quà. Bạn mất một lúc mới nhận ra: đứa bé ngủ ở mái hiên chợ năm nào.", [
    C("Mời vào nhà", { happy: 10, rel: 6, unflags: ["sponsor"], log: "Nó giờ là y tá. Nó nói bạn là lý do nó còn sống." })], 0), { tension: -8 }),

  /* ---- Bền bỉ ---- */
  B("to_water", "temper_tough", [8, 12], () => T("Gánh nước", "Giếng nhà cạn. Mẹ phải gánh nước từ đầu làng.", [
    C("Gánh thay mẹ", { health: 2, counters: { exercise: 1 }, rel: 2 }), C("Để mẹ gánh", {})])),
  B("to_team", (c) => f(c, "temper_tough") || f(c, "temper2_tough") || f(c, "leader"), [13, 17], () => T("Đội tuyển", "Thầy thể dục chọn người vào đội điền kinh của trường.", [
    C("Tập mỗi sáng", { counters: { exercise: 3 }, know: -1, gamble: { p: 0.35, win: { flags: ["athlete"], log: "Bạn được gọi lên đội tuyển tỉnh." }, lose: { log: "Bạn không được chọn, nhưng chân khỏe hẳn." } } }),
    C("Lo học", { know: 2 })])),
  B("to_pro", "athlete", [16, 22], () => T("Đội tỉnh", "Đội tỉnh muốn giữ bạn lại tập trung. Lương ít, tương lai không chắc.", [
    C("Theo nghiệp thể thao", { flags: ["pro_athlete"], counters: { exercise: 3 }, income_mult: 0.8, later: { years: 10, storylet: "to_retire" } }), C("Về đi làm", {})])),
  A("to_retire", "pro_athlete", () => T("Giải nghệ", "Đầu gối không còn như xưa. Ba mươi tuổi, bạn rời đội.", [
    C("Làm huấn luyện viên", { income_mult: 1.1, unflags: ["pro_athlete"], happy: 2 }), C("Mở phòng tập", { custom: "borrow:0.4", flags: ["own_business"], unflags: ["pro_athlete"] })])),
  B("to_grit", (c) => f(c, "temper_tough") && c.has_job, [25, 55], () => T("Gồng", "Lưng bạn đau đã ba tháng. Nghỉ thì mất việc, làm tiếp thì không biết đến bao giờ.", [
    C("Cắn răng làm tiếp", { health: -8, money: 0.05 }), C("Nghỉ chữa", { money: -0.1, health: 6 })], 0), { cooldownYears: 15, once: false }),

  /* ===================================== XUẤT THÂN ===================================== */
  B("or_hunger", "origin_poor_rural", [6, 12], (c, N) => { const m = role(c, "mother"); return T("Mùa giáp hạt", `Gạo trong chum sắp hết.${m ? ` ${N(m)} bớt phần cơm của mình.` : ""}`, [
    C("Đi mò cua bắt ốc ăn thêm", { health: 1, happy: 1, counters: { exercise: 1 } }), C("Nhường phần cho em", { health: -2, counters: { kind: 1 } })]); }),
  B("or_buffalo", "origin_poor_rural", [8, 13], () => T("Con trâu", "Nhà cần người chăn trâu cả ngày. Đi học thì không ai chăn.", [
    C("Nghỉ học chăn trâu", { know: -4, flags: ["early_work"], money: 0.03 }), C("Xin đi học tiếp", { know: 2, rel: -1 })])),
  B("or_city14", (c) => f(c, "origin_poor_rural") && !c.in_school, [13, 17], () => T("Lên thành phố", "Một người trong làng rủ lên thành phố làm thuê. Bao ăn ở.", [
    C("Đi", { flags: ["path_city", "left_home"], money: 0.05, rel: -3, happy: -2 }), C("Ở lại làng", {})])),
  B("or_eviction", "origin_poor_urban", [8, 16], () => T("Giải tỏa", "Khu nhà trọ của gia đình bị giải tỏa. Tiền đền bù chẳng đủ thuê chỗ khác.", [
    C("Theo bố mẹ ra ngoại ô", { rel: -3, happy: -3 }), C("Ở lại với bà ngoại trong thành phố", { rel: 1, flags: ["raised_by_grandma"] })])),
  B("or_lottery_kid", "origin_poor_urban", [9, 14], () => T("Xấp vé số", "Sau giờ học, mẹ đưa bạn xấp vé số đi bán quanh chợ.", [
    C("Đi bán", { money: 0.02, know: -1, counters: { save: 1 } }), C("Trốn đi chơi", { happy: 2, rel: -1 })])),
  B("or_alley", "origin_poor_urban", [14, 19], () => T("Đầu hẻm", "Đám thanh niên đầu hẻm rủ bạn chạy việc cho một 'anh lớn'. Tiền nhiều hơn mẹ làm cả tháng.", [
    C("Nhận", { money: 0.1, flags: ["gang"], counters: { honest: -2 }, later: { years: 6, storylet: "or_bigbro" } }, "Tiền dễ, khó rút ra"), C("Tránh xa", { happy: -1 })])),
  A("or_bigbro", "gang", () => T("Anh lớn gọi", "Anh lớn gọi bạn lại. Lần này là một việc lớn, và anh không hỏi ý.", [
    C("Làm", { unflags: ["gang"], money: 0.4, secret: { tag: "FORGED_PAPERS", severity: 0.8, fuse_years: [4, 15], note: "việc cho anh lớn" } }),
    C("Bỏ trốn khỏi thành phố", { unflags: ["gang"], money: -0.2, flags: ["left_home", "path_city"], happy: -5, log: "Bạn đi trong đêm, không kịp chào ai." })])),
  B("or_tutor", "origin_middle", [9, 15], () => T("Học thêm", "Bố mẹ đăng ký cho bạn ba lớp học thêm buổi tối.", [
    C("Đi đủ", { know: 4, happy: -3, counters: { read: 1 } }), C("Năn nỉ bỏ bớt một lớp", { happy: 2, know: 1 })])),
  B("or_divorce", "origin_middle", [8, 15], (c, N) => { const m = role(c, "mother"), fa = role(c, "father"); return T("Bố mẹ ly thân", "Bố mẹ quyết định không sống chung nữa. Bạn được hỏi muốn ở với ai.", [
    C(`Ở với ${m ? N(m) : "mẹ"}`, { ...(m ? { trust: { npc: m, delta: 0.15 } } : {}), ...(fa ? { trust: { npc: fa, delta: -0.15 } } : {}), happy: -5 }),
    C(`Ở với ${fa ? N(fa) : "bố"}`, { ...(fa ? { trust: { npc: fa, delta: 0.15 } } : {}), ...(m ? { trust: { npc: m, delta: -0.15 } } : {}), happy: -5 })]); }, { prerequisites: (c) => c.age >= 8 && c.age <= 15 && f(c, "origin_middle") && !!role(c, "mother") && !!role(c, "father") }),
  B("or_pc", "origin_middle", [10, 15], () => T("Cái máy tính đầu tiên", "Nhà mua máy tính. Bạn bè đứa nào cũng mê trò chơi trên mạng.", [
    C("Chơi game", { happy: 4, know: -1 }), C("Mày mò lập trình", { know: 4, flags: ["coder"], counters: { read: 1 } })])),
  B("or_abroad", "origin_rich", [12, 17], () => T("Trại hè nước ngoài", "Bố mẹ gửi bạn đi trại hè ở nước ngoài một tháng.", [
    C("Đi", { know: 3, happy: 3, flags: ["seen_world"] }), C("Ở nhà với bạn bè", { rel: 2 })])),
  B("or_driverkid", "origin_rich", [8, 13], () => T("Con bác tài", "Con trai bác tài xế nhà bạn trạc tuổi bạn, thường ngồi chờ ngoài cổng.", [
    C("Rủ nó vào chơi", { rel: 2, counters: { kind: 1 }, flags: ["cross_class_friend"] }), C("Mặc kệ", {})])),
  B("or_heir", "origin_rich", [22, 32], (c, N) => { const fa = role(c, "father"); return T("Công ty của gia đình", `${fa ? N(fa) : "Bố"} muốn bạn về tiếp quản công ty.`, [
    C("Về tiếp quản", { flags: ["heir"], income_mult: 1.4, agency: -0.02, custom: "job_switch:office", later: { years: 6, storylet: "or_heir_crisis" } }),
    C("Tự đi con đường riêng", { agency: 0.04, ...(fa ? { trust: { npc: fa, delta: -0.2 } } : {}), close_doors: ["inheritance"] }, "Tự do, mất phần thừa kế")]); }),
  A("or_heir_crisis", "heir", () => T("Công ty lỗ", "Công ty gia đình lỗ ba năm liền. Các chú bác trong hội đồng nhìn bạn.", [
    C("Cắt giảm một nửa nhân viên", { unflags: ["heir"], income_mult: 1.1, rel: -6, trait: { coop: -1 } }),
    C("Bán bớt tài sản giữ người", { unflags: ["heir"], money: -0.5, rel: 4 }),
    C("Chuyển đổi sang hướng mới", { unflags: ["heir"], gamble: { p: 0.45, win: { income_mult: 1.4, log: "Hướng mới thành công. Các chú bác im lặng." }, lose: { money: -1, log: "Thất bại. Bạn mất cả công ty lẫn mặt mũi." } } }, "Lựa chọn thứ ba", { tier: "sovereign" })])),

  /* ===================================== NGHỀ: NÔNG ===================================== */
  B("fa_crop", "job_farm", [18, 50], () => T("Giống mới", "Cán bộ khuyến nông giới thiệu chuyển ruộng lúa sang trồng cây ăn trái. Phải vay vốn, ba năm mới có thu.", [
    C("Chuyển đổi", { custom: "borrow:0.8", flags: ["orchard"], later: { years: 3, storylet: "fa_trader" } }, "Ba năm đói, sau đó có thể khá"), C("Giữ lúa", {})])),
  A("fa_trader", "orchard", () => T("Thương lái ép giá", "Năm đầu thu hoạch. Thương lái trả giá bằng nửa năm ngoái, vì cả vùng đều chuyển đổi.", [
    C("Bán rẻ cho xong", { unflags: ["orchard"], money: 0.3 }), C("Để dành chờ giá", { unflags: ["orchard"], gamble: { p: 0.4, win: { money: 0.9, log: "Giá lên. Bạn thắng lớn." }, lose: { money: 0.05, log: "Trái chín rụng, giá không lên." } } }),
    C("Rủ cả xóm lập hợp tác xã", { unflags: ["orchard"], gamble: { p: 0.6, win: { money: 0.7, rel: 6, flags: ["coop_group"], log: "Cả xóm cùng bán, thương lái phải nâng giá." }, lose: { money: 0.3, log: "Mỗi nhà một ý, hợp tác xã tan." } } }, "Lựa chọn thứ ba", { tier: "sovereign" })], 1)),
  B("fa_developer", "job_farm", [25, 65], () => T("Dự án về làng", "Một công ty bất động sản hỏi mua ruộng nhà bạn để làm khu đô thị. Giá gấp mười năm thu hoạch.", [
    C("Bán", { money: 2.5, flags: ["land_sold"], custom: "job_switch:market", close_doors: ["return_home"], later: { years: 3, storylet: "fa_money" } }, "Tiền lớn, mất đất"),
    C("Giữ đất", { rel: 2 })])),
  A("fa_money", "land_sold", () => T("Tiền đền bù", "Ba năm sau khi bán đất, tiền vẫn còn gần hết. Ai trong họ cũng có việc cần vay.", [
    C("Xây nhà to", { unflags: ["land_sold"], money: -1.2, happy: 6, rel: 2 }), C("Cho họ hàng vay", { unflags: ["land_sold"], money: -0.8, rel: 6, gamble: { p: 0.4, win: { money: 0.8 }, lose: { log: "Tiền cho vay không về." } } }),
    C("Gửi ngân hàng, sống bằng lãi", { unflags: ["land_sold"], bw: 6, income_mult: 1.15 })])),
  B("fa_drought", "job_farm", [20, 70], () => T("Hạn mặn", "Nước mặn vào sâu. Ruộng nhà nứt nẻ.", [
    C("Vay tiền mua máy bơm", { custom: "borrow:0.3", income_mult: 0.95 }), C("Bỏ hoang một vụ, đi làm thuê", { money: 0.05, health: -2, income_mult: 0.9 }), C("Chuyển sang nuôi tôm", { custom: "borrow:0.4", gamble: { p: 0.5, win: { income_mult: 1.3 }, lose: { income_mult: 0.8, log: "Tôm chết hàng loạt." } } })])),

  /* ===================================== NGHỀ: BUÔN BÁN ===================================== */
  B("mk_credit", "job_market", [18, 60], () => T("Bán chịu", "Khách quen xin ghi sổ, cuối tháng trả.", [
    C("Cho ghi sổ", { rel: 4, flags: ["credit_book"], later: { years: 2, storylet: "mk_ledger" } }), C("Chỉ bán tiền mặt", { rel: -2 })])),
  A("mk_ledger", "credit_book", () => T("Cuốn sổ nợ", "Cuốn sổ nợ dày lên. Có người nợ cả năm không trả.", [
    C("Đến tận nhà đòi", { unflags: ["credit_book"], money: 0.15, rel: -5 }), C("Xóa nợ cho nhà nghèo", { unflags: ["credit_book"], money: -0.1, rel: 8, counters: { kind: 2 } }), C("Bán sổ nợ cho người đi đòi thuê", { unflags: ["credit_book"], money: 0.08, rel: -8, counters: { honest: -1 } })])),
  B("mk_fake", "job_market", [20, 60], () => T("Hàng nhái", "Mối hàng mới chào hàng nhái giống y hàng thật, lãi gấp ba.", [
    C("Nhập về bán", { income_mult: 1.2, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [3, 10], note: "bán hàng nhái cho khách quen" } }), C("Không", { counters: { honest: 1 } })])),
  B("mk_kiosk", "job_market", [24, 55], () => T("Ki-ốt mặt tiền", "Có một ki-ốt mặt tiền chợ sang lại, gấp đôi chỗ bạn đang ngồi.", [
    C("Vay tiền thuê", { custom: "borrow:0.5", income_mult: 1.25 }), C("Ngồi chỗ cũ", {})])),
  B("mk_online", "job_market", [20, 50], (c) => T("Bán online", c.poor_country ? "Con nhà bên bày bạn livestream bán hàng trên điện thoại." : "Khách quen dần chuyển sang mua trên mạng.", [
    C("Học bán online", { know: 3, gamble: { p: 0.55, win: { income_mult: 1.3, log: "Đơn về đều đặn." }, lose: { money: -0.05, log: "Không ai xem livestream của bạn." } } }), C("Bán kiểu cũ", { income_mult: 0.95 })])),

  /* ===================================== NGHỀ: LÁI XE ===================================== */
  B("dr_night", "job_driver", [18, 60], () => T("Chạy đêm", "Chạy đêm được gấp rưỡi, nhưng đường vắng và người say nhiều.", [
    C("Chạy đêm", { money: 0.08, health: -3, bw: -3 }), C("Chỉ chạy ngày", {})])),
  B("dr_crash", "job_driver", [18, 65], () => T("Va quệt", "Xe bạn quệt vào một người đi xe đạp. Người ấy ngã, trầy xước. Trời tối, không ai thấy.", [
    C("Dừng lại, đưa đi viện", { money: -0.08, counters: { honest: 1, kind: 1 } }), C("Thỏa thuận riêng", { money: -0.04 }),
    C("Chạy luôn", { secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 12], note: "vụ va quệt bỏ chạy" }, happy: -3 })])),
  B("dr_own", "job_driver", [22, 50], () => T("Xe của mình", "Lái thuê mãi cũng chán. Có chiếc xe cũ người ta bán trả góp.", [
    C("Mua", { custom: "borrow:0.7", flags: ["own_vehicle"], income_mult: 1.2 }), C("Lái thuê tiếp", {})])),
  B("dr_app", (c) => f(c, "job_driver") && !c.poor_country, [20, 60], () => T("Ứng dụng gọi xe", "Ứng dụng gọi xe vào thành phố. Khách quen chuyển hết sang đặt trên điện thoại.", [
    C("Chạy ứng dụng", { income_mult: 1.1, bw: -3, health: -1 }), C("Giữ khách quen", { income_mult: 0.85, rel: 2 })])),

  /* ===================================== NGHỀ: XÂY DỰNG / THỢ ===================================== */
  B("bu_scaffold", "job_build", [18, 60], () => T("Giàn giáo", "Giàn giáo tầng năm lỏng chốt. Cai bảo cứ trèo, sắp xong rồi.", [
    C("Trèo", { gamble: { p: 0.88, win: { money: 0.02 }, lose: { health: -25, log: "Bạn ngã. Hai tháng nằm viện." } } }), C("Không trèo đến khi sửa", { rel: -2, trait: { fair: 1 } })])),
  B("bu_unpaid", "job_build", [18, 60], () => T("Cai thầu nợ lương", "Cai thầu nợ ba tháng lương cả đội rồi biến mất.", [
    C("Cùng cả đội lên phường", { gamble: { p: 0.5, win: { money: 0.2, rel: 4 }, lose: { money: -0.05 } } }), C("Bỏ, tìm công trình khác", { money: -0.2 })])),
  B("bu_foreman", "job_build", [26, 50], () => T("Lên làm cai", "Chủ thầu muốn bạn đứng ra làm cai, quản hai chục thợ.", [
    C("Nhận", { income_mult: 1.3, flags: ["foreman"], later: { years: 2, storylet: "bu_skim" } }), C("Làm thợ cho nhẹ đầu", {})])),
  A("bu_skim", "foreman", () => T("Bớt xi măng", "Chủ thầu ra hiệu: bớt mỗi mẻ một bao, cả hai cùng có lời. Công trình là trường học.", [
    C("Bớt", { unflags: ["foreman"], money: 0.3, secret: { tag: "FORGED_PAPERS", severity: 0.9, fuse_years: [5, 20], note: "bớt xi măng ở công trình trường học" } }),
    C("Không", { unflags: ["foreman"], income_mult: 0.9, counters: { honest: 2 }, log: "Chủ thầu không gọi bạn công trình sau." })], 1)),

  /* ===================================== NGHỀ: NHÀ MÁY ===================================== */
  B("fc_ot", "job_factory", [18, 55], () => T("Tăng ca bắt buộc", "Xưởng nhận đơn gấp. Ai không tăng ca thì tháng sau khỏi đi làm.", [
    C("Tăng ca", { money: 0.06, health: -3, bw: -4 }), C("Từ chối", { gamble: { p: 0.5, win: {}, lose: { custom: "job_lose" } } })])),
  B("fc_lead", "job_factory", [24, 50], () => T("Tổ trưởng", "Quản đốc đề bạt bạn làm tổ trưởng.", [
    C("Nhận", { income_mult: 1.2, flags: ["line_lead"], later: { years: 2, storylet: "fc_push" } }), C("Ở lại làm công nhân", { rel: 2 })])),
  A("fc_push", "line_lead", () => T("Ép năng suất", "Công ty yêu cầu tăng năng suất 20% mà không thêm người. Tổ của bạn nhìn bạn.", [
    C("Ép tổ làm", { unflags: ["line_lead"], income_mult: 1.1, rel: -6 }), C("Đứng về phía tổ", { unflags: ["line_lead"], rel: 6, gamble: { p: 0.5, win: {}, lose: { income_mult: 0.85, log: "Bạn bị giáng xuống." } } })])),
  B("fc_export", "job_factory", [20, 38], () => T("Xuất khẩu lao động", "Công ty môi giới tuyển người sang Nhật làm ba năm. Phí môi giới bằng hai năm lương.", [
    C("Vay tiền đi", { custom: "borrow:1.5", flags: ["path_migrant", "left_home"], income_mult: 2.2, rel: -6, later: { years: 3, storylet: "mg_return" } }, "Đổi đời hoặc ngập nợ"), C("Ở lại", {})])),

  /* ===================================== NGHỀ: DẠY HỌC ===================================== */
  B("te_tutor", "job_teach", [22, 60], () => T("Dạy thêm", "Lương giáo viên không đủ sống. Đồng nghiệp ai cũng mở lớp dạy thêm, học sinh trong lớp buộc phải đi.", [
    C("Mở lớp, ép học sinh đi", { money: 0.15, counters: { honest: -1 } }), C("Mở lớp, ai muốn thì đi", { money: 0.06 }), C("Không dạy thêm", { money: -0.02, counters: { honest: 1 } })])),
  B("te_envelope", "job_teach", [24, 60], () => T("Phong bì", "Một phụ huynh để lại phong bì trên bàn, kèm lời nhờ 'quan tâm' điểm thi của con.", [
    C("Nhận", { money: 0.05, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [3, 12], note: "phong bì sửa điểm" } }), C("Trả lại", { counters: { honest: 1 }, rel: -1 })])),
  B("te_problem", "job_teach", [24, 55], () => T("Học trò cá biệt", "Có một đứa trong lớp hay trốn học, đánh nhau. Hiệu trưởng muốn đuổi.", [
    C("Xin giữ lại, kèm riêng", { bw: -4, counters: { kind: 2 }, flags: ["saved_student"], later: { years: 15, storylet: "te_return" } }), C("Để nhà trường quyết", {})])),
  A("te_return", "saved_student", () => T("Học trò cũ", "Một người đàn ông lịch sự xin gặp bạn. Đứa học trò cá biệt năm nào, giờ làm chủ một xưởng nhỏ.", [
    C("Ngồi nói chuyện", { happy: 8, rel: 4, unflags: ["saved_student"], log: "Nó nói nhờ năm ấy bạn không bỏ nó." })]), { tension: -8 }),

  /* ===================================== NGHỀ: Y TẾ ===================================== */
  B("he_shift", "job_health", [22, 60], () => T("Trực liên tục", "Bệnh viện thiếu người. Bạn đã trực ba đêm liền.", [
    C("Trực tiếp", { health: -4, bw: -5, rel: 2 }), C("Từ chối ca thứ tư", { rel: -2 })])),
  B("he_gift", "job_health", [22, 60], () => T("Phong bì của người nhà", "Người nhà bệnh nhân dúi vào túi bạn một phong bì, xin 'chăm sóc kỹ hơn'.", [
    C("Nhận", { money: 0.04, counters: { honest: -1 } }), C("Trả lại", { counters: { honest: 1 } })])),
  B("he_case", "job_health", [28, 60], () => T("Ca khó", "Một ca cấp cứu vượt quá khả năng của tuyến này. Chuyển viện thì bệnh nhân có thể không qua.", [
    C("Làm tại chỗ", { trait: { bold: 2 }, gamble: { p: 0.55, win: { happy: 8, rel: 5, log: "Bệnh nhân qua khỏi." }, lose: { happy: -10, log: "Bệnh nhân không qua khỏi. Người nhà làm đơn kiện." } } }), C("Chuyển viện", { happy: -2 })])),
  B("he_abroad", "job_health", [24, 40], () => T("Điều dưỡng sang Đức", "Có chương trình đưa điều dưỡng sang Đức. Học tiếng hai năm, lương gấp năm.", [
    C("Đăng ký", { know: 5, flags: ["path_migrant", "left_home"], income_mult: 2.5, rel: -6, later: { years: 4, storylet: "mg_return" } }), C("Ở lại", {})])),

  /* ===================================== NGHỀ: VĂN PHÒNG ===================================== */
  B("of_politics", "job_office", [24, 55], () => T("Hai phe", "Phòng bạn chia hai phe theo hai phó giám đốc. Ai cũng phải đứng về một bên.", [
    C("Theo phe mạnh", { gamble: { p: 0.6, win: { income_mult: 1.15 }, lose: { income_mult: 0.9, log: "Phe bạn thua. Bạn bị điều sang chi nhánh xa." } } }), C("Đứng ngoài", { income_mult: 0.97 })])),
  B("of_fudge", "job_office", [24, 60], () => T("Sửa số liệu", "Sếp nhờ bạn 'làm đẹp' báo cáo quý trước khi gửi lên tổng công ty.", [
    C("Sửa", { income_mult: 1.05, secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [3, 12], note: "sửa báo cáo quý" } }), C("Từ chối", { counters: { honest: 2 }, income_mult: 0.95 })])),
  B("of_layoff", "job_office", [28, 60], () => T("Cắt giảm", "Công ty cắt giảm một nửa phòng. Sếp hỏi riêng bạn nên giữ ai.", [
    C("Giữ người giỏi nhất", { trait: { fair: 1 } }), C("Giữ người thân với mình", { rel: 2, counters: { honest: -1 } }), C("Đề nghị cả phòng giảm giờ, không ai bị đuổi", { rel: 6, income_mult: 0.92 }, "Lựa chọn thứ ba", { tier: "sovereign" })])),
  B("of_startup", "job_office", [26, 45], () => T("Bỏ việc", "Một người bạn rủ bạn bỏ việc văn phòng làm cùng một dự án riêng.", [
    C("Bỏ việc", { flags: ["own_business"], income_mult: 0.6, agency: 0.04, gamble: { p: 0.35, win: { income_mult: 2.2, log: "Dự án sống được, rồi lớn dần." }, lose: { money: -0.4, log: "Dự án chết sau hai năm. Bạn đi xin việc lại." } } }), C("Ở lại", {})])),

  /* ===================================== NGHỀ: CÔNG NGHỆ ===================================== */
  B("tc_remote", "job_tech", [22, 50], () => T("Khách nước ngoài", "Một khách hàng nước ngoài muốn thuê bạn làm từ xa, trả bằng đô.", [
    C("Nhận, làm cả đêm", { income_mult: 1.4, health: -3, bw: -3 }), C("Không", {})])),
  B("tc_equity", "job_tech", [24, 40], () => T("Công ty khởi nghiệp", "Một công ty khởi nghiệp mời bạn về, trả nửa lương và một phần cổ phần.", [
    C("Đi", { income_mult: 0.6, flags: ["startup"], later: { years: 3, storylet: "tc_exit" } }, "Có thể đổi đời"), C("Ở lại chỗ ổn định", {})])),
  A("tc_exit", "startup", () => T("Gọi vốn hoặc chết", "Công ty hết tiền. Một quỹ đầu tư đồng ý rót vốn nếu mọi người làm gấp đôi trong một năm.", [
    C("Ở lại chiến", { unflags: ["startup"], health: -6, gamble: { p: 0.3, win: { money: 3, income_mult: 2, log: "Công ty được mua lại. Cổ phần của bạn thành một gia tài." }, lose: { money: -0.3, log: "Công ty đóng cửa." } } }), C("Rời đi", { unflags: ["startup"], income_mult: 1.6 })])),
  B("tc_ai", "job_tech", [30, 60], () => T("Máy làm thay", "Công cụ mới làm được nửa việc của bạn. Công ty bắt đầu nói chuyện tinh giản.", [
    C("Học lại từ đầu", { know: 6, bw: -5, money: -0.05 }), C("Chờ xem", { gamble: { p: 0.5, win: {}, lose: { custom: "job_lose" } } })])),

  /* ===================================== NGHỀ: GIÚP VIỆC ===================================== */
  B("do_accused", "job_domestic", [16, 60], () => T("Bị nghi", "Nhà chủ mất chiếc nhẫn. Bà chủ nhìn bạn.", [
    C("Để họ khám đồ", { happy: -6, gamble: { p: 0.8, win: { log: "Chiếc nhẫn rơi sau tủ lạnh. Không ai xin lỗi." }, lose: { custom: "job_lose" } } }), C("Bỏ việc ngay", { custom: "job_lose", happy: -2, agency: 0.02 })])),
  B("do_cook", "job_domestic", [18, 50], () => T("Học nấu ăn", "Bà chủ khen bạn nấu ngon, gợi ý đi học một khóa nấu ăn.", [
    C("Đi học", { money: -0.05, custom: "job_switch:market", know: 3 }), C("Thôi", {})])),

  /* ===================================== BẠN ĐỜI ===================================== */
  B("sp_wait", "spouse_warm", [22, 70], (c, N) => { const s = role(c, "spouse")!; return T("Bữa cơm chờ", `${N(s)} vẫn để phần cơm, dù bạn về muộn ba tối liền.`, [
    C("Về sớm từ mai", { trust: { npc: s, delta: 0.1 }, income_mult: 0.98 }), C("Công việc mà", { trust: { npc: s, delta: -0.08 } })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 22 && f(c, "spouse_warm") && !!role(c, "spouse") }),
  B("sp_dream", "spouse_warm", [25, 60], (c, N) => { const s = role(c, "spouse")!; return T("Ước mơ của người ấy", `${N(s)} kể lần đầu: muốn mở một tiệm may nhỏ. Cần vốn.`, [
    C("Dồn tiền cho người ấy", { money: -0.4, trust: { npc: s, delta: 0.25 }, gamble: { p: 0.5, win: { income_mult: 1.2, log: "Tiệm may đông khách." }, lose: { log: "Tiệm đóng sau một năm, nhưng người ấy không quên." } } }), C("Chưa phải lúc", { trust: { npc: s, delta: -0.15 } })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 25 && f(c, "spouse_warm") && !!role(c, "spouse") }),
  B("sp_sorry", "spouse_proud", [22, 70], (c, N) => { const s = role(c, "spouse")!; return T("Lời xin lỗi", `Hai người cãi nhau, lần này ${N(s)} sai. Ba ngày rồi ${N(s)} không nói một lời.`, [
    C("Xin lỗi trước dù không sai", { trust: { npc: s, delta: 0.1 }, happy: -2 }), C("Chờ người ấy xin lỗi", { trust: { npc: s, delta: -0.12 }, happy: -3 })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 22 && f(c, "spouse_proud") && !!role(c, "spouse") }),
  B("sp_grudge", (c) => f(c, "spouse_proud") && !!role(c, "spouse") && !!role(c, "sibling"), [25, 70], (c, N) => { const s = role(c, "spouse")!, sib = role(c, "sibling")!; return T("Giận nhà chồng/vợ", `${N(s)} và ${N(sib)} giận nhau từ đám giỗ năm ngoái. Tết này, ${N(s)} không muốn về.`, [
    C("Về một mình", { trust: { npc: s, delta: -0.1 }, ...{ memory: { npc: sib, tag: "KEPT_PROMISE", weight: 0.1, note: "vẫn về ăn Tết" } } }), C("Ở nhà với người ấy", { trust: { npc: s, delta: 0.12 }, memory: { npc: sib, tag: "REFUSED_HELP", weight: -0.15, note: "không về ăn Tết" } }), C("Đứng giữa hòa giải", { gamble: { p: 0.4, win: { rel: 6, log: "Hai người làm lành." }, lose: { trust: { npc: s, delta: -0.1 }, log: "Cả hai giận luôn cả bạn." } } }, undefined, { tier: "awakened" })], 1, { npc: s }); }),
  B("sp_phone", "spouse_restless", [24, 60], (c, N) => { const s = role(c, "spouse")!; return T("Tin nhắn lạ", `Điện thoại ${N(s)} sáng lên lúc nửa đêm. Một cái tên bạn không biết.`, [
    C("Hỏi thẳng", { gamble: { p: 0.5, win: { trust: { npc: s, delta: 0.05 }, log: "Chỉ là đồng nghiệp. Hai người cười, nhưng có gì đó đã khác." }, lose: { trust: { npc: s, delta: -0.3 }, flags: ["affair"], log: "Người ấy không chối." } } }),
    C("Lén đọc tin nhắn", { counters: { honest: -1 }, gamble: { p: 0.5, win: { log: "Không có gì. Bạn thấy xấu hổ." }, lose: { flags: ["affair"], happy: -10, log: "Có. Bạn không nói gì, và mang nó theo." } } }), C("Mặc kệ", { bw: -3 })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 24 && f(c, "spouse_restless") && !!role(c, "spouse") }),
  A("sp_affair", "affair", (c, N) => { const s = role(c, "spouse"); return T("Chuyện không còn giấu được", `${s ? N(s) : "Người ấy"} muốn đi.`, [
    C("Níu kéo vì con", { unflags: ["affair"], happy: -6, ...(s ? { trust: { npc: s, delta: 0.05 } } : {}) }), C("Để người ấy đi", { unflags: ["affair"], custom: "spouse_leave", happy: -10, agency: 0.03 })], 0, s ? { npc: s } : {}); }),
  B("sp_loan", "spouse_restless", [26, 60], (c, N) => { const s = role(c, "spouse")!; return T("Khoản vay sau lưng", `Chủ nợ gọi đến nhà. ${N(s)} đã vay một khoản lớn mà không nói với bạn.`, [
    C("Gánh cùng", { custom: "borrow:0.5", trust: { npc: s, delta: 0.1 } }), C("Bắt người ấy tự trả", { trust: { npc: s, delta: -0.25 }, rel: -3 })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 26 && f(c, "spouse_restless") && !!role(c, "spouse") }),
  B("sp_chores", "spouse_fair", [22, 60], (c, N) => { const s = role(c, "spouse")!; return T("Chia việc nhà", `${N(s)} đặt lên bàn một tờ giấy: ai làm gì, mỗi tuần.`, [
    C("Ký", { trust: { npc: s, delta: 0.12 }, bw: -1 }), C("Cười trừ", { trust: { npc: s, delta: -0.08 } })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 22 && f(c, "spouse_fair") && !!role(c, "spouse") }),
  B("sp_vote", "spouse_fair", [28, 65], (c, N) => { const s = role(c, "spouse")!; return T("Quyết cùng nhau", `Có một khoản tiền. ${N(s)} muốn sửa nhà, bạn muốn cho con học thêm. ${N(s)} đề nghị bốc thăm.`, [
    C("Bốc thăm", { gamble: { p: 0.5, win: { know: 2, log: "Con được đi học thêm." }, lose: { happy: 3, log: "Nhà được sửa." } }, trust: { npc: s, delta: 0.05 } }), C("Nhường người ấy", { happy: 2, trust: { npc: s, delta: 0.1 } }), C("Cãi đến cùng", { trust: { npc: s, delta: -0.1 } })], 0, { npc: s }); }, { prerequisites: (c) => c.age >= 28 && f(c, "spouse_fair") && !!role(c, "spouse") }),

  /* ===================================== LỐI RẼ ===================================== */
  B("mg_room", "path_migrant", [16, 60], () => T("Phòng trọ tám người", "Tám người chung một phòng, ngủ ca. Ai cũng gửi gần hết lương về nhà.", [
    C("Gửi về nhà gần hết", { money: -0.1, rel: 4, counters: { kind: 1 } }), C("Giữ lại một phần học tiếng", { know: 4 })])),
  B("mg_scam", "path_migrant", [18, 60], () => T("Người đồng hương", "Một người đồng hương rủ góp tiền làm ăn, nói chắc ăn.", [
    C("Góp", { gamble: { p: 0.3, win: { money: 0.3 }, lose: { money: -0.3, log: "Người đó biến mất cùng tiền của mười người." } } }), C("Không", {})])),
  B("mg_papers", "path_migrant", [18, 60], () => T("Hết hạn giấy tờ", "Visa sắp hết. Ở lại thì thành bất hợp pháp, về thì chưa trả xong nợ.", [
    C("Ở lại chui", { money: 0.3, bw: -8, flags: ["undocumented"] }, "Tiền hơn, sợ hơn"), C("Về", { custom: "return_home", rel: 4 })])),
  A("mg_return", "path_migrant", () => T("Về hay ở", "Hết hợp đồng. Tiền gửi về đã trả xong nợ. Ở quê người ta xây nhà to, còn bạn thì quen dần nơi này.", [
    C("Về quê", { custom: "return_home", rel: 6, happy: 4 }), C("Ở lại thêm", { income_mult: 1.05, rel: -4 }), C("Đón gia đình sang", { custom: "borrow:0.6", rel: 4, agency: 0.03 }, undefined, { tier: "awakened" })]), { prerequisites: (c) => f(c, "path_migrant") && c.age >= 24 }),
  B("un_dorm", "path_uni", [18, 23], () => T("Ký túc xá", "Bạn cùng phòng ký túc rủ đi biểu tình phản đối tăng học phí.", [
    C("Đi", { agency: 0.03, gamble: { p: 0.8, win: { rel: 3 }, lose: { flags: ["record"], log: "Tên bạn bị ghi vào danh sách." } } }), C("Ở lại ôn thi", { know: 2 })])),
  B("un_job", "path_uni", [18, 23], () => T("Học hay làm", "Một công ty nhận bạn làm bán thời gian. Điểm sẽ thấp đi.", [
    C("Đi làm", { money: 0.1, know: -3, flags: ["early_experience"] }), C("Chỉ học", { know: 4 })])),
  B("un_rich", "path_uni", [18, 23], () => T("Bạn học nhà giàu", "Mấy người bạn học nhà giàu rủ đi chơi cuối tuần. Một buổi bằng nửa tháng tiền nhà gửi.", [
    C("Đi", { money: -0.05, rel: 4, flags: ["rich_friends"] }), C("Từ chối khéo", { rel: -1 })])),
  B("dp_boss", "path_dropout", [12, 18], () => T("Chủ xưởng", "Chủ xưởng đánh bạn vì làm hỏng hàng.", [
    C("Chịu", { happy: -5, health: -2 }), C("Bỏ đi", { custom: "job_lose", agency: 0.02 }), C("Báo công an phường", { trait: { bold: 2 }, gamble: { p: 0.4, win: { log: "Chủ xưởng bị phạt." }, lose: { custom: "job_lose" } } })])),
  B("dp_night", "path_dropout", [16, 40], () => T("Lớp bổ túc", "Có lớp bổ túc văn hóa buổi tối ở nhà văn hóa phường.", [
    C("Đi học lại", { know: 6, health: -1, counters: { read: 2 }, flags: ["back_to_school"] }), C("Không có thời gian", {})])),
  B("si_asked", (c) => !c.married && !c.widowed && (f(c, "temper_kind") || f(c, "origin_poor_rural") || f(c, "origin_middle")), [34, 50], () => T("Người ta hỏi", "Đám cưới đứa em họ. Cả bàn quay sang hỏi bao giờ đến lượt bạn.", [
    C("Cười cho qua", { happy: -2 }), C("Nói thật mình muốn sống một mình", { agency: 0.03, rel: -2 }), C("Nhờ mai mối", { flags: ["matchmaking"] })])),
];

/** Narrow generic micro cards to the branches they fit, so they stop being universal. */
export const MICRO_GATES: Record<string, (c: FactContext) => boolean> = {
  m_mentor_ask: (c) => f(c, "temper_kind") || f(c, "temper_curious") || f(c, "temper2_kind"),
  m_sibling_small: (c) => f(c, "origin_poor_rural") || f(c, "origin_poor_urban") || f(c, "temper_kind"),
  m_friend_pitch: (c) => f(c, "temper_bold") || f(c, "temper2_bold") || f(c, "job_market") || f(c, "origin_poor_urban"),
  m_friend_secret: (c) => f(c, "temper_kind") || f(c, "temper2_kind") || f(c, "origin_middle"),
  m_defend_friend: (c) => f(c, "temper_bold") || f(c, "temper_tough") || f(c, "temper2_bold"),
  m_father_future: (c) => !f(c, "origin_poor_rural") || f(c, "temper_curious"),
  m_reconcile: (c) => f(c, "temper_kind") || c.tier !== "autopilot",
  m_fruit_tree: (c) => f(c, "origin_poor_rural") || f(c, "temper_bold"),
  m_broke_vase: (c) => !f(c, "origin_poor_rural"),
  m_share_lunch: (c) => f(c, "temper_kind") || f(c, "origin_poor_rural") || f(c, "origin_poor_urban"),
  m_teased_kid: (c) => f(c, "temper_kind") || f(c, "temper_bold"),
  m_tell_sibling: (c) => !f(c, "temper_kind"),
  m_fight_toy: (c) => f(c, "temper_bold") || f(c, "temper_tough"),
  m_found_coin: (c) => f(c, "origin_poor_rural") || f(c, "origin_poor_urban") || f(c, "temper_kind"),
  m_homework: (c) => !f(c, "temper_curious"),
  m_hobby: (c) => f(c, "temper_tough") || f(c, "temper_bold") || f(c, "origin_middle"),
  m_festival: (c) => c.poor_country && !f(c, "origin_rich"),
  m_crush: (c) => !f(c, "temper_bold") || c.age > 16,
  m_found_wallet: (c) => (f(c, "temper_kind") || f(c, "temper_curious") || f(c, "origin_poor_urban")) && !f(c, "job_farm"),
  m_wrong_change: (c) => f(c, "job_market") || f(c, "origin_poor_urban") || f(c, "job_domestic"),
  m_lottery: (c) => (f(c, "origin_poor_urban") || f(c, "job_driver") || f(c, "job_build")) && !f(c, "temper_curious"),
  m_card_game: (c) => f(c, "job_build") || f(c, "job_driver") || f(c, "job_farm") || f(c, "origin_poor_rural"),
  m_traffic_cop: (c) => f(c, "job_driver") || f(c, "job_market") || f(c, "job_build"),
  m_wedding_far: (c) => f(c, "path_migrant") || f(c, "left_home") || f(c, "path_city"),
  m_stranger_crash: (c) => f(c, "temper_kind") || f(c, "job_driver") || f(c, "job_health"),
  m_checkup: (c) => f(c, "origin_rich") || f(c, "job_office") || f(c, "job_tech") || ((f(c, "temper_curious") || f(c, "spouse_warm")) && c.age > 50),
  m_funeral: (c) => !f(c, "path_migrant") && (c.poor_country || f(c, "origin_poor_rural")),
  m_lend_bike: (c) => f(c, "origin_poor_rural") || f(c, "origin_poor_urban") || f(c, "job_farm"),
  m_gossip: (c) => f(c, "origin_poor_rural") || f(c, "job_market") || f(c, "job_farm"),
  m_call_parent: (c) => f(c, "path_migrant") || f(c, "left_home") || f(c, "path_city") || c.migrated,
  m_send_home: (c) => f(c, "path_migrant") || f(c, "path_city") || f(c, "origin_poor_rural"),
  m_village_meeting: (c) => f(c, "job_farm") || f(c, "origin_poor_rural"),
  m_temple: (c) => (c.counters.faith ?? 0) > 0 || f(c, "temper_kind"),
  m_colleague_drink: (c) => f(c, "job_factory") || f(c, "job_build") || f(c, "job_driver") || f(c, "job_office"),
  m_cover_mistake: (c) => f(c, "job_factory") || f(c, "job_office") || f(c, "job_market"),
  m_take_credit: (c) => f(c, "job_office") || f(c, "job_tech") || f(c, "job_teach"),
  m_weekend_work: (c) => f(c, "job_office") || f(c, "job_tech") || f(c, "job_health"),
  m_installment: (c) => (f(c, "temper_bold") || f(c, "spouse_restless") || f(c, "origin_poor_urban")) && !f(c, "job_farm"),
  m_bonus: (c) => f(c, "job_office") || f(c, "job_tech") || f(c, "job_factory"),
  m_evening_class: (c) => (f(c, "job_office") || f(c, "job_factory") || f(c, "job_market")) && !c.has_degree,
  m_side_gig: (c) => f(c, "job_driver") || f(c, "job_build") || f(c, "job_teach"),
  m_quit_job: (c) => f(c, "job_office") || f(c, "job_tech") || f(c, "job_teach") || f(c, "job_health"),
  m_safety: (c) => f(c, "job_factory") || f(c, "job_build"),
  m_exercise_start: (c) => !f(c, "temper_tough") && !f(c, "athlete"),
  m_first_smoke: (c) => !f(c, "athlete"),
  m_teen_drink: (c) => !f(c, "temper_curious") || f(c, "origin_poor_urban"),
  m_mentor_book: (c) => f(c, "temper_curious") || f(c, "origin_middle") || f(c, "path_uni"),
  m_help_father: (c) => !f(c, "origin_rich"),
  m_parttime: (c) => !f(c, "origin_rich"),
  m_skip_class: (c) => !f(c, "temper_curious"),
  m_spouse_buy: (c) => f(c, "spouse_restless") || f(c, "spouse_warm"),
  m_spouse_fight: (c) => f(c, "spouse_proud") || f(c, "spouse_restless"),
  m_anniversary: (c) => f(c, "spouse_warm") || f(c, "spouse_fair"),
  m_inlaw: (c) => f(c, "spouse_proud") || f(c, "spouse_fair"),
  m_insurance: (c) => f(c, "job_office") || f(c, "job_tech") || f(c, "origin_rich"),
  m_keep_working: (c) => !f(c, "origin_rich") && (f(c, "temper_tough") || f(c, "temper_bold") || c.broke),
  m_grandchild: (c) => c.kids_alive > 0 && (f(c, "temper_kind") || f(c, "spouse_warm") || f(c, "origin_poor_rural")),
  m_child_bullied: (c) => f(c, "temper_bold") || f(c, "temper_tough") || f(c, "spouse_proud"),
  m_child_path: (c) => f(c, "temper_curious") || f(c, "origin_middle") || f(c, "origin_rich") || f(c, "spouse_fair"),
  m_child_toy: (c) => f(c, "origin_poor_rural") || f(c, "origin_poor_urban") || f(c, "temper_kind") || f(c, "spouse_restless"),
  m_child_homework: (c) => f(c, "temper_curious") || f(c, "temper_tough") || f(c, "path_uni"),
  m_will: (c) => f(c, "origin_rich") || f(c, "origin_middle") || f(c, "temper_tough") || f(c, "spouse_proud"),
};

/** Everyday cards of a branch recur on a cooldown (still branch-specific, so they add decisions without adding overlap). */
const RECUR: Record<string, number> = {"dr_night": 6, "dr_crash": 12, "fc_ot": 5, "he_shift": 5, "he_gift": 8, "te_tutor": 8, "te_envelope": 10, "bu_scaffold": 8, "bu_unpaid": 10, "of_politics": 8, "tc_remote": 8, "sp_wait": 6, "sp_sorry": 5, "sp_chores": 10, "sp_vote": 8, "mg_room": 5, "mg_scam": 10, "fa_drought": 7, "do_accused": 12, "or_hunger": 3, "or_lottery_kid": 3, "or_tutor": 3, "to_water": 3, "bo_gang": 3, "un_job": 2, "un_rich": 2, "dp_boss": 3};
for (const st of BRANCHES) { const cd = RECUR[st.id]; if (cd !== undefined) { st.once = false; st.cooldownYears = cd; } }
