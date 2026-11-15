import type { AutomationDef } from '../types';

export default {
  id: 'schedexport',
  order: 100,
  name: 'Schemaexport',
  desc: 'Schemat skickas ut varje natt. Ändringarna kommer i morgon bitti.',
  baseCost: 400_000_000_000,
  kps: 40_000_000,
  from: 'sinister',
  to: 'skola915',
  unlockYear: 6,
  milestoneNames: [
    'Salarna finns i båda systemen',
    'Rastvakterna syns i schemat',
    'Ändringen före lunch syns efter lunch',
    'Schemat stämmer, fram till första sjukanmälan',
  ],
} satisfies AutomationDef;
