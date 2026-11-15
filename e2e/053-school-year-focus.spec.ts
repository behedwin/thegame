import { expect, test } from '@playwright/test';

// School year 3, close to a new school year.
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
  prestiges: 2,
  clicks: 100,
  timeMs: 600000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 0,
  settings: { sound: false, vibration: false },
};

test('New school year lets the player pick a focus that changes prices and is saved', async ({ page }) => {
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
  await expect(page.getByTestId('focus-hud')).toBeHidden();

  await page.getByTestId('tab-prestige').click();
  await page.getByTestId('prestige').click();
  await page.getByTestId('confirm-prestige').click();
  await page.getByTestId('year-transition').click();
  const picker = page.getByTestId('focus-dialog');
  await expect(picker).toBeVisible();
  // School year 4: the default, two from year 2 and one from year 4.
  await expect(picker.locator('.focus-opt')).toHaveCount(4);
  await page.screenshot({ path: 'e2e-output/053-focus-picker.png' });
  await page.getByTestId('focus-budget').click();
  await expect(picker).toHaveCount(0);

  const chip = page.getByTestId('focus-hud');
  await expect(chip).toHaveText('Budgetår');
  await page.getByTestId('tab-automations').click();
  // A few syncs reveal the first integration again.
  for (let i = 0; i < 8; i++) await page.getByTestId('hub').click();
  // 15 KP × 0.7, rounded up.
  await expect(page.getByTestId('buy-csv')).toContainText('11 KP');

  await chip.click();
  const info = page.getByTestId('focus-info');
  await expect(info).toContainText('Alla priser ×0,7');
  await expect(info).toContainText('+15 % Meriter');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'e2e-output/053-focus-info.png' });
  await info.getByRole('button').click();

  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('focus-hud')).toHaveText('Budgetår');
  await expect(page.getByTestId('buy-csv')).toContainText('11 KP');
  expect(errors).toEqual([]);
});
