---
id: 119
size: S
status: done
touches: [src/ui/app.ts, src/ui/render-toasts.ts, src/content/texts.ts]
depends: [116]
priority: normal
changelog: "En lugn notis säger till när läsåret ger dubbelt så många meriter som när det kunde bytas."
---

# Toast när ett läsår ger dubbelt så många meriter som när det öppnades

Från förslaget `p-merit-step-toast`.

*Varför (VISION, tydliga nära mål och lång loop):* 116 säger till när ett nytt läsår kan startas. Därefter
märker spelaren inte att det kan löna sig att vänta. En lugn toast när väntande meriter har fördubblats
jämfört med när läsåret öppnades ("Nu får du 2 meriter för läsåret") ger ett frivilligt delmål utan falsk
brådska. En gång per fördubbling och läsår. Ingen balansändring och inget sparfält.

## Vad som ska göras
- Ren funktion i `src/ui/render-toasts.ts` bredvid `prestigeReadyToast`, med samma slags minne per läsår i
  UI:t (meritantalet när läsåret öppnades och senast visade steg, bara i minnet).
- Ingen toast på fliken Läsår och ingen på första renderingen (`prev === null`), så att en laddad sparning
  aldrig ger en toast.
- Text i `texts.ts` (funktion som tar antalet meriter, med rätt singular/plural).

## Tester
- `tests/119-*.test.ts`: toast vid fördubbling, inte igen för samma steg, en ny toast vid nästa fördubbling,
  inte på första renderingen, inte på fliken Läsår och nollställt minne efter ett läsårsbyte.
