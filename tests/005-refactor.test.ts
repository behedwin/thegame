// Task 005: test hardening for core, bulk, save and content (no behaviour change).
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, CUSTOMERS, EVENTS, MERITS, UPGRADES } from '../src/content/registry';
import { BALANCE } from '../src/content/balance';
import {
  applyOffline,
  baseKps,
  buy,
  buyMerit,
  canBuyMerit,
  claimEvent,
  click,
  costOf,
  createInitialState,
  Decimal,
  getEvent,
  meritCost,
  prestige,
  spawnEvent,
  tick,
  touch,
  setSettings,
  type GameState,
} from '../src/core';
import { buyMany, costOfMany, maxAffordable } from '../src/core/bulk';
import { deserialize, serialize } from '../src/save/format';

const fresh = () => createInitialState(1_000_000);
const rich = (): GameState => ({ ...fresh(), kp: new Decimal('1e30'), merits: new Decimal('1e12') });
const ALL_BUYABLE = [...AUTOMATIONS.map((a) => a.id), ...UPGRADES.map((u) => u.id)];

/** Deep snapshot that also captures Decimal values, to detect mutation. */
const snap = (s: GameState) => serialize(s);

describe('purity: no transition mutates its input', () => {
  it('holds for every action', () => {
    let s = rich();
    s = buy(s, 'csv');
    s = spawnEvent(s, EVENTS[0]!);
    s = { ...s, runEarned: new Decimal('1e20'), buffs: [{ source: 'x', kind: 'prodMult', mult: 2, untilMs: 5_000 }] };
    const before = snap(s);
    tick(s, 1_000);
    click(s, 3);
    buy(s, 'coffee');
    buyMany(s, 'csv', 5);
    buyMerit(s, MERITS[0]!.id);
    prestige(s);
    claimEvent(s);
    applyOffline(s, s.lastSeenMs + 60_000);
    touch(s, 42);
    setSettings(s, { sound: false });
    expect(snap(s)).toBe(before);
  });
});

describe('buy and buyMany agree', () => {
  it('buy(id) equals buyMany(id, 1) for every item at several owned counts', () => {
    for (const id of ALL_BUYABLE) {
      let s = rich();
      for (let i = 0; i < 3; i++) {
        expect(costOfMany(s, id, 1).eq(costOf(s, id)), id).toBe(true);
        const a = buy(s, id);
        const b = buyMany(s, id, 1);
        expect(snap(b), id).toBe(snap(a));
        s = a;
      }
    }
  });

  it('buy is a no-op at max level and buyMany refuses to exceed it', () => {
    const up = UPGRADES[0]!;
    const s: GameState = { ...rich(), upgrades: { [up.id]: up.maxLevel } };
    expect(buy(s, up.id)).toBe(s);
    expect(buyMany(s, up.id, 1)).toBe(s);
    expect(maxAffordable(s, up.id)).toBe(0);
  });

  it('costOf throws for unknown ids', () => {
    expect(() => costOf(fresh(), 'nope')).toThrow();
    expect(() => costOfMany(fresh(), 'nope', 2)).toThrow();
  });
});

describe('merits', () => {
  it('buyMerit spends merits and respects maxLevel', () => {
    const m = MERITS[0]!;
    let s = rich();
    const cost = meritCost(s, m.id);
    s = buyMerit(s, m.id);
    expect(s.meritUpgrades[m.id]).toBe(1);
    expect(s.merits.eq(new Decimal('1e12').sub(cost))).toBe(true);
    const maxed: GameState = { ...rich(), meritUpgrades: { [m.id]: m.maxLevel } };
    expect(canBuyMerit(maxed, m.id)).toBe(false);
    expect(buyMerit(maxed, m.id)).toBe(maxed);
    expect(canBuyMerit(rich(), 'nope')).toBe(false);
  });

  it('meritCost grows with level', () => {
    for (const m of MERITS) {
      const a = meritCost(fresh(), m.id);
      const b = meritCost({ ...fresh(), meritUpgrades: { [m.id]: 1 } }, m.id);
      expect(b.gte(a), m.id).toBe(true);
    }
  });
});

