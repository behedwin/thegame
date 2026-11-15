# 061 – Eventkortets plats i den krympta kartan

**Beslut:** I kompakt läge centreras eventkortet, både vågrätt och lodrätt, i remsan till höger om SYNKA
(`left: 84px; right: 8px`). Det läggs inte som en banderoll under remsan.

**Varför:** I 390 px bredd får kortet ~298 px. De längsta eventrubrikerna radbryts på två rader, och
kortet ryms då i den 96 px höga remsan. En banderoll under remsan skulle trycka ned kundraden och flikarna
varje gång ett event dyker upp, så att listan hoppar medan man köper. Det är mindre lugnt.

**Följdändringar:**
- `title` på `.hero` är ersatt av `aria-label`. Webbläsarens tooltip lade sig över kortet på datorn.
- Ett tryck på kortet i remsan fällde också ut kartan. Kortet togs bort när eventet löstes, innan klicket
  nådde `.hero`, och då missade kontrollen `contains`. `HeroSize` kontrollerar nu `composedPath()` i
  stället. Det rör `src/ui/hero.ts`, som inte stod i `touches`: uppgiftstexten pekade på `app.ts`, men
  koden flyttades till `hero.ts` i 060.
