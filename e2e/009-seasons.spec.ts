import { expect, test } from '@playwright/test';

test('season banner shows during Skolavslutning', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.clock.setFixedTime(new Date(2026, 5, 10, 12, 0, 0));
  await page.goto('/');
  const banner = page.getByTestId('season');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute('data-season', 'skolavslutning');
  await expect(banner).toContainText('Skolavslutning');
  await page.screenshot({ path: 'e2e-output/009-season.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('no season banner outside the seasons', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 14, 12, 0, 0));
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();
  await expect(page.getByTestId('season')).toBeHidden();
});
