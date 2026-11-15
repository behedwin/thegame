---
id: p-changelog-texts
size: S
status: proposed
touches: [tasks/done/]
depends: [054]
---

# Spelarvänliga texter i "Nyheter i spelet"

*Varför (VISION, "tydligt"):* loggen från 054 visar rubrikerna på gamla uppgifter, och flera av dem är
skrivna för utvecklare ("Android-polish", "Batterispar: pausa nätverksanimationen när den inte syns",
"Mer marginal till golvet för första prestige"). Spelaren förstår bättre en mening om vad som blev nytt
för hen.

## Vad som ska göras
- Lägg `changelog: "<mening>"` på de klara uppgifter i `tasks/done/` vars rubrik inte säger spelaren
  något, och `changelog: false` på rent tekniska uppgifter som spelaren inte märker. Bara frontmattern
  ändras.
- Meningarna är korta, på svenska och beskriver vad spelaren kan göra eller se nu.

## Tester
- `tests/<id>-*.test.ts`: `readChangelog()` ger inga poster vars titel innehåller ord som "refaktor",
  "budget" eller "golvet", och alla poster har en titel på högst 90 tecken.
