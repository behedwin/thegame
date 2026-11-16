import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, MERITS } from '../src/content/registry';
import {
  canPrestige,
  checkAchievements,
  createInitialState,
  Decimal,
  fastestYearRecord,
  isMet,
  nearestAchievement,
  newAchievements,
  prestige,
  prestigeUnlocked,
  progress,
  runKpForMerits,
  startingAutomations,
  yearSummary,
  type GameState,
} from '../src/core';

const MIN = 60_000;
const base = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), ...over });
const ready = (over: Partial<GameState> = {}): GameState =>
  base({ runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9'), ...over });

describe('fastestYearRecord (095)', () => {
  it('is null before the first finished year and the stored value after', () => {
    expect(fastestYearRecord(base())).toBeNull();
    expect(fastestYearRecord(base({ fastestYearMs: 0 }))).toBeNull();
    expect(fastestYearRecord(base({ fastestYearMs: 25 * MIN }))).toBe(25 * MIN);
  });

  it('matches the record prestige writes', () => {
    const next = prestige(ready({ timeMs: 40 * MIN }));
    expect(fastestYearRecord(next)).toBe(40 * MIN);
  });
});

describe('school year time and record (095)', () => {
  it('a year exactly as fast as the record is not a new record and keeps it', () => {
    const s = ready({ prestiges: 1, yearStartMs: 10 * MIN, timeMs: 40 * MIN, fastestYearMs: 30 * MIN });
    expect(yearSummary(s).fastestYear).toBe(false);
    expect(prestige(s).fastestYearMs).toBe(30 * MIN);
  });

  it('chains records over several years', () => {
    let s = ready({ timeMs: 50 * MIN });
    s = prestige(s);
    expect(s.fastestYearMs).toBe(50 * MIN);
    s = prestige({ ...s, runEarned: new Decimal('4e9'), timeMs: s.timeMs + 35 * MIN });
    expect(s.fastestYearMs).toBe(35 * MIN);
    s = prestige({ ...s, runEarned: new Decimal('4e9'), timeMs: s.timeMs + 60 * MIN });
    expect(s.fastestYearMs).toBe(35 * MIN);
    expect(s.yearStartMs).toBe(s.timeMs);
    expect(s.prestiges).toBe(3);
  });

  it('does nothing when prestige is not possible', () => {
    const s = base({ timeMs: 99 * MIN });
    expect(canPrestige(s)).toBe(false);
    expect(prestige(s)).toBe(s);
  });

  it('keeps lifetime totals, tickets and settings but resets the run', () => {
    const s = ready({ prestiges: 1, ticketsAnswered: 7, yearTickets: 3, yearEvents: 2, kp: new Decimal(500), upgrades: { x: 1 }, clicks: 42 });
    const next = prestige(s);
    expect(next.kp.eq(0)).toBe(true);
    expect(next.runEarned.eq(0)).toBe(true);
    expect(next.upgrades).toEqual({});
    expect(next.ticketsAnswered).toBe(7);
    expect(next.clicks).toBe(42);
    expect(next.settings).toEqual(s.settings);
    expect(next.lastYearTickets).toBe(3);
    expect(next.lastYearEvents).toBe(2);
    expect(next.yearTickets).toBe(0);
    expect(next.lastYearEarned.eq(s.runEarned)).toBe(true);
    expect(next.totalEarned.eq(s.totalEarned)).toBe(true);
  });

  it('summary compares KP only when last year earned something', () => {
    expect(yearSummary(ready()).kpDiffPct).toBeNull();
    expect(yearSummary(ready({ prestiges: 1, lastYearEarned: new Decimal(0) })).kpDiffPct).toBeNull();
    expect(yearSummary(ready({ prestiges: 1, lastYearEarned: new Decimal('2e9') })).kpDiffPct).toBe(100);
    expect(yearSummary(ready({ prestiges: 1, lastYearEarned: new Decimal('8e9') })).kpDiffPct).toBe(-50);
  });
});

describe('prestige unlock and starting automations (095)', () => {
  it('unlocks the tab at a quarter of the first merit, or after any prestige', () => {
    const quarter = runKpForMerits(1).mul(0.25);
    expect(prestigeUnlocked(base({ runEarned: quarter }))).toBe(true);
    expect(prestigeUnlocked(base({ runEarned: quarter.mul(0.99) }))).toBe(false);
    expect(prestigeUnlocked(base({ prestiges: 1 }))).toBe(true);
  });

  it('starts with no automations without startAutomation merits', () => {
    expect(startingAutomations({})).toEqual({});
  });

  it('adds automations from owned startAutomation merits', () => {
    const m = MERITS.find((d) => d.effect.kind === 'startAutomation');
    expect(m).toBeDefined();
    const autos = startingAutomations({ [m!.id]: 1 });
    const id = m!.effect.kind === 'startAutomation' ? m!.effect.id : '';
    expect(autos[id]).toBeGreaterThan(0);
  });
});

describe('achievements core (095)', () => {
  const clicks = (n: number) => ({ kind: 'clicks', n }) as const;

  it('progress is capped at need and null for value thresholds', () => {
    expect(progress(base({ clicks: 50 }), clicks(10))).toEqual({ have: 10, need: 10 });
    expect(progress(base({ clicks: 3 }), clicks(10))).toEqual({ have: 3, need: 10 });
    expect(progress(base(), { kind: 'totalEarned', kp: 100 })).toBeNull();
    expect(progress(base(), { kind: 'kps', kp: 1 })).toBeNull();
  });

  it('isMet agrees with progress for countable conditions', () => {
    for (const n of [0, 5, 10, 11]) {
      const s = base({ clicks: n });
      const p = progress(s, clicks(10))!;
      expect(isMet(s, clicks(10))).toBe(p.have >= p.need);
    }
  });

  it('totalEarned threshold is inclusive', () => {
    expect(isMet(base({ totalEarned: new Decimal(100) }), { kind: 'totalEarned', kp: 100 })).toBe(true);
    expect(isMet(base({ totalEarned: new Decimal(99) }), { kind: 'totalEarned', kp: 100 })).toBe(false);
  });

  it('checkAchievements returns the same state when nothing new unlocks', () => {
    const s = base();
    expect(checkAchievements(s)).toBe(s);
    const once = checkAchievements(base({ clicks: 1_000_000 }));
    expect(checkAchievements(once)).toBe(once);
  });

  it('newAchievements lists only the new ones, in content order', () => {
    const before = base({ achievements: [] });
    const after = checkAchievements(base({ clicks: 1_000_000, fastestYearMs: 5 * MIN }));
    const fresh = newAchievements(before, after);
    expect(fresh.length).toBe(after.achievements.length);
    const order = fresh.map((a) => ACHIEVEMENTS.indexOf(a));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(newAchievements(after, after)).toEqual([]);
  });

  it('nearestAchievement skips unstarted, finished and owned trophies and picks the highest ratio', () => {
    const list = [
      { id: 'a', order: 1, name: 'A', desc: 'a', condition: clicks(100) },
      { id: 'b', order: 2, name: 'B', desc: 'b', condition: clicks(20) },
      { id: 'c', order: 3, name: 'C', desc: 'c', condition: clicks(10) },
      { id: 'd', order: 4, name: 'D', desc: 'd', condition: { kind: 'kps', kp: 1 } },
    ] as const;
    expect(nearestAchievement(base({ clicks: 0 }), list)).toBeNull();
    expect(nearestAchievement(base({ clicks: 15 }), list)?.def.id).toBe('b'); // c is already reached
    expect(nearestAchievement(base({ clicks: 15, achievements: ['b'] }), list)?.def.id).toBe('a');
  });

  it('nearestAchievement keeps content order on ties', () => {
    const list = [
      { id: 'x', order: 1, name: 'X', desc: 'x', condition: clicks(20) },
      { id: 'y', order: 2, name: 'Y', desc: 'y', condition: { kind: 'prestiges', n: 2 } },
    ] as const;
    expect(nearestAchievement(base({ clicks: 10, prestiges: 1 }), list)?.def.id).toBe('x');
  });
});
