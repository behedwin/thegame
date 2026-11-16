---
id: p-upgrade-tab-dot
size: S
status: proposed
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: [089]
---

# Prick på fliken Uppgraderingar när en ny uppgradering går att köpa

*Varför (VISION, "tydligt" och korta loopen):* 089 visar en prick på fliken Läsår när en merit går att köpa.
Spelaren som står på fliken Integrationer missar på samma sätt att en uppgradering (ofta en stor
multiplikator) har blivit köpbar. Samma prick (klassen `dot`) på `tab-uppgrades` när minst en ej köpt,
upplåst uppgradering är köpbar och fliken inte är vald gör nästa steg synligt. Ingen balansändring.

## Vad som ska göras
- Ren hjälpfunktion `anyUpgradeAffordable(state)` (som `anyMeritAffordable` i `app.ts`) som bara räknar
  uppgraderingar på nivå 0, så att pricken inte lyser jämt för nivåuppgraderingar.
- Återanvänd `.tab.dot` från 089 och lägg en skärmläsartext i `texts.ts`.

## Tester
- Enhet: falsk utan KP, sann när en ny uppgradering är köpbar, falsk när den redan är köpt.
- e2e (390×844): en sparning med mycket KP visar pricken, och efter ett klick på fliken försvinner den.
