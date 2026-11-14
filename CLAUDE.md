# CLAUDE.md – arbetsregler för Skolintegratören

Läs först: VISION.md, BACKLOG.md, senaste posten i JOURNAL.md och DECISIONS.md.

## Arbetssätt
- Arbeta självständigt. Fatta egna beslut och dokumentera dem i DECISIONS.md i stället för att fråga.
  Undantagen är HÅRDA STOPP (nedan).
- **En backlog-item per commit.** Skriv tester först.
- Ta alltid **översta** item under `## Godkänt`. Items märkta `[S]` under `## Förslag` får du godkänna själv
  (flytta dem till Godkänt och notera det i JOURNAL.md).
- Lägg **högst 3 nya förslag per session** under `## Förslag`, var och en med en motivering mot VISION.md.
- När en item är klar flyttar du den till `## Klart` med datum och commit-ämne.
- **Balansändringar** motiveras med siffror från `sim-report.json`, före och efter, i commit-meddelandet och i
  JOURNAL.md.
- **Var femte session** (5, 10, 15 …) gör du bara refaktorering och teststärkning, inga nya features. Räkna
  sessioner i JOURNAL.md.
- Om en grind misslyckas **3 gånger på samma item**: skriv BLOCKED.md (item, grind, felutdata, hypotes),
  återställ ändringarna (`git checkout -- .` på item-ändringarna) och gå vidare till nästa item.
- Lägg inte till dependencies utan att föra in dem i DECISIONS.md (namn, version, varför, alternativ).
- Avsluta varje session med en post i JOURNAL.md: datum, vad som gjordes, problem, pacing-förändringar
  (siffror) och nästa steg.

## Språk
- All speltext på svenska. Den ligger i `src/content/` (texter i `texts.ts`, data i övriga filer).
- Kod, kommentarer och commit-meddelanden på engelska. Dokumenten (VISION, BACKLOG, JOURNAL, DECISIONS) är på
  svenska.

## Arkitektur (bryt inte mot detta)
- `src/core/`: ren, deterministisk logik. Ingen DOM, ingen `Date`, ingen `Math.random`. Tid och slump
  injiceras (`tick(state, dtMs)`, `applyOffline(state, nowMs)`, `rollEvent(state, rng)`). Funktionerna
  muterar aldrig sitt indata.
- `src/content/`: all speldata som data (uppgraderingar, automationer, event, namn, texter, balans).
- `src/ui/`: tunt renderingslager. Här, och bara här, används väggklocka och `Math.random`.
- `src/save/`: versionerat sparformat. Vid ändrad form: höj `SAVE_VERSION`, lägg till en migrering i
  `MIGRATIONS` och skriv tester. Ändra aldrig en släppt migrering.
- Valutor är **alltid** `Decimal` (break_infinity.js), aldrig `number`.
- Tester ligger i `tests/` (unit), `e2e/` (Playwright) och `sim/` (pacing-bot).

## Kvalitetsgrindar (alla gröna före varje commit)
1. `npm run typecheck`
2. `npm test`
3. `npm run sim`: 200 seeds × 3 h. Ingen krasch och inga NaN/Infinity. Första köpet ≤ 15 s, första
   automationen ≤ 90 s, aldrig > 3 min utan något köpbart under första timmen och första prestige efter
   30–90 min. Skriver `sim-report.json` (committas).
4. `npm run e2e`: laddar, klickar, köper, laddar om, verifierar sparning, inga konsolfel och ingen extern
   trafik, och sparar skärmdumpar i `e2e-output/`.
5. `npm run size-check`: `src/` ≤ 5 000 rader.

`npm run gates` kör allt i rätt ordning.

**Windows-not:** kör kommandona från `C:\GAME\TheGame` med **versalt** `C:`. Annars laddar Vitest två
modulinstanser ("failed to find the current suite"). Använd PowerShell eller `cd /C/GAME/TheGame` i bash.

## HÅRDA STOPP (fråga ägaren, eller skriv BLOCKED.md om ingen svarar)
- Allt som rör signeringsnyckel, Play Console eller publicering.
- Nätverksanrop, annonser, köp, analytics eller insamling av data.
- Ändringar av VISION.md eller målgrupp.
- Ändringar av kvalitetsgrindarna som gör dem svagare.
- Riktiga varumärken, logotyper eller namn på verkliga personer. (Nya parodinamn läggs i
  `src/content/names.ts`. Skriv aldrig ut originalnamnet i repot.)
