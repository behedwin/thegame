import { expect, test } from '@playwright/test';

// Early run with plenty of KP and no upgrades bought yet (task 093).
const save = {
  version: 15,
  kp: '1e6',
  runEarned: '1e6',
  totalEarned: '1e9',
  merits: '0',
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

test('093: the Uppgraderingar tab shows a dot while a new upgrade is affordable', async ({ page }) => {
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
  const tab = page.getByTestId('tab-upgrades');
  await expect(tab).toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Uppgraderingar. Ny uppgradering att köpa');
  await page.screenshot({ path: 'e2e-output/093-upgrade-tab-dot.png' });
  await tab.click();
  await expect(tab).not.toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Uppgraderingar');
  expect(errors).toEqual([]);
});
