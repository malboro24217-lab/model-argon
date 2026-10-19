# Một Lần Chào Đời / Model Argon

Trò chơi mô phỏng cuộc đời theo số liệu thực, có engine lý thuyết trò chơi Argon.
Trang game: https://claude.ai/artifact/Smj8uxWFib5C34KjY714Sw

## Cấu trúc
- `argon/`: engine bằng TypeScript, gồm kinh tế, của cải (`src/engine/economy/Holdings.ts`), băng thông, NPC, storylet, ô "Tôi muốn…" (Agency), 96 con đường đời (`src/engine/narrative/paths/`), canon event và Mùa (`src/engine/narrative/canon/`).
- `doi-nguoi/`: trang game. `index.html` là bản đã ghép, chính là bản đăng lên trang game. Mã host nằm trong:
  - `bridge.js`, `living.js`, `choice.js`, `narrator.js`, `story.js`, `agency.js`, `money.js`;
  - `canon.js`: canon event và Mùa (vòng năm, vào và ra mùa);
  - `phase1.js`: hệ quả nhìn thấy được, thẻ thập kỷ, màn kết v2, Tấm bia, thử lại từ năm N, mục "Các mùa của đời bạn";
  - `canon-ui.js`: màu mùa, banner mùa, ô Độ điên.
- `argon/docs/superpowers/`: spec và kế hoạch của các tính năng ("Tôi muốn…", tiền, canon event…).
- `argon/docs/canon/`: quy tắc viết mùa và nhánh kỳ dị.
- `argon/docs/ledger/`: nhật ký quyết định, các lỗi đã sửa, các việc để sau.

## Build
```sh
cd argon && npm install && npx esbuild src/engine/index.ts --bundle --format=iife --global-name=Argon --minify-syntax --outfile=dist/argon.iife.js && cd ..
python3 doi-nguoi/tests/build.py   # nhúng các script vào doi-nguoi/index.html, sinh tests/.head.js, và sinh bản đăng tách file trong doi-nguoi/publish/
```
`build.py` nhúng từng file host vào khối `<script id="…">` cùng tên trong `index.html`. `canon.js` nằm sau `money.js` và có mặt ở cả ba nơi: trang, `tests/.head.js`, `publish/files.txt`.

`canon-ui.js` đã có chỗ sẵn là `<script id="canonui">` trong `index.html`, nhưng chưa có trong `build.py`. Task 8b sẽ thêm khóa `'canonui'` vào ba danh sách của `build.py`: `srcs`, danh sách của `.head.js`, danh sách của `publish`. Trước khi có bước đó, `canon-ui-test.js` tự nạp thẳng `doi-nguoi/canon-ui.js`.

## Test
```sh
node doi-nguoi/tests/micro-test.js        # lỗi 0, kẹt 0, chơi lại khớp
node doi-nguoi/tests/repeat-test.js       # số lần lặp mỗi đời
node doi-nguoi/tests/path-test.js
node doi-nguoi/tests/agency-host-test.js
node doi-nguoi/tests/review-fixes-test.js
node doi-nguoi/tests/money-test.js        # tiền: không NaN, tối đa 1 thẻ tiền/năm, mua-bán liên tục thì lỗ, chơi lại khớp
node doi-nguoi/tests/readers-test.js      # bảng MEM_READERS (báo "X sẽ nhớ điều này") phải khớp mọi storylet đọc ý kiến NPC
node doi-nguoi/tests/fork-test.js         # "Thử lại từ năm N": đời rẽ giống bản gốc trước chỗ rẽ, chơi tiếp được, tua lại khớp (khoảng 1,5 phút)
node doi-nguoi/tests/replay-test.js       # tất định: 200 đời có sương mù, AI, tiền, perk; vẽ giao diện không đổi đời; tua lại khớp 100%; đời giả định giữ nguyên các năm trước (ledger 2026-10-18-tat-dinh)
node doi-nguoi/tests/canon-test.js        # canon event và Mùa: 120 đời tự chơi (≥ 2 canon event ở đời tới 60, tối đa 4, cách nhau ≥ 8 năm), cắt mùa, người phụ thuộc, hệ số thu nhập, tua lại (khoảng 1,5 phút)
node doi-nguoi/tests/canon-plants-test.js # vật gài được dùng dần: vết không lặp giữa hai mùa liền nhau, `what` ít dùng lại, trả nợ / giữ lời, tua lại (khoảng 1,5 phút)
node doi-nguoi/tests/canon-ui-test.js     # màn kết "Các mùa của đời bạn" (dang dở, bị cắt ngang), banner, màu mùa đủ tương phản ở cả 105 mùa
node doi-nguoi/tests/canon-play.mjs --weird 0,1,2 --seeds 11,22 --out /tmp/canon-play   # chơi thật trên Chromium như người chơi, chụp biến cố, banner mùa, thẻ mùa, chung kết, màn kết, Tấm bia; bảng ảnh ở <out>/index.html, summary.json mỗi đời; thêm --width 1366 --dark cho máy tính; thoát 1 nếu lỗi console, lộ undefined/NaN/null hay id vai, banner lệch mùa, kỳ dị ở Độ điên 0
node doi-nguoi/tests/ui-agency-test.mjs   # cần playwright-core và Chromium; sửa đường dẫn import ở dòng 2 cho đúng máy
node doi-nguoi/tests/ui-test.mjs
cd argon && node --experimental-strip-types src/agency-test.ts && node --experimental-strip-types src/narrative-test.ts && node --experimental-strip-types src/holdings-test.ts
cd argon && node --experimental-strip-types src/canon-test.ts           # áp lực, vật gài, 3 vết, generator, 8 mầm, ánh xạ thẻ Codex
cd argon && node --experimental-strip-types src/canon-content-test.ts   # mọi mùa, mầm và nhánh kỳ dị: cấu trúc, chữ, cổng tuổi, probe quy tắc 9 (dưới một phút)
cd argon && npx tsc --noEmit
```
Các dòng `cd argon && …` chạy từ thư mục gốc của repo.

