import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  anyNewAutomationAffordable, anyUpgradeAffordable, claimEvent, createInitialState, Decimal, prestige, shownEventStreak,
  spawnEvent, visibleStreak, yearSummary, type GameState,
} from '../src/core';
import { statRows } from '../src/ui/stats';

const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const event = EVENTS[0]!;
const MIN = BALANCE.events.streak.min;

/** Spawn and immediately solve one event. */
const solve = (s: GameState): GameState => claimEvent(spawnEvent({ ...s, nextEventAtMs: 0 }, event)).state;
/** Spawn an event and let it run out unsolved. */
const miss = (s: GameState): GameState => ({ ...spawnEvent(s, event), activeEvent: null });

describe('visibleStreak (task 100)', () => {
  it('hides streaks below the minimum and shows the rest as is', () => {
    expect(visibleStreak(0)).toBe(0);
    expect(visibleStreak(MIN - 1)).toBe(0);
    expect(visibleStreak(MIN)).toBe(MIN);
    expect(visibleStreak(MIN + 4)).toBe(MIN + 4);
  });

  it('is what the event card and the year summary both use', () => {
    const s = { ...fresh(), eventStreak: MIN + 1, yearBestStreak: MIN - 1 };
    expect(shownEventStreak(s)).toBe(MIN + 1);
    expect(yearSummary(s).bestStreak).toBe(0);
    expect(yearSummary({ ...s, yearBestStreak: MIN }).bestStreak).toBe(MIN);
  });
});

describe('event streak bookkeeping (task 100)', () => {
  it('counts solved events in a row into the run, year and lifetime records', () => {
    let s = fresh();
    for (let i = 0; i < 4; i++) s = solve(s);
    expect(s.eventStreak).toBe(4);
    expect(s.yearBestStreak).toBe(4);
    expect(s.bestEventStreak).toBe(4);
    expect(s.yearEvents).toBe(4);
  });

  it('starts over after a missed event but keeps the records', () => {
    let s = fresh();
    for (let i = 0; i < 3; i++) s = solve(s);
    s = miss(s);
    s = solve(s);
    expect(s.eventStreak).toBe(1);
    expect(s.yearBestStreak).toBe(3);
    expect(s.bestEventStreak).toBe(3);
  });

  it('a new year resets the year record but not the lifetime one', () => {
    let s = fresh();
    for (let i = 0; i < 5; i++) s = solve(s);
    s = prestige({ ...s, runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9') });
    expect(s.yearBestStreak).toBe(0);
    expect(s.lastYearBestStreak).toBe(5);
    expect(s.bestEventStreak).toBe(5);
    // The running streak itself carries over into the new year (current behaviour, see journal 100).
    expect(s.eventStreak).toBe(5);
    s = solve(s);
    expect(s.yearBestStreak).toBe(6);
    expect(s.bestEventStreak).toBe(6);
  });
});

describe('yearSummary comparisons (task 100)', () => {
  const second = (over: Partial<GameState>): GameState => ({ ...fresh(), prestiges: 1, ...over });

  it('has no comparisons at all in the first school year', () => {
    const s = yearSummary({ ...fresh(), runEarned: new Decimal(500), yearEvents: 3, yearTickets: 2, yearBestStreak: 4 });
    expect(s.kpDiffPct).toBeNull();
    expect(s.eventsDiff).toBeNull();
    expect(s.ticketsDiff).toBeNull();
    expect(s.bestStreakDiff).toBeNull();
    expect(s.fastestYear).toBe(false);
  });

  it('has no KP percentage when last year earned nothing', () => {
    expect(yearSummary(second({ runEarned: new Decimal(100), lastYearEarned: new Decimal(0) })).kpDiffPct).toBeNull();
  });

  it('rounds the KP percentage, up and down', () => {
    const pct = (now: number, last: number) =>
      yearSummary(second({ runEarned: new Decimal(now), lastYearEarned: new Decimal(last) })).kpDiffPct;
    expect(pct(150, 100)).toBe(50);
    expect(pct(50, 100)).toBe(-50);
    expect(pct(100, 100)).toBe(0);
    expect(pct(1, 3)).toBe(-67);
  });

  it('diffs events and tickets against last year, also when equal', () => {
    const s = yearSummary(second({ yearEvents: 4, lastYearEvents: 4, yearTickets: 1, lastYearTickets: 3 }));
    expect(s.eventsDiff).toBe(0);
    expect(s.ticketsDiff).toBe(-2);
  });

  it('flags a new fastest year only when it beats a stored record', () => {
    const s = second({ yearStartMs: 0, timeMs: 1_000, fastestYearMs: 2_000 });
    expect(yearSummary(s).fastestYear).toBe(true);
    expect(yearSummary({ ...s, timeMs: 3_000 }).fastestYear).toBe(false);
  });
});

describe('tab dots share one rule (task 100)', () => {
  it('nothing is affordable at the start', () => {
    expect(anyUpgradeAffordable(fresh())).toBe(false);
    expect(anyNewAutomationAffordable(fresh())).toBe(false);
  });

  it('something new is affordable with plenty of KP', () => {
    const rich = { ...fresh(), kp: new Decimal('1e12') };
    expect(anyUpgradeAffordable(rich)).toBe(true);
    expect(anyNewAutomationAffordable(rich)).toBe(true);
  });
});

describe('statRows (task 100)', () => {
  it('formats KP rows with the currency and keeps the row order', () => {
    const rows = statRows({ ...fresh(), totalEarned: new Decimal(1234) });
    expect(rows[0]!.label).toBe(T.stats.totalEarned);
    expect(rows[0]!.value).toContain(T.currency);
    expect(rows.at(-1)!.label).toBe(T.stats.timePlayed);
    expect(rows.find((r) => r.label === T.stats.schoolYears)!.value).toBe('1');
    expect(rows.some((r) => r.label === T.stats.fastestYear)).toBe(false);
  });
});
