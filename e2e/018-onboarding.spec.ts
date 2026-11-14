import { expect, test } from '@playwright/test';

test('onboarding tips guide a new player and never come back once closed', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  const tip = page.getByTestId('tip');
  await expect(tip).toBeVisible();
  await expect(tip).toHaveAttribute('data-tip', 'sync');
  await expect(page.getByTestId('tip-text')).toContainText('SYNKA');
  await page.screenshot({ path: 'e2e-output/018-tip-sync.png' });

  // The first sync finishes the SYNKA tip and brings up the buy tip.
  await page.getByTestId('hub').click();
  await expect(tip).toHaveAttribute('data-tip', 'buy');
  await expect(page.getByTestId('tip-text')).toContainText('integration');

  // Closing it hides it, also after a reload.
  await page.getByTestId('tip-close').click();
  await expect(tip).toBeHidden();
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('kp-value')).toHaveText('1');
  await expect(tip).toBeHidden();
  expect(errors).toEqual([]);
});

test('"Inga fler tips" turns tips off, and the setting shows it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('tip')).toBeVisible();
  await page.getByTestId('tip-off').click();
  await expect(page.getByTestId('tip')).toBeHidden();
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('hub')).toBeVisible();
  await page.getByTestId('hub').click();
  await expect(page.getByTestId('tip')).toBeHidden();
  await page.getByTestId('settings').click();
  await expect(page.getByTestId('toggle-tips')).toHaveAttribute('aria-pressed', 'false');
});
