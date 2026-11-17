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

test('Trophy tab lists locked trophies under "Kvar att ta" before unlocked ones under "Tagna"', async ({ page }) => {
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
  const list = page.getByTestId('achievement-list');
  await expect(page.getByTestId('achievement-group-locked')).toHaveText('Kvar att ta');
  await expect(page.getByTestId('achievement-group-unlocked')).toHaveText(/^Tagna \(\d+\)$/);

  // Nearest first, then all locked cards, then all unlocked cards.
  const order = await list.locator('.card:not(.nearest)').evaluateAll((els) => els.map((e) => e.getAttribute('data-unlocked')));
  expect(order).toContain('true');
  expect(order).toContain('false');
  expect(order.indexOf('true')).toBe(order.lastIndexOf('false') + 1);
  await expect(list.locator('.card').first()).toHaveAttribute('data-testid', 'achievement-nearest');

  // Headings sit right before their group; the taken cards sit in the fold body after "Tagna" (118).
  const sequence = await list.locator('.list > *').evaluateAll((els) =>
    els.map((e) => (e.classList.contains('fold-body') ? 'B' : e.classList.contains('card') ? (e.classList.contains('nearest') ? 'N' : e.getAttribute('data-unlocked') === 'true' ? 'U' : 'L') : e.getAttribute('data-testid'))),
  );
  expect(sequence[0]).toBe('N');
  expect(sequence[1]).toBe('achievement-group-locked');
  expect(sequence[2]).toBe('L');
  const u = sequence.indexOf('achievement-group-unlocked');
  expect(sequence[u - 1]).toBe('L');
  expect(sequence[u + 1]).toBe('B');
  const inBody = await page.getByTestId('achievement-group-unlocked-body').locator('.card').evaluateAll((els) => els.map((e) => e.getAttribute('data-unlocked')));
  expect(inBody.length).toBeGreaterThan(0);
  expect(inBody.every((v) => v === 'true')).toBe(true);

  // Tapping "Nästan där" still finds the right card.
  const target = page.getByTestId('achievement-brandkaren');
  await page.getByTestId('achievement-nearest').click();
  await expect(target).toHaveClass(/\bflash\b/);
  await expect(target).toBeInViewport();
  await page.screenshot({ path: 'e2e-output/113-trophy-groups.png' });
  expect(errors).toEqual([]);
});
