---
id: 054
size: M
status: ready
touches: [vite.config.ts, src/vite-env.d.ts, src/ui/settings.ts, src/ui/changelog.ts, src/ui/style.css, src/content/texts.ts, scripts/check-tasks.mjs, scripts/tasks-lib.mjs, tasks/README.md, tasks/done/, CLAUDE.md]
depends: []
priority: normal
---

# Version och "Nyheter i spelet" i inställningarna

Ägarens idé: man ska kunna se vilken version av appen man kör och en logg över vad som har lagts till
i spelet, en slags uppdateringsinformation.

*Varför (VISION, "tydligt" och "respekt för spelarens tid"):* spelet uppdateras flera gånger om dagen av
workers, men spelaren ser inte att något har hänt eller vad som är nytt. En synlig version gör det
också lätt för ägaren att se om webbversionen eller APK:n är den senaste. Allt byggs in i appen vid
build. Ingen nätverkstrafik.

## Vad som ska göras
- **Generera vid build, inte för hand:** ett litet Vite-plugin i `vite.config.ts` exponerar en virtuell
  modul (t.ex. `virtual:changelog`, med typer i `src/vite-env.d.ts`) som läser `tasks/done/*.md` vid build:
  - **Version:** `1.<högsta klara id>`, t.ex. `1.54`, plus kort commit-sha om den finns (`GITHUB_SHA` i CI,
    annars `git rev-parse --short HEAD`, och utelämnas om ingetdera finns). Den räknas fram automatiskt,
    så ingen behöver höja något för hand och ingen het fil uppstår.
  - **Logg:** en post per klar uppgift med id, rubrik (första `#`-raden) och datum. Datumet tas från
    tidsstämpeln i journalfilens namn (`journal/<tid>-<id>.md`) och utelämnas om journalen saknas.
    Bara id, rubrik och datum byggs in, inte hela uppgiftstexten (bundlen ska förbli liten).
  - Uppgifter med `kind: refactor` tas inte med. Ett nytt valfritt frontmatter-fält `changelog` styr
    resten: `changelog: false` döljer en intern uppgift, och `changelog: "<text>"` ersätter rubriken med en
    spelarvänlig mening. Sätt `changelog: false` på de klart interna uppgifterna i `tasks/done/` (t.ex. 000,
    036 och 046). Det är den enda ändringen i gamla uppgiftsfiler som tillåts.
- **Validering:** `scripts/check-tasks.mjs` godtar `changelog` (false eller en icke-tom sträng).
  Dokumentera fältet i `tasks/README.md`, och lägg en rad i idéintaget i CLAUDE.md: "Sätt `changelog:`
  med en kort spelarvänlig mening, eller `false` för interna uppgifter."
- **I spelet:** Inställningar får en rad längst ner med versionen ("Version 1.54") och knappen
  **"Nyheter i spelet"**. Den öppnar en dialog (`src/ui/changelog.ts`) med loggen, nyast först och
  grupperad per dag, i luftig stil. Texterna ("Nyheter i spelet", "Version", "Stäng") ligger i `texts.ts`.

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.
- Bygget får inte krascha om `tasks/done/` eller `journal/` saknar en fil. Då hoppas posten över.
- Ingen ny dependency. Frontmattern parsas med några rader egen kod eller med befintlig kod i
  `scripts/tasks-lib.mjs`.

## Tester
- Enhet (`tests/054-*.test.ts`): plugin-logiken (exportera den som ren funktion från en modul som går att
  testa) ger rätt version av en uppsättning testfiler, hoppar över refactor och `changelog: false`,
  använder `changelog`-texten när den finns, tar datumet från journalnamnet och sorterar nyast först.
  `tasks:check` avvisar `changelog: ""` och `changelog: 3`.
- e2e (`e2e/054-*.spec.ts`): öppna Inställningar och verifiera att versionsraden matchar `Version 1.\d+`.
  Öppna "Nyheter i spelet" och verifiera att minst en post med rubrik syns och att ingen
  refaktoreringsuppgift syns. Inga konsolfel och ingen extern trafik.
