import { BALANCE } from '../balance';
import type { FocusDef } from '../types';

const F = BALANCE.focus.cloud;

export default {
  id: 'cloud',
  order: 2,
  name: 'Molnsatsning',
  desc: 'Förvaltningen har läst en rapport. Allt ska upp i molnet, och filerna får vänta.',
  unlockYear: 2,
  effects: [
    { kind: 'autoMult', targets: ['api', 'flow'], mult: F.boost },
    { kind: 'autoMult', targets: ['csv', 'nightly'], mult: F.cut },
  ],
} satisfies FocusDef;
