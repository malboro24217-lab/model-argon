# Canon event và Mùa: kế hoạch triển khai

> **Cho agent thực thi:** BẮT BUỘC dùng superpowers:subagent-driven-development (khuyên dùng) hoặc superpowers:executing-plans để làm từng task. Các bước dùng checkbox (`- [ ]`).

**Mục tiêu:** Đời được kể như kịch bản.
- Áp lực từ lựa chọn tích theo 8 trục.
- Trục nào vượt ngưỡng thì sinh ra canon event, dựng từ chính những thứ người chơi đã gài.
- Mỗi cửa mở một Mùa có luật, màu, dàn nhân vật và kho thẻ riêng.
- Đổi 100% hoàn cảnh, mang theo 3 vết.
- Đợt A đủ 8 mầm, 5 khung mùa thường và 100 nhánh kỳ dị.

**Kiến trúc:** Lớp mới `argon/src/engine/narrative/canon/` (TypeScript, thuần dữ liệu và hàm, không đụng DOM). Host `doi-nguoi/canon.js` nối vào vòng năm (`livingYear`), `applyEffect` và `customEffect`. Thẻ mùa vào kho major, gate bằng `ctx.season`. Canon event sinh động mỗi lần, đi qua `scene()` như mọi thẻ, nên Causality, actLog và tua lại dùng lại được.

**Công nghệ:** TypeScript strict, bundle bằng esbuild thành `argon/dist/argon.iife.js`; JS host thuần; test bằng node (`--experimental-strip-types` cho engine, eval `.head.js` cho host).

**Spec:** `argon/docs/superpowers/specs/2026-10-18-canon-event-design.md`

## Ràng buộc chung
- Sau mỗi task đụng engine: bundle (lệnh trong README), chạy `python3 doi-nguoi/tests/build.py`, rồi chạy các test liệt kê trong task.
- Trước mỗi commit chạy đủ: micro, repeat, path, agency-host, review-fixes, money, readers, fork, replay.
- Tất định: không dùng `Math.random`, không đọc giờ thật. Rng của canon dùng `subSeed(seed, age, RNG_SUB.canon)`, với `RNG_SUB.canon = 9` thêm vào bảng ở `index.html` và `engine.js`.
- Tham số cố định (từ spec §3):

  | Hằng | Giá trị |
  |---|---|
  | `CANON_THRESHOLD` | 10 |
  | `CANON_GAP` | 8 |
  | `CANON_MAX` | 4 |
  | `CANON_AGES` | [8, 72] |
  | `FORCE_FIRST_AT` | 35 |
  | `FORCE_SECOND_AT` | 60 |
  | `DISCHARGE` | 8 |
  | `WEIRD_DOOR_AT` | 6 |

  Hệ số Độ điên: 0 / 1 / 2 (Đời thật / Phim / Điên), mặc định 1.
- Nội dung:
  - tiếng Việt, tự viết; không người thật, tổ chức thật hay thương hiệu thật; không tôn giáo cụ thể; không nội dung tình dục; phạm pháp chỉ tả hậu quả;
  - thẻ chính kiểu điện ảnh hoặc sitcom (theo `argon/docs/content-guide.md` §4–5).
- Ngân sách quyết định 120–130/đời. Phá sản không tăng quá +5 điểm so với main. `replay-test` khớp 100%.
- Commit kết thúc bằng hai dòng attribution của session (Co-Authored-By Claude Opus 5.5, Claude-Session).
- Mọi chuẩn đo "100% đời có ≥ 2 canon event" tính trên các đời sống tới ≥ 60 tuổi. Spec không nói rõ; chốt như vậy vì đời chết trẻ không thể có đủ.

## Trọng tâm review (đầu vào dễ hỏng mà spec không nói)
1. **Chết giữa mùa:** màn kết ghi mùa đó là "dang dở", không lỗi, không thiếu dòng. Test ở Task 8.
2. **Canon event mới nổ khi mùa cũ chưa hết:** mùa cũ phải bị cắt (gỡ hệ số thu nhập, gỡ cờ thế giới) trước khi vào mùa mới. Test ở Task 7.
3. **Canon event lúc còn là người phụ thuộc (8–17 tuổi):** reset không được xóa quỹ chung của gia đình, không đặt nghề. Test ở Task 7.
4. **Người mang vết đã chết hoặc rời dàn:** thẻ mùa vẫn ra chữ trọn vẹn (dùng nhãn dự phòng), không bao giờ còn `{` hay `undefined`. Test ở Task 4 (fuzz).
5. **Độ điên = 0:** không có cửa kỳ dị nào, kể cả khi trục Kỳ rất cao. Đổi Độ điên giữa đời thì tua lại vẫn khớp. Test ở Task 5 và Task 8.

---

### Task 1: Nhánh làm việc và ghép kho Codex

**Files:**
- Nhánh mới `canon-event` từ `main`; merge `origin/codex/200-turning-points` (5b7bca4).
- Giữ: `argon/src/engine/narrative/turning/*`, phần sửa hàng đợi trong `doi-nguoi/living.js`.
- Bỏ khỏi nhánh: thư mục `qa/turning-points/*.log` (log chạy máy, không phải mã).

- [ ] Bước 1: `git checkout -b canon-event main && git merge origin/codex/200-turning-points`. Có xung đột ở `argon.iife.js` hay `index.html` thì lấy bản nào cũng được, rồi bundle và build lại.
- [ ] Bước 2: `git rm -r --cached qa/turning-points/*.log` và thêm `qa/turning-points/*.log` vào `.gitignore`.
- [ ] Bước 3: chạy toàn bộ test trong Ràng buộc chung, cộng `turning-points-test.js`, `turning-sim-test.js`, `scheduled-followup-test.js`. Kỳ vọng: tất cả PASS (đã thử ghép, xem lịch sử session).
- [ ] Bước 4: commit "Ghép kho 200 bước ngoặt của Codex vào nhánh canon-event".

### Task 2: Kiểu dữ liệu và áp lực 8 trục

