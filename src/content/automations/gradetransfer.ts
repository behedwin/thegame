import type { AutomationDef } from '../types';

export default {
  id: 'gradetransfer',
  order: 110,
  name: 'Betygsöverföring',
  desc: 'Betygen flyttas till arkivet. Kommatecken och allt.',
  baseCost: 7_000_000_000_000,
  kps: 300_000_000,
  from: 'skolmjuk',
  to: 'betygsvalvet',
  unlockYear: 9,
  milestoneNames: [
    'Inga F blir E på vägen',
    'Kurskoderna känns igen av båda sidor',
    'Rättelsen kommer fram före studenten',
    'Betygen kommer fram hela, på första försöket',
  ],
} satisfies AutomationDef;
