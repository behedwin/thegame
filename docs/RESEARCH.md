# Research: vad gör idle-spel bra och långlivade? (2026-11-14)

Sammanfattning av en genomgång av källor om idle-speldesign. De viktigaste källorna är Anthony Pecorellas
"The Math of Idle Games" (del I–III), GDC-föredraget "Idle Chatter", Zagal m.fl. om mörka mönster och
GameAnalytics benchmarks. Bloggarnas pacingmål är tumregler, inte data.

## Matematik
- Kostnaden är `bas × r^ägda` med r = 1,07–1,15 (AdVenture Capitalist 1,07, Cookie Clicker 1,15).
  Produktionen växer linjärt med antal × multiplikatorer. Kostnaden springer ifrån produktionen, och den
  "naturliga bromsen" är meningen: milstolpar och prestige ska lyfta en igen.
  [Pecorella I](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i)
- Milstolpar (×2 vid 25/50/…) gör kurvan ojämn, och ojämnt är roligt. "Smooth curves are boring."
  [Idle Chatter](https://www.slideshare.net/slideshow/idle-chatter-gdc-2016-59734260/59734260)
- Prestigeformler: AdCap har √(livstid), Cookie Clicker ∛(livstid) och Egg Inc en mycket låg exponent.
  Prestige ska ge både kraft och en ny regel, så att varje runda inte bara är "samma sak fast snabbare".
  [Pecorella III](https://www.gamedeveloper.com/design/the-math-of-idle-games-part-iii)
- Offline: räkna exakt som online. Taket är till för att undvika ekonomibrott, inte för att straffa.
  Melvor kör offline med full fart.

## Varför man kommer tillbaka
- Att återvända ska vara en fest. Ju längre bort, desto större belöning (upp till taket).
- Lager på lager: en enkel kärnloop plus nya mekaniker som avslöjas över tid (Antimatter Dimensions, Realm
  Grinder).
- Berättelse och satir (Universal Paperclips) och humor ligger nära genren.
- Synliga mål, tydliga takter (/s, /h), achievements med små permanenta bonusar och samlingar.
- Benchmarks för bra idle-titlar: D1 ~40 %, D7 ~20 %, D30 ~10–15 % (tumregler).

## UI/UX på mobil
- Progressive disclosure: börja med en knapp och en siffra, och visa flikar och system först när de behövs.
- Köp ×1/×10/MAX. Visa kostnad och vad köpet ger.
- Inget snabbtappande krav. Tryck-och-håll och automation är bekvämlighet, inte fusk.
- Korta talsuffix, med vetenskaplig notation som val.
- Förklara nyckelsystem. Gömda och dåligt förklarade system upplevs som "långsamt spel".

## Undvik
- Mörka mönster med tid: spel på bokad tid (dagliga streaks), grind och FOMO-event.
  [Zagal m.fl.](https://deceptive.design/articles/dark-patterns-in-the-design-of-games)
- Tråkpunkter: väggar där inget går att köpa på över 5 min tidigt, för sen prestige, döda generatorer och
  tvång att tappa snabbt.
- Etiska förebilder: Melvor (inga mikrotransaktioner), Antimatter Dimensions (valfri och dold butik) och
  Universal Paperclips (gratis, med ett riktigt slut).

## Hur det påverkade designen
| Rekommendation | I spelet |
|---|---|
| r = 1,07–1,15, milstolpar | Automationer 1,15, ×2 vid 25/50/100/250 |
| Prestige med √ | Meriter = ⌊√(KP i år / 4·10⁷)⌋ |
| Generös offline utan straff | 100 % effekt, 8 h tak (uppgraderbart till 24 h) |
| Progressive disclosure | Saker visas vid 40 % av priset och Läsår-fliken först nära första merit |
| Välkomstdialog | "Medan du var borta synkade Skolmjuk 1,2 M KP" |
| Inga streaks/FOMO | Säsongsevent återkommer varje år och är bara bonus |
| ×10/MAX, tryck-och-håll, talformat | I BACKLOG |
| Narrativ båge och slut | I BACKLOG ("Hela Sverige på en standard") |

Avvikelse: forskningen föreslår första prestige efter 15–30 min. Ägarens grind kräver 30–90 min, och grinden
gäller. Vi siktar på ~45 min.
