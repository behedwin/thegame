---
id: 040
size: M
status: ready
priority: normal
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [036, 037, 038, 039]
---

# Refaktorering och teststärkning #8

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (035) med `git log` och förenkla. Ta bort
  dubbletter och döda exporter. Se särskilt över balansändringen (037), sparningsfältets stil (038) och de nya
  livstidsrekorden (039).
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Håll `src/` långt under storleksbudgeten.
- Sim-siffrorna ska vara oförändrade (ange före och efter i PR:en).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
