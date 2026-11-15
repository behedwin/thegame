# 062 – Egen layout för kartan i den krympta remsan

## Beslut
- I kompakt läge byter `NetworkView` till en egen geometri: `viewBox` får höjden 100 och en bredd som
  följer remsans bredd/höjd-förhållande (minst 300). Kartan fyller då hela ytan till höger om SYNKA utan
  att noder eller text förvrängs. Läget och storleken läses av en `ResizeObserver` på kartans SVG
  (hjälteytans klass `compact` växlar storleken, så observern slår till av sig själv). `hero.ts` och
  `app.ts` behövde därför inte ändras.
- Varje rad har både den stora noden och en liten fylld "chip" med systemets förkortning
  (`systemAbbr`: initialerna i de två första orden, annars de två första bokstäverna). CSS tonar mellan
  dem. Chipsen har klasserna `net-chip chip-src/chip-dst`, inte `net-src/net-dst`, så att befintliga
  selektorer (028:s nodtips) fortsätter att träffa de stora noderna.
- Remsan visar högst 3 rader: de med flest ägda integrationer. Övriga räknas i en diskret "+N" under navet.
- Chiptextens storlek sätts som SVG-attribut (12 enheter, cirka 11,5 px i remsan) i stället för i CSS, så
  att 019:s test om rem-baserade textstorlekar fortfarande gäller.

## Alternativ
- `preserveAspectRatio="none"` för linjerna: förvränger paketen och kräver ett separat lager för noderna.
- Fast kompakt `viewBox`: lämnar tomma kanter på bredare skärmar.
