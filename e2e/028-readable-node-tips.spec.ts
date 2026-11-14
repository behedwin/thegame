import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';
const SAVE = JSON.stringify({
  version: 1, kp: '0', runEarned: '1e10', totalEarned: '1e10', merits: '0', meritsEarned: '0',
  upgrades: {}, automations: { csv: 5, nightly: 4, flow: 3, api: 2, sftp: 1, scim: 1 }, meritUpgrades: {},
  prestiges: 0, clicks: 0, timeMs: 0, lastSeenMs: Date.now(), activeEvent: null, nextEventAtMs: 0, buffs: [],
  eventsClaimed: 0, settings: { sound: false, vibration: false },
});

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key!, value!);
      sessionStorage.setItem('seeded', '1');
    }
  }, [KEY, SAVE]);
  await page.goto('/');
  await expect(page.locator('.net-row.shown')).toHaveCount(6);
  await page.waitForTimeout(700); // let the rows settle
  return errors;
}

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test('a tapped system shows a readable tip that never covers the map and stays long enough', async ({ page }) => {
  const errors = await open(page);
  const tip = page.locator('.net-tip');
  await expect(tip).toHaveAttribute('aria-live', 'polite');
  await expect(tip).not.toBeVisible();
  const tabsBefore = await page.locator('.tabs').boundingBox();

  const node = page.locator('.net-row.shown .net-dst').first();
  await node.click();
  await expect(tip).toBeVisible();
  await expect(tip).toHaveText(/^.+: ”.+”$/);
  const box = (await tip.boundingBox())!;
  const fontPx = parseFloat(await tip.evaluate((e) => getComputedStyle(e).fontSize));
  expect(fontPx).toBeGreaterThanOrEqual(13);
  for (const n of await page.locator('.net-row.shown .net-node').all()) {
    expect(overlaps(box, (await n.boundingBox())!)).toBe(false);
  }
  expect(overlaps(box, (await page.getByTestId('hub').boundingBox())!)).toBe(false);
  expect(await page.locator('.tabs').boundingBox()).toEqual(tabsBefore);
  await page.screenshot({ path: 'e2e-output/028-node-tip-mobile.png' });

  await page.waitForTimeout(5000);
  await expect(tip).toBeVisible();

  await node.click();
  await expect(tip).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('another node swaps the text and a tap outside the map closes it', async ({ page }) => {
  const errors = await open(page);
  const tip = page.locator('.net-tip');
  await page.locator('.net-row.shown .net-src').first().click();
  const first = await tip.textContent();
  await page.locator('.net-row.shown .net-dst').last().click();
  await expect(tip).toBeVisible();
  expect(await tip.textContent()).not.toBe(first);
  await page.getByTestId('tab-upgrades').click();
  await expect(tip).not.toBeVisible();
  expect(errors).toEqual([]);
});
