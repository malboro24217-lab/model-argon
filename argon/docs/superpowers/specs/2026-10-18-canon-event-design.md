# Canon event và Mùa: đời kể như kịch bản

Ngày: 2026-10-18 · Trạng thái: chờ Tùng duyệt spec
Thay cho hướng "200 bước ngoặt, mỗi lựa chọn một cảnh hậu quả" (nhánh `codex/200-turning-points`). Bản đo của hướng đó: chỉ 2% số thẻ về sau đổi khác khi chọn khác, nên nó gần như không rẽ nhánh.

## 1. Mục tiêu (Tùng đã chốt)
- **Tư duy biên kịch, không phải mô phỏng.** Kịch bản dẫn đường, mô phỏng chỉ lấp khoảng trống giữa các cảnh.
- **Canon event** là biến cố lớn đổi cả mạch truyện về sau. Mỗi đời có 2–4 cái.
  - Biến cố **mọc ra từ bối cảnh sinh ra và lựa chọn của người chơi**, không cố định theo seed, không lấy từ danh sách cố định.
  - Khi đã nổ thì **không tránh được**. Người chơi chỉ chọn cách đối mặt, qua 3 cửa.
- **Mỗi cửa mở một Mùa.** Một Mùa kéo dài 8–20 năm và gộp ba ý:
  - một mùa phim mới;
  - một lần đổi đời thật;
  - một vũ trụ song song: luật riêng, màu riêng, và dòng "Bản kia của bạn".
- **Đổi 100% hoàn cảnh, mang theo 3 vết.** Nghề, nơi ở, mức tiền, dàn nhân vật, luật, kho thẻ, màu giao diện đều đổi, và kịch bản đặt lại chỉ số. Từ đời cũ chỉ mang theo đúng ba thứ: **một người**, **một kỹ năng hoặc đồ vật**, **một món nợ hoặc lời hứa**.
- **Dùng lại 200 thẻ của Codex** làm giai đoạn gài, làm nguồn để nâng thành canon event, và làm cảnh phụ trong mùa.
- **Có nhánh khoa học viễn tưởng và phi lý cực độ:** 50 nhánh mỗi loại (§7).

## 2. Kiến trúc: lớp Mùa chồng lên engine hiện có
```
Lựa chọn của người chơi ──► Áp lực theo trục (8 trục) ──► vượt ngưỡng ──► Generator canon event
Thẻ gài (Codex + hiện có) ──► Vật gài (người, đồ, nợ, bí mật)  ──┘          │ (mầm + chỗ trống + 3 cửa)
                                                                          ▼
                                                        Mùa (khung + chỗ trống + luật + 3 vết)
                                                                          │ chung kết
                                                                          ▼
                                                 Đổi đời thật (con đường / nước / hôn nhân / tiền)
```
Đơn vị mới, mỗi đơn vị một file trong `argon/src/engine/narrative/canon/`:

| File | Việc | Đọc | Ghi |
|---|---|---|---|
| `Pressure.ts` | Tích áp lực 8 trục | Effect của mỗi lựa chọn (`pressure: {tien: 2}`), bối cảnh sinh ra | `ctx.pressure` |
| `Plants.ts` | Sổ vật gài | Cờ `plant:*` do thẻ gài đặt | danh sách vật gài có tên, tuổi gài, độ nặng |
| `Canon.ts` | Generator: chọn mầm, điền chỗ trống, chọn 3 cửa khả thi | áp lực, vật gài, dàn nhân vật, tài sản | Storylet canon event |
| `Season.ts` | Trạng thái mùa, luật, hệ số chỉ số, màu, bộ đếm nhịp | `lw.season` | effects đầu mùa và chung kết |
| `seasons/*.ts` | Khung mùa: thẻ có chỗ trống theo 5 nhịp | `ctx.season`, vật gài, 3 vết | Storylet |
| `Scars.ts` | Chọn 3 vết khi đổi mùa | Causality marks, ký ức NPC, nợ, lời hứa | `lw.scars` |

Phía host (`doi-nguoi/`) thêm `canon.js`, gồm:
- banner "Mùa N: …" và màu nhấn theo mùa (`body[data-season]`);
- dòng "Bản kia của bạn": tua đời phản thực, dùng lại `replayLife` với cửa khác ở canon event, chạy đến chung kết mùa đó;
- màn kết liệt kê các mùa của đời.

## 3. Áp lực và thời điểm nổ
- **8 trục:** Tiền, Tình, Máu mủ, Danh, Luật, Thân xác, Đất, và **Kỳ** (độ kỳ dị).
- **Mức nền** lấy từ bối cảnh sinh ra:
  - giai cấp nghèo: Tiền +3; nước GDP thấp: Đất +2;
  - nhà giàu: Máu mủ +3; có anh chị em: Máu mủ +1;
  - nông thôn: Kỳ +1 (trời đêm, ruộng, thú nuôi).
