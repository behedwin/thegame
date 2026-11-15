// "Nytt läsår" (prestige): when it unlocks, what it resets and what it keeps. Pure, like actions.ts.
import { MERITS } from '../content/registry';
import { DEFAULT_FOCUS } from './focus';
import { bestYearEarned, pendingMerits, runKpForMerits } from './rules';
import { Decimal, level, type GameState } from './state';

export function canPrestige(state: GameState): boolean {
  return pendingMerits(state).gte(1);
}

/** The prestige tab shows after the first prestige, or once a quarter of the first merit's KP is earned. */
export function prestigeUnlocked(state: GameState): boolean {
  return state.prestiges > 0 || state.runEarned.gte(runKpForMerits(1).mul(0.25));
}

/** Automations a new school year starts with, from owned `startAutomation` merits. */
export function startingAutomations(meritUpgrades: GameState['meritUpgrades']): Record<string, number> {
  const automations: Record<string, number> = {};
  for (const m of MERITS) {
    const lvl = level(meritUpgrades, m.id);
    if (lvl > 0 && m.effect.kind === 'startAutomation') {
      automations[m.effect.id] = (automations[m.effect.id] ?? 0) + m.effect.count * lvl;
    }
  }
  return automations;
}

/** "Nytt läsår": reset the run; keep merits, lifetime totals, events, tickets and settings. */
export function prestige(state: GameState): GameState {
  if (!canPrestige(state)) return state;
  const gained = pendingMerits(state);
  return {
    ...state,
    kp: new Decimal(0),
    runEarned: new Decimal(0),
    upgrades: {},
    automations: startingAutomations(state.meritUpgrades),
    activeEvent: null,
    buffs: [],
    tipsSeen: [], // tips only show in the first school year, so this changes nothing visible
    bestRunEarned: bestYearEarned(state),
    merits: state.merits.add(gained),
    meritsEarned: state.meritsEarned.add(gained),
    prestiges: state.prestiges + 1,
    focus: DEFAULT_FOCUS, // the player picks the new year's focus right after (053)
    calendar: state.calendar ?? null,
  };
}
