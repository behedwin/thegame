---
id: 067
size: S
status: ready
touches: [src/core/achievements.ts, src/ui/achievements.ts, src/content/texts.ts]
depends: []
priority: normal
changelog: "Låsta troféer visar nu hur långt du har kvar, t.ex. \"7 av 10\"."
---

# Visa framsteg på låsta troféer

Från förslaget `p-trophy-progress`.

Troféfliken visar bara om en trofé är tagen eller inte. Lägg till en ren funktion `progress(state, condition)`
i `src/core/achievements.ts` som ger `{ have, need }` för räknebara villkor (klick, event, ärenden, kunder,
läsår, automationer, uppgraderingar) och visa "7 av 10" (text i `texts.ts`) på låsta troféer i
`src/ui/achievements.ts`. Omritningen styrs i dag av en signatur som bara innehåller de tagna troféerna; den
behöver ta med de räknare som visas, eller ritas om högst en gång per sekund.

*Varför (VISION, retention):* ett synligt "nästan där" ger ett nära mål att jobba mot, särskilt för
ärendetroféerna (064) och eventtroféerna, utan att ändra balansen.

## Tester
- Enhet: `progress` för varje räknebart villkor, kapad vid `need`, och tom (`null`) för villkor utan räknare
  (t.ex. `totalEarned`, `kps`). Indata muteras inte.
- e2e: en låst trofé visar framsteg, en tagen gör det inte. Inga konsolfel.
