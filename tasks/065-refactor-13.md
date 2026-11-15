---
id: 065
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [061, 062, 063, 064]
priority: normal
---

# Refaktorering och teststärkning #13

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (061–064) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över den krympta kartan efter 061 och 062 (eventkortets placering och
  systemchipsen): specialfallen för `.hero.compact` ska vara samlade i `HeroSize`/`style.css` och lätta att
  följa.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
