import type { SeasonDef } from '../types';

export default {
  id: 'nationella-prov',
  order: 3,
  name: 'Nationella prov',
  desc: 'Provperiod! Inloggningarna måste bara funka. Varje klick räknas dubbelt: ×2 KP/klick.',
  start: { month: 4, day: 7 },
  end: { month: 5, day: 10 },
  effect: { kind: 'clickMult', mult: 2 },
} satisfies SeasonDef;
