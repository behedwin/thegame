# VISION – Skolintegratören

> Ändringar i det här dokumentet eller i målgruppen kräver beslut av ägaren (HÅRT STOPP, se CLAUDE.md).

## Idé
Ett svenskt idle-/clicker-spel där du är **integratör i den svenska skolvärlden**. Du börjar ensam med en
CSV-fil och en kaffekopp och bygger ett integrationsimperium. Data flyttas mellan alla (påhittade)
edtech-leverantörer, och dina kunder är kommuner och friskolor. Varje integrationstyp spelaren kan tänka sig
finns med: CSV-import, nattlig synk, flödessynk, API, SFTP, SCIM-provisionering, inloggningsfederation,
schemaexport, läromedelslicenser, betygsöverföring och mer.

Kärnvaluta: **Kunskapspoäng (KP)**. Prestige: **Nytt läsår** ger **Meriter**.

## Målgrupp
Vuxna som gillar spel, särskilt idle- och strategispel. Man behöver inte jobba i skolan eller med IT. Den som
gör det får en extra skrattnivå.

## Ton
- Humor och igenkänning om IT, möten, byråkrati, lösenord och "systemet är nere". Skämten ska fungera på
  ytan. Branschskämt är bonus, aldrig en förutsättning.
- Varm, aldrig elak. Vi skämtar om systemen och situationerna, inte om lärare, elever eller verkliga personer.
- Endast parodinamn (Skolmjuk, Utbildningsmoln, Mikromjuk 366 …). Inga riktiga varumärken, logotyper eller
  färgprofiler, och inget som antyder samarbete med någon.
- All speltext är på svenska.

## Utseende
Snygg, lugn och tydlig grafik. Gränssnittet ska vara luftigt och aldrig plottrigt. En huvudskärm med
nätverkskartan (källsystem → ditt nav → målsystem) som växer när imperiet växer. Systemen visas först när de
behövs (progressive disclosure). Stora tryckytor, porträttläge, mobilen först.

## Retentionsprinciper (designa medvetet)
1. **Kort loop (sekunder):** saftig klickfeedback med flygande siffror, datapaket som åker, ljud och vibration.
2. **Mellanloop (minuter):** något nytt inom räckhåll var 30–60:e sekund tidigt. Milstolpar vid 25/50/100/250
   av samma integration ger ×2. Nya kunder skrivs på löpande.
3. **Lång loop (timmar/dagar):** Nytt läsår (prestige), achievements, nya integrationstyper, regioner och
   kundsegment som låses upp.
4. **Överraskning:** klickbara slumpevent ("Alla elevlösenord har gått ut!") med tillfälliga bonusar.
5. **Rytm:** säsongsevent som följer läsåret (Studiedag, Höstlov, Nationella prov, Skolavslutning). De
   återkommer varje år, så ingen behöver vara rädd för att missa något.
6. **Att komma tillbaka ska kännas som en belöning:** offline-intjäning med välkomstdialog. Man straffas
   aldrig för att ha varit borta.
7. **Respekt för spelarens tid:** det ska finnas ett slutmål och en berättelse ("Hela Sverige på en standard").

## Icke-mål
- **Inte pay-to-win.** Spelet är gratis. Inga köp av något slag.
- **Inga annonser.** Varken belönade eller andra.
- **Inga mörka mönster:** inga lootboxar, ingen falsk brådska, inga dagliga streaks som straffar, inget köp av
  tid, inga FOMO-event och inga manipulativa notiser.
- **Ingen insamling av data:** ingen analytics, inga konton och ingen nätverkstrafik i v1. Allt sparas lokalt.
- Inget krav på snabbtappande för att komma framåt.

## Plattform
Webben (lokalt och på GitHub Pages) och Android via Capacitor. Publicering på Google Play kommer senare och
kräver ägarens beslut.
