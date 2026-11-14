// Seasons that follow the school year. The date is injected (setCalendar); core never reads a clock.
// Seasons are passive: the bonus applies while today is inside the window, nothing to claim or miss.
import { SEASONS, type MonthDay, type SeasonDef } from '../content/registry';
import type { CalendarDay, GameState } from './state';

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** True for a real calendar day (29 February allowed). */
export function isValidDay(d: MonthDay): boolean {
  return (
    Number.isInteger(d.month) &&
    Number.isInteger(d.day) &&
    d.month >= 1 &&
    d.month <= 12 &&
    d.day >= 1 &&
    d.day <= DAYS_IN_MONTH[d.month - 1]!
  );
}

const key = (d: MonthDay) => d.month * 100 + d.day;

/** Whether `day` is inside the season window (inclusive). Windows may wrap over New Year. */
export function inSeason(season: Pick<SeasonDef, 'start' | 'end'>, day: MonthDay): boolean {
  const k = key(day);
  const s = key(season.start);
  const e = key(season.end);
  return s <= e ? k >= s && k <= e : k >= s || k <= e;
}

/** The season active today, or null. Overlaps are resolved by `order` (SEASONS is sorted). */
export function activeSeason(state: GameState): SeasonDef | null {
  const day = state.calendar;
  if (!day) return null;
  return SEASONS.find((s) => inSeason(s, day)) ?? null;
}

export function seasonProdMult(state: GameState): number {
  const e = activeSeason(state)?.effect;
  return e?.kind === 'prodMult' ? e.mult : 1;
}

export function seasonClickMult(state: GameState): number {
  const e = activeSeason(state)?.effect;
  return e?.kind === 'clickMult' ? e.mult : 1;
}

/** Inject today's date. Invalid input clears it. Returns the same state if nothing changed. */
export function setCalendar(state: GameState, day: CalendarDay | null): GameState {
  const next = day && isValidDay(day) ? { month: day.month, day: day.day } : null;
  const cur = state.calendar ?? null;
  if (cur === next || (cur && next && cur.month === next.month && cur.day === next.day)) return state;
  return { ...state, calendar: next };
}
