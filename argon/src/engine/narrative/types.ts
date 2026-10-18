/**
 * Narrative layer types — Phase 5 "Living Web".
 *
 *  - Storylet (Failbetter / Emily Short QBN): a declarative card with prerequisites over a flat
 *    FactContext, a specificity score, an urgency and a cooldown. No age rails: age is one soft fact.
 *  - Effect: the ONLY way a storylet (or the AI narrator) changes the world. Pure data; the host applies it.
 *  - MemoryToken / Secret / Hook (Crusader Kings III): structured relationship memory with decay, and
 *    secrets that leak through the social graph into hooks other people can use against the player.
 *  - FactContext (Valve rule database): one flat snapshot per year that every predicate reads.
 */
import type { Archetype } from "../types/AgentArchetype.ts";
import type { DoorId } from "./Causality.ts";
import type { AssetKind, Lifestyle, PolicyKind, SupportLevel } from "../economy/Holdings.ts";

/* ------------------------------------------------------------------ Cast */

export type CastRole =
  | "mother" | "father" | "sibling" | "childhood_friend" | "bully" | "neighbor"
  | "first_boss" | "official" | "partner" | "creditor" | "mentor" | "rival" | "spouse" | "child";

export interface CastMember {
  /** Equals the NpcAgent id in WorldState.npcs. */
  id: string;
  name: string;
  /** Role at creation. */
  role: CastRole;
  /** Roles accumulated over the life (a bully can become an official and later a creditor). */
  roles: CastRole[];
  /** NPC age minus player age. Parents ≈ +25..+35, sibling ±1..5, child ≤ −18. */
  age_offset: number;
  alive: boolean;
  /** 0–100; dependents cost money when it falls. */
  health: number;
  /** True for people whose needs are the player's problem: parents when old, children until ~22, a sick sibling. */
  dependent: boolean;
  true_archetype: Archetype;
}

/* ------------------------------------------------------------------ Memory & secrets */

export type MemoryTag =
  | "HELPED_IN_CRISIS" | "WIN_WIN_DEAL" | "KEPT_PROMISE" | "STOOD_UP_FOR_ME"
  | "BETRAYED_PARTNERSHIP" | "REFUSED_HELP" | "CHEATED_ME" | "HUMILIATED_ME" | "TOOK_MY_LAND" | "BULLIED_ME"
  | "GOSSIP_HEARD_BAD" | "GOSSIP_HEARD_GOOD";

export interface MemoryToken {
  tag: MemoryTag;
  /** Player age when it happened. */
  age: number;
  /** Signed weight in trust units (−1..1). */
  weight: number;
  /** Absolute decay per year toward 0. Betrayals decay slowly (0.01); favours faster (0.04). */
  decayPerYear: number;
  /** Free text the host can quote back ("vụ quán ăn năm bạn 28 tuổi"). */
  note: string;
}

export type SecretTag = "CHEATED_EXAM" | "PAID_BRIBE" | "DEFRAUDED_FRIEND" | "STOLE_SHARED_PROFIT" | "FORGED_PAPERS" | "ABANDONED_PARENT";

export interface Secret {
  id: string;
  tag: SecretTag;
  /** Player age when committed. */
  age: number;
  /** 0–1: how much reputation it burns when it explodes. */
  severity: number;
  /** NPC ids who know. Leaks along the social graph each year. */
  holders: string[];
  /** Delayed fuse: the secret may explode on its own after this player age. */
  fuse_age: number;
  exploded: boolean;
  note: string;
}

/** A Hook is a Secret held by someone who can use it: derived, never stored. */
export interface Hook { secret: Secret; holder: string; }

/* ------------------------------------------------------------------ Effects (declarative) */

export interface GambleEffect { p: number; win: Effect; lose: Effect; }

