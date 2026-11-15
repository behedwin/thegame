---
id: p-compact-node-dots
size: S
status: proposed
touches: [src/ui/network.ts, src/ui/style.css]
depends: [059]
---

# Små prickar i stället för dolda noder i den krympta kartan

I 059 döljs systemnoderna helt när kartan är krympt, så att inga tomma rutor syns. Linjerna och paketen
slutar då i tomma intet. Rita i stället en liten prick (t.ex. en `circle` med radie 3 i varje nod, dold i
stort läge) som visas i kompakt läge, så att remsan fortfarande läses som ett nätverk.

*Varför (VISION, "snygg, lugn och tydlig grafik"):* remsan syns hela tiden medan man köper, och linjer som
inte går till något ser ofärdiga ut.

## Tester
- e2e (390×844): i kompakt läge syns prickarna (synliga, ≤ 8 px stora) och inga rutor; i stort läge syns
  rutorna med text som förut och inga prickar.
