import { expect, test } from '@playwright/test';

// After a few school years with 3 merits to spend (task 089).
const save = {
  version: 15,
  kp: '0',
  runEarned: '0',
  totalEarned: '1e9',
  merits: '3',
  meritsEarned: '100',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: { reputation: 2, network: 5, framework: 2 },
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

test('089: the Läsår tab shows a dot while a merit is affordable', async ({ page }) => {
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
  const tab = page.getByTestId('tab-prestige');
  await expect(tab).toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Läsår. Meriter att köpa');
  await page.screenshot({ path: 'e2e-output/089-merit-tab-dot.png' });
  await tab.click();
  await expect(tab).not.toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Läsår');
  expect(errors).toEqual([]);
});
