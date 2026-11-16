import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';
// Mirrors T.hubTiers in src/content/texts.ts.
const TIERS = ['Skolnav', 'Kommunnav', 'Regionnav', 'Nationellt nav', 'Datahjärta'];

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
// Mirrors nextHubTierKps (087), formatted like fmt() below a million.
const NEXT = ['10', '1\u00a0000', '100\u00a0000'];

test.use({ viewport: { width: 390, height: 844 } });

test('087: the hub tells what the next tier needs', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();

  const tier = Number(await page.locator('svg.network').getAttribute('data-tier'));
  expect(tier).toBeGreaterThanOrEqual(0);
  expect(tier).toBeLessThan(3); // this save stays well below 10 M KP/s
  const info = `${TIERS[tier]} – nästa: ${TIERS[tier + 1]} vid ${NEXT[tier]} KP/s`;
  await expect(page.getByTestId('hub')).toHaveAttribute('aria-label', `Synka data manuellt. ${info}`);

  // In the strip, a tap on the tier name shows the tip and keeps the strip.
  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await page.waitForTimeout(500); // shrink transition
  const label = page.getByTestId('hub-tier');
  await expect(label).toHaveText(TIERS[tier]!);
  const box = (await label.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator('.toasts')).toContainText(info);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await page.screenshot({ path: 'e2e-output/087-hub-tier-next.png' });
  expect(errors).toEqual([]);
});
