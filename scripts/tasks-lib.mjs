// Shared helpers for the task queue in tasks/. Plain Node, no dependencies.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TASK_DIR = 'tasks';
export const SIZES = ['S', 'M', 'L'];
export const STATUSES = ['ready', 'blocked', 'done', 'proposed'];
export const KINDS = ['feature', 'refactor'];
export const PRIORITIES = ['high', 'normal'];

const rank = (m) => (m?.priority === 'high' ? 0 : 1);
/** Pick order: priority high before normal (missing = normal), then lowest id. */
export const byPickOrder = (a, b) => rank(a.meta) - rank(b.meta) || String(a.meta?.id).localeCompare(String(b.meta?.id));

/** The whole queue (ready and blocked) in pick order, ignoring claims and depends. */
export function queueOrder(tasks) {
  return [...tasks.queue].sort(byPickOrder);
}

/** Parse the minimal frontmatter we use: `key: value` and `key: [a, b]`. */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key, raw] = kv;
    const value = raw.trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : [];
    } else data[key] = value.replace(/^['"]|['"]$/g, '');
  }
  return data;
}

function readDir(dir, location) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
    .map((file) => {
      const path = join(dir, file).replace(/\\/g, '/');
      return { file, path, location, meta: parseFrontmatter(readFileSync(path, 'utf8')) };
    });
}

/** All tasks: queue (tasks/*.md), done, proposed and claims. */
export function loadTasks(root = TASK_DIR) {
  return {
    queue: readDir(root, 'queue'),
    done: readDir(join(root, 'done'), 'done'),
    proposed: readDir(join(root, 'proposed'), 'proposed'),
    claims: readDir(join(root, 'claims'), 'claims'),
  };
}

const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '');

/** True if two touch paths can affect the same files (equal, or one is a directory prefix of the other). */
export function pathsOverlap(a, b) {
  const x = norm(a).replace(/\/$/, '');
  const y = norm(b).replace(/\/$/, '');
  return x === y || x.startsWith(y + '/') || y.startsWith(x + '/');
}

export function touchesOverlap(a = [], b = []) {
  return a.some((p) => b.some((q) => pathsOverlap(p, q)));
}

/**
 * Pick eligible tasks in queue order: status ready, dependencies satisfied, not claimed,
 * and touches not overlapping any claimed task. A dependency is satisfied when it is done;
 * for refactor tasks (kind: refactor) a blocked dependency also counts, so one blocked
 * feature does not stall the whole queue at the next refactor barrier.
 */
export function eligibleTasks(tasks, claimedIds) {
  const doneIds = new Set(tasks.done.map((t) => t.meta?.id));
  const blockedIds = new Set(tasks.queue.filter((t) => t.meta?.status === 'blocked').map((t) => t.meta.id));
  const satisfied = (m, d) => doneIds.has(d) || (m.kind === 'refactor' && blockedIds.has(d));
  const byId = new Map(tasks.queue.map((t) => [t.meta?.id, t]));
  const claimedTouches = claimedIds.map((id) => byId.get(id)?.meta?.touches ?? ['*unknown*']);
  return [...tasks.queue].sort(byPickOrder).filter((t) => {
    const m = t.meta;
    if (!m || m.status !== 'ready' || claimedIds.includes(m.id)) return false;
    if (!(m.depends ?? []).every((d) => satisfied(m, d))) return false;
    // A claimed task we cannot find (e.g. not on main) is treated as touching everything.
    if (claimedTouches.some((ct) => ct.includes('*unknown*'))) return false;
    return !claimedTouches.some((ct) => touchesOverlap(m.touches, ct));
  });
}

/** Validate the task set. Returns a list of "path: problem" strings (empty = OK). */
export function validateTasks(tasks) {
  const errors = [];
  const ids = new Map();
  const err = (t, msg) => errors.push(`${t.path}: ${msg}`);
  const expected = { queue: ['ready', 'blocked'], done: ['done'], proposed: ['proposed'] };

  for (const t of [...tasks.queue, ...tasks.done, ...tasks.proposed]) {
    const m = t.meta;
    if (!m) {
      err(t, 'missing frontmatter');
      continue;
    }
    for (const key of ['id', 'size', 'status', 'touches', 'depends']) if (m[key] === undefined) err(t, `missing "${key}"`);
    if (!SIZES.includes(m.size)) err(t, `size must be one of ${SIZES.join('/')}`);
    if (!expected[t.location].includes(m.status))
      err(t, `status "${m.status}" not allowed in ${t.location} (expected ${expected[t.location].join('/')})`);
    if (m.kind !== undefined && !KINDS.includes(m.kind)) err(t, `kind must be one of ${KINDS.join('/')}`);
    if (m.priority !== undefined && !PRIORITIES.includes(m.priority)) err(t, `priority must be one of ${PRIORITIES.join('/')}`);
    if (!Array.isArray(m.touches)) err(t, 'touches must be a list');
    if (!Array.isArray(m.depends)) err(t, 'depends must be a list');
    if (t.location === 'proposed') {
      if (!/^p-[a-z0-9-]+$/.test(m.id ?? '') || t.file !== `${m.id}.md`) err(t, 'proposals are named p-<slug>.md with id p-<slug>');
    } else {
      if (!/^\d{3}$/.test(m.id ?? '')) err(t, 'id must be three digits');
      if (!t.file.startsWith(`${m.id}-`)) err(t, `file name must start with "${m.id}-"`);
      if (t.location === 'queue' && (m.touches ?? []).length === 0) err(t, 'touches must not be empty');
    }
    for (const p of m.touches ?? []) if (p.startsWith('/') || p.includes('..')) err(t, `bad touches path "${p}"`);
    if (ids.has(m.id)) err(t, `duplicate id ${m.id} (also ${ids.get(m.id)})`);
    ids.set(m.id, t.path);
  }
  for (const t of [...tasks.queue, ...tasks.done]) {
    for (const d of t.meta?.depends ?? []) if (!ids.has(d)) err(t, `depends on unknown id ${d}`);
  }
  for (const c of tasks.claims) err(c, 'claim files must never reach main or a PR (remove before opening the PR)');
  return errors;
}
