// Worker protocol step 2: list eligible tasks in pick order (first line = pick).
// Pick order: priority high before normal, then lowest id. Claimed = an
// origin/claude/task-<id> branch exists. Run `git fetch --prune` first.
// Usage: node scripts/next-task.mjs [--json | --queue]
//   --queue  print the whole queue (ready + blocked) with positions, for idea intake.
import { execFileSync } from 'node:child_process';
import { eligibleTasks, loadTasks, queueOrder } from './tasks-lib.mjs';

const refs = execFileSync('git', ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/claude/task-*'], {
  encoding: 'utf8',
});
const claimed = refs
  .split('\n')
  .map((r) => /claude\/task-(.+)$/.exec(r.trim())?.[1])
  .filter(Boolean);

const tasks = loadTasks();

if (process.argv.includes('--queue')) {
  queueOrder(tasks).forEach((t, i) => {
    const m = t.meta;
    const flags = [m.priority === 'high' ? 'HIGH' : '', m.status !== 'ready' ? m.status : '', claimed.includes(m.id) ? 'claimed' : '']
      .filter(Boolean)
      .join(',');
    console.log(`${String(i + 1).padStart(2)}. ${m.id}\t${m.size}\t${flags}\t${t.path}`);
  });
  process.exit(0);
}

const picks = eligibleTasks(tasks, claimed);
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ claimed, eligible: picks.map((t) => ({ id: t.meta.id, size: t.meta.size, priority: t.meta.priority ?? 'normal', path: t.path })) }, null, 2));
} else {
  if (claimed.length) console.error(`claimed: ${claimed.join(', ')}`);
  for (const t of picks) console.log(`${t.meta.id}\t${t.meta.size}\t${t.meta.priority ?? 'normal'}\t${t.path}`);
  if (!picks.length) console.error('no eligible task');
}
