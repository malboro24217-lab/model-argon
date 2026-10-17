/**
 * State Store for the five capitals (roadmap step 1). Owns construction from a SpawnVector,
 * delta application with clamping, and the derived Social Ledger summary.
 */
import type { WorldState, FiveCapitals, CapitalDelta, SpawnVector, SocialGraph } from "../types/index.ts";
import { PLAYER_NODE_ID } from "../types/index.ts";
import { clamp } from "./Rng.ts";
import { reputationOf, allianceCount } from "../gametheory/SocialLedger.ts";

/** Base quarterly income in CU for a fresh 18-year-old, before bloodline / mobility adjustments. */
const BASE_INCOME_QUARTERLY = 26; // ≈ 1.04 × survival for the reference survival cost of 25: an 18-year-old earns just above subsistence

export function initialCapitals(spawn: SpawnVector, graph: SocialGraph): FiveCapitals {
  const b = spawn.bloodline;
  const m = spawn.macro;
  // Income: bloodline advantage matters more where mobility is low.
  const inherit = Math.log10(1 + Math.max(0, b.economic_net_worth)) / 3; // 0 .. ~1 for 0..1000 CU
  const cultural = 0.04 * b.cultural_capital.length;
  const incomeMult = 1 + (1 - m.social_mobility_idx) * inherit * 0.4 + cultural + 0.02 * b.social_network_nodes;
  const caps: FiveCapitals = {
    bioEnergy: { value: 85, cap: 100 },
    cognitiveBandwidth: { value: 70, cap: 100 },
    capitalAssets: {
      liquid: Math.max(0, b.economic_net_worth * 0.3),
      illiquid: Math.max(0, b.economic_net_worth * 0.7),
      debt: Math.max(0, b.debt_inherited),
      income_quarterly: BASE_INCOME_QUARTERLY * incomeMult * (m.survival_cost_quarterly / 25),
    },
    socialLedger: { reputation: 50, alliances: 0, transaction_cost_multiplier: 1 },
    agency: clamp(spawn.agency_initial, 0, 1),
  };
  caps.socialLedger = socialSummary(graph);
  return caps;
}

export function socialSummary(graph: SocialGraph): FiveCapitals["socialLedger"] {
  const reputation = reputationOf(graph, PLAYER_NODE_ID);
  const alliances = allianceCount(graph, PLAYER_NODE_ID);
  // Transaction cost: reputation 100 → ×0.7, reputation 0 → ×1.0 (spec: "giảm chi phí giao dịch").
  const transaction_cost_multiplier = 1 - 0.3 * (reputation / 100);
  return { reputation, alliances, transaction_cost_multiplier };
}

/**
 * Commits a delta. Caps are reduced first so values are clamped against the new ceiling.
 * Liquid may go negative inside a tick; TickManager.settle() converts the shortfall into debt.
 */
export function applyDelta(c: FiveCapitals, d: CapitalDelta): FiveCapitals {
  const bioCap = clamp(c.bioEnergy.cap + (d.bio_cap ?? 0), 0, 100);
  const bwCap = clamp(c.cognitiveBandwidth.cap + (d.bandwidth_cap ?? 0), 0, 100);
  return {
    bioEnergy: { cap: bioCap, value: clamp(c.bioEnergy.value + (d.bio ?? 0), 0, bioCap) },
    cognitiveBandwidth: { cap: bwCap, value: clamp(c.cognitiveBandwidth.value + (d.bandwidth ?? 0), 0, bwCap) },
    capitalAssets: {
      liquid: c.capitalAssets.liquid + (d.liquid ?? 0),
      illiquid: Math.max(0, c.capitalAssets.illiquid + (d.illiquid ?? 0)),
      debt: Math.max(0, c.capitalAssets.debt + (d.debt ?? 0)),
      income_quarterly: c.capitalAssets.income_quarterly,
    },
    socialLedger: c.socialLedger, // recomputed from the graph by TickManager
    agency: clamp(c.agency + (d.agency ?? 0), 0, 1),
  };
}

export function mergeDeltas(...ds: CapitalDelta[]): CapitalDelta {
  const out: CapitalDelta = {};
  for (const d of ds) {
    for (const k of Object.keys(d) as (keyof CapitalDelta)[]) {
      out[k] = (out[k] ?? 0) + (d[k] ?? 0);
    }
  }
  return out;
}

export function snapshot(s: WorldState): string {
  const c = s.capitals, a = c.capitalAssets;
  return `age ${s.age.toFixed(2)} | bio ${c.bioEnergy.value.toFixed(0)}/${c.bioEnergy.cap.toFixed(0)} | bw ${c.cognitiveBandwidth.value.toFixed(0)}/${c.cognitiveBandwidth.cap.toFixed(0)} | liq ${a.liquid.toFixed(0)} illiq ${a.illiquid.toFixed(0)} debt ${a.debt.toFixed(0)} inc ${a.income_quarterly.toFixed(1)}/q | rep ${c.socialLedger.reputation.toFixed(0)} ally ${c.socialLedger.alliances} | agency ${c.agency.toFixed(2)} | stress ${s.stress.value.toFixed(0)} wl ${s.stress.workload.toFixed(2)} | ${s.perception.phase}${s.perception.in_rat_race ? " [RAT RACE]" : ""}`;
}
