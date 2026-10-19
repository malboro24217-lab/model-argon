/**
 * 8 mầm canon event đợt A (spec 2026-10-18-canon-event §4; plan Task 6, phần "Mầm").
 *
 * Mỗi mầm đọc chỗ trống đã điền từ chính đời người chơi: `who` (người), `what` (vật gài hay tài sản), `noi` (nơi đang
 * sống). Chỗ trống không bắt buộc có thể trống: chữ luôn có bản dự phòng. Bốn mầm nâng từ thẻ Codex
 * (di_chuc ← c39, nam_cuoi ← c27, ve_xa ← c14, nuoc_len ← c05). Thẻ gốc vẫn ở lại làm thẻ gài (spec §4, R16):
 * mầm là phần trả, tiêu đề khác thẻ gốc, và khi đời này đã gặp thẻ gốc (cờ "tp_cXX_seen", route "tp_cXX_route_<i>")
 * thì chữ gọi lại khoảnh khắc ấy.
 *
 * Quy tắc:
 *  - ≥ 4 cửa, ≥ 3 kiểu cửa, dẫn tới ≥ 2 trong 5 mùa thường.
 *  - Cửa tới tron_chay / xu_nguoi luôn có `when: c.independent` (người còn sống nhờ quỹ gia đình không tự bỏ đi được).
 *  - Tiêu đề và nhãn ≤ 60 ký tự, hint ≤ 70; câu không bắt đầu bằng chữ thường (bọc cap()).
 *  - Phạm pháp chỉ tả hậu quả; không người thật, tổ chức thật, thương hiệu, tôn giáo cụ thể.
 */
import type { CastRole, Effect, FactContext, MemoryTag } from "../types.ts";
import type { CanonSeed, Slots } from "./Canon.ts";
import { cap } from "./kit.ts";
import { ELEVATED_SEEDS } from "../turning/kit.ts";

type Names = (id: string) => string;

/* ------------------------------------------------------------------ helper đọc chỗ trống */

const indep = (c: FactContext): boolean => c.independent;
/** Tên người ở chỗ `who` (viết hoa đầu), hoặc chữ dự phòng. */
const ten = (s: Slots, N: Names, dflt: string): string => (s.who ? cap(N(s.who)) : dflt);
/** Nơi đang sống, có dự phòng. */
const noi = (s: Slots): string => s.noi || "nơi bạn đang sống";
/** Nhãn vật ở chỗ `what` (rỗng nếu trống). */
const vat = (s: Slots): string => s.what?.label ?? "";
/** Số năm kể từ khi vật gài ra đời ("bao năm" nếu là tài sản hay quá gần). */
const khi = (s: Slots, c: FactContext): string => {
  const n = s.what && "age" in s.what ? c.age - s.what.age : 0;
  return n >= 2 ? `${n} năm` : "bao năm";
};
/** `who` có mang vai `r` không. */
const vai = (s: Slots, c: FactContext, r: CastRole): boolean => !!s.who && (c.cast[r] === s.who || !!c.roles[s.who]?.includes(r));
/** Bản dài nếu vừa `max` ký tự, không thì bản ngắn. */
const vua = (dai: string, ngan: string, max = 60): string => (dai.length <= max ? dai : ngan);
/** Id thẻ Codex gốc của một mầm nâng cấp (một nguồn: ELEVATED_SEEDS trong turning/kit.ts). */
const goc = (seed: string): string => {
  const id = Object.keys(ELEVATED_SEEDS).find((k) => ELEVATED_SEEDS[k] === seed);
  if (!id) throw new Error("mầm không có thẻ gốc: " + seed);
  return id;
};
const C39 = goc("di_chuc"), C27 = goc("nam_cuoi"), C14 = goc("ve_xa"), C05 = goc("nuoc_len");
/** Đời này đã gặp thẻ Codex `id` (tp_c39…) chưa. */
const daGap = (c: FactContext, id: string): boolean => c.flags.has(id + "_seen");
/** Câu gọi lại route đã chọn ở thẻ Codex `id`, hoặc `dflt` nếu không rõ route. */
const hoi = (c: FactContext, id: string, routes: [string, string, string], dflt: string): string => {
  const i = [0, 1, 2].find((k) => c.flags.has(`${id}_route_${k}`));
  return i === undefined ? dflt : routes[i]!;
};
/** Ký ức của người ở chỗ `who` về lựa chọn này (không có ai thì không có gì). */
const nho = (tag: MemoryTag, weight: number, note: string) => (_c: FactContext, s: Slots): Effect =>
  (s.who ? { memory: { npc: s.who, tag, weight, note } } : {});

/* ------------------------------------------------------------------ 1. Món nợ cũ quay lại */

