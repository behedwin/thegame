import type { AutomationDef } from '../types';

export default {
  id: 'nightly',
  order: 20,
  name: 'Nattlig synk',
  desc: 'Körs 03:00. Kraschar 03:01. Ingen märker något förrän måndag.',
  baseCost: 150,
  kps: 3,
  from: 'edsovo',
  to: 'utbildningsmoln',
} satisfies AutomationDef;
