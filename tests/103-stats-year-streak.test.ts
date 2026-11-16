import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState) => statRows(s).find((r) => r.label === T.stats.yearBestStreak)?.value;

describe('stats: this year\'s longest streak (103)', () => {
  it('texts show last year only when given', () => {
    expect(T.stats.yearStreakValue(4, null)).toBe('4 🔥');
    expect(T.stats.yearStreakValue(4, 6)).toBe('4 🔥 (förra läsåret 6)');
  });

  it('shows only this year in the first school year', () => {
    expect(value({ ...fresh(), yearBestStreak: 3, lastYearBestStreak: 0 })).toBe('3 🔥');
  });

  it('adds last year from the second school year', () => {
    const s = { ...fresh(), prestiges: 1, yearBestStreak: 4, lastYearBestStreak: 6 };
    expect(value(s)).toBe('4 🔥 (förra läsåret 6)');
    expect(value({ ...s, lastYearBestStreak: 0 })).toBe('4 🔥 (förra läsåret 0)');
  });

  it('sits right after the lifetime longest streak', () => {
    const labels = statRows(fresh()).map((r) => r.label);
    expect(labels.indexOf(T.stats.yearBestStreak)).toBe(labels.indexOf(T.stats.bestEventStreak) + 1);
  });
});
