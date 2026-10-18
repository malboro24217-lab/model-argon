# Hướng dẫn viết gói "con đường đời"

Bạn viết nội dung cho game mô phỏng một đời người **"Một Lần Chào Đời"**. Người chơi sinh ra ở một trong khoảng 40 nước (theo số liệu thật), sống từ 0 đến chết, và ra quyết định từng năm. Mỗi **con đường đời** là một danh tính người chơi có thể trở thành (ca sĩ, cảnh sát, người tị nạn…). Danh sách 96 con đường nằm trong `src/engine/narrative/paths/registry.ts`.

**Gói mẫu bắt buộc phải đọc trước khi viết:** `src/engine/narrative/paths/singer.ts`, cùng bộ helper `src/engine/narrative/paths/kit.ts`. Gói của bạn phải có cùng hình dạng và cùng độ kỹ như gói mẫu.

## 1. Nhiệm vụ của bạn

- Chỉ tạo **đúng một file** được giao, ví dụ `src/engine/narrative/paths/arts_a.ts`. Không sửa file nào khác. Đặc biệt không sửa `index.ts`, `kit.ts`, `registry.ts` hay `types.ts`: người khác đang làm song song trên cùng repo.
- File xuất một mảng duy nhất: `export const PACK_ARTS_A: Storylet[] = [ ... ];` (tên theo tên file, viết hoa).
- **Với mỗi con đường được giao, viết ít nhất 18 thẻ:**
  - **1–2 thẻ `talent`:** năng khiếu hồi nhỏ, tuổi trong khoảng 8–16. Bắt buộc nếu con đường có tính khí năng khiếu trong registry. Nếu registry để rỗng (người tị nạn, người từng ở tù…) thì không viết thẻ này mà thêm một thẻ `door`.
  - **≥ 2 thẻ `door`:** cơ hội hoặc biến cố đẩy người chơi vào con đường.
  - **Đúng 5 thẻ `beat`:** id bắt buộc là `<pathId>_b1` đến `<pathId>_b5`, theo mạch khởi đầu → bứt lên → khủng hoảng → đỉnh hoặc vực → di sản.
  - **≥ 9 thẻ `daily`:** chuyện thường ngày của nghề hoặc con đường.
  - **≥ 1 thẻ `cross`:** con đường chạm vào cha mẹ, bạn đời hoặc con cái.
- **Tiền tố id:** mọi id của một con đường dùng một tiền tố 2–3 chữ riêng (vd `ac_` cho actor), trừ thẻ beat. Id phải duy nhất trong toàn repo.

## 2. Cách bước vào và đi hết một con đường

1. **Năng khiếu.** Thẻ `talent`: lựa chọn "nuôi năng khiếu" đặt `flags: [talentFlag(P)]`. Khi đến tuổi đi làm, cảnh chọn nghề sẽ tự có lựa chọn con đường này.
2. **Cơ hội.** Thẻ `door`: lựa chọn bước vào có `...become(P)`. Có thể đặt `become` trong nhánh thắng của `gamble` (vd thi tuyển: đỗ thì vào).
3. **Mạch truyện.** `become` đặt `life_<id>` và bộ đếm `p_<id> = 0`. Từ đó các nhịp `beat(P, n, gapYears, …)` nối nhau. Mọi lựa chọn của một beat phải có `counters: step(c, P)`, kể cả lựa chọn "bỏ cuộc". Nếu lựa chọn rời con đường thì dùng thêm `...leave(P)`, sau đó các nhịp còn lại tự tắt.
   - Khoảng cách gợi ý giữa các nhịp: b1 cách 1 năm, b2 cách 3, b3 cách 4, b4 cách 5, b5 cách 6. Nhịp b5 nên chỉ mở khi đủ tuổi, bằng tham số `when`: `(c) => c.age >= 40`.
4. **Chuyện thường ngày.** Thẻ `daily` chỉ hiện khi đang đi con đường. Thẻ nào gọi `vary(...)` với 2–3 biến thể văn bản thì được quay lại tối đa 2 lần trong đời (cách nhau ≥ 10 năm). Thẻ không có `vary` chỉ hiện 1 lần.

## 3. Schema và hiệu ứng (đúng như engine hiểu, không tự thêm trường)

Thẻ được dựng bằng `T(title, text, choices, def, { npc })`. Mỗi lựa chọn dựng bằng `C(label, effects, hint?, { tier?, longterm? })`.

