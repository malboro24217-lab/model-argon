# Kiểm toán thay đổi tình thế của 105 mùa

Task 20d, 19/10/2026. Chuẩn là ruling R25 của Tùng. Bảng ở cuối file do `argon/tools/season-change-audit.js` sinh ra; phần chữ ở trên viết tay.

## 1. Chuẩn (R25)
- Spec cũ đòi "đổi 100% hoàn cảnh". R25 thay câu đó bằng:
  > Mỗi Mùa có ít nhất một thay đổi tình thế có tác dụng thật, phù hợp với tiền đề và được sử dụng trong diễn biến.
- Thay đổi hợp lệ: việc làm, nơi ở, tiền hay nợ, một mối quan hệ, một nghĩa vụ, quyền tiếp cận (được hay mất một thứ), hoặc một luật riêng của mùa.
- Không có luật "đổi 2 trong 4 thứ". Host không được tự đổi nghề hay tiền khi nội dung không khai báo.
- Cờ chỉ tính khi có tình huống hay luật về sau đọc nó và dùng nó.

## 2. Ba lớp
- **(a) đạt:** mùa khai báo một thay đổi tình thế chắc chắn xảy ra lúc vào mùa, và có thứ dùng nó (thẻ đọc lại, hay host áp mỗi năm).
- **(b) chỉ bằng lời kể:** thay đổi chỉ có trong chữ. Trạng thái của host không đổi, nhưng chữ cũng không khẳng định điều gì trái với trạng thái.
- **(c) mâu thuẫn với trạng thái:** chữ khẳng định một thay đổi (có việc, hết nợ, bị trừ tiền…) mà trạng thái của host nói khác.

### Được tính là thay đổi (script dò)
- `reset.cash`; `reset.effects`: tiền, vay hay trả nợ, đổi việc, chuyển đi, hôn nhân, thời gian hay thân thể (`age_skip`, `longevity`).
- Luật mùa:
  - `rules.income` ≤ 0.8 hay ≥ 1.2, cùng ngưỡng với `isDurable`; host chỉ nhân lương (R24);
  - `rules.yearly` có tiền, nợ hay custom; host áp mỗi năm trong mùa (`seasonYearly`).
- Thẻ mở màn không có `when` mà **mọi** lựa chọn đều mang một thay đổi tình thế, vd. hai ca trực của S07 đều `job_switch`.

### Không tính
- Dàn nhân vật mới: mùa nào cũng có.
- Cờ thế giới `rules.flags`: không file nào đọc chúng.
- Luật chỉ đổi chỉ số (`happy`, `know`, `rel`).
- Hệ số thu nhập nhỏ (0.8 < k < 1.2).
- Lựa chọn tùy người chơi ở thẻ mở màn (ghi ở cột ghi chú là "chỉ tùy lựa chọn").
- Chung kết.

### Ai dùng thay đổi
- Script dựng mọi thẻ của mùa dưới 56 bối cảnh fuzz và ba chế độ cờ (không cờ, đủ cờ của mùa, một nửa).
- `FactContext` được bọc Proxy, nên mọi trường, cờ, bộ đếm mà `when` hay chữ của thẻ đọc đều được ghi lại.
- Tiền, nợ, việc thì kinh tế host đọc mỗi năm; luật mùa thì host áp mỗi năm.
- Cột "Ai dùng" ghi thêm những thẻ đọc lại trường tương ứng (`savings`, `debt`, `has_job`, `k.noi`…).

### Phần đọc tay
- Mâu thuẫn (lớp c) không dò máy được. Mỗi mâu thuẫn tìm thấy được ghi vào `CONTRADICTIONS` trong script, kèm một hàm dò. Chạy trên bản cũ thì mục đó hiện "mâu thuẫn", chạy trên bản đã sửa thì không.
- Phạm vi đã đọc:
  - thẻ mở màn và biến cố mở mùa (`trigger`) của cả 105 mùa;
  - toàn bộ thẻ của 13 mùa trong bản demo;
  - mọi mùa có tiền đề ghi ở `PREMISE` của bộ kiểm quy tắc 9 (Task 20a).
- Các nhịp sau của mùa ngoài demo chỉ được soi qua đầu dò quy tắc 9 của 20a (nợ, việc, vợ chồng, nhà, con).
- **Phần "phù hợp tiền đề" và "dùng có ý nghĩa" vượt quá chỗ đó phải đọc và chơi thử.** Bộ kiểm chỉ giữ mức sàn.

## 3. Kết quả

| | Trước (43c6677) | Sau (Task 20d) |
|---|---|---|
| (a) đạt | 31 | 64 |
| (b) chỉ bằng lời kể | 61 | 41 |
| (c) mâu thuẫn với trạng thái | 13 | 0 |

13 mùa của bản demo đều ở lớp (a).