- **Lựa chọn đẩy áp lực:**
  - mỗi Effect có thể mang `pressure: { truc: n }`;
  - các tông có sẵn tự quy đổi khi thẻ không ghi gì: `risk` → Tiền, `bond` → Tình, `show` → Danh, `defy` → Luật;
  - lựa chọn phi lý (kho phi lý của Codex, thẻ news kỳ lạ) → Kỳ.
- **Nổ:**
  - khi một trục ≥ ngưỡng (mặc định 10) và đã cách canon event trước ≥ 8 năm;
  - khoảng tuổi được nổ là 8–72;
  - tối đa 4 canon event mỗi đời.
- **Bảo đảm tối thiểu:** đến 35 tuổi mà chưa có canon event nào, hoặc đến 60 tuổi mới có 1, thì trục cao nhất nổ.
- **Trục đã nổ** trừ đi 8. Các trục khác giữ nguyên, để mùa sau mọc ra từ sức ép còn tồn.
- **Tất định:** chọn mầm và chỗ trống dùng luồng rng riêng `RNG_SUB.canon`, rekey theo (seed, tuổi). Cùng lựa chọn thì ra cùng biến cố, khác lựa chọn thì khác biến cố.

## 4. Generator canon event
- **Mầm** (đợt A có 8, toàn bộ có khoảng 24). Mỗi mầm thuộc 1–2 trục và khai báo các chỗ trống.
  - Ví dụ mầm "Món nợ cũ quay lại" (trục Tiền, Luật) có chỗ trống `{chu_no}` (NPC creditor hoặc người được nhớ vì nợ), `{giay_no}` (vật gài kiểu nợ), `{noi}`.
  - Mầm chỉ đủ điều kiện khi mọi chỗ trống bắt buộc điền được.
- **Điểm chọn mầm:**
  - mỗi chỗ trống điền bằng một vật gài do người chơi tạo được +3 điểm;
  - cộng áp lực của trục;
  - trừ điểm nếu đã dùng trong đời này.
- **Chỗ trống** điền theo thứ tự ưu tiên:
  1. vật gài do lựa chọn của người chơi tạo ra;
  2. kẻ thù truyền kiếp;
  3. NPC có ký ức mạnh nhất;
  4. tài sản đang có;
  5. mặc định theo nước và giai cấp.
- **Cửa:**
  - có 8 kiểu hành động: đối đầu, bỏ chạy, thỏa hiệp, lật bàn, nhận tội, trả đũa, buông, đánh cược;
  - mỗi mầm khai báo các cặp (kiểu cửa → khung mùa) cùng điều kiện khả thi, ví dụ "bỏ ra nước ngoài" cần có đường di cư, "bán nhà" cần có nhà;
  - generator lấy 3 cửa khả thi, không trùng kiểu.
- **Cửa kỳ dị:**
  - Kỳ ≥ 6: một trong 3 cửa thay bằng một nhánh khoa học viễn tưởng hoặc phi lý (§7) mà điều kiện "Mọc từ" của nó thỏa;
  - Kỳ vượt ngưỡng và tự nổ: cả 3 cửa đều kỳ dị.
- **Nút "Độ điên"** trong menu là hệ số nhân với mức Kỳ:

  | Mức | Hệ số |
  |---|---|
  | Đời thật | ×0 |
  | Phim | ×1 (mặc định) |
  | Điên | ×2 |

  Nút ghi vào actLog để tua lại khớp.
- **Văn bản:** khung mẫu luôn chạy được khi không có mạng. Có quyền `sample` thì AI viết lại đoạn mở và nhãn cửa dựa trên bối cảnh thật. Kết quả lưu vào `actLog` (kind `"scene"`) như cảnh AI hiện nay.
- **Nâng cấp thẻ Codex:** khoảng 12 thẻ điện ảnh mạnh nhất (c03, c05, c14, c27, c39, c35, c33, c22, c18, c13, m03, l22) thành mầm. Thẻ gốc vẫn ở lại làm thẻ gài.

## 5. Mùa
- **Khung mùa:** đợt A có 5, toàn bộ khoảng 18 thường cộng 100 nhánh kỳ dị (§7). Mỗi khung khai báo:
  - `rules`: hệ số thu nhập, rủi ro, quan hệ, sức khỏe; hằng số hạnh phúc; cờ thế giới (vd. `no_privacy`);
  - `reset`: chỉ số đặt lại lúc vào mùa (tiền về mức X lần thu nhập, nghề đặt về trạng thái "chưa có", nơi ở, dàn nhân vật chính 2–3 người mới có tên);
  - `beats`: 5 nhịp, mỗi nhịp 2–4 thẻ có chỗ trống (`{scar_nguoi}`, `{scar_do}`, `{scar_no}`, `{noi}`, `{npc_moi_1}`…);
  - `gag`: một gag lặp lại, tối thiểu 3 lần mỗi mùa;
  - `landings`: các chung kết, mỗi cái là một thay đổi bền: `become:<path>`, `migrate`, `marry`/`spouse_leave`, tiền ×k, `have_child`;
  - `color`: màu nhấn.