const NO_CU: CanonSeed = {
  id: "no_cu", axes: ["tien", "luat"], ages: [16, 72],
  who: { roles: ["creditor", "bully", "rival", "first_boss", "partner", "neighbor"], plants: ["person", "debt"], required: true },
  what: { plants: ["debt", "promise"], owns: ["shop", "house", "land", "vehicle"], required: false },
  title: (s, c, N) => vua(`${ten(s, N, "Chủ nợ")} quay lại đòi nợ`, "Món nợ cũ quay lại"),
  text: (s, c, N) => {
    const ai = ten(s, N, "Chủ nợ"), w = s.what;
    // Không nợ nần gì (quy tắc 9): lời đòi nợ có thể sai, chữ nói rõ bạn không nhớ đã vay.
    const ky = !c.independent ? "Chữ ký bên dưới là của bố mẹ bạn, nét chữ run run của một năm túng quẫn"
      : c.debt > 0 || c.loans > 0 ? "Chữ ký bên dưới là của bạn, nét chữ run run của một năm túng quẫn"
      : "Chữ ký bên dưới giống hệt chữ của bạn, dù bạn không nhớ đã từng vay ai";
    if (w && w.kind === "debt")
      return `${ai} đứng trước cửa nhà bạn ở ${noi(s)}, tay cầm ${w.label}. Giấy đã ố vàng sau ${khi(s, c)}, nhưng con số trên đó thì có thêm lãi. ${ai} không ngồi, chỉ nói: “Tới hạn rồi.”`;
    if (w && w.kind === "promise")
      return `${ai} đứng trước cửa nhà bạn ở ${noi(s)}, nhắc lại ${w.label} từ ${khi(s, c)} trước. Kèm theo là một tờ giấy ghi rõ từng khoản ${ai} đã ứng ra, cộng cả lãi. “Tới hạn rồi.”`;
    const doa = w ? `${ai} liếc qua ${w.label} rồi nói: không trả bằng tiền thì trả bằng thứ khác.` : `Con số đã có thêm lãi. ${ai} không ngồi, chỉ nói: “Tới hạn rồi.”`;
    return `${ai} đứng trước cửa nhà bạn ở ${noi(s)}, tay cầm một tờ giấy nợ đã ố vàng. ${ky}. ${doa}`;
  },
  doors: [
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Rõ trắng đen, nhưng cả họ sẽ bị lôi vào cuộc",
      label: (s, c, N) => vua(`Mở sổ, đối chiếu từng dòng với ${ten(s, N, "chủ nợ")}`, "Mở sổ, đối chiếu từng dòng một") },
    { kind: "nhan_toi", season: "lam_lai", hint: "Sạch nợ, sạch luôn túi; bắt đầu lại từ số không",
      label: (s, c) => (c.independent ? "Nhận món nợ, bán hết để trả đủ một lần" : "Đứng ra nhận trả thay bố mẹ, từng đồng một"),
      effects: nho("KEPT_PROMISE", 0.3, "trả đủ món nợ cũ") },
    { kind: "thoa_hiep", season: "lam_lai", hint: "Giữ được hòa khí và tên tuổi, mất gần hết của cải",
      label: () => "Gán hết những gì có, xin xóa phần lãi",
      effects: nho("WIN_WIN_DEAL", 0.2, "dàn xếp món nợ cũ") },
    { kind: "lat_ban", season: "ngoi_sao", hint: "Thiên hạ đứng về phía bạn, và đời bạn thành chuyện của thiên hạ",
      label: () => "Kể công khai chuyện lãi chồng lãi cho cả phố",
      effects: nho("HUMILIATED_ME", -0.3, "bị bêu tên vì món nợ") },
    { kind: "bo_chay", season: "tron_chay", hint: "Thoát được hôm nay, nhưng tên bạn vẫn nằm trong sổ người ta",
      label: (s) => vua(`Khóa cửa, rời ${noi(s)} ngay trong đêm`, "Khóa cửa, rời đi ngay trong đêm"), when: indep,
      effects: nho("CHEATED_ME", -0.4, "quỵt món nợ cũ") },
    { kind: "danh_cuoc", season: "xu_nguoi", hint: "Có đường trả nợ, đổi lại ba năm xa nhà",
      label: () => "Đi làm ở nước ngoài, hẹn ba năm trả đủ", when: indep },
  ],
};

/* ------------------------------------------------------------------ 2. Của trời cho */

