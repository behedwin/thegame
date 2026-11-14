// Gate: validates tasks/ so parallel workers can rely on it. Exit 1 on any problem.
import { loadTasks, validateTasks } from './tasks-lib.mjs';

const tasks = loadTasks();
const errors = validateTasks(tasks);
if (errors.length) {
  console.error(`tasks check FAILED:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`tasks OK: ${tasks.queue.length} queued, ${tasks.done.length} done, ${tasks.proposed.length} proposed`);
