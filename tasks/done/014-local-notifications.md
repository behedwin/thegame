---
id: 014
size: M
status: done
touches: [package.json, package-lock.json, android/, src/ui/notifications.ts, src/ui/app.ts, src/core/state.ts, src/save/, src/content/texts.ts]
depends: [008, 010]
---

# Lokala notiser som spelaren själv slår på

Av som standard: "Offlinetaket är nått" och "Nytt säsongsevent". Kräver `@capacitor/local-notifications`
(dokumenteras i decisions/). Ingen nätverkstrafik och inga manipulativa texter.
