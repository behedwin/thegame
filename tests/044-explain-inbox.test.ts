import { describe, expect, it } from 'vitest';
import { click, createInitialState, setSettings, spawnEvent, type GameState } from '../src/core';
import { BALANCE } from '../src/content/balance';
import { EVENTS, HELP } from '../src/content/registry';
import { T } from '../src/content/texts';
import { markTipSeen, nextTip, settleTips } from '../src/ui/onboarding';

/** A player who did the basics and just got the first ticket. */
const firstTicket = (s: GameState = createInitialState(0)): GameState => ({
  ...s,
  clicks: 5,
  automations: { csv: 1 },
  tipsSeen: ['sync', 'buy'],
  inbox: ['csv-semicolon'],
});

describe('inbox tip (task 044)', () => {
  it('shows when the first ticket has arrived and none is answered', () => {
    expect(nextTip(firstTicket())).toBe('inbox');
    expect(T.tips.inbox).toMatch(/aldrig/);
  });

  it('does not show before a ticket arrives, or after one is answered', () => {
    expect(nextTip({ ...firstTicket(), inbox: [] })).toBeNull();
    expect(nextTip({ ...firstTicket(), ticketsAnswered: 1 })).toBeNull();
  });

  it('respects the tips setting, tipsSeen and the first school year', () => {
    expect(nextTip(setSettings(firstTicket(), { tips: false }))).toBeNull();
    expect(nextTip(markTipSeen(firstTicket(), 'inbox'))).toBeNull();
    expect(nextTip({ ...firstTicket(), prestiges: 1 })).toBeNull();
  });

  it('never pushes earlier tips aside: sync, buy and a live event go first', () => {
    const fresh = { ...createInitialState(0), inbox: ['csv-semicolon'] };
    expect(nextTip(fresh)).toBe('sync');
    expect(nextTip(click(fresh))).toBe('buy');
    expect(nextTip(spawnEvent(firstTicket(), EVENTS[0]!))).toBe('event');
  });

  it('answering the ticket settles the tip as seen', () => {
    const s = settleTips({ ...firstTicket(), inbox: [], ticketsAnswered: 1 }, 'inbox');
    expect(s.tipsSeen).toContain('inbox');
  });
});

describe('inbox help and dialog text (task 044)', () => {
  const inbox = HELP.find((s) => s.id === 'inkorgen');
  const event = HELP.find((s) => s.id === 'event')!;

  it('has its own help section directly after events', () => {
    expect(inbox).toBeDefined();
    expect(HELP.indexOf(inbox!)).toBe(HELP.indexOf(event) + 1);
  });

  it('explains cap, pace, no expiry and the three effect kinds, with numbers from balance.ts', () => {
    const text = inbox!.body.join(' ');
    expect(text).toContain(`var ${BALANCE.tickets.intervalMs / 60_000}:e minut`);
    expect(text).toContain(`${BALANCE.tickets.cap} ärenden`);
    expect(text).toMatch(/går aldrig ut/);
    expect(text).toMatch(/produktion/i);
    expect(text).toMatch(/klick/i);
    expect(text).toMatch(/KP direkt/);
  });

  it('the event section no longer explains tickets', () => {
    expect(event.body.join(' ')).not.toMatch(/inkorg/i);
  });

  it('the dialog note names the cap from balance.ts', () => {
    expect(T.inbox.note).toContain(`Högst ${BALANCE.tickets.cap}`);
  });
});
