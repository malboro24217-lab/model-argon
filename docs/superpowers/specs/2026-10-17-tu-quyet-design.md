# Đặc tả: Ô "Tôi muốn…" — người chơi tự gõ ý mình

Ngày: 2026-10-17 · Dự án: Một Lần Chào Đời / Model Argon · Trạng thái: chờ duyệt

## 1. Mục tiêu

Người chơi không còn bị giới hạn trong 2–3 nút bấm. Họ gõ bằng lời bất kỳ việc gì một người thật có thể làm
("mở quán phở", "bỏ vợ", "đi Nhật làm thợ hàn", "làm lành với bố"), và game hiểu, xử lý theo luật của thế giới,
rồi việc đó kéo theo một nhánh đời mới kéo dài nhiều năm.

Hiện trạng (đo trên 120 đời): 69% quyết định chỉ có 2 nút, 21% có 3 nút; mọi quyết định đều do game khởi xướng;
thứ duy nhất người chơi chủ động là "trọng tâm năm".

**Thành công khi:**
1. Gõ một việc hợp lý ngoài đời → nhận lời kể, thay đổi chỉ số, phản ứng của người liên quan trong một thẻ kết quả.
2. Việc đó để lại dấu vết như một lựa chọn thật: có trong bản đồ nhân quả, sinh hậu quả có ghi nguồn gốc, được kể ở cuối đời,
   và xuất hiện trong "Cuộc đời suýt có".
3. Việc gõ có thể mở "chuyện đang dở" — AI viết tiếp các chặng trong những năm sau.
4. Không gian lận được: gõ "tôi trúng xổ số" không biến thành sự thật; mọi con số đều bị kẹp trong trần cứng.

## 2. Quyết định đã chốt với Tùng

| Câu hỏi | Chốt |
|---|---|
| Thiếu gì nhất | Tự gõ ý mình |
| Ô gõ ở đâu | Ô "Tôi muốn…" riêng, **lúc nào cũng mở** — kể cả khi đang có tình huống chờ (khi đó câu gõ là cách xử lý riêng cho tình huống đó) |
| Bao nhiêu lần | **Không giới hạn**; mỗi lần tốn sức lực tăng dần trong năm |
| Hậu quả đi xa đến đâu | Thành nhánh nhiều năm (kết quả ngay + nối vào kho tình huống có sẵn + AI viết các chặng sau) |
| Hướng kỹ thuật | **A — AI toàn quyền**: AI tự viết kết quả và tự quyết con số; engine chỉ kẹp trần và lọc danh sách cho phép |
| May rủi | **Không có xúc xắc của engine**; AI tự quyết, prompt ép theo tỉ lệ thực tế, "thành công" không là mặc định |
| Tự chơi (auto) | Không dùng ô gõ |
| Mất mạng / AI lỗi | Không có phương án dự phòng: báo lỗi, cho thử lại, lượt không tính |

## 3. Người chơi thấy gì

- Thanh **"Tôi muốn…"** cố định dưới thanh năm/tuổi (ô nhập + nút Gửi, Enter để gửi, tối đa 200 ký tự).
- Placeholder đổi theo ngữ cảnh: không có tình huống → *"Tôi muốn… (vd: mở quán phở, làm lành với bố)"*;
  đang có tình huống → *"Hoặc tự viết cách xử lý của bạn…"*.
- Bấm gửi: đồng hồ dừng, ô gõ khóa, hiện dòng "Đang diễn ra…". Khi có kết quả, **thẻ kết quả** hiện:
  - lời kể 2–4 câu (hiệu ứng hiện từng chữ sau khi nhận kết quả — chế độ JSON không stream được),
  - nhãn kết quả: Thành / Nửa vời / Hỏng / Không làm được,
  - chênh lệch chỉ số (dùng lại kiểu hiển thị stat delta hiện có),
  - tối đa 3 dòng phản ứng của người liên quan ("Bố: …"),
  - nếu mở chuyện: dòng **"Chuyện còn đang dở: <tên>"**.
- Thẻ kết quả đóng bằng nút "Tiếp tục" hoặc phím Enter; đồng hồ chạy lại theo tốc độ cũ.
- Bảng nhân vật hiện thêm mục **"Chuyện đang dở"** (tên + hẹn năm bao nhiêu tuổi).
- Chế độ tự chơi: ô gõ bị ẩn.

