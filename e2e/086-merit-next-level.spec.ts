import { expect, test } from '@playwright/test';

// After a few school years: reputation 2/100, framework 2/10, network maxed (5/5).
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

test('086: expanded merit cards show what the next level gives', async ({ page }) => {
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

  // Collapsed: the next-level line is hidden.
  await expect(page.getByTestId('next-framework')).toBeHidden();
  await page.getByTestId('info-framework').click();
  await expect(page.getByTestId('next-framework')).toHaveText('Nästa: −14,3 % på integrationer');
  // Level 0 also gets a next line.
  await page.getByTestId('info-nightly').click();
  await expect(page.getByTestId('next-nightly')).toHaveText(/^Nästa: /);
  await page.screenshot({ path: 'e2e-output/086-merit-next.png' });
  // Maxed merit: no next line even when expanded.
  await page.getByTestId('fold-maxed').click();
  await page.getByTestId('info-network').click();
  await expect(page.getByTestId('card-network')).toHaveClass(/expanded/);
  await expect(page.getByTestId('next-network')).toBeHidden();
  expect(errors).toEqual([]);
});
