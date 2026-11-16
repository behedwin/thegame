// Pure formulas: production, costs, prestige. No side effects.
import { BALANCE } from '../content/balance';
import { ACHIEVEMENTS, AUTOMATIONS, byId, MERITS, UPGRADES, type AutomationDef, type MeritDef } from '../content/registry';
import { focusAutoMult, focusClickMult, focusCooldownMult, focusCostMult, focusMeritMult, milestoneMultOf } from './focus';
import { customerClickMult, customerProdMult, signedCustomers } from './customers';
import { seasonClickMult, seasonProdMult } from './seasons';
import { Decimal, level, type GameState } from './state';
import { isUnlocked } from './unlocks';

export { customerClickMult, customerProdMult, nextCustomer, signedCustomers } from './customers';

const achievementIds = new Set(ACHIEVEMENTS.map((a) => a.id));

/** Production bonus per unlocked achievement, in percent. */
export const ACHIEVEMENT_PROD_PCT = 1;

export const getUpgrade = byId(UPGRADES);
export const getAutomation = byId(AUTOMATIONS);
export const getMerit = byId(MERITS);

/** Number of milestone doublings reached for an owned count. */
export const milestonesReached = (count: number): number => BALANCE.milestones.filter((m) => count >= m).length;

/** Next milestone threshold above count, or null if all reached. */
export const nextMilestone = (count: number): number | null => BALANCE.milestones.find((m) => count < m) ?? null;

/** Progress from the last reached milestone towards the next, 0–100 (100 when all are reached). */
export function milestoneProgressPct(count: number): number {
  const next = nextMilestone(count);
  if (next === null) return 100;
  const prev = BALANCE.milestones.filter((m) => m <= count).pop() ?? 0;
  return ((count - prev) / (next - prev)) * 100;
}

/** Flavour name of the latest milestone reached at this count, or null if none (or unnamed). */
export function milestoneName(def: AutomationDef, count: number): string | null {
  const reached = milestonesReached(count);
  return reached > 0 ? (def.milestoneNames?.[reached - 1] ?? null) : null;
}

/** Max total event cooldown reduction from merits, in percent. */
export const MAX_EVENT_COOLDOWN_CUT_PCT = 75;

/** Price factor from one discount merit at a level: multiplicative per level, in (0, 1]. */
export const discountFactor = (pct: number, lvl: number): number => Math.pow(1 - pct / 100, lvl);

/**
 * The effect of one merit at a level, as one number: percent for the pct kinds (a discount as percent off,
 * the event cut capped), hours for offlineHours and automations for startAutomation. The single source for
 * both the core formulas and the merit card (090), so the card never shows another number than the game uses.
 */
export function meritLevelEffect(def: MeritDef, lvl: number): number {
  const e = def.effect;
  switch (e.kind) {
    case 'offlineHours':
      return e.hours * lvl;
    case 'startAutomation':
      return e.count * lvl;
    case 'autoDiscountPct':
      return (1 - discountFactor(e.pct, lvl)) * 100;
    case 'eventCooldownPct':
      return Math.min(MAX_EVENT_COOLDOWN_CUT_PCT, e.pct * lvl);
    default:
      return e.pct * lvl;
  }
}

type SummedMerit = 'prodPct' | 'clickPct' | 'offlineHours' | 'eventCooldownPct' | 'offlineEffPct';

function meritSum(state: GameState, kind: SummedMerit): number {
  let sum = 0;
  for (const m of MERITS) if (m.effect.kind === kind) sum += meritLevelEffect(m, level(state.meritUpgrades, m.id));
  return sum;
}

/** Price factor on automations from all discount merits together. */
export function automationCostFactor(state: GameState): number {
  let f = 1;
  for (const m of MERITS) if (m.effect.kind === 'autoDiscountPct') f *= discountFactor(m.effect.pct, level(state.meritUpgrades, m.id));
  return f;
}

/**
 * Base prices after merit discounts and the school-year focus. The single source for both costOf() and
 * bulk buying (bulk.ts), so the shown price and the price actually paid can never drift apart.
 */
export const automationBaseCost = (state: GameState, def: AutomationDef): number =>
  def.baseCost * automationCostFactor(state) * focusCostMult(state, true);
export const upgradeBaseCost = (state: GameState, def: { baseCost: number }): number => def.baseCost * focusCostMult(state, false);

/** Time between a claimed/expired event and the next possible one. */
export function eventCooldownMs(state: GameState): number {
  const cut = Math.min(MAX_EVENT_COOLDOWN_CUT_PCT, meritSum(state, 'eventCooldownPct'));
  return BALANCE.events.cooldownMs * (1 - cut / 100) * focusCooldownMult(state);
}

/** Share of base KP/s credited while away. */
export function offlineEfficiency(state: GameState): number {
  return BALANCE.offline.efficiency * (1 + meritSum(state, 'offlineEffPct') / 100);
}

