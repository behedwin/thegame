// The hero visual: source systems on the left, your integration hub in the middle,
// target systems on the right. Data packets flow along the lines.
import { AUTOMATIONS, SYSTEMS, systemName, type SystemDef } from '../content/registry';
import type { NetworkFlow } from '../core';
import { T } from '../content/texts';
import { flashClass } from './celebrate';

const NS = 'http://www.w3.org/2000/svg';
const W = 360;
const H = 300;
const NODE_W = 98;
const NODE_H = 34;
/** The compact strip (062): map height in user units, chip size and how many rows fit. */
export const COMPACT_H = 100;
const CHIP_W = 40;
const CHIP_H = 22;
export const COMPACT_ROWS = 3;

/** Map size in user units, where the end nodes sit and how wide they are. */
interface Geo { w: number; h: number; nodeW: number; compact: boolean }
const BIG: Geo = { w: W, h: H, nodeW: NODE_W, compact: false };

/** Two or three letters for a system chip (062): initials of the first two words, or the first two letters. */
export function systemAbbr(name: string): string {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (words.length === 0) return '?';
  const abbr = words.length > 1 ? [...words[0]!][0]! + [...words[1]!][0]! : [...words[0]!].slice(0, 2).join('');
  return abbr.toLocaleUpperCase('sv');
}

/** Rows for the compact strip (062): the ones with most owned integrations (ties: newest), in map order,
 * and how many owned rows did not fit. With nothing owned the first row stands alone. */
export function pickCompactRows(counts: readonly number[], max = COMPACT_ROWS): { shown: number[]; more: number } {
  const owned = counts.flatMap((c, i) => (c > 0 ? [i] : []));
  if (owned.length === 0) return { shown: counts.length ? [0] : [], more: 0 };
  const best = [...owned].sort((a, b) => counts[b]! - counts[a]! || b - a).slice(0, max);
  return { shown: best.sort((a, b) => a - b), more: owned.length - best.length };
}

/** Row centres in the compact strip: 30 units apart around the middle. */
export function compactYs(n: number, height: number): number[] {
  return Array.from({ length: n }, (_, i) => height / 2 + (i - (n - 1) / 2) * 30);
}

/** Compact map width in user units for the strip's width/height ratio, so it fills the strip edge to edge. */
export function compactWidth(aspect: number): number {
  return Math.max(300, Math.round(COMPACT_H * aspect));
}
export const MAX_PACKETS = 60;
export const HUB_TIERS = 5;

/** Visual hub tier 0..4 from total KP/s: one step per two decades from 10 KP/s. Pure looks, no bonus. */
export function hubTier(kps: number): number {
  return kps >= 10 ? Math.min(HUB_TIERS - 1, 1 + Math.floor(Math.log10(kps) / 2 - 0.5)) : 0;
}

/** Packets per second on a line from its share of KP/s: +1.1 per decade from 0.6, capped at 5; 0 if idle. */
export function flowRate(share: number): number {
  return share > 0 ? 0.6 + 1.1 * Math.max(0, 4 + Math.log10(Math.min(1, share))) : 0;
}

/** Live packets each line may have: one each, the rest shared by rate; the sum never exceeds the cap. */
export function packetBudget(rates: readonly number[], cap: number): number[] {
  const n = rates.filter((r) => r > 0).length;
  const sum = rates.reduce((s, r) => s + Math.max(0, r), 0);
  return rates.map((r) => (r > 0 && n <= cap ? 1 + Math.floor(((cap - n) * r) / sum) : 0));
}
/** The map never shows more rows than this; older integrations make room for new ones. */
export const MAX_ROWS = 6;

/** Indices of the rows to show: the owned ones (or the first if none), at most `max`, newest kept. */
export function pickRows(owned: readonly boolean[], max: number): number[] {
  const idx = owned.flatMap((o, i) => (o ? [i] : []));
  if (idx.length === 0) return owned.length ? [0] : [];
  return idx.slice(-max);
}

/** Evenly spaced row centres for n rows in a map of the given height; one row sits in the middle. */
export function rowYs(n: number, height: number): number[] {
  if (n <= 1) return n === 1 ? [height / 2] : [];
  const pad = 30;
  const span = Math.min(height - 2 * pad, (n - 1) * 52);
  const top = (height - span) / 2;
  return Array.from({ length: n }, (_, i) => top + (i * span) / (n - 1));
}

/** How long a tapped system's tip stays: 6 s, longer for long texts, at most 12 s. */
export function tipDurationMs(text: string): number {
  return Math.min(12000, Math.max(6000, 2500 + 60 * text.length));
}

