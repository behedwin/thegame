import { expect, test } from '@playwright/test';

test('bulk buy ×10 and MAX buy several automations at once', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const save = {
    version: 1,
    kp: '100000',
    runEarned: '100000',
    totalEarned: '100000',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: {},
    meritUpgrades: {},
    prestiges: 0,
    clicks: 0,
    timeMs: 0,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 1e12,
    buffs: [],
    eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto('/');

  await expect(page.getByTestId('bulk-1')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('bulk-10').click();
  await expect(page.getByTestId('bulk-10')).toHaveAttribute('aria-pressed', 'true');
  const csv = page.getByTestId('buy-csv');
  await expect(csv).toContainText('×10');
  await csv.click();
  const csvLevel = page.getByTestId('card-csv').locator('.card-level');
  await expect(csvLevel).toHaveText('10 st');

  await page.getByTestId('bulk-max').click();
  await expect(csv).toContainText('×');
  await csv.click();
  await expect(csvLevel).not.toHaveText('10 st');
  await expect(csvLevel).toHaveText(/^\d+ st$/);
  const owned = Number((await csvLevel.textContent())!.split(' ')[0]);
  expect(owned).toBeGreaterThan(10);

  await page.getByTestId('tab-upgrades').click();
  await expect(page.getByTestId('bulk-max')).toBeVisible();
  await page.screenshot({ path: 'e2e-output/001-bulk.png', fullPage: true });
  expect(errors).toEqual([]);
});
