/**
 * Kiểm một gói nội dung trước khi gộp. Chạy:
 *   node --experimental-strip-types src/check-pack.ts src/engine/narrative/paths/<file>.ts [--news]
 * In "PASS check-pack" khi đạt; ngược lại in từng lỗi và thoát mã 1.
 */
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { STORYLETS, MICRO, BRANCHES, BRANCHES2, LIFE_VARIANTS, TEMPER_LIFE, TEMPER2_ECHO, PATH_STORYLETS, PATHS, createRng, type Storylet, type Effect } from "./engine/index.ts";
import { randomCtx } from "./fuzz-ctx.ts";

const file = process.argv[2];
const isNews = process.argv.includes("--news") || process.argv.includes("--money");
if (!file) { console.error("usage: check-pack.ts <pack.ts> [--news]"); process.exit(2); }
const mod = await import(pathToFileURL(resolve(file)).href) as Record<string, unknown>;
const pack: Storylet[] = Object.values(mod).filter(Array.isArray).flat() as Storylet[];
const problems: string[] = [];
const seen = new Set<string>();
const bad = (m: string) => { if (!seen.has(m) && problems.length < 200) { seen.add(m); problems.push(m); } };

const existing = new Set([...STORYLETS, ...MICRO, ...BRANCHES, ...BRANCHES2, ...LIFE_VARIANTS, ...TEMPER_LIFE, ...TEMPER2_ECHO, ...PATH_STORYLETS].map((s) => s.id));
const own = new Set<string>();
for (const s of pack) {
  if (!s || typeof s.id !== "string") { bad("export contains a non-storylet"); continue; }
  if (own.has(s.id)) bad(`${s.id}: duplicate id inside pack`);
  if (existing.has(s.id) && !PATH_STORYLETS.includes(s)) bad(`${s.id}: id already used elsewhere`);
  own.add(s.id);
  if (!s.meta) bad(`${s.id}: not built with a kit helper (talent/door/beat/daily/cross/news)`);
}
const allIds = new Set([...existing, ...own]);

/* ---- cấu trúc theo con đường ---- */
const paths = [...new Set(pack.map((s) => s.meta?.path).filter((p): p is string => !!p))];
if (!isNews) {
  if (!paths.length) bad("pack declares no path (meta.path) — use the kit helpers");
  for (const p of paths) {
    if (!PATHS[p]) { bad(`unknown path id '${p}' (see paths/registry.ts)`); continue; }
    const of = (k: string) => pack.filter((s) => s.meta?.path === p && s.meta?.kind === k);
    const beats = of("beat").map((s) => s.id).sort();
    for (let n = 1; n <= 5; n++) if (!beats.includes(`${p}_b${n}`)) bad(`${p}: missing beat ${n}`);
    if (PATHS[p]!.talent.length && of("talent").length < 1) bad(`${p}: needs ≥1 talent card (registry lists tempers)`);
    if (of("door").length < 2) bad(`${p}: needs ≥2 door cards`);
    if (of("daily").length < 9) bad(`${p}: needs ≥9 daily cards (has ${of("daily").length})`);
    if (of("cross").length < 1) bad(`${p}: needs ≥1 cross card`);
    const total = pack.filter((s) => s.meta?.path === p).length;
    if (total < 18) bad(`${p}: ${total} cards < 18`);
  }
}

