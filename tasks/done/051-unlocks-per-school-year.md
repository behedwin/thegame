---
id: 051
size: M
status: done
touches: [src/content/automations/, src/content/systems/, src/content/types.ts, src/content/balance.ts, src/content/texts.ts, src/core/, src/ui/shop.ts, src/ui/network.ts, src/ui/prestige.ts, sim/]
depends: []
priority: normal
---

# Nya läsår låser upp nya integrationstyper

Ägarens idé: efter en stund blir spelet repetitivt, och man har för lite att se fram emot.

*Varför (VISION, lång loop: "nya integrationstyper … som låses upp"; `docs/RESEARCH.md`: "Prestige ska ge
både kraft och en ny regel, så att varje runda inte bara är 'samma sak fast snabbare'"):* i dag innehåller
läsår 7 exakt samma 8 integrationer som läsår 1. En spelare i läsår 7 (15 h spelat) har köpt allt och har
inget nytt framför sig. VISION nämner flera integrationstyper som saknas: inloggningsfederation,
schemaexport, betygsöverföring och läromedelslicenser.

## Vad som ska göras
- **Mekanik:** ett valfritt fält `unlockYear?: number` på `AutomationDef` (läsår, där läsår 1 = 0
  prestiges). En automation med `unlockYear` syns inte i butiken eller på kartan förrän spelaren har nått
  det läsåret. Den rena regeln ligger i `src/core/` (t.ex. `isUnlocked(state, def)`). Befintliga
  automationer har inget fält och är alltid upplåsta.
- **Tre nya integrationstyper**, en fil var i `src/content/automations/`, med parodisystem som nya filer i
  `src/content/systems/` vid behov (aldrig originalnamn i repot):
  - läsår 3: inloggningsfederation
  - läsår 6: schemaexport
  - läsår 9: betygsöverföring
  Varje typ är dyrare och ger mer än den förra (fortsätt kurvan efter `ss12001api`), och har egna
  `milestoneNames` i spelets torra ton.
- **Synligt mål:** prestigefliken (`prestige.ts`) visar "Nästa läsår låser upp: …" när nästa läsår
  innehåller något nytt, och annars vilket läsår som är nästa upplåsning ("Läsår 9: …"). Det första
  läsåret efter en upplåsning firas med en toast eller det befintliga firandet ("Ny integrationstyp:
  …").
- Kartan visar de nya systemen när de låses upp (progressive disclosure).

## Gränser
- De tidiga grindarna påverkas inte, eftersom allt nytt kommer från läsår 3. Simmen når läsår 5–9 på 3 h:
  rundtiderna för r2–r5 ska ligga kvar i samma storleksordning (ange före och efter från
  `sim-report.json`) och inga NaN/Infinity får uppstå. Botten ska köpa de nya typerna när de lönar sig.
- Inget nytt sparfält behövs om upplåsningen räknas fram ur `prestiges`. Ägda antal sparas redan per id.
- Fler typer (läromedelslicenser m.fl.) läggs som förslag i `tasks/proposed/`.

## Tester
- Enhet (`tests/051-*.test.ts`): `isUnlocked` för läsår 1, 3, 6 och 9. Låsta automationer går inte att köpa
  (`buy` lämnar tillståndet oförändrat) och räknas inte i produktionen. Indata muteras inte.
- Content-validering: `unlockYear` är ett heltal ≥ 1 om det finns, och nya system och automationer har
  unika id.
- e2e (`e2e/051-*.spec.ts`): seeda en sparning i läsår 2 (prestiges 1), där inloggningsfederation inte
  syns och prestigefliken visar "Nästa läsår låser upp". Seeda läsår 3, där typen syns i butiken och
  går att köpa. Spara en skärmdump. Inga konsolfel.
