Detta repo ligger på GitHub. Skills och arbetsflöden för Azure DevOps gäller inte här. Följ endast protokollet i denna fil.

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
5. Skriv `journal/<tid>-<id>.md` (den blir PR-beskrivningen). Lägg högst 1 förslag i `tasks/proposed/`.
   Flytta uppgiftsfilen till `tasks/done/` med `status: done` och ta bort låsfilen `tasks/claims/<id>.md`.
6. Rebasa på origin/main och kör alla grindar (`npm run gates`).
   Lös rebase-konflikter bara i egna filer. Annars: avbryt rebasen och gå till "Konflikt" nedan.
7. **Workern skapar inte PR:er själv.** Sista pushen (`git push --force-with-lease`) görs med en commit vars
   meddelande innehåller `[ready]`. Då skapar `auto-pr.yml` PR:en: titeln tas från uppgiftsfilen,
   beskrivningen från journalfilen och etiketten blir `automerge` (S/M) eller `needs-review` (L).
   Gröna `automerge`-PR:er squash-mergas automatiskt.

Gör högst en uppgift per körning.

### Detaljer till protokollet
- **`[ready]`** får bara stå i den sista commiten, när grindarna är gröna och journalen är skriven. Pushar
  utan `[ready]` skapar ingen PR. En ny push med `[ready]` uppdaterar en befintlig PR (idempotent).
- **Låset** är den fjärrgren som `claim.sh` pushar (`claude/task-<id>`). Låsfilen
  `tasks/claims/<id>.md` är bara en logg och får aldrig följa med i `[ready]`-pushen (`npm run tasks:check`
  fallerar annars). Grenen raderas automatiskt när PR:en mergas, och då släpper låset.
- **Konflikt** (rebase-konflikt i filer utanför `touches`): `git rebase --abort`, ta bort låsfilen, skriv
  journalen och pusha grenen med en commit som innehåller `[ready] [conflict]`. PR:en skapas då med etiketten
  `conflict` (ingen auto-merge) åt ägaren, och grenen fortsätter att spärra överlappande `touches` tills ägaren
  har löst konflikten. Avsluta sedan.
- **Alltid tillåtet utöver `touches`:**
  - nya testfiler (`tests/<id>-*.test.ts`, `e2e/<id>-*.spec.ts`);
  - befintliga testfiler, men bara för att anpassa dem till ändrat beteende;
  - `journal/` och `decisions/`;
  - den egna uppgiftsfilen (flytta den till `tasks/done/` med `status: done`);
  - högst en ny fil i `tasks/proposed/`.
- **Journalen = PR-beskrivningen:** uppgifts-id och rubrik, vad som ändrats, grindresultat och (vid
  balansändring) sim-siffror före och efter från `sim-report.json`.
- **Storlek L** får `needs-review` i stället för `automerge`. Ägaren mergar.
- **Grind fallerar 3 gånger på samma uppgift:** återställ ändringarna och låt uppgiftsfilen ligga kvar i
  `tasks/` med `status: blocked` och en sektion `## Blockerad` (grind, felutdata och hypotes). Skriv
  journalen och pusha med `[ready]`. `auto-pr.yml` sätter då etiketten `blocked` (ingen auto-merge). Detta
  ersätter BLOCKED.md. Refaktoreringsuppgifter (`kind: refactor`) räknar blockerade beroenden som klara, så
  kön stannar inte vid nästa spärr.
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
