import type { TicketDef } from '../types';

export default {
  id: 'procurement-400-pages',
  from: 'regionstadens-utbildningsforvaltning',
  title: 'Upphandlingsunderlaget är på 400 sidor',
  text: 'Vi behöver ditt underlag om integrationen senast i morgon. Den finns på sidorna 212, 213 och 398.',
  choices: [
    {
      label: 'Läs alla 400 sidorna',
      outcome: 'Du hittar ett krav om fax på sidan 77 och räddar hela upphandlingen. Produktion ×1,25 i 60 s.',
      effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
    },
    {
      label: 'Läs de tre sidorna om integration',
      outcome: 'Snabbt, precist och klart före lunch. Du får en klump KP.',
      effect: { kind: 'lump', seconds: 15, minKp: 10 },
    },
    {
      label: 'Boka ett möte om underlaget',
      outcome: 'Mötet tar fram ett underlag om underlaget. Du hinner klicka mycket. KP/klick ×2 i 30 s.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
    },
  ],
} satisfies TicketDef;
