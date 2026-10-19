/**
 * Bộ kiểm nội dung lớp canon event / Mùa. Chạy: node --experimental-strip-types src/canon-content-test.ts
 *
 * Kiểm mọi mùa đăng ký (SEASONS; sau này thêm mùa của WEIRD và mầm CANON_SEEDS). Mỗi mùa:
 *  - cấu trúc: id, màu, years, đủ 5 nhịp (nhịp nào cũng ≥ 1 thẻ), tổng thẻ (kỳ dị 7–10, thường 13–17),
 *    dàn mới (kỳ dị 1–2, thường 2–3), gag ≥ 3 dòng và được ≥ 3 thẻ gọi, landings ≥ 1 và đều bền;
 *  - fuzz: build mỗi thẻ với 200 randomCtx (seed cố định) và kit giả (một nửa số lần vết rỗng):
 *    chữ không rỗng, không `{`, `}`, `undefined`, không vết thừa khi vết rỗng ("bạn nhớ ."), 2–3 lựa chọn,
 *    nhịp chung kết chỉ gồm landing (bền + season_end), nhịp khác không được có season_end;
 *  - vết: nhịp cu_lat dùng ≥ 1 vết, nhịp chung_ket dùng vết "no"; k.npc chỉ gọi khóa có trong reset.cast;
 *  - id thẻ duy nhất trên toàn kho (cả id đã biên dịch so với các kho khác của engine);
 *  - tuổi 8–90: luôn có thẻ chung kết mở, luôn có landing không phải nghề, không mở become:<p> ngoài [ages[0], ages[1] + 5];
 *  - mạch truyện: ≥ 2 cờ/bộ đếm do lựa chọn ở nhịp 0–2 đặt làm đổi một thẻ ở nhịp 2–4.
 * Mùa kỳ dị (của WEIRD) thêm: years trong [5, 12], màu theo loại (sf xanh–tím, abs vàng–cam).
 * Mỗi nhánh kỳ dị (WEIRD): id /^(S|X)\d\d$/ duy nhất, kind khớp chữ đầu, season.weird = kind, season.id = "w_" + id,
 *  `when` không ném lỗi trên 200 bối cảnh fuzz (randomCtx + áp lực + vật gài ngẫu nhiên, chỗ trống điền như generator)
 *  và đúng ở ≥ 1 bối cảnh; door/trigger ra chữ trọn vẹn (kể cả chỗ trống rỗng), trigger có câu thoại trong ngoặc kép.
 * Quy tắc 9 (addendum): probeFacts dựng mọi thẻ của mọi mùa và tiêu đề / chữ / nhãn cửa của 8 mầm dưới các cặp sự thật
 *  tương phản (nợ, việc / về hưu, vợ chồng / góa, nhà / sống nhờ, con) rồi dò danh sách cụm từ FACT_RULES; tiền đề do chính
 *  mùa dựng ra ghi ở PREMISE, cụm từ nói về người khác ghi ở NOT_ASSERT (đều kèm lý do). Kèm luật: dòng landing hay hint
 *  chung kết hứa trả nợ / khép chuyện cũ thì effects phải có repay:<x>. Xem chú thích trên probeFacts.
 * Cộng các kiểm đơn vị cho seasonLength, beatGap, isDurable, compileSeason, seasonKitFromNames.
 * R25 (Task 20d): mỗi mùa khai báo thay đổi tình thế lúc vào mùa, cờ của reset được đọc, trần số cờ không ai đọc, chung kết
 *  không cho người chưa tự lập di cư hay người dưới 18 tuổi chuyển đi một mình. Xem chú thích ở khối R25 cuối file.
 * FAIL_ALL=1 in hết mọi FAIL (mặc định 200 dòng đầu); PROBE_STATS=1 in số lần dựng của probe quy tắc 9 và số cờ không ai đọc.
 */
import {
  createRng, PATHS, STORYLETS, MICRO, BRANCHES, BRANCHES2, LIFE_VARIANTS, TEMPER_LIFE, TEMPER2_ECHO, PATH_STORYLETS, TURNING_STORYLETS,
  SEASONS, SEASON_STORYLETS, BEATS, compileSeason, seasonLength, beatGap, RESET_CASH_KEEP, resetCashDelta, isDurable, seasonKitFromNames, landingOf,
  WEIRD, AXES, fillSlots, generateCanon, canonView, CANON_SEEDS,
  type SeasonDef, type SeasonKit, type FactContext, type Effect, type StoryletView, type CanonSeed, type Plant, type PlantKind, type Slots, type CastRole,
} from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";
import { land, ending } from "./engine/narrative/canon/kit.ts";
import { readdirSync, readFileSync } from "node:fs";
import { CONTRADICTIONS, DEMO_SEASONS, entryChanges, probeOf } from "./canon-r25.ts";

let fails = 0;
const seen = new Set<string>();
const bad = (m: string) => { if (seen.has(m)) return; seen.add(m); fails++; if (fails <= (process.env.FAIL_ALL ? 1e9 : 200)) console.log("FAIL " + m); };
const ok = (cond: boolean, msg: string) => { if (!cond) bad(msg); };

/** Mọi mùa phải kiểm: mùa thường và mùa của mọi nhánh kỳ dị. */
const ALL_SEASONS: SeasonDef[] = [...SEASONS, ...WEIRD.map((b) => b.season)];

/* ------------------------------------------------------------------ kiểm đơn vị */

ok(beatGap(12) === 3, "beatGap(12) === 3");
ok(beatGap(3) === 1 && beatGap(1) === 1 && beatGap(20) === 5 && beatGap(8) === 2, "beatGap = max(1, round(len/4))");
ok(BEATS.join(",") === "mo_man,khoi_dong,cu_lat,day,chung_ket", "5 nhịp đúng thứ tự");

ok(isDurable({ custom: "become:singer" }), "durable: become:");
ok(isDurable({ custom: "happy_x|migrate_now|season_end" }), "durable: migrate_now trong chuỗi |");
for (const k of ["migrate", "move_city", "marry", "spouse_leave", "have_child"]) ok(isDurable({ custom: k }), `durable: ${k}`);
ok(isDurable({ buy: { kind: "house", name: "căn nhà", price: 3 } }) && isDurable({ sell: { kind: "house" } }), "durable: buy/sell");
ok(isDurable({ income_mult: 1.2 }) && isDurable({ income_mult: 0.8 }) && !isDurable({ income_mult: 1.1 }), "durable: income_mult ≥ 1.2 hoặc ≤ 0.8");
ok(isDurable({ money: 1 }) && isDurable({ money: -1.5 }) && !isDurable({ money: 0.9 }), "durable: |money| ≥ 1");
ok(!isDurable({ custom: "season_end" }) && !isDurable({ happy: 20, flags: ["x"] }) && !isDurable({ custom: "migrate_try" }) && !isDurable({}), "không bền");
ok(!isDurable({ custom: "unbecome:singer" }), "become: phải ở đầu phần");

/* seasonLength: trong years, kết thúc ≤ 85, tối thiểu 5 (tối thiểu thắng khi quá già — thực tế canon chỉ nổ đến 72) */
const probe: SeasonDef = { ...SEASONS[0]!, years: [8, 20] };
ok(seasonLength(probe, 30, 0) === 8 && seasonLength(probe, 30, 0.99999) === 20, "seasonLength phủ hai đầu years");
ok(seasonLength(probe, 75, 0.99999) === 10, "seasonLength kết thúc ≤ 85");
ok(seasonLength(probe, 83, 0.5) === 5, "seasonLength tối thiểu 5");
/* resetCashDelta (Task 20): thấp hơn mức đặt lại thì lên thẳng mức đó; cao hơn thì chỉ mất (1 − RESET_CASH_KEEP) phần vượt */
ok(RESET_CASH_KEEP === 0.5 && resetCashDelta(100, 20) === 80 && resetCashDelta(100, -50) === 150, "resetCashDelta: dưới mức → lên mức");
ok(resetCashDelta(0, 1000) === -500 && resetCashDelta(200, 1000) === -400 && resetCashDelta(100, 100) === 0, "resetCashDelta: trên mức → giữ một nửa phần vượt");

/* ------------------------------------------------------------------ kiểm từng mùa */

type Use = { scar: Set<string>; gag: boolean; npcBad: Set<string> };
const SCAR_FULL: Record<"nguoi" | "do" | "no", string> = { nguoi: "chị Thắm bán xôi", do: "chiếc xe đạp cũ", no: "món nợ ba năm trước" };
function fakeKit(def: SeasonDef, empty: boolean, use: Use, start: number): SeasonKit {
  const cast = new Map((def.reset.cast ?? []).map((m) => [m.key, m.label]));
  let g = start;
  return {
    N: (id) => (empty ? "ai đó" : "Hòa"),
    scar: (k) => { use.scar.add(k); return empty ? "" : SCAR_FULL[k]; },
    npc: (key) => { if (!cast.has(key)) use.npcBad.add(key); return empty ? (cast.get(key) ?? "người lạ") : "Tư Lành"; },
    noi: empty ? "thị trấn ven sông" : "Phố Mới",
    gag: () => { use.gag = true; return def.gag.lines[g++ % def.gag.lines.length]!; },
  };
}
/** Cặn của vết rỗng hoặc chỗ trống chưa điền. */
const BROKEN = /[{}]|undefined|NaN|null|\[object|\s[.,!?;:]|\s{2}|\(\s*\)|""|^\s|\s$/;
/** Có dấu tiếng Việt: mọi dấu thanh/mũ sau khi tách NFD, hoặc đ. */
const hasVN = (s: string): boolean => /[\u0300-\u036f]|đ/i.test(s.normalize("NFD"));
const CUSTOM_OK = new Set([
  // host (doi-nguoi/living.js customEffect)
  "apologize", "become", "borrow", "confess_hook", "explode_hook", "have_child", "job_lose", "job_lose_maybe", "job_new", "job_switch",
  "marry", "migrate_now", "move_city", "repay", "restructure", "retire", "return_home", "scholar", "shop_end", "spouse_leave", "study", "study_done",
  // canon (Task 7, 8, 10)
  "season_end", "age_skip", "longevity", "swap_other", "remark", "money_season",
]);
const marks = (e: Effect | undefined): boolean => !!e && !!(e.buy || e.sell || e.lifestyle || e.deposit || e.withdraw || e.lend || e.give || e.insure || e.uninsure || e.support || e.flags?.length || e.unflags?.length || e.later || e.memory || e.secret || e.promise || e.close_doors?.length || e.trust || e.custom || e.game || e.plant || e.income_mult !== undefined || (e.money !== undefined && e.money !== 0) || (e.counters && Object.keys(e.counters).length) || (e.gamble && (marks(e.gamble.win) || marks(e.gamble.lose))));
const customParts = (e: Effect): string[] => (e.custom ? e.custom.split("|") : []);
/** Các phần season_end / season_end:<landing> trong custom. */
const endParts = (e: Effect): string[] => customParts(e).filter((p) => p === "season_end" || p.startsWith("season_end:"));
function walk(e: Effect, where: string): void {
  for (const part of customParts(e)) {
    const k = part.split(":")[0]!;
    if (k === "migrate") bad(`${where}: custom 'migrate' — host chỉ hiểu 'migrate_now'`);
    else if (!CUSTOM_OK.has(k)) bad(`${where}: custom lạ '${k}'`);
    if (k === "become" && !PATHS[part.split(":")[1] ?? ""]) bad(`${where}: become → con đường không có trong PATHS ('${part}')`);
  }
  if (e.gamble) { walk(e.gamble.win, where + "/win"); walk(e.gamble.lose, where + "/lose"); }
}
const textOk = (s: string | undefined, where: string, max: number) => {
  if (!s) { bad(`${where}: rỗng`); return; }
  if (s.length > max) bad(`${where}: dài ${s.length} > ${max}`);
  if (BROKEN.test(s)) bad(`${where}: chữ hỏng (ngoặc nhọn, undefined, hay vết rỗng để lại khoảng trắng): «${s}»`);
  if (/^\p{Ll}|(?<!\.)\.\s+\p{Ll}/u.test(s)) bad(`${where}: câu bắt đầu bằng chữ thường (vết/nhãn người mới đứng đầu câu? dùng cap()): «${s}»`);
};

/** Hue (0–360) của màu #rrggbb. */
function hue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d === 0) return -1;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}
ok(Math.round(hue("#6b5bd6")) === 248 && Math.round(hue("#e0a020")) === 40 && hue("#808080") === -1, "hue()");

