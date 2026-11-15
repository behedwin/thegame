---
id: 071
size: S
status: done
priority: normal
changelog: "Statistiken visar nu din längsta eventsvit någonsin."
touches: [src/core/events.ts, src/core/state.ts, src/save/, src/ui/stats.ts, src/content/texts.ts]
depends: [069]
---

# Rekord: längsta eventsvit

Spara den längsta eventsviten någonsin (069) och visa den bland rekorden i statistiken, t.ex. "Längsta
eventsvit: 7". Ger sviten ett eget litet mål även efter att bonusen har nått taket (svit 6+).

*Varför (VISION, retention):* ett personligt rekord att slå utan straff, och sviten blir synlig även när
inget event är aktivt.

Tester: rekordet följer med sviten och sjunker aldrig, migrering (0), statistikraden visas.

Från förslaget `p-streak-record`.
