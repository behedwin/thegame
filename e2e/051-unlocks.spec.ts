import { expect, test, type Page } from '@playwright/test';

const save = (prestiges: number) => ({
  version: 6,
  kp: '1e14',
  runEarned: '1e14',
  totalEarned: '1e16',
  merits: '0',
  meritsEarned: '10',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: {},
  prestiges,
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
});

async function open(page: Page, prestiges: number): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('CapacitorStorage.skolintegratoren.save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save(prestiges));
  await page.goto('/');
  return errors;
}

test('school year 2 hides the federation and announces it for next year', async ({ page }) => {
  const errors = await open(page, 1);
  await expect(page.getByTestId('card-lti')).toBeVisible();
  await expect(page.getByTestId('card-federation')).toHaveCount(0);
  await page.getByTestId('tab-prestige').click();
  await expect(page.getByTestId('prestige-unlock')).toHaveText('Nästa läsår låser upp: Inloggningsfederation');
  await page.screenshot({ path: 'e2e-output/051-next-unlock.png' });
  expect(errors).toEqual([]);
});

test('school year 3 shows the federation in the shop and it can be bought', async ({ page }) => {
  const errors = await open(page, 2);
  const card = page.getByTestId('card-federation');
  await expect(card).toBeVisible();
  await page.getByTestId('buy-federation').click();
  await expect(card.locator('.card-level')).not.toHaveText('');
  await page.getByTestId('tab-prestige').click();
  await expect(page.getByTestId('prestige-unlock')).toHaveText('Läsår 6: Schemaexport');
  await page.getByTestId('tab-automations').click();
  await page.screenshot({ path: 'e2e-output/051-federation.png' });
  expect(errors).toEqual([]);
});
