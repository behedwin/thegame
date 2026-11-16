// Achievements: permanent, kept across school years. Each unlocked one gives
// ACHIEVEMENT_PROD_PCT % production (applied in rules.ts).
import { ACHIEVEMENTS, type AchievementCondition, type AchievementDef } from '../content/registry';
import { baseKps, customersSigned } from './rules';
import { fastestYearRecord, level, totalLevels, type GameState } from './state';

/** Conditions that count something up to `n` (the rest are KP and KP/s thresholds). */
type CountCondition = Extract<AchievementCondition, { n: number }>;

const isCountable = (c: AchievementCondition): c is CountCondition => 'n' in c;

/** Whether a condition holds in this state. */
export function isMet(state: GameState, c: AchievementCondition): boolean {
  if (isCountable(c)) return count(state, c) >= c.n;
  switch (c.kind) {
    case 'fastestYear':
      return (fastestYearRecord(state) ?? Infinity) <= c.maxMs; // no finished year yet: not met (091)
    case 'totalEarned':
      return state.totalEarned.gte(c.kp);
    case 'kps':
      return baseKps(state).gte(c.kp);
  }
}

/** Progress towards a countable condition, capped at `need`; null for value thresholds (KP, KP/s, year time). */
export function progress(state: GameState, c: AchievementCondition): { have: number; need: number } | null {
  return isCountable(c) ? { have: Math.min(count(state, c), c.n), need: c.n } : null;
}

/** The counter a countable condition compares with its `n`. The single source for isMet and progress. */
function count(state: GameState, c: CountCondition): number {
  switch (c.kind) {
    case 'clicks':
      return state.clicks;
    case 'automation':
      return level(state.automations, c.id);
    case 'automationsTotal':
      return totalLevels(state.automations);
    case 'upgradesTotal':
      return totalLevels(state.upgrades);
    case 'eventsClaimed':
      return state.eventsClaimed;
    case 'customers':
      return customersSigned(state);
    case 'prestiges':
      return state.prestiges;
    case 'ticketsAnswered':
      return state.ticketsAnswered;
    case 'focusesPlayed':
      return state.focusesPlayed.length;
    case 'eventStreak':
      // The record, not the running streak: a broken streak never takes a trophy away (074).
      return state.bestEventStreak;
  }
}

export function hasAchievement(state: GameState, id: string): boolean {
  return state.achievements.includes(id);
}

/** Unlock every achievement whose condition now holds. Returns the same state if nothing changed. */
export function checkAchievements(state: GameState): GameState {
  let added: string[] | null = null;
  for (const a of ACHIEVEMENTS) {
    if (hasAchievement(state, a.id) || !isMet(state, a.condition)) continue;
    (added ??= []).push(a.id);
  }
  return added ? { ...state, achievements: [...state.achievements, ...added] } : state;
}

/** Achievements unlocked in `after` but not in `before`, in content order (for toasts). */
export function newAchievements(before: GameState, after: GameState): readonly AchievementDef[] {
  if (before.achievements.length === after.achievements.length) return [];
  return ACHIEVEMENTS.filter((a) => hasAchievement(after, a.id) && !hasAchievement(before, a.id));
}

/** A locked countable trophy and how far the player has come towards it (077). */
export interface NearestAchievement {
  def: AchievementDef;
  have: number;
  need: number;
}

/** The locked countable trophy with the highest have / need (started, i.e. have > 0); ties keep content order (077). */
export function nearestAchievement(state: GameState, list: readonly AchievementDef[] = ACHIEVEMENTS): NearestAchievement | null {
  let best: NearestAchievement | null = null;
  for (const def of list) {
    if (hasAchievement(state, def.id)) continue;
    const p = progress(state, def.condition);
    if (!p || p.have <= 0 || p.have >= p.need) continue;
    if (!best || p.have / p.need > best.have / best.need) best = { def, ...p };
  }
  return best;
}
