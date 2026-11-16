import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { fmtDuration } from '../src/ui/format';

describe('yearClock on-pace text (102)', () => {
  it('adds the record-pace suffix while under the record', () => {
    expect(T.prestige.yearClock(fmtDuration(18 * 60_000), fmtDuration(25 * 60_000), true)).toBe('Läsåret: 18 min (rekord 25 min) · rekordtakt');
  });

  it('keeps the plain text when not on pace', () => {
    expect(T.prestige.yearClock(fmtDuration(30 * 60_000), fmtDuration(25 * 60_000), false)).toBe('Läsåret: 30 min (rekord 25 min)');
    expect(T.prestige.yearClock(fmtDuration(30 * 60_000), fmtDuration(25 * 60_000))).toBe('Läsåret: 30 min (rekord 25 min)');
  });

  it('never claims record pace without a record', () => {
    expect(T.prestige.yearClock(fmtDuration(45_000), null, true)).toBe('Läsåret: 45 s');
  });
});
