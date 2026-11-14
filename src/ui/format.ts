// Swedish number and time formatting.
import { Decimal } from '../core/state';

// Swedish short scale names: miljon, miljard, biljon, biljard, triljon, triljard, kvadriljon, kvadriljard.
const SUFFIXES = ['M', 'md', 'bn', 'bd', 'tn', 'td', 'kvn', 'kvd'];
const NBSP = ' ';

function groupThousands(n: number): string {
  const s = Math.floor(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

function threeSig(x: number): string {
  // x in [1, 1000)
  const decimals = x < 10 ? 2 : x < 100 ? 1 : 0;
  const factor = Math.pow(10, decimals);
  const truncated = Math.floor(x * factor + 1e-9) / factor;
  return truncated.toFixed(decimals).replace('.', ',');
}

/** Format a Decimal or number for display: "12,3", "123 456", "1,23 M", "4,56e42". */
export function fmt(value: Decimal | number): string {
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (!Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent)) return '–';
  if (d.lt(0)) return '-' + fmt(d.neg());
  if (d.lt(100)) {
    const n = d.toNumber();
    if (Number.isInteger(n)) return n.toString();
    return (Math.floor(n * 10 + 1e-9) / 10).toFixed(1).replace('.', ',').replace(/,0$/, '');
  }
  if (d.lt(1e6)) return groupThousands(d.toNumber());
  const group = Math.floor(d.exponent / 3) - 2; // 1e6 -> 0
  const suffix = SUFFIXES[group];
  if (suffix !== undefined) {
    const scaled = d.mantissa * Math.pow(10, d.exponent % 3);
    return `${threeSig(scaled)}${NBSP}${suffix}`;
  }
  return `${threeSig(d.mantissa).replace(/,?0+$/, '')}e${d.exponent}`;
}

/** Format a duration in ms: "45 s", "12 min", "3 h 5 min". */
export function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}
