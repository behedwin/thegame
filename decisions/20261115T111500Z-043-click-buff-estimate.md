# 043: Uppskattat värde för klickbuffar

**Beslut:** valen i inkorgen visar för buffar ungefär vad de är värda i KP med dagens takt ("≈ +600 KP"), så
att de går att jämföra med en klump. För `prodMult` är det `KP/s × (mult − 1) × sekunder`. För `clickMult`
räknas det med en antagen klicktakt på **3 klick/s**, och det står i texten ("vid 3 klick/s").

**Varför:** utan en siffra går en klickbuff inte att väga mot en klump, och det är hela poängen med ärendena.
3 klick/s är ett lugnt, uthålligt tempo på mobil (inte maxtempo), så siffran lovar inte för mycket. Att takten
står utskriven gör uppskattningen ärlig: spelaren ser att den beror på hur mycket man klickar.

**Var:** konstanten `T.effect.clicksPerSec` i `src/content/texts.ts` (UI-antagande, inte spelregel; därför inte
i `src/core/` eller `balance.ts`). Uppskattningen räknas i UI-lagret (`src/ui/inbox.ts`).

**Utelämnas** när värdet är under 1 KP (t.ex. ingen produktion än), eftersom "≈ +0 KP" vore missvisande.

**Alternativ:** utelämna uppskattningen för klickbuffar helt (gör dem ojämförbara), eller mäta spelarens
faktiska klicktakt (kräver nytt tillstånd och blir instabilt). Valdes bort.
