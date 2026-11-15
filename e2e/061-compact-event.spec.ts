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
  activeEvent: { id: 'friday-update', expiresAtMs: 1e12 },
  nextEventAtMs: 1e13,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event', 'help'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e13,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(
    ([key, value]) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem(key!, value!);
        sessionStorage.setItem('seeded', '1');
      }
    },
    [KEY, JSON.stringify({ ...save, lastSeenMs: Date.now() })],
  );
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();
  await expect(page.getByTestId('event')).toBeVisible();
  return errors;
}

const scrollList = (page: Page, top: number) =>
  page.locator('.panel').evaluate((e, t) => { e.scrollTop = t; e.dispatchEvent(new Event('scroll')); }, top);

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test(`061: event card sits centred in the compact strip at ${vp.width} px`, async ({ page }) => {
    await page.setViewportSize(vp);
    const errors = await open(page);
    const hero = page.locator('.hero');
    const card = page.getByTestId('event');
    await expect(hero).not.toHaveAttribute('title');

    await scrollList(page, 200);
    await expect(hero).toHaveClass(/compact/);
    await page.waitForTimeout(400); // shrink transition
    await expect(hero).not.toHaveAttribute('title');
    await expect(hero).toHaveAttribute('aria-label', /visa hela kartan/);

    const c = (await card.boundingBox())!;
    const hub = (await page.getByTestId('hub').boundingBox())!;
    const tabs = (await page.locator('.tabs').boundingBox())!;
    const slot = (await page.locator('.event-slot').boundingBox())!;
    expect(c.x).toBeGreaterThanOrEqual(0);
    expect(c.y).toBeGreaterThanOrEqual(0);
    expect(c.x + c.width).toBeLessThanOrEqual(vp.width);
    expect(c.y + c.height).toBeLessThanOrEqual(vp.height);
    expect(overlap(c, hub)).toBe(false);
    expect(overlap(c, tabs)).toBe(false);
    expect(Math.abs(c.x + c.width / 2 - (slot.x + slot.width / 2))).toBeLessThanOrEqual(8);
    await page.screenshot({ path: `e2e-output/061-compact-event-${vp.width}.png` });

    // Back to the big map while the event shows: same card, centred over the map.
    const id = await card.evaluate((e) => ((e as HTMLElement).dataset.k = 'same'));
    await scrollList(page, 0);
    await expect(hero).not.toHaveClass(/compact/);
    await page.waitForTimeout(400);
    expect(await card.evaluate((e) => (e as HTMLElement).dataset.k)).toBe(id);
    const big = (await card.boundingBox())!;
    const heroBox = (await hero.boundingBox())!;
    expect(Math.abs(big.x + big.width / 2 - (heroBox.x + heroBox.width / 2))).toBeLessThanOrEqual(8);
    await expect(hero).not.toHaveAttribute('title');
    await page.screenshot({ path: `e2e-output/061-big-event-${vp.width}.png` });

    // A tap in the strip claims the event.
    await scrollList(page, 200);
    await expect(hero).toHaveClass(/compact/);
    await card.click();
    await expect(card).toHaveCount(0);
    await expect(hero).toHaveClass(/compact/);
    expect(errors).toEqual([]);
  });
}
