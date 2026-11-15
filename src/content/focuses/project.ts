import { BALANCE } from '../balance';
import type { FocusDef } from '../types';

const F = BALANCE.focus.project;

export default {
  id: 'project',
  order: 4,
  name: 'Projektår',
  desc: 'Ett utvecklingsprojekt med workshops och post-it-lappar. Mycket handpåläggning, mycket som händer.',
  unlockYear: 4,
  effects: [
    { kind: 'clickMult', mult: F.click },
    { kind: 'eventCooldownMult', mult: F.cooldown },
    { kind: 'autoMult', targets: 'all', mult: F.auto },
  ],
} satisfies FocusDef;
