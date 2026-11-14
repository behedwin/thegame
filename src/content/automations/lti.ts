import type { AutomationDef } from '../types';

export default {
  id: 'lti',
  order: 80,
  name: 'LTI-koppling',
  desc: 'Ett klick från lärplattformen till verktyget. Plus tre inloggningar.',
  baseCost: 1_500_000_000,
  kps: 800_000,
  from: 'kaputt',
  to: 'gurgelklassrum',
} satisfies AutomationDef;
