import type { TicketDef } from '../types';

export default {
  id: 'license-per-second',
  from: 'skolkoncernen-expansiva',
  title: 'Ny licensmodell: per elev, per inloggning och per sekund',
  text: 'Leverantören har uppdaterat prislistan. Den kommer nu som ett kalkylark med tre flikar och en makro som inte får köras.',
  choices: [
    { label: 'Förhandla', effect: { kind: 'prodMult', mult: 1.5, durationMs: 30_000 },
      outcome: 'Ni enas om "per elev, men bara på vardagar". Det känns som en seger.' },
    { label: 'Betala och gå vidare', effect: { kind: 'lump', seconds: 15, minKp: 10 },
      outcome: 'Fakturan går till ekonomi. Du går till nästa ärende.' },
    { label: 'Boka ett möte', effect: { kind: 'clickMult', mult: 2, durationMs: 25_000 },
      outcome: 'Mötet faktureras per minut. Du klickar snabbt för att hinna före.' },
  ],
} satisfies TicketDef;
