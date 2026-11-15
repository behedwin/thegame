import { expect, test } from '@playwright/test';

test('export, wipe, import: progress is back and survives a reload', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(baseURL!) && !url.startsWith('data:')) external.push(url);
  });
  await page.goto('/');
  const kp = page.getByTestId('kp-value');
  const hub = page.getByTestId('hub');
  for (let i = 0; i < 14; i++) await hub.click();
  await page.getByTestId('tab-upgrades').click();
  await page.getByTestId('buy-coffee').click();
  await expect(kp).toHaveText('4');

  // Export.
  await page.getByTestId('settings').click();
  await page.getByTestId('export-save').click();
  const field = page.getByTestId('save-text');
  await expect(field).toHaveValue(/^SKI1:[A-Za-z0-9+/=]+$/);
  const exported = await field.inputValue();
  await page.screenshot({ path: 'e2e-output/032-export.png' });

  // Wipe everything.
  await page.getByTestId('wipe').click();
  await page.getByTestId('wipe').click();
  await expect(kp).toHaveText('0');

  // Junk is refused and changes nothing.
  await page.getByTestId('settings').click();
  await field.fill('SKI1:trasig');
  await page.getByTestId('import-save').click();
  await expect(page.getByText('Texten är ingen giltig sparning. Inget har ändrats.')).toBeVisible();
  await expect(page.getByTestId('import-save')).toHaveText('Importera sparning');

  // Import needs two presses.
  await field.fill(exported);
  await page.getByTestId('import-save').click();
  await expect(page.getByTestId('import-save')).toContainText('Tryck igen');
  await page.getByTestId('import-save').click();
  await expect(kp).toHaveText('4');
  await page.getByTestId('tab-upgrades').click();
  await expect(page.getByTestId('card-coffee')).toContainText('Nivå 1/10');

  await page.reload();
  await expect(kp).toHaveText('4');
  await page.getByTestId('tab-upgrades').click();
  await expect(page.getByTestId('card-coffee')).toContainText('Nivå 1/10');

  expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
  expect(external, `external requests: ${external.join('\n')}`).toEqual([]);
});