## 4. Mâu thuẫn đã sửa (13)
| Mùa | Chữ khẳng định | Trạng thái trước | Sửa |
|---|---|---|---|
| `tron_chay` Kẻ trốn chạy | Cả mùa trốn nợ: gã đòi nợ áo hoa, món nợ bị bán lại | Người không nợ vào mùa vẫn không nợ | `reset.effects` thêm `borrow:0.5`; `tc_mo_xe` kể tờ giấy vay nóng. `L_VE` đã có `repay:1` |
| `vu_an_gia_toc` Vụ án gia tộc | Bạn được giao giữ căn nhà cũ, thành nghi phạm (`vu_an_gia_toc.ts:41-42` chỉ có dàn mới) | Không gì đổi; hệ số 0.9 gần như không thấy | `rules.yearly` tiền −0.03: người giữ chìa gánh tiền điện nước và thuế đất của căn nhà; `va_mo_chia_khoa`, `va_day_to_cao` nhắc khoản đó |
| `ngoi_sao` Ngôi sao bất đắc dĩ | Thu nhập ×3 và nổi tiếng (`ngoi_sao.ts:27-28` chỉ có dàn mới) | ×3 chỉ nhân lương; người chưa có lương (mùa mở từ 8 tuổi) không đổi gì | `reset.effects` tiền +0.3: tiền bản quyền đoạn clip, ai cũng nhận; `ns_mo_clip` kể khoản đó |
| `lam_lai` Làm lại từ số 0 | "Mọi thứ của đời trước đã mất: tiền, chỗ ở" | Người có nhà riêng vẫn giữ căn nhà | Chữ rẽ theo `home_owner`: căn nhà cũ vẫn đứng tên bạn, nhưng ở lại phía sau |
| `w_S07` Thuộc địa đỏ | Ký hợp đồng lên trạm, "lương gấp ba", nhận ca trực | Nghề trong host vẫn là nghề cũ; người chưa có việc không có lương để nhân ba | `s07_mo_buong`: ca ngoài trời `job_switch:build`, ca nhà kính `job_switch:farm` |
| `w_S33` Người cuối cùng còn là người | Nhánh chỉ mở cho người vừa mất việc, rồi kể "nhận việc, lương gấp ba" | Không có việc nào, ×3 của 0 vẫn là 0 | `s33_mo_phong`: cả hai lựa chọn `job_switch:office` |
| `w_S48` Kẻ buồn hợp pháp | "Mỗi lần buồn bị trừ tiền thẳng vào tài khoản", "tin nhắn trừ tiền đầu tiên tới" | Một lựa chọn không mất đồng nào | `rules.yearly` tiền −0.05: tiền phạt buồn mỗi năm |
| `w_S50` Người không tồn tại | "Hệ thống xóa luôn mọi khoản nợ mang tên bạn" (nhánh chỉ mở khi đang nợ) | Nợ vẫn còn nguyên | `reset.effects` `repay:50`; chung kết sống lại bằng tên cũ ghi lại nợ (`borrow:1`) kèm tiền phạt |
| `w_X07` Gương mặt trên bao bì | "Xin hãng nghỉ một năm không lương" | Hợp đồng khuôn mặt không phải chỗ làm có lương | Nhãn thành "Xin hãng tạm ngưng hợp đồng một năm" |
| `w_X12` Người đã chết hợp pháp | "Để ông ấy khép sổ: Nhẹ nợ hôm nay"; "quyết định thôi việc" | Không trả đồng nợ nào; host vẫn giữ việc (chỉ ×0.3) | Lựa chọn khép sổ thêm `repay:0.5`; chữ thành "lương chỉ trả qua người nhà và bớt gần hết" |
| `w_X25` Vương quốc dưa | "Từ nay lương hưu sẽ trả bằng dưa" | Host vẫn trả đủ bằng tiền | `rules.yearly` tiền −0.05: phần trả bằng dưa bán không kịp thì hỏng; `x25_mo_dem` nói rõ |
| `w_X33` Người nói Không | "Một khoản tiền bằng ba năm thu nhập" | Lựa chọn chỉ cho 0.6 năm | Chữ thành "hơn nửa năm thu nhập" |
| `w_X40` Người của một ngày | "Mình mượn tạm ít tiền", "thiếu đúng số tiền một đôi giày" | Một lựa chọn không mất đồng nào | `rules.yearly` tiền −0.05: mỗi năm người kia tiêu một ít tiền của bạn |

## 5. Mùa trong bản demo
| Mùa | Thay đổi | Ai dùng |
|---|---|---|
| `tron_chay` | `move_city`, `borrow:0.5`, tiền về 0.2, lương ×0.6 | Gã đòi nợ ở mọi nhịp; `L_VE` trả nợ; kinh tế host |
| `vu_an_gia_toc` | Tiền giữ nhà mỗi năm (−0.03) | Host áp mỗi năm; `va_mo_chia_khoa`, `va_day_to_cao` |
| `ngoi_sao` | Tiền bản quyền +0.3; lương ×3 | `ns_mo_clip`; host nhân lương |
| `lam_lai` | Tiền về 0; lương ×0.6 | `ll_mo_trang_tay`, `ll_day_so_khong` đọc nợ |
| `xu_nguoi` | `migrate_now`, tiền về 0.5, lương ×0.8 | Mọi thẻ ở xứ người. Di cư chắc chắn chờ Task 8b (I2) |
| `w_S08` | Ngủ 20 năm (`age_skip:20`, `longevity:20`), xóa nợ (`repay:50`), tiền về 0.3 | `s08_mo_bang_gia`; `age_skip` / `longevity` có tác dụng sau Task 8b |
| `w_X36` | Lương ×0.7 (sống trên thuyền); mở màn cho bỏ việc trên bờ hay tìm việc ban ngày | Host nhân lương; `x36_mo_giuong_dua` |
| `w_S35` | Hố đen nuốt nợ mỗi năm (`repay:0.2`, tiền −0.03) | Host áp mỗi năm; `s35_kd_no` đọc `debt` |
| `w_X14` | Án phí và tiền giữ biệt thự mỗi năm (−0.05) | `x14_mo_biet_thu`, `x14_day_dem` ("án phí đã ăn gần hết tiền tiết kiệm") |
| `w_X47` | Nhuận bút bức thư mỗi năm (+0.05) | `x47_mo_khanh_thanh`; chung kết bán bản quyền bức thư |
| `w_S05` | Con vật đòi một suất ăn như người (−0.05/năm) | `s05_mo_cau_dau`; gag "nó đòi ăn thịt" |
| `w_S47` | Phí tài khoản lưu trữ ký ức mỗi năm (−0.05) | `s47_mo_thu`, `s47_day_can_tien` |
| `w_X33` | Tiền giữ danh hiệu mỗi năm (+0.05); sửa số tiền ở `x33_day_quang_cao` | `x33_mo_bi_ngo` |

