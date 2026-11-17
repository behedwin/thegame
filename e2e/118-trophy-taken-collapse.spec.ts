import { expect, test } from '@playwright/test';
test.use({ viewport: { width: 390, height: 844 } });

// Old save that unlocks some trophies on load (first CSV, events, clicks, school year),
// while "Brandkåren" (24 of 25 events) stays the nearest locked one.
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
  prestiges: 1,
  clicks: 10000,
  timeMs: 60000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 24,
  settings: { sound: false, vibration: false },
};

test('The "Tagna" group starts collapsed and toggles open and closed', async ({ page }) => {
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
  const toggle = page.getByTestId('achievement-group-unlocked');
  const taken = page.locator('[data-testid="achievement-list"] .card[data-unlocked="true"]');
  const n = await taken.count();
  expect(n).toBeGreaterThan(0);

  // Collapsed by default, with the count in the heading.
  await expect(toggle).toHaveText(`Tagna (${n})`);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveJSProperty('tagName', 'BUTTON');
  await expect(taken.first()).toBeHidden();
  await expect(page.getByTestId('achievement-progress-brandkaren')).toBeVisible();

  // Open, then wait for a rebuild (counter ticks) and check it stays open.
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(taken.first()).toBeVisible();
  await page.screenshot({ path: 'e2e-output/118-trophy-taken-open.png' });

  // Close again.
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(taken.first()).toBeHidden();

  // "Nästan där" still finds its card.
  const target = page.getByTestId('achievement-brandkaren');
  await page.getByTestId('achievement-nearest').click();
  await expect(target).toHaveClass(/\bflash\b/);
  await expect(target).toBeInViewport();
  await page.screenshot({ path: 'e2e-output/118-trophy-taken-collapse.png' });
  expect(errors).toEqual([]);
});

test('The open state survives a rebuild of the list', async ({ page }) => {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');
  await page.getByTestId('tab-achievements').click();
  const toggle = page.getByTestId('achievement-group-unlocked');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  // A click changes the "Musarm" counter, which rebuilds the list.
  const musarm = page.getByTestId('achievement-progress-musarm');
  const label = await musarm.textContent();
  await page.getByTestId('hub').click();
  await expect(musarm).not.toHaveText(label ?? '');
  await expect(page.getByTestId('achievement-group-unlocked')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-testid="achievement-list"] .card[data-unlocked="true"]').first()).toBeVisible();
});
