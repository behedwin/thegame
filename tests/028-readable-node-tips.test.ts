import { describe, expect, it } from 'vitest';
import { tipDurationMs } from '../src/ui/network';

describe('tipDurationMs', () => {
  it('shows even an empty or short tip for at least 6 s', () => {
    expect(tipDurationMs('')).toBe(6000);
    expect(tipDurationMs('Edsovo')).toBe(6000);
  });
  it('grows with the length of the text', () => {
    const a = tipDurationMs('x'.repeat(80));
    const b = tipDurationMs('x'.repeat(120));
    expect(a).toBeGreaterThan(6000);
    expect(b).toBeGreaterThan(a);
    expect(a).toBe(2500 + 60 * 80);
  });
  it('is capped at 12 s', () => {
    expect(tipDurationMs('x'.repeat(1000))).toBe(12000);
  });
});
