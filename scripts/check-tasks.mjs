// Gate: validates tasks/ so parallel workers can rely on it. Exit 1 on any problem.
import { loadTasks, SIZES } from './tasks-lib.mjs';

const tasks = loadTasks();
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
  if (!expected[t.location].includes(m.status)) err(t, `status "${m.status}" not allowed in ${t.location} (expected ${expected[t.location].join('/')})`);
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

if (errors.length) {
  console.error(`tasks check FAILED:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`tasks OK: ${tasks.queue.length} queued, ${tasks.done.length} done, ${tasks.proposed.length} proposed`);
