# Một Lần Chào Đời / Model Argon

Trò chơi mô phỏng cuộc đời theo số liệu thực, có engine lý thuyết trò chơi Argon.
Trang game: https://claude.ai/artifact/Smj8uxWFib5C34KjY714Sw

## Cấu trúc
- `argon/`: engine bằng TypeScript, gồm kinh tế, của cải (`src/engine/economy/Holdings.ts`), băng thông, NPC, storylet, ô "Tôi muốn…" (Agency) và 96 con đường đời (`src/engine/narrative/paths/`).
- `doi-nguoi/`: trang game. `index.html` là bản đã ghép, chính là bản đăng lên trang game. Mã host nằm trong `bridge.js`, `living.js`, `choice.js`, `narrator.js`, `story.js`, `agency.js`, `money.js`.
- `argon/docs/superpowers/`: spec và kế hoạch của tính năng "Tôi muốn…".
- `argon/docs/ledger/`: nhật ký quyết định, các lỗi đã sửa, các việc để sau.

## Build
```sh
cd argon && npm install && npx esbuild src/engine/index.ts --bundle --format=iife --global-name=Argon --minify-syntax --outfile=dist/argon.iife.js && cd ..
python3 doi-nguoi/tests/build.py   # nhúng các script vào doi-nguoi/index.html, sinh tests/.head.js, và sinh bản đăng tách file trong doi-nguoi/publish/
```

## Test
```sh
node doi-nguoi/tests/micro-test.js        # lỗi 0, kẹt 0, chơi lại khớp
node doi-nguoi/tests/repeat-test.js       # số lần lặp mỗi đời
node doi-nguoi/tests/path-test.js
node doi-nguoi/tests/agency-host-test.js
node doi-nguoi/tests/review-fixes-test.js
node doi-nguoi/tests/money-test.js        # tiền: không NaN, tối đa 1 thẻ tiền/năm, mua-bán liên tục thì lỗ, chơi lại khớp
node doi-nguoi/tests/ui-agency-test.mjs   # cần playwright-core và Chromium; sửa đường dẫn import ở dòng 2 cho đúng máy
node doi-nguoi/tests/ui-test.mjs
cd argon && node --experimental-strip-types src/agency-test.ts && node --experimental-strip-types src/narrative-test.ts && node --experimental-strip-types src/holdings-test.ts
```

## Đăng lên trang game
Đăng bản tách file trong `doi-nguoi/publish/`: trang chính `index.html` (~45KB) cùng các file `.js` đi kèm (danh sách trong `files.txt`; `argon.js` ~3,7MB là engine kèm toàn bộ nội dung). Tách để lần cập nhật sau chỉ phải đọc trang chính thay vì cả 3,9MB. Đọc bản đang chạy trước (Artifact read), gộp thay đổi của session khác, rồi đăng lên cùng URL với `capabilities: {"sample": {}}`. Không dùng force.

## Tính năng tiền (18/10/2026)
Spec: `argon/docs/superpowers/specs/2026-10-18-tien-bac-design.md`. Người chơi dùng tiền qua thẻ (gói `money_life`, `money_assets`, `money_people`, `money_invest`, 52 thẻ) và qua ô "Tôi muốn…" (việc lớn `mua`, `ban`, `muc_song`, `gui_tiet_kiem`, `rut_tiet_kiem`, `bao_hiem`, `bo_bao_hiem`, `cho_vay`, `cho_tien`, `chu_cap`). Bảng bên phải có mục "Của cải"; màn kết có "Bạn để lại gì".
- Giá nhà neo theo tỉ lệ giá/thu nhập của Numbeo; vay mua có kỳ hạn riêng, không tính vào nợ tiêu dùng.
- Việc để sau: tỉ lệ có nhà ở tuổi 40 còn rất thấp (2–4%) vì phần lớn đời trong game âm tiền từ trước khi có tính năng này; cần cân lại kinh tế chung.

## Tình trạng (18/10/2026)
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