/** 30 fps gate: adds dt to the accumulator and returns the step to animate (0 = skip this frame).
 * Off screen nothing is stored, so the map resumes calmly instead of catching up in one burst. */
export function frameStep(acc: number, dt: number, onScreen: boolean): { acc: number; step: number } {
  if (!onScreen) return { acc: 0, step: 0 };
  const sum = acc + dt;
  return sum < 1 / 31 ? { acc: sum, step: 0 } : { acc: 0, step: sum };
}

/** Text shown when a system is tapped: its parody tagline, or its kind if it has none. */
export function nodeTip(id: string, systems: readonly SystemDef[] = SYSTEMS): string {
  const s = systems.find((x) => x.id === id);
  if (!s) return id;
  return s.tagline ? `${s.name}: ”${s.tagline}”` : `${s.name} · ${s.kind}`;
}

function rowPath(y: number, { w, h, nodeW }: Geo = BIG): string {
  const x = w / 2;
  const c = h / 2;
  return `M ${nodeW + 6} ${y} C ${x - 40} ${y}, ${x - 50} ${c}, ${x} ${c} ` +
    `C ${x + 50} ${c}, ${x + 40} ${y}, ${w - nodeW - 6} ${y}`;
}

interface Row {
  id: string;
  y: number;
  /** Positions the row (translate); the inner group fades in and out. */
  outer: SVGGElement;
  group: SVGGElement;
  lines: SVGPathElement;
  /** The compact strip's destination chip, moved with the strip's width. */
  dstChip: SVGGElement;
  visible: boolean;
  /** Packets per second currently emitted by this row, and how many may be live at once. */
  rate: number;
  budget: number;
  acc: number;
  /** Cached path length (0 until first measured). */
  len: number;
}

