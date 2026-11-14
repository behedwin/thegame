import type { TicketDef } from '../types';

export default {
  id: 'roadmap-q3',
  from: 'sinister',
  title: 'Funktionen kommer i Q3',
  text: 'Exporten vi har väntat på står på roadmapen till "Q3". Det har den gjort varje år sedan 2019.',
  choices: [
    {
      label: 'Bygg den själv',
      outcome: 'Det tog en eftermiddag. Leverantören frågar om de får visa den på mässan. Produktion ×1,5 i 30 s.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Vänta till Q3',
      outcome: 'Du använder väntetiden väl och får mycket annat gjort. Du får en klump KP.',
      effect: { kind: 'lump', seconds: 20, minKp: 15 },
    },
  ],
} satisfies TicketDef;
