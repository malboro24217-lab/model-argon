# Viết thẻ "bước ngoặt" (cho Codex)

Engine: `argon/src/engine/narrative/Fate.ts` (bản mẫu trong `scratchpad/fate/repo/`). Host: `doi-nguoi/living.js` → `fateScene`. Gói mẫu, 60 thẻ, chỉ để tham khảo hình dạng: `fate_pack.ts`.

## 1. Cơ chế nổ (đừng tự làm lại)
- **Mỗi năm (6–72 tuổi):** host hỏi `fateSlot(ctx)`. Đáp án rút từ `ctx.fate_seed = subSeed(seed, tuổi, RNG_SUB.fate)`, tức là **không phụ thuộc lựa chọn**. Đổi một nút không làm xê dịch những năm có bước ngoặt về sau.
- **Xác suất mỗi năm:** `FATE_PER_LIFE / 67`. `FATE_PER_LIFE` (mặc định 50) là **nút vặn duy nhất** của chủ game: `Argon.setFatePerLife(n)`.
- **Khi có chỗ:** Matcher chọn trong `FATE` theo `specificity` cao nhất; hòa thì rút luồng `rngStory`.
  - Thẻ bước ngoặt chiếm một suất ngân sách thẻ nhỏ của năm.
  - Tối đa 1 bước ngoặt/năm (`lw.fateYear`).
  - Không lặp trong đời (`once` / `maxPerLife`).
- **Vế sau của cliffhanger** (`echo`) nằm trong kho major với urgency 92, nổ qua hàng đợi `later`. Nó không chiếm chỗ của năm.
- **Kết quả đo:** một đời thực sự gặp **ít hơn** `FATE_PER_LIFE`, vì có năm không thẻ nào đủ điều kiện. Kho 60 thẻ cho ra 34/đời. Kho ~200 thẻ có gate rộng sẽ gần 50.

## 2. Dựng thẻ
```ts
import { fate, echo, cliff, shadowLine } from "../Fate.ts";
import { C, T, role, f } from "../paths/kit.ts";
fate(id, "lon" | "vua", [tuổiMin, tuổiMax], when: (c) => boolean, build: (c, N) => T(...), opts?)
// opts: { spec?: number (mặc định lon 4, vua 3; callback/chuỗi đặt 6–9), max?: số lần/đời (1), cooldown?: năm,
//         causes?: (c) => string[]  // prov.flag/opinion/memory → host in "↩ Vì năm N…", group?: string }
echo(id, waitFlag, build, when?, causes?)       // vế sau; tự gỡ waitFlag
cliff(waitFlag, echoId, years)                  // trải vào effects của lựa chọn: { flags:[waitFlag], later:{years, storylet:echoId} }
shadowLine(c, roleName, name, round)            // một câu "bóng của tương lai" bằng lời, không số
```
- `fate()` tự gắn `meta: { kind: "fate", tier }`, urgency 86, và đếm `fate_n`, `fate_lon`/`fate_vua` vào mọi lựa chọn.
- `id` có tiền tố riêng cho từng file. Mọi id phải duy nhất trong toàn repo. Đăng ký thẻ vào `FATE` (chọn theo chỗ) hoặc `FATE_ECHO`.
- Hiệu ứng: đúng schema `Effect` trong `content-guide.md` §3 (cùng các trường tiền ở phụ lục). Riêng thẻ bước ngoặt được dùng thêm:
  - `game: { npc, move, stake_frac }` (ván tù nhân).
  - `role: { npc, add: "rival" }`: biến người đó thành **kẻ thù truyền kiếp** (một đời một người).
  - Ván chơi ra `sucker`, `exploitation` hoặc `mutual_destruction` với người trong dàn cũng tạo kẻ thù truyền kiếp.
- `T(title, text, choices, def, { npc, matrix, concept })`: đưa `npc` để hiện dòng ký ức; đưa `matrix: pd(...)` để có sương mù và thẩm định.

