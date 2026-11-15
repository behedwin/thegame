// Quality gate: pacing simulation. Usage: npm run sim [-- --seeds 200 --hours 3 --jobs N]
// Seeds are independent and deterministic, so they run in parallel child processes (one per core, at most
// 8; --jobs 1 runs serially). The results are merged in seed order and judged exactly as a serial run:
// the gate, the seeds and sim-report.json are identical, only the wall-clock time drops.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join } from 'node:path';
import { simulateSeed, type SeedResult } from './bot';

const GATES = {
  firstPurchaseMaxSec: 15,
  firstAutomationMaxSec: 90,
  maxNoAffordableGapSecFirstHour: 180,
  firstPrestigeMinSec: 30 * 60,
  firstPrestigeMaxSec: 90 * 60,
  /** Task 021: never more than this with nothing to buy and no ticket to answer, over the whole run. */
  maxIdleGapSec: 120,
};

function arg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  const v = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const seeds = arg('seeds', 200);
const hours = arg('hours', 3);
const started = Date.now();
const durationSec = Math.round(hours * 3600);

/** Seeds of shard i out of n: every n-th seed, so slow late seeds spread evenly. */
const shardSeeds = (i: number, n: number): number[] =>
  Array.from({ length: seeds }, (_, k) => k + 1).filter((seed) => (seed - 1) % n === i);

// Child mode: simulate one shard, write its results and stop (the parent judges and reports).
const shardArg = process.argv[process.argv.indexOf('--shard') + 1];
if (process.argv.includes('--shard') && shardArg) {
  const [i, n] = shardArg.split('/').map(Number) as [number, number];
  const out = process.argv[process.argv.indexOf('--out') + 1]!;
  writeFileSync(out, JSON.stringify(shardSeeds(i, n).map((seed) => simulateSeed(seed, durationSec))));
  process.exit(0);
}

function runShards(jobs: number): Promise<SeedResult[]> {
  const dir = mkdtempSync(join(tmpdir(), 'sim-'));
  const runs = Array.from({ length: jobs }, (_, i) => {
    const out = join(dir, `shard-${i}.json`);
    const args = ['scripts/run-sim.mjs', '--seeds', String(seeds), '--hours', String(hours), '--shard', `${i}/${jobs}`, '--out', out];
    return new Promise<SeedResult[]>((resolve, reject) => {
      const child = spawn(process.execPath, args, { stdio: ['ignore', 'inherit', 'inherit'] });
      child.on('error', reject);
      child.on('exit', (code) =>
        code === 0 ? resolve(JSON.parse(readFileSync(out, 'utf8')) as SeedResult[]) : reject(new Error(`sim shard ${i}/${jobs} exited with ${code}`)),
      );
    });
  });
  return Promise.all(runs)
    .then((parts) => parts.flat().sort((a, b) => a.seed - b.seed))
    .finally(() => rmSync(dir, { recursive: true, force: true }));
}

const jobs = Math.min(arg('jobs', Math.min(8, availableParallelism())), seeds);
const results: SeedResult[] =
  jobs > 1 ? await runShards(jobs) : Array.from({ length: seeds }, (_, k) => simulateSeed(k + 1, durationSec));

function stats(values: number[]) {
  const v = [...values].sort((a, b) => a - b);
  const q = (p: number) => v[Math.min(v.length - 1, Math.floor(p * v.length))] ?? null;
  return { min: v[0] ?? null, p50: q(0.5), p95: q(0.95), max: v[v.length - 1] ?? null };
}
const pick = (f: (r: SeedResult) => number | null) =>
  results.map(f).filter((x): x is number => x !== null);

