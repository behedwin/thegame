import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, prestige, type GameState } from '../src/core';
import { passedLastYear } from '../src/core/prestige';

const year = (earned: number, last = 1000, prestiges = 1): GameState => ({
  ...createInitialState(0),
  prestiges,
  runEarned: new Decimal(earned),
  lastYearEarned: new Decimal(last),
});

describe("passing last year's KP (109)", () => {
  it('is true only when this year crosses last year', () => {
    expect(passedLastYear(year(900), year(1001))).toBe(true);
    expect(passedLastYear(year(1000), year(1001))).toBe(true);
    expect(passedLastYear(year(900), year(1000))).toBe(false);
    expect(passedLastYear(year(900), year(950))).toBe(false);
  });

  it('is false when the value was already above', () => {
    expect(passedLastYear(year(1001), year(2000))).toBe(false);
  });

  it('is false in the first school year', () => {
    expect(passedLastYear(year(900, 1000, 0), year(1001, 1000, 0))).toBe(false);
  });

  it('is false when last year earned nothing', () => {
    expect(passedLastYear(year(0, 0), year(5, 0))).toBe(false);
  });

  it('is false across a new school year', () => {
    const before = year(900, 1000, 1);
    expect(passedLastYear(before, { ...year(1001, 1000, 2) })).toBe(false);
    const after = prestige({ ...year(5000, 1000, 1) });
    expect(passedLastYear(year(5000, 1000, 1), after)).toBe(false);
  });

  it('does not mutate its input', () => {
    const a = year(900);
    const b = year(1001);
    passedLastYear(a, b);
    expect(a.runEarned.toNumber()).toBe(900);
    expect(b.runEarned.toNumber()).toBe(1001);
  });

  it('has a Swedish toast text', () => {
    expect(T.toastBeatLastYear).toBe('Nytt rekord: du har passerat förra läsårets KP!');
  });
});