function buffMult(state: GameState, kind: 'prodMult' | 'clickMult'): number {
  let mult = 1;
  for (const b of state.buffs) if (b.kind === kind && b.untilMs > state.timeMs) mult *= b.mult;
  return mult;
}

/** Multiplier on one automation from upgrades and milestones (not global/merit/buff). */
export function automationMult(state: GameState, id: string): number {
  let mult = Math.pow(milestoneMultOf(state), milestonesReached(level(state.automations, id)));
  for (const u of UPGRADES) {
    const lvl = level(state.upgrades, u.id);
    if (lvl === 0 || u.effect.kind !== 'autoMult') continue;
    const t = u.effect.targets;
    if (t === 'all' || t.includes(id)) mult *= Math.pow(u.effect.mult, lvl);
  }
  return mult;
}

/** Global production multiplier from merits (permanent). */
export function meritProdMult(state: GameState): number {
  return 1 + meritSum(state, 'prodPct') / 100;
}

/** Permanent production multiplier from unlocked achievements (unknown ids are ignored). */
export function achievementProdMult(state: GameState): number {
  let n = 0;
  for (const id of state.achievements) if (achievementIds.has(id)) n++;
  return 1 + (n * ACHIEVEMENT_PROD_PCT) / 100;
}

/** KP/s of one automation type, excluding temporary buffs. */
export function automationKps(state: GameState, def: AutomationDef): Decimal {
  const count = level(state.automations, def.id);
  if (count === 0 || !isUnlocked(state, def)) return new Decimal(0);
  return new Decimal(def.kps)
    .mul(count)
    .mul(automationMult(state, def.id))
    .mul(meritProdMult(state))
    .mul(achievementProdMult(state))
    .mul(customerProdMult(state))
    .mul(seasonProdMult(state))
    .mul(focusAutoMult(state, def.id));
}

/** KP per second excluding buffs (used for offline progress). */
export function baseKps(state: GameState): Decimal {
  let total = new Decimal(0);
  for (const a of AUTOMATIONS) total = total.add(automationKps(state, a));
  return total;
}

/** Per-automation owned counts and share of total KP/s (buffs included), for the network map. */
export type NetworkFlow = { counts: Record<string, number>; shares: Record<string, number>; total: number };
export function networkFlow(state: GameState): NetworkFlow {
  const [counts, shares, total]: [Record<string, number>, Record<string, number>, Decimal] = [{}, {}, kpPerSecond(state)];
  for (const a of AUTOMATIONS) {
    counts[a.id] = level(state.automations, a.id);
    shares[a.id] = total.gt(0) ? automationKps(state, a).div(total).toNumber() : 0;
  }
  return { counts, shares, total: total.toNumber() };
}

/** KP per second including active buffs. */
export function kpPerSecond(state: GameState): Decimal {
  return baseKps(state).mul(buffMult(state, 'prodMult'));
}

export function kpPerClick(state: GameState): Decimal {
  let add = BALANCE.baseClick;
  let mult = 1;
  let kpsShare = 0;
  for (const u of UPGRADES) {
    const lvl = level(state.upgrades, u.id);
    if (lvl === 0) continue;
    const e = u.effect;
    if (e.kind === 'clickAdd') add += e.amount * lvl;
    else if (e.kind === 'clickMult') mult *= Math.pow(e.mult, lvl);
    else if (e.kind === 'clickKpsShare') kpsShare += e.share * lvl;
  }
  mult *= 1 + meritSum(state, 'clickPct') / 100;
  mult *= customerClickMult(state);
  mult *= seasonClickMult(state) * focusClickMult(state);
  const base = new Decimal(add).mul(mult).add(kpPerSecond(state).mul(kpsShare));
  return base.mul(buffMult(state, 'clickMult'));
}

/** Cost of the next level/unit of an upgrade or automation. */
export function costOf(state: GameState, id: string): Decimal {
  const auto = getAutomation(id);
  if (auto) {
    const owned = level(state.automations, id);
    return new Decimal(automationBaseCost(state, auto)).mul(Decimal.pow(BALANCE.automationCostGrowth, owned)).ceil();
  }
  const up = getUpgrade(id);
  if (up) return new Decimal(upgradeBaseCost(state, up)).mul(Decimal.pow(up.costGrowth, level(state.upgrades, id))).ceil();
  throw new Error(`Unknown item: ${id}`);
}

/** Whether an upgrade, or a merit in the merit shop (081), has reached its max level. */
export function isMaxed(state: GameState, id: string): boolean {
  const up = getUpgrade(id);
  if (up) return level(state.upgrades, id) >= up.maxLevel;
  const m = getMerit(id);
  return m !== undefined && level(state.meritUpgrades, id) >= m.maxLevel;
}

