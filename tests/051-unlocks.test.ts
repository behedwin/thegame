// Task 051: new integration types unlock in later school years.
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, SYSTEMS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  automationKps,
  baseKps,
  buy,
  canBuy,
  costOf,
  createInitialState,
  Decimal,
  getAutomation,
  isRevealed,
  isUnlocked,
  nextUnlock,
  schoolYear,
  unlocksInYear,
  type GameState,
} from '../src/core';
import { buyMany, maxAffordable } from '../src/core/bulk';

const inYear = (year: number, extra: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), prestiges: year - 1, ...extra });
const def = (id: string) => getAutomation(id)!;
const NEW = { federation: 3, schedexport: 6, gradetransfer: 9 } as const;

describe('isUnlocked', () => {
  it('derives the school year from prestiges', () => {
    expect(schoolYear(inYear(1))).toBe(1);
    expect(schoolYear(inYear(9))).toBe(9);
  });

  it('unlocks each new type from its school year on', () => {
    for (const [id, year] of Object.entries(NEW)) {
      expect(isUnlocked(inYear(1), def(id)), id).toBe(false);
      expect(isUnlocked(inYear(year - 1), def(id)), id).toBe(false);
      expect(isUnlocked(inYear(year), def(id)), id).toBe(true);
      expect(isUnlocked(inYear(year + 1), def(id)), id).toBe(true);
    }
  });

  it('matches years 1, 3, 6 and 9 exactly', () => {
    const open = (y: number) => Object.keys(NEW).filter((id) => isUnlocked(inYear(y), def(id)));
    expect(open(1)).toEqual([]);
    expect(open(3)).toEqual(['federation']);
    expect(open(6)).toEqual(['federation', 'schedexport']);
    expect(open(9)).toEqual(['federation', 'schedexport', 'gradetransfer']);
  });

  it('keeps automations without unlockYear always unlocked', () => {
    for (const a of AUTOMATIONS.filter((x) => x.unlockYear === undefined)) expect(isUnlocked(inYear(1), a), a.id).toBe(true);
  });
});

describe('locked automations', () => {
  const rich = (year: number) => inYear(year, { kp: new Decimal('1e20'), runEarned: new Decimal('1e20') });

  it('cannot be bought: buy and buyMany return the same state', () => {
    const s = rich(2);
    expect(canBuy(s, 'federation')).toBe(false);
    expect(buy(s, 'federation')).toBe(s);
    expect(buyMany(s, 'federation', 5)).toBe(s);
    expect(maxAffordable(s, 'federation')).toBe(0);
  });

  it('can be bought once unlocked', () => {
    const s = rich(3);
    expect(canBuy(s, 'federation')).toBe(true);
    expect(buy(s, 'federation').automations.federation).toBe(1);
  });

  it('are hidden from the shop until unlocked', () => {
    expect(isRevealed(rich(2), 'federation')).toBe(false);
    expect(isRevealed(rich(3), 'federation')).toBe(true);
  });

  it('do not count in production while locked (e.g. an edited save)', () => {
    const s = inYear(2, { automations: { federation: 10 } });
    expect(automationKps(s, def('federation')).eq(0)).toBe(true);
    expect(baseKps(s).eq(0)).toBe(true);
    expect(automationKps({ ...s, prestiges: 2 }, def('federation')).gt(0)).toBe(true);
  });

  it('never mutates the input', () => {
    const s = rich(3);
    const snapshot = JSON.stringify(s);
    buy(s, 'federation');
    buy(rich(2), 'federation');
    isUnlocked(s, def('federation'));
    nextUnlock(s);
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});

describe('next unlock', () => {
  it('names the next school year that brings something new', () => {
    expect(nextUnlock(inYear(1))).toMatchObject({ year: 3 });
    expect(nextUnlock(inYear(2))!.defs.map((a) => a.id)).toEqual(['federation']);
    expect(nextUnlock(inYear(3))).toMatchObject({ year: 6 });
    expect(nextUnlock(inYear(8))!.defs.map((a) => a.id)).toEqual(['gradetransfer']);
    expect(nextUnlock(inYear(9))).toBeNull();
  });

  it('lists what a school year unlocks (nothing in year 1)', () => {
    expect(unlocksInYear(1)).toEqual([]);
    expect(unlocksInYear(6).map((a) => a.id)).toEqual(['schedexport']);
    expect(unlocksInYear(4)).toEqual([]);
  });

  it('has Swedish texts for the prestige tab and the toast', () => {
    expect(T.prestige.unlockNext('X')).toBe('Nästa läsår låser upp: X');
    expect(T.prestige.unlockLater(9, 'X')).toBe('Läsår 9: X');
    expect(T.prestige.unlocked('X')).toBe('Ny integrationstyp: X');
  });
});

describe('content validation (051)', () => {
  it('unlockYear is an integer >= 1 when present', () => {
    for (const a of AUTOMATIONS) {
      if (a.unlockYear === undefined) continue;
      expect(Number.isInteger(a.unlockYear) && a.unlockYear >= 1, a.id).toBe(true);
    }
  });

  it('new types connect existing, distinct systems and continue the cost curve', () => {
    const systems = new Set(SYSTEMS.map((s) => s.id));
    for (const id of Object.keys(NEW)) {
      const a = def(id);
      expect(systems.has(a.from) && systems.has(a.to), id).toBe(true);
      expect(a.from).not.toBe(a.to);
    }
    expect(costOf(inYear(9), 'federation').gt(costOf(inYear(9), 'lti'))).toBe(true);
  });

  it('ids are unique across automations and systems', () => {
    const a = AUTOMATIONS.map((x) => x.id);
    const s = SYSTEMS.map((x) => x.id);
    expect(new Set(a).size).toBe(a.length);
    expect(new Set(s).size).toBe(s.length);
  });
});
