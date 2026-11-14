// Task 020: refactor #4 — milestone helpers moved to core, registry lookups, save string lists,
// and stronger coverage for 016–019 code.
import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS, MERITS, UPGRADES } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  automationMult,
  createInitialState,
  getAutomation,
  getMerit,
  getUpgrade,
  milestoneName,
  milestoneProgressPct,
  milestonesReached,
  nextMilestone,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';

const ms = BALANCE.milestones;
const last = ms[ms.length - 1]!;

describe('milestoneProgressPct', () => {
  it('matches the formula the shop bar used before the move', () => {
    for (let n = 0; n <= last + 10; n++) {
      const next = nextMilestone(n);
      const prev = [0, ...ms].filter((m) => m <= n).pop() ?? 0;
      const old = next ? ((n - prev) / (next - prev)) * 100 : 100;
      expect(milestoneProgressPct(n), String(n)).toBeCloseTo(old, 10);
    }
  });

  it('starts at 0, restarts at each milestone and is 100 when all are reached', () => {
    expect(milestoneProgressPct(0)).toBe(0);
    for (const m of ms.slice(0, -1)) expect(milestoneProgressPct(m)).toBe(0);
    expect(milestoneProgressPct(last)).toBe(100);
    expect(milestoneProgressPct(last * 10)).toBe(100);
    expect(milestoneProgressPct(ms[0]! / 2)).toBeCloseTo(50, 10);
  });

  it('stays within 0–100 and grows inside each segment', () => {
    let prev = -1;
    for (let n = 0; n <= last + 5; n++) {
      const p = milestoneProgressPct(n);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
      if (milestonesReached(n) === milestonesReached(n - 1) && n > 0 && nextMilestone(n) !== null) {
        expect(p).toBeGreaterThan(prev);
      }
      prev = p;
    }
  });
});

describe('milestoneName (now in core)', () => {
  it('names every reached milestone of every real automation, in order', () => {
    for (const a of AUTOMATIONS) {
      expect(milestoneName(a, 0)).toBeNull();
      ms.forEach((m, i) => expect(milestoneName(a, m)).toBe(a.milestoneNames![i]));
    }
  });
});

describe('registry lookups', () => {
  it('find every definition by id and nothing for unknown ids', () => {
    for (const a of AUTOMATIONS) expect(getAutomation(a.id)).toBe(a);
    for (const u of UPGRADES) expect(getUpgrade(u.id)).toBe(u);
    for (const m of MERITS) expect(getMerit(m.id)).toBe(m);
    expect(getAutomation('nope')).toBeUndefined();
    expect(getUpgrade('nope')).toBeUndefined();
    expect(getMerit('nope')).toBeUndefined();
  });
});

describe('automationMult', () => {
  it('is milestoneMult per reached milestone when no upgrades are owned', () => {
    const id = AUTOMATIONS[0]!.id;
    for (const n of [0, ...ms, last + 1]) {
      const s: GameState = { ...createInitialState(0), automations: { [id]: n } };
      expect(automationMult(s, id)).toBe(Math.pow(BALANCE.milestoneMult, milestonesReached(n)));
    }
  });
});

describe('texts moved out of the UI', () => {
  it('toastMilestone appends the milestone name only when there is one', () => {
    const plain = T.toastMilestone('CSV', 25);
    expect(T.toastMilestone('CSV', 25, null)).toBe(plain);
    expect(T.toastMilestone('CSV', 25, 'Hej')).toBe(`${plain}. Hej!`);
  });

  it('perEach shows production per unit', () => {
    expect(T.perEach('0,4')).toBe(`+0,4 ${T.perSecond} styck`);
  });
});

describe('save string lists', () => {
  it('drop non-strings and duplicates but keep first-seen order', () => {
    const raw = JSON.parse(serialize(createInitialState(0)));
    raw.achievements = ['b', 1, 'a', 'b', null, 'a'];
    raw.tipsSeen = ['sync', {}, 'sync', 'buy'];
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.achievements).toEqual(['b', 'a']);
    expect(s.tipsSeen).toEqual(['sync', 'buy']);
  });

  it('turn anything that is not an array into an empty list', () => {
    const raw = JSON.parse(serialize(createInitialState(0)));
    raw.achievements = 'first-click';
    raw.tipsSeen = { 0: 'sync' };
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.achievements).toEqual([]);
    expect(s.tipsSeen).toEqual([]);
  });
});
