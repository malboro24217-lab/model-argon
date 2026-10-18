# Bước ngoặt + hệ thống đời sống — thiết kế cho Codex

Bản mẫu nằm trong `scratchpad/fate/repo/` (bản sao repo ngày 18/10, đã gồm giai đoạn 0 và giai đoạn 1 đang làm dở). Repo thật chưa bị sửa.

## A. Bước ngoặt: đã dựng và đo được

**Đã có:**
- `Fate.ts`: `fate()`, `echo()`, `cliff()`, `shadowLine()`, `fateSlot()`, `fateRoll()`, `FATE_PER_LIFE` (+ `setFatePerLife`).
- Thêm `FactContext.fate_seed` và `FactContext.nemesis`.
- `meta.kind` có thêm `"fate"` và `tier`.
- **Host (`living.js`):**
  - `fateScene`: chọn thẻ theo chỗ, tối đa 1/năm, chạy trước thẻ nhỏ, chiếm một suất ngân sách.
  - `castQuirks`: tật cố định của dàn nhân vật (sitcom).
  - `setNemesis`: kẻ thù truyền kiếp, sinh ra từ ván bị phản hoặc từ `role: rival`.
  - `bondAfterRound`: lần thứ 3 lộ tính người ấy.
  - `RNG_SUB.fate = 9`.
- `fate_pack.ts`: 60 thẻ mẫu (34 lớn: drama và sitcom; 11 vừa; 5 ván người quen lặp 4 lần/đời) và 5 echo.
  - Thẻ mẫu đáng xem: `ft_mine`, `ft_partner_mask` (drama); `ft_tet_tables`, `ft_stamp`, `ft_moto_gag` (sitcom, gag lặp lại).
- **Công cụ:** `divergence.js` (độ rẽ nhánh), `measure/forks.js` (đếm năm có biến động mức số phận), `measure/balance.js` (phân phối kinh tế).

**Đo (bản sao repo):**

| | Trước | Bản mẫu (60 thẻ) |
|---|---|---|
| Năm có biến động mức số phận / đời (đổi nước, con đường, hôn nhân, dàn, tài sản ≥1 năm thu nhập, sức khỏe ≥15, cửa) | 19,8 (do thẻ gây ra: 18) | — |
| Thẻ bước ngoặt / đời | 0 | 34,3 (`FATE_PER_LIFE` = 50) |
| Ván tù nhân / đời | 0,5 | **8,9** |
| Đời có kẻ thù truyền kiếp | 0 | 89% |
| Quyết định / đời (trung vị) | 125 | 143 (vượt mục tiêu 120–130) |
| Phá sản | 57% | **79%** (gói mẫu quá phạt) |
| Tài sản đỉnh p50 / p99 | 23k / 1,92M | 13k / 0,78M |
| corr(log tài sản đỉnh, log GDP nơi sinh) | 0,61 | 0,56 |
| Tuổi chết p10 / p50 / p90 | 33 / 69 / 89 | 34 / 68 / 89 |
| Tua lại (replay-test, 40 đời) | PASS | PASS (0 lệch do vẽ, 0 lệch khi tua, 0 lỗi đời giả định) |

**Độ rẽ nhánh** (`divergence.js`, 50 đời, 192 ngã rẽ):

| Hạng | Trung vị thẻ về sau khác | Chuẩn |
|---|---|---|
| Lớn | 10% (p75 23%) | 70% |
| Vừa | 0% | 40% |

Ngoài ra Δ tiền ròng p50 bằng 1,1 năm thu nhập, Δ tuổi chết p50 bằng 0.

**Kết luận đo:** cơ chế chạy được (tất định, không làm hỏng tua lại, ván người quen đã thật sự được chơi), nhưng nội dung mẫu **chưa đạt chuẩn rẽ nhánh**. Nguyên nhân cấu trúc: từ khi rng được tách theo năm, cờ không ai đọc không còn gây hiệu ứng cánh bướm. Muốn đạt 70% thì mỗi bước ngoặt lớn phải mở một **chuỗi thẻ gate trên cờ của nó**, hoặc đổi những thứ cả kho đọc (con đường, nước, hôn nhân, nghề). Chi tiết ở `AUTHORING.md` §4.

**Chuẩn 70% có thể không thực tế.** Phần đời sau một ngã rẽ vẫn đầy thẻ chung (trường học, tuổi già, tiền), nên đạt được thì cần chuỗi dài. Đề nghị đo song song thêm "≥ 2 trong 3 thứ: thẻ về sau khác ≥ 50%, Δ tiền ≥ 1 năm thu nhập, Δ con đường/cửa ≥ 1" làm chuẩn thay thế, để chủ game chọn.

