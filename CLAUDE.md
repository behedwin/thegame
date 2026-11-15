Detta repo ligger på GitHub. Skills och arbetsflöden för Azure DevOps gäller inte här. Följ endast protokollet i denna fil.

# CLAUDE.md – arbetsregler för Skolintegratören

Läs först: VISION.md, tasks/README.md, de senaste filerna i journal/ och decisions/.

## Worker-protokoll (varje autonom körning)

Du är en autonom worker. Följ CLAUDE.md strikt, inklusive HÅRDA STOPP.

1. `git fetch --prune`. Kör `scripts/stale-claims.sh --release` och frigör döda lås. Utan inloggad `gh` listas
   gamla grenar bara som "PR-status okänd" och raderas inte. Låt dem då vara.
   **Lossa fastnade PR:er** innan du väljer uppgift (se "Fastnade PR:er" nedan).
2. Välj den första uppgiften i tasks/ (`priority: high` före `normal`, sedan lägsta id) med status `ready`
   vars `depends` är klara och vars `touches` inte överlappar någon öppen `claude/task-*`-gren.
   `node scripts/next-task.mjs` gör urvalet, och första raden är valet.
   **Är kön tom** (`node scripts/next-task.mjs --queue` skriver ingenting): fyll på den enligt "Påfyllning
   av kön" nedan och avsluta sedan körningen.
3. Kör `scripts/claim.sh <id> <run-id>` (run-id t.ex. `$(date -u +%Y%m%dT%H%M%SZ)-<slump>`). Om det
   misslyckas, välj nästa uppgift. Max 3 försök, annars avsluta.
