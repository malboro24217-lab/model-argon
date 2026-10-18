/**
 * Kho "bước ngoặt" (xem Fate.ts). Ba giọng: sitcom (dàn nhân vật có tật cố định, gag lặp lại, hiểu lầm, nói dối lăn cầu tuyết),
 * drama (cược cao, đồng hồ đếm ngược, một hình ảnh, một cú lật, hy sinh có giá), và quiet (ngã rẽ lặng).
 * Mọi lựa chọn đều là một ngã rẽ thật: cờ rẽ nhánh (tl_*), con đường, tài sản, người thân, cửa đời, thu nhập, hoặc một ván với người quen.
 * Tật của từng người trong dàn (q_<vai>_<tật>) do host gán lúc chào đời; thẻ đọc lại để người ấy ra "nhân vật của một series".
 */
import type { Storylet, FactContext, StoryletView, CastRole } from "./types.ts";
import { prov } from "./Causality.ts";
import { C, T, role, f } from "./paths/kit.ts";
import { fate, echo, cliff, shadowLine } from "./Fate.ts";

type N = (id: string) => string;
const q = (c: FactContext, r: CastRole, t: string): boolean => c.flags.has(`q_${r}_${t}`);
const gag = (c: FactContext, key: string): number => c.counters[`gag_${key}`] ?? 0;
const nth = (n: number): string => ["lần đầu", "lần thứ hai", "lần thứ ba", "lần thứ tư", "lần thứ năm", "lần thứ sáu"][Math.min(n, 5)]!;
const op = (c: FactContext, id: string | undefined): number => (id ? c.opinion[id] ?? 0 : 0);
const vn = (c: FactContext) => c.country === "VN";
const pd = (who: string, a: string, b: string) => ({ me: [a, b] as [string, string], them: [a, b] as [string, string], cells: [[[1, 1], [-1.6, 2.4]], [[2.4, -1.6], [-0.8, -0.8]]], unit: "u" });
/** Cộng một bộ đếm gag vào mọi lựa chọn (để lần sau thẻ nói "lần thứ ba"). */
const gagAll = (v: StoryletView, key: string): StoryletView => ({ ...v, choices: v.choices.map((ch) => ({ ...ch, effects: { ...ch.effects, counters: { ...(ch.effects.counters ?? {}), [`gag_${key}`]: 1 } } })) });
const FLOOD = new Set(["BD", "VN", "PH", "ID", "IN", "PK", "MM", "NG", "MZ", "TH", "KH", "LK", "NP", "HT", "MG", "ET", "SD", "SS", "SO", "YE", "CD", "ML", "NE", "TD"]);
const WAR = new Set(["AF", "SD", "SS", "SY", "YE", "SO", "CD", "ML", "ET", "MM", "IQ", "LY", "NE", "TD", "CF", "UA", "PS"]);
const dead = (c: FactContext, r: CastRole) => !role(c, r);

