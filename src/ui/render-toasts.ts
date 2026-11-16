// Toasts that compare one render with the next (087, 109). Pure, so it can be tested without a DOM.
import { T } from '../content/texts';
import { passedLastYear, type GameState } from '../core';

/** Passing last year's KP, then a new hub tier. `prev` is null on the first render, so a loaded save never toasts. */
export const renderToasts = (prev: GameState | null, next: GameState, tierUp: number | null): string[] => [
  ...(prev && passedLastYear(prev, next) ? [T.toastBeatLastYear] : []),
  ...(tierUp === null ? [] : [T.hubTierUp(T.hubTiers[tierUp] ?? '')]),
];