**Chỉ số và tiền:**
- `health`, `happy`, `know`, `rel`: cộng/trừ điểm (0–100). Thường ±2..±10.
- `bw`: băng thông nhận thức, tức sức lực đầu óc.
- `money`: **tỷ lệ thu nhập một năm của hộ**. Ví dụ −0.2 là mất khoảng 2,4 tháng thu nhập. Chuyện nhỏ ±0.01..0.06; chuyện lớn ±0.2..1; trên ±2 chỉ dành cho những cú đổi đời hiếm hoi. **Dưới 18 tuổi: |money| ≤ 0.05.**
- `income_mult`: nhân thu nhập từ nay về sau (0.5..2.0). Dùng cho thăng tiến hoặc sa sút trong nghề.
- `agency`: ±0.01..0.04, chỉ dùng cho lựa chọn tự chủ hoặc "thoát khung".

**Người và quan hệ:**
- `trust: { npc, delta }`: delta −0.4..0.4.
- `memory: { npc, tag, weight, note }`:
  - `tag` thuộc: HELPED_IN_CRISIS, WIN_WIN_DEAL, KEPT_PROMISE, STOOD_UP_FOR_ME, BETRAYED_PARTNERSHIP, REFUSED_HELP, CHEATED_ME, HUMILIATED_ME, TOOK_MY_LAND, BULLIED_ME, GOSSIP_HEARD_BAD, GOSSIP_HEARD_GOOD;
  - `note` viết cụ thể để câu "X vẫn chưa quên…" đọc tự nhiên. Ví dụ "song ca làm lành", **không** viết "chuyện đó".
- `promise: { to, what, years }`: một lời hứa với một người, game sẽ đòi khi đến hạn.

**Dấu vết và hậu quả về sau:**
- `secret: { tag, severity 0.1–0.8, fuse_years: [a, b], note }`: bí mật có thể nổ ra sau a–b năm. `tag` thuộc: CHEATED_EXAM, PAID_BRIBE, DEFRAUDED_FRIEND, STOLE_SHARED_PROFIT, FORGED_PAPERS, ABANDONED_PARENT.
- `flags: [...]`, `unflags: [...]`: cờ do bạn tự đặt tên, dạng snake_case tiếng Anh, có ý nghĩa rõ (vd `label_contract`, `owns_masters`).
- `counters: { key: delta }`: bộ đếm cộng dồn. Dùng bộ đếm riêng của con đường (vd `sg_fame`) để các thẻ về sau đọc lại và đổi văn bản. Gói mẫu dùng `sg_fame` theo cách này.
- `later: { years, storylet }`: hẹn một thẻ quay lại sau `years` năm. `storylet` phải là id có thật.
- `close_doors: [...]`: đóng vĩnh viễn một cánh cửa đời. Cửa thuộc: inheritance, partner_circle, village_trust, family_table, clean_record, return_home.

**May rủi và việc lớn:**
- `gamble: { p, win: {...}, lose: {...} }`: may rủi, p trong khoảng (0,1). Kết quả phải được kể bằng `log` trong win/lose.
- `custom`, chỉ các giá trị:
  - `become:<pathId>` (bước sang một con đường khác, kể cả của nhóm khác);
  - `borrow:x`, `repay:x` (vay hoặc trả x năm thu nhập);
  - `restructure`, `job_lose`, `return_home`, `spouse_leave`, `apologize`;
  - nối nhiều giá trị bằng `|`, vd `"borrow:0.6|become:restaurateur"`.
- `log`: một câu kể kết quả, không bình luận đạo đức.

**Người trong đời:** lấy bằng `role(c, "<vai>")`, và **phải kiểm tồn tại** trong `when` hoặc trong `build` trước khi dùng. Vai có: mother, father, sibling, childhood_friend, bully, neighbor, first_boss, official, partner, creditor, mentor, rival, spouse, child. Gọi tên bằng `N(id)`. Khi thẻ xoay quanh một người, truyền `{ npc: id }` vào `T(...)`.

**Bối cảnh `c` đọc được:** age, sex ("M"/"F"), country (mã ISO-2, vd "VN", "US", "IN"), gdp, poor_country, family_wealth, has_job, has_degree, married, kids_alive, kids_teen, parents_alive, parent_sick, income, savings, debt, debt_ratio, rich, broke, health, happy, know, rel, bandwidth, scarcity, rat_race, reputation, econ_phase ("boom"/"stagnation"/"crisis"), migrated, flags (Set), counters, cast, opinion, traits.

## 4. Quy tắc thiết kế

