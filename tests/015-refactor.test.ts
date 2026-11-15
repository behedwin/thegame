// Task 015: refactor #3 — shared merit purchase, and stronger coverage for 011–014 core/save code.
import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import {
  buyMerit,
  canBuyMerit,
  createInitialState,
  Decimal,
  DEFAULT_VOLUME,
  eventCooldownMs,
  MAX_EVENT_COOLDOWN_CUT_PCT,
  meritCost,
  nextYearSpeedupPct,
  offlineEfficiency,
  prestige,
  setSettings,
  withMeritLevel,
  type GameState,
} from '../src/core';
import { BALANCE } from '../src/content/balance';
import { deserialize, migrate, SAVE_VERSION, serialize } from '../src/save/format';

const rich = (merits: number): GameState => ({ ...createInitialState(0), merits: new Decimal(merits) });
const byKind = (kind: string) => MERITS.find((m) => m.effect.kind === kind)!;

describe('withMeritLevel / buyMerit', () => {
  it('pays the current cost and adds one level without mutating the input', () => {
    const s = rich(1_000);
    const id = MERITS[0]!.id;
    const snapshot = JSON.stringify(s);
    const next = withMeritLevel(s, id);
    expect(JSON.stringify(s)).toBe(snapshot);
    expect(next.meritUpgrades[id]).toBe(1);
    expect(next.merits.toNumber()).toBe(1_000 - meritCost(s, id).toNumber());
  });

  it('buyMerit equals withMeritLevel when affordable and is a no-op otherwise', () => {
    for (const m of MERITS) {
      const s = rich(1_000_000);
      if (canBuyMerit(s, m.id)) expect(buyMerit(s, m.id)).toEqual(withMeritLevel(s, m.id));
      const poor = rich(0);
      expect(buyMerit(poor, m.id)).toBe(poor);
    }
  });
});

describe('merit bonuses (012) edge cases', () => {
  it('event cooldown cut is capped', () => {
    const m = byKind('eventCooldownPct');
    const s: GameState = { ...createInitialState(0), meritUpgrades: { [m.id]: 10_000 } };
    expect(eventCooldownMs(s)).toBeCloseTo(BALANCE.events.cooldownMs * (1 - MAX_EVENT_COOLDOWN_CUT_PCT / 100));
  });

  it('offline efficiency grows additively per level', () => {
    const m = byKind('offlineEffPct');
    const pct = (m.effect as { pct: number }).pct;
    const s: GameState = { ...createInitialState(0), meritUpgrades: { [m.id]: 3 } };
    expect(offlineEfficiency(s)).toBeCloseTo(BALANCE.offline.efficiency * (1 + (3 * pct) / 100));
  });

  it('nextYearSpeedupPct does not mutate its input and is 0 without pending merits', () => {
    const s = createInitialState(0);
    const snapshot = JSON.stringify(s);
    expect(nextYearSpeedupPct(s)).toBe(0);
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});

describe('settings (011, 014)', () => {
  it('new games have default volume and notifications off', () => {
    const s = createInitialState(0).settings;
    expect(s.volume).toBe(DEFAULT_VOLUME);
    expect(s.notifyOfflineCap).toBe(false);
    expect(s.notifySeason).toBe(false);
  });

  it('prestige keeps the settings', () => {
    let s = setSettings(createInitialState(0), { volume: 0.3, notifySeason: true });
    s = { ...s, runEarned: new Decimal('1e30'), totalEarned: new Decimal('1e30') };
    const after = prestige(s);
    expect(after.prestiges).toBe(1);
    expect(after.settings).toEqual(s.settings);
  });

  it('setSettings merges and does not mutate', () => {
    const s = createInitialState(0);
    const next = setSettings(s, { volume: 0.2 });
    expect(s.settings.volume).toBe(DEFAULT_VOLUME);
    expect(next.settings).toEqual({ ...s.settings, volume: 0.2 });
  });
});

describe('save format v3/v4', () => {
  it('migrates a v1 save through every step to the current version', () => {
    const out = migrate({ version: 1, settings: { sound: false, vibration: true } });
    expect(out.version).toBe(SAVE_VERSION);
    expect(out.achievements).toEqual([]);
    expect(out.settings).toEqual({ sound: false, vibration: true, volume: DEFAULT_VOLUME, notifyOfflineCap: false, notifySeason: false, tips: true, notation: 'short' });
  });

  it('migration of a save without settings still yields defaults', () => {
    const s = deserialize(JSON.stringify(migrate({ version: 2 })), 0);
    expect(s.settings.volume).toBe(DEFAULT_VOLUME);
    expect(s.settings.notifyOfflineCap).toBe(false);
  });

  it('clamps volume and only accepts true for notification flags', () => {
    const raw = JSON.parse(serialize(createInitialState(0)));
    raw.settings = { ...raw.settings, volume: 7, notifyOfflineCap: 'yes', notifySeason: true };
    let s = deserialize(JSON.stringify(raw), 0);
    expect(s.settings.volume).toBe(1);
    expect(s.settings.notifyOfflineCap).toBe(false);
    expect(s.settings.notifySeason).toBe(true);
    raw.settings.volume = -3;
    s = deserialize(JSON.stringify(raw), 0);
    expect(s.settings.volume).toBe(0);
  });

  it('round-trips settings', () => {
    const s = setSettings(createInitialState(0), { volume: 0.45, notifyOfflineCap: true });
    expect(deserialize(serialize(s), 0).settings).toEqual(s.settings);
  });
});
