---
id: p-stats-last-year-streak
size: S
status: proposed
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [098]
---

# Statistiken visar årets och förra läsårets längsta svit

*Varför (VISION, retention och lång loop):* 098 jämför läsårets längsta eventsvit med förra läsåret, men bara
i återblicken när läsåret är slut. En rad "Längsta svit i år: 4 🔥 (förra läsåret 6)" i statistiken gör
förra årets svit till ett mål att jaga under hela läsåret. Inget nytt sparfält och ingen balansändring
(`yearBestStreak` och `lastYearBestStreak` finns redan).

## Vad som ska göras
- Lägg en rad i statistiken med `yearBestStreak`, och från andra läsåret även `lastYearBestStreak`.
- Texten ligger i `texts.ts`.

## Tester
- Enhet: texten utan och med förra läsårets värde.
- e2e: statistikfliken visar raden för en sparning i andra läsåret.
