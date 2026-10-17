/**
 * Branch packs, third batch — the temperament cascade.
 *
 * The age-3 choice (temper_*) is the root of the tree. This file makes it reach the whole life:
 *  - Life-event variants: the same thing happens to everyone (a parent falls ill, a sibling marries), but the
 *    dilemma you face is the one your temperament walks you into. Variants share a `group`, so one blocks the others.
 *  - Recurring temperament dilemmas from childhood to old age.
 *  - Echo cards for the age-5 choice (temper2_*).
 */
import type { Storylet, FactContext, StoryletView, Choice, CastRole, Effect } from "./types.ts";
import { prov } from "./Causality.ts";

const C = (label: string, effects: Effect, hint?: string, extra: Partial<Choice> = {}): Choice => ({ label, ...(hint !== undefined ? { hint } : {}), effects, ...extra });
const f = (c: FactContext, x: string) => c.flags.has(x);
const role = (c: FactContext, r: CastRole): string | undefined => c.cast[r];
type Build = (c: FactContext, N: (id: string) => string) => StoryletView;
const T = (title: string, text: string, choices: Choice[], def = 0, more: Partial<StoryletView> = {}): StoryletView => ({ title, text, choices, def, ...more });
const vary = (id: string, age: number, arr: string[]): string => { let x = age * 31; for (const ch of id) x = (x * 33 + ch.charCodeAt(0)) >>> 0; return arr[x % arr.length]!; };

/** Recurring branch card. */
function R(id: string, gate: string | ((c: FactContext) => boolean), ages: [number, number], cooldown: number, build: Build, extra: Partial<Storylet> = {}): Storylet {
  const g = typeof gate === "string" ? (c: FactContext) => f(c, gate) : gate;
  const causes = typeof gate === "string" ? () => [prov.flag(gate)] : undefined;
  return { id, category: "micro", urgency: 18, cooldownYears: cooldown, tension: 1, prerequisites: (c) => c.age >= ages[0] && c.age <= ages[1] && g(c), specificity: () => 4, ...(causes ? { causes } : {}), build, ...extra };
}

/* ------------------------------------------------------------------ life-event variants */

const parent = (c: FactContext) => role(c, "mother") ?? role(c, "father");
const psBase = (c: FactContext) => c.parent_sick && c.age >= 20 && !!parent(c);
function PS(id: string, gate: string, spec: number, build: Build): Storylet {
  return { id, group: "parent_sick", category: "family", urgency: 90, cooldownYears: 6, tension: 14, prerequisites: (c) => psBase(c) && f(c, gate), specificity: () => spec, causes: () => [prov.flag(gate)], build };
}
const sibBase = (c: FactContext) => c.age >= 22 && c.age <= 45 && !!role(c, "sibling");
function SW(id: string, gate: string, build: Build): Storylet {
  return { id, group: "sibling_wedding", category: "family", urgency: 60, cooldownYears: 99, once: true, tension: 4, prerequisites: (c) => sibBase(c) && f(c, gate), specificity: () => 6, causes: () => [prov.flag(gate)], build };
}

