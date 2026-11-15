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
  automations: { csv: 20, sftp: 15, nightly: 10, api: 8, flow: 5 },
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

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();
  return errors;
}

const scrollList = (page: Page, top: number) => page.locator('.panel').evaluate((e, t) => { e.scrollTop = t; e.dispatchEvent(new Event('scroll')); }, top);

test('059: click effects in the compact strip are not clipped and stay off SYNKA', async ({ page }) => {
  const errors = await open(page);
  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await expect.poll(() => page.locator('.hero').evaluate((e) => e.getBoundingClientRect().height)).toBeLessThanOrEqual(120);
  await page.waitForTimeout(300); // let the shrink transition finish

  expect(await page.locator('.float-layer').evaluate((e) => getComputedStyle(e).overflow)).toBe('visible');

  // No empty node boxes: the nodes are hidden in the strip.
  const visibleNodes = await page.locator('.net-node').evaluateAll((els) => els.filter((e) => getComputedStyle(e).visibility !== 'hidden').length);
  expect(visibleNodes).toBe(0);

  const hub = page.getByTestId('hub');
  for (let i = 0; i < 5; i++) await hub.click({ delay: 10 });
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  const count = await page.locator('.float-num').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(3);
  await page.screenshot({ path: 'e2e-output/059-compact-clicks.png' });

  await page.waitForTimeout(150);
  const hubBox = (await hub.boundingBox())!;
  const overlaps = await page.locator('.float-num').evaluateAll((els, h) => els.filter((e) => {
    const r = e.getBoundingClientRect();
    return r.left < h.x + h.width && r.right > h.x && r.top < h.y + h.height && r.bottom > h.y;
  }).length, hubBox);
  expect(overlaps).toBe(0);
  const vw = 390;
  const inside = await page.locator('.float-num').evaluateAll((els, w) => els.every((e) => {
    const r = e.getBoundingClientRect();
    return r.left >= 0 && r.right <= w;
  }), vw);
  expect(inside).toBe(true);

  // Big map looks as before: numbers centred on the tap, nodes visible.
  await scrollList(page, 0);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  await expect(page.locator('.net-node').first()).toBeVisible();
  expect(await page.locator('.float-layer').evaluate((e) => getComputedStyle(e).overflow)).toBe('hidden');
  await hub.click();
  await expect(page.locator('.float-num:not(.compact)').first()).toBeAttached();
  expect(errors).toEqual([]);
});
