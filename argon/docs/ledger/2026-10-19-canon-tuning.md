# 2026-10-19 · Canon event: đo và cân chỉnh (Task 20)

Spec: `argon/docs/superpowers/specs/2026-10-18-canon-event-design.md` §3, §5, §8. Công cụ đo: `argon/tools/canon-stats.js` (200 đời, seed i·7919+17) và `argon/tools/divergence-canon.js` (60 đời × 3 ngã rẽ).

## Vì sao
Đo trên bản ghép Task 7 + 8a + 20a (cb0cc59), mức "Phim":
- mùa chỉ phủ 47% số năm từ 18 tuổi (chuẩn ≥ 60%). Hai nguyên nhân: canon event mới cắt ngang mùa đang chạy (Task 7 đo 103–116 mùa bị cắt), và lần đầu thường chỉ nổ nhờ ép ở 35 tuổi, nên 18–35 tuổi gần như không có mùa;
- nhánh kỳ dị xuất hiện ở 76% số đời (chuẩn 25–40%);
- 132 quyết định mỗi đời (chuẩn 120–130);
- phá sản 63% so với 57% ở main (chuẩn ≤ main + 5 điểm).

## Bảng cân chỉnh

| # | Đổi | Ở đâu | Trước → sau | Hiệu quả đo được (200 đời, Phim) |
|---|---|---|---|---|
| 1 | Đang có mùa thì canon event chờ chung kết; chỉ lần ép nổ (≥ 2 trước 60 tuổi) mới được cắt mùa | `Pressure.ts dueAxis` | cắt mùa → chờ | mùa bị cắt 103 → 0; mùa 0.468 → 0.483 |
| 2 | Thẻ phi lý `tp_a*` cộng Kỳ ít hơn | `codexPlants.ts ABSURD_KY` | 2 → 1 | kỳ dị 0.725 → 0.26 (100 đời) |
| 3 | Ép nổ lần đầu sớm hơn | `FORCE_FIRST_AT` | 35 → 25 | mùa 0.465 → 0.53 (100 đời) |
| 4 | Ngưỡng nổ chung thấp hơn | `CANON_THRESHOLD` | 10 → 8 | mùa 0.53 → 0.60 (100 đời) |
| 5 | 5 nhịp chia đều trên cả độ dài mùa (4 khoảng) | `Season.ts beatGap` | round(len/5) → floor(len/4) (floor theo review: mùa 6 năm vẫn giữ nhịp "đáy") | chung kết trước đây rơi ở 4/5 độ dài mùa; mùa 0.60 → 0.66 |
| 6 | Trong mùa, thẻ đời thường ra với xác suất cao hơn | `living.js SEASON_DAILY_GATE` | 0.3 → 0.4 | quyết định p50 119 → 122 (100 đời) |
| 7 | Nông thôn cộng Kỳ nền | `Pressure.ts basePressure` | +1 → +2 | kỳ dị 0.25 → 0.37 (100 đời) |
| 8 | Vào mùa có `reset.cash`: phần tiền riêng vượt mức đặt lại chỉ mất một nửa (nợ giữ nguyên như trước) | `Season.ts RESET_CASH_KEEP`, `resetCashDelta`; `canon.js enterSeason` một dòng | mất hết phần vượt → mất một nửa | phá sản 0.64 → 0.58 (tắt hẳn reset tiền: 0.555, nên đây là nguồn chính) |
| 9 | Trục Kỳ giữ ngưỡng cũ 10; trục nổ là trục cao nhất trong các trục đạt ngưỡng của nó | `Pressure.ts KY_THRESHOLD` | 8 (theo #4) → 10 | kỳ dị 0.43 → 0.33 |
| 10 | Ba cửa ưu tiên ba mùa khác nhau (cửa mầm khác mùa → cửa chung khác mùa → mới nhận trùng mùa; cửa chung lùi về mùa chưa có trong các cửa đã chọn) | `Canon.ts generateCanon`, `fillGeneric(distinct)`, `genericSeason(taken)` | — | chơi thử 21b: hai cửa cùng vào vu_an_gia_toc. Kiểm 42 000 lần gọi: 0 biến cố trùng mùa khi còn đủ mùa mở |
| 11 | Độ nhạy theo trục khi so ngưỡng | `Pressure.ts AXIS_GAIN` | 1 cho mọi trục → Tiền 1, Tình 1, Máu mủ 1.5, Danh 2, Luật 3, Thân 3, Đất 2.5, Kỳ 1.2 | trước: chỉ Tiền/Tình/Kỳ/Máu mủ nổ; sau: cả 8 trục |
| 12 | Trục đã nổ phải vượt ngưỡng cao hơn ở lần sau | `Pressure.ts AXIS_FATIGUE` = 4 / lần, cờ `canon_ax_<trục>@<tuổi>` do canonView gắn | — | Tiền 0.54 → 0.40 số biến cố |
| 13 | Mầm nuoc_len mở cho mọi tuổi, chữ và cửa rẽ theo tuổi (trẻ con / người lớn) | `seeds.ts NUOC_LEN` | ages [8, 16] → [8, 72] | trước Task 20 gần như không có biến cố trước 17 tuổi (1/100 đời), nên mầm này không bao giờ ra |

Thử rồi bỏ (không giữ trong mã):
- Sàn độ dài mùa 8 năm cho nhánh kỳ dị (years [5, 9]): gần như không đổi gì (mùa 0.664 → 0.662), vì nhánh kỳ dị chỉ chiếm ~1/3 số đời.
- `WEIRD_DOOR_AT` 6 → 4: kỳ dị +0.02; 6 → 8: −0.015. Giữ 6 như spec. Cửa kỳ dị ở biến cố thường nằm ở vị trí 3, tự chơi chỉ chọn ~7%; phần lớn đời kỳ dị đến từ trục Kỳ nổ.
- `ABSURD_KY` 1.5: kỳ dị 0.57 (quá nhạy).
- Hệ số thu nhập mùa (lam_lai 0.6 → 0.85, tron_chay 0.6 → 0.8, xu_nguoi 0.8 → 1, vu_an 0.9 → 1): phá sản chỉ 0.65 → 0.64. Trả về như cũ.
- Rekey luồng canon theo tập mùa đã chơi, và đẩy mùa của cửa đã không chọn xuống cuối ở biến cố sau: độ rẽ 0.69 → 0.66–0.69 (nhiễu). Bỏ; xem "Độ rẽ" dưới.

## Hằng số đã đổi (R27: controller chấp nhận toàn bộ bảng này, 2026-10-19)

| Hằng | Ở đâu | Spec / trước | Sau |
|---|---|---|---|
| `CANON_THRESHOLD` | Pressure.ts | 10 | 8 |
| `KY_THRESHOLD` (mới) | Pressure.ts | (dùng chung 10) | 10 |
| `FORCE_FIRST_AT` | Pressure.ts | 35 | 25 |
| `AXIS_GAIN` (mới) | Pressure.ts | 1 cho mọi trục | Tiền 1, Tình 1, Máu mủ 1.5, Danh 2, Luật 3, Thân 3, Đất 2.5, Kỳ 1.2 |
| `AXIS_FATIGUE` (mới) | Pressure.ts | 0 | 4 mỗi lần trục đã nổ |
| `NEMESIS_AT` (mới) | Pressure.ts | (nemesis luôn trống) | −0.5 |
| Nông thôn, Kỳ nền | Pressure.ts `basePressure` | +1 | +2 |
| `ABSURD_KY` (mới; Kỳ cộng thêm ở `tp_a*`) | codexPlants.ts | 2 | 1 |
| `beatGap` | Season.ts | round(len/5) | floor(len/4) |
| `RESET_CASH_KEEP` (mới) | Season.ts | 0 (mất hết phần vượt) | 0.5 |
| `SEASON_DAILY_GATE` (mới; trước là số 0.3 viết thẳng) | living.js | 0.3 | 0.4 |
| `nuoc_len.ages` | seeds.ts | [8, 16] | [8, 72] |
| Mùa đang chạy chặn canon event | Pressure.ts `dueAxis` | không (mùa bị cắt) | chặn, trừ lần ép nổ |
| `WEIRD_DOOR_AT`, `CANON_GAP`, `CANON_MAX`, `CANON_AGES`, `FORCE_SECOND_AT`, `DISCHARGE` | Pressure.ts | — | không đổi |

## Việc kèm theo
- **Codex vào mùa phi lý, các cặp loại** (review B2): `ABSURD_TAG_EXCLUDE` bỏ ba cặp mùa nâng thẳng từ thẻ (a03×X22, a23×X23, a42×X50) và các cặp trùng mô-típ (a03×X08/X43, a46×X34, a28×X12/X50, a04×X42, a26×X36, a16×X02, a25×X16/X45, a36×X47).
- **Cửa khác kiểu** (review B1): lượt lấy cửa mầm thứ hai đọc kiểu từ chính `doors` (fillGeneric chen vào giữa); fuzz 42 000 lần kiểm cả kiểu lẫn mùa.
- **Kẻ thù truyền kiếp (`nemesis`)**: `Argon.nemesisOf(ctx)` (Pressure.ts) lấy người còn sống trong `ctx.cast` có ý kiến thấp nhất, nếu ≤ `NEMESIS_AT` = −0.5. Host truyền `castMap, opinion` vào `canonFacts` (living.js một dòng, canon.js một dòng). Để kẻ thù không ngồi nhầm chỗ của người mẹ trong di chúc, `fillSlots` chỉ cho kẻ thù vào chỗ `who` khi họ mang một vai trong `who.roles` của mầm. Hai chỗ đọc khác giờ cũng thấy kẻ thù: vết "người" của mọi mùa (`Scars.ts`, ưu tiên kẻ thù, không ràng vai, đúng spec §5) và chữ hai thẻ `sf_21.ts` (S21, S29) đổi theo `c.nemesis`.
- **Tiền đề nghề/nợ (carry 20a)**: sửa chữ ở chỗ được, để phần reset cho Task 20c (Task 20c giữ trường `reset` của mọi mùa, "đổi 100% hoàn cảnh"):
  - `w_S07`: "Xin nghỉ phép về thăm" → "Xin chỉ huy cho về thăm một chuyến"; bỏ PREMISE của S07.
  - `w_X07`: "Xin hãng nghỉ một năm không lương" → "Bảo hãng tạm dừng hợp đồng một năm"; bỏ PREMISE.
  - `tron_chay` (nợ) và `w_S33` (việc) vẫn là PREMISE: cách sửa đúng là `reset.effects` (`borrow` / `job_new`), thuộc Task 20c. Đã thử `borrow:0.5` và `job_new` ở Task 20 rồi bỏ để không đụng việc của 20c.
  - `lam_lai` mở màn: "Mọi thứ của đời trước đã mất: tiền, …" → "Đời trước đã lùi hết về phía sau: chỗ ở, những thói quen, …" (khớp #8).
  - Đầu dò rule-9 của 20a vẫn xanh.
- **Sửa từ chơi thử 21b**:
  - hint cửa kỳ dị luôn có tiền tố "Viễn tưởng: "/"Phi lý: ", kể cả nhánh có hint riêng (`Canon.ts weirdHint`);
  - câu "Gọi cả nhà ngồi lại" (phan_boi), "trước mặt cả nhà" (ve_xa) và "X đặt lên bàn ba bản di chúc của bố mẹ" (di_chuc) chỉ dùng khi người ở chỗ who là người trong nhà (`seeds.ts nguoiNha`); người ngoài có câu riêng;
  - `ngoi_sao` cưới đúng "người hâm mộ số một" bằng `marry:<tên>` (`kit.ts wed`, chuyển từ abs_21), chỉ khi đã quen người ấy (`ns_quen_fan`) và chưa có vợ/chồng;
  - X22 đổi tên mùa "Cụ già 35 tuổi" → "Cụ già trên giấy" (mở từ 25 đến 45 tuổi);
  - X33 dùng ngoặc “ ”.
- **Kiệt sức giữa năm** (`index.html stepYear`): cảnh vừa mở trong năm bị bỏ trước `die()`. Trước đây bản chơi thật còn chọn được một thẻ sau khi chết, bản tua lại thì không, nên replay-test lệch 1 lựa chọn (seed 997811).
- **Codex vào mùa kỳ dị**: 50 thẻ phi lý `tp_a01–tp_a50` thành cảnh phụ của cả 50 mùa phi lý `w_X01–w_X50` (`ABS_SEASON_IDS`, `CODEX_SEASON_TAGS`). Mùa viễn tưởng `w_S*` không nhận: giọng nghiêm hơn.
- **Công cụ cũ**: `argon/tools/divergence.js`, `divergence-tp.js` chuyển sang `import` (ESM). `divergence.js` còn tham chiếu `Argon.FATE` đã không còn trong bản dựng: giờ in `note` thay vì văn lỗi. `canon-stats.js` có thêm `seasonEnds`, `eventsWithWeirdDoor` và biến môi trường `CANON_STATS_NO_BASELINE=1`.

## Độ rẽ: chưa đạt
Trung vị "thẻ về sau khác" ~0.70 (chuẩn ≥ 0.8). Phân tích 37 ngã rẽ: 44% thẻ về sau là thẻ mùa, và gần một nửa số đó trùng giữa hai đời. Lý do: đợt A chỉ có 5 mùa thường, mỗi đời đi 3–4 mùa, R7 cấm chơi lại; nên đời gốc và đời rẽ gần như luôn cùng đi qua 2–3 mùa giống nhau về sau (chỉ khác thứ tự). Thẻ đời thường cũng trùng ~40% vì luồng rng rekey theo (hạt giống, tuổi) có chủ ý (ledger tất định). Đổi thứ tự cửa hay rekey luồng canon không giảm trùng. Muốn đạt 0.8 cần thêm mùa thường (đợt B: 13 khung), hoặc thẻ mùa đọc mùa trước / chung kết trước để khác nhau giữa hai đời. Không rekey luồng của năm theo đường mùa: làm vậy đạt số đo bằng nhiễu, ngược với nguyên tắc "đổi một lựa chọn chỉ lệch chính năm đó".

## Số đo cuối (canon-t20 sau fix round 1, Độ điên "Phim")

200 đời (8cb21ce) và 120 đời (fix round 1: floor(len/4), cửa khác kiểu, loại cặp tag). Độ rẽ 60 × 3 trên 8cb21ce. main 9d98f1e: phá sản 0.57, quyết định p50 125 (200 đời).

| Chỉ số | Chuẩn | Trước (cb0cc59) | 8cb21ce, 200 đời | Fix round 1, 120 đời |
|---|---|---|---|---|
| ≥ 2 canon trước 60 | 1.0 | 1.0 | 1.0 | 1.0 |
| canon mỗi đời tối đa | ≤ 4 | 4 | 4 | 4 |
| Mùa / năm từ 18 tuổi | ≥ 0.6 | 0.468 | 0.673 | 0.633 |
| fromPlayerShare | ≥ 0.7 | 1.0 | 1.0 (fresh 0.635) | 1.0 (fresh 0.656) |
| combos | ≥ 150 | 488 | 537 | 340 (120 đời) |
| Đời có mùa kỳ dị, Phim | 0.25–0.40 | 0.76 | 0.325 | 0.35 |
| Đời có mùa kỳ dị, Đời thật | 0 | — | 0 | — |
| Độ rẽ p50 | ≥ 0.8 | 0.70 | 0.66 | — (để đợt B) |
| Quyết định p50 | 120–130 | 132 | 126 | 127 |
| Phá sản | ≤ main + 0.05 | 0.63 | 0.57 | 0.60 (canon tắt 0.567) |
| Trục nổ | 8/8 | 4/8 | 8/8 | 8/8 |
| Mầm ra | 8/8 | 5/8 | 8/8 | 8/8 |

Các số cần đo lại sau khi ghép 20c, 20d, 8b: phá sản (R24, 20d), fromPlayerShare (20c), quyết định (8b).

## Cân chỉnh tiền sau khi ghép (canon-int-money, 2026-10-19)

Base: canon-int `0a98817`. Bản ghép Task 20 × 8b × 20d × 20c × 21c có brokeShare 0.64 so với 0.535 khi tắt canon (200 đời, Phim): +10,5 điểm, chuẩn ≤ +5.

### Quy kết (chẩn đoán trước khi chỉnh)
Đầu dò mới `argon/tools/canon-money-probe.js` (cùng seed, cùng định nghĩa phá sản và cùng baseline với `canon-stats.js`; có thí nghiệm bằng biến môi trường `PROBE_*`, xem chú thích đầu file). Số dưới đây là 200 đời, seed i·7919+17, trên `0a98817`.
- **Ghép đôi theo seed:** 35 đời chỉ phá sản khi bật canon, 14 đời chỉ phá sản khi tắt, 93 đời phá sản cả hai.
- **Lần phá sản đầu tiên (128 đời):**
  - 67 trong một mùa hệ số < 1, và 8 trong vòng 3 năm sau mùa ấy;
  - 36 ở đời chưa từng vào mùa;
  - 4 trong mùa ×1; 3 trong mùa > 1 và 3 sau mùa > 1; 7 muộn hơn.
- **Tuổi lúc phá sản lần đầu:** dư ở 25–34 (14 so với 7) và 55–64 (19 so với 8). Đó là lúc mùa đầu tiên bắt đầu (FORCE_FIRST_AT 25) và lúc có mùa muộn.
- **Thời gian trong mùa, mỗi đời:** 25,1 năm ở mùa hệ số < 1, 5,1 năm ở mùa > 1, 1,4 năm ở mùa ×1. Mùa hệ số < 1 gồm bốn mùa thường dài 8–20 năm: lam_lai ×0.6, tron_chay ×0.6, xu_nguoi ×0.8, vu_an_gia_toc ×0.9.
- **Dư phá sản theo mùa** (số đời có mùa ấy phá sản khi bật, trừ số đời cùng seed phá sản khi tắt):
  - lam_lai +21/132, xu_nguoi +21/95, vu_an_gia_toc +16/132, ngoi_sao +9/111, tron_chay +9/84;
  - 100 nhánh kỳ dị cộng lại khoảng +5, vì ít đời vào.
- **Phá sản trong mùa rải đều từ năm 1 đến năm 16 của mùa.** Đó là thâm hụt tích dần: lương ×0.6–0.9 trong khi chi phí sống (survival_cost) cố định.
- **Ngưỡng vỡ nợ hạ theo lương mùa.** Ngưỡng là nợ > 5 × thu nhập hiện tại (bridge.js). 263 trên 471 lần vỡ nợ trong mùa hệ số < 1 có nợ ≤ 5 năm lương gốc, tức chỉ vỡ vì ngưỡng đã bị hạ.
- **Dòng tiền của mùa, mỗi đời** (đơn vị: năm lương gốc):

  | Khoản | Năm lương gốc |
  |---|---|
  | luật năm (gồm 21 luật của 20d) | −0.21 |
  | reset.cash | −0.43 |
  | chung kết | +1.08 |
  | money:<x> âm trong mùa | −2.26 |
  | money:<x> dương trong mùa | +1.62 |

  Trong khoản −2.26, có −0.46 là phần R24 lấy thêm, vì khoản âm tính trên lương gốc thay vì lương thực của mùa hệ số < 1.
- **Một đời rời mùa không nghèo hơn theo trung vị.** Nợ/lương gốc ở 45 tuổi là 0.59 khi bật, 0.99 khi tắt; tài sản ròng/lương gốc ở 60 tuổi là 0.1 khi bật, 0.01 khi tắt. Phần dư nằm ở thời điểm: những năm lương thấp, đúng lúc ngưỡng cũng thấp.

**Kết luận theo ba nguyên nhân mà integration report nêu:**
1. **R24 tính khoản lỗ trên lương gốc:** góp khoảng −0.04 khi chuyển khoản âm trong mùa hệ số < 1 sang lương thực.
2. **21 luật năm của 20d: gần như 0.** Bỏ hẳn mọi luật năm thì 0.63; tính khoản âm của luật năm trên min(gốc, thực) thì 0.64. Không làm mềm luật nào: R25 giữ nguyên.
3. **Task 20 cho đời ở trong mùa lâu hơn:** đây là nguồn chính. Hơn 25 năm mỗi đời sống ở lương ×0.6–0.9, cộng với ngưỡng vỡ nợ tính trên lương đã bị hạ. Riêng chẩn đoán "mùa hệ số < 1 không hạ lương" cho 0.585.

Ngoài ra **8b (migrate_sure)** khiến xu_nguoi luôn di cư. Đời có nghề tốt sang nước mới thường bị hạ lương (p × 0.6, ví dụ luật sư thành thương lái), rồi còn nhân ×0.8. xu_nguoi có tỉ lệ dư cao nhất (22%).

### Thí nghiệm (200 đời, chỉ lượt bật; baseline 0.535)

| Thí nghiệm | brokeShare |
|---|---|
| không đổi | 0.64 |
| khoản âm của luật năm trên min(gốc, thực) | 0.64 |
| bỏ mọi luật năm | 0.63 |
| mọi money:<x> âm trong mùa hệ số < 1 trên min(gốc, thực) | 0.60 |
| RESET_CASH_KEEP 0.75 | 0.615 |
| ngưỡng vỡ nợ trên lương gốc | 0.62 |
| chẩn đoán: mùa hệ số < 1 không hạ lương | 0.585 |
| min + KEEP 0.75 | 0.575 (bản dựng thật: 0.605) |
| min + KEEP 0.75 + ngưỡng | 0.545 |
| min + KEEP 1 | 0.58 |

**Nhiễu đo:** đời rẽ khác nhau ngay sau thay đổi đầu tiên, nên hai lần đo 200 đời coi như độc lập. Sai số chuẩn của hiệu là khoảng 0,05. Vì vậy số được so trên ba bộ seed 200 đời: offset 0, 1000003 và 2000006, với baseline 0.535, 0.45 và 0.505.

| Cấu hình | s0 | s1 | s2 | Trung bình (bật − tắt) |
|---|---|---|---|---|
| trước (0a98817) | 0.64 (+0.105) | 0.55 (+0.10) | 0.61 (+0.105) | +0.103 |
| v1 = R29 + KEEP 0.75 | 0.605 (+0.07) | 0.54 (+0.09) | 0.585 (+0.08) | +0.080 |
| v1 + ngưỡng gốc (R30) | 0.58 (+0.045) | 0.53 (+0.08) | 0.57 (+0.065) | +0.063 |
| v1 + hệ số (lam_lai/tron_chay 0.8, xu_nguoi 1) | 0.595 (+0.06) | 0.545 (+0.095) | 0.555 (+0.05) | +0.068 |
| **B = v1 + R30 + hệ số (bản commit)** | 0.575 (+0.04) | 0.54 (+0.09) | 0.555 (+0.05) | **+0.060** |

### Thay đổi (bản commit)
1. **R29 (đề xuất, chờ Tùng):** khoản money:<x> **âm** trong mùa hệ số < 1 tính trên lương thực của mùa, tức min(lương gốc, lương thực). Áp cho thẻ, luật năm và phần tiền riêng của người chưa tự lập.
   - Ngoài mùa và trong mùa hệ số ≥ 1: vẫn lương gốc, như R24.
   - Khoản dương, chung kết (mùa đã đóng trước khi tiền được áp), money_season, repay, borrow, mua bán: không đổi.
   - Mã: `doi-nguoi/canon.js seasonLossYearly` (mới) và `canonOwnOnly`; `doi-nguoi/living.js applyEffect` (một dòng).
2. **`RESET_CASH_KEEP` 0.5 → 0.75** (`Season.ts`). Vào mùa có reset.cash, phần tiền riêng vượt mức đặt lại chỉ mất 1/4. Test `canon-content-test` (resetCashDelta) và `canon-test.js` (đoạn Task 20) đã cập nhật.
3. **R30 (đề xuất, chờ Tùng):** ngưỡng vỡ nợ "nợ > 5 năm thu nhập", cùng mức khoanh 1,5 năm, đo bằng lương gốc `seasonYearlyBase`. Đây là cùng đơn vị R24 dùng cho borrow/repay. Ngoài mùa hai số bằng nhau. Mã: `doi-nguoi/bridge.js argonYear` (một dòng).
4. **Hệ số thu nhập của ba mùa thường.** R24 cho phép chỉnh hệ số hay độ dài riêng khi lương tích lũy lệch.
   - lam_lai ×0.6 → ×0.8 và tron_chay ×0.6 → ×0.8. Cả hai vẫn ≤ 0.8, nên vẫn tính là thay đổi tình thế theo R25.
   - xu_nguoi ×0.8 → ×1. Cú hạ lương của mùa là di cư (p × 0.6 ở nước mới) và reset.cash; thay đổi tình thế R25 là migrate_now.
   - Kiểm R25: season-change-audit vẫn là 64 / 41 / 0 và thoát 0; `DEAD_KEYS_MAX` 1352 bằng đúng trần. Bảng trong `argon/docs/canon/season-change-audit.md` đã sinh lại; ba dòng viết tay về hệ số đã sửa.
5. **Công cụ:**
   - `canon-stats.js` thêm `CANON_STATS_SEED_OFFSET` (bộ seed thứ hai);
   - `canon-money-probe.js` là đầu dò mới.

### Số đo cuối (`canon-stats.js`, Phim)

| Chỉ số | Chuẩn | Trước (0a98817, 200) | Sau (200, seed chính) | Sau (120, offset 1000003) |
|---|---|---|---|---|
| brokeShare | ≤ tắt + 0.05 | 0.64 (tắt 0.535, +0.105) | **0.575 (tắt 0.535, +0.04)** | 0.583 (tắt 0.45, **+0.133**) |
| seasonShareAdult | ≥ 0.6 | 0.643 | 0.64 | 0.649 |
| weirdLifeShare | 0.25–0.40 | 0.32 | 0.36 | 0.367 |
| decisionsP50 | 120–130 | 129 | 130 | 130 |
| shareTwoPlusAt60 | 1.0 | 1.0 | 1.0 | 1.0 |
| livesOver4 / minGap | 0 / ≥ 8 | 0 / 8 | 0 / 8 | 0 / 8 |
| fromPlayerFreshShare | ≥ 0.7 | 0.974 | 0.971 | 0.979 |
| combos | ≥ 150 | 567 | 575 | 360 |

**Bộ seed offset chưa đạt.** Ở 120 đời được +0.133; ở 200 đời qua đầu dò, cùng cấu hình B, được +0.09. Trung bình ba bộ 200 đời là +0.06: giảm 4,3 điểm so với trước, nhưng vẫn trên chuẩn 5 điểm. Bộ seed chính đạt (+0.04) một phần nhờ nhiễu.

### Còn lại, cần Tùng chốt
- **R29, R30:** chấp nhận hay bỏ. Bỏ R30 thì mất khoảng 1,5 điểm.
- **Lựa chọn để xuống dưới +5 chắc chắn** (chưa làm, theo thứ tự ước lượng tác dụng):
  - rút độ dài lam_lai [8, 20] và xu_nguoi [10, 20] xuống khoảng [8, 14]. Đây là nguồn năm-trong-mùa-lương-thấp lớn nhất, nhưng seasonShareAdult chỉ còn dư khoảng 0,04;
  - vu_an_gia_toc ×0.9 → ×1. Luật năm −0.03 vẫn giữ R25;
  - ở xu_nguoi, cho đời di cư giữ bậc nghề (bỏ p × 0.6 khi di cư của mùa), hoặc trả `migrate_sure` về tỉ lệ thành của 20d. Việc này đụng 8b (I2).
- **Hiển thị:** tag tiền trên thẻ (`index.html choiceHTML`, `yearly` ở `render`) vẫn in khoản âm theo lương gốc. Trong mùa hệ số < 1 (giờ chỉ còn ×0.8–0.9 và các mùa kỳ dị), con số hiện ra lớn hơn số trừ thật. Cần nhánh UI (`canon-int-ui`, đang giữ index.html) sửa một dòng: khoản âm dùng `seasonLossYearly(L)`.
- **Tiền AI** (`narrator.js fx.money`) chưa theo R29: khoản âm do AI cho vẫn tính trên lương gốc.

### Test (trên bản commit, sau esbuild + build.py)
- **Engine:** `tsc --noEmit` sạch. PASS: canon-test, canon-content-test (R25 dead keys 1352 = `DEAD_KEYS_MAX`), narrative, holdings, agency, turning-content. `season-change-audit.js` thoát 0 (64 / 41 / 0).
- **Host:** PASS: season-entry, canon-plants, micro (replay ok), money, review-fixes, canon, path, replay (counterfactual), fork (18/20).
- **Sửa test:** `canon-test.js` 8b (swap_other). Khoản "money −1 sau khi đổi đời" giờ so với `seasonLossYearly`. Đời mới đang ở mùa hệ số < 1, nên theo R29 khoản âm tính trên lương thực.