const TROI_CHO: CanonSeed = {
  id: "troi_cho", axes: ["tien", "danh"], ages: [12, 72],
  who: { roles: ["sibling", "childhood_friend", "neighbor", "spouse"], plants: ["person"], required: false },
  what: { plants: ["object", "animal", "place"], owns: ["land", "house", "gold"], required: false },
  title: (s) => (s.what ? vua(`Của trời cho: ${vat(s)}`, "Của trời cho") : "Hũ sành dưới nền bếp"),
  text: (s, c, N) => {
    const w = s.what, muoi = "con số bằng mười năm làm lụng của cả nhà";
    let mo: string;
    if (!w) mo = `Sửa lại nền bếp ở ${noi(s)}, lưỡi cuốc chạm vào một hũ sành. Bên trong là vàng lá gói trong giấy báo cũ đã ngả màu, đủ để cả nhà đổi đời.`;
    else if (w.kind === "object") mo = `Người thợ định giá lật ${w.label} trong tay ba lần, rồi viết một con số lên mẩu giấy và đẩy về phía bạn. Đó là ${muoi}. Thứ bạn giữ ${khi(s, c)} hóa ra là một gia tài.`;
    else if (w.kind === "animal") mo = `Một người lạ đứng cả buổi sáng trước cổng chỉ để nhìn ${w.label}. Trước khi đi, người ấy để lại tờ giấy đặt cọc, ${muoi}.`;
    else if (w.kind === "place") mo = `Đường lớn sắp mở ngang qua ${w.label}. Tờ thông báo đền bù nằm trên bàn, ${muoi}.`;
    else if (w.kind === "asset" && w.key === "gold") mo = `Sau một mùa giá cả điên đảo, ${w.label} bạn cất trong tủ đã đáng giá gấp năm lần lúc mua. Người ta gọi điện hỏi mua từ sáng sớm.`;
    else mo = `Đường lớn sắp mở ngang qua ${w.label}. Sáng nay có ba người môi giới đứng chờ trước cửa, ai cũng trả gấp mười giá cũ.`;
    const ai = s.who ? `${ten(s, N, "")} là người duy nhất ngoài bạn đã thấy tận mắt.` : "Chưa ai khác biết.";
    return `${mo} ${ai}`;
  },
  doors: [
    { kind: "lat_ban", season: "ngoi_sao", hint: "Ai cũng biết tên bạn, kể cả những người bạn không muốn",
      label: () => "Kể cho cả xóm, mở tiệc ăn mừng ba ngày" },
    { kind: "thoa_hiep", season: "lam_lai", hint: "Nhẹ lòng, nhẹ túi; con đường còn lại phải tự đi từ đầu",
      label: (s, c) => (c.independent ? "Chia hết cho những người từng cưu mang mình" : "Xin bố mẹ chia hết cho người từng giúp nhà"),
      effects: nho("HELPED_IN_CRISIS", 0.3, "được chia phần của trời cho") },
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Của về tay bạn, cả họ thành bên kia chiến tuyến",
      label: () => "Giữ hết, mặc họ hàng kéo tới đòi phần",
      effects: nho("REFUSED_HELP", -0.2, "không được chia phần của trời cho") },
    { kind: "danh_cuoc", season: "lam_lai", hint: "Thắng thì gấp mười, thua thì về lại số không",
      label: (s, c) => (c.independent ? "Dồn hết vào một vụ làm ăn thật lớn" : "Để bố mẹ dồn hết vào một vụ làm ăn lớn") },
    { kind: "bo_chay", season: "tron_chay", hint: "Giữ được của, mất luôn chốn quen và người quen",
      label: (s) => vua(`Giấu kín, lặng lẽ dọn khỏi ${noi(s)}`, "Giấu kín, lặng lẽ dọn đi nơi khác"), when: indep },
    { kind: "buong", season: "xu_nguoi", hint: "Bắt đầu sạch sẽ ở nơi không ai biết bạn vừa giàu",
      label: () => "Buông chuyện cũ, cầm tiền sang nước khác sống", when: indep },
  ],
};

/* ------------------------------------------------------------------ 3. Người thân phản bội */

/** Người phản bội là ai với bạn. */
const quanHe = (s: Slots, c: FactContext): string =>
  vai(s, c, "spouse") ? "người bạn đời" : vai(s, c, "sibling") ? "người ruột thịt" : vai(s, c, "partner") ? "người cùng làm ăn"
    : vai(s, c, "childhood_friend") ? "người bạn từ thuở nhỏ" : "người bạn tin nhất";
const nhoTuoi = (c: FactContext): boolean => c.age < 16;
/** Người ở chỗ `who` là người trong nhà (bạn đời, anh chị em, bố mẹ, con)? Câu chữ "trước mặt cả nhà" chỉ hợp khi đúng (Task 20). */
const nguoiNha = (s: Slots, c: FactContext): boolean => (["spouse", "sibling", "father", "mother", "child"] as const).some((r) => vai(s, c, r));

