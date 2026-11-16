---
id: 098
size: S
status: done
priority: normal
changelog: "Återblicken jämför läsårets längsta eventsvit med förra läsåret."
touches: [src/core/state.ts, src/core/prestige.ts, src/save/format.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [096]
---

# Återblicken: läsårets svit jämförd med förra läsåret

Från förslaget `p-year-streak-compare`.

*Varför (VISION, retention och lång loop):* 096 visar "Längsta svit i år: 7 🔥" i återblicken, men inte om
det var bättre än förra läsåret. Event och ärenden jämförs redan (078). Med samma "(+2)" på svitraden får
spelaren ett tydligt mål för nästa läsår, utan ny valuta eller balansändring.

## Vad som ska göras
- Lägg till `lastYearBestStreak` i `GameState`. `prestige()` sätter den till `yearBestStreak`.
- Höj `SAVE_VERSION` och lägg till en migrering som sätter 0 (ogiltiga värden ger också 0). Ändra ingen
  släppt migrering.
- `yearSummary` får `bestStreakDiff` via `sinceLastYear`, och UI:t lägger till `diff(...)` på svitraden.

## Tester
- Enhet (`tests/098-*.test.ts`): prestige sparar årets svit, diff är null första läsåret, migreringen och
  ogiltiga värden ger 0, och indata muteras inte.
- e2e: återblicken visar "Längsta svit i år: 7 🔥 (+2)" för en sparning med förra läsårets svit 5.
