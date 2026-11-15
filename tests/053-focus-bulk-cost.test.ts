import { describe, expect, it } from 'vitest';
import { FOCUSES } from '../src/content/registry';
import { buy, costOf, createInitialState, Decimal, type GameState } from '../src/core';
import { buyMany, costOfMany, maxAffordable } from '../src/core/bulk';

// Regression (hotfix after 053): the shop price (costOf) and the actual purchase (bulk.ts) must agree in
// every school-year focus. Budgetår showed -30 % prices that could not be paid, Standardiseringsår charged
// less than shown, and the pacing bot spun 100 failed buys per second.

/** School year 7, so every focus is unlocked, with some of everything owned. */
function withFocus(focus: string, kp: Decimal = new Decimal(0)): GameState {
  return {
    ...createInitialState(0),
    prestiges: 6,
    focus,
    kp,
    automations: { csv: 30, nightly: 12 },
    upgrades: { coffee: 2 },
  };
}

const ITEMS = ['csv', 'nightly', 'coffee'];

describe('focus cost multipliers reach the actual purchase', () => {
  for (const f of FOCUSES) {
    for (const id of ITEMS) {
      it(`${f.id}: one unit of ${id} costs exactly the shown price`, () => {
        const s = withFocus(f.id);
        expect(costOfMany(s, id, 1).eq(costOf(s, id))).toBe(true);
      });

      it(`${f.id}: ${id} can be bought with exactly the shown price, leaving 0 KP`, () => {
        const s = withFocus(f.id);
        const price = costOf(s, id);
        const rich = { ...s, kp: price };
        const after = buy(rich, id);
        expect(after).not.toBe(rich);
        expect(after.kp.eq(0)).toBe(true);
        expect(maxAffordable(rich, id)).toBe(1);
      });
    }
  }

  it('Budgetår makes bulk buys cheaper than Vanligt läsår, Standardiseringsår makes automations dearer', () => {
    const kp = new Decimal(1e12);
    const ten = (focus: string) => costOfMany(withFocus(focus, kp), 'csv', 10);
    expect(ten('budget').lt(ten('normal'))).toBe(true);
    expect(ten('standard').gt(ten('normal'))).toBe(true);
    expect(buyMany(withFocus('budget', kp), 'csv', 10).automations.csv).toBe(40);
  });
});
