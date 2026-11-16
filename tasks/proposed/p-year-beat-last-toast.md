---
id: p-year-beat-last-toast
size: S
status: proposed
touches: [src/ui/main.ts, src/ui/toasts.ts, src/content/texts.ts]
depends: [106]
---

# Toast när läsåret slår förra läsårets KP

*Varför (VISION, lång loop och personliga mål):* 106 visar förra läsårets KP i statistiken, men spelaren
måste själv öppna den för att se när målet passeras. En kort toast ("Nytt rekord: du har passerat förra
läsårets KP!") i det ögonblick `runEarned` går förbi `lastYearEarned` gör det personliga målet till en
belöning mitt i läsåret. Ingen balansändring och inget nytt sparfält: toasten visas en gång per läsår,
när värdet korsar gränsen mellan två renderingar (bara från andra läsåret, och inte om `lastYearEarned` är 0).

Kontrollera vilka filer som sköter toasts innan uppgiften skapas och justera `touches`.

## Tester
- Enhet: en ren hjälpare `passedLastYear(prev, next)` som bara ger true vid korsningen, aldrig första läsåret.
- e2e: en sparning strax under förra läsårets KP visar toasten efter några klick. Inga konsolfel.
