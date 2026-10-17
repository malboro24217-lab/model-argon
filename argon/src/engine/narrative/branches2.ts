/**
 * Branch packs, second batch — mid-life density. Every job family, origin, temperament and spouse kind gets
 * recurring everyday dilemmas for ages 25–60, so the yearly decision budget is filled by the life's own branch
 * instead of generic filler.
 */
import type { Storylet, FactContext, StoryletView, Choice, CastRole, Effect } from "./types.ts";
import { repeatCap } from "./Matcher.ts";

const C = (label: string, effects: Effect, hint?: string, extra: Partial<Choice> = {}): Choice => ({ label, ...(hint !== undefined ? { hint } : {}), effects, ...extra });
const f = (c: FactContext, x: string) => c.flags.has(x);
const role = (c: FactContext, r: CastRole): string | undefined => c.cast[r];
type Build = (c: FactContext, N: (id: string) => string) => StoryletView;
const T = (title: string, text: string, choices: Choice[], def = 0, more: Partial<StoryletView> = {}): StoryletView => ({ title, text, choices, def, ...more });
/** Recurring branch card: gate flag(s), ages, cooldown. */
function R(id: string, gate: string | ((c: FactContext) => boolean), ages: [number, number], cooldown: number, build: Build): Storylet {
  const g = typeof gate === "string" ? (c: FactContext) => f(c, gate) : gate;
  return { id, category: "micro", urgency: 18, cooldownYears: cooldown, tension: 1, prerequisites: (c) => c.age >= ages[0] && c.age <= ages[1] && g(c), specificity: () => 4, maxPerLife: repeatCap(build), build };
}
const vary = (id: string, age: number, arr: string[]): string => { let x = age * 31; for (const ch of id) x = (x * 33 + ch.charCodeAt(0)) >>> 0; return arr[x % arr.length]!; };

