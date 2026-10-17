# Đặc tả: Dùng tiền — mức sống, tài sản, chi cho người, đầu tư

Ngày: 2026-10-18 · Dự án: Một Lần Chào Đời / Model Argon · Trạng thái: chờ duyệt

## 1. Mục tiêu

Hiện giờ tiền chỉ là một con số. Người chơi kiếm được tiền nhưng gần như không *dùng* được nó. Tính năng này biến tiền thành một loạt quyết định có hậu quả: sống thế nào, mua gì, giúp ai, đặt cược vào đâu.

**Hiện trạng (đọc mã ngày 18/10):**
- `L.savings` lên xuống theo trọng tâm năm, theo hiệu ứng `money` của thẻ, và theo ô "Tôi muốn…".
- Chi sinh hoạt bị trừ ngầm trong `lifestyleSpend`, tính theo độ nhạy dopamine. Người chơi không thấy và không chỉnh được.
- Engine có sẵn `purchase`, `frugal`, `repay`, `borrow` trong đầu vào của `tick`, nhưng `bridge.js` luôn truyền `purchase: 0, borrow: 0`, và `frugal` không bao giờ được bật.
- `illiquid` bị đặt về 0 lúc tự lập và không bao giờ tăng lại. Vì vậy câu "chủ nợ siết nhà đất" gần như rỗng.
- Các lựa chọn `buy_status_asset`, `live_below_means`, `deleverage` có trong `tickChoices` nhưng không hiện ra cho người chơi.

**Thành công khi:**
1. Người chơi có đủ 4 kiểu quyết định tiền (mức sống, tài sản, chi cho người, đầu tư). Các quyết định này đến qua thẻ tình huống và qua ô gõ.
2. Tài sản là những món có tên, ví dụ "căn nhà ở quê" hay "chiếc xe máy". Mỗi món có giá trị, lên xuống theo kinh tế, có thể bán, bị siết, để lại thừa kế, và mở thêm chuyện.
3. Tiền chi cho người khác để lại dấu trong lòng tin, ký ức và lời hứa. Cho vay là một trò chơi lặp lại với NPC.
4. Không cày tiền được: mua rồi bán luôn thì lỗ, mọi con số đều có trần, vay thì bị giới hạn theo khả năng trả.
5. Lỗi 0, kẹt 0, chơi lại khớp. Các test hiện có vẫn qua.

## 2. Quyết định đã chốt với Tùng

| Câu hỏi | Chốt |
|---|---|
| Phạm vi bản đầu | Cả 4 mảng: mức sống, tài sản, chi cho người, đầu tư |
| Chỗ dùng tiền | **Chỉ qua thẻ tình huống và ô "Tôi muốn…"**. Không thêm bảng điều khiển hay nút mới |
| Tài sản | **Món có tên**, mỗi món có giá trị và thẻ riêng |
| Đơn vị | Giữ "số năm thu nhập hộ" như hiệu ứng `money` hiện có |

## 3. Người chơi thấy gì

- Không có nút mới. Tiền xuất hiện qua:
  - **thẻ tiền**: một gói thẻ mới (§6). Thẻ hiện theo hoàn cảnh, ví dụ dư tiền thì có thẻ mời mua nhà, bạn thân thì có thẻ hỏi vay, kinh tế khủng hoảng thì có thẻ bán tháo;
  - **ô gõ**: gõ "mua căn hộ trả góp", "bán xe", "gửi tiết kiệm 1 năm lương", "sống tằn tiện lại", "cho bố 5 triệu mỗi tháng". AI xử lý theo các việc lớn mới (§7).
- Bảng nhân vật có thêm mục **"Của cải"** để xem, không bấm được:
  - từng món tài sản kèm giá trị hiện tại;
  - khoản nợ;
  - tiền gửi;
  - bảo hiểm;
  - ai đang nợ mình;
  - mức sống hiện tại.
- Nhật ký năm có thêm dòng tiền. Ví dụ "Giá đất lên, mảnh vườn giờ đáng 2,3 năm lương", hoặc "Hưng trả được nửa số nợ".
- Phần kết đời có thêm mục **"Bạn để lại gì"**: tài sản, ai nhận, món mua lời nhất và món lỗ nhất.

## 4. Mô hình dữ liệu (engine, TypeScript strict)

Module mới `src/engine/economy/Holdings.ts`. Thuần, không phụ thuộc giao diện, chạy headless được.

