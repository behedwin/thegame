import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/content/balance';
import { HELP } from '../src/content/registry';
import { T } from '../src/content/texts';

const files = Object.keys(import.meta.glob('../src/content/help/*.ts')).map((p) => p.slice(p.lastIndexOf('/') + 1, -3));

describe('help page content (task 029)', () => {
  it('has one section per file, id = file name, sorted by a unique order', () => {
    expect(HELP.map((s) => s.id).sort()).toEqual([...files].sort());
    expect(HELP.length).toBeGreaterThanOrEqual(6);
    const orders = HELP.map((s) => s.order);
    expect(new Set(orders).size).toBe(orders.length);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('every section has a title and non-empty, short paragraphs', () => {
    for (const s of HELP) {
      expect(s.title.trim().length, s.id).toBeGreaterThan(0);
      expect(s.body.length, s.id).toBeGreaterThan(0);
      for (const p of s.body) {
        expect(p.trim().length, s.id).toBeGreaterThan(0);
        expect(p).not.toMatch(/undefined|NaN|\$\{/);
        // Roughly three sentences at most per section.
        expect(p.split(/[.!?](\s|$)/).filter((x) => x && x.trim()).length, s.id).toBeLessThanOrEqual(4);
      }
    }
  });

  it('the first section explains the basics', () => {
    expect(HELP[0]!.id).toBe('grunderna');
    expect(HELP[0]!.body.join(' ')).toContain(T.hubLabel);
  });

  it('numbers in the text come from balance.ts', () => {
    const text = (id: string) => HELP.find((s) => s.id === id)!.body.join(' ');
    const milestones = text('milstolpar');
    for (const m of BALANCE.milestones) expect(milestones).toContain(String(m));
    expect(milestones).toContain(`×${BALANCE.milestoneMult}`);
    expect(text('offline')).toContain(`${BALANCE.offline.baseCapHours} timmar`);
  });

  it('has UI texts for the button, title and close', () => {
    expect(T.help).toEqual({ open: 'Hjälp', title: 'Så spelar du', close: 'Stäng' });
  });
});
