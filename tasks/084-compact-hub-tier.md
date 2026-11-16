---
id: 084
size: S
status: ready
priority: normal
changelog: "Navets nivå syns i den krympta kartan medan du handlar."
touches: [src/ui/app.ts, src/ui/hero.ts, src/ui/network.ts, src/ui/style.css, src/content/texts.ts]
depends: []
---

# Visa navets nivå i den kompakta remsan

Från förslaget `p-compact-hub-tier`.

Efter 057 och 062 krymper kartan till en remsa med system-chips när köplistan skrollas. Nav-nivån
(`T.hubTiers`: Skolnav … Datahjärta, se `hubTier()` i `src/ui/network.ts`) syns då inte längre. Visa
nivånamnet som en liten etikett i remsan (t.ex. bredvid SYNKA) bara i kompakt läge, så att spelaren ser sin
framgång även när hen handlar. Etiketten får inte krocka med eventkorten (061) eller chipsen vid 360 px.

*Varför (VISION, "tydligt", "känslan av att växa"):* mest tid går åt i köplistan senare i spelet, och då ska
progressionen fortfarande synas.

## Tester
- e2e (`e2e/084-*.spec.ts`, 390×844 och 360 bred): etiketten syns i kompakt läge och matchar
  `T.hubTiers[tier]`, ryms inom remsan och är dold i stort läge. Inga konsolfel.
