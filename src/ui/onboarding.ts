// Onboarding: three discreet tips for a brand-new player. The tip logic is pure (state in,
// state out); TipBar only renders the current tip.
import { T } from '../content/texts';
import type { GameState } from '../core/state';
import { h } from './dialogs';

export type TipId = 'event' | 'sync' | 'buy';

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
  /** The tip currently on screen. */
  shown: TipId | null = null;

  constructor(onClose: (id: TipId) => void, onOff: () => void) {
    this.host.append(this.text, this.off, this.close);
    this.close.addEventListener('click', () => {
      if (this.shown) onClose(this.shown);
    });
    this.off.addEventListener('click', onOff);
  }

  render(tip: TipId | null): void {
    if (tip === this.shown) return;
    this.shown = tip;
    if (tip) {
      this.text.textContent = T.tips[tip];
      this.host.dataset.tip = tip;
      this.host.hidden = false;
      this.host.style.display = 'flex';
    } else {
      this.host.hidden = true;
      this.host.style.display = 'none';
    }
  }
}
