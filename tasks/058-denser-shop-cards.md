---
id: 058
size: S
status: ready
touches: [src/ui/shop.ts, src/ui/style.css, src/content/texts.ts]
depends: []
priority: normal
changelog: "Köpkorten är tätare, så att fler saker får plats på skärmen."
---

# Tätare köpkort

Ägarens idé, andra delen: man ska inte behöva skrolla så mycket bland det man ska köpa.

*Varför (VISION, "mobilen först", "tydligt"):* ett integrationskort är i dag fem rader högt: rubrik, en
beskrivning på upp till två rader, "KP/s · Mot 100 st: ×2", milstolpens citat ("Rastvakterna syns i
schemat") och en förloppsindikator. Med åtta till elva integrationer och lika många uppgraderingar blir
listan lång. Det mesta av texten behöver man inte läsa varje gång man köper.

## Vad som ska göras
- **Mindre luft:** lägre padding och mindre mellanrum mellan korten. Köpknappen behåller minst 48 px höjd
  (stora tryckytor).
- **Färre rader:** "KP/s · Mot 100 st: ×2" och milstolpens citat delar rad, eller så visas citatet bara när
  nästa milstolpe är nära (t.ex. inom 20 %) och i flash-ögonblicket efter ett köp. Beskrivningen får
  högst en rad med ellips. Ett tryck på kortets textyta (inte köpknappen) fäller ut hela beskrivningen.
- Förloppsindikatorn mot nästa milstolpe ligger kvar men får gärna smälta in i kortets underkant.
- Teaserkort och maxade uppgraderingar blir lika kompakta.
- Tillgänglighet: utfälld och infälld text ska läsas upp (aria-expanded), och text i rem gäller fortfarande
  (019).

## Gränser
- Ingen ändring av spellogik eller sparformat. Sim oförändrad.
- Om 057 redan finns ska korten fungera i både stort och kompakt läge.

## Tester
- Enhet (`tests/058-*.test.ts`): regeln för när milstolpens citat visas (nära milstolpe ja, långt ifrån
  nej, maxad ingen).
- e2e (`e2e/058-*.spec.ts`, viewport 390×844): ett integrationskort är ≤ 88 px högt infällt. Ett tryck på
  textytan fäller ut beskrivningen, och ett nytt tryck fäller in den. Köp fungerar fortfarande. Spara en
  skärmdump. Inga konsolfel.
