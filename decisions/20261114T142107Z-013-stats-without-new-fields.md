# 013: Statistiksidan utan nya sparfält

**Beslut:** Statistiksidan visar bara värden som redan finns i sparfilen (`totalEarned`, `runEarned`,
`clicks`, `eventsClaimed`, `prestiges`, `meritsEarned`, `achievements`, `timeMs`). Ingen migrering och
`SAVE_VERSION` ligger kvar på 3.

**Varför:** Alla fem värden som uppgiften nämner (totalt intjänat, klick, event, läsår och tid spelat) sparas
redan och behålls vid nytt läsår (`prestige()` för över dem). "Ny statistik sparas med migrering" gäller
bara om nya fält behövs. Ett nytt livstidsfält (t.ex. bästa läsår eller antal köp) skulle kräva ändringar i
`src/core/actions.ts` och `src/core/bulk.ts`, som ligger utanför uppgiftens `touches`. Annars nollställs
fältet av `createInitialState()` vid varje nytt läsår.

**Alternativ:** Bästa läsår eller totalt antal köp. De kan läggas som en egen uppgift med rätt `touches`
(se förslaget i `tasks/proposed/`).

**Övrigt:** Sidan öppnas från Inställningar. Ingen ny flik, eftersom flikraden redan har fyra flikar på en
smal skärm. Radlayouten ligger inline i `src/ui/stats.ts`, eftersom `style.css` inte ingår i `touches`.
"Tid spelat" är aktiv speltid (`timeMs`). Offline-tid räknas inte, och det står på sidan.
