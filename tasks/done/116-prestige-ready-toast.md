---
id: 116
size: S
status: done
touches: [src/ui/app.ts, src/ui/render-toasts.ts, src/content/texts.ts]
depends: [108]
priority: normal
changelog: "En kort notis säger till första gången under läsåret som ett nytt läsår kan startas."
---

# Toast första gången ett nytt läsår kan startas

Från förslaget `p-prestige-ready-toast`.

*Varför (VISION, retention; tydliga nära mål och lång loop):* sedan 108 får fliken Läsår en prick när ett
nytt läsår kan startas, men pricken är diskret. Första gången under ett läsår som `canPrestige` blir sant
visas en kort toast, t.ex. "Nytt läsår kan startas! Du får 1 merit.", så att spelaren förstår att den långa
loopen har öppnat sig. Ingen falsk brådska: texten säger inget om att det är bråttom. Ingen balansändring
och inget nytt sparfält.

## Vad som ska göras
- Lägg övergången i `renderToasts` (`src/ui/render-toasts.ts`), som redan jämför två renderingar och aldrig
  visar något på första renderingen (en laddad sparning ger alltså ingen toast). Toasten visas vid
  övergången falskt → sant för `canPrestige`, och inte igen samma läsår även om värdet pendlar (håll
  läsåret i minnet i UI:t, t.ex. `prestiges` för senast visade toast).
- Visa den inte när spelaren redan står på fliken Läsår (`app.ts` vet vilken flik som är öppen).
- Texten läggs i `texts.ts` och tar antalet meriter (`pendingMerits`).

## Tester
- `tests/116-*.test.ts`: toasten kommer vid övergången falskt → sant, inte på första renderingen, inte en
  andra gång samma läsår och igen i nästa läsår.
- Befintliga tester för `renderToasts` (109, 112) fortsätter att vara gröna.
