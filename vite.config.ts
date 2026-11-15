import { execSync } from 'node:child_process';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
// @ts-expect-error plain .mjs helper without type declarations
import { formatVersion, readChangelog } from './scripts/tasks-lib.mjs';

/** Short commit sha: GITHUB_SHA in CI, else git, else nothing. */
function commitSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

/** `virtual:changelog`: version and player-facing changelog built from tasks/done/ and journal/ at build time. */
function changelog(): Plugin {
  const id = 'virtual:changelog';
  return {
    name: 'changelog',
    resolveId: (source) => (source === id ? '\0' + id : null),
    load(resolved) {
      if (resolved !== '\0' + id) return null;
      const { build, entries } = readChangelog();
      return `export const build = ${build};\nexport const version = ${JSON.stringify(formatVersion(build, commitSha()))};\nexport const entries = ${JSON.stringify(entries)};\n`;
    },
  };
}

// base './' so the same build works on GitHub Pages (sub-path) and inside Capacitor.
export default defineConfig({
  base: './',
  plugins: [changelog()],
  build: { outDir: 'dist', target: 'es2022', sourcemap: false },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
