---
id: p-year-summary-counters
size: M
status: proposed
touches: [src/core/state.ts, src/core/prestige.ts, src/core/events.ts, src/core/tickets.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: [063]
---

# Läsårssammanfattningen räknar event och ärenden

063 visar KP, kunder, integrationer och Meriter i återblicken vid "Nytt läsår", men inte hur många event
och ärenden spelaren tog hand om under året (räknarna per läsår finns inte). Lägg till räknare per läsår i
tillståndet (nollställs av `prestige`), låt `yearSummary` ta med dem och visa två nya rader, t.ex.
"7 event lösta" och "12 ärenden stängda". Kräver nytt sparfält (`SAVE_VERSION` + migrering med 0 som
startvärde).

*Varför (VISION, lång loop):* återblicken blir mer personlig när den speglar vad spelaren faktiskt gjorde,
inte bara vad som producerades. Inga balansändringar.

## Tester
- Enhet: räknarna ökar vid löst event och stängt ärende, nollställs vid prestige, migreringen ger 0 och core
  muterar inte.
- E2e: sammanfattningen visar de nya raderna.