/** Hệ số thu nhập của mùa: > 0 và ≤ 50 (S39 "thu nhập ×50" là trần). */
const incomeOk = (x: number): boolean => x > 0 && x <= 50;
ok(incomeOk(50) && !incomeOk(51) && !incomeOk(0) && !incomeOk(-1) && incomeOk(0.5), "rules.income: 50 qua, 51 / 0 / âm trượt");

const allCardIds = new Set<string>();
const seasonIds = new Set<string>();
const otherIds = new Set([...STORYLETS, ...MICRO, ...BRANCHES, ...BRANCHES2, ...LIFE_VARIANTS, ...TEMPER_LIFE, ...TEMPER2_ECHO, ...PATH_STORYLETS, ...TURNING_STORYLETS].map((s) => s.id));

function checkSeason(def: SeasonDef): void {
  const S = `mùa ${def.id}`;
  if (!(/^[a-z0-9_]+$/.test(def.id) || (def.weird && /^w_[SX]\d\d$/.test(def.id)))) bad(`${S}: id chỉ gồm a-z 0-9 _ (mùa kỳ dị: w_S01…, w_X01…)`);
  if (seasonIds.has(def.id)) bad(`${S}: id mùa trùng`); seasonIds.add(def.id);
  if (!def.vn || !hasVN(def.vn) || def.vn.length > 40) bad(`${S}: vn rỗng, không dấu hoặc > 40 ký tự`);
  if (!/^#[0-9a-f]{6}$/i.test(def.color)) bad(`${S}: color phải dạng #rrggbb`);
  const [y0, y1] = def.years;
  if (!(Number.isInteger(y0) && Number.isInteger(y1) && y0 >= 5 && y0 <= y1 && y1 <= 20 && y0 <= 85 - 72)) bad(`${S}: years [${y0}, ${y1}] phải là số nguyên, 5 ≤ đầu ≤ cuối ≤ 20, đầu ≤ 13`);
  if (def.weird && !(y0 >= 5 && y1 <= 12)) bad(`${S}: mùa kỳ dị cần years trong [5, 12], có [${y0}, ${y1}]`);
  if (def.weird && /^#[0-9a-f]{6}$/i.test(def.color)) {
    const h = hue(def.color), [h0, h1] = def.weird === "sf" ? [200, 290] : [25, 60];
    if (!(h >= h0 && h <= h1)) bad(`${S}: màu ${def.color} (hue ${Math.round(h)}) ngoài dải ${def.weird === "sf" ? "xanh–tím 200–290" : "vàng–cam 25–60"}`);
  }
  if (def.rules.income !== undefined && !incomeOk(def.rules.income)) bad(`${S}: rules.income phải > 0 và ≤ 50, có ${def.rules.income}`);
  if (def.reset.cash !== undefined && !(def.reset.cash >= 0 && def.reset.cash <= 10)) bad(`${S}: reset.cash phải trong [0, 10] lần thu nhập`);
  if (def.rules.yearly) walk(def.rules.yearly, `${S} rules.yearly`);
  if (def.reset.effects) walk(def.reset.effects, `${S} reset.effects`);

  const cast = def.reset.cast ?? [];
  const [c0, c1] = def.weird ? [1, 2] : [2, 3];
  if (cast.length < c0 || cast.length > c1) bad(`${S}: ${cast.length} nhân vật mới, cần ${c0}–${c1}`);
  if (new Set(cast.map((m) => m.key)).size !== cast.length) bad(`${S}: khóa nhân vật mới trùng`);
  for (const m of cast) if (!m.label || BROKEN.test(m.label) || !/^[a-z0-9_]+$/.test(m.key)) bad(`${S}: nhân vật mới '${m.key}' cần key a-z_ và label sạch`);

  if (def.gag.lines.length < 3) bad(`${S}: gag cần ≥ 3 dòng`);
  if (!/^[a-z0-9_]+$/.test(def.gag.key)) bad(`${S}: gag.key chỉ gồm a-z 0-9 _`);
  def.gag.lines.forEach((l, i) => textOk(l, `${S} gag[${i}]`, 200));

  if (def.landings.length < 1) bad(`${S}: cần ≥ 1 landing`);
  if (new Set(def.landings.map((l) => l.id)).size !== def.landings.length) bad(`${S}: id landing trùng`);
  const landingIds = new Set(def.landings.map((l) => l.id));
  const landingUsed = new Set<string>();
  for (const l of def.landings) {
    textOk(l.line, `${S} landing ${l.id}`, 200);
    if (!isDurable(l.effects)) bad(`${S} landing ${l.id}: effects không bền (become:, migrate_now, marry, have_child, buy/sell, income_mult, |money| ≥ 1…)`);
    const ep = endParts(l.effects);
    if (ep.length !== 1 || ep[0] !== `season_end:${l.id}`) bad(`${S} landing ${l.id}: custom phải có đúng một season_end:${l.id} (dùng land())`);
    walk(l.effects, `${S} landing ${l.id}`);
  }

  if (def.beats.length !== 5) { bad(`${S}: cần đúng 5 nhịp, có ${def.beats.length}`); return; }
  def.beats.forEach((b, i) => { if (b.length < 1) bad(`${S}: nhịp ${BEATS[i]} không có thẻ`); });
  const total = def.beats.reduce((n, b) => n + b.length, 0);
  const [t0, t1] = def.weird ? [7, 10] : [13, 17];
  if (total < t0 || total > t1) bad(`${S}: ${total} thẻ, cần ${t0}–${t1} (${def.weird ? "kỳ dị" : "mùa thường"})`);

  const rng = createRng(4242);
  const ctxs: FactContext[] = [];
  for (let i = 0; i < 200; i++) ctxs.push(randomCtx(rng));
  let gagCards = 0, finaleGag = false;
  const titles = new Map<string, string>();
  def.beats.forEach((beat, bi) => {
    const beatUse: Use = { scar: new Set(), gag: false, npcBad: new Set() };
    let noWhen = 0;
    beat.forEach((card, ci) => {
      const W = `${S} ${BEATS[bi]} ${card.id}`;
      if (!/^[a-z0-9_]+$/.test(card.id)) bad(`${W}: id thẻ chỉ gồm a-z 0-9 _`);
      if (allCardIds.has(card.id)) bad(`${W}: id thẻ trùng trên toàn kho`); allCardIds.add(card.id);
      const use: Use = { scar: new Set(), gag: false, npcBad: new Set() };
      if (!card.when) noWhen++;
      let fires = 0;
      ctxs.forEach((c0, i) => {
        const c: FactContext = { ...c0, season: def.id, season_beat: bi, counters: { ...c0.counters, season_next: c0.age } };
        let on = true;
        if (card.when) { try { on = card.when(c); } catch (e) { bad(`${W}: when ném lỗi ${String(e)}`); return; } }
        if (!on) return;
        fires++;
        const empty = i % 2 === 0;
        let v: StoryletView;
        try { v = card.build(c, fakeKit(def, empty, use, i)); } catch (e) { bad(`${W}: build ném lỗi ${String(e)}`); return; }
        let v2: StoryletView | null = null;
        try { v2 = card.build(c, fakeKit(def, empty, { scar: new Set(), gag: false, npcBad: new Set() }, i)); } catch { /* đã báo */ }
        if (v2 && JSON.stringify(v2) !== JSON.stringify(v)) bad(`${W}: build không tất định (cùng ctx, khác kết quả)`);
        textOk(v.title, `${W} title`, 60);
        textOk(v.text, `${W} text`, 600);
        if (!hasVN(v.title + v.text)) bad(`${W}: chữ không có dấu tiếng Việt`);
        if (!titles.has(v.title)) titles.set(v.title, card.id);
        else if (titles.get(v.title) !== card.id) bad(`${W}: tiêu đề «${v.title}» trùng thẻ ${titles.get(v.title)}`);
        if (v.choices.length < 2 || v.choices.length > 3) bad(`${W}: cần 2–3 lựa chọn, có ${v.choices.length}`);
        if (!(v.def >= 0 && v.def < v.choices.length)) bad(`${W}: def ngoài khoảng`);
        if (!v.choices.some((ch) => marks(ch.effects))) bad(`${W}: không lựa chọn nào để lại dấu`);
        const finalIds = new Set<string>();
        v.choices.forEach((ch, k) => {
          const WC = `${W}#${k}`;
          textOk(ch.label, `${WC} label`, 60);
          if (ch.hint !== undefined) textOk(ch.hint, `${WC} hint`, 70);
          if (!ch.effects) { bad(`${WC}: thiếu effects`); return; }
          walk(ch.effects, WC);
          const ep = endParts(ch.effects);
          const ends = ep.length > 0 || JSON.stringify(ch.effects.gamble ?? {}).includes("season_end");
          if (bi === 4) {
            if (!isDurable(ch.effects)) bad(`${WC}: lựa chọn chung kết phải bền (isDurable)`);
            const lid = ep.length === 1 && ep[0]!.startsWith("season_end:") ? ep[0]!.slice("season_end:".length) : undefined;
            if (lid === undefined || !landingIds.has(lid)) bad(`${WC}: lựa chọn chung kết phải có đúng một season_end:<id> của landing khai báo trong def.landings (dùng ending(landing, nhãn)), có «${ep.join("|")}»`);
            else { landingUsed.add(lid); if (finalIds.has(lid)) bad(`${WC}: hai lựa chọn của cùng thẻ chung kết đáp cùng landing ${lid}`); finalIds.add(lid); }
          } else if (ends) bad(`${WC}: season_end chỉ được ở nhịp chung_ket`);
        });
      });
      if (!fires) bad(`${W}: when không đúng ở ctx nào trong 200 — thẻ không bao giờ ra`);
      for (const k of use.npcBad) bad(`${W}: k.npc("${k}") không có trong reset.cast`);
      // Nhịp chung kết chỉ ra đúng một thẻ: cả nhịp tính tối đa một lần gag, và thẻ nào cũng phải dùng vết nợ.
      if (use.gag && !(bi === 4 && finaleGag)) { gagCards++; if (bi === 4) finaleGag = true; }
      if (bi === 4 && !use.scar.has("no")) bad(`${W}: thẻ chung kết phải dùng vết nợ hay lời hứa (k.scar("no")) — mỗi mùa chỉ một thẻ chung kết ra`);
      for (const s of use.scar) beatUse.scar.add(s);
      void ci;
    });
    if (bi === 4 && !noWhen) bad(`${S}: nhịp chung_ket cần ≥ 1 thẻ không có when, nếu không mùa có thể không hạ cánh`);
    if (bi === 2 && beatUse.scar.size === 0) bad(`${S}: nhịp cu_lat phải dùng ít nhất 1 vết (k.scar)`);
  });
  if (gagCards < 3) bad(`${S}: gag phải lặp ≥ 3 lần mỗi mùa — chỉ ${gagCards} thẻ gọi k.gag()`);
  // Landing chỉ mở khi người chơi đã gom đủ cờ / bộ đếm của mùa (vd. phần thừa kế trọn khi thắng kiện): dựng thêm thẻ
  // chung kết với mọi cờ và bộ đếm (= 5) do lựa chọn trong mùa đặt.
  if (def.landings.some((l) => !landingUsed.has(l.id))) {
    const sf = new Set<string>(), sc: Record<string, number> = {};
    const grab = (e: Effect) => { for (const f of e.flags ?? []) sf.add(f); for (const k of Object.keys(e.counters ?? {})) sc[k] = 5; if (e.gamble) { grab(e.gamble.win); grab(e.gamble.lose); } };
    def.beats.slice(0, 4).forEach((beat, bi) => beat.forEach((card) => ctxs.slice(0, 8).forEach((p) => {
      try { const c: FactContext = { ...p, season: def.id, season_beat: bi }; if (card.when && !card.when(c)) return; card.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)).choices.forEach((ch) => grab(ch.effects)); } catch { /* đã báo */ }
    })));
    for (const card of def.beats[4]) for (const p of ctxs) {
      const c: FactContext = { ...p, season: def.id, season_beat: 4, flags: new Set([...p.flags, ...sf]), counters: { ...p.counters, ...sc, season_next: p.age } };
      try { if (card.when && !card.when(c)) continue; for (const ch of card.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)).choices) { const l = landingOf(ch.effects); if (l) landingUsed.add(l); } } catch { /* đã báo */ }
    }
  }
  for (const l of def.landings) if (!landingUsed.has(l.id)) bad(`${S}: landing ${l.id} không thẻ chung kết nào dùng`);

  /* Chung kết theo tuổi (16–85, có/không vợ chồng): luôn có thẻ hạ cánh được, và landing đổi nghề become:<p> chỉ ra
     khi tuổi ≤ trần tuổi của con đường + 5 (host becomePath không kiểm tuổi). Người già chỉ còn tiền, nơi ở, hôn nhân. */
  {
    const base = randomCtx(createRng(31));
    for (let age = 16; age <= 85; age++) for (const married of [false, true]) {
      const c: FactContext = { ...base, age, married, season: def.id, season_beat: 4, counters: { ...base.counters, season_next: age } };
      const open = def.beats[4].filter((cd) => !cd.when || cd.when(c));
      if (!open.length) { bad(`${S}: tuổi ${age}: không thẻ chung kết nào mở`); continue; }
      for (const cd of open) {
        let v: StoryletView;
        try { v = cd.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)); } catch { continue; /* đã báo ở fuzz */ }
        for (const ch of v.choices) for (const part of customParts(ch.effects)) {
          if (!part.startsWith("become:")) continue;
          const p = PATHS[part.slice(7)];
          if (p && age > p.ages[1] + 5) bad(`${S} ${cd.id}: tuổi ${age} vẫn mời ${part} (con đường nhận tới ${p.ages[1]} tuổi, cho phép ≤ ${p.ages[1] + 5})`);
        }
      }
    }
  }

  for (let age = 8; age <= 72; age++) for (const r of [0, 0.13, 0.5, 0.77, 0.99999]) {
    const len = seasonLength(def, age, r);
    if (!Number.isInteger(len) || len < 5 || len < y0 || len > y1 || age + len > 85) bad(`${S}: seasonLength(${age}, ${r}) = ${len} ngoài years / quá 85 / < 5`);
  }

  /* tuổi: mọi tuổi 8–90 (có và chưa có gia đình) có ≥ 1 thẻ chung kết mở; lựa chọn mở luôn có ≥ 1 landing không phải nghề,
     và không mở become:<p> ngoài [ages[0], ages[1] + 5] của con đường đó. */
  {
    const base = randomCtx(createRng(31));
    const noOpen: number[] = [];
    const outAge = new Map<string, number[]>();
    for (let age = 8; age <= 90; age++) for (const married of [false, true]) {
      const c: FactContext = { ...base, age, married, season: def.id, season_beat: 4, counters: { ...base.counters, season_next: age } };
      const open = def.beats[4].filter((card) => { try { return !card.when || card.when(c); } catch { return false; } });
      if (!open.length) { noOpen.push(age); continue; }
      for (const card of open) {
        let v: StoryletView;
        try { v = card.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)); } catch (e) { bad(`${S} ${card.id}: build ném lỗi ở tuổi ${age} ${String(e)}`); continue; }
        if (v.choices.length < 2 || v.choices.length > 3) { const key = `${card.id}: ${v.choices.length} lựa chọn (cần 2–3)`; outAge.set(key, [...(outAge.get(key) ?? []), age]); }
        const career = (ch: { effects: Effect }) => customParts(ch.effects).filter((x) => x.startsWith("become:")).map((x) => x.slice(7));
        if (!v.choices.some((ch) => career(ch).length === 0)) { const key = `${card.id}: mọi lựa chọn đều là nghề (cần ≥ 1 landing không phải nghề)`; outAge.set(key, [...(outAge.get(key) ?? []), age]); }
        for (const ch of v.choices) for (const id of career(ch)) {
          const pd = PATHS[id];
          if (pd && (age < pd.ages[0] || age > pd.ages[1] + 5)) { const key = `${card.id} → become:${id} [${pd.ages[0]}, ${pd.ages[1] + 5}]`; outAge.set(key, [...(outAge.get(key) ?? []), age]); }
        }
      }
    }
    if (noOpen.length) bad(`${S}: không thẻ chung kết nào mở ở tuổi ${[...new Set(noOpen)].join(",")}`);
    for (const [key, ages] of outAge) bad(`${S} ${key} — ở tuổi ${[...new Set(ages)].join(",")}`);
  }

  /* mạch truyện đọc lại chính nó (content-guide §4.4): ≥ 2 cờ/bộ đếm do lựa chọn ở nhịp 0–2 đặt ra làm đổi chữ hoặc
     lựa chọn (hay `when`) của một thẻ ở nhịp 2–4. Dò bằng cách dựng thẻ sau với ctx có và không có khóa đó. */
  {
    const probes = [0, 1, 2, 3].map((i) => randomCtx(createRng(600 + i)));
    const set = new Map<string, { kind: "flag" | "counter"; from: string }>();
    const collect = (e: Effect, from: string) => {
      for (const f of e.flags ?? []) set.set(f, { kind: "flag", from });
      for (const k of Object.keys(e.counters ?? {})) set.set(k, { kind: "counter", from });
      if (e.gamble) { collect(e.gamble.win, from); collect(e.gamble.lose, from); }
    };
    def.beats.slice(0, 3).forEach((beat, bi) => beat.forEach((card) => probes.forEach((p) => {
      const c: FactContext = { ...p, season: def.id, season_beat: bi, counters: { ...p.counters, season_next: p.age } };
      try { if (card.when && !card.when(c)) return; card.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)).choices.forEach((ch) => collect(ch.effects, card.id)); } catch { /* đã báo ở trên */ }
    })));
    const read = new Set<string>();
    for (const [key, info] of set) {
      for (let bi = 2; bi <= 4 && !read.has(key); bi++) for (const card of def.beats[bi]!) {
        if (card.id === info.from || read.has(key)) continue;
        for (const p of probes) {
          const flags0 = new Set(p.flags); flags0.delete(key);
          const counters0: Record<string, number> = { ...p.counters, season_next: p.age }; delete counters0[key];
          const c0: FactContext = { ...p, season: def.id, season_beat: bi, flags: flags0, counters: counters0 };
          const c1: FactContext = info.kind === "flag" ? { ...c0, flags: new Set([...flags0, key]) } : { ...c0, counters: { ...counters0, [key]: 5 } };
          const run = (c: FactContext): string => {
            try {
              if (card.when && !card.when(c)) return "off";
              return JSON.stringify(card.build(c, fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0)));
            } catch { return "err"; }
          };
          if (run(c0) !== run(c1)) { read.add(key); break; }
        }
      }
    }
    if (read.size < 2) bad(`${S}: nhịp cú lật/đáy/chung kết chỉ đọc lại ${read.size} cờ/bộ đếm do lựa chọn trước đặt (${[...read].join(", ") || "không có"}), cần ≥ 2`);
  }

  /* biên dịch: id, cổng, meta, build qua names */
  const st = compileSeason(def);
  ok(st.length === total, `${S}: compileSeason ra ${st.length} storylet, cần ${total}`);
  const base = randomCtx(createRng(99));
  def.beats.forEach((beat, bi) => beat.forEach((card, ci) => {
    const s = st.find((x) => x.id === `ss_${def.id}_${bi}_${ci}`);
    if (!s) { bad(`${S}: thiếu storylet ss_${def.id}_${bi}_${ci}`); return; }
    if (otherIds.has(s.id)) bad(`${s.id}: trùng id với kho khác của engine`);
    ok(s.category === "arc" && s.urgency === 85 && s.specificity(base) === 9 && s.once === true && s.maxPerLife === 1, `${s.id}: category/urgency/specificity/once/maxPerLife`);
    ok(s.meta?.kind === "season" && s.meta.season?.length === 1 && s.meta.season[0] === def.id, `${s.id}: meta.season`);
    const at = (over: Partial<FactContext>, next: number): FactContext => ({ ...base, age: 40, season: def.id, season_beat: bi, ...over, counters: { ...base.counters, season_next: next } });
    const want = card.when ? card.when(at({}, 40)) : true;
    ok(s.prerequisites(at({}, 40)) === want, `${s.id}: cổng mở đúng nhịp`);
    ok(!s.prerequisites(at({ season: "khac" }, 40)), `${s.id}: cổng đóng khi khác mùa`);
    ok(!s.prerequisites(at({ season: null }, 40)), `${s.id}: cổng đóng khi không có mùa`);
    ok(!s.prerequisites(at({ season_beat: (bi + 1) % 5 }, 40)), `${s.id}: cổng đóng khi khác nhịp`);
    ok(!s.prerequisites(at({}, 41)), `${s.id}: cổng đóng khi chưa tới season_next`);
    try {
      const v = s.build(at({}, 40), (id) => (id.startsWith("npc:") || id.startsWith("scar:") || id === "place" ? "" : "ai đó"));
      textOk(v.title, `${s.id} build(names) title`, 60); textOk(v.text, `${s.id} build(names) text`, 600);
    } catch (e) { bad(`${s.id}: build(names) ném lỗi ${String(e)}`); }
  }));
}

