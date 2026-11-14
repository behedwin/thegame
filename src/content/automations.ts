// Automations = integration types. Each one moves data between two (parody) systems.
export interface AutomationDef {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  /** Base KP per second per owned unit. */
  kps: number;
  from: string;
  to: string;
}

export const AUTOMATIONS: readonly AutomationDef[] = [
  {
    id: 'csv',
    name: 'CSV-import',
    desc: 'Exportera, öppna i kalkylark, spara som semikolon, importera. Gråt lite.',
    baseCost: 15,
    kps: 0.4,
    from: 'skolmjuk',
    to: 'fklass',
  },
  {
    id: 'nightly',
    name: 'Nattlig synk',
    desc: 'Körs 03:00. Kraschar 03:01. Ingen märker något förrän måndag.',
    baseCost: 150,
    kps: 3,
    from: 'edsovo',
    to: 'utbildningsmoln',
  },
  {
    id: 'flow',
    name: 'Flödessynk',
    desc: 'Data flödar som en bäck. Ibland uppför.',
    baseCost: 2_000,
    kps: 25,
    from: 'vanlikum',
    to: 'mikromjuk',
  },
  {
    id: 'api',
    name: 'API-integration',
    desc: 'REST, JSON och en dokumentation som senast uppdaterades 2014.',
    baseCost: 30_000,
    kps: 220,
    from: 'paron',
    to: 'gurgel',
  },
];
