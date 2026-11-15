import { expect, test } from '@playwright/test';

// 24 of 25 events handled: "Brandkåren" is the nearest locked trophy.
const save = {
  version: 1,
  kp: '100',
  runEarned: '1000',
  totalEarned: '1000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 7,
  timeMs: 60000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 24,
  settings: { sound: false, vibration: false },
};

test('The nearest locked trophy is highlighted at the top', async ({ page }) => {
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

  await page.getByTestId('tab-achievements').click();
  const nearest = page.getByTestId('achievement-nearest');
  await expect(nearest).toBeVisible();
  await expect(nearest).toContainText('Nästan där');
  await expect(nearest).toContainText('Brandkåren');
  await expect(nearest).toContainText('24 av 25');
  await expect(nearest).toHaveAttribute('data-id', 'brandkaren');
  const firstCard = page.getByTestId('achievement-list').locator('.card').first();
  await expect(firstCard).toHaveAttribute('data-testid', 'achievement-nearest');
  await page.screenshot({ path: 'e2e-output/077-trophy-nearest.png' });
  expect(errors).toEqual([]);
});
