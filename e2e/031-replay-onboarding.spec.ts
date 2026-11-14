import { expect, test } from '@playwright/test';

test('help → "Visa introduktionen igen" walks every step and ends hidden', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto('/');

  // Turn the tips off, as a returning player might have done.
  const tip = page.getByTestId('tip');
  await page.getByTestId('tip-off').click();
  await expect(tip).toBeHidden();

  await page.getByTestId('settings').click();
  await page.getByTestId('open-help').click();
  await page.getByTestId('help-replay').click();
  await expect(page.getByTestId('help-dialog')).toHaveCount(0);
  await expect(page.getByTestId('settings-dialog')).toHaveCount(0);

  const next = page.getByTestId('tip-next');
  for (const step of ['sync', 'buy', 'event', 'help']) {
    await expect(tip).toBeVisible();
    await expect(tip).toHaveAttribute('data-tip', step);
    await expect(page.getByTestId('tip-off')).toBeHidden();
    if (step === 'sync') {
      await expect(page.getByTestId('hub')).toHaveCSS('outline-style', 'solid');
      await page.screenshot({ path: 'e2e-output/031-tour-mobile.png' });
    }
    if (step === 'help') await expect(next).toHaveText('Klar');
    else await expect(next).toHaveText('Nästa');
    await next.click();
  }
  await expect(tip).toBeHidden();
  await expect(page.getByTestId('hub')).not.toHaveCSS('outline-style', 'solid');

  await page.reload();
  await expect(page.getByTestId('hub')).toBeVisible();
  await expect(tip).toBeHidden();
  expect(errors).toEqual([]);
});

test('× ends the tour at once', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('settings').click();
  await page.getByTestId('open-help').click();
  await page.getByTestId('help-replay').click();
  await expect(page.getByTestId('tip')).toHaveAttribute('data-tip', 'sync');
  await page.getByTestId('tip-close').click();
  // The tour never touched tipsSeen, so a new player's regular SYNKA tip is back.
  await expect(page.getByTestId('tip-next')).toBeHidden();
  await expect(page.getByTestId('tip')).toHaveAttribute('data-tip', 'sync');
});
