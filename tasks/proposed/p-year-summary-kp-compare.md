---
id: p-year-summary-kp-compare
size: S
status: proposed
touches: [src/core/state.ts, src/core/prestige.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: [078]
---

# Återblicken jämför KP med förra läsåret

*Varför (VISION, lång loop och retention):* 078 visar skillnaden för event och ärenden, men den viktigaste
raden, KP intjänat, saknar jämförelse. "4,2 Md KP intjänat (+35 %)" visar tydligt att meriterna gör varje
läsår snabbare och ger spelaren ett eget mål att slå. Ingen balansändring.

Gör så här: spara förra läsårets `runEarned` som `lastYearEarned` (Decimal) i `prestige()`. Höj
`SAVE_VERSION` med en migrering till 0. `yearSummary` ger `kpDiffPct` (null första läsåret eller när förra
året är 0), och UI:t lägger till procentskillnaden efter KP-raden. Texten ligger i `texts.ts`.

Tester: enhet för positiv, negativ och noll skillnad, null första året och vid 0, migrering och ingen
mutation. e2e: dialogen visar procenten för en sparning med ett tidigare läsår.