## 3. Trường bối cảnh để gate (ngoài `content-guide.md` §3)
| Trường | Nghĩa |
|---|---|
| `c.fate_seed` | Hạt giống của năm. Dùng qua `fateRoll(c, "khóa")` nếu thẻ cần may rủi riêng không phụ thuộc lựa chọn. |
| `c.nemesis` | id kẻ thù truyền kiếp (còn sống), hoặc `undefined`. |
| `c.flags` `q_<vai>_<tật>` | Tật cố định gán lúc chào đời: `neighbor: knows/borrows/loud`, `sibling: late/moto/diet`, `first_boss: proverb/family`, `official: stamp/tea/form`, `childhood_friend: scheme/hungry/karaoke`, `mother: nag_marry/food`, `father: silent/radio`, `rival: copycat/smile`, `mentor: riddle`, `bully: nickname`, `partner: optimist`, `creditor: polite`. |
| `c.counters.gag_<khóa>` | Gag lặp lại; thẻ tự cộng qua `counters: { gag_x: 1 }` ("lần thứ ba…"). |
| `c.counters.fate_n` / `fate_lon` | Số bước ngoặt đã qua. |
| `c.counters.bond_<vai>` | Số ván đã chơi với người đó. Lần thứ 3 host tự kể "bạn nhận ra X là người…". |
| `c.flags` `known_<npcId>` | Đã lộ tính người đó. |
| `c.flags` `has_nemesis` | Đời này đã có kẻ thù truyền kiếp. |
| `c.last_move[id]` | Nước đi gần nhất người đó chơi với bạn. |

Các trường của hệ thống mới (tính cách, tâm trạng, kỹ năng…) xem `fate-design.md` §B. Khi engine có thì gate được.

## 4. Chuẩn chất lượng (đo bằng `divergence.js`, bắt buộc)
```
node scratchpad/fate/divergence.js <repo>/doi-nguoi/tests/.head.js 60 4
```
| Chuẩn | Lớn | Vừa / ván người quen |
|---|---|---|
| Thẻ về sau khác (trung vị của thẻ) | ≥ 70% | ≥ 40% |

Ngoài ra:
- **Mọi lựa chọn đổi ít nhất một thứ bền:**
  - cờ rẽ nhánh mà **≥ 3 thẻ về sau đọc tới** (`when` hoặc `causes`);
  - con đường (`become:`), tài sản (`buy`/`sell`), vai hay lòng tin trong dàn (|tin| ≥ 0.3), cửa (`close_doors`);
  - `income_mult` ≥ 1.2 hoặc ≤ 0.8, hoặc một ván `game`.
- **Lý do đo được hiện nay rất thấp** (trung vị 10%): gói mẫu đặt cờ `tl_*` mà **chưa thẻ nào đọc tới**. Kể từ khi rng được tách theo năm, cờ chết không gây rẽ nhánh nữa; chỉ cờ có người đọc mới gây rẽ. Cách đạt chuẩn: mỗi thẻ lớn mở một **chuỗi** gồm 3–6 thẻ fate/echo gate trên cờ của nó (spec 6–9, để thắng thẻ chung trong các năm sau). Hoặc đổi con đường, đổi nước, vì cả kho đọc những thứ đó.
- **Kinh tế** (đo bằng `measure/balance.js`, so với bản trước):
  - phá sản không tăng quá +5 điểm phần trăm;
  - trung vị tài sản đỉnh không giảm;
  - p99 nên tăng (đuôi dày);
  - Gói mẫu hiện **vi phạm**: phá sản 57% → 79%. Có quá nhiều `borrow`/`money` âm. Mỗi thẻ có lựa chọn trừ tiền phải có một lựa chọn cộng tiền hoặc giữ tiền tương xứng.
- **Ngân sách:** quyết định mỗi đời giữ trong 120–130. Gói mẫu đang ra 143 vì thẻ fate chỉ chiếm 1 suất. Nếu vượt, hạ `yearBudget` trong những năm có fate.
- **Văn bản:** theo `content-guide.md` §4–5.
  - Thẻ lớn: điện ảnh hoặc sitcom (cược nói ngay câu đầu, đồng hồ đếm ngược, một hình ảnh, một cú lật, câu thoại ngắn trong ngoặc kép).
  - Thẻ vừa: đời thường.
  - Không tên thật, không thương hiệu, không nội dung tình dục; phạm pháp chỉ tả hậu quả. Thẻ nào cần AI viết thì ghi chú `// cần AI`.
- **Tất định:**
  - Không `Math.random`.
  - Không đọc thời gian thực.
  - May rủi chỉ qua `gamble` (luồng host của năm) hoặc `fateRoll`.
  - Sau mỗi gói, chạy `replay-test.js`: phải PASS.
