---
id: 121
size: S
status: done
touches: [src/ui/achievements.ts]
depends: [118]
priority: normal
changelog: "Troféerna som är närmast att tas visas först under \"Kvar att ta\"."
---

# Troféfliken: "Kvar att ta" sorteras efter hur nära de är

Från förslaget `p-trophy-locked-by-progress`.

*Varför (VISION, retention; tydliga nära mål):* sedan 118 är "Tagna" ihopfälld, så listan består nästan bara
av låsta troféer. De ligger i registrets ordning, så en trofé som är 24 av 25 kan hamna längst ner bakom en
som är 0 av 20. Sorterar man de räknebara efter andel klar (högst först) och lägger de utan räknare sist,
ser spelaren de närmaste målen direkt när fliken öppnas. Ingen balansändring.

## Vad som ska göras
- `trophyGroups` sorterar `locked` stabilt efter `have / need` (fallande); troféer utan `progress` sist, i
  registrets ordning.
- `taken` behåller registrets ordning.
- "Nästan där"-kortet (077/104) påverkas inte och ska fortfarande hitta sitt kort.

## Tester
- `tests/121-*.test.ts`: sorteringen i `trophyGroups` (högst andel först, stabil ordning vid lika andel,
  utan räknare sist, `taken` oförändrad).
- Anpassa befintliga tester (t.ex. `tests/115-refactor-23.test.ts`, e2e 113/104) om de förutsätter
  registerordning.
