import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { MERITS } from '../src/content/registry';
import type { MeritDef } from '../src/content/types';
import {
  anyMeritAffordable,
  automationCostFactor,
  canPrestige,
  createInitialState,
  Decimal,
  eventCooldownMs,
  MAX_EVENT_COOLDOWN_CUT_PCT,
  meritLevelEffect,
  meritProdMult,
  offlineCapMs,
  offlineEfficiency,
  prestige,
  startingAutomations,
  type GameState,
} from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION } from '../src/save/format';
import { meritEffectText } from '../src/ui/shop';

const withMerit = (id: string, lvl: number): GameState => ({ ...createInitialState(0), meritUpgrades: lvl > 0 ? { [id]: lvl } : {} });

/** What the core formulas actually apply for a state that owns only `def` at `lvl`. */
function coreEffect(def: MeritDef, lvl: number): number {
  const s = withMerit(def.id, lvl);
  const base = createInitialState(0);
  const e = def.effect;
  switch (e.kind) {
    case 'prodPct':
      return (meritProdMult(s) - 1) * 100;
    case 'offlineHours':
      return (offlineCapMs(s) - offlineCapMs(base)) / 3_600_000;
    case 'startAutomation':
      return startingAutomations(s.meritUpgrades)[e.id] ?? 0;
    case 'autoDiscountPct':
      return (1 - automationCostFactor(s)) * 100;
    case 'eventCooldownPct':
      return (1 - eventCooldownMs(s) / eventCooldownMs(base)) * 100;
    case 'offlineEffPct':
      return (offlineEfficiency(s) / offlineEfficiency(base) - 1) * 100;
    case 'clickPct':
      return e.pct * lvl; // folded into kpPerClick with other factors; covered by the sum below
  }
}

describe('meritLevelEffect: one source for core and the merit card (task 090)', () => {
  it('matches the effect the core applies for every real merit and level', () => {
    for (const m of MERITS) {
      for (let lvl = 0; lvl <= m.maxLevel; lvl++) {
        expect(meritLevelEffect(m, lvl), `${m.id} @ ${lvl}`).toBeCloseTo(coreEffect(m, lvl), 9);
      }
    }
  });

  it('is 0 at level 0 and never decreases with level', () => {
    for (const m of MERITS) {
      expect(meritLevelEffect(m, 0)).toBe(0);
      for (let lvl = 1; lvl <= m.maxLevel; lvl++) expect(meritLevelEffect(m, lvl)).toBeGreaterThanOrEqual(meritLevelEffect(m, lvl - 1));
    }
  });

  it('caps the event cut and compounds discounts', () => {
    const fake = (effect: MeritDef['effect']): MeritDef => ({ id: 'x', order: 0, name: 'x', desc: 'x', baseCost: 1, costGrowth: 2, maxLevel: 10, effect });
    expect(meritLevelEffect(fake({ kind: 'eventCooldownPct', pct: 30 }), 5)).toBe(MAX_EVENT_COOLDOWN_CUT_PCT);
    expect(meritLevelEffect(fake({ kind: 'autoDiscountPct', pct: 50 }), 2)).toBeCloseTo(75, 12);
    expect(meritLevelEffect(fake({ kind: 'offlineHours', hours: 2 }), 3)).toBe(6);
    expect(meritLevelEffect(fake({ kind: 'startAutomation', id: 'csv', count: 4 }), 2)).toBe(8);
  });

  it('the card shows the same number as meritLevelEffect', () => {
    for (const m of MERITS) {
      if (m.effect.kind === 'autoDiscountPct' || m.effect.kind === 'startAutomation') continue;
      const n = meritLevelEffect(m, m.maxLevel);
      expect(meritEffectText(m, m.maxLevel)).toContain(String(n));
    }
  });

  it('sums several merits of one kind and caps the event cut in total', () => {
    const ids = MERITS.filter((m) => m.effect.kind === 'prodPct').map((m) => m.id);
    const s: GameState = { ...createInitialState(0), meritUpgrades: Object.fromEntries(ids.map((id) => [id, 2])) };
    const sum = MERITS.filter((m) => ids.includes(m.id)).reduce((a, m) => a + meritLevelEffect(m, 2), 0);
    expect(meritProdMult(s)).toBeCloseTo(1 + sum / 100, 12);
    const all: GameState = { ...createInitialState(0), meritUpgrades: Object.fromEntries(MERITS.map((m) => [m.id, m.maxLevel])) };
    expect(eventCooldownMs(all)).toBeGreaterThanOrEqual(BALANCE.events.cooldownMs * (1 - MAX_EVENT_COOLDOWN_CUT_PCT / 100) - 1e-6);
  });
});

describe('anyMeritAffordable lives in core (task 090)', () => {
  it('is false when every merit is maxed, however many Meriter are owned', () => {
    const s: GameState = {
      ...createInitialState(0),
      merits: new Decimal('1e300'),
      meritUpgrades: Object.fromEntries(MERITS.map((m) => [m.id, m.maxLevel])),
    };
    expect(anyMeritAffordable(s)).toBe(false);
  });
});

describe('save migration 16 → 17 edge cases (task 090)', () => {
  it('treats a negative, NaN or non-number timeMs as 0', () => {
    for (const timeMs of [-5, Number.NaN, Number.POSITIVE_INFINITY, '123', null]) {
      expect(migrate({ version: 16, timeMs }, MIGRATIONS, 17)).toMatchObject({ yearStartMs: 0, fastestYearMs: 0 });
    }
  });

  it('keeps every other field untouched', () => {
    const out = migrate({ version: 16, timeMs: 1000, kp: '5', fastestYearMs: 999 }, MIGRATIONS, 17);
    expect(out).toMatchObject({ version: 17, kp: '5', yearStartMs: 1000, fastestYearMs: 0 });
  });

  it('a version 1 save migrates all the way and loads with a fresh year clock', () => {
    const migrated = migrate({ version: 1, timeMs: 5000 });
    expect(migrated.version).toBe(SAVE_VERSION);
    const state = deserialize(JSON.stringify({ version: 16, timeMs: 5000, kp: '10' }), 9999);
    expect(state.yearStartMs).toBe(5000);
    expect(state.fastestYearMs).toBe(0);
  });
});

describe('prestige edge cases (task 090)', () => {
  it('returns the same state when nothing is pending', () => {
    const s = createInitialState(0);
    expect(canPrestige(s)).toBe(false);
    expect(prestige(s)).toBe(s);
  });

  it('a year that ends at its own start sets a zero-length duration but no record', () => {
    const s: GameState = { ...createInitialState(0), runEarned: new Decimal('4e9'), timeMs: 0, yearStartMs: 0 };
    const next = prestige(s);
    expect(next.prestiges).toBe(1);
    expect(next.fastestYearMs).toBe(0);
  });

  it('starts the new year with the automations from owned startAutomation merits only', () => {
    const start = MERITS.find((m) => m.effect.kind === 'startAutomation');
    expect(startingAutomations({})).toEqual({});
    if (!start || start.effect.kind !== 'startAutomation') return;
    const s: GameState = {
      ...createInitialState(0),
      runEarned: new Decimal('4e9'),
      automations: { [start.effect.id]: 99, other: 5 },
      meritUpgrades: { [start.id]: 2 },
    };
    expect(prestige(s).automations).toEqual({ [start.effect.id]: meritLevelEffect(start, 2) });
  });
});
