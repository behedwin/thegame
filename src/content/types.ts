// Shapes of all content definitions. One definition per file; see registry.ts.
// Rule: the file name (without .ts) must equal the definition's id.

/** Shared fields of the sorted, named definitions. `order` is the sort key: lower first. */
interface Listed { id: string; order: number; name: string; desc: string }

/** A shop item bought in levels; maxLevel 1 = one-time purchase. */
interface Leveled<E> extends Listed { baseCost: number; costGrowth: number; maxLevel: number; effect: E }

export interface AutomationDef extends Listed {
  baseCost: number;
  /** Base KP per second per owned unit. */
  kps: number;
  /** System ids (src/content/systems/) data flows from and to. */
  from: string;
  to: string;
  /** Optional flavour name per milestone (same order as BALANCE.milestones), shown in toast and card. */
  milestoneNames?: readonly string[];
  /** School year (1-based; läsår 1 = 0 prestiges) from which it shows and can be bought. Absent = always. */
  unlockYear?: number;
}

export type UpgradeEffect =
  | { kind: 'clickAdd'; amount: number }
  | { kind: 'clickMult'; mult: number }
  | { kind: 'clickKpsShare'; share: number }
  | { kind: 'autoMult'; targets: readonly string[] | 'all'; mult: number };

export type UpgradeDef = Leveled<UpgradeEffect>;

export type MeritEffect =
  | { kind: 'prodPct'; pct: number }
  | { kind: 'clickPct'; pct: number }
  | { kind: 'offlineHours'; hours: number }
  | { kind: 'startAutomation'; id: string; count: number }
  /** Automations cost pct % less per level (multiplicative). */
  | { kind: 'autoDiscountPct'; pct: number }
  /** Event cooldown pct % shorter per level (additive, capped). */
  | { kind: 'eventCooldownPct'; pct: number }
  /** Offline earnings +pct % per level (additive). */
  | { kind: 'offlineEffPct'; pct: number };

export type MeritDef = Leveled<MeritEffect>;

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
  | { kind: 'prestiges'; n: number }
  | { kind: 'ticketsAnswered'; n: number }
  | { kind: 'focusesPlayed'; n: number }
  | { kind: 'eventStreak'; n: number };

/** A permanent achievement, kept across school years. Each unlocked one gives +1 % production. */
/** `desc` says how to unlock it (shown in the list, also while locked). */
export interface AchievementDef extends Listed { condition: AchievementCondition }

/** A day in the calendar year, 1-based (month 1-12, day 1-31). */
export interface MonthDay { month: number; day: number }

/** Temporary multiplier while a season is active. */
export type SeasonEffect = { kind: 'prodMult'; mult: number } | { kind: 'clickMult'; mult: number };

/**
 * A recurring school-year season (Höstlov, Nationella prov …). Active every year between start and end
 * (inclusive). A window may wrap over New Year (start after end). Never FOMO: it comes back every year.
 */
export interface SeasonDef extends Listed {
  /** `order` breaks ties when windows overlap (lower wins); `desc` is the banner's flavour line. */
  start: MonthDay;
  end: MonthDay;
  effect: SeasonEffect;
}

/** One answer to a ticket. Choices are trade-offs, never right or wrong. */
export interface TicketChoice {
  label: string;
  /** Shown as a toast after answering. */
  outcome: string;
  effect: EventEffect;
}

/** A support ticket in the inbox. Never expires and is never punished if ignored. */
export interface TicketDef {
  id: string;
  /** A system or customer id (src/content/systems/ or customers/). */
  from: string;
  title: string;
  text: string;
  /** 2-3 choices. */
  choices: readonly TicketChoice[];
}

export interface HelpSectionDef { id: string; order: number; title: string; body: readonly string[] }

/** One chapter of the story, shown when school year `order` begins (052). Short, dry and warm. */
export interface ChapterDef { id: string; order: number; title: string; text: string }

/** One rule change of a school-year focus (053). Multipliers apply for the whole school year. */
export type FocusEffect =
  | { kind: 'autoMult'; targets: readonly string[] | 'all'; mult: number }
  | { kind: 'prodMult'; mult: number }
  | { kind: 'clickMult'; mult: number }
  /** Prices of every item ('all') or only automations. */
  | { kind: 'costMult'; targets: 'all' | 'automations'; mult: number }
  | { kind: 'eventCooldownMult'; mult: number }
  /** Replaces BALANCE.milestoneMult. */
  | { kind: 'milestoneMult'; mult: number };

/** A focus chosen at "Nytt läsår" that changes the rules for one school year (053). Never a trap. */
export interface FocusDef extends Listed { unlockYear: number; effects: readonly FocusEffect[] }
