// New integration types unlocked per school year (051). Pure: the school year is derived from prestiges.
import { AUTOMATIONS, type AutomationDef } from '../content/registry';
import type { GameState } from './state';

/** Current school year, 1-based (läsår 1 = 0 prestiges). */
export const schoolYear = (state: Pick<GameState, 'prestiges'>): number => state.prestiges + 1;

/** An automation without `unlockYear` is always available; otherwise from that school year on. */
export const isUnlocked = (state: Pick<GameState, 'prestiges'>, def: Pick<AutomationDef, 'unlockYear'>): boolean =>
  (def.unlockYear ?? 1) <= schoolYear(state);

/** Automations that unlock exactly in the given school year. */
export const unlocksInYear = (year: number): AutomationDef[] => AUTOMATIONS.filter((a) => (a.unlockYear ?? 1) === year && year > 1);

/** The next school year (after the current one) that unlocks something, with what it unlocks; null when all are unlocked. */
export function nextUnlock(state: Pick<GameState, 'prestiges'>): { year: number; defs: AutomationDef[] } | null {
  const years = AUTOMATIONS.map((a) => a.unlockYear ?? 1).filter((y) => y > schoolYear(state));
  if (years.length === 0) return null;
  const year = Math.min(...years);
  return { year, defs: unlocksInYear(year) };
}
