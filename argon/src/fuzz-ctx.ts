/** Bối cảnh ngẫu nhiên cho fuzz: dùng chung bởi narrative-test và check-pack. */
import { PATH_LIST, createRng, type FactContext, type CastRole } from "./engine/index.ts";
const roles: CastRole[] = ["mother", "father", "sibling", "childhood_friend", "bully", "neighbor", "first_boss", "official", "partner", "creditor", "mentor", "rival", "spouse", "child"];

export function randomCtx(r: ReturnType<typeof createRng>, focusPaths: string[] = []): FactContext {
  const age = Math.floor(r.next() * 85);
  const income = 2000 + r.next() * 40000;
  const savings = (r.next() - 0.3) * 3 * income;
  const debt = Math.max(0, -savings) + (r.chance(0.3) ? r.next() * 2 * income : 0);
  const cast: Partial<Record<CastRole, string>> = {};
  const opinion: Record<string, number> = {}; const rolesMap: Record<string, CastRole[]> = {}; const hooks: Record<string, ("CHEATED_EXAM" | "PAID_BRIBE")[]> = {};
  for (const ro of roles) if (r.chance(0.8)) { const id = `cast_${ro}`; cast[ro] = id; opinion[id] = (r.next() * 2 - 1); rolesMap[id] = [ro]; if (ro === "bully" && r.chance(0.5)) rolesMap[id]!.push("official"); if (r.chance(0.1)) hooks[id] = ["PAID_BRIBE"]; }
  const flags = new Set<string>(); for (const f of ["invention","temper_curious","temper_bold","temper_kind","temper_tough","origin_poor_rural","origin_poor_urban","origin_middle","origin_rich","job_farm","job_market","job_driver","job_build","job_factory","job_teach","job_health","job_office","job_tech","job_domestic","spouse_warm","spouse_proud","spouse_restless","spouse_fair","path_migrant","path_uni","path_dropout","tinker","science_prize","own_business","expanded","sponsor","carer","athlete","pro_athlete","gang","heir","orchard","land_sold","credit_book","foreman","line_lead","saved_student","startup","affair","leader","shop_active", "shop_done", "commons_done", "commons_max", "cert_pending", "village_rules", "parent_died", "scandal_pending", "left_home", "temper2_curious", "temper2_bold", "temper2_kind", "temper2_tough", "tinkerer", "seen_world", "has_apprentice", "highland_teacher"]) if (r.chance(0.3)) flags.add(f);
  // Con đường đời: 1–2 con đường đang đi, năng khiếu, bộ đếm nhịp truyện.
  const pathCounters: Record<string, number> = {};
  for (let k = 0; k < 2; k++) { const want = focusPaths.length && r.chance(0.8) ? r.pick(focusPaths) : null; const pd = (want ? PATH_LIST.find((p) => p.id === want) : undefined) ?? r.pick(PATH_LIST); if (r.chance(0.7)) flags.add(`life_${pd.id}`); if (r.chance(0.4)) flags.add(`talent_${pd.id}`);
    pathCounters[`p_${pd.id}`] = Math.floor(r.next() * 6); pathCounters[`p_${pd.id}_at`] = Math.max(0, age - Math.floor(r.next() * 12)); }
  pathCounters.talents_seen = Math.floor(r.next() * 3); pathCounters.doors_seen = Math.floor(r.next() * 4);
  const tier = r.pick(["autopilot", "awakened", "sovereign"] as const);
  const bw = r.next() * 100;
  return {
    age, sex: r.chance(0.5) ? "M" : "F", country: r.pick(["VN", "VN", "US", "IN", "NG", "NO", "BR", "PH"]), luck: r.next(), gdp: 1500 + r.next() * 60000, poor_country: r.chance(0.5), family_wealth: r.next(),
    in_school: age >= 6 && age < 18 && r.chance(0.8), years_school: Math.min(12, Math.max(0, age - 6)), has_degree: r.chance(0.3), has_job: age >= 16 && age < 65 && r.chance(0.85), job: "x", farmer: r.chance(0.3), worker: r.chance(0.25), retired: age >= 62,
    married: age >= 20 && r.chance(0.6), widowed: age > 50 && r.chance(0.2), kids_alive: age > 22 ? Math.floor(r.next() * 4) : 0, kids_teen: age > 35 ? Math.floor(r.next() * 2) : 0, kids_school: age > 28 ? Math.floor(r.next() * 3) : 0,
    parents_alive: age < 50 ? 2 : Math.floor(r.next() * 3), parent_old: age > 35, parent_sick: r.chance(0.2), sibling_alive: !!cast.sibling,
    income, savings, debt, debt_ratio: debt / income, rich: savings >= 3 * income, broke: savings < 0.1 * income,
    health: r.next() * 100, happy: r.next() * 100, know: r.next() * 100, rel: r.next() * 100, bandwidth: bw, bandwidth_locked: bw < 30, scarcity: r.chance(0.35), rat_race: r.chance(0.2),
    tier, agency: r.next(), reputation: r.next() * 100, allies: Math.floor(r.next() * 4), enemies: Math.floor(r.next() * 4), econ_phase: r.pick(["boom", "stagnation", "crisis"] as const), ill: r.chance(0.1), migrated: r.chance(0.1),
    flags, counters: { ...pathCounters, shop_round: Math.floor(r.next() * 5), married_years: Math.floor(r.next() * 10), smoke: Math.floor(r.next() * 10), drink: Math.floor(r.next() * 10), gamble: Math.floor(r.next() * 8), exercise: Math.floor(r.next() * 8), read: Math.floor(r.next() * 8), save: Math.floor(r.next() * 8), honest: Math.floor(r.next() * 14 - 7), kind: Math.floor(r.next() * 8) }, cast, opinion, roles: rolesMap, hooks, last_move: {}, doors: new Set(), years_since_major: Math.floor(r.next() * 8), tension: r.next() * 100, crises_survived: Math.floor(r.next() * 4),
    ...moneyFacts(r, income, age, cast),
    pressure: { tien: 0, tinh: 0, mau: 0, danh: 0, luat: 0, than: 0, dat: 0, ky: 0 }, plants: [], season: null, season_beat: 0, canon_n: 0, last_canon_age: -99, weird: 1,
    traits: { coop: Math.floor(r.next() * 7 - 3), fair: Math.floor(r.next() * 7 - 3), risk: Math.floor(r.next() * 7 - 3), bold: Math.floor(r.next() * 7 - 3) },
  };
}


