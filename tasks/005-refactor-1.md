---
id: 005
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [001, 002, 003, 004]
---

# Refaktorering och teststärkning #1

Var femte uppgift i kön är en refaktoreringsuppgift (ersätter regeln "var femte session").

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (`git log`) och förenkla. Ta bort dubbletter och
  döda exporter.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Håll `src/` långt under storleksbudgeten.
- Sim-siffrorna ska vara oförändrade (ange före och efter i PR:en).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
