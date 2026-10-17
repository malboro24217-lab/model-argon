/**
 * Gói NGHỆ THUẬT B: nghệ nhân âm nhạc dân gian · diễn viên hài · vũ công. Đọc kèm docs/content-guide.md và gói mẫu singer.ts.
 * Mỗi con đường: năng khiếu · 3 cơ hội · 5 nhịp truyện · 10 chuyện thường ngày · 1 chuyện gia đình.
 * Tiền tố id: fkm_ (folk_musician) · cmd_ (comedian) · dnc_ (dancer).
 * Bộ đếm đọc lại ở các nhịp sau: fk_songs, fk_students, fk_fame, fk_purity · cm_fame, cm_craft · dn_fame, dn_wear.
 */
import type { Storylet, FactContext, Effect, MemoryTag } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, leave, step, talent, door, beat, daily, cross } from "./kit.ts";

const FK = "folk_musician";
const CM = "comedian";
const DN = "dancer";

/* ---------- tiện ích chung của gói ---------- */
/** Tiền của người chưa đủ 18 tuổi là chuyện của cả hộ: kẹp trong ±0.05. Nhịp truyện không có cổng tuổi nên luôn đi qua đây. */
const km = (c: FactContext, x: number): number => (c.age < 18 ? Math.max(-0.05, Math.min(0.05, x)) : x);
const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;
/** Ký ức với một người chỉ khi người đó có thật trong đời này. */
const mem = (npc: string | undefined, tag: MemoryTag, weight: number, note: string): Effect => (npc ? { memory: { npc, tag, weight, note } } : {});

/** Môn hát, cây đàn và nơi hát: cố định theo đời. Riêng Việt Nam có tên môn cụ thể; nước khác dùng cách gọi chung. */
const FOLK_VN: ReadonlyArray<readonly [string, string, string]> = [
  ["ca trù", "cây đàn đáy", "sân đình"],
  ["đờn ca tài tử", "cây đàn kìm", "buổi đờn ca của xóm"],
  ["hát then", "cây đàn tính", "lễ cầu mùa của bản"],
  ["hát chầu văn", "cây đàn nguyệt", "lễ hội đền"],
];
const folk = (c: FactContext): { art: string; inst: string; place: string } => {
  const k = vn(c) ? FOLK_VN[Math.floor((c.luck ?? 0) * FOLK_VN.length) % FOLK_VN.length]! : (["hát cổ của vùng", "cây đàn cổ truyền", "lễ hội mùa của làng"] as const);
  return { art: k[0], inst: k[1], place: k[2] };
};
const school = (c: FactContext): string => (vn(c) ? "trường múa" : "học viện múa");

