import { describe, expect, it } from 'vitest';
import { flowRate, HUB_TIERS, hubTier, MAX_PACKETS, packetBudget } from '../src/ui/network';
import { T } from '../src/content/texts';

describe('027 hubTier', () => {
  it('gives tier 0 for nothing, zero, negative and NaN', () => {
    for (const v of [0, -5, NaN, 0.5]) expect(hubTier(v)).toBe(0);
  });
  it('steps up on a log scale and caps at the top tier', () => {
    expect(hubTier(9.99)).toBe(0);
    expect(hubTier(10)).toBe(1);
    expect(hubTier(1e3)).toBe(2);
    expect(hubTier(1e5)).toBe(3);
    expect(hubTier(1e7)).toBe(4);
    expect(hubTier(1e300)).toBe(HUB_TIERS - 1);
    expect(hubTier(Infinity)).toBe(HUB_TIERS - 1);
  });
  it('is monotonic', () => {
    let prev = 0;
    for (let e = -2; e < 12; e += 0.05) {
      const t = hubTier(10 ** e);
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
  });
  it('has a Swedish name for every tier', () => {
    expect(T.hubTiers).toHaveLength(HUB_TIERS);
    expect(T.hubTierUp(T.hubTiers[2]!)).toContain(T.hubTiers[2]!);
  });
});

describe('027 flowRate', () => {
  it('is 0 for inactive lines', () => {
    for (const s of [0, -1, NaN]) expect(flowRate(s)).toBe(0);
  });
  it('grows logarithmically with the share and has a cap', () => {
    const a = flowRate(0.001);
    const b = flowRate(0.01);
    const c = flowRate(0.1);
    const d = flowRate(1);
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(d).toBeGreaterThan(c);
    // equal steps per decade (log scale), apart from the floor near 0
    expect(c - b).toBeCloseTo(d - c, 0);
    expect(flowRate(5)).toBe(flowRate(1));
    expect(flowRate(1)).toBeLessThanOrEqual(5);
  });
});

describe('027 packetBudget', () => {
  it('never hands out more than the cap', () => {
    const cases = [[], [0, 0], [5], [1, 1, 1, 1, 1, 1], [5, 0.1, 0.1, 3, 0, 2], [0.6, 5, 5, 5, 5, 5]];
    for (const rates of cases) {
      const b = packetBudget(rates, MAX_PACKETS);
      expect(b.reduce((s, x) => s + x, 0)).toBeLessThanOrEqual(MAX_PACKETS);
      rates.forEach((r, i) => (r > 0 ? expect(b[i]).toBeGreaterThanOrEqual(1) : expect(b[i]).toBe(0)));
    }
    expect(packetBudget([1, 1, 1], 2).reduce((s, x) => s + x, 0)).toBeLessThanOrEqual(2);
  });
  it('gives busier lines more packets and caps the total at about 60', () => {
    const b = packetBudget([5, 1], MAX_PACKETS);
    expect(b[0]).toBeGreaterThan(b[1]!);
    expect(MAX_PACKETS).toBeLessThanOrEqual(60);
  });
});
