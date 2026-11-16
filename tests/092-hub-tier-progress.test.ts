import { describe, expect, it } from 'vitest';
import { HUB_TIERS, hubTier, hubTierProgress, nextHubTierKps } from '../src/ui/network';

describe('092: progress toward the next hub tier', () => {
  it('is 0 at a tier threshold below the top', () => {
    expect(hubTierProgress(1)).toBe(0);
    for (let tier = 0; tier < HUB_TIERS - 2; tier++) {
      expect(hubTierProgress(nextHubTierKps(tier)!)).toBeCloseTo(0, 9);
    }
  });

  it('is 0.5 halfway on a log scale', () => {
    expect(hubTierProgress(100)).toBeCloseTo(0.5, 9); // 10 → 1 000
    expect(hubTierProgress(10_000)).toBeCloseTo(0.5, 9); // 1 000 → 100 000
  });

  it('is just below 1 right before the next threshold', () => {
    for (let tier = 0; tier < HUB_TIERS - 1; tier++) {
      const p = hubTierProgress(nextHubTierKps(tier)! * 0.999);
      expect(hubTier(nextHubTierKps(tier)! * 0.999)).toBe(tier);
      expect(p).toBeGreaterThan(0.99);
      expect(p).toBeLessThan(1);
    }
  });

  it('is 1 on the top tier', () => {
    expect(hubTierProgress(1e7)).toBe(1);
    expect(hubTierProgress(1e300)).toBe(1);
  });

  it('never returns NaN and stays within 0..1', () => {
    for (const kps of [0, -5, 1e-9, 0.5, 1, 3, 9.99, NaN, Infinity]) {
      const p = hubTierProgress(kps);
      expect(Number.isNaN(p)).toBe(false);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
    expect(hubTierProgress(0)).toBe(0);
  });
});