## 6. Mùa thêm một khai báo cho đủ mức sàn của bộ kiểm (16)
Trước 20d có 17 mùa không khai báo gì lúc vào mùa: không reset, không luật mùa, không hiệu ứng nào ở thẻ mở màn. Một trong số đó là X47 (bản demo, ở mục 5). 16 mùa còn lại mỗi mùa thêm một luật năm hợp tiền đề, kèm một câu nhắc ở thẻ mở màn:

| Mùa | Luật năm | Câu ở thẻ mở màn |
|---|---|---|
| S03 Sửa tương lai cho con | −0.03 | Lời dặn số một: cho con học bơi, học phí đóng theo năm |
| S04 Năm được chọn lại | −0.03 | Chiếc đồng hồ thu phí mỗi năm |
| S12 Người đưa thư giữa hai năm | −0.03 | Vé năm qua cánh cửa |
| S18 Chủ trọ liên sao | +0.03 | Tiền phòng trả bằng đá biết hát, tiệm vàng mua lại |
| S22 Đổi chỗ | −0.03 | Bản kia tiêu tiền bằng thẻ của bạn |
| S28 Ngày thứ 300 | lương ×0.7 | Lương về thứ Sáu, kẹt trong thứ Tư |
| S32 Cả xóm chung giấc mơ | −0.03 | Phí duy trì trạm tín hiệu |
| S43 Mèo đòi quyền lợi | −0.03 | Hai bữa cá tươi mỗi tuần |
| S46 Nuôi đứa trẻ từ sao khác | −0.05 | Thêm một miệng ăn không giấy tờ |
| X02 Gia tộc mèo | −0.03 | Phí "giữ sổ" hằng năm |
| X17 Con phố mang tên tôi | −0.03 | Đóng quỹ khu phố gấp đôi |
| X20 Hôn nhân giấy tờ | −0.03 | Lệ phí giữ hồ sơ hủy |
| X29 Lời hứa tuổi thơ | −0.03 | Quỹ họp lớp, hai người đóng gấp đôi |
| X38 Ngoại giao sân trường | −0.03 | Quà ngoại giao: một túi kẹo mỗi năm |
| X43 Cuộc chiến giấy khai sinh | −0.03 | Lệ phí làm lại giấy tờ của con |
| X50 Lễ tưởng niệm người còn sống | −0.03 | Đóng góp cho chính lễ tưởng niệm của mình |

Những mùa này giờ ở lớp (a) theo máy. Chúng là thay đổi nhỏ (khoảng 0.15–0.3 năm thu nhập cả mùa), nên cần chơi thử xem có đủ "thấy được" không.

## 7. Bộ kiểm (`argon/src/canon-content-test.ts`, khối R25)
1. Mỗi mùa khai báo ít nhất một thay đổi lúc vào mùa: `reset.cash`, `reset.effects`, `rules.income ≠ 1`, `rules.yearly`, hay một lựa chọn ở thẻ mở màn có hiệu ứng trạng thái. Đây là **mức sàn**, lỏng hơn lớp (a): mùa ở lớp (b) vẫn qua nhờ một khoản tiền tùy lựa chọn hay một hệ số nhỏ.
2. Cờ hay bộ đếm đặt ở `reset.effects` phải được một thẻ của mùa đọc.
3. Cờ hay bộ đếm do lựa chọn ở nhịp 0–3 đặt mà không thẻ nào cùng hay sau nhịp đó đọc, và không file nào khác nhắc tới:
   - lúc này có **1352** khóa như vậy trên 105 mùa;
   - viết lại toàn bộ để mọi cờ đều được đọc là việc của một đợt viết lại, không thuộc 20d;
   - bộ kiểm chặn trần `DEAD_KEYS_MAX = 1352`, chỉ được giảm.
4. Chung kết:
   - landing `migrate_now` chỉ mở khi `migrateOk(c)` (tự lập và còn nước để đi). Đã sửa 11 mùa: S07, S15, S18, S34, S38, S40, S45, S48, X15, X24, X34; mùa nào thiếu lựa chọn thì có thêm một landing ở lại;
   - landing `move_city` không mở cho người dưới 18 tuổi. Chỉ `vu_an_gia_toc` chơi tới chung kết được trước 18 tuổi (vào từ 8 tuổi, mùa ngắn nhất 8 năm), và ở đó `ra_rieng` được thay bằng `gui_so_tiet_kiem`.
- Đã thử phá từng luật (bỏ luật năm của S03, bỏ cổng di cư của S07, cho trẻ 16 tuổi ra riêng): bộ kiểm báo đủ 9 lỗi, rồi khôi phục.

## 8. Host
- `doi-nguoi/canon.js` `enterSeason` **không** tự đổi nghề hay tiền:
  - tiền chỉ đổi qua `reset.cash` (chỉ người đã tự lập, tính trên tiền riêng) và `reset.effects`;
  - `canonOwnOnly` bỏ việc, chuyển đi, vay, trả nợ khỏi `reset` của người chưa tự lập (R15);
  - thu nhập chỉ nhân hệ số `rules.income` khai báo, khi đang có thu nhập.