## Đăng lên trang game
Đăng bản tách file trong `doi-nguoi/publish/`: trang chính `index.html` (~45KB) cùng các file `.js` đi kèm (danh sách trong `files.txt`; `argon.js` ~3,7MB là engine kèm toàn bộ nội dung). Tách để lần cập nhật sau chỉ phải đọc trang chính thay vì cả 3,9MB. Đọc bản đang chạy trước (Artifact read), gộp thay đổi của session khác, rồi đăng lên cùng URL với `capabilities: {"sample": {}}`. Không dùng force.

## Canon event và Mùa (18/10/2026)
- Spec: `argon/docs/superpowers/specs/2026-10-18-canon-event-design.md`.
- Kế hoạch: `argon/docs/superpowers/plans/2026-10-18-canon-event.md`.
- Quyết định, ruling, số đo, việc để sau: `argon/docs/ledger/2026-10-18-canon-event.md`.

Đời được kể như kịch bản:
- Lựa chọn đẩy áp lực lên 8 trục: Tiền, Tình, Máu mủ, Danh, Luật, Thân xác, Đất, Kỳ.
- Trục nào vượt ngưỡng thì nổ thành một **canon event**. Biến cố được dựng từ chính những thứ đời này đã gieo (vật gài).
- Mỗi biến cố mở 3 cửa, mỗi cửa mở một **Mùa** có luật, màu, người mới và kho thẻ riêng.
- Đợt A có 8 mầm, 5 mùa thường và 100 nhánh kỳ dị (50 viễn tưởng, 50 phi lý): tổng 105 mùa, 869 thẻ. 200 thẻ "bước ngoặt" của Codex ở lại làm thẻ gài và cảnh phụ trong mùa.

### Người chơi thấy gì
- **Biến cố:**
  - 2–4 lần mỗi đời, trong khoảng 8–72 tuổi, một thẻ biến cố lớn hiện ra và không bỏ qua được;
  - chữ của thẻ dựng từ đời người chơi: một tờ giấy nợ cũ, một người bạn thuở nhỏ, căn nhà đang ở…;
  - thẻ có đúng 3 cửa, mỗi cửa một cách đối mặt (đối đầu, bỏ chạy, thỏa hiệp, lật bàn…), dưới mỗi cửa có một dòng gợi ý;
  - cửa kỳ dị có gợi ý "Viễn tưởng: …" hoặc "Phi lý: …".
- **Vào mùa:**
  - nhật ký in "Mùa N: tên mùa.";
  - trang đổi màu nhấn theo mùa;
  - dưới thanh trên cùng có banner ghi tên mùa, khoảng tuổi, năm thứ mấy của mùa, nhịp hiện tại (Mở màn, Biến cố khởi động, Cú lật, Đáy, Chung kết) và thanh tiến độ; mùa kỳ dị có thêm tem "nhánh viễn tưởng" hay "nhánh phi lý";
  - thước năm tô dải màu của từng mùa.
- **Trong mùa:**
  - tiền, nghề, nơi ở và dàn nhân vật có thể đổi hẳn;
  - có 2–3 người mới (nhánh kỳ dị 1–2) và một câu đùa lặp lại;
  - ba "vết" của đời cũ quay lại ở cú lật và chung kết, kèm dòng "↩ Vì năm N…": một người, một đồ vật hay kỹ năng, một món nợ hay lời hứa.
