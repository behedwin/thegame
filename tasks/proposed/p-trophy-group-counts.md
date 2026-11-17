---
id: p-trophy-group-counts
size: S
status: proposed
touches: [src/ui/achievements.ts, src/content/texts.ts]
depends: [115]
---

# Troféfliken: antal i gruppernas rubriker

*Varför (VISION, retention; tydliga nära mål):* sedan 113 delas troféerna i "Kvar att ta" och "Tagna", men
spelaren måste räkna korten för att se hur många som är kvar. Med antalet i rubriken ("Kvar att ta (7)",
"Tagna (12)") syns framstegen direkt när fliken öppnas, utan att man scrollar.

- `trophyGroups` (115) ger redan båda listorna, så rubrikerna kan ta längden därifrån.
- Texterna blir funktioner i `texts.ts` (`groupLocked(n)`, `groupUnlocked(n)`).

**Tester:** unit för texterna och för att rubriken följer `trophyGroups(state).locked.length`; anpassa
e2e 113 om den läser rubriktexten exakt.
