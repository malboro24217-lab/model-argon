/**
 * 96 con đường đời. Mỗi con đường là một danh tính người chơi có thể trở thành: qua năng khiếu hồi nhỏ (cảnh chọn nghề),
 * qua thẻ "cơ hội" giữa đời, qua biến cố, hoặc qua ô "Tôi muốn…" (việc lớn `theo_duong`).
 *
 * fam: họ nghề gần nhất (để các gói nghề có sẵn vẫn chạy) — null nếu không phải một nghề (tị nạn, nội trợ…).
 * incomeMult: hệ số thu nhập so với mức nền của nước/xuất thân khi bước vào (các nhịp truyện sau sẽ đẩy lên/xuống).
 * ages: khoảng tuổi có thể bước vào. talent: tính khí dễ có năng khiếu này (rỗng = không có thẻ năng khiếu).
 */
export type PathKind = "career" | "life";
export interface PathDef { id: string; vn: string; group: string; fam: string | null; title: string; incomeMult: number; ages: [number, number]; talent: string[]; kind: PathKind }

const P = (id: string, vn: string, group: string, fam: string | null, title: string, incomeMult: number, ages: [number, number], talent: string[], kind: PathKind = "career"): PathDef => ({ id, vn, group, fam, title, incomeMult, ages, talent, kind });

export const PATH_GROUPS: Record<string, string> = {
  arts: "Nghệ thuật & giải trí", media: "Truyền thông & mạng", sport: "Thể thao", state: "Quyền lực & nhà nước",
  money: "Kinh doanh & làm giàu", under: "Thế giới ngầm", serve: "Phụng sự & tâm linh", mind: "Khoa học & tri thức",
  road: "Biển, trời, đường xa", away: "Phận đi xa", craft: "Tay nghề & làng nghề", street: "Đời thường đặc biệt",
};

