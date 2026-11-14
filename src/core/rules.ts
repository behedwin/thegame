// Pure formulas: production, costs, prestige. No side effects.
import { AUTOMATIONS, type AutomationDef } from '../content/registry';
import { BALANCE } from '../content/balance';
import { MERITS, type MeritDef } from '../content/registry';
import { UPGRADES, type UpgradeDef } from '../content/registry';
import { customerClickMult, customerProdMult, signedCustomers } from './customers';
import { Decimal, level, type GameState } from './state';

export { customerClickMult, customerProdMult, nextCustomer, signedCustomers } from './customers';

const upgradeById = new Map(UPGRADES.map((u) => [u.id, u]));
const automationById = new Map(AUTOMATIONS.map((a) => [a.id, a]));
const meritById = new Map(MERITS.map((m) => [m.id, m]));

export function getUpgrade(id: string): UpgradeDef | undefined {
  return upgradeById.get(id);
}
export function getAutomation(id: string): AutomationDef | undefined {
  return automationById.get(id);
}
export function getMerit(id: string): MeritDef | undefined {
  return meritById.get(id);
}

/** Number of milestone doublings reached for an owned count. */
export function milestonesReached(count: number): number {
  return BALANCE.milestones.filter((m) => count >= m).length;
}

/** Next milestone threshold above count, or null if all reached. */
export function nextMilestone(count: number): number | null {
  return BALANCE.milestones.find((m) => count < m) ?? null;
}

function meritSum(state: GameState, kind: 'prodPct' | 'clickPct' | 'offlineHours'): number {
  let sum = 0;
  for (const m of MERITS) {
    const lvl = level(state.meritUpgrades, m.id);
    if (lvl === 0) continue;
    const e = m.effect;
    if (e.kind === 'prodPct' && kind === 'prodPct') sum += e.pct * lvl;
    else if (e.kind === 'clickPct' && kind === 'clickPct') sum += e.pct * lvl;
    else if (e.kind === 'offlineHours' && kind === 'offlineHours') sum += e.hours * lvl;
  }
  return sum;
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

/** KP/s of one automation type, excluding temporary buffs. */
export function automationKps(state: GameState, def: AutomationDef): Decimal {
  const count = level(state.automations, def.id);
  if (count === 0) return new Decimal(0);
  return new Decimal(def.kps)
    .mul(count)
    .mul(automationMult(state, def.id))
    .mul(meritProdMult(state))
    .mul(customerProdMult(state));
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
  const base = new Decimal(add).mul(mult).add(kpPerSecond(state).mul(kpsShare));
  return base.mul(buffMult(state, 'clickMult'));
}

/** Cost of the next level/unit of an upgrade or automation. */
export function costOf(state: GameState, id: string): Decimal {
  const auto = automationById.get(id);
  if (auto) {
    const owned = level(state.automations, id);
    return new Decimal(auto.baseCost).mul(Decimal.pow(BALANCE.automationCostGrowth, owned)).ceil();
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
