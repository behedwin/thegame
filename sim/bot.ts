// A bot that plays the pure core like a reasonably attentive human.
import { AUTOMATIONS } from '../src/content/registry';
import { MERITS } from '../src/content/registry';
import { UPGRADES } from '../src/content/registry';
import {
  answerTicket,
  buy,
  buyMerit,
  canBuy,
  canBuyMerit,
  chooseFocus,
  claimEvent,
  click,
  costOf,
  createInitialState,
  focusesForYear,
  getTicket,
  kpPerClick,
  kpPerSecond,
  meritCost,
  mulberry32,
  pendingMerits,
  prestige,
  receiveTicket,
  rollEvent,
  schoolYear,
  spawnEvent,
  tick,
  type GameState,
} from '../src/core';
import { BALANCE } from '../src/content/balance';

export interface SeedResult {
  seed: number;
  ok: boolean;
  error?: string;
  firstPurchaseSec: number | null;
  firstAutomationSec: number | null;
  firstPrestigeSec: number | null;
  /** Game time (s) of every prestige, in order. Round k lasts prestigeAtSec[k-1] - prestigeAtSec[k-2]. */
  prestigeAtSec: number[];
  /** Longest stretch in the first hour where nothing at all was affordable. */
  maxNoAffordableGapSecFirstHour: number;
  /** Mean seconds between purchases during the first 10 minutes. */
  meanPurchaseIntervalSecFirst10Min: number | null;
  purchases: number;
  prestiges: number;
  eventsSpawned: number;
  eventsClaimed: number;
  ticketsReceived: number;
  ticketsAnswered: number;
  /** How often each choice was picked, keyed "<ticket id>#<choice index>". */
  ticketChoices: Record<string, number>;
  /** Longest stretch over the whole run with nothing to do: nothing affordable and no unanswered ticket. */
  maxIdleGapSec: number;
  finalLog10TotalEarned: number;
  finalLog10Kps: number;
  merits: number;
}

const ITEM_IDS = [...UPGRADES.map((u) => u.id), ...AUTOMATIONS.map((a) => a.id)];

function finite(state: GameState): boolean {
  for (const d of [state.kp, state.runEarned, state.totalEarned, state.merits]) {
    if (!Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent) || d.lt(0)) return false;
  }
  return true;
}

/** Estimated KP/s gain (production + clicking) per KP spent. */
function value(state: GameState, id: string, cps: number): number {
  const before = kpPerSecond(state).add(kpPerClick(state).mul(cps));
  const after = buy(state, id);
  const gain = kpPerSecond(after).add(kpPerClick(after).mul(cps)).sub(before);
  return gain.div(costOf(state, id)).toNumber();
}

