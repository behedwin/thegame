// Task 054: the build-time changelog (version and "what's new" entries) and the `changelog` field check.
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helper without type declarations
import { buildChangelog, formatVersion, validateTasks } from '../scripts/tasks-lib.mjs';

const md = (id: string, title: string, extra = '') =>
  `---\nid: ${id}\nsize: S\nstatus: done\ntouches: [src/a.ts]\ndepends: []\n${extra}---\n\n# ${title}\n\nBody.\n`;

const files = [
  { file: '001-a.md', text: md('001', 'Köp ×1 / ×10 / MAX') },
  { file: '002-b.md', text: md('002', 'Intern sak', 'changelog: false\n') },
  { file: '003-c.md', text: md('003', 'Teknisk rubrik', 'changelog: "Nu kan du se nyheter i spelet"\n') },
  { file: '005-refactor.md', text: md('005', 'Refaktorering #1', 'kind: refactor\n') },
  { file: '004-d.md', text: md('004', 'Utan journal') },
  { file: 'README.md', text: '# not a task' },
  { file: '006-broken.md', text: 'no frontmatter at all' },
];
const journals = ['20261114T100000Z-001.md', '20261115T090000Z-003.md', '20261116T080000Z-001.md', 'README.md', '20261114T095644Z-infra.md'];

describe('buildChangelog', () => {
  const log = buildChangelog(files, journals);

  it('uses the highest done id (refactors included) for the version', () => {
    expect(log.build).toBe(5);
    expect(formatVersion(log.build)).toBe('1.5');
    expect(formatVersion(54, 'abcdef1234567')).toBe('1.54 (abcdef1)');
    expect(formatVersion(54, '')).toBe('1.54');
  });

  it('skips refactors, changelog: false and broken files', () => {
    const ids = log.entries.map((e: { id: string }) => e.id);
    expect(ids).not.toContain('002');
    expect(ids).not.toContain('005');
    expect(ids).not.toContain('006');
    expect(ids.sort()).toEqual(['001', '003', '004']);
  });

  it('uses the changelog text instead of the heading when present', () => {
    expect(log.entries.find((e: { id: string }) => e.id === '003').title).toBe('Nu kan du se nyheter i spelet');
    expect(log.entries.find((e: { id: string }) => e.id === '001').title).toBe('Köp ×1 / ×10 / MAX');
  });

  it('takes the date from the latest journal name and omits it without a journal', () => {
    expect(log.entries.find((e: { id: string }) => e.id === '001').date).toBe('2026-11-16');
    expect(log.entries.find((e: { id: string }) => e.id === '004').date).toBeUndefined();
  });

  it('sorts newest first (by date, then id; undated last)', () => {
    expect(log.entries.map((e: { id: string }) => e.id)).toEqual(['001', '003', '004']);
  });
});

describe('validateTasks: changelog field', () => {
  const task = (changelog: string) => ({
    file: '009-x.md', path: 'tasks/done/009-x.md', location: 'done',
    meta: { id: '009', size: 'S', status: 'done', touches: [], depends: [], changelog },
  });
  const check = (c: string) => validateTasks({ queue: [], done: [task(c)], proposed: [], claims: [] });

  it('accepts false and a non-empty sentence', () => {
    expect(check('false')).toEqual([]);
    expect(check('Nytt: ärendearkiv')).toEqual([]);
  });

  it('rejects an empty string, a number and true', () => {
    for (const bad of ['', '3', 'true']) expect(check(bad).join()).toMatch(/changelog/);
  });

  it('parses changelog: "" as an empty value that fails', async () => {
    // @ts-expect-error plain .mjs helper without type declarations
    const { parseFrontmatter } = await import('../scripts/tasks-lib.mjs');
    expect(parseFrontmatter('---\nchangelog: ""\n---\n').changelog).toBe('');
    expect(parseFrontmatter('---\nchangelog: 3\n---\n').changelog).toBe('3');
  });
});
