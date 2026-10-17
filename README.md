# Model Argon — engine

Headless, UI-free simulation core for the 1in8b refactor (spec: *1in8b Model Argon Engine Spec v1.0*).
Strict TypeScript, zero runtime dependencies, deterministic from a seed.

```
argon/
├─ package.json            typecheck · sim · montecarlo
├─ tsconfig.json           strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noEmit
└─ src/
   ├─ sim-test.ts          Phase 3 CLI: one annotated life, or --montecarlo N
   └─ engine/
      ├─ index.ts          public surface
      ├─ types/
      │  ├─ SpawnVector.ts     Layer 1: macro · bloodline · biology · agency_initial · seed
      │  ├─ FiveCapitals.ts    Layer 2: Gauge{value,cap}, CapitalAssets, SocialLedgerSummary, StressState, PerceptionState, CapitalDelta
      │  ├─ AgentArchetype.ts  Archetype, Move (cooperate|defect|arbitrage), NpcAgent, PayoffDelta, InteractionOutcome
      │  ├─ SocialGraph.ts     nodes/edges (trust ∈ [−1,1], severed), PropagationEvent
      │  └─ index.ts           WorldState
      ├─ core/
      │  ├─ Rng.ts             mulberry32 + Box–Muller
      │  ├─ CapitalStore.ts    initialCapitals(spawn), applyDelta (caps first, then clamp), socialSummary
      │  ├─ EntropyDecay.ts    ageing/stress cap loss, bio regen/drain, bandwidth regen, inflation/interest, life shocks, social fade, agency drift
      │  ├─ ScarcityTrap.ts    bandwidth tax, lock level, rat-race detector, stress integrator
      │  └─ TickManager.ts     one quarter: labour → entropy → scarcity → awakening → mortality
      ├─ gametheory/
      │  ├─ PayoffMatrix.ts    spec §6 cells, stake-scaled, institutional clawback, arbitrage row, Nash check, EV
      │  ├─ Archetypes.ts      TfT · Grudger · AlwaysDefect · GenerousTfT · Opportunist (stake-aware predator); gossip-aware openings
      │  ├─ Signaling.ts       Bayesian belief over archetypes, due-diligence accuracy, breach detection (>35 bw), costly signaling
      │  ├─ InteractionResolver.ts  spec §7 pipeline + commit + ledger propagation
      │  └─ SocialLedger.ts    trust graph, ripple propagation with negativity bias, reputation, alliances
      ├─ perception/
      │  ├─ AwakeningMechanic.ts  crisis detection, bandwidth-scaled agency jumps, Phase Change + relapse
      │  └─ ChoiceFilter.ts      tier (autopilot/awakened/sovereign), bandwidth lock, Meta-View information
      └─ narrative/            Phase 5 "Living Web"
         ├─ types.ts             Storylet · Effect (declarative) · FactContext · MemoryToken · Secret/Hook · CastMember
         ├─ storylets.ts         42 QBN cards (Failbetter/Emily Short): prerequisites · specificity · urgency · cooldown · build
         ├─ vignettes.ts         49 ambient rules (Valve rule database): most specific match writes the quiet year
         ├─ Matcher.ts           eligibility + urgency band + specificity ranking, random tie-break
         ├─ Storyteller.ts       RimWorld pacing: tension budget, build → storm → breather, milestones 15/30/50/70
         ├─ Memory.ts            CK3 memory tokens (decay), secrets leaking along the graph, hooks, delayed fuses
         └─ Cast.ts              12 named NPCs at birth (+ spouse, children), role evolution, ageing, dependent costs
```

## Build for the web UI
```
npx esbuild src/engine/index.ts --bundle --format=iife --global-name=Argon --outfile=dist/argon.iife.js
```
`dist/argon.iife.js` (≈40 KB, no dependencies) exposes `window.Argon`; the game page inlines it and talks to it through `bridge.js`.

## Run

```
npm run typecheck
npm run sim              # seed 20261017, 120 ticks, age 18 → 48, 15 NPCs
npm run sim -- 42        # another seed
npm run montecarlo       # 400 lives, distribution + balance table
node --experimental-strip-types src/narrative-test.ts   # storylet pool: reachability, later-targets, determinism
```

## Units & time
- Tick = one quarter. `age += 0.25`.
- CU = capital unit; `survival_cost_quarterly` (25 in the reference spawn) is one adult's subsistence per quarter.
- Gauges (Bio-Energy, Bandwidth) are 0–100 with a permanent `cap`. Agency is 0–1. Trust is −1..+1; reputation 0–100 is derived.

