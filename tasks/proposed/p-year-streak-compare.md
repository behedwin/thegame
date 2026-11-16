---
id: p-year-streak-compare
size: S
status: proposed
touches: [src/core/state.ts, src/core/prestige.ts, src/save/format.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [096]
---

# Återblicken: läsårets svit jämförd med förra läsåret

*Varför (VISION, retention och lång loop):* 096 visar "Längsta svit i år: 7 🔥" i återblicken, men inte om
det var bättre än förra läsåret. Event och ärenden jämförs redan (078). Med samma "(+2)" på svitraden får
spelaren ett tydligt mål för nästa läsår, utan ny valuta eller balansändring.

Gör så här: lägg till `lastYearBestStreak` i `GameState`. `prestige()` sätter den till `yearBestStreak`. Höj
`SAVE_VERSION` och lägg till en migrering som sätter 0. `yearSummary` får `bestStreakDiff` via
`sinceLastYear`, och UI:t lägger till `diff(...)` på svitraden.

## Tester
- Enhet: prestige sparar årets svit, diff är null första läsåret, migreringen och ogiltiga värden ger 0, och
  indata muteras inte.
- e2e: återblicken visar "Längsta svit i år: 7 🔥 (+2)".
