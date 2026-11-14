# update-behind avgör "efter main" med compare-API:t

## Problem
PR #21 (023) blev stående som `BEHIND` efter att #20 (008) mergats. Jobbet `update-behind` i
`automerge.yml` körde direkt efter mergen och filtrerade på `mergeStateStatus == "BEHIND"`. Precis efter en
merge har GitHub ännu inte räknat om de andra PR:erna (status `UNKNOWN`), så #21 hoppades över. Med
`strict: true` på main kan en PR som ligger efter inte mergas, och ingen ny händelse uppdaterade den.

## Beslut
`update-behind` frågar compare-API:t (`compare/<pushad main-sha>...<PR-head>`) och uppdaterar varje öppen
`automerge`-PR med `behind_by > 0`. PR:er med `conflict` eller `blocked` hoppas över, eftersom de ändå inte
ska auto-mergas.

## Alternativ
- Vänta och försöka igen tills statusen inte är `UNKNOWN`. Det ger fördröjning och är fortfarande en
  gissning om timing.
- Stänga av `strict`. Det gör grindarna svagare (HÅRT STOPP), så det är uteslutet.
