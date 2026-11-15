import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS, FOCUSES } from '../src/content/registry';
import {
  automationKps,
  chooseFocus,
  costOf,
  createInitialState,
  currentFocus,
  Decimal,
  DEFAULT_FOCUS,
  eventCooldownMs,
  focusesForYear,
  focusMeritMult,
  getAutomation,
  kpPerClick,
  pendingMerits,
  prestige,
  runKpForMerits,
  type GameState,
} from '../src/core';
import { deserialize, migrate, SAVE_VERSION } from '../src/save/format';

const auto = (id: string) => getAutomation(id)!;

/** A school-year-3 state with a few of everything, so every multiplier shows. */
function base(focus = DEFAULT_FOCUS): GameState {
  return {
    ...createInitialState(0),
    prestiges: 2,
    kp: new Decimal(1e6),
    runEarned: new Decimal(4e9),
    automations: { csv: 30, nightly: 10, api: 10, flow: 10, sftp: 5 },
    upgrades: {},
    focus,
  };
}

const withFocus = (focus: string): GameState => ({ ...base(), focus });

describe('053 school-year focus: content', () => {
  it('has 4-5 focuses with unique ids, name, description and effects', () => {
    expect(FOCUSES.length).toBeGreaterThanOrEqual(4);
    expect(FOCUSES.length).toBeLessThanOrEqual(5);
    expect(new Set(FOCUSES.map((f) => f.id)).size).toBe(FOCUSES.length);
    for (const f of FOCUSES) {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.desc.length).toBeGreaterThan(0);
      expect(Array.isArray(f.effects)).toBe(true);
      expect(f.unlockYear).toBeGreaterThanOrEqual(1);
    }
  });

  it('the default focus changes nothing, every other focus changes something', () => {
    const def = FOCUSES.find((f) => f.id === DEFAULT_FOCUS)!;
    expect(def.effects).toEqual([]);
    for (const f of FOCUSES.filter((f) => f.id !== DEFAULT_FOCUS)) expect(f.effects.length).toBeGreaterThan(0);
  });

  it('autoMult targets are real automations', () => {
    const ids = new Set(AUTOMATIONS.map((a) => a.id));
    for (const f of FOCUSES) {
      for (const e of f.effects) if (e.kind === 'autoMult' && e.targets !== 'all') for (const t of e.targets) expect(ids.has(t)).toBe(true);
    }
  });
});

describe('053 school-year focus: unlocks', () => {
  it('year 1 offers only the default; two more in year 2; more in years 4 and 6', () => {
    expect(focusesForYear(1).map((f) => f.id)).toEqual([DEFAULT_FOCUS]);
    const y2 = focusesForYear(2).length;
    expect(y2).toBe(3);
    expect(focusesForYear(3).length).toBe(y2);
    expect(focusesForYear(4).length).toBeGreaterThan(y2);
    expect(focusesForYear(6).length).toBeGreaterThan(focusesForYear(4).length);
    expect(focusesForYear(6).length).toBe(FOCUSES.length);
  });

  it('chooseFocus accepts only focuses unlocked this school year, and never in year 1', () => {
    const y1 = { ...createInitialState(0) };
    expect(chooseFocus(y1, 'budget')).toBe(y1);
    const y2 = { ...createInitialState(0), prestiges: 1 };
    expect(chooseFocus(y2, 'budget').focus).toBe('budget');
    expect(chooseFocus(y2, 'standard')).toBe(y2);
    expect(chooseFocus(y2, 'nope')).toBe(y2);
    expect(chooseFocus({ ...y2, prestiges: 5 }, 'standard').focus).toBe('standard');
  });

  it('new games start on the default focus, and prestige resets to it', () => {
    expect(createInitialState(0).focus).toBe(DEFAULT_FOCUS);
    const s = { ...base('budget'), runEarned: new Decimal(1e12) };
    expect(prestige(s).focus).toBe(DEFAULT_FOCUS);
  });

  it('does not mutate its input', () => {
    const s = base();
    const copy = structuredClone({ ...s, kp: s.kp.toString(), runEarned: s.runEarned.toString() });
    chooseFocus(s, 'cloud');
    expect({ ...s, kp: s.kp.toString(), runEarned: s.runEarned.toString() }).toEqual(copy);
  });
});

