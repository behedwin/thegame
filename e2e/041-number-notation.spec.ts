import { expect, test } from '@playwright/test';

test('number notation can be switched in settings and survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  // A v7 save (before this setting existed) with a balance above one million, so the modes differ.
  const save = {
    version: 7, kp: '1234567', runEarned: '1234567', totalEarned: '1234567', merits: '0', meritsEarned: '0',
    upgrades: {}, automations: {}, meritUpgrades: {}, prestiges: 0, clicks: 5, timeMs: 60_000, lastSeenMs: Date.now(),
    activeEvent: null, nextEventAtMs: 1e12, buffs: [], eventsClaimed: 0, achievements: [], tipsSeen: ['sync', 'buy', 'event'],
    settings: { sound: false, vibration: false, volume: 0.5, tips: false },
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();
  await expect(page.getByTestId('kp-value')).toContainText('M');

  await page.getByTestId('settings').click();
  const toggle = page.getByTestId('toggle-sciNotation');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('settings-dialog').getByRole('button', { name: 'Stäng' }).click();
  await expect(page.getByTestId('kp-value')).toContainText('e6');

  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('hub')).toBeVisible();
  await expect(page.getByTestId('kp-value')).toContainText('e6');
  await page.getByTestId('settings').click();
  await expect(page.getByTestId('toggle-sciNotation')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: 'e2e-output/041-number-notation.png' });
  expect(errors).toEqual([]);
});
