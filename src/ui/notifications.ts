// Opt-in local notifications (task 014). Scheduled on the device only: no network, no push server.
// Planning is pure apart from local-time Date math (allowed in ui/); the plugin calls are thin wrappers.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SEASONS, type SeasonDef } from '../content/registry';
import { T } from '../content/texts';
import { kpPerSecond, offlineCapMs, type GameState } from '../core';
import { fmtDuration } from './format';

export const NOTIFY_ID = { offlineCap: 1, season: 2 } as const;
const ALL_IDS = Object.values(NOTIFY_ID);
/** Bumped on every cancel/schedule so a slow schedule never lands after the player came back. */
let generation = 0;

/** Local hour a season notification fires on its first day: daytime, never at night. */
export const SEASON_NOTIFY_HOUR = 10;

export interface PlannedNotification {
  id: number;
  atMs: number;
  title: string;
  body: string;
}

/** The first season start strictly after nowMs (local time), looking up to five years ahead for 29 Feb. */
export function nextSeasonStart(
  nowMs: number,
  seasons: readonly SeasonDef[] = SEASONS,
): { season: SeasonDef; atMs: number } | null {
  const year = new Date(nowMs).getFullYear();
  let best: { season: SeasonDef; atMs: number } | null = null;
  for (const season of seasons) {
    for (let y = year; y <= year + 5; y++) {
      const d = new Date(y, season.start.month - 1, season.start.day, SEASON_NOTIFY_HOUR);
      if (d.getMonth() !== season.start.month - 1) continue; // 29 Feb in a non-leap year
      const atMs = d.getTime();
      if (atMs <= nowMs) continue;
      if (!best || atMs < best.atMs) best = { season, atMs };
      break;
    }
  }
  return best;
}

/** What to schedule when the player leaves the game at nowMs. Only the notifications they turned on. */
export function planNotifications(state: GameState, nowMs: number): PlannedNotification[] {
  const plan: PlannedNotification[] = [];
  if (state.settings.notifyOfflineCap && kpPerSecond(state).gt(0)) {
    const cap = offlineCapMs(state);
    plan.push({ id: NOTIFY_ID.offlineCap, atMs: nowMs + cap, title: T.notify.offlineTitle, body: T.notify.offlineBody(fmtDuration(cap)) });
  }
  if (state.settings.notifySeason) {
    const next = nextSeasonStart(nowMs);
    if (next) plan.push({ id: NOTIFY_ID.season, atMs: next.atMs, title: T.notify.seasonTitle(next.season.name), body: next.season.desc });
  }
  return plan;
}

/** Notifications exist only in the Android app; the web build never asks. */
export function notificationsSupported(): boolean {
  return Capacitor.isNativePlatform();
}

/** Ask the OS for permission (Android 13+ shows a dialog). Returns whether notifications may be shown. */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  try {
    const cur = await LocalNotifications.checkPermissions();
    if (cur.display === 'granted') return true;
    if (cur.display === 'denied') return false;
    return (await LocalNotifications.requestPermissions()).display === 'granted';
  } catch {
    return false;
  }
}

/** Remove any pending game notifications (the player is back, or turned them off). */
export async function cancelNotifications(): Promise<void> {
  if (!notificationsSupported()) return;
  generation++;
  try {
    await LocalNotifications.cancel({ notifications: ALL_IDS.map((id) => ({ id })) });
  } catch {
    /* plugin missing: nothing to cancel */
  }
}

/** Replace pending notifications with the plan for leaving now. Never asks for permission itself. */
export async function scheduleNotifications(state: GameState, nowMs: number): Promise<void> {
  if (!notificationsSupported()) return;
  await cancelNotifications();
  const mine = generation;
  const plan = planNotifications(state, nowMs);
  if (!plan.length) return;
  try {
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return;
    if (mine !== generation) return; // cancelled meanwhile (the game is visible again)
    await LocalNotifications.schedule({
      notifications: plan.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.atMs) } })),
    });
  } catch {
    /* plugin missing or OS refused: the game works the same without notifications */
  }
}
