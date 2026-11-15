import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';

const save = {
  version: 6,
  kp: '100',
  runEarned: '100',
  totalEarned: '100',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 5 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 10,
  timeMs: 125_000,
  activeEvent: null,
  nextEventAtMs: 1e9,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e9,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

/** Packet positions as a string, so any spawn, removal or movement changes it. */
const snapshot = (page: Page) =>
  page.$$eval('.packet', (els) => els.map((e) => `${e.getAttribute('cx')},${e.getAttribute('cy')}`).join('|'));

test('049: packets stand still while the map is out of view and move again when it returns', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.packet').first()).toBeAttached({ timeout: 10_000 });

  // Move the map far out of the viewport, as when it is scrolled away.
  await page.locator('.hero').evaluate((e) => { (e as HTMLElement).style.transform = 'translateY(-5000px)'; });
  await page.waitForTimeout(400);
  const before = await snapshot(page);
  await page.waitForTimeout(1500);
  expect(await snapshot(page)).toBe(before);

  await page.locator('.hero').evaluate((e) => { (e as HTMLElement).style.transform = ''; });
  await expect.poll(() => snapshot(page), { timeout: 5000 }).not.toBe(before);
  expect(errors).toEqual([]);
});
