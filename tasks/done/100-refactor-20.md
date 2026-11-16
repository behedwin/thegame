---
id: 100
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [096, 097, 098, 099]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #20

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 095 (årets längsta svit, pricken på fliken Integrationer, sviten i
  återblicken och provade inriktningar i statistiken) och leta efter dubbletter, för långa funktioner och
  döda exporter. Raderna i `src/ui/stats.ts` växer: se om de kan byggas av en gemensam radhjälpare.
- Stärk testerna där täckningen är tunn, särskilt `src/core/prestige.ts` (`yearSummary` och jämförelsen med
  förra läsåret) och `src/core/events.ts` (sviten).
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.

## Tester
- Enhet (`tests/100-*.test.ts`) för det som stärks ovan.
- Alla befintliga grindar gröna.