for (const def of ALL_SEASONS) checkSeason(def);
const compiled = ALL_SEASONS.flatMap(compileSeason);
ok(new Set(compiled.map((s) => s.id)).size === compiled.length, "id storylet mùa duy nhất");
ok(SEASON_STORYLETS.length === compiled.length, "SEASON_STORYLETS = mùa thường + mùa kỳ dị, đã biên dịch");

/* ------------------------------------------------------------------ nhánh kỳ dị */

/** Vật gài mẫu cho fuzz (randomCtx không có vật gài): đủ 8 loại, khóa giống bảng Codex. */
const FUZZ_PLANTS: [PlantKind, string, string][] = [
  ["object", "radio_cua_bo", "chiếc radio cũ của bố"], ["object", "vat_vang_trong_heo_dat", "vật bằng vàng ông gửi trong heo đất"],
  ["object", "ban_do_cua_ong", "bản đồ ông để lại"], ["object", "chiec_cap_tren_mai_ton", "chiếc cặp bị ném lên mái tôn"],
  ["animal", "con_vet_biet_mat_khau", "con vẹt biết mật khẩu cửa"], ["animal", "con_vit_deo_chuong", "con vịt đầu đàn đeo chuông"],
  ["animal", "con_cho_lam_nhan_chung", "con chó bị gọi là nhân chứng"], ["animal", "con_meo_ngu_giua_bien_ban", "con mèo ngủ giữa chồng biên bản"],
  ["debt", "giay_no_trong_ao_bo", "tờ giấy nợ trong áo bố"], ["debt", "khoan_vay_hoc_phi", "khoản vay để đi học"],
  ["secret", "la_thu_khong_ghi_nguoi_gui", "lá thư không ghi người gửi"], ["promise", "to_giay_loi_hua_luc_kho", "tờ giấy lời hứa viết lúc khó khăn"],
  ["place", "bep_an_cho_tam_cu", "bếp ăn ở chỗ tạm cư"], ["skill", "nghe_cong_ty_can", "nghề công ty cần bạn học lại"],
  ["person", "nguoi_chu_o_thanh_pho", "người chú có chỗ ở thành phố"],
];
/** randomCtx + áp lực 8 trục ngẫu nhiên (0–12) + 0–3 vật gài + canon_n 0–2 + Độ điên 1–2. */
function weirdCtx(r: ReturnType<typeof createRng>): FactContext {
  const c = randomCtx(r);
  const pressure = { ...c.pressure };
  for (const a of AXES) pressure[a] = Math.floor(r.next() * 13);
  const plants: Plant[] = [];
  const n = Math.floor(r.next() * 4);
  const people = Object.values(c.cast).filter((x): x is string => !!x);
  for (let i = 0; i < n; i++) {
    const [kind, key, label] = r.pick(FUZZ_PLANTS);
    const p: Plant = { kind, key, label, age: Math.floor(r.next() * Math.max(1, c.age)), weight: 1 + Math.floor(r.next() * 3) };
    if (kind === "person" && people.length) p.npc = r.pick(people);
    plants.push(p);
  }
  // Số canon event đã nổ: 0–2, tuổi lần trước khớp với khoảng cách CANON_GAP (8 năm) — nhánh như S22 cần canon_n ≥ 1.
  const canon_n = Math.floor(r.next() * 3);
  const last_canon_age = canon_n > 0 ? c.age - 8 - Math.floor(r.next() * 10) : -99;
  return { ...c, pressure, plants, canon_n, last_canon_age, weird: r.chance(0.5) ? 1 : 2 };
}
/** Chỗ trống như generator điền cho trục Kỳ (bản sao KY_SLOTS của Canon.ts). */
const KY_FUZZ: CanonSeed = {
  id: "_ky_fuzz", axes: ["ky"], title: () => "", text: () => "", doors: [],
  who: { roles: ["mother", "father", "sibling", "childhood_friend", "bully", "neighbor", "first_boss", "official", "partner", "creditor", "mentor", "rival", "spouse", "child"], plants: ["person"], required: false },
  what: { plants: ["object", "animal", "skill", "debt", "promise", "secret", "place"], owns: ["house", "land", "vehicle", "shop", "gold", "deposit", "stake"], required: false },
};
/** Tên giả cho door/trigger: nửa số lần nơi ở rỗng, tên NPC luôn có (fillSlots chỉ điền người còn sống). */
const fakeN = (empty: boolean) => (id: string): string => (id === "place" ? (empty ? "" : "Phố Mới") : empty ? "Tư Lành" : "Hòa");
const QUOTE = /“[^”]+”|"[^"]+"/;

