// The tappable random-event card with its countdown bar. The claim itself is the app's job.
import { T } from '../content/texts';
import { BALANCE } from '../content/balance';
import { eventEffect, getEvent, type GameState } from '../core';
import { h } from './dialogs';
import { eventCardText } from './effects';
import { sfx } from './feedback';

export class EventCard {
  private el: HTMLElement | null = null;
  readonly slot = h('div', { class: 'event-slot' });

  constructor(private readonly claim: () => void) {}

  render(state: GameState): void {
    const active = state.activeEvent;
    if (!active && this.el) {
      this.el.remove();
      this.el = null;
    }
    const def = active && !this.el ? getEvent(active.id) : undefined;
    if (!active || !def) return;
    const timer = h('div', { class: 'event-timer' });
    timer.style.animationDuration = `${Math.max(0, active.expiresAtMs - state.timeMs)}ms`;
    // The line shows the effect with the streak bonus (069), and the streak itself from BALANCE.events.streak.min.
    const { line, label } = eventCardText(state, { ...def, effect: eventEffect(state, def) });
    const streak = state.eventStreak >= BALANCE.events.streak.min ? T.eventStreak(state.eventStreak) : '';
    this.el = h(
      'button',
      { class: 'event-card', testId: 'event', attrs: { 'aria-label': streak ? `${label} ${streak}.` : label } },
      h('strong', { text: def.title }),
      h('small', { class: 'event-effect', testId: 'event-effect', text: line }),
      ...(streak ? [h('small', { class: 'event-streak', testId: 'event-streak', text: streak })] : []),
      h('span', { text: T.eventTap }),
      timer,
    );
    this.el.addEventListener('click', this.claim);
    this.slot.append(this.el);
    sfx.event();
  }
}
