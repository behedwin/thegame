// Tests for the task-queue helpers used by parallel workers (scripts/tasks-lib.mjs).
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helper without type declarations
import { eligibleTasks, parseFrontmatter, pathsOverlap } from '../scripts/tasks-lib.mjs';

type Meta = { id: string; status: string; touches: string[]; depends: string[] };
const task = (meta: Meta) => ({ file: `${meta.id}-x.md`, path: `tasks/${meta.id}-x.md`, location: 'queue', meta });

describe('parseFrontmatter', () => {
  it('reads scalars and lists', () => {
    const m = parseFrontmatter('---\nid: 007\nsize: S\nstatus: ready\ntouches: [src/a.ts, src/b/]\ndepends: []\n---\n# Title\n');
    expect(m).toEqual({ id: '007', size: 'S', status: 'ready', touches: ['src/a.ts', 'src/b/'], depends: [] });
  });

  it('returns null without frontmatter', () => {
    expect(parseFrontmatter('# nope')).toBeNull();
  });
});

describe('pathsOverlap', () => {
  it('treats directories as prefixes', () => {
    expect(pathsOverlap('src/content/events/', 'src/content/events/a.ts')).toBe(true);
    expect(pathsOverlap('src/', 'src/ui/app.ts')).toBe(true);
    expect(pathsOverlap('src/ui/app.ts', 'src/ui/app.ts')).toBe(true);
    expect(pathsOverlap('src/ui/app.ts', 'src/ui/shop.ts')).toBe(false);
    expect(pathsOverlap('src/content/events/', 'src/content/eventsX/')).toBe(false);
  });
});

describe('eligibleTasks', () => {
  const queue = [
    task({ id: '001', status: 'ready', touches: ['src/ui/app.ts'], depends: [] }),
    task({ id: '002', status: 'ready', touches: ['src/content/events/'], depends: [] }),
    task({ id: '003', status: 'ready', touches: ['src/ui/'], depends: [] }),
    task({ id: '004', status: 'ready', touches: ['android/'], depends: ['000'] }),
    task({ id: '005', status: 'ready', touches: ['docs/'], depends: ['002'] }),
    task({ id: '006', status: 'blocked', touches: ['x/'], depends: [] }),
  ];
  const done = [{ ...task({ id: '000', status: 'done', touches: [], depends: [] }), location: 'done' }];
  const tasks = { queue, done, proposed: [], claims: [] };
  const ids = (claimed: string[]) => eligibleTasks(tasks, claimed).map((t: { meta: Meta }) => t.meta.id);

  it('returns ready tasks with done dependencies in order', () => {
    expect(ids([])).toEqual(['001', '002', '003', '004']);
  });

  it('skips claimed tasks and tasks whose touches overlap a claim', () => {
    expect(ids(['001'])).toEqual(['002', '004']);
    expect(ids(['002'])).toEqual(['001', '003', '004']);
  });

  it('blocks everything when a claimed task is unknown', () => {
    expect(ids(['999'])).toEqual([]);
  });
});