const PHAN_BOI: CanonSeed = {
  id: "phan_boi", axes: ["tinh", "mau"], ages: [10, 72],
  who: { roles: ["spouse", "sibling", "partner", "childhood_friend"], plants: ["person"], required: true },
  what: { plants: ["secret", "promise", "object"], owns: ["house", "shop", "land", "stake"], required: false },
  title: (s, c, N) => {
    const ai = ten(s, N, "Người thân"), k = s.what?.kind;
    const t = nhoTuoi(c) && k !== "secret" ? `${ai} đổ lỗi cho bạn` : k === "secret" ? `${ai} đã kể ra` : k === "promise" ? `${ai} đổi lời`
      : k === "object" ? `Tờ biên nhận đề tên ${ai}` : `Chữ ký của ${ai}`;
    return vua(t, "Người thân phản bội");
  },
  text: (s, c, N) => {
    const ai = ten(s, N, "Người thân"), qh = quanHe(s, c), w = s.what;
    if (nhoTuoi(c)) {
      if (w && w.kind === "secret") return `${ai} đã đem ${w.label} kể cho cả lớp. Bạn chỉ từng nói chuyện ấy với đúng một người, và người đó đang đứng giữa đám đông cười lớn nhất.`;
      const mat = w && w.kind === "object" ? w.label : "tiền học cất trong hộp thiếc";
      const hua = w && w.kind === "promise" ? ` Vậy mà hai đứa từng móc tay giữ ${w.label}.` : "";
      return `${ai} khai với cả nhà rằng chính bạn làm mất ${mat}. Tối hôm trước, bạn đã thấy ${ai} lén giấu nó dưới gầm giường.${hua}`;
    }
    if (w && w.kind === "asset") return `Tờ giấy sang tên ${w.label} có chữ ký của ${ai}, ${qh}. Không có chữ ký của bạn. Ngày ký là đúng tuần bạn đi vắng.`;
    if (w && w.kind === "secret") return `${cap(w.label)} là chuyện bạn chỉ kể cho đúng một người. Sáng nay cả ${noi(s)} đều biết, và người kể là ${ai}, ${qh}.`;
    if (w && w.kind === "promise") return `${ai}, ${qh}, từng đứng ra làm chứng cho ${w.label}. Hôm nay ${ai} đứng về phía bên kia và nói trước mặt mọi người rằng chưa từng có lời hứa nào.`;
    if (w) return `${cap(w.label)} biến mất khỏi tủ. Bạn tìm thấy nó ở tiệm cầm đồ đầu phố, kèm tờ biên nhận ký tên ${ai}, ${qh}.`;
    return `Sổ tiết kiệm chung chỉ còn lại con số không. Dòng rút cuối cùng mang chữ ký của ${ai}, ${qh}, vào một buổi sáng bạn còn đang ngủ.`;
  },
  doors: [
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Sự thật ra ánh sáng, và người quanh bạn phải chọn phe",
      label: (s, c, N) => (nhoTuoi(c) ? (s.what?.kind === "secret" ? "Kể hết với bố mẹ, chỉ rõ ai đã nói ra" : "Kể hết với bố mẹ, chỉ tận chỗ giấu")
        : nguoiNha(s, c) ? vua(`Gọi cả nhà ngồi lại, hỏi thẳng ${ten(s, N, "người ấy")}`, "Gọi cả nhà ngồi lại, hỏi thẳng một lần")
        : vua(`Hẹn ${ten(s, N, "người ấy")} ra, hỏi thẳng một lần`, "Hẹn người ấy ra, hỏi thẳng một lần")) },
    { kind: "tra_dua", season: "vu_an_gia_toc", hint: "Hả dạ về sau, nhưng mối thù sẽ đi theo bạn nhiều năm",
      label: (s, c, N) => vua(`Giữ bằng chứng, chờ ngày trả lại ${ten(s, N, "người ấy")}`, "Giữ bằng chứng, chờ ngày trả lại"),
      effects: nho("HUMILIATED_ME", -0.4, "bị trả đũa sau vụ phản bội") },
    { kind: "nhan_toi", season: "lam_lai", hint: "Giữ được người, mất gần hết những gì đang có",
      label: (s, c, N) => (nhoTuoi(c) ? (s.what?.kind === "secret" ? "Nhận mình cũng có lỗi, xin cả lớp thôi bàn tán"
        : vua(`Nhận lỗi thay, để ${ten(s, N, "người ấy")} khỏi bị phạt`, "Nhận lỗi thay, im lặng chịu phạt"))
        : "Im lặng gánh phần thiệt, làm lại từ đầu"),
      effects: nho("HELPED_IN_CRISIS", 0.3, "được bạn gánh thay vụ phản bội") },
    { kind: "lat_ban", season: "ngoi_sao", hint: "Cả thiên hạ đứng về phía bạn, và dõi theo từng bước bạn đi",
      label: (s, c) => (nhoTuoi(c) ? "Kể hết đầu đuôi trước cả trường" : "Kể toàn bộ chuyện lên mạng cho thiên hạ phân xử") },
    { kind: "bo_chay", season: "tron_chay", hint: "Không phải nhìn mặt ai nữa, cũng không còn chỗ để về",
      label: () => "Xếp đồ, rời nhà ngay đêm nay không một lời", when: indep },
    { kind: "buong", season: "xu_nguoi", hint: "Thoát khỏi vết thương, xa luôn những người còn thương mình",
      label: () => "Buông hết, xin việc ở một nước thật xa", when: indep },
  ],
};

/* ------------------------------------------------------------------ 4. Nổi tiếng bất ngờ */

