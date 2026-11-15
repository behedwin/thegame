import type { TicketDef } from '../types';

export default {
  id: 'we-have-an-api',
  from: 'skoloff',
  title: '"Vi har ett API"',
  text: 'Säljaren lovade ett API. Det visade sig vara ett kalkylark som mejlas varje måndag klockan 07.12.',
  choices: [
    {
      label: 'Läs in mejlet automatiskt',
      outcome: 'Din brevlåda är nu ett API. Det är inte snyggt, men det är punktligt.',
      effect: { kind: 'prodMult', mult: 1.25, durationMs: 60_000 },
    },
    {
      label: 'Kopiera in arket för hand varje måndag',
      outcome: 'Måndagar har fått en ritual. Du blir mycket snabb på Ctrl+V.',
      effect: { kind: 'clickMult', mult: 1.5, durationMs: 60_000 },
    },
    {
      label: 'Fråga efter dokumentationen',
      outcome: 'Dokumentationen är ett kalkylark till. Men det har en flik som heter "API".',
      effect: { kind: 'lump', seconds: 12, minKp: 10 },
    },
  ],
} satisfies TicketDef;
