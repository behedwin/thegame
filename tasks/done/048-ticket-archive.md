---
id: 048
size: S
status: done
touches: [src/ui/inbox.ts, src/ui/stats.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Ärendearkiv i Statistik

Från förslaget `p-ticket-archive`.

`state.ticketsAnswered` räknas redan (`src/core/tickets.ts`) men syns ingenstans. Gör den synlig:
- En ny rad "Besvarade ärenden" i `statRows` (`src/ui/stats.ts`), efter raden för event.
- När inkorgen är tom men knappen syns (`inboxButtonVisible`, efter minst ett besvarat ärende): en vänlig
  rad i inkorgsdialogen med hur många ärenden spelaren har löst totalt, t.ex. "Du har löst 12 ärenden.
  Skolorna tackar." Singular för 1 ("Du har löst 1 ärende.").

*Varför (VISION, lång loop och "tydligt"):* en synlig räknare gör inkorgen till en del av spelarens
historia i stället för en ström av engångsval.

## Gränser
- Inget nytt sparfält och ingen balansändring. All text i `src/content/texts.ts`.

## Tester
- Enhet (`tests/048-*.test.ts`): statistikraden finns med rätt värde, och inkorgsraden har rätt
  singular/plural (0 ärenden ger ingen rad).
- E2e (`e2e/048-*.spec.ts`): öppna Statistik och se raden. Anpassa befintliga tester som räknar
  statistikrader (t.ex. `tests/013-*`/`e2e/013-stats.spec.ts`) om det behövs.
