import { describe, expect, it } from 'vitest';
import { Decimal } from '../src/core/state';
import { bigJump, burstGeometry, easeOutCubic, MAX_FX, rollValue, trimLayer } from '../src/ui/fx';

/** Deterministic LCG for the injected randomness. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

describe('easing and rolling numbers', () => {
  it('eases from 0 to 1 and clamps outside the range', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 6);
    for (let t = 0; t < 1; t += 0.1) expect(easeOutCubic(t + 0.1)).toBeGreaterThanOrEqual(easeOutCubic(t));
  });

  it('ends on exactly the target value, also for huge numbers', () => {
    const to = new Decimal('1.234567e300');
    expect(rollValue(new Decimal(0), to, 1)).toBe(to);
    expect(rollValue(new Decimal(0), to, 5)).toBe(to);
    expect(rollValue(new Decimal(10), new Decimal(20), 0).toNumber()).toBe(10);
    const mid = rollValue(new Decimal(10), new Decimal(20), 0.5).toNumber();
    expect(mid).toBeGreaterThan(10);
    expect(mid).toBeLessThan(20);
  });

  it('bounces only on increases above 5 %', () => {
    expect(bigJump(new Decimal(100), new Decimal(106))).toBe(true);
    expect(bigJump(new Decimal(100), new Decimal(104))).toBe(false);
    expect(bigJump(new Decimal(100), new Decimal(50))).toBe(false);
    expect(bigJump(new Decimal(0), new Decimal(1))).toBe(true);
  });
});

describe('particle geometry', () => {
  it('is deterministic with injected randomness and stays within bounds', () => {
    const a = burstGeometry(10, lcg(7));
    expect(burstGeometry(10, lcg(7))).toEqual(a);
    expect(a).toHaveLength(10);
    for (const p of a) {
      const dist = Math.hypot(p.dx, p.dy);
      expect(dist).toBeGreaterThanOrEqual(28 - 1e-9);
      expect(dist).toBeLessThanOrEqual(60 + 1e-9);
      expect(p.ms).toBeLessThanOrEqual(600);
      expect(p.scale).toBeGreaterThan(0);
    }
  });

  it('spreads particles around the circle', () => {
    const quadrants = new Set(burstGeometry(8, lcg(3)).map((p) => `${Math.sign(p.dx)},${Math.sign(p.dy)}`));
    expect(quadrants.size).toBe(4);
  });
});

describe('effect cap', () => {
  it('removes the oldest nodes beyond the cap', () => {
    const kids = Array.from({ length: MAX_FX + 15 }, (_, i) => i);
    const layer = {
      get childElementCount() { return kids.length; },
      get firstElementChild() { return { remove: () => kids.shift() }; },
    } as unknown as Element;
    trimLayer(layer);
    expect(kids).toHaveLength(MAX_FX);
    expect(kids[0]).toBe(15);
    expect(MAX_FX).toBeLessThanOrEqual(40);
  });
});
