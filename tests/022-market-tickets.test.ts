import { describe, expect, it } from 'vitest';
import { EVENTS, TICKETS } from '../src/content/registry';

const MARKET_TICKETS = [
  'platform-of-platforms',
  'now-with-ai',
  'license-per-second',
  'we-have-an-api',
  'roadmap-q3',
  'procurement-400-pages',
  'vendor-renamed-again',
  'trade-fair-demo',
];
const MARKET_EVENTS = ['friday-update', 'promised-integration', 'pre-study-quote'];

describe('022 market humor content', () => {
  it('has at least 12 tickets in total', () => {
    expect(TICKETS.length).toBeGreaterThanOrEqual(12);
  });

  it('registers all market tickets and events', () => {
    const ticketIds = new Set(TICKETS.map((t) => t.id));
    for (const id of MARKET_TICKETS) expect(ticketIds.has(id), id).toBe(true);
    const eventIds = new Set(EVENTS.map((e) => e.id));
    for (const id of MARKET_EVENTS) expect(eventIds.has(id), id).toBe(true);
  });

  it('gives every market ticket choices with different effect kinds (trade-offs, not duplicates)', () => {
    for (const id of MARKET_TICKETS) {
      const t = TICKETS.find((x) => x.id === id)!;
      const kinds = t.choices.map((c) => c.effect.kind);
      expect(new Set(kinds).size, id).toBe(kinds.length);
    }
  });

  it('keeps the new events within existing effect magnitudes', () => {
    for (const id of MARKET_EVENTS) {
      const e = EVENTS.find((x) => x.id === id)!;
      if (e.effect.kind === 'lump') expect(e.effect.seconds).toBeLessThanOrEqual(60);
      else {
        expect(e.effect.mult).toBeLessThanOrEqual(5);
        expect(e.effect.durationMs).toBeLessThanOrEqual(60_000);
      }
    }
  });
});