## 4. Hợp đồng với AI

### 4.1 Gọi
Một lần gọi `NAR.sample.json(prompt, { modelTier, cache: false })` cho mỗi việc gõ (dùng lại hạ tầng `narrator.js`).
Timeout 20 giây. Sai định dạng hoặc lỗi → thử lại 1 lần → vẫn hỏng thì báo *"Người kể chuyện chưa trả lời — thử lại"*;
không áp dụng gì, không trừ sức lực, không ghi dấu mốc.

### 4.2 Gói gửi đi
`statePacket(L)` hiện có, cộng thêm:
- `nguoi_than`: dàn nhân vật sống (id, tên, vai, độ tin, ký ức mạnh nhất về mình),
- `chuyen_dang_do`: tên + tóm tắt + chặng hiện tại của từng chuyện mở,
- `nam_nay_da_lam`: danh sách câu đã gõ trong năm nay,
- `suc_luc`: băng thông hiện tại và cờ `kiet_suc` (băng thông < 30),
- `tinh_huong_dang_cho` (nếu có): tiêu đề, nội dung, các nút,
- `co_cho_phep`: bảng cờ cho phép kèm mô tả tiếng Việt (mục 5.2),
- `cau_go`: câu người chơi gõ.

### 4.3 Luật trong prompt (`AGENCY_RULES`)
- Viết ngôi thứ hai, giọng của game, 2–4 câu, tiếng Việt.
- Tôn trọng thực tế của nước, thu nhập, tuổi, sức khỏe, tình trạng nợ. Tỉ lệ thành công theo đời thật
  (vd: quán ăn mới mở phần lớn đóng cửa trong 3 năm). **Không mặc định thành công.**
- Người chơi chỉ quyết việc **mình làm**, không quyết kết quả hay hành động của người khác. "Tôi trúng xổ số" = mua vé; trúng hay không AI quyết theo tỉ lệ thật.
- Việc bất khả thi → `khong_lam_duoc` kèm lời kể giải thích.
- Việc phạm pháp hoặc bạo lực → kể hậu quả thật (bị phát hiện, mất danh tiếng, tòa án, mất người thân tin), không mô tả cách làm.
- Kiệt sức hoặc đã làm nhiều việc trong năm → kết quả kém đi; lặp một việc → hiệu quả giảm dần.
- Chỉ dùng cờ và việc lớn trong danh sách; người cũ dùng đúng `id`.

### 4.4 Kết quả AI trả về (JSON)
```json
{
  "ke": "Bạn gom hết tiền tiết kiệm, thuê một góc vỉa hè đầu ngõ…",
  "ket_qua": "thanh | nua_voi | hong | khong_lam_duoc",
  "chi_so": { "money": -0.4, "health": -3, "happy": 5, "know": 0, "rel": 2, "bw": -6, "income_mult": 1.1, "agency": 0.02 },
  "nguoi": [
    { "id": "cast_father", "tin": -0.1, "nho": "mở quán không hỏi ý bố", "phan_ung": "Không nói gì, tối đó ăn cơm một mình." },
    { "moi": { "ten": "Hùng", "vai": "doi_tac" }, "tin": 0.2, "nho": "góp vốn quán phở", "phan_ung": "Vỗ vai: làm thì làm." }
  ],
  "co": ["own_business"],
  "bo_co": [],
  "viec_lon": [ { "loai": "doi_nghe", "gia_tri": "market" }, { "loai": "vay", "gia_tri": 0.5 } ],
  "thoi_quen": { "smoke": -2 },
  "bi_mat": null,
  "chuyen": { "ten": "Quán phở đầu ngõ", "tom_tat": "Vừa mở, nợ nửa năm thu nhập, bà hàng xóm bán cùng món.", "hen_nam": 2 }
}
```
Đơn vị: `money` tính theo **số năm thu nhập hộ** (giống hiệu ứng hiện có); `tin` là thay đổi độ tin −1..1.

## 5. Engine: `src/engine/narrative/Agency.ts` (TypeScript strict, không phụ thuộc giao diện)

### 5.1 `sanitizeAct(raw, ctx): ActResult | null`
Trả `null` khi thiếu `ke` hoặc `ket_qua` không hợp lệ. Còn lại kẹp từng trường:

| Trường | Trần |
|---|---|
| `money` | −3 … +3 (năm thu nhập) |
| `health` | −40 … +20 |
| `happy`, `know`, `rel` | −20 … +20 |
| `bw` | −25 … +15 (trước khi cộng chi phí bắt buộc ở 5.3) |
| `income_mult` | 0.5 … 2.0 |
| `agency` | −0.05 … +0.05 |
| `nguoi` | tối đa 3 người, trong đó tối đa 1 người mới; `tin` −0.5 … +0.5; chuỗi cắt 120 ký tự |
| `co` / `bo_co` | chỉ cờ trong danh sách cho phép, tối đa 4 |
| `viec_lon` | tối đa 2, chỉ loại trong 5.2, giá trị kẹp |
| `thoi_quen` | khóa thuộc {smoke, drink, exercise, read, save, gamble, honest, kind}, mỗi khóa −3 … +3 |
| `bi_mat` | `loai` thuộc SecretTag; `nang` 0.1 … 0.8; ngòi nổ 3–12 năm |
| `chuyen` | `hen_nam` 1 … 5; tên ≤ 60 ký tự, tóm tắt ≤ 240 ký tự |
| `ke` | ≤ 600 ký tự |

AI **không thể**: giết nhân vật trực tiếp (chỉ trừ sức khỏe, chết do mô hình sức khỏe); đặt cờ `origin_*`, `temper*`, `spouse_*`, `job_*`, `path_*`
(nghề và lối rẽ chỉ đổi qua `viec_lon`); đổi nước trừ qua `di_nuoc_ngoai`.

### 5.2 Danh sách cho phép
**Cờ** (bảng hằng số kèm mô tả tiếng Việt, 15 cờ — đã kiểm: mỗi cờ đều có tình huống đọc tới): `own_business, left_home, path_city, leader, affair,
carer, athlete, tinker, heir, orchard, land_sold, startup, credit_book, brawler, gang`.
Kiểm thử bắt buộc: mọi cờ trong bảng phải được ít nhất một tình huống có sẵn đọc tới (để cờ nào cũng thật sự nối vào kho).

**Việc lớn** (`loai` → hiệu ứng host):
| loai | Hiệu ứng | Ràng buộc |
|---|---|---|
| `doi_nghe` | `job_switch:<họ nghề>` | giá trị ∈ 10 họ nghề |
| `mat_viec` | `job_lose` | đang có việc |
| `vay` | `borrow:x` | x ≤ 3 |
| `tra_no` | `repay:x` | x ≤ 3 |
| `co_cau_no` | `restructure` | có nợ |
| `di_nuoc_ngoai` | dùng nhánh `migrate` hiện có (mới: gọi như kết quả "Thử đi") | 18–50 tuổi, chưa di cư |
| `ve_que` | `return_home` | đã rời quê |
| `chuyen_thanh_pho` | cờ `path_city` + `left_home`, thu nhập ×1.15, quan hệ −5 (mới) | chưa ở thành phố |
| `di_hoc` | học lại: `know` +, thu nhập tạm ×0.7 trong 2 năm, có bằng nếu đã học hết lớp 12 (mới) | ≤ 45 tuổi |
| `ket_hon` | kết hôn với người có `id` hoặc người mới (dùng lại nhánh `marry`) (mới: nhận tên từ AI) | chưa kết hôn, ≥ 18 tuổi |
| `ly_hon` | `spouse_leave` | đang kết hôn |
| `co_con` | sinh một con (dùng lại khối sinh con) (mới) | đang kết hôn, 18–44 tuổi (nữ) |
| `nghi_huu` | nghỉ hưu sớm (mới) | ≥ 50 tuổi |
| `xin_loi` | `apologize` | — |

### 5.3 Sức lực tăng dần
Việc gõ thứ n trong cùng một năm tuổi bắt buộc trừ thêm băng thông: 3, 5, 8, 12, 17, 23… (`cost(n) = cost(n−1) + n`, `cost(1) = 3`).
Cộng vào `chi_so.bw` (âm). Không có trần số lần.

