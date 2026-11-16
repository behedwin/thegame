---
id: 113
size: S
status: done
touches: [src/ui/achievements.ts, src/content/texts.ts, src/ui/style.css]
depends: [104]
priority: normal
changelog: "Troféfliken visar först troféerna som är kvar att ta och sedan de tagna."
---

# Troféfliken: rubriker för "Kvar att ta" och "Tagna"

Från förslaget `p-trophy-sort-locked`.

*Varför (VISION, retention; tydliga nära mål):* listan blandar tagna och låsta troféer i innehållsordning.
Med fler än 25 troféer blir det svårt att se vad som återstår. Dela listan i två grupper med en kort rubrik
var: först "Kvar att ta" (låsta, i samma ordning som i dag), sedan "Tagna". "Nästan där" (077/104) ligger
kvar överst och hittar sitt kort i första gruppen. En grupp utan kort visar ingen rubrik. Ingen
balansändring.

## Vad som ska göras
- Dela listan i `src/ui/achievements.ts` i två grupper med rubriker från `texts.ts`, utan att ändra
  ombyggnadsvillkoret (listan byggs bara om när de tagna troféerna eller en räknare ändras).
- Diskret rubrikstil i `style.css`.

## Tester
- e2e (`e2e/113-*.spec.ts`, 390×844): med en sparning med både tagna och låsta troféer kommer alla låsta kort
  före de tagna, och rubrikerna syns. Trycket på "Nästan där" hittar fortfarande rätt kort. Inga konsolfel.
