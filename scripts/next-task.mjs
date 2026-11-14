// Worker protocol step 2: list eligible tasks in priority order (first line = pick).
// Claimed = an origin/claude/task-<id> branch exists. Run `git fetch --prune` first.
// Usage: node scripts/next-task.mjs [--json]
import { execFileSync } from 'node:child_process';
import { eligibleTasks, loadTasks } from './tasks-lib.mjs';

const refs = execFileSync('git', ['for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/claude/task-*'], {
  encoding: 'utf8',
});
const claimed = refs
  .split('\n')
  .map((r) => /claude\/task-(.+)$/.exec(r.trim())?.[1])
  .filter(Boolean);

const picks = eligibleTasks(loadTasks(), claimed);
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ claimed, eligible: picks.map((t) => ({ id: t.meta.id, size: t.meta.size, path: t.path })) }, null, 2));
} else {
  if (claimed.length) console.error(`claimed: ${claimed.join(', ')}`);
  for (const t of picks) console.log(`${t.meta.id}\t${t.meta.size}\t${t.path}`);
  if (!picks.length) console.error('no eligible task');
}
