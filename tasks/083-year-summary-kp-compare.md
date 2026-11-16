---
id: 083
size: S
status: ready
priority: normal
changelog: "Återblicken vid Nytt läsår visar hur mycket mer KP du tjänade än förra läsåret."
touches: [src/core/state.ts, src/core/prestige.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: []
---

# Återblicken jämför KP med förra läsåret

Från förslaget `p-year-summary-kp-compare`.

*Varför (VISION, lång loop och retention):* 078 visar skillnaden för event och ärenden, men den viktigaste
raden, KP intjänat, saknar jämförelse. "4,2 Md KP intjänat (+35 %)" visar tydligt att meriterna gör varje
läsår starkare och ger spelaren ett eget mål att slå. Ingen balansändring.

## Vad som ska göras
- Spara förra läsårets `runEarned` som `lastYearEarned` (Decimal) i `prestige()`.
- Höj `SAVE_VERSION` med en migrering som sätter `lastYearEarned` till 0, och lägg fältet bland de
  Decimal-fält som valideras i `src/save/format.ts`.
- `yearSummary` ger `kpDiffPct` (null första läsåret eller när förra året är 0), och UI:t lägger till
  procentskillnaden efter KP-raden. Texten ligger i `texts.ts`.

## Tester
- Enhet (`tests/083-*.test.ts`): positiv, negativ och noll skillnad, null första året och vid 0,
  migrering, round-trip, ogiltiga värden blir 0 och ingen mutation.
- e2e (`e2e/083-*.spec.ts`): dialogen visar procenten för en sparning med ett tidigare läsår.
