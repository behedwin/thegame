---
id: 032
size: S
status: done
touches: [src/save/, src/ui/settings.ts, src/ui/app.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Export och import av sparning som text

Från förslaget `p-save-export` (flyttat till kön automatiskt när kön var tom).

*Varför (VISION, "respekt för spelarens tid"):* den som byter telefon eller rensar webbläsaren ska inte
förlora sitt spel. Allt sker lokalt. Det blir ingen nätverkstrafik, inget konto och ingen molnsparning.

## Vad som ska göras
- I inställningsdialogen (`settings.ts`): **"Exportera sparning"** visar sparningen som en textsträng i ett
  skrivskyddat fält, med en knapp som kopierar den (Clipboard API om det finns, annars markeras texten).
- **"Importera sparning"**: ett textfält och en knapp. Importen kräver bekräftelse i två steg, som
  "Radera allt", eftersom den ersätter det nuvarande spelet.
- Formatet är den vanliga `serialize()`-JSON:en, kodad som base64 med ett kort prefix (t.ex. `SKI1:`), så
  att strängen tål att klistras in i chattappar. Importen kör samma `deserialize()` och migreringar som en
  vanlig laddning, så att gamla exporter fungerar efter framtida `SAVE_VERSION`-höjningar.
- Ogiltig text (fel prefix, trasig base64 eller JSON, `SaveError`) visar ett vänligt felmeddelande och
  ändrar ingenting.
- Kodning och avkodning är rena funktioner i `src/save/` (ingen DOM). Texterna ligger i `texts.ts`.

## Gränser
- Ingen ändring av sparformatet och ingen ny dependency. Sim oförändrad.

## Tester
- Enhet (`tests/032-*.test.ts`): export → import ger samma tillstånd (rundtur), en v5-sparning som
  exporterats migreras, och skräp, fel prefix och tom sträng ger fel utan undantag som läcker.
- e2e (`e2e/032-*.spec.ts`): spela lite, exportera, radera allt, importera och verifiera att KP och köp
  är tillbaka även efter omladdning. Inga konsolfel och ingen extern trafik.
