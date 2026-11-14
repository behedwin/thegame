import { defineConfig } from 'vitest/config';

// base './' so the same build works on GitHub Pages (sub-path) and inside Capacitor.
export default defineConfig({
  base: './',
  build: { outDir: 'dist', target: 'es2022', sourcemap: false },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
