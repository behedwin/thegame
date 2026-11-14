# CLAUDE.md – arbetsregler för Skolintegratören

Läs först: VISION.md, tasks/README.md, de senaste filerna i journal/ och decisions/.

## Worker-protokoll (varje autonom körning)

Du är en autonom worker. Följ CLAUDE.md strikt, inklusive HÅRDA STOPP.

1. `git fetch --prune`. Kör `scripts/stale-claims.sh --release` och frigör döda lås. Utan inloggad `gh` listas
   gamla grenar bara som "PR-status okänd" och raderas inte. Låt dem då vara.
2. Välj den första uppgiften i tasks/ med status `ready` vars `depends` är klara och vars `touches` inte
   överlappar någon öppen `claude/task-*`-gren. `node scripts/next-task.mjs` gör urvalet, och första raden är
   valet.
3. Kör `scripts/claim.sh <id> <run-id>` (run-id t.ex. `$(date -u +%Y%m%dT%H%M%SZ)-<slump>`). Om det
   misslyckas, välj nästa uppgift. Max 3 försök, annars avsluta.
4. Implementera med tester först. Rör bara filer inom `touches`, utom tester och journal (se "Alltid
   tillåtet" nedan).
5. Rebasa på origin/main, kör alla grindar (`npm run gates`) och pusha med `--force-with-lease`.
6. Skapa en PR. Lägg etiketten `automerge` om size är S eller M.
   Lös rebase-konflikter bara i egna filer. Annars: sätt etiketten `conflict`, ta bort låset och avsluta.
7. Skriv `journal/<tid>-<id>.md`. Lägg högst 1 förslag i `tasks/proposed/`.

Gör högst en uppgift per körning.

### Detaljer till protokollet
- **Låset** är den fjärrgren som `claim.sh` pushar (`claude/task-<id>`). Låsfilen
  `tasks/claims/<id>.md` är bara en logg. Ta bort den i samma commit-serie som implementationen, så att PR:en
  aldrig innehåller den (`npm run tasks:check` fallerar annars). Grenen tas bort automatiskt när PR:en
  mergas, och då släpper låset.
- **"Ta bort låset" vid konflikt** betyder att ta bort låsfilen från grenen och lämna PR:en öppen med
  etiketten `conflict` åt ägaren. Grenen finns kvar och fortsätter att spärra överlappande `touches` tills
  ägaren har löst konflikten. Det är avsiktligt.
- **Alltid tillåtet utöver `touches`:**
  - nya testfiler (`tests/<id>-*.test.ts`, `e2e/<id>-*.spec.ts`);
  - befintliga testfiler, men bara för att anpassa dem till ändrat beteende;
  - `journal/` och `decisions/`;
  - den egna uppgiftsfilen (flytta den till `tasks/done/` med `status: done` i PR:en);
  - högst en ny fil i `tasks/proposed/`.
- **PR-beskrivning:** uppgifts-id och rubrik, vad som ändrats, grindresultat och (vid balansändring) sim-siffror
  före och efter från `sim-report.json`.
- **Storlek L** får aldrig `automerge`. Ägaren mergar.
- **Grind fallerar 3 gånger på samma uppgift:** återställ ändringarna och sätt `status: blocked` med en sektion
  `## Blockerad` (grind, felutdata och hypotes) i uppgiftsfilen. Skapa en PR med bara den ändringen och
  journalen, med etiketten `blocked` (utan `automerge`). Detta ersätter BLOCKED.md.
- **HÅRT STOPP** under arbetet: gör samma sak som ovan, men skriv "HÅRT STOPP: <vad>" som orsak och stoppa.

## Regler
- Arbeta självständigt. Fatta egna beslut och dokumentera dem i `decisions/` i stället för att fråga.
  Undantagen är HÅRDA STOPP.
- **En uppgift per commit-serie och PR.** Skriv tester först.
- Förslag som är `[S]` får du godkänna själv: flytta det till kön med nästa lediga id i en egen PR.
- **Balansändringar** motiveras med siffror från `sim-report.json` (före och efter) i PR:en och journalen.
  Filen committas inte (den skulle ge konflikter mellan parallella PR:er), och CI laddar upp den som artefakt.
- **Var femte uppgift** i kön (005, 010, 015 …) är en refaktoreringsuppgift: bara refaktorering och
  teststärkning, inga nya features. Den ersätter regeln "var femte session" och spärrar kön via `depends`.
- Lägg inte till dependencies utan ett beslut i `decisions/` (namn, version, varför, alternativ).
- Undvik heta filer. Nytt innehåll läggs som **nya filer** (en per uppgradering, automation, event, merit,
  system och kund) i `src/content/<typ>/`. Registret (`src/content/registry.ts`) hittar dem med
  `import.meta.glob`. Ingen central lista får redigeras manuellt.

## Språk
- All speltext på svenska. Den ligger i `src/content/`: innehållsfiler och UI-texter i `texts.ts`.
- Kod, kommentarer och commit-meddelanden på engelska. Dokumenten (VISION, tasks, journal, decisions) är på
  svenska.

## Arkitektur (bryt inte mot detta)
- `src/core/`: ren, deterministisk logik. Ingen DOM, ingen `Date`, ingen `Math.random`. Tid och slump
  injiceras (`tick(state, dtMs)`, `applyOffline(state, nowMs)`, `rollEvent(state, rng)`). Funktionerna
  muterar aldrig sitt indata.
- `src/content/`: all speldata, en definition per fil. Filnamnet = `id`. Typer finns i `types.ts`, och
  sorteringen styrs av `order` där sådant finns.
- `src/ui/`: tunt renderingslager. Här, och bara här, används väggklocka och `Math.random`.
- `src/save/`: versionerat sparformat. Vid ändrad form: höj `SAVE_VERSION`, lägg till en migrering i
  `MIGRATIONS` och skriv tester. Ändra aldrig en släppt migrering.
- Valutor är **alltid** `Decimal` (break_infinity.js), aldrig `number`.
- Tester ligger i `tests/` (unit, inklusive content-validering), `e2e/` (Playwright) och `sim/`
  (pacing-bot, körs via Vite så att `import.meta.glob` fungerar).

## Kvalitetsgrindar (alla gröna före varje push)
1. `npm run typecheck`
2. `npm test`
3. `npm run sim`: 200 seeds × 3 h. Ingen krasch och inga NaN/Infinity. Första köpet ≤ 15 s, första
   automationen ≤ 90 s, aldrig > 3 min utan något köpbart under första timmen och första prestige efter
   30–90 min. Skriver `sim-report.json`.
4. `npm run e2e`: laddar, klickar, köper, laddar om, verifierar sparning, inga konsolfel och ingen extern
   trafik, och sparar skärmdumpar i `e2e-output/`.
5. `npm run size-check`: `src/` ≤ 5 000 rader.
6. `npm run tasks:check`: tasks/ är giltig och inga låsfiler finns.

`npm run gates` kör allt i rätt ordning.

**Windows-not:** kör kommandona från `C:\GAME\TheGame` med **versalt** `C:`. Annars laddar Vitest två
modulinstanser ("failed to find the current suite"). Använd PowerShell eller `cd /C/GAME/TheGame` i bash.

## HÅRDA STOPP (fråga ägaren, eller blockera uppgiften enligt ovan om ingen svarar)
- Allt som rör signeringsnyckel, Play Console eller publicering.
- Nätverksanrop, annonser, köp, analytics eller insamling av data.
- Ändringar av VISION.md eller målgrupp.
- Ändringar av kvalitetsgrindarna som gör dem svagare.
- Riktiga varumärken, logotyper eller namn på verkliga personer. (Nya parodinamn läggs som filer i
  `src/content/systems/`. Skriv aldrig ut originalnamnet i repot.)