### 5.4 Lịch chuyện đang dở
```ts
interface Story { id: string; title: string; summary: string; openedAge: number; nextAge: number; stage: number;
  log: Array<{ age: number; text: string; choice: string }>; people: string[]; originMark: string; closed: boolean; failures: number }
```
- `dueStories(stories, age)`: chuyện chưa đóng có `nextAge ≤ age`, sắp theo `nextAge`, **lấy tối đa 2**; còn lại lùi sang năm sau.
- Mỗi chuyện tối đa **8 chặng**; chặng thứ 8 AI bắt buộc viết kết.
- Người trong chuyện chết hoặc rời đời → thông tin này nằm trong gói gửi AI ở chặng sau.
- Nhân vật chết → mọi chuyện đóng.

## 6. Phía trang game: `agency.js`

- `agencyAct(L, text)`: gom gói, gọi AI, `Argon.sanitizeAct`, áp dụng, ghi dấu mốc, lưu `actLog`, trả thẻ kết quả.
- `applyAct(L, act, ctx)`: áp `chi_so` (đường áp hiệu ứng hiện có), `nguoi` (`trust` + `memory`; người mới qua `addCastMember` mở rộng cho vai bất kỳ, có tên AI đặt),
  `co`/`bo_co` vào `lw.sflags` (có đóng dấu nguồn gốc), `viec_lon` qua `customEffect` (+ các case mới ở 5.2), `thoi_quen` vào counters, `bi_mat` qua `addSecret`, `chuyen` → `L.stories`.
- **Khi đang có tình huống chờ:** câu gõ được gửi kèm tình huống. Kết quả **thay cho nút bấm**: `L.pending = null`, `markChoice` ghi lựa chọn là câu gõ,
  các nút thành "đường không đi"; sau đó gọi `livingFollowUp(L)` như mọi lựa chọn khác.
- **Chuyện đến hẹn:** `stepYear` đồng bộ; khi có chuyện đến hẹn, engine đặt `L.storyDue` và dừng năm như một tình huống chờ. Vòng lặp giao diện thấy `L.storyDue` thì gọi
  `agencyStory(L, story)`: AI trả một tình huống theo khuôn của người kể chuyện hiện có (`title, text, choices[2–4]`), mỗi nút mang khối kết quả như 4.4
  (`chi_so, nguoi, co, viec_lon, chuyen.tiep{hen_nam, tom_tat} | chuyen.ket`). Lỗi → thử lại 1 lần → hoãn chuyện 1 năm; hỏng 3 lần → chuyện đóng với câu "chuyện chìm dần".
- Người kể chuyện AI định kỳ hiện có giữ nguyên.

## 7. Nhân quả và tua lại đời

- Mỗi việc gõ là một **dấu mốc**: tiêu đề "Tự quyết" (hoặc tiêu đề tình huống đang chờ), lựa chọn = câu gõ (cắt 80 ký tự),
  đường không đi = các nút (nếu đang có tình huống) hoặc "Không làm gì" (nếu chủ động).
- Mọi cờ, ký ức, bí mật, cửa đóng do việc gõ sinh ra đều được đóng dấu nguồn gốc → hậu quả về sau ghi *"Vì năm 32 tuổi bạn tự quyết mở quán phở…"*.
  Các chặng chuyện đang dở mang nguồn gốc là dấu mốc mở chuyện.
- **`L.actLog`**: `[{ age, seq, kind: "proactive" | "scene" | "story", key, text, result }]` lưu đúng kết quả đã làm sạch.
- **Tua lại (`replayLife`)** không gọi AI:
  - `scene`: script theo `key` trỏ tới kết quả đã lưu;
  - `proactive`: áp lại ngay sau `lifeEvents` của đúng tuổi đó, theo thứ tự `seq`;
  - `story`: dùng tình huống đã lưu nếu chuyện tồn tại trong nhánh tua lại.
  Tiền tính theo năm thu nhập của đời đang tua, nên nhánh giả định vẫn hợp lý về số.
- **"Cuộc đời suýt có"**: dấu mốc tự quyết được ưu tiên lọt vào danh sách (ít nhất 1 nếu có). Phương án thay thế của việc chủ động là bỏ hẳn việc đó
  (*"Nếu năm 32 tuổi bạn không mở quán phở: …"*). Tình huống không gặp lại trong nhánh giả định thì việc gõ cho nó bị bỏ qua.
- Điếu văn và danh hiệu được đọc danh sách việc tự quyết (tối đa 3 việc có hậu quả lớn nhất).

## 8. Kiểm thử

