import { expect, test } from '@playwright/test';

test('settings shows the version and "Nyheter i spelet" lists entries without refactors', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('request', (req) => {
    if (!req.url().startsWith('http://localhost:4173') && !req.url().startsWith('data:')) external.push(req.url());
  });
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/');

  await page.getByTestId('settings').click();
  await expect(page.getByTestId('app-version')).toHaveText(/^Version 1\.\d+/);
  await page.getByTestId('open-changelog').click();
  const dialog = page.getByTestId('changelog-dialog');
  await expect(dialog.getByRole('heading', { name: 'Nyheter i spelet' })).toBeVisible();
  const items = dialog.getByTestId('changelog-entry');
  expect(await items.count()).toBeGreaterThan(0);
  await expect(items.first()).not.toHaveText('');
  await expect(dialog).not.toContainText('Refaktorering');
  await page.screenshot({ path: 'e2e-output/054-changelog-mobile.png' });

  await dialog.getByRole('button', { name: 'Stäng' }).click();
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