**Đã thiết kế, chưa dựng (cho Codex làm nội dung):**
- **Cú đánh lớn** (2–3/đời): thẻ lớn spec 8, gate `fateRoll(c,"big"+n) < p`, cược tất tay bằng `gamble` với tỉ lệ thật (5–30%) và `money` ±3..20. Đây là nguồn của đuôi lũy thừa.
- **Kết đời có tên** (~30): một hàm thuần `endingOf(L)` đọc cờ, bộ đếm, kẻ thù truyền kiếp và tài sản, trả về `{id, vi, desc}`. Độ hiếm đo offline bằng 3.000 đời và nhúng thành JSON. Bộ sưu tập lưu trong META (localStorage) như codex.

## B. Tám hệ thống ưu tiên (thứ thẻ đọc và ghi)

Quy tắc chung:
- Mọi trạng thái nằm trên `L` hoặc `L.lw`.
- Mọi lượt rút đi qua luồng của năm: `L.r` (host), `L.ar.rng` (người), hoặc `fateRoll`.
- Mọi thao tác người chơi đi qua `choices` / `uiOp`, nên tua lại khớp.
- Thêm `SIM_VERSION` mới khi bật hệ thống.
- Công sức: S < 1 ngày, M 1–3 ngày, L > 3 ngày.

### 1. Tính cách (M)
- **Dữ liệu:** `L.traits3: TraitId[]` (đúng 3, chọn lúc chào đời hoặc rút từ luồng tạo đời). `TraitId` ∈ `hau_dau, me_tin, si_dien, keo_kiet, lang_man, nong_tinh, luoi, tham_an, ca_ne, lieu`. Giữ các cờ `temper_*` cũ (map sang tính cách).
- **FactContext:** `traits3: Set<TraitId>`; cờ `tr_<id>` cũng có trong `c.flags`.
- **Engine:** `narrative/Traits.ts` gồm `TRAITS` (mô tả, hệ số) và `traitOdds(c, key)`. Matcher nhân `specificity` +1 với thẻ có `meta.traits` khớp. `fateRoll` nhân xác suất theo bảng.
- **Tất định:** chọn lúc chào đời (ghi vào `choices` nếu người chơi chọn).

### 3. Tâm trạng có tên (M)
- **Dữ liệu:**
  ```ts
  L.lw.moods: Mood[]
  Mood { id: string; vi: string; npc?: string; valence: -2..2; until: number /*tuổi*/; from_mark?: string }
  ```
  Ví dụ: `{id:"shamed_pond", vi:"Ngượng vì clip ao", valence:-1, until: age+2}`, `{id:"grudge", npc, vi:"Cay cú Tư", valence:-2, until:age+5}`.
- **Effect mới:** `mood: { id, vi, years, valence, npc? }`, `unmood: id`.
- **FactContext:** `moods: Record<string, {valence, years_left, npc?}>`, `mood_sum: number`.
- **Gate:** lựa chọn có `requires_mood?: string` hoặc `dim_if_mood?: string`. Host đặt `locked` giống `choiceState`.
- **Tất định:** thuần, hết hạn theo tuổi.

### 4. Sáu kỹ năng (M)
- **Dữ liệu:** `L.skills: { nau_an, an_noi, sua_chua, nhau, mac_ca, hat }` (0–10).
- **Tăng:**
  - trọng tâm năm: study +0.5 cho `an_noi`; work +0.3 cho kỹ năng của họ nghề;
  - Effect mới `skill: { k: delta }`;
  - nghề (bảng họ nghề → kỹ năng).
- `know` giữ nguyên làm chỉ số tổng.
- **FactContext:** `skills: Record<SkillId, number>`.
- **Gate:** `when: c => c.skills.mac_ca >= 4`. Một lựa chọn có thể đổi `gamble.p` theo kỹ năng qua helper `skillP(c, "an_noi", base)`.

### 7. Cái chết ngớ ngẩn (S) + 8. Thần Chết mặc cả (M)
- **7:** `die()` đã chọn nguyên nhân bằng `L.r`. Thêm bảng `ABSURD_DEATHS` (~20 mục `{id, vi, w, when?}`), rút với xác suất 1–2% thay nguyên nhân thường khi tuổi > 15. Ghi `L.cause` và `L.absurdDeath = id`. Bộ sưu tập lưu trong META.
- **8:** trước `die()` (chết do lượt rút tuổi già hoặc bệnh, không phải tai nạn), host dựng một scene `id:"reaper"`, key `reaper@age`, 3–4 lựa chọn:
  - đổi 5 năm lấy một tài sản (`sell`);
  - đổi lấy một người (`trust −0.5` với người thân nhất, `close_doors: family_table`);
  - đổi lấy một bí mật (`custom: confess_hook`);
  - từ chối.

  Chọn mặc cả thì `L.alive` giữ nguyên, `deathShield = age + 5`, và `deathQ` trả 0 cho đến hạn đó. Tối đa 1 lần/đời.
  - **Tất định:** là một lựa chọn bình thường, ghi vào `choices`. Lượt rút sống/chết của năm đã xảy ra trước, theo luồng host.
  - **Lưu ý:** lặp vòng chết làm tuổi chết dịch đi, nên phải đo lại phân phối.

