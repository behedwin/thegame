---
id: p-merit-tab-dot
size: S
status: proposed
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: [086]
---

# Prick på fliken Läsår när en merit går att köpa

*Varför (VISION, lång loop och "tydligt"):* Meriter (★) tjänas in vid nytt läsår, men butiken ligger på fliken
Läsår bredvid knappen för nytt läsår. Spelaren ser inte att det finns stjärnor att lägga om hen inte öppnar
fliken. En liten prick på fliken när minst en merit går att köpa (`canBuyMerit` för något id) gör den långa
loopen synlig, och med 082 och 086 vet spelaren vad köpet ger. Ingen balansändring.

## Vad som ska göras
- En ren hjälpfunktion (t.ex. `anyMeritAffordable(state)`) som återanvänder `canBuyMerit`.
- I `app.ts`: sätt en klass/`data-dot` på `tab-prestige` när hjälpfunktionen är sann och fliken inte är vald.
  Skärmläsartext ("Meriter att köpa") från `texts.ts`.
- Stil i `style.css` (liten accentprick, som hos andra mobilspel).

## Tester
- Enhet: falsk utan stjärnor, sann med stjärnor och en ej maxad merit, falsk när alla är maxade.
- e2e (390×844): sparning med 3 ★ visar pricken; efter klick på fliken försvinner den. Inga konsolfel.
