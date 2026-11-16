import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { claimEvent, createInitialState, Decimal, prestige, spawnEvent, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const event = EVENTS[0]!;
const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const solve = (s: GameState): GameState => claimEvent(spawnEvent(s, event)).state;
const solveN = (s: GameState, n: number): GameState => Array.from({ length: n }).reduce<GameState>((acc) => solve(acc), s);
const min = BALANCE.events.streak.min;

describe('year best streak (task 096)', () => {
  it('starts at zero and follows the streak while solving events', () => {
    const s = fresh();
    expect(s.yearBestStreak).toBe(0);
    expect(solveN(s, 3).yearBestStreak).toBe(3);
  });

  it('keeps the year best when the running streak is lower', () => {
    const s = { ...solveN(fresh(), 4), eventStreak: 0 };
    expect(solve(s).yearBestStreak).toBe(4);
  });

  it('does not mutate its input', () => {
    const s = spawnEvent(fresh(), event);
    const before = JSON.stringify(s);
    claimEvent(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('resets on a new school year while the all-time best stays', () => {
    const s = { ...solveN(fresh(), 5), runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9') };
    const next = prestige(s);
    expect(next.prestiges).toBe(1);
    expect(next.yearBestStreak).toBe(0);
    expect(next.bestEventStreak).toBe(5);
    expect(s.yearBestStreak).toBe(5);
  });

  it('shows in the summary only from the streak minimum', () => {
    expect(yearSummary({ ...fresh(), yearBestStreak: min - 1 }).bestStreak).toBe(0);
    expect(yearSummary({ ...fresh(), yearBestStreak: min }).bestStreak).toBe(min);
    expect(T.prestige.summaryStreak(7)).toBe('Längsta svit i år: 7 🔥');
  });
});

describe('year best streak save (task 096)', () => {
  it('migrates older saves to zero', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(18);
    expect(migrate({ version: 17, eventStreak: 6 }, MIGRATIONS, 18)).toMatchObject({ version: 18, yearBestStreak: 0 });
  });

  it('round-trips and repairs bad values', () => {
    const s = solveN(fresh(), 2);
    expect(deserialize(serialize(s), 0).yearBestStreak).toBe(2);
    for (const v of ['x', -3, 1.5, null]) {
      const bad = JSON.parse(serialize(s));
      bad.yearBestStreak = v;
      expect(deserialize(JSON.stringify(bad), 0).yearBestStreak).toBe(0);
    }
  });
});
