import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import type { MeritDef, MeritEffect } from '../src/content/types';
import { MAX_EVENT_COOLDOWN_CUT_PCT } from '../src/core';
import { meritEffectText } from '../src/ui/shop';

const merit = (effect: MeritEffect, maxLevel = 10): MeritDef => ({
  id: 'x',
  name: 'X',
  desc: '',
  baseCost: 1,
  costGrowth: 1,
  maxLevel,
  effect,
});

describe('082 merit total effect', () => {
  it('is empty at level 0 for every merit', () => {
    for (const m of MERITS) expect(meritEffectText(m, 0)).toBe('');
  });

  it('sums additive effects per level', () => {
    expect(meritEffectText(merit({ kind: 'prodPct', pct: 50 }), 1)).toBe('Nu: +50 % produktion');
    expect(meritEffectText(merit({ kind: 'prodPct', pct: 50 }), 4)).toBe('Nu: +200 % produktion');
    expect(meritEffectText(merit({ kind: 'clickPct', pct: 100 }), 3)).toBe('Nu: +300 % KP per klick');
    expect(meritEffectText(merit({ kind: 'offlineHours', hours: 2 }), 8)).toBe('Nu: +16 h offlinetak');
    expect(meritEffectText(merit({ kind: 'offlineEffPct', pct: 10 }), 5)).toBe('Nu: +50 % KP när du är borta');
  });

  it('names the starting automation', () => {
    expect(meritEffectText(merit({ kind: 'startAutomation', id: 'csv', count: 5 }), 2)).toBe(
      'Nu: börjar med 10 CSV-import',
    );
  });

  it('shows the real multiplicative automation discount', () => {
    expect(meritEffectText(merit({ kind: 'autoDiscountPct', pct: 5 }), 1)).toBe('Nu: −5 % på integrationer');
    expect(meritEffectText(merit({ kind: 'autoDiscountPct', pct: 5 }), 2)).toBe('Nu: −9,8 % på integrationer');
    expect(meritEffectText(merit({ kind: 'autoDiscountPct', pct: 5 }), 10)).toBe('Nu: −40,1 % på integrationer');
  });

  it('caps the event cooldown cut', () => {
    expect(meritEffectText(merit({ kind: 'eventCooldownPct', pct: 10 }), 2)).toBe('Nu: event 20 % tätare');
    expect(meritEffectText(merit({ kind: 'eventCooldownPct', pct: 30 }), 5)).toBe(
      `Nu: event ${MAX_EVENT_COOLDOWN_CUT_PCT} % tätare`,
    );
  });

  it('shows a non-empty effect for every real merit at level 1 and max', () => {
    for (const m of MERITS) {
      expect(meritEffectText(m, 1)).toMatch(/^Nu: /);
      expect(meritEffectText(m, m.maxLevel)).toMatch(/^Nu: /);
    }
  });
});
