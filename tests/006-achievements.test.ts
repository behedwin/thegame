import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, AUTOMATIONS, CUSTOMERS, UPGRADES } from '../src/content/registry';
import {
  ACHIEVEMENT_PROD_PCT,
  achievementProdMult,
  baseKps,
  buy,
  checkAchievements,
  click,
  createInitialState,
  Decimal,
  isMet,
  newAchievements,
  prestige,
  tick,
  type GameState,
} from '../src/core';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = () => createInitialState(1_000);

describe('achievement content', () => {
  it('has exactly 20 achievements with unique order and Swedish texts', () => {
    expect(ACHIEVEMENTS).toHaveLength(20);
    expect(new Set(ACHIEVEMENTS.map((a) => a.order)).size).toBe(20);
    for (const a of ACHIEVEMENTS) {
      expect(a.name.trim(), a.id).not.toBe('');
      expect(a.desc.trim(), a.id).not.toBe('');
    }
  });

  it('conditions reference real content and positive, reachable thresholds', () => {
    const autoIds = new Set(AUTOMATIONS.map((a) => a.id));
    for (const { id, condition: c } of ACHIEVEMENTS) {
      if (c.kind === 'automation') expect(autoIds.has(c.id), id).toBe(true);
      if (c.kind === 'customers') expect(c.n, id).toBeLessThanOrEqual(CUSTOMERS.length);
      if (c.kind === 'upgradesTotal') {
        expect(c.n, id).toBeLessThanOrEqual(UPGRADES.reduce((s, u) => s + u.maxLevel, 0));
      }
      const v = 'n' in c ? c.n : c.kp;
      expect(v > 0 && Number.isFinite(v), id).toBe(true);
    }
  });

  it('includes the named ones from the task', () => {
    const names = ACHIEVEMENTS.map((a) => a.name);
    for (const n of ['Första CSV:n', 'Semikolonmästare', '10 000 lösenord', 'Mötet som kunde varit ett mejl']) {
      expect(names).toContain(n);
    }
  });
});

describe('conditions', () => {
  it('each kind is false on a fresh state and true when its threshold is met', () => {
    const s = fresh();
    for (const a of ACHIEVEMENTS) expect(isMet(s, a.condition), a.id).toBe(false);
    const big: GameState = {
      ...s,
      clicks: 1e6,
      totalEarned: new Decimal(1e15),
      runEarned: new Decimal(1e15),
      automations: Object.fromEntries(AUTOMATIONS.map((a) => [a.id, 300])),
      upgrades: Object.fromEntries(UPGRADES.map((u) => [u.id, u.maxLevel])),
      eventsClaimed: 1000,
      prestiges: 10,
    };
    for (const a of ACHIEVEMENTS) expect(isMet(big, a.condition), a.id).toBe(true);
  });

  it('kps uses production without buffs', () => {
    const s: GameState = { ...fresh(), automations: { csv: 1 } };
    const buffed: GameState = { ...s, buffs: [{ source: 'x', kind: 'prodMult', mult: 1e9, untilMs: 1e12 }] };
    expect(isMet(buffed, { kind: 'kps', kp: 1000 })).toBe(false);
    expect(isMet(s, { kind: 'kps', kp: baseKps(s).toNumber() })).toBe(true);
  });
});

describe('unlocking', () => {
  it('checkAchievements returns the same state when nothing new holds', () => {
    const s = fresh();
    expect(checkAchievements(s)).toBe(s);
  });

  it('only the cheap hooks unlock early in the first school year (keeps first prestige pacing)', () => {
    // Generous early-run state: 5 000 clicks, 5 events, 10 M KP, 100 automations, 15 upgrade levels.
    const s: GameState = {
      ...fresh(),
      clicks: 5000,
      eventsClaimed: 5,
      runEarned: new Decimal(1e7),
      totalEarned: new Decimal(1e7),
      automations: { csv: 60, nightly: 40 },
      upgrades: { coffee: 10, fika: 5 },
    };
    expect(checkAchievements(s).achievements.sort()).toEqual(['forsta-csv', 'motet-mejl']);
  });

  it('tick unlocks, does not mutate input and never duplicates', () => {
    const s = { ...click(fresh(), 10_000) };
    const snapshot = JSON.stringify(s.achievements);
    const t = tick(s, 16);
    expect(JSON.stringify(s.achievements)).toBe(snapshot);
    expect(t.achievements).toContain('tiotusen-losenord');
    const t2 = tick(t, 16);
    expect(t2.achievements.filter((id) => id === 'tiotusen-losenord')).toHaveLength(1);
  });

  it('newAchievements lists only fresh unlocks', () => {
    const before: GameState = { ...fresh(), clicks: 10_000, eventsClaimed: 1 };
    const after = tick(before, 16);
    expect(newAchievements(before, after).map((a) => a.id)).toEqual(['motet-mejl', 'tiotusen-losenord']);
    expect(newAchievements(after, tick(after, 16))).toEqual([]);
  });

  it('first CSV unlocks after buying one', () => {
    let s = click(fresh(), 50);
    s = tick(buy(s, 'csv'), 16);
    expect(s.achievements).toContain('forsta-csv');
  });

  it('achievements survive a new school year, and prestige unlocks the prestige one', () => {
    let s: GameState = { ...fresh(), achievements: ['forsta-csv'], runEarned: new Decimal(1e9), totalEarned: new Decimal(1e9) };
    s = prestige(s);
    expect(s.achievements).toEqual(['forsta-csv']);
    s = tick(s, 16);
    expect(s.achievements).toContain('nytt-lasar');
  });
});

describe('production bonus', () => {
  it('is +1 % per known achievement and ignores unknown ids', () => {
    expect(ACHIEVEMENT_PROD_PCT).toBe(1);
    expect(achievementProdMult(fresh())).toBe(1);
    const s: GameState = { ...fresh(), achievements: ['forsta-csv', 'motet-mejl', 'from-the-future'] };
    expect(achievementProdMult(s)).toBeCloseTo(1.02, 10);
    const all: GameState = { ...fresh(), achievements: ACHIEVEMENTS.map((a) => a.id) };
    expect(achievementProdMult(all)).toBeCloseTo(1.2, 10);
  });

  it('multiplies automation output', () => {
    const base: GameState = { ...fresh(), automations: { csv: 10 } };
    const boosted: GameState = { ...base, achievements: ['forsta-csv', 'motet-mejl'] };
    expect(baseKps(boosted).div(baseKps(base)).toNumber()).toBeCloseTo(1.02, 10);
  });
});

describe('save format v2', () => {
  it('bumps the version and migrates v1 saves to an empty list', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(2);
    expect(migrate({ version: 1, kp: '5' }, MIGRATIONS, 2)).toEqual({ version: 2, kp: '5', achievements: [] });
    expect(deserialize(JSON.stringify({ version: 1, kp: '5' }), 0).achievements).toEqual([]);
  });

  it('round-trips achievements', () => {
    const s: GameState = { ...fresh(), achievements: ['forsta-csv', 'motet-mejl'] };
    expect(deserialize(serialize(s), 0).achievements).toEqual(['forsta-csv', 'motet-mejl']);
  });

  it('sanitises broken achievement lists', () => {
    const bad = JSON.stringify({ version: 2, achievements: ['a', 3, null, 'a', 'b'] });
    expect(deserialize(bad, 0).achievements).toEqual(['a', 'b']);
    expect(deserialize(JSON.stringify({ version: 2, achievements: 'nope' }), 0).achievements).toEqual([]);
  });
});
