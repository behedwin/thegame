import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, Decimal, prestige, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const ready = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  runEarned: new Decimal('4e9'),
  totalEarned: new Decimal('4e9'),
  ...over,
});

describe('year summary compares KP with last school year (task 083)', () => {
  it('prestige keeps the finished year\'s KP as last year', () => {
    const next = prestige(ready({ runEarned: new Decimal('5e9') }));
    expect(next.lastYearEarned.eq('5e9')).toBe(true);
    expect(next.runEarned.eq(0)).toBe(true);
  });

  it('is null in the first school year and when last year is 0', () => {
    expect(yearSummary(ready()).kpDiffPct).toBeNull();
    expect(yearSummary(ready({ prestiges: 1, lastYearEarned: new Decimal(0) })).kpDiffPct).toBeNull();
  });

  it('gives a rounded percentage: positive, negative and zero', () => {
    expect(yearSummary(ready({ prestiges: 1, runEarned: new Decimal('5.4e9'), lastYearEarned: new Decimal('4e9') })).kpDiffPct).toBe(35);
    expect(yearSummary(ready({ prestiges: 2, runEarned: new Decimal('3e9'), lastYearEarned: new Decimal('4e9') })).kpDiffPct).toBe(-25);
    expect(yearSummary(ready({ prestiges: 1, lastYearEarned: new Decimal('4e9') })).kpDiffPct).toBe(0);
  });

  it('formats the percentage in Swedish', () => {
    expect(T.prestige.summaryPct(35)).toBe(' (+35 %)');
    expect(T.prestige.summaryPct(-25)).toBe(' (−25 %)');
    expect(T.prestige.summaryPct(0)).toBe(' (±0 %)');
  });

  it('does not mutate its input', () => {
    const s = ready({ prestiges: 1, lastYearEarned: new Decimal('1e9') });
    const before = JSON.stringify(s);
    prestige(s);
    yearSummary(s);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('last year KP save (task 083)', () => {
  it('migrates older saves to zero', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(16);
    expect(migrate({ version: 15, runEarned: '5' }, MIGRATIONS, 16)).toMatchObject({ version: 16, lastYearEarned: '0' });
  });

  it('round-trips and repairs bad values', () => {
    const s = ready({ lastYearEarned: new Decimal('3.5e9') });
    expect(deserialize(serialize(s), 0).lastYearEarned.eq('3.5e9')).toBe(true);
    for (const v of ['x', -1, null, 'NaN']) {
      const bad = JSON.parse(serialize(s));
      bad.lastYearEarned = v;
      expect(deserialize(JSON.stringify(bad), 0).lastYearEarned.eq(0)).toBe(true);
    }
  });
});
