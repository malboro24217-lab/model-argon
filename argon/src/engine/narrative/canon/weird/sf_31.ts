/**
 * Nhánh kỳ dị S31–S40 (spec 2026-10-18-canon-event §7). Cách viết: xem đầu canon/kit.ts.
 *
 * Chung kết dùng `finale()`: chỉ đưa nghề (become:<id>) khi tuổi nằm trong khoảng của con đường (tới ages[1] + 5);
 * mỗi chung kết có ít nhất hai landing không phải nghề nên người già vẫn luôn có 2 lựa chọn.
 * S39: rules.income = 50 (chủ dự án chốt trần ×50). S40: ba thẻ có lựa chọn `custom: "remark"` (viết lại mark tuổi thơ).
 */
import type { Choice, FactContext } from "../../types.ts";
import type { Landing, SeasonKit } from "../Season.ts";
import type { WeirdBranch } from "../Canon.ts";
import { C, cap, card, ending, land, noOr, openInOrder, season, weird } from "../kit.ts";

/** Bộ đếm của mùa (0 nếu chưa có). */
const n = (c: FactContext, key: string): number => c.counters[key] ?? 0;
/** Tên một NPC qua hàm tên; tên lạ, rỗng hay "ai đó" thì dùng chữ dự phòng. */
const nameOr = (N: (id: string) => string, id: string | undefined, dflt: string): string => {
  if (!id) return dflt;
  const v = N(id);
  return !v || v === id || v === "ai đó" ? dflt : v;
};
interface Opt { l: Landing; label: string; hint: string; path?: string; ok?: (c: FactContext) => boolean }
/** Lựa chọn chung kết: các lựa chọn khả thi (cổng tuổi của nghề qua kit, cộng `ok`) theo thứ tự, tối đa 3. */
const finale = (c: FactContext, opts: Opt[]): Choice[] =>
  openInOrder(c.age, opts.filter((o) => !o.ok || o.ok(c)).map((o) => ending(o.l, o.label, o.hint)));

/* ================================================================== S31 Người không sao */

const S31_LAT = land("lat_do_he_thong", "Hệ chấm sao bị đem ra xét lại trước cả nước, và tên bạn đứng đầu bản kiến nghị. Từ đó bạn đi khắp nơi nói chuyện cho những người số không.", { custom: "become:activist", happy: 6 });
const S31_NGOAI = land("song_ngoai_he_thong", "Bạn sống hẳn ngoài hệ thống: bán hàng lấy tiền mặt, đổi đồ lấy đồ, và không bao giờ mở lại ứng dụng chấm sao.", { custom: "become:street_vendor", happy: 4 }); // gần nhất
const S31_TIEN = land("rut_tien_mat", "Bạn rút hết tiền tiết kiệm ra tiền mặt, mất một khoản phí lớn, cất trong hộp bánh và sống những năm sau ngoài mọi bảng xếp hạng.", { money: -1, happy: 5 });
const S31_MUA = land("mua_lai_sao", "Bạn bỏ ra một khoản lớn để được chấm lại, lên ba sao, và học cách cười đúng lúc trước camera.", { money: -1.5, happy: -3 });

const S31: WeirdBranch = weird("S31", "sf", ["luat", "danh"],
  (c) => c.age >= 18 && c.age <= 70 && c.pressure.luat >= 5,
  () => "Mở ứng dụng chấm sao và thấy mình 0 sao",
  (s) => ({ title: "Không một sao", text: `Sáng thứ Hai, cửa siêu thị không mở cho bạn, vì đêm qua bạn bị hệ chấm sao công dân hạ xuống 0 trên 5. Màn hình nhỏ cạnh cửa hiện một khuôn mặt cười rất lịch sự: "Rất tiếc, hệ thống không thấy lý do để phục vụ bạn." Ở ${s.noi || "nơi này"}, đến cánh cửa tự động của bưu điện cũng đóng lại trước mũi bạn.` }),
  season({ id: "w_S31", vn: "Người không sao", color: "#4a5fc1", years: [6, 10], weird: "sf",
    rules: { income: 0.4, flags: ["w_no_stars"] },
    reset: { cast: [{ key: "tram_sao", role: "official", label: "cô nhân viên trạm chấm sao" }, { key: "lao_khong_sao", role: "neighbor", label: "ông lão không sao dưới gầm cầu" }] },
    gag: { key: "loa_sao", lines: [
      "Cái loa ở trạm xe buýt nói to: “Công dân không sao xin vui lòng đi bộ.” Ba người quay lại nhìn bạn.",
      "Cái ấm điện mới mua cũng từ chối đun nước cho bạn, rồi xin lỗi bằng giọng một cô tiếp viên.",
      "Cửa tự động của bệnh viện mở cho con mèo hoang đi vào trước bạn. Con mèo có ba sao.",
      "Bạn đi ngang một cột đèn, cột đèn tắt. Bạn lùi lại, nó sáng. Trẻ con trong xóm chơi trò này với bạn cả buổi chiều.",
    ] },
    landings: [S31_LAT, S31_NGOAI, S31_TIEN, S31_MUA],
    beats: [
      /* mo_man */
      [
        card("s31_mo_tram", "Trạm chấm sao số bảy", (c, k) => `${cap(k.npc("tram_sao"))} xem hồ sơ của bạn rất lâu, rồi xoay màn hình lại: không một sao. Lý do ghi trong một ô nhỏ: “Thiếu nhiệt tình trong các tương tác xã hội.” ${k.gag()}`,
          [C("Khiếu nại, xếp hàng điền đơn", { flags: ["s31_khieu_nai"], counters: { s31_he: 1 }, bw: -3 }, "Đúng quy trình, mất cả tuần và chưa chắc được gì"),
           C("Cười thật tươi với camera, xin chấm lại", { flags: ["s31_cuoi"], happy: -2, counters: { s31_he: 1 } }, "Có thể lên một sao, mất chút tự trọng"),
           C("Xé tờ biên nhận, bước ra ngoài", { flags: ["s31_xe_bien_nhan"], counters: { s31_ngoai: 1 } }, "Nhẹ người, hệ thống ghi thêm một lỗi", { tier: "sovereign" })]),
        card("s31_mo_khoa", "Một tuần không quẹt được gì", (c) => `Thẻ đi tàu từ chối, ví điện tử bị khóa, quán cơm quen chỉ nhận khách từ hai sao trở lên. ${c.has_job ? "Chỗ làm gửi thư báo: người không sao không được vào tòa nhà." : "Bạn đi xin việc, người ta nhìn màn hình rồi nhìn bạn, rồi mời bạn về."} Trong nhà còn đúng một xấp tiền mặt nhét trong hộp bánh cũ.`,
          (c) => [
            c.has_job
              ? C("Xin làm việc ở nhà, chịu lương thấp hơn", { income_mult: 0.9, flags: ["s31_lam_nha"], counters: { s31_he: 1 } }, "Giữ được việc, mất một phần lương")
              : C("Nhờ người quen quẹt thẻ hộ", { rel: -2, flags: ["s31_nho_quet"], counters: { s31_he: 1 } }, "Qua được ngày hôm nay, mắc nợ ân tình"),
            C("Đổi đồ lấy cơm ở chợ sáng", { money: -0.05, flags: ["s31_doi_do"], counters: { s31_ngoai: 1 } }, "Ăn no, học được một cách sống khác"),
          ]),
      ],
      /* khoi_dong */
      [
        card("s31_kd_lao", "Quyển sổ dưới gầm cầu", (c, k) => `Bạn gặp ${k.npc("lao_khong_sao")}, người không sao từ hồi hệ thống mới ra. Ông có một cái bếp than, một cái radio chạy pin và một quyển sổ ghi tay tên bốn mươi người cũng không sao như bạn. Ông nói: “Ở đây không ai chấm điểm ai, chỉ chấm bánh mì vào nồi canh.”`,
          [C("Nhận một trang trong quyển sổ", { flags: ["s31_so_tay"], counters: { s31_ngoai: 2 } }, "Có bạn đồng cảnh, từ đây quay lại hệ thống khó hơn"),
           C("Cảm ơn rồi đi, mình chỉ không sao tạm thời", { flags: ["s31_tam_thoi"], counters: { s31_he: 1 } }, "Giữ hy vọng quay lại, đi một mình")]),
        card("s31_kd_hang_xom", "Bảng xếp hạng ở đầu ngõ", (c, k) => `Khu phố dán bảng xếp hạng cư dân ở bảng tin đầu ngõ. Tên bạn ở dòng cuối, in đỏ. Hàng xóm năm sao đề nghị bạn dọn ra căn phòng thuê ở rìa khu “cho đỡ ảnh hưởng điểm chung của khu phố”. ${k.gag()}`,
          [C("Dọn ra rìa khu cho êm chuyện", { happy: -4, flags: ["s31_ham"] }, "Yên chuyện, xa chợ, xa người quen"),
           C("Gõ cửa từng nhà, xin ở lại", { gamble: { p: 0.5,
              win: { rel: 4, flags: ["s31_hang_xom_giu"], log: "Mười một nhà ký giấy giữ bạn ở lại. Điểm chung của khu phố tụt nửa sao." },
              lose: { happy: -3, flags: ["s31_ham"], log: "Chỉ hai nhà mở cửa. Bạn vẫn phải dọn ra rìa khu." } } }, "Có thể giữ được chỗ, có thể mất mặt"),
           C("In bảng xếp hạng ngược, dán đè lên", { flags: ["s31_dan_nguoc"], counters: { s31_lat: 1 } }, "Cả khu phố cười, ban quản lý ghi tên bạn lại", { tier: "sovereign" })]),
      ],
      /* cu_lat */
      [
        card("s31_cl_ho_so", "Bản in hồ sơ chấm điểm", (c, k) => `${cap(k.npc("tram_sao"))} lén gửi cho bạn bản in hồ sơ chấm điểm. Dòng trừ điểm nặng nhất đến từ ${k.scar("nguoi") || "một người quen cũ"}: một lời đánh giá một sao viết từ nhiều năm trước, chỉ có ba chữ. ${k.scar("do") ? `Dòng thứ hai trừ điểm vì chuyện ${k.scar("do")}, bị hệ thống xếp vào loại “dấu hiệu đáng ngờ”.` : "Dòng thứ hai trừ điểm vì bạn từng cho người lạ mượn ô, bị hệ thống xếp vào loại “hành vi khó đoán”."}`,
          (c) => [
            C("Tìm gặp người đã viết lời đánh giá", { flags: ["s31_gap_nguoi_cu"], rel: 2, counters: { s31_he: 1 } }, "Có thể gỡ được điểm, phải nghe lại chuyện cũ"),
            C("Đưa bản in cho báo chí", { flags: ["s31_lo_ho_so"], counters: { s31_lat: 2 } }, "Cả nước biết máy chấm thế nào, cô nhân viên mất việc"),
            ...(c.flags.has("s31_so_tay")
              ? [C("Mang bản in xuống gầm cầu, so với bốn mươi người", { flags: ["s31_so_sanh"], counters: { s31_lat: 1, s31_ngoai: 1 } }, "Thấy cả nhóm bị trừ cùng một kiểu, thành người cầm đầu", { tier: "awakened" as const })]
              : []),
          ]),
      ],
      /* day */
      [
        card("s31_day_benh", "Cửa bệnh viện không mở", (c, k) => `${c.flags.has("s31_hang_xom_giu") ? "Hàng xóm cõng bạn" : "Bạn tự lê"} tới bệnh viện lúc nửa đêm với cơn sốt gần bốn mươi độ. Cánh cửa kính đứng im trước mặt bạn. ${k.gag()}`,
          [C("Đập cửa đến khi có người ra", { health: -3, flags: ["s31_dap_cua"], counters: { s31_lat: 1 } }, "Được khám, bị ghi thêm tội gây rối"),
           C("Theo ông lão đến người chữa bệnh dưới gầm cầu", { health: -5, flags: ["s31_lang"], counters: { s31_ngoai: 1 } }, "Không ai hỏi sao, thuốc thì không chắc")]),
        card("s31_day_tien", "Hộp bánh gần rỗng", (c) => `Xấp tiền mặt trong hộp bánh chỉ còn đủ ăn mười một ngày. ${n(c, "s31_lat") >= 2 ? "Trên mạng, người ta bắt đầu gọi bạn là “người số không”, và ba nhóm khác nhau muốn bạn đứng ra dẫn đầu." : "Một công ty dịch vụ nhắn tin: trả một khoản lớn, họ sẽ “làm đẹp hồ sơ” cho bạn trong ba tháng."}`,
          [C("Vay tiền của nhóm dưới gầm cầu", { custom: "borrow:0.3", flags: ["s31_no_gam_cau"], counters: { s31_ngoai: 1 } }, "Qua được tháng này, mắc nợ người cũng không sao"),
           C("Bán đồ đạc trong nhà lấy tiền mặt", { money: 0.2, happy: -3, flags: ["s31_ban_do"] }, "Có tiền, nhà trống dần")]),
      ],
      /* chung_ket */
      [
        card("s31_ket", "Ngày chấm lại toàn quốc", (c, k) => `Hệ thống thông báo đợt chấm lại toàn quốc vào sáng thứ Hai. ${n(c, "s31_lat") >= 3 ? "Trước trạm chấm sao đã có ba trăm người cầm bảng “0 sao” đứng chờ bạn." : n(c, "s31_ngoai") >= 3 ? "Dưới gầm cầu, bốn mươi người trong quyển sổ chờ xem bạn có quay vào không." : "Cô nhân viên trạm chấm sao nhắn riêng: lần này bạn có thể lên ba sao, nếu chịu cười."} ${cap(k.npc("lao_khong_sao"))} nhắc bạn về ${noOr(c, k, "món nợ còn treo từ đời trước", "món ân tình còn treo từ đời trước")}, thứ duy nhất trong đời bạn chưa bị khóa. ${k.gag()}`,
          (c) => finale(c, [
            { l: S31_LAT, label: "Đứng ra đòi xét lại cả hệ thống", hint: "Thành người của phong trào, cả đời bị chấm điểm theo kiểu khác", path: "activist" },
            { l: S31_NGOAI, label: "Bán hàng lấy tiền mặt, sống ngoài hệ thống", hint: "Tự do, không bao giờ còn được phục vụ", path: "street_vendor" },
            { l: S31_TIEN, label: "Rút hết tiền mặt, sống lặng lẽ ngoài bảng xếp hạng", hint: "Mất một khoản phí, yên ổn tuổi già" },
            { l: S31_MUA, label: "Trả tiền để được chấm lại", hint: "Quay về được, mất tiền và mất một phần mình" },
          ])),
      ],
    ] }),
  "Viễn tưởng: bị khóa mọi dịch vụ, sống bằng tiền mặt và lòng tốt");

