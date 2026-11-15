---
id: p-event-streak
size: M
status: proposed
touches: [src/core/events.ts, src/core/state.ts, src/save/, src/ui/event-card.ts, src/content/texts.ts]
depends: [047]
---

# Eventsvit: lös flera event i rad för en liten extra bonus

Räkna hur många event spelaren har löst i följd utan att missa något (ett event som går ut nollställer
sviten). Från tre i rad ger varje löst event en liten extra procent (t.ex. +10 % på effekten, högst +50 %),
och eventkortet visar "Svit 3 🔥" bredvid effektraden från 047.

*Varför (VISION, korta sessioner och retention):* belönar att spelaren tittar till spelet en stund och
ger eventen en egen liten mål-loop, utan straff för den som inte spelar (sviten nollställs bara, ingen
förlust). Kräver nytt sparfält (`SAVE_VERSION` + migrering) och balanssiffror från `sim-report.json`.

## Tester
- Enhet: sviten ökar vid löst event, nollställs när ett event går ut, bonusen har tak och core muterar inte.
- Migrering: gamla sparfiler får sviten 0.
- E2e: kortet visar sviten när den är ≥ 3.
