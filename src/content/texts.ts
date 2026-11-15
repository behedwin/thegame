// All player-facing UI strings (Swedish). Game data texts live next to their data.
import { BALANCE } from './balance';
import type { CustomerDef, CustomerEffect, FocusEffect, SeasonDef } from './types';

/** 25000 -> "25\u00a0000" (Swedish digit grouping, no locale dependency). */
const groupDigits = (n: number): string => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

const num = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');
const buffName = (mult: number, click: boolean) => `${click ? 'KP/klick' : 'Produktion'} ×${num(mult)}`;
const pctText = (n: number) => `${num(n)}\u00a0%`;

export const T = {
  title: 'Skolintegratören',
  currency: 'KP',
  currencyLong: 'Kunskapspoäng',
  perSecond: 'KP/s',
  perEach: (kps: string) => `+${kps} KP/s styck`,
  perClick: 'KP/klick',
  hubLabel: 'SYNKA',
  hubAria: 'Synka data manuellt',
  heroExpand: 'Tryck för att visa hela kartan',
  hubTiers: ['Skolnav', 'Kommunnav', 'Regionnav', 'Nationellt nav', 'Datahjärta'],
  hubTierUp: (name: string) => `Navet har uppgraderats till ${name}`,
  sourceSystems: 'Källsystem',
  targetSystems: 'Målsystem',
  /** Owned integrations that do not fit in the compact map strip (062). */
  netMore: (n: number) => `+${n}`,
  tabs: { automations: 'Integrationer', upgrades: 'Uppgraderingar', prestige: 'Läsår', achievements: 'Troféer' },
  a11y: { tabsAria: 'Vyer', buyAria: (name: string, label: string) => `Köp ${name}: ${label.replace(/\n/g, ' ')}` },
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
    progress: (have: number, need: number) => `${groupDigits(have)} av ${groupDigits(need)}`,
    toast: (name: string) => `Trofé: ${name}! +1\u00a0% produktion`,
    toastMany: (n: number) => `${n} nya troféer! +${n}\u00a0% produktion`,
  },
  toastMilestone: (name: string, count: number, named?: string | null) =>
    `Milstolpe! ${count} st ${name}: produktionen ×2${named ? `. ${named}!` : ''}`,
  season: { banner: (s: SeasonDef) => `${s.name}: ${s.desc}`, aria: 'Säsong just nu' },
  eventTap: 'Tryck för att lösa!',
  tips: {
    aria: 'Tips',
    sync: 'Tips: Tryck på SYNKA för att flytta data och tjäna KP.',
    buy: 'Tips: Köp din första integration nedan, så synkar den åt dig.',
    event: 'Tips: Ett event! Tryck snabbt innan tiden tar slut.',
    inbox: 'Tips: Ett ärende i inkorgen! Svara när du vill. Varje val ger en bonus, och ärenden går aldrig ut.',
    close: 'Stäng tipset',
    off: 'Inga fler tips',
    next: 'Nästa',
    done: 'Klar',
    tour: {
      sync: 'Tryck på SYNKA för att flytta data mellan systemen och tjäna KP.',
      buy: 'Köp integrationer i listan nedan. De synkar åt dig, även när du är borta.',
      event: 'Ibland dyker ett event upp här. Tryck snabbt innan tiden tar slut så får du en bonus.',
      help: 'Hjälpen hittar du under kugghjulet, under Hjälp.',
    },
  },
  buffActive: (mult: number, sec: number, click = false) => `${buffName(mult, click)} · ${sec} s`,
  receipt: (text: string, result: string) => `${text} ${result}.`,
  effect: {
    buff: (mult: number, sec: number, click: boolean) => `${buffName(mult, click)} i ${sec} s`,
    lump: (kp: string) => `+${kp} KP`,
    now: (lump: string) => `${lump} direkt`,
    worth: (buff: string, kp: string, clicksPerSec?: number) => `${buff} · ≈ +${kp} KP${clicksPerSec ? ` vid ${clicksPerSec} klick/s` : ''}`,
    /** Assumed tap rate when estimating what a click buff is worth (a steady, not frantic, pace). */
    clicksPerSec: 3,
  },
  welcomeTitle: 'Välkommen tillbaka!',
  welcomeBody: (system: string, amount: string) => `Medan du var borta synkade ${system} ${amount} KP.`,
  welcomeAway: (away: string, capped: boolean, cap: string) =>
    capped ? `Du var borta ${away}. Systemen orkade jobba i ${cap}.` : `Du var borta ${away}.`,
  morning: { ask: 'Hur börjar du dagen?', coffee: 'Kaffe (+20 %)', inbox: 'Inkorgen (+1 ärende)', standup: 'Standup (klick ×2, 2 min)' },
  welcomeTickets: (n: number) => (n === 1 ? 'Ett ärende väntar i inkorgen.' : `${n} ärenden väntar i inkorgen.`),
  inbox: {
    label: (n: number) => (n > 0 ? `Inkorg ${n}` : 'Inkorg'),
    aria: (n: number) => `Inkorg, ${n} obesvarade ärenden`,
    from: (name: string) => `Från: ${name}`,
    later: 'Senare',
    note: `Ärenden väntar tills du svarar. Högst ${BALANCE.tickets.cap} åt gången.`,
    empty: 'Inga ärenden just nu. Alla är nöjda, för stunden.',
    archive: (n: number) => `Du har löst ${n} ${n === 1 ? 'ärende' : 'ärenden'}. Skolorna tackar.`,
    title: 'Inkorg',
    close: 'Stäng',
  },
  celebrate: { double: '×2', signed: 'Påskrivet!' },
  prestige: {
    title: 'Nytt läsår',
    intro: 'Börja om från noll med nya kunder, men behåll dina Meriter. Meriter köper permanenta bonusar som gör varje läsår snabbare.',
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
    unlockNext: (names: string) => `Nästa läsår låser upp: ${names}`,
    unlockLater: (year: number, names: string) => `Läsår ${year}: ${names}`,
    unlocked: (names: string) => `Ny integrationstyp: ${names}`,
    summaryTitle: 'Läsåret som gick',
    summaryKp: (kp: string) => `${kp} KP intjänat`,
    summaryCustomers: (n: number) => (n === 1 ? '1 kund skrev på' : `${n} kunder skrev på`),
    summaryIntegrations: (n: number) => (n === 1 ? '1 integration i drift' : `${n} integrationer i drift`),
    summaryMerits: (n: string) => `${n} Meriter att hämta ut`,
    summaryBest: 'Ditt bästa läsår hittills!',
  },
  goal: {
    title: 'Hela Sverige på en standard',
    count: (n: number, total: number) => `Anslutna kommuner: ${n} av ${total}`,
    short: (n: number, total: number) => `${n}/${total} kommuner`,
    aria: 'Anslutna kommuner',
    nextYear: (n: number) => `Nästa läsår: +${n} kommuner`,
    chapters: 'Berättelsen hittills',
  },
  focus: {
    pickTitle: 'Läsårets inriktning',
    pickIntro: `Vad satsar skolorna på i år? Allt utom Vanligt läsår ger +${num((BALANCE.focus.meritBonus - 1) * 100)} % Meriter vid nästa nytt läsår.`,
    aria: (name: string) => `Läsårets inriktning: ${name}. Tryck för detaljer.`,
    meritBonus: `+${num((BALANCE.focus.meritBonus - 1) * 100)} % Meriter vid nästa nytt läsår`,
    none: 'Inga ändringar',
    close: 'Stäng',
    /** One rule change; `names` are the targeted integrations ('' for all). */
    effect: (e: FocusEffect, names: string): string =>
      e.kind === 'autoMult' ? `${names || 'Alla integrationer'} ×${num(e.mult)}`
        : e.kind === 'prodMult' || e.kind === 'clickMult' ? buffName(e.mult, e.kind === 'clickMult')
        : e.kind === 'costMult' ? `${e.targets === 'all' ? 'Alla priser' : 'Integrationernas priser'} ×${num(e.mult)}`
        : e.kind === 'eventCooldownMult' ? `Händelser oftare (väntetid ×${num(e.mult)})`
        : `Milstolpar ger ×${num(e.mult)} i stället för ×${BALANCE.milestoneMult}`,
  },
  help: { open: 'Hjälp', title: 'Så spelar du', close: 'Stäng', replay: 'Visa introduktionen igen' },
  settings: {
    title: 'Inställningar',
    sound: 'Ljud',
    volume: 'Volym',
    vibration: 'Vibration',
    wipe: 'Radera all spelhistorik',
    wipeConfirm: 'Tryck igen för att radera. Går inte att ångra.',
    saveText: 'Sparning som text. Klistra in en här för att importera.',
    export: 'Exportera sparning',
    copied: 'Sparningen är kopierad. Spara texten på ett säkert ställe.',
    import: 'Importera sparning',
    importConfirm: 'Tryck igen för att ersätta ditt spel. Går inte att ångra.',
    importError: 'Texten är ingen giltig sparning. Inget har ändrats.',
    notifyOfflineCap: 'Notis när systemen har jobbat klart offline',
    notifySeason: 'Notis när en ny säsong börjar',
    tips: 'Tips för nya spelare',
    sciNotation: 'Vetenskaplig notation (1,23e6)',
    notifyNote: 'Notiserna är av från början och skapas bara på din enhet.',
    notifyDenied: 'Notiser är avstängda för appen i telefonens inställningar.',
    about: 'Gratis. Inga annonser, inga köp och ingen datainsamling. Allt sparas bara på din enhet.',
    close: 'Stäng',
  },
  notify: {
    offlineTitle: 'Systemen har jobbat klart', seasonTitle: (name: string) => `${name} har börjat`,
    offlineBody: (cap: string) => `Integrationerna har synkat i ${cap} och tar en paus tills du tittar in.`,
  },
  changelog: {
    title: 'Nyheter i spelet', open: 'Nyheter i spelet', newsTitle: 'Nytt sedan sist',
    updated: (n: number) => `Spelet har uppdaterats: ${n} ${n === 1 ? 'nyhet' : 'nyheter'}`, show: 'Visa', hide: 'Dölj nyheten', version: (v: string) => `Version ${v}`, close: 'Stäng', earlier: 'Tidigare',
    day: (iso: string) => {
      const [y, m, d] = iso.split('-').map(Number);
      const months = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
      return `${d} ${months[(m ?? 1) - 1]} ${y}`;
    },
  },
  stats: {
    title: 'Statistik',
    open: 'Statistik',
    totalEarned: 'Totalt intjänat',
    thisYear: 'Intjänat i år',
    bestYear: 'Bästa läsår',
    purchases: 'Köp totalt',
    clicks: 'Manuella synkningar',
    events: 'Lösta händelser',
    tickets: 'Besvarade ärenden',
    schoolYears: 'Läsår',
    meritsEarned: 'Meriter totalt',
    achievements: 'Troféer',
    of: (n: number, total: number) => `${n} av ${total}`,
    timePlayed: 'Tid spelat',
    note: 'Tid spelat räknar bara tid med spelet öppet.',
    close: 'Stäng',
  },
  cancel: 'Avbryt',
  saveError: 'Sparfilen kunde inte läsas. En kopia har sparats och ett nytt spel startas.',
};