export const FATE: Storylet[] = [
  /* ============================================================ LỚN · DRAMA ============================================================ */
  fate("ft_mine", "lon", [16, 58], (c) => (c.worker || c.farmer || c.poor_country) && c.has_job, (c, N) => {
    const fr = role(c, "childhood_friend");
    return T("Tiếng còi lúc ba giờ sáng",
      `Còi báo động rú lên ở ${c.worker ? "khu mỏ" : "bến"} lúc ba giờ sáng. Ca của bạn, hầm số bốn, sập. Mười hai người còn kẹt dưới đó${fr ? `, trong đó có ${N(fr)}` : ""}. Đốc công đứng ở cổng, tay cầm danh sách, nói: "Ai xuống thì xuống ngay, không thì về." Bạn đã xuống hầm ấy hai nghìn lần.`,
      [C("Xuống hầm", { health: -22, happy: 6, rel: 10, flags: ["tl_rescuer", "leader"], ...(fr ? { memory: { npc: fr, tag: "STOOD_UP_FOR_ME", weight: 0.5, note: "xuống hầm sập kéo lên" } } : {}), gamble: { p: 0.75, win: { log: "Bạn kéo được ba người lên. Phổi bạn giữ lại bụi của đêm ấy mãi mãi." }, lose: { health: -20, log: "Trần hầm sập lần hai. Bạn được kéo lên sau sáu giờ, hai xương sườn gãy." } } }, "Có thể cứu được người, và trả bằng cơ thể", { longterm: true }),
        C("Đứng ở cổng, khai với báo chí", { flags: ["tl_whistle", "leader"], rel: -6, custom: "job_lose", gamble: { p: 0.5, win: { money: 0.8, log: "Vụ việc lên báo. Chủ mỏ bị phạt, bạn nhận một khoản bồi thường, và không nơi nào trong vùng nhận bạn làm nữa." }, lose: { money: -0.2, log: "Báo đăng một ngày rồi im. Chủ mỏ nhớ tên bạn." } } }, "Nói thật thì mất việc, có thể được đền"),
        C("Về, và không bao giờ xuống nữa", { happy: -10, flags: ["tl_walked_away"], custom: "job_lose", ...(fr ? { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.35, note: "quay về khi hầm sập" } } : {}) }, "Sống, với một đêm không quên được")], 0);
  }),

  fate("ft_illness", "lon", [30, 74], (c) => c.health < 60 || c.age >= 50, (c, N) => {
    const sp = role(c, "spouse"), sib = role(c, "sibling");
    return T("Tờ giấy có một chữ gạch chân",
      `Bác sĩ đẩy tờ kết quả qua bàn, một chữ gạch chân bằng bút đỏ. "Mổ trong tháng này thì còn kịp. Chi phí…" ông ta nói một con số bằng ${c.poor_country ? "hai năm" : "nửa năm"} thu nhập của bạn.${sp ? ` ${N(sp)} ngồi bên, bóp tay bạn đến đau.` : ""} Ngoài cửa, người tiếp theo đã được gọi tên.`,
      [C("Mổ, bằng mọi giá", { health: -8, money: c.poor_country ? -1.8 : -0.6, flags: ["tl_survivor"], custom: c.savings < c.income ? "borrow:1" : "", log: "Ca mổ tám tiếng. Bạn tỉnh dậy với một vết sẹo dài và một khoản nợ." }, "Sống, mang nợ", { longterm: true }),
        ...(c.home_owner ? [C("Bán nhà lấy tiền mổ", { health: -8, sell: { kind: "house" }, flags: ["tl_sold_home_for_life", "land_sold"], log: "Căn nhà đi trong hai tuần. Ca mổ thành công. Bạn ra viện, về một phòng thuê." }, "Sống, mất chỗ về")] : []),
        ...(sib ? [C(`Nhờ ${N(sib)} đứng ra lo`, { health: -10, money: -0.4, memory: { npc: sib, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "chạy tiền mổ" }, promise: { to: sib, what: "trả lại tiền mổ", years: 3, cost_money: 0.8 }, log: `${N(sib)} cầm sổ đỏ của chính mình đi vay. Bạn hứa trả trong ba năm.` }, "Sống bằng tiền anh em, mang một lời hứa")] : []),
        C("Không mổ. Về nhà.", { health: -28, happy: 4, flags: ["tl_refused_cure"], lifestyle: "tan_tien", log: "Bạn về, sắp xếp lại nhà cửa, và sống từng ngày như thể đó là món quà." }, "Giữ tiền cho người ở lại, mất nhiều năm", { tier: "awakened" })], 0);
  }),

  fate("ft_fire", "lon", [22, 70], (c) => c.home_owner || f(c, "own_business"), (c, N) => {
    const nb = role(c, "neighbor");
    return T("Mùi khét lúc nửa đêm",
      `Bạn tỉnh dậy vì mùi khét. Lửa đã lên đến mái ${f(c, "own_business") ? "quán" : "nhà"}. Bạn có đúng một phút để chọn mang ra cái gì: hộp giấy tờ, hay ${c.kids_alive ? "đứa nhỏ đang ngủ ở gian trong" : "con chó đang sủa ở sân sau"}.${nb ? ` ${N(nb)} đứng bên kia hàng rào, cầm xô nước, hét: "Giấy tờ! Giấy tờ trước!"` : ""} Sáng ra chỉ còn cái khung đen.`,
      [C("Dựng lại bằng tiền vay", { custom: "borrow:1", money: -0.3, flags: ["tl_rebuilt", "tl_debtor"], happy: -8, log: "Bạn vay, dựng lại trên nền cũ. Mỗi tháng trả góp, bạn ngửi thấy khói." }, "Giữ chỗ cũ, gánh nợ dài"),
        ...(c.home_owner ? [C("Bán đất, đi nơi khác", { sell: { kind: "house" }, flags: ["land_sold", "left_home", "tl_uprooted"], custom: "move_city", close_doors: ["return_home"], log: "Bạn bán nền đất cháy với giá rẻ và lên thành phố với hai cái va li." }, "Một đời khác ở nơi khác")] : []),
        ...(nb ? [C(`Ở nhờ ${N(nb)}, làm lại từ đầu`, { money: -0.2, rel: 6, memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.45, note: "cho ở nhờ sau vụ cháy" }, flags: ["tl_sheltered"], ...(f(c, "own_business") ? { unflags: ["own_business"], custom: "job_lose" } : {}), log: `Ba tháng trong gian bếp nhà ${N(nb)}. Bạn học lại cách nói cảm ơn.` }, "Giữ người, mất của")] : []),
        C("Để lửa quyết hộ: đi làm xa", { flags: ["left_home", "tl_uprooted"], ...(f(c, "own_business") ? { unflags: ["own_business"] } : {}), custom: c.age <= 48 && !c.migrated ? "migrate_now" : "move_city", log: "Bạn không dựng lại gì cả. Bạn đi." }, "Không nợ, không nhà, không quê")], 0);
  }),

  fate("ft_war", "lon", [12, 60], (c) => !c.migrated && (WAR.has(c.country) || c.gdp < 3500), (c, N) => {
    const mo = role(c, "mother"), sib = role(c, "sibling");
    return T("Đêm điện tắt cả thị trấn",
      `Điện tắt cả thị trấn. Trên radio chỉ còn tiếng rè. Xe tải chạy về hướng biên giới, người ta trả bằng vàng để có một chỗ ngồi trên thùng xe.${mo ? ` ${N(mo)} gói hai bộ quần áo cho bạn, nói: "Đi đi, mẹ ở lại giữ nhà."` : ""} Chỉ có chỗ cho ${sib ? "một trong hai anh em" : "một người"}.`,
      [C("Lên xe", { custom: "become:refugee", flags: ["left_home", "tl_exile"], close_doors: ["return_home"], rel: -8, ...(sib ? { memory: { npc: sib, tag: "REFUSED_HELP", weight: -0.3, note: "lấy chỗ trên xe tải đêm chạy loạn" } } : {}), log: "Thùng xe xóc suốt đêm. Lúc trời sáng, bạn không còn biết mình đang ở nước nào." }, "Sống, mất quê, mất chỗ ngồi của người khác"),
        ...(sib ? [C(`Nhường chỗ cho ${N(sib)}`, { health: -15, money: -0.6, flags: ["tl_war_stayed"], memory: { npc: sib, tag: "HELPED_IN_CRISIS", weight: 0.6, note: "nhường chỗ trên xe đêm chạy loạn" }, log: `${N(sib)} lên xe. Bạn ở lại dưới hầm với ${mo ? N(mo) : "cả xóm"} suốt mùa đông.` }, "Giữ người thân, trả bằng chính mình", { longterm: true })] : []),
        ...(c.age >= 18 && c.age <= 30 ? [C("Nhập ngũ", { custom: "become:soldier", flags: ["tl_soldier"], health: -10, log: "Bạn ký tên vào tờ giấy dưới ánh đèn pin." }, "Một con đường khác, và một thứ không bao giờ kể lại được")] : []),
        C("Ở lại, mở cửa nhà cho người chạy loạn", { health: -12, money: -0.8, rel: 12, flags: ["tl_war_stayed", "leader"], log: "Nhà bạn thành nơi trú của ba gia đình lạ. Có người sau này gọi bạn là ân nhân, có người không nhớ tên bạn." }, "Mất của, được một thứ khác")], 0);
  }),

  fate("ft_flood", "lon", [8, 72], (c) => FLOOD.has(c.country) && !c.migrated, (c, N) => {
    const nb = role(c, "neighbor"), kid = c.age < 18;
    return T("Nước lên đến bậc thứ ba",
      `Mưa ba ngày. Sáng nay nước lên đến bậc thứ ba, chiều đã ngập giường. ${kid ? "Bố mẹ bạn" : "Bạn"} đứng trên mái, nhìn ${c.farmer ? "cả vụ lúa" : "cả cái xóm"} trôi.${nb ? ` ${N(nb)} chèo xuồng qua, ${q(c, "neighbor", "knows") ? `và đương nhiên đã biết nhà ai mất gì: "Nhà cậu mất cái tủ lạnh rồi, tôi thấy nó trôi qua."` : "hỏi có cần gì không."}` : ""}`,
      kid ? [C("Theo bố mẹ lên thành phố làm thuê", { flags: ["left_home", "path_city", "tl_flood_child"], know: -4, rel: -3, log: "Cả nhà dọn lên thành phố. Bạn học lớp mới giữa năm, ngồi bàn cuối." }, "Mất làng, được một thành phố"),
        C("Ở lại dựng lại với làng", { health: -5, rel: 6, flags: ["tl_rebuilt"], ...(nb ? { memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.25, note: "tát nước dựng lại nhà cùng nhau" } } : {}), log: "Bạn bỏ học hai tháng để tát bùn. Cả xóm dựng lại từng mái một." }, "Giữ làng, mất hai tháng học")]
      : [C("Dựng lại trên nền cũ", { money: -0.6, health: -5, flags: ["tl_rebuilt"], log: "Mất bốn tháng và mọi đồng tiết kiệm. Mái mới cao hơn mái cũ một gang." }, "Ở lại, trắng tay một mùa"),
        C("Bỏ lên thành phố", { custom: "move_city", flags: ["tl_uprooted"], log: "Bạn không chờ nước rút." }, "Một đời khác"),
        C("Vay nóng để dựng lại ngay", { custom: "borrow:1", flags: ["tl_debtor"], money: -0.3, log: "Tiền vay đến trong một ngày. Lãi thì đến mỗi tháng." }, "Nhanh, và lãi sẽ đuổi theo"),
        ...(nb ? [C("Lo cho cả xóm trước", { money: -0.4, rel: 10, flags: ["leader"], memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.45, note: "chèo xuồng cứu đồ cả xóm sau lũ" }, log: "Ba ngày bạn chèo xuồng. Nhà bạn là nhà dựng lại sau cùng." }, "Mất của, được xóm", { longterm: true })] : [])], 0);
  }),

  fate("ft_trial", "lon", [18, 62], (c) => (c.poor_country || c.reputation < 45) && !!role(c, "official"), (c, N) => {
    const of = role(c, "official")!;
    return T("Giấy triệu tập màu vàng",
      `Một tờ giấy màu vàng dán trước cửa: bạn bị tố ${c.has_job ? "biển thủ ở chỗ làm" : "chiếm đất"}. Bạn không làm. ${N(of)} ${q(c, "official", "tea") ? `mời bạn một chén trà rất lâu rồi mới nói: "Chuyện này, khép lại được. Tùy anh chị."` : `gõ bút lên bàn: "Có hai cách. Cách nhanh, và cách đúng."`} Phiên xử sau bốn tuần.`,
      [C("Ra tòa, đến cùng", { money: -0.7, bw: -10, gamble: { p: 0.55, win: { rel: 8, flags: ["tl_cleared"], memory: { npc: of, tag: "HUMILIATED_ME", weight: -0.4, note: "thắng kiện trước mặt cả huyện" }, log: "Bốn tuần, ba phiên. Tòa tuyên bạn vô tội. Người ký giấy tố bạn ngồi ở hàng ghế cuối, không nhìn lên." }, lose: { health: -12, happy: -15, flags: ["tl_convicted"], close_doors: ["clean_record"], log: "Tòa tuyên án treo. Từ đây mọi hồ sơ của bạn có một dòng." } } }, "Có thể sạch tên, có thể mang án"),
        C("Đi cách nhanh", { money: -0.45, secret: { tag: "PAID_BRIBE", severity: 0.45, fuse_years: [4, 14], note: `đưa tiền cho ${N(of)} để khép hồ sơ`, known_by: [of] }, trust: { npc: of, delta: 0.15 }, log: "Hồ sơ khép lại trong một buổi chiều. Bạn ra về nhẹ túi và nặng một chuyện không kể được." }, "Nhanh, và người đó giữ chuyện này"),
        C("Bỏ đi trước phiên xử", { custom: "move_city", flags: ["tl_fugitive", "left_home"], close_doors: ["return_home", "clean_record"], happy: -8, log: "Bạn đi chuyến xe đêm. Không ai tiễn." }, "Không án, không quê"),
        C("Đưa chuyện ra họp dân", { rel: 5, bw: -8, flags: ["leader"], gamble: { p: 0.5, win: { flags: ["tl_cleared"], memory: { npc: of, tag: "HUMILIATED_ME", weight: -0.5, note: "đưa chuyện ra họp dân" }, log: "Cả xóm ký đơn. Hồ sơ bị rút. Người ký giấy tố bạn từ đó không chào bạn." }, lose: { rel: -8, close_doors: ["village_trust"], log: "Buổi họp thành cãi vã. Nửa xóm tin bạn, nửa không." } } }, "Lựa chọn thứ ba: kéo cả làng vào", { tier: "sovereign" })], 0);
  }),

  fate("ft_letter_dead", "lon", [24, 66], (c) => dead(c, "mother") || dead(c, "father") || dead(c, "mentor"), (c) => T("Lá thư đề tên bạn, nét chữ của người đã mất",
    `Một người lạ đứng trước cửa, cầm phong bì đã ố. Nét chữ ngoài bì là của ${dead(c, "mentor") ? "người thầy" : dead(c, "father") ? "bố" : "mẹ"} bạn. Trong thư: một mảnh đất ở nơi bạn chưa từng nghe tên, để lại cho bạn với một điều kiện: phải tự đến nhận trong vòng một năm, và không được bán cho người cùng họ. "Nếu con đến, con sẽ hiểu."`,
    [C("Đi ngay, bỏ hết mọi việc", { ...cliff("tl_wait_letter", "ft_letter_echo", 1), money: -0.3, bw: -6, log: "Bạn xin nghỉ, mua vé, và không nói với ai lý do." }, "Một năm sau mới biết là gì", { longterm: true }),
      C("Gửi người đi thay", { money: -0.15, flags: ["tl_letter_proxy"], log: "Bạn thuê một người đi xem. Người ấy về, nói mảnh đất có thật và có người đang ở trên đó." }, "Biết một nửa, mất một nửa"),
      C("Đốt thư", { happy: -6, flags: ["tl_letter_burned"], close_doors: ["inheritance"], log: "Bạn đốt thư trong chậu rửa. Tro bay lên mặt. Có những cánh cửa đóng không tiếng động." }, "Không nợ gì người chết")], 0)),

  fate("ft_stranger_offer", "lon", [25, 60], (c) => c.has_job && c.know >= 30, (c, N) => {
    const bo = role(c, "first_boss"), rv = role(c, "rival");
    return T("Người lạ ở quán nước, biết tên bạn",
      `Một người đàn ông mặc áo khoác dài gọi đúng tên bạn ở quán nước. Ông ta biết bạn làm gì, nợ bao nhiêu, và đưa một đề nghị: ${f(c, "own_business") ? "mua lại việc làm ăn của bạn gấp ba giá trị" : "một chân quản lý, lương gấp đôi, bắt đầu thứ hai tuần sau"}. Điều kiện duy nhất: ${bo ? `không được nói với ${N(bo)}` : "đừng hỏi tiền từ đâu"}. Ông ta để lại danh thiếp không có tên công ty.`,
      [C("Nhận", { income_mult: 1.6, ...cliff("tl_wait_fortune", "ft_fortune_echo", 2), ...(bo ? { memory: { npc: bo, tag: "BETRAYED_PARTNERSHIP", weight: -0.3, note: "bỏ đi theo người lạ không một lời" } } : {}), flags: ["tl_shadow_money"], log: "Thứ hai tuần sau bạn ngồi ở một văn phòng có máy lạnh và không có biển hiệu." }, "Giàu nhanh, hai năm nữa sẽ biết giá"),
        C("Nhận, nhưng hỏi tiền từ đâu", { bw: -8, rel: 2, agency: 0.02, gamble: { p: 0.5, win: { income_mult: 1.35, flags: ["tl_clean_patron"], log: "Ông ta cười, kể một câu chuyện dài về một cái xưởng. Chuyện có thật. Bạn ký." }, lose: { flags: ["tl_refused_shadow"], log: "Ông ta đứng dậy, trả tiền nước cho cả hai, và không bao giờ quay lại." } } }, "Lựa chọn thứ ba: biết trước khi nhận", { tier: "sovereign" }),
        ...(rv ? [C(`Từ chối, và mách ${N(rv)} để người đó nhận`, { happy: 3, memory: { npc: rv, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "nhường một cơ hội lớn" }, flags: ["tl_refused_shadow"], log: `${N(rv)} nhận lời. Hai năm sau bạn sẽ thấy ${N(rv)} đi xe gì, hoặc đi đâu.` }, "Giữ mình sạch, đẩy rủi ro sang đối thủ")] : []),
        C("Từ chối", { flags: ["tl_refused_shadow"], happy: -2, log: "Bạn để danh thiếp trên bàn. Ra khỏi quán, bạn ngoái lại một lần." }, "Không gì đổi, trừ một câu hỏi")], 0);
  }),

  fate("ft_partner_mask", "lon", [25, 62], (c) => !!role(c, "partner") && (c.savings > 0.5 * c.income || f(c, "own_business")), (c, N) => {
    const p = role(c, "partner")!;
    return T("Hai cuốn sổ cùng một bìa", `Bạn tìm một cái hóa đơn trong ngăn kéo của ${N(p)} và thấy hai cuốn sổ, cùng bìa, số khác nhau. Một cuốn là cuốn bạn vẫn xem. ${N(p)} bước vào, nhìn tay bạn, và nói rất bình thản: "Ngồi xuống. Mình nói chuyện."`,
      [C("Tin lời giải thích, góp thêm vốn", { game: { npc: p, move: "cooperate", stake_frac: 0.8 }, log: "Bạn chọn tin" }, "Nếu người này thật, cả hai cùng lên. Nếu không…", { longterm: true }),
        C("Rút sạch phần mình ngay đêm nay", { game: { npc: p, move: "defect", stake_frac: 0.8 }, flags: ["tl_broke_partnership"], log: "Bạn rút trước" }, "Ra trước, mang theo một kẻ thù"),
        C("Gọi kế toán độc lập, khóa tài khoản chung", { game: { npc: p, move: "arbitrage", stake_frac: 0.8 }, bw: -10, log: "Bạn khóa tài khoản và mời người thứ ba" }, "Lựa chọn thứ ba: không tin, không phản", { tier: "sovereign" })],
      0, { npc: p, matrix: pd(N(p), "Thật", "Giấu") });
  }, { causes: (c) => [prov.opinion(role(c, "partner") ?? "")] }),

  fate("ft_rival_fall", "lon", [26, 64], (c) => !!role(c, "rival"), (c, N) => {
    const rv = role(c, "rival")!, bad = op(c, rv) < -0.2;
    return T(`${N(rv)} gõ cửa lúc trời mưa`, `${N(rv)}, người ${bad ? "từng chơi xấu bạn" : "cạnh tranh với bạn bao năm"}, đứng trước cửa, ướt sũng, không có ô. Chủ nợ sẽ siết ${vn(c) ? "cửa hàng" : "xưởng"} của ${N(rv)} sáng mai nếu không có người đứng ra bảo lãnh. Trong tay bạn là cây bút. Trong đầu bạn là mọi chuyện cũ.`,
      [C("Bảo lãnh", { game: { npc: rv, move: "cooperate", stake_frac: 0.7 }, trait: { coop: 2 }, flags: ["tl_mercy"], log: "Bạn ký bảo lãnh cho kẻ từng là đối thủ" }, "Tha thứ, cược bằng tiền của mình", { longterm: true }),
        C("Mua lại xưởng với giá chủ nợ", { game: { npc: rv, move: "defect", stake_frac: 0.7 }, flags: ["tl_took_rival", "own_business"], log: "Bạn mua lại cơ nghiệp của đối thủ ngay đêm ấy" }, "Thắng tuyệt đối, và cả chợ nhìn thấy"),
        C("Bảo lãnh có điều kiện: một phần xưởng", { game: { npc: rv, move: "arbitrage", stake_frac: 0.7 }, flags: ["own_business"], log: "Bạn bảo lãnh, đổi lấy một phần" }, "Lựa chọn thứ ba: cứu người, giữ phần", { tier: "sovereign" }),
        C("Đóng cửa", { happy: -3, memory: { npc: rv, tag: "REFUSED_HELP", weight: -0.5, note: "đóng cửa khi đến xin bảo lãnh trong mưa" }, flags: ["tl_refused_rival"], log: `Bạn tắt đèn. Sáng mai xưởng ${N(rv)} có người khác.` }, "Không dính, không quên")],
      0, { npc: rv });
  }, { causes: (c) => [prov.opinion(role(c, "rival") ?? "")] }),

  fate("ft_deathbed", "lon", [28, 66], (c) => (!!role(c, "mother") || !!role(c, "father")) && c.parent_sick, (c, N) => {
    const pa = role(c, "father") ?? role(c, "mother")!, sib = role(c, "sibling");
    return T("Điều bố mẹ nói lúc đèn đã tắt", `${N(pa)} nắm tay bạn trong bệnh viện, thì thầm một chuyện: ${sib ? `${N(sib)} không phải con ruột, và mảnh đất là để cho người ấy, không phải cho bạn` : "có một khoản nợ chưa ai biết, và có một người đang giữ giấy tờ nhà"}. "Đừng nói với ai." Rồi ngủ. Bạn ngồi đến sáng với một câu trong đầu.`,
      [C("Giữ lời, đem theo xuống mồ", { happy: -6, flags: ["tl_keeps_secret"], secret: { tag: "ABANDONED_PARENT", severity: 0.2, fuse_years: [10, 25], note: "giấu lời trối của bố mẹ" }, log: "Bạn không nói. Có những điều ngậm lâu thành sỏi." }, "Gia đình yên, mình không yên"),
        ...(sib ? [C(`Nói thật với ${N(sib)}`, { rel: -5, memory: { npc: sib, tag: "STOOD_UP_FOR_ME", weight: 0.5, note: "nói sự thật về gốc gác và mảnh đất" }, flags: ["tl_told_truth"], close_doors: ["inheritance"], log: `${N(sib)} im lặng ba ngày. Rồi ôm bạn. Mảnh đất đổi tên.` }, "Mất phần, giữ anh em", { longterm: true })] : []),
        C("Đi tìm người giữ giấy tờ", { ...cliff("tl_wait_deed", "ft_deed_echo", 2), bw: -6, money: -0.1, log: "Bạn lần theo một cái tên trong sổ cũ." }, "Hai năm nữa mới biết gặp ai"),
        C("Dùng điều đó để giữ phần đất", { flags: ["heir", "tl_used_secret"], money: 0.8, ...(sib ? { memory: { npc: sib, tag: "CHEATED_ME", weight: -0.5, note: "giành đất bằng lời trối" } } : {}), close_doors: ["family_table"], log: "Giấy tờ sang tên bạn. Mâm giỗ năm sau thiếu một người." }, "Được đất, mất mâm cơm")], 0, { npc: pa });
  }),

  fate("ft_forbidden", "lon", [19, 40], (c) => !c.married && (!!role(c, "mother") || !!role(c, "father")), (c, N) => {
    const mo = role(c, "mother") ?? role(c, "father")!;
    return T("Người mà cả nhà cấm nhắc tên", `Bạn yêu một người mà ${N(mo)} nhìn thấy là ${vn(c) ? "quay mặt vào bếp" : "đóng cửa phòng"}: ${c.poor_country ? "khác đạo, khác làng, nhà có chuyện cũ với nhà bạn" : "con nhà đã kiện nhà bạn mười năm trước"}. Người ấy nói: "Tuần sau tôi đi. Đi cùng, hoặc ở lại." ${q(c, "mother", "nag_marry") ? `Chiều đó ${N(mo)} lại hỏi: "Bao giờ mới chịu lấy một người tử tế?"` : ""}`,
      [C("Cưới, dù cả nhà không đến", { custom: "marry", flags: ["left_home", "tl_eloped"], trust: { npc: mo, delta: -0.4 }, memory: { npc: mo, tag: "HUMILIATED_ME", weight: -0.4, note: "cưới người nhà cấm, không ai đến dự" }, happy: 10, log: "Đám cưới có sáu người. Không ai trong số đó là họ hàng bạn." }, "Có người thương, mất một bàn thờ"),
        C("Ở lại, chia tay", { happy: -14, flags: ["tl_obeyed"], trust: { npc: mo, delta: 0.2 }, log: "Bạn ra bến xe, và không bước lên." }, "Giữ nhà, mất người", { longterm: true }),
        C("Đi, nhưng không cưới. Đợi.", { custom: "move_city", flags: ["tl_waiting_love"], happy: 4, promise: { to: mo, what: "về nhà trước Tết", years: 2 }, log: "Hai người ở hai phòng trọ cạnh nhau. Bạn hứa với nhà sẽ về trước Tết." }, "Lựa chọn thứ ba: không đoạn tuyệt ai", { tier: "awakened" })], 0, { npc: mo });
  }),

  fate("ft_vow", "lon", [20, 70], (c) => f(c, "parent_died") || c.widowed, (c, N) => {
    const kid = role(c, "child"), sib = role(c, "sibling");
    return T("Lời thề ở mộ", `Mưa phùn. Bạn đứng trước nấm mộ mới, đất còn đỏ, và nói to một câu mà chỉ có bạn nghe. ${sib ? `${N(sib)} đứng cách ba bước, ${q(c, "sibling", "late") ? "đến muộn như mọi lần, " : ""}nghe được nửa câu.` : "Gió thổi tắt nhang hai lần."}`,
      [C("Thề không bao giờ nghèo nữa", { flags: ["tl_vow_money"], agency: 0.02, lifestyle: "tan_tien", trait: { risk: 2 }, counters: { save: 3 }, log: "Từ ngày ấy bạn đếm từng đồng. Người ta bắt đầu gọi bạn là keo." }, "Một đời tính toán"),
        ...(kid ? [C(`Thề lo cho ${N(kid)} ăn học đến cùng`, { flags: ["tl_vow_child"], promise: { to: kid, what: "cho ăn học đến nơi", years: 8, cost_money: 1.5 }, support: { who: "kids", level: "hau" }, log: "Bạn thề. Đứa nhỏ không biết, nhưng sẽ hưởng." }, "Một lời hứa tám năm", { longterm: true })] : []),
        C("Thề làm điều người ấy chưa kịp làm", { flags: ["tl_vow_dream"], custom: c.age <= 45 ? "study" : "", happy: 5, know: 6, log: "Bạn ghi lời thề vào mặt sau tấm ảnh thờ." }, "Đổi hướng đời giữa chừng", { tier: "awakened" }),
        C("Không thề gì. Về.", { happy: -2, flags: ["tl_no_vow"], log: "Bạn về, nấu cơm, và sống tiếp như hôm qua." }, "Lặng")], 0);
  }),

  fate("ft_kidnap", "lon", [26, 60], (c) => (c.kids_alive > 0 || !!role(c, "sibling")) && (c.debt_ratio > 0.8 || f(c, "tl_debtor") || c.poor_country), (c, N) => {
    const who = role(c, "child") ?? role(c, "sibling")!;
    return T("Cuộc gọi lúc năm giờ chiều", `Năm giờ chiều, số lạ. Giọng đàn ông: "${N(who)} đang ở chỗ chúng tôi. Khoản nợ của nhà anh chị, trả trước sáng mai." Nghe thấy tiếng ${N(who)} ở xa: "Đừng trả, đừng…" rồi tắt. Con số họ nói bằng một năm thu nhập của bạn.`,
      [C("Gom tiền, trả trước sáng mai", { money: -1, custom: c.savings < c.income ? "borrow:0.8" : "", flags: ["tl_paid_ransom", "tl_debtor"], memory: { npc: who, tag: "HELPED_IN_CRISIS", weight: 0.6, note: "trả nợ chuộc người" }, log: `${N(who)} về lúc rạng sáng, không nói gì suốt một tuần.` }, "Người về, tiền đi, chủ nợ biết bạn trả được", { longterm: true }),
        C("Báo công an", { bw: -10, gamble: { p: 0.6, win: { flags: ["tl_reported"], rel: 5, memory: { npc: who, tag: "STOOD_UP_FOR_ME", weight: 0.4, note: "không nhượng bộ chủ nợ" }, log: `Công an tới lúc ba giờ sáng. ${N(who)} về, chủ nợ đi tù, và người ta bắt đầu biết tên bạn.` }, lose: { health: -10, happy: -15, ...cliff("tl_wait_revenge", "ft_revenge_echo", 2), log: `${N(who)} về sau hai ngày, có vết bầm. Chủ nợ biến mất. Nhưng không biến mất mãi.` } } }, "Có thể thoát sạch, có thể gieo một vụ sau"),
        C("Tự đi đến chỗ họ", { health: -18, flags: ["brawler", "tl_went_alone"], gamble: { p: 0.5, win: { memory: { npc: who, tag: "STOOD_UP_FOR_ME", weight: 0.6, note: "một mình đến chỗ chủ nợ" }, log: "Bạn ra về với một bên mắt tím và cả hai người." }, lose: { money: -0.6, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.3, fuse_years: [3, 10], note: "ký giấy nhận nợ thay người khác" }, log: "Bạn ký một tờ giấy để cả hai được về. Tờ giấy ấy sẽ còn quay lại." } } }, "Không ai bảo vệ bạn, kể cả bạn")], 0, { npc: who });
  }),

  fate("ft_exile", "lon", [20, 58], (c) => Object.keys(c.hooks).length > 0 || f(c, "tl_convicted") || c.reputation < 35, (c, N) => {
    const fr = role(c, "childhood_friend");
    return T("Đêm phải rời thị trấn", `${fr ? N(fr) : "Một người quen"} đập cửa lúc mười một giờ: "Sáng mai cả chợ sẽ biết. Đi đêm nay." Xe cuối cùng rời bến lúc hai giờ. Bạn có ba tiếng để quyết định đời mình sẽ ở đâu.`,
      [C("Lên chuyến xe hai giờ", { custom: !c.migrated && c.age <= 48 ? "migrate_now" : "move_city", flags: ["left_home", "tl_exile"], close_doors: ["return_home"], happy: -10, log: "Bạn đi. Đèn thị trấn nhỏ dần trong gương chiếu hậu." }, "Sống ở nơi không ai biết tên"),
        C("Ở lại, chịu mọi lời", { rel: -12, health: -5, flags: ["tl_stayed_shame"], custom: "confess_hook", agency: 0.03, log: "Sáng mai bạn ra chợ, ngẩng đầu, và mua rau như mọi ngày. Có người quay đi. Có người gật." }, "Mất mặt, giữ chỗ đứng", { tier: "awakened", longterm: true }),
        ...(fr ? [C(`Nhờ ${N(fr)} dập chuyện lại`, { money: -0.5, trust: { npc: fr, delta: 0.2 }, secret: { tag: "PAID_BRIBE", severity: 0.35, fuse_years: [3, 9], note: "nhờ bạn thân mua chuộc người biết chuyện", known_by: [fr] }, log: `${N(fr)} đi gặp vài người. Chợ sáng hôm sau yên lặng một cách đáng ngờ.` }, "Mua sự im lặng, bằng tiền và bằng bạn")] : [])], 0);
  }),

  fate("ft_file", "lon", [30, 68], (c) => !!role(c, "official") && op(c, role(c, "official")) < -0.2 && (c.home_owner || f(c, "own_business") || c.kids_school > 0), (c, N) => {
    const of = role(c, "official")!;
    return T("Người bạn từng từ chối, nay giữ hồ sơ của bạn", `Hồ sơ ${c.home_owner ? "sổ đỏ" : f(c, "own_business") ? "giấy phép kinh doanh" : "nhập học của con"} nằm trên bàn ${N(of)}. ${N(of)} nhớ bạn. ${N(of)} ${q(c, "official", "stamp") ? `cười: "Con dấu hôm nay tôi để quên ở nhà." Lần thứ ${gag(c, "official_stamp") + 1} nghe câu này.` : `nói: "Hồ sơ thiếu một tờ."` } Tờ nào thì không nói.`,
      [C("Xin lỗi chuyện cũ, công khai", { custom: "apologize", rel: -3, flags: ["tl_bowed"], agency: -0.01, log: "Bạn cúi đầu giữa phòng. Hồ sơ được ký ba ngày sau." }, "Được việc, mất một chút mình"),
        C("Đưa phong bì", { money: -0.3, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [3, 12], note: `đưa phong bì cho ${N(of)}`, known_by: [of] }, trust: { npc: of, delta: 0.2, }, log: "Con dấu bỗng dưng có ở ngăn kéo." }, "Nhanh, và thêm một thứ để bị nắm"),
        C("Khiếu nại lên trên", { bw: -12, money: -0.15, gamble: { p: 0.45, win: { flags: ["leader", "tl_won_appeal"], memory: { npc: of, tag: "HUMILIATED_ME", weight: -0.5, note: "khiếu nại vượt cấp và thắng" }, log: "Cấp trên ký. Hồ sơ xong, và người ngồi bàn ấy từ nay nhìn bạn như một cái gai." }, lose: { happy: -8, ...(c.home_owner ? { sell: { kind: "house" }, flags: ["land_sold"] } : f(c, "own_business") ? { unflags: ["own_business"], custom: "job_lose" } : { know: -3 }), log: "Đơn nằm đó một năm. Bạn bỏ cuộc trước." } } }, "Lựa chọn thứ ba: đi đường thẳng, trả bằng thời gian", { tier: "sovereign", longterm: true })], 0, { npc: of });
  }, { spec: 7, causes: (c) => [prov.opinion(role(c, "official") ?? "")] }),

  fate("ft_scandal", "lon", [22, 70], (c) => Object.keys(c.hooks).length > 0, (c, N) => {
    const holder = Object.keys(c.hooks)[0]!;
    return T("Chuyện cũ nổ giữa đám giỗ", `Giữa đám giỗ, ${N(holder)} ${q(c, "neighbor", "loud") ? "nói to hơn cả loa" : "uống hai chén rồi nói"}: "Chuyện năm xưa, tôi biết hết đấy." Cả mâm ngừng đũa. Bạn có đúng một hơi thở trước khi mọi người quay sang.`,
      [C("Nhận hết, trước cả mâm", { custom: "confess_hook", rel: -10, happy: -8, agency: 0.03, flags: ["tl_confessed"], log: "Bạn kể. Có người bỏ đũa đi về. Có người rót cho bạn một chén." }, "Mất mặt một lần, nhẹ một đời", { tier: "awakened", longterm: true }),
        C("Cười, bảo say rồi", { gamble: { p: 0.5, win: { log: "Mọi người cười theo. Chuyện trôi qua, lần này." }, lose: { custom: "explode_hook", rel: -15, close_doors: ["village_trust"], log: `${N(holder)} không say. Người ấy kể hết, có cả ngày tháng.` } } }, "Có thể thoát, có thể nổ to hơn"),
        C(`Kéo ${N(holder)} ra sân, điều đình`, { money: -0.6, trust: { npc: holder, delta: 0.1 }, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [2, 8], note: `mua sự im lặng của ${N(holder)} ở đám giỗ`, known_by: [holder] }, log: "Hai người đứng sau chuồng gà mười phút. Quay vào, ai cũng vui vẻ, trừ bạn." }, "Im, bằng tiền, thêm một bí mật")], 0, { npc: holder });
  }, { spec: 6 }),

  fate("ft_patron", "lon", [18, 42], (c) => (!!role(c, "mentor") || !!role(c, "first_boss")) && c.know >= 35, (c, N) => {
    const m = role(c, "mentor") ?? role(c, "first_boss")!;
    return T("Chiếc chìa khóa trên bàn", `${N(m)} đặt một chiếc chìa khóa lên bàn: "${f(c, "own_business") ? "Xưởng bên kia sông" : "Căn phòng trên tầng hai"} là của cậu, nếu cậu đi với tôi năm năm. Không hỏi, không kể với ai." ${q(c, "first_boss", "proverb") ? `Rồi câu cửa miệng: "Làm ăn là phải biết im."` : "Ngoài cửa sổ, mưa."} Chìa khóa còn ấm.`,
      [C("Cầm chìa khóa", { game: { npc: m, move: "cooperate", stake_frac: 0.6 }, income_mult: 1.4, promise: { to: m, what: "đi cùng năm năm", years: 5 }, flags: ["tl_patroned"], log: "Bạn cầm chìa khóa" }, "Lên nhanh, buộc năm năm", { longterm: true }),
        C("Cầm, rồi tự mở lối riêng", { game: { npc: m, move: "defect", stake_frac: 0.6 }, income_mult: 1.2, flags: ["startup", "tl_betrayed_patron"], log: "Bạn nhận rồi ra riêng" }, "Tự do, và một người không quên"),
        C("Đòi giấy trắng mực đen", { game: { npc: m, move: "arbitrage", stake_frac: 0.6 }, income_mult: 1.25, flags: ["tl_patron_contract"], log: "Bạn đòi hợp đồng" }, "Lựa chọn thứ ba: nhận ơn có điều kiện", { tier: "sovereign" }),
        C("Để chìa khóa lại", { flags: ["tl_refused_patron"], trust: { npc: m, delta: -0.1 }, log: "Bạn đẩy chìa khóa về phía ông ấy. Ông không cầm lại ngay." }, "Giữ mình, mất một cánh cửa")], 0, { npc: m });
  }),

  fate("ft_estate_split", "lon", [25, 70], (c) => f(c, "parent_died") && !!role(c, "sibling") && !f(c, "estate_done"), (c, N) => {
    const sib = role(c, "sibling")!, late = q(c, "sibling", "late");
    return T("Chia nhà: ai giữ bàn thờ", `Căn nhà bố mẹ để lại có một gian và một bàn thờ. ${N(sib)} ${late ? `đến muộn nửa tiếng, ${nth(gag(c, "sibling_late"))} trong tháng này, ` : ""}ngồi xuống và nói: "Ai giữ bàn thờ thì giữ nhà. Em/anh giữ." Họ hàng ngồi quanh, ai cũng có ý kiến, không ai có giấy tờ. ${shadowLine(c, "sibling", N(sib), 0)}`,
      [C("Chia đôi, bán đi", { game: { npc: sib, move: "cooperate", stake_frac: 1 }, flags: ["estate_done", "land_sold"], log: "Hai anh em đồng ý bán" }, "Mỗi người một nửa, mất căn nhà", { longterm: true }),
        C("Giữ nhà, trả phần kia bằng lời hứa", { game: { npc: sib, move: "defect", stake_frac: 1 }, flags: ["estate_done", "heir"], buy: { kind: "house", name: "nhà bố mẹ để lại", price: 0.01 }, close_doors: ["family_table"], log: "Bạn giữ nhà" }, "Có nhà, mất mâm cơm chung"),
        C("Mời công chứng, chia theo giấy", { game: { npc: sib, move: "arbitrage", stake_frac: 1 }, flags: ["estate_done"], bw: -8, log: "Bạn mời người thứ ba" }, "Lựa chọn thứ ba: luật thay tình", { tier: "sovereign" }),
        C(`Nhường hết cho ${N(sib)}`, { flags: ["estate_done"], close_doors: ["inheritance"], rel: 8, memory: { npc: sib, tag: "HELPED_IN_CRISIS", weight: 0.6, note: "nhường cả nhà bố mẹ" }, log: `Bạn ký. ${N(sib)} khóc. Họ hàng xì xào bạn dại.` }, "Mất phần, được người", { tier: "awakened" })],
      0, { npc: sib, matrix: pd(N(sib), "Chia đều", "Giữ phần") });
  }, { spec: 6, causes: () => [prov.flag("parent_died")] }),

  fate("ft_layoff", "lon", [20, 58], (c) => c.has_job && !f(c, "own_business"), (c, N) => {
    const bo = role(c, "first_boss");
    return T("Cái thùng giấy trên bàn", `Sáng thứ hai, mỗi bàn có một cái thùng giấy. ${bo ? `${N(bo)} ${q(c, "first_boss", "family") ? `nói câu quen thuộc: "Công ty như gia đình." Rồi: "Gia đình phải cắt giảm."` : `đọc tên. Tên bạn ở dòng thứ ba.`}` : "Quản lý đọc tên. Tên bạn ở dòng thứ ba."} Bạn có đến chiều để dọn, và hai tháng lương.`,
      [C("Mở quán bằng hai tháng lương", { custom: "job_switch:market|borrow:0.5", flags: ["own_business", "tl_bootstrapped"], money: -0.3, log: "Bạn thuê mặt tiền ba mét, tự sơn biển." }, "Tự làm chủ, nợ nhỏ, không chắc gì"),
        C("Lên thành phố tìm việc", { custom: "move_city|job_lose", flags: ["tl_uprooted"], log: "Bạn xếp cái thùng giấy vào cốp xe đò." }, "Việc có thể có, quê thì xa"),
        C("Đi học lại một nghề khác", { custom: "study|job_lose", flags: ["tl_retrained"], log: "Bạn ngồi lớp với người kém mình mười tuổi." }, "Hai năm chậm, một nghề mới", { longterm: true }),
        ...(c.poor_country && c.age <= 48 && !c.migrated ? [C("Đi xuất khẩu lao động", { custom: "migrate_now", flags: ["tl_uprooted"], log: "Bạn nộp hồ sơ trong tuần." }, "Một nước khác, gửi tiền về")] : []),
        ...(bo ? [C("Ở lại, làm không lương ba tháng để giữ chỗ", { income_mult: 0.85, trust: { npc: bo, delta: 0.3 }, memory: { npc: bo, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: "ở lại lúc công ty cắt giảm" }, flags: ["tl_loyal_worker"], log: "Bạn ở lại. Lương về sau không bằng trước." }, "Giữ chỗ, mất giá")] : [])], 0);
  }),

  fate("ft_migrate_offer", "lon", [18, 45], (c) => c.poor_country && !c.migrated, (c, N) => {
    const sib = role(c, "sibling");
    return T("Tấm vé có tên một người", `Người bà con ở nước ngoài gửi về một suất bảo lãnh. Chỉ một. Thư ghi tên bạn, nhưng ${sib ? `${N(sib)} đứng sau lưng bạn khi bạn đọc` : "mẹ bạn đọc trước bạn"}. Hạn nộp: mười ngày.`,
      [C("Đi", { custom: "migrate_now", flags: ["tl_uprooted"], ...(sib ? { memory: { npc: sib, tag: "REFUSED_HELP", weight: -0.25, note: "lấy suất đi nước ngoài" } } : {}), log: "Bạn nộp hồ sơ ngày thứ chín." }, "Một đời khác, xa"),
        ...(sib ? [C(`Nhường suất cho ${N(sib)}`, { memory: { npc: sib, tag: "HELPED_IN_CRISIS", weight: 0.6, note: "nhường suất đi nước ngoài" }, flags: ["tl_gave_ticket"], promise: { to: sib, what: "gửi tiền về cho nhà", years: 3 }, money: 0.3, log: `${N(sib)} đi. Năm sau tiền về đều, và ảnh chụp ở một nơi tuyết trắng.` }, "Ở lại, được một người mang ơn", { longterm: true })] : []),
        C("Bán suất", { money: 1.2, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 10], note: "bán suất bảo lãnh cho người khác" }, flags: ["tl_sold_ticket"], log: "Có người trả bằng một năm thu nhập để mang tên bạn đi." }, "Tiền ngay, giấy giả treo trên đầu")], 0);
  }),

  fate("ft_child_crisis", "lon", [26, 62], (c) => !!role(c, "child") && c.kids_alive > 0, (c, N) => {
    const kid = role(c, "child")!;
    return T("Cô giáo gọi lúc đang ăn cơm", `Điện thoại reo giữa bữa. Cô giáo: "${N(kid)} ${c.kids_teen ? "bỏ học ba tuần rồi, anh chị không biết sao?" : "ngã ở sân, đang ở viện."}" Bạn nhìn cái ghế trống, và cái cặp vẫn treo ở cửa mỗi sáng.`,
      [C("Dốc hết cho con", { money: -0.9, custom: c.savings < 0.5 * c.income ? "borrow:0.6" : "", flags: ["tl_child_first"], memory: { npc: kid, tag: "HELPED_IN_CRISIS", weight: 0.5, note: "bỏ hết mọi thứ khi con gặp chuyện" }, support: { who: "kids", level: "hau" }, log: "Bạn nghỉ việc hai tháng. Tiền hết, nhưng cái cặp lại đi học." }, "Con trước, mọi thứ sau", { longterm: true }),
        C("Đưa con về quê cho ông bà", { rel: -4, happy: -6, flags: ["tl_child_sent_home"], trust: { npc: kid, delta: -0.3 }, support: { who: "kids", level: "it" }, log: "Xe đò sáng sớm. Đứa nhỏ không ngoái lại." }, "Giữ việc, mất một phần con"),
        C("Nghiêm, không nhượng", { trust: { npc: kid, delta: -0.4 }, memory: { npc: kid, tag: "HUMILIATED_ME", weight: -0.35, note: "mắng giữa sân trường" }, flags: ["tl_strict_parent"], happy: -5, gamble: { p: 0.5, win: { log: "Đứa nhỏ ghét bạn một năm, rồi đỗ." }, lose: { log: "Đứa nhỏ bỏ đi ba ngày. Khi về, nó không kể đã ở đâu." } } }, "Có thể nên người, có thể mất lòng")], 0, { npc: kid });
  }),

  fate("ft_divorce", "lon", [25, 62], (c) => c.married && !!role(c, "spouse"), (c, N) => {
    const sp = role(c, "spouse")!;
    return T("Cái va li đã xếp sẵn ở góc phòng", `Bạn về, thấy cái va li đã xếp sẵn ở góc phòng. ${N(sp)} ngồi ở mép giường: "Nói đi. Một lý do để ở lại." Ngoài phòng, ${c.kids_alive ? "đứa nhỏ đang xem ti vi, mở to hơn bình thường" : "hàng xóm bật nhạc"}.`,
      [C("Không có lý do nào. Chia tay.", { custom: "spouse_leave", money: -0.5, happy: -10, flags: ["tl_divorced"], log: "Va li đi trước. Giấy tờ đi sau, mất sáu tháng." }, "Hai đời riêng"),
        C("Nói một lý do thật, và hứa", { promise: { to: sp, what: "về ăn cơm mỗi tối", years: 2 }, happy: -4, trust: { npc: sp, delta: 0.2 }, flags: ["tl_marriage_mended"], log: "Va li quay lại tủ. Lời hứa thì treo ở cửa." }, "Giữ nhà bằng một lời hứa có hạn", { longterm: true }),
        C("Ở riêng một năm, không ly hôn", { money: -0.3, happy: 2, flags: ["tl_separated"], custom: "move_city", log: "Hai địa chỉ, một sổ hộ khẩu. Mỗi cuối tuần một bữa cơm." }, "Lựa chọn thứ ba: không ở, không bỏ", { tier: "awakened" })], 0, { npc: sp });
  }),

  fate("ft_land_dispute", "lon", [22, 65], (c) => !!role(c, "neighbor") && (c.home_owner || c.farmer || c.owns.has("land")), (c, N) => {
    const nb = role(c, "neighbor")!;
    return T("Hàng rào dịch vào ba mươi phân", `Sáng ra, hàng rào nhà ${N(nb)} đã dịch vào đất bạn ba mươi phân. ${q(c, "neighbor", "knows") ? `${N(nb)} đứng đó, nói trước khi bạn kịp mở miệng: "Tôi biết cậu định nói gì."` : `${N(nb)} tưới cây như không có gì.`} Ba mươi phân, dài hai mươi mét. ${shadowLine(c, "neighbor", N(nb), 0)}`,
      [C("Ngồi uống nước, chia đôi phần tranh chấp", { game: { npc: nb, move: "cooperate", stake_frac: 0.4 }, log: "Bạn nói chuyện tử tế" }, "Mất mười lăm phân, giữ hàng xóm", { longterm: true }),
        C("Đêm sau dịch hàng rào lại, thêm ba mươi phân", { game: { npc: nb, move: "defect", stake_frac: 0.4 }, memory: { npc: nb, tag: "TOOK_MY_LAND", weight: -0.5, note: "dịch hàng rào lấn sang" }, close_doors: ["village_trust"], flags: ["tl_fence_war"], log: "Bạn dịch hàng rào" }, "Được đất, cả xóm biết"),
        C("Mời địa chính ra đo", { game: { npc: nb, move: "arbitrage", stake_frac: 0.4 }, money: -0.1, log: "Bạn mời người đo" }, "Lựa chọn thứ ba: để cái thước nói", { tier: "sovereign" })], 0, { npc: nb, matrix: pd(N(nb), "Chia", "Lấn") });
  }),

  fate("ft_epidemic", "lon", [10, 80], () => true, (c, N) => {
    const nb = role(c, "neighbor"), kid = c.age < 18;
    return T("Phố đóng cửa, loa đọc tên từng nhà", `Dịch về. Phố đóng cửa, loa phường đọc tên từng nhà có người ho. ${nb ? `${N(nb)} ${q(c, "neighbor", "loud") ? "đứng ở ban công đọc lại cho những ai chưa nghe rõ" : "để một túi gạo trước cửa, gõ hai tiếng rồi đi"}.` : ""} ${kid ? "Trường nghỉ không biết đến bao giờ." : c.has_job ? "Chỗ làm nói: ai nghỉ thì không có lương." : "Chợ đóng."}`,
      kid ? [C("Ở nhà, học qua cái điện thoại cũ", { know: -3, happy: -4, flags: ["tl_pandemic_kid"], log: "Màn hình nứt, mạng chập chờn. Bạn thuộc bài bằng cách đọc to." }, "An toàn, chậm một nhịp"),
        C("Đi phụ việc nhà", { health: -6, know: -6, money: 0.04, rel: 4, flags: ["child_labor"], log: "Bạn gánh nước, bán rau, biết giá từng thứ trong chợ." }, "Mất học, được đời")]
      : [C("Đóng cửa ở nhà", { money: -0.4, income_mult: 0.9, flags: ["tl_locked_down"], happy: -5, log: "Bốn tháng trong ba mươi mét vuông." }, "An toàn, nghèo đi"),
        C("Vẫn đi làm", { gamble: { p: 0.65, win: { money: 0.15, log: "Bạn đi làm xuyên dịch, lĩnh lương đủ, và ho suốt mùa đông." }, lose: { health: -22, money: -0.5, log: "Bạn nhiễm, nằm viện ba tuần, chỗ làm thay người." } } }, "Giữ lương, cược phổi"),
        C("Đi tình nguyện chở hàng", { health: -8, rel: 10, flags: ["leader", "tl_volunteer"], ...(nb ? { memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.4, note: "chở hàng cứu trợ mùa dịch" } } : {}), log: "Cả mùa dịch bạn ngủ trên xe tải." }, "Mất sức, được người", { longterm: true })], 0);
  }),

  fate("ft_calling", "lon", [20, 55], (c) => c.happy < 45 || c.crises_survived > 0, (c) => T("Tiếng chuông lúc bốn giờ sáng",
    `Một đêm không ngủ, bạn đi bộ ra ${vn(c) ? "chùa" : "nhà nguyện"} đầu làng lúc bốn giờ sáng. Tiếng chuông. Một người già quét sân, không hỏi gì, đưa bạn cái chổi thứ hai. Bạn quét đến sáng, và lần đầu sau nhiều năm, đầu bạn im.`,
    [C("Ở lại, xuống tóc", { custom: "become:monk", flags: ["tl_renounced"], ...(c.married ? { custom: "become:monk|spouse_leave" } : {}), happy: 12, log: "Bạn gửi lại điện thoại cho người nhà." }, "Buông hết, kể cả người"),
      C("Về, nhưng sống khác", { lifestyle: "tan_tien", happy: 6, agency: 0.03, flags: ["tl_ascetic"], counters: { read: 3 }, log: "Bạn về trước giờ đi làm. Từ đó mỗi sáng bạn quét sân nhà mình." }, "Đổi cách sống, không đổi nơi", { tier: "awakened" }),
      C("Về, và quên", { flags: ["tl_ignored_call"], log: "Bạn ngủ bù đến trưa. Chiều lại như mọi chiều." }, "Không gì đổi, lúc này")], 0)),

  fate("ft_parent_care", "lon", [30, 66], (c) => c.parent_sick && (!!role(c, "mother") || !!role(c, "father")), (c, N) => {
    const pa = role(c, "mother") ?? role(c, "father")!, sib = role(c, "sibling");
    return T("Cái giường kê ở phòng khách", `${N(pa)} không tự đi được nữa. ${sib ? `${N(sib)} gọi điện: "Em/anh bận. Anh/em lo đi." Rồi tắt máy.` : "Không còn ai khác."} Cái giường phải kê ở phòng khách, cạnh ti vi, cạnh bàn ăn, cạnh mọi thứ.`,
      [C("Đón về, tự chăm", { flags: ["carer"], income_mult: 0.8, health: -6, happy: -4, trust: { npc: pa, delta: 0.4 }, log: "Bạn học cách bế một người lớn. Đêm nào cũng dậy hai lần." }, "Giữ chữ hiếu, mất một phần đời", { longterm: true }),
        C("Thuê người, trả bằng lương", { money: -1, support: { who: "parents", level: "hau" }, flags: ["tl_paid_care"], log: "Người giúp việc gọi bạn là anh/chị. Bố mẹ gọi tên người giúp việc nhiều hơn tên bạn." }, "Giữ việc, trả tiền"),
        ...(sib ? [C(`Ép ${N(sib)} chia việc`, { game: { npc: sib, move: "arbitrage", stake_frac: 0.5 }, flags: ["carer"], income_mult: 0.9, log: "Bạn đòi chia lịch" }, "Lựa chọn thứ ba: hiếu là của chung", { tier: "sovereign" }),
          C(`Để ${N(sib)} lo`, { memory: { npc: sib, tag: "REFUSED_HELP", weight: -0.5, note: "bỏ bố mẹ cho anh em chăm" }, close_doors: ["family_table"], trust: { npc: pa, delta: -0.3 }, flags: ["tl_left_parent"], log: `${N(sib)} lo. Và ${N(sib)} nhớ.` }, "Giữ đời mình, mất anh em")] : [])], 0, { npc: pa });
  }),

  fate("ft_loan_shark", "lon", [20, 66], (c) => c.debt_ratio > 1.5 || f(c, "tl_debtor"), (c, N) => {
    const cr = role(c, "creditor"), sib = role(c, "sibling");
    return T("Sơn đỏ trên cửa", `Sáng ra cửa nhà bạn có một chữ bằng sơn đỏ. ${cr ? `${N(cr)} đứng bên kia đường, không đến gần, chỉ giơ ba ngón tay: ba ngày.` : "Tin nhắn: ba ngày."} ${c.kids_alive ? "Đứa nhỏ hỏi chữ gì. Bạn nói chữ phúc." : "Hàng xóm đi qua, nhìn, không hỏi."}`,
      [C("Cơ cấu lại nợ, ký thêm giấy", { custom: "restructure", flags: ["tl_restructured"], bw: -8, log: "Bạn ký một tờ giấy dài hơn tờ cũ." }, "Thở được, nợ dài hơn"),
        C("Bán thứ cuối cùng", { ...(c.owns.has("house") ? { sell: { kind: "house" } } : c.owns.has("vehicle") ? { sell: { kind: "vehicle" } } : c.owns.has("land") ? { sell: { kind: "land" } } : { money: -0.4 }), custom: "repay:1.5", flags: ["land_sold", "tl_sold_out"], log: "Bạn bán. Chữ sơn đỏ được cạo đi." }, "Sạch nợ, trắng tay"),
        C("Trốn đi đêm nay", { custom: "move_city", flags: ["tl_fugitive", "left_home"], close_doors: ["return_home", "clean_record"], log: "Bạn đi bằng cửa sau." }, "Không trả, không về"),
        ...(sib ? [C(`Quỳ xin ${N(sib)}`, { game: { npc: sib, move: "cooperate", stake_frac: 0.8 }, rel: -3, log: "Bạn xin anh em cứu" }, "Có thể được cứu, mang nợ ân tình")] : [])], 0);
  }),

  fate("ft_strike", "lon", [20, 58], (c) => c.worker && c.has_job, (c, N) => {
    const fr = role(c, "childhood_friend"), bo = role(c, "first_boss");
    return T("Máy tắt lúc tám giờ", `Tám giờ sáng, ai đó tắt cầu dao. Năm trăm công nhân đứng ở sân. ${fr ? `${N(fr)} ${q(c, "childhood_friend", "scheme") ? `nói nhỏ: "Có kế hoạch. Tao có kế hoạch."` : "cầm cái loa pin, đưa cho bạn."}` : "Người ta đưa cái loa cho bạn."} ${bo ? `${N(bo)} đứng ở cửa văn phòng, ghi tên.` : "Quản lý đứng ở cửa, ghi tên."}`,
      [C("Cầm loa", { flags: ["leader", "tl_union"], rel: 8, gamble: { p: 0.5, win: { income_mult: 1.2, log: "Ba ngày sau nhà máy nhượng bộ. Lương tăng, và tên bạn ở đầu danh sách." }, lose: { custom: "job_lose", close_doors: ["partner_circle"], log: "Nhà máy sa thải mười người. Bạn là người đầu tiên." } } }, "Có thể đổi đời cả xưởng, có thể mất việc", { longterm: true }),
        C("Đứng ở hàng sau", { rel: -5, ...(fr ? { memory: { npc: fr, tag: "REFUSED_HELP", weight: -0.3, note: "đứng ngoài cuộc đình công" } } : {}), flags: ["tl_bystander"], log: "Bạn đứng xa cái loa. Cầu dao bật lại chiều đó." }, "Giữ việc, mất bạn"),
        ...(bo ? [C("Vào văn phòng, làm người thương lượng", { game: { npc: bo, move: "arbitrage", stake_frac: 0.5 }, flags: ["leader", "tl_mediator"], log: "Bạn đứng giữa" }, "Lựa chọn thứ ba: không bên nào, cả hai bên nhớ", { tier: "sovereign" })] : [])], 0);
  }),

  fate("ft_scholarship", "lon", [14, 22], (c) => (c.in_school || c.know >= 40) && !c.migrated, (c, N) => {
    const mo = role(c, "mother"), fr = role(c, "childhood_friend");
    return T("Phong bì có dấu nước ngoài", `Một phong bì có con dấu nước ngoài. Học bổng toàn phần, ${c.poor_country ? "cả vé máy bay" : "ở một thành phố bạn chỉ thấy trên bản đồ"}. Phải trả lời trong bảy ngày. ${mo ? `${N(mo)} ${q(c, "mother", "food") ? "đã bắt đầu gói đồ ăn khô cho bạn trước cả khi bạn quyết định" : "cầm phong bì đọc ba lần, không nói gì"}.` : ""} ${fr ? `${N(fr)} cũng nộp, và không được.` : ""}`,
      [C("Đi", { custom: c.age >= 18 ? "migrate_now" : "scholar", flags: ["tl_scholar_abroad", "left_home"], know: 10, ...(fr ? { memory: { npc: fr, tag: "GOSSIP_HEARD_GOOD", weight: 0.1, note: "đi du học, bỏ lại bạn cũ" } } : {}), log: "Ngày đi, sân bay không có ai quen ngoài gia đình." }, "Một đời ở nơi khác"),
        C("Ở lại, học trong nước", { custom: "scholar", know: 5, rel: 4, flags: ["tl_stayed_scholar"], log: "Bạn trả lời không. Phong bì được cất vào ngăn tủ cùng giấy khai sinh." }, "Gần nhà, xa đời"),
        ...(fr ? [C(`Nhường suất cho ${N(fr)}`, { memory: { npc: fr, tag: "HELPED_IN_CRISIS", weight: 0.7, note: "nhường học bổng" }, flags: ["tl_gave_scholarship"], happy: -4, know: 2, log: `${N(fr)} đi. Mỗi năm gửi về một tấm bưu thiếp.` }, "Mất cơ hội, được một người suốt đời", { tier: "awakened" })] : [])], 0);
  }),

  fate("ft_eviction", "lon", [24, 70], (c) => c.home_owner || c.farmer, (c, N) => {
    const of = role(c, "official"), nb = role(c, "neighbor");
    return T("Bản đồ quy hoạch có một vệt màu đỏ", `${of ? N(of) : "Cán bộ"} trải bản đồ ra bàn. Một vệt màu đỏ đi qua đúng chỗ ${c.farmer ? "mảnh ruộng" : "căn nhà"} của bạn. "Đền bù theo khung. Ký trong tháng thì có thêm phần thưởng." ${nb ? `${N(nb)} ${q(c, "neighbor", "knows") ? "đã ký từ tuần trước, và đã biết giá nhà bạn" : "đứng ngoài cửa sổ nghe"}.` : ""}`,
      [C("Ký, nhận tiền", { money: 1.3, ...(c.home_owner ? { sell: { kind: "house" } } : {}), flags: ["land_sold", "tl_evicted"], custom: "move_city", log: "Tiền về tài khoản trong hai tuần. Máy xúc về sau ba." }, "Có tiền, mất chỗ"),
        C("Không ký. Ở lì.", { health: -8, rel: 6, flags: ["leader", "tl_holdout"], gamble: { p: 0.4, win: { money: 2.2, ...(c.home_owner ? { sell: { kind: "house" } } : {}), flags: ["land_sold"], log: "Hai năm sau họ trả gấp đôi để bạn đi. Bạn đi." }, lose: { money: -0.3, ...(c.home_owner ? { sell: { kind: "house" } } : {}), flags: ["land_sold"], ...(of ? { memory: { npc: of, tag: "HUMILIATED_ME", weight: -0.4, note: "chống quy hoạch" } } : {}), log: "Cưỡng chế lúc năm giờ sáng. Bạn nhận đền bù theo khung, trừ tiền cưỡng chế." } } }, "Có thể gấp đôi, có thể mất hết", { longterm: true }),
        ...(of ? [C("Thương lượng một suất tái định cư tốt", { game: { npc: of, move: "arbitrage", stake_frac: 0.6 }, ...(c.home_owner ? { sell: { kind: "house" } } : {}), flags: ["land_sold"], bw: -8, log: "Bạn đòi suất tái định cư" }, "Lựa chọn thứ ba: không ở lì, không ký trắng", { tier: "sovereign" })] : [])], 0);
  }),

  fate("ft_family_ruin", "lon", [7, 15], (c) => c.family_wealth < 0.6 && (!!role(c, "mother") || !!role(c, "father")), (c, N) => {
    const pa = role(c, "father") ?? role(c, "mother")!, sib = role(c, "sibling");
    return T("Cái xe máy không còn ở sân", `Sáng ra cái xe máy không còn ở sân. ${N(pa)} ngồi ở bậc cửa, hút thuốc, ${q(c, "father", "silent") ? "không nói gì, như mọi khi, nhưng lần này cái im lặng khác" : "nói: \"Năm nay nhà mình khó.\""}. Tiền học kỳ sau chưa có. ${sib ? `${N(sib)} đã nghỉ học từ tháng trước.` : ""}`,
      [C("Nghỉ học, đi làm phụ", { flags: ["child_labor", "tl_worked_young"], know: -6, money: 0.05, rel: 5, trust: { npc: pa, delta: 0.3 }, log: "Bạn đi bưng bê. Tối về vẫn giở sách, nhưng mắt díp lại." }, "Giữ nhà, mất chữ"),
        C("Xin về ở với họ hàng để học tiếp", { flags: ["left_home", "tl_fostered"], know: 4, rel: -4, happy: -5, log: "Bạn ở gian bếp nhà bác. Ăn sau cùng, học sau cùng." }, "Giữ chữ, mất nhà"),
        C("Đi xin học bổng, gõ cửa từng thầy", { know: 3, bw: -5, flags: ["leader"], gamble: { p: 0.45, win: { custom: "scholar", flags: ["tl_scholar_child"], log: "Một thầy giáo ký bảo lãnh. Bạn học tiếp, miễn phí, và nợ một người." }, lose: { flags: ["child_labor"], know: -3, log: "Không ai ký. Bạn vừa học vừa bán vé số." } } }, "Lựa chọn thứ ba: tự xoay", { tier: "awakened" })], 0, { npc: pa });
  }),

  fate("ft_gang_pull", "lon", [14, 24], (c) => (c.poor_country || f(c, "origin_poor_urban")) && (!!role(c, "bully") || !!role(c, "childhood_friend")), (c, N) => {
    const who = role(c, "bully") ?? role(c, "childhood_friend")!, mo = role(c, "mother");
    return T("Cái xe đẹp hơn cả xe thầy giáo", `${N(who)} dừng xe trước cổng trường, cái xe đẹp hơn cả xe thầy giáo. "Làm với tao. Tuần đầu bằng tháng lương bố mày." Không nói làm gì. Ai cũng biết làm gì. ${mo ? `${N(mo)} ${q(c, "mother", "nag_marry") ? "ở nhà vẫn hỏi bao giờ bạn dẫn ai về" : "ở nhà chờ cơm"}.` : ""}`,
      [C("Lên xe", { flags: ["gang", "tl_gang"], money: 0.05, happy: 5, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [2, 8], note: "đi theo băng từ hồi đi học" }, close_doors: ["clean_record"], ...(mo ? { trust: { npc: mo, delta: -0.3 } } : {}), log: "Bạn lên xe. Năm đó bạn có nhiều tiền hơn cả nhà cộng lại, và một thứ không gỡ ra được." }, "Tiền sớm, án treo trên đầu"),
        C("Từ chối, trước mặt cả cổng trường", { trust: { npc: who, delta: -0.4 }, memory: { npc: who, tag: "HUMILIATED_ME", weight: -0.4, note: "từ chối trước cổng trường" }, flags: ["tl_refused_gang"], rel: 3, log: `${N(who)} cười, rồ ga. "Để rồi xem."` }, "Sạch, và có người ghi nhớ"),
        ...(mo ? [C(`Về kể với ${N(mo)}`, { trust: { npc: mo, delta: 0.3 }, memory: { npc: mo, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: "kể chuyện bị rủ đi theo băng" }, flags: ["tl_told_mother"], custom: "move_city", know: 2, log: `${N(mo)} nghe xong, gửi bạn lên thành phố ở với họ hàng ngay tuần sau.` }, "An toàn, xa nhà")] : [])], 0, { npc: who });
  }),

  fate("ft_succession", "lon", [28, 56], (c) => !!role(c, "first_boss") && c.has_job && !f(c, "own_business"), (c, N) => {
    const bo = role(c, "first_boss")!;
    return T("Ông chủ đưa chùm chìa khóa và một cuốn sổ nợ", `${N(bo)} gọi bạn vào, đưa chùm chìa khóa ${vn(c) ? "cửa hàng" : "xưởng"} và một cuốn sổ. ${q(c, "first_boss", "family") ? `"Công ty như gia đình. Và gia đình thì… có nợ."` : `"Tôi già rồi. Cậu nhận đi."`} Cuốn sổ nợ dày bằng ngón tay. Tài sản thì ở trang cuối.`,
      [C("Nhận cả chìa khóa lẫn sổ nợ", { game: { npc: bo, move: "cooperate", stake_frac: 0.9 }, custom: "job_switch:market|borrow:1", flags: ["own_business", "tl_heir_business"], log: "Bạn nhận cả hai" }, "Làm chủ, gánh nợ người khác", { longterm: true }),
        C("Nhận chìa khóa, trả sổ nợ lại", { game: { npc: bo, move: "defect", stake_frac: 0.9 }, custom: "job_switch:market", flags: ["own_business", "tl_cut_old_boss"], log: "Bạn nhận tiệm, không nhận nợ" }, "Có tiệm, mất người cho tiệm"),
        C("Kiểm toán trước, nhận sau", { game: { npc: bo, move: "arbitrage", stake_frac: 0.9 }, bw: -10, custom: "job_switch:market", flags: ["own_business"], log: "Bạn mời người xem sổ" }, "Lựa chọn thứ ba: nhận có điều kiện", { tier: "sovereign" }),
        C("Từ chối, đi tìm việc khác", { custom: "job_lose", trust: { npc: bo, delta: -0.2 }, flags: ["tl_refused_succession"], log: "Bạn đặt chùm chìa khóa xuống. Tháng sau tiệm sang tên người khác." }, "Nhẹ, và bắt đầu lại")], 0, { npc: bo });
  }),

  /* ============================================================ LỚN · SITCOM ============================================================ */
  fate("ft_tet_tables", "lon", [24, 60], (c) => c.married && !!role(c, "spouse") && (!!role(c, "mother") || !!role(c, "father")), (c, N) => {
    const sp = role(c, "spouse")!, mo = role(c, "mother") ?? role(c, "father")!;
    return T(vn(c) ? "Hai mâm cơm Tết, một cái xe" : "Hai bàn tiệc năm mới, một cái xe", `${N(mo)} gọi: "Năm nay con về nhà ăn ${vn(c) ? "Tết" : "lễ"} chứ? Mẹ làm ${vn(c) ? "bánh" : "gà"} rồi." Năm phút sau, mẹ ${N(sp)} gọi: "Năm nay về bên này chứ? Bố gọi cả họ rồi." Hai nhà cách nhau ba trăm cây số. Một cái xe. ${q(c, "mother", "food") ? `${N(mo)} nói thêm: "Mẹ gói sẵn đồ ăn cho cả nhà bên ấy, mang sang hộ."` : `${N(sp)} nhìn bạn: "Anh/em quyết đi."`}`,
      [C("Về nhà mình", { trust: { npc: mo, delta: 0.3 }, memory: { npc: sp, tag: "HUMILIATED_ME", weight: -0.35, note: "Tết đầu không về nhà ngoại" }, flags: ["tl_tet_mine"], log: `Bên nhà ${N(sp)} nhắc chuyện này mỗi Tết trong mười năm.` }, "Mẹ vui, nhà vợ/chồng nhớ mười năm"),
        C("Về nhà bên kia", { trust: { npc: sp, delta: 0.3 }, memory: { npc: mo, tag: "REFUSED_HELP", weight: -0.3, note: "Tết đầu không về nhà mẹ" }, flags: ["tl_tet_inlaw"], log: `${N(mo)} nói "không sao", bằng cái giọng có sao.` }, "Vợ/chồng vui, mẹ có một chuyện để nhắc"),
        C("Hai ngày mỗi nhà, chạy xe xuyên đêm", { health: -8, money: -0.15, happy: 4, flags: ["tl_tet_both"], gamble: { p: 0.6, win: { rel: 6, log: "Bạn ăn hai bữa tất niên cách nhau sáu tiếng. Không ai giận. Bạn ngủ gật ở bàn thờ." }, lose: { health: -10, money: -0.3, log: "Xe hỏng giữa đường lúc hai giờ sáng. Cả hai nhà đều không có bạn lúc giao thừa." } } }, "Làm vừa lòng cả hai, bằng sức"),
        C("Mời cả hai nhà về nhà mình", { money: -0.5, bw: -10, flags: ["leader", "tl_host_tet"], gamble: { p: 0.5, win: { rel: 10, trust: { npc: mo, delta: 0.2 }, log: "Hai ông bố uống với nhau đến hai giờ sáng và phát hiện ra cùng quê gốc." }, lose: { rel: -6, log: "Hai bà mẹ tranh nhau bếp. Bữa cơm có hai nồi canh cùng một món." } } }, "Lựa chọn thứ ba: một mâm, hai họ", { tier: "sovereign" })], 0, { npc: sp });
  }),

  fate("ft_wedding_chaos", "lon", [20, 40], (c) => !c.married && (!!role(c, "sibling") || !!role(c, "neighbor")), (c, N) => {
    const sib = role(c, "sibling"), nb = role(c, "neighbor");
    return T("Đám cưới có hai chú rể/cô dâu", `Nhà hàng xếp nhầm: đám cưới của bạn và một đám khác cùng tên cô dâu/chú rể, cùng giờ, cùng sảnh. ${sib ? `${N(sib)} ${q(c, "sibling", "late") ? `đến muộn (${nth(gag(c, "sibling_late"))} trong đời bạn), ` : ""}đứng nhầm sảnh, bắt tay nhầm thông gia.` : ""} ${nb ? `${N(nb)} ${q(c, "neighbor", "knows") ? "đã biết trước và không nói, để xem" : "chụp ảnh đăng lên nhóm xóm"}.` : ""} Người nhà bên kia nói: "Hay là gộp luôn?"`,
      [C("Gộp. Cưới chung sảnh.", { custom: "marry", money: 0.2, rel: 8, flags: ["tl_double_wedding"], log: "Hai đám cưới thành một. Tiền mừng lẫn nhau, chia đôi, hòa cả làng. Bạn có thêm một họ hàng không máu mủ." }, "Cưới, rẻ, và một gia đình lạ"),
        C("Đòi sảnh, hoãn đám kia", { custom: "marry", money: -0.3, rel: -6, flags: ["tl_wedding_fight"], ...(nb ? { memory: { npc: nb, tag: "GOSSIP_HEARD_BAD", weight: -0.2, note: "cãi nhau ở đám cưới, cả xóm xem" } } : {}), log: "Bạn cưới đúng sảnh, đúng giờ, và đám kia đứng ngoài cổng quay phim." }, "Đúng ý, mất lòng cả xóm"),
        C("Hoãn cưới, đi đăng ký trước", { happy: -3, money: 0.4, flags: ["tl_postponed_wedding"], later: { years: 1, note: "đám cưới hoãn, năm sau làm lại" }, log: "Hai người ra phường ký giấy, ăn một bát phở. Tiệc để sang năm, hoặc không bao giờ." }, "Tiết kiệm, và một năm chờ", { tier: "awakened" })], 0);
  }),

  fate("ft_funeral_env", "lon", [25, 68], (c) => !!role(c, "neighbor") && (!!role(c, "sibling") || !!role(c, "childhood_friend")), (c, N) => {
    const nb = role(c, "neighbor")!, other = role(c, "sibling") ?? role(c, "childhood_friend")!;
    return T("Phong bì đám ma, nhầm tên", `Ở đám tang ông cụ xóm, bạn bỏ phong bì vào thùng. Về nhà mới nhớ: đó là phong bì tiền ${c.has_job ? "lương" : "bán hàng"} cả tháng, còn phong bì phúng thì trong túi áo. ${N(nb)} ${q(c, "neighbor", "knows") ? `gọi sang: "Tôi biết rồi. Nhà cậu bỏ to lắm. Cả xóm biết rồi."` : "khen bạn hào phóng trước cả xóm."} ${N(other)} cười chảy nước mắt.`,
      [C("Đến xin lại, nói thật", { rel: -8, money: 0.9, flags: ["tl_asked_back"], memory: { npc: nb, tag: "HUMILIATED_ME", weight: -0.25, note: "đòi lại phong bì đám ma" }, log: "Gia chủ trả, trước mặt mười người. Từ đó xóm gọi bạn là người đòi phong bì." }, "Giữ tiền, mất mặt một đời"),
        C("Coi như phúng thật", { money: -0.9, rel: 10, flags: ["tl_big_envelope", "leader"], memory: { npc: nb, tag: "GOSSIP_HEARD_GOOD", weight: 0.4, note: "phúng viếng hậu hĩnh ông cụ xóm" }, log: "Cả xóm nhớ bạn là người tử tế. Tháng đó nhà bạn ăn mì gói." }, "Mất một tháng, được một tiếng"),
        C(`Nhờ ${N(other)} đổi lại hộ, kín đáo`, { money: 0.5, trust: { npc: other, delta: 0.2 }, gamble: { p: 0.5, win: { log: `${N(other)} đổi được, ăn mất một nửa gọi là công.` }, lose: { rel: -10, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.25, fuse_years: [1, 5], note: "lén đổi phong bì ở đám tang" }, log: `${N(other)} bị bắt gặp đang lục thùng phúng. Chuyện này còn kể đến mùng ba Tết.` } } }, "Có thể êm, có thể thành giai thoại")], 0, { npc: nb });
  }),

  fate("ft_lie_snowball", "lon", [20, 55], (c) => c.has_job && (!!role(c, "first_boss") || !!role(c, "childhood_friend")), (c, N) => {
    const bo = role(c, "first_boss"), fr = role(c, "childhood_friend");
    return T("Bạn nói ốm, rồi lên ti vi", `Bạn xin nghỉ ốm để đi ${fr ? `đám cưới ${N(fr)}` : "xem bóng đá"}. Đúng lúc camera quét qua, bạn đang nhảy trên bàn. Tối đó ${bo ? N(bo) : "sếp"} gửi một ảnh chụp màn hình, không có chữ nào. ${fr && q(c, "childhood_friend", "scheme") ? `${N(fr)} nhắn: "Tao có kế hoạch."` : "Sáng mai là họp cả phòng."}`,
      [C("Nhận, xin lỗi", { income_mult: 0.9, agency: 0.02, flags: ["tl_owned_up"], ...(bo ? { trust: { npc: bo, delta: 0.1 } } : {}), log: "Bạn đứng dậy giữa cuộc họp. Cả phòng cười, kể cả sếp. Thưởng năm đó không có." }, "Mất thưởng, giữ mặt"),
        C("Bịa thêm: đó là anh/em sinh đôi", { ...cliff("tl_wait_lie", "ft_lie_echo", 1), happy: 3, flags: ["tl_twin_lie"], log: "Cả phòng tin. Hoặc giả vờ tin. Từ đó bạn có một người anh/em sinh đôi phải duy trì." }, "Thoát hôm nay, nuôi một người không có thật"),
        C("Nghỉ luôn, cho đỡ phải nhìn mặt", { custom: "job_lose", flags: ["tl_quit_shame"], happy: -4, log: "Bạn nộp đơn trước khi họp. Ảnh chụp màn hình ấy đi theo bạn sang chỗ làm mới." }, "Không mặt mũi, không việc")], 0);
  }),

  fate("ft_stamp", "lon", [22, 65], (c) => !!role(c, "official") && (c.home_owner || f(c, "own_business") || c.savings > c.income), (c, N) => {
    const of = role(c, "official")!, n = gag(c, "official_stamp");
    return T("Con dấu để quên ở nhà", `Bạn cần một chữ ký và một con dấu để ${c.home_owner ? "sang tên nhà" : f(c, "own_business") ? "gia hạn giấy phép" : "rút tiền thừa kế"}. ${N(of)} ${q(c, "official", "tea") ? "rót trà, hỏi thăm bố mẹ, hỏi thăm con cái, " : ""}rồi nói: "Hôm nay con dấu tôi để quên ở nhà." ${n ? `Đây là ${nth(n)} bạn nghe câu ấy. ` : ""}Hạn nộp là chiều nay.`,
      [C("Đến tận nhà lấy con dấu", { bw: -8, money: -0.05, rel: 2, flags: ["tl_went_for_stamp"], gamble: { p: 0.6, win: { log: "Vợ/chồng cán bộ mời cơm. Con dấu nằm cạnh lọ muối. Hồ sơ xong lúc sáu giờ tối." }, lose: { money: -0.2, log: "Đến nơi, con dấu lại ở cơ quan. Hồ sơ trễ, mất phí gia hạn." } } }, "Kiên nhẫn, có thể xong"),
        C("Để phong bì dưới chén trà", { money: -0.2, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 10], note: `phong bì dưới chén trà cho ${N(of)}`, known_by: [of] }, trust: { npc: of, delta: 0.2 }, log: "Con dấu hóa ra ở ngăn kéo thứ hai." }, "Xong ngay, thêm một chuyện để bị nắm"),
        C("Hỏi to: 'Thế hôm qua anh đóng dấu cho nhà bên bằng gì?'", { rel: 4, memory: { npc: of, tag: "HUMILIATED_ME", weight: -0.35, note: "hỏi to về con dấu trước cả phòng" }, flags: ["leader"], gamble: { p: 0.5, win: { log: "Cả phòng cười. Con dấu xuất hiện. Từ đó bạn là người không nên đùa." }, lose: { ...(c.home_owner ? { money: -0.3 } : f(c, "own_business") ? { unflags: ["own_business"], custom: "job_lose" } : { money: -0.4 }), log: "Cả phòng im. Hồ sơ của bạn từ đó luôn thiếu một tờ." } } }, "Lựa chọn thứ ba: nói to cái ai cũng biết", { tier: "sovereign" })], 0, { npc: of });
  }),

  fate("ft_neighbor_knows", "lon", [22, 58], (c) => !!role(c, "neighbor") && c.has_job && !f(c, "own_business") && c.savings > 0.3 * c.income, (c, N) => {
    const nb = role(c, "neighbor")!, n = gag(c, "neighbor_knows");
    return T("Cả xóm chúc mừng chuyện bạn chưa làm", `Bạn mới chỉ nghĩ đến chuyện mở ${c.poor_country ? "quán" : "tiệm"}. Sáng nay cả xóm đã chúc mừng. Bà bán rau hỏi khai trương ngày nào. ${N(nb)} ${q(c, "neighbor", "knows") ? `đứng ở hàng rào: "Tôi biết trước cậu mà." ${n ? `${nth(n)} rồi.` : ""}` : "đã đặt chỗ cho cả nhà."} Ông chủ mặt bằng gọi: "Ký không? Có người khác hỏi."`,
      [C("Thôi thì mở thật", { custom: "job_switch:market|borrow:0.6", flags: ["own_business", "tl_pushed_into_business"], money: -0.3, log: "Bạn mở quán vì xóm đã mở hộ. Ngày khai trương đông, vì ai cũng muốn xem có thật không." }, "Làm chủ vì bị đẩy, nợ thật"),
        C("Đính chính trước cả xóm", { rel: -4, memory: { npc: nb, tag: "HUMILIATED_ME", weight: -0.2, note: "bị đính chính trước xóm vụ mở quán" }, flags: ["tl_denied_rumor"], log: `Bạn đi từng nhà nói không có. ${N(nb)} nói: "Thế là chưa, chứ không phải không."` }, "Giữ việc, mất một tiếng hào hứng"),
        C(`Rủ ${N(nb)} hùn luôn, vì đằng nào cũng biết`, { game: { npc: nb, move: "cooperate", stake_frac: 0.5 }, custom: "job_switch:market", flags: ["own_business"], log: "Bạn rủ hàng xóm góp vốn" }, "Lựa chọn thứ ba: biến người biết chuyện thành người chung thuyền", { tier: "sovereign" })], 0, { npc: nb });
  }),

  fate("ft_moto_gag", "lon", [18, 45], (c) => !!role(c, "sibling") && !c.has_job && !c.in_school, (c, N) => {
    const sib = role(c, "sibling")!, n = gag(c, "sibling_moto");
    return T("Xe chết máy đúng hôm phỏng vấn", `${N(sib)} chở bạn đi phỏng vấn việc làm đầu tiên. Cái xe máy ${q(c, "sibling", "moto") ? `chết máy giữa cầu, ${nth(n)} đúng lúc quan trọng` : "hết xăng giữa cầu"}. Còn hai mươi phút. ${N(sib)} đạp nổ lần thứ mười, nói: "Tin anh/em đi."`,
      [C("Chạy bộ", { health: -4, bw: -5, gamble: { p: 0.55, win: { custom: "job_new", flags: ["tl_ran_to_job"], log: "Bạn đến muộn bốn phút, áo ướt. Người phỏng vấn cười, và nhận." }, lose: { happy: -6, log: "Bạn đến muộn mười hai phút. Cửa đã đóng. Bạn đi bộ về cùng cái xe." } } }, "Có thể kịp, có thể không"),
        C("Đứng chờ, tin anh/em", { trust: { npc: sib, delta: 0.3 }, memory: { npc: sib, tag: "KEPT_PROMISE", weight: 0.2, note: "chờ xe nổ lại giữa cầu" }, gamble: { p: 0.35, win: { custom: "job_new", log: "Lần thứ mười một, xe nổ. Bạn đến đúng giờ. Về sau bạn kể chuyện này ở mọi đám cưới." }, lose: { flags: ["tl_missed_interview"], log: "Xe không nổ. Hai anh em dắt bộ về, mua hai cây kem, không ai nhắc chuyện phỏng vấn." } } }, "Tình anh em, cược vào một cái xe"),
        C("Gọi xe ôm, bỏ anh/em lại", { money: -0.02, custom: "job_new", trust: { npc: sib, delta: -0.2 }, memory: { npc: sib, tag: "REFUSED_HELP", weight: -0.2, note: "bỏ lại giữa cầu với cái xe chết máy" }, flags: ["tl_left_sibling"], log: `Bạn có việc. ${N(sib)} dắt xe về một mình, và kể chuyện này ở mọi đám cưới, theo cách khác.` }, "Có việc, mất một chuyện kể")], 0, { npc: sib });
  }),

  fate("ft_mother_match", "lon", [22, 38], (c) => !c.married && !!role(c, "mother"), (c, N) => {
    const mo = role(c, "mother")!;
    return T("'Ăn cơm chưa?' và một người lạ ở bàn", `Bạn về nhà, ${N(mo)} hỏi "ăn cơm chưa?" như mọi ngày, và ở bàn có một người lạ, mặc đẹp, cười gượng. "Con bác Tư. Mẹ mời ăn cơm thôi." Trên bàn có sáu món và một bộ ấm chén mới. ${q(c, "mother", "nag_marry") ? `Đây là ${nth(gag(c, "mother_match"))} ${N(mo)} "mời ăn cơm thôi".` : ""}`,
      [C("Ăn cơm, và cưới thật", { custom: "marry", trust: { npc: mo, delta: 0.4 }, flags: ["tl_arranged"], happy: 3, log: "Hóa ra người ấy cũng bị mẹ ép sang. Hai người cười vì chuyện đó, rồi cưới vì chuyện đó." }, "Mẹ vui, và một cuộc đời do mẹ chọn"),
        C("Ăn cơm, rồi nói thẳng: không", { trust: { npc: mo, delta: -0.2 }, flags: ["tl_refused_match"], memory: { npc: mo, tag: "HUMILIATED_ME", weight: -0.2, note: "từ chối người mẹ mời ăn cơm, trước mặt khách" }, happy: 2, log: `Người lạ thở phào. ${N(mo)} dọn bát, không nhìn ai.` }, "Tự do, mẹ mất mặt với bác Tư"),
        C("Hẹn người ấy đi uống nước, không hứa gì", { rel: 4, flags: ["tl_dated_match"], later: { years: 1, note: "người mẹ giới thiệu, đã hẹn đi chơi" }, log: "Hai người đi uống nước để cả hai bà mẹ yên tâm. Rồi đi lần hai không vì mẹ." }, "Lựa chọn thứ ba: cho mẹ một nửa", { tier: "awakened" })], 0, { npc: mo });
  }),

  fate("ft_karaoke_contract", "lon", [20, 50], (c) => !!role(c, "childhood_friend") && c.savings > 0.3 * c.income, (c, N) => {
    const fr = role(c, "childhood_friend")!;
    return T("Ký hợp đồng ở phòng karaoke", `Mười một giờ đêm, phòng karaoke, ${N(fr)} tắt nhạc giữa bài và trải một tờ giấy lên bàn: "${q(c, "childhood_friend", "scheme") ? "Tao có kế hoạch. Lần này thật." : "Cơ hội chỉ có đêm nay."} Góp vốn mở ${c.poor_country ? "xe bán đồ ăn" : "tiệm cà phê"}, mày với tao." Bút đã mở nắp. Micro còn kêu rít. ${shadowLine(c, "childhood_friend", N(fr), 0)}`,
      [C("Ký", { game: { npc: fr, move: "cooperate", stake_frac: 0.5 }, flags: ["tl_karaoke_venture"], log: "Bạn ký dưới ánh đèn xoay" }, "Tin bạn, cược tiền thật", { longterm: true }),
        C("Ký, nhưng ghi phần mình lớn hơn khi bạn không nhìn", { game: { npc: fr, move: "defect", stake_frac: 0.5 }, log: "Bạn sửa một con số" }, "Lợi trước mắt, mất bạn từ nhỏ"),
        C("Mai tỉnh rồi ký, ở văn phòng công chứng", { game: { npc: fr, move: "arbitrage", stake_frac: 0.5 }, log: "Bạn gập tờ giấy lại" }, "Lựa chọn thứ ba: cùng thuyền, có giấy", { tier: "sovereign" }),
        C("Bật lại nhạc", { trust: { npc: fr, delta: -0.1 }, flags: ["tl_refused_karaoke"], log: `${N(fr)} hát tiếp bài dở, to hơn, và không nhắc lại chuyện này. Ít nhất là tối đó.` }, "Giữ tiền, giữ bạn, mất một kế hoạch")], 0, { npc: fr, matrix: pd(N(fr), "Thật", "Sửa số") });
  }),

  fate("ft_lottery", "lon", [18, 80], (c) => (c.counters.gamble ?? 0) > 0 && c.luck > 0.9999 && c.age % 7 === 0, (c) => T("Tờ vé số dưới đáy ví",
    `Bạn tìm tờ vé số dưới đáy ví để lót tay ghế, và thấy sáu con số trùng với tờ báo hôm qua. Ở xác suất này, trong một trăm nghìn người mua vé cả đời, có một người như bạn.`,
    [C("Lĩnh, và nói với cả xóm", { money: 20, flags: ["heir", "tl_jackpot_public"], rel: 10, log: "Ngày hôm sau cửa nhà bạn có ba mươi người họ hàng bạn chưa từng gặp." }, "Giàu, và mọi người đều biết"),
      C("Lĩnh, và im", { money: 20, flags: ["heir", "tl_jackpot_secret"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.2, fuse_years: [2, 10], note: "giấu cả nhà chuyện trúng số" }, log: "Bạn gửi vào ba ngân hàng và tiếp tục đi làm." }, "Giàu, và một mình biết")], 0)),

  /* ============================================================ VỪA · rẽ nhánh có chân ============================================================ */
  fate("ft_move_offer", "vua", [18, 40], (c) => !f(c, "path_city") && !c.migrated, (c, N) => {
    const fr = role(c, "childhood_friend");
    return T("Giường tầng trên thành phố", `${fr ? N(fr) : "Người quen"} gọi từ thành phố: "Phòng trọ tao còn một giường tầng. Việc thì đầy. Lên không?" Ngoài sân, bố mẹ bạn đang phơi ${c.farmer ? "lúa" : "quần áo"}.`,
      [C("Lên", { custom: "move_city", flags: ["tl_city_rooted"], ...(fr ? { trust: { npc: fr, delta: 0.2 } } : {}), log: "Bạn ngủ giường tầng trên sáu tháng, quen tiếng xe đêm." }, "Thu nhập hơn, xa nhà"),
        C("Ở lại", { rel: 4, flags: ["tl_rooted"], log: "Bạn ở lại. Năm sau ở quê có việc mới, hoặc không." }, "Gần nhà, đời chậm")], 0);
  }),
  fate("ft_side_gig", "vua", [22, 55], (c) => c.has_job && !f(c, "tinker") && !f(c, "credit_book"), (c) => T("Cái tủ lạnh thứ hai",
    `Bạn mua một cái tủ lạnh cũ để ${c.poor_country ? "bán nước đá và đồ ăn sẵn trước cửa" : "bán đồ nấu sẵn cho hàng xóm"} sau giờ làm. Tháng đầu lời bằng nửa lương. Tháng hai, ${vn(c) ? "phường" : "quản lý chung cư"} hỏi giấy phép.`,
    [C("Làm thêm thật, xin giấy", { flags: ["tinker", "tl_side_gig"], income_mult: 1.15, health: -4, money: -0.05, log: "Bạn ngủ ít đi một tiếng mỗi ngày và có một nguồn thu thứ hai." }, "Thêm tiền, bớt ngủ"),
      C("Bán tủ lạnh", { money: 0.03, flags: ["tl_no_side_gig"], log: "Bạn bán cái tủ, lỗ một ít, và ngủ đủ." }, "Yên, không thêm")], 0)),
  fate("ft_house_push", "vua", [25, 50], (c) => !c.home_owner && c.independent && c.savings > 0.5 * c.income, (c, N) => {
    const sp = role(c, "spouse");
    return T("Tờ rơi nhét qua khe cửa", `Mỗi sáng một tờ rơi nhét qua khe cửa: "Trả trước ${c.poor_country ? "30%" : "10%"}, góp hai mươi năm." ${sp ? `${N(sp)} để một tờ lên gối bạn.` : "Chủ trọ vừa tăng giá."}`,
      [C("Mua, vay ngân hàng", { buy: { kind: "house", name: "căn nhà trả góp", price: c.price_years.house, borrow: true }, flags: ["tl_mortgaged"], log: "Bạn ký hai mươi năm." }, "Có nhà, gánh góp"),
        C("Thuê tiếp, gửi tiết kiệm", { deposit: 0.5, flags: ["tl_renter"], log: "Bạn gửi tiền vào sổ và vứt tờ rơi." }, "Nhẹ, không có gì của mình")], 0);
  }),
  fate("ft_kid_school", "vua", [28, 55], (c) => c.kids_school > 0 && !!role(c, "child"), (c, N) => {
    const kid = role(c, "child")!;
    return T("Trường ở xa, học phí gấp ba", `${N(kid)} đỗ vào trường ${c.poor_country ? "trên huyện" : "chuyên"}, học phí gấp ba, cách nhà một giờ xe. Cô giáo nói: "Đứa này mà học trường làng thì phí."`,
      [C("Cho đi", { money: -0.5, support: { who: "kids", level: "hau" }, flags: ["tl_kid_far_school"], trust: { npc: kid, delta: 0.2 }, log: "Mỗi sáng năm giờ bạn chở con ra bến." }, "Con đi xa, nhà thắt lại"),
        C("Học gần", { money: 0.1, flags: ["tl_kid_near_school"], trust: { npc: kid, delta: -0.1 }, log: "Cô giáo thở dài. Đứa nhỏ về nhà ăn cơm trưa." }, "Gần nhà, thấp hơn")], 0, { npc: kid });
  }),
  fate("ft_habit", "vua", [18, 45], (c) => (c.counters.drink ?? 0) < 2 && (c.counters.exercise ?? 0) < 1, (c, N) => {
    const fr = role(c, "childhood_friend");
    return T("Sáu giờ chiều, hai lời rủ", `Sáu giờ chiều. ${fr ? N(fr) : "Đồng nghiệp"} rủ đi nhậu. Hàng xóm rủ đi đá bóng. Cả hai nhóm đều đi qua cửa nhà bạn, cùng một lúc.`,
      [C("Đi nhậu", { counters: { drink: 3 }, rel: 3, health: -2, flags: ["tl_drinker"], ...(fr ? { trust: { npc: fr, delta: 0.1 } } : {}), log: "Bạn có bàn nhậu cố định tối thứ sáu." }, "Bạn bè, gan"),
        C("Đi đá bóng", { counters: { exercise: 3 }, health: 4, flags: ["tl_athlete_habit", "athlete"], log: "Bạn có đội bóng xóm và một cái ống đồng bầm." }, "Sức khỏe, bạn khác")], 0);
  }),
  fate("ft_council", "vua", [30, 62], (c) => !f(c, "leader") && c.reputation >= 55, (c, N) => {
    const nb = role(c, "neighbor");
    return T("Cái ghế trống ở nhà văn hóa", `Xóm bầu người đứng ra lo việc chung. ${nb ? `${N(nb)} ${q(c, "neighbor", "loud") ? "đọc tên bạn qua loa" : "đề cử bạn"} trước khi bạn kịp lắc đầu.` : "Có người đề cử bạn."} Việc không lương, nhưng ai cũng gọi tên bạn khi có chuyện.`,
      [C("Nhận", { flags: ["leader", "tl_council"], rel: 6, bw: -5, log: "Bạn có một cuốn sổ ghi mọi chuyện của xóm, và một cái điện thoại không bao giờ im." }, "Tiếng nói, mất giờ"),
        C("Từ chối", { flags: ["tl_private"], happy: 2, log: "Bạn lắc đầu. Người khác nhận. Bạn được yên." }, "Yên, không tiếng")], 0);
  }),
  fate("ft_retire_early", "vua", [50, 62], (c) => c.has_job && !c.retired && c.savings > 2 * c.income, (c) => T("Lá đơn chưa ký trong ngăn bàn",
    `Lá đơn nghỉ việc nằm trong ngăn bàn ba tháng. Lương hưu sớm bằng ${c.gdp > 30000 ? "nửa" : "một phần ba"} lương bây giờ. Sáng nay bạn đau lưng lúc cúi buộc dây giày.`,
    [C("Ký", { custom: "retire", flags: ["tl_early_retire"], happy: 6, health: 4, log: "Bạn ký. Sáng hôm sau bạn tỉnh dậy lúc năm giờ và không biết làm gì." }, "Thời gian, ít tiền"),
      C("Làm tiếp", { flags: ["tl_kept_working"], income_mult: 1.05, health: -3, log: "Bạn gấp lá đơn lại và mua một cái đệm lưng." }, "Tiền, lưng")], 0)),
  fate("ft_return_home", "vua", [35, 66], (c) => (c.migrated || f(c, "path_city")) && !c.doors.has("return_home"), (c, N) => {
    const mo = role(c, "mother") ?? role(c, "father");
    return T("Cuộc gọi về nhà kéo dài hơn mọi khi", `${mo ? `${N(mo)} gọi, nói chuyện trời mưa mười phút, rồi mới nói: "Nhà bên cạnh bán."` : "Người quen gọi: \"Nhà bên cạnh bố mẹ bán.\""} Giá bằng ${c.migrated ? "một năm" : "hai năm"} lương của bạn ở đây.`,
      [C("Về", { custom: "return_home", flags: ["tl_returned"], rel: 8, log: "Bạn về với một cái va li và một thứ giọng hơi khác." }, "Gần nhà, thu nhập tụt"),
        C("Ở lại, gửi tiền", { give: { npc: mo ?? "", amount: 0.3 }, flags: ["tl_stayed_away"], ...(mo ? { trust: { npc: mo, delta: 0.1 } } : {}), log: "Bạn gửi tiền. Nhà bên cạnh có người khác mua." }, "Tiền, xa")], 0);
  }),
  fate("ft_second_love", "vua", [36, 70], (c) => !c.married && (c.widowed || f(c, "tl_divorced")), (c, N) => {
    const kid = role(c, "child");
    return T("Người bán hoa quen mặt", `Người bán hoa ở chợ sáng nào cũng để dành cho bạn một bó không héo. Hôm nay họ hỏi: "Tối nay có rảnh không?" ${kid ? `${N(kid)} nhìn thấy, không nói gì, nhưng tối ăn cơm chậm hơn.` : "Bạn cầm bó hoa về, đứng ở cửa một lúc."}`,
      [C("Đi, rồi cưới", { custom: "marry", flags: ["tl_second_marriage"], happy: 8, ...(kid ? { trust: { npc: kid, delta: -0.2 } } : {}), log: "Đám cưới nhỏ, không ai hỏi về người cũ." }, "Có người, con có thể xa"),
        C("Ở vậy", { happy: 2, flags: ["tl_alone_by_choice"], ...(kid ? { trust: { npc: kid, delta: 0.2 } } : {}), log: "Bạn vẫn mua hoa, ở hàng khác." }, "Yên, một mình")], 0);
  }),
  fate("ft_ladder", "vua", [20, 65], (c) => !!role(c, "neighbor") && q(c, "neighbor", "borrows"), (c, N) => {
    const nb = role(c, "neighbor")!, n = gag(c, "neighbor_borrows");
    return gagAll(T("Cái thang chưa về", `${N(nb)} mượn cái thang ${n ? `(${nth(n)} trong đời bạn, chưa lần nào trả đúng hạn)` : ""}, rồi mượn cái khoan, rồi mượn cái xe. Hôm nay ${N(nb)} sang mượn tiền, "một tí thôi, mai trả."`,
      [C("Cho mượn", { lend: { npc: nb, amount: 0.1, years: 1 }, log: "Bạn đưa. Cái thang thì vẫn chưa về." }, "Giữ xóm, cược tiền"),
        C("Đòi thang trước đã", { trust: { npc: nb, delta: -0.2 }, memory: { npc: nb, tag: "HUMILIATED_ME", weight: -0.15, note: "đòi thang trước mặt khách" }, flags: ["tl_fence_up"], log: `${N(nb)} về, mang cái thang sang, và không sang nữa ba tháng.` }, "Lấy lại thang, mất một người sang chơi")], 0, { npc: nb }), "neighbor_borrows");
  }, { max: 2, cooldown: 8 }),
  fate("ft_boss_family", "vua", [20, 55], (c) => c.has_job && !!role(c, "first_boss") && q(c, "first_boss", "family"), (c, N) => {
    const bo = role(c, "first_boss")!;
    return T("'Công ty như gia đình', tập mới", `${N(bo)} họp cả phòng: "Công ty như gia đình. Tháng này gia đình làm thêm thứ bảy, không lương." Cả phòng nhìn bạn, vì bạn là người hay nói.`,
      [C("Nói: gia đình thì phải trả công", { rel: 3, flags: ["leader"], trust: { npc: bo, delta: -0.2 }, gamble: { p: 0.5, win: { income_mult: 1.1, log: "Sếp im một giây, rồi cười: \"Được. Trả.\"" }, lose: { income_mult: 0.95, memory: { npc: bo, tag: "HUMILIATED_ME", weight: -0.25, note: "cãi trước cả phòng" }, log: "Sếp ghi vào sổ." } } }, "Có thể được thêm, có thể bị ghi"),
        C("Gật, làm thứ bảy", { health: -3, trust: { npc: bo, delta: 0.2 }, flags: ["tl_loyal_worker"], log: "Bạn làm thứ bảy. Sếp mang bánh đến, một cái cho mười người." }, "Yên, mệt")], 0, { npc: bo });
  }),

  /* ============================================================ VÁN LẶP VỚI NGƯỜI QUEN ============================================================ */
  ...(["partner", "sibling", "childhood_friend", "rival", "spouse"] as const).map((r) => fate(`bond_${r}`, "vua", [20, 68], (c) => !!role(c, r) && !(r === "partner" && c.flags.has("shop_active")), (c, N) => {
    const id = role(c, r)!, n = c.counters[`bond_${r}`] ?? 0, last = c.last_move[id], name = N(id);
    const lastLine = last ? ` Lần trước ${name} đã ${last === "cooperate" ? "chơi thật" : "giữ phần mình"}.` : "";
    const scene: Record<typeof r, [string, string, string, string, string]> = {
      partner: ["Chia lãi cuối mùa", `Cuối mùa, hai người ngồi đếm. ${name} đẩy cuốn sổ sang: "Anh/em xem đi, tôi ghi hết." Có một trang bị xé.`, "Chia đúng sổ", "Giữ lại một phần không ghi", "Thuê kế toán kiểm rồi chia"],
      sibling: ["Tiền góp cho bố mẹ", `${name} nói: "Năm nay anh/em góp phần bố mẹ ít thôi, tôi lo." Rồi tháng sau hỏi vay đúng số đó. ${q(c, "sibling", "late") ? "Đến muộn, như mọi lần." : ""}`, "Góp đủ, cho vay", "Góp ít, viện cớ", "Lập sổ chung, ai góp ghi tên"],
      childhood_friend: ["Hùn mua chung một chiếc xe", `${name} ${q(c, "childhood_friend", "scheme") ? `có kế hoạch mới: ` : "đề nghị: "}mua chung một chiếc xe chạy dịch vụ, chia theo ngày.`, "Góp đủ phần", "Góp thiếu, nói đã góp", "Đứng tên chung, có giấy"],
      rival: ["Chia thầu một mối hàng", `Một mối hàng lớn chỉ đủ cho hai người nếu không phá giá nhau. ${name} nhắn: "Mỗi người một nửa?"`, "Giữ giá, chia đôi", "Phá giá, lấy hết", "Ký cam kết giá trước khi nhận"],
      spouse: ["Tiền chung, tiền riêng", `${name} hỏi: "Lương tháng này anh/em để đâu?" Có một khoản bạn chưa nói.`, "Nói hết, gộp chung", "Giữ riêng một phần", "Mở sổ chung, mỗi người một phần riêng có ghi"],
    };
    const [title, text, a, b, d] = scene[r];
    const sf = r === "spouse" ? 0.3 : r === "rival" ? 0.5 : 0.4;
    return T(`${title}${n ? ` (${nth(n)})` : ""}`, `${text}${lastLine} ${shadowLine(c, r, name, n)}`,
      [C(a, { game: { npc: id, move: "cooperate", stake_frac: sf }, counters: { [`bond_${r}`]: 1 }, log: "Bạn chơi thật" }, undefined, { longterm: true }),
        C(b, { game: { npc: id, move: "defect", stake_frac: sf }, counters: { [`bond_${r}`]: 1 }, log: "Bạn giữ phần mình" }, "Lợi lúc này, người ấy nhớ"),
        C(d, { game: { npc: id, move: "arbitrage", stake_frac: sf }, counters: { [`bond_${r}`]: 1 }, log: "Bạn đặt luật trước" }, "Lựa chọn thứ ba: không tin, không phản", { tier: "sovereign" })],
      last === "defect" ? 2 : 0, { npc: id, matrix: pd(name, "Thật", "Giữ"), concept: "repeated" });
  }, { max: 4, cooldown: 3, spec: 2 })),
];