{
  const rng = createRng(1010);
  const ctxs: { c: FactContext; s: Slots; s0: Slots; N: (id: string) => string }[] = [];
  for (let i = 0; i < 200; i++) {
    const c = weirdCtx(rng);
    const N = fakeN(i % 2 === 0);
    const s = fillSlots(KY_FUZZ, c, c.plants, N)!;
    ctxs.push({ c, s, s0: { noi: "", fromPlayer: 0 }, N });
  }
  const ids = new Set<string>();
  for (const b of WEIRD) {
    const B = `nhánh ${b.id}`;
    if (!/^(S|X)\d\d$/.test(b.id)) bad(`${B}: id phải dạng S01…S50 hoặc X01…X50`);
    if (ids.has(b.id)) bad(`${B}: id nhánh trùng`); ids.add(b.id);
    if (b.kind !== (b.id.startsWith("S") ? "sf" : "abs")) bad(`${B}: kind ${b.kind} không khớp chữ đầu của id`);
    if (b.season.weird !== b.kind) bad(`${B}: season.weird (${b.season.weird}) phải bằng kind (${b.kind})`);
    if (b.season.id !== `w_${b.id}`) bad(`${B}: season.id phải là w_${b.id}, có ${b.season.id}`);
    if (!b.axes.length || b.axes.some((a) => !AXES.includes(a))) bad(`${B}: axes rỗng hoặc có trục lạ`);
    if (b.hint !== undefined) textOk(b.hint, `${B} hint`, 70);
    let fires = 0;
    ctxs.forEach(({ c, s, s0, N }, i) => {
      for (const sl of [s, s0]) {
        try { if (b.when(c, sl) && sl === s) fires++; } catch (e) { bad(`${B}: when ném lỗi ${String(e)}`); }
        try {
          textOk(b.door(sl, c, N), `${B} door`, 60);
          const t = b.trigger(sl, c, N);
          textOk(t.title, `${B} trigger.title`, 60);
          textOk(t.text, `${B} trigger.text`, 600);
          if (!QUOTE.test(t.text)) bad(`${B}: trigger cần một câu thoại trong ngoặc kép`);
          if (!hasVN(t.title + t.text)) bad(`${B}: trigger không có dấu tiếng Việt`);
        } catch (e) { bad(`${B}: door/trigger ném lỗi ${String(e)} (ctx ${i})`); }
      }
    });
    if (!fires) bad(`${B}: when không đúng ở bối cảnh nào trong 200 — nhánh không bao giờ mở`);
  }
  /* Tích hợp: trục Kỳ nổ với kho thật → có biến cố, 3 cửa, chữ trọn vẹn. */
  if (WEIRD.length) {
    let built = 0;
    ctxs.forEach(({ c, N }, i) => {
      const cc: FactContext = { ...c, pressure: { ...c.pressure, ky: 12 } };
      let ev = null;
      try { ev = generateCanon(cc, "ky", cc.plants, createRng(500 + i), N, [], WEIRD); } catch (e) { bad(`generateCanon(ky) ném lỗi ${String(e)}`); return; }
      if (!ev) return;
      built++;
      const v = canonView(ev);
      textOk(v.title, `canon ${ev.seed} title`, 60); textOk(v.text, `canon ${ev.seed} text`, 600);
      if (v.choices.length !== 3) bad(`canon ${ev.seed}: cần 3 cửa, có ${v.choices.length}`);
      v.choices.forEach((ch, k) => { textOk(ch.label, `canon ${ev!.seed} cửa ${k} label`, 60); if (ch.hint) textOk(ch.hint, `canon ${ev!.seed} cửa ${k} hint`, 70); });
    });
    ok(built > 0, "generateCanon(ky) với WEIRD dựng được ít nhất một biến cố");
  }
}

/* seasonKitFromNames: host đưa tên qua names; khóa lạ / "ai đó" → dự phòng */
{
  const def = SEASONS[0]!, m = def.reset.cast?.[0];
  const kEmpty = seasonKitFromNames(def, () => "ai đó", 0);
  ok(kEmpty.scar("nguoi") === "" && kEmpty.scar("no") === "", "kit: vết lạ → chuỗi rỗng");
  ok(!m || kEmpty.npc(m.key) === m.label, "kit: người mới chưa có tên → label");
  ok(kEmpty.noi.length > 0 && kEmpty.noi !== "ai đó", "kit: nơi dự phòng");
  const kFull = seasonKitFromNames(def, (id) => ({ "scar:no": "món nợ cũ", "place": "Bến Đá", [`npc:${m?.key}`]: "Tư Lành" } as Record<string, string>)[id] ?? "ai đó", 1);
  ok(kFull.scar("no") === "món nợ cũ" && kFull.noi === "Bến Đá" && (!m || kFull.npc(m.key) === "Tư Lành"), "kit: lấy tên từ names");
  ok(kFull.gag() === def.gag.lines[1 % def.gag.lines.length] && kFull.gag() === def.gag.lines[2 % def.gag.lines.length], "kit: gag lần lượt từ thứ tự thẻ");
}

