import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/content/registry';
import { claimEvent, createInitialState, Decimal, prestige, spawnEvent, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const event = EVENTS[0]!;
const solve = (s: GameState): GameState => claimEvent(spawnEvent({ ...s, nextEventAtMs: 0 }, event)).state;
const miss = (s: GameState): GameState => ({ ...spawnEvent(s, event), activeEvent: null });
const newYear = (s: GameState): GameState =>
  prestige({ ...s, runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9') });

describe('year streak counts only this school year (task 107)', () => {
  it('a streak running over a new year counts from the new year in the year record', () => {
    let s = fresh();
    for (let i = 0; i < 5; i++) s = solve(s);
    s = newYear(s);
    expect(s.yearStreakBase).toBe(5);
    expect(s.yearBestStreak).toBe(0);
    s = solve(s);
    expect(s.eventStreak).toBe(6); // the bonus streak carries on
    expect(s.yearBestStreak).toBe(1);
    expect(s.bestEventStreak).toBe(6);
    s = solve(s);
    expect(s.yearBestStreak).toBe(2);
  });

  it('a broken streak resets the base', () => {
    let s = fresh();
    for (let i = 0; i < 5; i++) s = solve(s);
    s = newYear(s);
    s = solve(s);
    s = miss(s);
    // The miss is noticed when the next event spawns: both the streak and the base start over.
    s = spawnEvent(s, event);
    expect(s.eventStreak).toBe(0);
    expect(s.yearStreakBase).toBe(0);
    s = claimEvent(s).state;
    for (let i = 0; i < 2; i++) s = solve(s);
    expect(s.eventStreak).toBe(3);
    expect(s.yearBestStreak).toBe(3);
  });

  it('starts at zero in a new game', () => {
    expect(createInitialState(0).yearStreakBase).toBe(0);
  });
});

describe('save (task 107)', () => {
  it('migrates older saves to a zero base', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(20);
    expect(migrate({ version: 19, eventStreak: 4 }, MIGRATIONS, 20)).toMatchObject({ version: 20, eventStreak: 4, yearStreakBase: 0 });
  });

  it('survives save and load', () => {
    const s = { ...fresh(), eventStreak: 7, yearStreakBase: 5 };
    expect(deserialize(serialize(s), 0).yearStreakBase).toBe(5);
  });

  it('never loads a base above the running streak', () => {
    const raw = JSON.parse(serialize({ ...fresh(), eventStreak: 2, yearStreakBase: 2 }));
    expect(deserialize(JSON.stringify({ ...raw, yearStreakBase: 9 }), 0).yearStreakBase).toBe(2);
  });
});
