---
id: 114
size: S
status: ready
touches: [src/ui/prestige.ts, src/content/texts.ts]
depends: [107]
priority: normal
changelog: "Läsårsbytet visar att din eventsvit följer med till nästa läsår."
---

# Nytt läsår: visa att sviten följer med

Från förslaget `p-streak-carry-note`.

*Varför (VISION, retention; inget straff):* Sedan 107 fortsätter eventsviten över "Nytt läsår", men
årsrekordet börjar om. Utan en förklaring kan det se ut som att sviten har nollställts när "Längsta svit i
år" visar 0. En kort rad i läsårsbytet, t.ex. "Din svit på 6 följer med till nästa läsår", gör det tydligt
att bonusen är kvar och ger ett litet skäl att fortsätta sviten direkt.

## Vad som ska göras
- Visa raden i prestige-vyn (`src/ui/prestige.ts`) bara när `visibleStreak(state.eventStreak) > 0`.
- Texten läggs i `texts.ts`.

## Tester
- Enhet (`tests/114-*.test.ts`): raden finns när sviten är synlig och saknas annars (helst via en ren
  hjälpare som ger raden eller null).
