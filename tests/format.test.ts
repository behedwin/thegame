import { describe, expect, it } from 'vitest';
import { Decimal } from '../src/core';
import { fmt, fmtDuration } from '../src/ui/format';

const S = ' ';

describe('fmt', () => {
  it('formats small numbers with Swedish decimal comma', () => {
    expect(fmt(0)).toBe('0');
    expect(fmt(7)).toBe('7');
    expect(fmt(0.4)).toBe('0,4');
    expect(fmt(12.36)).toBe('12,3');
    expect(fmt(99.99)).toBe('99,9');
  });

  it('groups thousands below a million', () => {
    expect(fmt(100)).toBe('100');
    expect(fmt(1234)).toBe(`1${S}234`);
    expect(fmt(999_999.9)).toBe(`999${S}999`);
  });

  it('uses Swedish short-scale suffixes', () => {
    expect(fmt(1_200_000)).toBe(`1,20${S}M`);
    expect(fmt(12_345_678)).toBe(`12,3${S}M`);
    expect(fmt(123_456_789)).toBe(`123${S}M`);
    expect(fmt(4.5e9)).toBe(`4,50${S}md`);
    expect(fmt(1e12)).toBe(`1,00${S}bn`);
    expect(fmt(1e15)).toBe(`1,00${S}bd`);
  });

  it('falls back to scientific notation for huge numbers', () => {
    expect(fmt(new Decimal('4.56e42'))).toBe('4,56e42');
    expect(fmt(new Decimal('1e300').mul('1e300'))).toBe('1e600');
  });

  it('handles invalid numbers', () => {
    expect(fmt(Number.NaN)).toBe('–');
  });
});

describe('fmtDuration', () => {
  it('formats durations', () => {
    expect(fmtDuration(45_000)).toBe('45 s');
    expect(fmtDuration(12 * 60_000)).toBe('12 min');
    expect(fmtDuration(3 * 3_600_000 + 5 * 60_000)).toBe('3 h 5 min');
    expect(fmtDuration(8 * 3_600_000)).toBe('8 h');
    expect(fmtDuration(-5)).toBe('0 s');
  });
});
