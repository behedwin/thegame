import { expect, test } from '@playwright/test';

test('web build shows no notification toggles and hiding the page causes no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();

  await page.getByTestId('settings').click();
  await expect(page.getByTestId('volume')).toBeVisible();
  await expect(page.getByTestId('notifyOfflineCap')).toHaveCount(0);
  await expect(page.getByTestId('notifySeason')).toHaveCount(0);
  await page.screenshot({ path: 'e2e-output/014-settings-web.png' });
  await page.getByTestId('settings-dialog').getByRole('button', { name: 'Stäng' }).click();

  // Hide and show: scheduling/cancelling must be a silent no-op on the web.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(300);
  await expect(page.getByTestId('hub')).toBeVisible();
  expect(errors).toEqual([]);
});
