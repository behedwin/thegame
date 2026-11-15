import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, Decimal, prestige, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const ready = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  runEarned: new Decimal('4e9'),
  totalEarned: new Decimal('4e9'),
  ...over,
});

describe('year summary compares with last school year (task 078)', () => {
  it('prestige keeps the finished year as last year and resets the running counters', () => {
    const next = prestige(ready({ yearEvents: 7, yearTickets: 12 }));
    expect(next.prestiges).toBe(1);
    expect(next.lastYearEvents).toBe(7);
    expect(next.lastYearTickets).toBe(12);
    expect(next.yearEvents).toBe(0);
    expect(next.yearTickets).toBe(0);
  });

  it('the first school year shows no difference', () => {
    const s = yearSummary(ready({ yearEvents: 3, yearTickets: 2 }));
    expect(s.eventsDiff).toBeNull();
    expect(s.ticketsDiff).toBeNull();
  });

  it('later years show the difference: positive, negative and zero', () => {
    const s = yearSummary(ready({ prestiges: 2, yearEvents: 7, yearTickets: 4, lastYearEvents: 5, lastYearTickets: 9 }));
    expect(s.eventsDiff).toBe(2);
    expect(s.ticketsDiff).toBe(-5);
    const same = yearSummary(ready({ prestiges: 1, yearEvents: 3, yearTickets: 3, lastYearEvents: 3, lastYearTickets: 3 }));
    expect(same.eventsDiff).toBe(0);
    expect(same.ticketsDiff).toBe(0);
  });

  it('formats the difference in Swedish', () => {
    expect(T.prestige.summaryDiff(2)).toBe(' (+2)');
    expect(T.prestige.summaryDiff(-5)).toBe(' (−5)');
    expect(T.prestige.summaryDiff(0)).toBe(' (±0)');
  });

  it('does not mutate its input', () => {
    const s = ready({ yearEvents: 4, yearTickets: 1, lastYearEvents: 2 });
    const before = JSON.stringify(s);
    prestige(s);
    yearSummary(s);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('last year save (task 078)', () => {
  it('migrates older saves to zero', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(15);
    expect(migrate({ version: 14, yearEvents: 3 }, MIGRATIONS, 15)).toMatchObject({ version: 15, lastYearEvents: 0, lastYearTickets: 0 });
  });

  it('round-trips and repairs bad values', () => {
    const s = ready({ lastYearEvents: 6, lastYearTickets: 8 });
    const back = deserialize(serialize(s), 0);
    expect(back.lastYearEvents).toBe(6);
    expect(back.lastYearTickets).toBe(8);
    const bad = JSON.parse(serialize(s));
    bad.lastYearEvents = 'x';
    bad.lastYearTickets = -1;
    const fixed = deserialize(JSON.stringify(bad), 0);
    expect(fixed.lastYearEvents).toBe(0);
    expect(fixed.lastYearTickets).toBe(0);
  });
});
