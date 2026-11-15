---
id: p-trophy-progress
size: S
status: proposed
touches: [src/core/achievements.ts, src/ui/achievements.ts, src/content/texts.ts]
depends: [064]
---

# Visa framsteg på låsta troféer

Troféfliken visar bara om en trofé är tagen eller inte. Lägg till en ren funktion `progress(state, condition)`
i `src/core/achievements.ts` som ger `{ have, need }` för räknebara villkor (klick, event, ärenden, kunder,
läsår, automationer, uppgraderingar) och visa "7 av 10" på låsta troféer i `src/ui/achievements.ts`. Signaturen
för omritning behöver då ta med de räknare som visas (eller ritas om högst en gång per sekund).

*Varför (VISION, retention):* ett synligt "nästan där" ger ett nära mål att jobba mot, särskilt för de nya
ärendetroféerna (064) och eventtroféerna, utan att ändra balansen.

## Tester
- Enhet: `progress` för varje räknebart villkor, kapad vid `need`, och tom för villkor utan räknare.
- e2e: en låst trofé visar framsteg, en tagen gör det inte.
