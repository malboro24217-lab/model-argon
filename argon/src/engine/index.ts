/** Public surface of the Model Argon engine. UI-free; importable from a browser bundle, a worker, or Node. */
export * from "./types/index.ts";
export { createRng, clamp, type Rng } from "./core/Rng.ts";
export { createWorld, tick, mortalityQuarter, purchaseDelta, lifestyleSpend, type TickInput, type TickReport, type WorkPolicy } from "./core/TickManager.ts";
export { applyDelta, mergeDeltas, snapshot, socialSummary, initialCapitals } from "./core/CapitalStore.ts";
export { lifeTopology, type LifeTopologyReport, type SurplusReport, type SovereigntyReport, type RippleReport, type NpcRippleRow } from "./core/TopologyEndgame.ts";
export { ageingCapLoss, stressCapLoss, bioEnergyDelta, bandwidthRegenDelta, financialEntropyDelta, macroShock, agencyDriftDelta, lifeShock, TICKS_PER_YEAR, type LifeShock } from "./core/EntropyDecay.ts";
export { scarcityTax, ratRace, nextStress, survivalThreshold, BANDWIDTH_LOCK_LEVEL, CRITICAL_STRESS, type ScarcityReport, type RatRaceReport } from "./core/ScarcityTrap.ts";
export { cellPayoff, arbitragePayoff, isNashCell, expectedCapital, type MatrixContext } from "./gametheory/PayoffMatrix.ts";
export { npcDecide, makeNpc, surfaceSignal, ARCHETYPE_PRIOR, GOSSIP_DEFECT_TRUST, type PolicyContext } from "./gametheory/Archetypes.ts";
export { beliefAbout, predictedCoopProb, checkBreach, rawAccuracy, effectiveAccuracy, costlySignalTrustDelta, BREACH_DD_THRESHOLD, type Belief } from "./gametheory/Signaling.ts";
export { resolveInteraction, type PlayerAction, type ResolvedInteraction } from "./gametheory/InteractionResolver.ts";
export { createGraph, addNpcToGraph, connectNpcs, propagate, reputationOf, allianceCount, trustToward, getEdge, setEdge, severEdge } from "./gametheory/SocialLedger.ts";
export { awaken, detectCrisis, phaseFor, checkRelapse, RELAPSE_AGENCY, RELAPSE_TICKS, type AwakeningResult, type CrisisKind, type CrisisFlags } from "./perception/AwakeningMechanic.ts";
export { tierOf, isBandwidthLocked, tickChoices, dealChoices, type Choice, type ChoiceId, type ChoiceTier, type VisibleInfo } from "./perception/ChoiceFilter.ts";
export * from "./narrative/index.ts";
export {
  ASSET_KINDS, LIFESTYLES, LIFESTYLE_MULT, LIFESTYLE_VN, HAIRCUT, createHoldings, lifestyleYear, housePriceToIncome, basePrice, priceBounds,
  loanTerms, annuity, loanService, loanTotal, quoteBuy, buyAsset, addAsset, defaultName, sellAsset, findAsset, depositRate, deposit, withdraw,
  policyTerms, hasPolicy, holdingsYear, healthPayout, seizeForDebt, repayChance, lend, owedToMe, netWorth, illiquidValue,
  type AssetKind, type Lifestyle, type SupportLevel, type PolicyKind, type Asset, type Receivable, type Policy, type Holdings, type MarketCtx,
  type BuyRequest, type BuyQuote, type YearReport, type NetWorth,
} from "./economy/Holdings.ts";
