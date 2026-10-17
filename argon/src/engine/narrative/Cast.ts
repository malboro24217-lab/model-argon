/**
 * Persistent named cast (12 at birth; spouse and children join later). Each member is a real NpcAgent in the
 * Social Ledger with a hidden archetype biased by role, an age offset, health, and a dependent flag.
 * Dependents are where money leaves: a sick parent, a child in school, a sibling's wedding.
 *
 * Ageing (per player year): NPC health declines after NPC age 55 by 1.2 + 0.08·(npcAge−55) per year, and
 * dies with Gompertz hazard q = 1 − exp(−(2e-4 · e^{0.09·(npcAge−40)})) or at health 0.
 * Dependent cost per year (fraction of player yearly income):
 *   parent with health < 40: 0.12 (0.20 if health < 20)     child 6–17: 0.06 (0.12 in a rich country)
 *   child 18–22 with degree track: 0.15
 */
import type { WorldState, Archetype, NpcAgent } from "../types/index.ts";
import { makeNpc } from "../gametheory/Archetypes.ts";
import { addNpcToGraph, connectNpcs } from "../gametheory/SocialLedger.ts";
import type { Rng } from "../core/Rng.ts";
import { clamp } from "../core/Rng.ts";
import type { CastMember, CastRole } from "./types.ts";

export interface CastNames { male: string[]; female: string[]; }

const ROLE_ARCH: Record<CastRole, Archetype[]> = {
  mother: ["generous_tit_for_tat", "generous_tit_for_tat", "tit_for_tat"],
  father: ["tit_for_tat", "grudger", "generous_tit_for_tat"],
  sibling: ["tit_for_tat", "generous_tit_for_tat", "opportunist", "grudger"],
  childhood_friend: ["tit_for_tat", "generous_tit_for_tat", "tit_for_tat", "opportunist"],
  bully: ["opportunist", "always_defect", "grudger"],
  neighbor: ["tit_for_tat", "grudger", "opportunist"],
  first_boss: ["tit_for_tat", "opportunist", "grudger"],
  official: ["opportunist", "grudger", "tit_for_tat"],
  partner: ["tit_for_tat", "generous_tit_for_tat", "grudger", "opportunist", "always_defect"],
  creditor: ["always_defect", "grudger", "opportunist"],
  mentor: ["generous_tit_for_tat", "generous_tit_for_tat", "tit_for_tat"],
  rival: ["opportunist", "tit_for_tat", "grudger"],
  spouse: ["generous_tit_for_tat", "tit_for_tat", "grudger"],
  child: ["generous_tit_for_tat", "tit_for_tat", "opportunist"],
};

const ROLE_SEX: Record<CastRole, "M" | "F" | "any"> = {
  mother: "F", father: "M", sibling: "any", childhood_friend: "any", bully: "M", neighbor: "any", first_boss: "any",
  official: "M", partner: "any", creditor: "any", mentor: "any", rival: "any", spouse: "any", child: "any",
};

const BIRTH_ROLES: Array<[CastRole, [number, number], number]> = [ // role, age offset range, weight (influence)
  ["mother", [22, 36], 0.6], ["father", [24, 40], 0.6], ["sibling", [-6, 6], 0.4], ["childhood_friend", [-2, 2], 0.5],
  ["bully", [0, 3], 0.4], ["neighbor", [5, 30], 0.6], ["first_boss", [10, 25], 0.6], ["official", [8, 25], 0.8],
  ["partner", [-3, 8], 0.5], ["creditor", [5, 20], 0.7], ["mentor", [15, 35], 0.7], ["rival", [-2, 4], 0.5],
];

export function createCast(s: WorldState, rng: Rng, names: CastNames, playerWealth: number): Map<string, CastMember> {
  const cast = new Map<string, CastMember>();
  const base = s.spawn.macro.survival_cost_quarterly * 4;
  for (const [role, [lo, hi], weight] of BIRTH_ROLES) {
    const sex = ROLE_SEX[role] === "any" ? (rng.chance(0.5) ? "M" : "F") : ROLE_SEX[role];
    const name = rng.pick(sex === "M" ? names.male : names.female);
    const arch = rng.pick(ROLE_ARCH[role]);
    const id = `cast_${role}`;
    const liquid = base * (role === "official" || role === "creditor" || role === "first_boss" ? 3 + 4 * rng.next() : 0.5 + 2 * rng.next()) * (0.6 + playerWealth);
    const npc = makeNpc(id, name, arch, rng, liquid);
    s.npcs.set(id, npc);
    const initialTrust = role === "mother" || role === "father" ? 0.7 : role === "childhood_friend" ? 0.4 : role === "sibling" ? 0.5 : role === "mentor" ? 0.3 : role === "bully" ? -0.3 : 0;
    addNpcToGraph(s.graph, npc, weight, s.tick, initialTrust);
    const m: CastMember = { id, name, role, roles: [role], age_offset: lo + Math.floor(rng.next() * (hi - lo + 1)), alive: true, health: 70 + 25 * rng.next(), dependent: false, true_archetype: arch };
    cast.set(id, m);
  }
  // Social circles: family trusts each other; neighbour/official/creditor know each other; friend knows bully.
  const link = (a: CastRole, b: CastRole, t: number) => connectNpcs(s.graph, `cast_${a}`, `cast_${b}`, t, s.tick);
  link("mother", "father", 0.8); link("mother", "sibling", 0.8); link("father", "sibling", 0.7);
  link("neighbor", "official", 0.5); link("official", "creditor", 0.5); link("creditor", "first_boss", 0.4);
  link("childhood_friend", "bully", 0.3); link("rival", "partner", 0.4); link("mentor", "first_boss", 0.5); link("neighbor", "mother", 0.5);
  return cast;
}

