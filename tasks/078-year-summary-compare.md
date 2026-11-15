---
id: 078
size: S
status: ready
priority: normal
changelog: "Återblicken vid Nytt läsår visar hur året gick jämfört med förra läsåret."
touches: [src/core/state.ts, src/core/prestige.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: [076]
---

# Återblicken jämför med förra läsåret

Återblicken vid "Nytt läsår" visar KP, kunder, integrationer, event och ärenden (063, 076), men spelaren ser
inte om året blev bättre än det förra. En liten skillnad efter raden ("7 event lösta (+2)") gör varje prestige
till en tydlig milstolpe och ger ett mål för nästa år.

*Varför (VISION, lång loop och retention):* personliga mål att slå i varje runda, utan straff och utan
balansändring.

## Vad som ska göras
- Spara förra läsårets event och ärenden (t.ex. `lastYearEvents`, `lastYearTickets`) i `prestige()` innan
  räknarna per läsår nollställs. Nytt sparfält: höj `SAVE_VERSION` och lägg till en migrering med 0.
- `yearSummary` tar med skillnaden, och UI:t visar den efter raden bara när det finns ett förra år
  (`prestiges > 0`). Texterna i `texts.ts`.
- Inga balansändringar.

## Tester
- Enhet: prestige sparar årets siffror, skillnaden blir rätt (även negativ och 0), första året visar ingen
  skillnad, migreringen ger 0 och core muterar inte indata.
- e2e: dialogen visar skillnaden för en sparning med ett tidigare läsår.

Från förslaget `p-year-summary-compare`.