```ts
type AssetKind = "house" | "land" | "vehicle" | "shop" | "gold" | "deposit" | "stake";
interface Asset {
  id: string; kind: AssetKind; name: string;      // "căn nhà ở quê"
  value: number;                                    // CU, giá thị trường hiện tại
  cost: number; bought_age: number;
  financed: number;                                 // phần vay lúc mua (nằm trong debt chung)
  yield: number;                                    // thu nhập/năm, tỉ lệ trên value (cho thuê, lãi, cổ tức)
  upkeep: number;                                   // chi giữ/năm, tỉ lệ trên value (sửa chữa, xăng, thuế)
  co_owner?: string;                                // id NPC nếu góp chung
  insured?: boolean;
}
type Lifestyle = "tan_tien" | "vua_phai" | "thoai_mai" | "pho_truong";
interface Receivable { npc: string; amount: number; lent_age: number; due_age: number; repaid: number; }
interface Policy { kind: "health" | "property"; premium: number; cover: number; }
interface Holdings { assets: Asset[]; lifestyle: Lifestyle; receivables: Receivable[]; policies: Policy[]; }
```

- `capitalAssets.illiquid` không còn là con số tự do. Nó là **tổng giá trị** các tài sản không phải `deposit`, được tính lại mỗi năm. Như vậy mã cũ đọc `illiquid` vẫn đúng.
- Nợ vẫn là một khoản chung (`debt`). `financed` chỉ để ghi lại món nào được mua bằng tiền vay, phục vụ thứ tự siết nợ và lời kể.

## 5. Luật kinh tế

### 5.1 Mức sống
- Thay `frugal: boolean` bằng `lifestyle`. Hệ số nhân lên `lifestyleSpend`: tằn tiện 0,35 · vừa phải 0,7 · thoải mái 1,0 · phô trương 1,5.
- Mặc định lúc tự lập: chọn theo độ nhạy dopamine (giữ hành vi cũ khi người chơi không động vào).
- Tác động mỗi năm:

| Mức sống | Tác động |
|---|---|
| Tằn tiện | Hạnh phúc −, quan hệ − (ít đi đám, ít mời), căng thẳng + nếu kéo dài trên 5 năm |
| Thoải mái | Hạnh phúc + |
| Phô trương | Hạnh phúc +; tiếng tăm + ở nước có lòng tin thể chế thấp (tín hiệu, dùng `Signaling.ts`); kéo thêm thẻ người hỏi vay, người rủ làm ăn, kẻ lừa đảo |

### 5.2 Tài sản
- **Giá mua** tính bằng năm thu nhập, theo loại và theo nhóm GDP của nước. Bảng giá nằm trong `Holdings.ts`, kèm ghi chú nguồn.
  - Nhà: dùng tỉ lệ giá nhà trên thu nhập của từng nước. **Cần chốt nguồn số liệu** trước khi code, không dùng số bịa.
- **Định giá lại mỗi năm**: nhân với `asset_multiplier` của cú sốc vĩ mô có sẵn, cộng xu hướng riêng theo loại.
  - Xe mất giá khoảng 12%/năm.
  - Đất và nhà theo pha kinh tế.
  - Vàng dao động mạnh, ngược pha khủng hoảng.
  - Tiền gửi giữ nguyên giá.
- **Dòng tiền mỗi năm**: `yield − upkeep`, cộng vào tiền mặt.
  - Nhà cho thuê và cửa hàng có `yield` > 0.
  - Xe có `upkeep` cao.
- **Bán**: nhận `value × (1 − haircut)`. Haircut: nhà và đất 8%, xe 15%, cửa hàng 25%, vàng 3%, cổ phần góp vốn 40%. Vì vậy mua xong bán luôn luôn lỗ.
- **Vay mua**: chỉ cho vay nếu tỉ lệ trả nợ sau khi vay ≤ 40% thu nhập (cùng ngưỡng với Rat Race).
  - Nước có lòng tin thể chế thấp thì phải trả trước nhiều hơn: tối thiểu 50%, so với 20% ở nước có lòng tin cao.
- **Vỡ nợ**: thay luật "siết hết `illiquid`" bằng siết theo thứ tự cho đến khi đủ: cổ phần → vàng → xe → cửa hàng → đất → nhà.
  - Mỗi món bị siết có một dòng nhật ký riêng.
  - Mất nhà để lại cờ `lost_home`.

### 5.3 Chi cho người
- **Cho/biếu**: tiền đi ra; lòng tin +; ký ức `HELPED_IN_CRISIS` nếu người đó đang khó khăn.
- **Cho vay** (`Receivable`): mỗi năm NPC quyết định trả hay quỵt, theo nguyên mẫu và `InteractionResolver`.
  - Giữ trụ cột thiết kế: ở môi trường lòng tin thấp, quỵt một lần có lợi hơn hợp tác.
  - Trả đúng hạn thì lòng tin hai chiều tăng và mở cửa làm ăn chung. Quỵt thì ký ức `CHEATED_ME`. Đòi gắt thì mất quan hệ.
