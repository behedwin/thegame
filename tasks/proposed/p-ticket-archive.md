---
id: p-ticket-archive
size: S
status: proposed
touches: [src/ui/inbox.ts, src/ui/stats.ts, src/content/texts.ts]
depends: []
---

# Ärendearkiv i Statistik

Visa antal besvarade ärenden i Statistik och, när inkorgen är tom, en vänlig rad i inkorgsknappens dialog
med hur många ärenden du har löst totalt ("Du har löst 12 ärenden. Skolorna tackar.").

*Varför (VISION, lång loop och "tydligt"):* `ticketsAnswered` räknas redan men syns ingenstans. En synlig
räknare gör inkorgen till en del av spelarens historia i stället för en ström av engångsval. Inget nytt
sparfält behövs.

Tester: enhet för texten (singular/plural) och e2e som öppnar Statistik och ser raden.
