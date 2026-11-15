---
id: 073
size: S
status: ready
priority: normal
changelog: "Maxade uppgraderingar samlas längst ned så att det du kan köpa står först."
touches: [src/ui/shop.ts, src/ui/style.css, src/content/texts.ts]
depends: [058]
---

# Maxade uppgraderingar samlas längst ned

Uppgraderingar som har nått maxnivå ligger kvar på sin plats i listan, nedtonade. Senare i ett läsår är
många av dem maxade, och de tar plats mellan det man faktiskt kan köpa. Flytta dem till en hopfälld rad
längst ned, "Klara (n)", som fäller ut dem vid tryck (aria-expanded).

*Varför (VISION, "mobilen först", "tydligt"):* fortsätter 058: mindre skrollande, och det köpbara står först.

## Tester
- Enhet: sorteringen (maxade sist, i övrigt `order`).
- e2e (390×844): med två maxade uppgraderingar syns raden "Klara (2)"; ett tryck visar korten, ett till döljer
  dem. Inga konsolfel.

Från förslaget `p-fold-maxed-upgrades`.
