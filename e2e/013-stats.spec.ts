import { expect, test } from '@playwright/test';

test('stats page shows lifetime numbers from the save', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const save = {
    version: 3,
    kp: '10',
    runEarned: '10',
    totalEarned: '123456',
    merits: '2',
    meritsEarned: '4',
    upgrades: {},
    automations: {},
    meritUpgrades: {},
    prestiges: 2,
    clicks: 321,
    timeMs: 3_900_000,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 1e12,
    buffs: [],
    eventsClaimed: 7,
    achievements: [],
    settings: { sound: false, vibration: false, volume: 0.5 },
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto('/');

  await page.getByTestId('settings').click();
  await page.getByTestId('open-stats').click();
  const list = page.getByTestId('stat-list');
  await expect(list).toContainText('Totalt intjänat');
  await expect(list).toContainText('Manuella synkningar321');
  await expect(list).toContainText('Lösta händelser7');
  await expect(list).toContainText('Läsår3');
  await expect(list).toContainText('Tid spelat1 h 5 min');
  await page.screenshot({ path: 'e2e-output/013-stats.png', fullPage: true });
  await page.getByTestId('stats-dialog').getByRole('button', { name: 'Stäng' }).click();
  await expect(page.getByTestId('stats-dialog')).toHaveCount(0);
  await expect(page.getByTestId('settings-dialog')).toHaveCount(1);
  expect(errors).toEqual([]);
});
