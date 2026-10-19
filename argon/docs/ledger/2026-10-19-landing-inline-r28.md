# 2026-10-19 · canon-int-ui: thẻ chung kết trong cột quyết định (R28), dòng nguyên nhân trên điện thoại

Lỗi gốc: báo cáo ghép canon-int (`.superpowers/sdd/2026-10-18-canon-event/integration-report.md`, mục "Findings for the reviewers"). Chỉ sửa giao diện (`doi-nguoi/index.html`, `doi-nguoi/canon-ui.js`) và test. Không đụng engine, nội dung, `canon.js`, `living.js`.

## Quyết định
- **R28 (controller): thẻ "Mùa N khép lại" nằm trong cột quyết định**, là một thẻ ngắn ngay trên thẻ quyết định đang chờ (không có quyết định thì ngay trên ô "Tôi muốn…" và nhật ký). Trước đây thẻ nổi cố định ở `bottom: --dock-h + 76px`; từ 21c `--dock-h` không còn tính ô tự nhập khi ô nằm trong thẻ, nên trên điện thoại thẻ chung kết che ô "Bạn muốn làm theo cách khác?" tới 7 giây, và chạm vào đó thì đóng thẻ chứ không vào ô.
  Chỗ đặt: `<div id="landing-card">` có sẵn trong khung bàn chơi, trước `#dec`; trên điện thoại cùng `order` với `#dec`, chỉ hiện ở tab "Năm nay". Không còn bấm để đóng (thẻ nằm trong luồng trang, đóng giữa chừng sẽ làm thẻ quyết định nhảy lên dưới tay người chơi).
- **Tuổi thọ tính theo thời gian trong game**, không theo giây thật: thẻ còn tới quyết định kế tiếp của người chơi (lựa chọn có sẵn, hết giờ tự chọn, hay hành động tự nhập) hoặc tới khi sang năm mới, cái nào tới trước. `seasonNotes` neo mỗi ghi chú vào năm và số đếm `L.choices.length + L.actSeq` lúc trang thấy nó lần đầu (`x.at`, `x.tok`, chỉ là trường giao diện). Đồng hồ dừng khi có quyết định chờ, nên thẻ không biến mất trong lúc người chơi đang đọc thẻ quyết định bên dưới. Ở 16× thẻ không còn sống sang mùa sau (lỗi Mùa 2 từ 51 tuổi còn hiện ở 58).
  Hệ quả có chủ đích: chung kết rơi vào năm không có quyết định kế tiếp thì ở 16× thẻ chỉ hiện chừng một năm game (khoảng 0,1 giây); câu chung kết vẫn ở nhật ký và màn kết.
- Vẫn không phải quyết định, không chặn đồng hồ, không đụng mô phỏng: tua lại khớp như cũ. Không nằm trong vùng bị làm mờ của chế độ đường hầm (`.log`, cột bên), đọc rõ ở độ mờ 1.
- **Dòng nguyên nhân** (`.because summary`) là một dòng chữ chảy liền thay cho flex xuống dòng: "↩ Có liên quan đến lựa chọn năm N tuổi và k lần trước đó · Xem lại" xuống dòng tự nhiên, "· Xem lại" luôn đi liền nhau ở cuối.

## Test
- `ui-canon-test.mjs`: đời có hạt giống cố định (11) thay vì `Math.random` (trước đây đời chết trước 30 tuổi làm phần banner điện thoại thất bại ngẫu nhiên); thêm phần R28: thẻ nằm trên `#dec`, không chồng lên ô tự nhập, vẽ lại lúc dừng không mất, mất sau quyết định kế tiếp và sau một năm.
- `ui-want-place.mjs` (mới): ô tự nhập trên 5 loại thẻ × 390/821/1366 × sáng/tối × 5 trạng thái AI, có và không có thẻ chung kết.
- `canon-play.mjs`: thêm `--speed`; thẻ chung kết được chụp trong luồng trang và kiểm không nổi, không chồng lên ô tự nhập.