**Files:**
- Sửa: `argon/src/engine/narrative/types.ts`
- Tạo: `argon/src/engine/narrative/canon/Pressure.ts`, `argon/src/engine/narrative/canon/index.ts`
- Sửa: `argon/src/engine/narrative/index.ts` (export `* from "./canon/index.ts"`)
- Test: `argon/src/canon-test.ts` (file test chung của lớp canon; các task sau thêm khối test vào đây)

**Giao diện:**
- Produces (trong `types.ts`):
  ```ts
  export type Axis = "tien" | "tinh" | "mau" | "danh" | "luat" | "than" | "dat" | "ky";
  export type PlantKind = "debt" | "secret" | "person" | "object" | "promise" | "animal" | "place" | "skill";
  export interface Plant { kind: PlantKind; key: string; label: string; npc?: string; age: number; weight: number }
  // Effect thêm:
  pressure?: Partial<Record<Axis, number>>;
  plant?: { kind: PlantKind; key: string; label: string; npc?: string };
  // FactContext thêm:
  pressure: Record<Axis, number>; plants: Plant[]; season: string | null; season_beat: number;
  canon_n: number; last_canon_age: number; weird: 0 | 1 | 2; nemesis?: string;
  // Storylet.meta thêm: season?: string[]
  ```
- Produces (`Pressure.ts`):
  - `AXES: Axis[]` (theo thứ tự ở trên);
  - `AXIS_VN: Record<Axis, string>` (Tiền, Tình, Máu mủ, Danh, Luật, Thân xác, Đất, Kỳ);
  - `basePressure(b: { family_wealth: number; gdp: number; sibling: boolean; rural: boolean }): Record<Axis, number>`;
  - `pressureOf(e: Effect): Partial<Record<Axis, number>>`;
  - `dueAxis(c: FactContext): Axis | null`;
  - các hằng ở mục Ràng buộc chung.

- [ ] **Bước 1: viết test hỏng.** Khối `pressure` trong `canon-test.ts`:
  ```ts
  ok(eq(basePressure({ family_wealth: 0.1, gdp: 3000, sibling: true, rural: true }), { tien: 3, tinh: 0, mau: 1, danh: 0, luat: 0, than: 0, dat: 2, ky: 1 }), "nền nghèo nông thôn nước nghèo");
  ok(basePressure({ family_wealth: 0.8, gdp: 50000, sibling: false, rural: false }).mau === 3, "nhà giàu");
  ok(eq(pressureOf({ pressure: { danh: 2 }, money: -0.5 }), { danh: 2 }), "pressure khai báo thắng phần suy ra");
  ok(pressureOf({ money: -0.2 }).tien === 1 && pressureOf({ custom: "borrow:0.3" }).tien === 1, "mất tiền/vay → Tiền");
  ok(pressureOf({ secret: { tag: "PAID_BRIBE", severity: 0.5, fuse_years: [3, 9] } }).mau === 1, "bí mật → Máu mủ");
  ok(pressureOf({ custom: "migrate_now" }).dat === 1 && pressureOf({ health: -8 }).than === 1, "di cư → Đất, sức khỏe → Thân");
  ok(dueAxis(ctx({ age: 30, pressure: P({ tien: 11, tinh: 12 }) })) === "tinh", "trục cao nhất vượt ngưỡng");
  ok(dueAxis(ctx({ age: 30, last_canon_age: 25, pressure: P({ tien: 20 }) })) === null, "cách < 8 năm");
  ok(dueAxis(ctx({ age: 35, canon_n: 0, pressure: P({ dat: 3 }) })) === "dat", "ép nổ lần đầu ở 35");
  ok(dueAxis(ctx({ age: 60, canon_n: 1, last_canon_age: 40, pressure: P({ than: 2 }) })) === "than", "ép nổ lần hai ở 60");
  ok(dueAxis(ctx({ age: 40, canon_n: 4, pressure: P({ tien: 30 }) })) === null, "tối đa 4");
  ok(dueAxis(ctx({ age: 30, weird: 0, pressure: P({ ky: 40 }) })) === null, "Độ điên 0: Kỳ không nổ");
  ok(dueAxis(ctx({ age: 30, weird: 2, pressure: P({ ky: 6 }) })) === "ky", "Điên: Kỳ ×2");
  ```
  `ctx()` dựng từ `randomCtx` của `fuzz-ctx.ts` cộng các trường ghi đè; `P()` điền 0 cho trục thiếu. Thêm cả hai helper vào đầu `canon-test.ts`.
- [ ] **Bước 2:** `cd argon && node --experimental-strip-types src/canon-test.ts`. Kỳ vọng: FAIL (chưa có export).
- [ ] **Bước 3: cài đặt.**
  - `pressureOf` suy ra khi không khai báo:
    - `money ≤ -0.1`, `custom` chứa `borrow`, hay `gamble` → `tien +1`;
    - `memory.weight ≥ 0.2`, `custom` chứa `marry` hay `spouse_leave` → `tinh +1`;
    - `secret` → `mau +1`;
    - `close_doors` chứa `clean_record` → `luat +1`;
    - `health ≤ -5` → `than +1`;
    - `custom` chứa `migrate`, `move_city` hay `return_home` → `dat +1`;
    - cờ khớp `/viral|fame|noi_tieng/` → `danh +1`.
  - `dueAxis`:
    - Kỳ nhân hệ số `weird` trước khi so;
    - hòa thì lấy trục đứng trước trong `AXES`;
    - ép nổ ở 35 hoặc 60 chọn trục cao nhất, bỏ qua `ky` khi `weird = 0`.
  - `randomCtx` của `fuzz-ctx.ts` phải điền các trường mới (`pressure` toàn 0, `plants: []`, `season: null`, `season_beat: 0`, `canon_n: 0`, `last_canon_age: -99`, `weird: 1`).
- [ ] **Bước 4:** chạy lại test. Kỳ vọng: PASS. Chạy `npx tsc --noEmit`. Kỳ vọng: 0 lỗi. Host `factContext` (living.js) tạm điền giá trị mặc định cho các trường mới để bundle không vỡ.
- [ ] **Bước 5:** commit.

