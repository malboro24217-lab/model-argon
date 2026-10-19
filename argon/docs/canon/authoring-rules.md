# Quy tắc viết mùa và nhánh kỳ dị

Mười quy tắc này rút ra từ các lần review khi viết 100 nhánh kỳ dị (Task 10–19 của canon event). Bản gốc là phần bổ sung cho hướng dẫn viết từng đợt, nằm trong thư mục làm việc `.superpowers/` (không theo repo). Bản này dịch lại để quy tắc nằm cùng mã nguồn.

Áp dụng cho:
- mọi mùa thường trong `argon/src/engine/narrative/canon/seasons/`;
- mọi nhánh kỳ dị trong `argon/src/engine/narrative/canon/weird/`;
- 8 mầm trong `argon/src/engine/narrative/canon/seeds.ts`, ở những chỗ quy tắc có nghĩa với mầm.

Helper viết thẻ và luật cấu trúc nằm ở đầu `argon/src/engine/narrative/canon/kit.ts`. Bộ kiểm `argon/src/canon-content-test.ts` bắt phần lớn các quy tắc dưới đây; quy tắc nào bộ kiểm chưa bắt thì ghi rõ. Lý do của từng quyết định: `argon/docs/ledger/2026-10-18-canon-event.md`.

Chạy bộ kiểm:
```sh
cd argon && node --experimental-strip-types src/canon-content-test.ts && node --experimental-strip-types src/canon-test.ts && npx tsc --noEmit
```

## 1. Cổng tuổi của chung kết
- Ở mọi thẻ chung kết, lựa chọn hay thẻ có `become:<p>` chỉ được mở khi `PATHS[p].ages[0] ≤ tuổi ≤ PATHS[p].ages[1] + 5`.
- Khi tính tuổi, cộng cả khoảng tuổi trong `when` của nhánh, số năm của mùa và mọi `age_skip`.
- Thẻ chung kết nào cũng phải **luôn** có ít nhất một landing không phải nghề, mở ở mọi tuổi: tiền, `move_city`, `marry`, `return_home`, `repay`…
- Dùng helper có sẵn trong `kit.ts`: `pathOpen`, `careerOk`, `finale`, `finaleInOrder`, `openInOrder`.
- Bộ kiểm thử mọi tuổi từ 8 đến 90, cả khi có và chưa có vợ/chồng.

## 2. Mùa phải phản ứng với lựa chọn trước
- Theo `argon/docs/content-guide.md` §4.4.
- Trong mỗi nhánh, các thẻ ở nhịp cú lật, đáy và chung kết phải đọc ít nhất **2** cờ hoặc bộ đếm khác nhau do lựa chọn ở các nhịp trước đặt, để chữ hoặc lựa chọn đổi theo.
- Bộ kiểm dựng các thẻ ở nhịp sau hai lần, có và không có từng cờ/bộ đếm của nhịp trước, rồi đòi ít nhất 2 cái làm thẻ đổi khác.

## 3. Khớp vật gài phải cụ thể
- Trong `when` và trong chữ, khớp đúng khóa vật gài (ví dụ các khóa kiểu radio của S01).
- Không dùng chuỗi con quá rộng như `"cua_ong"` hay `"bo"`. Chúng trúng cả những vật gài không liên quan và cho ra chữ vô nghĩa.

## 4. Tiền đề phải đúng với mọi bối cảnh mà `when` cho qua
- Ví dụ: thẻ nói "con nhỏ" thì gate bằng `kids_school` hoặc `kids_teen`, không phải `kids_alive`.

## 5. Một thực thể xuyên suốt
- Cửa, biến cố mở đầu và các thẻ của mùa phải nói về cùng một người, cùng một vật.
- Chọn thực thể đó một cách tất định từ chỗ trống, ví dụ bằng một helper dùng chung ở mọi chỗ.

## 6. Không dùng chi tiết riêng của một nước
- Không tục lệ đêm rằm, không tên chó quen thuộc kiểu Việt, không thành ngữ về đôi đũa…
- Muốn dùng thì gate bằng `c.country === "VN"`.

## 7. Mọi `when` có khoảng tuổi rõ ràng
- Rút ra từ review S11–S20 và S41–S50.
- Khoảng tuổi phải làm tiền đề đúng. Tiền, việc làm, khoản vay, hợp đồng, hôn nhân, nhận con nuôi, di cư của người lớn cần `c.age >= 18`.
- Có cả cận trên để mùa vừa với một đời hợp lý, ví dụ ≤ 68–72.
- Lý do: canon event có thể nổ từ 8 tuổi, và cửa kỳ dị **chỉ** được gate bằng `when`.

## 8. Vết "đồ" có nhiều dạng
- `k.scar("do")` có thể là đồ vật, con vật, kỹ năng, tài sản (nhà, đất) hay chức danh nghề.
- Viết sao cho câu đọc đúng với mọi dạng, ví dụ "thứ bạn mang theo từ đời cũ — X — …".
- Không coi nó là một món đồ để tháo ốc hay cất vào ngăn kéo, trừ khi thẻ đã gate đúng loại.

## 9. Câu khẳng định trạng thái phải đúng với mọi bối cảnh
- Câu nói chắc về nợ, việc làm, vợ/chồng, con, nhà phải đúng với mọi bối cảnh mà thẻ có thể gặp.
- Cách làm: rẽ theo `c.debt > 0`, `c.has_job`, `c.married`…, hoặc gate thẻ bằng `when`.
- Vết "nợ" có thể rỗng. Khi đó dùng `noOr(c, k)` trong `kit.ts`: chữ dự phòng chỉ gọi là nợ khi `c.debt > 0`, còn lại là "món ân tình cũ".
- Bộ kiểm dò bằng `probeFacts`: dựng mọi thẻ dưới các cặp sự thật tương phản (có nợ và không nợ, có việc và về hưu, có vợ/chồng và góa, có nhà và sống nhờ, có con và không) rồi tìm các cụm từ trong `FACT_RULES`.
  - Tiền đề do chính mùa dựng ra thì ghi vào `PREMISE`, kèm lý do.
  - Cụm từ nói về người khác thì ghi vào `NOT_ASSERT`, kèm lý do.
- Luật đi kèm: dòng landing hay gợi ý ở chung kết hứa "trả nợ" hoặc "khép chuyện cũ" thì effects phải có `repay:<x>`.

## 10. Lựa chọn có `tier` không được đứng đầu
- Rút ra từ review S31–S40.
- Lựa chọn có `tier: "awakened" | "sovereign"` bị ẩn với người chơi tự động (`doi-nguoi/bridge.js`, hàm `choiceState`; `doi-nguoi/choice.js` lọc theo nó).
- Mỗi thẻ phải có ít nhất 2 lựa chọn **không** có `tier`.
- Lựa chọn có `tier` không bao giờ đứng đầu, vì lựa chọn đầu là mặc định. Đặt chúng ở cuối (content-guide §4).
- **Bộ kiểm chưa bắt quy tắc này** (ruling R19 hẹn đưa vào bộ kiểm ở Task 20). Hiện người viết và reviewer phải tự đọc.
