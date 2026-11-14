---
id: p-lifetime-records
size: S
status: proposed
touches: [src/core/state.ts, src/core/actions.ts, src/core/bulk.ts, src/save/, src/ui/stats.ts, src/content/texts.ts]
depends: [013]
---

# Rekord på statistiksidan

Lägg till "Bästa läsår (KP)" och "Köp totalt" på statistiksidan (013). Det är nya livstidsfält som ska
överleva `prestige()`, så de kräver en migrering (v3 → v4). Motivering: fler långsiktiga mål för spelare
som har kört många läsår, utan att balansen påverkas. Tester: migreringen, prestige behåller fälten,
bulk-köp räknar rätt antal och raderna syns i `statRows`.