### Task 3: Vật gài và 3 vết

**Files:**
- Tạo: `argon/src/engine/narrative/canon/Plants.ts`, `argon/src/engine/narrative/canon/Scars.ts`
- Test: thêm khối `plants` và `scars` vào `argon/src/canon-test.ts`

**Giao diện:**
- Consumes: `Plant`, `PlantKind` (Task 2).
- Produces:
  ```ts
  strongestPlant(plants: Plant[], kinds: PlantKind[]): Plant | undefined   // weight cao nhất, hòa thì gài sớm hơn
  plantFlag(p: { kind: PlantKind; key: string }): string                    // "plant:<kind>:<key>"
  interface Scars { nguoi?: { npc: string; label: string }; do?: { key: string; label: string }; no?: { key: string; label: string } }
  pickScars(c: FactContext, plants: Plant[], promises: { to: string; what: string }[], names: (id: string) => string): Scars
  scarText(s: Scars, k: "nguoi" | "do" | "no", names: (id: string) => string, alive: (id: string) => boolean): string
  ```

- [ ] **Bước 1: viết test hỏng.**
  - `strongestPlant` chọn đúng `weight` cao nhất; hòa thì chọn `age` nhỏ hơn.
  - `pickScars`:
    - `nguoi` ưu tiên `c.nemesis` còn sống, rồi id có `|opinion|` lớn nhất;
    - `do` ưu tiên plant `object/skill/animal`, rồi `c.asset_names` đầu tiên, rồi chức danh nghề (`c.job`);
    - `no` ưu tiên plant `debt/promise`, rồi `promises[0]`, rồi `"món nợ ngân hàng"` khi `c.debt > 0`;
    - không có gì thì để trống trường.
  - `scarText(s, "nguoi", …)` với người đã chết trả `"một người cũ"`; trường trống trả `""`.
- [ ] **Bước 2:** chạy test. Kỳ vọng: FAIL.
- [ ] **Bước 3:** cài đặt hai file theo chữ ký trên.
- [ ] **Bước 4:** chạy test. Kỳ vọng: PASS. Chạy tsc: 0 lỗi.
- [ ] **Bước 5:** commit.

### Task 4: Khung Mùa, kit viết mùa và bộ kiểm nội dung

**Files:**
- Tạo: `argon/src/engine/narrative/canon/Season.ts`, `argon/src/engine/narrative/canon/kit.ts`
- Tạo: `argon/src/canon-content-test.ts`. Kiểm mọi mầm, mùa và nhánh đăng ký trong `CANON_SEEDS`, `SEASONS`, `WEIRD`. Ở task này chạy trên một mùa mẫu `seasons/_fixture.ts`, xóa ở Task 6.

**Giao diện:**
- Produces:
  ```ts
  type BeatName = "mo_man" | "khoi_dong" | "cu_lat" | "day" | "chung_ket";   // chỉ số 0..4
  interface SeasonKit { N: (id: string) => string; scar: (k: "nguoi" | "do" | "no") => string; npc: (key: string) => string; noi: string; gag: () => string }
  interface BeatCard { id: string; build: (c: FactContext, k: SeasonKit) => StoryletView; when?: (c: FactContext) => boolean }
  interface NewCast { key: string; role: CastRole; label: string }       // label: "bà chủ trọ", tên do host đặt
  interface Landing { id: string; line: string; effects: Effect }
  interface SeasonDef {
    id: string; vn: string; color: string; years: [number, number]; weird?: "sf" | "abs";
    rules: { income?: number; yearly?: Effect; flags?: string[] };
    reset: { cash?: number; effects?: Effect; cast?: NewCast[] };
    beats: [BeatCard[], BeatCard[], BeatCard[], BeatCard[], BeatCard[]];
    gag: { key: string; lines: string[] };
    landings: Landing[];
  }
  seasonLength(def: SeasonDef, age: number, rngNext: number): number   // trong def.years, kết thúc ≤ 85 tuổi, tối thiểu 5
  beatGap(len: number): number                                          // max(1, round(len / 5))
  compileSeason(def: SeasonDef): Storylet[]                             // id "ss_<season>_<beat>_<i>", category "arc", urgency 85, specificity 9,
                                                                        // gate: c.season === def.id && c.season_beat === beat && c.counters.season_next <= c.age; meta.season = [def.id]
  isDurable(e: Effect): boolean   // có become:, migrate, move_city, marry, spouse_leave, have_child, buy/sell, income_mult ≥ 1.2 hoặc ≤ 0.8, |money| ≥ 1
  ```
  - kit.ts: `card(id, title, text: (c, k) => string, choices: Choice[])`, `land(id, line, effects)` (tự thêm `custom: "season_end"`), và lại `C`, `T` của `paths/kit.ts`.
  - Thẻ chung kết dùng `land` cho mọi lựa chọn.
  - Vết và người mới chỉ lấy qua `k`; host dựng `SeasonKit` (Task 7). Test dựng `SeasonKit` giả có `scar` trả `""` và tên dự phòng.

- [ ] **Bước 1: viết test hỏng.** Trong `canon-content-test.ts`, với mỗi `SeasonDef` đã đăng ký:
  - đủ 5 nhịp, nhịp nào cũng ≥ 1 thẻ;
  - tổng số thẻ: mùa kỳ dị 7–10, mùa thường 13–17;
  - mọi lựa chọn ở nhịp `chung_ket` có `isDurable(effects)` và có `custom` chứa `season_end`;
  - `gag.lines.length ≥ 3`; `landings.length ≥ 1`; id thẻ duy nhất trên toàn kho;
  - build mỗi thẻ với 200 `randomCtx` (seed cố định) và kit giả (một nửa số lần kit trả vết rỗng): title và text không rỗng, không chứa `{`, `}` hay `undefined`, mỗi thẻ có 2–3 lựa chọn;
  - `seasonLength` nằm trong `years`, kết thúc ≤ 85, ≥ 5; `beatGap(12) === 2`.
