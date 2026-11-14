// Content integrity: catches broken references when workers add content files in parallel.
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, collect, CUSTOMERS, EVENTS, MERITS, SYSTEMS, UPGRADES } from '../src/content/registry';

const systemIds = new Set(SYSTEMS.map((s) => s.id));
const automationIds = new Set(AUTOMATIONS.map((a) => a.id));

describe('registry', () => {
  it('discovers every content file', () => {
    expect(AUTOMATIONS.length).toBeGreaterThanOrEqual(4);
    expect(UPGRADES.length).toBeGreaterThanOrEqual(6);
    expect(MERITS.length).toBeGreaterThanOrEqual(1);
    expect(EVENTS.length).toBeGreaterThanOrEqual(1);
    expect(SYSTEMS.length).toBeGreaterThanOrEqual(10);
    expect(CUSTOMERS.length).toBeGreaterThanOrEqual(1);
  });

  it('sorts by order, then id', () => {
    const orders = AUTOMATIONS.map((a) => a.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(AUTOMATIONS[0]!.id).toBe('csv');
    expect(UPGRADES[0]!.id).toBe('coffee');
  });

  it('rejects ids that do not match the file name', () => {
    expect(() => collect({ './x/a.ts': { default: { id: 'b' } } }, () => 0)).toThrow(/must default-export/);
  });

  it('ids are unique across buyable items (upgrades and automations share a namespace)', () => {
    const ids = [...AUTOMATIONS, ...UPGRADES].map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('references', () => {
  it('automations connect existing systems', () => {
    for (const a of AUTOMATIONS) {
      expect(systemIds.has(a.from), `${a.id}.from = ${a.from}`).toBe(true);
      expect(systemIds.has(a.to), `${a.id}.to = ${a.to}`).toBe(true);
    }
  });

  it('upgrade targets and merit start automations exist', () => {
    for (const u of UPGRADES) {
      if (u.effect.kind === 'autoMult' && u.effect.targets !== 'all') {
        for (const t of u.effect.targets) expect(automationIds.has(t), `${u.id} -> ${t}`).toBe(true);
      }
    }
    for (const m of MERITS) {
      if (m.effect.kind === 'startAutomation') expect(automationIds.has(m.effect.id), m.id).toBe(true);
    }
  });
});

describe('sanity', () => {
  it('numbers are positive and finite', () => {
    for (const a of AUTOMATIONS) expect(a.baseCost > 0 && a.kps > 0, a.id).toBe(true);
    for (const u of UPGRADES) expect(u.baseCost > 0 && u.costGrowth >= 1 && u.maxLevel >= 1, u.id).toBe(true);
    for (const m of MERITS) expect(m.baseCost >= 1 && m.costGrowth >= 1 && m.maxLevel >= 1, m.id).toBe(true);
    for (const e of EVENTS) {
      expect(e.weight > 0, e.id).toBe(true);
      if (e.effect.kind !== 'lump') expect(e.effect.durationMs > 0 && e.effect.mult > 1, e.id).toBe(true);
    }
    for (const c of CUSTOMERS) expect(c.atRunKp > 0, c.id).toBe(true);
  });

  it('player-facing texts are non-empty', () => {
    for (const d of [...AUTOMATIONS, ...UPGRADES, ...MERITS]) expect(d.name.trim() && d.desc.trim(), d.id).toBeTruthy();
    for (const e of EVENTS) expect(e.title.trim() && e.claimText.trim(), e.id).toBeTruthy();
    for (const s of SYSTEMS) expect(s.name.trim() && s.kind.trim(), s.id).toBeTruthy();
  });
});
