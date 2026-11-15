import type { UpgradeDef } from '../types';
export default {
  id: 'schemawiki', order: 80,
  name: 'Gemensam wiki för fältdefinitioner',
  desc: 'Nu vet alla vad "elevgrupp" betyder. Nästan alla. SS 12 001-API och LTI-koppling ×2.',
  baseCost: 4_000_000_000, costGrowth: 40, maxLevel: 3,
  effect: { kind: 'autoMult', targets: ['ss12001api', 'lti'], mult: 2 },
} satisfies UpgradeDef;
