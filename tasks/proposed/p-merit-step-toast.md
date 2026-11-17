---
id: p-merit-step-toast
size: S
status: proposed
touches: [src/ui/app.ts, src/ui/render-toasts.ts, src/content/texts.ts]
depends: [116]
---

# Toast när ett läsår ger dubbelt så många meriter som när det öppnades

*Varför (VISION, tydliga nära mål och lång loop):* 116 säger till när ett nytt läsår kan startas. Därefter
märker spelaren inte att det kan löna sig att vänta. En lugn toast när väntande meriter har fördubblats
jämfört med när läsåret öppnades ("Nu får du 2 meriter för läsåret") ger ett frivilligt delmål utan falsk
brådska. En gång per fördubbling och läsår. Ingen balansändring och inget sparfält.

## Vad som ska göras
- Ren funktion i `render-toasts.ts` bredvid `prestigeReadyToast`, med samma minne per läsår i UI:t.
- Ingen toast på fliken Läsår och ingen på första renderingen.
- Text i `texts.ts`.

## Tester
- `tests/<id>-*.test.ts`: toast vid fördubbling, inte igen för samma steg, inte på första renderingen och
  inte på fliken Läsår.