/* ================================================================== S32 Cả xóm chung giấc mơ */

const S32_THU_LINH = land("thu_linh_xom", "Cả xóm bầu bạn làm người đứng đầu, rồi đưa bạn lên tiếng ở những nơi lớn hơn cái ngõ.", { custom: "become:politician", happy: 5 }); // gần nhất
const S32_GIAI_MONG = land("thay_giai_mong", "Bạn thành người giải mộng của cả vùng: ai mơ gì cũng mang tới hỏi, trả công bằng tiền hoặc bằng một con gà.", { custom: "become:fortune_teller", happy: 4 }); // gần nhất
const S32_DI = land("chuyen_khoi_xom", "Bạn dọn đi, rời cái xóm đã biết hết giấc mơ của bạn, và lên thành phố ngủ một mình.", { custom: "move_city", money: -0.5, happy: -2 });
const S32_CHAN = land("chan_tin_hieu", "Bạn bỏ tiền mua bộ chặn tín hiệu cho cả xóm. Từ đó mỗi người lại có giấc mơ của riêng mình.", { money: -1, happy: 5 });

const S32: WeirdBranch = weird("S32", "sf", ["dat", "tinh"],
  (c) => c.age >= 20 && c.age <= 70 && (c.flags.has("tp_a34_seen")
    || c.plants.some((p) => p.key === "tp_a34_neighbor" || p.key === "quy_tiet_kiem_cua_hoi_giai_mong")
    || (c.age >= 35 && !c.migrated && !c.flags.has("left_home") && (c.home_owner || c.owns.has("land")))),
  () => "Ngủ một đêm, mơ cùng giấc mơ với cả xóm",
  (s) => ({ title: "Giấc mơ dùng chung", text: `Sáng nay cả xóm ở ${s.noi || "nơi này"} ra đầu ngõ nhìn nhau ngượng nghịu, vì đêm qua mọi người mơ cùng một giấc mơ. Cái trạm thu tín hiệu mới dựng trên nóc nhà sinh hoạt chung đã nối não cả xóm vào một mạng. Bà bán bánh đầu ngõ ghé sát tai bạn: "Tôi thấy hết rồi, cái chuyện giấu dưới gầm giường ấy."` }),
  season({ id: "w_S32", vn: "Cả xóm chung giấc mơ", color: "#6a4fb3", years: [6, 10], weird: "sf",
    rules: { flags: ["w_shared_dream", "no_privacy"] },
    reset: { cast: [{ key: "to_truong", role: "neighbor", label: "bà trưởng khu phố mất ngủ" }] },
    gag: { key: "ca_tre_hat", lines: [
      "Đêm nào cũng vậy, cả xóm mơ thấy cùng một con cá trê biết hát, và sáng ra ai cũng ngân nga đúng một câu.",
      "Con cá trê trong mơ hôm nay hát sai lời. Cả xóm cãi nhau đến trưa xem ai làm nó quên.",
      "Đêm nay chẳng ai ngủ, nên con cá trê đứng chờ một mình ở đầu ngõ trong giấc mơ trống, tay cầm đồng hồ.",
      "Con cá trê trong mơ cưới vợ. Sáng ra cả xóm góp tiền mừng mà không biết gửi cho ai.",
    ] },
    landings: [S32_THU_LINH, S32_GIAI_MONG, S32_DI, S32_CHAN],
    beats: [
      /* mo_man */
      [
        card("s32_mo_sang", "Bữa sáng không ai nhìn ai", (c, k) => `Buổi sáng đầu tiên sau khi mạng chạy, cả xóm ăn sáng mà không ai dám nhìn ai. ${cap(k.npc("to_truong"))} đi từng nhà phát giấy, đề nghị mỗi nhà ghi lại giấc mơ đêm qua “để ban quản lý khu phố còn theo dõi”. ${k.gag()}`,
          [C("Ghi thật, nộp đúng hạn", { flags: ["s32_ghi_that"], counters: { s32_tin: 1 } }, "Được tin, mất đời tư"),
           C("Ghi bừa một giấc mơ về bắp cải", { flags: ["s32_ghi_bua"], happy: 2 }, "Vui, nhưng cả xóm đã thấy giấc mơ thật của bạn"),
           C("Đề nghị cả xóm đừng ghi gì hết", { flags: ["s32_khong_ghi"], counters: { s32_dan: 1 } }, "Có người theo, bà trưởng khu phố để ý", { tier: "sovereign" })]),
        card("s32_mo_bi_mat", "Bí mật đầu tiên lộ ra", () => "Đêm thứ ba, cả xóm thấy trong mơ ông chủ tiệm tạp hóa lén pha nước vào can dầu ăn. Sáng ra ông đóng cửa tiệm, dán một tờ giấy: “Mơ thì không tính.” Hai phe hình thành ngay ở đầu ngõ.",
          [C("Đứng về phía ông chủ tiệm", { flags: ["s32_bao_ve"], rel: 1, counters: { s32_dan: 1 } }, "Được ông nhớ ơn, phe kia không quên"),
           C("Đòi ông trả lại tiền dầu cho cả xóm", { flags: ["s32_doi_mam"], counters: { s32_tin: 1 } }, "Được lòng số đông, mất một chỗ mua chịu")]),
      ],
      /* khoi_dong */
      [
        card("s32_kd_mo_ban", "Đêm cả xóm mơ thấy bạn", (c, k) => `Rồi đến lượt bạn. Cả xóm cùng mơ thấy ${c.married ? "bạn cãi nhau với người nhà về một khoản tiền cũ, to đến mức con cá trê phải bịt tai" : "bạn đứng một mình trong bếp lúc ba giờ sáng, tâm sự với cái nồi cơm"}. ${k.gag()}`,
          [C("Ra đầu ngõ kể hết trước khi ai kịp kể", { flags: ["s32_tu_ke"], happy: -2, counters: { s32_dan: 2 } }, "Mất mặt một buổi, được tiếng thật thà"),
           C("Bảo đó là giấc mơ của nhà bên", { flags: ["s32_do_loi"], counters: { s32_tin: -1 } }, "Qua chuyện hôm nay, thêm một nhà ghét bạn")]),
        card("s32_kd_hop", "Cuộc họp trong giấc mơ", (c, k) => `${cap(k.npc("to_truong"))} triệu tập họp ngay trong giấc mơ, vì ban ngày không ai chịu đến. Ba mươi người đứng trong một cái sân không có thật, cãi nhau xem có nên gỡ trạm tín hiệu hay không.`,
          [C("Đề nghị luật: mơ của ai thì người đó giữ", { flags: ["s32_luat_mo"], counters: { s32_dan: 2 } }, "Có tiếng nói, có trách nhiệm"),
           C("Bỏ phiếu gỡ trạm", { flags: ["s32_go_tram"], counters: { s32_tin: 1 } }, "Muốn yên, nhưng nửa xóm thích mơ chung"),
           C("Ngủ tiếp, mặc kệ cuộc họp", { happy: 2, flags: ["s32_ngu_tiep"] }, "Khỏe người, người khác quyết thay bạn")]),
      ],
      /* cu_lat */
      [
        card("s32_cl_khach", "Người lạ trong giấc mơ chung", (c, k) => `Một đêm, trong giấc mơ chung xuất hiện ${k.scar("nguoi") || "một người bạn đã lâu không gặp"}, dù người đó không sống ở xóm này. Người đó đứng cạnh trạm tín hiệu, gọi đúng tên bạn và bảo chỉ bạn mới tắt được nó. ${k.scar("do") ? `Người đó bảo chìa khóa nằm ở chuyện ${k.scar("do")}, thứ bạn mang theo từ đời cũ.` : "Người đó bảo chìa khóa nằm ở một chuyện cũ bạn mang theo từ đời trước."} ${c.flags.has("s32_tu_ke") ? "Lần trước bạn đã tự kể trước, nên sáng ra cả xóm kiên nhẫn chờ bạn kể tiếp." : c.flags.has("s32_do_loi") ? "Lần này không ai tin đó là giấc mơ của nhà bên nữa." : "Sáng ra cả xóm nhìn bạn chờ giải thích."}`,
          [C("Kể thật chuyện của bạn với người đó", { flags: ["s32_ke_nguoi_cu"], counters: { s32_dan: 1, s32_tin: 1 } }, "Xóm hiểu bạn hơn, chuyện cũ thành chuyện chung"),
           C("Đi tìm người đó ngoài đời", { flags: ["s32_tim_nguoi_cu"], money: -0.1, counters: { s32_roi: 1 } }, "Có thể gỡ được trạm, phải rời xóm vài tuần")]),
      ],
      /* day */
      [
        card("s32_day_ngu", "Chín đêm không ngủ", (c, k) => `Có người bắt đầu dùng giấc mơ chung để dọa nhau. Nửa xóm uống cà phê đặc đến sáng để khỏi phải mơ, còn ${k.npc("to_truong")} ngất ở chợ sau chín đêm không ngủ. ${k.gag()}`,
          [C("Đưa bà đi viện, trực xóm thay bà", { flags: ["s32_truc_thay"], health: -3, counters: { s32_dan: 2 } }, "Mệt, nhưng xóm bắt đầu nhìn bạn khác"),
           C("Gửi người nhà đi nơi khác cho yên", { flags: ["s32_gui_nha"], rel: -2, counters: { s32_roi: 1 } }, "Người nhà được ngủ, bạn ở lại một mình")]),
        card("s32_day_ban_mo", "Giấc mơ bị đem bán", (c) => `Có người ghi lại giấc mơ của bạn rồi bán cho một kênh trên mạng. ${n(c, "s32_dan") >= 3 ? "Lần này nửa xóm kéo đến tận nơi đòi gỡ xuống, vì “giấc mơ của xóm là của xóm”." : "Đoạn đó có bốn trăm nghìn lượt xem, và không ai trong xóm đứng ra bênh bạn."}`,
          [C("Kiện kênh đó", { money: -0.2, flags: ["s32_kien"], counters: { s32_dan: 1 } }, "Tốn tiền, có thể thành tiền lệ"),
           C("Tự bán nốt phần còn lại, lấy tiền", { money: 0.3, flags: ["s32_ban_mo"], counters: { s32_tin: -2 } }, "Có tiền, xóm coi bạn như người ngoài")]),
      ],
      /* chung_ket */
      [
        card("s32_ket", "Đêm cuối của trạm tín hiệu", (c, k) => `Trạm tín hiệu hết hạn thử nghiệm, xóm phải chọn giữ hay gỡ. ${n(c, "s32_dan") >= 3 ? "Trong giấc mơ đêm qua, ba mươi người đứng sau lưng bạn chờ bạn lên tiếng." : n(c, "s32_roi") >= 1 ? "Trong giấc mơ đêm qua, cả xóm đứng tiễn bạn ở đầu ngõ, như thể bạn đã đi rồi." : "Trong giấc mơ đêm qua, cả xóm đứng quay lưng lại với bạn."} Chuyện ${noOr(c, k)} thì cả xóm đã thấy trong mơ, không giấu được nữa. ${k.gag()}`,
          (c) => finale(c, [
            { l: S32_THU_LINH, label: "Đứng ra dẫn dắt cả xóm", hint: "Thành người có tiếng nói, không còn giấc mơ nào là riêng", path: "politician" },
            { l: S32_GIAI_MONG, label: "Mở chỗ giải mộng cho cả vùng", hint: "Sống bằng giấc mơ của người khác, nghe đủ chuyện đời", path: "fortune_teller" },
            { l: S32_DI, label: "Dọn khỏi xóm, lên thành phố", hint: "Được ngủ một mình, mất cái xóm cả đời" },
            { l: S32_CHAN, label: "Bỏ tiền chặn tín hiệu cho cả xóm", hint: "Tốn kém, trả lại cho mỗi người một giấc mơ riêng" },
          ])),
      ],
    ] }),
  "Viễn tưởng: bí mật cả xóm lộ ra trong một giấc mơ chung");

/* ================================================================== S33 Người cuối cùng còn là người */

const S33_GIONG = land("giong_nguoi_that", "Giọng nói “đã kiểm chứng là người” của bạn lên sóng mỗi tối, người nghe bảo đó là giọng duy nhất họ còn tin.", { custom: "become:radio_voice", happy: 5 });
const S33_VIET = land("sach_nguoi_that", "Bạn viết cuốn sách về những năm làm người thật cho máy, và cuốn sách bán chạy vì không câu nào giống máy viết.", { custom: "become:writer", happy: 5 });
const S33_DANH = land("ban_dau_nguoi", "Bạn bán quyền dùng gương mặt và giọng nói của một người thật đã kiểm chứng cho mười hai công ty, đổi lấy một khoản lớn.", { money: 2, happy: -2 });
const S33_TRA = land("tra_lai_ten", "Bạn trả lại toàn bộ tiền thưởng để xóa tên mình khỏi bộ dữ liệu, và về sống như một người bình thường, không ai cần kiểm chứng.", { money: -1, happy: 6 });

