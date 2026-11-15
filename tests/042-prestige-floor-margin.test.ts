import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';

// Task 042: slightly steeper automation cost growth gives the first prestige
// a margin above the 30 min floor (sim min 31.2 -> ~32.6 min).
describe('042 prestige floor margin', () => {
  it('uses automation cost growth 1.155', () => {
    expect(BALANCE.automationCostGrowth).toBe(1.155);
  });

  it('keeps the first purchases cheap enough', () => {
    // 10th copy of a 15 KP automation stays within ~5% of the old curve.
    const old = 15 * Math.pow(1.15, 10);
    const now = 15 * Math.pow(BALANCE.automationCostGrowth, 10);
    expect(now / old).toBeLessThan(1.05);
  });
});
