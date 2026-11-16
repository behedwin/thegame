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

async function tierFlow(page: Page, name: string): Promise<void> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();

  const label = page.getByTestId('hub-tier');
  // Big map: the label is hidden.
  await expect(label).toBeHidden();

  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await page.waitForTimeout(500); // shrink transition
  await expect(label).toBeVisible();

  const tier = Number(await page.locator('svg.network').getAttribute('data-tier'));
  expect(tier).toBeGreaterThanOrEqual(0);
  await expect(label).toHaveText(TIERS[tier]!);

  // Inside the strip, not under SYNKA, readable and not cut off.
  const fit = await label.evaluate((e) => {
    const r = e.getBoundingClientRect();
    const s = e.closest('.hero')!.getBoundingClientRect();
    const hub = document.querySelector('[data-testid="hub"]')!.getBoundingClientRect();
    const slot = document.querySelector('.event-slot')!.getBoundingClientRect();
    return {
      inside: r.left >= s.left && r.right <= s.right && r.top >= s.top && r.bottom <= s.bottom + 0.5,
      belowHub: r.top >= hub.bottom - 1,
      leftOfSlot: r.right <= slot.left + 1,
      notClipped: e.scrollWidth <= e.clientWidth + 1,
      font: parseFloat(getComputedStyle(e).fontSize),
    };
  });
  expect(fit).toEqual({ inside: true, belowHub: true, leftOfSlot: true, notClipped: true, font: fit.font });
  expect(fit.font).toBeGreaterThanOrEqual(9);
  await page.screenshot({ path: `e2e-output/084-${name}.png` });

  // Back to the big map: hidden again.
  await scrollList(page, 0);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  await expect(label).toBeHidden();
  expect(errors).toEqual([]);
}

test.describe('390 wide', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('084: the compact strip shows the hub tier name', async ({ page }) => {
    await tierFlow(page, 'compact-tier-390');
  });
});

test.describe('360 wide', () => {
  test.use({ viewport: { width: 360, height: 740 } });
  test('084: the hub tier fits the strip at 360 px', async ({ page }) => {
    await tierFlow(page, 'compact-tier-360');
  });
});
