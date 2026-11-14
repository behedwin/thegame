// All player-facing UI strings (Swedish). Game data texts live next to their data.
import type { CustomerDef, CustomerEffect, SeasonDef } from './types';

const num = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');
const pctText = (n: number) => `${num(n)}\u00a0%`;

export const T = {
  title: 'Skolintegratören',
  currency: 'KP',
  currencyLong: 'Kunskapspoäng',
  perSecond: 'KP/s',
  perClick: 'KP/klick',
  hubLabel: 'SYNKA',
  hubAria: 'Synka data manuellt',
  sourceSystems: 'Källsystem',
  targetSystems: 'Målsystem',
  tabs: {
    automations: 'Integrationer',
    upgrades: 'Uppgraderingar',
    prestige: 'Läsår',
    achievements: 'Troféer',
  },
  owned: (n: number) => `${n} st`,
  level: (n: number, max: number) => (max === 1 ? (n > 0 ? 'Klar' : '') : `Nivå ${n}/${max}`),
  maxed: 'Max',
  bulk: { aria: 'Antal att köpa', one: '×1', ten: '×10', max: 'MAX' },
  buyMany: (n: number, cost: string) => `×${n}\n${cost} KP`,
  milestoneProgress: (next: number) => `Mot ${next} st: ×2`,
  allMilestones: 'Alla milstolpar nådda',
  lockedTeaser: 'Något nytt dyker upp snart …',
  customers: (n: number) => (n === 1 ? '1 kund' : `${n} kunder`),
  noCustomers: 'Inga kunder än. Synka lite data!',
  toastCustomer: (name: string) => `Ny kund: ${name}!`,
  customerEffect: (e: CustomerEffect): string =>
    e.kind === 'prodPct'
      ? `+${pctText(e.pct)} produktion`
      : e.kind === 'clickPct'
        ? `+${pctText(e.pct)} KP/klick`
        : `×${num(e.mult)} produktion`,
  customerKind: { kommun: 'Kommun', friskola: 'Friskola', koncern: 'Koncern' } satisfies Record<CustomerDef['kind'], string>,
  customerList: {
    title: 'Kundkontrakt',
    intro: 'Kunder skriver på när du tjänat tillräckligt med KP i år. Kommuner ger stabil produktion, friskolor bättre klick och koncerner multiplikatorer. Vid nytt läsår säger alla upp avtalen.',
    open: 'Visa kundkontrakt',
    next: (kp: string) => `Nästa kund vid ${kp} KP intjänat i år`,
    allSigned: 'Alla kunder har skrivit på i år!',
    total: (prod: number, click: number) => `Totalt: ×${num(prod)} produktion · ×${num(click)} KP/klick`,
    close: 'Stäng',
  },
  achievements: {
    summary: (n: number, total: number, pct: number) => `${n} av ${total} troféer · +${pctText(pct)} produktion`,
    done: 'Klar',
    toast: (name: string) => `Trofé: ${name}! +1\u00a0% produktion`,
    toastMany: (n: number) => `${n} nya troféer! +${n}\u00a0% produktion`,
  },
  toastMilestone: (name: string, count: number) => `Milstolpe! ${count} st ${name}: produktionen ×2`,
  season: {
    banner: (s: SeasonDef) => `${s.name}: ${s.desc}`,
    aria: 'Säsong just nu',
  },
  eventTap: 'Tryck för att lösa!',
  buffActive: (mult: number, sec: number) => `×${mult} produktion · ${sec} s`,
  welcomeTitle: 'Välkommen tillbaka!',
  welcomeBody: (system: string, amount: string) => `Medan du var borta synkade ${system} ${amount} KP.`,
  welcomeAway: (away: string, capped: boolean, cap: string) =>
    capped ? `Du var borta ${away}. Systemen orkade jobba i ${cap}.` : `Du var borta ${away}.`,
  welcomeOk: 'Hämta',
  prestige: {
    title: 'Nytt läsår',
    intro:
      'Börja om från noll med nya kunder, men behåll dina Meriter. Meriter köper permanenta bonusar som gör varje läsår snabbare.',
    pending: (n: string) => `Nytt läsår ger nu: ${n} Meriter`,
    next: (kp: string) => `Nästa merit vid ${kp} KP intjänat i år`,
    preview: (pct: string) => `Nästa läsår går ~${pct} % snabbare`,
    button: (n: string) => `Starta nytt läsår (+${n})`,
    confirm: 'Säker? Integrationer, uppgraderingar och KP nollställs.',
    confirmYes: 'Ja, nytt läsår!',
    merits: (n: string) => `${n} Meriter`,
    shopTitle: 'Meritbutik',
    done: (n: string) => `Nytt läsår! +${n} Meriter`,
    locked: 'Låses upp senare under läsåret.',
  },
  settings: {
    title: 'Inställningar',
    sound: 'Ljud',
    volume: 'Volym',
    vibration: 'Vibration',
    wipe: 'Radera all spelhistorik',
    wipeConfirm: 'Tryck igen för att radera. Går inte att ångra.',
    about: 'Gratis. Inga annonser, inga köp och ingen datainsamling. Allt sparas bara på din enhet.',
    close: 'Stäng',
  },
  cancel: 'Avbryt',
  saveError: 'Sparfilen kunde inte läsas. En kopia har sparats och ett nytt spel startas.',
};
