# 18/10/2026 — Sửa 7 lỗi từ đợt review

Nhánh: `fix/review-2026-10-18`. Bản sao lưu trước khi sửa: nhánh `main` (commit `81dafd1`) và các file `.bak-2026-10-18`.

## Đã sửa

| # | Lỗi | Sửa | Test |
|---|-----|-----|------|
| 1 | Gõ câu trả lời cho thẻ storylet làm mất bộ đếm, gỡ cờ, hẹn chuyện của thẻ: cung truyện con đường đứng vĩnh viễn, `scandal` lặp mỗi năm | `applyAct` áp thêm phần sổ sách (`counters`, `unflags`, `later`) của nút mặc định sau kết quả AI. Không áp `unflags` đi kèm `custom` (vd rời con đường) | `fixes-1018` F1a, F1b |
| 2 | Bấm một lựa chọn làm nhân vật chết thì bàn chơi đứng hình | Vòng lặp thấy `!L.alive` là gọi `endSoon(L)`, bất kể đường chết nào | `ui-fixes-1018` U2 |
| 3 | Timer màn kết của đời cũ bắn vào đời mới, lưu đời đang sống vào lịch sử | `endSoon` chỉ chạy nếu `G.life===L`; `intro()`/`birth()` hủy timer | U3 |
| 4 | Đồng hồ "không kịp nghĩ" chạy khi tạm dừng | Đồng hồ đứng khi tạm dừng, khi AI đang viết, khi mở thẻ kết quả hay hộp thoại thoát | U4 |
| 5 | Tạm dừng đúng lúc có chuyện đến hẹn: ô "Tôi muốn" khóa, khung trống | Chuyện đến hẹn vẫn được tải khi tạm dừng (tải cảnh không làm thời gian trôi), trừ khi đang mở hộp thoại thoát | U5; `ui-agency-test` hết chập chờn |
| 6 | AI trả `"toString"`, `"constructor"`, `"__proto__"` lọt bộ lọc, host crash giữa chừng | `Agency.ts` dùng `Object.hasOwn`; host kiểm tra lại; `agencyAct` bắt lỗi và báo cho người chơi | F6, F6b |
| 7 | Câu gõ chọn được nút đang ẩn hoặc khóa | `typedChoiceIndex`: chỉ nhận `chon` của nút đang hiện, không thì nút mặc định | F7 |

`actLog` giờ lưu chỉ số nút đã tính (`chon`) cho cả thẻ storylet, để tua lại đời ra đúng kết quả.

## Quyết định

- Thẻ storylet trả lời bằng chữ: AI viết phần kể và hiệu ứng, thẻ giữ phần sổ sách của nút mặc định. Không để AI chọn nút cho thẻ storylet, vì nút đó có thể kéo theo việc lớn (rời nghề, bước vào con đường) mà câu gõ không hề nói tới.
- Tạm dừng nghĩa là thời gian không trôi, không phải game không được chuẩn bị cảnh tiếp theo.

## Còn để sau (từ review, chưa sửa)

- Các chặng chuyện dở không bị trần tăng theo năm (`applyStoryChoice`).
- Gọi AI kể chuyện không có timeout; tắt AI vẫn gọi AI cho chuyện dở.
- localStorage hỏng làm trắng trang; chưa có số phiên bản.
- Cân bằng: tăng ca không bao giờ bị phạt kiệt sức (1.3 < ngưỡng 1.4); mạng đồn đại tắt dần; thẩm định thành công bị phạt uy tín.
- Người chết vẫn tống tiền được (hook không lọc NPC đã mất).
- Bộ lọc dưới 12 tuổi còn cho qua `bi_mat` và cờ người lớn.
- Khối `<script id="engine">` và khối giao diện cuối chỉ nằm trong `index.html`; nên tách ra file nguồn.
