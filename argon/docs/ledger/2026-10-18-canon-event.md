# 2026-10-18 · Canon event và Mùa: đời kể như kịch bản

- Spec: `argon/docs/superpowers/specs/2026-10-18-canon-event-design.md`.
- Kế hoạch: `argon/docs/superpowers/plans/2026-10-18-canon-event.md`.
- Nhánh: `canon-event`. Ledger này viết trên nền `cb0cc59`, tức là sau Task 1–7, 8a, 9–19, 20a và 20b.
- Task 8b (phần host còn lại của giao diện) và Task 20 (đo, cân chỉnh) đang chạy song song trên nhánh khác. Phần nói về hai task này lấy từ brief của chúng; con số nào còn chờ thì ghi "TBD sau Task 20".

## 1. Vì sao bỏ hướng 200 bước ngoặt
- Hướng của Codex (`codex/200-turning-points`, ledger `2026-10-18-200-turning-points.md`):
  - 200 cảnh mở đầu, mỗi cảnh 3 lựa chọn;
  - mỗi lựa chọn mở đúng **một** cảnh hậu quả;
  - cảnh hậu quả xong là hết chuyện.
- Đo trên 60 đời, 232 lần đổi lựa chọn: trung vị chỉ **1,5625%** số thẻ về sau khác đi (làm tròn là 2%). Không lần nào đạt chuẩn 70% của `argon/docs/fate/AUTHORING.md`.
- Nói cách khác, đời gần như không rẽ nhánh. Chọn gì thì một hai năm sau mọi thứ cũng quay về như cũ.
- Nguyên nhân nằm ở cấu trúc, không ở chữ: một cảnh hậu quả rồi thôi thì không đủ sức đổi phần còn lại của đời. Viết thêm cảnh theo cùng khuôn đó cũng không sửa được.
- Tùng chốt hướng mới: **tư duy biên kịch, không phải mô phỏng**. Kịch bản dẫn đường, mô phỏng chỉ lấp khoảng trống giữa các cảnh.
- 200 thẻ của Codex không bỏ đi. Chúng thành thẻ gài, nguồn để nâng thành canon event, và cảnh phụ trong mùa (mục 2.6).

## 2. Thiết kế

### 2.1 Canon event
- Là biến cố lớn đổi cả mạch truyện về sau. Mỗi đời có **2–4** cái.
- **Không tránh được.** Khi đã nổ, người chơi chỉ chọn cách đối mặt, qua **3 cửa**.
- Cửa có 8 kiểu hành động: đối đầu, bỏ chạy, thỏa hiệp, lật bàn, nhận tội, trả đũa, buông, đánh cược. Ba cửa của một biến cố không trùng kiểu.
- Không lấy từ danh sách cố định, không cố định theo seed. Biến cố **mọc ra từ bối cảnh sinh ra và lựa chọn của người chơi**, theo hai đường:
  - **Áp lực 8 trục:** Tiền, Tình, Máu mủ, Danh, Luật, Thân xác, Đất, Kỳ.
    - Mức nền lấy từ lúc sinh: nghèo thì Tiền +3, nước nghèo thì Đất +2, nhà giàu thì Máu mủ +3, có anh chị em thì Máu mủ +1, nông thôn thì Kỳ +1.
    - Mỗi lựa chọn đẩy áp lực, hoặc khai báo thẳng (`pressure`), hoặc suy ra từ effect và từ tông của thẻ.
    - Một trục ≥ 10, cách biến cố trước ≥ 8 năm, tuổi trong 8–72 thì trục đó nổ.
    - Đến 35 tuổi chưa có biến cố nào, hoặc đến 60 tuổi mới có một, thì trục cao nhất bị ép nổ.
    - Trục đã nổ bị trừ 8, các trục khác giữ nguyên. Mùa sau mọc từ sức ép còn tồn.
  - **Vật gài:** người, đồ vật, món nợ, bí mật, lời hứa, con vật, nơi chốn, kỹ năng mà lựa chọn của người chơi đã gieo.
    - Generator chọn **mầm** có điểm cao nhất. Điểm = 3 × số chỗ trống điền bằng vật gài của người chơi + áp lực các trục của mầm, trừ 100 nếu mầm đã dùng trong đời này.
    - Chỗ trống người và vật điền theo thứ tự: vật gài của người chơi, kẻ thù truyền kiếp (chưa nối, mục 6), NPC có ký ức mạnh nhất, tài sản đang có. Thiếu chỗ trống bắt buộc thì mầm bị loại. Chỗ trống nơi chốn là nơi đang sống.
