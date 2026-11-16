import { expect, test } from '@playwright/test';
test.use({ viewport: { width: 390, height: 844 } });

// 24 of 25 events handled: "Brandkåren" is the nearest locked trophy.
const save = {
  version: 1,
  kp: '100',
  runEarned: '1000',
  totalEarned: '1000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 7,
  timeMs: 60000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 24,
  settings: { sound: false, vibration: false },
};

test('Tapping the nearest trophy scrolls to it in the list and flashes it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');

  await page.getByTestId('tab-achievements').click();
  const nearest = page.getByTestId('achievement-nearest');
  await expect(nearest).toBeVisible();
  await expect(nearest).toHaveAttribute('role', 'button');
  await expect(nearest).toHaveAttribute('tabindex', '0');
  const target = page.getByTestId('achievement-brandkaren');
  await expect(target).toHaveAttribute('data-id', 'brandkaren');

  await nearest.click();
  await expect(target).toHaveClass(/\bflash\b/);
  await expect(target).toBeInViewport();
  await page.screenshot({ path: 'e2e-output/104-trophy-nearest-tap.png' });

  // Keyboard: scroll back to the nearest card, focus the card and press Enter.
  await nearest.scrollIntoViewIfNeeded();
  await expect(target).not.toHaveClass(/\bflash\b/);
  await nearest.focus();
  await page.keyboard.press('Enter');
  await expect(target).toHaveClass(/\bflash\b/);
  await expect(target).toBeInViewport();
  expect(errors).toEqual([]);
});
