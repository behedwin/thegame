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

interface Box { left: number; right: number; top: number; bottom: number; width: number }
const box = (e: Element): Box => {
  const r = e.getBoundingClientRect();
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
};

/** Visible chips of one side in the strip: not hidden, inside the strip, with a filled box and text. */
async function visibleChips(page: Page, side: 'src' | 'dst') {
  const strip = await page.locator('.hero').evaluate(box);
  return page.locator(`.net-row.shown .net-chip.chip-${side}`).evaluateAll((els, s) => els.filter((e) => {
    const cs = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    const rect = e.querySelector('rect')!;
    const text = e.querySelector('text')!;
    const fill = getComputedStyle(rect).fill;
    return cs.visibility !== 'hidden' && Number(cs.opacity) > 0.9 && r.width > 0 &&
      r.left >= s.left && r.right <= s.right && r.top >= s.top && r.bottom <= s.bottom &&
      fill !== 'none' && (text.textContent ?? '').trim().length >= 1 &&
      parseFloat(getComputedStyle(text).fontSize) * (r.height / rect.getBBox().height) >= 10;
  }).length, strip);
}

async function compactFlow(page: Page, name: string): Promise<void> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(save)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();
  await expect(page.locator('.net-node').first()).toBeVisible();

  await scrollList(page, 200);
  await expect(page.locator('.hero')).toHaveClass(/compact/);
  await expect.poll(() => page.locator('.hero').evaluate((e) => e.getBoundingClientRect().height)).toBeLessThanOrEqual(120);
  await page.waitForTimeout(500); // shrink and fade transitions

  await expect.poll(() => visibleChips(page, 'src')).toBeGreaterThanOrEqual(1);
  expect(await visibleChips(page, 'dst')).toBeGreaterThanOrEqual(1);
  expect(await page.locator('.net-row.shown').count()).toBeLessThanOrEqual(3);
  await expect(page.locator('.net-more')).toHaveText('+3');

  // The map fills the strip right of SYNKA: at least 70 % of that width.
  const hub = await page.getByTestId('hub').evaluate(box);
  const strip = await page.locator('.hero').evaluate(box);
  const map = await page.locator('.network').evaluate(box);
  expect(map.width).toBeGreaterThanOrEqual(0.7 * (strip.right - hub.right));
  // Sources sit left of targets.
  const src = await page.locator('.net-row.shown .net-chip.chip-src').first().evaluate(box);
  const dst = await page.locator('.net-row.shown .net-chip.chip-dst').first().evaluate(box);
  expect(src.right).toBeLessThan(dst.left);
  expect(src.left).toBeGreaterThan(hub.right - 4);
  await page.screenshot({ path: `e2e-output/062-${name}.png` });

  // Back to the big map: full nodes, no chips.
  await scrollList(page, 0);
  await expect(page.locator('.hero')).not.toHaveClass(/compact/);
  await expect(page.locator('.net-node').first()).toBeVisible();
  await expect.poll(() => visibleChips(page, 'src')).toBe(0);
  await expect(page.locator('.net-more')).toBeHidden();
  expect(errors).toEqual([]);
}

test('062: the compact strip shows system chips on both sides across its width', async ({ page }) => {
  await compactFlow(page, 'compact-nodes');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('062: chips show in the strip with reduced motion too', async ({ page }) => {
    await compactFlow(page, 'compact-nodes-reduced');
  });
});