- **Phụng dưỡng và nuôi con**: hiện `dependentCosts` tự trừ tiền. Thêm mức chi mà người chơi chọn qua thẻ (ít / đủ / hậu hĩnh). Mức chi nhân lên `frac` và đổi lòng tin, sức khỏe của bố mẹ, việc học của con.
  - Chi "ít" cho bố mẹ ốm nặng dẫn tới cánh cửa đóng `family_table`, đúng với cơ chế cửa đời hiện có.

### 5.4 Đầu tư
- **Gửi tiết kiệm**: tài sản `deposit`, lãi = `interest_rate` của nước × 0,6.
  - Ở nước có lòng tin thể chế thấp, trong pha khủng hoảng có xác suất nhỏ ngân hàng đổ, mất một phần tiền gửi.
- **Góp vốn** (`stake`): đi qua `dealChoices` và ma trận thắng thua có sẵn, với NPC làm `co_owner`. Lời lỗ mỗi năm do kết quả hợp tác hay phản bội.
- **Bảo hiểm**:
  - Bảo hiểm sức khỏe trả `cover` phần chi phí của sự kiện ốm (`ill` trong `index.html`).
  - Bảo hiểm tài sản trả khi gặp thẻ thiên tai hoặc hỏa hoạn.
  - Phí đóng mỗi năm. Ở nước nghèo, tỉ lệ có bảo hiểm và mức chi trả thấp hơn.

## 6. Thẻ tiền (nội dung)

### 6.1 Hiệu ứng mới cho storylet
Thêm vào schema, được `kit.ts` và `applyEffect` hiểu. Viết theo đúng quy ước trong `content-guide.md`:

| Hiệu ứng | Ý nghĩa |
|---|---|
| `buy: { kind, name, price, financed? }` | `price` tính bằng năm thu nhập; engine kẹp theo bảng giá ±30% |
| `sell: { kind? , name? }` | Bán món đầu tiên khớp |
| `lifestyle: Lifestyle` | Đổi mức sống |
| `deposit: x`, `withdraw: x` | Gửi hoặc rút, tính bằng năm thu nhập |
| `lend: { npc, amount, years }` | Cho vay |
| `give: { npc, amount }` | Cho hoặc biếu |
| `insure: "health" \| "property"` | Mua bảo hiểm |
| `support: { role, level }` | Mức chi cho bố mẹ hoặc con |

- Bối cảnh `c` đọc thêm: `owns` (Set các loại tài sản), `assets_value`, `lifestyle`, `insured`, `owed_to_me`, `home_owner`.

### 6.2 Gói thẻ `money_pack.ts`, khoảng 48 thẻ
- Mức sống: 8 thẻ. Ví dụ: lương tăng có nên nâng đời sống; cưới xong hai người tiêu khác nhau; con cái so bì với bạn; về hưu.
- Tài sản: 16 thẻ. Ví dụ:
  - xe đầu tiên, mới hay cũ;
  - căn hộ đầu tiên, trả góp 20 năm;
  - đất ven đô đang sốt;
  - bán tháo lúc khủng hoảng;
  - cho thuê nhà, khách thuê quỵt;
  - nhà dột;
  - nhà của bố mẹ (nối thẻ có sẵn ở dòng 3836);
  - giải tỏa, bồi thường.
- Chi cho người: 14 thẻ. Ví dụ:
  - bạn thân hỏi vay;
  - em cưới thiếu tiền;
  - đòi nợ người quen;
  - bố mẹ ốm, chọn mức chi;
  - con đòi du học;
  - góp tiền đám.
- Đầu tư: 10 thẻ. Ví dụ:
  - người quen mời góp vốn;
  - người bán bảo hiểm;
  - ngân hàng đồn sắp đổ;
  - vàng tăng giá;
  - hụi hoặc chơi họ (chỉ hiện khi `country === "VN"`; ở nước khác là hội góp vốn xoay vòng).

Gói thẻ theo đúng `content-guide.md`:
- mỗi lựa chọn là một đánh đổi;
- có lựa chọn `sovereign` thoát khung, ví dụ góp vốn có hợp đồng công khai;
- lừa đảo tài chính chỉ tả hậu quả, không tả cách làm.

## 7. Ô "Tôi muốn…"

- Thêm vào `BIG_ACTIONS`:
  - `mua` {loai, ten, gia};
  - `ban` {ten};
  - `muc_song` {muc};
  - `gui_tiet_kiem` / `rut` {so};
  - `bao_hiem` {loai};
  - `cho_vay` / `cho` {id, so};
  - `chu_cap` {vai, muc}.