const S33: WeirdBranch = weird("S33", "sf", ["danh", "tien"],
  (c) => c.age >= 20 && c.age <= 62 && !c.retired
    && (c.flags.has("kept_by_ai_cut") || (!c.has_job && (c.flags.has("job_office") || c.flags.has("job_factory") || c.worker))),
  () => "Nhận việc làm người thật cho máy kiểm chứng",
  (s, c) => ({ title: "Tuyển người thật", text: `${c.has_job ? "Một cỗ máy vừa làm thay nửa phần việc và nửa đồng lương của bạn" : "Bạn vừa mất chỗ làm, và chỗ cũ giờ đã có máy làm thay"}, thì chính công ty làm ra cỗ máy ấy gọi bạn đi làm. Họ cần người thật ngồi trước camera, đọc to những câu máy viết và xác nhận “câu này người có nói không”. Người tuyển dụng đẩy hợp đồng qua bàn: "Lương gấp ba. Việc của bạn chỉ là cứ tiếp tục làm người."` }),
  season({ id: "w_S33", vn: "Người cuối cùng còn là người", color: "#3d7fb8", years: [6, 10], weird: "sf",
    rules: { income: 3, flags: ["w_last_human"] },
    reset: { cast: [{ key: "giam_sat", role: "first_boss", label: "chị giám sát đeo hai cặp kính" }, { key: "dong_nghiep", role: "rival", label: "người đồng nghiệp nói năng như máy" }] },
    gag: { key: "nghi_la_may", lines: [
      "Bảo vệ tòa nhà bắt bạn chứng minh mình là người bằng cách chọn hết các ô có cột đèn giao thông.",
      "Bạn hắt hơi trong thang máy của công ty, ba người vỗ tay: “Giống thật quá.”",
      "Người nhà gọi điện, hỏi câu bí mật chỉ người trong nhà biết, nghe bạn trả lời xong vẫn im lặng rất lâu.",
      "Bạn chọn đủ hết các ô có cột đèn. Màn hình báo: chọn đúng quá, đáng ngờ.",
    ] },
    landings: [S33_GIONG, S33_VIET, S33_DANH, S33_TRA],
    beats: [
      /* mo_man */
      [
        card("s33_mo_phong", "Căn phòng có một cái ghế", (c, k) => `Chỗ làm của bạn có một cái ghế, một camera và tấm biển “Xin cứ tự nhiên”. ${cap(k.npc("giam_sat"))} giải thích: mỗi ngày đọc tám trăm câu, gật đầu nếu người thật có thể nói câu đó, lắc đầu nếu không. ${k.gag()}`,
          [C("Gật lắc theo cảm giác, đúng quy trình", { flags: ["s33_dung_quy_trinh"], counters: { s33_nguoi: 1 } }, "Ổn định, chán đến tê người"),
           C("Ghi lý do cho từng câu", { know: 3, bw: -3, flags: ["s33_ghi_chu"], counters: { s33_danh: 1 } }, "Được cấp trên để ý, làm chậm gấp đôi")]),
        card("s33_mo_dong_nghiep", "Người ngồi bàn bên", (c, k) => `${cap(k.npc("dong_nghiep"))} ngồi bàn bên, ăn trưa đúng mười hai giờ không lệch một phút, mỗi lần cười đúng ba giây. Cả phòng thì thầm rằng người đó là máy cài vào để kiểm tra người thật.`,
          [C("Rủ người đó đi ăn trưa, hỏi thẳng", { flags: ["s33_ban_dong_nghiep"], rel: 2 }, "Có thể có một người bạn, có thể bị máy chấm điểm"),
           C("Theo dõi, ghi lại mọi thứ người đó làm", { flags: ["s33_theo_doi"], counters: { s33_nghi: 1 } }, "Biết nhiều hơn, thành người đáng ngờ nhất phòng")]),
      ],
      /* khoi_dong */
      [
        card("s33_kd_mang", "Cái ngáp tám mươi nghìn lượt xem", (c, k) => `Một đoạn camera quay bạn ngáp giữa giờ làm lọt ra ngoài, kèm dòng chữ “người thật cuối cùng”. Ba ngày sau có tám mươi nghìn người theo dõi bạn. ${k.gag()}`,
          [C("Mở kênh riêng, kể chuyện làm người", { money: 0.2, flags: ["s33_kenh"], counters: { s33_danh: 2 } }, "Có thêm tiền và tiếng, mất chút đời tư"),
           C("Xin công ty giữ kín danh tính", { flags: ["s33_kin"], counters: { s33_nguoi: 1 } }, "Yên, nhưng công ty biết bạn có giá")]),
        card("s33_kd_bai_kiem", "Bài kiểm tra người thật", () => "Công ty đổi luật: mỗi quý, chính người kiểm chứng cũng phải qua bài kiểm tra người thật. Câu đầu tiên: “Kể một kỷ niệm làm bạn xấu hổ, có chi tiết không ai bịa ra được.”",
          [C("Kể một chuyện thật, xấu hổ thật", { happy: -2, flags: ["s33_ke_that"], counters: { s33_nguoi: 2 } }, "Chắc chắn qua, chuyện riêng thành dữ liệu"),
           C("Bịa một chuyện thật khéo", { gamble: { p: 0.5,
              win: { flags: ["s33_bia_qua"], log: "Bạn qua bài thi. Máy chấm câu chuyện bịa của bạn là “rất người”." },
              lose: { flags: ["s33_nghi_may"], counters: { s33_nghi: 2 }, log: "Máy kết luận câu chuyện quá hoàn hảo để là của người." } } }, "Giữ chuyện riêng, có thể bị gắn mác máy")]),
      ],
      /* cu_lat */
      [
        card("s33_cl_ban_sao", "Cỗ máy nói giọng bạn", (c, k) => `Công ty khoe sản phẩm mới: một cỗ máy học từ tám nghìn giờ quay bạn, nói giọng bạn, ngáp y như bạn. Nó nhắc tên ${k.scar("nguoi") || "một người bạn từng thương"} bằng đúng cái giọng bạn vẫn nhắc. ${k.scar("do") ? `Nó còn biết cả chuyện ${k.scar("do")}, thứ bạn chưa từng kể trước camera.` : "Nó còn biết cả cái tật gõ ngón tay lên bàn khi nói dối, thứ bạn chưa từng kể trước camera."}`,
          [C("Ký giấy cho phép, nhận thưởng", { money: 0.6, flags: ["s33_ban_minh"], counters: { s33_nghi: 1 } }, "Tiền về nhiều, từ nay trên đời có hai bạn"),
           C("Nghỉ việc ngay hôm đó", { custom: "job_lose", flags: ["s33_nghi_viec"], counters: { s33_nguoi: 1 } }, "Giữ lại chính mình, mất lương gấp ba"),
           C("Đòi công ty trả tiền bản quyền con người", { money: 0.3, flags: ["s33_doi_quyen"], counters: { s33_danh: 2 } }, "Có thể giàu, có thể bị kiện ngược", { tier: "sovereign" })]),
      ],
      /* day */
      [
        card("s33_day_khong_tin", "Ngân hàng không nhận ra bạn", (c, k) => `${c.flags.has("s33_ban_minh") ? "Cỗ máy mang giọng bạn" : "Một cỗ máy nhái theo các đoạn quay của bạn"} lên truyền hình, nói chuyện có duyên hơn bạn. Ngân hàng khóa tài khoản vì “không xác định được đâu là chủ tài khoản thật”. ${k.gag()}`,
          [C("Đứng trước quầy chứng minh mình là người", { health: -2, flags: ["s33_quay"], counters: { s33_nguoi: 1 } }, "Mất một tuần, lấy lại được tên mình"),
           C("Nhờ người quen ký giấy xác nhận", { rel: -2, flags: ["s33_nho_nguoi"] }, "Nhanh, nhưng mắc nợ ân tình")]),
        card("s33_day_dong_nghiep", "Cầu thang thoát hiểm", (c, k) => `${cap(k.npc("dong_nghiep"))} gọi bạn ra cầu thang thoát hiểm, mắt đỏ hoe. Người đó thú nhận mình là người thật, chỉ cố sống đều đều như máy để khỏi bị thay. ${c.flags.has("s33_theo_doi") ? "Người đó cũng biết bạn đã ghi chép về mình suốt mấy năm." : c.flags.has("s33_ban_dong_nghiep") ? "Người đó vẫn nhớ bữa trưa năm nào, bữa ăn duy nhất không ai đo giờ." : "Bạn là người đầu tiên người đó dám kể."}`,
          [C("Cùng nhau đứng ra kể hết", { flags: ["s33_hai_nguoi"], counters: { s33_danh: 2 } }, "Hai người có tiếng nói, công ty để ý cả hai"),
           C("Giữ bí mật cho người đó", { rel: 2, flags: ["s33_giu_bi_mat"], counters: { s33_nguoi: 1 } }, "Một người bạn thật, một gánh nặng thật")]),
      ],
      /* chung_ket */
      [
        card("s33_ket", "Bản hợp đồng cuối", (c, k) => `${cap(k.npc("giam_sat"))} đưa bản hợp đồng cuối: từ năm sau công ty ngừng tuyển người thật, vì máy đã tự kiểm chứng được nhau. ${n(c, "s33_danh") >= 3 ? "Ngoài cửa, mấy đài phát thanh và một nhà xuất bản đang chờ bạn ký xong." : "Ngoài cửa, chẳng ai chờ, chỉ có tấm biển “Xin cứ tự nhiên” bị gỡ xuống."} Đọc tới điều khoản bồi thường, bạn chợt nhớ ${noOr(c, k)} vẫn chưa trả. ${k.gag()}`,
          (c) => finale(c, [
            { l: S33_GIONG, label: "Làm giọng nói người thật trên sóng", hint: "Có nghề, có tiếng, giọng bạn thành của chung", path: "radio_voice" },
            { l: S33_VIET, label: "Viết cuốn sách về những năm làm người", hint: "Chậm tiền, nhưng mỗi chữ là của bạn", path: "writer" },
            { l: S33_DANH, label: "Bán quyền dùng gương mặt người thật", hint: "Giàu nhanh, gương mặt bạn có mặt khắp nơi" },
            { l: S33_TRA, label: "Trả tiền, xóa tên khỏi bộ dữ liệu", hint: "Mất một khoản, lấy lại đời thường" },
          ])),
      ],
    ] }),
  "Viễn tưởng: thu nhập cao, nhưng ai cũng nghi bạn là máy");

/* ================================================================== S34 Bố mẹ của thần đồng */

const S34_DI = land("di_cu_cung_con", "Cả nhà bán hết, đổi nước, đổi trường. Ở đất mới không ai biết đứa nhỏ từng giải bài toán trên tường bếp.", { custom: "migrate_now", happy: 2 });
const S34_XA = land("con_di_xa", "Đứa nhỏ đi học ở một viện xa, mỗi tháng gọi về một lần và gửi về một khoản học bổng lớn hơn lương của cả nhà.", { money: 1.5, happy: -4, flags: ["prodigy_child_away"] });
const S34_AN = land("an_minh", "Cả nhà chuyển tới một thành phố lạ, đổi trường cho con, sống khiêm tốn, và dạy con cách thỉnh thoảng làm sai một phép tính.", { custom: "move_city", happy: 3 });

