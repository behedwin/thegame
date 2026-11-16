---
id: 088
size: M
status: done
priority: normal
changelog: "Nytt rekord att slå: ditt snabbaste läsår."
touches: [src/core/, src/save/, src/ui/stats.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [085]
---

# Rekord: snabbaste läsåret

Från förslaget `p-fastest-year-record`.

*Varför (VISION, lång loop och retention):* statistiken har rekord för bästa läsår (KP) och längsta
eventsvit (071), men inget som belönar att spelaren blir snabbare för varje omstart. Ett rekord för det
snabbaste läsåret (speltid från läsårsstart till "Nytt läsår") ger ett tydligt mål att slå i varje runda,
och sammanfattningen vid "Nytt läsår" kan visa "Nytt rekord!" när det slås. Ingen balansändring.

## Vad som ska göras
- Spara läsårets starttid (`yearStartMs`, speltid som `timeMs`) och `fastestYearMs` (0 = inget ännu) i
  `GameState`. `prestige()` jämför, uppdaterar rekordet och sätter ny `yearStartMs`.
- Höj `SAVE_VERSION` (nu 16) med en migrering där befintliga spelare börjar utan rekord och med
  `yearStartMs = timeMs`. Ändra inga befintliga migreringar.
- Visa raden i statistiken (bara när ett rekord finns) och en rad i läsårssammanfattningen, med
  "Nytt rekord!" när läsåret var det snabbaste hittills. Texterna i `texts.ts`.

## Tester
- Enhet (`tests/088-*.test.ts`): rekordet sätts vid första prestige, sänks bara när ett läsår går
  snabbare och muterar inte indata.
- Spara: migrering, round-trip och ogiltiga värden (negativa, NaN) blir 0.
