---
id: p-streak-trophies
size: S
status: proposed
touches: [src/content/types.ts, src/core/achievements.ts, src/content/achievements/]
depends: [071]
---

# Troféer för längsta eventsvit

*Varför (VISION, retention):* rekordet för längsta eventsvit (071) är ett personligt mål, men det ger ingen
belöning. Två eller tre troféer (t.ex. svit 5, 10 och 20) ger rekordet en tydlig nästa milstolpe och
låsta troféer visar redan framsteg (067). Varje trofé ger +1 % produktion, så det är en liten belöning utan
straff när sviten bryts.

Gör så här: en ny räknebar villkorstyp `{ kind: 'eventStreak', n }` som läser `bestEventStreak`. Den läggs
till på ett ställe i `count()` i `src/core/achievements.ts` (070). En fil per trofé i
`src/content/achievements/` med svenska, skämtsamma namn.

## Tester
- Enhet: troféerna låses upp av `bestEventStreak`, inte av en bruten svit, och framsteget på låsta troféer
  följer rekordet.
- Content-validering täcker de nya filerna.
