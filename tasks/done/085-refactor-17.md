---
id: 085
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [081, 082, 083, 084]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #17

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 080 (hopfällda maxade meriter, meritkortets samlade effekt,
  jämförelsen av KP med förra läsåret och navets nivå i den kompakta remsan) och leta efter dubbletter, för
  långa funktioner och döda exporter.
- Stärk testerna där täckningen är tunn, särskilt migreringarna i `src/save/` och kantfall i `src/core/`.
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.
