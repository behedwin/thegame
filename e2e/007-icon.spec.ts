import { expect, test } from '@playwright/test';

test('favicon, manifest and icons are served locally from the built app', async ({ page, baseURL }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => { if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:')) external.push(r.url()); });

  await page.goto('/');
  await expect(page.getByTestId('hub')).toBeVisible();

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  const iconHref = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(manifestHref).toBeTruthy();
  expect(iconHref).toBeTruthy();

  const manifestUrl = new URL(manifestHref!, page.url()).href;
  const res = await page.request.get(manifestUrl);
  expect(res.status()).toBe(200);
  const manifest = await res.json();
  expect(manifest.name).toBe('Skolintegratören');
  for (const icon of manifest.icons as { src: string; type: string }[]) {
    const r = await page.request.get(new URL(icon.src, manifestUrl).href);
    expect(r.status(), icon.src).toBe(200);
    expect(r.headers()['content-type'], icon.src).toContain(icon.type.split('+')[0]);
  }

  const svg = await page.request.get(new URL(iconHref!, page.url()).href);
  expect(svg.status()).toBe(200);
  await page.setContent(`<link rel="icon" href="data:,"><body style="margin:0;background:#888"><img src="${new URL(iconHref!, page.url()).href}" width="256" height="256"></body>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'e2e-output/007-icon.png', clip: { x: 0, y: 0, width: 256, height: 256 } });

  expect(errors, errors.join('\n')).toEqual([]);
  expect(external, external.join('\n')).toEqual([]);
});