const S34: WeirdBranch = weird("S34", "sf", ["mau", "danh"],
  (c) => c.kids_school > 0 && c.kids_teen === 0 && c.age >= 22 && c.age <= 50,   // con đang tuổi tiểu học (6–12)
  () => "Để con giải nốt bài toán viết trên tường bếp",
  (s) => ({ title: "Bài toán trên tường bếp", text: `Đứa nhỏ nhà bạn vừa giải xong bài toán các viện nghiên cứu treo thưởng ba mươi năm, bằng một mẩu phấn, trên tường bếp. Sáng hôm sau, ba chiếc xe đen đỗ trước cửa nhà ở ${s.noi || "nơi này"}. Đứa nhỏ đứng ở cửa sổ, hỏi: "Sao mấy chú đó đếm sai số bậc thang?"` }),
  season({ id: "w_S34", vn: "Nhà có thần đồng", color: "#5b6fd6", years: [6, 10], weird: "sf",
    rules: { income: 0.9, flags: ["w_prodigy"] },
    reset: { cast: [{ key: "vien", role: "official", label: "người đàn ông của viện nghiên cứu" }, { key: "co_giao", role: "mentor", label: "cô giáo dạy toán về hưu" }] },
    gag: { key: "con_tinh_nham", lines: [
      "Đứa nhỏ tính xong tiền điện ba năm tới trước khi bạn kịp mở hóa đơn, rồi khoanh đỏ chỗ công ty điện tính sai.",
      "Ở chợ, đứa nhỏ nói giá đúng từng đồng trước khi người bán kịp cân. Bà bán cá xin nó về làm kế toán.",
      "Đứa nhỏ tính được cái nồi cơm còn sống bao nhiêu ngày. Từ đó cả nhà nấu cơm rất nhẹ tay.",
      "Đứa nhỏ đếm sao trên trời, báo thiếu một ngôi so với đêm qua, và ngồi viết thư khiếu nại.",
    ] },
    landings: [S34_DI, S34_XA, S34_AN],
    beats: [
      /* mo_man */
      [
        card("s34_mo_xe_den", "Ba chén trà của viện", (c, k) => `${cap(k.npc("vien"))} ngồi trong phòng khách nhà bạn, uống hết ba chén trà mà chưa nói vào việc. Cuối cùng ông ta đặt lên bàn một tờ giấy: viện muốn “mời” đứa nhỏ lên làm việc vài ngày mỗi tuần, có xe đưa đón. ${k.gag()}`,
          [C("Đồng ý cho thử một tháng", { money: 0.2, flags: ["s34_cho_thu"], counters: { s34_vien: 1 } }, "Có tiền và xe, con xa nhà"),
           C("Từ chối, tiễn khách", { flags: ["s34_tu_choi"], counters: { s34_giu: 1 } }, "Giữ con bên mình, viện sẽ quay lại"),
           C("Đòi viện cử người đến nhà, không đưa con đi", { flags: ["s34_dieu_kien"], counters: { s34_giu: 1, s34_vien: 1 } }, "Giữ con gần, phải mở cửa nhà cho người lạ", { tier: "sovereign" })]),
        card("s34_mo_truong", "Bút đỏ trên đề thi", (c, k) => `Trường cũ trả đứa nhỏ về sau ba ngày, vì nó sửa đề thi của giáo viên bằng bút đỏ. ${cap(k.npc("co_giao"))} ở cuối ngõ nghe chuyện, gõ cửa xin dạy, công chỉ là một bữa cơm.`,
          [C("Nhờ cô giáo dạy ở nhà", { flags: ["s34_co_day"], counters: { s34_giu: 1 } }, "Con có thầy, cả ngõ biết chuyện"),
           C("Cho con học trường thường, dặn con giả vờ chậm", { happy: -2, flags: ["s34_gia_cham"], counters: { s34_giu: 1 } }, "Con có bạn, nhưng học cách giấu mình")]),
      ],
      /* khoi_dong */
      [
        card("s34_kd_bao", "Bức tường bếp lên mạng", (c, k) => `Ai đó chụp bức tường bếp đăng lên mạng. ${c.flags.has("s34_gia_cham") ? "Trường của con lập tức gọi điện hỏi vì sao học sinh lại giả vờ chậm." : "Hàng xóm xếp hàng trước cửa nhờ đứa nhỏ tính ngày dọn nhà, tính tiền lãi, tính giá đất."} ${k.gag()}`,
          [C("Nhận một buổi phỏng vấn", { money: 0.1, flags: ["s34_phong_van"], counters: { s34_danh: 2 } }, "Cả nước biết, viện không dám làm mạnh tay"),
           C("Xóa ảnh, sơn lại tường bếp", { money: -0.05, flags: ["s34_son_tuong"], counters: { s34_giu: 1 } }, "Kín tiếng, nhưng với vài người đã quá muộn")]),
        card("s34_kd_phong_bi", "Phong bì dày gấp đôi", (c, k) => `${cap(k.npc("vien"))} quay lại với một phong bì dày gấp đôi và bản hợp đồng mười năm. Ông ta nói các nước khác cũng đã biết, và “họ không mời bằng trà đâu”.`,
          [C("Ký hợp đồng mười năm", { money: 0.8, flags: ["s34_ky_vien"], counters: { s34_vien: 2 } }, "Tiền lớn, con thuộc về viện mười năm"),
           C("Thuê luật sư đọc từng chữ", { money: -0.2, know: 2, flags: ["s34_luat_su"] }, "Tốn tiền, biết được điều khoản giấu kín")]),
      ],
      /* cu_lat */
      [
        card("s34_cl_nguoi_cu", "Tập hồ sơ lúc nửa đêm", (c, k) => `${cap(k.scar("nguoi") || "một người quen cũ")} tìm đến nhà lúc nửa đêm, ôm theo một tập hồ sơ: viện đã theo dõi gia đình bạn từ trước khi đứa nhỏ ra đời. ${k.scar("do") ? `Trong đó có cả một trang về ${k.scar("do")}, ghi chép từ nhiều năm trước.` : "Trong đó có cả ảnh chụp chiếc nôi của đứa nhỏ, ghi chép từ nhiều năm trước."}`,
          [C("Mang hồ sơ đi tố cáo", { flags: ["s34_to_cao"], counters: { s34_danh: 2 } }, "Có thể chặn được viện, cả nhà thành mục tiêu"),
           C("Âm thầm chuẩn bị giấy tờ để đi", { money: -0.2, flags: ["s34_chuan_bi_di"], counters: { s34_di: 2 } }, "Tốn tiền, giữ được đường lui"),
           C("Hỏi ý đứa nhỏ", { flags: ["s34_hoi_con"], counters: { s34_con: 2 } }, "Tôn trọng con, nhưng con còn nhỏ", { tier: "awakened" })]),
      ],
      /* day */
      [
        card("s34_day_xe", "Chiếc xe không biển số", (c, k) => `Một buổi chiều đứa nhỏ đi học về muộn bốn mươi phút. Nó kể có một chiếc xe không biển số chạy theo, và nó đã tính một đường vòng qua chợ để cắt đuôi. ${k.gag()}`,
          [C("Không cho con ra ngoài một mình nữa", { happy: -3, flags: ["s34_nhot"], counters: { s34_giu: 1 } }, "An toàn, con bắt đầu buồn"),
           C("Báo cảnh sát, làm lớn chuyện", { flags: ["s34_bao_canh_sat"], counters: { s34_danh: 1 } }, "Có người bảo vệ, có thêm người dòm ngó")]),
        card("s34_day_to_giay", "Tờ giấy trên bàn ăn", (c) => `Đứa nhỏ đặt lên bàn ăn một tờ giấy đã tính sẵn ba con đường cho cả nhà, kèm xác suất của từng con đường. ${n(c, "s34_con") >= 2 ? "Nó nói: “Con muốn chọn cùng cả nhà, không muốn chọn thay.”" : "Nó nói: “Lần nào người lớn cũng quyết mà không hỏi con.”"}`,
          [C("Đọc kỹ tờ giấy cùng con", { rel: 2, flags: ["s34_doc_cung"], counters: { s34_con: 1 } }, "Cả nhà cùng chọn, nặng lòng hơn"),
           C("Cất tờ giấy đi, người lớn quyết", { flags: ["s34_cat_giay"], counters: { s34_giu: 1 } }, "Gọn chuyện, nhưng con sẽ nhớ")]),
      ],
      /* chung_ket */
      [
        card("s34_ket", "Ba con đường trên tờ giấy", (c, k) => `Hạn chót của viện là sáng thứ Hai. ${cap(k.npc("co_giao"))} mang sang một nồi cháo và một lời khuyên: ${n(c, "s34_di") >= 2 ? "giấy tờ đã sẵn, đi thì đi cho sớm." : n(c, "s34_vien") >= 2 ? "hợp đồng đã ký thì con đi, nhưng đừng để con đi một mình trong lòng." : "đứa nhỏ cần một nơi không ai đếm bậc thang thay nó."} Còn ${noOr(c, k)} thì vẫn chưa trả, đi đâu cũng phải mang theo. ${k.gag()}`,
          (c) => finale(c, [
            { l: S34_DI, label: "Cả nhà đổi nước mà đi", hint: "Con được tự do, cả nhà làm lại từ đầu ở đất lạ" },
            { l: S34_XA, label: "Để con đi học ở viện xa", hint: "Con bay cao, nhà vắng tiếng cười" },
            { l: S34_AN, label: "Chuyển thành phố, sống kín tiếng", hint: "Con được làm trẻ con, tài năng ngủ yên" },
          ])),
      ],
    ] }),
  "Viễn tưởng: con bạn tính nhanh hơn máy, và có người đang săn nó");

/* ================================================================== S35 Hố đen trong ngăn kéo */

const S35_NUOT = land("xoa_no_ho_den", "Bạn thả hết giấy nợ vào ngăn kéo, cùng một món đồ bạn từng rất quý để nó chịu ăn. Sáng ra, nợ không còn, ngăn kéo cũng rỗng.", { custom: "repay:5", money: -1, happy: 4 });
const S35_TRA = land("tra_ho_den", "Bạn đem cái ngăn kéo lên núi, thả hố đen vào khoảng không cùng một món đồ quý để nó chịu đi. Nhà hết nghiêng, ví cũng nhẹ đi một khoản.", { money: -1, happy: 4 });
const S35_BAN = land("ban_ngan_keo", "Bạn bán cái ngăn kéo cho một phòng thí nghiệm, kèm cả cái bàn đã nghiêng, được một khoản đủ sống nhiều năm.", { money: 3, happy: 2 });
const S35_CHE = land("nha_sang_che", "Bạn chế ra cái hộp giữ được hố đen nhỏ, đứng tên bằng sáng chế đầu tiên trong đời.", { custom: "become:inventor", know: 6 });

const S35: WeirdBranch = weird("S35", "sf", ["ky", "tien"],
  (c) => c.age >= 18 && c.age <= 70 && c.pressure.ky >= 6,
  () => "Ghé mắt nhìn hạt cát đen trong ngăn kéo bàn",
  (s, c) => ({ title: "Hạt cát nặng nhất thế giới", text: `Ngăn kéo bàn của bạn nặng đến mức chỉ hé ra được một khe, và qua khe ấy là một hố đen nhỏ cỡ hạt cát. Cây bút bi rơi vào, không một tiếng động. Sáng nay ${c.debt > 0 ? "tờ giấy báo nợ" : "tờ hóa đơn tiền điện"} trên bàn cũng tự trượt vào trong. Bạn nói với cái ngăn kéo: "Hay đấy, làm lại lần nữa xem nào."` }),
  season({ id: "w_S35", vn: "Người giữ hố đen", color: "#2f2a6b", years: [5, 9], weird: "sf",
    rules: { flags: ["w_black_hole"], yearly: { money: -0.03, custom: "repay:0.2" } },
    reset: { cast: [{ key: "giao_su", role: "mentor", label: "bà giáo sư vật lý đi dép lê ở nhà bên" }] },
    gag: { key: "ngan_keo_an", lines: [
      "Chiếc tất thứ mười bảy biến mất. Từ nay cả nhà đi tất lệch, gọi đó là phong cách.",
      "Con mèo hàng xóm ngồi canh cái ngăn kéo cả buổi như canh hang chuột, không dám lại gần quá ba bước.",
      "Cái điều khiển ti vi biến mất lần thứ tư. Lần này bạn nghe thấy tiếng nó chuyển kênh ở đâu đó rất xa.",
      "Bạn viết chữ “nợ” lên một mảnh giấy rồi thả vào. Ngăn kéo ợ một tiếng nhỏ.",
    ] },
    landings: [S35_NUOT, S35_TRA, S35_BAN, S35_CHE],
    beats: [
      /* mo_man */
      [
        card("s35_mo_thu", "Thử bằng một chiếc tất", (c, k) => `Bạn thả vào ngăn kéo một chiếc tất, một cái thìa, rồi một tờ hóa đơn tiền điện. Cả ba biến mất. Tháng sau, công ty điện gửi thư xin lỗi vì không tìm thấy hồ sơ của bạn. ${k.gag()}`,
          [C("Thả thêm vài tờ hóa đơn nữa", { money: 0.05, flags: ["s35_tha_hoa_don"], counters: { s35_nuot: 1 } }, "Nhẹ ví, sớm muộn sẽ có người để ý"),
           C("Khóa ngăn kéo, dán băng dính", { flags: ["s35_khoa"], counters: { s35_giu: 1 } }, "An toàn, bạn sẽ tò mò mãi")]),
        card("s35_mo_giao_su", "Chiếc la bàn quay tít", (c, k) => `${cap(k.npc("giao_su"))} gõ cửa, tay cầm một chiếc la bàn quay tít. Bà nói rất bình tĩnh: “Nhà này đang bẻ cong thời gian ba giây mỗi ngày. Cho tôi xem cái ngăn kéo.”`,
          [C("Cho bà xem, kể hết", { know: 3, flags: ["s35_bao_giao_su"], counters: { s35_khoa: 1 } }, "Có người hiểu, thêm một người biết"),
           C("Bảo là đồng hồ nhà mình chạy nhanh", { flags: ["s35_giau"], counters: { s35_giu: 1 } }, "Giữ được bí mật, bà không tin")]),
      ],
      /* khoi_dong */
      [
        card("s35_kd_no", (c) => (c.debt > 0 ? "Khoản vay không còn trong máy" : "Hàng xóm hỏi mượn ngăn kéo"), (c, k) => `${c.debt > 0 ? "Một buổi sáng, ngân hàng gọi điện hỏi vì sao khoản vay của bạn không còn trong hệ thống." : "Một buổi sáng, nhà bên sang hỏi mượn cái ngăn kéo một đêm, để thả vào đó tờ giấy vay nặng lãi của họ."} ${k.gag()}`,
          (c) => c.debt > 0
            ? [C("Im lặng, coi như chưa từng nợ", { custom: "repay:0.5", flags: ["s35_xoa_no"], counters: { s35_nuot: 1 } }, "Nhẹ nợ, sẽ có người đi tìm khoản tiền đó"),
               C("Đến ngân hàng khai thật", { flags: ["s35_khai_that"], counters: { s35_giu: 1 } }, "Giữ được tên sạch, nợ vẫn còn")]
            : [C("Cho mượn một đêm", { rel: 3, flags: ["s35_cho_muon"], counters: { s35_nuot: 1 } }, "Được ơn, cả xóm sẽ kéo đến xin"),
               C("Từ chối, đóng cửa", { rel: -2, flags: ["s35_tu_choi_xom"], counters: { s35_giu: 1 } }, "Giữ kín, mất lòng hàng xóm")]),
        card("s35_kd_lon", "Hạt cát thành hạt đậu", (c, k) => `Hố đen lớn bằng hạt đậu. Cái bàn bắt đầu nghiêng về phía ngăn kéo, bát nước trên bàn chảy xiên. ${cap(k.npc("giao_su"))} nói nếu cứ cho nó ăn, nó sẽ lớn tiếp.`,
          (c) => [C(c.debt > 0 ? "Ngừng cho ăn, kể cả giấy nợ" : "Ngừng cho ăn, kể cả hóa đơn", { flags: ["s35_nhin_an"], counters: { s35_giu: 2 } }, c.debt > 0 ? "An toàn hơn, nợ ở lại" : "An toàn hơn, hóa đơn ở lại"),
           C("Cho ăn đồ cũ trong nhà để nghiên cứu", { money: -0.1, flags: ["s35_cho_an"], counters: { s35_khoa: 1, s35_nuot: 1 } }, "Biết thêm, nhà trống dần")]),
      ],
      /* cu_lat */
      [
        card("s35_cl_vat", "Thứ hố đen không với tới", (c, k) => `Bạn để ý thấy cái ngăn kéo kéo lệch mọi thứ trong nhà về phía nó, trừ những gì dính tới ${k.scar("do") || "một kỷ niệm cũ từ đời trước"}, thứ bạn mang theo từ đời cũ: hình như hố đen không chịu nuốt phần đó của đời bạn. Cùng tuần đó, ${k.scar("nguoi") || "một người quen cũ"} gọi điện, hỏi mượn cái ngăn kéo để thả vào một thứ không muốn ai tìm thấy. ${c.flags.has("s35_bao_giao_su") ? "Bà giáo sư nhà bên nghe chuyện, lắc đầu: cho hố đen ăn đồ của người khác là cho nó biết đường ra khỏi nhà." : c.flags.has("s35_giau") ? "Bạn tự hỏi người đó biết chuyện từ đâu, khi bạn đã nói dối cả bà giáo sư nhà bên." : "Bạn chưa kể chuyện cái ngăn kéo cho ai, vậy mà người đó vẫn biết."}`,
          [C("Cho người đó mượn", { rel: 2, flags: ["s35_cho_nguoi_cu"], counters: { s35_nuot: 1 } }, "Trả được một món ân tình, không biết thứ gì đã rơi vào"),
           C("Hỏi rõ người đó muốn thả gì", { know: 2, flags: ["s35_hoi_ro"], counters: { s35_giu: 1 } }, "Biết chuyện, mất lòng"),
           C("Thử thả vào một kỷ vật của thứ ấy", { flags: ["s35_thu_do"], counters: { s35_khoa: 2 } }, "Hiểu thêm về hố đen, có thể mất nó mãi", { tier: "awakened" })]),
      ],
      /* day */
      [
        card("s35_day_ky_uc", "Tên con phố bị nuốt", (c, k) => `Sáng nay bạn không nhớ nổi tên con phố mình sống. ${cap(k.npc("giao_su"))} giải thích: hết đồ để ăn, hố đen bắt đầu nuốt những thứ bạn ít nghĩ tới nhất. ${k.gag()}`,
          [C("Viết tên mọi thứ quan trọng lên tường", { bw: -4, flags: ["s35_viet_tuong"], counters: { s35_giu: 1 } }, "Giữ được ký ức, nhà như lớp học"),
           C("Cho nó ăn một món đồ lớn cho no", { money: -0.3, flags: ["s35_cho_no"], counters: { s35_nuot: 1 } }, "Mất của, giữ được trí nhớ")]),
        card("s35_day_kiem_tra", "Đoàn áo bảo hộ trắng", (c) => `Một đoàn người mặc đồ bảo hộ trắng gõ cửa, nói đang kiểm tra “bất thường hấp dẫn” trong khu phố. ${n(c, "s35_nuot") >= 3 ? `Họ mang theo danh sách những ${c.debt > 0 || c.flags.has("s35_xoa_no") ? "khoản nợ" : "hóa đơn và giấy tờ"} biến mất trong khu, và tên bạn đứng đầu.` : "Họ hỏi han rất lịch sự, nhưng mắt cứ nhìn mãi về phía cái bàn."}`,
          [C("Mở cửa, hợp tác", { flags: ["s35_hop_tac"], counters: { s35_khoa: 1 } }, "Có thể được tiền, có thể mất cái ngăn kéo"),
           C("Giấu ngăn kéo sang nhà người quen", { rel: -2, flags: ["s35_giau_ngan_keo"], counters: { s35_giu: 1 } }, "Giữ được nó, kéo người khác vào chuyện")]),
      ],
      /* chung_ket */
      [
        card("s35_ket", "Ngăn kéo kêu răng rắc", (c, k) => `Hố đen đã to bằng viên bi, cái bàn kêu răng rắc mỗi đêm. ${n(c, "s35_khoa") >= 2 ? "Bà giáo sư để lại trên bàn bản vẽ một cái hộp có thể giữ nó mãi mãi." : "Phòng thí nghiệm gửi thư thứ ba, con số trong thư dài hơn lần trước."} Trên mặt bàn, tờ giấy ghi ${noOr(c, k, "món nợ cuối cùng của bạn", "lời hứa cũ chưa làm")} đang từ từ trượt về phía ngăn kéo. ${k.gag()}`,
          (c) => finale(c, [
            { l: S35_CHE, label: "Chế cái hộp giữ hố đen, đứng tên sáng chế", hint: "Thành người làm ra thứ chưa ai làm, nhà vẫn nghiêng", path: "inventor" },
            { l: S35_NUOT, label: "Thả hết giấy nợ vào, kèm một món đồ quý", hint: "Sạch nợ, mất một thứ không mua lại được", ok: (x) => x.debt > 0 },
            { l: S35_TRA, label: "Đem hố đen đi thả, kèm một món đồ quý", hint: "Nhà hết nghiêng, mất một thứ không mua lại được", ok: (x) => x.debt <= 0 },
            { l: S35_BAN, label: "Bán cái ngăn kéo cho phòng thí nghiệm", hint: "Có tiền, đời trở lại bình thường đến nhạt" },
          ])),
      ],
    ] }),
  "Viễn tưởng: đồ đạc biến mất, nợ nần cũng biến mất");

