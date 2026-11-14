import type { AutomationDef } from '../types';

export default {
  id: 'csv',
  order: 10,
  name: 'CSV-import',
  desc: 'Exportera, öppna i kalkylark, spara som semikolon, importera. Gråt lite.',
  baseCost: 15,
  kps: 0.4,
  from: 'skolmjuk',
  to: 'fklass',
} satisfies AutomationDef;
