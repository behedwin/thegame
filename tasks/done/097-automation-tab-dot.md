---
id: 097
size: S
status: done
priority: normal
changelog: "En prick på fliken Integrationer visar när en ny integration går att köpa."
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts, src/core/rules.ts]
depends: [093]
---

# Prick på fliken Integrationer när en ny integration går att köpa

Från förslaget `p-automation-tab-dot`.

*Varför (VISION, "tydligt" och korta loopen):* 089 och 093 visar en prick på Läsår och Uppgraderingar. Den som
står på Uppgraderingar eller Troféer missar ändå att en helt ny integration (nivå 0, upplåst) har blivit
köpbar. Använd samma `setTabDot` i `app.ts` på fliken för integrationer, med en ren
`anyNewAutomationAffordable(state)` i `rules.ts` som bara räknar upplåsta integrationer som spelaren inte äger
än (annars lyser den jämt). Skärmläsartext i `T.a11y`. Ingen balansändring.

## Tester
- Enhet (`tests/097-*.test.ts`): falsk utan KP, sann när en ny upplåst integration är köpbar, falsk när alla
  köpbara redan ägs, och ingen mutation av indata.
- e2e (390×844): stå på Uppgraderingar med en sparning som har råd med en ny integration. Pricken syns och
  försvinner efter klick på fliken. Inga konsolfel.
