---
id: 064
size: S
status: done
touches: [src/content/types.ts, src/core/achievements.ts, src/content/achievements/]
depends: []
priority: normal
changelog: "Två nya troféer för dig som svarar på ärenden i inkorgen."
---

# Troféer för besvarade ärenden

Från förslaget `p-ticket-trophies`.

Inkorgen har ingen trofé, fast eventen har (t.ex. "Brandkåren" för event). Lägg till ett nytt villkor
`{ kind: 'ticketsAnswered'; n: number }` i `AchievementCondition` (`src/content/types.ts`), hantera det i
`isMet` i `src/core/achievements.ts` (räknaren `state.ticketsAnswered` finns sedan 048) och lägg till två
troféer som nya filer i `src/content/achievements/`, t.ex. "Supportsvar" (10 ärenden) och "Ärendekungen"
(100 ärenden), med torr och varm IT-humor. Inga sparändringar behövs.

*Varför (VISION, lång loop: achievements):* räknaren syns redan i Statistik och i inkorgen. En trofé ger den ett
mål, och troféerna är det spelaren samlar på över flera läsår.

## Tester
- Enhet (`tests/064-*.test.ts`): villkoret uppfylls vid exakt n, inte vid n − 1, och de nya troféerna klarar
  content-valideringen.
- Kontrollera att befintliga tester och e2e som räknar troféer (`x av N`) inte hårdkodar antalet (anpassa dem
  annars).