- **Tất định:** chọn mầm và chỗ trống dùng luồng rng riêng `RNG_SUB.canon = 9`, rekey theo (seed, tuổi). Cùng lựa chọn thì ra cùng biến cố; khác lựa chọn thì khác biến cố.

### 2.2 Mùa
Mỗi cửa mở một Mùa dài 8–20 năm (nhánh kỳ dị 5–12 năm). Một mùa gộp ba ý:
- **Một mùa phim mới:**
  - 5 nhịp: mở màn, biến cố khởi động, cú lật giữa mùa, đáy, chung kết;
  - một gag lặp lại ít nhất 3 lần;
  - 2–3 nhân vật mới có tên (nhánh kỳ dị 1–2).
- **Một lần đổi đời thật (ruling R25, 19/10/2026, thay cho "đổi 100% hoàn cảnh"):**
  - lúc vào mùa có dàn nhân vật mới, luật và kho thẻ riêng;
  - mỗi Mùa có **ít nhất một thay đổi tình thế có tác dụng thật, phù hợp với tiền đề và được sử dụng trong diễn biến**: việc làm, nơi ở, tiền hay nợ, một mối quan hệ, một nghĩa vụ, quyền tiếp cận (được hay mất một thứ), hoặc một luật riêng của mùa;
  - không có luật "đổi 2 trong 4 thứ"; host không tự đổi nghề hay tiền khi nội dung không khai báo (`enterSeason` chỉ áp `reset.cash` cho người đã tự lập, `reset.effects` và hệ số `rules.income`; `doi-nguoi/tests/season-entry-test.js` kiểm trên cả 105 mùa);
  - cờ chỉ tính khi có tình huống hay luật về sau đọc nó; cờ thế giới `rules.flags` không ai đọc nên không tính;
  - Task 20d kiểm toán cả 105 mùa: trước khi sửa 29 đạt, 59 chỉ thay đổi bằng lời kể, 17 mâu thuẫn với trạng thái; sau khi sửa 64 đạt, 41 chỉ bằng lời kể, 0 mâu thuẫn. Bảng và bằng chứng: `argon/docs/canon/season-change-audit.md`. Mùa nào còn ở lớp "chỉ bằng lời kể" được nâng dần khi viết lại, không viết lại hàng loạt cho đủ chỉ tiêu;
  - chung kết đáp xuống một thay đổi bền: con đường đời (`become:<path>`), nước khác, hôn nhân, tiền, con.
- **Một vũ trụ song song:**
  - luật riêng (hệ số thu nhập, cờ thế giới như `no_privacy`);
  - màu riêng;
  - dòng "Bản kia của bạn" (Task 8b, mục 2.8).

Trong mùa, thẻ có tag của mùa đang chạy được ưu tiên. Thẻ đời thường chỉ được chọn khoảng 30% số lần. Mùa **thay** thẻ đời thường chứ không cộng thêm, nên ngân sách quyết định vẫn giữ 120–130 mỗi đời.

### 2.3 Ba vết
- Đổi 100% hoàn cảnh, nhưng mang theo đúng ba thứ từ đời cũ:
  - **một người:** kẻ thù truyền kiếp còn sống, hoặc người có ký ức mạnh nhất;
  - **một đồ vật hoặc kỹ năng:** vật gài, tài sản, hoặc nghề cũ;
  - **một món nợ hoặc lời hứa** chưa trả.
- Vết chọn lúc vào mùa (`Scars.ts`), mỗi loại lấy cái có điểm cao nhất. Không có thì để trống. Thẻ luôn có chữ dự phòng.
- Nhịp cú lật phải dùng ít nhất một vết. Nhịp chung kết phải dùng vết nợ hay lời hứa.
- Mỗi lần dùng vết, Causality in dòng "↩ Vì năm N…" về lựa chọn đã gieo vết đó.

### 2.4 100 nhánh kỳ dị
- 50 nhánh khoa học viễn tưởng (S01–S50) và 50 nhánh phi lý cực độ (X01–X50). Mỗi nhánh một dòng ở spec §7.
- Mỗi nhánh là một mùa ngắn: 7–10 thẻ trong 5 nhịp, màu theo loại (viễn tưởng xanh–tím, phi lý vàng–cam).
- Nhánh nào cũng có điều kiện "Mọc từ" (`when`) đọc từ chính đời người chơi. Không nhánh nào rơi từ trời xuống.
- **Cửa kỳ dị:**
  - Kỳ (đã nhân hệ số Độ điên) ≥ 6: một trong 3 cửa thay bằng một nhánh kỳ dị hợp điều kiện;
  - chính trục Kỳ nổ: cả 3 cửa đều kỳ dị.
