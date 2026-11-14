---
id: 023
size: M
status: done
touches: [src/content/customers/, src/content/systems/, src/content/types.ts, src/ui/network.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Igenkännbara parodinamn på leverantörer och kunder

Leverantörs- och kundnamnen ska kännas **verkliga** och ge en blinkning om vem de syftar på, på samma sätt
som befintliga systemnamn (BänkID, Gurgel Klassrum, Mikromjuk 366). Kunderna heter i dag ganska generiska
saker ("Mellanby kommun"). De ska få namn som en svensk spelare känner igen typen av, och ibland just den
förebild det handlar om.

*Varför (VISION, ton):* igenkänning ger extra skrattnivå för den som kan branschen, och skämtet fungerar
ändå på ytan för alla andra.

## Gör så här
1. Skriv ett beslut i `decisions/` med **namnregler**:
   - Ordvits eller ljudlik variant som känns igen, aldrig originalnamnet och aldrig en förväxlingsbar kopia.
   - Originalnamnet skrivs **aldrig** ut i repot (inte i kod, kommentarer, tester, journal eller beslut).
   - Inga namn på verkliga personer, inga logotyper och inga färgprofiler. Inget som antyder samarbete.
   - Varmt, aldrig elakt: skämtet gäller systemet eller situationen, inte orten, invånarna eller personalen.
2. Byt `name` (inte `id`, så att sparfiler och content-referenser fungerar) på befintliga kunder till
   igenkännbara parodier av svenska kommuner, regioner, friskolor och skolkoncerner.
3. Lägg till 6–8 nya parodisystem i `src/content/systems/` för leverantörstyper som saknas, till exempel
   frånvaro, provverktyg, digitala läromedel, elevhälsa, skolskjuts och skolmåltider.
4. Lägg till ett valfritt fält `tagline` på `SystemDef`: en kort parodisk marknadsslogan ("Nu med AI!",
   "Molnbaserat sedan 2024", "En plattform för allt utom det du behöver"). Visa den diskret i nätverkskartan
   när man trycker på ett system.

## Tester
- Content-validering: alla system och kunder har unika namn, och `tagline` är kort (t.ex. ≤ 40 tecken) om
  den finns.
- Skydd mot originalnamn utan att skriva ut dem: testet jämför en hash (t.ex. SHA-256 av normaliserat namn)
  av varje `name` mot en lista med hashar av förbjudna originalnamn. Listan innehåller bara hashar.
- e2e: befintliga flöden fungerar och skärmdump av nätverkskartan med en tagline.
