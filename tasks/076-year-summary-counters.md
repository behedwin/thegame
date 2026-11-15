---
id: 076
size: M
status: ready
priority: normal
changelog: "Återblicken vid Nytt läsår visar hur många event och ärenden du tog hand om."
touches: [src/core/state.ts, src/core/prestige.ts, src/core/events.ts, src/core/tickets.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: [063]
---

# Läsårssammanfattningen räknar event och ärenden

Återblicken vid "Nytt läsår" (063) visar KP, kunder, integrationer och Meriter, men inte hur många event och
ärenden spelaren tog hand om under året. Räknare per läsår finns inte i dag (bara totalerna
`eventsClaimed` och `ticketsAnswered`).

Gör så här: lägg till räknare per läsår i tillståndet som ökar på samma ställen som totalerna och nollställs
av `prestige`. Låt `yearSummary` ta med dem och visa två nya rader, t.ex. "7 event lösta" och "12 ärenden
stängda", med texter i `texts.ts`. Nytt sparfält: höj `SAVE_VERSION` och lägg till en migrering med 0 som
startvärde. Inga balansändringar.

*Varför (VISION, lång loop):* återblicken blir mer personlig när den speglar vad spelaren faktiskt gjorde,
inte bara vad som producerades.

## Tester
- Enhet: räknarna ökar vid löst event och besvarat ärende, nollställs vid prestige, migreringen ger 0 och core
  muterar inte sitt indata.
- e2e: sammanfattningen visar de nya raderna.

Från förslaget `p-year-summary-counters`.
