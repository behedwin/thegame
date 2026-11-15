// Quality gate: total line count of src/ must stay within budget.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Raised from 5000 by owner decision 2026-11-15 (task 046, decisions/20261115T120000Z-046-size-budget.md).
const LIMIT = 7000;
const root = 'src';
let total = 0;
const perFile = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const lines = readFileSync(p, 'utf8').split('\n').length;
      total += lines;
      perFile.push([p, lines]);
    }
  }
}
walk(root);
perFile.sort((a, b) => b[1] - a[1]);
console.log(`src/ lines: ${total} / ${LIMIT}`);
for (const [p, n] of perFile.slice(0, 5)) console.log(`  ${n}\t${p}`);
if (total > LIMIT) {
  console.error(`Size budget exceeded by ${total - LIMIT} lines.`);
  process.exit(1);
}
