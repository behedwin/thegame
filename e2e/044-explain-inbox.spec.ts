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
  timeMs: 125_000,
  activeEvent: null,
  nextEventAtMs: 1e9,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy'],
  ticketsAnswered: 0,
  inbox: ['csv-semicolon'],
  nextTicketAtMs: 1e9,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: true },
};

test('the first ticket gets a tip, the dialog a note and the help page a section', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await seed(page, { ...save, lastSeenMs: Date.now() });
  await page.goto('/');

  await expect(page.getByTestId('tip-text')).toContainText('ärende i inkorgen');
  await page.screenshot({ path: 'e2e-output/044-inbox-tip.png' });

  await page.getByTestId('inbox').click();
  const dialog = page.getByTestId('ticket-dialog');
  await expect(dialog.getByTestId('ticket-note')).toContainText('Högst 3 åt gången');
  await page.screenshot({ path: 'e2e-output/044-ticket-note.png' });
  await dialog.getByTestId('ticket-later').click();

  await page.getByTestId('settings').click();
  await page.getByTestId('open-help').click();
  const section = page.getByTestId('help-inkorgen');
  await expect(section).toBeVisible();
  await section.locator('summary').click();
  await expect(section).toContainText('går aldrig ut');
  await page.screenshot({ path: 'e2e-output/044-help-inbox.png' });

  expect(errors).toEqual([]);
});
