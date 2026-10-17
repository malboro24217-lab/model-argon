/**
 * Gói "Phận đi xa" (B): NGƯỜI LẤY CHỒNG/VỢ NƯỚC NGOÀI · DU HỌC SINH · NGƯỜI VỀ NƯỚC LẬP NGHIỆP · GIÚP VIỆC Ở NƯỚC NGOÀI.
 * Đọc kèm docs/content-guide.md và gói mẫu singer.ts.
 * Không nêu tên nước đến ("xứ người", "bên ấy") để không gán chuyện cho một dân tộc nào.
 * Chi tiết riêng Việt Nam chỉ nằm sau điều kiện c.country === "VN".
 */
import type { Storylet, FactContext, Effect } from "../types.ts";
import { C, T, f, role, vary, talentFlag, become, step, talent, door, beat, daily, cross, life } from "./kit.ts";

/* ================================ helper dùng chung ================================ */
type Namer = (id: string) => string;
const vn = (c: FactContext): boolean => c.country === "VN";
const n = (c: FactContext, k: string): number => c.counters[k] ?? 0;
const adult = (c: FactContext): boolean => c.age >= 18;
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const parentOf = (c: FactContext): string | undefined => role(c, "mother") ?? role(c, "father");
/** Niềm tin với người bạn đời, nếu có trong dàn nhân vật. */
const sT = (c: FactContext, d: number): Effect => { const s = role(c, "spouse"); return s ? { trust: { npc: s, delta: d } } : {}; };
/** Niềm tin với bố hoặc mẹ, nếu còn. */
const pT = (c: FactContext, d: number): Effect => { const p = parentOf(c); return p ? { trust: { npc: p, delta: d } } : {}; };
/** Rời con đường và trở về nước. */
const goHome = (p: string): Effect => ({ unflags: [life(p)], custom: "job_lose|return_home" });
/** Rời con đường này, bước thẳng sang một con đường khác (có thể kèm việc về nước). */
const switchTo = (from: string, to: string, home = false): Effect => ({ unflags: [life(from)], custom: `${home ? "return_home|" : ""}become:${to}` });

/* =====================================================================================
 * 1. NGƯỜI LẤY CHỒNG/VỢ NƯỚC NGOÀI (marriage_migrant) — tiền tố mrm_
 *    Bộ đếm: mrm_lang (tiếng nơi ở mới), mrm_ties (mạng lưới đồng hương).
 *    Cờ chính: mrm_broker / mrm_love (cách bước vào), mrm_own_income, mrm_teacher, mrm_rights,
 *    mrm_own_permit, mrm_endured — nhịp b3, b4 đọc lại để rẽ thành đỉnh hoặc vực.
 * =================================================================================== */
const MM = "marriage_migrant";
const sp = (c: FactContext): string => (c.sex === "F" ? "chồng" : "vợ");
const inlaw = (c: FactContext): string => (c.sex === "F" ? "nhà chồng" : "nhà vợ");
const mil = (c: FactContext): string => (c.sex === "F" ? "mẹ chồng" : "mẹ vợ");
const fil = (c: FactContext): string => (c.sex === "F" ? "bố chồng" : "bố vợ");
const dauRe = (c: FactContext): string => (c.sex === "F" ? "dâu" : "rể");
const spN = (c: FactContext, N: Namer): string => { const s = role(c, "spouse"); return s ? N(s) : `${sp(c)} bạn`; };

