import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../capacitor.config';

const read = (p: string) => readFileSync(p, 'utf8');
const BG = '#0d1424';

describe('008 Android polish', () => {
  it('locks MainActivity to portrait', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    const activity = manifest.match(/<activity[\s\S]*?>/)?.[0] ?? '';
    expect(activity).toContain('android:name=".MainActivity"');
    expect(activity).toContain('android:screenOrientation="portrait"');
  });

  it('configures dark system bars, background and no zoom', () => {
    expect(config.backgroundColor).toBe(BG);
    expect(config.zoomEnabled).toBe(false);
    expect(config.android?.zoomEnabled).toBe(false);
    expect(config.plugins?.SystemBars).toMatchObject({ insetsHandling: 'css', style: 'DARK' });
  });

  it('colors the status and navigation bars natively on older Android', () => {
    const java = read('android/app/src/main/java/se/skolintegratoren/game/MainActivity.java');
    expect(java).toContain('setStatusBarColor');
    expect(java).toContain('setNavigationBarColor');
    expect(java.toLowerCase()).toContain(BG);
    expect(java).toContain('setSupportZoom(false)');
  });

  it('registers @capacitor/app in package.json and the generated Gradle files', () => {
    const pkg = JSON.parse(read('package.json')) as { dependencies: Record<string, string> };
    expect(pkg.dependencies['@capacitor/app']).toMatch(/^\^8\./);
    expect(read('android/capacitor.settings.gradle')).toContain("include ':capacitor-app'");
    expect(read('android/app/capacitor.build.gradle')).toContain("implementation project(':capacitor-app')");
  });

  it('documents the new dependency in decisions/', () => {
    const files = ['decisions/20261114T125140Z-008-android-polish.md'];
    expect(files.map(read).join('\n')).toMatch(/@capacitor\/app/);
  });

  it('disables text selection, callouts and double-tap zoom in CSS', () => {
    const css = read('src/ui/style.css');
    const body = css.match(/\nbody \{[\s\S]*?\}/)?.[0] ?? '';
    expect(body).toContain('-webkit-user-select: none');
    expect(body).toContain('-webkit-touch-callout: none');
    expect(body).toContain('touch-action: manipulation');
  });
});
