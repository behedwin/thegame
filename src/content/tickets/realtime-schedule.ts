import type { TicketDef } from '../types';

export default {
  id: 'realtime-schedule',
  from: 'tidtabellen',
  title: 'Skolskjutsen vill ha schemat i realtid',
  text: 'Bussen kommer när lektionen redan har börjat. Kan vi få schemat "live"? Vi har en faxmaskin.',
  choices: [
    {
      label: 'Bygg ett riktigt API',
      outcome: 'Bussarna kommer i tid och schemat flyter.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Faxa schemat varje morgon',
      outcome: 'Faxen tjuter som 1997. Det funkar, på något sätt.',
      effect: { kind: 'lump', seconds: 18, minKp: 15 },
    },
    {
      label: 'Boka ett möte om vad "realtid" betyder',
      outcome: 'Ni enas om "ungefär samma dag". Du hinner synka mycket under tiden.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 25_000 },
    },
  ],
} satisfies TicketDef;
