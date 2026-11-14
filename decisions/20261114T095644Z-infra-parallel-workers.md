# Beslut: infrastruktur för parallella workers (2026-11-14)

Gäller PR:en "Prepare repo for parallel autonomous workers". Numreringen fortsätter från D19.

**D20 – Kö i tasks/ med filbaserade lås via fjärrgrenar**
Låset är fjärrgrenen `claude/task-<id>`. `claim.sh` pushar den utan force, så att den andra workern i ett race
får en avvisad push och exitkod 1 (testat mot ett lokalt bare-repo). Låsfilen `tasks/claims/<id>.md` är bara
en logg och får aldrig nå en PR (`tasks:check` fallerar). Automatisk radering av head-grenar vid merge
släpper låset.

**D21 – Valbarhet räknas i ett skript** (`scripts/next-task.mjs` + `scripts/tasks-lib.mjs`)
Workers ska inte tolka överlapp själva. `touches` är filer eller kataloger. Två uppgifter överlappar om en
sökväg är lika med eller ligger inuti den andra. Ett låst id som inte finns på main räknas som "rör allt".

**D22 – "Var femte session" blir var femte uppgift**
Med parallella körningar finns inga sessioner att räkna. Refaktoreringsuppgifter ligger på 005, 010, 015 och
020 med `depends` som spärrar: de väntar in de fyra före och de fyra efter väntar in dem. `touches: [src/, …]`
gör att inget annat kan köras samtidigt. Nackdel: en blockerad uppgift stoppar kön vid nästa spärr. Ägaren kan
då ändra `depends`.

**D23 – BLOCKED.md ersätts av `status: blocked`**
En gemensam BLOCKED.md skulle ge merge-konflikter. Blockeringen skrivs i uppgiftsfilen (sektion
`## Blockerad`) och går via en PR med etiketten `blocked`.

**D24 – decisions/ ersätter DECISIONS.md (utöver beställningen)**
Två PR:er som båda lägger till sist i samma fil får alltid en merge-konflikt. Därför används en fil per
körning. Samma skäl som för journal/. D1–D19 är flyttade oförändrade.

**D25 – sim-report.json committas inte längre**
Varje PR som ändrar balansen skulle annars krocka i den filen. Grinden är oförändrad: filen skrivs fortfarande
och laddas upp som CI-artefakt, och siffror före och efter krävs i PR:en och journalen. Det är ingen
försvagning av grinden.

**D26 – Allt innehåll en fil per definition, även systems/, customers/ och merits/**
Beställningen gällde uppgraderingar, automationer och event. Systemnamn och kunder läggs till av flera
uppgifter (t.ex. 003 och 004), och "ingen central lista får redigeras manuellt" gäller lika mycket där.
`names.ts` är borttagen och parodinamn läggs nu i `src/content/systems/<id>.ts`. Filnamnet måste vara lika
med `id` (registret kastar annars). Ordningen styrs av fältet `order` (automationer, uppgraderingar och
meriter), `atRunKp` (kunder) eller `id`. `order` i steg om 10 lämnar plats för inskott.

**D27 – Simuleringen körs via Vites module runner; `tsx` tas bort**
`import.meta.glob` finns bara i Vite. `scripts/run-sim.mjs` kör `sim/run.ts` med `runnerImport` från Vite, så
att samma registerkod används som i spelet. Ingen ny dependency: `tsx` togs bort. Simens hastighet är
oförändrad (~15 s för 200 seeds × 3 h).

**D28 – Automerge med GitHubs inbyggda auto-merge**
`automerge.yml` slår på `gh pr merge --auto --squash` för PR:er med `automerge` (och slår av den om etiketten
tas bort eller om `conflict`/`blocked` finns). Själva mergen görs av GitHub när de obligatoriska checkarna
(`gates`) är gröna. Det är säkrare än att räkna checkar själv. Workflowet checkar aldrig ut PR-kod
(`pull_request_target`). Efter varje push till main uppdateras PR:er som ligger efter (`update-branch`), och
de som inte går att uppdatera får `conflict`. Workflowet använder en valfri PAT (`AUTOMERGE_TOKEN`), eftersom
`GITHUB_TOKEN` inte startar efterföljande workflows.

**D29 – CI på grenar körs bara via PR**
`ci.yml` körs vid push till `main` och för PR:er, med concurrency som avbryter inaktuella körningar. Det
undviker dubbla körningar för varje worker-push.

**D30 – Tester för nya features i nya filer**
`tests/<id>-*.test.ts` och `e2e/<id>-*.spec.ts`, så att parallella PR:er inte redigerar samma testfil.
