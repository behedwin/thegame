import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { ACHIEVEMENTS, AUTOMATIONS, EVENTS, FOCUSES, UPGRADES } from '../src/content/registry';
import {
  claimEvent,
  createInitialState,
  DEFAULT_FOCUS,
  isUntriedFocus,
  spawnEvent,
  splitMaxed,
  tick,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';

const lumpEvent = EVENTS.find((e) => e.effect.kind === 'lump')!;
const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });

function solve(s: GameState): GameState {
  const next = claimEvent(spawnEvent(s, lumpEvent)).state;
  return { ...next, nextEventAtMs: next.timeMs };
}

function miss(s: GameState): GameState {
  const next = tick(spawnEvent(s, lumpEvent), BALANCE.events.visibleMs + 1);
  return spawnEvent({ ...next, nextEventAtMs: next.timeMs }, lumpEvent);
}

/** Round-trip a save with some fields overwritten in the raw JSON. */
function withRaw(s: GameState, patch: Record<string, unknown>): GameState {
  return deserialize(JSON.stringify({ ...JSON.parse(serialize(s)), ...patch }), s.timeMs);
}

describe('075 splitMaxed in core', () => {
  const up = UPGRADES.find((u) => u.maxLevel > 1)!;

  it('keeps an upgrade below its max level open', () => {
    const s = { ...fresh(), upgrades: { [up.id]: up.maxLevel - 1 } };
    expect(splitMaxed(s, [up.id]).done).toEqual([]);
    expect(splitMaxed({ ...s, upgrades: { [up.id]: up.maxLevel } }, [up.id]).done).toEqual([up.id]);
  });

  it('never folds automations or unknown ids', () => {
    const ids = [...AUTOMATIONS.map((a) => a.id), 'no-such-id'];
    expect(splitMaxed(fresh(), ids)).toEqual({ open: ids, done: [] });
  });

  it('does not mutate its input', () => {
    const ids = UPGRADES.map((u) => u.id);
    const copy = [...ids];
    const s = { ...fresh(), upgrades: Object.fromEntries(UPGRADES.map((u) => [u.id, u.maxLevel])) };
    expect(splitMaxed(s, ids)).toEqual({ open: [], done: copy });
    expect(ids).toEqual(copy);
  });
});

describe('075 isUntriedFocus in core', () => {
  it('marks every non-default focus as untried in a new game', () => {
    const s = fresh();
    for (const f of FOCUSES) expect(isUntriedFocus(f.id, s.focusesPlayed)).toBe(f.id !== DEFAULT_FOCUS);
  });

  it('ignores the default focus even when it is listed as played', () => {
    expect(isUntriedFocus(DEFAULT_FOCUS, [DEFAULT_FOCUS])).toBe(false);
  });
});

describe('075 best event streak', () => {
  it('claimEvent raises streak and record together and does not mutate', () => {
    const s = spawnEvent(fresh(), lumpEvent);
    const before = JSON.stringify(s);
    const next = claimEvent(s).state;
    expect(JSON.stringify(s)).toBe(before);
    expect(next.eventStreak).toBe(1);
    expect(next.bestEventStreak).toBe(1);
  });

  it('keeps a higher record while a new streak builds up again', () => {
    let s = solve(solve(solve(solve(fresh()))));
    s = miss(s);
    expect(s.eventStreak).toBe(0);
    s = solve(solve(s));
    expect(s.eventStreak).toBe(2);
    expect(s.bestEventStreak).toBe(4);
  });

  it('streak trophies are ordered by threshold and sit after the other trophies', () => {
    const streak = ACHIEVEMENTS.filter((a) => a.condition.kind === 'eventStreak');
    const ns = streak.map((a) => (a.condition as { n: number }).n);
    expect([...ns].sort((x, y) => x - y)).toEqual(ns);
    const orders = ACHIEVEMENTS.map((a) => a.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('075 save counters', () => {
  it('lastSeenVersion keeps positive integers and drops anything else', () => {
    const s = fresh();
    expect(withRaw(s, { lastSeenVersion: 7 }).lastSeenVersion).toBe(7);
    for (const bad of [-1, 1.5, '3', null, Number.NaN]) expect(withRaw(s, { lastSeenVersion: bad }).lastSeenVersion).toBe(0);
  });

  it('bestEventStreak is never below the running streak and drops invalid values', () => {
    const s = fresh();
    expect(withRaw(s, { eventStreak: 6, bestEventStreak: 2 }).bestEventStreak).toBe(6);
    expect(withRaw(s, { eventStreak: 1, bestEventStreak: 9 }).bestEventStreak).toBe(9);
    for (const bad of [-4, 2.5, 'x', null]) expect(withRaw(s, { eventStreak: 0, bestEventStreak: bad }).bestEventStreak).toBe(0);
  });
});