describe('053 school-year focus: effects', () => {
  const kps = (s: GameState, id: string) => automationKps(s, auto(id)).toNumber();
  const F = BALANCE.focus;

  it('the default focus is identical to having no focus', () => {
    const s = base();
    const { focus: _f, ...noFocus } = s;
    const legacy = noFocus as GameState;
    for (const a of AUTOMATIONS) expect(automationKps(s, a).toString()).toBe(automationKps(legacy, a).toString());
    expect(kpPerClick(s).toString()).toBe(kpPerClick(legacy).toString());
    expect(costOf(s, 'csv').toString()).toBe(costOf(legacy, 'csv').toString());
    expect(eventCooldownMs(s)).toBe(eventCooldownMs(legacy));
    expect(focusMeritMult(s)).toBe(1);
    expect(currentFocus(legacy).id).toBe(DEFAULT_FOCUS);
  });

  it('cloud: API and flow ×3, CSV and nightly ×0.5, others unchanged', () => {
    const [b, c] = [base(), withFocus('cloud')];
    expect(kps(c, 'api') / kps(b, 'api')).toBeCloseTo(F.cloud.boost);
    expect(kps(c, 'flow') / kps(b, 'flow')).toBeCloseTo(F.cloud.boost);
    expect(kps(c, 'csv') / kps(b, 'csv')).toBeCloseTo(F.cloud.cut);
    expect(kps(c, 'nightly') / kps(b, 'nightly')).toBeCloseTo(F.cloud.cut);
    expect(kps(c, 'sftp')).toBeCloseTo(kps(b, 'sftp'));
    expect(kpPerClick(c).toString()).toBe(kpPerClick(b).toString());
    expect(costOf(c, 'api').toString()).toBe(costOf(b, 'api').toString());
  });

  it('budget: every purchase cheaper, production lower', () => {
    const [b, c] = [base(), withFocus('budget')];
    expect(costOf(c, 'csv').toNumber() / costOf(b, 'csv').toNumber()).toBeCloseTo(F.budget.cost, 2);
    expect(costOf(c, 'coffee').toNumber()).toBeLessThan(costOf(b, 'coffee').toNumber());
    for (const id of ['csv', 'api', 'sftp']) expect(kps(c, id) / kps(b, id)).toBeCloseTo(F.budget.prod);
  });

  it('project: KP per click ×5, events sooner, automations ×0.7', () => {
    const noKps = { ...base(), automations: {} };
    const proj = { ...noKps, focus: 'project' };
    expect(kpPerClick(proj).toNumber() / kpPerClick(noKps).toNumber()).toBeCloseTo(F.project.click);
    expect(eventCooldownMs(withFocus('project'))).toBeCloseTo(eventCooldownMs(base()) * F.project.cooldown);
    for (const id of ['csv', 'api']) expect(kps(withFocus('project'), id) / kps(base(), id)).toBeCloseTo(F.project.auto);
  });

  it('standard: milestones ×3 instead of ×2, automations cost more', () => {
    const [b, c] = [base(), withFocus('standard')];
    // csv has 30 units: one milestone reached.
    expect(kps(c, 'csv') / kps(b, 'csv')).toBeCloseTo(F.standard.milestone / BALANCE.milestoneMult);
    // api has 10: no milestone, no change.
    expect(kps(c, 'api')).toBeCloseTo(kps(b, 'api'));
    expect(costOf(c, 'csv').toNumber() / costOf(b, 'csv').toNumber()).toBeCloseTo(F.standard.autoCost, 2);
    expect(costOf(c, 'coffee').toString()).toBe(costOf(b, 'coffee').toString());
  });

  it('every focus but the default gives +15 % merits at the next new school year', () => {
    for (const f of FOCUSES) {
      const s = withFocus(f.id);
      const expected = f.id === DEFAULT_FOCUS ? 1 : F.meritBonus;
      expect(focusMeritMult(s)).toBe(expected);
      const raw = s.runEarned.div(BALANCE.prestige.divisor).pow(BALANCE.prestige.exponent);
      expect(pendingMerits(s).toNumber()).toBe(raw.mul(expected).floor().toNumber());
    }
    // The "next merit at" figure follows the bonus.
    expect(runKpForMerits(4, F.meritBonus).toNumber()).toBeLessThan(runKpForMerits(4).toNumber());
  });
});

describe('053 school-year focus: save', () => {
  it('a v8 save gets the default focus', () => {
    const migrated = migrate({ version: 8, kp: '5' });
    expect(migrated.focus).toBe(DEFAULT_FOCUS);
    expect(migrated.version).toBe(SAVE_VERSION);
  });

  it('round-trips a chosen focus and drops unknown ones', () => {
    const s = chooseFocus({ ...createInitialState(0), prestiges: 1 }, 'budget');
    const json = JSON.stringify({ version: SAVE_VERSION, ...s, kp: '0', runEarned: '0', totalEarned: '0', merits: '0', meritsEarned: '0', bestRunEarned: '0' });
    expect(deserialize(json, 0).focus).toBe('budget');
    expect(deserialize(json.replace('"budget"', '"bogus"'), 0).focus).toBe(DEFAULT_FOCUS);
  });
});
