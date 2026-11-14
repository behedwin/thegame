import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, UPGRADES } from '../src/content/registry';
import { BALANCE } from '../src/content/balance';
import { buyMany, costOfMany, maxAffordable, resolveBulk } from '../src/core/bulk';
import { buy, costOf, createInitialState, Decimal, level, type GameState } from '../src/core';

const fresh = () => createInitialState(1_000_000);
const withKp = (s: GameState, kp: number | string): GameState => ({ ...s, kp: new Decimal(kp) });
const auto = AUTOMATIONS[0]!;
const up = UPGRADES.find((u) => u.maxLevel >= 4)!;

/** Closed-form geometric sum base·r^owned·(r^n − 1)/(r − 1). */
const geo = (base: number, r: number, owned: number, n: number) => (base * Math.pow(r, owned) * (Math.pow(r, n) - 1)) / (r - 1);

describe('costOfMany', () => {
  it('matches the geometric sum for automations', () => {
    const s = { ...fresh(), automations: { [auto.id]: 7 } };
    const r = BALANCE.automationCostGrowth;
    for (const n of [1, 2, 10, 37]) {
      const got = costOfMany(s, auto.id, n).toNumber();
      expect(got).toBe(Math.ceil(geo(auto.baseCost, r, 7, n)));
    }
  });

  it('matches the geometric sum for upgrades', () => {
    const s = { ...fresh(), upgrades: { [up.id]: 1 } };
    expect(costOfMany(s, up.id, 3).toNumber()).toBe(Math.ceil(geo(up.baseCost, up.costGrowth, 1, 3)));
  });

  it('equals costOf for one unit and is zero for none', () => {
    const s = { ...fresh(), automations: { [auto.id]: 13 } };
    expect(costOfMany(s, auto.id, 1).eq(costOf(s, auto.id))).toBe(true);
    expect(costOfMany(s, auto.id, 0).toNumber()).toBe(0);
  });

  it('never exceeds buying one at a time', () => {
    let s = withKp(fresh(), 1e12);
    const bulk = costOfMany(s, auto.id, 25);
    const start = s.kp;
    for (let i = 0; i < 25; i++) s = buy(s, auto.id);
    const single = start.sub(s.kp);
    expect(bulk.lte(single)).toBe(true);
    expect(single.sub(bulk).toNumber()).toBeLessThan(25);
  });
});

describe('maxAffordable', () => {
  it('is the largest n whose cost fits', () => {
    for (const kp of [0, 5, 15, 100, 12_345, 9.87e6]) {
      const s = withKp(fresh(), kp);
      const n = maxAffordable(s, auto.id);
      expect(costOfMany(s, auto.id, n).lte(kp)).toBe(true);
      expect(costOfMany(s, auto.id, n + 1).gt(kp)).toBe(true);
    }
  });

  it('is capped by the upgrade max level', () => {
    const s = { ...withKp(fresh(), '1e300'), upgrades: { [up.id]: 1 } };
    expect(maxAffordable(s, up.id)).toBe(up.maxLevel - 1);
    const maxed = { ...s, upgrades: { [up.id]: up.maxLevel } };
    expect(maxAffordable(maxed, up.id)).toBe(0);
  });

  it('handles huge balances without NaN', () => {
    const s = withKp(fresh(), '1e5000');
    const n = maxAffordable(s, auto.id);
    expect(Number.isFinite(n)).toBe(true);
    expect(n).toBeGreaterThan(1000);
    expect(costOfMany(s, auto.id, n).lte(s.kp)).toBe(true);
  });

  it('is 0 for unknown ids', () => {
    expect(maxAffordable(withKp(fresh(), 1e9), 'nope')).toBe(0);
  });
});

describe('buyMany', () => {
  it('buys n units and deducts costOfMany', () => {
    const s = withKp(fresh(), 1e9);
    const cost = costOfMany(s, auto.id, 10);
    const next = buyMany(s, auto.id, 10);
    expect(level(next.automations, auto.id)).toBe(10);
    expect(next.kp.eq(s.kp.sub(cost))).toBe(true);
    expect(s.kp.toNumber()).toBe(1e9); // input untouched
    expect(level(s.automations, auto.id)).toBe(0);
  });

  it('buys upgrade levels', () => {
    const s = withKp(fresh(), '1e300');
    const next = buyMany(s, up.id, 2);
    expect(level(next.upgrades, up.id)).toBe(2);
  });

  it('returns the same state if not affordable, over max level or n <= 0', () => {
    const s = withKp(fresh(), 1);
    expect(buyMany(s, auto.id, 10)).toBe(s);
    const rich = withKp(fresh(), '1e300');
    expect(buyMany(rich, auto.id, 0)).toBe(rich);
    expect(buyMany(rich, up.id, up.maxLevel + 1)).toBe(rich);
    expect(buyMany(rich, 'nope', 1)).toBe(rich);
  });
});

describe('resolveBulk', () => {
  it('maps ×1, ×10 and MAX to a count', () => {
    const s = withKp(fresh(), 1e9);
    expect(resolveBulk(s, auto.id, 1)).toBe(1);
    expect(resolveBulk(s, auto.id, 10)).toBe(10);
    expect(resolveBulk(s, auto.id, 'max')).toBe(maxAffordable(s, auto.id));
  });

  it('clamps ×10 to remaining upgrade levels and MAX to at least 1', () => {
    const s = { ...withKp(fresh(), 0), upgrades: { [up.id]: up.maxLevel - 2 } };
    expect(resolveBulk(s, up.id, 10)).toBe(2);
    expect(resolveBulk(s, up.id, 'max')).toBe(1);
  });
});
