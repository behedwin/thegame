import { expect, test } from '@playwright/test';

test('achievements: old save unlocks on load, tab lists them, unlocks persist after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  // A version 1 save (before achievements): 1 CSV, 10 000 clicks, 1 event, 1 school year.
  const save = {
    version: 1,
    kp: '20000',
    runEarned: '20000',
    totalEarned: '20000',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: { csv: 1 },
    meritUpgrades: {},
    prestiges: 1,
    clicks: 10000,
    timeMs: 0,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 1e12,
    buffs: [],
    eventsClaimed: 1,
    settings: { sound: false, vibration: false },
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto('/');

  // Unlocked by the first tick: first CSV, first event, 10 000 clicks, first school year.
  await expect(page.locator('.toast').filter({ hasText: '4 nya troféer' })).toBeVisible();
  const tab = page.getByTestId('tab-achievements');
  await expect(tab).toBeVisible();
  await tab.click();
  await expect(page.getByTestId('achievement-summary')).toContainText('4 av 20 troféer');
  await expect(page.getByTestId('achievement-list').locator('[data-unlocked="true"]')).toHaveCount(4);
  await expect(page.getByTestId('achievement-tiotusen-losenord')).toHaveAttribute('data-unlocked', 'true');
  await expect(page.getByTestId('achievement-musarm')).toHaveAttribute('data-unlocked', 'false');
  await page.screenshot({ path: 'e2e-output/006-achievements.png', fullPage: true });

  await page.waitForTimeout(300);
  await page.reload();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('CapacitorStorage.skolintegratoren.save')!));
  expect(stored.version).toBe(2);
  expect(stored.achievements).toHaveLength(4);
  await page.getByTestId('tab-achievements').click();
  await expect(page.getByTestId('achievement-summary')).toContainText('4 av 20');
  // No new unlocks after reload, so no achievement toast.
  await expect(page.locator('.toast').filter({ hasText: 'troféer!' })).toHaveCount(0);
  expect(errors).toEqual([]);
});
