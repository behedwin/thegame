import { describe, expect, it } from 'vitest';
import { HUB_TIERS, hubTier, nextHubTierKps } from '../src/ui/network';
import { pointInRect } from '../src/ui/hero';
import { T } from '../src/content/texts';

describe('087: next hub tier threshold', () => {
  it('gives the KP/s for the next tier', () => {
    expect([0, 1, 2, 3].map(nextHubTierKps)).toEqual([10, 1_000, 100_000, 10_000_000]);
  });

  it('matches hubTier(): the threshold reaches the next tier, just below stays', () => {
    for (let tier = 0; tier < HUB_TIERS - 1; tier++) {
      const at = nextHubTierKps(tier)!;
      expect(hubTier(at)).toBe(tier + 1);
      expect(hubTier(at * 0.999)).toBe(tier);
    }
  });

  it('is null on the top tier', () => {
    expect(nextHubTierKps(HUB_TIERS - 1)).toBeNull();
  });

  it('texts name the next tier and its KP/s, or just the name on top', () => {
    expect(T.hubTierInfo(1, '1 000')).toBe('Kommunnav – nästa: Regionnav vid 1 000 KP/s');
    expect(T.hubTierInfo(HUB_TIERS - 1, null)).toBe('Datahjärta');
    expect(T.hubTiers).toHaveLength(HUB_TIERS);
  });

  it('pointInRect hits inside and on the edge, misses outside', () => {
    const r = { left: 10, top: 20, right: 30, bottom: 40 };
    expect(pointInRect(r, 10, 20)).toBe(true);
    expect(pointInRect(r, 20, 30)).toBe(true);
    expect(pointInRect(r, 31, 30)).toBe(false);
    expect(pointInRect(r, 20, 19)).toBe(false);
    expect(pointInRect({ left: 0, top: 0, right: 0, bottom: 0 }, 0, 0)).toBe(false);
  });
});
