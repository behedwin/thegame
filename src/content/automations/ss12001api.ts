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
} satisfies AutomationDef;