- [ ] **Bước 2:** `node --experimental-strip-types src/canon-content-test.ts`. Kỳ vọng: FAIL.
- [ ] **Bước 3:** cài `Season.ts`, `kit.ts` và mùa mẫu `_fixture.ts` (đủ ràng buộc mùa thường).
- [ ] **Bước 4:** chạy test. Kỳ vọng: PASS. Chạy tsc.
- [ ] **Bước 5:** commit.

### Task 5: Generator canon event

**Files:**
- Tạo: `argon/src/engine/narrative/canon/Canon.ts`
- Test: khối `canon` trong `argon/src/canon-test.ts`

**Giao diện:**
- Consumes: `dueAxis` và hằng (Task 2), `strongestPlant` (Task 3), `SeasonDef` (Task 4).
- Produces:
  ```ts
  type DoorKind = "doi_dau" | "bo_chay" | "thoa_hiep" | "lat_ban" | "nhan_toi" | "tra_dua" | "buong" | "danh_cuoc";
  interface Slots { who?: string; what?: Plant | { kind: "asset"; key: AssetKind; label: string }; noi: string; fromPlayer: number }
  interface SeedDoor { kind: DoorKind; label: (s: Slots, c: FactContext, N: (id: string) => string) => string; hint: string; season: string;
                       when?: (c: FactContext, s: Slots) => boolean; effects?: (c: FactContext, s: Slots) => Effect }
  interface CanonSeed { id: string; axes: Axis[]; ages?: [number, number];
                        who?: { roles?: CastRole[]; plants?: PlantKind[]; required: boolean };
                        what?: { plants?: PlantKind[]; owns?: AssetKind[]; required: boolean };
                        title: (s: Slots, c: FactContext, N: (id: string) => string) => string;
                        text: (s: Slots, c: FactContext, N: (id: string) => string) => string;
                        doors: SeedDoor[] }
  interface WeirdBranch { id: string; kind: "sf" | "abs"; axes: Axis[]; when: (c: FactContext, s: Slots) => boolean;
                          door: (s: Slots, c: FactContext, N: (id: string) => string) => string;     // nhãn cửa
                          trigger: (s: Slots, c: FactContext, N: (id: string) => string) => { title: string; text: string };  // khi cả 3 cửa kỳ dị
                          season: SeasonDef }
  interface ResolvedDoor { kind: DoorKind | "ky"; label: string; hint: string; season: string; weird?: string; effects?: Effect }
  interface CanonEvent { id: string; seed: string; axis: Axis; age: number; slots: Slots; title: string; text: string; doors: ResolvedDoor[] }
  fillSlots(seed: CanonSeed, c: FactContext, plants: Plant[]): Slots | null
  generateCanon(c: FactContext, axis: Axis, plants: Plant[], rng: Rng, N: (id: string) => string, seeds: CanonSeed[], weird: WeirdBranch[]): CanonEvent | null
  canonView(ev: CanonEvent): StoryletView
  ```
- Quy tắc lấy từ spec §4:
  - Thứ tự điền chỗ trống:
    1. plant của người chơi đúng loại (`fromPlayer++`);
    2. `c.nemesis` (với `who`);
    3. NPC trong `who.roles` có `|opinion|` lớn nhất;
    4. tài sản `c.asset_names[owns]`;
    5. thiếu chỗ trống bắt buộc thì loại mầm.
  - `noi`: tên nước/thành phố host đưa qua `N("place")`.
  - Điểm mầm = `3 × fromPlayer + Σ c.pressure[axes] − (đã dùng ? 100 : 0)`; "đã dùng" khi cờ `canon_<seed>` có trong `c.flags`. Hòa thì rút bằng `rng`.
  - Axis `ky`: không dùng mầm. Chọn 1 `WeirdBranch` khả thi làm trigger; 3 cửa là 3 nhánh kỳ dị khả thi, nhánh trigger là cửa đầu.
  - Cửa thường:
    - lọc `when`, xáo bằng `rng`, lấy 3 cửa khác `kind`;
    - thiếu thì bù bằng `GENERIC_DOORS` (một cửa cho mỗi kind, dẫn tới mùa `lam_lai`);
    - khi `weird > 0` và `c.pressure.ky × weird ≥ 6`: thay cửa thứ 3 bằng 1 nhánh kỳ dị khả thi, ưu tiên nhánh có `axes` chứa `axis`.
  - Effects của lựa chọn trong `canonView`: `{ custom: "canon:<axis>|season:<seasonId>", flags: ["canon_<seed>", "canon_door_<kind>"], ...door.effects }`; cửa kỳ dị thêm cờ `weird_<branchId>`.

- [ ] **Bước 1: viết test hỏng.** Dùng một mầm mẫu và hai nhánh kỳ dị mẫu (trong file test):
  - **Tất định:** cùng ctx và cùng rng seed thì `JSON.stringify(ev)` giống nhau.
  - **Chỗ trống từ người chơi:** ctx có plant `debt` thì `ev.slots.what.kind === "debt"` và `fromPlayer ≥ 1`.
  - **Mầm bắt buộc thiếu chỗ** → không được chọn. Không mầm nào khả thi → trả `null`.
  - **Đúng 3 cửa, `kind` không trùng.**
  - **Kỳ dị:** `weird: 0` với `pressure.ky = 50` → không cửa nào có `weird`; `weird: 1` với `ky = 6` → đúng 1 cửa có `weird`; axis `ky` → cả 3 cửa có `weird`.
  - **`canonView`:** mọi lựa chọn có `custom` bắt đầu bằng `canon:`.
- [ ] **Bước 2:** chạy test. Kỳ vọng: FAIL.
- [ ] **Bước 3:** cài `Canon.ts`.
- [ ] **Bước 4:** chạy test. Kỳ vọng: PASS. Chạy tsc.
- [ ] **Bước 5:** commit.

### Task 6: 8 mầm và 5 khung mùa thường