- **Độ điên** là hệ số nhân với Kỳ: Đời thật ×0, Phim ×1 (mặc định), Điên ×2. Ở mức Đời thật, Kỳ không bao giờ nổ và không có cửa kỳ dị nào.

### 2.5 Trần thu nhập ×50
- Hệ số thu nhập của mùa phải thỏa `0 < income ≤ 50`. Tùng chốt con số này cho S39 "Ông chủ của chính mình", nơi một nghìn bản sao số đi làm thay bạn.
- Ở chung kết, host gỡ hệ số trước rồi mới tính tiền của landing, nên ×50 không nhân vào tiền đáp xuống.

### 2.6 Logic vật gài cho 200 thẻ Codex
- Tùng hỏi logic nào tốt nhất. Chốt:
  1. Route có một đồ vật hoặc món nợ nhìn thấy được trong chữ → gài vật đó (kiểu đồ, nợ, con vật, nơi chốn, lời hứa…).
  2. Không có, nhưng có một người có tên trong thẻ (nhân vật của thẻ) → gài kiểu người. Id NPC điền lúc dựng thẻ.
  3. Không có cả hai → không gài, giữ nguyên cảnh hậu quả một bước của Codex.
- Không sửa chữ của Codex để bịa ra vật gài.
- Route đã gài thì mất cảnh hậu quả một bước (`later` và storylet `_echo_`). Vật gài sẽ được trả bằng canon event hoặc mùa.
- Kết quả trong `canon/codexPlants.ts`:
  - 534/600 route có vật gài: 278 người, 132 đồ vật, 63 nợ, 23 nơi chốn, 18 con vật, 15 lời hứa, 3 kỹ năng, 2 bí mật;
  - 66 route không gài, giữ cảnh hậu quả;
  - 138/200 thẻ gắn tag mùa (cảnh phụ trong 5 mùa thường).
- Áp lực theo tông (`TONE_PRESSURE`): risk → Tiền 2, bond/care → Tình 1, show → Danh 2, defy → Luật 2, truth → Máu mủ 1, deal/build → Tiền 1, probe → Kỳ 1, exit → Đất 1. Mọi thẻ phi lý `tp_a*` cộng thêm Kỳ 2.
- 4 thẻ Codex được nâng thành mầm: c39 → `di_chuc`, c27 → `nam_cuoi`, c14 → `ve_xa`, c05 → `nuoc_len`. Thẻ gốc vẫn ở lại làm thẻ gài (R16, R17).

### 2.7 Đợt A đã có
- 8 mầm: `no_cu`, `troi_cho`, `phan_boi`, `noi_tieng`, `di_chuc`, `nam_cuoi`, `ve_xa`, `nuoc_len`.
- 5 mùa thường, mỗi mùa 14 thẻ:
  - `tron_chay` (Kẻ trốn chạy);
  - `vu_an_gia_toc` (Vụ án gia tộc);
  - `ngoi_sao` (Ngôi sao bất đắc dĩ, thu nhập ×3);
  - `lam_lai` (Làm lại từ số 0);
  - `xu_nguoi` (Làm lại ở xứ người).
- 100 nhánh kỳ dị.
- Tổng: 105 mùa, 869 thẻ mùa.
- Đợt B (16 mầm và 13 mùa thường còn lại) chưa làm.

### 2.8 Phần Task 8b (đang làm, theo brief)
- `setWeird(L, v)`: đổi Độ điên qua `uiOp`, nên ghi vào actLog và tua lại vẫn khớp.
- **"Bản kia của bạn":**
  - lúc vào mùa có một dòng "Ở dòng thời gian kia, bạn vừa bước vào Mùa: …", lấy từ cửa kế tiếp không được chọn;
  - lúc hết mùa, tua đời phản thực bằng `replayLife` với cửa khác, rồi kể bản kia đã đáp xuống đâu;
  - tắt khi đang tua lại, tự chơi hoặc chạy script.
