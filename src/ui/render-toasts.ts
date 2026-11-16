// Toasts that compare one render with the next (087, 109, 112). Pure, so it can be tested without a DOM.
import { T } from '../content/texts';
import { passedBestYear, passedLastYear, type GameState } from '../core';

/** The bigger year record first: passing the best year outranks passing last year (112). */
const yearToast = (prev: GameState, next: GameState): string[] =>
  passedBestYear(prev, next) ? [T.toastBestYear] : passedLastYear(prev, next) ? [T.toastBeatLastYear] : [];

/** A year record, then a new hub tier. `prev` is null on the first render, so a loaded save never toasts. */
export const renderToasts = (prev: GameState | null, next: GameState, tierUp: number | null): string[] => [
  ...(prev ? yearToast(prev, next) : []),
  ...(tierUp === null ? [] : [T.hubTierUp(T.hubTiers[tierUp] ?? '')]),
];
