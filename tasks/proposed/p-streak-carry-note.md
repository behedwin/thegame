---
id: p-streak-carry-note
size: S
status: proposed
touches: [src/ui/prestige.ts, src/content/texts.ts]
depends: [107]
---

# Nytt läsår: visa att sviten följer med

*Varför (VISION, retention; inget straff):* Sedan 107 fortsätter eventsviten över "Nytt läsår", men
årsrekordet börjar om. Utan en förklaring kan det se ut som att sviten har nollställts när "Längsta svit i
år" visar 0. En kort rad i läsårsbytet, t.ex. "Din svit på 6 följer med till nästa läsår", gör det tydligt
att bonusen är kvar och ger ett litet skäl att fortsätta sviten direkt.

Gör så här: visa raden i prestige-vyn bara när `visibleStreak(state.eventStreak) > 0`. Texten läggs i
`texts.ts`.

## Tester
- Enhet: raden finns när sviten är synlig och saknas annars.
