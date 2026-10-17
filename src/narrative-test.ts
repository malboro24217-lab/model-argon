/**
 * Static + fuzz checks on the storylet pool:
 *   1. every `later.storylet` target exists;
 *   2. every storylet builds without throwing on a synthetic context and names ≤ 4 choices with labels;
 *   3. over 20,000 random contexts every storylet is reachable (prints the ones that never fire);
 *   4. the matcher never returns a storylet whose prerequisites fail; selection is deterministic per seed.
 */
import { randomCtx } from "./fuzz-ctx.ts";
import { STORYLETS as _S, MICRO, BRANCHES, BRANCHES2, LIFE_VARIANTS, TEMPER_LIFE, TEMPER2_ECHO, PATH_STORYLETS, PATH_LIST, VIGNETTES, selectStorylet, selectVignette, eligible, createRng, type Storylet, type FactContext, type CastRole, type Effect } from "./engine/index.ts";

const STORYLETS = [..._S, ...MICRO, ...BRANCHES, ...BRANCHES2, ...LIFE_VARIANTS, ...TEMPER_LIFE, ...TEMPER2_ECHO, ...PATH_STORYLETS];
const ids = new Set(STORYLETS.map((s) => s.id));
function walkEffects(e: Effect, bad: string[], where: string): void {
  if (e.later?.storylet && !ids.has(e.later.storylet)) bad.push(`${where}: later → unknown storylet '${e.later.storylet}'`);
  if (e.gamble) { walkEffects(e.gamble.win, bad, where + "/win"); walkEffects(e.gamble.lose, bad, where + "/lose"); }
}

const rng = createRng(7);
const bad: string[] = [];
const fired = new Map<string, number>();
const names = (id: string) => id.replace("cast_", "").toUpperCase();
for (let i = 0; i < 20000; i++) {
  const ctx = randomCtx(rng);
  for (const s of STORYLETS) {
    let ok = false; try { ok = s.prerequisites(ctx); } catch (e) { bad.push(`${s.id}: prerequisites threw ${String(e)}`); }
    if (!ok) continue;
    try {
      const v = s.build(ctx, names);
      if (!v.title || v.choices.length < 1 || v.choices.length > 5 || v.choices.some((c) => !c.label)) bad.push(`${s.id}: bad view`);
      v.choices.forEach((c, k) => walkEffects(c.effects, bad, `${s.id}#${k}`));
      fired.set(s.id, (fired.get(s.id) ?? 0) + 1);
    } catch (e) { bad.push(`${s.id}: build threw ${String(e)}`); }
  }
  const pick = selectStorylet(STORYLETS, ctx, { minUrgency: 0, history: [], age: ctx.age }, rng);
  if (pick && !pick.prerequisites(ctx)) bad.push(`matcher returned ineligible ${pick.id}`);
  const vg = selectVignette(VIGNETTES, ctx, rng, []);
  if (!vg) bad.push("no vignette matched");
}
const never = STORYLETS.filter((s) => !fired.has(s.id)).map((s) => s.id);
console.log(`storylets ${STORYLETS.length} · vignettes ${VIGNETTES.length} · problems ${bad.length}`);
for (const b of [...new Set(bad)].slice(0, 20)) console.log("  !", b);
console.log("never reachable:", never.length ? never.join(", ") : "none");
console.log("reach counts:", [...fired.entries()].sort((a, b) => a[1] - b[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join("  "));
// determinism
const a = selectStorylet(STORYLETS, randomCtx(createRng(3)), { minUrgency: 0, history: [], age: 30 }, createRng(5))?.id;
const b = selectStorylet(STORYLETS, randomCtx(createRng(3)), { minUrgency: 0, history: [], age: 30 }, createRng(5))?.id;
console.log("deterministic:", a === b);

/* maxPerLife is enforced by the matcher for every pool (Task 1). */
{
  const capped: Storylet = { id: "cap_probe", category: "family", urgency: 50, cooldownYears: 0, maxPerLife: 2, tension: 0, prerequisites: () => true, specificity: () => 1, build: () => ({ title: "x", text: "x", choices: [], def: 0 }) };
  const ctx = randomCtx(createRng(11));
  const hist = [{ id: "cap_probe", age: 10 }, { id: "cap_probe", age: 20 }];
  const got = eligible([capped], ctx, { minUrgency: 0, history: hist, age: 40 });
  if (got.length !== 0) { console.error("FAIL maxPerLife not enforced by matcher"); process.exit(1); }
  const got1 = eligible([capped], ctx, { minUrgency: 0, history: hist.slice(0, 1), age: 40 });
  if (got1.length !== 1) { console.error("FAIL maxPerLife blocks too early"); process.exit(1); }
  console.log("maxPerLife enforced: ok");
}
process.exit(bad.length ? 1 : 0);
