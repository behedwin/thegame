# Fastnade PR:er lossas automatiskt (scripts/unstick-prs.mjs)

## Problem
PR #21 (023) fastnade som `BEHIND` efter att #20 (008) mergats. Jobbet `update-behind` i `automerge.yml`
körde direkt efter mergen och filtrerade på `mergeStateStatus == "BEHIND"`. Precis efter en merge har GitHub
ännu inte räknat om de andra PR:erna (status `UNKNOWN`), så #21 hoppades över. Med `strict: true` på main kan
en PR som ligger efter inte mergas, och ingen ny händelse uppdaterade den.

## Beslut
- Logiken flyttas till `scripts/unstick-prs.mjs`. Beslutsdelen ligger i `scripts/pr-lib.mjs` och testas i
  `tests/pr-lib.test.ts`. För varje öppen `automerge`-PR utan `conflict`/`blocked` gäller:
  - "efter main" avgörs med compare-API:t (`behind_by`), inte med `mergeStateStatus`, och PR:en uppdateras
    (går det inte sätts `conflict`);
  - är auto-merge av slås den på igen;
  - är CI röd ges en varning.
- Jobbet `unstick` i `automerge.yml` körs efter varje push till main, **var 15:e minut** (skyddsnät om
  något event missas) och manuellt (`workflow_dispatch`). Repot är publikt, så Actions-minuterna kostar inget.
- Worker-protokollet (CLAUDE.md) har två nya steg: lossa fastnade PR:er före uppgiftsvalet, och verifiera den
  egna PR:en efter `[ready]`-pushen (steg 8).

## Alternativ
- Vänta och försöka igen tills statusen inte är `UNKNOWN`. Det är fortfarande en gissning om timing.
- Stänga av `strict`. Det gör grindarna svagare (HÅRT STOPP), så det är uteslutet.
- Bara låta workers lossa PR:er. Då beror det på att en LLM-körning råkar gå vid rätt tidpunkt. Ett
  deterministiskt schemalagt jobb är säkrare, och workers fungerar som extra skydd.