/* gag đi lần lượt: thẻ gọi gag thứ k (theo thứ tự mùa, với cùng ctx) hiện lines[k % n] — kiểm trên mọi mùa thường */
for (const def of SEASONS) {
  const st = compileSeason(def);
  const c0 = randomCtx(createRng(7));
  const shown: number[] = [];
  def.beats.forEach((beat, bi) => beat.forEach((_card, ci) => {
    const s = st.find((x) => x.id === `ss_${def.id}_${bi}_${ci}`)!;
    const c: FactContext = { ...c0, age: 40, season: def.id, season_beat: bi, counters: { ...c0.counters, season_next: 40 } };
    if (bi === 4 && ci > 0) return; // chỉ một thẻ chung kết ra
    if (!s.prerequisites(c)) return;
    const text = s.build(c, () => "ai đó").text;
    def.gag.lines.forEach((l, i) => { if (text.includes(l)) shown.push(i); });
  }));
  ok(shown.length >= 3 && shown.every((x, k) => x === k % def.gag.lines.length), `gag mùa ${def.id} theo thứ tự 0,1,2,… (thấy ${shown.join(",")})`);
}
ok(landingOf({ custom: "become:singer|season_end:ca_si" }) === "ca_si" && landingOf({ custom: "season_end" }) === null && landingOf({}) === null, "landingOf đọc id landing");
ok(land("x", "Dòng.", { money: 2 }).effects.custom === "season_end:x" && land("y", "Dòng.", { custom: "marry" }).effects.custom === "marry|season_end:y", "land thêm season_end:<id>");
{ const l = land("z", "Dòng.", { money: 2 }); ok(ending(l, "Chọn").effects === l.effects, "ending dùng nguyên effects của landing"); }

/* ------------------------------------------------------------------ quy tắc 9: chữ khẳng định trạng thái phải đúng với mọi ctx */

/**
 * Probe quy tắc 9 (addendum): dựng mọi thẻ của mọi mùa (và tiêu đề / chữ / nhãn cửa của 8 mầm) dưới các cặp sự thật
 * tương phản, rồi dò một danh sách cụm từ khẳng định trạng thái. Cụm nào hiện ra ở biến thể mà trạng thái ấy SAI là vi phạm.
 *
 * Biến thể (VARIANTS) đặt một sự thật và dọn các trường liên quan cho nhất quán (vai spouse/child trong cast, nhà trong
 * owns/asset_names, vật gài nợ…): không nợ / có nợ; không việc / về hưu / có việc; chưa cưới / góa / đang có vợ chồng;
 * không nhà / có nhà / sống nhờ (không nhà, chưa tự lập); không con / có con. Biến thể "dương" (có nợ, có việc, có vợ
 * chồng, góa, có nhà, có con) chỉ dùng cho người ≥ 18 (có con: ≥ 25).
 *
 * Cờ và bộ đếm của mùa: mỗi thẻ được dựng hai lần, (a) không cờ nào của mùa, (b) mọi cờ/bộ đếm do lựa chọn trong mùa
 * đặt, TRỪ những cờ đi cùng một lựa chọn tạo ra chính sự thật đang xét (vay → nợ, marry → vợ chồng, have_child → con,
 * job_new/become: → việc, mua nhà → nhà; chiều ngược lại: repay, spouse_leave, job_lose/retire, bán nhà). Vậy chữ
 * "khoản vay tới hạn" đứng sau cờ của lựa chọn "Vay" không bị bắt, còn chữ dự phòng khi vết nợ rỗng thì bị bắt.
 * Vết rỗng (k.scar → "") cho mọi luật; luật không về nợ dựng thêm với vết đầy.
 *
 * Mùa thường: 24 bối cảnh fuzz (tuổi ≥ 8; tron_chay / xu_nguoi cần đã tự lập như cửa của chúng). Mùa kỳ dị: tới 24
 * bối cảnh fuzz mà `when` của nhánh đúng, và biến thể phải vẫn qua `when` đó (tiền đề nhánh đã giữ lúc vào mùa).
 * Thẻ chung kết: dò cả dòng landing của từng lựa chọn. Mầm: dò title, text, nhãn các cửa mở.
 *
 * Danh sách cụm từ (FACT_RULES) bắt đầu khoan dung: chỉ cụm chính xác, đã chỉnh để không bắt nhầm nghĩa bóng
 * ("mắc nợ bà chủ một lần", "nợ ân tình"). Tiền đề do chính mùa dựng ra (mùa trốn nợ có gã đòi nợ trong dàn mới; mùa
 * xứ người cho một chỗ rửa bát) ghi trong PREMISE kèm lý do. Thêm một luật kèm: landing hay hint chung kết nói "trả
 * nợ / khép chuyện cũ bằng tiền" thì effects phải có repay:<x> (không thì lời hứa trả nợ không làm gì).
 */
type FactTag = "debt+" | "debt-" | "job+" | "job-" | "spouse+" | "spouse-" | "kids+" | "home+" | "home-";
/** legit: sự thật mà một lựa chọn trong mùa có thể đã tạo ra, làm câu khẳng định thành đúng (vd. vay → nợ; trả nợ → từng có nợ). */
/** ownLegit: sự thật mà chính lựa chọn mang chữ được phép nói (mặc định = legit). Với nợ: trả nợ (repay) không cho nhãn nói "trả nợ"
 * với người không nợ, nhưng một cờ chỉ lựa chọn trả nợ đặt (chỉ mở khi đang nợ) thì vẫn kéo theo "từng có nợ". */
interface FactRule { id: string; variants: string[]; legit: FactTag[]; ownLegit?: FactTag[]; re: RegExp; scarFull?: boolean }
const FACT_RULES: FactRule[] = [
  // Khẳng định đang có nợ (khi không nợ, không vật gài nợ, vết nợ rỗng). Bỏ nghĩa bóng: "như một chủ nợ", "trả nợ giờ".
  { id: "nợ", variants: ["no_debt"], legit: ["debt+", "debt-"], ownLegit: ["debt+"],
    re: /món nợ|khoản nợ|giấy nợ|tờ nợ|(?<!như (một )?)chủ nợ|đòi nợ|trả nợ(?! giờ)|nợ cũ|nợ nần|gánh nợ|ôm nợ|sạch nợ|hết nợ|khoản vay|món vay|nợ ngân hàng|tiền nợ/i },
  // Khẳng định không nợ (khi đang nợ).
  { id: "không nợ", variants: ["debt"], legit: ["debt-"], re: /không nợ ai|chẳng nợ ai|chưa nợ ai|không còn nợ|không một đồng nợ/i, scarFull: true },
  // Khẳng định đang đi làm công (khi không có việc hay đã về hưu). Lời mời một việc mới ("lương ít") thì không tính.
  { id: "việc", variants: ["no_job", "retired"], legit: ["job+"],
    re: /lương của bạn|tháng lương|năm lương|lương cũ|đồng nghiệp|chỗ làm|nơi làm việc của bạn|công ty (của )?bạn|sếp (của )?bạn|đi làm như thường|vẫn (còn )?đi làm|(?<!những (năm|ngày) )còn đi làm|xin nghỉ phép|nghỉ việc|bỏ việc|mất việc|tan ca|xin (hãng|công ty|sếp)/i, scarFull: true },
  // Khẳng định thất nghiệp hay đã thôi làm ("những năm còn đi làm") khi đang có việc.
  { id: "thất nghiệp", variants: ["job"], legit: ["job-"], re: /thất nghiệp|không có việc làm|chưa có việc làm|những (năm|ngày) còn đi làm/i, scarFull: true },
  // Lương hưu khi chưa về hưu (bỏ so sánh "đều như lương hưu").
  { id: "hưu", variants: ["no_job", "job"], legit: ["job-"], re: /(?<!như )lương hưu|tiền hưu|sổ hưu/i, scarFull: true },
  // Vợ/chồng đang có mặt (khi chưa cưới hay đã góa).
  { id: "vợ chồng", variants: ["single", "widowed"], legit: ["spouse+"],
    re: /vợ bạn|chồng bạn|vợ của bạn|chồng của bạn|bạn đời của bạn|vợ chồng bạn|hai vợ chồng|nhà chồng|nhà vợ|bố mẹ vợ|bố mẹ chồng|vợ hay chồng|vợ hoặc chồng|người bạn đời/i, scarFull: true },
  // Chưa từng cưới (khi đang có vợ chồng hay đã góa).
  { id: "chưa cưới", variants: ["married", "widowed"], legit: [],
    re: /bạn chưa từng (có )?(vợ|chồng|cưới|lấy|kết hôn)|bạn chưa (lấy|có) (vợ|chồng)|chưa từng có vợ có chồng/i, scarFull: true },
  { id: "độc thân", variants: ["married"], legit: ["spouse-"], re: /độc thân|ế vợ|ế chồng/i, scarFull: true },
  // Sở hữu nhà (khi không có nhà, hay đang sống nhờ).
  { id: "nhà", variants: ["no_home", "dependent"], legit: ["home+"],
    re: /bán nhà|sổ đỏ|giấy tờ nhà của bạn|căn nhà của bạn|nhà riêng của bạn|cầm cố nhà của bạn|thế chấp nhà/i, scarFull: true },
  // Thuê nhà (khi có nhà riêng, hay đang sống nhờ bố mẹ). "nhà nghỉ", "nhà hàng" không tính.
  { id: "thuê nhà", variants: ["home", "dependent"], legit: ["home-"],
    re: /tiền thuê nhà|tiền nhà(?! nghỉ| hàng| ăn)|thuê nhà|nhà thuê|chủ nhà trọ|phòng trọ của bạn|chủ trọ|chủ nhà (đòi|lấy lại|tăng giá)/i, scarFull: true },
  // Con cái (khi không có con). "các con số / con vật" không tính.
  { id: "con", variants: ["no_kids"], legit: ["kids+"],
    re: /con bạn|con của bạn|các con(?! (số|vật|đường|chữ|thú|gà|vịt|chó|mèo))|con trai (của )?bạn|con gái (của )?bạn|con cái|cháu nội của bạn|cháu ngoại của bạn|con cháu (của )?bạn|bố mẹ của con|đứa nhỏ nhà bạn/i, scarFull: true },
  // Không con (khi có con). "không có con số / con tem / con này" không tính.
  { id: "không con", variants: ["kids"], legit: [],
    re: /(chưa|không) có con(?![\p{L}])(?! (số|tem|này|nào|vật|gì|đường|phố|chữ|mèo|chó|gà|vịt|thú))|hiếm muộn|không con cái/iu, scarFull: true },
];
/**
 * Tiền đề do chính mùa / mầm dựng ra: luật được miễn (kèm lý do). `variants`: chỉ miễn ở các biến thể này (vd. lam_lai
 * chỉ miễn "thuê nhà" cho người có nhà riêng: người sống nhờ không vào được mùa). `cards`: chỉ miễn ở các thẻ này (tiền đề
 * dựng ở mở màn, thẻ khác vẫn bị dò).
 */
