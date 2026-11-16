import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, prestige, type GameState } from '../src/core';
import { passedBestYear } from '../src/core/prestige';
import { renderToasts } from '../src/ui/render-toasts';

const year = (earned: number, best = 2000, last = 1000, prestiges = 1): GameState => ({
  ...createInitialState(0),
  prestiges,
  runEarned: new Decimal(earned),
  bestRunEarned: new Decimal(best),
  lastYearEarned: new Decimal(last),
});

describe('passing the best school year (112)', () => {
  it('is true only when this year crosses the best year', () => {
    expect(passedBestYear(year(1900), year(2001))).toBe(true);
    expect(passedBestYear(year(2000), year(2001))).toBe(true);
    expect(passedBestYear(year(1900), year(2000))).toBe(false);
    expect(passedBestYear(year(1500), year(1900))).toBe(false);
  });

  it('is false when the value was already above', () => {
    expect(passedBestYear(year(2001), year(3000))).toBe(false);
  });

  it('is false in the first school year', () => {
    expect(passedBestYear(year(1900, 2000, 0, 0), year(2001, 2000, 0, 0))).toBe(false);
  });

  it('is false when the record is 0', () => {
    expect(passedBestYear(year(0, 0, 0), year(5, 0, 0))).toBe(false);
  });

  it('is false across a new school year', () => {
    expect(passedBestYear(year(1900, 2000, 1000, 1), year(2001, 2000, 1000, 2))).toBe(false);
    const before = year(5000, 2000, 1000, 1);
    expect(passedBestYear(before, prestige(before))).toBe(false);
  });

  it('does not mutate its input', () => {
    const a = year(1900);
    const b = year(2001);
    passedBestYear(a, b);
    expect(a.runEarned.toNumber()).toBe(1900);
    expect(b.runEarned.toNumber()).toBe(2001);
  });

  it('shows only the best-year toast when both records are passed at once', () => {
    expect(renderToasts(year(900, 1000), year(1001, 1000), null)).toEqual([T.toastBestYear]);
  });

  it("keeps last year's toast when only that is passed", () => {
    expect(renderToasts(year(900), year(1001), null)).toEqual([T.toastBeatLastYear]);
    expect(renderToasts(year(1900), year(2001), null)).toEqual([T.toastBestYear]);
    expect(renderToasts(null, year(2001), null)).toEqual([]);
  });

  it('has a Swedish toast text', () => {
    expect(T.toastBestYear).toBe('Bästa läsåret hittills!');
  });
});