const MRM: Storylet[] = [
  /* ---------- cơ hội bước vào (không có năng khiếu: 3 cửa) ---------- */
  door(MM, "mrm_d_broker", [18, 30], (c) => !c.married && (c.poor_country || c.family_wealth < 0.35 || f(c, "origin_poor_rural")), (c) => T("Năm phút qua phiên dịch",
    `${vn(c) ? "Bà mối trong xã" : "Một người môi giới hôn nhân"} đến nhà, nói có một gia đình ở nước ngoài đang tìm ${dauRe(c)}. Buổi gặp ở một khách sạn ${vn(c) ? "trên huyện" : "trong thị trấn"}: mười hai người ngồi chờ, mỗi người được năm phút nói chuyện qua phiên dịch. Bên kia lo hết chi phí và gửi nhà bạn một khoản lễ bằng hai năm làm lụng.`, [
    C(c.sex === "F" ? "Gật đầu, đi lấy chồng xa" : "Gật đầu, đi làm rể xứ người", { ...become(MM), counters: { doors_seen: 1 }, flags: ["mrm_broker"], money: 0.3, rel: -3 }, "Nhà đỡ túng, bạn đi vào chỗ chưa biết"),
    C("Đòi gặp riêng ba lần, không qua môi giới", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.45,
      win: { ...become(MM), flags: ["mrm_met_first"], log: "Người ấy đồng ý. Lần gặp thứ ba, hai người nói chuyện qua ứng dụng dịch suốt bốn tiếng." },
      lose: { happy: -2, log: "Người môi giới nói bạn khó tính. Họ chọn người khác ngay chiều hôm đó." } } }, "Biết mình lấy ai, có thể mất dịp", { tier: "sovereign" }),
    C("Từ chối, ở lại quê", { counters: { doors_seen: 1 }, money: -0.02 })], 2)),

  door(MM, "mrm_d_online", [20, 35], (c) => !c.married, () => T("Sáu múi giờ",
    "Ba năm nhắn tin với một người ở nước khác, quen nhau trong một nhóm học ngoại ngữ. Lệch sáu múi giờ, người này thức khuya thì người kia dậy sớm. Người ấy hỏi cưới, nhưng công việc của người ấy không mang theo được: người phải chuyển đi là bạn.", [
    C("Cưới, bỏ việc để chuyển sang bên ấy", { ...become(MM), counters: { doors_seen: 1 }, flags: ["mrm_love"], money: -0.15, rel: -4, happy: 4 }, "Có người thương, bỏ lại cả nghề lẫn bạn bè"),
    C("Đề nghị người ấy sang đây sống thử một năm", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.35,
      win: { happy: 6, flags: ["foreign_partner_here"], log: "Người ấy sang. Một năm thành ba năm, rồi thành nhà." },
      lose: { happy: -5, log: "Người ấy không bỏ được việc. Tin nhắn thưa dần rồi tắt." } } }, "Bạn không phải đi, nhưng có thể mất nhau", { tier: "sovereign" }),
    C("Chưa trả lời, cứ nhắn tin như cũ", { counters: { doors_seen: 1 }, happy: -1 })], 2)),

  door(MM, "mrm_d_abroad", [20, 35], (c) => !c.married && (c.migrated || f(c, "path_migrant") || f(c, "left_home")), () => T("Lời cầu hôn ở xứ người",
    "Đang làm việc xa nhà, bạn thương một người ở nơi này, và người ấy hỏi cưới. Cưới thì được ở lại lâu dài, có nhà, có họ hàng mới. Nhưng ở quê đã có người nói bạn cưới \"vì giấy tờ\", và mấy năm đầu thẻ cư trú của bạn sẽ phụ thuộc vào chính cuộc hôn nhân ấy.", [
    C("Cưới, ở lại lập gia đình", { ...become(MM), counters: { doors_seen: 1 }, flags: ["mrm_love"], happy: 5, rel: -2 }, "Có nhà mới, giấy tờ dựa vào người khác"),
    C("Cưới, nhưng học kỹ luật cư trú trước", { ...become(MM), counters: { doors_seen: 1 }, flags: ["mrm_love", "mrm_rights"], know: 3, bw: -4 }, "Chậm, mệt, sau này tự đứng được", { tier: "awakened" }),
    C("Chưa cưới, chờ tự có giấy tờ", { counters: { doors_seen: 1 }, happy: -3 })], 2)),

  /* ---------- mạch truyện ---------- */
  beat(MM, 1, 1, (c) => T(`Bữa cơm đầu tiên ở ${inlaw(c)}`,
    `Tám người ngồi quanh mâm, nói một thứ tiếng bạn mới hiểu được chữ "ăn đi". ${cap(mil(c))} gắp cho bạn một món lạ, rồi cả nhà nhìn xem bạn có ăn không.${f(c, "mrm_broker") ? " Người phiên dịch đã về từ hôm qua." : " Người bạn thương ngồi cạnh, dịch được một nửa."} Cả buổi bạn chỉ biết cười.`, [
    C("Ăn hết, đêm về chép từng chữ vào sổ", { counters: step(c, MM, { mrm_lang: 1 }), know: 2, happy: -2 }, "Học nhanh, nuốt nhiều"),
    C("Xin được nấu một món quê mình tuần sau", { counters: step(c, MM), gamble: { p: 0.55,
      win: { happy: 5, flags: ["mrm_own_dish"], log: `Cả nhà ăn hết đĩa. Chỉ ${fil(c)} chê mặn, rồi xin thêm bát nữa.` },
      lose: { happy: -3, log: "Món ăn nằm nguyên trên bàn. Từ đó bạn nấu theo khẩu vị nhà này." } } }, "Giữ một phần mình, có thể bị chối"),
    C("Tìm nhóm đồng hương ngay tuần đầu", { counters: step(c, MM, { mrm_ties: 1 }), rel: 3 }, "Có chỗ dựa, chậm hòa nhập")], 0)),

  beat(MM, 2, 3, (c) => T("Đồng lương đầu tiên mang tên mình",
    `${n(c, "mrm_lang") >= 1 ? "Tiếng của bạn giờ đủ để mặc cả ngoài chợ và nghe ra khi người ta nói về mình." : "Bạn vẫn nói tiếng nơi này bằng tay nhiều hơn bằng lời."} Một xưởng đóng gói gần nhà cần người làm ca sáng. ${cap(mil(c))} muốn bạn ở nhà lo cơm nước, chăm ông cụ đang yếu, và nói "nhà này không thiếu tiền".`, [
    C("Đi làm, có đồng lương của riêng mình", { counters: step(c, MM), flags: ["mrm_own_income"], income_mult: 1.4, rel: -3, ...sT(c, -0.1) }, "Có tiền riêng, nhà bên ấy không vui"),
    C("Ở nhà lo cho gia đình", { counters: step(c, MM), flags: ["mrm_home"], rel: 4, happy: -3, ...sT(c, 0.1) }, "Êm nhà, mọi khoản đều phải xin"),
    C("Mở lớp tiếng mẹ đẻ cuối tuần cho con đồng hương", { counters: step(c, MM, { mrm_ties: 2 }), flags: ["mrm_teacher"], money: 0.04, agency: 0.02, bw: -3 }, "Ít tiền, thành người nối hai bờ", { tier: "sovereign" })], 1)),

  beat(MM, 3, 4, (c, N) => {
    const held = f(c, "mrm_broker") && !f(c, "mrm_own_income");
    const text = held
      ? `${cap(spN(c, N))} giữ hộ chiếu và thẻ ngân hàng của bạn "cho an toàn". Mỗi tuần bạn được đưa một khoản vừa đủ đi chợ. Lần bạn hỏi lại giấy tờ, người ấy nói: không có tôi thì ở đây bạn chẳng là ai. Thẻ cư trú của bạn do chính người ấy bảo lãnh.`
      : `Sau một trận cãi nhau lớn, ${spN(c, N)} dọn ra ngoài và nói muốn ly hôn. Thẻ cư trú của bạn còn tám tháng, do người ấy bảo lãnh.${c.kids_alive > 0 ? " Con thì đã quen trường ở đây." : " Căn hộ cũng đứng tên người ấy."}`;
    return T("Giấy tờ đứng tên người khác", text, [
      C("Nhẫn nhịn, giữ mái nhà", { counters: step(c, MM), flags: ["mrm_endured"], happy: -6, health: -2 }, "Giữ được nhà, mất dần mình"),
      C("Tìm đến trung tâm hỗ trợ người nhập cư", { counters: step(c, MM), bw: -4, gamble: { p: f(c, "mrm_rights") || n(c, "mrm_lang") >= 1 ? 0.7 : 0.5,
        win: { flags: ["mrm_rights", "mrm_own_permit"], agency: 0.03, know: 3, log: "Một luật sư thiện nguyện giúp bạn xin được thẻ cư trú không phụ thuộc vào ai." },
        lose: { happy: -3, counters: { mrm_ties: 1 }, log: "Hồ sơ bị trả về vì thiếu giấy tờ. Bạn có thêm số điện thoại của một người sẽ nghe máy." } } }, "Lâu, mệt, có thể tự đứng được", { tier: "awakened" }),
      C(c.kids_alive > 0 ? "Về nước, xin quyền thăm con" : "Về nước, làm lại từ đầu", { counters: step(c, MM), ...goHome(MM), flags: ["mrm_went_home"], happy: c.kids_alive > 0 ? -6 : 2, rel: 4 }, c.kids_alive > 0 ? "Thoát ra, xa con" : "Thoát ra, tay trắng")], 0);
  }),

  beat(MM, 4, 5, (c, N) => {
    const up = f(c, "mrm_own_permit") || f(c, "mrm_own_income") || f(c, "mrm_teacher") || n(c, "mrm_lang") >= 2;
    if (up) return T("Người phiên dịch của bệnh viện quận",
      `Mười năm. Bạn nói tiếng nơi này đủ để cãi lý ở văn phòng hành chính${n(c, "mrm_ties") >= 2 ? ", và cả trăm người đồng hương lưu số điện thoại của bạn" : ""}. Bệnh viện quận mời bạn làm phiên dịch cho những người mới đến, như bạn ngày trước. Cùng tuần ấy, hội người nhập cư muốn bạn đứng ra làm trưởng hội, không lương.`, [
      C("Nhận làm phiên dịch ở bệnh viện", { counters: step(c, MM), income_mult: 1.5, flags: ["mrm_interpreter"] }, "Lương ổn, ít thời gian cho hội"),
      C("Đứng ra lập hội, công khai mọi khoản thu chi", { counters: step(c, MM, { mrm_ties: 2 }), flags: ["mrm_leader", "leader"], agency: 0.03, money: -0.05, rel: 5 }, "Không lương, thành chỗ dựa của nhiều người", { tier: "sovereign" }),
      C("Mở quán ăn quê nhà", { counters: step(c, MM), money: -0.4, gamble: { p: 0.55,
        win: { income_mult: 1.6, flags: ["mrm_shop"], log: "Quán mười hai bàn. Cuối tuần, người đồng hương xếp hàng ra tận cửa." },
        lose: { money: -0.2, log: "Sau một năm, quán đóng cửa. Bạn giữ lại cái nồi lớn nhất." } } }, "Vốn lớn, có thể thành một cái tên")], 0);
    return T("Căn nhà không có tên bạn",
      `${cap(mil(c))} lập di chúc để lại căn nhà cho các con ruột. ${cap(spN(c, N))} im lặng. Mười năm bạn nấu cơm, chăm ${fil(c)} đến ngày ông mất, nhưng trên giấy tờ bạn không có gì${f(c, "mrm_endured") ? ", kể cả cuốn hộ chiếu vẫn nằm trong ngăn kéo của người khác" : ""}.`, [
      C("Thuê luật sư đòi phần công sức", { counters: step(c, MM), money: -0.2, ...sT(c, -0.3), gamble: { p: 0.45,
        win: { money: 0.8, log: "Tòa công nhận mười năm chăm sóc của bạn là đóng góp vào tài sản chung." },
        lose: { happy: -4, log: "Không có giấy tờ nào chứng minh. Tòa bác đơn." } } }, "Tốn tiền, sứt mẻ, có thể đòi lại phần mình"),
      C("Im lặng, sống tiếp vì gia đình", { counters: step(c, MM), happy: -6, ...sT(c, 0.1) }, "Êm nhà, trắng tay"),
      C("Dọn ra thuê nhà, tự đứng tên mọi thứ", { counters: step(c, MM), flags: ["mrm_own_home"], money: -0.3, agency: 0.03, happy: 3 }, "Tốn kém, lần đầu có thứ của mình", { tier: "sovereign" })], 1);
  }, adult),

  beat(MM, 5, 6, (c) => T("Người mới đến nhà bên",
    `Nhà bên cạnh vừa đón một người cùng nước với bạn về làm ${dauRe(c)}, mười chín tuổi, chưa nói được câu nào. Chiều nào bạn cũng thấy người ấy đứng ngoài hiên, cầm điện thoại mà không gọi cho ai.${f(c, "mrm_leader") ? " Số điện thoại của hội bạn lập được in trên tờ rơi ở văn phòng hành chính." : ""}`, [
    C("Sang làm quen, nói bằng tiếng quê mình", { counters: step(c, MM, { mrm_ties: 1 }), flags: ["mrm_passed_on"], rel: 4, happy: 3 }, "Mất chút thời gian, có người không phải một mình"),
    C("Viết một cuốn sổ tay cho người mới đến", { counters: step(c, MM), flags: ["mrm_handbook"], know: 2, bw: -3, agency: 0.02 }, "Tốn sức, giúp cả những người bạn không gặp", { tier: "sovereign" }),
    C("Không xen vào chuyện nhà người ta", { counters: step(c, MM), happy: -2 }, "Yên thân, nhớ lại chính mình ngày trước")], 0), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(MM, "mrm_market", [18, 60], 8, (c) => T("Đi chợ một mình", vary("mrmm", c.age, [
    "Lần đầu bạn đi chợ một mình. Trên các gói hàng toàn chữ bạn không đọc được; bạn cầm nhầm hộp muối thay cho đường.",
    "Người bán hàng quen hỏi bạn một câu dài. Bạn gật đầu, về nhà mới biết mình vừa đặt mua cả một thùng rau."]), [
    C("Chụp ảnh nhãn hàng, tối về tra từng chữ", { counters: { mrm_lang: 1 }, bw: -2, know: 2 }, "Mệt, tiếng lên dần"),
    C("Chỉ mua những thứ đã nhận ra", { happy: -1, money: -0.01 }, "Đỡ ngượng, bữa cơm nghèo đi"),
    C("Nhờ bà bán rau dạy mỗi ngày một chữ", { counters: { mrm_lang: 1, mrm_ties: 1 }, rel: 2 }, "Phải mở lời trước, có thêm một người quen")], 0)),

  daily(MM, "mrm_remit", [20, 65], 7, (c, N) => { const p = parentOf(c);
    return T("Tiền gửi về quê nhà", `${p ? N(p) : "Nhà"} gọi sang: ${vary("mrmr", c.age, ["em trai cần tiền mua xe để đi làm", "mái nhà dột, phải lợp lại trước mùa mưa"])}. Ở quê ai cũng nghĩ bạn lấy được người giàu. ${cap(spN(c, N))} thì nói tiền nhà này là tiền chung.`, [
      C("Gửi lén từ tiền chợ", { money: -0.06, flags: ["mrm_secret_remit"], ...pT(c, 0.15) }, "Nhà đỡ, bạn giữ một chuyện giấu"),
      C(`Bàn thẳng với ${sp(c)}, gửi một phần`, { money: -0.03, counters: { honest: 1 }, ...sT(c, 0.1) }, "Ít hơn quê cần, không phải giấu"),
      C("Nói thật là bạn không có tiền riêng", { happy: -3, ...pT(c, -0.1), flags: ["mrm_no_money"] }, "Giữ hòa khí bên này, quê buồn")], 1, p ? { npc: p } : {}); }),

  daily(MM, "mrm_gossip", [22, 60], 8, (c) => T("Lời xì xào ở cổng trường",
    `Mấy phụ huynh đứng chờ đón con nói với nhau, không biết bạn đã hiểu: người nước ngoài lấy ${sp(c)} ở đây là vì tiền. Con bạn đứng ngay bên cạnh.`, [
    C("Quay lại, nói bằng chính tiếng của họ", { counters: { mrm_lang: 1 }, gamble: { p: 0.6,
      win: { rel: 3, log: "Họ đỏ mặt. Tuần sau một người mời bạn vào nhóm phụ huynh." },
      lose: { rel: -2, log: "Họ quay đi. Từ đó bạn đứng chờ con ở góc khác." } } }, "Đòi lại thể diện, có thể mất lòng"),
    C("Giả như không hiểu", { happy: -3 }),
    C("Ứng cử vào ban phụ huynh của lớp", { flags: ["mrm_pta"], agency: 0.02, bw: -3, rel: 2 }, "Tốn thời gian, đổi cách người ta nhìn", { tier: "sovereign" })], 1), (c) => c.kids_alive > 0),

  daily(MM, "mrm_naming", [22, 55], 99, (c, N) => T("Cái tên trên giấy nhập học",
    `Giấy nhập học của con cần một cái tên chính thức. Từ ngày con ra đời, ${inlaw(c)} gọi con bằng cái tên theo lệ của họ; còn bạn vẫn gọi con bằng một cái tên trong tiếng của mình, khi chỉ có hai người. ${vn(c) ? "Ông bà ngoại" : "Ông bà bên bạn"} ở quê chỉ biết cái tên ấy.`, [
    C("Ghi đúng tên nhà bên ấy chọn", { rel: 2, happy: -3, counters: { mrm_yield: 1 }, ...sT(c, 0.05) }, "Êm nhà, con xa tiếng mẹ đẻ của bạn"),
    C("Đòi ghi thêm tên đệm bằng tiếng của mình", { ...sT(c, -0.05), gamble: { p: 0.5,
      win: { happy: 4, flags: ["mrm_kid_two_names"], log: `${cap(spN(c, N))} gật đầu. Tờ giấy nhập học có cả hai cái tên.` },
      lose: { happy: -2, log: "Cả nhà bên ấy phản đối. Cái tên của bạn chỉ còn dùng khi hai người ở riêng." } } }, "Giữ một phần gốc, có thể căng thẳng"),
    C("Ghép một cái tên đẹp nghĩa trong cả hai thứ tiếng", { flags: ["mrm_kid_two_names"], happy: 3, bw: -2, agency: 0.01 }, "Tốn công tìm, không ai phải nhường", { tier: "sovereign" })], 0), (c) => c.kids_alive > 0),

  daily(MM, "mrm_clinic", [20, 70], 8, (c, N) => T("Phòng khám không có phiên dịch",
    `Bạn đau bụng đã ba ngày. Bác sĩ hỏi nhanh, bạn chỉ biết chỉ tay vào chỗ đau. ${cap(spN(c, N))} bận, không đi cùng được.`, [
    C("Hẹn hôm khác có người đi cùng", { health: -4, happy: -1 }),
    C("Dùng ứng dụng dịch trên điện thoại", { gamble: { p: 0.6,
      win: { health: 2, counters: { mrm_lang: 1 }, log: "Bác sĩ đọc màn hình rồi gật đầu. Bạn học được chữ \"ruột thừa\"." },
      lose: { health: -3, money: -0.03, log: "Ứng dụng dịch sai một chữ. Bạn uống nhầm thuốc hai ngày." } } }, "Nhanh, có thể sai"),
    C("Gọi đường dây phiên dịch y tế miễn phí", { health: 3, know: 2, flags: ["mrm_knows_services"], bw: -2 }, "Phải tự tìm hiểu, lần sau không còn sợ", { tier: "awakened" })], 0)),

  daily(MM, "mrm_exam", [22, 55], 9, () => T("Kỳ thi tiếng để gia hạn cư trú",
    "Muốn có thẻ cư trú dài hạn, bạn phải qua một kỳ thi tiếng và hiểu biết xã hội. Một trung tâm của người đồng hương quảng cáo \"đậu chắc chắn\", giá bằng hai tháng tiền chợ.", [
    C("Học mỗi tối sau khi cả nhà ngủ", { counters: { mrm_lang: 1 }, bw: -5, know: 4 }, "Mệt nhiều tháng, điểm là của mình"),
    C("Trả tiền cho trung tâm \"đậu chắc\"", { money: -0.08, secret: { tag: "FORGED_PAPERS", severity: 0.4, fuse_years: [2, 8], note: "chứng chỉ tiếng mua ở trung tâm" } }, "Nhanh, mang theo một bí mật"),
    C("Hoãn thi thêm một năm", { happy: -2, bw: 2 })], 0)),

  daily(MM, "mrm_recruit", [22, 55], 9, (c) => T("Lời nhờ giới thiệu người quen",
    `${f(c, "mrm_broker") ? "Người môi giới năm xưa" : "Một người môi giới hôn nhân"} gọi điện: bên này còn nhiều nhà muốn tìm ${dauRe(c)}, nhờ bạn giới thiệu người quen ở quê, thành đôi thì trả bạn một khoản. Trong nhóm đồng hương của bạn, tuần trước có người phải bỏ nhà đi vì bị đối xử tệ.`, [
    C("Giới thiệu một đứa em họ", { money: 0.1, flags: ["mrm_recruited"], counters: { honest: -1 } }, "Có tiền, gánh một phần đời người khác"),
    C("Từ chối", { counters: { honest: 1 } }),
    C("Viết bài cảnh báo cho người ở quê đọc trước khi đi", { agency: 0.02, flags: ["mrm_warned"], gamble: { p: 0.7,
      win: { rel: 3, log: "Bài viết được chia sẻ khắp quê. Ba gia đình gọi hỏi bạn trước khi gật đầu." },
      lose: { bw: -4, log: "Người môi giới dọa kiện bạn tội bôi nhọ." } } }, "Giúp người sau, gây thù với môi giới", { tier: "sovereign" })], 1)),

  daily(MM, "mrm_account", [20, 60], 9, (c, N) => T("Tài khoản đứng tên mình",
    `Ngân hàng gần nhà có quầy mở tài khoản cho người mới định cư. ${cap(spN(c, N))} nói không cần, tiền để chung một chỗ cho dễ quản. Mọi khoản bạn tiêu đều phải hỏi.`, [
    C("Mở tài khoản riêng, nói thẳng lý do", { flags: ["mrm_own_account"], agency: 0.01, ...sT(c, -0.05) }, "Có chỗ đứng, thêm một lần căng thẳng"),
    C("Để chung như cũ", { happy: -2, ...sT(c, 0.05) }),
    C("Đề nghị hai người cùng xem sổ chi tiêu mỗi tháng", { gamble: { p: 0.5,
      win: { flags: ["mrm_shared_books"], ...sT(c, 0.15), log: "Lần đầu tiên hai người ngồi cùng nhau tính chuyện tiền." },
      lose: { ...sT(c, -0.1), happy: -2, log: "Người ấy thấy bị nghi ngờ. Bữa cơm hôm đó không ai nói gì." } } }, "Có thể gần nhau hơn, có thể thành nghi kỵ", { tier: "awakened" })], 1)),

  daily(MM, "mrm_group", [20, 65], 7, (c, N) => T("Tin nhắn lúc nửa đêm", vary("mrmg", c.age, [
    "Nửa đêm, trong nhóm trò chuyện của những người cùng cảnh, một người nhắn: \"Ai cho em ở nhờ vài hôm được không?\" Không ai trả lời.",
    "Nửa đêm, một người mới vào nhóm đồng hương đăng ảnh chiếc va li đặt ở ga tàu, hỏi có ai ở gần đây không."]), [
    C("Nhắn riêng, cho ở nhờ hai đêm", { rel: 3, counters: { mrm_ties: 1, kind: 1 }, ...sT(c, -0.1) }, `Giúp người, ${spN(c, N)} không vui`),
    C("Gửi số đường dây hỗ trợ", { counters: { mrm_ties: 1 } }, "Giúp được một phần, không dính líu"),
    C("Rời nhóm cho đỡ nặng lòng", { happy: 1, bw: 2 })], 1)),

  daily(MM, "mrm_visit", [24, 70], 8, (c) => T("Chuyến về thăm quê", vary("mrmv", c.age, [
    "Năm năm mới có dịp về thăm nhà. Cả xóm sang chơi, ai cũng nhìn xem bạn mang gì về. Tiếng mẹ đẻ của bạn đã có chỗ vấp.",
    "Về quê lần này, lũ trẻ trong họ đã lớn, chẳng đứa nào nhớ mặt bạn. Ai cũng hỏi bên ấy có dễ kiếm tiền không."]), [
    C("Mang quà cho cả xóm", { money: -0.15, rel: 5, counters: { mrm_ties: 1 } }, "Đẹp mặt, hết tiền dành dụm"),
    C("Mang ít quà, kể thật về cuộc sống bên ấy", { rel: -1, happy: 2, flags: ["mrm_told_truth"] }, "Mất chút thể diện, bớt người nhìn nhầm"),
    C("Để dành tiền, năm sau mới về", { money: 0.03, happy: -3 })], 0)),

  /* ---------- gia đình ---------- */
  cross(MM, "mrm_family", [25, 70], (c) => (c.kids_alive > 0 && !!role(c, "child") && c.age >= 30) || !!parentOf(c), (c, N) => {
    const p = parentOf(c);
    const k = (c.kids_alive > 0 && c.age >= 30) || !p ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} không nói tiếng của bạn`,
      `${N(k)} hiểu tiếng quê bạn nhưng chỉ trả lời bằng tiếng nơi này${f(c, "mrm_kid_two_names") ? ", và không bao giờ dùng cái tên bạn đặt" : ""}. Ở trường có đứa trêu ${N(k)} có ${c.sex === "F" ? "mẹ" : "bố"} là người nước ngoài. Tối qua ${N(k)} xin bạn đừng đến đón ở cổng trường nữa.`, [
      C("Tôn trọng, đứng đón con ở góc phố", { trust: { npc: k, delta: 0.1 }, happy: -5 }, "Con dễ chịu, bạn nuốt nỗi buồn"),
      C("Đưa con về quê bạn một mùa hè", { money: -0.2, gamble: { p: 0.6,
        win: { trust: { npc: k, delta: 0.3 }, flags: ["mrm_kid_bilingual"], log: `Về lại, ${N(k)} tự đếm số bằng tiếng của bạn.` },
        lose: { trust: { npc: k, delta: -0.1 }, log: `${N(k)} kêu nóng, nhớ nhà suốt hai tháng.` } } }, "Tốn kém, có thể nối lại sợi dây"),
      C("Ngồi nói chuyện thẳng với con về chuyện bị trêu", { trust: { npc: k, delta: 0.2 }, bw: -2 }, "Khó mở lời, con biết bạn không xấu hổ", { tier: "awakened" })], 2, { npc: k });
    const q = p!;
    return T(`${N(q)} sang thăm`,
      `${N(q)} lần đầu đi máy bay, sang ở với bạn ba tuần. ${N(q)} không nói được tiếng nơi này, ${inlaw(c)} không nói được tiếng quê bạn. Bữa cơm nào bạn cũng ngồi giữa, dịch cả hai chiều.`, [
      C("Dịch hết, kể cả những câu khó nghe", { trust: { npc: q, delta: 0.1 }, bw: -4, counters: { honest: 1 } }, "Thật lòng, có bữa cơm nghẹn"),
      C("Dịch khéo, bỏ bớt những câu khó nghe", { trust: { npc: q, delta: 0.2 }, flags: ["mrm_soft_translate"] }, "Êm cả hai bên, bạn giữ hết trong lòng"),
      C("Đưa người nhà đi chơi riêng, ít ngồi chung", { trust: { npc: q, delta: 0.1 }, money: -0.1, rel: -2 })], 1, { npc: q });
  }),
];

/* =====================================================================================
 * 2. DU HỌC SINH (student_abroad) — tiền tố sab_
 *    Bộ đếm: sab_network (bạn bè quốc tế), sab_bubble (chỉ quanh quẩn với đồng hương), sab_grit.
 *    Cờ: sab_scholar / sab_family_debt / sab_work / sab_host_family (cách bước vào), sab_spoke_up, sab_lab,
 *    sab_overwork, sab_aid — b2..b4 đọc lại. Nhịp gần nhau (1 năm) vì một khóa học chỉ kéo dài vài năm;
 *    b4 là lễ tốt nghiệp (hoặc tấm bằng chưa cầm được), b5 là chuyện quốc tịch mười năm sau.
 * =================================================================================== */
const SA = "student_abroad";

const SAB: Storylet[] = [
  /* ---------- năng khiếu ---------- */
  talent(SA, "sab_t_subtitles", [10, 16], () => true, () => T("Ba cuốn vở chép phụ đề",
    "Bạn tự học ngoại ngữ bằng phim có phụ đề, chép kín ba cuốn vở những câu mình thích. Cô giáo dạy tiếng nói bạn phát âm như người từng sống ở đó, rồi hỏi bạn đã bao giờ nghĩ đến chuyện đi học ở nước ngoài chưa.", [
    C("Xin bố mẹ cho học thêm ở trung tâm", { money: -0.04, flags: [talentFlag(SA)], counters: { talents_seen: 1 }, know: 2 }, "Tốn tiền nhà, mở một cánh cửa xa"),
    C("Tự học tiếp bằng sách thư viện", { counters: { talents_seen: 1, read: 1 }, know: 1 })], 0)),

  /* ---------- cơ hội bước vào ---------- */
  door(SA, "sab_d_scholar", [17, 28], (c) => c.know >= 45 || c.has_degree || f(c, talentFlag(SA)), () => T("Email lúc nửa đêm",
    "Email đến lúc nửa đêm: bạn đỗ học bổng toàn phần ở một trường đại học bên kia đại dương. Học bổng trả học phí và một khoản sinh hoạt vừa đủ sống, với điều kiện điểm trung bình không tụt dưới mức khá suốt bốn năm. Vé máy bay thì tự lo.", [
    C("Nhận, lên đường", { ...become(SA), counters: { doors_seen: 1 }, flags: ["sab_scholar"], money: -0.05, rel: -3 }, "Đi xa, một điều kiện treo trên đầu"),
    C("Xin bảo lưu một năm để đi làm gom tiền", { counters: { doors_seen: 1 }, gamble: { p: 0.5,
      win: { ...become(SA), flags: ["sab_scholar"], money: 0.05, log: "Trường đồng ý. Bạn lên đường muộn một năm, túi có thêm một khoản phòng thân." },
      lose: { happy: -5, log: "Trường không cho bảo lưu. Suất học bổng chuyển sang người khác." } } }, "Chắc chân hơn nếu được, mất hết nếu không"),
    C("Ở lại học trong nước, gần nhà", { counters: { doors_seen: 1 }, rel: 3 })], 2)),

  door(SA, "sab_d_mortgage", [17, 30], (c) => c.family_wealth >= 0.25 || !c.poor_country, (c, N) => { const p = parentOf(c);
    return T(vn(c) ? "Cuốn sổ đỏ trong ngăn tủ" : "Căn nhà đem đi thế chấp",
      `${vn(c) ? "Bố mẹ lấy cuốn sổ đỏ trong ngăn tủ ra, nói sẽ đem thế chấp ngân hàng" : "Bố mẹ nói sẽ đem căn nhà đi thế chấp"} để bạn được đi du học. Học phí bốn năm bằng ngần ấy năm thu nhập của cả nhà. ${p ? N(p) : "Mẹ"} bảo: "Nhà mình chỉ có thế, con đi thì đi cho đến nơi."`, [
      C("Nhận, hứa học cho xong", { custom: `borrow:1|become:${SA}`, counters: { doors_seen: 1 }, flags: ["sab_family_debt"], ...(p ? { promise: { to: p, what: "học cho xong và đỡ bố mẹ trả khoản vay", years: 6 } } : {}) }, "Cả nhà gánh nợ, bạn gánh một lời hứa"),
      C("Đi, nhưng chỉ vay một nửa, còn lại tự làm thêm", { custom: `borrow:0.5|become:${SA}`, counters: { doors_seen: 1 }, flags: ["sab_work"], health: -2, bw: -3 }, "Nhà nhẹ nợ, vai bạn nặng thêm", { tier: "awakened" }),
      C("Không để bố mẹ cầm nhà", { counters: { doors_seen: 1 }, rel: 3, happy: -3, ...pT(c, 0.05) })], 2, p ? { npc: p } : {}); }),

  door(SA, "sab_d_exchange", [16, 22], () => true, () => T("Một năm ở nhà người lạ",
    "Trường bạn có một suất trao đổi: sống cùng một gia đình bản xứ, đi học như học sinh ở đó, rồi nếu học tốt thì được xét học tiếp. Bên kia lo chỗ ở và cơm nước; nhà bạn lo vé máy bay và tiền tiêu vặt. Ai đi về cũng nói tiếng như người khác.", [
    C("Đi, ở cùng gia đình bản xứ", { ...become(SA), counters: { doors_seen: 1 }, flags: ["sab_host_family"], money: -0.05 }, "Tốn tiền nhà, một năm lạc giữa người lạ"),
    C("Nhường suất cho bạn cùng lớp nhà khó hơn", { counters: { doors_seen: 1, kind: 1 }, rel: 3 }, "Mất dịp, được một người bạn"),
    C("Ở lại ôn thi", { counters: { doors_seen: 1 }, know: 2 })], 2)),

  /* ---------- mạch truyện ---------- */
  beat(SA, 1, 1, (c) => T("Lớp thảo luận không ai gọi tên",
    `Ở lớp thảo luận, giáo sư không gọi tên ai: muốn có điểm thì tự giơ tay. Mười lăm sinh viên nói chen nhau, nhanh hơn bạn kịp nghĩ. Hai phần mười điểm môn này là "tham gia".${f(c, "sab_host_family") ? " Tối về, cô con gái của gia đình bạn ở cùng hỏi hôm nay bạn đã nói được câu nào chưa." : ""}`, [
    C("Giơ tay dù nói vấp", { counters: step(c, SA), flags: ["sab_spoke_up"], gamble: { p: 0.5,
      win: { know: 3, log: "Câu hỏi của bạn làm giáo sư dừng lại, viết lên bảng." },
      lose: { happy: -4, log: "Bạn nói vấp, cả lớp im một giây. Tuần sau bạn vẫn giơ tay." } } }, "Ngượng trước, quen sau"),
    C("Gửi ý kiến qua thư cho giáo sư sau giờ học", { counters: step(c, SA), know: 2, bw: -2 }, "An toàn, điểm tham gia thấp"),
    C("Ngồi cùng nhóm đồng hương, chia nhau bài vở", { counters: step(c, SA, { sab_bubble: 1 }), happy: 3 }, "Đỡ cô đơn, ít mở lời với ai khác")], 0)),

  beat(SA, 2, 1, (c) => T("Lời mời vào phòng nghiên cứu",
    `${f(c, "sab_spoke_up") ? "Giáo sư vẫn nhớ câu hỏi của bạn từ năm đầu." : "Bài luận của bạn được điểm cao nhất lớp."} Giáo sư mời bạn làm trợ lý nghiên cứu: kỳ đầu không lương, nhưng tên bạn sẽ có trên một bài báo khoa học. ${f(c, "sab_work") || f(c, "sab_family_debt") ? "Còn ca làm thêm ở quán ăn đang trả tiền nhà cho bạn." : "Còn lịch làm thêm của bạn thì kín các buổi chiều."}`, [
    C("Nhận, bỏ ca làm thêm", { counters: step(c, SA), flags: ["sab_lab"], know: 6, money: -0.08 }, "Thiếu tiền vài kỳ, có người dẫn đường"),
    C("Giữ ca làm thêm, từ chối khéo", { counters: step(c, SA), money: 0.05, health: -1 }, "Đủ tiền nhà, đường học hẹp lại"),
    C("Đề nghị được trả lương theo giờ trợ giảng", { counters: step(c, SA), agency: 0.02, gamble: { p: 0.45,
      win: { flags: ["sab_lab"], know: 4, money: 0.03, log: "Giáo sư xin được quỹ của khoa. Bạn là sinh viên năm hai đầu tiên được trả lương trợ giảng." },
      lose: { happy: -1, log: "Khoa không còn quỹ. Giáo sư hẹn bạn năm sau." } } }, "Đòi cả hai, có thể không được gì", { tier: "sovereign" })], 0), adult),

  beat(SA, 3, 1, (c) => T("Đồng tiền nhà mất giá",
    `Đồng tiền ở quê mất giá gần một phần ba chỉ trong một mùa. ${f(c, "sab_family_debt") ? "Khoản vay của bố mẹ bỗng nặng thêm, mà học phí kỳ tới lại tính bằng tiền bên này." : f(c, "sab_scholar") ? "Học bổng trả học phí, nhưng tiền ăn ở nhà gửi sang giờ chỉ đủ nửa tháng." : "Tiền nhà gửi sang giờ chỉ đủ nửa tháng."} Thị thực du học chỉ cho làm thêm hai mươi giờ một tuần. Chủ quán ăn nói sẵn sàng trả tiền mặt nếu bạn làm bốn mươi.`, [
    C("Làm bốn mươi giờ, nhận tiền mặt", { counters: step(c, SA), flags: ["sab_overwork"], money: 0.15, health: -4, gamble: { p: 0.75,
      win: { know: -3, log: "Không ai hỏi gì. Bạn ngủ gật trong cả hai kỳ thi." },
      lose: { ...goHome(SA), flags: ["sab_deported"], log: "Một đợt kiểm tra ở quán. Thị thực của bạn bị hủy, bạn có ba mươi ngày để về nước." } } }, "Đủ tiền ăn học, có thể mất tất cả"),
    C("Xin quỹ hỗ trợ khẩn cấp của trường", { counters: step(c, SA), bw: -3, gamble: { p: f(c, "sab_lab") ? 0.7 : 0.5,
      win: { money: 0.1, flags: ["sab_aid"], log: "Phòng công tác sinh viên duyệt một khoản trợ cấp và giảm nửa học phí kỳ này." },
      lose: { happy: -4, money: -0.1, log: "Hồ sơ bị từ chối vì nộp muộn hai ngày. Bạn vay tạm bạn cùng nhà." } } }, "Thủ tục dài, đúng luật", { tier: "awakened" }),
    C("Bảo lưu, về nhà đi làm một thời gian", { counters: step(c, SA), ...goHome(SA), flags: ["sab_paused"], rel: 4, happy: -4 }, "Nhà bớt gánh, giấc mơ dừng lại")], 1), adult),

  beat(SA, 4, 1, (c) => {
    const p = parentOf(c);
    if (f(c, "sab_overwork") && !f(c, "sab_lab") && !f(c, "sab_aid")) return T("Tấm bằng chưa cầm được",
      `Bạn trượt hai môn vì những đêm làm ca. Muốn có bằng phải học thêm một kỳ, mà thị thực chỉ còn bốn tháng. ${f(c, "sab_family_debt") ? "Bố mẹ vẫn đang trả lãi khoản vay, và chưa biết gì." : "Ở nhà chưa ai biết."}`, [
      C("Xin gia hạn, học lại một kỳ", { counters: step(c, SA), money: -0.25, gamble: { p: 0.6,
        win: { flags: ["sab_stayed", "path_migrant"], know: 3, log: "Bạn qua cả hai môn. Tấm bằng in muộn sáu tháng, nhưng vẫn là tấm bằng." },
        lose: { ...goHome(SA), flags: ["sab_no_degree"], happy: -6, log: "Đơn gia hạn bị từ chối. Bạn về nước với bảng điểm dở dang." } } }, "Tốn thêm tiền, chưa chắc kịp"),
      C("Về nước, nói thật với bố mẹ", { counters: step(c, SA), ...goHome(SA), flags: ["sab_no_degree"], happy: -4, ...pT(c, 0.1) }, "Mất mặt, nhẹ lòng"),
      C("Ở lại làm chui khi thị thực hết hạn", { counters: step(c, SA), flags: ["undocumented", "path_migrant", "sab_stayed"], money: 0.2, bw: -8 }, "Có tiền gửi về, sống trong sợ hãi")], 0, p ? { npc: p } : {});
    return T("Lễ tốt nghiệp",
      `Bạn mặc áo thụng, đứng giữa hàng nghìn người. ${f(c, "sab_lab") ? "Giáo sư giới thiệu bạn cho hai công ty và một chương trình tiến sĩ." : "Bạn có một lời mời làm việc, kèm bảo lãnh thị thực."}${f(c, "sab_family_debt") ? " Ở nhà, khoản vay vẫn còn hơn một nửa." : ""} Ở đây có việc; ở nhà có bố mẹ${n(c, "sab_bubble") >= 1 ? " và những người bạn đồng hương đã về trước" : ""}.`, [
      C("Ở lại, nhận việc có bảo lãnh thị thực", { counters: step(c, SA), income_mult: 2.2, flags: ["sab_stayed", "path_migrant", "left_home"], rel: -4 }, "Lương cao, xa nhà thêm nhiều năm"),
      C("Về nước, đem cái đã học về làm", { counters: step(c, SA), ...switchTo(SA, "returnee", true), flags: ["sab_graduated"], rel: 5, ...pT(c, 0.2) }, "Gần nhà, bắt đầu lại từ đầu"),
      C("Học tiếp tiến sĩ, sống bằng học bổng", { counters: step(c, SA), flags: ["sab_phd", "sab_stayed"], know: 8, income_mult: 0.8 }, "Thêm năm năm nghèo, đi được xa hơn", { tier: "awakened" })], 0, p ? { npc: p } : {});
  }, adult),

  beat(SA, 5, 8, (c) => T("Hai cuốn hộ chiếu",
    `${f(c, "sab_phd") ? "Bạn đã có học vị, có một phòng làm việc gắn tên mình." : f(c, "undocumented") ? "Sau nhiều năm sống không giấy tờ, bạn được hợp thức hóa trong một đợt xét duyệt đặc biệt." : "Bạn đã có việc ổn định và một căn hộ thuê dài hạn."} Thư báo bạn đủ điều kiện nhập quốc tịch; theo luật của hai bên, nhận quốc tịch mới thì phải thôi quốc tịch cũ. Cùng tuần ấy, một học sinh ở quê nhắn tin hỏi bạn đã đi bằng cách nào.`, [
    C("Nhận quốc tịch mới", { counters: step(c, SA), flags: ["sab_citizen"], unflags: ["undocumented"], income_mult: 1.1, close_doors: ["return_home"], happy: -2 }, "Ổn định, khó quay về như cũ"),
    C("Giữ hộ chiếu cũ, gia hạn thẻ cư trú", { counters: step(c, SA), flags: ["sab_kept_passport"], unflags: ["undocumented"], bw: -3 }, "Giữ đường về, giấy tờ mãi là tạm"),
    C("Lập quỹ học bổng nhỏ cho học sinh ở quê", { counters: step(c, SA), flags: ["sab_fund", "passed_on"], money: -0.2, agency: 0.03, rel: 4 }, "Tốn tiền, mở đường cho người đi sau", { tier: "sovereign" })], 0), (c) => c.age >= 30),

  /* ---------- chuyện thường ngày ---------- */
  daily(SA, "sab_basement", [17, 32], 8, (c) => T("Căn phòng dưới tầng hầm", vary("sabb", c.age, [
    "Căn phòng giá rẻ nằm dưới tầng hầm, cửa sổ ngang mặt đất. Chủ nhà đòi đặt cọc ba tháng bằng tiền mặt, không ký hợp đồng.",
    "Một người đăng tin cho thuê phòng gần trường, giá chỉ bằng nửa chỗ khác, miễn là chuyển tiền cọc trước khi xem phòng."]), [
    C("Thuê ngay cho rẻ", { gamble: { p: 0.5,
      win: { money: 0.03, log: "Phòng ẩm, nhưng chủ nhà trả đủ tiền cọc khi bạn dọn đi." },
      lose: { money: -0.05, happy: -4, flags: ["sab_scammed"], log: "Tiền cọc không bao giờ quay về." } } }, "Rẻ, có thể mất trắng"),
    C("Ở ký túc xá, đắt hơn", { money: -0.04, bw: 2 }),
    C("Hỏi hội sinh viên, tìm người ở ghép có hợp đồng", { counters: { sab_network: 1 }, bw: -2 }, "Mất công, có giấy tờ và có bạn", { tier: "awakened" })], 2)),

  daily(SA, "sab_month_end", [17, 32], 7, (c) => T("Tuần cuối tháng", vary("sabm", c.age, [
    "Tuần cuối tháng, trong tủ còn sáu gói mì và nửa hộp trứng. Bạn bè rủ đi ăn sinh nhật ở nhà hàng.",
    "Cuối tháng, tài khoản còn đúng tiền đi xe buýt. Bố mẹ gọi sang hỏi bên đó ăn uống có đủ không."]), [
    C("Nói là bận, ở nhà ăn mì", { health: -2, rel: -1, counters: { save: 1 } }, "Giữ được tiền, mất một buổi vui"),
    C("Gọi về xin thêm tiền", { money: -0.03, flags: ["sab_asked_home"], happy: 1 }, "No bụng, nhà thêm gánh"),
    C("Rủ cả nhà trọ nấu chung, chia tiền chợ", { counters: { sab_network: 1 }, health: 1, rel: 2 }, "Phải sắp xếp, ai cũng đỡ")], 2)),

  daily(SA, "sab_essay", [18, 30], 9, () => T("Bài luận lúc ba giờ sáng",
    "Ba giờ sáng, bài luận nộp lúc chín giờ còn trống một nửa. Trong nhóm trò chuyện có người bán bài \"viết sẵn, không bị phát hiện\", giá bằng một tuần làm thêm. Bị bắt đạo văn một lần có thể mất cả thị thực.", [
    C("Mua bài", { money: -0.03, secret: { tag: "CHEATED_EXAM", severity: 0.4, fuse_years: [1, 8], note: "bài luận mua hồi du học" } }, "Qua môn, mang một bí mật"),
    C("Thức trắng tự viết", { health: -2, know: 3, counters: { honest: 1 } }, "Mệt rã, bài là của mình"),
    C("Viết thư xin giáo sư gia hạn, nói thật", { counters: { honest: 1 }, gamble: { p: 0.6,
      win: { know: 2, log: "Giáo sư cho thêm hai ngày, kèm lời dặn ghé phòng vào giờ tiếp sinh viên." },
      lose: { happy: -3, log: "Giáo sư trừ một nửa số điểm vì nộp muộn." } } }, "Có thể mất điểm, không mất gì khác", { tier: "awakened" })], 1)),

  daily(SA, "sab_bus", [17, 35], 9, () => T("Câu nói trên chuyến xe đêm",
    "Trên chuyến xe buýt đêm, một người lạ bảo bạn hãy về nước mình đi. Cả xe nghe thấy, không ai nói gì. Còn bốn bến nữa mới đến nơi.", [
    C("Bình thản đáp một câu rồi nhìn ra cửa sổ", { happy: -2, counters: { sab_grit: 1 } }, "Giữ được mình, mang nỗi tức về nhà"),
    C("Xuống xe, đi bộ về", { health: -1, happy: -3 }),
    C("Viết lại chuyện này cho báo sinh viên", { agency: 0.02, flags: ["sab_wrote"], gamble: { p: 0.6,
      win: { rel: 3, log: "Bài viết được đăng. Hội sinh viên mở một đường dây cho người gặp chuyện tương tự." },
      lose: { bw: -4, log: "Dưới bài viết là một tuần bình luận ác ý." } } }, "Lên tiếng, có thể bị nhắm vào", { tier: "sovereign" })], 0)),

  daily(SA, "sab_winter", [18, 35], 8, (c) => T("Những ngày tối sớm", vary("sabw", c.age, [
    "Mùa đông đầu tiên, bốn giờ chiều trời đã tối. Đã ba tuần bạn không nói chuyện với ai quá năm câu.",
    "Lại một mùa tối sớm. Bạn ngủ mười hai tiếng mà vẫn mệt, bỏ liền hai buổi học."]), [
    C("Đặt lịch gặp phòng tư vấn tâm lý của trường", { flags: ["sab_counseling"], bw: 4, happy: 3 }, "Phải vượt qua ngại ngùng, đỡ thật"),
    C("Lao vào học cho quên", { know: 3, health: -3, happy: -2 }),
    C("Mua vé về nhà dịp nghỉ lễ", { money: -0.1, happy: 5, rel: 3, counters: { sab_trips_home: 1 } }, "Hết tiền dành dụm, ấm được một mùa")], 0)),

  daily(SA, "sab_partner", [18, 32], 9, (c, N) => { const pt = role(c, "partner")!;
    return T("Người yêu ở quê", `${N(pt)} nhắn từ quê: hai năm rồi, không biết mình còn chờ được bao lâu. Lệch nhau năm múi giờ, hai người chỉ gặp nhau qua màn hình, vào bữa sáng của người này và bữa tối của người kia.`, [
      C("Hứa ra trường sẽ về", { trust: { npc: pt, delta: 0.15 }, promise: { to: pt, what: "ra trường sẽ về nước", years: 3 } }, "Giữ được nhau, tự buộc mình một lời hứa"),
      C("Chia tay cho cả hai đỡ khổ", { trust: { npc: pt, delta: -0.3 }, happy: -5, bw: 3 }),
      C("Rủ người ấy nộp hồ sơ sang học cùng", { gamble: { p: 0.35,
        win: { trust: { npc: pt, delta: 0.3 }, happy: 5, log: "Người ấy đỗ một trường cách bạn hai giờ tàu." },
        lose: { trust: { npc: pt, delta: -0.1 }, log: "Người ấy không muốn rời nhà. Hai người im lặng một thời gian dài." } } }, "Có thể ở gần nhau, có thể thành áp lực", { tier: "awakened" })], 0, { npc: pt }); }, (c) => !!role(c, "partner")),

  daily(SA, "sab_group", [18, 30], 8, () => T("Bài tập nhóm bốn người",
    "Bài tập nhóm chiếm một nửa điểm môn học. Hai người trong nhóm không đến buổi họp nào, nhưng vẫn muốn có tên trên bài nộp. Hạn nộp còn năm ngày.", [
    C("Làm thay phần của họ", { know: 3, health: -2, counters: { sab_grit: 1 } }, "Bài tốt, bạn kiệt sức"),
    C("Báo với giáo sư", { rel: -2, gamble: { p: 0.6, win: { know: 1, log: "Giáo sư chấm điểm riêng từng người." }, lose: { happy: -2, log: "Giáo sư bảo nhóm tự giải quyết." } } }, "Công bằng, mang tiếng mách lẻo"),
    C("Chia việc bằng văn bản, ai không làm thì ghi rõ", { flags: ["leader"], agency: 0.01, counters: { sab_network: 1 } }, "Mất lòng lúc đầu, rõ ràng về sau", { tier: "sovereign" })], 2)),

  daily(SA, "sab_dinner", [17, 32], 8, () => T("Bữa tối của năm thứ tiếng",
    "Căn nhà bạn ở chung có năm người đến từ năm nước. Mỗi tối thứ Sáu một người nấu món quê mình. Đến lượt bạn, mà tuần này bạn có hai bài kiểm tra.", [
    C("Nấu thật chu đáo, kể chuyện quê mình", { counters: { sab_network: 2 }, bw: -3, happy: 3 }, "Mất một buổi ôn, được bạn bè"),
    C("Mua đồ ăn sẵn cho xong", { money: -0.02, rel: -1 }),
    C("Xin đổi lượt sang tuần sau", { know: 2, counters: { sab_network: 1 } })], 0)),

  daily(SA, "sab_culture_night", [17, 30], 8, (c) => T("Đêm văn hóa của hội sinh viên",
    `${vn(c) ? "Hội sinh viên Việt Nam tổ chức đêm Tết cho cả trường" : "Hội sinh viên đồng hương tổ chức đêm văn hóa cho cả trường"}, đang thiếu người đứng ra lo. Năm ngoái hội lỗ tiền vì không ai giữ sổ sách.`, [
    C("Nhận làm trưởng ban, công khai thu chi", { flags: ["leader", "sab_org"], bw: -5, counters: { sab_network: 2 } }, "Mất cả tháng ôn thi, quen cả trường"),
    C("Đi dự, phụ một tay", { counters: { sab_network: 1 }, happy: 2 }),
    C("Ở nhà ôn thi", { know: 2 })], 1)),

  daily(SA, "sab_agency", [18, 32], 9, () => T("Lời mời quay video quảng cáo",
    "Công ty tư vấn du học từng làm hồ sơ cho bạn nhờ quay một đoạn video: kể cuộc sống bên này thật đẹp, đổi lại một khoản hoa hồng cho mỗi học sinh đăng ký theo lời giới thiệu của bạn.", [
    C("Quay đúng như họ muốn", { money: 0.05, counters: { honest: -1 } }, "Có tiền tiêu, kể một nửa sự thật"),
    C("Từ chối", { counters: { honest: 1 } }),
    C("Viết một bài kể đủ cả mặt khó, đăng miễn phí", { flags: ["sab_honest_post"], gamble: { p: 0.6,
      win: { rel: 3, log: "Hàng trăm phụ huynh ở quê chia sẻ bài viết. Vài người nhắn hỏi kỹ trước khi đem nhà đi thế chấp." },
      lose: { bw: -3, log: "Công ty tư vấn gọi bạn là kẻ phá đám." } } }, "Giúp người sau, mất lòng người đưa bạn đi", { tier: "sovereign" })], 1)),

  /* ---------- gia đình ---------- */
  cross(SA, "sab_family", [18, 40], (c) => !!role(c, "sibling") || !!parentOf(c), (c, N) => {
    const s = role(c, "sibling"); const p = parentOf(c);
    if (s) return T(`${N(s)} cũng muốn đi`,
      `${N(s)} vừa đỗ một trường bên này, cần một khoản như bạn ngày trước. ${f(c, "sab_family_debt") ? "Khoản vay cho bạn đi vẫn chưa trả hết." : "Nhà không đủ tiền cho hai người đi cùng lúc."} Bố mẹ hỏi ý bạn.`, [
      C(`Ủng hộ ${N(s)} đi, bạn gửi tiền đỡ một phần`, { trust: { npc: s, delta: 0.3 }, money: -0.15, health: -2 }, "Người sau có cơ hội, bạn làm thêm gấp đôi"),
      C("Khuyên học trong nước, chờ vài năm", { trust: { npc: s, delta: -0.15 }, rel: 1 }, "Nhà đỡ nợ, người ở nhà mang một nỗi tủi"),
      C("Chỉ cách săn một suất học bổng", { bw: -4, gamble: { p: 0.5,
        win: { trust: { npc: s, delta: 0.35 }, log: `${N(s)} đỗ một suất học bổng một nửa. Cả nhà thở ra.` },
        lose: { trust: { npc: s, delta: 0.05 }, log: `${N(s)} trượt học bổng, nhưng nhớ bạn đã ngồi cùng đến hai giờ sáng.` } } }, "Mất thời gian của bạn, không thêm nợ", { tier: "awakened" })], 0, { npc: s });
    const q = p!;
    return T(`${N(q)} khoe với cả xóm`,
      `${N(q)} in tấm ảnh bạn đứng trước cổng trường, treo giữa nhà, kể với cả xóm rằng con đi du học sau này sẽ làm to. Còn bạn thì đang làm ca đêm và chưa chắc qua được môn.`, [
      C("Kể thật với bố mẹ về những ngày khó", { trust: { npc: q, delta: 0.2 }, happy: 2 }, "Bố mẹ lo hơn, bạn nhẹ hơn"),
      C("Để bố mẹ vui, không kể gì", { happy: -3, bw: -2, flags: ["sab_hid_struggle"] }),
      C("Nhờ bố mẹ đừng hứa hộ mình với ai", { trust: { npc: q, delta: -0.05 }, agency: 0.01, flags: ["sab_set_limits"] }, "Hơi phật lòng, bớt một gánh kỳ vọng")], 1, { npc: q });
  }),
];

/* =====================================================================================
 * 3. NGƯỜI VỀ NƯỚC LẬP NGHIỆP (returnee) — tiền tố rtn_
 *    Chỉ mở cho người từng sống ở nước ngoài: c.migrated, path_migrant, đang đi một con đường "đi xa",
 *    hoặc đã về từ đó (sab_graduated, sab_no_degree, mrm_went_home, dwa_back…).
 *    Bộ đếm: rtn_net (quan hệ gây dựng lại), rtn_roots. Cờ: rtn_founder / rtn_hired, rtn_kickback,
 *    rtn_clean_name, rtn_own, rtn_contract — b3, b4 đọc lại.
 * =================================================================================== */
const RT = "returnee";
const AWAY_LIVES = ["marriage_migrant", "student_abroad", "domestic_abroad", "labor_export"];
const awayNow = (c: FactContext): boolean => c.migrated || f(c, "path_migrant") || AWAY_LIVES.some((p) => f(c, life(p)));
const livedAbroad = (c: FactContext): boolean => awayNow(c) || ["sab_graduated", "sab_no_degree", "sab_paused", "sab_deported", "mrm_went_home", "dwa_back"].some((x) => f(c, x));
/** Bước vào con đường "về nước": khép các con đường đang đi ở xứ người lại. */
const comeHome = (c: FactContext): Effect => ({ unflags: [...AWAY_LIVES.map(life), "path_migrant"], custom: `${c.migrated ? "return_home|" : ""}become:${RT}` });

const RTN: Storylet[] = [
  /* ---------- cơ hội bước vào (không có năng khiếu: 3 cửa) ---------- */
  door(RT, "rtn_d_parents", [25, 55], (c) => awayNow(c) && c.parents_alive > 0, (c, N) => { const p = parentOf(c);
    return T("Bố mẹ đã già",
      `${p ? N(p) : "Mẹ"} gọi video, tay run hơn lần trước. ${vn(c) ? "Nhà ở quê vừa sửa lại, có sẵn một phòng cho bạn." : "Căn phòng cũ của bạn ở nhà vẫn để nguyên."} Bạn đã ở xứ người nhiều năm, có việc, có bạn bè, có một khoản dành dụm. Về thì bắt đầu lại; không về thì mỗi năm gặp bố mẹ một lần, và đếm được còn bao nhiêu lần.`, [
      C("Về hẳn, mang theo tiền dành dụm", { ...comeHome(c), counters: { doors_seen: 1 }, flags: ["rtn_for_parents"], money: -0.2, rel: 6, ...pT(c, 0.3) }, "Gần bố mẹ, bỏ lại những năm gây dựng"),
      C("Về, nhưng giữ giấy tờ cư trú bên kia", { ...comeHome(c), counters: { doors_seen: 1 }, flags: ["rtn_keep_papers"], money: -0.1, bw: -3 }, "Có đường lui, sống nửa ở nửa đi", { tier: "awakened" }),
      C("Ở lại, mỗi năm về một tháng", { counters: { doors_seen: 1 }, money: -0.1, happy: -3, ...pT(c, -0.05) })], 2, p ? { npc: p } : {}); }, 0.3),

  door(RT, "rtn_d_idea", [27, 50], livedAbroad, (c) => T("Thứ mà ở quê chưa có",
    "Ở xứ người, bạn từng làm cho một công ty đặt những kho lạnh nhỏ ngay tại vùng trồng rau; rau ra chợ vẫn tươi như vừa hái. Ở quê, mỗi mùa thu hoạch người ta vẫn đổ bỏ cả xe rau héo. Một người bạn cũ nhắn: về làm đi, tôi góp vốn.", [
    C("Về, dồn hết tiền dành dụm mở công ty", { ...comeHome(c), counters: { doors_seen: 1 }, flags: ["rtn_founder"], money: -0.6, agency: 0.02 }, "Đặt cả vốn liếng vào một ý tưởng"),
    C("Về, làm thử một kho trước khi mở rộng", { ...comeHome(c), counters: { doors_seen: 1 }, flags: ["rtn_founder", "rtn_cautious"], money: -0.25 }, "Chậm, ít rủi ro, có thể bị người khác đi trước", { tier: "awakened" }),
    C("Gửi ý tưởng cho bạn cũ làm, mình đứng ngoài", { counters: { doors_seen: 1 }, gamble: { p: 0.4,
      win: { money: 0.2, log: "Bạn cũ làm được. Mỗi năm bạn nhận một phần lãi nhỏ." },
      lose: { money: -0.1, log: "Không có người hiểu việc, kho lạnh đứng im sau một mùa." } } }, "Ít ràng buộc, nhưng không còn là việc của mình")], 2), 0.3),

  door(RT, "rtn_d_talent", [28, 55], livedAbroad, (c) => T("Chính sách thu hút người tài",
    "Một cơ quan ở quê mời những người từng học và làm ở nước ngoài về làm việc: chức danh đẹp, phòng làm việc riêng, nhưng lương chỉ bằng một phần năm lương cũ. Người mời nói: \"Về đây mới có đất cho anh chị làm.\" Thư mời không ghi gì về quyền được làm gì.", [
    C("Nhận lời, về làm", { ...comeHome(c), counters: { doors_seen: 1 }, flags: ["rtn_hired"], rel: 3 }, "Có chỗ đứng, lương thấp, quyền chưa rõ"),
    C("Đòi ghi rõ quyền hạn và ngân sách vào hợp đồng", { counters: { doors_seen: 1 }, agency: 0.02, gamble: { p: 0.4,
      win: { ...comeHome(c), flags: ["rtn_hired", "rtn_contract"], log: "Họ đồng ý. Hợp đồng của bạn thành mẫu cho những người về sau." },
      lose: { happy: -2, log: "Họ nói chưa có tiền lệ. Lời mời được gửi cho người khác." } } }, "Có thể làm thật, có thể mất dịp", { tier: "sovereign" }),
    C("Từ chối, chưa phải lúc", { counters: { doors_seen: 1 } })], 2), 0.3),

  /* ---------- mạch truyện ---------- */
  beat(RT, 1, 1, (c) => T("Thành phố không chờ bạn",
    `Con đường cũ thành đường cao tốc, quán quen thành ngân hàng. Bạn bè cùng lớp đã có nhà, có con, có những câu chuyện bạn không theo kịp. ${vn(c) ? "Người ta gọi bạn là \"Việt kiều\", nửa đùa nửa thật." : "Người ta gọi bạn là \"người bên kia về\", nửa đùa nửa thật."}${f(c, "rtn_founder") ? " Tiền dành dụm đã chuyển về, nằm chờ." : f(c, "rtn_hired") ? " Tuần sau bạn nhận việc." : ""}`, [
    C("Thuê nhà riêng ở trung tâm", { counters: step(c, RT), flags: ["rtn_city"], money: -0.1, bw: 3 }, "Tốn tiền, có không gian của mình"),
    C("Về ở với bố mẹ một thời gian", { counters: step(c, RT), flags: ["rtn_with_parents"], rel: 4, bw: -3, money: 0.05 }, "Tiết kiệm, mất riêng tư"),
    C("Dành ba tháng đi gặp người, hỏi chuyện trước đã", { counters: step(c, RT, { rtn_net: 2 }), know: 3, money: -0.05 }, "Khởi động chậm, hiểu đất mình đứng", { tier: "awakened" })], 0)),

  beat(RT, 2, 3, (c) => { const hired = f(c, "rtn_hired") && !f(c, "rtn_founder");
    return T("Hợp đồng lớn đầu tiên",
      `${hired ? "Dự án đầu tiên của bạn cần chọn một nhà cung cấp lớn. Một bên hẹn bạn cà phê: nếu bạn ký hồ sơ chọn họ, sẽ có \"phần trăm\" như mọi người vẫn nhận." : "Một tập đoàn trong nước mời công ty nhỏ của bạn chào hàng. Người phụ trách mua sắm hẹn cà phê, nói hợp đồng gần như chắc chắn, chỉ cần \"phần trăm\" như mọi người vẫn làm."} Hợp đồng này đủ nuôi bạn${n(c, "rtn_net") >= 2 ? " và mấy người đã tin bạn" : ""} trong hai năm.`, [
      C(hired ? "Nhận phần trăm, ký hồ sơ" : "Chi phần trăm, lấy hợp đồng", { counters: step(c, RT), flags: ["rtn_kickback"], income_mult: 1.4, secret: { tag: "PAID_BRIBE", severity: 0.45, fuse_years: [2, 9], note: hired ? "nhận phần trăm hợp đồng" : "chi phần trăm để lấy hợp đồng" } }, "Lên nhanh, mang theo một quả bom hẹn giờ"),
      C("Từ chối, làm đúng quy trình", { counters: step(c, RT, { honest: 1 }), income_mult: 0.95, bw: -3 }, "Mất hợp đồng, giữ tên sạch"),
      C(hired ? "Đề nghị đấu thầu công khai" : "Đề nghị chiết khấu công khai cho cả công ty họ", { counters: step(c, RT), agency: 0.02, gamble: { p: 0.4,
        win: { income_mult: 1.25, flags: ["rtn_clean_name"], log: hired ? "Cuộc đấu thầu mở. Giá rẻ hơn ba phần mười, cấp trên nêu tên bạn trong cuộc họp." : "Giám đốc bên kia đọc thư và đồng ý. Người phụ trách mua sắm bị chuyển sang việc khác." },
        lose: { income_mult: 0.95, log: hired ? "Hồ sơ của bạn bị treo. Người ta bắt đầu gọi bạn là người không hiểu chuyện." : "Hợp đồng về tay đối thủ. Bạn còn lại một lá thư trả lời lịch sự." } } }, "Lối thứ ba, cửa hẹp", { tier: "sovereign" })], 1); }, adult),

  beat(RT, 3, 4, (c, N) => {
    const hired = f(c, "rtn_hired") && !f(c, "rtn_founder");
    const fr = role(c, "childhood_friend"); const frN = fr ? N(fr) : "người cộng sự";
    const old = f(c, "rtn_kickback") ? " Người ấy cũng biết chuyện phần trăm năm trước." : "";
    const leaveAgain: Effect = { counters: step(c, RT), unflags: [life(RT)], custom: "job_lose", flags: ["left_home", "path_migrant", "rtn_left_again"], happy: -5 };
    if (hired) return T("Người khác đứng tên công trình của bạn",
      `Trưởng phòng mới đem dự án của bạn đi báo cáo như của mình. Bạn bị chuyển sang một phòng không có việc, ngồi đọc báo tám tiếng mỗi ngày.${f(c, "rtn_kickback") ? " Có người nhắc khéo chuyện phần trăm năm trước." : ""}`, [
      C("Viết thư lên cấp trên, kèm đủ hồ sơ", { counters: step(c, RT), bw: -4, gamble: { p: f(c, "rtn_kickback") ? 0.3 : 0.5,
        win: { flags: ["rtn_own"], income_mult: 1.2, log: "Cấp trên đọc hồ sơ. Dự án trở về tay bạn, kèm một phòng riêng." },
        lose: { income_mult: 0.85, log: "Lá thư bị chuyển ngược về chính trưởng phòng." } } }, "Đòi lại công, có thể bị dồn tiếp"),
      C("Chịu đựng, chờ thời", { counters: step(c, RT), happy: -5, income_mult: 0.9 }, "Giữ ghế, mất dần lửa"),
      C("Xin nghỉ, ra ngoài lập công ty riêng", { counters: step(c, RT), flags: ["rtn_founder", "rtn_own"], money: -0.3, agency: 0.03 }, "Mất ghế ổn định, làm chủ việc mình", { tier: "sovereign" }),
      C("Bỏ hết, ra nước ngoài lần nữa", leaveAgain, "Thoát khỏi vũng lầy, mất những gì đã gây dựng")], 1);
    return T("Công ty đứng tên người khác",
      `Lúc mở công ty, giấy tờ của bạn chưa xong nên mọi thứ đứng tên ${frN}. Giờ công ty có lãi, ${frN} muốn chia lại: bảy phần cho người đứng tên, ba phần cho bạn.${old}`, [
      C("Kiện ra tòa", { counters: step(c, RT), money: -0.3, ...(fr ? { memory: { npc: fr, tag: "HUMILIATED_ME" as const, weight: -0.3, note: "vụ kiện chia lại công ty" } } : {}), gamble: { p: f(c, "rtn_kickback") ? 0.3 : 0.5,
        win: { flags: ["rtn_own"], log: "Tòa công nhận phần vốn của bạn. Hai người không còn chào nhau." },
        lose: { income_mult: 0.7, log: "Giấy tờ đứng tên người ấy. Bạn thua, mất cả án phí." } } }, "Tốn tiền, có thể đòi lại, mất một người bạn"),
      C("Mua lại phần của người ấy, giá cao", { counters: step(c, RT), money: -0.6, flags: ["rtn_own"], ...(fr ? { memory: { npc: fr, tag: "WIN_WIN_DEAL" as const, weight: 0.2, note: "cuộc mua lại công ty êm thấm" } } : {}) }, "Mất nhiều tiền, giữ công ty và hòa khí"),
      C("Bỏ hết, ra nước ngoài lần nữa", leaveAgain, "Thoát khỏi vũng lầy, mất những gì đã gây dựng")], 1, fr ? { npc: fr } : {});
  }, adult),

  beat(RT, 4, 5, (c) => {
    const kick = f(c, "rtn_kickback") && !f(c, "rtn_clean_name");
    const up = f(c, "rtn_own") || f(c, "rtn_clean_name") || f(c, "rtn_contract") || n(c, "rtn_net") >= 2;
    if (kick) return T("Đoàn thanh tra",
      "Đoàn thanh tra đến làm việc về những hợp đồng năm năm trước. Người từng nhận phần trăm đã khai tên bạn để được giảm nhẹ. Luật sư nói nếu bạn chủ động khai báo thì có thể chỉ bị phạt tiền.", [
      C("Chủ động khai báo, nộp phạt", { counters: step(c, RT, { honest: 2 }), money: -0.8, unflags: ["rtn_kickback"], flags: ["rtn_confessed"], happy: 3 }, "Mất nhiều tiền, ngủ được"),
      C("Thuê người \"lo\" cho êm", { counters: step(c, RT), money: -0.5, secret: { tag: "PAID_BRIBE", severity: 0.6, fuse_years: [2, 8], note: "lo lót cho vụ thanh tra" }, gamble: { p: 0.5,
        win: { log: "Hồ sơ được khép lại." },
        lose: { income_mult: 0.5, close_doors: ["clean_record"], log: "Người \"lo\" bị bắt trước. Tên bạn có trong sổ của người đó." } } }, "Có thể êm, có thể sâu thêm"),
      C("Bỏ hết, ra nước ngoài", { counters: step(c, RT), unflags: [life(RT)], custom: "job_lose", flags: ["path_migrant", "left_home", "rtn_left_again"], close_doors: ["return_home"] }, "Thoát thân, khó về lại")], 0);
    if (up) return T("Lời đề nghị mua lại",
      `Mười năm sau ngày về, ${f(c, "rtn_hired") && !f(c, "rtn_founder") ? "mô hình bạn dựng trong cơ quan đã tách thành một công ty riêng do bạn điều hành" : "công ty của bạn"} có năm mươi nhân viên ở bốn tỉnh. Một tập đoàn nước ngoài muốn mua lại với giá bằng hai mươi năm lương cũ của bạn ở xứ người.${n(c, "rtn_net") >= 2 ? " Những người bạn gặp năm đầu giờ là khách hàng, là đối tác." : ""}`, [
      C("Bán, nhận tiền", { counters: step(c, RT), money: 2.5, flags: ["rtn_sold"], rel: -2 }, "Giàu một lần, công ty thành của người khác"),
      C("Không bán, chia cổ phần cho nhân viên", { counters: step(c, RT), flags: ["rtn_coop"], income_mult: 1.15, agency: 0.03, rel: 5 }, "Ít tiền hơn, người làm thành người chủ", { tier: "sovereign" }),
      C("Vay thêm để mở rộng", { counters: step(c, RT), custom: "borrow:1", gamble: { p: 0.5,
        win: { income_mult: 1.6, log: "Hai năm sau, công ty có mặt ở mười tỉnh." },
        lose: { income_mult: 0.7, log: "Mở rộng quá nhanh. Bạn đóng bớt sáu chi nhánh để trả nợ." } } }, "Lớn hơn hoặc ngập nợ")], 1);
    return T("Tấm biển sắp hạ",
      "Năm thứ mười. Việc bạn làm vẫn sống nhưng chưa bao giờ khá lên; tiền dành dụm mang về đã hết. Một người quen ở nước ngoài nhắn: bên này đang cần người như bạn, lương gấp bốn.", [
      C("Đi lần nữa", { counters: step(c, RT), unflags: [life(RT)], custom: "job_lose", flags: ["path_migrant", "left_home", "rtn_left_again"], rel: -3 }, "Thu nhập lại cao, quê lại xa"),
      C("Ở lại, thu nhỏ cho vừa sức", { counters: step(c, RT), flags: ["rtn_small"], income_mult: 0.85, happy: 3 }, "Ít tiền, sống được ở nơi mình chọn"),
      C("Giao lại cho người trẻ hơn, mình làm cố vấn", { counters: step(c, RT), flags: ["rtn_handed_over"], income_mult: 0.9, agency: 0.02, rel: 3 }, "Buông quyền, việc có thể sống lâu hơn bạn", { tier: "sovereign" })], 1);
  }, adult),

  beat(RT, 5, 6, (c) => T("Người đi sau",
    `${f(c, "rtn_sold") ? "Từ khi bán công ty, bạn có thời gian và tiền." : f(c, "rtn_confessed") ? "Chuyện thanh tra năm ấy ai cũng biết, và bạn chưa từng chối." : "Sáng nào bạn vẫn đi làm."} Mỗi tháng có vài người trẻ vừa về nước xin gặp, hỏi nên về hay nên ở. Một tờ báo muốn viết về bạn như một \"người trở về thành công\".`, [
    C("Mở lớp miễn phí cho người mới về", { counters: step(c, RT), flags: ["rtn_mentor", "passed_on"], rel: 4, bw: -3 }, "Tốn thời gian, người sau bớt vấp"),
    C("Nhận phỏng vấn, kể cả những lần thất bại", { counters: step(c, RT), flags: ["rtn_told_all"], agency: 0.02, gamble: { p: 0.6,
      win: { rel: 4, log: "Bài báo được chia sẻ nhiều nhất là đoạn bạn kể về lần thất bại." },
      lose: { happy: -3, log: "Tờ báo cắt hết đoạn thất bại, chỉ giữ lại câu chuyện đẹp." } } }, "Thật, có thể bị cắt xén", { tier: "sovereign" }),
    C("Từ chối hết, sống cho mình", { counters: step(c, RT), happy: 3 }, "Yên thân, kinh nghiệm đi theo bạn")], 0), (c) => c.age >= 45),

  /* ---------- chuyện thường ngày ---------- */
  daily(RT, "rtn_accent", [25, 75], 7, (c) => T("Giọng lơ lớ", vary("rtna", c.age, [
    "Đứa cháu nhại lại giọng bạn nói, cả nhà cười. Bạn không biết mình nói lạ từ lúc nào.",
    "Trong cuộc họp, bạn chen một chữ nước ngoài vì không nhớ ra chữ quê mình. Có người nhếch mép."]), [
    C("Cười theo, tập nói lại", { counters: { rtn_roots: 1 }, happy: 1 }, "Hòa vào, mất một chút của những năm xa"),
    C("Thấy tủi, nói ít đi", { happy: -3, rel: -1 }),
    C("Nhận mình là người của hai thứ tiếng", { flags: ["rtn_bilingual_pride"], agency: 0.01, happy: 2 }, "Thoải mái với mình, có người thấy kiêu")], 0)),

  daily(RT, "rtn_rich", [25, 70], 8, (c, N) => { const s = role(c, "neighbor")!;
    return T("Ai cũng nghĩ bạn giàu", `${N(s)} ở xóm cũ hỏi vay một khoản để mua đất, nói "bên đó về chắc nhiều tiền lắm". Tiền của bạn đang nằm cả trong công việc.`, [
      C("Cho vay", { money: -0.3, trust: { npc: s, delta: 0.2 } }, "Giữ tình làng xóm, có thể mất tiền"),
      C("Từ chối, nói thật về tiền của mình", { trust: { npc: s, delta: -0.15 }, counters: { honest: 1 } }, "Mất lòng, khỏi bị hiểu nhầm mãi"),
      C("Cho vay một nửa, viết giấy rõ ràng", { money: -0.15, gamble: { p: 0.6,
        win: { trust: { npc: s, delta: 0.15 }, money: 0.15, log: "Đúng hẹn, người ấy trả đủ, kèm một bao gạo mới." },
        lose: { trust: { npc: s, delta: -0.2 }, log: "Người ấy thấy bị coi thường vì tờ giấy, và chậm trả." } } }, "Giúp có giới hạn, có thể mất lòng", { tier: "awakened" })], 0, { npc: s }); }, (c) => !!role(c, "neighbor")),

  daily(RT, "rtn_late", [25, 70], 8, () => T("Cuộc họp chỉ mình bạn đúng giờ",
    "Cuộc họp hẹn tám giờ. Tám giờ bốn mươi người cuối cùng mới đến, cười xòa. Ở bên kia, bạn từng bị nhắc nhở vì đến muộn hai phút.", [
    C("Quen dần, đến muộn như mọi người", { happy: 2, counters: { rtn_roots: 1 } }, "Đỡ bực, mất một thói quen tốt"),
    C("Bực, nói thẳng trong cuộc họp", { rel: -3, gamble: { p: 0.4, win: { log: "Tuần sau mọi người đến sớm hơn mười phút." }, lose: { log: "Người ta bảo bạn \"đi Tây về khó tính\"." } } }),
    C("Đặt luật cho nhóm mình: ai muộn thì góp quỹ ăn chung", { flags: ["rtn_rules"], agency: 0.01, rel: 2 }, "Phải giữ luật trước, nhóm dần thành nếp", { tier: "sovereign" })], 0)),

  daily(RT, "rtn_pay", [25, 65], 9, () => T("Hai bảng lương",
    "Bạn được trả gấp ba người làm cùng việc, chỉ vì tấm bằng nước ngoài. Một đồng nghiệp giỏi hơn bạn ở nhiều việc biết chuyện, từ đó không ngồi ăn trưa cùng bạn nữa.", [
    C("Coi như chuyện thị trường", { money: 0.05, rel: -2, counters: { honest: -1 } }),
    C("Mời người ấy đi ăn, nói chuyện thẳng", { rel: 2, counters: { rtn_net: 1 } }, "Mất một bữa trưa, có thể thêm một người bạn"),
    C("Đề nghị xét lại lương cho người ấy", { agency: 0.02, gamble: { p: 0.5,
      win: { rel: 4, flags: ["rtn_fair_pay"], log: "Người ấy được tăng lương. Tuần sau, hai người lại ăn trưa cùng nhau." },
      lose: { rel: -1, log: "Cấp trên bảo bạn đừng xen vào chuyện lương của người khác." } } }, "Đúng lẽ, có thể bị coi là lắm chuyện", { tier: "sovereign" })], 1)),

  daily(RT, "rtn_school", [25, 60], 9, () => T("Lớp năm mươi học sinh",
    "Con bạn lớn lên ở nước ngoài, giờ ngồi trong một lớp năm mươi học sinh, chép bài từ bảng và không dám hỏi. Trường quốc tế gần nhà thì học phí bằng nửa thu nhập của bạn.", [
    C("Chuyển con sang trường quốc tế", { money: -0.5, happy: 2, flags: ["rtn_intl_school"] }, "Con dễ thở, nhà căng tiền"),
    C("Để con học trường công, kèm thêm buổi tối", { bw: -4, counters: { rtn_roots: 1 } }, "Đỡ tiền, con và bạn cùng vất vả"),
    C("Lập nhóm phụ huynh cùng cảnh, thuê giáo viên chung", { flags: ["rtn_parent_group", "leader"], agency: 0.02, money: -0.1 }, "Mất công tổ chức, nhiều nhà cùng đỡ", { tier: "sovereign" })], 1), (c) => c.kids_alive > 0),

  daily(RT, "rtn_spouse", [25, 70], 9, (c, N) => { const s = role(c, "spouse")!;
    return T("Người theo bạn về", `${N(s)} theo bạn về đây, chưa nói được tiếng, chưa có việc, cả ngày chờ bạn đi làm về. Tối qua người ấy hỏi: ở đây, tôi là ai?`, [
      C("Dành mỗi tối dạy tiếng cho người ấy", { trust: { npc: s, delta: 0.2 }, bw: -4 }, "Mệt thêm, hai người bớt lạc nhau"),
      C("Tìm cho người ấy một việc dùng được tiếng mẹ đẻ", { gamble: { p: 0.55,
        win: { trust: { npc: s, delta: 0.3 }, log: "Người ấy được nhận dạy ở một trung tâm ngoại ngữ, về nhà kể chuyện cả buổi." },
        lose: { trust: { npc: s, delta: -0.05 }, log: "Nơi nào cũng đòi giấy phép lao động người ấy chưa có." } } }, "Có thể mở đường, có thể thêm thất vọng", { tier: "awakened" }),
      C("Bảo người ấy cứ từ từ rồi quen", { trust: { npc: s, delta: -0.1 }, happy: -1 })], 0, { npc: s }); }, (c) => c.married && !!role(c, "spouse")),

  daily(RT, "rtn_friend", [25, 75], 99, (c, N) => { const fr = role(c, "childhood_friend")!;
    return T("Người bạn cùng bàn", `Gặp lại ${N(fr)}, người bạn cùng bàn năm xưa. ${N(fr)} vẫn ở quê, làm ba việc một lúc để nuôi con. Hai người ngồi uống nước, ${N(fr)} cứ xưng hô khách sáo như với người lạ.`, [
      C("Kể thật về những năm khó ở xứ người", { trust: { npc: fr, delta: 0.2 }, rel: 2 }, "Phải hạ mình, được lại một người bạn"),
      C("Trả tiền nước rồi về", { trust: { npc: fr, delta: -0.1 } }),
      C("Rủ về quê cùng nhau làm một việc nhỏ", { gamble: { p: 0.45,
        win: { trust: { npc: fr, delta: 0.3 }, flags: ["rtn_village_project"], log: "Hai người mở một xưởng nhỏ ở quê, thuê sáu người trong xóm." },
        lose: { trust: { npc: fr, delta: -0.05 }, money: -0.1, log: "Việc không thành. Hai người vẫn hẹn nhau mỗi Tết." } } }, "Có thể nối lại, có thể mất tiền", { tier: "awakened" })], 0, { npc: fr }); }, (c) => !!role(c, "childhood_friend")),

  daily(RT, "rtn_miss", [25, 75], 8, (c) => T("Nỗi nhớ ngược chiều", vary("rtnm", c.age, [
    "Bạn thèm một thứ bánh ở con phố cũ bên kia, thứ ở đây không ai làm.",
    "Có những buổi sáng bạn nhớ cái im lặng của thành phố bên kia, nhớ đến mức không nói được với ai."]), [
    C("Mua vé đi thăm lại", { money: -0.15, happy: 5, flags: ["rtn_visit_back"] }, "Hết một khoản, lòng nhẹ được một mùa"),
    C("Tự làm thử, mời hàng xóm cùng ăn", { counters: { rtn_roots: 1 }, happy: 2, rel: 2 }, "Mất công, đem một mảnh bên kia về đây"),
    C("Cất nỗi nhớ đi, lo việc trước mắt", { happy: -2, bw: 1 })], 1)),

  daily(RT, "rtn_credit", [25, 65], 9, () => T("Mười năm không có trong sổ",
    "Ngân hàng từ chối cho bạn vay: mười năm ở nước ngoài, bạn không có lịch sử tín dụng ở đây. Hồ sơ thuế, bảo hiểm, giấy xác nhận cư trú đều phải làm lại từ đầu.", [
    C("Kiên nhẫn làm lại từng giấy", { bw: -5, counters: { honest: 1 } }, "Mất nhiều tháng, hồ sơ sạch"),
    C("Thế chấp căn hộ còn giữ bên kia", { money: 0.3, flags: ["rtn_collateral_abroad"], bw: -2 }, "Có vốn, sợi dây với bên kia buộc chặt thêm"),
    C("Vay người thân trong họ", { money: 0.2, flags: ["rtn_family_loan"], rel: -2 }, "Nhanh, nợ cả tiền lẫn tình")], 0)),

  daily(RT, "rtn_land", [28, 75], 99, (c, N) => { const s = role(c, "sibling")!;
    return T("Phần đất của người đi xa", `Bố mẹ chia đất. ${N(s)} nói bạn đi xa bao năm, người ở nhà chăm bố mẹ là ${N(s)}, nên phần của bạn "coi như đã nhận bằng những năm được đi".`, [
      C("Đòi đúng phần của mình", { money: 0.4, trust: { npc: s, delta: -0.3 } }, "Có đất, mất anh em"),
      C("Nhường phần cho người đã ở nhà", { trust: { npc: s, delta: 0.3 }, happy: 2 }, "Mất đất, giữ được nhà"),
      C("Đề nghị góp đất chung làm vườn, chia lãi", { agency: 0.02, gamble: { p: 0.5,
        win: { trust: { npc: s, delta: 0.25 }, money: 0.1, flags: ["rtn_family_land"], log: "Mảnh vườn chung cho thu hoạch đầu tiên. Cả nhà ăn cơm ngoài vườn." },
        lose: { trust: { npc: s, delta: -0.1 }, log: "Không ai chịu đứng ra lo. Đất vẫn bỏ không." } } }, "Không ai mất phần, cần cả nhà cùng giữ", { tier: "sovereign" })], 0, { npc: s }); }, (c) => !!role(c, "sibling")),

  /* ---------- gia đình ---------- */
  cross(RT, "rtn_family", [30, 75], (c) => (c.kids_teen > 0 && !!role(c, "child")) || !!parentOf(c), (c, N) => {
    const p = parentOf(c);
    const k = c.kids_teen > 0 || !p ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} muốn quay lại bên kia`,
      `${N(k)} lớn lên ở bên kia những năm đầu đời. Giờ đã tuổi mười mấy, ${N(k)} muốn quay lại đó học đại học, nói ở đây không có chỗ cho mình. Bạn biết cảm giác ấy, chỉ là theo chiều ngược lại.`, [
      C("Ủng hộ, lo hồ sơ cho con", { trust: { npc: k, delta: 0.25 }, money: -0.2 }, "Con được chọn, nhà lại có người đi xa"),
      C("Giữ con ở lại, học xong trong nước", { trust: { npc: k, delta: -0.2 } }, "Gần con, con mang một nỗi ấm ức"),
      C("Cho con đi một mùa hè trước rồi quyết", { trust: { npc: k, delta: 0.1 }, promise: { to: k, what: "cho con quay lại bên kia nếu sau mùa hè vẫn muốn", years: 2 } }, "Chậm quyết, con tự thấy mình cần gì", { tier: "awakened" })], 2, { npc: k });
    const q = p!;
    return T(`${N(q)} kể với họ hàng`,
      `${N(q)} kể với họ hàng rằng bạn về vì "bên đó làm ăn không được". ${f(c, "rtn_for_parents") ? `Bạn về vì ${N(q)}, nhưng chưa bao giờ nói ra.` : "Bạn chưa từng giải thích vì sao mình về."}`, [
      C(`Nói với ${N(q)} lý do thật`, { trust: { npc: q, delta: 0.25 }, bw: -2 }, "Khó mở lời, bố mẹ hiểu con hơn"),
      C("Để mọi người nghĩ gì thì nghĩ", { happy: -2, flags: ["rtn_misread"] }),
      C("Mời cả họ đến xem nơi bạn làm việc", { money: -0.05, gamble: { p: 0.6,
        win: { trust: { npc: q, delta: 0.2 }, rel: 3, log: `${N(q)} đi một vòng, về đến nhà thì khoe với hàng xóm.` },
        lose: { rel: -1, log: "Người ta đến, ăn, rồi về. Không ai hỏi bạn làm gì." } } }, "Tốn một bữa, có thể đổi cách nhìn")], 0, { npc: q });
  }),
];

/* =====================================================================================
 * 4. GIÚP VIỆC Ở NƯỚC NGOÀI (domestic_abroad) — tiền tố dwa_
 *    Bộ đếm: dwa_saved (tiền để dành đứng tên mình), dwa_sent (tiền gửi về), dwa_friends.
 *    Cờ: dwa_licensed / dwa_informal (cách bước vào), dwa_passport_held, dwa_kept_passport, dwa_hotline,
 *    dwa_course, dwa_cleared, dwa_new_employer — b2..b4 đọc lại. Bạo hành chỉ kể bằng hậu quả, không tả chi tiết.
 * =================================================================================== */
const DW = "domestic_abroad";
const poorish = (c: FactContext): boolean => c.poor_country || c.family_wealth < 0.4 || c.broke || f(c, "origin_poor_rural");

const DWA: Storylet[] = [
  /* ---------- cơ hội bước vào (không có năng khiếu: 3 cửa) ---------- */
  door(DW, "dwa_d_agency", [20, 40], poorish, () => T("Văn phòng tuyển người giúp việc",
    "Tấm biển trước văn phòng tuyển dụng: \"Giúp việc gia đình ở nước ngoài, lương gấp sáu ở quê, bao ăn ở.\" Phí môi giới trừ dần vào lương tám tháng đầu. Trước khi đi phải học ba tháng ở trung tâm: nấu ăn, dùng máy giặt, vài trăm câu tiếng.", [
    C("Ký, chịu trừ lương tám tháng", { ...become(DW), counters: { doors_seen: 1 }, flags: ["dwa_fee_debt"], rel: -4 }, "Không mất tiền trước, tám tháng làm không công"),
    C("Kiểm tra giấy phép công ty trước khi ký", { counters: { doors_seen: 1 }, bw: -2, gamble: { p: 0.6,
      win: { ...become(DW), flags: ["dwa_licensed"], log: "Công ty có giấy phép. Hợp đồng ghi rõ mỗi tuần một ngày nghỉ, và không ai được giữ hộ chiếu của bạn." },
      lose: { know: 2, log: "Công ty không có tên trong danh sách được cấp phép. Bạn thoát khỏi một cái bẫy." } } }, "Mất vài tuần, biết mình đang ký gì", { tier: "awakened" }),
    C("Ở lại quê", { counters: { doors_seen: 1 }, money: -0.02 })], 2)),

  door(DW, "dwa_d_cousin", [18, 40], () => true, () => T("Lời rủ của người chị họ",
    "Người chị họ làm giúp việc ở nước ngoài đã bảy năm, về quê xây được nhà hai tầng. Chị nói người quen của chủ chị đang cần người trông hai đứa nhỏ, không qua công ty, khỏi mất phí. Chỉ có điều phải đi bằng thị thực du lịch rồi \"tính sau\".", [
    C("Đi theo lời chị, tính sau", { ...become(DW), counters: { doors_seen: 1 }, flags: ["dwa_informal", "undocumented"], money: 0.05 }, "Không mất phí, không có giấy phép lao động"),
    C("Nhờ chị hỏi chủ làm thị thực lao động đàng hoàng", { counters: { doors_seen: 1 }, gamble: { p: 0.45,
      win: { ...become(DW), flags: ["dwa_proper"], log: "Chủ đồng ý làm giấy tờ. Bạn chờ bốn tháng, đi bằng thị thực lao động." },
      lose: { happy: -2, log: "Chủ nói làm giấy tờ phiền quá, đã tìm người khác." } } }, "Chậm, có thể mất chỗ, đi đường đàng hoàng", { tier: "awakened" }),
    C("Cảm ơn chị, không đi", { counters: { doors_seen: 1 } })], 2)),

  door(DW, "dwa_d_debt", [22, 45], (c) => c.debt_ratio > 0.3 || c.broke || c.scarcity || c.parent_sick, (c) => T("Khoản nợ và một tấm vé",
    `${c.parent_sick ? "Tiền thuốc cho bố mẹ" : "Khoản nợ của nhà"} đã lớn hơn những gì bạn kiếm được ở đây trong mười năm. Một công ty tuyển người đi giúp việc ở nước ngoài nhận cả người có gia đình, chỉ cần ${c.kids_alive > 0 ? "để con lại cho ông bà nuôi" : "khỏe mạnh và chịu được xa nhà"}. Hợp đồng hai năm.`, [
    C(c.kids_alive > 0 ? "Đi, gửi con lại cho ông bà" : "Đi, hai năm thôi", { ...become(DW), counters: { doors_seen: 1 }, flags: [c.kids_alive > 0 ? "dwa_left_kids" : "dwa_for_debt"], rel: -6, happy: -4 }, "Trả được nợ, mất những năm ở bên nhà"),
    C("Ở lại, xin khoanh nợ", { counters: { doors_seen: 1 }, custom: "restructure", happy: -2, bw: -3 }, "Ở gần nhà, nợ kéo dài"),
    C("Ở lại, cả nhà làm thêm nghề phụ", { counters: { doors_seen: 1, save: 1 }, health: -3, money: 0.05 }, "Vất vả, không ai phải đi")], 1)),

  /* ---------- mạch truyện ---------- */
  beat(DW, 1, 1, (c) => T("Căn phòng sau bếp",
    `Phòng của bạn là kho chứa đồ sau bếp, kê vừa một tấm nệm. Ngày đầu tiên, bà chủ xin giữ hộ chiếu "cho khỏi mất".${f(c, "dwa_licensed") ? " Bạn nhớ hợp đồng ghi rõ: không ai được giữ hộ chiếu của bạn." : ""} Bà cũng nói ba tháng đầu chưa có ngày nghỉ, để "quen việc".`, [
    C("Đưa hộ chiếu, làm cho êm", { counters: step(c, DW), flags: ["dwa_passport_held"], money: 0.03 }, "Êm chuyện, giấy tờ không còn trong tay"),
    C("Xin giữ hộ chiếu, nói luật cho phép", { counters: step(c, DW), gamble: { p: f(c, "dwa_licensed") ? 0.75 : 0.45,
      win: { flags: ["dwa_kept_passport"], agency: 0.02, log: "Bà chủ nhìn bạn một lúc rồi trả lại. Từ đó bà nói chuyện với bạn khác đi." },
      lose: { flags: ["dwa_passport_held"], happy: -4, log: "Bà chủ lạnh nhạt cả tháng. Cuốn hộ chiếu vẫn nằm trong két." } } }, "Giữ được quyền, có thể mất lòng từ đầu"),
    C("Lưu số đường dây nóng của đại sứ quán", { counters: step(c, DW), flags: ["dwa_hotline", "dwa_passport_held"], know: 2 }, "Đưa giấy tờ, giữ một sợi dây cứu", { tier: "awakened" })], 0)),

  beat(DW, 2, 3, (c) => T(c.sex === "F" ? "Đứa trẻ gọi bạn là mẹ" : "Đứa trẻ không chịu rời bạn",
    `Ba năm, bạn là người cho đứa nhỏ nhà chủ ăn, đưa nó đi học, dỗ nó ngủ. Nó khóc mỗi lần bạn ra ngoài ngày nghỉ.${c.kids_alive > 0 ? " Còn con bạn ở quê, lần gọi video gần nhất, nó đưa máy cho bà rồi chạy đi chơi." : ""} Hợp đồng sắp hết. Chủ muốn bạn ký thêm hai năm, tăng lương một ít.`, [
    C("Ký thêm hai năm", { counters: step(c, DW, { dwa_saved: 1 }), income_mult: 1.15, rel: -3, flags: ["dwa_renewed"] }, "Thêm tiền, thêm hai năm xa nhà"),
    C("Đòi ngày nghỉ hằng tuần và tiền học một khóa nghề", { counters: step(c, DW), agency: 0.02, gamble: { p: f(c, "dwa_kept_passport") ? 0.65 : 0.45,
      win: { flags: ["dwa_renewed", "dwa_course"], income_mult: 1.1, know: 4, log: "Chủ đồng ý. Chủ nhật nào bạn cũng đi học, cuối năm cầm về một chứng chỉ chăm sóc người già." },
      lose: { flags: ["dwa_seeking"], happy: -3, log: "Chủ nói bạn được nước lấn tới. Bạn có hai tuần để tìm chủ mới." } } }, "Đổi điều kiện, có thể mất chủ", { tier: "sovereign" }),
    C("Hết hợp đồng thì về", { counters: step(c, DW), ...goHome(DW), flags: ["dwa_back"], rel: 5 }, "Về với nhà, tiền chưa đủ")], 0)),

  beat(DW, 3, 4, (c) => T("Chiếc vòng biến mất",
    `Bà chủ mất một chiếc vòng vàng. Cả nhà nhìn bạn. Bà nói sẽ báo cảnh sát nếu bạn không nhận, và giữ bốn tháng lương "cho đến khi tìm ra".${f(c, "dwa_passport_held") ? " Hộ chiếu của bạn vẫn nằm trong két của ông chủ." : ""}${f(c, "dwa_informal") ? " Bạn không có giấy phép lao động; gặp cảnh sát là có thể bị trục xuất." : ""}`, [
    C("Nhận bừa cho yên chuyện", { counters: step(c, DW), money: -0.3, happy: -8, flags: ["dwa_false_blame"] }, "Giữ chỗ làm, mang tiếng oan"),
    C("Đến nhà tạm lánh cho người lao động", { counters: step(c, DW), bw: -6, gamble: { p: f(c, "dwa_hotline") ? 0.65 : 0.45,
      win: { flags: ["dwa_shelter", "dwa_new_employer"], log: "Văn phòng hỗ trợ giúp bạn đòi lại lương và chuyển sang chủ mới." },
      lose: { ...goHome(DW), flags: ["dwa_back"], money: -0.15, log: "Vụ việc kéo dài tám tháng. Bạn về nước, nhận lại được một nửa tiền lương." } } }, "Rời chỗ không an toàn, có thể phải về"),
    C("Bình tĩnh đề nghị chính bà gọi cảnh sát điều tra", { counters: step(c, DW), agency: 0.03, gamble: { p: f(c, "dwa_informal") ? 0.3 : 0.55,
      win: { flags: ["dwa_cleared"], log: "Chiếc vòng được tìm thấy trong túi áo khoác của chính bà chủ. Bà xin lỗi, trả đủ lương." },
      lose: { ...goHome(DW), flags: ["dwa_back"], log: "Cuộc điều tra không kết luận được gì. Hợp đồng bị chấm dứt, bạn lên máy bay về." } } }, "Đòi sự thật, có thể mất việc", { tier: "sovereign" })], 0), adult),

  beat(DW, 4, 5, (c, N) => {
    const up = f(c, "dwa_course") || f(c, "dwa_cleared") || f(c, "dwa_new_employer") || n(c, "dwa_saved") >= 2;
    if (up) return T("Lời mời của viện dưỡng lão",
      `${f(c, "dwa_course") ? "Tấm chứng chỉ chăm sóc người già bạn học những ngày Chủ nhật" : "Những năm chăm người của bạn"} được một viện dưỡng lão để ý. Họ mời bạn làm hộ lý: có hợp đồng, có giờ giấc, lương gấp đôi.${n(c, "dwa_saved") >= 2 ? " Sổ tiết kiệm đứng tên bạn cũng đã đủ để về quê mở một tiệm nhỏ." : ""}`, [
      C("Nhận làm hộ lý ở viện dưỡng lão", { counters: step(c, DW), ...switchTo(DW, "caregiver"), flags: ["dwa_pro_carer"] }, "Một nghề có tên, vẫn xa nhà"),
      C("Về quê mở tiệm, làm chủ", { counters: step(c, DW), ...switchTo(DW, "returnee", true), flags: ["dwa_back"], money: -0.3, rel: 5 }, "Về với nhà, đặt cược vào tiền dành dụm"),
      C("Ở lại với gia đình chủ thêm vài năm", { counters: step(c, DW, { dwa_saved: 1 }), income_mult: 1.1, happy: -2 }, "Chắc ăn, chưa bước ra khỏi căn bếp")], 0);
    return T("Tiền gửi về đi đâu",
      `Bao năm gửi tiền về, bạn tưởng ở quê đã có nhà, có ruộng, có một khoản để dành. Về phép, bạn thấy ngôi nhà mới xây được một nửa${c.married ? `; ${spN(c, N)} đã vay thêm để làm ăn, rồi thua lỗ` : "; tiền đã chia cho những đám cưới, những lần ốm đau, những món nợ của người khác"}. Bạn đã ${c.age} tuổi.`, [
      C("Nói thẳng, từ nay mọi thứ đứng tên mình", { counters: step(c, DW), flags: ["dwa_own_name"], agency: 0.02, ...sT(c, -0.2) }, "Giữ phần mình, nhà căng thẳng"),
      C("Đi thêm năm năm để làm lại", { counters: step(c, DW, { dwa_saved: 1 }), health: -6, rel: -4, income_mult: 1.1 }, "Gỡ lại tiền, mất thêm năm năm"),
      C("Ở lại quê, bắt đầu từ nửa ngôi nhà", { counters: step(c, DW), ...goHome(DW), flags: ["dwa_back"], happy: 2, rel: 4 }, "Về với nhà, gần như trắng tay")], 1);
  }, adult),

  beat(DW, 5, 6, (c) => T("Chủ nhật dưới gầm cầu",
    `Mỗi Chủ nhật, hàng trăm người giúp việc trải bạt dưới gầm cầu: ăn chung, cắt tóc cho nhau, gửi tiền, khóc. Người mới đến nào cũng được chỉ đến chỗ bạn.${f(c, "dwa_shelter") ? " Bạn vẫn nhớ đêm mình phải đến nhà tạm lánh." : ""} Một tổ chức hỗ trợ lao động muốn bạn đứng tên lập hội.`, [
    C("Đứng tên lập hội, đòi ngày nghỉ cho mọi người", { counters: step(c, DW), flags: ["dwa_union", "leader"], agency: 0.03, gamble: { p: 0.6,
      win: { rel: 6, log: "Hội có ba trăm thành viên. Lần đầu tiên có người đại diện đi họp với cơ quan lao động." },
      lose: { income_mult: 0.9, log: "Chủ biết chuyện, không gia hạn hợp đồng. Hai tháng sau bạn mới tìm được chủ mới." } } }, "Đổi luật chơi, có thể mất việc", { tier: "sovereign" }),
    C("Lặng lẽ giúp từng người một", { counters: step(c, DW, { kind: 2 }), rel: 4, bw: -2 }, "Ít rủi ro, giúp được ít người"),
    C("Gói ghém về quê nghỉ ngơi", { counters: step(c, DW), ...goHome(DW), flags: ["dwa_back", "dwa_retired"], happy: 4, rel: 4 }, "Nghỉ ngơi, khép lại một đời đi xa")], 1), (c) => c.age >= 40),

  /* ---------- chuyện thường ngày ---------- */
  daily(DW, "dwa_dayoff", [18, 60], 7, (c) => T("Mười tiếng của riêng mình", vary("dwad", c.age, [
    "Ngày nghỉ đầu tiên sau ba tháng. Bạn có mười tiếng, một ít tiền lẻ và không biết đường.",
    "Chủ nhật. Bạn có mười tiếng của riêng mình trước khi phải về kịp giờ cơm tối."]), [
    C("Đi tìm chỗ người đồng hương hay gặp nhau", { counters: { dwa_friends: 1 }, happy: 4 }, "Vui, tiêu hết tiền lẻ"),
    C("Ngủ trọn một ngày", { health: 3, bw: 3 }),
    C("Đi học một lớp tiếng buổi Chủ nhật", { know: 3, counters: { dwa_lang: 1 }, bw: -2 }, "Mệt thêm, sau này nói được cho mình")], 0)),

  daily(DW, "dwa_leftovers", [18, 60], 8, () => T("Phần cơm thừa",
    "Bạn ăn sau cùng, phần thừa của cả nhà. Hôm nào có khách, chỉ còn nồi cơm trắng. Hợp đồng ghi chủ phải lo đủ ba bữa.", [
    C("Tự bỏ tiền mua đồ ăn", { money: -0.04, health: 2 }),
    C("Lịch sự đưa hợp đồng ra hỏi", { gamble: { p: 0.55,
      win: { health: 3, flags: ["dwa_food_ok"], log: "Bà chủ không nói gì. Từ hôm sau có một phần riêng để trong tủ lạnh." },
      lose: { happy: -3, log: "Bà chủ nói: ở quê chắc còn ăn kém hơn." } } }, "Đòi đúng quyền, có thể bị khinh", { tier: "awakened" }),
    C("Chịu đói, gửi hết tiền về", { health: -4, counters: { dwa_sent: 1 } }, "Nhà đủ, bạn gầy đi")], 0)),

  daily(DW, "dwa_remit", [18, 60], 7, (c) => T("Ngày gửi tiền về", vary("dwar", c.age, [
    "Ngày nhận lương, quầy chuyển tiền đông nghẹt. Ở nhà nhắn tháng này cần gửi thêm. Bạn chưa để ra được đồng nào cho mình.",
    "Tỷ giá hôm nay tốt. Ở nhà nhắn muốn mua thêm chiếc xe máy. Sổ tiết kiệm đứng tên bạn vẫn trống."]), [
    C("Gửi về hết", { money: -0.1, rel: 3, counters: { dwa_sent: 1 } }, "Nhà vui, bạn không có gì phòng thân"),
    C("Giữ lại hai phần mười, gửi sổ đứng tên mình", { counters: { dwa_saved: 1 }, rel: -2 }, "Có của để dành, nhà thấy bạn tính toán"),
    C("Gửi về kèm một bảng chi tiêu để cả nhà cùng xem", { counters: { dwa_sent: 1 }, flags: ["dwa_ledger"], agency: 0.01, money: -0.08 }, "Rõ ràng, có người thấy bị kiểm soát", { tier: "awakened" })], 1)),

  daily(DW, "dwa_phone", [18, 60], 8, (c) => T("Chiếc điện thoại bị thu",
    `Chủ ra quy định mới: điện thoại nộp lại lúc tám giờ sáng, mười giờ đêm mới trả. ${c.kids_alive > 0 ? "Con bạn ở quê chỉ thức được đến chín giờ." : "Ở quê, mẹ bạn chỉ gọi được vào giờ trưa."}`, [
    C("Chấp nhận, gọi về lúc nửa đêm", { health: -2, rel: -1, bw: -3 }),
    C("Xin giữ máy, hứa không dùng trong giờ làm", { gamble: { p: 0.5,
      win: { flags: ["dwa_phone_ok"], happy: 3, log: "Chủ đồng ý thử một tháng, rồi thôi không nhắc nữa." },
      lose: { happy: -2, log: "Chủ nói quy định là quy định." } } }, "Có thể được, có thể bị để ý"),
    C("Mua một máy cũ giấu trong phòng", { money: -0.02, flags: ["dwa_hidden_phone"], gamble: { p: 0.7,
      win: { rel: 2, log: "Đêm nào bạn cũng nghe được giọng ở nhà trước khi ngủ." },
      lose: { money: -0.05, happy: -5, log: "Bà chủ tìm thấy, trừ một tuần lương." } } }, "Giữ liên lạc, sống trong lo sợ")], 0)),

  daily(DW, "dwa_fever", [18, 60], 8, () => T("Cơn sốt ba ngày",
    "Bạn sốt ba ngày, vẫn dậy lúc năm giờ nấu bữa sáng. Chủ đưa hai viên thuốc hạ sốt, nói muốn đi khám thì tự trả tiền và xin nghỉ nửa ngày.", [
    C("Uống thuốc, làm tiếp", { health: -6, money: 0.02 }),
    C("Tự trả tiền đi khám", { money: -0.04, health: 4 }),
    C("Gọi đường dây hỗ trợ hỏi về bảo hiểm của mình", { know: 2, gamble: { p: 0.6,
      win: { health: 5, flags: ["dwa_knows_insurance"], log: "Hợp đồng có bảo hiểm y tế; chủ phải đưa bạn đi khám." },
      lose: { health: -2, log: "Đường dây bận suốt hai ngày. Cơn sốt tự lui." } } }, "Mất công hỏi, lần sau biết quyền mình", { tier: "awakened" })], 0)),

  daily(DW, "dwa_lender", [18, 60], 9, () => T("Khoản vay mười phút",
    "Một ứng dụng cho vay nhắn tin cho người giúp việc: không cần giấy tờ, tiền về sau mười phút. Ở quê đang cần tiền sửa mái nhà trước mùa mưa.", [
    C("Vay cho kịp", { custom: "borrow:0.2", flags: ["dwa_app_loan"], bw: -3 }, "Nhà kịp sửa, lãi đuổi theo bạn"),
    C("Không vay, khất với nhà", { rel: -2, counters: { save: 1 } }),
    C("Rủ nhóm đồng hương lập quỹ góp xoay vòng", { counters: { dwa_friends: 1 }, gamble: { p: 0.65,
      win: { money: 0.1, flags: ["dwa_rotating_fund"], log: "Mười hai người góp, mỗi tháng một người nhận. Không ai phải vay lãi nữa." },
      lose: { money: -0.05, log: "Một người nhận xong thì nghỉ góp. Quỹ tan sau năm tháng." } } }, "Cần tin nhau, không ai phải trả lãi", { tier: "sovereign" })], 1)),

  daily(DW, "dwa_grandma", [18, 65], 9, () => T("Bà cụ trong căn phòng cuối",
    "Mẹ của ông chủ lẫn dần, đêm nào cũng gọi bạn bằng tên đứa con gái đã mất của bà. Trong nhà không ai còn kiên nhẫn ngồi nghe bà kể chuyện, trừ bạn. Chăm bà là thêm sáu tiếng mỗi ngày không có trong hợp đồng.", [
    C("Ngồi với bà mỗi tối", { counters: { kind: 2 }, health: -2, happy: 2 }, "Mệt, có người cần mình"),
    C("Xin thêm lương cho phần việc này", { gamble: { p: 0.5,
      win: { income_mult: 1.1, flags: ["dwa_paid_care"], log: "Ông chủ đồng ý, có vẻ ngượng vì đã không nghĩ đến trước." },
      lose: { happy: -2, log: "Chủ nói chăm bà là việc trong nhà, ai cũng phải làm." } } }, "Đúng công, có thể mất lòng"),
    C("Chỉ làm đúng việc trong hợp đồng", { bw: 3, happy: -1 })], 0)),

  daily(DW, "dwa_knock", [18, 60], 9, () => T("Tiếng gõ cửa sau lúc nửa đêm",
    "Nửa đêm, một người quen cùng quê gõ cửa sau, chỉ mang theo một túi ni lông, nói không dám quay về nhà chủ. Nhà chủ của người ấy ở ngay khu bên. Chủ bạn mà biết thì bạn có thể mất việc.", [
    C("Cho ngủ nhờ một đêm", { counters: { kind: 1, dwa_friends: 1 }, gamble: { p: 0.7,
      win: { log: "Sáng sớm người ấy đi, để lại một mẩu giấy cảm ơn." },
      lose: { income_mult: 0.9, log: "Chủ phát hiện, trừ lương và cấm bạn ra ngoài ngày nghỉ một tháng." } } }, "Cứu người, liều chỗ làm"),
    C("Đưa số đường dây hỗ trợ và tiền đi xe", { money: -0.02, counters: { dwa_friends: 1 } }, "Giúp được một phần, an toàn cho mình"),
    C("Không mở cửa", { happy: -5 })], 1)),

  daily(DW, "dwa_holiday", [18, 60], 9, () => T("Đi theo chủ đi nghỉ",
    "Cả nhà chủ đi nghỉ ở một khu biển và mang bạn theo. Họ nghỉ; bạn trông hai đứa nhỏ từ sáu giờ sáng đến nửa đêm trong một phòng khách sạn. Ở quê, ai xem ảnh cũng tưởng bạn đi du lịch.", [
    C("Đăng ảnh, để mọi người tưởng vậy", { rel: 1, happy: 1, flags: ["dwa_postcard_life"] }, "Nhà yên tâm, không ai hiểu bạn"),
    C("Kể thật với nhà về một ngày làm việc", { rel: -1, happy: 2, flags: ["dwa_told_truth"] }, "Nhà lo, bạn bớt cô đơn"),
    C("Xin chủ trả thêm cho những ngày đi theo", { gamble: { p: 0.45,
      win: { money: 0.05, counters: { dwa_saved: 1 }, log: "Chủ trả thêm một tuần lương, không nói gì." },
      lose: { happy: -2, log: "Chủ nói được đi biển là may rồi." } } }, "Đúng công, có thể mất lòng")], 0)),

  daily(DW, "dwa_refee", [20, 60], 9, () => T("Phí môi giới lần hai",
    "Đến hạn gia hạn hợp đồng, công ty môi giới đòi bạn nộp thêm một khoản phí bằng hai tháng lương, dù luật nơi này không cho thu lần hai. Họ nói không nộp thì hồ sơ \"chậm\".", [
    C("Nộp cho xong", { money: -0.15, counters: { honest: -1 } }, "Yên chuyện, mất hai tháng lương"),
    C("Báo cơ quan lao động", { agency: 0.02, gamble: { p: 0.55,
      win: { flags: ["dwa_reported_agency"], money: 0.05, log: "Công ty bị phạt. Bạn và ba người khác được trả lại phí." },
      lose: { bw: -5, log: "Hồ sơ của bạn bị treo hai tháng. Không ai bị phạt." } } }, "Đúng luật, có thể bị làm khó", { tier: "sovereign" }),
    C("Thỏa thuận thẳng với chủ, gia hạn không qua môi giới", { flags: ["dwa_direct_hire"], bw: -3, rel: 1 }, "Mất công giấy tờ, thoát khỏi người trung gian")], 0)),

  /* ---------- gia đình ---------- */
  cross(DW, "dwa_family", [20, 65], (c) => (c.kids_alive > 0 && !!role(c, "child")) || !!parentOf(c), (c, N) => {
    const p = parentOf(c);
    const k = c.kids_alive > 0 || !p ? role(c, "child") : undefined;
    if (k) return T(`${N(k)} lớn lên vắng bạn`,
      `${N(k)} ở với ông bà từ ngày bạn đi. Cô giáo gọi điện: ${N(k)} bỏ học hai tuần, nói "${c.sex === "F" ? "mẹ" : "bố"} có bao giờ về họp phụ huynh đâu".`, [
      C("Xin nghỉ một tháng, bay về", { money: -0.2, trust: { npc: k, delta: 0.3 }, gamble: { p: 0.6,
        win: { log: "Chủ đồng ý giữ chỗ. Một tháng ấy, ngày nào bạn cũng đưa con đến trường." },
        lose: { income_mult: 0.85, log: "Chủ thuê người khác. Bạn phải tìm chủ mới khi quay lại." } } }, "Ở bên con, có thể mất chỗ làm"),
      C("Gọi video mỗi tối, gửi thêm tiền học", { money: -0.05, trust: { npc: k, delta: 0.05 }, bw: -3 }, "Giữ việc, con vẫn thấy vắng"),
      C("Hứa với con một năm nữa sẽ về hẳn", { trust: { npc: k, delta: 0.15 }, promise: { to: k, what: "về hẳn với con sau một năm", years: 1 } }, "Con có ngày để chờ, bạn có lời để giữ", { tier: "awakened" })], 0, { npc: k });
    const q = p!;
    return T("Đám cưới của em ở quê",
      `${N(q)} gọi sang: tháng sau em bạn cưới, cả họ hỏi bạn có về không. Hợp đồng chỉ cho nghỉ phép sau hai năm, mà bạn mới làm được một năm rưỡi.`, [
      C("Xin nghỉ không lương để về", { trust: { npc: q, delta: 0.25 }, money: -0.15, gamble: { p: 0.5,
        win: { rel: 5, log: "Chủ cho nghỉ mười ngày. Bạn đứng trong ảnh cưới, gầy hơn ai hết." },
        lose: { income_mult: 0.85, log: "Chủ không giữ chỗ. Bạn về dự cưới rồi phải tìm chủ mới." } } }, "Có mặt với nhà, có thể mất chỗ"),
      C("Gửi tiền mừng, xem đám cưới qua điện thoại", { money: -0.08, trust: { npc: q, delta: 0.05 }, happy: -4 }, "Giữ việc, vắng mặt trong ngày vui"),
      C("Gửi video lời chúc, hứa kỳ phép tới sẽ về", { trust: { npc: q, delta: 0.1 }, promise: { to: q, what: "về thăm nhà dịp nghỉ phép tới", years: 1 } }, "Không tốn gì, thêm một lời hứa")], 1, { npc: q });
  }),
];

/* ================================ xuất gói ================================ */
export const PACK_AWAY_B: Storylet[] = [...MRM, ...SAB, ...RTN, ...DWA];