export function addCastMember(s: WorldState, cast: Map<string, CastMember>, rng: Rng, role: "spouse" | "child", name: string, ageOffset: number, trust = 0.5, archOverride?: Archetype): CastMember {
  const n = [...cast.values()].filter((c) => c.role === role).length;
  const id = `cast_${role}${n ? n + 1 : ""}`;
  const drawn = rng.pick(ROLE_ARCH[role]);
  const arch = archOverride ?? drawn;
  const npc = makeNpc(id, name, arch, rng, s.spawn.macro.survival_cost_quarterly * 2);
  s.npcs.set(id, npc);
  addNpcToGraph(s.graph, npc, 0.5, s.tick, trust);
  const m: CastMember = { id, name, role, roles: [role], age_offset: ageOffset, alive: true, health: role === "child" ? 95 : 80, dependent: role === "child", true_archetype: arch };
  cast.set(id, m);
  return m;
}

export interface CastEvent { id: string; name: string; role: CastRole; kind: "died" | "fell_ill" | "recovered"; }

/** One player-year of ageing for the cast. */
export function ageCast(cast: Map<string, CastMember>, playerAge: number, rng: Rng, poorCountry: boolean): CastEvent[] {
  const ev: CastEvent[] = [];
  for (const m of cast.values()) {
    if (!m.alive) continue;
    const npcAge = playerAge + m.age_offset;
    const wasSick = m.health < 40;
    if (npcAge > 55) m.health -= 1.2 + 0.08 * (npcAge - 55) + (poorCountry ? 0.6 : 0);
    else m.health += (85 - m.health) * 0.1;
    m.health += rng.normal(0, 2);
    m.health = clamp(m.health, 0, 100);
    const q = 1 - Math.exp(-(2e-4 * Math.exp(0.09 * Math.max(0, npcAge - 40))));
    if (m.health <= 0 || rng.chance(q)) { m.alive = false; m.dependent = false; ev.push({ id: m.id, name: m.name, role: m.role, kind: "died" }); continue; }
    const sick = m.health < 40;
    if (sick && !wasSick) ev.push({ id: m.id, name: m.name, role: m.role, kind: "fell_ill" });
    if (!sick && wasSick) ev.push({ id: m.id, name: m.name, role: m.role, kind: "recovered" });
    if (m.role === "mother" || m.role === "father") m.dependent = sick || npcAge >= 70;
    if (m.role === "child") m.dependent = npcAge < 22;
  }
  return ev;
}

/** Yearly cost of dependents as a fraction of player yearly income, with who it is for. */
export function dependentCosts(cast: Map<string, CastMember>, playerAge: number, richCountry: boolean): Array<{ id: string; name: string; role: CastRole; frac: number; why: string }> {
  const out: Array<{ id: string; name: string; role: CastRole; frac: number; why: string }> = [];
  for (const m of cast.values()) {
    if (!m.alive || !m.dependent) continue;
    const npcAge = playerAge + m.age_offset;
    if (m.role === "mother" || m.role === "father") {
      if (m.health < 20) out.push({ id: m.id, name: m.name, role: m.role, frac: 0.2, why: "thuốc men, viện phí" });
      else if (m.health < 40) out.push({ id: m.id, name: m.name, role: m.role, frac: 0.12, why: "thuốc men" });
      else if (npcAge >= 70) out.push({ id: m.id, name: m.name, role: m.role, frac: 0.05, why: "phụng dưỡng" });
    } else if (m.role === "child") {
      if (npcAge >= 6 && npcAge < 18) out.push({ id: m.id, name: m.name, role: m.role, frac: richCountry ? 0.12 : 0.06, why: "học phí, sách vở" });
      else if (npcAge >= 18 && npcAge < 22) out.push({ id: m.id, name: m.name, role: m.role, frac: 0.15, why: "học đại học" });
    }
  }
  return out;
}

export function byRole(cast: Map<string, CastMember>, role: CastRole): CastMember | undefined {
  for (const m of cast.values()) if (m.alive && m.roles.includes(role)) return m;
  return undefined;
}

export function npcOf(s: WorldState, id: string): NpcAgent | undefined { return s.npcs.get(id); }