- **`canonAiRewrite`:** khi có quyền `sample`, AI viết lại tiêu đề, đoạn mở và 3 nhãn cửa từ bối cảnh thật. Effects giữ nguyên. Kết quả ghi vào actLog (kind `canon_text`) để bản tua lại hiện đúng chữ.
- **Các custom phía host:**
  - `swap_other` (S22): đổi hẳn sang đời phản thực, mang theo 3 vết;
  - `remark` (S04, S40): chọn lại một lựa chọn cũ;
  - `age_skip:<n>` (S06, S08): nhảy tuổi;
  - `longevity:<n>` (S26): cộng vào trần tuổi.

  Ở nền hiện tại, cả bốn là no-op an toàn trong `canonCustom`.
- Nối `canon-ui.js` vào `build.py`. Thêm nhãn "tự khép lại" cho mùa kết vì `lapsed`.

## 3. Các ruling R1–R23
| # | Quyết định | Lý do |
|---|---|---|
| R1 | Task 4 tạo `canon/index.ts` với `CANON_SEEDS = []`, `SEASONS = [mùa mẫu]`, `WEIRD = []`; Task 6 thay bằng nội dung thật. | Bộ kiểm của Task 4 cần một kho để chạy trước khi có nội dung. |
| R2 | Task 11–19 chạy song song, mỗi đợt một worktree và chỉ sửa file của mình; Task 10 tạo `weird/index.ts` nhập đủ 10 file (9 file rỗng). | Các đợt nội dung độc lập nhau, khoảng 800 thẻ; viết tuần tự quá lâu. |
| R3 | Bước 1 của Task 1 chỉ còn `git merge`, vì worktree đã ở sẵn nhánh `canon-event`. | Thuần thủ tục. |
| R4 | Các đợt kỳ dị bắt đầu ngay sau Task 5, song song với Task 6–9; custom phía host nối sau Task 7/8. | Tùng muốn nhanh hơn; viết nội dung chỉ cần kit, chưa cần host. |
| R5 | Task 3, 4, 9 chạy song song; rồi 5 ∥ 6; rồi các đợt kỳ dị ∥ 7 → 8. Mỗi task một worktree, không commit file sinh ra. | Tùng có gói Max, muốn nhiều phiên song song; bundle và `index.html` dễ xung đột khi ghép. |
| R6 | `land()` gắn `season_end:<id landing>`, không phải `season_end` trần; host lưu id vào `canon.seasons[].landing`. | Màn kết cần biết mùa khép lại bằng chung kết nào. |
| R7 | Một đời không vào cùng một mùa hai lần: cờ `season_played_<id>`, lọc cửa dẫn tới mùa đã chơi, cửa chung mỗi kiểu dẫn tới một mùa khác nhau. | Thẻ mùa chỉ nổ một lần mỗi đời; vào lại mùa cũ thì không còn thẻ nào để chơi. |
| R8 | Gộp các lỗi nhỏ của review Task 4 vào vòng sửa 1: regex dấu theo NFD, viết hoa sau "…!?", landing khác nhau trong mỗi thẻ chung kết, thẻ chung kết không có `when`. | Để sau thì khoảng 800 thẻ viết song song sẽ cùng vấp. |
| R9 | Thẻ mùa cùng nhịp nổ theo thứ tự khai báo, không rút rng. | Gag hiện đúng thứ tự; truyện kể theo trình tự người viết định. |
| R10 | Tách Task 6: 6a (5 mùa thường) chạy cùng Task 5; 6b (8 mầm) chờ Task 5 vì cần kiểu `CanonSeed`. | Phần không phụ thuộc thì làm song song được. |
| R11 | Trục Kỳ có ít hơn 3 nhánh kỳ dị khả thi thì cửa chung bù chỗ thiếu, không trả null. | Trả null thì lần nổ ép buộc bị mất. |
| R12 | Custom `age_skip:<n>`, `longevity:<n>`, `remark` chuyển sang Task 8 cùng `swap_other`; nội dung dùng được ngay, bộ kiểm cho qua. | File host phải sửa tuần tự, Task 7 rồi mới tới 8. |
| R13 | Task 10 chia hai pha: pha 1 (helper `weird()`/`season()`, `weird/index.ts`, bộ kiểm cho WEIRD) commit trước; pha 2 viết S01–S10. | 9 đợt còn lại bắt đầu sớm, ngay từ pha 1. |
| R14 | Thêm `can_migrate` vào FactContext. Cửa dẫn tới mùa di cư (`xu_nguoi`) chỉ khả thi khi còn đường di cư. | Spec §4: "bỏ ra nước ngoài" cần đường di cư; dùng chung bộ lọc với `migrate_now`. |
| R15 | Người phụ thuộc vào mùa: bỏ `move_city`, `migrate_now`, `job_*`, `become:` khỏi reset; không đụng quỹ chung. `become:<p>` chỉ đổi nghề khi tuổi trong `[ages[0], ages[1] + 5]`; ngoài khoảng ấy chỉ đặt cờ tập nghề. | Trọng tâm review 3: đứa trẻ không tự đổi nghề, không tự di cư bằng tiền của nhà. |
| R16 | Spec §4 thắng plan: giữ 4 thẻ Codex c05, c14, c27, c39 làm thẻ gài. Mầm nâng từ chúng là phần trả: tiêu đề khác thẻ gốc, và nếu đời này đã gặp thẻ gốc thì chữ gọi lại khoảnh khắc ấy. | Spec là chuẩn ràng buộc; cũng tránh xung đột với Task 9. |
| R17 | Thẻ Codex gốc bị chặn sau khi mầm nâng từ nó đã nổ. | Không kể cùng một chuyện hai lần theo thứ tự ngược. |
| R18 | `scar("do")` có thể là đồ vật, con vật, kỹ năng, tài sản hay nghề; nội dung viết trung tính (quy tắc 7–9 trong `argon/docs/canon/authoring-rules.md`). | Giữ một loại vết thay vì tách thành nhiều loại. |
| R19 | Quy tắc 10: mỗi thẻ có ≥ 2 lựa chọn không `tier`, và lựa chọn có `tier` không bao giờ đứng đầu. | Lựa chọn có `tier` bị ẩn với người chơi tự động (review S31–S40). |
| R20 | `marry:<tên>` lấy người còn sống trong dàn có đúng tên ấy làm bạn đời, không tạo người mới. | Một nhân vật là một thực thể (quy tắc 5), ví dụ lời hứa tuổi thơ ở X29. |
| R21 | Câu sót quy tắc 9 của mọi đợt kỳ dị được quét một lần ở Task 20 (thành 20a), dùng đầu dò sự thật tương phản, thay vì thêm vòng sửa cho từng đợt. | Rẻ hơn, và bắt đều mọi đợt. |
| R22 | Bộ kiểm mới của Task 10 bắt lỗi ở 5 mùa thường (cận dưới tuổi của `become:`, phải có ≥ 1 landing không phải nghề); sửa ngay trên `canon-event` bằng vòng sửa 2 của Task 6a. | Lỗi nằm ở nội dung đã ghép, không thuộc đợt nào khác. |
| R23 | Tách phần còn lại: 20a (quét quy tắc 9, đầu dò, gom cổng tuổi vào kit), 20b (công cụ đo), 8a (chỉ giao diện), chạy song song với Task 7. Còn lại 8b, 20 và 21 sau Task 7. | Tùng muốn song song hóa Task 8, 20 và 21. |

