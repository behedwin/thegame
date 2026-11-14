# BACKLOG

Storlek: [S] < 1 h, [M] en session, [L] flera sessioner. Prioritetsordning: överst först.
Regler: se CLAUDE.md. Märkningen (v1) betyder att det krävs för första interna testbygget.

## Godkänt
1. [S] (v1) **Köp ×1 / ×10 / MAX**: en väljare ovanför listan. Visa totalkostnad och antal.
   *Varför:* standard i genren och färre tryck (research: UI/UX).
2. [S] (v1) **Fler slumpevent (5 st)**: "Rektorn har bokat ett möte som kunde varit mejl" (klick ×5 i 20 s),
   "Utläsningstjänst är nere" (engångs-KP), "Å, Ä och Ö blev Ã¥Ã¤Ã¶" (produktion ×2 i 60 s),
   "Schemat ändrades igen", "Någon döpte om alla klasser till 'Test'". Använder befintliga effekttyper.
3. [M] (v1) **Fyra nya integrationstyper**: SFTP-överföring, SCIM-provisionering, SS 12 001-API och
   LTI-koppling, med nya system i kartan. Kartan behöver en kompakt layout som visar max ~6 rader (de senast
   upplåsta). Sim före och efter.
4. [M] (v1) **Kundkontrakt med effekter**: kommuner ger stabil bonus, friskolor ger klickbonus och koncerner
   multiplikatorer. En kundlista visas i en egen vy. Sim före och efter.
5. [M] (v1) **Achievements (20 st)**: t.ex. "Första CSV:n", "Semikolonmästare", "1 000 lösenord" och "Mötet
   som kunde varit ett mejl". Var och en ger +1 % produktion. Egen flik och toast.
6. [M] (v1) **App-ikon och splash**: egen vektorikon (nav med datapaket i turkos och guld, inga varumärken),
   adaptiv Android-ikon och splashfärg.
7. [M] (v1) **Android-polish**: tillbaka-knappen stänger dialoger eller frågar innan appen stängs, statusbar-
   och navbar-färg, låst porträttläge, ingen textmarkering eller zoom. Test på riktig enhet. Ta bort
   INTERNET-behörigheten om möjligt (D15).
8. [M] (v1) **Säsongsevent kopplade till läsåret**: Studiedag, Höstlov, Nationella prov och Skolavslutning.
   Datum injiceras i kärnan. Bonusen är frivillig och återkommer varje år (ingen FOMO).
9. [S] (v1) **Ljudpolish**: volymreglage, eget ljud för milstolpar, kunder och event, och dämpat ljud när
   appen ligger i bakgrunden.
10. [M] (v1) **Prestige 2.0**: förhandsvisning ("nästa läsår går ~X % snabbare"), fler meritbonusar
    (automationsrabatt, snabbare event, offline-effekt) och sim-balans för runda 2–5.
11. [S] (v1) **Statistiksida**: totalt intjänat, klick, event, läsår och tid spelat.
12. [M] (v1) **Lokala notiser som spelaren själv slår på** (av som standard): "Offlinetaket är nått" och
    "Nytt säsongsevent". Kräver `@capacitor/local-notifications` (DECISIONS). Ingen nätverkstrafik.
13. [S] (v1) **Tryck-och-håll på SYNKA**: ca 8 klick/s när man håller inne. Tillgänglighet, så att inget
    snabbtappande krävs.
14. [S] (v1) **Namngivna milstolpar**: "Nattlig synk körs nu varje timme", "CSV-importen har lärt sig UTF-8"
    osv. visas i toast och på kortet.
15. [M] (v1) **Onboarding**: tre diskreta tips under första minuten ("Tryck på SYNKA", "Köp din första
    integration", "Event: tryck snabbt!").
16. [S] (v1) **Tillgänglighet**: skärmläsartexter, kontrastkontroll, reduced motion verifierat och textstorlek.

## Förslag
17. [S] **Talformat i inställningar** (svenska förkortningar eller vetenskaplig notation).
    *Varför (VISION, "tydligt"):* avancerade spelare föredrar notation, nya spelare förkortningar.
18. [S] **Export/import av sparning som text** (lokalt, ingen nätverkstrafik).
    *Varför (VISION, "respekt för spelarens tid"):* byte av telefon ska inte nollställa någon.
19. [M] **Regioner som lång loop**: lås upp "Norrland", "Västkusten", "Huvudstadsregionen", var och en med
    egna kunder och system.
    *Varför (VISION, lång loop):* ny mekanik som avslöjas över tid.
20. [L] **Upphandlingar**: ett andra lager där du lägger anbud på ramavtal (val mellan billigt, snabbt och
    stabilt) och vinner multiplikatorer.
    *Varför (VISION, lång loop):* prestige ska ändra reglerna, inte bara gå snabbare (research).
21. [L] **Narrativ båge och slut: "Hela Sverige på en standard"**: kapitel per läsår, slutscen och valfria
    utmaningar efteråt.
    *Varför (VISION, respekt för spelarens tid):* ett riktigt slut.
22. [M] **Sen-spels-sim**: utöka simen med en profil på 10 h och mätvärden för runda 2–5 i sim-report.json.
    *Varför:* nuvarande grindar täcker bara de första 3 timmarna.
23. [S] **Batterispar**: 30 fps-läge och pausade paketanimationer när hero-ytan inte syns.
    *Varför (VISION, mobil):* idle-spel står ofta öppna länge.

## Klart
- 2026-11-14: Repo, verktyg och alla 5 grindar (typecheck, unit, sim, e2e, size-check), CI, APK- och
  Pages-workflows.
- 2026-11-14: MVP: klick med feedback (flygande siffror, paket, ljud och vibration), 6 uppgraderingar, 4
  automationer, milstolpar 25/50/100/250, 1 slumpevent, sparning, offline med välkomstdialog, grundprestige
  (Nytt läsår och 4 meritbonusar), kosmetiska kunder och inställningar.