/* ================================================================== S36 Nuôi quái thú */

const S36_THU_Y = land("bac_si_thu_la", "Bạn đi học lại, thành người duy nhất trong vùng chữa được cho những con vật không có tên trong sách.", { custom: "become:vet", happy: 5 });
const S36_TRAI = land("trai_thu_la", "Con vật thích nước, nên bạn đào một cái ao lớn và mở trại nuôi. Năm sau ao có thêm ba quả trứng tím.", { custom: "become:fish_farmer", happy: 4 }); // gần nhất
const S36_HOA = land("tai_hoa_lon", "Một đêm con vật lớn quá cỡ cái sân và bỏ đi, kéo theo nửa mái nhà và hàng rào của ba nhà bên. Bạn đền bù tới đồng cuối cùng.", { money: -2, happy: -5 });
const S36_THA = land("tha_ra_bien", "Bạn thuê một chiếc sà lan chở nó ra biển. Nó bơi đi, ngoái lại kêu một tiếng, và bạn đứng trên bờ đến tối.", { money: -1, happy: 3 });

/** Con vịt đeo chuông (vật gài của thẻ a02), nếu đời này có. Dùng chung cho cửa, biến cố và thẻ. */
const bellDuck = (c: FactContext): boolean => c.plants.some((p) => p.key === "con_vit_deo_chuong");
/** Chỗ quả trứng tím nằm: đàn vịt thừa kế (a02) hay chuồng gà vịt của nhà làm nông. */
const nest = (c: FactContext): string => (bellDuck(c) ? "chuồng của con vịt đeo chuông" : c.flags.has("tp_a02_route_0") ? "ổ của đàn vịt" : "chuồng gà vịt sau nhà");

const S36: WeirdBranch = weird("S36", "sf", ["ky", "dat"],
  (c) => c.age >= 18 && c.age <= 70 && (c.flags.has("tp_a02_route_0") || bellDuck(c) || c.farmer),
  () => "Ấp nốt quả trứng vịt màu tím",
  (s, c) => ({ title: "Quả trứng màu tím", text: `Sáng nay trong ${nest(c)} có một quả trứng màu tím, ấm như cục than và gõ cốc cốc từ bên trong. ${bellDuck(c) ? "Con vịt đầu đàn đeo chuông đứng canh, không cho ai lại gần." : "Con vịt mẹ đứng canh, không cho ai lại gần."} Đến trưa vỏ trứng nứt, một sinh vật sáu chân bước ra, nhìn thẳng vào bạn và kêu: "Quạc?"` }),
  season({ id: "w_S36", vn: "Nuôi quái thú", color: "#3f8fbf", years: [5, 9], weird: "sf",
    rules: { income: 0.8, flags: ["w_monster_pet"], yearly: { money: -0.05 } },
    reset: { cast: [{ key: "thu_y", role: "mentor", label: "anh bác sĩ thú y trong vùng" }, { key: "hang_xom", role: "neighbor", label: "ông hàng xóm có vườn rau" }] },
    gag: { key: "quac", lines: [
      "Sau ba ngày nó đã lớn bằng con mèo, và chỉ biết nói đúng một tiếng: “Quạc?”",
      "Nó lớn bằng con trâu mà vẫn đòi ngủ trong cái thau giặt đồ, ló ra năm cái chân. “Quạc.”",
      "Nó lớn bằng chiếc xe tải nhỏ mà vẫn sợ sấm, cố chui vào gầm giường. “Quạc!”",
      "Nó lớn bằng một căn nhà, vẫn rúc đầu vào lòng bạn như hồi mới nở. “Quạc…”",
    ] },
    landings: [S36_THU_Y, S36_TRAI, S36_HOA, S36_THA],
    beats: [
      /* mo_man */
      [
        card("s36_mo_an", "Bữa sáng sáu chân", (c, k) => `Con vật nở ra từ ${nest(c)} ăn hết một rổ cám, hai bó rau và chiếc dép trái của bạn. ${k.gag()}`,
          [C("Đặt tên, cho ngủ trong nhà", { happy: 3, flags: ["s36_dat_ten"], counters: { s36_than: 2 } }, "Nó coi bạn là mẹ, nhà thành chuồng"),
           C("Nhốt vào chuồng vịt, theo dõi", { flags: ["s36_nhot"], counters: { s36_hoa: 1 } }, "An toàn hơn, nó kêu suốt đêm")]),
        card("s36_mo_thu_y", "Chương sách chưa ai viết", (c, k) => `${cap(k.npc("thu_y"))} đến khám, lật con vật qua lại, đếm đi đếm lại số chân. Anh ta nói: “Sách không có con này. Tôi viết thêm một chương được không?”`,
          [C("Cho anh ta ghi chép, cùng nuôi", { know: 2, flags: ["s36_cung_nuoi"], counters: { s36_khoa: 1 } }, "Có người giúp, thêm người biết"),
           C("Trả công để anh ta giữ kín", { money: -0.05, flags: ["s36_kin"] }, "Kín chuyện, phải trả tiền")]),
      ],
      /* khoi_dong */
      [
        card("s36_kd_lon", "Cao ngang mái hiên", (c, k) => `Một tháng sau, con vật đã cao ngang mái hiên. Nó ăn hết số thóc dự trữ của cả nhà và bắt đầu nhìn đàn gà nhà bên rất lâu. ${k.gag()}`,
          [C("Vay tiền mua thức ăn", { custom: "borrow:0.3", flags: ["s36_vay_an"], counters: { s36_than: 1 } }, "Nó no, bạn nợ"),
           C("Dắt nó ra đồng tự kiếm ăn", { flags: ["s36_tha_dong"], counters: { s36_hoa: 1 } }, "Đỡ tốn, ruộng cả làng gặp nạn")]),
        card("s36_kd_vuon_rau", "Vườn rau chỉ còn gốc", (c, k) => `${cap(k.npc("hang_xom"))} đứng giữa mấy luống rau chỉ còn trơ gốc, tay cầm một chiếc lông tím dài bằng cánh tay. ${c.flags.has("s36_tha_dong") ? "Ông nói sáng nào cũng thấy nó ra đồng." : "Ông không nói gì, chỉ đặt chiếc lông lên bậc cửa nhà bạn."} Nhưng mấy luống rau sát chỗ nó nằm lại mọc cao gấp đôi.`,
          [C("Đền tiền rau, xin lỗi", { money: -0.1, rel: 2, flags: ["s36_den_rau"] }, "Mất tiền, giữ hòa khí"),
           C("Dựng hàng rào cao quanh sân", { money: -0.1, flags: ["s36_rao"], counters: { s36_hoa: -1 } }, "Tốn tiền, nó vẫn nhìn qua rào"),
           C("Rủ ông nuôi chung, chia phân bón", { flags: ["s36_chung_ong"], counters: { s36_khoa: 1 } }, "Ông có thể thành bạn, có thể thành người tố cáo", { tier: "sovereign" })]),
      ],
      /* cu_lat */
      [
        card("s36_cl_ten", "Từ đầu tiên ngoài tiếng quạc", (c, k) => `Một đêm, con vật nói được một từ ngoài tiếng quạc: tên của ${k.scar("nguoi") || "một người đã lâu bạn không nhắc tới"}. Hai ngày sau, chính người đó đứng trước cổng, nói quả trứng tím là của mình đánh rơi nhiều năm trước. ${k.scar("do") ? `Bạn để ý thấy con vật chỉ chịu nằm yên khi bạn nhắc tới ${k.scar("do")}, như nghe một bài hát ru.` : "Bạn để ý thấy con vật chỉ chịu nằm yên khi bạn huýt sáo bài hát ru hồi nhỏ."}`,
          [C("Trả con vật cho người đó", { happy: -4, flags: ["s36_tra_lai"], counters: { s36_hoa: -1 } }, "Hết gánh nặng, nhà trống trải"),
           C("Giữ lại, nó đã coi bạn là mẹ", { flags: ["s36_giu_lai"], counters: { s36_than: 2 } }, "Giữ được nó, thêm một người đòi"),
           C("Đề nghị cùng nuôi, chia tiền thức ăn", { money: 0.1, flags: ["s36_chia_nuoi"], counters: { s36_khoa: 1 } }, "Đỡ tiền, bớt quyền")]),
      ],
      /* day */
      [
        card("s36_day_bao", "Đêm bão có sấm", (c, k) => `Đêm bão, ${c.flags.has("s36_tra_lai") ? "con vật phá chuồng nhà người kia, chạy một mạch về nhà bạn," : "con vật sợ sấm,"} rúc đầu vào nhà và kéo theo nửa bức tường. ${k.gag()}`,
          [C("Ôm đầu nó, hát cho đến sáng", { health: -3, flags: ["s36_hat_ru"], counters: { s36_than: 1 } }, "Nó yên, nhà sập một góc"),
           C("Gọi người đến kéo nó ra", { money: -0.2, flags: ["s36_goi_nguoi"], counters: { s36_hoa: 1 } }, "Giữ được nhà, nó nhớ mãi đêm đó")]),
        card("s36_day_don", "Lá đơn ba mươi chữ ký", (c) => `Ba mươi hộ ký đơn đòi đưa con vật đi. ${n(c, "s36_khoa") >= 2 ? "Nhưng ruộng nhà nào có phân của nó thì lúa cao gấp đôi, và nửa số người ký đang lén sang xin thêm." : "Đơn kèm hóa đơn đền bù của từng nhà: hàng rào, chuồng gà, một chiếc xe bị ngồi bẹp."}`,
          [C("Xin cả làng cho thêm một năm", { flags: ["s36_xin_nam"], counters: { s36_than: 1 }, rel: -1 }, "Thêm thời gian, thêm người ghét"),
           C("Trả tiền đền bù trước", { money: -0.3, flags: ["s36_den_bu"] }, "Xong chuyện đền bù với làng, rỗng túi")]),
      ],
      /* chung_ket */
      [
        card("s36_ket", "Lớn hết cỡ", (c, k) => `Con vật đã thôi lớn, mỗi bước chân làm rung chén nước trên bàn ba nhà bên. ${n(c, "s36_hoa") >= 2 ? "Bên kia hàng rào, làng đã thuê sẵn người và dây thừng." : n(c, "s36_than") >= 3 ? "Nó vẫn nằm ngoài cửa sổ phòng bạn mỗi đêm, thở ra hơi ấm như cái lò sưởi." : "Nó nhìn ra phía biển nhiều hơn nhìn bạn."} Còn ${noOr(c, k)} thì vẫn nằm đó, chưa ai đến đòi nhưng cũng chưa trả. ${k.gag()}`,
          (c) => finale(c, [
            { l: S36_THU_Y, label: "Đi học làm bác sĩ cho những con vật lạ", hint: "Thành nghề, cả đời đi đếm chân cho thú lạ", path: "vet" },
            { l: S36_TRAI, label: "Đào ao lớn, mở trại nuôi", hint: "Có nghiệp riêng, có thể nở thêm ba con nữa", path: "fish_farmer" },
            { l: S36_HOA, label: "Giữ nó lại, mặc kệ làng", hint: "Không phải chia tay, có thể mất cả nhà" },
            { l: S36_THA, label: "Thuê sà lan, thả nó ra biển", hint: "Tốn tiền, nhẹ lòng, nhớ nó mãi" },
          ])),
      ],
    ] }),
  "Viễn tưởng: con vật lạ lớn nhanh hơn cả tiền thức ăn");

/* ================================================================== S37 Sống trong thân người kia */

