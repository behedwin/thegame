import { expect, test } from '@playwright/test';

// The second school year, close to its end: 4e9 KP earned against 3e9 last year.
const save = {
  version: 16,
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
  eventsClaimed: 7,
  ticketsAnswered: 12,
  yearEvents: 7,
  yearTickets: 12,
  lastYearEvents: 5,
  lastYearTickets: 12,
  lastYearEarned: '3000000000',
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test('The year in review compares KP with last school year', async ({ page }) => {
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
  await expect(summary).toContainText('KP intjänat (+33\u00a0%)');
  await page.screenshot({ path: 'e2e-output/083-year-summary-kp-compare.png' });

  expect(errors).toEqual([]);
});
