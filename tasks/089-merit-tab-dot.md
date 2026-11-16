---
id: 089
size: S
status: ready
priority: normal
changelog: "En prick på fliken Läsår visar när du har stjärnor att lägga på en merit."
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: [086]
---

# Prick på fliken Läsår när en merit går att köpa

Från förslaget `p-merit-tab-dot`.

*Varför (VISION, lång loop och "tydligt"):* meriter (★) tjänas in vid nytt läsår, men butiken ligger på
fliken Läsår bredvid knappen för nytt läsår. Spelaren ser inte att det finns stjärnor att lägga om hen inte
öppnar fliken. En liten prick på fliken när minst en merit går att köpa (`canBuyMerit` för något id) gör
den långa loopen synlig, och med 082 och 086 vet spelaren vad köpet ger. Ingen balansändring.

## Vad som ska göras
- En ren hjälpfunktion (t.ex. `anyMeritAffordable(state)`) som återanvänder `canBuyMerit` från
  `src/core/rules.ts`. Lägg den i `src/ui/app.ts` (eller som en lokal funktion där) så att `touches` räcker.
- I `app.ts`: sätt en klass/`data-dot` på `tab-prestige` när hjälpfunktionen är sann och fliken inte är vald.
  Skärmläsartext ("Meriter att köpa") från `texts.ts`.
- Stil i `style.css` (en liten accentprick, som i andra mobilspel).

## Tester
- Enhet (`tests/089-*.test.ts`): falsk utan stjärnor, sann med stjärnor och en ej maxad merit, falsk när
  alla meriter är maxade.
- e2e (`e2e/089-*.spec.ts`, 390×844): en sparning med 3 ★ visar pricken, och efter ett klick på fliken
  försvinner den. Inga konsolfel.
