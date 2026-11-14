import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { click, createInitialState, Decimal, prestige, tick, type GameState } from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState, label: string) => statRows(s).find((r) => r.label === label)?.value;

describe('stats page rows', () => {
  it('covers total earned, clicks, events, school years and time played', () => {
    const labels = statRows(fresh()).map((r) => r.label);
    for (const l of [T.stats.totalEarned, T.stats.clicks, T.stats.events, T.stats.schoolYears, T.stats.timePlayed]) {
      expect(labels).toContain(l);
    }
  });

  it('shows zeros for a new game, school year 1', () => {
    const s = fresh();
    expect(value(s, T.stats.totalEarned)).toBe('0 KP');
    expect(value(s, T.stats.clicks)).toBe('0');
    expect(value(s, T.stats.events)).toBe('0');
    expect(value(s, T.stats.schoolYears)).toBe('1');
    expect(value(s, T.stats.timePlayed)).toBe('0 s');
    expect(value(s, T.stats.achievements)).toBe(`0 av ${ACHIEVEMENTS.length}`);
  });

  it('reflects play: clicks, time and earned KP', () => {
    let s = click(fresh(), 7);
    s = tick(s, 125_000);
    expect(value(s, T.stats.clicks)).toBe('7');
    expect(value(s, T.stats.timePlayed)).toBe('2 min');
    expect(value(s, T.stats.totalEarned)).not.toBe('0 KP');
  });

  it('lifetime stats survive a new school year', () => {
    let s: GameState = { ...fresh(), clicks: 1234, eventsClaimed: 5, timeMs: 3_600_000 };
    s = { ...s, runEarned: new Decimal(1e9), totalEarned: new Decimal(1e9), kp: new Decimal(1e9) };
    const after = prestige(s);
    expect(after.prestiges).toBe(1);
    expect(value(after, T.stats.clicks)).toBe('1 234');
    expect(value(after, T.stats.events)).toBe('5');
    expect(value(after, T.stats.schoolYears)).toBe('2');
    expect(value(after, T.stats.timePlayed)).toBe('1 h');
    expect(value(after, T.stats.thisYear)).toBe('0 KP');
  });

  it('stats round-trip through the save format', () => {
    const s: GameState = { ...fresh(), clicks: 42, eventsClaimed: 3, prestiges: 2, timeMs: 90_000, totalEarned: new Decimal(5e6) };
    const back = deserialize(serialize(s), 1_000_000);
    expect(statRows(back)).toEqual(statRows(s));
  });
});