const NOI_TIENG: CanonSeed = {
  id: "noi_tieng", axes: ["danh"], ages: [12, 60],
  who: { roles: ["childhood_friend", "sibling", "neighbor"], plants: ["person"], required: false },
  what: { plants: ["skill", "animal", "object", "place"], required: false },
  title: () => "Hai triệu lượt xem",
  text: (s, c, N) => {
    const w = s.what;
    const canh = !w ? "cảnh bạn hát lạc giọng giữa một đám cưới" : w.kind === "skill" ? `cảnh bạn trổ tài ${w.label}`
      : w.kind === "place" ? `cảnh bạn ở ${w.label}` : `cảnh bạn với ${w.label}`;
    const quay = s.who ? `do ${ten(s, N, "")} quay` : "ai đó quay lén";
    const o = w?.kind === "place" ? "" : ` ở ${noi(s)}`;
    return `Đoạn phim ba mươi bảy giây ${quay} ${canh}${o} sáng nay đã có hai triệu lượt xem. Ở giây cuối, bạn buột miệng một câu mà giờ cả nước đang nhại lại. Điện thoại rung đến nóng ran trên bàn.`;
  },
  doors: [
    { kind: "lat_ban", season: "ngoi_sao", hint: "Nổi hơn nữa, và không còn đường lui về đời thường",
      label: () => "Nhận lời lên sóng trực tiếp tối nay" },
    { kind: "danh_cuoc", season: "ngoi_sao", hint: "Được ăn cả; ngã thì cả nước cùng thấy",
      label: (s, c) => (!c.independent ? "Xin bố mẹ cho dồn hết sức vào kênh riêng"
        : c.has_job ? "Nghỉ việc, sống hẳn bằng tiếng tăm này" : "Gác mọi dự định, sống hẳn bằng tiếng tăm này") },
    { kind: "thoa_hiep", season: "vu_an_gia_toc", hint: "Nhà có thêm thu nhập, và thêm chuyện để tranh nhau",
      label: () => "Để cả nhà đứng ra lo, chia nhau lời mời" },
    { kind: "nhan_toi", season: "lam_lai", hint: "Giữ được lòng tự trọng, mất gần hết những gì đang có",
      label: () => "Lên tiếng xin lỗi về câu nói ở giây cuối" },
    { kind: "buong", season: "tron_chay", hint: "Yên thân, nhưng phải sống như người đang trốn",
      label: (s) => vua(`Tắt máy, rời ${noi(s)} tới khi người ta quên`, "Tắt máy, đi thật xa tới khi người ta quên"), when: indep },
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Đoạn phim có thể biến mất, tình thân thì khó lành",
      label: (s, c, N) => vua(`Bắt ${ten(s, N, "")} gỡ đoạn phim xuống ngay`, "Bắt người quay gỡ đoạn phim xuống"),
      when: (c, s) => !!s.who, effects: nho("HUMILIATED_ME", -0.3, "bị bắt gỡ đoạn phim") },
  ],
};

/* ------------------------------------------------------------------ 5. Ba bản di chúc (nâng từ Codex c39) */

/** Di chúc của chính bạn (đã gặp c39, hoặc đã già và có từ hai con) hay của bố mẹ. */
const diChucRieng = (c: FactContext): boolean => daGap(c, C39) || (c.age >= 58 && c.kids_alive >= 2);

