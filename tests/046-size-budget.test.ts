import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Owner decision 2026-11-15 (task 046): the src/ size budget is 7 000 lines.
// Guards that the gate script and the documented gate in CLAUDE.md never drift apart.
const script = readFileSync('scripts/size-check.mjs', 'utf8');
const rules = readFileSync('CLAUDE.md', 'utf8');

describe('size budget (task 046)', () => {
  it('size-check.mjs enforces 7000 lines', () => {
    expect(script).toMatch(/^const LIMIT = 7000;$/m);
  });

  it('CLAUDE.md documents the same limit as the script', () => {
    const limit = Number(/^const LIMIT = (\d+);$/m.exec(script)?.[1]);
    const documented = /`src\/` ≤ ([\d ]+) rader/.exec(rules)?.[1]?.replace(/\s/g, '');
    expect(Number(documented)).toBe(limit);
  });
});
