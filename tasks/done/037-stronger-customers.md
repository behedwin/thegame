---
id: 037
size: S
status: done
priority: normal
touches: [src/content/balance.ts, src/content/customers/]
depends: []
---

# Starkare kundbonusar med justerad prestigedelare

Från förslaget `p-stronger-customers`.

Kundbonusarna före första prestige fick hållas små (+2–3 % produktion) i task 004, annars föll första
prestige under 30 min i sim. Höj kommunbonusarna (`prodPct` 2–3) till ungefär +10 % och kompensera med
`BALANCE.prestige.divisor` (i dag 6e7) eller en annan tidig spak, så att varje ny kund känns tydligt.

*Varför (VISION, mellanloop):* "nya kunder skrivs på löpande" ska kännas som en belöning, inte en avrundning.

## Tester
- Sim före och efter (från `sim-report.json`) i journalen: första prestige ska fortfarande vara 30–90 min
  för alla seeds och p50 ligga kvar runt 45 min.
- Uppdatera befintliga content-tester som låser bonusvärdena.
