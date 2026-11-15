import type { TicketDef } from '../types';

export default {
  id: 'platform-of-platforms',
  from: 'storkopings-stad',
  title: 'Den nya plattformen som ersätter alla plattformar',
  text: 'Förvaltningen har köpt en plattform som ska ersätta alla andra plattformar. Införandet är klart. Nu har vi en plattform till.',
  choices: [
    {
      label: 'Koppla in den som alla andra',
      outcome: 'En nod till på kartan. Den gör samma sak som tre andra, men den gör det.',
      effect: { kind: 'lump', seconds: 15, minKp: 10 },
    },
    {
      label: 'Bygg en plattform som samlar alla plattformar',
      outcome: 'Metaplattformen fungerar förvånansvärt bra, tills någon köper en till.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Boka ett möte om plattformsstrategin',
      outcome: 'Strategin får en egen plattform. Du synkar för hand under tiden.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 30_000 },
    },
  ],
} satisfies TicketDef;
