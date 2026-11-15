import type { TicketDef } from '../types';

export default {
  id: 'procurement-400-pages',
  from: 'regionstadens-utbildningsforvaltning',
  title: 'Upphandlingsunderlaget är på 400 sidor',
  text: 'Vi behöver ditt underlag om integrationen senast i morgon. Den finns på sidorna 212, 213 och 398.',
  choices: [
    { label: 'Läs alla 400 sidorna', effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
      outcome: 'Du hittar ett krav om fax på sidan 77 och räddar hela upphandlingen.' },
    { label: 'Läs de tre sidorna om integration', effect: { kind: 'lump', seconds: 15, minKp: 10 },
      outcome: 'Snabbt, precist och klart före lunch.' },
    { label: 'Boka ett möte om underlaget', effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
      outcome: 'Mötet tar fram ett underlag om underlaget. Du hinner klicka mycket.' },
  ],
} satisfies TicketDef;
