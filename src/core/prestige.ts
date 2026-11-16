// "Nytt läsår" (prestige): when it unlocks, what it resets and what it keeps. Pure, like actions.ts.
import { MERITS, type AutomationDef, type ChapterDef, type FocusDef } from '../content/registry';
import { visibleStreak } from './events';
import { focusesForYear, withFocusPlayed } from './focus';
import { chapterFor } from './goal';
import { bestYearEarned, customersSigned, meritLevelEffect, pendingMerits, runKpForMerits } from './rules';
import { Decimal, DEFAULT_FOCUS, fastestYearRecord, level, totalLevels, type GameState } from './state';
import { unlocksInYear } from './unlocks';

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
      automations[m.effect.id] = (automations[m.effect.id] ?? 0) + meritLevelEffect(m, lvl);
    }
  }
  return automations;
}

/** Game time spent in the running school year (088). */
export const yearDurationMs = (state: GameState): number => Math.max(0, state.timeMs - state.yearStartMs);

/** The fastest-year record after finishing the running year (088). */
const fastestAfter = (state: GameState): number => Math.min(fastestYearRecord(state) ?? Infinity, yearDurationMs(state));

/** True when the running year beats an earlier record (088); never in the first year, which has none. */
const beatsFastestYear = (state: GameState): boolean => yearDurationMs(state) < (fastestYearRecord(state) ?? -Infinity);

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
    lastYearEvents: state.yearEvents,
    lastYearTickets: state.yearTickets,
    lastYearBestStreak: state.yearBestStreak,
    lastYearEarned: state.runEarned,
    yearEvents: 0,
    yearBestStreak: 0,
    yearStreakBase: state.eventStreak, // the streak carries on, but only this year's part counts (107)
    yearTickets: 0,
    yearStartMs: state.timeMs,
    fastestYearMs: fastestAfter(state),
    focusesPlayed: withFocusPlayed(state),
    focus: DEFAULT_FOCUS, // the player picks the new year's focus right after (053)
    calendar: state.calendar ?? null,
  };
}

/** A look back at the school year that ends with "Nytt läsår" (063). */
export interface YearSummary {
  kpEarned: Decimal;
  customers: number;
  integrations: number;
  merits: Decimal;
  /** Events solved and tickets answered this year (076). */
  events: number;
  tickets: number;
  /** Change against last school year (078); null in the first school year, which has nothing to compare with. */
  eventsDiff: number | null;
  ticketsDiff: number | null;
  /** KP earned against last school year in whole percent (083); null in the first year or when last year is 0. */
  kpDiffPct: number | null;
  /** True when this year beat every earlier one. */
  bestYear: boolean;
  /** Game time this school year took (088). */
  durationMs: number;
  /** True when this year beat an earlier fastest-year record (088); never in the first year. */
  fastestYear: boolean;
  /** Longest event streak this year (096); 0 below BALANCE.events.streak.min, so the line stays hidden. */
  bestStreak: number;
  /** Longest streak against last school year (098); null in the first school year. */
  bestStreakDiff: number | null;
}

/** `now - last` against last school year, or null in the first one, which has nothing to compare with (078). */
const sinceLastYear = (state: GameState, now: number, last: number): number | null => (state.prestiges > 0 ? now - last : null);

/** Whole-percent change of this year's KP against last year's, or null when there is nothing to compare (083). */
function kpDiffPct(state: GameState): number | null {
  if (state.prestiges === 0 || state.lastYearEarned.lte(0)) return null;
  const pct = Math.round(state.runEarned.sub(state.lastYearEarned).div(state.lastYearEarned).mul(100).toNumber());
  return Number.isFinite(pct) ? pct : null;
}

/** Summarise the running school year, from the state before prestige. */
export const yearSummary = (state: GameState): YearSummary => ({
  kpEarned: state.runEarned,
  customers: customersSigned(state),
  integrations: totalLevels(state.automations),
  merits: pendingMerits(state),
  events: state.yearEvents,
  tickets: state.yearTickets,
  eventsDiff: sinceLastYear(state, state.yearEvents, state.lastYearEvents),
  ticketsDiff: sinceLastYear(state, state.yearTickets, state.lastYearTickets),
  kpDiffPct: kpDiffPct(state),
  bestYear: state.runEarned.gt(state.bestRunEarned),
  durationMs: yearDurationMs(state),
  fastestYear: beatsFastestYear(state),
  bestStreak: visibleStreak(state.yearBestStreak),
  bestStreakDiff: sinceLastYear(state, state.yearBestStreak, state.lastYearBestStreak),
});

/** What a school year brings when it starts (051-053): its chapter, new integration types and focus options. */
export interface YearStart {
  year: number;
  chapter: ChapterDef | undefined;
  unlocked: AutomationDef[];
  focuses: FocusDef[];
}

/** The single source for the "Nytt läsår" follow-up in the UI: chapter, unlock toast and focus choice. */
export const yearStart = (year: number): YearStart => ({
  year,
  chapter: chapterFor(year),
  unlocked: unlocksInYear(year),
  focuses: focusesForYear(year),
});
