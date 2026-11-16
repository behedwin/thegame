---
id: p-year-pace-hint
size: S
status: proposed
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [091]
---

# Statistik: årets tid mot Expresskörning

*Varför (VISION, retention; personliga mål):* 091 ger trofén Expresskörning för ett läsår på högst 15 min,
men under spelet syns bara det snabbaste läsåret. En rad i statistiken, t.ex. "Det här läsåret: 9 min
(Expresskörning vid 15 min)", gör tempot till ett synligt delmål medan läsåret pågår. Ingen balansändring
och inget straff: raden försvinner när trofén är upplåst.

Gör så här: lägg en rad i `statRows` (`src/ui/stats.ts`) med `yearDurationMs(state)` (core/prestige.ts) och
`maxMs` från den låsta `fastestYear`-trofén. Raden visas bara efter första läsåret (`prestiges > 0`) och
bara medan trofén är låst. Texten läggs i `texts.ts`.

## Tester
- Enhet: raden saknas i första läsåret, visas med tid och gräns i andra läsåret och försvinner när trofén
  är upplåst.