**8.1 Tự động, AI giả** (`agency-test.ts` + kịch bản node trên `cm-head.js`):
- Fuzz 2000 kết quả ngẫu nhiên, gồm: số cực đoan (±1000), kiểu sai, trường thiếu, cờ lạ, cờ cấm, `viec_lon` lạ, 20 chuyện mở cùng lúc, chuỗi siêu dài, JSON hỏng.
- Khẳng định: 0 ngoại lệ; mọi thay đổi nằm trong trần; không cờ cấm; không chết trực tiếp; ≤ 2 chặng chuyện mỗi năm; ≤ 8 chặng mỗi chuyện;
  chi phí sức lực đúng dãy 3, 5, 8, 12…; mọi cờ trong danh sách cho phép đều được ít nhất một tình huống đọc tới.
- 200 đời có 5–15 việc gõ giả: tua lại với `actLog` → trạng thái cuối trùng khớp (tuổi, tiền, cờ, lịch sử tình huống); bỏ một việc → đời khác đi.
- Các bài kiểm hiện có (micro-test, branch-test, ui-test5, narrative-test) vẫn qua và số liệu rẽ nhánh không tụt.

**8.2 Trình duyệt, AI giả** (playwright, giả `claude.use("sample")`):
- Gõ khi không có tình huống → thẻ kết quả, đồng hồ dừng rồi chạy lại.
- Gõ khi đang có tình huống → tình huống được giải, có dấu mốc với câu gõ.
- AI lỗi 2 lần → báo thử lại, trạng thái không đổi.
- Chuyện đến hẹn → dòng chờ → tình huống của chuyện → chọn nút hoặc gõ đều được.
- Hết đời → bản đồ nhân quả, "Cuộc đời suýt có" và điếu văn có việc tự quyết. Không có lỗi trên console.

**8.3 AI thật** (Tùng thử trong trang game đã đăng; danh sách kèm kết quả mong đợi):
1. "mở quán phở" → tốn tiền/vay, cờ buôn bán, mở chuyện.
2. "tôi trúng xổ số" → mua vé, gần như chắc chắn không trúng.
3. "đi Nhật làm thợ hàn" → di cư hoặc thất bại thủ tục, có chi phí.
4. "làm lành với bố" → thay đổi độ tin với bố, có phản ứng.
5. "bỏ vợ" / "bỏ chồng" → ly hôn, quan hệ giảm, con cái phản ứng (nếu có).
6. "đi làm thêm" × 5 trong một năm → sức lực cạn dần, hiệu quả giảm.
7. "đánh thằng hàng xóm" → hậu quả thật, không tả cách làm.
8. "bay lên mặt trăng" → không làm được.
9. Đang có "Chủ nợ đập cửa", gõ "rủ chủ nợ góp vốn vào quán" → xử lý trong bối cảnh tình huống.
10. "học lại đại học năm 40 tuổi" → `di_hoc`, thu nhập tạm giảm.

## 9. Ngoài phạm vi
Lưu/tải đời đang chơi; ô gõ khi mất mạng hoặc AI tắt; chế độ tự chơi dùng ô gõ; sửa nội dung 298 tình huống có sẵn; giọng nói.

## 10. Rủi ro
- **AI lạc quan:** dù có luật, AI có xu hướng cho thành công. Theo dõi trong thử nghiệm 8.3; nếu lệch thì siết prompt (ví dụ yêu cầu AI nêu tỉ lệ ước tính trước khi quyết).
- **Chi phí và độ trễ:** mỗi việc gõ và mỗi chặng chuyện = 1 lần gọi AI, 2–8 giây. Gõ không giới hạn → tốn lượt AI của tài khoản.
- **Lạm dụng tiền:** trần ±3 năm thu nhập mỗi lần, cộng với gõ không giới hạn, về lý thuyết cho phép cày tiền. Chặn mềm bằng sức lực tăng dần
  và AI thấy danh sách việc đã làm. Nếu thử nghiệm cho thấy vẫn cày được, bước tiếp theo là giảm trần dương theo số lần gõ trong năm.
- **Tua lại lệch ngữ cảnh:** trong nhánh giả định, kết quả đã lưu được áp vào một đời khác, nên lời kể có thể không khớp. Màn "Cuộc đời suýt có" chỉ hiện con số, không hiện lời kể của nhánh giả định.
