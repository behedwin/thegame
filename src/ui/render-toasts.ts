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

export interface PrestigeReadyToast { text: string | null; shownYear: number | null }

/**
 * First time in a school year that a new one can be started (116). `shownYear` is the year (`prestiges`) last
 * toasted, kept in memory by the UI so the toast does not repeat if the value flickers. On the Läsår tab the
 * player already sees it, so the year counts as seen without a toast.
 */
export function prestigeReadyToast(
  prev: GameState | null,
  next: GameState,
  shownYear: number | null,
  onYearTab: boolean,
): PrestigeReadyToast {
  const opened = prev !== null && !canPrestige(prev) && canPrestige(next) && shownYear !== next.prestiges;
  if (!opened) return { text: null, shownYear };
  const merits = pendingMerits(next);
  return {
    text: onYearTab ? null : T.toastPrestigeReady(fmt(merits), merits.toNumber()),
    shownYear: next.prestiges,
  };
}

/** Per school year: merits when it opened (or first seen) and the last doubling toasted (119). In memory only. */
export interface MeritStepMemory { year: number; base: Decimal; step: number }
export interface MeritStepToast { text: string | null; memory: MeritStepMemory | null }

/**
 * Calm toast each time the pending merits double since the year could first be started (119). Nothing on the
 * first render (a loaded save counts from what it shows), and on the Läsår tab the step counts as seen.
 */
export function meritStepToast(
  prev: GameState | null,
  next: GameState,
  memory: MeritStepMemory | null,
  onYearTab: boolean,
): MeritStepToast {
  if (!canPrestige(next)) return { text: null, memory: null };
  const merits = pendingMerits(next);
  if (prev === null || memory === null || memory.year !== next.prestiges) {
    return { text: null, memory: { year: next.prestiges, base: merits, step: 0 } };
  }
  const step = Math.floor(merits.div(memory.base).log2() + 1e-9);
  if (step <= memory.step) return { text: null, memory };
  return {
    text: onYearTab ? null : T.toastMeritStep(fmt(merits), merits.toNumber()),
    memory: { ...memory, step },
  };
}