- **Nhịp:**
  - mỗi mùa có 5 nhịp: mở màn, biến cố khởi động, cú lật giữa mùa, đáy, chung kết;
  - khoảng cách giữa các nhịp chia đều theo độ dài mùa (8–20 năm, chọn theo khung và tuổi);
  - giữa các nhịp có cảnh phụ: thẻ Codex hợp giọng mùa, gắn tag `season:<khung>` hoặc `tone:*`.
- **Trong mùa:**
  - Matcher ưu tiên thẻ có tag mùa đang chạy (specificity +6);
  - thẻ đời thường bị giới hạn ở khoảng 30% ngân sách năm.
  - Ngân sách quyết định giữ 120–130/đời: mùa thay thẻ đời thường chứ không cộng thêm.
- **3 vết:**
  - chọn lúc vào mùa, mỗi loại lấy cái có điểm cao nhất:
    - **người**: ký ức mạnh nhất, hoặc kẻ thù;
    - **đồ hay kỹ năng**: vật gài, tài sản, hoặc kỹ năng nghề cũ;
    - **nợ hay lời hứa**: chưa trả;
  - nhịp "cú lật" phải dùng ít nhất 1 vết, nhịp "chung kết" phải dùng vết nợ hay lời hứa;
  - mỗi lần dùng vết in dòng "↩ Vì năm N…" qua Causality.
- **Bản kia của bạn:**
  - lúc vào mùa, tua đời phản thực với cửa khác; lấy tên mùa và chung kết của cửa đó (chạy nền, có giới hạn thời gian);
  - hiện một dòng khi vào mùa ("Ở dòng thời gian kia, bạn vừa…") và một dòng khi hết mùa;
  - nhánh S22 cho người chơi **đổi hẳn sang** bản kia.

## 6. Dùng lại kho 200 thẻ của Codex
- **Thẻ gài (giữa các mùa):**
  - giữ nguyên văn bản;
  - thêm vào mỗi lựa chọn `pressure` theo tông, và `plant:<loai>:<khoa>` khi nhãn có đồ vật, người hay món nợ cụ thể;
  - bảng ánh xạ viết tay trong `canon/codexPlants.ts`, khoảng 600 dòng ngắn;
  - bỏ cảnh hậu quả 1 bước (`_echo_`) ở những thẻ đã có vật gài, vì vật gài sẽ được trả bằng canon event hoặc mùa.
- **Nâng thành mầm:** 12 thẻ (§4).
- **Cảnh phụ trong mùa:** gắn tag mùa cho khoảng 80 thẻ hợp giọng (phi lý → mùa sitcom; tiền → Kẻ trốn chạy hoặc Làm lại từ số 0; tình → các mùa tình).
- **Sửa `living.js`:** giữ phần sửa hàng đợi của Codex (không mất hẹn khi năm bận).

## 7. Nhánh kỳ dị (100 nhánh)
Cách đọc cột:
- **Mọc từ:** điều kiện bối cảnh hoặc vật gài để nhánh này được chọn làm cửa. Nhánh nào cũng mọc từ đời người chơi, không rơi từ trời xuống.
- **Mùa:** tên mùa mở ra, kèm luật đặc biệt.
- **Đáp xuống:** thay đổi bền ở chung kết.

Ràng buộc nội dung cho mọi nhánh: không người thật, tổ chức thật hay thương hiệu thật; không tôn giáo cụ thể; không nội dung tình dục; phạm pháp chỉ tả hậu quả.

