---
id: p-compact-chip-tap
size: S
status: proposed
touches: [src/ui/network.ts, src/ui/hero.ts, src/ui/style.css]
depends: [062]
---

# Tryck på ett system i remsan visar dess tips

Sedan 062 syns systemen som små chips i den krympta kartan, men ett tryck på ett chip fäller bara ut
kartan. Låt ett tryck på ett chip fälla ut kartan *och* visa det systemets nodtips (028), så att spelaren
direkt får veta vad hen tryckte på.

*Varför (VISION, "tydligt" och parodinamnen som en del av humorn):* chipsen visar bara förkortningar, och
taglinen är belöningen för att man är nyfiken.

## Tester
- e2e (390×844): skrolla till kompakt läge och tryck på ett källchip. Kartan blir stor, tipset visar samma
  system som chippet (`data-system`), och listan står överst. Inga konsolfel.