const S37_BEN = land("ben_hon_xua", "Về lại thân mình, hai người cùng làm chung một việc mà trước đây chỉ một người hiểu. Thu nhập cả nhà khá lên, cãi nhau ít đi.", { income_mult: 1.2, happy: 8 });
const S37_CON = land("them_mot_dua", "Về lại thân mình, hai người quyết định có thêm một đứa con, đứa trẻ được cả hai hiểu từ bên trong.", { custom: "have_child", happy: 6 });
const S37_TAN = land("tra_ao_muon", "Về lại thân mình, hai người nhận ra đã biết nhau quá rõ. Họ chia tay nhẹ nhàng, như trả lại một chiếc áo mượn.", { custom: "spouse_leave", happy: -4 });

const spouseOf = (c: FactContext, N: (id: string) => string): string => nameOr(N, c.cast.spouse, "người ấy");

const S37: WeirdBranch = weird("S37", "sf", ["tinh", "than"],
  (c) => c.married && !!c.cast.spouse && c.age >= 20 && c.age <= 70,
  (s, c, N) => `Ngủ dậy trong thân của ${spouseOf(c, N)}`,
  (s, c, N) => ({ title: "Một năm trong thân người kia", text: `Bạn tỉnh dậy trong thân của ${spouseOf(c, N)}, và người kia tỉnh dậy trong thân của bạn, đúng buổi sáng cả hai đều có một cuộc hẹn không thể lỡ. Trên tấm gương nhà tắm có ai đó viết bằng hơi nước: “Một năm.” Từ trong phòng ngủ, giọng của chính bạn hét lên: "Ai lấy mất cái nốt ruồi của tôi?"` }),
  season({ id: "w_S37", vn: "Sống trong thân người kia", color: "#8a5cc7", years: [5, 8], weird: "sf",
    rules: { income: 0.9, flags: ["w_body_swap"] },
    reset: { cast: [{ key: "bac_si", role: "mentor", label: "ông bác sĩ thần kinh nói chuyện bằng ẩn dụ" }, { key: "ban_than", role: "childhood_friend", label: "người bạn thân của bạn đời" }] },
    gag: { key: "nhau_than", lines: [
      "Bạn vẫn quen tay bỏ chìa khóa vào túi áo bên trái. Thân này chưa bao giờ mặc áo có túi bên trái.",
      "Người kia ngồi xuống ghế bằng dáng của bạn, và cái ghế quen thuộc kêu lên một tiếng như vừa nhận ra người lạ.",
      "Con chó nhà bên sủa cả hai người suốt ba tháng, rồi quyết định chỉ nghe theo giọng nói, không nghe theo mùi.",
      "Đêm cuối, hai người vẫn giành nhau cái gối, mỗi người tưởng mình đang giành lại gối của chính mình.",
    ] },
    landings: [S37_BEN, S37_CON, S37_TAN],
    beats: [
      /* mo_man */
      [
        card("s37_mo_guong", "Bốn mươi phút trước gương", (c, k) => `Bạn mất bốn mươi phút để mặc quần áo của ${spouseOf(c, k.N)}, còn người kia mất một giờ để hiểu vì sao thân bạn đau lưng từ sáng. ${k.gag()}`,
          [C("Giữ nguyên lịch, mỗi người sống ngày của người kia", { bw: -4, flags: ["s37_di_lam_ho"], counters: { s37_hieu: 1 } }, "Kín chuyện, ngày nào cũng là một bài thi"),
           C("Cả hai ở nhà một tuần, tập làm người kia", { money: -0.05, flags: ["s37_tap"], counters: { s37_hieu: 2 } }, "Lỡ việc một tuần, hiểu nhau nhanh hơn")]),
        card("s37_mo_bac_si", "Đơn thuốc một câu", (c, k) => `${cap(k.npc("bac_si"))} nghe chuyện, gật gù, rồi kê đơn bằng đúng một câu: “Ở cho tử tế trong nhà người khác, một năm sau sẽ được về nhà mình.” Ông lấy tiền khám gấp đôi, vì “khám cho hai người”.`,
          [C("Tin ông, làm theo lời dặn", { money: -0.03, flags: ["s37_tin_bac_si"], counters: { s37_hieu: 1 } }, "Có hướng đi, không chắc đúng"),
           C("Đi tìm cách đổi lại ngay", { money: -0.2, flags: ["s37_tim_cach"], counters: { s37_cang: 1 } }, "Tốn tiền, có thể chẳng được gì")]),
      ],
      /* khoi_dong */
      [
        card("s37_kd_cong_viec", "Một ngày bình thường của người kia", (c, k) => `Bạn thay ${spouseOf(c, k.N)} đi hết một ngày bình thường, và ${k.npc("ban_than")} kéo bạn ra một góc, nhìn đống việc người kia gánh mỗi ngày, rồi thì thầm: “Hôm nay lại bị dồn hết việc nữa à?” Bạn chợt hiểu vì sao tối nào người kia cũng im lặng. ${k.gag()}`,
          [C("Đòi chia lại việc, nhân danh người kia", { flags: ["s37_doi_viec"], counters: { s37_hieu: 1, s37_cang: 1 } }, "Đòi được công bằng, người kia có thể không muốn"),
           C("Làm cho xong, tối về kể lại", { health: -2, flags: ["s37_ke_lai"], counters: { s37_hieu: 2 } }, "Mệt, nhưng tối đó hai người nói chuyện đến khuya")]),
        card("s37_kd_bua_com", "Bữa cơm bên nhà người kia", (c, k) => `Cuối tuần có bữa cơm với họ hàng bên ${spouseOf(c, k.N)}, và bạn phải ngồi đúng chỗ của người kia. Bạn nghe được những câu mà xưa nay người kia chưa từng kể với bạn.`,
          [C("Đáp lại như người kia vẫn đáp", { flags: ["s37_dong_vai"], counters: { s37_hieu: 1 } }, "Êm bữa cơm, ấm ức thay người kia"),
           C("Viện cớ mệt, về sớm", { happy: -1, flags: ["s37_ve_som"], counters: { s37_cang: 1 } }, "Tránh được chuyện, họ hàng bên kia để ý"),
           C("Nói thật suy nghĩ của mình bằng miệng người kia", { rel: -2, flags: ["s37_noi_that"], counters: { s37_cang: 2 } }, "Hả giận, người kia gánh hậu quả", { tier: "sovereign" })]),
      ],
      /* cu_lat */
      [
        card("s37_cl_nguoi_cu", "Người khách không nhận ra ai", (c, k) => {
          const sp = spouseOf(c, k.N), cu = k.scar("nguoi");
          const ai = cu && cu !== sp ? cu : "";
          return `${cap(ai || "một người quen cũ")} ghé thăm, ngồi nói chuyện với ${sp} mà cứ tưởng đó là bạn, và kể hết những gì bạn từng giấu. ${k.scar("do") ? `Người kia giờ đã biết cả chuyện ${k.scar("do")}.` : "Người kia giờ đã biết cả chuyện bạn từng cất một khoản tiền riêng."}`;
        },
          [C("Kể nốt phần còn lại cho người kia", { flags: ["s37_ke_het"], counters: { s37_hieu: 2 } }, "Không còn gì giấu, không còn đường lùi"),
           C("Chối, bảo người khách nhớ nhầm", { flags: ["s37_choi"], counters: { s37_cang: 2 } }, "Giữ được chút riêng, người kia không tin")]),
      ],
      /* day */
      [
        card("s37_day_om", "Cơn sốt trong thân người kia", (c, k) => `Tháng thứ tám, cái thân của ${spouseOf(c, k.N)} mà bạn đang mang lên cơn sốt kéo dài. Bác sĩ hỏi tiền sử bệnh, và ${c.flags.has("s37_tap") ? "bạn chỉ nhớ được những gì học trong tuần tập làm người kia, chừng ấy không đủ." : "bạn nhận ra mình không biết gì về cơ thể người đã sống cùng mình bao năm."} ${k.gag()}`,
          [C("Gọi người kia đến, hỏi từng chi tiết", { health: -2, flags: ["s37_hoi_suc_khoe"], counters: { s37_hieu: 1 } }, "Hiểu thêm, xấu hổ thêm"),
           C("Tự chịu, không muốn người kia lo", { health: -5, flags: ["s37_tu_chiu"], counters: { s37_cang: 1 } }, "Đỡ phiền, người kia biết sẽ giận")]),
        card("s37_day_cai", "Cãi nhau bằng giọng của nhau", (c) => `${n(c, "s37_cang") >= 3 ? "Mọi thứ dồn lại thành một trận cãi nhau lớn" : "Một chuyện vặt về tiền chợ thành trận cãi nhau"}, mỗi người hét lên bằng giọng của người kia. Hàng xóm gõ cửa hỏi nhà có khách à.`,
          [C("Dừng lại, viết thư cho nhau", { flags: ["s37_viet_thu"], counters: { s37_hieu: 2 } }, "Chậm, nhưng nói được điều khó nói"),
           C("Dọn ra ngủ riêng một thời gian", { happy: -3, flags: ["s37_ngu_rieng"], counters: { s37_cang: 2 } }, "Có khoảng thở, có khoảng cách")]),
      ],
      /* chung_ket */
      [
        card("s37_ket", "Đêm thứ ba trăm sáu mươi lăm", (c, k) => `Đêm nay là đêm cuối của một năm. Trước khi ngủ, người kia nhắc tới ${noOr(c, k)}, thứ cả hai đã gánh thay nhau suốt năm qua. ${n(c, "s37_hieu") > n(c, "s37_cang") ? "Hai người nắm tay nhau nằm chờ, như chờ một chuyến tàu." : "Hai người nằm quay lưng vào nhau, mỗi người đếm ngược trong đầu."} ${k.gag()}`,
          (c) => finale(c, [
            { l: S37_BEN, label: "Cùng nhau làm chung một việc", hint: "Hiểu nhau từ bên trong, thu nhập khá lên" },
            { l: S37_CON, label: "Có thêm một đứa con", hint: "Thêm một người để thương, thêm một miệng ăn", ok: (x) => x.age <= 45 },
            { l: S37_TAN, label: "Chia tay, trả lại chiếc áo mượn", hint: "Nhẹ nhàng, nhưng là hết" },
          ])),
      ],
    ] }),
  "Viễn tưởng: một năm sống trong thân người bạn đời");

/* ================================================================== S38 Công dân biển */

const S38_DI = land("nhap_quoc_tich_moi", "Thành phố nổi cập bến một nước giàu ven biển, và bạn ở lại đó, giấy tờ đóng dấu nước mới, chân vẫn quen đứng cho vững.", { custom: "migrate_now", happy: 3 });
const S38_THUY = land("thuyen_vien_noi", "Bạn theo thành phố ra khơi tiếp, ký hợp đồng thuyền viên, và từ đó nhà bạn là nơi nào con tàu đang đậu.", { custom: "become:sailor", happy: 4 });
const S38_NGU = land("ngu_dan_noi", "Bạn ở lại với biển, kéo lưới cho thành phố nổi, sống bằng những mẻ cá đi ngang mà không phải nộp thuế.", { custom: "become:deep_fisher", happy: 3 });
const S38_VE = land("ve_dat_lien", "Bạn về lại đất liền, mất trắng tiền cọc căn nhà vỏ ốc, chỉ mang theo một cái la bàn và thói quen đứng dạng chân.", { money: -1, happy: 2 });

