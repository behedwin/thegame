import type { AutomationDef } from '../types';

export default {
  id: 'federation',
  order: 90,
  name: 'Inloggningsfederation',
  desc: 'En inloggning för alla tjänster. Varje tjänst tolkar den på sitt sätt.',
  baseCost: 25_000_000_000,
  kps: 5_500_000,
  from: 'fejd',
  to: 'sambo',
  unlockYear: 3,
  milestoneNames: [
    'Två tjänster litar på samma intyg',
    'Lösenordslappen på skärmen är borttagen',
    'Vikarien kommer in redan första dagen',
    'Ingen behöver fråga efter sitt lösenord. Den här veckan.',
  ],
} satisfies AutomationDef;
