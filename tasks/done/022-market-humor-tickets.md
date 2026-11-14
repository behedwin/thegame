---
id: 022
size: M
status: done
touches: [src/content/tickets/, src/content/events/]
depends: [021]
priority: normal
---

# Marknadshumor: 8 ärenden och 3 event om edtech-marknaden

Fyll inkorgen från 021 med humor om **marknaden**: upphandlingar, licensmodeller, säljpitchar, roadmaps
och "integrationen ingår inte". En fil per ärende i `src/content/tickets/` och per event i
`src/content/events/`, med befintliga effekttyper.

*Varför (VISION, ton):* igenkänning om IT, byråkrati och "systemet är nere". Skämten ska fungera på ytan, och
branschfolk får en extra nivå.

## Förslag på ärenden (välj fritt, men täck bredden)
- "Ny plattform som ersätter alla andra plattformar." Efter införandet finns en plattform till.
- "Nu med AI!" Funktionen är en CSV-export med en ny ikon.
- Licens per elev, per inloggning och per sekund. Spelaren väljer mellan att förhandla, betala eller boka ett
  möte.
- "Vi har ett API." Det är ett Excel-ark som mejlas varje måndag.
- Funktionen finns på roadmapen till "Q3", varje år sedan 2019.
- Upphandlingsunderlaget är på 400 sidor, varav 3 handlar om integration.
- Leverantören har bytt namn igen, och alla fältnamn med det.
- Mässan: goodiebag med stressboll, och en demo som inte startar.

## Förslag på event
- "Leverantören släppte en uppdatering på en fredag" (produktion ×2 i 60 s när du lagat den)
- "Säljaren lovade en integration som inte finns" (engångs-KP, `lump`)
- "Konsultoffert: förstudie inför förstudien"

## Regler
- Varm, aldrig elak (VISION): vi skämtar om systemen, säljprocesserna och situationerna, aldrig om lärare,
  elever eller verkliga personer.
- Avsändare (`from`) är befintliga **parodi**system och kunder i `src/content/`. Inga riktiga varumärken
  eller personnamn, och inget som antyder samarbete. Originalnamn skrivs aldrig ut i repot.
- Valen i varje ärende är avvägningar enligt reglerna i 021.

## Tester och sim
- Content-valideringen från 021 täcker de nya filerna. Lägg till ett test som räknar att minst 12 ärenden
  finns totalt.
- Sim före och efter i journalen: antal ärenden och event per 3 h, och att alla grindar fortfarande håller.
