---
id: p-e2e-local-chromium
size: S
status: proposed
touches: [playwright.config.ts, docs/]
depends: []
---

# e2e hittar en förinstallerad Chromium via en miljövariabel

I molnmiljön saknas Playwrights egen webbläsarversion, så `npm run e2e` (och därmed `npm run gates`) faller
innan något test körs. Workers har hittills kört e2e med en tillfällig lokal config som pekar på den
förinstallerade Chromium (se journalerna för 064 och 065). Det är omständligt och lätt att glömma.

Låt `playwright.config.ts` läsa en valfri miljövariabel (t.ex. `PW_CHROMIUM_PATH`) och i så fall sätta
`use.launchOptions.executablePath`. Utan variabeln är beteendet exakt som i dag, så grinden blir inte
svagare: samma tester, samma enhet och samma krav på konsolfel och extern trafik. Beskriv variabeln kort i
`docs/`.

Motivering: gör kvalitetsgrinden körbar i alla miljöer utan handpåläggning, så att varje PR verkligen
körs igenom alla grindar före push. Ingen spelarsynlig ändring (`changelog: false`).

## Tester
- `tests/<id>-*.test.ts`: config utan variabeln har ingen `executablePath`; med variabeln satt pekar den dit.
- `npm run e2e` grön lokalt (utan variabel) och i molnet (med variabel).
