---
id: p-toast-history
size: S
status: proposed
touches: [src/ui/feedback.ts, src/ui/stats.ts, src/content/texts.ts]
depends: []
---

# Senaste notiserna går att läsa igen

Toasterna (rekord, nytt läsår, fördubblade meriter, troféer) försvinner efter några sekunder, och en spelare
som tittade bort missar dem. Spara de 5 senaste toasttexterna i minnet (inte i sparfilen) och visa dem som en
lugn lista "Senaste notiser" längst ned i Statistik.

Motivering (VISION.md): känslan av framsteg ska gå att ta del av i egen takt, utan stress över att ha missat
något.

Tester: listan håller högst 5, nyast först, och är tom efter omladdning. e2e: en toast syns sedan i Statistik.
