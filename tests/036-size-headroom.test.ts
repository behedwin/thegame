import { describe, expect, it } from 'vitest';
import { createInitialState, Decimal, type GameState } from '../src/core';
import { deserialize, SAVE_VERSION, serialize } from '../src/save/format';

const fresh = (): GameState => createInitialState(0);
const BIG = ['kp', 'runEarned', 'totalEarned', 'merits', 'meritsEarned'] as const;

describe('save format after the size cleanup (task 036)', () => {
  it('saves every Decimal field as a string and drops the calendar', () => {
    const s: GameState = { ...fresh(), kp: new Decimal('1.5e40'), merits: new Decimal(7), calendar: { month: 6, day: 10 } };
    const raw = JSON.parse(serialize(s)) as Record<string, unknown>;
    expect(raw.version).toBe(SAVE_VERSION);
    for (const k of BIG) expect(typeof raw[k]).toBe('string');
    expect(raw.kp).toBe(new Decimal('1.5e40').toString());
    expect('calendar' in raw).toBe(false);
  });

  it('restores Decimal fields and falls back per field on bad values', () => {
    const raw = { ...JSON.parse(serialize(fresh())), kp: '123', runEarned: -5, totalEarned: 'nope', merits: 4, meritsEarned: null };
    const s = deserialize(JSON.stringify(raw), 0);
    expect(s.kp.toString()).toBe('123');
    expect(s.merits.toString()).toBe('4');
    for (const k of ['runEarned', 'totalEarned', 'meritsEarned'] as const) expect(s[k].toString()).toBe('0');
    for (const k of BIG) expect(s[k]).toBeInstanceOf(Decimal);
  });

  it('keeps boolean settings and replaces non-booleans with defaults', () => {
    const raw = { ...JSON.parse(serialize(fresh())), settings: { sound: false, vibration: 'yes' } };
    const { settings } = deserialize(JSON.stringify(raw), 0);
    expect(settings.sound).toBe(false);
    expect(settings.vibration).toBe(true);
  });

  it('keeps the state key order through a round trip', () => {
    const s = fresh();
    expect(Object.keys(deserialize(serialize(s), 0))).toEqual(Object.keys(s));
  });
});
