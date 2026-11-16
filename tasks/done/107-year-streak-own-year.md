---
id: 107
size: M
status: done
priority: normal
changelog: "Årets längsta svit räknar nu bara event från det här läsåret."
touches: [src/core/prestige.ts, src/core/events.ts, src/core/state.ts, src/save/]
depends: [098]
---

# Läsårets svit räknas bara inom läsåret

Från förslaget `p-year-streak-own-year`.

*Varför (VISION, retention; ärlig återblick):* `prestige()` nollställer `yearBestStreak` men inte den
pågående `eventStreak`. En svit på 5 som pågår över "Nytt läsår" ger därför "Längsta svit i år: 6" redan
efter första eventet i det nya läsåret, och jämförelsen med förra läsåret (098) blir missvisande. Hittat
i 100 (testet `tests/100-refactor-20.test.ts` dokumenterar dagens beteende).

## Vad som ska göras
Låt sviten fortsätta över läsårsbytet (bonusen är förtjänad, och inget ska straffa spelaren för att byta
läsår), men räkna `yearBestStreak` bara från event som lösts i år:
- Nytt fält i `GameState`, t.ex. `yearStreakBase` (sviten vid läsårets start). `prestige()` sätter det till
  `eventStreak`. När sviten bryts (`events.ts`) sätts det till 0.
- När ett event löses blir `yearBestStreak` max av sitt gamla värde och `streak - yearStreakBase`.
- Nytt sparfält: höj `SAVE_VERSION`, lägg till en migrering i `MIGRATIONS` som sätter fältet till 0, och
  ändra ingen släppt migrering.
- Dokumentera valet (fortsatt svit i stället för nollställning) kort i `decisions/`.

## Tester
- Enhet (`tests/107-*.test.ts`): en svit på 5 som pågår över prestige ger `yearBestStreak` 1 efter ett löst
  event i det nya läsåret, och `eventStreak` (bonusen) är fortfarande 6. En bruten svit nollställer basen.
- Sparning: migreringen från förra versionen ger fältet 0, och fältet överlever spara/ladda.
- Uppdatera förväntningen i `tests/100-refactor-20.test.ts`.
