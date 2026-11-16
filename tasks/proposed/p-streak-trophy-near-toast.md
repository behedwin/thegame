---
id: p-streak-trophy-near-toast
size: S
status: proposed
touches: [src/ui/app.ts, src/content/texts.ts]
depends: [111]
---

# Toast när sviten är ett event från nästa trofé

*Varför (VISION, retention; personliga mål):* 111 visar nästa svittrofé i statistiken, men den syns bara när
spelaren öppnar den. En kort toast när sviten når en under nästa tröskel, t.ex. "Ett event till för trofén
vid 5 🔥", gör delmålet synligt i rätt ögonblick. Inget straff om sviten bryts, och ingen balansändring.

Gör så här: lägg en ren hjälpare (gärna i `src/ui/stats.ts` bredvid `nextStreakTrophy`, eller i core) och
visa toasten i `app.ts` på den uppdatering där `eventStreak` går till `nästa tröskel − 1`. Texten läggs i
`texts.ts`.

## Tester
- Enhet: toasten triggas bara vid övergången till tröskel − 1, inte vid laddning och inte när alla
  svittroféer är upplåsta.
