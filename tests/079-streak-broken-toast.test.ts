import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { brokenStreak, claimEvent, createInitialState, spawnEvent, tick, type GameState } from '../src/core';

const ev = EVENTS[0]!;
const MIN = BALANCE.events.streak.min;
const withStreak = (n: number): GameState => ({ ...createInitialState(0), timeMs: 10_000, eventStreak: n });

describe('brokenStreak (task 079)', () => {
  it('reports a visible streak when the event runs out', () => {
    const before = spawnEvent(withStreak(MIN + 2), ev);
    const after = tick(before, BALANCE.events.visibleMs + 1);
    expect(brokenStreak(before, after)).toBe(MIN + 2);
  });

  it('ignores streaks below the minimum', () => {
    const before = spawnEvent(withStreak(MIN - 1), ev);
    expect(brokenStreak(before, tick(before, BALANCE.events.visibleMs + 1))).toBe(0);
  });

  it('ignores a solved event and an unchanged state', () => {
    const before = spawnEvent(withStreak(MIN + 1), ev);
    expect(brokenStreak(before, claimEvent(before).state)).toBe(0);
    expect(brokenStreak(before, before)).toBe(0);
    expect(brokenStreak(before, tick(before, 10))).toBe(0);
  });

  it('does not mutate its input', () => {
    const before = spawnEvent(withStreak(MIN + 2), ev);
    const after = tick(before, BALANCE.events.visibleMs + 1);
    const [b, a] = [JSON.stringify(before), JSON.stringify(after)];
    brokenStreak(before, after);
    expect([JSON.stringify(before), JSON.stringify(after)]).toEqual([b, a]);
  });

  it('has a Swedish toast text with the streak length', () => {
    expect(T.eventStreakBroken(5)).toContain('5');
  });
});
