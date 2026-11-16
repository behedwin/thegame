---
id: p-year-streak-own-year
size: S
status: proposed
touches: [src/core/prestige.ts, src/core/events.ts]
depends: [098]
---

# Läsårets svit räknas bara inom läsåret

*Varför (VISION, retention; ärlig återblick):* `prestige()` nollställer `yearBestStreak` men inte den
pågående `eventStreak`. En svit på 5 som pågår över "Nytt läsår" ger därför "Längsta svit i år: 6" redan
efter första eventet i det nya läsåret, och jämförelsen med förra läsåret (098) blir missvisande. Hittat
i 100 (testet `tests/100-refactor-20.test.ts` dokumenterar dagens beteende).

Gör så här: välj ett av två och dokumentera valet i `decisions/`:
a. låt sviten fortsätta (den är en bonus spelaren har förtjänat), men räkna `yearBestStreak` från de event
   som lösts i år, t.ex. med ett fält för sviten vid läsårets start; eller
b. nollställ `eventStreak` och `eventOpen` vid "Nytt läsår" (enklast, men spelaren tappar bonusen).
Alternativ a rekommenderas, så att inget straffar spelaren för att byta läsår.

## Tester
- Enhet: en svit på 5 som pågår över prestige ger `yearBestStreak` 1 efter ett löst event i det nya läsåret.
- Uppdatera förväntningen i `tests/100-refactor-20.test.ts`.
