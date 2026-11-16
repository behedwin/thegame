// Tab dots (089, 093, 097, 101): which tabs show a dot and why. Pure, so it can be tested without a DOM.
import { T } from '../content/texts';
import { anyMeritAffordable, anyNewAutomationAffordable, anyUpgradeAffordable, type GameState } from '../core';

export const TABS = ['automations', 'upgrades', 'prestige', 'achievements'] as const;
export type Tab = (typeof TABS)[number];
export interface TabDot { tab: Tab; dot: boolean; why: string }

/**
 * Trophies the player has seen (101). Kept in memory only by the caller: opening the tab marks
 * everything as seen, and a lower count (a wipe or import) resets it.
 */
export function seenTrophies(state: GameState, tab: Tab, seen: number): number {
  const n = state.achievements.length;
  return tab === 'achievements' || n < seen ? n : seen;
}

/** One entry per tab with a dot: shop tabs while something new is affordable elsewhere, trophies while unseen. */
export function tabDots(state: GameState, tab: Tab, trophiesSeen: number): TabDot[] {
  const away = (t: Tab, has: boolean, why: string): TabDot => ({ tab: t, dot: tab !== t && has, why });
  return [
    away('prestige', anyMeritAffordable(state), T.a11y.meritDot),
    away('upgrades', anyUpgradeAffordable(state), T.a11y.upgradeDot),
    away('automations', anyNewAutomationAffordable(state), T.a11y.automationDot),
    away('achievements', state.achievements.length > trophiesSeen, T.a11y.trophyDot),
  ];
}