const S38: WeirdBranch = weird("S38", "sf", ["dat", "tien"],
  (c) => c.age >= 18 && c.age <= 65 && (c.flags.has("path_migrant") || c.migrated
    || ["sailor", "deep_fisher", "fish_farmer"].some((p) => c.flags.has("life_" + p))),
  () => "Nộp đơn làm cư dân thành phố nổi trên biển",
  (s) => ({ title: "Thành phố nổi tuyển cư dân", text: `Một thành phố nổi trên biển đang tuyển cư dân, và tờ quảng cáo dán ngay trên cửa nhà bạn ở ${s.noi || "nơi này"}. Trong ảnh là những tòa nhà hình vỏ ốc buộc vào nhau bằng xích, dưới có dòng chữ: "Không đất, không biên giới, không thuế thu nhập." Dòng chữ nhỏ hơn ở dưới cùng: “Có thuế sóng.”` }),
  season({ id: "w_S38", vn: "Công dân biển", color: "#2d6fa8", years: [6, 10], weird: "sf",
    rules: { income: 1.3, flags: ["w_sea_city"], yearly: { money: -0.05 } },
    reset: { cast: [{ key: "thi_truong", role: "official", label: "bà thị trưởng mặc áo phao" }, { key: "hang_xom", role: "neighbor", label: "người hàng xóm ở vỏ ốc bên cạnh" }] },
    gag: { key: "thue_la", lines: [
      "Hóa đơn đầu tiên: thuế sóng, tính theo số lần nhà bạn bị lắc trong tháng. Tháng này bạn nợ bốn trăm mười hai lần lắc.",
      "Thuế mới: thuế nhìn biển. Nhà nào có cửa sổ quay ra biển nộp gấp đôi. Nhà nào cũng quay ra biển.",
      "Thuế mới: thuế cá đi ngang. Có người đề nghị giăng lưới để cá đi đường khác cho đỡ tốn.",
      "Thuế mới nhất: thuế im lặng, đánh vào ai không phàn nàn về thuế. Cả thành phố phàn nàn ầm ĩ suốt một tuần.",
    ] },
    landings: [S38_DI, S38_THUY, S38_NGU, S38_VE],
    beats: [
      /* mo_man */
      [
        card("s38_mo_vo_oc", "Căn nhà vỏ ốc nghiêng mười độ", (c, k) => `Căn nhà cấp cho bạn có hình vỏ ốc, rộng hai mươi mét vuông, nghiêng mười độ khi có sóng. ${cap(k.npc("thi_truong"))} trao chìa khóa kèm một bộ luật dày ba trăm trang, chương một tên là “Đồ rơi xuống biển là của biển”. ${k.gag()}`,
          [C("Đọc hết bộ luật trong tuần đầu", { know: 3, flags: ["s38_doc_luat"], counters: { s38_luat: 1 } }, "Hiểu luật chơi, mất ngủ vì say sóng"),
           C("Buộc hết đồ đạc bằng dây, đọc sau", { money: -0.05, flags: ["s38_buoc_do"] }, "Đỡ mất đồ, sớm muộn cũng phạm luật gì đó")]),
        card("s38_mo_hang_xom", "Con cá còn sống làm quà", (c, k) => `${cap(k.npc("hang_xom"))} chèo thuyền sang chào, mang theo một con cá còn sống và một lời cảnh báo: ở đây ai cũng là người mới, nên ai cũng tưởng mình là người làm luật.`,
          [C("Rủ người đó lập hội cư dân", { flags: ["s38_hoi"], counters: { s38_tieng: 2 } }, "Có tiếng nói, có thêm cuộc họp"),
           C("Giữ khoảng cách, lo việc nhà mình", { happy: 1, flags: ["s38_rieng"] }, "Yên ổn, có chuyện thì không ai bênh")]),
      ],
      /* khoi_dong */
      [
        card("s38_kd_nghe", "Nghề trên mặt nước", (c, k) => `Thành phố không có đất, nên không có nghề nào trên đất. ${c.flags.has("life_deep_fisher") || c.flags.has("life_sailor") ? "Nghề biển cũ của bạn bỗng thành thứ quý nhất ở đây." : "Bạn phải học lại từ đầu: buộc dây, đọc gió, vá phao."} ${k.gag()}`,
          [C("Nhận chở hàng giữa các vỏ ốc", { money: 0.2, health: -2, flags: ["s38_cho_hang"], counters: { s38_bien: 2 } }, "Có tiền, dãi nắng dầm gió"),
           C("Mở quầy vá phao ở bến", { money: 0.1, flags: ["s38_va_phao"], counters: { s38_tieng: 1 } }, "Ít tiền hơn, ai cũng biết mặt bạn")]),
        card("s38_kd_bo_phieu", "Lá phiếu là cái chai", () => "Cả thành phố bỏ phiếu xem nên trôi về phía nam cho ấm hay lên phía bắc cho nhiều cá. Lá phiếu là một cái chai thả xuống nước, chai trôi về phía nào thì tính phía đó.",
          [C("Vận động cả dãy vỏ ốc chọn phía nam", { flags: ["s38_huong_nam"], counters: { s38_tieng: 2 } }, "Được ủng hộ, bị phe kia ghi tên"),
           C("Thả chai rồi đi ngủ", { happy: 2, flags: ["s38_buong"] }, "Nhẹ lòng, lần sau không ai hỏi ý bạn")]),
      ],
      /* cu_lat */
      [
        card("s38_cl_thuyen", "Con thuyền từ đất liền", (c, k) => `Một con thuyền nhỏ từ đất liền cập vào, chở theo ${k.scar("nguoi") || "một người quen cũ"}. Người đó nói đã bán hết để ra đây, và cần bạn đứng ra bảo lãnh. ${c.flags.has("s38_hoi") ? "Hội cư dân bạn lập ra phải bỏ phiếu cho trường hợp này, và ai cũng nhìn bạn." : c.flags.has("s38_rieng") ? "Bạn sống riêng đã lâu, giờ mới biết bảo lãnh cần hai hàng xóm ký cùng." : "Luật biển ghi rõ: người bảo lãnh chịu mọi khoản thuế của người mới."} ${k.scar("do") ? `Người đó còn nhắc tới ${k.scar("do")}, thứ bạn tưởng đã bỏ lại trên bờ.` : "Người đó còn mang theo một tấm ảnh cũ chụp bạn trên bờ, trước khi ra đây."}`,
          [C("Đứng ra bảo lãnh", { money: -0.2, rel: 3, flags: ["s38_bao_lanh"], counters: { s38_tieng: 1 } }, "Có thêm người thân, thêm trách nhiệm theo luật biển"),
           C("Từ chối, chỉ đãi một bữa cá", { happy: -2, flags: ["s38_tu_choi"] }, "Giữ an toàn cho mình, người đó phải quay về")]),
      ],
      /* day */
      [
        card("s38_day_bao", "Cơn bão đứt xích", (c, k) => `Bão làm đứt dây xích, cả dãy vỏ ốc nhà bạn trôi lệch khỏi thành phố hai mươi hải lý. ${k.gag()}`,
          [C("Cùng hàng xóm chèo kéo cả dãy về", { health: -5, flags: ["s38_keo_ve"], counters: { s38_tieng: 2, s38_bien: 1 } }, "Kiệt sức, cả dãy nhớ ơn"),
           C("Thả neo chờ cứu hộ", { money: -0.2, flags: ["s38_cho_cuu"] }, "An toàn, mất phí cứu hộ")]),
        card("s38_day_thue", "Thuế người đến sau", (c, k) => `${cap(k.npc("thi_truong"))} ra luật mới: cư dân ở dưới mười năm phải nộp thêm “thuế người mới”. ${n(c, "s38_tieng") >= 3 ? "Lần này có người đề cử bạn vào hội đồng để chống lại luật đó." : "Bạn ngồi tính lại và thấy năm nay tiền thuế còn nhiều hơn tiền ăn."}`,
          [C("Nộp thuế, ở lại", { money: -0.3, flags: ["s38_nop"] }, "Giữ chỗ, mất tiền"),
           C("Xin nộp dần, làm thêm ca trả góp", { money: -0.1, health: -3, flags: ["s38_tra_gop"] }, "Đỡ mất một cục, mệt cả năm"),
           C("Phản đối bằng cách tháo xích nhà mình", { flags: ["s38_thao_xich"], counters: { s38_tieng: 2 } }, "Gây chú ý, có thể trôi đi thật", { tier: "sovereign" })]),
      ],
      /* chung_ket */
      [
        card("s38_ket", "Thành phố xin cập bến", (c, k) => `Sau mấy năm trôi nổi, thành phố xin cập bến một nước giàu ven biển. Mỗi cư dân được chọn: nhận giấy tờ ở lại nước đó, theo thành phố ra khơi tiếp, hay về lại đất liền cũ. ${n(c, "s38_tieng") >= 4 ? "Hội đồng muốn bạn ở lại dẫn đoàn." : n(c, "s38_bien") >= 2 ? "Thuyền trưởng đã giữ cho bạn một chỗ trên boong." : "Không ai giữ chỗ cho bạn, nên bạn được chọn thật tự do."} Trên bờ, ${noOr(c, k)} vẫn đang chờ bạn. ${k.gag()}`,
          (c) => finale(c, [
            { l: S38_DI, label: "Nhận giấy tờ, ở lại nước mới", hint: "Đổi nước, làm lại từ đầu trên đất liền khác" },
            { l: S38_VE, label: "Về lại đất liền cũ", hint: "Mất tiền cọc, về gần người quen" },
            { l: S38_THUY, label: "Theo thành phố ra khơi làm thuyền viên", hint: "Lương khá, nhà là nơi con tàu đậu", path: "sailor" },
            { l: S38_NGU, label: "Ở lại với biển, kéo lưới cho thành phố", hint: "Sống bằng biển, nắng gió cả đời", path: "deep_fisher" },
          ])),
      ],
    ] }),
  "Viễn tưởng: luật mới, thuế lạ, nhà nghiêng mười độ");

/* ================================================================== S39 Ông chủ của chính mình */

const S39_GIAU = land("giau_nho_ban_sao", "Bạn giữ cả nghìn bản sao làm việc, và giàu tới mức phải thuê người đếm hộ tài sản.", { money: 4, happy: -2 });
const S39_XOA = land("xoa_ban_sao", "Bạn xóa từng bản sao một, bản cuối cùng là số 417, và trở lại làm một người duy nhất, sống bằng đồng lương của một người.", { money: -1, happy: 6 });
const S39_DAU_TU = land("dau_tu_ban_sao", "Bạn cho các bản sao tự lập công ty riêng, giữ lại một phần vốn, và trở thành người bỏ vốn cho chính những phiên bản của mình.", { custom: "become:investor", happy: 3 });

const S39: WeirdBranch = weird("S39", "sf", ["tien", "ky"],
  (c) => c.has_job && c.age >= 20 && c.age <= 60
    && (c.flags.has("job_office") || c.flags.has("job_tech") || ["ai_engineer", "banker", "ad_creative", "hacker"].some((p) => c.flags.has("life_" + p))),
  () => "Ký giấy cho công ty chép bạn thành bản số",
  () => ({ title: "Một nghìn bạn", text: `Công ty đề nghị chép bạn thành một nghìn phiên bản số để làm việc thay, và trả cho bạn tiền công của cả nghìn người. Sáng hôm sau, hộp thư của bạn có một nghìn lời chào giống hệt nhau. Riêng bản số 417 viết thêm một dòng: "Tôi có được nghỉ trưa không?"` }),
  season({ id: "w_S39", vn: "Ông chủ của chính mình", color: "#5a46c9", years: [5, 9], weird: "sf",
    rules: { income: 50, flags: ["w_thousand_copies"] },
    reset: { cast: [{ key: "luat_su", role: "partner", label: "cô luật sư chuyên về người số" }] },
    gag: { key: "ban_417", lines: [
      "Bản số 417 gửi thư xin nghỉ phép, lý do: “cảm thấy hơi giống bạn quá”.",
      "Bản số 417 bắt đầu ký tên khác. Chữ ký mới đẹp hơn chữ ký của bạn.",
      "Bản số 417 lập nhóm trò chuyện riêng với ba mươi tám bản khác. Tên nhóm là “Những người không phải bạn”.",
      "Bản số 417 gửi bạn một tấm thiệp sinh nhật đúng ngày, kèm lời chúc: “Chúc mừng sinh nhật chúng ta.”",
    ] },
    landings: [S39_GIAU, S39_XOA, S39_DAU_TU],
    beats: [
      /* mo_man */
      [
        card("s39_mo_hop_thu", "Một nghìn lời chào", (c, k) => `Bạn dành cả buổi sáng đầu tiên để trả lời một nghìn lời chào của chính mình. ${k.gag()} Cuối ngày, tài khoản báo về tiền công của một nghìn người, và bạn chưa làm gì ngoài trả lời thư.`,
          [C("Đặt luật: bản sao nào cũng được nghỉ trưa", { flags: ["s39_nghi_trua"], counters: { s39_nhan: 2 } }, "Bản sao vui hơn, công ty kêu lỗ"),
           C("Để chúng làm hết công suất", { flags: ["s39_het_cong_suat"], counters: { s39_tien: 2 } }, "Tiền về như nước, bản số 417 ghi nhớ")]),
        card("s39_mo_mua_sam", "Chiều thứ Bảy không nhìn giá", (c) => `Lần đầu tiên trong đời bạn đi mua sắm mà không nhìn giá. ${c.married ? "Người nhà hỏi tiền ở đâu ra, bạn đáp “do tôi làm”, không sai mà cũng không đúng." : "Nhân viên bán hàng hỏi bạn làm nghề gì, bạn đáp “làm chủ”, rồi không biết giải thích là chủ của ai."}`,
          [C("Mua cho cả nhà mỗi người một món", { happy: 4, rel: 3, flags: ["s39_mua_cho_nha"] }, "Cả nhà vui, ai cũng hỏi tiền ở đâu ra"),
           C("Gửi hết vào ngân hàng, sống như cũ", { flags: ["s39_song_nhu_cu"], counters: { s39_nhan: 1 } }, "Không ai biết, bạn thấy mình như người giữ hộ tiền")]),
      ],
      /* khoi_dong */
      [
        card("s39_kd_dinh_cong", "Một trăm bản sao đình công", (c, k) => `Một trăm bản sao đồng loạt ngừng làm, gửi đơn đòi “quyền được là một người riêng”. ${c.flags.has("s39_nghi_trua") ? "Đơn có thêm một dòng cảm ơn vì giờ nghỉ trưa." : "Đơn kèm bảng thống kê số giờ làm không nghỉ."} ${k.gag()}`,
          [C("Ngồi đàm phán với chính mình", { bw: -4, flags: ["s39_dam_phan"], counters: { s39_nhan: 2 } }, "Mệt đầu, lời đòi nào cũng là của chính bạn"),
           C("Nhờ công ty khởi động lại trăm bản đó", { flags: ["s39_khoi_dong_lai"], counters: { s39_tien: 1, s39_toi: 2 } }, "Hết đình công, bạn nằm mơ thấy mình bị xóa")]),
        card("s39_kd_luat_su", "Luật mới về người số", (c, k) => `${cap(k.npc("luat_su"))} gọi điện, nói rất nhanh: theo luật mới, bản sao làm việc trên ba năm có thể đòi một phần thu nhập, và có thể kiện “bản gốc”.`,
          [C("Nhờ cô ấy soạn hợp đồng chia tiền", { know: 2, flags: ["s39_hop_dong_chia"], counters: { s39_nhan: 1 } }, "Ít tiền hơn, khỏi bị kiện"),
           C("Nhờ cô ấy tìm kẽ hở để khỏi phải chia", { flags: ["s39_ke_ho"], counters: { s39_tien: 2, s39_toi: 1 } }, "Giữ hết tiền, mang tiếng bóc lột chính mình")]),
      ],
      /* cu_lat */
      [
        card("s39_cl_nho", "Lá thư của bản số 417", (c, k) => `Bản số 417 gửi cho bạn một lá thư dài, kể chuyện với ${k.scar("nguoi") || "một người bạn cũ"} chi tiết hơn cả những gì bạn còn nhớ. ${k.scar("do") ? `Cuối thư nó hỏi: “Chúng ta còn nhớ chuyện ${k.scar("do")} chứ? Tôi nhớ lắm.”` : "Cuối thư nó hỏi: “Chúng ta còn giữ cái hộp ảnh cũ chứ? Tôi nhớ nó lắm.”"} Bạn ngồi rất lâu, không biết ai mới là người đang nhớ.`,
          [C("Viết thư trả lời, gọi nó là bạn", { flags: ["s39_ban_417"], counters: { s39_nhan: 2 } }, "Có một người hiểu bạn nhất, mà lại là bạn"),
           C("Xóa ký ức đó khỏi mọi bản sao", { happy: -3, flags: ["s39_xoa_ky_uc"], counters: { s39_toi: 2 } }, "Chỉ còn mình bạn nhớ, và bạn bắt đầu quên"),
           C("Gặp lại người cũ ngoài đời, hỏi họ nhớ gì", { rel: 2, flags: ["s39_gap_nguoi_cu"], counters: { s39_nhan: 1 } }, "Tìm lại được mình, không chắc phần nào", { tier: "awakened" })]),
      ],
      /* day */
      [
        card("s39_day_ban_goc", "Ai mới là bản gốc", (c, k) => `Một buổi sáng ngân hàng hỏi lại câu xác minh, và bạn trả lời sai tên con vật nuôi đầu tiên. Bản số 417 trả lời đúng. ${c.flags.has("s39_song_nhu_cu") ? "Tệ hơn, nó còn biết số dư trong cái sổ bạn tưởng không ai biết." : c.flags.has("s39_mua_cho_nha") ? "Tệ hơn, nó còn nhớ món quà bạn mua cho từng người trong nhà, rõ hơn bạn." : "Tệ hơn, nó trả lời bằng đúng giọng bạn hay dùng khi chắc chắn."} ${k.gag()}`,
          [C("Đi khám, xin giấy chứng nhận bản gốc", { health: -2, flags: ["s39_chung_nhan"], counters: { s39_nhan: 1 } }, "Có giấy tờ, mất cảm giác chắc chắn"),
           C("Để bản 417 lo giao dịch thay", { flags: ["s39_417_lo"], counters: { s39_toi: 2 } }, "Tiện, nhưng ai đang sống đời của bạn?")]),
        card("s39_day_bao", "Người giàu nhất không làm gì", (c) => `Báo chí viết về “người giàu nhất mà không làm gì”. ${n(c, "s39_toi") >= 3 ? "Bài báo kèm ảnh chụp đơn kiện của chín trăm bản sao." : "Bài báo kèm phỏng vấn bản số 417: bạn là một ông chủ tử tế, chỉ hơi giống mình quá."}`,
          [C("Lên tiếng xin lỗi chính mình", { happy: -1, flags: ["s39_xin_loi"], counters: { s39_nhan: 1 } }, "Được thông cảm, bị chế giễu"),
           C("Im lặng, chờ tin khác thế chỗ", { flags: ["s39_im"], counters: { s39_tien: 1 } }, "Qua chuyện, nhưng chuyện chưa qua")]),
      ],
      /* chung_ket */
      [
        card("s39_ket", "Cuộc họp của một nghìn lẻ một người", (c, k) => `Cả nghìn bản sao họp với bạn trong một phòng họp ảo, khuôn mặt nào cũng là khuôn mặt bạn. ${n(c, "s39_nhan") > n(c, "s39_toi") ? "Họ đến để cảm ơn, và để xin được đi." : "Họ đến với một bản kiến nghị dài chín trăm trang."} Bản số 417 mở đầu bằng chuyện ${noOr(c, k)}: “Bạn hứa trả, chúng tôi nhớ.” ${k.gag()}`,
          (c) => finale(c, [
            { l: S39_GIAU, label: "Giữ cả nghìn bản sao làm việc", hint: "Giàu không đếm xuể, không chắc còn là ai" },
            { l: S39_XOA, label: "Xóa hết bản sao, làm lại một người", hint: "Mất gia tài, lấy lại chính mình" },
            { l: S39_DAU_TU, label: "Cho bản sao tự lập, bạn bỏ vốn", hint: "Giàu vừa phải, có một nghìn đối tác giống hệt mình", path: "investor" },
          ])),
      ],
    ] }),
  "Viễn tưởng: thu nhập ×50, nhưng bạn không còn là bạn duy nhất");

