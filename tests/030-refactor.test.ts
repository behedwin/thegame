import { describe, expect, it } from 'vitest';
import { AUTOMATIONS } from '../src/content/registry';
import {
  buy,
  canPrestige,
  createInitialState,
  Decimal,
  earn,
  kpPerSecond,
  networkFlow,
  prestige,
  prestigeUnlocked,
  runKpForMerits,
  setSettings,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { isActivateKey } from '../src/ui/a11y';

const rich = (): GameState => earn(createInitialState(0), new Decimal('1e9'));

describe('prestigeUnlocked (task 030, moved from ui/app.ts)', () => {
  it('is hidden in a fresh game', () => {
    expect(prestigeUnlocked(createInitialState(0))).toBe(false);
  });

  it('opens at a quarter of the KP needed for the first merit', () => {
    const quarter = runKpForMerits(1).mul(0.25);
    const below = { ...createInitialState(0), runEarned: quarter.mul(0.99) };
    const at = { ...createInitialState(0), runEarned: quarter };
    expect(prestigeUnlocked(below)).toBe(false);
    expect(prestigeUnlocked(at)).toBe(true);
  });

  it('stays open after the first prestige, even with nothing earned this run', () => {
    const s = { ...createInitialState(0), prestiges: 1 };
    expect(prestigeUnlocked(s)).toBe(true);
    expect(canPrestige(s)).toBe(false);
  });

  it('is open whenever prestige is possible', () => {
    const s = { ...createInitialState(0), runEarned: runKpForMerits(1) };
    expect(canPrestige(s)).toBe(true);
    expect(prestigeUnlocked(s)).toBe(true);
  });
});

describe('networkFlow (task 030, moved from ui/app.ts)', () => {
  it('a fresh game has zero counts, zero shares and zero total', () => {
    const f = networkFlow(createInitialState(0));
    expect(f.total).toBe(0);
    for (const a of AUTOMATIONS) {
      expect(f.counts[a.id]).toBe(0);
      expect(f.shares[a.id]).toBe(0);
    }
  });

  it('counts owned automations and shares sum to 1 without buffs', () => {
    let s = rich();
    const [a, b] = [AUTOMATIONS[0]!, AUTOMATIONS[1]!];
    s = buy(buy(buy(s, a.id), a.id), b.id);
    const f = networkFlow(s);
    expect(f.counts[a.id]).toBe(2);
    expect(f.counts[b.id]).toBe(1);
    expect(f.total).toBeCloseTo(kpPerSecond(s).toNumber());
    const sum = Object.values(f.shares).reduce((x, y) => x + y, 0);
    expect(sum).toBeCloseTo(1);
    expect(f.shares[a.id]!).toBeGreaterThan(0);
    expect(Object.keys(f.counts).sort()).toEqual(AUTOMATIONS.map((x) => x.id).sort());
  });

  it('does not mutate the state', () => {
    const s = buy(rich(), AUTOMATIONS[0]!.id);
    const snap = serialize(s);
    networkFlow(s);
    expect(serialize(s)).toBe(snap);
  });
});

describe('isActivateKey (task 030, shared keyboard rule)', () => {
  it('Enter and Space activate, other keys do not', () => {
    expect(isActivateKey({ key: 'Enter' })).toBe(true);
    expect(isActivateKey({ key: ' ' })).toBe(true);
    for (const key of ['Escape', 'Tab', 'a', 'Spacebar', '']) expect(isActivateKey({ key })).toBe(false);
  });
});

describe('core and save hardening (task 030)', () => {
  it('prestige keeps settings and total earned and does not mutate its input', () => {
    let s = setSettings({ ...rich(), runEarned: runKpForMerits(2) }, { sound: false, volume: 0.3 });
    const snap = serialize(s);
    const after = prestige(s);
    expect(serialize(s)).toBe(snap);
    expect(after.settings.sound).toBe(false);
    expect(after.settings.volume).toBeCloseTo(0.3);
    expect(after.totalEarned.eq(s.totalEarned)).toBe(true);
    expect(after.prestiges).toBe(s.prestiges + 1);
    expect(after.merits.gte(1)).toBe(true);
    s = after;
    expect(prestige({ ...s, runEarned: new Decimal(0) })).toEqual({ ...s, runEarned: new Decimal(0) });
  });

  it('a prestiged game with buys survives a save round trip', () => {
    let s = prestige({ ...rich(), runEarned: runKpForMerits(3) });
    s = buy(earn(s, new Decimal(1e6)), AUTOMATIONS[0]!.id);
    const back = deserialize(serialize(s), s.lastSeenMs);
    expect(back.prestiges).toBe(1);
    expect(back.merits.eq(s.merits)).toBe(true);
    expect(back.automations).toEqual(s.automations);
    expect(networkFlow(back)).toEqual(networkFlow(s));
  });
});
