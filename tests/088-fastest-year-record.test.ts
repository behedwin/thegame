import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, Decimal, prestige, yearDurationMs, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { statRows } from '../src/ui/stats';

const ready = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  runEarned: new Decimal('4e9'),
  totalEarned: new Decimal('4e9'),
  ...over,
});

describe('fastest school year record (task 088)', () => {
  it('measures the running year from its start in game time', () => {
    expect(yearDurationMs(ready({ timeMs: 50_000, yearStartMs: 20_000 }))).toBe(30_000);
    expect(yearDurationMs(ready({ timeMs: 10_000, yearStartMs: 20_000 }))).toBe(0);
  });

  it('sets the record at the first prestige and starts the next year now', () => {
    const next = prestige(ready({ timeMs: 3_000_000 }));
    expect(next.fastestYearMs).toBe(3_000_000);
    expect(next.yearStartMs).toBe(3_000_000);
  });

  it('lowers the record only when a year is faster', () => {
    const slower = prestige(ready({ prestiges: 1, timeMs: 9_000_000, yearStartMs: 5_000_000, fastestYearMs: 3_000_000 }));
    expect(slower.fastestYearMs).toBe(3_000_000);
    const faster = prestige(ready({ prestiges: 1, timeMs: 7_000_000, yearStartMs: 5_000_000, fastestYearMs: 3_000_000 }));
    expect(faster.fastestYearMs).toBe(2_000_000);
    expect(faster.yearStartMs).toBe(7_000_000);
  });

  it('summary shows the duration and a new record only when an earlier record is beaten', () => {
    expect(yearSummary(ready({ timeMs: 3_000_000 }))).toMatchObject({ durationMs: 3_000_000, fastestYear: false });
    expect(yearSummary(ready({ prestiges: 1, timeMs: 7_000_000, yearStartMs: 5_000_000, fastestYearMs: 3_000_000 })).fastestYear).toBe(true);
    expect(yearSummary(ready({ prestiges: 1, timeMs: 9_000_000, yearStartMs: 5_000_000, fastestYearMs: 3_000_000 })).fastestYear).toBe(false);
  });

  it('does not mutate its input', () => {
    const s = ready({ prestiges: 1, timeMs: 7_000_000, yearStartMs: 5_000_000, fastestYearMs: 3_000_000 });
    const before = JSON.stringify(s);
    prestige(s);
    yearSummary(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('shows the stats row only once a record exists', () => {
    const labels = (s: GameState) => statRows(s).map((r) => r.label);
    expect(labels(ready())).not.toContain(T.stats.fastestYear);
    const row = statRows(ready({ fastestYearMs: 1_500_000 })).find((r) => r.label === T.stats.fastestYear);
    expect(row?.value).toBe('25 min');
  });

  it('has Swedish texts', () => {
    expect(T.prestige.summaryTime('25 min')).toBe('Läsåret tog 25 min');
    expect(T.prestige.summaryRecord).toMatch(/rekord/i);
  });
});

describe('fastest year save (task 088)', () => {
  it('migrates older saves without a record, the year starting now', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(17);
    expect(migrate({ version: 16, timeMs: 42_000 }, MIGRATIONS, 17)).toMatchObject({ version: 17, yearStartMs: 42_000, fastestYearMs: 0 });
    expect(migrate({ version: 16 }, MIGRATIONS, 17)).toMatchObject({ yearStartMs: 0, fastestYearMs: 0 });
  });

  it('round-trips and repairs bad values', () => {
    const s = ready({ timeMs: 9_000, yearStartMs: 4_000, fastestYearMs: 1_200_000 });
    const back = deserialize(serialize(s), 0);
    expect(back.yearStartMs).toBe(4_000);
    expect(back.fastestYearMs).toBe(1_200_000);
    for (const v of [-1, 'x', null, Infinity]) {
      const bad = JSON.parse(serialize(s));
      bad.fastestYearMs = v;
      bad.yearStartMs = v;
      const out = deserialize(JSON.stringify(bad), 0);
      expect(out.fastestYearMs).toBe(0);
      expect(out.yearStartMs).toBe(0);
    }
  });
});
