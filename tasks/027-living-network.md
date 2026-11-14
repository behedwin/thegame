---
id: 027
size: M
status: ready
touches: [src/ui/network.ts, src/ui/style.css, src/ui/app.ts, src/content/texts.ts]
depends: []
priority: normal
---

# Wow-känsla 3: levande nätverkskarta

Del tre av ägarens idé om mer wow. Nätverkskartan är spelets hjärta (VISION: "nätverkskartan … som växer
när imperiet växer"). Den ska kännas **levande och kraftfull** och tydligt visa att imperiet har vuxit, så
att man blir lite imponerad av det man har byggt.

*Varför (VISION):* utseendet ("snygg, lugn och tydlig grafik") och långa loopen. Spelaren ska se sin tillväxt,
inte bara läsa den i siffror.

## Vad som ska göras
- **Paketflödet följer produktionen:** varje aktiv linje visar datapaket som rör sig mot navet. Hastighet och
  täthet skalar med automationens andel av KP/s (logaritmiskt, med tak), så att stora flöden syns som
  "motorvägar" och små som en stilla ström.
- **Navets nivå:** navet får visuella nivåer efter total KP/s (t.ex. 5 steg på log-skala): starkare glöd, en
  roterande yttre ring och till sist ett subtilt pulserande "datahjärta". Nivåbyte animeras mjukt och ger
  en diskret toast ("Navet har uppgraderats till Regionnav") med text i `texts.ts`.
- **Bakgrund:** ett svagt rutnät eller en stjärnliknande punktbakgrund med mycket långsam drift (parallax vid
  scroll är valfri), som ger djup utan att störa.
- **Prestanda:** paketen ritas i ett enda lager (SVG med återanvända element eller en canvas). Högst ~60
  paket totalt, pausat när fliken är dold och 30 fps räcker (jfr förslaget p-battery-saver).
- **Reduced motion:** paketen står still (eller visas som statiska prickar), ingen drift och ingen rotation.
  Nivåerna syns ändå genom färg och glöd.

## Gränser
- Ren presentation: nivåerna ger ingen spelfördel och balansen ändras inte (sim oförändrad, ange före och
  efter i journalen).
- Luftigt, aldrig plottrigt: paket och glöd får inte skymma nodernas namn eller tooltips.
- Håll tillägget runt ≤ 200 rader i `src/`.

## Tester
- Enhet (`tests/027-*.test.ts`): rena funktioner för `hubTier(kpPerSec)` (gränser, monotont och att NaN/0 ger
  nivå 0), `flowRate(share)` (log-skala, tak och 0 för inaktiva linjer) och fördelningen av paketbudgeten
  (summan är ≤ taket).
- e2e (`e2e/027-*.spec.ts`): med flera automationer finns paketnoder på aktiva linjer, och inga på inaktiva.
  Antalet är ≤ taket och det blir inga konsolfel. Med reduced motion animeras inga paket. Skärmdumpar av
  tidigt och sent nätverk till `e2e-output/`.