const PREMISE: Record<string, { rules: string[]; variants?: string[]; cards?: string[]; why: string }> = {
  tron_chay: { rules: ["nợ", "thuê nhà"], why: "mùa trốn nợ: đầu mùa reset.effects borrow:0.5 (R25, Task 20d) nên ai vào mùa cũng đang nợ; dàn mới có gã đòi nợ (vai creditor), bạn bỏ đi và thuê một căn gác" },
  lam_lai: { rules: ["thuê nhà"], variants: ["home"], why: "mùa bắt đầu trong một phòng trọ thuê, tiền về không (cả người có nhà riêng); người sống nhờ không vào được mùa (NEEDS_INDEPENDENT)" },
  xu_nguoi: { rules: ["thuê nhà"], why: "mùa sang nước khác: bạn thuê căn phòng dưới mái của bà chủ nhà" },
  w_S07: { rules: ["việc"], cards: ["s07_day_quen_giong"], why: "nhánh ký hợp đồng lên trạm sao Hỏa: thẻ mở màn s07_mo_buong cho mọi người một ca trực (job_switch, R25), dàn mới có chỉ huy trạm (first_boss)" },
  w_S33: { rules: ["việc"], cards: ["s33_mo_phong", "s33_mo_dong_nghiep", "s33_kd_mang", "s33_cl_ban_sao", "s33_day_dong_nghiep"], why: "nhánh nhận việc làm người thật cho máy: s33_mo_phong cho mọi người việc văn phòng (job_switch:office, R25); dàn mới có chị giám sát (first_boss) và người đồng nghiệp" },
  w_S50: { rules: ["không nợ"], why: "nhánh hệ thống xóa bạn khỏi mọi hồ sơ, xóa luôn sổ nợ: reset.effects repay:50 (R25) làm \"không còn nợ ai\" đúng thật; chung kết repay hay ghi lại nợ (borrow)" },
  w_X07: { rules: ["việc"], cards: ["x07_day_bua_com"], why: "nhánh bán bản quyền khuôn mặt cho hãng mì: hợp đồng với hãng là việc của mùa (dàn mới first_boss: chị đại diện của hãng)" },
  w_X22: { rules: ["hưu"], why: "nhánh giấy tờ cộng thêm ba mươi tuổi: sổ hưu, lương hưu theo tuổi trên giấy là tiền đề của mùa" },
  w_X37: { rules: ["nợ"], why: "nhánh thừa kế món nợ một triệu chiếc bánh của bà cô: giấy nợ trả bằng bánh là tiền đề của mùa (dàn mới có ông trưởng ban đòi bánh, vai creditor)" },
  w_X40: { rules: ["nợ"], why: "nhánh người của một ngày: người kia vay tiền dưới tên bạn là tiền đề của mùa (dàn mới có bà chủ tiệm cầm đồ, vai creditor)" },
  no_cu: { rules: ["nợ"], why: "mầm là một lời đòi nợ; khi không nợ gì, chữ nói rõ bạn không nhớ đã vay (lời đòi có thể sai)" },
};
/** Thẻ dùng cụm từ theo nghĩa khác (không khẳng định trạng thái của người chơi): miễn luật ở thẻ đó, kèm lý do. */
const NOT_ASSERT: Record<string, { rules: string[]; why: string }> = {
  s31_cl_ho_so: { rules: ["việc"], why: "người mất việc là cô nhân viên trạm chấm sao, không phải người chơi" },
  x01_ket: { rules: ["việc"], why: "\"như chào đồng nghiệp cũ\": con trâu Đốm từng cùng bạn làm \"đại biểu\" thôn, nghĩa bóng" },
  x14_kd_no_kem: { rules: ["nợ"], why: "khoản nợ thuế đi kèm tài sản thừa kế của cụ (tiền đề của mùa), không phải nợ cũ của người chơi" },
  x15_kd_viec: { rules: ["việc"], why: "người bị quỵt ba tháng lương là bạn cùng phòng" },
  x05_ket: { rules: ["nợ"], why: "\"món nợ cũ của ông\" (dự phòng của vết nợ) là nợ của người ông đã mất, điều kiện của phong bì cuối trong cuộc săn" },
};

const withRole = (c: FactContext, role: CastRole, on: boolean): Pick<FactContext, "cast" | "roles"> => {
  const cast = { ...c.cast }, roles = { ...c.roles };
  if (on) { const id = cast[role] ?? `cast_${role}`; cast[role] = id; roles[id] = [...new Set([...(roles[id] ?? []), role])]; }
  else { const id = cast[role]; delete cast[role]; if (id) { const rs = (roles[id] ?? []).filter((x) => x !== role); if (rs.length) roles[id] = rs; else delete roles[id]; } }
  return { cast, roles };
};
const withHouse = (c: FactContext, on: boolean): Partial<FactContext> => {
  const owns = new Set(c.owns), names = { ...c.asset_names };
  if (on) { owns.add("house"); names.house = names.house ?? "căn nhà ở đầu ngõ"; } else { owns.delete("house"); delete names.house; }
  return { owns, asset_names: names, home_owner: on };
};
const VARIANTS: Record<string, { min: number; f: (c: FactContext) => FactContext }> = {
  no_debt: { min: 0, f: (c) => ({ ...c, debt: 0, debt_ratio: 0, loans: 0, loan_burden: 0, plants: c.plants.filter((p) => p.kind !== "debt") }) },
  debt: { min: 18, f: (c) => ({ ...c, debt: 1.5 * c.income, debt_ratio: 1.5 }) },
  no_job: { min: 0, f: (c) => ({ ...c, has_job: false, job: "", retired: false }) },
  retired: { min: 50, f: (c) => ({ ...c, has_job: false, job: "", retired: true }) },
  job: { min: 18, f: (c) => ({ ...c, has_job: true, job: "thợ may", retired: false }) },
  single: { min: 0, f: (c) => ({ ...c, married: false, widowed: false, ...withRole(c, "spouse", false) }) },
  widowed: { min: 25, f: (c) => ({ ...c, married: false, widowed: true, ...withRole(c, "spouse", false) }) },
  married: { min: 18, f: (c) => ({ ...c, married: true, widowed: false, ...withRole(c, "spouse", true) }) },
  no_home: { min: 0, f: (c) => ({ ...c, ...withHouse(c, false) }) },
  home: { min: 18, f: (c) => ({ ...c, ...withHouse(c, true) }) },
  dependent: { min: 0, f: (c) => ({ ...c, ...withHouse(c, false), independent: false }) },
  no_kids: { min: 0, f: (c) => ({ ...c, kids_alive: 0, kids_teen: 0, kids_school: 0, ...withRole(c, "child", false) }) },
  kids: { min: 25, f: (c) => ({ ...c, kids_alive: 2, kids_teen: c.age >= 32 ? 1 : 0, kids_school: 1, ...withRole(c, "child", true) }) },
};
/** Sự thật một lựa chọn tạo ra hay xóa đi. */
function factTags(e: Effect, out = new Set<FactTag>()): Set<FactTag> {
  for (const p of customParts(e)) {
    const k = p.split(":")[0];
    if (k === "borrow") out.add("debt+");
    else if (k === "repay" || k === "restructure") out.add("debt-");
    else if (k === "marry") out.add("spouse+");
    else if (k === "spouse_leave") out.add("spouse-");
    else if (k === "have_child") out.add("kids+");
    else if (k === "job_new" || k === "become" || k === "job_switch") out.add("job+");
    else if (k === "job_lose" || k === "job_lose_maybe" || k === "retire") out.add("job-");
  }
  if (e.buy?.kind === "house") out.add("home+");
  if (e.sell?.kind === "house") out.add("home-");
  if (e.gamble) { factTags(e.gamble.win, out); factTags(e.gamble.lose, out); }
  return out;
}
const snippet = (s: string, re: RegExp): string => {
  const m = re.exec(s); if (!m) return s.slice(0, 80);
  const a = Math.max(0, m.index - 40), b = Math.min(s.length, m.index + m[0].length + 40);
  return (a > 0 ? "…" : "") + s.slice(a, b) + (b < s.length ? "…" : "");
};
/** Kit vết rỗng hay đầy cho probe (không ghi nhận dùng vết). */
const probeKit = (def: SeasonDef, full: boolean): SeasonKit => fakeKit(def, !full, { scar: new Set(), gag: false, npcBad: new Set() }, 0);
/** Dòng landing hay hint/nhãn hứa trả nợ, khép chuyện cũ bằng tiền. */
const REPAY_CLAIM = /trả (sạch|hết|dứt|đủ|xong|nốt|nợ)|sạch nợ|hết nợ|khép (nốt )?(chuyện|món nợ|khoản)|gửi (tiền )?về khép|trả chuyện cũ|tiền trả chuyện/i;

