---
id: 110
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [106, 107, 108, 109]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #22

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 105 (förra läsårets KP i statistiken, läsårets svit inom läsåret,
  pricken för nytt läsår och toasten när förra läsårets KP passeras) och leta efter dubbletter, för långa
  funktioner och döda exporter. Toasterna i `src/ui/app.ts` som jämför två renderingar (navets nivå och
  förra läsårets KP) liknar varandra: se om de kan dela en hjälpare.
- Stärk testerna där täckningen är tunn, särskilt `src/ui/tab-dots.ts` och sparmigreringen för läsårets svit.
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.

## Tester
- Enhet (`tests/110-*.test.ts`) för det som stärks ovan.
- Alla befintliga grindar gröna.
