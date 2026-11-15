import { expect, test } from '@playwright/test';

// One event handled and the first CSV integration bought: "Mötet som kunde varit ett mejl" is taken,
// the 25-event trophy is not.
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
  eventsClaimed: 3,
  settings: { sound: false, vibration: false },
};

test('Locked trophies show progress, taken ones do not', async ({ page }) => {
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
  await expect(page.getByTestId('achievement-progress-brandkaren')).toHaveText('3 av 25');
  await expect(page.getByTestId('achievement-progress-musarm')).toHaveText(/^\d+\s?\d* av 25\s000$/);
  const taken = page.getByTestId('achievement-motet-mejl');
  await expect(taken).toHaveAttribute('data-unlocked', 'true');
  await expect(taken).toContainText('Klar');
  await expect(page.getByTestId('achievement-progress-motet-mejl')).toHaveCount(0);
  await expect(page.getByTestId('achievement-progress-datasjon')).toHaveText('');
  await page.getByTestId('achievement-brandkaren').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'e2e-output/067-trophy-progress.png' });
  expect(errors).toEqual([]);
});