function probeFacts(): { hits: Map<string, string>; repay: Map<string, string>; cards: number; seeds: number; builds: number } {
  const hits = new Map<string, string>(), repay = new Map<string, string>();
  let cards = 0, builds = 0;
  /** strs: [chữ, sự thật mà lựa chọn mang chữ ấy tự tạo ra]. Nhãn / hint / dòng landing của lựa chọn tạo ra đúng sự thật đó thì được nói về nó. */
  const scan = (where: string, owner: string, cardId: string, variant: string, strs: [string, Set<FactTag>][], full: boolean) => {
    for (const rule of FACT_RULES) {
      if (!rule.variants.includes(variant) || (full && !rule.scarFull)) continue;
      const pr = PREMISE[owner];
      if (pr && pr.rules.includes(rule.id) && (!pr.variants || pr.variants.includes(variant)) && (!pr.cards || pr.cards.includes(cardId))) continue;
      if (NOT_ASSERT[cardId]?.rules.includes(rule.id)) continue;
      for (const [s, own] of strs) if (!(rule.ownLegit ?? rule.legit).some((t) => own.has(t)) && rule.re.test(s)) { const key = `${where} [${rule.id} @ ${variant}]`; if (!hits.has(key)) hits.set(key, snippet(s, rule.re)); break; }
    }
  };
  const NONE = new Set<FactTag>();
  const normalBase = Array.from({ length: 24 }, (_, i) => { const c = randomCtx(createRng(9100 + i)); return { ...c, age: Math.max(8, c.age) }; });
  const rng = createRng(9300);
  const weirdPool = Array.from({ length: 400 }, (_, i) => { const c = weirdCtx(rng); return { c, s: fillSlots(KY_FUZZ, c, c.plants, fakeN(i % 2 === 0))! }; });
  const gateOf = new Map<string, (c: FactContext) => boolean>();
  for (const b of WEIRD) gateOf.set(b.season.id, (c) => { try { return b.when(c, fillSlots(KY_FUZZ, c, c.plants, fakeN(false))!); } catch { return false; } });
  const NEEDS_INDEP = new Set(["tron_chay", "xu_nguoi", "lam_lai"]);

  for (const def of ALL_SEASONS) {
    const gate = gateOf.get(def.id) ?? ((c: FactContext) => c.age >= 8 && (!NEEDS_INDEP.has(def.id) || c.independent));
    const bases = def.weird ? weirdPool.map((x) => x.c).filter(gate).slice(0, 24) : normalBase;
    // Cờ / bộ đếm do lựa chọn trong mùa đặt, cùng sự thật mà lựa chọn ấy tạo ra.
    // Một khóa chỉ "kéo theo" sự thật T khi MỌI lựa chọn đặt nó đều tạo ra T (giao các tập): bộ đếm s35_nuot đặt bởi
    // cả lựa chọn xóa nợ lẫn lựa chọn thả hóa đơn thì không kéo theo nợ.
    const keyTags = new Map<string, Set<FactTag>>();
    const note = (e: Effect, tags: Set<FactTag>) => {
      for (const k of [...(e.flags ?? []), ...Object.keys(e.counters ?? {})]) { const t = keyTags.get(k); keyTags.set(k, t ? new Set([...t].filter((x) => tags.has(x))) : new Set(tags)); }
      if (e.gamble) { note(e.gamble.win, tags); note(e.gamble.lose, tags); }
    };
    def.beats.forEach((beat, bi) => beat.forEach((card) => [...bases.slice(0, 6), ...normalBase.slice(0, 6)].forEach((p) => {
      const c: FactContext = { ...p, season: def.id, season_beat: bi, counters: { ...p.counters, season_next: p.age } };
      try { if (card.when && !card.when(c)) return; for (const ch of card.build(c, probeKit(def, true)).choices) note(ch.effects, factTags(ch.effects)); } catch { /* đã báo ở fuzz */ }
    })));
    const fullFor = (legit: FactTag[]) => {
      const flags: string[] = [], counters: Record<string, number> = {};
      for (const [k, tags] of keyTags) if (!legit.some((t) => tags.has(t))) { flags.push(k); counters[k] = 3; }
      return { flags, counters };
    };
    const landingLine = new Map(def.landings.map((l) => [l.id, l.line]));
    for (const base of bases) for (const [vn, v] of Object.entries(VARIANTS)) {
      if (base.age < v.min) continue;
      if (vn === "dependent" && NEEDS_INDEP.has(def.id)) continue;
      const cv = v.f(base);
      if (def.weird && !gate(cv)) continue;
      const legits = new Map(FACT_RULES.filter((r) => r.variants.includes(vn)).map((r) => [r.legit.join(","), r.legit]));
      const modes = [{ flags: [] as string[], counters: {} as Record<string, number> }, ...[...legits.values()].map(fullFor)];
      for (const m of modes) def.beats.forEach((beat, bi) => beat.forEach((card) => {
        const c: FactContext = { ...cv, season: def.id, season_beat: bi, flags: new Set([...cv.flags, ...m.flags]), counters: { ...cv.counters, ...m.counters, season_next: cv.age } };
        try { if (card.when && !card.when(c)) return; } catch { return; }
        for (const full of [false, true]) {
          let view: StoryletView;
          try { view = card.build(c, probeKit(def, full)); } catch { continue; }
          builds++;
          const strs: [string, Set<FactTag>][] = [[view.title, NONE], [view.text, NONE]];
          for (const ch of view.choices) {
            const own = factTags(ch.effects);
            strs.push([ch.label, own], [ch.hint ?? "", own]);
            const l = bi === 4 ? landingOf(ch.effects) : null;
            if (l && landingLine.has(l)) strs.push([landingLine.get(l)!, own]);
          }
          scan(`${def.id} ${card.id}`, def.id, card.id, vn, strs, full);
        }
      }));
    }
    def.beats.forEach((beat) => { cards += beat.length; });
    // Hứa trả nợ mà không repay: landing (dòng, hay hint/nhãn của lựa chọn chung kết đáp xuống nó). Món nợ là tiền đề của
    // mùa (PREMISE "nợ": nợ bánh, nợ do người kia vay, sổ nợ bị xóa…) không nằm trong sổ của host, nên không cần repay.
    if (!PREMISE[def.id]?.rules.includes("nợ")) for (const l of def.landings) if (REPAY_CLAIM.test(l.line) && !customParts(l.effects).some((p) => p.startsWith("repay"))) repay.set(`${def.id} landing ${l.id}: dòng hứa trả nợ / khép chuyện cũ nhưng effects không có repay:<x>`, snippet(l.line, REPAY_CLAIM));
    if (!PREMISE[def.id]?.rules.includes("nợ")) for (const card of def.beats[4]) for (const p of normalBase.slice(0, 8)) {
      const c: FactContext = { ...p, age: 30, season: def.id, season_beat: 4, counters: { ...p.counters, season_next: 30 } };
      try {
        if (card.when && !card.when(c)) continue;
        for (const ch of card.build(c, probeKit(def, true)).choices) {
          const s = `${ch.label} / ${ch.hint ?? ""}`;
          if (REPAY_CLAIM.test(s) && !customParts(ch.effects).some((x) => x.startsWith("repay"))) repay.set(`${def.id} ${card.id}: lựa chọn «${ch.label}» hứa trả nợ / khép chuyện cũ nhưng landing không có repay:<x>`, snippet(s, REPAY_CLAIM));
        }
      } catch { /* đã báo */ }
    }
  }

  // Mầm: tiêu đề, chữ, nhãn cửa mở.
  let seeds = 0;
  for (const seed of CANON_SEEDS) {
    seeds++;
    const [a0, a1] = seed.ages ?? [8, 72];
    const bases = Array.from({ length: 60 }, (_, i) => { const c = randomCtx(createRng(9500 + i)); return { ...c, age: a0 + (c.age % (a1 - a0 + 1)) }; });
    for (const base of bases) for (const [vn, v] of Object.entries(VARIANTS)) {
      if (base.age < v.min) continue;
      const c = v.f(base);
      for (const empty of [false, true]) {
        const N = fakeN(empty);
        const s = fillSlots(seed, c, c.plants, N);
        if (!s) continue;
        builds++;
        const strs: [string, Set<FactTag>][] = [[seed.title(s, c, N), NONE], [seed.text(s, c, N), NONE],
          ...seed.doors.filter((d) => !d.when || d.when(c, s)).flatMap((d): [string, Set<FactTag>][] => [[d.label(s, c, N), NONE], [d.hint, NONE]])];
        scan(`mầm ${seed.id}`, seed.id, seed.id, vn, strs, false);
      }
    }
  }
  return { hits, repay, cards, seeds, builds };
}

{
  const r = probeFacts();
  for (const [key, sample] of r.hits) bad(`quy tắc 9 ${key} — «${sample}»`);
  for (const [key, sample] of r.repay) bad(`${key} — «${sample}»`);
  ok(r.cards > 800 && r.builds > 20000, `probe quy tắc 9 dựng quá ít (${r.cards} thẻ, ${r.builds} lần dựng)`);
  if (process.env.PROBE_STATS) console.log(`probe quy tắc 9: ${r.cards} thẻ, ${r.seeds} mầm, ${r.builds} lần dựng, ${r.hits.size} vi phạm`);
}

/* ------------------------------------------------------------------ R25: thay đổi tình thế của mỗi mùa (Task 20d)
 *
 * Ruling R25 (Tùng): mỗi Mùa có ít nhất một thay đổi tình thế có tác dụng thật, phù hợp với tiền đề và được sử dụng
 * trong diễn biến. Bộ kiểm chỉ bắt phần kiểm được bằng máy; "phù hợp tiền đề" và "dùng có ý nghĩa" phải đọc và chơi thử.
 * Bảng phân lớp 105 mùa (đạt / chỉ bằng lời kể / mâu thuẫn): argon/docs/canon/season-change-audit.md, sinh bằng
 * argon/tools/season-change-audit.js.
 *  1. Mỗi mùa khai báo ít nhất một thay đổi lúc vào mùa: reset.cash, reset.effects, luật mùa (rules.income ≠ 1,
 *     rules.yearly), hay một lựa chọn ở thẻ mở màn có hiệu ứng trạng thái (tiền, custom việc / nợ / nơi ở / quan hệ /
 *     thời gian, mua / bán, hệ số thu nhập, lòng tin, lời hứa). Cờ thế giới rules.flags không tính: không ai đọc chúng.
 *  2. Cờ / bộ đếm đặt ở reset.effects phải được một thẻ của mùa đọc (FactContext bọc Proxy ghi lại lượt đọc).
 *  3. Cờ / bộ đếm do lựa chọn ở nhịp 0–3 đặt mà không thẻ nào cùng hay sau nhịp đó đọc, cũng không file nào khác nhắc
 *     tới: tổng phải bằng đúng DEAD_KEYS_MAX (lúc Task 20d có 1352). Tăng thì FAIL; giảm thì cũng FAIL, để hạ hằng số xuống
 *     theo (trần chỉ đi xuống). Viết thẻ mới thì đọc lại cờ mình đặt.
 *  4. Chung kết: landing migrate_now chỉ được mở khi migrateOk(c) (tự lập và còn nước để đi; host bỏ migrate_now với người
 *     chưa tự lập); landing move_city không mở cho người dưới 18 tuổi ở những mùa người dưới 18 tuổi chơi tới chung kết được.
 *  5. Mâu thuẫn đã sửa ở Task 20d (CONTRADICTIONS trong canon-r25.ts) không được quay lại; 13 mùa của bản demo
 *     (DEMO_SEASONS) phải ở lớp "đạt": có thay đổi tình thế chắc chắn lúc vào mùa (entryChanges, cùng định nghĩa với bảng).
 * Host (doi-nguoi/canon.js enterSeason) không tự đổi nghề hay tiền khi mùa không khai báo: chỉ reset.cash (người tự lập),
 * reset.effects và hệ số rules.income. doi-nguoi/tests/season-entry-test.js kiểm điều đó trên cả 105 mùa.
 */
