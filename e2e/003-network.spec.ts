import { expect, test } from '@playwright/test';

test('the network map shows at most six rows, the newest integrations', async ({ page }) => {
  const save = {
    version: 1,
    kp: '0',
    runEarned: '1e10',
    totalEarned: '1e10',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: { csv: 5, nightly: 5, flow: 5, api: 5, sftp: 3, scim: 2, ss12001api: 1, lti: 1 },
    meritUpgrades: {},
    prestiges: 0,
    clicks: 0,
    timeMs: 0,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 0,
    buffs: [],
    eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  };
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');
  await expect(page.locator('.net-row.shown')).toHaveCount(6);
  await expect(page.locator('svg.network')).toContainText('Filgrottan');
  await expect(page.locator('svg.network')).toContainText('Gurgel Klassrum');
  await page.getByTestId('tab-automations').click();
  await expect(page.getByTestId('card-lti')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'e2e-output/003-network.png' });
  expect(errors).toEqual([]);
});
