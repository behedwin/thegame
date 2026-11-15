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

const base = {
  version: 6,
  kp: '100',
  runEarned: '100',
  totalEarned: '100',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 10,
  timeMs: 30_000,
  activeEvent: null,
  nextEventAtMs: 1e9,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event'],
  ticketsAnswered: 0,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

test('a ticket can be opened and answered, and the result survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await seed(page, { ...base, lastSeenMs: Date.now(), inbox: ['csv-semicolon'], nextTicketAtMs: 1e9 });
  await page.goto('/');

  const inbox = page.getByTestId('inbox');
  await expect(inbox).toBeVisible();
  await expect(inbox).toHaveText('Inkorg 1');
  await inbox.click();
  const dialog = page.getByTestId('ticket-dialog');
  await expect(dialog).toContainText('Kunden vill ha CSV med semikolon');
  await expect(dialog).toContainText('Från:');
  await page.screenshot({ path: 'e2e-output/021-ticket.png' });

  // "Later" closes without answering: nothing is lost.
  await page.getByTestId('ticket-later').click();
  await expect(inbox).toHaveText('Inkorg 1');

  await inbox.click();
  await page.getByTestId('ticket-choice-1').click();
  await expect(page.locator('.toast').last()).toContainText(/kaka\. \+[\d\s,]+ KP\./);
  await expect(inbox).toHaveText('Inkorg');
  // The counter rolls up to the new value.
  await expect.poll(async () => Number((await page.getByTestId('kp-value').textContent())!.replace(/\s/g, ''))).toBeGreaterThanOrEqual(110);

  await page.waitForTimeout(300);
  await page.reload();
  // Answered and gone, but the inbox button stays now that the player knows it.
  await expect(inbox).toBeVisible();
  await expect(inbox).toHaveText('Inkorg');
  await inbox.click();
  await expect(page.getByTestId('inbox-empty-dialog')).toContainText('Inga ärenden');
  await expect(page.getByTestId('inbox-archive')).toHaveText('Du har löst 1 ärende. Skolorna tackar.');
  expect(errors).toEqual([]);
});

test('coming back fills the inbox and the welcome dialog mentions it', async ({ page }) => {
  await seed(page, { ...base, lastSeenMs: Date.now() - 2 * 3_600_000, inbox: [], nextTicketAtMs: 60_000 });
  await page.goto('/');
  await expect(page.getByTestId('welcome-tickets')).toHaveText('3 ärenden väntar i inkorgen.');
  await page.getByTestId('welcome-ok').click();
  await expect(page.getByTestId('inbox')).toHaveText('Inkorg 3');
});
