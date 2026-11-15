import { expect, test } from '@playwright/test';

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

test('New school year shows the chapter and connects more municipalities', async ({ page }) => {
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

  await expect(page.getByTestId('goal-hud')).toBeVisible();
  await page.getByTestId('tab-prestige').click();
  const count = page.getByTestId('goal-count');
  await expect(count).toContainText('Anslutna kommuner:');
  const before = Number((await count.textContent())!.match(/(\d+) av 290/)![1]);
  await expect(page.getByTestId('goal-next')).toContainText('Nästa läsår: +');
  await expect(page.getByTestId('chapters').locator('h4').first()).toHaveText(/^Läsår 3:/);

  await page.getByTestId('prestige').click();
  await page.getByTestId('confirm-prestige').click();
  const chapter = page.getByTestId('chapter');
  await expect(chapter).toBeVisible();
  await expect(chapter.locator('h3')).toHaveText(/^Läsår 4:/);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'e2e-output/052-chapter.png' });
  // It stays long enough to read, and a tap closes it.
  await page.waitForTimeout(2000);
  await expect(chapter).toBeVisible();
  await page.getByTestId('year-transition').click();
  await expect(page.getByTestId('year-transition')).toHaveCount(0);

  const after = Number((await count.textContent())!.match(/(\d+) av 290/)![1]);
  expect(after).toBeGreaterThan(before);
  await expect(page.getByTestId('chapters').locator('h4').first()).toHaveText(/^Läsår 4:/);
  await page.getByTestId('chapters').locator('summary').click();
  await page.screenshot({ path: 'e2e-output/052-goal.png' });
  expect(errors).toEqual([]);
});