const failures: string[] = [];
for (const r of results) {
  const f = (msg: string) => failures.push(`seed ${r.seed}: ${msg}`);
  if (!r.ok) f(`crash/invalid: ${r.error}`);
  if (r.firstPurchaseSec === null || r.firstPurchaseSec > GATES.firstPurchaseMaxSec)
    f(`first purchase at ${r.firstPurchaseSec}s`);
  if (r.firstAutomationSec === null || r.firstAutomationSec > GATES.firstAutomationMaxSec)
    f(`first automation at ${r.firstAutomationSec}s`);
  if (r.maxNoAffordableGapSecFirstHour > GATES.maxNoAffordableGapSecFirstHour)
    f(`nothing affordable for ${r.maxNoAffordableGapSecFirstHour}s in first hour`);
  if (
    r.firstPrestigeSec === null ||
    r.firstPrestigeSec < GATES.firstPrestigeMinSec ||
    r.firstPrestigeSec > GATES.firstPrestigeMaxSec
  )
    f(`first prestige at ${r.firstPrestigeSec}s`);
  if (r.maxIdleGapSec > GATES.maxIdleGapSec) f(`nothing to do for ${r.maxIdleGapSec}s`);
}

/** Picks per ticket choice over all seeds ("<ticket>#<choice>"). */
const ticketChoices: Record<string, number> = {};
for (const r of results) for (const [k, n] of Object.entries(r.ticketChoices)) ticketChoices[k] = (ticketChoices[k] ?? 0) + n;

const report = {
  generatedBy: 'npm run sim',
  seeds,
  simulatedHours: hours,
  gates: GATES,
  passed: failures.length === 0,
  failures: failures.slice(0, 50),
  pacing: {
    firstPurchaseSec: stats(pick((r) => r.firstPurchaseSec)),
    firstAutomationSec: stats(pick((r) => r.firstAutomationSec)),
    maxNoAffordableGapSecFirstHour: stats(pick((r) => r.maxNoAffordableGapSecFirstHour)),
    meanPurchaseIntervalSecFirst10Min: stats(pick((r) => r.meanPurchaseIntervalSecFirst10Min)),
    firstPrestigeMin: stats(pick((r) => (r.firstPrestigeSec === null ? null : r.firstPrestigeSec / 60))),
    /** Minutes per school year (round k = time between prestige k-1 and k), seeds that reached it. */
    roundMin: Object.fromEntries(
      [2, 3, 4, 5].map((k) => [
        `r${k}`,
        stats(pick((r) => (r.prestigeAtSec.length >= k ? (r.prestigeAtSec[k - 1]! - r.prestigeAtSec[k - 2]!) / 60 : null))),
      ]),
    ),
    reachedRound5: results.filter((r) => r.prestigeAtSec.length >= 5).length,
    prestigesIn3h: stats(pick((r) => r.prestiges)),
    purchases: stats(pick((r) => r.purchases)),
    eventsSpawned: stats(pick((r) => r.eventsSpawned)),
    eventsClaimed: stats(pick((r) => r.eventsClaimed)),
    ticketsReceived: stats(pick((r) => r.ticketsReceived)),
    ticketsAnswered: stats(pick((r) => r.ticketsAnswered)),
    maxIdleGapSec: stats(pick((r) => r.maxIdleGapSec)),
    meritsEarned: stats(pick((r) => r.merits)),
    finalLog10TotalEarned: stats(pick((r) => r.finalLog10TotalEarned)),
    finalLog10Kps: stats(pick((r) => r.finalLog10Kps)),
  },
  ticketChoices: Object.fromEntries(Object.entries(ticketChoices).sort(([a], [b]) => a.localeCompare(b))),
};

writeFileSync('sim-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.pacing, null, 1).replace(/\n\s*/g, ' '));
console.log(`\n${seeds} seeds x ${hours} h in ${((Date.now() - started) / 1000).toFixed(1)} s (${jobs} job${jobs > 1 ? 's' : ''})`);
if (failures.length) {
  console.error(`\nSIM GATE FAILED (${failures.length} failures):\n` + failures.slice(0, 15).join('\n'));
  process.exit(1);
}
console.log('SIM GATE PASSED');
