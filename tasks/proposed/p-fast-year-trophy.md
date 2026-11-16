---
id: p-fast-year-trophy
size: S
status: proposed
touches: [src/core/achievements.ts, src/content/achievements/, src/content/types.ts]
depends: [088]
---

# Trofé: ett snabbt läsår

*Varför (VISION, lång loop och retention):* 088 sparar det snabbaste läsåret (`fastestYearMs`), men inget
mål pekar ut ett tempo att sikta på. En trofé "Expresskörning" för ett läsår under t.ex. 35 min speltid
(siffran sätts efter `sim-report.json`, första prestige ligger på 30–55 min) ger ett konkret mål för
spelare som redan har några läsår bakom sig, och troféernas produktionsbonus blir en liten belöning.

## Vad som ska göras
- Nytt troévillkor (t.ex. `kind: 'fastestYear'`, `maxMs`) i achievement-typen och `checkAchievements`.
  Villkoret uppfylls när `fastestYearMs > 0 && fastestYearMs <= maxMs`.
- En ny fil i `src/content/achievements/` med svensk text.

## Tester
- Enhet: trofén låses upp efter en prestige med snabbt läsår men inte med 0 (inget rekord) eller ett långsamt.
- Content-validering täcker den nya filen.
