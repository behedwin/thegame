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
  milestoneNames: [
    'CSV-importen har lärt sig UTF-8',
    'Semikolon och komma är nu vänner',
    'Kalkylarket öppnas utan att gråta',
    'Ingen rad heter längre "Kopia av Kopia"',
  ],
} satisfies AutomationDef;