export const PATH_LIST: PathDef[] = [
  // Nghệ thuật & giải trí
  P("singer", "ca sĩ", "arts", "market", "ca sĩ", 0.8, [15, 40], ["bold", "kind"]),
  P("actor", "diễn viên", "arts", "market", "diễn viên", 0.8, [16, 40], ["bold"]),
  P("writer", "nhà văn", "arts", null, "nhà văn", 0.6, [18, 60], ["curious"]),
  P("painter", "họa sĩ", "arts", null, "họa sĩ", 0.6, [16, 55], ["curious", "kind"]),
  P("photographer", "nhiếp ảnh gia", "arts", "market", "nhiếp ảnh gia", 0.9, [18, 50], ["curious"]),
  P("folk_musician", "nghệ nhân âm nhạc dân gian", "arts", null, "nghệ nhân đàn hát", 0.6, [12, 50], ["kind", "tough"]),
  P("comedian", "diễn viên hài", "arts", "market", "diễn viên hài", 0.8, [18, 45], ["bold"]),
  P("dancer", "vũ công", "arts", "market", "vũ công", 0.7, [12, 30], ["bold", "tough"]),
  // Truyền thông & mạng
  P("journalist", "nhà báo điều tra", "media", "office", "phóng viên", 1.0, [21, 45], ["curious", "bold"]),
  P("tv_host", "MC truyền hình", "media", "office", "MC", 1.2, [20, 40], ["bold"]),
  P("streamer", "streamer", "media", "tech", "streamer", 0.7, [15, 35], ["bold", "curious"]),
  P("influencer", "người có ảnh hưởng trên mạng", "media", "market", "KOL", 0.8, [16, 40], ["bold"]),
  P("vlogger", "vlogger du lịch", "media", "market", "vlogger", 0.7, [18, 40], ["curious"]),
  P("film_director", "đạo diễn phim", "media", "office", "đạo diễn", 0.9, [22, 50], ["curious", "bold"]),
  P("ad_creative", "dân quảng cáo", "media", "office", "người làm quảng cáo", 1.2, [21, 45], ["curious"]),
  P("radio_voice", "phát thanh viên", "media", "office", "phát thanh viên", 1.0, [20, 50], ["kind"]),
  // Thể thao
  P("footballer", "cầu thủ bóng đá", "sport", null, "cầu thủ", 1.0, [12, 22], ["tough", "bold"]),
  P("boxer", "võ sĩ", "sport", null, "võ sĩ", 0.8, [14, 28], ["tough", "bold"]),
  P("runner", "vận động viên điền kinh", "sport", null, "vận động viên", 0.7, [12, 24], ["tough"]),
  P("esports", "tuyển thủ thể thao điện tử", "sport", "tech", "tuyển thủ eSports", 0.9, [14, 24], ["curious", "bold"]),
  P("coach", "huấn luyện viên", "sport", "teach", "huấn luyện viên", 1.0, [25, 55], ["tough", "kind"]),
  P("referee", "trọng tài", "sport", "office", "trọng tài", 0.9, [22, 45], ["tough"]),
  P("chess", "kỳ thủ cờ vua", "sport", null, "kỳ thủ", 0.6, [8, 25], ["curious"]),
  P("climber", "vận động viên leo núi", "sport", null, "vận động viên leo núi", 0.6, [18, 40], ["tough", "bold"]),
  // Quyền lực & nhà nước
  P("official", "cán bộ nhà nước", "state", "office", "cán bộ", 1.0, [22, 40], ["tough"]),
  P("politician", "chính trị gia", "state", "office", "đại biểu", 1.3, [28, 55], ["bold"]),
  P("police", "cảnh sát", "state", "office", "cảnh sát", 1.0, [18, 30], ["tough", "bold"]),
  P("soldier", "quân nhân", "state", null, "quân nhân", 0.9, [18, 30], ["tough"]),
  P("judge", "thẩm phán", "state", "office", "thẩm phán", 1.4, [30, 50], ["curious"]),
  P("lawyer", "luật sư", "state", "office", "luật sư", 1.4, [24, 45], ["curious", "bold"]),
  P("diplomat", "nhà ngoại giao", "state", "office", "nhà ngoại giao", 1.5, [25, 45], ["curious"]),
  P("customs", "cán bộ hải quan", "state", "office", "cán bộ hải quan", 1.2, [22, 40], ["tough"]),
  // Kinh doanh & làm giàu
  P("startup", "người khởi nghiệp", "money", "tech", "nhà sáng lập", 0.6, [20, 50], ["curious", "bold"]),
  P("real_estate", "dân bất động sản", "money", "market", "môi giới bất động sản", 1.2, [22, 55], ["bold"]),
  P("restaurateur", "đầu bếp, chủ nhà hàng", "money", "market", "đầu bếp", 0.9, [18, 50], ["kind", "curious"]),
  P("border_trader", "dân buôn biên giới", "money", "market", "thương lái", 1.1, [18, 50], ["bold"]),
  P("investor", "nhà đầu tư", "money", "office", "nhà đầu tư", 1.0, [22, 60], ["bold", "curious"]),
  P("factory_owner", "chủ xưởng", "money", "factory", "chủ xưởng", 1.3, [25, 55], ["tough"]),
  P("ecommerce", "người bán hàng online", "money", "market", "chủ shop online", 0.9, [16, 50], ["bold"]),
  P("banker", "nhân viên ngân hàng", "money", "office", "chuyên viên ngân hàng", 1.3, [22, 40], ["curious"]),
  // Thế giới ngầm
  P("smuggler", "dân buôn lậu", "under", "driver", "người chở hàng", 1.3, [18, 45], ["bold"]),
  P("loan_shark", "người cho vay nặng lãi", "under", "market", "chủ cầm đồ", 1.3, [22, 55], ["bold", "tough"]),
  P("scammer", "kẻ lừa đảo trên mạng", "under", "tech", "nhân viên 'công ty'", 1.2, [16, 40], ["bold"]),
  P("gangster", "giang hồ", "under", null, "đàn em", 0.9, [14, 30], ["bold", "tough"]),
  P("gambler", "dân cờ bạc chuyên nghiệp", "under", null, "con bạc", 0.6, [18, 50], ["bold"]),
  P("counterfeiter", "kẻ làm hàng giả", "under", "factory", "chủ xưởng 'hàng xách tay'", 1.2, [22, 50], ["curious"]),
  P("hacker", "hacker", "under", "tech", "hacker", 1.1, [15, 35], ["curious"]),
  P("ex_convict", "người từng ở tù", "under", null, "người mới ra tù", 0.5, [16, 60], [], "life"),
  // Phụng sự & tâm linh
  P("monk", "người tu hành", "serve", null, "nhà tu hành", 0.2, [12, 60], ["kind", "curious"], "life"),
  P("priest", "linh mục, nữ tu", "serve", null, "chức sắc tôn giáo", 0.3, [18, 40], ["kind"], "life"),
  P("aid_doctor", "bác sĩ thiện nguyện", "serve", "health", "bác sĩ thiện nguyện", 0.8, [25, 55], ["kind"]),
  P("activist", "nhà hoạt động xã hội", "serve", null, "nhà hoạt động", 0.5, [18, 60], ["kind", "bold"]),
  P("environmentalist", "người bảo vệ môi trường", "serve", null, "kiểm lâm, nhà bảo tồn", 0.7, [18, 50], ["kind", "tough"]),
  P("social_worker", "nhân viên công tác xã hội", "serve", "teach", "nhân viên xã hội", 0.8, [22, 50], ["kind"]),
  P("fortune_teller", "thầy bói, thầy phong thủy", "serve", "market", "thầy", 1.0, [25, 65], ["curious"]),
  P("firefighter", "lính cứu hỏa", "serve", null, "lính cứu hỏa", 0.9, [18, 30], ["tough", "bold"]),
  // Khoa học & tri thức
  P("scientist", "nhà khoa học", "mind", "office", "nghiên cứu viên", 1.0, [22, 40], ["curious"]),
  P("inventor", "nhà sáng chế", "mind", "build", "nhà sáng chế", 0.8, [14, 60], ["curious"]),
  P("professor", "giảng viên đại học", "mind", "teach", "giảng viên", 1.1, [24, 45], ["curious"]),
  P("archaeologist", "nhà khảo cổ", "mind", "office", "nhà khảo cổ", 0.9, [22, 40], ["curious"]),
  P("surgeon", "bác sĩ phẫu thuật", "mind", "health", "bác sĩ phẫu thuật", 1.8, [24, 35], ["curious", "tough"]),
  P("ai_engineer", "kỹ sư trí tuệ nhân tạo", "mind", "tech", "kỹ sư AI", 1.6, [20, 45], ["curious"]),
  P("architect", "kiến trúc sư", "mind", "office", "kiến trúc sư", 1.3, [22, 40], ["curious"]),
  P("vet", "bác sĩ thú y", "mind", "health", "bác sĩ thú y", 1.1, [22, 45], ["kind"]),
  // Biển, trời, đường xa
  P("sailor", "thuyền viên viễn dương", "road", null, "thuyền viên", 1.4, [18, 40], ["tough", "bold"]),
  P("pilot", "phi công", "road", null, "phi công", 2.0, [20, 30], ["bold"]),
  P("deep_fisher", "ngư dân bám biển", "road", null, "ngư dân", 0.9, [14, 45], ["tough"]),
  P("long_hauler", "tài xế đường dài", "road", "driver", "tài xế đường dài", 1.1, [21, 50], ["tough"]),
  P("tour_guide", "hướng dẫn viên du lịch", "road", "market", "hướng dẫn viên", 1.0, [20, 45], ["kind", "curious"]),
  P("explorer", "nhà thám hiểm", "road", null, "nhà thám hiểm", 0.6, [20, 45], ["bold", "curious"]),
  P("flight_attendant", "tiếp viên hàng không", "road", null, "tiếp viên", 1.3, [19, 28], ["kind"]),
  P("train_driver", "lái tàu", "road", "driver", "lái tàu", 1.0, [20, 35], ["tough"]),
  // Phận đi xa
  P("labor_export", "lao động xuất khẩu", "away", "factory", "lao động ở nước ngoài", 2.0, [18, 40], [], "life"),
  P("refugee", "người tị nạn", "away", null, "người tị nạn", 0.3, [1, 70], [], "life"),
  P("miner", "thợ mỏ", "away", null, "thợ mỏ", 1.2, [18, 45], ["tough"]),
  P("seasonal_worker", "lao động thời vụ", "away", "farm", "lao động thời vụ", 1.3, [18, 50], ["tough"]),
  P("marriage_migrant", "người lấy chồng/vợ nước ngoài", "away", null, "người làm dâu/rể xứ lạ", 0.6, [18, 35], [], "life"),
  P("student_abroad", "du học sinh", "away", null, "du học sinh", 0.3, [16, 30], ["curious"], "life"),
  P("returnee", "người về nước lập nghiệp", "away", null, "người mới về nước", 1.0, [25, 60], [], "life"),
  P("domestic_abroad", "giúp việc ở nước ngoài", "away", "domestic", "người giúp việc ở nước ngoài", 1.8, [18, 45], [], "life"),
  // Tay nghề & làng nghề
  P("artisan", "nghệ nhân làng nghề", "craft", "build", "nghệ nhân", 0.9, [14, 60], ["kind", "tough"]),
  P("fashion", "thợ may thành nhà thiết kế", "craft", "factory", "thợ may", 0.9, [16, 45], ["curious"]),
  P("barber", "thợ cắt tóc", "craft", "market", "thợ cắt tóc", 0.9, [16, 45], ["kind"]),
  P("carpenter", "thợ mộc", "craft", "build", "thợ mộc", 1.0, [15, 50], ["tough"]),
  P("baker", "thợ làm bánh", "craft", "market", "thợ làm bánh", 0.9, [16, 50], ["kind"]),
  P("herbalist", "thầy thuốc nam", "craft", "health", "thầy thuốc", 0.8, [20, 60], ["kind", "curious"]),
  P("agritech", "nông dân công nghệ cao", "craft", "farm", "chủ trang trại", 1.1, [20, 55], ["curious"]),
  P("fish_farmer", "người nuôi trồng thủy sản", "craft", "farm", "chủ đầm tôm", 1.1, [18, 55], ["tough"]),
  // Đời thường đặc biệt
  P("shipper", "shipper", "street", "driver", "shipper", 0.8, [16, 50], ["tough"]),
  P("ride_hailing", "tài xế xe công nghệ", "street", "driver", "tài xế xe công nghệ", 0.9, [18, 55], ["tough"]),
  P("street_vendor", "người bán hàng rong", "street", "market", "người bán hàng rong", 0.6, [12, 70], ["tough", "kind"]),
  P("waste_picker", "người nhặt ve chai", "street", null, "người nhặt ve chai", 0.4, [10, 75], [], "life"),
  P("security_guard", "bảo vệ", "street", "office", "bảo vệ", 0.7, [18, 65], ["tough"]),
  P("homemaker", "người nội trợ toàn thời gian", "street", null, "nội trợ", 0, [20, 60], ["kind"], "life"),
  P("funeral_worker", "người làm nghề tang lễ", "street", "market", "người làm dịch vụ tang lễ", 1.0, [18, 60], ["tough"]),
  P("caregiver", "người chăm bệnh", "street", "health", "người chăm bệnh", 0.8, [18, 65], ["kind"]),
];

export const PATHS: Record<string, PathDef> = Object.fromEntries(PATH_LIST.map((p) => [p.id, p]));