1. **Mỗi lựa chọn là một đánh đổi thật:** lợi bây giờ thì giá về sau, hoặc ngược lại. Không có lựa chọn trội tuyệt đối. `hint` (≤ 70 ký tự) nói rõ đánh đổi đó, ví dụ "Nổi nhanh, mất quyền bài hát".
2. **Mỗi thẻ có ít nhất một lựa chọn để lại dấu:** flags, counters, memory, trust, secret, promise, later, custom hoặc close_doors. Công cụ kiểm tra sẽ bắt lỗi nếu thiếu.
3. **Lựa chọn thứ ba thoát khung:** đánh `tier: "sovereign"`, mỗi con đường nên có ít nhất 1–2 lựa chọn kiểu này. Ví dụ: đòi điều khoản khác, lập liên minh, làm luật mới, công khai sổ sách. Lựa chọn cần nhìn xa đánh `tier: "awakened"`; lựa chọn chịu thiệt trước đánh `longterm: true`.
4. **Mạch truyện phải có cao trào thật:** b3 là khủng hoảng thật, b4 là đỉnh *hoặc* vực tùy những gì đã chọn. Đọc lại cờ và bộ đếm từ các nhịp trước để văn bản khác đi (xem `label_contract` và `sg_fame` trong gói mẫu). Ít nhất một nhịp có lựa chọn rời con đường.
5. **Nghề phi pháp hoặc nguy hiểm** (buôn lậu, lừa đảo, hacker, giang hồ…): kể **hậu quả và đánh đổi đạo đức**, KHÔNG mô tả cách làm (không quy trình, không kỹ thuật, không số liệu thao tác). Nên có bí mật (`secret`), công an hoặc tòa án, và lối thoát hoàn lương.
6. **Không có nội dung tình dục.** Không bạo lực chi tiết. Không có trẻ em trong tình huống nguy hiểm được tả cụ thể.
7. **Toàn cầu:** người chơi có thể ở Na Uy hay ở Congo, nên viết sao cho đúng ở mọi nước. Chi tiết riêng Việt Nam (Tết, chợ phiên, đám giỗ…) chỉ dùng khi `c.country === "VN"`, có thể rẽ văn bản bằng điều kiện này. Dùng `c.poor_country` và `c.gdp` để đổi bối cảnh giàu/nghèo.
8. **Nội dung gốc:** lấy cảm hứng từ mô-típ phổ biến của báo chí, phim tài liệu, phim truyện ("ca sĩ hết thời", "cảnh sát bị mua chuộc", "lao động bị giữ hộ chiếu"…). **Không** chép cốt truyện, nhân vật, tên riêng, câu thoại của tác phẩm có thật. Không dùng tên người thật, công ty thật hay thương hiệu thật.
9. **Không lặp mô-típ:** mỗi thẻ một tiêu đề riêng (≤ 60 ký tự). Không viết hai thẻ cùng một cảm xúc hay một hành động trong cùng con đường.

## 5. Giọng văn

- Tiếng Việt có dấu, ngôi thứ hai "bạn". Điềm tĩnh, cụ thể, không giáo điều.
- Đoạn tình huống 2–4 câu, có một chi tiết cụ thể đúng với nghề: con số, đồ vật, giờ giấc. Ví dụ: "sáu mươi khán giả, ánh đèn hỏng một bên".
- Nhãn lựa chọn ≤ 60 ký tự, bắt đầu bằng động từ.

## 6. Kiểm tra trước khi báo xong (bắt buộc cả hai phải PASS)

```bash
cd /home/claude/argon
scripts/tsc-pack.sh src/engine/narrative/paths/<file>.ts
node --experimental-strip-types src/check-pack.ts src/engine/narrative/paths/<file>.ts
```

`check-pack` kiểm: đủ cấu trúc của mỗi con đường, id không trùng, `build` không lỗi trên 30.000 bối cảnh ngẫu nhiên, mỗi thẻ đều có lúc bắn được, 2–4 lựa chọn, có dấu tiếng Việt, độ dài tiêu đề/nhãn/hint, mỗi thẻ có lựa chọn để lại dấu, tiền cho trẻ em, `step()` trong beat, `talents_seen`/`doors_seen`, tiêu đề không trùng.

**Thời sự** (`news.ts`) chạy kiểm bằng cờ `--news`.

## 7. Thẻ thời sự (chỉ cho người viết `news_*.ts`)

Dùng helper `news(id, ages, p, when, build, major?)`:
- `p` là tỷ lệ số đời gặp chuyện (0.05..0.4);
- `major = true` cho biến cố lớn chen vào năm đó (thiên tai, dịch bệnh, chiến tranh);
- `when` để gate theo nước, tuổi, nghề, tài sản.

Mỗi thẻ là một chuyện của thời đại chạm vào đời: dịch bệnh, thiên tai, khủng hoảng tài chính, AI thay việc, đa cấp, giải tỏa đất, cháy chung cư, lừa đảo qua điện thoại, drama mạng xã hội, bầu cử, đình công, giá vàng, du lịch bùng nổ…

- Ít nhất một lựa chọn nối vào một con đường bằng `become:<id>` khi hợp lý. Ví dụ: chiến tranh → `become:refugee` hoặc `become:soldier`; AI thay việc → `become:ai_engineer` hoặc `become:shipper`.
- Không gắn năm dương lịch cụ thể ("năm 2020"). Viết sao cho chuyện có thể xảy ra ở bất kỳ thời điểm nào trong đời.

