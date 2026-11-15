// Versioned save format. Pure functions: no storage access here.
import { BALANCE } from '../content/balance';
import { getFocus } from '../core/focus';
import { getTicket } from '../core/tickets';
import { type Buff, createInitialState, Decimal, DEFAULT_FOCUS, DEFAULT_VOLUME, type GameState } from '../core/state';

export const SAVE_VERSION = 13;

/** Raw JSON shape. Unknown on purpose: anything may come out of storage. */
export type RawSave = { version: number; [key: string]: unknown };
export type Migration = (save: RawSave) => RawSave;

/**
 * MIGRATIONS[n] upgrades a save from version n to n + 1.
 * Never edit an existing migration once released; add a new one and bump SAVE_VERSION.
 */
export const MIGRATIONS: Record<number, Migration> = {
  // v2 (task 006): achievements. Older saves start with none; tick() unlocks what already holds.
  1: (s) => ({ ...s, version: 2, achievements: [] }),
  // v3 (task 011): master volume in settings.
  2: (s) => ({ ...s, version: 3, settings: { ...obj(s.settings), volume: DEFAULT_VOLUME } }),
  // v4 (task 014): opt-in local notifications, off for everyone who already plays.
  3: (s) => ({ ...s, version: 4, settings: { ...obj(s.settings), notifyOfflineCap: false, notifySeason: false } }),
  // v5 (task 018): onboarding tips. Tips stay on, but steps the player already did count as seen.
  4: (s) => ({
    ...s,
    version: 5,
    tipsSeen: [
      ...(typeof s.clicks === 'number' && s.clicks > 0 ? ['sync'] : []),
      ...(Object.keys(levels(s.automations)).length > 0 ? ['buy'] : []),
      ...(typeof s.eventsClaimed === 'number' && s.eventsClaimed > 0 ? ['event'] : []),
    ],
    settings: { ...obj(s.settings), tips: true },
  }),
  // v6 (task 021): ticket inbox. Existing players get their first ticket right away.
  5: (s) => ({ ...s, version: 6, inbox: [], nextTicketAtMs: num(s.timeMs, 0), ticketsAnswered: 0 }),
  // v7 (task 039): lifetime records. The running year is the best one known so far.
  6: (s) => ({ ...s, version: 7, bestRunEarned: dec(s.runEarned, new Decimal(0)).toString(), purchases: 0 }),
  // v8 (task 041): number notation. Everyone keeps the Swedish abbreviations.
  7: (s) => ({ ...s, version: 8, settings: { ...obj(s.settings), notation: 'short' } }),
  // v9 (task 053): school-year focus. The running year of existing players is a normal one.
  8: (s) => ({ ...s, version: 9, focus: DEFAULT_FOCUS }),
  // v10 (task 056): last seen version. Unknown (0), so the app stores the current build and shows no news.
  9: (s) => ({ ...s, version: 10, lastSeenVersion: 0 }),
  // v11 (task 068): focuses played. Earlier years are unknown, so the list starts empty.
  10: (s) => ({ ...s, version: 11, focusesPlayed: [] }),
  // v12 (task 069): event streak. Everyone starts without one.
  11: (s) => ({ ...s, version: 12, eventStreak: 0, eventOpen: false }),
  // v13 (task 071): best event streak. The running streak is the best one known so far.
  12: (s) => ({ ...s, version: 13, bestEventStreak: count(s.eventStreak) }),
};

export class SaveError extends Error {}

export function migrate(save: RawSave, migrations: Record<number, Migration> = MIGRATIONS, target = SAVE_VERSION): RawSave {
  let current = save;
  if (!Number.isInteger(current.version) || current.version < 1) throw new SaveError('Invalid save version');
  if (current.version > target) throw new SaveError(`Save is from a newer version (${current.version})`);
  while (current.version < target) {
    const step = migrations[current.version];
    if (!step) throw new SaveError(`No migration from version ${current.version}`);
    const next = step(current);
    if (next.version !== current.version + 1) throw new SaveError('Migration must bump version by 1');
    current = next;
  }
  return current;
}

/** The distinct strings of an array, in first-seen order; anything else gives []. */
function uniqueStrings(v: unknown): string[] {
  return Array.isArray(v) ? [...new Set(v.filter((a): a is string => typeof a === 'string'))] : [];
}

function dec(v: unknown, fallback: Decimal): Decimal {
  if (typeof v !== 'string' && typeof v !== 'number') return fallback;
  try {
    const d = new Decimal(v);
    return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent) && d.gte(0) ? d : fallback;
  } catch {
    return fallback;
  }
}

/** A non-negative integer count, or 0. */
const count = (v: unknown): number => (Number.isInteger(v) && (v as number) > 0 ? (v as number) : 0);