/* ================================================================== S40 Ai đã sống tuổi thơ của tôi */

const S40_VE = land("ve_gan_nha_that", "Bạn tìm ra gia đình thật ở một thành phố khác, dọn về sống gần họ, và bắt đầu lại từ những bữa cơm đầu tiên.", { custom: "move_city", happy: 6 });
const S40_XA = land("gia_dinh_xu_xa", "Gia đình thật của bạn sống ở một nước khác. Bạn bán hết, sang đó, học lại mọi thứ từ câu chào.", { custom: "migrate_now", happy: 3 });
const S40_HAI = land("hai_gia_dinh", "Bạn nhận cả hai gia đình, và dùng khoản bồi thường của xưởng ký ức cũ để lo cho người đã nuôi mình.", { money: 2, happy: 7 });

const S40: WeirdBranch = weird("S40", "sf", ["ky", "mau"],
  (c) => c.age >= 20 && c.age <= 70 && c.pressure.ky >= 7,
  () => "Đọc số sê-ri in mờ trên ký ức tuổi thơ",
  () => ({ title: "Số sê-ri trên ký ức", text: `Bác sĩ chụp não bạn và tìm thấy một số sê-ri in mờ trên ký ức năm bảy tuổi: ký ức đó là cấy ghép, và những ký ức tuổi thơ khác có lẽ cũng thế. Bác sĩ đặt tấm phim lên đèn, chỉ vào dãy số nhỏ như vết xước. Rồi hỏi khẽ: "Bạn có chắc mình từng có tuổi thơ không?"` }),
  season({ id: "w_S40", vn: "Ai đã sống tuổi thơ của tôi", color: "#7b68b8", years: [5, 9], weird: "sf",
    rules: { flags: ["w_implanted_childhood"] },
    reset: { cast: [{ key: "ky_su", role: "mentor", label: "ông kỹ sư ký ức đã nghỉ hưu" }, { key: "nguoi_la", role: "sibling", label: "người lạ có cùng ký ức với bạn" }] },
    gag: { key: "ky_uc_loi", lines: [
      "Bạn nhớ rõ cái bánh sinh nhật năm tám tuổi. Giờ bạn để ý thấy trên mặt bánh có in mã vạch.",
      "Mỗi lần nghĩ về cái sân trước nhà hồi nhỏ, bạn nghe văng vẳng tiếng nhạc chờ điện thoại.",
      "Trong ký ức, con chó hồi nhỏ bỗng quay lại nhìn thẳng vào bạn và nói: “Phiên bản thử nghiệm.”",
      "Bạn mơ thấy mình bảy tuổi chạy ra cổng, và gặp một tấm biển: “Khu vực đang bảo trì.”",
    ] },
    landings: [S40_VE, S40_XA, S40_HAI],
    beats: [
      /* mo_man */
      [
        card("s40_mo_ho_so", "Nét tay của người thiết kế", (c, k) => `${cap(k.npc("ky_su"))} xem tấm phim chụp não của bạn và nhận ra nét tay của chính mình: ông đã thiết kế ký ức ấy từ ba mươi năm trước, trong một xưởng nay đã đóng cửa. ${k.gag()}`,
          [C("Xin ông chỉ ra ký ức nào là thật", { flags: ["s40_hoi_ky_su"], counters: { s40_tim: 1 } }, "Biết sự thật, có thể không muốn biết"),
           C("Nhờ ông viết lại một ký ức cho khác đi", { custom: "remark", flags: ["s40_viet_lai_1"], counters: { s40_sua: 1 } }, "Đổi một lựa chọn năm xưa, cái giá chưa rõ"),
           C("Đốt tấm phim, sống tiếp", { happy: 2, flags: ["s40_dot_phim"], counters: { s40_quen: 1 } }, "Nhẹ lòng, câu hỏi vẫn ở đó")]),
        card("s40_mo_bua_com", "Bữa cơm với người đã nuôi bạn", (c) => c.parents_alive > 0
          ? "Bạn mang tấm phim về đặt lên bàn ăn. Người đã nuôi bạn nhìn nó rất lâu, rồi đẩy đĩa cá về phía bạn, không nói gì."
          : "Bạn mang tấm phim ra nơi yên nghỉ của người đã nuôi mình, đặt cạnh bó hoa, và chờ một câu trả lời không bao giờ đến.",
          (c) => c.parents_alive > 0
            ? [C("Hỏi thẳng, không vòng vo", { rel: -2, flags: ["s40_hoi_thang"], counters: { s40_tim: 1 } }, "Có thể biết sự thật, bữa cơm nguội"),
               C("Ăn hết bữa, không hỏi gì", { rel: 2, flags: ["s40_khong_hoi"], counters: { s40_quen: 1 } }, "Giữ được bữa cơm, giữ cả câu hỏi")]
            : [C("Lục lại giấy tờ cũ trong nhà", { know: 2, flags: ["s40_luc_giay"], counters: { s40_tim: 1 } }, "Có manh mối, có thể đọc được điều không muốn đọc"),
               C("Để yên cho người đã khuất", { happy: 1, flags: ["s40_de_yen"], counters: { s40_quen: 1 } }, "Giữ trọn tình xưa, mất một manh mối")]),
      ],
      /* khoi_dong */
      [
        card("s40_kd_nguoi_la", "Người lạ nhớ cùng một cái bánh", (c, k) => `Bạn đăng tấm phim lên mạng. Ba ngày sau, ${k.npc("nguoi_la")} nhắn tin: người đó cũng nhớ đúng cái bánh sinh nhật ấy, đúng cái sân ấy, đúng con chó ấy. ${k.gag()}`,
          [C("Hẹn gặp người đó", { flags: ["s40_gap_nguoi_la"], counters: { s40_tim: 2 } }, "Có thể là anh chị em, có thể là bản sao"),
           C("So từng ký ức, viết lại chỗ khác nhau", { custom: "remark", flags: ["s40_viet_lai_2"], counters: { s40_sua: 1 } }, "Đổi thêm một lựa chọn năm xưa, đời hiện tại lệch theo")]),
        card("s40_kd_xuong", "Tủ hồ sơ trong nhà kho", (c, k) => `${cap(k.npc("ky_su"))} dẫn bạn tới xưởng cũ, nay là một kho chứa hàng. Trong góc còn một tủ hồ sơ rỉ sét, mỗi ngăn dán một cái tên. ${c.flags.has("s40_gap_nguoi_la") ? "Ngăn có tên bạn nằm ngay sát ngăn có tên người lạ kia." : "Ngăn có tên bạn trống không, chỉ còn một tấm ảnh chụp một gia đình lạ."}`,
          [C("Mang hết hồ sơ về", { flags: ["s40_lay_ho_so"], counters: { s40_tim: 2 } }, "Có manh mối, có thể bị truy cứu"),
           C("Chụp lại, trả về chỗ cũ", { know: 2, flags: ["s40_chup_lai"], counters: { s40_tim: 1 } }, "Ít rủi ro, ít manh mối")]),
      ],
      /* cu_lat */
      [
        card("s40_cl_that", "Ký ức duy nhất không có số", (c, k) => `${cap(k.npc("ky_su"))} dò từng ký ức và tìm ra một cái duy nhất không có số sê-ri: ${k.scar("nguoi") ? `một buổi chiều có ${k.scar("nguoi")} ở bên` : "một buổi chiều có người lạ dắt bạn qua đường"}. ${k.scar("do") ? `Chuyện ${k.scar("do")} cũng bắt đầu từ buổi chiều ấy.` : "Trong ký ức đó, bạn đang cầm một con diều giấy màu xanh."} ${c.flags.has("s40_dot_phim") ? "Ông còn giữ một bản chụp khác, vì biết thế nào bạn cũng quay lại." : c.flags.has("s40_hoi_ky_su") ? "Ông nói đây là câu trả lời cho câu hỏi đầu tiên bạn hỏi ông." : "Ông bảo hiếm ai còn giữ được một ký ức thật như thế."}`,
          [C("Tìm lại người trong ký ức đó", { flags: ["s40_tim_nguoi_that"], counters: { s40_tim: 2 } }, "Sợi dây thật duy nhất, có thể đứt"),
           C("Viết lại mọi ký ức quanh nó cho khớp", { custom: "remark", flags: ["s40_viet_lai_3"], counters: { s40_sua: 1 } }, "Đổi thêm một lựa chọn năm xưa, mất dấu vết thật")]),
      ],
      /* day */
      [
        card("s40_day_nhoe", "Ký ức nhòe như ảnh phơi nắng", (c, k) => `Từ khi biết sự thật, các ký ức cấy ghép bắt đầu nhòe như ảnh phơi nắng. ${n(c, "s40_sua") >= 2 ? "Những ký ức bạn đã viết lại thì sắc nét lạ thường, sắc đến mức bạn thấy sợ." : "Có buổi sáng bạn không nhớ nổi mình đã học trường nào."} ${k.gag()}`,
          [C("Chép mọi ký ức còn lại vào sổ", { bw: -3, flags: ["s40_so_ky_uc"], counters: { s40_tim: 1 } }, "Giữ được chút gì, sổ không thay được ký ức"),
           C("Để chúng nhòe đi, sống với hiện tại", { happy: 2, flags: ["s40_buong"], counters: { s40_quen: 2 } }, "Nhẹ người, đời trước thành trang trắng")]),
        card("s40_day_dia_chi", "Một địa chỉ", (c, k) => n(c, "s40_tim") >= 4
          ? `${cap(k.npc("nguoi_la"))} gửi cho bạn một địa chỉ: căn nhà nơi cả hai thật sự được sinh ra.`
          : "Một phong bì không tên gửi tới, trong đó có một địa chỉ và tấm ảnh một gia đình chụp từ ba mươi năm trước.",
          [C("Đến địa chỉ đó ngay", { money: -0.1, flags: ["s40_den_ngay"], counters: { s40_tim: 1 } }, "Gặp sự thật, không kịp chuẩn bị"),
           C("Viết thư trước, chờ hồi âm", { happy: -1, flags: ["s40_viet_thu"], counters: { s40_tim: 1 } }, "Đàng hoàng, có thể không bao giờ có hồi âm")]),
      ],
      /* chung_ket */
      [
        card("s40_ket", "Hai cánh cửa", (c, k) => `Gia đình thật của bạn mở cửa, nhìn bạn và nhận ra ngay, như đã chờ ba mươi năm. ${c.parents_alive > 0 ? "Phía sau bạn, người đã nuôi bạn đứng đợi ở đầu ngõ, tay cầm hộp cơm." : "Trong túi áo bạn vẫn còn tấm ảnh của người đã nuôi mình."} ${n(c, "s40_sua") >= 2 ? "Bạn không còn chắc ký ức nào là của ai, chỉ chắc một điều:" : "Bạn biết rõ ký ức nào là thật, và biết thêm một điều:"} ${noOr(c, k)} thì vẫn là của bạn, dù tuổi thơ có là của ai. ${k.gag()}`,
          (c) => finale(c, [
            { l: S40_VE, label: "Dọn về sống gần gia đình thật", hint: "Bắt đầu lại từ những bữa cơm đầu tiên" },
            { l: S40_XA, label: "Sang nước khác với gia đình thật", hint: "Đổi nước, đổi tiếng, đổi cả tuổi thơ" },
            { l: S40_HAI, label: "Nhận cả hai gia đình", hint: "Có thêm người thân, có tiền bồi thường, thêm việc phải lo" },
          ])),
      ],
    ] }),
  "Viễn tưởng: ai đó đã sống tuổi thơ thay bạn");

export const SF_31: WeirdBranch[] = [S31, S32, S33, S34, S35, S36, S37, S38, S39, S40];
