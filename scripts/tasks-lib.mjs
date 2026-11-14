// Shared helpers for the task queue in tasks/. Plain Node, no dependencies.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TASK_DIR = 'tasks';
export const SIZES = ['S', 'M', 'L'];
export const STATUSES = ['ready', 'blocked', 'done', 'proposed'];
export const KINDS = ['feature', 'refactor'];

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
  return tasks.queue.filter((t) => {
    const m = t.meta;
    if (!m || m.status !== 'ready' || claimedIds.includes(m.id)) return false;
    if (!(m.depends ?? []).every((d) => satisfied(m, d))) return false;
    // A claimed task we cannot find (e.g. not on main) is treated as touching everything.
    if (claimedTouches.some((ct) => ct.includes('*unknown*'))) return false;
    return !claimedTouches.some((ct) => touchesOverlap(m.touches, ct));
  });
}
