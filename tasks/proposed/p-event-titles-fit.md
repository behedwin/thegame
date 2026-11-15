---
id: p-event-titles-fit
size: S
status: proposed
touches: [src/content/events/]
depends: [061]
---

# Alla eventkort ryms i den krympta kartan

I 061 kontrollerades placeringen med ett enda event. Lägg till ett e2e-test som går igenom alla event i
`src/content/events/` i kompakt läge vid 360 px bredd. Testet ska kontrollera att kortet ryms i remsan
(96 px) utan att täcka flikarna. Rubriker som blir för långa (tre rader eller fler) kortas av i
innehållsfilen.

*Varför (VISION, "snygg, lugn och tydlig grafik"):* nya event läggs hela tiden till som filer, och en lång
rubrik får inte bryta remsan i tysthet.
