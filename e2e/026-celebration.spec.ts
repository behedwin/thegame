import { expect, test, type Page } from '@playwright/test';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

async function seed(page: Page): Promise<void> {
  const save = {
    version: 1,
    kp: '1e12',
    runEarned: '4000000000',
    totalEarned: '4000000000',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: { csv: 24 },
    meritUpgrades: {},
    prestiges: 1,
    clicks: 100,
    timeMs: 600000,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 10_000_000,
    buffs: [],
    eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  };
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
}

test('milestone 25 fires confetti that disappears, and New school year can be skipped', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page);
  await page.goto('/');
  await page.getByTestId('buy-csv').click();
  await expect(page.getByTestId('confetti')).toBeVisible();
  await expect(page.getByTestId('card-csv').locator('.stamp')).toHaveText('×2');
  await page.screenshot({ path: 'e2e-output/026-milestone.png' });
  await expect(page.getByTestId('confetti')).toHaveCount(0, { timeout: 3000 });

  await page.getByTestId('tab-prestige').click();
  await page.getByTestId('prestige').click();
  await page.getByTestId('confirm-prestige').click();
  const overlay = page.getByTestId('year-transition');
  await expect(overlay).toBeVisible();
  await page.screenshot({ path: 'e2e-output/026-new-year.png' });
  await overlay.click();
  await expect(overlay).toHaveCount(0);
  await expect(page.locator('.toast').last()).toContainText('Nytt läsår!');
  // The focus picker (053) opens under the transition; pick a normal school year.
  await page.getByTestId('focus-normal').click();
  // The game is playable afterwards.
  await page.getByTestId('hub').click();
  await expect(page.getByTestId('kp-value')).not.toHaveText('0');
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('milestone gives no confetti but still stamps; New school year closes by itself', async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page);
    await page.goto('/');
    await page.getByTestId('buy-csv').click();
    await expect(page.getByTestId('card-csv').locator('.stamp')).toBeAttached();
    expect(await page.getByTestId('confetti').count()).toBe(0);
    await page.getByTestId('tab-prestige').click();
    await page.getByTestId('prestige').click();
    await page.getByTestId('confirm-prestige').click();
    await expect(page.getByTestId('year-transition')).toBeVisible();
    // With a story chapter (052) the transition stays ~7 s so the chapter can be read.
    await expect(page.getByTestId('year-transition')).toHaveCount(0, { timeout: 9000 });
    await expect(page.locator('.hero.reset')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
