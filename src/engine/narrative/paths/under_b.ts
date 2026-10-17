/**
 * Gói "Thế giới ngầm" (under_b): bốn con đường — con bạc, kẻ làm hàng giả, hacker, người từng ở tù.
 * Viết như phim tài liệu: cái giá đạo đức, nạn nhân, gia đình, công an, nhà tù, hoàn lương.
 * KHÔNG mô tả cách làm (không quy trình, không kỹ thuật). Nội dung gốc, không chép tác phẩm hay người thật.
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

/* ================================================================== CON BẠC (gambler) · gb_ */
const Pg = "gambler";
const GAMBLER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(Pg, "gb_t_cards", [10, 15], () => true, (c) => T("Đứa trẻ nhớ bài",
    c.country === "VN"
      ? "Mấy ông trong xóm chơi tổ tôm mấy ngày Tết, bạn đứng sau lưng, đọc vanh vách ai còn quân gì. Có người bảo bạn có con mắt nhìn bài; có người bảo trẻ con không nên đứng ở chiếu bạc."
      : "Người lớn trong nhà bày bài ăn tiền mỗi tối, bạn đứng xem và đoán trúng gần hết. Có người khen bạn nhớ bài giỏi; có người kéo bạn ra, bảo đây không phải chỗ cho trẻ con.", [
    C("Xin học chơi vài ván cho biết", { money: -0.02, flags: [talentFlag(Pg)], counters: { talents_seen: 1 }, happy: 2 }, "Mở một con đường, nhà không thích"),
    C("Tránh xa chiếu bạc", { counters: { talents_seen: 1 }, happy: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(Pg, "gb_d_backroom", [18, 40], () => true, () => T("Chiếu bạc sau quán",
    "Một người quen rủ bạn vào ván bài sau quán nước, nói ở đó toàn tay chơi thật, tiền thật. Đêm đầu bạn thắng đủ tiền một tuần làm.", [
    C("Theo hẳn con đường này", { ...become(Pg), counters: { doors_seen: 1 }, money: 0.08, happy: 4 }, "Tiền nhanh, bắt đầu một cơn nghiện"),
    C("Thỉnh thoảng chơi cho vui", { counters: { doors_seen: 1 }, money: 0.02 }),
    C("Không quay lại nữa", { counters: { doors_seen: 1 }, happy: 1 })], 0)),
  door(Pg, "gb_d_online", [18, 45], (c) => !c.poor_country || f(c, talentFlag(Pg)), () => T("Trang cá độ trên mạng",
    "Quảng cáo một trang cá độ hiện lên mọi nơi bạn lướt. Họ tặng tiền cho người mới, và cửa nào cũng mở hai bốn trên hai bốn. Bạn thử một ván nhỏ, rồi thấy khó dừng.", [
    C("Lấy đây làm nghề kiếm tiền", { ...become(Pg), counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { money: 0.15, log: "Tháng đầu bạn thắng, và tin rằng mình khác người." }, lose: { money: -0.1, happy: -3, log: "Tháng đầu bạn đã nợ tiền ứng của trang." } } }, "Cược cả nếp sống vào màn hình"),
    C("Xóa ứng dụng, tự chặn", { counters: { doors_seen: 1 }, happy: 2, flags: ["gb_self_banned"] }, "Khó chịu vài hôm, giữ được mình")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(Pg, 1, 1, (c) => T("Ván đầu cầm tiền thật",
    "Lần đầu bạn ngồi vào chiếu với tiền của chính mình, không phải tiền lẻ. Thắng ba ván liền, trong túi gấp đôi lúc đến. Có một thứ ấm lên trong ngực mà bạn sẽ còn đi tìm lại rất lâu.", [
    C("Đứng dậy khi đang thắng", { counters: step(c, Pg), money: 0.08, know: 3, happy: 3 }, "Giữ tiền, bỏ lỡ cảm giác"),
    C("Chơi tiếp cho đã tay", { counters: step(c, Pg, { gamble: 1 }), gamble: { p: 0.45, win: { money: 0.2, happy: 5, log: "Bạn về nhà lúc hai giờ sáng, thắng đậm." }, lose: { money: -0.15, happy: -4, log: "Bạn trả lại hết, cộng thêm tiền xe về." } } }, "Cảm giác bây giờ, có thể mất sạch")], 0), (c) => c.age >= 18),
  beat(Pg, 2, 3, (c) => T("Nghề hay cơn nghiện",
    "Bạn bắt đầu tính cờ bạc như một công việc: giờ giấc, vốn liếng, giới hạn thua. Nhưng mỗi lần thua, một giọng trong đầu lại bảo chỉ cần một ván nữa là gỡ hết.", [
    C("Lập kỷ luật, chơi như một nghề", { counters: step(c, Pg), flags: ["gb_discipline"], income_mult: 1.3, bw: -4 }, "Đều hơn, vẫn là cờ bạc", { longterm: true }),
    C("Vay tiền để chơi ván lớn", { counters: step(c, Pg, { gamble: 1 }), custom: "borrow:0.5", flags: ["gb_borrowed"], income_mult: 1.6 }, "Có thể giàu nhanh, nợ đè vai"),
    C("Sang bên nhà cái, làm người tổ chức", { counters: step(c, Pg), flags: ["gb_house"], income_mult: 1.5, agency: 0.02, close_doors: ["clean_record"] }, "Hết rủi ro ván bài, dính pháp lý", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(Pg, 3, 4, (c) => T("Đêm thua không đáy",
    f(c, "gb_borrowed") ? "Một đêm mọi cửa đều sai. Tiền vay, tiền vốn, tiền để dành của nhà — bạn đẩy hết lên chiếu để gỡ, và mất hết. Trời sáng mà bạn không dám về."
      : "Một đêm mọi cửa đều sai. Bạn thua đến đồng cuối cùng trong ví, rồi thua cả số tiền chưa có. Trời sáng mà bạn ngồi lại trong quán, không dám về.", [
    C("Dừng lại, thú nhận với người nhà", { counters: step(c, Pg, { honest: 1, gamble: -2 }), custom: "borrow:0.4", happy: -6, rel: -4, log: "Bạn kể hết. Nhà im lặng rất lâu, rồi cùng gánh." }, "Nhục một lần, giữ được mình", { longterm: true }),
    C("Vay nóng của người cho vay nặng lãi", { counters: step(c, Pg, { gamble: 1 }), custom: "borrow:0.8", flags: ["gb_loanshark"], happy: -3, log: "Bạn ký một tờ giấy không dám đọc kỹ." }, "Gỡ được đêm nay, lãi mẹ đẻ lãi con"),
    C("Bỏ đi khỏi nơi này, làm lại từ đầu", { counters: step(c, Pg), ...leave(Pg), flags: ["left_home"], close_doors: ["return_home"], happy: -5, log: "Bạn rời đi trong buổi sáng ấy, bỏ lại cả bàn bạc lẫn những người quen." }, "Mất tất cả, thoát khỏi chiếu bạc")], 0), (c) => c.age >= 18),
  beat(Pg, 4, 5, (c) => { const loan = f(c, "gb_loanshark"); return T(loan ? "Người ta đến tìm" : "Bàn cao nhất", loan
    ? "Khoản vay nóng giờ gấp mấy lần lúc đầu. Mấy người lạ đứng trước cửa nhà, không nói to, chỉ nhìn. Họ nhắc giờ tan học của con bạn."
    : "Bạn được mời vào một ván giữa những tay chơi lớn nhất vùng. Có người kéo bạn ra một góc, đề nghị dàn xếp trước kết quả, chia đôi phần thắng chắc chắn.", [
    C(loan ? "Bán hết đồ đạc, gán nhà để trả" : "Chơi sòng phẳng, thắng thua chịu", { counters: step(c, Pg), money: loan ? -0.9 : 0.3, happy: loan ? -8 : 4, ...(loan ? { close_doors: ["inheritance"] } : {}) }, loan ? "Trả được nợ, trắng tay" : "Giữ danh dự, rủi ro thật"),
    C("Nhận lời dàn xếp một ván", { counters: step(c, Pg, { honest: -1 }), money: 0.6, income_mult: 1.1, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.5, fuse_years: [3, 10], note: "dàn xếp một ván bạc để ăn chắc" } }, "Tiền chắc, một bí mật chờ nổ"),
    C("Rời chiếu bạc, mở một quán nhỏ", { counters: step(c, Pg), ...leave(Pg), flags: ["ex_gambler"], happy: 3, agency: 0.02 }, "Bỏ nghề, nhẹ cả người", { tier: "sovereign" })], 0); }, (c) => c.age >= 18),
  beat(Pg, 5, 6, (c) => T("Người cuối chiếu bạc",
    (c.counters.gamble ?? 0) >= 6 ? "Về già, bạn đếm lại: căn nhà, mấy người thân, nhiều năm tháng — tất cả đã qua tay chiếu bạc. Một đứa trẻ hàng xóm vừa khoe nó thắng ván đầu, mắt sáng y như bạn ngày xưa."
      : "Về già, bạn vẫn còn một mái nhà nhờ biết dừng đúng lúc. Một người trẻ tìm đến, muốn bạn dạy cách 'chơi để thắng'.", [
    C("Khuyên nó đừng bao giờ ngồi vào", { counters: step(c, Pg), rel: 5, flags: ["gb_warned"], happy: 3 }),
    C("Dạy nó mánh của mình", { counters: step(c, Pg, { honest: -1 }), money: 0.1, rel: -2 }, "Có tiền, truyền lại cái nghiệp"),
    C("Kể hết mình đã mất những gì", { counters: step(c, Pg, { honest: 1 }), happy: 2, agency: 0.02, flags: ["gb_confessed"] }, "Nói ra sự thật, nhẹ lòng", { tier: "awakened" })], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(Pg, "gb_streak", [18, 60], 7, (c) => T("Đang lên", vary("gbs", c.age, [
    "Bốn đêm liền bạn thắng. Người ta bắt đầu gọi bạn là tay có số đỏ, và bạn cũng tin thế.",
    "Một chuỗi thắng dài khiến bạn thấy như mình đọc được cả ván bài trước khi lật."]), [
    C("Dồn hết đang khi đỏ", { counters: { gamble: 1 }, gamble: { p: 0.4, win: { money: 0.3, happy: 4, log: "Số đỏ chưa dứt." }, lose: { money: -0.35, happy: -6, log: "Đỏ hết, như chưa từng có." } } }, "Có thể đổi đời, có thể mất sạch"),
    C("Rút một nửa, cất đi", { money: 0.1, counters: { save: 1 } }, "Chắc tay, bớt phần hưng phấn")], 0)),
  daily(Pg, "gb_tell", [18, 60], 8, (c) => T("Đọc vị người đối diện", vary("gbt", c.age, [
    "Bạn nhận ra tay chơi đối diện cứ chạm vào cổ áo mỗi khi có bài đẹp. Cả bàn chưa ai thấy điều đó.",
    "Một con mồi ngồi vào bàn: tiền nhiều, kỹ năng ít, và tin rằng đêm nay là của mình."]), [
    C("Khai thác đến đồng cuối", { money: 0.2, counters: { honest: -1 }, memory: { npc: role(c, "rival")!, tag: "CHEATED_ME", weight: -0.1, note: "bị vét sạch trên bàn bạc" } }, "Thắng lớn, người ta nhớ mặt"),
    C("Chỉ lấy vừa đủ rồi dừng", { money: 0.06, counters: { save: 1 } })], 0), (c) => !!role(c, "rival")),
  daily(Pg, "gb_marker", [20, 60], 9, () => T("Sòng cho ghi sổ",
    "Nhà cái bảo cứ chơi tiếp, thua bao nhiêu ghi sổ bấy nhiêu, mai tính. Cánh cửa ấy mở ra rất êm, và đóng lại rất khó.", [
    C("Ghi sổ, chơi tiếp", { counters: { gamble: 1 }, custom: "borrow:0.3", flags: ["gb_marker_debt"] }, "Khỏi dừng cuộc vui, nợ miệng sòng"),
    C("Trả tiền mặt rồi về", { money: -0.05, happy: -1 })], 1)),
  daily(Pg, "gb_fix", [22, 60], 9, () => T("Tin nội bộ",
    "Một người nói có thể cho bạn biết trước kết quả một trận đấu, đổi lại ba phần tiền thắng. Nghe thì chắc ăn, nhưng ai cũng biết thứ đó từ đâu ra.", [
    C("Đặt lớn theo tin", { money: 0.4, counters: { honest: -1 }, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 9], note: "mua tin dàn xếp để cá cược" } }, "Thắng chắc, dính vào một đường dây"),
    C("Không đụng vào hàng ấy", { counters: { honest: 1 }, happy: 1 })], 1)),
  daily(Pg, "gb_family_cash", [20, 60], 8, (c, N) => { const sp = role(c, "spouse") ?? role(c, "mother") ?? role(c, "father"); return T("Tiền trong tủ nhà",
    sp ? `Còn thiếu một ít là đủ vào ván tối nay. ${N(sp)} vừa để dành được một khoản trong tủ, chưa ai đụng tới.` : "Còn thiếu một ít là đủ vào ván tối nay. Trong nhà có một khoản để dành cho việc khác.", [
    C("Lấy tạm, mai thắng bù lại", sp ? { counters: { gamble: 1 }, money: -0.04, trust: { npc: sp, delta: -0.2 }, secret: { tag: "STOLE_SHARED_PROFIT", severity: 0.3, fuse_years: [1, 6], note: "lấy tiền để dành của nhà đi đánh bạc" } } : { counters: { gamble: 1 }, money: -0.04, flags: ["gb_took_home_cash"] }, "Đủ tiền chơi, phản bội lòng tin"),
    C("Khóa tủ lại, đi ngủ", { happy: -2, counters: { save: 1 } }, "Thèm, nhưng không đụng vào")], 1, sp ? { npc: sp } : {}); }),
  daily(Pg, "gb_raid", [20, 60], 9, () => T("Công an ập vào",
    "Nửa đêm, đèn pin loang khắp quán, cửa trước cửa sau bị chặn. Có người kịp luồn ra lối bếp; bạn thì đứng ngay cạnh đống tiền trên chiếu.", [
    C("Nhận là người ngoài cuộc, chối sạch", { gamble: { p: 0.5, win: { happy: -2, log: "Bạn được cho về sau một đêm ở phường." }, lose: { money: -0.3, flags: ["gb_record"], secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [1, 5], note: "khai man trong một vụ bắt bạc" }, log: "Lời khai không khớp. Có một hồ sơ mang tên bạn." } } }, "Có thể thoát, có thể nặng thêm"),
    C("Nhận, nộp phạt, không chối", { money: -0.2, flags: ["gb_record"], counters: { honest: 1 } }, "Mất tiền, có một tiền sự")], 0)),
  daily(Pg, "gb_ritual", [18, 65], 8, (c) => T("Con số may", vary("gbr", c.age, [
    "Bạn bắt đầu tin vào một chiếc áo, một hướng ngồi, một con số. Thua thì tại quên mặc áo; thắng thì nhờ con số.",
    "Trước mỗi ván bạn làm đủ thứ lễ nhỏ, như thể may rủi là một vị thần có thể lấy lòng."]), [
    C("Càng ngày càng tin, chi tiền cầu may", { money: -0.06, counters: { gamble: 1 }, happy: -2, flags: ["gb_superstition"] }, "Yên tâm giả, túi mỏng thật"),
    C("Tự nhắc đây chỉ là xác suất", { know: 3, bw: 2 }, "Tỉnh táo hơn, bớt phần an ủi")], 0)),
  daily(Pg, "gb_bigwin", [22, 60], 10, () => T("Cú thắng đổi đời",
    "Một đêm bạn thắng số tiền bằng mấy năm người ta đi làm. Tay vẫn còn run khi đếm. Câu hỏi không phải thắng bao nhiêu, mà sau đó làm gì với nó.", [
    C("Đem hết đi chơi ván lớn hơn", { counters: { gamble: 2 }, gamble: { p: 0.3, win: { money: 1.2, log: "Bạn nhân đôi. Và không ai ngồi lâu được ở đỉnh." }, lose: { money: -0.9, happy: -8, log: "Chỉ một đêm, tất cả trở về con số không." } } }, "Có thể giàu to, thường là mất"),
    C("Rút ra, mua một thứ không bán lại được", { money: 0.5, flags: ["gb_bought_home"], agency: 0.02 }, "Giữ lại phần đời, khó tiêu vào bạc"),
    C("Chia một phần cho người từng cho vay", { money: 0.2, rel: 4, counters: { honest: 1 } }, "Bớt tiền, nhẹ nợ ân tình")], 0)),
  daily(Pg, "gb_quit", [26, 70], 99, (c) => T("Một ngày không đặt cược",
    "Có người lập hội giúp nhau bỏ bạc, họp mỗi tuần một lần ở nhà văn hóa. Lần đầu bạn ngồi nghe người khác kể, nhận ra từng chi tiết giống đời mình.", [
    C("Bỏ hẳn, nhờ người giữ tiền giúp", { ...leave(Pg), flags: ["ex_gambler"], counters: { gamble: -8 }, happy: 4, agency: 0.03, log: "Bạn giao thẻ, giao mật khẩu, giao cả cái tôi cho người khác giữ." }, "Đau và chậm, nhưng là lối ra"),
    C("Giảm dần, chưa dứt được", { counters: { gamble: -2 }, happy: 1 }),
    C("Nghĩ mình kiểm soát được, thôi hội", { counters: { gamble: 1 }, happy: -1 })], 0), (c) => c.happy < 55 || c.broke || (c.counters.gamble ?? 0) >= 5),

  /* ---------- gia đình ---------- */
  cross(Pg, "gb_family", [24, 65], (c) => !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const sp = role(c, "spouse"); const pa = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} khoe vừa thắng ván đầu`, `${N(k)} khoe vừa thắng một ván trên mạng, xin bạn ít vốn để "gỡ cho bõ". Nó nhìn bạn như nhìn một tấm gương đáng theo.`, [
      C("Cấm tuyệt đối, kể chuyện đời mình", { trust: { npc: k, delta: 0.1 }, flags: ["gb_warned_child"], happy: -1 }, "Con giận, nhưng được cảnh báo"),
      C("Đưa tiền, dặn chơi có chừng", { trust: { npc: k, delta: -0.05 }, money: -0.05, counters: { gamble: 1 } }, "Dễ với con, mở một cửa xấu"),
      C("Ngồi chơi cùng cho nó thấy mình thua", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.2 }, log: `${N(k)} thua sạch tiền tiêu vặt, và chờn.` }, lose: { trust: { npc: k, delta: -0.1 }, money: -0.03, log: `Rủi thay nó lại thắng, càng tin vào may mắn.` } } }, "Liều một ván để dạy con", { tier: "awakened" })], 0, { npc: k });
    const p = sp ?? pa!; return T("Người nhà đếm thiếu tiền", `${N(p)} lại thấy hụt tiền trong tủ. ${N(p)} không hỏi nữa, chỉ lặng lẽ mang sổ tiết kiệm đi gửi một chỗ bạn không biết.`, [
      C("Thề bỏ, nhờ người giữ tiền", { trust: { npc: p, delta: 0.15 }, flags: ["gb_quit_pledge"], counters: { gamble: -3 } }, "Khó, nhưng là lối ra"),
      C("Hứa suông rồi lại chơi", { trust: { npc: p, delta: -0.25 }, secret: { tag: "ABANDONED_PARENT", severity: 0.3, fuse_years: [2, 8], note: "lấy tiền nhà đi đánh bạc rồi chối" } }, "Yên chuyện bây giờ, mất lòng tin")], 0, { npc: p }); }),
];

/* ================================================================== KẺ LÀM HÀNG GIẢ (counterfeiter) · cf_ */
const Pc = "counterfeiter";
const COUNTERFEITER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(Pc, "cf_t_copy", [11, 16], () => true, () => T("Bàn tay làm giống như thật",
    "Bạn chép lại logo một hãng giày lên đôi dép tổ ong của mình, giống đến mức bạn trong lớp tưởng là hàng hiệu. Thầy bảo bạn khéo tay; một người lớn bảo tài đó dùng không khéo thì hại người.", [
    C("Mày mò làm cho giống thật hơn nữa", { money: -0.02, flags: [talentFlag(Pc)], counters: { talents_seen: 1 }, know: 2 }, "Một kỹ năng, hai lối dùng"),
    C("Chuyển sang tự vẽ mẫu của mình", { counters: { talents_seen: 1 }, happy: 2, flags: ["cf_own_design_kid"] }, "Chậm được khen, nhưng là của mình")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(Pc, "cf_d_market", [22, 50], () => true, () => T("Mối hàng 'xách tay'",
    "Một người bán ở chợ đầu mối rủ bạn nhập 'hàng xách tay': túi, nước hoa, phụ kiện giống hệt hàng hiệu, giá bằng một phần mười, bán ra lời gấp mấy lần. Khách thì ai cũng muốn rẻ.", [
    C("Lấy nghề này làm kế sinh nhai", { ...become(Pc), counters: { doors_seen: 1 }, money: 0.1, income_mult: 1.2 }, "Lời ngay, bán niềm tin của khách"),
    C("Chỉ bán hàng bình dân, nói đúng là hàng gì", { counters: { doors_seen: 1 }, money: 0.03 })], 0)),
  door(Pc, "cf_d_workshop", [22, 50], (c) => !c.poor_country || f(c, talentFlag(Pc)), () => T("Xưởng nhỏ sau nhà",
    "Bạn có cơ hội tiếp quản một xưởng nhỏ. Làm hàng của mình thì chật vật; nhưng chỉ cần dán nhãn một thương hiệu nổi tiếng lên, cùng món đồ ấy bán được gấp năm.", [
    C("Dán nhãn hãng lớn, chạy sản lượng", { ...become(Pc), counters: { doors_seen: 1 }, income_mult: 1.4, close_doors: ["clean_record"], flags: ["cf_label_game"] }, "Giàu nhanh, một ngày phải trả giá"),
    C("Giữ xưởng làm hàng không nhãn", { counters: { doors_seen: 1 }, income_mult: 0.95, flags: ["cf_honest_shop"] }, "Lời mỏng, ngủ yên")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(Pc, 1, 1, (c) => T("Lô hàng đầu tiên",
    "Lô hàng đầu bán hết trong hai ngày. Một bà khách ôm chiếc túi như ôm cả giấc mơ, khoe cả đời mới mua được 'đồ hiệu'. Bạn cười theo, và không nói đó là hàng gì.", [
    C("Nhận lời khen, im lặng về nguồn gốc", { counters: step(c, Pc, { honest: -1 }), money: 0.08, happy: -1 }, "Tiền và một lời nói dối nhỏ"),
    C("Nói thật, bán đúng giá hàng nhái", { counters: step(c, Pc), money: 0.03, rel: 3, flags: ["cf_tells_truth"] }, "Lời ít, khách tin lâu", { longterm: true })], 0), (c) => c.age >= 18),
  beat(Pc, 2, 3, (c) => T("Mối lớn đặt số lượng",
    "Một đầu mối lớn muốn đặt hàng nghìn sản phẩm, kèm cả giấy tờ nhập khẩu giả để qua cửa. Đơn này bằng cả năm bạn chạy chợ lẻ, nhưng tên bạn sẽ nằm trên những tờ giấy ấy.", [
    C("Nhận đơn, lo cả giấy tờ", { counters: step(c, Pc, { honest: -1 }), income_mult: 1.6, secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [3, 12], note: "giấy tờ giả cho một lô hàng lớn" } }, "Đổi đời, một bí mật lớn"),
    C("Chỉ nhận lượng nhỏ, không giấy tờ giả", { counters: step(c, Pc), income_mult: 1.15 }, "An toàn hơn, lời ít hơn"),
    C("Từ chối, dồn vốn làm thương hiệu riêng", { counters: step(c, Pc), money: -0.3, flags: ["cf_own_brand"], agency: 0.03, income_mult: 0.9 }, "Khổ trước, tên mình về sau", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(Pc, 3, 4, (c) => T("Một món hàng gây họa",
    f(c, "cf_label_game") || !f(c, "cf_own_brand")
      ? "Một khách gọi đến, giọng run: chiếc sạc bạn bán cháy trong đêm, suýt cháy cả nhà, con nhỏ phải vào viện vì khói. Họ không biết đó là hàng của bạn, nhưng bạn biết."
      : "Một khách gọi đến: món hàng không nhãn của bạn hỏng và gây thương tích nhẹ. Họ đòi bạn chịu trách nhiệm, dù bạn chưa từng nói dối họ điều gì.", [
    C("Lặng lẽ thu hồi, bồi thường, đổi nguồn", { counters: step(c, Pc), money: -0.4, happy: -5, flags: ["cf_recall"] }, "Mất tiền, cứu lấy lương tâm"),
    C("Chối, xóa dấu vết, đổ cho khách dùng sai", { counters: step(c, Pc, { honest: -1 }), money: -0.05, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [1, 6], note: "chối trách nhiệm vụ hàng giả gây họa" }, happy: -3 }, "Giữ được tiền, mất giấc ngủ"),
    C("Bỏ hẳn hàng giả sau cú này", { counters: step(c, Pc), ...leave(Pc), flags: ["ex_counterfeiter"], money: -0.2, happy: 2, agency: 0.03, log: "Bạn đóng xưởng, trả lại tiền cho khách, và không ngủ được mấy đêm." }, "Dừng lại trước khi quá muộn")], 0), (c) => c.age >= 18),
  beat(Pc, 4, 5, (c) => { const brand = f(c, "cf_own_brand"); return T(brand ? "Thương hiệu của chính mình" : "Lệnh kiểm tra",
    brand ? "Thương hiệu riêng của bạn bắt đầu có khách quen. Một chuỗi cửa hàng muốn ký hợp đồng dài, với điều kiện bạn chứng minh được không còn dính dáng gì tới hàng giả."
      : "Quản lý thị trường ập vào kho, niêm phong hàng. Luật sư nói bạn có thể gỡ nhẹ nếu khai ra đầu mối phía trên, nhưng những người ấy biết nhà bạn ở đâu.", [
    C(brand ? "Ký hợp đồng, công khai sổ sách" : "Khai ra đường dây, nhận bảo vệ", { counters: step(c, Pc, { honest: 1 }), money: brand ? 0.5 : -0.3, income_mult: brand ? 1.4 : 0.7, flags: ["cf_went_clean"], agency: 0.03 }, brand ? "Lên hẳn, bỏ lại quá khứ" : "Nhẹ tội, gánh một nỗi sợ"),
    C(brand ? "Vẫn lén giữ dây chuyền hàng giả" : "Ngậm miệng, nhận hết về mình", { counters: step(c, Pc, { honest: brand ? -1 : 1 }), money: brand ? 0.3 : -0.6, ...(brand ? { secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [2, 8], note: "giấu dây chuyền hàng giả sau khi 'rửa trắng'" } } : { flags: ["cf_took_the_fall"] }) }, brand ? "Tham thêm, rủi ro gấp bội" : "Giữ chữ tín giang hồ, mất tự do"),
    C("Giao lại xưởng cho công nhân, rút lui", { counters: step(c, Pc), ...leave(Pc), flags: ["cf_gave_workshop"], money: -0.1, rel: 6, agency: 0.03 }, "Bỏ hết, để lại cho người làm", { tier: "sovereign" })], 0); }, (c) => c.age >= 18),
  beat(Pc, 5, 6, (c) => T("Cái tên để lại",
    f(c, "cf_went_clean") || f(c, "cf_own_brand") ? "Về già, món đồ bạn làm được bày trong tủ kính mang tên thật của bạn. Một người trẻ hỏi xin học nghề, và hỏi luôn có đúng là ngày xưa bạn từng làm hàng giả."
      : "Về già, nhắc tên bạn người ta vẫn nhớ 'cái ông chuyên hàng nhái'. Một người trẻ tìm đến, muốn học cách làm cho giống thật.", [
    C("Dạy nghề thật, kể cả cái giá ngày xưa", { counters: step(c, Pc, { honest: 1 }), rel: 5, flags: ["cf_mentor_clean"], happy: 3 }, "Truyền nghề, truyền cả bài học"),
    C("Truyền lại mánh làm giả", { counters: step(c, Pc, { honest: -1 }), money: 0.15, rel: -2 }, "Kiếm thêm, nối dài cái nghiệp"),
    C("Khuyên nó chọn đường khác, giúp vốn", { counters: step(c, Pc), money: -0.15, rel: 6, agency: 0.02 }, undefined, { tier: "awakened" })], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(Pc, "cf_ask", [22, 60], 7, (c) => T("Khách hỏi hàng thật không", vary("cfa", c.age, [
    "Một khách cầm chiếc túi lên, nhìn thẳng vào mắt bạn: 'Hàng này thật chứ anh?' Chị ấy định mua tặng mẹ.",
    "Một người trẻ hỏi đi hỏi lại có phải chính hãng không, vì để dành ba tháng lương mới mua được."]), [
    C("Nói đại là thật cho xong", { money: 0.05, counters: { honest: -1 }, flags: ["cf_lied_to_buyer"] }, "Chốt đơn, một người bị lừa"),
    C("Nói thật đây là hàng nhái, giá rẻ", { money: 0.02, rel: 2, counters: { honest: 1 } }, "Mất đơn đắt, giữ được mặt")], 0)),
  daily(Pc, "cf_inspector", [22, 60], 9, () => T("Đoàn kiểm tra ghé qua",
    "Một cán bộ quản lý thị trường ghé 'nhắc nhở', rồi để lại số điện thoại, ý là mỗi tháng gửi một khoản thì kho của bạn sẽ yên.", [
    C("Gửi đều mỗi tháng", { money: -0.08, income_mult: 1.1, secret: { tag: "PAID_BRIBE", severity: 0.4, fuse_years: [2, 10], note: "chung chi cho cán bộ để kho hàng giả yên" } }, "Kho yên, thêm một dây trói"),
    C("Không gửi, dọn kho cho sạch", { money: -0.1, bw: -4, counters: { honest: 1 } }, "Vất vả, không mắc nợ ai")], 1)),
  daily(Pc, "cf_worker", [24, 60], 9, (c) => T("Người làm trong xưởng",
    "Xưởng cần thêm tay. Có người dẫn đến mấy lao động chịu làm giá rẻ, trong đó một em trông còn chưa đủ tuổi, nói dối tuổi để có việc.", [
    C("Nhận hết cho rẻ, nhắm mắt chuyện tuổi", { money: 0.06, counters: { honest: -1 }, secret: { tag: "ABANDONED_PARENT", severity: 0.3, fuse_years: [2, 8], note: "dùng lao động chưa đủ tuổi trong xưởng" } }, "Giảm chi phí, thêm một tội"),
    C("Trả công đúng, từ chối em chưa đủ tuổi", { money: -0.05, rel: 4, counters: { kind: 1 } }, "Tốn hơn, giữ được mình"),
    C("Nhận em đó, nhưng cho đi học buổi tối", { money: -0.03, rel: 5, agency: 0.02, flags: ["cf_schooled_worker"] }, "Vừa việc vừa trường, khó mà đáng", { tier: "awakened" })], 0)),
  daily(Pc, "cf_online", [22, 55], 8, (c) => T("Gian hàng trên mạng", vary("cfo", c.age, [
    "Bạn mở gian hàng online. Chỉ cần vài chục đánh giá năm sao giả là đơn về ào ào, dù hàng vẫn là hàng ấy.",
    "Một dịch vụ chào bán gói 'người mua ảo' để đẩy gian hàng hàng giả của bạn lên đầu tìm kiếm."]), [
    C("Mua đánh giá ảo, đẩy đơn", { money: 0.1, counters: { honest: -1 }, flags: ["cf_fake_reviews"] }, "Đơn tăng vọt, dựng trên lời dối"),
    C("Để khách thật đánh giá, lớn chậm", { money: 0.02, rel: 2 }, "Chậm mà bền")], 0)),
  daily(Pc, "cf_rival", [24, 60], 9, (c, N) => { const r = role(c, "rival")!; return T("Kẻ làm ẩu hơn mình",
    `${N(r)} cũng làm hàng giả, nhưng làm ẩu đến mức dùng là hỏng, khiến cả khu chợ mang tiếng và khách quay lưng với tất cả.`, [
    C("Hạ giá đua xuống đáy với họ", { money: -0.05, income_mult: 0.95, memory: { npc: r, tag: "BETRAYED_PARTNERSHIP", weight: -0.2, note: "lao vào cuộc đua phá giá hàng giả" } }, "Giữ khách, cùng nhau chìm"),
    C("Tách ra, làm kỹ, nói rõ nguồn gốc", { income_mult: 1.05, rel: 3, flags: ["cf_quality_turn"] }, "Khó hơn, tách khỏi đám ẩu")], 0, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(Pc, "cf_return", [22, 60], 8, () => T("Hàng trả về",
    "Một thùng hàng bị trả lại, kèm tin nhắn dài của người mua kể món đồ hỏng ngay hôm đầu, và họ đã mừng thế nào khi nghĩ mình mua được đồ tốt.", [
    C("Lờ đi, chặn số người mua", { money: 0.02, counters: { honest: -1 }, happy: -3 }, "Đỡ phiền, nặng lòng"),
    C("Hoàn tiền, xin lỗi tử tế", { money: -0.04, rel: 3, counters: { honest: 1 } }, "Mất chút tiền, giữ chút người"),
    C("Hoàn tiền và đổi sang bán hàng thật", { money: -0.06, flags: ["cf_pivot_real"], agency: 0.02, income_mult: 0.95 }, "Bước ngoặt tốn kém", { tier: "awakened" })], 0)),
  daily(Pc, "cf_supplier", [24, 60], 9, () => T("Nguyên liệu rẻ hơn nữa",
    "Một nhà cung cấp chào loại nguyên liệu rẻ hơn hẳn, nhưng nói nhỏ rằng 'đừng hỏi nó làm từ gì'. Dùng nó, lời sẽ dày thêm một khúc.", [
    C("Dùng, miễn rẻ là được", { money: 0.08, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.4, fuse_years: [2, 9], note: "dùng nguyên liệu không rõ nguồn trong hàng bán cho khách" } }, "Lời dày, rủi ro cho người dùng"),
    C("Hỏi cho rõ rồi từ chối", { money: -0.02, counters: { honest: 1 }, know: 2 }, "Lời mỏng, biết mình bán gì")], 1)),
  daily(Pc, "cf_brandowner", [24, 60], 10, (c, N) => { const o = (role(c, "first_boss") ?? role(c, "mentor"))!; return T("Người của hãng thật tìm đến",
    `Một người đại diện cho hãng mà bạn đang nhái tìm đến tận nơi. ${N(o)} không mang theo công an, chỉ đặt lên bàn một đề nghị: thôi làm giả, về làm gia công chính thức cho họ.`, [
    C("Nhận lời, thành xưởng gia công thật", { income_mult: 1.2, flags: ["cf_oem_deal"], rel: 4, counters: { honest: 1 }, agency: 0.02 }, "Bớt lời trước mắt, có đường dài"),
    C("Từ chối, tiếp tục làm giả", { income_mult: 1.05, counters: { honest: -1 }, memory: { npc: o, tag: "REFUSED_HELP", weight: -0.2, note: "từ chối lời mời làm ăn tử tế của hãng" } }, "Tự do kiểu cũ, đóng một cửa")], 0, { npc: o }); }, (c) => !!(role(c, "first_boss") ?? role(c, "mentor"))),
  daily(Pc, "cf_legit", [24, 60], 10, () => T("Mẫu của riêng mình",
    "Giữa đống hàng nhái, bạn vẽ ra một mẫu hoàn toàn của mình. Nó không có cái tên nào bảo chứng, chỉ có bàn tay bạn. Bán nó khó gấp mười lần dán nhãn người khác.", [
    C("Đầu tư làm mẫu riêng song song", { money: -0.15, flags: ["cf_own_brand"], agency: 0.03, know: 4 }, "Tốn kém, có thể là lối ra"),
    C("Cất lại, quay về việc dễ ăn", { happy: -2, counters: { honest: -1 } }, "An toàn, một giấc mơ xếp lại")], 0)),

  /* ---------- gia đình ---------- */
  cross(Pc, "cf_family", [26, 65], (c) => !!role(c, "father") || !!role(c, "mother") || !!role(c, "spouse") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const pa = role(c, "father") ?? role(c, "mother") ?? role(c, "spouse")!;
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị bạn chê dùng đồ giả`, `${N(k)} đi học về, mắt đỏ hoe: bạn bè phát hiện đôi giày nó mang là hàng giả từ xưởng nhà, cả lớp cười. Nó hỏi bạn làm nghề gì mà nó phải xấu hổ.`, [
      C("Nói thật, hứa sẽ chuyển nghề", { trust: { npc: k, delta: 0.2 }, flags: ["cf_promised_child"], promise: { to: k, what: "bỏ dần hàng giả", years: 3 } }, "Con nhẹ lòng, mình thêm gánh"),
      C("Gắt lên, bảo nhờ nghề này mà có ăn", { trust: { npc: k, delta: -0.2 }, happy: -3 }, "Thắng lời, thua lòng con"),
      C("Dẫn con vào xưởng, chỉ cho nó thấy hết", { trust: { npc: k, delta: 0.1 }, bw: -3, flags: ["cf_showed_child"] }, "Thành thật phũ phàng", { tier: "awakened" })], 0, { npc: k });
    return T("Bố mẹ nói tránh nghề của bạn", `${N(pa)} vẫn bảo hàng xóm rằng bạn 'mở xưởng may', không bao giờ nói rõ bạn làm gì. Hôm nay có người đến hỏi mua hàng hiệu ngay trước mặt ${N(pa)}.`, [
      C("Thú thật với bố mẹ về nghề", { trust: { npc: pa, delta: 0.1 }, happy: -2, flags: ["cf_told_parent"] }, "Nhẹ lòng mình, nặng lòng người"),
      C("Chối, dựng tiếp vở kịch", { trust: { npc: pa, delta: -0.1 }, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 8], note: "giấu bố mẹ chuyện làm hàng giả" } }, "Giữ thể diện, chồng thêm dối")], 0, { npc: pa }); }),
];

/* ================================================================== HACKER (hacker) · hk_
 * Chỉ nói về đạo đức, việc được chiêu mộ, mũ trắng hay mũ đen, và hậu quả. Tuyệt đối không mô tả cách làm. */
const Pk = "hacker";
const HACKER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(Pk, "hk_t_door", [12, 16], () => true, () => T("Cánh cửa lẽ ra đã khóa",
    "Mày mò trên máy tính cũ, bạn phát hiện mình vào được một nơi lẽ ra không ai được vào. Không ai biết, không ai chặn. Một cảm giác lạ: thế giới hóa ra có nhiều ổ khóa lỏng hơn người ta tưởng.", [
    C("Mê mẩn, tìm hiểu sâu thêm", { money: -0.02, flags: [talentFlag(Pk)], counters: { talents_seen: 1 }, know: 3 }, "Một tài năng, hai ngả thiện ác"),
    C("Báo cho người lớn rồi thôi", { counters: { talents_seen: 1 }, rel: 2, flags: ["hk_reported_young"] }, "Làm đúng, dập tắt tò mò")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(Pk, "hk_d_group", [18, 35], () => true, () => T("Nhóm kín rủ vào",
    "Trong một diễn đàn kín, một nhóm người bạn chưa từng gặp mặt mời bạn 'nhận việc'. Họ nói về tiền dễ, về kẻ địch là những công ty lớn chẳng ai thương, về chuyện không ai bị đau.", [
    C("Theo nhóm, nhận việc đầu tiên", { ...become(Pk), counters: { doors_seen: 1 }, money: 0.1, flags: ["hk_black_crew"], close_doors: ["clean_record"] }, "Tiền dễ, bước qua một lằn ranh"),
    C("Từ chối, rời diễn đàn", { counters: { doors_seen: 1 }, happy: 1, flags: ["hk_declined_crew"] }, "Bỏ lỡ tiền, giữ tay sạch")], 0)),
  door(Pk, "hk_d_firm", [18, 35], (c) => !c.poor_country || f(c, talentFlag(Pk)), () => T("Công ty an ninh mạng tuyển",
    "Một công ty an ninh mạng tìm đến, muốn thuê bạn làm người tìm lỗ hổng cho họ — hợp pháp, có lương, có hợp đồng. Việc chính là tấn công thử để bên phòng thủ vá lại.", [
    C("Nhận việc mũ trắng", { ...become(Pk), counters: { doors_seen: 1 }, income_mult: 1.3, flags: ["hk_white_hat"], know: 4 }, "Lương đều, dùng tài vào việc sáng"),
    C("Thử việc tự do, chưa ràng buộc", { counters: { doors_seen: 1 }, gamble: { p: 0.4, win: { ...become(Pk), flags: ["hk_white_hat"], log: "Mấy báo cáo lỗi của bạn được trả thưởng, bạn sống được bằng nghề." }, lose: { happy: -3, log: "Không ai trả tiền cho công sức của bạn. Bạn về nghề cũ." } } }, "Tự do hơn, bấp bênh hơn")], 0)),

  /* ---------- mạch truyện ---------- */
  beat(Pk, 1, 1, (c) => T("Lằn ranh đầu tiên",
    "Bạn tìm ra một lỗ hổng lớn trong hệ thống của một tổ chức. Trong tay bạn lúc này là chìa khóa vào dữ liệu của rất nhiều người. Báo cho họ thì được một lời cảm ơn; im lặng khai thác thì được nhiều hơn thế.", [
    C("Báo cho tổ chức, nhận tiền thưởng", { counters: step(c, Pk), money: 0.08, flags: ["hk_white_hat"], know: 3, agency: 0.02 }, "Ít tiền hơn, ngủ ngon", { longterm: true }),
    C("Lặng lẽ khai thác lỗ hổng", { counters: step(c, Pk, { honest: -1 }), money: 0.3, flags: ["hk_crossed"], secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [2, 10], note: "khai thác lỗ hổng thay vì báo" } }, "Nhiều tiền, một lằn ranh đã qua")], 0), (c) => c.age >= 18),
  beat(Pk, 2, 3, (c) => T("Hai lời mời",
    "Cùng một tuần, hai lời mời đến. Một nhóm ẩn danh đề nghị bạn vào những phi vụ lớn, tiền gấp bội. Một cơ quan nhà nước mời bạn vào đội bảo vệ hạ tầng, lương bình thường nhưng danh chính ngôn thuận.", [
    C("Theo nhóm ẩn danh, ăn lớn", { counters: step(c, Pk, { honest: -1 }), income_mult: 1.8, flags: ["hk_black_crew"], close_doors: ["clean_record"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [3, 12], note: "nhận phi vụ cho một nhóm ẩn danh" } }, "Giàu nhanh, sống trong bóng tối"),
    C("Vào đội bảo vệ hạ tầng", { counters: step(c, Pk), income_mult: 1.2, flags: ["hk_white_hat"], agency: 0.02 }, "Lương vừa, đứng về phía sáng", { longterm: true }),
    C("Không theo ai, lập đội kiểm thử của riêng mình", { counters: step(c, Pk), money: -0.25, flags: ["hk_own_firm"], agency: 0.03, income_mult: 0.95 }, "Khổ trước, tự làm chủ mình", { tier: "sovereign" })], 1), (c) => c.age >= 18),
  beat(Pk, 3, 4, (c) => T("Có người trả giá thật",
    f(c, "hk_black_crew") || f(c, "hk_crossed")
      ? "Một việc bạn từng nhận hóa ra làm tê liệt hệ thống một bệnh viện mấy ngày. Bạn đọc tin: ca mổ bị hoãn, người ta chờ trong hoảng loạn. Không ai biết là bạn, nhưng bạn biết."
      : "Một nhóm bạn từng từ chối nay tấn công đúng nơi bạn đang bảo vệ. Dữ liệu của hàng nghìn người có nguy cơ lộ, và chỉ bạn hiểu đủ để ngăn lại trong đêm nay.", [
    C(f(c, "hk_black_crew") || f(c, "hk_crossed") ? "Lặng lẽ gỡ lại, trả tự do cho hệ thống" : "Thức trắng đêm bịt lỗ hổng", { counters: step(c, Pk), money: -0.1, health: -4, happy: -3, flags: ["hk_made_amends"], agency: 0.03 }, "Không ai cảm ơn, nhưng đúng"),
    C("Giả như không liên quan, nhận tiền tiếp", { counters: step(c, Pk, { honest: -1 }), money: 0.2, happy: -5, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [1, 7], note: "làm ngơ khi phi vụ của mình gây họa cho người vô can" } }, "Tiền vào, lương tâm cắn"),
    C("Bỏ nghề, đi khai báo để chuộc lỗi", { counters: step(c, Pk), ...leave(Pk), flags: ["hk_turned_self_in"], money: -0.2, happy: 2, agency: 0.04, log: "Bạn tự đến trình báo, mang theo mọi thứ mình biết." }, "Mất nghề, nhẹ một gánh nặng")], 0), (c) => c.age >= 18),
  beat(Pk, 4, 5, (c) => { const black = f(c, "hk_black_crew"); return T(black ? "Cửa gõ lúc rạng sáng" : "Tên tuổi trong nghề",
    black ? "Cơ quan điều tra lần ra bạn. Họ cho bạn một lựa chọn: hợp tác, khai ra đường dây và chuyển sang làm cho phía phòng thủ, hoặc ra tòa với tất cả những gì họ đã có."
      : "Bạn thành một cái tên được nể trong giới an ninh mạng. Một tập đoàn mời bạn dẫn dắt cả mảng phòng thủ, lương cao, nhưng phải công khai danh tính và từ bỏ mọi hoạt động ẩn danh.", [
    C(black ? "Hợp tác, chuyển hẳn sang mũ trắng" : "Nhận chức, bước ra ánh sáng", { counters: step(c, Pk, { honest: 1 }), income_mult: black ? 1.1 : 1.6, flags: ["hk_went_clean"], agency: 0.03 }, black ? "Thoát án, đổi phe" : "Danh phận, mất phần ẩn danh"),
    C(black ? "Chối đến cùng, đánh cược ở tòa" : "Từ chối, giữ cuộc sống hai mặt", { counters: step(c, Pk), gamble: { p: black ? 0.35 : 0.6, win: { money: black ? -0.3 : 0.4, log: black ? "Thiếu bằng chứng, bạn chỉ bị án treo." : "Bạn vừa có danh vừa giữ được vùng tối của mình." }, lose: { money: -0.6, flags: ["hk_prison_bound"], custom: "become:ex_convict", log: black ? "Tòa tuyên bạn có tội. Cửa trại giam khép lại." : "Vùng tối của bạn bị phanh phui, kéo theo cả một bản án." } } }, black ? "Có thể thoát, có thể vào tù" : "Giữ tất cả, rủi ro tất cả"),
    C("Rút khỏi nghề, đi dạy an toàn mạng cho người thường", { counters: step(c, Pk), ...leave(Pk), flags: ["hk_teacher"], income_mult: 0.7, happy: 4, agency: 0.03 }, "Bỏ đỉnh cao, đổi lấy bình yên", { tier: "sovereign" })], 0); }, (c) => c.age >= 18),
  beat(Pk, 5, 6, (c) => T("Di sản trong bóng tối",
    f(c, "hk_went_clean") || f(c, "hk_white_hat") || f(c, "hk_teacher") ? "Về sau, bạn được mời kể lại chặng đường của mình cho lớp trẻ. Một sinh viên hỏi: nếu quay lại cái đêm tìm ra lỗ hổng đầu tiên, bạn sẽ chọn gì?"
      : "Nhiều năm trôi qua, những việc cũ vẫn chưa hẳn ngủ yên. Một người trẻ tìm đến, gọi bạn là huyền thoại, xin được dẫn vào 'giới'.", [
    C("Kể thật, cả vinh lẫn nhục, để nó tránh", { counters: step(c, Pk, { honest: 1 }), rel: 5, flags: ["hk_mentor_ethics"], happy: 3 }, "Truyền lại bài học đắt giá"),
    C("Dẫn nó vào vùng tối như mình ngày xưa", { counters: step(c, Pk, { honest: -1 }), money: 0.15, rel: -2, close_doors: ["clean_record"] }, "Thêm tiền, nối dài bóng tối"),
    C("Giúp nó lập công ty bảo mật đàng hoàng", { counters: step(c, Pk), money: -0.2, rel: 6, agency: 0.03, flags: ["hk_legacy_firm"] }, undefined, { tier: "awakened" })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(Pk, "hk_bounty", [18, 60], 7, (c) => T("Thưởng lỗi hay bán lỗ hổng", vary("hkb", c.age, [
    "Bạn tìm ra một lỗi nghiêm trọng. Hãng treo thưởng cho người báo lỗi; nhưng ở chợ đen, cùng lỗi đó được trả gấp hai mươi lần.",
    "Một lỗ hổng trong tay bạn: báo thì được ghi tên và ít tiền, giấu để bán thì đổi được cả một gia tài."]), [
    C("Báo cho hãng, nhận thưởng chính danh", { money: 0.1, flags: ["hk_white_hat"], know: 2, agency: 0.01 }, "Ít hơn, sạch sẽ"),
    C("Bán ra chợ đen", { money: 0.5, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.5, fuse_years: [2, 9], note: "bán lỗ hổng cho chợ đen" } }, "Gấp bội tiền, gieo một mầm họa")], 0)),
  daily(Pk, "hk_data", [18, 60], 8, () => T("Kho dữ liệu của người lạ",
    "Trong một việc, bạn tình cờ cầm trong tay thông tin riêng tư của hàng nghìn người: địa chỉ, tài khoản, cả những điều họ giấu người thân.", [
    C("Dùng nó để kiếm thêm", { money: 0.3, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [1, 8], note: "trục lợi từ dữ liệu riêng tư của người lạ" }, happy: -3 }, "Tiền lớn, hàng nghìn người thành con mồi"),
    C("Xóa sạch, không đụng đến", { happy: 2, counters: { honest: 1 }, bw: -2 }, "Không được gì, giữ được mình")], 0)),
  daily(Pk, "hk_whistle", [20, 60], 9, (c, N) => { const o = role(c, "official")!; return T("Thấy một việc khuất tất",
    `Khi dò hệ thống, bạn thấy bằng chứng một tổ chức do ${N(o)} đứng đầu đang lừa chính khách hàng của họ. Thứ này có thể phanh phui ra ánh sáng, hoặc dùng để ép người ta đưa tiền.`, [
    C("Chuyển bằng chứng cho báo chí", { agency: 0.04, flags: ["hk_whistleblower"], gamble: { p: 0.6, win: { rel: 5, log: "Vụ việc vỡ lở, người ta gọi bạn là người tốt giấu mặt." }, lose: { happy: -5, memory: { npc: o, tag: "HUMILIATED_ME", weight: -0.3, note: "tố giác việc khuất tất của họ" }, log: "Họ lần ra bạn trước khi báo chí vào cuộc." } } }, "Làm điều đúng, chuốc kẻ thù"),
    C("Dùng nó để tống tiền kín", { money: 0.5, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.6, fuse_years: [1, 7], note: "dùng bằng chứng để tống tiền" }, memory: { npc: o, tag: "CHEATED_ME", weight: -0.2, note: "ép đưa tiền để giữ im lặng" } }, "Tiền im lặng, một tội mới"),
    C("Bỏ qua, không phải việc của mình", { happy: -2 }, "Yên thân, lơ cái sai")], 0, { npc: o }); }, (c) => !!role(c, "official")),
  daily(Pk, "hk_offer", [18, 60], 8, (c) => T("Phi vụ béo bở", vary("hko", c.age, [
    "Một người lạ nhắn tin, hứa một khoản tiền bằng mấy năm lương chỉ cho một đêm làm việc, và dặn 'đừng hỏi mục tiêu là ai'.",
    "Có lời mời tham gia một phi vụ lớn nhằm vào một ngân hàng; phần của bạn đủ để đổi đời."]), [
    C("Nhận, không hỏi mục tiêu", { money: 0.6, counters: { honest: -1 }, flags: ["hk_black_crew"], close_doors: ["clean_record"], secret: { tag: "FORGED_PAPERS", severity: 0.6, fuse_years: [2, 9], note: "nhận một phi vụ không rõ nạn nhân" } }, "Đổi đời, nạn nhân là ai không biết"),
    C("Từ chối, chặn liên lạc", { happy: 1, flags: ["hk_declined_job"] }, "Bỏ tiền lớn, ngủ yên")], 0)),
  daily(Pk, "hk_paranoia", [18, 60], 9, () => T("Sống trong đề phòng",
    "Bạn bắt đầu đổi chỗ ở, đổi thói quen, giật mình mỗi khi có tiếng gõ cửa. Nghề này ăn dần vào giấc ngủ và lòng tin với mọi người quanh bạn.", [
    C("Tiếp tục, chai lì với nỗi sợ", { health: -4, bw: -5, counters: { honest: -1 }, happy: -3 }, "Trụ lại, mòn dần"),
    C("Giảm việc, tìm lại đời sống bình thường", { income_mult: 0.9, health: 4, happy: 3, flags: ["hk_scaling_down"] }, "Bớt tiền, lấy lại giấc ngủ")], 1)),
  daily(Pk, "hk_friend", [18, 60], 9, (c, N) => { const fr = (role(c, "childhood_friend") ?? role(c, "spouse"))!; return T("Bạn nhờ theo dõi một người",
    `${N(fr)} biết bạn làm nghề này, nhờ bạn lén đọc tin nhắn của một người mà họ nghi ngờ. Họ nói chỉ cần xem một lần cho yên lòng.`, [
    C("Giúp bạn, xâm nhập đời tư người kia", { trust: { npc: fr, delta: 0.1 }, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.4, fuse_years: [1, 6], note: "xâm nhập đời tư người khác vì nhờ vả" } }, "Vừa lòng bạn, bước vào đời tư người ta"),
    C("Từ chối, khuyên bạn nói chuyện thẳng", { trust: { npc: fr, delta: -0.05 }, rel: 2, counters: { honest: 1 } }, "Mất lòng bạn, giữ nguyên tắc")], 0, { npc: fr }); }, (c) => !!(role(c, "childhood_friend") ?? role(c, "spouse"))),
  daily(Pk, "hk_state", [22, 60], 10, () => T("Người của 'bên trên'",
    "Một người ăn mặc chỉnh tề tìm đến, không xưng rõ cơ quan, mời bạn làm những việc 'vì an ninh quốc gia' mà không bao giờ được kể cho ai. Từ chối cũng không dễ.", [
    C("Nhận, bước vào vùng xám của nhà nước", { income_mult: 1.4, flags: ["hk_state_asset"], agency: -0.02, secret: { tag: "FORGED_PAPERS", severity: 0.5, fuse_years: [3, 12], note: "làm việc ngầm cho một cơ quan không tên" } }, "Quyền lực chống lưng, mất phần tự do"),
    C("Tìm cách thoái thác khéo léo", { bw: -4, happy: -2, flags: ["hk_dodged_state"] }, "Giữ mình ngoài cuộc, không yên"),
    C("Công khai lời mời đó cho dư luận", { agency: 0.04, gamble: { p: 0.5, win: { rel: 4, log: "Việc chiêu mộ mờ ám bị đưa ra ánh sáng." }, lose: { happy: -6, flags: ["hk_marked"], log: "Bạn thành cái gai trong mắt những người không nên chọc giận." } } }, "Lựa chọn thứ ba: phơi bày", { tier: "sovereign" })], 0)),
  daily(Pk, "hk_fame", [18, 55], 8, (c) => T("Cái tên không mặt", vary("hkf", c.age, [
    "Trong giới, biệt danh của bạn được nhắc đến với sự nể trọng. Không ai biết mặt bạn, nhưng ai cũng biết bạn làm được những gì.",
    "Một vụ lớn vừa xảy ra; cả cộng đồng đồn đoán có phải bạn làm, và bạn thấy lòng mình lâng lâng."]), [
    C("Nuôi cái danh, nhận thêm việc để giữ tiếng", { counters: { honest: -1 }, happy: 3, flags: ["hk_ego"], income_mult: 1.1 }, "Thỏa cái tôi, càng lún sâu"),
    C("Rút lui, để biệt danh chìm vào quên lãng", { happy: -1, bw: 3, flags: ["hk_went_quiet"] }, "Mất hào quang, an toàn hơn")], 0)),
  daily(Pk, "hk_mentor_pull", [18, 55], 9, (c, N) => { const m = role(c, "mentor")!; return T("Người thầy kéo lại",
    `${N(m)}, người dạy bạn những bước đầu, thấy bạn đang trượt về phía tối. ${N(m)} nhắn một câu ngắn: "Tài của em để làm gì cũng được, nhưng em sẽ là ai?"`, [
    C("Nghe lời, quay về làm việc tử tế", { trust: { npc: m, delta: 0.2 }, flags: ["hk_white_hat"], income_mult: 0.95, agency: 0.03 }, "Nghèo hơn, thẳng lưng hơn", { longterm: true }),
    C("Gạt đi, bảo thầy không hiểu thời nay", { trust: { npc: m, delta: -0.2 }, counters: { honest: -1 }, happy: -2 }, "Giữ con đường, mất một người tin mình")], 0, { npc: m }); }, (c) => !!role(c, "mentor")),

  /* ---------- gia đình ---------- */
  cross(Pk, "hk_family", [24, 65], (c) => !!role(c, "spouse") || !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => {
    const k = role(c, "child"); const sp = role(c, "spouse") ?? role(c, "father") ?? role(c, "mother")!;
    if (c.kids_teen > 0 && k) return T(`${N(k)} đi theo vết của bạn`, `${N(k)} khoe vừa 'vào được' trang web của trường để sửa điểm, mắt sáng rỡ chờ bạn khen. Bạn nhận ra chính mình năm xưa trong ánh mắt ấy.`, [
      C("Nghiêm khắc dạy con về lằn ranh", { trust: { npc: k, delta: 0.1 }, flags: ["hk_taught_ethics"], happy: -1 }, "Con cụt hứng, hiểu ranh giới"),
      C("Khen con giỏi, lờ chuyện đúng sai", { trust: { npc: k, delta: 0.05 }, counters: { honest: -1 }, secret: { tag: "DEFRAUDED_FRIEND", severity: 0.3, fuse_years: [2, 8], note: "dung túng con đi vào con đường của mình" } }, "Con vui, gieo lại cái nghiệp"),
      C("Rủ con cùng tìm lỗi rồi báo cho trường", { trust: { npc: k, delta: 0.2 }, agency: 0.02, flags: ["hk_white_with_child"] }, "Biến tò mò thành việc tốt", { tier: "awakened" })], 0, { npc: k });
    return T("Người nhà không biết bạn làm gì", `${N(sp)} chỉ biết bạn 'làm máy tính', không hiểu vì sao có đêm bạn trắng mắt, có tháng tiền về nhiều bất thường rồi lại im lìm. ${N(sp)} bắt đầu hỏi.`, [
      C("Kể thật về công việc và rủi ro", { trust: { npc: sp, delta: 0.1 }, happy: -2, flags: ["hk_told_family"] }, "Nhẹ lòng, gieo nỗi lo cho người thân"),
      C("Tiếp tục giấu, sống hai mặt", { trust: { npc: sp, delta: -0.15 }, secret: { tag: "FORGED_PAPERS", severity: 0.3, fuse_years: [2, 9], note: "giấu gia đình về công việc thật" }, bw: -3 }, "Giữ bình yên giả, xa dần người nhà")], 0, { npc: sp }); }),
];

/* ================================================================== NGƯỜI TỪNG Ở TÙ (ex_convict) · xc_
 * Con đường đời không có năng khiếu: bước vào qua một bản án. Kể về ngày ra trại, hồ sơ lý lịch, người bị hại, hoàn lương. */
const Pe = "ex_convict";
const EX_CONVICT: Storylet[] = [
  /* ---------- cơ hội / biến cố bước vào (3 thẻ thay cho năng khiếu) ---------- */
  door(Pe, "xc_d_one_night", [18, 55], (c) => (c.counters.drink ?? 0) >= 2 || !c.poor_country || f(c, "gang"), () => T("Một đêm không quay lại được",
    "Một cuộc cãi vã trước quán nhậu, một cú xô trong lúc nóng giận. Người kia ngã và phải nằm viện nhiều tháng. Sáng hôm sau, công an đến tận nhà bạn.", [
    C("Nhận hết, xin lỗi gia đình người ta", { ...become(Pe), counters: { doors_seen: 1, honest: 1 }, close_doors: ["clean_record"], flags: ["xc_admitted"], happy: -6 }, "Án nhẹ hơn, mang tiếng suốt đời"),
    C("Thuê luật sư, chối đến cùng", { counters: { doors_seen: 1 }, money: -0.4, gamble: { p: 0.35, win: { happy: -2, log: "Bạn thoát án, nhưng người nằm viện kia không quên." }, lose: { ...become(Pe), close_doors: ["clean_record"], flags: ["xc_denied"], log: "Tòa không tin lời bạn. Bản án nặng hơn vì không thành khẩn." } } }, "Tốn tiền, có thể thoát, có thể nặng hơn")], 0), 0.12),
  door(Pe, "xc_d_took_blame", [18, 50], (c) => !!role(c, "sibling") || !!role(c, "childhood_friend"), (c, N) => { const s = (role(c, "sibling") ?? role(c, "childhood_friend"))!; return T("Gánh tội thay",
    `${N(s)} gây ra chuyện, và sắp mất tất cả: việc làm, gia đình nhỏ. ${N(s)} quỳ trước mặt bạn, nhờ bạn đứng ra nhận thay. Bạn chưa có vợ con, ${N(s)} thì có.`, [
    C("Nhận tội thay", { ...become(Pe), counters: { doors_seen: 1 }, close_doors: ["clean_record"], flags: ["xc_took_blame"], memory: { npc: s, tag: "HELPED_IN_CRISIS", weight: 0.5, note: "đi tù thay" } }, "Cứu một gia đình, mất mấy năm đời mình", { longterm: true }),
    C("Từ chối, khuyên người ấy ra đầu thú", { counters: { doors_seen: 1 }, trust: { npc: s, delta: -0.2 }, memory: { npc: s, tag: "REFUSED_HELP", weight: -0.3, note: "không chịu gánh tội thay" } }, "Giữ đời mình, mất một người thân")], 0, { npc: s }); }, 0.12),
  door(Pe, "xc_d_desperate", [18, 55], (c) => c.broke || c.scarcity || c.poor_country, () => T("Lúc cùng đường",
    "Nợ đến hạn, người nhà nằm viện, không ai cho vay nữa. Một người quen rủ làm 'một chuyến' — không hỏi chở gì, xong là có tiền ngay. Bạn biết thứ đó không sạch.", [
    C("Nhận chuyến hàng ấy", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { money: 0.3, counters: { honest: -1 }, log: "Chuyến ấy trót lọt. Lần sau họ sẽ gọi lại." }, lose: { ...become(Pe), close_doors: ["clean_record"], flags: ["xc_poverty_case"], log: "Bạn bị bắt giữa đường. Số tiền chưa kịp cầm đã thành một bản án." } } }, "Có tiền ngay hoặc vào tù"),
    C("Đi xin, đi vay, chịu nhục", { counters: { doors_seen: 1, honest: 1 }, custom: "borrow:0.3", happy: -5 }, "Nợ thêm, giữ được mình")], 1), 0.15),

  /* ---------- mạch truyện ---------- */
  beat(Pe, 1, 1, (c, N) => { const m = role(c, "mother") ?? role(c, "father") ?? role(c, "spouse"); return T("Cổng trại mở",
    `Cánh cổng sắt mở ra lúc bảy giờ sáng. Bạn cầm một túi nilon đựng mấy bộ quần áo cũ và tờ giấy ra trại.${m ? ` ${N(m)} đứng chờ bên kia đường, tóc bạc hơn bạn nhớ.` : " Không có ai đứng chờ."} Điện thoại trong túi đã cũ đến mức không còn dùng được.`, [
    C(m ? "Về nhà, chịu ánh mắt hàng xóm" : "Về quê, chịu ánh mắt hàng xóm", { counters: step(c, Pe), rel: 2, happy: -2, flags: ["xc_went_home"], ...(m ? { trust: { npc: m, delta: 0.15 } } : {}) }, "Có chỗ dựa, mang tiếng"),
    C("Đến nhà tạm cho người mãn hạn", { counters: step(c, Pe), know: 2, flags: ["xc_halfway"], money: -0.02 }, "Người lạ, có người giúp làm lại"),
    C("Tìm đến nhóm bạn cũ", { counters: step(c, Pe, { honest: -1 }), money: 0.04, flags: ["xc_old_crew"] }, "Có chỗ dựa ngay, kéo về đường cũ")], 0, m ? { npc: m } : {}); }),
  beat(Pe, 2, 3, (c) => T("Ô trống trong tờ khai",
    `Tờ đơn xin việc có một ô: "Bạn đã từng bị kết án chưa?" Đây là chỗ thứ mười bảy bạn nộp đơn.${f(c, "xc_halfway") ? " Người ở nhà tạm bảo nên nói thật, có những chủ chấp nhận." : ""}`, [
    C("Đánh dấu 'có', viết thêm vài dòng", { counters: step(c, Pe, { honest: 1 }), gamble: { p: 0.4, win: { income_mult: 1.3, flags: ["xc_honest_job"], log: "Một chủ xưởng gọi lại: 'Tôi cũng có đứa em từng như cậu.'" }, lose: { happy: -4, log: "Lại không ai gọi lại." } } }, "Thật thà, ít cửa mở", { longterm: true }),
    C("Bỏ trống, mong họ không kiểm tra", { counters: step(c, Pe, { honest: -1 }), income_mult: 1.2, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [1, 6], note: "giấu tiền án khi xin việc" } }, "Có việc ngay, sống trong lo"),
    C("Tự làm: sửa xe, bán hàng, làm thuê theo ngày", { counters: step(c, Pe), income_mult: 0.9, agency: 0.03, flags: ["xc_self_employed"] }, "Không phải xin ai, thu nhập bấp bênh", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(Pe, 3, 4, (c) => T("Cuộc gọi từ những ngày cũ",
    f(c, "xc_old_crew") ? "Nhóm cũ cần thêm một người cho một việc 'nhỏ thôi'. Họ nhắc lại những lần đã cho bạn chỗ ngủ, tiền tiêu. Bạn mới có chút ổn định, và họ biết vậy."
      : "Một người bạn tù gọi đến. Anh ta cần chỗ ngủ vài hôm, và có một việc kiếm được nhiều tiền, chỉ cần bạn đứng canh. Lương tháng của bạn chưa bằng một phần mười số ấy.", [
    C("Từ chối dứt khoát, đổi số điện thoại", { counters: step(c, Pe, { honest: 1 }), happy: -3, rel: -2, flags: ["xc_cut_ties"] }, "Mất bạn cũ, giữ được tự do"),
    C("Nhận một lần thôi", { counters: step(c, Pe, { honest: -1 }), gamble: { p: 0.5, win: { money: 0.4, flags: ["xc_relapse"], log: "Trót lọt. Nhưng giờ họ có thứ để nắm bạn." }, lose: { money: -0.3, flags: ["xc_relapse", "xc_second_term"], happy: -10, log: "Bạn bị bắt lại. Lần này tòa không còn nương tay." } } }, "Tiền nhanh, có thể vào lại"),
    C("Báo cho cán bộ quản lý, xin chuyển nơi ở", { counters: step(c, Pe), money: -0.15, flags: ["xc_moved_on"], close_doors: ["partner_circle"], agency: 0.03 }, "Bị coi là phản bội, cắt hẳn quá khứ", { tier: "sovereign" })], 0), (c) => c.age >= 18),
  beat(Pe, 4, 5, (c) => { const down = f(c, "xc_second_term"); return T(down ? "Lần thứ hai sau song sắt" : "Một chỗ đứng nhỏ", down
    ? "Bạn lại ở trong trại, giữa những gương mặt mới mà quen. Lần này không ai đến thăm nữa. Một cán bộ hỏi bạn có muốn học nghề không."
    : `Mấy năm không tái phạm, bạn có chút tiền và chút tin tưởng của người quanh mình.${f(c, "xc_honest_job") ? " Ông chủ cũ muốn giao cho bạn quản lý xưởng." : ""} Một tổ chức hỏi bạn có chịu nói chuyện với những người sắp ra trại không.`, [
    C(down ? "Học nghề, học chữ, đếm từng ngày" : "Nhận lời đi nói chuyện, công khai quá khứ", { counters: step(c, Pe, { honest: 1 }), know: 4, flags: ["xc_speaker"], ...(down ? { income_mult: 1.1 } : { rel: 6, agency: 0.03 }) }, down ? "Chậm, nhưng là một lối ra" : "Lộ chuyện cũ, giúp người khác"),
    C(down ? "Buông xuôi, sống theo luật trong trại" : "Giữ kín quá khứ, lo cho riêng mình", { counters: step(c, Pe), income_mult: down ? 0.8 : 1.2, happy: down ? -6 : 2, flags: ["xc_kept_quiet"] }, down ? "Dễ chịu bây giờ, khó ra hơn" : "Yên ổn, quá khứ còn treo đó"),
    C("Chuyển đến nơi không ai biết mình, làm lại", { counters: step(c, Pe), ...leave(Pe), flags: ["xc_new_life"], close_doors: ["return_home"], money: -0.3, happy: 3 }, "Mất cội rễ, được làm người mới")], 0); }, (c) => c.age >= 18),
  beat(Pe, 5, 6, (c) => T("Người đợi ở cổng trại",
    `Nhiều năm sau, có người nhờ bạn đến đón một thanh niên mãn hạn mà không ai đến đón. Cậu ấy cầm cái túi nilon y như bạn ngày xưa.${f(c, "xc_speaker") ? " Cậu ấy từng nghe bạn nói chuyện trong trại." : ""}`, [
    C("Đưa cậu ấy về ở cùng mấy tháng", { counters: step(c, Pe), money: -0.1, rel: 6, flags: ["passed_on"], happy: 4 }, "Tốn kém, có thể bị phụ lòng"),
    C("Cho ít tiền và một địa chỉ", { counters: step(c, Pe), money: -0.03, rel: 2 }),
    C("Từ chối, không muốn dính lại chuyện cũ", { counters: step(c, Pe), happy: -2 }, "Yên thân, nhớ mình từng chờ ai")], 0), (c) => c.age >= 35),

  /* ---------- chuyện thường ngày ---------- */
  daily(Pe, "xc_checkin", [18, 65], 7, (c) => T("Trình diện định kỳ", vary("xcc", c.age, [
    "Đến ngày trình diện, nhưng chủ xưởng không cho nghỉ. Trễ một buổi là có thể bị ghi vi phạm.",
    "Cán bộ quản lý mới tỏ ra khó chịu, hỏi đi hỏi lại bạn làm gì, đi đâu, gặp ai."]), [
    C("Xin nghỉ, đến trình diện đúng giờ", { money: -0.02, counters: { honest: 1 }, flags: ["xc_compliant"] }, "Mất ngày công, hồ sơ sạch"),
    C("Đi làm, mong lần sau giải thích", { money: 0.02, gamble: { p: 0.6, win: { log: "Lần này họ bỏ qua." }, lose: { flags: ["xc_violation"], happy: -5, log: "Bạn bị ghi một lần vi phạm." } } }, "Giữ việc, liều với hồ sơ")], 0)),
  daily(Pe, "xc_landlord", [18, 65], 9, () => T("Chủ nhà biết chuyện",
    "Chủ nhà trọ nghe ai đó kể bạn từng ở tù. Bà ấy chưa đuổi, chỉ bảo cuối tháng 'tính lại'. Mấy nhà bên cạnh bắt đầu khóa cửa khi thấy bạn đi qua.", [
    C("Gặp bà ấy, kể thật đầu đuôi", { gamble: { p: 0.5, win: { rel: 4, flags: ["xc_landlord_ok"], log: "Bà ấy nghe hết, rồi bảo: 'Ở đi, trả tiền đúng hạn là được.'" }, lose: { money: -0.08, log: "Cuối tháng bạn phải dọn đi." } } }, "Có thể được tin, có thể mất chỗ"),
    C("Dọn đi trước khi bị đuổi", { money: -0.06, happy: -3, flags: ["xc_moved_again"] }, "Tránh nhục, lại bắt đầu từ đầu")], 0)),
  daily(Pe, "xc_papers", [18, 65], 9, () => T("Lấy lại giấy tờ",
    "Không có giấy tờ tùy thân thì không mở được tài khoản, không thuê được nhà, không ký được hợp đồng. Thủ tục làm lại cần đi lại nhiều lần, và có người gợi ý một 'đường tắt' tốn tiền.", [
    C("Kiên nhẫn đi đúng thủ tục", { bw: -5, happy: -2, counters: { honest: 1 }, flags: ["xc_papers_ok"] }, "Chậm, mệt, sạch sẽ"),
    C("Đi đường tắt cho nhanh", { money: -0.1, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [1, 6], note: "lót tay làm lại giấy tờ sau khi ra tù" } }, "Nhanh, thêm một chuyện để giấu")], 0)),
  daily(Pe, "xc_habits", [18, 70], 8, (c) => T("Thói quen của trại", vary("xch", c.age, [
    "Bạn vẫn thức dậy lúc năm giờ, ăn thật nhanh, ngồi quay lưng vào tường. Người nhà bảo bạn trông như lúc nào cũng chờ bị gọi tên.",
    "Có những đêm bạn không ngủ được trong căn phòng quá yên, quá rộng."]), [
    C("Tìm người tư vấn, nói ra", { money: -0.04, health: 3, happy: 3, flags: ["xc_counseling"] }, "Tốn tiền, nhẹ dần"),
    C("Tự chịu, không kể với ai", { bw: -4, happy: -3, counters: { drink: 1 } }, "Không ai biết, nặng dần")], 0)),
  daily(Pe, "xc_easy_money", [18, 60], 8, () => T("Tiền nhanh gõ cửa",
    "Một người ngoài chợ biết bạn từng 'ở trong', nghĩ bạn sẽ không ngại việc mờ ám. Anh ta đưa ra một số tiền bằng ba tháng làm thuê.", [
    C("Nhận lời", { money: 0.25, counters: { honest: -1 }, flags: ["xc_relapse"], close_doors: ["village_trust"] }, "Tiền ngay, một chân đã bước lại"),
    C("Từ chối, nói rõ mình đã khác", { happy: 2, counters: { honest: 1 } }, "Mất tiền, giữ được bản thân")], 1)),
  daily(Pe, "xc_victim", [20, 70], 12, () => T("Gặp lại người bị hại",
    "Một chương trình hòa giải đề nghị bạn ngồi đối diện người bị hại năm xưa, hoặc người nhà của họ. Họ sẽ nói những gì đã mất. Bạn chỉ được nghe.", [
    C("Đồng ý gặp, nghe hết", { custom: "apologize", happy: -4, agency: 0.03, flags: ["xc_restorative"] }, "Đau đớn, có thể là sự giải thoát", { tier: "awakened" }),
    C("Viết thư xin lỗi thay vì gặp", { happy: 1, flags: ["xc_wrote_letter"] }, "Nhẹ hơn, có thể không đủ"),
    C("Từ chối, chuyện đã qua", { happy: -1 })], 0)),
  daily(Pe, "xc_gossip", [18, 70], 9, (c, N) => { const n = role(c, "neighbor")!; return T("Lời đồn trong xóm",
    `Đồ của nhà ${N(n)} bị mất. Chưa ai nói thẳng, nhưng mọi ánh mắt đều nhìn về phía bạn.`, [
    C("Đến nhà, đề nghị cùng đi trình báo", { gamble: { p: 0.6, win: { memory: { npc: n, tag: "GOSSIP_HEARD_GOOD", weight: 0.2, note: "tự đến chứng minh mình trong sạch" }, rel: 3, log: "Kẻ trộm thật bị bắt. Hàng xóm chào bạn khác hẳn." }, lose: { happy: -4, log: "Không tìm ra ai. Tiếng xấu vẫn bám." } } }, "Dám đối diện, có thể không đủ"),
    C("Im lặng, tránh mặt", { happy: -3, memory: { npc: n, tag: "GOSSIP_HEARD_BAD", weight: -0.1, note: "nghi lấy đồ nhà họ" } }, "Không cãi, mang tiếng")], 0, { npc: n }); }, (c) => !!role(c, "neighbor")),
  daily(Pe, "xc_chance", [18, 65], 10, (c, N) => { const b = role(c, "first_boss") ?? role(c, "mentor"); return T("Người cho một cơ hội",
    `${b ? N(b) : "Một chủ quán"} nhận bạn vào làm dù biết hết quá khứ, chỉ dặn một câu: "Đừng để tôi phải hối hận."`, [
    C("Làm hết sức, sớm nhất muộn nhất", { health: -2, income_mult: 1.15, ...(b ? { trust: { npc: b, delta: 0.25 } } : { flags: ["xc_trusted"] }) }, "Mệt, nhưng có người tin"),
    C("Làm vừa đủ, đợi việc khác tốt hơn", { flags: ["xc_drifting"], happy: 1 }, "Nhẹ nhàng, dễ đánh mất cơ hội")], 0, b ? { npc: b } : {}); }),
  daily(Pe, "xc_expunge", [24, 70], 99, () => T("Đơn xóa án tích",
    "Đã đủ năm, bạn có thể làm đơn xin xóa án tích. Thủ tục dài, phải xin xác nhận của nhiều nơi, và gặp lại những người từng không muốn nhìn mặt bạn.", [
    C("Làm đơn, đi đến cùng", { bw: -5, gamble: { p: 0.7, win: { flags: ["xc_expunged"], income_mult: 1.15, happy: 6, log: "Tờ giấy xác nhận không còn án tích. Bạn đọc nó ba lần." }, lose: { happy: -4, log: "Hồ sơ bị trả về vì thiếu một xác nhận." } } }, "Mệt mỏi, có thể sạch hồ sơ"),
    C("Thôi, sống được là được", { happy: -1, flags: ["xc_no_expunge"] })], 0)),

  /* ---------- gia đình ---------- */
  cross(Pe, "xc_family", [20, 70], (c) => !!role(c, "child") || !!role(c, "spouse") || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child");
    if (k) return T(`${N(k)} lớn lên khi bạn vắng nhà`, `${N(k)} đã lớn trong những năm bạn ở trong trại. Nó lễ phép, xa cách, gọi bạn như gọi một người khách. Bạn bè nó không biết bố mẹ nó từng đi tù.`, [
      C("Kể thật với con mọi chuyện", { trust: { npc: k, delta: 0.15 }, happy: -2, flags: ["xc_told_child"] }, "Đau một lần, xây lại từ thật"),
      C("Không nhắc, cố làm người bình thường", { trust: { npc: k, delta: 0.05 }, flags: ["xc_silent_parent"] }, "Êm bây giờ, có thể vỡ về sau"),
      C("Hứa với con một năm không vắng ngày nào", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "có mặt mọi ngày quan trọng của con", years: 1 } }, "Một lời hứa phải giữ", { tier: "awakened" })], 0, { npc: k });
    const p = (role(c, "spouse") ?? role(c, "mother") ?? role(c, "father"))!;
    return T("Người đã chờ bạn", `${N(p)} đã thăm nuôi bạn suốt những năm ấy, chịu bao lời ra tiếng vào. Giờ bạn đã về, ${N(p)} hỏi: "Lần này có chắc không?"`, [
      C("Hứa, và để người ấy giữ tiền nong", { trust: { npc: p, delta: 0.2 }, promise: { to: p, what: "không bao giờ quay lại con đường cũ", years: 5 } }, "Ràng buộc mình, trả nợ ân tình"),
      C("Nói đừng lo, mình tự biết", { trust: { npc: p, delta: -0.1 }, happy: 1 }, "Giữ tự ái, người ấy thêm lo")], 0, { npc: p }); }),
];

/* ================================================================== XUẤT GÓI */
export const PACK_UNDER_B: Storylet[] = [...GAMBLER, ...COUNTERFEITER, ...HACKER, ...EX_CONVICT];
