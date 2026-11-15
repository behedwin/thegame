// Refactor #13 (065): one helper for summed levels, the map's geometry as a pure function, and one CSS
// custom property for where the compact strip's content starts.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createInitialState, isMet, totalLevels, yearSummary } from '../src/core';
import { CHIP_H, COMPACT_H, COMPACT_ROWS, compactWidth, compactYs, mapGeo } from '../src/ui/network';

const css = readFileSync(new URL('../src/ui/style.css', import.meta.url), 'utf8');

describe('totalLevels', () => {
  it('sums every level and is 0 for an empty map', () => {
    expect(totalLevels({})).toBe(0);
    expect(totalLevels({ csv: 5, sftp: 2, api: 0 })).toBe(7);
  });

  it('drives the total conditions and the year summary alike', () => {
    const s = { ...createInitialState(0), automations: { csv: 3, sftp: 1 }, upgrades: { a: 2, b: 2 } };
    expect(isMet(s, { kind: 'automationsTotal', n: 4 })).toBe(true);
    expect(isMet(s, { kind: 'automationsTotal', n: 5 })).toBe(false);
    expect(isMet(s, { kind: 'upgradesTotal', n: 4 })).toBe(true);
    expect(isMet(s, { kind: 'upgradesTotal', n: 5 })).toBe(false);
    expect(yearSummary(s).integrations).toBe(totalLevels(s.automations));
  });

  it('does not mutate its input', () => {
    const map = { a: 1, b: 2 };
    totalLevels(map);
    expect(map).toEqual({ a: 1, b: 2 });
  });
});

describe('mapGeo', () => {
  it('is the big map when not compact, whatever the size', () => {
    const big = mapGeo(false, 360, 300);
    expect(big).toEqual({ w: 360, h: 300, nodeW: 98, compact: false });
    expect(mapGeo(false, 900, 96)).toEqual(big);
  });

  it('keeps the big map while the strip has no height yet', () => {
    expect(mapGeo(true, 300, 0)).toEqual(mapGeo(false, 0, 0));
  });

  it('fills the strip edge to edge with chips', () => {
    const g = mapGeo(true, 322, 96);
    expect(g.compact).toBe(true);
    expect(g.h).toBe(COMPACT_H);
    expect(g.w).toBe(compactWidth(322 / 96));
    expect(g.nodeW).toBeLessThan(mapGeo(false, 0, 0).nodeW);
  });

  it('compact rows keep a whole chip inside the strip', () => {
    for (let n = 1; n <= COMPACT_ROWS; n++) {
      for (const y of compactYs(n, COMPACT_H)) {
        expect(y - CHIP_H / 2).toBeGreaterThanOrEqual(0);
        expect(y + CHIP_H / 2).toBeLessThanOrEqual(COMPACT_H);
      }
    }
  });
});

describe('compact strip CSS', () => {
  it('the map and the event card start at the same --strip-left', () => {
    expect(css).toMatch(/\.hero\.compact\s*\{[^}]*--strip-left:\s*\d+px/);
    expect(css).toMatch(/\.hero\.compact \.network\s*\{[^}]*margin-left:\s*var\(--strip-left\)/);
    expect(css).toMatch(/\.hero\.compact \.event-slot\s*\{[^}]*left:\s*var\(--strip-left\)/);
  });

  it('the strip offset clears SYNKA (left + width of the compact hub)', () => {
    const strip = Number(/--strip-left:\s*(\d+)px/.exec(css)![1]);
    const hub = /\.hero\.compact \.hub\s*\{[^}]*left:\s*(\d+)px;[^}]*width:\s*(\d+)px/.exec(css)!;
    expect(strip).toBeGreaterThanOrEqual(Number(hub[1]) + Number(hub[2]));
  });
});
