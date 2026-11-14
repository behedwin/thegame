import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';

function save(automations: Record<string, number>): string {
  return JSON.stringify({
    version: 1, kp: '0', runEarned: '1e10', totalEarned: '1e10', merits: '0', meritsEarned: '0',
    upgrades: {}, automations, meritUpgrades: {}, prestiges: 0, clicks: 0, timeMs: 0,
    lastSeenMs: Date.now(), activeEvent: null, nextEventAtMs: 0, buffs: [], eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  });
}

async function open(page: Page, automations: Record<string, number>): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key!, value!);
      sessionStorage.setItem('seeded', '1');
    }
  }, [KEY, save(automations)]);
  await page.goto('/');
  return errors;
}

const BIG = { csv: 120, nightly: 90, flow: 60, api: 40, sftp: 25, scim: 10 };

test('active lines carry data packets, within the cap, and the hub shows its tier', async ({ page }) => {
  const errors = await open(page, BIG);
  await expect(page.locator('.net-row.shown')).toHaveCount(6);
  await expect(page.locator('svg.network circle.packet:not(.manual)').first()).toBeAttached();
  await page.waitForTimeout(2500);
  const n = await page.locator('svg.network circle.packet').count();
  expect(n).toBeGreaterThan(3);
  expect(n).toBeLessThanOrEqual(60);
  const tier = Number(await page.locator('svg.network').getAttribute('data-tier'));
  expect(tier).toBeGreaterThanOrEqual(1);
  await expect(page.locator('svg.network .hub-ring')).toHaveCount(1);
  await page.screenshot({ path: 'e2e-output/027-late-network.png' });
  expect(errors).toEqual([]);
});

test('an early network without automations has no packets on its idle line', async ({ page }) => {
  const errors = await open(page, {});
  await expect(page.locator('.net-row.shown')).toHaveCount(1);
  await expect(page.locator('.net-line.active')).toHaveCount(0);
  await page.waitForTimeout(1500);
  await expect(page.locator('svg.network circle.packet')).toHaveCount(0);
  await expect(page.locator('svg.network')).toHaveAttribute('data-tier', '0');
  await page.screenshot({ path: 'e2e-output/027-early-network.png' });
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no packets travel, but the tier still shows', async ({ page }) => {
    const errors = await open(page, BIG);
    await expect(page.locator('.net-line.active')).toHaveCount(6);
    await page.waitForTimeout(1500);
    await expect(page.locator('svg.network circle.packet')).toHaveCount(0);
    expect(Number(await page.locator('svg.network').getAttribute('data-tier'))).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });
});