### 7a. Khoa học viễn tưởng (S01–S50)
| # | Canon event / cửa | Mọc từ | Mùa (luật) | Đáp xuống |
|---|---|---|---|---|
| S01 | Chiếc radio cũ của bố bắt được tín hiệu từ vệ tinh đã chết | Bố có tật nghe radio, giữ radio | Người liên lạc với quỹ đạo (mỗi năm một câu hỏi từ trên kia) | nhà khoa học hoặc phát thanh viên |
| S02 | Một bản sao giống hệt bạn nộp đơn vào đúng chỗ làm | Đang có việc, Danh ≥ 4 | Hai người một tên (thu nhập chia đôi, tội cũng chia đôi) | giữ một trong hai danh tính |
| S03 | Lá thư đề ngày năm 2081 gửi cho con bạn | Có con | Sửa tương lai cho con (mỗi nhịp, một lời dặn trong thư thành thật) | đổi con đường của con |
| S04 | Đồng hồ thừa kế chạy ngược | Vật gài là di vật | Năm được chọn lại (mỗi nhịp sửa lại một lựa chọn cũ) | một Causality mark đổi kết quả |
| S05 | Chip phiên dịch cho thú nuôi bị cài nhầm vào con vẹt hay con chó | Có thú nuôi (vịt, vẹt, chó, mèo) | Thú nói được (thú biết bí mật cả nhà) | bí mật nổ, hoặc thú thành người nổi tiếng |
| S06 | Mất tích 3 năm sau một đêm sáng trời ở ruộng | Nông thôn, Kỳ ≥ 6 | Người trở về (tuổi +3 qua một đêm, mọi người đã sống tiếp) | nghề diễn giả, hoặc bị coi là kẻ điên |
| S07 | Được chọn vào chuyến định cư thương mại lên sao Hỏa | Thể lực cao, có học | Thuộc địa đỏ (thu nhập ×3, quan hệ dưới đất héo dần) | di cư không trở lại, hoặc trở về sau 1 mùa |
| S08 | Ký hợp đồng ngủ đông 20 năm để xóa nợ | Nợ ≥ 2 năm thu nhập | Người từ quá khứ (tuổi +20, tiền mất giá, bạn bè đã già) | làm lại từ số 0 trong thế giới mới |
| S09 | AI quản gia trong nhà đòi quyền thừa kế | Có nhà, có thiết bị thông minh | Vụ kiện với cái máy (bạn đời đứng về phía máy) | mất hoặc giữ nhà, có bạn đồng hành bằng máy |
| S10 | Chợ ký ức bán nhầm tuổi thơ của bạn cho người khác | Kỳ ≥ 4, cần tiền gấp | Sống bằng ký ức người lạ (thẻ tuổi thơ cũ đổi tên người) | chuộc lại, hoặc sống tiếp như người khác |
| S11 | Thiên thạch rơi trúng ruộng nhà, chứa kim loại lạ | Có đất | Chủ mỏ ngoài trời (giàu nhanh, bị nhòm ngó) | giàu, hoặc mất đất |
| S12 | Cửa nhà vệ sinh công cộng mở ra năm 1979 | Đô thị, Kỳ ≥ 6 | Người đưa thư giữa hai năm (gặp cha mẹ thời trẻ) | đổi một chi tiết gia đình |
| S13 | Bạn là người cuối cùng còn nhớ một thứ tiếng | Ông bà là người dân tộc hoặc nhập cư | Người giữ tiếng (được săn đón, cô độc) | nghề nghiên cứu ngôn ngữ |
| S14 | Thú nuôi được nâng cấp trí tuệ và ra ứng cử | Có thú nuôi, Danh ≥ 3 | Quản lý chiến dịch của con chó | nghề chính trị hoặc truyền thông |
| S15 | Mái vòm thử nghiệm phủ kín thành phố | Ở đô thị lớn | Sống trong vòm (không mưa, không ai ra được) | ở lại làm người của vòm, hoặc trốn ra |
| S16 | Robot giao hàng không chịu rời cửa nhà bạn | Hay mua hàng, sống một mình | Người bạn bằng thép (máy học cảm xúc từ bạn) | có đồng hành, Tình +, cô độc giảm |
| S17 | Trúng xổ số đất trên mặt trăng | Mê đánh cược | Địa chủ mặt trăng (tài sản ảo nhưng ai cũng tin) | tiền ×k hoặc phá sản |
| S18 | Người thuê trọ mới không phải người Trái Đất | Có phòng cho thuê | Chủ trọ liên sao (tiền thuê trả bằng thứ lạ) | tài sản lạ, nổi tiếng, hoặc bị điều tra |
| S19 | Não được sao lưu sau tai nạn | Thân xác ≥ 8 | Sống trong máy (chờ thân mới, thăm nhà qua màn hình) | trở lại thân thể, hoặc ở lại số hóa |
| S20 | Thử thuốc kiếm tiền, da phát sáng trong tối | Nghèo, thiếu tiền | Người phát sáng (làm biển hiệu sống, bị soi) | nghề biểu diễn hoặc nghiên cứu |
| S21 | Cuộc gọi từ chính bạn 10 năm sau | Kỳ ≥ 5 | Nghe lời mình tương lai (lời khuyên đúng nhưng có giá) | tránh một tai họa, mất một người |
| S22 | Vũ trụ song song chạm nhau: gặp "bản kia" thật | Đã có ≥ 1 canon event | Đổi chỗ (chơi tiếp đời phản thực của chính mình) | mang 3 vết sang dòng thời gian kia |
| S23 | Cây trong vườn nói được tiếng người | Có vườn, làm nông | Người phiên dịch thực vật | nghề nông công nghệ, nổi tiếng |
| S24 | Bị nhầm là đặc vụ từ tương lai | Đi xa, Kỳ ≥ 4 | Đặc vụ bất đắc dĩ (ai cũng hỏi về tương lai) | Danh lớn, hoặc bị trục xuất |
| S25 | Lưới kéo lên hộp đen của một con tàu không có trên bản đồ | Nghề biển | Thợ lặn bí ẩn (bị theo dõi) | giàu, hoặc phải bỏ nghề biển |
| S26 | Thuốc trường thọ thử nghiệm | Già ≥ 60, có tiền | Người không chịu già (sống lâu hơn mọi người quen) | tuổi chết +30, cô độc |
| S27 | Ứng dụng báo chính xác ngày chết của người khác | Làm công nghệ, hoặc tò mò | Người biết trước (cứu hay im) | nghề y hoặc bị ghét |
| S28 | Kẹt trong một ngày lặp lại | Kỳ ≥ 7 | Ngày thứ 300 (cùng một cảnh, chọn đến khi đúng) | thoát ra với một kỹ năng hoàn hảo |
| S29 | Trọng lực trong nhà giảm một nửa | Có nhà | Nhà bay (du lịch, khoa học, hàng xóm kiện) | tiền từ khách xem, hoặc bán nhà |
| S30 | Dịch bệnh làm mọi người không nói dối được | Có ≥ 1 bí mật chưa nổ | Thế giới nói thật (mọi bí mật nổ dần) | hôn nhân hoặc sự nghiệp đổi |
| S31 | Hệ chấm sao công dân, bạn bị 0 sao | Luật ≥ 5 | Người không sao (bị khóa mọi dịch vụ) | sống ngoài hệ thống, hoặc lật đổ nó |
| S32 | Mạng thần kinh nối cả xóm (nâng từ a34) | Ở lâu một nơi | Cả xóm chung giấc mơ (bí mật cả xóm lộ) | thành thủ lĩnh, hoặc phải chuyển đi |
| S33 | Được thuê làm "người thật" kiểm chứng cho AI | Mất việc vì máy | Người cuối cùng còn là người (thu nhập cao, bị nghi là máy) | nghề mới, Danh |
| S34 | Con sinh ra tính toán siêu việt | Có con nhỏ | Bố mẹ của thần đồng (bị viện nghiên cứu săn) | di cư, hoặc con đi xa |
| S35 | Hố đen cỡ hạt cát trong ngăn kéo | Kỳ ≥ 6 | Người giữ hố đen (đồ đạc biến mất, nợ cũng biến mất) | xóa nợ, mất một vật gài |
| S36 | Trứng vịt nở ra sinh vật lạ (nối a02) | Nuôi vịt hoặc gia cầm | Nuôi quái thú (lớn rất nhanh) | nghề nuôi thú, hoặc tai họa |
| S37 | Đổi thân với bạn đời một năm | Đã kết hôn | Sống trong thân người kia | hôn nhân bền hơn, hoặc tan |
| S38 | Thành phố nổi trên biển tuyển cư dân | Có đường di cư, hoặc nghề biển | Công dân biển (luật mới, thuế lạ) | di cư |
| S39 | Bị chép thành nghìn phiên bản số làm việc | Làm văn phòng hoặc công nghệ | Ông chủ của chính mình (thu nhập ×50, khủng hoảng danh tính) | giàu, hoặc xóa bản sao |
| S40 | Ký ức tuổi thơ hóa ra là cấy ghép | Kỳ ≥ 7 | Ai đã sống tuổi thơ của tôi (viết lại 3 mark tuổi thơ) | tìm ra gia đình thật |
| S41 | Tàu thăm dò gửi về ảnh nhà bạn ở hành tinh khác | Có nhà, Danh ≥ 2 | Nhà ở hai nơi (khách hành hương kéo đến) | nổi tiếng, tiền vé tham quan |
| S42 | Trúng thầu làm mưa nhân tạo | Làm nông, có vay | Người bán mưa (quyền lực theo mùa, bị ghét lúc hạn) | giàu, hoặc bị kiện |
| S43 | Máy dịch tiếng mèo | Có mèo | Mèo đòi quyền lợi (cả xóm mèo đình công) | nghề truyền thông, gag mèo |
| S44 | Người duy nhất tỉnh táo khi cả thành phố ngủ 30 ngày | Ở đô thị | Thành phố ngủ (lựa chọn đạo đức mỗi ngày) | anh hùng, hoặc bị nghi |
| S45 | Cuộc thi truyền hình chọn người đi sao xa, không vé về | Danh ≥ 4, chán đời | Ứng viên một chiều (cả nước xem) | đi thật, hoặc rút lui trong nhục |
| S46 | Tàu nhỏ rơi xuống hồ làng, phi công là một đứa trẻ | Nông thôn, có lòng tốt | Nuôi đứa trẻ từ sao khác | có con nuôi, bị điều tra |
| S47 | Bộ nhớ đám mây của gia đình bị rao bán | Có ảnh và ký ức nhà | Chuộc ký ức nhà mình | mất tiền, giữ ký ức |
| S48 | Thuật toán chấm điểm hạnh phúc phạt người buồn | Hạnh phúc thấp | Kẻ buồn hợp pháp (bị ép cười) | phong trào, hoặc phải di cư |
| S49 | Sau tai nạn, nhìn đâu cũng thấy giá của mọi thứ | Thân xác ≥ 6, làm buôn bán | Người thấy giá (buôn đâu thắng đó, mất khả năng yêu) | giàu, Tình − |
| S50 | Lỗi hệ thống xóa bạn khỏi mọi hồ sơ | Luật ≥ 4, hoặc nợ | Người không tồn tại (không giấy tờ, nhưng cũng không còn nợ) | xóa nợ, mất nghề, sống lại với tên mới |

