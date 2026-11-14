import { expect, test } from '@playwright/test';

test('customer list shows signed contracts and their effects', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const save = {
    version: 1,
    kp: '20000',
    runEarned: '20000',
    totalEarned: '20000',
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

  // 20 000 KP this year: signed at 50, 1 000 and 10 000.
  await expect(page.getByTestId('customers')).toContainText('3 kunder');
  await page.getByTestId('customers').click();
  const list = page.getByTestId('customer-list');
  await expect(list.locator('li')).toHaveCount(3);
  await expect(page.getByTestId('customer-mellanby-kommun')).toContainText('produktion');
  await expect(page.getByTestId('customer-friskolan-larandets-lustgard')).toContainText('KP/klick');
  await expect(page.getByTestId('customers-dialog')).toContainText('Nästa kund vid');
  await page.screenshot({ path: 'e2e-output/004-customers.png', fullPage: true });
  await page.getByTestId('customers-dialog').getByRole('button').click();
  await expect(page.getByTestId('customers-dialog')).toHaveCount(0);
  expect(errors).toEqual([]);
});
