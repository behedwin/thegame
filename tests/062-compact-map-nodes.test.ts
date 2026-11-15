import { describe, expect, it } from 'vitest';
import { COMPACT_H, COMPACT_ROWS, compactWidth, compactYs, pickCompactRows, systemAbbr } from '../src/ui/network';
import { SYSTEMS } from '../src/content/registry';
import { T } from '../src/content/texts';

describe('062 systemAbbr', () => {
  it('two words give two initials', () => {
    expect(systemAbbr('Gurgel Klassrum')).toBe('GK');
    expect(systemAbbr('Mikromjuk Delpoäng')).toBe('MD');
    expect(systemAbbr('Päron Skolchef')).toBe('PS');
  });
  it('one word gives its first two letters', () => {
    expect(systemAbbr('Betygsvalvet')).toBe('BE');
    expect(systemAbbr('itsforgetting')).toBe('IT');
  });
  it('handles punctuation, digits, dashes and odd names', () => {
    expect(systemAbbr('Examen.nej')).toBe('EN');
    expect(systemAbbr('Kaputt!')).toBe('KA');
    expect(systemAbbr('Skola 9–15')).toBe('S9');
    expect(systemAbbr('Sambo-federationen')).toBe('SF');
    expect(systemAbbr('  ')).toBe('?');
    expect(systemAbbr('X')).toBe('X');
  });
  it('every system gets a 1–3 character abbreviation', () => {
    for (const s of SYSTEMS) expect(systemAbbr(s.name)).toMatch(/^.{1,3}$/u);
  });
});

describe('062 pickCompactRows', () => {
  it('shows the rows with most owned integrations, in map order, and counts the rest', () => {
    expect(pickCompactRows([5, 0, 20, 1, 8], 3)).toEqual({ shown: [0, 2, 4], more: 1 });
    expect(pickCompactRows([20, 15, 10, 8, 5, 3], 3)).toEqual({ shown: [0, 1, 2], more: 3 });
  });
  it('shows all owned rows when they fit', () => {
    expect(pickCompactRows([0, 2, 0, 1], 3)).toEqual({ shown: [1, 3], more: 0 });
  });
  it('ties keep the newer integration', () => {
    expect(pickCompactRows([4, 4, 4, 4], 2)).toEqual({ shown: [2, 3], more: 2 });
  });
  it('with nothing owned shows the first row', () => {
    expect(pickCompactRows([0, 0], 3)).toEqual({ shown: [0], more: 0 });
    expect(pickCompactRows([], 3)).toEqual({ shown: [], more: 0 });
  });
  it('defaults to COMPACT_ROWS', () => {
    expect(pickCompactRows([1, 1, 1, 1, 1, 1, 1]).shown).toHaveLength(COMPACT_ROWS);
  });
});

describe('062 compact geometry', () => {
  it('rows fit inside the strip with room for the chips', () => {
    for (let n = 1; n <= COMPACT_ROWS; n++) {
      const ys = compactYs(n, COMPACT_H);
      expect(ys).toHaveLength(n);
      for (const y of ys) {
        expect(y - 11).toBeGreaterThanOrEqual(0);
        expect(y + 11).toBeLessThanOrEqual(COMPACT_H);
      }
    }
    expect(compactYs(1, COMPACT_H)).toEqual([COMPACT_H / 2]);
  });
  it('the compact map is as wide as the strip (no letterboxing), never narrower than 300 units', () => {
    expect(compactWidth(322 / 96)).toBe(Math.round((COMPACT_H * 322) / 96));
    expect(compactWidth(1)).toBe(300);
  });
  it('the "+N" label is Swedish UI text from texts.ts', () => {
    expect(T.netMore(3)).toBe('+3');
  });
});
