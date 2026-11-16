import { expect, test } from '@playwright/test';

// The second school year, a few KP short of last year's 103 KP.
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
  lastYearEarned: '103',
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
};

test("a toast celebrates passing last year's KP, but not on load", async ({ page }) => {
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
  const hub = page.getByTestId('hub');
  await expect(hub).toBeVisible();
  const record = page.locator('.toast').filter({ hasText: 'förra läsårets KP' });
  await expect(record).toHaveCount(0);
  for (let i = 0; i < 6; i++) await hub.click();
  await expect(record).toBeVisible();
  await page.screenshot({ path: 'e2e-output/109-year-beat-last-toast.png' });
  expect(errors).toEqual([]);
});
