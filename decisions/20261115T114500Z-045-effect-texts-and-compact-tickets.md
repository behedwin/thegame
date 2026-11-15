# 045: En effekttext för event och ärenden, och kompakta ärendeval

## D1: Eventens effekt skrivs av koden, inte för hand
**Beslut:** `claimText` i `src/content/events/` beskriver bara vad som hände. Effekten ("+18 KP",
"Produktion ×2 i 60 s") läggs till av `receiptText` i `src/ui/effects.ts`, samma funktion som ärendenas kvitto
använder (043). Effekthjälparna (`effectText`, `effectLine`, `receiptText`) flyttades från `src/ui/inbox.ts` till
`src/ui/effects.ts`.

**Motivering:** Före 045 fanns två varianter: eventen skrev "Klick ×4 i 20 s!" och "Du får en klump KP!" för
hand, medan ärendena visade den beräknade effekten ("KP/klick ×4 i 20 s", "+18 KP"). Handskriven text kan glida
isär från siffrorna i `effect` och sa aldrig hur mycket en klump var värd. Nu visar event, ärenden och HUD-chips
samma ord (`buffName` i `texts.ts`).

## D2: Ärendeval på två rader
**Beslut:** Varje val i `src/content/tickets/` skrivs som
`{ label: …, effect: …,` + `outcome: … },` i stället för fem rader.

**Motivering:** `src/` låg på 4 997 av 5 000 rader, och ärendefilerna stod för 280 av dem. Två rader per val
är fortfarande lätt att läsa (etikett och effekt på första raden, utfallet på andra) och frigör 96 rader utan
att storleksgrinden ändras.

**Alternativ som valdes bort:** Höja gränsen i `size-check` (försvagar en grind, HÅRT STOPP). Flytta ärenden till
JSON (ny laddning och sämre typkontroll).
