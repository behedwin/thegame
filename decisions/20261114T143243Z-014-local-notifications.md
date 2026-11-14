# Beslut: Lokala notiser (task 014)

**D1 – Nytt beroende: `@capacitor/local-notifications` ^8.3.1** (2026-11-14)

- **Namn och version:** `@capacitor/local-notifications` `^8.3.1` (senaste 8.x, släppt 2026-08-19, peer
  `@capacitor/core >=8`). Det matchar övriga Capacitor-paket (8.x).
- **Varför:** Uppgiften kräver notiser som visas när appen är stängd. Det går bara via Androids
  `AlarmManager`/`NotificationManager`, och pluginet är det officiella sättet att nå dem från webblagret.
  Notiserna schemaläggs helt på enheten. Pluginet har ingen nätverksfunktion och ingen push-server.
- **Alternativ:** `@capacitor/push-notifications` (kräver Firebase och nätverk – HÅRT STOPP), egen Java-kod
  med `AlarmManager` (mer egen brygga att underhålla och testa utan enhet) eller Web Notifications API
  (fungerar inte när WebView inte kör).

**D2 – Exakta alarm tas bort ur manifestet** (2026-11-14)

Pluginet begär `SCHEDULE_EXACT_ALARM`. Google Play begränsar den behörigheten till alarm- och kalenderappar,
och notiserna här behöver inte minutprecision. Manifestet tar därför bort den med `tools:node="remove"`.
Pluginet faller då tillbaka på inexakta alarm. `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` och `WAKE_LOCK`
från pluginet ligger kvar (behövs för att visa notiser och för att behålla dem efter omstart).

**D3 – Av som standard, bara i appen, behörighet först när spelaren slår på** (2026-11-14)

Båda notiserna (`notifyOfflineCap`, `notifySeason`) är av i nya spel och i migrerade sparfiler (v3 → v4).
Reglagen visas bara i Android-appen (`Capacitor.isNativePlatform()`), eftersom webben inte kan visa notiser
när sidan är stängd. Android 13+ frågar om behörighet först när spelaren slår på ett reglage. Nekar spelaren
förblir reglaget av och en kort toast förklarar varför. Spelet frågar aldrig av sig självt.

**D4 – När notiserna schemaläggs** (2026-11-14)

Notiserna schemaläggs när spelet göms (`visibilitychange` → hidden och `pagehide`) och tas bort när spelet
syns igen och vid start. Därför kommer ingen notis medan man spelar. Offlinetaket planeras till
`nu + offlineCapMs` och bara om spelet producerar något. Säsongsnotisen planeras till kl. 10 lokal tid på
nästa säsongs första dag (aldrig mitt i natten). Texterna är sakliga och utan stress ("har börjat",
"tar en paus tills du tittar in"), i linje med VISION.md.
