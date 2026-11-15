---
id: 034
size: M
status: ready
touches: [src/ui/dialogs.ts, src/ui/app.ts, src/core/, src/content/texts.ts, src/content/balance.ts, src/save/]
depends: []
priority: normal
---

# "Hur börjar du dagen?": val i välkomstdialogen

Från förslaget `p-morning-choice` (flyttat till kön automatiskt när kön var tom).

*Varför (VISION, retention):* att komma tillbaka ska kännas som en belöning. När man öppnar appen fattar man
ett litet beslut i stället för att bara läsa en siffra.

## Vad som ska göras
- Välkomstdialogen (`showWelcome` i `app.ts`) får tre val i stället för bara OK:
  - **Kaffe:** offline-intjäningen ×1,2.
  - **Inkorgen:** ett extra ärende direkt (021), upp till taket.
  - **Standup:** klick ×2 i 2 minuter, som en vanlig buff.
- Varje val ger **minst** samma offline-intjäning som i dag. Man straffas aldrig och det finns ingen streak.
  Stängs dialogen (×, Escape eller tillbaka) räknas det som att man bara tar offline-intjäningen.
- Effekterna är rena funktioner i `src/core/` (`applyMorningChoice(state, choice, rng)`). Siffrorna ligger
  i `balance.ts` och texterna i `texts.ts`, med samma torra ton som välkomsttexten.
- Behövs ny form på sparningen (det ska helst inte behövas): höj `SAVE_VERSION` och lägg till en migrering
  enligt CLAUDE.md.

## Gränser
- Simmen får ta kaffe som standardval. Första prestige ska ligga kvar inom 30–90 min (ange före och efter).

## Tester
- Enhet (`tests/034-*.test.ts`): varje val ger ≥ grundintjäningen, inkorgsvalet respekterar taket,
  standupbuffen löper ut efter 2 minuter och indata muteras inte.
- e2e (`e2e/034-*.spec.ts`): seeda en sparning med lång frånvaro, ladda, välj vart och ett av valen och
  verifiera effekten. Spara en skärmdump i mobilstorlek. Inga konsolfel.
