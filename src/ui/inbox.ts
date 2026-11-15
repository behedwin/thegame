// Inbox ticket dialog. The choice is applied by the caller (app.ts), which owns the state.
import { senderName } from '../content/registry';
import { T } from '../content/texts';
import type { EventEffect } from '../content/types';
import { getTicket, kpPerClick, kpPerSecond, previewEffect, type AnswerResult, type EffectPreview, type GameState } from '../core';
import { h, showDialog } from './dialogs';
import { fmt } from './format';

/** The effect itself: "Produktion ×1,5 i 30 s", "KP/klick ×2 i 30 s" or "+1 234 KP". */
export function effectText(p: EffectPreview): string {
  if (p.kind === 'lump') return T.effect.lump(fmt(p.kp));
  return T.effect.buff(p.mult, Math.round(p.durationMs / 1000), p.kind === 'clickMult');
}

/** The line under a choice. Buffs also show roughly what they are worth at today's pace, so they compare with lumps. */
export function effectLine(state: GameState, e: EventEffect): string {
  const p = previewEffect(state, e);
  if (p.kind === 'lump') return T.effect.now(effectText(p));
  const click = p.kind === 'clickMult';
  const rate = click ? T.effect.clicksPerSec : undefined;
  const perSec = click ? kpPerClick(state).mul(T.effect.clicksPerSec) : kpPerSecond(state);
  const worth = perSec.mul(p.mult - 1).mul(p.durationMs / 1000);
  // Nothing to multiply yet (no production): an estimate of +0 would only mislead.
  return worth.gte(1) ? T.effect.worth(effectText(p), fmt(worth), rate) : effectText(p);
}

/** Toast after an answer: the fun outcome, then what actually happened. */
export function receiptText(r: AnswerResult): string {
  if (!r.choice) return '';
  const p: EffectPreview = r.choice.effect.kind === 'lump' ? { kind: 'lump', kp: r.granted } : previewEffect(r.state, r.choice.effect);
  return T.inbox.receipt(r.choice.outcome, effectText(p));
}

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
