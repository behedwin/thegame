import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';

const save = {
  version: 6,
  kp: '1e9',
  runEarned: '1e9',
  totalEarned: '1e9',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 47, sftp: 30, nightly: 10, api: 8, flow: 5 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 50,
  timeMs: 900_000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 1e12,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event', 'help'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e12,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

test.use({ viewport: { width: 390, height: 844 } });

test('058: shop cards are compact, expand on tap and still buy', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  const card = page.getByTestId('card-sftp');
  await expect(card).toBeVisible();

  const height = () => card.evaluate((e) => e.getBoundingClientRect().height);
  const collapsed = await height();
  expect(collapsed).toBeLessThanOrEqual(88);
  for (const c of await page.locator('.list .shop-card').all()) expect(await c.evaluate((e) => e.getBoundingClientRect().height)).toBeLessThanOrEqual(88);

  // Near a milestone (csv 47 → 50) the quote shows; far from one (sftp 30 → 50) it does not.
  await expect(page.getByTestId('milestone-csv')).toBeVisible();
  await expect(page.getByTestId('milestone-sftp')).toBeHidden();

  // A tap on the text expands the description, another collapses it.
  const info = page.getByTestId('info-sftp');
  await expect(info).toHaveAttribute('aria-expanded', 'false');
  await info.click();
  await expect(info).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(height).toBeGreaterThan(collapsed);
  await page.screenshot({ path: 'e2e-output/058-expanded.png' });
  await info.click();
  await expect(info).toHaveAttribute('aria-expanded', 'false');
  await expect.poll(height).toBeLessThanOrEqual(88);

  // Buying still works, and a purchase briefly shows the milestone quote.
  await expect(card.locator('.card-level')).toHaveText(/30/);
  await page.getByTestId('buy-sftp').click();
  await expect(card.locator('.card-level')).toHaveText(/31/);
  await expect(page.getByTestId('milestone-sftp')).toBeVisible();
  await expect(info).toHaveAttribute('aria-expanded', 'false');
  await page.screenshot({ path: 'e2e-output/058-compact.png' });
  expect(errors).toEqual([]);
});
