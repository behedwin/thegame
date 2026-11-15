import { describe, expect, it } from 'vitest';
import { MERITS } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  canPrestige,
  createInitialState,
  Decimal,
  pendingMerits,
  prestige,
  prestigeUnlocked,
  runKpForMerits,
  startingAutomations,
  type GameState,
} from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { inboxArchiveLine } from '../src/ui/inbox';
import { statRows } from '../src/ui/stats';

const fresh = (): GameState => createInitialState(0);
const ready = (): GameState => ({
  ...fresh(),
  kp: new Decimal(123),
  runEarned: runKpForMerits(3),
  totalEarned: runKpForMerits(3).mul(2),
  bestRunEarned: new Decimal(1),
  upgrades: { a: 2 },
  automations: { csv: 7 },
  buffs: [{ source: 'e', kind: 'prodMult', mult: 2, untilMs: 999_999 }],
  inbox: ['x'],
  ticketsAnswered: 4,
  eventsClaimed: 3,
  clicks: 9,
  achievements: ['a'],
  tipsSeen: ['t'],
});

describe('core/prestige.ts (task 050)', () => {
  it('canPrestige needs at least one pending merit', () => {
    expect(canPrestige(fresh())).toBe(false);
    expect(canPrestige({ ...fresh(), runEarned: runKpForMerits(1) })).toBe(true);
  });

  it('prestigeUnlocked at a quarter of the first merit, or after any prestige', () => {
    const quarter = runKpForMerits(1).mul(0.25);
    expect(prestigeUnlocked({ ...fresh(), runEarned: quarter.mul(0.99) })).toBe(false);
    expect(prestigeUnlocked({ ...fresh(), runEarned: quarter })).toBe(true);
    expect(prestigeUnlocked({ ...fresh(), prestiges: 1 })).toBe(true);
  });

  it('prestige without pending merits returns the same state', () => {
    const s = fresh();
    expect(prestige(s)).toBe(s);
  });

  it('prestige resets the run and keeps lifetime totals, inbox and counters', () => {
    const s = ready();
    const gained = pendingMerits(s);
    const n = prestige(s);
    expect(n.kp.eq(0) && n.runEarned.eq(0)).toBe(true);
    expect(n.upgrades).toEqual({});
    expect(n.automations).toEqual({});
    expect(n.buffs).toEqual([]);
    expect(n.activeEvent).toBeNull();
    expect(n.tipsSeen).toEqual([]);
    expect(n.merits.eq(s.merits.add(gained))).toBe(true);
    expect(n.meritsEarned.eq(s.meritsEarned.add(gained))).toBe(true);
    expect(n.bestRunEarned.eq(s.runEarned)).toBe(true);
    expect(n.prestiges).toBe(1);
    expect(n.totalEarned.eq(s.totalEarned)).toBe(true);
    expect([n.inbox, n.ticketsAnswered, n.eventsClaimed, n.clicks, n.achievements]).toEqual([s.inbox, 4, 3, 9, ['a']]);
    expect(n.calendar).toBeNull();
  });

  it('prestige does not mutate its input', () => {
    const s = ready();
    const before = serialize(s);
    prestige(s);
    expect(serialize(s)).toBe(before);
  });

  it('startingAutomations sums startAutomation merits by level and ignores others', () => {
    expect(startingAutomations({})).toEqual({});
    const starters = MERITS.filter((m) => m.effect.kind === 'startAutomation');
    expect(starters.length).toBeGreaterThan(0);
    const levels = Object.fromEntries(MERITS.map((m) => [m.id, 2]));
    const expected: Record<string, number> = {};
    for (const m of starters) {
      if (m.effect.kind !== 'startAutomation') continue;
      expected[m.effect.id] = (expected[m.effect.id] ?? 0) + m.effect.count * 2;
    }
    expect(startingAutomations(levels)).toEqual(expected);
    const n = prestige({ ...ready(), meritUpgrades: levels });
    expect(n.automations).toEqual(expected);
  });

  it('a prestiged state survives a save round trip', () => {
    const n = prestige(ready());
    const back = deserialize(serialize(n), 0);
    expect(back.prestiges).toBe(1);
    expect(back.merits.eq(n.merits)).toBe(true);
    expect(back.bestRunEarned.eq(n.bestRunEarned)).toBe(true);
    expect(back.ticketsAnswered).toBe(4);
  });
});

describe('046–049 helpers (task 050)', () => {
  it('statistics show answered tickets, matching the inbox archive line', () => {
    const s = { ...fresh(), ticketsAnswered: 12 };
    expect(statRows(s).find((r) => r.label === T.stats.tickets)?.value).toBe('12');
    expect(inboxArchiveLine(s)).toBe(T.inbox.archive(12));
  });
});
