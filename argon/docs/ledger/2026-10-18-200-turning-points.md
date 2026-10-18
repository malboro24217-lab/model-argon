# 200 bước ngoặt — triển khai cục bộ

Nền đầu tiên: snapshot GitHub `206e831f5498c3505fff5afd5319ac0d8bc9e8a3`. Đã ghép đợt 1 của Claude từ main `2f72dbecf10be9fd9ad3fb478b2c98749ac932a1`, bao gồm phase1.js, giao diện cause-line, thẻ thập kỷ, kết đời, tấm bia và thử lại từ năm cũ. Snapshot được lấy qua GitHub connector do git CLI không tải được repository trong phiên này. Git local có một commit nền riêng; không dùng commit local đó làm lịch sử upstream.

## Cổng chất lượng chưa đạt — giữ draft

Đã đọc `argon/docs/fate/AUTHORING.md` của Claude. Bản này có **một** thẻ hậu quả cho mỗi lựa chọn, chưa có chuỗi 3–6 thẻ. Không đạt yêu cầu chiều sâu mới; 17 kiểm tra kỹ thuật qua không thay thế yêu cầu đó.

`node tools/measure-turning-divergence.js doi-nguoi/tests/.head.js 60 4` dùng cùng seed và phép đo ID thẻ tương lai như công cụ của Claude, chỉ thay tập cảnh mở đầu bằng `TURNING_POINTS`. 60 đời, 232 lần đổi lựa chọn, bao phủ 101/200 cảnh mở đầu: p25=1,064%, trung vị=1,5625%, p75=2,778%; 0/232 đạt 70%. Mẫu nhỏ theo từng cảnh không chứng nhận đủ 200 cảnh. Kết quả thô, từng seed và nhóm theo cảnh nằm ở `qa/turning-points/divergence-baseline.json`.

Không đổi ID thẻ hay tạo các bản sao chỉ để làm tăng phép đo. Cần viết thêm các chuỗi hệ quả có nội dung riêng và nối trạng thái đời sống phù hợp; chưa triển khai các chuỗi đó trong commit này. Chưa đo so sánh kinh tế với main không có gói mới theo tiêu chuẩn AUTHORING. Chưa có playtest chứng minh mọi lựa chọn hấp dẫn.

Nhánh: `codex/200-turning-points`; PR: https://github.com/malboro24217-lab/model-argon/pull/1. Giữ draft, chưa đủ điều kiện merge/phát hành.

## Phạm vi đã triển khai

- 50 điện ảnh/sitcom, 50 hài vô lý, 50 tiền bạc, 50 tình yêu.
- Mỗi tình huống mở đầu có 3 lựa chọn. Mỗi lựa chọn mở đúng một trong 3 cảnh hậu quả riêng: tổng cộng 600 cảnh hậu quả.
- Mỗi cảnh hậu quả có 2 quyết định: tiếp tục hoặc đổi hướng theo nội dung đã viết. Hai quyết định có tone riêng, không mặc định phương án thứ hai là rút lui.
- Cờ nhánh quyết định cảnh quay lại và được đọc vào văn bia khi kết đời.
- Hẹn quay lại sau 1–3 năm; cảnh có thể trễ nếu năm đó có chuyện khẩn, lời hứa hoặc cảnh khác đang chờ. Chết có thể để lại chuyện dang dở.
- Mỗi tình huống chỉ xuất hiện một lần; mở tối đa một chuyện mới mỗi 2 năm, tối đa 3 chuyện đang mở và 50 chuyện mới trong một đời. Đây là trần, không ép người chơi gặp đủ số.
- Cảnh tiền mới đi qua ngân sách thẻ tiền sẵn có: tối đa một thẻ tiền mỗi năm. Điều kiện `money` yêu cầu đã có tiền riêng/tự lập.
- Tuổi, quốc gia, người còn hiện diện, hôn nhân và tài sản là điều kiện xuất hiện. Người liên quan được lưu bằng ID tại thời điểm chọn, không thay bằng bạn đời/đối tác mới.
- Nếu người liên quan không còn trong đời ở lúc hậu quả tới, cảnh chuyển sang nhìn lại chuyện cũ, không bắt người đã mất quay lại đối thoại.

## Nối vào cơ chế hiện có