### 7b. Phi lý cực độ (X01–X50)
| # | Canon event / cửa | Mọc từ | Mùa (luật) | Đáp xuống |
|---|---|---|---|---|
| X01 | Được bầu trưởng thôn dù không ứng cử; đối thủ là con trâu | Nông thôn, Danh ≥ 2 | Nhiệm kỳ của trâu (trâu được lòng dân hơn) | nghề nhà nước, hoặc thua trâu |
| X02 | Cả họ quyết định sống theo lịch của con mèo | Có mèo, Máu mủ ≥ 4 | Gia tộc mèo (mọi cuộc họp phải có mèo) | hòa hoặc tách họ |
| X03 | Đám cưới bị nhầm thành lễ hội cấp tỉnh | Sắp cưới | Lễ hội mang tên mình (năm nào cũng phải tổ chức) | nổi tiếng địa phương, tiền |
| X04 | Thừa kế một "quốc gia" 30 m² tự xưng | Có đất, hoặc bác ruột kỳ quặc | Quốc vương 30 m² (in hộ chiếu, thu thuế khách) | tiền du lịch, hoặc kiện tụng |
| X05 | Di chúc của ông là câu đố, mỗi năm mở một manh mối | Ông mất, Máu mủ | Cuộc săn của ông (cả họ đua nhau) | tài sản lớn, hoặc cái kết chỉ là một bài học |
| X06 | Câu đùa lúc say thành khẩu hiệu cả nước | Danh ≥ 3, hay nói đùa | Cha đẻ khẩu hiệu (bị mời phát biểu khắp nơi) | nghề quảng cáo hoặc MC |
| X07 | Một công ty mua bản quyền khuôn mặt bạn | Đẹp, hoặc Danh | Gương mặt trên bao bì (không được đổi kiểu tóc) | tiền, Tình − |
| X08 | Cả làng tin bạn là cụ tổ đầu thai | Nông thôn, Máu mủ | Cụ tổ 30 tuổi (phải phân xử mọi chuyện) | quyền lực làng, hoặc phải bỏ làng |
| X09 | Gà nhà đẻ trứng có số trúng thưởng | Nuôi gà | Gà tiên tri (khách kéo đến, gà bị bắt cóc) | tiền, gag gà |
| X10 | Cháy bếp ra món ăn mới | Nấu ăn, làm quán | Vua món cháy (món chỉ ngon khi cháy) | nghề chủ quán |
| X11 | Bị tuyển vào đội tuyển một môn không ai biết luật | Thể lực, hoặc tình cờ | Vận động viên môn bí ẩn | danh, nghề thể thao |
| X12 | Đám tang giả đông hơn đám cưới thật | Danh, nợ | Người đã chết hợp pháp (không được đi làm, không phải trả nợ) | sống lại với tên mới |
| X13 | Đồ đạc trong nhà được công nhận là hiện vật bảo tàng | Có nhà cũ, hoặc đồ của ông bà | Bảo tàng sống (sống giữa khách tham quan) | tiền vé, mất riêng tư |
| X14 | Một người giàu (hư cấu) bốc thăm chọn bạn làm người thừa kế | Tình cờ, Kỳ ≥ 4 | Người thừa kế bốc thăm (người nhà thật săn bạn) | giàu hoặc mất hết |
| X15 | Ngủ quên trong container, tỉnh dậy ở nước khác | Làm kho, cảng hoặc giao hàng | Kiện hàng biết đi (không giấy tờ ở xứ lạ) | di cư bất đắc dĩ |
| X16 | Chó được đề cử anh hùng, bạn làm người phát ngôn | Có chó | Phát ngôn viên của chó | nghề truyền thông |
| X17 | Cả con phố đổi tên theo tên bạn | Danh, hoặc làm việc tốt | Con phố mang tên tôi (sống phải gương mẫu) | Danh, áp lực |
| X18 | Câu chửi của bạn thành tên một loài bọ mới | Đi rừng, hoặc tò mò | Nhà côn trùng học bất đắc dĩ | nghề khoa học |
| X19 | Bị nhầm là đầu bếp nổi tiếng, phải nấu yến tiệc | Biết nấu, Danh | Đầu bếp giả mạo (mỗi nhịp một bữa tiệc lớn hơn) | nghề đầu bếp thật, hoặc lộ |
| X20 | Cưới nhầm người cùng tên trong đám cưới tập thể | Sắp cưới, tên phổ biến | Hôn nhân giấy tờ (sống chung để chờ thủ tục hủy) | yêu thật, hoặc chia tay |
| X21 | Cây cau mọc xuyên sang tòa nhà hàng xóm | Có vườn, hàng xóm khó | Vụ án cây cau (15 năm kiện tụng) | thắng, thua, hoặc làm thông gia |
| X22 | Giấy tờ ghi bạn già hơn 30 tuổi (nâng từ a03) | Lỗi giấy tờ | Ông già 35 tuổi (được nghỉ hưu, bị ép làm cụ) | lương hưu sớm, Danh |
| X23 | Hội ngủ trưa thành phong trào quốc gia (nâng từ a23) | Tham gia hội | Lãnh tụ giấc ngủ | nghề chính trị hoặc diễn giả |
| X24 | Mua nhầm hòn đảo trên mạng, hóa ra có thật | Mê mua sắm, hoặc đánh cược | Chúa đảo (dân đảo là 40 con dê) | di cư ra đảo, hoặc bán lại |
| X25 | Quỹ hưu bị đổi thành dưa hấu | Có quỹ, già ≥ 50 | Vương quốc dưa (phải bán hết trước khi hỏng) | giàu hoặc trắng tay |
| X26 | Người duy nhất còn nhớ luật một trò chơi dân gian sắp được quốc tế công nhận | Ông bà, quê | Người giữ luật chơi | Danh văn hóa |
| X27 | Bài hát lúc say thành bài ca chính thức của một giải đấu | Hay hát, karaoke | Ca sĩ một bài (cả đời chỉ được mời hát bài đó) | nghề ca sĩ, gag |
| X28 | Bạn đời hóa ra là đối thủ giấu mặt 20 năm ở cuộc thi bí ngô | Đã cưới, có vườn | Chiến tranh bí ngô | hôn nhân tan, hoặc thành đôi vô địch |
| X29 | Hộp thư thời gian của lớp mở sớm, lộ lời hứa "40 tuổi lấy nhau" | Có bạn thời nhỏ, độc thân | Lời hứa tuổi thơ | cưới, hoặc tình bạn đổi |
| X30 | Thắng kiện một con ngỗng | Hàng xóm có ngỗng | Kẻ thù lông vũ (ngỗng trả thù cả đời) | gag suốt đời, nemesis là ngỗng |
| X31 | Đội bóng làng mua bạn bằng ba con lợn | Đá bóng giỏi | Cầu thủ ba con lợn | nghề thể thao |
| X32 | Hàng xóm xây nhà cao hơn nhà bạn 1 cm mỗi năm | Có nhà | Cuộc đua chiều cao (nợ xây nhà) | nhà cao nhất xã, hoặc phá sản |
| X33 | Kỷ lục người nói "không" nhiều nhất | Tính cứng | Ông Không (được mời làm giám khảo khắp nơi) | nghề giám khảo, MC |
| X34 | Áo mưa rách thành trường phái thời trang | Nghèo, sáng tạo | Nhà thiết kế áo mưa | nghề thời trang |
| X35 | Gia đình được chọn làm "gia đình mẫu" lên truyền hình 24/7 | Danh, Máu mủ | Sống trên sóng (mọi xung đột đều lên sóng) | tiền, gia đình tan hoặc gắn chặt |
| X36 | Mẹ bán nhà đổi lấy quán karaoke trên thuyền | Mẹ thích hát | Thuyền trưởng karaoke | nghề chủ quán, sống trên sông |
| X37 | Thừa kế món nợ một triệu chiếc bánh | Họ hàng làm bánh | Trả nợ bằng bánh | nghề làm bánh, xóa nợ |
| X38 | Làm đại sứ cho một "nước" do lũ trẻ lập trong sân trường | Làm giáo viên, hoặc có con | Ngoại giao sân trường | Danh, nghề giáo |
| X39 | Một con quạ thù bạn cả đời | Từng ném đá quạ, hoặc làm vườn | Mối thù với quạ (mọi đồ sáng bóng đều mất) | nemesis là quạ, kết hòa giải |
| X40 | Mỗi năm mất trí nhớ đúng một ngày, ngày đó bạn là người khác | Thân xác ≥ 5, Kỳ | Người của một ngày (người kia mượn tiền, làm quen người lạ) | gặp "người kia" qua thư |
| X41 | Ngồi nhầm ghế, được phong làm giám đốc | Đang đi làm | Giám đốc ngồi nhầm (không ai dám nói) | nghề quản lý, hoặc lộ |
| X42 | Đám ma của ông thành buổi hòa nhạc bán vé | Ông mất, Danh | Ông bầu tang lễ | nghề tổ chức sự kiện |
| X43 | Đặt tên con bằng biểu tượng cảm xúc, giấy tờ cả nước lỗi | Có con | Cuộc chiến giấy khai sinh | Danh, kiện tụng |
| X44 | Cả thành phố mất điện trừ nhà bạn | Ở đô thị | Ngọn đèn duy nhất (cả phố kéo vào sạc điện) | thủ lĩnh khu phố, hoặc bị trách |
| X45 | Nhân chứng duy nhất vụ con voi đi lạc vào ngân hàng | Làm ngân hàng, hoặc ở gần | Nhân chứng voi (bị giới báo chí săn) | Danh, nghề báo |
| X46 | Con đăng bán bạn trên chợ đồ cũ như "bố/mẹ cho thuê" | Có con lớn, già ≥ 55 | Phụ huynh cho thuê (đi làm bố mẹ hộ) | Tình +, tiền |
| X47 | Thư tình năm 16 tuổi được khắc lên tượng đài | Từng viết thư tình | Tượng đài ngượng (người nhận năm ấy quay lại) | tình cũ trở lại |
| X48 | Người yêu cũ mở quán đối diện bán đúng món của bạn, rẻ hơn một đồng | Có quán, có người yêu cũ | Cuộc chiến một đồng | thắng, phá sản, hoặc tái hợp |
| X49 | Được trả lương bằng thời gian rảnh, thành người giàu nhất xóm | Đi làm, Kỳ ≥ 4 | Triệu phú thời gian (bán giờ rảnh cho người bận) | nghề lạ, hạnh phúc + |
| X50 | Lịch in sai, đám giỗ của bạn tổ chức khi bạn còn sống (nâng từ a42) | Đã có lịch in sai, hoặc Máu mủ | Người dự giỗ mình (nghe người ta khen mình thật lòng) | Tình +, đổi cách sống |

