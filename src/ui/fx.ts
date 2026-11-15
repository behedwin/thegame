// Small, cheap visual effects: particle bursts, ripples and rolling numbers.
// Only transform/opacity are animated; nothing runs with reduced motion or while the app is hidden.
import type { Decimal } from '../core/state';
import { fmt } from './format';

/** At most this many effect nodes (particles, rings, floating numbers) live in a layer at once. */
export const MAX_FX = 40;

export const easeOutCubic = (t: number): number => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Value shown at progress t (0..1) of a roll from `from` to `to`; exactly `to` at the end. */
export function rollValue(from: Decimal, to: Decimal, t: number): Decimal {
  if (t >= 1) return to;
  return from.add(to.sub(from).mul(easeOutCubic(t)));
}

/** True when an increase is big enough (> 5 %) to make the counter bounce. */
export const bigJump = (from: Decimal, to: Decimal): boolean => to.gt(from.mul(1.05));

export interface Particle { dx: number; dy: number; rot: number; scale: number; ms: number }

/** Evenly spread directions with a little jitter; distances 28–60 px, lifetimes 420–600 ms. */
export function burstGeometry(n: number, rng: () => number): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((i + rng() * 0.6) / n) * Math.PI * 2;
    const dist = 28 + rng() * 32;
    return { dx: Math.cos(a) * dist, dy: Math.sin(a) * dist, rot: rng() * 180 - 90, scale: 0.4 + rng() * 0.4, ms: 420 + rng() * 180 };
  });
}

/** Remove the oldest children until at most `max` remain. */
export function trimLayer(layer: Element, max = MAX_FX): void {
  while (layer.childElementCount > max) layer.firstElementChild?.remove();
}

export function reducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Effects run only when motion is welcome and the app is on screen. */
export const motionOk = (): boolean => !reducedMotion() && document.visibilityState !== 'hidden';

/** An absolutely placed effect node at (x, y) in `layer`. */
export function fxNode(layer: HTMLElement, cls: string, x: number, y: number): HTMLElement {
  const d = document.createElement('span');
  d.className = cls;
  d.style.left = `${x}px`;
  d.style.top = `${y}px`;
  layer.append(d);
  return d;
}

/** 6–12 small "data packets" that fly out from (x, y) and fade. */
export function burst(layer: HTMLElement, x: number, y: number, opts: { count?: number; rng?: () => number; spread?: number } = {}): void {
  if (!motionOk()) return;
  const n = Math.min(12, Math.max(6, opts.count ?? 8));
  const k = opts.spread ?? 1;
  for (const p of burstGeometry(n, opts.rng ?? Math.random)) {
    const d = fxNode(layer, 'fx-p', x, y);
    const end = `translate(calc(-50% + ${(p.dx * k).toFixed(1)}px), calc(-50% + ${(p.dy * k).toFixed(1)}px)) rotate(${p.rot.toFixed(0)}deg) scale(${p.scale.toFixed(2)})`;
    d.animate([{ transform: 'translate(-50%, -50%)', opacity: 1 }, { transform: end, opacity: 0 }], {
      duration: p.ms, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards',
    }).onfinish = () => d.remove();
  }
  trimLayer(layer);
}

/** A ring that grows out from the centre of `el` (drawn in `layer`) and fades. */
export function ripple(el: HTMLElement, layer: HTMLElement, scale = 1.7): void {
  if (!motionOk()) return;
  const r = el.getBoundingClientRect();
  const l = layer.getBoundingClientRect();
  const d = fxNode(layer, 'fx-ring', r.left - l.left + r.width / 2, r.top - l.top + r.height / 2);
  d.style.width = d.style.height = `${r.width}px`;
  d.animate([{ transform: 'translate(-50%, -50%) scale(0.9)', opacity: 0.6 }, { transform: `translate(-50%, -50%) scale(${scale})`, opacity: 0 }], {
    duration: 500, easing: 'ease-out', fill: 'forwards',
  }).onfinish = () => d.remove();
  trimLayer(layer);
}

/** In the compact strip (059) at most this many "+KP" numbers fly at once; extra taps show none. */
export const MAX_COMPACT_FLOATS = 3;
/** Room kept for the number's own width so it never runs off the right edge. */
const FLOAT_ROOM = 64;

export interface FloatSpot { x: number; y: number; dx: number }

/** Where a "+KP" number starts (its left edge) and how far right it drifts in the compact strip (059):
 * just right of SYNKA (`hub.right`, layer px) and away from it, clamped to the layer's width. Null when
 * `active` numbers already fly. */
export function compactFloatSpot(hub: { right: number; cy: number }, width: number, active: number, rng: () => number): FloatSpot | null {
  if (active >= MAX_COMPACT_FLOATS) return null;
  const max = Math.max(0, width - FLOAT_ROOM);
  const x = Math.min(max, Math.max(0, hub.right + 8 + rng() * 16));
  const y = hub.cy - 8 + rng() * 16;
  const dx = Math.min(12 + rng() * 12, max - x);
  return { x, y, dx };
}

const rolls = new WeakMap<HTMLElement, { shown: Decimal; target: Decimal; raf: number }>();

/** The value an element currently shows, if it is driven by countUp. */
export const shownValue = (el: HTMLElement): Decimal | undefined => rolls.get(el)?.shown;

/** Roll the number in `el` smoothly from `from` to `to`. Decreases and reduced motion switch at once. */
export function countUp(el: HTMLElement, from: Decimal, to: Decimal, ms: number): void {
  const prev = rolls.get(el);
  if (prev?.target.eq(to)) return;
  if (prev) cancelAnimationFrame(prev.raf);
  const roll = { shown: from, target: to, raf: 0 };
  rolls.set(el, roll);
  if (ms <= 0 || !to.gt(from) || !motionOk()) {
    roll.shown = to;
    el.textContent = fmt(to);
    return;
  }
  if (bigJump(prev?.target ?? from, to)) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  const start = performance.now();
  const step = (now: number): void => {
    const t = (now - start) / ms;
    roll.shown = rollValue(from, to, t);
    el.textContent = fmt(roll.shown);
    if (t < 1) roll.raf = requestAnimationFrame(step);
  };
  roll.raf = requestAnimationFrame(step);
}

export type HeroMode = 'big' | 'compact';
/** The list must be scrolled past this many px before the map shrinks (057). */
export const COMPACT_AT = 24;

/** Map size from the shop list's scroll (057). Compact past COMPACT_AT, big again only at the very top,
 * so it never flickers around the threshold. `room` is how far the list can scroll and `shrink` how much
 * taller it gets when the map shrinks: without room to stay scrolled it would snap back, so it stays big. */
export function heroMode(scrollTop: number, mode: HeroMode, room: number, shrink: number): HeroMode {
  if (mode === 'compact') return scrollTop <= 0 ? 'big' : 'compact';
  return scrollTop > COMPACT_AT && room - shrink > COMPACT_AT ? 'compact' : 'big';
}
