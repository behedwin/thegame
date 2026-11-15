// Achievements: permanent, kept across school years. Each unlocked one gives
// ACHIEVEMENT_PROD_PCT % production (applied in rules.ts).
import { ACHIEVEMENTS, type AchievementCondition, type AchievementDef } from '../content/registry';
import { baseKps, customersSigned } from './rules';
import { level, totalLevels, type GameState } from './state';

/** Whether a condition holds in this state. */
export function isMet(state: GameState, c: AchievementCondition): boolean {
  switch (c.kind) {
    case 'clicks':
      return state.clicks >= c.n;
    case 'totalEarned':
      return state.totalEarned.gte(c.kp);
    case 'kps':
      return baseKps(state).gte(c.kp);
    case 'automation':
      return level(state.automations, c.id) >= c.n;
    case 'automationsTotal':
      return totalLevels(state.automations) >= c.n;
    case 'upgradesTotal':
      return totalLevels(state.upgrades) >= c.n;
    case 'eventsClaimed':
      return state.eventsClaimed >= c.n;
    case 'customers':
      return customersSigned(state) >= c.n;
    case 'prestiges':
      return state.prestiges >= c.n;
    case 'ticketsAnswered':
      return state.ticketsAnswered >= c.n;
    case 'focusesPlayed':
      return state.focusesPlayed.length >= c.n;
  }
}

/** Progress towards a countable condition, capped at `need`; null for value thresholds (KP, KP/s). */
export function progress(state: GameState, c: AchievementCondition): { have: number; need: number } | null {
  const have = count(state, c);
  return have === null || !('n' in c) ? null : { have: Math.min(have, c.n), need: c.n };
}

function count(state: GameState, c: AchievementCondition): number | null {
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
    default:
      return null;
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