`links.ts` nối cụ thể việc chuyển thành phố, vay/học, nhận nghề chính, mất việc, bán cửa hàng, cho vay, tặng tiền và mức hỗ trợ con vào Effect sẵn có. Những hoạt động như góp lịch tour, cho thuê sân, biểu diễn một buổi là hoạt động phụ; không thay nghề chính. Những lựa chọn đổi nghề ghi rõ trên nút và có giới hạn tuổi phù hợp registry.

Phần lớn quyết định xã hội tác động bằng ký ức, chỉ số, cờ nhánh và cảnh hậu quả đã viết. Không bổ sung hệ thống hẹn hò, quyền sở hữu đàn vịt hay tài sản dùng chung riêng biệt. 15 hệ thống kiểu Sims, kẻ thù tự học và 30 kết sưu tập không nằm trong bản này.

## Lỗi sửa trong lúc tích hợp

1. Hàng đợi cũ xóa mọi cuộc hẹn đã tới hạn trước khi hiển thị một cảnh; những cảnh còn lại bị mất. Nay chỉ lấy cuộc hẹn đang xử lý, giữ cuộc hẹn khác và cuộc hẹn tạm chưa đủ điều kiện.
2. Hàng đợi tìm được cả thẻ lớn lẫn thẻ nhỏ; bỏ cuộc hẹn đã hiện nếu thẻ chỉ được hiện một lần.
3. “Hai căn bếp” cần cả bố và mẹ còn hiện diện.
4. “Bạn thân đứng nhầm vai chú rể” gắn đúng người bạn thân, đồng thời yêu cầu có bạn đời khác người đó.
5. Không dùng một phép tung tiền chung cho mọi lựa chọn mang tone mạo hiểm; vay để học tạo khoản nợ và trạng thái học thật.
6. Các hoạt động phụ không đổi nghề chính; chỉ những lựa chọn đổi nghề rõ ràng mới làm điều đó.

## Cách kiểm tra và bàn giao

```powershell
# Tại thư mục repo, sau npm ci trong argon:
argon/node_modules/.bin/esbuild.cmd argon/src/engine/index.ts --bundle --format=iife --global-name=Argon --minify-syntax --outfile=argon/dist/argon.iife.js
$env:PYTHONUTF8='1'
python doi-nguoi/tests/build.py
python tools/verify-turning-points.py
node --experimental-strip-types tools/export-turning-catalog.mjs
```

`qa/turning-points/results.json` ghi lệnh và exit code của 17 kiểm tra headless; từng `.log` giữ kết quả đầy đủ. `turning-sim-test` dùng 200 seed khác nhóm kiểm tra nội dung; `replay-test` kiểm tra 200 đời có cảnh AI giả, tiền và render. Test nội dung riêng kiểm tra đủ 200 cảnh trong 30.000 bối cảnh; test host đi cả 600 nhánh và 1.200 kết nhánh. Hai kiểm tra bổ sung từ main là `readers-test` và `fork-test`.

`narrative-test` cũ tạo bối cảnh ngẫu nhiên không có cờ nhánh mới, vì vậy liệt kê 600 echo là chưa gặp trong mẫu tĩnh. Khả năng đi tới các echo này được kiểm tra riêng bằng áp dụng lựa chọn thật qua host trong `turning-points-test`.

17/17 kiểm tra headless đã qua trên bản ghép đợt 1. Mẫu 200 đời độc lập có trung vị 26 cảnh mở đầu và 25 hậu quả, quan sát được 181 cảnh mở đầu khác nhau; lỗi, kẹt, lặp cảnh mở đầu và lệch chơi lại đều 0. Mẫu chơi lại đầy đủ 200 đời cũng có renderDiff=0 và replayDiff=0. Kết quả và log chi tiết nằm trong `qa/turning-points/` của gói bàn giao.

Chưa chạy hai script UI hardcode đường dẫn Chromium Linux của Claude; trình duyệt tương tác hiện không mở tab mới trong sidebar. Chưa xác nhận AI thật, chưa thử với người chơi, chưa đăng lên Artifact. Nhánh triển khai được chuẩn bị cho review, không tự merge hoặc đăng game. Test không chứng minh mọi người chơi sẽ thấy mọi nhánh hấp dẫn.

Danh mục để đọc: `argon/docs/content/2026-10-18-200-buoc-ngoat.md`. Khi ghép với thay đổi dở của Claude, áp dụng source patch trên bản nền phù hợp, build lại, chạy test rồi đọc và gộp bản Artifact đang chạy trước khi đăng theo CLAUDE.md.
