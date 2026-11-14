// Inbox ticket dialog. The choice is applied by the caller (app.ts), which owns the state.
import { senderName } from '../content/registry';
import { T } from '../content/texts';
import { getTicket, type GameState } from '../core';
import { h, showDialog } from './dialogs';

/** Show the oldest unanswered ticket. Returns false if the inbox is empty. */
export function showTicket(state: GameState, onAnswer: (ticketId: string, choice: number) => void): boolean {
  const id = state.inbox[0];
  const ticket = id ? getTicket(id) : undefined;
  if (!id || !ticket) return false;
  showDialog(
    ticket.title,
    [h('p', { class: 'muted', text: T.inbox.from(senderName(ticket.from)) }), h('p', { text: ticket.text })],
    [
      ...ticket.choices.map((c, i) => ({ label: c.label, testId: `ticket-choice-${i}`, onClick: () => onAnswer(id, i) })),
      { label: T.inbox.later, testId: 'ticket-later' },
    ],
    'ticket-dialog',
  );
  return true;
}
