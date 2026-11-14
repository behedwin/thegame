import { expect, test } from '@playwright/test';

const MAX_FX = 40;

function watchErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

test('30 fast taps give particles and a ripple, never more effect nodes than the cap', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  const hub = page.getByTestId('hub');
  const layer = page.locator('.float-layer');
  let maxNodes = 0;
  let sawParticles = false;
  for (let i = 0; i < 30; i++) {
    await hub.click({ delay: 0 });
    const n = await layer.evaluate((el) => el.childElementCount);
    maxNodes = Math.max(maxNodes, n);
    if (i === 12) {
      sawParticles = (await page.locator('.fx-p').count()) > 0;
      await page.screenshot({ path: 'e2e-output/024-burst.png' });
    }
  }
  expect(sawParticles).toBe(true);
  expect(await page.locator('.fx-ring').count()).toBeGreaterThan(0);
  expect(maxNodes).toBeLessThanOrEqual(MAX_FX);
  // The counter rolls up and settles on the exact value.
  await expect(page.getByTestId('kp-value')).toHaveText('30');
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('taps create no particles, rings or packets, and the counter switches at once', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/');
    const hub = page.getByTestId('hub');
    for (let i = 0; i < 10; i++) await hub.click({ delay: 0 });
    expect(await page.locator('.fx-p, .fx-ring').count()).toBe(0);
    expect(await page.locator('.packet.manual').count()).toBe(0);
    expect(await page.getByTestId('kp-value').textContent()).toBe('10');
    expect(errors).toEqual([]);
  });
});
