// Shapes of all content definitions. One definition per file; see registry.ts.
// Rule: the file name (without .ts) must equal the definition's id.

export interface AutomationDef {
  id: string;
  /** Sort key (tier). Lower first. */
  order: number;
  name: string;
  desc: string;
  baseCost: number;
  /** Base KP per second per owned unit. */
  kps: number;
  /** System ids (src/content/systems/) data flows from and to. */
  from: string;
  to: string;
}

export type UpgradeEffect =
  | { kind: 'clickAdd'; amount: number }
  | { kind: 'clickMult'; mult: number }
  | { kind: 'clickKpsShare'; share: number }
  | { kind: 'autoMult'; targets: readonly string[] | 'all'; mult: number };

export interface UpgradeDef {
  id: string;
  order: number;
  name: string;
  desc: string;
  baseCost: number;
  costGrowth: number;
  /** 1 = one-time purchase. */
  maxLevel: number;
  effect: UpgradeEffect;
}

export type MeritEffect =
  | { kind: 'prodPct'; pct: number }
  | { kind: 'clickPct'; pct: number }
  | { kind: 'offlineHours'; hours: number }
  | { kind: 'startAutomation'; id: string; count: number };

export interface MeritDef {
  id: string;
  order: number;
  name: string;
  desc: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  effect: MeritEffect;
}

export type EventEffect =
  | { kind: 'prodMult'; mult: number; durationMs: number }
  | { kind: 'clickMult'; mult: number; durationMs: number }
  | { kind: 'lump'; seconds: number; minKp: number };

export interface EventDef {
  id: string;
  title: string;
  /** Shown after the player taps the event. */
  claimText: string;
  /** Relative spawn weight. */
  weight: number;
  effect: EventEffect;
}

/** A parody edtech/IT system. Never a real brand name. */
export interface SystemDef {
  id: string;
  name: string;
  /** What kind of system it pretends to be, so the joke works without knowing the original. */
  kind: string;
  /** Optional parody marketing slogan (max 40 chars), shown when the system is tapped on the map. */
  tagline?: string;
}

/**
 * Contract bonus while the customer is signed (this school year).
 * By convention: kommun -> prodPct (stable, additive), friskola -> clickPct, koncern -> prodMult.
 */
export type CustomerEffect =
  | { kind: 'prodPct'; pct: number }
  | { kind: 'clickPct'; pct: number }
  | { kind: 'prodMult'; mult: number };

/** An invented municipality or school operator. Never a real organisation. */
export interface CustomerDef {
  id: string;
  name: string;
  kind: 'kommun' | 'friskola' | 'koncern';
  /** Signed when KP earned this school year reaches this amount. Also the sort key. */
  atRunKp: number;
  effect: CustomerEffect;
}

/** What must be true for an achievement to unlock. Checked after every tick. */
export type AchievementCondition =
  | { kind: 'clicks'; n: number }
  | { kind: 'totalEarned'; kp: number }
  | { kind: 'kps'; kp: number }
  | { kind: 'automation'; id: string; n: number }
  | { kind: 'automationsTotal'; n: number }
  | { kind: 'upgradesTotal'; n: number }
  | { kind: 'eventsClaimed'; n: number }
  | { kind: 'customers'; n: number }
  | { kind: 'prestiges'; n: number };

/** A permanent achievement, kept across school years. Each unlocked one gives +1 % production. */
export interface AchievementDef {
  id: string;
  order: number;
  name: string;
  /** How to unlock it (shown in the list, also while locked). */
  desc: string;
  condition: AchievementCondition;
}
