---
id: p-event-title-length
size: S
status: proposed
touches: [tests/]
depends: [122]
---

# Innehållstest: eventrubriker är korta nog för remsan

*Varför (VISION, "snygg, lugn och tydlig grafik"):* 122 visade att ett klickevent bara ryms i den krympta
kartan om rubriken får plats på en rad (effektraden tar själv två rader). e2e-testet fångar det, men först
i den långsamma grinden. En enkel innehållsregel ger snabbare besked när nya event läggs till som filer.

- Unit-test i content-valideringen: rubriken är högst ~28 tecken för `clickMult`-event och högst ~50 för
  övriga (gränserna kalibreras mot e2e 122 och dokumenteras i testet).
- Inga innehållsändringar väntas (alla nuvarande rubriker klarar gränserna efter 122).

**Tester:** själva unit-testet, plus ett negativt fall med en påhittad för lång rubrik.
