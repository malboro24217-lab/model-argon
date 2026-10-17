/**
 * Gói PHỤNG SỰ A: người tu hành · linh mục, nữ tu · bác sĩ thiện nguyện · nhà hoạt động xã hội.
 * Đọc kèm docs/content-guide.md và gói mẫu singer.ts.
 *
 * Bộ đếm riêng (các nhịp sau đọc lại để đổi văn bản và kết cục):
 *   monk:       mnk_vow (giữ giới nghiêm hay lỏng), mnk_bond (gắn với người đời quanh nơi tu)
 *   priest:     pst_flock (gần cộng đoàn), pst_voice (dám lên tiếng), pst_doubt (ngờ vực)
 *   aid_doctor: btn_field (bám thực địa), btn_burn (kiệt sức)
 *   activist:   hdx_base (sức dân phía sau), hdx_heat (sức ép đè lên)
 * Tôn giáo được viết trung tính: không tranh luận giáo lý, chỉ có lời nguyện, gia đình, cộng đồng, tiền bạc, ngờ vực.
 */
import type { Storylet, FactContext } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const cnt = (c: FactContext, k: string): number => c.counters[k] ?? 0;

/* ======================================================================
 * NGƯỜI TU HÀNH (monk) — tiền tố mnk_
 * Hợp với nhiều truyền thống tu viện; ở Việt Nam gọi là "chùa".
 * ==================================================================== */
const MO = "monk";
const tv = (c: FactContext): string => (c.country === "VN" ? "chùa" : "tu viện");
const TV = (c: FactContext): string => (c.country === "VN" ? "Chùa" : "Tu viện");
const head = (c: FactContext): string => (c.country === "VN" ? "thầy trụ trì" : "vị thầy đứng đầu tu viện");
const HEAD = (c: FactContext): string => (c.country === "VN" ? "Thầy trụ trì" : "Vị thầy đứng đầu tu viện");
const novice = (c: FactContext): string => (c.country === "VN" ? "chú tiểu" : "cậu bé tập tu");

