---
id: 026
size: M
status: ready
touches: [src/ui/, src/content/texts.ts]
depends: [024]
priority: normal
---

# Wow-känsla 2: firande ögonblick

Del två av ägarens idé om mer wow och tillfredsställelse. De stora ögonblicken i spelet (köp, milstolpe, ny
kund, nytt system, Nytt läsår) ska kännas som **händelser**, inte bara en toast. Bygger på `src/ui/fx.ts` från
024.

*Varför (VISION):* mellanloopen (milstolpar ×2, nya kunder) och långa loopen (Nytt läsår) blir mer
belönande när de syns och känns. Ton: varmt och glatt, aldrig skrikigt. Fyrverkerier bara när det är
förtjänat.

## Vad som ska göras
- **Köp:** kortet ger en kort "press" och ljusblixt, nivåsiffran räknar upp (`countUp`) och en liten burst
  syns från köpknappen. Vid köp av ×10/×100/Max blir bursten större men varar lika kort.
- **Milstolpe (25/50/100/250):** en ljusglans sveper över kortet, "×2" stämplas in med en studs och det kommer
  en konfettiburst (en canvas, ≤ 1,2 s, högst ~80 partiklar). Det byggs ihop med dagens `sfx.milestone()`.
- **Ny kund påskriven:** ett "Påskrivet!"-stämpel-ögonblick på kundraden (stämpeln slår ned, med en lätt
  skakning av raden) tillsammans med `sfx.customer()`.
- **Nytt system upplåst i nätverkskartan:** noden "bootar" (skalas in med glöd) och linjen ritas fram med
  `stroke-dashoffset` från noden till navet, i stället för att bara tona in.
- **Nytt läsår (prestige):** en kort helskärmsövergång (≤ 2 s, kan hoppas över med ett tryck) där
  meriterna räknar upp och nätverket "nollställs" med en mjuk zoom-ut/zoom-in. Därefter kommer toasten som
  i dag.
- Alla nya texter (t.ex. "Påskrivet!") ligger i `src/content/texts.ts`.

## Gränser
- Inga mörka mönster och ingen falsk brådska: inga blinkande uppmaningar att köpa, inga nedräkningar.
  Effekterna kommer **efter** spelarens handling, aldrig för att locka till en.
- Med `prefers-reduced-motion: reduce` blir det ingen konfetti, skakning eller zoom. Det ersätts av en
  enkel toning, och ljudet finns kvar.
- Prestanda: högst ett konfettilager åt gången (en ny burst återanvänder det), och inget körs när fliken är
  dold.
- Balansen ändras inte (sim oförändrad, ange före och efter i journalen). Håll tillägget runt ≤ 250 rader i
  `src/`.

## Tester
- Enhet (`tests/026-*.test.ts`): konfettifysik med injicerad slump (partiklarna lämnar skärmen eller dör
  inom tidsgränsen, och antalet är ≤ taket), och att varje firandetyp mappar till rätt effekt.
- e2e (`e2e/026-*.spec.ts`): köp upp en automation till milstolpe 25 och verifiera att konfettilagret syns och
  försvinner igen. Gör Nytt läsår och verifiera att övergången kan hoppas över och att spelet går att spela
  efteråt. Inga konsolfel och reduced motion verifieras. Skärmdumpar till `e2e-output/`.