/* ============================================================ ECHO · vế sau của cliffhanger ============================================================ */
export const FATE_ECHO: Storylet[] = [
  echo("ft_letter_echo", "tl_wait_letter", (c) => T("Mảnh đất có người đang ở", `Sau một năm bạn tìm được mảnh đất trong thư. Có một ngôi nhà nhỏ, và một người đàn bà già ra mở cửa, nhìn bạn rất lâu: "Giống hệt. Giống hệt ông ấy." Bà là người mà ${dead(c, "father") ? "bố" : "mẹ"} bạn không bao giờ nhắc.`,
    [C("Nhận đất, để bà ở lại", { buy: { kind: "land", name: "mảnh đất trong thư", price: 0.01 }, flags: ["heir", "tl_letter_land"], rel: 6, happy: 4, log: "Bạn đứng tên đất. Bà vẫn ở. Mỗi năm bạn về một lần, và bà gọi bạn bằng tên của người kia." }, "Có đất, có một người thân không máu mủ"),
      C("Bán đất, chia cho bà một nửa", { money: 1, flags: ["land_sold", "tl_letter_sold"], log: "Bà nhận tiền, không đếm. Bạn không quay lại." }, "Có tiền, hết chuyện"),
      C("Để lại tất cả cho bà", { close_doors: ["inheritance"], happy: 8, agency: 0.02, flags: ["tl_letter_gave"], log: "Bạn ký giấy sang tên và về. Lần đầu bạn hiểu bố/mẹ mình." }, "Không gì, trừ một câu trả lời", { tier: "awakened" })], 0)),
  echo("ft_fortune_echo", "tl_wait_fortune", (c, N) => { const of = role(c, "official"); return T("Hai người mặc đồng phục ở cổng công ty", `Hai năm lương gấp đôi. Sáng nay hai người mặc đồng phục đứng ở cổng, cầm danh sách. Tên công ty không có trên bảng hiệu nhưng có trong hồ sơ của họ. Người đàn ông áo khoác dài đã biến mất từ tuần trước.`,
    [C("Khai hết, nộp lại tiền", { money: -1.5, income_mult: 0.6, flags: ["tl_cooperated_probe"], agency: 0.03, log: "Bạn ngồi với họ sáu tiếng. Bạn mất gần hết, giữ được tên." }, "Nghèo đi, sạch"),
      C("Nói không biết gì", { gamble: { p: 0.45, win: { log: "Họ ghi, rồi đi. Lương tháng sau không về nữa." , custom: "job_lose" }, lose: { close_doors: ["clean_record"], flags: ["tl_convicted"], money: -2, health: -10, log: "Tám tháng. Khi ra, không ai gọi bạn đi làm." } } }, "Có thể thoát, có thể mất hai năm đời"),
      ...(of ? [C(`Gọi ${N(of)}`, { money: -0.8, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [2, 9], note: `nhờ ${N(of)} xóa tên khỏi danh sách`, known_by: [of] }, trust: { npc: of, delta: 0.2 }, income_mult: 0.8, log: "Tên bạn không còn trong danh sách. Tên bạn có trong một cuốn sổ khác." }, "Thoát, và bị nắm")] : [])], 0); }),
  echo("ft_deed_echo", "tl_wait_deed", (c, N) => { const sib = role(c, "sibling"); return T("Người giữ giấy tờ là người bạn biết", `Hai năm lần theo một cái tên. Người giữ giấy tờ nhà hóa ra là ${sib ? N(sib) : "người bạn từng từ chối giúp"}, từ mười năm trước. Giấy tờ nằm trong một cái hộp bánh.`,
    [C("Đòi lại", { ...(sib ? { game: { npc: sib, move: "defect", stake_frac: 0.8 } } : { money: 0.6 }), flags: ["heir"], log: "Bạn đòi bằng được" }, "Có giấy, mất người"),
      C("Để yên, coi như không biết", { happy: -4, flags: ["tl_let_deed_go"], close_doors: ["inheritance"], log: "Bạn đóng nắp hộp bánh lại." }, "Mất đất, giữ giỗ"),
      ...(sib ? [C("Chia đôi, công chứng", { game: { npc: sib, move: "arbitrage", stake_frac: 0.8 }, flags: ["heir"], log: "Bạn đề nghị chia" }, "Lựa chọn thứ ba", { tier: "sovereign" })] : [])], 0); }),
  echo("ft_revenge_echo", "tl_wait_revenge", (c) => T("Chủ nợ cũ trở lại, với người mới", `Hai năm sau cú gọi lúc năm giờ chiều, chủ nợ cũ về, có thêm người, đứng trước cửa lúc trời còn sáng. Lần này họ không gọi điện.`,
    [C("Báo công an lần nữa, và đi", { custom: "move_city", flags: ["left_home", "tl_fled_revenge"], close_doors: ["return_home"], log: "Bạn đi trong đêm, lần thứ hai." }, "Sống, xa"),
      C("Đứng ở cửa với cả xóm", { rel: 8, health: -10, flags: ["leader", "tl_stood_ground"], gamble: { p: c.allies >= 2 ? 0.7 : 0.4, win: { log: "Cả xóm ra đứng. Họ nhìn, rồi đi. Không về nữa." }, lose: { health: -15, money: -0.8, log: "Xóm không ra đủ. Bạn trả bằng cả tiền và máu." } } }, "Cược vào xóm")], 0)),
  echo("ft_lie_echo", "tl_wait_lie", (c, N) => { const bo = role(c, "first_boss"); return T("Người anh/em sinh đôi được mời dự tiệc", `Tiệc cuối năm, ${bo ? N(bo) : "sếp"} tuyên bố: "Mời cả người anh/em sinh đôi của cậu đến." Cả phòng vỗ tay. Bạn có một tuần để có một người sinh đôi.`,
    [C("Thú nhận", { happy: -5, income_mult: 0.95, agency: 0.02, flags: ["tl_confessed_twin"], log: "Bạn kể. Phòng cười hai mươi phút. Sếp đặt tên cho hóa đơn tiệc là 'người sinh đôi'." }, "Mất mặt, hết nợ"),
      C("Thuê người đóng", { money: -0.15, gamble: { p: 0.5, win: { rel: 5, log: "Người được thuê diễn hay đến mức sếp mời làm luôn. Giờ bạn có một đồng nghiệp biết bí mật." }, lose: { custom: "job_lose", rel: -8, log: "Người được thuê say và kể hết. Bạn nộp đơn trước khi bị gọi." } } }, "Lời nói dối nuôi lời nói dối")], 0); }),
];

export const FATE_IDS: ReadonlySet<string> = new Set([...FATE, ...FATE_ECHO].map((s) => s.id));
