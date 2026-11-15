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
  activeEvent: null,
  nextEventAtMs: 1e9,
  buffs: [{ source: 'morning', kind: 'clickMult', mult: 2, untilMs: 150_000 }],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event'],
  ticketsAnswered: 0,
  inbox: ['csv-semicolon'],
  nextTicketAtMs: 1e9,
  settings: { sound: false, vibration: false, volume: 0.7, notifyOfflineCap: false, notifySeason: false, tips: false },
};

test('every choice shows its effect, and a buff answer shows in the HUD and the receipt', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.setViewportSize({ width: 360, height: 740 });
  await seed(page, { ...save, lastSeenMs: Date.now() });
  await page.goto('/');

  await page.getByTestId('inbox').click();
  const dialog = page.getByTestId('ticket-dialog');
  const effects = dialog.getByTestId('ticket-effect');
  await expect(effects).toHaveCount(3);
  await expect(effects.nth(0)).toContainText('Produktion ×1,5 i 30 s');
  await expect(effects.nth(1)).toContainText(/\+[\d\s,]+ KP direkt/);
  await expect(effects.nth(2)).toContainText('KP/klick ×2 i 30 s');
  await page.screenshot({ path: 'e2e-output/043-ticket-effects.png' });

  await page.getByTestId('ticket-choice-0').click();
  await expect(page.locator('.toast').last()).toContainText('smidigare. Produktion ×1,5 i 30 s.');
  await expect(dialog).toBeHidden();
  // Both the earlier click buff and the new production buff are listed.
  const buffs = page.getByTestId('buffs').locator('.buff');
  await expect(buffs).toHaveCount(2);
  await expect(page.getByTestId('buffs')).toContainText('Produktion ×1,5');
  await expect(page.getByTestId('buffs')).toContainText('KP/klick ×2');
  await page.screenshot({ path: 'e2e-output/043-buffs.png' });
  expect(errors).toEqual([]);
});
