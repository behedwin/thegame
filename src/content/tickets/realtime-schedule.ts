import type { TicketDef } from '../types';

export default {
  id: 'realtime-schedule',
  from: 'tidtabellen',
  title: 'Skolskjutsen vill ha schemat i realtid',
  text: 'Bussen kommer när lektionen redan har börjat. Kan vi få schemat "live"? Vi har en faxmaskin.',
  choices: [
    { label: 'Bygg ett riktigt API', effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
      outcome: 'Bussarna kommer i tid och schemat flyter.' },
    { label: 'Faxa schemat varje morgon', effect: { kind: 'lump', seconds: 18, minKp: 15 },
      outcome: 'Faxen tjuter som 1997. Det funkar, på något sätt.' },
    { label: 'Boka ett möte om vad "realtid" betyder', effect: { kind: 'clickMult', mult: 2, durationMs: 25_000 },
      outcome: 'Ni enas om "ungefär samma dag". Du hinner synka mycket under tiden.' },
  ],
} satisfies TicketDef;