**Files:**
- Tạo: `canon/seeds.ts` (export `CANON_SEEDS: CanonSeed[]`), `canon/seasons/{tron_chay,vu_an_gia_toc,ngoi_sao,lam_lai,xu_nguoi}.ts`, `canon/seasons/index.ts` (export `SEASONS: SeasonDef[]`)
- Sửa: `canon/index.ts`: export `CANON_SEEDS`, `SEASONS`, `WEIRD` (tạm là mảng rỗng), `SEASON_STORYLETS = [...SEASONS, ...WEIRD.map(b => b.season)].flatMap(compileSeason)`. Xóa `_fixture.ts`.

**Mầm** (id, trục, tuổi, nguồn):

| id | Tên | Trục | Tuổi | Nguồn |
|---|---|---|---|---|
| `no_cu` | Món nợ cũ quay lại | tien, luat | 16–72 | đọc plant `debt`, creditor; viết mới |
| `troi_cho` | Của trời cho | tien, danh | 12–72 | viết mới |
| `phan_boi` | Người thân phản bội | tinh, mau | 10–72 | đọc spouse, sibling, partner |
| `noi_tieng` | Nổi tiếng bất ngờ | danh | 12–60 | viết mới |
| `di_chuc` | Ba bản di chúc | mau, tien | 20–72 | nâng từ Codex c39 |
| `nam_cuoi` | Một năm còn lại | than | 30–72 | nâng từ c27 |
| `ve_xa` | Vé đi xa | dat, tien | 18–45 | nâng từ c14 |
| `nuoc_len` | Đêm nước lên | dat, than | 8–16 | nâng từ c05 |

- Mỗi mầm có ≥ 4 cửa, phủ ≥ 3 kind, dẫn tới ≥ 2 trong 5 mùa.
- Gỡ c39, c27, c14, c05 khỏi `TURNING_CATALOG` để thẻ không nổ hai lần.

**Mùa thường:**
- Có 5 mùa:
  - `tron_chay` (Kẻ trốn chạy, 8–14 năm);
  - `vu_an_gia_toc` (Vụ án gia tộc, 8–16);
  - `ngoi_sao` (Ngôi sao bất đắc dĩ, 8–14, `income: 3`);
  - `lam_lai` (Làm lại từ số 0, 8–20, `cash: 0`);
  - `xu_nguoi` (Làm lại ở xứ người, 10–20, reset `custom: "migrate_now"`).
- Mỗi mùa:
  - 13–17 thẻ, 2–3 nhân vật mới;
  - một gag lặp lại;
  - ≥ 2 landing đáp xuống con đường có trong `PATHS` hoặc đổi nước, hôn nhân hay tiền;
  - nhịp `cu_lat` dùng `k.scar(...)` ít nhất một lần; nhịp `chung_ket` dùng `k.scar("no")`.

- [ ] Bước 1: viết nội dung.
- [ ] Bước 2: `node --experimental-strip-types src/canon-content-test.ts`. Kỳ vọng: PASS cho 5 mùa.
- [ ] Bước 3: thêm vào `canon-test.ts` test "mỗi trục trừ `ky` có ≥ 1 mầm"; mỗi mầm, với 50 `randomCtx` độ tuổi phù hợp có pressure trục đó = 12, cho ra event có 3 cửa trong ≥ 60% số lần. Chạy, PASS.
- [ ] Bước 4: commit.

### Task 7: Host lõi: vòng năm, vào và ra mùa

**Files:**
- Tạo: `doi-nguoi/canon.js`
- Sửa:
  - `doi-nguoi/living.js`:
    - `livingInit` gọi `canonInit(L)`;
    - `factContext` lấy trường mới từ `canonFacts(L)`;
    - `applyEffect` gọi `canonOnEffect(L, e)` đầu hàm;
    - `customEffect` thêm case `canon`, `season`, `season_end`;
    - `livingYear` gọi `if (canonYear(L)) return true;` ngay sau `promiseDueScene`;
    - `pools()` nối `Argon.SEASON_STORYLETS` vào major;
    - `microScene` giới hạn thẻ ngoài mùa.
  - `doi-nguoi/tests/build.py`: nhúng `canon.js` sau `money.js`, thêm vào `publish/files.txt`.
  - `index.html` và `publish/engine.js`: `RNG_SUB.canon = 9`.
  - `argon/src/engine/narrative/Cast.ts`: `addCastMember` nhận mọi `CastRole`; vai không có trong `ROLE_ARCH` thì dùng archetype trung tính.
- Test: `doi-nguoi/tests/canon-test.js`

**Giao diện:**
- Consumes: `basePressure`, `pressureOf`, `dueAxis`, `generateCanon`, `canonView`, `pickScars`, `scarText`, `seasonLength`, `beatGap`, `CANON_SEEDS`, `SEASONS`, `WEIRD` (`Argon.*`).
- Produces (global host):
  ```js
  canonInit(L)          // L.lw.pressure, L.lw.plants = [], L.lw.canon = { n: 0, last: -99, seasons: [] }, L.lw.season = null, L.weird ??= 1
  canonFacts(L)         // { pressure, plants, season, season_beat, canon_n, last_canon_age, weird, nemesis }
  canonOnEffect(L, e)   // cộng pressureOf(e) vào L.lw.pressure; e.plant → L.lw.plants.push({...e.plant, age: L.age, weight: 1}) và thêm cờ plantFlag
  canonYear(L) → bool   // (1) mùa đang chạy: áp rules.yearly; quá hạn thì ép sang nhịp chung_ket
                        // (2) dueAxis → generateCanon (rng subSeed(seed, age, RNG_SUB.canon)) → scene(L, canonScene(L, ev)) → true
  canonScene(L, ev)     // bọc Argon.canonView(ev) như sceneFromStorylet: id = ev.id, key = ev.id + "@" + age, history.push, decisions++, Causality stamp
  enterSeason(L, id), exitSeason(L, reason: "landing" | "cut" | "death")
  seasonKit(L) → SeasonKit
  ```