export const LIFE_VARIANTS: Storylet[] = [
  PS("ps_curious", "temper_curious", 7, (c, N) => { const p = parent(c)!; return T(`${N(p)} ốm nặng`, `Bác sĩ nói bệnh của ${N(p)} khó chữa. Đêm đó bạn đọc hết mọi thứ tìm được, và thấy một phác đồ mới đang thử nghiệm ở bệnh viện tuyến trên.`, [
    C("Xin cho bố mẹ vào nhóm thử nghiệm", { money: -0.1, know: 3, gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.25 }, log: "Phác đồ mới có tác dụng. Bác sĩ ngạc nhiên." }, lose: { happy: -6, log: "Không có tác dụng. Bạn tự hỏi mình đã đúng chưa." } } }, "Có thể là hy vọng, có thể là thí nghiệm"),
    C("Theo phác đồ cũ, trả viện phí", { money: -0.35, trust: { npc: p, delta: 0.15 } }),
    C("Đưa về nhà, tự học cách chăm", { income_mult: 0.9, know: 2, rel: 3, trust: { npc: p, delta: 0.25 } })], 0, { npc: p }); }),
  PS("ps_bold", "temper_bold", 7, (c, N) => { const p = parent(c)!; return T(`${N(p)} ốm nặng`, `Bệnh viện trong nước bảo khó. Một người quen nói có bệnh viện ở nước ngoài chữa được, nhưng phải có tiền trong một tuần.`, [
    C("Vay nóng, đưa đi ngay", { custom: "borrow:0.8", gamble: { p: 0.55, win: { trust: { npc: p, delta: 0.3 }, log: "Ca mổ thành công. Món nợ thì còn đó." }, lose: { happy: -8, log: "Tiền mất, người cũng không giữ được lâu." } } }, "Đặt cược lớn nhất đời"),
    C("Bán tài sản trong nhà", { money: -0.5, happy: -3, trust: { npc: p, delta: 0.2 } }),
    C("Chữa trong nước", { money: -0.25 })], 0, { npc: p }); }),
  PS("ps_kind", "temper_kind", 7, (c, N) => { const p = parent(c)!; const sib = role(c, "sibling"); return T(`${N(p)} ốm nặng`, `${N(p)} cần người ở cạnh suốt ngày đêm. ${sib ? `${N(sib)} có con nhỏ, không đi được.` : "Không còn ai khác."} Bạn biết mình sẽ là người ở lại.`, [
    C("Nghỉ việc về chăm", { custom: "job_lose", rel: 5, trust: { npc: p, delta: 0.35 }, counters: { kind: 2 }, ...(sib ? { memory: { npc: sib, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "về chăm bố mẹ" } } : {}) }, "Mất việc, không mất người"),
    C("Thuê người chăm, chiều nào cũng ghé", { money: -0.3, bw: -5, trust: { npc: p, delta: 0.15 } }),
    C("Đón về ở chung", { money: -0.1, rel: 2, bw: -6, health: -3, trust: { npc: p, delta: 0.3 } })], 0, { npc: p }); }),
  PS("ps_tough", "temper_tough", 7, (c, N) => { const p = parent(c)!; return T(`${N(p)} ốm nặng`, `Viện phí mỗi tháng bằng ba tháng lương. Bạn tính: nếu làm thêm ca đêm thì vừa đủ.`, [
    C("Làm thêm ca đêm, một mình gánh", { money: -0.2, health: -6, bw: -6, trust: { npc: p, delta: 0.2 }, counters: { exercise: -1 } }, "Đủ tiền, cạn sức"),
    C("Gọi cả họ họp, chia nhau", { rel: 3, money: -0.12, gamble: { p: 0.6, win: { log: "Lần đầu tiên bạn mở miệng nhờ, và mọi người góp." }, lose: { rel: -3, log: "Cuộc họp thành cãi nhau." } } }),
    C("Để anh chị em lo", { happy: -6, close_doors: ["family_table"], secret: { tag: "ABANDONED_PARENT", severity: 0.4, fuse_years: [3, 12], note: "không lo cho bố mẹ lúc ốm" } })], 0, { npc: p }); }),
  PS("ps_migrant", "path_migrant", 8, (c, N) => { const p = parent(c)!; return T(`Tin nhắn từ quê`, `${N(p)} nhập viện. Bạn đang ở xứ người. Về thì mất việc, có thể không quay lại được.`, [
    C("Bay về", { custom: "return_home", money: -0.2, trust: { npc: p, delta: 0.35 }, rel: 4 }, "Có thể mất đường quay lại"),
    C("Ở lại, gửi tiền về", { money: -0.35, trust: { npc: p, delta: 0.05 }, happy: -5 }),
    C("Gọi video mỗi tối", { happy: -8, trust: { npc: p, delta: -0.05 } })], 1, { npc: p }); }),
  PS("ps_nurse", "job_health", 8, (c, N) => { const p = parent(c)!; return T(`${N(p)} nằm ở khoa bạn làm`, `Bạn đọc bệnh án và biết rõ hơn ai hết tiên lượng. Cả nhà nhìn bạn chờ một câu.`, [
    C("Nói thật với cả nhà", { counters: { honest: 2 }, happy: -4, rel: 2 }),
    C("Nói tránh, giữ hy vọng cho mọi người", { counters: { honest: -1 }, rel: 1 }),
    C("Xin chuyển ca để tự chăm", { income_mult: 0.95, trust: { npc: p, delta: 0.3 } })], 0, { npc: p }); }),

  SW("sw_bold", "temper_bold", (c, N) => { const s = role(c, "sibling")!; return T(`${N(s)} cưới`, `Cả họ trông vào bạn. Bạn có thể làm một đám cưới to nhất xóm cho ${N(s)}, nếu dám vay.`, [
    C("Vay, làm thật to", { custom: "borrow:0.4", rel: 6, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.3, note: "lo đám cưới to" } }, "Nở mày nở mặt, nợ ba năm"),
    C("Làm vừa sức", { money: -0.15, rel: 2, memory: { npc: s, tag: "KEPT_PROMISE", weight: 0.15, note: "lo đám cưới" } })], 1, { npc: s }); }),
  SW("sw_kind", "temper_kind", (c, N) => { const s = role(c, "sibling")!; return T(`${N(s)} cưới`, `${N(s)} lén hỏi mượn khoản tiết kiệm của bạn để đủ tiền thách cưới. Bạn đang để dành mua nhà.`, [
    C("Cho mượn hết", { money: -0.4, counters: { kind: 2 }, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.35, note: "cho mượn tiền cưới" }, promise: { to: s, what: "nhận lại tiền cưới đã cho mượn", years: 4 } }),
    C("Cho mượn một nửa", { money: -0.2, memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.15, note: "cho mượn tiền cưới" } }),
    C("Từ chối", { memory: { npc: s, tag: "REFUSED_HELP", weight: -0.25, note: "không cho mượn tiền cưới" } })], 0, { npc: s }); }),
  SW("sw_tough", "temper_tough", (c, N) => { const s = role(c, "sibling")!; return T(`${N(s)} cưới`, `Đám cưới rơi đúng tuần cao điểm. Xin nghỉ thì mất thưởng cả năm.`, [
    C("Xin nghỉ về dự", { income_mult: 0.98, rel: 3, memory: { npc: s, tag: "KEPT_PROMISE", weight: 0.2, note: "về dự đám cưới" } }),
    C("Đi làm, gửi tiền mừng gấp đôi", { money: -0.1, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.1, note: "không về dự cưới" } })], 0, { npc: s }); }),
  SW("sw_curious", "temper_curious", (c, N) => { const s = role(c, "sibling")!; return T(`${N(s)} muốn cưới người ngoài`, `${N(s)} yêu một người khác đạo, khác vùng. Cả họ phản đối. ${N(s)} chỉ hỏi bạn: "Mày đứng về phía nào?"`, [
    C("Đứng về phía em/anh/chị", { rel: -3, agency: 0.02, memory: { npc: s, tag: "STOOD_UP_FOR_ME", weight: 0.4, note: "đứng về phía mình lúc cả họ phản đối" } }, "Mất lòng cả họ"),
    C("Đứng về phía bố mẹ", { rel: 2, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.3, note: "không bênh lúc cưới" } }),
    C("Im lặng", {})], 0, { npc: s }); }),
];

