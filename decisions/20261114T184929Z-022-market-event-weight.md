# 022: Marknadsevent får vikt 0,5

**Beslut:** De tre nya marknadseventen (`friday-update`, `promised-integration`, `pre-study-quote`) har
`weight: 0.5` i stället för 1. Effekterna är de som uppgiften föreslog.

**Varför:** Med vikt 1 föll en seed under golvet för första prestige (seed 109: 29,67 min, gräns 30 min).
Effekterna ligger i samma storlek som de befintliga eventen, så felet beror på att slumpvägen ändrades och att
marginalen redan var liten (min 30,6 före). Att sänka effekterna (×1,5 i stället för ×2 och en mindre klump)
hjälpte inte (29,73 min). Med vikt 0,5 blev min 30,33 min, och alla grindar är gröna.

**Alternativ:** Ändra `balance.ts` (ligger utanför `touches`, och förslaget `p-prestige-floor-margin`
finns redan för det) eller färre event. Lägre vikt behåller allt innehåll och gör eventen lite ovanligare,
vilket passar för smakinnehåll.

**Följd:** Marginalen till golvet är fortfarande liten (0,33 min). `p-prestige-floor-margin` bör tas in i kön
snart.