const DI_CHUC: CanonSeed = {
  id: "di_chuc", axes: ["mau", "tien"], ages: [20, 72],
  who: { roles: ["father", "mother", "sibling"], plants: ["person"], required: false },
  what: { plants: ["object", "place", "promise"], owns: ["house", "land", "shop"], required: false },
  title: (s, c) => (daGap(c, C39) ? "Bản di chúc thứ tư" : s.what ? vua(`Ai sẽ giữ ${vat(s)}`, "Những cái tên bị gạch") : "Những cái tên bị gạch"),
  text: (s, c, N) => {
    const thu = s.what ? ` Cả ba bản đều xoay quanh ${vat(s)}.` : "";
    if (daGap(c, C39)) {
      const quyet = hoi(c, C39, ["chia đều và nói rõ với các con khi còn sống", "giữ lại một quỹ cho việc chung của cả nhà",
        "chia theo điều mỗi đứa cần"], "chọn một trong ba bản");
      const tim = s.who ? ` ${ten(s, N, "")} là người tìm thấy nó.` : "";
      const quanh = s.what ? ` Bản ấy chỉ nói về ${vat(s)}.` : "";
      return `Mấy năm trước, bạn đã ngồi trước ba bản di chúc viết tay và quyết ${quyet}. Giờ trên bàn có bản thứ tư, đúng nét chữ của bạn, ghi một ngày bạn không còn nhớ.${tim}${quanh} Cả nhà đang chờ bạn nói bản nào là bản cuối.`;
    }
    if (diChucRieng(c)) {
      const tim = s.who ? `${ten(s, N, "")} đã tìm thấy cả ba và gọi các con về.` : "Các con đã tìm thấy cả ba.";
      return `Ba bản di chúc bạn viết tay trong ba năm nằm cạnh nhau trên bàn, mỗi bản gạch tên một đứa con. ${tim}${thu} Cả nhà đang chờ bạn nói bản nào là bản cuối.`;
    }
    if (vai(s, c, "father") || vai(s, c, "mother")) {
      const ai = ten(s, N, "");
      return `${ai} gọi bạn vào phòng. Trên bàn có ba bản di chúc viết tay, mỗi bản gạch một cái tên; một trong ba cái tên ấy là của bạn.${thu} ${ai} muốn bạn chọn bản nào được giữ lại.`;
    }
    const mo = !s.who ? "Dọn tủ của bố mẹ, bạn tìm thấy ba bản di chúc viết tay"
      : nguoiNha(s, c) ? `${ten(s, N, "")} đặt lên bàn ba bản di chúc viết tay của bố mẹ`
      : `${ten(s, N, "")} mang tới ba bản di chúc viết tay của bố mẹ bạn, nói là được nhờ giữ hộ từ nhiều năm trước`;
    return `${mo}, mỗi bản gạch một cái tên. Không bản nào ghi ngày.${thu} Ai giữ được bản nào là chuyện của cả họ.`;
  },
  doors: [
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Không ai còn giấu được gì, cũng không ai giữ được thể diện",
      label: () => "Đọc to cả ba bản trước mặt cả nhà" },
    { kind: "tra_dua", season: "vu_an_gia_toc", hint: "Đòi đủ phần công bằng, mất luôn phần tình nghĩa",
      label: (s, c) => (diChucRieng(c) ? "Giữ bản gạch tên đứa con đã bỏ bạn mà đi" : "Đòi tính cả công chăm bố mẹ, từng đồng một") },
    { kind: "thoa_hiep", season: "lam_lai", hint: "Giữ được hòa khí, bạn trắng tay làm lại",
      label: (s, c) => (diChucRieng(c) ? "Chia hết cho các con ngay khi còn sống" : "Nhường phần mình để cả nhà khỏi kiện nhau"),
      effects: nho("HELPED_IN_CRISIS", 0.2, "được nhường phần di chúc") },
    { kind: "lat_ban", season: "ngoi_sao", hint: "Cả nước bàn chuyện nhà bạn, và nhớ mặt bạn",
      label: () => "Đưa cả ba bản lên mạng nhờ thiên hạ phân xử" },
    { kind: "buong", season: "xu_nguoi", hint: "Thoát vòng tranh chấp, xa cả những người còn thương mình",
      label: (s, c) => (diChucRieng(c) ? "Để các con tự chia, sang nước khác sống tuổi già" : "Ký giấy từ chối phần, đi làm ở một nước xa"), when: indep },
  ],
};

/* ------------------------------------------------------------------ 6. Một năm còn lại (nâng từ Codex c27) */

const NAM_CUOI: CanonSeed = {
  id: "nam_cuoi", axes: ["than"], ages: [30, 72],
  who: { roles: ["spouse", "childhood_friend", "sibling"], plants: ["person"], required: false },
  what: { plants: ["promise", "place", "skill"], required: false },
  title: (s, c) => (daGap(c, C27) ? "Lần này không ai đính chính" : "Chừng một năm"),
  text: (s, c, N) => {
    const gap = daGap(c, C27), daDi = c.flags.has(`${C27}_route_0`);
    const ve = daDi ? "tấm vé đi lại con đường năm ấy" : "tấm vé cho chuyến đi bạn đã hoãn ba lần";
    const ai = s.who ? `${ten(s, N, "")} đứng chờ ở cửa phòng khám, tay cầm ${ve}.` : `Trong ví bạn vẫn còn ${ve}.`;
    const hen = s.what ? ` Bạn nghĩ ngay tới ${vat(s)}, thứ bạn vẫn hẹn để sau.` : "";
    if (gap) {
      const lan = hoi(c, C27, ["bạn đã đi ngay chuyến đi ấy", "bạn đã vội thu xếp mọi điều còn dang dở", "bạn đã xin kiểm tra lại"], "bạn đã sống như thể chỉ còn một năm");
      return `Lần trước, một tờ kết quả cũng nói “một năm”; ${lan}, rồi người ta đính chính là nhầm. Lần này bác sĩ làm lại xét nghiệm hai lần và không đính chính gì cả. ${ai}${hen}`;
    }
    return `Tờ kết quả gấp làm tư nằm trong túi áo. Bác sĩ nói “chừng một năm”, rồi nói thêm rằng nên làm lại xét nghiệm cho chắc. ${ai}${hen}`;
  },
  doors: [
    { kind: "danh_cuoc", season: "xu_nguoi", hint: "Sống điều mình muốn; nếu kết quả sai, bạn làm lại ở xứ lạ",
      label: (s, c) => (c.flags.has(`${C27}_route_0`) ? "Bán hết, đi lại con đường năm ấy, không hẹn ngày về" : "Bán hết, đi chuyến đi đã hoãn, không hẹn ngày về"), when: indep },
    { kind: "buong", season: "lam_lai", hint: "Một năm sống trọn, sau đó là hai bàn tay trắng",
      label: (s, c) => (c.has_job ? "Nghỉ việc, cho đi hết những gì đang có" : "Cho đi hết những gì đang có, sống trọn từng ngày") },
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Hết giấu giếm, mở ra những chuyện cũ chưa ai dám nói",
      label: () => "Gọi cả nhà về, nói thật và chia lại mọi thứ" },
    { kind: "lat_ban", season: "ngoi_sao", hint: "Người lạ thương bạn, đời riêng thành của chung",
      label: () => "Ghi lại từng ngày còn lại cho mọi người cùng xem" },
    { kind: "bo_chay", season: "tron_chay", hint: "Không ai phải khóc trước mặt bạn, kể cả người cần được nói",
      label: (s) => vua(`Lặng lẽ rời ${noi(s)}, không nói với ai`, "Lặng lẽ rời đi, không nói với ai"), when: indep },
    { kind: "nhan_toi", season: "vu_an_gia_toc", hint: "Nhẹ lòng, nhưng có người sẽ không tha thứ",
      label: (s, c, N) => (s.who ? vua(`Thú nhận với ${ten(s, N, "")} điều bạn giấu bao năm`, "Thú nhận điều bạn đã giấu cả nhà bao năm")
        : "Thú nhận điều bạn đã giấu cả nhà bao năm") },
  ],
};

