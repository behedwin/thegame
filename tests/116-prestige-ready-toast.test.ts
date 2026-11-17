import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { prestigeReadyToast } from '../src/ui/render-toasts';

// 1e9 KP this year gives 1 merit (divisor 1e9, exponent 0.5); 4e9 gives 2.
const at = (earned: number, prestiges = 0): GameState => ({
  ...createInitialState(0),
  prestiges,
  runEarned: new Decimal(earned),
});

describe('toast when a new school year can first be started (116)', () => {
  it('toasts on the transition false -> true and remembers the year', () => {
    const r = prestigeReadyToast(at(5e8), at(1e9), null, false);
    expect(r).toEqual({ text: T.toastPrestigeReady('1', 1), shownYear: 0 });
    expect(r.text).toContain('1 merit');
  });

  it('uses the plural for more than one merit', () => {
    expect(prestigeReadyToast(at(5e8), at(4e9), null, false).text).toBe(T.toastPrestigeReady('2', 2));
    expect(T.toastPrestigeReady('2', 2)).toContain('2 meriter');
  });

  it('never toasts on the first render', () => {
    expect(prestigeReadyToast(null, at(1e9), null, false)).toEqual({ text: null, shownYear: null });
  });

  it('does not toast while it stays true or stays false', () => {
    expect(prestigeReadyToast(at(1e9), at(2e9), null, false).text).toBeNull();
    expect(prestigeReadyToast(at(1e8), at(2e8), null, false).text).toBeNull();
  });

  it('does not toast a second time in the same school year', () => {
    const first = prestigeReadyToast(at(5e8), at(1e9), null, false);
    expect(prestigeReadyToast(at(5e8), at(1e9), first.shownYear, false)).toEqual({ text: null, shownYear: 0 });
  });

  it('toasts again in the next school year', () => {
    expect(prestigeReadyToast(at(5e8, 1), at(1e9, 1), 0, false)).toEqual({
      text: T.toastPrestigeReady('1', 1),
      shownYear: 1,
    });
  });

  it('stays quiet on the Läsår tab but counts the year as seen', () => {
    expect(prestigeReadyToast(at(5e8), at(1e9), null, true)).toEqual({ text: null, shownYear: 0 });
  });

  it('says nothing about hurrying', () => {
    expect(T.toastPrestigeReady('1', 1).toLowerCase()).not.toMatch(/snabbt|skynda|bråttom|nu direkt/);
  });
});