const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

function levels(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') {
    for (const [k, n] of Object.entries(v)) {
      if (typeof n === 'number' && Number.isInteger(n) && n > 0) out[k] = n;
    }
  }
  return out;
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});

/** The Decimal fields, saved as strings. */
const BIG = ['kp', 'runEarned', 'totalEarned', 'merits', 'meritsEarned', 'bestRunEarned'] as const;

export function serialize(state: GameState): string {
  // Every GameState field is saved except the calendar, which the UI re-injects on start.
  const { calendar: _calendar, ...rest } = state;
  return JSON.stringify({ version: SAVE_VERSION, ...rest, ...Object.fromEntries(BIG.map((k) => [k, state[k].toString()])) });
}

const EXPORT_PREFIX = 'SKI1:';

/** The save as pasteable text: a prefix plus base64 of the UTF-8 JSON. */
export function exportSave(state: GameState): string {
  let bin = '';
  for (const b of new TextEncoder().encode(serialize(state))) bin += String.fromCharCode(b);
  return EXPORT_PREFIX + btoa(bin);
}

/** Inverse of exportSave, through the normal migrations. Throws SaveError on anything unusable. */
export function importSave(text: string, nowMs: number): GameState {
  const t = text.trim();
  if (!t.startsWith(EXPORT_PREFIX)) throw new SaveError('Not an exported save');
  let json: string;
  try {
    const bytes = Uint8Array.from(atob(t.slice(EXPORT_PREFIX.length)), (c) => c.charCodeAt(0));
    json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new SaveError('Corrupt export');
  }
  return deserialize(json, nowMs);
}

/** Parse, migrate and normalise a save. Throws SaveError on unusable data. */
export function deserialize(text: string, nowMs: number): GameState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new SaveError('Corrupt save (not JSON)');
  }
  const raw = obj(parsed);
  if (typeof raw.version !== 'number') throw new SaveError('Save has no version');
  const s = migrate(raw as RawSave);
  const d = createInitialState(nowMs);
  const settings = obj(s.settings);
  const event = obj(s.activeEvent);
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
  return {
    ...(Object.fromEntries(BIG.map((k) => [k, dec(s[k], d[k])])) as Pick<GameState, (typeof BIG)[number]>),
    purchases: num(s.purchases, 0),
    upgrades: levels(s.upgrades),
    automations: levels(s.automations),
    meritUpgrades: levels(s.meritUpgrades),
    prestiges: num(s.prestiges, 0),
    clicks: num(s.clicks, 0),
    timeMs: num(s.timeMs, 0),
    lastSeenMs: num(s.lastSeenMs, nowMs),
    activeEvent: typeof event.id === 'string' && typeof event.expiresAtMs === 'number' ? { id: event.id, expiresAtMs: event.expiresAtMs } : null,
    nextEventAtMs: num(s.nextEventAtMs, 0),
    buffs: (Array.isArray(s.buffs) ? s.buffs : [])
      .map(obj)
      .filter((b) => typeof b.source === 'string' && (b.kind === 'prodMult' || b.kind === 'clickMult'))
      .map((b) => ({ source: b.source as string, kind: b.kind as Buff['kind'], mult: num(b.mult, 1), untilMs: num(b.untilMs, 0) })),
    eventsClaimed: num(s.eventsClaimed, 0),
    eventStreak: count(s.eventStreak),
    bestEventStreak: Math.max(count(s.bestEventStreak), count(s.eventStreak)),
    eventOpen: s.eventOpen === true,
    achievements: uniqueStrings(s.achievements),
    inbox: uniqueStrings(s.inbox).filter((id) => getTicket(id)).slice(0, BALANCE.tickets.cap),
    nextTicketAtMs: num(s.nextTicketAtMs, d.nextTicketAtMs),
    ticketsAnswered: num(s.ticketsAnswered, 0),
    tipsSeen: uniqueStrings(s.tipsSeen),
    focus: typeof s.focus === 'string' && getFocus(s.focus) ? s.focus : DEFAULT_FOCUS,
    focusesPlayed: uniqueStrings(s.focusesPlayed).filter((id) => id !== DEFAULT_FOCUS && getFocus(id)),
    lastSeenVersion: count(s.lastSeenVersion),
    settings: {
      sound: bool(settings.sound, d.settings.sound),
      vibration: bool(settings.vibration, d.settings.vibration),
      volume: Math.min(1, Math.max(0, num(settings.volume, d.settings.volume))),
      notifyOfflineCap: settings.notifyOfflineCap === true,
      notifySeason: settings.notifySeason === true,
      tips: settings.tips !== false,
      notation: settings.notation === 'sci' ? 'sci' : 'short',
    },
  };
}