const DEAD_KEYS_MAX = 1352;
{
  const STATE_CUSTOM = /^(borrow|repay|restructure|job_new|job_lose|job_lose_maybe|job_switch|retire|become|study|move_city|migrate_now|return_home|marry|spouse_leave|have_child|age_skip|longevity|confess_hook|explode_hook|apologize|swap_other|remark|money_season|migrate_sure)(:|$)/;
  const declares = (e: Effect | undefined): boolean => !!e && ((e.money ?? 0) !== 0 || customParts(e).some((p) => STATE_CUSTOM.test(p))
    || !!e.buy || !!e.sell || e.income_mult !== undefined || !!e.trust || !!e.promise || (!!e.gamble && (declares(e.gamble.win) || declares(e.gamble.lose))));
  /** FactContext bọc Proxy: ghi "ctx:<trường>", "flag:<cờ>", "counter:<khóa>" mỗi lần `when` hay chữ của thẻ đọc. */
  const track = (c: FactContext, rec: Set<string>): FactContext => {
    const flags = new Set(c.flags), has0 = flags.has.bind(flags);
    flags.has = (x: string) => { rec.add("flag:" + x); return has0(x); };
    const counters = new Proxy({ ...c.counters }, { get: (t, k) => { if (typeof k === "string") rec.add("counter:" + k); return (t as Record<string, number>)[k as string]; } });
    return new Proxy({ ...c, flags, counters } as FactContext, { get: (t, k) => { if (typeof k === "string" && k !== "flags" && k !== "counters") rec.add("ctx:" + k); return (t as unknown as Record<string, unknown>)[k as string]; } });
  };
  const keysOf = (e: Effect, out: Set<string>): Set<string> => {
    for (const f of e.flags ?? []) out.add("flag:" + f);
    for (const k of Object.keys(e.counters ?? {})) out.add("counter:" + k);
    if (e.gamble) { keysOf(e.gamble.win, out); keysOf(e.gamble.lose, out); }
    return out;
  };
  const kitOf = (def: SeasonDef): SeasonKit => fakeKit(def, false, { scar: new Set(), gag: false, npcBad: new Set() }, 0);
  const view = (def: SeasonDef, card: SeasonDef["beats"][number][number], c: FactContext, rec?: Set<string>): StoryletView | null => {
    const t = rec ? track(c, rec) : c;
    try { if (card.when && !card.when(t)) return null; return card.build(t, kitOf(def)); } catch { return null; }
  };
  const rng = createRng(2520);
  const ctxs: FactContext[] = [];
  while (ctxs.length < 10) { const c = randomCtx(rng); if (c.age >= 8) ctxs.push(c); }

  /* Văn bản nguồn: một khóa mà file khác (host, Codex, mùa khác) nhắc tới thì coi là có người đọc. */
  const srcRoot = new URL("./", import.meta.url).pathname;
  const files = new Map<string, string>();
  const walk = (d: string) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = d + "/" + e.name; if (e.isDirectory()) walk(p); else if (/\.(ts|js)$/.test(e.name)) files.set(p, readFileSync(p, "utf8")); } };
  walk(srcRoot + "engine");
  for (const f of readdirSync(srcRoot + "../../doi-nguoi")) if (f.endsWith(".js")) files.set(f, readFileSync(srcRoot + "../../doi-nguoi/" + f, "utf8"));
  const ownFile = (id: string) => [...files.keys()].find((f) => /\/canon\/(seasons|weird)\//.test(f) && files.get(f)!.includes(`id: "${id}"`));
  const elsewhere = (key: string, own: string | undefined) => [...files].some(([f, s]) => f !== own && s.includes(`"${key}"`));

  let dead = 0;
  const probeBase: FactContext = { ...randomCtx(createRng(77)), age: 35 };
  const demo = new Set(DEMO_SEASONS);
  for (const def of ALL_SEASONS) {
    const S = `R25 mùa ${def.id}`;
    // 5. mâu thuẫn đã sửa không quay lại; mùa demo ở lớp "đạt"
    const { changes } = entryChanges(def, ctxs, (d, card, c) => view(d, card, c));
    const k = CONTRADICTIONS[def.id];
    if (k && k.open(probeOf(def, changes, probeBase, (d, card, c) => view(d, card, c)))) bad(`${S}: mâu thuẫn đã sửa ở Task 20d quay lại — ${k.claim} (cách sửa: ${k.fix})`);
    if (demo.has(def.id) && !changes.length) bad(`${S}: mùa của bản demo phải có thay đổi tình thế chắc chắn lúc vào mùa (lớp "đạt", R25)`);
    // 1. khai báo ít nhất một thay đổi lúc vào mùa
    const first = def.beats[0].some((card) => ctxs.some((c) => view(def, card, { ...c, season: def.id, season_beat: 0 })?.choices.some((ch) => declares(ch.effects))));
    const declared = def.reset.cash !== undefined || declares(def.reset.effects) || !!def.reset.effects?.flags?.length
      || (def.rules.income !== undefined && def.rules.income !== 1) || (!!def.rules.yearly && Object.keys(def.rules.yearly).length > 0) || first;
    if (!declared) bad(`${S}: không khai báo thay đổi tình thế nào lúc vào mùa (reset, rules.income / rules.yearly, hay hiệu ứng ở thẻ mở màn) — xem R25`);
    // lượt đọc của mọi thẻ: không cờ, đủ cờ của mùa, một nửa số cờ
    const setBy = new Map<string, { card: string; beat: number }>();
    def.beats.forEach((beat, bi) => beat.forEach((card) => ctxs.forEach((c) => {
      const v = view(def, card, { ...c, season: def.id, season_beat: bi });
      if (v && bi < 4) for (const ch of v.choices) for (const k of keysOf(ch.effects, new Set())) if (!setBy.has(k)) setBy.set(k, { card: card.id, beat: bi });
    })));
    const resetKeys = keysOf(def.reset.effects ?? {}, new Set());
    const all = [...setBy.keys(), ...resetKeys];
    const reads = new Map<string, Set<string>>();
    def.beats.forEach((beat, bi) => beat.forEach((card) => ctxs.forEach((c, i) => {
      const modes = [new Set<string>(), new Set(all), new Set(all.filter((_, j) => (i + j) % 2 === 0))];
      for (const on of modes) {
        const flags = new Set(c.flags), counters: Record<string, number> = { ...c.counters, season_next: c.age };
        for (const k of on) { if (k.startsWith("flag:")) flags.add(k.slice(5)); else counters[k.slice(8)] = 3; }
        const rec = new Set<string>();
        view(def, card, { ...c, flags, counters, season: def.id, season_beat: bi }, rec);
        for (const r of rec) { if (!reads.has(r)) reads.set(r, new Set()); reads.get(r)!.add(`${card.id}@${bi}`); }
      }
    })));
    const readAfter = (key: string, beat: number, except: string) => [...(reads.get(key) ?? [])].some((x) => { const [id, b] = x.split("@"); return id !== except && Number(b) >= beat; });
    // 2. cờ / bộ đếm của reset.effects phải có thẻ đọc
    for (const k of resetKeys) if (!readAfter(k, 0, "")) bad(`${S}: reset.effects đặt ${k} nhưng không thẻ nào của mùa đọc nó (R25: cờ chỉ tính khi được đọc và dùng)`);
    // 3. cờ / bộ đếm do lựa chọn đặt mà không ai đọc (đếm chung, chặn trần)
    const own = ownFile(def.id);
    for (const [k, s] of setBy) if (!readAfter(k, s.beat, s.card) && !elsewhere(k.replace(/^(flag|counter):/, ""), own)) dead++;
    // 4. chung kết: migrate_now cần migrateOk; move_city không cho người dưới 18 tuổi
    const minorCanFinish = def.weird
      ? WEIRD.some((b) => b.season.id === def.id && ctxs.concat(Array.from({ length: 60 }, (_, i) => weirdCtx(createRng(900 + i)))).some((c) => {
        for (let a = 8; a + def.years[0] < 18; a++) { try { if (b.when({ ...c, age: a, independent: false, has_job: false }, { noi: "", fromPlayer: 0 })) return true; } catch { /* đã báo */ } }
        return false;
      }))
      : def.years[0] + 8 < 18 && !["tron_chay", "xu_nguoi", "lam_lai"].includes(def.id);
    for (const card of def.beats[4]) for (const c0 of ctxs) {
      const probes: [Partial<FactContext>, string][] = [[{ independent: false, can_migrate: true }, "người chưa tự lập"], [{ independent: true, can_migrate: false }, "người không còn nước để đi"]];
      if (minorCanFinish) for (let age = 8 + def.years[0]; age < 18; age++) probes.push([{ age, independent: false, has_job: false, married: false }, `người ${age} tuổi`]);
      for (const [over, who] of probes) {
        const c: FactContext = { ...c0, ...over, age: over.age ?? Math.max(20, c0.age), season: def.id, season_beat: 4, counters: { ...c0.counters, season_next: 0 } };
        const v = view(def, card, c);
        for (const ch of v?.choices ?? []) {
          const parts = customParts(ch.effects);
          if (parts.includes("migrate_now") && (!c.independent || !c.can_migrate)) bad(`${S} ${card.id}: landing ${landingOf(ch.effects)} có migrate_now nhưng vẫn mở cho ${who} (dùng migrateOk(c) trong kit.ts)`);
          if (parts.includes("move_city") && c.age < 18) bad(`${S} ${card.id}: landing ${landingOf(ch.effects)} cho ${who} chuyển đi một mình (move_city)`);
        }
      }
    }
  }
  if (dead > DEAD_KEYS_MAX) bad(`R25: ${dead} cờ / bộ đếm do lựa chọn đặt mà không thẻ nào đọc lại, trần là ${DEAD_KEYS_MAX} (đọc lại cờ mình đặt, hoặc bỏ cờ thừa)`);
  if (dead < DEAD_KEYS_MAX) bad(`R25: hạ DEAD_KEYS_MAX xuống ${dead} (trần chỉ đi xuống)`);
  if (process.env.PROBE_STATS) console.log(`R25: ${dead} cờ / bộ đếm không ai đọc (trần ${DEAD_KEYS_MAX})`);
}

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log(`canon-content-test: OK (${ALL_SEASONS.length} mùa, ${compiled.length} thẻ, ${WEIRD.length} nhánh kỳ dị)`);