- Quy tắc:
  - **`custom: "canon:<axis>"`:** trừ `DISCHARGE` ở trục đó (không dưới 0), `canon.n++`, `canon.last = age`.
  - **`season:<id>`:**
    1. đang có mùa thì `exitSeason(L, "cut")`;
    2. `pickScars`;
    3. reset:
       - `cash` chỉ áp khi `ctx.independent`, tính trên `own_cash`, không đụng quỹ chung;
       - `effects` (lọc bỏ `custom` dính nghề khi chưa tự lập);
       - `cast` tạo NPC bằng `Argon.addCastMember` (tên lấy từ `makeName` của nước đang sống);
    4. `income *= rules.income`, nhớ lại để gỡ;
    5. cờ `rules.flags`;
    6. `counters.season_beat = 0`, `counters.season_next = age`;
    7. lưu `lw.season = { id, from: age, end: age + len, scars, mult, cast }`;
    8. log big `Mùa N: <vn>`.
  - **Mỗi thẻ mùa nổ:** khi hết thẻ khả thi của nhịp hiện tại thì `season_beat++` và `season_next = age + beatGap(len)`.
  - **`season_end`:** `exitSeason(L, "landing")`: gỡ hệ số thu nhập, gỡ cờ, đẩy `{ id, from, to, reason, landing }` vào `canon.seasons`.
  - **`microScene` trong mùa:** thẻ có `meta.season` chứa mùa hiện tại được ưu tiên. Thẻ ngoài mùa chỉ được chọn khi `L.ar.rngStory.next() < 0.3`.

- [ ] **Bước 1: viết test hỏng** `canon-test.js` (eval `.head.js`, 120 đời tự chơi, seed cố định):
  - đời sống tới ≥ 60 có `canon.n ≥ 2` (100%), không đời nào `> 4`;
  - hai canon event cách nhau ≥ 8 năm;
  - **cắt mùa (trọng tâm 2):** dựng đời, ép `enterSeason(L, "ngoi_sao")`, rồi ép `enterSeason(L, "lam_lai")` → mùa cũ có `reason: "cut"`, thu nhập sau = (thu nhập trước khi vào `ngoi_sao`) × `rules.income` của `lam_lai` (sai số 1%);
  - **người phụ thuộc (trọng tâm 3):** đời 12 tuổi, ép `enterSeason(L, "lam_lai")` → quỹ chung gia đình không đổi, `L.job` không đổi;
  - **tua lại:** `replayLife` khớp `history` và `savings` trên 30 đời;
  - **ngân sách:** trung vị `lw.decisions` trong 120–130.
- [ ] **Bước 2:** bundle, build, `node doi-nguoi/tests/canon-test.js`. Kỳ vọng: FAIL.
- [ ] **Bước 3:** cài `canon.js` và các chỗ sửa.
- [ ] **Bước 4:** chạy `canon-test.js` cùng toàn bộ test trong Ràng buộc chung. Kỳ vọng: PASS.
- [ ] **Bước 5:** commit.

### Task 8: Host giao diện: banner, màu, Độ điên, Bản kia của bạn, chữ AI, màn kết

**Files:**
- Sửa:
  - `doi-nguoi/canon.js`;
  - `doi-nguoi/index.html` (khối style: biến `--season` theo `body[data-season]`, banner `#season-banner`; menu thêm "Độ điên");
  - `doi-nguoi/phase1.js` (màn kết có mục "Các mùa của đời bạn"; Tấm bia thêm một dòng tên các mùa);
  - `doi-nguoi/choice.js` (`uiOp` nhận `{ k: "weird", v: 0|1|2 }`).
- Test: thêm vào `doi-nguoi/tests/canon-test.js`; kiểm giao diện bằng `doi-nguoi/tests/ui-test.mjs` (chụp ảnh banner).

**Giao diện:**
- Produces:
  - `setWeird(L, v)`: ghi `uiOp`.
  - `otherSelfLine(L, ev, picked) → string`: lúc vào mùa, dùng tên mùa của cửa kế tiếp không được chọn: "Ở dòng thời gian kia, bạn vừa bước vào Mùa: …".
  - `otherSelfEnd(L) → string`:
    - lúc ra mùa, chạy `replayLife(L.seed, L.choices, { key, index: alt }, L.actLog)`;
    - lấy mùa và landing của bản kia tại cùng khoảng tuổi;
    - trả về `""` khi `L.replay`, `L.auto` hoặc `L.script`;
    - lưu rồi khôi phục `G.life`.
  - `canonAiRewrite(L, ev, sceneEl)`:
    - chỉ chạy khi `NAR.sample` có sẵn và không phải `L.replay`;
    - prompt gửi bối cảnh (nước, tuổi, chỗ trống, vết) và yêu cầu viết lại `title`, `text`, 3 nhãn cửa ở dạng JSON;
    - giữ nguyên effects;
    - stream vào DOM;
    - xong thì ghi actLog `{ kind: "canon_text", age, key, raw }`;
    - bản tua lại đọc `canon_text` để hiện chữ.
  - Hiệu ứng `custom: "swap_other"` (dùng cho nhánh S22):
    - lấy canon event trước đó (mark của nó);
    - dựng đời phản thực bằng `resumeFrom(L, { key, index: cửa khác, age })`;
    - tự chơi tới tuổi hiện tại;
    - chép 3 vết hiện tại sang;
    - thay `G.life`;
    - log "Bạn đổi chỗ với bản kia";
    - không có canon event trước thì không làm gì.

- [ ] **Bước 1: viết test hỏng.**
  - **Chết giữa mùa (trọng tâm 1):** ép `enterSeason`, cho chết → `canon.seasons` có `reason: "death"`; HTML màn kết chứa "dang dở"; không có `undefined`.
  - **Độ điên (trọng tâm 5):**
    - `setWeird(L, 0)` ở tuổi 20 → không còn cửa nào có `weird` từ đó về sau (200 đời, `pressure.ky` bị ép = 30);
    - đổi Độ điên giữa đời rồi `replayLife` → khớp `history`.
  - **`canon_text`:** một `canon_text` giả trong actLog được tua lại hiển thị đúng title; effects không đổi.
  - **`swap_other`:** đời có 2 canon event, gọi `swap_other` → đời mới có `history` trước canon event thứ nhất giống bản gốc, và sống tiếp được tới chết khi tự chơi.
