// State transitions. All functions are pure: they return a new state and never mutate the input.
import { MERITS } from '../content/registry';
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
  pendingMerits,
  runKpForMerits,
  withMeritLevel,
} from './rules';
import { createInitialState, Decimal, earn, level, type GameState } from './state';

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

export function canPrestige(state: GameState): boolean {
  return pendingMerits(state).gte(1);
}

/** The prestige tab shows after the first prestige, or once a quarter of the first merit's KP is earned. */
export function prestigeUnlocked(state: GameState): boolean {
  return state.prestiges > 0 || state.runEarned.gte(runKpForMerits(1).mul(0.25));
}

/** "Nytt läsår": reset the run, keep merits, merit upgrades, totals and settings. */
export function prestige(state: GameState): GameState {
  if (!canPrestige(state)) return state;
  const gained = pendingMerits(state);
  const fresh = createInitialState(state.lastSeenMs);
  const automations: Record<string, number> = {};
  for (const m of MERITS) {
    const lvl = level(state.meritUpgrades, m.id);
    if (lvl > 0 && m.effect.kind === 'startAutomation') {
      automations[m.effect.id] = (automations[m.effect.id] ?? 0) + m.effect.count * lvl;
    }
  }
  return {
    ...fresh,
    automations,
    totalEarned: state.totalEarned,
    bestRunEarned: Decimal.max(state.bestRunEarned, state.runEarned),
    purchases: state.purchases,
    merits: state.merits.add(gained),
    meritsEarned: state.meritsEarned.add(gained),
    meritUpgrades: state.meritUpgrades,
    prestiges: state.prestiges + 1,
    clicks: state.clicks,
    timeMs: state.timeMs,
    nextEventAtMs: state.nextEventAtMs,
    eventsClaimed: state.eventsClaimed,
    achievements: state.achievements,
    inbox: state.inbox,
    nextTicketAtMs: state.nextTicketAtMs,
    ticketsAnswered: state.ticketsAnswered,
    settings: state.settings,
    calendar: state.calendar ?? null,
  };
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