Các quyết định khác không đánh số:
- **Ngưỡng mức nền:** nghèo khi `family_wealth < 0.4`, giàu khi `> 0.75` (cùng ngưỡng host), nước nghèo khi GDP < 8000. Spec chỉ nói tên lớp, không nói số.
- **Chuẩn "100% đời có ≥ 2 canon event"** chỉ tính trên các đời sống tới ≥ 60 tuổi. Đời chết trẻ không thể có đủ.
- **Ép nổ khi mọi trục đều 0** thì lấy Tiền, để bảo đảm tối thiểu luôn có biến cố.
- **Người mới của mùa** mang vai riêng `season` (hiện là "người quen", hoặc nhãn riêng của họ). Họ không chiếm vai chuẩn như mẹ hay con, và không thành người phụ thuộc phải nuôi.
- **Mùa khép lại có bốn lý do:**
  - `landing`: đi hết chung kết;
  - `cut`: bị canon event mới cắt ngang;
  - `death`: chết giữa mùa, màn kết ghi "dang dở";
  - `lapsed`: chung kết không ra được thẻ nào, lưới an toàn.
- **Cờ `rural`** đặt lúc sinh cho đời ở nông thôn. Mức nền và `when` của X21, X26, X28, X30 đều đọc cờ này.

## 4. Bản đồ kiến trúc
```
Lựa chọn ──► Áp lực 8 trục (Pressure.ts) ──► dueAxis ──► generateCanon (Canon.ts) ──► 3 cửa
Thẻ gài (codexPlants.ts) ──► Vật gài (Plants.ts) ─────────────┘                          │
                                                                                         ▼
                                                 enterSeason (canon.js) ── 3 vết (Scars.ts)
                                                         │ 5 nhịp thẻ (Season.ts, seasons/, weird/)
                                                         ▼
                                     chung kết: season_end:<landing> ──► đổi đời thật
```

