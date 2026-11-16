import { describe, expect, it } from 'vitest';
import { FOCUSES } from '../src/content/registry';
import { T } from '../src/content/texts';
import { createInitialState, DEFAULT_FOCUS, type GameState } from '../src/core';
import { statRows } from '../src/ui/stats';

const fresh = () => createInitialState(1_000_000);
const value = (s: GameState) => statRows(s).find((r) => r.label === T.stats.focusesPlayed)?.value;
const others = FOCUSES.filter((f) => f.id !== DEFAULT_FOCUS);

describe('stats: focuses played (099)', () => {
  it('counts every focus except the default', () => {
    expect(others.length).toBeGreaterThan(0);
    expect(others.length).toBe(FOCUSES.length - 1);
  });

  it('shows 0 of N in a new game', () => {
    expect(value(fresh())).toBe(`0 av ${others.length}`);
  });

  it('counts up as focusesPlayed grows', () => {
    const s = fresh();
    expect(value({ ...s, focusesPlayed: [others[0]!.id] })).toBe(`1 av ${others.length}`);
    const all = others.map((f) => f.id);
    expect(value({ ...s, focusesPlayed: all })).toBe(`${all.length} av ${others.length}`);
  });
});
