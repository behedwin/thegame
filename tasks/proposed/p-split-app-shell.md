---
id: p-split-app-shell
size: M
status: proposed
kind: refactor
touches: [src/ui/]
depends: []
---

# Dela upp app.ts

`src/ui/app.ts` är 450 rader och den hetaste filen i `src/ui/`: nästan varje UI-uppgift rör den, så
parallella workers krockar där. Bryt ut rendering av toppraden/buffar/kunder, inställningsdialogen och
prestigefliken till egna moduler (som `customers.ts` och `shop.ts`). Inga beteendeändringar. Befintliga
e2e-tester ska passera oförändrade. Lämplig som innehåll i refaktoreringsuppgift 010.
