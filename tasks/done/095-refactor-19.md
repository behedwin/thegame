---
id: 095
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [091, 092, 093, 094]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #19

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 090 (trofén för snabbt läsår, mätaren mot navets nästa nivå,
  pricken på fliken Uppgraderingar och läsårsklockan) och leta efter dubbletter, för långa funktioner och
  döda exporter. Pricklogiken för flikarna Läsår och Uppgraderingar i `src/ui/app.ts` bör dela en liten
  hjälpfunktion i stället för att upprepas.
- Stärk testerna där täckningen är tunn, särskilt `src/core/prestige.ts` (läsårets tid och rekord) och
  `src/core/achievements.ts`.
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.

## Tester
- Enhet (`tests/095-*.test.ts`) för det som stärks ovan.
- Alla befintliga grindar gröna.
