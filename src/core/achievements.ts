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