## Core formulas (all implemented, all in code comments)
| Mechanic | Formula |
|---|---|
| Ageing cap loss | `0.045·((age−30)/10)^1.3` pt/q after 30 |
| Stress cap loss | `0.02·(stress−threshold)/10` + `0.05·(workload−1.25)/0.25`; ×1.35 with cardiometabolic/autoimmune genetics |
| Bio value | regen `metab·0.25·(0.85cap−v)` − drain `4·max(0,wl−1) + 0.06·stress` (−0.15 after 45) |
| Bandwidth | regen `0.5·(cap−v)` (×0.5 if bio < 30 % cap); burnout cap −0.1/q at wl > 1.4 & stress > 80 |
| Scarcity tax | `25·max(0,1−liquid/2·survival) + 0.5·max(0,stress−70) + 5·[net liquid<0]`; lock at bw < 30 |
| Rat race | debt service `(r/4 + 0.05)·debt > 0.4·income`, or ≥ 4 ticks under threshold |
| Stress | leaky integrator, gain 0.4, target from workload/liquidity/debt/bio; ×(0.85+0.3·dopamine) |
| Lifestyle | `dopamine·0.9·max(0,income−survival)`, ×0.35 if frugal (awakened choice) |
| Status purchase | 50 % cash, 50 % debt, books at 85 % |
| Macro | boom assets +1.5 %/q · crisis −4 %/q, income −3 %/q, 6 %/q job-loss shock (×0.4, −5 % permanent) |
| Life shocks | health `p = 0.01+0.0006·(age−30)+…`, cost `survival·(1+2u)·(1.2−0.6·inst_trust)`; family 2 %/q; windfall 1 %/q |
| Payoff | spec §6 at stake 100, capital terms ×stake/100; exploit gain ×(1−0.4·inst_trust); win-win gains 60 % illiquid |
| Opportunist | `p_defect = σ(2.2·(stake/(0.25·liquid)−1))·(0.55+0.45·lure)` +0.15 on costly signal, [0.2,0.95]; 60 % coop on first contact |
| Due diligence | `acc = 1−e^(−bw/20)`, `acc_eff = acc·(1−0.6·deception·(1−acc))`; breach detection only if spent > 35 |
| Ledger ripple | `Δ = primary·trust(B→N)·weight(B)·0.7`, defection ×2; exploitation −0.8 direct, mutual destruction severs |
| Gossip | reciprocal NPCs open with defect when trust ≤ −0.2 (grudger: ≤ −0.6) |
| Agency (bistable) | pull `−0.0047·(1−A)·(1+0.8·dop)·(1+0.015·(age−25)⁺)`, floored at A₀; reflection `+0.06·A·(0.82−A)⁺·clamp((bw−40)/60)` unless rat race. Unstable ≈0.17 / stable ≈0.76 at full bw; no attractor below bw ≈ 64 |
| Awakening | crisis jump `(0.08+0.16u)·(bw/100)^1.5/(1+0.5·crises)`; Phase Change when crossing 0.3 or 3rd crisis with A ≥ 0.22; relapse to Autopilot after 8 q below 0.2 |
| Crises | bio < 30 % cap · overdraft > ½ survival or net worth < −2·survival · large betrayal · job loss · every 8th quarter of chronic scarcity |
| Tiers | sovereign: A ≥ 0.6 or (phase-changed & A ≥ 0.5); awakened: A ≥ 0.3 or phase-changed; else autopilot |
| Mortality | `q = 1−exp(−1.6e-5·e^{0.085·(age+0.6·(100−bioCap))})` per quarter |

## Balance (600-life Monte Carlo, reference spawn, age 18→48)
Ever awakened 40 % · sustained Sovereign (held ≥ 50 % of quarters since first reached, and at end) 14 % ·
Meta-View (A > 0.7) at end 4 % · relapsed 2 % · died 6 %. Median first-sovereign tick ≈ 93 (age 41).
Over a full game life (12→~70) the shares are higher (≈45 % sovereign at death) because the horizon doubles. Cells: win-win 79 %, sucker 7 %
(81 % of those are `always_defect` vs Autopilot characters who cannot see due diligence), exploitation 6 %,
mutual destruction 4 %, arbitrage 4 %.

Known property, not a bug: with the spec's §6 numbers and `institutional_trust < ~0.6`, one-shot exploitation
of a sure cooperator pays more than cooperation (60·clawback vs 25). Repeated-game value and ledger gossip are
what make cooperation rational; the engine exposes both so a UI (or player) can see the trade-off.

## Narrative layer (Phase 5)
- **Storylet** = `{prerequisites(ctx), specificity(ctx), urgency, cooldownYears, once?, tension, build(ctx, names) → view}`. Choices carry a declarative `Effect`
  (stats, money as a fraction of yearly income, trust, memory token, secret, flags/counters, `later{years, storylet}`, gamble, `game{npc, move, stake_frac}` resolved by the
  InteractionResolver, role evolution, custom host hooks). The host (`bridge.js` + `living.js` in the web page) applies effects; the engine never touches UI.
- **Matcher**: urgent (≥ 80) beats everything; within a band the most specific card wins; ties are random. Reflection milestones are urgency 100, once.
- **Storyteller**: `tension += pressure(ctx) − 6` per year; a storm fires when tension ≥ threshold (30–45 per life) or after 6–8 quiet years; a storylet with
  tension ≥ 15 opens a 1–3 year breather in which only urgent cards fire and the year gets a vignette.
- **Memory**: `opinion = trust + Σ tokens`; favours decay 0.03/yr, grudges 0.01/yr. Secrets leak one hop per year with `p = 0.12·trust·weight`; a holder with
  opinion ≤ −0.3 is a hook (blackmail storylet). Fuse: after `fuse_age` (committed + 5…25 yrs) the secret explodes with p = 0.15/yr (0.35 if a holder is hostile).
- **Cast**: parents, sibling, childhood friend, bully, neighbour, first boss, official, partner, creditor, mentor, rival; spouse and children join at runtime.
  Archetypes are role-biased and hidden. Parents fall ill after 55 and cost 12–20 % of income; children cost 6–15 % while in school.
- Headless: `narrative-test.ts` fuzzes 20k contexts (0 problems, every card reachable); the web page's own harness runs 1,200 full lives with 0 stuck scenes.
