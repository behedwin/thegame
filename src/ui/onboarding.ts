// Onboarding: a few discreet tips for a brand-new player. The tip logic is pure (state in,
// state out); TipBar only renders the current tip.
import { T } from '../content/texts';
import type { GameState } from '../core/state';
import { h } from './dialogs';

export type TipId = 'event' | 'sync' | 'buy' | 'inbox';

/** "Visa introduktionen igen": a tour through the tips, kept in memory only. It ignores
 * prestiges, done, tipsSeen and the tips setting, so it works for any player. */
export const TOUR = ['sync', 'buy', 'event', 'help'] as const;
export type TourStep = (typeof TOUR)[number];
export const tourNext = (s: TourStep): TourStep | null => TOUR[TOUR.indexOf(s) + 1] ?? null;

interface TipDef {
  id: TipId;
  /** The tip may be shown now. */
  ready: (s: GameState) => boolean;
  /** The player already did what the tip asks. */
  done: (s: GameState) => boolean;
}

/** Display priority: a live event is urgent, so it goes first. Tickets never expire, so they go last. */
export const TIPS: readonly TipDef[] = [
  { id: 'event', ready: (s) => s.activeEvent !== null, done: (s) => s.eventsClaimed > 0 },
  { id: 'sync', ready: () => true, done: (s) => s.clicks > 0 },
  { id: 'buy', ready: (s) => s.clicks > 0, done: (s) => Object.values(s.automations).some((n) => n > 0) },
  { id: 'inbox', ready: (s) => s.inbox.length > 0, done: (s) => s.ticketsAnswered > 0 },
];

/** The tip to show now, or null. Only in the first school year, and never a tip already seen. */
export function nextTip(state: GameState): TipId | null {
  if (!state.settings.tips || state.prestiges > 0) return null;
  for (const t of TIPS) {
    if (state.tipsSeen.includes(t.id) || t.done(state)) continue;
    if (t.ready(state)) return t.id;
  }
  return null;
}

/** Mark a tip as seen so it never shows again. Returns the same state if already seen. */
export function markTipSeen(state: GameState, id: TipId): GameState {
  if (state.tipsSeen.includes(id)) return state;
  return { ...state, tipsSeen: [...state.tipsSeen, id] };
}

/**
 * Advance the onboarding after a state change: a tip that was on screen and is no longer the
 * current one (done, or replaced) counts as seen.
 */
export function settleTips(state: GameState, shown: TipId | null): GameState {
  if (shown === null || nextTip(state) === shown) return state;
  return markTipSeen(state, shown);
}

/** The tip bubble (styles in style.css, `.tip`). */
export class TipBar {
  readonly host = h('div', { class: 'tip', testId: 'tip', attrs: { role: 'status', 'aria-label': T.tips.aria, hidden: '' } });
  private readonly text = h('span', { class: 'tip-text', testId: 'tip-text' });
  private readonly off = h('button', { class: 'tip-off', testId: 'tip-off', text: T.tips.off });
  private readonly close = h('button', { class: 'tip-close', testId: 'tip-close', text: '×', attrs: { 'aria-label': T.tips.close } });
  private readonly next = h('button', { class: 'tip-next', testId: 'tip-next', attrs: { hidden: '' } });
  /** The regular tip on screen, and the tour step on screen. */
  shown: TipId | null = null;
  step: TourStep | null = null;
  /** What each tour step points at. It gets an outline, which never moves the layout. */
  marks: Partial<Record<TourStep, HTMLElement>> = {};

  constructor(onClose: (id: TipId | null) => void, onOff: () => void, onNext: () => void) {
    this.host.append(this.text, this.next, this.off, this.close);
    this.close.addEventListener('click', () => onClose(this.shown));
    this.off.addEventListener('click', onOff);
    this.next.addEventListener('click', onNext);
  }

  render(tip: TipId | null, step: TourStep | null = null): void {
    if (tip === this.shown && step === this.step) return;
    if (this.step) Object.assign(this.marks[this.step]?.style ?? {}, { outline: '', outlineOffset: '' });
    [this.shown, this.step] = [step ? null : tip, step];
    if (step) Object.assign(this.marks[step]?.style ?? {}, { outline: '2px solid var(--accent)', outlineOffset: '4px' });
    this.next.hidden = !step;
    this.off.hidden = !!step;
    this.next.textContent = step === TOUR.at(-1) ? T.tips.done : T.tips.next;
    const key = step ?? tip;
    this.host.hidden = !key;
    if (!key) return;
    this.text.textContent = step ? T.tips.tour[step] : T.tips[tip!];
    this.host.dataset.tip = key;
  }
}
