import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { checkAchievements, createInitialState, isMet, progress, type GameState } from '../src/core';

const MIN = 60_000;
const withFastest = (ms: number): GameState => ({ ...createInitialState(1_000), fastestYearMs: ms });

describe('fastestYear condition', () => {
  const c = { kind: 'fastestYear', maxMs: 15 * MIN } as const;

  it('holds for a record at or under maxMs', () => {
    expect(isMet(withFastest(15 * MIN), c)).toBe(true);
    expect(isMet(withFastest(9 * MIN), c)).toBe(true);
  });

  it('does not hold without a record (0) or with a slow year', () => {
    expect(isMet(withFastest(0), c)).toBe(false);
    expect(isMet(withFastest(15 * MIN + 1), c)).toBe(false);
    expect(isMet(withFastest(42 * MIN), c)).toBe(false);
  });

  it('is a value threshold, not a countable one', () => {
    expect(progress(withFastest(10 * MIN), c)).toBeNull();
  });
});

describe('Expresskörning trophy', () => {
  const def = ACHIEVEMENTS.find((a) => a.id === 'expresskorning');

  it('exists with Swedish text and a limit faster than a normal first year (30–90 min)', () => {
    expect(def).toBeDefined();
    expect(def!.name).toBe('Expresskörning');
    expect(def!.desc).toMatch(/läsår/);
    expect(def!.condition.kind).toBe('fastestYear');
    const maxMs = def!.condition.kind === 'fastestYear' ? def!.condition.maxMs : 0;
    expect(maxMs).toBeGreaterThan(0);
    expect(maxMs).toBeLessThan(30 * MIN);
  });

  it('unlocks after a fast school year but not with no record or a slow one', () => {
    expect(checkAchievements(withFastest(0)).achievements).not.toContain('expresskorning');
    expect(checkAchievements(withFastest(40 * MIN)).achievements).not.toContain('expresskorning');
    expect(checkAchievements(withFastest(12 * MIN)).achievements).toContain('expresskorning');
  });

  it('does not mutate its input', () => {
    const s = withFastest(12 * MIN);
    const before = [...s.achievements];
    checkAchievements(s);
    expect(s.achievements).toEqual(before);
  });
});
