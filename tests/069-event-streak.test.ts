import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import { claimEvent, createInitialState, Decimal, eventEffect, eventStreakBonus, spawnEvent, tick, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { T } from '../src/content/texts';

const lumpEvent = EVENTS.find((e) => e.effect.kind === 'lump')!;
const buffEvent = EVENTS.find((e) => e.effect.kind === 'prodMult')!;
const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });

/** Spawn and claim one event, then move past the cooldown. */
function solve(s: GameState, def = lumpEvent): GameState {
  const next = claimEvent(spawnEvent(s, def)).state;
  return { ...next, nextEventAtMs: next.timeMs };
}

/** Spawn one event and let it run out. */
function miss(s: GameState): GameState {
  const next = tick(spawnEvent(s, lumpEvent), BALANCE.events.visibleMs + 1);
  return { ...next, nextEventAtMs: next.timeMs };
}

describe('event streak (task 069)', () => {
  it('starts at zero and grows with every solved event', () => {
    let s = fresh();
    expect(s.eventStreak).toBe(0);
    s = solve(s);
    s = solve(s);
    s = solve(s);
    expect(s.eventStreak).toBe(3);
  });

  it('resets when an event runs out, and stays reset only until the next solve', () => {
    let s = solve(solve(solve(fresh())));
    s = miss(s);
    // The miss is noticed when the next event shows up: that card starts a new streak.
    s = spawnEvent(s, lumpEvent);
    expect(s.eventStreak).toBe(0);
    s = claimEvent(s).state;
    expect(s.eventStreak).toBe(1);
  });

  it('gives no bonus below three in a row, then a step per event up to the cap', () => {
    const { min, step, cap } = BALANCE.events.streak;
    expect(min).toBe(3);
    expect(eventStreakBonus(0)).toBe(0);
    expect(eventStreakBonus(min - 1)).toBe(0);
    expect(eventStreakBonus(min)).toBeCloseTo(step);
    expect(eventStreakBonus(min + 1)).toBeCloseTo(step * 2);
    expect(eventStreakBonus(1000)).toBeCloseTo(cap);
    expect(cap).toBeLessThanOrEqual(0.5);
  });

  it('boosts a lump by the streak bonus', () => {
    const base = solve(solve(fresh()));
    const streak = solve(base); // streak 3
    const plain = claimEvent(spawnEvent(base, lumpEvent)).granted;
    const boosted = claimEvent(spawnEvent(streak, lumpEvent)).granted;
    expect(boosted.div(plain).toNumber()).toBeCloseTo(1 + BALANCE.events.streak.step, 5);
  });

  it('boosts the extra part of a buff and the claim reports the boosted effect', () => {
    let s = fresh();
    for (let i = 0; i < 10; i++) s = solve(s);
    const e = eventEffect(s, buffEvent);
    expect(e.kind).toBe('prodMult');
    const mult = (buffEvent.effect as { mult: number }).mult;
    const want = 1 + (mult - 1) * (1 + BALANCE.events.streak.cap);
    expect((e as { mult: number }).mult).toBeCloseTo(want, 5);
    const r = claimEvent(spawnEvent(s, buffEvent));
    expect(r.state.buffs.find((b) => b.source === buffEvent.id)?.mult).toBeCloseTo(want, 5);
    expect(r.event?.effect).toEqual(e);
  });

  it('leaves the effect unchanged without a streak', () => {
    expect(eventEffect(fresh(), buffEvent)).toEqual(buffEvent.effect);
  });

  it('never mutates its input', () => {
    const s = solve(solve(solve(fresh())));
    const snap = JSON.stringify(s);
    const spawned = spawnEvent(s, lumpEvent);
    const spawnedSnap = JSON.stringify(spawned);
    claimEvent(spawned);
    eventEffect(s, buffEvent);
    expect(JSON.stringify(s)).toBe(snap);
    expect(JSON.stringify(spawned)).toBe(spawnedSnap);
  });

  it('has a streak text for the card', () => {
    expect(T.eventStreak(3)).toBe('Svit 3 🔥');
  });
});

describe('event streak save (task 069)', () => {
  it('migrates old saves to no streak', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(12);
    expect(migrate({ version: 11 }, MIGRATIONS, 12)).toMatchObject({ version: 12, eventStreak: 0, eventOpen: false });
  });

  it('round-trips the streak and cleans bad values', () => {
    const s = { ...solve(solve(fresh())), eventOpen: true };
    const back = deserialize(serialize(s), 0);
    expect(back.eventStreak).toBe(2);
    expect(back.eventOpen).toBe(true);
    const bad = JSON.parse(serialize(s));
    bad.eventStreak = -3.5;
    bad.eventOpen = 'yes';
    const cleaned = deserialize(JSON.stringify(bad), 0);
    expect(cleaned.eventStreak).toBe(0);
    expect(cleaned.eventOpen).toBe(false);
  });

  it('keeps KP as Decimal', () => {
    expect(solve(fresh()).kp).toBeInstanceOf(Decimal);
  });
});