### 11. Mạng lưới đồn đại (M)
- **Dữ liệu:**
  ```ts
  L.lw.rumors: Rumor[]
  Rumor { id; about: "player" | npcId; text_key: string; valence: -1|1; holders: string[]; born_age: number; strength: 0..1 }
  ```
- **Lan truyền:** mỗi năm, trên luồng `L.ar.rng`, dùng lại cạnh tin của `SocialLedger`: người giữ tin lan sang người hàng xóm có trust > 0 với xác suất `strength · trust`. Một nút "trung tâm" (hàng xóm có tật `knows`, hoặc một hộ trong xóm có cờ `hub`) lan gấp đôi.
- **Effect mới:** `rumor: { key, valence, about?, strength }`.
- **FactContext:**
  - `rumors_about_me: { key, valence, reach: số người biết }[]`;
  - `rumor_reached: Record<role, string[]>` (vai nào đã nghe chuyện gì).
- **Gate:** thẻ nổ khi lời đồn đến tai một vai cụ thể. Ví dụ: mẹ vợ nghe chuyện ở ao.
- `leakSecrets` giữ nguyên. Bí mật là một loại lời đồn có `strength` cao.

### 12. Xóm có tên (L)
- **Dữ liệu:**
  ```ts
  L.lw.hood: Household[] /* 8 hộ */
  Household { id; name: "nhà bà Lan"; head: npcId; members: npcId[]; wealth: 0..1; quirk: string; status: "ok"|"rich"|"ruined"|"moved"|"gone" }
  ```
  - Mỗi hộ có 1–3 thành viên NPC (Cast mở rộng với vai `neighbor`).
  - Tạo lúc chào đời bằng luồng tạo đời.
  - Mỗi 5 năm, trên luồng npc, hộ già đi, cưới, chết, giàu lên, sa sút: bảng chuyển trạng thái giống pha kinh tế.
  - Có thể thành thông gia (hôn nhân của con, `role: spouse` nối với một hộ) hoặc thành kẻ thù.
- **FactContext:** `hood: { id, name, status, opinion, head_role }[]` và `hood_by_status: Record<status, id[]>`.
- **Hiển thị:** tab "Xóm".
- **Công sức lớn:** đụng `Cast`, `ageCast` và giao diện. Nên làm sau 1, 3, 4, 7, 8.

### 14. Tự làm bậy khi không ai coi (M)
- **Kích hoạt:** đồng hồ đang chạy, `mood_sum ≤ -2`, có tính cách `nong_tinh`/`luoi`/`lieu`, và `fateRoll(c,"bay") < p`.
  - Host đặt `L.pending` là scene `id:"unsup"`, key `unsup@age`, có bộ đếm 8 giây.
  - Người chơi bấm "Can" (tốn băng thông) hoặc để hết giờ: nhân vật tự làm (nhậu, đập xe, nhắn người yêu cũ). Hiệu ứng là thẻ con theo tính cách và tâm trạng.
- **Tất định:** hết giờ bằng `resolve(L, defIndex)`, nên được ghi vào `choices` như bộ đếm giờ băng thông hiện có. Tua lại dùng script.
- **FactContext:** `unsup_count`.

### Bảy hệ thống theo sau (thiết kế ngắn)
| # | Hệ thống | Thiết kế ngắn | Công sức |
|---|---|---|---|
| 2 | Ước nguyện lớn + ước muốn nhỏ | `L.wishes: {id, from, until, done}[]`; hoàn thành → `META.points`; tiêu điểm vào perk kiếp sau. Thay thứ tự cố định của `PERKS`. | M |
| 5 | Thẻ may rủi trong nghề | 2–4 thẻ fate "vừa" mỗi họ nghề, gate `job_<fam>`, `income_mult` 0.8/1.25. | S, nội dung |
| 6 | Nâng cấp nhà | Thêm `Asset.rooms: string[]`; Effect `upgrade: {room}`; mỗi phòng có `happy` nền và cờ `room_<x>` để thẻ đọc. | M |
| 9 | Ma | Thẻ fate gate trên cast đã chết (`c.dead_cast: role[]`), dùng ký ức mạnh nhất của người đó. | S |
| 10 | Thú cưng | Vai cast mới `pet`, tính cách = archetype rút gọn; thẻ đọc `role(c,"pet")`. | M |
| 13 | Sinh nhật mỗi 10 năm | Gộp với thẻ thập kỷ: ai đến = `opinion ≥ 0.3`; người không đến để lại tâm trạng. | S |
| 15 | Hội nhóm | `L.clubs: {id, members: npcId[], since}`; mỗi hội 3–5 thẻ fate gate `club_<id>`. | M |

## C. Thứ tự đề nghị
1. Codex viết nội dung theo `AUTHORING.md`, đo bằng `divergence.js` và `balance.js`.
2. Đồng thời dựng 1 → 3 → 4 → 7+8 → 11 → 14 (khoảng 8–10 ngày công).
3. Làm 12 (xóm) sau cùng trong nhóm ưu tiên.

Mỗi hệ thống thêm FactContext trước, để Codex gate thẻ được ngay cả khi phần mô phỏng còn đơn giản.
