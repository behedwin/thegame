import type { UpgradeDef } from '../types';
export default {
  id: 'manifest', order: 70,
  name: 'Filnamnskonvention (godkänd av styrgrupp)',
  desc: 'Ingen fil heter längre "export(3).txt". SFTP-överföring och SCIM-provisionering ×2.',
  baseCost: 20_000_000, costGrowth: 40, maxLevel: 3,
  effect: { kind: 'autoMult', targets: ['sftp', 'scim'], mult: 2 },
} satisfies UpgradeDef;
