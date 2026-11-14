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
  milestoneNames: [
    'Nyckeln har flyttats från "nya_nycklar_FINAL2"',
    'Överföringen tål ett nätverksavbrott',
    'Filerna kommer fram i rätt ordning',
    'Ingen behöver längre ringa och fråga om filen kommit',
  ],
} satisfies AutomationDef;
