import { expect, test } from '@playwright/test';

// A school year close to its end in which the player solved 7 events and answered 12 tickets.
const save = {
  version: 14,
  kp: '1e12',
  runEarned: '4000000000',
  totalEarned: '4000000000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 5 },
  meritUpgrades: {},
  prestiges: 0,
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
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test('The year in review counts the events solved and tickets answered this school year', async ({ page }) => {
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
  await expect(summary).toContainText('7 event lösta');
  await expect(summary).toContainText('12 ärenden stängda');
  await page.screenshot({ path: 'e2e-output/076-year-summary-counters.png' });

  // The new school year starts counting from zero again.
  await page.getByTestId('confirm-prestige').click();
  await expect(summary).toHaveCount(0);
  expect(errors).toEqual([]);
});