### Engine: `argon/src/engine/narrative/canon/`
| File | Việc |
|---|---|
| `Pressure.ts` | 8 trục, `AXIS_VN`, các hằng (`CANON_THRESHOLD` 10, `CANON_GAP` 8, `CANON_MAX` 4, `CANON_AGES` [8, 72], `FORCE_FIRST_AT` 35, `FORCE_SECOND_AT` 60, `DISCHARGE` 8, `WEIRD_DOOR_AT` 6), `basePressure`, `pressureOf`, `dueAxis`. |
| `Plants.ts` | `strongestPlant`, `plantFlag` (cờ `plant:<loại>:<khóa>`). |
| `Scars.ts` | `pickScars`, `scarText`: chọn 3 vết và ra chữ (người đã mất thì thành "một người cũ"). |
| `Canon.ts` | `fillSlots`, `generateCanon`, `canonView`, `GENERIC_DOORS`, `playedFlag`. Lọc cửa theo mùa đã chơi (R7), `can_migrate` (R14) và `NEEDS_INDEPENDENT`. |
| `Season.ts` | Kiểu `SeasonDef`, `BEATS`, `BEAT_VN`, `seasonLength`, `beatGap`, `isDurable`, `landingOf`, `compileSeason` (thẻ mùa thành storylet `ss_<mùa>_<nhịp>_<i>`), `seasonKitFromNames`. |
| `kit.ts` | Bộ viết mùa: `card`, `land`, `ending`, `cap`, `noOr`, cổng tuổi `pathOpen`/`careerOk`/`finale`/`finaleInOrder`/`openInOrder`, và `weird()`/`season()` cho nhánh kỳ dị. Đầu file ghi đủ luật. |
| `seeds.ts` | 8 mầm (`CANON_SEEDS`). |
| `seasons/*.ts`, `seasons/index.ts` | 5 mùa thường (`SEASONS_NORMAL`). |
| `weird/sf_01.ts` … `weird/sf_41.ts`, `weird/abs_01.ts` … `weird/abs_41.ts`, `weird/index.ts` | 100 nhánh kỳ dị, mỗi file 10 nhánh; `WEIRD_ALL`. |
| `codexPlants.ts` | `TONE_PRESSURE`, `pressureFor`, `CODEX_PLANTS`, `CODEX_SEASON_TAGS`; `turning/kit.ts` (`compileFork`) đọc bảng này. |
| `index.ts` | Xuất mọi thứ ra `Argon.*`, gồm `SEASONS`, `WEIRD` và `SEASON_STORYLETS` (mọi thẻ mùa, host nối vào kho major). |

### Host: `doi-nguoi/`
- **`canon.js`:**
  - khởi tạo: `canonInit`, `canonFacts` (các trường canon của FactContext);
  - áp lực và vật gài: `canonOnEffect`, chạy đầu `applyEffect`;
  - vòng năm: `canonYear`, gọi trong `livingYear` ngay sau `promiseDueScene`;
  - cảnh và mùa: `canonScene`, `enterSeason`, `exitSeason`, `seasonKit`, `seasonYearly`, `nextSeasonCard`, `fireSeasonCard`;
  - custom: `canonCustom` (`canon:`, `season:`, `season_end:`);
  - người phụ thuộc: `canonOwnOnly` (R15);
  - hệ số thu nhập: `seasonIncomeMult`, sống suốt mùa kể cả khi đổi việc giữa mùa;
  - lúc chết: `canonDeath`, gọi trong `die()` ở `index.html`.
- **`canon-ui.js`:**
  - `seasonTheme`: màu mùa trên `body[data-season]`, có biến chữ ≥ 4,5:1 và vạch ≥ 3:1 cho cả giao diện sáng lẫn tối;
  - `seasonBanner`: banner `#season-banner`;
  - `weirdMenu`: ô Độ điên `#weirdBox`, ẩn cho tới khi có `window.setWeird`.
- **`phase1.js`:** màn kết có mục "Các mùa của đời bạn" (`seasonsEndHTML`, `canonSeasonsOf`); Tấm bia có thêm dòng tên các mùa.
- **`living.js`:**
  - `factContext` trải `canonFacts`;
  - `pools()` nối `SEASON_STORYLETS`;
  - `microScene` ưu tiên thẻ của mùa;
  - `castName` trả lời các khóa `scar:*`, `npc:*`, `place`;
  - `marryMember` (R20), `roleVN`, `leaveSpouse`.
