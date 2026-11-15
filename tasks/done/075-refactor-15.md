---
id: 075
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [071, 072, 073, 074]
priority: normal
changelog: false
---

# Refaktorering och teststärkning #15

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (071–074) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över eventsvitens rekord och troféer (071, 074), inriktningsvalet (072) och
  hopfällningen av maxade uppgraderingar (073): logiken ska ligga i `src/core/` och UI-lagret bara visa den.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