/* ------------------------------------------------------------------ temperament, childhood to old age */

export const TEMPER_LIFE: Storylet[] = [
  /* tò mò */
  R("tc_cu_take", "temper_curious", [7, 14], 3, (c) => T("Tháo ra xem", vary("cutake", c.age, ["Cái đài của bố tự nhiên im. Bạn có một cái tua vít.", "Chiếc đồng hồ của ông nằm trong ngăn kéo, đã chết từ lâu."]), [
    C("Tháo ra", { know: 2, gamble: { p: 0.5, win: { happy: 3, flags: ["tinkerer"], log: "Nó chạy lại. Cả nhà ngạc nhiên." }, lose: { happy: -2, log: "Nó không bao giờ chạy lại nữa. Bạn bị mắng." } } }), C("Thôi", {})])),
  R("tc_cu_library", "temper_curious", [9, 17], 3, () => T("Thư viện", "Thư viện huyện có một tủ sách cũ không ai mượn.", [
    C("Đọc hết cái tủ", { know: 3, counters: { read: 1 }, rel: -1 }), C("Ra sân đá bóng", { rel: 2, health: 1 })])),
  R("tm3_cu_side", "temper_curious", [22, 55], 6, (c) => T("Một ý tưởng", vary("cuside", c.age, ["Bạn nghĩ ra một cách làm nhanh gấp đôi việc ở chỗ làm.", "Bạn để ý một thứ mà cả phố cần nhưng chưa ai bán."]), [
    C("Thử làm ngoài giờ", { bw: -3, gamble: { p: 0.4, win: { income_mult: 1.08, log: "Nó chạy. Người ta bắt đầu hỏi bạn." }, lose: { money: -0.05, log: "Không chạy. Nhưng bạn học được vài thứ." } } }), C("Ghi vào sổ, để đấy", {})])),
  R("tm3_cu_travel", "temper_curious", [25, 70], 7, () => T("Đi xa", "Bạn chưa từng thấy biển phía Bắc, hay núi phía Tây. Có một chuyến đi rẻ.", [
    C("Đi", { money: -0.05, happy: 4, know: 2, flags: ["seen_world"] }), C("Để dành tiền", { counters: { save: 1 } })])),
  R("tm3_cu_old", "temper_curious", [60, 90], 6, () => T("Học cái mới lúc già", "Cháu cài cho bạn một ứng dụng học ngoại ngữ.", [
    C("Học mỗi ngày", { know: 3, happy: 2 }), C("Già rồi", {})])),
  /* gan */
  R("tc_bo_dare", "temper_bold", [8, 15], 3, (c) => T("Thách", vary("bodare", c.age, ["Lũ bạn thách bạn nhảy từ thành cầu xuống sông.", "Có đứa thách bạn trèo lên mái nhà kho."]), [
    C("Nhận thách", { gamble: { p: 0.75, win: { rel: 3, trait: { bold: 1 }, log: "Bạn làm được. Cả bọn nể." }, lose: { health: -8, log: "Bạn ngã. Gãy tay." } } }), C("Không", { rel: -1 })])),
  R("tc_bo_trade", "temper_bold", [10, 17], 3, () => T("Buôn đầu tiên", "Bạn có thể mua sỉ một túi đồ chơi ở chợ rồi bán lại cho lũ trẻ trong trường.", [
    C("Làm", { money: 0.01, flags: ["kid_trader"], gamble: { p: 0.7, win: { happy: 2 }, lose: { log: "Thầy giáo tịch thu hết." } } }), C("Thôi", {})])),
  R("tm3_bo_deal", "temper_bold", [24, 60], 6, (c) => T("Một phi vụ", vary("bodeal", c.age, ["Một người quen rủ góp vốn nhập một lô hàng, lãi gấp đôi trong ba tháng.", "Có một miếng đất ven đô đang rẻ vì dính quy hoạch treo."]), [
    C("Nhảy vào", { gamble: { p: 0.45, win: { money: 0.6, log: "Trúng." }, lose: { money: -0.4, log: "Trượt." } } }), C("Chỉ góp ít", { gamble: { p: 0.45, win: { money: 0.15 }, lose: { money: -0.1 } } }), C("Đứng ngoài", {})], 2)),
  R("tm3_bo_stand", "temper_bold", [20, 65], 7, () => T("Đứng ra", "Cả xóm bực vì một chuyện bất công, nhưng không ai dám nói với chính quyền.", [
    C("Bạn đứng ra nói", { rel: 4, agency: 0.02, gamble: { p: 0.6, win: { flags: ["leader"] }, lose: { income_mult: 0.97, log: "Bạn bị để ý." } } }), C("Kệ", {})])),
  R("tm3_bo_old", "temper_bold", [60, 90], 7, () => T("Chưa chịu già", "Con cháu bảo bạn nghỉ ngơi. Bạn lại muốn làm thêm một chuyện cuối.", [
    C("Làm", { happy: 3, health: -2, money: -0.05 }), C("Nghe con cháu", { rel: 2 })])),
  /* tốt bụng */
  R("tc_ki_share", "temper_kind", [7, 15], 3, (c) => T("Chia", vary("kishare", c.age, ["Đứa bạn ngồi cạnh không có bút.", "Một con chó con bị bỏ ở đầu ngõ."]), [
    C("Giúp", { counters: { kind: 1 }, happy: 2 }), C("Không phải việc mình", {})])),
  R("tc_ki_sib", (c) => f(c, "temper_kind") && !!role(c, "sibling"), [8, 17], 4, (c, N) => { const s = role(c, "sibling")!; return T("Nhận lỗi thay", `${N(s)} làm hỏng chiếc xe đạp của bố, mặt tái mét.`, [
    C("Nhận thay", { happy: -2, memory: { npc: s, tag: "STOOD_UP_FOR_ME", weight: 0.25, note: "nhận lỗi thay hồi nhỏ" } }), C("Để nó tự nhận", {})], 0, { npc: s }); }),
  R("tm3_ki_neighbor", "temper_kind", [22, 75], 6, (c) => T("Nhà bên", vary("kinb", c.age, ["Bà cụ nhà bên sống một mình, mấy hôm nay không thấy mở cửa.", "Nhà bên có đứa trẻ ngày nào cũng ngồi một mình đến tối."]), [
    C("Sang xem", { counters: { kind: 1 }, rel: 2, bw: -1 }), C("Không muốn xen vào", {})])),
  R("tm3_ki_lend", "temper_kind", [22, 65], 6, () => T("Vay tiền", "Một người bạn cũ vay tiền, giọng run. Bạn biết khả năng cao không đòi lại được.", [
    C("Cho vay", { money: -0.1, counters: { kind: 1 }, gamble: { p: 0.4, win: { money: 0.1, rel: 3, log: "Họ trả lại, kèm một con gà." }, lose: { log: "Bạn không bao giờ nhận lại." } } }), C("Cho hẳn một ít", { money: -0.03, counters: { kind: 1 } }), C("Từ chối", {})], 1)),
  R("tm3_ki_old", "temper_kind", [60, 90], 6, () => T("Trông cháu", "Con cái đi làm xa, gửi cháu cho bạn.", [
    C("Nhận trông", { rel: 4, health: -2, happy: 3 }), C("Bảo chúng tự lo", { rel: -2, health: 1 })])),
  /* lì */
  R("tc_to_work", "temper_tough", [8, 16], 3, (c) => T("Phụ việc", vary("towork", c.age, ["Nhà đang mùa gặt, thiếu người.", "Bố bị đau lưng, không ai gánh nước."]), [
    C("Nghỉ học vài hôm phụ nhà", { know: -1, health: 1, rel: 2, trait: { coop: 1 } }), C("Vẫn đi học", { know: 1 })])),
  R("tc_to_cry", "temper_tough", [7, 13], 4, () => T("Không khóc", "Bạn ngã rách đầu gối, máu chảy. Mấy đứa khác nhìn.", [
    C("Đứng dậy, không khóc", { trait: { bold: 1 }, happy: -1 }), C("Khóc, chạy về nhà", { rel: 1 })])),
  R("tm3_to_injury", "temper_tough", [22, 60], 6, (c) => T("Đau mà không nói", vary("toinj", c.age, ["Bạn đau ngực mấy tuần nay.", "Vết thương ở tay mãi không lành."]), [
    C("Đi khám", { money: -0.03, health: 4 }), C("Chịu được", { gamble: { p: 0.7, win: {}, lose: { health: -10, log: "Nó không tự khỏi." } } })], 1)),
  R("tm3_to_hold", "temper_tough", [25, 65], 6, () => T("Giữ chặt", "Việc ở chỗ làm đang tệ. Ai cũng tính nhảy việc.", [
    C("Bám trụ", { income_mult: 1.02, bw: -2 }), C("Nhảy", { gamble: { p: 0.5, win: { income_mult: 1.12 }, lose: { income_mult: 0.92 } } })])),
  R("tm3_to_old", "temper_tough", [60, 90], 6, () => T("Vẫn ra đồng", "Bạn đã già, nhưng sáng nào cũng dậy làm như hồi trẻ.", [
    C("Làm tiếp", { health: 1, happy: 2 }), C("Nghỉ hẳn", { happy: -2 })])),
];

