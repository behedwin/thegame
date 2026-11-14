import type { TicketDef } from '../types';

export default {
  id: 'license-per-second',
  from: 'skolkoncernen-expansiva',
  title: 'Ny licensmodell: per elev, per inloggning och per sekund',
  text: 'Leverantören har uppdaterat prislistan. Den kommer nu som ett kalkylark med tre flikar och en makro som inte får köras.',
  choices: [
    {
      label: 'Förhandla',
      outcome: 'Ni enas om "per elev, men bara på vardagar". Det känns som en seger. Produktion ×1,5 i 30 s.',
      effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
    },
    {
      label: 'Betala och gå vidare',
      outcome: 'Fakturan går till ekonomi. Du går till nästa ärende. Du får en klump KP.',
      effect: { kind: 'lump', seconds: 15, minKp: 10 },
    },
    {
      label: 'Boka ett möte',
      outcome: 'Mötet faktureras per minut. Du klickar snabbt för att hinna före. KP/klick ×2 i 25 s.',
      effect: { kind: 'clickMult', mult: 2, durationMs: 25_000 },
    },
  ],
} satisfies TicketDef;
