import { describe, expect, it } from 'vitest';
import { buy, click, createInitialState, Decimal, spawnEvent, type GameState } from '../src/core';
import { EVENTS } from '../src/content/events';
import { deserialize, migrate, SAVE_VERSION, SaveError, serialize, type Migration } from '../src/save/format';

function played(): GameState {
  let s = createInitialState(5_000);
  s = click(s, 50);
  s = buy(s, 'coffee');
  s = buy(s, 'csv');
  s = { ...s, merits: new Decimal('1.5e300').mul('1e300'), meritUpgrades: { summer: 1 } };
  s = spawnEvent(s, EVENTS[0]!);
  return { ...s, settings: { sound: false, vibration: true } };
}

describe('serialize/deserialize', () => {
  it('round-trips a played state, including huge numbers', () => {
    const s = played();
    const back = deserialize(serialize(s), 9_999);
    expect(back.kp.eq(s.kp)).toBe(true);
    expect(back.merits.eq(s.merits)).toBe(true);
    expect(back.merits.exponent).toBe(600);
    expect(back.upgrades).toEqual(s.upgrades);
    expect(back.automations).toEqual(s.automations);
    expect(back.meritUpgrades).toEqual(s.meritUpgrades);
    expect(back.activeEvent).toEqual(s.activeEvent);
    expect(back.settings).toEqual(s.settings);
    expect(back.lastSeenMs).toBe(5_000);
  });

  it('writes the current version', () => {
    expect(JSON.parse(serialize(createInitialState(0))).version).toBe(SAVE_VERSION);
  });

  it('rejects corrupt JSON and saves without version', () => {
    expect(() => deserialize('{nope', 0)).toThrow(SaveError);
    expect(() => deserialize('{"kp":"5"}', 0)).toThrow(SaveError);
    expect(() => deserialize('null', 0)).toThrow(SaveError);
  });

  it('rejects saves from a newer version', () => {
    expect(() => deserialize(JSON.stringify({ version: SAVE_VERSION + 1 }), 0)).toThrow(/newer/);
  });

  it('normalises missing and invalid fields to defaults', () => {
    const s = deserialize(
      JSON.stringify({
        version: 1,
        kp: 'NaN',
        runEarned: -5,
        automations: { csv: 3, nightly: -1, flow: 2.5, api: 'x' },
        settings: { sound: 'yes' },
        buffs: [{ source: 'x', kind: 'evil', mult: 1, untilMs: 1 }],
      }),
      123,
    );
    expect(s.kp.toNumber()).toBe(0);
    expect(s.runEarned.toNumber()).toBe(0);
    expect(s.automations).toEqual({ csv: 3 });
    expect(s.settings.sound).toBe(true);
    expect(s.buffs).toEqual([]);
    expect(s.lastSeenMs).toBe(123);
  });
});

describe('migrate', () => {
  const chain: Record<number, Migration> = {
    1: (s) => ({ ...s, version: 2, coins: s.kp, kp: undefined }),
    2: (s) => ({ ...s, version: 3, coins: String(Number(s.coins) * 2) }),
  };

  it('applies migrations in order up to the target', () => {
    const out = migrate({ version: 1, kp: '10' }, chain, 3);
    expect(out).toMatchObject({ version: 3, coins: '20' });
  });

  it('is a no-op at the current version', () => {
    const s = { version: 3, coins: '1' };
    expect(migrate(s, chain, 3)).toBe(s);
  });

  it('fails on a gap in the chain', () => {
    expect(() => migrate({ version: 1 }, { 2: chain[2]! }, 3)).toThrow(/No migration from version 1/);
  });

  it('fails if a migration does not bump the version by one', () => {
    expect(() => migrate({ version: 1 }, { 1: (s) => ({ ...s, version: 3 }) }, 3)).toThrow(SaveError);
  });

  it('fails on invalid versions', () => {
    expect(() => migrate({ version: 0 })).toThrow(SaveError);
    expect(() => migrate({ version: 1.5 })).toThrow(SaveError);
  });

  it('the real migration table reaches SAVE_VERSION from version 1', () => {
    expect(migrate({ version: 1 }).version).toBe(SAVE_VERSION);
  });
});
