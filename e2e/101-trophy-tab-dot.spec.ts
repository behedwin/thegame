import { expect, test } from '@playwright/test';

// One click away from the "musarm" trophy, with one trophy already unlocked (task 101).
const save = {
  version: 15,
  kp: '0',
  runEarned: '0',
  totalEarned: '1e3',
  merits: '0',
  meritsEarned: '0',
  upgrades: {},
  automations: { csv: 1 },
  meritUpgrades: {},
  prestiges: 0,
  clicks: 24_999,
  timeMs: 60_000,
  lastSeenMs: Date.now(),
  activeEvent: null,
  nextEventAtMs: 1e12,
  buffs: [],
  eventsClaimed: 0,
  achievements: ['forsta-csv'],
  tipsSeen: ['sync', 'buy', 'event', 'help', 'inbox'],
  ticketsAnswered: 0,
  inbox: [],
  nextTicketAtMs: 1e12,
  settings: { sound: false, vibration: false, tips: false },
};

test.use({ viewport: { width: 390, height: 844 } });

test('101: the Troféer tab shows a dot after a new trophy until it is opened', async ({ page }) => {
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
  const tab = page.getByTestId('tab-achievements');
  // Trophies unlocked before load count as seen.
  await expect(tab).toBeVisible();
  await expect(tab).not.toHaveClass(/\bdot\b/);
  await page.getByTestId('hub').click();
  await expect(tab).toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Troféer. Ny trofé');
  await page.screenshot({ path: 'e2e-output/101-trophy-tab-dot.png' });
  await tab.click();
  await expect(tab).not.toHaveClass(/\bdot\b/);
  await expect(tab).toHaveAttribute('aria-label', 'Troféer');
  // Leaving the tab again keeps it clear: the trophy has been seen.
  await page.getByTestId('tab-upgrades').click();
  await expect(tab).not.toHaveClass(/\bdot\b/);
  expect(errors).toEqual([]);
});
