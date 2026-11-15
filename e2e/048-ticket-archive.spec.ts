import { expect, test } from '@playwright/test';

test('answered tickets show in stats and in the empty inbox', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const save = {
    version: 6,
    kp: '10',
    runEarned: '10',
    totalEarned: '1000',
    merits: '0',
    meritsEarned: '0',
    upgrades: {},
    automations: {},
    meritUpgrades: {},
    prestiges: 0,
    clicks: 5,
    timeMs: 600_000,
    lastSeenMs: Date.now(),
    activeEvent: null,
    nextEventAtMs: 1e12,
    buffs: [],
    eventsClaimed: 0,
    achievements: [],
    settings: { sound: false, vibration: false, volume: 0.5 },
    inbox: [],
    nextTicketAtMs: 1e12,
    ticketsAnswered: 12,
  };
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto('/');

  const inbox = page.getByTestId('inbox');
  await expect(inbox).toHaveText('Inkorg');
  await inbox.click();
  await expect(page.getByTestId('inbox-archive')).toHaveText('Du har löst 12 ärenden. Skolorna tackar.');
  await page.screenshot({ path: 'e2e-output/048-inbox-archive.png' });
  await page.getByTestId('inbox-empty-dialog').getByRole('button', { name: 'Stäng' }).click();
  await expect(page.getByTestId('inbox-empty-dialog')).toHaveCount(0);

  await page.getByTestId('settings').click();
  await page.getByTestId('open-stats').click();
  await expect(page.getByTestId('stat-list')).toContainText('Besvarade ärenden12');
  expect(errors).toEqual([]);
});