- [ ] **Bước 2:** chạy. Kỳ vọng: FAIL.
- [ ] **Bước 3:** cài đặt.
- [ ] **Bước 4:**
  - chạy test, cộng toàn bộ test trong Ràng buộc chung và `ui-test.mjs` (errors: none);
  - chụp ảnh banner mùa trên khổ điện thoại và máy tính, lưu ở `scratchpad/ux/canon/`, mở ra xem.
- [ ] **Bước 5:** commit.

### Task 9: Ánh xạ 200 thẻ Codex: áp lực, vật gài, cảnh phụ của mùa

**Files:**
- Tạo: `argon/src/engine/narrative/canon/codexPlants.ts`:
  ```ts
  CODEX_PLANTS: Record<string, { pressure?: Partial<Record<Axis, number>>; plant?: { kind: PlantKind; key: string; label: string } }>   // khóa "tp_c03_0" = fork tp_c03, route 0
  CODEX_SEASON_TAGS: Record<string, string[]>                                                                                        // khóa fork id → id mùa
  ```
- Sửa: `argon/src/engine/narrative/turning/kit.ts` (`compileFork`):
  - merge `{ pressure: TONE_PRESSURE[b.tone], ...CODEX_PLANTS[key] }` vào effect bước `open`;
  - route có `plant` thì bỏ `later` và bỏ storylet `_echo_` của route đó;
  - `meta.season = CODEX_SEASON_TAGS[d.id]`.
- `TONE_PRESSURE`:

  | Tông | Áp lực |
  |---|---|
  | risk | tien 2 |
  | bond | tinh 1 |
  | care | tinh 1 |
  | show | danh 2 |
  | defy | luat 2 |
  | truth | mau 1 |
  | deal | tien 1 |
  | build | tien 1 |
  | probe | ky 1 |
  | exit | dat 1 |

  Mọi thẻ `tp_a*` (phi lý) cộng thêm `ky 2`.
- Test: thêm vào `argon/src/canon-test.ts`.

- [ ] **Bước 1: viết test hỏng.**
  - ≥ 300/600 route có `plant`;
  - mọi `plant.key` khớp `/^[a-z0-9_]+$/`;
  - ≥ 80 fork có `CODEX_SEASON_TAGS`, và mọi id mùa trong đó tồn tại trong `SEASONS` hoặc `WEIRD`. Task này chạy trước các đợt kỳ dị nên chỉ được tag mùa thường; tag mùa kỳ dị bổ sung ở Task 20;
  - storylet route có `plant` không còn `later`.
- [ ] **Bước 2:** chạy. Kỳ vọng: FAIL.
- [ ] **Bước 3:** viết bảng ánh xạ.
  - Đọc nhãn và hook của từng route trong `turning/*.ts`.
  - Route nhắc tới một món nợ, đồ vật, con vật, người cụ thể hay lời hứa thì gài vật đó, `label` ngắn: "tờ giấy nợ trong áo bố", "con vẹt biết mật khẩu".
- [ ] **Bước 4:** chạy `canon-test.ts`, `turning-points-test.js`, `canon-test.js` và toàn bộ test. Kỳ vọng: PASS.
- [ ] **Bước 5:** commit.

### Task 10–19: 100 nhánh kỳ dị (10 đợt, mỗi đợt 10 nhánh)

| Task | File | Nhánh |
|---|---|---|
| 10 | `canon/weird/sf_01.ts` | S01–S10 |
| 11 | `canon/weird/sf_11.ts` | S11–S20 |
| 12 | `canon/weird/sf_21.ts` | S21–S30 |
| 13 | `canon/weird/sf_31.ts` | S31–S40 |
| 14 | `canon/weird/sf_41.ts` | S41–S50 |
| 15 | `canon/weird/abs_01.ts` | X01–X10 |
| 16 | `canon/weird/abs_11.ts` | X11–X20 |
| 17 | `canon/weird/abs_21.ts` | X21–X30 |
| 18 | `canon/weird/abs_31.ts` | X31–X40 |
| 19 | `canon/weird/abs_41.ts` | X41–X50 |

Mỗi file export một mảng `WeirdBranch[]` 10 phần tử, nối vào `WEIRD` trong `canon/weird/index.ts`. Các đợt độc lập với nhau, chạy song song được sau Task 8.

**Brief của mỗi nhánh:** đúng một dòng ở spec §7a/§7b.
- "Mọc từ" thành `when(c, s)`, dùng trường có thật trong `FactContext`: plant, `owns`, `cast`, `married`, `kids_alive`, `farmer`, `gdp`, `counters`, `flags`. "Kỳ ≥ n" thành `c.pressure.ky >= n`.
- "Mùa (luật)" thành `season.vn` và `rules`.
- "Đáp xuống" thành các landing:
  - nghề phải là id có trong `PATHS`. Không có nghề đúng thì chọn nghề gần nhất, ghi chú `// gần nhất` cạnh landing;
  - đổi nước dùng `migrate_now`;
  - giàu hoặc phá sản thì `money` ±(1–5);
  - "tuổi chết +30" (S26) và "tuổi +N" (S06, S08) thêm hiệu ứng `custom: "age_skip:<n>"` hoặc `custom: "longevity:<n>"`. Hai hiệu ứng này thêm vào `customEffect` ở Task 10 (lần đầu cần) kèm test: `age_skip:3` tăng `L.age` 3, cast già theo, không có năm trống trong history; `longevity:30` cộng 30 vào trần tuổi của đời.
- **S22** dùng `custom: "swap_other"` (Task 8). **S04** và **S40** viết lại mark: chọn lại 1 mark cũ bằng `custom: "remark"`, đổi `choice` và chạy lại effects của lựa chọn mới. Hiệu ứng này thêm ở Task 10, kèm test tua lại khớp.

