---
id: p-record-toast-fanfare
size: S
status: proposed
touches: [src/ui/app.ts, src/ui/render-toasts.ts]
depends: [110]
---

# Fanfar och vibration när läsåret slår förra läsårets KP

*Varför (VISION, retention och "juice"):* 109 visar en toast när läsåret passerar förra läsårets KP, men den
låter och känns som vilken annan toast som helst. Troféer får redan `sfx.fanfare()`. En kort fanfar och en
lätt vibration (när ljud och vibration är på i inställningarna) gör rekordet till ett ögonblick som
spelaren lägger märke till även med blicken på en annan flik. Ingen balansändring och inget nytt sparfält.

## Vad som ska göras
- Låt `renderToasts` (110) säga vilka toasts som är rekord, t.ex. `{ text, fanfare: boolean }`, så att
  `app.ts` spelar `sfx.fanfare()` och `haptic` en gång per rendering, inte en gång per toast.
- Navets nivå-toast behåller dagens beteende.

## Tester
- Enhet: `renderToasts` markerar bara årsrekordet som fanfar; inget på första renderingen.
- Befintliga e2e för 109 fortsätter att vara gröna.
