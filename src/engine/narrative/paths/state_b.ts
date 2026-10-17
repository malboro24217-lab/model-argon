/**
 * Gói con đường "Quyền lực & nhà nước", phần B: THẨM PHÁN · LUẬT SƯ · NHÀ NGOẠI GIAO · CÁN BỘ HẢI QUAN.
 * Mỗi con đường: năng khiếu · 2 cơ hội · 5 nhịp truyện · ≥10 chuyện thường ngày · 1 chuyện gia đình.
 * Tiền tố id: thp_ (thẩm phán) · lsu_ (luật sư) · ngg_ (ngoại giao) · hqa_ (hải quan).
 * Bộ đếm riêng: thp_spine/thp_bent/thp_mercy · lsu_cause/lsu_win · ngg_net · hqa_clean/hqa_dirty.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, life, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const J = "judge";
const L = "lawyer";
const D = "diplomat";
const H = "customs";

/** Đọc bộ đếm, mặc định 0. */
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;
const vn = (c: FactContext): boolean => c.country === "VN";
/** Nhịp 1–4 chỉ mở cho người trưởng thành (các con đường này đều bắt đầu sau 22 tuổi). */
const adult = (c: FactContext): boolean => c.age >= 20;

export const PACK_STATE_B: Storylet[] = [
  /* ================================================================ THẨM PHÁN ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(J, "thp_t_fair", [9, 15], () => true, () => T("Người phân xử ở sân chơi", "Một quả bóng làm vỡ kính cửa sổ nhà bên, và hai nhóm bạn đổ lỗi cho nhau. Cả bọn kéo đến tìm bạn. Bạn bắt từng đứa kể lại từ đầu, rồi hỏi đúng một câu khiến cả hai bên cùng im lặng.", [
    C("Mượn sách luật ở thư viện về đọc", { flags: [talentFlag(J)], counters: { talents_seen: 1 }, know: 3, happy: -1 }, "Bớt giờ chơi, mở một con đường"),
    C("Để người lớn tự lo", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(J, "thp_d_exam", [30, 45], (c) => c.has_degree || f(c, talentFlag(J)), (c) => T("Kỳ thi tuyển thẩm phán", "Tòa án mở kỳ thi tuyển thẩm phán: bốn mươi hai hồ sơ cho ba ghế. Bạn đã làm thư ký tòa đủ lâu để biết mặt từng chánh án. Có người nhắn riêng rằng một suất 'đã có chủ', hai suất còn lại thì 'cần lo'.", [
    C("Ôn thi sáu tháng, thi bằng sức mình", { counters: { doors_seen: 1 }, bw: -5, gamble: { p: f(c, talentFlag(J)) ? 0.45 : 0.3, win: { ...become(J), log: "Bạn đỗ thứ hai. Trong phòng thi không ai quen bạn." }, lose: { happy: -4, log: "Bạn trượt nửa điểm. Hai người đỗ đều có người 'lo'." } } }, "Sạch sẽ, có thể trượt"),
    C("Gửi người 'lo' một suất", { ...become(J), counters: { doors_seen: 1 }, money: -0.6, secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [4, 15], note: "chạy suất thi thẩm phán" } }, "Chắc ghế, mang một bí mật suốt nghề"),
    C("Ở lại với việc cũ", { counters: { doors_seen: 1 } })], 0)),
  door(J, "thp_d_bench", [32, 50], () => true, (c) => T("Ghế trống ở tòa thị trấn", `Vị thẩm phán già ở tòa sơ thẩm của một thị trấn nhỏ nghỉ hưu. Chánh án cấp trên còn nhớ bản bào chữa của bạn năm nào và hỏi bạn có muốn ngồi vào ghế ấy không. Lương bằng hai phần ba thu nhập bây giờ, ${c.poor_country ? "nhà công vụ dột một góc" : "nhà công vụ cách tòa bốn mươi phút lái xe"}.`, [
    C("Nhận ghế, chuyển cả nhà về thị trấn", { ...become(J), counters: { doors_seen: 1 }, money: -0.1, rel: -3 }, "Lương thấp, được ngồi ghế xử"),
    C("Nhận ghế, để gia đình ở lại thành phố", { ...become(J), counters: { doors_seen: 1 }, money: -0.05, happy: -3, flags: ["judge_commuter"] }, "Giữ nếp nhà, sống hai nơi"),
    C("Từ chối, ở lại văn phòng luật", { counters: { doors_seen: 1 }, money: 0.05 })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(J, 1, 1, (c) => T("Phiên xử đầu tiên", `Một người mẹ lấy hai hộp sữa bột ở siêu thị và bị giữ ngay ở cửa. Luật cho bạn khung từ cảnh cáo đến hai năm tù. Phòng xử có bảy người, ba người mặc đồng phục siêu thị, ${c.poor_country ? "quạt trần kêu cót két" : "đèn huỳnh quang nhấp nháy"} suốt buổi.`, [
    C("Xử mức nhẹ nhất, ghi rõ hoàn cảnh vào bản án", { counters: step(c, J, { thp_mercy: 1 }), flags: ["judge_mercy"], happy: 3, income_mult: 0.95 }, "Được lòng người, bị cấp trên chê 'mềm'"),
    C("Xử đúng mức các thẩm phán khác vẫn xử", { counters: step(c, J), know: 2, income_mult: 1.05, happy: -2 }, "An toàn cho sự nghiệp, nặng lòng"),
    C("Hoãn phiên, yêu cầu xác minh hoàn cảnh", { counters: step(c, J, { thp_spine: 1 }), bw: -4, rel: 2, flags: ["judge_inquiry"] }, "Chậm hồ sơ, xử có căn cứ", { tier: "awakened" })], 0), adult),
  beat(J, 2, 3, (c, N) => { const o = role(c, "official"); return T("Cuộc gọi trước phiên tòa", `Bạn được giao vụ tranh chấp đất giữa một công ty xây dựng và ba mươi hộ dân. Tối trước phiên xử, ${o ? N(o) : "một người có chức có quyền"} gọi điện, giọng thân mật: 'Xem xét cho hài hòa, đừng để dự án phải dừng.' Hồ sơ dày bốn trăm trang, phần lớn nghiêng về các hộ dân.`, [
    C("Xử theo 'định hướng'", { counters: step(c, J, { thp_bent: 1 }), flags: ["judge_took_call"], income_mult: 1.3, happy: -3, ...(o ? { trust: { npc: o, delta: 0.3 } } : {}) }, "Lên nhanh, mang theo ba mươi hộ dân"),
    C("Xử theo hồ sơ, coi như không có cuộc gọi", { counters: step(c, J, { thp_spine: 1 }), flags: ["judge_independent"], income_mult: 0.9, rel: 3, ...(o ? { memory: { npc: o, tag: "REFUSED_HELP" as const, weight: -0.3, note: "không xử theo cuộc gọi vụ đất" } } : {}) }, "Giữ mình, dễ bị điều đi xa"),
    C("Ghi cuộc gọi vào hồ sơ, báo hội đồng kỷ luật", { counters: step(c, J, { thp_spine: 2 }), agency: 0.03, gamble: { p: 0.4, win: { flags: ["judge_whistle"], rel: 5, log: "Hội đồng kỷ luật vào cuộc. Từ đó không ai gọi cho bạn trước phiên xử nữa." }, lose: { income_mult: 0.8, flags: ["judge_sidelined"], log: "Biên bản biến mất khỏi hồ sơ. Bạn bị chuyển sang xử án hành chính." } } }, "Lựa chọn thứ ba: đưa cuộc gọi ra ánh sáng", { tier: "sovereign" })], 1, o ? { npc: o } : {}); }, adult),
  beat(J, 3, 4, (c) => f(c, "judge_took_call")
    ? T("Danh sách cuộc gọi", "Một nhà báo có trong tay danh sách các cuộc gọi trước phiên xử vụ đất năm nào. Ba mươi hộ dân vẫn khiếu nại, hai hộ đã mất nhà. Người gọi cho bạn đã nghỉ hưu và nói với báo rằng ông 'không nhớ'.", [
      C("Nói thật với nhà báo, nhận phần mình", { counters: step(c, J), flags: ["judge_confessed"], happy: 3, gamble: { p: 0.5, win: { income_mult: 0.7, log: "Bạn bị kỷ luật, hạ một bậc, nhưng vẫn được ngồi ghế xử." }, lose: { ...leave(J), log: "Bạn bị cách chức. Bản án vụ đất được đưa ra xét lại." } } }, "Có thể mất ghế, nhẹ lòng"),
      C("Thuê luật sư, từ chối trả lời", { counters: step(c, J, { thp_bent: 1 }), money: -0.3, happy: -5, flags: ["judge_coverup"] }, "Giữ ghế, sống với nỗi sợ"),
      C("Xin nghỉ hưu sớm trước khi có kết luận", { counters: step(c, J), ...leave(J), flags: ["ex_judge"] }, "Thoát êm, bỏ lửng sự thật")], 0)
    : T("Bản án sai", `Người đàn ông bị bạn tuyên sáu năm tù vừa được thả: kẻ gây án thật đã ra đầu thú. Anh ta đã ngồi tù bốn năm. ${f(c, "judge_inquiry") ? "Bạn lật lại hồ sơ: chính bạn từng xin xác minh thêm, và bị gạt đi vì chỉ tiêu." : "Bạn lật lại hồ sơ: lời khai mâu thuẫn nằm ngay trang ba mươi mốt, bạn đã đọc lướt qua."} Phóng viên đang chờ ở cổng tòa.`, [
      C("Ra cổng tòa, xin lỗi công khai", { counters: step(c, J, { thp_spine: 1 }), flags: ["judge_apologized"], income_mult: 0.85, happy: -2, rel: 5 }, "Mất đường lên, giữ được mình"),
      C("Im lặng, để cơ quan điều tra nhận lỗi", { counters: step(c, J), happy: -6, flags: ["judge_silent"] }, "Yên ổn bên ngoài, nặng bên trong"),
      C("Đề xuất rà soát mọi bản án chỉ dựa vào lời khai", { counters: step(c, J, { thp_spine: 1 }), bw: -8, agency: 0.03, gamble: { p: 0.45, win: { flags: ["judge_review"], rel: 4, log: "Tổ rà soát tìm thêm hai bản án sai. Có người gọi bạn là kẻ phá ngành." }, lose: { income_mult: 0.85, log: "Đề xuất bị xếp vào ngăn kéo. Đồng nghiệp tránh ngồi cạnh bạn." } } }, "Lựa chọn thứ ba: sửa cả cách xử, không chỉ một vụ", { tier: "sovereign" })], 0), adult),
  beat(J, 4, 5, (c) => f(c, "judge_coverup")
    ? T("Đoàn thanh tra", "Đoàn thanh tra đề nghị bạn kê khai lại tài sản mười năm. Căn nhà thứ hai đứng tên một người em họ. Đồng nghiệp từng cùng xử vụ đất đã lên làm việc trước bạn một tuần, và không gọi lại cho bạn nữa.", [
      C("Hợp tác, khai hết", { counters: step(c, J), ...leave(J), close_doors: ["clean_record"], happy: 2, flags: ["judge_disgraced"] }, "Mất ghế, mất tên sạch, hết phải trốn"),
      C("Chối đến cùng", { counters: step(c, J, { thp_bent: 1 }), money: -0.4, gamble: { p: 0.4, win: { happy: -6, log: "Hồ sơ dừng ở cấp dưới. Bạn giữ được ghế, mất ngủ hằng đêm." }, lose: { unflags: [life(J)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Bạn bị khởi tố. Bản án dành cho bạn do một đồng nghiệp cũ tuyên." } } }, "Có thể thoát, có thể vào tù"),
      C("Bồi hoàn cho các hộ dân trước khi bị hỏi", { counters: step(c, J), money: -1, agency: 0.03, flags: ["judge_restitution"], gamble: { p: 0.6, win: { income_mult: 0.7, log: "Thanh tra ghi nhận việc khắc phục. Bạn bị hạ bậc, không bị truy tố." }, lose: { ...leave(J), close_doors: ["clean_record"], log: "Tiền trả lại không xóa được hồ sơ. Bạn bị cách chức." } } }, "Lựa chọn thứ ba: trả món nợ trước khi bị đòi", { tier: "sovereign", longterm: true })], 0)
    : T("Đề cử lên tòa cấp cao", `${n(c, "thp_spine") >= 2 ? "Tên bạn được nhắc trong ngành như một thẩm phán 'không ai gọi điện được'." : "Mười mấy năm xử án, hiếm bản án nào của bạn bị sửa."} Bạn được đề cử lên tòa cấp cao. Người phụ trách hồ sơ nói nhỏ: muốn ngồi ghế ấy thì ${f(c, "judge_review") ? "nên dừng tổ rà soát các bản án cũ" : "nên bớt viết những bản án quá dài, quá thẳng"}.`, [
      C("Gật đầu, nhận ghế", { counters: step(c, J, { thp_bent: 1 }), income_mult: 1.4, happy: -2, flags: ["judge_high_court"] }, "Ghế cao, tiếng nói nhỏ đi"),
      C("Nhận đề cử, công khai không nhận điều kiện", { counters: step(c, J, { thp_spine: 1 }), agency: 0.03, gamble: { p: n(c, "thp_spine") >= 2 ? 0.55 : 0.35, win: { income_mult: 1.4, flags: ["judge_high_court", "judge_unbowed"], log: "Hội đồng bỏ phiếu cho bạn, sít sao một phiếu." }, lose: { income_mult: 0.9, log: "Hồ sơ của bạn bị rút. Ghế ấy về tay một người biết gật đầu." } } }, "Lựa chọn thứ ba: lên mà không cúi", { tier: "sovereign" }),
      C("Ở lại tòa cũ, kèm cặp thẩm phán trẻ", { counters: step(c, J), happy: 3, flags: ["has_apprentice"] }, "Không lên cao, để lại người", { tier: "awakened" })], 0), adult),
  beat(J, 5, 6, (c) => T("Ngày cuối trên ghế xử", `${f(c, "judge_mercy") ? "Sáng nay có tấm thiệp gửi đến tòa: người mẹ lấy sữa năm nào báo tin con bà đỗ vào trường luật." : f(c, "judge_apologized") ? "Người đàn ông từng ngồi tù oan gửi thiệp mời bạn dự đám cưới con gái anh." : f(c, "judge_high_court") ? "Ở tòa cấp cao, bạn chỉ còn đọc hồ sơ, không còn nhìn mặt bị cáo." : "Bạn đếm được hơn hai nghìn bản án mang chữ ký của mình."} Trường luật mời bạn dạy một học kỳ; một nhà xuất bản muốn in hồi ký.`, [
    C("Viết hồi ký, kể cả những bản án mình hối hận", { counters: step(c, J), flags: ["judge_memoir"], gamble: { p: 0.5, win: { rel: 5, happy: 4, log: "Sách được sinh viên luật chuyền tay nhau." }, lose: { rel: -3, log: "Vài đồng nghiệp cũ thôi chào bạn." } } }, "Nói thật, mất vài người bạn"),
    C("Dạy trường luật, dạy cách đọc một hồ sơ", { counters: step(c, J), income_mult: 0.7, happy: 3, flags: ["passed_on"] }, "Ít tiền, thành người truyền nghề"),
    C("Nghỉ hẳn, mang theo mọi chuyện", { counters: step(c, J), ...leave(J), health: 3, happy: 2 }, "Bình yên, những bài học đi cùng bạn")], 0), (c) => c.age >= 50),

  /* ---------- chuyện thường ngày ---------- */
  daily(J, "thp_backlog", [30, 65], 7, (c) => T("Chồng hồ sơ", vary("thpb", c.age, ["Cuối quý, bạn còn một trăm bốn mươi hồ sơ chưa xử. Bảng thi đua ghi rõ: tỷ lệ giải quyết phải trên tám mươi phần trăm.", "Một đồng nghiệp nghỉ ốm dài ngày, toàn bộ hồ sơ của chị dồn sang bàn bạn: thêm sáu mươi vụ, hạn chót vẫn giữ nguyên."]), [
    C("Xử nhanh, đọc lướt những vụ nhỏ", { counters: { thp_rush: 1 }, income_mult: 1.03, bw: 2 }, "Đạt chỉ tiêu, có thể sót"),
    C("Đọc từng trang, chịu trễ chỉ tiêu", { counters: { thp_careful: 1 }, health: -3, bw: -4, income_mult: 0.98 }, "Kỹ, bị nêu tên trong cuộc họp"),
    C("Gửi kiến nghị: chỉ tiêu đang ép xử ẩu", { agency: 0.02, flags: ["judge_quota_memo"], gamble: { p: 0.35, win: { rel: 3, log: "Tòa giảm chỉ tiêu cho các vụ phức tạp." }, lose: { happy: -2, log: "Kiến nghị được 'ghi nhận'. Không có gì thay đổi." } } }, "Lựa chọn thứ ba: đổi luật chơi", { tier: "sovereign" })], 0)),
  daily(J, "thp_gift", [30, 65], 8, (c) => T("Giỏ quà cuối năm", `${vn(c) ? "Gần Tết" : "Cuối năm"}, một giỏ quà gửi đến nhà bạn, kèm thiệp của người nhà một đương sự sắp ra tòa. Dưới đáy giỏ có một phong bì dày.`, [
    C("Gửi trả cả giỏ, kèm biên bản", { counters: { honest: 1, thp_spine: 1 }, rel: -1, bw: -1 }, "Sạch, mất lòng người gửi"),
    C("Giữ giỏ quà, trả lại phong bì", { counters: { honest: -1 }, happy: 1, flags: ["judge_kept_basket"] }, "Nửa vời, người ta vẫn nghĩ bạn đã nhận"),
    C("Giữ cả", { money: 0.3, counters: { thp_bent: 1, honest: -2 }, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 12], note: "nhận phong bì của đương sự" } }, "Bằng ba tháng lương, có một bí mật")], 0)),
  daily(J, "thp_letter", [30, 65], 9, () => T("Lá thư không ký tên", "Sau khi bạn tuyên án kẻ cầm đầu một đường dây cho vay nặng lãi, có lá thư không ký tên nhét qua khe cửa. Trong thư chỉ có biển số xe của bạn và giờ bạn rời nhà mỗi sáng.", [
    C("Báo công an, xin bảo vệ", { flags: ["judge_guarded"], bw: -3, happy: -2 }, "An toàn hơn, mất tự do đi lại"),
    C("Gửi gia đình sang nhà họ hàng một thời gian", { money: -0.08, rel: -3, flags: ["family_sent_away"] }, "Yên tâm, nhà vắng"),
    C("Coi như không có gì", { gamble: { p: 0.75, win: { counters: { thp_spine: 1 }, log: "Không có lá thư thứ hai." }, lose: { health: -5, log: "Một đêm, kính xe của bạn bị đập vỡ. Không ai thấy gì." } } }, "Giữ nếp sống, đánh cược")], 0)),
  daily(J, "thp_crowd", [30, 65], 8, () => T("Phiên tòa trên mạng", "Vụ tai nạn giao thông bạn sắp xử đã thành đề tài khắp mạng. Hàng chục nghìn người đòi án thật nặng; hồ sơ thì cho thấy lỗi chia đôi cho cả hai bên.", [
    C("Xử theo hồ sơ, mặc dư luận", { counters: { thp_spine: 1 }, happy: -4, rel: -2 }, "Đúng luật, bị chửi một tháng"),
    C("Nặng tay hơn một chút cho yên", { counters: { thp_bent: 1 }, rel: 2, happy: -1 }, "Êm dư luận, bất công với bị cáo"),
    C("Viết bản án dài, giải thích bằng lời dễ hiểu", { bw: -5, gamble: { p: 0.5, win: { rel: 4, counters: { thp_spine: 1 }, log: "Bản án được chia sẻ, kèm câu: 'lần đầu đọc một bản án mà hiểu'." }, lose: { happy: -3, log: "Người ta chỉ đọc dòng cuối." } } }, "Tốn sức, có thể đổi được cách người ta nghĩ", { tier: "awakened" })], 0)),
  daily(J, "thp_mentor", [30, 65], 10, (c, N) => { const m = role(c, "mentor")!; return T("Thầy cũ xin gặp riêng", `${N(m)}, người dạy bạn môn tố tụng năm nào, giờ là luật sư của một bị cáo trong vụ bạn sắp xử. Thầy nhắn: 'Cà phê thôi, không nói chuyện vụ án.'`, [
    C("Đi cà phê với thầy", { trust: { npc: m, delta: 0.2 }, counters: { thp_bent: 1 }, gamble: { p: 0.6, win: { happy: 2, log: "Thầy giữ lời: chỉ nói chuyện cũ." }, lose: { flags: ["judge_seen_with_counsel"], log: "Có người chụp được ảnh hai thầy trò. Bên kia đòi thay thẩm phán." } } }, "Giữ tình thầy trò, có thể mang tiếng"),
    C("Từ chối lịch sự", { trust: { npc: m, delta: -0.15 }, counters: { thp_spine: 1 }, happy: -2 }, "Đúng mực, thầy buồn"),
    C("Tự xin rút khỏi vụ án vì quen biết", { trust: { npc: m, delta: 0.05 }, bw: -2, flags: ["judge_recused"] }, "Đúng nguyên tắc, bị chê làm quá", { tier: "awakened" })], 2, { npc: m }); }, (c) => !!role(c, "mentor")),
  daily(J, "thp_custody", [30, 65], 8, () => T("Phiên hòa giải ly hôn", "Hai vợ chồng ngồi hai đầu bàn, giữa họ là tờ kê tài sản và một câu hỏi chưa ai dám nói ra: đứa con sáu tuổi sẽ ở với ai. Người mẹ thu nhập thấp hơn, người cha có nhà riêng.", [
    C("Giao con cho người có điều kiện hơn", { flags: ["judge_custody_by_means"], happy: -2 }, "Nhanh, theo tiền lệ"),
    C("Mời chuyên viên tâm lý trò chuyện với đứa trẻ", { bw: -3, counters: { thp_careful: 1 } }, "Chậm thêm hai tháng, có căn cứ"),
    C("Hoãn lại, để hai người ngồi riêng một giờ", { gamble: { p: 0.3, win: { happy: 5, counters: { thp_mercy: 1 }, log: "Họ rút đơn. Ba năm sau họ gửi bạn ảnh cả nhà." }, lose: { bw: -2, log: "Một giờ đó chỉ thêm một trận cãi." } } }, "Ít khi được, nhưng khi được thì đáng")], 1)),
  daily(J, "thp_heavy", [32, 65], 9, (c) => T("Án nặng nhất", vary("thph", c.age, ["Hôm nay bạn tuyên án chung thân. Bị cáo hai mươi hai tuổi, không nhìn bạn một lần. Ba giờ sáng bạn vẫn thức, nghe lại giọng mình đọc hai chữ ấy.", "Bạn tuyên mười tám năm tù cho một người cha. Lúc dẫn đi, anh ta quay lại tìm mặt vợ trong phòng xử. Đêm đó bạn không ngủ."]), [
    C("Đặt lịch gặp chuyên gia tâm lý", { money: -0.03, happy: 4, flags: ["judge_therapy"] }, "Tốn tiền, có người nghe"),
    C("Rót một ly, rồi một ly nữa", { counters: { drink: 2 }, health: -3, happy: 1 }, "Ngủ được đêm nay, trả giá về sau"),
    C("Ghi vào sổ tay những điều đã cân nhắc", { know: 2, bw: -2, counters: { thp_careful: 1 } }, "Mất thêm một đêm, nhẹ đi một chút")], 0)),
  daily(J, "thp_algo", [30, 65], 9, () => T("Phần mềm gợi ý mức án", "Tòa thí điểm một phần mềm gợi ý mức án dựa trên hàng nghìn bản án cũ. Nó nhanh, và nó luôn gợi ý nặng hơn cho những bị cáo không có địa chỉ cố định.", [
    C("Dùng theo gợi ý cho đỡ việc", { bw: 5, counters: { thp_rush: 1 }, flags: ["judge_uses_algo"] }, "Nhẹ đầu, kế thừa cả thiên lệch cũ"),
    C("Kiểm từng gợi ý bằng tay", { bw: -4, counters: { thp_careful: 1 } }, "Mệt hơn, chậm hơn đồng nghiệp"),
    C("Gom số liệu thiên lệch, gửi hội đồng thẩm phán", { agency: 0.02, gamble: { p: 0.45, win: { flags: ["judge_algo_report"], rel: 3, log: "Phần mềm bị tạm dừng để hiệu chỉnh." }, lose: { happy: -2, log: "Bạn bị nhắc là 'cản trở chuyển đổi số'." } } }, "Lựa chọn thứ ba: sửa cái máy, không chỉ né nó", { tier: "sovereign" })], 1)),
  daily(J, "thp_tongue", [30, 65], 8, () => T("Bị cáo không hiểu tiếng", "Bị cáo là một người dân tộc thiểu số từ vùng núi, nói rất ít tiếng phổ thông. Tòa không tìm được phiên dịch; người thông thạo gần nhất ở cách hai trăm cây số. Anh ta đã bị tạm giam năm tháng.", [
    C("Hoãn phiên đến khi có phiên dịch", { counters: { thp_careful: 1 }, happy: -2, flags: ["judge_waited_interpreter"] }, "Đúng quyền bị cáo, anh ta ngồi thêm tháng nữa"),
    C("Xử luôn, nhờ thư ký dịch tạm", { counters: { thp_rush: 1 }, bw: 2 }, "Nhanh, chưa chắc anh ta hiểu mình bị xử gì"),
    C("Tự bỏ tiền đón người phiên dịch về", { money: -0.04, rel: 3, counters: { thp_mercy: 1 } }, "Tốn tiền túi, xử được ngay tuần sau")], 0)),
  daily(J, "thp_offer", [38, 60], 99, () => T("Lời mời từ hãng luật lớn", "Một hãng luật lớn mời bạn về làm cố vấn, lương gấp ba. Họ không nói ra, nhưng ai cũng hiểu họ cần một người biết các đồng nghiệp cũ của bạn nghĩ gì.", [
    C("Cởi áo thẩm phán, sang hãng luật", { unflags: [life(J)], custom: "become:lawyer", money: 0.2, flags: ["ex_judge"] }, "Lương gấp ba, mang theo quan hệ cũ"),
    C("Ở lại ghế xử", { counters: { thp_spine: 1 }, happy: -1 }, "Lương thấp, giữ ghế")], 1), (c) => c.happy < 55 || c.broke),

  /* ---------- gia đình ---------- */
  cross(J, "thp_family", [32, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} ăn trưa một mình`, `Bố của một bạn cùng lớp với ${N(k)} vừa nhận án từ chính tay bạn. Từ hôm đó, ${N(k)} ăn trưa một mình, về nhà là đóng cửa phòng.`, [
      C("Ngồi kể cho con nghe về vụ án", { trust: { npc: k, delta: 0.2 }, bw: -2 }, "Khó nói, con hiểu việc bạn làm"),
      C("Xin chuyển trường cho con", { money: -0.05, trust: { npc: k, delta: -0.1 }, flags: ["kid_moved_school"] }, "Giải quyết nhanh, con mất bạn bè"),
      C("Dặn con: chuyện người lớn, con đừng để ý", { trust: { npc: k, delta: -0.15 }, happy: -1 }, "Đỡ phải giải thích, con thấy cô đơn hơn")], 0, { npc: k });
    return T("Một câu nói giúp", `${N(p!)} nhờ bạn "nói một câu" với đồng nghiệp ở tòa bên cạnh, nơi một đứa cháu họ đang bị xử vì lái xe gây tai nạn sau khi uống rượu.`, [
      C("Từ chối thẳng", { memory: { npc: p!, tag: "REFUSED_HELP", weight: -0.3, note: "không chịu nói giúp cho đứa cháu ra tòa" }, counters: { thp_spine: 1 } }, "Giữ nghề, mất lòng nhà"),
      C("Gọi một cuộc cho đồng nghiệp", { trust: { npc: p!, delta: 0.25 }, counters: { thp_bent: 1 }, flags: ["judge_favor"] }, "Vui lòng bố mẹ, nợ một ân huệ"),
      C("Bỏ tiền thuê cho cháu một luật sư giỏi", { money: -0.1, trust: { npc: p!, delta: 0.1 } }, "Tốn tiền, tay vẫn sạch", { tier: "awakened" })], 0, { npc: p! }); }),

  /* ================================================================ LUẬT SƯ ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(L, "lsu_t_debate", [11, 16], () => true, () => T("Đội tranh biện", "Ở cuộc thi tranh biện cấp trường, bạn bốc thăm phải bênh quan điểm mà chính bạn phản đối. Bạn thắng. Thầy phụ trách hỏi bạn chuẩn bị thế nào; bạn bảo chỉ cần đọc thật kỹ lập luận của bên kia.", [
    C("Xin vào đội tranh biện của trường", { flags: [talentFlag(L)], counters: { talents_seen: 1 }, know: 3, bw: -3 }, "Mất cuối tuần, luyện được cái lý"),
    C("Thôi, kẻo bị gọi là lắm lời", { counters: { talents_seen: 1 }, rel: 1 })], 0)),
  talent(L, "lsu_t_defend", [12, 16], () => true, () => T("Lên tiếng trước hội đồng kỷ luật", "Một bạn cùng lớp bị nghi lấy tiền quỹ lớp. Cả lớp im lặng. Bạn đứng lên trước hội đồng kỷ luật, chỉ ra rằng sổ quỹ đã bị ghi sai từ tháng trước, và xin được đọc lại từng dòng.", [
    C("Trình bày đến cùng, dù bị nhắc là hỗn", { flags: [talentFlag(L)], counters: { talents_seen: 1 }, rel: 2, happy: -1 }, "Có thể bị ghét, bạn kia được minh oan"),
    C("Ngồi xuống, để thầy cô quyết", { counters: { talents_seen: 1 }, happy: -2 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(L, "lsu_d_bar", [24, 40], (c) => c.has_degree || f(c, talentFlag(L)), () => T("Hai năm tập sự", "Bạn có bằng luật. Muốn hành nghề, bạn phải tập sự hai năm ở một văn phòng với mức lương vừa đủ tiền trọ, rồi thi sát hạch. Cùng lúc, một công ty bảo hiểm mời bạn làm pháp chế ngay, lương gấp đôi.", [
    C("Đi tập sự, chấp nhận nghèo hai năm", { ...become(L), counters: { doors_seen: 1 }, money: -0.15 }, "Nghèo trước, có nghề sau"),
    C("Vừa làm pháp chế vừa tập sự buổi tối", { counters: { doors_seen: 1 }, bw: -6, gamble: { p: 0.4, win: { ...become(L), log: "Bạn qua kỳ sát hạch, mắt thâm quầng, và nộp đơn nghỉ ở công ty bảo hiểm." }, lose: { health: -3, log: "Bạn trượt kỳ sát hạch, và suýt mất luôn việc ở công ty." } } }, "Giữ lương, đánh cược sức khỏe"),
    C("Nhận việc pháp chế", { counters: { doors_seen: 1 }, money: 0.05 })], 0)),
  door(L, "lsu_d_hallway", [24, 45], () => true, (c, N) => { const nb = role(c, "neighbor"); const who = nb ? N(nb) : "Người hàng xóm"; return T("Luật sư đọc hồ sơ ở hành lang", `${who} bị đưa ra tòa vì một vụ xô xát. Bạn ngồi dự và thấy luật sư được chỉ định mở hồ sơ lần đầu ngay ngoài hành lang, mười phút trước phiên xử. ${who} nhận ba năm tù.`, [
    C("Đăng ký học luật buổi tối", { ...become(L), counters: { doors_seen: 1 }, money: -0.15, bw: -5, log: "Ba năm vừa làm vừa học. Ngày nhận thẻ luật sư, bạn nghĩ đến cái hành lang ấy." }, "Ba năm không có buổi tối nào rảnh"),
    C("Viết giúp gia đình họ một lá đơn kháng cáo", { counters: { doors_seen: 1 }, rel: 3, bw: -2, flags: ["wrote_appeal"] }, "Giúp được một lần, rồi quay về đời mình"),
    C("Thôi, chuyện của người khác", { counters: { doors_seen: 1 } })], 0, nb ? { npc: nb } : {}); }),

  /* ---------- mạch truyện ---------- */
  beat(L, 1, 1, (c) => T("Thân chủ đầu tiên", "Người đầu tiên tìm đến bàn bạn là một bà bán hàng rong bị tịch thu xe đẩy và phạt bằng ba tháng tiền lãi. Bà không có tiền, chỉ có một túi cam. Văn phòng dặn bạn mỗi giờ làm việc đều phải tính phí.", [
    C("Nhận vụ, nhận túi cam", { counters: step(c, L, { lsu_cause: 1 }), money: -0.03, happy: 4, flags: ["lawyer_first_free"] }, "Mất giờ tính phí, được một người tin"),
    C("Chuyển bà sang trung tâm trợ giúp pháp lý", { counters: step(c, L), know: 2, income_mult: 1.05 }, "Đúng quy trình, bà phải chờ ba tháng"),
    C("Nhận, gom thêm mười người bán rong kiện chung", { counters: step(c, L, { lsu_cause: 1 }), bw: -6, agency: 0.02, gamble: { p: 0.4, win: { counters: { lsu_win: 1 }, flags: ["lawyer_class_action"], log: "Quyết định phạt bị hủy cho cả mười một người. Báo địa phương đăng tên bạn." }, lose: { happy: -3, log: "Tòa bác đơn. Trên bàn bạn có mười một túi cam." } } }, "Lựa chọn thứ ba: một vụ thành luật chơi chung", { tier: "sovereign" })], 0), adult),
  beat(L, 2, 3, (c) => T("Hai lời mời", "Vụ thắng gần nhất đưa tên bạn lên báo. Cùng một tuần, hai lời mời đến: một hãng luật lớn cần người bào chữa cho nhà máy bị kiện vì xả thải, lương gấp đôi; các hộ dân bên dòng sông ấy cần người đứng về phía họ, không có tiền trả.", [
    C("Về hãng luật lớn", { counters: step(c, L), income_mult: 1.8, flags: ["lawyer_corporate"] }, "Giàu nhanh, đứng phía nhà máy"),
    C("Đứng về phía các hộ dân", { counters: step(c, L, { lsu_cause: 1 }), income_mult: 0.85, happy: 3, flags: ["lawyer_rights"] }, "Nghèo, mất ngủ, có lý do để dậy"),
    C("Mở văn phòng riêng cùng hai đồng nghiệp", { counters: step(c, L), money: -0.4, agency: 0.03, flags: ["lawyer_own_firm"], gamble: { p: 0.5, win: { income_mult: 1.4, log: "Năm thứ hai, văn phòng có mười hai người." }, lose: { income_mult: 0.9, custom: "borrow:0.3", log: "Năm đầu lỗ. Bạn vay tiền để trả lương nhân viên." } } }, "Lựa chọn thứ ba: tự chọn thân chủ, tự gánh rủi ro", { tier: "sovereign" })], 0), adult),
  beat(L, 3, 4, (c) => f(c, "lawyer_corporate")
    ? T("Bản ghi nhớ trong hồ sơ", "Hai tuần trước phiên xử, bạn đọc được một bản ghi nhớ nội bộ: ban giám đốc nhà máy biết nước thải vượt ngưỡng từ ba năm trước. Luật sư thành viên cấp cao bảo đó là bí mật thân chủ. Tiền thưởng cuối năm của bạn phụ thuộc vào vụ này.", [
      C("Giữ bí mật thân chủ, tiếp tục bào chữa", { counters: step(c, L), income_mult: 1.2, money: 0.4, happy: -6, flags: ["lawyer_kept_memo"] }, "Đúng nghĩa vụ nghề, nặng lòng"),
      C("Rút khỏi vụ án", { counters: step(c, L, { lsu_cause: 1 }), income_mult: 0.7, rel: 2, flags: ["lawyer_withdrew"] }, "Sạch tay, mất chỗ đứng ở hãng"),
      C("Thuyết phục thân chủ tự công bố và bồi thường", { counters: step(c, L), agency: 0.03, gamble: { p: 0.35, win: { income_mult: 1.3, flags: ["lawyer_fair_settlement"], log: "Nhà máy chấp nhận hòa giải và lắp hệ thống xử lý. Bạn được giao phụ trách tuân thủ." }, lose: { income_mult: 0.6, custom: "job_lose", flags: ["lawyer_fired"], log: "Bạn bị cho thôi việc trong ngày. Hãng nói bạn 'không trung thành với thân chủ'." } } }, "Lựa chọn thứ ba: cứu cả thân chủ lẫn dòng sông", { tier: "sovereign" })], 0)
    : T("Bị đề nghị tước thẻ", `${f(c, "lawyer_rights") ? "Vụ các hộ dân bên sông" : "Một vụ bạn nhận bào chữa cho người yếu thế"} làm nhiều người có thế lực khó chịu. Một lá đơn tố bạn 'xúi giục khiếu kiện' được gửi lên đoàn luật sư. Cùng tuần, văn phòng bạn bị kiểm tra thuế ba ngày liền.`, [
      C("Rút vụ để giữ thẻ hành nghề", { counters: step(c, L), happy: -6, flags: ["lawyer_backed_down"] }, "Giữ nghề, bỏ rơi thân chủ"),
      C("Giữ vụ, chấp nhận bị kiểm tra", { counters: step(c, L, { lsu_cause: 1 }), bw: -6, gamble: { p: 0.5, win: { counters: { lsu_win: 2 }, rel: 5, log: "Lá đơn bị bác. Bạn thắng vụ kiện, các hộ dân được bồi thường." }, lose: { ...leave(L), flags: ["lawyer_suspended"], log: "Bạn bị đình chỉ hành nghề hai năm." } } }, "Có thể mất thẻ"),
      C("Kêu gọi các văn phòng khác cùng đứng tên bào chữa", { counters: step(c, L), agency: 0.03, flags: ["lawyer_coalition"], gamble: { p: 0.55, win: { rel: 6, counters: { lsu_win: 1 }, log: "Mười bốn luật sư cùng ký vào hồ sơ. Lá đơn tố cáo lặng lẽ biến mất." }, lose: { happy: -4, income_mult: 0.85, log: "Chỉ hai người dám ký. Khách hàng doanh nghiệp rút dần." } } }, "Lựa chọn thứ ba: không đứng một mình", { tier: "sovereign" })], 1), adult),
  beat(L, 4, 5, (c) => f(c, "lawyer_kept_memo")
    ? T("Hồ sơ rò rỉ", "Bản ghi nhớ năm nào lọt ra báo. Hãng luật cần một người chịu trách nhiệm, và tên bạn nằm đầu chuỗi email. Họ đề nghị một khoản tiền lớn nếu bạn nhận rằng mình đã tự ý giấu tài liệu.", [
      C("Nhận tiền, nhận lỗi về mình", { counters: step(c, L), money: 1.5, ...leave(L), close_doors: ["clean_record"], flags: ["lawyer_scapegoat"] }, "Giàu lên, mất nghề và tên sạch"),
      C("Khai thật với cơ quan điều tra", { counters: step(c, L), gamble: { p: 0.5, win: { income_mult: 0.8, flags: ["lawyer_witness"], log: "Bạn trở thành nhân chứng. Hãng cũ kiện ngược, rồi rút đơn." }, lose: { ...leave(L), log: "Bạn bị đình chỉ hành nghề vì vi phạm bí mật thân chủ." } } }, "Nói thật, có thể mất thẻ"),
      C("Đổi phe, làm chứng miễn phí cho các hộ dân", { counters: step(c, L, { lsu_cause: 2 }), money: -0.3, income_mult: 0.6, rel: 6, agency: 0.04, flags: ["lawyer_turned"] }, "Lựa chọn thứ ba: trả món nợ với dòng sông", { tier: "sovereign", longterm: true })], 1)
    : T("Vụ án của đời", `${n(c, "lsu_win") >= 2 ? "Sau ngần ấy vụ thắng, tòa cao nhất nhận xét xử vụ do bạn khởi kiện." : "Vụ bạn theo đuổi bảy năm được đưa lên tòa cao nhất."} Nếu thắng, bản án sẽ thành tiền lệ cho hàng nghìn người như thân chủ của bạn. Phía bên kia đề nghị hòa giải: một khoản bồi thường lớn, đổi lại không ai được nhắc đến vụ việc nữa.`, [
      C("Đi đến cùng, xin một bản án", { counters: step(c, L), bw: -10, money: -0.2, gamble: { p: Math.min(0.7, 0.45 + 0.05 * n(c, "lsu_cause")), win: { income_mult: 1.4, rel: 6, flags: ["lawyer_landmark"], log: "Tòa tuyên thắng. Năm sau, bản án được giảng trong trường luật." }, lose: { happy: -6, log: "Thua sát nút. Thân chủ của bạn không nhận được gì." } } }, "Thành tiền lệ hoặc mất trắng"),
      C("Nhận hòa giải, lấy tiền cho thân chủ", { counters: step(c, L), money: 0.4, happy: -2, flags: ["lawyer_settled"] }, "Thân chủ chắc có tiền, luật không đổi"),
      C("Để đồng nghiệp trẻ đứng tên, bạn lùi lại phía sau", { counters: step(c, L), income_mult: 0.95, happy: 2, flags: ["has_apprentice"] }, "Mất ánh đèn, có người nối nghề", { tier: "awakened" })], 0), adult),
  beat(L, 5, 6, (c) => T("Tấm thẻ cũ", `${f(c, "lawyer_first_free") ? "Bà bán hàng rong năm nào giờ có một sạp nhỏ trong chợ, năm nào cũng gửi đến văn phòng một túi cam." : f(c, "lawyer_corporate") ? "Tên bạn nằm trên tấm biển đồng ở sảnh hãng luật." : "Bạn đã ký hơn ba trăm bản bào chữa."} Một sinh viên luật xin theo bạn tập sự và hỏi đúng câu bạn từng hỏi chính mình: 'Luật sư là để bảo vệ ai?'`, [
    C("Lập quỹ trợ giúp pháp lý mang tên thân chủ cũ", { counters: step(c, L), money: -0.5, rel: 5, flags: ["passed_on", "legal_aid_fund"] }, "Bỏ tiền thật, để lại một chỗ cho người nghèo"),
    C("Nhận sinh viên, dạy những gì không có trong sách", { counters: step(c, L), bw: -3, happy: 4, flags: ["has_apprentice"] }, "Mất thời gian, có người nối nghề"),
    C("Bán phần vốn ở văn phòng, gác thẻ", { counters: step(c, L), ...leave(L), money: 0.8 }, "Nghỉ khi còn khỏe, câu hỏi để người khác trả lời")], 1), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(L, "lsu_hours", [24, 65], 7, (c) => T("Giờ tính phí", vary("lsuh", c.age, ["Cuối tháng, luật sư thành viên nhắc bạn 'làm tròn' số giờ ghi cho khách: thêm hai mươi giờ, không ai kiểm được.", "Một khách hàng lớn trả theo giờ. Đồng nghiệp gợi ý ghi luôn cả giờ ngồi taxi và giờ nghĩ về vụ án lúc tắm."]), [
    C("Ghi thêm như mọi người", { money: 0.06, counters: { honest: -1 } }, "Thưởng cao hơn, lương tâm nhẹ đi"),
    C("Ghi đúng giờ thật", { counters: { honest: 1 }, income_mult: 0.98 }, "Sạch, bị xếp hạng thấp")], 1)),
  daily(L, "lsu_alibi", [24, 65], 9, () => T("Nhân chứng của thân chủ", "Thân chủ muốn đưa một người bạn ra làm chứng rằng tối hôm đó anh ta ở nhà. Anh ta nói riêng với bạn rằng điều đó không đúng, rồi nhìn bạn chờ đợi.", [
    C("Từ chối nhân chứng gian, vẫn bào chữa hết sức", { counters: { honest: 1 }, gamble: { p: 0.5, win: { counters: { lsu_win: 1 }, log: "Bạn chỉ ra chỗ hở trong lời buộc tội. Thân chủ được giảm án." }, lose: { happy: -2, log: "Thân chủ nhận án nặng và đổ lỗi cho bạn." } } }, "Đúng nghề, có thể thua"),
    C("Để thân chủ tự đưa nhân chứng ra", { counters: { lsu_win: 1, honest: -2 }, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 8], note: "để nhân chứng gian lên tòa" } }, "Có thể thắng, có thể mất thẻ về sau"),
    C("Xin rút khỏi vụ án", { money: -0.05, flags: ["lawyer_withdrew_case"] }, "Mất phí, sạch tay")], 0)),
  daily(L, "lsu_wait", [24, 65], 8, () => T("Hai mươi phút gặp thân chủ", "Bạn đến trại tạm giam lúc bảy giờ sáng. Ba giờ chiều mới được gặp thân chủ, trong hai mươi phút, có người ngồi cạnh ghi chép từng câu.", [
    C("Ghi biên bản thời gian chờ, khiếu nại", { bw: -3, flags: ["lawyer_complaint"], gamble: { p: 0.4, win: { rel: 2, log: "Lần sau, bạn chỉ phải chờ bốn mươi phút." }, lose: { happy: -2, log: "Khiếu nại không được trả lời. Lần sau bạn chờ lâu hơn." } } }, "Đòi quyền, có thể bị làm khó"),
    C("Chờ, giữ quan hệ êm với trại", { health: -1, counters: { lsu_patience: 1 } }, "Êm, thân chủ thiệt"),
    C("Lập nhóm luật sư cùng ghi sổ thời gian chờ", { agency: 0.02, bw: -4, flags: ["lawyer_wait_log"] }, "Lựa chọn thứ ba: biến chuyện riêng thành số liệu chung", { tier: "sovereign" })], 1)),
  daily(L, "lsu_rival", [24, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Đối thủ ở phòng xử", `${N(r)} đại diện cho phía bên kia. Giờ nghỉ, ${N(r)} rủ bạn ra hành lang: 'Vụ này bên tôi nhường, vụ tháng sau bên bạn nhường. Hai thân chủ đều không biết.'`, [
    C("Bắt tay", { money: 0.08, counters: { honest: -2 }, memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.2, note: "đổi vụ ở hành lang tòa" } }, "Dễ cho cả hai, bán đứng thân chủ"),
    C("Từ chối, đấu đến cùng", { bw: -3, memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.15, note: "bị từ chối thẳng ở hành lang tòa" }, gamble: { p: 0.5, win: { counters: { lsu_win: 1 }, log: "Bạn thắng vụ ấy." }, lose: { happy: -2, log: "Bạn thua. Thân chủ không bao giờ biết đã có một lời đề nghị." } } }, "Sạch, có thể thua"),
    C("Kể lại lời đề nghị cho đoàn luật sư", { counters: { honest: 2 }, rel: -2, memory: { npc: r, tag: "BETRAYED_PARTNERSHIP", weight: -0.4, note: "tố lời đề nghị đổi vụ" } }, "Sạch nghề, có kẻ thù suốt đời", { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(L, "lsu_friend", [24, 65], 10, (c, N) => { const fr = role(c, "childhood_friend")!; return T("Bạn cũ nhờ kiện", `${N(fr)} sắp ly hôn và muốn bạn làm luật sư. Người kia cũng là bạn học cũ của bạn, từng đến dự đám cưới bạn và ôm bạn rất lâu.`, [
    C("Nhận, vì thân với người này hơn", { trust: { npc: fr, delta: 0.25 }, rel: -3, money: 0.03 }, "Giữ một người bạn, mất một người"),
    C("Từ chối, giới thiệu đồng nghiệp", { trust: { npc: fr, delta: -0.1 }, counters: { honest: 1 } }, "Giữ nguyên tắc, bạn thấy bị bỏ rơi"),
    C("Mời cả hai ngồi hòa giải, không đứng về bên nào", { gamble: { p: 0.4, win: { trust: { npc: fr, delta: 0.2 }, log: "Họ chia tài sản trong một buổi chiều, không ai phải ra tòa." }, lose: { trust: { npc: fr, delta: -0.2 }, log: `${N(fr)} trách bạn không đứng về phía mình.` } } }, "Khó, nhưng không ai phải thua", { tier: "awakened" })], 1, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),
  daily(L, "lsu_tv", [26, 65], 8, () => T("Bình luận trước giờ tuyên án", "Một vụ án đang được cả nước theo dõi. Kênh truyền hình mời bạn lên bình luận lúc tám giờ tối, hai ngày trước khi tòa tuyên án.", [
    C("Lên sóng, nói thẳng", { counters: { lsu_fame: 1 }, gamble: { p: 0.6, win: { income_mult: 1.05, log: "Điện thoại văn phòng reo suốt tuần sau." }, lose: { rel: -3, log: "Một câu của bạn bị cắt ra, thành bị chê 'phán xử thay tòa'." } } }, "Nổi tên, có thể bị cắt câu"),
    C("Từ chối: tòa chưa xử thì chưa bình luận", { counters: { honest: 1 }, happy: -1 }, "Giữ nghề, mất một dịp được biết đến")], 1)),
  daily(L, "lsu_fee", [24, 65], 7, (c) => T("Phí ăn chia", vary("lsuf", c.age, ["Một công nhân bị thương ở tay trong xưởng, công ty không chịu bồi thường. Anh không có tiền trả phí, chỉ đề nghị chia cho bạn một phần nếu thắng.", "Một gia đình có con bị tai nạn ở công trình xây dựng tìm đến bạn. Họ vừa bán chiếc xe máy để lo viện phí."]), [
    C("Lấy bốn phần mười nếu thắng", { counters: { lsu_contingency: 1 }, gamble: { p: 0.55, win: { money: 0.25, log: "Bạn thắng. Họ nhận sáu phần, bạn bốn." }, lose: { money: -0.05, log: "Thua. Ba tháng làm không công." } } }, "Lời to, ăn vào phần người bị nạn"),
    C("Lấy một phần mười, đủ bù chi phí", { counters: { lsu_cause: 1 }, gamble: { p: 0.55, win: { money: 0.05, log: "Bạn thắng. Họ chuộc lại được chiếc xe máy." }, lose: { money: -0.05, log: "Thua. Bạn mất ba tháng và tiền in ấn." } } }, "Ít lời, ngủ ngon"),
    C("Từ chối, vụ khó thắng", { happy: -1 })], 1)),
  daily(L, "lsu_3am", [24, 65], 7, (c) => T("Ba giờ sáng ở văn phòng", vary("lsu3", c.age, ["Tuần này bạn làm tám mươi giờ. Ba giờ sáng, cả tầng chỉ còn đèn bàn bạn sáng. Ngực bạn nhói lên một lần.", "Phiên tòa kéo dài mười ngày. Bạn ngủ trung bình bốn tiếng, ăn trưa bằng bánh mì trong xe."]), [
    C("Xin nghỉ một tháng", { income_mult: 0.95, health: 6, happy: 3, flags: ["lawyer_sabbatical"] }, "Mất khách, lấy lại sức"),
    C("Uống thêm cà phê, làm tiếp", { money: 0.05, health: -5, counters: { lsu_overwork: 1 } }, "Thêm tiền, bớt tuổi thọ"),
    C("Từ chối bớt khách, chỉ nhận vụ mình tin", { income_mult: 0.9, health: 3, counters: { lsu_cause: 1 } }, "Ít tiền hơn, đời là của mình", { tier: "awakened" })], 0)),
  daily(L, "lsu_ai", [24, 65], 9, () => T("Án lệ không có thật", "Luật sư tập sự nộp cho bạn bản thảo do máy viết, trơn tru đến lạ. Bản thảo trích bốn án lệ; bạn chỉ tìm được ba. Hạn nộp tòa là chín giờ sáng mai.", [
    C("Thức đêm kiểm từng trích dẫn", { bw: -5, health: -1, counters: { lsu_careful: 1 } }, "Mất đêm, giữ uy tín"),
    C("Nộp luôn, tin cái máy", { bw: 3, gamble: { p: 0.5, win: { counters: { lsu_luck: 1 }, log: "Không ai để ý." }, lose: { income_mult: 0.9, flags: ["lawyer_sanctioned"], log: "Thẩm phán phát hiện án lệ bịa. Tên bạn lên báo ngành." } } }, "Ngủ được, đánh cược tên tuổi"),
    C("Lập quy định kiểm chứng cho cả văn phòng", { bw: -3, agency: 0.02, flags: ["lawyer_ai_rule"] }, "Lựa chọn thứ ba: sửa cách làm, không chỉ sửa bản thảo", { tier: "sovereign" })], 0)),
  daily(L, "lsu_inhouse", [35, 60], 99, () => T("Lời mời làm pháp chế", "Một tập đoàn mời bạn làm trưởng phòng pháp chế: giờ hành chính, nghỉ cuối tuần, lương cao hơn năm tốt nhất của bạn. Bạn sẽ không còn đứng trong phòng xử nữa.", [
    C("Nhận, rời phòng xử", { ...leave(L), money: 0.1, health: 3, flags: ["ex_lawyer_inhouse"] }, "Ổn định, mất phòng xử"),
    C("Ở lại với nghề", { counters: { lsu_cause: 1 }, happy: 1 }, "Bấp bênh, vẫn được cãi cho người khác")], 1), (c) => c.happy < 55 || c.age >= 40),

  /* ---------- gia đình ---------- */
  cross(L, "lsu_family", [26, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} hỏi về thân chủ`, `Cả lớp ${N(k)} bàn về vụ án trên báo, và ai cũng biết bạn là luật sư của bị cáo. Tối đó, ${N(k)} hỏi: 'Sao bố mẹ lại bênh một người ai cũng ghét?'`, [
      C("Giải thích quyền được bào chữa của mọi người", { trust: { npc: k, delta: 0.2 }, bw: -2 }, "Mất một buổi tối, con hiểu nghề của bạn"),
      C("Gạt đi: 'Việc của người lớn'", { trust: { npc: k, delta: -0.15 } }, "Nhanh, con tự tìm câu trả lời trên mạng"),
      C("Rủ con đến dự một phiên tòa", { trust: { npc: k, delta: 0.1 }, gamble: { p: 0.5, win: { flags: ["kid_saw_court"], log: `${N(k)} ngồi im suốt phiên, về nhà mượn sách luật của bạn.` }, lose: { log: `${N(k)} ngủ gật ở hàng ghế sau.` } } }, "Để con tự nhìn", { tier: "awakened" })], 0, { npc: k });
    return T("Hợp đồng bố mẹ ký", `${N(p!)} ký một hợp đồng vay có điều khoản in nhỏ ở trang cuối mà không đọc. Giờ bên cho vay đòi lấy căn nhà.`, [
      C("Tự đứng ra kiện bên cho vay", { trust: { npc: p!, delta: 0.3 }, bw: -6, gamble: { p: 0.55, win: { log: "Tòa tuyên điều khoản ấy vô hiệu. Căn nhà vẫn là của bố mẹ." }, lose: { money: -0.3, log: "Bạn thua. Bạn trả nợ thay để giữ nhà." } } }, "Tốn sức, có thể thua trên sân nhà"),
      C("Lặng lẽ trả nợ thay", { money: -0.4, trust: { npc: p!, delta: 0.15 } }, "Mất tiền, giữ thể diện cho bố mẹ"),
      C("Dạy bố mẹ đọc hợp đồng, để họ tự đứng đơn", { trust: { npc: p!, delta: 0.05 }, bw: -3, promise: { to: p!, what: "đi cùng bố mẹ đến mọi buổi hòa giải", years: 1 } }, "Chậm hơn, bố mẹ không còn bị lừa lần sau", { tier: "awakened" })], 0, { npc: p! }); }),

  /* ================================================================ NHÀ NGOẠI GIAO ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(D, "ngg_t_letter", [10, 16], () => true, () => T("Lá thư từ xứ lạ", "Bạn nhận được thư của một người bạn qua thư ở nửa kia trái đất, viết bằng thứ tiếng bạn chỉ biết vài chữ. Bạn ngồi cả tuần với cuốn từ điển cũ sờn gáy để viết thư trả lời, và gạch xóa đến lần thứ bảy.", [
    C("Xin bố mẹ cho học thêm một ngoại ngữ", { money: -0.03, flags: [talentFlag(D)], counters: { talents_seen: 1 }, know: 3 }, "Tốn tiền nhà, thế giới rộng ra"),
    C("Viết một lá rồi thôi", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(D, "ngg_d_exam", [25, 35], () => true, (c) => T("Kỳ thi ngành ngoại giao", "Cơ quan đối ngoại tuyển người: sáu mươi hồ sơ cho một chỉ tiêu, ba vòng thi, vòng cuối phỏng vấn hoàn toàn bằng ngoại ngữ. Người trúng tuyển phải sẵn sàng sống ở bất cứ đâu, trong bất cứ bao lâu.", [
    C("Ôn một năm, đi thi", { counters: { doors_seen: 1 }, bw: -5, money: -0.05, gamble: { p: f(c, talentFlag(D)) ? 0.5 : 0.3, win: { ...become(D), log: "Bạn đỗ. Thư báo nói ba tháng nữa có thể được cử đi bất cứ đâu." }, lose: { happy: -4, log: "Bạn trượt ở vòng phỏng vấn, vì một câu hỏi mà bạn biết câu trả lời nhưng run quá không nói được." } } }, "Một năm ôn, có thể trượt"),
    C("Nhờ người quen 'giới thiệu' vào vòng cuối", { ...become(D), counters: { doors_seen: 1 }, money: -0.3, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [5, 15], note: "chạy vòng phỏng vấn ngành ngoại giao" } }, "Chắc suất, một bí mật theo suốt nhiệm kỳ"),
    C("Thôi, ở lại với đời quen", { counters: { doors_seen: 1 } })], 0)),
  door(D, "ngg_d_interpret", [25, 45], (c) => c.know > 45 || f(c, talentFlag(D)), () => T("Người phiên dịch thay thế", "Người phiên dịch của một đoàn đàm phán thương mại bị ngộ độc thức ăn. Bảy giờ sáng, người ta gọi bạn đến thay, vì bạn là người hiếm hoi trong thành phố nói thạo cả hai thứ tiếng. Chiều hôm ấy, trưởng đoàn hỏi bạn có muốn vào ngành không.", [
    C("Nhận lời, bỏ việc đang làm", { ...become(D), counters: { doors_seen: 1 }, money: -0.05, agency: 0.02 }, "Bỏ chỗ quen, đổi lấy thế giới"),
    C("Chỉ nhận phiên dịch theo hợp đồng", { counters: { doors_seen: 1 }, money: 0.06, flags: ["freelance_interpreter"] }, "Thêm tiền, không thêm ràng buộc")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(D, 1, 1, (c) => T("Nhiệm sở đầu tiên", `Nhiệm sở đầu tiên của bạn là một sứ quán bốn người ở một thủ đô nóng ẩm, cách nhà mười một giờ bay. Việc đầu tiên trên bàn: một lao động ${vn(c) ? "đồng hương" : "cùng quốc tịch"} gọi điện khóc, chủ đã giữ hộ chiếu của anh sáu tháng.`, [
    C("Tự lái xe đến tận nơi anh làm việc", { counters: step(c, D, { ngg_net: 1 }), flags: ["dip_field"], health: -2, gamble: { p: 0.6, win: { happy: 5, log: "Bạn mang hộ chiếu về trong túi áo. Anh ấy gọi bạn bằng tên, như gọi người nhà." }, lose: { bw: -4, log: "Chủ đuổi bạn ra cổng. Rốt cuộc vẫn phải chờ ba tuần công hàm." } } }, "Nhanh, vượt quy trình, có thể hỏng việc"),
    C("Gửi công hàm, làm đúng thủ tục", { counters: step(c, D), know: 2, income_mult: 1.03 }, "Đúng quy trình, anh ấy chờ thêm hai tháng")], 0), adult),
  beat(D, 2, 3, (c) => T("Ghế ghi biên bản", "Bạn ngồi ghế ghi biên bản trong vòng đàm phán về quyền đánh cá giữa nước bạn và một nước láng giềng. Giờ nghỉ, một người trẻ bên kia kín đáo ra hiệu: họ có thể nhượng nếu bên bạn mềm một điều khoản. Trưởng đoàn của bạn thì cần một hình ảnh cứng rắn để mang về nước.", [
    C("Giữ im lặng, phục vụ hình ảnh cứng rắn", { counters: step(c, D), income_mult: 1.25, flags: ["dip_hardline"] }, "Được lòng cấp trên, bỏ lỡ một lối ra"),
    C("Báo tín hiệu ấy cho trưởng đoàn", { counters: step(c, D, { ngg_net: 1 }), flags: ["dip_bridge"], gamble: { p: 0.5, win: { income_mult: 1.15, log: "Trưởng đoàn nghe bạn. Hai bên ký được một thỏa thuận tạm thời." }, lose: { happy: -3, log: "Trưởng đoàn gạt đi: 'Còn non lắm.'" } } }, "Đúng kênh, tùy người nghe"),
    C("Hẹn riêng người kia, thử một phương án thứ ba", { counters: step(c, D, { ngg_net: 2 }), agency: 0.03, gamble: { p: 0.4, win: { income_mult: 1.4, flags: ["dip_backchannel"], log: "Phương án chia mùa đánh cá của hai người trẻ được đưa lên bàn và được ký." }, lose: { income_mult: 0.9, flags: ["dip_reprimand"], log: "Bạn bị khiển trách vì 'tiếp xúc ngoài kênh'." } } }, "Lựa chọn thứ ba: mở một kênh riêng, tự chịu", { tier: "sovereign" })], 0), adult),
  beat(D, 3, 4, (c) => f(c, "dip_hardline")
    ? T("Bức điện bị lộ", "Một bức điện mật bạn viết, trong đó gọi giới lãnh đạo nước sở tại là 'thiển cận', bị lộ lên mạng. Nước sở tại cho bạn bảy mươi hai giờ để rời đi. Ở nhà, cấp trên cần một người chịu trách nhiệm.", [
      C("Lặng lẽ rời đi, nhận lỗi về mình", { counters: step(c, D), income_mult: 0.8, happy: -4, flags: ["dip_scapegoat"] }, "Giữ ngành, mất đường thăng tiến"),
      C("Trả lời báo chí, giải thích bức điện", { counters: step(c, D), gamble: { p: 0.35, win: { rel: 4, flags: ["dip_famous"], log: "Người ta khen bức điện viết thật. Bạn được điều về một vị trí mới." }, lose: { ...leave(D), log: "Bạn bị buộc thôi việc vì phát ngôn không được phép." } } }, "Có thể được khen, có thể mất nghề"),
      C("Xin thôi việc, rời ngành", { counters: step(c, D), ...leave(D), flags: ["ex_diplomat"] }, "Tự rời trước khi bị đẩy")], 0)
    : T("Đêm sơ tán", `Bạo loạn nổ ra ở nước sở tại. Hai nghìn người ${vn(c) ? "đồng hương" : "cùng quốc tịch"} mắc kẹt, chuyến bay duy nhất chở được ba trăm. Lệnh từ thủ đô: nhân viên sứ quán và gia đình lên chuyến đầu tiên.`, [
      C("Ở lại đến chuyến cuối cùng", { counters: step(c, D, { ngg_net: 1 }), flags: ["dip_stayed"], health: -4, rel: 6, gamble: { p: 0.8, win: { log: "Ba tuần sau, bạn lên chuyến bay cuối cùng cùng bốn mươi người cuối cùng." }, lose: { health: -8, log: "Bạn bị thương nhẹ trong một đêm hỗn loạn, nằm viện hai tuần." } } }, "Liều thân, giữ được người"),
      C("Theo lệnh, đưa gia đình lên chuyến đầu", { counters: step(c, D), happy: -5, flags: ["dip_left_first"] }, "An toàn cho nhà mình, ở lại với câu hỏi"),
      C("Thuê tàu dân sự bằng quỹ khẩn cấp", { counters: step(c, D, { ngg_net: 1 }), agency: 0.04, gamble: { p: 0.5, win: { income_mult: 1.2, flags: ["dip_rescuer"], log: "Hai chiếc tàu chở thêm một nghìn người ra khỏi cảng." }, lose: { income_mult: 0.8, flags: ["dip_reprimand"], log: "Mọi người về được, nhưng bạn bị kỷ luật vì chi quỹ sai thẩm quyền." } } }, "Lựa chọn thứ ba: cứu người trước, giải trình sau", { tier: "sovereign" })], 0), adult),
  beat(D, 4, 5, (c) => (f(c, "dip_rescuer") || f(c, "dip_backchannel") || f(c, "dip_stayed") || n(c, "ngg_net") >= 3)
    ? T("Thư bổ nhiệm đại sứ", `${f(c, "dip_rescuer") ? "Những người được tàu đưa về vẫn gửi thư cảm ơn đến bộ." : "Tên bạn có trong danh sách đề cử năm nay."} Bạn được đề nghị làm đại sứ ở một thủ đô lớn. Đi kèm là một yêu cầu không ghi trên giấy: bảo vệ một chính sách mà bạn từng phản đối trong các cuộc họp.`, [
      C("Nhận ghế đại sứ, bảo vệ chính sách", { counters: step(c, D), income_mult: 1.4, happy: -2, flags: ["dip_ambassador"] }, "Đỉnh nghề, nói lời không phải của mình"),
      C("Xin một nước nhỏ, nơi có việc thật để làm", { counters: step(c, D), income_mult: 1.15, happy: 4, flags: ["dip_ambassador", "dip_small_post"] }, "Ít hào quang, làm việc mình tin", { tier: "awakened" }),
      C("Nhận, kèm điều kiện được nói ý kiến khác trong nội bộ", { counters: step(c, D), agency: 0.03, gamble: { p: 0.45, win: { income_mult: 1.4, flags: ["dip_ambassador", "dip_dissent_channel"], log: "Bộ đồng ý. Bức điện bất đồng đầu tiên của bạn được đọc trong cuộc họp." }, lose: { happy: -3, log: "Ghế ấy về tay người khác. Bạn được giữ lại thủ đô." } } }, "Lựa chọn thứ ba: lên ghế mà không mất giọng", { tier: "sovereign" })], 0)
    : T("Bàn giấy ở thủ đô", `${f(c, "dip_scapegoat") ? "Từ sau bức điện, bạn" : "Đã năm năm nay, bạn"} ngồi ở một phòng đóng dấu giấy tờ. Một công ty tư vấn mời bạn về làm vận động chính sách, lương gấp ba, đổi lại là cuốn danh bạ những người bạn từng quen ở các nước.`, [
      C("Nhận việc ở công ty tư vấn", { counters: step(c, D), ...leave(D), money: 0.5, flags: ["dip_lobbyist"] }, "Giàu lên, bán đi những mối quen"),
      C("Ở lại, chờ đến lượt", { counters: step(c, D), happy: -4, income_mult: 1.05 }, "An toàn, có thể chờ mãi"),
      C("Viết sách về nghề, ký tên thật", { counters: step(c, D), bw: -5, gamble: { p: 0.5, win: { rel: 4, flags: ["dip_author"], log: "Cuốn sách thành tài liệu đọc ở các khoa quan hệ quốc tế." }, lose: { income_mult: 0.9, log: "Bản thảo bị yêu cầu cắt một nửa. Bạn cho in nửa còn lại." } } }, "Nói được điều mình nghĩ, có thể bị cắt", { tier: "awakened" })], 0), adult),
  beat(D, 5, 6, (c) => T("Hồ sơ được giải mật", `Nhiều năm sau, hồ sơ về những ngày đầu nghề của bạn được giải mật. ${f(c, "dip_field") ? "Trong đó có tên người lao động bạn lấy lại hộ chiếu; giờ ông có một xưởng nhỏ và muốn gặp bạn." : f(c, "dip_hardline") ? "Trong đó có bức điện của bạn, kèm những dòng bạn ước mình chưa từng viết." : "Trong đó có những biên bản bạn ghi bằng tay, nét chữ còn non."} Một nhà nghiên cứu trẻ xin phỏng vấn bạn.`, [
    C("Kể thật, kể cả sai lầm của mình", { counters: step(c, D), rel: 4, flags: ["dip_truth"], gamble: { p: 0.7, win: { happy: 4, log: "Bài nghiên cứu trích lời bạn ở trang đầu." }, lose: { rel: -3, log: "Vài đồng nghiệp cũ trách bạn 'vạch áo cho người xem lưng'." } } }, "Thành bài học, có người không vui"),
    C("Chỉ nói những gì đã công bố", { counters: step(c, D), happy: -1, flags: ["dip_kept_silence"] }, "An toàn, lịch sử thiếu một nửa"),
    C("Mở lớp cho các nhà ngoại giao trẻ", { counters: step(c, D), ...leave(D), happy: 4, flags: ["passed_on"] }, "Gác hộ chiếu, để lại người nối nghề")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(D, "ngg_reception", [25, 65], 8, () => T("Tiệc chiêu đãi ngày quốc khánh", "Bốn trăm khách, rượu vang và những cuộc trò chuyện năm phút. Một doanh nhân trong nước kéo bạn ra góc phòng: giới thiệu ông với thứ trưởng thương mại nước sở tại, ông sẽ 'biết ơn' bằng một phần trăm hợp đồng.", [
    C("Giới thiệu, nhận phần 'biết ơn'", { money: 0.3, secret: { tag: "PAID_BRIBE", severity: 0.45, fuse_years: [3, 12], note: "nhận hoa hồng giới thiệu ở tiệc chiêu đãi" } }, "Tiền lớn, một bí mật"),
    C("Giới thiệu qua kênh chính thức, không nhận gì", { counters: { ngg_net: 1, honest: 1 }, bw: -2 }, "Mất buổi tối điền giấy tờ"),
    C("Từ chối, quay lại với khách", { counters: { honest: 1 }, rel: -1 }, "Sạch, doanh nhân kia nói xấu bạn ở nhà")], 1)),
  daily(D, "ngg_queue", [25, 65], 8, () => T("Hàng người trước quầy lãnh sự", "Hai trăm lao động xếp hàng từ năm giờ sáng để làm lại hộ chiếu. Cùng lúc, một quan chức trong nước gọi nhờ làm gấp giấy tờ cho con gái ông, trong hôm nay.", [
    C("Làm cho con quan chức trước", { counters: { ngg_net: 1 }, income_mult: 1.03, rel: -3 }, "Lấy lòng cấp trên, người xếp hàng chờ thêm"),
    C("Bắt chờ theo thứ tự như mọi người", { counters: { honest: 1 }, happy: 2, income_mult: 0.98, flags: ["dip_queue_fair"] }, "Công bằng, có người nhớ tên bạn"),
    C("Mở thêm quầy, làm đến nửa đêm", { health: -3, bw: -4, rel: 4, flags: ["dip_late_desk"] }, "Ai cũng xong, bạn kiệt sức", { tier: "awakened" })], 1)),
  daily(D, "ngg_toast", [25, 65], 9, () => T("Lời chúc rượu dịch sai", "Trong bữa tiệc chính thức, phiên dịch dịch sai một chữ trong lời chúc rượu: 'hợp tác' thành 'phụ thuộc'. Bên kia khựng lại, ly còn lưng chừng. Chỉ bạn và người phiên dịch nhận ra.", [
    C("Đứng lên đính chính ngay, bằng một câu đùa", { counters: { ngg_net: 1 }, gamble: { p: 0.6, win: { rel: 3, log: "Cả bàn cười, nâng ly lần nữa." }, lose: { happy: -2, log: "Không ai cười. Người phiên dịch bị điều về nước tuần sau." } } }, "Gỡ được ngay, có thể làm to chuyện"),
    C("Để sau, gửi một ghi chú nhẹ nhàng", { bw: -2, flags: ["dip_quiet_fix"] }, "Kín đáo, bên kia đã kịp hiểu lầm một đêm"),
    C("Mặc kệ, coi như không nghe thấy", { happy: -1, counters: { ngg_risk: 1 } }, "Êm hôm nay, có thể thành chuyện về sau")], 1)),
  daily(D, "ngg_arrest", [25, 65], 9, (c) => T(vn(c) ? "Đồng hương trong tù" : "Người cùng quốc tịch trong tù", "Một thanh niên nước bạn bị bắt ở nước sở tại vì mang theo hàng cấm, có thể lĩnh án rất nặng. Gia đình anh gọi cho bạn mỗi ngày, xin bạn 'can thiệp'.", [
    C("Làm đúng bảo hộ: thăm, tìm luật sư cho anh", { bw: -3, counters: { ngg_consular: 1 }, flags: ["dip_visited_prison"] }, "Đúng việc, gia đình thấy chưa đủ"),
    C("Vận động xin khoan hồng qua kênh ngoại giao", { gamble: { p: 0.35, win: { rel: 5, counters: { ngg_net: 1 }, log: "Án được giảm. Mẹ anh gửi bạn một bức thư viết tay." }, lose: { income_mult: 0.95, log: "Nước sở tại phản đối việc 'can thiệp vào tư pháp'." } } }, "Có thể cứu một người, có thể làm hỏng quan hệ"),
    C("Chuyển hồ sơ cho đồng nghiệp", { happy: -2 }, "Nhẹ việc, nặng lòng")], 0)),
  daily(D, "ngg_hardship", [25, 65], 7, (c) => T("Nhiệm sở khắc nghiệt", vary("nggh", c.age, ["Nhiệm sở này mùa đông chỉ có bốn giờ ánh sáng mỗi ngày. Ngoài sáu đồng nghiệp, bạn không quen ai, và cuộc gọi về nhà luôn rơi vào lúc nửa đêm.", "Nhiệm sở ở vùng sa mạc, bốn mươi lăm độ, không được ra ngoài một mình sau sáu giờ tối. Tuần nào cũng có một đêm mất điện."]), [
    C("Học tiếng địa phương, kết bạn với người bản xứ", { counters: { ngg_net: 1 }, bw: -3, happy: 4 }, "Mệt hơn, nhiệm sở thành nhà"),
    C("Xin luân chuyển sớm", { income_mult: 0.95, happy: 3, flags: ["dip_short_post"] }, "Thoát nhanh, hồ sơ bị chấm điểm thấp"),
    C("Chịu đựng, đếm ngày về", { happy: -5, counters: { drink: 1 } }, "Không mất gì trên giấy, mất dần bên trong")], 0)),
  daily(D, "ngg_press", [25, 65], 8, () => T("Câu hỏi của phóng viên", "Ở một hội thảo, một phóng viên nước ngoài hỏi bạn về một vấn đề nhạy cảm ở nước bạn. Máy quay đang chạy, cả hội trường im lặng chờ.", [
    C("Trả lời đúng văn bản chính thức", { counters: { ngg_safe: 1 }, happy: -2 }, "An toàn, nghe như cái máy"),
    C("Trả lời thật lòng, giữ chừng mực", { gamble: { p: 0.5, win: { counters: { ngg_net: 1 }, rel: 3, log: "Câu trả lời được khen là 'thẳng thắn hiếm thấy'." }, lose: { income_mult: 0.9, flags: ["dip_reprimand"], log: "Bạn bị gọi về họp giải trình." } } }, "Được tin, có thể bị khiển trách"),
    C("Mời phóng viên nói chuyện riêng sau hội thảo", { bw: -2, counters: { ngg_net: 1 } }, "Không có máy quay, có một mối quen", { tier: "awakened" })], 1)),
  daily(D, "ngg_rotation", [25, 62], 6, (c) => T("Lệnh luân chuyển", vary("nggr", c.age, ["Lệnh luân chuyển đến: một nhiệm sở khó khăn có phụ cấp gấp đôi, một thủ đô dễ sống, hoặc về làm ở bộ.", "Lại đến kỳ luân chuyển. Con bạn vừa quen trường mới, bạn đời vừa tìm được việc làm."]), [
    C("Chọn nhiệm sở khó khăn", { money: 0.2, health: -3, counters: { ngg_posts: 1 } }, "Tiền và điểm thăng tiến, gia đình vất vả"),
    C("Chọn thủ đô dễ sống", { happy: 3, counters: { ngg_posts: 1 } }, "Dễ thở, đường lên chậm hơn"),
    C("Về bộ, ở gần nhà", { income_mult: 0.9, rel: 4, flags: ["dip_home_desk"] }, "Bớt phụ cấp, có mặt ở bữa cơm")], 0)),
  daily(D, "ngg_culture", [25, 65], 9, (c) => T("Tuần văn hóa ngân sách nhỏ", `Sứ quán tổ chức tuần văn hóa với số tiền chỉ đủ thuê hội trường hai ngày. ${vn(c) ? "Đoàn nghệ thuật dân gian trong nước cần vé máy bay, và hội người Việt ở đây muốn nấu phở mời khách." : "Một nhóm nghệ nhân trong nước cần vé máy bay, và cộng đồng kiều bào muốn nấu món quê nhà mời khách."}`, [
    C("Bỏ tiền túi bù vé máy bay", { money: -0.05, happy: 3, counters: { ngg_net: 1 } }, "Tốn tiền riêng, tuần lễ đầy đủ"),
    C("Mời cộng đồng kiều bào cùng đứng ra tổ chức", { rel: 4, bw: -3, flags: ["dip_diaspora"] }, "Mất quyền quyết, được người", { tier: "awakened" }),
    C("Làm nhỏ, đúng ngân sách", { happy: -1, counters: { honest: 1 } }, "Sổ sách đẹp, hội trường vắng")], 1)),
  daily(D, "ngg_friend", [25, 65], 10, () => T("Người bạn quá tốt", "Một người bản xứ thân thiện mời bạn ăn tối mỗi tháng, tặng sách, rủ đi câu cá cuối tuần. Dạo gần đây, câu hỏi của anh ta về công việc của bạn ngày càng cụ thể.", [
    C("Báo bộ phận an ninh của sứ quán", { happy: -2, flags: ["dip_reported_contact"] }, "Đúng quy định, mất một người bạn"),
    C("Giữ tình bạn, cẩn trọng từng câu", { gamble: { p: 0.6, win: { happy: 2, counters: { ngg_net: 1 }, log: "Có lẽ anh ta chỉ tò mò. Hai người vẫn câu cá với nhau." }, lose: { income_mult: 0.85, flags: ["dip_security_review"], log: "Bạn bị đưa vào diện rà soát an ninh, mất một năm thăng tiến." } } }, "Giữ bạn, đánh cược hồ sơ"),
    C("Cắt liên lạc, không giải thích", { happy: -1, counters: { ngg_safe: 1 } }, "An toàn, có thể đã làm tổn thương một người tốt")], 0)),
  daily(D, "ngg_immunity", [27, 65], 99, () => T("Quyền miễn trừ", "Một đồng nghiệp ở sứ quán lái xe sau tiệc, gây tai nạn làm một người dân sở tại bị thương nặng. Anh ta viện quyền miễn trừ ngoại giao. Sáng nay, gia đình nạn nhân đứng trước cổng sứ quán với tấm ảnh.", [
    C("Giữ quyền miễn trừ theo thông lệ", { counters: { ngg_safe: 1 }, happy: -3, rel: -2 }, "Bảo vệ người trong ngành, mất lòng nước sở tại"),
    C("Đề xuất từ bỏ miễn trừ, để tòa sở tại xử", { agency: 0.02, gamble: { p: 0.4, win: { rel: 4, counters: { ngg_net: 1 }, flags: ["dip_waived_immunity"], log: "Bộ đồng ý. Báo chí sở tại gọi đó là 'một cử chỉ hiếm hoi'." }, lose: { income_mult: 0.9, log: "Bạn bị coi là không bảo vệ đồng nghiệp. Lần luân chuyển sau, bạn bị xếp cuối." } } }, "Lựa chọn thứ ba: để luật đứng trên đặc quyền", { tier: "sovereign" }),
    C("Lặng lẽ vận động bồi thường cho nạn nhân", { bw: -3, money: -0.03, rel: 2, flags: ["dip_quiet_comp"] }, "Đỡ cho nạn nhân, chuyện chính vẫn bị chôn", { tier: "awakened" })], 0)),

  /* ---------- gia đình ---------- */
  cross(D, "ngg_family", [27, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (p && c.parent_sick) return T("Cách nhà mười một giờ bay", `${N(p)} ốm nặng. Bạn đang ở cách nhà mười một giờ bay, giữa một nhiệm kỳ còn hai năm, và tuần sau có chuyến thăm cấp cao bạn phụ trách.`, [
      C("Xin về nước trước hạn", { income_mult: 0.9, trust: { npc: p, delta: 0.3 } }, "Chậm sự nghiệp, có mặt khi cần"),
      C("Bay về hai tuần rồi quay lại", { money: -0.1, trust: { npc: p, delta: 0.1 } }, "Vẹn cả hai, mệt cả hai"),
      C("Gửi tiền về, ở lại làm việc", { money: -0.15, memory: { npc: p, tag: "REFUSED_HELP", weight: -0.2, note: "không về khi bố mẹ ốm nặng" } }, "Giữ nhiệm kỳ, để lại một khoảng trống")], 0, { npc: p });
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn ở lại`, `${N(k)} lớn lên ở bốn nước, nói tiếng mẹ đẻ như người nước ngoài. Giờ ${N(k)} muốn ở lại học đại học ở nước sở tại khi bạn hết nhiệm kỳ.`, [
      C("Cho con ở lại", { money: -0.1, trust: { npc: k, delta: 0.2 } }, "Tốn tiền, con tự lập sớm"),
      C("Bắt con về nước cùng gia đình", { trust: { npc: k, delta: -0.2 } }, "Giữ con gần, con thấy bị nhổ rễ lần nữa"),
      C("Xin ở thêm một năm để con quen dần", { income_mult: 0.95, trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "để con tự quyết sau một năm", years: 1 } }, "Chậm sự nghiệp, con được chọn", { tier: "awakened" })], 2, { npc: k });
    return T("Danh sách nhờ xin visa", `${N(p!)} khoe với cả xóm rằng con mình "làm quan ở nước ngoài", rồi gửi sang danh sách mười người họ hàng nhờ bạn "lo" visa sang nước bạn đang ở.`, [
      C("Từ chối hết", { trust: { npc: p!, delta: -0.15 }, counters: { honest: 1 } }, "Sạch, bố mẹ mất mặt với họ hàng"),
      C("Giúp một người, đúng quy trình", { trust: { npc: p!, delta: 0.1 }, bw: -2 }, "Vừa lòng một nửa, chín người còn lại trách"),
      C("Viết hướng dẫn thủ tục gửi cả họ", { trust: { npc: p!, delta: 0.05 }, rel: 2, bw: -1 }, "Không hứa gì, ai cũng tự làm được", { tier: "awakened" })], 0, { npc: p! }); }),

  /* ================================================================ CÁN BỘ HẢI QUAN ================================================================ */

  /* ---------- năng khiếu ---------- */
  talent(H, "hqa_t_count", [10, 16], () => true, () => T("Đếm lại từng thùng", "Người giao hàng cho sạp nhà bạn đặt xuống mười thùng nước ngọt và đòi tiền mười hai. Mẹ bạn định trả cho xong chuyện. Bạn đếm lại từng thùng ngay trước mặt ông ta, và không lùi khi ông ta to tiếng.", [
    C("Đòi đếm lại đến cùng", { flags: [talentFlag(H)], counters: { talents_seen: 1 }, happy: 2, rel: -1 }, "Mất lòng người lớn, học được cái gan"),
    C("Để mẹ trả cho êm", { counters: { talents_seen: 1 }, money: -0.01 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(H, "hqa_d_exam", [22, 35], () => true, (c) => T("Kỳ thi công chức hải quan", `${vn(c) ? "Cả họ" : "Cả nhà"} bảo ngành hải quan "ổn định lại có lộc". Kỳ thi tuyển năm nay có ba trăm người cho mười hai chỉ tiêu. Một người quen nói có thể "lo" một suất, giá bằng một mảnh đất nhỏ.`, [
    C("Ôn thi, đi thi bằng sức mình", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: f(c, talentFlag(H)) ? 0.5 : 0.35, win: { ...become(H), log: "Bạn đỗ thứ chín. Bộ đồng phục đầu tiên hơi rộng vai." }, lose: { happy: -3, log: "Bạn trượt. Danh sách đỗ có ba cái tên cùng họ với một vị trưởng phòng." } } }, "Sạch sẽ, có thể trượt"),
    C("Vay tiền 'lo' một suất", { counters: { doors_seen: 1 }, custom: "borrow:0.8|become:customs", flags: ["cus_bought_seat"], secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [3, 15], note: "chạy suất vào ngành hải quan" } }, "Vào chắc, mang nợ và một bí mật"),
    C("Thôi, tìm việc khác", { counters: { doors_seen: 1 } })], 0)),
  door(H, "hqa_d_port", [22, 40], () => true, () => T("Từ bên kia quầy", "Năm năm làm nhân viên khai thuê cho một công ty giao nhận ở cảng, bạn thuộc từng mẫu tờ khai, từng gương mặt sau quầy. Một cán bộ hải quan quen mặt bảo ngành đang tuyển người có kinh nghiệm, lương thấp hơn chỗ bạn một nửa.", [
    C("Chuyển sang làm hải quan", { ...become(H), counters: { doors_seen: 1 }, money: -0.05, agency: 0.01 }, "Lương thấp, đứng ở phía cầm con dấu"),
    C("Ở lại công ty giao nhận", { counters: { doors_seen: 1 }, money: 0.05 }, "Lương khá, mãi đứng ngoài quầy")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(H, 1, 1, (c) => T("Ca trực đầu tiên", `Ca trực đầu tiên ở ${c.poor_country ? "cửa khẩu đường bộ" : "kho hàng sân bay"}: hàng xe nối dài ba cây số. Đàn anh giao con dấu cho bạn và dặn: xe của mấy công ty quen thì đừng giữ lâu, ${vn(c) ? "'ai cũng cần ăn Tết'" : "'ai cũng có gia đình phải nuôi'"}.`, [
    C("Làm theo lời đàn anh", { counters: step(c, H), rel: 3, flags: ["cus_fast_lane"] }, "Được nhận vào nhóm, nợ một lần nhắm mắt"),
    C("Kiểm tra mọi xe như nhau", { counters: step(c, H, { hqa_clean: 1 }), rel: -3, bw: -3, flags: ["cus_by_book"] }, "Đúng luật, bị coi là người lạ"),
    C("Hỏi thẳng 'công ty quen' là công ty nào", { counters: step(c, H), gamble: { p: 0.5, win: { know: 3, flags: ["cus_knows_ring"], log: "Đàn anh cười, kể cho bạn nghe nhiều hơn bạn muốn biết." }, lose: { rel: -4, log: "Đàn anh không trả lời. Tuần sau bạn bị xếp ca đêm." } } }, "Biết rõ luật ngầm, có thể bị gạt ra", { tier: "awakened" })], 0), adult),
  beat(H, 2, 3, (c) => T("Phong bì cuối tháng", `Cuối tháng, trong ngăn bàn của bạn có một phong bì dày bằng ba tháng lương, không ghi tên người gửi. Cả đội ai cũng có một cái giống thế${f(c, "cus_by_book") ? ", và mọi người đang chờ xem người hay kiểm từng xe sẽ làm gì" : ""}.`, [
    C("Nhận như mọi người", { counters: step(c, H, { hqa_dirty: 1 }), money: 0.25, rel: 2, flags: ["cus_envelope"], secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 12], note: "nhận phong bì của đường dây ở cửa khẩu" } }, "Hòa vào đội, mang một bí mật"),
    C("Trả lại, xin chuyển sang đội khác", { counters: step(c, H, { hqa_clean: 1 }), income_mult: 0.9, rel: -3, flags: ["cus_outsider"] }, "Sạch, bị đẩy sang việc kém"),
    C("Giữ phong bì làm bằng chứng, gửi thanh tra", { counters: step(c, H, { hqa_clean: 2 }), agency: 0.03, gamble: { p: 0.4, win: { rel: -2, flags: ["cus_whistle"], later: { years: 2, storylet: "hqa_parked_car" }, log: "Thanh tra vào cuộc, cả đội bị điều chuyển. Bạn ở lại một mình, với biệt danh 'kẻ chỉ điểm'." }, lose: { health: -3, flags: ["cus_exiled"], log: "Phong bì biến mất khỏi hồ sơ. Bạn bị điều lên trạm biên giới xa nhất." } } }, "Lựa chọn thứ ba: phá đường dây, cược an toàn", { tier: "sovereign" })], 0), adult),
  beat(H, 3, 4, (c) => f(c, "cus_envelope")
    ? T("Chuyên án", "Một lô hàng cấm bị bắt ở cảng khác, và lần theo giấy tờ thì nó đã đi qua cửa khẩu của đội bạn. Cơ quan điều tra lần lượt mời từng người lên làm việc. Đàn anh nhắn: 'Cứ im, có người lo.'", [
      C("Khai hết, xin làm nhân chứng", { counters: step(c, H), flags: ["cus_witness"], gamble: { p: 0.55, win: { income_mult: 0.7, log: "Bạn được miễn truy cứu vì hợp tác, bị điều sang làm văn thư." }, lose: { ...leave(H), close_doors: ["clean_record"], log: "Lời khai không đủ để cứu bạn. Bạn bị buộc thôi việc." } } }, "Phản bội đội, có thể thoát"),
      C("Im lặng, tin rằng 'có người lo'", { counters: step(c, H, { hqa_dirty: 1 }), happy: -5, flags: ["cus_silent"] }, "Giữ lời với đội, đặt đời mình vào tay người khác"),
      C("Nộp lại toàn bộ tiền đã nhận, tự thú", { counters: step(c, H), money: -0.8, income_mult: 0.6, happy: 4, agency: 0.03, flags: ["cus_confessed"] }, "Mất tiền, mất chức, giữ được tự do", { tier: "sovereign", longterm: true })], 0)
    : T("Lệnh thông quan", "Bạn giữ lại một lô hàng có giấy tờ không khớp, của một công ty có tiếng. Hai giờ sau, cấp trên gọi xuống, yêu cầu ký thông quan ngay. Đêm đó, có người gọi vào máy bàn nhà bạn, không nói gì, chỉ thở.", [
      C("Giữ lô hàng, lập biên bản đầy đủ", { counters: step(c, H, { hqa_clean: 1 }), bw: -5, gamble: { p: 0.5, win: { income_mult: 1.2, flags: ["cus_big_seizure"], log: "Lô hàng là hàng cấm. Vụ bắt giữ lên bản tin thời sự." }, lose: { income_mult: 0.8, flags: ["cus_exiled"], log: "Giấy tờ được 'bổ sung' ngay trong đêm. Bạn bị điều đi vì 'gây khó khăn cho doanh nghiệp'." } } }, "Đúng việc, đánh cược chỗ làm"),
      C("Ký thông quan, ghi lệnh cấp trên vào sổ", { counters: step(c, H), happy: -4, flags: ["cus_signed_under_order"] }, "An toàn hôm nay, để lại một dấu vết"),
      C("Chuyển hồ sơ thẳng cho cơ quan điều tra", { counters: step(c, H, { hqa_clean: 1 }), agency: 0.03, gamble: { p: 0.45, win: { rel: 4, flags: ["cus_big_seizure", "cus_whistle"], log: "Cơ quan điều tra lập chuyên án. Lần này, cấp trên của bạn là người bị mời lên làm việc." }, lose: { health: -4, flags: ["cus_threatened"], log: "Hồ sơ bị trả về. Bạn đổi số điện thoại và đổi đường đi làm." } } }, "Lựa chọn thứ ba: vượt cấp, tự chịu", { tier: "sovereign" })], 0), adult),
  beat(H, 4, 5, (c) => f(c, "cus_silent")
    ? T("Ghế bị cáo", "Đường dây bị khởi tố. 'Người lo' năm nào giờ cũng ngồi ở hàng ghế bị cáo, cách bạn ba người, không nhìn sang. Luật sư nói nếu nhận tội và nộp lại tiền, bạn có thể được hưởng mức án thấp nhất.", [
      C("Nhận tội, nộp lại tiền", { counters: step(c, H), money: -0.6, unflags: [life(H)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], flags: ["cus_convicted"] }, "Ngồi tù ngắn, có ngày ra"),
      C("Chối đến cùng", { counters: step(c, H), money: -0.3, gamble: { p: 0.25, win: { ...leave(H), log: "Bạn được tha vì không đủ chứng cứ, nhưng bị buộc thôi việc." }, lose: { unflags: [life(H)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Tòa tuyên mức án cao hơn những người đã nhận tội." } } }, "Có thể thoát, có thể nặng hơn"),
      C("Khai ra 'người lo' và những người trên nữa", { counters: step(c, H), agency: 0.02, gamble: { p: 0.5, win: { ...leave(H), flags: ["cus_turned"], log: "Bạn được hưởng án treo vì lập công. Từ đó bạn không về thăm thị trấn cửa khẩu nữa." }, lose: { unflags: [life(H)], custom: "job_lose|become:ex_convict", close_doors: ["clean_record"], log: "Lời khai của bạn không được ghi nhận, và bạn có thêm vài kẻ thù trong trại." } } }, "Lựa chọn thứ ba: kéo cả đường dây ra ánh sáng", { tier: "sovereign" })], 0)
    : T(f(c, "cus_envelope") ? "Cơ hội thứ hai" : "Trạm trưởng", f(c, "cus_envelope")
      ? "Sau chuyên án, trạm cửa khẩu gần như không còn người cũ. Cấp trên cần một người hiểu đường dây từ bên trong để dựng lại trạm, và họ chọn bạn, với một dấu hỏi trong hồ sơ."
      : `${n(c, "hqa_clean") >= 3 ? "Tiếng 'người không nhận phong bì' của bạn đã đi trước bạn." : "Sau chừng ấy năm, bạn được đề bạt làm trạm trưởng."} Bạn có quyền đặt lại luật chơi của cả trạm, và cũng có quyền để mọi thứ như cũ.`, [
      C("Công khai thời gian thông quan từng lô hàng", { counters: step(c, H, { hqa_clean: 1 }), agency: 0.03, bw: -6, gamble: { p: 0.5, win: { income_mult: 1.2, rel: 6, flags: ["cus_open_station"], log: "Thời gian chờ ở trạm giảm một nửa. Vài doanh nghiệp quen thôi gửi quà." }, lose: { income_mult: 0.85, log: "Hệ thống bị 'lỗi kỹ thuật' sau ba tháng. Bạn bị điều về văn phòng." } } }, "Lựa chọn thứ ba: để ánh sáng làm việc thay bạn", { tier: "sovereign" }),
      C("Giữ lệ cũ, mỗi người một phần", { counters: step(c, H, { hqa_dirty: 1 }), money: 0.5, flags: ["cus_chief_ring"], secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [2, 10], note: "chia phần ở trạm cửa khẩu" } }, "Giàu, êm, ngồi trên quả bom hẹn giờ"),
      C("Nhận chức, luân chuyển cả đội mỗi sáu tháng", { counters: step(c, H), income_mult: 1.2, rel: -4, flags: ["cus_rotation_rule"] }, "Cắt dây quen biết, bị cả trạm ghét")], 0), adult),
  beat(H, 5, 6, (c) => T("Bàn giao con dấu", `${f(c, "cus_open_station") ? "Trạm của bạn được lấy làm mẫu cho các cửa khẩu khác." : f(c, "cus_chief_ring") ? "Chưa ai hỏi gì về những năm bạn làm trạm trưởng. Chưa." : f(c, "cus_whistle") ? "Đến giờ, vài người cũ vẫn không chào bạn." : "Bạn đã đóng dấu lên hàng trăm nghìn tờ khai."} Cán bộ trẻ nhận con dấu từ tay bạn hỏi nhỏ: 'Ở đây sống thế nào cho yên, ${c.sex === "M" ? "anh" : "chị"}?'`, [
    C("Kể thật hết những gì bạn biết", { counters: step(c, H), flags: ["passed_on"], gamble: { p: 0.6, win: { happy: 5, log: "Người trẻ ghi chép cả buổi chiều. Năm sau, cô ấy trả lại phong bì đầu tiên." }, lose: { rel: -3, log: "Lời bạn đến tai vài người cũ. Họ thôi mời bạn đi đám." } } }, "Truyền lại cái gan, mất vài người quen"),
    C("Khuyên một câu: 'Nhắm mắt cho yên'", { counters: step(c, H, { hqa_dirty: 1 }), happy: -2, rel: 2 }, "Êm cho người trẻ, đời sau lặp lại đời trước"),
    C("Nghỉ sớm, mở lớp dạy khai báo cho doanh nghiệp nhỏ", { counters: step(c, H), ...leave(H), income_mult: 0.7, happy: 3, flags: ["has_apprentice"] }, "Ít tiền, dạy người ta khai đúng từ đầu")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(H, "hqa_grandma", [22, 65], 8, (c) => T("Vali của bà cụ", `Một bà cụ ở sân bay mang theo sáu cân ${vn(c) ? "thuốc nam và giò chả" : "thảo dược và thịt khô nhà làm"}, quá mức được mang. Theo quy định, bạn phải tịch thu và lập biên bản phạt. Bà nói mang cho đứa cháu đang ốm.`, [
    C("Tịch thu, lập biên bản đúng luật", { counters: { hqa_clean: 1 }, happy: -2 }, "Đúng luật, nhìn bà khóc"),
    C("Cho qua, coi như không thấy", { happy: 2, counters: { hqa_soft: 1 }, gamble: { p: 0.8, win: { log: "Bà nắm tay bạn rất lâu rồi mới đi." }, lose: { income_mult: 0.95, log: "Đợt rà camera, bạn bị nhắc nhở bằng văn bản." } } }, "Tử tế, camera vẫn ghi"),
    C("Giúp bà khai đúng, giữ phần được phép mang", { bw: -2, rel: 2, counters: { hqa_clean: 1 } }, "Mất mười lăm phút, đúng luật và có tình", { tier: "awakened" })], 2)),
  daily(H, "hqa_animals", [22, 65], 9, () => T("Thùng hàng có tiếng động", "Hai giờ sáng, một thùng hàng trong kho phát ra tiếng cào. Bên trong là mấy chục con vật quý hiếm, nhiều con đã yếu lả. Chủ hàng gọi điện đề nghị 'xử lý nhẹ'.", [
    C("Gọi trung tâm cứu hộ, chuyển hồ sơ điều tra", { bw: -4, happy: 3, counters: { hqa_clean: 1 }, flags: ["cus_wildlife_case"] }, "Thức trắng, cứu được vài con"),
    C("Lập biên bản nhanh, để ca sau lo", { health: 1, happy: -3, counters: { hqa_soft: 1 } }, "Đúng thủ tục tối thiểu, vài con không qua khỏi"),
    C("Nhận 'xử lý nhẹ' theo lời chủ hàng", { money: 0.15, counters: { hqa_dirty: 1 }, secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [2, 10], note: "cho qua thùng động vật hoang dã" } }, "Tiền nhanh, một bí mật biết kêu")], 0)),
  daily(H, "hqa_dinner", [22, 65], 8, (c) => T("Bữa nhậu của doanh nghiệp", vary("hqad", c.age, ["Chủ một công ty xuất nhập khẩu mời cả đội đi ăn tối 'cảm ơn anh em vất vả'. Bàn đặt ở nhà hàng đắt nhất thị trấn cửa khẩu, và ai cũng biết hóa đơn sẽ không ai phải trả.", "Cuối quý, một hiệp hội doanh nghiệp tổ chức 'giao lưu' với trạm: rượu ngoại, quà mang về, và một danh sách lô hàng sắp đến."]), [
    C("Đi cùng cả đội", { rel: 3, health: -2, counters: { drink: 2, hqa_dirty: 1 } }, "Thân với đội, nợ một bữa"),
    C("Viện cớ ở nhà", { rel: -2, counters: { hqa_clean: 1 } }, "Sạch, bị coi là 'không chơi được'"),
    C("Đi, nhưng tự trả phần mình", { money: -0.02, rel: 1, flags: ["cus_paid_own_bill"] }, "Tốn tiền, giữ được cả hai", { tier: "awakened" })], 1)),
  daily(H, "hqa_fakes", [22, 65], 8, () => T("Hàng giả nhãn hiệu", "Bạn giữ một lô túi xách giả nhãn hiệu nổi tiếng. Chủ hàng là một phụ nữ bán hàng online, khóc rằng đó là toàn bộ vốn liếng và tiền vay. Luật sư của hãng đòi tiêu hủy ngay, có phóng viên đi cùng.", [
    C("Tiêu hủy theo luật, trước ống kính", { counters: { hqa_clean: 1 }, rel: -1, happy: -2 }, "Đúng luật, một người mất trắng"),
    C("Đề xuất mức phạt nhẹ nhất cho vi phạm lần đầu", { bw: -3, gamble: { p: 0.5, win: { happy: 2, counters: { hqa_soft: 1 }, log: "Cấp trên duyệt. Người phụ nữ nhắn tin cảm ơn bạn." }, lose: { income_mult: 0.95, log: "Hãng khiếu nại bạn 'bao che hàng giả'." } } }, "Có tình, có thể bị khiếu nại"),
    C("Hỏi ra nhà bán buôn đứng sau cô ấy", { bw: -4, counters: { hqa_clean: 1 }, flags: ["cus_traced_supplier"] }, "Tốn công, bắt được con cá lớn hơn", { tier: "awakened" })], 0)),
  daily(H, "hqa_night", [22, 60], 7, (c) => T("Ca đêm ở trạm", vary("hqan", c.age, ["Ba giờ sáng, nhiệt độ xuống bốn độ. Một tài xế xe tải mời bạn cốc cà phê nóng và điếu thuốc, rồi kể chuyện đứa con sắp thi đại học.", "Đêm mưa, hàng xe dừng chờ đến sáng. Các tài xế đốt lửa bên đường, gọi bạn ra ngồi cùng."]), [
    C("Ngồi cùng, nghe chuyện", { rel: 3, health: -1, counters: { smoke: 1, hqa_road_friends: 1 } }, "Có thêm bạn đường, khó giữ khoảng cách"),
    C("Cảm ơn, quay vào trạm", { happy: -1, flags: ["cus_keeps_distance"] }, "Giữ khoảng cách, đêm dài hơn")], 0)),
  daily(H, "hqa_numbers", [24, 65], 9, () => T("Con số đẹp", "Báo cáo quý cho thấy thời gian thông quan ở trạm bạn dài nhất vùng. Trạm trưởng muốn bạn 'điều chỉnh' cách tính trước khi gửi lên, chỉ một cột thôi.", [
    C("Sửa số theo ý trạm trưởng", { income_mult: 1.03, rel: 2, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 8], note: "sửa số liệu thông quan" } }, "Được lòng sếp, có một bí mật"),
    C("Gửi số thật, kèm giải thích nguyên nhân", { counters: { hqa_clean: 1 }, rel: -2 }, "Trung thực, trạm trưởng ghi thù"),
    C("Đề xuất đo bằng hệ thống tự động", { agency: 0.02, bw: -3, flags: ["cus_auto_metrics"] }, "Lựa chọn thứ ba: để máy đếm, không ai sửa được", { tier: "sovereign" })], 1)),
  daily(H, "hqa_rival", [24, 65], 9, (c, N) => { const r = role(c, "rival")!; return T("Tin đồn trong trạm", `${N(r)} đang cạnh tranh với bạn cho ghế phó trạm. Tuần này, cả trạm xì xào rằng bạn 'ăn' của một công ty giao nhận, và tin đồn bắt đầu từ bàn của ${N(r)}.`, [
    C("Đối chất công khai trong cuộc họp", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "bị đối chất giữa cuộc họp trạm" }, gamble: { p: 0.5, win: { rel: 3, log: "Không ai đưa ra được bằng chứng. Tin đồn tắt." }, lose: { rel: -3, log: "Cuộc họp thành trận cãi. Cả hai bị nhắc nhở." } } }, "Rõ trắng đen, có thể thành trò cười"),
    C("Mời thanh tra kiểm tra tài khoản của mình", { bw: -3, counters: { hqa_clean: 1 }, flags: ["cus_self_audit"] }, "Mất mặt vài tuần, sạch tên lâu dài", { tier: "awakened" }),
    C("Im lặng làm việc", { happy: -3, income_mult: 0.97 }, "Không gây chuyện, mất ghế phó trạm")], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(H, "hqa_sibling", [22, 65], 10, (c, N) => { const s = role(c, "sibling")!; return T("Lô hàng của người nhà", `${N(s)} mở cửa hàng đồ gia dụng nhập khẩu và nhờ bạn 'để ý' lô hàng đầu tiên: chỉ cần cho qua nhanh, đừng soi kỹ, 'người nhà cả mà'.`, [
    C("Từ chối, việc nào ra việc nấy", { counters: { hqa_clean: 1 }, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.3, note: "không giúp lô hàng đầu tiên" } }, "Giữ tay sạch, anh em sứt mẻ"),
    C("Cho qua nhanh lần này", { trust: { npc: s, delta: 0.2 }, counters: { hqa_dirty: 1, honest: -1 }, flags: ["cus_family_favor"] }, "Vui nhà, lần sau khó từ chối"),
    C("Ngồi hướng dẫn khai đúng từ đầu", { trust: { npc: s, delta: 0.1 }, bw: -3 }, "Mất một buổi tối, không ai nợ ai", { tier: "awakened" })], 2, { npc: s }); }, (c) => !!role(c, "sibling")),
  daily(H, "hqa_dog", [24, 65], 99, () => T("Chó nghiệp vụ về hưu", "Con chó nghiệp vụ làm cùng ca với bạn tám năm sắp về hưu. Mõm nó đã bạc, chân sau hơi lết. Trung tâm sẽ đưa nó đến trại nuôi chung, trừ khi có người nhận về.", [
    C("Nhận nó về nhà", { money: -0.02, happy: 5, flags: ["adopted_k9"] }, "Tốn tiền, nhà thêm một người già"),
    C("Để trung tâm lo", { happy: -2 }, "Đỡ việc, ca trực sau thấy trống")], 0)),
  daily(H, "hqa_parked_car", [22, 65], 9, () => T("Chiếc xe đỗ trước nhà", "Một chiếc xe không biển số đỗ trước nhà bạn ba đêm liền, đèn tắt, máy vẫn nổ. Sáng thứ tư, nó biến mất, để lại một bó cúc trắng trên bậc cửa.", [
    C("Báo công an, xin lắp camera", { bw: -3, happy: -2, flags: ["cus_guarded"] }, "An toàn hơn, nhà thành trạm gác"),
    C("Đưa gia đình sang nhà họ hàng một thời gian", { money: -0.06, rel: -2, flags: ["cus_family_away"] }, "Yên tâm, nhà vắng"),
    C("Đứng trước cửa đêm thứ tư, chờ", { gamble: { p: 0.6, win: { counters: { hqa_clean: 1 }, log: "Chiếc xe không quay lại. Bạn hiểu người ta chỉ muốn bạn nhìn thấy nó." }, lose: { health: -5, log: "Chiếc xe rọi đèn pha thẳng vào mặt bạn rồi lao đi. Đêm đó bạn không ngủ." } } }, "Không lùi, đánh cược thần kinh")], 0)),
  daily(H, "hqa_exit", [30, 60], 99, () => T("Lời mời từ công ty giao nhận", "Công ty giao nhận lớn nhất cảng mời bạn về làm giám đốc thủ tục, lương gấp ba. Ai cũng hiểu họ trả cho những gì bạn biết về cách trạm làm việc.", [
    C("Rời ngành, nhận lời", { ...leave(H), money: 0.3, flags: ["ex_customs"] }, "Giàu lên, đồng nghiệp cũ nhìn bạn khác"),
    C("Ở lại ngành", { counters: { hqa_clean: 1 }, happy: -1 }, "Lương thấp, vẫn cầm con dấu")], 1), (c) => c.happy < 55 || c.age >= 38),

  /* ---------- gia đình ---------- */
  cross(H, "hqa_family", [24, 65], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother"); const env = f(c, "cus_envelope") || f(c, "cus_chief_ring");
    if (c.kids_teen > 0 && k) return T(`Câu hỏi của ${N(k)}`, env
      ? `Ở bữa cơm, ${N(k)} hỏi lương cán bộ hải quan bao nhiêu, mà nhà mình vừa đổi xe mới, lại sắp mua thêm căn hộ.`
      : `Ở bữa cơm, ${N(k)} hỏi sao nhà mình vẫn đi chiếc xe mười năm tuổi, trong khi nhà một bạn cùng lớp, bố cũng làm hải quan, thì ở biệt thự.`, [
      C("Nói thật với con", { trust: { npc: k, delta: env ? 0.1 : 0.25 }, happy: env ? -4 : 2, flags: ["told_kid_truth"] }, env ? "Thật, con nhìn bạn khác đi" : "Con hiểu cái giá của sự sạch sẽ"),
      C("Gạt đi: 'Con hỏi làm gì'", { trust: { npc: k, delta: -0.15 } }, "Yên bữa cơm, con tự tìm câu trả lời"),
      env
        ? C("Hứa với con sẽ rút khỏi đường dây", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "rút khỏi đường dây trong một năm", years: 1 } }, "Một lời hứa khó giữ", { tier: "awakened" })
        : C("Rủ con đến trạm xem một ca trực", { trust: { npc: k, delta: 0.15 }, bw: -1 }, "Mất một ngày phép, con tự thấy", { tier: "awakened" })], 0, { npc: k });
    return T("Cuộc gọi lúc mười giờ đêm", `${N(p!)} xem thời sự thấy một đường dây hải quan bị bắt, gọi cho bạn lúc mười giờ đêm, giọng run run: 'Con có dính gì không?'`, [
      C("Trấn an: 'Con không dính gì'", { trust: { npc: p!, delta: 0.1 }, happy: env ? -3 : 1, flags: [env ? "lied_to_parent" : "reassured_parent"] }, env ? "Bố mẹ yên lòng, bạn thì không" : "Thật lòng, bố mẹ ngủ được"),
      env
        ? C("Kể thật với bố mẹ", { trust: { npc: p!, delta: -0.1 }, happy: 3, flags: ["told_parent_truth"] }, "Bố mẹ mất ngủ, bạn bớt cô độc", { tier: "awakened" })
        : C("Mời bố mẹ lên trạm xem bạn làm việc", { trust: { npc: p!, delta: 0.2 }, bw: -2 }, "Mất một ngày phép, bố mẹ tự thấy", { tier: "awakened" })], 0, { npc: p! }); }),
];
