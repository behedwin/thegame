import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buy, createInitialState, earn, Decimal, offlineCapMs, setSettings, type GameState } from '../src/core';
import { AUTOMATIONS, SEASONS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import {
  NOTIFY_ID,
  SEASON_NOTIFY_HOUR,
  nextSeasonStart,
  notificationsSupported,
  planNotifications,
} from '../src/ui/notifications';

const read = (p: string) => readFileSync(p, 'utf8');
const local = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h).getTime();

function producing(): GameState {
  const first = [...AUTOMATIONS].sort((a, b) => a.order - b.order)[0]!;
  return buy(earn(createInitialState(0), new Decimal(1e6)), first.id);
}

describe('014 local notifications: settings and save', () => {
  it('both notifications are off by default', () => {
    const s = createInitialState(0).settings;
    expect(s.notifyOfflineCap).toBe(false);
    expect(s.notifySeason).toBe(false);
  });

  it('round-trips the settings through the save', () => {
    const s = setSettings(createInitialState(0), { notifyOfflineCap: true, notifySeason: true });
    const back = deserialize(serialize(s), 0).settings;
    expect(back.notifyOfflineCap).toBe(true);
    expect(back.notifySeason).toBe(true);
  });

  it('bumps the save version and migrates v3 saves with notifications off', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(4);
    const v3 = { version: 3, settings: { sound: false, vibration: true, volume: 0.5 } };
    expect(migrate(v3, MIGRATIONS, 4)).toEqual({
      version: 4,
      settings: { sound: false, vibration: true, volume: 0.5, notifyOfflineCap: false, notifySeason: false },
    });
    const old = deserialize(JSON.stringify(v3), 0).settings;
    expect(old).toEqual({ sound: false, vibration: true, volume: 0.5, notifyOfflineCap: false, notifySeason: false, tips: true });
  });

  it('v1 saves migrate all the way and get notifications off', () => {
    const s = deserialize(JSON.stringify({ version: 1, kp: '1' }), 0).settings;
    expect(s.notifyOfflineCap).toBe(false);
    expect(s.notifySeason).toBe(false);
  });

  it('replaces invalid values with off', () => {
    const s = deserialize(JSON.stringify({ version: 4, settings: { notifyOfflineCap: 'yes', notifySeason: 1 } }), 0);
    expect(s.settings.notifyOfflineCap).toBe(false);
    expect(s.settings.notifySeason).toBe(false);
  });
});

describe('014 local notifications: planning', () => {
  const now = local(2026, 11, 14);

  it('plans nothing when both are off', () => {
    expect(planNotifications(producing(), now)).toEqual([]);
  });

  it('plans the offline cap notification at now + cap', () => {
    const s = setSettings(producing(), { notifyOfflineCap: true });
    const plan = planNotifications(s, now);
    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ id: NOTIFY_ID.offlineCap, atMs: now + offlineCapMs(s), title: T.notify.offlineTitle });
    expect(plan[0]!.body.length).toBeGreaterThan(0);
  });

  it('skips the offline cap notification when nothing is produced', () => {
    const s = setSettings(createInitialState(0), { notifyOfflineCap: true });
    expect(planNotifications(s, now)).toEqual([]);
  });

  it('finds the next season start after today at a daytime hour', () => {
    const next = nextSeasonStart(now)!;
    expect(next).not.toBeNull();
    expect(next.atMs).toBeGreaterThan(now);
    const d = new Date(next.atMs);
    expect(d.getHours()).toBe(SEASON_NOTIFY_HOUR);
    expect(d.getMonth() + 1).toBe(next.season.start.month);
    expect(d.getDate()).toBe(next.season.start.day);
    // No season starts between now and the planned one.
    for (const s of SEASONS) {
      for (const y of [2026, 2027]) {
        const t = new Date(y, s.start.month - 1, s.start.day, SEASON_NOTIFY_HOUR).getTime();
        if (t > now) expect(t).toBeGreaterThanOrEqual(next.atMs);
      }
    }
  });

  it('wraps over New Year and skips a start that already passed today', () => {
    const season = { start: { month: 1, day: 10 }, end: { month: 1, day: 12 } };
    const fake = [{ ...SEASONS[0]!, ...season }];
    expect(nextSeasonStart(local(2026, 12, 31), fake)!.atMs).toBe(new Date(2027, 0, 10, SEASON_NOTIFY_HOUR).getTime());
    expect(nextSeasonStart(local(2027, 1, 10, 11), fake)!.atMs).toBe(new Date(2028, 0, 10, SEASON_NOTIFY_HOUR).getTime());
    expect(nextSeasonStart(local(2027, 1, 10, 9), fake)!.atMs).toBe(new Date(2027, 0, 10, SEASON_NOTIFY_HOUR).getTime());
  });

  it('handles a 29 February start by waiting for a leap year', () => {
    const fake = [{ ...SEASONS[0]!, start: { month: 2, day: 29 }, end: { month: 3, day: 1 } }];
    expect(nextSeasonStart(local(2026, 11, 14), fake)!.atMs).toBe(new Date(2028, 1, 29, SEASON_NOTIFY_HOUR).getTime());
  });

  it('plans the season notification with the season name and description', () => {
    const s = setSettings(createInitialState(0), { notifySeason: true });
    const plan = planNotifications(s, now);
    const next = nextSeasonStart(now)!;
    expect(plan).toEqual([
      { id: NOTIFY_ID.season, atMs: next.atMs, title: T.notify.seasonTitle(next.season.name), body: next.season.desc },
    ]);
  });

  it('is pure: does not mutate the state', () => {
    const s = setSettings(producing(), { notifyOfflineCap: true, notifySeason: true });
    const snap = serialize(s);
    planNotifications(s, now);
    expect(serialize(s)).toBe(snap);
  });
});

describe('014 local notifications: texts, platform and Android', () => {
  it('has Swedish texts without pressure words', () => {
    const all = [
      T.notify.offlineTitle,
      T.notify.offlineBody('8 h'),
      T.notify.seasonTitle('Höstlov'),
      T.settings.notifyOfflineCap,
      T.settings.notifySeason,
      T.settings.notifyNote,
      T.settings.notifyDenied,
    ].join(' ');
    expect(all).not.toMatch(/skynda|missa|sista chansen|nu eller aldrig|!{2,}/i);
  });

  it('is not supported on the web (no notifications outside the app)', () => {
    expect(notificationsSupported()).toBe(false);
  });

  it('registers the plugin, keeps exact alarms out and documents the dependency', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies: Record<string, string> };
    expect(pkg.dependencies['@capacitor/local-notifications']).toMatch(/^\^8\./);
    expect(read('android/capacitor.settings.gradle')).toContain("include ':capacitor-local-notifications'");
    expect(read('android/app/capacitor.build.gradle')).toContain("implementation project(':capacitor-local-notifications')");
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    expect(manifest).toMatch(/SCHEDULE_EXACT_ALARM"\s+tools:node="remove"/);
    expect(read('decisions/20261114T143243Z-014-local-notifications.md')).toMatch(/@capacitor\/local-notifications/);
  });

  it('the notification module makes no network calls', () => {
    expect(read('src/ui/notifications.ts')).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket|sendBeacon/);
  });
});
