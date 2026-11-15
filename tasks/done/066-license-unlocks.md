---
id: 066
size: S
status: done
touches: [src/content/automations/, src/content/systems/, src/content/balance.ts, sim/]
depends: []
priority: normal
changelog: "Läromedelslicenser: en ny integrationstyp att låsa upp för den som har spelat många läsår."
---

# Fler integrationstyper efter läsår 9: läromedelslicenser

Från förslaget `p-license-unlocks`.

Mekaniken `unlockYear` finns sedan 051, och läsår 3, 6 och 9 låser upp inloggningsfederation, schemaexport och
betygsöverföring. Efter läsår 9 finns inget nytt kvar att se fram emot.

*Varför (VISION, lång loop: "nya integrationstyper … som låses upp", och VISION nämner läromedelslicenser
uttryckligen):* spelare som når läsår 10+ ska ha ett nytt mål. Prestigefliken visar redan "Läsår N: …" automatiskt.

## Vad som ska göras
- En ny fil `src/content/automations/licenses.ts` (Läromedelslicenser, `unlockYear: 12`, `order` efter
  `gradetransfer`), med nya parodisystem som egna filer i `src/content/systems/` vid behov (bara påhittade
  namn). Fortsätt kostnadskurvan efter `gradetransfer` (dyrare, ger mer, lägre effektivitet; testet i
  `tests/003-integrations.test.ts` kontrollerar det).
- Egna `milestoneNames` (fyra stycken) i spelets torra ton.

## Tester
- Enhet (`tests/066-*.test.ts`): `isUnlocked` för läsår 11 och 12; `nextUnlock` i läsår 9 pekar på läsår 12.
- Simmen: inga NaN/Infinity, rundtiderna oförändrade (botten når sällan läsår 12 på 3 h). Ange sim-siffror före
  och efter i journalen.
