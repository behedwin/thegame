import { expect, test } from '@playwright/test';

// The second school year; last year earned 3 000 000 000 KP.
const save = {
  version: 19,
  kp: '100',
  runEarned: '100',
  totalEarned: '100000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: {},
  meritUpgrades: {},
  prestiges: 1,
  clicks: 10,
  timeMs: 600000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 9,
  bestEventStreak: 6,
  yearEvents: 4,
  yearBestStreak: 4,
  lastYearBestStreak: 6,
  lastYearEarned: '3000000000',
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test("stats show last year's KP right after this year", async ({ page }) => {
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
  await page.getByTestId('settings').click();
  await page.getByTestId('open-stats').click();
  const list = page.getByTestId('stat-list');
  await expect(list).toContainText('Förra läsåret');
  await expect(page.getByTestId('stat-1')).toContainText('Intjänat i år');
  await expect(page.getByTestId('stat-2')).toContainText('Förra läsåret');
  await expect(page.getByTestId('stat-2')).toContainText('KP');
  await page.screenshot({ path: 'e2e-output/106-stats-last-year-kp.png' });
  expect(errors).toEqual([]);
});
