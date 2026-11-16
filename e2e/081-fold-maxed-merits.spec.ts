import { expect, test } from '@playwright/test';

// After a few school years: network is maxed (5/5), framework is still buyable (2/10).
const save = {
  version: 15,
  kp: '0',
  runEarned: '0',
  totalEarned: '1e9',
  merits: '3',
  meritsEarned: '100',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: { network: 5, framework: 2 },
  prestiges: 3,
  clicks: 50,
  timeMs: 60_000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 1e12,
  buffs: [],
  eventsClaimed: 0,
  achievements: [],
  tipsSeen: ['sync', 'buy', 'event', 'help', 'inbox'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e12,
  settings: { sound: false, vibration: false, tips: false },
};

test.use({ viewport: { width: 390, height: 844 } });

test('081: maxed merits fold into a "Klara (n)" row in the school-year tab', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(
    ([key, value]) => {
      if (sessionStorage.getItem('seeded')) return;
      localStorage.setItem(key!, value!);
      sessionStorage.setItem('seeded', '1');
    },
    ['CapacitorStorage.skolintegratoren.save', JSON.stringify(save)],
  );
  await page.goto('/');
  await page.getByTestId('tab-prestige').click();

  const fold = page.getByTestId('fold-maxed');
  await expect(fold).toHaveText('Klara (1)');
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('card-framework')).toBeVisible();
  await expect(page.getByTestId('card-network')).toBeHidden();

  await fold.click();
  await expect(fold).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('card-network')).toBeVisible();
  await page.screenshot({ path: 'e2e-output/081-fold-open.png' });

  await fold.click();
  await expect(fold).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByTestId('card-network')).toBeHidden();
  expect(errors).toEqual([]);
});
