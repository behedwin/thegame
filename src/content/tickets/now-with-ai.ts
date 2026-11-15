import type { TicketDef } from '../types';

export default {
  id: 'now-with-ai',
  from: 'stressys',
  title: '"Nu med AI!"',
  text: 'Leverantören har lanserat en AI-funktion. Vi har testat den. Det är en CSV-export med en ny ikon som glittrar.',
  choices: [
    { label: 'Använd exporten, den är faktiskt bra', effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
      outcome: 'Glittret var onödigt men filen är korrekt. Synken rullar på.' },
    { label: 'Skriv "AI-driven" på din egen integration också', effect: { kind: 'lump', seconds: 18, minKp: 15 },
      outcome: 'Ingen frågar vad det betyder. Kunden är imponerad.' },
  ],
} satisfies TicketDef;
