---
id: 053
size: M
status: done
touches: [src/content/focuses/, src/content/registry.ts, src/content/types.ts, src/content/balance.ts, src/content/texts.ts, src/core/, src/save/, src/ui/prestige.ts, src/ui/hud.ts, src/ui/app.ts, src/ui/effects.ts, src/ui/style.css, sim/]
depends: []
priority: normal
---

# Läsårets inriktning: ett val som ändrar reglerna för ett läsår

Ägarens idé: efter en stund blir spelet repetitivt. Man borde ha mer att se fram emot, och spelet borde
vara roligt även efter många timmar.

*Varför (`docs/RESEARCH.md`: "Prestige ska ge både kraft och en ny regel"; VISION, lång loop):* i dag spelas
varje läsår på samma sätt, med samma köpordning och samma strategi. Ett val vid nytt läsår gör att
rundorna skiljer sig åt och att spelaren har något att planera.

## Vad som ska göras
- När spelaren gör **Nytt läsår** väljer hen en inriktning för det kommande läsåret. En innehållsfil per
  inriktning läggs i `src/content/focuses/`, och registret hittar dem. Förslag på 4–5 stycken i spelets ton:
  - **Vanligt läsår:** ingen ändring. Det är standardvalet och gäller om dialogen stängs.
  - **Molnsatsning:** API- och flödesintegrationer ×3, CSV och nattlig synk ×0,5.
  - **Budgetår:** alla köp −30 %, produktion −15 %.
  - **Projektår:** KP/klick ×5 och event oftare, automationer ×0,7.
  - **Standardiseringsår:** milstolpar ger ×3 i stället för ×2, men integrationer kostar mer.
- Alla inriktningar utom Vanligt läsår ger **+15 % meriter** vid nästa Nytt läsår, så att det lönar sig att
  pröva något nytt. Inget val är en fälla, och inget straffar den som väljer Vanligt läsår.
- Inriktningen visas i HUD:en som en liten etikett ("Budgetår") med en förklaring när man trycker på
  den. Effekterna formateras av samma kod som visar effekter i övrigt.
- Inriktningarna låses upp efter hand: två från läsår 2 och fler från läsår 4 och 6. Det ger ännu en sak
  att se fram emot. De sista nivåerna kan vänta på 051 men behöver inte bero på den.
- Den rena logiken ligger i `src/core/` (effekter som multiplikatorer i samma pipeline som buffar och
  uppgraderingar), och siffrorna ligger i `balance.ts`.
- **Sparformat:** nytt fält `focus` (id). Höj `SAVE_VERSION` och lägg till en migrering där gamla sparningar
  får Vanligt läsår.

## Gränser
- Första läsåret har ingen inriktning, så de tidiga grindarna påverkas inte. Simmen väljer en inriktning
  per läsår med en deterministisk regel (t.ex. roterande). Rundtiderna och `prestigesIn3h` ska ligga kvar
  i samma storleksordning (ange före och efter från `sim-report.json`).
- Inga mörka mönster: ingen tidsgräns för valet och ingen inriktning som bara finns en viss dag.

## Tester
- Enhet (`tests/053-*.test.ts`): varje inriktning påverkar exakt det den lovar. Vanligt läsår är identiskt
  med i dag, meritbonusen räknas bara för andra val, och upplåsningen följer läsåret. Indata muteras inte.
- Migrering: en sparning med föregående version får `focus` = Vanligt läsår.
- Content-validering: unika id, och varje inriktning har namn, beskrivning och effekter.
- e2e (`e2e/053-*.spec.ts`): seeda en sparning nära prestige i läsår 3, gör Nytt läsår, välj Budgetår och
  verifiera etiketten i HUD:en och att priserna är lägre. Ladda om och verifiera att valet är sparat. Inga
  konsolfel.
