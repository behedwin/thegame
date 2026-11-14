// Merit upgrades: bought with Meriter earned from "Nytt läsår" (prestige). Permanent.
export type MeritEffect =
  | { kind: 'prodPct'; pct: number }
  | { kind: 'clickPct'; pct: number }
  | { kind: 'offlineHours'; hours: number }
  | { kind: 'startAutomation'; id: string; count: number };

export interface MeritDef {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  effect: MeritEffect;
}

export const MERITS: readonly MeritDef[] = [
  {
    id: 'reputation',
    name: 'Branschrykte',
    desc: 'Folk på mässor nickar igenkännande. +50 % produktion per nivå.',
    baseCost: 1,
    costGrowth: 1.6,
    maxLevel: 100,
    effect: { kind: 'prodPct', pct: 50 },
  },
  {
    id: 'shortcuts',
    name: 'Kortkommandon',
    desc: 'Kopiera, klistra in, befordran. +100 % KP per klick per nivå.',
    baseCost: 1,
    costGrowth: 1.5,
    maxLevel: 100,
    effect: { kind: 'clickPct', pct: 100 },
  },
  {
    id: 'summer',
    name: 'Längre sommarlov',
    desc: 'Systemen jobbar medan du badar. +2 h offlinetak per nivå.',
    baseCost: 2,
    costGrowth: 2,
    maxLevel: 8,
    effect: { kind: 'offlineHours', hours: 2 },
  },
  {
    id: 'templates',
    name: 'Färdiga mallar',
    desc: 'Börja varje läsår med 5 CSV-importer per nivå.',
    baseCost: 3,
    costGrowth: 2,
    maxLevel: 5,
    effect: { kind: 'startAutomation', id: 'csv', count: 5 },
  },
];
