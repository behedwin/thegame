import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState) => statRows(s).find((r) => r.label === T.stats.currentStreak)?.value;
const streakIds = (max: number) =>
  ACHIEVEMENTS.filter((a) => a.condition.kind === 'eventStreak' && a.condition.n <= max).map((a) => a.id);

describe('stats: next streak trophy (111)', () => {
  it('texts show the next threshold only when given', () => {
    expect(T.stats.currentStreakValue(3, 5)).toBe('3 🔥 (nästa trofé vid 5)');
    expect(T.stats.currentStreakValue(3, null)).toBe('3 🔥');
  });

  it('shows the first threshold (5) in a new game', () => {
    expect(value(fresh())).toBe(T.stats.currentStreakValue(0, 5));
  });

  it('shows the visible streak only', () => {
    expect(value({ ...fresh(), eventStreak: 1 })).toBe(T.stats.currentStreakValue(0, 5));
    expect(value({ ...fresh(), eventStreak: 3 })).toBe(T.stats.currentStreakValue(3, 5));
  });

  it('moves to 10 once the 5 trophy is unlocked', () => {
    expect(value({ ...fresh(), eventStreak: 6, achievements: streakIds(5) })).toBe(T.stats.currentStreakValue(6, 10));
  });

  it('has no threshold once all streak trophies are unlocked', () => {
    expect(value({ ...fresh(), eventStreak: 22, achievements: streakIds(Infinity) })).toBe(T.stats.currentStreakValue(22, null));
  });

  it('sits right after this year\'s longest streak', () => {
    const labels = statRows(fresh()).map((r) => r.label);
    expect(labels.indexOf(T.stats.currentStreak)).toBe(labels.indexOf(T.stats.yearBestStreak) + 1);
  });
});
