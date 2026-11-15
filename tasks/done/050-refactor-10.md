---
id: 050
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [046, 047, 048, 049]
---

# Refaktorering och teststärkning #10

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (046–049) och förenkla. Ta bort dubbletter och
  döda exporter.
- Förbered gärna för 051–053 (innehåll som låses upp per läsår, mål och kapitel, val vid nytt läsår),
  men bara om det är ren refaktorering. Se till exempel att `prestige.ts` och prestigeflödet i `core` är
  lätta att bygga vidare på.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
