import { describe, expect, it } from 'vitest';
import { AUTOMATIONS } from '../src/content/registry';
import { BALANCE } from '../src/content/balance';
import { EVENTS } from '../src/content/registry';
import {
  applyOffline,
  automationKps,
  buy,
  buyMerit,
  canBuy,
  canPrestige,
  claimEvent,
  click,
  costOf,
  createInitialState,
  customersSigned,
  Decimal,
  isRevealed,
  kpPerClick,
  kpPerSecond,
  milestonesReached,
  mulberry32,
  nextMilestone,
  offlineCapMs,
  pendingMerits,
  prestige,
  rollEvent,
  runKpForMerits,
  spawnEvent,
  tick,
  type GameState,
} from '../src/core';

const withKp = (s: GameState, kp: number | string): GameState => ({ ...s, kp: new Decimal(kp) });
const fresh = () => createInitialState(1_000_000);

describe('click', () => {
  it('gives base KP per click and counts clicks', () => {
    const s = click(fresh(), 3);
    expect(s.kp.toNumber()).toBe(3 * BALANCE.baseClick);
    expect(s.runEarned.toNumber()).toBe(3);
    expect(s.totalEarned.toNumber()).toBe(3);
    expect(s.clicks).toBe(3);
  });

  it('does not mutate the input state', () => {
    const s = fresh();
    click(s);
    expect(s.kp.toNumber()).toBe(0);
  });

  it('applies clickAdd, clickMult and kps share upgrades', () => {
    let s = withKp(fresh(), 1e9);
    s = buy(s, 'coffee'); // +1
    expect(kpPerClick(s).toNumber()).toBe(2);
    s = buy(s, 'fika'); // x2
    expect(kpPerClick(s).toNumber()).toBe(4);
    s = { ...s, automations: { api: 10 } };
    s = buy(s, 'board'); // + 3% of KP/s
    expect(kpPerClick(s).toNumber()).toBeCloseTo(4 + kpPerSecond(s).toNumber() * 0.03, 6);
  });
});

describe('buy', () => {
  it('deducts cost and adds an automation', () => {
    const s = buy(withKp(fresh(), 100), 'csv');
    expect(s.automations.csv).toBe(1);
    expect(s.kp.toNumber()).toBe(100 - 15);
  });

  it('is a no-op when unaffordable or unknown', () => {
    const s = withKp(fresh(), 5);
    expect(buy(s, 'csv')).toBe(s);
    expect(buy(s, 'does-not-exist')).toBe(s);
  });

  it('scales automation cost by growth factor', () => {
    const s = { ...fresh(), automations: { csv: 10 } };
    expect(costOf(s, 'csv').toNumber()).toBe(Math.ceil(15 * Math.pow(BALANCE.automationCostGrowth, 10)));
  });

  it('respects upgrade maxLevel', () => {
    let s = withKp(fresh(), '1e30');
    for (let i = 0; i < 20; i++) s = buy(s, 'fika');
    expect(s.upgrades.fika).toBe(4);
    expect(canBuy(s, 'fika')).toBe(false);
  });
});

describe('production and milestones', () => {
  it('computes milestones', () => {
    expect(milestonesReached(24)).toBe(0);
    expect(milestonesReached(25)).toBe(1);
    expect(milestonesReached(250)).toBe(4);
    expect(nextMilestone(30)).toBe(50);
    expect(nextMilestone(300)).toBeNull();
  });

  it('doubles automation output at 25 owned', () => {
    const csv = AUTOMATIONS[0]!;
    const at24 = automationKps({ ...fresh(), automations: { csv: 24 } }, csv).toNumber();
    const at25 = automationKps({ ...fresh(), automations: { csv: 25 } }, csv).toNumber();
    expect(at25 / 25).toBeCloseTo((at24 / 24) * 2, 9);
  });

  it('tick adds kps * dt', () => {
    const s = { ...fresh(), automations: { nightly: 2 } };
    const next = tick(s, 2_000);
    expect(next.kp.toNumber()).toBeCloseTo(2 * 3 * 2, 9);
    expect(next.timeMs).toBe(2_000);
  });

  it('tick ignores invalid dt', () => {
    const s = { ...fresh(), automations: { csv: 1 } };
    expect(tick(s, -5)).toBe(s);
    expect(tick(s, Number.NaN)).toBe(s);
  });

  it('reveals items progressively', () => {
    expect(isRevealed(fresh(), 'csv')).toBe(false);
    expect(isRevealed({ ...fresh(), runEarned: new Decimal(10) }, 'csv')).toBe(true);
  });

  it('signs customers as KP is earned', () => {
    expect(customersSigned(fresh())).toBe(0);
    expect(customersSigned({ ...fresh(), runEarned: new Decimal(1_000) })).toBe(2);
  });
});

