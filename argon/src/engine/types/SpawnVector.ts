/**
 * Layer 1 — Spawn Vector (spec §3).
 * Everything the character is born with and did not choose.
 * All ratios are in [0,1] unless stated; money is in abstract "capital units" (CU)
 * where 100 CU ≈ one year of median survival cost in the spawn country.
 */

export type EconomicPhase = "boom" | "stagnation" | "crisis";

export interface MacroVector {
  /** ISO-3166 alpha-2 of the spawn country. */
  country_iso: string;
  /** Trust in courts, contracts and the state. Lowers transaction costs and lowers predator payoff. [0,1] */
  institutional_trust: number;
  /** Intergenerational mobility. Drives how much bloodline capital determines outcomes. [0,1] (1 = fully mobile) */
  social_mobility_idx: number;
  /** Macro regime at spawn; the TickManager can rotate it over time. */
  economic_phase: EconomicPhase;
  /** Annual inflation, as a ratio (0.04 = 4 %/yr). */
  inflation_rate: number;
  /** Annual nominal interest charged on debt, as a ratio. */
  interest_rate: number;
  /** Quarterly survival cost in CU for one adult (rent, food, transport, health floor). */
  survival_cost_quarterly: number;
}

export interface BloodlineVector {
  /** Net worth transferred (or available) to the character at spawn, in CU. May be 0. */
  economic_net_worth: number;
  /** Cultural capital tags: "literate_household", "bilingual", "entrepreneurial", "academic", "religious_network", ... */
  cultural_capital: string[];
  /** Number of usable social-graph nodes inherited from the family (introductions, referrals). */
  social_network_nodes: number;
  /** Debt the character inherits or is morally bound to service, in CU. */
  debt_inherited: number;
}

export interface BiologyVector {
  /** Sensitivity of the reward system. High = stronger pull toward short-horizon rewards and consumption. [0,1] */
  baseline_dopamine_sensitivity: number;
  /** Stress level (0–100) above which permanent Bio-Energy cap damage begins. Typical 55–75. */
  cortisol_threshold: number;
  /** Chronic genetic liabilities: "cardiometabolic", "autoimmune", "neuro", "addiction_risk", ... */
  chronic_genetics: string[];
  /** Base metabolism multiplier on energy regeneration. 1.0 = population mean. [0.7,1.3] */
  base_metabolism: number;
}

export interface SpawnVector {
  macro: MacroVector;
  bloodline: BloodlineVector;
  biology: BiologyVector;
  /** Initial Agency & Sovereignty. Spec: usually unconscious / Autopilot, 0.0–0.2. */
  agency_initial: number;
  /** Age in years at which the simulation begins (the headless runner uses 18). */
  age_initial: number;
  /** Deterministic seed for the whole life. */
  seed: number;
}
