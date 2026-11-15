// State transitions. All functions are pure: they return a new state and never mutate the input.
import { checkAchievements } from './achievements';
import { buyMany } from './bulk';
import {
  baseKps,
  canBuyMerit,
  eventCooldownMs,
  kpPerClick,
  kpPerSecond,
  offlineCapMs,
  offlineEfficiency,
  withMeritLevel,
} from './rules';
import { Decimal, earn, type GameState } from './state';

/** Advance game time by dtMs: production, buff and event expiry, achievement unlocks. */
export function tick(state: GameState, dtMs: number): GameState {
  if (!(dtMs > 0) || !Number.isFinite(dtMs)) return state;
  const produced = kpPerSecond(state).mul(dtMs / 1000);
  const next = earn(state, produced);
  const timeMs = state.timeMs + dtMs;
  const buffs = next.buffs.filter((b) => b.untilMs > timeMs);
  let activeEvent = next.activeEvent;
  let nextEventAtMs = next.nextEventAtMs;
  if (activeEvent && activeEvent.expiresAtMs <= timeMs) {
    activeEvent = null;
    nextEventAtMs = timeMs + eventCooldownMs(state);
  }
  return checkAchievements({ ...next, timeMs, buffs, activeEvent, nextEventAtMs });
}

/** One manual sync (tap). */
export function click(state: GameState, times = 1): GameState {
  if (times <= 0) return state;
  const next = earn(state, kpPerClick(state).mul(times));
  return { ...next, clicks: state.clicks + times };
}

/** Buy one level of an upgrade or one unit of an automation. Returns the same state if not affordable. */
export function buy(state: GameState, id: string): GameState {
  return buyMany(state, id, 1);
}

export function buyMerit(state: GameState, id: string): GameState {
  return canBuyMerit(state, id) ? withMeritLevel(state, id) : state;
}

export interface OfflineResult {
  state: GameState;
  earned: Decimal;
  /** Offline time actually credited, after cap. */
  creditedMs: number;
  /** Real time away (0 if the clock went backwards). */
  awayMs: number;
}

/**
 * Credit production for the time since lastSeenMs, capped. A negative delta (clock moved
 * backwards) yields nothing. Buffs are not applied offline.
 */
export function applyOffline(state: GameState, nowMs: number): OfflineResult {
  const awayMs = nowMs - state.lastSeenMs;
  if (!(awayMs > 0) || !Number.isFinite(awayMs)) {
    return { state: { ...state, lastSeenMs: nowMs }, earned: new Decimal(0), creditedMs: 0, awayMs: 0 };
  }
  const creditedMs = Math.min(awayMs, offlineCapMs(state));
  const earned = baseKps(state).mul((creditedMs / 1000) * offlineEfficiency(state));
  const next = earn(state, earned);
  return { state: { ...next, lastSeenMs: nowMs }, earned, creditedMs, awayMs };
}

/** Mark the state as seen at nowMs (call before saving). */
export function touch(state: GameState, nowMs: number): GameState {
  return { ...state, lastSeenMs: nowMs };
}

export function setSettings(state: GameState, settings: Partial<GameState['settings']>): GameState {
  return { ...state, settings: { ...state.settings, ...settings } };
}
