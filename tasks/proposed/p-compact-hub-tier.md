---
id: p-compact-hub-tier
size: S
status: proposed
touches: [src/ui/app.ts, src/ui/style.css, src/content/texts.ts]
depends: [057]
---

# Visa navets nivå i den kompakta remsan

Efter 057 krymper kartan till en remsa när köplistan skrollas. Remsan har SYNKA och en minikarta, men
nav-nivån (Skolnav … Datahjärta) syns inte längre när noderna är små. Visa nivånamnet som en liten etikett
bredvid SYNKA i kompakt läge, så att spelaren ser sin framgång även när hen handlar.

*Varför (VISION, "tydligt", "känslan av att växa"):* mest tid går åt i köplistan senare i spelet, och då ska
progressionen fortfarande synas.

Tester: e2e att etiketten syns i kompakt läge och matchar `T.hubTiers[tier]`, och att den är dold i stort läge.
