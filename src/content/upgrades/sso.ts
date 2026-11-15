import type { UpgradeDef } from '../types';
export default {
  id: 'sso', order: 60,
  name: 'Enkel inloggning',
  desc: 'Ett lösenord för att styra dem alla. Flödessynk och API-integration ×2.',
  baseCost: 150_000, costGrowth: 40, maxLevel: 3,
  effect: { kind: 'autoMult', targets: ['flow', 'api'], mult: 2 },
} satisfies UpgradeDef;
