import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { CUSTOMERS, SYSTEMS, TICKETS, senderName } from '../src/content/registry';
import type { TicketDef } from '../src/content/types';
import {
  answerTicket,
  buy,
  click,
  createInitialState,
  getTicket,
  kpPerClick,
  kpPerSecond,
  mulberry32,
  prestige,
  receiveTicket,
  refillInboxOffline,
  type GameState,
} from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const CAP = BALANCE.tickets.cap;

function at(timeMs: number, s: GameState = createInitialState(0)): GameState {
  return { ...s, timeMs };
}

function withInbox(ids: string[], s: GameState = createInitialState(0)): GameState {
  return { ...s, inbox: ids };
}

function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o);
    for (const v of Object.values(o)) if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  }
  return o;
}

describe('021 ticket content', () => {
  const senders = new Set([...SYSTEMS.map((s) => s.id), ...CUSTOMERS.map((c) => c.id)]);

  it('has at least four tickets', () => {
    expect(TICKETS.length).toBeGreaterThanOrEqual(4);
  });

  it('every ticket has 2-3 choices, an existing sender and non-empty text', () => {
    for (const t of TICKETS) {
      expect(t.choices.length, t.id).toBeGreaterThanOrEqual(2);
      expect(t.choices.length, t.id).toBeLessThanOrEqual(3);
      expect(senders.has(t.from), `${t.id}.from = ${t.from}`).toBe(true);
      for (const s of [t.title, t.text, ...t.choices.flatMap((c) => [c.label, c.outcome])]) {
        expect(s.trim().length, t.id).toBeGreaterThan(0);
      }
      expect(senderName(t.from)).not.toBe(t.from);
    }
  });

  it('choices are trade-offs: no choice is just a bigger version of another', () => {
    for (const t of TICKETS) {
      // At least two different kinds of effect per ticket.
      expect(new Set(t.choices.map((c) => c.effect.kind)).size, t.id).toBeGreaterThanOrEqual(2);
      for (const a of t.choices) {
        for (const b of t.choices) {
          if (a === b || a.effect.kind !== b.effect.kind) continue;
          const ea = a.effect;
          const eb = b.effect;
          if (ea.kind === 'lump' && eb.kind === 'lump') {
            expect(ea.seconds >= eb.seconds && ea.minKp >= eb.minKp, t.id).toBe(false);
          } else if (ea.kind !== 'lump' && eb.kind !== 'lump') {
            expect(ea.mult >= eb.mult && ea.durationMs >= eb.durationMs, t.id).toBe(false);
          }
        }
      }
    }
  });
});

describe('021 receiving tickets', () => {
  it('waits for nextTicketAtMs', () => {
    const s = { ...createInitialState(0), nextTicketAtMs: 5000 };
    const before = at(4999, s);
    expect(receiveTicket(before, mulberry32(1))).toBe(before);
  });

  it('adds one ticket and schedules the next within the jitter window', () => {
    const s = receiveTicket(at(BALANCE.tickets.firstAtMs), mulberry32(1));
    expect(s.inbox).toHaveLength(1);
    expect(getTicket(s.inbox[0]!)).toBeDefined();
    const wait = s.nextTicketAtMs - s.timeMs;
    expect(wait).toBeGreaterThanOrEqual(BALANCE.tickets.intervalMs * (1 - BALANCE.tickets.jitter));
    expect(wait).toBeLessThanOrEqual(BALANCE.tickets.intervalMs * (1 + BALANCE.tickets.jitter));
  });

  it('never holds the same ticket twice and stops at the cap', () => {
    let s = createInitialState(0);
    const rng = mulberry32(7);
    for (let i = 0; i < 20; i++) s = receiveTicket(at(s.nextTicketAtMs + 1, s), rng);
    expect(s.inbox).toHaveLength(CAP);
    expect(new Set(s.inbox).size).toBe(CAP);
    const full = at(s.timeMs + 10 * BALANCE.tickets.intervalMs, s);
    expect(receiveTicket(full, rng)).toBe(full);
  });

  it('is deterministic with the same seed', () => {
    const run = (seed: number) => {
      let s = createInitialState(0);
      const rng = mulberry32(seed);
      for (let i = 0; i < CAP; i++) s = receiveTicket(at(s.nextTicketAtMs, s), rng);
      return [s.inbox, s.nextTicketAtMs];
    };
    expect(run(42)).toEqual(run(42));
  });

  it('does not mutate its input', () => {
    const s = deepFreeze(at(BALANCE.tickets.firstAtMs));
    expect(() => receiveTicket(s, mulberry32(3))).not.toThrow();
    expect(s.inbox).toEqual([]);
  });
});

