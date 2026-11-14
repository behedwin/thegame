---
id: 029
size: M
status: done
touches: [src/ui/app.ts, src/ui/help.ts, src/ui/style.css, src/content/help/, src/content/registry.ts, src/content/types.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Hjälp i inställningarna: hur man spelar

Ägarens idé: under Inställningar ska det finnas en hjälpsida som förklarar hur man spelar och hur spelet
fungerar. Den ska vara skriven för spelaren och inte för utvecklare.

*Varför (VISION):* målgruppen är vuxna som gillar idle-spel men inte behöver kunna skol-IT. Introduktionen
(018) visar tre korta tips under första minuten. Efter det finns ingen plats att slå upp hur milstolpar,
kunder, säsonger eller Nytt läsår och Meriter fungerar. En hjälpsida är "respekt för spelarens tid" och
hjälper den som kommer tillbaka efter ett uppehåll (retentionsprincip 6).

## Vad som ska göras
- En knapp **"Hjälp"** i inställningsdialogen (`openSettings` i `src/ui/app.ts`), placerad ovanför
  "Statistik". Den öppnar en egen dialog (`testId: help-dialog`) med rubriken "Så spelar du".
- **Innehållet läggs som filer**, en per avsnitt, i `src/content/help/<id>.ts` (`HelpSectionDef`:
  `id`, `order`, `title`, `body`, där `body` är en eller flera korta stycken). Registret samlar dem med
  `import.meta.glob` på samma sätt som övriga innehållstyper. Ingen central lista.
- **Förslag på avsnitt** (worker får justera): Grunderna (SYNKA och KP, tryck och håll), Integrationer
  (automatisk intjäning), Uppgraderingar, Milstolpar (×2 vid 25/50/100/250), Kunder och kontrakt, Event
  (tryck innan tiden tar slut), Säsonger (de återkommer varje läsår och man missar inget), Nytt läsår och
  Meriter (vad man behåller och vad som nollställs), Offline (systemen jobbar medan du är borta, upp till
  ett tak) och Achievements.
- **Siffror får inte glida isär:** tal som nämns (milstolpsgränser, offline-tak osv.) hämtas från
  `src/content/balance.ts` eller registret, inte hårdkodade i texten. Använd då `body` som funktion eller
  med platshållare.
- **Ton:** kort, varm och med en glimt av spelets humor. Varje avsnitt ska vara på högst cirka 3 meningar.
  Inga spoilers om specifika senare system eller kunder. Förklara mekaniken, inte innehållet.
- **Layout:** avsnitten visas som utfällbara rubriker (`<details>`/`<summary>`) så att dialogen är luftig på
  mobil. Den första är öppen. Stora tryckytor. Dialogen ska gå att scrolla och stängas med "Stäng".
- UI-texter (knappen, rubriken, "Stäng" och aria-etiketter) läggs i `texts.ts`.
- Lägg dialogens rendering i en ny fil `src/ui/help.ts` så att `app.ts` bara får några få rader.

## Gränser
- Ren presentation och innehåll. Ingen ändring av sparformatet och ingen balansändring. Sim ska vara
  oförändrad (ange före och efter i journalen).
- Håll tillägget runt ≤ 120 rader i `src/` (src ligger på cirka 4 200 av 5 000).

## Tester
- Content-validering (`tests/029-*.test.ts`): varje hjälpfil har `id` = filnamnet, unik `order`, en
  titel och en text som inte är tomma, och inga förbjudna originalnamn (återanvänd den befintliga
  kontrollen för parodinamn). Siffrorna i milstolpsavsnittet matchar `balance.ts`.
- e2e (`e2e/029-*.spec.ts`): öppna Inställningar → Hjälp. Alla avsnittsrubriker syns, ett avsnitt går att
  fälla ut, och dialogen stängs. Inga konsolfel. Spara en skärmdump i mobilstorlek till `e2e-output/`.
