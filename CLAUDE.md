# Model Argon / Một Lần Chào Đời

Đọc README.md trước: trong đó có cấu trúc thư mục, cách build, cách chạy test và tình trạng hiện tại.

Quy tắc khi sửa:
- Engine nằm trong `argon/src`. Sửa xong thì bundle lại vào `argon/dist/argon.iife.js` (lệnh ở README), rồi chạy `python3 doi-nguoi/tests/build.py` để ghép lại `doi-nguoi/index.html`.
- Sau khi ghép, chạy các test trong `doi-nguoi/tests` (micro, repeat, path, agency-host, review-fixes, money) trước khi commit.
- Trang game: https://claude.ai/artifact/Smj8uxWFib5C34KjY714Sw (bản tách file từ 18/10/2026; link cũ LakKYQieoAm7osu5inVJ1B là bản gộp, không cập nhật nữa).
  Đăng bản tách file trong `doi-nguoi/publish/` (do build.py sinh ra): `file_path` = `doi-nguoi/publish/index.html`, `files` = từng file `.js` trong `doi-nguoi/publish/files.txt`, `url` = link trên, giữ `capabilities: {"sample": {}}`. Chỉ cần gửi những file `.js` đã đổi.
  Trước khi đăng, đọc bản đang chạy bằng Artifact read (trang chính chỉ ~45KB) và gộp thay đổi của session khác vào. Không dùng force.
- Nội dung phải tự viết, chỉ lấy cảm hứng từ các mô-típ quen thuộc. Không chép tác phẩm có thật, không dùng người thật. Con đường phạm pháp chỉ tả hậu quả, không tả cách làm.
- Người dùng (Tùng) nói tiếng Việt, xưng tao/mày; trả lời bằng tiếng Việt.
- Nhật ký quyết định: `argon/docs/ledger/`.
