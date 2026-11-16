---
id: 094
size: S
status: done
priority: normal
changelog: "Fliken Läsår visar hur länge läsåret har pågått och ditt rekord."
touches: [src/ui/prestige.ts, src/content/texts.ts, src/ui/style.css]
depends: [088]
---

# Läsårsklocka mot rekordet på fliken Läsår

Från förslaget `p-year-clock`.

*Varför (VISION, retention och "lång loop"):* 088 sparar det snabbaste läsåret, men spelaren ser tiden först i
återblicken, när läsåret redan är slut. En rad "Läsåret: 18 min (rekord 25 min)" på fliken Läsår gör rekordet
till något man jagar medan man spelar (och trofén Expresskörning från 091), utan ny valuta eller
balansändring.

## Vad som ska göras
- `PrestigeView` visar `yearDurationMs(state)` (`src/core/prestige.ts`) med `fmtDuration`
  (`src/ui/format.ts`), och rekordet när `fastestYearMs > 0`.
- Raden uppdateras i den vanliga render-loopen (bara `textContent` när texten ändras) och visas från andra
  läsåret (`prestiges >= 1`).
- Textfunktion och texter i `texts.ts`.

## Tester
- Enhet (`tests/094-*.test.ts`): textfunktionen med och utan rekord.
- e2e (`e2e/094-*.spec.ts`): sparning med `prestiges: 1` och ett rekord visar raden på fliken Läsår; första
  läsåret visar ingen rad. Inga konsolfel.
