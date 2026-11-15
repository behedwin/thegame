import { expect, test, type Page } from '@playwright/test';

const KEY = 'CapacitorStorage.skolintegratoren.save';

function seed(page: Page, save: Record<string, unknown>) {
  return page.addInitScript(
    ([key, value]) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem(key!, value!);
        sessionStorage.setItem('seeded', '1');
      }
    },
    [KEY, JSON.stringify(save)],
  );
}

// Two hours away with 10 CSV imports (0.4 KP/s each) and an empty bank: offline earnings are 28 800 KP.
const BASE = 28_800;
const away = () => ({
  version: 6,
  kp: '0',
  runEarned: '0',
  totalEarned: '0',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 10 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 10,
  timeMs: 30_000,
  lastSeenMs: Date.now() - 2 * 3_600_000,
  activeEvent: null,
  nextEventAtMs: 1e9,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event'],
  inbox: [],
  nextTicketAtMs: 1e12,
  ticketsAnswered: 0,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
});

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}

async function savedKp(page: Page): Promise<number> {
  return page.evaluate((key) => Number(JSON.parse(localStorage.getItem(key) ?? '{}').kp), KEY);
}

test('coffee gives 20 % more offline earnings', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page, away());
  await page.goto('/');
  const dialog = page.getByTestId('welcome-dialog');
  await expect(dialog).toContainText('Hur börjar du dagen?');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'e2e-output/034-morning-choice.png' });
  await page.getByTestId('welcome-ok').click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => savedKp(page)).toBeGreaterThanOrEqual(BASE * 1.2 - 1);
  expect(errors).toEqual([]);
});

test('closing the dialog keeps the plain offline earnings', async ({ page }) => {
  await seed(page, away());
  await page.goto('/');
  await expect(page.getByTestId('welcome-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('welcome-dialog')).toBeHidden();
  await expect.poll(() => savedKp(page), { timeout: 15_000 }).toBeGreaterThanOrEqual(BASE - 1);
  expect(await savedKp(page)).toBeLessThan(BASE * 1.2 - 1);
});

test('inbox brings one ticket', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page, away());
  await page.goto('/');
  await expect(page.getByTestId('inbox')).toHaveText('Inkorg');
  await page.getByTestId('welcome-inbox').click();
  await expect(page.getByTestId('inbox')).toHaveText('Inkorg 1');
  expect(errors).toEqual([]);
});

test('standup shows a two-minute buff', async ({ page }) => {
  const errors = watchErrors(page);
  await seed(page, away());
  await page.goto('/');
  await page.getByTestId('welcome-standup').click();
  const buff = page.locator('.buff:not(.season)');
  await expect(buff).toBeVisible();
  await expect(buff).toContainText('×2 klick');
  await expect(buff).toContainText(/1[01]\d s/);
  expect(errors).toEqual([]);
});
