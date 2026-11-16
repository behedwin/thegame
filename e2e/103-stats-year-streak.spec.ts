import { expect, test } from '@playwright/test';

// The second school year; last year's longest streak was 6, this year's is 4.
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
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test('stats show this year\'s longest streak next to last year\'s', async ({ page }) => {
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
  await expect(list).toContainText('Längsta svit i år4 🔥 (förra läsåret 6)');
  await page.screenshot({ path: 'e2e-output/103-stats-year-streak.png' });
  expect(errors).toEqual([]);
});
