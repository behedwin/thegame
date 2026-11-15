import { describe, expect, it } from 'vitest';
import { frameStep } from '../src/ui/network';

describe('049 frameStep', () => {
  it('waits until about 1/30 s has passed, then releases the whole step', () => {
    let r = frameStep(0, 0.017, true);
    expect(r.step).toBe(0);
    r = frameStep(r.acc, 0.017, true);
    expect(r.step).toBeCloseTo(0.034);
    expect(r.acc).toBe(0);
  });
  it('does nothing and stores nothing while off screen', () => {
    let acc = 0.02;
    for (let i = 0; i < 600; i++) {
      const r = frameStep(acc, 0.016, false);
      expect(r.step).toBe(0);
      acc = r.acc;
    }
    expect(acc).toBe(0);
  });
  it('resumes with a normal step, not a burst, when back on screen', () => {
    let acc = 0;
    for (let i = 0; i < 1000; i++) acc = frameStep(acc, 0.016, false).acc;
    const first = frameStep(acc, 0.016, true);
    const second = frameStep(first.acc, 0.016, true);
    expect(Math.max(first.step, second.step)).toBeLessThan(0.05);
  });
});
