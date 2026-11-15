import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, UPGRADES } from '../src/content/registry';
import { automationMult } from '../src/core/rules';
import { createInitialState } from '../src/core';

const cases: Array<[string, string[]]> = [
  ['manifest', ['sftp', 'scim']],
  ['schemawiki', ['ss12001api', 'lti']],
];

describe('033 late-tier upgrades', () => {
  for (const [id, targets] of cases) {
    it(`${id} doubles only ${targets.join(' + ')}`, () => {
      const up = UPGRADES.find((u) => u.id === id)!;
      expect(up).toBeDefined();
      expect(up.maxLevel).toBe(3);
      expect(up.effect).toEqual({ kind: 'autoMult', targets, mult: 2 });
      const base = createInitialState(0);
      for (const lvl of [1, 2, 3]) {
        const s = { ...base, upgrades: { [id]: lvl } };
        for (const a of AUTOMATIONS) {
          const expected = targets.includes(a.id) ? Math.pow(2, lvl) : 1;
          expect(automationMult(s, a.id) / automationMult(base, a.id)).toBe(expected);
        }
      }
    });
  }

  it('are ordered after the existing upgrades', () => {
    const others = UPGRADES.filter((u) => !cases.some(([id]) => id === u.id));
    const maxOther = Math.max(...others.map((u) => u.order));
    for (const [id] of cases) expect(UPGRADES.find((u) => u.id === id)!.order).toBeGreaterThan(maxOther);
  });
});
