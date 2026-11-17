---
id: 120
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [116, 117, 118, 119]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #24

Bara refaktorering och teststärkning, inga nya features och inga balansändringar.

- Gå igenom koden som har ändrats sedan 115 (toasten när ett nytt läsår kan startas, årets tid mot
  Expresskörning i statistiken, den hopfällbara gruppen "Tagna" och fördubblingstoasten för meriter) och
  leta efter dubbletter, för långa funktioner och döda exporter.
- `src/ui/render-toasts.ts` har nu två toasts med eget minne per läsår (116 och 119): samla det gemensamma
  om det gör koden enklare, utan att ändra beteendet.
- Stärk testerna där täckningen är tunn, särskilt läsårsminnet i toasterna och hopfällningen i
  `src/ui/achievements.ts`.
- Alla grindar gröna, och `src/` får inte växa.
