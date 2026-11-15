---
id: p-year-summary-compare
size: S
status: proposed
touches: [src/core/state.ts, src/core/prestige.ts, src/save/, src/ui/prestige.ts, src/content/texts.ts]
depends: [076]
---

# Återblicken jämför med förra läsåret

*Varför (VISION, lång loop):* återblicken vid "Nytt läsår" visar nu KP, kunder, integrationer, event och
ärenden (063, 076), men spelaren ser inte om året blev bättre än det förra. En liten pil ("+3 mot förra
året") gör varje prestige till en tydlig milstolpe och ger ett mål för nästa år.

## Vad som ska göras
- Spara förra läsårets event och ärenden (`lastYearEvents`, `lastYearTickets`) i `prestige()` innan
  räknarna nollställs. Nytt sparfält: höj `SAVE_VERSION`, migrering med 0.
- `yearSummary` tar med skillnaden, och UI:t visar den efter raden ("7 event lösta (+2)") bara när det
  finns ett förra år (`prestiges > 0`).
- Inga balansändringar.

## Tester
- Enhet: prestige sparar årets siffror, skillnaden blir rätt (även negativ), första året visar ingen skillnad,
  migreringen ger 0 och core muterar inte indata.
- e2e: dialogen visar skillnaden för en sparning med ett tidigare läsår.
