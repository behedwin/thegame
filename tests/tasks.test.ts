// Tests for the task-queue helpers used by parallel workers (scripts/tasks-lib.mjs).
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs helper without type declarations
import { eligibleTasks, parseFrontmatter, pathsOverlap, queueOrder, validateTasks } from '../scripts/tasks-lib.mjs';

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

describe('refactor barriers', () => {
  type K = Meta & { kind?: string };
  const t = (meta: K) => ({ file: `${meta.id}-x.md`, path: `tasks/${meta.id}-x.md`, location: 'queue', meta });
  const done = [{ ...t({ id: '001', status: 'done', touches: [], depends: [] }), location: 'done' }];
  const mk = (blockedStatus: string, kind?: string) => ({
    queue: [
      t({ id: '002', status: blockedStatus, touches: ['a/'], depends: [] }),
      t({ id: '005', status: 'ready', touches: ['src/'], depends: ['001', '002'], ...(kind ? { kind } : {}) }),
      t({ id: '006', status: 'ready', touches: ['b/'], depends: ['002'] }),
    ],
    done,
    proposed: [],
    claims: [],
  });
  const ids = (tasks: ReturnType<typeof mk>) => eligibleTasks(tasks, []).map((x: { meta: Meta }) => x.meta.id);

  it('a refactor task is ready when every dependency is done or blocked', () => {
    expect(ids(mk('blocked', 'refactor'))).toEqual(['005']);
  });

  it('a feature task still requires its dependencies to be done', () => {
    expect(ids(mk('blocked', 'refactor'))).not.toContain('006');
  });

  it('without kind: refactor a blocked dependency keeps the task waiting', () => {
    expect(ids(mk('blocked'))).toEqual([]);
  });

  it('a refactor task still waits for dependencies that are only ready', () => {
    expect(ids(mk('ready', 'refactor'))).toEqual(['002']);
  });
});

describe('priority', () => {
  type P = Meta & { priority?: string };
  const t = (meta: P) => ({ file: `${meta.id}-x.md`, path: `tasks/${meta.id}-x.md`, location: 'queue', meta });
  const tasks = {
    queue: [
      t({ id: '003', status: 'ready', touches: ['a/'], depends: [] }),
      t({ id: '007', status: 'ready', touches: ['b/'], depends: [], priority: 'high' }),
      t({ id: '005', status: 'ready', touches: ['c/'], depends: [], priority: 'normal' }),
      t({ id: '004', status: 'ready', touches: ['d/'], depends: [], priority: 'high' }),
      t({ id: '009', status: 'ready', touches: ['e/'], depends: ['001'], priority: 'high' }),
    ],
    done: [],
    proposed: [],
    claims: [],
  };
  const ids = (claimed: string[] = []) => eligibleTasks(tasks, claimed).map((x: { meta: Meta }) => x.meta.id);

  it('picks high before normal, then lowest id; missing priority means normal', () => {
    expect(ids()).toEqual(['004', '007', '003', '005']);
  });

  it('high priority never bypasses depends or claims', () => {
    expect(ids()).not.toContain('009');
    expect(ids(['004'])).toEqual(['007', '003', '005']);
  });

  it('queueOrder lists ready and blocked tasks in pick order with positions', () => {
    const order = queueOrder(tasks).map((x: { meta: Meta }) => x.meta.id);
    expect(order).toEqual(['004', '007', '009', '003', '005']);
  });
});

describe('validateTasks', () => {
  const ok = (id: string, extra: Record<string, unknown> = {}) => ({
    file: `${id}-x.md`,
    path: `tasks/${id}-x.md`,
    location: 'queue',
    meta: { id, size: 'S', status: 'ready', touches: ['a/'], depends: [], ...extra },
  });
  const wrap = (queue: unknown[]) => ({ queue, done: [], proposed: [], claims: [] });

  it('accepts priority high/normal and a missing priority', () => {
    expect(validateTasks(wrap([ok('001'), ok('002', { priority: 'high' }), ok('003', { priority: 'normal' })]))).toEqual([]);
  });

  it('rejects an unknown priority', () => {
    expect(validateTasks(wrap([ok('001', { priority: 'urgent' })])).join()).toMatch(/priority must be one of high\/normal/);
  });

  it('rejects ids that are not three digits', () => {
    expect(validateTasks(wrap([{ ...ok('12'), file: '12-x.md' }])).join()).toMatch(/three digits/);
  });

  it('still rejects duplicate ids and unknown depends', () => {
    const errs = validateTasks(wrap([ok('001'), ok('001'), ok('002', { depends: ['404'] })])).join('\n');
    expect(errs).toMatch(/duplicate id 001/);
    expect(errs).toMatch(/unknown id 404/);
  });
});
