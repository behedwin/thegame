import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { meritStepToast, type MeritStepMemory } from '../src/ui/render-toasts';

// 1e9 KP this year gives 1 merit (divisor 1e9, exponent 0.5); 4e9 gives 2, 16e9 gives 4.
const at = (earned: number, prestiges = 0): GameState => ({
  ...createInitialState(0),
  prestiges,
  runEarned: new Decimal(earned),
});

/** Feeds a series of states through the toast like the UI does, returning the toasts shown. */
function run(states: GameState[], onYearTab = false, start: MeritStepMemory | null = null) {
  let prev: GameState | null = null;
  let mem = start;
  const texts: string[] = [];
  for (const s of states) {
    const r = meritStepToast(prev, s, mem, onYearTab);
    mem = r.memory;
    if (r.text) texts.push(r.text);
    prev = s;
  }
  return { texts, mem };
}

describe('toast when pending merits double since the year opened (119)', () => {
  it('toasts once the merits have doubled', () => {
    expect(run([at(5e8), at(1e9), at(2e9), at(4e9)]).texts).toEqual([T.toastMeritStep('2', 2)]);
  });

  it('does not toast the same step again', () => {
    expect(run([at(5e8), at(1e9), at(4e9), at(5e9), at(8e9)]).texts).toHaveLength(1);
  });

  it('toasts again at the next doubling', () => {
    expect(run([at(5e8), at(1e9), at(4e9), at(16e9)]).texts).toEqual([
      T.toastMeritStep('2', 2),
      T.toastMeritStep('4', 4),
    ]);
  });

  it('never toasts on the first render, even far past the opening', () => {
    expect(meritStepToast(null, at(16e9), null, false).text).toBeNull();
    // A loaded save counts from what it shows on load: no toast until that doubles.
    expect(run([at(16e9), at(20e9), at(64e9)]).texts).toEqual([T.toastMeritStep('8', 8)]);
  });

  it('stays quiet on the Läsår tab but counts the step as seen', () => {
    const quiet = run([at(5e8), at(1e9), at(4e9)], true);
    expect(quiet.texts).toEqual([]);
    expect(run([at(4e9), at(5e9)], false, quiet.mem).texts).toEqual([]);
  });

  it('resets after a year change', () => {
    const first = run([at(5e8), at(1e9), at(4e9)]);
    const next = run([at(0, 1), at(1e9, 1), at(4e9, 1)], false, first.mem);
    expect(next.texts).toEqual([T.toastMeritStep('2', 2)]);
  });

  it('says nothing before a new year can be started', () => {
    expect(run([at(1e7), at(1e8), at(5e8)]).texts).toEqual([]);
  });

  it('uses the right plural and says nothing about hurrying', () => {
    expect(T.toastMeritStep('2', 2)).toContain('2 meriter');
    expect(T.toastMeritStep('1', 1)).toContain('1 merit ');
    expect(T.toastMeritStep('2', 2).toLowerCase()).not.toMatch(/snabbt|skynda|bråttom|nu direkt/);
  });
});
