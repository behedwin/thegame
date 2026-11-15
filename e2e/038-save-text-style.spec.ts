import { expect, test } from '@playwright/test';

test('save field matches the dark dialog and never scrolls sideways on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByTestId('settings').click();
  await page.getByTestId('export-save').click();
  const field = page.getByTestId('save-text');
  await expect(field).toHaveValue(/^SKI1:/);
  await page.screenshot({ path: 'e2e-output/038-save-text.png' });

  const look = await field.evaluate((el) => {
    const s = getComputedStyle(el);
    const btn = getComputedStyle(document.querySelector('[data-testid="export-save"]')!);
    return {
      bg: s.backgroundColor,
      btnBg: btn.backgroundColor,
      color: s.color,
      radius: s.borderTopLeftRadius,
      wordBreak: s.wordBreak,
      userSelect: s.userSelect || (s as unknown as Record<string, string>).webkitUserSelect,
      inline: el.getAttribute('style'),
      overflowX: el.scrollWidth - el.clientWidth,
      right: el.getBoundingClientRect().right,
    };
  });
  expect(look.bg).toBe(look.btnBg);
  expect(look.color).toBe('rgb(234, 240, 251)');
  expect(look.radius).toBe('12px');
  expect(look.wordBreak).toBe('break-all');
  expect(look.userSelect).toBe('text');
  expect(look.inline ?? '').not.toContain('width');
  expect(look.overflowX).toBeLessThanOrEqual(0);
  expect(look.right).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await field.focus();
  expect(await field.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
});
