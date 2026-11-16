---
id: 090
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [086, 087, 088, 089]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #18

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- **Från förslaget `p-merit-effect-core`:** meritkortets "Nu: …"-text (082, 086) räknar själv ut effekten
  per nivå, och taket för tätare event (`MAX_EVENT_COOLDOWN_CUT_PCT`) tillämpas både i core
  (`src/core/rules.ts`) och i UI (`src/ui/shop.ts`). Lägg `meritLevelEffect(def, lvl): number` i
  `src/core/rules.ts` som ger effektens tal på en nivå (med tak och multiplikativ rabatt), och låt
  `meritSum`/`eventCooldownMs` och `meritEffectText` använda den. Driver de isär visar kortet fel siffra,
  och spelaren slutar lita på meritbutiken (VISION, "tydligt").
- Gå igenom koden som har ändrats sedan 085 (meritkortets nästa nivå, navets nästa nivå i tipset, rekordet
  för snabbaste läsår och pricken på fliken Läsår) och leta efter dubbletter, för långa funktioner och döda
  exporter.
- Stärk testerna där täckningen är tunn, särskilt migreringen 16→17 i `src/save/` och kantfall i
  `src/core/prestige.ts`.
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.

## Tester
- Enhet (`tests/090-*.test.ts`): för varje riktig merit och nivå 0..maxLevel stämmer `meritLevelEffect`
  med effekten i core (`eventCooldownMs`, `offlineEfficiency`, `automationCostFactor`).
