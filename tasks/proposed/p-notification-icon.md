---
id: p-notification-icon
size: S
status: proposed
touches: [android/app/src/main/res/, capacitor.config.ts]
depends: [014]
---

# Egen monokrom notisikon

Lokala notiser (014) använder pluginets standardikon i statusfältet. Android kräver en vit, monokrom ikon
(`ic_stat_*`), annars syns en grå ruta på vissa telefoner. Lägg till en vektorikon (navet från appikonen) och
sätt `plugins.LocalNotifications.smallIcon` och `iconColor` i `capacitor.config.ts`. Test: ikonfilen finns och
konfigurationen pekar på den. Behöver kontrolleras på en enhet.
