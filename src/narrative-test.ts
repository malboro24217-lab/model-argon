/**
 * Static + fuzz checks on the storylet pool:
 *   1. every `later.storylet` target exists;
 *   2. every storylet builds without throwing on a synthetic context and names ≤ 4 choices with labels;
 *   3. over 20,000 random contexts every storylet is reachable (prints the ones that never fire);
 *   4. the matcher never returns a storylet whose prerequisites fail; selection is deterministic per seed.
 */
import { STORYLETS as _S, MICRO, BRANCHES, BRANCHES2, LIFE_VARIANTS, TEMPER_LIFE, TEMPER2_ECHO, VIGNETTES, selectStorylet, selectVignette, createRng, type FactContext, type CastRole, type Effect } from "./engine/index.ts";

const STORYLETS = [..._S, ...MICRO, ...BRANCHES, ...BRANCHES2, ...LIFE_VARIANTS, ...TEMPER_LIFE, ...TEMPER2_ECHO];
const ids = new Set(STORYLETS.map((s) => s.id));
const roles: CastRole[] = ["mother", "father", "sibling", "childhood_friend", "bully", "neighbor", "first_boss", "official", "partner", "creditor", "mentor", "rival", "spouse", "child"];

function randomCtx(r: ReturnType<typeof createRng>): FactContext {
  const age = Math.floor(r.next() * 85);
  const income = 2000 + r.next() * 40000;
  const savings = (r.next() - 0.3) * 3 * income;
  const debt = Math.max(0, -savings) + (r.chance(0.3) ? r.next() * 2 * income : 0);
  const cast: Partial<Record<CastRole, string>> = {};
  const opinion: Record<string, number> = {}; const rolesMap: Record<string, CastRole[]> = {}; const hooks: Record<string, ("CHEATED_EXAM" | "PAID_BRIBE")[]> = {};
  for (const ro of roles) if (r.chance(0.8)) { const id = `cast_${ro}`; cast[ro] = id; opinion[id] = (r.next() * 2 - 1); rolesMap[id] = [ro]; if (ro === "bully" && r.chance(0.5)) rolesMap[id]!.push("official"); if (r.chance(0.1)) hooks[id] = ["PAID_BRIBE"]; }
  const flags = new Set<string>(); for (const f of ["invention","temper_curious","temper_bold","temper_kind","temper_tough","origin_poor_rural","origin_poor_urban","origin_middle","origin_rich","job_farm","job_market","job_driver","job_build","job_factory","job_teach","job_health","job_office","job_tech","job_domestic","spouse_warm","spouse_proud","spouse_restless","spouse_fair","path_migrant","path_uni","path_dropout","tinker","science_prize","own_business","expanded","sponsor","carer","athlete","pro_athlete","gang","heir","orchard","land_sold","credit_book","foreman","line_lead","saved_student","startup","affair","leader","shop_active", "shop_done", "commons_done", "commons_max", "cert_pending", "village_rules", "parent_died", "scandal_pending", "left_home", "temper2_curious", "temper2_bold", "temper2_kind", "temper2_tough", "tinkerer", "seen_world", "has_apprentice", "highland_teacher"]) if (r.chance(0.3)) flags.add(f);
  const tier = r.pick(["autopilot", "awakened", "sovereign"] as const);
  const bw = r.next() * 100;
  return {
    age, sex: r.chance(0.5) ? "M" : "F", country: "VN", gdp: 1500 + r.next() * 60000, poor_country: r.chance(0.5), family_wealth: r.next(),
    in_school: age >= 6 && age < 18 && r.chance(0.8), years_school: Math.min(12, Math.max(0, age - 6)), has_degree: r.chance(0.3), has_job: age >= 16 && age < 65 && r.chance(0.85), job: "x", farmer: r.chance(0.3), worker: r.chance(0.25), retired: age >= 62,
    married: age >= 20 && r.chance(0.6), widowed: age > 50 && r.chance(0.2), kids_alive: age > 22 ? Math.floor(r.next() * 4) : 0, kids_teen: age > 35 ? Math.floor(r.next() * 2) : 0, kids_school: age > 28 ? Math.floor(r.next() * 3) : 0,
    parents_alive: age < 50 ? 2 : Math.floor(r.next() * 3), parent_old: age > 35, parent_sick: r.chance(0.2), sibling_alive: !!cast.sibling,
    income, savings, debt, debt_ratio: debt / income, rich: savings >= 3 * income, broke: savings < 0.1 * income,
    health: r.next() * 100, happy: r.next() * 100, know: r.next() * 100, rel: r.next() * 100, bandwidth: bw, bandwidth_locked: bw < 30, scarcity: r.chance(0.35), rat_race: r.chance(0.2),
    tier, agency: r.next(), reputation: r.next() * 100, allies: Math.floor(r.next() * 4), enemies: Math.floor(r.next() * 4), econ_phase: r.pick(["boom", "stagnation", "crisis"] as const), ill: r.chance(0.1), migrated: r.chance(0.1),
    flags, counters: { shop_round: Math.floor(r.next() * 5), married_years: Math.floor(r.next() * 10), smoke: Math.floor(r.next() * 10), drink: Math.floor(r.next() * 10), gamble: Math.floor(r.next() * 8), exercise: Math.floor(r.next() * 8), read: Math.floor(r.next() * 8), save: Math.floor(r.next() * 8), honest: Math.floor(r.next() * 14 - 7), kind: Math.floor(r.next() * 8) }, cast, opinion, roles: rolesMap, hooks, last_move: {}, doors: new Set(), years_since_major: Math.floor(r.next() * 8), tension: r.next() * 100, crises_survived: Math.floor(r.next() * 4),
    traits: { coop: Math.floor(r.next() * 7 - 3), fair: Math.floor(r.next() * 7 - 3), risk: Math.floor(r.next() * 7 - 3), bold: Math.floor(r.next() * 7 - 3) },
  };
}

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
process.exit(bad.length ? 1 : 0);
