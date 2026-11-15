// The tappable random-event card with its countdown bar. The claim itself is the app's job.
import { T } from '../content/texts';
import { getEvent, type GameState } from '../core';
import { h } from './dialogs';
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
    this.el = h(
      'button',
      { class: 'event-card', testId: 'event', attrs: { 'aria-label': `${def.title}. ${T.eventTap}` } },
      h('strong', { text: def.title }),
      h('span', { text: T.eventTap }),
      timer,
    );
    this.el.addEventListener('click', this.claim);
    this.slot.append(this.el);
    sfx.event();
  }
}
