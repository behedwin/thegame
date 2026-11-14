// Content registry. Every definition lives in its own file and is discovered with
// import.meta.glob. Never maintain a central list by hand: add a file instead.
import type { AchievementDef, AutomationDef, CustomerDef, EventDef, MeritDef, SeasonDef, SystemDef, UpgradeDef } from './types';

type Modules<T> = Record<string, { default: T }>;

/** Validate (id === file name, unique) and sort a glob result. Exported for tests. */
export function collect<T extends { id: string }>(
  modules: Modules<T>,
  compare: (a: NoInfer<T>, b: NoInfer<T>) => number,
): readonly T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const [path, mod] of Object.entries(modules)) {
    const def = mod.default;
    const file = path.slice(path.lastIndexOf('/') + 1).replace(/\.ts$/, '');
    if (!def || def.id !== file) throw new Error(`Content file ${path} must default-export a definition with id "${file}"`);
    if (seen.has(def.id)) throw new Error(`Duplicate content id: ${def.id}`);
    seen.add(def.id);
    out.push(def);
  }
  return out.sort((a, b) => compare(a, b) || a.id.localeCompare(b.id));
}

const byOrder = (a: { order: number }, b: { order: number }) => a.order - b.order;
const none = () => 0;

export const AUTOMATIONS = collect(import.meta.glob<{ default: AutomationDef }>('./automations/*.ts', { eager: true }), byOrder);
export const UPGRADES = collect(import.meta.glob<{ default: UpgradeDef }>('./upgrades/*.ts', { eager: true }), byOrder);
export const MERITS = collect(import.meta.glob<{ default: MeritDef }>('./merits/*.ts', { eager: true }), byOrder);
export const EVENTS = collect(import.meta.glob<{ default: EventDef }>('./events/*.ts', { eager: true }), none);
export const SYSTEMS = collect(import.meta.glob<{ default: SystemDef }>('./systems/*.ts', { eager: true }), none);
export const CUSTOMERS = collect(
  import.meta.glob<{ default: CustomerDef }>('./customers/*.ts', { eager: true }),
  (a, b) => a.atRunKp - b.atRunKp,
);

export const ACHIEVEMENTS = collect(
  import.meta.glob<{ default: AchievementDef }>('./achievements/*.ts', { eager: true }),
  byOrder,
);

export const SEASONS = collect(import.meta.glob<{ default: SeasonDef }>('./seasons/*.ts', { eager: true }), byOrder);

const systemById = new Map(SYSTEMS.map((s) => [s.id, s]));

export function systemName(id: string): string {
  return systemById.get(id)?.name ?? id;
}

export type * from './types';
