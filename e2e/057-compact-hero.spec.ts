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

const heroHeight = (page: Page) => page.locator('.hero').evaluate((e) => e.getBoundingClientRect().height);
const scrollList = (page: Page, top: number) => page.locator('.panel').evaluate((e, t) => { e.scrollTop = t; e.dispatchEvent(new Event('scroll')); }, top);

/** SYNKA still earns KP: each tap shows a flying "+KP" number in the map. */
async function syncWorks(page: Page): Promise<void> {
  await page.locator('.float-num').evaluateAll((els) => els.forEach((e) => e.remove()));
  await page.getByTestId('hub').click();
  await expect(page.locator('.float-num').first()).toBeAttached();
}

async function flow(page: Page, name: string): Promise<void> {
  const errors = await open(page);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  await expect(page.locator('.net-node').first()).toBeVisible();
  await syncWorks(page);
  await page.screenshot({ path: `e2e-output/057-${name}-big.png` });

  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await expect.poll(() => heroHeight(page)).toBeLessThanOrEqual(120);
  const vh = 844;
  const panel = await page.locator('.panel').evaluate((e) => e.getBoundingClientRect().height);
  expect(panel).toBeGreaterThanOrEqual(vh * 0.5);
  const fullyVisible = await page.locator('.panel').evaluate((p) => {
    const box = p.getBoundingClientRect();
    return [...p.querySelectorAll('.card')].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.top >= box.top && r.bottom <= box.bottom;
    }).length;
  });
  expect(fullyVisible).toBeGreaterThanOrEqual(3);
  const hub = await page.getByTestId('hub').boundingBox();
  expect(hub!.width).toBeGreaterThanOrEqual(64);
  expect(hub!.height).toBeGreaterThanOrEqual(64);
  await expect(page.getByTestId('hub')).toBeInViewport();
  await syncWorks(page);
  await expect(page.locator('.hero')).toHaveClass(/compact/); // tapping SYNKA does not expand the map
  await page.screenshot({ path: `e2e-output/057-${name}-compact.png` });

  await scrollList(page, 0);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  await expect.poll(() => heroHeight(page)).toBeGreaterThan(150);

  // Tapping the strip (beside SYNKA) expands the map and scrolls the list back up.
  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await expect.poll(() => heroHeight(page)).toBeLessThanOrEqual(120);
  const box = (await page.locator('.hero').boundingBox())!;
  await page.mouse.click(box.x + box.width - 20, box.y + box.height - 10);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  expect(await page.locator('.panel').evaluate((e) => e.scrollTop)).toBe(0);
  expect(errors).toEqual([]);
}

test('057: the map shrinks to a strip while the shop is scrolled and grows back at the top', async ({ page }) => {
  await flow(page, 'motion');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('057: the same flow works with reduced motion', async ({ page }) => {
    await flow(page, 'reduced');
  });
});