export const BRANCHES2: Storylet[] = [
  /* ---------------- NÔNG ---------------- */
  R("fa2_pest", "job_farm", [18, 70], 6, (c) => T("Sâu rầy", vary("pest", c.age, ["Sâu rầy lan từ ruộng bên sang.", "Lá lúa vàng từng mảng, người ta bảo bệnh mới."]), [
    C("Phun thuốc liều cao cho chắc", { money: -0.04, health: -3, income_mult: 1.02 }), C("Làm theo cán bộ khuyến nông", { money: -0.02, know: 1 }), C("Để mặc, trời cho bao nhiêu ăn bấy nhiêu", { income_mult: 0.95 })])),
  R("fa2_borrow_seed", "job_farm", [18, 65], 5, () => T("Mua chịu phân bón", "Đại lý cho mua chịu phân bón, trả sau vụ, lãi tính theo tháng.", [
    C("Mua chịu", { custom: "borrow:0.1", income_mult: 1.03 }), C("Bón ít đi", { income_mult: 0.98 })])),
  R("fa2_harvest_help", (c) => f(c, "job_farm") && !!role(c, "neighbor"), [20, 70], 5, (c, N) => { const nb = role(c, "neighbor")!; return T("Đổi công", `Lúa nhà ${N(nb)} chín trước. ${N(nb)} nhờ bạn sang gặt, hứa vụ sau sang gặt lại.`, [
    C("Sang gặt", { health: -1, memory: { npc: nb, tag: "KEPT_PROMISE", weight: 0.12, note: "sang gặt đổi công" } }), C("Bận ruộng nhà", { memory: { npc: nb, tag: "REFUSED_HELP", weight: -0.08, note: "không sang gặt" } })], 0, { npc: nb }); }),
  R("fa2_child_city", (c) => f(c, "job_farm") && c.kids_teen > 0, [35, 65], 99, (c, N) => { const k = role(c, "child"); return T("Con muốn lên thành phố", `${k ? N(k) : "Đứa lớn"} không muốn làm ruộng như bố mẹ.`, [
    C("Cho đi", { rel: -2, money: -0.05, ...(k ? { trust: { npc: k, delta: 0.15 } } : {}) }), C("Giữ lại làm cùng", { income_mult: 1.05, ...(k ? { trust: { npc: k, delta: -0.15 } } : {}) })], 0, k ? { npc: k } : {}); }),

  /* ---------------- BUÔN BÁN ---------------- */
  R("mk2_tax", "job_market", [20, 65], 5, () => T("Quản lý thị trường", "Đoàn kiểm tra đi qua chợ. Ai cũng biết phải 'gửi' một ít để được yên.", [
    C("Gửi", { money: -0.02, counters: { honest: -1 } }), C("Không gửi, xuất trình hóa đơn", { gamble: { p: 0.5, win: { counters: { honest: 1 } }, lose: { money: -0.06, log: "Họ tìm ra lỗi khác để phạt." } } })])),
  R("mk2_neighbor_stall", (c) => f(c, "job_market") && !!role(c, "rival"), [22, 65], 6, (c, N) => { const r = role(c, "rival")!; return T("Sạp bên cạnh", `${N(r)} bán cùng mặt hàng ngay sạp bên, chèo kéo khách của bạn.`, [
    C("Hạ giá giành khách", { income_mult: 0.97, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.1, note: "giành khách ở chợ" } }), C("Rủ nhau chia mặt hàng", { gamble: { p: 0.55, win: { income_mult: 1.05, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "chia mặt hàng ở chợ" } }, lose: {} } }), C("Kệ", {})], 2, { npc: r }); }),
  R("mk2_supplier", "job_market", [22, 65], 7, () => T("Mối hàng mới", "Một mối hàng mới chào giá rẻ hơn hai phần mười, đòi trả tiền trước.", [
    C("Trả trước", { gamble: { p: 0.6, win: { income_mult: 1.08 }, lose: { money: -0.15, log: "Mối hàng nhận tiền rồi biến." } } }), C("Giữ mối cũ", {})])),
  R("mk2_early", "job_market", [20, 65], 4, (c) => T("Phiên chợ sớm", vary("early", c.age, ["Chợ đầu mối mở lúc hai giờ sáng. Đi sớm thì lấy được hàng đẹp.", "Mùa Tết, hàng về nhiều, phải dậy từ một giờ."]), [
    C("Đi sớm", { money: 0.03, health: -2, bw: -2 }), C("Ngủ đủ", { bw: 2 })])),

  /* ---------------- LÁI XE ---------------- */
  R("dr2_drunk", "job_driver", [18, 65], 6, () => T("Khách say", "Một vị khách say mèm lên xe, trả gấp ba nếu chở về tận nhà ở xã xa.", [
    C("Chở", { money: 0.02, gamble: { p: 0.85, win: {}, lose: { health: -6, money: -0.03, log: "Khách nôn ra xe rồi gây sự." } } }), C("Từ chối", {})])),
  R("dr2_police", "job_driver", [18, 65], 5, () => T("Chốt kiểm tra", "Xe bạn thiếu một giấy tờ. Chốt kiểm tra phía trước.", [
    C("Quay đầu đi đường vòng", { bw: -2, money: -0.005 }), C("Đi qua, chuẩn bị 'bồi dưỡng'", { money: -0.01, counters: { honest: -1 } })])),
  R("dr2_back", "job_driver", [30, 65], 7, () => T("Cái lưng", "Ngồi xe cả ngày, lưng bạn bắt đầu đau mỗi sáng.", [
    C("Đi vật lý trị liệu", { money: -0.03, health: 4 }), C("Uống thuốc giảm đau, chạy tiếp", { health: -3, money: 0.02 })])),
  R("dr2_tourist", (c) => f(c, "job_driver") && !c.poor_country, [20, 60], 6, () => T("Khách du lịch", "Một khách du lịch hỏi giá chuyến đi. Họ không biết giá thật.", [
    C("Nói giá thật", { counters: { honest: 1 } }), C("Nói gấp đôi", { money: 0.01, counters: { honest: -1 } })])),

  /* ---------------- THỢ ---------------- */
  R("bu2_private", "job_build", [22, 65], 5, () => T("Nhận việc riêng", "Một nhà trong xóm thuê bạn sửa nhà cuối tuần, trả tiền mặt.", [
    C("Nhận, làm kỹ", { money: 0.04, rel: 2, health: -1 }), C("Nhận, làm qua loa cho nhanh", { money: 0.05, rel: -2, counters: { honest: -1 } }), C("Nghỉ cuối tuần", { bw: 2 })])),
  R("bu2_apprentice", (c) => f(c, "job_build") && c.age >= 30, [30, 65], 99, () => T("Thằng phụ", "Một đứa trẻ mười lăm tuổi xin theo bạn học nghề, không lương.", [
    C("Nhận, dạy hết nghề", { counters: { kind: 2 }, health: 1, flags: ["has_apprentice"] }), C("Nhận, sai vặt", { money: 0.02 }), C("Không nhận", {})])),
  R("bu2_heat", "job_build", [18, 65], 4, (c) => T("Nắng", vary("heat", c.age, ["Bốn mươi độ. Công trình không có mái che.", "Nắng như đổ lửa, cai vẫn giục."]), [
    C("Làm tiếp", { health: -3, money: 0.01 }), C("Nghỉ trưa dưới bóng cây", { gamble: { p: 0.7, win: {}, lose: { money: -0.01, log: "Cai trừ nửa ngày công." } } })])),
  R("bu2_tools", "job_build", [22, 60], 8, () => T("Đồ nghề", "Bộ đồ nghề cũ đã hỏng. Đồ tốt thì đắt.", [
    C("Mua đồ tốt", { money: -0.05, income_mult: 1.04 }), C("Mua đồ rẻ", { money: -0.01 })])),

  /* ---------------- NHÀ MÁY ---------------- */
  R("fc2_union", "job_factory", [20, 60], 8, () => T("Công đoàn", "Có người lén rủ lập công đoàn độc lập trong xưởng.", [
    C("Tham gia", { agency: 0.02, rel: 3, gamble: { p: 0.7, win: {}, lose: { custom: "job_lose", log: "Bạn có tên trong danh sách bị đuổi." } } }), C("Đứng ngoài", {})])),
  R("fc2_dorm", "job_factory", [18, 45], 5, () => T("Khu trọ công nhân", "Khu trọ quanh nhà máy tăng giá. Có phòng xa hơn, rẻ hơn, đi lại một tiếng.", [
    C("Chuyển ra xa", { money: 0.02, bw: -3, health: -1 }), C("Ở lại", { money: -0.02 })])),
  R("fc2_friend_fired", "job_factory", [20, 60], 7, () => T("Đồng nghiệp bị đuổi", "Một chị cùng chuyền bị đuổi vì đi vệ sinh quá năm phút. Cả chuyền im lặng.", [
    C("Lên tiếng", { trait: { fair: 2 }, rel: 3, gamble: { p: 0.6, win: { log: "Quản đốc nhận chị ấy lại." }, lose: { income_mult: 0.95 } } }), C("Im lặng", { happy: -2 })])),
  R("fc2_eyes", "job_factory", [30, 60], 99, () => T("Mắt mờ", "Mười năm nhìn đường kim, mắt bạn mờ đi.", [
    C("Đi khám, đổi khâu khác", { money: -0.03, income_mult: 0.95, health: 2 }), C("Cố", { health: -4 })])),

  /* ---------------- DẠY HỌC ---------------- */
  R("te2_parent", "job_teach", [24, 60], 5, () => T("Phụ huynh nóng tính", "Một phụ huynh xông vào lớp mắng bạn vì cho con họ điểm thấp.", [
    C("Giữ nguyên điểm", { trait: { fair: 1 }, happy: -2 }), C("Nâng điểm cho yên", { counters: { honest: -1 } })])),
  R("te2_remote", (c) => f(c, "job_teach") && c.poor_country, [22, 45], 99, () => T("Dạy vùng cao", "Sở cần giáo viên lên dạy ở một điểm trường vùng cao ba năm. Phụ cấp cao, xa nhà.", [
    C("Đi", { money: 0.1, rel: -5, flags: ["highland_teacher", "left_home"], agency: 0.03, counters: { kind: 2 } }), C("Ở lại", {})])),
  R("te2_exam", "job_teach", [26, 60], 6, () => T("Đề thi", "Một đồng nghiệp đề nghị lộ đề cho lớp mình để thành tích trường đẹp hơn.", [
    C("Đồng ý", { income_mult: 1.03, counters: { honest: -2 } }), C("Từ chối", { counters: { honest: 1 }, rel: -1 })])),
  R("te2_bright", "job_teach", [24, 60], 6, () => T("Đứa học trò giỏi", "Có một đứa học trò rất giỏi nhưng nhà nghèo, sắp phải nghỉ học.", [
    C("Đến nhà thuyết phục bố mẹ", { counters: { kind: 2 }, bw: -2 }), C("Đóng học phí giúp", { money: -0.05, counters: { kind: 2 } }), C("Không phải việc của mình", {})])),

  /* ---------------- Y TẾ ---------------- */
  R("he2_violence", "job_health", [22, 60], 7, () => T("Người nhà hung hăng", "Người nhà bệnh nhân lao vào túm áo bạn vì chờ lâu.", [
    C("Bình tĩnh giải thích", { bw: -3 }), C("Gọi bảo vệ", {}), C("Xin nghỉ một tuần", { money: -0.02, health: 2 })])),
  R("he2_private", "job_health", [28, 60], 99, () => T("Phòng khám tư", "Một phòng khám tư mời bạn làm thêm buổi tối, trả gấp ba bệnh viện.", [
    C("Nhận", { income_mult: 1.25, health: -3, bw: -3 }), C("Không", {})])),
  R("he2_drug", "job_health", [25, 60], 8, () => T("Hãng thuốc", "Trình dược viên đề nghị 'hoa hồng' nếu bạn kê đơn thuốc của hãng họ.", [
    C("Nhận", { money: 0.06, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 12], note: "hoa hồng hãng thuốc" } }), C("Từ chối", { counters: { honest: 1 } })])),
  R("he2_death", "job_health", [24, 60], 9, () => T("Ca không cứu được", "Một bệnh nhi không qua khỏi trong ca trực của bạn.", [
    C("Xin nghỉ vài ngày", { money: -0.01, happy: -4 }), C("Trực tiếp", { happy: -8, bw: -4 })])),

  /* ---------------- VĂN PHÒNG ---------------- */
  R("of2_meeting", "job_office", [22, 60], 4, (c) => T("Cuộc họp", vary("meet", c.age, ["Sếp đưa ra một kế hoạch bạn thấy rõ là sai.", "Cả phòng gật đầu với một đề xuất mà bạn biết sẽ thất bại."]), [
    C("Nói thẳng", { agency: 0.01, gamble: { p: 0.5, win: { income_mult: 1.03 }, lose: { income_mult: 0.98 } } }), C("Gật theo", {})])),
  R("of2_expense", "job_office", [24, 60], 6, () => T("Hóa đơn công tác", "Đồng nghiệp khai khống hóa đơn công tác. Ai cũng làm, bảo bạn cũng nên làm.", [
    C("Khai khống", { money: 0.02, counters: { honest: -1 } }), C("Khai đúng", { counters: { honest: 1 } })])),
  R("of2_burnout", "job_office", [26, 60], 6, () => T("Kiệt sức", "Ba tháng liền bạn ngủ không quá năm tiếng. Sáng nay bạn ngồi trong xe mười phút không xuống nổi.", [
    C("Xin nghỉ phép dài", { money: -0.05, bw: 10, health: 3 }), C("Cố qua quý này", { bw: -6, health: -3 })])),
  R("of2_mentor", (c) => f(c, "job_office") && c.age >= 38, [38, 60], 99, () => T("Người mới", "Một nhân viên mới rất giỏi, có thể thay bạn trong vài năm.", [
    C("Dạy hết những gì mình biết", { counters: { kind: 2 }, rel: 3 }), C("Giữ nghề", { income_mult: 1.02 })])),

  /* ---------------- KỸ THUẬT ---------------- */
  R("tc2_bug", "job_tech", [22, 60], 5, () => T("Lỗi lúc nửa đêm", "Hệ thống sập lúc hai giờ sáng. Bạn không trực, nhưng chỉ bạn biết sửa.", [
    C("Dậy sửa", { bw: -4, rel: 2, income_mult: 1.02 }), C("Tắt điện thoại", { gamble: { p: 0.6, win: {}, lose: { income_mult: 0.95, log: "Sếp không quên." } } })])),
  R("tc2_data", "job_tech", [24, 60], 99, () => T("Dữ liệu người dùng", "Công ty muốn bán dữ liệu người dùng mà không hỏi họ. Bạn là người phải viết đoạn mã đó.", [
    C("Viết", { income_mult: 1.05, counters: { honest: -2 } }), C("Từ chối", { trait: { fair: 2 }, gamble: { p: 0.5, win: {}, lose: { custom: "job_lose" } } }), C("Báo cho báo chí", { agency: 0.04, trait: { bold: 2 }, custom: "job_lose" }, "Lựa chọn thứ ba", { tier: "sovereign" })])),
  R("tc2_learn", "job_tech", [22, 55], 4, () => T("Công nghệ mới", "Lại một công nghệ mới. Không học thì hai năm nữa lạc hậu.", [
    C("Học buổi tối", { know: 3, bw: -3, counters: { read: 1 } }), C("Để sau", {})])),
  R("tc2_abroad", (c) => f(c, "job_tech") && c.gdp < 40000, [24, 45], 99, () => T("Lời mời sang nước ngoài", "Một công ty nước ngoài mời bạn sang làm, lương gấp bốn.", [
    C("Đi", { income_mult: 2.5, flags: ["path_migrant", "left_home"], rel: -6, later: { years: 5, storylet: "mg_return" } }), C("Ở lại", { rel: 2 })])),

  /* ---------------- GIÚP VIỆC ---------------- */
  R("do2_child", "job_domestic", [18, 60], 6, () => T("Đứa trẻ nhà chủ", "Đứa con nhà chủ quấn bạn hơn mẹ nó. Bà chủ bắt đầu khó chịu.", [
    C("Giữ khoảng cách", { happy: -2 }), C("Vẫn thương nó như cũ", { happy: 2, gamble: { p: 0.7, win: {}, lose: { custom: "job_lose" } } })])),
  R("do2_holiday", "job_domestic", [18, 60], 4, () => T("Tết", "Chủ nhà muốn bạn ở lại làm Tết, trả gấp ba.", [
    C("Ở lại", { money: 0.03, rel: -3 }), C("Về quê", { rel: 3 })])),

  /* ---------------- XUẤT THÂN ở tuổi trưởng thành ---------------- */
  R("or2_rural_land", "origin_poor_rural", [25, 60], 99, (c, N) => { const s = role(c, "sibling"); return T("Mảnh vườn của bố mẹ", `${s ? N(s) : "Họ hàng"} muốn bán mảnh vườn chung để chia tiền.`, [
    C("Đồng ý bán", { money: 0.4, close_doors: ["return_home"] }), C("Giữ lại làm chỗ về", { ...(s ? { trust: { npc: s, delta: -0.1 } } : {}) })], 0, s ? { npc: s } : {}); }),
  R("or2_urban_alley", "origin_poor_urban", [25, 60], 99, () => T("Con hẻm cũ", "Con hẻm nơi bạn lớn lên sắp bị giải tỏa. Hàng xóm cũ rủ ký đơn.", [
    C("Ký đơn", { rel: 4, agency: 0.01 }), C("Không liên quan nữa", {})])),
  R("or2_middle_parents", "origin_middle", [30, 60], 99, (c, N) => { const m = role(c, "mother") ?? role(c, "father"); return T("Nhà của bố mẹ", `${m ? N(m) : "Bố mẹ"} muốn bán căn nhà cũ, chia cho các con mua nhà riêng.`, [
    C("Đồng ý", { money: 0.5 }), C("Khuyên giữ lại", { ...(m ? { trust: { npc: m, delta: 0.1 } } : {}) })], 0, m ? { npc: m } : {}); }),
  R("or2_rich_charity", "origin_rich", [30, 70], 8, () => T("Từ thiện", "Hội từ thiện mời bạn đứng tên một chương trình. Báo chí sẽ đưa tin.", [
    C("Góp tiền, không đứng tên", { money: -0.1, counters: { kind: 2 } }), C("Đứng tên, góp ít", { money: -0.03, rel: 3 }), C("Không", {})])),
  R("or2_rich_family", "origin_rich", [25, 60], 7, () => T("Họ hàng xin việc", "Một người họ hàng xin bạn sắp xếp cho con họ một chỗ làm.", [
    C("Sắp xếp", { rel: 3, counters: { honest: -1 } }), C("Bảo nó tự nộp hồ sơ", { rel: -3, trait: { fair: 1 } })])),

  /* ---------------- TÍNH KHÍ ở tuổi trưởng thành ---------------- */
  R("tm2_curious", "temper_curious", [25, 70], 5, (c) => T("Tò mò", vary("cu2", c.age, ["Bạn tình cờ đọc được về một thứ hoàn toàn mới.", "Có một lớp học miễn phí về thiên văn ở thư viện tỉnh."]), [
    C("Đắm vào", { know: 3, counters: { read: 1 }, happy: 2, bw: -1 }), C("Không có thời gian", {})])),
  R("tm2_bold", "temper_bold", [25, 65], 5, () => T("Liều", "Có một cơ hội chỉ người gan mới dám nắm.", [
    C("Nắm", { gamble: { p: 0.45, win: { money: 0.4, log: "Lần này bạn thắng." }, lose: { money: -0.3, log: "Lần này bạn thua." } } }), C("Thôi", {})])),
  R("tm2_kind", "temper_kind", [25, 75], 5, (c) => T("Người lạ", vary("ki2", c.age, ["Một người đàn bà ngồi khóc ở bến xe, mất hết tiền về quê.", "Đứa bé bán hàng rong bị đánh ngay trước mặt bạn."]), [
    C("Giúp", { money: -0.01, counters: { kind: 1 }, happy: 2 }), C("Đi qua", { happy: -2 })])),
  R("tm2_tough", "temper_tough", [25, 70], 5, () => T("Một mình gánh", "Có chuyện nặng. Bạn quen tự gánh, không kể với ai.", [
    C("Tự gánh", { bw: -4, happy: -1 }), C("Lần này nhờ người khác", { rel: 3, bw: 3 })])),

  /* ---------------- BẠN ĐỜI (thêm) ---------------- */
  R("sp2_warm_sick", (c) => f(c, "spouse_warm") && !!role(c, "spouse"), [40, 85], 8, (c, N) => { const s = role(c, "spouse")!; return T(`${N(s)} mệt`, `${N(s)} giấu bệnh vì sợ tốn tiền.`, [
    C("Bắt đi khám", { money: -0.05, trust: { npc: s, delta: 0.1 } }), C("Tin lời người ấy", { gamble: { p: 0.7, win: {}, lose: { happy: -6, log: "Bệnh nặng hơn bạn tưởng." } } })], 0, { npc: s }); }),
  R("sp2_proud_job", (c) => f(c, "spouse_proud") && !!role(c, "spouse"), [26, 60], 6, (c, N) => { const s = role(c, "spouse")!; return T("Thể diện", `${N(s)} không chịu cho bạn làm công việc "thấp kém" dù trả tốt hơn.`, [
    C("Nghe theo", { trust: { npc: s, delta: 0.08 }, income_mult: 0.97 }), C("Vẫn làm", { income_mult: 1.05, trust: { npc: s, delta: -0.12 } })], 0, { npc: s }); }),
  R("sp2_restless_move", (c) => f(c, "spouse_restless") && !!role(c, "spouse"), [26, 55], 8, (c, N) => { const s = role(c, "spouse")!; return T("Đi nơi khác", `${N(s)} muốn chuyển cả nhà lên thành phố lớn, bắt đầu lại.`, [
    C("Đi", { money: -0.15, rel: -4, agency: 0.02, flags: ["left_home"], trust: { npc: s, delta: 0.15 } }), C("Ở lại", { trust: { npc: s, delta: -0.12 } })], 0, { npc: s }); }),
  R("sp2_fair_money", (c) => f(c, "spouse_fair") && !!role(c, "spouse"), [25, 65], 7, (c, N) => { const s = role(c, "spouse")!; return T("Sổ chi tiêu", `${N(s)} đề nghị hai người cùng ghi sổ chi tiêu, minh bạch từng đồng.`, [
    C("Đồng ý", { counters: { save: 2 }, trust: { npc: s, delta: 0.08 } }), C("Thấy phiền", { trust: { npc: s, delta: -0.05 } })], 0, { npc: s }); }),

  /* ---------------- LỐI RẼ (thêm) ---------------- */
  R("mg2_lonely", "path_migrant", [20, 60], 5, () => T("Xa nhà", "Đêm giao thừa ở xứ người. Cả khu trọ gọi video về nhà.", [
    C("Gọi về", { rel: 2, happy: -1 }), C("Ra ngoài một mình", { happy: -3, counters: { drink: 1 } })])),
  R("mg2_language", "path_migrant", [20, 50], 6, () => T("Tiếng", "Ông chủ nói nhanh, bạn hiểu được một nửa. Có lớp tiếng buổi tối.", [
    C("Đi học", { know: 4, bw: -2, income_mult: 1.05 }), C("Không có sức", {})])),
  R("un2_grad", "path_uni", [21, 26], 99, () => T("Ra trường", "Có hai lời mời: một công ty lớn ở thành phố, và một chỗ ở quê gần bố mẹ.", [
    C("Ở lại thành phố", { income_mult: 1.15, rel: -3, flags: ["left_home"] }), C("Về quê", { rel: 4, income_mult: 0.9 })])),
  R("dp2_skill", "path_dropout", [18, 40], 5, () => T("Học nghề", "Có một khóa học nghề ngắn hạn miễn phí cho người không có bằng.", [
    C("Đi học", { know: 3, income_mult: 1.06, bw: -2 }), C("Thôi", {})])),
];
