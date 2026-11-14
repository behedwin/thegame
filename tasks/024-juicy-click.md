---
id: 024
size: M
status: ready
touches: [src/ui/, src/content/texts.ts, index.html]
depends: []
priority: normal
---

# Wow-känsla 1: saftigare klick och levande KP-räknare

Ägaren vill att spelet ska kännas **imponerande och tillfredsställande** att spela: mer animation och
"coolhet". Den här uppgiften gör kortloopen (varje tryck) saftigare och lägger grunden (`src/ui/fx.ts`) som
026 bygger vidare på.

*Varför (VISION):* retentionsprincip 1, "saftig klickfeedback med flygande siffror, datapaket som åker, ljud
och vibration". Utseendet ska samtidigt vara "snyggt, lugnt och tydligt", så effekterna ska vara korta,
mjuka och aldrig plottriga.

## Vad som ska göras
- **Ny modul `src/ui/fx.ts`** med små återanvändbara effekter, bara med CSS-transforms/opacity, Web Animations
  API eller en enda `<canvas>`. Inga nya dependencies. Minst:
  - `burst(layer, x, y, opts)`: 6–12 små partiklar ("datapaket": små rundade rektanglar i accentfärg) som
    sprids ut och bleknar på ≤ 600 ms.
  - `ripple(el)`: en ring som växer ut från ett element och bleknar.
  - `countUp(el, from, to, ms)`: räknar en siffra mjukt mellan två värden (formaterad med `fmt`).
- **Klick på navet (SYNKA):** squash-and-stretch på navet (ersätter dagens enkla `pop`), en ripple och en liten
  partikelburst. Flytande siffror får lätt slumpad båge och skala i stället för rak uppstigning.
- **Datapaket vid klick:** ett paket åker längs en slumpad aktiv linje i nätverkskartan in till navet.
- **KP-räknaren** rullar upp mjukt (`countUp`) i stället för att hoppa, och "studsar" diskret vid stora
  ökningar (t.ex. > 5 % på en gång).
- **Tak och prestanda:** högst ~40 effektnoder samtidigt (äldsta tas bort först, som `floatText`), bara
  `transform`/`opacity` animeras och inget nytt körs när fliken är dold.
- **Reduced motion:** med `prefers-reduced-motion: reduce` blir det inga partiklar, ripple eller paketresor.
  Räknaren byter värde direkt. Ljud och vibration påverkas inte.

## Gränser
- Inga mörka mönster: ingen combo eller multiplikator för att klicka snabbare (icke-mål: "inget krav på
  snabbtappande"). Effekterna belönar, men de ger ingen spelfördel.
- Balansen ändras inte (sim ska vara oförändrad, ange före och efter i journalen).
- Håll tillägget runt ≤ 200 rader i `src/` (budget 5 000, cirka 3 850 i dag).

## Tester
- Enhet (`tests/024-*.test.ts`): rena hjälpfunktioner i `fx.ts`, t.ex. easing, interpolering i `countUp`
  (slutvärdet är exakt `to`), partikelgeometri med injicerad slump och att taket för antalet noder hålls.
- e2e (`e2e/024-*.spec.ts`): 30 snabba klick på navet ger inga konsolfel och antalet effektnoder överstiger
  aldrig taket. Med emulerad `reducedMotion: 'reduce'` skapas inga partikelnoder. Skärmdump mitt i en burst
  till `e2e-output/`.
