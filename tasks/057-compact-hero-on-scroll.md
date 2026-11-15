---
id: 057
size: M
status: ready
touches: [src/ui/app.ts, src/ui/network.ts, src/ui/hud.ts, src/ui/hold.ts, src/ui/fx.ts, src/ui/style.css, src/content/texts.ts]
depends: []
priority: normal
changelog: "Kartan krymper när du skrollar i butiken, så att du ser fler saker att köpa."
---

# Kartan krymper när man skrollar, så att köplistan får plats

Ägarens idé: nätverkskartan med SYNKA tar så stor del av skärmen att det blir liten yta kvar att skrolla
bland det man ska köpa. Det borde balanseras bättre, så att man inte behöver skrolla så mycket och
animationen tar mindre plats.

*Varför (VISION, "mobilen först", "luftigt, aldrig plottrigt", "tydligt"):* på en vanlig telefon
(390×844) tar toppraden, HUD:en, kartan (`.hero`, `height: min(42vh, 300px)`), kundraden och flikarna
nästan 600 px. Köplistan får då runt 250 px, vilket räcker till ungefär ett och ett halvt kort. Senare i
spelet, med många integrationer, uppgraderingar och läsår, är det köplistan man använder mest. Kartan är
spelets ansikte och ska finnas kvar ("en huvudskärm med nätverkskartan"), men den behöver inte vara stor
hela tiden.

## Vad som ska göras
- **Två lägen för hjälteytan:**
  - **Stort läge** (köplistan skrollad högst upp): som i dag, men lite lägre, t.ex.
    `min(34vh, 250px)`, med en något mindre SYNKA-knapp (t.ex. 96 px).
  - **Kompakt läge** (så fort köplistan skrollas ner): ytan krymper till en remsa på ungefär 88–110 px.
    SYNKA blir en mindre knapp (minst 64 px, eftersom VISION kräver stora tryckytor). Noderna döljs eller
    blir små prickar, och datapaketen får gärna fortsätta i remsan. Flygande siffror och tryck-och-håll
    (`hold.ts`) fungerar som vanligt.
  - När köplistan skrollas tillbaka till toppen expanderar kartan igen. Ett tryck på remsan (inte på
    SYNKA) gör också att kartan expanderar och listan skrollar upp.
- **Mjuk övergång** (höjd och skala, ca 200 ms) som respekterar `prefers-reduced-motion`. Då byts läget
  utan animation. Layouten får inte hoppa när listan skrollas: använd hysteres (t.ex. kompakt vid
  scrollTop > 24 px, stor vid 0) och se till att kortet under fingret inte flyttas.
- **HUD:en kortare:** kommunmålet ("210/290 kommuner") och en aktiv buff får dela rad när det finns plats.
  KP-siffran förblir störst.
- Eventkortet (`eventSlot`) ska fortfarande synas och gå att trycka på i båda lägena.
- Nodtipsen (028) fungerar i stort läge. I kompakt läge visas de inte.

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.
- Batterisparet (049) fungerar som förut: pausad animation när kartan inte syns.
- Allt i `src/ui/` och `style.css`. Inga nya beroenden.

## Tester
- Enhet (`tests/057-*.test.ts`): logiken för lägesbyte med hysteres (ren funktion: scrollTop och
  nuvarande läge → nytt läge) byter inte läge fram och tillbaka kring gränsen.
- e2e (`e2e/057-*.spec.ts`, viewport 390×844):
  - Stort läge: kartan syns och SYNKA ger KP.
  - Skrolla köplistan: hjälteytan är ≤ 120 px hög, köplistan är ≥ 50 % av viewporten och minst 3 köpkort
    syns helt. SYNKA syns, är minst 64×64 px och ger KP vid tryck.
  - Skrolla tillbaka: stort läge igen.
  - Med `reducedMotion: 'reduce'` fungerar samma flöde.
  - Spara skärmdumpar av båda lägena. Inga konsolfel.
