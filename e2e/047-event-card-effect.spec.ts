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
  version: 6,
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
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e9,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

test('the event card shows what the event gives and fits a 360 px screen', async ({ page }) => {
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
  await expect(card.getByTestId('event-effect')).toHaveText(/^Produktion ×2 i 60 s · ≈ \+[\d\s,]+ KP$/);
  await expect(card).toHaveAttribute('aria-label', /Produktion ×2 i 60 s/);
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.screenshot({ path: 'e2e-output/047-event-card-effect.png' });

  await card.click();
  await expect(card).toBeHidden();
  expect(errors).toEqual([]);
});