**Mỗi nhánh:**
- `season.weird` = `"sf"` hoặc `"abs"`;
- 7–10 thẻ chia 5 nhịp, kiểu 2-2-1-2-1;
- 1 gag ≥ 3 dòng, 1–2 nhân vật mới;
- `years` 5–12;
- màu: `sf` thuộc dải xanh tím, `abs` thuộc dải vàng cam;
- `trigger` 2–4 câu kiểu điện ảnh: cược nói ngay câu đầu, có một hình ảnh, có một câu thoại trong ngoặc kép;
- thẻ chung kết ít nhất 2 lựa chọn, mỗi lựa chọn một landing khác nhau.

Ví dụ hình dạng, chỉ một nhánh, rút gọn:
```ts
weird("S05", "sf", ["ky", "mau"], (c) => c.plants.some(p => p.kind === "animal") || c.owns.has("pet"),
  (s, c, N) => `Gắn chip phiên dịch cho ${s.what?.label ?? "con vật nhà bạn"}`,
  (s, c, N) => ({ title: "Con vật biết nói", text: `…` }),
  season({ id: "w_S05", vn: "Thú nói được", color: "#6b5bd6", years: [5, 9], weird: "sf", rules: { flags: ["w_talking_pet"] }, reset: {}, gag: { key: "pet_quote", lines: [/* ≥3 */] },
    landings: [land("lo_bi_mat", "…", { custom: "explode_hook" , money: -1 }), land("thu_noi_tieng", "…", { custom: "become:influencer" })],
    beats: [[card(...), card(...)], [card(...), card(...)], [card(...)], [card(...), card(...)], [card(...)]] }))
```
`weird(...)` và `season(...)` là helper của `canon/kit.ts`, thêm ở Task 10.

- [ ] Bước 1: viết 10 nhánh của đợt.
- [ ] Bước 2: `node --experimental-strip-types src/canon-content-test.ts`. Kỳ vọng: PASS. Bộ kiểm ở Task 4 tự áp cho mọi mùa trong `WEIRD`; thêm kiểm `when` không ném lỗi với 200 `randomCtx`, và mỗi nhánh có `when` đúng ở ≥ 1 ctx.
- [ ] Bước 3: chạy `canon-test.ts` và tsc. Bundle, build, chạy `canon-test.js`.
- [ ] Bước 4: commit "Nhánh kỳ dị S01–S10" (đổi tên theo đợt).

### Task 20: Đo, cân chỉnh và gắn thẻ Codex vào mùa kỳ dị

**Files:**
- Tạo: `argon/tools/canon-stats.js` (đo mọi chuẩn §8 trên 200 đời), `argon/tools/divergence-canon.js` (như `divergence-tp.js`, nhận diện mark canon qua id `canon_*`)
- Sửa: hằng số ở `Pressure.ts`, hoặc trọng số `TONE_PRESSURE` và `basePressure`, chỉ khi chuẩn chưa đạt; `CODEX_SEASON_TAGS` (thêm tag mùa kỳ dị cho thẻ `tp_a*` hợp giọng).

- [ ] Bước 1: `canon-stats.js` in JSON:
  - `canonPerLife` {min, p50, max, shareTwoPlusAt60};
  - `seasonShareAdult`;
  - `fromPlayerShare`;
  - `combos`;
  - `weirdLifeShare` cho cả weird 0, 1 và 2;
  - `decisionsP50`;
  - `brokeShare` (so với số đo của main ghi trong file).
- [ ] Bước 2: chạy `node argon/tools/canon-stats.js doi-nguoi/tests/.head.js 200` và `node argon/tools/divergence-canon.js doi-nguoi/tests/.head.js 60 3`.
- [ ] Bước 3: cân chỉnh đến khi đạt, ghi từng lần chỉnh vào ledger:

  | Chỉ số | Mục tiêu |
  |---|---|
  | `shareTwoPlusAt60` | 1.0 |
  | max canon mỗi đời | ≤ 4 |
  | `seasonShareAdult` | ≥ 0.6 |
  | `fromPlayerShare` | ≥ 0.7 |
  | `combos` | ≥ 150 |
  | `weirdLifeShare` mức 1 | 0.25–0.40 |
  | `weirdLifeShare` mức 0 | 0 |
  | divergence p50 | ≥ 0.8 |
  | `decisionsP50` | 120–130 |
  | `brokeShare` | ≤ main + 0.05 |

- [ ] Bước 4: toàn bộ test PASS. Commit.

### Task 21: Bàn giao: tài liệu, kiểm giao diện, đăng

**Files:**
- Tạo: `argon/docs/ledger/2026-10-18-canon-event.md`
- Sửa: `README.md` (canon event, Mùa, test mới), `CLAUDE.md` (thêm `canon-test.js` vào danh sách test bắt buộc), `argon/docs/fate/AUTHORING.md` (trỏ sang kit canon, đánh dấu hướng Fate cũ đã thay)

- [ ] **Bước 1:** chơi thử 3 đời trên Chromium bằng `ui-test.mjs` hoặc script riêng, mỗi đời một Độ điên. Chụp: canon event, banner mùa, cửa kỳ dị, màn kết có các mùa. Mở ảnh ra xem.
- [ ] **Bước 2:** nhờ một agent review mới (chưa thấy quá trình làm) đọc spec, plan và diff nhánh, kiểm:
  - nội dung (người thật, thương hiệu, tình dục, cách làm phạm pháp);
  - tất định;
  - các trọng tâm review.
  Sửa những gì nó tìm ra.
- [ ] **Bước 3:**
  - merge `canon-event` vào `main`, push;
  - Artifact read link game, gộp thay đổi nếu có;
  - đăng `doi-nguoi/publish/` (gồm `canon.js` mới) lên `https://claude.ai/artifact/Smj8uxWFib5C34KjY714Sw` với `capabilities: {"sample": {}}`, không dùng force.
