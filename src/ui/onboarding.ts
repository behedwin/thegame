// Onboarding: three discreet tips for a brand-new player. The tip logic is pure (state in,
// state out); TipBar only renders the current tip.
import { T } from '../content/texts';
import type { GameState } from '../core/state';
import { h } from './dialogs';

export type TipId = 'event' | 'sync' | 'buy';

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

/** Display priority: a live event is urgent, so it goes first. */
export const TIPS: readonly TipDef[] = [
  { id: 'event', ready: (s) => s.activeEvent !== null, done: (s) => s.eventsClaimed > 0 },
  { id: 'sync', ready: () => true, done: (s) => s.clicks > 0 },
  { id: 'buy', ready: (s) => s.clicks > 0, done: (s) => Object.values(s.automations).some((n) => n > 0) },
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

/** The tip bubble. Styles are inline so the feature lives in one file. */
export class TipBar {
  readonly host = h('div', {
    testId: 'tip',
    attrs: {
      role: 'status',
      'aria-label': T.tips.aria,
      hidden: '',
      style:
        'display:none;align-items:center;gap:8px;margin:8px 0 0;padding:8px 10px 8px 14px;border-radius:12px;' +
        'background:var(--surface2);color:var(--text);font-size:13px;line-height:1.35',
    },
  });
  private readonly text = h('span', { testId: 'tip-text', attrs: { style: 'flex:1' } });
  private readonly off = h('button', {
    testId: 'tip-off',
    text: T.tips.off,
    attrs: { style: 'border:0;background:transparent;color:var(--muted);font-size:12px;text-decoration:underline;padding:6px 4px' },
  });
  private readonly close = h('button', {
    testId: 'tip-close',
    text: '×',
    attrs: { 'aria-label': T.tips.close, style: 'border:0;background:transparent;color:var(--muted);font-size:20px;line-height:1;padding:4px 8px' },
  });
  private readonly next = h('button', {
    testId: 'tip-next',
    attrs: { hidden: '', style: 'border:0;border-radius:8px;background:var(--accent);color:var(--accent-ink);font-size:13px;padding:6px 12px' },
  });
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
    if (key) {
      this.text.textContent = step ? T.tips.tour[step] : T.tips[tip!];
      this.host.dataset.tip = key;
      this.host.hidden = false;
      this.host.style.display = 'flex';
    } else {
      this.host.hidden = true;
      this.host.style.display = 'none';
    }
  }
}
