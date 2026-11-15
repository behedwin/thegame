import { expect, test } from '@playwright/test';

// A first school year close to its end, with a few integrations and no earlier best year.
const save = {
  version: 1,
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
  eventsClaimed: 0,
  settings: { sound: false, vibration: false },
};

test('The new school year dialog looks back on the year, and the look back is gone after reload', async ({ page }) => {
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
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Läsåret som gick');
  await expect(summary).toContainText('KP intjänat');
  await expect(summary).toContainText('5 integrationer i drift');
  await expect(summary).toContainText('Meriter att hämta ut');
  await expect(page.getByTestId('year-summary-best')).toHaveText('Ditt bästa läsår hittills!');
  await page.screenshot({ path: 'e2e-output/063-prestige-summary.png' });

  await page.getByTestId('confirm-prestige').click();
  await expect(summary).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('year-summary')).toHaveCount(0);
  expect(errors).toEqual([]);
});
