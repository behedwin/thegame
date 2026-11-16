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
  automations: { csv: 20, sftp: 15, nightly: 10, api: 8, flow: 5, schedexport: 2 },
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

const scrollList = (page: Page, top: number) => page.locator('.panel').evaluate((e, t) => { e.scrollTop = t; e.dispatchEvent(new Event('scroll')); }, top);

test.use({ viewport: { width: 390, height: 844 } });

test('092: a meter under the tier name shows progress toward the next tier', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();

  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await page.waitForTimeout(500); // shrink transition
  const label = page.getByTestId('hub-tier');
  await expect(label).toBeVisible();
  const progress = Number(await label.evaluate((e) => (e as HTMLElement).style.getPropertyValue('--tier-progress')));
  expect(progress).toBeGreaterThan(0);
  expect(progress).toBeLessThan(1);
  const meter = await label.evaluate((e) => {
    const s = getComputedStyle(e, '::after');
    return { width: parseFloat(s.width), height: parseFloat(s.height), full: e.clientWidth - 16, shown: s.display !== 'none' && s.content !== 'none' };
  });
  expect(meter.shown).toBe(true);
  expect(meter.height).toBeGreaterThan(0);
  expect(meter.width).toBeGreaterThan(0);
  expect(meter.width).toBeLessThan(meter.full);
  await page.screenshot({ path: 'e2e-output/092-hub-tier-progress.png' });
  expect(errors).toEqual([]);
});
