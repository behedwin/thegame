import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState } from '../src/core';
import { statRows } from '../src/ui/stats';
import { fmtDuration } from '../src/ui/format';

const fresh = () => createInitialState(0);
const trophy = ACHIEVEMENTS.find((a) => a.condition.kind === 'fastestYear')!;
const maxMs = trophy.condition.kind === 'fastestYear' ? trophy.condition.maxMs : 0;
const paceRow = (s: ReturnType<typeof fresh>) => statRows(s).find((r) => r.label === T.stats.yearPace);

describe('stats: this year\'s pace toward the fastest-year trophy (117)', () => {
  it('has no pace row in the first school year', () => {
    expect(paceRow({ ...fresh(), timeMs: 60_000 })).toBeUndefined();
  });

  it('shows elapsed time and the trophy limit from the second year', () => {
    const s = { ...fresh(), prestiges: 1, yearStartMs: 60_000, timeMs: 60_000 + 9 * 60_000 };
    const row = paceRow(s);
    expect(row).toBeDefined();
    expect(row!.value).toBe(T.stats.yearPaceValue(fmtDuration(9 * 60_000), trophy.name, fmtDuration(maxMs)));
    expect(row!.value).toContain(fmtDuration(maxMs));
  });

  it('disappears once the trophy is unlocked', () => {
    const s = { ...fresh(), prestiges: 1, yearStartMs: 0, timeMs: 5 * 60_000, achievements: [trophy.id] };
    expect(paceRow(s)).toBeUndefined();
  });

  it('has Swedish text naming the trophy limit', () => {
    expect(T.stats.yearPace).toBe('Det här läsåret');
    expect(T.stats.yearPaceValue('9 min', 'Expresskörning', '15 min')).toBe('9 min (Expresskörning vid 15 min)');
  });
});
