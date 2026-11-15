---
id: 055
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [051, 052, 053, 054]
---

# Refaktorering och teststärkning #11

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (051–054) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över prestigeflödet efter 051–053 (upplåsningar, mål och kapitel,
  inriktning): det ska vara en tydlig väg genom `core` och `prestige.ts`, inte tre parallella.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