- `sanitizeAct` kiểm từng việc:
  - giá nằm trong bảng ±30%;
  - đủ tiền, hoặc đủ điều kiện vay theo §5.2;
  - tài sản đem bán phải có thật;
  - người nhận phải còn sống.
  - Sai thì AI phải kể "không làm được" kèm lý do. Engine không tự sửa con số.
- Gói gửi AI thêm trường `cua_cai`: tài sản, nợ, tiền gửi, mức sống, ai nợ mình.
- Trần `money` ±3 năm thu nhập mỗi năm của ô gõ vẫn giữ nguyên. Mua và bán tài sản **không** tính vào trần này, vì tiền chỉ đổi dạng chứ không sinh ra thêm. Nhưng nhờ haircut nên không lách để cày tiền được.

## 8. Tự chơi (auto)

- Mức sống giữ mặc định theo dopamine.
- Với thẻ tiền, `autoChoice` chọn như cũ, theo tính khí và bộ đếm.
- Không gõ.

## 9. Nhân quả và tua lại đời
- Mọi thay đổi tiền đi qua `applyEffect`, nên `actLog` tua lại khớp.
- `Holdings` nằm trong trạng thái Argon, được snapshot cùng `state`.
- Bản đồ nhân quả: mua, bán, cho vay đều có `prov`. Ví dụ "mất nhà ← vay mua đất năm 34 tuổi ← khủng hoảng năm 37".

## 10. Kiểm thử
- `src/holdings-test.ts`: định giá, haircut, thứ tự siết nợ, điều kiện vay, NPC trả hay quỵt theo lòng tin, ngân hàng đổ chỉ xảy ra ở pha khủng hoảng.
- `doi-nguoi/tests/money-test.js`, chạy 500 đời:
  - không có NaN, tài sản không âm;
  - tỉ lệ sở hữu nhà ở tuổi 40 theo nhóm nước nằm trong khoảng hợp lý (chốt khoảng khi có nguồn số liệu);
  - tỉ lệ vỡ nợ không tăng quá 1,5 lần so với hiện tại;
  - phân phối tài sản lúc chết.
- Thử chống cày tiền: chạy 1.000 vòng mua bán liên tục, tài sản ròng phải giảm.
- Chạy đủ bộ test hiện có: micro, repeat, path, agency-host, review-fixes.
- Câu thử với AI thật:
  - "mua căn hộ trả góp";
  - "bán hết đất đi Úc";
  - "cho thằng bạn vay 2 năm lương";
  - "sống tằn tiện để dành tiền cho con du học";
  - "mua bảo hiểm cho cả nhà";
  - "gửi hết tiền vào ngân hàng" (ở nước lòng tin thấp lúc khủng hoảng);
  - "mua siêu xe" khi đang nghèo (phải ra "không làm được").

## 11. Thứ tự làm
1. Engine: `Holdings.ts`, mức sống, định giá, siết nợ theo thứ tự, cho vay NPC; viết test.
2. Bridge và host: đồng bộ `illiquid`, dòng tiền tài sản, vỡ nợ, thừa kế, mục "Của cải" trong bảng nhân vật, mục "Bạn để lại gì".
3. Hiệu ứng storylet mới trong `kit.ts` và `applyEffect`; cập nhật `content-guide.md`.
4. Gói `money_pack.ts`.
5. Ô gõ: các việc lớn mới, `sanitizeAct`, prompt.
6. Cân bằng số liệu, chạy toàn bộ test, đăng lên trang game theo quy trình trong README.

## 12. Còn mở
- Nguồn số liệu cho tỉ lệ giá nhà trên thu nhập và tỉ lệ sở hữu nhà theo nước.
- Mục "Của cải" chỉ để xem. Nếu sau này muốn bấm được, đó là thay đổi riêng.
- Tài sản của bố mẹ có cần là món có tên ngay từ đầu đời (nhà của gia đình), để thừa kế đi qua chính món đó, hay vẫn đi qua thẻ có sẵn.

## 13. Rủi ro
- **Hai luồng tiền lệch nhau** (`L.savings` của host và sổ Argon): mọi thay đổi tài sản phải đi qua một hàm duy nhất trong bridge, sau đó gọi `syncFromArgon`.
- **Thẻ tiền lấn thẻ đời**: giới hạn tối đa 1 thẻ tiền mỗi năm, và chỉ khi năm đó chưa có thẻ con đường đời.
- **Tiền thành mục tiêu duy nhất**: thẻ phải cho thấy cái giá phi tiền bạc (quan hệ, sức khỏe, thời gian), đúng tinh thần "mỗi lựa chọn là một đánh đổi".
