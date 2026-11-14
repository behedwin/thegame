// Inbox tickets: short support cases with 2-3 trade-off answers. Randomness is injected.
// No dark patterns: tickets never expire, ignoring them costs nothing, and the inbox stops filling when full.
import { BALANCE } from '../content/balance';
import { byId, TICKETS, type TicketChoice, type TicketDef } from '../content/registry';
import { applyEffect, type Rng } from './events';
import { Decimal, type GameState } from './state';

export const getTicket = byId(TICKETS);

/** Add one random ticket not already in the inbox, or null if the inbox is full or none is left. */
function addTicket(inbox: readonly string[], rng: Rng): string[] | null {
  if (inbox.length >= BALANCE.tickets.cap) return null;
  const pool = TICKETS.filter((t) => !inbox.includes(t.id));
  const pick = pool[Math.floor(rng() * pool.length)];
  return pick ? [...inbox, pick.id] : null;
}

/** A new ticket arrives if its time has come and there is room. Call every game second or so. */
export function receiveTicket(state: GameState, rng: Rng): GameState {
  if (state.timeMs < state.nextTicketAtMs) return state;
  const inbox = addTicket(state.inbox, rng);
  if (!inbox) return state;
  const { intervalMs, jitter } = BALANCE.tickets;
  const wait = Math.round(intervalMs * (1 - jitter + rng() * 2 * jitter));
  return { ...state, inbox, nextTicketAtMs: state.timeMs + wait };
}

export interface AnswerResult {
  state: GameState;
  ticket: TicketDef | null;
  choice: TicketChoice | null;
  /** KP granted immediately (lump answers). */
  granted: Decimal;
}

/** The player answers a ticket in the inbox. Invalid ids or choices leave the state unchanged. */
export function answerTicket(state: GameState, ticketId: string, choiceIndex: number): AnswerResult {
  const ticket = getTicket(ticketId);
  const choice = ticket?.choices[choiceIndex];
  if (!ticket || !choice || !state.inbox.includes(ticketId)) {
    return { state, ticket: null, choice: null, granted: new Decimal(0) };
  }
  // A full inbox paused the clock: restart it now rather than refilling the moment a slot frees up.
  const wasFull = state.inbox.length >= BALANCE.tickets.cap;
  const next: GameState = {
    ...state,
    inbox: state.inbox.filter((id) => id !== ticketId),
    ticketsAnswered: state.ticketsAnswered + 1,
    nextTicketAtMs: wasFull ? state.timeMs + BALANCE.tickets.intervalMs : state.nextTicketAtMs,
  };
  const r = applyEffect(next, `ticket:${ticketId}`, choice.effect);
  return { state: r.state, ticket, choice, granted: r.granted };
}

/**
 * Tickets that arrived while the player was away (real time awayMs), at the mean interval, up to the
 * cap. Game time does not advance offline, so the next ticket is scheduled relative to timeMs.
 */
export function refillInboxOffline(state: GameState, awayMs: number, rng: Rng): GameState {
  if (!(awayMs > 0) || !Number.isFinite(awayMs)) return state;
  let inbox: string[] = state.inbox;
  let due = Math.max(0, state.nextTicketAtMs - state.timeMs);
  while (due <= awayMs) {
    const more = addTicket(inbox, rng);
    if (!more) break;
    inbox = more;
    due += BALANCE.tickets.intervalMs;
  }
  if (inbox === state.inbox) return state;
  return { ...state, inbox, nextTicketAtMs: state.timeMs + Math.max(0, due - awayMs) };
}