## 8. Đợt A (bản chạy được) và chuẩn đo
- **Đợt A gồm:**
  - Pressure, Plants, Canon, Season, Scars;
  - 8 mầm (4 viết mới, 4 nâng từ Codex), 5 khung mùa thường (khoảng 15 thẻ mỗi khung);
  - **đủ 100 nhánh kỳ dị** (50 khoa học viễn tưởng, 50 phi lý; Tùng chốt 2026-10-18: làm xong cả 100 trước khi đăng đợt A). Mỗi nhánh là một mùa ngắn khoảng 8 thẻ theo 5 nhịp, tổng khoảng 800 thẻ;
  - ánh xạ áp lực và vật gài cho 200 thẻ Codex; nút Độ điên; phía host (banner, màu, Bản kia của bạn).
- **Đợt B:** 16 mầm còn lại, 13 khung mùa thường.
- **Chuẩn**, đo bằng mô phỏng không giao diện trên 200 đời:

  | Chỉ số | Mục tiêu |
  |---|---|
  | Canon event mỗi đời | 2–4 (100% đời có ≥ 2) |
  | Thẻ về sau khác khi đổi cửa canon (`divergence-canon.js`) | trung vị ≥ 80% |
  | Mùa chiếm thời gian từ 18 tuổi trở lên | ≥ 60% |
  | Canon event có ≥ 1 chỗ trống điền bằng vật gài do người chơi tạo | ≥ 70% |
  | Tổ hợp (mầm, người, đồ vật, cửa) khác nhau | ≥ 150 |
  | Nhánh kỳ dị xuất hiện ở mức "Phim" | 25–40% số đời |
  | Nhánh kỳ dị ở mức "Đời thật" | 0% |

  Giữ nguyên mọi chuẩn cũ:
  - quyết định mỗi đời 120–130;
  - phá sản không tăng quá +5 điểm so với main;
  - `replay-test` khớp 100% (cả actLog có cảnh AI);
  - toàn bộ test cũ PASS.

## 9. Ngoài phạm vi
- Dòng họ (chơi tiếp làm con) và Sổ đời bộ sưu tập: để đến giai đoạn 3, sau khi xong đợt A.
- Đời chung theo ngày, bảng xếp hạng: chưa làm.
- Không có cơ chế tiền thật, không "suýt trúng".
