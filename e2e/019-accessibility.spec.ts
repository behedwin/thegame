import { expect, test } from '@playwright/test';

test('screen reader roles and labels are in place', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByRole('tablist')).toBeVisible();
  await expect(page.getByTestId('tab-automations')).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('tab-upgrades')).toHaveAttribute('aria-selected', 'false');
  await page.getByTestId('tab-upgrades').click();
  await expect(page.getByTestId('tab-upgrades')).toHaveAttribute('aria-selected', 'true');
  await page.getByTestId('tab-automations').click();
  for (let i = 0; i < 12; i++) await page.getByTestId('hub').click();
  const buy = page.locator('.buy').first();
  await expect(buy).toHaveAttribute('aria-label', /^Köp .+: .+KP$/);
  await expect(page.getByRole('button', { name: 'Synka data manuellt' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion: no animations and no visible travelling packets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (let i = 0; i < 5; i++) await page.getByTestId('hub').click();
  await page.waitForTimeout(200);
  await expect(page.locator('.packet').first()).toBeHidden();
  const dur = await page.getByTestId('hub').evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(dur)).toBeLessThan(0.01);
});

test('larger text: the layout scales and never scrolls sideways', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 12; i++) await page.getByTestId('hub').click();
  const base = await page.locator('.card-title').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const big = await page.locator('.card-title').first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(big).toBeCloseTo(base * 2, 0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.screenshot({ path: 'e2e-output/019-large-text.png' });
});