- **`index.html`:**
  - `RNG_SUB.canon = 9`;
  - khối `<script id="canon">`, và chỗ `<script id="canonui">` (Task 8b nối vào `build.py`);
  - CSS mùa và banner.
- **`tests/build.py`:** nhúng `canon.js` sau `money.js`, vào cả trang, `tests/.head.js` và `publish/files.txt`.

### Test
- Engine (`argon/src/`):
  - `canon-test.ts`: áp lực, vật gài, vết, generator, mầm, ánh xạ Codex;
  - `canon-content-test.ts`: cấu trúc và chữ của mọi mùa, mầm và nhánh, kèm probe quy tắc 9.
- Host (`doi-nguoi/tests/`):
  - `canon-test.js`: 120 đời tự chơi, cắt mùa, người phụ thuộc, hệ số thu nhập, `marry:<tên>`, tua lại;
  - `canon-ui-test.js`: màn kết, banner, màu, độ tương phản của 105 mùa.
- Công cụ đo (Task 20b, nằm trên nhánh `canon-t20b`, đã ghép vào `canon-t20`, chưa có ở nền này):
  - `node argon/tools/canon-stats.js doi-nguoi/tests/.head.js 200 [weird]`;
  - `node argon/tools/divergence-canon.js doi-nguoi/tests/.head.js 60 3`.

## 5. Số đo tới giờ
**Task 7** (`doi-nguoi/tests/canon-test.js`, 120 đời tự chơi, sau vòng sửa 1):

| Đo | Kết quả | Chuẩn |
|---|---|---|
| Đời sống tới 60 có ≥ 2 canon event | 80/80 | 100% |
| Đời có > 4 canon event | 0 | 0 |
| Hai canon event cách nhau < 8 năm | 0 | 0 |
| Quyết định mỗi đời, trung vị | 127 | 120–130 |
| Mùa đi hết chung kết / bị cắt ngang | 188 / 103 | — |
| Tua lại 30 đời, khớp `history` và `savings` | 30/30 | 100% |

Chạy lại trên nền `cb0cc59` (đã có 20a), cùng test và cùng seed: 80/80 đời sống tới 60 có ≥ 2 canon event, trung bình 2,93 canon event mỗi đời, 189 mùa đi hết chung kết, 101 bị cắt ngang, 90/120 đời bước qua một cửa kỳ dị, trung vị quyết định 127, test PASS.

**Nội dung:**
- `canon-content-test`: 105 mùa, 869 thẻ, 100 nhánh kỳ dị, 0 lỗi.
- Probe quy tắc 9: khoảng 1,07 triệu lần dựng thẻ, 0 vi phạm. Trước đợt quét 20a, cùng probe bắt 131 lỗi.

**Chuẩn của spec §8:**

| Chỉ số | Mục tiêu | Hiện có |
|---|---|---|
| Canon event mỗi đời | 2–4, 100% đời ≥ 2 | Đạt trên mẫu của Task 7 (xem trên) |
| Thẻ về sau khác khi đổi cửa canon (`divergence-canon.js`) | trung vị ≥ 80% | TBD sau Task 20 |
| Mùa chiếm thời gian từ 18 tuổi | ≥ 60% | TBD sau Task 20 (đo sớm ở Task 7: 46%) |
| Canon event có ≥ 1 chỗ trống điền bằng vật gài của người chơi | ≥ 70% | TBD sau Task 20 (đo sớm: gần 100%) |
| Tổ hợp (mầm, người, đồ vật, cửa) khác nhau | ≥ 150 | TBD sau Task 20 |
| Nhánh kỳ dị ở mức Phim | 25–40% số đời | TBD sau Task 20 (đo sớm: 75%) |
| Nhánh kỳ dị ở mức Đời thật | 0% | TBD sau Task 20 (generator đã có test) |
| Phá sản so với main | ≤ +5 điểm | TBD sau Task 20 |
| `replay-test` | khớp 100% | PASS ở mọi lần ghép |

Các số "đo sớm" chạy trên bản đang làm, chưa cân chỉnh. Chúng chỉ cho biết Task 20 phải kéo chỉ số nào.

