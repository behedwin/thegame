// The map area's two sizes (057, 059): big at the top of the shop, a compact strip once the list is
// scrolled. Mode switching, the strip's click effects and its tap-to-expand all live here; the matching
// CSS is the single `.hero.compact` block in style.css.
import { T } from '../content/texts';

export type HeroMode = 'big' | 'compact';
/** The list must be scrolled past this many px before the map shrinks (057). */
export const COMPACT_AT = 24;
/** Height of the compact strip; tests check it against `.hero.compact` in style.css. */
export const HERO_COMPACT_PX = 96;

/** Map size from the shop list's scroll (057). Compact past COMPACT_AT, big again only at the very top,
 * so it never flickers around the threshold. `room` is how far the list can scroll and `shrink` how much
 * taller it gets when the map shrinks: without room to stay scrolled it would snap back, so it stays big. */
export function heroMode(scrollTop: number, mode: HeroMode, room: number, shrink: number): HeroMode {
  if (mode === 'compact') return scrollTop <= 0 ? 'big' : 'compact';
  return scrollTop > COMPACT_AT && room - shrink > COMPACT_AT ? 'compact' : 'big';
}

/** Click effect sizes per mode (059): the ripple's end scale and how far the burst flies. */
export const HERO_FX: Readonly<Record<HeroMode, { ripple: number; spread: number }>> = {
  big: { ripple: 1.7, spread: 1 },
  compact: { ripple: 1.3, spread: 0.6 },
};

/** In the compact strip at most this many "+KP" numbers fly at once; extra taps show none. */
export const MAX_COMPACT_FLOATS = 3;
/** Room kept for the number's own width so it never runs off the right edge. */
const FLOAT_ROOM = 64;

export interface FloatSpot { x: number; y: number; dx: number }
/** SYNKA's right edge and vertical centre, in float-layer px. */
export interface HubAnchor { right: number; cy: number }

/** Where a "+KP" number starts (its left edge) and how far right it drifts in the compact strip (059):
 * just right of SYNKA and away from it, clamped to the layer's width. Null when `active` numbers already fly. */
export function compactFloatSpot(hub: HubAnchor, width: number, active: number, rng: () => number): FloatSpot | null {
  if (active >= MAX_COMPACT_FLOATS) return null;
  const max = Math.max(0, width - FLOAT_ROOM);
  const x = Math.min(max, Math.max(0, hub.right + 8 + rng() * 16));
  const y = hub.cy - 8 + rng() * 16;
  const dx = Math.min(12 + rng() * 12, max - x);
  return { x, y, dx };
}

export interface Box { left: number; top: number; right: number; bottom: number }

/** Whether a point lies in a box (edges included); an empty box (hidden element) never hits (087). */
export function pointInRect(r: Box, x: number, y: number): boolean {
  return r.right > r.left && r.bottom > r.top && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

/** An element that does not take pointer events itself but shows something when its spot in the strip is tapped. */
export interface HeroTapSpot { el: HTMLElement; tap: () => void }

/** Owns the hero's size: follows the shop panel's scroll and expands on a tap on the strip. */
export class HeroSize {
  mode: HeroMode = 'big';

  /** `keep` are the elements whose taps do their own thing (SYNKA, the event card) and never expand. */
  /** `spot` is checked by position (it has no pointer events), so a tap on it in the strip shows its tip (087). */
  constructor(
    private readonly hero: HTMLElement,
    private readonly panel: HTMLElement,
    private readonly keep: readonly Node[],
    spot?: HeroTapSpot,
  ) {
    panel.addEventListener('scroll', () => this.sync(), { passive: true });
    hero.addEventListener('click', (e) => {
      // The path is fixed at dispatch, so a tap on the event card still counts as "kept" after the claim
      // has already removed the card from the slot (061).
      const path = e.composedPath();
      if (this.mode !== 'compact' || keep.some((k) => path.includes(k))) return;
      if (spot && pointInRect(spot.el.getBoundingClientRect(), e.clientX, e.clientY)) {
        spot.tap();
        return;
      }
      panel.scrollTop = 0;
      this.set('big');
    });
  }

  /** Re-check the mode against the panel's current scroll (after scrolling or a tab switch). */
  sync(): void {
    const { panel, hero } = this;
    this.set(heroMode(panel.scrollTop, this.mode, panel.scrollHeight - panel.clientHeight, hero.offsetHeight - HERO_COMPACT_PX));
  }

  /** Click effect sizes for the current mode. */
  get fx(): (typeof HERO_FX)[HeroMode] {
    return HERO_FX[this.mode];
  }

  /** In the strip, where SYNKA sits relative to the hero, so "+KP" starts beside it; otherwise undefined. */
  hubAnchor(hub: HTMLElement): HubAnchor | undefined {
    if (this.mode !== 'compact') return undefined;
    const rect = this.hero.getBoundingClientRect();
    const hr = hub.getBoundingClientRect();
    return { right: hr.right - rect.left, cy: hr.top - rect.top + hr.height / 2 };
  }

  private set(mode: HeroMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    const compact = mode === 'compact';
    this.hero.classList.toggle('compact', compact);
    // aria-label, not title (061): the browser's title tooltip covered the event card on desktop.
    if (compact) this.hero.setAttribute('aria-label', T.heroExpand);
    else this.hero.removeAttribute('aria-label');
  }
}