4. Implementera med tester först. Rör bara filer inom `touches`, utom tester och journal (se "Alltid
   tillåtet" nedan).
5. Skriv `journal/<tid>-<id>.md` (den blir PR-beskrivningen). Lägg högst 1 förslag i `tasks/proposed/`
   (gärna ett: förslagen är det som håller kön vid liv).
   Flytta uppgiftsfilen till `tasks/done/` med `status: done` och ta bort låsfilen `tasks/claims/<id>.md`.
6. Rebasa på origin/main och kör alla grindar (`npm run gates`).
   Lös rebase-konflikter bara i egna filer. Annars: avbryt rebasen och gå till "Konflikt" nedan.
7. **Workern skapar inte PR:er själv.** Sista pushen (`git push --force-with-lease`) görs med en commit vars
   meddelande innehåller `[ready]`. Då skapar `auto-pr.yml` PR:en: titeln tas från uppgiftsfilen,
   beskrivningen från journalfilen och etiketten blir `automerge` (S/M) eller `needs-review` (L).
   Gröna `automerge`-PR:er squash-mergas automatiskt.
8. **Verifiera din PR, och avsluta sedan.** Vänta tills PR:en finns (högst 10 min, kontrollera ungefär varje
   minut) och kontrollera att den har rätt etikett och att auto-merge är på för `automerge`. Ligger den efter
   main: lossa den enligt nedan. Är CI redan röd av din ändring: rätta, kör grindarna och pusha igen med
   `[ready]` (räknas mot regeln om 3 fel). **Vänta inte in CI eller mergen.** Ingen `Monitor`, inga
   bakgrundstimers och ingen väntan på att grenen raderas: `automerge.yml` och `unstick-prs.mjs` tar PR:en
   hela vägen till main, och städaren följer upp röd CI. Hela steg 8 tar högst 10 min. Skriv i
   slutrapporten om PR:en är mergad, väntar på CI eller behöver ägaren, och avsluta körningen.

Gör högst en uppgift per körning.

### Påfyllning av kön
Kön får inte stå tom bara för att ägaren inte har hunnit godkänna förslag. En worker som hittar en tom kö
(se steg 2) flyttar in förslag från `tasks/proposed/`:
1. Finns en fjärrgren `origin/claude/idea-*` (en påfyllning eller ett idéintag pågår): avsluta utan att
   göra något.
2. Skapa grenen `claude/idea-queue-refill` från origin/main.
3. Välj **upp till 3** förslag som:
   - är `size: S` eller `M` (för L-förslag, se steg 6);
   - inte rör något under HÅRDA STOPP (t.ex. `android/`, `capacitor.config.ts`, publicering, nätverk eller
     data) och inte kräver något som bara ägaren kan göra (t.ex. test på en riktig enhet);
   - har sina `depends` i `tasks/done/` och fortfarande stämmer med koden. Är ett förslag inaktuellt (redan
     gjort eller bygger på något som har tagits bort) raderas det i samma commit.
   Välj först det som ger spelaren mest enligt VISION.md, och hellre en blandning (innehåll, UI, balans) än
   tre av samma slag.
4. Gör om varje förslag till en uppgift precis som i idéintaget: nästa lediga id, refaktoreringsuppgift på
   multiplar av 5, `status: ready`, `priority: normal`, uppdaterade `touches`, beskrivning med motivering
   och tester. Skriv "Från förslaget `p-<slug>`" i texten. Ta bort förslagsfilen.
5. Kör `npm run tasks:check`, committa med `[ready]` i meddelandet och pusha (vanlig push; misslyckas den
   har någon annan hunnit före, och då avslutar du). PR:en rör bara `tasks/`, så den får `automerge`.
6. **Räcker förslagen inte till 3 uppgifter**, fyll på i den här ordningen i samma påfyllning:
   a. **Dela ett L-förslag** (högst ett per påfyllning): gör dess första fristående del till en S/M-uppgift
      som ger spelaren något synligt, och uppdatera förslaget med det som återstår. Ta stora speldesignval
      (t.ex. slutet i berättelsen) i små steg, och följ VISION.md ordagrant.
   b. **Skriv nya förslag** (högst 3 per påfyllning) i `tasks/proposed/` utifrån VISION.md (retentions-
      principerna, lång loop och slutmålet), `docs/RESEARCH.md` och vad som saknas i spelet nu. Spela gärna
      igenom simmen eller läs `sim-report.json` och leta efter tomma partier. Inget får krocka med
      icke-målen eller HÅRDA STOPP. Nya förslag som uppfyller kraven i steg 3 får flyttas in i samma
      påfyllning.
   c. Bara om inget alls gick att lägga in: skicka en notis till ägaren om att kön är tom och avsluta.

### Fastnade PR:er
`automerge.yml` kör `scripts/unstick-prs.mjs` efter varje push till main, var 15:e minut och vid behov. Skriptet
uppdaterar `automerge`-PR:er som ligger efter main, slår på auto-merge igen om den har slagits av och varnar för
PR:er med röd CI. Workers och städaren gör samma kontroll som extra skydd:
- Med inloggad `gh`: kör `node scripts/unstick-prs.mjs`.
- Utan `gh` (molnet): gå igenom öppna PR:er med GitHub-verktygen. En `automerge`-PR utan `conflict`/`blocked`
  som ligger efter main uppdateras: checka ut grenen, `git merge origin/main` och vanlig `git push` (aldrig
  force på någon annans gren). Går mergen inte rent: `git merge --abort` och lämna den åt städaren.
- Röd CI på någon annans PR rättas inte av en worker. Det sköter städaren och ägaren.

### Detaljer till protokollet
- **`[ready]`** får bara stå i den sista commiten, när grindarna är gröna och journalen är skriven. Pushar
  utan `[ready]` skapar ingen PR. En ny push med `[ready]` uppdaterar en befintlig PR (idempotent). Ligger grenen
  efter main uppdaterar `auto-pr.yml` den automatiskt.
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

## Idéintag (interaktiv session, inte workers)

När ägaren skriver **"Ny idé: <text>"** eller **"Ny idé (prio): <text>"**:

1. **Stäm av** idén mot VISION.md (målgrupp, ton, icke-mål) och HÅRDA STOPP. Krockar den: säg till vad som
   krockar och varför, och **skapa ingenting**.
2. **Annars:** skapa 1–3 uppgifter i `tasks/` med `status: ready`, `size`, `touches`, `depends` och `priority`.
   - `priority: high` om ägaren skrev "Ny idé (prio)", annars `priority: normal`.
   - **Ingen ny uppgift i kön får vara L**, bara S eller M. Det gäller även förslag som flyttas till kön.
     En L-PR får `needs-review` och väntar på ägaren, och under tiden spärrar dess `touches` alla
     överlappande uppgifter, ofta hela kön. Är idén större än M ska den delas upp i flera uppgifter. Ryms den
     inte i tre uppgifter läggs resten som förslag i `tasks/proposed/`, och det ska sägas i svaret.
   - Id: nästa lediga efter `git fetch` (högsta id i `tasks/` och `tasks/done/` på origin/main, plus 1). Landar
     ett id på en multipel av 5 läggs en refaktoreringsuppgift där (`kind: refactor`, `depends`: de fyra
     närmast föregående id:na), och numreringen fortsätter på nästa id. Den räknas inte in i 1–3.
   - `depends` får bara innehålla verkliga beroenden, inga spärrar, så att `high` faktiskt kan gå före.
     `touches` sätts hellre för brett än för smalt.
   - Beskriv vad som ska göras och varför (med en motivering mot VISION.md), och vilka tester som behövs.
   - Sätt `changelog:` med en kort spelarvänlig mening, eller `false` för interna uppgifter.
3. **Implementera ingenting själv.**
4. Skapa grenen `claude/idea-<slug>` från origin/main och kör `npm run tasks:check`. Committa med `[ready]`
   i meddelandet och pusha. `auto-pr.yml` skapar PR:en; öppna ingen PR själv. Den får `automerge` bara om
   diffen enbart rör `tasks/`, annars `needs-review`.
5. **Svara ägaren** med de nya id:na och deras plats i kön (`node scripts/next-task.mjs --queue` på grenen),
   t.ex. "021 (high): plats 1 av 21".

Kön väljs i ordningen `priority: high` före `normal`, och därefter lägsta id. `depends` och lås gäller alltid.

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
5. `npm run size-check`: `src/` ≤ 7 000 rader.
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
