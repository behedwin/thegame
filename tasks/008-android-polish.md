---
id: 008
size: M
status: ready
touches: [android/app/src/main/AndroidManifest.xml, android/app/src/main/java/, android/app/capacitor.build.gradle, android/capacitor.settings.gradle, android/variables.gradle, capacitor.config.ts, package.json, package-lock.json, src/ui/app.ts, src/ui/dialogs.ts, src/ui/style.css]
depends: [005]
---

# Android-polish

- Tillbaka-knappen stänger dialoger eller frågar innan appen stängs (`@capacitor/app`, nytt beroende som ska
  dokumenteras i decisions/).
- Statusbar- och navbar-färg, låst porträttläge, ingen textmarkering eller zoom.
- Ta bort INTERNET-behörigheten om appen fungerar utan den (se decisions/, D15). Verifiera på en enhet eller
  skriv i PR:en att det inte gick.