interface Packet {
  row: Row;
  t: number;
  speed: number;
  el: SVGCircleElement;
  /** Manual packets stop at the hub, halfway along the line. */
  manual: boolean;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

/** A node drawn around y = 0; the row group is translated to its place. */
function node(x: number, systemId: string, side: 'src' | 'dst'): SVGGElement {
  const g = el('g', { class: `net-node net-${side}`, 'data-system': systemId, style: 'cursor: pointer' });
  const text = el('text', { x: x + NODE_W / 2, y: 4, 'text-anchor': 'middle' });
  text.textContent = systemName(systemId);
  g.append(el('rect', { x, y: -NODE_H / 2, width: NODE_W, height: NODE_H, rx: 10 }), text);
  return g;
}

/** A filled chip with the system's abbreviation, shown instead of the node in the compact strip (062). */
function chip(x: number, systemId: string, side: 'src' | 'dst'): SVGGElement {
  const g = el('g', { class: `net-chip chip-${side}`, 'data-system': systemId, transform: `translate(${x} 0)` });
  // font-size as an attribute: 12 units is ≥ 11 px in the 96 px strip (COMPACT_H 100).
  const text = el('text', { x: CHIP_W / 2, y: 4, 'text-anchor': 'middle', 'font-size': 12 });
  text.textContent = systemAbbr(systemName(systemId));
  g.append(el('rect', { x: 0, y: -CHIP_H / 2, width: CHIP_W, height: CHIP_H, rx: CHIP_H / 2 }), text);
  return g;
}

export class NetworkView {
  readonly svg: SVGSVGElement;
  private rows: Row[] = [];
  private packets: Packet[] = [];
  private packetLayer: SVGGElement;
  private layoutKey = '';
  private booted = false;
  private tier = -1;
  private frameAcc = 0;
  private geo: Geo = BIG;
  private counts: number[] = [];
  private bg: SVGRectElement;
  private glow: SVGCircleElement;
  private ring: SVGCircleElement;
  private more: SVGTextElement;
  /** False while the map is scrolled out of view (IntersectionObserver); without one it is always true. */
  onScreen = true;
  /** Queried once; with reduced motion no packets travel at all. */
  private readonly calm = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  /** HTML line below the map (placed by the app), so it never covers nodes; see decisions/. */
  readonly tip: HTMLDivElement = document.createElement('div');
  private tipId = '';
  private tipTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'network', 'aria-hidden': 'true' });
    const defs = el('defs', {});
    const grad = el('radialGradient', { id: 'hubGlow' });
    grad.append(el('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': 0.45 }));
    grad.append(el('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': 0 }));
    const dots = el('pattern', { id: 'netDots', width: 24, height: 24, patternUnits: 'userSpaceOnUse' });
    dots.append(el('circle', { cx: 2, cy: 2, r: 0.9, style: 'fill: var(--muted)' }));
    defs.append(grad, dots);
    this.bg = el('rect', { x: -24, y: -24, width: W + 48, height: H + 48, fill: 'url(#netDots)', class: 'net-bg' });
    this.glow = el('circle', { cx: W / 2, cy: H / 2, r: 110, fill: 'url(#hubGlow)', class: 'hub-glow' });
    this.ring = el('circle', { cx: W / 2, cy: H / 2, r: 68, class: 'hub-ring' });
    this.more = el('text', { class: 'net-more', 'text-anchor': 'middle', 'font-size': 11 });
    this.svg.append(defs, this.bg, this.glow, this.ring);

    const lineLayer = el('g', {});
    const nodeLayer = el('g', {});
    this.packetLayer = el('g', {});
    this.tip.className = 'net-tip';
    this.tip.setAttribute('aria-live', 'polite');
    this.tip.addEventListener('pointerenter', () => clearTimeout(this.tipTimer)); // no fading while touched
    this.tip.addEventListener('pointerleave', () => this.tipId && this.showTip(this.tipId));
    this.svg.append(lineLayer, this.packetLayer, nodeLayer, this.more);
    nodeLayer.addEventListener('click', (e) => {
      const g = (e.target as Element).closest<SVGGElement>('.net-node');
      const row = g && this.rows.find((r) => r.group.contains(g));
      if (g?.dataset.system && row?.visible) this.showTip(g.dataset.system === this.tipId ? '' : g.dataset.system);
    });
    document.addEventListener('click', (e) => {
      const t = e.target as Node;
      if (!this.svg.contains(t) && !this.tip.contains(t)) this.showTip('');
    });

    for (const a of AUTOMATIONS) {
      const lines = el('path', { d: rowPath(H / 2), class: 'net-line' });
      lineLayer.append(lines);
      const outer = el('g', { transform: `translate(0 ${H / 2})` });
      const group = el('g', { class: 'net-row' });
      const dstChip = chip(W - CHIP_W - 4, a.to, 'dst');
      group.append(node(4, a.from, 'src'), node(W - NODE_W - 4, a.to, 'dst'), chip(4, a.from, 'src'), dstChip);
      outer.append(group);
      nodeLayer.append(outer);
      this.rows.push({ id: a.id, y: H / 2, outer, group, lines, dstChip, visible: false, rate: 0, budget: 0, acc: 0, len: 0 });
    }
    this.counts = this.rows.map(() => 0);
    this.relayout();
    // The compact strip (057) has its own layout (062): the map's size follows the hero's class and size.
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(() => {
        const r = this.svg.getBoundingClientRect();
        const compact = !!this.svg.parentElement?.classList.contains('compact') && r.height > 0;
        this.setGeo(compact ? { w: compactWidth(r.width / r.height), h: COMPACT_H, nodeW: CHIP_W, compact } : BIG);
      }).observe(this.svg);
    }
    // Battery saver (049): nobody sees packets on a map that is out of view, so frame() then does nothing.
    if (typeof IntersectionObserver === 'function') {
      new IntersectionObserver((entries) => {
        for (const e of entries) this.onScreen = e.isIntersecting;
      }).observe(this.svg);
    }
  }

  /** Show the tip for a system (restarting its timer), or hide it for ''. */
  private showTip(id: string): void {
    clearTimeout(this.tipTimer);
    this.tipId = id;
    this.tip.classList.toggle('on', id !== '');
    if (!id) return;
    this.tip.textContent = nodeTip(id);
    this.tipTimer = setTimeout(() => this.showTip(''), tipDurationMs(this.tip.textContent));
  }

  /** Switch between the big map and the compact strip (or a new strip width) and lay the rows out again. */
  private setGeo(geo: Geo): void {
    const g = this.geo;
    if (g.w === geo.w && g.h === geo.h && g.compact === geo.compact) return;
    this.geo = geo;
    const { w, h, compact } = geo;
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    this.bg.setAttribute('width', String(w + 48));
    this.bg.setAttribute('height', String(h + 48));
    for (const c of [this.glow, this.ring]) {
      c.setAttribute('cx', String(w / 2));
      c.setAttribute('cy', String(h / 2));
    }
    this.glow.setAttribute('r', compact ? '40' : '110');
    this.more.setAttribute('x', String(w / 2));
    this.more.setAttribute('y', String(h - 5));
    for (const row of this.rows) row.dstChip.setAttribute('transform', `translate(${w - CHIP_W - 4} 0)`);
    this.relayout();
  }

  /** Pick and place the rows for the current size from the latest integration counts. */
  private relayout(): void {
    if (this.geo.compact) {
      const { shown, more } = pickCompactRows(this.counts);
      this.more.textContent = more > 0 ? T.netMore(more) : '';
      this.layout(shown);
    } else {
      this.layout(pickRows(this.counts.map((c) => c > 0), MAX_ROWS));
    }
  }

  /** Show exactly the given rows, evenly spaced; hide the rest. */
  private layout(shown: number[]): void {
    const geo = this.geo;
    const key = `${geo.w}x${geo.h}:${shown.join(',')}`;
    if (key === this.layoutKey) return;
    this.layoutKey = key;
    const ys = geo.compact ? compactYs(shown.length, geo.h) : rowYs(shown.length, geo.h);
    shown.forEach((i, k) => {
      const row = this.rows[i]!;
      const y = ys[k]!;
      row.y = y;
      row.lines.setAttribute('d', rowPath(y, geo));
      row.outer.setAttribute('transform', `translate(0 ${y})`);
      row.len = 0;
    });
    const keep = new Set(shown);
    this.rows.forEach((row, i) => this.setRowVisible(row, keep.has(i)));
    this.packets = this.packets.filter((p) => p.row.visible || (p.el.remove(), false));
  }

  private setRowVisible(row: Row, visible: boolean): void {
    if (row.visible === visible) return;
    row.visible = visible;
    row.group.classList.toggle('shown', visible);
    row.lines.classList.toggle('shown', visible);
    // A newly unlocked system "boots" and its line is drawn in (not on the first layout after load).
    if (visible && this.booted) for (const e of [row.group, row.lines]) flashClass(e, 'boot', 1000);
  }

  /** Update rows (counts and KP/s shares per automation id, see core networkFlow) and the hub tier; returns a tier gained in play. */
  update({ counts, shares, total: kps }: NetworkFlow): number | null {
    this.counts = this.rows.map((row) => counts[row.id] ?? 0);
    const owned = this.counts.map((c) => c > 0);
    this.relayout();
    this.rows.forEach((row, i) => {
      const busy = owned[i]! && row.visible;
      row.lines.classList.toggle('active', busy);
      row.rate = busy ? Math.max(0.6, flowRate(shares[row.id] ?? 0)) : 0;
    });
    const budget = packetBudget(this.rows.map((r) => r.rate), MAX_PACKETS - 8); // room for manual packets
    this.rows.forEach((row, i) => { row.budget = budget[i]!; });
    const tier = hubTier(kps);
    const gained = this.booted && tier > this.tier ? tier : null;
    this.tier = tier;
    this.svg.dataset.tier = String(tier);
    this.booted = true;
    return gained;
  }

  /** A manual sync: a bright packet travels along a random active line from its source into the hub. */
  pulse(): void {
    const visible = this.rows.filter((r) => r.visible);
    const row = visible[Math.floor(Math.random() * visible.length)] ?? this.rows[0]!;
    this.spawn(row, true);
  }

  private spawn(row: Row, manual: boolean): void {
    if (this.packets.length >= MAX_PACKETS) this.packets.shift()?.el.remove();
    const c = el('circle', { r: manual ? 5 : 3.2, class: manual ? 'packet manual' : 'packet' });
    this.packetLayer.append(c);
    const speed = manual ? 1.2 : 0.25 + row.rate * 0.05 + Math.random() * 0.1; // busy lines run faster
    this.packets.push({ row, t: 0, speed, el: c, manual });
  }

  /** Advance animation by dt seconds. */
  frame(dt: number): void {
    // 30 fps is plenty; rAF already pauses while the app is hidden, and off screen nothing moves.
    const { acc, step } = frameStep(this.frameAcc, dt, this.onScreen);
    this.frameAcc = acc;
    if (step <= 0) return;
    dt = step;
    for (const row of this.rows) {
      if (row.rate <= 0 || this.calm?.matches) continue;
      row.acc = Math.min(1, row.acc + row.rate * dt);
      if (row.acc < 1) continue;
      row.acc = 0;
      if (this.packets.filter((p) => p.row === row && !p.manual).length < row.budget) this.spawn(row, false);
    }
    const keep: Packet[] = [];
    for (const p of this.packets) {
      p.t += p.speed * dt;
      if (p.t >= (p.manual ? 0.5 : 1)) {
        p.el.remove();
        continue;
      }
      if (!p.row.len) p.row.len = p.row.lines.getTotalLength();
      const pt = p.row.lines.getPointAtLength(p.t * p.row.len);
      p.el.setAttribute('cx', pt.x.toFixed(1));
      p.el.setAttribute('cy', pt.y.toFixed(1));
      keep.push(p);
    }
    this.packets = keep;
  }
}