describe('021 answering tickets', () => {
  const find = (kind: TicketDef['choices'][number]['effect']['kind']) => {
    for (const t of TICKETS) {
      const i = t.choices.findIndex((c) => c.effect.kind === kind);
      if (i >= 0) return { t, i };
    }
    throw new Error(`no ticket choice of kind ${kind}`);
  };

  it('lump: grants KP now and removes the ticket', () => {
    const { t, i } = find('lump');
    const s0 = withInbox([t.id], buy(click(createInitialState(0), 50), 'csv'));
    const r = answerTicket(s0, t.id, i);
    expect(r.choice).toBe(t.choices[i]);
    expect(r.granted.gt(0)).toBe(true);
    expect(r.state.kp.eq(s0.kp.add(r.granted))).toBe(true);
    expect(r.state.inbox).toEqual([]);
    expect(r.state.ticketsAnswered).toBe(1);
  });

  it('prodMult: multiplies production for a while', () => {
    const { t, i } = find('prodMult');
    const s0 = withInbox([t.id], buy(click(createInitialState(0), 50), 'csv'));
    const r = answerTicket(s0, t.id, i);
    const e = t.choices[i]!.effect as { mult: number };
    expect(kpPerSecond(r.state).toNumber()).toBeCloseTo(kpPerSecond(s0).toNumber() * e.mult);
    expect(r.granted.eq(0)).toBe(true);
  });

  it('clickMult: multiplies clicks for a while', () => {
    const { t, i } = find('clickMult');
    const s0 = withInbox([t.id]);
    const r = answerTicket(s0, t.id, i);
    const e = t.choices[i]!.effect as { mult: number };
    expect(kpPerClick(r.state).toNumber()).toBeCloseTo(kpPerClick(s0).toNumber() * e.mult);
  });

  it('ignores tickets not in the inbox and bad choice indexes', () => {
    const t = TICKETS[0]!;
    const s0 = withInbox([t.id]);
    const empty = createInitialState(0);
    expect(answerTicket(empty, t.id, 0).state).toBe(empty);
    expect(answerTicket(s0, t.id, 9).choice).toBeNull();
    expect(answerTicket(s0, t.id, 9).state).toBe(s0);
    expect(answerTicket(s0, 'nope', 0).state).toBe(s0);
  });

  it('answering from a full inbox restarts the clock instead of refilling instantly', () => {
    const ids = TICKETS.slice(0, CAP).map((t) => t.id);
    const s0 = { ...withInbox(ids, at(100_000)), nextTicketAtMs: 0 };
    const r = answerTicket(s0, ids[0]!, 0);
    expect(r.state.nextTicketAtMs).toBe(100_000 + BALANCE.tickets.intervalMs);
  });

  it('does not mutate its input', () => {
    const t = TICKETS[0]!;
    const s0 = deepFreeze(withInbox([t.id]));
    expect(() => answerTicket(s0, t.id, 0)).not.toThrow();
    expect(s0.inbox).toEqual([t.id]);
  });

  it('inbox and answered count survive a new school year', () => {
    const s0 = { ...withInbox([TICKETS[0]!.id]), ticketsAnswered: 4, runEarned: createInitialState(0).kp.add(1e12) };
    const p = prestige(s0);
    expect(p.inbox).toEqual(s0.inbox);
    expect(p.ticketsAnswered).toBe(4);
  });
});

describe('021 offline refill', () => {
  it('fills the inbox up to the cap after a long absence', () => {
    const r = refillInboxOffline(createInitialState(0), 8 * 3_600_000, mulberry32(5));
    expect(r.inbox).toHaveLength(CAP);
    expect(new Set(r.inbox).size).toBe(CAP);
  });

  it('a short absence gives at most what the clock allows', () => {
    const s = { ...createInitialState(0), nextTicketAtMs: 30_000 };
    expect(refillInboxOffline(s, 10_000, mulberry32(5)).inbox).toHaveLength(0);
    const r = refillInboxOffline(s, 40_000, mulberry32(5));
    expect(r.inbox).toHaveLength(1);
    expect(r.nextTicketAtMs).toBe(BALANCE.tickets.intervalMs - 10_000);
  });

  it('is deterministic and does not mutate', () => {
    const s = deepFreeze(createInitialState(0));
    expect(refillInboxOffline(s, 3_600_000, mulberry32(9))).toEqual(refillInboxOffline(s, 3_600_000, mulberry32(9)));
    expect(s.inbox).toEqual([]);
  });

  it('no time away gives the same state', () => {
    const s = createInitialState(0);
    expect(refillInboxOffline(s, 0, mulberry32(1))).toBe(s);
    expect(refillInboxOffline(s, -5, mulberry32(1))).toBe(s);
  });
});

describe('021 save format', () => {
  it('bumps the version and migrates v5 saves to an empty inbox with a ticket due now', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(6);
    expect(migrate({ version: 5, timeMs: 1234 }, MIGRATIONS, 6)).toEqual({
      version: 6,
      timeMs: 1234,
      inbox: [],
      nextTicketAtMs: 1234,
      ticketsAnswered: 0,
    });
    expect(migrate({ version: 5 }, MIGRATIONS, 6)).toMatchObject({ nextTicketAtMs: 0 });
  });

  it('round-trips the inbox and drops unknown or duplicate ids', () => {
    const t = TICKETS.slice(0, 2).map((x) => x.id);
    const s = { ...withInbox(t), nextTicketAtMs: 777, ticketsAnswered: 3 };
    const back = deserialize(serialize(s), 0);
    expect(back.inbox).toEqual(t);
    expect(back.nextTicketAtMs).toBe(777);
    expect(back.ticketsAnswered).toBe(3);
    const raw = JSON.parse(serialize(s));
    raw.inbox = ['nope', t[0], t[0], ...TICKETS.map((x) => x.id)];
    const expected = [t[0]!, ...TICKETS.map((x) => x.id).filter((id) => id !== t[0])].slice(0, CAP);
    expect(deserialize(JSON.stringify(raw), 0).inbox).toEqual(expected);
  });
});
