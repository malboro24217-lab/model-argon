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
 *  - id thẻ duy nhất trên toàn kho (cả id đã biên dịch so với các kho khác của engine).
 * Cộng các kiểm đơn vị cho seasonLength, beatGap, isDurable, compileSeason, seasonKitFromNames.
 */
import {
  createRng, PATHS, STORYLETS, MICRO, BRANCHES, BRANCHES2, LIFE_VARIANTS, TEMPER_LIFE, TEMPER2_ECHO, PATH_STORYLETS, TURNING_STORYLETS,
  SEASONS, SEASON_STORYLETS, BEATS, compileSeason, seasonLength, beatGap, isDurable, seasonKitFromNames, landingOf,
  type SeasonDef, type SeasonKit, type FactContext, type Effect, type StoryletView,
} from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";
import { land, ending } from "./engine/narrative/canon/kit.ts";

let fails = 0;
const seen = new Set<string>();
const bad = (m: string) => { if (seen.has(m)) return; seen.add(m); fails++; if (fails <= 200) console.log("FAIL " + m); };
const ok = (cond: boolean, msg: string) => { if (!cond) bad(msg); };

/** Mọi mùa phải kiểm. Task 6 thêm mùa thật, Task 10–19 thêm `...WEIRD.map((b) => b.season)`. */
const ALL_SEASONS: SeasonDef[] = [...SEASONS];

/* ------------------------------------------------------------------ kiểm đơn vị */

ok(beatGap(12) === 2, "beatGap(12) === 2");
ok(beatGap(3) === 1 && beatGap(1) === 1 && beatGap(20) === 4 && beatGap(8) === 2, "beatGap = max(1, round(len/5))");
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
  "season_end", "age_skip", "longevity", "swap_other", "remark",
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

/** Hệ số thu nhập của mùa: > 0 và ≤ 50 (S39 "thu nhập ×50" là trần). */
const incomeOk = (x: number): boolean => x > 0 && x <= 50;
ok(incomeOk(50) && !incomeOk(51) && !incomeOk(0) && !incomeOk(-1) && incomeOk(0.5), "rules.income: 50 qua, 51 / 0 / âm trượt");

const allCardIds = new Set<string>();
const seasonIds = new Set<string>();
const otherIds = new Set([...STORYLETS, ...MICRO, ...BRANCHES, ...BRANCHES2, ...LIFE_VARIANTS, ...TEMPER_LIFE, ...TEMPER2_ECHO, ...PATH_STORYLETS, ...TURNING_STORYLETS].map((s) => s.id));

function checkSeason(def: SeasonDef): void {
  const S = `mùa ${def.id}`;
  if (!/^[a-z0-9_]+$/.test(def.id)) bad(`${S}: id chỉ gồm a-z 0-9 _`);
  if (seasonIds.has(def.id)) bad(`${S}: id mùa trùng`); seasonIds.add(def.id);
  if (!def.vn || !hasVN(def.vn) || def.vn.length > 40) bad(`${S}: vn rỗng, không dấu hoặc > 40 ký tự`);
  if (!/^#[0-9a-f]{6}$/i.test(def.color)) bad(`${S}: color phải dạng #rrggbb`);
  const [y0, y1] = def.years;
  if (!(Number.isInteger(y0) && Number.isInteger(y1) && y0 >= 5 && y0 <= y1 && y1 <= 20 && y0 <= 85 - 72)) bad(`${S}: years [${y0}, ${y1}] phải là số nguyên, 5 ≤ đầu ≤ cuối ≤ 20, đầu ≤ 13`);
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
ok(SEASON_STORYLETS.length === SEASONS.flatMap(compileSeason).length, "SEASON_STORYLETS = SEASONS.flatMap(compileSeason)");

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

if (fails) { console.log(`${fails} FAIL`); process.exit(1); }
console.log(`canon-content-test: OK (${ALL_SEASONS.length} mùa, ${compiled.length} thẻ)`);
