import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState } from '../src/core';
import { statRows } from '../src/ui/stats';
import { fmt } from '../src/ui/format';

const fresh = () => createInitialState(0);

describe('stats: last year\'s KP (106)', () => {
  it('has no last-year row in the first school year', () => {
    const labels = statRows(fresh()).map((r) => r.label);
    expect(labels).not.toContain(T.stats.lastYear);
  });

  it('shows last year\'s KP right after this year once a year is done', () => {
    const s = { ...fresh(), prestiges: 1, runEarned: new Decimal(500), lastYearEarned: new Decimal(3e9) };
    const rows = statRows(s);
    const i = rows.findIndex((r) => r.label === T.stats.thisYear);
    expect(rows[i + 1]!.label).toBe(T.stats.lastYear);
    expect(rows[i + 1]!.value).toBe(`${fmt(new Decimal(3e9))} ${T.currency}`);
  });

  it('has a Swedish label', () => {
    expect(T.stats.lastYear).toBe('Förra läsåret');
  });
});
