import type { UpgradeDef } from '../types';

export default {
  id: 'mapping',
  order: 40,
  name: 'Mappningsdokument_v7_FINAL_2',
  desc: 'Ett dokument som alla har läst. Påstås det. CSV-import och Nattlig synk ×2.',
  baseCost: 1500,
  costGrowth: 30,
  maxLevel: 3,
  effect: { kind: 'autoMult', targets: ['csv', 'nightly'], mult: 2 },
} satisfies UpgradeDef;
