// Customer contracts: signed by KP earned this school year, each gives a bonus.
// Derived purely from state.runEarned, so nothing extra is stored in the save.
import { CUSTOMERS, type CustomerDef } from '../content/registry';
import type { GameState } from './state';

/** Customers signed this school year, in signing order. */
export function signedCustomers(state: GameState): readonly CustomerDef[] {
  return CUSTOMERS.filter((c) => state.runEarned.gte(c.atRunKp));
}

/** Next customer to sign this school year, or null if all are signed. */
export function nextCustomer(state: GameState): CustomerDef | null {
  return CUSTOMERS.find((c) => state.runEarned.lt(c.atRunKp)) ?? null;
}

/** Production multiplier: (1 + sum of kommun pct) x product of koncern multipliers. */
export function customerProdMult(state: GameState): number {
  let pct = 0;
  let mult = 1;
  for (const c of signedCustomers(state)) {
    if (c.effect.kind === 'prodPct') pct += c.effect.pct;
    else if (c.effect.kind === 'prodMult') mult *= c.effect.mult;
  }
  return (1 + pct / 100) * mult;
}

/** Click multiplier: 1 + sum of friskola pct. */
export function customerClickMult(state: GameState): number {
  let pct = 0;
  for (const c of signedCustomers(state)) if (c.effect.kind === 'clickPct') pct += c.effect.pct;
  return 1 + pct / 100;
}