describe('events', () => {
  it('getEvent finds every event and returns undefined for unknown ids', () => {
    for (const e of EVENTS) expect(getEvent(e.id)).toBe(e);
    expect(getEvent('nope')).toBeUndefined();
  });

  it('a lump claim credits kp, runEarned and totalEarned equally', () => {
    const lump = EVENTS.find((e) => e.effect.kind === 'lump')!;
    let s: GameState = { ...fresh(), automations: { csv: 10 } };
    s = spawnEvent(s, lump);
    const r = claimEvent(s);
    expect(r.event).toBe(lump);
    expect(r.granted.gt(0)).toBe(true);
    expect(r.state.kp.eq(s.kp.add(r.granted))).toBe(true);
    expect(r.state.runEarned.eq(s.runEarned.add(r.granted))).toBe(true);
    expect(r.state.totalEarned.eq(s.totalEarned.add(r.granted))).toBe(true);
    expect(r.state.eventsClaimed).toBe(1);
    expect(r.state.activeEvent).toBeNull();
    expect(r.state.nextEventAtMs).toBe(s.timeMs + BALANCE.events.cooldownMs);
  });

  it('a lump claim is at least minKp and scales with base production', () => {
    const lump = EVENTS.find((e) => e.effect.kind === 'lump')!;
    if (lump.effect.kind !== 'lump') throw new Error('unreachable');
    expect(claimEvent(spawnEvent(fresh(), lump)).granted.eq(lump.effect.minKp)).toBe(true);
    const big: GameState = { ...fresh(), automations: { [AUTOMATIONS.filter((a) => a.unlockYear === undefined).at(-1)!.id]: 100 } };
    const expected = Decimal.max(baseKps(big).mul(lump.effect.seconds), lump.effect.minKp);
    expect(claimEvent(spawnEvent(big, lump)).granted.eq(expected)).toBe(true);
  });

  it('claiming the same buff event twice refreshes instead of stacking', () => {
    const buffEvent = EVENTS.find((e) => e.effect.kind !== 'lump')!;
    let s = claimEvent(spawnEvent(fresh(), buffEvent)).state;
    s = tick(s, 1_000);
    s = claimEvent(spawnEvent(s, buffEvent)).state;
    expect(s.buffs.filter((b) => b.source === buffEvent.id)).toHaveLength(1);
  });

  it('claiming an expired or missing event does nothing', () => {
    const s = fresh();
    expect(claimEvent(s).state).toBe(s);
    const spawned = spawnEvent(s, EVENTS[0]!);
    const late: GameState = { ...spawned, timeMs: spawned.activeEvent!.expiresAtMs };
    expect(claimEvent(late).event).toBeNull();
    const unknown: GameState = { ...s, activeEvent: { id: 'nope', expiresAtMs: 1e9 } };
    expect(claimEvent(unknown).state).toBe(unknown);
  });
});

describe('tick', () => {
  it('drops expired buffs and credits earnings to all three counters', () => {
    let s: GameState = { ...fresh(), automations: { csv: 1 }, buffs: [{ source: 'x', kind: 'prodMult', mult: 2, untilMs: 500 }] };
    s = tick(s, 1_000);
    expect(s.buffs).toHaveLength(0);
    expect(s.kp.gt(0)).toBe(true);
    expect(s.kp.eq(s.runEarned)).toBe(true);
    expect(s.kp.eq(s.totalEarned)).toBe(true);
    expect(s.timeMs).toBe(1_000);
  });
});

