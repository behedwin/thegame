import { expect, test } from '@playwright/test';

test('settings → help shows every section, they expand, and the dialog closes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/');

  await page.getByTestId('settings').click();
  await page.getByTestId('open-help').click();
  const dialog = page.getByTestId('help-dialog');
  await expect(dialog.getByRole('heading', { name: 'Så spelar du' })).toBeVisible();
  const summaries = dialog.locator('summary');
  expect(await summaries.count()).toBeGreaterThanOrEqual(6);
  for (const t of ['Grunderna', 'Milstolpar', 'Nytt läsår och Meriter', 'När du är borta']) {
    await expect(summaries.filter({ hasText: t })).toHaveCount(1);
  }
  // The first section starts open, the others closed.
  await expect(dialog.locator('details').first()).toHaveAttribute('open', '');
  const milestones = page.getByTestId('help-milstolpar');
  await expect(milestones).not.toHaveAttribute('open', '');
  await milestones.locator('summary').click();
  await expect(milestones).toHaveAttribute('open', '');
  await expect(milestones.locator('p')).toContainText('25, 50, 100 och 250');
  await page.screenshot({ path: 'e2e-output/029-help-mobile.png' });

  await dialog.getByRole('button', { name: 'Stäng' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('settings-dialog')).toHaveCount(1);
  expect(errors).toEqual([]);
});
