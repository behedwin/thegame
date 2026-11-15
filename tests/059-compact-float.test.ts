import { describe, expect, it } from 'vitest';
import { compactFloatSpot, MAX_COMPACT_FLOATS } from '../src/ui/fx';

const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]!; };

describe('059 compactFloatSpot', () => {
  it('starts to the right of SYNKA and drifts further right', () => {
    for (const r of [0, 0.5, 0.999]) {
      const s = compactFloatSpot({ right: 80, cy: 48 }, 390, 0, seq(r))!;
      expect(s.x).toBeGreaterThan(80);
      expect(s.dx).toBeGreaterThan(0);
      expect(s.y).toBeGreaterThan(30);
      expect(s.y).toBeLessThan(66);
    }
  });

  it('keeps the number inside the strip on narrow screens', () => {
    for (const width of [0, 60, 120, 200]) {
      const s = compactFloatSpot({ right: 80, cy: 48 }, width, 0, seq(0.999))!;
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x + s.dx).toBeLessThanOrEqual(Math.max(0, width));
    }
  });

  it('shows at most three numbers at once', () => {
    expect(MAX_COMPACT_FLOATS).toBe(3);
    for (let n = 0; n < MAX_COMPACT_FLOATS; n++) expect(compactFloatSpot({ right: 80, cy: 48 }, 390, n, seq(0.3))).not.toBeNull();
    expect(compactFloatSpot({ right: 80, cy: 48 }, 390, 3, seq(0.3))).toBeNull();
    expect(compactFloatSpot({ right: 80, cy: 48 }, 390, 9, seq(0.3))).toBeNull();
  });
});
