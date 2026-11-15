// Task 012: Prestige 2.0 — preview and new merit bonuses.
import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { AUTOMATIONS, EVENTS, MERITS, UPGRADES } from '../src/content/registry';
import { T } from '../src/content/texts';
import {
  applyOffline,
  automationCostFactor,
  claimEvent,
  costOf,
  createInitialState,
  Decimal,
  eventCooldownMs,
  MAX_EVENT_COOLDOWN_CUT_PCT,
  meritProdMult,
  nextYearSpeedupPct,
  offlineEfficiency,
  runKpForMerits,
  spawnEvent,
  tick,
  type GameState,
} from '../src/core';
import { buyMany, costOfMany } from '../src/core/bulk';

const fresh = () => createInitialState(0);
const withMerit = (s: GameState, id: string, lvl: number): GameState => ({
  ...s,
  meritUpgrades: { ...s.meritUpgrades, [id]: lvl },
});
const kinds = new Set(MERITS.map((m) => m.effect.kind));
const meritOf = (kind: string) => MERITS.find((m) => m.effect.kind === kind)!;

describe('new merit content', () => {
  it('has a merit for each new effect kind', () => {
    for (const k of ['autoDiscountPct', 'eventCooldownPct', 'offlineEffPct']) expect(kinds.has(k as never), k).toBe(true);
  });
  it('max levels stay within sane caps', () => {
    for (const m of MERITS) {
      const e = m.effect;
      if (e.kind === 'autoDiscountPct') expect(Math.pow(1 - e.pct / 100, m.maxLevel)).toBeGreaterThan(0.2);
      if (e.kind === 'eventCooldownPct') expect(e.pct * m.maxLevel).toBeLessThanOrEqual(MAX_EVENT_COOLDOWN_CUT_PCT);
    }
  });
});

describe('automation discount (Ramavtal)', () => {
  const m = meritOf('autoDiscountPct');
  const pct = (m.effect as { pct: number }).pct;
  const auto = AUTOMATIONS.filter((a) => a.unlockYear === undefined).at(-1)!; // always unlocked (051)

  it('is 1 without the merit', () => {
    expect(automationCostFactor(fresh())).toBe(1);
  });
  it('reduces costOf multiplicatively per level', () => {
    const s = withMerit(fresh(), m.id, 2);
    expect(automationCostFactor(s)).toBeCloseTo(Math.pow(1 - pct / 100, 2), 10);
    expect(costOf(s, auto.id).toNumber()).toBe(Math.ceil(auto.baseCost * Math.pow(1 - pct / 100, 2)));
    expect(costOf(s, auto.id).lt(costOf(fresh(), auto.id))).toBe(true);
  });
  it('bulk cost matches costOf for one unit and buyMany charges the discounted price', () => {
    const s0 = withMerit(fresh(), m.id, 3);
    const s = { ...s0, kp: new Decimal(1e12), automations: { [auto.id]: 7 } };
    expect(costOfMany(s, auto.id, 1).eq(costOf(s, auto.id))).toBe(true);
    const exact = { ...s, kp: costOf(s, auto.id) };
    const after = buyMany(exact, auto.id, 1);
    expect(after.automations[auto.id]).toBe(8);
    expect(after.kp.eq(0)).toBe(true);
    expect(costOfMany(s, auto.id, 10).lt(costOfMany({ ...s, meritUpgrades: {} }, auto.id, 10))).toBe(true);
  });
  it('does not touch upgrade prices', () => {
    const s = withMerit(fresh(), m.id, 5);
    for (const u of UPGRADES) expect(costOf(s, u.id).eq(costOf(fresh(), u.id)), u.id).toBe(true);
  });
});

describe('event cooldown (Nätverkskontakter)', () => {
  const m = meritOf('eventCooldownPct');
  const pct = (m.effect as { pct: number }).pct;

  it('defaults to the balance cooldown', () => {
    expect(eventCooldownMs(fresh())).toBe(BALANCE.events.cooldownMs);
  });
  it('shortens the cooldown per level and is capped', () => {
    expect(eventCooldownMs(withMerit(fresh(), m.id, 2))).toBeCloseTo(BALANCE.events.cooldownMs * (1 - (2 * pct) / 100));
    expect(eventCooldownMs(withMerit(fresh(), m.id, 1000))).toBeCloseTo(
      BALANCE.events.cooldownMs * (1 - MAX_EVENT_COOLDOWN_CUT_PCT / 100),
    );
  });
  it('is used when an event is claimed and when it expires', () => {
    const s = withMerit({ ...fresh(), timeMs: 10_000, nextEventAtMs: 0 }, m.id, 3);
    const spawned = spawnEvent(s, EVENTS[0]!);
    expect(claimEvent(spawned).state.nextEventAtMs).toBe(10_000 + eventCooldownMs(s));
    const expired = tick(spawned, BALANCE.events.visibleMs);
    expect(expired.activeEvent).toBeNull();
    expect(expired.nextEventAtMs).toBe(10_000 + BALANCE.events.visibleMs + eventCooldownMs(s));
  });
});

describe('offline efficiency (Nattkörningar)', () => {
  const m = meritOf('offlineEffPct');
  const pct = (m.effect as { pct: number }).pct;
  const producing = (): GameState => ({ ...fresh(), automations: { [AUTOMATIONS[0]!.id]: 10 } });

  it('defaults to the balance efficiency', () => {
    expect(offlineEfficiency(fresh())).toBe(BALANCE.offline.efficiency);
  });
  it('raises offline earnings per level', () => {
    const base = applyOffline(producing(), 3_600_000).earned;
    const boosted = applyOffline(withMerit(producing(), m.id, 2), 3_600_000).earned;
    expect(boosted.div(base).toNumber()).toBeCloseTo(1 + (2 * pct) / 100, 6);
  });
});

describe('next-year preview', () => {
  it('is 0 when no Meriter are pending', () => {
    expect(nextYearSpeedupPct(fresh())).toBe(0);
  });
  it('estimates the production gain from spending pending Meriter', () => {
    const s = { ...fresh(), runEarned: runKpForMerits(10) };
    const pct = nextYearSpeedupPct(s);
    expect(pct).toBeGreaterThan(0);
    // 10 Meriter buy at least one level of a +50 % production merit.
    expect(pct).toBeGreaterThanOrEqual(50);
  });
  it('is relative to the current production merits and grows with pending Meriter', () => {
    const small = { ...fresh(), runEarned: runKpForMerits(4) };
    const big = { ...fresh(), runEarned: runKpForMerits(400) };
    expect(nextYearSpeedupPct(big)).toBeGreaterThan(nextYearSpeedupPct(small));
    const veteran = withMerit(small, 'reputation', 10);
    expect(meritProdMult(veteran)).toBeGreaterThan(1);
    expect(nextYearSpeedupPct(veteran)).toBeLessThan(nextYearSpeedupPct(small));
  });
  it('does not mutate the input and is finite for huge runs', () => {
    const s = { ...fresh(), runEarned: new Decimal('1e300') };
    const before = JSON.stringify({ m: s.merits.toString(), u: s.meritUpgrades });
    const pct = nextYearSpeedupPct(s);
    expect(Number.isFinite(pct)).toBe(true);
    expect(JSON.stringify({ m: s.merits.toString(), u: s.meritUpgrades })).toBe(before);
  });
  it('has a Swedish preview text', () => {
    expect(T.prestige.preview('42')).toBe('Nästa läsår går ~42 % snabbare');
  });
});
