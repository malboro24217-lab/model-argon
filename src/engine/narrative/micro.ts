/**
 * Micro-decisions ("chuyện nhỏ") — Roadwarden's fluff/spice tier, Reigns' cadence.
 * 1–2 per year. Each is small; together they build HABITS (counters) and OPINIONS that later
 * cross thresholds and fire consequence storylets with a named cause ("vì từ năm 16 tuổi bạn…").
 *
 * Habit counters: smoke, drink, exercise, save, read, gamble, faith, honest, kind.
 * The host applies habit drift every year (see living.js habitYear()).
 */
import type { Storylet, FactContext, StoryletView, Choice, CastRole } from "./types.ts";
import { countTrue as n } from "./Matcher.ts";
import { prov } from "./Causality.ts";

const C = (label: string, effects: Choice["effects"], hint?: string, extra: Partial<Choice> = {}): Choice => ({ label, ...(hint !== undefined ? { hint } : {}), effects, ...extra });
const role = (c: FactContext, r: CastRole): string | undefined => c.cast[r];
const op = (c: FactContext, id: string | undefined): number => (id ? c.opinion[id] ?? 0 : 0);
const h = (c: FactContext, k: string): number => c.counters[k] ?? 0;
/** Deterministic text variant per (id, age). */
const vary = (id: string, age: number, arr: string[]): string => { let x = age * 31; for (const ch of id) x = (x * 33 + ch.charCodeAt(0)) >>> 0; return arr[x % arr.length]!; };

type Build = (c: FactContext, N: (id: string) => string) => StoryletView;
function M(id: string, ages: [number, number], when: (c: FactContext) => boolean, spec: (c: FactContext) => number, build: Build, extra: Partial<Storylet> = {}): Storylet {
  return { id, category: "micro", urgency: 15, cooldownYears: 7, tension: 1, prerequisites: (c) => c.age >= ages[0] && c.age <= ages[1] && when(c), specificity: spec, build, ...extra };
}
const any = ((): number => 1) as unknown as ((c: FactContext) => boolean) & ((c: FactContext) => number);

