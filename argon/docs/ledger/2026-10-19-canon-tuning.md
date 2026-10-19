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
