// Inbox ticket dialog. The choice is applied by the caller (app.ts), which owns the state.
import { senderName } from '../content/registry';
import { T } from '../content/texts';
import { getTicket, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { effectLine } from './effects';

/** The lifetime count of solved tickets, shown in the empty inbox. Null before the first answer. */
export const inboxArchiveLine = (state: GameState): string | null =>
  state.ticketsAnswered > 0 ? T.inbox.archive(state.ticketsAnswered) : null;

/** Empty inbox after the first answer: a small dialog with the archive line instead of a toast. */
function showEmptyInbox(line: string): void {
  showDialog(
    T.inbox.title,
    [h('p', { class: 'muted', text: T.inbox.empty }), h('p', { testId: 'inbox-archive', text: line })],
    [{ label: T.inbox.close, primary: true }],
    'inbox-empty-dialog',
  );
}

/**
 * Show the oldest unanswered ticket. Returns false if the inbox is empty and there is nothing to show
 * (no ticket answered yet); with an answered history the empty inbox shows the archive line instead.
 */
export function showTicket(state: GameState, onAnswer: (ticketId: string, choice: number) => void): boolean {
  const id = state.inbox[0];
  const ticket = id ? getTicket(id) : undefined;
  if (!id || !ticket) {
    const line = inboxArchiveLine(state);
    if (line) showEmptyInbox(line);
    return line !== null;
  }
  showDialog(
    ticket.title,
    [h('p', { class: 'muted', text: T.inbox.from(senderName(ticket.from)) }), h('p', { text: ticket.text }), h('p', { class: 'muted', testId: 'ticket-note', text: T.inbox.note })],
    [
      ...ticket.choices.map((c, i) => ({ label: c.label, testId: `ticket-choice-${i}`, onClick: () => onAnswer(id, i) })),
      { label: T.inbox.later, testId: 'ticket-later' },
    ],
    'ticket-dialog',
  );
  // showDialog renders plain labels: add the effect as a quieter second line on each choice.
  ticket.choices.forEach((c, i) => {
    const btn = document.querySelector(`[data-testid="ticket-choice-${i}"]`);
    btn?.append(h('span', { class: 'effect', testId: 'ticket-effect', text: effectLine(state, c.effect) }));
  });
  return true;
}

/** The inbox button appears with the first ticket and then stays, so the header does not jump around. */
export const inboxButtonVisible = (state: GameState): boolean => state.inbox.length > 0 || state.ticketsAnswered > 0;

export function renderInboxButton(btn: HTMLElement, state: GameState): void {
  const n = state.inbox.length;
  btn.hidden = !inboxButtonVisible(state);
  btn.textContent = T.inbox.label(n);
  btn.setAttribute('aria-label', T.inbox.aria(n));
  btn.classList.toggle('has', n > 0);
}
