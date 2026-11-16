---
id: p-streak-carry-tab
size: S
status: proposed
touches: [src/ui/prestige.ts, src/content/texts.ts]
depends: [114]
---

# Läsårsfliken: visa att sviten följer med redan före bytet

*Varför (VISION, retention; inget straff, tydliga nära mål):* sedan 114 står det i bekräftelsedialogen att
eventsviten följer med till nästa läsår. Spelaren som funderar på när läsåret ska bytas ser det först när
dialogen öppnas. Visa samma rad (`streakCarryLine`) i läsårskortet på fliken, under förhandsvisningen av
nästa läsår, så att sviten inte blir ett skäl att skjuta upp bytet. Ingen balansändring.

## Tester
- Enhet: raden återanvänder `streakCarryLine` (finns redan testad i 114).
- e2e (390×844): med en synlig svit syns raden på läsårsfliken, utan svit syns den inte. Inga konsolfel.