---

# Phụ lục: gói "thẻ tiền" (money_*.ts)

Thẻ tiền không thuộc con đường nào. Chúng là những lúc một người phải **dùng tiền**: sống thế nào, mua gì, giúp ai, đặt cược vào đâu. Spec: `docs/superpowers/specs/2026-10-18-tien-bac-design.md`.

## Dựng thẻ
- Dùng helper `money(id, ages, cooldown, p, when, build)` trong `kit.ts`.
  - `p`: tỉ lệ đời gặp thẻ (0.2–0.9). Thẻ phổ biến (mua xe, bạn hỏi vay) 0.6–0.9; thẻ hiếm (trúng giải tỏa, ngân hàng đổ) 0.15–0.35.
  - `when(c)`: điều kiện hoàn cảnh. **Luôn kiểm tồn tại** của người (`role(c, …)`) và của tài sản (`c.owns.has(…)`) trước khi dùng.
- Mọi lựa chọn dựng bằng `C(...)`, mọi thẻ bằng `T(...)`. Id có tiền tố riêng của file. Tiêu đề không trùng.
- Tuổi: thẻ tiền chỉ dành cho người từ 18 tuổi trở lên.
- Mỗi năm host chỉ cho **tối đa 1 thẻ tiền**, nên mỗi thẻ phải đáng giá.

## Hiệu ứng tiền (ngoài các hiệu ứng ở mục 3)
Tất cả số tiền tính bằng **số năm thu nhập hộ**, giống `money`.

| Hiệu ứng | Nghĩa |
|---|---|
| `buy: { kind, name, price, borrow? , with_npc? }` | Mua một món có tên. `kind` ∈ house, land, vehicle, shop, gold, deposit, stake. `price` là số năm thu nhập; lấy theo `c.price_years.<kind>` nhân hệ số (vd `c.price_years.house * 0.8`). Vàng/góp vốn thì chọn số trực tiếp (0.1–2). `borrow: true` = vay ngân hàng phần thiếu. Engine kẹp giá vào khung thật của nước đó và có thể **từ chối** (không đủ tiền, ngân hàng không cho vay): khi đó host tự kể, bạn không cần lo. |
| `sell: { kind?, name? }` | Bán món khớp tên, hoặc món đầu tiên của loại đó. Bán luôn lỗ phí. |
| `lifestyle: "tan_tien" \| "vua_phai" \| "thoai_mai" \| "pho_truong"` | Đổi mức sống từ nay. |
| `deposit: x`, `withdraw: x` | Gửi / rút tiết kiệm (0 < x ≤ 5). |
| `lend: { npc, amount, years }` | Cho một người vay. Người đó tự quyết trả hay quỵt theo tính cách và lòng tin. |
| `give: { npc, amount }` | Cho, biếu, không đòi. |
| `insure: "health" \| "property"`, `uninsure: …` | Mua / bỏ bảo hiểm. |
| `support: { who: "parents" \| "kids", level: "it" \| "du" \| "hau" }` | Mức chi cho bố mẹ hoặc con. |

## Bối cảnh `c` đọc thêm
`owns` (Set loại tài sản), `asset_names` (loại → tên món), `assets_value`, `loans`, `loan_burden` (tiền góp / thu nhập), `deposit`, `lifestyle`, `lifestyle_years`, `insured` (Set), `owed_to_me`, `debtors_overdue` (id người đang nợ quá hạn), `home_owner`, `support`, `price_years` (giá điển hình theo số năm thu nhập của người chơi: house, land, vehicle, shop).

## Quy tắc riêng
1. Tiền luôn đổi lấy một thứ khác: chỗ ở, thể diện, quan hệ, sự yên tâm, thời gian. Viết `hint` nói rõ đổi gì lấy gì, vd "Có nhà, gánh 20 năm góp".
2. Một thẻ không bao giờ ép mua: luôn có lựa chọn không chi.
3. Chuyện cho vay, góp vốn phải có người cụ thể (`role(c, …)`), và nên để lại `memory`/`trust`.
4. Lừa đảo tài chính, đa cấp, hụi vỡ: chỉ kể hậu quả, không tả cách làm.
5. Văn bản phải đúng ở mọi nước. Chi tiết Việt Nam (hụi, sổ đỏ, vàng SJC… — không dùng tên thương hiệu thật, nói "vàng miếng") chỉ khi `c.country === "VN"`.
6. Kiểm gói: `node --experimental-strip-types src/check-pack.ts src/engine/narrative/paths/<file>.ts --money` và `scripts/tsc-pack.sh src/engine/narrative/paths/<file>.ts`.
