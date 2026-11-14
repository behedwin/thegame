import { describe, expect, it } from 'vitest';
import { buy, claimEvent, click, createInitialState, Decimal, setSettings, spawnEvent, type GameState } from '../src/core';
import { EVENTS } from '../src/content/registry';
import { T } from '../src/content/texts';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { markTipSeen, nextTip, settleTips, TIPS } from '../src/ui/onboarding';

const rich = (s: GameState): GameState => ({ ...s, kp: new Decimal(1e6) });

describe('onboarding tips', () => {
  it('a new player sees the SYNKA tip first, then the buy tip, then nothing', () => {
    let s = createInitialState(0);
    expect(s.settings.tips).toBe(true);
    expect(nextTip(s)).toBe('sync');
    s = settleTips(click(s), 'sync');
    expect(s.tipsSeen).toEqual(['sync']);
    expect(nextTip(s)).toBe('buy');
    s = settleTips(buy(rich(s), 'csv'), 'buy');
    expect(s.tipsSeen).toEqual(['sync', 'buy']);
    expect(nextTip(s)).toBeNull();
  });

  it('a live event takes priority and its tip ends when the event is claimed', () => {
    let s = spawnEvent(click(createInitialState(0)), EVENTS[0]!);
    expect(nextTip(s)).toBe('event');
    s = settleTips(claimEvent(s).state, 'event');
    expect(s.tipsSeen).toContain('event');
    expect(nextTip(spawnEvent(s, EVENTS[0]!))).toBe('buy');
  });

  it('a closed tip never shows again, even if its condition holds', () => {
    const s = markTipSeen(createInitialState(0), 'sync');
    expect(nextTip(s)).toBeNull();
    expect(markTipSeen(s, 'sync')).toBe(s);
  });

  it('settleTips keeps the state while the shown tip is still current', () => {
    const s = createInitialState(0);
    expect(settleTips(s, 'sync')).toBe(s);
    expect(settleTips(s, null)).toBe(s);
  });

  it('turning tips off hides them all, and they never show after the first school year', () => {
    expect(nextTip(setSettings(createInitialState(0), { tips: false }))).toBeNull();
    expect(nextTip({ ...createInitialState(0), prestiges: 1 })).toBeNull();
  });

  it('has a Swedish text for every tip and pure helpers that never mutate', () => {
    for (const t of TIPS) expect(T.tips[t.id].length).toBeGreaterThan(0);
    const s = createInitialState(0);
    const copy = JSON.stringify(s);
    markTipSeen(s, 'buy');
    settleTips(click(s), 'sync');
    expect(JSON.stringify(s)).toBe(copy);
  });
});

describe('save v5: tips', () => {
  it('round-trips tipsSeen and the tips setting', () => {
    const s = setSettings(markTipSeen(createInitialState(0), 'sync'), { tips: false });
    const back = deserialize(serialize(s), 0);
    expect(back.tipsSeen).toEqual(['sync']);
    expect(back.settings.tips).toBe(false);
  });

  it('migrates v4 saves: tips on, steps already done count as seen', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(5);
    const veteran = migrate({ version: 4, clicks: 12, automations: { csv: 2 }, eventsClaimed: 1, settings: { sound: true } }, MIGRATIONS, 5);
    expect(veteran.tipsSeen).toEqual(['sync', 'buy', 'event']);
    expect(veteran.settings).toEqual({ sound: true, tips: true });
    const fresh = migrate({ version: 4, clicks: 0, automations: {}, eventsClaimed: 0 }, MIGRATIONS, 5);
    expect(fresh.tipsSeen).toEqual([]);
  });

  it('normalises junk in tipsSeen and settings.tips', () => {
    const s = deserialize(JSON.stringify({ version: 5, tipsSeen: ['sync', 3, 'sync', null], settings: { tips: 'no' } }), 0);
    expect(s.tipsSeen).toEqual(['sync']);
    expect(s.settings.tips).toBe(true);
  });
});
