---
id: p-fastest-year-record
size: M
status: proposed
touches: [src/core/, src/save/, src/ui/stats.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [071]
---

# Rekord: snabbaste läsåret

*Varför (VISION, lång loop och retention):* Statistiken har rekord för bästa läsår (KP) och längsta eventsvit
(071), men inget som belönar att spelaren blir snabbare för varje omstart. Ett rekord för det snabbaste
läsåret (speltid från läsårsstart till "Nytt läsår") ger ett tydligt mål att slå i varje runda, och
sammanfattningen vid "Nytt läsår" kan visa "Nytt rekord!" när det slås. Ingen balansändring.

Gör så här: spara läsårets starttid (`yearStartMs`, speltid) och `fastestYearMs` (0 = inget ännu) i
`GameState`. `prestige()` jämför och uppdaterar rekordet. Höj `SAVE_VERSION` med en migrering där
befintliga spelare börjar utan rekord och med `yearStartMs = timeMs`. Visa raden i statistiken och en rad i
läsårssammanfattningen.

## Tester
- Enhet: rekordet sätts vid första prestige, sänks bara när ett läsår går snabbare och muterar inte indata.
- Spara: migrering, round-trip och ogiltiga värden blir 0.
