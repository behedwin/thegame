---
id: p-year-best-streak
size: S
status: proposed
touches: [src/core/state.ts, src/core/events.ts, src/core/prestige.ts, src/save/format.ts, src/ui/prestige.ts, src/content/texts.ts]
depends: [078]
---

# Läsårets längsta eventsvit i återblicken

*Varför (VISION, retention och "lång loop"):* återblicken (063, 076, 078) räknar event och ärenden, men inte
det som känns bäst under ett läsår: hur lång sviten blev. En rad "Längsta svit i år: 7 🔥" ger spelaren
något att slå nästa läsår, utan ny valuta eller balansändring.

## Vad som ska göras
- Ny räknare `yearBestStreak` i `GameState` som `claimEvent` höjer (som `bestEventStreak`) och `prestige()`
  nollställer. Höj `SAVE_VERSION` och lägg en migrering som sätter 0.
- `yearSummary` får fältet, och återblicken visar raden bara när sviten nått `BALANCE.events.streak.min`.

## Tester
- Enhet: claim höjer, prestige nollställer, migrering och ogiltiga värden ger 0, ingen mutation.
- e2e: återblicken visar raden efter en svit och döljer den annars.
