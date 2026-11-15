---
id: 043
size: M
status: ready
touches: [src/ui/inbox.ts, src/ui/hud.ts, src/ui/app.ts, src/ui/style.css, src/ui/format.ts, src/core/events.ts, src/core/tickets.ts, src/content/texts.ts, src/content/tickets/]
depends: []
priority: normal
---

# Visa vad valen i inkorgen faktiskt ger

Ägarens idé: det är oklart vad valen i ett ärende faktiskt ger för effekt.

*Varför (VISION, "tydligt" och inga mörka mönster):* i dag visar ärendedialogen bara en etikett per val
("Boka ett möte om avgränsare"). Effekten syns först efteråt, i en toast med handskriven text
(`outcome`). Spelaren kan alltså inte väga valen mot varandra, fast hela poängen med ärendena är att
de är avvägningar ("Inget svar är fel, bara olika avvägningar"). Ett val man inte förstår är inget
val.

## Vad som ska göras
- **Effekten på knappen:** varje val i `ticket-dialog` får en andra, diskretare rad som visar effekten,
  formaterad från `choice.effect` och inte handskriven:
  - `prodMult`: "Produktion ×1,5 i 30 s"
  - `clickMult`: "KP/klick ×2 i 30 s"
  - `lump`: "+1,2 tn KP direkt", beräknat med samma formel som `applyEffect` (max av `baseKps × seconds` och
    `minKp`) och dagens produktion.
  Lägg en ren funktion i `src/core/` (t.ex. `previewEffect(state, effect)`) som returnerar typ, multiplikator,
  längd och KP. Den återanvänds av `applyEffect`, så att förhandsvisningen och utfallet aldrig kan skilja
  sig åt. Själva texten formateras i UI-lagret med `format.ts` och mallar i `texts.ts`.
- **Gör jämförelsen begriplig:** för buffar visar raden också ungefär vad bonusen är värd i KP med dagens
  takt ("≈ +600 KP"), så att en buff och en klump kan jämföras. För `clickMult` räknas det med en rimlig
  klicktakt (konstant i `balance.ts` eller `texts.ts`, inte i kärnan), eller så utelämnas uppskattningen om
  den blir missvisande. Beslutet dokumenteras i `decisions/`.
- **Kvitto efter valet:** toasten efter svaret behåller den roliga `outcome`-texten men avslutar med det
  faktiska utfallet ("+1 234 KP" eller "Produktion ×1,5 i 30 s"). Den formaterade effekttexten tas bort ur
  `outcome` i ärendefilerna i `src/content/tickets/` (meningarna "Produktion ×1,5 i 30 s." och liknande), så
  att den inte står två gånger.
- **Alla aktiva buffar syns:** HUD:en (`buffLine` i `hud.ts`) visar i dag bara den första aktiva buffen. Visa
  alla (t.ex. "Produktion ×1,5 · 24 s" och "KP/klick ×2 · 12 s" bredvid varandra eller kompakt på en rad),
  så att spelaren ser att valet faktiskt verkar. Håll det luftigt.

## Gränser
- Ingen balansändring och inget nytt sparfält. Sim oförändrad (ange före och efter i journalen).
- Mobilen först: knapparna ska fortfarande ha stora tryckytor, och effektraden får inte göra dialogen
  plottrig (testa i 360 px bredd).

## Tester
- Enhet (`tests/043-*.test.ts`): `previewEffect` ger samma KP som `applyEffect` för `lump` (även när
  `minKp` slår till), rätt multiplikator och längd för buffar, och muterar inte indata. Formateringen av
  effekttexten för alla tre effekttyper. `buffLine` (eller ersättaren) listar två samtidiga buffar.
- Content-validering: ingen `outcome` i `src/content/tickets/` innehåller längre den formaterade
  effekttexten (t.ex. regex på `×\d` följt av ` i \d+ s`).
- e2e (`e2e/043-*.spec.ts`): seeda ett ärende, öppna inkorgen och verifiera att varje val visar en effektrad.
  Välj ett buffval och verifiera att buffen syns i HUD:en, och att toasten visar utfallet. Spara en
  skärmdump i mobilstorlek. Inga konsolfel.
