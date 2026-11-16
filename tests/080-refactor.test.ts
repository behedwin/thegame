import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { ACHIEVEMENTS, EVENTS } from '../src/content/registry';
import {
  brokenStreak, claimEvent, createInitialState, Decimal, nearestAchievement, prestige, progress, spawnEvent, tick, yearSummary, type GameState,
} from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const ev = EVENTS[0]!;
const ready = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  runEarned: new Decimal('4e9'),
  totalEarned: new Decimal('4e9'),
  ...over,
});

describe('nearestAchievement in core (task 080)', () => {
  it('is null in a fresh game, where nothing is started', () => {
    expect(nearestAchievement(createInitialState(0))).toBeNull();
  });

  it('is null when every countable trophy is unlocked', () => {
    const s = { ...createInitialState(0), clicks: 5, achievements: ACHIEVEMENTS.map((a) => a.id) };
    expect(nearestAchievement(s)).toBeNull();
  });

  it('agrees with progress() for the real content and never picks a finished one', () => {
    const s = { ...createInitialState(0), clicks: 3, eventsClaimed: 1, ticketsAnswered: 4 };
    const got = nearestAchievement(s);
    expect(got).not.toBeNull();
    expect(progress(s, got!.def.condition)).toEqual({ have: got!.have, need: got!.need });
    expect(got!.have).toBeLessThan(got!.need);
  });

  it('does not mutate its input', () => {
    const s = { ...createInitialState(0), clicks: 3 };
    const before = JSON.stringify(s);
    nearestAchievement(s);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('school year counters across several years (task 080)', () => {
  it('last year is always the year just finished, never a running total', () => {
    const y1 = prestige(ready({ yearEvents: 4, yearTickets: 9 }));
    const y2 = prestige({ ...y1, runEarned: new Decimal('4e9'), yearEvents: 6, yearTickets: 2 });
    expect(y2.prestiges).toBe(2);
    expect(y2.lastYearEvents).toBe(6);
    expect(y2.lastYearTickets).toBe(2);
    expect(yearSummary({ ...y2, yearEvents: 1, yearTickets: 2 })).toMatchObject({ eventsDiff: -5, ticketsDiff: 0 });
  });

  it('a solved event counts for the running year and shows in the diff', () => {
    const y1 = prestige(ready({ yearEvents: 2 }));
    const solved = claimEvent(spawnEvent({ ...y1, timeMs: 10_000 }, ev)).state;
    expect(solved.yearEvents).toBe(1);
    expect(yearSummary(solved).eventsDiff).toBe(-1);
  });
});

describe('brokenStreak edge cases (task 080)', () => {
  const MIN = BALANCE.events.streak.min;
  const withStreak = (n: number): GameState => ({ ...createInitialState(0), timeMs: 10_000, eventStreak: n });

  it('is 0 when no event was on screen before', () => {
    const s = withStreak(MIN + 3);
    expect(brokenStreak(s, tick(s, 1_000))).toBe(0);
  });

  it('is 0 while the event is still on screen', () => {
    const before = spawnEvent(withStreak(MIN + 3), ev);
    expect(brokenStreak(before, tick(before, 1_000))).toBe(0);
  });

  it('is exactly the minimum when the streak is right at it', () => {
    const before = spawnEvent(withStreak(MIN), ev);
    expect(brokenStreak(before, tick(before, BALANCE.events.visibleMs + 1))).toBe(MIN);
  });
});

describe('save migrations v12 to current (task 080)', () => {
  it('a v12 save gets every counter added since, all valid', () => {
    const out = migrate({ version: 12, eventStreak: 4 }, MIGRATIONS, SAVE_VERSION);
    expect(out).toMatchObject({ version: SAVE_VERSION, bestEventStreak: 4, yearEvents: 0, yearTickets: 0, lastYearEvents: 0, lastYearTickets: 0 });
  });

  it('a played v13 save loads end to end and keeps what it had', () => {
    const raw = JSON.parse(serialize(ready({ eventsClaimed: 9, bestEventStreak: 5, eventStreak: 2 })));
    for (const k of ['yearEvents', 'yearTickets', 'lastYearEvents', 'lastYearTickets']) delete raw[k];
    raw.version = 13;
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.eventsClaimed).toBe(9);
    expect(s.bestEventStreak).toBe(5);
    expect(s.eventStreak).toBe(2);
    expect([s.yearEvents, s.yearTickets, s.lastYearEvents, s.lastYearTickets]).toEqual([0, 0, 0, 0]);
  });

  it('the chain from v1 ends exactly at SAVE_VERSION', () => {
    const out = migrate({ version: 1 }, MIGRATIONS, SAVE_VERSION);
    expect(out.version).toBe(SAVE_VERSION);
    expect(MIGRATIONS[SAVE_VERSION]).toBeUndefined();
  });
});
