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

const save = {
  version: 12,
  kp: '100',
  runEarned: '100',
  totalEarned: '100',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 3 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 10,
  timeMs: 30_000,
  activeEvent: { id: 'friday-update', expiresAtMs: 1e9 },
  nextEventAtMs: 1e9,
  buffs: [],
  eventsClaimed: 5,
  eventStreak: 4,
  eventOpen: true,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e9,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

test('the event card shows the streak from three in a row and the boosted effect', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await seed(page, { ...save, lastSeenMs: Date.now() });
  await page.goto('/');

  const card = page.getByTestId('event');
  await expect(card).toBeVisible();
  await expect(card.getByTestId('event-streak')).toHaveText('Svit 4 🔥');
  // Streak 4 gives +10 % on the extra part (two steps of 5 %): ×2 becomes ×2,1.
  await expect(card.getByTestId('event-effect')).toHaveText(/^Produktion ×2,1 i 60 s/);
  await expect(card).toHaveAttribute('aria-label', /Svit 4/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.screenshot({ path: 'e2e-output/069-event-streak.png' });

  await card.click();
  await expect(card).toBeHidden();
  expect(errors).toEqual([]);
});
