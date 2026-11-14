// Upgrades: bought with KP, levelled (maxLevel 1 = one-time).
export type UpgradeEffect =
  | { kind: 'clickAdd'; amount: number }
  | { kind: 'clickMult'; mult: number }
  | { kind: 'clickKpsShare'; share: number }
  | { kind: 'autoMult'; targets: readonly string[] | 'all'; mult: number };

export interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  costGrowth: number;
  maxLevel: number;
  effect: UpgradeEffect;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: 'coffee',
    name: 'Extra kaffebryggare',
    desc: 'Kortare kö till kaffet. +1 KP per klick.',
    baseCost: 10,
    costGrowth: 4,
    maxLevel: 10,
    effect: { kind: 'clickAdd', amount: 1 },
  },
  {
    id: 'fika',
    name: 'Fika i personalrummet',
    desc: 'Kanelbullen är strategisk. KP per klick ×2.',
    baseCost: 400,
    costGrowth: 25,
    maxLevel: 4,
    effect: { kind: 'clickMult', mult: 2 },
  },
  {
    id: 'board',
    name: 'Interaktiv tavla',
    desc: 'Fungerar efter tre omstarter. Varje klick ger även 3 % av KP/s.',
    baseCost: 3_000,
    costGrowth: 12,
    maxLevel: 5,
    effect: { kind: 'clickKpsShare', share: 0.03 },
  },
  {
    id: 'mapping',
    name: 'Mappningsdokument_v7_FINAL_2',
    desc: 'Ett dokument som alla har läst. Påstås det. CSV-import och Nattlig synk ×2.',
    baseCost: 1_500,
    costGrowth: 30,
    maxLevel: 3,
    effect: { kind: 'autoMult', targets: ['csv', 'nightly'], mult: 2 },
  },
  {
    id: 'logs',
    name: 'Felloggar som någon läser',
    desc: 'Revolutionerande. Alla automationer ×1,5.',
    baseCost: 25_000,
    costGrowth: 20,
    maxLevel: 4,
    effect: { kind: 'autoMult', targets: 'all', mult: 1.5 },
  },
  {
    id: 'sso',
    name: 'Enkel inloggning',
    desc: 'Ett lösenord för att styra dem alla. Flödessynk och API-integration ×2.',
    baseCost: 150_000,
    costGrowth: 40,
    maxLevel: 3,
    effect: { kind: 'autoMult', targets: ['flow', 'api'], mult: 2 },
  },
];
