---
id: 081
size: S
status: done
priority: normal
changelog: "Maxade meriter samlas längst ned i Läsår-fliken."
touches: [src/core/rules.ts, src/ui/shop.ts, src/ui/prestige.ts, src/ui/style.css, src/content/texts.ts]
depends: [073]
---

# Maxade meriter samlas längst ned

073 fäller ihop maxade uppgraderingar i raden "Klara (n)". Meritbutiken i Läsår-fliken har samma problem efter
några läsår: maxade meriter ligger kvar nedtonade mellan dem man kan köpa. Använd samma fold-rad för
`kind: 'merits'` i `ShopList`.

`splitMaxed`/`isMaxed` i `src/core/rules.ts` känner i dag bara till uppgraderingar (`state.upgrades`). Utöka
dem (eller lägg en motsvarighet) så att en merit räknas som maxad när `level(state.meritUpgrades, id)` har nått
meritens `maxLevel`, och se till att `canBuy` för vanliga köp inte påverkas.

*Varför (VISION, "mobilen först", "tydligt"):* mindre skrollande i den långa loopen, och det man kan köpa står
först.

## Tester
- Enhet: en maxad merit hamnar i `done`, en inte maxad i `open`, ordningen behålls och uppgraderingarna
  sorteras som förut.
- e2e (390×844): med en maxad merit syns "Klara (1)" i Läsår-fliken, och ett tryck visar och döljer kortet.

Från förslaget `p-fold-maxed-merits`.
