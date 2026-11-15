---
id: 069
size: M
status: done
touches: [src/core/events.ts, src/core/state.ts, src/save/, src/ui/event-card.ts, src/content/texts.ts, src/content/balance.ts]
depends: []
priority: normal
changelog: "Lös flera event i rad för att bygga en svit som ger lite extra effekt."
---

# Eventsvit: lös flera event i rad för en liten extra bonus

Från förslaget `p-event-streak`.

Räkna hur många event spelaren har löst i följd utan att missa något (ett event som går ut nollställer
sviten). Från tre i rad ger varje löst event en liten extra procent på effekten (t.ex. +10 % per steg, högst
+50 %, konstanter i `balance.ts`), och eventkortet visar "Svit 3 🔥" bredvid effektraden från 047 när sviten
är minst 3.

*Varför (VISION, korta sessioner och retention):* belönar att spelaren tittar till spelet en stund och ger
eventen en egen liten mål-loop, utan straff för den som inte spelar (sviten nollställs bara, ingen förlust).
Kräver nytt sparfält (`SAVE_VERSION` + migrering) och balanssiffror före och efter från `sim-report.json` i
journalen.

## Tester
- Enhet: sviten ökar vid löst event, nollställs när ett event går ut, bonusen har tak och core muterar inte.
- Migrering: gamla sparfiler får sviten 0.
- e2e: kortet visar sviten när den är ≥ 3.
- `npm run sim` grön med samma pacingkrav (första prestige 30–90 min).
