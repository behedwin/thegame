import { BALANCE } from '../balance';

const t = BALANCE.tickets;

export default {
  id: 'inkorgen',
  order: 5.5,
  title: 'Inkorgen och ärenden',
  body: [
    `Ungefär var ${t.intervalMs / 60_000}:e minut hör en skola eller leverantör av sig med ett ärende. Inkorgen rymmer ${t.cap} ärenden och slutar fyllas på när den är full. Ärenden går aldrig ut, och du straffas aldrig för att vänta.`,
    'Varje svar ger något: tillfälligt högre produktion, tillfälligt fler KP per klick eller en klump KP direkt. Inget svar är fel, bara olika avvägningar.',
  ],
} satisfies import('../types').HelpSectionDef;
