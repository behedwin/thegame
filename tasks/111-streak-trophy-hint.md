---
id: 111
size: S
status: ready
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [074]
priority: normal
changelog: "Statistiken visar din pågående svit och när nästa svittrofé låses upp."
---

# Statistik: nästa svittrofé

Från förslaget `p-streak-trophy-hint`.

*Varför (VISION, retention; personliga mål):* 074 ger troféer för eventsvit 5, 10 och 20, men under spelet
syns bara rekordet. En rad i statistiken, t.ex. "Nuvarande svit: 3 (nästa trofé vid 5)", gör den pågående
sviten till ett synligt delmål. Ingen balansändring och inget straff när sviten bryts.

Gör så här: lägg en rad i `statRows` (`src/ui/stats.ts`) med den synliga sviten (`visibleStreak(state.eventStreak)`)
och det lägsta `n` bland de `eventStreak`-troféer som inte är upplåsta. När alla är upplåsta visas bara
sviten. Texten läggs i `texts.ts`.

## Tester
- Enhet (`tests/111-*.test.ts`): raden visar nästa tröskel (5) i ett nytt spel, hoppar till 10 när 5 är
  upplåst och saknar tröskel när alla tre är upplåsta.
