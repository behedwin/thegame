---
id: 056
size: S
status: done
touches: [src/ui/changelog.ts, src/ui/app.ts, src/ui/welcome.ts, src/core/state.ts, src/save/, src/content/texts.ts]
depends: [054]
priority: normal
changelog: "Efter en uppdatering visar spelet vad som är nytt sedan sist."
---

# "Nytt sedan sist" efter en uppdatering

Ägarens idé, andra delen: spelaren ska få veta när spelet har uppdaterats och vad som är nytt.

*Varför (VISION, "att komma tillbaka ska kännas som en belöning"):* spelet förbättras löpande, men den
som öppnar appen märker det inte. Ett diskret "Nytt sedan sist" gör varje uppdatering till en liten
nyhet att se fram emot, utan att störa.

## Vad som ska göras
- Spara vilken version spelaren senast har sett (`lastSeenVersion`, numret efter `1.` från 054) i
  sparningen. Höj `SAVE_VERSION` och lägg till en migrering där befintliga spelare får den nuvarande
  versionen, så att de inte möts av hela loggen.
- När spelet laddas och den byggda versionen är nyare än `lastSeenVersion` visas en liten, stängbar rad
  eller toast: "Spelet har uppdaterats: 3 nyheter". Ett tryck öppnar dialogen från 054, filtrerad till
  posterna efter `lastSeenVersion`. Därefter uppdateras `lastSeenVersion`, och det sker också om spelaren
  bara stänger raden.
- Om välkomstdialogen (offline-intjäningen) visas samtidigt läggs nyheten som en rad i den, i stället för
  att två dialoger staplas.
- Nya spelare (inget sparat spel) ser ingen nyhetsrad.
- Ingen notis utanför appen och ingen nätverkstrafik.

## Tester
- Enhet (`tests/056-*.test.ts`): filtreringen ger bara poster efter `lastSeenVersion`, och migreringen ger
  befintliga spelare nuvarande version. En ny sparning visar ingenting.
- e2e (`e2e/056-*.spec.ts`): seeda en sparning med en låg `lastSeenVersion`, ladda och verifiera raden
  "Spelet har uppdaterats". Öppna den och se posterna, ladda om och verifiera att raden är borta. Inga
  konsolfel.
