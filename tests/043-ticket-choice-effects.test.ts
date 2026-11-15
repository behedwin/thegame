import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, TICKETS } from '../src/content/registry';
import { answerTicket, applyEffect, createInitialState, Decimal, previewEffect, type GameState } from '../src/core';
import { buffLines } from '../src/ui/hud';
import { effectLine, effectText, receiptText } from '../src/ui/inbox';

const fresh = (): GameState => createInitialState(0);
const producing = (): GameState => ({ ...fresh(), timeMs: 10_000, automations: { [AUTOMATIONS[0]!.id]: 10 } });
const lump = { kind: 'lump', seconds: 15, minKp: 10 } as const;
const prod = { kind: 'prodMult', mult: 1.5, durationMs: 30_000 } as const;
const clk = { kind: 'clickMult', mult: 2, durationMs: 30_000 } as const;

describe('previewEffect (task 043)', () => {
  it('gives the same KP as applyEffect for lumps, also when minKp applies', () => {
    for (const s of [fresh(), producing()]) {
      const p = previewEffect(s, lump);
      expect(p.kind).toBe('lump');
      expect(p.kind === 'lump' && p.kp.eq(applyEffect(s, 'x', lump).granted)).toBe(true);
    }
    const floor = previewEffect(fresh(), lump);
    expect(floor.kind === 'lump' && floor.kp.eq(10)).toBe(true);
  });

  it('gives multiplier and duration for buffs and does not mutate the state', () => {
    const s = producing();
    const before = JSON.stringify(s);
    expect(previewEffect(s, prod)).toEqual({ kind: 'prodMult', mult: 1.5, durationMs: 30_000 });
    expect(previewEffect(s, clk)).toEqual({ kind: 'clickMult', mult: 2, durationMs: 30_000 });
    previewEffect(s, lump);
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('effect texts (task 043)', () => {
  it('formats all three effect kinds', () => {
    expect(effectText({ kind: 'prodMult', mult: 1.5, durationMs: 30_000 })).toBe('Produktion ×1,5 i 30 s');
    expect(effectText({ kind: 'clickMult', mult: 2, durationMs: 25_000 })).toBe('KP/klick ×2 i 25 s');
    expect(effectText({ kind: 'lump', kp: new Decimal(1234) })).toBe('+1 234 KP');
  });

  it('shows a lump as KP now and adds an estimated value to buffs', () => {
    expect(effectLine(fresh(), lump)).toBe('+10 KP direkt');
    expect(effectLine(producing(), prod)).toMatch(/^Produktion ×1,5 i 30 s · ≈ \+[\d ,]+ KP$/);
    expect(effectLine(producing(), clk)).toMatch(/^KP\/klick ×2 i 30 s · ≈ \+[\d ,]+ KP vid \d+ klick\/s$/);
  });

  it('leaves out the estimate when there is no production to multiply', () => {
    expect(effectLine(fresh(), prod)).toBe('Produktion ×1,5 i 30 s');
  });

  it('ends the receipt with the actual result', () => {
    const s = { ...producing(), inbox: ['csv-semicolon'] };
    const lumpR = answerTicket(s, 'csv-semicolon', 1);
    expect(receiptText(lumpR)).toBe(`${lumpR.choice!.outcome} ${effectText({ kind: 'lump', kp: lumpR.granted })}.`);
    const buffR = answerTicket(s, 'csv-semicolon', 0);
    expect(receiptText(buffR).endsWith('Produktion ×1,5 i 30 s.')).toBe(true);
  });
});

describe('ticket content (task 043)', () => {
  it('has no hand-written effect text left in outcomes', () => {
    for (const t of TICKETS)
      for (const c of t.choices) {
        expect(c.outcome, t.id).not.toMatch(/×\d[\d,]* i \d+ s/);
        expect(c.outcome, t.id).not.toContain('Du får en klump KP');
      }
  });
});

describe('buffLines (task 043)', () => {
  it('lists every running buff', () => {
    const s: GameState = {
      ...fresh(),
      timeMs: 1_000,
      buffs: [
        { source: 'a', kind: 'prodMult', mult: 1.5, untilMs: 25_000 },
        { source: 'b', kind: 'clickMult', mult: 2, untilMs: 13_000 },
        { source: 'c', kind: 'clickMult', mult: 3, untilMs: 500 },
      ],
    };
    expect(buffLines(s)).toEqual(['Produktion ×1,5 · 24 s', 'KP/klick ×2 · 12 s']);
    expect(buffLines(fresh())).toEqual([]);
  });
});
