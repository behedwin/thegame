import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState, Decimal } from '../src/core/state';
import { deserialize, migrate, MIGRATIONS, SAVE_VERSION, serialize } from '../src/save/format';
import { fmt, setNotation } from '../src/ui/format';

const S = '\u00a0';

afterEach(() => setNotation('short'));

describe('fmt notation', () => {
  it('defaults to Swedish abbreviations', () => {
    expect(fmt(1_230_000)).toBe(`1,23${S}M`);
    expect(fmt(4.56e9)).toBe(`4,56${S}md`);
  });

  it('shows scientific notation from one million when chosen', () => {
    expect(fmt(1_230_000, 'sci')).toBe('1,23e6');
    expect(fmt(1e6, 'sci')).toBe('1e6');
    expect(fmt(4.56e9, 'sci')).toBe('4,56e9');
    expect(fmt(new Decimal('7.89e420'), 'sci')).toBe('7,89e420');
    expect(fmt(-2.5e7, 'sci')).toBe('-2,5e7');
  });

  it('formats numbers below one million the same in both modes', () => {
    for (const n of [0, 0.4, 12.36, 999, 1234, 999_999.9, -42]) expect(fmt(n, 'sci')).toBe(fmt(n, 'short'));
  });

  it('uses the module-wide notation set by the UI', () => {
    setNotation('sci');
    expect(fmt(1_230_000)).toBe('1,23e6');
    setNotation('short');
    expect(fmt(1_230_000)).toBe(`1,23${S}M`);
  });

  it('keeps large exponents in both modes', () => {
    expect(fmt(new Decimal('4.5e42'), 'short')).toBe('4,5e42');
    expect(fmt(new Decimal('4.5e42'), 'sci')).toBe('4,5e42');
  });
});

describe('notation setting', () => {
  it('is short by default', () => {
    expect(createInitialState(0).settings.notation).toBe('short');
  });

  it('migration adds the default notation', () => {
    const v7 = { version: 7, settings: { sound: true } };
    const out = MIGRATIONS[7]!(v7);
    expect(out.version).toBe(8);
    expect((out.settings as Record<string, unknown>).notation).toBe('short');
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(8);
    expect(migrate({ version: 1 }).version).toBe(SAVE_VERSION);
  });

  it('loads old saves with the default and round-trips the choice', () => {
    const old = JSON.parse(serialize(createInitialState(0)));
    delete old.settings.notation;
    old.version = 7;
    expect(deserialize(JSON.stringify(old), 0).settings.notation).toBe('short');
    const s = createInitialState(0);
    const sci = { ...s, settings: { ...s.settings, notation: 'sci' as const } };
    expect(deserialize(serialize(sci), 0).settings.notation).toBe('sci');
    const bad = JSON.parse(serialize(s));
    bad.settings.notation = 'roman';
    expect(deserialize(JSON.stringify(bad), 0).settings.notation).toBe('short');
  });
});
