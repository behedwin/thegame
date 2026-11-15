---
id: 074
size: S
status: ready
priority: normal
changelog: "Nya troféer för långa eventsviter."
touches: [src/content/types.ts, src/core/achievements.ts, src/content/achievements/]
depends: [071]
---

# Troféer för längsta eventsvit

Lägg till två eller tre troféer för längsta eventsvit (t.ex. svit 5, 10 och 20). Gör så här: en ny räknebar
villkorstyp `{ kind: 'eventStreak', n }` i `src/content/types.ts` som läser `state.bestEventStreak`. Den läggs
till på ett ställe, i `count()` i `src/core/achievements.ts`, så att både `isMet` och `progress` följer med.
En fil per trofé i `src/content/achievements/` med svenska, skämtsamma namn. Varje trofé ger som vanligt
+1 % produktion.

*Varför (VISION, retention):* rekordet för längsta eventsvit (071) är ett personligt mål men ger ingen
belöning. Troféerna ger rekordet en tydlig nästa milstolpe, och låsta troféer visar redan framsteg (067).
Ingen straff när sviten bryts, eftersom villkoret läser rekordet.

## Tester
- Enhet: troféerna låses upp av `bestEventStreak`, inte av en bruten svit (`eventStreak` = 0 och rekord ≥ n
  ger trofén), och framsteget på låsta troféer följer rekordet.
- Content-validering täcker de nya filerna.

Från förslaget `p-streak-trophies`.
