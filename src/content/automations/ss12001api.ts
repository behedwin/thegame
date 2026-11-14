import type { AutomationDef } from '../types';

export default {
  id: 'ss12001api',
  order: 70,
  name: 'SS 12 001-API',
  desc: 'Standarden alla följer. Var och en på sitt eget sätt.',
  baseCost: 100_000_000,
  kps: 100_000,
  from: 'ss12001',
  to: 'skoloff',
  milestoneNames: [
    'Två leverantörer följer standarden likadant',
    'Fältet "övrigt" används inte längre till allt',
    'Schemadata stämmer med verkligheten',
    'Standarden följs på samma sätt av alla. Nästan.',
  ],
} satisfies AutomationDef;
