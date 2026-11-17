---
id: 122
size: S
status: ready
touches: [src/content/events/]
depends: [061]
priority: normal
changelog: false
---

# Alla eventkort ryms i den krympta kartan

Från förslaget `p-event-titles-fit`.

*Varför (VISION, "snygg, lugn och tydlig grafik"):* i 061 kontrollerades placeringen med ett enda event
(`friday-update`). Nya event läggs hela tiden till som filer, och en lång rubrik får inte bryta den krympta
remsan i tysthet.

## Vad som ska göras
- Lägg till ett e2e-test som går igenom alla event i `src/content/events/` i kompakt läge vid 360 px bredd
  (samma uppsättning som `e2e/061-compact-event.spec.ts`, med `activeEvent` satt till varje event i tur och
  ordning).
- Testet kontrollerar att kortet ryms i remsan (96 px) utan att täcka flikarna, och att rubriken är högst
  två rader.
- Rubriker som blir för långa (tre rader eller fler) kortas av i innehållsfilen, med samma ton och mening.

## Tester
- `e2e/122-*.spec.ts` enligt ovan, inga konsolfel.
- Befintliga innehållstester för events fortsätter att vara gröna.
