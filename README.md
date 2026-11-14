# Skolintegratören

Ett svenskt idle-spel där du bygger ett integrationsimperium i skolvärlden: CSV-importer, nattliga synkar och
API:er mellan (påhittade) system, åt kommuner och friskolor. Spelet är gratis, utan annonser och utan
datainsamling.

## Köra lokalt
```bash
npm install
npm run dev        # http://localhost:5173
```

## Kvalitetsgrindar
```bash
npm run gates      # typecheck, test, sim, size-check, tasks:check, build, e2e
```
Första gången behövs `npx playwright install chromium`. På Windows kör du från `C:\...` med versalt `C:`
(se CLAUDE.md).

## Android
```bash
npm run android:sync          # bygger webben och kopierar in den i android/
npx cap open android          # öppnar Android Studio (kräver Android SDK)
```
CI bygger en osignerad debug-APK vid varje push till `main` (Actions → "Android debug APK" → artefakter).

## Dokument
- [VISION.md](VISION.md): idé, ton och icke-mål
- [CLAUDE.md](CLAUDE.md): arbetsregler och worker-protokollet
- [tasks/](tasks/README.md): uppgiftskön (ersätter BACKLOG.md)
- [journal/](journal/README.md): en fil per körning (ersätter JOURNAL.md)
- [decisions/](decisions/README.md): beslut med motivering (ersätter DECISIONS.md)
- [docs/RESEARCH.md](docs/RESEARCH.md): research om idle-speldesign

---

## Parallella workers: inställningar i GitHub (för ägaren)

Flera autonoma workers kan arbeta samtidigt. Varje worker låser en uppgift genom att pusha grenen
`claude/task-<id>`. När den pushar en commit med `[ready]` i meddelandet skapar `auto-pr.yml` PR:en (workers
skapar inga PR:er själva). PR:er med etiketten `automerge` (storlek S/M) mergas automatiskt
med squash när CI är grön. Storlek L, och allt med `conflict` eller `blocked`, mergar du själv.

Slå på följande i repot på GitHub. Skärmnamnen gäller GitHub i november 2026.

> **Privat repo:** branch protection, rulesets och auto-merge kräver GitHub Pro, Team eller Enterprise för
> privata repon. På gratisplanen fungerar de bara i publika repon.

### 1. Allmänt (Settings → General → Pull Requests)
- ✅ **Allow squash merging**. Merge commits och rebase merging kan stängas av, så att historiken blir linjär.
- ✅ **Allow auto-merge**. Krävs för `automerge.yml`.
- ✅ **Automatically delete head branches**. Viktigt: när en PR mergas raderas `claude/task-<id>`, och då
  släpper låset.

### 2. Regel för `main` (Settings → Rules → Rulesets → New branch ruleset, eller Branches → Add rule)
- Target: `main` (default branch). Enforcement: **Active**.
- ✅ **Restrict deletions**
- ✅ **Block force pushes**
- ✅ **Require a pull request before merging**
  - Required approvals: **0**. Med 1 eller fler kan auto-merge aldrig slå till, eftersom workers inte kan
    godkänna egna PR:er. Du granskar L-PR:er och PR:er med `conflict` eller `blocked` manuellt ändå.
- ✅ **Require status checks to pass** → lägg till checken **`gates`** (jobbet i `ci.yml`).
  - ✅ **Require branches to be up to date before merging**: rekommenderas **om** du lägger in
    `AUTOMERGE_TOKEN` (steg 4). Då fångas krockar mellan parallella PR:er (t.ex. två balansändringar som var
    för sig klarar simen men inte tillsammans). `automerge.yml` uppdaterar efterliggande PR:er automatiskt.
    Utan token: slå **av** detta, annars fastnar PR:er som "behind".
- ✅ **Require linear history** (valfritt, squash ger det ändå).
- Bypass list: lämna tom. Du kan ändå merga manuellt när `gates` är grön.

Lägg **ingen** regel på `claude/task-*`. Workers måste kunna pusha med `--force-with-lease` till sin egen gren,
och `stale-claims.sh --release` måste kunna radera döda lås.

### 3. Etiketter (Issues → Labels)
Skapa `automerge`, `needs-review`, `conflict` och `blocked`. Med `gh`:
```bash
gh label create automerge --color 2DA44E --description "Squash-merge automatically when checks are green"
gh label create needs-review --color FBCA04 --description "Size L: the owner reviews and merges"
gh label create conflict  --color D93F0B --description "Rebase conflict outside the task's touches; owner resolves"
gh label create blocked   --color B60205 --description "Task blocked (gate failed 3x or hard stop)"
```

### 4. Token (rekommenderas): `AUTOMERGE_TOKEN`
Används av `auto-pr.yml` (skapar worker-PR:er) och `automerge.yml`. Händelser som `GITHUB_TOKEN` orsakar
startar inga nya workflows. Utan egen token gäller därför:
- PR:er som `auto-pr.yml` skapar får ingen CI och mergas aldrig.
- CI körs inte på grenar som `automerge.yml` uppdaterar ("update branch").
- APK- och Pages-bygget startar inte efter en auto-merge till `main`.

Skapa en **fine-grained personal access token** (Settings → Developer settings → Fine-grained tokens) som bara
gäller det här repot, med behörigheterna **Contents: Read and write**, **Pull requests: Read and write** och **Workflows: Read and
write**. Den sista behövs för att uppdatera en gren när main har ändrat filer i `.github/workflows/`.
Lägg den som repo-secret `AUTOMERGE_TOKEN` (Settings → Secrets and variables → Actions). Sätt ett
utgångsdatum och förnya den.

### 5. Actions (Settings → Actions → General)
- Workflow permissions: **Read and write permissions** (`automerge.yml` behöver `contents: write` och
  `pull-requests: write`).

### 6. Workers
Varje worker behöver kunna pusha grenar och skapa PR:er och etiketter. Det enklaste är en inloggad `gh` (eller
`GH_TOKEN` i miljön). Med `gh` kan `stale-claims.sh --release` också frigöra döda lås. Utan `gh` listas de
bara som "PR-status okänd".
