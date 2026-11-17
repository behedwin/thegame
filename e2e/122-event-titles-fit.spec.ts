import { readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// 122: every event card, not just `friday-update` (061), must fit the compact 96 px strip at 360 px.
const KEY = 'CapacitorStorage.skolintegratoren.save';
const EVENTS = readdirSync('src/content/events')
  .filter((f) => f.endsWith('.ts'))
  .map((f) => f.replace(/\.ts$/, ''));

const save = (id: string) => ({
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
  activeEvent: { id, expiresAtMs: 1e12 },
  nextEventAtMs: 1e13,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event', 'help'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e13,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
});

type Box = { x: number; y: number; width: number; height: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

async function open(page: Page, id: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key!, value!),
    [KEY, JSON.stringify({ ...save(id), lastSeenMs: Date.now() })],
  );
  await page.goto('/');
  await expect(page.getByTestId('event')).toBeVisible();
  return errors;
}

test('122: the event list is not empty', () => {
  expect(EVENTS.length).toBeGreaterThan(0);
});

for (const id of EVENTS) {
  test(`122: event "${id}" fits the compact strip at 360 px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const errors = await open(page, id);
    const hero = page.locator('.hero');
    const card = page.getByTestId('event');
    await page.locator('.panel').evaluate((e) => { e.scrollTop = 200; e.dispatchEvent(new Event('scroll')); });
    await expect(hero).toHaveClass(/compact/);
    await page.waitForTimeout(400); // shrink transition

    const c = (await card.boundingBox())!;
    const strip = (await hero.boundingBox())!;
    const tabs = (await page.locator('.tabs').boundingBox())!;
    expect(strip.height).toBeLessThanOrEqual(96.5);
    expect(c.y).toBeGreaterThanOrEqual(strip.y - 0.5);
    expect(c.y + c.height).toBeLessThanOrEqual(strip.y + strip.height + 0.5);
    expect(c.x).toBeGreaterThanOrEqual(0);
    expect(c.x + c.width).toBeLessThanOrEqual(360);
    expect(overlap(c, tabs)).toBe(false);

    const lines = await card.locator('strong').evaluate((e) => {
      const lh = parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.2;
      return Math.round(e.getBoundingClientRect().height / lh);
    });
    expect(lines, `title of "${id}" wraps to ${lines} lines`).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `e2e-output/122-event-${id}.png` });
    expect(errors).toEqual([]);
  });
}
