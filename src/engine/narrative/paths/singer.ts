/**
 * Gói mẫu: CA SĨ (18 thẻ). Đây là chuẩn cho mọi gói khác — đọc kèm docs/content-guide.md.
 * 1 năng khiếu · 2 cơ hội · 5 nhịp truyện · 9 chuyện thường ngày · 1 chuyện gia đình.
 */
import type { Storylet } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const P = "singer";

export const SINGER: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(P, "sg_t_voice", [8, 14], () => true, (c) => T("Giọng hát", "Buổi văn nghệ cuối năm, cô giáo bắt bạn hát thay một bạn bị ốm. Cả sân trường im lặng nghe. Cô bảo giọng bạn hiếm.", [
    C("Xin bố mẹ cho đi học hát", { money: -0.03, flags: [talentFlag(P)], counters: { talents_seen: 1 }, happy: 3 }, "Tốn tiền nhà, mở một con đường"),
    C("Hát cho vui thôi", { counters: { talents_seen: 1 } })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(P, "sg_d_contest", [18, 30], (c) => !c.poor_country || f(c, talentFlag(P)), () => T("Cuộc thi trên truyền hình", "Một cuộc thi hát trên truyền hình mở vòng sơ khảo ở thành phố. Người xếp hàng dài từ sáng. Bạn có một bài hát tủ.", [
    C("Đi thi, bỏ việc đang làm", { ...become(P), counters: { doors_seen: 1 }, money: -0.1, agency: 0.02 }, "Đặt cược cả công việc"),
    C("Đi thi nhưng giữ việc", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(P), log: "Bạn lọt vào vòng trong. Một quản lý xin số điện thoại." }, lose: { happy: -3, log: "Bạn bị loại ở vòng đầu." } } }),
    C("Thôi", { counters: { doors_seen: 1 } })], 1)),
  door(P, "sg_d_band", [18, 35], () => true, () => T("Ban nhạc thiếu người hát", "Ban nhạc chơi ở quán đầu phố mất người hát chính. Họ trả mỗi tối một ít, nhưng hát đến nửa đêm.", [
    C("Nhận, hát mỗi tối", { ...become(P), counters: { doors_seen: 1 }, health: -2 }, "Thu nhập bấp bênh, được hát"),
    C("Chỉ hát cuối tuần", { counters: { doors_seen: 1 }, money: 0.03, happy: 2 })], 1)),

  /* ---------- mạch truyện ---------- */
  beat(P, 1, 1, (c) => T("Đêm diễn đầu tiên", "Một sân khấu nhỏ, sáu mươi khán giả, ánh đèn hỏng một bên. Chủ quán muốn bạn hát những bài ai cũng thuộc. Bạn có ba bài tự viết.", [
    C("Hát bài của mình", { counters: step(c, P), flags: ["own_songs"], gamble: { p: 0.4, win: { happy: 6, log: "Có người quay lại đêm hôm sau chỉ để nghe bài đó." }, lose: { happy: -3, log: "Khán giả nói chuyện suốt bài." } } }, "Có thể không ai nghe"),
    C("Hát bài quen cho chắc", { counters: step(c, P), money: 0.02 })], 0)),
  beat(P, 2, 3, (c) => T("Hợp đồng mười năm", `Một bài hát của bạn bỗng được chia sẻ khắp nơi. Một công ty giải trí đưa hợp đồng mười năm: họ lo hết, đổi lại giữ sáu phần mười thu nhập và quyền với mọi bài hát.`, [
    C("Ký", { counters: step(c, P), income_mult: 1.8, flags: ["label_contract"] }, "Nổi nhanh, mất quyền bài hát"),
    C("Tự phát hành, tự lo", { counters: step(c, P), income_mult: 1.2, bw: -6, flags: ["indie_artist"] }, "Chậm, mệt, giữ được tất cả"),
    C("Đòi hợp đồng ba năm, giữ quyền bài hát", { counters: step(c, P), gamble: { p: 0.45, win: { income_mult: 1.5, flags: ["owns_masters"], log: "Họ đồng ý. Bạn là người đầu tiên trong công ty được giữ quyền bài hát." }, lose: { income_mult: 1.1, log: "Họ rút lời mời. Bạn vẫn còn bài hát của mình." } } }, "Lựa chọn thứ ba", { tier: "sovereign" })], 0)),
  beat(P, 3, 4, (c) => T("Giọng khàn", "Sau ba tháng lưu diễn, bác sĩ nói dây thanh của bạn có hạt xơ. Nghỉ sáu tháng thì có thể lành. Tuần sau có đêm diễn lớn nhất từ trước tới giờ.", [
    C("Hủy hết, nghỉ chữa", { counters: step(c, P), income_mult: 0.7, money: -0.2, health: 6 }, "Mất đà, giữ được giọng"),
    C("Uống thuốc, hát tiếp", { counters: step(c, P), money: 0.3, gamble: { p: 0.5, win: { log: "Bạn qua được mùa diễn. Giọng không còn như cũ, nhưng không ai nhận ra." }, lose: { income_mult: 0.5, health: -8, log: "Giữa đêm diễn, giọng bạn vỡ. Đoạn phim lan khắp mạng." } } }, "Tiền bây giờ, giọng về sau")], 0)),
  beat(P, 4, 5, (c) => T(f(c, "label_contract") ? "Hết hạn hợp đồng" : "Sân khấu lớn", f(c, "label_contract")
    ? "Mười năm trôi qua. Công ty muốn gia hạn, nhưng bạn biết họ đang nâng một gương mặt trẻ hơn. Bài hát cũ của bạn vẫn thuộc về họ."
    : `Lần đầu tiên bạn có một đêm diễn riêng ở nhà hát lớn.${(c.counters.sg_fame ?? 0) >= 2 ? " Vé bán hết trong một giờ." : " Còn một nửa ghế trống đến phút chót."} Một nhà tài trợ muốn in logo lên mọi thứ.`, [
    C("Mở công ty riêng, đào tạo người trẻ", { counters: step(c, P), money: -0.6, flags: ["own_label"], agency: 0.03 }, "Vốn lớn, thành người làm nghề"),
    C(f(c, "label_contract") ? "Gia hạn, giữ chỗ" : "Nhận nhà tài trợ", { counters: step(c, P), income_mult: 1.3 }),
    C("Lui về, hát ở phòng trà nhỏ", { counters: step(c, P), income_mult: 0.6, happy: 5 })], 0)),
  beat(P, 5, 6, (c) => T("Bài hát cũ", "Một ca sĩ trẻ xin hát lại bài hát đầu tay của bạn trong cuộc thi lớn. Bản của cậu ấy hay hơn bản của bạn ngày xưa.", [
    C("Cho phép, không lấy tiền", { counters: step(c, P), rel: 5, happy: 4, flags: ["passed_on"] }),
    C("Cho phép, lấy tiền bản quyền", { counters: step(c, P), money: 0.3 }),
    C("Không cho", { counters: step(c, P), happy: -2 })], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(P, "sg_wedding", [18, 60], 6, (c) => T("Hát đám cưới", vary("sgw", c.age, ["Một nhà giàu thuê bạn hát đám cưới, trả bằng ba đêm diễn.", "Mùa cưới, tuần nào cũng có người gọi hát tiệc."]), [
    C("Nhận", { money: 0.06, happy: -1, counters: { sg_fame: -1 } }, "Tiền dễ, mất giá"), C("Từ chối, giữ hình ảnh", { happy: 1, counters: { sg_fame: 1 } })], 0)),
  daily(P, "sg_fan", [18, 60], 8, (c) => T("Người hâm mộ", vary("sgf", c.age, ["Có một người đứng chờ bạn ở cửa sau mọi đêm diễn suốt ba tháng.", "Một người hâm mộ gửi thư dài mười trang, biết cả địa chỉ nhà bạn."]), [
    C("Nói chuyện tử tế một lần", { counters: { sg_fame: 1 }, gamble: { p: 0.7, win: { log: "Họ thôi chờ. Lá thư cuối chỉ có hai chữ cảm ơn." }, lose: { bw: -6, log: "Họ đến tận nhà." } } }), C("Nhờ quản lý báo công an", { bw: -2, flags: ["stalker_case"] })], 1)),
  daily(P, "sg_copy", [20, 65], 7, () => T("Bài hát bị lấy", "Bạn nghe một bài đứng đầu bảng xếp hạng, giai điệu giống hệt bài bạn viết năm năm trước.", [
    C("Kiện", { money: -0.15, gamble: { p: 0.4, win: { money: 0.5, log: "Tòa xử bạn thắng." }, lose: { happy: -4, log: "Không đủ bằng chứng." } } }), C("Đăng bản gốc lên mạng, để người nghe tự phân xử", { rel: 2, flags: ["public_fight"] }), C("Im lặng", { happy: -3 })], 2)),
  daily(P, "sg_tour", [20, 55], 6, (c) => T("Lưu diễn", vary("sgt", c.age, ["Chuyến lưu diễn ba mươi tỉnh, hai tháng không về nhà.", "Một chuyến diễn cho cộng đồng người Việt ở nước ngoài, một tháng."]), [
    C("Đi", { money: 0.15, rel: -3, health: -2, counters: { sg_fame: 1 } }), C("Chỉ nhận nửa lịch", { money: 0.06 })], 0)),
  daily(P, "sg_rival", [20, 60], 8, (c, N) => { const r = role(c, "rival")!; return T("Người cùng nghề", `${N(r)} cũng đi hát, và vừa nói xấu bạn trên một chương trình truyền hình.`, [
    C("Đáp trả công khai", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.2, note: "cãi nhau trên truyền hình" }, rel: 1 }), C("Mời đi hát chung một bài", { gamble: { p: 0.5, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "song ca làm lành" }, log: "Bản song ca được nghe nhiều hơn cả hai bài riêng." }, lose: { log: "Họ không trả lời." } } }, undefined, { tier: "awakened" })], 1, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(P, "sg_voice", [18, 60], 8, () => T("Giữ giọng", "Sau đêm diễn, cả ban rủ đi nhậu và hút thuốc đến sáng.", [
    C("Đi cùng", { rel: 3, counters: { drink: 1, smoke: 1 }, health: -2 }), C("Về ngủ", { rel: -1, health: 1 })], 1)),
  daily(P, "sg_comments", [16, 60], 7, (c) => T("Bình luận", vary("sgc", c.age, ["Dưới video mới của bạn có hàng nghìn bình luận chê bạn già, bạn béo, bạn hết thời.", "Một đoạn bạn hát sai lời bị cắt ra, thành trò cười trên mạng."]), [
    C("Đọc hết", { happy: -6 }), C("Tắt điện thoại một tuần", { happy: 1, bw: 3 }), C("Tự làm video chế lại chính mình", { gamble: { p: 0.5, win: { rel: 4, counters: { sg_fame: 1 }, log: "Người ta cười cùng bạn, không còn cười bạn." }, lose: { happy: -2 } } })], 1)),
  daily(P, "sg_charity", [20, 70], 8, () => T("Đêm nhạc từ thiện", "Một đêm nhạc gây quỹ cho vùng lũ mời bạn hát không lấy tiền. Có tin đồn ban tổ chức giữ lại một phần tiền quyên góp.", [
    C("Hát, và đòi công khai sổ sách", { rel: 3, agency: 0.01, flags: ["leader"] }), C("Hát, không hỏi gì", { rel: 2 }), C("Từ chối", {})], 0)),
  daily(P, "sg_payola", [20, 55], 9, () => T("Lót tay", "Một nhà sản xuất nói muốn bài của bạn lên sóng giờ vàng thì phải gửi một khoản.", [
    C("Gửi", { money: -0.2, income_mult: 1.15, secret: { tag: "PAID_BRIBE", severity: 0.3, fuse_years: [3, 10], note: "lót tay để lên sóng" } }, "Lên sóng, có một bí mật"),
    C("Không", { counters: { honest: 1 } })], 1)),
  daily(P, "sg_quit", [30, 60], 99, (c) => T("Giữa hai cuộc đời", "Một người bạn mời bạn về làm quản lý nhà hàng, lương ổn định gấp đôi những năm bạn đi hát tệ nhất.", [
    C("Giải nghệ, đi làm ổn định", { ...leave(P), flags: ["ex_singer"] }, "Bình yên, mất sân khấu"), C("Vẫn hát", { happy: 2 })], 1), (c) => c.happy < 50 || c.broke),

  /* ---------- gia đình ---------- */
  cross(P, "sg_family", [22, 60], (c) => !!role(c, "father") || !!role(c, "mother") || (c.kids_teen > 0 && !!role(c, "child")), (c, N) => { const k = role(c, "child"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn đi hát`, `${N(k)} muốn bỏ học để đi theo con đường của bạn.`, [
      C("Ủng hộ", { trust: { npc: k, delta: 0.2 }, money: -0.05 }), C("Cấm, bắt học xong", { trust: { npc: k, delta: -0.2 } }), C("Cho thử một năm, có điều kiện", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "giúp con một năm đi hát", years: 1 } }, undefined, { tier: "awakened" })], 2, { npc: k });
    return T("Nghề xướng ca", `${N(p!)} vẫn nói với hàng xóm rằng bạn "làm việc văn phòng". ${N(p!)} chưa từng đến một đêm diễn nào.`, [
      C("Mời bố mẹ đến xem", { gamble: { p: 0.6, win: { trust: { npc: p!, delta: 0.3 }, log: `${N(p!)} ngồi hàng ghế cuối, về nhà không nói gì, nhưng giữ tấm vé.` }, lose: { trust: { npc: p!, delta: -0.1 }, log: `${N(p!)} không đến.` } } }),
      C("Thôi, để bố mẹ nghĩ gì thì nghĩ", { happy: -2 })], 0, { npc: p! }); }),
];
