import { describe, expect, it } from 'vitest';
import { bestYearEarned, createInitialState, Decimal, prestige, type GameState } from '../src/core';
import { deserialize, serialize } from '../src/save/format';
import { statRows } from '../src/ui/stats';
import { T } from '../src/content/texts';

/** A state where every field differs from a fresh game, so a prestige that forgets a field shows up. */
function veteran(): GameState {
  return {
    ...createInitialState(5_000),
    kp: new Decimal(3e9),
    runEarned: new Decimal(4e9),
    totalEarned: new Decimal(9e9),
    merits: new Decimal(12),
    meritsEarned: new Decimal(30),
    bestRunEarned: new Decimal(1e9),
    purchases: 77,
    upgrades: { coffee: 2 },
    automations: { csv: 40 },
    meritUpgrades: { templates: 1, reputation: 2 },
    prestiges: 3,
    clicks: 500,
    timeMs: 7_200_000,
    activeEvent: { id: 'x', expiresAtMs: 7_300_000 },
    nextEventAtMs: 7_250_000,
    buffs: [{ source: 'x', kind: 'prodMult', mult: 2, untilMs: 7_300_000 }],
    eventsClaimed: 9,
    achievements: ['first-sync'],
    inbox: ['csv-semicolon'],
    nextTicketAtMs: 7_400_000,
    ticketsAnswered: 4,
    tipsSeen: ['sync'],
    settings: { sound: false, vibration: false, volume: 0.3, notifyOfflineCap: true, notifySeason: true, tips: false, notation: 'short' },
    calendar: { month: 6, day: 10 },
  };
}

const json = (v: unknown) => JSON.stringify(v, (_k, x: unknown) => (x instanceof Decimal ? `D:${x.toString()}` : x));

describe('040 refactor: prestige keeps exactly the lifetime fields', () => {
  it('changes only the run fields and the prestige counters', () => {
    const before = veteran();
    const after = prestige(before);
    const changed = (Object.keys(before) as (keyof GameState)[]).filter((k) => json(before[k]) !== json(after[k])).sort();
    expect(changed).toEqual(
      ['activeEvent', 'automations', 'bestRunEarned', 'buffs', 'kp', 'lastYearEarned', 'merits', 'meritsEarned', 'prestiges', 'runEarned', 'tipsSeen', 'upgrades'].sort(),
    );
    expect(Object.keys(after).sort()).toEqual(Object.keys(before).sort());
  });

  it('resets the run and credits the merits', () => {
    const before = veteran();
    const after = prestige(before);
    expect(after.kp.eq(0) && after.runEarned.eq(0)).toBe(true);
    expect(after.upgrades).toEqual({});
    expect(after.automations).toEqual({ csv: 5 }); // from the templates merit
    expect(after.activeEvent).toBeNull();
    expect(after.buffs).toEqual([]);
    expect(after.prestiges).toBe(4);
    expect(after.merits.gt(before.merits)).toBe(true);
    expect(after.merits.sub(before.merits).eq(after.meritsEarned.sub(before.meritsEarned))).toBe(true);
    expect(after.lastSeenMs).toBe(before.lastSeenMs);
  });

  it('turns a missing calendar into null and does not mutate the input', () => {
    const { calendar: _c, ...noCal } = veteran();
    const snapshot = json(noCal);
    expect(prestige(noCal).calendar).toBeNull();
    expect(json(noCal)).toBe(snapshot);
  });

  it('a prestiged state round-trips through the save format', () => {
    const after = prestige(veteran());
    const back = deserialize(serialize(after), 0);
    const { calendar: _c, ...rest } = after;
    expect(json(back)).toBe(json(rest));
  });
});

describe('040 refactor: bestYearEarned', () => {
  it('is the larger of the record and the running year', () => {
    const s = veteran();
    expect(bestYearEarned(s).eq(4e9)).toBe(true);
    expect(bestYearEarned({ ...s, bestRunEarned: new Decimal(5e9) }).eq(5e9)).toBe(true);
  });

  it('feeds both prestige and the stats page', () => {
    const s = veteran();
    expect(prestige(s).bestRunEarned.eq(bestYearEarned(s))).toBe(true);
    const row = statRows(s).find((r) => r.label === T.stats.bestYear);
    expect(row?.value).toContain(T.currency);
  });
});

describe('040 refactor: save format covers every Decimal field', () => {
  it('saves every Decimal field of the state as a string and restores it as a Decimal', () => {
    const s = veteran();
    const raw = JSON.parse(serialize(s)) as Record<string, unknown>;
    const back = deserialize(serialize(s), 0);
    const bigKeys = (Object.keys(s) as (keyof GameState)[]).filter((k) => s[k] instanceof Decimal);
    expect(bigKeys.length).toBeGreaterThanOrEqual(6);
    for (const k of bigKeys) {
      expect(typeof raw[k]).toBe('string');
      expect(back[k]).toBeInstanceOf(Decimal);
      expect((back[k] as Decimal).eq(s[k] as Decimal)).toBe(true);
    }
  });
});
