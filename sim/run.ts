// Quality gate: pacing simulation. Usage: npm run sim [-- --seeds 200 --hours 3]
import { writeFileSync } from 'node:fs';
import { simulateSeed, type SeedResult } from './bot';

const GATES = {
  firstPurchaseMaxSec: 15,
  firstAutomationMaxSec: 90,
  maxNoAffordableGapSecFirstHour: 180,
  firstPrestigeMinSec: 30 * 60,
  firstPrestigeMaxSec: 90 * 60,
};

function arg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  const v = i >= 0 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const seeds = arg('seeds', 200);
const hours = arg('hours', 3);
const started = Date.now();

const results: SeedResult[] = [];
for (let seed = 1; seed <= seeds; seed++) results.push(simulateSeed(seed, Math.round(hours * 3600)));

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
}

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
    meritsEarned: stats(pick((r) => r.merits)),
    finalLog10TotalEarned: stats(pick((r) => r.finalLog10TotalEarned)),
    finalLog10Kps: stats(pick((r) => r.finalLog10Kps)),
  },
};

writeFileSync('sim-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.pacing, null, 1).replace(/\n\s*/g, ' '));
console.log(`\n${seeds} seeds x ${hours} h in ${((Date.now() - started) / 1000).toFixed(1)} s`);
if (failures.length) {
  console.error(`\nSIM GATE FAILED (${failures.length} failures):\n` + failures.slice(0, 15).join('\n'));
  process.exit(1);
}
console.log('SIM GATE PASSED');
