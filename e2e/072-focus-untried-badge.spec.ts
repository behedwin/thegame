import { expect, test } from '@playwright/test';

// School year 3 close to a new school year; "cloud" has been played a whole school year.
const save = {
  version: 13,
  kp: '1e12',
  runEarned: '4000000000',
  totalEarned: '4000000000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 5 },
  meritUpgrades: {},
  prestiges: 2,
  clicks: 100,
  timeMs: 600000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 0,
  focus: 'normal',
  focusesPlayed: ['cloud'],
  settings: { sound: false, vibration: false },
};

test('The focus picker marks the focuses that have not been tried yet', async ({ page }) => {
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
  await page.getByTestId('confirm-prestige').click();
  await page.getByTestId('year-transition').click();
  const picker = page.getByTestId('focus-dialog');
  await expect(picker).toBeVisible();
  await expect(picker.locator('.focus-opt')).toHaveCount(4);
  await expect(page.getByTestId('focus-normal').getByTestId('focus-untried')).toHaveCount(0);
  await expect(page.getByTestId('focus-cloud').getByTestId('focus-untried')).toHaveCount(0);
  await expect(page.getByTestId('focus-budget').getByTestId('focus-untried')).toHaveText('Inte provad');
  await expect(picker.getByTestId('focus-untried')).toHaveCount(2);
  await page.screenshot({ path: 'e2e-output/072-focus-untried.png' });
  await page.getByTestId('focus-budget').click();
  await expect(picker).toHaveCount(0);
  expect(errors).toEqual([]);
});
