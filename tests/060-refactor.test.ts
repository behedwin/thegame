// Refactor #12 (060): the hero's two sizes (057, 059) live in one module (src/ui/hero.ts) with one CSS
// block, plus stronger tests for the changelog grouping.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as fx from '../src/ui/fx';
import { COMPACT_AT, compactFloatSpot, HERO_COMPACT_PX, HERO_FX, heroMode, MAX_COMPACT_FLOATS } from '../src/ui/hero';
import { groupByDay } from '../src/ui/changelog';

const css = readFileSync(new URL('../src/ui/style.css', import.meta.url), 'utf8');

describe('hero.ts: everything about the compact strip in one place', () => {
  it('fx.ts keeps only generic effects', () => {
    for (const name of ['heroMode', 'COMPACT_AT', 'compactFloatSpot', 'MAX_COMPACT_FLOATS']) expect(fx).not.toHaveProperty(name);
  });

  it('the strip height in TS matches .hero.compact in style.css', () => {
    const m = /\.hero\.compact\s*\{[^}]*height:\s*(\d+)px/.exec(css);
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBe(HERO_COMPACT_PX);
  });

  it('all compact rules sit in one contiguous block of style.css', () => {
    const lines = css.split('\n');
    const hits = lines.flatMap((l, i) => (/\.compact\b|rise-compact/.test(l) ? [i] : []));
    expect(hits.length).toBeGreaterThan(5);
    const block = lines.slice(hits[0], hits[hits.length - 1]! + 1);
    // Only compact rules, their comments and the keyframes body in between: no unrelated selectors.
    for (const l of block) expect(l).toMatch(/compact|^\s*(\/\*|\*|[^{]*\*\/|\d+%|to\s*\{|\})|^\s*"/);
  });

  it('effects are smaller in the compact strip than on the big map', () => {
    expect(HERO_FX.compact.ripple).toBeLessThan(HERO_FX.big.ripple);
    expect(HERO_FX.compact.spread).toBeLessThan(HERO_FX.big.spread);
    expect(HERO_FX.big).toEqual({ ripple: 1.7, spread: 1 });
  });

  it('keeps the 057 and 059 behaviour', () => {
    expect(heroMode(COMPACT_AT + 1, 'big', 1000, 150)).toBe('compact');
    expect(heroMode(0, 'compact', 1000, 150)).toBe('big');
    expect(compactFloatSpot({ right: 80, cy: 48 }, 390, MAX_COMPACT_FLOATS, () => 0.5)).toBeNull();
  });
});

describe('groupByDay', () => {
  it('groups by date in the given (newest-first) order and keeps undated entries together', () => {
    const list = [
      { id: '060', title: 'a', date: '2026-11-20' },
      { id: '059', title: 'b', date: '2026-11-20' },
      { id: '058', title: 'c', date: '2026-11-19' },
      { id: '041', title: 'd' },
      { id: '040', title: 'e' },
    ];
    expect(groupByDay(list).map(([d, es]) => [d, es.map((e) => e.id)])).toEqual([
      ['2026-11-20', ['060', '059']],
      ['2026-11-19', ['058']],
      ['', ['041', '040']],
    ]);
  });

  it('returns nothing for an empty list and does not mutate its input', () => {
    expect(groupByDay([])).toEqual([]);
    const list = Object.freeze([{ id: '001', title: 'x', date: '2026-01-01' }]);
    expect(groupByDay(list)[0]![1]).toEqual([...list]);
  });
});
