---
id: p-merit-effect-core
size: S
status: proposed
touches: [src/core/rules.ts, src/ui/shop.ts]
depends: [085]
---

# En enda källa för vad en merit ger på en nivå

*Varför (VISION, tydlighet och förtroende):* meritkortets "Nu: …"-text (082) räknar själv ut effekten per
nivå, och taket för tätare event (`MAX_EVENT_COOLDOWN_CUT_PCT`) tillämpas både i core och i UI. 085 flyttade
rabattformeln till `discountFactor()` i core, men resten är kvar som dubblett. Driver de isär visar kortet
fel siffra, och spelaren litar inte på meritbutiken.

## Vad som ska göras
- Lägg `meritLevelEffect(def, lvl): number` i `src/core/rules.ts` som ger effektens tal på en nivå (med tak
  och multiplikativ rabatt), och låt `meritSum`/`eventCooldownMs` och `meritEffectText` använda den.
- Inget beteende ändras. Sim-siffrorna ska vara identiska.

## Tester
- Enhet: för varje riktig merit och nivå 0..maxLevel stämmer `meritLevelEffect` med effekten i core
  (`eventCooldownMs`, `offlineEfficiency`, `automationCostFactor`).