/** Của cải ngẫu nhiên cho fuzz. */
function moneyFacts(r: ReturnType<typeof createRng>, income: number, age: number, cast: Partial<Record<CastRole, string>>) {
  const kinds = ["house", "land", "vehicle", "shop", "gold", "deposit", "stake"] as const;
  const owns = new Set<(typeof kinds)[number]>(); const asset_names: Partial<Record<(typeof kinds)[number], string>> = {};
  if (age >= 18) for (const k of kinds) if (r.chance(0.3)) { owns.add(k); asset_names[k] = "món " + k; }
  const assets_value = owns.size ? r.next() * 15 * income : 0, loans = owns.has("house") && r.chance(0.5) ? r.next() * 8 * income : 0;
  const debtors = Object.values(cast).filter((id): id is string => !!id && r.chance(0.1));
  const insured = new Set<"health" | "property">(); if (r.chance(0.3)) insured.add("health"); if (r.chance(0.2)) insured.add("property");
  const lv = ["it", "du", "hau"] as const;
  return {
    independent: age >= 18 && r.chance(0.85), own_cash: r.next() * 2 * income, owns, asset_names, assets_value, loans, loan_burden: loans ? r.next() * 0.5 : 0, deposit: owns.has("deposit") ? r.next() * 3 * income : 0,
    lifestyle: r.pick(["tan_tien", "vua_phai", "thoai_mai", "pho_truong"] as const), lifestyle_years: Math.floor(r.next() * 12), insured,
    owed_to_me: debtors.length ? r.next() * 2 * income : 0, debtors_overdue: debtors, home_owner: owns.has("house"),
    support: { parents: r.pick(lv), kids: r.pick(lv) },
    price_years: { house: 2 + r.next() * 25, land: 1 + r.next() * 10, vehicle: 0.05 + r.next() * 1.5, shop: 1 + r.next() * 12 },
  };
}