const MONK: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(MO, "mnk_t_still", [9, 15], () => true, (c) => T("Đứa trẻ hay ngồi yên", `Giờ ra chơi cả lớp chạy nhảy, bạn ngồi một mình dưới gốc cây nhìn đàn kiến tha mồi đến hết giờ. Một người tu hành đến trường nói chuyện về lòng tử tế; bạn là đứa hỏi nhiều câu nhất. Cuối buổi, người ấy nói ${tv(c)} có lớp học hè cho trẻ con.`, [
    C(`Xin bố mẹ cho đi lớp học hè ở ${tv(c)}`, { money: -0.02, flags: [talentFlag(MO)], counters: { talents_seen: 1 }, bw: 2 }, "Mất mùa hè rong chơi, mở một con đường"),
    C("Ở nhà chơi với bạn bè", { counters: { talents_seen: 1 }, rel: 2 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(MO, "mnk_d_retreat", [20, 50], () => true, (c) => T("Mười ngày trên núi", `Sau một năm mất ngủ vì việc, bạn đi khóa tu mười ngày ở một ${tv(c)} trên núi: không điện thoại, dậy lúc bốn giờ, ăn hai bữa. Ngày cuối, ${head(c)} nói nơi này đang nhận người ở lại tập tu, không lương, ngủ trên chiếu.`, [
    C("Nghỉ việc, ở lại tập tu", { ...become(MO), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02, flags: ["mnk_left_city"] }, "Mất thu nhập, đổi lấy một đời khác"),
    C("Xin nghỉ không lương ba tháng để thử", { counters: { doors_seen: 1 }, money: -0.05, gamble: { p: 0.35, win: { ...become(MO), log: "Ba tháng thành ba năm. Bạn gửi đơn nghỉ việc qua bưu điện." }, lose: { bw: 4, happy: 2, log: "Bạn về lại thành phố, ngủ ngon được nửa năm." } } }, "Thử trước, giữ đường lui", { tier: "awakened" }),
    C("Về thành phố, giữ thói quen ngồi yên", { counters: { doors_seen: 1 }, bw: 2 })], 2)),
  door(MO, "mnk_d_novice", [12, 17], (c) => c.poor_country || c.family_wealth < 0.35, (c) => T("Nơi nuôi chữ", `Mùa này nhà không đủ gạo, các em còn nhỏ. ${TV(c)} ở thị trấn nhận nuôi và cho đi học những đứa trẻ chịu ở lại tập tu. Mẹ hỏi bạn có muốn đi không, giọng như sợ bạn gật đầu.`, [
    C("Đi, để nhà bớt một miệng ăn", { ...become(MO), counters: { doors_seen: 1 }, money: 0.04, happy: -3, flags: ["mnk_young_novice"] }, "Nhà nhẹ gánh, xa mẹ từ nhỏ"),
    C("Ở nhà, nghỉ học đi phụ việc", { counters: { doors_seen: 1 }, money: 0.03, know: -3 }, "Có tiền ngay, dở dang chữ nghĩa"),
    C("Xin học ở đó ban ngày, tối về nhà", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { know: 4, flags: ["mnk_day_pupil"], log: "Thầy đồng ý. Bạn đi học bằng chân đất, tối về ăn cơm với mẹ." }, lose: { happy: -2, log: "Lớp học chỉ dành cho người ở lại tu." } } }, "Đòi điều kiện khác, có thể mất cả hai", { tier: "sovereign" })], 1)),
  door(MO, "mnk_d_late", [45, 60], (c) => c.widowed || c.kids_alive > 0, (c) => T("Nửa đời còn lại", `Con cái đã lớn, căn nhà vắng hẳn. Bạn lên ${tv(c)} mỗi tuần một lần, rồi ba lần. ${HEAD(c)} hỏi bạn đã sẵn sàng buông căn nhà, sổ tiết kiệm và cái tên cũ chưa.`, [
    C("Chia hết tài sản cho con, xin vào tu", { ...become(MO), counters: { doors_seen: 1 }, money: -0.8, rel: 3, flags: ["mnk_gave_all"] }, "Nhẹ người, không còn đường lui"),
    C("Vào tu, giữ lại một khoản phòng thân", { ...become(MO), counters: { doors_seen: 1 }, money: -0.3, flags: ["mnk_kept_savings"] }, "Yên tâm hơn, lòng chưa buông hẳn"),
    C(`Chỉ lên ${tv(c)} vào cuối tuần`, { counters: { doors_seen: 1 }, happy: 2 })], 2)),

  /* ---------- mạch truyện ---------- */
  beat(MO, 1, 1, (c) => T("Bốn giờ sáng", "Chuông đánh lúc bốn giờ. Bạn quét sân, nấu cơm cho ba mươi người, học thuộc giới luật đến khuya. Một người tu lâu năm hơn hay đẩy phần việc của mình sang bạn, rồi ngồi đọc sách dưới hiên.", [
    C("Làm thêm, không nói gì", { counters: step(c, MO, { mnk_vow: 1 }), health: -2, flags: ["mnk_endured"] }, "Rèn được sức nhẫn, có thể bị lợi dụng mãi"),
    C(`Thưa chuyện với ${head(c)}`, { counters: step(c, MO), gamble: { p: 0.6, win: { happy: 3, log: "Việc được chia lại. Người kia không nhìn bạn suốt một tháng." }, lose: { happy: -3, log: "Thầy bảo bạn về xem lại lòng mình trước." } } }, "Công bằng hơn, mang tiếng hay kêu"),
    C("Rủ người ấy làm cùng, đổi lại dạy mình đọc sách", { counters: step(c, MO, { mnk_bond: 1 }), bw: -2, gamble: { p: 0.5, win: { know: 4, log: "Hóa ra người ấy giảng rất hay. Sáng nào hai người cũng quét sân chung." }, lose: { log: "Người ấy cười, bảo bạn còn non lắm." } } }, "Biến người khó thành thầy, có thể bị coi thường", { tier: "sovereign" })], 0), (c) => c.age >= 12),

  beat(MO, 2, 3, (c) => T("Người cúng dường lớn", `Một bài giảng ngắn của bạn bị ai đó quay lại, vài trăm nghìn người xem. Một doanh nhân xin góp số tiền bằng mười năm chi tiêu của ${tv(c)} để xây giảng đường mới, với điều kiện khắc tên ông ở cổng và bạn đứng làm lễ khánh thành.`, [
    C("Nhận, xây giảng đường", { counters: step(c, MO, { mnk_bond: -1 }), flags: ["mnk_big_donor"], happy: 2, rel: 2 }, "Nơi tu đổi đời, mắc nợ một người giàu"),
    C("Từ chối, giữ nơi tu nhỏ như cũ", { counters: step(c, MO, { mnk_vow: 1 }), flags: ["mnk_stayed_small"], happy: -1 }, "Giữ được mình, mái dột vẫn dột", { longterm: true }),
    C("Nhận, nhưng lập quỹ chung và dán sổ ở cổng", { counters: step(c, MO, { mnk_bond: 1 }), flags: ["mnk_open_books"], agency: 0.02, gamble: { p: 0.5, win: { log: "Ông đồng ý bỏ tên khỏi cổng. Sổ quỹ được dán lên mỗi tháng." }, lose: { log: "Ông rút lời. Hai trăm người khác góp mỗi người một ít, đủ lợp lại mái." } } }, "Chậm hơn, không nợ riêng ai", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(MO, 3, 4, (c) => f(c, "mnk_big_donor")
    ? T("Cái tên trên cổng", `Người cúng dường năm xưa bị bắt vì lừa tiền hàng nghìn người mua nhà. Tên ông vẫn khắc trên cổng ${tv(c)}. Sáng nay, ba chục người mất tiền đứng trước cổng hỏi giảng đường được xây bằng tiền của ai.`, [
      C("Mời họ vào, lấy quỹ trả dần cho người khó nhất", { counters: step(c, MO, { mnk_bond: 2 }), flags: ["mnk_repaid_victims"], health: -2, bw: -4 }, "Cạn quỹ nhiều năm, giữ được lòng người"),
      C("Đóng cổng, nói nơi tu không liên quan", { counters: step(c, MO, { mnk_bond: -2 }), flags: ["mnk_closed_gate"] }, "Yên chuyện bây giờ, mang tiếng lâu dài"),
      C("Hoàn tục, không còn mặt mũi nào ở lại", { counters: step(c, MO), ...leave(MO), flags: ["ex_monk"], happy: -4 }, "Thoát khỏi chuyện này, mất cả con đường")], 0)
    : T("Mười năm và một câu hỏi", `Một đêm mưa bạn ngồi đến sáng mà lòng không yên. Bạn bè cùng lứa đã có nhà, có con; bạn có hai bộ áo, một cái bát và một câu hỏi không ai trả lời thay được.${cnt(c, "mnk_vow") >= 2 ? " Càng giữ giới nghiêm, câu hỏi càng to." : ""}`, [
      C("Hoàn tục, làm lại từ đầu", { counters: step(c, MO), ...leave(MO), flags: ["ex_monk"], happy: 3, money: -0.05 }, "Tự do, bắt đầu từ con số không"),
      C("Xin lên núi ẩn tu một năm", { counters: step(c, MO, { mnk_vow: 2 }), flags: ["mnk_hermit"], health: -3, rel: -4 }, "Đi tìm câu trả lời, xa mọi người"),
      C("Ở lại, xuống giúp người nghèo quanh vùng", { counters: step(c, MO, { mnk_bond: 2 }), flags: ["mnk_serve_lay"], bw: -4 }, "Bận rộn thay cho câu trả lời")], 2), (c) => c.age >= 18),

  beat(MO, 4, 5, (c) => (f(c, "mnk_closed_gate") || cnt(c, "mnk_bond") <= -1)
    ? T("Cáp treo lên núi", `Mấy năm nay người đến ${tv(c)} thưa hẳn${f(c, "mnk_closed_gate") ? ", từ hôm cánh cổng đóng lại trước những người mất tiền" : ""}. Một công ty du lịch đề nghị làm cáp treo, bán vé vào cửa, trả nơi tu một phần mười tiền vé. Không nhận thì mái nhà khó qua mùa mưa tới.`, [
      C("Ký với công ty du lịch", { counters: step(c, MO, { mnk_vow: -2 }), flags: ["mnk_tourism"], money: 0.1, happy: -2 }, "Nơi tu sống khỏe, mất sự tĩnh lặng"),
      C("Từ chối, sống nhờ ruộng vườn", { counters: step(c, MO, { mnk_vow: 1 }), flags: ["mnk_self_reliant"], health: -3 }, "Thanh đạm, có thể không qua nổi mùa mưa", { longterm: true }),
      C("Mở cổng miễn phí, ai đến thì góp công", { counters: step(c, MO, { mnk_bond: 2 }), flags: ["mnk_open_gate"], agency: 0.03, bw: -5 }, "Không bán vé, cũng không đóng cổng", { tier: "sovereign" })], 1)
    : T("Ghế người đứng đầu", `${HEAD(c)} yếu dần và chọn bạn kế nhiệm.${cnt(c, "mnk_bond") >= 2 ? " Dân quanh vùng gọi bạn bằng tên, không cần chức danh." : ""}${f(c, "mnk_hermit") ? " Năm ẩn tu trên núi khiến bạn nói ít đi một nửa." : ""} Nhận ghế là nhận cả sổ sách, khách khứa và những buổi làm việc với chính quyền.`, [
      C("Nhận kế nhiệm", { counters: step(c, MO, { mnk_bond: 1 }), flags: ["mnk_abbot"], bw: -6, rel: 3 }, "Có tiếng nói, mất giờ tu"),
      C("Nhường ghế, xin đi dạy ở vùng xa", { counters: step(c, MO, { mnk_vow: 1 }), flags: ["mnk_wanderer"], health: -3, happy: 3 }, "Thanh thản, bỏ lại nơi đã gắn bó"),
      C("Đề nghị bầu người đứng đầu theo nhiệm kỳ", { counters: step(c, MO), agency: 0.03, gamble: { p: 0.5, win: { flags: ["mnk_term_rule"], log: "Các thầy đồng ý. Lần đầu tiên nơi tu có lệ bầu lại ba năm một lần." }, lose: { counters: { mnk_bond: -1 }, log: "Mấy thầy lớn tuổi cho là bạn muốn phá lệ. Ghế bỏ trống một năm." } } }, "Làm luật mới, có thể bị coi là phá lệ", { tier: "sovereign" })], 0), (c) => c.age >= 18),

  beat(MO, 5, 6, (c) => T("Người đến sau", `Một thanh niên từ thành phố lên xin tu, giống hệt bạn ngày xưa: mất ngủ, mệt mỏi, muốn trốn.${f(c, "mnk_tourism") ? " Cáp treo chở hai nghìn người lên núi mỗi ngày; cậu là người duy nhất xin ở lại qua đêm." : f(c, "mnk_abbot") ? " Là người đứng đầu, bạn quyết ai được ở lại." : f(c, "mnk_open_gate") ? " Sân nơi tu giờ lúc nào cũng có người lạ đến góp công." : ""} Cậu hỏi bạn con đường này có đáng không.`, [
    C("Nhận cậu, dạy những gì mình biết", { counters: step(c, MO, { mnk_bond: 1 }), flags: ["mnk_disciple"], happy: 4, bw: -2 }, "Có người nối tiếp, thêm một gánh"),
    C("Bảo cậu về sống đời thường thêm năm năm", { counters: step(c, MO), flags: ["mnk_sent_back"], gamble: { p: 0.5, win: { happy: 3, log: "Năm năm sau cậu quay lại thăm, dắt theo vợ con." }, lose: { happy: -2, log: "Cậu không quay lại. Bạn không biết mình đúng hay sai." } } }, "Thật lòng, có thể mất một người", { tier: "awakened" }),
    C("Đưa cậu cuốn sổ ghi chép ba mươi năm, để cậu tự quyết", { counters: step(c, MO), know: 3, flags: ["mnk_notebook"], agency: 0.02 }, "Trao lại tất cả, không giữ ai bên mình")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(MO, "mnk_kitchen", [16, 85], 6, (c) => T("Nồi cơm chung", vary("mnkk", c.age, [
    `${TV(c)} nấu cơm cho người nghèo mỗi trưa. Tháng này gạo hết sớm, hàng người xếp dài thêm vì nhà máy gần đó vừa cho nghỉ hai trăm công nhân.`,
    "Mùa giáp hạt, mỗi trưa có hơn trăm người đến xin cơm. Kho chỉ còn đủ gạo cho mười hai ngày."]), [
    C("Cắt bớt phần ăn của người trong nơi tu", { health: -3, counters: { mnk_bond: 1 } }, "Người ngoài đủ no, người trong gầy đi"),
    C("Đi gõ cửa các nhà buôn gạo trong vùng", { bw: -3, gamble: { p: 0.6, win: { counters: { mnk_bond: 1 }, log: "Ba nhà buôn gửi gạo đến, một nhà xin giấu tên." }, lose: { happy: -2, log: "Người ta tiếp bạn lịch sự rồi tiễn ra cửa." } } }, "Có thể đủ gạo, có thể mất mặt"),
    C("Phát đến khi hết thì đóng cửa", { happy: -2, counters: { mnk_vow: 1 } }, "Giữ kho cho người trong, nhìn người ngoài về không")], 0)),

  daily(MO, "mnk_phone", [16, 70], 8, (c) => T("Chiếc điện thoại dưới gối", `${TV(c)} không cho người tu giữ điện thoại riêng. Người nhà lén gửi cho bạn một chiếc, dặn để gọi khi mẹ yếu. Đêm nào nó cũng sáng lên vài lần dưới gối.`, [
    C("Giữ lại, chỉ dùng khi cần", { flags: ["mnk_hidden_phone"], counters: { mnk_vow: -1 }, happy: 2 }, "Yên tâm về nhà, sống hai mặt"),
    C("Nộp cho thầy, gọi nhờ máy chung", { counters: { mnk_vow: 1 }, bw: -1 }, "Giữ giới, có ngày lỡ một cuộc gọi"),
    C("Đề nghị mỗi tối có một giờ gọi về nhà cho mọi người", { agency: 0.02, gamble: { p: 0.5, win: { counters: { mnk_bond: 1 }, flags: ["mnk_phone_rule"], log: "Thầy đồng ý. Sau giờ kinh tối, ai cũng có một giờ gọi về nhà." }, lose: { counters: { mnk_vow: -1 }, log: "Thầy bảo bạn còn nặng lòng với đời." } } }, "Đổi luật cho mọi người, bị coi là chưa buông", { tier: "sovereign" })], 1)),

  daily(MO, "mnk_two_rites", [20, 85], 7, (c) => T("Hai đám tang cùng giờ", `Một gia đình giàu xin bạn đến ${c.country === "VN" ? "tụng kinh cầu siêu" : "cầu nguyện"} cho người mất, hứa góp cho ${tv(c)} một khoản lớn. Cùng giờ đó, bạn đã nhận lời một nhà nghèo cuối xóm, nhà không có nổi mâm cỗ.`, [
    C("Đến nhà giàu, nhờ người khác sang nhà nghèo", { money: 0.03, counters: { mnk_bond: -1 }, flags: ["mnk_favored_rich"] }, "Nơi tu có tiền, nhà nghèo nhớ mãi"),
    C("Giữ lời với nhà nghèo", { counters: { mnk_bond: 1, mnk_vow: 1 }, happy: 1 }, "Giữ chữ tín, mất khoản góp"),
    C("Mời nhà giàu cùng sang tiễn đám nhà nghèo", { agency: 0.02, gamble: { p: 0.45, win: { counters: { mnk_bond: 2 }, log: "Nhà giàu sang thắp hương, góp tiền lo đám cho cả hai nhà." }, lose: { counters: { mnk_bond: -1 }, log: "Nhà giàu phật ý, gọi người khác đến làm lễ." } } }, "Có thể nối hai nhà, có thể mất cả hai", { tier: "sovereign" })], 1)),

  daily(MO, "mnk_elder", [20, 85], 9, (c) => T("Thầy già trở bệnh", `Vị thầy già nhất ${tv(c)} ho ra máu. Bệnh viện tỉnh cách ba giờ đường, viện phí bằng nửa năm tiền góp của cả nơi tu. Thầy nói muốn ra đi ở đây, giữa tiếng chuông.`, [
    C("Đưa thầy đi viện, đi xin thêm tiền góp", { money: -0.05, health: -1, gamble: { p: 0.6, win: { counters: { mnk_bond: 1 }, log: "Thầy sống thêm ba năm, dạy bạn thêm ba năm." }, lose: { happy: -3, log: "Thầy mất ở viện, xa nơi mình muốn." } } }, "Có thể kéo dài sự sống, trái ý thầy"),
    C("Nghe lời thầy, ngày đêm chăm ở đây", { counters: { mnk_vow: 1 }, bw: -5, happy: -2, flags: ["mnk_sat_with_dying"] }, "Đúng ý thầy, mang theo câu hỏi giá như")], 1)),

  daily(MO, "mnk_debtor", [20, 85], 8, (c) => T("Người trốn nợ", `Một người đàn ông bỏ nhà đi vì nợ, xin ở lại ${tv(c)} vài tháng. Hai hôm sau, có mấy người lạ đến cổng hỏi tên ông.`, [
    C("Cho ông ở, không nói gì với ai", { counters: { mnk_bond: 1 }, gamble: { p: 0.5, win: { log: "Mấy người lạ chán, bỏ đi. Ông ở lại nửa năm rồi về nhà." }, lose: { bw: -6, happy: -3, log: "Họ quay lại lúc nửa đêm, đập cổng. Cả nơi tu mất ngủ một tuần." } } }, "Che chở người khốn, kéo cả nơi tu vào"),
    C("Khuyên ông về nhà đối mặt", { flags: ["mnk_sent_debtor_home"], rel: -1 }, "Nơi tu yên, ông ấy có thể không qua nổi"),
    C("Ngồi lại với cả ông và chủ nợ, xin giãn nợ", { agency: 0.02, bw: -4, gamble: { p: 0.5, win: { counters: { mnk_bond: 2 }, log: "Chủ nợ đồng ý cho trả dần mười năm, không tính lãi chồng lãi." }, lose: { log: "Chủ nợ nghe hết rồi bảo: thầy lo việc của thầy." } } }, "Làm người hòa giải, có thể bị bẽ mặt", { tier: "sovereign" })], 1)),

  daily(MO, "mnk_retreat", [18, 85], 7, (c) => T("Mùa tĩnh tu", vary("mnkr", c.age, [
    "Ba tháng tĩnh tu vừa bắt đầu: không ra khỏi cổng, không tiếp khách. Tuần thứ hai, lũ tràn qua làng dưới chân núi; người ta cần tay khiêng bao cát.",
    "Đang giữa mùa tĩnh tu thì cháy rừng ở sườn núi bên kia. Trưởng làng đứng ở cổng, hỏi nơi tu có ai xuống giúp được không."]), [
    C("Giữ trọn mùa tĩnh tu", { counters: { mnk_vow: 2 }, bw: 4, rel: -2 }, "Giữ trọn lời nguyện, làng nhớ ai vắng mặt"),
    C("Phá lệ, xuống giúp làng", { counters: { mnk_bond: 2, mnk_vow: -1 }, health: -3 }, "Làng biết ơn, lời nguyện dở dang"),
    C("Người trẻ xuống giúp, người già ở lại tu", { agency: 0.01, counters: { mnk_bond: 1 }, bw: -2 }, "Vẹn mỗi bên một nửa", { tier: "awakened" })], 0)),

  daily(MO, "mnk_channel", [18, 70], 8, (c) => T("Kênh giảng trên mạng", `Một người tu trẻ muốn quay các buổi giảng của bạn đăng lên mạng. Một công ty quảng cáo đã nhắn hỏi đặt tiền, mỗi tháng trả bằng nửa năm tiền điện của ${tv(c)}.`, [
    C("Đồng ý, nhận quảng cáo", { money: 0.05, flags: ["mnk_online"], counters: { mnk_vow: -1 }, bw: -2 }, "Có tiền điện, lời giảng xen lời bán hàng"),
    C("Không quay gì cả", { counters: { mnk_vow: 1 }, happy: -1 }, "Yên tĩnh, ít người được nghe"),
    C("Quay, đăng miễn phí, không nhận quảng cáo", { flags: ["mnk_online"], counters: { mnk_bond: 1 }, agency: 0.01 }, "Nhiều người nghe, không ai trả tiền")], 1)),

  daily(MO, "mnk_boundary", [20, 85], 9, (c, N) => { const n = role(c, "neighbor")!; return T("Ba mét đất vườn", `${N(n)} cày lấn sang vườn ${tv(c)} ba mét, trồng một hàng ngô. Người tu khác giục bạn ra đo lại ranh đất trước khi thành chuyện đã rồi.`, [
    C("Để yên, coi như cho", { counters: { mnk_vow: 1 }, trust: { npc: n, delta: 0.1 } }, "Giữ hòa khí, người khác có thể lấn tiếp"),
    C("Mời trưởng xóm đến đo lại ranh đất", { trust: { npc: n, delta: -0.15 }, flags: ["mnk_boundary_set"] }, "Giữ đất, mất lòng hàng xóm"),
    C("Lập giấy cho mượn đất, đổi rau cho bếp chung", { agency: 0.02, memory: { npc: n, tag: "WIN_WIN_DEAL", weight: 0.3, note: "mượn ba mét đất vườn nơi tu, đổi rau cho bếp chung" }, counters: { mnk_bond: 1 } }, "Đất vẫn của nơi tu, bếp có thêm rau", { tier: "sovereign" })], 0, { npc: n }); }, (c) => !!role(c, "neighbor")),

  daily(MO, "mnk_runaway", [20, 85], 8, (c) => T("Mảnh giấy trên giường", `Sáng nay giường của ${novice(c)} mười ba tuổi trống trơn, chỉ còn mảnh giấy: "Con nhớ mẹ." Nhà cậu cách hai trăm cây số; mẹ cậu gửi cậu lên vì nhà không nuôi nổi.`, [
    C("Đi tìm, đưa cậu về lại nơi tu", { bw: -3, counters: { mnk_vow: 1 }, gamble: { p: 0.7, win: { log: "Bạn gặp cậu ở bến xe. Cậu đi theo bạn về, không nói gì suốt đường." }, lose: { happy: -3, log: "Ba ngày sau mới có tin cậu đã về đến nhà." } } }, "Giữ cậu trong khuôn, có thể giữ nhầm"),
    C("Đưa cậu về hẳn nhà mẹ, gửi kèm tiền học", { money: -0.04, counters: { mnk_bond: 1 }, flags: ["mnk_sent_child_home"] }, "Cậu được ở với mẹ, nơi tu mất một khoản"),
    C("Đón cả mẹ cậu lên nấu bếp ở nơi tu", { agency: 0.02, bw: -2, counters: { mnk_bond: 2 } }, "Hai mẹ con gần nhau, nơi tu thêm miệng ăn", { tier: "sovereign" })], 0)),

  daily(MO, "mnk_knees", [30, 85], 9, () => T("Đầu gối sau hai mươi năm", "Bác sĩ nói khớp gối của bạn mòn vì ngồi xếp bằng quá lâu. Muốn về già còn đi lại được thì phải mổ, hoặc từ nay ngồi ghế. Trong phòng tu chưa ai ngồi ghế bao giờ.", [
    C("Mổ, xin nơi tu chi tiền", { money: -0.08, health: 6, counters: { mnk_bond: -1 } }, "Khỏe lại, nơi tu hụt quỹ"),
    C("Vẫn ngồi như cũ", { health: -5, counters: { mnk_vow: 1 } }, "Giữ nếp, đau về sau"),
    C("Mang ghế vào phòng tu, kệ người ta nói", { health: 3, flags: ["mnk_chair"], agency: 0.01, happy: -1 }, "Đỡ đau, nghe xì xào")], 1)),

  /* ---------- gia đình ---------- */
  cross(MO, "mnk_family", [20, 85], (c) => !!role(c, "mother") || !!role(c, "father") || (!!role(c, "child") && c.age >= 40), (c, N) => {
    const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (k && c.age >= 40) return T(`${N(k)} lên thăm`, `${N(k)} ngồi đối diện bạn hai tiếng ở nhà khách ${tv(c)}, uống hết ấm trà mới nói: tháng sau ${N(k)} cưới, muốn bạn về dự, mặc áo thường như mọi người.`, [
      C("Về dự, mặc áo tu", { trust: { npc: k, delta: 0.1 }, gamble: { p: 0.5, win: { log: `Cả họ đứng dậy chào bạn. ${N(k)} rưng rưng lúc rót trà mời.` }, lose: { trust: { npc: k, delta: -0.1 }, log: "Họ nhà bên kia nhìn bạn suốt buổi như nhìn khách lạ." } } }, "Giữ mình là người tu, con có thể ngượng"),
      C("Về, mặc áo thường một ngày", { trust: { npc: k, delta: 0.3 }, counters: { mnk_vow: -1 } }, "Con vui, lời nguyện sứt một chút"),
      C("Không về, gửi lời chúc và một lá thư dài", { counters: { mnk_vow: 1 }, memory: { npc: k, tag: "REFUSED_HELP", weight: -0.2, note: "không về dự đám cưới của con" } }, "Giữ giới trọn vẹn, con nhớ mãi")], 1, { npc: k });
    return T(`${N(p!)} ngã ở nhà`, `Hàng xóm gọi lên ${tv(c)}: ${N(p!)} ngã gãy chân, ở nhà một mình đã hai ngày. Anh chị em đều đi làm xa. Theo lệ, người tu không về nhà quá bảy ngày.`, [
      C("Xin phép về chăm một năm", { trust: { npc: p!, delta: 0.3 }, counters: { mnk_vow: -2 }, money: -0.05, bw: -4 }, "Trọn đạo làm con, lỡ dở việc tu"),
      C("Về bảy ngày, nhờ hàng xóm chăm tiếp", { trust: { npc: p!, delta: -0.1 }, money: -0.05, counters: { mnk_vow: 1 } }, "Giữ lệ, lòng không yên"),
      C(`Đón ${N(p!)} lên ở nhà khách nơi tu`, { agency: 0.02, trust: { npc: p!, delta: 0.2 }, counters: { mnk_bond: 1 }, gamble: { p: 0.6, win: { log: `${N(p!)} ở lại, sáng nào cũng ra quét lá cùng bạn.` }, lose: { log: `${N(p!)} ở được một tuần thì đòi về vì nhớ hàng xóm.` } } }, "Vừa tu vừa chăm, phá một lệ cũ", { tier: "sovereign" })], 0, { npc: p! });
  }),
];

/* ======================================================================
 * LINH MỤC, NỮ TU (priest) — tiền tố pst_
 * Giáo sĩ Kitô giáo nói chung; nhân vật nữ là nữ tu trong một dòng tu.
 * ==================================================================== */
const PR = "priest";
const rv = (c: FactContext): string => (c.sex === "F" ? "nữ tu" : "linh mục");
const sup = (c: FactContext): string => (c.sex === "F" ? "mẹ bề trên" : "bề trên");
const flock = (c: FactContext): string => (c.sex === "F" ? "cộng đoàn" : "giáo xứ");
const school = (c: FactContext): string => (c.sex === "F" ? "nhà dòng" : "chủng viện");
const chapel = (c: FactContext): string => (c.sex === "F" ? "nhà nguyện" : "nhà thờ");

const PRIEST: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(PR, "pst_t_after_mass", [9, 15], () => true, () => T("Đứa trẻ ở lại sau lễ", "Bạn theo bà đi lễ, rồi tự xin vào ca đoàn thiếu nhi, rồi ở lại sau lễ xếp ghế, nhặt giấy. Người phụ trách nhà thờ hỏi bạn có muốn chiều thứ bảy nào cũng đến đọc sách cho các cụ ở nhà dưỡng lão không.", [
    C("Nhận lời, đến đều mỗi tuần", { flags: [talentFlag(PR)], counters: { talents_seen: 1 }, bw: -1, happy: 2 }, "Mất buổi chơi, có một cộng đoàn"),
    C("Chỉ đi lễ cùng bà", { counters: { talents_seen: 1 }, rel: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(PR, "pst_d_form", [18, 28], () => true, (c) => T(`Tờ đơn vào ${school(c)}`, `Một ${rv(c)} già đưa bạn tờ đơn vào ${school(c)}: bảy năm học, không lương, cuối con đường là lời khấn trọn đời. Bạn đang có một công việc, và một người vẫn đợi bạn sau giờ làm.`, [
    C("Nộp đơn", { ...become(PR), counters: { doors_seen: 1 }, agency: 0.02, happy: -2, flags: ["pst_left_someone"] }, "Một đời phụng sự, khép lại một cuộc tình"),
    C("Xin sống thử một năm ở cộng đoàn trước", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(PR), log: "Hết năm, bạn ký đơn không do dự." }, lose: { happy: 2, log: "Một năm sau bạn trả lại tờ đơn, lòng nhẹ nhõm." } } }, "Chắc chắn hơn, mất một năm", { tier: "awakened" }),
    C("Cất tờ đơn vào ngăn kéo", { counters: { doors_seen: 1 }, happy: -1 })], 2)),
  door(PR, "pst_d_late", [24, 40], (c) => c.has_job, (c) => T("Tiếng gọi muộn", `Công việc của bạn ổn định, lương đều, ngày nào cũng giống ngày nào. Mùa lũ năm ấy, bạn theo nhà thờ đi phát gạo ba tuần và lần đầu thấy một ngày làm việc có ý nghĩa. Một ${rv(c)} hỏi bạn đã bao giờ nghĩ đến chuyện đi tu chưa.`, [
    C(`Nghỉ việc, xin vào ${school(c)}`, { ...become(PR), counters: { doors_seen: 1 }, money: -0.2, agency: 0.02, flags: ["pst_late_vocation"] }, "Mất lương, theo tiếng gọi muộn"),
    C("Xin làm thiện nguyện toàn thời gian một năm", { counters: { doors_seen: 1 }, money: -0.1, gamble: { p: 0.45, win: { ...become(PR), log: "Hết năm ấy bạn không quay lại bàn làm việc nữa." }, lose: { flags: ["pst_lay_volunteer"], log: "Bạn quay về chỗ làm, nhưng giữ thói quen đi phát gạo mỗi tháng." } } }, "Thử trước, mất một năm lương"),
    C("Ở lại làm việc, tình nguyện cuối tuần", { counters: { doors_seen: 1 }, happy: 2, rel: 2 }, "An toàn, nửa vời")], 2)),

  /* ---------- mạch truyện ---------- */
  beat(PR, 1, 1, (c) => T("Lá thư phản đối", `Năm đầu ở ${school(c)}: phòng sáu người, dậy lúc năm giờ, học đến mười giờ đêm. Một người cùng khóa bị cho về vì cãi ${sup(c)}. Trước khi đi, người ấy nhờ bạn ký vào lá thư phản đối cách ${school(c)} xử việc.`, [
    C("Ký tên", { counters: step(c, PR, { pst_voice: 1 }), flags: ["pst_signed_letter"], gamble: { p: 0.5, win: { log: "Lá thư được đọc trong buổi họp. Người kia được cho học lại." }, lose: { happy: -3, log: "Bạn bị gọi lên, hồ sơ có thêm một dòng ghi chú." } } }, "Đứng về phía bạn, có thể vào sổ đen"),
    C("Không ký, an ủi người ấy riêng", { counters: step(c, PR), flags: ["pst_obedient"], rel: 1 }, "Yên thân, người ấy ra đi một mình"),
    C(`Xin gặp ${sup(c)} nói thay, không ký thư`, { counters: step(c, PR, { pst_voice: 1 }), agency: 0.01, gamble: { p: 0.5, win: { flags: ["pst_trusted_by_sup"], log: "Bề trên nghe hết, không hứa gì, nhưng từ đó hay gọi bạn hỏi ý." }, lose: { log: "Bề trên cảm ơn rồi tiễn bạn ra cửa. Người kia vẫn phải đi." } } }, "Nói thẳng mà không làm căng", { tier: "awakened" })], 1), (c) => c.age >= 18),

  beat(PR, 2, 3, (c) => c.sex === "F"
    ? T("Mái ấm hai mươi tám đứa trẻ", "Bạn được sai về phụ trách mái ấm của dòng, nuôi hai mươi tám đứa trẻ mồ côi. Quỹ chỉ còn đủ ba tháng. Một công ty muốn thuê nửa khu vườn làm kho hàng, trả trước hai năm.", [
      C("Cho thuê vườn, có tiền nuôi các em", { counters: step(c, PR, { pst_flock: -1 }), flags: ["pst_leased"] }, "Có tiền ngay, các em mất chỗ chơi"),
      C("Đi gõ cửa từng nhà xin góp", { counters: step(c, PR, { pst_flock: 2 }), bw: -5, health: -2 }, "Chậm, mệt, mọi người thành của nhau"),
      C("Mở lớp dạy nghề may trong vườn, thu học phí nhỏ", { counters: step(c, PR), flags: ["pst_commons"], agency: 0.02, gamble: { p: 0.55, win: { counters: { pst_flock: 2 }, log: "Lớp kín chỗ. Học phí đủ nuôi các em thêm một năm." }, lose: { log: "Lớp vắng. Vườn vẫn trống, quỹ vẫn cạn." } } }, "Tự nuôi mình mà không bán vườn", { tier: "sovereign" })], 1)
    : T("Giáo xứ đầu tiên", `Bạn được sai về một ${c.poor_country ? "giáo xứ vùng sâu, hai giờ đường đất mới tới chợ" : "giáo xứ cũ ở ngoại ô, giáo dân phần lớn đã già"}. Nhà thờ dột, quỹ chỉ đủ trả tiền điện. Hội đồng giáo xứ muốn cho một công ty thuê khoảng sân sau làm bãi đỗ xe.`, [
      C("Cho thuê sân, có tiền sửa mái", { counters: step(c, PR, { pst_flock: -1 }), flags: ["pst_leased"] }, "Có tiền ngay, trẻ con mất chỗ chơi"),
      C("Đi gõ cửa từng nhà xin góp", { counters: step(c, PR, { pst_flock: 2 }), bw: -5, health: -2 }, "Chậm, mệt, mọi người thành của nhau"),
      C("Mở quán cơm giá rẻ cho thợ ở sân sau", { counters: step(c, PR), flags: ["pst_commons"], agency: 0.02, gamble: { p: 0.55, win: { counters: { pst_flock: 2 }, log: "Thợ trong vùng kéo đến ăn trưa. Tiền lời đủ sửa mái sau một năm." }, lose: { log: "Quán vắng. Sân vẫn trống, mái vẫn dột." } } }, "Tự nuôi mình mà không bán sân", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(PR, 3, 4, (c) => T(`Thư của ${sup(c)}`, `Một dự án muốn giải tỏa xóm nghèo sát ${c.sex === "F" ? "mái ấm" : "nhà thờ"}, đền bù chỉ bằng một phần năm giá đất. Người trong xóm xin bạn đứng ra nói thay họ.${cnt(c, "pst_voice") >= 1 ? " Ai cũng nhớ bạn từng không chịu im lặng." : ""} Rồi thư của ${sup(c)} đến: một ${rv(c)} không nên dính vào chuyện đất đai; nếu tiếp tục, bạn sẽ bị chuyển đi.`, [
    C("Vâng lời, nhận chuyển đi", { counters: step(c, PR, { pst_flock: -2 }), flags: ["pst_transferred"], happy: -4 }, "Giữ lời khấn vâng phục, bỏ lại người cần mình"),
    C("Ở lại đứng cùng người trong xóm", { counters: step(c, PR, { pst_voice: 2, pst_flock: 2 }), flags: ["pst_defied"] }, "Giữ được người, có thể mất áo tu"),
    C(`Mời ${sup(c)} về ở trong xóm ba ngày`, { counters: step(c, PR), agency: 0.03, gamble: { p: f(c, "pst_trusted_by_sup") ? 0.6 : 0.4, win: { flags: ["pst_sup_ally"], counters: { pst_flock: 1 }, log: "Bề trên ở lại ba ngày, về viết thư xin chính quyền xem lại giá đền bù." }, lose: { flags: ["pst_defied"], log: "Bề trên không đến. Một tuần sau, quyết định chuyển đi được gửi tới." } } }, "Kéo bề trên về phía mình, hoặc chọc giận", { tier: "sovereign" }),
    C("Cởi áo tu, ở lại làm người thường", { counters: step(c, PR), ...leave(PR), flags: ["ex_priest"], happy: 1 }, "Tự do lên tiếng, mất cộng đoàn")], 0), (c) => c.age >= 18),

  beat(PR, 4, 5, (c) => {
    if (f(c, "pst_defied") && !f(c, "pst_sup_ally")) return T("Một năm bị đình chỉ", `Bạn bị đình chỉ mọi công việc mục vụ một năm. Người trong xóm cũ vẫn tìm đến, nhưng bạn không còn mái nhà nào của ${flock(c)} để đón họ.${cnt(c, "pst_flock") >= 3 ? " Ba mươi gia đình ký đơn xin giữ bạn lại." : ""}`, [
      C("Chịu phạt, làm việc thầm lặng", { counters: step(c, PR, { pst_flock: 1 }), flags: ["pst_penance"], happy: -2 }, "Giữ áo tu, lùi một năm"),
      C("Lập nhóm tương trợ trong xóm, không nhân danh ai", { counters: step(c, PR, { pst_flock: 2 }), flags: ["pst_mutual_aid"], agency: 0.03, gamble: { p: 0.5, win: { log: "Nhóm tự lo được bếp ăn và lớp học. Bề trên lặng lẽ để yên." }, lose: { counters: { pst_voice: 1 }, log: "Bề trên coi đó là bất tuân lần thứ hai." } } }, "Phụng sự theo cách khác, liều thêm một lần", { tier: "sovereign" }),
      C("Rời hẳn áo tu", { counters: step(c, PR), ...leave(PR), flags: ["ex_priest"], happy: -2 }, "Hết bị ràng buộc, mất nơi thuộc về")], 0);
    if (f(c, "pst_transferred")) return T("Nhiệm sở yên ả", `Nơi mới khá giả, người ta lịch sự, ${chapel(c)} có máy lạnh. Ít ai cần bạn ngoài giờ lễ. Thỉnh thoảng có tin xóm cũ đã bị giải tỏa xong, mấy gia đình dạt về ở ven sông.`, [
      C("Ở yên, làm tròn bổn phận", { counters: step(c, PR), happy: -2, bw: 3 }, "Bình yên, lòng không yên"),
      C("Xin về nơi nghèo nhất mà không ai muốn đi", { counters: step(c, PR, { pst_flock: 2 }), flags: ["pst_went_poorest"], health: -3 }, "Về với người cần mình, cực hơn nhiều", { longterm: true }),
      C("Rủ người ở nơi mới góp quỹ cho xóm cũ", { counters: step(c, PR, { pst_flock: 1 }), agency: 0.02, gamble: { p: 0.5, win: { flags: ["pst_bridge_fund"], log: "Quỹ nhỏ đủ dựng lại mười mái nhà ven sông." }, lose: { log: "Người ta góp một lần rồi quên." } } }, "Nối người giàu với người nghèo, có thể nguội nhanh", { tier: "sovereign" })], 0);
    return T("Lời đề cử", `${cnt(c, "pst_flock") >= 3 ? "Người trong vùng gọi bạn bằng tên, không cần chức danh. " : ""}Bạn được đề cử làm ${c.sex === "F" ? "mẹ bề trên của cả dòng" : "người coi sóc cả một giáo hạt"}: ba mươi cộng đoàn, một ngân quỹ lớn, và rất ít thời gian cho từng người.`, [
      C("Nhận chức", { counters: step(c, PR), flags: ["pst_leader"], bw: -6, rel: 2 }, "Có tiếng nói lớn, xa người nhỏ"),
      C("Từ chối, ở lại với người của mình", { counters: step(c, PR, { pst_flock: 2 }), happy: 3 }, "Gần người, bỏ lỡ cơ hội thay đổi lớn"),
      C("Nhận, và công khai sổ quỹ cho mọi người xem", { counters: step(c, PR), flags: ["pst_leader", "pst_open_ledger"], agency: 0.03, gamble: { p: 0.5, win: { counters: { pst_flock: 2 }, log: "Lần đầu tiên sổ quỹ được dán ở cửa. Tiền góp tăng gấp đôi." }, lose: { bw: -4, log: "Vài người giữ chức lâu năm nhìn bạn như kẻ phá lệ." } } }, "Minh bạch, có thể gây thù", { tier: "sovereign" })], 1);
  }, (c) => c.age >= 18),

  beat(PR, 5, 6, (c) => T("Ngôi nhà ba tầng bỏ trống", `Ngôi nhà ba tầng cạnh ${chapel(c)} đã bỏ trống mười năm. Một công ty muốn mua để xây khách sạn, đủ tiền nuôi các ${rv(c)} già đến cuối đời. Đêm nào cũng có vài gia đình không nhà ngủ dưới hiên của nó.${f(c, "pst_commons") ? (c.sex === "F" ? " Lớp may bạn mở năm nào vẫn sáng đèn." : " Quán cơm bạn mở năm nào vẫn đỏ lửa mỗi trưa.") : ""}${f(c, "pst_leader") ? " Chữ ký cuối cùng là của bạn." : ""}`, [
    C("Bán, lo cho người già trong nhà", { counters: step(c, PR), flags: ["pst_sold_house"], happy: -1 }, "Người của mình yên, người ngoài hiên phải đi"),
    C("Biến thành nhà tạm trú", { counters: step(c, PR, { pst_flock: 2 }), flags: ["pst_shelter"], bw: -5, health: -2 }, "Có mái cho người không nhà, lo tiền mỗi tháng"),
    C("Bán một nửa, nửa kia làm nhà tạm trú", { counters: step(c, PR, { pst_flock: 1 }), agency: 0.02, gamble: { p: 0.5, win: { flags: ["pst_shelter"], log: "Khách sạn ở một đầu, nhà tạm trú ở đầu kia, chung một bức tường." }, lose: { log: "Công ty chỉ mua cả hoặc không mua. Ngôi nhà vẫn bỏ trống." } } }, "Vẹn cả hai nếu người mua chịu", { tier: "sovereign" })], 1), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(PR, "pst_confided", [20, 75], 8, () => T("Lời tâm sự phải giữ kín", "Một người tìm đến tâm sự riêng, xin bạn giữ kín: ông đang giữ lương của hai mươi công nhân để trả nợ riêng. Ông khóc, nhưng không hứa sẽ trả.", [
    C("Giữ kín, kiên nhẫn khuyên ông trả", { counters: { pst_flock: 1 }, gamble: { p: 0.45, win: { log: "Ba tháng sau, công nhân nhận đủ lương. Ông không bao giờ nhắc lại." }, lose: { happy: -4, log: "Xưởng đóng cửa. Hai mươi người không nhận được đồng nào." } } }, "Giữ lời tin cậy, có thể không ai được trả"),
    C("Âm thầm giúp công nhân tìm luật sư", { flags: ["pst_helped_workers"], bw: -4, counters: { pst_voice: 1 } }, "Không nói ra mà vẫn ra tay, rất mệt", { tier: "awakened" })], 0)),

  daily(PR, "pst_gift_car", [22, 75], 9, (c) => T("Chiếc xe được tặng", `Một gia đình giàu trong ${flock(c)} tặng bạn chiếc xe hơi mới. Phần lớn người ở đây đi xe máy cũ hoặc đi bộ. Họ bảo: để ${rv(c)} đi lại đỡ vất vả.`, [
    C("Nhận và đi", { health: 2, bw: 2, counters: { pst_flock: -1 } }, "Đỡ mệt, nghe người ta xì xào"),
    C("Bán xe, lấy tiền lập quỹ học bổng", { counters: { pst_flock: 1 }, flags: ["pst_sold_gift"], gamble: { p: 0.6, win: { log: "Gia đình kia gật đầu, còn góp thêm cho quỹ." }, lose: { log: "Gia đình kia phật lòng, chuyển sang đi lễ ở nơi khác." } } }, "Lợi cho nhiều người, có thể mất lòng người tặng"),
    C("Dùng làm xe chở người bệnh cho cả vùng", { counters: { pst_flock: 2 }, bw: -3, agency: 0.01 }, "Ai cũng được nhờ, bạn thành tài xế trực đêm", { tier: "sovereign" })], 0)),

  daily(PR, "pst_dark_night", [24, 80], 7, (c) => T("Đêm không cầu nguyện được", vary("pstd", c.age, [
    "Đã ba tháng nay, mỗi lần quỳ xuống bạn chỉ nghe tiếng quạt trần. Ngày mai bạn vẫn phải đứng trước hai trăm người nói về niềm tin.",
    `Sau đám tang một người mẹ trẻ trong ${flock(c)}, bạn đi bộ một mình đến nửa đêm. Lời an ủi bạn nói với gia đình, chính bạn không còn chắc.`]), [
    C("Thưa thật với người cố vấn tinh thần", { counters: { pst_doubt: 1 }, bw: 3, gamble: { p: 0.6, win: { happy: 3, log: "Người ấy nghe xong chỉ nói: tôi cũng từng thế." }, lose: { happy: -2, log: "Người ấy bắt đầu để ý bạn kỹ hơn." } } }, "Nhẹ lòng, có thể bị để ý"),
    C("Im lặng, cứ làm tròn bổn phận", { counters: { pst_doubt: 2 }, bw: -4 }, "Không ai biết, lòng nặng thêm"),
    C("Xin ba tháng đi làm việc tay chân ở nơi xa", { counters: { pst_doubt: -1 }, health: 2, happy: 2, money: -0.05 }, "Tìm lại mình, bỏ trống chỗ của mình", { tier: "awakened" })], 1)),

  daily(PR, "pst_night_call", [22, 80], 6, (c) => T("Cuộc gọi lúc ba giờ sáng", vary("pstn", c.age, [
    `Ba giờ sáng, điện thoại reo: một ông cụ bên kia sông sắp đi, gia đình muốn có ${rv(c)} bên cạnh. Trời mưa to, bạn đang sốt.`,
    "Nửa đêm, bệnh viện gọi: một bà cụ không người thân đang hấp hối, chỉ thì thầm xin gặp một người tu."]), [
    C("Đi ngay", { health: -4, counters: { pst_flock: 1 } }, "Có mặt đúng lúc, trả bằng sức mình"),
    C("Nhờ một người giúp việc nhà thờ đi thay", { flags: ["pst_lay_helpers"], bw: 1 }, "Giữ sức, gia đình có thể buồn"),
    C("Cầu nguyện qua điện thoại, sáng sớm sẽ đến", { gamble: { p: 0.5, win: { log: "Sáng ra bạn đến kịp. Người ấy còn nắm được tay bạn." }, lose: { happy: -4, counters: { pst_flock: -1 }, log: "Bạn đến khi người ta đã khâm liệm xong." } } }, "Đỡ mệt, có thể muộn")], 0)),

  daily(PR, "pst_fees", [24, 75], 8, (c) => T("Học phí mùa khai giảng", `Trường nhỏ do ${flock(c)} lo cần tăng học phí một phần ba để trả lương giáo viên. Mười hai em nhà nghèo sẽ phải nghỉ học nếu tăng.`, [
    C("Tăng học phí", { counters: { pst_flock: -1 }, flags: ["pst_raised_fees"] }, "Trường sống, mười hai em nghỉ học"),
    C("Giữ học phí, góp cả phần trợ cấp riêng", { money: -0.05, counters: { pst_flock: 1 }, bw: -2 }, "Không ai phải nghỉ, trường có thể cạn quỹ"),
    C("Vận động nhà khá góp quỹ học bổng mang tên họ", { agency: 0.02, gamble: { p: 0.6, win: { counters: { pst_flock: 2 }, flags: ["pst_scholarship"], log: "Mười hai suất học bổng mang tên mười hai gia đình." }, lose: { log: "Ít nhà chịu góp. Năm em vẫn phải nghỉ học." } } }, "Nối người có với người không, có thể hụt", { tier: "sovereign" })], 1)),

  daily(PR, "pst_sleepers", [24, 75], 8, (c) => T("Người ngủ nhờ hội trường", `Mười mấy người lao động từ nơi khác đến, không giấy tờ, xin ngủ nhờ trong hội trường ${flock(c)}. Cảnh sát khu vực ghé qua, nhờ bạn đưa danh sách tên của họ.`, [
    C("Đưa danh sách", { counters: { pst_flock: -2 }, flags: ["pst_gave_list"] }, "Yên với chính quyền, mất lòng tin người yếu"),
    C("Từ chối, cho họ ở tiếp", { counters: { pst_flock: 1, pst_voice: 1 }, gamble: { p: 0.6, win: { log: "Cảnh sát không quay lại. Họ ở đến khi tìm được việc." }, lose: { bw: -5, log: "Hội trường bị kiểm tra hai lần trong tháng." } } }, "Che chở người, mang rủi ro cho cả nhà thờ"),
    C("Tìm luật sư thiện nguyện giúp họ làm giấy tờ", { agency: 0.02, bw: -3, flags: ["pst_legal_aid"] }, "Giải quyết tận gốc, tốn nhiều tháng", { tier: "sovereign" })], 1)),

  daily(PR, "pst_supper", [26, 80], 9, (c) => T("Bữa tối một mình", `Tối nào bạn cũng ăn một mình trong căn phòng sau ${chapel(c)}. Một gia đình trong ${flock(c)} mời bạn đến ăn tối mỗi Chủ nhật; đã có người bắt đầu nói ra nói vào.`, [
    C("Nhận lời, kệ người ta nói", { happy: 4, gamble: { p: 0.7, win: { log: "Lời ra tiếng vào tắt dần sau vài tháng." }, lose: { flags: ["pst_rumor"], counters: { pst_flock: -1 }, log: "Lời đồn đến tai bề trên." } } }, "Đỡ cô đơn, sinh lời ra tiếng vào"),
    C("Từ chối, ăn một mình", { happy: -3, bw: -1 }, "Không ai nói gì, căn phòng vẫn im"),
    C("Mở bữa tối Chủ nhật chung cho người già neo đơn", { counters: { pst_flock: 2 }, happy: 3, bw: -2, flags: ["pst_sunday_table"] }, "Không ai cô đơn, thêm một việc phải lo", { tier: "sovereign" })], 1)),

  daily(PR, "pst_clip", [24, 70], 8, (c) => T("Bài giảng bị quay lén", `Một đoạn bạn giảng về đồng lương công bằng bị quay lén, đăng lên mạng, một triệu lượt xem. Người khen bạn can đảm, người bảo ${rv(c)} không nên nói chuyện tiền bạc.`, [
    C("Giảng tiếp như vậy", { counters: { pst_voice: 1, pst_flock: 1 }, flags: ["pst_known_voice"] }, "Có tiếng nói, có thêm người ghét"),
    C("Xin gỡ video, từ nay giảng nhẹ nhàng hơn", { counters: { pst_voice: -1 }, bw: 2 }, "Yên ổn, người nghèo thấy bạn lùi"),
    C("Mời người lao động lên tự kể chuyện của họ", { agency: 0.02, counters: { pst_flock: 2 }, gamble: { p: 0.5, win: { log: "Người ta nghe họ hơn nghe bạn. Đúng ý bạn." }, lose: { log: "Một người bị chủ xưởng gọi lên hỏi chuyện." } } }, "Trao tiếng nói cho người trong cuộc, họ chịu rủi ro", { tier: "sovereign" })], 1)),

  daily(PR, "pst_youth_band", [22, 70], 8, () => T("Trống điện trong buổi lễ tối", "Nhóm thanh niên muốn chơi trống và đàn điện trong buổi lễ tối thứ bảy. Mấy cụ trong hội đồng dọa thôi đóng góp nếu \"nhà thờ thành sàn nhảy\".", [
    C("Cho các bạn trẻ chơi", { counters: { pst_flock: 1 }, flags: ["pst_youth_band"], gamble: { p: 0.5, win: { log: "Buổi lễ tối đông gấp ba. Hai cụ cũng ngồi nhịp chân." }, lose: { money: -0.03, log: "Ba cụ thôi đóng góp thật." } } }, "Giữ người trẻ, có thể mất người già"),
    C("Giữ như cũ", { counters: { pst_flock: -1 } }, "Người già yên lòng, người trẻ bỏ đi dần"),
    C("Một tối nhạc mới, một tối nhạc cũ", { agency: 0.01, bw: -2, counters: { pst_flock: 1 } }, "Mỗi bên một nửa, bạn trực cả hai", { tier: "awakened" })], 2)),

  daily(PR, "pst_old_roof", [28, 80], 9, (c) => T("Mái ngói trăm năm", `Mái ${chapel(c)} trăm năm tuổi bắt đầu sập từng mảng. Một quỹ di sản đề nghị trả toàn bộ tiền sửa, với điều kiện không thay đổi gì, kể cả làm lối đi cho xe lăn.`, [
    C("Nhận tiền quỹ di sản", { flags: ["pst_heritage_fund"], counters: { pst_flock: -1 } }, "Mái được cứu, người ngồi xe lăn đứng ngoài"),
    C("Từ chối, tự quyên góp sửa dần", { bw: -4, counters: { pst_flock: 1 }, money: -0.03 }, "Làm theo ý mình, chậm và tốn"),
    C("Thương lượng: giữ mái cổ, làm lối dốc ở cửa hông", { agency: 0.02, gamble: { p: 0.5, win: { flags: ["pst_heritage_fund", "pst_ramp"], log: "Quỹ đồng ý. Lối dốc ở cửa hông lát đúng loại gạch cũ." }, lose: { log: "Quỹ rút đề nghị. Mái vẫn dột." } } }, "Vẹn cả hai nếu họ chịu", { tier: "sovereign" })], 2)),

  /* ---------- gia đình ---------- */
  cross(PR, "pst_family", [20, 75], (c) => !!role(c, "mother") || !!role(c, "father") || !!role(c, "sibling"), (c, N) => {
    const p = role(c, "mother") ?? role(c, "father"); const s = role(c, "sibling");
    if (p) return T("Không ai nối dõi", `Ở ${c.country === "VN" ? "đám giỗ ông nội" : "bữa tối ngày lễ"}, trước mặt cả họ, ${N(p)} thở dài: "Nhà này đến đời con là hết người nối dõi." Từ ngày bạn đi tu, ${N(p)} chưa đến dự một buổi lễ nào của bạn.`, [
      C(`Hẹn ${N(p)} một buổi nói chuyện riêng`, { gamble: { p: 0.55, win: { trust: { npc: p, delta: 0.3 }, log: `${N(p)} nghe hết, không nói gì, nhưng tháng sau đến dự lễ, ngồi hàng ghế cuối.` }, lose: { trust: { npc: p, delta: -0.1 }, log: `${N(p)} bảo con đã chọn thì thôi, đừng bắt cha mẹ hiểu.` } } }, "Có thể hiểu nhau, có thể vỡ thêm"),
      C("Im lặng, ăn hết bữa", { happy: -3, trust: { npc: p, delta: -0.05 } }, "Không cãi nhau, khoảng cách còn đó"),
      C(`Rủ ${N(p)} đến phụ bếp ăn từ thiện một tuần`, { trust: { npc: p, delta: 0.1 }, gamble: { p: 0.5, win: { trust: { npc: p, delta: 0.2 }, log: `Đến ngày thứ ba, ${N(p)} khoe với hàng xóm việc con làm.` }, lose: { log: `${N(p)} đến một buổi rồi thôi.` } } }, "Cho thấy thay vì giải thích", { tier: "awakened" })], 1, { npc: p });
    return T(`${N(s!)} cần người bảo lãnh`, `${N(s!)} làm ăn thua lỗ, muốn bạn giới thiệu với mấy nhà khá giả trong ${flock(c)} để vay tiền. "Người ta tin ${rv(c)}, không tin em."`, [
      C("Giới thiệu, đứng ra bảo lãnh", { trust: { npc: s!, delta: 0.2 }, gamble: { p: 0.5, win: { log: `${N(s!)} trả đủ sau hai năm, mang quà đến cảm ơn từng nhà.` }, lose: { counters: { pst_flock: -2 }, log: `${N(s!)} trả không nổi. Mấy nhà kia nhìn bạn khác hẳn.` } } }, "Giúp em, đặt cả uy tín của mình vào"),
      C("Từ chối", { memory: { npc: s!, tag: "REFUSED_HELP", weight: -0.2, note: "không chịu giới thiệu để vay tiền lúc làm ăn thua lỗ" } }, "Giữ uy tín, em giận lâu"),
      C(`Ngồi cùng ${N(s!)} lập kế hoạch trả nợ trước đã`, { trust: { npc: s!, delta: 0.1 }, bw: -3, promise: { to: s!, what: "cùng em lo xong khoản nợ", years: 2 } }, "Giúp tận gốc, phải theo đến cùng", { tier: "awakened" })], 2, { npc: s! });
  }),
];

/* ======================================================================
 * BÁC SĨ THIỆN NGUYỆN (aid_doctor) — tiền tố btn_
 * Hai nhánh: ra thực địa với một tổ chức nhân đạo, hoặc về mở phòng khám ở quê (cờ btn_home_clinic).
 * ==================================================================== */
const AD = "aid_doctor";
const homeClinic = (c: FactContext): boolean => f(c, "btn_home_clinic");

const AID_DOCTOR: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AD, "btn_t_bandage", [10, 16], () => true, () => T("Đôi tay biết băng bó", "Thằng bạn ngã xe đạp, đầu gối rách một mảng. Cả nhóm đứng nhìn; chỉ có bạn lấy nước rửa vết thương rồi xé vạt áo băng lại. Cô y tá ở trạm y tế gần nhà bảo bạn băng khéo hơn khối người lớn.", [
    C("Xin học lớp sơ cứu cuối tuần", { money: -0.02, flags: [talentFlag(AD)], counters: { talents_seen: 1 }, bw: -1 }, "Mất buổi chơi, mở một con đường"),
    C("Cười trừ, đi đá bóng tiếp", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AD, "btn_d_camp", [25, 45], (c) => f(c, "job_health") || (c.has_degree && f(c, talentFlag(AD))), () => T("Sáu tháng ở trại tị nạn", "Một tổ chức y tế nhân đạo cần bác sĩ cho một trại tị nạn ở biên giới, hợp đồng sáu tháng. Lương bằng một phần ba chỗ bạn đang làm, có bảo hiểm sơ tán khẩn cấp và một chiếc giường gấp.", [
    C("Ký hợp đồng, xin nghỉ việc", { ...become(AD), counters: { doors_seen: 1 }, money: -0.05, agency: 0.02 }, "Mất chỗ làm ổn định, đến nơi cần mình"),
    C("Xin cơ quan cho đi biệt phái", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(AD), flags: ["btn_seconded"], log: "Bệnh viện đồng ý giữ chỗ cho bạn sáu tháng." }, lose: { happy: -2, log: "Bệnh viện từ chối. Thư mời nằm lại trong hộp thư." } } }, "Có đường lui, có thể lỡ chuyến", { tier: "awakened" }),
    C("Góp tiền ủng hộ thay vì đi", { counters: { doors_seen: 1 }, money: -0.03 })], 2)),
  door(AD, "btn_d_flood", [25, 55], (c) => f(c, "job_health"), () => T("Đêm lũ về", "Lũ quét qua vùng cách nhà bạn ba trăm cây số. Đài phát thanh nói các điểm sơ tán thiếu người khám bệnh. Ca trực của bạn bắt đầu lúc bảy giờ sáng mai.", [
    C("Lái xe đi ngay trong đêm", { ...become(AD), counters: { doors_seen: 1 }, health: -2, flags: ["btn_disaster_start"] }, "Đến kịp lúc, bỏ ca trực lại cho người khác"),
    C("Trực xong ca rồi đi ba ngày", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(AD), log: "Ba ngày thành ba tháng. Bạn không quay lại chỗ cũ." }, lose: { happy: 2, log: "Ba ngày sau bạn về, mệt nhưng nhẹ lòng." } } }, "Giữ chỗ làm, đến muộn"),
    C("Nhận thêm ca để đồng nghiệp đi thay", { counters: { doors_seen: 1 }, rel: 2, health: -1 })], 1)),
  door(AD, "btn_d_village", [30, 55], (c) => f(c, "job_health"), (c) => T("Nơi chưa có bác sĩ", `${c.country === "VN" ? "Xã nơi bạn sinh ra chưa có bác sĩ thường trực; người ốm phải đi bốn giờ đường lên huyện." : "Vùng quê nơi bạn sinh ra không có bác sĩ thường trực; người ốm phải đi bốn giờ đường mới tới bệnh viện."} Một quỹ nhỏ đề nghị trả tiền thuốc nếu bạn về mở phòng khám miễn phí ba ngày một tuần.`, [
    C("Về quê mở phòng khám", { ...become(AD), counters: { doors_seen: 1 }, money: -0.1, flags: ["btn_home_clinic"] }, "Thu nhập giảm, ở gần người quen mình"),
    C("Mỗi năm về khám miễn phí một tháng", { counters: { doors_seen: 1 }, rel: 3, bw: -2 }, "Vẹn cả hai, không đủ cho bên nào")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(AD, 1, 1, (c) => T(homeClinic(c) ? "Sáu mươi người trước cửa" : "Lều khám đầu tiên", homeClinic(c)
    ? "Sáng đầu tiên, sáu mươi người xếp hàng từ lúc trời chưa sáng. Thuốc kháng sinh quỹ gửi về chỉ đủ cho hai mươi người; nhiều người khác chỉ cần có ai nghe họ kể."
    : "Lều khám ba mươi giường, máy phát điện chạy bốn giờ một ngày. Tuần đầu có bốn mươi người sốt cao, mà thuốc kháng sinh chỉ đủ cho hai mươi.", [
    C("Ưu tiên trẻ em và người già", { counters: step(c, AD, { btn_field: 1 }), flags: ["btn_triage"], happy: -3 }, "Theo nguyên tắc, nhìn người khác chờ"),
    C("Chia nửa liều cho tất cả", { counters: step(c, AD), gamble: { p: 0.4, win: { log: "May mắn, phần lớn đều qua khỏi." }, lose: { counters: { btn_burn: 1 }, log: "Nửa liều không đủ. Nhiều người phải nằm lại lâu hơn." } } }, "Ai cũng có phần, có thể không đủ cho ai"),
    C("Đi xin thuốc ở trạm bên cạnh, cả đêm trên đường", { counters: step(c, AD, { btn_burn: 1 }), health: -3, gamble: { p: 0.6, win: { counters: { btn_field: 1 }, log: "Trạm bên cho mượn ba hộp. Sáng ra bạn về kịp giờ khám." }, lose: { log: "Trạm bên cũng thiếu. Bạn về tay không, mất một đêm ngủ." } } }, "Có thể đủ cho mọi người, trả bằng sức mình", { tier: "awakened" })], 0), (c) => c.age >= 18),

  beat(AD, 2, 3, (c) => T(homeClinic(c) ? "Lời mời làm đại sứ" : "Gương mặt gây quỹ", homeClinic(c)
    ? "Một tờ báo viết về phòng khám của bạn. Một chuỗi bệnh viện tư mời bạn làm gương mặt đại diện: lương gấp ba, chỉ cần về phòng khám mỗi tuần một ngày."
    : "Một tấm ảnh bạn khám bệnh trong lều được đăng khắp nơi. Tổ chức đề nghị bạn làm gương mặt gây quỹ: đi nói chuyện ở các thành phố giàu, lương gấp ba, mỗi năm chỉ ra thực địa một tháng.", [
    C("Nhận lời", { counters: step(c, AD, { btn_field: -1 }), income_mult: 1.8, flags: ["btn_face"] }, "Tiền về nhiều, xa người bệnh"),
    C("Từ chối, ở lại khám bệnh", { counters: step(c, AD, { btn_field: 2, btn_burn: 1 }), health: -3 }, "Gần người bệnh, mệt hơn mỗi năm", { longterm: true }),
    C("Nhận nửa năm, đổi lấy quỹ đào tạo y tá tại chỗ", { counters: step(c, AD, { btn_field: 1 }), flags: ["btn_trained_locals"], income_mult: 1.3, agency: 0.02 }, "Chậm hơn, để lại người làm được việc", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(AD, 3, 4, (c) => homeClinic(c)
    ? T("Thuốc của nhà tài trợ", "Quỹ ngừng cấp tiền thuốc cho phòng khám. Một công ty dược đề nghị trả tiền thuốc cả năm, đổi lại bạn kê loại thuốc của họ, đắt gấp đôi thuốc cũ, và cho họ xem sổ bệnh nhân.", [
      C("Nhận tài trợ, kê thuốc của họ", { counters: step(c, AD, { btn_burn: 1 }), money: 0.15, flags: ["btn_pharma"], secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 9], note: "nhận tài trợ để kê thuốc đắt cho bệnh nhân nghèo" } }, "Phòng khám sống, có một bí mật"),
      C("Từ chối, thu mỗi lượt khám một khoản nhỏ", { counters: step(c, AD), flags: ["btn_small_fee"], gamble: { p: 0.6, win: { log: "Người ta trả, có người trả bằng gà, bằng rau." }, lose: { counters: { btn_field: -1 }, log: "Người nghèo nhất thôi không đến nữa." } } }, "Tự chủ, người nghèo nhất có thể bỏ đi"),
      C("Lập quỹ làng, mỗi nhà góp một ít mỗi tháng", { counters: step(c, AD, { btn_field: 1 }), flags: ["btn_village_fund"], agency: 0.03, bw: -5 }, "Không nợ ai, phải thuyết phục từng nhà", { tier: "sovereign" }),
      C("Đóng phòng khám, quay lại bệnh viện", { counters: step(c, AD), ...leave(AD), flags: ["ex_aid_doctor"], happy: -2 }, "Đời mình ổn định, nơi này lại không có bác sĩ")], 1)
    : T("Nửa đêm trong lều khám", `Nửa đêm, một nhóm người mang súng vào lều, đòi bạn chữa cho chỉ huy của họ trước và đưa danh sách bệnh nhân. Quy tắc của tổ chức: chữa theo mức nặng nhẹ, không giao thông tin bệnh nhân cho bất kỳ ai.${cnt(c, "btn_burn") >= 2 ? " Bạn đã ba đêm không ngủ." : ""}`, [
      C("Chữa theo mức nặng nhẹ, không đưa danh sách", { counters: step(c, AD, { btn_field: 1 }), gamble: { p: 0.6, win: { flags: ["btn_held_line"], log: "Họ chờ đến lượt. Sáng ra họ đi, để lại một bao gạo." }, lose: { health: -6, flags: ["btn_threatened"], counters: { btn_burn: 1 }, log: "Họ đập tủ thuốc trước khi đi. Ba tuần sau trạm mới mở lại." } } }, "Giữ nguyên tắc, có thể trả giá đắt"),
      C("Chữa cho người của họ trước", { counters: step(c, AD, { btn_burn: 1 }), flags: ["btn_bent_rule"], happy: -3 }, "Cả trạm yên đêm nay, nguyên tắc sứt mẻ"),
      C("Mời các trưởng làng đứng ra che chở trạm", { counters: step(c, AD), agency: 0.03, gamble: { p: 0.5, win: { flags: ["btn_village_shield"], counters: { btn_field: 1 }, log: "Các trưởng làng đến ngồi trước cửa lều. Từ đó không ai mang súng vào nữa." }, lose: { health: -3, log: "Các trưởng làng sợ, không dám đến." } } }, "Để cộng đồng che chở, đặt họ vào thế khó", { tier: "sovereign" }),
      C("Đóng trạm, sơ tán cả đội", { counters: step(c, AD), ...leave(AD), flags: ["ex_aid_doctor"], happy: -4 }, "An toàn cho đội, bỏ lại bệnh nhân")], 0), (c) => c.age >= 18),

  beat(AD, 4, 5, (c) => (cnt(c, "btn_burn") >= 2 || f(c, "btn_threatened") || f(c, "btn_pharma"))
    ? T("Liều thuốc kê nhầm", `Đã lâu bạn không ngủ quá ba giờ một đêm. Sáng nay bạn kê nhầm liều cho một bệnh nhân; y tá phát hiện kịp.${f(c, "btn_pharma") ? " Cùng tuần đó, có người hỏi vì sao đơn thuốc của phòng khám toàn một loại." : ""} Đồng nghiệp bắt đầu nhìn bạn như nhìn một bệnh nhân.`, [
      C("Nghỉ một năm để chữa cho chính mình", { counters: step(c, AD, { btn_burn: -2 }), income_mult: 0.7, health: 6, happy: 4, flags: ["btn_recovered"] }, "Mất đà, giữ được mình", { longterm: true }),
      C("Giấu chuyện, làm tiếp", { counters: step(c, AD, { btn_burn: 1 }), gamble: { p: 0.5, win: { log: "Bạn qua được mùa này. Không ai nhắc lại chuyện liều thuốc." }, lose: { flags: ["btn_suspended"], income_mult: 0.6, happy: -6, log: "Lần sau không ai phát hiện kịp. Bạn bị đình chỉ hành nghề một năm." } } }, "Không ai thay được bạn, cho đến khi sai"),
      C("Thôi làm thiện nguyện, về bệnh viện gần nhà", { counters: step(c, AD), ...leave(AD), flags: ["ex_aid_doctor"], health: 3, rel: 3 }, "Bình yên, bỏ lại một phần đời")], 0)
    : T(homeClinic(c) ? "Mười phòng khám" : "Bốn trạm, sáu mươi người", `${homeClinic(c) ? "Phòng khám của bạn được nhân rộng ra mười vùng quê; người ta muốn bạn điều hành cả mạng lưới." : "Tổ chức giao bạn điều hành cả một vùng: bốn trạm, sáu mươi nhân viên, ngân sách bằng cả một bệnh viện tỉnh."}${f(c, "btn_trained_locals") ? " Hai y tá bạn dạy năm xưa giờ là trưởng trạm." : ""}${f(c, "btn_face") ? " Người ta biết mặt bạn trước khi biết tên tổ chức." : ""}`, [
      C("Nhận, điều hành từ văn phòng", { counters: step(c, AD, { btn_field: -1 }), income_mult: 1.4, flags: ["btn_director"], bw: -4 }, "Lo được cho nhiều người, xa từng người"),
      C("Giao cho người địa phương, mình làm cố vấn", { counters: step(c, AD), flags: ["btn_handover"], agency: 0.03, income_mult: 0.9 }, "Mất ghế, để lại một hệ thống tự đứng được", { tier: "sovereign" }),
      C("Từ chối, vẫn khám bệnh mỗi ngày", { counters: step(c, AD, { btn_field: 2 }), happy: 3, health: -2 }, "Gần người bệnh, việc lớn để người khác làm")], 2), (c) => c.age >= 18),

  beat(AD, 5, 6, (c) => T("Trở lại chỗ cũ", `Hai mươi năm sau, bạn quay lại nơi ${homeClinic(c) ? "phòng khám đầu tiên" : "lều khám đầu tiên"}. ${(f(c, "btn_handover") || f(c, "btn_trained_locals") || f(c, "btn_village_fund")) ? "Giờ đó là một cơ sở y tế nhỏ do người địa phương điều hành; tên một y tá bạn từng dạy ghi trên cửa." : f(c, "btn_director") ? "Tòa nhà mới có tên tổ chức trên mái; không ai ở đó còn nhớ bạn." : "Chỉ còn nền xi măng và một tấm biển gỉ."} Một trường y mời bạn về dạy sinh viên năm cuối.`, [
    C("Về dạy, kể cả những lần mình sai", { counters: step(c, AD), know: 4, flags: ["btn_teacher"], income_mult: 1.1 }, "Truyền nghề, rời thực địa"),
    C("Viết hồi ký, lấy tiền gây quỹ cho nơi cũ", { counters: step(c, AD), flags: ["btn_memoir"], gamble: { p: 0.5, win: { money: 0.1, log: "Cuốn sách bán chạy. Nơi cũ có thêm một máy siêu âm." }, lose: { log: "Sách bán được vài trăm bản, phần lớn cho bạn bè." } } }, "Kể lại để giúp, có thể không ai đọc"),
    C("Ở lại khám đến khi không đi nổi", { counters: step(c, AD, { btn_field: 1 }), health: -4, happy: 5 }, "Trọn với nghề, cạn sức")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(AD, "btn_photo", [25, 65], 7, () => T("Tấm ảnh cho chiến dịch", "Nhóm truyền thông muốn đăng ảnh một đứa trẻ gầy trơ xương trong lều của bạn cho chiến dịch gây quỹ. Mẹ đứa bé không biết chữ, đã gật đầu khi họ giơ máy lên.", [
    C("Để họ đăng", { flags: ["btn_photo_used"], counters: { btn_field: -1 } }, "Gây được nhiều tiền, đứa bé thành biểu tượng"),
    C("Không cho đăng", { counters: { btn_field: 1 }, flags: ["btn_photo_refused"], happy: -1 }, "Giữ phẩm giá, chiến dịch kém sức"),
    C("Ngồi giải thích cho người mẹ, để chị tự quyết", { counters: { btn_field: 1 }, bw: -2, agency: 0.01, flags: ["btn_consent"] }, "Tôn trọng thật sự, mất cả buổi chiều", { tier: "awakened" })], 1)),

  daily(AD, "btn_outbreak", [25, 65], 6, (c) => T("Ổ sốt lạ bên kia suối", vary("btnb", c.age, [
    "Một tuần có năm ca sốt lạ ở làng bên kia suối. Nếu là dịch, phải cách ly cả làng đúng mùa gặt.",
    "Ba gia đình trong cùng một xóm cùng đau bụng, sốt cao. Giếng nước chung của xóm có mùi lạ."]), [
    C("Đề nghị cách ly cả làng ngay", { counters: { btn_field: 1 }, gamble: { p: 0.5, win: { log: "Đúng là dịch. Nhờ khoanh sớm, nó dừng lại ở hai làng." }, lose: { flags: ["btn_false_alarm"], log: "Hóa ra không phải dịch. Làng lỡ mùa gặt, người ta không quên." } } }, "Có thể chặn dịch, có thể làm lỡ mùa"),
    C("Báo lên trên, chờ xét nghiệm", { bw: -2, counters: { btn_burn: 1 } }, "Đúng quy trình, chậm hai tuần"),
    C("Tự vào làng khám từng nhà", { health: -2, counters: { btn_field: 2 }, gamble: { p: 0.7, win: { log: "Bạn tìm ra nguồn bệnh: cái giếng chung." }, lose: { health: -6, log: "Bạn lây bệnh, nằm liệt mười ngày." } } }, "Biết chắc nhanh nhất, liều chính mình")], 1)),

  daily(AD, "btn_pay_gap", [25, 65], 8, () => T("Lương của y tá địa phương", "Chị y tá người địa phương làm cùng ca với bạn, nhận lương bằng một phần mười lương của bạn. Chị hỏi thẳng: \"Bác sĩ thấy thế có công bằng không?\"", [
    C("Viết thư đề nghị tổ chức tăng lương cho họ", { counters: { btn_field: 1 }, gamble: { p: 0.4, win: { flags: ["btn_raised_pay"], log: "Tổ chức tăng lương cho y tá địa phương thêm một nửa." }, lose: { log: "Thư trả lời: chưa có ngân sách, cảm ơn góp ý." } } }, "Có thể thay đổi, có thể bị coi là rắc rối"),
    C("Góp một phần lương của mình vào quỹ chung", { money: -0.1, counters: { btn_field: 1 }, flags: ["btn_shared_pay"] }, "Công bằng hơn, bạn nghèo đi"),
    C("Nói đó là chính sách, không phải việc của mình", { counters: { btn_field: -1 }, happy: -1 }, "Yên chuyện, mất lòng người cùng ca")], 0)),

  daily(AD, "btn_stolen", [25, 65], 8, () => T("Thùng thuốc biến mất", "Một thùng thuốc sốt rét biến mất khỏi kho. Ai cũng đoán là anh bảo vệ, người có bốn đứa con và hai tháng chưa được trả lương. Thuốc đó đang được bán ở chợ thị trấn.", [
    C("Báo cảnh sát", { flags: ["btn_reported_theft"], counters: { btn_field: -1 } }, "Đúng luật, một gia đình mất kế sinh nhai"),
    C("Gặp riêng anh ta, cho cơ hội trả lại", { counters: { btn_field: 1 }, gamble: { p: 0.55, win: { log: "Hôm sau, nửa thùng thuốc trở lại kho, kèm một tờ giấy xin lỗi." }, lose: { log: "Anh ta chối, rồi nghỉ việc. Thuốc không về nữa." } } }, "Giữ người, có thể mất thuốc"),
    C("Đòi tổ chức trả lương đúng hạn cho mọi người", { agency: 0.02, bw: -3, counters: { btn_field: 1 } }, "Chữa tận gốc, kho thì vẫn đang thiếu", { tier: "sovereign" })], 1)),

  daily(AD, "btn_nightmare", [25, 70], 7, (c) => T("Giấc mơ lặp lại", vary("btnn", c.age, [
    "Ba tháng nay đêm nào bạn cũng mơ lại một ca không cứu được. Bạn bắt đầu uống một ly trước khi ngủ, rồi hai ly.",
    "Về phép, bạn giật mình mỗi khi nghe tiếng trực thăng hay tiếng nổ lốp xe ngoài đường."]), [
    C("Gặp chuyên gia tâm lý của tổ chức", { counters: { btn_burn: -1 }, bw: 3, money: -0.03 }, "Lành dần, phải thừa nhận mình bị thương"),
    C("Uống cho dễ ngủ", { counters: { btn_burn: 1, drink: 1 }, health: -3 }, "Đêm nay ngủ được, ngày mai nặng hơn"),
    C("Lập nhóm đồng nghiệp gặp nhau mỗi tuần để kể", { counters: { btn_burn: -1 }, agency: 0.01, rel: 3, flags: ["btn_peer_circle"] }, "Mọi người cùng nhẹ, mất một tối mỗi tuần", { tier: "awakened" })], 0)),

  daily(AD, "btn_healer", [25, 70], 8, () => T("Ông thầy lang trong làng", "Phần lớn người ốm trong vùng đi gặp ông thầy lang trước, đến chỗ bạn khi đã quá muộn. Hôm qua có một vết thương bị đắp lá đến nhiễm trùng nặng.", [
    C("Nói với dân làng đừng tin ông ta nữa", { counters: { btn_field: -1 }, flags: ["btn_feud_healer"] }, "Nói thẳng, làng chia hai phe"),
    C("Mời ông đến trạm, dạy ông nhận biết ca nặng", { counters: { btn_field: 2 }, agency: 0.02, gamble: { p: 0.6, win: { flags: ["btn_healer_ally"], log: "Từ đó ông gửi ca nặng sang trạm, và bạn học được tên mười loại lá." }, lose: { log: "Ông coi đó là xúc phạm, không đến." } } }, "Biến đối thủ thành đồng minh, có thể bị từ chối", { tier: "sovereign" }),
    C("Kệ, ai đến thì khám", { bw: 1 }, "Đỡ va chạm, ca muộn vẫn đến")], 2)),

  daily(AD, "btn_checkpoint", [25, 65], 8, () => T("Trạm gác trên đường", "Xe chở thuốc bị giữ ở trạm gác. Người lính bảo phải \"đóng phí\" mới được qua; không đóng thì chờ giấy phép, có khi một tuần. Ở trạm khám, mười người đang đợi thuốc.", [
    C("Đóng phí cho xe qua", { money: -0.03, secret: { tag: "PAID_BRIBE", severity: 0.2, fuse_years: [2, 8], note: "đóng phí ở trạm gác để xe thuốc qua" } }, "Thuốc đến kịp, có một bí mật"),
    C("Không đóng, chờ giấy phép", { counters: { btn_field: -1, btn_burn: 1 }, happy: -2 }, "Trong sạch, người bệnh chờ một tuần"),
    C("Nhờ trưởng làng đi cùng nói chuyện", { agency: 0.02, gamble: { p: 0.5, win: { counters: { btn_field: 1 }, log: "Trưởng làng quen người chỉ huy trạm. Xe qua sau một tiếng." }, lose: { log: "Trưởng làng cũng bị bắt chờ." } } }, "Dựa vào người địa phương, không chắc được", { tier: "sovereign" })], 1)),

  daily(AD, "btn_donors", [28, 65], 8, () => T("Đoàn nhà tài trợ đến thăm", "Đoàn nhà tài trợ đến thăm trạm một ngày. Văn phòng dặn dọn dẹp, treo băng rôn, chọn vài bệnh nhân \"có câu chuyện cảm động\" để họ gặp. Hôm đó lại là ngày khám thai định kỳ.", [
    C("Làm đúng như văn phòng dặn", { counters: { btn_field: -1 }, flags: ["btn_staged_visit"] }, "Có thêm tài trợ, mất một ngày khám"),
    C("Cứ khám như thường, mời họ đứng xem", { counters: { btn_field: 1 }, gamble: { p: 0.5, win: { log: "Một nhà tài trợ ngồi lại cả buổi, cuối năm tăng gấp đôi khoản góp." }, lose: { log: "Đoàn về sớm. Văn phòng gửi thư nhắc nhở bạn." } } }, "Thật thà, có thể làm phật lòng")], 1)),

  daily(AD, "btn_private_offer", [30, 60], 99, () => T("Lời mời của bệnh viện tư", "Bạn học cũ giờ là giám đốc một bệnh viện tư, mời bạn về làm trưởng khoa, lương gấp năm. Bạn vừa đếm lại tài khoản: không đủ ba tháng tiền nhà.", [
    C("Nhận lời, rời việc thiện nguyện", { ...leave(AD), flags: ["ex_aid_doctor"], money: 0.3 }, "Đủ đầy, xa những nơi cần mình"),
    C("Ở lại, thắt lưng buộc bụng", { happy: -2, counters: { btn_field: 1 } }, "Giữ con đường, túi rỗng"),
    C("Làm bán thời gian ở đó để nuôi việc thiện nguyện", { income_mult: 1.3, counters: { btn_burn: 1 }, bw: -4, flags: ["btn_split_life"] }, "Có tiền, cạn sức", { tier: "awakened" })], 1), (c) => c.broke || c.happy < 50),

  daily(AD, "btn_reference", [25, 65], 9, () => T("Lá thư giới thiệu", "Cậu phiên dịch mười chín tuổi của bạn mơ học y ở nước ngoài. Cậu xin bạn viết thư giới thiệu, và nhờ ghi rằng cậu \"đã hai năm làm trợ lý y tế\", dù cậu mới chỉ phiên dịch.", [
    C("Viết đúng như cậu nhờ", { secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [3, 10], note: "viết thư giới thiệu khai khống cho cậu phiên dịch" }, gamble: { p: 0.5, win: { log: "Cậu được nhận học bổng." }, lose: { log: "Trường không trả lời." } } }, "Giúp được cậu, có một bí mật"),
    C("Viết thật, khen hết lời những gì cậu đã làm", { counters: { btn_field: 1 }, gamble: { p: 0.35, win: { flags: ["btn_mentee"], log: "Cậu vẫn được nhận. Mỗi năm cậu gửi bạn một tấm ảnh từ giảng đường." }, lose: { log: "Cậu không được nhận, và không nói chuyện với bạn mấy tuần." } } }, "Trung thực, có thể làm cậu lỡ cơ hội"),
    C("Dạy cậu làm trợ lý thật một năm rồi mới viết", { bw: -3, flags: ["btn_mentee"], agency: 0.01 }, "Chậm một năm, lá thư thành sự thật", { tier: "sovereign" })], 1)),

  /* ---------- gia đình ---------- */
  cross(AD, "btn_family", [25, 70], (c) => (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse"); const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (s && c.married) return T("Bữa cơm vắng một người", `${homeClinic(c) ? "Phòng khám mở cửa đến tối; tuần này bạn lỡ cả ba bữa cơm nhà." : "Đường truyền vệ tinh rớt ba lần trong cuộc gọi về nhà."}${k ? ` Hôm nay là sinh nhật ${N(k)}.` : ""} ${N(s)} nhắn: "Năm sau về hẳn, hay lại thêm một hợp đồng nữa?"`, [
      C(`Hứa với ${N(s)} năm sau sẽ về hẳn`, { promise: { to: s, what: "năm sau về hẳn với gia đình", years: 1 }, trust: { npc: s, delta: 0.15 } }, "Giữ nhà, phải bỏ dở việc đang làm"),
      C("Đưa cả nhà đến sống gần nơi làm việc", { money: -0.2, trust: { npc: s, delta: 0.1 }, gamble: { p: 0.5, win: { log: "Cả nhà quen dần. Bọn trẻ học thêm được một thứ tiếng." }, lose: { trust: { npc: s, delta: -0.2 }, log: "Sau một năm, cả nhà xin về. Không ai trách bạn thành lời." } } }, "Ở cạnh nhau, đặt cả nhà vào rủi ro", { tier: "sovereign" }),
      C("Ký thêm hợp đồng", { counters: { btn_field: 1 }, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.2, note: "lại ký thêm một hợp đồng xa nhà" } }, "Trọn với người bệnh, xa người nhà")], 0, { npc: s });
    return T(`${N(p!)} nằm viện`, homeClinic(c)
      ? `${N(p!)} ốm nặng, chỉ muốn con ở nhà chăm. Nhưng ngày nào cũng có ba chục người chờ ở phòng khám, và không ai thay bạn.`
      : `${N(p!)} nằm viện ở quê đã một tuần. Bác sĩ ở đó làm hết sức, nhưng ${N(p!)} chỉ tin con mình. Chuyến về mất hai ngày, trạm của bạn không có người thay.`, [
      C(homeClinic(c) ? "Đóng phòng khám một tháng để chăm" : "Về ngay", { trust: { npc: p!, delta: 0.3 }, counters: { btn_field: -1 }, money: -0.1 }, "Ở bên cha mẹ, bệnh nhân không có ai khám"),
      C("Gọi video mỗi ngày, bàn bạc với bác sĩ ở đó", { trust: { npc: p!, delta: -0.05 }, bw: -3 }, "Giữ việc, lòng ở hai nơi"),
      C("Nhờ đồng nghiệp cũ ở bệnh viện trông giúp", { gamble: { p: 0.6, win: { trust: { npc: p!, delta: 0.15 }, log: `Bạn cũ ghé thăm mỗi chiều. ${N(p!)} khoe với cả phòng bệnh.` }, lose: { log: "Bạn cũ bận, ghé được một lần." } } }, "Dựa vào bạn bè, không phải lúc nào cũng được", { tier: "awakened" })], 1, { npc: p! });
  }),
];

/* ======================================================================
 * NHÀ HOẠT ĐỘNG XÃ HỘI (activist) — tiền tố hdx_
 * Lý tưởng chung: đất đai, công nhân, môi trường, người khuyết tật. Không tổ chức thật, không đảng phái.
 * ==================================================================== */
const AC = "activist";
const group = (c: FactContext): string => (f(c, "hdx_cause_workers") ? "nhóm công nhân của bạn" : f(c, "hdx_cause_river") ? "nhóm giữ dòng sông" : f(c, "hdx_cause_land") ? "xóm giữ đất của bạn" : "nhóm của bạn");
const rival = (c: FactContext): string => (f(c, "hdx_cause_workers") ? "chủ xưởng" : f(c, "hdx_cause_river") ? "nhà máy" : f(c, "hdx_cause_land") ? "chủ dự án" : "phía bên kia");
const topic = (c: FactContext): string => (f(c, "hdx_cause_workers") ? "an toàn lao động" : f(c, "hdx_cause_river") ? "xả thải ra sông" : f(c, "hdx_cause_land") ? "đền bù đất" : "những điều nhóm bạn đòi suốt nhiều năm");

const ACTIVIST: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(AC, "hdx_t_petition", [11, 16], () => true, () => T("Lá đơn giờ ra chơi", "Trường cắt giờ nghỉ trưa xuống còn mười lăm phút để học thêm. Bạn viết một lá đơn, đi xin chữ ký từng lớp, được hơn ba trăm chữ ký. Thầy hiệu trưởng gọi bạn lên phòng.", [
    C("Nộp đơn, đứng tên đầu tiên", { flags: [talentFlag(AC)], counters: { talents_seen: 1 }, gamble: { p: 0.5, win: { happy: 4, log: "Giờ nghỉ trưa trở lại ba mươi phút." }, lose: { happy: -2, log: "Lá đơn bị cất vào ngăn kéo. Tên bạn bị ghi vào sổ." } } }, "Có thể bị ghi tên, học được cách tập hợp"),
    C("Rút đơn, xin lỗi thầy", { counters: { talents_seen: 1 }, happy: -1 })], 1)),
  talent(AC, "hdx_t_ramp", [9, 15], () => true, () => T("Bạn cùng bàn ngồi xe lăn", "Lớp bạn chuyển lên tầng hai; bạn cùng bàn ngồi xe lăn phải học nhờ ở thư viện tầng một. Bạn rủ ba đứa khiêng xe lên mỗi sáng, nhưng biết thế không thể kéo dài mãi.", [
    C("Rủ cả lớp viết thư xin trường làm lối dốc", { flags: [talentFlag(AC)], counters: { talents_seen: 1 }, gamble: { p: 0.4, win: { happy: 4, log: "Hè năm đó, trường đổ một lối dốc xi măng bên hông cầu thang." }, lose: { log: "Trường hứa để năm sau." } } }, "Tốn công, có thể đổi được cả trường"),
    C("Cứ khiêng xe mỗi sáng", { counters: { talents_seen: 1 }, rel: 2, health: -1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(AC, "hdx_d_eviction", [18, 60], () => true, () => T("Giấy báo thu hồi đất", "Cả xóm nhận giấy báo thu hồi đất để làm khu nghỉ dưỡng. Tiền đền bù chỉ bằng một phần năm giá thị trường. Hàng xóm họp ở nhà bạn, và ai cũng nhìn bạn.", [
    C("Đứng ra làm người đại diện cho cả xóm", { ...become(AC), counters: { doors_seen: 1, hdx_base: 2 }, bw: -5, flags: ["hdx_cause_land"] }, "Gánh việc chung, thành người bị để ý"),
    C("Nhận đền bù sớm, dọn đi", { counters: { doors_seen: 1 }, money: 0.3, close_doors: ["village_trust"], happy: -3 }, "Có tiền ngay, mất cả xóm"),
    C("Góp tiền thuê luật sư, không đứng tên", { counters: { doors_seen: 1 }, money: -0.05, rel: 2 }, "Giúp được phần nào, giữ mình an toàn")], 2)),
  door(AC, "hdx_d_line", [18, 45], (c) => c.worker || f(c, "job_factory"), () => T("Người ngất trên chuyền", "Một chị cùng chuyền ngất vì nóng; xưởng không có quạt, tăng ca mười hai tiếng. Quản đốc bảo ai kêu thì nghỉ. Mấy người rủ bạn viết đơn tập thể, vì bạn viết chữ đẹp và nói năng mạch lạc nhất.", [
    C("Viết đơn, đứng tên đầu", { ...become(AC), counters: { doors_seen: 1, hdx_heat: 1 }, flags: ["hdx_cause_workers"] }, "Có thể mất việc, có tiếng nói"),
    C("Viết giúp, không ký tên", { counters: { doors_seen: 1 }, rel: 2, gamble: { p: 0.3, win: { ...become(AC), flags: ["hdx_cause_workers"], log: "Đơn được chấp nhận một nửa. Công nhân xưởng khác tìm đến hỏi người viết." }, lose: { log: "Đơn bị bỏ qua. Không ai biết bạn viết." } } }, "An toàn hơn, có thể không ai biết"),
    C("Im lặng, giữ việc", { counters: { doors_seen: 1 }, happy: -2 })], 2)),
  door(AC, "hdx_d_river", [18, 60], () => true, () => T("Dòng sông đổi màu", "Con sông sau nhà đổi màu từ khi nhà máy mới ở thượng nguồn chạy được ba tháng. Cá chết trắng một đoạn dài. Bạn có một chiếc điện thoại và một trang mạng ba nghìn người theo dõi.", [
    C("Quay video, lập nhóm giám sát dòng sông", { ...become(AC), counters: { doors_seen: 1, hdx_base: 1, hdx_heat: 1 }, flags: ["hdx_cause_river"] }, "Lên tiếng sớm, bị nhà máy để ý"),
    C("Gửi mẫu nước đi xét nghiệm, chờ kết quả", { counters: { doors_seen: 1 }, money: -0.03, gamble: { p: 0.5, win: { ...become(AC), flags: ["hdx_cause_river", "hdx_evidence"], log: "Kết quả: chất độc vượt ngưỡng mười lần. Bạn không im lặng được nữa." }, lose: { log: "Kết quả mơ hồ. Mùa sau cá lại về, ít hơn." } } }, "Chắc chắn hơn, chậm hơn", { tier: "awakened" }),
    C("Không phải việc của mình", { counters: { doors_seen: 1 }, health: -1 })], 2)),

  /* ---------- mạch truyện ---------- */
  beat(AC, 1, 1, (c) => T("Phòng khách hai mươi người", "Hai mươi người đến cuộc họp đầu tiên, ngồi chật phòng khách nhà bạn. Một nửa muốn xuống đường ngay tuần sau; nửa kia muốn làm đơn đúng thủ tục. Ai cũng nhìn bạn.", [
    C("Làm đơn, đi đúng thủ tục trước", { counters: step(c, AC, { hdx_base: 1 }), flags: ["hdx_by_the_book"] }, "Chậm và an toàn, người nóng ruột bỏ đi"),
    C("Xuống đường ngay tuần sau", { counters: step(c, AC, { hdx_heat: 2 }), flags: ["hdx_street"], gamble: { p: 0.5, win: { counters: { hdx_base: 2 }, log: "Hai trăm người đến. Báo địa phương đưa tin." }, lose: { counters: { hdx_base: -1 }, log: "Ba mươi người đến, bị giải tán sau mười phút." } } }, "Nhanh và ồn, có thể bị dập sớm"),
    C("Chia việc: nhóm làm đơn, nhóm thu bằng chứng", { counters: step(c, AC, { hdx_base: 1 }), flags: ["hdx_evidence"], bw: -3 }, "Chắc tay, mất nhiều tháng", { tier: "awakened" })], 0), (c) => c.age >= 18),

  beat(AC, 2, 3, (c) => T("Quỹ tài trợ ba năm", `Chuyện của ${group(c)} lên báo. Một quỹ lớn đề nghị tài trợ ba năm: lương cho năm người làm toàn thời gian, văn phòng, máy tính. Đổi lại phải báo cáo theo mẫu của họ và ưu tiên những vấn đề "dễ gây quỹ".`, [
    C("Nhận tài trợ, làm chuyên nghiệp", { counters: step(c, AC, { hdx_base: -1 }), flags: ["hdx_funded"], income_mult: 1.5 }, "Có lương, có văn phòng, xa dần người trong cuộc"),
    C("Từ chối, sống bằng đóng góp nhỏ", { counters: step(c, AC, { hdx_base: 2 }), money: -0.05, bw: -4 }, "Tự do, nghèo, mệt", { longterm: true }),
    C("Lập liên minh nhiều nhóm, cùng nhận và cùng quyết", { counters: step(c, AC), flags: ["hdx_coalition"], agency: 0.03, gamble: { p: 0.5, win: { income_mult: 1.2, counters: { hdx_base: 1 }, log: "Sáu nhóm ký chung một bản điều lệ. Quỹ chịu làm việc với cả liên minh." }, lose: { log: "Các nhóm cãi nhau về cách chia tiền. Quỹ rút lời mời." } } }, "Mạnh và độc lập hơn, nếu không vỡ trước", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(AC, 3, 4, (c) => T("Phong bì trên bàn ăn", `Đại diện ${rival(c)} mời bạn ăn tối. Họ đặt lên bàn một phong bì bằng năm năm thu nhập của bạn và một bản cam kết: bạn rút khỏi mọi đơn từ, đổi lại nhóm sẽ được "hỗ trợ" một phần.${cnt(c, "hdx_heat") >= 3 ? " Tuần trước có người đi theo xe bạn về tận nhà." : ""}${f(c, "hdx_funded") ? " Quỹ tài trợ vừa báo không gia hạn." : ""}`, [
    C("Nhận phong bì, rút lui", { counters: step(c, AC), ...leave(AC), money: 1.5, flags: ["hdx_sold_out"], close_doors: ["village_trust"], secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [2, 8], note: "nhận phong bì để rút khỏi cuộc đấu tranh" } }, "Đổi đời, phụ lòng những người tin mình"),
    C("Từ chối, đi tiếp", { counters: step(c, AC, { hdx_heat: 2 }), flags: ["hdx_refused_offer"] }, "Giữ mình, rủi ro tăng"),
    C("Ghi âm buổi gặp rồi công khai", { counters: step(c, AC), gamble: { p: 0.5, win: { counters: { hdx_base: 3 }, flags: ["hdx_exposed_offer"], log: "Đoạn ghi âm lan khắp nơi. Phía bên kia phải xin lỗi công khai." }, lose: { counters: { hdx_heat: 3 }, flags: ["hdx_sued"], log: "Họ kiện bạn tội vu khống. Vụ kiện kéo dài nhiều năm." } } }, "Có thể lật thế cờ, có thể bị kiện", { tier: "awakened" }),
    C("Mang bản cam kết về cho cả nhóm biểu quyết", { counters: step(c, AC, { hdx_base: 1 }), agency: 0.03, gamble: { p: 0.5, win: { flags: ["hdx_collective_deal"], log: "Cả nhóm đòi đền bù cho mọi người, không cho riêng ai. Phía bên kia chấp nhận một nửa." }, lose: { counters: { hdx_base: -2 }, log: "Nhóm chia rẽ: một nửa muốn nhận tiền, nửa kia trách bạn đã mang về." } } }, "Để mọi người cùng quyết, có thể vỡ nhóm", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(AC, 4, 5, (c) => (f(c, "hdx_sued") || cnt(c, "hdx_heat") >= 4)
    ? T("Giấy triệu tập", `Bạn nhận giấy triệu tập vì ${f(c, "hdx_sued") ? "vụ kiện vu khống" : "tội gây rối trật tự công cộng"}. Luật sư nói nếu bạn ký cam kết ngừng hoạt động, mọi chuyện sẽ khép lại.${f(c, "hdx_coalition") ? " Các nhóm trong liên minh hỏi họ có thể làm gì." : ""}`, [
      C("Ký cam kết, ngừng hoạt động", { counters: step(c, AC), ...leave(AC), flags: ["hdx_signed_pledge"], happy: -5 }, "Yên thân, bỏ lại việc dở dang"),
      C("Ra tòa, tự bào chữa", { counters: step(c, AC), money: -0.3, gamble: { p: 0.4, win: { counters: { hdx_base: 3 }, flags: ["hdx_acquitted"], log: "Tòa bác đơn. Người đứng chật ngoài cổng tòa." }, lose: { health: -6, money: -0.3, close_doors: ["clean_record"], flags: ["hdx_convicted"], log: "Bạn bị tuyên có tội, án treo. Nhóm vẫn họp mỗi tuần." } } }, "Giữ lý lẽ, có thể mang án"),
      C("Mời các nhóm khác cùng đứng ra làm chứng", { counters: step(c, AC, { hdx_base: 1 }), agency: 0.03, gamble: { p: f(c, "hdx_coalition") ? 0.65 : 0.35, win: { flags: ["hdx_acquitted"], log: "Mười hai nhóm gửi lời chứng. Vụ việc được rút lại." }, lose: { counters: { hdx_heat: 1 }, log: "Ít người dám đứng ra. Vụ việc kéo dài thêm một năm." } } }, "Không đơn độc, kéo người khác vào rủi ro", { tier: "sovereign" })], 1)
    : T("Chiếc ghế trong ban soạn thảo", `${f(c, "hdx_exposed_offer") ? "Sau vụ đoạn ghi âm, không ai còn coi nhóm bạn là chuyện nhỏ." : f(c, "hdx_collective_deal") ? "Thỏa thuận chung năm nào thành hình mẫu cho nhiều nơi." : cnt(c, "hdx_base") >= 4 ? "Nhóm của bạn giờ có hàng nghìn người." : "Sau nhiều năm, người ta bắt đầu nghe."} Chính quyền mời bạn vào ban soạn thảo quy định mới về ${topic(c)}. Có lương, có ghế, và phải ký vào văn bản cuối cùng dù nó không như bạn muốn.`, [
      C("Vào ban soạn thảo, sửa từ bên trong", { counters: step(c, AC, { hdx_base: -1 }), flags: ["hdx_insider"], income_mult: 1.3 }, "Có quyền sửa chữ, mất quyền phản đối"),
      C("Ở ngoài, tiếp tục gây sức ép", { counters: step(c, AC, { hdx_base: 1, hdx_heat: 1 }), flags: ["hdx_outsider"] }, "Giữ tiếng nói độc lập, ít kết quả trên giấy"),
      C("Đòi một ghế cho chính người bị ảnh hưởng", { counters: step(c, AC), agency: 0.03, gamble: { p: 0.5, win: { flags: ["hdx_people_seat"], counters: { hdx_base: 2 }, log: "Lần đầu tiên, người trong cuộc ngồi cùng bàn với người soạn luật." }, lose: { log: "Lời mời bị rút lại. Ban soạn thảo họp mà không có ai trong nhóm." } } }, "Mở cửa cho người trong cuộc, có thể mất cả ghế", { tier: "sovereign" })], 1), (c) => c.age >= 18),

  beat(AC, 5, 6, (c) => T("Bộ phim về những năm ấy", `Một nhóm sinh viên làm phim tài liệu về ${group(c)} năm xưa. Họ muốn bạn kể cả những điều chưa ai biết:${f(c, "hdx_funded") ? " những bản báo cáo viết cho vừa ý nhà tài trợ," : ""}${f(c, "hdx_insider") ? " những điều khoản bạn đã ký dù không muốn," : ""}${f(c, "hdx_convicted") ? " cái án vẫn nằm trong hồ sơ," : ""} những người đã bỏ đi giữa chừng.`, [
    C("Kể hết, cả những lần mình sai", { counters: step(c, AC, { hdx_base: 1 }), flags: ["hdx_told_all"], happy: 3, rel: -1 }, "Thật lòng, vài người cũ sẽ giận"),
    C("Chỉ kể những gì đã làm được", { counters: step(c, AC), rel: 2 }, "Đẹp lòng mọi người, bài học bị cắt"),
    C("Giao toàn bộ hồ sơ cho nhóm trẻ tự kể", { counters: step(c, AC), flags: ["hdx_archive_passed"], agency: 0.02 }, "Để thế hệ sau tự hiểu, mất quyền kể chuyện mình")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(AC, "hdx_watched", [18, 75], 7, (c) => T("Chiếc xe đậu đầu ngõ", vary("hdxw", c.age, [
    "Một chiếc xe không biển số đậu đầu ngõ nhà bạn ba ngày liền. Người nhà bạn bắt đầu đi chợ đường vòng.",
    "Điện thoại của bạn bắt đầu có tiếng lạ mỗi khi gọi. Mấy người trong nhóm ngại nhắn tin cho bạn."]), [
    C("Đổi lịch đi lại, cẩn thận hơn", { bw: -3, counters: { hdx_heat: -1 } }, "An toàn hơn, sống như bị săn"),
    C("Chụp ảnh đăng lên mạng", { counters: { hdx_heat: 1, hdx_base: 1 }, gamble: { p: 0.5, win: { log: "Chiếc xe biến mất sau hai giờ." }, lose: { bw: -4, log: "Hôm sau có hai chiếc." } } }, "Ánh sáng là lá chắn, hoặc là lời thách"),
    C("Lập nhóm hàng xóm đi cùng nhau mỗi tối", { agency: 0.02, counters: { hdx_base: 1 }, rel: 2 }, "Không ai đi một mình, kéo người khác vào", { tier: "sovereign" })], 0)),

  daily(AC, "hdx_burnout", [20, 75], 7, () => T("Bốn cuộc họp một ngày", "Một ngày bạn có bốn cuộc họp, hai trăm tin nhắn, một cuộc phỏng vấn. Đã sáu tuần bạn không ăn bữa tối nào ở nhà. Đêm qua tim bạn đập loạn nhịp lúc ba giờ sáng.", [
    C("Nghỉ một tháng, tắt điện thoại", { health: 5, bw: 6, counters: { hdx_base: -1 } }, "Hồi sức, nhóm chững lại"),
    C("Uống cà phê, làm tiếp", { health: -5, counters: { hdx_base: 1 } }, "Không ai bị bỏ rơi, trừ bạn"),
    C("Chia quyền cho ba người trẻ trong nhóm", { agency: 0.02, bw: 4, flags: ["hdx_delegated"], gamble: { p: 0.6, win: { counters: { hdx_base: 1 }, log: "Ba người trẻ làm khác bạn, có việc làm tốt hơn." }, lose: { counters: { hdx_base: -1 }, log: "Một người làm hỏng việc lớn. Bạn phải gỡ lại." } } }, "Nhóm lớn lên, bạn mất quyền kiểm soát", { tier: "awakened" })], 1)),

  daily(AC, "hdx_celebrity", [20, 75], 8, () => T("Người nổi tiếng muốn tham gia", "Nhóm chia hai phe: một phe muốn mời một người nổi tiếng trên mạng làm gương mặt chiến dịch, phe kia sợ người đó nói sai, làm hỏng việc. Người ấy có hai triệu người theo dõi.", [
    C("Mời người nổi tiếng", { counters: { hdx_base: 2 }, gamble: { p: 0.5, win: { log: "Chiến dịch lan khắp nơi. Người nổi tiếng nói đúng từng chữ." }, lose: { counters: { hdx_base: -3 }, log: "Người đó phát ngôn sai một câu. Cả nhóm bị chế giễu cả tháng." } } }, "Lan nhanh, có thể vỡ lớn"),
    C("Không, để người trong cuộc làm gương mặt", { counters: { hdx_base: 1 }, flags: ["hdx_own_voices"] }, "Chậm mà đúng"),
    C("Để hai phe biểu quyết công khai", { agency: 0.01, bw: -2, counters: { hdx_base: 1 } }, "Mọi người cùng quyết, bên thua có thể bỏ đi", { tier: "awakened" })], 1)),

  daily(AC, "hdx_misquote", [20, 75], 8, () => T("Câu nói bị cắt đôi", "Một tờ báo đăng câu bạn nói, cắt mất nửa sau. Giờ trên mạng ai cũng nghĩ bạn kêu gọi đập phá. Phóng viên không trả lời tin nhắn.", [
    C("Đăng toàn bộ đoạn ghi âm phỏng vấn", { counters: { hdx_base: 1 }, gamble: { p: 0.6, win: { log: "Người ta nghe hết và hiểu. Tờ báo phải đính chính." }, lose: { counters: { hdx_heat: 1 }, log: "Không ai nghe đoạn dài. Câu bị cắt vẫn lan nhanh hơn." } } }, "Có thể minh oan, có thể chẳng ai nghe"),
    C("Kiện tờ báo", { money: -0.1, counters: { hdx_heat: 1 }, flags: ["hdx_sued_paper"] }, "Đòi công bằng, tốn tiền, mất lòng báo giới"),
    C("Im lặng, chờ chuyện qua", { happy: -3, counters: { hdx_base: -1 } }, "Không đổ thêm dầu vào lửa, mang tiếng oan")], 0)),

  daily(AC, "hdx_face", [20, 75], 8, () => T("Người không muốn lộ mặt", "Câu chuyện của một bà cụ mất nhà là thứ khiến người xem rơi nước mắt. Đài truyền hình muốn quay mặt bà; bà xin chỉ nói khi quay sau lưng, vì sợ con cháu bị làm khó.", [
    C("Thuyết phục bà lộ mặt", { counters: { hdx_base: 2 }, gamble: { p: 0.5, win: { log: "Phóng sự được xem rộng rãi. Bà nhận được nhiều thư động viên." }, lose: { counters: { hdx_base: -2 }, flags: ["hdx_source_hurt"], log: "Con trai bà bị cho nghỉ việc một tháng sau." } } }, "Chiến dịch mạnh, bà gánh rủi ro"),
    C("Giữ đúng ý bà, chỉ quay sau lưng", { counters: { hdx_base: 1 }, flags: ["hdx_protects_sources"] }, "Tôn trọng, phóng sự kém sức nặng"),
    C("Tự mình đứng ra kể thay bà", { counters: { hdx_heat: 1 }, agency: 0.01 }, "Bạn gánh thay, mất giọng của người trong cuộc")], 1)),

  daily(AC, "hdx_ledger", [22, 75], 9, () => T("Lời đồn về tiền quyên góp", "Có tin đồn bạn tiêu riêng tiền quyên góp. Bạn không làm, nhưng cả năm qua chỉ có mình bạn giữ sổ và chìa khóa két.", [
    C("Đăng toàn bộ sổ sách, mời ai cũng vào kiểm", { agency: 0.02, counters: { hdx_base: 2 }, flags: ["hdx_open_books"], bw: -3 }, "Minh bạch, lộ cả những khoản chi vụng", { tier: "sovereign" }),
    C("Kiện người tung tin", { money: -0.1, counters: { hdx_heat: 1 } }, "Đòi lại danh dự, nghe như che giấu"),
    C("Lờ đi, làm việc tiếp", { counters: { hdx_base: -2 } }, "Đỡ tốn sức, tin đồn ở lại")], 0)),

  daily(AC, "hdx_stairs", [20, 75], 8, () => T("Ba tầng cầu thang", "Buổi lấy ý kiến người dân tổ chức ở tầng ba tòa nhà hành chính, không có thang máy. Chị đồng sự ngồi xe lăn là người viết phần lớn bản kiến nghị.", [
    C("Khiêng chị lên", { counters: { hdx_base: 1 }, happy: -1, gamble: { p: 0.5, win: { log: "Chị lên được, đọc bản kiến nghị trước hội trường." }, lose: { log: "Chị lên được nhưng cả buổi không nói gì, mắt nhìn xuống." } } }, "Kịp buổi họp, chị mất thể diện"),
    C("Đòi chuyển buổi họp xuống tầng một", { agency: 0.02, counters: { hdx_heat: 1 }, gamble: { p: 0.5, win: { flags: ["hdx_access_win"], log: "Buổi họp dời xuống sân. Từ đó mọi buổi lấy ý kiến đều ở tầng trệt." }, lose: { log: "Họ từ chối. Bản kiến nghị được đọc qua điện thoại." } } }, "Đổi luật chơi, có thể lỡ buổi họp", { tier: "sovereign" }),
    C("Tẩy chay buổi họp", { counters: { hdx_base: -1, hdx_heat: 1 } }, "Giữ nguyên tắc, mất tiếng nói hôm đó")], 1)),

  daily(AC, "hdx_fund_dry", [20, 70], 8, (c) => T("Quỹ cạn ngày thứ chín", `Ngày thứ chín ${f(c, "hdx_cause_workers") ? "của cuộc đình công" : "của đợt bám trụ"}, quỹ chung cạn. Ba mươi gia đình không còn gạo. Phía bên kia biết, và đang chờ.`, [
    C("Dừng lại, đàm phán với những gì đang có", { counters: { hdx_base: -1 }, flags: ["hdx_settled_early"] }, "Mọi người có cơm, mất thế mặc cả"),
    C("Vay tiền riêng để cầm cự", { custom: "borrow:0.5", counters: { hdx_base: 2 } }, "Giữ được thế, bạn gánh nợ"),
    C("Kêu gọi các xóm, các xưởng khác góp gạo", { agency: 0.02, gamble: { p: 0.55, win: { counters: { hdx_base: 3 }, log: "Gạo về từ bốn hướng. Ngày thứ mười hai, phía bên kia ngồi xuống bàn." }, lose: { counters: { hdx_base: -1 }, log: "Gạo về ít. Ngày thứ mười một, mọi người tự giải tán." } } }, "Nhân sức mạnh lên, có thể không ai đến", { tier: "sovereign" })], 0)),

  daily(AC, "hdx_night_held", [20, 70], 9, () => T("Một đêm bị tạm giữ", "Sau buổi tụ tập, bạn bị giữ qua đêm. Sáng ra, người ta đưa bạn tờ khai: ký tên, ghi tên những người tổ chức, rồi được về.", [
    C("Ký, ghi đủ tên", { flags: ["hdx_named_names"], counters: { hdx_base: -3 }, close_doors: ["village_trust"] }, "Về nhà ngay, nhóm không còn tin bạn"),
    C("Không ký", { health: -4, counters: { hdx_heat: 2, hdx_base: 2 }, bw: -4 }, "Giữ người, mất thêm vài ngày tự do"),
    C("Chỉ ghi tên mình, nhận mình là người tổ chức", { counters: { hdx_heat: 2, hdx_base: 3 }, agency: 0.02, health: -2 }, "Che cho người khác, gánh hết về mình", { tier: "sovereign" })], 1)),

  daily(AC, "hdx_csr_offer", [28, 60], 99, () => T("Ghế trách nhiệm xã hội", "Một tập đoàn lớn mời bạn làm giám đốc trách nhiệm xã hội, mỗi tháng trả bằng nửa năm thu nhập hiện giờ của bạn. Họ nói cần một người \"hiểu cộng đồng\". Bạn vừa nhận thông báo nợ tiền nhà.", [
    C("Nhận lời", { ...leave(AC), flags: ["ex_activist", "hdx_corporate"], money: 0.4 }, "Hết lo tiền, người cũ gọi bạn là kẻ đổi phe"),
    C("Từ chối", { happy: 1, counters: { hdx_base: 1 } }, "Giữ mình, vẫn nợ tiền nhà"),
    C("Nhận, nếu được ghi quyền công bố báo cáo độc lập", { agency: 0.03, gamble: { p: 0.35, win: { ...leave(AC), flags: ["hdx_corporate", "hdx_inside_voice"], money: 0.3, log: "Họ đồng ý. Báo cáo năm đầu của bạn làm cả ngành chú ý." }, lose: { log: "Họ rút lời mời. Bạn vẫn là bạn, vẫn nợ tiền nhà." } } }, "Đổi phe có điều kiện, họ có thể rút", { tier: "sovereign" })], 1), (c) => c.broke || c.happy < 45),

  daily(AC, "hdx_neighbor_signed", [20, 75], 9, (c, N) => { const n = role(c, "neighbor")!; return T("Người ký riêng", `${N(n)} lặng lẽ ký thỏa thuận riêng với ${rival(c)}, rồi đi nói với mọi người rằng bạn "làm to chuyện để nổi tiếng". Ba nhà nữa đang lung lay.`, [
    C(`Nói thẳng với cả xóm về ${N(n)}`, { counters: { hdx_base: 1 }, memory: { npc: n, tag: "HUMILIATED_ME", weight: -0.3, note: "bị nói thẳng trước cả xóm chuyện ký riêng" } }, "Giữ hàng ngũ, có thêm một kẻ thù"),
    C(`Đến nhà ${N(n)} hỏi vì sao`, { gamble: { p: 0.5, win: { memory: { npc: n, tag: "WIN_WIN_DEAL", weight: 0.2, note: "nói chuyện thẳng thắn sau vụ ký riêng" }, log: `${N(n)} kể nhà đang nợ tiền chữa bệnh. Nhóm góp giúp một ít, ${N(n)} quay lại họp.` }, lose: { trust: { npc: n, delta: -0.2 }, log: `${N(n)} đóng cửa, không nói gì.` } } }, "Hiểu nhau hoặc mất nhau", { tier: "awakened" }),
    C("Kệ, mỗi người một lựa chọn", { counters: { hdx_base: -1 } }, "Không gây thù, nhóm mỏng đi")], 1, { npc: n }); }, (c) => !!role(c, "neighbor")),

  /* ---------- gia đình ---------- */
  cross(AC, "hdx_family", [22, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    const me = c.sex === "F" ? "mẹ" : "bố";
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị trêu ở trường`, `${N(k)} về nhà, đóng sầm cửa. Ở trường, bạn bè gọi ${N(k)} là "con nhà gây rối", vài thầy cô cũng nhìn khác. ${N(k)} hỏi sao ${me} không sống như ${me} của người ta.`, [
      C(`Đưa ${N(k)} đi cùng một buổi họp nhóm`, { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} ngồi nghe đến cuối, về nhà hỏi bạn thêm cả tối.` }, lose: { trust: { npc: k, delta: -0.1 }, log: `${N(k)} ngồi bấm điện thoại suốt buổi.` } } }, "Cho con thấy, có thể con càng xa"),
      C("Lùi lại một năm vì gia đình", { trust: { npc: k, delta: 0.2 }, counters: { hdx_base: -2 } }, "Con yên ổn, phong trào chững lại"),
      C(`Hỏi ${N(k)} muốn ${me} làm gì`, { trust: { npc: k, delta: 0.15 }, agency: 0.01, promise: { to: k, what: "không để việc nhóm lấn vào bữa tối của con", years: 2 } }, "Lắng nghe con, phải giữ lời hứa", { tier: "awakened" })], 2, { npc: k });
    if (c.married && s) return T("Nhà không phải văn phòng", `${N(s)} dọn đống băng rôn khỏi phòng khách lần thứ ba trong tháng: "Nhà mình không phải văn phòng của cả xóm." Tối qua có người lạ gọi đến nhà lúc nửa đêm.`, [
      C("Thuê một phòng nhỏ làm chỗ họp nhóm", { money: -0.1, trust: { npc: s, delta: 0.2 } }, "Nhà yên, tốn tiền"),
      C("Bảo đây là việc lớn, mong được thông cảm", { trust: { npc: s, delta: -0.2 }, counters: { hdx_base: 1 } }, "Việc chung chạy, nhà lạnh dần"),
      C(`Rủ ${N(s)} cùng tham gia, chia một phần việc`, { gamble: { p: 0.45, win: { trust: { npc: s, delta: 0.3 }, log: `${N(s)} nhận giữ sổ quỹ, làm cẩn thận hơn bạn.` }, lose: { trust: { npc: s, delta: -0.1 }, log: `${N(s)} đến một buổi, bảo không hợp.` } } }, "Thành đồng đội, hoặc thêm một lần thất vọng", { tier: "awakened" })], 0, { npc: s });
    return T(`${N(p!)} bị làm khó`, `${N(p!)} bị người ta gây khó ở chỗ làm vì "con cái không biết điều". ${N(p!)} không trách, chỉ dặn: "Con làm gì thì làm, đừng để cha mẹ biết qua báo."`, [
      C(`Về kể hết cho ${N(p!)} nghe`, { trust: { npc: p!, delta: 0.2 }, bw: -1 }, "Gần nhau hơn, cha mẹ lo thêm"),
      C("Giấu, để cha mẹ yên", { trust: { npc: p!, delta: -0.1 }, happy: -2 }, "Đỡ lo trước mắt, xa nhau dần"),
      C(`Mời ${N(p!)} đến một buổi gặp người trong xóm`, { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.3 }, log: `${N(p!)} ngồi nghe một bà cụ kể chuyện mất nhà, về đến nhà vẫn chưa nói được gì.` }, lose: { trust: { npc: p!, delta: -0.1 }, log: `${N(p!)} bảo con lo chuyện thiên hạ hơn chuyện nhà.` } } }, "Cho cha mẹ thấy tận mắt, có thể càng lo", { tier: "awakened" })], 0, { npc: p! });
  }),
];

export const PACK_SERVE_A: Storylet[] = [...MONK, ...PRIEST, ...AID_DOCTOR, ...ACTIVIST];
