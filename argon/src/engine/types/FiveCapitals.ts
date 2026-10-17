/**
 * Layer 2 — The 5-Capital State Machine (spec §2).
 * Each depreciating capital is a gauge with a current value and a ceiling (Max Cap).
 * Cap damage is permanent; value regenerates toward the cap.
 */

export interface Gauge {
  /** Current level. 0 ≤ value ≤ cap. */
  value: number;
  /** Ceiling. Bio-Energy and Bandwidth caps start at 100 and only ever go down. */
  cap: number;
}

export interface CapitalAssets {
  /** Cash and near-cash, in CU. Can go negative only transiently; TickManager converts shortfall to debt. */
  liquid: number;
  /** Property, equity in a venture, tools. Illiquid; sold at a haircut. */
  illiquid: number;
  /** Outstanding debt principal, in CU. Accrues interest quarterly. */
  debt: number;
  /** Quarterly labour income in CU before any deal payoffs. */
  income_quarterly: number;
}

export interface SocialLedgerSummary {
  /** Aggregate reputation 0–100, derived from incoming trust edges in the SocialGraph. */
  reputation: number;
  /** Number of live alliances (edges with trust ≥ +0.5). Unlocks coalition choices. */
  alliances: number;
  /** Transaction-cost multiplier applied to deal stakes. 1.0 = no reputational discount; floor 0.7. */
  transaction_cost_multiplier: number;
}

export interface FiveCapitals {
  /** Biological energy & cellular longevity. 0–100. */
  bioEnergy: Gauge;
  /** Strategic processing bandwidth. 0–100. Regenerates each tick, taxed by the Scarcity Trap. */
  cognitiveBandwidth: Gauge;
  capitalAssets: CapitalAssets;
  socialLedger: SocialLedgerSummary;
  /** Agency & Sovereignty. 0–1. Hidden from the UI in Autopilot; drives the ChoiceFilter. */
  agency: number;
}

/** Physiological & psychological load, 0–100. Derived each tick; feeds Bio decay and the Scarcity Trap. */
export interface StressState {
  value: number;
  /** Fraction of a full quarter's hours spent working. 1.0 = standard; 1.4 = heavy overtime. */
  workload: number;
  /** Consecutive ticks the character has been below the survival threshold. */
  ticks_in_scarcity: number;
}

export type AwakeningPhase = "autopilot" | "phase_change" | "strategic_meta_view" | "topology_endgame";

export interface PerceptionState {
  phase: AwakeningPhase;
  /** Crises survived (bio collapse, insolvency, betrayal breach). Each one is an opportunity for a Phase Change. */
  crises_survived: number;
  /** True once a Phase Change has occurred at least once; permanently widens the ChoiceFilter. */
  phase_changed: boolean;
  /** Ticks spent in the Rat Race Loop (debt service > 40 % of income or chronic scarcity). */
  rat_race_ticks: number;
  /** Whether the Rat Race Loop is currently active. */
  in_rat_race: boolean;
  /** Consecutive ticks with Agency < 0.2 after a Phase Change. At 8 the restructuring relapses into Autopilot. */
  low_agency_streak: number;
  /** Times the character relapsed from an awakened state back to Autopilot. */
  relapses: number;
  /** Quarters spent in each ChoiceFilter tier. Feeds the Sovereignty Delta of the Life Topology Report. */
  tier_ticks: { autopilot: number; awakened: number; sovereign: number };
  /** Highest Agency ever reached. */
  agency_peak: number;
  /** Agency at spawn, kept for the Sovereignty Delta. */
  agency_start: number;
}

/** One tick's worth of change, used for logging and for returning deltas from the resolver. */
export interface CapitalDelta {
  bio?: number;
  bandwidth?: number;
  liquid?: number;
  illiquid?: number;
  debt?: number;
  reputation?: number;
  agency?: number;
  /** Permanent cap damage, always ≤ 0. */
  bio_cap?: number;
  bandwidth_cap?: number;
}

export const EMPTY_DELTA: Readonly<CapitalDelta> = Object.freeze({});
