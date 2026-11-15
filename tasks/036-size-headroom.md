---
id: 036
size: S
status: ready
priority: normal
touches: [src/]
depends: [035]
---

# Skapa utrymme i storleksbudgeten

Från förslaget `p-size-headroom`.

`src/` ligger på 4 999 av 5 000 rader efter 035. Nästa uppgift med ny kod måste först hitta besparingar,
och det blir lätt hafsigt mitt i en feature. Gör en ren städning som frigör minst 100 rader utan att ändra
beteende, till exempel: slå ihop `buy`/`doBuy`-firandet med `celebrate.ts`, förenkla `deserialize` med
hjälpfunktioner för tal- och Decimal-fält, och se över `network.ts` och `texts.ts` efter dubbletter.

*Varför (VISION):* nytt innehåll ska kunna komma löpande utan att varje uppgift blir en kamp mot budgeten.
Gränsen höjs inte (det vore en svagare grind).

## Tester
- Befintliga tester ska passera oförändrade, och sim-siffrorna i `sim-report.json` ska vara identiska före
  och efter (ange dem i journalen).
- `npm run size-check` visar högst 4 899 rader.
