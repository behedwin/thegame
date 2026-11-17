import Decimal from 'break_infinity.js';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { createInitialState, type GameState } from '../src/core';
import { meritStepToast, prestigeReadyToast, withMemory, type YearToastFn } from '../src/ui/render-toasts';

// 1e9 KP this year gives 1 merit (divisor 1e9, exponent 0.5); 4e9 gives 2, 16e9 gives 4.
const at = (earned: number, prestiges = 0): GameState => ({
  ...createInitialState(0),
  prestiges,
  runEarned: new Decimal(earned),
});

/** Feeds states through both year toasts the way app.ts does, returning the texts per render. */
function play(states: GameState[], onYearTab: (i: number) => boolean = () => false): string[][] {
  const toasts = [withMemory(prestigeReadyToast, null), withMemory(meritStepToast, null)];
  let prev: GameState | null = null;
  return states.map((s, i) => {
    const out = toasts.map((t) => t(prev, s, onYearTab(i))).filter((x): x is string => x !== null);
    prev = s;
    return out;
  });
}

describe('withMemory (120)', () => {
  it('passes the returned memory into the next call', () => {
    const seen: number[] = [];
    const counter: YearToastFn<number> = (_p, _n, m) => {
      seen.push(m);
      return { text: m === 2 ? 'två' : null, memory: m + 1 };
    };
    const t = withMemory(counter, 0);
    const s = at(0);
    expect([t(null, s, false), t(s, s, false), t(s, s, false)]).toEqual([null, null, 'två']);
    expect(seen).toEqual([0, 1, 2]);
  });

  it('keeps separate memory for separate wrappers', () => {
    const a = withMemory(prestigeReadyToast, null);
    const b = withMemory(prestigeReadyToast, null);
    expect(a(at(5e8), at(1e9), false)).toBe(T.toastPrestigeReady('1', 1));
    expect(a(at(5e8), at(1e9), false)).toBeNull();
    expect(b(at(5e8), at(1e9), false)).toBe(T.toastPrestigeReady('1', 1));
  });
});

describe('year toasts across school years (120, from 116 and 119)', () => {
  it('a whole year: ready once, then one toast per doubling', () => {
    const texts = play([at(1e8), at(1e9), at(5e8), at(1e9), at(4e9), at(16e9)]);
    expect(texts).toEqual([
      [],
      [T.toastPrestigeReady('1', 1)],
      [],
      [],
      [T.toastMeritStep('2', 2)],
      [T.toastMeritStep('4', 4)],
    ]);
  });

  it('starts over in the next school year', () => {
    const texts = play([at(1e8), at(1e9), at(4e9), at(0, 1), at(1e9, 1), at(4e9, 1)]);
    expect(texts.flat()).toEqual([
      T.toastPrestigeReady('1', 1),
      T.toastMeritStep('2', 2),
      T.toastPrestigeReady('1', 1),
      T.toastMeritStep('2', 2),
    ]);
  });

  it('a loaded save that can already start a year shows nothing on the first renders', () => {
    expect(play([at(4e9), at(4e9), at(5e9)]).flat()).toEqual([]);
  });

  it('on the Läsår tab nothing shows, and leaving it does not replay what was seen', () => {
    const states = [at(1e8), at(1e9), at(4e9), at(5e9), at(16e9)];
    const texts = play(states, (i) => i <= 3);
    expect(texts).toEqual([[], [], [], [], [T.toastMeritStep('4', 4)]]);
  });
});
