// All tuning numbers in one place. Change only with sim-report.json numbers as justification.
export const BALANCE = {
  baseClick: 1,
  automationCostGrowth: 1.155,
  /** Owning this many of one automation doubles its output (cumulative). */
  milestones: [25, 50, 100, 250] as readonly number[],
  milestoneMult: 2,
  offline: {
    baseCapHours: 8,
    efficiency: 1,
    /** Below this, offline earnings are credited silently (no dialog). */
    dialogMinMs: 60_000,
  },
  prestige: {
    /** Meriter = floor((KP earned this school year / divisor) ^ exponent). */
    divisor: 1e9,
    exponent: 0.5,
  },
  events: {
    rollIntervalMs: 1_000,
    chancePerRoll: 1 / 150,
    cooldownMs: 60_000,
    visibleMs: 15_000,
  },
  tickets: {
    /** Inbox size. It stops filling when full; nothing expires. */
    cap: 3,
    /** Game time before the first ticket of a new game. */
    firstAtMs: 120_000,
    /** Mean game time between tickets, ± jitter (fraction). */
    intervalMs: 180_000,
    jitter: 0.25,
  },
  /** The national goal (052): connected municipalities, derived from school years and lifetime KP. Display only. */
  goal: {
    municipalities: 290,
    /** Share of the goal earned by lifetime KP: perDecade per factor 10 of totalEarned, at most earnedShare. */
    earnedShare: 30,
    perDecade: 1.5,
    /** The rest comes from finished school years: (prestiges / yearsToGoal) ^ yearExponent, full at yearsToGoal. */
    yearsToGoal: 14,
    yearExponent: 0.6,
  },
  morning: { coffeeMult: 1.2, standupMult: 2, standupMs: 120_000 }, // welcome-back choices (034)
} as const;
