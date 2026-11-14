import { expect, test } from '@playwright/test';

test('volume slider is shown in settings and the value survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();

  await page.getByTestId('settings').click();
  const slider = page.getByTestId('volume');
  await expect(slider).toBeVisible();
  await expect(slider).toHaveValue('70');
  await slider.fill('25');
  await page.getByTestId('settings-dialog').getByRole('button', { name: 'Stäng' }).click();

  // Backgrounding must not break anything (sound is ducked, not stopped).
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('hub')).toBeVisible();
  await page.getByTestId('settings').click();
  await expect(page.getByTestId('volume')).toHaveValue('25');
  await page.screenshot({ path: 'e2e-output/011-volume.png' });
  expect(errors).toEqual([]);
});
