import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/content/registry';
import { checkAchievements, createInitialState, isMet, type GameState } from '../src/core';

const fresh = () => createInitialState(1_000);
const withTickets = (n: number): GameState => ({ ...fresh(), ticketsAnswered: n });

describe('ticketsAnswered condition', () => {
  it('holds at exactly n and not at n - 1', () => {
    const c = { kind: 'ticketsAnswered', n: 10 } as const;
    expect(isMet(withTickets(9), c)).toBe(false);
    expect(isMet(withTickets(10), c)).toBe(true);
    expect(isMet(withTickets(11), c)).toBe(true);
  });
});

describe('ticket trophies', () => {
  const ticketTrophies = ACHIEVEMENTS.filter((a) => a.condition.kind === 'ticketsAnswered');

  it('adds two trophies at 10 and 100 answered tickets with Swedish texts', () => {
    expect(ticketTrophies.map((a) => a.id).sort()).toEqual(['arendekungen', 'supportsvar']);
    const thresholds = ticketTrophies.map((a) => (a.condition.kind === 'ticketsAnswered' ? a.condition.n : 0));
    expect(thresholds.sort((a, b) => a - b)).toEqual([10, 100]);
    for (const a of ticketTrophies) {
      expect(a.name.trim()).not.toBe('');
      expect(a.desc).toMatch(/ärenden/);
    }
  });

  it('unlocks Supportsvar at 10 tickets and Ärendekungen at 100', () => {
    const at9 = checkAchievements(withTickets(9));
    expect(at9.achievements).not.toContain('supportsvar');
    const at10 = checkAchievements(withTickets(10));
    expect(at10.achievements).toContain('supportsvar');
    expect(at10.achievements).not.toContain('arendekungen');
    const at100 = checkAchievements(withTickets(100));
    expect(at100.achievements).toEqual(expect.arrayContaining(['supportsvar', 'arendekungen']));
  });
});
