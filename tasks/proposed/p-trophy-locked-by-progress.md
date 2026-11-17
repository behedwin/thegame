---
id: p-trophy-locked-by-progress
size: S
status: proposed
touches: [src/ui/achievements.ts]
depends: [118]
---

# Troféfliken: "Kvar att ta" sorteras efter hur nära de är

*Varför (VISION, retention; tydliga nära mål):* sedan 118 är "Tagna" ihopfälld, så listan består nästan bara
av låsta troféer. De ligger i registrets ordning, så en trofé som är 24 av 25 kan hamna längst ner bakom en
som är 0 av 20. Sorterar man de räknebara efter andel klar (högst först) och lägger de utan räknare sist,
ser spelaren de närmaste målen direkt när fliken öppnas.

- `trophyGroups` får sortera `locked` stabilt efter `have / need` (fallande); troféer utan `progress` sist.
- "Nästan där"-kortet (077/104) påverkas inte och ska fortfarande hitta sitt kort.

**Tester:** unit för sorteringen i `trophyGroups` (stabil ordning vid lika andel, utan räknare sist);
anpassa e2e 113 om den förutsätter registerordning.
