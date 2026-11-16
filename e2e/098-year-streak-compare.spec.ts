import { expect, test } from '@playwright/test';

// The second school year, close to its end; last year's longest streak was 5, this year's is 7.
const save = {
  version: 19,
  kp: '1e12',
  runEarned: '4000000000',
  totalEarned: '4000000000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 5 },
  meritUpgrades: {},
  prestiges: 1,
  clicks: 100,
  timeMs: 600000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 9,
  bestEventStreak: 9,
  yearEvents: 7,
  yearBestStreak: 7,
  lastYearBestStreak: 5,
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test('The year in review compares the longest streak with last year', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');
  await page.getByTestId('tab-prestige').click();
  await page.getByTestId('prestige').click();
  const summary = page.getByTestId('year-summary');
  await expect(summary).toContainText('Längsta svit i år: 7 🔥 (+2)');
  await page.screenshot({ path: 'e2e-output/098-year-streak-compare.png' });
  expect(errors).toEqual([]);
});
