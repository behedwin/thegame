// Celebration moments: milestone confetti, "signed" stamps and the New school year transition.
import type { Decimal } from '../core/state';
import { countUp, motionOk, reducedMotion } from './fx';

const EFFECTS = {
  buy: ['press', 'burst'], bulkBuy: ['press', 'bigBurst'], milestone: ['sheen', 'stamp', 'confetti'],
  customer: ['stamp', 'shake'], prestige: ['overlay', 'zoom'],
} as const;
export type Celebration = keyof typeof EFFECTS;
const MOTION: readonly string[] = ['burst', 'bigBurst', 'confetti', 'shake', 'zoom'];
/** The effects a celebration plays; reduced motion keeps only the calm ones. */
export const effectsFor = (c: Celebration, reduced = false): string[] => EFFECTS[c].filter((e) => !reduced || !MOTION.includes(e));
export const [MAX_CONFETTI, CONFETTI_MS] = [80, 1200];
export interface Bit { x: number; y: number; vx: number; vy: number; age: number; life: number; hue: number }
export const spawnConfetti = (n: number, x: number, y: number, rng: () => number): Bit[] =>
  Array.from({ length: Math.min(n, MAX_CONFETTI) }, () => {
    const [a, v] = [-Math.PI / 2 + (rng() - 0.5) * 2.2, 0.35 + rng() * 0.45]; // v in px per ms
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: 800 + rng() * (CONFETTI_MS - 800), hue: rng() * 360 };
  });
/** Advance dt ms with gravity; drop bits that are dead or below the screen. Pure. */
export const stepConfetti = (bits: readonly Bit[], dt: number, height: number): Bit[] =>
  bits.map((b) => ({ ...b, x: b.x + b.vx * dt, y: b.y + b.vy * dt, vy: b.vy + 0.0012 * dt, age: b.age + dt })).filter((b) => b.age < b.life && b.y < height + 10);

const mk = <K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text = ''): HTMLElementTagNameMap[K] =>
  Object.assign(document.createElement(tag), { className: cls, textContent: text });
let [canvas, bits]: [HTMLCanvasElement | null, Bit[]] = [null, []];

/** One shared confetti canvas; a new burst joins the running one. Nothing runs while hidden. */
export function confetti(x: number, y: number, n = 70): void {
  if (!motionOk()) return;
  bits = bits.concat(spawnConfetti(n, x, y, Math.random)).slice(-MAX_CONFETTI);
  if (canvas) return;
  const c = (canvas = mk('canvas', 'confetti'));
  [c.dataset.testid, c.width, c.height] = ['confetti', innerWidth, innerHeight];
  document.body.append(c);
  const g = c.getContext('2d');
  let last = performance.now();
  const frame = (now: number): void => {
    [bits, last] = [document.hidden ? [] : stepConfetti(bits, Math.min(50, now - last), c.height), now];
    g?.clearRect(0, 0, c.width, c.height);
    for (const b of g ? bits : []) [g!.globalAlpha, g!.fillStyle] = [1 - b.age / b.life, `hsl(${b.hue} 80% 62%)`], g!.fillRect(b.x, b.y, 7, 4);
    if (bits.length) requestAnimationFrame(frame);
    else (c.remove(), (canvas = null));
  };
  requestAnimationFrame(frame);
}

/** Restart a one-shot CSS class animation on el. */
export function flashClass(el: Element | null | undefined, cls: string, ms: number): void {
  el?.classList.remove(cls), void (el as HTMLElement | null)?.offsetWidth, el?.classList.add(cls);
  setTimeout(() => el?.classList.remove(cls), ms);
}

/** A stamp ("×2", "Påskrivet!") that lands on el and fades. */
export const stamp = (el: HTMLElement, text: string): void => {
  const s = el.appendChild(mk('span', 'stamp', text));
  setTimeout(() => s.remove(), 1100);
};

/** Full-screen New school year moment (≤ 2 s, tap to skip); merits roll up, the map zooms out and back. */
export function yearTransition(title: string, merits: Decimal, done: () => void): void {
  const [o, num, hero] = [mk('div', 'celebrate'), mk('strong', '', '0'), document.querySelector('.hero')];
  o.dataset.testid = 'year-transition';
  o.append(mk('h2', '', title), num);
  document.body.append(o);
  countUp(num, merits.mul(0), merits, reducedMotion() ? 0 : 1000);
  hero?.classList.toggle('reset', !reducedMotion());
  const close = (): void => {
    if (o.isConnected) (o.remove(), hero?.classList.remove('reset'), done());
  };
  o.addEventListener('click', close);
  setTimeout(close, 1800);
}