export function simulateSeed(seed: number, durationSec: number): SeedResult {
  const rng = mulberry32(seed);
  // Per-seed player profile.
  const activeCps = 3 + rng() * 3; // taps per second while actively playing
  const reactionSec = 1 + Math.floor(rng() * 4); // how often the player looks at the shop
  const eventSkill = 0.5 + rng() * 0.45; // chance to notice and tap an event
  const eventRng = mulberry32(seed ^ 0x9e3779b9);
  // Separate streams so tickets do not shift the rest of the simulation's randomness.
  const ticketRng = mulberry32(seed ^ 0x51ed270b);
  const answerRng = mulberry32(seed ^ 0x2545f491);

  const r: SeedResult = {
    seed,
    ok: true,
    firstPurchaseSec: null,
    firstAutomationSec: null,
    firstPrestigeSec: null,
    prestigeAtSec: [],
    maxNoAffordableGapSecFirstHour: 0,
    meanPurchaseIntervalSecFirst10Min: null,
    purchases: 0,
    prestiges: 0,
    eventsSpawned: 0,
    eventsClaimed: 0,
    ticketsReceived: 0,
    ticketsAnswered: 0,
    ticketChoices: {},
    maxIdleGapSec: 0,
    finalLog10TotalEarned: 0,
    finalLog10Kps: 0,
    merits: 0,
  };

  let s = createInitialState(0);
  let gap = 0;
  let idle = 0;
  let purchasesFirst10 = 0;
  try {
    for (let t = 1; t <= durationSec; t++) {
      // Players tap less once automation carries the run.
      const cps = t < 900 ? activeCps : activeCps * 0.4;
      s = click(s, Math.round(cps));
      s = tick(s, 1000);

      if (s.timeMs % BALANCE.events.rollIntervalMs === 0) {
        const ev = rollEvent(s, eventRng);
        if (ev) {
          s = spawnEvent(s, ev);
          r.eventsSpawned++;
          if (rng() < eventSkill) {
            s = claimEvent(s).state;
            r.eventsClaimed++;
          }
        }
      }

      const inboxBefore = s.inbox.length;
      s = receiveTicket(s, ticketRng);
      if (s.inbox.length > inboxBefore) r.ticketsReceived++;

      const any = ITEM_IDS.some((id) => canBuy(s, id));
      if (t <= 3600) {
        gap = any ? 0 : gap + 1;
        r.maxNoAffordableGapSecFirstHour = Math.max(r.maxNoAffordableGapSecFirstHour, gap);
      }
      idle = any || s.inbox.length > 0 ? 0 : idle + 1;
      r.maxIdleGapSec = Math.max(r.maxIdleGapSec, idle);

      if (t % reactionSec === 0) {
        // Answer every open ticket with a random choice.
        for (const id of s.inbox) {
          const choices = getTicket(id)?.choices.length ?? 0;
          const pick = Math.floor(answerRng() * choices);
          s = answerTicket(s, id, pick).state;
          r.ticketsAnswered++;
          r.ticketChoices[`${id}#${pick}`] = (r.ticketChoices[`${id}#${pick}`] ?? 0) + 1;
        }
        for (let n = 0; n < 100; n++) {
          let best: string | null = null;
          let bestValue = -1;
          for (const id of ITEM_IDS) {
            if (!canBuy(s, id)) continue;
            const v = value(s, id, cps);
            if (v > bestValue) {
              bestValue = v;
              best = id;
            }
          }
          if (!best) break;
          const bought = buy(s, best);
          // canBuy said yes but buy refused: a core bug. Stop instead of spinning 100 no-op buys per second.
          if (bought === s) throw new Error(`seed ${seed} t=${t}: canBuy(${best}) but buy() refused`);
          s = bought;
          r.purchases++;
          if (t <= 600) purchasesFirst10++;
          r.firstPurchaseSec ??= t;
          if (AUTOMATIONS.some((a) => a.id === best)) r.firstAutomationSec ??= t;
        }

        // Prestige when it at least doubles lifetime merits (min 2).
        const pending = pendingMerits(s);
        if (pending.gte(Math.max(2, s.meritsEarned.toNumber()))) {
          s = prestige(s);
          r.prestiges++;
          r.firstPrestigeSec ??= t;
          r.prestigeAtSec.push(t);
          // School-year focus (053): rotate deterministically through the unlocked ones, default included.
          const focuses = focusesForYear(schoolYear(s));
          s = chooseFocus(s, focuses[s.prestiges % focuses.length]!.id);
          for (let n = 0; n < 200; n++) {
            const affordable = MERITS.filter((m) => canBuyMerit(s, m.id));
            if (affordable.length === 0) break;
            affordable.sort((a, b) => meritCost(s, a.id).cmp(meritCost(s, b.id)));
            s = buyMerit(s, affordable[0]!.id);
          }
        }
      }

      if (!finite(s)) throw new Error(`Non-finite state at t=${t}`);
    }
  } catch (e) {
    r.ok = false;
    r.error = e instanceof Error ? e.message : String(e);
  }
  r.meanPurchaseIntervalSecFirst10Min = purchasesFirst10 > 0 ? 600 / purchasesFirst10 : null;
  r.finalLog10TotalEarned = s.totalEarned.gt(0) ? s.totalEarned.log10() : 0;
  const kps = kpPerSecond(s);
  r.finalLog10Kps = kps.gt(0) ? kps.log10() : 0;
  r.merits = s.meritsEarned.toNumber();
  if (!Number.isFinite(r.finalLog10TotalEarned) || !Number.isFinite(r.finalLog10Kps)) {
    r.ok = false;
    r.error ??= 'Non-finite final numbers';
  }
  return r;
}
