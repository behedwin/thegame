// The hero visual: source systems on the left, your integration hub in the middle,
// target systems on the right. Data packets flow along the lines.
import { AUTOMATIONS } from '../content/automations';
import { systemName } from '../content/names';

const NS = 'http://www.w3.org/2000/svg';
const W = 360;
const H = 300;
const HUB = { x: W / 2, y: H / 2 };
const NODE_W = 98;
const NODE_H = 34;
const MAX_PACKETS = 48;

interface Row {
  id: string;
  y: number;
  group: SVGGElement;
  lines: SVGPathElement;
  visible: boolean;
  /** Packets per second currently emitted by this row. */
  rate: number;
  acc: number;
  /** Cached path length (0 until first measured). */
  len: number;
}

interface Packet {
  row: Row;
  t: number;
  speed: number;
  el: SVGCircleElement;
  /** Manual packets start at the hub and only travel the second half. */
  manual: boolean;
}

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

function node(x: number, y: number, label: string, side: 'src' | 'dst'): SVGGElement {
  const g = el('g', { class: `net-node net-${side}` });
  g.append(
    el('rect', { x, y: y - NODE_H / 2, width: NODE_W, height: NODE_H, rx: 10 }),
  );
  const text = el('text', { x: x + NODE_W / 2, y: y + 4, 'text-anchor': 'middle' });
  text.textContent = label;
  g.append(text);
  return g;
}

export class NetworkView {
  readonly svg: SVGSVGElement;
  private rows: Row[] = [];
  private packets: Packet[] = [];
  private packetLayer: SVGGElement;

  constructor() {
    this.svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'network', 'aria-hidden': 'true' });
    const defs = el('defs', {});
    const grad = el('radialGradient', { id: 'hubGlow' });
    grad.append(el('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': 0.45 }));
    grad.append(el('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': 0 }));
    defs.append(grad);
    this.svg.append(defs, el('circle', { cx: HUB.x, cy: HUB.y, r: 110, fill: 'url(#hubGlow)', class: 'hub-glow' }));

    const lineLayer = el('g', {});
    const nodeLayer = el('g', {});
    this.packetLayer = el('g', {});
    this.svg.append(lineLayer, this.packetLayer, nodeLayer);

    const n = AUTOMATIONS.length;
    AUTOMATIONS.forEach((a, i) => {
      const y = 40 + (i * (H - 80)) / Math.max(1, n - 1);
      const path = `M ${NODE_W + 6} ${y} C ${HUB.x - 40} ${y}, ${HUB.x - 50} ${HUB.y}, ${HUB.x} ${HUB.y} ` +
        `C ${HUB.x + 50} ${HUB.y}, ${HUB.x + 40} ${y}, ${W - NODE_W - 6} ${y}`;
      const lines = el('path', { d: path, class: 'net-line' });
      lineLayer.append(lines);
      const group = el('g', { class: 'net-row' });
      group.append(node(4, y, systemName(a.from), 'src'), node(W - NODE_W - 4, y, systemName(a.to), 'dst'));
      nodeLayer.append(group);
      this.rows.push({ id: a.id, y, group, lines, visible: false, rate: 0, acc: 0, len: 0 });
    });
    this.setRowVisible(this.rows[0]!, true);
  }

  private setRowVisible(row: Row, visible: boolean): void {
    if (row.visible === visible) return;
    row.visible = visible;
    row.group.classList.toggle('shown', visible);
    row.lines.classList.toggle('shown', visible);
  }

  /** Update which rows are visible and how busy they are. counts/kps per automation id. */
  update(counts: Record<string, number>, kpsLog: Record<string, number>): void {
    this.rows.forEach((row, i) => {
      const owned = (counts[row.id] ?? 0) > 0;
      this.setRowVisible(row, owned || i === 0);
      row.lines.classList.toggle('active', owned);
      // 0.6 packets/s for a fresh integration, up to ~5/s for huge ones.
      row.rate = owned ? Math.min(5, 0.6 + (kpsLog[row.id] ?? 0) * 0.45) : 0;
    });
  }

  /** A manual sync: bright packet from the hub to a target system. */
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
    this.packets.push({ row, t: manual ? 0.5 : 0, speed: manual ? 1.4 : 0.35 + Math.random() * 0.15, el: c, manual });
  }

  /** Advance animation by dt seconds. */
  frame(dt: number): void {
    for (const row of this.rows) {
      if (row.rate <= 0) continue;
      row.acc += row.rate * dt;
      while (row.acc >= 1) {
        row.acc -= 1;
        this.spawn(row, false);
      }
    }
    const keep: Packet[] = [];
    for (const p of this.packets) {
      p.t += p.speed * dt;
      if (p.t >= 1) {
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
