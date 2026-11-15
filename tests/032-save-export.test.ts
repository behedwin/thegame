import { describe, expect, it } from 'vitest';
import { buy, click, createInitialState, Decimal, type GameState } from '../src/core';
import { exportSave, importSave, SAVE_VERSION, SaveError, serialize } from '../src/save/format';

function played(): GameState {
  let s = createInitialState(5_000);
  s = click(s, 50);
  s = buy(s, 'coffee');
  s = buy(s, 'csv');
  return { ...s, merits: new Decimal('1e400'), meritUpgrades: { summer: 1 }, tipsSeen: ['sync'] };
}

const encode = (json: string) => 'SKI1:' + btoa(json);

describe('save export/import (task 032)', () => {
  it('round-trips a played state exactly', () => {
    const s = played();
    const text = exportSave(s);
    expect(text.startsWith('SKI1:')).toBe(true);
    expect(text).toMatch(/^SKI1:[A-Za-z0-9+/=]+$/);
    const back = importSave(text, 9_999);
    expect(serialize(back)).toBe(serialize(s));
    expect(back.merits.exponent).toBe(400);
  });

  it('tolerates surrounding whitespace from chat apps', () => {
    const s = played();
    expect(serialize(importSave(`  \n${exportSave(s)}\n `, 0))).toBe(serialize(s));
  });

  it('does not save the injected calendar', () => {
    const s = { ...played(), calendar: { month: 6, day: 1 } } as GameState;
    expect(JSON.parse(serialize(s))).not.toHaveProperty('calendar');
    expect(JSON.parse(serialize(s)).version).toBe(SAVE_VERSION);
  });

  it('migrates an exported v5 save', () => {
    const s = importSave(encode(JSON.stringify({ version: 5, kp: '42', timeMs: 1234, tipsSeen: ['sync'] })), 0);
    expect(s.kp.toNumber()).toBe(42);
    expect(s.inbox).toEqual([]);
    expect(s.nextTicketAtMs).toBe(1234);
    expect(s.tipsSeen).toEqual(['sync']);
  });

  it('rejects junk with a SaveError and nothing else', () => {
    const bad = ['', '   ', 'hello', 'SKI2:' + btoa('{"version":6}'), 'SKI1:', 'SKI1:!!!not base64', encode('{nope'), encode('null'), encode('{"kp":"1"}'), encode(JSON.stringify({ version: SAVE_VERSION + 1 })), 'SKI1:' + btoa('\xff\xfe')];
    for (const text of bad) {
      expect(() => importSave(text, 0), text).toThrow(SaveError);
    }
  });
});