## 6. Giới hạn đã biết và việc để sau
- **Kẻ thù truyền kiếp (nemesis) chưa nối.**
  - `canonFacts` cố ý trả `nemesis: undefined`. Mầm chưa kiểm vai của chỗ `who`, nên nếu nối nemesis ngay thì kẻ thù có thể bị điền vào chỗ của bố mẹ trong `di_chuc`.
  - Người mới của mùa chưa có id NPC để Effect nhắm tới. Vì thế "nemesis là ngỗng" (X30) và "mối thù với quạ" (X39) hiện chỉ là gag.
  - Cần thêm kiểm vai, hoặc một lựa chọn để mầm từ chối nemesis, trước khi nối.
- **Heuristic tìm bộ đếm chết còn nhiễu.**
  - Một script dò thấy khoảng 85/211 bộ đếm của mùa trông như không có thẻ nào đọc. Nhưng nó so bộ đếm với bộ đếm, nên báo nhầm nhiều.
  - Mới sửa ba cái có tên: `s22_doi` và `s26_lo` giờ đã được đọc, `s30_im` vốn đã được đọc.
  - Chưa thành luật của bộ kiểm.
- **Thanh trên cùng ở khổ 821–900px.**
  - Menu gãy thành một cột hẹp, thanh dính cao khoảng 234px ở 860px.
  - Ở 821–836px còn cuộn ngang 16px do `#aiBtn`.
  - Cả hai có từ trước tính năng này. Cách sửa đúng: dưới khoảng 1100px dùng menu "Thêm" như trên điện thoại.
- **Ô năm hiện tại trên thước nháy vàng.**
  - `.cells i.now` nháy vàng tươi (#FF0) trong Chromium headless, lúc animation `ink` nội suy nền về một giá trị `color-mix()`.
  - Lỗi có từ trước. `render()` dựng lại thước mỗi năm, nên Chrome thật có thể cũng nháy.
  - Nên animate `opacity` hoặc `outline` thay cho nền.
- **Việc chuyển cho Task 20 (cân chỉnh):**
  - Mùa chiếm thời gian người lớn còn thấp. `CANON_GAP` 8 ngắn hơn nhiều mùa, nên khoảng 30% số mùa bị biến cố sau cắt ngang (103/358 ở lần đo đầu của Task 7). Cân nhắc giữ trục lại khi mùa đang chạy, cho tới chung kết.
  - Nhánh kỳ dị ra quá nhiều ở mức Phim (75%, chuẩn 25–40%): chỉnh `WEIRD_DOOR_AT` hoặc áp lực Kỳ.
  - Cân lại hệ số thu nhập của mùa và tiền của landing; đo lại tỉ lệ phá sản sau các `repay` mới của 20a.
  - Lựa chọn trong mùa chưa đẩy áp lực, chưa gieo vật gài.
  - Một số mùa có tiền đề chỉ nằm trong chữ, engine không có: việc làm ở S07, S33, X07; món nợ của `tron_chay`; lương hưu của X22. Cần quyết có thêm `job_new` hoặc `borrow` vào reset hay không.
  - Gắn tag mùa kỳ dị cho thẻ Codex `tp_a*`.
  - Đưa quy tắc 10 vào bộ kiểm (R19).
- **Việc chuyển cho Task 8b:**
  - Thêm nhãn cho lý do `lapsed`. Hiện mùa ấy hiện như một landing không có dòng chữ.
  - `canon-ui-test.js` chưa thật sự kiểm nhánh chống trùng mục và `findLast` của thước.
  - `marryMember` còn hạ vai cả người bạn đời đã mất thành "người cũ".
  - Độ điên chưa chọn được lúc sinh, chỉ chọn được trong menu.
- **Khác:**
  - Người phụ thuộc chỉ còn 2 mùa thường có thể vào (`vu_an_gia_toc`, `ngoi_sao`), vì `tron_chay`, `xu_nguoi`, `lam_lai` cần tự lập. Nếu cả hai đã chơi và không nhánh kỳ dị nào hợp, generator trả null và năm đó không có biến cố; host đi tiếp bình thường.
  - "Món ân tình cũ" (chữ dự phòng của vết nợ) đọc hơi lỏng ở vài câu đi kèm tiền (X10, X13, X16). Cần một lượt sửa văn.
  - `argon/tools/divergence.js` và `divergence-tp.js` dùng `require`, nhưng `argon/package.json` là `"type": "module"`, nên chạy từ `argon/tools` sẽ lỗi. Cần đổi sang ESM hoặc đuôi `.cjs`.