export const MICRO: Storylet[] = [
  /* =============================== Tuổi thơ 6–12 =============================== */
  M("m_share_lunch", [6, 12], (c) => !!role(c, "childhood_friend"), (c) => n(c.poor_country, c.family_wealth < 0.4), (c, N) => { const f = role(c, "childhood_friend")!; return { npc: f, title: "Hộp cơm trưa",
    text: vary("lunch", c.age, [`${N(f)} không mang cơm, ngồi nhìn bạn ăn.`, `Giờ ra chơi, ${N(f)} bảo hôm nay nhà hết gạo.`]),
    choices: [C("Chia một nửa", { happy: -1, counters: { kind: 1 }, memory: { npc: f, tag: "HELPED_IN_CRISIS", weight: 0.12, note: "nửa hộp cơm năm lớp 2" } }), C("Ăn hết", { health: 1 })], def: 0 }; }),
  M("m_broke_vase", [6, 11], (c) => !!role(c, "mother"), any, (c, N) => { const m = role(c, "mother")!; return { npc: m, title: "Cái bình vỡ",
    text: `Bạn làm vỡ cái bình ${N(m)} quý nhất. ${N(m)} hỏi ai làm.`,
    choices: [C("Nhận", { happy: -2, counters: { honest: 1 }, trust: { npc: m, delta: 0.05 } }), C("Đổ cho con mèo", { counters: { honest: -1 }, flags: ["lied_vase"] })], def: 0 }; }),
  M("m_homework", [7, 12], (c) => c.in_school, (c) => n(c.know < 40), (c) => ({ title: "Bài tập hay ra đồng chơi", text: vary("hw", c.age, ["Lũ bạn gọi í ới ngoài ngõ.", "Trời vừa tạnh mưa, ngoài sân đầy ếch."]),
    choices: [C("Làm bài", { know: 2, happy: -1, counters: { read: 1 } }), C("Chạy ra chơi", { happy: 3, rel: 1 })], def: 1 })),
  M("m_teased_kid", [7, 12], (c) => c.in_school, (c) => n(c.traits.bold > 0), (c) => ({ title: "Đứa bị trêu", text: "Một đứa mới chuyển đến bị cả lớp trêu vì giọng nói lạ.",
    choices: [C("Đứng ra bênh", { rel: -1, happy: 1, counters: { kind: 1 }, trait: { bold: 1, fair: 1 } }, "Có thể bị trêu lây"), C("Cười theo", { rel: 1, trait: { coop: -1 } }), C("Im lặng", {})], def: 2 })),
  M("m_fruit_tree", [6, 12], (c) => !!role(c, "neighbor"), any, (c, N) => { const nb = role(c, "neighbor")!; return { npc: nb, title: "Cây xoài nhà bên", text: `Xoài nhà ${N(nb)} chín vàng, cành chìa sang ngõ.`,
    choices: [C("Hái trộm", { happy: 2, counters: { honest: -1 }, gamble: { p: 0.7, win: {}, lose: { memory: { npc: nb, tag: "GOSSIP_HEARD_BAD", weight: -0.1, note: "thằng bé hái trộm xoài" }, log: `${N(nb)} bắt quả tang, mách cả nhà.` } } }), C("Xin", { gamble: { p: 0.6, win: { happy: 2, memory: { npc: nb, tag: "GOSSIP_HEARD_GOOD", weight: 0.08, note: "đứa bé lễ phép" } }, lose: {} } })], def: 1 }; }),
  M("m_found_coin", [6, 12], any, any, (c) => ({ title: "Tờ tiền rơi", text: "Bạn nhặt được một tờ tiền trước cổng trường.",
    choices: [C("Nộp cô giáo", { counters: { honest: 1 }, happy: 1 }), C("Mua kẹo", { happy: 2, counters: { honest: -1 } })], def: 0 })),
  M("m_tell_sibling", [6, 12], (c) => !!role(c, "sibling"), any, (c, N) => { const s = role(c, "sibling")!; return { npc: s, title: `${N(s)} trốn học`, text: `Bạn thấy ${N(s)} trốn học ra quán điện tử. Bố mẹ chưa biết.`,
    choices: [C("Mách bố mẹ", { memory: { npc: s, tag: "HUMILIATED_ME", weight: -0.15, note: "bị mách vụ trốn học" } }), C("Giữ bí mật", { memory: { npc: s, tag: "STOOD_UP_FOR_ME", weight: 0.15, note: "giữ bí mật vụ trốn học" } })], def: 1 }; }),
  M("m_help_father", [8, 14], (c) => !!role(c, "father"), (c) => n(c.poor_country, c.farmer), (c, N) => { const f = role(c, "father")!; return { npc: f, title: `Phụ ${N(f)}`, text: `${N(f)} cần người phụ việc cuối tuần.`,
    choices: [C("Đi phụ", { health: -1, trust: { npc: f, delta: 0.06 }, know: 1 }), C("Ở nhà chơi", { happy: 2 })], def: 0 }; }),
  M("m_fight_toy", [6, 10], (c) => !!role(c, "sibling"), any, (c, N) => { const s = role(c, "sibling")!; return { npc: s, title: "Món đồ chơi", text: `Bạn và ${N(s)} giành nhau món đồ chơi duy nhất trong nhà.`,
    choices: [C("Nhường", { happy: -1, trust: { npc: s, delta: 0.05 }, counters: { kind: 1 } }), C("Giành bằng được", { happy: 2, trust: { npc: s, delta: -0.05 }, trait: { bold: 1 } })], def: 0 }; }),
  M("m_festival", [6, 14], any, (c) => n(c.poor_country), (c) => ({ title: "Ngày hội", text: "Làng mở hội. Người lớn đi lễ, trẻ con chạy theo đoàn múa.",
    choices: [C("Theo người lớn đi lễ", { counters: { faith: 1 }, rel: 1 }), C("Chạy theo đoàn múa", { happy: 3 })], def: 1 })),
  M("m_hobby", [7, 13], any, any, (c) => ({ title: "Một thứ mình thích", text: vary("hob", c.age, ["Bạn tìm thấy cây đàn cũ trong kho.", "Ông hàng xóm cho bạn mượn bộ cờ.", "Có lớp võ mở ở đình làng."]),
    choices: [C("Tập mỗi ngày", { counters: { exercise: 1, read: 1 }, happy: 1, flags: ["hobby"] }), C("Chơi vài hôm rồi thôi", { happy: 1 })], def: 0 })),

  /* =============================== Thiếu niên 13–19 =============================== */
  M("m_first_smoke", [13, 19], (c) => !!role(c, "childhood_friend") && h(c, "smoke") === 0, any, (c, N) => { const f = role(c, "childhood_friend")!; return { npc: f, title: "Điếu thuốc đầu tiên", text: `Sau giờ học, ${N(f)} chìa ra một điếu thuốc. "Thử đi, có sao đâu."`,
    choices: [C("Thử", { counters: { smoke: 2 }, rel: 2, flags: ["habit_smoke"] }, "Bắt đầu một thói quen"), C("Lắc đầu", { rel: -1 })], def: 1 }; }),
  M("m_skip_class", [13, 18], (c) => c.in_school, (c) => n(c.know < 45, c.happy < 40), (c) => ({ title: "Trốn tiết", text: "Cả nhóm rủ nhau trốn tiết chiều ra bờ sông.",
    choices: [C("Đi", { happy: 3, know: -2, rel: 2 }), C("Ở lại học", { know: 2, rel: -1 })], def: 1 })),
  M("m_crush", [14, 19], any, any, (c) => ({ title: "Người ấy", text: "Có một người bạn để ý suốt mấy tháng. Hôm nay hai người đứng chờ xe buýt cùng nhau.",
    choices: [C("Bắt chuyện", { gamble: { p: 0.5, win: { happy: 6, rel: 3, flags: ["first_love"], log: "Hai người nói chuyện đến lúc xe tới, rồi hẹn nhau hôm sau." }, lose: { happy: -4, log: "Bạn lắp bắp, người ấy cười lịch sự rồi lên xe." } } }), C("Im lặng", { happy: -1, flags: ["unspoken"] })], def: 1 })),
  M("m_parttime", [14, 19], (c) => c.in_school, (c) => n(c.broke, c.family_wealth < 0.4), (c) => ({ title: "Việc làm thêm", text: "Quán cơm đầu ngõ cần người rửa bát buổi tối.",
    choices: [C("Nhận việc", { money: 0.05, know: -2, health: -1, counters: { save: 1 } }), C("Tập trung học", { know: 2 })], def: 0 })),
  M("m_father_future", [15, 19], (c) => !!role(c, "father"), any, (c, N) => { const f = role(c, "father")!; return { npc: f, title: "Chuyện tương lai", text: `${N(f)} muốn bạn theo nghề ổn định. Bạn muốn thứ khác.`,
    choices: [C("Nghe lời", { trust: { npc: f, delta: 0.1 }, happy: -2 }), C("Cãi lại", { trust: { npc: f, delta: -0.12 }, agency: 0.02, trait: { bold: 1 }, memory: { npc: f, tag: "HUMILIATED_ME", weight: -0.08, note: "con cãi lời chuyện tương lai" } })], def: 0 }; }),
  M("m_teen_drink", [15, 19], (c) => !!role(c, "childhood_friend"), any, (c, N) => { const f = role(c, "childhood_friend")!; return { npc: f, title: "Chai rượu đầu tiên", text: `${N(f)} mang rượu đến buổi liên hoan cuối năm.`,
    choices: [C("Uống cùng", { counters: { drink: 1 }, rel: 2, happy: 2 }), C("Không uống", { rel: -1 })], def: 1 }; }),
  M("m_mentor_book", [13, 19], (c) => !!role(c, "mentor"), any, (c, N) => { const m = role(c, "mentor")!; return { npc: m, title: "Cuốn sách", text: `${N(m)} đưa bạn một cuốn sách cũ. "Đọc rồi kể thầy nghe."`,
    choices: [C("Đọc hết", { know: 3, counters: { read: 2 }, trust: { npc: m, delta: 0.12 }, agency: 0.01 }), C("Để đấy", { trust: { npc: m, delta: -0.04 } })], def: 0 }; }),
  M("m_defend_friend", [12, 18], (c) => !!role(c, "bully") && !!role(c, "childhood_friend"), any, (c, N) => { const b = role(c, "bully")!, f = role(c, "childhood_friend")!; return { npc: b, title: `${N(b)} và ${N(f)}`, text: `${N(b)} đang dồn ${N(f)} vào góc tường.`,
    choices: [C("Xông vào", { health: -3, trait: { bold: 2 }, memory: { npc: f, tag: "STOOD_UP_FOR_ME", weight: 0.3, note: `đứng ra che cho ${N(f)} trước ${N(b)}` } }), C("Gọi người lớn", { memory: { npc: b, tag: "HUMILIATED_ME", weight: -0.15, note: "gọi người lớn" } }), C("Đi chỗ khác", { memory: { npc: f, tag: "REFUSED_HELP", weight: -0.2, note: "quay lưng bỏ đi hôm đó" } })], def: 1 }; }),
  M("m_friend_secret", [13, 22], (c) => !!role(c, "childhood_friend"), any, (c, N) => { const f = role(c, "childhood_friend")!; return { npc: f, title: "Bí mật của bạn", text: `${N(f)} kể cho bạn một chuyện nhà không ai được biết.`,
    choices: [C("Giữ kín", { memory: { npc: f, tag: "KEPT_PROMISE", weight: 0.2, note: "giữ kín chuyện nhà" } }), C("Kể cho người khác", { rel: 1, memory: { npc: f, tag: "CHEATED_ME", weight: -0.35, note: "đem chuyện nhà đi kể" } })], def: 0 }; }),
  M("m_exercise_start", [14, 50], (c) => h(c, "exercise") < 3, (c) => n(c.health < 60), (c) => ({ title: "Chạy bộ buổi sáng", text: vary("run", c.age, ["Hàng xóm rủ chạy bộ lúc năm giờ sáng.", "Bạn thấy mình leo cầu thang đã thở dốc."]),
    choices: [C("Bắt đầu", { counters: { exercise: 2 }, happy: -1, flags: ["habit_exercise"] }, "Mệt bây giờ, khỏe về sau"), C("Để mai", {})], def: 1 })),

  /* =============================== Người lớn: tiền & thói quen =============================== */
  M("m_found_wallet", [18, 75], any, (c) => n(c.broke), (c) => ({ title: "Cái ví", text: "Bạn nhặt được một cái ví dày trên xe buýt. Có giấy tờ và một xấp tiền.",
    choices: [C("Tìm trả chủ", { counters: { honest: 1 }, happy: 2, rel: 1 }), C("Giữ tiền, vứt ví", { money: 0.08, counters: { honest: -2 }, happy: -1 })], def: 0 }), { cooldownYears: 15 }),
  M("m_wrong_change", [18, 75], any, (c) => n(c.broke), (c) => ({ title: "Tiền thối", text: "Bà bán hàng thối nhầm cho bạn gấp đôi.",
    choices: [C("Trả lại", { counters: { honest: 1 }, happy: 1 }), C("Lờ đi", { money: 0.01, counters: { honest: -1 } })], def: 0 })),
  M("m_colleague_drink", [20, 60], (c) => c.has_job, (c) => n(c.worker, c.scarcity), (c) => ({ title: "Nhậu sau giờ làm", text: vary("nhau", c.age, ["Cả tổ rủ đi nhậu mừng xong đơn hàng.", "Sếp mời cả phòng đi nhậu, ai không đi thì thôi."]),
    choices: [C("Đi, uống tới bến", { counters: { drink: 1 }, rel: 3, money: -0.01, health: -1 }), C("Đi, uống chừng mực", { rel: 1, money: -0.01 }), C("Về nhà", { rel: -2 })], def: 1 })),
  M("m_stress_smoke", [20, 65], (c) => h(c, "smoke") > 0, (c) => n(c.scarcity, c.rat_race), (c) => ({ title: "Điếu thuốc lúc căng thẳng", text: "Đầu óc rối bời. Bao thuốc trong túi áo.",
    choices: [C("Hút", { counters: { smoke: 1 }, bw: 2 }), C("Bỏ hẳn từ hôm nay", { counters: { smoke: -3 }, happy: -3, bw: -3 }, "Khó, nhưng có thể")], def: 0 })),
  M("m_lottery", [18, 75], any, (c) => n(c.broke, c.traits.risk > 0, c.poor_country), (c) => ({ title: "Vé số", text: "Bà cụ bán vé số đứng chờ. Giải đặc biệt tuần này lớn bất thường.",
    choices: [C("Mua vài tờ", { money: -0.005, counters: { gamble: 1 }, gamble: { p: 0.03, win: { money: 0.5, log: "Bạn trúng một giải nhỏ." }, lose: {} } }), C("Thôi", {})], def: 1 })),
  M("m_card_game", [20, 65], (c) => h(c, "gamble") > 0 || c.traits.risk > 0, (c) => n(c.broke, c.rat_race), (c) => ({ title: "Chiếu bạc", text: "Đám cưới xong, mấy ông bày chiếu đánh bài, rủ bạn ngồi vào.",
    choices: [C("Ngồi vào", { counters: { gamble: 2 }, gamble: { p: 0.45, win: { money: 0.1, happy: 3 }, lose: { money: -0.15, happy: -3 } } }), C("Đứng xem rồi về", {})], def: 1 })),
  M("m_installment", [18, 55], (c) => c.has_job, (c) => n(c.broke, c.tier === "autopilot"), (c) => ({ title: "Điện thoại trả góp", text: "Đồng nghiệp ai cũng có điện thoại mới. Cửa hàng cho trả góp 0 %.",
    choices: [C("Mua", { happy: 4, custom: "borrow:0.12", counters: { save: -1 } }), C("Dùng máy cũ thêm năm nữa", { happy: -1, counters: { save: 1 } })], def: 0 })),
  M("m_bonus", [20, 64], (c) => c.has_job && !c.farmer, (c) => n(c.econ_phase === "boom"), (c) => ({ title: "Tiền thưởng", text: "Cuối năm có một khoản thưởng bằng nửa tháng lương.",
    choices: [C("Để dành", { money: 0.04, counters: { save: 2 } }), C("Sắm sửa cho nhà", { happy: 3, rel: 2 }), C("Đãi bạn bè một bữa", { rel: 3, happy: 2 })], def: 0 })),
  M("m_send_home", [18, 60], (c) => !!role(c, "mother") || !!role(c, "father"), (c) => n(c.parent_old, c.poor_country, c.migrated), (c, N) => { const p = (role(c, "mother") ?? role(c, "father"))!; return { npc: p, title: "Gửi tiền về nhà", text: `Tháng này ${N(p)} không gọi xin, nhưng bạn biết nhà đang thiếu.`,
    choices: [C("Gửi về", { money: -0.04, trust: { npc: p, delta: 0.08 }, counters: { kind: 1 } }), C("Tháng sau", {})], def: 0 }; }, { cooldownYears: 4 }),
  M("m_checkup", [30, 80], any, (c) => n(c.health < 55, c.age > 50), (c) => ({ title: "Khám sức khỏe", text: "Phòng khám gần nhà có gói khám tổng quát. Bạn cũng chẳng thấy đau ở đâu.",
    choices: [C("Đi khám", { money: -0.02, health: 3, flags: ["checked_up"] }), C("Không cần", {})], def: 1 }), { cooldownYears: 5 }),
  M("m_insurance", [22, 55], (c) => c.has_job && !c.poor_country, (c) => n(c.kids_alive > 0), (c) => ({ title: "Bảo hiểm", text: "Một người bán bảo hiểm ngồi lì ở phòng khách.",
    choices: [C("Mua", { money: -0.03, flags: ["insured"] }), C("Mời về", {})], def: 1 }), { cooldownYears: 15 }),
  M("m_evening_class", [20, 50], (c) => c.has_job, (c) => n(c.know < 50, c.tier !== "autopilot"), (c) => ({ title: "Lớp buổi tối", text: vary("eve", c.age, ["Có lớp tiếng Anh buổi tối gần chỗ làm.", "Một khóa học kế toán online, học phí phải chăng."]),
    choices: [C("Đăng ký", { money: -0.03, know: 3, health: -1, counters: { read: 2 } }), C("Không có thời gian", {})], def: 1 })),
  M("m_side_gig", [20, 55], (c) => c.has_job, (c) => n(c.broke, c.rat_race), (c) => ({ title: "Việc tay trái", text: "Có người nhờ bạn làm thêm cuối tuần, trả tiền mặt.",
    choices: [C("Nhận", { money: 0.06, health: -2, rel: -1 }), C("Giữ cuối tuần cho nhà", { rel: 2 })], def: 0 })),

  /* =============================== Người lớn: chỗ làm =============================== */
  M("m_cover_mistake", [20, 60], (c) => c.has_job && !c.farmer, any, (c) => ({ title: "Lỗi của đồng nghiệp", text: "Đồng nghiệp làm hỏng một lô hàng và xin bạn đừng báo lên.",
    choices: [C("Che giúp", { rel: 2, counters: { honest: -1 }, gamble: { p: 0.8, win: {}, lose: { income_mult: 0.95, log: "Chuyện lộ ra. Cả hai bị trừ lương." } } }), C("Báo lên", { rel: -3, counters: { honest: 1 }, gamble: { p: 0.5, win: { income_mult: 1.03, log: "Sếp ghi nhận bạn." }, lose: {} } })], def: 0 })),
  M("m_take_credit", [22, 60], (c) => c.has_job && !c.farmer && !c.worker, any, (c) => ({ title: "Ý tưởng của ai", text: "Sếp khen ý tưởng mà một đồng nghiệp trẻ nghĩ ra, và tưởng là của bạn.",
    choices: [C("Nói thật là của cậu ấy", { counters: { honest: 1 }, rel: 2 }), C("Nhận luôn", { income_mult: 1.03, counters: { honest: -1 }, flags: ["took_credit"] })], def: 0 })),
  M("m_weekend_work", [20, 60], (c) => c.has_job, (c) => n(c.married, c.kids_alive > 0), (c) => ({ title: "Làm cuối tuần", text: "Sếp nhờ bạn làm thêm cả hai ngày cuối tuần. Hôm đó là sinh nhật người nhà.",
    choices: [C("Đi làm", { money: 0.02, rel: -3, income_mult: 1.01 }), C("Xin nghỉ", { rel: 3, gamble: { p: 0.8, win: {}, lose: { happy: -2, log: "Sếp không vui." } } })], def: 0 })),
  M("m_safety", [20, 60], (c) => c.worker, any, (c) => ({ title: "Máy hỏng", text: "Cái máy ở xưởng hở điện mấy hôm nay. Báo lên thì xưởng phải dừng, cả tổ mất lương ngày.",
    choices: [C("Báo", { rel: -2, trait: { fair: 1 }, gamble: { p: 0.6, win: { log: "Xưởng sửa máy. Không ai bị gì." }, lose: { happy: -2, log: "Quản đốc mắng bạn làm chậm việc." } } }), C("Kệ", { gamble: { p: 0.85, win: {}, lose: { health: -12, log: "Một người bị điện giật. Bạn là người biết trước." } } })], def: 0 }), { once: true }),
  M("m_quit_job", [24, 55], (c) => c.has_job && !c.farmer, (c) => n(c.happy < 40, c.tier !== "autopilot"), (c) => ({ title: "Ở hay đi", text: "Bạn chán việc này đã lâu. Có một chỗ khác, lương bằng, nhưng là thứ bạn thích.",
    choices: [C("Đi", { happy: 5, money: -0.05, agency: 0.02, custom: "job_new" }), C("Ở lại", { happy: -2 })], def: 1 }), { cooldownYears: 10 }),
  M("m_traffic_cop", [18, 70], (c) => c.gdp < 30000, any, (c) => ({ title: "Bị thổi phạt", text: "Cảnh sát giao thông thổi bạn vào lề. Lỗi nhỏ, biên bản thì mất cả buổi.",
    choices: [C("Dúi ít tiền", { money: -0.005, counters: { honest: -1 } }), C("Làm biên bản", { money: -0.01, happy: -2, counters: { honest: 1 } })], def: 0 }), { cooldownYears: 5 }),

  /* =============================== Người lớn: xóm làng & bạn bè =============================== */
  M("m_wedding_far", [20, 70], any, (c) => n(c.broke), (c) => ({ title: "Thiệp cưới", text: "Một người bạn cũ ở xa gửi thiệp cưới. Đi thì mất hai ngày công và tiền xe.",
    choices: [C("Đi", { money: -0.02, rel: 3 }), C("Gửi phong bì", { money: -0.01, rel: 1 }), C("Lờ đi", { rel: -2 })], def: 1 }), { cooldownYears: 4 }),
  M("m_funeral", [20, 85], (c) => !!role(c, "neighbor"), any, (c, N) => { const nb = role(c, "neighbor")!; return { npc: nb, title: "Đám tang", text: `Nhà ${N(nb)} có tang. Cả xóm đến giúp.`,
    choices: [C("Đến giúp mấy ngày", { rel: 3, money: -0.01, memory: { npc: nb, tag: "HELPED_IN_CRISIS", weight: 0.15, note: "giúp đám tang" } }), C("Đến thắp nén hương", { rel: 1 }), C("Bận", { memory: { npc: nb, tag: "REFUSED_HELP", weight: -0.1, note: "không đến đám tang" } })], def: 1 }; }, { cooldownYears: 12 }),
  M("m_gossip", [18, 80], (c) => !!role(c, "rival") && !!role(c, "neighbor"), any, (c, N) => { const r = role(c, "rival")!, nb = role(c, "neighbor")!; return { npc: r, title: "Chuyện của người ta", text: `${N(nb)} kể một chuyện không hay về ${N(r)} và chờ bạn góp lời.`,
    choices: [C("Góp thêm", { rel: 2, memory: { npc: r, tag: "GOSSIP_HEARD_BAD", weight: -0.15, note: "nói xấu sau lưng" }, trust: { npc: nb, delta: 0.05 } }), C("Bênh vài câu", { memory: { npc: r, tag: "STOOD_UP_FOR_ME", weight: 0.12, note: "bênh khi bị nói xấu" } }), C("Đổi chủ đề", {})], def: 2 }; }, { cooldownYears: 6 }),
  M("m_village_meeting", [25, 80], any, (c) => n(c.poor_country, c.tier !== "autopilot"), (c) => ({ title: "Họp xóm", text: "Xóm họp bàn chuyện làm lại con đường. Ai cũng than, không ai muốn đứng ra.",
    choices: [C("Đứng ra lo", { rel: 4, happy: -2, money: -0.02, trait: { coop: 1 }, agency: 0.01 }), C("Góp tiền, không góp sức", { money: -0.02, rel: 1 }), C("Ngồi nghe", {})], def: 2 }), { requires_open: ["village_trust"] }),
  M("m_lend_bike", [18, 70], (c) => !!role(c, "neighbor"), any, (c, N) => { const nb = role(c, "neighbor")!; return { npc: nb, title: "Mượn xe", text: `${N(nb)} hỏi mượn xe máy đi việc gấp.`,
    choices: [C("Cho mượn", { gamble: { p: 0.85, win: { trust: { npc: nb, delta: 0.08 } }, lose: { money: -0.03, log: `${N(nb)} trả xe, xước một bên.` } } }), C("Bảo xe hỏng", { trust: { npc: nb, delta: -0.05 }, counters: { honest: -1 } })], def: 0 }; }),
  M("m_stranger_crash", [18, 80], any, (c) => n(c.traits.coop > 0), (c) => ({ title: "Tai nạn bên đường", text: "Một người lạ ngã xe, nằm bất động. Xe cộ vẫn chạy qua.",
    choices: [C("Dừng lại giúp", { counters: { kind: 2 }, happy: 2, gamble: { p: 0.9, win: { log: "Bạn đưa người ấy vào viện. Người nhà họ cảm ơn rối rít." }, lose: { money: -0.05, log: "Người nhà họ nghi bạn gây tai nạn. Mất cả buổi giải thích." } } }), C("Đi tiếp", { happy: -2 })], def: 0 }), { cooldownYears: 12 }),
  M("m_temple", [20, 85], any, (c) => n(c.poor_country, h(c, "faith") > 0), (c) => ({ title: "Công đức", text: "Ngôi chùa (đền, nhà thờ) trong làng kêu gọi đóng góp sửa mái.",
    choices: [C("Góp", { money: -0.02, counters: { faith: 1 }, rel: 2 }), C("Góp công", { health: -1, counters: { faith: 1 }, rel: 3 }), C("Thôi", {})], def: 0 }), { cooldownYears: 6 }),
  M("m_friend_pitch", [22, 55], (c) => !!role(c, "childhood_friend"), (c) => n(op(c, role(c, "childhood_friend")) > 0.2), (c, N) => { const f = role(c, "childhood_friend")!; return { npc: f, title: `${N(f)} rủ bán hàng online`, text: `${N(f)} muốn bạn góp một ít vốn nhập hàng về bán thử.`,
    choices: [C("Góp", { game: { npc: f, move: "cooperate", stake_frac: 0.08 } }), C("Từ chối", { trust: { npc: f, delta: -0.03 } })], def: 0 }; }, { cooldownYears: 10 }),
  M("m_sibling_small", [20, 65], (c) => !!role(c, "sibling"), any, (c, N) => { const s = role(c, "sibling")!; return { npc: s, title: `${N(s)} cần ít tiền`, text: `${N(s)} gọi, giọng ngập ngừng. Cần một khoản nhỏ cho con đi học.`,
    choices: [C("Đưa", { money: -0.03, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.15, note: "giúp tiền học cho cháu" } }), C("Bảo đang khó", { memory: { npc: s, tag: "REFUSED_HELP", weight: -0.1, note: "không giúp tiền học" } })], def: 0 }; }, { cooldownYears: 6 }),
  M("m_mentor_ask", [22, 70], (c) => !!role(c, "mentor"), any, (c, N) => { const m = role(c, "mentor")!; return { npc: m, title: `${N(m)} nhờ việc`, text: `${N(m)} già rồi, nhờ bạn giúp sửa lại căn nhà dột.`,
    choices: [C("Giúp", { health: -1, rel: 2, memory: { npc: m, tag: "KEPT_PROMISE", weight: 0.2, note: "giúp sửa nhà" } }), C("Bận", { memory: { npc: m, tag: "REFUSED_HELP", weight: -0.1, note: "bận không đến" } })], def: 0 }; }, { cooldownYears: 10 }),

  /* =============================== Gia đình riêng =============================== */
  M("m_spouse_buy", [22, 70], (c) => c.married && !!role(c, "spouse"), (c) => n(c.broke, c.rat_race), (c, N) => { const s = role(c, "spouse")!; return { npc: s, title: `${N(s)} muốn mua`, text: vary("sbuy", c.age, [`${N(s)} muốn đổi cái tủ lạnh cũ.`, `${N(s)} muốn mua chiếc xe máy mới cho đỡ hỏng vặt.`]),
    choices: [C("Mua", { money: -0.06, trust: { npc: s, delta: 0.06 }, happy: 2 }), C("Để sau", { trust: { npc: s, delta: -0.06 } })], def: 0 }; }, { cooldownYears: 5 }),
  M("m_spouse_fight", [22, 75], (c) => c.married && !!role(c, "spouse"), (c) => n(c.scarcity, c.rat_race, h(c, "drink") >= 3), (c, N) => { const s = role(c, "spouse")!; return { npc: s, title: "Cãi nhau", text: vary("sfight", c.age, [`${N(s)} trách bạn về muộn mà không gọi.`, `Hai người cãi nhau vì chuyện tiền nong.`, `${N(s)} nói bạn chẳng bao giờ nghe.`]),
    choices: [C("Xin lỗi trước", { trust: { npc: s, delta: 0.08 }, happy: -1 }), C("Cãi cho ra lẽ", { trust: { npc: s, delta: -0.1 }, trait: { bold: 1 } }), C("Bỏ ra ngoài", { trust: { npc: s, delta: -0.06 }, counters: { drink: 1 } })], def: 0 }; }, { cooldownYears: 3 }),
  M("m_anniversary", [24, 80], (c) => c.married && !!role(c, "spouse"), any, (c, N) => { const s = role(c, "spouse")!; return { npc: s, title: "Ngày cưới", text: `Hôm nay là ngày cưới. ${N(s)} không nhắc.`,
    choices: [C("Nhớ ra, nấu một bữa", { trust: { npc: s, delta: 0.08 }, happy: 2 }), C("Quên", { trust: { npc: s, delta: -0.04 } })], def: 0 }; }, { cooldownYears: 5 }),
  M("m_child_toy", [24, 55], (c) => c.kids_alive > 0 && !!role(c, "child"), (c) => n(c.broke), (c, N) => { const k = role(c, "child")!; return { npc: k, title: `${N(k)} xin quà`, text: `${N(k)} xin món đồ chơi mà bạn bè đứa nào cũng có.`,
    choices: [C("Mua", { money: -0.02, trust: { npc: k, delta: 0.06 } }), C("Giải thích nhà mình chưa có", { trust: { npc: k, delta: -0.02 }, counters: { save: 1 } })], def: 0 }; }, { cooldownYears: 4 }),
  M("m_child_homework", [26, 60], (c) => c.kids_school > 0 && !!role(c, "child"), (c) => n(c.bandwidth < 40), (c, N) => { const k = role(c, "child")!; return { npc: k, title: "Bài tập của con", text: `${N(k)} ngồi khóc với bài toán. Bạn vừa đi làm về, mệt rã.`,
    choices: [C("Ngồi kèm", { bw: -4, trust: { npc: k, delta: 0.08 } }), C("Bảo tự làm", { trust: { npc: k, delta: -0.04 } })], def: 0 }; }, { cooldownYears: 3 }),
  M("m_child_bullied", [28, 60], (c) => c.kids_school > 0 && !!role(c, "child"), any, (c, N) => { const k = role(c, "child")!; return { npc: k, title: `${N(k)} bị bắt nạt`, text: `${N(k)} về nhà với vết bầm và không chịu nói.`,
    choices: [C("Lên trường làm cho ra lẽ", { trust: { npc: k, delta: 0.12 }, happy: -1, memory: { npc: k, tag: "STOOD_UP_FOR_ME", weight: 0.2, note: "lên trường bênh con" } }), C("Dạy con tự đánh trả", { trust: { npc: k, delta: 0.04 } }), C("Bảo con chịu khó", { trust: { npc: k, delta: -0.08 } })], def: 0 }; }, { once: true }),
  M("m_child_path", [38, 65], (c) => c.kids_teen > 0 && !!role(c, "child"), any, (c, N) => { const k = role(c, "child")!; return { npc: k, title: `${N(k)} chọn đường`, text: `${N(k)} muốn học thứ bạn không hiểu và không chắc kiếm ra tiền.`,
    choices: [C("Để con chọn", { trust: { npc: k, delta: 0.15 }, agency: 0.01 }), C("Ép theo nghề chắc ăn", { trust: { npc: k, delta: -0.15 }, memory: { npc: k, tag: "HUMILIATED_ME", weight: -0.15, note: "bị ép chọn nghề" } })], def: 1 }; }, { once: true }),
  M("m_inlaw", [22, 60], (c) => c.married, any, (c) => ({ title: "Nhà bên kia", text: "Nhà vợ/chồng góp ý chuyện bạn nuôi con, lần thứ ba trong tháng.",
    choices: [C("Nhịn", { happy: -2, rel: 2 }), C("Nói thẳng", { rel: -3, agency: 0.01, trait: { bold: 1 } })], def: 0 }), { cooldownYears: 6 }),
  M("m_call_parent", [20, 75], (c) => !!role(c, "mother") || !!role(c, "father"), (c) => n(c.migrated, c.parent_old, c.flags.has("left_home")), (c, N) => { const p = (role(c, "mother") ?? role(c, "father"))!; return { npc: p, title: `Cuộc gọi của ${N(p)}`, text: `${N(p)} gọi lúc bạn đang bận. Lần trước bạn cũng không nghe.`,
    choices: [C("Nghe", { trust: { npc: p, delta: 0.06 }, bw: -1 }), C("Lát gọi lại", { trust: { npc: p, delta: -0.04 } })], def: 0 }; }, { cooldownYears: 3 }),

  /* =============================== Tuổi già =============================== */
  M("m_will", [60, 90], (c) => c.kids_alive > 0, any, (c) => ({ title: "Di chúc", text: "Bạn nghĩ đến chuyện viết di chúc. Nói ra thì các con sẽ nghĩ ngợi.",
    choices: [C("Viết, chia đều", { trait: { fair: 1 }, flags: ["will_even"] }), C("Viết, cho đứa chăm mình nhiều hơn", { flags: ["will_care"] }), C("Chưa", {})], def: 2 }), { once: true }),
  M("m_reconcile", [55, 90], (c) => c.enemies > 0, any, (c, N) => { const id = Object.entries(c.opinion).sort((a, b) => a[1] - b[1])[0]![0]; return { npc: id, title: `${N(id)} vẫn còn đó`, text: `Ở tuổi này, ${N(id)} và bạn vẫn không nhìn mặt nhau. Một người quen bảo ${N(id)} ốm.`,
    choices: [C("Đến thăm", { memory: { npc: id, tag: "STOOD_UP_FOR_ME", weight: 0.4, note: "đến thăm lúc ốm" }, happy: 3, agency: 0.02 }), C("Để vậy", { happy: -1 })], def: 1 }; }, { cooldownYears: 10, causes: (c) => { const id = Object.entries(c.opinion).sort((a, b) => a[1] - b[1])[0]?.[0]; return id ? [prov.opinion(id)] : []; } }),
  M("m_grandchild", [55, 90], (c) => c.kids_alive > 0, any, (c) => ({ title: "Đứa cháu", text: "Đứa cháu nội (ngoại) được gửi sang ở với bạn cả mùa hè.",
    choices: [C("Dạy nó những gì mình biết", { happy: 4, know: 1, rel: 2 }), C("Để nó xem điện thoại", { happy: 1 })], def: 0 }), { cooldownYears: 5 }),
  M("m_keep_working", [60, 75], (c) => c.has_job || c.retired, (c) => n(c.broke), (c) => ({ title: "Nghỉ hẳn hay làm tiếp", text: "Có người nhờ bạn trông coi việc bán thời gian.",
    choices: [C("Nhận", { money: 0.1, health: -2 }), C("Nghỉ ngơi", { happy: 3 })], def: 0 }), { cooldownYears: 5 }),

  /* =============================== Hệ quả của thói quen (ngưỡng) =============================== */
  { id: "t_smoker", category: "fuse", urgency: 82, cooldownYears: 99, once: true, tension: 10,
    prerequisites: (c) => h(c, "smoke") >= 6 && c.age >= 38, specificity: () => 4, causes: () => [prov.flag("habit_smoke")],
    build: (c) => ({ title: "Cơn ho không dứt", text: `Bác sĩ xem phim phổi rất lâu. Bạn đã hút thuốc ${c.age - (c.counters.smoke_since ?? 16)} năm.`,
      choices: [C("Bỏ thuốc ngay", { counters: { smoke: -10 }, health: -4, happy: -4, log: "Bạn bỏ thuốc. Ba tháng đầu như địa ngục." }), C("Hút ít đi", { counters: { smoke: -2 }, health: -8, log: "Bạn hứa hút ít đi." })], def: 0 }) },
  { id: "t_drinker", category: "fuse", urgency: 82, cooldownYears: 12, tension: 12,
    prerequisites: (c) => h(c, "drink") >= 6 && c.age >= 28, causes: () => [prov.flag("habit_drink")], specificity: () => 4,
    build: (c, N) => { const s = c.cast.spouse; return { ...(s ? { npc: s } : {}), title: "Rượu", text: `${s ? `${N(s)} đếm vỏ chai dưới gầm bếp rồi nhìn bạn.` : "Bạn tỉnh dậy ở một chỗ không nhớ đã đến bằng cách nào."} Đã nhiều năm bạn không qua nổi một ngày không uống.`,
      choices: [C("Cai", { counters: { drink: -8 }, bw: -6, happy: -5, health: 4, log: "Bạn cai rượu. Có những đêm phải nắm chặt tay." }, "Đau, nhưng làm được"), C("Uống ít lại", { counters: { drink: -2 }, ...(s ? { trust: { npc: s, delta: -0.1 } } : {}), log: "Bạn hứa sẽ uống ít lại." }), C("Ai cũng uống mà", { health: -6, ...(s ? { trust: { npc: s, delta: -0.2 } } : {}), rel: -5, log: "Bạn gạt đi." })], def: 1 }; } },
  { id: "t_gambler", category: "fuse", urgency: 85, cooldownYears: 99, once: true, tension: 14,
    prerequisites: (c) => h(c, "gamble") >= 5, causes: () => [prov.flag("habit_gamble")], specificity: () => 4,
    build: () => ({ title: "Món nợ đỏ đen", text: "Những ván bài nhỏ cộng lại thành một con số bạn không dám nói với ai.",
      choices: [C("Thú nhận với gia đình", { custom: "borrow:0.4", rel: -6, happy: -6, counters: { gamble: -6 }, log: "Bạn kể hết. Cả nhà im lặng, rồi cùng gánh." }), C("Gỡ thêm một ván", { gamble: { p: 0.3, win: { money: 0.3, counters: { gamble: 1 }, log: "Bạn gỡ được. Lần này." }, lose: { custom: "borrow:0.8", happy: -10, counters: { gamble: 1 }, log: "Bạn thua tiếp. Nợ gấp đôi." } } })], def: 0 }) },
  { id: "t_fit", category: "fuse", urgency: 60, cooldownYears: 99, once: true, tension: -4,
    prerequisites: (c) => h(c, "exercise") >= 6 && c.age >= 45, specificity: () => 3, causes: () => [prov.flag("habit_exercise")],
    build: (c) => ({ title: "Cái chân còn khỏe", text: `Bạn bè cùng tuổi bắt đầu đau lưng, mỏi gối. Bạn vẫn chạy được năm cây số.`,
      choices: [C("Tiếp tục", { health: 6, happy: 4, log: "Những buổi sáng năm giờ ấy giờ trả lại cho bạn." })], def: 0 }) },
  { id: "t_reader", category: "fuse", urgency: 60, cooldownYears: 99, once: true, tension: -2,
    prerequisites: (c) => h(c, "read") >= 6 && c.age >= 25 && c.has_job, causes: () => [prov.flag("habit_read")], specificity: () => 3,
    build: () => ({ title: "Người hay đọc", text: "Một người bạn quen ở lớp học buổi tối giới thiệu bạn vào một chỗ làm tốt hơn. \"Tôi nhớ anh là người chịu đọc.\"",
      choices: [C("Nhận", { income_mult: 1.15, agency: 0.03, log: "Những cuốn sách cũ cuối cùng cũng trả tiền." }), C("Ở lại chỗ cũ", {})], def: 0 }) },
  { id: "t_saver", category: "fuse", urgency: 55, cooldownYears: 99, once: true, tension: -4,
    prerequisites: (c) => h(c, "save") >= 6 && c.age >= 35, causes: () => [prov.flag("habit_save")], specificity: () => 3,
    build: () => ({ title: "Khoản để dành", text: "Những đồng lẻ để dành nhiều năm giờ thành một khoản đủ để không phải vay khi có chuyện.",
      choices: [C("Giữ làm quỹ phòng thân", { money: 0.2, bw: 6, log: "Bạn ngủ ngon hơn hẳn." }), C("Mở một cửa hàng nhỏ", { money: -0.1, income_mult: 1.12, agency: 0.03, log: "Bạn mở một cửa hàng nhỏ của riêng mình." })], def: 0 }) },
  { id: "t_honest", category: "fuse", urgency: 50, cooldownYears: 99, once: true, tension: -4,
    prerequisites: (c) => h(c, "honest") >= 5 && c.age >= 30, causes: () => [prov.flag("habit_honest")], specificity: () => 3,
    build: () => ({ title: "Tiếng thật thà", text: "Ở chợ người ta bảo nhau: hàng của người này không cần kiểm. Bạn không nhớ mình đã bắt đầu được tin như thế từ bao giờ.",
      choices: [C("Nhận", { rel: 6, income_mult: 1.06, log: "Danh tiếng thật thà mang lại khách quen." })], def: 0 }) },
  { id: "t_liar", category: "fuse", urgency: 70, cooldownYears: 99, once: true, tension: 8,
    prerequisites: (c) => h(c, "honest") <= -5 && c.age >= 25, causes: () => [prov.flag("habit_liar")], specificity: () => 3,
    build: () => ({ title: "Không ai tin", text: "Lần này bạn nói thật, nhưng chẳng ai tin. Những lời nói dối nhỏ nhiều năm cộng lại thành một cái tiếng.",
      choices: [C("Chịu", { rel: -6, money: -0.1, log: "Bạn mất một mối làm ăn chỉ vì không ai tin lời bạn." })], def: 0 }) },
  { id: "t_kind", category: "fuse", urgency: 60, cooldownYears: 99, once: true, tension: -6,
    prerequisites: (c) => h(c, "kind") >= 6 && (c.scarcity || c.rat_race), causes: () => [prov.flag("habit_kind")], specificity: () => 3,
    build: () => ({ title: "Những người bạn từng giúp", text: "Nghe tin bạn khó khăn, những người bạn từng giúp lúc nhỏ nhặt mỗi người góp một ít.",
      choices: [C("Nhận", { money: 0.3, happy: 6, bw: 6, log: "Những bát cơm, những lần dừng xe năm xưa quay về." })], def: 0 }) },
];
