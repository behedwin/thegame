import { describe, expect, it } from 'vitest';
import { createInitialState, setSettings } from '../src/core';
import { deserialize, migrate, SAVE_VERSION, serialize } from '../src/save/format';
import { masterGain, BACKGROUND_DUCK, sfx } from '../src/ui/feedback';
import { T } from '../src/content/texts';

describe('011 sound polish: volume setting', () => {
  it('defaults to a volume between 0 and 1', () => {
    const v = createInitialState(0).settings.volume;
    expect(v).toBeGreaterThan(0);
    expect(v).toBeLessThanOrEqual(1);
  });

  it('round-trips the volume through the save', () => {
    const s = setSettings(createInitialState(0), { volume: 0.35 });
    expect(deserialize(serialize(s), 0).settings.volume).toBe(0.35);
  });

  it('bumps the save version and migrates v2 saves to the default volume', () => {
    expect(SAVE_VERSION).toBe(3);
    const d = createInitialState(0).settings.volume;
    expect(migrate({ version: 2, settings: { sound: false, vibration: true } })).toEqual({
      version: 3,
      settings: { sound: false, vibration: true, volume: d },
    });
    expect(migrate({ version: 2 })).toMatchObject({ version: 3, settings: { volume: d } });
    const old = deserialize(JSON.stringify({ version: 2, settings: { sound: false, vibration: false } }), 0);
    expect(old.settings).toEqual({ sound: false, vibration: false, volume: d });
  });

  it('v1 saves migrate all the way', () => {
    expect(deserialize(JSON.stringify({ version: 1, kp: '1' }), 0).settings.volume).toBe(
      createInitialState(0).settings.volume,
    );
  });

  it('clamps or replaces invalid volumes', () => {
    const load = (volume: unknown) =>
      deserialize(JSON.stringify({ version: 3, settings: { volume } }), 0).settings.volume;
    expect(load(2)).toBe(1);
    expect(load(-1)).toBe(0);
    expect(load('loud')).toBe(createInitialState(0).settings.volume);
    expect(load(null)).toBe(createInitialState(0).settings.volume);
  });
});

describe('011 sound polish: gain', () => {
  it('is silent when sound is off or volume is 0', () => {
    expect(masterGain(false, 1, false)).toBe(0);
    expect(masterGain(true, 0, false)).toBe(0);
  });

  it('follows the volume in the foreground', () => {
    expect(masterGain(true, 0.5, false)).toBeCloseTo(0.5);
    expect(masterGain(true, 1, false)).toBeCloseTo(1);
  });

  it('ducks the sound in the background', () => {
    expect(BACKGROUND_DUCK).toBeGreaterThan(0);
    expect(BACKGROUND_DUCK).toBeLessThan(0.5);
    expect(masterGain(true, 1, true)).toBeCloseTo(BACKGROUND_DUCK);
  });

  it('clamps out-of-range volumes', () => {
    expect(masterGain(true, 5, false)).toBe(1);
    expect(masterGain(true, Number.NaN, false)).toBe(0);
  });

  it('has distinct sounds for milestones, customers and events', () => {
    for (const k of ['milestone', 'customer', 'event', 'fanfare', 'buy', 'click'] as const) {
      expect(typeof sfx[k]).toBe('function');
    }
  });

  it('has a Swedish label for the volume slider', () => {
    expect(T.settings.volume).toMatch(/volym/i);
  });
});
