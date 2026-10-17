# Một Lần Chào Đời / Model Argon

Trò chơi mô phỏng cuộc đời theo số liệu thực, có engine lý thuyết trò chơi Argon.
Trang game: https://claude.ai/artifact/LakKYQieoAm7osu5inVJ1B

## Cấu trúc
- `argon/`: engine bằng TypeScript, gồm kinh tế, băng thông, NPC, storylet, ô "Tôi muốn…" (Agency) và 96 con đường đời (`src/engine/narrative/paths/`).
- `doi-nguoi/`: trang game. `index.html` là bản đã ghép, chính là bản đăng lên trang game. Mã host nằm trong `bridge.js`, `living.js`, `choice.js`, `narrator.js`, `story.js`, `agency.js`.
- `argon/docs/superpowers/`: spec và kế hoạch của tính năng "Tôi muốn…".
- `argon/docs/ledger/`: nhật ký quyết định, các lỗi đã sửa, các việc để sau.

## Build
```sh
cd argon && npm install && npx esbuild src/engine/index.ts --bundle --format=iife --global-name=Argon --minify-syntax --outfile=dist/argon.iife.js && cd ..
python3 doi-nguoi/tests/build.py   # nhúng các script vào doi-nguoi/index.html, đồng thời sinh tests/.head.js
```

## Test
```sh
node doi-nguoi/tests/micro-test.js        # lỗi 0, kẹt 0, chơi lại khớp
node doi-nguoi/tests/repeat-test.js       # số lần lặp mỗi đời
node doi-nguoi/tests/path-test.js
node doi-nguoi/tests/agency-host-test.js
node doi-nguoi/tests/review-fixes-test.js
node doi-nguoi/tests/fixes-1018-test.js
# Test giao diện cần playwright-core và Chromium; đặt PW_CORE (đường dẫn playwright-core/index.mjs) và PW_CHROME (file chạy Chrome) cho đúng máy
node doi-nguoi/tests/ui-agency-test.mjs
node doi-nguoi/tests/ui-test.mjs
node doi-nguoi/tests/ui-fixes-1018-test.mjs
cd argon && node --experimental-strip-types src/agency-test.ts && node --experimental-strip-types src/narrative-test.ts
```

## Đăng lên trang game
Đọc bản đang chạy trên trang game trước (Artifact read). Session khác có thể đã đăng bản mới hơn, nên gộp thay đổi của bản đó vào trước rồi mới đăng `doi-nguoi/index.html` lên cùng URL. Không dùng force.

## Tình trạng (18/10/2026)
- Lỗi 0, kẹt 0. Trung vị 110 quyết định mỗi đời. Lặp 4,96 lần mỗi đời. 2.315 tình huống, 96 con đường đời.
- Việc để sau:
  - Không cưới được người đã có trong đời mình bằng ô gõ.
  - Phần kết đời có thể hiện ra khi thẻ kết quả vẫn đang chạy chữ.
  - Con đường đời dạng "life" thay luôn nghề và thu nhập.
  - Thẻ chuyện nhỏ không thuộc con đường đời nào chỉ xuất hiện 1 lần mỗi đời.
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
