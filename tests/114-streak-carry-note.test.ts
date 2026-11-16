import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState } from '../src/core';
import { streakCarryLine } from '../src/ui/prestige';

const fresh = () => createInitialState(1_000_000);

describe('prestige: streak carries over note (114)', () => {
  it('text names the streak', () => {
    expect(T.prestige.streakCarry(6)).toBe('Din svit på 6 🔥 följer med till nästa läsår.');
  });

  it('shows the line when the running streak is visible', () => {
    expect(streakCarryLine({ ...fresh(), eventStreak: 6 })).toBe(T.prestige.streakCarry(6));
    expect(streakCarryLine({ ...fresh(), eventStreak: 3 })).toBe(T.prestige.streakCarry(3));
  });

  it('hides the line below the visible streak threshold', () => {
    expect(streakCarryLine(fresh())).toBeNull();
    expect(streakCarryLine({ ...fresh(), eventStreak: 2 })).toBeNull();
  });

  it('ignores the year best streak; only the running one carries over', () => {
    expect(streakCarryLine({ ...fresh(), eventStreak: 0, yearBestStreak: 8 })).toBeNull();
  });
});
