import { expect, test } from '@playwright/test';

test('play, buy, reload: progress is saved, no console errors, no external traffic', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith(baseURL!) && !url.startsWith('data:')) external.push(url);
  });

  await page.goto('/');
  const kp = page.getByTestId('kp-value');
  await expect(kp).toHaveText('0');

  const hub = page.getByTestId('hub');
  for (let i = 0; i < 14; i++) await hub.click();
  await expect(kp).toHaveText('14');

  // First upgrade: "Extra kaffebryggare" costs 10 KP.
  await page.getByTestId('tab-upgrades').click();
  const buyCoffee = page.getByTestId('buy-coffee');
  await expect(buyCoffee).toBeEnabled();
  await buyCoffee.click();
  await expect(kp).toHaveText('4');
  await expect(page.getByTestId('card-coffee')).toContainText('Nivå 1/10');

  // Each click is now worth 2 KP.
  await hub.click();
  await expect(kp).toHaveText('6');

  // Give the async save a moment, then reload.
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('kp-value')).toHaveText('6');
  await page.getByTestId('tab-upgrades').click();
  await expect(page.getByTestId('card-coffee')).toContainText('Nivå 1/10');

  await page.getByTestId('tab-automations').click();
  await page.screenshot({ path: 'e2e-output/screenshot.png', fullPage: true });

  expect(errors, `console errors: ${errors.join('\n')}`).toEqual([]);
  expect(external, `external requests: ${external.join('\n')}`).toEqual([]);
});

test('offline progress shows the welcome dialog and the full network', async ({ page }) => {
  const save = {
    version: 1,
    kp: '250000',
    runEarned: '300000000', // above the prestige-tab unlock (25 % of the first merit's KP)
    totalEarned: '3000000',
    merits: '0',
    meritsEarned: '0',
    upgrades: { coffee: 5, fika: 1, mapping: 1 },
    automations: { csv: 30, nightly: 22, flow: 12, api: 3 },
    meritUpgrades: {},
    prestiges: 0,
    clicks: 500,
    timeMs: 600000,
    lastSeenMs: Date.now() - 2 * 3_600_000,
    activeEvent: null,
    nextEventAtMs: 0,
    buffs: [],
    eventsClaimed: 0,
    settings: { sound: false, vibration: false },
  };
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(save));
  await page.goto('/');
  const dialog = page.getByTestId('welcome-dialog');
  await expect(dialog).toContainText('Medan du var borta synkade');
  await expect(dialog).toContainText('2 h');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'e2e-output/welcome.png' });
  await page.getByTestId('welcome-ok').click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('tab-prestige')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e-output/midgame.png' });
});
