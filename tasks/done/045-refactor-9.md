---
id: 045
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [041, 042, 043, 044]
---

# Refaktorering och teststärkning #9

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (041–044) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över effekttexterna (043): event och ärenden ska använda samma
  förhandsvisning och formatering, inte två varianter.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Håll `src/` under storleksbudgeten med marginal för nästa feature.
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
