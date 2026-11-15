import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { ACHIEVEMENTS, EVENTS } from '../src/content/registry';
import {
  boostedEvent,
  claimEvent,
  createInitialState,
  Decimal,
  eventEffect,
  isMet,
  progress,
  shownEventStreak,
  spawnEvent,
  type GameState,
} from '../src/core';
import { deserialize, migrate, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const lumpEvent = EVENTS.find((e) => e.effect.kind === 'lump')!;

/** A busy mid-game state, so several counters sit between 0 and their thresholds. */
function busy(): GameState {
  return {
    ...fresh(),
    clicks: 120,
    eventsClaimed: 7,
    prestiges: 2,
    ticketsAnswered: 13,
    totalEarned: new Decimal(1e6),
    focusesPlayed: ['x'],
  };
}

describe('isMet and progress agree (070)', () => {
  for (const [name, s] of [['fresh', fresh()], ['busy', busy()]] as const) {
    it(`for every achievement in a ${name} state`, () => {
      for (const a of ACHIEVEMENTS) {
        const p = progress(s, a.condition);
        if (p) expect(isMet(s, a.condition), a.id).toBe(p.have >= p.need);
      }
    });
  }

  it('value thresholds have no progress but still unlock', () => {
    const c = { kind: 'totalEarned', kp: 100 } as const;
    expect(progress(fresh(), c)).toBeNull();
    expect(isMet(fresh(), c)).toBe(false);
    expect(isMet({ ...fresh(), totalEarned: new Decimal(100) }, c)).toBe(true);
    expect(progress(fresh(), { kind: 'kps', kp: 1 })).toBeNull();
  });
});

describe('boostedEvent (070)', () => {
  it('returns the same object without a streak bonus', () => {
    expect(boostedEvent(fresh(), lumpEvent)).toBe(lumpEvent);
  });

  it('carries the boosted effect with a streak bonus, without mutating the definition', () => {
    const before = JSON.stringify(lumpEvent);
    const s = { ...fresh(), eventStreak: BALANCE.events.streak.min };
    const b = boostedEvent(s, lumpEvent);
    expect(b).not.toBe(lumpEvent);
    expect(b.effect).toEqual(eventEffect(s, lumpEvent));
    expect(b.id).toBe(lumpEvent.id);
    expect(JSON.stringify(lumpEvent)).toBe(before);
  });

  it('is what claimEvent reports as given', () => {
    const s = { ...fresh(), eventStreak: BALANCE.events.streak.min + 2 };
    const spawned = spawnEvent(s, lumpEvent);
    expect(claimEvent(spawned).event).toEqual(boostedEvent(spawned, lumpEvent));
  });
});

describe('shownEventStreak (070)', () => {
  it('hides streaks below the minimum and shows them from it', () => {
    const { min } = BALANCE.events.streak;
    expect(shownEventStreak({ ...fresh(), eventStreak: 0 })).toBe(0);
    expect(shownEventStreak({ ...fresh(), eventStreak: min - 1 })).toBe(0);
    expect(shownEventStreak({ ...fresh(), eventStreak: min })).toBe(min);
    expect(shownEventStreak({ ...fresh(), eventStreak: min + 5 })).toBe(min + 5);
  });
});

describe('save hardening (070)', () => {
  it('migrates a v10 save through both new steps', () => {
    const m = migrate({ version: 10 });
    expect(m.version).toBe(SAVE_VERSION);
    expect(m).toMatchObject({ focusesPlayed: [], eventStreak: 0, eventOpen: false });
  });

  it('round-trips streak fields', () => {
    const s = { ...fresh(), eventStreak: 4, eventOpen: true };
    const back = deserialize(serialize(s), 10_000);
    expect(back.eventStreak).toBe(4);
    expect(back.eventOpen).toBe(true);
  });

  it('sanitises bad streak values', () => {
    for (const bad of [-3, 1.5, 'x', null, Number.NaN]) {
      const raw = { ...JSON.parse(serialize(fresh())), eventStreak: bad, eventOpen: 'yes' };
      const back = deserialize(JSON.stringify(raw), 10_000);
      expect(back.eventStreak).toBe(0);
      expect(back.eventOpen).toBe(false);
    }
  });
});
