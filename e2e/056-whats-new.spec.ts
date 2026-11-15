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

// A save last opened on build 1.40; awayMs decides whether the welcome dialog shows too.
const save = (awayMs: number) => ({
  version: 10,
  kp: '0', runEarned: '0', totalEarned: '0', merits: '0', meritsEarned: '0', bestRunEarned: '0', purchases: 0,
  upgrades: {}, automations: { csv: 10 }, meritUpgrades: {}, prestiges: 0, clicks: 10, timeMs: 30_000,
  lastSeenMs: Date.now() - awayMs,
  activeEvent: null, nextEventAtMs: 1e9, buffs: [], eventsClaimed: 0, achievements: [], tipsSeen: ['sync', 'buy', 'event'],
  inbox: [], nextTicketAtMs: 1e12, ticketsAnswered: 0, focus: 'normal', lastSeenVersion: 40,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false, notation: 'short' },
});

function watch(page: Page): { errors: string[]; external: string[] } {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('request', (req) => {
    if (!req.url().startsWith('http://localhost:4173') && !req.url().startsWith('data:')) external.push(req.url());
  });
  return { errors, external };
}

const savedVersion = (page: Page) => page.evaluate((key) => Number(JSON.parse(localStorage.getItem(key) ?? '{}').lastSeenVersion), KEY);

test('after an update a closable bar shows the news since last time, once', async ({ page }) => {
  const { errors, external } = watch(page);
  await seed(page, save(0));
  await page.goto('/');
  const bar = page.getByTestId('news-bar');
  await expect(bar).toBeVisible();
  await expect(page.getByTestId('news-text')).toHaveText(/^Spelet har uppdaterats: \d+ nyhet(er)?$/);
  await page.screenshot({ path: 'e2e-output/056-news-bar.png' });

  await page.getByTestId('news-open').click();
  const dialog = page.getByTestId('changelog-dialog');
  const items = dialog.getByTestId('changelog-entry');
  expect(await items.count()).toBeGreaterThan(0);
  await expect(dialog).not.toContainText('Refaktorering');
  await expect(bar).toBeHidden();
  await dialog.getByRole('button', { name: 'Stäng' }).click();
  await expect.poll(() => savedVersion(page)).toBeGreaterThan(40);

  await page.reload();
  await expect(page.getByTestId('hub')).toBeVisible();
  await page.waitForTimeout(300);
  await expect(bar).toBeHidden();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('closing the bar also marks the news as seen', async ({ page }) => {
  const { errors } = watch(page);
  await seed(page, save(0));
  await page.goto('/');
  await page.getByTestId('news-close').click();
  await expect(page.getByTestId('news-bar')).toBeHidden();
  await expect.poll(() => savedVersion(page)).toBeGreaterThan(40);
  expect(errors).toEqual([]);
});

test('with the welcome dialog the news is a line in it instead of a second dialog', async ({ page }) => {
  const { errors } = watch(page);
  await seed(page, save(2 * 3_600_000));
  await page.goto('/');
  const welcome = page.getByTestId('welcome-dialog');
  await expect(welcome.getByTestId('welcome-news')).toHaveText(/Spelet har uppdaterats/);
  await expect(page.getByTestId('news-bar')).toBeHidden();
  await expect(page.getByTestId('changelog-dialog')).toHaveCount(0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'e2e-output/056-welcome-news.png' });
  await welcome.getByTestId('welcome-news').click();
  await expect(page.getByTestId('changelog-dialog').getByTestId('changelog-entry').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('a new player sees no news bar', async ({ page }) => {
  const { errors } = watch(page);
  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();
  await page.waitForTimeout(300);
  await expect(page.getByTestId('news-bar')).toBeHidden();
  expect(errors).toEqual([]);
});
