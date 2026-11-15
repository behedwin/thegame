---
id: 060
size: M
status: ready
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [056, 057, 058, 059]
---

# Refaktorering och teststärkning #12

Var femte uppgift i kön är en refaktoreringsuppgift.

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (056–059) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över hjälteytans två lägen (057, 059): lägesbytet, effekterna och CSS:en för
  `.hero.compact` ska vara samlade och lätta att följa. Det ska inte finnas utspridda specialfall i
  `app.ts`, `fx.ts` och `style.css`.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Sim-siffrorna ska vara oförändrade (ange före och efter i journalen).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
