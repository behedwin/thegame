---
id: p-stats-last-year-kp
size: S
status: proposed
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [083]
---

# Statistiken visar förra läsårets KP

*Varför (VISION, lång loop):* 083 sparar förra läsårets KP (`lastYearEarned`), men spelaren ser det bara i
dialogen vid Nytt läsår. En rad "Förra läsåret: 3,0 Md KP" bredvid "Detta läsår" i statistiken ger ett
mål att slå under hela läsåret, inte bara i slutet. Ingen balansändring och inget nytt sparfält.

## Vad som ska göras
- Lägg en rad i statistiken efter "Detta läsår" som visar `lastYearEarned`, bara när `prestiges > 0`.
- Texten ligger i `texts.ts`.

## Tester
- Enhet: raden saknas första läsåret och visar rätt värde därefter.
- e2e: statistikfliken visar raden för en sparning med ett tidigare läsår.