- **Chung kết:**
  - người chơi chọn cách đáp xuống: nghề mới, nước mới, hôn nhân, tiền…;
  - biến cố mới nổ giữa mùa thì mùa cũ bị cắt ngang.
- **Màn kết:**
  - mục "Các mùa của đời bạn" liệt kê từng mùa với khoảng tuổi và cách nó khép lại: dòng chung kết, "bị cắt ngang", hoặc "dang dở" khi chết giữa mùa;
  - Tấm bia có thêm một dòng tên các mùa.
- **Sắp có (Task 8b):**
  - dòng "Bản kia của bạn": ở dòng thời gian kia, nếu chọn cửa khác, bạn đã vào mùa nào và đáp xuống đâu;
  - AI viết lại chữ biến cố khi trang có quyền `sample`;
  - các custom `swap_other`, `remark`, `age_skip`, `longevity` mà vài nhánh kỳ dị dùng (hiện chưa có tác dụng).

### Độ điên
- Menu có ô "Độ điên" với ba mức:

  | Mức | Hệ số nhân với trục Kỳ | Nghĩa |
  |---|---|---|
  | Đời thật | ×0 | Không có biến cố hay cửa kỳ dị nào |
  | Phim (mặc định) | ×1 | Thỉnh thoảng đời rẽ sang một mùa kỳ dị |
  | Điên | ×2 | Chuyện kỳ dị đến thường hơn |

- Cửa kỳ dị mở khi Kỳ (đã nhân hệ số) ≥ 6. Khi chính trục Kỳ nổ, cả 3 cửa đều kỳ dị.
- Đổi Độ điên giữa đời đi qua `uiOp` và được ghi vào actLog, nên tua lại vẫn khớp.
- Hàm `setWeird` do Task 8b thêm vào `canon.js`. Trước đó ô Độ điên bị ẩn và mọi đời chạy ở mức Phim.

### Thêm một mùa thường
1. Tạo `argon/src/engine/narrative/canon/seasons/<id>.ts`, export một `SeasonDef`. Chỉ dùng helper của `argon/src/engine/narrative/canon/kit.ts` (`card`, `land`, `ending`, `finale`, `noOr`, `cap`). Mẫu đầy đủ và mọi luật nằm ở chú thích đầu `kit.ts`.
2. Thêm mùa vào `SEASONS_NORMAL` trong `canon/seasons/index.ts`.
3. Cho mùa một lối vào:
   - một cửa của mầm trong `canon/seeds.ts` có `season: "<id>"`, hoặc một mục trong `GENERIC_DOORS` của `canon/Canon.ts`;
   - thêm id vào `NORMAL_SEASONS` trong `Canon.ts` (danh sách dự phòng khi mùa của cửa đã chơi);
   - mùa cần người chơi tự lập thì thêm vào `NEEDS_INDEPENDENT`.
4. Muốn thẻ Codex làm cảnh phụ trong mùa: gắn tag trong `CODEX_SEASON_TAGS` (`canon/codexPlants.ts`). Đồng thời thêm id vào `NORMAL_SEASON_IDS` ở cùng file, và sửa phép kiểm "5 id mùa thường" trong `argon/src/canon-test.ts`.
5. Theo `argon/docs/canon/authoring-rules.md` (quy tắc 1–10) và `argon/docs/content-guide.md` §4–5.
6. Chạy `canon-content-test.ts`, `canon-test.ts` và `npx tsc --noEmit`. Sau đó bundle, chạy `build.py` và các test host.

### Thêm một nhánh kỳ dị
1. Mỗi file trong `argon/src/engine/narrative/canon/weird/` chứa 10 nhánh và export một mảng theo tên file: `sf_01.ts` → `SF_01`, …, `abs_41.ts` → `ABS_41`. Đợt mới tạo file mới, rồi nối mảng vào `WEIRD_ALL` trong `canon/weird/index.ts`.
2. Viết nhánh bằng `weird(id, kind, axes, when, door, trigger, season({...}), hint?)` của `kit.ts`. Luật của bộ kiểm:
   - id dạng `S..` (viễn tưởng) hoặc `X..` (phi lý), `season.id = "w_" + id`;
   - 7–10 thẻ trong 5 nhịp, 1–2 người mới, `years` trong [5, 12];
   - màu: viễn tưởng thuộc dải xanh–tím, phi lý thuộc dải vàng–cam;
   - `trigger` có một câu thoại trong ngoặc kép;
   - `when` ("Mọc từ") chỉ đọc trường có thật của FactContext và phải đúng ở ít nhất một bối cảnh fuzz.
3. Theo đủ 10 quy tắc trong `argon/docs/canon/authoring-rules.md`. Quan trọng nhất:
   - khoảng tuổi trong `when`;
   - cổng tuổi của landing đổi nghề;
   - câu khẳng định nợ, việc, nhà, vợ chồng, con phải đúng với mọi bối cảnh;
   - lựa chọn có `tier` không đứng đầu.
