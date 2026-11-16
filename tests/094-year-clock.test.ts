import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { fmtDuration } from '../src/ui/format';

describe('yearClock text (094)', () => {
  it('shows the running time and the record when there is one', () => {
    expect(T.prestige.yearClock(fmtDuration(18 * 60_000), fmtDuration(25 * 60_000))).toBe('Läsåret: 18 min (rekord 25 min)');
  });

  it('shows only the running time without a record', () => {
    expect(T.prestige.yearClock(fmtDuration(45_000), null)).toBe('Läsåret: 45 s');
  });
});
