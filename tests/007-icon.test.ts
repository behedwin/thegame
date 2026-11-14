import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const RES = 'android/app/src/main/res';
const read = (p: string) => readFileSync(p, 'utf8');

/** Width/height from a PNG IHDR chunk. */
function pngSize(path: string): [number, number] {
  const buf = readFileSync(path);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

/** Minimal well-formedness check: every opened tag is closed in order. */
function assertWellFormedXml(xml: string, file: string) {
  const body = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack: string[] = [];
  for (const m of body.matchAll(/<(\/?)([A-Za-z][\w:.-]*)[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = m;
    if (selfClosing) continue;
    if (closing) expect(stack.pop(), `${file}: unexpected </${name}>`).toBe(name);
    else stack.push(name);
  }
  expect(stack, `${file}: unclosed tags`).toEqual([]);
}

// The game palette (src/ui/style.css). The icon may only use these plus white/transparent.
const PALETTE = ['#0d1424', '#131c33', '#1a2440', '#22305a', '#2c3a63', '#3ee6c1', '#6ff5d8', '#1fa88a', '#ffc95e', '#eaf0fb', '#ffffff'];

describe('007 web icon and manifest', () => {
  it('ships a vector icon that only uses the game palette', () => {
    const svg = read('public/icon.svg');
    expect(svg).toMatch(/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).toMatch(/viewBox="0 0 512 512"/);
    assertWellFormedXml(svg, 'icon.svg');
    const colors = [...svg.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) => m[0].toLowerCase());
    expect(colors.length).toBeGreaterThan(0);
    for (const c of colors) expect(PALETTE, `color ${c}`).toContain(c);
    // Turquoise hub and gold data packets.
    expect(colors).toContain('#3ee6c1');
    expect(colors).toContain('#ffc95e');
    // No external references (fonts, images, links).
    expect(svg).not.toMatch(/href=|<image|<text|url\(http/);
  });

  it('has a valid manifest whose icons exist with the declared sizes', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    expect(manifest.name).toBe('Skolintegratören');
    expect(manifest.lang).toBe('sv');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#0d1424');
    expect(manifest.theme_color).toBe('#0d1424');
    expect(manifest.start_url).toBe('./');
    const purposes = new Set<string>();
    for (const icon of manifest.icons) {
      expect(icon.src).not.toMatch(/^(https?:)?\/\//);
      const file = join('public', icon.src);
      expect(existsSync(file), file).toBe(true);
      purposes.add(icon.purpose ?? 'any');
      if (icon.type === 'image/png') {
        const [w, h] = pngSize(file);
        expect(`${w}x${h}`).toBe(icon.sizes);
      }
    }
    expect(purposes).toContain('any');
    expect(purposes).toContain('maskable');
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });

  it('links favicon, apple touch icon and manifest from index.html', () => {
    const html = read('index.html');
    expect(html).toMatch(/<link rel="icon" type="image\/svg\+xml" href="\/icon\.svg"/);
    expect(html).toMatch(/<link rel="apple-touch-icon" href="\/icon-192\.png"/);
    expect(html).toMatch(/<link rel="manifest" href="\/manifest\.webmanifest"/);
    expect(html).toMatch(/<meta name="theme-color" content="#0d1424"/);
    // CSP must still forbid external sources; manifest-src falls back to default-src 'self'.
    expect(html).toMatch(/default-src 'self'/);
  });
});

describe('007 Android icon and splash', () => {
  const xmlFiles = (dir: string) => readdirSync(join(RES, dir)).filter((f) => f.endsWith('.xml')).map((f) => join(RES, dir, f));

  it('all resource XML files are well formed', () => {
    for (const dir of readdirSync(RES)) for (const f of xmlFiles(dir)) assertWellFormedXml(read(f), f);
  });

  it('adaptive icon uses the vector foreground, the dark background and a monochrome layer', () => {
    for (const name of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
      const xml = read(join(RES, 'mipmap-anydpi-v26', name));
      expect(xml).toContain('<background android:drawable="@color/ic_launcher_background"/>');
      expect(xml).toContain('<foreground android:drawable="@drawable/ic_launcher_foreground"/>');
      expect(xml).toContain('<monochrome android:drawable="@drawable/ic_launcher_foreground"/>');
    }
    expect(read(join(RES, 'values/ic_launcher_background.xml'))).toMatch(/#0D1424/i);
    // The old template foreground PNGs are gone (no longer referenced).
    for (const d of readdirSync(RES).filter((d) => d.startsWith('mipmap-') && d !== 'mipmap-anydpi-v26')) {
      expect(existsSync(join(RES, d, 'ic_launcher_foreground.png')), d).toBe(false);
    }
  });

  it('vector foreground is the hub icon, not the Android template, and stays inside the safe zone', () => {
    const xml = read(join(RES, 'drawable-v24/ic_launcher_foreground.xml'));
    expect(xml).toContain('android:viewportWidth="108"');
    expect(xml).toMatch(/#FF3EE6C1/i);
    expect(xml).toMatch(/#FFFFC95E/i);
    expect(xml).not.toContain('M66.94,46.02'); // template robot head
    // All absolute coordinates lie inside the 66 dp safe zone (radius 33 around 54,54).
    for (const m of xml.matchAll(/android:pathData="([^"]+)"/g)) {
      for (const n of m[1].match(/-?\d+(\.\d+)?/g)!.map(Number)) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(108);
      }
    }
    const pts = [...xml.matchAll(/[ML]([\d.]+),([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(pts.length).toBeGreaterThan(0);
    for (const [x, y] of pts) expect(Math.hypot(x - 54, y - 54)).toBeLessThanOrEqual(33.5);
  });

  it('background drawable is a plain dark colour (no template grid)', () => {
    const xml = read(join(RES, 'drawable/ic_launcher_background.xml'));
    expect(xml).toMatch(/#FF0D1424/i);
    expect(xml).not.toContain('#26A69A');
  });

  it('legacy launcher PNGs have the right density sizes', () => {
    const sizes: Record<string, number> = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
    for (const [d, px] of Object.entries(sizes)) {
      for (const f of ['ic_launcher.png', 'ic_launcher_round.png']) {
        expect(pngSize(join(RES, `mipmap-${d}`, f))).toEqual([px, px]);
      }
    }
  });

  it('splash is a vector layer list on the dark background and the theme sets the Android 12 splash', () => {
    const splash = read(join(RES, 'drawable/splash.xml'));
    expect(splash).toContain('<layer-list');
    expect(splash).toContain('@color/splash_background');
    expect(splash).toContain('@drawable/ic_launcher_foreground');
    // No PNG splash left that could shadow the vector one in a density folder.
    for (const d of readdirSync(RES).filter((d) => d.startsWith('drawable'))) {
      expect(existsSync(join(RES, d, 'splash.png')), d).toBe(false);
    }
    expect(read(join(RES, 'values/colors.xml'))).toMatch(/name="splash_background">#0D1424/i);
    const styles = read(join(RES, 'values/styles.xml'));
    expect(styles).toContain('<item name="windowSplashScreenBackground">@color/splash_background</item>');
    expect(styles).toContain('<item name="windowSplashScreenAnimatedIcon">@drawable/ic_launcher_foreground</item>');
    expect(styles).toContain('<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>');
  });
});