4. Custom phía host dùng được: `become:<p>`, `migrate_now`, `move_city`, `marry`, `marry:<tên>`, `spouse_leave`, `have_child`, `job_lose`, `borrow:x`, `repay:x`, `explode_hook`, `return_home`, `retire`. Còn `age_skip:<n>`, `longevity:<n>`, `remark`, `swap_other` thì chờ Task 8b mới có tác dụng.
5. Chạy `canon-content-test.ts` (kiểm cả nhánh mới), `canon-test.ts` và `npx tsc --noEmit`, rồi bundle, `build.py`, `canon-test.js`.

## Tính năng tiền (18/10/2026)
Spec: `argon/docs/superpowers/specs/2026-10-18-tien-bac-design.md`. Người chơi dùng tiền qua thẻ (gói `money_life`, `money_assets`, `money_people`, `money_invest`, 52 thẻ) và qua ô "Tôi muốn…" (việc lớn `mua`, `ban`, `muc_song`, `gui_tiet_kiem`, `rut_tiet_kiem`, `bao_hiem`, `bo_bao_hiem`, `cho_vay`, `cho_tien`, `chu_cap`). Bảng bên phải có mục "Của cải"; màn kết có "Bạn để lại gì".
- Giá nhà neo theo tỉ lệ giá/thu nhập của Numbeo; vay mua có kỳ hạn riêng, không tính vào nợ tiêu dùng.
- Việc để sau: tỉ lệ có nhà ở tuổi 40 còn rất thấp (2–4%) vì phần lớn đời trong game âm tiền từ trước khi có tính năng này; cần cân lại kinh tế chung.

## Tình trạng (18/10/2026)
### Kho 200 bước ngoặt (bản tích hợp cục bộ)

> Hướng "mỗi lựa chọn một cảnh hậu quả" dưới đây đã được thay bằng canon event và Mùa (mục trên; lý do ở `argon/docs/ledger/2026-10-18-canon-event.md`). 200 thẻ vẫn ở lại: chúng làm thẻ gài, có 534/600 route gieo vật gài, và 138 thẻ làm cảnh phụ trong mùa. Đoạn dưới giữ lại để biết lịch sử.

Thêm 200 cảnh mở đầu chia đều điện ảnh/sitcom, hài vô lý, tiền và tình yêu; 600 cảnh hậu quả theo lựa chọn, mỗi cảnh có hai quyết định. Đã ghép đợt 1 của Claude. **Giữ draft:** mỗi nhánh hiện chỉ có một thẻ tiếp nối, phép đo 232 lần đổi lựa chọn có trung vị 1,5625% thẻ tương lai khác đi; chưa đạt chuẩn chiều sâu/70% trong `argon/docs/fate/AUTHORING.md`. 17/17 kiểm tra headless qua không chứng minh đạt chuẩn kể chuyện. Danh mục: `argon/docs/content/2026-10-18-200-buoc-ngoat.md`. Chi tiết tích hợp và giới hạn: `argon/docs/ledger/2026-10-18-200-turning-points.md`. Chạy toàn bộ kiểm tra headless và lưu log: `python tools/verify-turning-points.py`. Đo mức khác biệt: `node tools/measure-turning-divergence.js doi-nguoi/tests/.head.js 60 4`. Xuất lại danh mục: `node --experimental-strip-types tools/export-turning-catalog.mjs`. Bản này chưa được đăng lên Artifact.

- Lỗi 0, kẹt 0. Trung vị 110 quyết định mỗi đời. Lặp 4,96 lần mỗi đời. 2.315 tình huống, 96 con đường đời.
- Việc để sau:
  - Không cưới được người đã có trong đời mình bằng ô gõ.
  - Phần kết đời có thể hiện ra khi thẻ kết quả vẫn đang chạy chữ.
  - Con đường đời dạng "life" thay luôn nghề và thu nhập.
  - Thẻ chuyện nhỏ không thuộc con đường đời nào chỉ xuất hiện 1 lần mỗi đời.
  - `ui-agency-test.mjs` hết giờ chờ ô gõ (ô bị khóa) — lỗi có từ trước tính năng tiền.
- Câu thử với AI thật:
  - "mở quán phở"
  - "tôi trúng xổ số"
  - "đi Nhật làm thợ hàn"
  - "làm lành với bố"
  - "bỏ vợ/bỏ chồng"
  - "đi làm thêm" ×5 trong một năm
  - "đánh thằng hàng xóm"
  - "bay lên mặt trăng"
  - "rủ chủ nợ góp vốn vào quán" (lúc đang có cảnh "Chủ nợ đập cửa")
  - "học lại đại học năm 40 tuổi"

