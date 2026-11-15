---
id: p-focuses-played-stat
size: S
status: proposed
touches: [src/ui/stats.ts, src/content/texts.ts]
depends: [072]
---

# Statistik: provade inriktningar

*Varför (VISION, lång loop; retention):* 072 visar vilka inriktningar som inte är provade, men bara i valet
vid "Nytt läsår". Mitt i ett läsår syns inte hur långt spelaren har kommit mot troféerna "Försöksverksamhet"
och "Provat allt". En rad i statistiken, t.ex. "Provade inriktningar: 1 av 3", gör målet synligt hela tiden
utan balansändring.

Gör så här: lägg en rad i `statRows` (`src/ui/stats.ts`) med `state.focusesPlayed.length` och antalet
inriktningar utom standard. Texten i `texts.ts`.

## Tester
- Enhet: raden visar 0 av N i ett nytt spel och räknar upp när `focusesPlayed` växer.
