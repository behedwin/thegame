import type { AutomationDef } from '../types';

export default {
  id: 'licenses',
  order: 120,
  name: 'Läromedelslicenser',
  desc: 'Varje elev får rätt bok. Licenserna räcker till alla som slutade i fjol.',
  baseCost: 120_000_000_000_000,
  kps: 3_000_000_000,
  from: 'glidrups',
  to: 'skoloff',
  unlockYear: 12,
  milestoneNames: [
    'Licensen följer eleven, inte klassen',
    'Ingen elev har tre exemplar av samma bok',
    'Bytet av grupp syns innan provet',
    'Licenserna räcker, ända till höstlovet',
  ],
} satisfies AutomationDef;