/* ------------------------------------------------------------------ 7. Vé đi xa (nâng từ Codex c14) */

const VE_XA: CanonSeed = {
  id: "ve_xa", axes: ["dat", "tien"], ages: [18, 45],
  who: { roles: ["childhood_friend", "sibling", "neighbor", "first_boss", "partner"], plants: ["person"], required: false },
  what: { plants: ["debt", "promise", "place"], required: false },
  title: (s, c, N) => (daGap(c, C14) ? "Tờ hợp đồng thứ hai" : s.who ? vua(`Tấm vé ${ten(s, N, "")} mang tới`, "Vé đi xa") : "Vé đi xa"),
  text: (s, c, N) => {
    const mo = s.who ? `${ten(s, N, "")} đặt lên bàn` : "Một người quen của người quen đặt lên bàn";
    const w = s.what;
    const ly = !w ? "" : w.kind === "place" ? ` Bạn nhìn quanh ${w.label} và tự hỏi còn gì giữ mình ở lại.`
      : ` ${cap(w.label)} là lý do bạn chưa xé tờ giấy ấy.`;
    if (daGap(c, C14)) {
      const lan = hoi(c, C14, ["xác minh từng chữ rồi mới chuẩn bị đi", "ở lại học tay nghề", "rủ cả nhóm đòi viết lại"], "gấp nó lại");
      return `Lần trước, khi tờ hợp đồng đầu tiên có một dòng bị gạch, bạn đã ${lan}. Giờ ${s.who ? ten(s, N, "") : "một người quen của người quen"} đặt lên bàn tờ thứ hai: lương gấp sáu lần ở ${noi(s)}, và dòng về nơi giữ hộ chiếu lại bị gạch, đúng chỗ cũ. Máy bay cất cánh sáng thứ Hai.${ly}`;
    }
    return `${mo} một hợp đồng làm việc ở nước ngoài, lương gấp sáu lần ở ${noi(s)}. Dòng chữ về nơi giữ hộ chiếu bị gạch bằng bút bi xanh. Máy bay cất cánh sáng thứ Hai.${ly}`;
  },
  doors: [
    { kind: "danh_cuoc", season: "xu_nguoi", hint: "Thu nhập gấp sáu, giấy tờ của bạn nằm trong tay người khác",
      label: () => "Ký luôn, sáng thứ Hai ra sân bay", when: indep },
    { kind: "thoa_hiep", season: "xu_nguoi", hint: "Đi muộn một mùa, mất lòng người giới thiệu",
      label: () => "Đi, nhưng đòi viết lại dòng bị gạch", when: indep,
      effects: nho("WIN_WIN_DEAL", 0.1, "hợp đồng đi xa được viết lại") },
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Biết rõ sự thật, nhưng chuyện vỡ ra trước mặt mọi người",
      label: (s, c, N) => (s.who && nguoiNha(s, c) ? vua(`Hỏi thẳng ${ten(s, N, "")} trước mặt cả nhà`, "Hỏi thẳng người giới thiệu trước mặt cả nhà")
        : s.who ? vua(`Hỏi thẳng ${ten(s, N, "")} trước mặt mọi người`, "Hỏi thẳng người giới thiệu trước mặt mọi người")
        : "Hỏi thẳng người giới thiệu trước mặt mọi người") },
    { kind: "lat_ban", season: "ngoi_sao", hint: "Cứu được người khác, thành cái gai trong mắt kẻ đứng sau",
      label: () => "Chụp tờ hợp đồng, đăng lên cảnh báo mọi người",
      effects: nho("HUMILIATED_ME", -0.3, "bị bêu tên vì tờ hợp đồng") },
    { kind: "buong", season: "lam_lai", hint: "Ít tiền ngay, có nền riêng sau vài năm",
      label: () => "Xé hợp đồng, ở lại học nghề từ đầu" },
    { kind: "bo_chay", season: "tron_chay", hint: "Thoát cả hai cái bẫy, từ nay phải sống như người đi trốn",
      label: (s) => vua(`Bỏ cả hợp đồng lẫn ${noi(s)}, đi trong đêm`, "Bỏ cả hợp đồng lẫn chốn cũ, đi trong đêm"), when: indep },
  ],
};

