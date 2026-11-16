---
id: 091
size: S
status: done
priority: normal
changelog: "Ny trofé: Expresskörning, för ett riktigt snabbt läsår."
touches: [src/core/achievements.ts, src/content/achievements/, src/content/types.ts]
depends: [088, 090]
---

# Trofé: ett snabbt läsår

Från förslaget `p-fast-year-trophy`.

*Varför (VISION, lång loop och retention):* 088 sparar det snabbaste läsåret (`fastestYearMs`), men inget
mål pekar ut ett tempo att sikta på. En trofé "Expresskörning" för ett läsår under en viss speltid ger ett
konkret mål för spelare som redan har några läsår bakom sig, och troféernas produktionsbonus blir en liten
belöning.

## Vad som ska göras
- Nytt troévillkor (`kind: 'fastestYear'`, `maxMs`) i `AchievementCondition` (`src/content/types.ts`) och i
  `checkAchievements` (`src/core/achievements.ts`). Villkoret uppfylls när
  `fastestYearMs > 0 && fastestYearMs <= maxMs`.
- En ny fil `src/content/achievements/expresskorning.ts` med svensk text i spelets torra ton.
- Sätt `maxMs` utifrån `sim-report.json` (första prestige ligger på 30–90 min). Gränsen ska kräva att
  spelaren är snabbare än ett normalt första läsår, men gå att nå med meriter. Skriv siffrorna i journalen.

## Tester
- Enhet (`tests/091-*.test.ts`): trofén låses upp efter en prestige med snabbt läsår, men inte med 0 (inget
  rekord) eller med ett långsamt läsår. Ingen mutation av indata.
- Content-valideringen täcker den nya filen.
