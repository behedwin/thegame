import { expect, test } from '@playwright/test';

test('tapping a system on the network map shows its parody tagline', async ({ page }) => {
  const save = {
    version: 1,
    kp: '0',
    runEarned: '1e7',
    totalEarned: '1e7',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: { csv: 3, nightly: 2, flow: 1 },
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
  await expect(page.locator('.net-row.shown')).toHaveCount(3);
  const tip = page.locator('.net-tip');
  await expect(tip).toHaveCSS('opacity', '0');

  const node = page.locator('.net-row.shown .net-dst').first();
  await node.click();
  await expect(tip).toHaveText(/^.+: ”.+”$/);
  await expect(tip).toHaveCSS('opacity', '1');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'e2e-output/023-network-tagline.png' });

  // The game itself still works after tapping the map.
  await page.getByTestId('tab-automations').click();
  await expect(page.getByTestId('card-csv')).toBeVisible();
  expect(errors).toEqual([]);
});
