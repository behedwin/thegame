---
id: 106
size: S
status: ready
priority: normal
changelog: "Statistiken visar hur mycket KP du tjänade förra läsåret."
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [083]
---

# Statistiken visar förra läsårets KP

Från förslaget `p-stats-last-year-kp`.

*Varför (VISION, lång loop):* 083 sparar förra läsårets KP (`lastYearEarned`), men spelaren ser det bara i
dialogen vid Nytt läsår. En rad "Förra läsåret: 3,0 Md KP" direkt efter "Detta läsår" i statistiken ger ett
mål att slå under hela läsåret, inte bara i slutet. Ingen balansändring och inget nytt sparfält.

## Vad som ska göras
- Lägg en rad i `statRows` (`src/ui/stats.ts`) direkt efter `S.thisYear` som visar `state.lastYearEarned`
  med samma `kp()`-hjälpare, bara när `state.prestiges > 0`.
- Etiketten läggs i `T.stats` i `texts.ts`.

## Tester
- Enhet (`tests/106-*.test.ts`): raden saknas första läsåret, och efter ett läsår ligger den direkt efter
  "Detta läsår" med rätt värde.
- e2e: statistikdialogen visar raden för en sparning med ett tidigare läsår. Inga konsolfel.