export interface Effect {
  health?: number; happy?: number; know?: number; rel?: number;
  /** Cognitive bandwidth points. */
  bw?: number;
  /** Fraction of one year's household income, signed. */
  money?: number;
  /** Multiplier on labour income from now on. */
  income_mult?: number;
  /** Agency nudge (only active-agency storylets and reflection use it). */
  agency?: number;
  trust?: { npc: string; delta: number };
  memory?: { npc: string; tag: MemoryTag; weight: number; decayPerYear?: number; note?: string };
  secret?: { tag: SecretTag; severity: number; fuse_years: [number, number]; note?: string; known_by?: string[] };
  flags?: string[];
  unflags?: string[];
  /** Counters (qualities) the storylets read back: {shop_round: +1}. */
  counters?: Record<string, number>;
  /** Schedule a follow-up: a storylet id (preferred) or a free note for the AI narrator. */
  later?: { years: number; storylet?: string; note?: string };
  gamble?: GambleEffect;
  /** One round of the Argon joint-venture matrix, resolved by InteractionResolver. */
  game?: { npc: string; move: "cooperate" | "defect" | "arbitrage"; stake_frac: number };
  trait?: { coop?: number; fair?: number; risk?: number; bold?: number };
  /** Codex concept to unlock. */
  learn?: string;
  /** Storyteller tension delta. */
  tension?: number;
  /** Role evolution for a cast member: {npc, add: "official"}. */
  role?: { npc: string; add: CastRole };
  /** Host-defined hooks that need game internals: job_new, job_lose, uni_try, migrate_try, retire, spouse_leave. */
  custom?: string;
  /** Futures this choice closes for good (shown to the player before choosing). */
  close_doors?: DoorId[];
  /** A promise made to a named person, due in `years`. Kept or broken later by the host's promise scene. */
  promise?: { to: string; what: string; years: number; cost_money?: number };
  /* ---- Dùng tiền (spec 2026-10-18-tien-bac §6.1). price / amount tính bằng SỐ NĂM thu nhập hộ, như money. ---- */
  /** Mua một món có tên. borrow = vay ngân hàng phần còn thiếu. Engine kẹp giá vào khung của nước đó. */
  buy?: { kind: AssetKind; name: string; price: number; borrow?: boolean; with_npc?: string };
  /** Bán món đầu tiên khớp tên, hoặc khớp loại. */
  sell?: { kind?: AssetKind; name?: string };
  lifestyle?: Lifestyle;
  deposit?: number;
  withdraw?: number;
  /** Cho một người vay, hẹn trả sau `years` năm. Người đó tự quyết trả hay quỵt (trò chơi lặp lại). */
  lend?: { npc: string; amount: number; years: number };
  /** Cho hoặc biếu tiền, không đòi lại. */
  give?: { npc: string; amount: number };
  insure?: PolicyKind;
  uninsure?: PolicyKind;
  /** Mức chi cho bố mẹ hoặc con: nhân lên khoản người phụ thuộc. */
  support?: { who: "parents" | "kids"; level: SupportLevel };
  log?: string;
}

/* ------------------------------------------------------------------ Facts */

/** Flat, serialisable snapshot of everything a predicate may read. One per game year. */
export interface FactContext {
  age: number;
  sex: "M" | "F";
  country: string;
  /** 0..1, fixed per life (from the seed): picks which slice of optional content this life can meet. */
  luck: number;
  gdp: number;
  poor_country: boolean;
  family_wealth: number;        // 0..1 at birth
  in_school: boolean;
  years_school: number;
  has_degree: boolean;
  has_job: boolean;
  job: string;
  farmer: boolean;
  worker: boolean;
  retired: boolean;
  married: boolean;
  widowed: boolean;
  kids_alive: number;
  kids_teen: number;            // 13–19
  kids_school: number;          // 6–18
  parents_alive: number;
  parent_old: boolean;          // any parent ≥ 65
  parent_sick: boolean;         // any parent health < 40
  sibling_alive: boolean;
  income: number;               // yearly, CU
  savings: number;              // net cash (liquid − debt)
  debt: number;
  debt_ratio: number;           // debt / yearly income
  rich: boolean;                // savings ≥ 3 × income
  broke: boolean;               // savings < 0.1 × income
  health: number; happy: number; know: number; rel: number;
  bandwidth: number;
  bandwidth_locked: boolean;
  scarcity: boolean;
  rat_race: boolean;
  tier: "autopilot" | "awakened" | "sovereign";
  agency: number;
  reputation: number;
  allies: number;
  enemies: number;
  econ_phase: "boom" | "stagnation" | "crisis";
  ill: boolean;
  migrated: boolean;
  flags: Set<string>;
  counters: Record<string, number>;
  /** cast role → id for quick role predicates ("bully" → "cast_bully"). Only living members. */
  cast: Partial<Record<CastRole, string>>;
  /** npc id → effective opinion (trust + memory), −1..1 */
  opinion: Record<string, number>;
  /** npc id → roles */
  roles: Record<string, CastRole[]>;
  /** Hooks held against the player: npc id → secret tags */
  hooks: Record<string, SecretTag[]>;
  /** npc id → the NPC's last observed move against the player (fog-safe: only what the player saw). */
  last_move: Record<string, "cooperate" | "defect">;
  /** Doors already closed by earlier choices. */
  doors: Set<DoorId>;
  years_since_major: number;
  tension: number;
  crises_survived: number;
  traits: { coop: number; fair: number; risk: number; bold: number };
  /* ---- Của cải ---- */
  /** Đã tự lập (có việc làm thật, không còn sống nhờ quỹ chung của gia đình) và từ 18 tuổi. */
  independent: boolean;
  /** Tiền mặt ròng của riêng bạn (không gồm quỹ chung của gia đình), CU. */
  own_cash: number;
  /** Các loại tài sản đang có. */
  owns: Set<AssetKind>;
  /** Tên món đầu tiên của mỗi loại đang có ("căn nhà ở quê"). */
  asset_names: Partial<Record<AssetKind, string>>;
  /** Tổng giá trị tài sản (không gồm tiền gửi), CU. */
  assets_value: number;
  /** Gốc còn nợ các khoản vay mua, CU. */
  loans: number;
  /** Tiền góp vay mua mỗi năm / thu nhập năm. */
  loan_burden: number;
  deposit: number;
  lifestyle: Lifestyle;
  lifestyle_years: number;
  insured: Set<PolicyKind>;
  /** Tổng người khác đang nợ mình, CU. */
  owed_to_me: number;
  /** id những người đang nợ mình và đã quá hạn. */
  debtors_overdue: string[];
  home_owner: boolean;
  support: { parents: SupportLevel; kids: SupportLevel };
  /** Giá điển hình của mỗi loại tài sản ở nơi đang sống, tính bằng số năm thu nhập của người chơi. */
  price_years: Record<"house" | "land" | "vehicle" | "shop", number>;
}

