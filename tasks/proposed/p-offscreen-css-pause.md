---
id: p-offscreen-css-pause
size: S
status: proposed
touches: [src/ui/network.ts, src/ui/style.css]
depends: [049]
---

# Pausa även CSS-animationerna i nätverksbilden när den inte syns

049 stoppar paketen när nätverksytan är utanför skärmen, men CSS-animationerna (de streckade linjerna
`.net-line.active`, navets snurr och hjärtslag på höga nivåer) fortsätter. Låt `NetworkView` sätta en klass
(t.ex. `offscreen`) på svg:n från samma `IntersectionObserver`, och lägg till
`.network.offscreen * { animation-play-state: paused; }` i stilmallen. Ingen ändring i `src/core/`.

*Varför (VISION, mobil):* samma batteriskäl som 049, för det som ännu rör sig.

Tester: e2e som flyttar bort `.hero` och kontrollerar att `.network` får klassen och att
`getComputedStyle(...).animationPlayState` på en aktiv linje är `paused`, och att den släpps när ytan syns igen.