- Task 20d không sửa host.
- `doi-nguoi/tests/season-entry-test.js` (mới) cho mỗi mùa trong 105 mùa một đời tự lập có việc, gọi `enterSeason`, rồi kiểm:
  - nghề không đổi khi `reset` không khai báo việc;
  - tiền không đổi khi `reset` không khai báo tiền hay nợ;
  - thu nhập chỉ nhân đúng `rules.income`.

## 9. Còn lại
- **41 mùa ở lớp (b).** Chúng có cảnh, chữ và chung kết đầy đủ, nhưng không có thay đổi tình thế chắc chắn lúc vào mùa. Theo R25, chúng được nâng dần khi viết lại hay khi chơi thử thấy nhạt, không viết lại hàng loạt cho đủ chỉ tiêu. Cột ghi chú trong bảng nói mùa nào có thay đổi tùy lựa chọn, hay hệ số nhỏ có thể nâng lên.
- **Phụ thuộc Task 8b:**
  - `age_skip`, `longevity` (S06, S08) hiện là no-op;
  - di cư đầu mùa `xu_nguoi` chưa chắc chắn (I2);
  - R24: hệ số mùa chỉ nhân lương.
- **Luật năm và người chưa tự lập.** Luật năm có tiền đi qua `canonOwnOnly`: với người chưa tự lập, tiền vào hay ra từ tiền riêng, khoản trừ chỉ trừ tới hết tiền riêng. Ở `vu_an_gia_toc` (mở từ 8 tuổi), chữ nói rõ khoản giữ nhà "trích từ tiền để dành của bạn".
- **Hệ số nhỏ.** 16 mùa có hệ số 0.85–1.1 (11 trong số đó còn ở lớp b). Có thể nâng lên ngưỡng 0.8 / 1.2 nếu muốn chúng thành thay đổi thật; 20d không đổi để khỏi lệch cân bằng tiền của Task 20.

## 10. Chạy lại
```sh
node --experimental-strip-types argon/tools/season-change-audit.js                                        # tóm tắt
node --experimental-strip-types argon/tools/season-change-audit.js --md argon/docs/canon/season-change-audit.md   # cập nhật bảng dưới đây
node --experimental-strip-types argon/tools/season-change-audit.js --root <bản repo khác>                  # vd. bản trước khi sửa
```

## 11. Bảng 105 mùa
Mùa in đậm là mùa của bản demo. Cột "Thay đổi khai báo" chỉ ghi những gì được tính (mục 2). Cột ghi chú có "Đã sửa (20d)" cho mâu thuẫn đã sửa, "Thêm ở 20d" cho thay đổi mới thêm, "Không tính" cho những gì có mà không đủ, và số cờ / bộ đếm do lựa chọn đặt mà không thẻ nào đọc lại (script đếm bằng bối cảnh riêng của nó, nên tổng có thể lệch vài khóa so với con số của bộ kiểm).

<!-- bảng sinh bằng argon/tools/season-change-audit.js: bắt đầu -->
Đạt 64 · chỉ bằng lời kể 41 · mâu thuẫn 0 (tổng 105).