/** Split ids into buyable ones and maxed ones, keeping the original order in each (073). */
export function splitMaxed(state: GameState, ids: readonly string[]): { open: string[]; done: string[] } {
  const open: string[] = [];
  const done: string[] = [];
  for (const id of ids) (isMaxed(state, id) ? done : open).push(id);
  return { open, done };
}

export function canBuy(state: GameState, id: string): boolean {
  const auto = getAutomation(id);
  if (!auto && !getUpgrade(id)) return false;
  if (auto && !isUnlocked(state, auto)) return false;
  if (isMaxed(state, id)) return false;
  return state.kp.gte(costOf(state, id));
}

/** Items are revealed once the player has earned a fraction of their price (progressive disclosure). */
export function isRevealed(state: GameState, id: string): boolean {
  const auto = getAutomation(id);
  if (auto && !isUnlocked(state, auto)) return false;
  const owned = level(state.automations, id) + level(state.upgrades, id);
  if (owned > 0) return true;
  return state.runEarned.gte(costOf(state, id).mul(0.4));
}

export function meritCost(state: GameState, id: string): Decimal {
  const m = getMerit(id);
  if (!m) throw new Error(`Unknown merit: ${id}`);
  return new Decimal(m.baseCost).mul(Decimal.pow(m.costGrowth, level(state.meritUpgrades, id))).floor();
}

export function canBuyMerit(state: GameState, id: string): boolean {
  const m = getMerit(id);
  if (!m || isMaxed(state, id)) return false;
  return state.merits.gte(meritCost(state, id));
}

/** True when at least one merit upgrade can be bought now (089: dot on the Läsår tab). */
export const anyMeritAffordable = (state: GameState): boolean => MERITS.some((m) => canBuyMerit(state, m.id));

/** True when an upgrade not yet bought (level 0) can be bought now (093: dot on the Uppgraderingar tab). */
export const anyUpgradeAffordable = (state: GameState): boolean =>
  UPGRADES.some((u) => level(state.upgrades, u.id) === 0 && canBuy(state, u.id));

/** True when an unlocked automation the player does not own yet can be bought now (097: dot on the Integrationer tab). */
export const anyNewAutomationAffordable = (state: GameState): boolean =>
  AUTOMATIONS.some((a) => level(state.automations, a.id) === 0 && canBuy(state, a.id));

/** Meriter the player would receive by starting a new school year now (with the focus bonus, 053). */
export function pendingMerits(state: GameState): Decimal {
  const { divisor, exponent } = BALANCE.prestige;
  return state.runEarned.div(divisor).pow(exponent).mul(focusMeritMult(state)).floor();
}

/** Most KP earned in one school year, counting the running one. */
export const bestYearEarned = (state: GameState): Decimal => Decimal.max(state.bestRunEarned, state.runEarned);

/** KP this school year needed to reach `merits` pending Meriter, given the focus merit factor `mult`. */
export function runKpForMerits(merits: number, mult = 1): Decimal {
  const { divisor, exponent } = BALANCE.prestige;
  return new Decimal(merits / mult).pow(1 / exponent).mul(divisor);
}

/** Pay for and add one level of a merit upgrade. No affordability check: callers check canBuyMerit. */
export function withMeritLevel(state: GameState, id: string): GameState {
  return {
    ...state,
    merits: state.merits.sub(meritCost(state, id)),
    meritUpgrades: { ...state.meritUpgrades, [id]: level(state.meritUpgrades, id) + 1 },
  };
}

/**
 * Preview for the prestige card: roughly how much faster production runs next school year, in percent,
 * if all Meriter (owned + pending) go to production merits, cheapest first. 0 when nothing is pending.
 */
export function nextYearSpeedupPct(state: GameState): number {
  const pending = pendingMerits(state);
  if (pending.lt(1)) return 0;
  const prod = MERITS.filter((m) => m.effect.kind === 'prodPct');
  let sim: GameState = { ...state, merits: state.merits.add(pending), meritUpgrades: { ...state.meritUpgrades } };
  for (let n = 0; n < 500; n++) {
    const buyable = prod.filter((m) => canBuyMerit(sim, m.id));
    if (buyable.length === 0) break;
    buyable.sort((a, b) => meritCost(sim, a.id).cmp(meritCost(sim, b.id)));
    sim = withMeritLevel(sim, buyable[0]!.id);
  }
  return Math.max(0, Math.round((meritProdMult(sim) / meritProdMult(state) - 1) * 100));
}

export const offlineCapMs = (state: GameState): number => (BALANCE.offline.baseCapHours + meritSum(state, 'offlineHours')) * 3_600_000;

/** Number of customers signed this school year (driven by KP earned this year). */
export const customersSigned = (state: GameState): number => signedCustomers(state).length;

export const activeBuffs = (state: GameState): GameState['buffs'] => state.buffs.filter((b) => b.untilMs > state.timeMs);
