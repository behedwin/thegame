---
id: 030
size: M
status: done
kind: refactor
touches: [src/, sim/, tests/, e2e/]
depends: [026, 027, 028, 029]
---

# Refaktorering och teststärkning #6

Var femte uppgift i kön är en refaktoreringsuppgift (ersätter regeln "var femte session").

**Endast** refaktorering och teststärkning, inga nya features och ingen balansändring.
- Läs igenom koden som ändrats sedan förra refaktoreringen (`git log`) och förenkla. Ta bort dubbletter och
  döda exporter. Se särskilt över `src/ui/` efter firandet (026), den levande kartan (027), nodtipsen (028)
  och hjälpsidan (029). Bland annat ska `app.ts` inte ha vuxit med logik som hör hemma i egna moduler.
- Stärk tester där täckningen är tunn (core, save och content-validering).
- Håll `src/` långt under storleksbudgeten.
- Sim-siffrorna ska vara oförändrade (ange före och efter i PR:en).

Rör hela `src/`, så ingen annan uppgift kan köras parallellt med denna (avsiktligt).
