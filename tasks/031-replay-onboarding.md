---
id: 031
size: S
status: ready
touches: [src/ui/onboarding.ts, src/ui/help.ts, src/ui/app.ts, src/content/texts.ts]
depends: [029]
priority: normal
---

# Visa introduktionen igen

Ägarens idé: introduktionen (018) ska gå att starta igen när man vill.

*Varför (VISION):* den som har stängt av tipsen, tryckt bort dem för snabbt eller kommer tillbaka efter
lång tid ska kunna få genomgången igen, utan att radera sin spelhistorik. Det är "respekt för spelarens tid"
och gör det lätt att visa spelet för någon annan på samma telefon.

*Varför det inte räcker att återställa `tipsSeen`:* `nextTip` visar bara tips under första läsåret
(`prestiges === 0`), och bara om spelaren inte redan har gjort det tipset ber om (`done`). För en van
spelare skulle en återställning alltså inte visa något alls.

## Vad som ska göras
- En knapp **"Visa introduktionen igen"** överst i hjälpdialogen (029). Den stänger dialogerna och startar
  en **genomgång**.
- **Genomgången** är ett läge i `onboarding.ts`. Den visar tipsen i ordning (SYNKA → köp en integration →
  event) i den befintliga `TipBar`, oberoende av `prestiges`, `done` och inställningen "Tips för nya
  spelare". Varje steg har knappen "Nästa", och det sista har "Klar". Avsluta gärna med ett steg i stil med
  "Hjälpen hittar du under kugghjulet", som pekar till 029. Event-steget förklarar event även om inget event
  pågår.
- Det steg som visas markerar diskret det element det handlar om (SYNKA-knappen, köplistan, eventplatsen),
  t.ex. med en kontur eller puls som respekterar reduced motion. Markeringen får inte flytta layouten.
- Genomgången ligger **bara i minnet** (sparas inte). Den ändrar inte `tipsSeen` och inte
  inställningen `tips`, så ingen ändring av sparformatet behövs. Laddar man om sidan mitt i genomgången
  avbryts den. Det är okej.
- "×" avslutar genomgången direkt. Spelet fortsätter som vanligt under tiden (inget blockerande lager).
- Den rena logiken (vilket steg, nästa, klar) ska vara rena funktioner som går att testa utan DOM. Nya
  texter läggs i `texts.ts` under `tips`.

## Gränser
- Ingen balansändring. Sim oförändrad (ange före och efter i journalen).
- Håll tillägget runt ≤ 60 rader i `src/`.

## Tester
- Enhet (`tests/031-*.test.ts`): genomgången startar på första steget även med `prestiges > 0`, med
  `tips: false` och med alla tips i `tipsSeen`. "Nästa" går framåt, sista steget avslutar, och `tipsSeen`
  och `settings` är oförändrade efteråt.
- e2e (`e2e/031-*.spec.ts`): spela tills alla tips är klara (eller stäng av tipsen), öppna Inställningar →
  Hjälp → "Visa introduktionen igen", och klicka igenom alla steg till "Klar". Tipsraden ska vara dold
  efteråt och finnas kvar dold efter omladdning. Inga konsolfel. Spara en skärmdump i mobilstorlek.
