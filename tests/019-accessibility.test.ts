import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { T } from '../src/content/texts';
import { contrastRatio, cssColorVars, luminance } from '../src/ui/a11y';

const css = readFileSync('src/ui/style.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
const vars = cssColorVars(css);

describe('contrast math', () => {
  it('matches the WCAG reference values', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#ffffff')).toBeCloseTo(1, 6);
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 6);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 6);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
    expect(() => luminance('red')).toThrow();
  });
});

describe('colour contrast of the theme', () => {
  // Text colour on background colour, as they are paired in style.css. WCAG AA: 4.5 for normal text.
  const pairs: [string, string][] = [
    ['text', 'bg'],
    ['text', 'surface'],
    ['text', 'surface2'],
    ['muted', 'bg'],
    ['muted', 'surface'],
    ['muted', 'surface2'], // disabled buy buttons and the "Av" toggles
    ['accent', 'surface'],
    ['accent', 'surface2'],
    ['accent-ink', 'accent'],
    ['gold', 'bg'],
    ['event', 'bg'],
    ['danger', 'surface'],
  ];
  it.each(pairs)('--%s on --%s reaches 4.5:1', (fg, bg) => {
    expect(vars[fg], fg).toBeDefined();
    expect(vars[bg], bg).toBeDefined();
    expect(contrastRatio(vars[fg]!, vars[bg]!)).toBeGreaterThanOrEqual(4.5);
  });
  it('event card text reaches 4.5:1 on both gradient stops', () => {
    expect(contrastRatio('#2b0d05', '#ff9d5c')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#2b0d05', '#ff6f61')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('reduced motion', () => {
  it('the stylesheet turns off animations and transitions', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(block).toContain('animation-duration: 0.01ms !important');
    expect(block).toContain('animation-iteration-count: 1 !important');
    expect(block).toContain('transition-duration: 0.01ms !important');
  });
  it('data packets on the network map are hidden', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    expect(block).toMatch(/\.packet \{ display: none; \}/);
  });
});

describe('larger text', () => {
  it('pinch zoom is not blocked', () => {
    expect(html).not.toMatch(/user-scalable\s*=\s*no/);
    expect(html).not.toMatch(/maximum-scale/);
  });
  it('UI text sizes follow the font size setting (rem), except the fixed-size map and hub', () => {
    const px = [...css.matchAll(/^(.*)font-size: [0-9.]+px/gm)].map((m) => m[1]!.trim());
    expect(px).toHaveLength(2);
    expect(px.some((l) => l.startsWith('.net-node text'))).toBe(true);
  });
});

describe('screen reader texts', () => {
  it('buy buttons get a one-line label with the item name', () => {
    expect(T.a11y.buyAria('Schemakoppling', '×10\n1,2 tn KP')).toBe('Köp Schemakoppling: ×10 1,2 tn KP');
    expect(T.a11y.tabsAria).toBeTruthy();
  });
});
