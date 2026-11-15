---
id: 059
size: S
status: done
touches: [src/ui/app.ts, src/ui/fx.ts, src/ui/feedback.ts, src/ui/network.ts, src/ui/style.css]
depends: []
priority: normal
changelog: "Klickeffekterna klipps inte längre av när kartan är krympt."
---

# Klickeffekterna klipps av i den krympta kartan (rättelse efter 057)

Ägarens idé (en bugg, med en skärmdump): i den nya krympta vyn hamnar animationen utanför en osynlig ruta.

*Varför (VISION, "saftig klickfeedback" i den korta loopen, "snygg, lugn och tydlig grafik"):* klicket på
SYNKA är spelets kärnloop. I kompakt läge (057) ser det trasigt ut, och det är just det läge man är i när
man har skrollat ner för att köpa.

## Orsak (undersökt i idéintaget)
Effekterna ritas i `.float-layer` (`position: absolute; inset: 0; overflow: hidden`) inuti `.hero`. I kompakt
läge är `.hero` bara 96 px hög och SYNKA ligger till vänster (`.hero.compact .hub`, 72 px). Det ger tre fel:
- `ripple()` i `fx.ts` växer till 1,7 × knappens storlek (cirka 122 px) och klipps av som en rektangel runt
  knappen.
- De flygande siffrorna (`floatText`, `.float-num` med `rise`) startar vid knappen och stiger uppåt, men
  klipps av vid remsans överkant. De hinner inte flytta sig och staplas därför ovanpå varandra och ovanpå
  SYNKA. Med `translateX(-50%)` vid knappens mitt kan de också hamna utanför vänsterkanten.
- Systemnoderna i kartan visas som tomma rutor, eftersom texten döljs (`.hero.compact .net-node text`). 057
  sa att de skulle döljas eller bli små prickar.

## Vad som ska göras
- **Inga synliga klippkanter:** i kompakt läge ska effekterna få rita utanför remsan (t.ex. `overflow:
  visible` på lagret i kompakt läge, med rätt `z-index` så att de hamnar ovanpå HUD:en och flikarna och
  inte under). Alternativt anpassas effekterna så att de ryms. Ingen effekt får klippas av som en
  rektangel.
- **Siffrorna i kompakt läge:** de stiger kortare och snett åt höger, bort från knappen, och tonar ut
  snabbare. De får inte staplas ovanpå SYNKA, och högst tre syns samtidigt (resten slås ihop eller hoppas
  över). Placeringen hålls inom skärmens kanter (klämd x-position).
- **Ringen och paketen:** mindre skala i kompakt läge (t.ex. 1,3 ×) så att de ryms visuellt runt knappen.
- **Noderna:** i kompakt läge blir de små prickar eller korta streck i stället för tomma rutor, eller döljs
  helt, så att remsan ser avsiktlig ut. Datapaketen får gärna fortsätta.
- Stort läge ska se ut precis som i dag.
- `prefers-reduced-motion` och batterisparet (049) fungerar som förut.

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.

## Tester
- Enhet (`tests/059-*.test.ts`): den rena placeringsfunktionen för siffror i kompakt läge (x klämd inom
  bredden, förskjutning åt höger från knappen, högst tre aktiva).
- e2e (`e2e/059-*.spec.ts`, viewport 390×844): skrolla köplistan till kompakt läge och klicka SYNKA fem
  gånger snabbt.
  - `.float-layer` (eller lagret som används) klipper inte i kompakt läge: kontrollera beräknad `overflow`
    eller att `.float-num` får ha en `getBoundingClientRect` som sticker ut ovanför remsan.
  - Ingen `.float-num` överlappar SYNKA-knappens rektangel efter 150 ms.
  - Inga `.net-node`-rutor med synlig ram och utan text syns i kompakt läge.
  - Spara en skärmdump mitt i klickandet. Inga konsolfel.
