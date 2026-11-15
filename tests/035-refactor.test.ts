import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS, TICKETS } from '../src/content/registry';
import { createInitialState, type GameState } from '../src/core';
import { deserialize, SAVE_VERSION, serialize } from '../src/save/format';
import { buffLine } from '../src/ui/hud';
import { welcomeSystemId } from '../src/ui/welcome';

const fresh = (): GameState => createInitialState(0);
const save = (extra: Record<string, unknown>) => JSON.stringify({ ...JSON.parse(serialize(fresh())), version: SAVE_VERSION, ...extra });

describe('welcomeSystemId (task 035, moved from ui/app.ts)', () => {
  it('falls back to the default system when nothing is owned', () => {
    expect(welcomeSystemId(fresh(), () => 0.3)).toBe('skolmjuk');
  });

  it('picks either end of an owned automation', () => {
    const a = AUTOMATIONS[1]!;
    const s = { ...fresh(), automations: { [a.id]: 2 } };
    expect(welcomeSystemId(s, () => 0)).toBe(a.from);
    expect(welcomeSystemId(s, () => 0.99)).toBe(a.to);
  });

  it('never picks an automation the player does not own', () => {
    const [a, b] = [AUTOMATIONS[0]!, AUTOMATIONS[2]!];
    const s = { ...fresh(), automations: { [a.id]: 1, [b.id]: 1 } };
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) expect([a.from, a.to, b.from, b.to]).toContain(welcomeSystemId(s, () => r));
  });
});

describe('buffLine (task 035, moved from ui/app.ts)', () => {
  it('is null without a running buff', () => {
    expect(buffLine(fresh())).toBeNull();
    const expired = { ...fresh(), timeMs: 5_000, buffs: [{ source: 'x', kind: 'prodMult' as const, mult: 2, untilMs: 4_000 }] };
    expect(buffLine(expired)).toBeNull();
  });

  it('shows the multiplier, whole seconds left and the buff kind', () => {
    const s = { ...fresh(), timeMs: 1_000, buffs: [{ source: 'morning', kind: 'clickMult' as const, mult: 2, untilMs: 2_500 }] };
    expect(buffLine(s)).toBe('×2 klick · 2 s');
    const p = { ...s, buffs: [{ ...s.buffs[0]!, kind: 'prodMult' as const }] };
    expect(buffLine(p)).toBe('×2 produktion · 2 s');
  });
});

describe('deserialize hardening (task 035)', () => {
  it('drops an active event without id or expiry', () => {
    expect(deserialize(save({ activeEvent: { id: 'x' } }), 0).activeEvent).toBeNull();
    expect(deserialize(save({ activeEvent: { id: 'x', expiresAtMs: 9 } }), 0).activeEvent).toEqual({ id: 'x', expiresAtMs: 9 });
  });

  it('keeps valid buffs and repairs their numbers', () => {
    const buffs = [{ source: 'a', kind: 'clickMult', mult: 'big', untilMs: null }, { kind: 'prodMult' }, 'junk'];
    expect(deserialize(save({ buffs }), 0).buffs).toEqual([{ source: 'a', kind: 'clickMult', mult: 1, untilMs: 0 }]);
    expect(deserialize(save({ buffs: 'nope' }), 0).buffs).toEqual([]);
  });

  it('keeps only known, unique tickets and at most the cap', () => {
    const ids = TICKETS.map((t) => t.id);
    const inbox = ['unknown', ids[0], ids[0], ...ids.slice(1)];
    const back = deserialize(save({ inbox }), 0).inbox;
    expect(back).toEqual(ids.slice(0, BALANCE.tickets.cap));
    expect(new Set(back).size).toBe(back.length);
  });
});
