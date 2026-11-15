import { expect, test } from '@playwright/test';

// Two maxed upgrades (coffee 10/10, fika 4/4) and one still buyable (board 1/5).
const save = {
  version: 13,
  kp: '1e9',
  runEarned: '1e9',
  totalEarned: '1e9',
  merits: '0',
  meritsEarned: '0',
  upgrades: { coffee: 10, fika: 4, board: 1 },
  automations: { csv: 20, sftp: 10 },
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

test('073: maxed upgrades fold into a "Klara (n)" row at the bottom', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key!, value!),
    ['CapacitorStorage.skolintegratoren.save', JSON.stringify(save)],
  );
  await page.goto('/');
  await page.getByTestId('tab-upgrades').click();

  const fold = page.getByTestId('fold-maxed');
  await expect(fold).toHaveText('Klara (2)');
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('card-board')).toBeVisible();
  await expect(page.getByTestId('card-coffee')).toBeHidden();
  await expect(page.getByTestId('card-fika')).toBeHidden();

  // The buyable card comes before the folded row.
  const before = await page
    .getByTestId('card-board')
    .evaluate((card, row) => !!(card.compareDocumentPosition(row!) & Node.DOCUMENT_POSITION_FOLLOWING), await fold.elementHandle());
  expect(before).toBe(true);

  await fold.click();
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('card-coffee')).toBeVisible();
  await expect(page.getByTestId('card-fika')).toBeVisible();
  await page.screenshot({ path: 'e2e-output/073-fold-open.png' });

  await fold.click();
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('card-coffee')).toBeHidden();
  await page.screenshot({ path: 'e2e-output/073-fold-closed.png' });
  expect(errors).toEqual([]);
});