export const PACK_ARTS_B: Storylet[] = [
  /* =====================================================================
   *  NGHỆ NHÂN ÂM NHẠC DÂN GIAN — giữ nguyên, làm mới, hay bán đi một thứ của chung
   * ===================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(FK, "fkm_t_lullaby", [8, 14], () => true, (c) => { const { art } = folk(c); return T("Bài hát ru của bà", `Bà hát ru em bạn bằng những câu ${art} mà cả xóm không ai còn thuộc. Bạn nghe một lần là nhớ đủ bốn mươi câu, kể cả những chữ cổ không ai giải nghĩa được. Bà bảo: "Đứa này có tai."`, [
    C("Theo bà học hết các bài, mỗi tối một câu", { flags: [talentFlag(FK)], counters: { talents_seen: 1, fk_songs: 1 }, know: 2, happy: 2, bw: -2 }, "Bớt giờ chơi, giữ được thứ sắp mất"),
    C("Nghe cho vui, tối về học bài trên lớp", { counters: { talents_seen: 1 }, know: 2 }, "Học hành đều đặn, những câu hát trôi đi")], 0); }),

  /* ---------- cơ hội bước vào ---------- */
  door(FK, "fkm_d_master", [18, 45], () => true, (c) => { const { art } = folk(c); return T("Người thầy tám mươi tuổi", `Người cuối cùng còn thuộc trọn ${art} ở vùng bạn năm nay tám mươi tuổi. Ông tìm người truyền nghề: không học phí, không lương, ba năm đầu chỉ được ngồi nghe và chép. Ông nói mình không còn nhiều mùa nữa.`, [
    C("Nghỉ việc, theo thầy", { ...become(FK), counters: { doors_seen: 1, fk_songs: 2 }, money: -0.2, agency: 0.02 }, "Ba năm không lương, học trọn một kho bài"),
    C("Học buổi tối, vẫn giữ việc", { counters: { doors_seen: 1 }, bw: -4, gamble: { p: 0.35, win: { ...become(FK), counters: { fk_songs: 1 }, log: "Sau một năm, ông giao cho bạn hát chính ở buổi lễ lớn của làng." }, lose: { log: "Bạn đến muộn ba buổi liền. Ông nhận một học trò khác." } } }, "Giữ thu nhập, có thể không theo kịp"),
    C("Ghi âm giúp ông, rồi về", { counters: { doors_seen: 1 }, flags: ["fk_recorded_master"], rel: 1 }, "Giữ được tiếng hát, không giữ được nghề")], 0); }),
  door(FK, "fkm_d_festival", [12, 50], () => true, (c) => { const { place } = folk(c); return T("Lễ hội thiếu người hát", `Người hát chính ở ${place} vừa mất, hai tháng trước mùa lễ. Các cụ nhớ hồi nhỏ bạn hay đứng sau hát theo, đến tận nhà nhờ bạn đứng ra. Hát lễ không có tiền, chỉ có bữa cơm và sự nể trọng của cả làng.`, [
    C("Nhận lời, hát trọn mùa lễ", { ...become(FK), counters: { doors_seen: 1 }, rel: 4, money: km(c, -0.08) }, "Được làng nể, bớt thời gian làm ăn"),
    C("Hát năm nay thôi, sang năm tìm người khác", { counters: { doors_seen: 1 }, rel: 2, happy: 2 }, "Giữ đời mình, làng vẫn thiếu người"),
    C("Từ chối, nói mình chưa đủ sức", { counters: { doors_seen: 1 }, rel: -2 })], 0); }),
  door(FK, "fkm_d_viral", [16, 50], () => true, (c) => { const { inst } = folk(c); return T("Đoạn phim ở bến xe", `Bạn ngồi gảy ${inst} chờ chuyến xe về quê, một người lạ quay lại rồi đăng lên mạng. Hai ngày sau, đoạn phim có ba triệu lượt xem. Một trung tâm văn hóa ở thành phố gọi điện mời bạn diễn mỗi tối thứ Bảy.`, [
    C("Lên thành phố, sống bằng tiếng đàn", { ...become(FK), counters: { doors_seen: 1, fk_fame: 1 }, money: km(c, -0.1) }, "Thu nhập bấp bênh, được sống với nghề"),
    C("Diễn cuối tuần, giữ việc chính", { counters: { doors_seen: 1 }, money: km(c, 0.04), bw: -3, gamble: { p: 0.3, win: { ...become(FK), log: "Nửa năm sau, khách đến vì bạn nhiều hơn vì quán. Bạn nghỉ việc chính." }, lose: { log: "Đoạn phim nguội dần. Lịch thứ Bảy bị cắt sau ba tháng." } } }, "Chắc ăn, có thể lỡ con sóng"),
    C("Nhờ người ta gỡ đoạn phim xuống", { counters: { doors_seen: 1 }, happy: 1 }, "Yên ổn, khép lại một cánh cửa")], 1); }),

  /* ---------- mạch truyện ---------- */
  beat(FK, 1, 1, (c) => { const { place } = folk(c); return T("Lần đầu hát chính", `Lần đầu bạn hát chính ở ${place}. Giữa bài, bạn thấy đám trẻ ngồi ngơ ngác: chúng không hiểu một chữ nào trong lời cổ. Các cụ ngồi hàng đầu, mắt nhắm, nghe từng nhịp.`, [
    C("Hát đúng từng chữ như người xưa", { counters: step(c, FK, { fk_purity: 1 }), flags: ["fk_purist"], rel: 2 }, "Được các cụ tin, mất khán giả trẻ"),
    C("Dừng lại giảng nghĩa từng câu rồi hát tiếp", { counters: step(c, FK, { fk_students: 1 }), flags: ["fk_explainer"], gamble: { p: 0.6, win: { happy: 4, log: "Tan buổi, ba đứa trẻ ở lại hỏi bạn nghĩa của một câu cổ." }, lose: { rel: -2, log: "Các cụ cau mày: hát lễ đâu phải giờ học." } } }, "Mở lối cho người trẻ, phật lòng người già"),
    C("Thêm nhịp trống nhanh cho dễ nghe", { counters: step(c, FK, { fk_purity: -1, fk_fame: 1 }), flags: ["fk_fusion"], gamble: { p: 0.5, win: { happy: 3, log: "Đám thanh niên vỗ tay theo nhịp đến hết bài." }, lose: { rel: -3, log: "Một cụ đứng dậy bỏ về giữa bài." } } }, "Dễ nghe hơn, có người cho là phá lề")], 0); }),
  beat(FK, 2, 3, (c, N) => { const { art } = folk(c); const m = role(c, "mentor");
    return T("Hồ sơ di sản", `${vn(c) ? "Sở văn hóa" : "Cơ quan văn hóa"} đang làm hồ sơ để ${art} được công nhận là di sản. Họ cần một gương mặt đại diện, và họ chọn bạn. Đổi lại, lời hát phải thống nhất một bản, áo may lại cho đẹp lên hình. ${m ? `${N(m)}, người dạy bạn những bài đầu tiên,` : "Người hát lâu năm nhất vùng"} nói giọng nặng nên không được chọn.`, [
    C("Nhận làm gương mặt đại diện", { counters: step(c, FK, { fk_fame: 2, fk_purity: -1 }), income_mult: 1.4, flags: ["fk_official_face"] }, "Có tiền và tiếng, lời hát bị đóng khuôn"),
    C("Đề cử người hát lâu năm hơn", { counters: step(c, FK, { fk_purity: 1 }), rel: 3, ...mem(m, "STOOD_UP_FOR_ME", 0.3, "nhường suất đại diện hồ sơ di sản") }, "Giữ đạo thầy trò, lùi khỏi ánh đèn"),
    C("Nhận, nếu hồ sơ ghi tên mọi người hát", { counters: step(c, FK), gamble: { p: 0.45, win: { income_mult: 1.2, flags: ["fk_open_archive"], counters: { fk_fame: 1 }, log: "Hồ sơ in tên bốn mươi hai người hát, già nhất chín mươi mốt tuổi; mọi bản ghi để ở thư viện công." }, lose: { log: "Họ chọn một gương mặt khác dễ bảo hơn. Bạn vẫn hát ở làng." } } }, "Lựa chọn thứ ba: di sản là của cả làng", { tier: "sovereign" })], 0, m ? { npc: m } : {}); }),
  beat(FK, 3, 4, (c) => { const { inst } = folk(c);
    const ctx = f(c, "fk_open_archive") ? " May mà một nửa số bài đã nằm ở thư viện công; nửa còn lại chỉ có trong mấy cuốn sổ ấy."
      : f(c, "fk_official_face") ? " Tiền hỗ trợ cho gương mặt đại diện chỉ đủ tiền xăng, giấy xin thêm thì nằm chờ sáu tháng."
      : f(c, "fk_fusion") ? " Bản phối nhịp nhanh năm nào giờ không ai nghe nữa." : "";
    return T("Ba cuốn sổ chép tay", `Người hát già nhất vùng qua đời. Con cháu ông cần tiền, định bán ${inst} trăm tuổi và ba cuốn sổ chép tay lời hát cho một nhà sưu tầm ở xa. Cùng tháng ấy, nhà bạn cạn tiền.${ctx}`, [
    C("Vay tiền chuộc lại cả đàn lẫn sổ", { counters: step(c, FK, { fk_songs: 3 }), money: km(c, -0.5), ...(c.age >= 18 ? { custom: "borrow:0.5" } : {}), flags: ["fk_keeper"] }, "Ôm nợ, giữ được kho bài cho cả vùng", { longterm: true }),
    C("Xin chụp lại từng trang, để họ bán đàn", { counters: step(c, FK, { fk_songs: 1 }), happy: -3 }, "Giữ được chữ, mất tiếng đàn"),
    C("Kêu gọi cả làng góp tiền mua về", { counters: step(c, FK), gamble: { p: 0.5, win: { flags: ["fk_keeper", "fk_village_fund"], rel: 5, log: "Hai trăm hộ góp, nhà ít nhất góp một bữa chợ. Cây đàn treo ở nhà văn hóa, ai cũng được đến chơi." }, lose: { money: km(c, -0.05), log: "Tiền góp không đủ. Nhà sưu tầm trả gấp đôi và mang đàn đi." } } }, "Lựa chọn thứ ba: của chung thì cả làng giữ", { tier: "sovereign" }),
    C("Gác nghề, đi làm công ăn lương", { counters: step(c, FK), ...leave(FK), flags: ["ex_folk_musician"], happy: -5 }, "Có tiền chợ, cây đàn treo lên vách")], 0); }),
  beat(FK, 4, 5, (c) => { const { art } = folk(c);
    const score = n(c, "fk_students") + n(c, "fk_fame") + (f(c, "fk_keeper") ? 1 : 0) + (f(c, "fk_open_archive") ? 1 : 0);
    if (score >= 3) return T("Lời mời từ liên hoan quốc tế", `Một liên hoan âm nhạc thế giới mời bạn sang diễn, vé máy bay họ lo. Họ muốn mười hai phút, áo thật sặc sỡ, và lời giới thiệu rằng ${art} "sắp tuyệt chủng".${f(c, "fk_official_face") ? " Cơ quan văn hóa muốn cử thêm hai cán bộ đi cùng, tiền vé trừ vào cát-xê." : ""}`, [
      C("Đi, diễn đúng như họ muốn", { counters: step(c, FK, { fk_fame: 2 }), money: km(c, 0.3), income_mult: 1.3, happy: 2 }, "Nổi ở xứ người, bài hát thành món lạ"),
      C("Đi, nhưng hát trọn một bài bốn mươi phút", { counters: step(c, FK, { fk_purity: 1 }), gamble: { p: 0.4, win: { counters: { fk_fame: 2 }, income_mult: 1.2, log: "Bốn mươi phút không ai đứng dậy. Một nhạc viện mời bạn dạy một học kỳ." }, lose: { happy: -3, log: "Một nửa khán phòng ra về ở phút thứ hai mươi." } } }, "Giữ trọn bài, có thể mất khán giả"),
      C("Gửi học trò giỏi nhất đi thay", { counters: step(c, FK, { fk_students: 1 }), flags: ["fk_passed_stage"], happy: 1 }, "Nhường sân khấu, đặt cược vào người sau", { tier: "awakened", longterm: true })], 0);
    return T("Lớp học còn một người", `Lớp ${art} bạn mở bao năm giờ chỉ còn một học trò, mà cậu ấy cũng sắp đi làm xa. Tiền nhà tháng này chưa có. ${c.poor_country ? "Một xưởng may đầu làng cần tổ trưởng" : "Một siêu thị trong vùng cần quản lý ca"}, lương gấp ba tiền dạy hát.`, [
      C("Dạy nốt người học trò cuối, chịu nghèo", { counters: step(c, FK, { fk_students: 1 }), money: km(c, -0.15), happy: 1 }, "Thêm nợ tiền nhà, giữ một sợi dây nối"),
      C("Nhận việc ổn định, cất đàn", { counters: step(c, FK), ...leave(FK), flags: ["ex_folk_musician"], money: km(c, 0.1) }, "Hết lo tiền nhà, lặng đi một phần đời"),
      C("Dạy miễn phí trên mạng, ai học cũng được", { counters: step(c, FK, { fk_students: 3 }), money: km(c, -0.1), bw: -4, agency: 0.02, flags: ["fk_online_class"] }, "Lựa chọn thứ ba: mất tiền, học trò ở khắp nơi", { tier: "sovereign" })], 0); }),
  beat(FK, 5, 6, (c) => { const st = n(c, "fk_students");
    return T("Giọng hát cho máy", `Một công ty công nghệ muốn ghi âm ${n(c, "fk_songs") >= 4 ? "hơn ba trăm bài bạn thuộc" : "mọi bài bạn còn nhớ"} để máy hát được bằng giọng bạn mãi về sau. Họ trả bằng mười năm đi hát. ${st >= 3 ? `Bạn có ${st} học trò đang hát được.` : st > 0 ? "Bạn có vài học trò, chưa ai hát trọn được một buổi lễ." : "Bạn chưa có học trò nào."}`, [
    C("Bán giọng cho công ty", { counters: step(c, FK), money: km(c, 1.2), flags: ["fk_voice_sold"], happy: -2 }, "Đủ tiền tuổi già, giọng mình hát thứ mình không chọn"),
    C("Ghi âm hết, tặng thư viện và làng", { counters: step(c, FK), flags: ["passed_on", "fk_legacy_archive"], rel: 5, happy: 4 }, "Không lấy đồng nào, ai cũng nghe được", { longterm: true }),
    C("Cho dùng giọng, đòi chia phần cho quỹ dạy trẻ", { counters: step(c, FK), gamble: { p: 0.4, win: { money: km(c, 0.5), flags: ["fk_village_fund"], log: "Hợp đồng ghi rõ: mỗi bài máy hát, một phần tiền về quỹ dạy trẻ con trong làng." }, lose: { log: "Họ tìm một nghệ nhân khác ít đòi hỏi hơn." } } }, "Lựa chọn thứ ba: máy hát, làng có tiền dạy người", { tier: "sovereign" }),
    C("Từ chối máy, chỉ dạy người thật", { counters: step(c, FK, { fk_students: 1 }), happy: 2, bw: -3, flags: ["fk_oral_only"] }, "Giữ lối truyền miệng, bài có thể mất theo mình")], 1); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(FK, "fkm_tourist", [18, 75], 8, (c) => { const { art } = folk(c); return T("Hai mươi phút cho khách", vary("fkt", c.age, [
    `Một khu nghỉ dưỡng mời bạn diễn ${art} mỗi tối cho khách ăn tối. Họ muốn mỗi bài rút xuống ba phút và bạn mặc áo do họ thiết kế.`,
    "Một công ty du lịch muốn đưa khách đến tận nhà bạn: mỗi đoàn hai mươi phút, trả theo đầu người, khách được cầm đàn chụp ảnh."]), [
    C("Nhận, diễn theo kịch bản của họ", { money: 0.08, counters: { fk_purity: -1 }, happy: -1 }, "Tiền đều, bài hát bị cắt vụn"),
    C("Nhận, dành năm phút kể tích của bài", { money: 0.04, bw: -2, counters: { fk_fame: 1 } }, "Ít tiền hơn, khách mang về được một câu chuyện", { tier: "awakened" }),
    C("Từ chối, chỉ hát ở lễ làng", { counters: { fk_purity: 1 } }, "Giữ chất, túi vẫn mỏng")], 0); }),
  daily(FK, "fkm_crack", [16, 85], 10, (c) => { const { inst } = folk(c); return T("Mặt đàn nứt", `Sau mùa mưa, mặt ${inst.replace("cây ", "")} của bạn nứt một đường dài bằng ngón tay. Người thợ cuối cùng còn làm được loại đàn này ở cách ba trăm cây số, hẹn bốn tháng. Ngoài chợ có đàn làm bằng máy, giá bằng một phần mười, tiếng phẳng lì.`, [
    C("Chờ thợ, trả đủ tiền đàn làm tay", { money: km(c, -0.08), flags: ["fk_handmade"], happy: 2 }, "Đắt và lâu, giữ đúng tiếng đàn"),
    C("Mua tạm đàn làm bằng máy", { money: km(c, -0.01), counters: { fk_purity: -1 } }, "Rẻ và nhanh, tiếng đàn mất hồn"),
    C("Theo người thợ học làm đàn", { bw: -6, know: 4, money: km(c, -0.04), flags: ["fk_luthier"] }, "Mất cả mùa diễn, thêm một nghề hiếm", { tier: "awakened", longterm: true })], 0); }),
  daily(FK, "fkm_collect", [20, 70], 8, (c) => T("Người già cuối cùng còn thuộc", vary("fkc", c.age, [
    "Nghe nói ở một làng trên núi, cách hai ngày đường, có bà cụ chín mươi tuổi còn thuộc những bài chưa ai ghi lại. Đi về mất nửa tháng, đúng lúc mùa diễn sắp tới.",
    "Một ông lão mù ở làng bên nhắn bạn sang: ông muốn hát cho ai đó nghe những bài học từ cha mình, trước khi quên hết."]), [
    C("Đi, ở lại học đến khi thuộc", { money: -0.05, health: -2, know: 3, counters: { fk_songs: 2 } }, "Mất nửa mùa diễn, thêm những bài không ai còn"),
    C("Nhờ người mang máy ghi âm đến", { money: -0.01, gamble: { p: 0.6, win: { counters: { fk_songs: 1 }, log: "Bản ghi được hai mươi bài, có cả tiếng gà gáy chen giữa." }, lose: { happy: -3, log: "Máy hết pin giữa chừng. Mùa sau bạn nghe tin cụ đã mất." } } }, "Giữ lịch diễn, có thể không kịp"),
    C("Hẹn qua mùa diễn rồi đi", { money: 0.03 }, "Giữ thu nhập, người già không chờ được lâu")], 0)),
  daily(FK, "fkm_melody", [20, 80], 10, (c) => { const { art } = folk(c); return T("Giai điệu của làng trên bảng xếp hạng", `Bài hát đứng đầu bảng xếp hạng tuần này dùng nguyên giai điệu một bài ${art} mà làng bạn hát từ đời ông bà. Phần ghi công chỉ có tên một nhạc sĩ trẻ. Làn điệu dân gian không ai giữ bản quyền.`, [
    C("Đăng bản gốc, nói rõ nguồn gốc bài", { flags: ["public_fight"], gamble: { p: 0.5, win: { counters: { fk_fame: 1 }, log: "Người nghe tìm về bản gốc. Lượt nghe bài cổ tăng gấp trăm lần." }, lose: { happy: -3, log: "Người hâm mộ nhạc sĩ kéo vào trang của bạn chửi suốt một tuần." } } }, "Đòi lẽ phải, có thể bị đám đông vây"),
    C("Viết thư đề nghị ghi tên làng, góp quỹ dạy trẻ", { gamble: { p: 0.4, win: { flags: ["fk_village_fund"], rel: 3, log: "Nhạc sĩ ghi thêm dòng \"phỏng theo làn điệu cổ của làng\", và góp tiền mua đàn cho lớp trẻ." }, lose: { log: "Thư không được trả lời." } } }, "Lựa chọn thứ ba: không kiện, chỉ đòi ghi công", { tier: "sovereign" }),
    C("Mặc kệ, bài của làng đi xa cũng tốt", { happy: 1, counters: { fk_purity: -1 } }, "Nhẹ lòng, tên làng chìm dưới tên người khác")], 1); }),
  daily(FK, "fkm_lament", [20, 85], 8, (c) => { const st = n(c, "fk_students") > 0; return T("Hát tiễn người nghèo", `Một nhà nghèo cuối xóm có người mất, nhờ bạn hát tiễn theo lối cũ, trọn đêm. Họ không có tiền, chỉ có ${vn(c) || c.poor_country ? "một bao gạo" : "một giỏ bánh và lời cảm ơn"}. Cùng tối ấy, một nhà hàng ở thị trấn thuê bạn diễn, trả bằng nửa tháng lương.`, [
    C("Hát tiễn trọn đêm", { rel: 4, money: -0.02, health: -1, counters: { fk_purity: 1 } }, "Mất một đêm tiền, cả xóm nhớ mãi"),
    C(st ? "Gửi học trò hát thay, mình đi diễn" : "Nhờ người cùng nghề hát thay, mình đi diễn", { money: 0.04, rel: -1, counters: st ? { fk_students: 1 } : { fk_fame: 1 } }, "Có tiền, người hát thay chưa đủ lửa"),
    C("Đi diễn ở nhà hàng", { money: 0.05, rel: -4 }, "Tiền chắc, cả xóm nhìn bạn khác đi")], 0); }),
  daily(FK, "fkm_contest", [18, 65], 8, (c) => { const { art } = folk(c); return T("Hội thi có đèn màu", `Hội thi ${art} năm nay chấm cả phần dàn dựng: đèn màu, múa phụ họa, khói sân khấu. Năm ngoái bạn hát mộc và đứng thứ chín trên mười hai đội.`, [
    C("Dàn dựng cho thật bắt mắt", { money: -0.05, counters: { fk_purity: -1 }, gamble: { p: 0.5, win: { money: 0.08, counters: { fk_fame: 1 }, log: "Bạn đoạt giải nhất. Tiếng hát chỉ còn nghe được một nửa dưới nhạc nền." }, lose: { log: "Đội bên cạnh có nhiều khói hơn." } } }, "Tốn tiền, có thể đoạt giải, mất chất"),
    C("Hát mộc như mọi năm", { counters: { fk_purity: 1 }, happy: 1 }, "Giữ chất, không mong giải"),
    C(`Bỏ hội thi, mở đêm hát ${vn(c) ? "dưới gốc đa" : "ở quảng trường"}`, { flags: ["fk_free_night"], rel: 3, money: -0.02, agency: 0.01 }, "Lựa chọn thứ ba: tự lập sân chơi của mình", { tier: "sovereign" })], 1); }),
  daily(FK, "fkm_student", [25, 80], 10, () => T("Học trò giỏi nhất xin nghỉ", "Cô bé mười bốn tuổi hát hay nhất lớp của bạn sắp nghỉ học hát: bố mẹ cần em ra chợ phụ bán hàng. Em không khóc, chỉ trả lại cuốn sổ chép lời.", [
    C("Trả cho nhà em khoản tiền em làm được", { money: -0.06, counters: { fk_students: 1 }, flags: ["fk_sponsor_student"] }, "Tốn tiền đều đặn, giữ được giọng hát hay nhất", { longterm: true }),
    C("Đến tận nhà nói chuyện với bố mẹ em", { bw: -2, gamble: { p: 0.4, win: { counters: { fk_students: 1 }, log: "Bố em đồng ý cho học tối Chủ nhật." }, lose: { log: "Mẹ em nói: hát thì không ra cơm ăn." } } }, "Không tốn tiền, chưa chắc được"),
    C("Để em đi, giữ lại cuốn sổ", { happy: -2 }, "Không ràng buộc, lớp mất giọng hát hay nhất")], 0)),
  daily(FK, "fkm_newlyrics", [28, 80], 10, (c) => { const { art } = folk(c); return T("Lời mới cho bài cổ", `Học trò giỏi nhất của bạn viết lời mới cho một bài ${art}, kể chuyện đi làm thuê xa nhà, rồi hát ở buổi diễn của trường. Học sinh thuộc ngay sau một lần nghe. Các cụ trong làng bảo thế là phá bài.`, [
    C("Đứng ra bênh học trò trước các cụ", { counters: { fk_students: 1, fk_purity: -1 }, rel: -3 }, "Giữ được người trẻ, mất lòng người già"),
    C("Bảo học trò hát lại lời gốc", { counters: { fk_purity: 1 }, rel: 2, happy: -1 }, "Giữ lề lối, học trò có thể bỏ đi"),
    C("Dạy lời gốc trong lễ, lời mới ngoài lễ", { counters: { fk_students: 1 }, rel: 1, bw: -2, flags: ["fk_two_stages"] }, "Hai sân khấu cho hai thế hệ, mệt gấp đôi", { tier: "awakened" })], 2); }),
  daily(FK, "fkm_neighbor", [16, 85], 8, (c, N) => { const nb = role(c, "neighbor")!; return T("Tờ giấy dán trên cửa", `${N(nb)} giờ làm ca đêm, ngủ ban ngày, nhà chỉ cách nhà bạn một bức vách. Giờ bạn tập đàn lại trùng giờ ${N(nb)} ngủ. Sáng nay có tờ giấy dán trên cửa nhà bạn, chỉ hai chữ: "Làm ơn".`, [
    C("Ra bờ sông tập lúc năm giờ sáng", { bw: -3, health: 1, trust: { npc: nb, delta: 0.15 } }, "Mất giấc, giữ hòa khí"),
    C("Tập tiếp, đàn là nghề của mình", { trust: { npc: nb, delta: -0.2 }, memory: { npc: nb, tag: "REFUSED_HELP", weight: -0.2, note: "tiếng đàn đúng giờ ngủ sau ca đêm" } }, "Giữ nhịp tập, mất một người hàng xóm"),
    C(`Mời ${N(nb)} sang nghe một tối Chủ nhật`, { gamble: { p: 0.5, win: { memory: { npc: nb, tag: "WIN_WIN_DEAL", weight: 0.3, note: "những tối Chủ nhật nghe đàn bên vách" }, log: `${N(nb)} sang nghe đến hết buổi, rồi tự đổi giờ ngủ sớm hơn một tiếng.` }, lose: { trust: { npc: nb, delta: -0.05 }, log: `${N(nb)} không sang. Tờ giấy thứ hai dán đè lên tờ thứ nhất.` } } }, "Có thể thêm một người nghe, có thể thêm một tờ giấy", { tier: "awakened" })], 0, { npc: nb }); }, (c) => !!role(c, "neighbor")),
  daily(FK, "fkm_hands", [50, 90], 10, (c) => T("Ngón tay không còn nghe lời", "Sáng nào ngón tay bạn cũng cứng như que củi, phải ngâm nước ấm nửa giờ mới bấm nổi phím đàn. Có những nốt nhanh bạn đã lặng lẽ bỏ qua, chỉ người trong nghề mới nhận ra.", [
    C("Chuyển hẳn sang dạy, để học trò đàn", { counters: { fk_students: 1 }, income_mult: 0.85, happy: 1 }, "Ít tiền diễn hơn, nghề sang tay người trẻ"),
    C(vn(c) ? "Đi châm cứu, tập lại từng ngón" : "Đi trị liệu, tập lại từng ngón", { money: -0.05, health: 3, bw: -3, flags: ["fk_stubborn_hands"] }, "Tốn tiền và công, giữ tiếng đàn thêm vài năm"),
    C("Giải nghệ, treo đàn lên vách", { ...leave(FK), flags: ["ex_folk_musician"], happy: -3 }, "Thôi đau tay, thôi luôn một phần đời")], 0)),

  /* ---------- gia đình ---------- */
  cross(FK, "fkm_family", [25, 85], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || (c.parent_old && (!!role(c, "father") || !!role(c, "mother"))), (c, N) => {
    const { art } = folk(c); const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "father") ?? role(c, "mother");
    if (c.kids_teen > 0 && k) return T(`${N(k)} chê nhạc cổ`, `${N(k)} mười lăm tuổi, đeo tai nghe cả ngày, gọi ${art} là "nhạc ru ngủ". Ở trường, ${N(k)} không kể với ai bố mẹ mình làm nghề gì.`, [
      C("Bắt con học mỗi tuần một buổi", { trust: { npc: k, delta: -0.15 }, counters: { fk_students: 1 } }, "Giữ nghề trong nhà, con xa mình thêm"),
      C("Để con nghe nhạc của con", { trust: { npc: k, delta: 0.1 }, happy: -1 }, "Con nhẹ lòng, nghề dừng ở đời mình"),
      C("Nhờ con phối thử một bài cổ theo kiểu của con", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, flags: ["fk_fusion"], log: `${N(k)} thức đến hai giờ sáng để phối. Bài ấy thành nhạc chuông điện thoại của nửa lớp.` }, lose: { trust: { npc: k, delta: 0.05 }, log: `${N(k)} phối được nửa bài rồi bỏ, nhưng có hỏi bạn nghĩa của một câu.` } } }, "Gặp con ở giữa đường, bài cổ có thể đổi khác", { tier: "awakened" })], 2, { npc: k });
    if (c.married && s) return T("Cây đàn hay mái nhà", `Mái nhà dột ba chỗ. ${N(s)} nói thẳng: có người trả giá cây đàn quý nhất của bạn bằng tiền lợp lại cả mái, rồi hỏi bạn thương cây đàn hay thương cái nhà này hơn.`, [
      C("Bán đàn, lợp mái", { trust: { npc: s, delta: 0.2 }, happy: -5, flags: ["fk_sold_instrument"] }, "Nhà yên, mất cây đàn gắn với nghề"),
      C("Giữ đàn, đi vay tiền sửa mái", { custom: "borrow:0.3", money: -0.3, trust: { npc: s, delta: -0.1 } }, "Giữ được đàn, thêm một khoản nợ"),
      C("Nhận diễn thêm ba tháng để lợp mái", { health: -3, bw: -4, trust: { npc: s, delta: 0.1 }, counters: { fk_fame: 1 } }, "Mệt ba tháng, giữ cả đàn lẫn nhà", { longterm: true })], 2, { npc: s });
    return T("Bài hát đêm cưới", `${N(p!)} đã yếu. Một tối, ${N(p!)} hỏi bạn có biết bài hát người ta hát trong đêm cưới của ${N(p!)} năm xưa không. Bạn không biết. ${N(p!)} chỉ còn nhớ hai câu đầu.`, [
      C("Đi tìm người còn thuộc trọn bài", { money: -0.04, bw: -3, trust: { npc: p!, delta: 0.3 }, counters: { fk_songs: 1 } }, "Mất nửa tháng, kịp hát cho người nghe"),
      C(`Hát một bài na ná cho ${N(p!)} vui`, { trust: { npc: p!, delta: 0.05 }, happy: 1 }, "Nhanh và nhẹ, không phải bài ấy"),
      C(`Nhờ ${N(p!)} ngâm hai câu, bạn đàn theo`, { trust: { npc: p!, delta: 0.2 }, counters: { fk_songs: 1 }, flags: ["fk_family_song"] }, "Ít hơn một bài, nhưng là giọng của người thân", { tier: "awakened" })], 0, { npc: p! }); }),

  /* =====================================================================
   *  DIỄN VIÊN HÀI — cười ai, cười vì ai, và ai được nói câu cuối
   * ===================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(CM, "cmd_t_mimic", [9, 15], () => true, () => T("Nhại giọng cô giáo", `Giờ ra chơi, bạn nhại giọng cô giáo dạy toán giống đến mức cả lớp cười bò ra bàn. Đúng lúc ấy cô bước vào. Cô không mắng, chỉ hỏi: "Em nhại được thầy hiệu trưởng không?"`, [
    C("Nhại thầy hiệu trưởng ngay tại chỗ", { flags: [talentFlag(CM)], counters: { talents_seen: 1 }, gamble: { p: 0.6, win: { happy: 4, log: "Cô cười chảy nước mắt, rồi ghi tên bạn vào tiết mục văn nghệ cuối năm." }, lose: { happy: -2, log: "Cô cười, nhưng vẫn mời phụ huynh lên nói chuyện." } } }, "Được cả trường biết mặt, cũng dễ bị để ý"),
    C("Xin lỗi cô, về chỗ ngồi", { counters: { talents_seen: 1 }, know: 1 }, "Yên ổn, cái tài cất vào ngăn bàn")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(CM, "cmd_d_openmic", [18, 40], () => true, () => T("Năm phút micro mở", "Quán bar đầu phố có đêm micro mở mỗi thứ Tư: ai đăng ký cũng được năm phút. Trong điện thoại bạn có hai năm ghi chú những chuyện buồn cười, chưa đọc cho ai nghe.", [
    C("Lên diễn, đăng ký luôn mọi thứ Tư", { ...become(CM), counters: { doors_seen: 1 }, bw: -3, money: -0.05 }, "Bỏ dần việc chính, đặt cược vào tiếng cười"),
    C("Lên thử năm phút xem sao", { counters: { doors_seen: 1 }, gamble: { p: 0.35, win: { ...become(CM), log: "Câu thứ ba làm cả quán cười. Chủ quán hỏi tuần sau bạn diễn mười lăm phút được không." }, lose: { happy: -4, log: "Năm phút dài như năm tiếng. Chỉ có người pha chế cười, một lần." } } }, "Không mất gì, trừ chút thể diện"),
    C("Ngồi dưới xem người khác diễn", { counters: { doors_seen: 1 }, happy: 1 })], 1)),
  door(CM, "cmd_d_clip", [18, 40], () => true, () => T("Clip nhại thầy dạy làm giàu", "Bạn quay một đoạn ngắn nhại kiểu nói của những người bán khóa học làm giàu. Một tuần sau, nó có năm triệu lượt xem. Một nhóm hài có kênh riêng nhắn mời bạn vào nhóm, lương tháng bằng nửa lương hiện tại.", [
    C("Nghỉ việc, vào nhóm hài", { ...become(CM), counters: { doors_seen: 1, cm_fame: 1 }, money: -0.1 }, "Nửa lương, được làm điều mình giỏi"),
    C("Quay clip buổi tối, giữ việc ban ngày", { counters: { doors_seen: 1 }, bw: -5, gamble: { p: 0.3, win: { ...become(CM), log: "Đến clip thứ hai mươi, tiền từ clip vượt lương. Bạn nộp đơn nghỉ việc." }, lose: { log: "Clip thứ hai chỉ có ba nghìn lượt xem. Bạn thôi quay." } } }, "Giữ lương, kiệt sức, chưa chắc nổi lần hai"),
    C("Xóa clip, sợ sếp xem được", { counters: { doors_seen: 1 }, happy: -1 })], 0)),
  door(CM, "cmd_d_mc", [20, 45], () => true, () => T("MC đám cưới bất đắc dĩ", "Đám cưới bạn thân, MC thuê báo ốm sát giờ. Bạn cầm micro ứng biến suốt hai tiếng, cả hội trường cười đến lúc cắt bánh. Cuối tiệc, một khách mời đưa danh thiếp: chị làm sản xuất cho một chương trình hài.", [
    C("Gọi chị ấy ngay hôm sau, xin thử vai", { counters: { doors_seen: 1 }, gamble: { p: 0.5, win: { ...become(CM), log: "Buổi thử vai mười phút kéo thành bốn mươi. Bạn ký hợp đồng ngay tuần đó." }, lose: { happy: -2, log: "Chị ấy lịch sự nói sẽ liên lạc lại, rồi không liên lạc." } } }, "Có thể đổi đời, có thể chỉ là xã giao"),
    C("Nhận làm MC đám cưới thuê", { counters: { doors_seen: 1 }, money: 0.06, flags: ["wedding_mc"] }, "Tiền đều mùa cưới, sân khấu nhỏ"),
    C("Cất danh thiếp vào ví", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(CM, 1, 1, (c) => T("Bàn nhậu hàng đầu", "Suất diễn có trả tiền đầu tiên của bạn: mười lăm phút, bốn mươi khán giả. Phút thứ ba, một bàn nhậu ngay hàng đầu nói to hơn bạn. Một người đứng lên hỏi bao giờ thì đến đoạn buồn cười.", [
    C("Đáp lại một câu thật cay", { counters: step(c, CM), flags: ["cm_edgy"], gamble: { p: 0.55, win: { counters: { cm_fame: 1 }, happy: 4, log: "Cả phòng vỗ bàn. Người kia ngồi xuống, còn vỗ tay theo." }, lose: { happy: -3, log: "Câu đùa cay quá tay. Phòng im, và im luôn đến hết suất." } } }, "Thắng thì nhớ đời, thua thì im cả phòng"),
    C("Bỏ kịch bản, nói chuyện với cả bàn", { counters: step(c, CM, { cm_craft: 1 }), flags: ["cm_crowd"], gamble: { p: 0.45, win: { counters: { cm_fame: 1 }, log: "Mười lăm phút thành cuộc trò chuyện buồn cười nhất tối. Chủ quán xếp bạn diễn cuối tuần." }, lose: { log: "Bàn nhậu cướp luôn sân khấu. Bạn xuống sớm hai phút." } } }, "Ứng biến, có thể mất kiểm soát"),
    C("Cười mình trước, kể chuyện xấu hổ nhất đời", { counters: step(c, CM), flags: ["cm_personal"], happy: 2, rel: 1 }, "Chắc ăn, nổi chậm, lộ chuyện riêng")], 0)),
  beat(CM, 2, 3, (c) => T("Một vai diễn suốt đời", `Một chương trình hài cuối tuần mời bạn vào đội diễn cố định, tiền gấp ba quán bar. Điều kiện: bạn đóng mãi một vai, một người nói giọng tỉnh lẻ ngờ nghệch, và mọi câu đùa phải qua bàn duyệt của đài.${f(c, "cm_crowd") ? " Cái tài ứng biến của bạn sẽ không có chỗ trong kịch bản viết sẵn." : f(c, "cm_personal") ? " Những chuyện thật của bạn sẽ phải nhường chỗ cho câu đùa của người khác viết." : ""}`, [
    C("Nhận vai, lên sóng mỗi tuần", { counters: step(c, CM, { cm_fame: 2 }), income_mult: 1.6, flags: ["cm_tv_character"] }, "Nổi khắp nước, mắc kẹt trong một cái vai"),
    C("Ở lại quán bar, giữ chất của mình", { counters: step(c, CM, { cm_craft: 1 }), income_mult: 1.1, flags: ["cm_club_loyal"], happy: 2 }, "Nghèo và tự do, nổi chậm"),
    C("Đề nghị viết một mục riêng, nhận nửa tiền", { counters: step(c, CM), gamble: { p: 0.4, win: { income_mult: 1.4, counters: { cm_fame: 1, cm_craft: 1 }, flags: ["cm_own_segment"], log: "Nhà sản xuất cho bạn năm phút cuối chương trình: không vai, không kịch bản duyệt trước." }, lose: { income_mult: 1.05, log: "Họ nói khán giả không cần người nói thật. Ghế ấy về tay người khác." } } }, "Lựa chọn thứ ba: đổi tiền lấy quyền tự viết", { tier: "sovereign" })], 0)),
  beat(CM, 3, 4, (c) => {
    const tv = f(c, "cm_tv_character"), edgy = f(c, "cm_edgy");
    const what = tv ? "Đó là cái vai giọng tỉnh lẻ năm nào. Người dân vùng ấy lập hẳn một nhóm đòi bạn xin lỗi."
      : edgy ? "Đó là một câu đùa cay về một nhóm người không có cách nào đáp lời, và đúng là bạn đã nói."
      : "Đoạn phim bị cắt mất nửa đầu, nghe như bạn nói điều ngược hẳn với ý mình.";
    const third = tv
      ? C("Về tận vùng ấy, mời người ở đó viết tiết mục cùng", { counters: step(c, CM, { cm_craft: 1 }), gamble: { p: 0.5, win: { counters: { cm_fame: 1 }, flags: ["cm_made_amends"], log: "Tiết mục mới có một bà bán cá vùng ấy cùng viết. Bà đòi được đứng lên chào khán giả." }, lose: { income_mult: 0.7, log: "Người ta nói bạn đi đánh bóng tên tuổi. Chuyến đi thành thêm một đoạn phim bị cắt." } } }, "Lựa chọn thứ ba: sửa bằng việc làm, không chỉ lời", { tier: "sovereign", longterm: true })
      : edgy
        ? C("Im lặng, chờ mạng quên", { counters: step(c, CM), gamble: { p: 0.5, win: { log: "Ba tuần sau, mạng có chuyện khác để giận." }, lose: { income_mult: 0.6, flags: ["cm_cancelled"], log: "Sự im lặng bị đọc là coi thường. Tên bạn gắn với vụ ấy thêm nhiều năm." } } }, "Không mất gì nếu mạng quên, mất hết nếu không")
        : C("Đăng nguyên đoạn phim gốc, không bình luận", { counters: step(c, CM), gamble: { p: 0.6, win: { counters: { cm_fame: 1 }, log: "Người xem nghe trọn câu và tự hiểu. Vài trang tin lặng lẽ gỡ bài." }, lose: { income_mult: 0.7, flags: ["cm_cancelled"], log: "Bản gốc ít người xem hơn bản bị cắt mười lần." } } }, "Lựa chọn thứ ba: để sự thật tự nói", { tier: "sovereign" });
    return T("Đoạn phim bị đào lại", `Một đoạn phim cũ của bạn bị đào lại. ${what} Trong hai ngày, nhà tài trợ rút, ba suất diễn bị hủy, điện thoại rung không ngừng.`, [
      C("Xin lỗi thật lòng, nghỉ diễn một năm", { counters: step(c, CM), income_mult: 0.7, happy: -4, flags: ["cm_apologized"] }, "Mất một năm, giữ lại sự tử tế", { longterm: true }),
      C("Diễn hẳn một tiết mục về chính vụ này", { counters: step(c, CM), gamble: { p: 0.45, win: { counters: { cm_fame: 2 }, income_mult: 1.2, log: "Tiết mục ấy được cắt ra, lan khắp mạng. Lần này người ta cười cùng bạn." }, lose: { income_mult: 0.5, flags: ["cm_cancelled"], log: "Người ta nói bạn chế giễu cả lời xin lỗi. Hai sân khấu lớn từ chối bạn." } } }, "Biến khủng hoảng thành chất liệu, hoặc chìm hẳn"),
      third,
      C("Giải nghệ, thôi đứng trước đám đông", { counters: step(c, CM), ...leave(CM), flags: ["ex_comedian"], happy: -3 }, "Thoát khỏi bão, bỏ lại sân khấu")], 0); }),
  beat(CM, 4, 5, (c) => {
    if (n(c, "cm_fame") >= 3 && !f(c, "cm_cancelled")) return T("Một giờ của riêng bạn", `Suất diễn một tiếng đầu tiên của riêng bạn: hai nghìn ghế, quay lại để bán cho một nền tảng phim trực tuyến. Bộ phận pháp lý của họ muốn cắt bảy phút bạn chế giễu những người có quyền thế trong thành phố.${f(c, "cm_own_segment") ? " Bảy phút ấy mọc ra từ mục riêng bạn tự viết bao năm." : ""}`, [
      C("Đồng ý cắt, ký hợp đồng", { counters: step(c, CM), money: km(c, 0.8), income_mult: 1.4, happy: -1 }, "Khoản tiền lớn nhất đời, bảy phút hay nhất mất đi"),
      C("Không cắt, tự đăng miễn phí lên mạng", { counters: step(c, CM, { cm_fame: 2 }), money: km(c, -0.1), agency: 0.03, flags: ["cm_free_special"], gamble: { p: c.poor_country ? 0.6 : 0.85, win: { log: "Hai tuần, mười triệu lượt xem. Vé lưu diễn năm sau bán hết trước khi công bố lịch." }, lose: { bw: -6, flags: ["cm_summoned"], log: "Bạn bị mời lên làm việc vì bảy phút ấy. Không ai bị bắt, nhưng ba sân khấu hủy lịch." } } }, "Lựa chọn thứ ba: mất hợp đồng, giữ trọn tiếng nói", { tier: "sovereign" }),
      C("Cắt bản quay, giữ bảy phút cho từng đêm diễn", { counters: step(c, CM, { cm_craft: 1 }), money: km(c, 0.5), health: -3, rel: -2 }, "Có tiền, đoạn hay chỉ người đến tận nơi mới nghe")], 0);
    return T("Tối thứ Ba, mười hai khán giả", `${f(c, "cm_cancelled") ? "Từ sau vụ đoạn phim cũ, các sân khấu lớn không gọi nữa." : "Khán giả đã chuyển sang những gương mặt trẻ hơn."} Bạn diễn tối thứ Ba cho mười hai người, tiền vé không đủ tiền xe. Một công ty sự kiện mời bạn làm MC tiệc cuối năm cho các doanh nghiệp, lương cố định.`, [
      C("Nhận làm MC sự kiện", { counters: step(c, CM), income_mult: 1.3, happy: -3, flags: ["cm_corporate"] }, "Tiền đều, đùa theo kịch bản của người khác"),
      C("Mở phòng hài nhỏ, dạy người mới vào nghề", { counters: step(c, CM, { cm_craft: 1 }), money: km(c, -0.3), agency: 0.02, flags: ["cm_own_club"] }, "Lựa chọn thứ ba: tự dựng sân khấu cho lớp sau", { tier: "sovereign", longterm: true }),
      C("Giải nghệ, đi làm việc khác", { counters: step(c, CM), ...leave(CM), flags: ["ex_comedian"], happy: -2 }, "Thôi lo tiền vé, thôi được nghe ai cười")], 0); }),
  beat(CM, 5, 6, (c) => {
    const what = f(c, "cm_cancelled") ? "cả vụ đoạn phim năm nào" : f(c, "cm_tv_character") ? "cả cái giọng tỉnh lẻ thời bạn lên sóng" : "cả những câu đùa đã cũ của bạn";
    return T("Bị nhại trên truyền hình", `Một diễn viên hài hai mươi lăm tuổi nhại bạn trên truyền hình: dáng đi, câu cửa miệng, ${what}. Cả trường quay cười nghiêng ngả. ${f(c, "cm_own_club") ? "Cậu ấy từng diễn những suất đầu đời ở phòng hài của bạn." : "Bạn chưa gặp cậu ấy lần nào."}`, [
      C("Lên chương trình, nhại lại cậu ấy", { counters: step(c, CM), gamble: { p: 0.55, win: { counters: { cm_fame: 1 }, happy: 4, log: "Hai thế hệ nhại nhau mười phút. Đoạn ấy được chiếu lại mỗi dịp cuối năm." }, lose: { happy: -3, log: "Bạn hụt nhịp một câu. Người ta nói bạn già thật rồi." } } }, "Chơi tới cùng, có thể lộ tuổi"),
      C("Gọi riêng, góp ý cho tiết mục hay hơn", { counters: step(c, CM), flags: ["passed_on"], rel: 3, happy: 2 }, "Lùi lại một bước để người trẻ lớn lên", { tier: "awakened" }),
      C("Lên tiếng trách cậu ấy thiếu tôn trọng", { counters: step(c, CM), flags: ["cm_bitter"], happy: -1, rel: -2 }, "Giữ thể diện, thành người già khó tính")], 1); }, (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(CM, "cmd_stolen", [20, 65], 8, (c, N) => { const r = role(c, "rival")!; return T("Câu đùa trên miệng người khác", `${N(r)} diễn đúng tiết mục bạn viết về ${vn(c) ? "bà bán xôi đầu ngõ" : "bà chủ tiệm giặt đầu phố"}, từng chữ, trên một chương trình lớn. Bạn đã diễn nó ở quán bar suốt hai năm.`, [
    C("Đăng bằng chứng lên mạng", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "vụ bị tố chôm tiết mục" }, gamble: { p: 0.5, win: { counters: { cm_fame: 1 }, log: "Giới diễn hài đứng về phía bạn. Đài cắt tiết mục ấy khỏi bản phát lại." }, lose: { happy: -3, log: "Người ta bảo câu đùa nào chẳng giống câu đùa nào." } } }, "Đòi lẽ phải, có thêm một kẻ thù"),
    C("Gặp riêng, đòi ghi tên người viết", { gamble: { p: 0.45, win: { memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.25, note: "thỏa thuận ghi tên người viết tiết mục" }, money: 0.05, log: `${N(r)} gật đầu, ghi tên bạn và gửi lại một phần cát-xê.` }, lose: { trust: { npc: r, delta: -0.1 }, log: `${N(r)} cười, bảo bạn tưởng tượng.` } } }, "Ít ồn ào, chưa chắc được gì", { tier: "awakened" }),
    C("Viết mười câu mới thay", { know: 2, bw: -4, counters: { cm_craft: 1 } }, "Mất công, chứng minh mình còn viết được")], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(CM, "cmd_corporate", [22, 70], 6, (c) => T("Tiệc cuối năm của công ty", vary("cmc", c.age, [
    "Một công ty thuê bạn diễn tiệc cuối năm, trả bằng một tháng diễn quán. Giám đốc dặn: đùa về nhân viên lười thì được, đừng đùa về ban lãnh đạo.",
    "Một tập đoàn mời bạn diễn ở hội nghị khách hàng, kèm danh sách mười hai chủ đề cấm nhắc, trong đó có đợt cắt giảm nhân sự tháng trước."]), [
    C("Diễn đúng như họ dặn", { money: 0.08, happy: -2, counters: { cm_fame: -1 } }, "Tiền dễ, câu đùa đứng sai phía"),
    C("Đùa nhẹ về chính ban lãnh đạo", { gamble: { p: 0.5, win: { money: 0.08, counters: { cm_fame: 1 }, log: "Nhân viên cười to nhất năm. Giám đốc cười theo, chậm nửa giây." }, lose: { money: 0.02, log: "Micro bị tắt ở phút thứ năm. Họ giữ lại nửa tiền." } } }, "Có thể mất tiền, được lòng khán giả thật"),
    C("Từ chối, giữ tối ấy cho quán bar", { happy: 1 }, "Mất khoản tiền dễ, giữ tối diễn của mình")], 0)),
  daily(CM, "cmd_bomb", [18, 70], 8, (c) => T("Mười hai phút im lặng", vary("cmb", c.age, [
    `Tối qua bạn diễn mười hai phút không ai cười một tiếng. Có người quay lại, đăng lên với dòng chữ "diễn viên hài buồn nhất năm".`,
    "Bạn thử tiết mục mới trước ba trăm khán giả. Cả khán phòng im như phòng thi, chỉ nghe tiếng điều hòa."]), [
    C("Xem lại băng, viết lại từ đầu", { bw: -4, know: 3, counters: { cm_craft: 2 } }, "Mất một tuần, tiết mục chắc hơn"),
    C("Đi uống với đám diễn viên khác", { rel: 3, happy: 2, health: -1, counters: { drink: 1 } }, "Nhẹ lòng tối nay, chưa sửa được gì"),
    C("Đăng lại đoạn phim kèm một câu tự giễu", { gamble: { p: 0.5, win: { counters: { cm_fame: 1 }, log: "Dòng tự giễu được chia sẻ nhiều hơn chính đoạn phim." }, lose: { happy: -2, log: "Người ta coi đó là lời thừa nhận." } } }, "Có thể lật ngược, có thể đóng dấu thêm")], 0)),
  daily(CM, "cmd_road", [20, 60], 6, (c) => T("Chuyến xe đêm đi diễn", vary("cmr", c.age, [
    "Một công ty bầu show xếp cho bạn mười bốn suất ở mười bốn thị trấn trong mười sáu ngày, ngủ trên xe đêm.",
    "Nhóm hài rủ bạn đi diễn ở các khu công nghiệp và thị trấn mỏ, nơi chưa từng có ai đến diễn hài."]), [
    C("Đi trọn chuyến", { money: 0.1, health: -3, rel: -2, counters: { cm_fame: 1, cm_craft: 1 } }, "Có tiền và nghề, thiếu ngủ và vắng nhà"),
    C("Chỉ đi các suất cuối tuần", { money: 0.04, happy: 1 }, "Ít tiền hơn, còn sức về ăn cơm nhà")], 0)),
  daily(CM, "cmd_redpen", [20, 70], 8, (c) => T("Ba câu bị gạch bút đỏ", `Trước đêm diễn lớn, ban tổ chức gửi lại kịch bản: ba câu bị gạch bút đỏ, đều là những câu khán giả cười to nhất. ${c.poor_country ? "Họ nhắc khéo rằng năm ngoái có một nhóm hài bị cấm diễn sáu tháng." : "Họ nói nhà tài trợ không thích."}`, [
    C("Bỏ ba câu, diễn phần còn lại", { money: 0.04, happy: -2, counters: { cm_craft: -1 } }, "An toàn, tiết mục cụt"),
    C("Thay bằng những câu nói vòng", { bw: -3, counters: { cm_craft: 1 }, gamble: { p: 0.6, win: { counters: { cm_fame: 1 }, log: "Khán giả hiểu cả phần không nói ra. Tràng cười dài hơn bản gốc." }, lose: { flags: ["cm_blacklist"], log: "Ban tổ chức cũng hiểu. Tên bạn bị gạch khỏi danh sách năm sau." } } }, "Khéo thì hay hơn, vụng thì mất sân khấu", { tier: "awakened" }),
    C("Hủy diễn, công khai lý do", { money: -0.05, agency: 0.02, flags: ["cm_public_cancel"] }, "Mất tiền và một sân khấu, giữ tiếng nói", { tier: "sovereign" })], 0)),
  daily(CM, "cmd_sadclown", [22, 75], 10, () => T("Sau tiếng cười", `Một người bạn cùng nghề bỗng bỏ diễn, chỉ nói: "Tôi không còn thấy gì buồn cười nữa." Bạn nhận ra đã nửa năm nay mình ngủ ba tiếng mỗi đêm, và chỉ cười khi đứng trên sân khấu.`, [
    C("Đi gặp chuyên gia tâm lý", { money: -0.04, happy: 5, health: 2, flags: ["cm_therapy"] }, "Tốn tiền, chậm lại, đỡ dần"),
    C("Viết một tiết mục về chuyện đó", { bw: -3, gamble: { p: 0.5, win: { happy: 3, counters: { cm_craft: 2 }, log: "Đó là tiết mục khán giả viết thư cảm ơn nhiều nhất." }, lose: { happy: -3, log: "Diễn nỗi buồn của mình mỗi tối làm nó nặng thêm." } } }, "Biến nỗi buồn thành nghề, có thể buồn hơn"),
    C("Diễn tiếp, lịch đang kín", { money: 0.05, health: -4, bw: -4, counters: { cm_fame: 1 } }, "Giữ lịch, cạn dần")], 0)),
  daily(CM, "cmd_duo", [22, 65], 10, (c, N) => { const p = role(c, "partner")!; return T("Bạn diễn cũ gọi điện", `${N(p)} từng diễn cặp với bạn sáu năm, rồi hai người chia tay vì chuyện chia tiền. Giờ một đài muốn hai người tái hợp trong chương trình cuối năm, trả gấp đôi.`, [
    C("Nhận, coi như làm lành", { gamble: { p: 0.55, win: { money: 0.08, memory: { npc: p, tag: "WIN_WIN_DEAL", weight: 0.3, note: "màn tái hợp cuối năm" }, log: "Hai người vào nhịp như chưa từng xa nhau." }, lose: { memory: { npc: p, tag: "BETRAYED_PARTNERSHIP", weight: -0.2, note: "màn tái hợp lại cãi nhau vì tiền" }, log: "Hậu trường lại cãi nhau vì chia tiền, lần này trước mặt cả đoàn." } } }, "Có thể làm lành, có thể mở lại vết cũ"),
    C("Nhận, ký giấy chia đôi tiền và tên", { money: 0.06, bw: -2, trust: { npc: p, delta: 0.15 } }, "Bớt thân tình, hết chuyện cãi nhau", { tier: "sovereign" }),
    C("Từ chối", { trust: { npc: p, delta: -0.1 }, happy: 1 }, "Yên thân, mất một khoản và một người")], 0, { npc: p }); }, (c) => !!role(c, "partner")),
  daily(CM, "cmd_ghost", [24, 65], 10, () => T("Viết thuê không tên", "Một MC truyền hình nổi tiếng muốn thuê bạn viết câu đùa cho chương trình của mình: lương cố định gấp đôi thu nhập hiện tại, nhưng không bao giờ được nói đó là câu của bạn.", [
    C("Nhận, viết trong bóng tối", { income_mult: 1.3, happy: -2, flags: ["cm_ghostwriter"] }, "Tiền đều, câu hay nhất mang tên người khác"),
    C("Nhận, đòi tên trong danh sách người viết", { gamble: { p: 0.4, win: { income_mult: 1.2, counters: { cm_craft: 1, cm_fame: 1 }, log: "Tên bạn chạy cuối chương trình, chữ nhỏ, nhưng có." }, lose: { log: "Họ thuê một người khác ít đòi hỏi hơn." } } }, "Có thể có cả tiền lẫn tên, có thể mất cả hai"),
    C("Từ chối, giữ câu hay cho mình", { counters: { cm_craft: 1 } }, "Nghèo hơn, câu đùa vẫn là của mình")], 0)),
  daily(CM, "cmd_abroad", [24, 60], 10, () => T("Khán giả không cùng tiếng mẹ đẻ", "Một liên hoan hài quốc tế mời bạn diễn hai mươi phút trước khán giả không nói tiếng của bạn. Những câu ăn tiền nhất của bạn đều dựa vào chơi chữ, dịch ra là mất.", [
    C("Dịch tiết mục cũ, cố giữ nhịp", { money: -0.03, gamble: { p: 0.35, win: { counters: { cm_fame: 1 }, log: "Một nửa số câu đùa sống sót qua bản dịch. Khán giả cười ở những chỗ bạn không ngờ." }, lose: { happy: -3, log: "Phiên dịch nói nhanh hơn bạn, và cười trước khán giả." } } }, "Ít công, có thể chết đứng trên sân khấu"),
    C("Viết hẳn tiết mục mới bằng động tác và nét mặt", { bw: -6, know: 3, money: -0.05, counters: { cm_craft: 2 } }, "Mất hai tháng, học thêm một thứ ngôn ngữ", { longterm: true }),
    C("Từ chối, chỉ diễn cho người hiểu mình", { happy: 1 }, "Yên ổn, thế giới vẫn xa")], 1)),
  daily(CM, "cmd_dated", [38, 80], 10, (c) => T("Khán giả hai mươi tuổi", vary("cmd", c.age, [
    `Khán giả bây giờ phần lớn hai mươi tuổi. Những câu đùa về ${vn(c) ? "thời tem phiếu" : "điện thoại quay số"} của bạn rơi vào im lặng; họ cười những thứ bạn không hiểu.`,
    "Một diễn viên trẻ nói thẳng sau cánh gà: tiết mục của bạn nghe như chương trình bố mẹ cậu ấy vẫn xem."]), [
    C("Học cách đùa của người trẻ", { bw: -3, know: 2, counters: { cm_craft: 1 } }, "Bắt kịp, có thể thành gượng gạo"),
    C("Đùa về chính cái già của mình", { gamble: { p: 0.55, win: { happy: 3, counters: { cm_fame: 1 }, log: "Người trẻ cười vì thấy bố mẹ họ, người già cười vì thấy chính mình." }, lose: { happy: -2, log: "Cả phòng cười lịch sự. Với diễn viên hài, lịch sự là đáng sợ nhất." } } }, "Có thể hay nhất, có thể thành tự thương hại"),
    C("Chỉ diễn cho khán giả cùng thế hệ", { income_mult: 0.9, happy: 2 }, "Ấm áp, sân khấu nhỏ dần")], 1)),

  /* ---------- gia đình ---------- */
  cross(CM, "cmd_family", [22, 80], (c) => (c.kids_teen > 0 && !!role(c, "child")) || (c.married && !!role(c, "spouse")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const k = role(c, "child"); const s = role(c, "spouse"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} bị gọi là "gà trống"`, `Tiết mục nổi tiếng nhất của bạn kể chuyện ${N(k)} hồi bé sợ con gà trống nhà hàng xóm. Giờ ${N(k)} mười lăm tuổi, và cả trường gọi ${N(k)} là "gà trống".`, [
      C("Bỏ tiết mục đó khỏi mọi buổi diễn", { trust: { npc: k, delta: 0.2 }, counters: { cm_fame: -1 } }, "Mất tiết mục ăn khách nhất, con nhẹ lòng"),
      C("Giải thích với con rằng đó là nghề", { trust: { npc: k, delta: -0.2 } }, "Giữ tiết mục, con thu mình lại"),
      C("Mời con cùng viết một tiết mục về bạn", { gamble: { p: 0.5, win: { trust: { npc: k, delta: 0.3 }, log: `${N(k)} viết được câu hay nhất buổi diễn: về chuyện bạn sợ đi khám răng.` }, lose: { trust: { npc: k, delta: 0.05 }, log: `${N(k)} bảo chuyện của ai thì người nấy tự kể.` } } }, "Đổi vai cho công bằng, chưa chắc con muốn", { tier: "awakened" })], 2, { npc: k });
    if (c.married && s) return T("Chuyện nhà trên sân khấu", `${N(s)} ngồi hàng ghế cuối, nghe bạn kể chuyện hai người cãi nhau tuần trước, đến từng câu. Cả khán phòng cười. Về nhà, ${N(s)} chỉ hỏi: "Nhà mình còn chuyện gì chưa đem bán?"`, [
      C("Hứa không đưa chuyện nhà lên sân khấu", { promise: { to: s, what: "không đem chuyện nhà lên sân khấu", years: 5 }, trust: { npc: s, delta: 0.15 }, counters: { cm_craft: -1 } }, "Mất kho chất liệu lớn nhất, giữ được nhà"),
      C("Cho bạn đời duyệt trước mọi câu về nhà mình", { trust: { npc: s, delta: 0.2 }, bw: -2 }, "Chậm hơn, câu nào lên sân khấu cũng có hai người ký", { tier: "awakened" }),
      C("Bảo đó là nghề, ai làm hài cũng vậy", { trust: { npc: s, delta: -0.25 }, happy: -1 }, "Giữ tiết mục, khoảng cách trong nhà rộng thêm")], 0, { npc: s });
    return T("Phiên chợ trong tiết mục", `Tiết mục về cách ${N(p!)} mặc cả ngoài chợ giúp bạn nổi tiếng. Hàng xóm gặp ${N(p!)} là nhại lại. ${N(p!)} không nói gì, nhưng thôi đi chợ buổi sáng.`, [
      C(`Đưa ${N(p!)} đến xem, giới thiệu trước khán giả`, { gamble: { p: 0.6, win: { trust: { npc: p!, delta: 0.3 }, log: `Cả khán phòng đứng dậy vỗ tay. ${N(p!)} cúi chào như người trong nghề.` }, lose: { trust: { npc: p!, delta: -0.1 }, log: `${N(p!)} đến, ngồi im, về sớm.` } } }, "Có thể thành niềm tự hào, có thể thêm xấu hổ"),
      C("Bỏ tiết mục ấy", { trust: { npc: p!, delta: 0.15 }, counters: { cm_fame: -1 } }, "Mất tiết mục ăn khách, người nhà đi chợ lại"),
      C("Giữ tiết mục, nó đang ăn khách", { money: 0.04, trust: { npc: p!, delta: -0.15 } }, "Có tiền, người nhà lặng lẽ tránh mặt")], 0, { npc: p! }); }),

  /* =====================================================================
   *  VŨ CÔNG — một cơ thể, một thời hạn, và ai được quyền dùng nó
   * ===================================================================== */

  /* ---------- năng khiếu ---------- */
  talent(DN, "dnc_t_audition", [8, 13], () => true, (c) => T(`Kỳ thi ${school(c)}`, `Ở buổi văn nghệ, bạn chỉ xem chị lớp trên múa một lần rồi múa lại đủ cả bài. Cô giáo bảo tháng sau ${school(c)} tuyển sinh: học nội trú bảy năm, xa nhà từ năm mười một tuổi.`, [
    C("Xin bố mẹ cho đi thi", { flags: [talentFlag(DN)], counters: { talents_seen: 1 }, money: -0.03, happy: 2, rel: -2 }, "Tuổi thơ trong phòng tập, xa nhà sớm"),
    C("Ở nhà, múa ở đội văn nghệ trường", { counters: { talents_seen: 1 }, rel: 2 }, "Gần nhà, năng khiếu ngủ yên")], 0)),
  talent(DN, "dnc_t_circle", [12, 16], () => true, (c) => T("Vòng tròn ở quảng trường", `Tối nào ở ${vn(c) ? "phố đi bộ" : "quảng trường"} cũng có một nhóm anh chị nhảy đường phố, loa kéo, vòng tròn người xem. Một tối họ đẩy bạn vào giữa vòng. Bạn xoay đến lúc nhạc tắt.`, [
    C("Đến tập với nhóm mỗi tối", { flags: [talentFlag(DN)], counters: { talents_seen: 1 }, happy: 4, know: -2, health: -1 }, "Có một thế giới riêng, điểm ở lớp tụt"),
    C("Về nhà học bài", { counters: { talents_seen: 1 }, know: 2 }, "Điểm tốt, những buổi tối trôi qua")], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(DN, "dnc_d_audition", [17, 28], () => true, (c) => T("Bốn trăm người, tám chỗ", "Một ca sĩ lớn tuyển vũ công cho chuyến lưu diễn sáu tháng. Bốn trăm người đến thử, chỉ lấy tám. Nếu muốn tập thật kỹ, bạn còn ba tháng.", [
    C("Đi thử ngay bằng những gì đang có", { counters: { doors_seen: 1 }, gamble: { p: 0.3, win: { ...become(DN), log: "Tên bạn nằm thứ tám trong danh sách. Vừa đủ." }, lose: { happy: -3, log: "Bạn bị loại sau tám nhịp đầu tiên." } } }, "Không mất gì, cơ hội mỏng"),
    C("Nghỉ việc, tập ba tháng rồi thi", { counters: { doors_seen: 1 }, money: km(c, -0.12), health: -2, gamble: { p: 0.6, win: { ...become(DN), counters: { dn_fame: 1 }, log: "Giám khảo xếp bạn đứng hàng đầu." }, lose: { happy: -6, log: "Bạn trượt, và không còn việc để quay về." } } }, "Đặt cược ba tháng thu nhập"),
    C("Thôi, nhảy vẫn chỉ là thú vui", { counters: { doors_seen: 1 } })], 0)),
  door(DN, "dnc_d_crew", [14, 25], () => true, () => T("Nhóm nhảy dưới gầm cầu", "Một nhóm nhảy đường phố tập mỗi đêm dưới gầm cầu: sàn bê tông, loa chạy ắc quy. Họ thiếu một người để đi thi vòng toàn quốc và hỏi bạn có vào không. Không ai được trả tiền.", [
    C("Vào nhóm, tập mỗi đêm", { ...become(DN), counters: { doors_seen: 1 }, health: -2, rel: 3, flags: ["dn_street"] }, "Có anh em, không có tiền, đầu gối chịu thiệt"),
    C("Chỉ tập với nhóm cuối tuần", { counters: { doors_seen: 1 }, happy: 2, gamble: { p: 0.25, win: { ...become(DN), log: "Đến vòng toàn quốc, nhóm cần bạn thật sự. Bạn ở lại luôn." }, lose: { log: "Nhóm tìm được người tập đủ bảy đêm." } } }, "Giữ nhịp sống cũ, có thể lỡ chỗ"),
    C("Thôi, ở nhà không ai đồng ý", { counters: { doors_seen: 1 } })], 0)),
  door(DN, "dnc_d_ship", [20, 30], () => true, () => T("Hợp đồng nhảy trên tàu biển", `Một công ty môi giới tuyển vũ công cho tàu du lịch biển: tám tháng, lương gấp ba ở nhà. Họ thu trước một khoản phí "đào tạo và giấy tờ" bằng hai tháng lương của bạn.`, [
    C("Nộp phí, lên tàu", { counters: { doors_seen: 1 }, money: -0.15, gamble: { p: 0.7, win: { ...become(DN), money: 0.4, rel: -3, log: "Tám tháng, ba vùng biển, hai suất diễn mỗi tối. Lần đầu bạn gửi tiền về nhà." }, lose: { happy: -6, log: "Văn phòng môi giới đóng cửa sau một tuần. Số điện thoại không còn ai nghe." } } }, "Lương cao, có thể mất trắng tiền phí"),
    C("Hỏi những người từng đi tàu trước đã", { counters: { doors_seen: 1 }, bw: -2, gamble: { p: 0.5, win: { ...become(DN), money: 0.2, log: "Một người từng đi tàu chỉ bạn nộp hồ sơ thẳng cho hãng, không qua môi giới." }, lose: { log: "Bạn hỏi xong thì mùa tuyển đã qua." } } }, "Chậm hơn, khó bị lừa hơn", { tier: "awakened" }),
    C("Ở lại đất liền", { counters: { doors_seen: 1 } })], 0)),

  /* ---------- mạch truyện ---------- */
  beat(DN, 1, 1, (c) => T("Người đứng hàng cuối", `Bạn đứng hàng cuối đội hình, góc trái, chỗ máy quay ít khi lia tới. Hai ngày trước buổi diễn, người múa chính bị lật cổ chân. Biên đạo hỏi cả phòng: "Ai thuộc phần của cô ấy?" Bạn thuộc, vì đã lén tập mỗi tối.`, [
    C("Giơ tay nhận phần múa chính", { counters: step(c, DN), flags: ["dn_lead"], gamble: { p: 0.55, win: { counters: { dn_fame: 1 }, happy: 5, log: "Đêm diễn trôi qua không một lỗi. Biên đạo ghi tên bạn vào danh sách múa chính." }, lose: { happy: -4, health: -2, log: "Bạn trượt chân ở cú xoay cuối. Không ai nói gì, thế mới đau." } } }, "Cơ hội lớn, sai một bước là ai cũng thấy"),
    C("Đề cử người dự bị, cũng là bạn thân", { counters: step(c, DN), flags: ["dn_team"], rel: 3 }, "Giữ tình bạn và đội hình, lùi một bước"),
    C("Im lặng, giữ chỗ hàng cuối", { counters: step(c, DN), happy: -2 }, "An toàn, và tiếc rất lâu")], 0)),
  beat(DN, 2, 3, (c) => T("Hai lời mời trong một tuần", `Cùng một tuần, hai lời mời đến. Một vũ đoàn đương đại trả lương thấp nhưng dựng những vở được viết bài phê bình. Một ca sĩ nổi tiếng muốn bạn làm vũ công chính cả năm, lương gấp ba. Nhóm bạn cũ thì rủ tự lập nhóm, tự dựng bài, chưa biết tiền ở đâu.${f(c, "dn_team") ? " Họ vẫn nhắc lần bạn nhường suất múa chính." : f(c, "dn_lead") ? " Ca sĩ nói đã xem đêm bạn múa thay người múa chính." : ""}`, [
    C("Vào vũ đoàn đương đại", { counters: step(c, DN), income_mult: 0.9, know: 3, flags: ["dn_art"] }, "Nghèo, được làm nghệ thuật thật"),
    C("Làm vũ công chính cho ca sĩ", { counters: step(c, DN, { dn_fame: 2, dn_wear: 1 }), income_mult: 1.6, flags: ["dn_commercial"] }, "Tiền và tiếng, nhảy theo ý người khác"),
    C("Cùng bạn cũ lập nhóm riêng", { counters: step(c, DN), money: km(c, -0.2), agency: 0.02, flags: ["dn_own_crew"], gamble: { p: 0.45, win: { counters: { dn_fame: 1 }, log: "Bài dựng đầu tiên của nhóm được mời diễn ở ba thành phố." }, lose: { happy: -3, log: "Năm đầu, nhóm diễn mười hai suất, lỗ mười một." } } }, "Lựa chọn thứ ba: tự làm chủ bài nhảy của mình", { tier: "sovereign" })], 0)),
  beat(DN, 3, 4, (c) => {
    const ctx = (n(c, "dn_wear") >= 2 ? " Đây là lần thứ ba trong hai năm đầu gối ấy lên tiếng." : "")
      + (f(c, "dn_commercial") ? " Công ty nói hợp đồng không có bảo hiểm chấn thương." : f(c, "dn_own_crew") ? " Cả nhóm đang chờ, vì bài này dựng quanh bạn." : f(c, "dn_art") ? " Vũ đoàn hứa giữ chỗ nhưng không trả lương những tháng nghỉ." : "");
    return T("Tiếng rắc ở đầu gối", `Trong buổi tổng duyệt, bạn tiếp đất sau một cú bật và nghe tiếng "rắc". Bác sĩ nói dây chằng bị rách: mổ và tập lại chín tháng, chưa chắc nhảy được như cũ. Đêm diễn lớn nhất năm còn mười hai ngày.${ctx}`, [
      C("Mổ, nghỉ tập chín tháng", { counters: step(c, DN), money: km(c, -0.3), income_mult: 0.7, health: 6, flags: ["dn_rebuilt"] }, "Mất cả mùa, giữ được đôi chân về sau", { longterm: true }),
      C("Tiêm giảm đau, diễn cho hết mùa", { counters: step(c, DN, { dn_wear: 2 }), money: km(c, 0.2), gamble: { p: 0.45, win: { counters: { dn_fame: 1 }, flags: ["dn_pushed"], log: "Bạn diễn trọn mùa. Không ai trên khán đài biết bạn cắn răng từng bước." }, lose: { health: -12, income_mult: 0.5, flags: ["dn_broken"], log: "Đêm thứ tư, đầu gối gập xuống giữa sân khấu. Lần này không mổ thì không đi lại được." } } }, "Giữ chỗ bây giờ, có thể mất cả đôi chân"),
      C("Giải nghệ, mở lớp dạy nhảy", { counters: step(c, DN), ...leave(DN), money: km(c, -0.1), happy: -4, flags: ["ex_dancer"] }, "Hết đau, sân khấu thành chuyện cũ")], 0); }),
  beat(DN, 4, 5, (c) => {
    if (n(c, "dn_fame") >= 2 && !f(c, "dn_broken")) return T("Màn mở đầu của lễ hội lớn", `Ban tổ chức một lễ hội lớn của cả nước mời bạn dàn dựng màn mở đầu, ngân sách lớn nhất bạn từng thấy. Họ muốn hai trăm vũ công áo giống hệt nhau, xếp thành biểu tượng lễ hội cho máy quay trên cao. Trong đầu bạn là một bài cho mười hai người.${f(c, "dn_own_crew") ? " Nhóm cũ của bạn hỏi có được góp mặt không." : ""}`, [
      C("Dựng đúng như ban tổ chức muốn", { counters: step(c, DN, { dn_fame: 1 }), money: km(c, 0.6), income_mult: 1.3 }, "Tiền lớn và tên tuổi, bài của mình để sau"),
      C("Thuyết phục họ dựng bài mười hai người", { counters: step(c, DN), gamble: { p: 0.35, win: { counters: { dn_fame: 3 }, income_mult: 1.4, log: "Mười hai người trên sân khấu rộng. Cả sân vận động lặng đi rồi đứng dậy." }, lose: { money: km(c, -0.1), log: "Họ thay bạn bằng một biên đạo khác chỉ sau một cuộc họp." } } }, "Có thể làm nên tên, có thể mất hợp đồng"),
      C("Nhận, thuê vũ công tự do, công khai bảng lương", { counters: step(c, DN), money: km(c, 0.3), rel: 4, agency: 0.02, flags: ["dn_fair_pay"] }, "Lựa chọn thứ ba: lãi ít hơn, ai nhảy cũng được trả đủ", { tier: "sovereign" })], 0);
    return T("Ba tháng không ai gọi", `${f(c, "dn_broken") ? "Đầu gối bạn giờ báo trước mỗi cơn mưa." : "Các buổi thử vai giờ toàn người mười chín, hai mươi tuổi."} Đã ba tháng không ai gọi. Một công ty sự kiện mời bạn nhảy trên sân khấu dựng trên xe tải ở các buổi khai trương cửa hàng, trả theo suất.`, [
      C("Nhận nhảy sự kiện", { counters: step(c, DN, { dn_wear: 1 }), income_mult: 0.9, happy: -3 }, "Có tiền, nhảy cho người ta đi ngang qua"),
      C("Dựng bài cho đội văn nghệ các trường", { counters: step(c, DN), income_mult: 0.85, happy: 3, flags: ["dn_choreo_schools"] }, "Ít tiền, thấy nghề mình còn có ích"),
      C("Giải nghệ, học một nghề khác", { counters: step(c, DN), ...leave(DN), know: 2, flags: ["ex_dancer"] }, "Bắt đầu lại từ đầu, thôi chờ điện thoại")], 1); }),
  beat(DN, 5, 6, (c) => T("Cơ thể vẫn nhớ", `Sáng nào lưng bạn cũng đau, nhưng nhạc lên là chân vẫn tự đếm nhịp.${f(c, "dn_broken") ? " Bạn vẫn đi hơi tập tễnh." : ""} Một bệnh viện mời bạn dạy những người già run tay chân tập đi theo nhịp nhạc. Cùng lúc, một nhà xuất bản muốn bạn viết hồi ký về những năm trong nghề, kể cả những điều không đẹp.${f(c, "dn_fair_pay") ? " Những vũ công bạn từng trả đủ lương vẫn gọi điện mỗi dịp cuối năm." : ""}`, [
    C("Dạy ở bệnh viện", { counters: step(c, DN), income_mult: 0.8, happy: 5, flags: ["passed_on"] }, "Ít tiền, mỗi bước đi của người khác là bài múa của bạn"),
    C("Viết hồi ký, kể cả chuyện xấu của nghề", { counters: step(c, DN), money: km(c, 0.2), gamble: { p: 0.5, win: { rel: 4, flags: ["dn_memoir"], log: "Cuốn sách khiến ba trường múa sửa lại quy định tập luyện." }, lose: { rel: -3, flags: ["dn_memoir"], log: "Nửa giới múa thôi chào bạn." } } }, "Nói thật, có thể mất bạn bè trong nghề"),
    C("Mở trường múa mang tên mình", { counters: step(c, DN), money: km(c, -0.5), agency: 0.02, flags: ["dn_school"] }, "Vốn lớn, để lại một nơi cho người sau", { longterm: true })], 0), (c) => c.age >= 36),

  /* ---------- chuyện thường ngày ---------- */
  daily(DN, "dnc_scale", [18, 35], 8, () => T("Bàn cân sáng thứ Hai", `Vũ đoàn cân từng người mỗi sáng thứ Hai và đọc to con số. Bạn hơn "chuẩn" hai cân. Trưởng đoàn bảo: hoặc xuống cân trong một tháng, hoặc xuống hàng cuối.`, [
    C("Tìm chuyên gia dinh dưỡng, tập đúng cách", { money: -0.03, health: 2, bw: -2, flags: ["dn_healthy_body"] }, "Tốn tiền, chậm, không hại người"),
    C("Ép mình bằng mọi giá cho kịp hạn", { health: -6, happy: -3, counters: { dn_wear: 1 } }, "Giữ được chỗ, cơ thể trả giá"),
    C("Cùng cả đoàn đề nghị bỏ việc đọc cân", { gamble: { p: 0.45, win: { rel: 4, flags: ["leader"], log: "Trưởng đoàn mang bàn cân ra khỏi phòng tập. Không ai nói cảm ơn, nhưng ai cũng thở được." }, lose: { counters: { dn_fame: -1 }, log: "Bạn bị xếp hàng cuối cả mùa, như một lời nhắn cho người khác." } } }, "Lựa chọn thứ ba: đổi luật, có thể bị trù", { tier: "sovereign" })], 0)),
  daily(DN, "dnc_unpaid", [18, 45], 8, (c) => T("Ba tháng chưa có thù lao", vary("dnu", c.age, [
    `Video ca nhạc quay xong ba tháng, đã trăm triệu lượt xem, nhưng tám vũ công vẫn chưa nhận đồng nào. Nhà sản xuất nói "đang chờ đối tác".`,
    `Ba tháng sau đêm diễn lớn, ban tổ chức vẫn chưa trả vũ công, chỉ gửi mỗi người một tờ giấy chứng nhận "đã tham gia".`]), [
    C("Im lặng, giữ quan hệ cho lần sau", { money: -0.03, counters: { dn_fame: 1 } }, "Còn được gọi, mất tiền công"),
    C("Cùng cả nhóm đăng bài đòi tiền", { gamble: { p: 0.55, win: { money: 0.06, flags: ["dn_spoke_up"], log: "Bài đăng lan ra. Tiền về sau bốn ngày, kèm một lời xin lỗi." }, lose: { flags: ["dn_spoke_up"], counters: { dn_fame: -1 }, log: "Tiền vẫn chưa về, và bạn nghe nói tên mình bị gạch khỏi vài danh sách." } } }, "Đòi được tiền, có thể bị gạch tên"),
    C("Không nhận việc của họ nữa", { happy: 1, money: -0.02, flags: ["dn_walked"] }, "Mất mối, giữ được giá của mình")], 1)),
  daily(DN, "dnc_battle", [16, 35], 8, (c, N) => { const r = role(c, "rival")!; return T("Chung kết với người quen cũ", `Chung kết một giải đấu nhảy, người đứng bên kia vòng tròn là ${N(r)}. Hai người biết nhau từ hồi tập chung, ai cũng biết điểm yếu của người kia. Giải thưởng đủ trả tiền nhà nửa năm.`, [
    C("Nhảy nhắm vào điểm yếu của đối thủ", { memory: { npc: r, tag: "HUMILIATED_ME", weight: -0.25, note: "trận chung kết bị nhắm vào điểm yếu" }, gamble: { p: 0.6, win: { money: km(c, 0.1), counters: { dn_fame: 1 }, log: "Bạn thắng. Đám đông hò reo, đối thủ không bắt tay." }, lose: { happy: -3, log: "Bạn vẫn thua, và mất luôn một người quen." } } }, "Dễ thắng hơn, mất một người quen"),
    C("Nhảy bài của mình, không nhìn đối thủ", { gamble: { p: 0.45, win: { money: km(c, 0.1), counters: { dn_fame: 1 }, log: "Bạn thắng sát nút. Sau trận, hai người đứng nói chuyện đến khuya." }, lose: { happy: -1, counters: { dn_fame: 1 }, log: "Bạn thua, nhưng đoạn nhảy của bạn được chia sẻ nhiều hơn của người thắng." } } }, "Giữ chất, khó thắng hơn"),
    C("Đề nghị chia giải, cùng dựng một bài song đấu", { money: km(c, 0.04), memory: { npc: r, tag: "WIN_WIN_DEAL", weight: 0.3, note: "chia giải, cùng dựng bài song đấu" } }, "Ít tiền hơn, thêm một người đi cùng đường dài", { tier: "awakened" })], 2, { npc: r }); }, (c) => !!role(c, "rival")),
  daily(DN, "dnc_trend", [16, 40], 6, (c) => T("Ba mươi giây theo trào lưu", vary("dnt", c.age, [
    "Một nhãn nước ngọt muốn bạn dựng một điệu nhảy ba mươi giây để cả mạng nhảy theo, trả bằng một tháng diễn.",
    "Một ứng dụng video ngắn mời bạn dựng điệu nhảy ba mươi giây cho chiến dịch mùa hè, nhạc nền phải là bài họ chọn."]), [
    C("Dựng sao cho ai cũng nhảy theo được", { money: km(c, 0.08), happy: -1, counters: { dn_fame: 1 } }, "Tiền nhanh, bài nhảy dễ đến nhàm"),
    C("Dựng thứ mình thấy đẹp, dù khó", { gamble: { p: 0.35, win: { money: km(c, 0.08), counters: { dn_fame: 2 }, log: "Khó hơn, nhưng người ta thi nhau tập cho bằng được." }, lose: { money: km(c, 0.03), log: "Không ai nhảy theo nổi. Bên đặt hàng không gia hạn." } } }, "Có thể thành dấu ấn, có thể chẳng ai theo"),
    C("Từ chối dựng nhảy cho quảng cáo", { happy: 1 }, "Giữ bài nhảy cho sân khấu, bỏ lỡ một khoản")], 0)),
  daily(DN, "dnc_floor", [14, 45], 8, (c) => T("Sàn tập bê tông", "Phòng tập của nhóm là một nhà kho cũ, sàn bê tông. Ba người trong nhóm đã đau ống quyển. Một sàn gỗ có lớp đệm đàn hồi đúng chuẩn đắt bằng tiền thuê kho cả năm.", [
    C("Góp tiền làm sàn gỗ", { money: km(c, -0.06), health: 3, counters: { dn_wear: -1 } }, "Tốn tiền, đỡ cho đầu gối cả nhóm", { longterm: true }),
    C("Tập tiếp, trải thêm tấm thảm", { health: -2, counters: { dn_wear: 1 } }, "Không tốn, đôi chân chịu"),
    C("Xin tập nhờ nhà thi đấu trường, đổi lại dạy học sinh", { bw: -3, rel: 3, flags: ["dn_school_deal"] }, "Lựa chọn thứ ba: đổi sức dạy lấy sàn tập tốt", { tier: "sovereign" })], 0)),
  daily(DN, "dnc_passport", [18, 45], 10, () => T("Hộ chiếu trong ngăn kéo", `Chuyến diễn ở nước ngoài, quản lý thu hộ chiếu của cả đoàn "để giữ cho an toàn". Đã hai tháng, lương chưa trả đủ, mỗi lần bạn hỏi lại hộ chiếu, ông ta đều bảo để sau.`, [
    C("Lặng lẽ liên hệ đại sứ quán", { flags: ["dn_embassy"], gamble: { p: 0.6, win: { money: 0.05, log: "Một tuần sau, cả đoàn nhận lại hộ chiếu và đủ lương. Quản lý bị công ty cho nghỉ." }, lose: { money: -0.1, happy: -4, log: "Bạn lấy lại được hộ chiếu, nhưng bị cắt hợp đồng và tự mua vé về." } } }, "Lấy lại tự do, có thể mất việc"),
    C("Cả đoàn cùng đòi, không trả thì không diễn", { gamble: { p: 0.5, win: { money: 0.08, rel: 4, flags: ["leader"], log: "Tối ấy không ai lên sân khấu. Sáng hôm sau, hộ chiếu nằm trên bàn từng người." }, lose: { money: -0.05, log: "Ba người sợ, quay lại diễn. Cả đoàn tan." } } }, "Sức mạnh số đông, nếu không ai bỏ cuộc", { tier: "sovereign" }),
    C("Im lặng, diễn cho hết hợp đồng", { money: 0.04, happy: -4, bw: -3 }, "Có tiền, sống trong nỗi sợ")], 0)),
  daily(DN, "dnc_pair", [18, 40], 10, () => T("Bạn nhảy đôi sáu năm", "Bạn và bạn nhảy đôi đã tập cùng nhau sáu năm. Một huấn luyện viên lớn gợi ý bạn đổi sang cặp với người khác giỏi hơn để đi giải quốc tế. Bạn nhảy cũ chưa biết gì.", [
    C("Đổi bạn nhảy, nói thẳng một lần", { happy: -2, gamble: { p: 0.5, win: { counters: { dn_fame: 2 }, log: "Cặp mới vào chung kết ngay giải đầu tiên." }, lose: { log: "Cặp mới không ăn ý. Người cũ đã có cặp khác." } } }, "Lên hạng, bỏ lại sáu năm"),
    C("Ở lại với bạn nhảy cũ", { rel: 3, flags: ["dn_loyal_pair"] }, "Giữ người, chậm lên hạng"),
    C("Kể hết cho bạn nhảy, cùng quyết định", { rel: 2, gamble: { p: 0.5, win: { flags: ["dn_loyal_pair"], log: "Hai người tập thêm một năm, rồi tự giành được suất đi giải." }, lose: { counters: { dn_fame: 1 }, log: "Bạn nhảy tự rút để bạn đi. Câu chào tạm biệt nhẹ đến lạ." } } }, "Công bằng với người cũ, chưa chắc đã giữ được", { tier: "awakened" })], 1)),
  daily(DN, "dnc_kids", [20, 60], 8, (c) => T("Lớp nhảy thiếu nhi", vary("dnk", c.age, [
    "Bạn dạy thêm lớp nhảy thiếu nhi buổi tối. Một phụ huynh đòi con mình phải đứng giữa trong buổi báo cáo, nếu không sẽ rút con và kéo theo năm nhà khác.",
    "Buổi báo cáo cuối năm của lớp thiếu nhi, một phụ huynh dúi cho bạn chiếc phong bì dày, nhờ cho con mình múa đơn."]), [
    C("Giữ nguyên tắc, xếp theo năng lực", { money: -0.03, counters: { dn_teach: 1 } }, "Mất học trò, lớp vẫn công bằng"),
    C("Chiều phụ huynh cho yên chuyện", { money: 0.03, happy: -2 }, "Có tiền, đứa trẻ giỏi hơn đứng sau"),
    C("Mời phụ huynh xem con mình tập một buổi", { gamble: { p: 0.5, win: { rel: 3, log: "Phụ huynh xem hết buổi, về không nói thêm gì." }, lose: { money: -0.02, log: "Họ xem mười phút rồi đi. Đứa bé không đến lớp nữa." } } }, "Để phụ huynh tự thấy, chưa chắc họ chịu thấy", { tier: "awakened" })], 0)),
  daily(DN, "dnc_age", [26, 34], 99, (c) => T("Dòng giới hạn tuổi", `Hồ sơ thử vai của một chương trình lớn ghi rõ: vũ công dưới hai mươi lăm tuổi. Bạn ${c.age} tuổi, trông vẫn trẻ. Một người quen trong nghề bảo ai cũng khai bớt.`, [
    C("Khai bớt vài tuổi", { secret: { tag: "FORGED_PAPERS", severity: 0.15, fuse_years: [2, 8], note: "khai bớt tuổi trong hồ sơ thử vai" }, gamble: { p: 0.5, win: { income_mult: 1.1, counters: { dn_fame: 1 }, log: "Bạn được chọn. Mỗi lần ai hỏi tuổi, bạn đổi chủ đề." }, lose: { log: "Bạn vẫn trượt, và vẫn phải nhớ con số mình đã khai." } } }, "Có cửa, mang theo một lời nói dối"),
    C("Khai thật, vẫn đi thử", { counters: { honest: 1 }, gamble: { p: 0.2, win: { counters: { dn_fame: 1 }, log: "Giám khảo gạch dòng giới hạn tuổi trên hồ sơ của bạn." }, lose: { log: "Hồ sơ bị loại ngay từ vòng giấy." } } }, "Thật thà, cơ hội mỏng"),
    C("Làm video kể chuyện nhảy múa sau tuổi hai lăm", { gamble: { p: 0.4, win: { counters: { dn_fame: 2 }, log: "Hàng nghìn vũ công lớn tuổi kể chuyện của họ dưới video của bạn." }, lose: { happy: -1, log: "Video trôi đi lặng lẽ." } } }, "Lựa chọn thứ ba: đổi câu hỏi về tuổi", { tier: "sovereign" })], 1)),
  daily(DN, "dnc_reality", [16, 30], 10, () => T("Gameshow cần nước mắt", `Một gameshow nhảy mời bạn vào thẳng vòng trong. Biên kịch đã viết sẵn "câu chuyện" của bạn: một tuổi thơ nghèo khổ hơn sự thật, và một đoạn bạn khóc khi nhắc đến gia đình.`, [
    C("Diễn đúng kịch bản", { happy: -3, counters: { dn_fame: 2 }, flags: ["dn_fake_story"] }, "Lên sóng giờ vàng, mang câu chuyện không phải của mình"),
    C("Kể chuyện thật của mình, dù nhạt", { gamble: { p: 0.4, win: { counters: { dn_fame: 1 }, log: "Câu chuyện thật thì nhạt, nhưng khán giả thích bạn vì bạn không khóc." }, lose: { log: "Phần của bạn bị cắt còn mười giây." } } }, "Giữ sự thật, có thể bị cắt sóng", { tier: "awakened" }),
    C("Rút khỏi chương trình", { happy: 1, counters: { dn_fame: -1 } }, "Giữ mình, lỡ một sân khấu lớn")], 1)),

  /* ---------- gia đình ---------- */
  cross(DN, "dnc_family", [18, 70], (c) => (c.married && !!role(c, "spouse")) || (c.kids_teen > 0 && !!role(c, "child")) || !!role(c, "mother") || !!role(c, "father"), (c, N) => {
    const s = role(c, "spouse"); const k = role(c, "child"); const p = role(c, "mother") ?? role(c, "father");
    if (c.kids_teen > 0 && k) return T(`${N(k)} muốn học múa`, `${N(k)} mười bốn tuổi, muốn thi vào ${school(c)}. Bạn biết rõ những buổi sáng đau chân, bàn cân thứ Hai, và cái tuổi ba mươi của nghề này.`, [
      C("Ủng hộ hết mình", { money: -0.05, trust: { npc: k, delta: 0.25 } }, "Con theo đam mê, đi đúng con đường bạn biết là đau"),
      C("Khuyên con học một nghề chắc chắn hơn", { trust: { npc: k, delta: -0.2 } }, "Con an toàn hơn, có thể oán bạn"),
      C("Tự dạy con một năm, rồi để con chọn", { bw: -3, trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "dạy con múa một năm rồi để con tự chọn", years: 1 } }, "Tốn sức một năm, quyết định thuộc về con", { tier: "awakened" })], 2, { npc: k });
    if (c.married && s) return T("Mười tháng xa nhà", `Một vũ đoàn nước ngoài mời bạn lưu diễn mười tháng. ${N(s)} nói năm nay hai người đã định có con, và hỏi bạn có chờ thêm được không.`, [
      C("Đi, hứa về đúng hẹn", { money: 0.3, counters: { dn_fame: 1 }, trust: { npc: s, delta: -0.15 }, promise: { to: s, what: "về nhà sau mười tháng lưu diễn", years: 1 } }, "Tiền và tên tuổi, đặt cược lên người ở nhà"),
      C("Ở nhà, từ chối lời mời", { happy: -3, trust: { npc: s, delta: 0.2 } }, "Giữ nhà, tiếc một sân khấu"),
      C(`Đi nửa lịch, mời ${N(s)} sang thăm giữa chừng`, { money: 0.12, bw: -3, trust: { npc: s, delta: 0.1 } }, "Lựa chọn thứ ba: ít tiền hơn, hai người cùng tính", { tier: "sovereign" })], 1, { npc: s });
    return T("Tài khoản lạ hay khen", `Dưới mọi video bạn đăng có một tài khoản không ảnh đại diện, lần nào cũng khen đầu tiên và cãi nhau với ai chê bạn. Bạn vừa nhận ra đó là ${N(p!)}, người từng nói nhảy múa không phải là nghề.`, [
      C(`Gọi điện cảm ơn ${N(p!)}, không nhắc tài khoản`, { happy: 2, trust: { npc: p!, delta: 0.2 } }, "Ấm lòng, giữ cho người ấy chút thể diện"),
      C("Giả vờ không biết", { happy: 3 }, "Giữ niềm vui thầm lặng, không ai nói ra"),
      C(`Nhắn trêu: "Con biết rồi nhé"`, { gamble: { p: 0.5, win: { trust: { npc: p!, delta: 0.25 }, log: `${N(p!)} gửi lại một biểu tượng mặt cười, lần đầu tiên.` }, lose: { trust: { npc: p!, delta: -0.05 }, log: "Tài khoản ấy biến mất ngay tối đó." } } }, "Gần nhau hơn, hoặc người ấy ngượng mà rút")], 0, { npc: p! }); }),
];
