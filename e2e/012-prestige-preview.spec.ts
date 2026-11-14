import { expect, test } from '@playwright/test';

test('prestige tab shows the next-year preview and the new merits', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const save = {
    version: 1,
    kp: '1000',
    runEarned: '4000000000',
    totalEarned: '4000000000',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: { csv: 10 },
    meritUpgrades: {},
    prestiges: 1,
    clicks: 100,
    timeMs: 600000,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 10_000_000,
    buffs: [],
    eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  };
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');
  await page.getByTestId('tab-prestige').click();
  await expect(page.getByTestId('prestige-preview')).toContainText(/Nästa läsår går ~\d+ % snabbare/);
  for (const id of ['framework', 'network', 'nightly']) await expect(page.getByTestId(`card-${id}`)).toBeVisible();
  await page.screenshot({ path: 'e2e-output/012-prestige-preview.png', fullPage: true });
  expect(errors).toEqual([]);
});
