---
id: 096
size: S
status: ready
priority: normal
changelog: "Återblicken visar läsårets längsta eventsvit."
touches: [src/core/state.ts, src/core/events.ts, src/core/prestige.ts, src/save/format.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [078]
---

# Läsårets längsta eventsvit i återblicken

Från förslaget `p-year-best-streak`.

*Varför (VISION, retention och "lång loop"):* återblicken (063, 076, 078) räknar event och ärenden, men inte
det som känns bäst under ett läsår: hur lång sviten blev. En rad "Längsta svit i år: 7 🔥" ger spelaren
något att slå nästa läsår, utan ny valuta eller balansändring.

## Vad som ska göras
- Ny räknare `yearBestStreak` i `GameState` som `claimEvent` höjer (som `bestEventStreak`) och `prestige()`
  nollställer. Höj `SAVE_VERSION` (nu 17) och lägg en migrering som sätter 0. Ändra ingen släppt migrering.
- `yearSummary` får fältet, och återblicken visar raden bara när sviten nått `BALANCE.events.streak.min`.

## Tester
- Enhet (`tests/096-*.test.ts`): claim höjer, prestige nollställer, migrering och ogiltiga värden ger 0,
  ingen mutation.
- e2e (`e2e/096-*.spec.ts`): återblicken visar raden efter en svit och döljer den annars.
