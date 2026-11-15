---
id: 035
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [031, 032, 033, 034]
---

# Refaktorering och teststärkning #7: dela upp app.ts

Var femte uppgift i kön är en refaktoreringsuppgift. Den här tar också med förslaget `p-split-app-shell`.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- `src/ui/app.ts` är över 500 rader och den hetaste filen i `src/ui/`. Nästan varje UI-uppgift rör den, så
  parallella workers krockar där. Bryt ut till exempel välkomstdialogen och offline-flödet, renderingen av
  toppraden och buffarna och prestigefliken till egna moduler (som `customers.ts`, `shop.ts` och
  `settings.ts`). `app.ts` ska bara bli kvar som skal och koppla ihop modulerna.
- Läs igenom koden som ändrats sedan förra refaktoreringen (032–034) och förenkla. Ta bort dubbletter och
  döda exporter.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Befintliga e2e-tester ska passera oförändrade. Sim-siffrorna ska vara oförändrade (ange före och efter i
  journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
