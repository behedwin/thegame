// The national goal "Hela Sverige på en standard" and the story chapters (052).
// Pure and derived: nothing is saved, the count is computed from school years and lifetime KP.
import { BALANCE } from '../content/balance';
import { CHAPTERS, type ChapterDef } from '../content/registry';
import type { GameState } from './state';
import { schoolYear } from './unlocks';

type GoalState = Pick<GameState, 'prestiges' | 'totalEarned'>;

/** Connected municipalities, 0..290. Never decreases with more school years or more lifetime KP. */
export function connectedMunicipalities(state: GoalState): number {
  const g = BALANCE.goal;
  const years = Math.min(1, Math.max(0, state.prestiges) / g.yearsToGoal) ** g.yearExponent;
  const decades = state.totalEarned.add(1).log10();
  const earned = Math.min(g.earnedShare, g.perDecade * (Number.isFinite(decades) ? Math.max(0, decades) : 0));
  return Math.min(g.municipalities, Math.floor((g.municipalities - g.earnedShare) * years + earned));
}

/** How many more municipalities the next school year connects, with today's lifetime KP. */
export const nextYearMunicipalities = (state: GoalState): number =>
  connectedMunicipalities({ ...state, prestiges: state.prestiges + 1 }) - connectedMunicipalities(state);

/** The chapter that opens the given school year, if one is written. */
export const chapterFor = (year: number): ChapterDef | undefined => CHAPTERS.find((c) => c.order === year);

/** Chapters up to and including the current school year, oldest first. */
export const chaptersRead = (state: Pick<GameState, 'prestiges'>): ChapterDef[] => CHAPTERS.filter((c) => c.order <= schoolYear(state));
