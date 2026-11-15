import Decimal from 'break_infinity.js';
import { BALANCE } from '../content/balance';
import type { MonthDay } from '../content/types';

export { Decimal };

/** A temporary multiplier (from random events). Expires in game time, not wall time. */
export interface Buff { source: string; kind: 'prodMult' | 'clickMult'; mult: number; untilMs: number }

/** A random event currently on screen, waiting for a tap. */
export interface ActiveEvent { id: string; expiresAtMs: number }

export interface Settings {
  sound: boolean;
  vibration: boolean;
  /** Master volume, 0-1. */
  volume: number;
  /** Local notification when offline earnings hit the cap. Off by default; the player opts in. */
  notifyOfflineCap: boolean;
  /** Local notification when a new season starts. Off by default; the player opts in. */
  notifySeason: boolean;
  /** Onboarding tips for new players. On by default; the player can turn them off. */
  tips: boolean;
  /** How big numbers are shown: Swedish abbreviations ("1,23 M") or scientific ("1,23e6"). */
  notation: Notation;
}

export type Notation = 'short' | 'sci';

export const DEFAULT_VOLUME = 0.7;

/** Today's date (month 1-12, day 1-31), injected by the UI. Never read from a clock in core. */
export type CalendarDay = MonthDay;

export interface GameState {
  kp: Decimal;
  /** KP earned during the current school year (prestige run). */
  runEarned: Decimal;
  /** KP earned ever. */
  totalEarned: Decimal;
  merits: Decimal;
  meritsEarned: Decimal;
  /** Most KP earned in one finished school year. Updated by prestige(). */
  bestRunEarned: Decimal;
  /** Upgrade levels and automations bought ever (bulk buys count every unit). */
  purchases: number;
  upgrades: Record<string, number>;
  automations: Record<string, number>;
  meritUpgrades: Record<string, number>;
  prestiges: number;
  clicks: number;
  /** Active game time in ms. Advanced only by tick(). */
  timeMs: number;
  /** Wall-clock ms when the game was last seen running. Injected by the caller. */
  lastSeenMs: number;
  activeEvent: ActiveEvent | null;
  /** Game time before which no new event may spawn. */
  nextEventAtMs: number;
  buffs: Buff[];
  eventsClaimed: number;
  /** Unlocked achievement ids, in unlock order. Kept across school years. */
  achievements: string[];
  /** Unanswered ticket ids, oldest first (at most BALANCE.tickets.cap). Kept across school years. */
  inbox: string[];
  /** Game time when the next ticket may arrive. */
  nextTicketAtMs: number;
  ticketsAnswered: number;
  /** Onboarding tip ids already shown and finished. A tip is never shown again once here. */
  tipsSeen: string[];
  settings: Settings;
  /** School-year focus id (053, src/content/focuses/). Reset to the default every new school year. */
  focus: string;
  /**
   * Build number (the "54" in "1.54") whose news the player has seen (056). 0 means unknown (new game or
   * a save from before 056): the UI then just stores the current build and shows no news.
   */
  lastSeenVersion: number;
  /**
   * Today's calendar day, injected by the UI via setCalendar(). Drives seasons. Not saved: it is
   * re-injected on every start. Absent/null (sim, tests) means no season is active.
   */
  calendar?: CalendarDay | null;
}

/** "Vanligt läsår": no rule changes (053). Every new game and every new school year starts here. */
export const DEFAULT_FOCUS = 'normal';

export function createInitialState(nowMs: number): GameState {
  return {
    kp: new Decimal(0), runEarned: new Decimal(0), totalEarned: new Decimal(0), merits: new Decimal(0), meritsEarned: new Decimal(0),
    bestRunEarned: new Decimal(0), purchases: 0,
    upgrades: {}, automations: {}, meritUpgrades: {},
    prestiges: 0,
    clicks: 0,
    timeMs: 0,
    lastSeenMs: nowMs,
    activeEvent: null,
    nextEventAtMs: 0,
    buffs: [],
    eventsClaimed: 0,
    achievements: [],
    inbox: [],
    nextTicketAtMs: BALANCE.tickets.firstAtMs,
    ticketsAnswered: 0,
    tipsSeen: [],
    focus: DEFAULT_FOCUS,
    lastSeenVersion: 0,
    settings: { sound: true, vibration: true, volume: DEFAULT_VOLUME, notifyOfflineCap: false, notifySeason: false, tips: true, notation: 'short' },
  };
}

export function level(map: Record<string, number>, id: string): number {
  return map[id] ?? 0;
}

/** Credit earned KP to the wallet and both lifetime counters. Returns the same state for amount ≤ 0. */
export function earn(state: GameState, amount: Decimal): GameState {
  if (amount.lte(0)) return state;
  return {
    ...state,
    kp: state.kp.add(amount),
    runEarned: state.runEarned.add(amount),
    totalEarned: state.totalEarned.add(amount),
  };
}
