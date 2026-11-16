---
id: p-trophy-taken-collapse
size: S
status: proposed
touches: [src/ui/achievements.ts, src/content/texts.ts, src/ui/style.css]
depends: [113]
---

# Troféfliken: fäll ihop gruppen "Tagna"

*Varför (VISION, retention; tydliga nära mål):* sedan 113 ligger tagna troféer sist under "Tagna". När
spelaren har tagit många blir listan ändå lång att scrolla. Låt rubriken "Tagna" vara en knapp som fäller
ihop och ut gruppen (med antal, t.ex. "Tagna (12)"), ihopfälld som standard. Valet behöver inte sparas.
Ingen balansändring.

## Tester
- e2e (390×844): gruppen är ihopfälld vid start, trycket på rubriken visar korten och ett nytt tryck döljer
  dem. "Nästan där" hittar fortfarande sitt kort. Inga konsolfel.
