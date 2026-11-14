import type { AutomationDef } from '../types';

export default {
  id: 'api',
  order: 40,
  name: 'API-integration',
  desc: 'REST, JSON och en dokumentation som senast uppdaterades 2014.',
  baseCost: 30_000,
  kps: 220,
  from: 'paron',
  to: 'gurgel',
  milestoneNames: [
    'Dokumentationen har uppdaterats till 2017',
    'API:et svarar med rätt statuskod',
    'Paginering fungerar på första försöket',
    'Versionsnumret har passerat v2-final',
  ],
} satisfies AutomationDef;
