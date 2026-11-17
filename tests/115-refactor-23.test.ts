import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { trophyGroups } from '../src/ui/achievements';
import { renderToasts } from '../src/ui/render-toasts';
import { nextStreakTrophy } from '../src/ui/stats';

const fresh = (): GameState => createInitialState(0);
const streak = ACHIEVEMENTS.flatMap((a) => (a.condition.kind === 'eventStreak' ? [{ id: a.id, n: a.condition.n }] : []));
const ids = (list: { def: { id: string } }[]) => list.map((t) => t.def.id);

describe('nextStreakTrophy (115, from 111)', () => {
  it('there are several streak trophies to step through', () => {
    expect(streak.length).toBeGreaterThan(1);
  });

  it('is the lowest threshold in a new game', () => {
    expect(nextStreakTrophy(fresh())).toBe(Math.min(...streak.map((s) => s.n)));
  });

  it('ignores trophies that are not streak trophies', () => {
    const other = ACHIEVEMENTS.filter((a) => a.condition.kind !== 'eventStreak').map((a) => a.id);
    expect(nextStreakTrophy({ ...fresh(), achievements: other })).toBe(nextStreakTrophy(fresh()));
  });

  it('picks the lowest locked threshold even when a higher one is unlocked', () => {
    const sorted = [...streak].sort((a, b) => a.n - b.n);
    const highest = sorted[sorted.length - 1]!;
    expect(nextStreakTrophy({ ...fresh(), achievements: [highest.id] })).toBe(sorted[0]!.n);
    expect(nextStreakTrophy({ ...fresh(), achievements: [sorted[0]!.id, highest.id] })).toBe(sorted.length > 2 ? sorted[1]!.n : null);
  });

  it('is null once every streak trophy is unlocked', () => {
    expect(nextStreakTrophy({ ...fresh(), achievements: streak.map((s) => s.id) })).toBeNull();
  });
});

describe('trophyGroups (115, from 113)', () => {
  it('puts every trophy in exactly one group, taken in registry order (locked order: 121)', () => {
    const half = ACHIEVEMENTS.filter((_, i) => i % 2 === 0).map((a) => a.id);
    const g = trophyGroups({ ...fresh(), achievements: half });
    expect(ids(g.taken)).toEqual(half);
    expect(ids(g.locked).sort()).toEqual(ACHIEVEMENTS.map((a) => a.id).filter((id) => !half.includes(id)).sort());
  });

  it('has nothing taken in a new game and nothing locked when all are unlocked', () => {
    expect(trophyGroups(fresh()).taken).toEqual([]);
    expect(trophyGroups({ ...fresh(), achievements: ACHIEVEMENTS.map((a) => a.id) }).locked).toEqual([]);
  });

  it('labels taken trophies as done and locked ones with progress or nothing', () => {
    const g = trophyGroups({ ...fresh(), achievements: [ACHIEVEMENTS[0]!.id] });
    expect(g.taken.map((t) => t.label)).toEqual([T.achievements.done]);
    for (const t of g.locked) expect(t.label).not.toBe(T.achievements.done);
  });

  it('shows the streak count as progress on a locked streak trophy', () => {
    const first = [...streak].sort((a, b) => a.n - b.n)[0]!;
    const g = trophyGroups({ ...fresh(), eventStreak: 3 });
    const label = g.locked.find((t) => t.def.id === first.id)?.label;
    expect(label).toContain(String(first.n));
  });
});

describe('renderToasts year records (115)', () => {
  const year = (earned: number, last: number, best: number): GameState => ({
    ...fresh(),
    prestiges: 1,
    runEarned: new Decimal(earned),
    lastYearEarned: new Decimal(last),
    bestRunEarned: new Decimal(best),
  });

  it('shows only the bigger record when both are passed at once', () => {
    expect(renderToasts(year(900, 1000, 1000), year(1100, 1000, 1000), null)).toEqual([T.toastBestYear]);
  });

  it('shows last year alone when the best year is still ahead', () => {
    expect(renderToasts(year(900, 1000, 2000), year(1100, 1000, 2000), null)).toEqual([T.toastBeatLastYear]);
  });

  it('puts the year record before the tier toast', () => {
    const t = renderToasts(year(900, 1000, 2000), year(1100, 1000, 2000), 1);
    expect(t).toEqual([T.toastBeatLastYear, T.hubTierUp(T.hubTiers[1] ?? '')]);
  });
});