describe('prestige', () => {
  it('keeps event bookkeeping and game time but clears buffs and the active event', () => {
    let s: GameState = { ...rich(), runEarned: new Decimal('1e20'), timeMs: 123_456, eventsClaimed: 7 };
    s = spawnEvent(s, EVENTS[0]!);
    s = { ...s, buffs: [{ source: 'x', kind: 'clickMult', mult: 3, untilMs: 1e9 }] };
    const p = prestige(s);
    expect(p.timeMs).toBe(123_456);
    expect(p.eventsClaimed).toBe(7);
    expect(p.buffs).toEqual([]);
    expect(p.activeEvent).toBeNull();
    expect(p.kp.eq(0)).toBe(true);
    expect(p.runEarned.eq(0)).toBe(true);
    expect(p.upgrades).toEqual({});
  });
});

describe('save', () => {
  it('round-trips states produced by random play', () => {
    let s = fresh();
    for (let i = 0; i < 200; i++) {
      s = click(s, 5);
      s = tick(s, 2_000);
      for (const id of ALL_BUYABLE) s = buy(s, id);
    }
    const back = deserialize(serialize(s), 0);
    expect(serialize(back)).toBe(serialize(s));
  });

  it('drops malformed buffs, levels and negative or non-finite numbers', () => {
    const text = JSON.stringify({
      version: 1,
      kp: '-5',
      runEarned: 'abc',
      merits: {},
      upgrades: { coffee: 1.5, fika: -1, sso: '2', logs: 3 },
      buffs: [
        { source: 'a', kind: 'prodMult', mult: 2, untilMs: 10 },
        { source: 'b', kind: 'evil', mult: 2, untilMs: 10 },
        { kind: 'clickMult' },
        null,
        { source: 'c', kind: 'clickMult', mult: 'x', untilMs: null },
      ],
      activeEvent: { id: 5, expiresAtMs: 1 },
      timeMs: Infinity,
      prestiges: 'many',
    });
    const s = deserialize(text, 77);
    expect(s.kp.eq(0)).toBe(true);
    expect(s.runEarned.eq(0)).toBe(true);
    expect(s.merits.eq(0)).toBe(true);
    expect(s.upgrades).toEqual({ logs: 3 });
    expect(s.buffs).toEqual([
      { source: 'a', kind: 'prodMult', mult: 2, untilMs: 10 },
      { source: 'c', kind: 'clickMult', mult: 1, untilMs: 0 },
    ]);
    expect(s.activeEvent).toBeNull();
    expect(s.timeMs).toBe(0);
    expect(s.prestiges).toBe(0);
    expect(s.lastSeenMs).toBe(77);
  });
});

describe('content', () => {
  it('customer thresholds are positive, finite and strictly increasing', () => {
    let prev = 0;
    for (const c of CUSTOMERS) {
      expect(Number.isFinite(c.atRunKp), c.id).toBe(true);
      expect(c.atRunKp, c.id).toBeGreaterThan(prev);
      prev = c.atRunKp;
    }
  });

  it('customer effects are positive bonuses', () => {
    for (const c of CUSTOMERS) {
      const e = c.effect;
      if (e.kind === 'prodMult') expect(e.mult, c.id).toBeGreaterThan(1);
      else expect(e.pct, c.id).toBeGreaterThan(0);
    }
  });

  it('events have positive weights and sane effects', () => {
    for (const e of EVENTS) {
      expect(e.weight, e.id).toBeGreaterThan(0);
      const f = e.effect;
      if (f.kind === 'lump') {
        expect(f.seconds, e.id).toBeGreaterThan(0);
        expect(f.minKp, e.id).toBeGreaterThanOrEqual(0);
      } else {
        expect(f.mult, e.id).toBeGreaterThan(1);
        expect(f.durationMs, e.id).toBeGreaterThan(0);
      }
    }
  });

  it('cost growth is above 1 and max levels are positive integers', () => {
    expect(BALANCE.automationCostGrowth).toBeGreaterThan(1);
    for (const u of UPGRADES) {
      expect(u.costGrowth, u.id).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(u.maxLevel) && u.maxLevel > 0, u.id).toBe(true);
    }
    for (const m of MERITS) expect(Number.isInteger(m.maxLevel) && m.maxLevel > 0, m.id).toBe(true);
  });
});
