---
id: p-merit-next-doubling
size: S
status: proposed
touches: [src/ui/prestige.ts, src/core/rules.ts, src/content/texts.ts]
depends: [119]
---

# Läsår-fliken visar nästa fördubbling av meriterna

*Varför (VISION, tydliga nära mål):* 119 säger till när väntande meriter har fördubblats. På fliken Läsår syns
inte hur långt det är kvar till nästa steg. En lugn rad ("Dubbelt så många meriter vid X KP i år") gör
väntan till ett frivilligt, synligt delmål utan brådska.

## Vad som ska göras
- Ren funktion i `src/core/rules.ts`: den KP i år (`runEarned`) som ger dubbelt så många meriter som nu
  (inversen av `pendingMerits`, med hänsyn till fokusmultiplikatorn).
- En rad på fliken Läsår under meriterna, bara när ett nytt läsår kan startas. Text i `texts.ts`.

## Tester
- `tests/<id>-*.test.ts`: funktionen ger ett värde där `pendingMerits` är minst det dubbla, och strax under
  ger mindre; raden saknas när läsåret inte kan bytas.
