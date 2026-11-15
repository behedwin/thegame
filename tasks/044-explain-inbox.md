---
id: 044
size: S
status: ready
touches: [src/ui/inbox.ts, src/ui/app.ts, src/ui/onboarding.ts, src/content/help/, src/content/texts.ts]
depends: []
priority: normal
---

# Förklara vad inkorgen är och vad den gör

Ägarens idé: inkorgens funktion och påverkan i spelet är oklar.

*Varför (VISION, "tydligt" och "respekt för spelarens tid"):* inkorgsknappen dyker upp efter ungefär två
minuter utan förklaring. Ingenstans står att ärenden ger tillfälliga bonusar eller KP, att de aldrig går
ut, att inkorgen slutar fyllas på när den har tre ärenden, eller att det inte kostar något att vänta.
Hjälpsidan nämner inkorgen bara i en bisats under "Event och ärenden". En spelare som inte förstår
mekaniken ignorerar den, eller känner stress för att den växer, och båda delarna går emot VISION.

## Vad som ska göras
- **Första ärendet:** första gången ett ärende kommer (`ticketsAnswered === 0` och första ärendet i
  inkorgen) visas ett kort tips i den befintliga tipsraden (`onboarding.ts`/`TipBar`). Till exempel: "Ett
  ärende i inkorgen! Svara när du vill. Varje val ger en bonus, och ärenden går aldrig ut." Tipset följer
  inställningen "Tips för nya spelare" och `tipsSeen`, precis som de andra tipsen.
- **I dialogen:** en diskret rad längst ner i ärendedialogen, t.ex. "Ärenden väntar tills du svarar. Högst 3
  åt gången." Den ska inte vara större än avsändarraden.
- **Hjälpsidan:** ett eget avsnitt för inkorgen i `src/content/help/` (ny fil, t.ex. `inkorgen.ts`, med
  `order` direkt efter `event`). Det förklarar vad ett ärende är, att de kommer ungefär var tredje minut
  (läs värdet från `BALANCE.tickets` om texten genereras, annars "några minuter"), att inkorgen rymmer tre,
  att de aldrig går ut och att du aldrig straffas för att vänta, och vad de tre effekttyperna betyder
  (tillfällig produktionsbonus, tillfällig klickbonus och en klump KP direkt). Ta bort meningen om ärenden
  ur `event.ts` så att den inte står två gånger.
- Ton: torr och varm, som resten av spelet. Inga riktiga varumärken.

## Gränser
- Ingen balansändring och inget nytt sparfält (tipset använder befintliga `tipsSeen`). Sim oförändrad.

## Tester
- Enhet (`tests/044-*.test.ts`): inkorgstipset väljs när första ärendet har kommit och inget ärende är
  besvarat, väljs inte med `tips: false` eller när det redan finns i `tipsSeen`, och tränger inte undan
  tidigare tips i fel ordning. Content-validering för det nya hjälpavsnittet (unikt id och `order`).
- e2e (`e2e/044-*.spec.ts`): seeda ett läge där första ärendet just har kommit och verifiera att tipset
  syns. Öppna ärendet och verifiera infotexten, och öppna Inställningar → Hjälp och verifiera
  inkorgsavsnittet. Inga konsolfel.
