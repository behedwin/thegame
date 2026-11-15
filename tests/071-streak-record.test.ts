import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { claimEvent, createInitialState, spawnEvent, tick, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { statRows } from '../src/ui/stats';

const lumpEvent = EVENTS.find((e) => e.effect.kind === 'lump')!;
const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const value = (s: GameState, label: string) => statRows(s).find((r) => r.label === label)?.value;

function solve(s: GameState): GameState {
  const next = claimEvent(spawnEvent(s, lumpEvent)).state;
  return { ...next, nextEventAtMs: next.timeMs };
}

function miss(s: GameState): GameState {
  const next = tick(spawnEvent(s, lumpEvent), BALANCE.events.visibleMs + 1);
  return spawnEvent({ ...next, nextEventAtMs: next.timeMs }, lumpEvent);
}

describe('best event streak (task 071)', () => {
  it('starts at zero and follows the streak upwards', () => {
    let s = fresh();
    expect(s.bestEventStreak).toBe(0);
    s = solve(solve(solve(s)));
    expect(s.bestEventStreak).toBe(3);
  });

  it('never drops when the streak resets', () => {
    let s = solve(solve(solve(solve(fresh()))));
    s = miss(s);
    expect(s.eventStreak).toBe(0);
    expect(s.bestEventStreak).toBe(4);
    s = solve(claimEvent(s).state);
    expect(s.eventStreak).toBe(2);
    expect(s.bestEventStreak).toBe(4);
  });

  it('shows the record on the stats page', () => {
    expect(value(fresh(), T.stats.bestEventStreak)).toBe('0');
    expect(value(solve(solve(fresh())), T.stats.bestEventStreak)).toBe('2');
    expect(T.stats.bestEventStreak).toBe('Längsta eventsvit');
  });
});

describe('best event streak save (task 071)', () => {
  it('migrates with the running streak as the best known', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(13);
    expect(migrate({ version: 12, eventStreak: 5 }, MIGRATIONS, 13)).toMatchObject({ version: 13, bestEventStreak: 5 });
    expect(migrate({ version: 12 }, MIGRATIONS, 13)).toMatchObject({ version: 13, bestEventStreak: 0 });
  });

  it('round-trips and is never below the running streak', () => {
    const s = solve(solve(solve(fresh())));
    expect(deserialize(serialize(s), 0).bestEventStreak).toBe(3);
    const bad = JSON.parse(serialize(s));
    bad.bestEventStreak = 'x';
    expect(deserialize(JSON.stringify(bad), 0).bestEventStreak).toBe(3);
    bad.bestEventStreak = 1;
    expect(deserialize(JSON.stringify(bad), 0).bestEventStreak).toBe(3);
  });
});
