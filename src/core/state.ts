import Decimal from 'break_infinity.js';

export { Decimal };

/** A temporary multiplier (from random events). Expires in game time, not wall time. */
export interface Buff {
  source: string;
  kind: 'prodMult' | 'clickMult';
  mult: number;
  untilMs: number;
}

/** A random event currently on screen, waiting for a tap. */
export interface ActiveEvent {
  id: string;
  expiresAtMs: number;
}

export interface Settings {
  sound: boolean;
  vibration: boolean;
  /** Master volume, 0-1. */
  volume: number;
}

export const DEFAULT_VOLUME = 0.7;

/** Today's date (month 1-12, day 1-31), injected by the UI. Never read from a clock in core. */
export interface CalendarDay {
  month: number;
  day: number;
}

export interface GameState {
  kp: Decimal;
  /** KP earned during the current school year (prestige run). */
  runEarned: Decimal;
  /** KP earned ever. */
  totalEarned: Decimal;
  merits: Decimal;
  meritsEarned: Decimal;
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
  settings: Settings;
  /**
   * Today's calendar day, injected by the UI via setCalendar(). Drives seasons. Not saved: it is
   * re-injected on every start. Absent/null (sim, tests) means no season is active.
   */
  calendar?: CalendarDay | null;
}

export function createInitialState(nowMs: number): GameState {
  return {
    kp: new Decimal(0),
    runEarned: new Decimal(0),
    totalEarned: new Decimal(0),
    merits: new Decimal(0),
    meritsEarned: new Decimal(0),
    upgrades: {},
    automations: {},
    meritUpgrades: {},
    prestiges: 0,
    clicks: 0,
    timeMs: 0,
    lastSeenMs: nowMs,
    activeEvent: null,
    nextEventAtMs: 0,
    buffs: [],
    eventsClaimed: 0,
    achievements: [],
    settings: { sound: true, vibration: true, volume: DEFAULT_VOLUME },
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
