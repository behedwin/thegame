# Workers fyller på en tom kö från förslagen

## Beslut
En worker som hittar en tom kö flyttar själv in upp till 3 förslag (S/M) från `tasks/proposed/` till kön
via grenen `claude/idea-queue-refill`. Förslag som rör HÅRDA STOPP, kräver ägaren eller är L lämnas kvar.
Regeln står under "Påfyllning av kön" i CLAUDE.md.

## Motivering
Natten till 2026-11-15 gjorde workers klart hela kön (026–031). Sedan stod de still i flera timmar, och varje
körning slutade med "kön är tom", fast 16 förslag väntade i `tasks/proposed/`. Ägaren upplevde att något
hade fastnat. Förslagen skrivs redan av workers med motivering mot VISION, och `[S]`-förslag fick redan
godkännas av en worker. Steget till S/M är litet, och ägaren har bett om att slippa vara flaskhalsen.

## Alternativ som valdes bort
- Bara notis till ägaren (som tidigare): det var just detta som gjorde att kön stod still.
- Påfyllning i städaren: den körs bara varannan timme, och dess prompt förbjuder nya uppgifter.
- Alla förslag på en gång: kön blir lång, och ägaren får mindre chans att styra med "Ny idé (prio)".
- Låta workers dela upp L-förslag: stora speldesignbeslut (upphandlingar, slut) hör till ägaren.
