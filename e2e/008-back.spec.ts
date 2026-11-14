import { expect, test } from '@playwright/test';

test('back (Escape) closes the open dialog and leaves the game running', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();

  await page.getByTestId('settings').click();
  await expect(page.getByTestId('settings-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('settings-dialog')).toHaveCount(0);

  // No dialog open: back does nothing on the web (on Android it minimizes the app).
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('hub')).toBeVisible();

  // Dialog buttons still work after closing via back.
  await page.getByTestId('settings').click();
  await page.getByTestId('settings-dialog').getByRole('button', { name: 'Stäng' }).click();
  await expect(page.getByTestId('settings-dialog')).toHaveCount(0);

  const userSelect = await page.evaluate(() => getComputedStyle(document.body).userSelect);
  expect(userSelect).toBe('none');
  expect(errors).toEqual([]);
});
