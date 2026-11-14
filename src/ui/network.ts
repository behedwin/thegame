// The hero visual: source systems on the left, your integration hub in the middle,
// target systems on the right. Data packets flow along the lines.
import { AUTOMATIONS, SYSTEMS, systemName, type SystemDef } from '../content/registry';
import { flashClass } from './celebrate';
import { reducedMotion } from './fx';

const NS = 'http://www.w3.org/2000/svg';
const W = 360;
const H = 300;
const HUB = { x: W / 2, y: H / 2 };
const NODE_W = 98;
const NODE_H = 34;
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

/** How long a tapped system's tip stays on the map. */
const TIP_MS = 4000;

/** Text shown when a system is tapped: its parody tagline, or its kind if it has none. */
export function nodeTip(id: string, systems: readonly SystemDef[] = SYSTEMS): string {
  const s = systems.find((x) => x.id === id);
  if (!s) return id;
  return s.tagline ? `${s.name}: ”${s.tagline}”` : `${s.name} · ${s.kind}`;
}

function rowPath(y: number): string {
  return `M ${NODE_W + 6} ${y} C ${HUB.x - 40} ${y}, ${HUB.x - 50} ${HUB.y}, ${HUB.x} ${HUB.y} ` +
    `C ${HUB.x + 50} ${HUB.y}, ${HUB.x + 40} ${y}, ${W - NODE_W - 6} ${y}`;
}

interface Row {
  id: string;
  y: number;
  /** Positions the row (translate); the inner group fades in and out. */
  outer: SVGGElement;
  group: SVGGElement;
  lines: SVGPathElement;
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
  const label = systemName(systemId);
  g.append(
    el('rect', { x, y: -NODE_H / 2, width: NODE_W, height: NODE_H, rx: 10 }),
  );
  const text = el('text', { x: x + NODE_W / 2, y: 4, 'text-anchor': 'middle' });
  text.textContent = label;
  g.append(text);
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
  private tip: SVGTextElement;
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
    this.svg.append(defs, el('rect', { x: -24, y: -24, width: W + 48, height: H + 48, fill: 'url(#netDots)', class: 'net-bg' }),
      el('circle', { cx: HUB.x, cy: HUB.y, r: 110, fill: 'url(#hubGlow)', class: 'hub-glow' }),
      el('circle', { cx: HUB.x, cy: HUB.y, r: 68, class: 'hub-ring' }));

    const lineLayer = el('g', {});
    const nodeLayer = el('g', {});
    this.packetLayer = el('g', {});
    this.tip = el('text', {
      x: W / 2, y: 14, 'text-anchor': 'middle', class: 'net-tip',
      style: 'fill: var(--muted); font-size: 10px; font-style: italic; opacity: 0; transition: opacity 0.3s; pointer-events: none',
    });
    this.svg.append(lineLayer, this.packetLayer, nodeLayer, this.tip);
    nodeLayer.addEventListener('click', (e) => {
      const g = (e.target as Element).closest<SVGGElement>('.net-node');
      const row = g && this.rows.find((r) => r.group.contains(g));
      if (g?.dataset.system && row?.visible) this.showTip(nodeTip(g.dataset.system));
    });

    for (const a of AUTOMATIONS) {
      const lines = el('path', { d: rowPath(H / 2), class: 'net-line' });
      lineLayer.append(lines);
      const outer = el('g', { transform: `translate(0 ${H / 2})` });
      const group = el('g', { class: 'net-row' });
      group.append(node(4, a.from, 'src'), node(W - NODE_W - 4, a.to, 'dst'));
      outer.append(group);
      nodeLayer.append(outer);
      this.rows.push({ id: a.id, y: H / 2, outer, group, lines, visible: false, rate: 0, budget: 0, acc: 0, len: 0 });
    }
    this.layout(pickRows(this.rows.map(() => false), MAX_ROWS));
  }

  /** Show a short, discreet line about a tapped system at the top of the map. */
  private showTip(text: string): void {
    this.tip.textContent = text;
    this.tip.style.opacity = '1';
    clearTimeout(this.tipTimer);
    this.tipTimer = setTimeout(() => { this.tip.style.opacity = '0'; }, TIP_MS);
  }

  /** Show exactly the given rows, evenly spaced; hide the rest. */
  private layout(shown: number[]): void {
    const key = shown.join(',');
    if (key === this.layoutKey) return;
    this.layoutKey = key;
    const ys = rowYs(shown.length, H);
    shown.forEach((i, k) => {
      const row = this.rows[i]!;
      const y = ys[k]!;
      if (row.y !== y) {
        row.y = y;
        row.lines.setAttribute('d', rowPath(y));
        row.outer.setAttribute('transform', `translate(0 ${y})`);
        row.len = 0;
      }
    });
    const keep = new Set(shown);
    this.rows.forEach((row, i) => this.setRowVisible(row, keep.has(i)));
    this.packets = this.packets.filter((p) => {
      if (p.row.visible) return true;
      p.el.remove();
      return false;
    });
  }

  private setRowVisible(row: Row, visible: boolean): void {
    if (row.visible === visible) return;
    row.visible = visible;
    row.group.classList.toggle('shown', visible);
    row.lines.classList.toggle('shown', visible);
    // A newly unlocked system "boots" and its line is drawn in (not on the first layout after load).
    if (visible && this.booted) for (const e of [row.group, row.lines]) flashClass(e, 'boot', 1000);
  }

  /** Update rows (counts and KP/s shares per automation id) and the hub tier; returns a tier gained in play. */
  update(counts: Record<string, number>, shares: Record<string, number>, kps: number): number | null {
    const owned = this.rows.map((row) => (counts[row.id] ?? 0) > 0);
    this.layout(pickRows(owned, MAX_ROWS));
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
    if (this.packets.length >= MAX_PACKETS) {
      const old = this.packets.shift();
      old?.el.remove();
    }
    const c = el('circle', { r: manual ? 5 : 3.2, class: manual ? 'packet manual' : 'packet' });
    this.packetLayer.append(c);
    const speed = manual ? 1.2 : 0.25 + row.rate * 0.05 + Math.random() * 0.1; // busy lines run faster
    this.packets.push({ row, t: 0, speed, el: c, manual });
  }

  /** Advance animation by dt seconds. */
  frame(dt: number): void {
    this.frameAcc += dt; // 30 fps is plenty; rAF already pauses while the app is hidden
    if (this.frameAcc < 1 / 31) return;
    dt = this.frameAcc;
    this.frameAcc = 0;
    const still = reducedMotion(); // with reduced motion no packets travel at all
    for (const row of this.rows) {
      if (row.rate <= 0 || still) continue;
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
