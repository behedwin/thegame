import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { checkAchievements, createInitialState, type GameState } from '../src/core';
import { isMet, progress } from '../src/core/achievements';

const streakTrophies = ACHIEVEMENTS.filter((a) => a.condition.kind === 'eventStreak');
const fresh = (): GameState => createInitialState(0);

describe('event streak trophies (task 074)', () => {
  it('has three trophies for streaks of 5, 10 and 20', () => {
    expect(streakTrophies.map((a) => (a.condition as { n: number }).n)).toEqual([5, 10, 20]);
  });

  it('unlock from the best streak, even after the current streak broke', () => {
    const s = { ...fresh(), eventStreak: 0, bestEventStreak: 10 };
    const unlocked = checkAchievements(s).achievements;
    const ids = streakTrophies.map((a) => a.id);
    expect(unlocked).toContain(ids[0]);
    expect(unlocked).toContain(ids[1]);
    expect(unlocked).not.toContain(ids[2]);
  });

  it('do not unlock from the current streak alone', () => {
    const s = { ...fresh(), eventStreak: 25, bestEventStreak: 4 };
    for (const a of streakTrophies) expect(isMet(s, a.condition)).toBe(false);
  });

  it('show progress that follows the record', () => {
    const top = streakTrophies[2]!;
    expect(progress({ ...fresh(), eventStreak: 0, bestEventStreak: 7 }, top.condition)).toEqual({ have: 7, need: 20 });
    expect(progress({ ...fresh(), bestEventStreak: 30 }, top.condition)).toEqual({ have: 20, need: 20 });
  });
});
