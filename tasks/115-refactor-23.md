---
id: 115
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [111, 112, 113, 114]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #23

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 110 (nästa svittrofé i statistiken, toasten för bästa läsåret,
  troféflikens grupper och raden om att sviten följer med) och leta efter dubbletter, för långa funktioner
  och döda exporter. `src/ui/render-toasts.ts` växer med varje ny toast som jämför två renderingar: se till
  att den förblir ren och lätt att bygga ut.
- Stärk testerna där täckningen är tunn, särskilt `nextStreakTrophy` i `src/ui/stats.ts` och grupperingen i
  `src/ui/achievements.ts`.
- Alla grindar gröna, och `src/` får inte växa.
