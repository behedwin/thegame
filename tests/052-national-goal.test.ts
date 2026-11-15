// Task 052: the national goal ("Hela Sverige på en standard") and one chapter per school year.
import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { CHAPTERS } from '../src/content/registry';
import { chapterFor, chaptersRead, connectedMunicipalities, createInitialState, Decimal, nextYearMunicipalities, type GameState } from '../src/core';

const at = (prestiges: number, total: number | string): Pick<GameState, 'prestiges' | 'totalEarned'> => ({ prestiges, totalEarned: new Decimal(total) });
const GOAL = BALANCE.goal.municipalities;

describe('connectedMunicipalities', () => {
  it('is 0 in a new game', () => {
    expect(connectedMunicipalities(createInitialState(0))).toBe(0);
  });

  it('never decreases with more school years or more earnings', () => {
    const totals = [0, 1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e20, 1e30, 1e100];
    for (let p = 0; p <= 40; p++) {
      for (let i = 1; i < totals.length; i++) {
        expect(connectedMunicipalities(at(p, totals[i]!))).toBeGreaterThanOrEqual(connectedMunicipalities(at(p, totals[i - 1]!)));
        expect(connectedMunicipalities(at(p + 1, totals[i]!))).toBeGreaterThanOrEqual(connectedMunicipalities(at(p, totals[i]!)));
      }
    }
  });

  it('stays within 0..290 and is an integer', () => {
    for (const p of [0, 1, 5, 15, 100, 1e6]) {
      for (const t of [0, 1e10, '1e300', '1e5000']) {
        const n = connectedMunicipalities(at(p, t));
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(GOAL);
      }
    }
    expect(GOAL).toBe(290);
  });

  it('gives sensible values for school years 1, 5 and 10 with sim-like earnings', () => {
    const y1 = connectedMunicipalities(at(0, 1e10));
    const y5 = connectedMunicipalities(at(4, 1e14));
    const y10 = connectedMunicipalities(at(9, 1e18));
    expect(y1).toBeGreaterThan(0);
    expect(y1).toBeLessThan(40);
    expect(y5).toBeGreaterThan(y1 + 50);
    expect(y5).toBeLessThan(200);
    expect(y10).toBeGreaterThan(200);
    expect(y10).toBeLessThan(GOAL);
    expect(connectedMunicipalities(at(14, 1e20))).toBe(GOAL);
  });

  it('previews a positive gain for the next school year until the goal is reached', () => {
    expect(nextYearMunicipalities(at(0, 1e10))).toBeGreaterThan(0);
    expect(nextYearMunicipalities(at(14, 1e20))).toBe(0);
  });

  it('does not mutate its input', () => {
    const s = at(3, 1e12);
    const before = { prestiges: s.prestiges, total: s.totalEarned.toString() };
    connectedMunicipalities(s);
    nextYearMunicipalities(s);
    expect({ prestiges: s.prestiges, total: s.totalEarned.toString() }).toEqual(before);
  });
});

describe('chapters', () => {
  it('has chapters for school years 1-10 with unique order and Swedish text', () => {
    const orders = CHAPTERS.map((c) => c.order);
    for (let y = 1; y <= 10; y++) expect(orders, `läsår ${y}`).toContain(y);
    expect(new Set(orders).size).toBe(orders.length);
    for (const c of CHAPTERS) {
      expect(c.title.trim(), c.id).not.toBe('');
      expect(c.text.trim().length, c.id).toBeGreaterThan(40);
      expect(c.text, c.id).toMatch(/[åäöÅÄÖ]/);
      expect(c.text.split(/[.!?…](\s|$)/).filter((s) => s.trim().length > 1).length, c.id).toBeLessThanOrEqual(4);
    }
  });

  it('finds the chapter of a school year and the chapters read so far', () => {
    expect(chapterFor(1)?.order).toBe(1);
    expect(chapterFor(4)?.order).toBe(4);
    expect(chapterFor(999)).toBeUndefined();
    expect(chaptersRead({ prestiges: 0 }).map((c) => c.order)).toEqual([1]);
    expect(chaptersRead({ prestiges: 3 }).map((c) => c.order)).toEqual([1, 2, 3, 4]);
  });
});
