// Toasts that compare one render with the next (087, 109, 112). Pure, so it can be tested without a DOM.
import { T } from '../content/texts';
import { passedBestYear, passedLastYear, type GameState } from '../core';

/** Year records, biggest first: only the first one passed toasts (109, 112). Add new records here. */
const YEAR_RECORDS = [[passedBestYear, T.toastBestYear], [passedLastYear, T.toastBeatLastYear]] as const;

const yearToast = (prev: GameState, next: GameState): string[] =>
  YEAR_RECORDS.filter(([passed]) => passed(prev, next)).slice(0, 1).map(([, text]) => text);

/** A year record, then a new hub tier. `prev` is null on the first render, so a loaded save never toasts. */
export const renderToasts = (prev: GameState | null, next: GameState, tierUp: number | null): string[] => [
  ...(prev ? yearToast(prev, next) : []),
  ...(tierUp === null ? [] : [T.hubTierUp(T.hubTiers[tierUp] ?? '')]),
];
