---
id: p-remove-internet-permission
size: S
status: proposed
touches: [android/app/src/main/AndroidManifest.xml, decisions/]
depends: []
---

# Ta bort INTERNET-behörigheten efter test på en enhet

Spelet gör aldrig nätverksanrop (D14), och Capacitor serverar filerna lokalt via `WebViewAssetLoader`.
Behörigheten borde därför kunna tas bort, vilket stärker löftet "ingen datainsamling" i Play-listningen.
Ingen worker kan verifiera det (ingen enhet i molnet), så ägaren behöver testa det:

1. Ta bort `<uses-permission android:name="android.permission.INTERNET" />` och lägg till
   `xmlns:tools` med `<uses-permission android:name="android.permission.INTERNET" tools:node="remove" />` så att
   inget bibliotek lägger tillbaka den.
2. `npm run android:sync` och installera på en enhet (gärna både Android 15+ och en äldre version).
3. Kontrollera att spelet laddar, sparar, laddar om och vibrerar. `aapt dump permissions` på APK:n ska inte
   lista INTERNET.
4. Uppdatera D15 i decisions/.
