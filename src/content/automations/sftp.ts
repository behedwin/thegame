import type { AutomationDef } from '../types';

export default {
  id: 'sftp',
  order: 50,
  name: 'SFTP-överföring',
  desc: 'Säker filöverföring. Nyckeln ligger i en mapp som heter "nya_nycklar_FINAL2".',
  baseCost: 500_000,
  kps: 1_600,
  from: 'novaskamt',
  to: 'filgrottan',
} satisfies AutomationDef;
