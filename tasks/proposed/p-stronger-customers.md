---
id: p-stronger-customers
size: S
status: proposed
touches: [src/content/balance.ts, src/content/customers/]
depends: []
---

# Starkare kundbonusar med justerad prestigedelare

Kundbonusarna före första prestige fick hållas små (+3–5 % produktion) i task 004, annars föll första
prestige under 30 min i sim. Höj `BALANCE.prestige.divisor` något (t.ex. 4e7 → 5e7) och höj
kommunbonusarna till ungefär +10 %, så att varje ny kund känns tydligt. Motivera med sim före och efter.
Målet är att p50 för första prestige ligger kvar runt 45 min.
