---
id: 117
size: S
status: done
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [091]
priority: normal
changelog: "Statistiken visar hur långt det här läsåret har gått mot trofén Expresskörning."
---

# Statistik: årets tid mot Expresskörning

Från förslaget `p-year-pace-hint`.

*Varför (VISION, retention; personliga mål):* 091 ger trofén Expresskörning för ett läsår på högst 15 min,
men under spelet syns bara det snabbaste läsåret. En rad i statistiken, t.ex. "Det här läsåret: 9 min
(Expresskörning vid 15 min)", gör tempot till ett synligt delmål medan läsåret pågår. Ingen balansändring
och inget straff: raden försvinner när trofén är upplåst.

## Vad som ska göras
- Lägg en rad i `statRows` (`src/ui/stats.ts`) med `yearDurationMs(state)` (core) och `maxMs` från den
  låsta trofén med villkoret `fastestYear` (hämtas ur `ACHIEVEMENTS`, ingen hårdkodad gräns).
- Raden visas bara efter första läsåret (`prestiges > 0`) och bara medan trofén är låst.
- Texten läggs i `texts.ts` (`T.stats`).

## Tester
- `tests/117-*.test.ts`: raden saknas i första läsåret, visas med tid och gräns i andra läsåret och
  försvinner när trofén är upplåst.
