import { expect, test } from '@playwright/test';

const kp = async (page: import('@playwright/test').Page) => Number((await page.getByTestId('kp-value').textContent())!.replace(/\s/g, ''));

test('holding SYNKA repeats about 8 clicks per second and stops on release', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  const hub = page.getByTestId('hub');
  await expect(page.getByTestId('kp-value')).toHaveText('0');

  // A single tap is still exactly one click.
  await hub.click();
  await expect(page.getByTestId('kp-value')).toHaveText('1');

  // Hold for ~1.5 s: the first click is immediate, then repeats at ~8/s.
  const box = (await hub.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  const afterHold = await kp(page);
  expect(afterHold).toBeGreaterThanOrEqual(1 + 6);
  expect(afterHold).toBeLessThanOrEqual(1 + 16);

  // Released: no more clicks arrive.
  await page.waitForTimeout(600);
  expect(await kp(page)).toBe(afterHold);

  // Holding the keyboard key does not exceed the same rate (no auto-repeat flood).
  await hub.focus();
  await page.keyboard.down('Enter');
  await page.waitForTimeout(1000);
  await page.keyboard.up('Enter');
  const afterKey = await kp(page);
  expect(afterKey - afterHold).toBeGreaterThanOrEqual(4);
  expect(afterKey - afterHold).toBeLessThanOrEqual(11);
  await page.waitForTimeout(400);
  expect(await kp(page)).toBe(afterKey);

  await page.screenshot({ path: 'e2e-output/016-hold-to-sync.png', fullPage: true });
  expect(errors).toEqual([]);
});
