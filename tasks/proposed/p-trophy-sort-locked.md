---
id: p-trophy-sort-locked
size: S
status: proposed
touches: [src/ui/achievements.ts, src/content/texts.ts, src/ui/style.css]
depends: [104]
---

# Troféfliken: rubriker för "Kvar att ta" och "Tagna"

*Varför (VISION, retention; tydliga nära mål):* listan blandar tagna och låsta troféer i innehållsordning.
Med fler än 25 troféer blir det svårt att se vad som återstår. Dela listan i två grupper med en kort rubrik
var: först "Kvar att ta" (låsta, i samma ordning som i dag), sedan "Tagna". "Nästan där" (077/104) ligger
kvar överst och hittar sitt kort i första gruppen. Ingen balansändring.

## Tester
- e2e (390×844): med en sparning med både tagna och låsta troféer kommer alla låsta kort före de tagna, och
  rubrikerna syns. Trycket på "Nästan där" hittar fortfarande rätt kort.
