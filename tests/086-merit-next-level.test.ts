import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import type { MeritDef, MeritEffect } from '../src/content/types';
import { getMerit, MAX_EVENT_COOLDOWN_CUT_PCT } from '../src/core';
import { meritEffectText, meritNextText } from '../src/ui/shop';

const merit = (effect: MeritEffect, maxLevel = 10): MeritDef => ({
  id: 'x',
  order: 0,
  name: 'X',
  desc: '',
  baseCost: 1,
  costGrowth: 1,
  maxLevel,
  effect,
});

describe('086 merit next level', () => {
  it('shows the next level even at level 0', () => {
    expect(meritNextText(merit({ kind: 'prodPct', pct: 50 }), 0)).toBe('Nästa: +50\u00a0% produktion');
    expect(meritNextText(merit({ kind: 'prodPct', pct: 50 }), 2)).toBe('Nästa: +150\u00a0% produktion');
  });

  it('shows the real diminishing discount for Ramavtal at level 9', () => {
    const framework = getMerit('framework')!;
    expect(meritEffectText(framework, 9)).toBe('Nu: −37\u00a0% på integrationer');
    expect(meritNextText(framework, 9)).toBe('Nästa: −40,1\u00a0% på integrationer');
  });

  it('stops at the event cooldown cap', () => {
    const near = merit({ kind: 'eventCooldownPct', pct: 25 });
    expect(meritNextText(near, 1)).toBe('Nästa: event 50\u00a0% tätare');
    expect(meritNextText(near, 2)).toBe(`Nästa: event ${MAX_EVENT_COOLDOWN_CUT_PCT}\u00a0% tätare`);
    expect(meritNextText(near, 3)).toBe(`Nästa: event ${MAX_EVENT_COOLDOWN_CUT_PCT}\u00a0% tätare`);
    const network = getMerit('network')!;
    expect(meritNextText(network, network.maxLevel - 1)).toBe('Nästa: event 50\u00a0% tätare');
  });

  it('is empty for maxed merits and set for every real merit below max', () => {
    for (const m of MERITS) {
      expect(meritNextText(m, m.maxLevel)).toBe('');
      expect(meritNextText(m, 0)).toMatch(/^Nästa: /);
      expect(meritNextText(m, m.maxLevel - 1)).toMatch(/^Nästa: /);
    }
  });
});
