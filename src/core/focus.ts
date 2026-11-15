// School-year focus (053): a choice at "Nytt läsår" that changes the rules for one school year. Pure.
import { BALANCE } from '../content/balance';
import { byId, FOCUSES, type FocusDef, type FocusEffect } from '../content/registry';
import { DEFAULT_FOCUS, type GameState } from './state';
import { schoolYear } from './unlocks';

export const getFocus = byId(FOCUSES);

type Focused = Partial<Pick<GameState, 'focus'>>;

/** The running focus; unknown or missing ids (old states, tests) count as the default. */
export const currentFocus = (state: Focused): FocusDef => getFocus(state.focus ?? DEFAULT_FOCUS) ?? getFocus(DEFAULT_FOCUS)!;

/** Focuses the player may pick for the given school year, in display order. */
export const focusesForYear = (year: number): FocusDef[] => FOCUSES.filter((f) => f.unlockYear <= year);

/** Pick the focus for the running school year. Same state if unknown, not yet unlocked, or in school year 1. */
export function chooseFocus(state: GameState, id: string): GameState {
  const year = schoolYear(state);
  if (year < 2 || !focusesForYear(year).some((f) => f.id === id)) return state;
  return { ...state, focus: id };
}

type Of<K extends FocusEffect['kind']> = Extract<FocusEffect, { kind: K }>;
const effectsOf = <K extends FocusEffect['kind']>(state: Focused, kind: K): Of<K>[] =>
  currentFocus(state).effects.filter((e): e is Of<K> => e.kind === kind);
const product = (ms: { mult: number }[]): number => ms.reduce((p, e) => p * e.mult, 1);

/** Production multiplier on one automation from the focus (targeted and global). */
export const focusAutoMult = (state: Focused, id: string): number =>
  product(effectsOf(state, 'autoMult').filter((e) => e.targets === 'all' || e.targets.includes(id))) * product(effectsOf(state, 'prodMult'));

export const focusClickMult = (state: Focused): number => product(effectsOf(state, 'clickMult'));

export const focusCostMult = (state: Focused, automation: boolean): number =>
  product(effectsOf(state, 'costMult').filter((e) => e.targets === 'all' || automation));

export const focusCooldownMult = (state: Focused): number => product(effectsOf(state, 'eventCooldownMult'));

/** Production factor per reached milestone: BALANCE.milestoneMult unless the focus replaces it. */
export const milestoneMultOf = (state: Focused): number => effectsOf(state, 'milestoneMult').at(-1)?.mult ?? BALANCE.milestoneMult;

/** focusesPlayed after the running school year ends: the running focus added once, never the default (068). */
export function withFocusPlayed(state: Pick<GameState, 'focus' | 'focusesPlayed'>): string[] {
  const id = currentFocus(state).id;
  return id === DEFAULT_FOCUS || state.focusesPlayed.includes(id) ? state.focusesPlayed : [...state.focusesPlayed, id];
}

/** Merit factor at the next "Nytt läsår": a bonus for trying anything but the default. */
export const focusMeritMult = (state: Focused): number => (currentFocus(state).effects.length > 0 ? BALANCE.focus.meritBonus : 1);
