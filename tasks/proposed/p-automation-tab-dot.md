---
id: p-automation-tab-dot
size: S
touches: [src/ui/app.ts, src/content/texts.ts, src/core/rules.ts]
depends: [093]
---

# Prick på fliken Integrationer när en ny integration går att köpa

*Varför (VISION, "tydligt" och korta loopen):* 089 och 093 visar en prick på Läsår och Uppgraderingar. Den som
står på Uppgraderingar eller Troféer missar ändå att en helt ny integration (nivå 0, upplåst) har blivit
köpbar. Samma `setTabDot` i `app.ts` på `tab-automations`, med en ren `anyNewAutomationAffordable(state)` i
`rules.ts` som bara räknar upplåsta integrationer som spelaren inte äger än (annars lyser den jämt).
Skärmläsartext i `T.a11y`. Ingen balansändring.

## Tester
- Enhet: falsk utan KP, sann när en ny upplåst integration är köpbar, falsk när alla köpbara redan ägs, och
  ingen mutation.
- e2e (390×844): stå på Uppgraderingar med en sparning som har råd med en ny integration, pricken syns och
  försvinner efter klick.
