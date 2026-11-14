// Task 003: four new integration types and a compact network map.
import { describe, expect, it } from 'vitest';
import { AUTOMATIONS, SYSTEMS } from '../src/content/registry';
import { MAX_ROWS, pickRows, rowYs } from '../src/ui/network';

const NEW = ['sftp', 'scim', 'ss12001api', 'lti'];

describe('new integration types', () => {
  it('exist after the original four, in this order', () => {
    expect(AUTOMATIONS.map((a) => a.id)).toEqual(['csv', 'nightly', 'flow', 'api', ...NEW]);
  });

  it('connect existing systems', () => {
    const ids = new Set(SYSTEMS.map((s) => s.id));
    for (const id of NEW) {
      const a = AUTOMATIONS.find((x) => x.id === id)!;
      expect(ids.has(a.from) && ids.has(a.to), id).toBe(true);
      expect(a.from).not.toBe(a.to);
    }
  });

  it('every tier costs more, gives more and is less cost-efficient than the one before', () => {
    for (let i = 1; i < AUTOMATIONS.length; i++) {
      const prev = AUTOMATIONS[i - 1]!;
      const cur = AUTOMATIONS[i]!;
      expect(cur.baseCost, cur.id).toBeGreaterThan(prev.baseCost);
      expect(cur.kps, cur.id).toBeGreaterThan(prev.kps);
      expect(cur.baseCost / cur.kps, cur.id).toBeGreaterThan(prev.baseCost / prev.kps);
    }
  });
});

describe('compact network layout', () => {
  it('shows the first row when nothing is owned', () => {
    expect(pickRows([false, false, false], MAX_ROWS)).toEqual([0]);
  });

  it('shows owned rows in order', () => {
    expect(pickRows([true, false, true, true], MAX_ROWS)).toEqual([0, 2, 3]);
  });

  it('keeps only the most recently unlocked rows when there are too many', () => {
    const owned = Array.from({ length: 8 }, () => true);
    expect(pickRows(owned, 6)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(MAX_ROWS).toBeLessThanOrEqual(6);
  });

  it('spreads rows evenly inside the map and centres a single row', () => {
    expect(rowYs(1, 300)).toEqual([150]);
    const ys = rowYs(6, 300);
    expect(ys).toHaveLength(6);
    expect(ys[0]).toBeGreaterThanOrEqual(20);
    expect(ys[5]).toBeLessThanOrEqual(280);
    const gaps = ys.slice(1).map((y, i) => y - ys[i]!);
    for (const g of gaps) expect(g).toBeCloseTo(gaps[0]!, 6);
    expect(gaps[0]).toBeGreaterThanOrEqual(36); // node height 34 + air
  });
});