| Mùa | Lớp | Thay đổi khai báo (nguồn) | Ai dùng | Ghi chú |
|---|---|---|---|---|
| **tron_chay** Kẻ trốn chạy<br>`seasons/tron_chay.ts:19` | a (đạt) | tiền: tiền riêng về 0.2× thu nhập (reset.cash)<br>nơi ở: move_city (reset.effects)<br>nợ: borrow:0.5 (reset.effects)<br>luật mùa: thu nhập từ lương ×0.6 (rules.income) | kinh tế host đọc tiền mỗi năm<br>host đổi nơi ở / nước (k.noi, thu nhập); thẻ đọc lại: tc_mo_xe<br>kinh tế host tính nợ mỗi năm (repay/vỡ nợ); thẻ đọc lại: tc_ket_nga_ba, tc_ket_ten_that<br>host áp mỗi năm trong mùa | Đã sửa (20d): reset.effects thêm borrow:0.5; thẻ mở màn kể tờ giấy vay nóng.<br>Cờ/bộ đếm không thẻ nào đọc lại: 18 |
| **vu_an_gia_toc** Vụ án gia tộc<br>`seasons/vu_an_gia_toc.ts:49` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: va_ket_toa, va_ket_hoa_giay | Đã sửa (20d): rules.yearly money −0.03: người giữ chìa gánh tiền giữ nhà; thẻ va_mo_chia_khoa và va_day_to_cao nhắc khoản đó.<br>Cờ/bộ đếm không thẻ nào đọc lại: 17 |
| **ngoi_sao** Ngôi sao bất đắc dĩ<br>`seasons/ngoi_sao.ts:28` | a (đạt) | tiền: tiền +0.3 năm thu nhập (reset.effects)<br>luật mùa: thu nhập từ lương ×3 (rules.income) | kinh tế host đọc tiền mỗi năm; thẻ đọc lại: ns_ket_dem_dien, ns_ket_tang_choi<br>host áp mỗi năm trong mùa; thẻ đọc lại: ns_mo_clip | Đã sửa (20d): reset.effects money +0.3 (tiền bản quyền đoạn clip, ai cũng nhận); ns_mo_clip kể khoản đó.<br>Cờ/bộ đếm không thẻ nào đọc lại: 24 |
| **lam_lai** Làm lại từ số 0<br>`seasons/lam_lai.ts:20` | a (đạt) | tiền: tiền riêng về 0× thu nhập (reset.cash)<br>luật mùa: thu nhập từ lương ×0.6 (rules.income) | kinh tế host đọc tiền mỗi năm; thẻ đọc lại: ll_day_so_khong, ll_ket_tam_bien, ll_ket_chiec_cuoi<br>host áp mỗi năm trong mùa | Đã sửa (20d): Chữ rẽ theo home_owner: căn nhà cũ vẫn đứng tên bạn, nhưng ở lại phía sau.<br>Cờ/bộ đếm không thẻ nào đọc lại: 25 |
| **xu_nguoi** Làm lại ở xứ người<br>`seasons/xu_nguoi.ts:32` | a (đạt) | tiền: tiền riêng về 0.5× thu nhập (reset.cash)<br>nơi ở: migrate_now (reset.effects)<br>luật mùa: thu nhập từ lương ×0.8 (rules.income) | kinh tế host đọc tiền mỗi năm; thẻ đọc lại: xn_ket_bien_quan, xn_ket_chuyen_bay<br>host đổi nơi ở / nước (k.noi, thu nhập)<br>host áp mỗi năm trong mùa | migrate_now đầu mùa phụ thuộc Task 8b (di cư tất định, I2); cửa vào mùa đã gate can_migrate (R14).<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S01 Người liên lạc với quỹ đạo<br>`weird/sf_01.ts:38` | b (chỉ bằng lời kể) | — | — | Không tính: luật năm chỉ đổi chỉ số (know); cờ thế giới w_orbit_contact (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S02 Hai người một tên<br>`weird/sf_01.ts:116` | a (đạt) | luật mùa: thu nhập từ lương ×0.5 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S03 Sửa tương lai cho con<br>`weird/sf_01.ts:192` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s03_ket_nga_re | Thêm ở 20d: luật năm −0.03: học phí theo lời dặn của thư (s03_mo_doc_trom)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S04 Năm được chọn lại<br>`weird/sf_01.ts:263` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s04_ket_tua_cuoi | Thêm ở 20d: luật năm −0.03: phí của chiếc đồng hồ (s04_mo_thu)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| **w_S05** Thú nói được<br>`weird/sf_01.ts:336` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s05_ket_phat_bieu | Thêm ở 20d: luật năm −0.05: con vật đòi một suất ăn như người (s05_mo_cau_dau)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S06 Người trở về<br>`weird/sf_01.ts:411` | a (đạt) | luật mùa: age_skip:3 (reset.effects) | host áp mỗi năm trong mùa; thẻ đọc lại: s06_ket_ba_nam | age_skip:3 là no-op cho tới Task 8b.<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S07 Thuộc địa đỏ<br>`weird/sf_01.ts:487` | a (đạt) | luật mùa: thu nhập từ lương ×3 (rules.income)<br>việc: job_switch:farm (mở màn s07_mo_buong (mọi lựa chọn)) | host áp mỗi năm trong mùa<br>host trả lương theo nghề mỗi năm | Đã sửa (20d): s07_mo_buong: ca ngoài trời job_switch:build, ca nhà kính job_switch:farm (cả hai lựa chọn).<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| **w_S08** Người từ quá khứ<br>`weird/sf_01.ts:561` | a (đạt) | tiền: tiền riêng về 0.3× thu nhập (reset.cash)<br>luật mùa: age_skip:20 (reset.effects)<br>luật mùa: longevity:20 (reset.effects)<br>nợ: repay:50 (reset.effects) | kinh tế host đọc tiền mỗi năm<br>host áp mỗi năm trong mùa; thẻ đọc lại: s08_ket_so_khong<br>kinh tế host tính nợ mỗi năm (repay/vỡ nợ); thẻ đọc lại: s08_ket_so_khong | age_skip:20 / longevity:20 là no-op cho tới Task 8b; repay:50 và tiền 0.3 có tác dụng ngay.<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_S09 Vụ kiện với cái máy<br>`weird/sf_01.ts:639` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_kien_may (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_S10 Sống bằng ký ức người lạ<br>`weird/sf_01.ts:712` | a (đạt) | tiền: tiền +1 năm thu nhập (reset.effects) | kinh tế host đọc tiền mỗi năm; thẻ đọc lại: s10_mo_sang_la | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S11 Chủ mỏ ngoài trời<br>`weird/sf_11.ts:65` | a (đạt) | luật mùa: thu nhập từ lương ×1.5 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_S12 Người đưa thư giữa hai năm<br>`weird/sf_11.ts:160` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s12_ket | Thêm ở 20d: luật năm −0.03: vé năm qua cánh cửa (s12_mo_thu)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S13 Người giữ tiếng<br>`weird/sf_11.ts:258` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×1.1 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_last_speaker (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S14 Chiến dịch bốn chân<br>`weird/sf_11.ts:355` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: s14_mo_quy: tiền −0.3 năm thu nhập<br>Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_pet_candidate (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S15 Sống trong vòm<br>`weird/sf_11.ts:451` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.85 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_dome (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S16 Người bạn bằng thép<br>`weird/sf_11.ts:547` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_robot_friend (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S17 Địa chủ mặt trăng<br>`weird/sf_11.ts:644` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: s17_mo_khung: tiền +0.6 năm thu nhập; s17_mo_moi_gioi: tiền +0.4 năm thu nhập<br>Không tính: cờ thế giới w_moon_land (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S18 Chủ trọ liên sao<br>`weird/sf_11.ts:731` | a (đạt) | luật mùa: mỗi năm: tiền +0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s18_ket | Thêm ở 20d: luật năm +0.03: tiền phòng bằng đá biết hát (s18_mo_hop_dong)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S19 Sống trong máy<br>`weird/sf_11.ts:825` | a (đạt) | luật mùa: thu nhập từ lương ×0.5 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S20 Người phát sáng<br>`weird/sf_11.ts:917` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_glowing (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S21 Nghe lời mình tương lai<br>`weird/sf_21.ts:24` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_future_call (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S22 Đổi chỗ<br>`weird/sf_21.ts:91` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s22_mo_so, s22_day_met, s22_ket | Thêm ở 20d: luật năm −0.03: bản kia tiêu bằng thẻ của bạn (s22_mo_guong)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_S23 Người phiên dịch thực vật<br>`weird/sf_21.ts:163` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_talking_plants (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S24 Đặc vụ bất đắc dĩ<br>`weird/sf_21.ts:241` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S25 Thợ lặn bí ẩn<br>`weird/sf_21.ts:314` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S26 Người không chịu già<br>`weird/sf_21.ts:384` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: s26_mo_vien: tiền −0.3 năm thu nhập<br>Không tính: cờ thế giới w_longevity_trial (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S27 Người biết trước<br>`weird/sf_21.ts:454` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_death_app (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S28 Ngày thứ 300<br>`weird/sf_21.ts:535` | a (đạt) | luật mùa: thu nhập từ lương ×0.7 (rules.income) | host áp mỗi năm trong mùa; thẻ đọc lại: s28_mo_bon_muoi, s28_ket | Thêm ở 20d: lương ×0.7: lương về thứ Sáu, kẹt trong thứ Tư (s28_mo_bon_muoi)<br>Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S29 Nhà bay<br>`weird/sf_21.ts:615` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_half_gravity (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S30 Thế giới nói thật<br>`weird/sf_21.ts:685` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_no_lies (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S31 Người không sao<br>`weird/sf_31.ts:37` | a (đạt) | luật mùa: thu nhập từ lương ×0.4 (rules.income) | host áp mỗi năm trong mùa; thẻ đọc lại: s31_mo_khoa | Cờ/bộ đếm không thẻ nào đọc lại: 16 |
| w_S32 Cả xóm chung giấc mơ<br>`weird/sf_31.ts:120` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s32_ket | Thêm ở 20d: luật năm −0.03: phí duy trì trạm tín hiệu (s32_mo_sang)<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_S33 Người cuối cùng còn là người<br>`weird/sf_31.ts:191` | a (đạt) | luật mùa: thu nhập từ lương ×3 (rules.income)<br>việc: job_switch:office (mở màn s33_mo_phong (mọi lựa chọn)) | host áp mỗi năm trong mùa<br>host trả lương theo nghề mỗi năm | Đã sửa (20d): s33_mo_phong: cả hai lựa chọn job_switch:office.<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_S34 Nhà có thần đồng<br>`weird/sf_31.ts:261` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_prodigy (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 17 |
| **w_S35** Người giữ hố đen<br>`weird/sf_31.ts:330` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập, repay:0.2 (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s35_kd_no, s35_kd_lon, s35_day_kiem_tra… | Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_S36 Nuôi quái thú<br>`weird/sf_31.ts:407` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income)<br>luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa<br>host áp mỗi năm trong mùa; thẻ đọc lại: s36_ket | Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S37 Sống trong thân người kia<br>`weird/sf_31.ts:478` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_body_swap (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S38 Công dân biển<br>`weird/sf_31.ts:553` | a (đạt) | luật mùa: thu nhập từ lương ×1.3 (rules.income)<br>luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa<br>host áp mỗi năm trong mùa; thẻ đọc lại: s38_ket | Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_S39 Ông chủ của chính mình<br>`weird/sf_31.ts:623` | a (đạt) | luật mùa: thu nhập từ lương ×50 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_S40 Ai đã sống tuổi thơ của tôi<br>`weird/sf_31.ts:690` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_implanted_childhood (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_S41 Nhà ở hai nơi<br>`weird/sf_41.ts:29` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_nha_hai_noi (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S42 Người bán mưa<br>`weird/sf_41.ts:108` | a (đạt) | luật mùa: thu nhập từ lương ×1.3 (rules.income)<br>nợ: borrow:0.5 (mở màn s42_mo_nut (mọi lựa chọn))<br>tiền: tiền −0.3 năm thu nhập (mở màn s42_mo_nut (mọi lựa chọn)) | host áp mỗi năm trong mùa<br>kinh tế host tính nợ mỗi năm (repay/vỡ nợ); thẻ đọc lại: s42_ket<br>kinh tế host đọc tiền mỗi năm; thẻ đọc lại: s42_ket | Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S43 Mèo đòi quyền lợi<br>`weird/sf_41.ts:180` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s43_ket | Thêm ở 20d: luật năm −0.03: hai bữa cá tươi mỗi tuần (s43_mo_vong)<br>Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S44 Thành phố ngủ<br>`weird/sf_41.ts:249` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_thanh_pho_ngu (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_S45 Ứng viên một chiều<br>`weird/sf_41.ts:322` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_S46 Nuôi đứa trẻ từ sao khác<br>`weird/sf_41.ts:392` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s46_ket | Thêm ở 20d: luật năm −0.05: thêm một miệng ăn (s46_mo_bep)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| **w_S47** Chuộc ký ức nhà mình<br>`weird/sf_41.ts:459` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s47_ket | Thêm ở 20d: luật năm −0.05: phí tài khoản lưu trữ ký ức (s47_mo_thu)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_S48 Kẻ buồn hợp pháp<br>`weird/sf_41.ts:533` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: s48_ket | Đã sửa (20d): rules.yearly money −0.05: tiền phạt buồn mỗi năm.<br>Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_S49 Người thấy giá<br>`weird/sf_41.ts:605` | a (đạt) | luật mùa: thu nhập từ lương ×1.6 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 8 |
| w_S50 Người không tồn tại<br>`weird/sf_41.ts:676` | a (đạt) | nợ: repay:50 (reset.effects)<br>luật mùa: thu nhập từ lương ×0.6 (rules.income) | kinh tế host tính nợ mỗi năm (repay/vỡ nợ); thẻ đọc lại: s50_ket<br>host áp mỗi năm trong mùa; thẻ đọc lại: s50_mo_cong_ty, s50_ket | Đã sửa (20d): reset.effects repay:50 (sổ nợ trắng tinh).<br>Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_X01 Nhiệm kỳ của trâu<br>`weird/abs_01.ts:44` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_x01_nhiem_ky_trau (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X02 Gia tộc mèo<br>`weird/abs_01.ts:109` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x02_ket | Thêm ở 20d: luật năm −0.03: phí giữ sổ (x02_mo_so)<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_X03 Lễ hội mang tên mình<br>`weird/abs_01.ts:170` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x03_ket | Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X04 Quốc vương 30 m²<br>`weird/abs_01.ts:234` | b (chỉ bằng lời kể) | — | — | Thừa kế 30 m² đất chỉ bằng lời kể (host không cho tài sản miễn phí).<br>Không tính: cờ thế giới w_x04_quoc_vuong (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X05 Cuộc săn của ông<br>`weird/abs_01.ts:294` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_x05_cuoc_san (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X06 Cha đẻ khẩu hiệu<br>`weird/abs_01.ts:356` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: x06_mo_ban_quyen: tiền +0.5 năm thu nhập<br>Không tính: cờ thế giới w_x06_khau_hieu (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_X07 Gương mặt trên bao bì<br>`weird/abs_01.ts:419` | a (đạt) | luật mùa: thu nhập từ lương ×1.2 (rules.income)<br>tiền: tiền +0.8 năm thu nhập (mở màn x07_mo_ky (mọi lựa chọn))<br>tiền: tiền +0.5 năm thu nhập (mở màn x07_mo_ky (mọi lựa chọn)) | host áp mỗi năm trong mùa<br>kinh tế host đọc tiền mỗi năm | Đã sửa (20d): Nhãn đổi thành "Xin hãng tạm ngưng hợp đồng một năm".<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X08 Cụ tổ 30 tuổi<br>`weird/abs_01.ts:483` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_x08_cu_to (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 16 |
| w_X09 Gà tiên tri<br>`weird/abs_01.ts:548` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: x09_mo_qua_trung: tiền +0.5 năm thu nhập<br>Không tính: cờ thế giới w_x09_ga_tien_tri (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 16 |
| w_X10 Vua món cháy<br>`weird/abs_01.ts:614` | a (đạt) | luật mùa: thu nhập từ lương ×1.2 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_X11 Vận động viên môn bí ẩn<br>`weird/abs_11.ts:122` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_mon_bi_an (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X12 Người đã chết hợp pháp<br>`weird/abs_11.ts:181` | a (đạt) | luật mùa: thu nhập từ lương ×0.3 (rules.income) | host áp mỗi năm trong mùa; thẻ đọc lại: x12_kd_tai_khoan | Đã sửa (20d): Lựa chọn khép sổ thêm repay:0.5; chữ về chỗ làm đổi thành "lương chỉ còn trả qua người nhà, bớt gần hết".<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X13 Bảo tàng sống<br>`weird/abs_11.ts:237` | a (đạt) | luật mùa: thu nhập từ lương ×1.2 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| **w_X14** Người thừa kế bốc thăm<br>`weird/abs_11.ts:291` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x14_ket | Thêm ở 20d: luật năm −0.05: tiền giữ biệt thự và án phí (x14_mo_biet_thu)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X15 Kiện hàng biết đi<br>`weird/abs_11.ts:345` | a (đạt) | luật mùa: thu nhập từ lương ×0.4 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_X16 Phát ngôn viên của chó<br>`weird/abs_11.ts:404` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_phat_ngon_cho (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X17 Con phố mang tên tôi<br>`weird/abs_11.ts:463` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x17_ket | Thêm ở 20d: luật năm −0.03: quỹ khu phố gấp đôi (x17_mo_quy_tac)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X18 Nhà côn trùng học bất đắc dĩ<br>`weird/abs_11.ts:520` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_con_trung_hoc (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X19 Đầu bếp giả mạo<br>`weird/abs_11.ts:578` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_dau_bep_gia (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X20 Hôn nhân giấy tờ<br>`weird/abs_11.ts:635` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x20_ket | Thêm ở 20d: luật năm −0.03: lệ phí giữ hồ sơ hủy (x20_mo_chung_nha)<br>Hôn nhân trên giấy chờ hủy: host không có trạng thái này; cố ý không đặt married để chung kết cưới thật vẫn đúng.<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X21 Vụ án cây cau<br>`weird/abs_21.ts:56` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x21_ket | Cờ/bộ đếm không thẻ nào đọc lại: 16 |
| w_X22 Cụ già 35 tuổi<br>`weird/abs_21.ts:142` | a (đạt) | luật mùa: thu nhập từ lương ×0.7 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_X23 Lãnh tụ giấc ngủ<br>`weird/abs_21.ts:217` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: x23_mo_sep: job_lose<br>Không tính: thu nhập ×0.85 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_phong_trao_ngu_trua (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 17 |
| w_X24 Chúa đảo dê<br>`weird/abs_21.ts:291` | a (đạt) | luật mùa: thu nhập từ lương ×0.6 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X25 Vương quốc dưa<br>`weird/abs_21.ts:359` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x25_ket | Đã sửa (20d): rules.yearly money −0.05: phần lương hưu về bằng dưa, bán không kịp thì hỏng.<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_X26 Người giữ luật chơi<br>`weird/abs_21.ts:435` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_nguoi_giu_luat (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_X27 Ca sĩ một bài<br>`weird/abs_21.ts:508` | a (đạt) | luật mùa: thu nhập từ lương ×1.2 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_X28 Chiến tranh bí ngô<br>`weird/abs_21.ts:591` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_chien_tranh_bi_ngo (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X29 Lời hứa tuổi thơ<br>`weird/abs_21.ts:673` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x29_ket | Thêm ở 20d: luật năm −0.03: quỹ họp lớp (x29_mo_san_truong)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X30 Kẻ thù lông vũ<br>`weird/abs_21.ts:745` | b (chỉ bằng lời kể) | — | — | Không tính: luật năm chỉ đổi chỉ số (happy); cờ thế giới w_ke_thu_long_vu (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_X31 Cầu thủ ba con lợn<br>`weird/abs_31.ts:50` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 10 |
| w_X32 Cuộc đua chiều cao<br>`weird/abs_31.ts:122` | b (chỉ bằng lời kể) | — | — | Chỉ tùy lựa chọn: x32_mo_tang_lung: borrow:0.5<br>Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_dua_chieu_cao (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 8 |
| **w_X33** Người nói Không<br>`weird/abs_31.ts:197` | a (đạt) | luật mùa: mỗi năm: tiền +0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x33_ket | Đã sửa (20d): Chữ đổi thành "hơn nửa năm thu nhập".<br>Thêm ở 20d: luật năm +0.05: tiền giữ danh hiệu (x33_mo_bi_ngo)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X34 Nhà thiết kế áo mưa<br>`weird/abs_31.ts:273` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×0.9 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_ao_mua_rach (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
| w_X35 Sống trên sóng<br>`weird/abs_31.ts:358` | a (đạt) | luật mùa: thu nhập từ lương ×1.3 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| **w_X36** Thuyền trưởng karaoke<br>`weird/abs_31.ts:436` | a (đạt) | luật mùa: thu nhập từ lương ×0.7 (rules.income) | host áp mỗi năm trong mùa; thẻ đọc lại: x36_mo_giuong_dua, x36_day_me_mat_giong | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X37 Trả nợ bằng bánh<br>`weird/abs_31.ts:512` | a (đạt) | luật mùa: thu nhập từ lương ×0.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X38 Ngoại giao sân trường<br>`weird/abs_31.ts:584` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x38_ket | Thêm ở 20d: luật năm −0.03: quà ngoại giao (x38_mo_quoc_thu)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X39 Mối thù với quạ<br>`weird/abs_31.ts:656` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_thu_qua (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X40 Người của một ngày<br>`weird/abs_31.ts:727` | a (đạt) | luật mùa: mỗi năm: tiền −0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x40_ket | Đã sửa (20d): rules.yearly money −0.05: mỗi năm người kia tiêu một ít tiền của bạn.<br>Cờ/bộ đếm không thẻ nào đọc lại: 15 |
| w_X41 Giám đốc ngồi nhầm<br>`weird/abs_41.ts:64` | a (đạt) | luật mùa: thu nhập từ lương ×1.8 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X42 Ông bầu tang lễ<br>`weird/abs_41.ts:146` | b (chỉ bằng lời kể) | — | — | Không tính: thu nhập ×1.1 (nhỏ hơn ngưỡng 0.8/1.2); cờ thế giới w_funeral_impresario (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X43 Cuộc chiến giấy khai sinh<br>`weird/abs_41.ts:229` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x43_ket | Thêm ở 20d: luật năm −0.03: lệ phí giấy tờ của con (x43_mo_dung_hinh)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X44 Ngọn đèn duy nhất<br>`weird/abs_41.ts:312` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_last_light (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X45 Nhân chứng voi<br>`weird/abs_41.ts:397` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_elephant_witness (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 11 |
| w_X46 Phụ huynh cho thuê<br>`weird/abs_41.ts:476` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_parent_for_rent (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| **w_X47** Tượng đài ngượng<br>`weird/abs_41.ts:556` | a (đạt) | luật mùa: mỗi năm: tiền +0.05 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x47_ket | Thêm ở 20d: luật năm +0.05: nhuận bút bức thư (x47_mo_khanh_thanh)<br>Cờ/bộ đếm không thẻ nào đọc lại: 12 |
| w_X48 Cuộc chiến một đồng<br>`weird/abs_41.ts:639` | b (chỉ bằng lời kể) | — | — | Không tính: cờ thế giới w_one_coin_war (không ai đọc)<br>Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X49 Triệu phú thời gian<br>`weird/abs_41.ts:720` | a (đạt) | luật mùa: thu nhập từ lương ×0.4 (rules.income) | host áp mỗi năm trong mùa | Cờ/bộ đếm không thẻ nào đọc lại: 13 |
| w_X50 Lễ tưởng niệm người còn sống<br>`weird/abs_41.ts:803` | a (đạt) | luật mùa: mỗi năm: tiền −0.03 năm thu nhập (rules.yearly) | host áp mỗi năm trong mùa; thẻ đọc lại: x50_ket | Thêm ở 20d: luật năm −0.03: đóng góp cho lễ tưởng niệm của chính mình (x50_mo_khe_cua)<br>Cờ/bộ đếm không thẻ nào đọc lại: 14 |
<!-- bảng sinh bằng argon/tools/season-change-audit.js: hết -->