describe('offline', () => {
  it('credits base production for time away', () => {
    const s = { ...fresh(), automations: { nightly: 1 } };
    const { state, earned, creditedMs } = applyOffline(s, s.lastSeenMs + 60_000);
    expect(creditedMs).toBe(60_000);
    expect(earned.toNumber()).toBeCloseTo(3 * 60, 6);
    expect(state.kp.toNumber()).toBeCloseTo(180, 6);
    expect(state.lastSeenMs).toBe(s.lastSeenMs + 60_000);
  });

  it('caps at 8 hours by default', () => {
    const s = { ...fresh(), automations: { nightly: 1 } };
    const { creditedMs, awayMs } = applyOffline(s, s.lastSeenMs + 48 * 3_600_000);
    expect(creditedMs).toBe(8 * 3_600_000);
    expect(awayMs).toBe(48 * 3_600_000);
  });

  it('merit upgrade raises the cap', () => {
    const s = { ...fresh(), meritUpgrades: { summer: 2 } };
    expect(offlineCapMs(s)).toBe(12 * 3_600_000);
  });

  it('gives nothing for a negative delta (clock cheat) and resets lastSeen', () => {
    const s = { ...fresh(), automations: { api: 50 } };
    const { state, earned } = applyOffline(s, s.lastSeenMs - 3_600_000);
    expect(earned.toNumber()).toBe(0);
    expect(state.kp.toNumber()).toBe(0);
    expect(state.lastSeenMs).toBe(s.lastSeenMs - 3_600_000);
  });

  it('does not apply event buffs offline', () => {
    let s: GameState = { ...fresh(), automations: { nightly: 1 } };
    s = claimEvent(spawnEvent(s, EVENTS[0]!)).state;
    const { earned } = applyOffline(s, s.lastSeenMs + 10_000);
    expect(earned.toNumber()).toBeCloseTo(30, 6);
  });
});

describe('prestige', () => {
  it('is unavailable without enough KP this year', () => {
    const s = fresh();
    expect(canPrestige(s)).toBe(false);
    expect(prestige(s)).toBe(s);
  });

  it('converts run KP to merits with a square root', () => {
    const s = { ...fresh(), runEarned: runKpForMerits(9) };
    expect(pendingMerits(s).toNumber()).toBe(9);
  });

  it('resets the run but keeps merits, totals and settings', () => {
    let s: GameState = {
      ...fresh(),
      kp: new Decimal(123),
      runEarned: runKpForMerits(4),
      totalEarned: runKpForMerits(10),
      automations: { csv: 40, api: 3 },
      upgrades: { coffee: 3 },
      settings: { sound: false, vibration: true },
    };
    s = prestige(s);
    expect(s.merits.toNumber()).toBe(4);
    expect(s.meritsEarned.toNumber()).toBe(4);
    expect(s.kp.toNumber()).toBe(0);
    expect(s.runEarned.toNumber()).toBe(0);
    expect(s.automations).toEqual({});
    expect(s.upgrades).toEqual({});
    expect(s.totalEarned.eq(runKpForMerits(10))).toBe(true);
    expect(s.prestiges).toBe(1);
    expect(s.settings.sound).toBe(false);
  });

  it('merit upgrades boost production and grant starting automations', () => {
    let s: GameState = { ...fresh(), merits: new Decimal(10) };
    s = buyMerit(s, 'reputation');
    expect(s.merits.toNumber()).toBe(9);
    s = { ...s, automations: { nightly: 1 } };
    expect(kpPerSecond(s).toNumber()).toBeCloseTo(4.5, 9);
    s = buyMerit({ ...s, merits: new Decimal(10) }, 'templates');
    s = prestige({ ...s, runEarned: runKpForMerits(1) });
    expect(s.automations.csv).toBe(5);
  });
});

describe('events', () => {
  it('rollEvent is deterministic with an injected rng', () => {
    const s = fresh();
    const always = () => 0;
    const never = () => 0.999;
    expect(rollEvent(s, always)?.id).toBe(EVENTS[0]!.id);
    expect(rollEvent(s, never)).toBeNull();
  });

  it('does not roll while an event is active or on cooldown', () => {
    const s = spawnEvent(fresh(), EVENTS[0]!);
    expect(rollEvent(s, () => 0)).toBeNull();
    const cooled = { ...fresh(), nextEventAtMs: 10_000 };
    expect(rollEvent(cooled, () => 0)).toBeNull();
  });

  it('spawn rate over many rolls is near the configured chance', () => {
    const rng = mulberry32(42);
    let hits = 0;
    for (let i = 0; i < 30_000; i++) if (rollEvent(fresh(), rng)) hits++;
    expect(hits / 30_000).toBeGreaterThan(BALANCE.events.chancePerRoll * 0.7);
    expect(hits / 30_000).toBeLessThan(BALANCE.events.chancePerRoll * 1.3);
  });

  it('claiming applies a timed production buff', () => {
    let s: GameState = { ...fresh(), automations: { nightly: 1 } };
    const passwords = EVENTS.find((e) => e.id === 'passwords')!;
    s = spawnEvent(s, passwords);
    const { state, event } = claimEvent(s);
    expect(event?.id).toBe('passwords');
    expect(state.activeEvent).toBeNull();
    expect(state.eventsClaimed).toBe(1);
    expect(kpPerSecond(state).toNumber()).toBeCloseTo(9, 9);
    const later = tick(state, 31_000);
    expect(later.buffs).toHaveLength(0);
    expect(kpPerSecond(later).toNumber()).toBeCloseTo(3, 9);
  });

  it('events expire if ignored and start the cooldown', () => {
    const s = spawnEvent(fresh(), EVENTS[0]!);
    const later = tick(s, BALANCE.events.visibleMs + 1);
    expect(later.activeEvent).toBeNull();
    expect(later.nextEventAtMs).toBeGreaterThan(later.timeMs);
    expect(claimEvent(later).event).toBeNull();
  });
});

describe('determinism', () => {
  it('same seed and inputs give identical results', () => {
    const run = () => {
      const rng = mulberry32(7);
      let s = createInitialState(0);
      for (let t = 0; t < 600; t++) {
        s = tick(click(s, 4), 1000);
        const ev = rollEvent(s, rng);
        if (ev) s = claimEvent(spawnEvent(s, ev)).state;
        for (const id of ['coffee', 'csv', 'nightly']) s = buy(s, id);
      }
      return s.kp.toString() + JSON.stringify(s.automations);
    };
    expect(run()).toBe(run());
  });
});
