import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';
const save = (prestiges: number, fastestYearMs: number) => ({
  version: 17,
  kp: '1e6',
  runEarned: '1e12',
  totalEarned: '1e9',
  merits: '5',
  meritsEarned: '5',
  upgrades: {},
  automations: { csv: 10 },
  meritUpgrades: {},
  prestiges,
  clicks: 50,
  timeMs: 5_000_000,
  yearStartMs: 5_000_000 - 18 * 60_000,
  fastestYearMs,
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
});

async function open(page: Page, s: object): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(([key, value]) => localStorage.setItem(key!, value!), [KEY, JSON.stringify(s)]);
  await page.goto('/');
  await expect(page.locator('.card').first()).toBeVisible();
  await page.getByTestId('tab-prestige').click();
  return errors;
}

test.use({ viewport: { width: 390, height: 844 } });

test('102: the year clock is marked on-pace while under the record', async ({ page }) => {
  const errors = await open(page, save(1, 25 * 60_000));
  const clock = page.getByTestId('year-clock');
  await expect(clock).toHaveText(/^Läsåret: 18 min \(rekord 25 min\) · rekordtakt$/);
  await expect(clock).toHaveClass(/on-pace/);
  await page.screenshot({ path: 'e2e-output/102-year-clock-pace.png' });
  expect(errors).toEqual([]);
});

test('102: the year clock is not on-pace once past the record', async ({ page }) => {
  const errors = await open(page, save(1, 10 * 60_000));
  const clock = page.getByTestId('year-clock');
  await expect(clock).toHaveText(/^Läsåret: 18 min \(rekord 10 min\)$/);
  await expect(clock).not.toHaveClass(/on-pace/);
  expect(errors).toEqual([]);
});
