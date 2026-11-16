---
id: p-year-clock
size: S
status: proposed
touches: [src/ui/prestige.ts, src/content/texts.ts, src/ui/style.css]
depends: [088]
---

# Läsårsklocka mot rekordet på fliken Läsår

*Varför (VISION, retention och "lång loop"):* 088 sparar det snabbaste läsåret, men spelaren ser tiden först i
återblicken, när läsåret redan är slut. En rad "Läsåret: 18 min (rekord 25 min)" på fliken Läsår gör rekordet
till något man jagar medan man spelar, utan ny valuta eller balansändring.

## Vad som ska göras
- `PrestigeView` visar `yearDurationMs(state)` med `fmtDuration`, och rekordet när `fastestYearMs > 0`.
- Raden uppdateras i den vanliga render-loopen (bara textContent när den ändras) och visas från andra läsåret.
- Texter i `texts.ts`.

## Tester
- Enhet: textfunktionen med och utan rekord.
- e2e: sparning med `prestiges: 1` och ett rekord visar raden på fliken Läsår; första läsåret visar ingen rad.
