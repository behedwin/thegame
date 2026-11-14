// Versioned save format. Pure functions: no storage access here.
import { createInitialState, Decimal, type GameState } from '../core/state';

export const SAVE_VERSION = 1;

/** Raw JSON shape. Unknown on purpose: anything may come out of storage. */
export type RawSave = { version: number; [key: string]: unknown };
export type Migration = (save: RawSave) => RawSave;

/**
 * MIGRATIONS[n] upgrades a save from version n to n + 1.
 * Never edit an existing migration once released; add a new one and bump SAVE_VERSION.
 */
export const MIGRATIONS: Record<number, Migration> = {};

export class SaveError extends Error {}

export function migrate(
  save: RawSave,
  migrations: Record<number, Migration> = MIGRATIONS,
  target: number = SAVE_VERSION,
): RawSave {
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

function dec(v: unknown, fallback: Decimal): Decimal {
  if (typeof v !== 'string' && typeof v !== 'number') return fallback;
  try {
    const d = new Decimal(v);
    return Number.isFinite(d.mantissa) && Number.isFinite(d.exponent) && d.gte(0) ? d : fallback;
  } catch {
    return fallback;
  }
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function levels(v: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (v && typeof v === 'object') {
    for (const [k, n] of Object.entries(v)) {
      if (typeof n === 'number' && Number.isInteger(n) && n > 0) out[k] = n;
    }
  }
  return out;
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

export function serialize(state: GameState): string {
  const save: RawSave = {
    version: SAVE_VERSION,
    kp: state.kp.toString(),
    runEarned: state.runEarned.toString(),
    totalEarned: state.totalEarned.toString(),
    merits: state.merits.toString(),
    meritsEarned: state.meritsEarned.toString(),
    upgrades: state.upgrades,
    automations: state.automations,
    meritUpgrades: state.meritUpgrades,
    prestiges: state.prestiges,
    clicks: state.clicks,
    timeMs: state.timeMs,
    lastSeenMs: state.lastSeenMs,
    activeEvent: state.activeEvent,
    nextEventAtMs: state.nextEventAtMs,
    buffs: state.buffs,
    eventsClaimed: state.eventsClaimed,
    settings: state.settings,
  };
  return JSON.stringify(save);
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
  const buffs = Array.isArray(s.buffs) ? s.buffs : [];
  return {
    kp: dec(s.kp, d.kp),
    runEarned: dec(s.runEarned, d.runEarned),
    totalEarned: dec(s.totalEarned, d.totalEarned),
    merits: dec(s.merits, d.merits),
    meritsEarned: dec(s.meritsEarned, d.meritsEarned),
    upgrades: levels(s.upgrades),
    automations: levels(s.automations),
    meritUpgrades: levels(s.meritUpgrades),
    prestiges: num(s.prestiges, 0),
    clicks: num(s.clicks, 0),
    timeMs: num(s.timeMs, 0),
    lastSeenMs: num(s.lastSeenMs, nowMs),
    activeEvent:
      typeof event.id === 'string' && typeof event.expiresAtMs === 'number'
        ? { id: event.id, expiresAtMs: event.expiresAtMs }
        : null,
    nextEventAtMs: num(s.nextEventAtMs, 0),
    buffs: buffs
      .map(obj)
      .filter((b) => typeof b.source === 'string' && (b.kind === 'prodMult' || b.kind === 'clickMult'))
      .map((b) => ({
        source: b.source as string,
        kind: b.kind as 'prodMult' | 'clickMult',
        mult: num(b.mult, 1),
        untilMs: num(b.untilMs, 0),
      })),
    eventsClaimed: num(s.eventsClaimed, 0),
    settings: {
      sound: typeof settings.sound === 'boolean' ? settings.sound : d.settings.sound,
      vibration: typeof settings.vibration === 'boolean' ? settings.vibration : d.settings.vibration,
    },
  };
}