/* ------------------------------------------------------------------ Storylets */

export interface Choice {
  label: string;
  hint?: string;
  tier?: "awakened" | "sovereign";
  longterm?: boolean;
  effects: Effect;
}

export interface StoryletView {
  /** Resolved text with role names substituted. */
  title: string;
  text: string;
  choices: Choice[];
  def: number;
  /** NPC id this scene is about (for signal / temptation / matrix). */
  npc?: string;
  matrix?: { me: [string, string]; them: [string, string]; cells: number[][][]; unit: string };
  concept?: string;
}

export interface Storylet {
  id: string;
  category: "childhood" | "money" | "family" | "social" | "work" | "ledger" | "fuse" | "agency" | "reflection" | "arc" | "micro";
  /** Hard gate. */
  prerequisites: (ctx: FactContext) => boolean;
  /** Valve-style specificity: the number of predicates that matched beyond the gate. Higher wins. */
  specificity: (ctx: FactContext) => number;
  /** 0–100. ≥ 80 = urgent (fires even in a breather). */
  urgency: number;
  cooldownYears: number;
  once?: boolean;
  /** Variants of one life event share a group: once/cooldown apply to the whole group (a branch-specific
   *  'parent falls ill' blocks the generic one and every other variant for the cooldown). */
  group?: string;
  /** Most times one storylet may fire in a life (host default 1 for micro cards). */
  maxPerLife?: number;
  /** Authoring metadata (content packs): which life path and which kit helper produced the card. Not read by the matcher. */
  meta?: { path?: string; kind: "talent" | "door" | "beat" | "daily" | "cross" | "news" | "money" };
  /** Tension this storylet adds to the storyteller when it fires. */
  tension: number;
  /** Builds the scene. May read the context and roles to write names in. */
  build: (ctx: FactContext, names: (id: string) => string) => StoryletView;
  /** Doors that must still be open for this card to be offered. */
  requires_open?: DoorId[];
  /** Provenance keys (see Causality.prov) that enabled this card — the host turns them into "because at 22 you…". */
  causes?: (ctx: FactContext) => string[];
}

/** A one-line ambient vignette (Valve rule): the most specific matching rule wins each quiet year. */
export interface VignetteRule {
  id: string;
  when: (ctx: FactContext) => boolean;
  specificity: number;
  /** Several lines; one is drawn. {mother}, {father}, {friend}, {spouse}, {child}, {bully}, {neighbor} are substituted. */
  lines: string[];
  tone?: "good" | "bad" | "";
}
