import { describe, expect, it } from 'vitest';
import { createInitialState, setSettings, type GameState } from '../src/core';
import { T } from '../src/content/texts';
import { nextTip, TOUR, tourNext, type TourStep } from '../src/ui/onboarding';

/** Walk the tour from the start, as the "Nästa" button does. */
function walk(): TourStep[] {
  const seen: TourStep[] = [];
  for (let s: TourStep | null = TOUR[0]; s; s = tourNext(s)) seen.push(s);
  return seen;
}

describe('replay onboarding tour', () => {
  const veteran: GameState = { ...createInitialState(0), prestiges: 3 };
  const tipsOff = setSettings(createInitialState(0), { tips: false });
  const allSeen: GameState = { ...createInitialState(0), tipsSeen: ['sync', 'buy', 'event'] };

  it('regular tips stay hidden for these players, so a reset of tipsSeen would not help', () => {
    for (const s of [veteran, tipsOff, allSeen]) expect(nextTip(s)).toBeNull();
  });

  it('starts at SYNKA and walks buy, event and help in order, then ends', () => {
    expect(TOUR[0]).toBe('sync');
    expect(walk()).toEqual(['sync', 'buy', 'event', 'help']);
    expect(tourNext('help')).toBeNull();
  });

  it('is independent of state: tipsSeen and settings are untouched', () => {
    for (const s of [veteran, tipsOff, allSeen]) {
      const before = JSON.stringify({ tipsSeen: s.tipsSeen, settings: s.settings });
      expect(walk()[0]).toBe('sync');
      expect(JSON.stringify({ tipsSeen: s.tipsSeen, settings: s.settings })).toBe(before);
    }
  });

  it('every step has a Swedish text, and the event step explains events without one live', () => {
    for (const s of TOUR) expect(T.tips.tour[s].length).toBeGreaterThan(10);
    expect(T.tips.tour.event).toMatch(/event/i);
    expect(T.tips.next).toBe('Nästa');
    expect(T.tips.done).toBe('Klar');
    expect(T.help.replay).toBe('Visa introduktionen igen');
  });
});
