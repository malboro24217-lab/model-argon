/**
 * Ambient life vignettes (Valve rule database). In a quiet year the most specific matching rule writes one line.
 * Placeholders: {mother} {father} {sibling} {friend} {bully} {neighbor} {mentor} {spouse} {child} {job}.
 * Specificity = number of predicates the rule encodes; the matcher prefers higher.
 */
import type { VignetteRule } from "./types.ts";

const R = (id: string, specificity: number, when: VignetteRule["when"], lines: string[], tone: VignetteRule["tone"] = ""): VignetteRule => ({ id, specificity, when, lines, tone });

export const VIGNETTES: VignetteRule[] = [
  /* ---- tuổi thơ ---- */
  R("kid_poor_rural", 3, (c) => c.age < 10 && c.poor_country && c.family_wealth < 0.4, ["Mùa khô, {mother} gánh nước từ xa về, bạn đi theo xách cái can nhỏ.", "Tối không có điện, {father} kể chuyện cũ dưới ngọn đèn dầu.", "Bạn và {sibling} chia nhau một cái bánh, nửa lớn nửa nhỏ, cãi nhau vì nửa nào."]),
  R("kid_poor", 2, (c) => c.age < 10 && c.poor_country, ["Trưa nắng, bạn và {friend} chạy chân đất ngoài sân, không ai lo gì cả.", "{mother} vá lại cái áo lần thứ ba. Bạn mặc nó thêm một mùa."]),
  R("kid_rich", 2, (c) => c.age < 10 && c.gdp > 30000, ["Sinh nhật bạn có bánh kem và nhiều quà hơn bạn nhớ nổi.", "{father} đi công tác, gọi video mỗi tối; màn hình không thay được người."]),
  R("kid_any", 1, (c) => c.age < 10, ["Bạn học bơi ở con mương sau nhà. {sibling} đứng xem và không nhảy xuống.", "Một con chó hoang theo bạn về. {mother} cho nó ở lại."]),
  R("teen_school_poor", 3, (c) => c.age >= 10 && c.age < 18 && c.in_school && c.poor_country, ["Sáng đi học, chiều phụ {father} ngoài đồng; tối mới mở vở.", "{friend} nghỉ học đi làm. Lớp vắng thêm một chỗ.", "Cô giáo nói bạn có thể đi xa nếu có tiền. Câu sau nhỏ hơn câu trước."]),
  R("teen_school", 2, (c) => c.age >= 10 && c.age < 18 && c.in_school, ["Bạn thích một người trong lớp và không nói với ai, kể cả {friend}.", "{bully} giờ ngồi cuối lớp, ít nói hơn. Hai người tránh mắt nhau.", "Kỳ thi đến, cả nhà đi nhẹ nói khẽ."]),
  R("teen_noschool", 2, (c) => c.age >= 10 && c.age < 18 && !c.in_school, ["Bạn làm việc với người lớn, và bắt đầu nói chuyện như người lớn.", "Bạn bè cũ đi học ngang qua. Bạn giả vờ bận."]),

  /* ---- đi làm ---- */
  R("farmer_crisis", 3, (c) => c.farmer && c.econ_phase === "crisis", ["Giá nông sản rớt. {neighbor} đổ cả xe rau ra lề đường.", "Thương lái không đến. Bạn ngồi nhìn ruộng chín."], "bad"),
  R("farmer_poor", 2, (c) => c.farmer && c.poor_country, ["Mùa gặt, cả xóm xuống đồng từ bốn giờ sáng. {neighbor} mang nước chè ra.", "Trời không mưa đúng lúc. Mọi người nhìn trời và nói chuyện khác."]),
  R("farmer", 1, (c) => c.farmer, ["Bạn biết đất nhà mình bằng lòng bàn tay, từng chỗ trũng."]),
  R("worker_ratrace", 3, (c) => c.worker && c.rat_race, ["Tăng ca ba tháng liền. Lương về là nợ đi. Bạn không nhớ nổi mặt {child}.", "Đồng hồ nhà máy chạy nhanh hơn đồng hồ trong người."], "bad"),
  R("worker", 2, (c) => c.worker, ["Ca đêm. Tiếng máy không bao giờ tắt hẳn trong tai bạn.", "Ở xưởng có người mới. Bạn chỉ việc cho họ như người ta từng chỉ cho bạn."]),
  R("office_scarcity", 3, (c) => c.has_job && !c.farmer && !c.worker && c.scarcity, ["Cuối tháng, bạn tính từng bữa. Đồng nghiệp rủ cà phê, bạn nói đang kiêng.", "Hóa đơn chồng lên hóa đơn. Bạn mở ra rồi gập lại."], "bad"),
  R("office_boom", 3, (c) => c.has_job && !c.farmer && !c.worker && c.econ_phase === "boom", ["Công ty thưởng. Người ta bắt đầu nói chuyện mua nhà.", "Ai cũng bận, ai cũng tự tin. Bạn cũng thế."], "good"),
  R("office", 2, (c) => c.has_job && !c.farmer && !c.worker, ["Một ngày như mọi ngày: họp, email, bữa trưa ăn vội.", "{mentor} hỏi bạn định làm gì trong năm năm nữa. Bạn không có câu trả lời."]),
  R("retired_rich", 3, (c) => c.retired && c.rich, ["Sáng cà phê, chiều đi bộ. Bạn không nhớ lần cuối nhìn đồng hồ."], "good"),
  R("retired_poor", 3, (c) => c.retired && c.broke, ["Lương hưu không đủ thuốc. {child} gửi về một ít, không nói gì."], "bad"),
  R("retired", 2, (c) => c.retired, ["Bạn kể chuyện cũ, và nhận ra mình đã kể chuyện này rồi."]),
  R("migrated", 2, (c) => c.migrated, ["Mùa này ở quê đang gặt. Ở đây trời lạnh, bạn gọi về mà không biết nói gì.", "Giọng bạn bắt đầu lẫn tiếng nơi mới. {mother} nhận ra qua điện thoại."]),

  /* ---- gia đình ---- */
  R("parent_old_sick_poor", 4, (c) => c.parent_sick && c.poor_country && c.broke, ["Thuốc cho {mother} hết, chưa có tiền mua đợt mới. Bà bảo không sao.", "{father} ho suốt đêm. Bạn nằm nghe và tính tiền."], "bad"),
  R("parent_sick", 3, (c) => c.parent_sick, ["{mother} yếu đi thấy rõ. Mỗi lần về, bạn thấy bà nhỏ lại một chút.", "Bệnh viện, hành lang, số thứ tự. Bạn thuộc đường đi."], "bad"),
  R("parent_old", 2, (c) => c.parent_old && !c.parent_sick, ["{father} bắt đầu hỏi lại chuyện bạn vừa kể. Bạn kể lại, chậm hơn."]),
  R("kids_school_broke", 3, (c) => c.kids_school > 0 && c.broke, ["{child} cần sách mới. Bạn nói tuần sau, và tuần sau lại nói tuần sau."], "bad"),
  R("kids_small", 2, (c) => c.kids_alive > 0 && c.kids_school === 0 && c.kids_teen === 0 && c.age < 45, ["{child} gọi bạn bằng một cái tên tự nghĩ ra. Cả nhà dùng theo.", "Đêm {child} sốt, hai vợ chồng thay nhau thức."]),
  R("kids_teen", 2, (c) => c.kids_teen > 0, ["{child} đóng cửa phòng nhiều hơn. Bạn đứng ngoài một lúc rồi đi."]),
  R("married_happy", 3, (c) => c.married && c.happy > 60, ["Tối, {spouse} và bạn ngồi ngoài hiên không nói gì. Thế là đủ."], "good"),
  R("married_strain", 3, (c) => c.married && (c.scarcity || c.rat_race), ["Hai vợ chồng cãi nhau vì tiền, rồi im lặng vì cũng chẳng có gì để cãi thêm."], "bad"),
  R("married", 2, (c) => c.married, ["{spouse} mua một thứ không cần thiết. Bạn định nói rồi thôi."]),
  R("widowed", 2, (c) => c.widowed, ["Bạn vẫn dọn hai cái chén. Rồi cất một cái đi."], "bad"),
  R("single_30s", 2, (c) => !c.married && c.age >= 30 && c.age < 45, ["Đám cưới {friend}. Người ta hỏi bạn câu người ta vẫn hỏi."]),
  R("sibling_rich_me_poor", 3, (c) => !!c.cast.sibling && c.broke && c.age > 25, ["{sibling} khoe mua xe. Bạn nói chúc mừng và nghĩ về cái bếp hỏng."]),

  /* ---- sổ cái & xã hội ---- */
  R("enemies_many", 3, (c) => c.enemies >= 2, ["Ở chợ, hai người quay đi khi thấy bạn. Bạn biết vì sao."], "bad"),
  R("allies_many", 3, (c) => c.allies >= 3, ["Nhà có việc, chưa kịp gọi đã có người đến giúp."], "good"),
  R("rep_low", 2, (c) => c.reputation < 35, ["Người ta vẫn chào, nhưng không còn rủ."], "bad"),
  R("rep_high", 2, (c) => c.reputation > 70, ["Người lạ biết tên bạn trước khi bạn giới thiệu."], "good"),
  R("bully_official", 3, (c) => !!c.cast.bully && (c.roles[c.cast.bully] ?? []).includes("official"), ["Bạn thấy {bully} trên báo địa phương, cười, cắt băng khánh thành."]),
  R("hooks_held", 3, (c) => Object.keys(c.hooks).length > 0, ["Có một người biết một chuyện. Bạn gặp họ ở đám giỗ và cười nhiều hơn cần thiết."], "bad"),
  R("friend_far", 2, (c) => !!c.cast.childhood_friend && c.age > 30, ["{friend} gửi ảnh con. Hai người hẹn gặp, rồi không gặp."]),

  /* ---- trạng thái tâm trí ---- */
  R("tunnel", 3, (c) => c.bandwidth_locked, ["Bạn quên ngày sinh nhật của chính mình. Chỉ nhớ ngày trả lãi."], "bad"),
  R("scarcity", 2, (c) => c.scarcity && !c.bandwidth_locked, ["Bạn đứng trước kệ hàng lâu hơn người khác, tính nhẩm."], "bad"),
  R("sovereign_quiet", 3, (c) => c.tier === "sovereign" && !c.scarcity, ["Người ta mời bạn vào một việc. Bạn hỏi ba câu, rồi từ chối. Họ ngạc nhiên vì bạn dám.", "Bạn nhìn một kèo và thấy luôn ai sẽ thiệt. Trước đây bạn không thấy."], "good"),
  R("awakened_quiet", 2, (c) => c.tier === "awakened" && !c.scarcity, ["Bạn bắt đầu để ý ai được lợi mỗi khi người ta bảo 'ai cũng làm thế'."]),
  R("autopilot_rich", 3, (c) => c.tier === "autopilot" && c.rich, ["Bạn mua thêm một thứ. Nó làm bạn vui đúng một tuần."]),
  R("sick", 2, (c) => c.ill, ["Thuốc, tái khám, hóa đơn. Bệnh thành một phần lịch."], "bad"),
  R("healthy_old", 3, (c) => c.age > 60 && c.health > 65, ["Bạn vẫn đi bộ mỗi sáng. Người trong xóm chào từ xa."], "good"),
  R("boom", 1, (c) => c.econ_phase === "boom", ["Ngoài đường nhiều xe mới. Giá nhà nhích lên mỗi tháng."]),
  R("crisis", 1, (c) => c.econ_phase === "crisis", ["Quán cuối phố đóng cửa. Chủ quán ngồi trước cửa cả buổi sáng."], "bad"),
  R("any_poor", 1, (c) => c.poor_country, ["Mưa đầu mùa. Mái tôn nhà bạn kêu như trống."]),
  R("any", 0, () => true, ["Một năm trôi qua không có gì đáng kể, và đó cũng là một kiểu may mắn.", "Bạn đổi chỗ ngồi quen ở quán, chỉ để xem có khác gì không."]),
];
