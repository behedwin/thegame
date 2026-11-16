---
id: 105
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [101, 102, 103, 104]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #21

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 100 (pricken på fliken Troféer, rekordtakten på läsårsklockan,
  årets svit i statistiken och tryck på "Nästan där") och leta efter dubbletter, för långa funktioner och
  döda exporter. Flikprickarna (097 och 101) liknar varandra: se om de kan dela en hjälpare.
- Stärk testerna där täckningen är tunn, särskilt `src/ui/stats.ts` (`statRows`) och
  `src/ui/prestige.ts` (läsårsklockan).
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.

## Tester
- Enhet (`tests/105-*.test.ts`) för det som stärks ovan.
- Alla befintliga grindar gröna.
