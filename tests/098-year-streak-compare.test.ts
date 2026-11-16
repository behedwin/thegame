import { describe, expect, it } from 'vitest';
import { createInitialState, Decimal, prestige, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const ready = (s: GameState): GameState => ({ ...s, runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9') });

describe('year streak compared with last year (task 098)', () => {
  it('starts at zero', () => {
    expect(fresh().lastYearBestStreak).toBe(0);
  });

  it('prestige keeps this year streak as last year streak', () => {
    const s = ready({ ...fresh(), yearBestStreak: 6 });
    const next = prestige(s);
    expect(next.lastYearBestStreak).toBe(6);
    expect(next.yearBestStreak).toBe(0);
  });

  it('does not mutate its input', () => {
    const s = ready({ ...fresh(), yearBestStreak: 6 });
    const before = JSON.stringify(s);
    prestige(s);
    yearSummary(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('has no diff in the first school year', () => {
    expect(yearSummary({ ...fresh(), yearBestStreak: 7 }).bestStreakDiff).toBeNull();
  });

  it('diffs against last year from the second school year', () => {
    const s = { ...fresh(), prestiges: 1, yearBestStreak: 7, lastYearBestStreak: 5 };
    expect(yearSummary(s).bestStreakDiff).toBe(2);
    expect(yearSummary({ ...s, yearBestStreak: 3 }).bestStreakDiff).toBe(-2);
  });
});

describe('last year streak save (task 098)', () => {
  it('migrates older saves to zero', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(19);
    expect(migrate({ version: 18, yearBestStreak: 4 }, MIGRATIONS, 19)).toMatchObject({ version: 19, yearBestStreak: 4, lastYearBestStreak: 0 });
  });

  it('round-trips and repairs bad values', () => {
    const s = { ...fresh(), lastYearBestStreak: 5 };
    expect(deserialize(serialize(s), 0).lastYearBestStreak).toBe(5);
    for (const v of ['x', -3, 1.5, null]) {
      const bad = JSON.parse(serialize(s));
      bad.lastYearBestStreak = v;
      expect(deserialize(JSON.stringify(bad), 0).lastYearBestStreak).toBe(0);
    }
  });
});
