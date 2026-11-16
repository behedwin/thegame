---
id: 093
size: S
status: ready
priority: normal
changelog: "En prick på fliken Uppgraderingar visar när en ny uppgradering går att köpa."
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts, src/core/rules.ts]
depends: [089]
---

# Prick på fliken Uppgraderingar när en ny uppgradering går att köpa

Från förslaget `p-upgrade-tab-dot`.

*Varför (VISION, "tydligt" och korta loopen):* 089 visar en prick på fliken Läsår när en merit går att köpa.
Spelaren som står på fliken Integrationer missar på samma sätt att en uppgradering (ofta en stor
multiplikator) har blivit köpbar. Samma prick (klassen `dot`) på `tab-upgrades` när minst en ej köpt,
upplåst uppgradering är köpbar och fliken inte är vald gör nästa steg synligt. Ingen balansändring.

## Vad som ska göras
- Ren hjälpfunktion `anyUpgradeAffordable(state)` i `src/core/rules.ts`, bredvid `anyMeritAffordable`
  (som flyttades dit i 090). Den återanvänder `canBuy` och räknar bara uppgraderingar på nivå 0, så att
  pricken inte lyser jämt för nivåuppgraderingar.
- I `app.ts`: samma logik som för `tab-prestige` (klass `dot` och `aria-label`) på `tab-upgrades`.
  Återanvänd `.tab.dot` från 089 och lägg en skärmläsartext i `texts.ts` (`T.a11y`).

## Tester
- Enhet (`tests/093-*.test.ts`): falsk utan KP, sann när en ny uppgradering är köpbar, falsk när den redan
  är köpt, och ingen mutation av state.
- e2e (`e2e/093-*.spec.ts`, 390×844): en sparning med mycket KP visar pricken, och efter ett klick på fliken
  försvinner den. Inga konsolfel.