/* ------------------------------------------------------------------ 8. Đêm nước lên (nâng từ Codex c05) */

const NUOC_LEN: CanonSeed = {
  // Task 20: mở cho mọi tuổi (trước là 8–16): biến cố trước 17 tuổi gần như không bao giờ nổ, nên mầm này chưa từng xuất hiện.
  // Chữ và cửa rẽ theo tuổi: còn nhỏ (nhoTuoi) là đứa trẻ giữa đêm lũ, lớn rồi là người lớn trong nhà.
  id: "nuoc_len", axes: ["dat", "than"], ages: [8, 72],
  who: { roles: ["neighbor", "official"], plants: ["person"], required: false },
  what: { plants: ["animal", "object"], required: false },
  title: () => "Nước tới bậc thềm thứ hai",
  text: (s, c, N) => {
    /* c05 là thẻ người lớn (18–65); nếu đã gặp thì gọi lại lần nước lên trước. */
    const lan = daGap(c, C05) ? ` Lần nước lên trước, ${hoi(c, C05, ["cả nhà đã theo xe lên thành phố", "bạn đã ở lại giữ đồ chung", "bạn đã rủ mọi người chở từng lượt"], "bạn đã kịp thoát")}; lần này nước lên nhanh hơn.` : "";
    const xe = s.who ? `${ten(s, N, "")} đứng trên thùng chiếc xe tải duy nhất còn nổ máy, gọi cả nhà bạn trèo lên. Thùng xe đã chật kín họ hàng nhà ${ten(s, N, "")}.`
      : "Đầu ngõ, chiếc xe tải duy nhất còn nổ máy đang bóp còi gọi người; thùng xe đã chật kín họ hàng nhà tài xế.";
    const con = s.what ? `${cap(vat(s))} vẫn còn ở trong nhà.` : nhoTuoi(c) ? "Chiếc cặp sách của bạn vẫn nằm trên bàn học." : "Mấy cuốn album ảnh cũ vẫn nằm trong tủ.";
    return `Nửa đêm, nước ở ${noi(s)} đã lên tới bậc thềm thứ hai.${lan} ${xe} ${con} Trên xe chỉ còn chỗ cho vài người nữa.`;
  },
  doors: [
    { kind: "thoa_hiep", season: "lam_lai", hint: "Cả nhà an toàn, mọi thứ còn lại phải làm lại từ đầu",
      label: () => "Theo cả nhà lên xe, về chỗ tạm cư" },
    { kind: "buong", season: "lam_lai", hint: "Đi nhẹ, mang theo một nỗi tiếc rất lâu",
      label: (s, c) => (s.what ? vua(`Bỏ ${vat(s)} lại, trèo lên xe không ngoái nhìn`, "Bỏ hết lại, trèo lên xe không ngoái nhìn")
        : nhoTuoi(c) ? "Bỏ cặp sách lại, trèo lên xe không ngoái nhìn" : "Bỏ hết lại, trèo lên xe không ngoái nhìn") },
    { kind: "danh_cuoc", season: "ngoi_sao", hint: "Cả xóm nhớ ơn, cả tỉnh biết mặt bạn",
      label: (s, c) => (nhoTuoi(c) ? "Rủ người lớn chở thêm từng lượt cho cả xóm" : "Mượn thêm thuyền, chở từng lượt cho cả xóm"),
      effects: (c, s) => nho("HELPED_IN_CRISIS", 0.3, nhoTuoi(c) ? "đêm nước lên, đứa trẻ rủ chở cả xóm" : "đêm nước lên, bạn chở cả xóm từng lượt")(c, s) },
    { kind: "lat_ban", season: "vu_an_gia_toc", hint: "Nói ra điều ai cũng nghĩ mà không dám, gây thù với cả một họ",
      label: (s, c, N) => (s.who ? vua(`Hỏi to vì sao ${ten(s, N, "")} chỉ chở người nhà`, "Hỏi to vì sao xe chỉ chở người nhà")
        : "Hỏi to vì sao xe chỉ chở người nhà tài xế"),
      effects: (c, s) => nho("HUMILIATED_ME", -0.3, nhoTuoi(c) ? "bị một đứa trẻ hỏi giữa đêm lũ" : "bị hỏi thẳng giữa đêm lũ")(c, s) },
    { kind: "doi_dau", season: "vu_an_gia_toc", hint: "Giữ được nhà, rồi cả họ tranh nhau sửa nhà ai trước",
      label: (s, c) => (nhoTuoi(c) ? "Ở lại trên gác cùng người lớn, giữ nhà" : "Ở lại trên gác, giữ nhà") },
  ],
};

/** 8 mầm đợt A. Trục `ky` không có mầm (biến cố Kỳ đi qua nhánh kỳ dị). */
export const CANON_SEEDS: CanonSeed[] = [NO_CU, TROI_CHO, PHAN_BOI, NOI_TIENG, DI_CHUC, NAM_CUOI, VE_XA, NUOC_LEN];
