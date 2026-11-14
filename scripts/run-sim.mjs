// Runs sim/run.ts through Vite's module runner so content discovered with
// import.meta.glob works exactly as in the app. Arguments are passed through.
import { runnerImport } from 'vite';

await runnerImport('./sim/run.ts', { configFile: false, logLevel: 'error' });
