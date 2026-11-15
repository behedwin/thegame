---
id: p-ticket-trophies
size: S
status: proposed
touches: [src/content/types.ts, src/core/achievements.ts, src/content/achievements/]
depends: [048]
---

# Troféer för besvarade ärenden

Inkorgen har ingen trofé, fast eventen har (t.ex. "Brandkåren", 25 event). Lägg till ett nytt villkor
`{ kind: 'ticketsAnswered', n }` i `AchievementCondition` och två troféer som nya filer, t.ex.
"Supportsvar" (10 ärenden) och "Ärendekungen" (100 ärenden), med torr IT-humor.

*Varför (VISION, lång loop):* räknaren från 048 syns nu i Statistik och i inkorgen. En trofé ger den ett mål,
och troféerna är det spelaren samlar på över flera läsår.

## Tester
- Enhet: villkoret uppfylls vid exakt n, inte vid n − 1, och troféerna klarar content-valideringen.
- Kontrollera att e2e som räknar troféer (`x av N`) inte hårdkodar antalet.
