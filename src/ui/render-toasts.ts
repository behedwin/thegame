// Toasts that compare one render with the next (087, 109, 112, 116, 119). Pure, so it can be tested without a DOM.
import { T } from '../content/texts';
import { canPrestige, passedBestYear, passedLastYear, pendingMerits, type Decimal, type GameState } from '../core';
import { fmt } from './format';

/** Year records, biggest first: only the first one passed toasts (109, 112). Add new records here. */
const YEAR_RECORDS = [[passedBestYear, T.toastBestYear], [passedLastYear, T.toastBeatLastYear]] as const;

const yearToast = (prev: GameState, next: GameState): string[] =>
  YEAR_RECORDS.filter(([passed]) => passed(prev, next)).slice(0, 1).map(([, text]) => text);

/** A year record, then a new hub tier. `prev` is null on the first render, so a loaded save never toasts. */
export const renderToasts = (prev: GameState | null, next: GameState, tierUp: number | null): string[] => [
  ...(prev ? yearToast(prev, next) : []),
  ...(tierUp === null ? [] : [T.hubTierUp(T.hubTiers[tierUp] ?? '')]),
];

/**
 * A toast that keeps its own memory per school year between renders (116, 119). On the Läsår tab the player
 * already sees the year, so the memory moves on but no text is shown.
 */
export interface YearToast<M> { text: string | null; memory: M }
export type YearToastFn<M> = (prev: GameState | null, next: GameState, memory: M, onYearTab: boolean) => YearToast<M>;

/** Wraps a year toast so the UI does not keep its memory itself: returns the text to show, if any. */
export function withMemory<M>(fn: YearToastFn<M>, initial: M) {
  let memory = initial;
  return (prev: GameState | null, next: GameState, onYearTab: boolean): string | null => {
    const r = fn(prev, next, memory, onYearTab);
    memory = r.memory;
    return r.text;
  };
}

/** The pending merits in a toast text, or nothing on the Läsår tab. */
function meritText(next: GameState, onYearTab: boolean, text: (merits: string, n: number) => string): string | null {
  const merits = pendingMerits(next);
  return onYearTab ? null : text(fmt(merits), merits.toNumber());
}

/**
 * First time in a school year that a new one can be started (116). The memory is the year (`prestiges`) last
 * toasted, so the toast does not repeat if the value flickers.
 */
export const prestigeReadyToast: YearToastFn<number | null> = (prev, next, shownYear, onYearTab) => {
  const opened = prev !== null && !canPrestige(prev) && canPrestige(next) && shownYear !== next.prestiges;
  if (!opened) return { text: null, memory: shownYear };
  return { text: meritText(next, onYearTab, T.toastPrestigeReady), memory: next.prestiges };
};

/** Per school year: merits when it opened (or first seen) and the last doubling toasted (119). In memory only. */
export interface MeritStepMemory { year: number; base: Decimal; step: number }

/**
 * Calm toast each time the pending merits double since the year could first be started (119). Nothing on the
 * first render (a loaded save counts from what it shows), and on the Läsår tab the step counts as seen.
 */
export const meritStepToast: YearToastFn<MeritStepMemory | null> = (prev, next, memory, onYearTab) => {
  if (!canPrestige(next)) return { text: null, memory: null };
  const merits = pendingMerits(next);
  if (prev === null || memory === null || memory.year !== next.prestiges) {
    return { text: null, memory: { year: next.prestiges, base: merits, step: 0 } };
  }
  const step = Math.floor(merits.div(memory.base).log2() + 1e-9);
  if (step <= memory.step) return { text: null, memory };
  return { text: meritText(next, onYearTab, T.toastMeritStep), memory: { ...memory, step } };
};
