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
npm run gates      # typecheck, test, sim, size-check, build, e2e
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
- [BACKLOG.md](BACKLOG.md): vad som är på gång
- [DECISIONS.md](DECISIONS.md): beslut och motiveringar
- [JOURNAL.md](JOURNAL.md): sessionslogg
- [docs/RESEARCH.md](docs/RESEARCH.md): research om idle-speldesign