/* ---- fuzz: build hợp lệ, hiệu ứng hợp lệ, mỗi thẻ đều bắn được ---- */
const marks = (e: Effect | undefined): boolean => !!e && !!(e.buy || e.sell || e.lifestyle || e.deposit || e.withdraw || e.lend || e.give || e.insure || e.uninsure || e.support || e.flags?.length || e.unflags?.length || e.later || e.memory || e.secret || e.promise || e.close_doors?.length || e.trust || e.custom || e.game || (e.counters && Object.keys(e.counters).length) || (e.gamble && (marks(e.gamble.win) || marks(e.gamble.lose))));
function walk(e: Effect, age: number, where: string): void {
  if (e.later?.storylet && !allIds.has(e.later.storylet)) bad(`${where}: later → unknown storylet '${e.later.storylet}'`);
  if (age < 18 && typeof e.money === "number" && Math.abs(e.money) > 0.05) bad(`${where}: money ${e.money} for a child (age ${age}) — max ±0.05 of household income`);
  if (age < 12 && (e.game || e.trust)) bad(`${where}: game/trust under 12`);
  if (e.custom) for (const part of e.custom.split("|")) { const k = part.split(":")[0]!; if (!["borrow","repay","restructure","job_lose","job_lose_maybe","job_new","job_switch","scholar","return_home","spouse_leave","apologize","explode_hook","confess_hook","shop_end","become"].includes(k)) bad(`${where}: unknown custom '${k}'`); if (k === "become" && !PATHS[part.split(":")[1] ?? ""]) bad(`${where}: become → unknown path`); }
  const KINDS = ["house", "land", "vehicle", "shop", "gold", "deposit", "stake"];
  if (e.buy) { if (!KINDS.includes(e.buy.kind)) bad(`${where}: buy.kind '${e.buy.kind}'`); if (!(e.buy.price > 0 && e.buy.price <= 40)) bad(`${where}: buy.price ${e.buy.price} must be in (0,40] years of income`); if (!e.buy.name) bad(`${where}: buy needs a name`); if (age < 18) bad(`${where}: buy under 18`); }
  if (e.sell && !e.sell.kind && !e.sell.name) bad(`${where}: sell needs kind or name`);
  if (e.lifestyle && !["tan_tien", "vua_phai", "thoai_mai", "pho_truong"].includes(e.lifestyle)) bad(`${where}: lifestyle '${e.lifestyle}'`);
  for (const k of ["deposit", "withdraw"] as const) { const v = e[k]; if (v !== undefined && !(v > 0 && v <= 5)) bad(`${where}: ${k} ${v} must be in (0,5]`); }
  if (e.lend && !(e.lend.amount > 0 && e.lend.amount <= 5 && e.lend.years >= 1)) bad(`${where}: lend amount (0,5], years ≥ 1`);
  if (e.give && !(e.give.amount > 0 && e.give.amount <= 5)) bad(`${where}: give amount (0,5]`);
  if (e.support && !(["parents", "kids"].includes(e.support.who) && ["it", "du", "hau"].includes(e.support.level))) bad(`${where}: support`);
  if ((e.lend || e.give || e.deposit || e.withdraw || e.insure) && age < 18) bad(`${where}: money action under 18`);
  if (e.gamble) { if (!(e.gamble.p > 0 && e.gamble.p < 1)) bad(`${where}: gamble.p must be in (0,1)`); walk(e.gamble.win, age, where + "/win"); walk(e.gamble.lose, age, where + "/lose"); }
}
const fired = new Map<string, number>();
const rng = createRng(17);
const N = (id: string) => id.replace("cast_", "").toUpperCase();
for (let i = 0; i < 30000; i++) {
  const ctx = randomCtx(rng, paths);
  for (const s of pack) {
    let ok = false; try { ok = s.prerequisites(ctx); } catch (e) { bad(`${s.id}: prerequisites threw ${String(e)}`); continue; }
    if (!ok) continue;
    try { s.specificity(ctx); } catch (e) { bad(`${s.id}: specificity threw ${String(e)}`); }
    let v; try { v = s.build(ctx, N); } catch (e) { bad(`${s.id}: build threw ${String(e)}`); continue; }
    fired.set(s.id, (fired.get(s.id) ?? 0) + 1);
    if ((fired.get(s.id) ?? 0) > 3) continue; // view checks on the first few builds only
    if (!v.title || v.title.length > 60) bad(`${s.id}: title missing or > 60 chars`);
    if (!v.text || v.text.length > 600) bad(`${s.id}: text missing or > 600 chars`);
    if (!/[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(v.title + v.text)) bad(`${s.id}: text is not Vietnamese with diacritics`);
    if (v.choices.length < 2 || v.choices.length > 4) bad(`${s.id}: needs 2–4 choices (has ${v.choices.length})`);
    if (!(v.def >= 0 && v.def < v.choices.length)) bad(`${s.id}: def out of range`);
    if (!v.choices.some((c) => marks(c.effects))) bad(`${s.id}: no choice leaves a mark (flags/later/memory/secret/promise/counters/trust/custom)`);
    v.choices.forEach((c, k) => {
      if (!c.label || c.label.length > 60) bad(`${s.id}#${k}: label missing or > 60 chars`);
      if (c.hint && c.hint.length > 70) bad(`${s.id}#${k}: hint > 70 chars`);
      walk(c.effects, ctx.age, `${s.id}#${k}`);
      const kind = s.meta?.kind; const p = s.meta?.path ?? "";
      if (kind === "beat" && !(c.effects.counters && `p_${p}` in c.effects.counters)) bad(`${s.id}#${k}: beat choice must include counters: step(c, "${p}")`);
      if (kind === "talent" && !(c.effects.counters && "talents_seen" in c.effects.counters)) bad(`${s.id}#${k}: talent choice must include counters { talents_seen: 1 }`);
      if (kind === "door" && !(c.effects.counters && "doors_seen" in c.effects.counters)) bad(`${s.id}#${k}: door choice must include counters { doors_seen: 1 }`);
    });
    if (s.meta?.kind === "door" && !v.choices.some((c) => (c.effects.custom ?? "").includes("become:") || (c.effects.gamble && JSON.stringify(c.effects.gamble).includes("become:")))) bad(`${s.id}: door card has no choice that becomes the path`);
    if (s.meta?.kind === "talent" && !v.choices.some((c) => (c.effects.flags ?? []).some((x) => x.startsWith("talent_")))) bad(`${s.id}: talent card has no choice that sets talent_<path>`);
  }
}
const never = pack.filter((s) => !fired.has(s.id)).map((s) => s.id);
if (never.length) bad(`never fires in 30k random contexts: ${never.join(", ")}`);
const titles = new Map<string, number>();
for (const s of pack) { try { const ctx = randomCtx(createRng(5), paths); if (s.prerequisites(ctx)) { const t = s.build(ctx, N).title; titles.set(t, (titles.get(t) ?? 0) + 1); } } catch { /* reported above */ } }
for (const [t, n] of titles) if (n > 1) bad(`title "${t}" used by ${n} cards — titles must differ`);

console.log(`pack ${file}: ${pack.length} cards · paths ${paths.join(", ") || "(news)"} · problems ${problems.length}`);
for (const p of problems) console.log("  ! " + p);
if (problems.length) process.exit(1);
console.log("PASS check-pack");
