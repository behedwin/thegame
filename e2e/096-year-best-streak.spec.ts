import { expect, test, type Page } from '@playwright/test';

// The second school year, close to its end, with a given longest event streak this year.
const save = (yearBestStreak: number) => ({
  version: 18,
  kp: '1e12',
  runEarned: '4000000000',
  totalEarned: '4000000000',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 5 },
  meritUpgrades: {},
  prestiges: 1,
  clicks: 100,
  timeMs: 600000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 10_000_000,
  buffs: [],
  eventsClaimed: 9,
  bestEventStreak: 9,
  yearEvents: 7,
  yearBestStreak,
  nextTicketAtMs: 10_000_000,
  tipsSeen: ['sync', 'buy', 'event', 'inbox'],
  settings: { sound: false, vibration: false, tips: false },
});

async function openSummary(page: Page, yearBestStreak: number, errors: string[]) {
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save(yearBestStreak)));
  await page.goto('/');
  await page.getByTestId('tab-prestige').click();
  await page.getByTestId('prestige').click();
  const summary = page.getByTestId('year-summary');
  await expect(summary).toBeVisible();
  return summary;
}

test('The year in review shows the longest event streak this year', async ({ page }) => {
  const errors: string[] = [];
  const summary = await openSummary(page, 7, errors);
  await expect(summary).toContainText('Längsta svit i år: 7 🔥');
  await page.screenshot({ path: 'e2e-output/096-year-best-streak.png' });
  expect(errors).toEqual([]);
});

test('The year in review hides the streak line below the streak minimum', async ({ page }) => {
  const errors: string[] = [];
  const summary = await openSummary(page, 1, errors);
  await expect(summary).toContainText('7 event lösta');
  await expect(summary).not.toContainText('Längsta svit');
  expect(errors).toEqual([]);
});
