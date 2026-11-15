import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS, EVENTS, TICKETS, type EventEffect } from '../src/content/registry';
import { T } from '../src/content/texts';
import { claimEvent, createInitialState, Decimal, spawnEvent, type GameState } from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { buffLines } from '../src/ui/hud';
import { effectText, receiptText } from '../src/ui/effects';

const producing = (): GameState => ({ ...createInitialState(0), timeMs: 10_000, automations: { [AUTOMATIONS[0]!.id]: 10 } });
const HANDWRITTEN = [/×\s*\d/, /Du får en klump KP/, /\d+ s!/];
const valid = (e: EventEffect) => (e.kind === 'lump' ? e.seconds > 0 && e.minKp > 0 : e.mult > 1 && e.durationMs > 0);

describe('one effect text for events and tickets (task 045)', () => {
  it('no event or ticket text spells out its own effect', () => {
    const texts = [...EVENTS.map((e) => [e.id, e.claimText] as const), ...TICKETS.flatMap((t) => t.choices.map((c) => [t.id, c.outcome] as const))];
    for (const [id, text] of texts) for (const re of HANDWRITTEN) expect(text, id).not.toMatch(re);
  });

  it('every event and ticket choice has a usable effect', () => {
    for (const e of EVENTS) expect(valid(e.effect), e.id).toBe(true);
    for (const t of TICKETS) {
      expect(t.choices.length, t.id).toBeGreaterThanOrEqual(2);
      for (const c of t.choices) expect(valid(c.effect) && c.label.trim() !== '' && c.outcome.trim() !== '', t.id).toBe(true);
    }
  });

  it('a claimed lump event ends its toast with the KP actually granted', () => {
    const def = EVENTS.find((e) => e.effect.kind === 'lump')!;
    const r = claimEvent(spawnEvent(producing(), def));
    expect(r.granted.gt(0)).toBe(true);
    expect(receiptText(def.claimText, def.effect, r.state, r.granted)).toBe(`${def.claimText} ${effectText({ kind: 'lump', kp: r.granted })}.`);
  });

  it('a claimed buff event ends its toast with the buff, in the same words as the HUD chip', () => {
    for (const def of EVENTS.filter((e) => e.effect.kind !== 'lump')) {
      const r = claimEvent(spawnEvent(producing(), def));
      const e = def.effect as Exclude<EventEffect, { kind: 'lump' }>;
      const name = `${e.kind === 'clickMult' ? 'KP/klick' : 'Produktion'} ×${String(e.mult).replace('.', ',')}`;
      expect(receiptText(def.claimText, def.effect, r.state, r.granted), def.id).toBe(`${def.claimText} ${name} i ${e.durationMs / 1000} s.`);
      expect(buffLines(r.state), def.id).toEqual([`${name} · ${e.durationMs / 1000} s`]);
    }
  });

  it('the receipt joins text and result with one space and a full stop', () => {
    expect(T.receipt('Klart.', '+5 KP')).toBe('Klart. +5 KP.');
  });
});

describe('save keeps what the inbox and buffs need (task 045)', () => {
  it('round-trips buffs, inbox and counters', () => {
    const s: GameState = {
      ...producing(),
      buffs: [{ source: 'mojibake', kind: 'prodMult', mult: 2, untilMs: 70_000 }],
      inbox: [TICKETS[0]!.id],
      ticketsAnswered: 4,
      eventsClaimed: 3,
      purchases: 7,
      bestRunEarned: new Decimal('1e40'),
    };
    const back = deserialize(serialize(s), 0);
    expect(back.buffs).toEqual(s.buffs);
    expect(back.inbox).toEqual(s.inbox);
    expect([back.ticketsAnswered, back.eventsClaimed, back.purchases]).toEqual([4, 3, 7]);
    expect(back.bestRunEarned.eq(s.bestRunEarned)).toBe(true);
  });

  it('drops unknown and duplicate tickets and keeps the inbox within its cap', () => {
    const ids = TICKETS.map((t) => t.id);
    const raw = { ...JSON.parse(serialize(producing())), inbox: ['nope', ids[0], ids[0], ...ids.slice(1), 42] };
    const back = deserialize(JSON.stringify(raw), 0);
    expect(back.inbox).toEqual(ids.slice(0, BALANCE.tickets.cap));
  });
});
