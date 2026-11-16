---
id: 080
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [076, 077, 078, 079]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #16

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 075 (sammanfattningen per läsår, troféfliken, jämförelsen med förra
  läsåret och notisen om bruten svit) och leta efter dubbletter, för långa funktioner och döda exporter.
- Stärk testerna där täckningen är tunn, särskilt migreringarna i `src/save/` och kantfall i `src/core/`.
- Håll `src/` under gränsen i `npm run size-check` med marginal.
- Beteendet ska vara oförändrat: `sim-report.json` före och efter ska ge samma siffror.
