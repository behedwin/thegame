---
id: p-license-unlocks
size: S
status: proposed
touches: [src/content/automations/, src/content/systems/, src/content/balance.ts, sim/]
depends: [051]
---

# Fler integrationstyper efter läsår 9: läromedelslicenser

Från 051: mekaniken `unlockYear` finns nu, och läsår 3, 6 och 9 låser upp inloggningsfederation, schemaexport
och betygsöverföring. Efter läsår 9 finns inget nytt kvar att se fram emot.

*Varför (VISION, lång loop: "nya integrationstyper … som låses upp", och VISION nämner läromedelslicenser):*
spelare som når läsår 10+ ska ha ett nytt mål. Prestigefliken visar redan "Läsår N: …" automatiskt.

## Vad som ska göras
- En ny fil `src/content/automations/licenses.ts` (läromedelslicenser, `unlockYear: 12`), med parodisystem som
  nya filer vid behov. Fortsätt kostnadskurvan efter `gradetransfer` (dyrare, ger mer, lägre effektivitet;
  testet i `tests/003-integrations.test.ts` kontrollerar det).
- Egna `milestoneNames` i spelets torra ton.

## Tester
- Enhet: `isUnlocked` för läsår 11 och 12; `nextUnlock` i läsår 9 pekar på läsår 12.
- Simmen: inga NaN/Infinity, rundtiderna oförändrade (botten når sällan läsår 12 på 3 h).