/* ------------------------------------------------------------------ echoes of the age-5 choice */

export const TEMPER2_ECHO: Storylet[] = [
  R("t5_curious", "temper2_curious", [11, 60], 8, () => T("Câu hỏi ngày đầu đi học", "Cô giáo năm lớp một từng bảo bạn hỏi nhiều quá. Hôm nay lại có một câu bạn muốn hỏi giữa cuộc họp.", [
    C("Hỏi", { know: 2, gamble: { p: 0.6, win: { rel: 2 }, lose: { rel: -2 } } }), C("Thôi", {})])),
  R("t5_bold", "temper2_bold", [11, 60], 8, () => T("Thói quen ngồi bàn đầu", "Từ ngày đầu đi học bạn đã chọn chỗ ngồi đầu. Hôm nay cũng có một chỗ ngồi đầu, trước mặt người quan trọng.", [
    C("Ngồi lên đầu, tự giới thiệu", { rel: 2, gamble: { p: 0.5, win: { income_mult: 1.04 }, lose: {} } }), C("Ngồi cuối", {})])),
  R("t5_kind", "temper2_kind", [11, 60], 8, () => T("Đứa ngồi một mình", "Ngày đầu đi học bạn đã ngồi cạnh đứa không ai chơi. Hôm nay có một người mới cũng đang đứng một mình.", [
    C("Lại gần", { rel: 2, counters: { kind: 1 } }), C("Thôi", {})])),
  R("t5_tough", "temper2_tough", [11, 60], 8, () => T("Không khóc lúc mẹ về", "Ngày đầu đi học bạn không khóc khi mẹ về. Hôm nay có chuyện buồn, và bạn lại không khóc.", [
    C("Giữ trong lòng", { bw: -2 }), C("Kể cho một người", { rel: 2, bw: 2 })])),
];
