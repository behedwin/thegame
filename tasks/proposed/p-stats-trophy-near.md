---
id: p-stats-trophy-near
size: S
status: proposed
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [117]
---

# Statistik: närmaste låsta trofé

*Varför (VISION, retention; personliga mål):* 111 och 117 visar framsteg mot enskilda troféer (svit och
Expresskörning) i statistiken. En rad "Närmast på tur: <trofé>" för den låsta trofé som ligger närmast i
procent gör nästa delmål synligt oavsett trofétyp, utan straff och utan balansändring.

## Vad som ska göras
- En ren funktion i `src/ui/stats.ts` som för varje låst trofé med mätbart villkor räknar ut framsteg
  0–1 ur befintlig state (ingen ny sparad data) och väljer den högsta.
- Raden visas bara när någon trofé är låst och har framsteg > 0. Texten läggs i `T.stats`.

## Tester
- `tests/<id>-*.test.ts`: rätt trofé väljs, raden saknas när allt är upplåst och upplåsta troféer
  ignoreras.
