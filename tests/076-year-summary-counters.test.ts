import { describe, expect, it } from 'vitest';
import { EVENTS, TICKETS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { answerTicket, claimEvent, createInitialState, Decimal, prestige, spawnEvent, yearSummary, type GameState } from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const event = EVENTS[0]!;
const ticket = TICKETS[0]!;
const fresh = (): GameState => ({ ...createInitialState(0), timeMs: 10_000 });
const solve = (s: GameState): GameState => claimEvent(spawnEvent(s, event)).state;
const answer = (s: GameState): GameState => answerTicket({ ...s, inbox: [ticket.id] }, ticket.id, 0).state;

describe('year counters (task 076)', () => {
  it('start at zero and count solved events and answered tickets', () => {
    let s = fresh();
    expect(s.yearEvents).toBe(0);
    expect(s.yearTickets).toBe(0);
    s = answer(solve(solve(s)));
    expect(s.yearEvents).toBe(2);
    expect(s.yearTickets).toBe(1);
    expect(s.eventsClaimed).toBe(2);
    expect(s.ticketsAnswered).toBe(1);
  });

  it('do not mutate their input', () => {
    const s = spawnEvent(fresh(), event);
    const before = JSON.stringify(s);
    claimEvent(s);
    answerTicket({ ...s, inbox: [ticket.id] }, ticket.id, 0);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('reset on a new school year while the totals stay', () => {
    const s = { ...answer(solve(fresh())), runEarned: new Decimal('4e9'), totalEarned: new Decimal('4e9') };
    const next = prestige(s);
    expect(next.prestiges).toBe(1);
    expect(next.yearEvents).toBe(0);
    expect(next.yearTickets).toBe(0);
    expect(next.eventsClaimed).toBe(1);
    expect(next.ticketsAnswered).toBe(1);
  });

  it('are part of the year summary, with Swedish lines', () => {
    const sum = yearSummary(answer(answer(solve(fresh()))));
    expect(sum.events).toBe(1);
    expect(sum.tickets).toBe(2);
    expect(T.prestige.summaryEvents(1)).toBe('1 event löst');
    expect(T.prestige.summaryEvents(7)).toBe('7 event lösta');
    expect(T.prestige.summaryTickets(1)).toBe('1 ärende stängt');
    expect(T.prestige.summaryTickets(12)).toBe('12 ärenden stängda');
  });
});

describe('year counters save (task 076)', () => {
  it('migrates older saves to zero', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(14);
    expect(migrate({ version: 13, eventsClaimed: 9 }, MIGRATIONS, 14)).toMatchObject({ version: 14, yearEvents: 0, yearTickets: 0 });
  });

  it('round-trips and repairs bad values', () => {
    const s = answer(solve(fresh()));
    const back = deserialize(serialize(s), 0);
    expect(back.yearEvents).toBe(1);
    expect(back.yearTickets).toBe(1);
    const bad = JSON.parse(serialize(s));
    bad.yearEvents = 'x';
    bad.yearTickets = -3;
    const fixed = deserialize(JSON.stringify(bad), 0);
    expect(fixed.yearEvents).toBe(0);
    expect(fixed.yearTickets).toBe(0);
  });
});
