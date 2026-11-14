// Pure formulas: production, costs, prestige. No side effects.
import { BALANCE } from '../content/balance';
import { ACHIEVEMENTS, AUTOMATIONS, MERITS, UPGRADES, type AutomationDef, type UpgradeDef } from '../content/registry';
import type { MeritDef } from '../content/types';
import { customerClickMult, customerProdMult, signedCustomers } from './customers';
import { seasonClickMult, seasonProdMult } from './seasons';
import { Decimal, level, type GameState } from './state';

export { customerClickMult, customerProdMult, nextCustomer, signedCustomers } from './customers';

const upgradeById = new Map(UPGRADES.map((u) => [u.id, u]));
const automationById = new Map(AUTOMATIONS.map((a) => [a.id, a]));
const meritById = new Map(MERITS.map((m) => [m.id, m]));
const achievementIds = new Set(ACHIEVEMENTS.map((a) => a.id));

/** Production bonus per unlocked achievement, in percent. */
export const ACHIEVEMENT_PROD_PCT = 1;

export function getUpgrade(id: string): UpgradeDef | undefined {
  return upgradeById.get(id);
}
export function getAutomation(id: string): AutomationDef | undefined {
  return automationById.get(id);
}

/** Number of milestone doublings reached for an owned count. */
export function milestonesReached(count: number): number {
  return BALANCE.milestones.filter((m) => count >= m).length;
}

/** Next milestone threshold above count, or null if all reached. */
export function nextMilestone(count: number): number | null {
  return BALANCE.milestones.find((m) => count < m) ?? null;
}

type SummedMerit = Exclude<MeritDef['effect']['kind'], 'startAutomation'>;

function meritSum(state: GameState, kind: SummedMerit): number {
  let sum = 0;
  for (const m of MERITS) {
    const e = m.effect;
    if (e.kind !== kind) continue;
    const amount = e.kind === 'offlineHours' ? e.hours : 'pct' in e ? e.pct : 0;
    sum += amount * level(state.meritUpgrades, m.id);
  }
  return sum;
}

/** Max total event cooldown reduction from merits, in percent. */
export const MAX_EVENT_COOLDOWN_CUT_PCT = 75;

/** Price factor on automations from merits (multiplicative per level, in (0, 1]). */
export function automationCostFactor(state: GameState): number {
  let f = 1;
  for (const m of MERITS) {
    if (m.effect.kind !== 'autoDiscountPct') continue;
    f *= Math.pow(1 - m.effect.pct / 100, level(state.meritUpgrades, m.id));
  }
  return f;
}

/** Base price of an automation's first unit after merit discounts. */
export function automationBaseCost(state: GameState, def: AutomationDef): number {
  return def.baseCost * automationCostFactor(state);
}

/** Time between a claimed/expired event and the next possible one. */
export function eventCooldownMs(state: GameState): number {
  const cut = Math.min(MAX_EVENT_COOLDOWN_CUT_PCT, meritSum(state, 'eventCooldownPct'));
  return BALANCE.events.cooldownMs * (1 - cut / 100);
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
  let mult = Math.pow(BALANCE.milestoneMult, milestonesReached(level(state.automations, id)));
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
  if (count === 0) return new Decimal(0);
  return new Decimal(def.kps)
    .mul(count)
    .mul(automationMult(state, def.id))
    .mul(meritProdMult(state))
    .mul(achievementProdMult(state))
    .mul(customerProdMult(state))
    .mul(seasonProdMult(state));
}

/** KP per second excluding buffs (used for offline progress). */
export function baseKps(state: GameState): Decimal {
  let total = new Decimal(0);
  for (const a of AUTOMATIONS) total = total.add(automationKps(state, a));
  return total;
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
  mult *= seasonClickMult(state);
  const base = new Decimal(add).mul(mult).add(kpPerSecond(state).mul(kpsShare));
  return base.mul(buffMult(state, 'clickMult'));
}

/** Cost of the next level/unit of an upgrade or automation. */
export function costOf(state: GameState, id: string): Decimal {
  const auto = automationById.get(id);
  if (auto) {
    const owned = level(state.automations, id);
    return new Decimal(automationBaseCost(state, auto)).mul(Decimal.pow(BALANCE.automationCostGrowth, owned)).ceil();
  }
  const up = upgradeById.get(id);
  if (up) return new Decimal(up.baseCost).mul(Decimal.pow(up.costGrowth, level(state.upgrades, id))).ceil();
  throw new Error(`Unknown item: ${id}`);
}

export function isMaxed(state: GameState, id: string): boolean {
  const up = upgradeById.get(id);
  return up !== undefined && level(state.upgrades, id) >= up.maxLevel;
}

export function canBuy(state: GameState, id: string): boolean {
  if (!automationById.has(id) && !upgradeById.has(id)) return false;
  if (isMaxed(state, id)) return false;
  return state.kp.gte(costOf(state, id));
}

/** Items are revealed once the player has earned a fraction of their price (progressive disclosure). */
export function isRevealed(state: GameState, id: string): boolean {
  const owned = level(state.automations, id) + level(state.upgrades, id);
  if (owned > 0) return true;
  return state.runEarned.gte(costOf(state, id).mul(0.4));
}

export function meritCost(state: GameState, id: string): Decimal {
  const m = meritById.get(id);
  if (!m) throw new Error(`Unknown merit: ${id}`);
  return new Decimal(m.baseCost).mul(Decimal.pow(m.costGrowth, level(state.meritUpgrades, id))).floor();
}

export function canBuyMerit(state: GameState, id: string): boolean {
  const m = meritById.get(id);
  if (!m || level(state.meritUpgrades, id) >= m.maxLevel) return false;
  return state.merits.gte(meritCost(state, id));
}

/** Meriter the player would receive by starting a new school year now. */
export function pendingMerits(state: GameState): Decimal {
  const { divisor, exponent } = BALANCE.prestige;
  return state.runEarned.div(divisor).pow(exponent).floor();
}

/** KP this school year needed to reach `merits` pending Meriter. */
export function runKpForMerits(merits: number): Decimal {
  const { divisor, exponent } = BALANCE.prestige;
  return new Decimal(merits).pow(1 / exponent).mul(divisor);
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

export function offlineCapMs(state: GameState): number {
  return (BALANCE.offline.baseCapHours + meritSum(state, 'offlineHours')) * 3_600_000;
}

/** Number of customers signed this school year (driven by KP earned this year). */
export function customersSigned(state: GameState): number {
  return signedCustomers(state).length;
}

export function activeBuffs(state: GameState): GameState['buffs'] {
  return state.buffs.filter((b) => b.untilMs > state.timeMs);
}
