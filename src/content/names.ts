// Parody names for edtech/IT systems. Never use real brand names, logos or colour schemes.
// Rule: translation, pun or grading joke. Every name must be funny without industry knowledge.

export interface SystemName {
  id: string;
  name: string;
  /** What kind of system it pretends to be (shown as subtitle). */
  kind: string;
}

export const SYSTEMS: readonly SystemName[] = [
  { id: 'skolmjuk', name: 'Skolmjuk', kind: 'Skoladministration' },
  { id: 'utbildningsmoln', name: 'Utbildningsmoln', kind: 'Molntjänst' },
  { id: 'edsovo', name: 'Edsovo', kind: 'Elevregister' },
  { id: 'skoloff', name: 'Skoloff', kind: 'Läromedelsportal' },
  { id: 'utlasning', name: 'Utläsningstjänst', kind: 'Ljudläromedel' },
  { id: 'fklass', name: 'Fklass', kind: 'Lärplattform' },
  { id: 'vanlikum', name: 'Vanlikum', kind: 'Dokumentation' },
  { id: 'mikromjuk', name: 'Mikromjuk 366', kind: 'Kontorspaket' },
  { id: 'gurgel', name: 'Gurgel Arbetsyta', kind: 'Kontorspaket' },
  { id: 'paron', name: 'Päron Skolchef', kind: 'Enhetshantering' },
  // Invented on the same pattern:
  { id: 'skolvarket', name: 'Skolvärket', kind: 'Myndighetsrapport' },
  { id: 'desinfo', name: 'DesinfoMentor', kind: 'Omdömen' },
  { id: 'itsforgetting', name: 'itsforgetting', kind: 'Lärplattform' },
  { id: 'kaputt', name: 'Kaputt!', kind: 'Quizverktyg' },
  { id: 'quizlatt', name: 'Quizlätt', kind: 'Glosförhör' },
  { id: 'bankid', name: 'BänkID', kind: 'Inloggning' },
  { id: 'fejd', name: 'Skolfejderationen', kind: 'Inloggningsfederation' },
  { id: 'sinister', name: 'Sinister', kind: 'Schemaläggning' },
  { id: 'novaskamt', name: 'Novaskämt', kind: 'Schemaläggning' },
  { id: 'skola915', name: 'Skola 9–15', kind: 'Schemavisning' },
  { id: 'rostbok', name: 'Rostbok', kind: 'Elevdator' },
  { id: 'paronplatta', name: 'Päronplatta', kind: 'Surfplatta' },
  { id: 'prokrastinata', name: 'Prokrastinata', kind: 'Elevhälsojournal' },
  { id: 'passiv', name: 'Passiv Katalog', kind: 'Användarkatalog' },
  { id: 'ostamd', name: 'Ostämd', kind: 'Enhetshantering' },
  { id: 'utmarkt', name: 'Mikromjuk Utmärkt', kind: 'Kalkylark' },
  { id: 'delpoang', name: 'Mikromjuk Delpoäng', kind: 'Intranät' },
  { id: 'gurgelklassrum', name: 'Gurgel Klassrum', kind: 'Lärplattform' },
  { id: 'sambo', name: 'Sambo-federationen', kind: 'Identitetsfederation' },
  { id: 'ss12001', name: 'SS 12 001', kind: 'Standard (nästan)' },
];

const byId = new Map(SYSTEMS.map((s) => [s.id, s]));

export function systemName(id: string): string {
  return byId.get(id)?.name ?? id;
}

/** Customers: invented municipalities and independent schools. Never real organisations. */
export interface CustomerDef {
  name: string;
  kind: 'kommun' | 'friskola' | 'koncern';
  /** Signed when KP earned this school year reaches this amount. */
  atRunKp: number;
}

export const CUSTOMERS: readonly CustomerDef[] = [
  { name: 'Friskolan Lärandets Lustgård', kind: 'friskola', atRunKp: 50 },
  { name: 'Mellanby kommun', kind: 'kommun', atRunKp: 1_000 },
  { name: 'Byskolan i Ödmården', kind: 'friskola', atRunKp: 10_000 },
  { name: 'Glesbyggda kommun', kind: 'kommun', atRunKp: 80_000 },
  { name: 'Framtidsgymnasiet Framåt AB', kind: 'friskola', atRunKp: 400_000 },
  { name: 'Storköpings stad', kind: 'kommun', atRunKp: 2_000_000 },
  { name: 'Skolkoncernen Expansiva', kind: 'koncern', atRunKp: 10_000_000 },
  { name: 'Regionstadens utbildningsförvaltning', kind: 'kommun', atRunKp: 60_000_000 },
  { name: 'Riksskolor Holding', kind: 'koncern', atRunKp: 400_000_000 },
  { name: 'Hela Mellansverige (nästan)', kind: 'kommun', atRunKp: 3_000_000_000 },
];
