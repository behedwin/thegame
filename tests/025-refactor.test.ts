import { describe, expect, it } from 'vitest';
import {
  AUTOMATIONS,
  byId,
  CUSTOMERS,
  EVENTS,
  MERITS,
  senderName,
  SYSTEMS,
  systemName,
  TICKETS,
  UPGRADES,
} from '../src/content/registry';
import {
  applyEffect,
  createInitialState,
  Decimal,
  getAutomation,
  getEvent,
  getMerit,
  getTicket,
  getUpgrade,
  receiveTicket,
  refillInboxOffline,
  mulberry32,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { inboxButtonVisible } from '../src/ui/inbox';

function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o);
    for (const v of Object.values(o)) if (v && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
  }
  return o;
}

describe('025 byId lookup', () => {
  it('finds every definition by its id and gives undefined for unknown ids', () => {
    const list = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }];
    const get = byId(list);
    expect(get('a')).toBe(list[0]);
    expect(get('b')).toBe(list[1]);
    expect(get('c')).toBeUndefined();
    expect(get('')).toBeUndefined();
  });

  it('is a snapshot: later changes to the list are not seen', () => {
    const list = [{ id: 'a' }];
    const get = byId(list);
    list.push({ id: 'b' });
    expect(get('b')).toBeUndefined();
  });

  const cases: [string, readonly { id: string }[], (id: string) => unknown][] = [
    ['automations', AUTOMATIONS, getAutomation],
    ['upgrades', UPGRADES, getUpgrade],
    ['merits', MERITS, getMerit],
    ['events', EVENTS, getEvent],
    ['tickets', TICKETS, getTicket],
  ];
  for (const [name, list, get] of cases) {
    it(`core getter for ${name} returns the same object as the registry list`, () => {
      expect(list.length).toBeGreaterThan(0);
      for (const d of list) expect(get(d.id)).toBe(d);
      expect(get('does-not-exist')).toBeUndefined();
      expect(get('__proto__')).toBeUndefined();
    });
  }

  it('display names fall back to the id and prefer customers over systems for senders', () => {
    for (const s of SYSTEMS) expect(systemName(s.id)).toBe(s.name);
    for (const c of CUSTOMERS) expect(senderName(c.id)).toBe(c.name);
    for (const s of SYSTEMS) if (!CUSTOMERS.some((c) => c.id === s.id)) expect(senderName(s.id)).toBe(s.name);
    expect(systemName('okänd')).toBe('okänd');
    expect(senderName('okänd')).toBe('okänd');
  });
});

describe('025 applyEffect', () => {
  const base = (): GameState => ({ ...createInitialState(0), timeMs: 1000 });

  it('lump grants at least minKp and adds it to kp', () => {
    const s = deepFreeze(base());
    const r = applyEffect(s, 'x', { kind: 'lump', seconds: 10, minKp: 50 });
    expect(r.granted.gte(50)).toBe(true);
    expect(r.state.kp.eq(s.kp.add(r.granted))).toBe(true);
    expect(r.state.buffs).toEqual([]);
  });

  it('a buff from the same source replaces the old one; other sources stay', () => {
    let s = base();
    s = applyEffect(s, 'a', { kind: 'prodMult', mult: 2, durationMs: 5000 }).state;
    s = applyEffect(s, 'b', { kind: 'clickMult', mult: 3, durationMs: 5000 }).state;
    const frozen = deepFreeze(s);
    const r = applyEffect(frozen, 'a', { kind: 'prodMult', mult: 4, durationMs: 9000 });
    expect(r.granted.eq(0)).toBe(true);
    expect(r.state.buffs.map((b) => [b.source, b.mult, b.untilMs])).toEqual([
      ['b', 3, 6000],
      ['a', 4, 10000],
    ]);
    expect(frozen.buffs).toHaveLength(2);
  });
});

describe('025 ticket edge cases', () => {
  it('refillInboxOffline ignores negative, NaN and infinite absences', () => {
    const s = createInitialState(0);
    for (const away of [-1, 0, NaN, Infinity, -Infinity]) {
      expect(refillInboxOffline(s, away, mulberry32(1))).toBe(s);
    }
  });

  it('receiveTicket leaves a full inbox and its clock untouched', () => {
    const ids = TICKETS.slice(0, 3).map((t) => t.id);
    const s = { ...createInitialState(0), inbox: ids, timeMs: 10_000_000 };
    expect(receiveTicket(s, mulberry32(2))).toBe(s);
  });
});

describe('025 save normalization', () => {
  it('bad tickets numbers fall back to safe defaults', () => {
    const raw = JSON.parse(serialize(createInitialState(0)));
    raw.nextTicketAtMs = 'soon';
    raw.ticketsAnswered = null;
    raw.inbox = 'x';
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.inbox).toEqual([]);
    expect(Number.isFinite(s.nextTicketAtMs)).toBe(true);
    expect(s.ticketsAnswered).toBe(0);
  });

  it('round-trips a state with kp as Decimal', () => {
    const s = { ...createInitialState(0), kp: new Decimal('1e300') };
    expect(deserialize(serialize(s), 0).kp.eq('1e300')).toBe(true);
  });
});

describe('025 inbox button', () => {
  it('is hidden until the first ticket and then stays', () => {
    const s = createInitialState(0);
    expect(inboxButtonVisible(s)).toBe(false);
    expect(inboxButtonVisible({ ...s, inbox: [TICKETS[0]!.id] })).toBe(true);
    expect(inboxButtonVisible({ ...s, ticketsAnswered: 1 })).toBe(true);
  });
});
